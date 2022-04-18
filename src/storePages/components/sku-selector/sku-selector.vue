<template>
  <view class="cu-modal bottom-modal" :class="{show:show==true}" @click="close()" v-if="goodsInfo">
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
            <u-number-box v-model="goods.goods_amount" :min="1"></u-number-box>
          </view>
        </view>
        <view class="button-box" v-if="modalConfirmType==='all'">
          <button class="cu-btn round lg bg-red flex-1 margin-right-xs" @click="confirm('addToCart')">加入购物车</button>
          <button class="cu-btn round lg bg-orange flex-1" @click="confirm('toOrder')">立即购买</button>
        </view>
        <view class="button-box" v-else>
          <button class="cu-btn round lg bg-red" @click="confirm()">确定</button>
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
          <button class="cu-btn round lg bg-red flex-1" @click="confirm('addToCart')">加入购物车</button>
          <button class="cu-btn round lg bg-orange flex-1" @click="confirm('toOrder')">立即购买</button>
        </view>
        <view class="button-box" v-else>
          <button class="cu-btn round lg bg-red" @click="confirm()">确定</button>
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
        selectOptions: [],
        goodsSkuInfo: {},
        goodsAttrList: [],
        selectedAttrs: {},
        // modalConfirmType: "", // 确认类型  toOrder,addToCart,all
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
      modalConfirmType:{
        type:String
      }
    },
    created() {
      // this.init()
    },
    methods: {
     async init() {
        let enable_sku = this.goodsInfo?.enable_sku;
        let options_type = this.goodsInfo?.options_type
        if (enable_sku === '是') {
         await this.getRelationGoods()
          if (options_type == 'SKU商品') {
          await  this.getGoodsSkuInfo()
          } else if (options_type == '商品属性') {
           await this.getGoodsAttr()
          }
        }
      },
      async open() {
        await this.init()
        this.show = true
        this.$emit('open')
      },
      close(isClearSku=false) {
        this.show = false;
        this.$emit('close')
        if(isClearSku===true){
          this.selectedAttrs = {}
        }
      },
      async confirm(modalConfirmType) {
        modalConfirmType = modalConfirmType || this.modalConfirmType
        let goods = {}
        let skuAttrList = []
        if (this.optionsType === '商品属性') {
          let unSelectRequired = this.goodsAttrList.find(item => !item.radioSelected && item.is_required ===
            '是')
          if (unSelectRequired?.good_attr_name) {
            uni.showToast({
              title: `请选择${unSelectRequired?.good_attr_name}`,
              icon: 'none'
            })
            return
          }
          this.selectOptions = this.goodsAttrList.filter(item => item.effect_price === '是' || item
            .effect_stock == '是').map(item => {
            let selectItem = item.goods_attr_values.find(option => option.good_attr_value_no ===
              item.radioSelected)
            item.good_attr_value_no = selectItem?.good_attr_value_no
            item.good_attr_value = selectItem?.good_attr_value
            return item
          })
          goods = await this.getRealGoodsByAttr()
          skuAttrList = this.goodsAttrList.filter(item => item.radioSelected).map(item => {
            let good_attr = item.goods_attr_values.find(option => option.good_attr_value_no ===
              item
              .radioSelected)
            let obj = {
              good_attr_no: item.good_attr_no,
              good_attr_name: item.good_attr_name,
              good_attr_value_no: good_attr.good_attr_value_no,
              good_attr_value: good_attr.good_attr_value
            }
            return obj
          })
        } else {
          goods = this.goodsSkuInfo.skuGoodsDatas.find(item => item.sku_no === this.goodsSkuInfo
            .radioSelected)
          if (!goods) {
            // 未选择商品规格
            uni.showToast({
              title: `请选择商品规格`,
              icon: 'none'
            })
          }

          let unSelectRequired = this.goodsSkuInfo.skuGoodsAttr.find(item => !item.radioSelected && item
            .is_required === '是')
          if (unSelectRequired?.good_attr_name) {
            // 未选择属性
            uni.showToast({
              title: `请选择${unSelectRequired?.good_attr_name}`,
              icon: 'none'
            })
            return
          }

          skuAttrList = this.goodsSkuInfo.skuGoodsAttr.filter(item => item.radioSelected).map(item => {
            let good_attr = item.goods_attr_values.find(option => option.good_attr_value_no ===
              item
              .radioSelected)
            let obj = {
              good_attr_no: item.good_attr_no,
              good_attr_name: item.good_attr_name,
              good_attr_value_no: good_attr.good_attr_value_no,
              good_attr_value: good_attr.good_attr_value
            }
            return obj
          })
        }
        
        // 相关商品
        let otherGoods = this.relationGoods.filter(item => item.goods_amount > 0)
        if (Array.isArray(otherGoods) && otherGoods.length > 0) {
          otherGoods = otherGoods.map(item => {
            let obj = {
              store_no: this.storeInfo?.store_no,
              unit_price: item.price,
              goods_amount: item?.goods_amount || 1,
              goods_no: item.goods_no,
              sum_price: item.price * item.goods_amount,
              goods_desc: item.goods_desc,
              goods_image: item.goods_img,
              goods_name: item.goods_name,
              store_user_no: this.vstoreUser?.store_user_no,
              // name :item.goods_name,
              // car_num :item?.goods_amount || 1
            }
            return obj
          })
        }
        
        this.$emit('confirm',{
          goods,
          skuAttrList,
          modalConfirmType,
          otherGoods
        })
        this.close()
      },
      async radioChange(selected = '', item = {}) {
        if (this.optionsType === '商品属性' && item.effect_stock !== '是' && item.effect_price !== '是') {
          return
        }
        if (!selected) {
          return
        }
        if (this.optionsType === 'SKU商品') {
          if (Array.isArray(item.skuGoodsDatas) && item.skuGoodsDatas.length > 0) {
            let selectAttr = item.skuGoodsDatas.find(o => o.sku_no === selected)
            if (selectAttr?.sku_no) {
              this.selectedAttrs.selectSku = selectAttr
              this.selectSku = selectAttr
            }
          }
        } else if (this.optionsType === '商品属性') {
          if (Array.isArray(item.goods_attr_values) && item.goods_attr_values.length > 0) {
            let selectAttr = item.goods_attr_values.find(o => o.good_attr_value_no === selected)
            if (selectAttr?.good_attr_value_no) {
              this.selectedAttrs[item.good_attr_no] = {
                info: item,
                attr: selectAttr
              }
              let selectOptions = Object.keys(this.selectedAttrs).filter(key => key !== 'selectSku')
                .filter(key => {
                  let item = this.selectedAttrs[key]
                  if (item.info?.effect_price === '是' || item.info?.effect_stock == '是') {
                    return true
                  }
                }).map(
                  key => {
                    let obj = this.selectedAttrs[key].attr
                    return obj
                  })
              let res = await this.getRealGoodsByAttr(selectOptions, false)
              this.selectedAttrs.selectSku = res || false
              this.selectSku = res || false
            }
          }
        }
      },
      async getRelationGoods() {
        // 查找相关商品
        const serviceName = 'srvhealth_store_package_goods_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            "colName": "superior_goods_no",
            "ruleType": "eq",
            "value": this.goodsInfo?.goods_no
          }, {
            "colName": "online_state",
            "ruleType": "eq",
            "value": "上线"
          }]
        }
        let app = this.destApp || 'health';
        let res = await this.$fetch('select', serviceName, req, app)
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.relationGoods = res.data.map(item => {
            item.goods_amount = 0;
            return item
          })
        } else {
          this.relationGoods = []
        }
      },
      async getGoodsSkuInfo() {
        const serviceName = 'srvhealth_store_goods_sku_guest_select'
        let req = {
          "serviceName": serviceName,
          "colNames": [
            "*"
          ],
          "condition": [{
            "colName": "goods_no",
            "ruleType": "eq",
            "value": this.goodsInfo?.goods_no
          }]
        }
        let app = this.destApp || 'health';
        let res = await this.$fetch('select', serviceName, req, app)
        // .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          let data = res.data[0];
          if (Array.isArray(data?.skuGoodsAttr) && data.skuGoodsAttr.length > 0) {
            data.skuGoodsAttr = data.skuGoodsAttr.map(item => {
              item.radioSelected = ''
              if (item.is_required === '是' && Array.isArray(item.goods_attr_values) && item
                .goods_attr_values.length > 0) {
                item.radioSelected = item.goods_attr_values[0].good_attr_value_no
                this.selectedAttrs[item.good_attr_no] = {
                  info: item,
                  attr: item.goods_attr_values[0]
                }
              }

              return item
            })
          }
          if (Array.isArray(data?.skuGoodsDatas) && data.skuGoodsDatas.length > 0) {
            data.radioSelected = data.skuGoodsDatas[0].sku_no
            this.selectedAttrs.selectSku = data.skuGoodsDatas[0]
            this.selectSku = data.skuGoodsDatas[0]
            this.$emit('selected', this.selectSku)
          }
          data.goods_amount = 1
          this.goodsSkuInfo = data
        } else {
          this.goodsSkuInfo = {}
        }
        // });
      },
      async getRealGoodsByAttr(selectOptions, showXhrMsg = true) {
        selectOptions = selectOptions || this.selectOptions
        const serviceName = 'srvhealth_store_sku_goods_byattr_guest_select'
        const req = {
          "serviceName": serviceName,
          "colNames": [
            "*"
          ],
          "condition": [{
            "colName": "goods_no",
            "ruleType": "eq",
            "value": this.goodsInfo?.goods_no
          }]
        }
        if (Array.isArray(selectOptions) && selectOptions.length > 0) {
          let conds = []
          selectOptions.forEach(item => {
            let obj = {
              "colName": item.good_attr_no,
              "ruleType": "eq",
              "value": item.good_attr_value
            }
            conds.push(obj)
          })
          req.condition = [...req.condition, ...conds]
        } else {
          return
        }
        let app = this.destApp || 'health';
        let res = await this.$fetch('select', serviceName, req, app)
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data[0].goods_amount = this.goodsInfo.goods_amount
          return res.data[0]
        } else if (res.msg && showXhrMsg) {
          uni.showToast({
            title: res.msg,
            icon: 'none'
          })
          return
        }
      },
      async getGoodsAttr() {
        const serviceName = 'srvhealth_store_goods_attr_guest_select'
        let req = {
          "serviceName": serviceName,
          "colNames": [
            "*"
          ],
          "condition": [{
            "colName": "goods_no",
            "ruleType": "eq",
            "value": this.goodsInfo?.goods_no
          }]
        }
        let app = this.destApp || 'health';
        let res = await this.$fetch('select', serviceName, req, app)
        // .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.goodsAttrList = res.data.map(item => {
            item.radioSelected = ''
            if (item.is_required === '是' && Array.isArray(item.goods_attr_values) && item
              .goods_attr_values.length > 0) {
              item.radioSelected = item.goods_attr_values[0].good_attr_value_no
              // if (item.effect_price === '是' || item.effect_stock == '是') {
              this.selectedAttrs[item.good_attr_no] = {
                info: item,
                attr: item.goods_attr_values[0]
              }
              // }
            }
            return item
          })
          let selectOptions = this.goodsAttrList.filter(item => item.effect_price === '是' || item
            .effect_stock == '是').map(item => {
            let selectItem = item.goods_attr_values.find(option => option.good_attr_value_no ===
              item.radioSelected)
            item.good_attr_value_no = selectItem?.good_attr_value_no
            item.good_attr_value = selectItem?.good_attr_value

            return item
          })
          this.selectedAttrs.selectSku = await this.getRealGoodsByAttr(selectOptions, false) || {}
          this.selectSku = this.selectedAttrs.selectSku
          this.$emit('selected', this.selectSku)
        } else {
          this.goodsAttrList = []
        }
        // });
      },

    },
  }
</script>

<style lang="scss" scoped>
  .modal-content {
    padding: 10px;
    background-color: #fff;

    .selected-sku {
      display: flex;
      padding: 0 10px;

      .goods-icon {
        width: 80px;
        height: 80px;
        border-radius: 5px;
      }

      .selected-sku-attr {
        padding: 0 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;

        .goods-name {
          font-size: 16px;
        }
      }
    }

    .sku-goods-datas {
      padding: 10px;

      .label {
        text-align: left;
      }

      .option-list {
        margin-bottom: 10px;
      }
    }

    .number-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }

    .relation-goods {
      padding: 10px;

      .title {
        text-align: left;
      }

      .goods-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 5px;

        .goods-icon {
          width: 50px;
          height: 50px;
          border-radius: 5px;
        }

        .goods-name {
          flex: 1;
          padding: 0 10px;
          text-align: left;
        }
      }
    }

    .button-box {
      text-align: center;
      padding: 10px;
      margin-top: 20px;

      .cu-btn {
        width: 90%;

        &.flex-1 {
          width: 45%;
        }
      }
    }

  }
  .cu-modal.bottom-modal{
    display: block;
    z-index: 1100;
  }
</style>
