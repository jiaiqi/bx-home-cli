<template>
  <view class="pay-order" :class="['theme-'+theme]">
    <view class="cu-load load-modal" v-if="onPay==true" @click.stop="" @touchstart.stop.prevent=""
      @mousemove.stop.prevent="">
      <text>请稍后...</text>
    </view>
    <view class="order-detail">
      <view class="form-box">
        <a-form v-if="isLoadingCols!==true&&colV2 && fields && isArray(fields )&&fields.length>0" :fields="fields"
          :moreConfig="moreConfig" :srvApp="appName" :pageType="srvType" :formType="srvType" ref="bxForm"
          :mainData="mainData" @value-blur="valueChange">
        </a-form>
        <view class="flex justify-center padding-tb" v-else>
          <u-loading mode="flower"></u-loading>
        </view>
      </view>
      <view class="person-info" v-if="orderType==='团购'">
        <view class="cu-form-group">
          <view class="title">姓名</view>
          <input :placeholder="'请输入姓名'" name="input" v-model="addressInfo.userName" placeholder-style="fontSize:12px;"
            :disabled="!!orderInfo.order_no"></input>
          <text class="cuIcon-write" style="fontSize:14px;" v-if="!orderInfo.order_no"></text>
        </view>
        <view class="cu-form-group ">
          <view class="title">手机号</view>
          <input :placeholder="'请输入手机号'" name="input" v-model="addressInfo.telNumber" placeholder-style="fontSize:12px;"
            :disabled="!!orderInfo.order_no"></input>
          <text class="cuIcon-write" style="fontSize:14px;" v-if="!orderInfo.order_no"></text>
        </view>
      </view>
      <view class="order-info">
        <view class="title-bar text-bold" v-if="orderType==='团购'">
          已选商品
        </view>
        <!--        <view class="title-bar" v-else>
          <image class="store-logo" :src="getImagePath(storeInfo.logo)" mode="aspectFill" v-if="storeInfo.logo">
          </image>
          <image class="store-logo" :src="getImagePath(orderInfo.image)" mode="aspectFill" v-else-if="orderInfo.image">
          </image>
          <text class="store-logo cuIcon-shop" v-else></text>
          <text class="store-name">{{
              orderInfo.store_name ? orderInfo.store_name : orderInfo.name || ""
            }}</text>
        </view> -->
        <view class="goods-list">
          <goods-item :goods="goods" :disabledRefund="disabledRefund" :disabledEvaluate="disabledEvaluate"
            :orderInfo="orderInfo" v-for="(goods,idx) in goodsList" :key="idx" @amount-change="amountChange"
            @attrChange="attrChange($event,idx)">

          </goods-item>
        </view>
        <view class="detail-info">
          <view class="detail-info_item" v-if="goodsAmount">
            <view class="detail-info_item_label">
              商品总数
            </view>
            <view class="detail-info_item_value">
              {{goodsAmount}}
            </view>
          </view>
          <view class="detail-info_item" v-if="orderInfo.order_amount">
            <view class="detail-info_item_label">
              订单金额
            </view>
            <view class="detail-info_item_value text-red" v-if="orderInfo.order_amount">
              ￥{{orderInfo.order_amount}}
            </view>
            <view class="detail-info_item_value text-red" v-else-if="orderInfo.order_amount===0">
              ￥0
            </view>
          </view>
          <view class="detail-info_item" v-if="couponMinus">
            <view class="detail-info_item_label">
              优惠金额
            </view>
            <view class="detail-info_item_value">
              ￥{{couponMinus||'0'}}
            </view>
          </view>
          <view class="detail-info_item" v-if="packagingFee">
            <view class="detail-info_item_label">
              打包费
            </view>
            <view class="detail-info_item_value">
              ￥{{packagingFee||'0'}}
            </view>
          </view>
          <view class="detail-info_item" v-if="shippingFee">
            <view class="detail-info_item_label">
              配送费
            </view>
            <view class="detail-info_item_value">
              ￥{{shippingFee||'0'}}
            </view>
          </view>
          <view class="detail-info_item" v-if="totalMoney&&actualMoney||totalMoney===0">
            <view class="detail-info_item_label">
              <!-- 应付金额 -->
            </view>
            <view class="detail-info_item_value text-red actual-money">
              <text v-if="orderInfo.order_pay_amount"><text
                  class="text-sm margin-right-xs">实付:￥</text>{{orderInfo.order_pay_amount}}</text>
              <text v-else> <text class="text-sm margin-right-xs">应付:￥{{actualMoney}}</text></text>
            </view>
          </view>
        </view>
        <view class="id-number-edit" v-if="!disabled&&needIdNum">
          <view class="cu-form-group ">
            <view class="title">身份证号</view>
            <input class="value" :placeholder="'请输入身份证号'" name="input" v-model="idNum"
              placeholder-style="fontSize:24rpx;"></input>
          </view>
          <view class="remark text-cyan">
            <text class="cuIcon-info"></text> {{needIdRemark||''}}
          </view>
        </view>
      </view>

      <view class="order-other-info">
        <view class="info-item">
          <view class="info-label">
            订单备注
          </view>
          <view class="info-value" style="text-align: right;">
            <input type="text" placeholder-style="font-size:12px;color:#999;" :disabled="orderInfo&&orderInfo.order_no"
              v-model="order_remark" placeholder="可填写偏好和要求">
          </view>
        </view>
      </view>


      <!-- 优惠券 -->
      <view class="order-other-info" v-if="!orderInfo.order_no&&!isHexiao&&actualMoney!==0">
        <view class="info-item">
          <view class="info-label">
            优惠券
          </view>
          <view class="info-value">
            <coupon-selector ref='couponSelectorRef' :max="totalMoney" @update="setCouponMinus" @close="setCouponMinus">
            </coupon-selector>
            <text class="cuIcon-right text-gray"></text>
          </view>
        </view>
      </view>



      <!-- 支付方式 -->
      <view class="pay-mode"
        v-if="!isHexiao&&(!orderInfo||(orderInfo&& orderInfo.pay_state==='待支付'&&( orderInfo.order_state==='待支付'|| orderInfo.order_state==='待提交')))">
        <radio-group @change="payModeChange" style="width: 100%;">
          <view class="pay-mode-item" v-if="couponList&&couponList.length>0" @click="toCouponSelector">
            <view class="">
              <text class="cuIcon-card text-red  icon"></text>
              卡券支付
            </view>
            <view class="" style="display: flex;align-items: center;">
              <view class="coupon-info" v-if="couponInfo">
                <view class="coupon-name">
                  {{couponInfo.card_name||''}}
                </view>
                <view class="amount" v-if="couponInfo.card_last_amount">
                  剩余金额:{{couponInfo.card_last_amount||''}}
                </view>
              </view>
              <text class="cuIcon-right"></text>
            </view>
          </view>
          <view class="pay-mode-item" @click="payModeChange({detail:{value:'wx'}})" v-if="!pay_method">
            <view class="">
              <text class="cuIcon-weixin text-green  icon"></text>
              微信支付
            </view>
            <view class="">
              <radio :checked="payMode==='wx'" value="wx" />
              <!-- <text class="cuIcon-right"></text> -->
            </view>
          </view>
        </radio-group>
      </view>



      <view class="detail-info" v-if="orderInfo&&orderInfo.order_no">
        <!--        <view class="detail-info-title">
            订单信息
          </view> -->
        <view class="detail-info_item" v-if="orderInfo.order_no">
          <view class="detail-info_item_label">
            订单编号
          </view>
          <view class="detail-info_item_value">
            {{orderInfo.order_no}}
          </view>
        </view>
        <view class="detail-info_item" v-if="orderInfo.order_state">
          <view class="detail-info_item_label">
            订单状态
          </view>
          <view class="detail-info_item_value">
            {{orderInfo.order_state}}
          </view>
        </view>
        <view class="detail-info_item" v-if="orderInfo.pay_state">
          <view class="detail-info_item_label">
            支付状态
          </view>
          <view class="detail-info_item_value">
            {{orderInfo.pay_state}}
          </view>
        </view>

        <view class="detail-info_item" v-if="orderInfo.pay_method">
          <view class="detail-info_item_label">
            支付方式
          </view>
          <view class="detail-info_item_value">
            {{orderInfo.pay_method}}
          </view>
        </view>
        <view class="detail-info_item" v-if="orderInfo.create_time">
          <view class="detail-info_item_label">
            下单时间
          </view>
          <view class="detail-info_item_value">
            {{dayjs(orderInfo.create_time).format("YYYY-MM-DD HH:mm")}}
          </view>
        </view>
      </view>
    </view>

    <view class="handler-bar">

      <text class="amount margin-right-xs"
        v-if="totalMoney&&actualMoney&&totalMoney!==actualMoney">共省{{ Number(((totalMoney*10000 - actualMoney*10000)/10000).toFixed(2)) }}元</text>
      <text class="amount" v-if="totalAmount">共{{ totalAmount }}件</text>
      <text class="text" v-if="totalMoney&&!pay_method">合计:</text>
      <text class="money-amount" v-if="totalMoney&&!pay_method">
        <text class="money-operate">￥</text>
        <text v-if="actualMoney">{{actualMoney||''}}</text>
        <text v-else>{{ totalMoney || "" }}</text>
      </text>
      <button class="cu-btn bg-gradual-orange round" :disabled="isLoadingCols==true" :class="'bx-bg-'+theme"
        @click="submitOrder" v-if="orderInfo.order_state === '待提交'">
        <text v-if="pay_method">确认核销</text>
        <text v-else> 提交订单</text>
      </button>
      <button class="cu-btn bg-gradual-orange round" @click="toPay(true)" v-if="orderInfo.pay_state&&orderInfo.order_state!=='待提交'&&orderInfo.order_state!=='取消订单'&&
            ['取消支付','待支付'].includes(orderInfo.pay_state)&&payMode !== 'coupon'&&!onPay
          ">
        付款
      </button>
      <button class="cu-btn bg-orange light round sm" :disabled="isLoadingCols==true" @click="toAfterSale"
        v-if="showButton('退款')">
        退款
      </button>
    </view>
    <view class="cu-modal bottom-modal" :class="{
       show: modalName === 'Selector'
     }" @click="hideModal">
      <view class="cu-dialog" @tap.stop="">
        <view class="tree-selector">
          <view class="content">
            <view class="cu-bar search bg-white" v-if="modalName === 'Selector'">
              <view class="search-form round">
                <input @input="searchFKDataWithKey" type="text" placeholder="搜索" confirm-type="search" />
              </view>
              <text class="cu-btn cuIcon-refresh line-blue shadow round margin-right-xs"
                @click="getSelectorData(null, null, null)"></text>
              <text class="cu-btn cuIcon-add line-blue shadow round margin-right-xs" @click="toFkAdd">
              </text>
            </view>
            <bx-radio-group class="form-item-content_value radio-group" v-model="room_no" mode="button"
              @change="pickerChange">
              <bx-radio v-for="item in selectorData" :key="item.value" :name="item.value">{{ item.label }}
              </bx-radio>
            </bx-radio-group>
          </view>
          <view class="dialog-button">
            <view class="cu-btn bg-grey shadow margin round" @tap="hideModal" v-if="modalName === 'Selector'">取消</view>
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
  import goodsItem from '../components/goods-item/goods-item.vue'
  import couponSelector from '../components/coupon-selector/coupon-selector.vue'
  export default {
    components: {
      goodsItem,
      couponSelector,
    },
    data() {
      return {
        isLoadingCols: false,
        orderAddService: "", //自定义表单提交服务
        includesColumns: "", // 表单中要包含的字段
        columnsDefaultVal: {}, //表单默认值
        submitColumns: "",
        globalData: {},
        app: '',
        colV2: {},
        fields: [],
        mainData: {},
        fieldsCfg: {
          service: 'srvhealth_store_order_select',
          app: 'health',
        },
        curDelivery: 0,
        service_time: '', //预约时间
        deliveryList: [{
            name: '快递'
          },
          {
            name: '自提'
          },
          {
            name: '卖家配送'
          },
          {
            name: '当面交易'
          }
        ],
        delivery_type: "", //提货方式:快递、卖家配送、自提、当面交易
        payMode: 'wx',
        couponList: [], //卡券列表
        store_no: "",
        room_no: "",
        rcv_hotel_room_no: "",
        repast_type: "堂食", //就餐方式 堂食，外卖
        rcv_name: "", //联系人
        rcv_telephone: "", // 收货电话
        orderNo: '', //订单编号
        orderInfo: {},
        order_remark: "",
        addressInfo: {
          fullAddress: '',
          userName: "",
          telNumber: ""
        },
        wxMchId: "", //商户号
        idNum: '', //身份证号
        modalName: "",
        selectorData: [],
        roomPageNo: 1,
        roomV2: {
          "refed_col": "room_no",
          "show_as_pair": false,
          "srv_app": "store",
          "serviceName": "srvstore_hotel_room_select",
          "conditions": [{
            "colName": "hotel_no",
            "ruleType": "eq",
            "value": "${storeInfo.store_no}"
          }],
          "key_disp_col": "room_no"
        },
        couponInfo: null,
        pay_method: "", // 套餐卡、提货卡
        orderType: '', //普通，团购,餐饮
        show_params_config: '', //显示参数
        tgNo: "", //团购编号
        goodsWay: "", //团购收货方式
        couponMinus: 0, //优惠券减的金额
        curCouponNo: '',
        disabled: false,
        service_place_no: "", //场地编号、餐桌号、房间号等
        shippingFee: 0, // 配送费
        send_amount: 0, // 最小起送金额
        hideColumn: "",
        view_cfg: null,
        onPay: false,
        disabledRefund: false, // 禁用退款按钮
        disabledEvaluate: false, // 禁用 评价按钮
        approval_type: "普通核销", //核销方式
        goodsList: [],
        fieldsCond: [],
        isActive: false, // 虚拟商品是否已激活
      };
    },
    watch: {
      orderInfo: {
        deep: true,
        immediate: true,
        handler(nVal, oVal) {
          if (nVal?.goodsList) {
            this.goodsList = nVal.goodsList
          }
        }
      }
    },
    computed: {
      canPlace() {
        let result = true;
        if (this.storeInfo?.order_up && this.storeInfo.order_up.indexOf('休息时间可以下单') > -1) {
          if (this.storeInfo?.start_time) {
            const date1 = this.dayjs(`2022-04-28 ${this.storeInfo?.start_time}`)
            const date2 = this.dayjs()
            if (date1.diff(date2) > 0) {
              result = false
            }
          }
          if (this.storeInfo?.end_time) {
            const date1 = this.dayjs(`2022-04-28 ${this.storeInfo?.end_time}`)
            const date2 = this.dayjs()
            if (date1.diff(date2) <= 0) {
              result = false
            }
          }
        }
        return result
      },
      packagingFee() {
        // 打包费
        let result = 0;
        if (this.mainData.repast_type && ['打包', '外卖'].includes(this.mainData.repast_type) && Array.isArray(this
            .orderInfo?.goodsList) && this.orderInfo?.goodsList.length > 0) {
          result = this.orderInfo?.goodsList.reduce((res, cur) => {
            if (cur.packaging_fee) {
              res += cur.packaging_fee
            }
            return res
          }, 0)
        }
        return result
      },
      srvType() {
        return this.disabled || this.orderInfo?.order_no ? 'detail' : 'add'
      },
      appName() {
        return this.app || uni.getStorageSync('activeApp')
      },
      moreConfig() {
        return this.colV2?.moreConfig || {}
      },
      ...mapState({
        loginUserInfo: state => state.user.loginUserInfo,
        cartInfo: state => state.order.cartInfo,
        theme: state => state.app.theme
      }),
      timeStart() {
        return this.dayjs().format("HH:mm")
      },
      isHexiao() {
        // 是否核销
        return this.pay_method === '套餐卡' || this.pay_method === '提货卡'
      },
      isFood() {
        let goods = this.orderInfo?.goodsList;
        if (Array.isArray(goods)) {
          return !!goods.find(item => item.goods_type === '现制餐饮')
        }
      },
      goodsAmount() {
        // 订单商品总数
        let result = 0
        let goods = this.orderInfo.goodsList;
        if (Array.isArray(goods)) {
          result = goods.reduce((res, cur) => {
            if (cur.goods_amount && !isNaN(Number(cur.goods_amount))) {
              res += cur.goods_amount
            }
            return res
          }, 0)
        }
        return result
      },
      addressStr() {
        let str = ''
        if (this.orderInfo?.order_no) {
          str += `${this.orderInfo?.rcv_name} ${this.orderInfo?.rcv_telephone} \r\n ${this.orderInfo?.rcv_addr_str}`
        }
        return str
      },
      needIdNum() {
        let goods = this.orderInfo.goodsList;
        if (Array.isArray(goods) && goods.length > 0) {
          return goods.some(item => item.need_id_num == '是')
        }
      },
      needIdRemark() {
        let goods = this.orderInfo.goodsList;
        if (Array.isArray(goods) && goods.length > 0) {
          let good = goods.find(item => item.need_id_num == '是')
          if (good && good.remark) {
            return good.remark
          }
        }
      },
      needAddress() {
        const state = !this.room_no && this.storeInfo?.type !== '酒店' && !this.orderInfo?.order_no && ['快递', '卖家配送']
          .includes(this.delivery_type) && !this.isFood
        return state
      },
      totalAmount() {
        if (Array.isArray(this.orderInfo.goodsList)) {
          return this.orderInfo.goodsList.reduce((pre, cur) => {
            if (cur.goods_amount) {
              pre += cur.goods_amount;
            } else if (cur.car_num) {
              pre += cur.car_num;
            }
            return pre;
          }, 0);
        }
      },
      actualMoney() {
        // 实际支付价格
        if (this.orderInfo?.tobe_paid_amount) {
          return this.orderInfo?.tobe_paid_amount
        }

        if (this.orderInfo?.order_pay_amount && this.orderInfo?.order_amount) {
          return this.orderInfo?.order_pay_amount
        }

        let res = this.totalMoney - this.couponMinus >= 0 ? this.totalMoney - this.couponMinus : 0.01
        if (!isNaN(Number(this.shippingFee))) {
          res += this.shippingFee
        }
        
        if(!isNaN(Number(res))){
          res =  Number(res.toFixed(2))
        }
        
        return res
      },
      totalMoney() {
        let list = this.goodsList
        let num = 0
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(item => {
            if (item.goods_amount && item.price) {
              num += item.goods_amount * item.price;
            } else if (item.goods_amount && item.unit_price) {
              num += item.goods_amount * item.unit_price;
            } else if (item.price && item.car_num) {
              num += item.car_num * item.price;
            }
          })
        }
        return num
        // return list.reduce((pre, cur) => {
        //   if (cur.goods_amount && cur.price) {
        //     pre += cur.goods_amount * cur.price;
        //   } else if (cur.goods_amount && cur.unit_price) {
        //     pre += cur.goods_amount * cur.unit_price;
        //   } else if (cur.price && cur.car_num) {
        //     pre += cur.car_num * cur.price;
        //   }
        //   return pre;
        // }, 0)
      }
    },
    methods: {
      getVirtualGoods() {
        // 查找订单下单虚拟商品（卡包）判断是否未激活
        const url = `/health/select/srvhealth_store_card_case_select`
        let req = {
          "serviceName": "srvhealth_store_card_case_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'order_no',
            ruleType: 'eq',
            value: this.orderInfo?.order_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data)) {
            this.isActive = res?.data?.data.every(item => item.use_states === '未激活')
          }
        })
      },
      toAfterSale() {
        // 跳转到售后页面

        if (this.orderInfo.refund_order_state && ['申请中'].includes(this.orderInfo.refund_order_state)) {
          uni.showModal({
            title: '提示',
            content: '退款申请中,请等待审核通过',
            showCancel: false
          })
          return
        }


        const cols = ['id', 'order_goods_rec_no', 'order_no', 'goods_no', 'package_goods_no', 'store_no',
          'origin_price', 'sum_price', 'unit_price', 'packaging_fee', 'goods_name', 'goods_image', 'goods_desc',
          'goods_amount', 'delivery_status', 'goods_type', 'goods_source'
        ]


        if (Array.isArray(this.goodsList) && this.goodsList.length > 0) {

          // let goodsItem = this.goodsList[0]

          // const goods = cols.reduce((res, cur) => {
          //   res[cur] = goodsItem[cur];
          //   return res
          // }, {})


          // goods.order_pay_amount = this.orderInfo?.order_pay_amount
          // if (goodsItem.return_num) {
          //   goods.goods_amount = goods.goods_amount - goodsItem.return_num
          // }

          const goodsList = this.goodsList.map(item => {
            let obj = cols.reduce((res, cur) => {
              res[cur] = item[cur];
              return res
            }, {})
            return obj
          })

          // if (!goods.goods_amount || goods.goods_amount < 1) {
          //   uni.showModal({
          //     title: '提示',
          //     content: '已退数量大于已购数量',
          //     showCancel: false
          //   })
          //   return
          // }

          const url =
            `https://login.100xsys.cn/health/#/pages/h5/afterSale/afterSale?user_no=${this.userInfo.userno}&no=${this.orderInfo?.order_no}&amount=${this.orderInfo.order_pay_amount}&storeUserNo=${this.vstoreUser.store_user_no}&goodsList=${JSON.stringify(goodsList)}`

          // uni.navigateTo({
          //   url
          // })

          uni.navigateTo({
            url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(url)}`
          })
        }
      },
      showButton(e) {
        let res = false;
        const {
          order_state, //订单状态
          pay_state, //支付状态
          order_pay_amount, //订单支付金额
          order_type, // 订单类型
          order_finish_time // 订单完成时间
        } = this.orderInfo
        if (e == '退款') {

          if (['待发货', '待收货', '待提货', '已完成'].includes(order_state) && pay_state === '已支付' &&
            order_pay_amount && this.disabledRefund !== true) {
            res = true
          }

          if (order_type === '虚拟商品' && this.isActive == false) {
            res = false
          }
          // res = this.disabledRefund !== true && this.orderInfo.pay_state === '已支付' && this.orderInfo.order_pay_amount &&
          //   this.orderInfo.order_pay_amount > 0 || false

          let refunds_num = this.storeInfo?.order_return_day ?? 7
          if (this.goodsList.find(item => item.refunds_num)?.refunds_num) {
            refunds_num = this.goodsList.find(item => item.refunds_num)?.refunds_num
          }



          if (['餐饮', '酒店'].includes(order_type)) {
            res = false
          }

          if (refunds_num === 0 && order_state == '已完成') {
            res = false
          }

          if (refunds_num && res && order_state == '已完成' && order_finish_time) {
            // 订单完成超过七天或者配置的最晚可退款时间 就不显示退款按钮了
            if (this.dayjs(order_finish_time).add(refunds_num, 'day') <= this.dayjs()) {
              res = false
            }
          }

          if (this.orderInfo.refund_order_state && ['审核通过'].includes(this.orderInfo.refund_order_state)) {
            res = false
          }

          // if (this.orderInfo?.cumulative_refund_amount && this.orderInfo?.cumulative_refund_amount > 0) {
          //   res = false
          // }
        }

        return res
      },
      amountChange(e) {
        if (e?.id) {
          this.orderInfo.goodsList.forEach((item, index) => {
            if (item.id === e.id) {
              // item.goods_amount = e.num
              // item.car_num = e.num
              // item.amount = e.num
              this.$set(item, 'amount', e.num)
              this.$set(item, 'goods_amount', e.num)
              this.$set(item, 'car_num', e.num)
            }
            return item
          })
          // this.orderInfo.goodsList = this.orderInfo.goodsList.map(item => {
          //   if (item.id === e.id) {
          //     item.goods_amount = e.num
          //     item.car_num = e.num
          //     this.$set(item)
          //   }
          //   return item
          // })
        }
      },
      async valueChange(e, triggerField) {
        let data = this.orderInfo?.order_no ? this.orderInfo : this.mainData
        const column = triggerField.column

        if (this.mainData && typeof this.mainData === 'object') {
          this.mainData[column] = triggerField.value
        }

        let fieldModel = e
        let xIfCols = null
        //#ifdef MP-WEIXIN
        xIfCols = this.colV2?._fieldInfo.filter(item => Array.isArray(item
          .xif_trigger_col) && item.xif_trigger_col.includes(column)).map(item => item.column)
        //#endif

        //#ifdef H5
        xIfCols = this.colV2?._fieldInfo.filter(item => item.x_if && ((Array.isArray(item
          .xif_trigger_col) && item.xif_trigger_col.includes(column)) || item.x_if.indexOf(column) !== -1))
        //#endif

        const table_name = this.colV2?.main_table

        let xIfResult = null

        if (Array.isArray(xIfCols) && xIfCols.length > 0) {
          //#ifdef MP-WEIXIN
          xIfResult = await this.evalX_IF(table_name, xIfCols, fieldModel, this.appName)
          //#endif
          //#ifdef H5
          xIfResult = {
            response: {}
          }
          xIfCols.forEach(col => {
            let x_if = col?.x_if;
            try {
              if (x_if) {
                x_if = `(${x_if})(data)`
                xIfResult.response[col.column] = eval(x_if)
              }
            } catch (e) {
              //TODO handle the exception
              console.log(e)
            }

          })
          //#endif
        }


        let calcResult = {}
        let calcCols = null;
        //#ifdef MP-WEIXIN
        calcCols = this.colV2?._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
            .calc_trigger_col) && item.calc_trigger_col.includes(column) && item.value !== item
          .old_value).map(item =>
          item.column)
        //#endif
        //#ifdef H5
        calcCols = this.colV2?._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
            .calc_trigger_col) && item.calc_trigger_col.includes(column) && item.value !== item
          .old_value)
        //#endif

        if (Array.isArray(calcCols) && calcCols.length > 0) {
          //#ifdef H5
          calcCols.forEach(col => {})
          //#endif

          //#ifdef MP-WEIXIN
          calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
          //#endif
        }
        for (let i = 0; i < this.fields.length; i++) {
          const item = this.fields[i]

          item.old_value = item.value
          if (e.column && e.column === item.column) {
            item = this.deepClone(e)
          }
          if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
              .column] == 0)) {

            if (item.redundant?.trigger === 'always' || !item.value) {
              item.value = calcResult?.response[item.column] || item.value
              fieldModel[item.column] = item.value
              this.mainData[item.column] = item.value
            }

          }
          //#ifdef MP-WEIXIN
          if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
            if (item.table_name !== table_name) {
              xIfResult = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
            }
            if (xIfResult?.response && xIfResult.response[item.column]) {
              item.display = true
            } else if (xIfResult === true) {
              item.display = true
            } else {
              item.display = false
            }
          }
          //#endif
          // #ifdef H5
          if (item.x_if && item.x_if.indexOf(column) !== -1) {
            if (xIfResult?.response && xIfResult.response[item.column]) {
              item.display = true
            } else if (xIfResult === true) {
              item.display = true
            } else {
              item.display = false
            }
          }
          // #endif
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
            fieldModel[item.column] = item.value
          }
          this.$set(this.fields, i, item)
        }
        // if (triggerField?.validators && triggerField.validators.indexOf('js_validate') !== -1) {
        //   let validate = await this.evalValidate(this.serviceName, column, fieldModel, this.appName)
        // }
      },
      async getSendMoney() {
        // 查找最小起送金额
        let serviceName = 'srvhealth_store_order_distribution_min_select'
        let req = {
          "serviceName": serviceName,
          "condition": [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo.store_no
          }]
        }
        let res = await this.$fetch('select', serviceName, req, 'health')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          let data = res.data[0]
          this.send_amount = data.send_amount || 0
          return this.send_amount
        }
      },
      async getShippingFee() {
        // 查找配送费
        let serviceName = 'srvhealth_store_order_distribution_amount_select'
        let req = {
          "serviceName": serviceName,
          "condition": [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo.store_no
            },
            {
              colName: "send_amount",
              ruleType: 'eq',
              value: this.totalMoney
            }
          ]
        }
        let res = await this.$fetch('select', serviceName, req, 'health')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          let data = res.data[0]
          this.shippingFee = data.amount || 0
          return this.shippingFee
        }
      },
      async getSrvCols(type = "add", pageType = "") {
        const app = this.fieldsCfg?.app || this.appName || uni.getStorageSync('activeApp');
        const service = this.orderAddService || this.fieldsCfg?.service
        if (app && service) {
          uni.showLoading()
          this.isLoadingCols = true
          let colVs = await this.getServiceV2(service, type, type, app);
          this.colV2 = colVs
          let fields = []
          let defaultVal = null
          if (pageType === 'detail') {
            defaultVal = this.deepClone(this.orderInfo);
            colVs._fieldInfo = colVs._fieldInfo.map(item => {
              if (defaultVal && defaultVal[item.column]) {
                item.value = defaultVal[item.column]
                this.mainData[item.column] = item.value
              }
              return item
            })
            fields = colVs._fieldInfo
          }
          // if (type === 'add') {
          fields = colVs._fieldInfo.map(field => {
            if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
              field.option_list_v2 = field.option_list_v2.map(item => {
                item.checked = false;
                return item;
              });
            }
            if (!field.value && this[field.column]) {
              field.value = this[field.column]
              this.mainData[field.column] = field.value
            }
            if (field.column === 'store_no') {
              field.value = field.value || this.storeInfo?.store_no
              this.mainData[field.column] = field.value
            }

            if (field.column === 'show_params_config' && this.show_params_config) {
              field.value = this.show_params_config
              this.mainData[field.column] = field.value
            }
            if (field.column === 'delivery_type' && this.delivery_type) {
              field.value = this.delivery_type
              this.mainData[field.column] = field.value
            }
            if (field.column === 'order_type' && this.orderType) {
              field.value = this.orderType
              this.mainData[field.column] = field.value
            }

            if (field.column === 'regimental_dumpling_no' && this.tgNo) {
              field.value = this.tgNo
              this.mainData[field.column] = field.value
            }

            if (field.column === 'store_user_no') {
              field.value = field.value || this.vstoreUser?.store_user_no
              this.mainData[field.column] = field.value
            }

            if (this.globalData[field.column]) {
              field.value = field.value || this.globalData[field.column]
            }
            if (this.includesColumns && this.includesColumns.indexOf(field.column) == -1) {
              field.display = false
              field.disabled = true
              field.in_add = 2
            }
            if (this.columnsDefaultVal && this.columnsDefaultVal[field.column]) {
              field.value = this.columnsDefaultVal[field.column];
              field.defaultValue = this.columnsDefaultVal[field.column];
            }
            return field;

          })
          defaultVal = colVs._fieldInfo.reduce((res, cur) => {
            if (cur.defaultValue) {
              res[cur.column] = cur.value || cur.defaultValue
              cur.value = cur.value || cur.defaultValue
              this.mainData[cur.column] = cur.value
            } else if (cur.value) {
              res[cur.column] = cur.value
            }
            return res
          }, {})

          let cols = null;
          // #ifdef MP-WEIXIN
          cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
          //#endif
          // #ifdef H5
          cols = colVs._fieldInfo.filter(item => item.x_if)
          // #endif
          const table_name = colVs.main_table
          let result = null

          defaultVal = this.orderInfo?.order_no ? this.orderInfo : defaultVal
          if (Array.isArray(cols) && cols.length > 0) {
            // #ifdef MP-WEIXIN
            result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)
            // #endif
            // #ifdef H5
            result = {
              response: {

              }
            }
            let data = defaultVal
            cols.forEach(col => {
              let x_if = col?.x_if;
              try {
                if (x_if) {
                  x_if = `(${x_if})(data)`
                  result.response[col.column] = eval(x_if)
                }
              } catch (e) {
                //TODO handle the exception
                console.log(e)
              }
            })
            // #endif
          }

          let calcResult = {}
          let calcCols = colVs._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
            .calc_trigger_col)).map(item => item.column)

          if (Array.isArray(calcCols) && calcCols.length > 0) {
            calcResult = await this.evalCalc(table_name, calcCols, defaultVal, this.appName)
          }

          for (let i = 0; i < fields.length; i++) {
            const item = fields[i]
            if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
                .column] == 0)) {

              if (item.redundant?.trigger === 'always' || !item.value) {
                item.value = calcResult?.response[item.column]
                defaultVal[item.column] = item.value
                this.mainData[item.column] = item.value
              }
            }
            if (item.x_if) {
              if (Array.isArray(item.xif_trigger_col)) {
                if (item.table_name !== table_name) {
                  result = await this.evalX_IF(item.table_name, [item.column], defaultVal, this.appName)
                }
                if (result?.response && result.response[item.column]) {
                  item.display = true
                } else if (result === true) {
                  item.display = true
                } else {
                  item.display = false
                }
              }
            }

            if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
              this.fieldsCond.forEach(item1 => {
                if (item1.column === item.column) {
                  if (item1.hasOwnProperty('display')) {
                    item.display = item1.display;
                  }
                  if (item1.hasOwnProperty('label')) {
                    item.customLabel = item1.label;
                  }
                  if (item1.hasOwnProperty('value')) {
                    item.value = this.renderStr(item1.value, defaultVal);
                  }
                }
              });
            }

            // if(['due_date','id_num','reserve_start_date','reserve_end_date','service_people_no'].includes(item.column)){
            // }

            if (item.column === 'due_date' && this.orderInfo.goodsList.find(e => e.order_show_col && e.order_show_col
                .indexOf('预产期') !== -1)) {
              item.display = true
              item.in_add = 1
            }
            if (item.column === 'id_num' && this.orderInfo.goodsList.find(e => e.order_show_col && e.order_show_col
                .indexOf('身份证号') !== -1)) {
              item.display = true
              item.in_add = 1
            }
            if (item.column === 'reserve_start_date' && this.orderInfo.goodsList.find(e => e.order_show_col && e
                .order_show_col.indexOf('开始日期') !== -1)) {
              item.display = true
              item.in_add = 1
            }
            if (item.column === 'reserve_end_date' && this.orderInfo.goodsList.find(e => e.order_show_col && e
                .order_show_col.indexOf('结束日期') !== -1)) {
              item.display = true
              item.in_add = 1
            }
            if (item.column === 'service_people_no' && this.storeInfo.order_up && this.storeInfo.order_up.indexOf(
                '服务人员项目过滤') !== -1) {
              if (item.option_list_v2?.serviceName) {
                item.option_list_v2.serviceName = 'srvhealth_goods_person_select'
                if (Array.isArray(this.orderInfo.goodsList) && this.orderInfo.goodsList.length > 0) {
                  item.option_list_v2.conditions = [{
                    colName: 'goods_no',
                    ruleType: 'eq',
                    value: this.orderInfo.goodsList[0].goods_no
                  }]
                }

              }
            }
          }

          if (fields.find(item => ['reserve_start_date', 'reserve_end_date'].includes(item.column) && item.display ===
              true)) {
            fields.forEach(item => {
              if (item.column === 'service_date') {
                item.display = false
              }
            })
          }

          this.fields = fields
          uni.hideLoading()
          this.isLoadingCols = false
          return colVs
        }
      },
      setCouponMinus(e) {
        // debugger
        if (Array.isArray(e?.list) && e.list.length > 0) {
          this.curCouponNo = e.list[0]
        }
        if (e?.num) {
          this.couponMinus = e.num
        } else {
          this.couponMinus = 0
        }
      },
      async addVerRecord(order_no, childData) {
        // 增加核销记录
        let goodsList = childData || this.orderInfo.goodsList
        let serviceName = 'srvhealth_store_package_approval_add'
        let req = [{
          "serviceName": serviceName,
          "condition": [],
          "data": []
        }]
        req[0].data = goodsList.map(item => {
          let obj = {
            "order_goods_no": item.order_goods_rec_no,
            "card_case_detail_no": item.card_case_detail_no,
            "card_no": this.card_no || this.couponInfo?.card_no,
            "order_no": order_no,
            "goods_no": item.goods_no,
            "goods_name": item.goods_name,
            "approval_num": item.car_num || item.goods_amount,
            "store_no": this.store_no || this.storeInfo?.store_no,
            service_person: this.mainData?.service_people_no,
            approval_type: this.approval_type || '普通核销'
          }
          let startTime = this.mainData?.service_start_time
          let endTime = this.mainData?.service_end_time
          if (startTime && endTime) {
            let num = (this.dayjs(new Date() + ' ' + startTime) - this.dayjs(new Date() + ' ' + endTime)) / 1000 /
              60
            if (!isNaN(Number(num))) {
              obj.service_time_len = num
            }
          }
          return obj
        })
        let res = await this.$fetch('operate', 'srvhealth_store_package_approval_add', req, 'health')
        if (res.success) {
          return res.data
        } else if (res.msg) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
        return res
      },
      async addPayRecord(order_no) {
        let req = [{
          "serviceName": "srvhealth_store_order_payment_detail_add",
          "condition": [],
          "data": [{
            "pay_type": "支付",
            "order_no": order_no,
            "pay_way": this.couponInfo?.card_type
          }]
        }]
        let res = await this.$fetch('operate', 'srvhealth_store_order_payment_detail_add', req, 'health')
        if (res.success) {
          uni.showModal({
            title: "提示",
            content: '操作成功',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // if (this.uuid) {
                // 	uni.$emit(this.uuid)
                // }
                // 					uni.navigateBack({

                // 					})
              }
            }
          })
        } else if (res.msg) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
        return res
      },
      changeDelivery(e) {
        console.log(e)
        this.delivery_type = this.deliveryList[e].name
      },
      toCouponSelector() {
        if (this.pay_method) {
          return
        }
        // this.payMode = 'coupon'
        let url =
          '/storePages/coupon/coupon?serviceName=srvhealth_store_card_case_select&app=health&mode=selector&pageTitle=支付方式'
        let condition = [{
            colName: 'card_type',
            ruleType: 'in',
            value: '充值卡,面额卡'
          },
          {
            colName: 'use_states',
            ruleType: 'eq',
            value: '使用中'
          },
          // {
          // 	colName: 'use_start_date',
          // 	ruleType: 'le',
          // 	value: this.dayjs().format("YYYY-MM-DD")
          // }, {
          // 	colName: 'use_end_date',
          // 	ruleType: 'ge',
          // 	value: this.dayjs().format("YYYY-MM-DD")
          // },
          {
            colName: 'card_last_amount',
            ruleType: 'ge',
            value: this.totalMoney
          },
          {
            colName: 'useing_store_user_no',
            ruleType: 'eq',
            value: this.vstoreUser?.store_user_no
          }
        ]
        let emitId = uni.$u.guid()
        url += `&cond=${JSON.stringify(condition)}&emitId=${emitId}`
        uni.$on(emitId, (e) => {
          this.payMode = 'coupon'
          this.couponInfo = e
        })
        uni.navigateTo({
          url
        })
      },
      payModeChange(e) {
        this.payMode = e.detail.value === 'wx' ? 'wx' : this.payMode
      },
      getCouponList() {
        const serviceName = 'srvhealth_store_card_case_select'
        const req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
              colName: 'card_type',
              ruleType: 'in',
              value: '充值卡,面额卡'
            }, {
              colName: 'use_states',
              ruleType: 'eq',
              value: '使用中'
            },
            // {
            // 	colName: 'use_start_date',
            // 	ruleType: 'le',
            // 	value: this.dayjs().format("YYYY-MM-DD")
            // }, {
            // 	colName: 'use_end_date',
            // 	ruleType: 'ge',
            // 	value: this.dayjs().format("YYYY-MM-DD")
            // }, 
            {
              colName: 'card_last_amount',
              ruleType: 'ge',
              value: this.totalMoney
            }, {
              colName: 'useing_store_user_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_user_no
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
          "query_source": "list_page"
        }
        const app = this.detailCfg?.app || uni.getStorageSync('activeApp')
        const url = this.getServiceUrl(app, serviceName, 'select');
        if (!this.totalMoney) {
          return
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
            this.couponList = res.data.data
          }
        })
      },
      hideModal() {
        this.modalName = ''
      },
      showSelector() {
        this.modalName = 'Selector'
      },
      changeRepastType(e) {
        // 用餐方式更改
        this.repast_type = e
        if (e == '外卖') {
          this.delivery_type = '卖家配送'
        } else {
          this.delivery_type = ''
        }
      },
      bindPickerChange(e, type) {
        let value = e.detail?.value;
        if (type) {
          this[type] = value
        }
      },
      pickerChange(e) {
        this.room_no = e
        this.modalName = ''
      },
      searchFKDataWithKey(e) {
        if (e && e.detail && e.detail.value) {
          let option = this.roomV2;
          if (Array.isArray(option?.conditions) && option.conditions.length > 0) {
            option.conditions = option.conditions.map(item => {
              if (item.value) {
                item.value = this.renderStr(item.value, this)
              }
              return item
            })
          }
          let relation_condition = {
            relation: 'OR',
            data: []
          };
          if (!option?.key_disp_col && !option?.refed_col) {
            return;
          }

          if (option.key_disp_col) {
            relation_condition.data.push({
              colName: option.key_disp_col,
              value: e.detail.value,
              ruleType: '[like]'
            })
          }
          if (option.refed_col) {
            relation_condition.data.push({
              colName: option.refed_col,
              value: e.detail.value,
              ruleType: '[like]'
            })
          }
          if (Array.isArray(option.conditions) && option.conditions.length > 0) {
            let data = this.deepClone(relation_condition.data)
            relation_condition = {
              relation: 'AND',
              data: [...option.conditions, {
                relation: 'OR',
                data: data
              }]
            }
          }
          this.getSelectorData(null, null, relation_condition);
        } else {
          this.getSelectorData();
        }
      },
      async getSelectorData(cond, serv, relation_condition) {
        let self = this;
        let roomV2 = {
          "refed_col": this.roomV2?.refed_col || "room_no",
          "show_as_pair": this.roomV2?.show_as_pair || false,
          "srv_app": this.roomV2?.srv_app || "store",
          "serviceName": this.roomV2?.serviceName || "srvstore_hotel_room_select",
          "conditions": [{
            "colName": "hotel_no",
            "ruleType": "eq",
            "value": this.store_no
          }],
          "key_disp_col": this.roomV2?.key_disp_col || "room_no"
        }
        let req = {
          serviceName: roomV2.serviceName,
          colNames: ['*'],
          page: {
            pageNo: this.roomPageNo,
            rownumber: 30
          }
        };

        let globalData = getApp().globalData
        let appName = roomV2.srv_app || uni.getStorageSync('activeApp');

        if (cond) {
          req.condition = cond;
        } else if (roomV2 && Array.isArray(roomV2.conditions) &&
          roomV2.conditions.length > 0) {
          let condition = self.deepClone(roomV2.conditions);
          condition = condition.map(item => {
            if (item.value && item.value.indexOf('data.') !== -1) {
              let colName = item.value.slice(item.value.indexOf('data.') + 5);
              if (fieldModelsData[colName]) {
                item.value = fieldModelsData[colName];
              }
            } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
              item.value = uni.getStorageSync('login_user_info').user_no;
            } else if (item.value && item.value.indexOf('globalData.') !== -1) {
              let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
              if (globalData && globalData[colName]) {
                item.value = globalData[colName];
              }
            } else if (item.value && item.value.indexOf("'") === 0 && item.value.lastIndexOf(
                "'") === item.value
              .length - 1) {
              item.value = item.value.replace(/\'/gi, '');
            }
            if (item.value_exp) {
              delete item.value_exp;
            }
            return item;
          });
          if (Array.isArray(condition) && condition.length > 0) {
            req.condition = condition;
          } else {
            return;
          }
        }

        if (relation_condition && typeof relation_condition === 'object') {
          req.relation_condition = relation_condition;
          delete req.condition;
        }
        if (!req.serviceName) {
          return;
        }
        if (!appName) {
          return
        }
        let res = await self.onRequest('select', req.serviceName, req, appName);

        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {

          if (res.data.page && res.data.page.pageNo > 1) {
            let data = res.data.data;
            self.selectorData = [...self.selectorData, ...data];
          } else {
            self.selectorData = res.data.data;
          }
          self.selectorData = self.selectorData.map(item => {
            item.label = roomV2.show_as_pair === true ?
              `${item[ roomV2.key_disp_col||'' ]}/${item[ roomV2.refed_col ]}` : item[roomV2
                .key_disp_col]
            // item.label = roomV2.key_disp_col ? item[roomV2.key_disp_col] : '';
            item.value = roomV2.refed_col ? item[roomV2.refed_col] : '';
            return item;
          });
        } else if (res.data.state === 'SUCCESS' && res.data.data.length == 0) {
          self.selectorData = []
        }
      },
      async updateOrderState(order_state, pay_state, prepay_id, order_no) {
        let serviceName = 'srvhealth_store_order_state_update'
        // srvhealth_store_order_update
        let req = [{
          serviceName: serviceName,
          condition: [{
            colName: 'order_no',
            ruleType: 'eq',
            value: this.orderInfo.order_no
          }],
          data: [{
            pay_state: pay_state
          }]
        }];

        if (order_state) {
          req[0].data[0].order_state = order_state
        }

        if (prepay_id) {
          req[0].data[0].prepay_id = prepay_id
        }

        // await this.$fetch('operate', serviceName, req, 'health')

        // 支付成功后修改订单状态和支付状态
        await this.getOrderInfo()
      },
      // chooseAddress() {
      //   if (this.orderInfo?.rcv_addr_str) {
      //     return
      //   }
      //   let self = this;
      //   // #ifdef MP-WEIXIN
      //   uni.chooseAddress({
      //     success(res) {
      //       self.addressInfo = res;
      //       self.addressInfo.phone = res.telNumber; // 手机号
      //       self.addressInfo.fullAddress = res.provinceName + res.cityName + res.countyName + res
      //         .detailInfo;
      //     }
      //   });
      //   // #endif
      // },
      async getOrderInfo() {
        let req = {
          condition: [{
            colName: 'order_no',
            ruleType: 'in',
            value: this.orderNo
          }]
        };
        let service = 'srvhealth_store_order_user_detail_select'
        service = 'srvhealth_store_order_select'
        let orderInfo = await this.$fetch('select', service, req, 'health');
        if (orderInfo && orderInfo.success && orderInfo.data.length > 0) {
          this.orderInfo = orderInfo.data[0];
          if (this.orderInfo?.regimental_dumpling_no) {
            this.tgNo = this.orderInfo?.regimental_dumpling_no
          }
          if (this.orderInfo.coupon_amount) {
            this.couponMinus = this.orderInfo.coupon_amount
          }
          this.order_remark = this.orderInfo.order_remark || ''
          if (this.orderInfo.order_state === '待支付' && this.orderInfo.pay_state === '取消支付') {
            uni.setNavigationBarTitle({
              title: '等待买家付款'
            });
          }
          let goods = await this.getGoodsList();
          if (this.orderInfo?.order_type === '虚拟商品') {
            // 查找虚拟商品 判断是否未激活
            this.isActive = true
            this.getVirtualGoods()
          }
          return this.orderInfo;
        }
      },
      async getGoodsList() {
        let req = {
          condition: [{
            colName: 'order_no',
            ruleType: 'in',
            value: this.orderNo
          }]
        };
        let goodsList = await this.$fetch('select', 'srvhealth_store_order_goods_detail_select', req,
          'health');
        if (goodsList.success) {
          this.$set(this.orderInfo, 'goodsList', goodsList.data);
        }
      },
      async submitOrder() {
        if (!this.canPlace) {
          uni.showModal({
            title: '提示',
            content: `当前时间段不可下单，请在${this.storeInfo.start_time} - ${this.storeInfo.end_time}下单`,
            showCancel: false,
          })
          return
        }
        if (!this.isFood && this.needIdNum && !this.idNum) {
          uni.showModal({
            title: '提示',
            content: '请输入身份证号',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        if (!this.isFood && this.storeInfo?.type === '酒店' && !this.room_no) {
          uni.showToast({
            title: '请选择房间号',
            icon: 'none',
            duration: 3000,
            mask: true
          })
          return
        }

        // if (!this.isFood && !this.addressInfo.fullAddress && !this.room_no && ['快递', '卖家配送'].includes(this
        //     .delivery_type) &&
        //   this.needAddress && !this.tgNo) {
        //   uni.showToast({
        //     title: '请先选择您的地址信息',
        //     icon: 'none',
        //     mask: true
        //   })
        //   return
        // }

        // if (!this.isFood && (!this.addressInfo.telNumber || !this.addressInfo.userName) && !this.room_no && ['快递',
        //     '卖家配送'
        //   ]
        //   .includes(this.delivery_type) && this.needAddress) {
        //   uni.showToast({
        //     title: '请确认您的姓名、地址、手机号是否填写完善',
        //     icon: 'none',
        //     duration: 3000,
        //     mask: true
        //   })
        //   return
        // }

        if (this.mainData.repast_type && this.mainData.repast_type == '外卖') {
          // 外卖才需要配送费
          let qisong = await this.getSendMoney()
          console.log(this.totalMoney)
          if (qisong <= this.totalMoney) {
            let shippingFee = await this.getShippingFee() //查找配送费
          }
        }

        let formData = this.$refs.bxForm.getFieldModel();
        if (formData == false) {
          return
        }

        uni.showLoading({
          mask: true
        })

        let orderAddService = this.orderAddService || 'srvhealth_store_order_add'
        let req = [{
          serviceName: orderAddService,
          condition: [],
          data: [{
            store_no: this.storeInfo.store_no,
            store_name: this.storeInfo.name,
            store_addr: this.storeInfo?.address,
            image: this.orderInfo.image,
            type: this.orderInfo.type,
            rcv_addr_str: this.addressInfo.fullAddress,
            rcv_name: this.rcv_name || this.addressInfo.userName,
            rcv_telephone: this.rcv_telephone || this.addressInfo.telNumber,
            person_no: this.userInfo?.no,
            person_name: this.userInfo?.name,
            user_account: this.userInfo?.userno,
            store_user_no: this.vstoreUser?.store_user_no,
            nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
              /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
            profile_url: this.userInfo?.profile_url,
            user_image: this.userInfo?.user_image,
            sex: this.userInfo?.sex,
            user_role: this.userInfo?.user_role,
            tobe_paid_amount: this.actualMoney || this.totalMoney,
            order_pay_amount: this.actualMoney || this.totalMoney,
            order_amount: this.actualMoney || this.totalMoney,
            order_remark: this.orderInfo.order_remark || this.order_remark || '',
            pay_state: '待支付',
            order_state: '待支付',
            child_data_list: [{
              serviceName: 'srvhealth_store_order_goods_detail_add',
              condition: [],
              depend_keys: [{
                type: 'column',
                add_col: 'order_no',
                depend_key: 'order_no'
              }],
              data: this.orderInfo.goodsList.map(item => {
                let obj = {
                  is_remark: '待评价',
                  goods_no: item.meal_no || item.goods_no,
                  goods_amount: item.car_num,
                  goods_desc: item.name,
                  store_no: this.orderInfo.store_no,
                  sum_price: item.car_num * item.unit_price,
                  unit_price: Number(item.price || item
                    .unit_price)
                };
                // debugger
                if (item.father_goods_no) {
                  obj.father_goods_no = item.father_goods_no
                }
                if (item.child_data_list) {
                  obj.child_data_list = item.child_data_list
                }
                if (item.goods_source) {
                  obj.goods_source = item.goods_source
                  // if (item.goods_source === '店铺SKU') {
                  // 	obj.goods_no = item.sku_no
                  // }
                }
                if (item.image) {
                  obj.goods_image = item.image;
                }
                if (item.goods_type) {
                  obj.goods_type = item.goods_type;
                }
                if (item.goods_image || item.goods_image) {
                  obj.goods_image = item.goods_image || item.goods_image;
                }

                if (item.card_case_detail_no) {
                  obj.card_case_detail_no = item.card_case_detail_no
                }

                if (item.cart_goods_rec_no) {
                  obj.cart_goods_rec_no = item.cart_goods_rec_no
                }

                return obj;
              })
            }]
          }]
        }];


        // 提交订单时带上表单的值
        if (this.includesColumns) {
          let columns = this.submitColumns || this.includesColumns
          if (typeof formData == 'object') {
            let keys = Object.keys(formData)
            if (keys.length > 0) {
              keys.forEach(key => {
                if (columns && columns.indexOf(key) !== -1 && formData[key]) {
                  req[0].data[0][key] = formData[key] || null
                }
              })
            }
          }
        } else {
          if (typeof formData == 'object') {
            let keys = Object.keys(formData)
            if (keys.length > 0) {
              keys.forEach(key => {
                if (formData[key]) {
                  req[0].data[0][key] = formData[key] || req[0].data[0][key] || null
                }
              })
            }
          }
        }

        if (this.curCouponNo) {
          req[0].data[0].coupon_no = this.curCouponNo
          req[0].data[0].coupon_amount = this.couponMinus
        }

        if (this.shippingFee) {
          // 配送费
          req[0].data[0].shipping_fee = this.shippingFee
        }

        if (this.packagingFee) {
          // 打包费
          req[0].data[0].packaging_fee = this.packagingFee
        }

        if (this.needIdNum && this.idNum) {
          req[0].data[0].id_num = this.idNum
        }
        if (this.room_no) {
          req[0].data[0].rcv_hotel_room_no = this.room_no
        }
        if (this.couponInfo?.card_type) {
          req[0].data[0].pay_method = this.couponInfo?.card_type
        }
        if (this.couponInfo?.card_no) {
          req[0].data[0].card_no = this.couponInfo?.card_no
        }
        if (this.couponInfo?.useing_store_user_no) {
          req[0].data[0].store_user_no = this.couponInfo?.useing_store_user_no
        }

        if (this.couponInfo?.user_image) {
          req[0].data[0].user_image = this.couponInfo?.user_image
        }
        if (this.couponInfo?.sex) {
          req[0].data[0].sex = this.couponInfo?.sex
        }
        if (this.couponInfo?.using_person) {
          req[0].data[0].person_name = this.couponInfo?.using_person
        }
        if (this.delivery_type) {
          req[0].data[0].delivery_type = this.delivery_type
          // if(this.delivery_type==='当面交易'){
          // 	req[0].data[0].order_state = '已发货'
          // }
        }

        if (this.couponInfo?.card_no && this.pay_method) {
          req[0].data[0].pay_state = '已支付'
        }


        if (this.tgNo) {
          // 团长开团编号
          req[0].data[0].regimental_dumpling_no = this.tgNo
          req[0].data[0].delivery_type = '快递'
          // if (this.goodsWay === '快递') {
          //   req[0].data[0].delivery_type = '快递'
          // } else {
          //   // 团长代收
          //   req[0].data[0].delivery_type = '自提'
          // }
        }

        let cartGoodsList = this.orderInfo.goodsList.filter(item => !!item.cart_goods_rec_no)
        if (cartGoodsList.length > 0) {
          req[0].data[0].is_shopping_cart = '是'
          // let ids = cartGoodsList.map(item => item.id).toString()
          // if (ids) {
          //   await this.clearOrderCartGoods(ids)
          // }
        }
        let res = await this.$fetch('operate', orderAddService, req, 'health')
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          console.log(res.data[0]);
          this.orderNo = res.data[0].order_no;

          let childData = res.childData
          let cartGoodsList = this.orderInfo.goodsList.filter(item => !!item.cart_goods_rec_no)
          if (cartGoodsList.length > 0) {
            let ids = cartGoodsList.map(item => item.id).toString()
            if (ids) {
              // await this.clearOrderCartGoods(ids)
            }
          }
          const orderData = await this.getOrderInfo()
          uni.$emit('goods-cart-change')
          this.getSrvCols('add', 'detail')

          if (!this.pay_method) {
            // 微信支付、充值卡、面额卡支付
            if (this.mainData?.pay_config !== '后付') {
              this.onPay = true
              // #ifdef MP-WEIXIN
              let payRes = await this.toPay();
              console.log('payResult', payRes)
              if (!payRes) {
                return
              }
              // #endif
              this.onPay = false

            }
          } else {
            // 卡券核销
            if (res.data[0].order_no) {
              // 创建核销记录
              await this.addVerRecord(res.data[0].order_no, childData)
              // .then(_ => {
              // 创建订单支付记录
              await this.addPayRecord(res.data[0].order_no, childData)
              // 更新订单状态和支付状态
              if (this.delivery_type !== '当面交易') {
                await this.updateOrderState('', '已支付');
              } else {
                this.updateOrderState('', '已支付');
              }
            }
          }
          let afterSubmit = this.moreConfig?.after_submit;
          let effect_data = res.data[0]
          if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
            await this.handleAfterSubmit(afterSubmit, effect_data)
          }

        } else if (res.success == false && res.msg) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
        uni.hideLoading()
        // });
      },
      async clearOrderCartGoods(ids) {
        // 清除购物车中在订单中的商品
        let serviceName = 'srvhealth_store_shopping_cart_goods_detail_delete';
        let req = [{
          "serviceName": serviceName,
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": ids
          }]
        }]
        let url = this.getServiceUrl('health', serviceName, 'operate');
        return await this.$http.post(url, req)
      },
      async payByCoupon(orderData = {}, card_no = "") {
        // 卡券支付
        let req = [{
          "serviceName": "srvhealth_store_card_recharge_detail_add",
          "condition": [],
          "data": [{
            "bill_money": orderData?.order_pay_amount || orderData.order_amount,
            bill_type: "消费",
            card_no: card_no,
            "order_no": orderData.order_no
          }]
        }]
        let url = this.getServiceUrl('health', 'srvhealth_store_card_recharge_detail_add', 'add');
        let res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          uni.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.resultMessage,
            success: (res) => {
              // if(res.confirm){
              // 	uni.navigateBack({})
              // }
            }
          })
          if (this.delivery_type !== '当面交易') {
            await this.updateOrderState('待发货', '已支付');
          } else {
            await this.updateOrderState('', '已支付');
          }
        } else {
          uni.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.resultMessage
          })
        }
      },
      async toPay(onClickbutton = false) {
        this.wxMchId = this.getwxMchId()
        let self = this;
        let orderData = this.deepClone(this.orderInfo);
        let goodsData = this.deepClone(this.orderInfo.goodsList);
        let totalMoney = orderData?.tobe_paid_amount || orderData?.order_pay_amount || orderData.order_amount || this
          .actualMoney || this.totalMoney
        if (typeof totalMoney !== 'number' || totalMoney.toString() === 'NaN') {
          uni.showModal({
            title: '提示',
            content: '订单状态有误',
            showCancel: false
          });
          return;
        }

        if (this.payMode == 'coupon') {
          if (this.couponInfo?.card_no && orderData.order_no) {
            this.payByCoupon(orderData, this.couponInfo?.card_no)
          }
          return true
        }

        if (Array.isArray(this.vloginUser?.roles) && (this.vloginUser.roles.includes('health_admin') || this
            .vloginUser.roles.includes('DEVE_LOPER') || this.vloginUser.roles.includes('bx_rd')) && totalMoney >
          0.01) {
          uni.showToast({
            title: `实际应该支付金额${totalMoney}元,测试人员默认支付0.01元`,
            icon: "none"
          })
          totalMoney = 0.1
        }

        let result = {};
        let goodsName = ''
        if (Array.isArray(this.orderInfo.goodsList) && this.orderInfo.goodsList.length > 0) {
          goodsName = this.orderInfo.goodsList.reduce((res, cur) => {
            if (cur.goods_name) {
              if (res) {
                res += `,${cur.goods_name}`
              } else {
                res += cur.goods_name
              }
            }
            return res
          }, '')
        }

        if (totalMoney == 0) {
          // 价格为0  直接完成订单
          self.orderInfo.order_state = '待发货';
          self.updateOrderState('待发货', '已支付', result.prepay_id).then(_ => {
            self.orderInfo.pay_state = '已支付';
            uni.redirectTo({
              url: '/storePages/successPay/successPay?order_no=' + self.orderInfo.order_no +
                '&totalMoney=' + self.totalMoney
            });
            resolve(true)
          })
          return
        }
        if (orderData.prepay_id) {
          result.prepay_id = orderData.prepay_id;
        } else {
          let profit_sharing = false
          let para_cfg = this.storeInfo?.para_cfg;
          if (para_cfg) {
            try {
              para_cfg = JSON.parse(para_cfg)
            } catch (e) {
              //TODO handle the exception
            }
          }

          if (Array.isArray(para_cfg?.order_profit_sharing) && para_cfg?.order_profit_sharing.indexOf('general') !== -
            1) {
            // 普通订单
            profit_sharing = true
          }

          if (this.tgNo) {
            // 团购订单
            profit_sharing = para_cfg?.order_profit_sharing && para_cfg?.order_profit_sharing.indexOf(
                'group_purchase') !== -
              1;
          }
          result = await this.toPlaceOrder(totalMoney * 100, this.loginUserInfo?.login_user_type,
            orderData, this.wxMchId, goodsName, profit_sharing);
        }
        if (result && result.prepay_id) {
          let res = await this.getPayParams(result.prepay_id, this.wxMchId);

          let payResult = await new Promise((resolve) => {
            wx.requestPayment({
              timeStamp: res.timeStamp.toString(),
              nonceStr: res.nonceStr,
              package: res.package,
              signType: 'MD5',
              paySign: res.paySign,
              success(res) {
                // 支付成功
                self.orderInfo.order_state = '待发货';
                self.updateOrderState('待发货', '已支付', result.prepay_id).then(_ => {
                  self.orderInfo.pay_state = '已支付';
                  uni.redirectTo({
                    url: '/storePages/successPay/successPay?order_no=' + self.orderInfo.order_no +
                      '&totalMoney=' + self.totalMoney
                  });
                  resolve(true)
                })
              },
              fail(res) {
                // 支付失败/取消支付
                self.orderInfo.pay_state = '取消支付';
                self.updateOrderState('待支付', '待支付', result.prepay_id).then(_ => {
                  resolve(false)
                })
              }
            });
          })
          if (payResult == true && onClickbutton == true) {
            let afterSubmit = this.moreConfig?.after_submit;
            let effect_data = this.orderInfo
            if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
              await this.handleAfterSubmit(afterSubmit, effect_data)
            }
          }
          return payResult
        }
        return
      },
    },
    async onLoad(option) {
      if (option.fieldsCond) {
        try {
          this.fieldsCond = JSON.parse(option.fieldsCond)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.orderAddService) {
        this.orderAddService = option.orderAddService
      }
      if (option.approval_type) {
        this.approval_type = option.approval_type
      }

      if (option.disabledEvaluate) {
        this.disabledEvaluate = true
      }

      if (option.disabledRefund) {
        this.disabledRefund = true
      }

      if (option.orderType || option.order_type) {
        this.orderType = option.orderType || option.order_type
      }
      if (option.show_params_config) {
        this.show_params_config = option.show_params_config
      }
      if (option.includesColumns) {
        this.includesColumns = option.includesColumns
      }
      if (option.columnsDefaultVal) {
        try {
          this.columnsDefaultVal = JSON.parse(this.renderStr(option.columnsDefaultVal, this))
        } catch (e) {
          //TODO handle the exception
        }
      }
      this.globalData = getApp().globalData
      if (getApp().globalData?.service_place_no) {
        option.service_place_no = getApp().globalData.service_place_no
      }
      if (option.delivery_type) {
        this.delivery_type = option.delivery_type
      }
      if (option.service_place_no) {
        this.service_place_no = option.service_place_no
        // this.delivery_type = '当面交易'
        // this.getPlaceInfo()
      }
      if (option.tgNo) {
        // 团购编号
        this.tgNo = option.tgNo
        this.addressInfo.telNumber = this.userInfo?.phone || this.userInfo?.phone_xcx || ''
        this.addressInfo.userName = this.userInfo?.name || ''
      }

      if (option.goodsWay) {
        this.goodsWay = option.goodsWay
      }

      if (option.orderType) {
        this.orderType = option.orderType
      }
      if (option.wxMchId) {
        this.wxMchId = option.wxMchId
      }
      if (option.pay_method) {
        this.payMode = 'coupon'
        this.pay_method = option.pay_method
      }
      if (option.cardInfo) {
        try {
          this.couponInfo = JSON.parse(option.cardInfo)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.store_no && option.goods_info) {
        this.store_no = option.store_no
        if (this.cartInfo[option.store_no]) {
          this.orderInfo = this.cartInfo[option.store_no].storeInfo;
          option.goods_info = JSON.parse(decodeURIComponent(option.goods_info));
          if (!option.goods_info.car_num) {
            option.goods_info.car_num = 1;
          }
          this.orderInfo.goodsList = [option.goods_info];
          if (!this.orderInfo.order_state && !this.orderInfo.pay_state) {
            this.orderInfo.order_state = '待提交';
            this.orderInfo.pay_state = '待支付';
          }
        }
      } else if (option.store_no && !option.order_no) {
        // 从购物车进入 还未生成订单
        this.store_no = option.store_no
        if (this.cartInfo[option.store_no] && Array.isArray(this.cartInfo[option.store_no].cart)) {
          this.orderInfo = this.cartInfo[option.store_no].storeInfo;
          this.orderInfo.goodsList = this.cartInfo[option.store_no].cart.map(item => {
            if (!item.car_num) {
              item.car_num = 1;
            }
            return item;
          });
          this.orderInfo.order_state = '待提交';
          this.orderInfo.pay_state = '待支付';
        }
      } else if (option.order_no) {
        this.orderNo = option.order_no;
        await this.getOrderInfo();
      }
      if (this?.storeInfo?.type === '酒店') {
        let room_no = getApp().globalData?.room_no
        if (room_no) {
          this.rcv_hotel_room_no = room_no
          this.room_no = room_no
        }
        // this.getSelectorData()
      }
      if (option.disabled) {
        this.disabled = true
      } else {
        this.getCouponList()
      }
      this.getSrvCols('add', this.orderInfo?.order_no ? 'detail' : '')

      if (option.view_cfg) {
        // 详情页面自定义展示效果
        try {
          try {
            this.view_cfg = JSON.parse(option.view_cfg)
          } catch (e) {
            //TODO handle the exception
            this.view_cfg = JSON.parse(decodeURIComponent(option.view_cfg))
          }
          if (this.view_cfg.hideColumn) {
            this.hideColumn = this.view_cfg.hideColumn
          }
        } catch (e) {
          //TODO handle the exception
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .tree-selector {
    padding: 20rpx 20rpx 40rpx;
  }

  .pay-order {
    // background-color: #fff;
    height: calc(100vh - var(--window-top));
    display: flex;
    flex-direction: column;

    .room-selector {
      padding: 20rpx 40rpx;
      line-height: 40rpx;
      font-size: 16px;
      margin-bottom: 100rpx;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .place-holder {
        color: #666;
      }
    }

    .address-box {
      margin: 20rpx;
      margin-bottom: 0;
      padding: 20rpx;
      display: flex;
      background-color: #fff;
      align-items: center;

      .left {
        height: 50px;
        width: 50px;
        text-align: center;
        line-height: 50px;
        font-size: 30px;
        background: linear-gradient(#ff9700, #ed1c24);
        color: #fff;
        border-radius: 50px;
      }

      .center {
        flex: 1;
        padding: 20rpx;

        .center-select {
          display: flex;
          align-items: center;
        }

        .name {
          line-height: 30px;
          font-size: 16px;
          margin-right: 20rpx;
          font-weight: bold;
        }
      }

      .right {
        font-size: 20px;
        color: #999;
      }
    }

    .person-info {
      // 团购用户信息
      margin: 10px;
      overflow: hidden;

      .cu-form-group {
        .title {
          min-width: 80px;
        }

        input {
          text-align: right;
        }
      }
    }

    .order-detail {
      flex: 1;
      margin-top: 5px;
      padding-bottom: 50px;
      overflow-y: scroll;

      .form-box {
        padding: 5px 10px;

        ::v-deep .form-item-label .label {
          font-size: 14px;
          color: #999;
          font-weight: normal;
        }
      }
    }


    .order-remark {
      // background-color: #F8F8FA;
      background-color: #fff;
      margin: 10px;
      padding: 10px;

      .cu-form-group {
        min-height: 10px;

        .title {
          height: auto;
          line-height: inherit;
        }
      }

      .textarea {
        box-sizing: border-box;
        width: calc(100% - 40rpx);
        padding: 20rpx;
        height: 200rpx;
      }
    }


    .order-info {
      margin: 5px 10px;
      margin-top: 0;
      background-color: #fff;
      padding: 20rpx;

      .detail-info {
        margin: 0;
        padding: 0;
        border-top: 1px solid #F9F9F9;
        border-radius: 0;

        .actual-money {
          font-size: 20px;
          color: #FE5A3F;
        }
      }

      .title-bar {
        padding: 0px 0 5px;
        margin-bottom: 10px;
        border-bottom: 1px solid #f1f1f1;
      }



      .id-number-edit {
        margin-top: 10px;

        .cu-form-group {
          border: 1rpx solid #f1f1f1;
          min-height: 80rpx;
        }

        .remark {
          font-size: 24rpx;
          padding: 10rpx 20rpx;

        }

        .text-cyan {
          color: #0bc99d;
        }
      }

      .store-logo {
        width: 20px;
        height: 20px;
      }

      .store-name {
        font-weight: bold;
        margin-left: 10rpx;
      }

      .goods-item {
        display: flex;

        &+.goods-item {
          margin-top: 20px;
        }

        .goods-image {
          width: 100rpx;
          height: 100rpx;
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
    }

    .order-other-info {
      margin: 5px 10px;
      padding: 10px;
      background-color: #fff;

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;

        .info-label {
          color: #999;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .pay-mode {
      margin: 0 10px;
      overflow: hidden;

      .pay-mode-item {
        background-color: #fff;
        // border-radius: 10rpx;
        min-height: 50px;
        padding: 5px 10px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f1f1f1;
        justify-content: space-between;

        .coupon-info {
          text-align: right;
          margin-right: 10px;

          .amount {
            font-size: 12px;
          }
        }

        .icon {
          font-size: 18px;
          margin-right: 10px;
        }
      }

    }

    .cu-form-group {
      padding: 0;

      .value {
        text-align: right;
        padding: 0;
      }
    }

    .handler-bar {
      background-color: #fff;
      height: 50px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 20rpx;

      .amount {
        font-size: 12px;
        color: #999;
        margin-right: 10px;
      }

      .text {
        font-weight: bold;
      }

      .money-amount {
        padding-right: 10px;
        font-size: 18px;
        color: #E95955;

        .money-operate {
          font-size: 12px;
        }
      }
    }
  }

  .detail-info {
    background-color: #fff;
    padding: 10px;
    margin: 5px 10px;

    &-title {
      font-size: 12px;
      padding: 0 0 5px;
      color: #666;
    }

    &_item {
      display: flex;
      min-height: 30px;
      line-height: 30px;

      &_label {
        width: 30%;
        color: #999;
      }

      &_value {
        padding-left: 5px;
        text-align: right;
        flex: 1;
      }
    }
  }

  .field-list {
    margin: 5px 10px;
    background-color: #fff;
    overflow: hidden;

    .field-title {
      background-color: #f9f9f9;
      padding: 10px;
      display: flex;
      justify-content: space-between;

      .badge {
        background-color: #0bc99d;
        padding: 2px 10px;
        color: #fff;
        border-radius: 30px 30px 30px 5px;
        font-size: 10px;
      }
    }

    .field-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #f8f8f8;

      .place-holder {
        color: #808080;
        font-size: 16px;
        text-overflow: clip;
        white-space: pre;
        word-break: keep-all;
        pointer-events: none;
      }

      &:last-child {
        border-bottom: none;
      }

      .label {
        margin-right: 10px;
        color: #999;
      }

      .value {
        flex: 1;
        text-align: right;

        &.flex-end {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      }
    }
  }
</style>
