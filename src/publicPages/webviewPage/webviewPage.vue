<template>
  <view class="webview-page">
    <!-- #ifdef MP-WEIXIN -->
    <web-view :webview-styles="webviewStyles" :src="webUrl" @message="onMessage"></web-view>
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
      onMessage(e) {
        console.log(e)
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
        url = this.renderStr(url,this)
        if (url && url.indexOf('100xsys.cn') > -1) {
          if (url.indexOf('?') == -1) {
            url += `?bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
          } else {
            url += `&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
          }
        }
        let login_user_info = uni.getStorageSync('login_user_info')
        if(login_user_info?.user_no){
          url+=`&login_user_info=${encodeURIComponent(JSON.stringify(login_user_info))}`
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
