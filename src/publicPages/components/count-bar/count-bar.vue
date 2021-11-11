<template>
  <view class="count-bar-box" :class="'bx-bg-'+theme">
    <view class="count-bar-item" v-for="item in list">
      <view class="label" v-if="labelPostion=='top'">
        <text class="icon"></text>
        <text>{{item.label}}</text>
      </view>
      <view class="value">
        <text class="prefix">{{item.prefix||''}}</text>
        <text>{{item.value||''}}</text>
        <text class="suffix">{{item.suffix||''}}</text>
      </view>
      <view class="label" v-if="labelPostion==='bottom'">
        <text class="icon"></text>
        <text>{{item.label}}</text>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      list: {
        type: Array
      },
      config: {
        type: Object
      }
    },
    computed: {
      labelPostion() {
        if (this.config?.labelPosition) {
          return this.config?.labelPosition
        } else {
          return 'top'
        }
      },
      theme() {
        return this.$store?.state?.app?.theme
      }
    },
  }
</script>

<style scoped lang="scss">
  .count-bar-box {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    background-color: #0b8dfc;
    border-radius: 50rpx 50rpx 0 0;
    padding: 40rpx 20rpx;

    .count-bar-item {
      min-height: 160rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      color: #fff;
      background-color: rgba($color: #fff, $alpha: 0.1);
      padding: 20rpx;
      border-radius: 20rpx;
      flex: 1;
      margin-right: 20rpx;

      &:last-child {
        margin-right: 0;
      }

      .label {
        font-size: 12px;
        font-family: 苹方-简;
        line-height: 20px;
        text-align: left;
        width: 100%;
      }

      .value {
        font-size: 18px;
        font-family: SF Pro Display;
        font-weight: 400;
        line-height: 20px;
        margin-top: 20rpx;
        text-align: left;
        width: 100%;
      }

      .prefix,
      .suffix {
        font-size: 20rpx;
      }
    }
  }
</style>
