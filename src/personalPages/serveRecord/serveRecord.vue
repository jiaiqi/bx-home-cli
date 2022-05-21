<template>
  <view class="page-wrap">
    <view class="main-info" v-if="customer">
      <view class="name">
        <text>{{customer.cus_name || ''}}</text>
        <text>{{customer.sex||''}}</text>
      </view>
      <view class="phone">
        {{customer.cus_phone||''}}
      </view>
      <view class="info" v-if="data">
        <view class="">
          共<text>{{totalAbnormalCount}}</text>项指标显示异常
        </view>
        <view class="" v-if="data.srv_time">
          体检日期：{{data.srv_time.slice(0,11)}}
        </view>
      </view>
    </view>
    <view class="detail-box">
      <view class="detail-box_title">
        <text class="cuIcon-titles text-green"></text>
        <text>异常数据</text>
        <text class="cu-tag bg-orange light round margin-left-xs"
          v-if="totalAbnormalCount">{{totalAbnormalCount}}项</text>
      </view>
      <view class="detail-box-item" v-for="item in abnormalList" @click="toDetail(item)">
        <view class="title">
          {{item.report_type||''}}
        </view>
        <view class="right">
          <text></text>
          <text class="cuIcon-right text-gray"></text>
        </view>
      </view>

    </view>
    <view class="detail-box">
      <view class="detail-box_title">
        <text class="cuIcon-titles text-green"></text>
        <text>检查项目</text>
      </view>
      <view class="detail-box-item" v-for="item in list" @click="toDetail(item)">
        <view class="title">
          {{item.report_type||''}}
        </view>
        <view class="right">
          <text class="red" v-if="item.index_count_abnormal">{{item.index_count_abnormal}}项指标异常</text>
          <text class="cuIcon-right text-gray margin-left"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        customer: null, //客户信息
        srNo: "",
        data: null,
        list: [],
        loadStatus: 'more'
      }
    },
    computed: {
      totalAbnormalCount() {
        return this.abnormalList.reduce((res, cur) => {
          res += cur.index_count_abnormal;
          return res
        }, 0)
      },
      abnormalList() {
        return Array.isArray(this.list) && this.list.filter(item => item.index_count_abnormal && item
          .index_count_abnormal > 0) || []
      }
    },
    methods: {
      toDetail(e) {
        const url = `/personalPages/serveDetail/serveDetail?rp_no=${e.rp_no}`
        uni.navigateTo({
          url
        })
      },
      async getCustomer() {
        const url = '/health/select/srvhealth_store_customer_mgmt_select'
        const req = {
          "serviceName": "srvhealth_store_customer_mgmt_select",
          "condition": [{
            "colName": "cus_no",
            "ruleType": "eq",
            "value": this.data.cus_no
          }],
          "colNames": ["*"]
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.customer = res.data.data[0]
        }
      },
      async getList() {
        const url = `/health/select/srvhealth_store_serve_report_record_select`
        const req = {
          "serviceName": "srvhealth_store_serve_report_record_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "sr_no",
            "ruleType": "eq",
            "value": this.srNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          }
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.list = res.data.data
        }
      },
      async getData() {
        const url = '/health/select/srvhealth_store_customer_serve_record_select'
        const req = {
          "serviceName": "srvhealth_store_customer_serve_record_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "sr_no",
            "ruleType": "eq",
            "value": this.srNo
          }],
          "page": {
            "rownumber": 1,
            "pageNo": 1
          }
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.data = res.data.data[0]
          if (this.data.cus_no) {
            this.getCustomer()
          }
        }
      },
    },
    onLoad(option) {
      if (option.no || option.sr_no) {
        this.srNo = option.no || option.sr_no
        this.getData().then(_ => {
          this.getList()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    min-height: 100vh;
    background-color: #f8f8f8;
  }

  .main-info {
    background: url('top_bg.png');
    width: 100%;
    height: 300rpx;
    background-size: contain;
    background-repeat: no-repeat;
    padding: 48rpx 64rpx;
    color: #fff;

    .name {
      font-size: 16px;
      line-height: 22px;
      font-weight: bold;
    }

    .info {
      padding-top: 32rpx;
      lighting-color: 26px;

      .num {
        font-size: 16px
      }
    }
  }

  .detail-box {
    padding: 28rpx;

    .detail-box_title {
      font-size: 16px;
      display: flex;
      align-items: center;
      padding: 16rpx 0;

      .text-green {
        color: #43c68e;
      }

    }

    .detail-box-item {
      padding: 16px;
      background-color: #fff;
      margin-bottom: 16rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .red {
        color: #f35a07;
      }

      .text-gray {
        color: #c7c7cc;
        font-size: 16px;
      }
      .right{
        flex: 1;
        display: flex;
        justify-content: flex-end;
        padding-left: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
