<template>
  <view class="swiper-list" :class="{'left-bottom-dot':dotPostion==='left-bottom'}" id="home-swiper-list"
    :data-order-no="pageItem['order_no']" v-if="pageItem">
    <view class="home-btn" @click="setHomePage" v-if="pageItem.show_set_home!=='否'">
      <button class=" cu-btn shadow-blur" v-if="userInfo && userInfo.home_store_no !== storeInfo.store_no">
        <text class="cuIcon-home"></text></button>
    </view>
    <swiper class="card-swiper square-dot" :indicator-dots="false" :style="calcStyle" :circular="true" :autoplay="true"
      interval="5000" duration="500" @change="swiperChange" indicator-color="#8799a3" indicator-active-color="#0081ff"
      v-if="swiperList.length>1&&swiperStyle==='卡片'">
      <swiper-item v-for="(item,index) in swiperList" :key="index" :class="current==index?'cur':''">
        <view class="swiper-item">
          <view class="swiper-item-box" v-if="item.file_type ==='视频'&&current===index">
            <video :src="item.url" controls :id="item.store_video_file" :poster="item.videoPoster"></video>
          </view>
          <image lazy-load :src="item.url" mode="scaleToFill" v-else-if="!item.store_video_file||item.file_type!=='视频'"
            @click.stop="toDetail(item)">
        </view>
      </swiper-item>
    </swiper>
    <swiper class="screen-swiper item-box rectangle-dot" :style="calcStyle" easing-function="linear"
      indicator-active-color="#00aaff" :indicator-dots="true" :circular="true" :autoplay="autoplay" :interval="interval"
      duration="500" @change="swiperChange" v-else-if="swiperList.length>1">
      <swiper-item v-for="(item, index) in swiperList" :key="item.url" :data-id="item.id"
        :class="current==index?'cur':''">
        <view class="swiper-item-box" v-if="item.file_type ==='视频'&&current===index">
          <video :src="item.url" controls :id="item.store_video_file" :poster="item.videoPoster"></video>
        </view>
        <image lazy-load :src="item.url" mode="scaleToFill" v-else-if="!item.store_video_file||item.file_type!=='视频'"
          @click.stop="toDetail(item)">
        </image>
      </swiper-item>
    </swiper>
    <view class="single-media" v-else>
      <view class="swiper-item-box" :style="calcStyle" v-for="(item, index) in swiperList" :key="item.url"
        :data-id="item.id">
        <video :src="item.url" controls v-if="item.file_type ==='视频'&&current===index" :id="item.store_video_file"
          :poster="item.videoPoster"></video>
        <image lazy-load :src="item.url" mode="scaleToFill" v-else-if="!item.store_video_file||item.file_type!=='视频'"
          @click.stop="toDetail(item)">
        </image>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'home-swiper-list',
    computed: {
      swiperStyle() {
        return this.pageItem?.swiper_style || '平铺'
      },
      interval() {
        return this.pageItem?.more_config?.interval || '5000'
      },
      autoplay() {
        return this.pageItem?.more_config?.autoplay ?? true
      },
      dotPostion() {
        return this.pageItem?.more_config?.dotPosition || 'bottom-center'
      },
      height() {
        if (this.pageItem?.img_ratio) {
          return `${uni.upx2px(710 * this.pageItem?.img_ratio)}px`
        }
        return `${this.pageItem?.more_config?.swiperHeight || uni.upx2px(300)}px`
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
        return `height:${obj.height}!important;min-height:${obj.minHeight}`
      },
    },
    props: {
      pageItem: {
        type: Object
      },
      beforeClick: {
        type: Function,
        default: null
      }
    },
    data() {
      return {
        storeNo: "",
        current: 0,
        swiperList: [],
        videoContext: {},
        isFirstSwiperList: false
      }
    },
    mounted() {
      // this.getSwiperList()
    },
    watch: {
      'storeInfo.store_no': {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          this.storeNo = newValue
          if (newValue) {
            this.getSwiperList()
          }

          // if (newValue?.type === '用户展示' && this.avatarList.length == 0) {
          //   setTimeout(() => {
          //     this.getUserList();
          //   }, 1000)
          // }
        }
      }
    },
    methods: {
      swiperChange(e) {
        if (this.videoContext.parse) {
          this.videoContext.parse()
        }
        this.current = e.detail.current
        if (this.swiperList[this.current].file_type === '视频') {
          this.videoContext = uni.createVideoContext(this.swiperList[this.current].store_video_file, this)
        }
      },
      toDetail(item) {

        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }

        if (item.mini_program_url) {
          let url = item.mini_program_url
          let data = {
            userInfo: this.userInfo,
            storeInfo: this.storeInfo,
            bindUserInfo: this.vstoreUser
          }
          url = this.renderStr(url, data)
          uni.navigateTo({
            url: url
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
      stopVideo() {
        this.swiperList.forEach((item, index) => {
          item.videoContext.stop()
        })
      },
      pauseVideo() {
        this.swiperList.forEach((item, index) => {
          item.videoContext.pause()
        })
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
        if (this.pageItem.image_origin === '子表' && this.pageItem.component_no) {
          let serviceName = 'srvhealth_store_banner_video_select'
          let condition = [{
            colName: "store_video_component",
            ruleType: "eq",
            value: this.pageItem.component_no
          }]
          let req = {
            "serviceName": "srvhealth_store_banner_video_select",
            "colNames": ["*"],
            "condition": condition,
            "page": {
              "pageNo": 1,
              "rownumber": 10
            },
            "order": [{
              "colName": "seq",
              "orderType": "asc" // asc升序  desc降序
            }]
          }
          let url = this.getServiceUrl('health', serviceName, 'select')
          let res = await this.$http.post(url, req)
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let list = res.data.data.filter(item => item.store_video_file).map(item => {
              item.url = this.getImagePath(item.store_video_file, true)
              if (item.file_type === '视频') {
                // item.videoContext = uni.createVideoContext(item.store_video_file,this)
              }
              if (item.video_poster) {
                item.videoPoster = this.getImagePath(item.video_poster, true)
              }
              return item
            });
            this.swiperList = list
          }
        } else if (image) {
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
  .card-swiper uni-swiper-item {
    padding: 10px 0;
  }

  .swiper-list {
    // border-radius: 20rpx;
    overflow: hidden;
    position: relative;
    min-width: 335px;

    .swiper-item-box {

      video,
      image {
        width: 100%;
        height: 100%;
      }
    }

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
