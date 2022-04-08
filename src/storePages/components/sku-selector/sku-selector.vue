<template>
  <view class="cu-modal bottom-modal" :class="{show:show==true}" @click="hide()" v-if="goodsInfo">
    <view class="cu-dialog" @click.stop="">
      <view class="modal-content" v-if="optionsType==='商品属性'">
        <view class="selected-sku" v-if="selectSku&&selectSku.sku_no">
          <image lazy-load :src="getImagePath(selectSku.goods_icon)" mode="aspectFit" class="goods-icon"
            v-if="selectSku.goods_icon"></image>
          <view class="selected-sku-attr">
            <view class="goods-name" v-if="selectSku.goods_name">
              {{selectSku.goods_name}}
            </view>
            <view class="text-red" v-if="selectSku.price">
              <text class="text-sm">￥</text> <text class="text-lg">
                {{selectSku.price}}</text>
            </view>
          </view>
        </view>
        <view class="sku-goods-datas" v-if="goodsAttrList&&goodsAttrList.length>0">
          <view class="sku-goods-attr-list" v-for="(item,index) in goodsAttrList">
            <view class="label">
              {{item.good_attr_name||''}}
              <text v-if="item.is_required==='是'" class="text-red text-sm margin-left-xs">(必选)</text>
            </view>
            <view class="option-list" v-if="item.goods_attr_values&&item.goods_attr_values.length>0">
              <bx-radio-group class="form-item-content_value radio-group" mode="button" :disabled="false"
                v-model="item.radioSelected" @change="radioChange($event,item)">
                <bx-radio class="radio" color="#2979ff" v-for="(option,opIndex) in item.goods_attr_values"
                  :key="opIndex" :disabled="false" :name="option.good_attr_value_no">
                  {{ option.good_attr_value }}
                </bx-radio>
              </bx-radio-group>
            </view>
          </view>
        </view>
        <view class="number-box">
          <text>数量</text>
          <u-number-box v-model="goodsInfo.goods_amount" :min="1"></u-number-box>
        </view>
        <view class="relation-goods" v-if="relationGoods&&relationGoods.length>0">
          <view class="title">
            相关商品
          </view>
          <view class="goods-item" v-for="goods in relationGoods">
            <image lazy-load class="goods-icon" :src="getImagePath(goods.goods_img)" v-if="goods.goods_img">

            </image>
            <view class="goods-name">
              {{goods.goods_name||""}}
              <text class="margin-lr-xs text-red text-sm">￥{{goods.price||''}}</text>
            </view>
            <u-number-box v-model="goods.goods_amount" :min="0"></u-number-box>
          </view>
        </view>
        <view class="button-box" v-if="modalConfirmType==='all'">
          <button class="cu-btn round lg bg-red flex-1 margin-right-xs"
            @click="confirmAdd2Cart('addToCart')">加入购物车</button>
          <button class="cu-btn round lg bg-orange flex-1" @click="confirmAdd2Cart('toOrder')">立即购买</button>
        </view>
        <view class="button-box" v-else>
          <button class="cu-btn round lg bg-red" @click="confirmAdd2Cart()">确定</button>
        </view>
      </view>
      <view class="modal-content" v-else-if="optionsType==='SKU商品'">
        <view class="selected-sku" v-if="selectedAttrs&&selectedAttrs.selectSku">
          <image lazy-load :src="getImagePath(selectedAttrs.selectSku.goods_icon)" mode="aspectFit" class="goods-icon">
          </image>
          <view class="selected-sku-attr">
            <view class="goods-name">
              {{selectedAttrs.selectSku.goods_name}}
            </view>
            <view class="text-red">
              <text class="text-sm">￥</text> <text class="text-lg">
                {{selectedAttrs.selectSku.price}}</text>
            </view>
          </view>
        </view>
        <view class="sku-goods-datas" v-if="goodsSkuInfo.skuGoodsDatas&&goodsSkuInfo.skuGoodsDatas.length>0">
          <view class="label">
            规格
          </view>
          <view class="option-list">
            <bx-radio-group class="form-item-content_value radio-group" mode="button" :disabled="false"
              v-model="goodsSkuInfo.radioSelected" @change="radioChange($event,goodsSkuInfo)">
              <bx-radio class="radio" color="#2979ff" v-for="(option,opIndex) in goodsSkuInfo.skuGoodsDatas"
                :key="opIndex" :disabled="false" :name="option.sku_no">
                {{ option.goods_name }}
              </bx-radio>
            </bx-radio-group>
          </view>
        </view>
        <view class="sku-goods-datas" v-if="goodsSkuInfo.skuGoodsAttr&&goodsSkuInfo.skuGoodsAttr.length>0">
          <view class="sku-goods-attr-list" v-for="(item,index) in goodsSkuInfo.skuGoodsAttr">
            <view class="label">
              {{item.good_attr_name||''}}
              <text v-if="item.is_required==='是'" class="text-red text-sm margin-left-xs">(必选)</text>
            </view>
            <view class="option-list" v-if="item.goods_attr_values&&item.goods_attr_values.length>0">
              <bx-radio-group class="form-item-content_value radio-group" mode="button" :disabled="false"
                v-model="item.radioSelected">
                <bx-radio class="radio" color="#2979ff" v-for="(option,opIndex) in item.goods_attr_values"
                  :key="opIndex" :disabled="false" :name="option.good_attr_value_no">
                  {{ option.good_attr_value }}
                </bx-radio>
              </bx-radio-group>
            </view>
          </view>
        </view>
        <view class="number-box">
          <text>数量</text>
          <u-number-box v-model="goodsInfo.goods_amount" :min="1"></u-number-box>
        </view>
        <view class="relation-goods" v-if="relationGoods&&relationGoods.length>0">
          <view class="title">
            相关商品
          </view>
          <view class="goods-item" v-for="goods in relationGoods">
            <image lazy-load class="goods-icon" :src="getImagePath(goods.goods_img)" v-if="goods.goods_img">

            </image>
            <view class="goods-name">
              {{goods.goods_name||""}}
              <text class="margin-lr-xs text-red text-sm">￥{{goods.price||''}}</text>
            </view>
            <u-number-box v-model="goods.goods_amount" :min="0"></u-number-box>
          </view>
        </view>
        <view class="button-box" v-if="modalConfirmType==='all'">
          <button class="cu-btn round lg bg-red flex-1" @click="confirmAdd2Cart('addToCart')">加入购物车</button>
          <button class="cu-btn round lg bg-orange flex-1" @click="confirmAdd2Cart('toOrder')">立即购买</button>
        </view>
        <view class="button-box" v-else>
          <button class="cu-btn round lg bg-red" @click="confirmAdd2Cart()">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        show: false,
        goodsSkuInfo: {},
        goodsAttrList: [],
        selectedAttrs: {},
        modalConfirmType: "", // 确认类型  toOrder,addToCart,all
        selectSku: null,
        relationGoods: [], //相关商品
        purchase_limit: 0, // 商品限购次数
        purchaseTimes: 0, //商品购买次数
        purchasedGoods: [], //商品购买记录
      }
    },
    computed: {
      optionsType() {
        return this.goodsInfo?.options_type 
      }
    },
    props: {
      goodsInfo: {
        type: Object
      },
    },
    methods: {
      show(){
        this.show = true
        this.$emit('show')
      },
      hide() {
        this.show = false;
        this.$emit('hide')
      }
      
    },
  }
</script>

<style lang="scss" scoped>
</style>
