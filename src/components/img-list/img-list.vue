<template>
  <div class="img-list">
    <image
      :lazy-load="true"
      :draggable="false"
      show-menu-by-longpress
      :class="{
        single: imagesUrl.length === 1,
        double: imagesUrl.length === 2,
      }"
      :style="{ width: item.imgWidth + 'px', height: item.imgHeight + 'px' }"
      @click="
        toPreviewImage(
          imagesUrl.map((e) => e.origin),
          index
        )
      "
      class="image"
      v-for="(item, index) in imagesUrl"
      :key="item.origin"
      :src="item.origin"
      mode="aspectFit"
    />
  </div>
</template>

<script>
export default {
  props: {
    fileNo: {
      type: [ String, Number ],
      default: ''
    },
  },
  data () {
    return {
      imagesUrl: []
    }
  },
  methods: {
    async getImage () {
      let res = await this.getFilePath(this.fileNo)
      if (Array.isArray(res)) {
        let arr = []
        for (let index = 0; index < res.length; index++) {
          const item = res[ index ];
          let obj = {
            compress: this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
              'bx_auth_ticket') + '&thumbnailType=fwsu_100',
            origin: this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
              'bx_auth_ticket'),
          }
          let picInfo = await this.getImageInfo({ url: obj.origin })
          if (picInfo.w && picInfo.h) {
            let max = null
            if (res.length === 1) {
              max = 540
            } else if (res.length === 2) {
              max = 260
            }
            if (max) {
              let result = this.setPicSize(picInfo, max);
              if (result.w && result.h) {
                obj.imgWidth = result.w
                obj.imgHeight = result.h
              }
            }

          }
          arr.push(obj)
        }
        this.imagesUrl = arr

        // this.imagesUrl = res.map(item => {
        //   let res = {
        //     compress: this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
        //       'bx_auth_ticket') + '&thumbnailType=fwsu_100',
        //     origin: this.$api.getFilePath + item.fileurl + '&bx_auth_ticket=' + uni.getStorageSync(
        //       'bx_auth_ticket'),
        //   }
        //   return res
        // })
      }
    },
    //????????????????????????????????????????????????????????????????????????????????????
    setPicSize (content, max = 350) {
      // ????????????????????????????????????????????????????????????????????????????????????????????????????????????aspectFit?????????
      let maxW = uni.upx2px(max); //max?????????????????????????????????
      let maxH = uni.upx2px(max); //max?????????????????????????????????
      if (content.w > maxW || content.h > maxH) {
        let scale = content.w / content.h;
        content.w = scale > 1 ? maxW : maxH * scale;
        content.h = scale > 1 ? maxW / scale : maxH;
      }
      return content;
    },
  },
  watch: {
    fileNo: {
      immediate: true,
      handler (newValue, oldValue) {
        if (newValue) {
          this.getImage()
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.img-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  flex: 1;
  .image {
    width: 170rpx;
    height: 170rpx;
    margin-right: 10rpx;
    margin-top: 10rpx;
    background-color: #fff;
    border: 1rpx solid #f1f1f1;
    &:nth-child(1),
    &:nth-child(2),
    &:nth-child(3) {
      margin-top: 0;
    }
    &.single {
      width: 100%;
      margin: 0;
    }
    &.double {
      width: calc(50% - 5rpx);
      &:first-child {
        margin-right: 10rpx;
      }
    }
  }
}
</style>