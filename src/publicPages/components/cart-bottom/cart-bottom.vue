<template>
  <view class="cart-bottom" :class="['theme-'+vtheme]">
    <view class="cart-left">
      <label class="radio" @click="radioChange">
        <radio value="selectAll" :checked="selectAll" style="transform:scale(0.7)" />
        <text>全选</text>
        <button class="text-red cu-btn bg-white" @click.stop="del" v-if="sumPrice>0">删除</button>
      </label>
    </view>
    <view class="handler" v-if="mode==='default'">
      <view class="price">
        <text>合计</text> <text class="text-red sum-price"><text class="prefix">￥</text> {{sumPrice||'0.00'}}</text>
      </view>
      <button class="cu-btn round shadow-blur" :disabled="sumPrice===0"
        :class="{active:sumPrice>0,'bx-bg-color':sumPrice>0&&vtheme}" @click.stop="placeOrder">去结算</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        selectAll: false
      }
    },
    props: {
      mode: {
        type: String,
        default: "default"
      },
      sumPrice: {
        type: Number,
        default: 0
      },
    },
    methods: {
      radioChange(e) {
        this.selectAll = !this.selectAll;
        this.$emit('selectAll', this.selectAll)
      },
      del() {
        this.$emit('del')
      },
      placeOrder() {
        this.$emit('toPlaceOrder')
      }
    },
  }
</script>

<style scoped lang="scss">
  .cart-bottom {
    width: calc(100% - 20rpx);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-top: 1px solid #f1f1f1;
    background-color: #fff;
    position: fixed;
    bottom: 30px;
    left: 10rpx;
    border-radius: 20rpx;

    .cart-left {
      display: flex;
      align-items: center;

      .radio {
        display: flex;
        align-items: center;
      }
    }

    .cart-icon {
      font-size: 24px;
      margin-right: 20px;
    }

    .handler {
      display: flex;
      align-items: center;

      .prefix {
        font-size: 12px;
      }

      .price {
        margin-right: 20px;
        font-size: 12px;

        .sum-price {
          font-size: 20px;
        }
      }
    }
  }
</style>
