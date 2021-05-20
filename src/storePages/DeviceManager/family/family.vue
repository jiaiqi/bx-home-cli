<template>
  <view>
    <view class="family-list">
      <view
        class="family-item"
        v-for="item in kins"
        :key="item.row_no"
        :class="{ active: currentKin === item.userb_person_no }"
      >
        <image
          :src="getImagePath(item.userb_image)"
          mode="scaleToFill"
          class="user-image"
        />
        <view class="user-name">
          {{ item.userb_name }}
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
    <view class="device-list">
      <view class="device-item" v-for="item in deviceList" :key="item.ud_no">
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
          </view>
          <view class="field">
            <view class="label"> 设备序列号 </view>
            <view class="value">
              {{ item.dic_device_id || item.serial_number }}
            </view>
          </view>
        </view>
        <view class="button-list">
          <button
            class="device-data round cu-btn bg-cyan"
            @click.stop="seeData(item)"
          >
            查看数据
          </button>
        </view>
      </view>
    </view>
    <uni-load-more
      class="load-more"
      :status="loadStatus"
      v-if="deviceList.length > 0 && loadStatus === 'noMore'"
    ></uni-load-more>
    <u-empty
      text="该亲友没有绑定设备"
      mode="order"
      v-else-if="currentKin"
    ></u-empty>
    <u-empty text="暂无关联亲友账号" mode="order" v-else></u-empty>
    <view class="cu-modal" :class="{ show: showExitModal }">
      <view class="cu-dialog bg-white">
        <view class="cu-bar bg-white justify-end">
          <view class="content">操作成功</view>
          <!-- <view class="action" @tap="hideModal"
            ><text class="cuIcon-close text-red"></text
          ></view> -->
        </view>
        <view class="padding-xl"> 您的亲友已经可以查看您的数据了 </view>
        <!-- <navigator
          class="cu-btn bg-blue round margin-bottom"
          open-type="exit"
          target="miniProgram"
        >
          知道了</navigator -->
        >
      </view>
    </view>
    <view class="cu-modal"> </view>
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
      showExitModal: false,
      kins: [],
      deviceList: [],
      currentKin: '',
      store_no: "",
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
        iconPath: "cuIcon-add",
        selectedIconPath: "cuIcon-add",
        text: '添加亲友',
        customIcon: false,
      } ],
      currentTab: 1,
      loadStatus: 'more',
      pageNo: 1,
      inviterInfo: {},
      loadStatusText: {
        contentdown: "上拉显示更多", contentrefresh: "加载中,请稍后...", contentnomore: "没有更多数据了"
      }
    }
  },
  methods: {
    hideModal () {
      this.showExitModal = false
    },
    toAddKin () {
      // 添加亲友

    },
    seeData (e) {
      // 跳转到数据展示页
      if (e.dic_device_id || e.serial_number) {
        uni.navigateTo({ url: `/storePages/DeviceData/DeviceData?ud_no=${e.ud_no}&dic_device_id=${e.dic_device_id || e.serial_number}` })
      }
    },
    async bindKin () {
      const inviterInfo = this.inviterInfo
      if (inviterInfo.no && inviterInfo.userno && inviterInfo.name) {
        let serviceName = 'srvhealth_person_relation_add';
        let url = this.getServiceUrl('health', serviceName, 'operate');
        let req = [ {
          serviceName: 'srvhealth_person_relation_add',
          condition: [],
          data: [
            //   {
            //   relation_type: '家属',
            //   state: '正常',
            //   usera_name: inviterInfo.name,
            //   usera_no: inviterInfo.userno,
            //   usera_person_no: inviterInfo.no,
            //   // usera_profile_url: docInfo.profile_url,
            //   userb_name: this.userInfo.name,
            //   userb_no: this.userInfo.userno,
            //   userb_person_no: this.userInfo.no,
            //   userb_image: this.userInfo.user_image,
            //   userb_profile_url: this.userInfo
            //     .profile_url,
            //   userb_sex: this.userInfo.sex
            // } 
            {
              relation_type: '家属',
              state: '正常',
              usera_name: this.userInfo.name,
              usera_no: this.userInfo.userno,
              usera_person_no: this.userInfo.no,
              // usera_profile_url: docInfo.profile_url,
              userb_name: inviterInfo.name,
              userb_no: inviterInfo.userno,
              userb_person_no: inviterInfo.no,
            }
          ]
        } ];
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    async addToMyKin () {
      // 将某个用户添加为当前登录用户的亲友
      const promise = new Promise((resolve) => {
        uni.showModal({
          title: `提示`,
          content: `是否添加【${this.inviterInfo.name}】的帐号为亲友账号`,
          cancelText: "不同意",
          confirmText: "同意",
          success: (res) => {
            if (res.confirm) {
              resolve(true)
            } else {
              resolve(false)
            }
          }
        })
      })
      const isConsent = await promise
      if (isConsent) {
        const bindSuccess = await this.bindKin()
        if (bindSuccess) {
          // this.showExitModal = true
          uni.showModal({
            title: '提示',
            content: '添加亲友成功，您可以查看Ta的数据啦',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                this.getKins()
              }
            }
          })
        } else {
          uni.showModal({
            title: '提示',
            content: '操作失败,请退出小程序后重试',
            showCancel: false
          })
        }
      }
    },
    switchKin (e) {
      this.currentKin = e.userb_person_no
      this.getDeviceList('refresh')
    },
    async getKins () {
      // 查找亲友列表
      let req = { "serviceName": "srvhealth_person_relation_select", "colNames": [ "*" ], "condition": [ { colName: "usera_no", ruleType: 'eq', value: this.userInfo.userno }, { colName: "relation_type", ruleType: 'eq', value: "家属" } ], "page": { "pageNo": this.pageNo || 1, "rownumber": 20 }, "order": [], "draft": false, "query_source": "list_page" }
      const res = await this.$fetch('select', 'srvhealth_person_relation_select', req, 'health')
      if (res.success) {
        this.kins = res.data
        if (!this.currentKin && this, this.kins.length > 0) {
          this.currentKin = this.kins[ 0 ].userb_person_no
        }
        if (this.currentKin) {
          this.getDeviceList()
        }
        // if (res.page.pageNo * res.page.rownumber >= res.page.total) {
        //   this.loadStatus = 'noMore'
        // } else {
        //   this.loadStatus = 'more'
        // }
      }
    },
    async getDeviceList (type = 'refresh') {
      // 查找设备列表
      if (!this.currentKin) {
        return
      }
      if (type === 'refresh') {
        this.pageNo = 1
      } else if (type === 'more') {
        this.pageNo += 1
      }
      const req = {
        "serviceName": "srvhealth_store_user_device_select",
        "colNames": [ "*" ],
        "condition": [ {
          "colName": "person_no",
          "ruleType": 'eq',
          "value": this.currentKin
        } ],
        "page": { "pageNo": this.pageNo, "rownumber": 10 },
        "order": [ { colName: "create_time", orderType: "desc" } ]
      }
      this.loadStatus = 'loading'
      const res = await this.$fetch('select', 'srvhealth_store_user_device_select', req, 'health')
      debugger
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // this.deviceList = res.data
        const deviceList = res.data
        if (type === 'more') {
          this.deviceList = [ ...this.deviceList, ...deviceList ]
        } else {
          this.deviceList = deviceList
        }
        if (res.page) {
          if (res.page.pageNo * res.page.rownumber >= res.page.total) {
            this.loadStatus = 'noMore'
          } else {
            this.loadStatus = 'more'
          }
        }
      } else {
        if (res.data.length == 0) {
          if (type !== 'more') {
            this.deviceList = []
          }
        }
        this.loadStatus = 'noMore'
      }
    },
    changeTab (index) {
      if (index === 0) {
        uni.redirectTo({ url: `/storePages/DeviceManager/DeviceManager?store_no=${this.store_no}` })
      } else if (index === 2) {
        uni.showModal({
          title: '提示',
          content: '点击小程序右上方胶囊按钮，发送本页面到微信好友，即可向该好友申请绑定亲友',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    },
  },
  // 页面周期函数--监听页面加载
  async onLoad (option) {
    await this.toAddPage()
    if (option.store_no) {
      this.store_no = option.store_no
      if (this.userInfo?.userno) {
        this.getKins()
      }
    }
    if (option.inviter_userno && option.inviter_no && option.inviter_name) {
      this.inviterInfo.userno = option.inviter_userno
      this.inviterInfo.no = option.inviter_no
      this.inviterInfo.name = option.inviter_name
      this.addToMyKin()
    }


  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.pageNo = 1
    this.getKins()
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 500);
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () {
    if (this.loadStatus === 'more') {
      this.pageNo++
      this.getKins('loadmore')
    }
  },
  // 页面处理函数--监听页面滚动(not-nvue)
  /* onPageScroll(event) {}, */
  // 页面处理函数--用户点击右上角分享
  onShareAppMessage () {
    return {
      title: `${this.userInfo.name || this.userInfo.nick_name}申请成为您的亲友`,
      path: `/storePages/DeviceManager/family/family?inviter_userno=${this.userInfo.userno}&inviter_no=${this.userInfo.no}&store_no=${this.store_no}&inviter_name=${this.userInfo.name || this.userInfo.nick_name}`,
    }
  }
};
</script>

<style scoped lang="scss">
.family-list {
  padding: 20rpx;
  display: flex;
  overflow-y: scroll;
  // flex-wrap: wrap;
  .family-item {
    // width: calc(25% - 60rpx / 4);
    // width: 25%;
    // padding: 20rpx;
    // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    // border-radius: 20rpx;
    // min-height: 200rpx;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    // justify-content: center;
    flex-wrap: wrap;
    margin-left: 20rpx;
    // margin-bottom: 20rpx;
    box-sizing: border-box;
    overflow: hidden;
    transition: all 0.5s ease;
    &:first-child {
      margin-left: 0;
    }
    &.active {
      transform: scale(1.1);
      .user-image {
        border: 1px solid #1cbbb4;
        background-color: #d3fffd;
      }
      .user-name {
        color: #1cbbb4;
      }
    }
    // &:nth-child(4n + 1) {
    //   margin-left: 0;
    // }

    .user-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    }
    .user-name {
      padding: 5rpx 0;
    }
  }
}
.add-bar {
  display: flex;
  justify-content: flex-end;
}
.add-box {
  margin-right: 20rpx;
  display: flex;
  // width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  // margin: 0;
  // outline: none;
  // padding: 0;
  // background-color: #fff;
  &::after {
    border: none;
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
    // color: #999;
    // margin-top: 5rpx;
    font-size: 24rpx;
  }
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
</style>
