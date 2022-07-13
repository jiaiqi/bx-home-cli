import store from '@/store'
import api from '@/common/api.js'
import {
  mapState
} from 'vuex'
export default {
  computed: {
    ...mapState({
      themeConfig: state => state.app.themeConfig,
      globalTextFontSize: state => state.app['globalTextFontSize'],
      globalLabelFontSize: state => state.app.globalLabelFontSize,
      isAttention: state => state.app.subscsribeStatus, //是否关注公众号
      userInfo: state => state.user.userInfo,
      storeInfo: state => state.app.storeInfo,
      vcart: state => state.order.cartInfo,
      vstoreUser: state => state.user.storeUserInfo,
      vloginUser: state => state.user.loginUserInfo,
      scene: state => state.app.scene,
      hasNotRegInfo: state => state.app.hasNotRegInfo, //授权访问用户信息
      isLogin: state => state.app.isLogin,
      vvipCard: state => state.user.vipCard, //用户会员卡信息（充值卡）
      curStoreNo: state => state.app.curStoreNo, //当前店铺编号
      placeInfo: state => state.app.placeInfo
    }),
    $api() {
      return api
    },
    hasVipCard() {
      return !!this.vvipCard?.card_no
    }
  },
  data() {
    return {
      pageUUID: '',
      _pageScrollTop: 0
    }
  },
  async onLoad(option) {
    this.pageUUID = uni.$u.guid(20)
    if (option.storeNo || option.store_no) {
      this.$store.commit('setStateAttr', {
        key: "curStoreNo",
        val: option.storeNo || option.store_no
      })
    }
    // #ifdef MP-WEIXIN
    // await this.initApp()
    //#endif
  },
  methods: {
    toTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
        success: () => {
          this.reachBottomnum = 1
        },
      });
    },
    async setSessionInfo(storeNo) {
      const url = `/health/operate/srvsys_session_info_set`
      const req = [{
        "serviceName": "srvsys_session_info_set",
        "data": [{
          "info_type": "store_info",
          "info_value": storeNo
        }]
      }]
      if (storeNo) {
        return await this.$http.post(url, req)
      }
    },
    async initApp() {
      // 初始化小程序
      // 1. 登录检测、用户信息查找
      await this.toAddPage()
      // 2. 店铺信息查找
      let storeInfo = await this.getStore_()
      if (storeInfo?.store_no) {
        // 3. 店铺用户信息查找
        await this.getStoreUser_()
        // 4. vipcard信息查找
        await this.getVipCard()
      }
    },
    async getStore_() {
      if (!this.curStoreNo) {
        return
      }
      let req = {
        condition: [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.curStoreNo
        }],
        page: {
          pageNo: 1,
          rownumber: 1
        }
      };
      if (this.storeInfo?.store_no === this.curStoreNo) {
        return
      }
      let serviceName = 'srvhealth_store_list_select';
      // serviceName = 'srvhealth_store_mgmt_select'
      serviceName = 'srvhealth_store_cus_niming_detail_select'
      await this.setSessionInfo(this.curStoreNo)
      let res = await this.$fetch('select', serviceName, req, 'health');
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.$store.commit('setStateAttr', {
          key: 'storeInfo',
          val: res.data[0]
        });
        let theme = 'blue';
        if (res.data[0].para_cfg) {
          try {
            let moreConfig = JSON.parse(res.data[0].para_cfg);
            res.data[0].moreConfig = moreConfig;
            if (moreConfig.theme) {
              theme = moreConfig.theme;
            }
          } catch (err) {
            console.log(err);
          }
        }
        this.$store.commit('setStateAttr', {
          key: 'theme',
          val: theme
        });
        return res.data[0]
      }
      return false
    },
    async getStoreUser_() {
      let storeNo = this.curStoreNo
      if (this.userInfo?.no && storeNo) {
        let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
        let req = {
          serviceName: 'srvhealth_store_user_select',
          colNames: ['*'],
          condition: [{
              colName: 'person_no',
              ruleType: 'eq',
              value: this.userInfo.no
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: storeNo
            }
          ]
        };
        if (this.vstoreUser?.store_no === storeNo) {
          this.bindUserInfo = this.vstoreUser
          return [this.vstoreUser]
        }
        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.bindUserInfo = res.data.data[0]
          this.$store.commit('SET_STORE_USER', res.data.data[0]);
          return res.data.data;
        }
        return res
      }
    },
    getwxMchId() {
      // 获取商户号
      return this.storeInfo?.wx_mch_id || this.$api?.wxMchId || '1485038452'
    },
    getOrderShowParams(orderType = '') {
      let showParams = ''
      if (orderType) {
        if (orderType.indexOf('餐饮') > -1) {
          showParams = '服务场地'
        }
        if(orderType&&orderType.indexOf('服务')!==-1){
         showParams=`服务场地,服务人员`
        }
      }
      return showParams
    },
    getOrderType(list = []) {
      // list-商品列表
      let order_type = ''
      switch (this.storeInfo?.type) {
        case '饭馆':
          order_type = '餐饮'
          break;
        case '酒店':
          order_type = '酒店'
          break;
        default:
          order_type = '普通商品'
      }
      let goodsType = Array.from(new Set(list.map(item => item.goods_type)))

      if (goodsType.includes('现制餐饮') && order_type.indexOf('餐饮') == -1) {
        order_type += ',餐饮'
      }

      if (goodsType.includes('充值卡') || goodsType.includes('想豆卡') || goodsType.includes('课程') || goodsType
        .includes('活动') || goodsType.includes('提货卡') || goodsType.includes('套餐卡') || goodsType.includes(
          '面额卡') || goodsType.includes('体验产品') || goodsType.includes('在线服务')) {
        order_type = '虚拟商品'
      }
      
      if (goodsType.includes('线下服务')) {
        order_type = '服务'
      }

      return order_type
    },
    async getPlaceInfo(service_place_no) {
      // 查找服务场地信息
      let url = this.getServiceUrl('health', 'srvhealth_store_place_join_select', 'select');
      const req = {
        "serviceName": "srvhealth_store_place_join_select",
        "colNames": ["*"],
        "condition": [{
          "colName": "store_no",
          "ruleType": "eq",
          "value": this.storeInfo?.store_no
        }, {
          "colName": "place_no",
          "ruleType": "like",
          "value": service_place_no
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        }
      }
      const res = await this.$http.post(url, req)
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {

        this.$store.commit('SET_PLACE', res.data.data[0])

        return res.data.data[0]
      }
    },
    toOfficial(mp_no) {
      // 跳转到关注公众号页面
      const frontEndAddress = this.$api.frontEndAddress
      mp_no = mp_no || 'MP2201210021'
      if (mp_no) {
        let webUrl =
          `${frontEndAddress}storePages/officialIntro/officialIntro?mp_no=${mp_no}`
        let url =
          `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
        uni.navigateTo({
          url
        })
      }
    },
    async getVipCard(no) {
      no = no || this.vstoreUser?.store_user_no
      if (!no) {
        return
      }

      // if (no === this.vvipCard?.attr_store_user_no) {
      //   return this.vvipCard
      // }
      if (!this.vstoreUser?.member_card_no) {
        await this.getStoreUser_()
        // return
      }

      let service = 'srvhealth_store_card_case_select'
      const req = {
        "serviceName": service,
        "colNames": ["*"],
        "condition": [{
          "colName": "attr_store_user_no",
          "ruleType": "eq",
          "value": no
        }, {
          "colName": "card_type",
          "ruleType": "eq",
          "value": "充值卡"
        }],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        }
      }
      let url = this.getServiceUrl('health', service, 'select');
      let res = await this.$http.post(url, req);
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        this.$store.commit('SET_VIP_CARD', res.data.data[0])
      }
      return
    },

    getServiceName(srv) {
      let len = srv.lastIndexOf('_');
      let serviceName = srv.slice(0, len) + '_';
      if (this.srvType === 'list' || this.srvType === 'detail') {
        serviceName += 'select';
      } else {
        serviceName += this.srvType;
      }
      return serviceName;
    },

    async handleAfterSubmit(handler, effect_data) {
      const self = this
      const afterSubmit = handler;
      if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
        const globalData = {
          data: effect_data || {},
          storeInfo: self.storeInfo,
          userInfo: self.userInfo,
          storeUser: self.vstoreUser
        }
        const actionResult = new Array(afterSubmit.length)
        for (let i = 0; i < afterSubmit.length; i++) {
          let item = afterSubmit[i];
          if ((i > 0 && actionResult[i - 1]) || i == 0) {
            if (effect_data && effect_data.id && ['redirectTo', 'navigateTo'].includes(item.type)) {
              if (item.url) {
                let url = this.renderStr(item.url, globalData)
                uni[item.type]({
                  url: url,
                  success: () => {
                    actionResult[i] = true
                  }
                })
              }
            } else if (item.type === 'wx_pay') {
              if (item.money_col && item.order_no_col && effect_data && effect_data[
                  item.order_no_col]) {
                const totalMoney = effect_data[item.money_col] || 0
                if (totalMoney == 0) {
                  actionResult[i] = true
                } else {
                  const wxMchId = this.getwxMchId()
                  const orderData = {
                    order_no: effect_data[item.order_no_col]
                  }
                  const result = await this.toPlaceOrder(totalMoney * 100, '',
                    orderData, wxMchId);
                  if (result && result.prepay_id) {
                    let res = await this.getPayParams(result.prepay_id, wxMchId);
                    const resData = await new Promise((resolve) => {
                      wx.requestPayment({
                        timeStamp: res.timeStamp.toString(),
                        nonceStr: res.nonceStr,
                        package: res.package,
                        signType: 'MD5',
                        paySign: res.paySign,
                        success(res) {
                          // 支付成功
                          resolve(true)
                        },
                        fail(res) {
                          // 支付失败/取消支付
                          resolve('支付失败/取消支付')
                        }
                      });
                    })
                    actionResult[i] = resData
                  }
                }
              } else {
                actionResult[i] === true
              }
            } else if (item.type === 'update_call_back') {
              if (item.service && item.app && Array.isArray(item.data) && item
                .cond) {
                let url = this.getServiceUrl(item.app, item.service, 'operate');
                let req = [{
                  serviceName: item.service,
                  condition: [],
                  data: item.data
                }]
                if (Array.isArray(item.cond)) {
                  req[0].condition = item.cond.map(c => {
                    c.value = self.renderStr(c.value, globalData)
                    return c
                  })
                }
                const res = await self.$http.post(url, req);
                if (res.data.state == 'SUCCESS') {
                  actionResult[i] = true
                } else {
                  actionResult[i] = res.data.resultMessage
                }
              }
            } else if (item.type === 'toDetail') {
              if (item.trigger) {
                if (item.trigger.type == 'condition') {
                  let isPass = true;
                  if (Array.isArray(item.trigger?.rule) && item.trigger.rule.length > 0) {
                    debugger
                    item.trigger.rule.forEach(a => {
                      a = JSON.parse(this.renderStr(JSON.stringify(a), globalData))
                      if (a.result && a.value === a.result) {

                      } else {
                        isPass = false
                      }
                    })
                  }
                  if (isPass === false) {
                    return
                  }
                }
              }

              this.srvType = 'detail'

              let serviceName = this.addV2?.select_service_name || this.colV2?.select_service_name || this
                .getServiceName(this.serviceName)
              let fieldsCond = [{
                column: 'id',
                value: effect_data.id,
                display: false
              }]
              let url =
                `/publicPages/formPage/formPage?type=detail&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(this.fieldsCond))}`
              if (this.appName) {
                url += `&appName=${this.appName}`
              }

              if (item.hideChildTable) {
                url += `&hideChildTable=true`
              }

              if (item.custom_url) {
                url = this.renderStr(item.custom_url, globalData);
              }

              if (item.view_cfg) {
                url += `&view_cfg=${encodeURIComponent(JSON.stringify(item.view_cfg))}`
              }

              uni.redirectTo({
                url
              })
              actionResult[i] = true
            }
          }
        }
        if (actionResult.length === afterSubmit.length && !actionResult.every(item =>
            item == true)) {
          self.srvType === 'detail'
          self.srvType === 'use_type'
          self.formButtons = []
        } else {
          actionResult.forEach(item => {
            if (item && typeof item === 'string') {
              uni.showModal({
                title: "提示",
                content: item,
                showCancel: false
              })
            }
          })
        }
        return actionResult
      }
    }
  }
}
