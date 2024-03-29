// 把所有api的url统一在一起并挂在到vue对象上
// 所有接口都在一个文件里会比较大

let env = 'prod'

// env = 'test'

// env = 'custom'


// if (process?.env?.APP_ENV) {
//   env = process.env.APP_ENV
// }

let conf = {
  "prod": {
    // 生产环境
    serviceAddress: "https://srvms.100xsys.cn",
    appNo: "APPNO20201124160702",
    appId: "wxa3c50c8177ef6739",
    ws: "wss://srvms.100xsys.cn:8081",
    file: "https://file.100xsys.cn",
    frontPath: "https://login.100xsys.cn/health/#/",
  },
  'test': {
    //测试环境
    serviceAddress: "https://wx.100xsys.cn",
    appNo: "APPNO20210926101030",
    appid: "wx08876efb5760ca75",
    ws: "wss://wx.100xsys.cn:8081",
    file: "https://wx.100xsys.cn",
    frontPath: "https://login.100xsys.cn:1443/health/#/",
  },
  "custom": {
    serviceAddress: "https://srvms.100xsys.cn",
    file: "https://file.100xsys.cn",
    ws: "wss://srvms.100xsys.cn:8081",
    frontPath: "https://wx2.100xsys.cn/health/#/",
    singleStore: true,

    // // 陕西省软件行业协会
    // appNo: "APPNO20220302164231",
    // appId: "wx0c82edeb3cdd554e",
    // // serviceAddress: "http://192.168.0.241:8080", // 内网
    // singleStore: true,
    // storeNo: 'S20210517043',
    // customQrcodeFolder: 'rjxh',
    // miniProgramName: "陕西省软件行业协会",

    // // 弥月妈妈
    // appNo: "APPNO20220401101144",
    // appId: "wxd1c976c54f57c493",
    // singleStore: true,
    // storeNo: 'S2203220104',
    // customQrcodeFolder: 'mymm',
    // wxMchId:"1617830911",//微信商户号
    // miniProgramName: "弥月妈妈母婴智慧创业圈",

    // // 易企跑
    // appNo: "APPNO20220614113855",
    // appId: "wx94525ef9e15a3f28",
    // singleStore: true,
    // storeNo: 'S2207010001',
    // customQrcodeFolder: 'yqpqf',
    // // wxMchId:"1617830911",//微信商户号
    // miniProgramName: "易企跑企服",

    //  产康
    appNo: "APPNO20220830151740",
    appId: "wxfba5fb42d052300f",
    // serviceAddress: "http://192.168.0.241:8080", // 内网
    storeNo: 'S2208040001',
    // customQrcodeFolder: 'yqpqf',
    wxMchId:"1628404568",//微信商户号
    miniProgramName: "芊芊坊护乳产康",
  }
}

let remoteAddress = {
  ssourl: 'http://www.100xsys.cn', // 微信登陆sso 端口
  ssoAddress: 'http://sso.100xsys.cn',
  fileSrv: conf[env]['file'],
  serviceAddress: conf[env]['serviceAddress'],
  wsAddr: conf[env]['ws'],
  frontEndAddress: conf[env]['frontPath'],
  // frontEndAddress: 'https://wx2.100xsys.cn/health/#/publicPages/accountExec/accountExec',
  // frontEndAddress: 'https://wx2.100xsys.cn',
  singleApp: true, // 是否单应用， true 时 所有请求均使用 appName 配置
  appName: "health", //singleApp 为 true 时 必须配置
  bx_auth_ticket: "e2cc16a3-6a87-42da-ae5f-99a6af84c5f8",
  onTicket: false, // 是否使用配置的静态 bx_auth_ticket
  isThirdParty: true, // 是否必须第三方认证登录
  thirdPartyType: ['WeChat'], // 第三方类型
  homePath: "/storePages/home/home", // 首页路径， 配置完整路径
}

// #ifdef H5
if (top?.window?.pathConfig?.gateway) {
  remoteAddress.serviceAddress = top?.window?.pathConfig?.gateway
}

if (top?.window?.pathConfig?.ws_gateway) {
  remoteAddress.wsAddr = top?.window?.pathConfig?.ws_gateway
}
// #endif

let ENV = {
  qqmapKey: "Y4MBZ-S223W-RXLR7-O254E-HTPEZ-A2FOD", //腾讯地图key
  env: env,
  // backEndAddress: "https://login.100xsys.cn", //后台管理系统地址
  backEndAddress: "https://login.100xsys.cn:1443", //后台管理系统地址
  frontEndAddress: remoteAddress.frontEndAddress, //前端线上地址
  wsAddr: remoteAddress.wsAddr,
  appNo: {
    wxmp: conf[env]['appNo'],
    // wxmp: 'APPNO20210420103005', // 百想首页
    // wxmp: 'APPNO20201124160702', // 百想健康
    // wxmp: 'APPNO20210926101030', // 测试
    // wxmp: 'APPNO20200214122021', // 百想软件ai平台
    // wxmp: 'APPNO20200731153421' //生活能力评估
    wxh5: 'APPNO20200107181133', //微信公众号
  },
  appID: {
    wxmp: conf[env]['appId'],
    // wxmp: 'wx8e6f993081f6e979', // 百想软件ai平台
    // wxmp: 'wx08876efb5760ca75', // 测试
    // wxmp: 'wxa3c50c8177ef6739', // 百想健康
    // wxmp: 'wxa8574a1e93d8e8d0', // 百想首页
    wxh5: 'wx78d1d4139f97ffca', //百想助理公众号
    // wxmp: "wx08876efb5760ca75" //生活能力评估
  },
  wxMchId: conf[env]['wxMchId'] || '1485038452',
  isThirdParty: remoteAddress.isThirdParty,
  homePath: remoteAddress.homePath, // 应用业务的入口页面 首页。
  singleApp: remoteAddress.singleApp, // 是否单应用
  singleStore: conf[env]['singleStore'], //单店铺
  customQrcodeFolder: conf[env]['customQrcodeFolder'], //自定义二维码前缀文件夹
  miniProgramName: conf[env]['miniProgramName'], //小程序名称
  storeNo: conf[env]['singleStore'] ? conf[env]['storeNo'] : 'S0000000000', //单店铺的话需要配置店铺编号
  appName: remoteAddress.appName, // 服务 app
  getAuthorization: { //获取公众号授权
    url: remoteAddress.serviceAddress + '/wx/operate/srvwx_public_page_authorization',
    serviceName: 'srvwx_public_page_authorization'
  },
  verifyLogin: { //公众号/小程序验证登录
    url: remoteAddress.serviceAddress + '/wx/operate/srvwx_app_login_verify',
    serviceName: 'srvwx_app_login_verify'
  },
  accountLogin: { //公众号/小程序账号登录
    url: remoteAddress.serviceAddress + '/wx/operate/srvwx_app_login',
    serviceName: 'srvwx_app_login'
  },
  getSignature: remoteAddress.serviceAddress + '/wx/select/srvwx_app_signature_select', //获取js-sdk签名
  getUserInfo: remoteAddress.serviceAddress + '/wx/select/srvwx_basic_user_info_select', //获取用户信息
  saveShareRecord: remoteAddress.serviceAddress + '/daq/add/srvdaq_record_share_add', //保存微信分享记录
  downloadFile: remoteAddress.fileSrv + '/file/download?fileNo=', // 根据fileNo直接下载图片，不用查找filePath
  fileSrv: remoteAddress.fileSrv,
  /**
   * 新旧api 分割线—————————————————————————————————————————————————————————— old 
   * */
  backUrl: remoteAddress.ssourl, // 授权域名
  serverURL: remoteAddress.serviceAddress, // 后台地址
  // serverURLTest: remoteAddress.serviceAddressTest, // 后台地址
  refuseCode: '0111', // 后台拒绝识别码
  byCode: '1111', // 后台通过码
  byState: 'SUCCESS', // 状态码
  srvHost: remoteAddress.serviceAddress,
  bindLogin: 'bind_login', // 授权成功,请登录绑定账号
  authorizedLoginSuccess: 'authorized_login_success', // 授权成功,可以直接请求业务数据
  ssoAuthor: remoteAddress.serviceAddress + '/wx/operate/', // sso授权地址
  savewxuser: remoteAddress.ssoAddress + '/wx/savewxuser', // sso保存微信用户
  getOpendId: remoteAddress.ssoAddress + '/wx/getOpendId', // sso保存微信用户 /wx/getOpendId
  // 测试地址
  testssoAuthor: remoteAddress.testUrl + '/wx/authorize', // sso授权地址
  testsavewxuser: remoteAddress.testUrl + '/wx/savewxuser', // sso保存微信用户
  testgetOpendId: remoteAddress.testUrl + '/wx/getOpendId', // sso保存微信用户 /wx/getOpendId
  testgetSignature: remoteAddress.testUrl + '/wx/getSignature', // sso保存微信用户 /wx/getSignature ,
  untied: remoteAddress.ssoAddress + '/wx/untied', // 微信解绑 http://Ip:port/wx/untied
  loginAuthor: remoteAddress.ssoAddress + '/bindlogin', // 微信绑定登录地址http://Ip:port/bindlogin
  getImg: remoteAddress.assetsUrl + '/main/', // 图片地址
  downloadImg: remoteAddress.fileSrv + '/download?filePath=', // 图片地址
  getFilePath: remoteAddress.fileSrv + '/file/download?filePath=', // 文件路径地址
  select: remoteAddress.serviceAddress + '/bxsys/select', // 查询接口
  toLogin: remoteAddress.ssoAddress + '/bxsyslogin', // 用户相关接口
  selectByUser: remoteAddress.serviceAddress + '/bxsys/srvms.100xsys.cn', // 用户菜单
  selectOne: remoteAddress.serviceAddress + '/bxsys/selectOne', // 产品相关接口
  startProc: remoteAddress.serviceAddress + '/bxsys/startProc', // 流程开启
  approval: remoteAddress.serviceAddress + '/bxsys/approval', // 流程开启
  startDataProc: remoteAddress.serviceAddress + '/bxsys/startDataProc', // 流程子开启
  add: remoteAddress.serviceAddress + '/bxsys/operate', // 新增
  update: remoteAddress.serviceAddress + '/bxsys/operate', // 修改
  saveDraft: remoteAddress.serviceAddress + '/bxsys/saveDraft', // 保存草稿
  upload: remoteAddress.serviceAddress + '/file/upload',
  file: remoteAddress.serviceAddress + '/file/',
  deleteFile: remoteAddress.fileSrv + '/file/delete', // 删除文件
  onTicket: remoteAddress.onTicket,
  ticket: remoteAddress.bx_auth_ticket,
  unbindWxUser: remoteAddress.serviceAddress + '/wx/operate/srvwx_user_unbind', //解绑已有账号
  bindWxUser: remoteAddress.serviceAddress + "/wx/operate/srvwx_user_bind" // 绑定已有帐号
}
export default ENV
