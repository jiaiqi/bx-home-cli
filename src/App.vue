<script>
  import Vue from 'vue';
  export default {
    globalData: {
      globalTextFontSize: 18,
      statusBarHeight: uni.getSystemInfoSync()['statusBarHeight'], // 获取导航栏的高度
      room_no: "", //酒店房间编号
      pt_no: "", //二维码参数编号
      beforeRedirectUrl: "",
      systemInfo: uni.getSystemInfoSync()
    },
    onLaunch(options) {
      if (options?.query?.bx_auth_ticket) {
        uni.setStorageSync('bx_auth_ticket',options.query.bx_auth_ticket)
        this.$store.commit('SET_TICKET', options.query.bx_auth_ticket)
      }
      this.$store.commit('SET_SCENE', options.scene)
      if (options.scene === 1154) {
        // 朋友圈单页模式进入
        return
      }
      console.log(process.env, '---process.env')
      this.checkUpdate()
      this.checkOptionParams(options)
      this.judgeClientEnviroment();
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
  @import "./static/iconfont.css"; //引入字体文件
  @import "colorui/main.css";
  @import "colorui/icon.css";
  @import "uview-ui/index.scss";
  // @import "@/common/uni.css";
  @import "@/common/theme/theme.scss";

  /*每个页面公共css */
  // --page-height:calc(100vh - var(--window-top) - var(--window-bottom))
  #app,
  uni-page-body,
  uni-page-wrapper {
    // background: #fff !important;
  }

  /* #ifdef H5 */
  uni-page-head {
    display: none !important;
  }

  .uni-page-head {
    display: none !important;
  }

  .cu-dialog {
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
</style>
