<template>
  <view class="queue-wrap">
    <view class="queue-header">
      <view>
        <view class="queue-name" v-if="todayQue && todayQue.queue_name">
          {{ todayQue.queue_name || "" }}
        </view>
        <view class="que-date" v-if="todayQue && todayQue.queue_date">
          <text>
            {{ dayjs(todayQue.queue_date).format("YYYY-MM-DD") }}
          </text>
          <text> （周{{ dayjs(todayQue.queue_date).day() }}，今日） </text>
        </view>
      </view>
      <view class="right">
        <image class="profile" :src="userInfo.profile_url" mode="scaleToFill" />
        <view class="label">
          {{ userInfo.name || userInfo.nick_name || "" }}</view
        >
      </view>
    </view>
    <view class="queue-remark" v-if="todayQue && todayQue.queue_remark">
      <view class="remark-title">说明：</view>
      <view class="remark-content">{{ todayQue.queue_remark }}</view>
    </view>
    <view class="queue-card" v-if="todayQue || currentQuer">
      <view class="card-item">
        <view class="card-label text-blue">当前叫号</view>
        <view class="card-content">{{ todayQue.cur_no || "-" }}</view>
      </view>
      <view class="card-item">
        <view class="card-label text-blue">最新排号</view>
        <view class="card-content">{{ todayQue.last_no || "-" }}</view>
      </view>
    </view>
    <!-- <view class="que-card">
      <view class="margin-tb-sm">
        <text v-if="currentQuer && currentQuer.seq"
          >当前叫到【{{ currentQuer.seq }}】号，</text
        >
        排队人数：{{ total || 0 }}人
      </view>
      <view class="que-num">
        <view class="num" v-if="queInfo && queInfo.seq">
          <text class="">
            {{ queInfo.seq }}
          </text>
          <text
            v-if="queInfo && queInfo.status && queInfo.status === '未到场'"
            class="text-orange tip"
            >({{ queInfo.status }})</text
          >
        </view>
        <view class="head font-bold text-gray" v-if="queInfo && queInfo.seq">
          排队号
        </view>

        <view class="num" v-else> 待排队 </view>
      </view>
      <view
        class=""
        v-if="queInfo && queInfo.seq && currentQuer && currentQuer.seq"
      >
        您前面还有{{ queInfo.seq - currentQuer.seq }}人在等候
      </view>
    </view> -->
    <view class="my-queue" v-if="queInfo && currentQuer">
      <view class="left">
        <view class="queue-info">
          <view class="label">我的排号： </view>
          <view class="value text-blue">{{ queInfo.seq }}</view>
        </view>
        <view class="queue-info" v-if="queInfo.status === '排队中'">
          <view class="label">我的等待数量： </view>
          <!-- <view class="value text-orange">{{ todayQue.wait_amount }}</view> -->
          <view class="value text-orange">{{
            queInfo.seq - currentQuer.seq
          }}</view>
        </view>
      </view>
    </view>
    <view
      class="que-button"
      v-if="
        (!queInfo || !queInfo.id) &&
        todayQue &&
        todayQue.id &&
        todayQue.queue_status === '进行中'
      "
    >
      <button class="button cu-btn bg-cyan light" @click="startQue">
        抽号
      </button>
    </view>
    <view
      class="que-button"
      v-else-if="todayQue && todayQue.id && todayQue.queue_status === '进行中'"
    >
      <button class="button cu-btn bg-cyan light" @click="getQueueInfo">
        <text class="cuIcon-refresh margin-right-xs"></text> 刷新
      </button>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    }),
    currentQuer () {
      // 当前正在接种用户排队信息
      if (this.queList.length > 0) {
        return this.queList[ 0 ]
      }
    },
  },
  data () {
    return {
      store_no: "",
      queue_no: "",
      todayQue: null,//当日排队信息
      queInfo: null,//当前用户排队信息
      total: 0,//排队人总数
      queList: [],
      storeUser: null,
      fill_batch_no: ''
    }
  },
  methods: {
    async getQueueInfo () {
      // 查询当日排队信息
      let req = {
        "serviceName": "srvhealth_store_queue_up_cfg_select", "colNames": [ "*" ],
        "condition": [
          { colName: 'store_no', ruleType: 'eq', value: this.store_no },
          { colName: 'queue_no', ruleType: 'eq', value: this.queue_no },
          { colName: "queue_date", ruleType: 'like', value: this.dayjs().format("YYYY-MM-DD") }
        ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_cfg_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.todayQue = res.data[ 0 ]
        uni.setNavigationBarTitle({ title: res.data[ 0 ].queue_name })
        this.getQueList()
        this.getQueInfo()
      }
    },
    async updateQueueInfo (no) {
      let req = [ { "serviceName": "srvhealth_store_queue_up_cfg_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": this.todayQue.id } ], "data": [ { last_no: no } ] } ]
      if (no) {
        await this.$fetch('operate', 'srvhealth_store_queue_up_cfg_update', req, 'health')
      }
    },
    async getQueList () {
      // 查找排队列表
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ], "condition": [
          { colName: 'status', ruleType: 'eq', value: '排队中' },
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no } ], "page": { "pageNo": 1, "rownumber": 1 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      this.queList = res.data
      this.total = res.page.total
    },
    async getQueInfo () {
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ],
        "condition": [
          { colName: "person_no", ruleType: 'eq', value: this.userInfo.no },
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no },
          { colName: "store_no", ruleType: 'eq', value: this.store_no }
        ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.queInfo = res.data[ 0 ]
      } else if (res.data.length === 0 && this.fill_batch_no) {
        uni.showModal({
          title: '提示',
          content: '是否自动抽号？',
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.startQue()
            } else {
              this.queInfo = null
            }
          }
        })
      } else {
        this.queInfo = null
      }
    },
    async startQue () {
      // 开始排队
      const req = [ {
        "serviceName": "srvhealth_store_queue_up_record_add", "condition": [],
        "data": [
          {
            "queue_no": this.todayQue.queue_no, "queue_name": this.todayQue.queue_name, "status": "排队中",
            nick_name: this.userInfo.nick_name,
            person_name: this.userInfo.person_name,
            person_no: this.userInfo.no,
            profile_url: this.userInfo.profile_url,
            sex: this.userInfo.sex,
            store_user_no: this.storeUser.store_user_no,
            store_no: this.store_no,
            user_account: this.userInfo.userno,
            user_image: this.userInfo.user_image,
            fill_batch_no: this.fill_batch_no || null
          } ]
      } ]
      if (this?.todayQue?.queue_remark) {
        let result = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: this?.todayQue?.queue_remark,
            confirmText: "知道了",
            success (res) {
              if (res.confirm) {
                resolve(true)
              } else {
                resolve(false)
              }
            }
          })
        })
        if (!result) {
          return
        }
      }
      if (this?.todayQue?.activity_no) {

        if (!this.fill_batch_no) {
          uni.redirectTo({
            url: `/questionnaire/index/index?formType=form&activity_no=${this?.todayQue?.activity_no}&status=进行中&from=queue&store_no=${this.store_no}&queue_no=${this.queue_no}`
          });
          return
        }
      }
      const res = await this.$fetch('operate', 'srvhealth_store_queue_up_record_add', req, 'health')
      if (res.success && res.data.length > 0) {
        this.getQueList()
        this.queInfo = res.data[ 0 ]
        if (this?.todayQue?.id) {
          await this.updateQueueInfo(res.data[ 0 ].seq)
        }
        this.getQueueInfo()
      }
    },
    getStoreUserInfo () {
      let req = { "serviceName": "srvhealth_store_user_select", "colNames": [ "*" ], "condition": [ { colName: 'person_no', ruleType: 'eq', value: this.userInfo.no }, { colName: 'store_no', ruleType: 'eq', value: this.store_no } ], "relation_condition": {}, "page": { "pageNo": 1, "rownumber": 10 }, "order": [], "draft": false, "query_source": "list_page" }
      this.$fetch('select', 'srvhealth_store_user_select', req, 'health').then(res => {
        if (res.success && res.data.length > 0) {
          this.storeUser = res.data[ 0 ]
        }
      })
    },

  },

  // 页面周期函数--监听页面加载
  async onLoad (option) {
    if (option.fill_batch_no) {
      this.fill_batch_no = option.fill_batch_no
    }
    if (option.store_no && option.queue_no) {
      this.store_no = option.store_no
      this.queue_no = option.queue_no
      await this.toAddPage()
      await this.getStoreUserInfo()
      await this.getQueueInfo()
    }

  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.getQueList()
    this.getQueInfo()
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () { },
  // 页面处理函数--监听页面滚动(not-nvue)
  /* onPageScroll(event) {}, */
  // 页面处理函数--用户点击右上角分享
  /* onShareAppMessage(options) {}, */
};
</script>

<style scoped lang="scss">
.queue-wrap {
  text-align: center;
  // background-color: #f1f1f1;
  min-height: 100vh;
  padding-top: 20px;
  overflow: hidden;
}
.queue-header {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  .right {
    .profile {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
  }
}
.queue-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: left;
}
.que-date {
  text-align: left;
  color: #666;
}
.queue-remark {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  color: #666;

  // background-color: #f9f9f9;
  margin: 10rpx 20rpx;
  align-items: flex-start;
  .remark-content {
    padding: 10rpx 0;
  }
}
.queue-card {
  padding: 20rpx;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  .card-item {
    padding: 20rpx;
    width: 150px;
    height: 150px;
    background-color: #deebf7;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:first-child {
      margin-right: 20px;
    }
    .card-label {
      margin-bottom: 10px;
      font-weight: bold;
    }
    .card-content {
      font-size: 50px;
      font-weight: bold;
      color: #00b050;
    }
  }
}
.my-queue {
  padding: 20px;
  display: flex;
  align-items: center;
  .left {
    flex: 1;
  }
  .right {
    .profile {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
  }
  .queue-info {
    text-align: left;
    display: flex;
    align-items: center;
    font-size: 18px;
    padding: 20rpx 0;
    .label {
      min-width: 130px;
    }
    .value {
      font-weight: bold;
      font-size: 30px;
      margin-left: 24px;
      // color: #00b050;
    }
  }
}
.que-num {
  .font-bold {
    font-weight: bold;
  }
  .num {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    margin-top: 10rpx;
    position: relative;
    .num {
      position: relative;
    }
    .tip {
      font-size: 16px;
      position: absolute;
      right: 50px;
    }
  }
}
.que-card {
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  margin: 20rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  border-radius: 20rpx;
}

.que-button {
  .button {
    width: 30%;
    margin: 50px auto;
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
