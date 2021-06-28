<template>
  <div class="list-page">
    <list-view></list-view>
  </div>
</template>

<script>
import listView from './list-view.vue'
export default {
  components: { listView },
  // 页面周期函数--监听页面加载
  onLoad () {

  },
  // 页面周期函数--监听页面初次渲染完成
  onPullDownRefresh () {
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () { },
};
</script>

<style></style>
