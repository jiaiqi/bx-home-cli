<template>
  <view class="device-manager">
    <view class="device-list">
      <view
        class="device-item"
        v-for="item in deviceList"
        :key="item.ud_no"
        @click="toDeviceDetail(item)"
      >
        <view class="field">
          <view class="label"> 设备名称 </view>
          <view class="value">
            {{ item.person_remark_device_name || item.dt_name || "未知设备" }}
          </view>
          <text
            class="cuIcon-edit margin-left-sm text-cyan text-bold"
            @click="showUpdateDeviceName(item)"
          ></text>
        </view>
        <view class="field">
          <view class="label"> 设备序列号 </view>
          <view class="value">
            {{ item.dic_no }}
          </view>
        </view>
      </view>
    </view>

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
    <view class="cu-bar tabbar bg-white shadow foot">
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
    </view>
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
      store_no: '',
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
      } ]
    }
  },
  methods: {
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
      const res = await this.$fetch('select', 'srvhealth_store_user_device_select', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // this.deviceList = res.data
        let arr = []
        // dic_no
        const req2 = {
          "serviceName": "srviot_device_instance_code_select",
          "colNames": [ "*" ],
          "condition": [ {
            "colName": "dic_no",
            "ruleType": "in",
            "value": res.data.map(item => item.dic_no).toString()
          } ],
          "page": { "pageNo": 1, "rownumber": 10 }
        }
        const res2 = await this.$fetch('select', 'srviot_device_instance_code_select', req2, 'iot')
        if (Array.isArray(res2.data) && res2.data.length > 0) {
          const deviceList = res.data.map(item => {
            res2.data.forEach(element => {
              item = { ...element, ...item }
            });
            return item
          })
          this.deviceList = deviceList
        }

      }
    },
    hideModal () {
      this.modalName = ''
    }
  },

  onLoad (option) {
    if (option.store_no) {
      debugger
      this.store_no = option.store_no
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
          this.getDeviceList()
        }
      })
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.getDeviceList()
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1200);
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () { },
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
    border-radius: 100rpx;
    .field {
      display: flex;
      padding: 10rpx;
      align-items: center;
      .label {
        min-width: 180rpx;
        padding-right: 20rpx;
        font-weight: bold;
        text-align: right;
      }
      .value {
        font-size: 16px;
      }
    }
  }
}
.button-box {
  .cu-btn {
    width: 50%;
  }
}
</style>
