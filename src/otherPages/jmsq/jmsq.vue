<template>
  <view class="page-wrap">
    <view class="form-box">
      <view class="title">
        店铺信息
      </view>
      <view class="form-item">
        <view class="form-item-label">
          店铺名称<text class="text-red">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input type="text" placeholder-class="placeholder" placeholder="隆德堂本草药浴馆(恒大绿洲店)" v-model="form.name">
          </view>

        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          <text> 店铺地址<text class="text-red">*</text></text>
          <text class="text-blue underline" @click="chooseLocation">添加导航</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input type="text" placeholder-class="placeholder" v-model="form.address" placeholder="陕西省西安市灞桥区田家湾恒大绿洲24号楼1单元101室">
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺简介
        </view>
        <view class="form-item-content">
          <view class="input">
            <textarea cols="30" class="textarea" :auto-height="true" v-model="form.introduction"></textarea>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺照片（900x450px）
        </view>
        <view class="form-item-content">
          <u-upload :custom-btn="true" name="file" image-mode="aspectFit" :form-data="setFormData('image')"
            index="image" :header="header" :action="actionUrl" @on-success="onSuccess" @on-remove="onRemove">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </u-upload>
        </view>
      </view>

      <view class="form-item">
        <view class="form-item-label">
          店铺LOGO（350x350px）
        </view>
        <view class="form-item-content">
          <u-upload :max-count="1" :custom-btn="true" name="file" image-mode="aspectFit"
            :form-data="setFormData('image')" index="image" :header="header" :action="actionUrl" @on-success="onSuccess"
            @on-remove="onRemove">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </u-upload>
        </view>
      </view>
    </view>

    <view class="form-box">
      <view class="title">
        营业信息
      </view>
      <view class="form-item">
        <view class="form-item-label">
          联系电话<text class="text-red">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input type="number" placeholder-class="placeholder" v-model="form.telephone">
          </view>

        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          营业时间<text class="text-red">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <picker mode="time" :value="form.start_time" @change="timeChange($event,'start_time')">
              <view class="uni-input">{{form.start_time}}</view>
            </picker>
          </view>
          <text class="margin-lr-xs">至</text>
          <view class="input">
            <picker mode="time" :value="form.end_time" @change="timeChange($event,'end_time')">
              <view class="uni-input">{{form.end_time}}</view>
            </picker>
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          微信商户号<text class="text-red">*</text>
        </view>
        <view class="form-item-content">
          <view class="input">
            <input type="text" placeholder-class="placeholder" v-model="form.wx_mch_id">
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-btn">
      <button class="cu-btn lg" @click="onsubmit">提交</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        header: {
          bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
        },
        formData: {
          // 上传文件时携带的参数
          "serviceName": "srv_bxfile_service",
          "interfaceName": "add",
          "app_no": "health",
          "table_name": "",
          "columns": "user_image"
        },
        form: {
          name: "", //店铺名称
          address:"", //店铺地址
          introduction: '', //店铺介绍
          image: "", //店铺照片
          logo: '', //店铺logo
          telephone: '', //联系电话
          start_time: "", //营业开始时间
          end_time: "", // 营业结束时间
          wx_mch_id: '', //微信商户号
          longitude: '', //地址经度
          latitude: "", //地址纬度
        },
        required: {
          name: true, //店铺名称
          address: true, //店铺地址
          introduction: '', //店铺介绍
          image: "", //店铺照片
          logo: '', //店铺logo
          telephone: true, //联系电话
          start_time: true, //营业开始时间
          end_time: true, // 营业结束时间
          wx_mch_id: true, //微信商户号
          longitude: '', //地址经度
          latitude: "", //地址纬度
        },
        imageUrl: {
          image: [],
          logo: []
        },
        isOnSubmit: false
      }
    },
    computed: {
      actionUrl() {
        return `${this.$api.srvHost}/file/upload`
      }
    },
    methods: {
      async onsubmit() {
        this.isOnSubmit = true
        let keys = Object.keys(this.form)
        let unpass = 0;
        for (let key of keys) {
          if (!this.form[key] && this.required[key]) {
            unpass++
            uni.showModal({
              title: '提示',
              content: '请检查表单是否填写完整!',
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
        const url = `/health/operate/srvhealth_store_mgmt_join_add`
        const req = [{
          "serviceName": "srvhealth_store_mgmt_join_add",
          "condition": [],
          "data": [this.form]
        }]
        req[0].data[0].type = this.storeInfo?.type
        req[0].data[0].home_page_no = this.storeInfo?.home_page_no
        req[0].data[0].parent_no = this.storeInfo?.store_no
        req[0].data[0].audit_status = '待审核'
        req[0].data[0].online_status = '上线'
        const res = await this.$http.post(url, req);
        this.isOnSubmit = false
        if (res?.data?.state === 'SUCCESS') {
          uni.showModal({
            title: '提示',
            content: '提交成功!',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack({

                })
              }
            }
          })
        }
      },
      onSuccess(data, index, lists, name) {
        if (data?.file_no) {
          this.form[name] = data.file_no
          this.imageUrl[name].push(data)
        }
      },
      onRemove(index, lists, name) {
        this.imageUrl[name].splice(index, 1)
      },
      setFormData(column) {
        return {
          // 上传文件时携带的参数
          "serviceName": "srv_bxfile_service",
          "interfaceName": "add",
          "app_no": "health",
          "table_name": "bxhealth_store_mgmt",
          "columns": column,
          file_no: this.form[column] ? this.form[column] : ''
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
            this.form.address = res.address
            this.form.name = res.name
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
  }

  .bottom-btn {
    text-align: center;
    padding: 20px;

    .cu-btn {
      background-color: #ddc185;
      min-width: 100px;
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
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f1f1f1;
          border-radius: 5px;
          margin-right: 5px;

          &.id-card {
            width: 320rpx;
            height: 300rpx;
            padding: 5px;
            display: flex;
            flex-direction: column;

            .title {
              font-size: 12px;
              text-align: left;
            }
          }

          .cuIcon-add {
            font-size: 30px;
            color: #999;
          }
        }

        .placeholder {
          font-size: 12px;
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
