import {
  getItem,
  setItem
} from '../utils.js'

let env = ''
// #ifdef MP-WEIXIN
env = 'wxmp'
// #endif
// #ifdef H5
env = 'h5'
// #endif

const state = {
  theme: getItem('theme') || 'blue',
  themeConfig: getItem('themeConfig') || {},
  env: env,
  globalTextFontSize: 16,
  globalLabelFontSize: 16,
  srvCol: [], // 组件共享的srv_col
  isLogin: false, //登录状态
  bx_auth_ticket: getItem('bx_auth_ticket') ? getItem('bx_auth_ticket') : "", //登录token
  backUrl: "", //当前页面的上一级页面
  authSetting: {}, //微信授权信息
  authUserInfo: getItem('authUserInfo') ? getItem('authUserInfo') : {}, //微信授权信息
  hasNotRegInfo: getItem('hasNotRegInfo') ? getItem('hasNotRegInfo') : false, //未注册用户信息
  doctorInfo: {},
  hospitalInfo: {},
  storeList: [], //当前账号所在单位机构的列表
  dietRecord: getItem('dietRecord') ? getItem('dietRecord') : [],
  pageInfo: getItem('pageInfo') ? getItem('pageInfo') : {},
  currentPage: '',
  inviterInfo: {}, //邀请人
  payParams: {}, //支付相关参数
  prePayInfo: {}, //预支付信息
  subscsribeStatus: false, //是否关注公众号
  shareType: '', //分享页面的类型 seeDoctor-邀请就诊登记 bindOrganization-邀请成为诊所用户
  xhrNum: 0, //正在发送的请求的数量
  xhrTimestamp: 0,
  systemInfo: wx.getSystemInfoSync(),
  hasIntoHospital: false, //是否在初次打开app时进入过被邀请诊所的诊所主页
  scene: 0, //小程序进入场景
  storeInfo: getItem('storeInfo') || {}, // 当前店铺信息
  curStoreNo: "",
  placeInfo: null
}
let persistData = {}; //持久化数据
const mutations = {
  SET_THEME: (state, theme) => {
    state.theme = theme
    setItem('theme', state.theme)
  },
  SET_THEME_CFG: (state, cfg) => {
    state.themeConfig = cfg
    setItem('themeConfig', cfg)
  },
  SET_SCENE: (state, scene) => {
    state.scene = scene
  },
  SET_XHR_NUM: (state, num) => {
    state.xhrNum = num
    state.xhrTimestamp = new Date().getTime()
  },
  SET_TICKET: (state, ticket) => {
    state.bx_auth_ticket = ticket
    setItem('bx_auth_ticket', state.bx_auth_ticket)
  },
  SET_GLOBAL_TEXT_SIZE: (state, size) => {
    state.globalTextFontSize = size
  },
  SET_GLOBAL_LABEL_SIZE: (state, size) => {
    state.globalLabelFontSize = size
  },
  setSrvCol: (state, data) => {
    state.srvCol.push(data)
    setItem('srvCol', state.srvCol)
  },
  delSrvCol: (state, data) => {
    let fils = state.srvCol.filter(item => item.service_name !== data)
    state.srvCol = fils
  },
  SET_AUTH_SETTING: (state, data) => {
    if (data.type) {
      state.authSetting[data.type] = data.value
      if (data.value === true) {
        state.hasNotRegInfo = false // 不显示授权组件
      } else if (data.value === false) {
        state.hasNotRegInfo = true //显示授权组件
      }
    }
  },
  SET_CURRENT_PAGE: (state, url) => {
    state.currentPage = url
  },
  SET_AUTH_USERINFO: (state, isAuth) => {
    state.authUserInfo = isAuth
    state.hasNotRegInfo = !isAuth
    if (uni.getStorageSync('client_env') === 'web') {
      state.hasNotRegInfo = false
      state.authUserInfo = true
    }
    setItem('authUserInfo', state.authUserInfo)
  },
  SET_LOGIN_STATE: (state, loginState) => {
    state.isLogin = loginState
    setItem('isLogin', loginState)
  },
  SET_BACK_URL: (state, url) => {
    state.backUrl = url
    setItem('backUrl', url)
  },
  SET_DOCTOR_INFO: (state, info) => {
    state.doctorInfo = info
  },
  SET_HOSPITAL_INFO: (state, info) => {
    state.hospitalInfo = info
  },
  SET_STORE_LIST: (state, list) => {
    state.storeList = list
  },
  SET_DIET_RECORD: (state, record) => {
    state.dietRecord = record
  },
  SET_PAGE_INFO: (state, pageInfo) => {
    state.pageInfo = pageInfo
  },
  SET_INVITER_INFO: (state, inviterInfo) => {
    state.inviterInfo = inviterInfo
  },
  SET_PAY_PARAMS: (state, payParams) => {
    state.payParams = payParams
    setItem('payParams', payParams)
  },
  SET_PREPAY_INFO: (state, prePayInfo) => {
    state.prePayInfo = prePayInfo
    setItem('prePayInfo', prePayInfo)
  },
  SET_SUBSCRIBE_STATUS: (state, subscsribeStatus) => {
    state.subscsribeStatus = subscsribeStatus
    setItem('subscsribeStatus', subscsribeStatus)
  },
  SET_SHARE_TYPE: (state, shareType) => {
    state.shareType = shareType
  },
  SET_INTO_HOSPITAL_STATUS: (state, status) => {
    state.hasIntoHospital = status
  },
  SET_STORE_INFO: (state, info) => {
    state.storeInfo = info
    setItem('storeInfo', info)
  },
  SET_CUR_STORE_NO: (state, storeNo) => {
    state.curStoreNo = storeNo
  },
  SET_PLACE: (state, info) => {
    state.placeInfo = info
  },
  /**
   * 更新state数据
   * param Object/Array {key:"xxx",val:"xxx"}
   * key为要更新的state，val为更新的值
   */
  setStateAttr(state, param) {
    if (param instanceof Array) {
      for (let item of param) {
        state[item.key] = item.val;
      }
    } else {
      state[param.key] = param.val;
    }
  }
}

const actions = {
  setSrvCol: ({
    commit
  }, srvCol) => {
    commit('setSrvCol', srvCol)
  },
  setBackUrl: ({
    commit
  }, url) => {
    commit('SET_BACK_URL', url)
  },
  setGlobalTextSize: ({
    commit
  }, fontSize) => {
    commit('SET_GLOBAL_TEXT_SIZE', fontSize)
  },
  setGloballabelSize: ({
    commit
  }, fontSize) => {
    commit('SET_GLOBAL_LABEL_SIZE', fontSize)
  },
}

export default {
  // namespaced: true, //开启命名空间 dispatch/commit要加`app/前缀`
  state,
  mutations,
  actions
}
