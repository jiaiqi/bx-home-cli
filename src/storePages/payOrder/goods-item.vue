<template>
  <view class="">
    <view class="goods-item">
      <image class="goods-image" :src="
		  goods.goods_image
		    ? getImagePath(goods.goods_image)
		    : goods.image
		    ? getImagePath(goods.image)
		    : '../static/doctor_default.png'
		" mode=""></image>
      <view class="content">
        <view class="goods-name">{{ goods.name||goods.goods_name||goods.goods_desc||'' }}
        </view>
      </view>
      <view class="num">
        <view class="price" v-if="goods.unit_price ||goods.price">
          <text class="money-operate">￥</text>
          {{ goods.unit_price || goods.price || "" }}
        </view>
        <view class="amount">x{{
		    goods.goods_amount ? goods.goods_amount : goods.car_num || ""
		  }}
        </view>
      </view>
    </view>
    <view class="goods-item-list">
      <view class="goods-item" v-for="(item,index) in list" :key="index">
        <image class="goods-image" :src="
			  item.goods_image
			    ? getImagePath(item.goods_image)
			    : item.goods_img
			    ? getImagePath(item.goods_img)
			    : getImagePath(item.image)
			" mode=""></image>
        <view class="content">
          <view class="goods-name">{{ item.name||item.goods_name||item.goods_desc||'' }}
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
        list: []
      }
    },
    mounted() {
      if (['套餐卡', '提货卡'].includes(this.goods?.goods_type) && this.goods?.package_goods_no) {
        this.getDetail()
      }
    },
    methods: {
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
    padding-left: 60px;
    padding-top: 10px;
    padding-right: 40px;
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
    }

    .num {
      width: 100px;
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
