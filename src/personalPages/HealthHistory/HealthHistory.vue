<template>
  <div class="health-history">
    <view class="health-history-box">
      <view class="health-item" @click="toDetail('bp')">
        <img class="icon" src="../static/xueya.png" />
        <view class="data">
          <view class="data-text">
            <text>血压</text>
          </view>
          <view class="create-time"> 5月7日 </view>
        </view>
      </view>
      <view class="health-item" @click="toDetail('bg')">
        <img class="icon" src="../static/xuetang.png" />
        <view class="data">
          <view class="data-text">
            <text>血糖</text>
          </view>
          <view class="create-time"> 5月7日 </view>
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
  </div>
</template>

<script>

export default {
  data () {
    return {
      currentTab: 1,
      tabList: [ {
        iconPath: "cuIcon-home",
        selectedIconPath: "cuIcon-homefill",
        text: '设备',
        customIcon: false,
      },
      {
        iconPath: "cuIcon-circle",
        selectedIconPath: "cuIcon-circlefill",
        text: '状态',
        customIcon: false,
      } ],
      storeNo: "S20210506022"
    }
  },
  methods: {
    changeTab (index) {
      if (index === 0) {
        uni.redirectTo({
          url: `/storePages/DeviceManager/DeviceManager?store_no=${this.storeNo}`
        })
      }
    },
    getXueya () {
      // 查找血压数据
    },
    getXuetang () {
      // 查找血糖数据
    },
    toDetail (e) {
      let url = `/personalPages/ArchiveHistory/ArchiveHistory?pageType=${e}`
      if ([ 'bp', 'bg' ].includes(e)) {
        // bp-血压,bg-血糖
        uni.navigateTo({ url })
      }
    }

  },

  onLoad (option) {
    if (option.storeNo) {
      this.storeNo = option.storeNo
    }
  }
};
</script>

<style scoped lang="scss">
.health-history {
  min-height: 100vh;
  background-color: #f1f1f1;

  .health-history-box {
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx;
  }
  .health-item {
    background-color: #fff;
    border-radius: 20rpx;
    width: calc(50% - 10rpx);
    margin-right: 20rpx;
    height: 300rpx;
    padding: 35rpx 20rpx;

    &:nth-child(2n) {
      margin-right: 0;
    }
    .icon {
      width: 100rpx;
      height: 100rpx;
      overflow: hidden;
    }
    .data {
      padding: 0 15rpx;
      .data-text {
        font-weight: bold;
        font-size: 16px;
        padding: 3px 0;
      }
      .create-time {
        color: #666;
      }
    }
  }
}
</style>
