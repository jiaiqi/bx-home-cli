<template>
  <view class="authorization">
    <view class="container">
      <view class="right-top-sign"></view>
      <!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
      <view class="wrapper">
        <view class="account-login" v-if="loginType==='account'">
          <view class="welcome">
            <!-- #ifdef H5||APP-PLUS -->
            <text>你好, 欢迎使用！</text>
            <!-- #endif -->
            <!-- <text v-if="(client_env === 'wxh5' || client_env === 'wxmp') && !isShowUserLogin">请授权微信登录</text> -->
          </view>
          <view class="input-content" v-if="(client_env === 'wxmp'&&isWxUser)||client_env !== 'wxmp'">
            <view class="input-item">
              <text class="cuIcon-people margin-right"></text>
              <input type="text" v-model="user.user_no" placeholder="请输入帐号" maxlength="50" data-key="mobile"
                @input="inputChange" />
            </view>
            <view class="input-item">
              <text class="cuIcon-lock margin-right"></text>
              <input type="mobile" v-model="user.pwd" placeholder="请输入密码" placeholder-class="input-empty" maxlength="50"
                password data-key="password" @input="inputChange" @confirm="userLogined" v-if="!eye_show" />
              <input type="mobile" v-model="user.pwd" placeholder="请输入密码" placeholder-class="input-empty" maxlength="50"
                data-key="password" @input="inputChange" @confirm="userLogined" v-if="eye_show" />
              <image src="./hi_eye.png" mode="" v-if="eye_show" @click="eyeClick"></image>
              <image src="./show_eye.png" mode="" v-if="!eye_show" @click="eyeClick"></image>
            </view>
          </view>

          <!--      <checkbox-group @change="checkboxChange" class="" style="display: flex;justify-content: flex-end;">
            <label
              style="width: 100%;display: flex;justify-content: space-between;margin: 0 auto;margin-top: 10px;padding: 0 30px;">
              <checkbox class="" value="cd" :checked="checkValue" style="margin-right: 5px;transform: scale(0.7);" />
              <text>记住密码</text>
            </label>
          </checkbox-group> -->


          <view class="text-center" v-if="client_env==='wxmp' &&isSysUser">
            您已经绑定账号，点击下方按钮解绑
          </view>
          <debounce-view type="throttle" @onThrottle="unbindWxUser" v-if="client_env==='wxmp' && isSysUser">
            <button class="confirm-btn bg-blue text-green">
              解绑
            </button>
          </debounce-view>

          <debounce-view type="throttle" @onThrottle="userLogined" v-else>
            <button class="confirm-btn bg-blue text-green">
              {{ isBindUser&&isWxUser ? '提交绑定' : '登录' }}
            </button>
          </debounce-view>

          <!--      <button class="confirm-btn bg-blue text-green" @click="userLogined">
            {{ isBindUser ? '提交绑定' : '登录' }}
          </button> -->
          <!--    <button class="confirm-btns" @click="showScan">
            <text class="cuIcon-scan margin-right"></text>
            扫码登录
          </button> -->
          <button v-if="(client_env === 'wxh5' || client_env === 'wxmp') && !isShowUserLogin"
            class="confirm-btn bg-gray text-green" lang="zh_CN" type="primary" open-type="getUserInfo"
            @getuserinfo="saveWxUser" :withCredentials="false" :disabled="!isWeixin">
            微信用户一键登录
          </button>
          <button v-if="(client_env === 'wxh5' || client_env === 'wxmp') && !isShowUserLogin"
            class="confirm-btn bg-grey text-black" type="default" @tap="navBack" :disabled="false">
            暂不登录
          </button>
        </view>
        <!-- #ifdef H5||APP-PLUS -->
        <view class="qrcode-login" v-if="loginType==='weixin-qrcode'">
          <div id="login_container" class="login_container"></div>
          <div style="text-align: center;"> （注意是用摄像头扫码，不是长按识别二维码）</div>
        </view>
        <view class="switch-login-type">
          其它方式登录
        </view>
        <view class="login-type-box" v-if="loginType==='account'">
          <text class="cuIcon-weixin text-green login-type" @click="changeLoginType('weixin-qrcode')"></text>
        </view>
        <view class="login-type-box" v-else>
          <text class="cuIcon-mobilefill text-blue login-type" @click="changeLoginType('account')"></text>
        </view>
        <!-- #endif -->
      </view>

    </view>
    <!-- #ifdef MP-WEIXIN -->
    <!-- <bx-auth @auth-complete="initPage"></bx-auth> -->
    <!-- #endif -->
  </view>
</template>

<script>
  import {
    debounce
  } from '@/common/func/util.js'
  export default {
    // 账号授权页面
    name: 'AccountExec',
    computed: {
      isSysUser() {
        return this.vloginUser?.login_user_type === 'user'
      },
      isWxUser() {
        return this.vloginUser?.login_user_type === 'wx_user'
      }
    },
    data() {
      return {
        showLoginQrCode: false,
        isWeixin: this.isWeixinClient(),
        backUrl: '',
        user: {
          user_no: '',
          pwd: ''
        },
        isShowUserLogin: true,
        client_env: uni.getStorageSync('client_env'),
        isThirdParty: uni.getStorageSync('isThirdParty'), // 是否需要第三方认证
        isBindUser: false,
        showAllMenu: false,
        checkValue: false,
        eye_show: false,
        loginType: 'account', //account,weixin-qrcode
      };
    },
    created() {
      // #ifdef H5
      let self = this;
      let pwd = localStorage.getItem('pwd')
      let user_no = localStorage.getItem('user_no')
      if (pwd && user_no) {
        self.user.user_no = localStorage.getItem('user_no')
        self.user.pwd = localStorage.getItem('pwd')
      }
      // #endif
    },
    onLoad(option) {
      // #ifdef MP-WEIXIN
      if (option.loginType && option.isBindUser) {
        this.loginType = option.loginType;
        this.isBindUser = true
        return
      }
      // #endif
      // #ifdef H5
      if (uni.getStorageSync('isLogin')) {
        console.log('已登录，不进行初始化授权', uni.getStorageSync('isLogin'));
        if (uni.getStorageSync('backUrl') && uni.getStorageSync('backUrl') !== '/' && uni.getStorageSync(
            'backUrl') !== '/fyzh/') {
          uni.redirectTo({
            url: uni.getStorageSync('backUrl')
          });
        } else {
          uni.redirectTo({
            url: this.$api.homePath
          });
        }
      } else {
        console.log('onLoad 未登录，进行初始化授权', uni.getStorageSync('isLogin'));
        // self.initLogin();
      }
      let isWeixinClient = this.isWeixinClient();
      let isLogin = uni.getStorageSync('isLogin')

      if (isWeixinClient) {
        // 微信公众号环境 , 静默登录
        // this.loginType = 'weixin-qrcode'

        let href = window.location.href;
        // if (href.indexOf('code=') !== -1 && href.indexOf('&state=') !== -1) {
        //   let queryStart = href.indexOf('?code=');
        //   let queryEnd = href.indexOf('#/');
        //   let urlLeft = href.substring(0, queryStart);
        //   let urlRight = href.substring(queryEnd);
        //   let queryContent = href.substring(queryStart, queryEnd)
        //   console.log('href',href)
        //   console.log('urlLeft',urlLeft)
        //   console.log('urlRight',urlRight)
        //   console.log('queryContent',queryContent)
        //   window.location.href = urlLeft + '#/publicPages/accountExec/accountExec' + queryContent
        // }
        if (href.includes("/?code=")) { //url包括 /?code 证明为从微信跳转回来的
          // var url = href.substring(0, href.length - 2); //vue自动在末尾加了 #/ 符号，截取去掉
          var url = href.substring(0, href.length - 37);
          var jingPosit = url.indexOf("/health/") + 8; //获取域名结束的位置
          var urlLeft = url.substring(0, jingPosit); //url左侧部分
          var urlRight = url.substring(jingPosit, url.length); //url右侧部分
          console.log('url', url)
          console.log('jingPosit', jingPosit)
          console.log('urlLeft', urlLeft)
          console.log('urlRight', urlRight)
          window.location = urlLeft + '#/publicPages/accountExec/accountExec' + urlRight; //拼接跳转
        }
        if (option.code && option.state) {
          this.initLogin(option)
        } else if (this.$route.query?.code && this.$route.query?.state) {
          this.initLogin(this.$route.query)
        } else {
          this.initLogin(option)
        }
      }
      // else {
      if (uni.getSystemInfoSync().model === 'PC') {
        if (option.code && option.state) {
          // 扫码登陆重定向
          this.scanLogin(option)
        } else if (this.$route.query?.code && this.$route.query?.state) {
          this.scanLogin(this.$route.query)
        } else {
          this.getScanQrCode()
        }
      } else {
        this.loginType = 'account'
      }
      // }
      // #endif
    },
    methods: {
      initPage(e) {
        uni.navigateBack()
      },
      changeLoginType(e) {
        this.loginType = e
        if (e === 'weixin-qrcode') {
          let isWeixinClient = this.isWeixinClient();
          if (isWeixinClient) {
            // 微信公众号环境 , 静默登录
            this.initLogin()
          } else {
            this.getScanQrCode()
          }
        }
      },
      eyeClick() {
        this.eye_show = !this.eye_show
      },
      checkboxChange(e) {
        this.checkValue = !this.checkValue
        console.log(this.checkValue)
      },
      async getScanQrCode() {
        let sysInfo = uni.getSystemInfoSync()
        if (sysInfo?.model === 'PC') {
          return
        }
        let pages = getCurrentPages();
        let fullPath = ''
        if (pages.length > 1) {
          fullPath = pages[pages.length - 2] ? pages[pages.length - 2].__page__?.fullPath : ''
        }
        var loginBackurl = fullPath;
        // var loginBackurl = window.location.origin + `/health/#${fullPath}`;
        var callbackurl = window.location.origin + `/health/#/publicPages/accountExec/accountExec`;
        uni.setStorageSync('loginBackurl', loginBackurl)
        var cssUrl = 'https://login.100xsys.cn/main/css/loginqrcode.css'
        var request = {};
        request.serviceName = "srvwx_web_scan_cfg_select";
        request.colNames = ["*"];
        request.condition = [{
          "colName": "callbackurl",
          "value": callbackurl
        }];
        let res = await this.onRequest("select", "srvwx_web_scan_cfg_select", request, "wx")
        if (res.data.state === 'SUCCESS') {
          var data = res.data.data[0];
          var obj = new WxLogin({
            self_redirect: false,
            id: "login_container",
            appid: data.appid,
            scope: "snsapi_login",
            redirect_uri: data.callbackurl,
            state: data.state,
            style: "black",
            href: cssUrl
          });
        }
      },
      async scanLogin(e) {
        const {
          code,
          state
        } = e
        let data = {};
        data["code"] = code;
        data["state"] = state;
        var request = {};
        request.serviceName = "srvwx_web_scan_auth";
        request.data = [];
        request.data.push(data);
        var bxRequest = [];
        bxRequest.push(request);
        console.log('scanLogin', e)
        let res = await this.onRequest("operate", "srvwx_web_scan_auth", bxRequest, "wx")
        if (res.data.state === 'SUCCESS') {
          var resp = res.data.response[0];
          var bx_auth_ticket = resp.response.bx_auth_ticket;
          console.log('scanLogin-resp', resp)
          var current_login_user = resp.response.login_user_info;
          uni.setStorageSync("bx_auth_ticket", bx_auth_ticket);
          uni.setStorageSync("isLogin", true);
          uni.setStorageSync("login_user_info", current_login_user);
          top.user = current_login_user;
          if (resp.response?.expire_time) {
            let expire_timestamp = parseInt(new Date().getTime() / 1000) +
              resp.response.expire_time; //过期时间的时间戳(秒)
            uni.setStorageSync('expire_time', resp.response.expire_time); // 有效时间
            uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
          }
          let pages = getCurrentPages();
          let fullPath = ''
          if (pages.length > 1) {
            fullPath = pages[pages.length - 2] ? pages[pages.length - 2].__page__?.fullPath : ''
          }
          var loginBackurl = uni.getStorageSync('loginBackurl') || '/storePages/home/home?store_no=S0000000000'
          // var loginBackurl = uni.getStorageSync('loginBackurl') || '/pages/index/index'
          // var callbackurl = window.location.origin + `/health/#${fullPath}`;
          uni.reLaunch({
            url: loginBackurl
          })
        }
      },
      showScan() {
        this.showLoginQrCode = !this.showLoginQrCode
      },
      navBack() {
        uni.navigateBack({
            animationDuration: 200
          })
          .then()
          .catch(e => {
            uni.redirectTo({
              url: '/pages/basics/home/home'
            });
          });
      },
      inputChange(e) {
        // console.log(e)
      },
      initLogin(query) {
        let that = this;
        let code = null;
        // 公众号环境
        code = this.$route?.query?.code;
        let isLogin = uni.getStorageSync('isLogin');
        console.log('是否绑定账号:', isLogin);
        let isWeixinClient = this.isWeixinClient();
        const client_env = uni.getStorageSync('client_env');
        console.log('是否微信环境', isWeixinClient);
        if (!isLogin) {
          if (isWeixinClient) {
            return
            //微信环境(小程序或者公众号)
            if (code || client_env === 'wxmp') {
              // 已经得到code,进行验证登录
              console.log('已获取到code,即将进行验证登录');
              this.saveWxUser(query);
            } else if (!code) {
              //公众号 未授权 -> 获取授权
              console.log('未发现code,尝试获取重定向链接');

              that.getAuthorized();
            }
          } else if (!isWeixinClient) {
            // 非微信环境(H5或APP)
            uni.showToast({
              title: '请在微信中访问此页面',
              icon: 'none',
              duration: 3000
            });
          }
        } else {
          let loginBackurl = uni.getStorageSync('loginBackurl');
          console.log('that.backUrl', that.backUrl, '===');
          if (loginBackurl && loginBackurl.indexOf('accountExec') == -1) {
            // url = that.getDecodeUrl(url);
            // if (url && url.lastIndexOf('backUrl=') !== -1) {
            //   url = url.substring(url.lastIndexOf('backUrl=') + 8, url.length);
            // }
            uni.reLaunch({
              url: loginBackurl
            });
          } else {
            uni.reLaunch({
              url: that.$api.homePath
            });
          }
        }
      },
      async getAuthorized() {
        let self = this;
        // 公众号环境获取回调地址(在回调地址中获取code)
        let url = self.getServiceUrl('wx', 'srvwx_public_page_authorization', 'operate');
        let redirect_uri = self.$api.frontEndAddress.replace('/#/', '/')
        let req = [{
          data: [{
            app_no: self.$api.appNo.wxh5,
            redirect_uri: self.$api.frontEndAddress
          }],
          serviceName: 'srvwx_public_page_authorization'
        }];
        let burl = uni.getStorageSync('backUrl');
        const res = await this.$http.post(url, req)
        console.log(res)
        try {
          if (response?.data?.response[0]?.response?.authUrl) {
            window.location.href = response.data.response[0].response.authUrl;
          } else {
            uni.showToast({
              title: response.data.resultMessage,
              icon: 'none'
            });
          }
        } catch (e) {
          //TODO handle the exception
    
        }
        this.$http.post(url, req).then(response => {
          if (response.data.response[0].response.authUrl) {
            let fullPath = uni.getStorageSync('loginBackurl')
            if (!fullPath) {
              let pages = getCurrentPages()
              if (pages.length > 1) {
                fullPath = pages[pages.length - 2] ? pages[pages.length - 2].__page__?.fullPath : ''
                if (fullPath && fullPath.indexOf('/publicPages/accountExec/accountExec') == -1) {
                  uni.setStorageSync('loginBackurl', fullPath)
                }
              }
            }
            window.location.href = response.data.response[0].response.authUrl;
          } else {
            uni.showToast({
              title: response.data.resultMessage,
              icon: 'none'
            });
          }
        });
      },
      saveWxUser(query) {
        // 静默登录(验证登录)
        let that = this;
        const isWeixinClient = that.isWeixinClient();
        if (isWeixinClient) {
          const url = this.getServiceUrl('wx', 'srvwx_app_login_verify', 'operate');
          // #ifdef MP-WEIXIN
          wx.login({
            // 获取小程序code
            success(res) {
              if (res.code) {
                // that.checkAuthorization();
                //验证登录
                let url = that.$api.verifyLogin.url;
                let req = [{
                  data: [{
                    code: res.code,
                    app_no: that.$api.appNo.wxmp
                  }],
                  serviceName: 'srvwx_app_login_verify'
                }];
                that.$http.post(url, req).then(response => {
                  if (response.data.resultCode === 'SUCCESS') {
                    uni.hideLoading();
                    console.log('授权成功', response);
                    let resData = response.data.response[0].response;
                    let loginMsg = {
                      bx_auth_ticket: resData.bx_auth_ticket,
                      expire_time: resData.expire_time
                    };
                    let expire_timestamp = parseInt(new Date().getTime() / 1000) +
                      loginMsg.expire_time; //过期时间的时间戳(秒)

                    uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
                    uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
                    uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
                    if (resData.login_user_info.user_no) {
                      uni.setStorageSync('login_user_info', resData.login_user_info);
                      console.log('resData.login_user_info', resData
                        .login_user_info);
                    }
                    if (resData.login_user_info.data) {
                      uni.setStorageSync('visiter_user_info', resData.login_user_info
                        .data[0]);
                    }
                    uni.setStorageSync('isLogin', true);
                    console.log('that.backUrl', that.backUrl);

                    // 获取用户微信信息
                    that.getUserInfo();
                    uni.redirectTo({
                      url: that.$api.homePath
                    });
                  } else if (response.data.resultCode === 'FAILURE') {
                    uni.setStorageSync('isLogin', false);
                    uni.showToast({
                      title: response.data.resultMessage
                    });
                  }
                });
              } else {
                uni.setStorageSync('isLogin', false); // 登录状态
                console.log('登录失败！' + res.errMsg);
              }
            }
          });
          // #endif
          // #ifdef H5
          // 公众号环境
          let req = [{
            data: [{
              code: query?.code || that.$route.query.code,
              app_no: that.$api.appNo.wxh5
            }],
            serviceName: 'srvwx_app_login_verify'
          }];

          that.$http.post(url, req).then(response => {
            console.log('srvwx_app_login_verify', response)
            if (response.data.resultCode === 'SUCCESS' && response.data.response[0].response) {
              console.log('授权成功', response);
              let resData = response.data.response[0].response;
              let loginMsg = {
                bx_auth_ticket: resData.bx_auth_ticket,
                expire_time: resData.expire_time
              };

              if (resData.login_user_info.login_user_type === 'wx_user') {
                that.isBindUser = true // 是否需要引导绑定
                uni.setStorageSync('isLogin', true);
                console.log('登录成功', uni.getStorageSync('isLogin'), resData);
                let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg
                  .expire_time; //过期时间的时间戳(秒)
                uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
                uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
                uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
                if (resData.login_user_info && resData.login_user_info.user_no) {
                  uni.setStorageSync('login_user_info', resData.login_user_info);
                  console.log('resData.login_user_info', resData.login_user_info);
                }
                if (that.checkValue) {
                  localStorage.setItem('user_no', that.user.user_no)
                  localStorage.setItem('pwd', that.user.pwd)
                }
                if (resData.login_user_info && resData.login_user_info.data) {
                  uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
                }
                uni.showModal({
                  title: '提示',
                  content: '是否继续绑定已有系统帐号？',
                  cancelText: "不用了",
                  confirmText: "是",
                  success: function(res) {
                    if (res.confirm) {
                      that.isBindUser = true
                    } else if (res.cancel) {
                      console.log('用户点击取消');
                      let loginBackurl = uni.getStorageSync('loginBackurl')
                      if (loginBackurl && loginBackurl.indexOf('accountExec') == -1) {
         
                        console.log("授权成功，准备返回用户界面url", url)
                        // }

                        uni.reLaunch({
                          url: loginBackurl,
                          fail() {
                            uni.reLaunch({
                              url: '/' + loginBackurl,
                            })
                          }
                        })
                      } else {
                        uni.reLaunch({
                          url: that.$api.homePath
                        })
                      }
                    }
                  }
                });
              } else {
                uni.setStorageSync('isLogin', true);
                console.log('登录成功', uni.getStorageSync('isLogin'), resData);
                let expire_timestamp = parseInt(new Date().getTime() / 1000) + loginMsg
                  .expire_time; //过期时间的时间戳(秒)
                uni.setStorageSync('expire_time', resData.expire_time); // 有效时间
                // let expire_timestamp = parseInt(new Date().getTime() / 1000) + 10; //过期时间的时间戳(秒)
                // uni.setStorageSync('expire_time', 10); // 有效时间
                uni.setStorageSync('bx_auth_ticket', resData.bx_auth_ticket);
                uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
                if (resData.login_user_info && resData.login_user_info.user_no) {
                  uni.setStorageSync('login_user_info', resData.login_user_info);
                  console.log('resData.login_user_info', resData.login_user_info);
                }
                if (that.checkValue) {
                  localStorage.setItem('user_no', that.user.user_no)
                  localStorage.setItem('pwd', that.user.pwd)
                }
                if (resData.login_user_info && resData.login_user_info.data) {
                  uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
                  // this.$store.commit('setOpenid', resData.login_user_info.data[0].openid);
                }
                // 获取回调前记录的url 并再回调后 再次进入该url，没有该url时 进入 home
                // let url = uni.getStorageSync('backUrl');

                console.log('that.backUrl', that.backUrl, '===', url);
                uni.hideToast();
                uni.hideLoading();
                let loginBackurl = uni.getStorageSync('loginBackurl')
                if (loginBackurl && loginBackurl !== '/' && loginBackurl.indexOf('accountExec') == -1) {
                
                  uni.reLaunch({
                    url: loginBackurl,
                    fail() {
                      uni.reLaunch({
                        url: '/' + loginBackurl,
                      })
                    }
                  })
                } else {
                  uni.reLaunch({
                    url: that.$api.homePath
                  });
                }
              }


            } else {
              uni.setStorageSync('isLogin', false);
              console.log('授权失败');
              // uni.showToast({
              // 	title:'授权失败',
              // 	icon:'none'
              // })
            }
          });

          // #endif
        }
      },
      getUserInfo: function(loginType, cb) {
        let self = this;
        wx.login({
          success: function() {
            wx.getUserInfo({
              success: function(res) {
                self.setWxUserInfo(res.userInfo);
                uni.setStorageSync('wxuserinfo', res.userInfo);
                console.log(res);
              },
              fail: function() {
                //3.授权友好提示
                wx.showModal({
                  title: '提示',
                  content: '您还未授权登陆，部分功能将不能使用，是否重新授权？',
                  showCancel: true,
                  cancelText: '不用了',
                  confirmText: '是',
                  success: function(res) {
                    //4.确认授权调用wx.openSetting
                    if (res.confirm) {
                      if (wx.openSetting) {
                        //当前微信的版本 ，是否支持openSetting
                        wx.openSetting({
                          success: res => {
                            if (res
                              .authSetting[
                                'scope.userInfo'
                              ]) {
                              //如果用户重新同意了授权登录
                              wx.getUserInfo({
                                success: function(
                                  res
                                ) {
                                  uni.setStorageSync(
                                    'wxuserinfo',
                                    res
                                    .userInfo
                                  );
                                  console
                                    .log(
                                      res
                                    );
                                  self.setWxUserInfo(
                                    res
                                    .userInfo
                                  );
                                }
                              });
                            } else {
                              //用户还是拒绝
                              console
                                .log(
                                  res
                                );
                            }
                          },
                          fail: function() {
                            //调用失败，授权登录不成功
                          }
                        });
                      } else {
                        console.log(res);
                      }
                    } else {
                      console.log(res);
                    }
                  }
                });
              }
            });
          }
        });
      },

      async userLogined() {
        let that = this;
        if (this.isBindUser && this.client_env === 'wxmp') {
          let res = await this.bindWxUser(this.user)
          return
        }
        let url = that.getServiceUrl('sso', 'srvuser_login', 'operate');
        let req = [{
          serviceName: 'srvuser_login',
          data: [that.user]
        }];

        if (that.isInvalid(that.user.user_no) && that.isInvalid(this.user.pwd)) {
          let response = await that.$http.post(url, req);
          console.log('srvuser_login', response);
          if (response.data.state === 'SUCCESS' && response.data.response[0].response) {
            let res = response.data.response[0].response;
            let expire_timestamp = parseInt(new Date().getTime() / 1000) + res.expire_time; //过期时间的时间戳(秒)
            uni.setStorageSync('bx_auth_ticket', res.bx_auth_ticket);
            this.$store.commit('SET_TICKET', res.bx_auth_ticket)
            uni.setStorageSync('expire_time', res.expire_time); // 有效时间
            uni.setStorageSync('expire_timestamp', expire_timestamp); // 过期时间
            if (res.login_user_info.user_no) {
              uni.setStorageSync('login_user_info', res.login_user_info);
              console.log('res.login_user_info', res.login_user_info);
              this.$store.commit('SET_LOGIN_USER', res.login_user_info)
            }

            if (res.login_user_info.data) {
              uni.setStorageSync('visiter_user_info', resData.login_user_info.data[0]);
            }
            uni.setStorageSync('isLogin', true);
            if (that.checkValue) {
              localStorage.setItem('user_no', that.user.user_no)
              localStorage.setItem('pwd', that.user.pwd)
            }

            console.log('that.backUrl', that.backUrl);

            console.log('userLogined', response.data);
            let url2 = uni.getStorageSync('backUrl');
            url2 = ''

            let model = getApp().globalData?.systemInfo?.model;
            // #ifdef H5
            url2 = ''
            let pages = getCurrentPages()
            url2 = pages[pages.length - 2] ? pages[pages.length - 2].__page__?.fullPath : ''
            if (url2) {
              if (url2.indexOf('/publicPages/accountExec/accountExec') !== -1) {
                url2 = that.$api.homePath
              }
              uni.reLaunch({
                url: url2,
                fail: () => {
                  url2 = that.$api.homePath
                  uni.reLaunch({
                    url: url2
                  })
                }
              })
            } else {
              let pages = getCurrentPages()
              if (pages.length === 1) {
                url2 = that.$api.homePath
                uni.reLaunch({
                  url: url2
                })
                return
              }
              uni.navigateBack({
                fail: (err) => {
                  console.log(err)
                }
              })
            }
            // #endif
            // #ifdef MP-WEIXIN
            url2 = url2 || that.$api.homePath
            // #endif
            uni.reLaunch({
              url: ` /${url2}`
            });
          } else {
            uni.showToast({
              title: response.data.resultMessage,
              icon:'none',
              duration: 2000
            });
          }
        } else {
          this.user.pwd = '';
          uni.showToast({
            title: '帐号或密码错误',
            duration: 2000
          });
        }
      }
    }
  };
</script>

<style lang="scss">
  .authorization {
    width: 100%;
    height: 100%;
    background-color: #fff;

    /* #ifdef H5 */
    @media screen and(min-width:600px) {
      background-color: #CCCED3;
      background: url(./bg.png) no-repeat;
      background-size: 100% 100%;
    }

    /* #endif */

    .images {
      width: 100%;
      margin: 50upx 0;
    }

    .text {
      width: 90%;
      display: block;
      text-align: center;
      padding: 20upx 5%;
    }

    .button-box {
      margin-top: 50upx;
      height: 200upx;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;

      .buttons {
        width: 70%;
        height: 70upx;
        line-height: 70upx;
        border-radius: 0upx;
        font-size: 30upx;
      }
    }
  }

  .container {
    padding-top: 25vh;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    // background: #fff;
    .switch-login-type {
      padding-top: 30px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      &::before {
        display: block;
        content: "";
        width: 20%;
        height: 1px;
        background-color: rgb(219, 219, 219);
        margin-right: 20px;
      }

      &::after {
        display: block;
        content: "";
        width: 20%;
        height: 1px;
        background-color: rgb(219, 219, 219);
        margin-left: 20px;
      }
    }

    .login-type-box {
      font-size: 30px;
      text-align: center;
      padding: 20px;
      z-index: 999;

      .login-type {
        cursor: pointer;
      }
    }
  }

  .wrapper {
    margin: 0 auto;
    max-width: 400px;
    position: relative;
    z-index: 90;
    background: #fff;
    padding-bottom: 40upx;
    border-radius: 8px;
    padding-bottom: 200upx;
    padding-bottom: 30px;
  }

  .back-btn {
    position: absolute;
    left: 40upx;
    z-index: 9999;
    /* padding-top: var(--status-bar-height); */
    top: 40upx;
    font-size: 40upx;
    /* color: $font-color-dark; */
  }

  .left-top-sign {
    font-size: 120upx;
    /* color: $page-color-base; */
    position: relative;
    left: -16upx;
  }

  .right-top-sign {
    position: absolute;
    top: 80upx;
    right: -30upx;
    z-index: 95;

    // &:before,
    // &:after {
    // 	display: block;
    // 	content: '';
    // 	width: 400upx;
    // 	height: 80upx;
    // 	background: #b4f3e2;
    // }

    &:before {
      transform: rotate(50deg);
      border-radius: 0 50px 0 0;
    }

    &:after {
      position: absolute;
      right: -198upx;
      top: 0;
      transform: rotate(-50deg);
      border-radius: 50px 0 0 0;
      /* background: pink; */
    }
  }

  .left-bottom-sign {
    position: absolute;
    left: -270upx;
    bottom: -320upx;
    border: 100upx solid #d0d1fd;
    border-radius: 50%;
    padding: 180upx;
  }

  .welcome {
    position: relative;
    // left: 50upx;
    // top: -90upx;
    font-size: 46upx;
    color: #333;
    text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
    padding: 20px;
    display: flex;
    justify-content: space-between;

    .switch-qrcode-login {
      background-color: #F3F4F6;
    }
  }

  .input-content {
    padding: 0 60upx;
  }

  .input-item {
    position: relative;
    display: flex;
    // flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 30upx;
    background: #F8F8FA;
    height: 80upx;
    border-radius: 8px;
    margin-bottom: 50upx;

    &:last-child {
      margin-bottom: 0;
    }

    .tit {
      height: 50upx;
      line-height: 56upx;
      /* font-size: $font-sm+2upx; */
      /* color: $font-color-base; */
    }

    input {
      height: 60upx;
      /* font-size: $font-base + 2upx; */
      /* color: $font-color-dark; */
      width: 100%;
      /* box-sizing: border-box;
			padding: 20upx; */
    }

    image {
      position: absolute;
      right: 17px;
      width: 24px;
      height: 24px;
    }
  }

  .confirm-btn {
    max-width: 200px;
    height: 76upx;
    line-height: 76upx;
    border-radius: 5px;
    margin-top: 70upx;
    /* background: $uni-color-primary; */
    color: #fff;

    /* font-size: $font-lg; */
    &:after {
      // border-radius: 100px;

    }
  }

  .confirm-btns {
    width: 550upx;
    height: 76upx;
    line-height: 76upx;
    border-radius: 50px;
    margin-top: 30upx;
    /* background: $uni-color-primary; */
    color: #0088FE;
    background: #fff;
    border: 1px solid #0088FE;

    /* font-size: $font-lg; */
    &:after {
      border-radius: 100px;
    }
  }

  .forget-section {
    /* font-size: $font-sm+2upx; */
    /* color: $font-color-spec; */
    text-align: center;
    margin-top: 40upx;
  }

  .register-section {
    position: absolute;
    left: 0;
    bottom: 50upx;
    width: 100%;
    /* font-size: $font-sm+2upx; */
    /* color: $font-color-base; */
    text-align: center;

    text {
      /* color: $font-color-spec; */
      margin-left: 10upx;
    }
  }

  .qrcode-login {
    width: 100%;
    height: 300px;
  }

  .login_container {
    text-align: center;
    width: 100%;
    height: 250px;
    overflow: hidden;
  }

  ::v-deep .uni-checkbox-input-checked {
    background-color: #007aff !important;
  }
</style>
