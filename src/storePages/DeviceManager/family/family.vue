<template>
  <view>
    <view class="family-list">
      <view class="family-item">
        <view class="add-box" @click="toAddKin">
          <view class="add-btn"><text class="cuIcon-add"></text></view>
          <text class="add-label">添加亲友</text>
        </view>
      </view>
    </view>
    <view class="cu-bar tabbar bg-white shadow foot">
      <view
        class="action"
        v-for="(tab, index) in tabList"
        :key="tab.text"
        @click="changeTab(index)"
      >
        <view class="cuIcon-cu-image">
          <text
            :class="
              currentTab !== index
                ? tab.iconPath + ' ' + 'text-gray'
                : tab.selectedIconPath + ' ' + 'text-cyan'
            "
          ></text>
        </view>
        <view :class="currentTab == index ? 'text-cyan' : 'text-gray'">
          {{ tab.text }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>

export default {
  data () {
    return {
      store_no: "",
      tabList: [ {
        iconPath: "cuIcon-home",
        selectedIconPath: "cuIcon-homefill",
        text: '我的设备',
        customIcon: false,
      },
      {
        iconPath: "cuIcon-circle",
        selectedIconPath: "cuIcon-circlefill",
        text: '我的亲友',
        customIcon: false,
      } ],
      currentTab: 1,
    }
  },
  methods: {
    toAddKin () {
      // 添加亲友

    },
    addToMyKin () {
      // 将某个用户添加为当前登录用户的亲友
    },
    changeTab (index) {
      if (index === 0) {
        uni.redirectTo({ url: `/storePages/DeviceManager/DeviceManager?store_no=${this.store_no}` })
      }
    },
  },
  // 页面周期函数--监听页面加载
  onLoad (option) {
    if (option.store_no) {
      this.store_no = option.store_no
    }
  },
  // 页面周期函数--监听页面初次渲染完成
  onReady () { },
  // 页面周期函数--监听页面显示(not-nvue)
  onShow () { },
  // 页面周期函数--监听页面隐藏
  onHide () { },
  // 页面周期函数--监听页面卸载
  onUnload () { },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () { },
  // 页面处理函数--监听页面滚动(not-nvue)
  /* onPageScroll(event) {}, */
  // 页面处理函数--用户点击右上角分享
  /* onShareAppMessage(options) {}, */
};
</script>

<style scoped lang="scss">
.family-list {
  padding: 20rpx;
  display: flex;
  flex-wrap: wrap;
  .family-item {
    width: calc(50% - 20rpx);
    padding: 20rpx;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    min-height: 200rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-right: 20rpx;
    &:nth-child(2n) {
      margin-right: 0;
    }
    .add-box {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      .add-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        background: #dbdbdb;
        font-size: 50rpx;
        overflow: hidden;
        border-radius: 50%;
        color: #fff;
        font-weight: bold;
      }
      .add-label {
        color: #999;
        margin-top: 5rpx;
      }
    }
  }
}
</style>
