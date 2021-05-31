<template>
  <view class="webview-page"
    ><web-view :webview-styles="webviewStyles" :src="webUrl"></web-view
  ></view>
</template>

<script>
export default {
  data () {
    return {
      webUrl: '',
      userno: '',
      doctor_no: '',
      webviewStyles: {
        progress: {
          color: '#FF3333'
        }
      }
    };
  },
  onUnload () {
    uni.$emit('backFromWebview')
  },
  onHide () {
    uni.$emit('backFromWebview')
  },
  beforeDestroy () {
    uni.$emit('backFromWebview')
    this.checkSubscribeStatus()
    this.toAddPage()
  },
  onLoad (option) {
    if (option.webUrl) {
      this.webUrl = decodeURIComponent(option.webUrl)
      // this.webUrl = 'http://srvms.100xsys.cn/health/remote/getPage?address=https://xw.qq.com/cmsid/20201201A0296600'
    } else {
      // this.webUrl ='https://wx2.100xsys.cn/pages/specific/testPage/testPage'
      uni.showModal({
        title: '提示',
        content: '参数有误,即将返回上一级页面',
        showCancel: false,
        success: ({ confirm, cancel }) => {
          uni.navigateBack({ delta: 1 })
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
