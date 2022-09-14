<template>
  <view class="my-earning">
    <view class="  padding-tb-xs ">
      我的收益(元)
    </view>
    <view class="padding-tb-xs text-xxl text-red text-bold">
      3585.15
    </view>
    <view class="">
      含待结算金额:858.15
    </view>
    <view class="banner">
      收益明细
    </view>
  </view>
</template>

<script>
  export default {

  }
</script>

<style scoped lang="scss">
  .my-earning {
    height: 220rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;

    .banner {
      position: absolute;
      right: 0;
      top: 25%;
      text-align: center;
      background: linear-gradient(to right, #FAA153, #FF414B);
      padding: 5px 15px;
      color: #fff;
      border-radius: 50px 0 0 50px;
    }
  }
</style>
