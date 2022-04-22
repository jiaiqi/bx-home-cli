<template>
  <view class="" v-if="goods">
    <view class="goods-item">
      <image lazy-load class="goods-image" :src="getGoodsImageUrl()" mode=""
        v-if="!['想豆卡','充值卡'].includes(goods.goods_type)"></image>
      <view class="content">
        <view class="goods-name">{{ goods.name||goods.goods_name||goods.goods_desc||'' }}
        </view>
        <view class="attr" v-if="goods.attr">{{goods.attr}}</view>
        <view class="attr" v-else-if="skuAttrStr">{{skuAttrStr}}</view>
      </view>
      <view class="num">
        <view class="price" v-if="goods.unit_price ||goods.price">
          <text class="money-operate">￥</text>
          {{ goods.unit_price || goods.price || "" }}
        </view>
        <view class="amount">
          <text>x{{
		    goods.goods_amount ? goods.goods_amount : goods.car_num || ""
		  }}</text>
        </view>
      </view>
    </view>
    <view class="goods-item-list">
      <view class="goods-item" v-for="(item,index) in list" :key="index">
        <image lazy-load class="goods-image" :src="getGoodsImageUrl(item)" mode=""></image>
        <view class="content">
          <view class="goods-name">{{ item.name||item.goods_name||item.goods_desc||'' }}
          </view>
          <view class="attr">
            {{ item.attr||'' }}
          </view>
        </view>
        <view class="num">
          <view class="price" v-if="item.unit_price ||item.price">
            <text class="money-operate">￥</text>
            {{ item.unit_price || item.price || "" }}
          </view>
          <view class="amount">x{{
			    item.goods_amount ? item.goods_amount : item.car_num ||item.num||''
			  }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      goods: {
        type: Object
      },
    },
    data() {
      return {
        list: [],
        skuAttr: []
      }
    },
    computed: {
      skuAttrStr() {
        if (Array.isArray(this.skuAttr) && this.skuAttr.length > 0) {
          return this.skuAttr.reduce((res, cur) => {
            if (cur.good_attr_value) {
              if (res) {
                res += `,${cur.good_attr_value}`
              } else {
                res = cur.good_attr_value
              }
            }
            return res
          }, '')
        }
        if (this.goods?.child_data_list?. [0]?.data?.length > 0) {
          return this.goods.child_data_list[0].data.map(item => item.good_attr_value).toString()
        }
      }
    },
    mounted() {
      if (['套餐卡', '提货卡'].includes(this.goods?.goods_type) && this.goods?.package_goods_no) {
        this.getDetail()
      }
      if (this.goods?.goods_source === '店铺SKU') {
        this.getSkuAttr()
      }
    },
    methods: {
      getGoodsImageUrl(goods) {
        goods = goods || this.goods;
        let imgNo = goods?.goods_image || goods?.goods_img || goods?.image
        return this.getImagePath(imgNo)
      },
      async getSkuAttr(from) {
        let no = this.goods?.order_goods_rec_no || this.goods?.cart_goods_rec_no
        if (no) {
          let serviceName = 'srvhealth_store_order_goods_attr_value_select'
          let col = 'order_goods_rec_no'
          if (this.goods?.cart_goods_rec_no) {
            col = 'cart_goods_rec_no'
            serviceName = 'srvhealth_store_shopping_cart_goods_detail_select'
          }
          const req = {
            "serviceName": serviceName,
            "colNames": ["*"],
            "condition": [{
              "colName": col,
              "ruleType": "eq",
              "value": no
            }],
            "page": {
              "pageNo": 1,
              "rownumber": 100
            }
          }
          let res = await this.$fetch('select', serviceName, req,
            'health');
          if (res.success) {
            this.skuAttr = res.data
          }
        }

      },
      async getDetail() {
        let req = {
          "serviceName": "srvhealth_store_package_goods_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "package_goods_no",
            "ruleType": "eq",
            "value": this.goods?.package_goods_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 100
          },
          "order": [],
        }

        let res = await this.$fetch('select', 'srvhealth_store_package_goods_select', req, 'health');
        if (res.success) {
          this.list = res.data
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  .goods-item-list {
    padding-left: 30px;
    padding-top: 5px;
    padding-right: 0px;

    .goods-item {
      display: flex;

      &+.goods-item {
        margin-top: 10px;
      }
    }
  }

  .goods-item {
    display: flex;

    &+.goods-item {
      margin-top: 20px;
    }

    .goods-image {
      width: 80px;
      height: 60px;
      background-color: #f1f1f1;
      border-radius: 5px;
    }

    .content {
      flex: 1;
      padding: 0 20rpx;
      font-weight: bold;

      .attr {
        font-weight: normal;
        font-size: 12px;
        color: #999;
      }
    }

    .num {
      // width: 100px;
      text-align: right;
      margin-bottom: 5px;

      .price {
        font-weight: bold;
        color: #f76260;
        font-size: 18px;
        margin-bottom: 5px;

        .money-operate {
          font-size: 12px;
        }
      }

      .amount {
        font-size: 12px;
        color: #999;
      }
    }
  }
</style>
