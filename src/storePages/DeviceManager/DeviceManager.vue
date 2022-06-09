<template>
  <view class="device-manager">
    <view class="device-list">
      <view class="device-item">
        <view class="add-device" @click="showTypeModal">
          <view class="add-btn"><text class="cuIcon-add"></text></view>
          <text class="add-label">添加设备</text>
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
              {{ item.dic_device_id || item.serial_number }}
            </view>
          </view>
        </view>
        <view class="button-list">
          <text
            class="device-data delete-btn text-orange"
            @click.stop="deleteDevice(item)"
          >
            删除设备
          </text>
          <button
            class="device-data round cu-btn bg-cyan"
            @click.stop="seeData(item)"
          >
            查看数据
          </button>
        </view>
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
              v-model="curDevName"
            />
          </view>
          <view class="button-box bg-white">
            <button
              class="cu-btn bg-cyan"
              type="primary"
              @tap="updateDeviceName"
              v-if="curDevName"
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
    <view
      class="cu-modal"
      :class="{ show: modalName === 'selectType' }"
      @click="hideModal"
    >
      <view class="cu-dialog" @click.stop="">
        <view class="cu-bar bg-white justify-end">
          <view class="content">选择设备型号</view>
          <view class="action" @tap="hideModal">
            <text class="cuIcon-close text-red"></text>
          </view>
        </view>
        <view class="select-type-modal">
          <view
            class="type-item"
            :class="{ active: selectedDeviceType.id === item.id }"
            v-for="item in deviceType"
            :key="item.id"
            @click="confirmDeviceType(item)"
          >
            <image
              :src="getImagePath(item.type_pic)"
              mode="scaleToFill"
              class="type-pic"
            />
            <view class="type-name">
              {{ item.dt_name || "" }}
            </view>
          </view>
          <view v-if="deviceType.length === 0">没有设备数据</view>
          <view class="buttons">
            <button class="cu-btn bg-gray" @click="hideModal">取消</button>
            <button
              class="cu-btn bg-blue"
              type="primary"
              @click="addDevice"
              v-if="selectedDeviceType.id"
            >
              扫码添加
            </button>
          </view>
        </view>
      </view>
    </view>
    <view
      class="cu-modal bottom-modal"
      :class="{ show: modalName === 'add-device' }"
    >
      <view class="cu-dialog" @click.stop="">
        <view class="add-device-modal">
          <view class="cu-bar bg-white justify-end">
            <view class="content">请确认设备信息与用户信息</view>
            <view class="action" @tap="hideModal">
              <text class="cuIcon-close text-red"></text>
            </view>
          </view>
          <view class="device-info">
            <view class="cu-form-group disabled">
              <view class="title">序列号：</view>
              <input
                name="input"
                :disabled="true"
                v-model="deviceInfo.dic_device_id"
              />
            </view>
            <view class="cu-form-group disabled">
              <view class="title">设备名称：</view>
              <input
                name="input"
                v-model="deviceInfo.person_remark_device_name"
              />
            </view>
            <view
              :key="index"
              class="cu-form-group user-item"
              v-for="(user, index) in deviceInfo.userList"
            >
              <view class="title">用户{{ index + 1 }}：</view>
              <input
                placeholder="请输入用户名"
                name="input"
                v-model="user.user_name"
              />
            </view>
          </view>
          <view class="button-box padding">
            <button @click="hideModal" class="cu-btn bg-gray margin-right">
              取消
            </button>
            <button
              class="cu-btn bg-blue"
              type="primary"
              @click="confirmAddDevice"
            >
              添加设备
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
      store_no: 'S20210506022',
      pageNo: 1,
      storeUserInfo: {},
      deviceList: [],
      deviceType: [],
      selectedDeviceType: {},
      deviceInfo: {},
      currentDevice: {},
      curDevName: "", //当前设备名称
      modalName: "",
      loadStatus: 'more', //more noMore loading 
      tabList: [ {
        iconPath: "cuIcon-home",
        selectedIconPath: "cuIcon-homefill",
        text: '我的设备',
        customIcon: false,
      },
      {
        iconPath: "cuIcon-circle",
        selectedIconPath: "cuIcon-circlefill",
        text: '我的亲友',
        customIcon: false,
      }, {
        iconPath: "cuIcon-friend",
        selectedIconPath: "cuIcon-friendfill",
        text: '授权管理',
        customIcon: false,
      } ],
      currentTab: 0,
    }
  },
  methods: {
    changeTab (index) {
      if (index === 1) {
        uni.redirectTo({ url: `/storePages/DeviceManager/family/family?store_no=${this.store_no}` })
      } else if (index === 2) {
        uni.redirectTo({ url: `/storePages/DeviceManager/manage/manage?store_no=${this.store_no}` })
      }
    },
    async getDeviceType () {
      const req = { "serviceName": "srviot_device_type_select", "colNames": [ "*" ], "condition": [], "page": { "pageNo": 1, "rownumber": 10 } }
      const res = await this.$fetch('select', 'srviot_device_type_select', req, 'iot')
      if (res.success) {
        this.deviceType = res.data
      }
    },
    showTypeModal () {
      this.modalName = 'selectType'

    },
    confirmDeviceType (e) {
      this.selectedDeviceType = e
    },
    deleteDevice (e) {
      uni.showModal({
        title: '确认删除设备',
        content: '若删除设备，设备关联的用户信息也会同步删除',
        success: (res) => {
          if (res.confirm) {
            this.confirmDelDevice(e)
          }
        }
      })
    },
    async confirmDelDevice (e) {
      // 1. 删除用户设备
      if (e.id && e.dic_no) {
        const req1 = [ { "serviceName": "srvhealth_store_user_device_delete", "condition": [ { "colName": "id", "ruleType": "in", "value": e.id } ] } ]
        const res1 = await this.$fetch('operate', 'srvhealth_store_user_device_delete', req1, 'health')
        if (res1.success) {
          // 2. 删除设备记录
          // const req2 = [ { "serviceName": "srviot_device_instance_code_delete", "condition": [ { "colName": "dic_no", "ruleType": "in", "value": e.dic_no } ] } ]
          // const res2 = await this.$fetch('operate', 'srviot_device_instance_code_delete', req2, 'iot')
          // if (res2.success) {
          uni.showModal({
            title: '提示',
            content: '删除成功',
            showCancel: false,
            success: () => {
              uni.startPullDownRefresh()
            }
          })
        }
        // }
      } else {
        uni.showToast({
          title: '设备信息有误，请刷新重试',
          icon: 'none',
          mask: true,
          duration: 2000
        })
      }

    },
    seeData (e) {
      // 跳转到数据展示页
      if (e.dic_device_id || e.serial_number) {
        uni.navigateTo({ url: `/storePages/DeviceData/DeviceData?ud_no=${e.ud_no}&dic_device_id=${e.dic_device_id || e.serial_number}` })
      }
    },
    toDeviceDetail (e) {
      const fieldsCond = [ { "column": "ud_no", "value": e.ud_no, "display": false } ]
      uni.navigateTo({
        url: `/publicPages/formPage/formPage?fieldsCond=${JSON.stringify(fieldsCond)}&serviceName=srvhealth_store_user_device_select&type=detail`
      })
    },
    showUpdateDeviceName (e) {
      this.currentDevice = this.deepClone(e)
      this.curDevName = e.person_remark_device_name || e.dt_name
      this.modalName = 'change-device'
    },
    updateDeviceName (e) {
      this.currentDevice.person_remark_device_name = this.curDevName
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
                  icon: "none",
                  duration: 2000

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
      if (this.store_no&&this.vstoreUser?.store_no === this.store_no) {
        return this.vstoreUser
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
        const deviceList = res.data
        this.loadStatus = 'more'
        if (type === 'more') {
          this.deviceList = [ ...this.deviceList, ...deviceList ]
        } else {
          this.deviceList = deviceList
        }
        // dic_no
        // const req2 = {
        //   "serviceName": "srviot_device_instance_code_select",
        //   "colNames": [ "*" ],
        //   "condition": [ {
        //     "colName": "dic_no",
        //     "ruleType": "in",
        //     "value": res.data.map(item => item.dic_no).toString()
        //   } ],
        //   "page": { "pageNo": this.pageNo, "rownumber": 10 }
        // }
        // const res2 = await this.$fetch('select', 'srviot_device_instance_code_select', req2, 'iot')
        // if (Array.isArray(res2.data) && res2.data.length > 0) {
        //   const deviceList = res.data.map(item => {
        //     res2.data.forEach(element => {
        //       Object.keys(element).forEach(key => {
        //         if (key !== 'id' && element[ key ] && !item[ key ]) {
        //           item[ key ] = element[ key ]
        //         }
        //       })
        //     });
        //     return item
        //   })
        //   if (type === 'more') {
        //     this.deviceList = [ ...this.deviceList, ...deviceList ]
        //   } else {
        //     this.deviceList = deviceList
        //   }
        //   this.loadStatus = 'more'
        //   // 保存当前用户的设备列表
        //   this.$store.commit('SET_DEVICE_LIST', deviceList)
        // } else {
        //   this.loadStatus = 'noMore'
        // }
      } else {
        if (res.data.length == 0) {
          if (type !== 'more') {
            this.deviceList = []
          }
        }
        this.loadStatus = 'noMore'
      }
    },
    hideModal () {
      this.modalName = ''
      this.selectedDeviceType = []
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
    async selectDeviceInfo (dt_no) {
      // 查找设备信息
      const req = {
        "serviceName": "srviot_device_type_select",
        "colNames": [ "*" ],
        "condition": [ {
          colName: 'dt_no',
          ruleType: 'eq',
          value: dt_no
        } ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      const res = await this.$fetch('select', 'srviot_device_type_select', req, 'iot')
      if (res.success && res.data.length > 0) {
        return res.data[ 0 ]
      }
    },
    insertDeviceRecord () {

    },
    insertUserDevice () {

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
    async confirmAddDevice (e) {
      const info = this.deviceInfo;
      // 添加设备记录、用户设备信息
      const req1 = [ {
        "serviceName": "srviot_device_instance_code_add",
        "condition": [],
        "data": [ { "dic_device_id": info.dic_device_id, "dt_no": info.dt_no, "type_pic": info.type_pic } ]
      } ]

      const res1 = await this.$fetch("operate", 'srviot_device_instance_code_add', req1, 'iot')
      if (res1.success && res1.data.length > 0) {
        // 设备没有添加过
        console.log(info)
        const result = res1.data[ 0 ]
        this.insertUserDevice(result, info)
        // const req2 = [
        //   {
        //     "serviceName": "srvhealth_store_user_device_add",
        //     "condition": [],
        //     "data": [
        //       {
        //         "user_count": this.deviceInfo.user_count,
        //         "dt_name": this.deviceInfo.dt_name,
        //         "type_pic": this.deviceInfo.type_pic,
        //         "dic_no": result.dic_no, "serial_number": result.dic_device_id,
        //         "store_user_no": this.storeUserInfo.store_user_no,
        //         "store_no": this.store_no, "person_no": this.userInfo.no,
        //         "sex": this.userInfo.sex, "user_device_role": "用户",
        //         "record_table": this.deviceInfo.record_table,
        //         user_id_col: this.deviceInfo.user_id_col,
        //         // "child_data_list": childList
        //       }
        //     ]

        //   }
        // ]

        // const res2 = await this.$fetch("operate", 'srvhealth_store_user_device_add', req2, 'health')

        // if (res2.success) {
        //   // uni.showToast({
        //   //   title: '设备添加成功',
        //   //   icon: 'success',
        //   //   mask: true
        //   // })
        //   if (res2.data.length > 0) {
        //     const data = res2.data[ 0 ]
        //     const req3 = [
        //       {
        //         "serviceName": "srvhealth_store_user_device_user_add",
        //         "condition": [],
        //         "data": userList.map((item, index) => {
        //           const obj = { ud_no: data.ud_no, "dev_user_index": index + '', "person_no": this.userInfo.no, "user_name": item.user_name }
        //           if (info.record_table === 'bxiot_ap_user_bp_data') {
        //             obj.dev_user_index = index + 1 + ''
        //           }
        //           return obj
        //         })
        //       }
        //     ]
        //     const res3 = await this.$fetch("operate", 'srvhealth_store_user_device_user_add', req3, 'health')
        //     if (res3.success) {
        //       uni.showToast({
        //         title: '设备添加成功',
        //         icon: 'none',
        //         mask: true
        //       })
        //     } else {
        //       uni.showToast({
        //         title: res3?.msg || '设备添加失败',
        //         icon: 'none',
        //         mask: true,
        //         duration: 2000
        //       })
        //     }
        //   }
        // } else {
        //   uni.showToast({
        //     title: res2?.msg || '设备添加失败,请重试',
        //     icon: 'none',
        //     duration: 2000
        //   })
        // }
        // uni.startPullDownRefresh()
      } else if (res1?.code === '4444') {
        // 数据重复 设备已经被添加

        const req = { "serviceName": "srviot_device_instance_code_select", "colNames": [ "*" ], "condition": [ { colName: 'dic_device_id', ruleType: 'eq', value: info.dic_device_id } ], "page": { "pageNo": 1, "rownumber": 10 } }
        const res = await this.$fetch("select", 'srviot_device_instance_code_select', req, 'iot')
        if (Array.isArray(res.data) && res.data.length > 0) {
          let deviceInfo = res.data[ 0 ]
          deviceInfo.person_remark_device_name = deviceInfo.person_remark_device_name || deviceInfo.dt_name
          this.insertUserDevice(deviceInfo, info)
        }
      } else {

        uni.showToast({
          title: res1?.msg || '设备添加失败,请重试',
          icon: 'none'
        })
      }
      this.hideModal()

    },
    async insertUserDevice (result, info) {
      const userList = info.userList

      const req2 = [
        {
          "serviceName": "srvhealth_store_user_device_add",
          "condition": [],
          "data": [
            {
              "user_count": this.deviceInfo.user_count,
              "dt_name": this.deviceInfo.dt_name,
              "type_pic": this.deviceInfo.type_pic,
              "dic_no": result.dic_no, "serial_number": result.dic_device_id,
              "store_user_no": this.storeUserInfo.store_user_no,
              "store_no": this.store_no, "person_no": this.userInfo.no,
              "sex": this.userInfo.sex, "user_device_role": "用户",
              "record_table": this.deviceInfo.record_table,
              user_id_col: this.deviceInfo.user_id_col,
              // "child_data_list": childList
            }
          ]

        }
      ]

      const res2 = await this.$fetch("operate", 'srvhealth_store_user_device_add', req2, 'health')

      if (res2.success) {
        // uni.showToast({
        //   title: '设备添加成功',
        //   icon: 'success',
        //   mask: true
        // })
        if (res2.data.length > 0) {
          const data = res2.data[ 0 ]
          const req3 = [
            {
              "serviceName": "srvhealth_store_user_device_user_add",
              "condition": [],
              "data": userList.map((item, index) => {
                const obj = { ud_no: data.ud_no, "dev_user_index": index + '', "person_no": this.userInfo.no, "user_name": item.user_name }
                if (info.record_table === 'bxiot_ap_user_bp_data') {
                  obj.dev_user_index = index + 1 + ''
                }
                return obj
              })
            }
          ]
          const res3 = await this.$fetch("operate", 'srvhealth_store_user_device_user_add', req3, 'health')
          if (res3.success) {
            uni.showToast({
              title: '设备添加成功',
              icon: 'none',
              mask: true
            })
          } else {
            uni.showToast({
              title: res3?.msg || '设备添加失败',
              icon: 'none',
              mask: true,
              duration: 2000
            })
          }
        }
      } else {
        uni.showToast({
          title: res2?.msg || '设备添加失败,请重试',
          icon: 'none',
          duration: 2000
        })
      }
      uni.startPullDownRefresh()
    },
    async addDevice () {
      const { selectedDeviceType } = this
      let result = await this.scanCode()
      if (selectedDeviceType && selectedDeviceType.dt_no) {
        if (typeof result === 'string') {
          result = { dic_device_id: result, dt_no: selectedDeviceType.dt_no }
        } else {
          result = { ...result, dt_no: selectedDeviceType.dt_no }
        }
      }
      // let data = await this.getDeviceInfoWithDIC(result)
      if (result.dt_no && result.dic_device_id) {
        let deviceInfo = await this.selectDeviceInfo(result.dt_no)
        deviceInfo.person_remark_device_name = deviceInfo.person_remark_device_name || deviceInfo.dt_name
        if (deviceInfo) {
          // 根据型号查找到设备信息
          deviceInfo.dic_device_id = result.dic_device_id
          if (deviceInfo.user_count === null) {
            deviceInfo.user_count = 1
          }
          deviceInfo.userList = []
          for (let index = 1; index <= deviceInfo.user_count; index++) {
            deviceInfo.userList.push({
              user_name: `用户${index}`
            })
          }
          this.deviceInfo = deviceInfo
          this.modalName = 'add-device'
        } else {
          uni.showModal({
            title: '未找到设备信息',
            content: '请稍后尝试重新扫描二维码',
            showCancel: false
          })
          return
        }
      }
      return
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
              if (res.result.indexOf('&') == -1) {
                resolve(res.result)
              } else {
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
          this.getDeviceType()
          this.getDeviceList()
          // uni.startPullDownRefresh()
          // this.getDeviceList()
        }
      })
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.loadStatus = 'more'
    this.getDeviceType()
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
    .button-list {
      display: flex;
      justify-content: space-around;
      width: 100%;
      .device-data {
        width: 200rpx;
        display: flex;
        align-items: center;
        &.delete-btn {
          // border-bottom: 1px solid #e54d42;
        }
        & + .device-data {
          margin-left: 20px;
        }
      }
    }
    // .device-data {
    //   // width: 50%;
    //   // margin: 0 25%;
    //   margin-right: 0;
    //   margin-left: 67%;
    //   width: 100px;
    // }
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
.add-device-modal {
  background-color: #fff;
  min-height: 40vh;
  padding-bottom: 150rpx;
  .device-info {
    .cu-form-group {
      .title {
        min-width: 200rpx;
      }
      &.disabled {
        opacity: 0.6;
      }
    }
  }
  .button-box {
    display: flex;
    justify-content: space-around;
    .cu-btn {
      width: 45%;
    }
  }
}
.select-type-modal {
  padding: 20rpx;
  background-color: #fff;

  .type-item {
    border-radius: 20rpx;
    background-color: #fafafa;
    margin-bottom: 10rpx;
    display: flex;
    transition: all ease-in 0.3s;
    overflow: hidden;
    .type-pic {
      width: 150rpx;
      height: 150rpx;
      margin-right: 20rpx;
    }
    .type-name {
      flex: 1;
      padding: 20rpx;
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
    }
    &:active {
      transform: scale(1.1);
    }
    &.active {
      border: #1cbbb4 solid 1px;
      color: #1cbbb4;
      background-color: rgba(28, 187, 180, 0.1);
    }
    // &.bg-cyan {
    //   background-color: #1cbbb4;
    // }

    &:last-child {
      margin-bottom: 50rpx;
    }
  }
  .buttons {
    display: flex;
    padding: 20rpx;
    background-color: #fff;
    justify-content: space-around;
    .cu-btn {
      width: 45%;
    }
  }
}
</style>
