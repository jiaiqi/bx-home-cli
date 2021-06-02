<template>
  <div class="queue-manage">
    <view class="button-box padding-tb-sm">
      <button type="primary" class="cu-btn bg-green" @click="showAddInfo">
        抽号
      </button>
    </view>
    <u-tabs
      :list="tabList"
      :is-scroll="false"
      :current="currentTab"
      :font-size="36"
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
              <text class="" v-if="item.sex">（{{ item.sex || "" }}）</text>
            </view>
            <view>
              <text class="num">{{ item.seq }}</text>
            </view>
          </view>
          <view class="button-box" v-if="currentTab !== 1">
            <view class="queue-status text-blue">{{ item.status }}</view>
            <button
              class="cu-btn bg-cyan"
              @click="changeStatus(item, '叫号中')"
              v-if="
                currentTab !== 1 &&
                (item.status === '排队中' || item.status === '已过号')
              "
            >
              叫号
            </button>
            <button
              class="cu-btn bg-blue"
              @click="changeStatus(item, '完成')"
              v-if="currentTab !== 2 && item.status === '叫号中'"
            >
              完成
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="
                currentTab !== 2 && currentTab !== 1 && item.status === '叫号中'
              "
              @click="changeStatus(item, '已过号')"
            >
              过号
            </button>
            <button
              class="cu-btn bg-orange"
              v-if="currentTab !== 0 && currentTab !== 1"
              @click="changeStatus(item, '排队中')"
            >
              排队
            </button>
          </view>
          <view class="button-box" v-if="currentTab == 1">
            <view class="queue-status text-blue">{{ item.status }}</view>
          </view>
        </view>
      </view>
      <uni-load-more
        :status="pages[currentTab].status"
        v-if="
          pages[currentTab].status !== 'noMore' ||
          (pages[currentTab].status === 'noMore' &&
            pages[currentTab].total !== 0)
        "
      >
      </uni-load-more>
      <view
        class=""
        style="margin-top: 30vh"
        v-if="
          pages[currentTab].status === 'noMore' && pages[currentTab].total === 0
        "
      >
        <u-empty text="暂无数据" mode="list"> </u-empty>
      </view>
    </view>
    <view
      class="cu-modal bottom-modal"
      :class="{ show: modalName === 'showAddInfo' }"
    >
      <view class="cu-dialog" @click.stop="">
        <view class="tips margin-top bg-white"> 请填写抽号用户身份信息 </view>
        <view class="user-info">
          <view class="cu-form-group">
            <view class="title"> <text class="text-red">*</text> 用户姓名</view>
            <input placeholder="输入用户姓名" name="input" v-modal="name" />
          </view>
          <view class="cu-form-group">
            <view class="title"><text class="text-red">*</text>身份证号</view>
            <input placeholder="输入身份证号" name="input" v-modal="idcard" />
          </view>
          <view class="cu-form-group">
            <view class="title">手机号</view>
            <input placeholder="输入手机号" name="input" v-modal="phone" />
          </view>
        </view>
        <view class="button-box">
          <button class="cu-btn bg-gray" @click="hideModal">取消</button>
          <button class="cu-btn bg-blue" @click="createNumber">抽号</button>
        </view>
      </view>
    </view>
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
      } ],
      listData: [
        [], [], []
      ],
      tabList: [
        // {
        //   name: "叫号中",
        //   count: 0
        // },
        {
          name: "排队中",
          count: 0
        },
        {
          name: "完成",
          count: 0

        },
        {
          name: "已过号",
          count: 0
        },
      ],
      modalName: "",
      name: "",
      idcard: '',
      phone: ""
    }
  },
  methods: {
    showAddInfo () {
      this.modalName = 'showAddInfo'
    },
    hideModal () {
      this.modalName = ''
    },
    async createNumber () {
      // 工作人员帮忙抽号

    },
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
    async updateQueueInfo (no) {
      let req = [ { "serviceName": "srvhealth_store_queue_up_cfg_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": this.todayQue.id } ], "data": [ { cur_no: no } ] } ]
      if (no) {
        await this.$fetch('operate', 'srvhealth_store_queue_up_cfg_update', req, 'health')
      }
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
          if (status === '叫号中' && res.data.length > 0 && res.data[ 0 ].seq) {
            // if (this?.todayQue?.id) {
            //   this.updateQueueInfo(res.data[ 0 ].seq)
            // }
          }
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
        this.getList()
        if (res.data[ 0 ].cur_no) {
          this.curPerson = await this.getCurPerson(res.data[ 0 ].cur_no)
        }
        this.tabList = this.tabList.map((item, index) => {
          if (item.name === '叫号中') {
            item.count = this.todayQue.call_amount
            this.$set(this.tabList, index, item)
          } else if (item.name === '排队中') {
            item.count = this.todayQue.wait_amount
            this.$set(this.tabList, index, item)
          } else if (item.name === '完成') {
            item.count = this.todayQue.finish_amount
            this.$set(this.tabList, index, item)
          } else if (item.name === '已过号') {
            item.count = this.todayQue.absent_amount
            this.$set(this.tabList, index, item)
          }
          return item
        })
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
    async getList (type = "refresh", index) {
      let current = this.currentTab
      if (index || index === 0) {
        current = index
      }
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ], "condition": [
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no }, { colName: 'status', ruleType: 'eq', value: this.tabList[ current ].name } ], "page": { "pageNo": this.pages[ current ].pageNo, "rownumber": 30 }
      }
      if (this.tabList[ current ].name === '排队中') {
        req.condition[ 1 ] = { colName: 'status', ruleType: 'in', value: '叫号中,排队中' }
      }
      this.pages[ current ].status = 'loading'
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')

      if (res.success) {
        let data = type === 'loadmore' ? [ ...this.listData[ current ], ...res.data ] : res.data
        this.$set(this.listData, current, data)
        if (res.page.total > res.page.pageNo * res.page.rownumber) {
          this.pages[ current ].status = 'more'
        } else {
          this.pages[ current ].status = 'noMore'
        }
        this.pages[ current ].total = res.page.total
        // this.tabList[ current ].count = res.page.total
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
      this.getList('loadmore', this.currentTab)
    }
  },
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
    .queue-status {
      flex: 1;
      text-align: left;
      font-size: 18px;
    }
    .cu-btn {
      margin-right: 20rpx;
      min-width: 25%;
    }
  }
}
.button-box {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 10rpx;
  margin: 0 20rpx 10rpx;
  border-bottom: #f1f1f1 1px solid;
}
.cu-dialog {
  .button-box {
    background-color: #fff;
    padding: 20rpx 20rpx 40rpx;
    justify-content: space-around;
    margin: 0;
    .cu-btn {
      width: 40%;
    }
  }
}
</style>
