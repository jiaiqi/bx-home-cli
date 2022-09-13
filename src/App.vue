<script>
  import Vue from 'vue';
  import {
    selectPersonInfo
  } from '@/common/api/login.js'
  export default {
    globalData: {
      globalTextFontSize: 18,
      statusBarHeight: uni.getSystemInfoSync()['statusBarHeight'], // 获取导航栏的高度
      room_no: "", //酒店房间编号
      pt_no: "", //二维码参数编号
      service_place_no: "", //场地编号
      placeInfo: "", //场地信息
      beforeRedirectUrl: "",
      systemInfo: uni.getSystemInfoSync(),
      firstSwiperListOrder: null,
      scene: ''
    },
    onLaunch(options) {
      if (options?.query?.bx_auth_ticket) {
     
        uni.setStorageSync('bx_auth_ticket', options.query.bx_auth_ticket)
        uni.setStorageSync('isLogin', true)
        this.$store.commit('SET_TICKET', options.query.bx_auth_ticket)
        if (options?.query?.login_user_info) {
          try {
            let login_user_info = JSON.parse(options?.query?.login_user_info)
            if (login_user_info?.user_no) {
              uni.setStorageSync('login_user_info', login_user_info)
            }
          } catch (err) {

          }
        }
      }

      if (options?.query?.user_no) {
        selectPersonInfo(options?.query?.user_no);
      }

      if (options?.query?.storeUserNo) {
        this.getStoreUserByNo(options?.query?.storeUserNo)
      }

      this.$store.commit('SET_SCENE', options.scene)
      if (options.scene === 1154) {
        // 朋友圈单页模式进入
        return
      }
      
      console.log(process.env, '---process.env')
      this.checkUpdate()
      this.checkOptionParams(options?.query)
      this.initClientEnv();
      uni.setStorageSync('isThirdParty', this.$api.isThirdParty);
      uni.getSystemInfo({
        success: function(e) {
          // #ifndef MP
          Vue.prototype.StatusBar = e.statusBarHeight;
          if (e.platform == 'android') {
            Vue.prototype.CustomBar = e.statusBarHeight + 50;
          } else {
            Vue.prototype.CustomBar = e.statusBarHeight + 45;
          }
          // #endif

          // #ifdef MP-WEIXIN
          Vue.prototype.StatusBar = e.statusBarHeight;
          let custom = wx.getMenuButtonBoundingClientRect();
          Vue.prototype.Custom = custom;
          Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
          // #endif

          // #ifdef MP-ALIPAY
          Vue.prototype.StatusBar = e.statusBarHeight;
          Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
          // #endif
        }
      });
    },
    methods: {
      async getStoreUserByNo(storeUserNo) {
        let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
        let req = {
          serviceName: 'srvhealth_store_user_select',
          colNames: ['*'],
          condition: [{
            colName: 'store_user_no',
            ruleType: 'eq',
            value: storeUserNo
          }]
        };

        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.$store.commit('SET_STORE_USER', res.data.data[0]);
          if (res.data.data[0].store_no) {
            this.$store.commit('setStateAttr', {
              key: "curStoreNo",
              val: res.data.data[0].store_no
            })
            this.getStore_()
          }
          return res.data.data;
        }
        return res
      },
      checkUpdate() {
        const updateManager = uni.getUpdateManager();
        updateManager.onCheckForUpdate(function(res) {
          // 请求完新版本信息的回调
          console.log('小程序需要进行更新？', res.hasUpdate);
        });
        updateManager.onUpdateReady(function() {
          uni.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success(res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            }
          });
        });
        updateManager.onUpdateFailed(function() {
          // 新的版本下载失败
          uni.showModal({
            title: '更新提示',
            content: '版本更新失败,请检查网络状态',
            showCancel: false
          });
        });
      }
    },
    onShow: async function(options) {
      if (this.$api.singleApp) {
        uni.setStorageSync('activeApp', this.$api.appName);
      }
      console.log('App Show');
    },
    onHide: function() {
      console.log('App Hide');
    }
  };
</script>

<style lang="scss">
  @import "colorui/main.css";
  @import "colorui/icon.css";
  @import "uview-ui/index.scss";
  @import "@/common/theme/theme.scss";
  /* #ifdef H5 */
  @import "@/common/uni.css";
  @import "@/common/uni-nvue.css";
  /* #endif */

  @supports (top: constant(safe-area-inset-top)) {
    :root {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }

    page {
      --safe-area-inset-top: constant(safe-area-inset-top);
      --safe-area-inset-right: constant(safe-area-inset-right);
      --safe-area-inset-bottom: constant(safe-area-inset-bottom);
      --safe-area-inset-left: constant(safe-area-inset-left);
    }

  }

  @supports (top: env(safe-area-inset-top)) {
    :root {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }

    page {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }
  }


  /*每个页面公共css */
  #app,
  uni-page-body,
  uni-page-wrapper {
    // background: #fff !important;
  }

  uni-image {
    width: 100%;
    height: 100%;
  }

  /* #ifdef H5 */
  uni-page-head {
    display: none !important;
  }

  .uni-page-head {
    display: none !important;
  }

  .bottom-modal {}

  .cu-dialog:not(.bottom-modal>.cu-dialog):not(.top-modal>.cu-dialog) {
    width: calc(100% - 20px) !important;
    max-width: 800px;
  }

  /* #endif */
  html,
  body {
    height: auto;
    // background: #fff !important;
  }

  uni-page-body>uni-view {
    height: 100%;
  }

  .button-box {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20rpx;

    .button {
      min-width: 45%;
      position: relative;
      border: 0px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 0 15px;
      font-size: 14px;
      height: 32px;
      line-height: 1;
      text-align: center;
      text-decoration: none;
      overflow: visible;
      margin-left: initial;
      margin-right: initial;
    }
  }
  
  .text-over-hidden-ellipsis{
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
