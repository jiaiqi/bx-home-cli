<template>
  <view class="news-item" :class="{
        'none-image': !item.icon_image,
        'layout-right-image': item.icon_image,
        'layout-left-image':
          item.cover_pic_style === '左侧' && item.icon_image,
        'layout-center-single-image':
          item.cover_pic_style === '下一' && item.icon_image,
        'layout-center-multi-image':
          item.cover_pic_style === '下三' && item.icon_image,
      }" @click="toArticle(item)">
    <image lazy-load mode="aspectFit" class="image-icon" :src="getImagePath(item.icon_image, true)"
      v-if="item.icon_image">
    </image>
    <view class="content-box">
      <text class="title-text">
        <text>{{ item.title }}</text>
        <text class="text-red cuIcon-hotfill" v-if="item && item.other_status && item.other_status === '热门'">hot</text>
        <button class="line-red cu-btn sm" v-if="item && item.other_status && item.other_status === '最新'">最新</button>
        <button class="line-red cu-btn sm" v-if="item && item.other_status && item.other_status === '精选'">精选</button>
        <button class="line-red cu-btn sm" v-if="item && item.top_status && item.top_status === '是'">置顶</button>
      </text>
      <text class="date" v-if="hideCreateTime!==true">{{
          dayjs(item.create_time).format("YYYY-MM-DD")
        }}</text>
    </view>
  </view>
</template>

<script>
  export default {
    name: "news-item",
    props: {
      item: {
        type: Object
      },
      hideCreateTime: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {

      };
    },
    methods: {
      toArticle(e) {
        if (e.content_no) {
          let url =
            `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${e.content_no}`
          if (this.storeInfo && this.storeInfo.name) {
            url += `&store_name=${this.storeInfo.name}`
          }
          if (this.storeInfo.store_no) {
            url += `&store_no=${this.storeInfo.store_no}`
          }
          // if (this.storeInfo.logo) {
          //   url += `&logo=${encodeURIComponent(this.getImagePath(this.storeInfo.logo, true))}`
          // }
          uni.navigateTo({
            url: url
          });
        }
      },
    },
  }
</script>

<style lang="scss">
  .news-item {
    display: flex;
    padding: 20rpx;
    border-bottom: 1rpx solid #f1f1f1;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    .title-text {
      width: 70%;
      overflow: hidden;
      text-overflow: ellipsis;
      // white-space: nowrap;
      font-size: 32rpx;
      padding-bottom: 20rpx;

      .text-red {
        display: inline-block;
        margin-left: 10rpx;
        font-size: 24rpx;
        position: relative;
        top: -10rpx;
        font-weight: bold;
      }

      .line-red {
        border-radius: 5px;
        margin-left: 10rpx;
        padding: 2px 4px;
        font-size: 12px;
        font-weight: bold;
        border: 1rpx solid #e54d42;
      }
    }

    .content-box {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .date {
      color: #ccc;
    }

    &.none-image {
      // 无图
      flex-direction: column;
      align-items: flex-start;

      .content-box {
        height: auto;
        min-height: 50rpx;
      }

      .title-text {
        font-size: 16px;
        width: 100%;
        white-space: normal;
      }

      .date {
        font-size: 12px;
      }
    }

    &.layout-center-single-image,
    &.layout-center-single-image-top {
      flex-direction: column-reverse;
      padding: 0;
      overflow: hidden;
      margin-bottom: 20rpx;

      .image-icon {
        width: 100% !important;
        height: 200rpx;
      }

      .content-box {
        padding: 10rpx 20rpx;
        width: 100%;
        display: flex;
        flex-direction: row;

        .title-text {
          font-weight: bold;
          margin-left: 0;
          width: calc(100% - 250rpx);
          flex: 1;
        }
      }
    }

    &.layout-center-single-image-top {
      flex-direction: column;
    }

    &.layout-right-image,
    &.layout-left-image {
      // 左图
      flex-direction: row;
      flex-wrap: wrap;

      .content-box {
        min-height: 150rpx;
        width: calc(100% - 250rpx);
      }

      .image-icon {
        width: 200rpx;
        height: 150rpx;
        border-radius: 5px;
      }

      .title-text {
        margin-left: 20rpx;
        flex: 1;
        width: 100%;
      }

      .date {
        margin-left: 20rpx;
      }
    }

    &.layout-right-image {
      // 右图
      flex-direction: row-reverse;

      .title-text {
        margin-left: 0;
      }

      .date {
        margin-left: 0;
      }
    }
  }
</style>
