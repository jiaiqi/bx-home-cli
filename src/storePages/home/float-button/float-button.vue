<template>
  <view class="float-button" :style="[setStyle]" @click="toPages">

  </view>
</template>

<script>
  export default {
    props: {
      pageItem: {
        type: Object
      },
    },
    computed: {
      setStyle() {
        let obj = {}
        if (this.pageItem?.component_bg_img) {
          obj.backgroundImage = `url(${this.getImagePath(this.pageItem?.component_bg_img)})`
        }
        if (this.pageItem?.float_btn_width) {
          obj.width = `${this.pageItem?.float_btn_width}px`
          obj.height = obj.width
        }
        return obj
      }
    },
    methods: {
      toPages() {
        let url  = this.pageItem?.float_btn_url;
        let mainData = {
          userInfo:this.userInfo,
          storeInfo:this.storeInfo,
          storeUser:this.vstoreUser,
        }
        if(url){
          // url = this.renderStr(url,mainData) 
          url = url.renderStr(mainData) 
          uni.navigateTo({
            url
          })
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  .float-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    position: fixed;
    bottom: 150px;
    right: 10px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 10;
  }
</style>
