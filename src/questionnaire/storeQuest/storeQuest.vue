<template>
  <div class="store-quest">
    <view class="quest-list">
      <view
        class="quest-item"
        v-for="item in activeList"
        :key="item.activity_no"
        @click="toRecord(item)"
      >
        <view class="quest-title">
          <text class="title">
            {{ item.title }}
          </text>
          <view class="quest-status bg-cyan">
            {{ item.status }}
          </view>
        </view>

        <view class="quest-button">
          <view class="quest-date text-gray">
            <text class="cuIcon-timefill margin-right-sm"></text>
            <text>
              {{ item.create_time || "" }}
            </text>
          </view>
          <button class="button cu-btn bg-blue" type="primary">查看记录</button>
        </view>
      </view>
    </view>
    <uni-load-more class="load-more" :status="loadStatus"></uni-load-more>
  </div>
</template>

<script>

export default {
  data () {
    return {
      store_no: 'S20210517043',
      pageNo: 1,
      activeList: [],
      loadStatus: 'more'
    }
  },
  methods: {
    toRecord (e) {
      // 跳转到问卷填写记录
      // if (e.activity_no) {
      //   uni.navigateTo({ url: './list?activity_no=' + e.activity_no })
      // }
      let viewTemp = {
        // price: "content_status",
        // price:"create_time",
        tip: 'fill_text',
        footer: 'create_time',
        // title: 'nickname',
        // img: 'headimgurl'
      };
      let cond = [ {
        colName: "activity_no",
        ruleType: "like",
        value: e.activity_no
      } ]
      let url =
        `/publicPages/list/list?pageType=list&hideFootBtn=true&destApp=daq&appName=daq&serviceName=srvdaq_record_reply_with_fill_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
      uni.navigateTo({
        url: url
      })
    },
    async getList (type = "refresh") {
      // 查找店铺关联问卷
      const req = { "serviceName": "srvdaq_activity_cfg_select", "colNames": [ "*" ], "condition": [ { colName: 'store_no', ruleType: 'eq', value: this.store_no } ], "page": { "pageNo": this.pageNo, "rownumber": 20 } }
      this.loadStatus = 'loading'
      const res = await this.$fetch('select', 'srvdaq_activity_cfg_select', req, 'daq');
      if (res.success) {
        if (type === 'refresh') {
          this.activeList = res.data
        } else {
          this.activeList = [ ...res.data, this.activeList ]
        }
        if (res.page.total > res.page.rownumber * res.page.pageNo) {
          this.loadStatus = 'more'
        } else {
          this.loadStatus = 'noMore'
        }
      }
      return res
    },
  },
  // 页面周期函数--监听页面加载
  onLoad (option) {
    if (option.store_no) {
      this.store_no = option.store_no
      this.getList()
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.getList('refresh')
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 300);
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () {
    if (this.loadStatus === 'mores') {
      this.pageNo++
      this.getList('loadmore')
    }
  },
};
</script>

<style scoped lang="scss">
.quest-list {
  .quest-item {
    padding: 20rpx;
    border-radius: 10rpx;
    border-bottom: 1px solid #f1f1f1;
    .quest-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10rpx;
      .title {
        display: inline-block;
        width: 70%;
      }
      .quest-status {
        padding: 10rpx 20rpx;
        border-radius: 50rpx;
      }
    }
    .quest-button {
      display: flex;
      justify-content: space-between;
      padding-top: 20rpx;
      align-items: center;
    }
  }
}
</style>
