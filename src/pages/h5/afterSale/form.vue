<template>
  <view>
    <view class="cu-form-group margin-top">
      <view class="title">退款金额</view>
      <text class="text-red text-xl">￥{{backMoney}}</text>
      <!-- <input placeholder="两字短标题" name="input"></input> -->
    </view>

    <view class="cu-form-group margin-top" v-if="type==='退货退款' || type==='换货'">
      <view class="title">退货方式</view>
      <text class=" ">自行寄回</text>
      <!-- <input placeholder="两字短标题" name="input"></input> -->
    </view>

    <view class="bg-white padding-lr padding-tb-xs margin-top" v-if="type==='换货' && orderInfo"
      @click="toAddressSelector">
      <view class="title">收货地址</view>
      <view class="text-bold text-black">
        <text class="margin-right">{{orderInfo.rcv_name||''}}</text>
        <text>{{orderInfo.rcv_telephone||''}}</text>
      </view>
      <view class="">
        {{orderInfo.rcv_addr_str||''}}
      </view>
    </view>


    <view class="bg-white padding-lr padding-tb-xs margin-top">
      <view class="title" v-if="type==='换货'">换货原因</view>
      <view class="title" v-else>退货原因</view>
      <textarea maxlength="-1" v-model="form.reason" placeholder="请输入退/换货原因"
        class="text-area bg-gray radius padding"></textarea>
      <view class="bg-white  padding-tb-sm">
        <view class="title">添加图片(限制6张)</view>
        <bx-image-upload :custom-btn="false" interfaceName="add" :maxCount="6" :appName="appName"
          tableName="bxhealth_store_return_order" :value="form.picture" index="picture" :action="actionUrl"
          @change="imgChange">
          <!--  <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
            <text class="cuIcon-add"></text>
          </view> -->
        </bx-image-upload>
      </view>
    </view>
    <view class="bottom-button">
      <button class="cu-btn lg bg-blue shadow-blur round" @click="submit">提交</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        appName: "health",
        form: {
          reason: '',
          picture: ""
        },
        order_pay_amount: null,
        order_no: "",
        orderInfo: null,
        goodsInfo: null,
        goodsList: [],
        serviceName: "",
        type: "",
        picture: ""
      }
    },
    computed: {
      actionUrl() {
        return `${this.$api.srvHost}/file/upload`
      },
      backMoney() {
        return this.order_pay_amount || 0
      },
      toAddressSelector() {
        const cond = [{
          "colName": "using_store_user_no",
          "ruleType": "eq",
          "value": this.vstoreUser?.store_user_no
        }]
        let url =
          `/publicPages/list2/list2?selectCol=rcv_addr_no&destApp=health&listType=selectorList&serviceName=srvhealth_shipping_address_select&cond=${JSON.stringify(cond)}&idCol=addr_no`
        const uuid = uni.$u.guid()
        url += `&uuid=${uuid}`
        uni.$on('confirmSelect', (e) => {
          if (e?.uuid === uuid && e.data) {
            let data = e.data;
            this.orderInfo.rcv_name = data?.rcv_name
            this.orderInfo.rcv_telephone = data?.telephone
            this.orderInfo.rcv_addr_str = data?.addr_str
            this.orderInfo.rcv_addr_no = data?.addr_no
          }
        })

        uni.navigateTo({
          url: url
        })

      },
    },
    methods: {
      getOrder() {
        const req = {
          "serviceName": "srvhealth_store_order_select",
          "queryMethod": "select",
          "colNames": ["*"],
          "condition": [{
            "colName": "order_no",
            "value": this.order_no,
            "ruleType": "eq"
          }]
        }
        let url = '/health/select/srvhealth_store_order_select'
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
            this.orderInfo = res.data.data[0]
          }
        })
      },
      imgChange(e) {
        this.form.picture = e
      },
      submit() {
        if (!this.form.reason) {
          uni.showModal({
            title: '提示',
            content: '请填写退款原因',
            showCancel: false
          })
          return
        }
        const req = [{
          "serviceName": "srvhealth_store_return_order_add",
          "condition": [],
          "data": [{
            "order_state": "未收货",
            "person_name": this.userInfo?.name,
            "store_user_no": this.vstoreUser?.store_user_no,
            "nick_name": this.userInfo.nick_name,
            "user_address_no": this.orderInfo.rcv_addr_no,
            "rcv_name": this.orderInfo.rcv_name,
            "rcv_telephone": this.orderInfo.rcv_telephone,
            "store_no": this.curStoreNo,
            "reason": this.form.reason,
            "order_no": this.order_no,
            "type": this.type,
            "return_amount": this.backMoney,
            "audit_state": "申请中",
            picture: this.form.picture
          }]
        }]

        // if (this.type !== '仅退款') {
        req[0].data[0].child_data_list = [{
          "serviceName": "srvhealth_store_return_order_goods_add",
          "condition": [],
          "depend_keys": [{
            "type": "column",
            "add_col": "return_no",
            "depend_key": "return_no"
          }],
          "data": this.goodsList.map(item => {
            return {
              "goods_no": item.goods_no,
              "goods_name": item.goods_name,
              "return_num": item.goods_amount,
              "real_amount": this.backMoney,
              "price": item.unit_price,
            }
          })
        }]
        // }
        const url = `/health/operate/srvhealth_store_return_order_add`
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === "SUCCESS") {
            uni.showModal({
              title: '提示',
              content: '已提交售后申请,请等待工作人员审核',
              showCancel: false,
              success(e) {
                if (e?.confirm) {
                  uni.navigateBack({
                    delta: 2
                  })
                }
              }
            })
          }
        })

      },
    },
    onLoad(option) {
      if (option.goodsList) {
        try {
          this.goodsList = JSON.parse(option.goodsList)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.order_pay_amount) {
        this.order_pay_amount = option.order_pay_amount
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.type) {
        this.type = option.type === '我要换货' ? '换货' : option.type === '我要退货退款' ? '退货退款' : '仅退款'
        uni.setNavigationBarTitle({
          title: option.type
        })
      }
      if (option.order_no) {
        this.order_no = option.order_no
        this.getOrder()
      }
      // if (option.goodsInfo) {
      //   try {
      //     this.goodsInfo = JSON.parse(option.goodsInfo)
      //     if (this.goodsInfo?.order_no) {
      //       this.getOrder()
      //     }
      //   } catch (e) {
      //     //TODO handle the exception
      //   }
      // }
    }
  }
</script>

<style lang="scss">
  .text-area {
    width: 100%;
    height: 200rpx;
  }

  .title {
    text-align: justify;
    padding-right: 15px;
    font-size: 15px;
    position: relative;
    height: 30px;
    line-height: 30px;
    color: #000;
  }

  .bottom-button {
    position: fixed;
    bottom: 50px;
    width: 100%;
    text-align: center;

    .cu-btn {
      width: 90%;
    }
  }
</style>
