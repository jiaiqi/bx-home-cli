<template>
  <view class="page-wrap">
    <image class="image" src="../../static/img/successPay.png" mode="aspectFit"></image>
    <view class="text">
      <text class="cuIcon-roundcheckfill text-green margin-right-xs"></text>
      支付成功
    </view>
    <view class="button-box">
      <button class="cu-btn round bg-red" @click="toDetail">我的订单</button>
      <button class="cu-btn round " @click="toHome">返回首页</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        order_no: ''
      };
    },
    methods: {
      toHome() {
        // #ifdef H5
        // uni.postMessage({
        //   type: "navigateBack"
        // })
        // return
        // #endif
        // uni.navigateBack({
        //   success: (res) => {
        //     console.log(res)
        //   }
        // })
        uni.redirectTo({
          url:`/storePages/home/home?store_no=${this.storeInfo?.store_no}`
        })
      },
      toDetail() {
        // uni.redirectTo({
        //   url: '/storePages/placeOrder/placeOrder?order_no=' + this.order_no
        // });
        // %5B%7B"colName"%3A"store_no","ruleType"%3A"eq","value"%3A"S2206090001"%7D,%7B"colName"%3A"person_no","ruleType"%3A"eq","value"%3A"PB2020092209440043"%7D%5D
        const cond = [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo?.store_no
          },
          {
            colName: 'person_no',
            ruleType: 'eq',
            value: this.userInfo?.no
          }
        ]
        const url =
          `/publicPages/list2/list2?pageType=list&serviceName=srvhealth_youx_store_order_select&disabled=true&destApp=health&cond=${JSON.stringify(cond)}`
        uni.redirectTo({
          url: url
        })
      }
    },
    onLoad(option) {
      if (option.order_no) {
        this.order_no = option.order_no;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .page-wrap {
    background-color: #fff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .image {
      width: 100vw;
      height: 100vw;
      max-width: 700rpx;
      max-height: 700rpx;
    }

    .text {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 30px;
    }

    .button-box {
      display: flex;
      flex-direction: column;

      .cu-btn {
        width: 60vw;
        margin-bottom: 10px;
      }
    }
  }
</style>
