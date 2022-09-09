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
          <view class="text-lg padding-lr-xs right-icon">
            <text class="cuIcon-favorfill text-yellow" style="font-size: 20px;" @click="cancel()"
              v-if="canBeFaver&&isFavor"></text>
            <text class="cuIcon-favor" style="font-size: 20px;" @click="favor()" v-else-if="canBeFaver"></text>
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    throttle
  } from '@/common/func/util.js'
  export default {
    data() {
      return {
        StatusBar: this.StatusBar,
        CustomBar: this.CustomBar,
        pageRoute: "",
        pagePath: "",
        pageOptions: {},
        isFavor: null,
      };
    },
    name: 'cu-custom-navbar',
    mounted() {
      this.initPageInfo()
    },
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
      data: Object,
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
    watch: {
      pdNo(newValue, oldValue) {
        this.initPageInfo()
      }
    },
    methods: {
      initPageInfo() {
        this.pageRoute = this.setPageRoute()
        this.pageOptions = this.setPageOptions()
        this.pagePath = this.setPagePath()
        this.isFavor = this.setIsFavor() || false
        console.log('initPageInfo:', this.pageOptions, this.pagePath, this.isFavor)
      },
      setIsFavor() {
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
            let pagePath = this.pagePath;
            if (path && pagePath && path.indexOf(pagePath) > -1 && this.pageOptions && Object.keys(this.pageOptions)
              .length > 0) {
              var _options = {}
              let url = path
              if (url && url.indexOf("?") != -1) {
                const str = url.split('?')[1]
                const strs = str.split("&");
                if (Array.isArray(strs) && strs.length > 0) {
                  return strs.every((item => {
                    const key = item.split("=")[0]
                    const value = item.split("=")[1]
                    if (key === 'link_pd_no') {
                      return this.pdNo && this.pdNo === value ? item : false
                    }
                    return this.pageOptions[key] && this.pageOptions[key] === value ? item : false
                  }))
                }
              }
            }
          })
        }
      },
      setPageRoute() {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          return `/${curPage?.route}`
        }
      },
      setPageOptions() {
        const pages = getCurrentPages()
        let res = {

        }
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          res = {
            ...curPage.options
          }
          // curPage?.$page?.fullPath
          if (this.pdNo && !res.link_pd_no) {
            res['link_pd_no'] = this.pdNo
          }
          return res
        }
      },
      setPagePath() {
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const curPage = pages[pages.length - 1];
          let fullPath = `/${curPage.route}`
          // curPage?.$page?.fullPath
          const options = curPage.options
          if (typeof options === 'object' && Object.keys(options).length > 0) {
            Object.keys(options).forEach(key => {
              if (options[key] && fullPath.indexOf(key) == -1) {
                if (fullPath.indexOf('?') == -1) {
                  fullPath += `?${key}=${options[key]}`
                } else {
                  fullPath += `&${key}=${options[key]}`
                }
              }
            })
          }
          if (this.pdNo && fullPath.indexOf('link_pd_no') == -1) {
            fullPath += `&link_pd_no=${this.pdNo}`
          }
          return fullPath
        }
      },
      favor: throttle(function() {
        this.favorPage()
      }, 2000, true),
      cancel: throttle(function() {
        this.cancelFavor()
      }, 2000, true),
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
        this.initPageInfo()
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
          this.initPageInfo()
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
    flex: 1;
    text-align: right;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx;
    max-width: calc(100% - 100rpx);
    /* #ifdef H5 */
    max-width: calc(100% - 130rpx);
    /* #endif */
  }
  .right-icon:active {
    transform: translate(1px,2px);
  }
  .action,
  .nav-bar {
    background-color: var(--home-bg-color) !important;
    color: var(--home-text-color) !important;
    font-size: var(--home-text-size);
  }
</style>
