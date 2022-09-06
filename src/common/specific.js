import store from '@/store'
import api from '@/common/api.js'
import _http from '@/common/http.js'
const mpAppNo = api.appNo.wxmp
import {
  checkIsAttention,
  wxVerifyLogin
} from '@/common/api/login.js'
export default {
  install(Vue, options) {
    Vue.prototype.wxVerifyLogin = wxVerifyLogin
    Vue.prototype.checkSubscribeStatus = async (userInfo) => {
      // 检查是否关注过公众号
      let result = await checkIsAttention()
      store.commit('SET_SUBSCRIBE_STATUS', result)
      return result
    }
    Vue.prototype.saveSharerInfo = async (userInfo, share_url, share_type) => {
      // 分享前保存分享人信息
      if (!userInfo) {
        userInfo = store.state.user.userInfo
      }
      // let pageInfo = Vue.prototype.getShareParams()
      // if (pageInfo && pageInfo.add_url) {
      //   share_url = pageInfo.add_url
      // }
      if (share_type) {
        share_url += `&share_type=${share_type}`
      } else {
        share_url += `&share_type=appMessage`
      }
      let url = Vue.prototype.getServiceUrl('health', 'srvhealth_share_record_add', 'operate');
      let req = [{
        "serviceName": "srvhealth_share_record_add",
        "condition": [],
        "data": [{
          "share_user_no": userInfo.userno,
          "share_person_no": userInfo.no,
          "share_url": share_url
        }],
      }]
      let res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS') {
        return res.data
      } else {
        return false
      }
    }
    Vue.prototype.getPayParams = async (prepay_id, wx_mch_id) => {
      // 获取微信支付需要的参数（签名等）
      let url = Vue.prototype.getServiceUrl('wx', 'srvwx_app_pay_sign_select', 'select');
      let req = {
        "serviceName": "srvwx_app_pay_sign_select",
        "colNames": [
          "*"
        ],
        "condition": [{
            "colName": "app_no",
            "ruleType": "eq",
            "value": mpAppNo
          },
          {
            "colName": "wx_mch_id",
            "ruleType": "eq",
            "value": wx_mch_id || "1485038452"
          },
          {
            "colName": "prepay_id",
            "ruleType": "eq",
            "value": prepay_id
          }
        ]
      }
      if (prepay_id) {
        let res = await _http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            store.commit('SET_PAY_PARAMS', res.data.data[0])
            return res.data.data[0]
          } else {
            uni.showModal({
              title: '提示',
              content: JSON.stringify(res.data),
              showCancel: false
            })
          }
        }
      } else {
        uni.showModal({
          title: '提示',
          content: '未知prepay_id',
          showCancel: false
        })
      }
    }

    Vue.prototype.toPlaceOrder = async (total_fee, login_user_type, orderData, wx_mch_id, description, profitSharing =
      false) => {
      // 统一下单
      login_user_type = uni.getStorageSync('login_user_info')?.login_user_type || ''
      if (total_fee) {
        total_fee = Number(total_fee.toFixed(2))
      }
      if (description && description.length > 40) {
        description = description.slice(0, 40) + '...'
      }
      let url = Vue.prototype.getServiceUrl('wx', 'srvwx_order', 'operate');
      let req = [{
        "serviceName": "srvwx_order",
        "data": [{
          "app_no": mpAppNo,
          "wx_mch_id": wx_mch_id || "1485038452",
          "out_trade_no": orderData ? orderData.order_no : new Date().getTime(),
          "total_fee": total_fee, // 单位是分
          "spbill_create_ip": "192.168.0.21",
          "notify_url": "https://srvms.100xsys.cn/wx/notify/payment",
          "body": description || "test producet",
          "user_no": store.state.user.userInfo.userno,
          "login_user_type": login_user_type || "user"
        }]
      }]
      if (profitSharing) {
        req[0].data[0].profit_sharing = 'Y'
      }
      let res = await _http.post(url, req)
      if (res.data.state === 'SUCCESS') {
        if (Array.isArray(res.data.response) && res.data.response.length > 0) {
          let info = res.data.response[0]
          if (info.response) {
            info = info.response
            store.commit('SET_PREPAY_INFO', info)
            return info
          }
        }
      } else if (res.data.resultMessage) {
        uni.showModal({
          title: '提示',
          content: res.data.resultMessage,
          showCancel: false
        })
      }
    }

    Vue.prototype.updateOrderState = (order_state, pay_state, prepay_id, order_no) => {
      if (order_no) {
        let req = [{
          serviceName: 'srvhealth_store_order_update',
          condition: [{
            colName: 'order_no',
            ruleType: 'eq',
            value: order_no
          }],
          data: [{
            order_state: order_state,
            pay_state: pay_state
          }]
        }];
        if (prepay_id) {
          req[0].data[0].prepay_id = prepay_id
        }
        Vue.prototype.$fetch('operate', 'srvhealth_store_order_update', req, 'health').then(res => {
          // 支付成功后修改订单状态和支付状态
        });
      }
    }

    Vue.prototype.checkOptionParams = (option) => {
      // option中如果有邀请信息 则存储到vuex
      if (option.store_no) {
        store.commit('setStateAttr', {
          key: "curStoreNo",
          val: option.store_no
        })
      }
      if (option && option.share_type) {
        store.commit('SET_SHARE_TYPE', option.share_type)
      }
      if (option.doctor_no && option.store_no) {
        store.commit('SET_DOCTOR_INFO', {
          no: option.doctor_no,
          doctor_no: option.doctor_no,
          store_no: option.store_no
        })
        store.commit('SET_HOSPITAL_INFO', {
          store_no: option.store_no,
          doctor_no: option.doctor_no,
        })
      }
      let pageInfo = Vue.prototype.getShareParams(option)
      if (pageInfo && pageInfo.add_url) {
        if (option.store_no) {
          store.commit('SET_INVITER_INFO', {
            add_store_no: option.store_no,
            home_store_no: option.store_no,
            add_url: pageInfo.add_url,
            invite_user_no: option.invite_user_no || ''
          });
        } else if (option.invite_user_no) {
          store.commit('SET_INVITER_INFO', {
            add_url: pageInfo.add_url,
            invite_user_no: option.invite_user_no || ''
          });
        }
      }
    }
    Vue.prototype.getShareParams = (option = {}) => {
      let userInfo = ''
      try {
        userInfo = store.state.user.userInfo
      } catch (e) {
        //TODO handle the exception
      }
      if (userInfo) {
        let pageStack = getCurrentPages();
        if (Array.isArray(pageStack) && pageStack.length >= 1) {
          let currentPage = pageStack[pageStack.length - 1]
          store.commit('SET_CURRENT_PAGE', currentPage.route)
          return {
            add_url: currentPage.$page.fullPath ? currentPage.$page.fullPath.slice(0, 400) : '未知页面',
            invite_user_no: option.invite_user_no || userInfo?.invite_user_no || option.doctor_no || ''
          }
        }
      }
    }

    Vue.prototype.updateUserProfile = async (profile_url, person_no, nickname, sex) => {
      // 更新用户微信头像
      // 若传了昵称则同时更新用户昵称
      // 若传了性别则同时更新用户性别
      const url = Vue.prototype.getServiceUrl('health', 'srvhealth_person_info_update', 'operate');
      const req = [{
        serviceName: 'srvhealth_person_info_update',
        condition: [{
          colName: 'no',
          ruleType: 'eq',
          value: person_no
        }],
        data: [{}]
      }];
      if (profile_url) {
        req[0].data[0].profile_url = profile_url;
      }
      if (nickname) {
        req[0].data[0].nick_name = nickname.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
        let userInfo = store.state.user.userInfo
        if (userInfo?.id && !userInfo?.name) {
          req[0].data[0].name = req[0].data[0].nick_name
        }
      }
      if (sex && sex !== '未知') {
        req[0].data[0].sex = sex;
      }
      if (Object.keys(req[0].data[0]).length > 0) {
        let res = await Vue.prototype.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          if (res?.data?.response?. [0]?.response?.effect_data?. [0]?.id) {
            let data = res?.data?.response?. [0]?.response?.effect_data?. [0]
            store.commit('SET_USERINFO', data)
            uni.setStorageSync('current_user_info', data);
            uni.setStorageSync('current_user', data.name);
          }
          return true
        }
      }
    }
  }
}
