<template>
  <view class="link-wifi">
    <image :src="require('./wifi.png')" class="icon"></image>
    <view class="info">
      <view class="title" v-if="connectedWifi&&connectedWifi.SSID">
        已连接WIFI：{{connectedWifi.SSID}}
      </view>
      <view class="title" v-else>
        未连接WIFI
      </view>
      <view class="room-id" v-if="room_no">
        当前房间号：{{room_no||'-'}}
      </view>
    </view>
    <view class="buttons">
      <button class="line-orange cu-btn border sm round" @click="toWifi">一键上网</button>
    </view>
  </view>
</template>

<script>
  import linkjs from '@/static/js/linkwifi.js'
  export default {
    data() {
      return {
        connectedWifi: null,
        room_no: ''
      }
    },
    props: {
      store_no: {
        type: String,
        default: ''
      },
    },

    methods: {
      toWifi() {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
      this.checkUserInfo().then(res => {
          if (res) {
            uni.navigateTo({
              url: '/storePages/linkwifi/linkwifi?store_no=' + this.store_no
            })

          }
        })
      },
      getConnectedWifi() {
        let self = this
        // #ifdef MP-WEIXIN
        wx.getConnectedWifi({
          success: (e) => {
            if (e && e.wifi) {
              self.connectedWifi = e.wifi
            }
          }
        })
        // #endif
      },
      async startSearch() {
        // 搜索wifi列表
        var self = this
        let app = getApp()
        const getWifiList = () => {
          uni.showLoading({
            title: 'wifi列表加载中...'
          })
          wx.getWifiList({
            success: (res) => {
              wx.onGetWifiList((res) => {
                const wifiList = res.wifiList.filter(item => item.SSID).sort((a, b) => b.signalStrength -
                  a
                  .signalStrength).map(wifi => {
                  const strength = Math.ceil(wifi.signalStrength / 100 * 4)
                  return Object.assign(wifi, {
                    strength
                  })
                })
                this.nearWifiList = wifiList
              })
            },
            fail(err) {
              if (err && err.errCode) {
                linkjs.checkWifiErr(err.errCode)
              }
              console.log(err);
            },
            complete: () => {
              uni.hideLoading()
            }
          })
        }

        const startWifi = () => {
          wx.startWifi({
            success: (e) => {
              console.log('startWifi:', e)
              // getWifiList()
              self.getConnectedWifi()
            },
            fail(err) {
              if (err && err.errCode) {
                linkjs.checkWifiErr(err.errCode)
              }
              console.log(err);
            }
          })
        }
        let platform = await linkjs.checkPlatform()
        if (platform === 'ios') {
          self.getConnectedWifi()
        } else {
          startWifi()
        }
      },
    },
    onShow() {
      this.getConnectedWifi()
    },
    mounted() {
      uni.$on('wifi-status-change', (wifi) => {
        if (wifi?.SSID) {
          this.connectedWifi = wifi
        }
      })
      let globalData = getApp().globalData
      if (globalData.room_no) {
        this.room_no = globalData.room_no
      }

      this.getConnectedWifi()
    }
  }
</script>

<style scoped lang="scss">
  .link-wifi {
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    line-height: 40rpx;
    font-family: 苹方-简;
    font-weight: normal;
    color: #474849;
    display: flex;
    align-items: center;

    .icon {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
    }

    .info {
      flex: 1;

      .title {}

      .room-id {
        color: #B8BAC0;
        font-size: 24rpx;
      }
    }

    .buttons {
      .cu-btn {}
    }
  }
</style>
