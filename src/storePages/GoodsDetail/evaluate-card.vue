<template>
  <view class="evaluate-card">
    <view class="title" v-if="loadStatus=='noMore'&&list.length===0">
      <text>暂无评价</text>
    </view>
    <view class="title" v-else>
      <text class="text">商品评价</text>
      <text class="right"><text class="">查看全部 </text> <text class="cuIcon-right margin-left-xs"></text> </text>
    </view>
    <view class="">

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        loadStatus: 'more',
        page: {
          total: 0,
          rownumber: 2,
          pageNo: 1
        },
        list: []
      }
    },
    methods: {
      getData() {

      }
    },
  }
</script>

<style scoped lang="scss">
  .evaluate-card {
    background-color: #fff;
    padding: 14px 20px;
    margin-bottom: 10px;

    .title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .text{
        font-size: 16px;
      }
      .right{
        font-size: 12px;
      }
    }
  }
</style>
