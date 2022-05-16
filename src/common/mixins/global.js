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
  onLoad(option) {
    if (option.storeNo || option.store_no) {
      this.$store.commit('SET_CUR_STORE_NO', option.storeNo || option.store_no)
    }
  },
  methods: {
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
      let serviceName = 'srvhealth_store_list_select';
      // serviceName = 'srvhealth_store_mgmt_select'
      serviceName = 'srvhealth_store_cus_niming_detail_select'
      let res = await this.$fetch('select', serviceName, req, 'health');
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.$store.commit('SET_STORE_INFO', res.data[0]);
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
        this.$store.commit('SET_THEME', theme);
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
          '面额卡') || goodsType.includes('体验产品') || goodsType.includes('线下服务') || goodsType.includes('在线服务')) {
        order_type = '虚拟商品'
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
    }
  }


}
