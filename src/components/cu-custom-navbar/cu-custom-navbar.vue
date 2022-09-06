<template>
  <view>
    <view class="cu-custom" :style="[{ height: CustomBar + 'px' }]">
      <view class="cu-bar fixed" :style="style" :class="className">
        <!-- <view class="cu-bar fixed" :style="style" :class="[bgImage != '' ? 'none-bg text-white bg-img' : '', bgColor]"> -->
        <view class="action" @tap="BackPage" v-if="isBack">
          <text class="cuIcon-home" v-if="isFirstPage||backHome"></text>
          <text class="cuIcon-back" v-else></text>
          <slot name="backText"></slot>
        </view>

        <slot></slot>
        
        <slot name="right">
          <view class="text-lg padding-lr">
            <text class="cuIcon-favor" style="font-size: 20px;"></text>
            <!-- <text class="cuIcon-favorfill bg-yellow" style="font-size: 20px;"></text> -->
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        StatusBar: this.StatusBar,
        CustomBar: this.CustomBar
      };
    },
    name: 'cu-custom-navbar',
    computed: {
      isFirstPage() {
        const pages = getCurrentPages()
        return pages && pages.length === 1
      },
      className() {
        if (this.theme) {
          return `bx-bg-color`
        }
      },
      style() {
        var StatusBar = this.StatusBar;
        var CustomBar = this.CustomBar;
        var bgImage = this.bgImage;
        var style = `height:${CustomBar}px;padding-top:${StatusBar}px;font-size:16px;`;
        // if (this.bgImage) {
        //   style = `${style}background-image:url(${bgImage});`;
        // }
        if (this.bgColor.indexOf('#') !== -1) {
          style += `background-color:${this.bgColor}`
        }
        if (!this.bgColor) {
          style += `background-color:#F8F8FA;color:#333;`
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
      // bgImage: {
      //   type: String,
      //   default: ''
      // },
      backHome: {
        type: Boolean,
        default: false
      },
      theme: {
        type: String,
        default: ''
      },
      customStoreNo: {
        type: String,
        default: ''
      }
    },
    methods: {
      clickContent() {
        this.$emit('clickContent')
      },
      BackPage() {
        this.$emit('onBack')
        if (this.isFirstPage || this.backHome) {
          let store_no = this.customStoreNo || 'S0000000000'

          if (this.$api?.singleStore && this.$api?.storeNo) {
            store_no = this.$api?.storeNo
          }

          uni.reLaunch({
            // url: '/pages/index/index',
            url: `/storePages/home/home?store_no=${store_no}`
          })
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
  .cu-custom {
    width: 100vw;

  }

  .action,
  .nav-bar {
    background-color: var(--home-bg-color) !important;
    color: var(--home-text-color) !important;
    font-size: var(--home-text-size);
  }
</style>
