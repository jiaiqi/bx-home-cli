<template>
  <view>
    <view class="cu-custom" :style="[{ height: CustomBar + 'px' }]">
      <view class="cu-bar fixed" :style="style" :class="[bgImage != '' ? 'none-bg text-white bg-img' : '', bgColor]">
        <view class="action" @tap="BackPage" v-if="isBack">
          <text class="cuIcon-home" v-if="isFirstPage"></text>
          <text class="cuIcon-back" v-else></text>
          <slot name="backText"></slot>
        </view>
        <view class="content" :style="[{ top: StatusBar + 'px' }]" @tap="clickContent">
          <slot name="content"></slot>
        </view>
        <view class="right">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        StatusBar: this.StatusBar,
        CustomBar: this.CustomBar,
        isFirstPage: false
      };
    },
    name: 'cu-custom',
    computed: {
      style() {
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
        type: [Boolean, String],
        default: false
      },
      bgImage: {
        type: String,
        default: ''
      },
    },
    mounted() {
      let pages = getCurrentPages()
      if (pages.length === 1) {
        this.isFirstPage = true
      }
    },
    methods: {
      clickContent() {
        this.$emit('clickContent')
      },
      BackPage() {
        this.$emit('onBack')
        uni.navigateBack({
          delta: 1,
        });
        if(this.isFirstPage){
          this.$emit('onBackHome')
        }
      }
    }
  }
</script>

<style>
</style>
