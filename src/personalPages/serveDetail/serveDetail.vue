<template>
  <view v-if="info">
    <view class="header">

      <view class="name">
        <!-- <text style="transform: rotate(90deg);">
          <text class="cuIcon-playfill text-green"></text>
        </text> -->
        <text class="cuIcon-titles text-green"></text>
        <text> {{info.report_type||''}}</text>
      </view>
      <view class="tip cu-tag bg-orange light round">
        {{info.index_count_abnormal||'0'}}项异常
      </view>
    </view>
    <view class="label">
      <view class="labe-item">
        检验项目
      </view>
      <view class="labe-item">
        检验结果
      </view>
    </view>
    <view class="list-box">
      <view class="list-item" :class="{
          'value-red':item.index_trend&&item.index_trend=='偏高',
          'value-green':item.index_trend&&item.index_trend=='偏低',
          'mulit-line':item.index_type&&item.index_type.indexOf('描述')!==-1
          }" v-for="item in list">
        <view class="list-item-label">
          {{item.index_name||''}}{{item.val_unit||''}}
        </view>
        <view class="list-item-value">
          <text class="trend" v-if="item.index_trend=='偏低'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
              width="18" height="18" style="border-color: rgba(0,0,0,0);border-width: bpx;border-style: undefined"
              filter="none">
              <path d="M17.333 16h9.333l-10.667 10.667-10.667-10.667h9.333v-10.667h2.667z" fill="rgba(67, 198, 142, 1)">
              </path>
            </svg></text>
          <text class="trend" v-if="item.index_trend=='偏高'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
              width="18" height="18" style="border-color: rgba(0,0,0,0);border-width: bpx;border-style: undefined"
              filter="none">
              <path d="M17.333 16v10.667h-2.667v-10.667h-9.333l10.667-10.667 10.667 10.667z" fill="rgba(243, 90, 7, 1)">
              </path>
            </svg></text>
          <text class="value"> {{item.index_val}}</text>
          <text class="range">
            ({{item.val_min}}~{{item.val_max}})
          </text>
        </view>
        <view class="list-item-result" v-if="item.index_type&&item.index_type.indexOf('结论')!==-1">
          {{item.item.index_result||''}}
        </view>
        <view class="list-item-desc" v-if="item.index_type&&item.index_type.indexOf('描述')!==-1">
          {{item.index_desc}}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        rp_no: '',
        info: null,
        list: []
      }
    },
    methods: {
      async getData() {
        const url = `/health/select/srvhealth_store_serve_report_record_select`
        const req = {
          "serviceName": "srvhealth_store_serve_report_record_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "rp_no",
            "ruleType": "eq",
            "value": this.rp_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          }
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.info = res.data.data[0]
        }
      },
      async getList() {
        const url = '/health/select/srvhealth_store_serve_report_index_record_select'
        const req = {
          "serviceName": "srvhealth_store_serve_report_index_record_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "rp_no",
            "ruleType": "eq",
            "value": this.rp_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          },
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.list = res.data.data
        }
      },
    },
    onPullDownRefresh() {
      if (this.rp_no) {
        this.getData().then(_ => {
          this.getList().then(_ => {
            uni.stopPullDownRefresh()
          })
        })
      }
      setTimeout(_ => {
        uni.stopPullDownRefresh()
      }, 5000)
    },
    onLoad(e) {
      if (e.rp_no) {
        this.rp_no = e.rp_no
        this.getData()
        this.getList()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/common/css/mixin/text-overflow.scss";

  .header {
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;

    .name {
      font-size: 16px;
      display: flex;
      // &::before{
      //   content: "";
      //   width: 0;
      //   border: 10px solid transparent;
      //   border-top-color: #43c68e;
      //   left: 0;
      // }
      align-items: center;

      .text-green {
        color: #43c68e;
        font-size: 18px;
      }
    }
  }

  .label {
    display: flex;
    padding: 24rpx;
    justify-content: space-between;
    color: #aeaeb2;
    font-size: 24rpx;
  }

  .list-box {
    padding: 0 0 32rpx;

    .list-item {
      background-color: #fff;
      padding: 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1px;

      &-value {
        display: flex;
        align-items: center;
      }

      &.value-red {
        color: #f35a07;
      }

      &.value-green {
        color: #43c68e;
      }

      .range {
        color: #616161;
        margin-left: 5px;
      }

      &.mulit-line {
        .list-item-desc {
          width: 100%;
          padding: 10px;
          background-color: #f8f8f8;
          border-radius: 5px;
          margin-top: 10px;
        }
      }
    }
  }
</style>
