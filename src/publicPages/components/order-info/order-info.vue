<template>
  <view class="order-info " v-if="orderInfo">
    <view class="top-bar flex justify-between align-center">
      <view class="">
        <text>订单号：</text>
        <text>{{orderInfo.order_no}}</text>
      </view>
<!--      <view class="">
        {{ dayjs(orderInfo.create_time).format("MM-DD HH:mm")}}
      </view> -->
    </view>
    <view class="goods-list" v-if="orderInfo._childData">
      <view class="goods-item flex" v-for="item in orderInfo._childData">
        <image class="goods-image" :src="getImagePath(item.goods_image)" mode=""></image>
        <view class="content padding-lr-xs">
          <view class="name">
            {{item.goods_name}}
          </view>
          <view class="bottom flex justify-between">
            <view class="">
              x1
            </view>
            <view class="" v-if="orderInfo.order_pay_amount">
              合计<text class="text-sm text-red">￥</text> <text
                class="text-lg text-red">{{orderInfo.order_pay_amount}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="" style="text-align: right;font-size: 12px;padding: 5px 0;">
      <text>下单时间：</text>{{ dayjs(orderInfo.create_time).format("MM-DD HH:mm")}}
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      orderInfo: {
        type: Object
      },
    },
  }
</script>

<style scoped lang="scss">

  .order-info {
    background-color: #fff;
    padding: 5px;
    .top-bar {
      font-size: 12px;
      padding: 5px 0;
      flex-wrap: wrap;
      
    }

    .goods-item {
      display: flex;
      padding: 5px;
      background-color: #f8f8fa;
      display: flex;

      .goods-image {
        width: 40px;
        height: 40px;
        border-radius: 5px;
      }

      .content {
        text-align: left;
        width: calc(100% - 40px);

        .name {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bottom {
          font-size: 12px;
          line-height: 18px;
        }
      }
    }
  }
</style>