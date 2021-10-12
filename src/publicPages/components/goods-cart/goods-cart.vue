<template>
  <view :class="{fixed:fixed}" :style="{bottom:bottom}" class="cart-list-wrap">
    <view class="goods-list" v-show="showList">
      <view class="title">
        <view class="left">
          已选商品
        </view>
        <view class="right" @click.stop="clear">
          清空
        </view>
      </view>
      <view class="goods-item" v-for="(rowData,index) in setCartData" :key="index">
        <view class="main-image" v-if="setViewTemp.img.col">
          <image class="image" :src="getImagePath(rowData[setViewTemp.img.col])" mode="scaleToFill"></image>
        </view>
        <view class="col-list" v-if="setViewTemp&&setViewTemp.cols">
          <view class="col-item bg" v-for="item in setViewTemp.cols" :style="{
            'width':item.cfg.width,
            'min-width':item.cfg.min_width,
            'padding':item.cfg.padding,
            'font-size':item.cfg.font_size,
            'font-weight':item.cfg.font_weight,
            'text-align':item.cfg.align,
            'color':item.cfg.color,
            'justify-content':item.cfg.align==='left'?'flex-start':item.cfg.align==='right'?'flex-end':item.cfg.align
          }" :class="{
            'cu-btn':item.cfg.style==='button'||item.cfg.style==='line_button',
            'border':item.cfg.style==='line_button',
            'round':item.cfg.round===true,
            'light':item.cfg.light===true,
            'sm':item.cfg.size==='sm',
            'lg':item.cfg.size==='lg',
            'bg-blue':item.cfg.bg==='blue',
            'bg-red':item.cfg.bg==='red',
            'bg-orange':item.cfg.bg==='orange',
            'bg-cyan':item.cfg.bg==='cyan',
            'bg-yellow':item.cfg.bg==='yellow',
            'bg-white':item.cfg.bg==='white',
            'bg-black':item.cfg.bg==='black',
            'bg-green':item.cfg.bg==='green',
            'bg-grey':item.cfg.bg==='grey',
            'bg-gray':item.cfg.bg==='gray',
            'line-blue':item.cfg.border_color==='blue',
            'line-red':item.cfg.border_color==='red',
            'line-orange':item.cfg.border_color==='orange',
            'line-cyan':item.cfg.border_color==='cyan',
            'line-yellow':item.cfg.border_color==='yellow',
            'line-white':item.cfg.border_color==='white',
            'line-black':item.cfg.border_color==='black',
            'line-green':item.cfg.border_color==='green',
            'line-grey':item.cfg.border_color==='grey',
            'line-gray':item.cfg.border_color==='gray',
          }">
            <view class="label" v-if="item.cfg.disp_label&&labelMap[item.col]">
              {{labelMap[item.col]||''}}:
            </view>
            <view class="value">
              <text v-if="item.cfg&&item.cfg.prefix">{{item.cfg.prefix}}</text>
              {{rowData[item.col]||''}}
            </view>
          </view>
          <view class="col-item text-right flex-1 handler-btn">
            <text class="hand-btn cu-btn line-orange border sm radius" @click="changeAmount(rowData,index,-1)">-</text>
            <view class="amount">
              {{rowData.goods_count||'0'}}
            </view>
            <text class="hand-btn cu-btn bg-orange sm radius" @click="changeAmount(rowData,index,1)">+</text>
          </view>
        </view>
      </view>
    </view>
    <view class="cart-bottom" @click="changeStatus">
      <view class="cart-icon" :class="{active:cartData&&cartData.length>0}">
        <text class="badge" v-if="sumAmount">{{sumAmount}}</text>
        <text class="cuIcon-cart"></text>
      </view>
      <view class="price">
        ￥{{sumPrice||'0'}}
      </view>
      <view class="handler">
        <button class="cu-btn round" :class="{active:cartData&&cartData.length>0}" @click.stop="placeOrder">下单</button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showList: false
      }
    },
    computed: {
      storeInfo() {
        return this.$store?.state?.app?.storeInfo
      },
      setViewTemp() {
        return this.list_config
      },
      setCartData() {
        return this.cartData
      },
      sumAmount() {
        let sum = 0
        if (Array.isArray(this.cartData) && this.cartData.length > 0) {
          sum = this.cartData.reduce((res, cur) => {
            if (cur.goods_count) {
              res += cur.goods_count
            }
            return res
          }, 0)
        }
        return sum
      },
      sumPrice() {
        let sum = 0
        if (Array.isArray(this.cartData) && this.cartData.length > 0) {
          sum = this.cartData.reduce((res, cur) => {
            if (cur.goods_count && cur.price) {
              res += cur.goods_count * cur.price
            }
            return res
          }, 0)
        }
        return sum
      }
    },
    props: {
      cartData: {
        type: Array
      },

      fixed: {
        type: Boolean,
        default: false
      },
      bottom: {
        type: String,
        default: '50rpx'
      },
      list_config: {
        type: Object
      },
      wxMchId: {
        type: String
      }
    },
    methods: {
      clear() {
        this.showList = false
        this.$emit('clear')
      },
      placeOrder() {
        let goodsList = this.deepClone(this.cartData)
        if (goodsList.length > 0) {
          goodsList = goodsList.map(goodsInfo => {
            if (!goodsInfo.goods_image && goodsInfo.goods_img) {
              goodsInfo.goods_image = goodsInfo.goods_img;
            }
            goodsInfo.name = goodsInfo.goods_name
            goodsInfo.image = goodsInfo.store_image
            goodsInfo.car_num = goodsInfo.goods_count || 1
            goodsInfo.unit_price = goodsInfo.price
            return goodsInfo
          })
          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: goodsList
          });
          let url = `/storePages/payOrder/payOrder?store_no=${this.storeInfo?.store_no }`

          if (this.wxMchId) {
            url += `&wxMchId=${this.wxMchId}`
          }
          uni.navigateTo({
            url
          });
        } else {
          uni.showToast({
            title: '请先选择商品！',
            icon: 'none'
          })
        }
      },
      changeAmount(row, index, num) {
        row = this.deepClone(row)
        row['goods_count'] = row['goods_count'] + num;
        if (row.goods_count >= 0) {
          this.$emit('changeAmount', {
            row,
            index
          })
        }
      },
      changeStatus() {
        this.showList = !this.showList
      },
    }
  }
</script>

<style lang="scss" scoped>
  .goods-list {
    padding: 0 0 20rpx;

    .title {
      font-size: 16px;
      color: #000;
      margin-bottom: 10rpx;
      display: flex;
      justify-content: space-between;

      .right {
        font-size: 12px;
        font-family: 苹方-简;
        font-weight: normal;
        color: #B8BAC0;
        padding-right: 20rpx;
      }
    }

    .goods-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #F2F1F6;

      &:last-child {
        border-bottom: none;
      }
    }

    .col-list {
      flex: 1;

      flex: 1;
      display: flex;
      flex-wrap: wrap;

      .col-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 10rpx;
        font-size: 28rpx;
        font-family: 苹方-简;
        color: #333333;
        &.handler-btn {
          display: flex;
          align-items: center;

          .hand-btn {
            width: 50rpx;
            height: 50rpx;
            text-align: center;
            line-height: 50rpx;
            border-radius: 10rpx;

            &.line-orange {
              color: #F3A250;
            }

            &.bg-orange {
              background-color: #F3A250;
            }
          }

          .amount {
            width: 100rpx;
            height: 50rpx;
            text-align: center;
            line-height: 50rpx;
            background-color: #F8F8FA;
            text-align: center;
            padding: 0 20rpx;
            font-size: 14px;
          }
        }

        &.flex-1 {
          flex: 1;
          font-size: 40rpx;
        }

        &.text-right {
          justify-content: flex-end;
          padding-right: 20rpx;
        }

        .label {
          margin-right: 10rpx;
        }

        .value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
      }
    }

    .main-image {
      width: 100rpx;
      height: 100rpx;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      overflow: hidden;
      border-radius: 10rpx;
      background-color: #F8F8FA;

      .image {
        width: 100%;
        height: 100%;
        border-radius: 20rpx;
      }
    }
  }

  .fixed {
    position: fixed;
  }

  .cart-list-wrap {
    margin: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;


    &.fixed {
      width: calc(100% - 80rpx);
      left: 20rpx;
    }

    .cart-bottom {
      display: flex;
      align-items: center;
    }

    .price {
      flex: 1;
      padding: 20rpx 40rpx;
      font-size: 28rpx;
      font-family: SF Pro Text;
      font-weight: bold;
      color: #474849;

      .decimal {
        font-size: 20rpx;
      }
    }

    .cart-icon {
      font-size: 40rpx;
      color: #474D59;
      background: rgba($color: #474D59, $alpha: 0.1);
      width: 80rpx;
      height: 80rpx;
      line-height: 80rpx;
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
</style>
