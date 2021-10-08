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
      <view class="room-id">
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
        uni.navigateTo({
          url: '/storePages/linkwifi/linkwifi?store_no=' + this.store_no
        })
      },
      getConnectedWifi() {
        wx.getConnectedWifi({
          success: (e) => {
            if (e && e.wifi) {
              this.connectedWifi = e.wifi
            }
          }
        })
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
                checkWifiErr(err.errCode)
              }
              console.log(err);
            },
            complete: () => {
              self.getConnectedWifi()
              uni.hideLoading()
            }
          })
        }

        const startWifi = () => {
          wx.startWifi({
            success: (e) => {
              console.log('startWifi:', e)
              getWifiList()
            },
            fail(err) {
              if (err && err.errCode) {
                checkWifiErr(err.errCode)
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
        // startWifi()
        // wx.getSystemInfo({
        //   success(res) {
        //     const isIOS = res.platform === 'ios'
        //     self.isIOS = isIOS
        //     if (isIOS) {
        //       wx.showModal({
        //         title: '提示',
        //         content: '由于系统限制，iOS用户请手动进入系统WiFi页面，然后返回小程序。',
        //         showCancel: false,
        //         success() {
        //           startWifi()
        //         }
        //       })
        //       return
        //     }
        //     startWifi()
        //   }
        // })
      },
      checkLocationAuth() {
        // 检测用户是否授权访问地理位置信息
        let self = this
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              wx.authorize({
                scope: 'scope.userLocation',
                success() {
                  self.startSearch()
                }
              })
            } else {
              self.startSearch()
            }
          }
        })
      },
    },
    mounted() {
      // #ifdef MP-WEIXIN
      this.checkLocationAuth()
      // #endif
      let globalData = getApp().globalData
      if (globalData.room_no) {
        this.room_no = globalData.room_no
      }
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
