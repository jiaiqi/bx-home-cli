<template>
  <view>
    <view class="earning-card">
      <view class="content">
        <view class="content-item">
          <view class="label">
            已提现
          </view>
          <view class="value">
            {{data.total_withdraw_amount||'00.00'}}
          </view>
        </view>
        <view class="content-item">
          <view class="label">
            总收益
          </view>
          <view class="value">
            {{data.total_commission_money||'00.00'}}
          </view>
        </view>
      </view>
      <view class="bottom">
        <view class="">
          可提现余额(元)：{{data.total_over_money||'00.00'}}
        </view>
        <button class="cu-btn sm" @click="toWithdraw">提现</button>
        <!-- <button class="cu-btn sm" :disabled="!data.total_over_money" @click="toWithdraw">提现</button> -->
      </view>
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
        uni.navigateTo({
          url:'/pages/h5/withdraw/withdraw'
        })
      },
      getData() {
        const service = 'srvhealth_total_withdraw_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
              "colName": "user_account",
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

<style lang="scss" scoped>
  .earning-card {
    background-color: #DCB081;

    border-radius: 10px;
    margin: 10px;
    color: #fff;

    .content {
      padding: 20px;
      display: flex;
      justify-content: center;
      z-index: 1;
      position: relative;
      overflow: hidden;
      &::after {
        content: '';
        right: 0;
        bottom: 0;
        transform: rotate(325deg);
        width: 100%;
        height: 100%;
        position: absolute;
        transform: rotate(325deg) translate(-25px, 100px);
        background-size: 30%;
        background-image: url('../static/icon/money.png');
        background-repeat: no-repeat;
        background-position: right bottom;
        z-index: -1;
      }

      .content-item {
        flex: 1;
        text-align: center;
      }

      .value {
        font-size: 18px;
        font-weight: bold;
        padding: 10px;
      }
    }

    .bottom {
      background-color: #fff;
      color: #333;
      padding: 10px;
      display: flex;
      justify-content: space-between;

      .cu-btn {
        background-color: #B34342;
        color: #Fff;
        padding: 5px 15px;
        border-radius: 10px;
      }
    }
  }
</style>
