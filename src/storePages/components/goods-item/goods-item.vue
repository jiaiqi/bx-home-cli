<template>
  <view class="" v-if="goods">
    <view class="goods-item">
      <image lazy-load class="goods-image" :src="getGoodsImageUrl()" mode="aspectFill"
        v-if="!['想豆卡','充值卡'].includes(goods.goods_type)"></image>
      <view class="content">
        <view class="goods-name">{{ goods.name||goods.goods_name||goods.goods_desc||'' }}
        </view>
        <view class="attr" v-if="goods.attr">{{goods.attr}}</view>
        <view class="attr" v-else-if="skuAttrStr">{{skuAttrStr}}</view>
      </view>
      <view class="num bottom-button">
        <view class="price" v-if="goods.unit_price ||goods.price">
          <text class="money-operate">￥</text>
          {{ goods.unit_price || goods.price || "" }}
        </view>
        <view class="amount">
          <text>x{{
		    goods.goods_amount ? goods.goods_amount : goods.car_num || ""
		  }}</text>
        </view>
        <button class="cu-btn round sm margin-right-xs" @click="toAfterSale" v-if="goods.pay_state==='已支付'">退款</button>
        <button class="cu-btn round sm border"
          v-if="orderInfo&&orderInfo.order_state==='已完成'&& goods.is_remark=='待评价'&&goods.pay_state==='已支付'"
          @click="toEvaluate">评价</button>
        <button class="cu-btn round sm border" v-if="goods.is_remark!='待评价'" @click="toEvaluate('detail')">查看评价</button>
      </view>
    </view>
    <view class="goods-item-list" v-if="list&&list.length>0">
      <view class="goods-item" v-for="(item,index) in list" :key="index">
        <image lazy-load class="goods-image" :src="getGoodsImageUrl(item)" mode="aspectFill"></image>
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
      orderInfo: {
        type: Object
      },
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
      toAfterSale() {
        // 跳转到售后页面
        const cols = ['id', 'order_goods_rec_no', 'order_no', 'goods_no', 'package_goods_no', 'store_no',
          'origin_price', 'sum_price', 'unit_price', 'packaging_fee', 'goods_name', 'goods_image', 'goods_desc',
          'goods_amount', 'delivery_status', 'goods_type', 'goods_source'
        ]

        const goods = cols.reduce((res, cur) => {
          res[cur] = this.goods[cur];
          return res
        }, {})

        let url =
          `https://login.100xsys.cn/health/#/pages/h5/afterSale/afterSale?user_no=${this.userInfo.userno}&goodsInfo=${JSON.stringify(goods)}&storeUserNo=${this.vstoreUser.store_user_no}`

        uni.navigateTo({
          url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(url)}`
        })
      },
      toEvaluate(e) {
        // 跳转到评价页面
        let fieldsCond = [{
          "column": "store_no",
          "value": this.storeInfo.store_no
        }, {
          "column": "store_user_no",
          "value": this.vstoreUser?.store_user_no
        }, {
          "column": "goods_no",
          "value": this.goods.goods_no
        }, {
          "column": "order_no",
          "value": this.goods?.order_no
        }, {
          "column": "person_name",
          "value": this.userInfo.name
        }, {
          "column": "person_photo",
          "value": this.userInfo.profile_url || this.userInfo.user_image
        }, {
          "column": "order_goods_rec_no",
          "value": this.goods?.order_goods_rec_no
        }]
        let url =
          `/publicPages/formPage/formPage?serviceName=srvhealth_store_goods_remark_add&destApp=health&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`
        if (e == 'detail') {
          url =
            `/storePages/evaluateList/evaluateList?no=${this.goods.goods_no}&order_goods_rec_no=${this.goods.order_goods_rec_no}`
        }
        uni.redirectTo({
          url
        })
      },
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
    margin-top: 5px;
    padding: 10px;
    border-radius: 5px;
    background-color: #f8f8fa;

    .goods-item {
      display: flex;

      &+.goods-item {
        margin-top: 10px;
      }
    }
  }

  .goods-item {
    display: flex;
    margin-top: 10px;
    flex-wrap: wrap;

    .bottom-button {
      // width: 100%;
      // display: flex;
      // padding: 0 0 5px;

      .cu-btn {
        min-width: 60px;
        background-color: #f8f8f8;
        border: 1px solid #e8e8e8;
      }

      justify-content: flex-end;
    }

    // &+.goods-item {
    //   margin-top: 20px;
    // }

    .goods-image {
      width: 60px;
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
        // font-weight: bold;
        color: #FE5A3F;
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
