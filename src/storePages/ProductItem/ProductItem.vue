<template>
  <view>
    <view class="banner-box">
      <swiper class="screen-swiper item-box rectangle-dot" easing-function="linear" indicator-active-color="#00aaff"
        :indicator-dots="true" :circular="true" :autoplay="true" interval="5000" duration="500" :height="height">
        <swiper-item v-for="(item, index) in swiperList" :key="item.url" @click.stop="toDetail(item)">
          <image :src="item.url" mode="scaleToFill"></image>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
  export default {
    computed: {
      height() {
        return this.config?.banner?.height || '275px'
      }
    },
    data() {
      return {
        swiperList: [],
        productDetail: {},
        title: "",
        serviceName: "",
        appName: "",
        config: {
          banner: {
            col: "",
            height: ""
          },
          name: "name",
          price: "price",
          detailTitle: "餐品详情",
          detail: [{
              "col": "goods_desc",
              "label": "商品描述",
            },
            // {
            //   "col":"goods_desc",
            //   "label":"原料",
            // },
            // {
            //   "col":"goods_desc",
            //   "label":"备注说明",
            // }
          ]
        }
      };
    },
    onLoad(option) {
      if(option.serviceName){
        this.serviceName = option.serviceName
      }
    },
    methods: {
      getDetail(){
        
      },
      async getSwiperList() {
        let imgCol = this.config.banner.col && this.productDetail ? this.productDetail[this.config.banner.col] : ''
        if (imgCol) {
          let res = await this.getFilePath(imgCol);
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

<style lang="scss">

</style>
