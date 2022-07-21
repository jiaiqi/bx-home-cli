<template>
  <view class="page-wrap" :class="{'detail-page':pageType==='detail'}">
    <view class="form-box">
      <!--      <view class="title">
        基本信息
      </view> -->
      <view class="form-group">
        <view class="form-item">
          <view class="form-item-label">
            <text class="text-red margin-right-xs">*</text> 提货方式
          </view>
          <view class="form-item-content">
            <u-radio-group v-model="form.delivery_type">
              <u-radio v-for="item in ['自提','快递']" :key="item" :name="item">
                {{item}}
              </u-radio>
            </u-radio-group>
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 会员账号
        </view>
        <view class="form-item-content" @click="toSelectGoods">
          <text
            v-if="selectedUser&&(selectedUser.person_name||selectedUser.nick_name)">{{selectedUser.person_name||selectedUser.nick_name}}/</text>
          <text v-if="form.store_user_no">{{form.store_user_no}}</text>
          <text class="text-gray" v-else>
            点击选择
          </text>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 联系人
        </view>
        <view class="form-item-content">
          <input type="text" placeholder="输入联系人" placeholder-style="font-size:12px;" v-model="form.rcv_name">
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 手机号
        </view>
        <view class="form-item-content">
          <input type="text" placeholder="输入手机号" placeholder-style="font-size:12px;" v-model="form.rcv_telephone">
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 收货地址
        </view>
        <view class="form-item-content" @click="toSelectAddr">
          <text v-if="selectedAddr&&selectedAddr.addr_str">{{selectedAddr.addr_str}}</text>
          <text v-else-if="form.rcv_addr_no"></text>
          <text class="text-gray" v-else>
            点击选择
          </text>
        </view>
      </view>
    </view>

    <view class="form-box">
      <view class="title">
        商品列表
      </view>

      <view class="text-area padding-xs">
        <button class="cu-btn bg-blue " @click="toGoodsSelector">选择商品</button>
      </view>
    </view>

    <view class="bottom-btn" v-if="pageType!=='detail'">
      <button class="cu-btn lg" @click="onsubmit">提交</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        appName: uni.getStorageSync('activeApp'),
        form: {
          delivery_type: "自提", //提货方式
          store_user_no: "", //会员账号
          rcv_name: "", //联系人
          rcv_telephone: "", //手机号
          rcv_addr_no: "", //收货地址
        },
        provinces: "",
        city: "",
        area: "",
        address: "",
        required: {
          delivery_type: true, //提货方式
          store_user_no: true, //会员账号
          rcv_name: true, //联系人
          rcv_telephone: true, //手机号
          rcv_addr_no: false, //收货地址
        },
        isOnSubmit: false,
        focusField: '',
        pageType: 'add', //add,update,detail
        id: "",
        serviceName: "",
        goodsList: [],
        selectedAddr: null,
        selectedUser: null,
        selectedGoods: ""
      }
    },
    computed: {
      actionUrl() {
        return `${this.$api.srvHost}/file/upload`
      }
    },
    onLoad(option) {
      if (option.type) {
        this.pageType = option.type
      }
      if (option.fieldsCond) {
        try {
          let fieldsCond = JSON.parse(option.fieldsCond)
          if (Array.isArray(fieldsCond) && fieldsCond.length > 0) {
            fieldsCond.forEach(field => {
              if (field.column && this.form.hasOwnProperty(field.column)) {
                this.form[field.column] = field.value
              }
            })
          }
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.id && option.serviceName) {
        this.id = option.id
        this.serviceName = option.serviceName
        this.getDetail()
      }
    },
    methods: {
      addOrder() {
        const req = [{
          "serviceName": "srvhealth_store_replace_order_add",
          "condition": [],
          "data": [{
            "promotion_type": "其他",
            "urge_num": "0",
            "submit_from": "卖方",
            "store_no": this.storeInfo?.store_no,
            "pay_state": "待支付",
            "order_type": "普通商品",
            "order_method": "实时",
            "delivery_type": this.form.delivery_type,
            "since_lift_status": "待提货",
            "merchant_status": "待配送",
            "courier_status": "待发货",
            "repast_status": "待出餐",
            "out_repast_status": "待取餐",
            "server_type": "到店服务",
            "out_server_status": "待安排",
            "server_status": "待服务",
            "hotel_status": "待入住",
            "virtual_type": "自动发货",
            "virtual_status": "待发货",
            "receive_virtual_status": "待领取",
            "rcv_addr_no": "AD220721180001",
            "rcv_addr_str": this.selectedAddr?.addr_str,
            "delivery_method": "现买现交",
            "cus_type": "自建用户",
            "hotel_hy_no": this.userInfo?.userno,
            "person_no": this.userInfo?.no,
            "person_name": this.userInfo?.name || this.userInfo?.nick_name,
            "store_user_no": this.vstoreUser?.store_user_no,
            "order_amount": 0,
            "pay_method": "微信",
            "commission_money": 0,
            "parent_commission_money": 0,
            "regimental_price": 0,
            "rcv_name": this.form.rcv_name,
            "rcv_telephone": this.form.rcv_telephone,
            "is_shopping_cart": "否",
            // "order_remark": "啊啊啊",
            "child_data_list": [{
              "data": [{
                "goods_no": "GD2205310002",
                "goods_amount": 1,
                "goods_type": "产品",
                "goods_name": "隆德堂本草茶饮补肺益气茶",
                "goods_image": "20220531145303034100",
                "origin_price": 198,
                "use_start_date": null,
                "use_end_date": null,
                "one_money_than": 0.2,
                "two_money_than": 0.1,
                "package_goods_no": "TC22053114570002",
                "packaging_fee": 0
              }],
              "serviceName": "srvhealth_store_order_goods_detail_add",
              "depend_keys": [{
                "type": "column",
                "depend_key": "order_no",
                "add_col": "order_no"
              }]
            }]
          }]
        }]
      },
      toGoodsSelector() {
        // 外键多选
        let option_list_v2 = this.fieldData?.fmt;
        let url =
          `/publicPages/list2/list2?disabled=true&selectCol=goods_no&destApp=health&listType=multiSelectByJson&serviceName=srvhealth_store_goods_select`

        let listConfig = {
          "lp_style": "单行",
          img: {
            col: "goods_img",
            "cfg": {
              position: "left",
              width: "80px",
              margin: "0 10px 0 0",
              radius: "10px"
            }
          },
          cols: [{
              col: 'goods_name',
              cfg: {

              }
            },
            {
              col: "goods_no"
            }
          ]
        }
        url += `&listConfig=${JSON.stringify(listConfig)}`

        if (Array.isArray(option_list_v2?.condition) && option_list_v2?.condition.length > 0) {
          let condition = [{
            colName: "store_no",
            ruleType: "eq",
            value: this.store_no
          }]
          url += `&cond=${JSON.stringify(condition)}`
        }

        let idCol = "goods_no"
        if (idCol) {
          url += `&idCol=${idCol}`
        }

        if (this.selectedGoods) {
          url += `&selectedVal=${this.selectedGoods}`
        }

        const uuid = uni.$u.guid()
        url += `&uuid=${uuid}`
        uni.$on('confirmSelect', (e) => {
          if (e.uuid === uuid) {
            if (Array.isArray(e.data)) {
              debugger
              // this.fieldData.jsonValue = e.data;
              // this.fieldData.value = JSON.stringify(e.data)
            }
          }
        })
        uni.navigateTo({
          url: url
        })

      },
      toSelectGoods() {
        const uuid = uni.$u.guid()
        let url =
          `/publicPages/list2/list2?selectCol=store_user_no&destApp=health&listType=selectorList&serviceName=srvhealth_store_user_select&cond=[{"colName":"store_no","ruleType":"like","value":"${this.vstoreUser.store_no}"}]&idCol=store_user_no&uuid=${uuid}`

        const listConfig = {
          "lp_style": "单行",
          "grid_span": "1",
          "btn_cfg": {
            "wrap_row": null,
            "show_custom_btn": false,
            "show_public_btn": false,
            "show": true,
            "bg_style": "line",
            "radius": "10px",
            "size": "",
            "padding": null
          },
          "img": {
            "col": "profile_url",
            "cfg": {
              "padding": "",
              "margin": "0 10px 0 0",
              "border": "",
              "width": "50px",
              "height": "50px",
              "radius": "50%",
              "position": "top",
              "mode": ""
            }
          },
          "cols": [{
            "col": "person_name||nick_name",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#333",
              "min_width": "100%",
              "font_size": "14px",
              "font_weight": "bold",
              "padding": "0 10rpx 0 0"
            }
          }, {
            "col": "phone",
            "cfg": {
              "disp_label": false,
              "align": "left",
              "color": "#333",
              "min_width": "50%",
              "font_size": "14px",
              "padding": "0 10rpx 0 0"
            }
          }]
        }
        url += `&listConfig=${JSON.stringify(listConfig)}`


        uni.$on('confirmSelect', (e) => {
          if (e.uuid === uuid) {
            debugger
            this.form[e.col] = e.val
            this.selectedUser = e.data
          }
        })
        uni.navigateTo({
          url
        })
      },
      toSelectAddr() {
        const uuid = uni.$u.guid()
        let url =
          `/publicPages/list2/list2?selectCol=rcv_addr_no&destApp=health&listType=selectorList&serviceName=srvhealth_shipping_address_select&cond=[{"colName":"using_store_user_no","ruleType":"like","value":"${this.vstoreUser.store_user_no}"}]&idCol=addr_no&uuid=${uuid}`
        uni.$on('confirmSelect', (e) => {
          if (e.uuid === uuid) {
            debugger
            this.form[e.col] = e.val
            this.selectedAddr = e.data

          }
        })
        uni.navigateTo({
          url
        })

      },
      async getGoodsList() {
        const url = `/health/select/srvhealth_store_goods_select`
        const req = {
          "serviceName": "srvhealth_store_goods_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeInfo.store_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 30
          }
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res.data.data)) {
          this.goodsList = res.data.data
        }
      },
      imgChange(val, col) {
        this.form[col] = val
      },
      async getDetail() {
        let serviceName = 'srvhealth_store_user_select'
        const req = {
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.id
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
          "colNames": ["*"],
          "serviceName": serviceName
        }
        const url = `/health/select/${serviceName}`
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
          let data = res.data.data[0]
          if (data?.id) {
            Object.keys(data).forEach(key => {
              if (data[key]) {
                this.form[key] = data[key]
              }
            })
          }
        } else {
          uni.showModal({
            title: '提示',
            content: '数据加载失败',
            showCancel: false,
            success() {
              uni.navigateBack({

              })
            }
          })
        }
      },
      onFocus(key) {
        this.focusField = key
      },
      async onsubmit() {
        this.isOnSubmit = true
        let keys = Object.keys(this.form)
        let unpass = 0;
        for (let key of keys) {
          if (!this.form[key] && this.required[key]) {
            unpass++
            let requiredLabel = {
              person_name: "姓名", //姓名
              sex: "性别", //性别
              phone: "手机号", //手机号
              healthy_info: "健康信息",
              inspection_report: "检查报告"
            }
            uni.showModal({
              title: '提示',
              content: `请填写/上传【${requiredLabel[key]}】`,
              showCancel: false
            })
            this.isOnSubmit = false
            break
          }
        }

        if (unpass > 0) {
          this.isOnSubmit = false
          return
        }

        const service = this.serviceName || 'srvhealth_store_user_add'

        const url = `/health/operate/${service}`

        const req = [{
          "serviceName": service,
          "data": [{
            "store_no": this.storeInfo?.store_no,
            // "person_no": this.userInfo.no,
            // "person_name": this.userInfo.name || this.userInfo.nick_name,
            person_name: this.form.name,
            "phone": this.form.phone,
            sex: this.form.sex,
            age: this.form.age,
            healthy_info: this.form.healthy_info,
            inspection_report: this.form.inspection_report,
            "family_addr": `${this.provinces?this.provinces+'省':''}${this.city?this.city+'市':''}${this.area?this.area+'区':''} ${this.form.family_addr||''}`,
            "urgent_contact": this.form.urgent_contact,
            "urgent_contact_phone": this.form.urgent_contact_phone,
            // "user_image": "",
            "sex": this.form.sex,
            "user_role": "用户",
            "ban_send": "否",
            "invite_user_thissub": 0,
            "invite_user_subchilder": 0,
            "invite_user_totalchilder": 0,
            "sum_amount": 0,
            "is_regimental": "否"
          }]
        }]

        if (this.pageType === 'update' && this.id && this.serviceName) {
          req[0].condition = [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }]
        }

        const res = await this.$http.post(url, req);
        this.isOnSubmit = false
        if (res?.data?.state === 'SUCCESS') {
          uni.showModal({
            title: '提示',
            content: res?.data?.resultMessage || '提交成功!',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack()
              }
            }
          })
        } else {
          uni.showModal({
            title: '提示',
            content: res?.data?.resultMessage,
            showCancel: false
          })
        }
      },
      timeChange(e, key) {
        this.form[key] = e?.detail?.value
      },
      chooseLocation() {
        uni.chooseLocation({
          success: (res) => {
            console.log('位置名称：' + res.name);
            console.log('详细地址：' + res.address);
            console.log('纬度：' + res.latitude);
            console.log('经度：' + res.longitude);
            this.form.longitude = res.longitude
            this.form.latitude = res.latitude
            this.form.address = `${res.address}(${res.name})`
          }
        });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 12px;

    &.detail-page {
      .form-box .form-item .form-item-content {
        border-color: #fff;
        padding: 5px 0;
      }

      .form-box .form-item .form-item-content .input {
        border-color: #fff;
        padding: 5px 0;
      }
    }
  }

  .bottom-btn {
    text-align: center;
    padding: 20px;

    .cu-btn {
      background-color: #ddc185;
      min-width: 150px;
    }
  }

  .form-box {
    background-color: #fff;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 10px;

    .text-area {
      border: 1px solid #f1f1f1;
      min-height: 100rpx;
    }

    .form-group {
      display: flex;

      .form-item {
        flex: 1;
      }
    }

    .title {
      text-align: center;
      // border-bottom: 1px solid #f8f8f8;
      padding-bottom: 10px;
    }

    .form-item {
      display: flex;
      align-items: center;

      &:last-child {
        .form-item-content {
          margin-right: 0;
        }
      }

      .underline {
        text-decoration: underline;
        font-size: 12px;
        padding-left: 5px;
      }

      .form-item-label {
        padding: 8px 0;
        width: 80px;
        text-align: center;

        .text-red {
          font-weight: bold;
          font-size: 18px;
        }
      }

      .form-item-content {
        display: flex;
        align-items: center;
        border-radius: 5px;
        border: 1px solid #f1f1f1;
        flex: 1;
        min-height: 25px;
        padding: 2px 10px;

        input {
          width: 100%;
        }

        .text-grey {
          background-color: #808080;
        }

        &.no-border {
          border-color: transparent;
        }

        .slot-btn {
          width: 150rpx;
          height: 150rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f1f1f1;
          border-radius: 5px;
          margin-right: 5px;

          &.id-card {
            width: 320rpx;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .image {
              width: 300rpx;
              height: 160rpx;
            }

            .title {
              width: 100%;
              font-size: 12px;
              text-align: center;
              padding: 10rpx 10rpx 20rpx;
              border-bottom: none;
            }

            .cu-btn {
              min-width: 60px;
              height: 20px;
              margin: 20rpx 0;
            }
          }

          .cuIcon-add {
            font-size: 30px;
            color: #999;
          }
        }

        .placeholder {
          font-size: 12px;
          color: #ccc;
        }

        .input {
          flex: 1;
          border: 1px solid #f1f1f1;
          border-radius: 5px;
          line-height: 20px;
          padding: 5px 10px;

          .uni-input {
            padding: 0;
            text-align: center;
          }

          .textarea {
            min-height: 100px;
          }
        }
      }
    }
  }
</style>
