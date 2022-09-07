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
            <text class="cuIcon-favor" style="font-size: 20px;" @click="favorPage()"></text>
            <text class="cuIcon-favorfill text-yellow" style="font-size: 20px;" @click="cancelFavor()"></text>
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
      pagePath() {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          return `/${curPage?.route}`
        }
      },
      isFavor() {
        // 当前页面是否被收藏
        let res = false;
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          const fullPath = curPage?.$page?.fullPath
          return fullPath
        }
      },
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
      pageTitle: String,
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
      favorPage() {
        // 收藏当前页面
        const url = `/sso/operate/srvsso_user_collect_record_add`
        const req = [{
          "serviceName": "srvsso_user_collect_record_add",
          "condition": [],
          "data": [{
            "title": this.pageTitle || '',
            "address": this.pagePath
          }]
        }]
        this.$http.post(url, req).then(res => {
          console.log(res);
          if (res?.data?.state === 'SUCCESS') {
            uni.showToast({
              title: '收藏成功',
              icon: 'none'
            })
          } else if (res?.data?.resultMessage) {
            uni.showToast({
              title: res?.data?.resultMessage,
              icon: 'none'
            })
          }
        })

      },
      cancelFavor() {
        // 取消收藏
        const url = `/sso/operate/srvsso_user_collect_record_delete`
        const req = [{
          "serviceName": "srvsso_user_collect_record_delete",
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": "8"
          }]
        }]
        this.$http.post(url, req).then(res => {
          console.log(res);
          if (res?.data?.state === 'SUCCESS') {
            uni.showToast({
              title: '取消收藏成功',
              icon: 'none'
            })
          } else if (res?.data?.resultMessage) {
            uni.showToast({
              title: res?.data?.resultMessage,
              icon: 'none'
            })
          }
        })

      },
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
