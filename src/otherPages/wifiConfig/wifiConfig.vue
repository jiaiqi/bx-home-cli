<template>
  <view class="scan-wifi-wrap">
    <view class="wifi-status-box">
      <!-- <view class="wifi-status-box" v-if="connectedWifi&&connectedWifi.SSID"> -->
      <view class="wifi-status-icon">
        <view class="wifi-status-ring ">
          <view class="wifi-status-ring inner shadow-blur">
            <text class="cuIcon-wifi"></text>
          </view>
        </view>
      </view>
      <view class="wifi-info">
        <view>
          WiFi{{connectedWifi&&connectedWifi.SSID?"已":"未"}}连接
          <!-- {{connectedWifi.SSID}} -->
        </view>
        <view class="wifi-ssid" v-if="connectedWifi&&connectedWifi.SSID">
          {{connectedWifi.SSID||''}}
        </view>
      </view>
    </view>
    <!--    <view class="wifi-status-box scan-code" @click="scanCode">
      <text class="cuIcon-scan">扫码连接WIFI</text>
    </view> -->
    <!--    <view class="wifi-list" v-if="hasPwd&&hasPwd.length>0">
      <view class="label">
        已保存WiFi
      </view>
      <scroll-view class="device-list" scroll-y>
        <view class="wifi-item" v-for="(item,index) in hasPwd" :key="index" @click="selectWifi(item)">
          <view class="list">
            <text>{{ item.SSID }}</text>
            <text class="wifi-tip" @click.stop="selectWifi(item,'share')">点击分享密码</text>
            <span class="wifi-icon has-pwd">
              <span class="wifi-1"></span>
              <span class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></span>
              <span class="wifi-3" :class="item.strength < 3 ? 'off' : ''"></span>
              <span class="wifi-4" :class="item.strength < 4 ? 'off' : ''"></span>
            </span>
          </view>
        </view>
      </scroll-view>
    </view> -->
    <!--    <view class="wifi-status-box" @click="showModal('add-wifi')">
      <view class="wifi-info">
        <view>添加WiFi配置</view>
      </view>
    </view> -->
    <view class="wifi-list">
      <view class="label">
        <text>附近的WiFi </text>
        <text @click="startSearch" class="refresh-icon"><text class="cuIcon-refresh"></text></text>
      </view>
      <view class="no-wifi" v-if="wifiList.length===0">
        未找到附近的WiFi，请检查手机WiFi功能是否打开
      </view>
      <!-- <scroll-view class="device-list" scroll-y> -->
      <view class="wifi-item" v-for="(item,index) in otherWifi" :key="index">
        <!-- <view class="list"> -->
        <view class="wifi-name">
          <text class="wifi-icon" :class="{'has-pwd':item.password&&item.id}">
            <text class="wifi-1"></text>
            <text class="wifi-2" :class="item.strength < 2 ? 'off' : ''"></text>
            <text class="wifi-3 " :class="item.strength < 3 ? 'off' : ''"></text>
            <text class="wifi-4 " :class="item.strength < 4 ? 'off' : ''"></text>
            <text class="lock" v-if="item.secure"></text>
          </text>
          <text class="wifi-ssid" @click="selectWifi(item)" v-if="item.password">{{ item.SSID }}</text>
          <text class="wifi-ssid" v-else>{{ item.SSID }}</text>
        </view>
        <view class="handler">
          <text class="text-blue sm" v-if="item.password&&item.id" @click.stop="selectWifi(item,'share')">
            已添加
          </text>
          <button class="cu-btn border round sm" v-else @click="selectUndefinedWifi(item)">添加</button>
        </view>
        <!-- </view> -->
      </view>
      <!-- </scroll-view> -->
    </view>

    <view class="cu-modal bottom-modal" :class="{show:modalName==='submit-pwd'}" @click="hideModal()">
      <view class="cu-dialog" @tap.stop>
        <view class="link-wifi-info">
          <view class="title">
            <text class="cuIcon-close" style="opacity: 0;" @click.stop="hideModal()"></text>
            <view class="label">
              提交WiFi密码
            </view>
            <text class="cuIcon-close" @click.stop="hideModal()"></text>
          </view>
          <view class="logo">
            <view class="wifi-logo">
              <text class="cuIcon-wifi"></text>
            </view>
            <!--   <view class="margin-top-xs">
              wifi
            </view> -->
          </view>

          <view class="wifi-info" v-if="decodeQrcode&&decodeQrcode.SSID">
            <view class="info-item">
              <view class="label">
                wifi名称:
              </view>
              <view class="value">
                {{decodeQrcode.SSID}}
              </view>
            </view>
            <!--            <view class="info-item" v-if="decodeQrcode.password">
              <view class="label">
                密码:
              </view>
              <view class="value">
                ********
              </view>
            </view> -->
            <!-- 			<view class="info-item">
          		<view class="label">
          			安全性:
          		</view>
          		<view class="value">
          			WPA
          		</view>
          	</view> -->
          </view>
          <view class="wifi-info" v-else-if="decodeQrcode&&decodeQrcode.SSID">
            <view class="info-item">
              <view class="label">
                wifi名称:
              </view>
              <view class="value">
                {{decodeQrcode.SSID}}
              </view>
            </view>
            <view class="info-item" v-if="decodeQrcode.password">
              <view class="label">
                密码:
              </view>
              <view class="value">
                ********
              </view>
            </view>
          </view>
          <view class="wifi-info" v-else-if="undefinedWifi&&undefinedWifi.SSID">
            <view class="info-item">
              <view class="label">
                wifi名称:
              </view>
              <view class="value text-bold">
                {{undefinedWifi.SSID}}
              </view>
            </view>
            <view class="info-item">
              <!-- <view class="title">wifi密码:</view> -->
              <input class="password" placeholder="请输入wifi密码" name="input" type="text"
                v-model="undefinedPassword"></input>
            </view>
          </view>
          <view class="handel-bottom">
            <button class="button cu-btn text-white" :disabled="undefinedWifi&&undefinedWifi.SSID&&!undefinedPassword">
              <text v-if="undefinedWifi&&undefinedWifi.SSID"
                @click="connectWifi(decodeQrcode,true)">连接WiFi并提交WiFi密码</text>
              <text v-else-if="decodeQrcode&&decodeQrcode.SSID" @click="connectWifi(decodeQrcode)">点击一键直连</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    <view class="cu-modal bottom-modal" :class="{show:modalName==='wifi-qrcode'}" @click.stop.prevent="hideModal()">
      <view class="cu-dialog" @click.stop="">
        <view class="link-wifi-info">
          <view class="title">
            <text class="cuIcon-close" style="opacity: 0;" @click.stop="hideModal()"></text>
            <view class="label">
              分享密码给好友
            </view>
            <text class="cuIcon-close" @click.stop="hideModal()"></text>
          </view>
          <view class="wifi-qrcode">
            <view class="qrcode-container" v-if="qrCodeText">
              <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas"
                foregroundColor="#333" @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas">
              </uni-qrcode>
              <image :src="qrcodePath" class="qr-code-image" mode="aspectFit" v-if="qrcodePath"
                @click="toPreviewImage(qrcodePath)"></image>
              <view class="qr-code-image" v-else @click="makeQrCode">
                <text class="cuIcon-refresh"></text>
              </view>
            </view>
          </view>
          <view class="qrcode-tip">
            使用当前小程序扫码识别WiFi功能扫描二维码自动连接WiFi
          </view>
          <view class="handel-bottom">
            <button class="button cu-btn text-white" @click="hideModal()">
              <text>完成</text>
              <!-- <text v-else>点击一键直连</text> -->
            </button>
          </view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:modalName==='add-wifi'}" @click.stop.prevent="hideModal()">
      <view class="cu-dialog" @click.stop="">
        <view class="add-wifi-form">
          <a-form :fields="addWiFiFields" :pageType="'add'" :formType="'add'" ref="addForm"></a-form>
          <view class="button-box">
            <button class="cu-btn bg-blue" @click="addWifiConfig">添加</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import linkjs from '@/static/js/linkwifi.js'
  let wifiList = [{
      BSSID: "50:fa:84:7c:bf:9c",
      SSID: "100x_ap",
      frequency: 2412,
      password: "100x_ap;",
      secure: true,
      signalStrength: 99,
      strength: 396,
    },
    {
      BSSID: "34:37:59:92:3c:10",
      SSID: "ChinaNet-LsZk",
      frequency: 2437,
      secure: true,
      signalStrength: 99,
      strength: 396
    }
  ]
  let isOpenWifi = true
  export default {
    data() {
      return {
        store_no: "",
        codeSize: uni.upx2px(500),
        qrcodePath: "",
        connectedWifi: null, //当前连接的wifi信息
        isIOS: false,
        modalName: "",
        curWifi: null,
        undefinedWifi: null,
        undefinedPassword: null,
        pwdList: [
          // {
          //   BSSID: "50:fa:84:7c:bf:9c",
          //   SSID: "100x_ap",
          //   frequency: 2412, // 频段 单位MHz
          //   secure: true,
          //   signalStrength: 99, //信号强度
          //   strength: 396,
          //   password: '100x_ap;'
          // }
        ],
        wifiList: [],
        wifiQrcodeText: "",
        addWiFiFields: [{
            "column": "wifi_mac",
            "label": "wifi物理地址",
            "isRequire": true,
            "type": "text",
            "service_name": "srvstore_wifi_config_add",
            "columns": "wifi_mac",
            "bx_col_type": "string",
            "col_type": "String",
            "in_add": 1,
            "in_list": 1,
            "in_detail": 1,
            "in_update": 1,
            "in_cond": 1,
            "in_cond_def": 1,
            "updatable": 1,
            "required": "否",
            "validators": "ngMaxlength=50",
            "showExp": true,
            "display": true,
            "disabled": false,
            "_validators": {
              "max": 50,
              "min": null,
              "reg": "",
              "required": false,
              "msg": "",
              "isType": {}
            },
            "value": null,
          },
          {
            "column": "wifi_ssid",
            "label": "wifi名称",
            "isRequire": true,
            "type": "text",
            "service_name": "srvstore_wifi_config_add",
            "columns": "wifi_ssid",
            "bx_col_type": "string",
            "col_type": "String",
            "in_add": 1,
            "in_list": 1,
            "in_detail": 1,
            "in_update": 1,
            "in_cond": 1,
            "in_cond_def": 1,
            "updatable": 1,
            "required": "否",
            "validators": "ngMaxlength=50",
            "showExp": true,
            "display": true,
            "disabled": false,
            "_validators": {
              "max": 50,
              "min": null,
              "reg": "",
              "required": false,
              "msg": "",
              "isType": {}
            },
            "value": null,
          },
          {
            "column": "wifi_psd",
            "label": "wifi密码",
            "isRequire": false,
            "type": "text",
            "service_name": "srvstore_wifi_config_add",
            "columns": "wifi_psd",
            "bx_col_type": "password",
            "col_type": "String",
            "in_add": 1,
            "in_list": 1,
            "in_detail": 1,
            "in_update": 1,
            "in_cond": 1,
            "in_cond_def": 1,
            "updatable": 1,
            "required": "否",
            "validators": "ngMaxlength=50",
            "showExp": true,
            "display": true,
            "disabled": false,
            "_validators": {
              "max": 50,
              "min": null,
              "reg": "",
              "required": false,
              "msg": "",
              "isType": {}
            },
            "value": null,
          },
          {
            "column": "remark",
            "label": "备注",
            "isRequire": false,
            "type": "textarea",
            "service_name": "srvstore_wifi_config_add",
            "columns": "remark",
            "bx_col_type": "mtext",
            "col_type": "MultilineText",
            "in_add": 1,
            "in_list": 1,
            "in_detail": 1,
            "in_update": 1,
            "in_cond": 1,
            "in_cond_def": 1,
            "updatable": 1,
            "required": "否",
            "validators": "ngMaxlength=50",
            "showExp": true,
            "display": true,
            "disabled": false,
            "_validators": {
              "max": 50,
              "min": null,
              "reg": "",
              "required": false,
              "msg": "",
              "isType": {}
            },
            "value": null,
          }
        ]
      }
    },
    computed: {
      isOpenWifi() {
        return isOpenWifi
      },
      qrCodeText() {
        if (this.curWifi?.SSID && this.curWifi?.password) {
          return `WIFI:S:${this.curWifi?.SSID};P:${this.curWifi?.password};`
        }
        return ""
      },
      decodeQrcode() {
        let text = this.wifiQrcodeText
        if (text) {
          if (text.indexOf('WIFI:') !== -1) {
            let SSID = text.slice(text.indexOf('S:') + 2, text.indexOf(';P:'))
            let password = text.slice(text.indexOf('P:') + 2, text.lastIndexOf(';'))
            return {
              SSID,
              password
            }
          }
        }
      },
      hasPwd() {
        // let ssidList = this.wifiList.map(item => item.SSID)
        let ssidList = this.pwdList.map(item => item.SSID)
        // #ifdef H5
        this.wifiList = wifiList
        // #endif
        // return this.pwdList
        // return this.pwdList.filter(item => ssidList.includes(item.SSID))
        // return wifiList.filter(item => {
        return this.wifiList.filter(item => {
          if (ssidList.includes(item.SSID)) {
            let info = this.pwdList.find(p => p.SSID === item.SSID)
            if (info?.password) {
              item.password = info.password
            }
            return true
          }
        })
      },
      otherWifi() {
        let ssidList = this.hasPwd.map(item => item.SSID)
        // #ifdef H5
        this.wifiList = wifiList
        // #endif
        // this.wifiList = wifiList
        // return wifiList.map(item => {
        return this.wifiList.map(item => {
          if (ssidList.includes(item.SSID)) {
            let info = this.pwdList.find(p => p.SSID === item.SSID)
            if (info?.password) {
              item.password = info.password
            }
            if (info?.wifi_psd) {
              item.password = info.wifi_psd
            }
            if (info && typeof info === 'object') {
              item = {
                ...item,
                ...info
              }
            }
          }
          return item
        }).filter(item => item.SSID)
      },
    },
    onLoad(option) {
      wx.getSystemInfo({
        success: (res) => {
          const isIOS = res.platform === 'ios'
          this.isIOS = isIOS
        }
      })
      if (option.store_no) {
        this.store_no = option.store_no
        this.getSavedWifi()
      }
      // #ifdef MP-WEIXIN
      this.checkLocationAuth()
      // #endif
    },
    methods: {
      async addWifiConfig() {
        let modal = this.$refs.addForm.getFieldModel();
        if (modal) {
          modal.store_no = this.store_no
          let url = this.getServiceUrl('bxportal', "srvstore_wifi_config_add", 'operate')
          let req = [{
            "serviceName": "srvstore_wifi_config_add",
            "condition": [],
            "data": [modal]
          }]
          let res = await this.$http.post(url, req)
          if (res.data.state === 'SUCCESS') {
            if (Array.isArray(res.data.response) && res.data.response
              .length > 0 && res.data.response[0].response?.effect_data[0]) {
              let result = res.data.response[0].response.effect_data[0]
              uni.showToast({
                title: '操作成功'
              })
              // #ifdef MP-WEIXIN
              this.startSearch()
              // #endif
            }
          }
          this.hideModal()
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make()
        }
      },
      getSavedWifi() {
        // 查找已保存WiFi
        let req = {
          "serviceName": "srvstore_wifi_config_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "like",
            "value": this.store_no
          }]
        }
        let url = this.getServiceUrl('bxportal', 'srvstore_wifi_config_select', 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
            this.pwdList = res.data.data.map(item => {
              item.BSSID = item.wifi_mac
              item.SSID = item.wifi_ssid
              item.password = item.wifi_psd
              return item
            })
          }
        })
      },
      getConnectedWifi() {
        let self = this
        wx.getConnectedWifi({
          success: (e) => {
            if (e && e.wifi) {
              self.connectedWifi = e.wifi
            }
          }
        })
      },
      selectWifi(e, type) {
        this.curWifi = e
        // this.showModal()
        if (type === 'share') {
          debugger
          if (this.qrCodeText) {
            this.makeQrCode()
            this.showModal('wifi-qrcode');
          }
        } else {
          this.connectWifi(e)
        }
      },
      selectUndefinedWifi(e) {

        this.undefinedWifi = e
        this.showModal('submit-pwd')
      },
      hideModal() {
        this.modalName = null
        this.curWifi = null
        this.undefinedWifi = null
        this.undefinedPassword = ''
        this.wifiQrcodeText = ''
      },
      showModal(modalName) {
        this.modalName = modalName
      },
      scanCode() {
        // 只允许从相机扫码
        uni.showLoading({
          title: '识别中...'
        })
        wx.scanCode({
          onlyFromCamera: true,
          success: (res) => {
            console.log(res)
            if (res && res.result) {
              this.wifiQrcodeText = res.result
              this.showModal('submit-pwd')
            }
          },
          complete: () => {
            uni.hideLoading()
          }
        })
      },
      submitWifiInfo(e, pwd) {
        console.log(e, pwd, 'submitWifiInfo');

        if (e?.wifi?.SSID) {
          let wifi = e.wifi
          let url = this.getServiceUrl('bxportal', 'srvstore_wifi_config_add', 'operate');
          let req = [{
            "serviceName": "srvstore_wifi_config_add",
            checkUnique: true,
            "condition": [],
            "data": [{
              "store_no": this.store_no,
              "wifi_mac": wifi.BSSID,
              "wifi_ssid": wifi.SSID,
              "wifi_psd": pwd
            }]
          }]
          this.$http.post(url, req).then(res => {
            console.log('submitWifiInfo', res.data)
            if (res.data.state === 'SUCCESS') {
              uni.showToast({
                title: 'WiFi配置提交成功',
                duration: 3000
              })
              uni.$emit("dataChange")
              this.getSavedWifi()
            }
          })
        }
      },
      connectWifi(e, isSubmit) {
        // 连接wifi
        if (!e?.SSID) {
          if (this.undefinedWifi && this.undefinedWifi.secure && this.undefinedWifi.SSID && this.undefinedPassword) {
            if (this.undefinedPassword.length >= 8) {
              e = {
                SSID: this.undefinedWifi.SSID,
                password: this.undefinedPassword
              }
            } else {
              uni.showToast({
                title: 'wifi密码必须大于8位',
                icon: 'none'
              })
            }
          } else {
            return
          }
        }
        if (!e?.SSID) {
          console.log('没有wifi名称')
          return
        }
        let {
          SSID,
          password
        } = e
        var self = this
        console.log(e)
        // uni.showToast({
        //   title: '连接中...',
        //   icon: 'none'
        // })
        uni.showLoading({
          title: '连接中...',
          mask: true
        })
        this.hideModal()
        wx.connectWifi({
          SSID,
          // BSSID: '',
          password,
          success(e) {
            self.getConnectedWifi()
            if (self.isIOS) { // 是否是IOS可通过提前调用getSystemInfo知道
              wx.onWifiConnected(result => {
                console.log('连接测试', result, SSID)
                if (result.wifi.SSID === SSID) {
                  // 连接成功
                  wx.vibrateLong()
                  uni.showModal({
                    title: SSID,
                    content: '连接成功',
                    showCancel: false
                  })
                  if (isSubmit) {
                    self.submitWifiInfo(result, password)
                  }
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
              wx.vibrateLong()
              if (isSubmit) {
                self.submitWifiInfo(e, password)
              }
              uni.showModal({
                title: SSID,
                content: '连接成功',
                showCancel: false
              })
            }
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
          },
          complete() {
            self.hideModal()
            uni.hideLoading()
          }
        })
      },
      async startSearch() {
        // 搜索wifi列表
        var self = this

        linkjs.getConnectedWifi().then(wifi => {
          self.connectedWifi = wifi
        })
        // self.getConnectedWifi()
        linkjs.startSearchWifi((res) => {
          console.log(res, 'startSearchWifi')
          self.wifiList = res.filter(item => item.SSID).sort((a, b) => b.signalStrength -
            a.signalStrength).map(wifi => {
            let strength = Math.ceil(wifi.signalStrength / 100 * 4)
            if (self.isIOS) {
              strength = Math.ceil(wifi.signalStrength * 4)
            }
            return Object.assign(wifi, {
              strength
            })
          })
        })

        return
        const getWifiList = () => {
          uni.showLoading({
            title: 'wifi列表加载中...'
          })
          wx.getWifiList({
            success: (res) => {
              isOpenWifi = true
              self.getConnectedWifi()
              wx.onGetWifiList((res) => {
                const wifiList = res.wifiList.filter(item => item.SSID).sort((a, b) => b.signalStrength -
                  a
                  .signalStrength).map(wifi => {
                  const strength = Math.ceil(wifi.signalStrength / 100 * 4)
                  return Object.assign(wifi, {
                    strength
                  })
                })
                console.log(wifiList)
                this.wifiList = wifiList
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
          linkjs.getConnectedWifi().then(wifi => {
            self.connectedWifi = wifi
          })
        } else {
          startWifi()
        }
      },
      stopSearch() {
        wx.stopWifi({
          success(res) {
            console.log(res);
          },
          fail(err) {
            console.error(err);
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
    onPullDownRefresh() {
      this.startSearch()
    }
  }
</script>

<style lang="scss" scoped>
  .scan-wifi-wrap {
    min-height: calc(100vh - var(--window-top));
    padding: 20rpx;

    .wifi-status-box {
      color: #fff;
      font-size: 36rpx;
      // background-image: linear-gradient(to right bottom, #30DAA9, #00D197);
      margin-bottom: 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      flex-direction: column;
      background-color: #15a3ef;
      padding: 20rpx;

      .wifi-status-icon {
        // width: 150rpx;
        // height: 150rpx;
        // line-height: 150rpx;
        text-align: center;
        font-size: 80rpx;
        color: #fff;
        border-radius: 50%;

        .wifi-status-ring {
          // border: 15rpx solid #1592d7;
          box-shadow: 10px 20px 30px 0px rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          width: 160rpx;
          height: 160rpx;

          &.inner {
            width: 120rpx;
            height: 120rpx;
            box-shadow: 10px 20px 20px 0px rgba(0, 0, 0, 0.1);
          }

          padding: 20rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1ca6f1;
        }
      }

      .wifi-info {
        padding: 10rpx;
        font-size: 28rpx;

        .wifi-ssid {
          padding: 10rpx;
          font-size: 24rpx;
        }
      }
    }

    .link-wifi-info {
      padding: 40rpx;

      .title {
        display: flex;
        justify-content: space-between;
        padding: 0 20rpx 20rpx;
      }

      .wifi-qrcode {
        width: 500rpx;
        height: 500rpx;
        padding: 20rpx;
        background-color: #f1f1f1;
        margin: 20rpx auto;

        .qrcode-container {
          width: 100%;
          height: 100%;
          padding: 10rpx;
          margin: 0 auto;

          .qrcode-canvas {
            position: fixed;
            top: -999999px;
          }

          .qr-code-image {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .qrcode-tip {
        font-size: 24rpx;
        color: #999;
        margin: 20rpx auto;
      }

      .logo {
        display: flex;
        min-height: 200rpx;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .wifi-logo {
          width: 100rpx;
          height: 100rpx;
          background-color: #0bc99d;
          line-height: 100rpx;
          text-align: center;
          font-size: 80rpx;
          color: #fff;
          border-radius: 20rpx;
        }
      }

      .wifi-info {
        padding: 20rpx 0;

        .info-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20rpx;

          .password {
            line-height: 80rpx;
            height: 80rpx;
            width: 100%;
            border-radius: 20rpx;
            background-color: #fff;
            margin: 10rpx;
          }

          .label {
            margin-right: 10rpx;
          }
        }
      }

      .handel-bottom {
        display: flex;
        padding: 40rpx 20rpx;
        justify-content: center;

        .button {
          display: flex;
          flex-direction: column;
          background-color: #0bc99d;

        }
      }
    }
  }

  .wifi-list {
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20rpx 20rpx;
    margin-bottom: 20rpx;

    .no-wifi {
      padding: 20rpx 0;
      // text-align: center;
      color: #999;
    }

    .refresh-icon {
      display: inline-block;
      width: 80rpx;
      height: 80rpx;
      padding: 10rpx;
      border-radius: 50%;
      background-color: #f1f1f1;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 40rpx;
    }

    .label {
      padding: 10rpx 20rpx;
      line-height: 80rpx;
      font-size: 36rpx;
      display: flex;
      justify-content: space-between;
    }

    .wifi-item {
      line-height: 80rpx;
      font-size: 32rpx;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .wifi-tip {
        font-size: 24rpx;
        color: #ccc;
      }

      .wifi-name {
        display: inline-flex;
        align-items: center;
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;

        .wifi-ssid {
          flex: 1;
        }
      }

      .handler {
        .text-blue {
          font-size: 24rpx;
        }
      }

    }
  }

  .list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 30rpx;

    .wifi-name {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .handler {
      flex: 1;

      .text-blue {
        font-size: 24rpx;
      }
    }
  }

  // .list text {
  //   display: inline-block;
  //   max-width: 80%;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   white-space: nowrap;
  // }

  .strength-ready {
    color: #26a69a;
  }

  .strength-no {
    color: #37474f;
  }

  .wifi-icon {
    width: 50rpx;
    height: 40rpx;
    display: inline-block;
    position: relative;
    overflow: hidden;
    margin: 0 20rpx;
    float: right;

    &.has-pwd {
      color: #15a3ef;
    }
  }

  .wifi-icon text {
    display: block;
    position: absolute;
    border-radius: 50%;
  }

  .wifi-icon .wifi-1 {
    background: currentcolor;
    width: 10rpx;
    height: 10rpx;
    left: 18rpx;
    bottom: 0rpx;
  }

  .wifi-icon .wifi-2,
  .wifi-icon .wifi-3,
  .wifi-icon .wifi-4 {
    border: 4rpx solid;
    border-color: currentcolor transparent transparent;
  }

  .wifi-icon .wifi-2 {
    width: 30rpx;
    height: 24rpx;
    left: 9rpx;
    bottom: -6rpx;
  }

  .wifi-icon .wifi-3 {
    width: 45rpx;
    height: 40rpx;
    left: 2rpx;
    bottom: -14rpx;
  }

  .wifi-icon .wifi-4 {
    width: 60rpx;
    height: 56rpx;
    left: -6rpx;
    bottom: -22rpx;
  }

  .wifi-icon text:after {
    content: "";
    display: block;
    position: absolute;
  }

  .wifi-icon .lock {
    width: 12rpx;
    height: 10rpx;
    background: currentcolor;
    display: block;
    right: 2rpx;
    bottom: 4rpx;
    border-radius: 0;
  }

  .wifi-icon .lock:after {
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

  .add-wifi-form {
    padding: 20rpx;

    .button-box {
      padding: 20rpx;
    }

    .cu-btn {
      width: 40%;

    }
  }
</style>
