<template>
  <view class="queue-list-view">
    <view class="add-btn" v-if="type === 'manage'">
      <button class="cu-btn bg-blue" type="primary" @click="addQueue">
        创建队列
      </button>
    </view>
    <view
      class="queue-item"
      v-for="item in queue"
      :key="item.id"
      @click="toQueue(item)"
    >
      <view class="que-header">
        <view class="que-name">
          {{ item.queue_name || "" }}
        </view>
        <view
          class="que-status"
          :class="{
            'text-green':
              item.queue_status === '进行中' || item.queue_status === '开放中',
            'text-red': item.queue_status === '已结束',
            'text-yellow': item.queue_status === '待开始',
          }"
        >
          {{ item.queue_status || "-" }}
        </view>
      </view>
      <view class="que-date">
        <text>
          {{ dayjs().format("YYYY-MM-DD") }}
        </text>
        <text> （周{{ localDay }}，今日） </text>
      </view>
      <view class="que-footer">
        <view class="footer-item">
          <view class="label">等待人数： </view>
          <view class="value text-orange"
            >{{ item.wait_amount || " - " }}
          </view>
        </view>
        <view class="footer-item">
          <view class="label">当前叫号： </view>
          <view class="value text-blue big-font"
            >{{ item.cur_no || " - " }}
          </view>
        </view>
      </view>
      <view v-if="type === 'manage'" class="change-status">
        <text class="label">更改状态：</text>
        <view class="buttons">
          <button
            class="cu-btn bg-red sm round margin-right-xs"
            @click.stop="changeStatus(item, '已结束')"
            v-if="item.queue_status !== '已结束'"
          >
            已结束
          </button>
          <button
            class="cu-btn bg-green sm round margin-right-xs"
            @click.stop="changeStatus(item, '进行中')"
            v-if="item.queue_status !== '进行中'"
          >
            进行中
          </button>
          <button
            class="cu-btn bg-blue sm round margin-right-xs"
            @click.stop="changeStatus(item, '待开始')"
            v-if="item.queue_status !== '待开始'"
          >
            待开始
          </button>
        </view>
      </view>
    </view>
    <uni-load-more
      :status="loadStatus"
      v-if="
        loadStatus !== 'noMore' ||
        (loadStatus === 'noMore' && queue.length !== 0)
      "
    >
    </uni-load-more>
    <view
      class=""
      style="margin-top: 30vh"
      v-if="loadStatus === 'noMore' && queue.length === 0"
    >
      <u-empty text="未找到今日排队数据" mode="list"> </u-empty>
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
    localDay () {
      let day = new Date()
      day = day.getDay()
      let result = ''
      switch (day) {
        case 0:
          result = '日'
          break;
        case 1:
          result = '一'
          break;
        case 2:
          result = '二'
          break;
        case 3:
          result = '三'
          break;
        case 4:
          result = '四'
          break;
        case 5:
          result = '五'
          break;
        case 6:
          result = '六'
          break;
      }
      return result
    }
  },
  data () {
    return {
      type: "", // manage
      store_no: "",
      queue: [],
      loadStatus: "more",
    }
  },
  methods: {
    async changeStatus (e, status) {
      const req = [ { "serviceName": "srvhealth_store_queue_up_cfg_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": e.id } ], "data": [ { queue_status: status } ] } ]
      let res = await this.$fetch('operate', 'srvhealth_store_queue_up_cfg_update', req, 'health')
      if (res.success) {
        this.getTodayQue()
      }
    },
    addQueue () {
      let fieldsCond = [
        {
          column: 'store_no',
          value: this.store_no,
          display: false
        },
        {
          column: 'user_account',
          value: this.userInfo.userno,
          display: false
        },
        {
          column: 'person_no',
          value: this.userInfo.no,
          display: false
        },
        {
          column: 'person_name',
          value: this.userInfo.name,
          display: false
        },
        {
          column: 'queue_date',
          value: this.dayjs().format("YYYY-MM-DD"),
          display: true
        },
        {
          column: 'queue_status',
          value: "进行中",
          display: true
        },
        {
          column: 'cur_no',
          display: false
        },
        {
          column: 'last_no',
          display: false
        }
      ]
      let url = '/publicPages/form/form?serviceName=srvhealth_store_queue_up_cfg_add&type=add&addType=onwer&fieldsCond=' + decodeURIComponent(JSON.stringify(fieldsCond))
      uni.navigateTo({ url })
    },
    toQueue (e) {
      if (this.type !== 'manage' && e.queue_no && this.store_no && (e.queue_status === '进行中' || e.queue_status === '开放中')) {
        uni.navigateTo({ url: `./queue?store_no=${this.store_no}&queue_no=${e.queue_no}` })
      } else if (e.queue_no && this.store_no && this.type === 'manage') {
        uni.navigateTo({ url: `../queueManage/queueManage?store_no=${this.store_no}&queue_no=${e.queue_no}` })
      } else if (e && e.queue_status) {
        uni.showToast({
          title: `该排队目前状态为${e.queue_status}，不可进行排队`,
          icon: 'none',
          mask: true
        })
      }
    },
    async getTodayQue () {
      // 查询当日排队信息
      let req = {
        "serviceName": "srvhealth_store_queue_up_cfg_select", "colNames": [ "*" ],
        "condition": [
          { colName: 'store_no', ruleType: 'eq', value: this.store_no },
          // { colName: 'queue_status', ruleType: 'in', value: '待开始,进行中' },
          { colName: "queue_date", ruleType: 'like', value: this.dayjs().format("YYYY-MM-DD") }
        ],
        "page": { "pageNo": 1, "rownumber": 20 }
      }
      if (this.type != 'manage') {
        req.condition.push(
          { colName: 'queue_status', ruleType: 'in', value: '待开始,进行中' }
        )
      }
      this.loadStatus = 'loading'
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_cfg_select', req, 'health')
      if (res.success) {
        this.queue = res.data.map(item => {
          item.cur_no = isNaN(Number(item.cur_no)) ? 0 : item.cur_no
          return item
        })
        if (res.page.pageNo * res.page.rownumber >= res.page.total) {
          this.loadStatus = 'noMore'
        } else {
          this.loadStatus = 'more'
        }
      }
    },
  },
  onPullDownRefresh () {
    this.getTodayQue()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1500);
  },
  onShow () {
    if (this.store_no) {
      this.getTodayQue()
    }
  },
  onLoad (option) {
    if (option.type) {
      this.type = option.type
    }
    if (option.store_no) {
      this.store_no = option.store_no
      this.getTodayQue()
    }
  }
}
</script>

<style lang="scss" scoped>
.add-btn {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 10rpx;
  margin-bottom: 10rpx;
  border-bottom: #f1f1f1 1px solid;
}
.queue-list-view {
  padding: 20rpx;
  .queue-item {
    padding: 20rpx;
    // background-color: #f9f9f9;
    border-bottom: 1px #f1f1f1 solid;
    .que-header {
      display: flex;
      justify-content: space-between;
      .que-status {
        // font-weight: bold;
        font-size: 18px;
      }
      .que-name {
        font-weight: bold;
        font-size: 18px;
      }
    }
    .que-date {
      padding: 20rpx 0;
      color: #888;
    }
    .change-status {
      display: flex;
      padding: 10rpx 0;
      // justify-content: space-between;
      .label {
        // flex: 1;
      }
    }
    .que-footer {
      display: flex;
      .footer-item {
        margin-left: 20px;
        display: flex;
        align-items: center;
        .value {
          font-size: 30px;
          font-weight: bold;
          &.big-font {
            // font-size: 40px;
          }
        }
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}
</style>