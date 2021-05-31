<template>
  <view class="queue-wrap">
    <view class="queue-header">
      <view class="queue-name" v-if="todayQue && todayQue.queue_name">
        {{ todayQue.queue_name || "" }}
      </view>
    </view>
    <view class="queue-remark" v-if="todayQue && todayQue.queue_remark">
      <view class="remark-title">说明：</view>
      <view class="remark-content">{{ todayQue.queue_remark }}</view>
    </view>

    <view class="cu-timeline" v-if="queStatus === '未抽号'">
      <view class="cu-time">
        <view class="que-date" v-if="todayQue && todayQue.queue_date">
          <text>
            {{ dayjs(todayQue.queue_date).format("YYYY-MM-DD") }}
          </text>
          <text> （周{{ dayjs(todayQue.queue_date).day() }}，今日） </text>
        </view>
      </view>

      <view class="cu-item card-item text-blue" v-if="todayQue">
        <view class="content">
          <text class="label">当前叫号:</text>
          <text class="value">{{ todayQue.cur_no || "未开始" }}</text>
        </view>
        <view class="timeline-tips" v-if="total">
          <text> 前方等待：{{ total }}人 </text>
          <text v-if="todayQue && todayQue.avg_wait_time && waitAmount"
            >预估等待：{{ waitAmount * todayQue.avg_wait_time }}分钟</text
          >
        </view>
      </view>

      <view
        class="cu-item card-item text-blue"
        v-if="todayQue && todayQue.last_no"
      >
        <view class="content">
          <text class="label">队尾号码:</text>
          <text class="value">{{ todayQue.last_no || "-" }}</text>
        </view>
      </view>
    </view>
    <view class="cu-timeline" v-else>
      <view class="cu-time">
        <view class="que-date" v-if="todayQue && todayQue.queue_date">
          <text>
            {{ dayjs(todayQue.queue_date).format("YYYY-MM-DD") }}
          </text>
          <text> （周{{ dayjs(todayQue.queue_date).day() }}，今日） </text>
        </view>
      </view>

      <view
        class="cu-item card-item text-blue"
        v-if="todayQue && queInfo && queInfo.status !== '已叫号'"
      >
        <view class="content">
          <text class="label">当前叫号:</text>
          <text class="value mr-80">{{ todayQue.cur_no || "未开始" }}</text>
        </view>
        <view class="timeline-tips" v-if="total">
          <text> 前方等待：{{ total }}人 </text>
          <text
            class="margin-left"
            v-if="todayQue && todayQue.avg_wait_time && waitAmount"
            >预估等待：{{ waitAmount * todayQue.avg_wait_time }}分钟</text
          >
        </view>
      </view>
      <view class="cu-item card-item text-blue" v-if="queInfo && queInfo.seq">
        <view class="content">
          <view class="label">
            <text>我的排号:</text>
            <text v-if="queInfo.status === '已叫号'" class="text-blue"
              >[叫号中]
              <text
                v-if="lastQueInfo && queInfo && lastQueInfo.seq === queInfo.seq"
                >[队尾]</text
              ></text
            >
          </view>
          <view class="value">
            <text class="value_text">{{ queInfo.seq || "未开始" }}</text>
            <view class="profile-info">
              <image
                class="profile"
                :src="userInfo.profile_url"
                mode="scaleToFill"
              />
              <view class="margin-right-xs text">
                {{ userInfo.name || userInfo.nick_name || "" }}</view
              >
            </view>
          </view>
        </view>
        <view
          class="timeline-tips"
          v-if="overWait && lastQueInfo && lastQueInfo.status !== '已叫号'"
        >
          <text> 后面等待：{{ overWait }}人 </text>
        </view>
      </view>
      <view
        class="cu-item card-item text-blue"
        v-if="
          todayQue &&
          todayQue.last_no &&
          todayQue.last_no !== queInfo.seq &&
          lastQueInfo &&
          lastQueInfo.seq !== queInfo.seq
        "
      >
        <view class="content">
          <view class="label">
            <text>队尾号码:</text>
            <text v-if="lastQueInfo.status === '已叫号'" class="text-blue"
              >[叫号中]</text
            >
          </view>
          <text
            class="value mr-80"
            v-if="lastQueInfo.seq === todayQue.last_no"
            >{{ todayQue.last_no || "-" }}</text
          >
          <text
            class="value mr-80"
            v-if="
              lastQueInfo.seq !== todayQue.last_no &&
              lastQueInfo.seq !== queInfo.seq
            "
            >{{ lastQueInfo.seq || "-" }}</text
          >
        </view>
      </view>
    </view>

    <!-- <view class="queue-card" v-if="todayQue || currentQuer">
      <view class="card-item">
        <view class="card-label text-blue">当前叫号</view>
        <view class="card-content">{{ todayQue.cur_no || "-" }}</view>
      </view>
      <view class="card-item">
        <view class="card-label text-blue">最新排号</view>
        <view class="card-content">{{ todayQue.last_no || "-" }}</view>
      </view>
    </view> -->
    <!-- <view class="my-queue" v-if="queInfo && currentQuer">
      <view class="left">
        <view class="queue-info">
          <view class="label">我的排号： </view>
          <view class="value text-blue">{{ queInfo.seq }}</view>
          <view class="status text-blue">{{ queInfo.status }}</view>
        </view>

        <view class="queue-info" v-if="queInfo.status === '排队中'">
          <view class="label">前方等待人数： </view>
          <view class="value text-orange">{{ waitAmount }}</view>
          <view class="status text-blue">人</view>
        </view>
        <view
          class="queue-info"
          v-if="waitAmount && todayQue && todayQue.avg_wait_time"
        >
          <view class="label">预估等待时长： </view>
          <view class="value text-blue">{{
            waitAmount * todayQue.avg_wait_time
          }}</view>
          <view class="status text-blue">(分钟)</view>
        </view>
      </view>
    </view> -->

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
      <view class="tip" v-if="todayQue && todayQue.refreshTime"
        >刷新时间：{{ todayQue.refreshTime }}</view
      >
      <button class="button cu-btn bg-cyan light" @click="getQueueInfo">
        <text class="cuIcon-refresh margin-right-xs"></text> 刷新
      </button>
    </view>
    <view class="margin-tb">
      <ad
        unit-id="adunit-27e9d9a7b00e4f6a"
        ad-type="video"
        ad-theme="white"
        v-if="todayQue && todayQue.id && queStatus"
      ></ad>
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
    queStatus () {
      if (!this.queInfo) {
        return '未抽号'
      } else if (this.queInfo?.status) {
        return this.queInfo.status
      }
    },
    curWaitAmount () {
      if (Array.isArray(this.queList)) {
        return this.queList.length
      } else {
        return 0
      }
    },
    overWait () {
      // 当前用户后面等待的人数
      if (this.queInfo && this.queInfo.seq && this.lastQueInfo && this.lastQueInfo.seq) {
        if (this.lastQueInfo.seq - this.queInfo.seq > 0) {
          return this.lastQueInfo.seq - this.queInfo.seq
        }
      }
    },
    waitAmount () {
      if (this.queList.length > 0 && this?.userInfo?.no) {
        let index = this.queList.findIndex(item => item.person_no === this.userInfo.no)
        if (index !== -1) {
          return index + 1
        } else {
          return this.queList.length
        }
      } else {
        return '-'
      }
    },
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
      lastQueInfo: null,
      total: 0,//排队人总数
      queList: [],
      storeUser: null,
      fill_batch_no: '',
      timer: null,
      setTimer: false,
    }
  },
  methods: {
    autoRefresh () {

    },
    async getQueueInfo () {
      // 查询当日排队信息
      this.$uDebounce.canDoFunction({
        key: "getQueueInfo",//基于此值判断是否可以操作，如两个方法传入了同样的key，则会混淆，建议传入调用此事件的方法名，简单好梳理
        time: 3000,//如果传入time字段，则为定时器后，自动解除锁定状态，单位（毫秒）
        success: async () => {//成功中调用应该操作的方法，被锁定状态不会执行此代码块内的方法
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
            res.data[ 0 ].refreshTime = this.dayjs().format("HH:mm:ss")
            this.todayQue = res.data[ 0 ]
            uni.setNavigationBarTitle({ title: res.data[ 0 ].queue_name })
            this.getQueList()
            this.getQueInfo()
            this.getLastPerson()
          }
        }
      })

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
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no } ], "page": { "pageNo": 1, "rownumber": 30 }
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
          { colName: 'status', ruleType: 'ne', value: '完成' },
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
    async getLastPerson () {
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ],
        "condition": [
          { colName: 'status', ruleType: 'ne', value: '完成' },
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no },
          { colName: "store_no", ruleType: 'eq', value: this.store_no }
        ],
        "order": [
          {
            colName: "create_time",
            orderType: "desc"
          }
        ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.lastQueInfo = res.data[ 0 ]
      }
    },
    async startQue () {
      // 开始排队
      if (this.todayQue?.queue_length) {
        if (this.total && this.total >= this.todayQue.queue_length) {
          //
          uni.showModal({
            title: '提示',
            content: '当前队伍已满，请稍后再试...',
            showCancel: false,
            confirmText: "好的"
          })
          return
        }
      }
      this.$uDebounce.canDoFunction({
        key: "startQue",//基于此值判断是否可以操作，如两个方法传入了同样的key，则会混淆，建议传入调用此事件的方法名，简单好梳理
        time: 3000,//如果传入time字段，则为定时器后，自动解除锁定状态，单位（毫秒）
        success: async () => {//成功中调用应该操作的方法，被锁定状态不会执行此代码块内的方法
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
            // if (this?.todayQue?.id) {
            //   await this.updateQueueInfo(res.data[ 0 ].seq)
            // }
            this.getQueueInfo()
          }
        }
      })
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
      this.timer = setInterval(() => {
        this.getQueueInfo()
      }, 5000);
    }
  },

  beforeDestroy () {
    clearInterval(this.timer)
  },
  onHide () {
    clearInterval(this.timer)
  },
  onShow () {
    if (this.setTimer && this.store_no && this.queue_no) {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.getQueueInfo()
      }, 5000);
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
  // display: flex;
  // justify-content: space-between;
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
  text-align: center;
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
    justify-content: space-between;
    .label {
      min-width: 130px;
    }
    .value {
      flex: 1;
      font-weight: bold;
      font-size: 30px;
      margin-left: 24px;
      // color: #00b050;
    }
    .status {
      font-size: 14px;
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
  margin: 10rpx auto 30px;
  .tip {
    color: #666;
  }
  .button {
    margin-top: 10rpx;
    width: 30%;
    font-size: 20px;
    font-weight: bold;
  }
}
.cu-timeline {
  .cu-time {
    width: auto;
    padding: 20rpx;
  }
  .timeline-tips {
    color: #e54d42;
    font-weight: bold;
    margin-top: 20rpx;
  }
  .profile-info {
    // width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    // position: absolute;
    // right: 0;
    // top: 0;
    .text {
      font-size: 14px;
      color: #333;
    }
    .profile {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      margin-bottom: 10rpx;
    }
  }
  .card-item {
    padding: 20rpx 20rpx 20rpx 100rpx;
    .content {
      background-color: #deebf7;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      padding: 20rpx;
      flex-wrap: wrap;
      position: relative;
    }
    .label {
      color: #e54d42;
      font-size: 16px;
      display: flex;
      flex-direction: column;
    }
    .value {
      flex: 1;
      width: 100%;
      font-size: 50px;
      color: #00b050;
      font-weight: bold;
      position: relative;
      display: flex;
      justify-content: center;
      &.mr-80 {
        margin-right: 80rpx;
      }
      .value_text {
        flex: 1;
        // margin-left: 80rpx;
        text-align: center;
      }
    }
  }
}
</style>
