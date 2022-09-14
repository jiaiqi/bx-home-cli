<template>
  <view>
    <view class="top-bg">

    </view>
    <!-- <image src="./earningbg.png" class="top-bg" mode="aspectFit"></image> -->
    <view class="earning-list">
      <view class="earning-item padding radius bg-white margin-bottom-xs margin-lr-xs flex align-center justify-between"
        v-for="item in list">
        <view class="">
          <view class="">
            佣金收入
          </view>
          <view class="">
            {{item.create_time||''}}
          </view>
        </view>
        <view class="">
          + {{item.amount||'0'}}
        </view>
      </view>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        loadStatus: 'more',
        list: [],
        page: {
          total: 0,
          pageNo: 1
        }
      }
    },
    created() {
      this.getList()
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.page.pageNo++
        this.getList()
      }
    },
    methods: {
      getList() {
        const url = `/health/select/srvhealth_settlement_record_select`
        const req = {
          serviceName: "srvhealth_settlement_record_select",
          colNames: ["*"],
          page: {
            pageNo: this.page.pageNo,
            rownumber: 10
          },
          condition: [{
              colName: 'state',
              ruleType: 'eq',
              value: '成功'
            },
            {
              colName: 'amount',
              ruleType: 'notnull'
            },
            // {
            //   colName:'store_user_no',
            //   ruleType:'eq',
            //   value:this.vstoreUser?.store_user_no
            // }
          ]
        }
        this.loadStatus = 'loading'
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.list = [...this.list, ...res.data.data]
            const page = res?.data?.page
            if (page?.total <= page?.pageNo * page?.rownumber) {
              this.loadStatus = 'noMore'
            }
          }
          this.loadStatus = this.loadStatus === 'noMore' ? 'noMore' : 'more'
        })
      },
    }
  }
</script>

<style scoped>
  .earning-list {
    padding-top: 240rpx;
  }

  .earning-item {
    margin-bottom: 2px;
  }

  .top-bg {
    width: 100%;
    height: 220rpx;
    background-image: url(./earningbg.png);
    background-size: 100%;
    margin-bottom: 20px;
    position: fixed;
    top: 0;
    left: 0;
  }
</style>
