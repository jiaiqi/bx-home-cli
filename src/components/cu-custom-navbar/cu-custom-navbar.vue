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

        <view class="nav-bar" style="display: flex;">
          <slot></slot>
        </view>

        <slot name="right">
          <view class="text-lg padding-lr-xs right-icon" v-if="canBeFaver">
            <text class="cuIcon-favorfill text-yellow" style="font-size: 20px;" @click="cancelFavor()"
              v-if="isFavor"></text>
            <text class="cuIcon-favor" style="font-size: 20px;" @click="favorPage()" v-else></text>
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
      canBeFaver() {
        // 是否可以被收藏
        if (this.pageRoute && Array.isArray(this.collectPages)) {
          return this.collectPages.find(item => item.page_path === this
            .pageRoute)
        } else {
          return false
        }
      },

      pageRoute() {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          return `/${curPage?.route}`
        }
      },
      pagePath() {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          let fullPath = curPage?.$page?.fullPath
          if (this.pdNo) {
            fullPath += `&link_pd_no=${this.pdNo}`
          }
          // if (fullPath && fullPath.indexOf('storePages/home/home') !== -1 && fullPath.indexOf('store_no') == -1 &&
          //   fullPath.indexOf('?') == -1) {
          //   fullPath += `?store_no=${this.setStoreNo}`
          // }
          return fullPath
        }
      },
      isFavor() {
        // 当前页面是否被收藏
        if (Array.isArray(this.collectedPages) && this.collectedPages.length > 0) {
          return this.collectedPages.find(item => {
            let path = item.address
            if (item.address === '/storePages/home/home' && item.tenant_no) {
              path = `${item.address}?store_no=${item.tenant_no}`
            }
            if (this.pdNo && path && path.indexOf('link_pd_no') == -1) {
              path += `&link_pd_no=${this.pdNo}`
            }
            return path == this.pagePath
          })
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
      pdNo: String,
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
      async favorPage() {
        // 收藏当前页面
        let title = this.canBeFaver?.title_temp || this.pageTitle || ''
        if (title) {
          title = this.renderStr(title, {
            data: this.data || {},
            ...this.globalVariable
          })
        }
        const url = `/sso/operate/srvsso_user_collect_record_add`
        const req = [{
          "serviceName": "srvsso_user_collect_record_add",
          "condition": [],
          "data": [{
            "title": title,
            "address": this.pagePath
          }]
        }]
        const res = await this.$http.post(url, req)
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
        await this.setSessionInfo(this.setStoreNo)
      },
      async cancelFavor() {
        // 取消收藏
        if (this.isFavor?.id) {
          const url = `/sso/operate/srvsso_user_collect_record_delete`
          const req = [{
            "serviceName": "srvsso_user_collect_record_delete",
            "condition": [{
              "colName": "id",
              "ruleType": "eq",
              "value": this.isFavor?.id
            }]
          }]
          const res = await this.$http.post(url, req)
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
          await this.setSessionInfo(this.setStoreNo)
        }
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
    },
  }
</script>

<style>
  .cu-custom {
    width: 100vw;
    display: flex;
  }

  .right-icon {
    background-color: var(--home-bg-color) !important;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 20rpx;
    flex: 1;
    max-width: calc(100% - 100rpx);
    /* #ifdef H5 */
    max-width: calc(100% - 130rpx);
    /* #endif */
  }

  .action,
  .nav-bar {
    background-color: var(--home-bg-color) !important;
    color: var(--home-text-color) !important;
    font-size: var(--home-text-size);
  }
</style>
