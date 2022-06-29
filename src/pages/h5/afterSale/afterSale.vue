<template>
  <view>
    <view class=" padding bg-white" v-if="goodsInfo">
      <view class="text-bold margin-tb-xs text-black">
        退款商品
      </view>
      <view class="goods-info flex justify-between flex-wrap ">
        <image class="goods-image" :src="getImagePath(goodsInfo.goods_image)" mode="aspectFill"></image>
        <view class="flex content flex-wrap padding-lr-xs">
          <view class="flex width-wrap justify-between ">
            <view class="goods-name text-bold">
              {{goodsInfo.goods_name}}
            </view>
            <view class="goods-price">
              ￥{{goodsInfo.unit_price}}
            </view>
          </view>
          <view class=" width-wrap flex flex-1 justify-end align-center">
            <text v-if="amountMax==1">x{{goodsInfo.goods_amount}}</text>
            <u-number-box v-model="goodsInfo.goods_amount" :min="1" :max="amountMax" v-else></u-number-box>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-box padding bg-white margin-tb">
      <view class="text-bold margin-tb-xs text-black">
        选择售后类型
      </view>
      <view class="menu-list text-black">
        <view class="menu-list-item flex justify-between align-center padding-tb" v-for="item in typeList"
          @click="toForm(item)">
          <text>{{item}}</text>
          <text class="cuIcon-right"></text>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        typeList: [
          "我要退款(无需退货)", '我要退货退款', '我要换货'
        ],
        goodsInfo: null,
        amountMax: 1,
        storeUserNo: "",
      }
    },
    methods: {
      getGoodsInfo(no) {
        const req = {
          "serviceName": "srvhealth_store_order_goods_detail_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "order_goods_rec_no",
            "ruleType": "eq",
            "value": no
          }]
        }
        const url = `/health/select/srvhealth_store_order_goods_detail_select`
        this.$http.post(url, req).then(res => {
          if (res?.data?.data === 'SUCCESS'&&res.data.data.length>0) {
            this.goodsInfo = res.data.data[0]
          }
        })
      },
      toForm(e) {
        let url =
          `/pages/h5/afterSale/form?serviceName=srvhealth_store_return_order_add&type=${e}&goodsInfo=${JSON.stringify(this.goodsInfo)}`
        uni.navigateTo({
          url
        })
      },

    },
    onLoad(option) {

      if (option.goodsInfo) {
        try {
          this.goodsInfo = JSON.parse(option.goodsInfo)
        } catch (e) {
          console.log(e)
          //TODO handle the exception
          this.goodsInfo = JSON.parse(decodeURIComponent(option.goodsInfo))
        }
        this.amountMax = this.goodsInfo?.goods_amount
      }
    }
  }
</script>

<style lang="scss">
  .goods-image {
    width: 60px;
    height: 60px;
    border-radius: 5px;
  }

  .goods-info {
    .content {
      width: calc(100% - 60px);
    }

    .width-wrap {
      width: 100%;
    }
  }

  .menu-list-item {
    &:active {
      opacity: 0.7;
      transform: translate(1px, 1px);
    }
  }
</style>
