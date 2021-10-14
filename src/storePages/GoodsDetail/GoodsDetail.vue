<template>
  <view>
    <swiper class="screen-swiper main-image square-dot" easing-function="linear" :height="300" :indicator-dots="true"
      :circular="true" :autoplay="true" interval="5000" duration="500">
      <swiper-item v-for="(item, index) in swiperList" :key="item.url">
        <image :src="item.url" :lazy-load="true" mode="aspectFill" @click.stop="toPreviewImage(item.url)">
        </image>
      </swiper-item>
    </swiper>
    <!-- <image :src="getImagePath(goodsInfo.goods_img,true)" mode="aspectFill"></image> -->
    <view class="goods-info">{{ goodsInfo.goods_name||'' }}</view>
    <view class="desc">
      <view class="title">简介</view>
      <view class="">{{ goodsInfo.goods_desc||'' }}</view>
    </view>
    <view class="store-info" v-if="storeInfo&&storeInfo.store_no">
      <image :src="getImagePath(storeInfo.logo)" class="store-icon"></image>
      <view class="store-name">{{ storeInfo.name||''}}</view>
      <view class="phoneCall" v-if="phone" @click="phoneCall"><text class="cuIcon-phone text-cyan"></text></view>
    </view>
    <view class="detail">
      <view class="title">图文详情</view>
      <view class="image-box">
        <image :lazy-load="true" :src="item.url" mode="aspectFill" :style="{
            width: item.imgWidth + 'px',
            height: item.imgHeight + 'px',
          }" v-for="item in goodsDetailImage" @click="toPreviewImage(item.url)"></image>
      </view>
    </view>
    <view class="cu-bar foot bottom bg-white tabbar border shop">
      <view class="price text-red margin-left margin-right" v-if="showPrice">
        <text class="symbol">￥</text>
        <text class="number" v-if="fill2Digit(goodsInfo.price)">
          <text class="int">{{ fill2Digit(goodsInfo.price)[0] }}.</text>
          <text class="float">{{ fill2Digit(goodsInfo.price)[1] }}</text>
        </text>
      </view>
      <view class="right-btn" v-if="moreConfig&&moreConfig.button_list">
        <button class="cu-btn bg-cyan  shadow-blur" @click="payOrder(item)" v-for="item in moreConfig.button_list">
          <text>{{item.button_name}}</text>
        </button>
      </view>
      <view class="right-btn" v-else-if="!hideButton">
        <button class="cu-btn bg-cyan  shadow-blur" @click="payOrder">
          <text v-if="moreConfig&&moreConfig.button_name">{{moreConfig.button_name}}</text>
          <text v-else>立即购买</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex';
  export default {
    data() {
      return {
        storeInfo: {},
        goodsInfo: {},
        swiperList: [],
        goodsDetailImage: [],
        phone: "",
        wxMchId: "",
        storeNo: '',
        serviceName: "",
        destApp: "",
        hideButton: false
      };
    },
    computed: {
      showPrice() {
        return this.moreConfig?.show_price === false ? false : true
      },
      moreConfig() {
        if (this.goodsInfo?.more_config) {
          let result = ''
          try {
            result = JSON.parse(this.goodsInfo.more_config)
          } catch (e) {
            //TODO handle the exception
          }
          return result
        }
      },
      ...mapState({
        cartInfo: state => state.order.cartInfo
      })
    },
    methods: {
      async getStoreInfo() {
        let req = {
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }],
          page: {
            pageNo: 1,
            rownumber: 1
          },
        };
        let service = 'srvhealth_store_list_select'
        let app = 'health'
        let res = await this.$fetch('select', service, req, app)
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.storeInfo = res.data[0];
          this.$store.commit('SET_STORE_INFO', res.data[0])
          if (this.storeInfo.type === '健康服务') {}
        } else {
          uni.showModal({
            title: '未查找到机构信息',
            content: `${res ? JSON.stringify(res) : ''}  storeNo为${this.storeNo}`,
            showCancel: false
          })
        }

      },
      phoneCall() {
        uni.makePhoneCall({
          phoneNumber: this.phone || '10086' //仅为示例
        });
      },
      payOrder(e) {
        if (this.moreConfig?.target_url) {
          let storeInfo = this.$store?.state?.app?.storeInfo
          let bindUserInfo = this.$store?.state?.user?.storeUserInfo
          let data = {
            ...this.$data,
            cartInfo: this.cartInfo,
            storeInfo,
            bindUserInfo
          }
          data = this.deepClone(data)
          let url = this.renderStr(this.moreConfig.target_url, data)
          uni.navigateTo({
            url: url
          })
          return
        }else if(e?.target_url){
          let storeInfo = this.$store?.state?.app?.storeInfo
          let bindUserInfo = this.$store?.state?.user?.storeUserInfo
          let data = {
            ...this.$data,
            cartInfo: this.cartInfo,
            storeInfo,
            bindUserInfo
          }
          data = this.deepClone(data)
          let url = this.renderStr(e.target_url, data)
          uni.navigateTo({
            url: url
          })
          return
        }
        let goodsInfo = this.deepClone(this.goodsInfo)
        if (!goodsInfo.goods_image && goodsInfo.goods_img) {
          goodsInfo.goods_image = goodsInfo.goods_img;
        }
        goodsInfo.name = goodsInfo.goods_name
        goodsInfo.image = goodsInfo.store_image
        goodsInfo.car_num = 1
        goodsInfo.unit_price = goodsInfo.price
        goodsInfo.type = this.storeInfo?.type
        this.$store.commit('SET_STORE_CART', {
          storeInfo: goodsInfo,
          store_no: goodsInfo.store_no,
          list: [goodsInfo]
        });
        let url = `/storePages/payOrder/payOrder?store_no=${goodsInfo.store_no }&goods_info=${encodeURIComponent(
          JSON.stringify(goodsInfo))}`

        if (this.wxMchId) {
          url += `&wxMchId=${this.wxMchId}`
        }
        uni.navigateTo({
          url
        });
      },
      async getSwiperList(e) {
        if (e.goods_img) {
          let res = await this.getFilePath(e.goods_img);
          if (Array.isArray(res)) {
            this.swiperList = res.reduce((pre, cur) => {
              if (cur.fileurl) {
                cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
                  .getStorageSync('bx_auth_ticket');
              }
              pre.push(cur);
              return pre;
            }, []);
          }
        }
      },
      async getDetaiImageList(e) {
        if (e.goods_detail_image) {
          let res = await this.getFilePath(e.goods_detail_image);
          if (Array.isArray(res)) {
            this.goodsDetailImage = res.reduce((pre, cur) => {
              if (cur.fileurl) {
                let url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
                  .getStorageSync('bx_auth_ticket');
                cur.url = url;
                this.getImageInfo({
                  url: url
                }).then(picInfo => {
                  if (picInfo.w && picInfo.h) {
                    let res = this.setPicHeight(picInfo);
                    if (res.w && res.h) {
                      this.$set(cur, 'imgWidth', res.w);
                      this.$set(cur, 'imgHeight', res.h);
                    }
                  }
                });
              }
              pre.push(cur);
              return pre;
            }, []);
          }
        }
      },
      fill2Digit(val) {
        // 精确到小数点后两位
        if (Number(val).toString() !== 'NaN') {
          return [parseInt(val), val.toFixed(2).slice(-2)];
        } else {
          return false;
        }
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(750);
        content.h = (maxW * content.h) / content.w;
        content.w = maxW;
        return content;
      },
      getGoodsInfo(no) {
        let req = {
          condition: [{
            colName: 'goods_no',
            ruleType: 'eq',
            value: no
          }]
        };
        let service = this.serviceName || 'srvhealth_store_goods_guest_select'
        let app = this.destApp || 'health'
        this.$fetch('select', service, req, app).then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.goodsInfo = res.data[0];
            this.getSwiperList(this.goodsInfo);
            this.getDetaiImageList(this.goodsInfo);
          }
        });
      }
    },
    onLoad(option) {
      if (option.hideButton) {
        this.hideButton = true
      }
      if (option.wxMchId) {
        this.wxMchId = option.wxMchId
      }
      if (option.storeNo) {
        this.storeNo = option.storeNo
        this.getStoreInfo()
      }
      if (option.destApp) {
        this.destApp = option.destApp
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.phone) {
        this.phone = option.phone
      }

      if (option.goods_no) {
        this.getGoodsInfo(option.goods_no);
      }
    }
  };
</script>

<style scoped lang="scss">
  .goods-info {
    font-size: 18px;
    letter-spacing: 2px;
    padding: 20rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
  }

  .store-info {
    margin: 20rpx 0;
    background-color: #fff;
    border-top: 1rpx solid #f1f1f1;
    margin-bottom: 20rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;

    .store-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-left: 20rpx;
    }

    .store-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }

    .phoneCall {
      flex: 1;
      font-size: 30px;
      text-align: right;
    }
  }

  .desc {
    color: #aaa;
    padding: 20rpx;
    background-color: #fff;

    .title {
      padding: 10rpx 0;
      border-bottom: 1rpx solid #f1f1f1;
      margin-bottom: 10rpx;
    }
  }

  .detail {
    padding-bottom: 50px;
    background-color: #fff;

    .title {
      border-bottom: 1rpx solid #f1f1f1;
      padding: 20rpx;
    }

    .image-box {
      width: 100%;

      image {
        width: 100%;
      }
    }
  }

  .main-image {
    width: 100%;
    height: 400rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .right-btn {
    display: flex;
    justify-content: center;
    flex: 1;
    align-items: center;
    background-color: #1cbbb4;
    height: 100%;

    .cu-btn {
      border-radius: 0;
      text-align: center;
      flex: 1;
      border-left: 1rpx solid #f5f5f5;
      &:first-child {
        border-left: none;
      }
    }
  }

  .price {
    .symbol {
      font-size: 12px;
    }

    .number {
      font-size: 30px;
      margin: 0 5px;

      .float {
        font-size: 14px;
      }
    }
  }
</style>
