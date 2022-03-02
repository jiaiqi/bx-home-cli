import {
  getItem,
  setItem
} from '../utils.js'

const state = {
  loginUserInfo: getItem('loginUserInfo') ? getItem('loginUserInfo') : {}, //账号信息
  wxUserInfo: getItem('wxUserInfo') ? getItem('wxUserInfo') : {}, //微信用户信息
  userInfo: getItem('userInfo') ? getItem('userInfo') : {}, // 当前用户基础信息
  // userInfo: getItem('userInfo') ? getItem('userInfo') : {}, // 当前用户基础信息
  userList: {}, // 当前登录账号下的用户列表
  // userList: getItem('userList') ? getItem('userList') : {}, // 当前登录账号下的用户列表
  patientInfo: getItem('patientInfo') ? getItem('patientInfo') : {},
  hasSaveUserInfo: false,
  storeUserInfo: getItem('storeUserInfo') ? getItem('storeUserInfo') : {},
  wxAuthUserInfo: getItem('wxAuthUserInfo') ? getItem('wxAuthUserInfo') : null, //授权用户信息后获取到的数据
  deviceList: []
}

const mutations = {
  SET_AUTH_USER: (state, wxAuthUserInfo) => {
    state.wxAuthUserInfo = wxAuthUserInfo
    setItem('wxAuthUserInfo', wxAuthUserInfo)
  },
  SET_LOGIN_USER: (state, loginUserInfo) => {
    state.loginUserInfo = loginUserInfo
    debugger
    setItem('loginUserInfo', loginUserInfo)
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
    // #ifdef H5
    setItem('userInfo', userInfo)
    // #endif
  },
  SET_WX_USERINFO: (state, wxUserInfo) => {
    state.wxUserInfo = wxUserInfo
    setItem('wxUserInfo', wxUserInfo)
  },
  SET_USERLIST: (state, userList) => {
    state.userList = userList
    // setItem('userList', userList)
  },
  SET_PATIENT_INFO: (state, patientInfo) => {
    state.patientInfo = patientInfo
    setItem('patientInfo', patientInfo)
  },
  SET_SAVE_USER_STATUS: (state, hasSaveUserInfo) => {
    state.hasSaveUserInfo = hasSaveUserInfo
  },
  SET_STORE_USER: (state, storeUserInfo) => {
    state.storeUserInfo = storeUserInfo
    // #ifdef H5
    setItem('storeUserInfo', storeUserInfo)
    // #endif
  },
  SET_DEVICE_LIST: (state, list) => {
    state.deviceList = list
  }
}

const actions = {
  // get user info
  setUserInfo({
    commit
  }, userInfo) {
    commit('SET_USERINFO', userInfo)
  },
  setWxUserInfo({
    commit
  }, wxUserInfo) {
    commit('SET_WX_USERINFO', wxUserInfo)
  },
  setUserList({
    commit
  }, userList) {
    commit('SET_USERLIST', userList)
  }
}

export default {
  // namespaced: true,
  state,
  mutations,
  actions
}
