<template>
  <view class="page-wrap" :class="{'detail-page':pageType==='detail'}">
    <view class="form-box">
      <view class="title">
        店铺信息
      </view>
      <view class="form-item">
        <view class="form-item-label">
          店铺名称<text class="text-red" v-if="pageType!=='detail'">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="text" placeholder-class="placeholder" @blur="onFocus('')"
              @focus="onFocus('name')" :placeholder="focusField==='name'?'':'隆德堂本草药浴馆(恒大绿洲店)'" v-model="form.name">
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          <text> 店铺地址<text class="text-red" v-if="pageType!=='detail'">*</text></text>
          <text class="text-blue underline" @click="chooseLocation">添加导航</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="text" placeholder-class="placeholder" v-model="form.address"
              @blur="onFocus('')" @focus="onFocus('address')"
              :placeholder="focusField==='address'?'':'陕西省西安市灞桥区田家湾恒大绿洲24号楼1单元101室'">
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺简介
        </view>
        <view class="form-item-content">
          <view class="input">
            <textarea :disabled="pageType==='detail'" cols="30" class="textarea" :auto-height="true"
              v-model="form.introduction"></textarea>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺照片（900x450px）
        </view>
        <view class="form-item-content">
          <bx-image-upload :disabled="pageType==='detail'" :custom-btn="true" :clipWidth="900" :clipHeight="450"
            interfaceName="add" :appName="appName" tableName="bxhealth_store_mgmt" v-model="form.image" index="image"
            :action="actionUrl">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </bx-image-upload>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺LOGO（350x350px）<text class="text-red" v-if="pageType!=='detail'">*</text></text>
        </view>
        <view class="form-item-content">
          <bx-image-upload :disabled="pageType==='detail'" :custom-btn="true" :clipWidth="350" :clipHeight="350"
            interfaceName="add" :appName="appName" tableName="bxhealth_store_mgmt" v-model="form.logo" index="logo"
            :action="actionUrl">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </bx-image-upload>
        </view>
      </view>
    </view>

    <view class="form-box">
      <view class="title">
        营业资质
      </view>

      <view class="form-item">
        <view class="form-item-label">
          营业执照<text class="text-red" v-if="pageType!=='detail'">*</text></text>
        </view>
        <view class="form-item-content">
          <bx-image-upload :disabled="pageType==='detail'" :custom-btn="true" interfaceName="add" :appName="appName"
            tableName="bxhealth_store_mgmt" v-model="form.business_license" index="business_license"
            :action="actionUrl">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </bx-image-upload>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          法人身份证<text class="text-red" v-if="pageType!=='detail'">*</text></text>
        </view>
        <view class="form-item-content">
          <bx-image-upload :disabled="pageType==='detail'" :width="300" :height="300" :max-count="1" :custom-btn="true"
            interfaceName="add" :appName="appName" tableName="bxhealth_store_mgmt" v-model="form.legal_person_id_card"
            index="legal_person_id_card" :action="actionUrl">
            <view slot="addBtn" class="slot-btn id-card" hover-class="slot-btn__hover" hover-stay-time="150">
              <view class="title">
                请上传身份证正面(国徽面)
              </view>
              <image class="image" src="../static/img/b.jpg" mode="aspectFit"></image>
              <view class="cu-btn bg-blue ">
                拍照
              </view>
            </view>
          </bx-image-upload>

          <bx-image-upload :disabled="pageType==='detail'" :width="300" :height="300" :max-count="1" :custom-btn="true"
            interfaceName="add" :appName="appName" tableName="bxhealth_store_mgmt"
            v-model="form.legal_person_id_card_reverse" index="legal_person_id_card_reverse" :action="actionUrl">
            <view slot="addBtn" class="slot-btn id-card" hover-class="slot-btn__hover" hover-stay-time="150">
              <view class="title">
                请上传身份证反面(人像面)
              </view>
              <image class="image" src="../static/img/a.jpg" mode="aspectFit"></image>
              <view class="cu-btn bg-blue margin-bottom-xs">
                拍照
              </view>
            </view>
          </bx-image-upload>

        </view>
      </view>
    </view>

    <view class="form-box">
      <view class="title">
        营业信息
      </view>
      <view class="form-item">
        <view class="form-item-label">
          联系电话<text class="text-red" v-if="pageType!=='detail'">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="number" placeholder-class="placeholder"
              v-model="form.telephone">
          </view>

        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          营业时间<text class="text-red" v-if="pageType!=='detail'">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <picker :disabled="pageType==='detail'" mode="time" :value="form.start_time"
              @change="timeChange($event,'start_time')">
              <view class="uni-input">{{form.start_time||'-'}}</view>
            </picker>
          </view>
          <text class="margin-lr-xs">至</text>
          <view class="input">
            <picker :disabled="pageType==='detail'" mode="time" :value="form.end_time"
              @change="timeChange($event,'end_time')">
              <view class="uni-input">{{form.end_time||'-'}}</view>
            </picker>
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          微信商户号<text class="text-red" v-if="pageType!=='detail'">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="text" placeholder-class="placeholder" v-model="form.wx_mch_id">
          </view>
        </view>
      </view>
    </view>
    <view class="form-box">
      <view class="title">
        分佣设置
      </view>
      <view class="form-item">
        <view class="form-item-label">
          一级分佣比例
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="digit" placeholder-class="placeholder"
              v-model="form.one_money_than">
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          二级分佣比例
        </view>
        <view class="form-item-content">
          <view class="input">
            <input :disabled="pageType==='detail'" type="digit" placeholder-class="placeholder"
              v-model="form.two_money_than">
          </view>
        </view>
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
          name: "", //店铺名称
          address: "", //店铺地址
          introduction: '', //店铺介绍
          image: "", //店铺照片
          // image: "20220617163010983100", //店铺照片
          logo: '', //店铺logo
          telephone: '', //联系电话
          start_time: "", //营业开始时间
          end_time: "", // 营业结束时间
          business_license: "", //营业执照
          legal_person_id_card: "", //法人身份证
          legal_person_id_card_reverse: "", //法人身份证反面
          wx_mch_id: '', //微信商户号
          longitude: '', //地址经度
          latitude: "", //地址纬度
          one_money_than: "", //一级分佣比例
          two_money_than: "", //二级分佣比例
          order_up: "分享赚钱", //下单设置，set
          mgmt_button_type: "配置", //管理入口按钮类型
        },
        required: {
          name: true, //店铺名称
          address: true, //店铺地址
          introduction: '', //店铺介绍
          image: "", //店铺照片
          logo: true, //店铺logo
          telephone: true, //联系电话
          start_time: true, //营业开始时间
          end_time: true, // 营业结束时间
          business_license: true, //营业执照
          legal_person_id_card: true, // 法人身份证
          legal_person_id_card_reverse: true,
          wx_mch_id: true, //微信商户号
          longitude: '', //地址经度
          latitude: "", //地址纬度
        },
        imageUrl: {
          image: [],
          logo: [],
          business_license: [],
          legal_person_id_card: [],
          legal_person_id_card_reverse: []
        },
        isOnSubmit: false,
        focusField: '',
        pageType: 'detail', //add,update,detail
        id: "",
        serviceName: "",
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
      async getDetail() {
        let serviceName = 'srvhealth_store_mgmt_select'
        serviceName = 'srvhealth_store_cus_niming_detail_select'
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
              name: '店铺名称', //店铺名称
              address: '店铺地址', //店铺地址
              logo: '店铺logo', //店铺logo
              telephone: '联系电话', //联系电话
              start_time: '营业开始时间', //营业开始时间
              end_time: '营业结束时间', // 营业结束时间
              business_license: '营业执照', //营业执照
              legal_person_id_card: '法人身份证', // 法人身份证
              legal_person_id_card_reverse: '法人身份证（反）',
              wx_mch_id: '微信商户号', //微信商户号
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
        debugger
        const service = this.serviceName || 'srvhealth_store_mgmt_join_add'

        const url = `/health/operate/${service}`
        const req = [{
          "serviceName": service,
          "condition": [],
          "data": [this.form]
        }]

        if (this.pageType === 'update' && this.id && this.serviceName) {
          req[0].condition = [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }]
        } else {
          req[0].data[0].type = this.storeInfo?.type
          req[0].data[0].home_page_no = this.storeInfo?.home_page_no
          req[0].data[0].parent_no = this.storeInfo?.store_no
          req[0].data[0].online_status = '上线'
        }

        // req[0].data[0].audit_status = '待审核'

        const res = await this.$http.post(url, req);
        this.isOnSubmit = false
        if (res?.data?.state === 'SUCCESS') {
          uni.showModal({
            title: '提示',
            content: '提交成功!',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack()
              }
            }
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

    .title {
      text-align: center;
      border-bottom: 1px solid #f8f8f8;
      padding-bottom: 10px;
    }

    .form-item {


      .underline {
        text-decoration: underline;
        font-size: 12px;
        padding-left: 5px;
      }

      .form-item-label {
        padding: 8px 0;

        .text-red {
          font-weight: bold;
          font-size: 18px;
        }
      }

      .form-item-content {
        display: flex;
        align-items: center;

        .slot-btn {
          width: 200rpx;
          height: 200rpx;
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
              width: 60px;
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
