<template>
  <div class="relation-store" :style="[calcStyle]">
    <view
      class="store-item"
      v-for="item in listData"
      :key="item.id"
      @click="toStore(item)"
    >
      <image
        class="image"
        :src="getImagePath(item.b_logo)"
        mode="scaleToFill"
      />
      <view class="label">{{
        item.b_name_short || item.b_name ? item.b_name.slice(-10) : "-"
      }}</view>
    </view>
  </div>
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
    [ 'pageItem.listdata' ]: {
      handler (newVal) {
        if (this.pageItem?.row_number && Array.isArray(newVal) && newVal.length > 0) {
          this.listData = newVal.slice(0, 4 * this.pageItem.row_number)
        } else {
          this.listData = newVal
        }
      }
    }
  },
  computed: {
    calcStyle () {
      if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
        return {
          margin: this.pageItem.margin
        }
      }
    },
  },
  data () {
    return {
      listData: []
    }
  },
  methods: {
    toStore (e) {
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
    padding: 10rpx;
    border-radius: 20rpx;
    max-width: calc(25% - (30rpx / 4));
    overflow: hidden;
    margin-right: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: center;
    margin-top: 10rpx;

    transition: all 0.5s ease-in;
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
      text-align: center;
    }
    .image {
      width: 100rpx;
      height: 100rpx;
    }
  }
}
</style>
