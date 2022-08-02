<template>
  <bx-auth @auth-complete="initPage" v-if="showAuth"></bx-auth>
  <view class="goods-detail-wrap" v-else>
    <cu-custom-navbar :isBack="true" :back-home="showBackHome" :custom-store-no="setStoreNo">
      <view class="nav-bar">
        <text class="home-name">
          <text>{{pageTitle}}</text>
        </text>
      </view>
    </cu-custom-navbar>
    <swiper class="screen-swiper main-image square-dot" easing-function="linear" :indicator-dots="true" :circular="true"
      :autoplay="true" interval="5000" duration="500" @change="swiperChange"
      :style="{ height: imgHeight ? imgHeight + 'px' : '' }">
      <swiper-item v-for="(item, index) in swiperList" :key="item.url">
        <video :src="item.url" controls v-if="item.file_type === '视频' && current === index" :id="item.store_video_file"
          :poster="item.videoPoster" @click.stop=""></video>
        <image lazy-load :src="item.url" :lazy-load="true" mode="aspectFill" @click.stop="toPreviewImage(item.url)"
          v-else-if="!item.store_video_file || item.file_type !== '视频'"></image>
      </swiper-item>
    </swiper>
    <view class="share-banner" v-if="showShareBanner&&shareBonus" @click="changeModal('showShareTips')">
      <image src="../static/bonus.png" mode="aspectFill" style="width: 30px;height: 30px;" class="margin-right-xs">
      </image> 分享赚￥<text class="text-lg text-bold">{{shareBonus}}</text>
    </view>
    <view class="goods-info" v-if="goodsInfo">
      <view class="goods-name">{{ goodsInfo.goods_name || '' }}</view>
      <view class="handler-bar margin-top-xs">
        <view class="" style="display: flex;">
          <view class="price text-red  margin-right" v-if="showPrice && fill2Digit(goodsInfo.price)">
            <text class="symbol">￥</text>
            <text v-if="goodsInfo.min_sku_price&&goodsInfo.price_interval">
              <text>{{goodsInfo.min_sku_price}}</text>
              <text>-</text>
              <text>{{goodsInfo.price_interval}}</text>
            </text>
            <text class="number" v-else-if="fill2Digit(goodsInfo.price)">
              <text class="int">{{ fill2Digit(goodsInfo.price)[0] }}.</text>
              <text class="float">{{ fill2Digit(goodsInfo.price)[1] }}</text>
            </text>
          </view>
          <view class="price text-red  margin-right " style="align-items: flex-end;"
            v-if="goodsInfo.origin_price&&showPrice && fill2Digit(goodsInfo.origin_price)">
            <text class="number line-through" v-if="fill2Digit(goodsInfo.origin_price)">
              <text class="int"><text class="symbol">￥</text>{{ fill2Digit(goodsInfo.origin_price)[0] }}.</text>
              <text class="float">{{ fill2Digit(goodsInfo.origin_price)[1] }}</text>
            </text>
          </view>
        </view>
        <view class="number-box" v-if="inCartGoodsInfo && inCartGoodsInfo.goods_amount&&!enableSku">
          <view class="cu-btn sm radius cart-handler" @click.stop="del">-</view>
          <view class="goods-amount flex-1 text-center" style="width: 50px;text-align: center;font-size: 16px;">
            {{ inCartGoodsInfo.goods_amount || '' }}
          </view>
          <view class=" cu-btn sm radius cart-handler" @click.stop="add">+</view>
        </view>
      </view>
    </view>
    <view class="selected-sku-info" v-if="goodsInfo&&enableSku" @click="changeModalConfirmType('option-selector')">
      <view class="label margin-right-xl">
        <text v-if="selectSku&&selectSku.sku_no">已选:</text>
        <text v-else>请选择</text>
      </view>
      <view class="content" v-if="selectSku">
        {{selectSku.goods_name||''}}
        <text v-if="goodsInfo&&goodsInfo.goods_amount">,{{goodsInfo.goods_amount}}件</text>
      </view>
      <view class="icon">
        <text class="cuIcon-more"></text>
      </view>
    </view>
    <view class="desc" v-if="goodsInfo&&goodsInfo.goods_desc">
      <view class="title">
        <text>商品详情</text>
        <view class="data-display">
          <view class="disp-item" v-if="goodsInfo['sales_volume']">
            销量：{{goodsInfo['sales_volume']||''}}
          </view>
          <view class="disp-item" v-if="goodsInfo['viewing_count']">
            浏览量：{{goodsInfo['viewing_count']||''}}
          </view>
        </view>
      </view>
      <view class="">{{ goodsInfo.goods_desc || '' }}</view>
    </view>
    <view class="store-info" v-if="goodsInfo&&storeInfo && storeInfo.store_no" @click="toStoreHome">
      <image lazy-load :src="getImagePath(storeInfo.logo, true)" class="store-icon" v-if="storeInfo.logo"
        mode="aspectFit"></image>
      <view :src="getImagePath(storeInfo.logo, true)" class="store-icon text" v-else-if="storeInfo.name">
        {{storeInfo.name.slice(0,1)}}
      </view>
      <view class="store-name">{{ storeInfo.name || '' }}</view>
      <view class="phoneCall" v-if="phone" @click.stop="phoneCall"><text class="cuIcon-phone text-cyan"></text>
      </view>
    </view>
    <evaluate-card :eval_show_way="goodsInfo.eval_show_way" :goods_no="goodsInfo.goods_no"
      v-if="goodsInfo&&goodsInfo.goods_no"></evaluate-card>
    <view class="detail" v-if="goodsInfo&&goodsDetailImage&&goodsDetailImage.length>0">
      <view class="title">图文详情</view>
      <view class="image-box">
        <image lazy-load :lazy-load="true" class="detail-img" :src="item.url" mode="aspectFill" :style="{
						width: item.imgWidth + 'px',
						height: item.imgHeight + 'px'
					}" v-for="item in goodsDetailImage" :key="item.url" @click="toPreviewImage(item.url)"></image>
      </view>
    </view>
    <view class="cu-bar foot bottom bg-white tabbar border shop" v-if="goodsInfo&&scene !== 1154">
      <view class="right-btn " v-if="moreConfig && moreConfig.button_list">
        <button class="cu-btn shadow-blur round"
          :class="{'bg-orange':!item.target_url||item.target_url==='place_order','bg-red':item.target_url==='add_to_cart'||item.type==='add_to_cart',}"
          @click="clickBtn(item)" v-for="(item,index) in moreConfig.button_list" :key="index">
          <text>{{ item.button_name }}</text>
        </button>
      </view>
      <view class="right-btn" v-else-if="buttonCfg&&(buttonCfg.left||buttonCfg.right)&&!hideButton">
        <view class="button-left" v-if="buttonCfg.left&&buttonCfg.left.length>0">
          <button class="cu-btn bg-white left  round" v-for="(item,index) in buttonCfg.left" :key="index"
            @click="clickBtn(item)">
            <text class="icon" :class="{
              'cuIcon-service':item.type=='message',
              'cuIcon-cart':item.type=='cart'
            }"></text>
            <text class="badge" v-if="item.type=='cart'&&cartAmount">{{cartAmount||''}}</text>
            <text class="label">{{ item.button_name }}</text>
          </button>
        </view>
        <view class="button-right" v-if="buttonCfg.right&&buttonCfg.right.length>0">
          <button class="cu-btn  shadow-blur round" v-for="(item,index) in buttonCfg.right"
            :class="{'bg-orange':item.type==='place_order','bg-red':item.type==='add_to_cart'}" :key="index"
            @click="clickBtn(item)">{{ item.button_name }}</button>
        </view>
      </view>
      <view class="right-btn" v-else-if="!hideButton">
        <button class="full bg-orange" @click="clickBtn">
          <text v-if="moreConfig && moreConfig.button_name">{{ moreConfig.button_name }}</text>
          <text v-else>立即购买</text>
        </button>
      </view>
    </view>
    <skuSelector ref="skuSelector" :goodsInfo="goodsInfo" :modalConfirmType="modalConfirmType"
      @confirm="confirmAdd2Cart" @selected="selectedSku" v-if="enableSku" />
    <view class="cu-modal bottom-modal" :class="{show:modalName==='showShareTips'}" @touchmove=""
      @click.stop.prevent="changeModal()">
      <view class="cu-dialog" @click.prevent.stop="">
        <view class="share-tips">
          <view class="title">
            分享赚￥{{shareBonus}}
          </view>
          <view class="content">
            邀请好友成功购买本商品，每单最高得<text class="text-orange">￥{{shareBonus}}</text>现金奖励
          </view>
          <view class="bottom-buttons">
            <!-- <button class="cu-btn bg-blue margin-right">
              分享到微信好友
            </button> -->
            <button class="cu-btn bg-blue" open-type="share">
              立即分享
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex';
  import {
    selectPersonInfo
  } from '@/common/api/login.js'
  import skuSelector from '../components/sku-selector/sku-selector.vue'
  import evaluateCard from '../components/evaluate-card.vue'
  export default {
    components: {
      skuSelector,
      evaluateCard
    },
    data() {
      return {
        current: 0,
        videoContext: {},
        goodsInfo: null,
        swiperList: [],
        goodsDetailImage: [],
        phone: '',
        wxMchId: '',
        storeNo: '',
        serviceName: '',
        destApp: '',
        hideButton: false,
        imgHeight: 0,
        cartList: [],
        onHandler: false,
        modalName: "",
        modalConfirmType: "", // 确认类型  toOrder,addToCart,all
        selectSku: null,
        relationGoods: [], //相关商品
        purchase_limit: 0, // 商品限购次数
        purchaseTimes: 0, //商品购买次数
        purchasedGoods: [], //商品购买记录
        group_price: "",
        pageType: "",
        dumpling_no: "", //团购编号
        showAuth: false
      };
    },

    computed: {
      setStoreNo() {
        return this.goodsInfo?.store_no || this.storeNo
      },
      pageTitle() {
        return this.goodsInfo?.goods_name || '商品详情'
      },
      showBackHome() {
        if (this.storeNo === "S0000000000") {
          return false
        } else {
          let pages = getCurrentPages();
          if (pages.length === 1) {
            return true
          }
        }
        // let status = this.storeInfo?.audit_status;
        // if (status) {
        //   if (['非公开', '仅本店', '双向隔离'].includes(status)) {
        //     return false;
        //   }
        //   return true;
        // }
      },
      showShareBanner() {
        return this?.vstoreUser?.store_user_no && this.userInfo?.nick_name && this.shareBonus
      },
      shareBonus() {
        // 分享后的奖金
        let res = 0
        if (this.showShareBanner && this.goodsInfo?.one_money_than && this.goodsInfo?.price) {
          let num = this.goodsInfo?.price * this.goodsInfo?.one_money_than
          if (num && !isNaN(Number(num))) {
            res = Number(num.toFixed(2))
          }
        }
        return res
      },
      showShareBanner() {
        if (this.storeInfo?.order_up && this.storeInfo?.order_up.indexOf('分享赚钱') !== -1) {
          return true
        }
      },
      cartAmount() {
        // 购物车数量
        let res = this.cartList.reduce((res, cur) => {
          if (cur.goods_amount) {
            res += cur.goods_amount
          }
          return res
        }, 0)
        if (res > 99) {
          res = '99+'
        }
        return res
      },
      onLimit() {
        // 已经到了商品购买限制次数
        return this.purchase_limit && this.purchase_limit <= this.purchaseTimes
      },
      enableSku() {
        return this.goodsInfo?.enable_sku === '是' ? true : false
      },
      optionsType() {
        return this.goodsInfo?.options_type
      },
      buttonCfg() {
        if (this.goodsInfo?.button_cfg) {
          let btns = this.goodsInfo?.button_cfg.split(',')
          let right = [{
              name: '加购物车',
              button_name: '加入购物车',
              target_url: "add_to_cart",
              type: "add_to_cart"
            },
            {
              name: '立即购买',
              button_name: '立即购买',
              type: "place_order"
            }
          ]
          let left = [{
              name: '客服咨询',
              button_name: '客服',
              type: 'message',
              icon: 'service',
              target_url: `/publicPages/chat/chat?type=机构用户客服&identity=客户&storeNo=${this.storeNo||this.storeInfo?.store_no}&store_user_no=${this.vstoreUser?.store_user_no}&goods_no=${this.goodsInfo.goods_no}`
            },
            {
              name: '购物车',
              button_name: '购物车',
              type: 'cart',
              target_url: `/publicPages/list2/list2?pageType=list&serviceName=srvhealth_store_my_shopping_cart_goods_detail_select&disabled=true&destApp=health&cond=[{"colName":"store_no","ruleType":"eq","value":"${this.storeNo||this.storeInfo?.store_no}"},{"colName":"store_user_no","ruleType":"eq","value":"${this.vstoreUser.store_user_no}"}]&detailType=custom&customDetailUrl=%252FstorePages%252FGoodsDetail%252FGoodsDetail%253Fgoods_no%253D%2524%257Bdata.goods_no%257D%2526storeNo%253D%2524%257BstoreInfo.store_no%257D&listType=cartList`
            }
          ]
          if (this.pageType === '秒杀') {
            right.splice(0, 1)
          }
          let obj = {
            left: left.filter(item => btns.includes(item.name)),
            right: right.filter(item => btns.includes(item.name))
          }
          return obj
          // buttons.filter(item => btns.includes(item.name))
        }
      },
      inCartGoodsInfo() {
        if (this.storeInfo?.store_no && Array.isArray(this.cartList) && this.goodsInfo?.goods_no) {
          let cartList = this.cartList;
          if (Array.isArray(cartList)) {
            let goodsInfo = cartList.filter(item => item.goods_no === this.goodsInfo.goods_no);
            if (goodsInfo.length > 0) {
              return goodsInfo.reduce((res, cur) => {
                let goods_amount = cur.goods_amount + res.goods_amount;
                res = this.deepClone(cur);
                res.goods_amount = goods_amount
                return res
              }, {
                goods_amount: 0
              });
            }
          }
        }
      },
      showPrice() {
        return this.moreConfig?.show_price === false ? false : true;
      },
      moreConfig() {
        if (this.goodsInfo?.more_config) {
          let result = '';
          try {
            result = JSON.parse(this.goodsInfo.more_config);
          } catch (e) {
            //TODO handle the exception
          }
          return result;
        }
      },
      ...mapState({
        cartInfo: state => state.order.cartInfo,
        userInfo: state => state.user.userInfo
      })
    },
    methods: {
      async initPage() {
        await selectPersonInfo(null,true)
        // await this.initApp()
        this.showAuth = false
      },
      changeModalConfirmType(e) {
        this.modalConfirmType = 'all'
        this.modalName = e
        this.$refs?.skuSelector?.open?.('all')
      },
      changeModal(e = '') {
        this.modalName = e
        if (e === 'option-selector') {
          this.$refs?.skuSelector?.open?.()
        }
      },
      toStoreHome() {
        if (this.storeInfo?.store_no) {
          uni.navigateTo({
            url: `/storePages/home/home?store_no=${this.storeInfo.store_no}`
          })
        }

      },
      getCartList() {
        let req = {
          serviceName: 'srvhealth_store_my_shopping_cart_goods_detail_select',
          colNames: ['*'],
          condition: [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            },
            {
              colName: 'store_user_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_user_no
            }
          ],
          page: {
            rownumber: 200,
            pageNo: 1
          }
        };
        let url = this.getServiceUrl('health', 'srvhealth_store_my_shopping_cart_goods_detail_select', 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            this.cartList = res.data.data;
          }
        });
      },
      swiperChange(e) {
        if (this.videoContext.parse) {
          this.videoContext.parse();
        }
        this.current = e.detail.current;
        if (this.swiperList[this.current].file_type === '视频') {
          this.videoContext = uni.createVideoContext(this.swiperList[this.current].store_video_file, this);
        }
      },
      async getStoreInfo() {
        let req = {
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }],
          page: {
            pageNo: 1,
            rownumber: 1
          }
        };
        let service = 'srvhealth_store_list_select';
        service = 'srvhealth_store_cus_niming_detail_select'
        let app = 'health';
        let res = await this.$fetch('select', service, req, app);
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.$store.commit('setStateAttr', {
            key: 'storeInfo',
            val: res.data[0]
          });

        } else {
          uni.showModal({
            title: '未查找到机构信息',
            content: `${res ? JSON.stringify(res) : ''}  storeNo为${this.storeNo}`,
            showCancel: false
          });
        }
      },
      phoneCall() {
        uni.makePhoneCall({
          phoneNumber: this.phone || '10086' //仅为示例
        });
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

        if (this.placeInfo?.place_no) {
          // 扫码带桌号进入 只查当前桌号的购物车
          req.condition.push({
            colName: 'service_place_no',
            ruleType: 'eq',
            value: this.placeInfo?.place_no
          })
        } else if (this.vstoreUser?.store_user_no) {
          // 其他情况 查当前登录用户的购物车
          req.condition.push({
            colName: 'store_user_no',
            ruleType: 'eq',
            value: this.vstoreUser?.store_user_no
          });
        } else {
          return
        }

        let res = await this.$fetch('select', service, req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          if (goods_no) {
            return res.data[0];
          }
          return res.data;
        }
      },

      selectedSku(e) {
        this.selectSku = e
      },
      async confirmAdd2Cart(e = {}) {
        // if (this.purchase_limit && this.goodsInfo?.goods_amount >= this.purchase_limit) {
        //   uni.showModal({
        //     title: "提示",
        //     content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
        //     showCancel: false,
        //     confirmText: '知道了'
        //   })
        //   return
        // }
        if (this.cartAmount >= 99) {
          uni.showToast({
            title: '购物车商品总数超出限制,请先清理购物车后在进行加购',
            icon: "none"
          })
          return
        }
        let {
          modalConfirmType,
          skuAttrList,
          goods,
          otherGoods = []
        } = e
        if (!modalConfirmType || !e || !goods) {
          return
        }
        this.modalConfirmType = modalConfirmType
        if (this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }

        let service = 'srvhealth_store_shopping_cart_goods_detail_add';
        let childService = "srvhealth_store_shopping_cart_goods_attr_value_add"
        let depend_key = 'cart_goods_rec_no'
        if (modalConfirmType === 'toOrder') {
          service = 'srvhealth_store_order_add'
          childService = 'srvhealth_store_order_goods_attr_value_add'
          depend_key = 'order_goods_rec_no'
        }

        if (goods?.goods_no) {
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
            goods_type: goods.goods_type,

            goods_source: this.enableSku ? '店铺SKU' : '店铺商品',
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
          if (this.enableSku) {
            data.father_goods_no = data.goods_no
            data.goods_no = goods.sku_no
          }
          if (modalConfirmType === 'toOrder') {
            let goodsInfo = this.deepClone(data);
            goodsInfo.name = this.storeInfo?.goods_name;
            goodsInfo.image = this.storeInfo?.store_image;
            goodsInfo.car_num = goodsInfo.goods_amount;
            goodsInfo.goods_type = goodsInfo.goods_type
            // || this.goodsInfo?.goods_type;
            goodsInfo.type = this.storeInfo?.type;
            this.$store.commit('SET_STORE_CART', {
              storeInfo: this.storeInfo,
              store_no: this.storeInfo.store_no,
              list: [goodsInfo, ...otherGoods]
            });

            let url =
              `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo.store_no}`;
            let orderType = this.getOrderType([goodsInfo])
            url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}`
            if (this.wxMchId) {
              url += `&wxMchId=${this.wxMchId}`;
            }
            if (this.dumpling_no) {
              url += `&tgNo=${this.dumpling_no}`
            }
            if (Array.isArray(otherGoods) && otherGoods.length > 0) {
              url += `&otherGoods=${encodeURIComponent(JSON.stringify(otherGoods))}`
            } else {
              url += `&goods_info=${encodeURIComponent(JSON.stringify(goodsInfo))}`
            }
            uni.navigateTo({
              url,
              success: () => {
                this.$refs?.skuSelector?.close?.(true)
                // this.changeModal()
              }
            });
          } else if (modalConfirmType === 'addToCart') {

            data.nick_name = this.userInfo?.nick_name || this.userInfo?.name
            data.service_place_no = this.placeInfo?.place_no
            data.service_place_name = this.placeInfo?.place_name
            data.profile_url = this.userInfo?.user_image || this.userInfo?.profile_url

            let req = [{
              serviceName: service,
              condition: [],
              data: [data, ...otherGoods]
            }];
            let res = await this.$fetch('operate', service, req, 'health');
            if (res.success) {
              this.getCartList();
              // this.changeModal()
              this.$refs?.skuSelector?.close?.(false)
              uni.$emit('goods-cart-change')
              uni.showToast({
                title: '添加成功'
              });
            } else {
              return
            }
          }
          this.goodsInfo.goods_amount = 1
          this.getGoodsInfo(this.goodsInfo?.goods_no)
        }
      },
      async addToCart(goods) {
        if (this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }

        if (goods?.goods_no) {
          let goodsInfo = await this.getCartDetail(null, goods.goods_no);
          if (goodsInfo?.goods_no) {
            goodsInfo.goods_amount++;
            if (this.purchase_limit && goodsInfo.goods_amount > this.purchase_limit) {
              uni.showModal({
                title: "提示",
                content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
                showCancel: false,
                confirmText: '知道了'
              })
              return
            }
            this.updateCart(goodsInfo);
          } else {
            goodsInfo = goods;
            let service = 'srvhealth_store_shopping_cart_goods_detail_add';
            let req = [{
              serviceName: service,
              condition: [],
              data: [{
                store_user_no: this.vstoreUser?.store_user_no,
                store_no: this.storeNo,
                unit_price: goods.price,
                goods_amount: 1,
                goods_no: goods.goods_no,
                sum_price: goods.price,
                goods_desc: goods.goods_desc,
                goods_image: goods.goods_img,
                goods_name: goods.goods_name,
                nick_name: this.userInfo?.nick_name || this.userInfo?.name,
                service_place_no: this.placeInfo?.place_no,
                service_place_name: this.placeInfo?.place_name,
                profile_url: this.userInfo?.user_image || this.userInfo?.profile_url
              }]
            }];
            let res = await this.$fetch('operate', service, req, 'health');
            if (res.success) {
              this.getCartList();
              uni.$emit('goods-cart-change')
              uni.showToast({
                title: '添加成功'
              });
            }
          }
        }
        return;
      },
      async deleteFromCart(goodsInfo) {
        if (goodsInfo?.id) {
          let serviceName = 'srvhealth_store_shopping_cart_goods_detail_delete';
          let req = [{
            serviceName: serviceName,
            condition: [{
              colName: 'id',
              ruleType: 'eq',
              value: goodsInfo.id
            }]
          }];
          await this.$fetch('operate', serviceName, req, 'health').then(res => {
            if (res.success) {
              this.getCartList();
              uni.showToast({
                title: '操作成功',
                icon: 'none'
              });
            }
          });
        }
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
              this.getCartList();
              uni.showToast({
                title: '操作成功'
              });
            }
          });
        }
      },
      async clickBtn(e) {
        if (this.onHandler === true) {
          return;
        }

        if ((!this.userInfo?.nick_name || this.userInfo?.nick_name == '微信用户')) {
          this.showAuth = true
          return
        }


        this.onHandler = true;
        let target_url = e?.target_url || this.moreConfig?.target_url;
        if (target_url && target_url !== 'add_to_cart') {
          let storeInfo = this.$store?.state?.app?.storeInfo;
          let bindUserInfo = this.$store?.state?.user?.storeUserInfo;
          let data = {
            ...this.$data,
            cartInfo: this.cartInfo,
            userInfo: this.userInfo,
            storeInfo,
            bindUserInfo
          };
          data = this.deepClone(data);
          let url = this.renderStr(target_url, data);
          uni.navigateTo({
            url: url
          });
          this.onHandler = false;
          return;
        }
        let goodsInfo = this.deepClone(this.goodsInfo)

        if (this.inCartGoodsInfo?.goods_amount) {
          goodsInfo.goods_amount = this.inCartGoodsInfo?.goods_amount;
        }
        if (!goodsInfo.goods_image && goodsInfo.goods_img) {
          goodsInfo.goods_image = goodsInfo.goods_img;
        }
        goodsInfo.name = goodsInfo.goods_name;
        goodsInfo.image = goodsInfo.store_image;
        goodsInfo.car_num = goodsInfo?.goods_amount || 1;
        goodsInfo.unit_price = goodsInfo.price;
        goodsInfo.type = this.storeInfo?.type;
        let enable_sku = this.goodsInfo?.enable_sku;
        let options_type = this.goodsInfo?.options_type
        if (enable_sku === '是') {
          this.onHandler = false
          this.changeModal('option-selector')
          if (!target_url) {
            this.modalConfirmType = 'toOrder'
          } else if (target_url === 'add_to_cart') {
            if (['面额卡', '套餐卡', '提货卡', '线下服务', '在线服务', '想豆卡', '充值卡'].includes(goodsInfo?.goods_type)) {
              uni.showToast({
                title: '非实物商品不支持加入购物车~',
                icon: 'none'
              })
              this.onHandler = false;
              return
            }
            this.modalConfirmType = 'addToCart'
          }
          this.onHandler = false;
          return
          if (options_type == 'SKU商品') {
            this.changeModal('option-selector')
            this.onHandler = false
            if (!target_url) {
              this.modalConfirmType = 'toOrder'
            } else if (target_url === 'add_to_cart') {
              if (['面额卡', '套餐卡', '提货卡', '线下服务', '在线服务', '想豆卡', '充值卡'].includes(goodsInfo?.goods_type)) {
                uni.showToast({
                  title: '非实物商品不支持加入购物车~',
                  icon: 'none'
                })
                this.onHandler = false;
                return
              }
              this.modalConfirmType = 'addToCart'
            }
            this.onHandler = false;
            return
          }
        }
        if (goodsInfo?.goods_type === '想豆卡') {
          await this.getVipCard(this.vstoreUser?.store_user_no)
          if (!this.hasVipCard) {
            uni.showModal({
              title: '提示',
              content: '此商品必须开通会员卡后才能购买,是否跳转到会员卡开通页面?',
              success: (res) => {
                if (res.confirm) {
                  const url =
                    `/publicPages/formPage/formPage?pageType=form&submitAction=vipCardChange&serviceName=srvhealth_store_user_card_case_add&fieldsCond=[{"column":"store_no","disabled":true,"value":"${this.storeInfo?.store_no}"},{"column":"attr_store_user_no","disabled":true,"value":"${this.vstoreUser?.store_user_no}"},{"column":"useing_store_user_no","disabled":true,"value":"${this.vstoreUser?.store_user_no}"}]`
                  uni.navigateTo({
                    url
                  })
                }
              }
            })
            this.onHandler = false;
            return
          }

        }
        if (this.purchase_limit && goodsInfo.goods_amount > this.purchase_limit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          this.onHandler = false;
          return
        }
        if (this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          this.onHandler = false;
          return
        }

        if (target_url === 'add_to_cart') {
          // 添加到购物车表
          if (['面额卡', '套餐卡', '提货卡', '线下服务', '在线服务', '想豆卡', '充值卡'].includes(goodsInfo?.goods_type)) {
            uni.showToast({
              title: '非实物商品不支持加入购物车~',
              icon: 'none'
            })
            this.onHandler = false;
            return
          }
          if (this.cartAmount >= 99) {
            uni.showToast({
              title: '购物车商品总数超出限制,请先清理购物车后在进行加购',
              icon: "none"
            })
            this.onHandler = false;
            return
          }
          this.addToCart(goodsInfo).then(_ => {
            this.onHandler = false;
          });
          return;
        }

        this.$store.commit('SET_STORE_CART', {
          storeInfo: this.storeInfo,
          store_no: this.storeInfo?.store_no || goodsInfo.store_no,
          list: [goodsInfo]
        });

        let url =
          `/storePages/placeOrder/placeOrder?goods_info=${encodeURIComponent(JSON.stringify(goodsInfo))}`;
        url += `&store_no=${this.storeInfo?.store_no}`
        let orderType = this.getOrderType([goodsInfo])
        url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}`
        if (this.wxMchId) {
          url += `&wxMchId=${this.wxMchId}`;
        }
        if (this.dumpling_no) {
          url += `&tgNo=${this.dumpling_no}`
        }

        uni.navigateTo({
          url
        });

        this.onHandler = false;
      },

      async getSwiperList(e) {
        let self = this;
        if (e?.banner_video_config === '子表') {
          let serviceName = 'srvhealth_store_banner_video_select';
          let condition = [{
            colName: 'store_video_product_no',
            ruleType: 'eq',
            value: this.goodsInfo.goods_no
          }];
          let req = {
            serviceName: 'srvhealth_store_banner_video_select',
            colNames: ['*'],
            condition: condition,
            page: {
              pageNo: 1,
              rownumber: 10
            },
            order: [{
              colName: 'seq',
              orderType: 'asc' // asc升序  desc降序
            }]
          };
          let url = this.getServiceUrl('health', serviceName, 'select');
          let res = await this.$http.post(url, req);
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let list = res.data.data
              .filter(item => item.store_video_file)
              .map(item => {
                item.url = this.getImagePath(item.store_video_file, true);
                if (item.file_type === '视频') {
                  // item.videoContext = uni.createVideoContext(item.store_video_file,this)
                }
                if (item.video_poster) {
                  item.videoPoster = this.getImagePath(item.video_poster, true);
                }
                return item;
              });
            this.swiperList = list;
          } else {}
        } else if (e.goods_img) {
          let firstImage = this.getImagePath(e.goods_img, true);
          uni.getImageInfo({
            src: firstImage,
            success: function(image) {
              let windowWidth = uni.getSystemInfoSync().windowWidth;
              self.imgHeight = (windowWidth * image.height) / image.width;
              // console.log(image.width);
              // console.log(image.height);
            }
          });
          let res = await this.getFilePath(e.goods_img);
          if (Array.isArray(res)) {
            this.swiperList = res.reduce((pre, cur) => {
              if (cur.fileurl) {
                cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
                  .getStorageSync('bx_auth_ticket');
              }
              pre.push(cur);
              return pre;
            }, []);
          } else {
            let obj = {
              file_type: '图片',
              url: firstImage
            };
            this.swiperList = [obj];
          }
        }
      },
      async getDetaiImageList(e) {
        if (e.goods_detail_image) {
          let res = await this.getFilePath(e.goods_detail_image);
          if (Array.isArray(res)) {
            this.goodsDetailImage = res.reduce((pre, cur) => {
              if (cur.fileurl) {
                let url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
                  .getStorageSync('bx_auth_ticket');
                cur.url = url;
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
              pre.push(cur);
              return pre;
            }, []);
          } else {
            let obj = {
              file_type: '图片',
              url: this.getImagePath(e.goods_detail_image, true)
            };
            this.goodsDetailImage = [obj];
          }
        }
      },
      fill2Digit(val) {
        // 精确到小数点后两位
        if (Number(val).toString() !== 'NaN') {
          return [parseInt(val), val.toFixed(2).slice(-2)];
        } else {
          return false;
        }
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(750);
        content.h = (maxW * content.h) / content.w;
        content.w = maxW;
        return content;
      },

      async getPurchased() {
        // 查找已购次数
        let app = this.destApp || 'health';
        let service = 'srvhealth_store_order_goods_detail_select';
        const req = {
          "serviceName": "srvhealth_store_order_goods_detail_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "goods_no",
            "ruleType": "eq",
            "value": this.goodsInfo?.goods_no
          }, {
            "colName": "create_user",
            "ruleType": "eq",
            "value": this.vloginUser?.user_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          }
        }
        let res = await this.$fetch('select', service, req, app)
        if (Array.isArray(res?.data) && res.data.length > 0) {
          this.purchasedGoods = res.data
          this.purchaseTimes = res?.page?.total || 0
        }
      },
      async getGoodsInfo(no) {
        no = no || this.goodsInfo?.goods_no
        let req = {
          condition: [{
            colName: 'goods_no',
            ruleType: 'eq',
            value: no
          }]
        };
        let service = this.serviceName || 'srvhealth_store_goods_guest_select';
        let app = this.destApp || 'health';
        let res = await this.$fetch('select', service, req, app)
        if (Array.isArray(res.data) && res.data.length > 0) {
          res.data[0].goods_amount = 1
          this.goodsInfo = res.data[0];
          if (this.group_price) {
            if (!isNaN(Number(this.group_price))) {
              this.goodsInfo.origin_price = this.goodsInfo.price
              this.goodsInfo.price = Number(this.group_price)

            }
          }
          if (this.goodsInfo?.purchase_limit) {
            let purchase_limit = Number(this.goodsInfo?.purchase_limit)
            if (!isNaN(purchase_limit)) {
              this.purchase_limit = purchase_limit
              if (purchase_limit > 0) {
                this.getPurchased()
              }
            }
          }

          this.getSwiperList(this.goodsInfo);
          this.getDetaiImageList(this.goodsInfo);
          if (this.goodsInfo?.enable_sku === '是') {
            this.$nextTick(() => {
              this.$refs?.skuSelector?.init?.()
            })
          }
        }
      },
      del() {
        if (this.enableSku) {
          uni.showToast({
            title: '不同规格的商品需要在购物车进行减购',
            icon: 'none'
          })
          return
        }
        if (this.inCartGoodsInfo && this.inCartGoodsInfo.goods_amount > 1) {
          this.inCartGoodsInfo.goods_amount--;
          this.updateCart(this.inCartGoodsInfo);
        } else if (this.inCartGoodsInfo.goods_amount == 1) {
          uni.showModal({
            title: '提示',
            content: '确认从购物车中删除此商品？',
            success: (res) => {
              if (res.confirm) {
                this.deleteFromCart(this.inCartGoodsInfo)
              }
            }
          })
        }
      },
      add(e) {
        if (this.onLimit) {
          uni.showModal({
            title: "提示",
            content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        if (this.enableSku) {
          this.changeModal('option-selector')
          return
          if (this.optionsType === 'SKU商品') {
            this.changeModal('option-selector')
            return
          }
        }
        if (this.inCartGoodsInfo && this.inCartGoodsInfo.goods_amount) {
          let amount = this.inCartGoodsInfo.goods_amount + 1;
          if (this.purchase_limit && amount > this.purchase_limit) {
            uni.showModal({
              title: "提示",
              content: `超过购买次数限制,该商品最多只能购买${this.purchase_limit}次`,
              showCancel: false,
              confirmText: '知道了'
            })
            return
          }
          let goods = this.inCartGoodsInfo
          goods.goods_amount++
          this.updateCart(goods);
          // this.getGoodsStock(this.inCartGoodsInfo).then(res => {
          //   if (res && res.id) {
          //     if (res.amount > this.inCartGoodsInfo.goods_amount - 1) {
          //       this.inCartGoodsInfo.goods_amount++;
          //       this.updateCart(this.inCartGoodsInfo);
          //     } else {
          //       uni.showToast({
          //         title: '商品库存不足',
          //         icon: 'none'
          //       });
          //     }
          //   }
          // });
        }
      }
    },
    onShareTimeline() {
      let pages = getCurrentPages();
      let path = pages[pages.length - 1]?.$page?.fullPath;
      let query = '';
      if (path && path.indexOf('?') !== -1) {
        query = path.split('?')[1];
      }
      query += '&from=share';
      if (this.userInfo?.userno) {
        query += `&invite_user_no=${this.userInfo?.userno}`;
      }
      if (this.storeInfo?.store_no) {
        query += `&store_no=${this.storeInfo?.store_no}`;
      }
      let title = `【${this.goodsInfo.goods_name}】`;

      this.saveSharerInfo(this.userInfo, ` ${path}&${query}`, 'timeline');
      let imageUrl = '';
      if (this.storeInfo?.logo) {
        imageUrl = this.getImagePath(this.storeInfo.logo, true);
      }
      if (this.goodsInfo?.goods_img) {
        imageUrl = this.getImagePath(this.goodsInfo.goods_img, true);
      }
      return {
        title: title,
        query: query,
        imageUrl: imageUrl
      };
    },
    onShareAppMessage() {
      let pages = getCurrentPages();
      let path = pages[pages.length - 1]?.$page?.fullPath;
      if (path) {
        if (path.indexOf('?') == -1) {
          path += '?from=share';
        } else {
          path += '&from=share';
        }
      }
      if (this.userInfo?.userno) {
        path += `&invite_user_no=${this.userInfo?.userno}`;
      }
      if (this.storeInfo?.store_no) {
        path += `&store_no=${this.storeInfo?.store_no}`;
      }

      let title = `【${this.goodsInfo.goods_name}】`;
      let imageUrl = '';
      if (this.storeInfo?.logo) {
        imageUrl = this.getImagePath(this.storeInfo.logo, true);
      }
      if (this.goodsInfo?.goods_img) {
        imageUrl = this.getImagePath(this.goodsInfo.goods_img, true);
      }
      this.saveSharerInfo(this.userInfo, path, 'appMessage');
      title = this.renderEmoji(title)
      return {
        imageUrl: imageUrl,
        title: title,
        path: path
      };
    },
    async onLoad(option) {
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      if (option.hideButton) {
        this.hideButton = true;
      }
      if (option.dumpling_no) {
        this.dumpling_no = option.dumpling_no
      }
      if (option.pageType) {
        this.pageType = option.pageType
      }
      if (option.group_price) {
        this.group_price = option.group_price
      }
      if (option.wxMchId) {
        this.wxMchId = option.wxMchId;
      }
      if (option.storeNo || option.store_no) {
        this.storeNo = option.storeNo || option.store_no;
        if (this.storeInfo?.store_no !== this.storeNo) {
          this.getStoreInfo();
        }
      }
      if (option.destApp) {
        this.destApp = option.destApp;
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName;
      }
      if (option.phone) {
        this.phone = option.phone;
      }
      let scene = this.$store?.state?.app?.scene;
      if (scene !== 1154) {
        await this.toAddPage();
      }
      if (option.goods_no) {
        this.getGoodsInfo(option.goods_no);
        this.getCartList();
      }
    }
  };
</script>

<style scoped lang="scss">
  .goods-detail-wrap {
    min-height: 100vh;
    overflow-y: scroll;
    padding-bottom: 50px;
    position: relative;

    .share-banner {
      position: fixed;
      top: 80px;
      right: 0;
      padding: 0 10px;
      color: #fff;
      border-radius: 20px 0 0 20px;
      background: linear-gradient(to right, #476eff, #56aaff, #7696ff);
      display: flex;
      align-items: center;
      min-height: 40px;
    }
  }

  .goods-info {
    font-size: 18px;
    letter-spacing: 2px;
    padding: 20rpx;
    background-color: #fff;
    margin-bottom: 20rpx;

    .handler-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .number-box {
        display: flex;
        align-items: center;
      }
    }
  }

  .store-info {
    margin: 20rpx 0;
    background-color: #fff;
    border-top: 1rpx solid #f1f1f1;
    margin-bottom: 20rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;

    .store-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-left: 20rpx;
    }

    .store-icon {
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;

      &.text {
        border: 1px solid #f1f1f1;
        font-size: 20px;
      }
    }

    .phoneCall {
      flex: 1;
      font-size: 30px;
      text-align: right;
    }
  }

  .desc {
    color: #aaa;
    padding: 20rpx;
    background-color: #fff;

    .title {
      padding: 10rpx 0;
      border-bottom: 1rpx solid #f1f1f1;
      margin-bottom: 10rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .data-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;

        .disp-item {
          margin-left: 20px;
        }
      }
    }
  }

  .selected-sku-info {
    display: flex;
    background-color: #fff;
    padding: 10px;
    margin: 10px 0;

    .icon {
      flex: 1;
      text-align: right;
    }

    .label {}
  }

  .cu-modal {
    display: block !important;
  }

  .detail {
    padding-bottom: 50px;
    background-color: #fff;

    .title {
      border-bottom: 1rpx solid #f1f1f1;
      padding: 20rpx;
    }

    .image-box {
      width: 100%;

      .detail-img {
        display: block;
        width: 100%;
      }
    }
  }

  .main-image {
    width: 100%;
    height: 400rpx;
    overflow: hidden;
    transition: height ease 0.1s;
    display: flex;
    justify-content: center;
    align-items: center;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .right-btn {
    display: flex;
    justify-content: center;
    flex: 1;
    align-items: center;
    // background-color: #1cbbb4;
    height: 100%;

    .full {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }

    .button-left {
      flex: 1;
      padding: 0 15px;
      display: flex;

      // justify-content: flex-start;
      // align-items: center;
      .cu-btn.left {
        display: flex;
        align-items: center;
        flex-direction: column;
        padding: 0;
        margin-right: 20px;
        position: relative;

        .badge {
          position: absolute;
          top: -5px;
          right: calc(-50% + 12px);
          min-width: 25px;
          min-height: 25px;
          padding: 2px;
          font-size: 12px;
          transform: scale(0.8);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #ff0000;
          border: 1px solid #ff0000;
          color: #fff;
        }

        .icon {
          margin-bottom: 4px;
          font-size: 22px;

        }

        .label {
          font-size: 10px;
        }
      }
    }

    .button-right {
      .cu-btn {
        height: 40px;
        padding: 0 20px;
      }
    }

    .cu-btn {
      // border-radius: 0;
      text-align: center;
      // flex: 1;
      // border-left: 1rpx solid #f5f5f5;
      margin-right: 10px;

      &:first-child {
        border-left: none;
      }

      // &.left {
      //   flex: 1;
      //   text-align: left;
      //   align-items: flex-start;
      //   justify-content: flex-start;
      //   flex-direction: column;

      //   .icon {
      //     margin-bottom: 2px;
      //   }
      // }

      .icon {
        font-size: 20px;
      }
    }
  }

  .price {
    display: flex;
    align-items: flex-end;

    .symbol {
      font-size: 12px;
    }

    .number {
      font-size: 30px;
      position: relative;
      top: 5px;

      .float {
        font-size: 14px;
      }
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

  .bottom-modal {
    z-index: 1050;
  }

  .share-tips {
    padding: 10px 20px;

    .title {
      padding: 5px;
      font-weight: bold;
    }

    .content {
      text-align: left;
    }

    .bottom-buttons {
      padding: 20px 0;
    }
  }

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

  ::v-deep .nav-bar {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    width: 100%;
    // background-color: #fff;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    .home-name {
      display: inline-block;
      width: calc(100% - 40rpx);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

  }
</style>
