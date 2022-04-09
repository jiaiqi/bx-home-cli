<template>
  <view class="page-wrap" v-if="cardInfo">
    <view class="page-content">
      <view class="card-info" v-if="cardInfo">
        <view class="card-icon">
          <text class="cuIcon-card"></text>
        </view>
        <text v-if="cardInfo" class="margin-right-xs card-name">{{cardInfo.card_name||''}}:{{config.cardNo||''}}</text>
        <text>{{cardInfo.using_person||''}}</text>
      </view>

      <view class="goods-list">
        <view class="goods-item"
          :class="{active:config&&config.goodsNoCol&&curGoods[config.goodsNoCol]=== item[config.goodsNoCol]}"
          v-for="(item,index) in goodsList" :key="index" @click="changeSelectedGoods(item)">
          {{item.goods_name||''}}
        </view>
      </view>
    </view>

    <view class="handler-bar">
      <button class="cu-btn round"
        :class="{'shadow-blur bg-blue':curGoods&&config&&config.goodsNoCol&&curGoods[config.goodsNoCol]}"
        @click="createOrder"><text v-if="curGoods&&curGoods.price"
          class="margin-right-xs">￥{{curGoods.price}}</text>立即支付</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        cardInfo: null,
        goodsList: [],
        curGoods: {},
        orderNo: "",
        orderInfo: {},
        config: {
          cardService: "srvhealth_store_card_case_select", // 会员卡service
          cardApp: "health", // 会员卡的表对应的app
          cardNo: "", // 会员卡编号
          cardNoCol: "card_no", // 会员卡编号字段
          cardDispCol: "", //会员卡显示字段 如会员名称
          goodsApp: "health",
          goodsNoCol: "goods_no",
          goodsService: "srvhealth_store_goods_guest_select", //查找商品的服务
          goodsCondition: [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": 'S0000000000'
          }, {
            "colName": "online_state",
            "ruleType": "eq",
            "value": "上线"
          }, {
            "colName": "goods_type",
            "ruleType": "eq",
            "value": "想豆卡"
          }],
          goodsPriceCol: "", //商品价格字段
          goodsOriginPriceCol: "", //商品原价的字段
          addOrderService: "srvhealth_store_order_add", //创建订单的服务
          orderMoneyCol: "", //订单金额字段
          orderNoCol: "", //订单编号字段
          orderNo: "", //订单编号
          wxMchId: "", //微信商户号
        }

      }
    },
    methods: {
      changeSelectedGoods(e) {
        this.curGoods = e
      },
      // 1. 查找会员卡信息
      async getCard() {
        const serviceName = this.config?.cardService
        const req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: this.config?.cardNoCol,
            ruleType: 'eq',
            value: this.config?.cardNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const app = this.config?.cardApp || uni.getStorageSync('activeApp')
        const url = this.getServiceUrl(app, serviceName, 'select');
        let res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.cardInfo = res.data.data[0]
          return this.cardInfo
        } else {
          uni.showModal({
            title: '提示',
            content: '请先开通会员卡',
            showCancel: false,
            // confirmText:'去开通'
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack({

                })
              }
            }
          })
          return false
        }
      },
      // 2.查找用于充值的商品列表
      getGoods() {
        const serviceName = this.config?.goodsService

        const req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": this.config.goodsCondition,
          "page": {
            "pageNo": 1,
            "rownumber": 100
          }
        }

        const app = this.config?.goodsApp || uni.getStorageSync('activeApp')
        const url = this.getServiceUrl(app, serviceName, 'select');
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
            this.goodsList = res.data.data;
            if (!this.curGoods[this.config.goodsNoCol] && this.goodsList.length > 0) {
              this.curGoods = this.goodsList[0]
            }
          }
        })

      },
      // 创建订单
      async createOrder() {
        let req = [{
          serviceName: this.config.addOrderService,
          condition: [],
          data: [{
            store_no: this.storeInfo.store_no,
            store_name: this.storeInfo.name,
            rcv_name: this.userInfo.name || this.userInfo.nick_name,
            person_no: this.userInfo.no,
            person_name: this.userInfo.name,
            user_account: this.userInfo.userno,
            store_user_no: this.vstoreUser?.store_user_no,
            nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
              /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
            profile_url: this.userInfo.profile_url,
            user_image: this.userInfo.user_image,
            sex: this.userInfo.sex,
            user_role: this.userInfo.user_role,
            order_amount: this.curGoods?.price,
            delivery_type: '当面交易',
            // order_remark: this.order_remark || '',
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
              data: [{
                goods_no: this.curGoods?.goods_no,
                goods_amount: 1,
                store_no: this.storeInfo.store_no,
                sum_price: this.curGoods?.price,
                unit_price: this.curGoods?.price,
                goods_image: this.curGoods?.goods_img,
                goods_type: this.curGoods?.goods_type,
              }]
            }]
          }]
        }];
        let res = await this.$fetch('operate', 'srvhealth_store_order_add', req, 'health')
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          console.log(res.data[0]);
          this.orderNo = res.data[0].order_no;
          this.orderInfo = res.data[0]
          // 微信支付、充值卡、面额卡支付
          this.toPay();
        } else if (res.success == false && res.msg) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
        // });

      },
      updateOrderState(order_state, pay_state, prepay_id, order_no) {
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
        this.$fetch('operate', serviceName, req, 'health').then(res => {
          // 支付成功后修改订单状态和支付状态
          // this.getOrderInfo()
        });
      },
      // 支付
      async toPay() {
        if (this.storeInfo?.wx_mch_id) {
          this.config.wxMchId = this.storeInfo?.wx_mch_id
        }
        let self = this;
        let orderData = this.deepClone(this.orderInfo);

        let totalMoney = orderData.order_amount || this.curGoods?.price
        if (Array.isArray(this.vloginUser?.roles) && (this.vloginUser.roles.includes('health_admin') || this
            .vloginUser.roles.includes('DEVE_LOPER'))) {
          if (totalMoney > 100) {
            totalMoney = 0.01
          } else if (totalMoney >= 10) {
            totalMoney = totalMoney / 1000
          } else {
            totalMoney = totalMoney / 100
          }
        }
        if (typeof totalMoney !== 'number' || isNaN(Number(totalMoney))) {
          uni.showModal({
            title: '提示',
            content: '订单状态有误',
            showCancel: false
          });
          return;
        }
        let result = {};
        if (orderData.prepay_id) {
          result.prepay_id = orderData.prepay_id;
        } else {
          result = await this.toPlaceOrder(totalMoney * 100, this.loginUserInfo?.login_user_type,
            orderData, this.config.wxMchId, this.curGoods?.goods_name);
        }
        if (result && result.prepay_id) {
          let res = await this.getPayParams(result.prepay_id, this.config.wxMchId);
          wx.requestPayment({
            timeStamp: res.timeStamp.toString(),
            nonceStr: res.nonceStr,
            package: res.package,
            signType: 'MD5',
            paySign: res.paySign,
            success(res) {
              // 支付成功
              self.orderInfo.order_state = '已完成';
              self.updateOrderState('已完成', '已支付', result.prepay_id);
              self.orderInfo.pay_state = '已支付';
              uni.showModal({
                title: '提示',
                content: '支付成功',
                showCancel: false,
                success: (res) => {
                  if (res.confirm) {
                    uni.navigateBack({

                    })
                  }
                }
              })
              // let webUrl =
              //   'https://login.100xsys.cn/health/#/storePages/successPay/successPay?order_no=' +
              //   orderData
              //   .order_no + '&totalMoney=' + totalMoney
              // let url =
              //   `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
              // uni.redirectTo({
              //   url
              // });
            },
            fail(res) {
              // 支付失败/取消支付
              self.orderInfo.pay_state = '取消支付';
              self.updateOrderState('待支付', '取消支付', result.prepay_id);
            }
          });
        }
      }
      //

    },
    onLoad(option) {
      Object.keys(this.config).forEach(key => {
        if (option[key]) {
          this.config[key] = option[key]
        }
      })

      this.getCard().then(res=>{
        if(res!==false){
          this.getGoods()
        }
      })
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    height: 100vh;
    background-color: #F8F8F8;

    .page-content {
      height: calc(100vh - var(--window-top) - 80px);
      overflow-y: scroll;

      .card-info {
        background-color: #fff;
        padding: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;

        .card-name {
          flex: 1;
        }

        .card-icon {
          font-size: 20px;
          display: inline-block;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          background-color: #007AFF;
          color: #fff;
          border-radius: 50%;
          margin-right: 10px;
        }
      }

      .goods-list {
        background-color: #fff;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;

        .goods-item {
          padding: 10px;
          flex: 1;
          min-width: 30%;
          text-align: center;
          background-color: #f6f6f6;
          border-radius: 5px;
          margin-right: 10px;
          margin-bottom: 10px;
          border: 1px solid #f6f6f6;

          &:nth-child(3n) {
            margin-right: 0;
          }

          &.active {
            background-color: rgba($color: #007AFF, $alpha: 0.1);
            color: #007AFF;
            border-color: #007AFF;
          }
        }
      }
    }

    .handler-bar {
      height: 80px;
      line-height: 80px;
      background-color: #fff;
      text-align: center;

      .cu-btn {
        width: 70%;
        height: 40px;
        line-height: 40px;
      }
    }
  }
</style>
