<template>
  <div class="relation-store layout1" :style="[calcStyle]" v-if="pageItem&&pageItem.related_store_style==='大图滑动'">
    <view class="store-item" v-for="item in listData" :key="item.id" @click="toStore(item)">
      <image class="image" :src="getImagePath(item.b_logo,true)" mode="aspectFit" />
      <view class="label">{{
          item.b_name_short || (item.b_name ? item.b_name.slice(-10) : "-")
        }}</view>
    </view>
    <view class="store-item to-more" @click="toMore" v-if="showMore">
      <text class="image cuIcon-more"></text>
      <view class="label"> 查看更多 </view>
    </view>
  </div>
  <view class="relation-store layout2" v-else-if="pageItem&&pageItem.related_store_style==='大图双列'">
    <view class="store-item" v-for="item in listData" :key="item.id" @click="toStore(item)">
      <image class="image" :src="getImagePath(item.b_logo,true)" mode="aspectFit" />
      <view class="label">{{
          item.b_name_short || (item.b_name ? item.b_name.slice(-10) : "-")
        }}</view>
    </view>
    <view class="store-item to-more" @click="toMore" v-if="showMore">
      <text class="image cuIcon-more"></text>
      <view class="label"> 查看更多 </view>
    </view>
  </view>
  <view class="relation-store layout3" v-else>
    <view class="store-item" v-for="item in listData" :key="item.id" @click="toStore(item)">
      <image class="image" :src="getImagePath(item.b_logo)" mode="aspectFit" />
      <view class="label">{{
        item.b_name_short || (item.b_name ? item.b_name.slice(-10) : "-")
      }}</view>
    </view>
    <view class="store-item to-more" @click="toMore" v-if="showMore">
      <text class="image cuIcon-more"></text>
      <view class="label"> 查看更多 </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      storeNo: {
        type: String,
        default: ""
      },
      pageItem: {
        type: Object
      }
    },
    watch: {
      ['pageItem.listdata']: {
        handler(newVal) {
          if (this.pageItem?.row_number && Array.isArray(newVal) && newVal.length > 0) {
            this.row_number = this.pageItem.row_number
            if (newVal.length >= this.row_number * 4) {
              this.showMore = true
              this.listData = newVal.slice(0, 4 * this.pageItem.row_number - 1)
            } else {
              this.listData = newVal.slice(0, 4 * this.pageItem.row_number)

              this.showMore = false
            }
          } else {
            this.listData = newVal
          }
        }
      }
    },
    computed: {
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
    },
    data() {
      return {
        row_number: 3,
        showMore: false,
        listData: []
      }
    },
    methods: {
      toMore() {
        const url =
          `/publicPages/list/list?pageType=list&col=4&searchKey=b_name&hideFootBtn=true&customTemp=true&serviceName=srvhealth_store_relation_select&cond=${JSON.stringify([ { colName: "relation_type", ruleType: "in", value: "包含" }, { colName: "a_store_no", ruleType: "eq", value: this.storeNo } ])}&viewTemp={"title":"b_name_short||b_name","img":"b_logo"}`
        uni.navigateTo({
          url
        })
      },
      toStore(e) {
        if (e.b_store_no) {
          uni.navigateTo({
            animationType: "zoom-fade-out",
            animationDuration: 500,
            url: '/pages/home/home?store_no=' + e.b_store_no
          })
        }
      }

    }
  }
</script>

<style lang="scss" scoped>
  .relation-store {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 20rpx;

    .store-item {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      border-radius: 20rpx;
      width: calc(25% - (30rpx / 4));
      overflow: hidden;
      margin-right: 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      // justify-content: center;
      margin-top: 10rpx;

      transition: all 0.5s ease-in;

      &.to-more {
        justify-content: center;
      }

      &:active {
        background-color: #f1f1f1;
      }

      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        margin-top: 0;
      }

      &:nth-child(4n) {
        margin-right: 0;
      }

      .label {
        padding: 10rpx;
        text-align: center;
      }

      .image {
        width: 100%;
        height: 100rpx;
        font-size: 60rpx;
        line-height: 100rpx;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    &.layout1 {
      overflow-x: auto;
      // display: block;
      flex-wrap: nowrap;
      background-color: transparent;
      padding: 0;

      .store-item {
        margin: 0;
        display: inline-flex;
        min-width: 300rpx;
        height: 300rpx;
        margin-right: 20rpx;
        box-shadow: 0px 3px 6px rgba(192, 194, 206, 0.2);
        background-color: #fff;

        .image {
          width: 100%;
          height: 250rpx;
          line-height: 250rpx;
        }
      }
    }

    &.layout2 {
      background-color: transparent;
      padding: 0;

      .store-item {
        display: inline-flex;
        width: calc(50% - 10rpx);
        height: 300rpx;
        margin-right: auto;
        box-shadow: 0px 3px 6px rgba(192, 194, 206, 0.2);
        background-color: #fff;

        &:nth-child(2n) {
          margin-right: 0;
        }

        margin-top: 0;
        margin-bottom: 20rpx;

        .image {
          width: 100%;
          height: 250rpx;
        }
      }
    }
  }
</style>
