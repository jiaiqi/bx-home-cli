<template>
  <view class="pay-order">
    <view class="address-box" @click="chooseAddress" v-if="!room_no&&(storeInfo&&storeInfo.type!=='酒店')">
      <view class="left" v-if="addressInfo && addressInfo.userName && addressInfo.telNumber"><text
          class="cuIcon-locationfill"></text></view>
      <view class="left" v-else><text class="cuIcon-warnfill"></text></view>
      <view class="center" v-if="addressInfo && addressInfo.userName && addressInfo.telNumber">
        <view class="">
          <text class="name">{{ addressInfo.userName || "-" }}</text>
          <text class="phone">{{ addressInfo.phone || "-" }}</text>
        </view>
        <view class="address">{{ addressInfo.fullAddress || "-" }}</view>
      </view>
      <view class="center" v-else>
        <view class="center-select"> 请先选择地址 </view>
      </view>
      <view class="right"><text class="cuIcon-right"></text></view>
    </view>

    <view class="order-detail">
      <view class="order-info">
        <view class="title-bar">
          <image class="store-logo" :src="getImagePath(orderInfo.image)" mode="aspectFill" v-if="orderInfo.image">
          </image>
          <text class="store-logo cuIcon-shop" v-else></text>
          <text class="store-name">{{
            orderInfo.store_name ? orderInfo.store_name : orderInfo.name || ""
          }}</text>
        </view>
        <view class="goods-list">
          <view class="goods-item" v-for="goods in orderInfo.goodsList">
            <image class="goods-image" :src="
                goods.goods_image
                  ? getImagePath(goods.goods_image)
                  : goods.image
                  ? getImagePath(goods.image)
                  : '../static/doctor_default.png'
              " mode=""></image>
            <view class="content">
              <view class="goods-name">{{ goods.name||goods.goods_desc||'' }}
              </view>
            </view>
            <view class="num">
              <view class="price">
                <text class="money-operate">￥</text>
                {{ goods.unit_price ? goods.unit_price : goods.price || "" }}
              </view>
              <view class="amount">x{{
                  goods.goods_amount ? goods.goods_amount : goods.car_num || ""
                }}
              </view>
            </view>
          </view>
        </view>
        <view class="order-remark">
          <textarea class="textarea" v-model="order_remark" placeholder="订单备注" />
        </view>
        <view class="id-number-edit" v-if="needIdNum">
          <view class="cu-form-group ">
            <view class="title">身份证号</view>
            <input :placeholder="'请输入身份证号'" name="input" v-model="idNum" placeholder-style="fontSize:24rpx;"></input>
          </view>
          <view class="remark text-cyan">
            <text class="cuIcon-info"></text> {{needIdRemark||''}}
          </view>
        </view>
      </view>
      <view class="room-selector" v-if="storeInfo&&storeInfo.type==='酒店'" @click="showSelector">
        <view class="place-holder" v-if="!room_no">
          点击选择房间号
        </view>
        <view class="" v-else>
          {{room_no||''}}
        </view>
        <text class="cuIcon-right place-holder"></text>
        <!--        <button class="cu-btn round bg-orange" v-if="!room_no"> <text>点击选择房间号</text></button>
        <button class="cu-btn round bg-orange light" v-else> <text> {{room_no||''}}</text></button> -->
      </view>
    </view>

    <view class="handler-bar">
      <text class="amount">共{{ totalAmount }}件</text>
      <text class="text">合计:</text>
      <text class="money-amount" >
        <text class="money-operate">￥</text>
        <text >{{ totalMoney ? totalMoney / 100 : "" }}</text>
      </text>
      <button class="cu-btn bg-gradual-orange round" :class="'bx-bg-'+theme" @click="submitOrder" v-if="orderInfo.order_state === '待提交'">
        提交订单
      </button>
      <button class="cu-btn bg-gradual-orange round" @click="toPay" v-if="
          orderInfo.order_state === '待支付' &&
          (orderInfo.pay_state === '取消支付' ||
            orderInfo.pay_state === '待支付')
        ">
        付款
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
              <bx-radio v-for="item in selectorData" :name="item.value">{{ item.label }}
              </bx-radio>
            </bx-radio-group>
          </view>
          <view class="dialog-button">
            <!--       <view class="cu-btn bg-blue shadow" @tap="hideModal" v-if="modalName === 'MultiSelector'">确定
            </view> -->
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
  export default {
    data() {
      return {
        store_no: "",
        room_no: "",
        orderNo: '', //订单编号
        orderInfo: {},
        order_remark: "",
        addressInfo: {
          fullAddress: ''
        },
        wxMchId: "", //商户号
        idNum: '', //身份证号
        modalName: "",
        selectorData: [],
        roomOptionList: {},
        roomService: "",
        roomApp: "",
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
        }
      };
    },
    computed: {
      ...mapState({
        userInfo: state => state.user.userInfo,
        loginUserInfo: state => state.user.loginUserInfo,
        cartInfo: state => state.order.cartInfo,
        storeInfo: state => state.app.storeInfo,
        theme:state=>state.app.theme
      }),
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
      totalAmount() {
        if (Array.isArray(this.orderInfo.goodsList)) {
          return this.orderInfo.goodsList.reduce((pre, cur) => {
            if (cur.goods_amount) {
              pre += cur.goods_amount;
            }
            if (cur.car_num) {
              pre += cur.car_num;
            }
            return pre;
          }, 0);
        }
      },
      totalMoney() {
        if (Array.isArray(this.orderInfo.goodsList)) {
          return this.orderInfo.goodsList.reduce((pre, cur) => {
            if (cur.goods_amount && cur.unit_price) {
              pre += cur.goods_amount * cur.unit_price;
            } else if (cur.price && cur.car_num) {
              pre += cur.car_num * cur.price;
            }
            return pre;
          }, 0) * 100
        }
      }
    },
    methods: {
      hideModal() {
        this.modalName = ''
      },
      showSelector() {
        this.modalName = 'Selector'
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
            item.label = roomV2.show_as_pair !== false ?
              `${item[ roomV2.key_disp_col||'' ]}/${item[ roomV2.refed_col ]}` : item[roomV2.key_disp_col]
            // item.label = roomV2.key_disp_col ? item[roomV2.key_disp_col] : '';
            item.value = roomV2.refed_col ? item[roomV2.refed_col] : '';
            return item;
          });
        } else if (res.data.state === 'SUCCESS' && res.data.data.length == 0) {
          self.selectorData = []
        }
      },
      updateOrderState(order_state, pay_state, prepay_id) {
        let req = [{
          serviceName: 'srvhealth_store_order_update',
          condition: [{
            colName: 'id',
            ruleType: 'eq',
            value: this.orderInfo.id
          }],
          data: [{
            order_state: order_state
          }, {
            pay_state: pay_state
          }]
        }];
        if (prepay_id) {
          req[0].data.push({
            prepay_id: prepay_id
          });
        }
        this.$fetch('operate', 'srvhealth_store_order_update', req, 'health').then(res => {
          ;
        });
      },
      chooseAddress() {
        let self = this;
        // #ifdef MP-WEIXIN
        uni.chooseAddress({
          success(res) {
            self.addressInfo = res;
            self.addressInfo.phone = res.telNumber; // 手机号
            self.addressInfo.fullAddress = res.provinceName + res.cityName + res.countyName + res
              .detailInfo;
          }
        });
        // #endif
      },
      async getOrderInfo() {
        let req = {
          condition: [{
            colName: 'order_no',
            ruleType: 'in',
            value: this.orderNo
          }]
        };
        let orderInfo = await this.$fetch('select', 'srvhealth_store_order_select', req, 'health');
        if (orderInfo && orderInfo.success && orderInfo.data.length > 0) {
          this.orderInfo = orderInfo.data[0];
          if (this.orderInfo.order_state === '待支付' && this.orderInfo.pay_state === '取消支付') {
            uni.setNavigationBarTitle({
              title: '等待买家付款'
            });
          }
          let goods = await this.getGoodsList();
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
      submitOrder() {
        if (this.needIdNum && !this.idNum) {
          uni.showModal({
            title: '提示',
            content: '请输入身份证号',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        if (this.storeInfo?.type === '酒店' && !this.room_no) {
          uni.showToast({
            title: '请选择房间号',
            icon: 'none',
            duration: 3000,
            mask: true
          })
          return
        }
        if (!this.addressInfo.fullAddress && !this.room_no) {
          uni.showToast({
            title: '请先选择您的地址信息',
            icon: 'none',
            mask: true
          })
          return
        }

        if ((!this.addressInfo.telNumber || !this.addressInfo.userName) && !this.room_no) {
          uni.showToast({
            title: '请确认您的姓名、地址、手机号是否填写完善',
            icon: 'none',
            duration: 3000,
            mask: true
          })
          return
        }
        let req = [{
          serviceName: 'srvhealth_store_order_add',
          condition: [],
          data: [{
            store_no: this.orderInfo.store_no,
            store_name: this.orderInfo.name,
            image: this.orderInfo.image,
            type: this.orderInfo.type,
            rcv_addr_str: this.addressInfo.fullAddress,
            rcv_name: this.addressInfo.userName,
            rcv_telephone: this.addressInfo.telNumber,
            person_no: this.userInfo.no,
            person_name: this.userInfo.name,
            user_account: this.userInfo.userno,
            nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
              /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
            profile_url: this.userInfo.profile_url,
            user_image: this.userInfo.user_image,
            sex: this.userInfo.sex,
            user_role: this.userInfo.user_role,
            order_amount: this.totalMoney,
            order_remark: this.order_remark || '订单备注',
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
                  goods_no: item.meal_no ? item.meal_no : item
                    .goods_no,
                  goods_amount: item.car_num,
                  goods_desc: item.name,
                  store_no: this.orderInfo.store_no,
                  sum_price: item.car_num * item.unit_price,
                  unit_price: Number(item.price)
                };
                if (item.image) {
                  obj.goods_image = item.image;
                }
                if (item.goods_image) {
                  obj.goods_image = item.goods_image;
                }
                if (item.goods_img) {
                  obj.goods_image = item.goods_img;
                }
                return obj;
              })
            }]
          }]
        }];
        if (this.needIdNum && this.idNum) {
          req[0].data[0].id_num = this.idNum
        }
        if (this.room_no) {
          req[0].data[0].rcv_hotel_room_no = this.room_no
        }
        this.$fetch('operate', 'srvhealth_store_order_add', req, 'health').then(res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            console.log(res.data[0]);
            this.orderNo = res.data[0].order_no;
            this.getOrderInfo().then(data => {
              this.toPay();
            });
          }
        });
      },
      async toPay() {
        let self = this;
        let orderData = this.deepClone(this.orderInfo);
        let goodsData = this.deepClone(this.orderInfo.goodsList);
        if (typeof this.totalMoney !== 'number' || this.totalMoney.toString() === 'NaN') {
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
          result = await this.toPlaceOrder(this.totalMoney || 1, this.loginUserInfo?.login_user_type,
            orderData, this.wxMchId);
        }
        if (result && result.prepay_id) {
          let res = await this.getPayParams(result.prepay_id, this.wxMchId);
          wx.requestPayment({
            timeStamp: res.timeStamp.toString(),
            nonceStr: res.nonceStr,
            package: res.package,
            signType: 'MD5',
            paySign: res.paySign,
            success(res) {
              // 支付成功
              self.orderInfo.order_state = '待发货';
              self.updateOrderState('待发货', '已支付', result.prepay_id);
              self.orderInfo.pay_state = '已支付';
              uni.redirectTo({
                url: '/storePages/successPay/successPay?order_no=' + orderData
                  .order_no + '&totalMoney=' + self.totalMoney
              });
            },
            fail(res) {
              // 支付失败/取消支付
              self.orderInfo.pay_state = '取消支付';
              self.updateOrderState('待支付', '取消支付', result.prepay_id);
            }
          });
        }
      }
    },
    onLoad(option) {
      if (option.wxMchId) {
        this.wxMchId = option.wxMchId
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
      } else if (option.store_no) {
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
        this.getOrderInfo();
      }
      if (this?.storeInfo?.type === '酒店') {
        let room_no = getApp().globalData?.room_no
        if (room_no) {
          this.room_no = room_no
        }
        this.getSelectorData()
      }
    }
  };
</script>

<style lang="scss" scoped>
  .tree-selector {
    padding: 20rpx 20rpx 40rpx;
  }

  .pay-order {
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
        margin-left: 20rpx;
      }
    }

    .address-box {
      margin: 20rpx;
      padding: 20rpx;
      display: flex;
      background-color: #fff;
      border-radius: 10px;
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

    .order-detail {
      flex: 1;
    }

    .order-info {
      margin: 20rpx;
      margin-top: 0;
      background-color: #fff;
      padding: 20rpx 20rpx 40rpx;
      border-radius: 10px;

      .title-bar {
        padding: 20rpx 0 30rpx;
      }

      .order-remark {
        background-color: #F8F8FA;
        border-radius: 20rpx;
        margin-top: 20rpx;

        .textarea {
          box-sizing: border-box;
          width: calc(100% - 40rpx);
          padding: 20rpx;
          height: 200rpx;
        }
      }

      .id-number-edit {
        margin-top: 20rpx;

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
</style>
