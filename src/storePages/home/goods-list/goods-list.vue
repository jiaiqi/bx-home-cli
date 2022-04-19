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
      <view class="goods-item" v-for="(item,index) in goodsList" :key="index">
        <goods-item :goods="item" :image="image" :name="name" :desc="desc" :price="price" :originPrice="originPrice"
          :salesVolume="salesVolume" :viewingCount="viewingCount" :enableAddCart="enableAddCart"
          @to-etail="toGoodsDetail" @addSku2Cart="addSku2Cart" @toCart="toCart" @minus="delFromCart">
        </goods-item>
      </view>
    </view>

    <goods-cart :cartData="cartData" margin="0" :fixed="true" :fold="true" bottom="50px" :list_config="list_config"
      @changeAmount="changeAmount" @clear="clearCart" v-if="enableAddCart"></goods-cart>

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
  import goodsItem from './goods-item.vue'
  export default {
    name: 'good-list',
    components: {
      goodsItem
    },
    computed: {
      enableAddCart() {
        return this.pageItem?.more_config?.enableAddCart ? true : false
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
      cartTotal(){
        let res = 0
        if(Array.isArray(this.cartData)){
          res = this.cartData.reduce((res,cur)=>{
            if(!isNaN(Number(cur.goods_amount))){
              res+=cur.goods_amount
            }
            return res
          },0)
        }
        return res
      },
      hasMore() {
        return this.total > this.rownumber
      },
    },
    data() {
      return {
        cartMode: "default",
        cartData: [],
        list_config: {
          "bg": "",
          "lp_style": "宫格",
          "grid_span": "3",
          "padding": "0",
          "btn_cfg": {
            "show_custom_btn": true,
            "show_public_btn": false,
            "show": true,
            "bg_style": "line",
            "bg": "#FFEEDE",
            "color": "#F3A250",
            "font_size": "18px",
            "radius": "10px",
            "size": "sm",
            "padding": "0 10rpx"
          },
          "img": {
            "col": "goods_image",
            "cfg": {
              "width": "100%",
              "height": "150rpx",
              "radius": "10px 10px 0 0",
              "position": "top",
              "mode": "",
              "padding": "",
              "margin": ""
            }
          },
          "cols": [{
            "col": "goods_name",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#333",
              "width": "100%",
              "font_size": "14px",
              "padding": "0 20rpx",
              "white_space": "initial"
            }
          }, {
            "col": "unit_price",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#F3A250",
              "width": "100%",
              "font_size": "14px",
              "padding": "0 20rpx",
              "prefix": "￥"
            }
          }]
        },
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
    created() {
      uni.$on('goods-cart-change',()=>{
         this.getGoodsListData()
      })
    	// this.getGoodsListData()
    },
    beforeDestroy(){
      uni.$off('goods-cart-change')
    },
    methods: {
      clearCart(e) {

      },
      changeAmount(data) {
        if (data && data.row && typeof data.index === 'number') {
          this.$set(this.cartData, data.index, data.row)
          if (data.row.goods_count === 0) {
            this.cartData.splice(data.index, 1)
          }
        }
      },
      toOrderPage(e) {

      },
      del(e) {

      },
      selectAllChange(e) {

        if (e) {
          this.list = this.list.map(item => {
            item.checked = true
            return item
          })
        } else {
          this.list = this.list.map(item => {
            item.checked = false
            return item
          })
        }

      },
      async addSku2Cart(e) {
        // 添加到购物车
        if(this.cartTotal>=99){
          uni.showToast({
            title:'购物车商品总数超出限制,请先清理购物车后在进行加购',
            icon:"none"
          })
          return
        }
        let {
          modalConfirmType,
          skuAttrList,
          goods,
          otherGoods
        } = e
        if (!modalConfirmType || !e || !goods) {
          return
        }
        let service = 'srvhealth_store_shopping_cart_goods_detail_add';
        let childService = "srvhealth_store_shopping_cart_goods_attr_value_add"
        let depend_key = 'cart_goods_rec_no'
        
        if (goods?.sku_no) {
          let goodsInfo = await this.getCartDetail(goods.sku_no);
          if (goodsInfo?.goods_no) {
            goodsInfo.goods_amount += goods.goods_amount
            this.updateCart(goodsInfo)
            return
          }
          let data = {
            store_user_no: this.vstoreUser?.store_user_no,
            store_no: this.storeNo,
            unit_price: goods.price,
            goods_amount: this.goodsInfo?.goods_amount || 1,
            goods_no: goods.goods_no,
            sum_price: goods.price,
            goods_desc: goods.goods_desc,
            goods_image: goods.goods_img,
            goods_name: goods.goods_name,
            goods_type:goods.goods_type,
            goods_source: '店铺SKU',
            child_data_list: [{
              "serviceName": childService,
              "condition": [],
              "depend_keys": [{
                "type": "column",
                "add_col": depend_key,
                "depend_key": depend_key
              }],
              "data": skuAttrList
            }]
          }

          if (goods.sku_no) {
            data.father_goods_no = data.goods_no
            data.goods_no = goods.sku_no
          }

          let req = [{
            serviceName: service,
            condition: [],
            data: [data, ...otherGoods]
          }];
          
          let res = await this.$fetch('operate', service, req, 'health');
          if (res.success) {
            // this.getCartList();
            uni.showToast({
              title: '添加成功'
            });
            this.getGoodsListData()
            this.$emit('added')
          } else {
            return
          }
        }

      },
      changeModalConfirmType(e) {
        this.modalConfirmType = 'all'
        this.modalName = e
      },
      changeModal(e = '') {
        this.modalName = e
      },
      delFromCart(e) {
        if (e.enable_sku === '是') {
          uni.showModal({
            title: '提示',
            content: '不同规格的商品需要在购物车减购，是否跳转到购物车页面？',
            confirmText: '打开购物车',
            success: (res) => {
              if (res.confirm) {
                let url =
                  `/publicPages/list2/list2?pageType=list&serviceName=srvhealth_store_my_shopping_cart_goods_detail_select&disabled=true&destApp=health&listType=cartList&cond=[{"colName":"store_no","ruleType":"eq","value":"${this.storeInfo?.store_no}"},{"colName":"store_user_no","ruleType":"eq","value":"${this.vstoreUser?.store_user_no}"}]&detailType=custom&customDetailUrl=/`
                uni.navigateTo({
                  url: url
                })
              }
            }
          })
        } else if (e?.goods_amount) {
          let goodsInfo = this.deepClone(e);
          this.toCart(e, 'minus')
        }
      },
      toCart(e, type) {
        if (e) {
          let goodsInfo = this.deepClone(e);
          if (['面额卡', '套餐卡', '提货卡', '线下服务', '在线服务', '想豆卡', '充值卡'].includes(goodsInfo?.goods_type)) {
            uni.showToast({
              title: '非实物商品不支持加入购物车~',
              icon: 'none'
            })
            return
          }
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
          if (type == 'minus') {
            goodsInfo.car_num = goodsInfo.goods_amount - 1
          }
          if(this.cartTotal>=99){
            uni.showToast({
              title:'购物车商品总数超出限制,请先清理购物车后在进行加购',
              icon:"none"
            })
            return
          }
          if (isNaN(Number(goodsInfo.car_num)) || goodsInfo.car_num < 0) {
            return
          }
          // 从购物车表添加/删除
          this.addToCart(goodsInfo, type).then(_ => {
            this.onHandler = false;
          });

        }
      },
      async getCartDetail(goods_no) {
        let service = 'srvhealth_store_shopping_cart_goods_detail_select';
        let req = {
          serviceName: service,
          colNames: ['*'],
          condition: [],
          page: {
            pageNo: 1,
            rownumber: 99
          }
        };
        if (goods_no) {
          // req.condition = [{
          //   colName: 'goods_no',
          //   ruleType: 'in',
          //   value: goods_no
          // }];
          req.relation_condition = {
            "relation": "OR",
            "data": [{
                "colName": "goods_no",
                "value": goods_no,
                "ruleType": "in"
              },
              {

                "colName": "father_goods_no",
                ruleType: 'in',
                value: goods_no
              }
            ]
          }
        }
        if (this.vstoreUser?.store_user_no) {
          req.condition.push({
            colName: 'store_user_no',
            ruleType: 'eq',
            value: this.vstoreUser?.store_user_no
          });
        }else{
          return
        }
        let res = await this.$fetch('select', service, req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          if (goods_no && goods_no.indexOf(',') == -1) {
            return res.data[0];
          }
          return res.data;
        }
      },
      async addToCart(goods, type) {
        if (goods?.goods_no) {
          let goodsInfo = await this.getCartDetail(goods.goods_no);
          if (goodsInfo?.goods_no) {
            if (type == 'minus') {
              goodsInfo.goods_amount--;
            } else {
              goodsInfo.goods_amount++;
            }
            let operateType = goodsInfo.goods_amount === 0 ? 'delete' : 'update'
            this.updateCart(goodsInfo, operateType)
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
                goods_amount: goodsInfo.goods_amount || 1,
                goods_no: goods.goods_no,
                goods_type: goods.goods_type,
                sum_price: goods.price,
                goods_desc: goods.goods_desc,
                goods_image: goods.goods_img,
                goods_name: goods.goods_name
              }]
            }];
            let res = await this.$fetch('operate', service, req, 'health');
            if (res.success) {
              if (type !== 'minus') {
                uni.showToast({
                  title: '添加成功'
                });
                this.getGoodsListData()
              }
            }
          }
        }
        return;
      },
      async updateCart(goodsInfo, type = 'update') {
        let serviceName = 'srvhealth_store_shopping_cart_goods_detail_update';
        if (type === 'update' && this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        } else if (type === 'delete') {
          serviceName = 'srvhealth_store_shopping_cart_goods_detail_delete'
        }
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
          if (type === 'delete') {
            delete req.data;
            req.condition = [{
              colName: 'id',
              ruleType: 'req',
              value: goodsInfo.id
            }]
          }
          uni.showLoading()
          let res = await this.$fetch('operate', serviceName, req, 'health')
          uni.hideLoading()
          if (res.success) {
            uni.showToast({
              title: '操作成功'
            });
            this.getGoodsListData()
          }
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
      async getGoodsListData() {
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

        let res = await this.$fetch('select', 'srvhealth_store_goods_guest_select', req, 'health')
        if (Array.isArray(res.data)) {
          if (res.page?.total) {
            this.total = res.page.total
          }
          if (Array.isArray(res.data)) {
            let goodsNos = res.data.map(item => {
              if (item.father_goods_no) {
                return item.father_goods_no
              } else {
                return item.goods_no
              }
            }).toString()

            if (goodsNos) {
              let cartList = await this.getCartDetail(goodsNos)
              this.cartData = cartList
              if (Array.isArray(cartList) && cartList.length > 0) {
                res.data = res.data.map(item => {
                  let cartData = cartList.filter(e => e.goods_no && (e.goods_no === item.goods_no || e
                    .father_goods_no === item.goods_no))
                  if (Array.isArray(cartData) && cartData.length > 0) {
                    item.goods_amount = cartData.reduce((res, cur) => {
                      if (cur?.goods_amount) {
                        res += cur?.goods_amount
                      }
                      return res
                    }, 0)
                  }
                  if (cartData?.goods_no) {
                    item.goods_amount = cartData?.goods_amount
                  }
                  return item
                })
              }
            }
            this.goodsList = res.data.reduce((pre, cur) => {
              let url = this.getImagePath(cur[this.image], true);
              if (cur.enable_sku === '是') {
                cur.goods_sku_amount = cur.goods_amount // 商品在购物车中的数量
                cur.goods_amount = 1
              }
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
  .goods-list-wrap {
    .cart-list-wrap {
      border-top: 1px solid #f1f1f1;
      border-bottom: 1px solid #f1f1f1;
      width: 100vw;
      left: 0;
      margin: 0;
      border-radius: 0;
    }
  }

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
    // overflow: hidden;
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

  // .goods-image {
  //   width: 100%;
  //   height: 300rpx;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   font-size: 20px;
  //   font-weight: bold;
  //   border: 1px solid #fff;
  // }

  // .goods-info {
  //   padding: 10rpx;
  //   width: 100%;
  //   margin-top: 5px;
  //   font-size: 16px;

  //   .desc {
  //     font-size: 12px;
  //     color: #aaa;
  //     margin-top: 5px;
  //     word-break: break-all;
  //     display: -webkit-box;
  //     -webkit-line-clamp: 2;
  //     /**指定行数*/
  //     -webkit-box-orient: vertical;
  //     overflow: hidden;
  //   }

  //   .price {
  //     display: flex;
  //     align-items: center;
  //     justify-content: space-between;
  //     font-size: 12px;

  //     .hand-btn {
  //       background-color: #FDCA01;
  //       color: #fff;
  //       padding: 2px 5px;
  //       border-radius: 5px;

  //       &.round {
  //         padding: 0;
  //         width: 20px;
  //         height: 20px;
  //         border-radius: 50%;
  //         text-align: center;
  //         line-height: 20px;
  //         font-size: 18px;
  //       }
  //     }

  //     .symbol {
  //       font-size: 12px;
  //     }

  //     .number {
  //       font-size: 20px;
  //     }

  //     .line-through {
  //       position: relative;
  //       color: #666;
  //       font-size: 18px;

  //       .number {
  //         font-size: 18px;
  //       }

  //       &::after {
  //         content: '';
  //         width: 100%;
  //         height: 2px;
  //         top: 50%;
  //         background-color: #666;
  //         position: absolute;
  //         left: 0;
  //       }
  //     }


  //   }

  //   .data-display {
  //     display: flex;
  //     justify-content: space-between;
  //     align-items: center;
  //     font-size: 12px;
  //     color: #999;
  //     padding: 5px;
  //   }
  // }



  // .goods-name {
  //   text-align: left;
  // }
</style>
