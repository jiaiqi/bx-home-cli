<template>

  <view class="float-button-view" v-if="show==true" :style="[{ top: CustomBar + 'px' }]">
    <view class="float-button-content" v-if="locationWay==='绝对定位'">
      <view class="float-button absolute-location" :style="[setStyle]" @click="toPages">
        <text class="closeable cuIcon-close" @click.stop.capture="close" v-if="closeable">
        </text>
        <image :style="[setWidthHeight]" :src="getImagePath(pageItem.component_bg_img)" mode="aspectFit"
          v-if="pageItem&&pageItem.component_bg_img">
        </image>
      </view>
    </view>
    <movable-area class="movable-area" v-else>
      <movable-view :style="[setStyle]" :disabled="disabledDrag" direction="all" :x="initX" :y="initY"
        :out-of-bounds="true" @change="onChange">
        <view class="float-button" :style="[setStyle]" @click="toPages">
          <text class="closeable cuIcon-close" @click.stop.capture="close" v-if="closeable">
          </text>
          <image :style="[setStyle]" :src="getImagePath(pageItem.component_bg_img)" mode="aspectFit"
            v-if="pageItem&&pageItem.component_bg_img">
          </image>
        </view>
      </movable-view>
    </movable-area>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        CustomBar: this.CustomBar,
        show: true,
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
      locationWay() {
        return this.pageItem?.float_btn_location_way || 'xy轴'
      },
      closeable() {
        return this.pageItem?.float_btn_closeable === '是' ? true : false
      },
      disabledDrag() {
        return this.pageItem?.float_btn_draggable === '否' ? true : false
      },
      initX() {
        return uni.upx2px(this.pageItem?.float_btn_init_x * 2)
      },
      initY() {
        return uni.upx2px(this.pageItem?.float_btn_init_y * 2)
      },
      setWidthHeight() {
        let obj = {}
        if (this.pageItem?.float_btn_width) {
          obj.width = `${uni.upx2px(this.pageItem?.float_btn_width*2)}px`
          obj.height = obj.width
        }
        if (this.pageItem?.float_btn_height) {
          obj.height = `${uni.upx2px(this.pageItem?.float_btn_height*2)}px`
        }
        return obj
      },
      setStyle() {
        let obj = {}
        if (this.pageItem?.float_btn_width) {
          obj.width = `${uni.upx2px(this.pageItem?.float_btn_width*2)}px`
          obj.height = obj.width
        }
        if (this.pageItem?.float_btn_height) {
          obj.height = `${uni.upx2px(this.pageItem?.float_btn_height*2)}px`
        }
        if (this.pageItem?.component_bg_color) {
          obj['background-color'] = this.pageItem?.component_bg_color
        }

        if (this.locationWay === '绝对定位') {
          let position = ['left', 'right', 'top', 'bottom']
          position.forEach(key => {
            if (this.pageItem?. [`float_btn_init_${key}`] || this.pageItem?. [`float_btn_init_${key}`] === 0) {
              obj[key] = uni.upx2px(this.pageItem?. [`float_btn_init_${key}`] * 2) + 'px'
            }
          })
        }

        return obj
      }
    },
    methods: {
      close() {
        this.show = false
      },
      onChange: function(e) {
        this.old.x = e.detail.x
        this.old.y = e.detail.y
      },
      toPages() {
        let url = this.pageItem?.float_btn_url;
        let globalVariable = {
          ...this.globalVariable
        }
        if (url) {
          url = url.renderStr(globalVariable)
          let navType = this.pageItem?.navigate_type
          if (navType === "小程序") {
            // #ifdef MP-WEIXIN
            if (url) {
              url += `&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
            }
            if (this.pageItem?.appid) {
              uni.navigateToMiniProgram({
                appId: this.pageItem?.appid,
                path: url,
              });
            }
            // #endif
          }else if (this.pageItem?.navigate_type === '打电话') {
            uni.makePhoneCall({
              phoneNumber: url,
              fail(err) {
                console.error(err);
              },
            });
          } else {
            if (url && url.indexOf('https') == 0) {
              url = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(e.url)}`
            }
            uni.navigateTo({
              url
            })
          }

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
    bottom: 50px;
    right: 0;
    left: 0;
    width: 100vw;
    // height: calc(100vh - 95px);
    bottom: calc(50px + var(--safe-area-inset-bottom));
    pointer-events: none;
    z-index: 10;

    // position: relative;
    .float-button-content {
      pointer-events: none;
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 9;

      .absolute-location {
        position: absolute;
      }
    }

  }

  .float-button {
    min-width: 50px;
    min-height: 50px;
    // border-radius: 50%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 10;
    position: relative;
    pointer-events: all;

    .closeable {
      position: absolute;
      right: 0;
      // right: calc(50% - 10px);
      top: -10px;
      // bottom: calc(50% - 15px);
      font-size: 18px;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      width: 25px;
      height: 25px;
      text-align: center;
      line-height: 25px;
      border-radius: 50%;
      z-index: 2;
    }
  }
</style>
