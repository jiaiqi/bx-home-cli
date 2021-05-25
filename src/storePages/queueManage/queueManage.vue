<template>
  <div class="queue-manage">
    <u-tabs
      :list="tabList"
      :is-scroll="false"
      :current="currentTab"
      @change="changeTab"
    ></u-tabs>
    <view class="list-wrap">
      <view
        class="list-item"
        v-for="item in listData[currentTab]"
        :key="item.qr_no"
      >
        <view>
          <image
            class="image"
            :src="getImagePath(item.profile_url)"
            mode="scaleToFill"
          />
        </view>
        <view style="flex: 1">
          <view class="top">
            <view
              ><text class="title">
                {{ item.person_name || item.nick_name || "" }}</text
              >
              <text class="">（{{ item.sex || "" }}）</text>
            </view>
            <view>
              <text class="num">{{ item.seq }}</text>
            </view>
          </view>
          <view class="button-box">
            <button class="cu-btn bg-blue" @click="changeStatus(item, '完成')">
              完成
            </button>
            <button
              class="cu-btn bg-orange"
              @click="changeStatus(item, '未到场')"
            >
              未到场
            </button>
          </view>
        </view>
      </view>
    </view>
    <!-- </view> -->
  </div>
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
      todayQue: null,
      store_no: '',
      queue_no: '',
      currentTab: 0,
      pages: [ {
        pageNo: 1,
        status: 'more'
      },
      {
        pageNo: 1,
        status: 'more'
      },
      {
        pageNo: 1,
        status: 'more'
      } ],
      listData: [
        [], [], []
      ],
      tabList: [
        {
          name: "排队中"
        },
        {
          name: "完成"
        },
        {
          name: "未到场"
        },
      ]
    }
  },
  methods: {
    changeTab (index) {
      this.currentTab = index;
      this.getList()
    },
    changeStatus (item, status) {
      let req = [ { "serviceName": "srvhealth_store_queue_up_record_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": item.id } ], "data": [ { "status": status, } ] } ]
      this.$fetch('operate', 'srvhealth_store_queue_up_record_update', req, 'health').then(res => {
        if (res.success) {
          uni.showToast({
            title: '操作成功',
            icon: 'success',
            mask: true
          })
        } else if (res.msg) {
          uni.showToast({
            title: res.msg,
            icon: 'none',
            mask: true
          })
        }
        this.getList()
      })

    },
    async getTodayQue () {
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
        this.getList()
      }
    },
    async getList () {
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ], "condition": [
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no }, { colName: 'status', ruleType: 'eq', value: this.tabList[ this.currentTab ].name } ], "page": { "pageNo": this.pages[ this.currentTab ].pageNo, "rownumber": 30 }
      }
      this.pages[ this.currentTab ].status = 'loading'
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      // this.queList = res.data
      if (res.success) {
        this.$set(this.listData, this.currentTab, res.data)
        if (res.page.total > res.page.pageNo * res.page.rownumber) {
          this.pages[ this.currentTab ].status = 'more'
        } else {
          this.pages[ this.currentTab ].status = 'noMore'
        }
      }
    }
  },
  onLoad (option) {
    if (option.store_no && option.queue_no) {
      this.store_no = option.store_no
      this.queue_no = option.queue_no
      this.getTodayQue()
    }
  },
  onPullDownRefresh () {
    this.pages.forEach(item => item.pageNo = 1)
    this.getTodayQue()
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () {
    if (this.pages[ this.currentTab ].status === 'more') {
      this.pages[ this.currentTab ].pageNo++
      this.getList()
    }
  },
  // 页面处理函数--监听页面滚动(not-nvue)
  /* onPageScroll(event) {}, */
  // 页面处理函数--用户点击右上角分享
  /* onShareAppMessage(options) {}, */
};
</script>

<style scoped lang="scss">
.list-wrap {
  min-height: calc(100vh - var(--window-top));
}
.list-item {
  padding: 20rpx 40rpx;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  .image {
    width: 150rpx;
    height: 150rpx;
    margin-right: 20rpx;
    border-radius: 10rpx;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .num {
      font-size: 30px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
    }
  }
  .button-box {
    margin-top: 20rpx;
    display: flex;
    justify-content: flex-end;
    // justify-content: center;
    .cu-btn {
      margin-right: 20rpx;
      min-width: 30%;
    }
  }
}
</style>
