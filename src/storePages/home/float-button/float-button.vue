<template>

  <view class="float-button-view">
    <movable-area class="movable-area">
      <movable-view direction="all" :x="initX" :y="initY" :out-of-bounds="true" @change="onChange">
        <!--        <view class="float-button" :style="[setStyle]" @click="toPages">
        </view> -->
        <image :style="[setStyle]" :src="getImagePath(pageItem.component_bg_img)" class="float-button" mode="aspectFit"
          @click="toPages" v-if="pageItem&&pageItem.component_bg_img">
        </image>
      </movable-view>
    </movable-area>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        x: 370,
        y: 370,
        old: {
          x: 0,
          y: 0
        }
      }
    },
    props: {
      pageItem: {
        type: Object
      },
    },
    computed: {
      initX() {
        if (this.pageItem?.float_btn_init_x && this.pageItem?.float_btn_init_x !== 370) {
          return uni.upx2px(this.pageItem?.float_btn_init_x)
        } else {
          return uni.upx2px(740)
        }
      },
      initY() {
        if (this.pageItem?.float_btn_init_y && this.pageItem?.float_btn_init_y !== 370) {
          return uni.upx2px(this.pageItem?.float_btn_init_y)
        } else {
          return uni.upx2px(740)
        }
      },
      setStyle() {
        let obj = {}
        // if (this.pageItem?.component_bg_img) {
        //   obj.backgroundImage = `url(${this.getImagePath(this.pageItem?.component_bg_img)})`
        // }
        
        if (this.pageItem?.float_btn_width) {
          obj.width = `${this.pageItem?.float_btn_width}px`
          obj.height = obj.width
        }
        if (this.pageItem?.float_btn_height) {
          obj.height = `${this.pageItem?.float_btn_height}px`
        }
        return obj
      }
    },
    methods: {
      onChange: function(e) {
        this.old.x = e.detail.x
        this.old.y = e.detail.y
      },
      toPages() {
        let url = this.pageItem?.float_btn_url;
        let mainData = {
          userInfo: this.userInfo,
          storeInfo: this.storeInfo,
          storeUser: this.vstoreUser,
        }
        if (url) {
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
  movable-view {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    width: 70px;
    color: #fff;
    pointer-events: auto;
  }

  movable-area {
    height: 100rpx;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .float-button-view {
    position: fixed;
    bottom: 100px;
    right: 0;
    padding-right: 10px;
    width: 100vw;
    height: calc(100vh - var(--window-top) - var(--window-bottom) - 200px);
    pointer-events: none;
  }

  .float-button {
    width: 50px;
    height: 50px;
    // border-radius: 50%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 10;
  }
</style>
