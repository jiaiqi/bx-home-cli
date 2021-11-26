<template>
  <view class="swiper-list" :class="{'left-bottom-dot':dotPostion==='left-bottom'}">
    <view class="home-btn" @click="setHomePage" v-if="pageItem.show_set_home!=='否'">
      <button class=" cu-btn shadow-blur" v-if="userInfo && userInfo.home_store_no !== storeInfo.store_no">
        <text class="cuIcon-home"></text></button>
    </view>
    <swiper class="screen-swiper item-box rectangle-dot" :style="[calcStyle]" easing-function="linear"
      indicator-active-color="#00aaff" :indicator-dots="true" :circular="true" :autoplay="true" interval="5000"
      duration="500" :height="height">
      <swiper-item v-for="(item, index) in swiperList" :key="item.url" @click.stop="toDetail(item)">
        <image :src="item.url" mode="scaleToFill"></image>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
  export default {
    computed: {
      dotPostion() {
        return this.pageItem?.more_config?.dotPosition || 'bottom-center'
      },
      height() {
        return this.pageItem?.more_config?.swiperHeight || uni.upx2px(300)
      },
      calcStyle() {
        let obj = {}
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          obj.margin = this.pageItem.margin
        }
        if (this.height) {
          obj.height = this.height
          obj.minHeight = this.height
        }
        return obj
      },
    },
    props: {
      pageItem: {
        type: Object
      },
      // storeInfo: {
      //   type: Object
      // },
      // userInfo: {
      //   type: Object
      // }
    },
    data() {
      return {
        swiperList: []
      }
    },
    mounted() {
      this.getSwiperList()
    },
    methods: {
      toDetail(item) {
        if (item.mini_program_url) {
          uni.navigateTo({
            url: item.mini_program_url
          })
        } else if (item.content_no) {
          uni.navigateTo({
            url: `/publicPages/article/article?destApp=health&serviceName=srvdaq_cms_content_select&content_no=${e.content_no}`
          });
        } else {
          this.toPreviewImage(item.url)
        }
      },
      setHomePage() {
        this.$emit('setHomePage')
      },
      getListFromDaq(item_no) {
        let req = {
          "serviceName": "srvdaq_page_item_carousel_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "item_no",
            "ruleType": "eq",
            "value": item_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          }
        }
        let url = this.getServiceUrl('daq', 'srvdaq_page_item_carousel_select', 'select');
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let data = res.data.data.map(item => {
              item.url = this.getImagePath(item.carousel_image, true)
              return item
            })
            this.swiperList = data
          }
        })
      },
      async getSwiperList() {
        let image = this.pageItem && this.pageItem.image_origin === '店铺信息' ? this.storeInfo.image : this
          .pageItem.swiper_image
        if (this.pageItem?.more_config?.swiperOrigin === 'daq' && this.pageItem?.more_config?.item_no) {
          this.getListFromDaq(this.pageItem.more_config.item_no)
          return
        }
        if (image) {
          let res = await this.getFilePath(image);
          if (Array.isArray(res)) {
            let swiperList = res.reduce((pre, cur) => {
              if (cur.fileurl) {
                cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
                  .getStorageSync('bx_auth_ticket');
              }
              pre.push(cur);
              return pre;
            }, []);
            this.swiperList = swiperList
            return swiperList
          } else {
            return []
          }
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .swiper-list {
    border-radius: 20rpx;
    overflow: hidden;
    position: relative;
    min-width: 335px;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }

    .home-btn {
      position: absolute;
      right: 20rpx;
      top: 20rpx;
      z-index: 10;

      .cu-btn {
        width: 80rpx;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background-color: rgba($color: #000000, $alpha: 0.1);
        // border: 1rpx solid #c2c2c2;
        color: #fff;
        border-radius: 50%;
        font-size: 40rpx;
        margin: 0;
        padding: 0;
      }

      .cuIcon-home {}
    }
  }

  .left-bottom-dot {

    // uni-swiper[class*="-dot"] .wx-swiper-dots,
    // uni-swiper[class*="-dot"] .a-swiper-dots,
    // uni-swiper[class*="-dot"] .uni-swiper-dots {
    //   justify-content: flex-start !important;
    // }
  }
</style>
