<template>
  <view class="page-wrap">
    <view class="top-handler text-red" @click="add()">
      <view class="icon-circle">
        <text class="cuIcon-add"></text>
      </view>
      <text>新增区域</text>
    </view>
    <view class="list-wrap">
      <view class="list-item" v-for="item in list" :key="item.id">
        <view class="item-header">
          <view class="item-title">
            {{item[parentShowCol]||''}}
          </view>
          <view class="item-handler">
            <button class="cu-btn  line-red light sm " @click="edit(item,'parent')">修改</button>
            <text class="delete text-gray light sm" @click="deleteItem(item,'parent')">删除</text>
          </view>
        </view>
        <view class="item-content" v-if="item.child">
          <view class="child-item" v-for="child in item.child">
            <view class="top">
              <view class="title">
                {{child[childTitle]||''}}
              </view>
              <view class="hint">
                {{getHint(child)||child[childHint]||''}}
              </view>
            </view>
            <view class="bottom">
              <!--              <view class="state bottom-item">
                {{child[childState]||''}}
              </view> -->
              <view class="handler">
                <text class="bottom-item" @click="deleteItem(child,'child')">删除</text>
                <text class="bottom-item" @click="showHandler(item,child)"> <text
                    class="cuIcon-settingsfill text-red"></text></text>
              </view>
            </view>
          </view>
          <view class="child-item add-icon" @click="addChild(item)">
            <text class="cuIcon-add"></text>
          </view>
        </view>
      </view>
    </view>

    <uni-load-more :status="loadStatus" :contentText="loadText" @clickLoadMore="loadMore" v-if="
        loadStatus !== 'noMore' ||
        (loadStatus === 'noMore' && list.length !== 0)
      ">
    </uni-load-more>

    <view class="cu-modal" :class="{show:modalName==='edit'}" @click="hideModal">
      <view class="cu-dialog" @click.stop="">
        <view class="edit-modal" v-if="curFields&&curFields.length>0">
          <a-form :fields="curFields" :srvApp="appName" :pageType="curType" :formType="curType" ref="bxForm"
            :mainData="curData" @value-blur="valueChange">
          </a-form>
          <view class="button-box">
            <view class="button" @click="hideModal">
              取消
            </view>
            <view class="button bg-red" @click="confirm">
              确定
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:modalName==='handler'}" @click="hideModal()">
      <view class="cu-dialog" @click.stop="" v-if="curData&&handlerTitle">
        <view class="handler-modal">
          <view class="hand-btn text-red text-bold text-lg">
            {{handlerTitle}}
          </view>
          <view class="hand-btn" @click="editChild(curData.child)">
            修改
          </view>
          <view class="hand-btn">
            生成二维码
          </view>
          <view class="hand-btn margin-top" @click="hideModal()">
            取消
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        app: "health",
        childApp: '',
        service: "srvhealth_store_place_type_select", //查询服务
        childService: "srvhealth_store_place_select", // 子表查询服务
        addService: "srvhealth_store_place_type_add",
        childAddService: "srvhealth_store_place_add",
        updateService: "srvhealth_store_place_type_update", // 修改服务
        childUpdateService: "srvhealth_store_place_update", // 子表修改服务
        deleteService: "srvhealth_store_place_type_delete", // 删除服务
        childDeleteService: "srvhealth_store_place_delete", // 子表删除服务
        pidCol: "place_type_no", //父节点中跟子节点进行关联的字段
        parentIdCol: 'id',
        parentShowCol: 'place_type_name',
        childIdCol: 'id',
        childCols: 3, // 几列
        childTitle: "place_name", //标题
        childHint: "server_people_num", //提示信息
        preHint: '(',
        sufHint: '人桌)',
        childState: 'place_state', //状态
        editCols: "",
        childEditCols: "",
        list: [],
        v2Data: {
          select: null,
          add: null,
          update: null,
          childAdd: null,
          childUpdate: null
        },
        curType: "",
        curData: {},
        curV2: null,
        curFields: [],
        defaultCond: [],
        filterByStore: false, //是否通过店铺编号过滤
        pageNo: 1,
        rownumber: 20,
        total: 0,
        loadStatus: 'more',
        loadText: {
          contentdown: "上拉或点击加载更多",
          contentrefresh: "正在加载...",
          contentnomore: "没有更多数据了"
        },
        modalName: ""
      }
    },
    computed: {
      handlerTitle() {
        let str = ''
        if (this.curData && this.curData.child && this.curData[this.parentShowCol] && this.curData.child[this
            .childTitle]) {
          str =
            `${this.curData[this.parentShowCol]}-${this.curData.child[this.childTitle]}${this.getHint(this.curData.child)||''}`
        }
        return str
      },
      appName() {
        return this.app || uni.getStorageSync('activeApp')
      }
    },
    methods: {
      showHandler(parent, child) {
        if (parent && child) {
          this.curData = {
            ...parent,
            child: child
          }
          this.modalName = 'handler'
        }
      },
      async confirm() {
        let data = this.curData;
        let type = this.curType
        let submitButton = null
        let reqData = []

        if (type == 'add') {
          submitButton = this.curV2?._formButtons?.find(item => item.button_type == "submit");
          if (submitButton?.service_name) {
            reqData = [{
              serviceName: submitButton.service_name,
              data: [data]
            }];
          }
        } else if (type === 'update') {
          data = this.$refs?.bxForm?.getFieldModel() || data
          if (data.child) {
            delete data.child
          }
          submitButton = this.curV2?._formButtons?.find(item => item.button_type == "edit");
          if (submitButton?.service_name) {
            reqData = [{
              serviceName: submitButton.service_name,
              data: [data],
              condition: [{
                colName: 'id',
                ruleType: 'eq',
                value: this.curData.id
              }],
            }];
          }
          if (!this.curData.id) {
            return
          }
        }
        if (!submitButton?.service_name) {
          return
        }

        let app = this.appName
        let url = this.getServiceUrl(app, submitButton.service_name, 'operate');
        uni.showLoading()
        let res = await this.$http.post(url, reqData);
        uni.hideLoading()
        debugger
        if (res.data.state === 'SUCCESS') {
          this.pageNo = 1;
          await this.getList()
          this.hideModal()
          uni.showToast({
            title: '操作成功'
          })
        }
      },

      async valueChange(e, triggerField) {
        const column = triggerField.column
        if (this.curData && typeof this.curData === 'object') {
          this.curData[column] = triggerField.value
        }
        let fieldModel = e
        let xIfCols = this.curFields.filter(item => item.x_if && Array.isArray(item
          .xif_trigger_col) && item.xif_trigger_col.includes(column)).map(item => item.column)

        const table_name = this.curV2.main_table
        let xIfResult = null

        if (Array.isArray(xIfCols) && xIfCols.length > 0) {
          xIfResult = await this.evalX_IF(table_name, xIfCols, fieldModel, this.appName)
        }
        let calcResult = {}
        let calcCols = this.curFields.filter(item => item.redundant?.func && Array.isArray(item
            .calc_trigger_col) && item.calc_trigger_col.includes(column) && item.value !== item
          .old_value).map(item =>
          item.column)
        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
        }
        for (let i = 0; i < this.curFields.length; i++) {
          const item = this.curFields[i]

          item.old_value = item.value
          if (e.column && e.column === item.column) {
            item = this.deepClone(e)
          }
          if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
              .column] == 0)) {

            if (item.redundant?.trigger === 'always' || !item.value) {
              item.value = calcResult?.response[item.column] || item.value
              fieldModel[item.column] = item.value
              this.curData[item.column] = item.value
            }

          }

          if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
            if (item.table_name !== table_name) {
              xIfResult = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
            }
            if (xIfResult?.response && xIfResult.response[item.column]) {
              item.display = true
            } else if (xIfResult === true) {
              item.display = true
            } else {
              item.display = false
            }
          }
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
            fieldModel[item.column] = item.value
          }
          this.$set(this.curFields, i, item)
        }
        if (triggerField?.validators && triggerField.validators.indexOf('js_validate') !== -1) {
          let validate = await this.evalValidate(this.serviceName, column, fieldModel, this.appName)
        }

      },
      getHint(e) {
        if (this.childHint && e[this.childHint]) {
          return `${this.preHint||''}${e[this.childHint]}${this.sufHint||''}`
        }
      },
      async add() {
        let e = {}
        if(this.filterByStore){
          e.store_no = this.storeInfo.store_no
        }
        let addV2 = this.v2Data?.add || await this.getV2Data(this.addService, 'add',this
          .appName, null, e)
        this.v2Data.add = addV2
        this.curV2 = addV2
        this.curFields = addV2?._fieldInfo
        this.curType = 'add'
        let defaultVal = addV2._fieldInfo.reduce((res, cur) => {
          if (cur.column === this.pidCol && e[this.pidCol]) {
            res[cur.column] = e[this.pidCol]
          }
          if (cur.defaultValue) {
            res[cur.column] = cur.value || cur.defaultValue
            cur.value = cur.value || cur.defaultValue
          } else if (cur.value) {
            res[cur.column] = cur.value
          }
          return res
        }, {})
        this.curData = defaultVal
        this.modalName = 'edit'
      },
      async edit(e) {
        this.curData = e;
        let updateV2 = this.v2Data?.update || await this.getV2Data(this.updateService, 'update', this
          .appName, null, e)
        this.curV2 = updateV2
        this.v2Data.update = updateV2
        this.curFields = updateV2?._fieldInfo
        this.curType = 'update'
        this.modalName = 'edit'
      },
      async editChild(e, type) {
        this.curData = this.curData?.child || this.curData
        let updateV2 = this.v2Data?.childUpdate || await this.getV2Data(this.childUpdateService, 'update', this
          .childApp, null, e)
        this.v2Data.childUpdate = updateV2
        this.curFields = updateV2?._fieldInfo
        this.curV2 = updateV2
        this.curType = 'update'
        this.modalName = 'edit'
      },
      async addChild(e) {
        let addV2 = this.v2Data?.childAdd || await this.getV2Data(this.childAddService, 'add', this.childApp, e)
        this.v2Data.childAdd = addV2
        this.curV2 = addV2
        this.curFields = addV2?._fieldInfo
        this.curType = 'add'
        let defaultVal = addV2._fieldInfo.reduce((res, cur) => {
          if (cur.column === this.pidCol && e[this.pidCol]) {
            res[cur.column] = e[this.pidCol]
          }
          if (cur.defaultValue) {
            res[cur.column] = cur.value || cur.defaultValue
            cur.value = cur.value || cur.defaultValue
          } else if (cur.value) {
            res[cur.column] = cur.value
          }
          return res
        }, {})
        this.curData = defaultVal
        this.modalName = 'edit'
      },
      async getV2Data(service, type, app, parentData = null, data = null) {
        app = app || this.appName
        console.log(arguments)
        if (app && service) {
          let colVs = await this.getServiceV2(service, type, type, app);
          if (colVs?._fieldInfo) {
            colVs = await this.buildColsV2(colVs, parentData, data)
          }
          return colVs
        }
      },

      async buildColsV2(colVs, parentData = null, data = null) {
        if (Array.isArray(this
            .defaultCond) && Array.isArray(colVs._fieldInfo)) {
          this.defaultCond.forEach(cond => {
            colVs._fieldInfo.forEach(field => {
              if (cond.colName === field.column) {
                field['value'] = field['value'] || cond['value'];
              }
            });
          });
        }
        colVs._fieldInfo = colVs._fieldInfo.map(item => {
          if (parentData && item.column === this.pidCol && parentData[this.pidCol]) {
            item.value = parentData[this.pidCol]
          }
          if (data && data[item.column]) {
            item.value = data[item.column]
          }
          return item
        })

        let defaultVal = colVs._fieldInfo.reduce((res, cur) => {

          if (cur.defaultValue) {
            res[cur.column] = cur.value || cur.defaultValue
            cur.value = cur.value || cur.defaultValue
          } else if (cur.value) {
            res[cur.column] = cur.value
          }
          return res
        }, {})


        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)
        }

        let calcResult = {}
        let calcCols = colVs._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
          .calc_trigger_col)).map(item => item.column)
        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, defaultVal, this.appName)
        }

        for (let i = 0; i < colVs._fieldInfo.length; i++) {
          const item = colVs._fieldInfo[i]

          if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
              .column] == 0)) {

            if (item.redundant?.trigger === 'always' || !item.value) {
              item.value = calcResult?.response[item.column]
              defaultVal[item.column] = item.value
              this.curData[item.column] = item.value
            }
          }
          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], defaultVal, this.appName)
              }
              if (result?.response && result.response[item.column]) {
                item.display = true
              } else if (result === true) {
                item.display = true
              } else {
                item.display = false
              }
            }
          }
        }
        return colVs
      },
      deleteItem(e, type = 'parent') {
        let tip = type === 'parent' ? e[this.parentShowCol] : e[this.childTitle];
        if (tip) {
          tip = `确认删除“${tip}”吗?`
          if (type === 'parent') {
            tip += `删除后区域内所有桌面也将删除`
          }
          uni.showModal({
            title: '提示',
            content: tip,
            success: (res) => {
              if (res.confirm) {
                const service = type === 'child' ? this.childDeleteService : this.deleteService
                let url = this.getServiceUrl(this.appName, service, 'operate');
                let req = [{
                  "serviceName": service,
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": e.id
                  }]
                }]
                if (service && e.id) {
                  this.$http.post(url, req).then(res => {
                    if (res.data.state === 'SUCCESS') {
                      this.pageNo = 1
                      this.getList()
                      uni.showToast({
                        title: res.data?.resultMessage || '操作成功',
                        icon: 'none'
                      })

                    }
                  })
                }
              }
            }
          })
        }
      },

      async loadMore() {
        if (this.loadStatus === 'more') {
          this.pageNo++;
          return await this.getList()
        }
      },
      async getList() {
        const service = this.service
        let url = this.getServiceUrl(this.appName, service, 'select');
        let req = {
          "colNames": ["*"],
          "serviceName": service,
          "condition": this.defaultCond || [],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": 20
          }
        }
        if (this.filterByStore && this.storeInfo?.store_no) {
          req.condition = [...req.condition, {
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo.store_no
          }]
        }
        this.loadStatus = 'loading'
        const res = await this.$http.post(url, req)
        if (res.data?.state === 'SUCCESS') {
          let list = res.data.data || [];
          let {
            pageNo,
            total,
            rownumber
          } = res.data.page || {};
          if (pageNo && rownumber) {
            this.pageNo = pageNo;
            this.total = total
            if (pageNo * rownumber >= total) {
              this.loadStatus = 'noMore'
            } else {
              this.loadStatus = 'more'
            }
          }
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let cond = [{
              colName: this.pidCol,
              ruleType: 'in',
              value: res.data.data.map(item => item[this.pidCol]).toString()
            }]
            let childData = await this.getChildList(cond)
            if (Array.isArray(childData) && childData.length > 0) {
              list = list.map((item) => {
                item.child = childData.filter(e => e[this.pidCol] === item[this.pidCol]) || []
                return item
              })
            }
          }
          if (this.pageNo == 1) {
            this.list = list
          } else {
            this.list = [...this.list, ...list]
          }
          return list
        } else {
          this.loadStatus = 'noMore'
        }
      },
      async getChildList(cond) {
        const app = this.childApp || this.app || uni.getStorageSync('activeApp')
        const service = this.childService
        let url = this.getServiceUrl(app, service, 'select');
        let req = {
          "colNames": ["*"],
          "serviceName": service,
          "condition": cond,
          "page": {
            "pageNo": 1,
            "rownumber": 1000
          }
        }
        const res = await this.$http.post(url, req)
        return res.data.data || []
      },
      initData() {

      },
      hideModal() {
        this.modalName = ''
        this.curData = null
        this.curFields = []
        this.curV2 = null
        this.curType = ''
      },
    },
    onLoad(option) {
      if (typeof option === 'object') {
        let keys = Object.keys(option);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (key === 'defaultCond' && option[key]) {
              let val = this.renderStr(option[key], this)
              try {
                this[key] = JSON.parse(val)
              } catch (e) {
                //TODO handle the exception
              }
            } else if (option[key] === 'true') {
              this[key] = true
            } else {
              this[key] = option[key]
            }
          })
        }
      }
      if (this.service) {
        this.getList()
      }
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.loadMore()
      }
    },
    onPullDownRefresh() {
      this.pageNo = 1;
      this.getList().then(_ => {
        uni.stopPullDownRefresh()
      })
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    min-height: 100vh;
    background-color: #fff;
    padding: 10px;
  }

  .top-handler {
    .icon-circle {
      width: 20px;
      height: 20px;
      border: #e54d42 2px solid;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      font-weight: bold;
      font-size: 18px;
    }

    display: flex;
  }

  .list-wrap {
    .list-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;

        .item-title {
          padding: 2px 0;
          border-left: 2px solid #ff0000;
          padding-left: 10px;
        }

        .item-handler {
          .cu-btn {
            border-radius: 15px;
            min-width: 50px;
            margin-right: 10px;

            &:after {
              border-radius: 15px;
            }
          }

          .delete {
            text-decoration: underline;
          }
        }
      }

      .item-content {
        display: flex;
        flex-wrap: wrap;

        .child-item {
          width: calc(33.33% - 10px);
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 10px;
          background-color: #f5f5f5;

          &.add-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 106px;
            // font-weight: bold;
            font-size: 50px;
          }

          &:last-child {
            margin-right: 0;
          }

          .top {
            text-align: center;
            min-height: 65px;
            padding: 10px;

            .title {
              font-weight: bold;
              font-size: 16px;
            }

            .hint {
              color: #888;
              padding-top: 5px;
            }
          }

          .bottom {
            display: flex;
            border-top: 1px dotted #ccc;
            color: #888;
            font-size: 16px;
            min-height: 40px;
            align-items: center;
            width: 100%;
            padding: 10px 0;

            .handler {
              width: 100%;
              display: flex;
              align-items: center;
            }

            &-item {
              flex: 1;
              text-align: center;

              &:last-child {
                border-left: 1px solid #ccc;
              }
            }
          }
        }
      }
    }
  }

  .cu-dialog {
    border-radius: 10px;
    overflow: hidden;
  }

  .cu-modal.bottom-modal {
    .cu-dialog {
      border-radius: 0 !important;
    }
  }

  .handler-modal {
    background-color: #f1f1f1;

    .hand-btn {
      background-color: #fff;
      margin-bottom: 1px;
      padding: 15px 10px;

      &:active {
        background-color: #f5f5f5;
      }
    }
  }

  .edit-modal {
    .button-box {
      width: 100%;
      margin: 0;

      .button {
        width: 50%;
        text-align: center;
        padding: 25px;
      }
    }
  }
</style>
