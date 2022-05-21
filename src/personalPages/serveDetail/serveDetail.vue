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
      <view class="list-item" v-for="item in list">
        <view class="">
          {{item.index_name||''}}{{item.val_unit||''}}
        </view>
        <view class="">
          {{item.index_val}}({{item.val_min}}~{{item.val_max}})
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
    padding:  24rpx;
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
    }
  }
</style>
