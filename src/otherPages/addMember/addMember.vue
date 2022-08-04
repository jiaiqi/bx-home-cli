<template>
  <view class="page-wrap" :class="{'detail-page':pageType==='detail'}">

   <!-- <view class="form-box">
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 头像
        </view>
        <view class="form-item-content no-border margin-top-xs " style="padding:0;">
          <bx-image-upload :disabled="pageType==='detail'" :custom-btn="true" interfaceName="add" :appName="appName"
            tableName="bxhealth_store_user" :value="form.user_image" index="user_image"
            :action="actionUrl" @change="imgChange($event,'user_image')">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </bx-image-upload>
        </view>
      </view>
    </view> -->

    <view class="form-box">
      <view class="title">
        基本信息
      </view>
      <view class="form-group">

        <view class="form-item">
          <view class="form-item-label">
            <text class="text-red margin-right-xs">*</text> 姓名
          </view>
          <view class="form-item-content">
            <input type="text" v-model="form.person_name">
          </view>
        </view>
        <view class="form-item">
          <view class="form-item-label"> 年龄
          </view>
          <view class="form-item-content">
            <input type="text" v-model="form.age">
          </view>
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 性别
        </view>
        <view class="form-item-content">
          <u-radio-group v-model="form.sex">
            <u-radio v-for="item in ['男','女']" :key="item" :name="item">
              {{item}}
            </u-radio>
          </u-radio-group>
          <!-- <input type="text" v-model="form.phone"> -->
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text class="text-red margin-right-xs">*</text> 手机
        </view>
        <view class="form-item-content">
          <input type="text" v-model="form.phone">
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          紧急联系人
        </view>
        <view class="form-item-content">
          <input type="text" v-model="form.urgent_contact">
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          联系人手机
        </view>
        <view class="form-item-content">
          <input type="text" v-model="form.urgent_contact_phone">
        </view>
      </view>
      <view class="form-item" v-if="pageType==='add'">
        <view class="form-item-label">
          家庭住址
        </view>
        <view class="form-item-content">
          <input type="text" v-model="provinces">
        </view>
        <view class="margin-lr-xs text-sm">
          省
        </view>
        <view class="form-item-content">
          <input type="text" v-model="city">
        </view>
        <view class="margin-lr-xs text-sm">
          市
        </view>
        <view class="form-item-content">
          <input type="text" v-model="area">
        </view>
        <view class="margin-lr-xs text-sm">
          区
        </view>
      </view>
      <view class="form-item">
        <view class="form-item-label">
          <text v-if="pageType!=='add'">家庭住址</text>
        </view>
        <view class="form-item-content">
          <input type="text" placeholder="详细地址" placeholder-style="font-size:12px;padding-left:10px;"
            v-model="form.family_addr">
        </view>
      </view>
    </view>

    <!--    <view class="form-box">
      <view class="title">
        健康信息
      </view>
      <view class="text-sm ">
        <text class="text-red margin-right-xs">*</text> 为了更好地为您提供专业的理疗服务，请将您的信息填入下框内
      </view>
      <view class="text-area padding-xs">
        <textarea cols="30" rows="10" v-model="form.healthy_info"></textarea>
      </view>
    </view> -->

    <!--    <view class="form-box">
      <view class="title">
        检查报告
      </view>
      <view class="text-sm ">
        <text class="text-red margin-right-xs">*</text> 上传近3个月的检查报告
      </view>
      <view class="form-item">
        <view class="form-item-content no-border margin-top-xs">
          <bx-image-upload :disabled="pageType==='detail'" :custom-btn="true" interfaceName="add" :appName="appName"
            tableName="bxhealth_store_user" :value="form.inspection_report" index="inspection_report" :action="actionUrl"
            @change="imgChange($event,'inspection_report')">
            <view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
              <text class="cuIcon-add"></text>
            </view>
          </bx-image-upload>
        </view>
      </view>
    </view> -->


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
          person_name: "", //姓名
          age: "", //年龄
          sex: "", //性别
          phone: "", //手机号
          family_addr: "", //家庭住址
          urgent_contact: "", //紧急联系人
          urgent_contact_phone: "", //紧急联系人电话
          healthy_info: "", //健康信息
          inspection_report: "", //检查报告
        },
        provinces: "",
        city: "",
        area: "",
        address: "",
        required: {
          person_name: true, //姓名
          sex: true, //性别
          phone: true, //手机号
          healthy_info: false,
          inspection_report: false
        },
        isOnSubmit: false,
        focusField: '',
        pageType: 'add', //add,update,detail
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
              // healthy_info: "健康信息",
              // inspection_report: "检查报告"
            }
            uni.showModal({
              title: '提示',
              content: `请填写【${requiredLabel[key]}】`,
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
            person_name: this.form.person_name,
            "phone": this.form.phone,
            sex: this.form.sex,
            age: this.form.age,
            // healthy_info:this.form.healthy_info,
            // inspection_report:this.form.inspection_report,
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
