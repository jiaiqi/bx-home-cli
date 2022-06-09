<template>
  <view class="wifi-manage" :class="['theme-'+theme]">
    <view class="wifi-list">
      <scroll-view scroll-y="true">
        <view class="wifi-item" v-for="(item,index) in pageData" :key="index">
          <view class="wifi-item-left">
            <view class="top">
              <!-- <text class="wifi-icon">
                <text class="wifi-1"></text>
                <text class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></text>
                <text class="wifi-3" :class="item.strength < 3 ? 'off' : ''"></text>
                <text class="wifi-4" :class="item.strength < 4 ? 'off' : ''"></text>
              </text> -->
              <text class="cuIcon-wifi"></text>
              <text class="wifi-ssid margin-left-xs">{{item.wifi_ssid||''}} </text>
              <text class="text-blue" v-if="activeWifiMac===item.wifi_mac||activeWifiMac===item.wifi_ssid">已连接</text>
            </view>
          </view>
          <view class="wifi-item-right">
            <!-- #ifdef MP-WEIXIN -->
            <button class="cu-btn border line-blue round" @click="toConnect(item)"
              v-if="activeWifiMac!==item.wifi_mac&&activeWifiMac!==item.wifi_ssid">连接</button>
            <!-- #endif -->
          </view>
        </view>
      </scroll-view>
      <!-- <uni-load-more class="load-more" :status="loadStatus"></uni-load-more> -->
      <!--      <view class="node-data"  v-if="loadStatus=='noMore'&&nearWifiList.length==0">
        <u-empty text="暂无数据"></u-empty>
      </view> -->
    </view>
    <view class="page-nav">
      <uni-pagination show-icon="false" :total="resultTotal" :pageSize="5" :current="currentNo" @change="changePage">
      </uni-pagination>
    </view>
  </view>
</template>

<script>
  import linkjs from '@/static/js/linkwifi.js'

  export default {
    data() {
      return {
        currentNo: 1,
        pageNo: 1,
        total: 0,
        loadStatus: 'more', // noMore\loading
        wifiList: [],
        nearWifiList: [],
        store_no: "",
        connectedWifi: null,
        isIOS: false
      }
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      activeWifiMac() {
        if (this.connectedWifi && this.connectedWifi.BSSID) {
          let activeWifiMac = this.wifiList.find(item => item.wifi_mac === this.connectedWifi.BSSID)
          if (activeWifiMac && activeWifiMac.wifi_mac) {
            return activeWifiMac.wifi_mac
          } else if (!activeWifiMac) {
            activeWifiMac = this.wifiList.find(item => item.wifi_ssid === this.connectedWifi.SSID)
            if (activeWifiMac && activeWifiMac.wifi_ssid) {
              return activeWifiMac.wifi_ssid
            }
          }
        }
      },
      pageData() {
        if (Array.isArray(this.resultWifiList) && this.resultWifiList.length > 5) {
          let arr = []
          this.resultWifiList.forEach((item, index) => {
            if (index % 5 === 0) {
              arr[parseInt(index / 5)] = []
            }
            arr[parseInt(index / 5)].push(item)
          })
          return arr[this.currentNo - 1]
        }else if (Array.isArray(this.resultWifiList) ){
          return this.resultWifiList
        }
      },
      resultTotal() {
        if (Array.isArray(this.resultWifiList)) {
          return this.resultWifiList.length
        } else {
          return 0
        }
      },
      resultWifiList() {
        // #ifdef H5
        // return this.wifiList
        // #endif

        let result = this.wifiList.filter((item) => this.nearWifiList.find(wifi => item.wifi_ssid === wifi.SSID))

        if (result.length === 0) {
          result = this.wifiList
        }

        let room_no = getApp().globalData?.room_no
        if (room_no) {
          let res = result.filter(item => item.wifi_ssid && item.wifi_ssid.indexOf(room_no) !== -1)
          if (Array.isArray(res) && res.length > 0) {
            result = res
          }
        }
        return result
      }
    },
    onShow() {
      let self = this
      if (linkjs?.getConnectedWifi) {
        linkjs.getConnectedWifi().then(wifi => {
          self.connectedWifi = wifi || {}
          uni.$emit('wifi-status-change',wifi)
        })
      }
    },
    methods: {
      changePage(e) {
        let {
          type,
          current
        } = e;
        this.currentNo = current
      },
      toConnect(e) {
        let SSID = e.wifi_ssid
        let password = e.wifi_psd
        let self = this
        // linkjs.getConnectedWifi().then(wifi => {
        //   self.connectedWifi = wifi
        // })
        let wifi = linkjs.getConnectedWifi()
        self.connectedWifi = wifi
        if(wifi?.SSID){
          uni.$emit('wifi-status-change',wifi)
        }
        linkjs.startConnectWifi(SSID, password).then(res => {
          wx.vibrateLong()
          linkjs.getConnectedWifi().then(wifi => {
            uni.$emit('wifi-status-change',wifi)
            self.connectedWifi = wifi
          })
        }).catch(err => {
          linkjs.getConnectedWifi().then(wifi => {
            uni.$emit('wifi-status-change',wifi)
            self.connectedWifi = wifi
          })
        })
        return
        wx.connectWifi({
          SSID,
          // BSSID: '',
          password,
          success(e) {
            wx.vibrateLong()
            console.log(e, '108')
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
          `/publicPages/formPage/formPage?type=update&serviceName=${serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=bxportal`
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
          `/publicPages/formPage/formPage?type=add&serviceName=${serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=bxportal`

        url = `/otherPages/wifiConfig/wifiConfig?store_no=${this.store_no}`
        uni.navigateTo({
          url
        })
      },

      async getWifi() {
        let req = {
          "serviceName": "srvstore_wifi_config_select",
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": 800
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
              uni.$emit('wifi-status-change',e.wifi)
            }
          }
        })
      },
      async startSearch() {
        // 搜索wifi列表
        let self = this
        linkjs.getConnectedWifi().then(wifi => {
          self.connectedWifi = wifi
          uni.$emit('wifi-status-change',wifi)
        })

        wx.getSystemInfo({
          success: (res) => {
            const isIOS = res.platform === 'ios'
            self.isIOS = isIOS
            if (isIOS) {

              return
            } else {
              linkjs.startSearchWifi((res) => {
                console.log(res, 'startSearchWifi')
                this.nearWifiList = res
              })
            }
          }
        })


        return
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

        wx.getSystemInfo({
          success(res) {
            const isIOS = res.platform === 'ios'
            self.isIOS = isIOS
            if (isIOS) {
              wx.showModal({
                title: '提示',
                content: '由于系统限制，iOS用户请手动进入系统WiFi页面，然后返回小程序。',
                showCancel: false,
                success() {
                  startWifi()
                }
              })
              return
            }
            startWifi()
          }
        })
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
      // if (this.loadStatus === 'more') {
      //   this.loadMore()
      // }
    },
    onPullDownRefresh() {
      this.startSearch()
      this.onRefresh().then(_ => {
        uni.stopPullDownRefresh()
      })
    },
    onLoad(option) {
      this.setNavBg(this.$store?.state?.app?.theme || 'blue')
      if (option.store_no) {
        this.store_no = option.store_no
      }
      this.onRefresh()
      uni.$on('dataChange', (e) => {
        if (e && ['srvstore_wifi_config_add', 'srvstore_wifi_config_update'].includes(e)) {
          this.onRefresh()
        }
      })
      // #ifdef MP-WEIXIN
      this.checkLocationAuth()
      // #endif
    }
  }
</script>

<style lang="scss" scoped>
  .node-data {
    height: 500px;
  }

  .wifi-manage {
    padding: 0rpx;
    background-color: #f2f3f5;
    min-height: calc(100vh - var(--window-top));
    display: flex;
    flex-direction: column;

    .page-nav {
      background-color: #fff;
      padding: 20rpx 20rpx 100rpx;
    }
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
    flex: 1;

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
