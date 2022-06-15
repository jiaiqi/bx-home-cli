<template>
  <view class="cu-modal" :class="{show:hasShow===false}" @touchmove.prevent.stop="">
    <view class="cu-dialog">
      <view class="poster-image">
        <u-loading v-if="loadStatus==='loading'"></u-loading>
        <view class="uni-margin-wrap">
          <swiper class="swiper" circular :indicator-dots="true" :autoplay="false" :interval="5000" :duration="1000">
            <swiper-item class="swiper-item" v-for="item in posterList">
              <view class="swiper-item" :style="[{backgroundImage:'url('+getImagePath(item.pop_ups_image)+')'}]"
                @click="toPages(item)">
                <!-- <image :src="getImagePath(item.pop_ups_image)" mode="aspectFit"></image> -->
              </view>
            </swiper-item>
          </swiper>
        </view>
        <view class="close-btn" @click="close()">
          <text class="cuIcon-close"></text>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    props: {
      pageItem: {
        type: Object
      },
    },
    data() {
      return {
        hasShow: false,
        loadStatus: '',
        posterList: []
      }
    },
    created() {
      this.getPostList()
    },
    methods: {
      toPages(e) {
        let type = e?.pop_ups_type;
        let url = ''
        switch (type) {
          case '活动':
           if(e?.activity_no){
             url = `/storePages/msList/msList?activeNo=${e?.activity_no}`
           }
            break;
          case '商品':
            if (e?.goods_no) {
              url = `/storePages/GoodsDetail/GoodsDetail?goods_no=${e.goods_no}&storeNo=${this.storeInfo?.store_no}`
            }
            break;
        }
        uni.navigateTo({
          url
        })
      },
      async getPostList() {
        const url = `/health/select/srvhealth_pop_ups_content_select`
        const req = {
          "serviceName": "srvhealth_pop_ups_content_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "components_no",
            "ruleType": "eq",
            "value": this.pageItem?.component_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          },
        }
        this.loadStatus = 'loading'
        const res = await this.$http.post(url, req)
        this.loadStatus = 'loaded'
        if (res?.data?.state === 'SUCCESS') {
          this.posterList = res.data.data.filter(item => item.pop_ups_image)
        }
      },
      close() {
        this.hasShow = true
      }
    },
  }
</script>

<style scoped lang="scss">
  .cu-modal {
    z-index: 10000;
  }

  .cu-dialog {
    width: 500rpx !important;
    background-color: transparent;
  }

  .poster-image {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;

    .close-btn {
      font-size: 30px;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      color: #fff;
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;
    }

    .uni-margin-wrap {
      width: 500rpx;
      height: 800rpx;

      .swiper-item,
      .swiper {
        width: 500rpx;
        height: 800rpx;
        background-size: contain;
        background-repeat: no-repeat;

        .image {
          width: 500rpx;
          height: 800rpx;
        }
      }
    }
  }
</style>
