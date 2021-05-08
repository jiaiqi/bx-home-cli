<template>
  <view class="device-manager">
    <view class="device-list">
      <view class="device-item">
        <view class="add-device" @click="addDevice">
          <view class="add-btn"><text class="cuIcon-add"></text></view>
          <text class="add-label">添加新设备</text>
        </view>
      </view>
      <view
        class="device-item"
        v-for="item in deviceList"
        :key="item.ud_no"
        @click="toDeviceDetail(item)"
      >
        <view class="type-pic">
          <image
            v-if="item.type_pic"
            class="type-pic"
            :src="getImagePath(item.type_pic)"
            mode="scaleToFill"
          />
          <text class="cuIcon-question type-pic" v-else></text>
        </view>
        <view class="field-list">
          <view class="field">
            <view class="label"> 设备名称 </view>
            <view class="value">
              {{ item.person_remark_device_name || item.dt_name || "未知设备" }}
            </view>
            <text
              class="cuIcon-edit margin-left-sm text-cyan text-bold"
              @click.stop="showUpdateDeviceName(item)"
            ></text>
          </view>
          <view class="field">
            <view class="label"> 设备序列号 </view>
            <view class="value">
              {{ item.dic_device_id }}
            </view>
          </view>
        </view>
        <view
          class="device-data round cu-btn bg-cyan"
          @click.stop="seeData(item)"
          >查看数据</view
        >
      </view>
    </view>
    <uni-load-more class="load-more" :status="loadStatus"></uni-load-more>

    <view
      class="cu-modal"
      @click="hideModal"
      :class="{ show: modalName === 'change-device' }"
    >
      <view class="cu-dialog" @click.stop="">
        <view
          class="change-device padding bg-white"
          v-if="
            currentDevice &&
            (currentDevice.dt_name || currentDevice.person_remark_device_name)
          "
        >
          <view class="cu-bar bg-white justify-end">
            <view class="content">修改设备名称</view>
            <view class="action" @tap="hideModal">
              <text class="cuIcon-close text-red"></text>
            </view>
          </view>
          <view class="cu-form-group">
            <view class="title">设备名称：</view>
            <input
              placeholder="输入设备名称"
              name="input"
              v-model="currentDevice.person_remark_device_name"
            />
          </view>
          <view class="button-box bg-white">
            <button
              class="cu-btn bg-cyan"
              type="primary"
              @tap="updateDeviceName"
              v-if="currentDevice.person_remark_device_name"
            >
              修改
            </button>
            <button
              class="cu-btn bg-cyan"
              type="primary"
              @tap="updateDeviceName"
              v-else
            >
              恢复默认名称
            </button>
          </view>
        </view>
      </view>
    </view>
    <!-- <view class="cu-bar tabbar bg-white shadow foot">
      <view
        class="action"
        v-for="(tab, index) in tabList"
        :key="tab.text"
        @click="changeTab(index)"
      >
        <view class="cuIcon-cu-image">
          <text
            :class="
              currentTab !== index
                ? tab.iconPath + ' ' + 'text-gray'
                : tab.selectedIconPath + ' ' + 'text-cyan'
            "
          ></text>
        </view>
        <view :class="currentTab == index ? 'text-cyan' : 'text-gray'">
          {{ tab.text }}
        </view>
      </view>
    </view> -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    })
  },
  data () {
    return {
      store_no: 'S20210506022',
      pageNo: 1,
      storeUserInfo: {},
      deviceList: [],
      currentDevice: {},
      curDevName: "", //当前设备名称
      modalName: "",
      currentTab: 0,
      tabList: [ {
        iconPath: "cuIcon-home",
        selectedIconPath: "cuIcon-homefill",
        text: '设备',
        customIcon: false,
      },
      {
        iconPath: "cuIcon-circle",
        selectedIconPath: "cuIcon-circlefill",
        text: '状态',
        customIcon: false,
      } ],
      loadStatus: 'more', //more noMore loading 
    }
  },
  methods: {
    seeData (e) {
      // 跳转到数据展示页
      if (e.dic_device_id) {
        uni.navigateTo({ url: `/storePages/DeviceData/DeviceData?dic_device_id=${e.dic_device_id}` })
      }
    },
    changeTab (index) {
      if (index === 1) {
        uni.redirectTo({
          url: `/personalPages/HealthHistory/HealthHistory?storeNo=${this.store_no}`
        })
      }
    },
    toDeviceDetail (e) {
      const fieldsCond = [ { "column": "ud_no", "value": e.ud_no, "display": false } ]
      uni.navigateTo({
        url: `/publicPages/form/form?fieldsCond=${JSON.stringify(fieldsCond)}&serviceName=srvhealth_store_user_device_select&type=detail`
      })
    },
    showUpdateDeviceName (e) {
      this.currentDevice = this.deepClone(e)
      this.curDevName = e.person_remark_device_name || e.dt_name
      this.modalName = 'change-device'
    },
    updateDeviceName (e) {
      if (this.curDevName === this.currentDevice.person_remark_device_name) {
        return
      }
      if (!this.currentDevice.person_remark_device_name) {
        this.currentDevice.person_remark_device_name = this.currentDevice.dt_name
      }
      uni.showModal({
        title: "提示",
        content: `是否将设备名称修改为[${this.currentDevice.person_remark_device_name}]`,
        success: (res) => {
          if (res.confirm) {
            const req = [ {
              "serviceName": "srvhealth_store_user_device_update",
              "condition": [ { "colName": "id", "ruleType": "eq", "value": this.currentDevice.id } ],
              "data": [ { "person_remark_device_name": this.currentDevice.person_remark_device_name } ]
            } ]
            this.$fetch('operate', 'srvhealth_store_user_device_update', req, 'health').then(res => {
              if (res.success) {
                uni.showToast({
                  title: "修改成功"
                })
                this.getDeviceList()
              } else {
                uni.showToast({
                  title: res.msg,
                  icon: "none"
                })
              }
            })
            this.currentDevice = null
          }
          this.hideModal()
        }
      })


    },
    async getStoreUser () {
      // 查找用户信息
      const req = {
        "serviceName": "srvhealth_store_user_select",
        "colNames": [ "*" ],
        "condition": [
          { "colName": "store_no", "ruleType": "eq", "value": this.store_no },
          { "colName": "person_no", "ruleType": "eq", "value": this.userInfo.no }
        ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      const res = await this.$fetch('select', 'srvhealth_store_user_select', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        this.storeUserInfo = res.data[ 0 ]
        return res.data[ 0 ]
      } else {
        return false
      }
    },
    async getDeviceList (type = 'refresh') {
      // 查找设备列表
      if (type === 'refresh') {
        this.pageNo = 1
      } else if (type === 'more') {
        this.pageNo += 1
      }
      const req = {
        "serviceName": "srvhealth_store_user_device_select",
        "colNames": [ "*" ],
        "condition": [ {
          "colName": "store_user_no",
          "ruleType": 'eq',
          "value": this.storeUserInfo.store_user_no
        } ],
        "page": { "pageNo": this.pageNo, "rownumber": 10 },
        "order": [ { colName: "create_time", orderType: "desc" } ]
      }
      this.loadStatus = 'loading'
      const res = await this.$fetch('select', 'srvhealth_store_user_device_select', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // this.deviceList = res.data
        // dic_no
        const req2 = {
          "serviceName": "srviot_device_instance_code_select",
          "colNames": [ "*" ],
          "condition": [ {
            "colName": "dic_no",
            "ruleType": "in",
            "value": res.data.map(item => item.dic_no).toString()
          } ],
          "page": { "pageNo": this.pageNo, "rownumber": 10 }
        }
        const res2 = await this.$fetch('select', 'srviot_device_instance_code_select', req2, 'iot')
        if (Array.isArray(res2.data) && res2.data.length > 0) {
          const deviceList = res.data.map(item => {
            res2.data.forEach(element => {
              Object.keys(element).forEach(key => {
                if (key !== 'id' && element[ key ] && !item[ key ]) {
                  item[ key ] = element[ key ]
                }
              })
            });
            return item
          })
          if (type === 'more') {
            this.deviceList = [ ...this.deviceList, ...deviceList ]
          } else {
            this.deviceList = deviceList
          }
          this.loadStatus = 'more'
          // 保存当前用户的设备列表
          this.$store.commit('SET_DEVICE_LIST', deviceList)
        } else {
          this.loadStatus = 'noMore'
        }

      } else {
        this.loadStatus = 'noMore'
      }
    },
    hideModal () {
      this.modalName = ''
    },
    parseCode (result) {
      let arr = result.split('&')
      if (Array.isArray(arr) && arr.length >= 2) {
        let obj = arr.reduce((pre, cur) => {
          const curArr = cur.split("=")
          if (cur && curArr.length === 2) {
            pre[ curArr[ 0 ] ] = curArr[ 1 ]
          }
          return pre
        }, {})
        return obj
      }
    },
    async getDeviceInfoWithDIC (e) {
      // 通过序列号查找设备信息
      const req = {
        "serviceName": "srviot_device_instance_code_select", "colNames": [ "*" ],
        "condition": [ {
          colName: "dic_device_id",
          ruleType: "eq",
          value: e.dic_device_id
        } ],
        "page": {
          "pageNo": 1, "rownumber": 1
        }
      }
      const res = await this.$fetch('select', 'srviot_device_instance_code_select', req, 'iot')
      if (res.success && res.data.length > 0) {
        return res.data[ 0 ]
      }
    },
    async getDeviceTypeWithDp (e) {
      // 通过设备型号编码查找型号信息
    },
    async addDevice () {
      let result = await this.scanCode()
      let data = await this.getDeviceInfoWithDIC(result)
      if (data && data.dic_no) {
        // 绑定设备
        const req = [
          {
            "serviceName": "srvhealth_store_user_device_add",
            "condition": [],
            "data": [
              {
                "dic_no": data.dic_no,
                "type_pic": data.type_pic,
                "person_remark_device_name": data.dt_name,
                "store_user_no": this.storeUserInfo.store_user_no,
                "store_no": this.store_no,
                "person_no": this.storeUserInfo.person_no,
                "user_device_role": "用户"
              }
            ]
          }
        ]
        const res = await this.$fetch('operate', 'srvhealth_store_user_device_add', req, 'health')
        if (res.success) {
          // uni.showToast({
          //   title: '设备绑定成功',
          //   icon: 'none',
          //   mask: true
          // })
          uni.startPullDownRefresh()
          console.log(res.data)
          if (Array.isArray(res.data) && res.data.length > 0) {
            uni.showModal({
              title: '设备绑定成功',
              content: '是否需要修改默认设备名称',
              success: (res1) => {
                if (res1.confirm) {
                  this.showUpdateDeviceName(res.data[ 0 ])
                }
              }
            })
          }

        }
      }
      // if(data&&data.dp_no){

      // }
    },
    scanCode () {
      return new Promise((resolve, reject) => {
        uni.scanCode({
          onlyFromCamera: false,
          scanType: [ 'qrCode', 'barCode' ],
          success: (res) => {
            console.log('条码类型：' + res.scanType);
            console.log('条码内容：' + res.result);
            if (res.result) {
              const result = this.parseCode(res.result)
              if (result && result.dt_no && (result.dic_device_id || result.ddid)) {
                if (result.dt_no.indexOf("DT") === -1) {
                  result.dt_no = "DT" + result.dt_no
                }
                if (result.ddid) {
                  result.dic_device_id = result.ddid
                }
                resolve(result)
              } else {
                resolve(null)
              }
            } else {
              resolve(null)
            }
          },
          fail: (error) => {
            console.log('扫码失败：' + error);
            reject(error)
          }
        })
      })

    }
  },

  async onLoad (option) {
    await this.toAddPage()
    if (option.store_no) {
      this.store_no = option.store_no
    }
    if (this.store_no) {
      this.getStoreUser().then(info => {
        if (!info || !info.store_user_no) {
          uni.showModal({
            title: '提示',
            content: "未找到用户信息,请先绑定为店铺用户",
            showCancel: false,
            confirmText: "返回",
            success: () => {
              uni.navigateBack()
            }
          })
        } else {
          uni.startPullDownRefresh()
          // this.getDeviceList()
        }
      })
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.loadStatus = 'more'
    this.getDeviceList()
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1200);
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () {
    if (this.loadStatus === 'more') {
      this.getDeviceList('more')

    }
  },
  // 页面处理函数--监听页面滚动(not-nvue)
  /* onPageScroll(event) {}, */
  // 页面处理函数--用户点击右上角分享
  /* onShareAppMessage(options) {}, */
};
</script>

<style lang="scss" scoped>
.device-manager {
  min-height: calc(100vh - var(--window-top) + 10rpx);
}
.device-list {
  padding: 20rpx;
  .device-item {
    padding: 20rpx;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    min-height: 150rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .device-data {
      width: 50%;
      margin: 0 25%;
    }
    .field-list {
      width: calc(100% - 110rpx);
    }
    .type-pic {
      width: 100rpx;
      height: 100rpx;
      margin-right: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }

    .field {
      display: flex;
      padding: 10rpx;
      align-items: center;
      .label {
        min-width: 180rpx;
        padding-right: 20rpx;
        font-weight: bold;
        text-align: left;
      }
      .value {
        max-width: 300rpx;
      }
    }
    .add-device {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .add-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      background: #dbdbdb;
      font-size: 50rpx;
      overflow: hidden;
      border-radius: 50%;
      color: #fff;
      font-weight: bold;
    }
    .add-label {
      color: #999;
      margin-top: 5rpx;
    }
  }
}
.cu-form-group {
  input {
    text-align: left;
  }
}
.button-box {
  .cu-btn {
    width: 50%;
  }
}
</style>
