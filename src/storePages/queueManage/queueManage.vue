<template>
  <div class="queue-manage">
    <u-tabs
      :list="tabList"
      :is-scroll="false"
      :current="currentTab"
      @change="changeTab"
    ></u-tabs>
    <!-- <view class="call-name">
      <button class="cu-btn bg-cyan" @click="callNext" v-if="currentTab === 0">
        叫号
      </button>
    </view> -->
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
              <text class="" v-if="item.sex">（{{ item.sex || "" }}）</text>
            </view>
            <view>
              <text class="num">{{ item.seq }}</text>
            </view>
          </view>
          <view class="button-box" v-if="currentTab !== 2">
            <button
              class="cu-btn bg-cyan"
              @click="changeStatus(item, '已叫号')"
              v-if="currentTab !== 0"
            >
              叫号
            </button>
            <button
              class="cu-btn bg-blue"
              @click="changeStatus(item, '完成')"
              v-if="currentTab !== 1"
            >
              完成
            </button>
            <button
              class="cu-btn bg-orange"
              @click="changeStatus(item, '未到场')"
            >
              过号
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
      curPerson: {},
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
      },
      {
        pageNo: 1,
        status: 'more'
      } ],
      listData: [
        [], [], [], []
      ],
      tabList: [
        {
          name: "已叫号"
        },
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
    async callNext () {
      let list = this.listData[ 0 ]
      let index = 0
      if (this.curPerson && this.curPerson.seq) {
        index = list.findIndex(item => item.seq === this.curPerson.seq)
        index++;
      }
      if (list.length > index) {
        this.curPerson = list[ index ]
      } else {
        this.curPerson = null
        uni.showModal({
          title: '提示',
          content: '后面已经没有人排队了',
          showCancel: false,
          confirmText: "知道了",
        })
        return
      }
      if (this.listData[ 0 ].length > 0) {
        let req = [ { "serviceName": "srvhealth_store_queue_up_cfg_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": "8" } ], "data": [ { cur_no: this.curPerson.seq } ] } ]
        let res = await this.$fetch('operate', 'srvhealth_store_queue_up_cfg_update', req, 'health')
        if (res.success) {

        }
      }
      this.getList()
    },
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
      // 查询当前排队信息
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
        if (res.data[ 0 ].cur_no) {
          this.curPerson = await this.getCurPerson(res.data[ 0 ].cur_no)
        }
        this.getList()
      }
    },
    async getCurPerson (no) {
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ], "condition": [
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no },
          { colName: "seq", ruleType: 'eq', value: no }
        ],
        "page": { "pageNo": this.pages[ this.currentTab ].pageNo, "rownumber": 30 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      if (res.success && res.data.length > 0) {
        return res.data[ 0 ]
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
.call-name {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx;
}
.list-wrap {
  min-height: calc(100vh - var(--window-top));
  padding: 0 20rpx;
}
.list-item {
  padding: 20rpx;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  margin-bottom: 10rpx;
  &.current-number {
    border: 1px solid #0bc99d;
  }
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
      min-width: 25%;
    }
  }
}
</style>
