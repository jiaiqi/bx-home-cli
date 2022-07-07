<template>
  <view>
    <view class="list-box" v-if="idCol&&goodsList.length>0">
      <view class="list-item" :class="{'disabled':item.last_num===0}" v-for="(item,index) in goodsList" :key="index">
        <radio :value="item[idCol]" :checked="item.checked" style="transform:scale(1);margin-right:10px;"
          @click.stop="checkboxChange(item,index)" />
        <view class="item-content">
          <image :src="getImagePath(item.goods_image,true)" mode="aspectFit" class="image" v-if="item.goods_image">
          </image>
          <view class="image" v-else></view>
          <view class="goods-info">
            <view class="">
              商品名称:{{item.goods_name||'-'}}
            </view>
            <view class="foot-box">
              <view class="text">
                剩余次数:{{item.last_num||'0'}}
              </view>
              <view class="">
                <u-number-box v-model="item.selectNum" :min="1" :max="item.last_num||1"></u-number-box>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="bottom-button">
      <button class="cu-btn bg-blue lg round shadow-blur" @click="confirm" :disabled="!hasChecked">确认</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        idCol: "",
        card_no: "",
        card_type: "",
        goodsList: [],
        appName: "health",
        uuid: "",
        orderInfo: {},
        cardInfo: {}
      }
    },
    computed: {
      hasChecked() {
        return this.goodsList.find(function(item) {
          return item.checked
        })
      }
    },
    methods: {
      toOrderPage() {
        let list = this.goodsList.filter(item => item.checked === true && item.selectNum);
        list = this.deepClone(list)
        if (list.length > 0) {
          list = list.map(goodsInfo => {
            goodsInfo.car_num = goodsInfo.selectNum
            // goodsInfo.price = goodsInfo.unit_price
            return goodsInfo
          })

          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: list
          });
          let url =
            `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo?.store_no }&cardInfo=${JSON.stringify(this.cardInfo)}&pay_method=${this.cardInfo.card_type}`
          // if (this.wxMchId) {
          // 	url += `&wxMchId=${this.wxMchId}`
          // }
          let orderType = this.getOrderType(list)
          url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}`
          if(orderType&&orderType.indexOf('服务')!==-1){
            url+=`&show_params_config=服务场地,服务人员`
          }
          uni.navigateTo({
            url
          });
        }

      },
      async getCardInfo() {
        let serviceName = 'srvhealth_store_card_case_select';
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          "serviceName": "srvhealth_store_card_case_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'card_no',
            ruleType: 'eq',
            value: this.card_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$http.post(url, req)
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.cardInfo = res.data.data[0]
        }
        return this.cardInfo

      },
      async confirm() {
        this.toOrderPage()
        return
        let goodsList = this.goodsList.filter(item => item.checked)
        if (goodsList && goodsList.length > 0) {
          let orderInfo = await this.addOrder(goodsList)
          if (orderInfo?.order_no) {
            // 创建核销记录
            await this.addVerRecord(orderInfo)
            // 创建订单支付记录
            await this.addPayRecord(orderInfo)
          }

        }
      },
      async addOrder(goodsList) {
        let req = [{
          serviceName: 'srvhealth_store_order_add',
          condition: [],
          data: [{
            card_no: this.card_no,
            store_no: this.storeInfo?.store_no,
            store_name: this.storeInfo?.name,
            image: this.storeInfo.image,
            type: this.storeInfo.type,
            // rcv_addr_str: this.addressInfo.fullAddress,
            // rcv_name: this.addressInfo.userName,
            // rcv_telephone: this.addressInfo.telNumber,
            // person_no: this.userInfo.no,
            person_name: this.cardInfo.using_person,
            // user_account: this.userInfo.userno,
            store_user_no: this.cardInfo?.useing_store_user_no || '',
            // nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
            // 	/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
            // profile_url: this.userInfo.profile_url,
            user_image: this.cardInfo.user_image,
            sex: this.cardInfo.sex,
            // user_role: this.userInfo.user_role,
            // order_amount: this.totalMoney,
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
              data: goodsList.map(item => {
                let obj = {
                  goods_no: item.goods_no,
                  goods_amount: item.selectNum || 1,
                  goods_desc: item.goods_name,
                  store_no: this.storeInfo?.store_no
                  // sum_price: item.selectNum * item.unit_price,
                  // unit_price: Number(item.price)
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
        if (this.cardInfo?.card_type) {
          req[0].data[0].pay_method = this.cardInfo.card_type
        }
        let res = await this.$fetch('operate', 'srvhealth_store_order_add', req, 'health')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.orderInfo = res.data[0]
          this.updateOrderState('待发货', '已支付');
          return res.data[0]
        } else if (res.msg) {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
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
            order_state: order_state,
            pay_state: pay_state
          }]
        }];
        // if (prepay_id) {
        // 	req[0].data[0].prepay_id = prepay_id
        // }
        this.$fetch('operate', serviceName, req, 'health').then(res => {
          // 支付成功后修改订单状态和支付状态
          // this.getOrderInfo()
        });
      },
      async addVerRecord(orderInfo) {
        // 增加核销记录
        let goodsList = this.goodsList.filter(item => item.checked)
        let serviceName = 'srvhealth_store_package_approval_add'
        let req = [{
          "serviceName": serviceName,
          "condition": [],
          "data": []
        }]
        req[0].data = goodsList.map(item => {
          let obj = {
            "order_goods_no": item.card_case_detail_no,
            "card_case_detail_no": item.card_case_detail_no,
            "card_no": this.card_no,
            "order_no": orderInfo?.order_no,
            "goods_no": item.goods_no,
            "goods_name": item.goods_name,
            "approval_num": item.selectNum
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
      },
      async addPayRecord(orderInf) {
        let req = [{
          "serviceName": "srvhealth_store_order_payment_detail_add",
          "condition": [],
          "data": [{
            "pay_type": "支付",
            "order_no": orderInf?.order_no,
            "pay_way": this.cardInfo?.card_type
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
                if (this.uuid) {
                  uni.$emit(this.uuid)
                }
                uni.navigateBack({

                })
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
      },
      checkboxChange(e, i) {
        if (e?.last_num < 1) {
          return
        }
        this.goodsList = this.goodsList.map((item, index) => {
          if (i === index) {
            item.checked = !item.checked
          }
          if (item.last_num < 1) {
            item.checked = false
          }
          if (item.checked && item.selectNum === 0) {
            item.selectNum = 1
          }
          return item
        })
      },
      getList() {
        let serviceName = 'srvhealth_store_card_case_detail_select';
        let url = this.getServiceUrl(app, serviceName, 'select');
        let app = this.appName || uni.getStorageSync('activeApp');
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            "colName": "card_no",
            "ruleType": "eq",
            "value": this.card_no
          }],
          "page": {
            "rownumber": 20,
            "pageNo": 1
          },
          "order": [],
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            this.goodsList = res.data.data.map(item => {
              item.checked = false
              item.selectNum = 1
              return item
            })
          }
        })
      },
    },
    onShow() {
      // this.refresh()
      if (this.card_no) {
        this.getList()
      }
    },
    async onLoad(option) {
      if (option.uuid) {
        this.uuid = option.uuid
      }
      if (option.idCol) {
        this.idCol = option.idCol
      }
      if (option.card_no) {
        this.card_no = option.card_no;
        await this.getCardInfo()
        this.getList()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .list-box {
    padding: 10px;
  }

  .list-item {
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    align-items: center;

    &.disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }

    .item-content {
      flex: 1;
      display: flex;

      .image {
        width: 100px;
        height: 80px;
        background-color: #F1F1F1;
        margin-right: 10px;
      }

      .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .foot-box {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .text {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }

  .bottom-button {
    text-align: center;
    padding: 20px 0;
    position: fixed;
    bottom: 50px;
    width: 100%;

    .cu-btn {
      width: 80%;
    }
  }
</style>
