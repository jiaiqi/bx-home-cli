<template>
  <view class="wifi-manage">
    <view class="handler-bar">
      <button class="cu-btn round" @tap="toAdd"><text class="cuIcon-add margin-right-xs"></text> 添加</button>
    </view>
    <view class="wifi-list">
      <scroll-view scroll-y="true">
        <view class="wifi-item" v-for="(item,index) in resultWifiList" :key="index">
          <view class="wifi-item-left">
            <view class="top">
              <text class="wifi-icon">
                <text class="wifi-1"></text>
                <text class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></text>
                <text class="wifi-3" :class="item.strength < 3 ? 'off' : ''"></text>
                <text class="wifi-4" :class="item.strength < 4 ? 'off' : ''"></text>
              </text>
              <!-- <text class="cuIcon-wifi"></text> -->
              <text class="wifi-ssid">{{item.wifi_ssid||''}} </text>
              <text class="text-blue" v-if="activeWifiMac===item.wifi_mac">已连接</text>
            </view>
            <view class="bottom">
              <text class="wifi-pwd margin-right">{{item.wifi_psd||''}}</text>
              <text @click="setClipboard(item.wifi_psd)"><text class="cuIcon-copy"></text>复制密码</text>
            </view>
          </view>
          <view class="wifi-item-right">
            <!-- #ifdef MP-WEIXIN -->
            <button class="cu-btn border line-blue sm round" @tap="toConnect(item)"
              v-if="activeWifiMac!==item.wifi_mac">连接</button>
            <!-- #endif -->
            <button class="cu-btn border line-blue sm round margin-left-xs" @tap="toEdit(item)">编辑</button>
            <button class="cu-btn border line-blue sm round margin-left-xs" @tap="toDel(item)">删除</button>
          </view>
        </view>
      </scroll-view>
      <uni-load-more class="load-more" :status="loadStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
  import {
    setClipboardData
  } from '@/uni_modules/u-clipboard/js_sdk'
  import linkjs from '@/static/js/linkwifi.js'

  export default {
    data() {
      return {
        pageNo: 1,
        loadStatus: 'more', // noMore\loading
        wifiList: [],
        nearWifiList: [],
        store_no: "",
        connectedWifi: null,
        isIOS: false
      }
    },
    computed: {
      activeWifiMac() {
        if (this.connectedWifi && this.connectedWifi.BSSID) {
          let activeWifiMac = this.wifiList.find(item => item.wifi_mac === this.connectedWifi.BSSID)
          if (activeWifiMac && activeWifiMac.wifi_mac) {
            return activeWifiMac.wifi_mac
          }
        }
      },
      resultWifiList() {
        // #ifdef H5
        return this.wifiList
        // #endif
        return this.wifiList
        // return this.wifiList.filter((item) => this.nearWifiList.find(wifi => wifi.wifi_ssid === item.SSID))
      }
    },
    methods: {
      toConnect(e) {
        let SSID = e.wifi_ssid
        let password = e.wifi_psd
        console.log(e)
        let self = this
        uni.showToast({
          title: '连接中...',
          icon: 'none'
        })
        wx.connectWifi({
          SSID,
          // BSSID: '',
          password,
          success(e) {
            wx.vibrateLong()
            console.log(e)
            if (self.isIOS) { // 是否是IOS可通过提前调用getSystemInfo知道
              wx.onWifiConnected(result => {
                if (result.wifi.SSID === SSID) {
                  // 连接成功
                  uni.showModal({
                    title: SSID,
                    content: '连接成功',
                    showCancel: false
                  })
                } else {
                  // 连接失败
                  uni.showToast({
                    title: '连接失败，密码不正确',
                    icon: 'none'
                  })
                }
              })
            } else {
              // 连接成功
              uni.showModal({
                title: SSID,
                content: '连接成功',
                showCancel: false
              })
            }
            self.getConnectedWifi()
          },
          fail(err) {
            // 连接失败
            console.log(err)
            if (err.errCode) {
              linkjs.checkWifiErr(err.errCode)
            }
            // uni.showModal({
            //   title: SSID,
            //   content: '连接失败',
            //   showCancel: false
            // })
          }
        })
      },
      toDel(e) {
        if (!e?.id) {
          return
        }
        let req = [{
          "serviceName": "srvstore_wifi_config_delete",
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": e.id
          }]
        }]
        let url = this.getServiceUrl('bxportal', 'srvstore_wifi_config_delete', 'operate');
        uni.showModal({
          title: '提示',
          content: '确认删除?',
          success: (res) => {
            if (res.confirm) {
              this.$http.post(url, req).then(res => {
                if (res.data.state == 'SUCCESS') {
                  uni.showToast({
                    title: '操作成功'
                  })
                  this.onRefresh()
                } else {
                  uni.showToast({
                    title: res.data.resultMessage,
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      },
      toEdit(e) {
        let fieldsCond = [{
            column: "id",
            value: e.id,
            // display: false
          },
          {
            column: "store_no",
            display: false
          }
        ]
        let serviceName = 'srvstore_wifi_config_update'
        let url =
          `/publicPages/form/form?type=update&serviceName=${serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=bxportal`
        uni.navigateTo({
          url
        })
      },
      toAdd() {
        let fieldsCond = [{
          column: "store_no",
          value: this.store_no,
          display: false
        }]
        let serviceName = 'srvstore_wifi_config_add'
        let url =
          `/publicPages/form/form?type=add&serviceName=${serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=bxportal`

        url = `/otherPages/wifiConfig/wifiConfig?store_no=${this.store_no}`
        uni.navigateTo({
          url
        })
      },
      setClipboard(e) {
        setClipboardData(e).then(res => {
          // #ifdef H5
          if (res) {
            uni.showToast({
              title: '内容已复制',
              icon: 'none'
            })
          }
          // #endif
        })
      },
      async getWifi() {
        let req = {
          "serviceName": "srvstore_wifi_config_select",
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": 20
          }
        }
        if (this.store_no) {
          req.condition = [{
            colName: "store_no",
            ruleType: "eq",
            value: this.store_no
          }]
        }
        let url = this.getServiceUrl('bxportal', 'srvstore_wifi_config_select', 'select');
        this.loadStatus = 'loading'
        let res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          let data = []
          if (this.pageNo !== 1) {
            data = this.wifiList
          }
          this.wifiList = [...data, ...res.data.data]
          let page = res.data.page
          if (page) {
            if (page.total > page.rownumber * this.pageNo) {
              this.loadStatus = 'more'
            } else {
              this.loadStatus = 'noMore'
            }
          } else {
            this.loadStatus = 'noMore'
          }
        } else {
          this.loadStatus = 'noMore'
          uni.showToast({
            title: res.data.resultMessage
          })
        }
        return
      },
      async onRefresh() {
        this.loadStatus = 'more'
        this.pageNo = 1
        this.getConnectedWifi()
        return await this.getWifi()
      },
      async loadMore() {
        if (this.loadStatus === 'more') {
          this.pageNo++;
          return await this.getWifi()
        }
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
                linkjs.checkWifiErr(err.errCode)
              }
              console.log(err);
            }
          })
        }
        let platform = await linkjs.checkPlatform()
        if (platform === 'ios') {
          this.nearWifiList = this.wifiList
          self.getConnectedWifi()
        } else {
          startWifi()
        }

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
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.loadMore()
      }
    },
    onPullDownRefresh() {
      this.startSearch()
      this.onRefresh().then(_ => {
        uni.stopPullDownRefresh()
      })
    },
    onShow() {
      this.onRefresh()
    },
    onLoad(option) {
      if (option.store_no) {
        this.store_no = option.store_no
      }
      this.onRefresh()
      uni.$on('dataChange', (e) => {
        this.onRefresh()
      })
      // #ifdef MP-WEIXIN
      this.checkLocationAuth()
      // #endif
    }
  }
</script>

<style lang="scss" scoped>
  .wifi-manage {
    padding: 0rpx;
    background-color: #f2f3f5;
    min-height: calc(100vh - var(--window-top));
  }

  .handler-bar {
    text-align: right;
    background-color: #fff;
    padding: 0 20rpx;

    .cu-btn {
      background-image: linear-gradient(to right, #EAF9F8, #EDEEFE);
      margin-left: 20rpx;
    }
  }

  .wifi-list {
    background-color: #fff;
    padding: 20rpx;
    border-radius: 0 0 20rpx 20rpx;

    .wifi-item {
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      border-radius: 20rpx;
      margin-bottom: 10rpx;

      &.active {
        background-color: #0081ff;
        color: #fff;

        .cu-btn {
          color: #f1f1f1 !important;
        }

        .bottom {
          color: #e6e6e6 !important;
        }
      }

      .wifi-item-left {
        display: flex;
        flex-direction: column;

        .top {
          display: flex;
          align-items: center;
          min-height: 80rpx;

          .wifi-ssid {
            padding-top: 10rpx;
          }

          .text-blue {
            padding-top: 10rpx;
            margin-left: 10rpx;
            font-size: 24rpx;
          }

          .wifi-icon {
            width: 50rpx;
            height: 40rpx;
            display: inline-block;
            position: relative;
            overflow: hidden;
            margin-right: 10rpx;
            float: right;

            &.has-pwd {
              color: #0bc99d;
            }

            text {
              display: block;
              position: absolute;
              border-radius: 50%;
            }

            .wifi-1 {
              background: currentcolor;
              width: 10rpx;
              height: 10rpx;
              left: 18rpx;
              bottom: 0rpx;
            }

            .wifi-2,
            .wifi-3,
            .wifi-4 {
              border: 4rpx solid;
              border-color: currentcolor transparent transparent;
            }

            .wifi-2 {
              width: 30rpx;
              height: 24rpx;
              left: 9rpx;
              bottom: -6rpx;
            }

            .wifi-3 {
              width: 45rpx;
              height: 40rpx;
              left: 2rpx;
              bottom: -14rpx;
            }

            .wifi-4 {
              width: 60rpx;
              height: 56rpx;
              left: -6rpx;
              bottom: -22rpx;
            }

            text:after {
              content: "";
              display: block;
              position: absolute;
            }

            .lock {
              width: 12rpx;
              height: 10rpx;
              background: currentcolor;
              display: block;
              right: 2rpx;
              bottom: 4rpx;
              border-radius: 0;
            }

            .lock:after {
              width: 8rpx;
              height: 6rpx;
              border: 2rpx solid;
              border-radius: 200rpx 200rpx 0 0;
              border-bottom: none;
              left: 0px;
              bottom: 100%;
            }

            .off {
              border-color: #b0bec5 transparent transparent !important;
            }

          }

          .cuIcon-wifi {
            margin-right: 5rpx;
            font-size: 40rpx;
          }
        }

        .bottom {
          color: rgba(153, 153, 153, 100);
          display: flex;
          align-items: center;
          font-size: 24rpx;
        }
      }

      .wifi-item-right {
        display: flex;
        align-items: center;

        .cu-btn {
          min-width: 120rpx;
          color: #4b6efc;
        }
      }
    }
  }
</style>
