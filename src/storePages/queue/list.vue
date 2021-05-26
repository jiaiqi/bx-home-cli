<!--
 * @Author: your name
 * @Date: 2021-05-25 17:05:03
 * @LastEditTime: 2021-05-26 16:02:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bx-home-cli\src\storePages\queue\list.vue
-->
<template>
  <view class="queue-list-view">
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
        <text> （周{{ dayjs().day() }}，今日） </text>
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
export default {
  data () {
    return {
      type: "", // manage
      store_no: "",
      queue: [],
      loadStatus: "more",

    }
  },
  methods: {
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
          { colName: "queue_date", ruleType: 'like', value: this.dayjs().format("YYYY-MM-DD") }
        ],
        "page": { "pageNo": 1, "rownumber": 20 }
      }
      this.loadStatus = 'loading'
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_cfg_select', req, 'health')
      if (res.success) {
        this.queue = res.data.map(item => {
          item.cur_no = isNaN(Number(item.cur_no)) ? 0 : Number(item.cur_no)
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