<template>
  <view>
    <view class="cu-custom" :style="[{ height: CustomBar + 'px' }]">
      <view
        class="cu-bar fixed"
        :style="style"
        :class="[bgImage != '' ? 'none-bg text-white bg-img' : '', bgColor]"
      >
        <view class="action" @tap="BackPage" v-if="isBack">
          <text class="cuIcon-home" v-if="isFirstPage"></text>
          <text class="cuIcon-back" v-else></text>
          <slot name="backText"></slot>
        </view>

        <slot></slot>

        <!-- <view
          class="content"
          :style="[{ top: StatusBar + 'px' }]"
          @tap="clickContent"
        >
          <slot name="content"></slot>
        </view> -->
        <!-- <slot name="right"></slot> -->
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      StatusBar: this.StatusBar,
      CustomBar: this.CustomBar
    };
  },
  name: 'cu-custom-navbar',
  computed: {
    isFirstPage () {
      const pages = getCurrentPages()
      return pages && pages.length === 1
    },
    style () {
      var StatusBar = this.StatusBar;
      var CustomBar = this.CustomBar;
      var bgImage = this.bgImage;
      var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
      if (this.bgImage) {
        style = `${style}background-image:url(${bgImage});`;
      }
      if (this.bgColor.indexOf('#') !== -1) {
        style += `background-color:${this.bgColor}`
      }
      if (!this.bgColor) {
        style += `background-color:#0bc99d;color:#fff;`
      }

      return style
    }
  },
  props: {

    bgColor: {
      type: String,
      default: ''
    },
    isBack: {
      type: [ Boolean, String ],
      default: false
    },
    bgImage: {
      type: String,
      default: ''
    },
  },
  methods: {
    clickContent () {
      this.$emit('clickContent')
    },
    BackPage () {
      this.$emit('onBack')
      if (this.isFirstPage) {
        uni.reLaunch({ url: '/pages/index/index' })
        // uni.navigateTo({ url: '/pages/index/index' })
      } else {
        uni.navigateBack({
          delta: 1,
        });
      }

    }
  }
}
</script>

<style>
</style>
