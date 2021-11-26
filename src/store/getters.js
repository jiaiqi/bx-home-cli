const getters = {
	isLogin:state=>state.app.isLogin,
	srvCol: state => state.app.srvCol,
	userInfo: state => state.user.userInfo,
	userList: state => state.user.userList,
	wxUserInfo: state => state.user.wxUserInfo,
	loginUserInfo: state => state.user.loginUserInfo,
	authSetting:state=>state.app.authSetting,
	env:state=>state.app.env,
	authBoxDisplay:state=>state.app.authBoxDisplay,
  btnBg:state=>{
    let obj = {
      bg:'',
      color:''
    }
    switch (state.app.theme){
      case 'red':
        obj.bg = '#FE5A3F'
        obj.color = '#fff'
        break;
    }
    return obj.bg
  },
  btnColor:state=>{
    let obj = {
      bg:'',
      color:''
    }
    switch (state.app.theme){
      case 'red':
        obj.bg = '#FE5A3F'
        obj.color = '#fff'
        break;
    }
    return obj.color
  },
}
export default getters
