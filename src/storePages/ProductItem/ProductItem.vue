<template>
  <view :class="'theme-'+vtheme">
    <swiper class="banner-box screen-swiper item-box rectangle-dot" easing-function="linear"
      indicator-active-color="#00aaff" :style="bannerStyle" :indicator-dots="true" :circular="true" :autoplay="true"
      interval="5000" duration="500">
      <swiper-item v-for="(item, index) in swiperList" :key="item.url" @click.stop="toDetail(item)">
        <image :src="item.url" mode="scaleToFill"></image>
      </swiper-item>
    </swiper>
    <view class="goods-main-box" v-if="config">
      <view class="number-box bx-btn-bg-color" v-if="amount!==0">
        <view class="operator-box bx-text-color" :class="{disabled:amount===0}" @click="changeAmount(-1)">
          <text class="cuIcon-move"></text>
        </view>
        <view class="value-box" v-if="amount!==0">
          {{amount||0}}
        </view>
        <view class="operator-box bx-text-color" @click="changeAmount(1)">
          <text class="cuIcon-add"></text>
        </view>
      </view>
      <view class="number-box bx-btn-bg-color single-btn" @click="changeAmount(1)" v-else>
        加入购物车
      </view>
      <view class="goods-name-box">
        <view class="goods-name">
          {{productDetail[config.name]}}
        </view>
        <view class="goods-price-box">
          <view class="goods-price bx-text-color">
            ￥{{productDetail[config.price]}}
          </view>
          <view class="price-right" v-if="productDetail&&config.priceRight&&productDetail[config.priceRight.col]">
            <text class="label"></text>
            <text class="margin-right-xs" :class="config.priceRight.leftIcon"></text>
            <text>{{productDetail[config.priceRight.col]||''}}</text>
            <text v-if="config.priceRight.suffix">{{config.priceRight.suffix||''}}</text>
          </view>
        </view>
      </view>
      <view class="goods-desc">
        <view class="desc-title" v-if="config.descTitle">
          {{config.descTitle||''}}
        </view>
        <view class="goods-desc-col" v-for="(item,index) in config.descCol" :key="item.col">
          <view class="label">
            {{item.label||''}}:
          </view>
          <view class="desc" v-html="productDetail[item.col]">
          </view>
        </view>
      </view>
    </view>
    <view class="goods-cart">
      <view class="goods-list" v-show="showCartList&&cartData.length>0" :class="['theme-'+vtheme]">
        <view class="title">
          <view class="left">
            已选商品
          </view>
          <view class="right" @click.stop="clearCart(true)">
            <button class="cu-btn sm bg-white">清空</button>
          </view>
        </view>
        <view class="goods-item" v-for="(rowData,index) in cartData" :key="index">
          <view class="main-image">
            <image class="image" :src="getImagePath(rowData[config.icon])" mode="scaleToFill"></image>
          </view>
          <view class="col-list">
            <view class="col-item">
              <view class=" text-bold">
                {{rowData[config.name]||''}}
              </view>
              <view class=" bx-text-color">
                ￥{{rowData[config.price]||''}}
              </view>
            </view>
            <view class="col-item text-right flex-1 handler-btn">
              <text class="hand-btn cu-btn line-orange border sm radius bx-btn-bg-color"
                @click="changeCartAmount(rowData,index,-1)">-</text>
              <view class="amount">
                {{rowData.goods_count||'0'}}
              </view>
              <text class="hand-btn cu-btn bg-orange sm radius bx-bg-color"
                @click="changeCartAmount(rowData,index,1)">+</text>
            </view>
          </view>
        </view>
      </view>
      <view class="cart-bottom" @click="changeCartStatus" :class="['theme-'+vtheme]">
        <view class="cart-bottom-left">
          <view class="cart-icon" :class="{'active bx-btn-bg-color':cartActive}">
            <text class="badge" v-if="sumAmount">{{sumAmount}}</text>
            <text class="cuIcon-cart"></text>
          </view>
          <view class="price">
            ￥{{sumPrice||'0'}}
          </view>
        </view>
        <view class="handler">
          <button class="cu-btn round" :class="{'active bx-btn-bg-color':cartActive}" @click.stop="toPlaceOrder"
            :disabled="!cartActive">下单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    computed: {
      sumAmount() {
        return this.cartData.reduce((res, cur) => {
          if (cur.goods_count && !isNaN(Number(cur.goods_count))) {
            res += cur.goods_count
          }
          return res
        }, 0)
      },
      sumPrice() {
        let priceCol = this.config?.price || 'price'
        return this.cartData.reduce((res, cur) => {
          if (cur.goods_count && !isNaN(Number(cur.goods_count))) {
            res += cur.goods_count * cur[priceCol]
          }
          return res
        }, 0)
      },
      bannerStyle() {
        let height = this.config?.banner?.height || '275px'
        return `height:${height}`
      },
      cartActive() {
        return this.cartData && this.cartData.length > 0
      },
    },
    created() {
      if (this.storeInfo?.store_no) {
        if (this.vcart[this.storeInfo?.store_no] && this.vcart[this.storeInfo?.store_no].cart) {
          this.cartData = this.vcart[this.storeInfo?.store_no].cart
        }
      }
    },
    data() {
      return {
        showCartList: false,
        wxMchId: "",
        cartData: [],
        amount: 0,
        swiperList: [],
        productDetail: {},
        serviceName: "srvrestaurant_goods_info_select",
        condition: [],
        appName: "restaurant",
        config: {
          title: "餐品详情",
          serviceName: "srvrestaurant_goods_info_select",
          appName: "restaurant",
          icon: 'goods_img',
          banner: {
            col: "goods_img",
            height: "250px"
          },
          name: "name",
          price: "price",
          priceRight: {
            col: 'making_length',
            leftIcon: 'cuIcon-timefill',
            suffix: "分钟",
            label: ""
          },
          descTitle: "餐品详情",
          descCol: [{
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
          ],
          detailCol: 'goods_detail_image'
        }
      };
    },
    onLoad(option) {
      if (option.condObj) {
        let condObj = option.condObj;
        // #ifdef H5
        condObj = decodeURIComponent(condObj)
        // #endif
        if (typeof condObj === 'string') {
          try {
            condObj = JSON.parse(condObj)
            if (Object.keys(condObj).length > 0) {
              let cond = []
              Object.keys(condObj).forEach(key => {
                cond.push({
                  colName: key,
                  ruleType: 'eq',
                  value: condObj[key]
                })
              })
              this.condition = cond
            }
          } catch (e) {
            //TODO handle the exception
            console.log(e)
          }
        }
      }
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName
        this.getDetail()
      }
    },
    methods: {
      saveCart() {
        let goodsList = this.deepClone(this.cartData)
        if (goodsList.length > 0) {
          goodsList = goodsList.map(goodsInfo => {
            if (!goodsInfo.goods_image && goodsInfo.goods_img) {
              goodsInfo.goods_image = goodsInfo.goods_img;
            }
            goodsInfo.name = goodsInfo[this.config.name]
            goodsInfo.image = goodsInfo[this.config.icon]
            goodsInfo.car_num = goodsInfo.goods_count
            goodsInfo.unit_price = goodsInfo[this.config.price]
            return goodsInfo
          }).filter(item => item.car_num > 0)
          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: goodsList
          });
        }
      },
      toPlaceOrder() {
        let url = `/storePages/payOrder/payOrder?type=restaurant&store_no=${this.storeInfo?.store_no }`
        if (this.storeInfo?.moreConfig?.userNewOrderPages === true) {
          url = url.replace('/payOrder/payOrder', '/placeOrder/placeOrder')
        }
        if (this.wxMchId) {
          url += `&wxMchId=${this.wxMchId}`
        }
        uni.navigateTo({
          url
        });
      },
      changeCartStatus() {
        if (this.cartData.length > 0) {
          this.showCartList = !this.showCartList
        }
      },
      add2Cart() {
        let data = this.deepClone(this.productDetail)
        let index = this.cartData.findIndex(item => item.id === data.id)
        data.goods_count = this.amount
        if (index !== -1) {
          this.$set(this.cartData, index, data)
        } else {
          this.cartData.push(data)
        }
        this.saveCart()
      },
      async clearCart(confirm) {
        let isConfirm = true
        let color = this.getBtnBg()
        if (confirm === true) {
          isConfirm = await new Promise((resove) => {
            uni.showModal({
              title: '提示',
              content: '确认清空购物车?',
              confirmColor: color,
              success: (res) => {
                resove(res.confirm)
              }
            })
          })
        }
        if (isConfirm) {
          this.showCartList = false
          this.amount = 0
          this.cartData = []
          this.saveCart()
        }
      },
      changeAmount(val) {
        val = this.amount + val
        if (val < 0) {
          val = 0
        }
        this.amount = val
        if (val > 0) {
          this.add2Cart()
        } else {
          this.cartData = this.cartData.map(item => {
            if (item.id == this.productDetail.id) {
              item.goods_count = 0;
            }
            return item
          }).filter(item => item.goods_count !== 0)
          this.saveCart()
        }
      },
      changeCartAmount(row, index, num) {
        if (row && row.id && typeof index === 'number') {
          row.goods_count = row.goods_count + num
          if (this.cartData[index]) {
            if (row.id === this.productDetail.id) {
              this.amount = row.goods_count
            }
            if (this.amount === 0) {
              // this.showCartList = false
              // this.cartData = []
              this.cartData = this.cartData.map(item => {
                if (item.id == this.productDetail.id) {
                  item.goods_count = 0;
                }
                return item
              }).filter(item => item.goods_count !== 0)
              this.saveCart()
            } else {
              this.$set(this.cartData, index, row)
            }
            this.saveCart()
          }
        }
      },
      getDetail() {
        let app = this.appName || uni.getStorageSync('activeApp')
        let serviceName = this.serviceName
        let url = this.getServiceUrl(app, serviceName, 'select')
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": this.condition || [],
          "page": {
            "rownumber": 1,
            "pageNo": 1
          },
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.productDetail = res.data.data[0]
            if (this.cartData && this.cartData.find(item => item.id === this.productDetail.id)) {
              this.amount = this.cartData.find(item => item.id === this.productDetail.id).car_num
            }
            let bannerCol = this.config?.banner?.col
            if (bannerCol && this.productDetail[bannerCol]) {
              this.getSwiperList(this.productDetail[bannerCol])
            }
          }
        })
      },
      async getSwiperList(imgCol) {
        imgCol = imgCol || this.config.banner.col && this.productDetail ? this.productDetail[this.config.banner
          .col] : ''
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

<style lang="scss" scoped>
  .goods-cart {
    z-index: 30;
    position: fixed;
    bottom: 50px;
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;

    .goods-list {
      background-color: #fff;
      padding: 10px 20px;
      border: 1px solid #f1f1f1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      border-radius: 20px;
      margin-bottom: 2px;

      .title {
        display: flex;
        justify-content: space-between;
        padding-bottom: 10px;

        .left {
          font-weight: bold;
        }

        .right {
          color: #ccc;
        }
      }

      .goods-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .main-image {
          .image {
            width: 50px;
            height: 50px;
            border-radius: 10px;
          }
        }

        .col-list {
          flex: 1;
          display: flex;
          padding: 0 20px;
          justify-content: space-between;
          align-items: center;
        }

        .handler-btn {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .col-item {
          .amount {
            width: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }

    .cart-bottom {
      background-color: #fff;
      border-radius: 20px;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

      &-left {
        display: flex;

        .price {
          flex: 1;
          padding: 20rpx 40rpx;
          font-size: 28rpx;
          font-family: SF Pro Text;
          font-weight: bold;
          color: #474849;
          display: flex;
          align-items: center;

          .decimal {
            font-size: 20rpx;
          }
        }

        .cart-icon {
          font-size: 50rpx;
          color: #474D59;
          background: rgba($color: #474D59, $alpha: 0.1);
          width: 100rpx;
          height: 100rpx;
          line-height: 100rpx;
          text-align: center;
          border-radius: 50%;
          position: relative;

          &.active {
            background-color: rgba($color: #F3A250, $alpha: 0.1);
            color: #F3A250;
          }

          .badge {
            position: absolute;
            right: -20rpx;
            top: -10rpx;
            min-width: 40rpx;
            height: 40rpx;
            line-height: 40rpx;
            border-radius: 50%;
            font-size: 24rpx;
            background-color: #E95955;
            color: #fff;
          }
        }
      }

      .handler {
        .cu-btn {
          background: #B8BAC0;
          color: #fff;
          width: 200rpx;
          height: 80rpx;
          font-size: 16px;
          font-family: 苹方-简;

          &.active {
            background-color: #F3A250;
            color: #fff;
          }

        }
      }

    }
  }

  .goods-main-box {
    background-color: #FAFAFA;
    border-radius: 50rpx 50rpx 0 0;
    min-height: calc(100vh - 200px);
    z-index: 10;
    position: relative;
    top: -90rpx;
    padding: 20px 16px;

    .number-box {
      position: absolute;
      top: -20px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
      // width: 110px;
      height: 40px;
      background: #FE5A3F;
      box-shadow: 0px 3px 6px rgba(254, 90, 63, 0.3);
      opacity: 1;
      border-radius: 23px;
      padding: 10px;

      &.single-btn {
        height: 40px;
        padding: 0 20px;
      }

      .value-box {
        width: 30px;
        text-align: center;
      }

      .operator-box {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #fff;
        color: #FE5A3F;
        line-height: 28px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;

        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .goods-name-box {
      padding: 0 10px;

      .goods-name {
        height: 25px;
        font-size: 18px;
        font-family: 苹方-简;
        line-height: 17px;
        color: #313131;
        opacity: 1;
        font-weight: 600;
      }

      .goods-price-box {
        display: flex;

        .goods-price,
        .price-right {
          flex: 1;
          width: 56px;
          font-size: 10px;
          font-family: SF Pro Text;
          font-weight: bold;
          font-size: 16px;
          padding: 10px 0;
        }

        .price-right {
          text-align: right;
        }
      }
    }


    .goods-desc {
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;

      .desc-title {
        font-size: 16px;
        font-family: 苹方-简;
        font-weight: normal;
        color: #313131;
        opacity: 1;
        border-bottom: 1px solid #F5F6FA;
        padding-bottom: 10px;
      }

      .goods-desc-col {
        padding-top: 10px;
        display: flex;
        flex-wrap: wrap;

        .label {
          color: #BABABA;
          line-height: 30px;
        }

        .desc {
          font-size: 14px;
          line-height: 20px;
          font-family: 苹方-简;
          font-weight: normal;
          color: #313131;
        }
      }

    }
  }
</style>
