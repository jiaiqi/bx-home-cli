<template>
  <view class="webview-page">
    <!-- #ifdef MP-WEIXIN -->
    <web-view :webview-styles="webviewStyles" :src="webUrl" @message="onMessage" @load="loadUrl"></web-view>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <iframe :src="webUrl" frameborder="0" style="width: 100vw;height: 100vh;"></iframe>
    <!-- #endif -->
  </view>
</template>

<script>
  export default {
    data() {
      return {
        webUrl: '',
        userno: '',
        webviewStyles: {
          progress: {
            color: '#FF3333'
          }
        }
      };
    },
    methods: {
      loadUrl(e) {
        // 获取url
        const src = e?.detail?.src;
        const query = src.split('?')[1] || '';
        console.log('webViewLoad:',e)
        // // 检测url参数中是否有指定的参数
        // const isJump = query.indexOf('word=jump');
        // // 检测到指定值执行跳转逻辑
        // if (isJump >= 0) {
        //   wx.navigateTo({
        //     url: '/index/index'
        //   })
        // }
      },
      onMessage(e) {
        console.log('webview-onMessage:', e)
      }
    },
    onUnload() {
      uni.$emit('backFromWebview')
    },
    onHide() {
      uni.$emit('backFromWebview')
    },
    beforeDestroy() {
      uni.$emit('backFromWebview')
      this.checkSubscribeStatus()
      this.toAddPage()
    },
    onLoad(option) {
      if (option.webUrl) {
        let url = decodeURIComponent(option.webUrl)
        url = this.renderStr(url, this)
        console.log(url)
        // #ifdef H5
        if (url && url.indexOf('https://login.100xsys.cn/health/#') == 0) {
          let navUrl = url.replace('https://login.100xsys.cn/health/#', '')
          uni.redirectTo({
            url: navUrl
          })
          return
        }
        // #endif

        if (url && url.indexOf('100xsys.cn') > -1) {
          if (url.indexOf('?') == -1) {
            url += `?bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
          } else {
            url += `&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
          }
        }

        let login_user_info = uni.getStorageSync('login_user_info')

        if (login_user_info?.user_no) {
          let info = {
            user_no: login_user_info.user_no,
            roles: login_user_info.roles,
            user_type: login_user_info.user_type,
            real_name: login_user_info.real_name
          }
          url += `&login_user_info=${encodeURIComponent(JSON.stringify(info))}`
        }

        let userInfo = this.userInfo;
        if (userInfo?.userno) {
          url += `&userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`
        }
        
        url += '&from=inweapp'
        
        if(url&&url.indexOf('storeUserNo')==-1){
          url+=`&storeUserNo=${this.vstoreUser.store_user_no}`
        }
        
        this.webUrl = url
      } else {
        uni.showModal({
          title: '提示',
          content: '参数有误,即将返回上一级页面',
          showCancel: false,
          success: ({
            confirm,
            cancel
          }) => {
            uni.navigateBack({
              delta: 1
            })
          }
        })
      }
    }
  };
</script>

<style lang="scss" scoped>
  .webview-page {
    width: 100vw;
    height: 100vh;
    background-color: #fff;
  }
</style>
