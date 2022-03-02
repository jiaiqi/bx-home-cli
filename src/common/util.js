import store from '@/store'
import api from '@/common/api.js'
import _http from '@/common/http.js'
const mpAppNo = api.appNo.wxmp
// import dayjs from '@/static/js/dayjs.min.js'
const dayjs = require('dayjs');
import uDebounce from '@/common/utils/debounce.js'
import {
  mapState
} from 'vuex'
import {
  checkIsAttention,
  wxVerifyLogin,
  selectPersonInfo
} from '@/common/api/login.js'
export default {
  install(Vue, options) {

    Vue.prototype.dayjs = dayjs
    Vue.prototype.$uDebounce = uDebounce
    Vue.prototype.pageTitle = '加载中…' // 可以自定义变量

    // 混入
    Vue.mixin({
      computed: {
        ...mapState({
          isAttention: state => state.app.subscsribeStatus, //是否关注公众号
          userInfo: state => state.user.userInfo,
          storeInfo: state => state.app.storeInfo,
          vcart: state => state.order.cartInfo,
          vstoreUser: state => state.user.storeUserInfo,
          vloginUser: state => state.user.loginUserInfo,
          scene: state => state.app.scene,
          hasNotRegInfo: state => state.app.hasNotRegInfo, //授权访问用户信息
          isLogin: state => state.app.isLogin
        }),
        $api() {
          return api
        },
      },
      methods: {
        getwxMchId() {
          // 获取商户号
          return this.storeInfo?.wx_mch_id || '1485038452'
        },
      }
    })

    // 初始化查询
    Vue.prototype.selectRequestObjs = function(srv, cond, order) { // 给自定义方法起个名
      let selectRequestObj = {}
      selectRequestObj['serviceName'] = ''
      selectRequestObj['colNames'] = ['*']
      selectRequestObj['condition'] = []
      if (srv) {
        selectRequestObj['serviceName'] = srv
      }
      if (cond) {
        selectRequestObj['condition'] = cond
      }
      if (order) {
        selectRequestObj['order'] = order
      }
      return selectRequestObj
    }
    /**
     * @param {String} srv - 服务名(serviceName)
     * @param {String} srvType 
     * @param {String} pageType  // use_type 取值
     * @param {String} app 
     */
    Vue.prototype.getServiceV2 = async function(srv, srvType, pageType, app) {
      // 表单信息 srvType : add | update | list | detail | select
      // use_type: detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update
      let self = this
      let appName = app || uni.getStorageSync("activeApp")
      if (srv && srvType && pageType) {
        let len = srv.lastIndexOf('_')
        let serviceName = srv.slice(0, len) + '_'
        let lastName = srv.slice(len + 1)
        if (srvType === 'list' || srvType === 'detail') {
          serviceName += 'select'
        } else {
          if (['add', 'update', 'select', 'delete'].indexOf(lastName)) {
            serviceName += srvType
          } else {
            serviceName += `${lastName}`
          }
        }
        let cols = self.$store.getters.srvCol ? self.$store.getters.srvCol : []
        // let cols = self.$store.getters.getSrvCol ? self.$store.getters.getSrvCol : []

        let nCols = cols.filter(item => item.service_name === serviceName && item.use_type === pageType)
        console.log('=====1', nCols)
        if (nCols.length === 0) {
          let req = this.selectRequestObjs()
          req.serviceName = 'srvsys_service_columnex_v2_select'
          req.colNames = ['*']
          req.condition = []
          let condObj = {}
          condObj['colName'] = 'service_name'
          condObj['ruleType'] = 'eq'
          condObj['value'] = serviceName
          req.condition[0] = JSON.parse(JSON.stringify(condObj))
          condObj['colName'] = 'use_type'
          condObj['ruleType'] = 'eq'
          condObj['value'] = pageType
          req.condition[1] = JSON.parse(JSON.stringify(condObj))
          req.order = [{}]
          req.order[0]['colName'] = 'seq'
          req.order[0]['orderType'] = 'asc'
          let url = Vue.prototype.getServiceUrl(appName, "srvsys_service_columnex_v2_select",
            "select", url)
          url = url + "?colsel_v2=" + serviceName
          const response = await _http.post(url, req)
          if (response.data.data) {
            console.log('=====2', response.data.data)
            response.data.data.use_type = pageType
            // if ('rowButton' in response.data.data) {
            // response.data.data._footerBtns = this.getFooterBtns(response.data.data.rowButton)
            // }
            // 第一次拿到，缓存
            let pageconfig = Vue.prototype.getPageConfig(response.data.data, pageType)
            if (pageconfig?.more_config && typeof pageconfig.more_config === 'string') {
              try {
                pageconfig.moreConfig = JSON.parse(pageconfig.more_config)
              } catch (err) {

              }

            }
            // self.$store.dispatch('setSrvCol', pageconfig)
            return pageconfig
          }
        } else {
          console.log('=====3', nCols)
          return nCols[0]
        }
      } else {
        return false
      }
    }
    /**
     * @param {String} v2res  V2 请求原始数据
     */
    Vue.prototype.getPageConfig = function(v2res, useType) {
      let pageConfigs = v2res || false
      if (pageConfigs) {
        pageConfigs["_fieldInfo"] = Vue.prototype.getFieldInfo(v2res.srv_cols, useType)
        if (useType === 'list') {
          pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton)
        }
        if (useType === 'treelist') {
          pageConfigs["_rowButtons"] = Vue.prototype.getButtonInfo(v2res.rowButton, useType)
          pageConfigs["_handerButtons"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
        } else if (useType === 'update' || useType === 'add' || useType === 'detail') {
          pageConfigs["_formButtons"] = Vue.prototype.getButtonInfo(v2res.formButton, useType)
        }
        console.log("pageConfigs", pageConfigs)
        return pageConfigs
      } else {
        return false
      }
    }
    /** 封装 field 的配置信息
     * @param {String} srvCol  cols 数组
     * @param {String} useType userType,页面类型
     */
    Vue.prototype.getFieldInfo = function(srvCol, useType) {
      let cols = srvCol
      let fieldInfo = {}
      switch (useType) {
        // 统一根据页面类型 过滤字段显示 === 2 暂不支持
        case "add":
          cols = cols.filter((item, index) => {
            // if (item.in_add !== 0) {
            if (item.in_add === 1 || item.in_add === 2) {
              if (item.in_add == 2) {
                item.x_if = null
              }
              return item
            }
          })
          break;
        case "update":
          cols = cols.filter((item, index) => {
            if (item.in_update === 1 || item.in_update === 2) {
              if (item.in_update == 2) {
                item.x_if = null
              }
              return item
            }
          })
          break;
        case "detail":
          cols = cols.filter((item, index) => {
            // if (item.in_detail !== 0) {
            if (item.in_detail === 1 || item.in_detail === 2) {
              return item
            }
          })
          break;
        default:
          break;
      }
      cols = cols.map((item, index) => {
        fieldInfo = {
          column: "",
          label: "",
          defaultValue: null,
          isRequire: null,
          type: null,
          moreConfig: {},
          max: null,
          min: null
        }
        fieldInfo = {
          ...fieldInfo,
          ...item
        }
        if (item.more_config && typeof item.more_config === 'string') {
          try {
            fieldInfo.moreConfig = JSON.parse(item.more_config)
            if (fieldInfo.moreConfig.max && typeof fieldInfo.moreConfig.max === 'number') {
              fieldInfo.max = fieldInfo.moreConfig.max
            }
            if (typeof fieldInfo.moreConfig.min === 'number') {
              fieldInfo.min = fieldInfo.moreConfig.min
            }

          } catch (e) {
            //TODO handle the exception
          }
        }
        fieldInfo.column = item.columns
        fieldInfo.id = item.id
        fieldInfo.label = item.label
        fieldInfo.seq = item.seq
        if (item.init_expr) {
          item.init_expr = item.init_expr.replace(/\'|\"/g, '')
          let data = {
            room_no: getApp().globalData?.room_no,
            bindUserInfo: store?.state?.user?.storeUserInfo,
            userInfo: store?.state?.user?.userInfo,
            storeInfo: store?.state.app.storeInfo
          }
          item.init_expr = Vue.prototype.renderStr(item.init_expr, data)
          if (item.init_expr && item.init_expr.indexOf('top.user.user_no') !== -1) {
            let login_user_info = uni.getStorageSync('login_user_info')
            item.init_expr = login_user_info?.user_no || '';
          }
          if (item.init_expr && item.init_expr.indexOf('new Date()') !== -1) {
            if (item.col_type === 'Date') {
              item.init_expr = dayjs().format('YYYY-MM-DD')
            } else if (item.col_type === 'Time') {
              item.init_expr = dayjs().format('HH:mm')
            } else {
              item.init_expr = dayjs().format('YYYY-MM-DD HH:mm')
            }
          }
          if (item.init_expr && item.init_expr.indexOf('globalData.') !== -1) {
            let globalData = getApp().globalData
            let colName = item.init_expr.slice(item.init_expr.indexOf('globalData.') + 11);
            if (globalData && globalData[colName]) {
              item.init_expr = globalData[colName] || '';
            } else {
              item.init_expr = ''
            }
          }
          fieldInfo.defaultValue = item.init_expr
          fieldInfo.value = item.init_expr

        }
        fieldInfo.option_list_v2 = item.option_list_v2
        fieldInfo.bx_col_type = item.bx_col_type
        fieldInfo.redundant = item.redundant
        fieldInfo.col_type = item.col_type
        fieldInfo.section = item.section
        fieldInfo.validators = item.validators
        // col_type 转换 表单组件 type 
        if (item.col_type === "String" || item.col_type === "TelNo") {
          fieldInfo.type = "text"
        } else if (item.col_type === "DateTime") {
          fieldInfo.type = "dateTime"
          if (fieldInfo?.moreConfig?.min && fieldInfo.moreConfig.min.indexOf('new Date()') !== -
            1) {
            // min-date
            fieldInfo.min = dayjs().format('YYYY-MM-DD HH:mm')
          }
        } else if (item.col_type === "Date") {
          fieldInfo.type = "date"
          if (fieldInfo?.moreConfig?.min && fieldInfo.moreConfig.min.indexOf('new Date()') !== -
            1) {
            // min-date
            fieldInfo.min = dayjs().format("YYYY-MM-DD")
          }
        } else if (item.col_type === "Time") {
          fieldInfo.type = "time"
        } else if (item.col_type === "FileList") {
          fieldInfo.type = "file"
          // #ifdef MP-WEIXIN
          fieldInfo.type = "images"
          // #endif
          fieldInfo.srvInfo = {
            tableName: item.table_name,
            appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
              .table_name.indexOf("_"))
          }
        } else if (item.col_type === "Image") {
          // } else if (item.col_type === "Image" || item.col_type === "FileList") {
          fieldInfo.type = "images"
          fieldInfo.srvInfo = {
            tableName: item.table_name,
            appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
              .table_name.indexOf("_"))
          }
        } else if (item.col_type === "Set") {
          // fieldInfo.type = "radioFk"
          fieldInfo.type = "Set"
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "bxsys_obj_type_gps" && item.bx_col_type === "fk") {
          // fieldInfo.type = "radioFk"
          fieldInfo.type = "location"
          fieldInfo.option_list_v2 = item.option_list_v2
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "Enum" || item.col_type === "Dict") {
          // fieldInfo.type = "radioFk"
          fieldInfo.type = "Selector"
          fieldInfo.showSearch = false
          fieldInfo.option_list_v2 = item.option_list_v2
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "MultilineText" || item.col_type === 'longtext' || item
          .col_type ===
          'Json') {
          fieldInfo.type = "textarea"
        } else if (item.col_type === 'snote' || item.col_type === 'Note') {
          fieldInfo.type = "RichText"
        } else if (item.col_type === "Money" || item.col_type === "Float") {
          fieldInfo.type = "digit"
        } else if (item.col_type === "Integer" || item.col_type === "int") {
          fieldInfo.type = "number"
        } else if (item.bx_col_type === "fk" && item.col_type !== "User") {
          fieldInfo.type = "Selector"
          if (item.option_list_v2 && item.option_list_v2.is_tree === true) {
            fieldInfo.type = "TreeSelector"
            fieldInfo.srvInfo = item.option_list_v2
            fieldInfo.srvInfo.isTree = item.option_list_v2.is_tree
          }
        } else if (item.col_type === "User") {
          fieldInfo.type = "Selector"
          fieldInfo.option_list_v2 = {
            "refed_col": "user_no",
            "srv_app": "sso",
            "serviceName": "srvsso_user_select",
            "key_disp_col": "user_disp"
          }
        } else if (fieldInfo.type === 'id_card') {
          fieldInfo.type = 'idCardPicture'
          fieldInfo.buttons = [{
            name: '拍照',
            type: 'car_no'
          }]
        } else if (fieldInfo.type === 'addr') {
          // fieldInfo.type = 'location'
        } else if (item.bx_col_type === "string" && item.col_type === "fk") {
          fieldInfo.type = "Selector"
        } else if (item.bx_col_type === "string") {
          fieldInfo.type = "text"
        } else {
          fieldInfo.type = item.col_type
        }
        switch (useType) {
          case "cond":
            fieldInfo.showExp = (item.in_cond === 1)
            fieldInfo.display = (item.in_cond === 1)
            fieldInfo.in_cond = item.in_cond
            break;
          case "add":
            fieldInfo.showExp = (item.in_add === 1)
            fieldInfo.display = (item.in_add === 1)
            fieldInfo.in_add = item.in_add
            break;
          case "update":
            fieldInfo.showExp = (item.in_update === 1)
            fieldInfo.display = (item.in_update === 1)
            fieldInfo.in_update = item.in_update
            break;
          case "list":
            fieldInfo.showExp = (item.in_list === 1)
            fieldInfo.display = (item.in_list === 1)
            break;
          case "detail":
            fieldInfo.showExp = (item.in_detail === 1)
            fieldInfo.display = (item.in_detail === 1)
            break;
          case "proclist":
            fieldInfo.showExp = (item.in_list === 1)
            fieldInfo.display = (item.in_list === 1)
            break;
          case "cond":
            break;
          default:
            break;
        }
        // 处理字段统一属性
        fieldInfo.disabled = item.updatable === 0 ? true : false, //字段是否冻结
          fieldInfo._validators = Vue.prototype.getValidators(item.validators, item
            .validators_message)
        fieldInfo.isRequire = fieldInfo._validators.required
        fieldInfo.value = fieldInfo.value ?? null // 初始化value
        // if(fieldInfo.type === 'digit' || fieldInfo.type === 'number' ){
        //   fieldInfo.value = fieldInfo.value || 0
        // }
        fieldInfo.in_cond = item.in_cond
        fieldInfo.x_if = item.x_if
        fieldInfo.xif_trigger_col = item.xif_trigger_col
        fieldInfo._colDatas = item //保存原始data
        return fieldInfo
      })
      return cols
    }
    /** 封装按钮的配置信息
     * @param {String} buttons  按钮数据
     * 
     */
    Vue.prototype.getButtonInfo = function(buttons, pageType) {
      let cols = buttons
      let buttonInfo = {}
      cols = cols.filter((item, index) => {
        switch (pageType) {
          case "treelist":
            if ((item.button_type === "addchild" || item.button_type === "edit" || item
                .button_type === "delete" ||
                item.button_type === "add") && item.permission) {
              return item
            }
            break;
          case "list":
            if ((item.button_type === "addchild" || item.button_type === "edit" || item
                .button_type === "delete" ||
                item.button_type === "add") && item.permission) {
              return item
            }
            break;
          case "add":
            if ((item.button_type === "submit") && item
              // if ((item.button_type === "reset" || item.button_type === "submit") && item
              .permission) {
              return item
            }
            break;
          case "update":
            if ((item.button_type === "edit") && item
              // if ((item.button_type === "reset" || item.button_type === "edit") && item
              .permission) {
              return item
            }
            break;
          case "detail":
            if ((item.button_type === "customize" || item.button_type === "edit") && item
              .permission) {
              if (item.operate_params && typeof item.operate_params === 'string') {
                try {
                  item.operate_params = JSON.parse(item.operate_params)
                } catch (e) {
                  console.log(e)
                  //TODO handle the exception
                }
              }
              return item
            }
            break;
          default:
            break;
        }
      })
      return cols
    }
    /**
     * 树形数据封装
     */
    Vue.prototype.treeReform = function(e, pidcol, idcol) {
      // 
      let data = Vue.prototype.deepClone(e)
      let to1Data = e.filter((item, index) => {
        // console.log(item.menu_name,item[pidcol])
        return item[pidcol] === null || item[pidcol] === ""
      })
      let to2Data = e.filter((item, index) => {
        return item[pidcol] !== null || item[pidcol] === ""
      })
      let reform = function(allData, pd, id, data) {
        // 根据顶级节点组装数有子节点
        let datas = Vue.prototype.deepClone(data) // 当前级别
        let aDatas = Vue.prototype.deepClone(allData) // 剩余data
        for (let i = 0; i < datas.length; i++) {
          let child = []
          for (let j = 0; j < aDatas.length; j++) {
            // console.log("slice==="+j,datas[i][id],aDatas[j][pd])
            if (datas[i][id] === aDatas[j][pd]) {
              child.push(aDatas[j])
              aDatas.slice(j, 1)
            }
          }
          if (child.length > 0) {
            datas[i]["_childNode"] = reform(aDatas, pd, id, child)
          } else {
            datas[i]["_childNode"] = child
          }
        }
        return datas
      }
      to1Data = reform(to2Data, pidcol, idcol, to1Data)
      return to1Data
    }
    /**
     * 普通请求方法封装
     * @param {String} optionType -操作类型(select||operate||add...)
     * @param {String} srv -服务名 serviceName
     * @param {Object} req -请求参数
     * @param {String} app 
     */
    Vue.prototype.onRequest = async function(optionType, srv, req, app) {
      let self = this
      let reqType = optionType
      if (optionType === "add" || optionType === "update") {
        reqType = 'operate'
        // reqType = optionType
      }
      let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, reqType)
      return _http.post(url, req)
    }
    /**
     * 普通请求方法封装2
     * @param {String} optionType -操作类型(select||operate||add...)
     * @param {String} srv -服务名 serviceName
     * @param {Object} req -请求参数
     * @param {String} app 
     */
    Vue.prototype.$fetch = async function(optionType, srv, req, app) {
      if (!req.colNames) {
        req.colNames = ['*']
      }
      if (!req.serviceName) {
        req.serviceName = srv
      }
      if (!req.page) {
        req.page = {
          pageNo: 1,
          rownumber: 10
        }
      }
      let reqType = optionType
      if (optionType === "add" || optionType === "update") {
        reqType = optionType
      } else if (optionType === "select") {

      }
      let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, optionType)
      let res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS') {
        // select
        if (optionType === "select") {
          return {
            success: true,
            page: res.data.page,
            data: res.data.data
          }
        } else if (optionType === "multi") {
          if (Array.isArray(res.data.data)) {
            return {
              success: true,
              data: res.data.data
            }
          }
        } else {
          // update|add|delete
          if (
            Array.isArray(res.data.response) &&
            res.data.response.length > 0 &&
            res.data.response[0].response &&
            Array.isArray(res.data.response[0].response.effect_data) &&
            res.data.response[0].response.effect_data.length > 0
          ) {
            let result = {
              success: true,
              data: res.data.response[0].response.effect_data
            }
            if (Array.isArray(res.data.response) &&
              res.data.response.length > 0 &&
              res.data.response[0].response &&
              Array.isArray(res.data.response[0].child_data_list) && res.data.response[0]
              .child_data_list.length > 0) {
              let child_data_list = res.data.response[0].child_data_list[0]?.response
                ?.effect_data;
              result.childData = child_data_list || []
            }
            return result
          } else if (Array.isArray(res.data.response) &&
            res.data.response.length > 0 &&
            res.data.response[0].response) {
            return {
              success: true,
              data: res.data.response[0].response
            }
          }
        }
      } else {
        let result = {
          success: false,
          state: res.data.state,
        }
        if (res.data.resultCode) {
          result.code = res.data.resultCode
        }
        if (res.data.resultMessage) {
          result.msg = res.data.resultMessage
          result.resultMessage = res.data.resultMessage
        }
        if (res.data.serviceInfo) {
          result.info = res.data.serviceInfo
        }
        return result
      }
    }

    // -------------------公共方法-------------------------------
    /**
     * @param {String} app 
     * @param {String} srv - 服务名(serviceName)
     * @param {String} srvType 
     * @param {String} url - 协议+ip+端口
     */
    Vue.prototype.getServiceUrl = function(app, srv, srvType, url) {
        // 获取转换URL app, srv, srvType, url
        let singleApp = api.singleApp

        let urlVal = url || api.srvHost
        let appVal = app
        if (singleApp) {
          appVal = api.appName

        } else {
          appVal = uni.getStorageSync('activeApp')
        }
        if (app) {
          appVal = app
        }
        let srvTypeVal = srvType
        let srvVal = srv
        console.log("url:", urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal)
        return urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal
      },

      /**
       * 封装配置的校验信息
       *  @param {String} vds - col 配置的 validators
       *  @param {String} msg - col 配置的 validators_message
       */
      Vue.prototype.getValidators = function(vds, msg) { // 获取校验信息返回组件data
        if (vds !== null && msg !== null) {
          let str = vds
          console.log('vds', vds)
          let getStr = function(val, state, end) {
            if (val.length > state.length + end.length) {
              let s = val.indexOf(state)
              if (s === -1) {
                return ''
              } else {
                let nval = val.slice(s + state.length, val.length)
                let e = nval.indexOf(end)
                let str = nval.slice(0, e)
                if (e === -1) {
                  str = nval.slice(0)
                }
                return str
              }
            } else {
              return ''
            }
          }
          let Validators = {}
          let reg = /required/gi
          Validators['max'] = getStr(str, 'ngMaxlength=', ';').length > 0 ? parseInt(getStr(str,
              'ngMaxlength=', ';')) :
            null
          Validators['min'] = getStr(str, 'ngMinlength=', ';').length > 0 ? parseInt(getStr(str,
              'ngMinlength=', ';')) :
            null
          Validators['reg'] = getStr(str, 'ngPattern=', ';')
          Validators['required'] = reg.test(str)
          Validators['msg'] = getStr(msg, 'ngPattern=', ';')
          Validators['isType'] = function(e) {
            let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
            if (reg.test(e)) {
              let obj = {
                valid: reg.test(e),
                msg: "有效"
              }
              return obj
            } else {
              let msgs = getStr(msg, 'ngPattern=', ';')
              msgs = msgs === '' ? '信息有误' : msgs
              let obj = {
                valid: reg.test(e),
                msg: msgs
              }
              return obj
            }
          }
          return Validators
        } else if (vds && !msg) {
          let reg = /required/gi
          let Validators = {}
          Validators['required'] = reg.test(vds)
          return Validators
        } else {
          return false
        }
      }
    Vue.prototype.deepClone = function(obj) {
      // 深拷贝
      function isObject(o) {
        return (typeof o === 'object' || typeof o === 'function') && o !== null
      }
      if (!isObject(obj)) {
        // throw new Error('非对象')
        console.log("非对象")
        return
      }
      let isArray = Array.isArray(obj)
      let newObj = isArray ? [...obj] : {
        ...obj
      }
      Reflect.ownKeys(newObj).forEach(key => {
        newObj[key] = isObject(obj[key]) ? Vue.prototype.deepClone(obj[key]) : obj[key]
      })
      return newObj
    }
    Vue.prototype.toPreviewImage = (urls, current = 0) => {
      if (!urls) {
        return;
      }
      if (typeof urls === 'string') {
        urls = [urls];
      }
      urls = urls.map(url => {
        //若图片地址携带压缩图参数则预览时去掉此参数
        return url.replace(/&thumbnailType=fwsu_100/gi, '');
      });
      uni.previewImage({
        urls,
        current,
        longPressActions: {
          itemList: ['发送给朋友', '保存图片', '收藏'],
          success: function(data) {
            console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
          }
        }
      });
    }
    Vue.prototype.toPreviousPage = function() {
      uni.navigateBack({
        animationDuration: 2000,
        animationType: 'zoom-fade-in',
        delta: 1
      });
    }
    Vue.prototype.getLocalDay = (date, isLocal = true) => {
      // 日期对应周几
      date = new Date(date || null)
      if (isLocal) {
        const options = {
          weekday: 'long'
        };
        return new Intl.DateTimeFormat('zh-cn', options).format(date)
      } else {
        return date.getDay()
      }

    }
    Vue.prototype.getDayOfWeek = (date) => {
      if (!date) {
        date = new Date()
      } else {
        date = new Date(date)
      }
      let arr = ["日", "一", "二", "三", "四", "五", "六"]
      let day = date.getDay()
      return `周${arr[day]}`
    }
    Vue.prototype.formateTime = (date, returnNull, formate) => {
      // TODO 上午下午 昨天前天 
      if (!date) {
        if (returnNull) {
          return ''
        }
        date = new Date()
      } else {
        date = new Date(date)
      }
      let curDate = new Date()
      if (Vue.prototype.formateDate(date) === Vue.prototype.formateDate(curDate)) {
        // 当天
        return Vue.prototype.formateDate(date, 'dateTime')
      } else if (formate && formate === 'full') {
        return Vue.prototype.formateDate(date, 'MM-DD') + ' ' + Vue.prototype.formateDate(date, 'hh:mm')
      } else {
        return Vue.prototype.formateDate(date, 'MM-DD')
      }
    }

    Vue.prototype.formateDate = function(date, type = 'date') {
      if (!date) {
        date = new Date()
      } else {
        date = new Date(date)
      }
      let today = new Date()
      let todayInfo = {
        'yy': today.getFullYear(),
        'MM': (() => {
          let MM = today.getMonth() + 1
          if (MM < 10) {
            MM = '0' + MM
          }
          return MM
        })(),
        'dd': today.getDate() < 10 ? '0' + today.getDate() : today.getDate(),
        'HH': today.getHours() < 10 ? '0' + today.getHours() : today.getHours(),
        'mm': (() => {
          let mm = today.getMinutes()
          if (mm < 10) {
            mm = '0' + mm
          }
          return mm
        })(),
        'ss': today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds()
      }
      let o = {
        'yy': date.getFullYear(),
        'MM': (() => {
          let MM = date.getMonth() + 1
          if (MM < 10) {
            MM = '0' + MM
          }
          return MM
        })(),
        'dd': date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        'HH': date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        'mm': (() => {
          let mm = date.getMinutes()
          if (mm < 10) {
            mm = '0' + mm
          }
          return mm
        })(),
        'ss': date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
      };
      if (type === 'date' || type === 'YYYY-MM-DD') {
        return o.yy + '-' + o.MM + '-' + o.dd
      } else if (type === 'YY-MM') {
        return o.yy + '-' + o.MM
      } else if (type === 'MM-DD') {
        return o.MM + '-' + o.dd
      } else if (type === 'dateTime' || type === 'hh:mm') {
        return o.HH + ':' + o.mm
      } else if (type === 'time' || type === 'hh:mm:ss') {
        return o.HH + ':' + o.mm + ':' + o.ss
      } else if (type === 'normal') {
        if (o.MM === todayInfo.MM && o.dd === todayInfo.dd) {
          if (o.HH >= 0 && o.HH < 5) {
            return '凌晨 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 5 && o.HH < 7) {
            return '早上 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 7 && o.HH < 11) {
            return '上午 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 11 && o.HH < 14) {
            return '中午 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 14 && o.HH < 18) {
            return '下午 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 18 && o.HH < 22) {
            return '晚上 ' + o.HH + ':' + o.mm;
          } else if (o.HH >= 22 && o.HH <= 24) {
            return '深夜 ' + o.HH + ':' + o.mm;
          }
        }
        return o.MM + '-' + o.dd + ' ' + o.HH + ':' + o.mm;
      } else if (type === 'h') {
        return o.HH;
      } else {
        return o.yy + '-' + o.MM + '-' + o.dd + ' ' + o.HH + ':' + o.mm + ':' + o.ss;
      }
    };
    // -------------------- 微信相关 -----------------
    /**
     *  判断是否当前环境是微信
     *  @return {boolean} true||false
     */
    Vue.prototype.isWeixinClient = function() {
      // #ifdef H5
      let ua = navigator.userAgent.toLowerCase()
      // 微信公众号环境
      let isWeixin = ua.indexOf('micromessenger') !== -1
      if (isWeixin) {
        return true
      } else {
        return false
      }
      // #endif
      // #ifdef MP-WEIXIN
      // 微信小程序环境
      return true
      // #endif
    };
    Vue.prototype.wxLogin = async function(obj = {}) {
      // 使用code向后端发送登录请求
      let {
        code,
        user
      } = obj;
      if (!code) {
        return
      }
      let url = api.verifyLogin.url;
      let req = [{
        data: [{
          code: code,
          app_no: api.appNo.wxmp
        }],
        serviceName: 'srvwx_app_login_verify'
      }];
      let res = await _http.post(url, req);
      if (res.data.resultCode === 'SUCCESS') {
        // 登录成功
        uni.setStorageSync('isLogin', true);
        store.commit('SET_LOGIN_STATE', true)
        let resData = res.data.response[0].response;
        if (resData && resData.login_user_info.user_no) {
          uni.setStorageSync('login_user_info', resData.login_user_info);
          store.commit('SET_LOGIN_USER', resData.login_user_info)
        }
        uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
        store.commit('SET_TICKET', resData.bx_auth_ticket)
        if (resData.login_user_info.data) {
          uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
        }
      } else {
        // 登录失败，显示提示信息
        uni.showToast({
          title: res.data.resultMessage
        });
        store.commit('SET_LOGIN_STATE', false)
        return false;
      }
    }
    // 表单
    Vue.prototype.getCoulmnConfig = function(e) {
      let cnCol = {
        // "activity_no": "20200208002600000007",
        // "item_no":"000001",
        "item_seq": 1,
        "item_title": e.item_title,
        "item_type": e.item_type,
        "is_require": e.is_require,
        // "column":e.column,
        "item_type_attr": {},
        "is_public": "否",
        "show_cfg": "",
        points: e.points,
        option_img_explain: e.option_img_explain,
        ref_type: e.ref_type,
        srv_app: e.srv_app,
        serviceName: e.serviceName,
        refed_col: e.refed_col,
        key_disp_col: e.key_disp_col,
      }
      switch (e.item_type) {
        case "文本":
          cnCol.item_type_attr['view_model'] = e.view_model
          cnCol.item_type_attr['max_len'] = e.max_len
          break;
        case "选项":
          cnCol.item_type_attr['radioType'] = e.option_type === '单选' ? 'single' : e.option_type === '多选' ?
            'multi' : '',
            console.log(cnCol.item_type_attr['radioType'])
          break;
        case "时间日期":
          cnCol.item_type_attr['dateType'] = e.format
          break;
        case "数字":
          cnCol.item_type_attr['numberType'] = e.decimal_places
          cnCol.item_type_attr['max'] = e.max
          cnCol.item_type_attr['min'] = e.min
          break;
        case "图片":
          cnCol.item_type_attr['fileNum'] = e.max_num
          break;
        case "地址":
          break;
        case "引用":
          cnCol.item_type_attr['ref_type'] = e.ref_type
          cnCol.item_type_attr['srv_app'] = e.srv_app
          cnCol.item_type_attr['serviceName'] = e.serviceName
          cnCol.item_type_attr['refed_col'] = e.refed_col
          cnCol.item_type_attr['key_disp_col'] = e.key_disp_col
          cnCol.item_type_attr['option_list_v2'] = e.option_list_v2
          break;
        default:
          ''
      }
      cnCol.item_type_attr = JSON.stringify(cnCol.item_type_attr)
      // cnCol.show_cfg = JSON.stringify(cnCol.show_cfg)
      cnCol.option_data = JSON.stringify(cnCol.option_data)
      return cnCol
    }
    /**
     * QUsHE inputs inputsArray 数据构造
     * 
     * */
    Vue.prototype.getInputsArray = function(e) {
      let viewCfg = e

      let inputTemp = function() {
        let a = {
          type: "", //input textarea pics  radio checkbox picker-date（picker-dateTime| String| 日期加时间| | picker-date| String| 日期| | picker-time| String| 时间|） picker-city text  infinitePics
          title: "名称", //
          inputType: "", // text number
          maxlength: "", // 最大长度
          // ignore:false,// 是否为空
          defaultValue: "", // 默认值
          itemArray: [], // 选项值和名称 name value
          column: "",
        }
        return a
      }
      let inputsDatas = viewCfg.map((item, index) => {
        let inputData = inputTemp()
        inputData.title = item.item_title
        inputData.column = item.column
        inputData.no = item.item_no
        inputData.width = "100"
        switch (item.item_type) {
          case "string":
            if (item.item_type_attr.hasOwnProperty("view_model")) {
              if (item.item_type_attr.view_model === "单行") {
                inputData.type = "input"
                return inputData
              } else if (item.item_type_attr.view_model === "多行") {
                inputData.type = "textarea"
                return inputData
              }
            } else {
              inputData.type = "input"

              return inputData
            }
            break;
          case "checkbox":
            if (item.item_type_attr.hasOwnProperty("option_type")) {

              if (item.item_type_attr.option_type === "单选") {
                inputData.type = "radio"
                inputData.itemArray = item.option_data.map((item, index) => {
                  let a = {
                    name: item.option_value,
                    value: item.option_no
                  }
                  return a
                })
                return inputData
              } else if (item.item_type_attr.option_type === "多选") {
                inputData.type = "checkbox"
                inputData.itemArray = item.option_data.map((item, index) => {
                  let a = {
                    name: item.option_value,
                    value: item.option_no
                  }
                  return a
                })
                return inputData
              }
            }
            break;
          case "date":
            inputData.type = "picker-date"
            if (item.item_type_attr.hasOwnProperty("format")) {
              if (item.item_type_attr.format === 'date') {
                inputData.mode = "picker-date"
              } else if (item.item_type_attr.format === 'time') {
                inputData.mode = "picker-time"
              } else if (item.item_type_attr.format === 'datetime') {
                inputData.mode = "picker-datetime"
              }
            }
            return inputData
            break;
          case "number":
            inputData.type = "input"
            inputData.inputType = "number"
            if (item.item_type_attr.hasOwnProperty("decimal_places")) {
              if (item.item_type_attr.decimal_places === "decimal") {
                inputData.verifyType = "Number"
                inputData.filterType = "twoDecimalPlaces"
              } else if (item.item_type_attr.decimal_places === "Int") {
                inputData.verifyType = "Int"
              }
            }
            return inputData
            break;
          case "image":
            if (item.item_type_attr.hasOwnProperty("max_num")) {
              inputData.type = "infinitePics"
              inputData.max = item.item_type_attr.max_num
              return inputData
            }
            break;
          default:
            return inputData
        }
      })
      return inputsDatas
    }
    // eval 替代方案
    Vue.prototype.evalInTo = function(e, q) {
        let item = q
        let exp = e.isShowExp
        let showExp = false
        let isShowNum = 0
        if (exp && exp.length > 0) {

          for (let i = 0; i < exp.length; i++) {
            if (exp[i].type === 'eq') {
              if (item[exp[i].column] === exp[i].value) {
                isShowNum++
              }
            } else if (exp[i].type === 'neq') {
              if (item[exp[i].column] !== exp[i].value) {
                isShowNum++
              }
            }
          }
          return exp.length === isShowNum
        } else {
          return true
        }
      },
      /**
       * 是否显示item
       * @param {Object} e 
       * @param {Object} q 
       */
      Vue.prototype.colItemShowExps = function(e, q) {
        let data = e
        let obj = q
        let exp = e.isShowExp
        let showExp = false
        let isShowNum = 0
        if (exp && exp.length > 0) {
          exp.forEach(item => {
            if (item.ruleType === 'eq') {
              if (obj[item.colName] === item.value) {
                isShowNum++
              }
            } else if (item.ruleType === 'neq') {

              if (obj[item.colName] !== item.value) {
                isShowNum++
              }
            }
          })
          return exp.length === isShowNum
        } else {
          return true
        }
      }
    /**
     * @description 根据file_no查找文件列表
     * @param {String} file_no - 文件编号
     */
    Vue.prototype.getFilePath = async function(file_no) {
      let url = Vue.prototype.getServiceUrl('file', 'srvfile_attachment_select', 'select')
      let req = {
        "serviceName": "srvfile_attachment_select",
        "colNames": ["*"],
        "condition": [{
          "colName": "file_no",
          "value": file_no,
          "ruleType": "eq",
        }]
      }
      if (file_no) {
        let response = await _http.post(url, req);
        console.log('srvfile_attachment_select', response);
        if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
          return response.data.data
        }
      }
    }
    Vue.prototype.getDayDate = function(e) {
      if (e) {
        var date = new Date(e);
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      } else {
        var date = new Date();
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      }
    }
    Vue.prototype.getResData = function(e) {
      if (e.length > 0) {
        return e[0].response.effect_data[0]
      }
    }
    Vue.prototype.setWxUserInfo = async function(e) {
      if (store.state.user.hasSaveUserInfo) {
        return true
      }
      try {
        if (typeof e === 'string') {
          e = JSON.parse(e)
        }
      } catch (err) {
        //TODO handle the exception
      }
      let userInfo = e
      console.log("setWxUserInfo", userInfo)
      switch (userInfo.sex) {
        case 0:
          userInfo.sex = '未知'
          break;
        case 1:
          userInfo.sex = '男'
          break;
        case 2:
          userInfo.sex = '女'
          break;
      }
      let url = Vue.prototype.getServiceUrl('wx', 'srvwx_basic_user_info_save', 'operate')
      let req = [{
        "serviceName": "srvwx_basic_user_info_save",
        "data": [{
          "app_no": mpAppNo,
          "nickname": userInfo.nickname,
          "sex": userInfo.sex,
          "country": userInfo.country,
          "province": userInfo.province,
          "city": userInfo.city,
          "headimgurl": userInfo.headimgurl
        }],
      }]

      if (e) {
        store.commit('SET_WX_USERINFO', userInfo)
        uni.setStorageSync('wxUserInfo', userInfo)
        let response = await _http.post(url, req);
        if (response.data.state === 'SUCCESS' && Array.isArray(response.data.data) && response.data.data
          .length > 0) {
          store.commit('SET_SAVE_USER_STATUS', true)
          return response.data
        }
      }
      return
    }
    Vue.prototype.isInvalid = function(e) {
      if (e === '' || e === null || e === undefined) {
        return false
      } else {
        return true
      }
    }
    Vue.prototype.arraySort = function(arr, col) {
      var compare = function(prop) {
        return function(obj1, obj2) {
          var val1 = obj1[prop];
          var val2 = obj2[prop];
          if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
          }
          if (val1 < val2) {
            return -1;
          } else if (val1 > val2) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      return arr.sort(compare(col))
    }
    Vue.prototype.judgeClientEnviroment = function() {
      let client_env = '';
      // #ifdef H5
      const isWeixin = Vue.prototype.isWeixinClient();
      console.log('isWeixin', isWeixin);
      client_env = isWeixin ? 'wxh5' : 'web';

      // #endif
      // #ifdef MP-WEIXIN
      client_env = 'wxmp';
      //#endif
      // #ifdef APP-PLUS
      client_env = 'app';
      // #endif
      let client_type = '';
      switch (uni.getSystemInfoSync().platform) {
        case 'android':
          console.log('运行Android上');
          client_type = 'android';
          break;
        case 'ios':
          console.log('运行iOS上');
          client_type = 'ios';
          break;
        case 'windows':
          console.log('运行windows上');
          client_type = 'windows';
          break;
        case 'mac':
          console.log('运行mac上');
          client_type = 'mac';
          break;
        case 'devtools':
          console.log('运行devtools上');
          client_type = 'devtools';
          break;
        default:
          client_type = 'web';
      }
      uni.setStorageSync('client_env', client_env);
      uni.setStorageSync('client_type', client_type);

      return {
        client_env,
        client_type
      }
    }
    Vue.prototype.getDecodeUrl = function(e) {
      if (Vue.prototype.isInvalid(e)) {
        let url = decodeURIComponent(e)
        if (url && url.indexOf("%") !== -1) {
          url = decodeURIComponent(e)
          return Vue.prototype.getDecodeUrl(url)
        } else {
          return url
        }
      } else {
        return false
      }
    }
    Vue.prototype.iObject = function(e) {
      if (e) {
        return Object.prototype.toString.call(e) === "[object Object]"
      } else {
        return false
      }
    }
    Vue.prototype.iArray = function(e) {
      if (e) {
        // return Array.isArray(e)
        return Object.prototype.toString.call(e) === "[object Array]"
      } else {
        return false
      }
    }
    Vue.prototype.isString = function(e) {
      return typeof e === 'string'
    }
    Vue.prototype.isArray = function(e) {
      return Array.isArray(e)
    }
    Vue.prototype.setCodeUrl = function(obj) {
      if (obj) {
        let url = ""
        for (let key in obj) {
          url += ("&" + key + "=" + (Vue.prototype.iObject(obj[key]) || Vue.prototype.iArray(obj[key]) ?
            encodeURIComponent(JSON.stringify(obj[key])) : encodeURIComponent(obj[key])))
        }
        return url
      } else {
        return false
      }
    }
    Vue.prototype.setFieldsDefaultVal = function(field, values) {
      if (Vue.prototype.iArray(field) && Vue.prototype.iObject(values)) {
        for (let i = 0; i < field.length; i++) {
          for (let key in values) {
            if (field[i].column === key) {
              field[i].value = values[key]
              field[i].defaultValue = values[key]
            }
          }
        }
        console.log('1111', field, values)
        return field
      } else {
        return false
      }
    }
    Vue.prototype.onButtonRequest = function(e, appName) {
      let btn, row, condition, defaultVal
      if (e && Vue.prototype.iObject(e) && e.hasOwnProperty("button")) {
        btn = e.button
        let params = {
          "type": "update",
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": e.hasOwnProperty("row") ? e.row.id : null
          }],
          "serviceName": btn.service_name || btn.operate_service,
          "defaultVal": null
        }
        switch (btn.button_type) {
          case "edit":
            if (e.hasOwnProperty("row")) {
              row = e.row
              let params = {
                "type": "update",
                "condition": [{
                  "colName": "id",
                  "ruleType": "in",
                  "value": row.id
                }],
                "serviceName": btn.service_name || btn.operate_service,
                "defaultVal": row
              }
              console.log("点击了【有效】的公共编辑按钮", row)
              uni.navigateTo({
                url: "/pages/public/formPage/formPage?params=" + JSON.stringify(params)
              })
            } else {
              console.log("点击了【无效】的公共编辑按钮")
            }
            //代码块
            break;
          case "delete":
            return new Promise((resolve, reject) => {
              uni.showModal({
                content: "是否确认删除操作？",
                success: function(res) {
                  if (res.confirm) {
                    console.log('用户点击确定');
                    let req = [{
                      "serviceName": params.serviceName,
                      "colNames": ["*"],
                      "condition": params.condition
                    }]
                    Vue.prototype.onRequest("delete", params.serviceName,
                      req, appName).then((res) => {
                      if (res.data.state === "SUCCESS") {
                        resolve(res.data)
                      } else {
                        uni.showModal({
                          title: '提示',
                          content: res.data
                            .resultMessage,
                          showCancel: false,
                        })
                        reject(res.data)
                      }

                    })
                  } else if (res.cancel) {
                    resolve('用户点击取消')
                  }
                }
              })
            })
            //代码块
            break;
          case "add":
            //代码块
            break;
          default:
            //默认代码块
        }
      }
    }
    /**
     * 按钮跳转的统一处理
     */
    Vue.prototype.onButtonToUrl = function(e, appName) {
      console.log("onButtonToUrl", e)
      let btn, row, condition, defaultVal
      if (e && Vue.prototype.iObject(e)) {
        btn = e.button
        if (btn.is_public) {
          switch (btn.button_type) {
            case "edit":
              if (e.hasOwnProperty("row")) {
                row = e.row
                let params = {
                  "type": "update",
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": row.id
                  }],
                  "serviceName": btn.service_name || btn.operate_service,
                  "defaultVal": row
                }
                console.log("点击了【有效】的公共编辑按钮", row)
                let fieldsCond = [{
                  column: 'id',
                  value: row.id,
                  display: false
                }]
                let url =
                  `/publicPages/formPage/formPage?type=update&serviceName=${ btn.service_name||btn.operate_service}&fieldsCond=${JSON.stringify(fieldsCond)}`;
                if (appName) {
                  url += `&appName=${appName}`
                }
                if (btn.service_name === 'srvdaq_cms_content_update') {
                  let hideColumn = ['no']
                  url += `&hideColumn=${JSON.stringify(hideColumn)}`
                }
                uni.navigateTo({
                  url: url
                })
              } else {
                console.log("点击了【无效】的公共编辑按钮")
              }
              return new Promise((resolve, reject) => {
                resolve("跳转")

              })
              //代码块
              break;
            case "delete":
              return new Promise((resolve, reject) => {
                Vue.prototype.onButtonRequest(e, appName).then((res) => {
                  if (res) {
                    resolve(res)
                  } else {
                    reject(res)
                  }
                })
              })
              //代码块
              break;
            case "add":
              //代码块
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              break;
            case "detail":
              return new Promise((resolve, reject) => {
                let fieldsCond = [{
                  column: 'id',
                  value: e.row.id,
                  display: false
                }]
                let url =
                  `/publicPages/form/form?type=detail&serviceName=${ btn.service_name||btn.operate_service}&fieldsCond=${encodeURIComponent(
									JSON.stringify(fieldsCond)
								)}`;
                if (appName) {
                  url += `&appName=${appName}`
                }
                // uni.navigateTo({
                //   url: url
                // })
                resolve(e)
              })
              break;
            default:
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              //默认代码块
          }
        } else {
          switch (btn.button_type) {
            case "detail":
              if (e.hasOwnProperty("row")) {
                row = e.row
                let params = {
                  "type": "detail",
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": row.id
                  }],
                  "serviceName": btn.service_name || btn.operate_service,
                  "defaultVal": row
                }
              }
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              //代码块
              break;
            case "delete":
              return new Promise((resolve, reject) => {
                Vue.prototype.onButtonRequest(e, appName).then((res) => {
                  if (res) {
                    resolve(res)
                  } else {
                    reject(res)
                  }
                })
              })
              //代码块
              break;
            case "customize":
              //自定义按钮
              if (btn.servcie_type === 'delete') {
                return new Promise((resolve, reject) => {
                  e.button.button_type = 'delete'
                  Vue.prototype.onButtonRequest(e, appName).then((res) => {
                    if (res) {
                      resolve(res)
                    } else {
                      reject(res)
                    }
                  })
                })
              }
              return new Promise((resolve, reject) => {
                resolve(btn)
              })
              break;
            case "add":
              //代码块
              return new Promise((resolve, reject) => {
                resolve(btn)
              })
              break;
            default:
              //默认代码块
          }
        }
        console.log("btn", btn)
      } else {
        uni.showToast({
          title: "参数错误"
        })
      }

    }
    Vue.prototype.strReplace = function(str, before, after) {
      console.log(str, before, after)
      if (str && before) {
        let a = before
        return str.replace(/[a]/g, after)
      } else {
        return false
      }
    }
    Vue.prototype.html2text = (str) => {
      if (str && typeof str === 'string') {
        return str.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '')
          .replace(
            /\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp\;/g, ' ')
      } else {
        return str
      }
    }
    Vue.prototype.getFixedNum = (num) => {
      if (num) {
        return num.toFixed(1)
      } else {
        return 0
      }
    }
    Vue.prototype.selectBasicUserList = async () => {
      const url = Vue.prototype.getServiceUrl('health', 'srvhealth_person_info_select', 'select');
      const user_no = uni.getStorageSync('login_user_info').user_no
      try {
        if (store.state.user.loginUserInfo) {
          user_no = store.state.user.loginUserInfo.user_no
        }
      } catch (e) {
        //TODO handle the exception
      }
      let req = {
        serviceName: 'srvhealth_person_info_select',
        colNames: ['*'],
        condition: [{
          colName: 'userno',
          ruleType: 'eq',
          value: user_no
        }],
        order: [{
          colName: 'create_time',
          orderType: 'asc'
        }]
      };
      if (user_no) {
        const res = await _http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          let current_user_info = null
          store.commit('SET_USERLIST', res.data.data);
          let info = res.data.data.find(item => item.no === uni.getStorageSync('cur_user_no'))
          if (info && info.no) {
            store.commit("SET_USERINFO", info)
          } else {
            uni.setStorageSync('current_user_info', res.data.data[0]);
            uni.setStorageSync('current_user', res.data.data[0].name);
            current_user_info = res.data.data[0]
            store.commit("SET_USERINFO", current_user_info)
            store.commit("SET_USERLIST", res.data.data)
          }
          return current_user_info
        } else if (res.data.resultCode === '0011') {
          // 登录失效 进行静默登录
          // #ifdef MP-WEIXIN
          store.commit("SET_LOGIN_STATE", false)
          // const result = await wx.login();
          // if (result.code) {
          // 
          // await Vue.prototype.wxLogin({
          // 	code: result.code
          // });
          // }
          // #endif
        } else if (Array.isArray(res.data.data) && res.data.data.length === 0) {
          return 0
          // 没有角色 提示跳转到创建角色页面
        }
      } else {
        // 没有user_no 跳转到登录页面
        // #ifdef MP-WEIXIN
        // const result = await wx.login();
        // if (result.code) {
        // 	await Vue.prototype.wxLogin({
        // 		code: result.code
        // 	});
        // }
        // #endif
        // #ifdef H5

        uni.navigateTo({
          url: '/publicPages/accountExec/accountExec'
        });
        // #endif

      }
    }
    Vue.prototype.selectBasicUserInfo = async () => {
      let userInfo = store.state.user.userInfo
      if (userInfo && userInfo.no) {
        if (userInfo.home_store_no && !store.state.app.hasIntoHospital) {
          // 有home_store 未进入过医院主页
          let pageInfo = Vue.prototype.getShareParams()
          // console.log(store.state.app.inviterInfo)
          // let pageInfo = Vue.prototype.getShareParams()
          // 暂时去掉
          let pageStack = getCurrentPages()
          let currentPage = ''
          if (Array.isArray(pageStack) && pageStack.length >= 1) {
            currentPage = pageStack[pageStack.length - 1]?.$page?.fullPath
          }
          if (['诊所', '医院', '健康服务'].includes(userInfo.home_store_type) && userInfo.home_store_no && (!
              currentPage || (currentPage && currentPage.indexOf(
                  'pages/home/home') == -1 && currentPage
                .indexOf(
                  '/publicPages/chat/chat') == -1 && currentPage.indexOf(
                  'publicPages/gropDetail/gropDetail') == -1)) && pageStack.length ===
            1) {
            // 通过分享医院主页加入的用户
            let home_store_no = userInfo.home_store_no
            if (api && api.singleStore && api.storeNo) {
              home_store_no = api.storeNo
            }
            uni.redirectTo({
              url: `pages/home/home?store_no=${home_store_no}`,
              success() {
                // 标记 已进入过医院主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          } else if (userInfo.home_store_type === '饭馆' && userInfo.home_store_no) {
            // 通过分享餐馆主页加入的用户
            uni.redirectTo({
              url: '/otherPages/shop/shopHome?type=find&store_no=' + userInfo
                .home_store_no,
              success() {
                // 标记 已进入过餐馆主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          } else if (userInfo.home_store_type === '医生') {
            uni.redirectTo({
              url: '/pediaPages/doctorIntro/doctorIntro',
              success() {
                // 标记 已进入过餐馆主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          }
        }
        return store.state.user.userInfo
      }

      const user_no = uni.getStorageSync('login_user_info').user_no
      try {
        if (store.state.user.loginUserInfo) {
          user_no = store.state.user.loginUserInfo.user_no
        }
      } catch (e) {
        //TODO handle the exception
      }
      let url = Vue.prototype.getServiceUrl('health', 'srvhealth_person_info_select', 'select')
      let req = {
        "serviceName": "srvhealth_person_info_select",
        "colNames": ["*"],
        order: [{
          colName: 'create_time',
          orderType: 'asc'
        }],
        "condition": [{
          "colName": "create_user",
          "ruleType": "eq",
          "value": user_no
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 2
        },
      }
      let res = await _http.post(url, req)

      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        store.commit('SET_USERINFO', res.data.data[0])
        store.commit('SET_USERLIST', res.data.data)
        uni.setStorageSync('current_user_info', res.data.data[0]);
        uni.setStorageSync('current_user', res.data.data[0].name);
        let info = res.data.data.find(item => item.no === uni.getStorageSync('cur_user_no'))
        if (info && info.no) {
          store.commit('SET_USERINFO', info)
          uni.setStorageSync('current_user_info', info);
          uni.setStorageSync('current_user', info.name);
        }
        // #ifdef MP-WEIXIN
        if (res.data.data[0].home_store_no && !store.state.app.hasIntoHospital) {
          // 有home_store 此次打开小程序未进入过医院/餐馆主页
          let pageInfo = Vue.prototype.getShareParams()
          // console.log(store.state.app.inviterInfo)
          let pageStack = getCurrentPages()
          let currentPage = ''
          if (Array.isArray(pageStack) && pageStack.length >= 1) {
            currentPage = pageStack[pageStack.length - 1]?.$page?.fullPath
          }
          // 暂时去掉
          if (['诊所', '医院', '健康服务'].includes(store.state
              .user.userInfo.home_store_type) && (!currentPage || (currentPage && currentPage
              .indexOf(
                'pages/home/home') == -1 && currentPage
              .indexOf(
                '/publicPages/chat/chat') == -1 && currentPage.indexOf(
                'publicPages/gropDetail/gropDetail') == -1)) && pageStack.length ===
            1) {
            let home_store_no = res.data.data[0].home_store_no
            if (api && api.singleStore && api.storeNo) {
              home_store_no = api.storeNo
            }
            // 通过分享医院主页加入的用户
            uni.redirectTo({
              url: `pages/home/home?store_no=${home_store_no}`,
              success() {
                // 标记 已进入过医院主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          } else if ((['饭馆'].includes(store.state
                .user.userInfo.home_store_type) && store.state.user
              .userInfo.home_store_no)) {
            // 通过分享饭馆主页加入的用户
            uni.redirectTo({
              url: '/otherPages/shop/shopHome?type=find&store_no=' + store.state
                .user
                .userInfo.home_store_no,
              success() {
                // 标记 已进入过餐馆主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          } else if (userInfo.home_store_type === '医生') {
            uni.redirectTo({
              url: '/pediaPages/doctorIntro/doctorIntro',
              success() {
                // 标记 已进入过餐馆主页
                store.commit('SET_INTO_HOSPITAL_STATUS', true)
              }
            })
          }
        }
        // #endif
        return res.data.data[0]
      } else {
        return false
      }
    }
    Vue.prototype.getWxUserInfo = async (e) => {
      // #ifdef MP-WEIXIN
      const user = e.mp.detail;
      if (user && user.userInfo) {
        let rawData = {
          nickname: user.userInfo.nickName,
          sex: user.userInfo.gender,
          country: user.userInfo.country,
          province: user.userInfo.province,
          city: user.userInfo.city,
          headimgurl: user.userInfo.avatarUrl
        };
        Vue.prototype.setWxUserInfo(rawData);
        store.commit('SET_WX_USERINFO', rawData);
        store.commit('SET_AUTH_USERINFO', true);
      }
      // #endif
    }
    Vue.prototype.getDoctorInfo = async (no) => {
      // 查找医生信息
      let serviceName = 'srvhealth_person_info_select';
      let url = Vue.prototype.getServiceUrl('health', serviceName, 'select');
      let req = {
        serviceName: serviceName,
        colNames: ['*'],
        condition: [{
          colName: 'no',
          ruleType: 'eq',
          value: no
        }],
        page: {
          pageNo: 1,
          rownumber: 10
        }
      };
      let res = await _http.post(url, req);
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data
        .length > 0) {
        return res.data.data[0];
      } else {
        return false;
      }
    }
    Vue.prototype.bindDoctorInfo = async (no, params) => {
      let docInfo = await Vue.prototype.getDoctorInfo(no)
      if (docInfo && docInfo.no) {
        let serviceName = 'srvhealth_person_relation_add';
        let url = Vue.prototype.getServiceUrl('health', serviceName, 'operate');
        let req = [{
          serviceName: 'srvhealth_person_relation_add',
          condition: [],
          data: [{
            relation_type: params?.relation_type || '管理',
            state: '正常',
            usera_name: docInfo.name,
            usera_no: docInfo.userno,
            usera_person_no: docInfo.no,
            usera_profile_url: docInfo.profile_url,
            userb_name: store.state.user.userInfo.name,
            userb_no: store.state.user.userInfo.userno,
            userb_person_no: store.state.user.userInfo.no,
            userb_image: store.state.user.userInfo.user_image,
            userb_profile_url: store.state.user.userInfo
              .profile_url,
            userb_sex: store.state.user.userInfo.sex
          }]
        }];
        let res = await _http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          // uni.showModal({
          // 	title: '提示',
          // 	content: `已绑定${docInfo.name}为您的医生`,
          // 	showCancel: false,
          // 	confirmText: '知道了'
          // });
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
    Vue.prototype.updateUserInfo = async (e) => {
      let userInfo = JSON.parse(JSON.stringify(e))
      let gender = userInfo.gender || userInfo.sex //性别 0：未知、1：男、2：女
      userInfo.sex = gender === 1 ? '男' : gender === 2 ? '女' : userInfo.sex
      let vuex_userInfo = store.state.user.userInfo
      if (vuex_userInfo && vuex_userInfo.no && (userInfo.avatarUrl !== vuex_userInfo
          .profile_url || userInfo.nickName !== vuex_userInfo.nick_name ||
          userInfo.sex !== vuex_userInfo.sex)) {
        Vue.prototype.updateUserProfile(userInfo.headimgurl, vuex_userInfo.no,
          userInfo.nickName || userInfo.nickname, userInfo.sex)
      }
      store.commit('SET_AUTH_USERINFO', true);
    }
    Vue.prototype.initLogin = async () => {
      // 初始化登录状态
      // #ifdef MP-WEIXIN
      let isLogin = await wxVerifyLogin()
      let userInfo = await Vue.prototype.selectBasicUserInfo()
      // #endif
    }
    Vue.prototype.toAddPage = async (rawData) => {
      let isLogin = store.state.app.isLogin
      if (!isLogin) {
        isLogin = await wxVerifyLogin()
      }
      // 登录 查找基本信息
      // return
      let data = await selectPersonInfo()

      let wxUserInfo = ''
      if (store && store.state && store.state.user) {
        wxUserInfo = store.state.user.wxUserInfo
      }
      if (data && data.no && data.nick_name && data.profile_url) {
        // 已有用户信息
        store.commit('SET_AUTH_USERINFO', true)
        // if (!store.state.app.subscsribeStatus) {
        // 	Vue.prototype.checkSubscribeStatus()
        // }
        // 自动更新头像昵称
        store.commit('SET_REGIST_STATUS', false)
        return true
      } else if (data?.no) {
        // 未查到用户信息
        store.commit('SET_AUTH_USERINFO', false)
        // 获取授权，登记用户信息
        // return 
        // #ifdef MP-WEIXIN
        // const wxUser = await wx.getUserProfile({
        // 	desc: '用于完善会员资料' // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        // })
        // if (wxUser && wxUser.userInfo) {
        // 	let rawData = {
        // 		nickname: wxUser.userInfo.nickName,
        // 		sex: wxUser.userInfo.gender,
        // 		country: wxUser.userInfo.country,
        // 		province: wxUser.userInfo.province,
        // 		city: wxUser.userInfo.city,
        // 		headimgurl: wxUser.userInfo.avatarUrl
        // 	};
        // 	// 保存用户信息
        // 	await Vue.prototype.setWxUserInfo(rawData);
        // 	store.commit('SET_WX_USERINFO', rawData);
        // 	store.commit('SET_AUTH_USERINFO', true);
        // }
        // #endif

        if ((wxUserInfo && (!wxUserInfo.nickname || wxUserInfo.nickname === '微信用户')) || !wxUserInfo) {
          // 未授权获取用户信息
          store.commit('SET_AUTH_USERINFO', false)
          store.commit('SET_REGIST_STATUS', false)
          // return
          // 未授权不进行注册
        } else if (wxUserInfo?.nickname) {
          if (data && data.no) {
            await Vue.prototype.updateUserInfo(wxUserInfo)
            return
          }
        }
      } else {
        // 没有基本信息 创建基本信息
        let login_user_info = uni.getStorageSync('login_user_info')
        let user_no = login_user_info.user_no
        try {
          if (store.state.user.loginUserInfo) {
            login_user_info = store.state.user.loginUserInfo
            user_no = store.state.user.loginUserInfo.user_no
          }
        } catch (e) {
          //TODO handle the exception
        }
        let sex = ''
        if (wxUserInfo && wxUserInfo.sex) {
          switch (wxUserInfo.sex) {
            case 0:
              sex = ''
              break;
            case 1:
              sex = '男'
              break;
            case 2:
              sex = '女'
              break;
          }
        }
        if (wxUserInfo && wxUserInfo.gender) {
          switch (wxUserInfo.gender) {
            case 0:
              sex = ''
              break;
            case 1:
              sex = '男'
              break;
            case 2:
              sex = '女'
              break;
          }
        }
        let url = Vue.prototype.getServiceUrl('health', 'srvhealth_person_info_add', 'add')
        let req = [{
          "serviceName": "srvhealth_person_info_add",
          "data": [{
            "nick_name": wxUserInfo && wxUserInfo.nickname ? wxUserInfo.nickname
              .replace(
                /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : "",
            "userno": user_no,
            "name": wxUserInfo && wxUserInfo.nickname ? wxUserInfo.nickname.replace(
              /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : "",
            "profile_url": wxUserInfo ? wxUserInfo.headimgurl : "",
            // "user_image": wxUserInfo ? wxUserInfo.headimgurl : "",
            "sex": sex ? sex : null,
            "is_main": "是",
            "font_size": "中"
          }]
        }]
        try {
          let inviterInfo = store.state.app.inviterInfo
          if (inviterInfo.invite_user_no) {
            req[0].data[0].invite_user_no = inviterInfo.invite_user_no
          } else {
            req[0].data[0].invite_user_no = ''
          }
          if (inviterInfo.add_url) {
            req[0].data[0].add_url = inviterInfo.add_url
          }
          if (inviterInfo.add_store_no) {
            req[0].data[0].add_store_no = inviterInfo.add_store_no
            req[0].data[0].home_store_no = inviterInfo.add_store_no
          } else {

          }
        } catch (e) {}
        if (store.state.user.userInfo && store.state.user.userInfo.no) {
          return store.state.user.userInfo
        }

        if (api && api.singleApp && api.storeNo) {
          // 单店铺模式
          req[0].data[0].add_store_no = api.storeNo
          req[0].data[0].home_store_no = api.storeNo
        }
        store.commit('SET_REGIST_STATUS', true)
        let res = await _http.post(url, req)
        store.commit('SET_REGIST_STATUS', false)
        if (res.data && res.data.resultCode === "SUCCESS") {
          console.log("信息登记成功")
          if (
            Array.isArray(res.data.response) &&
            res.data.response.length > 0 &&
            res.data.response[0].response &&
            Array.isArray(res.data.response[0].response.effect_data) &&
            res.data.response[0].response.effect_data.length > 0
          ) {
            store.commit('SET_AUTH_USERINFO', true)
            store.commit('SET_REGIST_STATUS', true)
            store.commit('SET_USERINFO', res.data.response[0].response.effect_data[0])
          }

          return true
        } else {

          if (res.data.resultCode === '0011') {
            // 未登录
            return false
          }
          return false
        }
      }
      // return
      return
    }

    Vue.prototype.getVideoPath = (no) => {
      if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
        return no
      } else if (no) {
        if (no.indexOf('&bx_auth_ticket') !== -1) {
          no = no.split('&bx_auth_ticket')[0]
        }
        return api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
          'bx_auth_ticket');
      } else {
        return false
      }
    }

    Vue.prototype.getImagePath = (no, notThumb) => {
      if (no && (no.indexOf('http://') !== -1 || no.indexOf('https://') !== -1)) {
        return no
      } else if (no) {
        if (no.indexOf('&bx_auth_ticket') !== -1) {
          no = no.split('&bx_auth_ticket')[0]
        }
        if (notThumb) {
          return api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
            'bx_auth_ticket');
        } else {
          return api.downloadFile + no + '&bx_auth_ticket=' + uni.getStorageSync(
              'bx_auth_ticket') +
            '&thumbnailType=fwsu_100';
        }
      } else {
        return ''
      }
    }
    Vue.prototype.uploadRes2Url = (res) => {
      if (res.errMsg === "uploadFile:ok") {
        let data = {}
        if (typeof res.data === 'string') {
          data = JSON.parse(res.data)
        }
        if (data.fileurl) {
          return `${api.getFilePath}${data.fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
        } else {
          return false
        }
      } else {
        return false
      }
    }
    Vue.prototype.requestSuccess = (res) => {
      return res.data.state === 'SUCCESS' && Array.isArray(res.data.data)
    }
    Vue.prototype.getVideoInfo = (url) => {
      return new Promise((resolve, reject) => {
        // #ifdef MP-WEIXIN
        uni.getVideoInfo({
          src: url,
          success(res) {
            resolve(res)
          },
          fail(error) {
            reject(error)
          }
        })
        // #endif
      })
    }
    /**
     * @description 获取图片信息
     */
    Vue.prototype.getImageInfo = (item) => {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: item.url,
          success: (res) => {
            resolve({
              name: item.name,
              src: res.path,
              height: res.height,
              h: res.height,
              w: res.width,
              width: res.width
            })
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    }

    Vue.prototype.sliceDigitNumber = (num, length) => {
      // 将数字分为整数部分和小数部分
      if (length && typeof length === 'number') {
        num = Number(num.toFixed(length))
      } else {
        num = Number(num.toFixed(1))
      }
      let number = Number(num)
      if (!isNaN(number)) {
        return {
          integer: parseInt(num),
          fraction: parseInt(num) === parseFloat(num) ? 0 : Number(parseFloat(num)
            .toString()
            .split('.')[
              1])
        }
      } else {
        return {
          int: 0,
          decimal: 0
        }
      }
    }
    Vue.prototype.setPicHeight = (content, max = 350) => {
      // 固定宽度，计算等比例下图片的高度
      let maxW = uni.upx2px(350);
      if (max) {
        maxW = uni.upx2px(max)
      }
      content.h = (maxW * content.h) / content.w;
      content.w = maxW;
      return content;
    }

    Vue.prototype.evalConditions = (conditions, mainData) => {
      conditions = conditions.map(op => {
        let regVar = /\$\{(.*?)\}/
        if (op.value.indexOf('data.hotel_no') !== -1) {
          if (mainData?.store_no && !mainData?.hotel_no) {
            op.value = 'data.store_no'
          }
        }
        if (op.value && regVar.test(op.value)) {
          if (op.value === '${today}') {
            op.value = dayjs().format("YYYY-MM-DD")
          } else {
            let obj = {
              userInfo: store?.state?.user?.userInfo,
              storeInfo: store?.state?.app?.storeInfo,
              storeUser: store?.state?.user?.storeUserInfo,
              data: mainData
            }
            op.value = Vue.prototype.renderStr(op.value, obj)
          }
        } else if (op.value && op.value.indexOf('data.') !== -1) {
          let colName = op.value.slice(op.value.indexOf('data.') + 5);
          if (mainData && typeof mainData === 'object' && mainData[colName]) {
            op.value = mainData[colName];
          } else if (mainData && typeof mainData === 'object') {
            op.value = ''
            op.ruleType = 'like'
          }
        } else if (op.value && op.value.indexOf('top.user.user_no') !== -1) {
          let login_user_info = uni.getStorageSync('login_user_info')
          op.value = login_user_info?.user_no || '';
        } else if (op.value && op.value.indexOf("'") === 0 && op.value
          .lastIndexOf(
            "'") === op.value
          .length - 1) {
          op.value = op.value.replace(/\'/gi, '');
        }
        if (op.value_exp) {
          delete op.value_exp;
        }
        return op
      })

      // conditions = conditions.filter(item => {
      // 	if (item.ruleType === 'like' && !item.value) {
      // 		return false
      // 	} else {
      // 		return true
      // 	}
      // })

      return conditions
    }

    Vue.prototype.renderStr = (str, obj) => {
      if (typeof obj === 'object' && str) {
        str = str.replace(/\$\{(.*?)\}/g, (match, key) => {
          key = key.trim()
          let result = obj[key]
          if (key === 'today') {
            result = dayjs().format("YYYY-MM-DD")
          }
          let arr = key.split('.')
          if (arr.length > 1) {
            result = obj
            arr.forEach(item => {
              try {
                result = result[item] ?? '';
                if (result === 0) {
                  result = '0'
                }
              } catch (e) {
                //TODO handle the exception
              }
            })
          }
          return result
        })
      }
      return str
    }

    Vue.prototype.renderEmoji = (str) => {
      if (str) {
        try {
          str = str.replace(/\&\#(.*?);/g, (match, key) => {
            if (key) {
              key = '0' + key
            }
            if (String.fromCodePoint) {
              return String.fromCodePoint(key)
            }
          })
        } catch (e) {
          //TODO handle the exception
          console.log('renderEmojiErr', e)
        }
      }
      return str
    }

    Vue.prototype.toArticle = (no) => {
      uni.navigateTo({
        url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${no}`
      });
    }

    Vue.prototype.delNotChineseChar = (str) => {
      // 去掉非中文字符
      if (str) {
        str = str.replace(/\w/g, '')
      } else {
        str = ''
      }
      return str
    }
    Vue.prototype.colNameToLabel = function(cols, col) {
      // pos 位置 pu || po    type  true || false
      let res = ''
      for (let key in cols) {
        if (cols[key].col_type == 'Dict' || cols[key].col_type == 'User' || cols[key].col_type == 'fk') {
          if (col == `_${cols[key].columns}_disp` || cols[key].columns == col) {
            // console.log("colNameToLabel",col,cols[key].columns,cols[key].label)
            res = cols[key].label
          }
        } else {
          if (cols[key].columns == col) {
            // console.log("colNameToLabel",col,cols[key].columns,cols[key].label)
            res = cols[key].label
          }
        }

      }

      return res
    }

    Vue.prototype.sliceString = function(str, len, pos, type) {
      // pos 位置 pu || po    type  true || false
      let res = str === null || str === undefined ? '' : str
      res = res.toString()

      if (pos === 'po') {
        res = res.slice(res.length - len)
      } else {
        res = res.slice(0, len)
      }
      if (type && res.length > len) {
        res += '...'
      }
      return res
    }
    // 后端返回js_validate校验结果
    Vue.prototype.evalValidate = async (srv, cols, data = {}, appName) => {
      if (!srv || !cols) {
        return
      }
      if (Array.isArray(cols)) {
        cols = cols.toString()
      }
      const app = appName || uni.getStorageSync('activeApp')
      const url = `${Vue.prototype.$api.serverURL}/${app}/operate/srvsys_srv_col_validate`
      const req = [{
        serviceName: "srvsys_srv_col_validate",
        condition: [{
            colName: 'service_name',
            ruleType: 'eq',
            value: srv
          },
          {
            colName: 'col',
            value: cols
          }
        ]
      }]
      if (data) {
        req[0].data = [data]
      }
      const res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response.length >
        0) {
        return res.data.response[0]
      } else if (res.data.resultCode === '6666') {
        return true
      } else {
        return false
      }

    }

    // 后端返回表内计算结果
    Vue.prototype.evalCalc = async (tableName, cols, data = {}, appName) => {
      if (!tableName || !cols) {
        return
      }
      if (Array.isArray(cols)) {
        cols = cols.toString()
      }
      const app = appName || uni.getStorageSync('activeApp')
      const url = `${Vue.prototype.$api.serverURL}/${app}/operate/srvsys_table_col_calc_result`
      const req = [{
        serviceName: "srvsys_table_col_calc_result",
        condition: [{
            colName: 'table',
            ruleType: 'eq',
            value: tableName
          },
          {
            colName: 'col',
            ruleType: 'eq',
            value: cols
          }
        ]
      }]
      if (data) {
        req[0].data = [data]
      }
      const res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response.length >
        0) {
        return res.data.response[0]
      } else if (res.data.resultCode === '6666') {
        return true
      } else {
        return false
      }

    }
    // 后端计算xif并返回结果
    Vue.prototype.evalX_IF = async (tableName, cols, data = {}, appName) => {
      if (!tableName || !cols) {
        return
      }
      if (Array.isArray(cols)) {
        cols = cols.toString()
      }
      const app = appName || uni.getStorageSync('activeApp')
      const url = `${Vue.prototype.$api.serverURL}/${app}/operate/srvsys_table_col_show_hide_result`
      const req = [{
        serviceName: "srvsys_table_col_show_hide_result",
        condition: [{
            colName: 'table',
            ruleType: 'eq',
            value: tableName
          },
          {
            colName: 'col',
            ruleType: 'eq',
            value: cols
          }
        ]
      }]
      if (data) {
        req[0].data = [data]
      }
      const res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response.length >
        0) {
        return res.data.response[0]
      } else if (res.data.resultCode === '6666') {
        return true
      } else {
        return false
      }
    }
    // #ifdef H5
    Vue.prototype.addTab = function(url, tab_title) {
      if (tab_title == undefined || tab_title == null || tab_title == "") {
        tab_title = "新标页签";
      }
      if (window.top.tab) {
        let page = {
          title: tab_title,
          url: url,
          icon: ""
        };
        window.top.tab.addTab(page);
      } else {
        window.open(url)
      }
    };
    // #endif

    Vue.prototype.navigateTo = (params) => {
      if (!params?.url) {
        return
      }
      //#ifdef MP
      uni.navigateTo({
        ...params
      })
      //#endif
      //#ifdef H5
      let title = ''
      if (params?.title) {
        title = params?.title
      }
      let sysInfo = uni.getSystemInfoSync();
      // if (sysInfo?.model === 'PC') {
      // params.url = '/health/#' + params.url
      //   Vue.prototype.addTab(params?.url, params?.title)
      // } else {
      uni.navigateTo({
        ...params
      })
      // }
      //#endif
    }

    Vue.prototype.getUrlParams = (url, params) => {
      var res = new RegExp("(?:&|/?)" + params + "=([^&$]+)").exec(url);
      return res ? res[1] : '';
    }

    Vue.prototype.setNavBg = (theme) => {
      let frontColor = '#ffffff'
      let backgroundColor = '#fff'
      switch (theme) {
        case 'coffee':
          backgroundColor = '#BFA58B'
          break;
        case 'red':
          backgroundColor = '#fe5a3f'
          break;
        case 'blue':
          backgroundColor = '#337fff'
          break;
      }
      uni.setNavigationBarColor({
        frontColor: frontColor,
        backgroundColor: backgroundColor
      })
    }

    // 表单字段配置值改变时发送请求查找另一个字段的值并赋值
    Vue.prototype.getTriggerVal = async (params, data) => {
      let serviceName = params.serviceName;
      let appName = params.appName || uni.getStorageSync('activeApp')
      let url = Vue.prototype.getServiceUrl(appName, serviceName, 'select')
      let cond = params.params_val.split(',')

      if (Array.isArray(cond)) {
        cond = cond.map(key => {
          return {
            colName: key,
            ruleType: 'eq',
            value: data[key]
          }
        }).filter(item => item.value)
      } else {
        cond = []
      }
      let req = {
        "serviceName": serviceName,
        "colNames": ["*"],
        // "page": {
        //   "pageNo": 1,
        //   "rownumber": 1
        // },
        "condition": cond
      }
      let res = await _http.post(url, req)
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data[0]
      }
    }

    Vue.prototype.getGoodsStock = async (e) => {
      if (e && e.goods_no) {
        let req = {
          "serviceName": "srvhealth_store_goods_guest_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "goods_no",
            "ruleType": "eq",
            "value": e.goods_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        let url = Vue.prototype.getServiceUrl('health', "srvhealth_store_goods_guest_select",
          "select")
        let res = await _http.post(url, req);
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          return res.data.data[0]
        }
      }
    }

    Vue.prototype.updateCart = async (goodsInfo) => {
      let serviceName = 'srvhealth_store_shopping_cart_goods_detail_update';
      if (goodsInfo?.cart_goods_rec_no) {
        let req = [{
          "serviceName": serviceName,
          "condition": [{
            colName: 'cart_goods_rec_no',
            ruleType: 'in',
            value: goodsInfo.cart_goods_rec_no
          }],
          "data": [{
            goods_amount: goodsInfo.goods_amount
          }]
        }]
        return await Vue.prototype.$fetch('update', serviceName, req, 'health')
      }
    }

    Vue.prototype.getPlayAddress = async (fileNo) => {
      let res = await _http.get(`${api.serverURL}/file/getPlayAddress?fileNo=${fileNo}`)
      if (res.data?.state === 'SUCCESS' && res.data?.data?.playUrl) {
        return res.data?.data?.playUrl
      }
    }

    Vue.prototype.getPosterUrl = async (bpNo, text) => {
      if (!bpNo) {
        return
      }
      const url = `${api.serverURL}/health/select/srvhealth_page_share_bill_pic_select`
      const req = {
        "serviceName": "srvhealth_page_share_bill_pic_select",
        "colNames": ["*"],
        "condition": [{
          colName: 'bp_no',
          ruleType: 'eq',
          value: bpNo
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        }
      }
      const res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length !== 0) {
        const cfg = res.data.data[0]
        const {
          background_img,
          logfile,
          xp,
          yp,
          qrwidth
        } = cfg
        const url =
          `${api.serverURL}/file/adv/download?imgFileNo=${background_img}&logoFileNo=${logfile}&qrcontent=${text}&xp=${xp}&yp=${yp}&qrwidth=${qrwidth}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
        return url
      }
    }
  }
}
