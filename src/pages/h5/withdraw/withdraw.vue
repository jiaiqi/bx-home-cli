<template>
  <view>
    <view class="text-center margin-tb">
      <image style="width: 100px;height: 100px;" src="/pages/h5/static/icon/withdraw.svg" mode=""></image>
    </view>
    <view class="text-center text-gray">
      可提现余额
    </view>
    <view class="text-bold text-lg text-center padding-tb">
      ￥{{data.total_over_money||'0'}}
    </view>
    <view class="text-center">
      <button class="cu-btn bg-green lg" style="width: 90%;" @click="toWithdraw">提现至微信</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        data: {}
      }
    },
    methods: {
      toWithdraw(){
        
      },
      getData() {
        const service = 'srvhealth_total_withdraw_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
              "colName": "user_no",
              "value": this.userInfo.userno,
              "ruleType": "eq"
            },
            {
              "colName": "store_no",
              "value": this.storeInfo.store_no,
              "ruleType": "eq"
            }
          ]
        }
        const url = `/health/select/${service}`
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
            this.data = res.data.data[0]
          }
        })
      },
    },
    onLoad() {
      this.getData()
    }
  }
</script>

<style>
.bg-green{
  background: #11AA66;
}
</style>
