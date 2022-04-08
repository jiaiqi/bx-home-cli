<template>
  <view class="goods-list-wrap">
    <view class="title" :style="titleStyle" v-if="pageItem && pageItem.show_label === '是'">
      <text>{{ pageItem.component_label || '' }}</text>
      <view class="to-more cu-btn" v-if="hasMore" @click="toMore">
        查看更多
        <text class="cuIcon-right"></text>
      </view>
    </view>
    <view class="goods-list" :style="[calcStyle]" v-if="goodsList&&goodsList.length>0">
      <view class="goods-item" v-for="(item,index) in goodsList" @click="toGoodsDetail(item)" :key="index">
        <image class="goods-image" v-if="item[image]" :lazy-load="true" :src="item.url" mode="aspectFill"
          :style="{ height: item.imgHeight + 'px' }"></image>
        <view class="goods-image" v-else>{{ item[name].slice(0, 4) }}</view>
        <view class="goods-info">
          <view class="goods-name">{{ item[name] }}</view>
          <view class="desc" v-if="item[desc]">{{ item[desc]||'' }}</view>
          <view class="price margin-top-xs">
            <view class="">
              <view class="text-red ">
                <text class="symbol">￥</text>
                <text class="number" style="font-size: 20px;">{{ item[price] }}</text>
              </view>
              <view class="line-through" v-if="item[originPrice]">
                <text class="symbol" :class="{'text-red':!item[originPrice],'text-gray':item[originPrice]}">￥</text>
                <text class="number "
                  :class="{' text-gray':item[originPrice],'text-red':!item[originPrice]}">{{ item[originPrice] }}</text>
              </view>
            </view>
            <view class="" @click.stop="toCart(item)" v-if="enableAddCart">
             <!-- <view class="hand-btn" v-if="item.enable_sku==='是'">
                选规格
              </view> -->
              <view class="hand-btn round">
                <text class="cuIcon-add"></text>
              </view>
            </view>
          </view>
          <view class="data-display">
            <view class="disp-item" v-if="item[salesVolume]">
              销量：{{ getNumber(item[salesVolume])||''}}
            </view>
            <view class="disp-item" v-else>

            </view>
            <view class="disp-item" v-if="item[viewingCount]">
              <text class="cuIcon-attention margin-right-xs"></text>
              <text>{{ getNumber(item[viewingCount])||''}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>


    <!-- <view class="cu-modal bottom-modal" :class="{show:modalName==='option-selector'}" @click="changeModal()"
      v-if="goodsInfo">
      <view class="cu-dialog" @click.stop="">
        <view class="modal-content" v-if="goodsInfo.options_type==='商品属性'">
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
            <image lazy-load :src="getImagePath(selectedAttrs.selectSku.goods_icon)" mode="aspectFit"
              class="goods-icon"></image>
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
 -->

  </view>
</template>

<script>
  /**
   * 商品列表组件
   * @description 商品列表组件
   * @property {Array} list 商品数据
   * @property {String} image 图片字段
   * @property {String} name 商品名字字段
   * @property {String} desc 商品描述字段
   * @property {String} price 商品价格字段
   * @event {Function} toGoodsDetail 跳转到商品详情
   * @example <good-list :list=""></good-list>
   */

  export default {
    name: 'good-list',
    computed: {
      enableAddCart() {
        return this.pageItem?.more_config?.enableAddCart ?? false
      },
      titleStyle() {
        if (typeof this.pageItem?.more_config === 'object') {
          return this.pageItem?.more_config?.titleStyle || '';
        }
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
      rownumber() {
        return this.pageItem?.row_number || 6
      },
      hasMore() {
        return this.total > this.rownumber
      },
    },
    data() {
      return {
        goodsList: [],
        goodsInfo: null,
        pageNo: 1,
        total: 0,
        onHandler: false,
        modalName: '',
        modalConfirmType: ""
      };
    },

    watch: {
      // storeNo
      'storeInfo.store_no': {
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue) {
            this.$nextTick(() => {
              this.getGoodsListData()
            })
          }
        }
      }
    },
    // created() {
    // 	this.getGoodsListData()
    // },
    methods: {
      changeModalConfirmType(e) {
        this.modalConfirmType = 'all'
        this.modalName = e
      },
      changeModal(e = '') {
        this.modalName = e
      },
      toCart(e) {
        if (e) {
          let goodsInfo = this.deepClone(e);
          this.goodsInfo = goodsInfo
          if (this.onHandler === true) {
            return;
          }
          this.onHandler = true;
          if (!goodsInfo.goods_image && goodsInfo.goods_img) {
            goodsInfo.goods_image = goodsInfo.goods_img;
          }
          goodsInfo.name = goodsInfo.goods_name;
          goodsInfo.image = goodsInfo.store_image;
          goodsInfo.car_num = 1;
          goodsInfo.unit_price = goodsInfo.price;
          goodsInfo.type = this.storeInfo?.type;
          let enable_sku = goodsInfo?.enable_sku;
          let options_type = goodsInfo?.options_type
          // if (enable_sku === '是') {
          //   // this.changeModal('option-selector')
          //   this.onHandler = false
          //   this.modalConfirmType = 'addToCart'
          //   return
          // }

          // 添加到购物车表
          this.addToCart(goodsInfo).then(_ => {
            this.onHandler = false;
          });

        }
      },
      async getCartDetail(cart_no, goods_no) {
        let service = 'srvhealth_store_shopping_cart_goods_detail_select';
        let req = {
          serviceName: service,
          colNames: ['*'],
          condition: [{
            colName: 'cart_no',
            ruleType: 'eq',
            value: cart_no
          }],
          page: {
            pageNo: 1,
            rownumber: 99
          }
        };
        if (goods_no) {
          req.condition = [{
            colName: 'goods_no',
            ruleType: 'eq',
            value: goods_no
          }];
        }
        if (this.vstoreUser?.store_user_no) {
          req.condition.push({
            colName: 'store_user_no',
            ruleType: 'eq',
            value: this.vstoreUser?.store_user_no
          });
        }
        let res = await this.$fetch('select', service, req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          if (goods_no) {
            return res.data[0];
          }
          return res.data;
        }
      },
      async addToCart(goods) {
        if (goods?.goods_no) {
          let goodsInfo = await this.getCartDetail(null, goods.goods_no);
          if (goodsInfo?.goods_no) {
            goodsInfo.goods_amount++;
            this.updateCart(goodsInfo);
          } else {
            goodsInfo = goods;
            let service = 'srvhealth_store_shopping_cart_goods_detail_add';
            let req = [{
              serviceName: service,
              condition: [],
              data: [{
                store_user_no: this.vstoreUser?.store_user_no,
                store_no: this.storeInfo?.storeNo,
                unit_price: goods.price,
                goods_amount: 1,
                goods_no: goods.goods_no,
                sum_price: goods.price,
                goods_desc: goods.goods_desc,
                goods_image: goods.goods_img,
                goods_name: goods.goods_name
              }]
            }];
            let res = await this.$fetch('operate', service, req, 'health');
            if (res.success) {
              // this.getCartList();
              uni.showToast({
                title: '添加成功'
              });
            }
          }
        }
        return;
      },
      async updateCart(goodsInfo) {
        if (this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        let serviceName = 'srvhealth_store_shopping_cart_goods_detail_update';
        if (goodsInfo?.cart_goods_rec_no) {
          let req = [{
            serviceName: serviceName,
            condition: [{
              colName: 'cart_goods_rec_no',
              ruleType: 'in',
              value: goodsInfo.cart_goods_rec_no
            }],
            data: [{
              goods_amount: goodsInfo.goods_amount
            }]
          }];
          await this.$fetch('update', serviceName, req, 'health').then(res => {
            if (res.success) {
              // this.getCartList();
              uni.showToast({
                title: '操作成功'
              });
            }
          });
        }
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
      toMore() {
        let url = `/publicPages/list2/list2?serviceName=srvhealth_store_goods_guest_select&destApp=health`
        let cond = [{
          "colName": "store_no",
          "ruleType": "eq",
          "value": this.storeNo
        }, {
          "colName": "online_state",
          "ruleType": "eq",
          "value": "上线"
        }]
        if (this.pageItem?.goods_classify_path) {
          cond.push({
            colName: 'goods_classify_path',
            ruleType: 'like]',
            value: this.pageItem?.goods_classify_path
          })
        }
        url += `&cond=${JSON.stringify(cond)}`
        uni.navigateTo({
          url
        })
      },
      getGoodsListData() {
        this.goodsList = []
        let req = {
          page: {
            rownumber: this.rownumber
          },
          condition: [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no || this.storeNo
            },
            {
              colName: "online_state",
              ruleType: 'eq',
              value: "上线"
            }
          ]
        };
        if (Array.isArray(this.pageItem?.more_config?.condition) && this.pageItem?.more_config?.condition.length >
          0) {
          req.condition = [...req.condition, ...this.pageItem?.more_config?.condition];
        }
        if (this.pageItem?.goods_classify_path) {
          req.condition.push({
            colName: 'goods_classify_path',
            ruleType: 'like]',
            value: this.pageItem?.goods_classify_path
          })
        }
        this.$fetch('select', 'srvhealth_store_goods_guest_select', req, 'health').then(res => {
          if (Array.isArray(res.data)) {
            if (res.page?.total) {
              this.total = res.page.total
            }
            if (Array.isArray(res.data)) {
              this.goodsList = res.data.reduce((pre, cur) => {
                let url = this.getImagePath(cur[this.image], true);
                cur.url = url;
                if (cur[this.image]) {
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
                pre.push(cur)
                return pre
              }, []);
              console.log(this.goodsList)
            }
          }
        });
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(350);
        content.h = (maxW * content.h) / content.w;
        content.w = maxW;
        return content;
      },
      toGoodsDetail(e) {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        if (e.goods_no) {
          let url = `/storePages/GoodsDetail/GoodsDetail?goods_no=${ e.goods_no}`
          if (this.storeInfo?.telephone) {
            url += `&phone=${this.storeInfo?.telephone}`
          }
          if (this.storeInfo?.store_no) {
            url += `&storeNo=${this.storeInfo?.store_no}`
          }
          if (this.storeInfo?.wx_mch_id) {
            url += `&wxMchId=${this.storeInfo?.wx_mch_id}`
          }
          uni.navigateTo({
            url: url
          });
        }
      }
    },
    props: {
      // storeInfo: {
      //   type: Object
      // },
      storeNo: {
        type: String
      },
      list: {
        type: Array
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
      pageItem: {
        type: Object
      }
    }
  };
</script>

<style scoped lang="scss">
  .title {
    padding: 20rpx;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-family: 苹方-简;
    font-weight: normal;
    color: #474849;

    .to-more {
      font-size: 14px;
      background-color: transparent;
    }
  }

  .goods-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0px 0px;
    min-width: 300px;
    justify-content: space-between;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }
  }

  .goods-item {
    border-radius: 10px;
    overflow: hidden;
    background-color: #fff;
    break-inside: avoid;
    margin-top: 20rpx;
    // width: calc(50% - 20rpx);
    min-width: 45%;
    flex: 1;
    max-width: calc(50% - 10rpx);
    margin-right: 20rpx;

    // margin-bottom: 20rpx;
    &:first-child,
    &:nth-child(2) {
      margin-top: 0;
    }

    &:nth-child(2n) {
      margin-right: 0;
    }
  }

  .goods-image {
    width: 100%;
    height: 300rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    border: 1px solid #fff;
  }

  .goods-info {
    padding: 10rpx;
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

      .hand-btn {
        background-color: #FDCA01;
        color: #fff;
        padding: 2px 5px;
        border-radius: 5px;

        &.round {
          padding: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          text-align: center;
          line-height: 20px;
          font-size: 18px;
        }
      }

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
</style>
