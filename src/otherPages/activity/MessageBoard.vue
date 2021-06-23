<template>
  <view class="message-board">
    <!-- <view class="title"> 留言墙 </view> -->
    <input class="input-box" placeholder="说说你的想法吧..." />
  </view>
</template>

<script>
// 留言板
export default {
  methods: {
    name () {

    }
  },
}
</script>

<style lang="scss" scoped>
.message-board {
  min-height: 300rpx;
  z-index: 10;
  position: relative;
  .title {
    min-height: 80rpx;
  }
  .input-box {
    width: 80%;
    margin: 40rpx auto 20rpx;
    border-radius: 50rpx;
    height: 80rpx;
    border: 2px solid #911904;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ccc;
    background-color: rgba($color: #911904, $alpha: 0.7);
  }
}
</style>