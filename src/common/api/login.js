// import http from './http.js'
import Vue from 'vue'
import http from '@/common/http.js'
import store from '@/store/index.js'
import api from '@/common/api.js'
const mpAppNo = api.appNo.wxmp

// 检测是否关注公众号
const checkIsAttention = async () => {
  let url = '/wx/select/srvwx_user_app_attention_select'
  let req = {
    "serviceName": "srvwx_user_app_attention_select",
    "colNames": [
      "*"
    ],
    "condition": [{
      "colName": "app_no",
      "ruleType": "eq",
      "value": "APPNO20200107181133"
    }]
  }
  let res = await http.post(url, req)
  if (Array.isArray(res.data.data) && res.data.data.length > 0) {
    let result = res.data.data[0]
    if (result.isAttention === true) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

// 小程序验证登陆
const wxVerifyLogin = (userInfo) => {
  // #ifdef MP-WEIXIN
  return new Promise(resolve => {

    if (store?.state?.user?.userInfo?.nick_name) {
      store.commit('SET_AUTH_USERINFO', true)
    }
    if (store.state.app.isLogin) {
      resolve(true)
    }
    wx.login({
      success(result) {
        if (result.code) {
          let url = '/wx/operate/srvwx_app_login_verify'
          let req = [{
            data: [{
              code: result.code,
              app_no: mpAppNo
            }],
            serviceName: 'srvwx_app_login_verify'
          }]
          http.post(url, req).then(res => {
            if (res.data.resultCode === 'SUCCESS') {
              // 登录成功
              let resData = res.data.response[0].response;
              if (store.state.app.isLogin) {
                resolve(true)
              }
              if (resData && resData.bx_open_code) {
                // 后端未获取到unionid 需要通过开放登录接口给后端发送wx.getUserInfo获取到的数据
                resolve(wxOpenLogin(resData.bx_open_code))
              }
              uni.setStorageSync('isLogin', true);
              store.commit('SET_LOGIN_STATE', true)
              store.commit('SET_TICKET', resData.bx_auth_ticket)
              uni.setStorageSync('bx_auth_ticket', resData
                .bx_auth_ticket);

              if (resData && resData.login_user_info.user_no) {
                uni.setStorageSync('login_user_info', resData
                  .login_user_info);
                store.commit('SET_LOGIN_USER', resData.login_user_info)
              }
              if (resData && resData.login_user_info.data) {
                uni.setStorageSync('visiter_user_info', resData
                  .login_user_info.data[0]);
              }
              resolve(true)
            }
          })
        }
      }
    })
  })

  // #endif
}

// 小程序开户登录
const wxOpenLogin = async (openCode) => {
  if (store.state.app.isLogin) {
    return true
  }
  let wxAuthUserInfo = store?.state?.user?.wxAuthUserInfo

  if (!wxAuthUserInfo) {
    uni.redirectTo({
      url: '/publicPages/accountExec/accountExec'
    })
    store.commit('SET_AUTH_USERINFO', false)
    return
  }
  const userInfo = wxAuthUserInfo.userInfo
  let url = '/wx/operate/srvwx_mini_open_account_login?openCode=' + openCode
  let data = {
    "app_no": mpAppNo,
    "avatarUrl": userInfo.avatarUrl,
    "nickname": userInfo.nickName,
    "headimgurl": userInfo.avatarUrl,
    "sex": userInfo.gender,
    "country": userInfo.country,
    "province": userInfo.province,
    "city": userInfo.city,
    "encryptedData": wxAuthUserInfo.encryptedData,
    "cloudID": wxAuthUserInfo.cloudID,
    "rawData": wxAuthUserInfo.rawData,
    "iv": wxAuthUserInfo.iv,
    "signature": wxAuthUserInfo.signature
  }
  Object.keys(data).forEach(key => {
    if (!data[key]) {
      delete data[key]
    }
  })

  let req = [{
    "serviceName": "srvwx_mini_open_account_login",
    "data": [data]
  }]

  return new Promise((resolve) => {
    http.post(url, req).then(res => {
      if (res.data.resultCode === 'SUCCESS') {
        // 登录成功
        uni.setStorageSync('isLogin', true);
        store.commit('SET_LOGIN_STATE', true)
        let resData = res.data.response[0].response;
        store.commit('SET_TICKET', resData.bx_auth_ticket)
        if (resData.login_user_info.user_no) {
          uni.setStorageSync('login_user_info', resData.login_user_info);
          store.commit('SET_LOGIN_USER', resData.login_user_info)
        }
        uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
        if (resData.login_user_info.data) {
          uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
        }
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const selectPersonInfo = async () => {
  const user_no = uni.getStorageSync('login_user_info')?.user_no
  try {
    if (store.state.user.loginUserInfo) {
      user_no = store.state.user.loginUserInfo.user_no
    }
  } catch (e) {
    //TODO handle the exception
  }
  let url = '/health/select/srvhealth_person_info_select'
  let req = {
    "serviceName": "srvhealth_person_info_select",
    "colNames": ["*"],
    "condition": [{
      "colName": "userno",
      "ruleType": "eq",
      "value": user_no
    }],
    "page": {
      "pageNo": 1,
      "rownumber": 2
    },
  }

  let res = {}
  if (user_no) {
    if (store?.state?.user?.userInfo?.userno === user_no) {
      res = {
        data: {
          state: "SUCCESS",
          data: [store?.state?.user?.userInfo]
        }
      }
    } else {
      res = await http.post(url, req)
    }
  } else {
    return
  }
  if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
    store.commit('SET_USERINFO', res.data.data[0])
    store.commit('SET_USERLIST', res.data.data)
    uni.setStorageSync('current_user_info', res.data.data[0]);
    uni.setStorageSync('current_user',  res.data.data[0].name);
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
    }
    // #endif
    store.commit('SET_AUTH_USERINFO', true);
    return res.data.data[0]
  } else {
    if (res.data.resultCode === '0011') {
      // 未登录
      let isLogin = await wxVerifyLogin()
      if (isLogin) {
        return await selectPersonInfo()
      }
    }
    // store.commit('SET_AUTH_USERINFO', false);
    return false
  }
}

export {
  checkIsAttention,
  wxVerifyLogin,
  wxOpenLogin,
  selectPersonInfo
}
