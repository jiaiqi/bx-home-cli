<template>
  <view class="cu-modal" :class="{show:modelValue}">
    <view class="cu-dialog" style="background-color: transparent;">
      <scroll-view class="scroll" scroll-y>
        <image :src="image" class="image" mode="widthFix" />
      </scroll-view>
      <view class="button" @tap="saveImage">保存分享图</view>
      <view class="button cancel" @tap="handleValue">取消</view>
    </view>
    <!-- <u-popup :show="modelValue" background="transparent" @close="handleValue">
    	
    </u-popup> -->
  </view>
</template>

<script>
  export default {
    name: "u-show-poster",
    props: {
      modelValue: Boolean,
      image: String,
    },
    data() {
      return {
        handleValue() {
          this.$emit('modelValue', !this.modelValue)
        },
        async saveImage() {
          // #ifdef H5
          uni.showToast({
            title: 'H5不支持API保存图片,请使用长按保存!!!',
            icon: 'none'
          })
          return
          // #endif
          const res = await saveImageToPhotosAlbum(this.image)
          if (!res.success) {
            uni.showToast({
              title: '保存图片失败!!!',
              icon: 'none'
            })
            return
          }
          this.handleValue()
        }
      };
    }
  }
</script>

<style lang="scss" scoped>
	.scroll{
		width: 702rpx;
		max-height: 800rpx;
	}
	.image{
		width: 702rpx;
		display: block;
	}
</style>
