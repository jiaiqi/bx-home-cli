<template>
  <view class="vaccine-item"  @click="showInfo(item)">
    <view class="title">
      <text class="text">
        {{item.vaccine_drug_name}}
      </text>
      <view class="margin-left-xs cu-btn round sm   margin-right bg-yellow light"
        v-if="item.btnTextConfig&&item.btnTextConfig.less&&item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5">
        {{item.btnTextConfig.less.tip||''}}
      </view>
      <view class="margin-left-xs cu-btn round sm   margin-right bg-yellow light"
        v-else-if="item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5">
        库存较少
      </view>
      <view class="margin-left-xs cu-btn round sm  margin-right bg-orange light"
        v-else-if="item.btnTextConfig&&item.btnTextConfig.sellOut&&(!item.stock_count||item.stock_count<1)">
        {{item.btnTextConfig.sellOut.tip||''}}
      </view>
      <view class="margin-left-xs cu-btn round sm  margin-right bg-orange light"
        v-else-if="!item.stock_count||item.stock_count<1">
        待到货
      </view>
      <view class="margin-left-xs cu-btn round sm   margin-right bg-cyan  light "
        v-else-if="item.btnTextConfig&&item.btnTextConfig.needOrder&&item.persons_count!==1">
        {{item.btnTextConfig.needOrder.tip||''}}
      </view>
      <view class="margin-left-xs cu-btn round sm   margin-right bg-cyan light" v-else-if="item.persons_count!==1">
        需要预约
      </view>
      <view class="margin-left-xs cu-btn round sm   margin-right bg-blue light"
        v-else-if="item.btnTextConfig&&item.btnTextConfig.full&&(item.persons_count!==1||(item.persons_count===1&&item.stock_count&&item.stock_count>=5))">
        {{item.btnTextConfig.full.tip||''}}
      </view>
    </view>
    <view class="button-area">

      <view class="button-box">
        <view class="cu-btn sm line-orange border round"
          v-if="item.btnTextConfig&&item.btnTextConfig.less&&item.btnTextConfig.less.button&&item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5">
          {{item.btnTextConfig.less.button}}
        </view>
        <view class="cu-btn sm line-orange border round"
          v-else-if="item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5">
          立即预约
        </view>
        <view class="cu-btn sm line-blue border round" @click.stop="showModal(item)"
          v-else-if="item.btnTextConfig&&item.btnTextConfig.full&&item.btnTextConfig.full.button&&item.persons_count===1&&item.stock_count&&item.stock_count>=5">
          {{item.btnTextConfig.full.button}}
        </view>
        <view class="cu-btn sm line-blue border round" @click.stop="showModal(item)"
          v-else-if="item.persons_count===1&&item.stock_count&&item.stock_count>=5">
          <!-- 随时到店 -->
          预约
        </view>
        <view class="cu-btn sm line-cyan border round " @click.stop="showModal(item)"
          v-else-if="item.btnTextConfig&&item.btnTextConfig.needOrder&&item.btnTextConfig.needOrder.button&&item.persons_count!==1">
          {{item.btnTextConfig.needOrder.button}}
        </view>
        <view class="cu-btn sm line-cyan border round " @click.stop="showModal(item)"
          v-else-if="item.persons_count!==1">
          预约
        </view>
        <view class="cu-btn sm line-orange border round " @click.stop="showModal(item)"
          v-else-if="item.btnTextConfig&&item.btnTextConfig.sellOut&&item.btnTextConfig.sellOut.button&&(!item.stock_count||item.stock_count<1)">
          {{item.btnTextConfig.sellOut.button}}
        </view>
        <view class="cu-btn sm line-orange border round " @click.stop="showModal(item)"
          v-else-if="!item.stock_count||item.stock_count<1">
          到货通知
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      item: {
        type: Object
      },
      
    },
    data() {
      return {
        vaccineInfo: null,
        formModel:{
          
        },
        tip:""
      }
    },
    methods: {
      showRealNameModal(){
          this.formModel.customer_name = this.userInfo.name || this.userInfo.nick_name
          this.formModel.customer_phone = this.userInfo.phone
          this.formModel.customer_birth_day = this.userInfo.birthday
          this.formModel.id_no = this.userInfo.id_no
          this.formModel.phone_xcx = this.userInfo.phone_xcx
          this.modalName = 'realname'
      },
      async updateUserInfo() {
        let data = {}
        if (!this.formModel.customer_name || !this.formModel.customer_phone || !this.formModel
          .customer_birth_day || !this.formModel.id_no) {
          //  || !this.formModel.phone_xcx 暂不校验是否填写小程序手机号
          this.tip = '请确认所有实名信息已填写完整'
          return
        }
        this.tip = ''
        if (!this.userInfo.id_no || this.formModel.id_no) {
          data.id_no = this.formModel.id_no
        }
        if (!this.userInfo.phone || this.formModel.customer_phone) {
          data.phone = this.formModel.customer_phone
        }
        if (!this.userInfo.phone_xcx || this.formModel.phone_xcx) {
          data.phone_xcx = this.formModel.phone_xcx
        }
        if (!this.userInfo.birthday || this.formModel.customer_birth_day) {
          data.birthday = this.formModel.customer_birth_day
        }
        if (this.formModel.customer_name || this.formModel.customer_name) {
          data.name = this.formModel.customer_name
        }
        let req = [{
          "serviceName": "srvhealth_person_info_real_identity_update",
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.userInfo.id
          }],
          "data": [data]
        }]
        let res = await this.$fetch('operate', 'srvhealth_person_info_real_identity_update', req, 'health')
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            let info = res.data.find(item => item.no === uni.getStorageSync('cur_user_no'))
            if (info && info.no) {
              this.$store.commit('SET_USERINFO', info)
            } else if (res.data[0].no) {
              uni.setStorageSync('cur_user_no', res.data[0].no)
              this.$store.commit('SET_USERINFO', res.data[0])
            }
          }
          this.selectTimeArr(this.vaccineInfo)
        }
      },
      async decryptPhoneNumber(e) {
        // 解密手机号信息
        let self = this
        try {
          let sessionStatus = await wx.checkSession()
        } catch (err) {
          // session_key 已经失效， 需要重新执行登录流程
          if (err) {
            uni.showToast({
              title: err,
              icon: false
            })
          }
          await this.toAddPage()
        }
      
        if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf('ok') !== -1) {
          let url = this.getServiceUrl('wx', 'srvwx_app_data_decrypt', 'operate')
          let req = [{
            data: [{
              encryptedData: e.detail.encryptedData,
              signature: e.detail.iv
            }],
            serviceName: 'srvwx_app_data_decrypt'
          }]
          let res = await this.$http.post(url, req);
          if (res.data.resultCode === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response
            .length > 0 && res.data.response[0].response && res.data.response[0].response.phoneNumber) {
            this.formModel.phone_xcx = res.data.response[0].response.phoneNumber
            this.formModel.customer_phone = res.data.response[0].response.phoneNumber
          } else {
          }
        }
      },
      showModal(e) {
          if (e.persons_count === 1) {
            if (!e.stock_count || e.stock_count < 1) {
              return
            }
            this.selectVaccineDayList(e)
          }
          this.vaccineInfo = e
          if (this.userInfo && (!this.userInfo.id_no || !this.userInfo.phone || !this.userInfo.phone_xcx)) {
            this.showRealNameModal()
          } else {
            this.selectTimeArr(e)
          }
        
      }
    },
  }
</script>

<style lang="scss" scoped>
  .vaccine-item {
    margin: 0 20rpx;
    // padding: 5rpx 20rpx;
    margin-bottom: 10rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    &:first-child {
      margin-top: 10px;
    }

    .button-area {
      display: flex;
      align-items: center;
      font-size: 24rpx;
    }

    .title {
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      text-align: left;
      flex: 1;
      color: #9092A5;

      .text {
        display: inline-block;
        max-width: 60%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .light {
        background-color: #edf2fe;
      }
    }

    .desc {
      flex: 1;
    }

    .button-box {
      flex: inherit;
      // min-width: 75px;
    }
  }
</style>
