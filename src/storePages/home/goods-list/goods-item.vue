<template>
  <view class="" v-if="goodsInfo">
    <view class="" @click="toGoodsDetail()">
      <view class="goods-image" :style="{ height: goodsInfo.imgHeight + 'px' }" v-if="goodsInfo[image]">
        <image class="image" :lazy-load="true" :src="goodsInfo.url" mode="aspectFill"
          :style="{ height: goodsInfo.imgHeight + 'px' }"></image>
        <text v-if="goodsInfo.store_label" class="badge"> {{goodsInfo.store_label}}</text>
      </view>
      <view class="goods-image" v-else>{{ goodsInfo[name].slice(0, 4) }}</view>
      <view class="goods-info">
        <view class="goods-name">
          <text>{{ goodsInfo[name] }}</text>
        </view>
        <view class="desc" v-if="goodsInfo[desc]">{{ goodsInfo[desc]||'' }}</view>
        <view class="price margin-top-xs">
          <view class="">
            <view class="text-red ">
              <text class="symbol">￥</text>
              <text class="number" style="font-size: 20px;">{{ goodsInfo[price] }}</text>
            </view>
            <view class="line-through" v-if="goodsInfo[originPrice]">
              <text class="symbol"
                :class="{'text-red':!goodsInfo[originPrice],'text-gray':goodsInfo[originPrice]}">￥</text>
              <text class="number "
                :class="{' text-gray':goodsInfo[originPrice],'text-red':!goodsInfo[originPrice]}">{{ goodsInfo[originPrice] }}</text>
            </view>
          </view>
          <view class="number-handler-box" v-if="enableAddCart">
            <view class="hand-btn" v-if="enableSku&&!goodsInfo.goods_sku_amount" @click.stop="openSkuSelector">
              选规格
            </view>
            <view class="goods-amount" v-else-if="enableSku&&goodsInfo.goods_sku_amount">
              <view class="hand-btn round" style="opacity: 0.5;" @click.stop="minus(goodsInfo)">
                <u-icon name="minus"></u-icon>
              </view>
              <text v-if="goodsInfo.goods_sku_amount" class="goods-amount-num">{{goodsInfo.goods_sku_amount}}</text>
              <view class="hand-btn round" @click.stop="openSkuSelector">
                <u-icon name="plus"></u-icon>
              </view>
            </view>
            <view class="goods-amount" v-else-if="goodsInfo.goods_amount">
              <view class="hand-btn round" @click.stop="minus(goodsInfo)">
                <u-icon name="minus"></u-icon>
              </view>
              <text v-if="goodsInfo.goods_amount" class="goods-amount-num">{{goodsInfo.goods_amount}}</text>
            </view>
            <view class="hand-btn round" v-if="!enableSku" @click.stop="toCart(goodsInfo)">
              <u-icon name="plus"></u-icon>
            </view>
          </view>
        </view>
        <view class="data-display">
          <view class="disp-goodsInfo" v-if="goodsInfo[salesVolume]">
            销量：{{ getNumber(goodsInfo[salesVolume])||''}}
          </view>
          <view class="disp-goodsInfo" v-else>

          </view>
          <view class="disp-goodsInfo" v-if="goodsInfo[viewingCount]">
            <text class="cuIcon-attention margin-right-xs"></text>
            <text>{{ getNumber(goodsInfo[viewingCount])||''}}</text>
          </view>
        </view>
      </view>
    </view>
    <skuSelector ref="skuSelector" :goodsInfo="goodsInfo" modalConfirmType="addToCart" @confirm="confirm"
      @selected="selectedSku" v-if="enableSku" />
  </view>
</template>

<script>
  import {
    debounce
  } from '@/common/func/util.js'
  import skuSelector from '../../components/sku-selector/sku-selector.vue'
  export default {
    components: {
      skuSelector
    },
    props: {
      goods: {
        type: Object
      },
      image: {
        type: String,
        default: 'image'
      },
      name: {
        type: String,
        default: 'name'
      },
      desc: {
        type: String,
        default: 'description'
      },
      price: {
        type: String,
        default: 'price'
      },
      originPrice: { //原价
        type: String,
        default: 'origin_price'
      },
      salesVolume: {
        // 销量
        type: String,
        default: 'sales_volume'
      },
      viewingCount: {
        // 浏览数
        type: String,
        default: 'viewing_count'
      },
      enableAddCart: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        skuAttr: null,
        goodsInfo: null
      }
    },
    computed: {
      enableSku() {
        return this.goodsInfo?.enable_sku === '是' ? true : false
      },
    },
    created() {
      this.goodsInfo = this.goods
    },
    watch: {
      'goods.goods_amount': {
        handler(newValue, oldValue) {
          this.goodsInfo = this.goods
        }
      },
      'goods.goods_sku_amount': {
        handler(newValue, oldValue) {
          this.goodsInfo = this.goods
        }
      }
    },
    methods: {
      minus: debounce(function(e) {
        this.$emit('minus', e)
      }, 500, false),
      // minus(e) {
      //   this.$emit('minus', e)
      // },
      toCart: debounce(function(e) {
        this.$emit('toCart', e)
      }, 100, false),
      // toCart(e) {
      //   this.$emit('toCart', e)
      // },
      toGoodsDetail() {
        this.$emit('to-etail', this.goodsInfo)
      },
      openSkuSelector() {
        this.$refs?.skuSelector?.open?.()
      },
      selectedSku(e) {
        this.skuAttr = e
      },
      async confirm(e) {
        // 添加到购物车
        this.$emit('addSku2Cart', e)
      },
      getNumber(num) {
        let amount = ''
        num = Number(num)
        if (typeof num === 'number' && !isNaN(num) && num > 0) {
          if (num > 10000) {
            return `1万+`
          } else if (num > 1000) {
            return `${parseInt(num/1000)*1000}+`
          } else if (num > 100) {
            return `${parseInt(num/100)*100}+`
          } else {
            return num
          }
        } else {
          return 0
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  // .goods-item {
  //   border-radius: 10px;
  //   overflow: hidden;
  //   background-color: #fff;
  //   break-inside: avoid;
  //   margin-top: 20rpx;
  //   // width: calc(50% - 20rpx);
  //   min-width: 45%;
  //   flex: 1;
  //   max-width: calc(50% - 10rpx);
  //   margin-right: 20rpx;

  //   // margin-bottom: 20rpx;
  //   &:first-child,
  //   &:nth-child(2) {
  //     margin-top: 0;
  //   }

  //   &:nth-child(2n) {
  //     margin-right: 0;
  //   }
  // }

  .goods-image {
    width: 100%;
    height: 300rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    border: 1px solid #fff;
    position: relative;
    .image {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 5px 5px 0 0;
    }

    .badge {
      background-color: #fde159;
      color: #333;
      font-size: 12px;
      margin-left: 2px;
      padding: 2px 5px;
      border-radius: 2px;
      position: absolute;
      right: -2px;
      top: -2px;
    }
  }

  .goods-info {
    padding: 10rpx;
    padding-bottom: 0;
    width: 100%;
    margin-top: 5px;
    font-size: 16px;

    .desc {
      font-size: 12px;
      color: #aaa;
      margin-top: 5px;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /**指定行数*/
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;



      .symbol {
        font-size: 12px;
      }

      .number {
        font-size: 20px;
      }

      .line-through {
        position: relative;
        color: #666;
        font-size: 18px;

        .number {
          font-size: 18px;
        }

        &::after {
          content: '';
          width: 100%;
          height: 2px;
          top: 50%;
          background-color: #666;
          position: absolute;
          left: 0;
        }
      }


    }

    .data-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #999;
      padding: 5px;
    }
  }



  .goods-name {
    text-align: left;

  }

  .number-handler-box {
    display: flex;
    align-items: center;

    .goods-amount {
      display: flex;
      align-items: center;

      .goods-amount-num {
        display: inline-block;
        width: 30px;
        text-align: center;
        font-size: 16px;
      }
    }

    .hand-btn {
      background-color: #FDCA01;
      color: #fff;
      padding: 2px 5px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        transform: translate(1px, 1px);
      }

      &.round {
        padding: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        text-align: center;
        line-height: 20px;
        font-size: 16px;
      }
    }
  }
</style>
