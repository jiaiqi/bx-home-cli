<template>
  <view :class="{fixed:fixed,fold:isFold&&!showList}" :style="[{bottom:bottom,margin:margin}]" class="cart-list-wrap">
    <view class="cart-bottom" @click="changeStatus" :class="['theme-'+theme]">
      <view class="goods-list-container" id="goods-list-container"
        :style="{bottom:listBottom,backgroundColor:showList?'rgba(0, 0, 0, 0.2)':''}">
        <view class="goods-list" :class="['theme-'+theme]" @click.stop="">
          <view class="title">
            <view class="left">
              已选商品
            </view>
            <view class="right" @click.stop="clear">
              清空
            </view>
          </view>
          <view class="goods-item" v-for="(rowData,index) in cartData" :key="index">
            <view class="main-image" v-if="setViewTemp.img.col">
              <image lazy-load class="image" :src="getImagePath(rowData[setViewTemp.img.col])" mode="scaleToFill">
              </image>
            </view>
            <view class="col-list" v-if="setViewTemp&&setViewTemp.cols">
              <view class="col-item bg" v-for="(item,index) in setViewTemp.cols" :key="index" :style="{
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
                <text class="hand-btn" @click.stop="changeAmount(rowData,index,-1)">
                  <text class="cuIcon-move"></text>
                </text>
                <view class="amount">
                  {{rowData.goods_count||rowData.goods_amount||'0'}}
                </view>
                <text class="hand-btn" :class="'bx-bg-'+theme" @click.stop="changeAmount(rowData,index,1)">
                  <text class="cuIcon-add"></text>
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="cart-icon" @click.stop="changeStatus"
        :class="{active:cartData&&cartData.length>0,'bx-btn-bg-color':cartData&&cartData.length>0&&theme}">
        <text class="badge" v-if="sumAmount">{{sumAmount}}</text>
        <text class="cuIcon-cart"></text>
      </view>
      <view class="price" v-if="!isFold||showList">
        ￥{{sumPrice||'0'}}
      </view>
      <view class="handler" v-if="!isFold||showList">
        <button class="cu-btn round"
          :class="{active:cartData&&cartData.length>0,'bx-bg-color':cartData&&cartData.length>0&&theme}"
          @click.stop="placeOrder">下单</button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showList: false,
        isFold: false
      }
    },
    watch: {
      fold: {
        immediate: true,
        handler(newValue) {
          this.isFold = newValue
        }
      },
    },
    computed: {
      listBottom() {
        if (this.showList === true) {
          return '50px'
        } else {
          return '-110vh'
        }
      },
      theme() {
        return this.$store?.state?.app?.theme
      },
      setViewTemp() {
        return this.list_config
      },
      sumAmount() {
        let sum = 0
        if (Array.isArray(this.cartData) && this.cartData.length > 0) {
          sum = this.cartData.reduce((res, cur) => {
            if (cur.goods_count) {
              res += cur.goods_count
            } else if (cur.goods_amount) {
              res += cur.goods_amount
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
            } else if (cur.goods_amount && cur.unit_price) {
              res += cur.goods_amount * cur.unit_price
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
      },
      margin: {
        type: String
      },
      fold: { //默认收缩
        type: Boolean,
        default: false
      }
    },
    methods: {
      clear() {
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
            goodsInfo.car_num = goodsInfo.goods_count||goodsInfo.goods_amount || 1
            goodsInfo.unit_price = goodsInfo.price || goodsInfo.unit_price
            return goodsInfo
          })
          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: goodsList
          });
          let url = `/storePages/payOrder/payOrder?store_no=${this.storeInfo?.store_no }`
          if (this.storeInfo?.moreConfig?.userNewOrderPages === true) {
            url = url.replace('/payOrder/payOrder', '/placeOrder/placeOrder')
            let orderType = this.getOrderType(goodsList)
            url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}`
          }
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
        if (row.goods_count) {
          row['goods_count'] = row['goods_count'] + num;
          if (row.goods_count >= 0) {
            this.$emit('changeAmount', {
              row,
              index
            })
          }
        } else {
          row['goods_amount'] = row['goods_amount'] + num;
          if (row.goods_amount >= 0) {
            this.$emit('changeAmount', {
              row,
              index
            })
          }
        }


      },
      changeStatus() {
        this.isFold = this.fold
        this.showList = !this.showList
        return
        if (this.isFold == true) {
          // this.isFold = false
          let url =
            `/publicPages/list2/list2?pageType=list&serviceName=srvhealth_store_my_shopping_cart_goods_detail_select&disabled=true&destApp=health&listType=cartList&cond=[{"colName":"store_no","ruleType":"eq","value":"${this.storeInfo?.store_no}"},{"colName":"store_user_no","ruleType":"eq","value":"${this.vstoreUser?.store_user_no}"}]&detailType=custom&customDetailUrl=/`

          // `/publicPages/list2/list2?pageType=list&serviceName=srvhealth_store_my_shopping_cart_goods_detail_select&disabled=true&destApp=health&listType=cartList&cond=[{"colName":"store_no","ruleType":"eq","value":"${this.storeInfo?.store_no}"},{"colName":"store_user_no","ruleType":"eq","value":"${this.vstoreUser?.store_user_no}"}]&detailType=custom&customDetailUrl=${encodeURIComponent('/storePages/GoodsDetail/GoodsDetail?goods_no=${data.goods_no}&storeNo=${storeInfo.store_no}')}`
          uni.navigateTo({
            url
          })
          return
        } else {
          this.isFold = this.fold
          this.showList = !this.showList
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .goods-list-container {
    position: absolute;
    width: 100%;
    left: 0;
    right: 0;
    transition: bottom ease-in-out .5s;
    display: flex;
    align-items: flex-end;
    background-color: transparent;
    height: 100vh;
    width: 100vw;
    z-index: 9999;
  }

  .goods-list {
    padding: 20rpx;
    border-top: 1px solid #f1f1f1;
    // position: absolute;
    // width: 100%;
    // left: 0;
    // right: 0;
    // transition: all ease-in-out .5s;
    background-color: #fff;
    width: 100%;

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
            width: 20px;
            height: 20px;
            display: flex;
            font-size: 16px;
            font-weight: bold;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background-color: #fdca01;
            color: #fff;

            &.line-orange {
              color: #fdca01;
            }

            &.bg-orange {
              background-color: #fdca01;
            }
          }

          .amount {
            // width: 100rpx;
            min-width: 60rpx;
            height: 20px;
            text-align: center;
            line-height: 20px;
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
    margin: 20rpx 0;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx 0;

    &.fixed {
      // width: calc(100% - 80rpx);
      width: 100vw;
      right: 10px;
      left: 0;
    }

    &.fold {
      background-color: transparent;
      border: none !important;
      right: 0;
      padding-right: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .cart-bottom {
      display: flex;
      align-items: center;
      position: relative;
      padding: 0 20rpx;
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
