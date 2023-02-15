<template>
  <view class="vaccine-list" :style="{'--page-height':pageHeight}">
    <view class="vaccine-list-box">
      <view class="tab-list">
        <view class="tab-item" :class="[curSub===index?'active':'','tab-item-'+index]" v-for="(item,index) in subList"
          :key="index" @click="changeSub(index)">
          {{item.name||''}}
        </view>
      </view>
      <view class="vaccine-item" v-for="(item,itemIndex) in vaccineList" :key="itemIndex" @click="showInfo(item)">
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
              v-if="item.btnTextConfig&&item.btnTextConfig.less&&item.btnTextConfig.less.button&&item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5"
              @click.stop="showModal(item)">
              {{item.btnTextConfig.less.button}}
            </view>
            <view class="cu-btn sm line-orange border round"
              v-else-if="item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5"
              @click.stop="showModal(item)">
              立即预约
            </view>
            <view class="cu-btn sm line-blue border round" @click.stop="showModal(item)"
              v-else-if="item.btnTextConfig&&item.btnTextConfig.full&&item.btnTextConfig.full.button&&item.persons_count===1&&item.stock_count&&item.stock_count>=5">
              {{item.btnTextConfig.full.button}}
            </view>
            <view class="cu-btn sm line-blue border round" @click.stop="showModal(item)"
              v-else-if="item.persons_count===1&&item.stock_count&&item.stock_count>=5">
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
    </view>

    <view class="cu-modal" :class="{'show':modalName==='vaccine-info'}" @click="hideModal" @touchmove.prevent>
      <view class="cu-dialog" @click.stop>
        <view class="vaccine-info">
          <view class="vaccine-name" v-if="vaccineInfo.vaccine_drug_name">
            {{vaccineInfo.vaccine_drug_name}}
          </view>

          <view class="vaccine-detail" v-if="vaccineInfo.usage">
            <view class="label">用法:</view>
            <view class="value">
              {{vaccineInfo.usage}}
            </view>
            <view class="tips" v-if="vaccineInfo.remark_pic&&isArray(imagesUrl)"
              @tap="toPreviewImage(imagesUrl.map(e=>e.originUrl))">
              点击查看照片说明
            </view>
          </view>
          <view class="vaccine-detail" v-if="vaccineInfo.remark">
            <view class="label">说明:</view>
            <view class="value">
              {{vaccineInfo.remark}}
            </view>
          </view>
          <view class="image-box" v-if="vaccineInfo.remark_pic&&isArray(imagesUrl)">
            <image :src="item.smallUrl" mode="aspectFit" class="remark-pic" v-for="item in imagesUrl"
              :key="item.smallUrl" @tap="toPreviewImage(imagesUrl.map(e=>e.originUrl))">
            </image>
            <view class="tips" v-if="vaccineInfo.remark_pic&&isArray(imagesUrl)"
              @tap="toPreviewImage(imagesUrl.map(e=>e.originUrl))">
              点击照片查看详情
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="cu-modal" :class="{'show':modalName==='realname'}" @click="hideModal" @touchmove.prevent>
      <view class="cu-dialog" @click.stop>
        <!-- 实名登记信息 -->
        <view class="modal-title text-bold text-cyan bg-white">
          请先完善实名信息
        </view>
        <form class="realname-form">
          <view class="cu-form-group">
            <view class="title">姓名</view>
            <input placeholder="请输入您的真实姓名" name="input" v-model="formModel.customer_name"></input>
          </view>
          <view class="cu-form-group">
            <view class="title">身份证号</view>
            <input placeholder="请输入您的身份证号" name="input" type="idcard" v-model="formModel.id_no"></input>
          </view>
          <view class="cu-form-group">
            <view class="title">出生日期</view>
            <picker mode="date" v-model="formModel.customer_birth_day" start="1930-09-01" end="2022-09-01"
              @change="DateChange">
              <view class="picker birthday">
                {{formModel.customer_birth_day||'请选择'}}
              </view>
            </picker>
          </view>
          <view class="cu-form-group">
            <view class="title">手机号码</view>
            <text v-if="!formModel.phone_xcx">点击右侧按钮获取手机号</text>
            <!-- 				<input placeholder="请先授权获取手机号" name="input" type="number" v-model="formModel.customer_phone"
							:disabled="!formModel.phone_xcx" v-else></input> -->
            <input placeholder="请先授权获取手机号" name="input" type="number" v-model="formModel.customer_phone" v-else></input>
            <view class="cu-capsule radius" v-if="!formModel.phone_xcx">
              <button class="cu-tag bg-blue" type="primary" open-type="getPhoneNumber"
                @getphonenumber="decryptPhoneNumber">
                获取手机号
              </button>
            </view>
          </view>
        </form>
        <view class="bg-white tip text-red" v-if="tip">
          {{tip}}
        </view>
        <view class="button-box">
          <button type="primary" class="cu-btn bg-blue" @click="updateUserInfo">确定</button>
        </view>
      </view>
    </view>
    <view class="" style="margin-top:30vh;" v-if="loadStatus==='noMore'&&vaccineList.length===0">
      <u-empty text="数据为空" mode="list">
      </u-empty>
    </view>
    <uni-load-more :status="loadStatus" v-if="loadStatus!=='noMore'||(loadStatus==='noMore'&&vaccineList.length!==0)">
    </uni-load-more>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  // 在页面中定义插屏广告
  let interstitialAd = null

  const dayjs = require('dayjs');
  export default {
    data() {
      return {
        curSub: 0,
        vaccineList: [],
        condition: [], // 查询条件
        loadStatus: 'noMore', //more,loading,noMore
        page: {
          pageNo: 1,
          rownumber: 15,
          total: 0
        },
        modalName: '',
        selectedVaccine: {},
        activeField: '',
        formModel: {
          id_no: '',
          phone_xcx: '',
          customer_name: "",
          customer_birth_day: "",
          customer_phone: '',
          appoint_remark: ''
        },
        timeArr: [],
        imagesUrl: [],
        vaccineInfo: {}, // 疫苗信息
        curVac: {
          data: []
        },
        tip: '',
        storeNo: "",
        moreConfig: {}
      }
    },
    computed: {
      subList() {
        let res = [{
          name: "一类"
        }, {
          name: "二类"
        }]
        if (this.moreConfig?.vaccine_type) {
          res = this.moreConfig.vaccine_type.split(',').map(item => {
            return {
              name: item
            }
          })
        } else if (this.moreConfig?.tabs?.col && this.moreConfig?.tabs?.val) {
          res = this.moreConfig.tabs.val.split(',').map(item => {
            return {
              name: item,
              col: this.moreConfig?.tabs?.col
            }
          })
        }
        return res
      },
      pageHeight() {
        return 'calc(100vh - var(--window-top) - var(--window-bottom)  + 20px)'
      },
      ...mapState({
        userInfo: state => state.user.userInfo
      })
    },

    methods: {
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
          this.hideModal()
          if (Array.isArray(res.data) && res.data.length > 0) {
            uni.setStorageSync('cur_user_no', res.data[0].no)
            this.$store.commit('SET_USERINFO', res.data[0])
          }
        }
      },
      changeSub(index) {
        this.curSub = index
        this.page.pageNo = 1
        this.getVaccineList()
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
          let result = await wx.login()
          if (result.code) {
            await self.wxLogin({
              code: result.code
            })
          }
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
            // wx.checkSession({
            // 	fail(err) {
            // 		// session_key 已经失效， 需要重新执行登录流程
            // 		wx.login({
            // 			success(result) {
            // 				if (result.code) {
            // 					self.wxLogin({
            // 						code: result.code
            // 					}).then(_ => {
            // 						self.decryptPhoneNumber(e)
            // 					})
            // 				}
            // 			}
            // 		})
            // 	}
            // })
          }
        }
      },
      hideModal() {
        this.vaccineInfo = {}
        this.curVac = {}
        this.selectedVaccine = {}
        this.modalName = ''
        Object.keys(this.formModel).forEach(key => {
          this.formModel[key] = ''
        })
      },
      onFocus(e) {
        this.activeField = e
      },
      DateChange(e) {
        this.formModel.customer_birth_day = e.detail.value
      },
      onBlur() {
        this.activeField = ''
      },
      async getVaccineList(type = 'refresh') {
        // 查找可预约疫苗列表
        if (type === 'refresh') {
          this.page.pageNo = 1
        }
        let req = {
          "page": {
            "pageNo": this.page.pageNo,
            "rownumber": this.page.rownumber
          },
          condition: [{
            colName: this.subList[this.curSub].col || 'vaccine_type',
            ruleType: 'eq',
            value: this.subList[this.curSub].name
          }]
        }
        if (this.storeNo) {
          req.condition.push({
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          })
        } else {
          return
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccine_stocks_select', req, 'health')
        if (res.success) {
          res.data = res.data.map(item => {
            if (item.button_text) {
              try {
                item.btnTextConfig = JSON.parse(item.button_text)
              } catch (e) {
                //TODO handle the exception
                console.log(e)
              }
            }
            return item
          })
          if (type === 'refresh') {
            this.vaccineList = res.data
          } else {
            this.vaccineList = [...this.vaccineList, ...res.data]
          }
          if (res.page) {
            if (res.page.total > res.page.rownumber * res.page.pageNo) {
              this.loadStatus = 'more'
              this.page.pageNo++
            } else {
              this.loadStatus = 'noMore'
            }
          }
        }

        // 在适合的场景显示插屏广告
        if (interstitialAd) {
          interstitialAd.show().catch((err) => {
            console.error(err)
          })
        }
        return this.vaccineList
      },
      async getImage(e) {
        if (e && e.remark_pic) {
          this.imagesUrl = [];
          let images = await this.getFilePath(e.remark_pic)
          if (Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
              const obj = {
                originUrl: `${this.$api.getFilePath}${images[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`,
                smallUrl: `${this.$api.getFilePath}${images[ i ].fileurl}&thumbnailType=fwsu_100&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
              }
              this.imagesUrl.push(obj);
            }
          }
        }
      },
      async showInfo(e) {
        this.vaccineInfo = e
        this.getImage(e)
        this.modalName = 'vaccine-info'
      },
      showRealNameModal() {
        this.formModel.customer_name = this.userInfo.name || this.userInfo.nick_name
        this.formModel.customer_phone = this.userInfo.phone
        this.formModel.customer_birth_day = this.userInfo.birthday
        this.formModel.id_no = this.userInfo.id_no
        this.formModel.phone_xcx = this.userInfo.phone_xcx
        this.modalName = 'realname'
      },
      showModal(e) {
        if (this.userInfo && (!this.userInfo.id_no || !this.userInfo.phone || !this.userInfo.phone_xcx)) {
          this.showRealNameModal()
        } else {
          uni.navigateTo({
            url: `/storePages/vaccineAppointment/vaccineAppointment?id=${e.id}&store_no=${this.storeNo}`
          })
          return
        }
      },
    },
    onLoad(option) {
      if (option.moreConfig) {
        try {
          this.moreConfig = JSON.parse(option.moreConfig)
        } catch (err) {
          console.log(err)
        }
      }
      if (option.storeNo) {
        this.storeNo = option.storeNo
        this.getVaccineList()
      }
      // #ifdef MP-WEIXIN
      // 在页面onLoad回调事件中创建插屏广告实例
      if (wx.createInterstitialAd) {
        interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-34fd06b767494b27'
        })
        // interstitialAd.onLoad(() => {})
        // interstitialAd.onError((err) => {})
        // interstitialAd.onClose(() => {})
      }
      // #endif


    },
    onReachBottom() {
      if (this.loadStatus !== 'noMore') {
        this.getVaccineList('loadmore')
      }
    },
    onPullDownRefresh() {
      this.getVaccineList().then(_ => {
        uni.stopPullDownRefresh()
      })
    }
  }
</script>

<style scoped lang="scss">
  .vaccine-list {
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;
    background-color: #F5F5F5;
    // min-height: var(--page-height);
    min-height: 100vh;
    padding: 20rpx;

    .vaccine-list-box {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
      background-color: #FAFBFC;
    }

    .vaccine-item {
      padding: 5rpx 20rpx;
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .button-area {
        display: flex;
        align-items: center;

        .button-box {
          justify-content: flex-end;

          .cu-btn {
            min-width: 60px;
            font-size: 14px;

          }
        }
      }

      .title {
        display: inline-block;
        font-size: 16px;
        text-align: left;
        flex: 1;

        .light {
          background-color: #edf2fe;
        }
      }

      .desc {
        flex: 1;
      }

      .button-box {
        flex: inherit;
        min-width: 75px;
        margin: 10rpx 0;

        .cu-tag {
          width: 100%;
        }
      }
    }
  }

  .cu-modal {
    z-index: 100;

    .vaccine-info {
      background-color: #fff;
      overflow: scroll;

      .vaccine-name {
        font-weight: bold;
        text-align: center;
      }

      .tips {
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: #666;
        font-weight: bold;
      }

      .vaccine-detail {
        display: flex;
        padding: 0;
        padding: 10rpx;

        .label {
          color: #666;
          margin-right: 20rpx;
          min-width: 100rpx;
        }

        .value {
          flex: 1;
          text-align: left;
        }

        .tips {
          width: auto;
          text-align: center;
          font-size: 12px;
          color: #666;
          font-weight: bold;
        }
      }

      .image-box {
        border-radius: 20rpx;
        overflow: hidden;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;

        .remark-pic {
          width: 300rpx;
          margin-right: 10rpx;

          .tips {
            width: 100%;
          }
        }
      }
    }

    .tip {
      text-align: center;
      padding: 10px;
    }

    .button-box {
      justify-content: center;
      text-align: center;
      padding: 20rpx;

      .cu-btn {
        min-width: 45%;
      }
    }
  }

  .birthday {
    text-align: left !important;
  }

  .cu-form-group {
    text-align: left;

    .title {
      min-width: calc(4em + 15px);
    }

    uni-picker .picker {
      text-align: left;
      line-height: 40px;
    }
  }

  .order-info {
    min-height: 50vh;
    max-height: calc(100vh - var(--window-top) - var(--window-bottom));
    overflow-y: scroll;
    background-color: #fff;
    padding: 20rpx;
    padding-top: 0;

    .cu-form-group {
      min-height: 40px;
    }

    .from-box {
      display: flex;
      flex-direction: column;
      text-align: left;
      margin-bottom: 20px;

      .form-title {
        text-indent: 20px;
        margin-top: 10px;
      }

      .form-item {
        display: flex;
        min-height: 30px;
        position: relative;
        margin: 10px 0;
        font-size: 16px;
        align-items: center;

        &:last-child {
          margin: 0;
        }

        .label {
          // position: absolute;
          line-height: 20px;
          left: 10px;
          padding: 0 5px;
          transition: all 0.5s ease;
          z-index: 2;
          top: 10px;
          color: #999;
          min-width: 80px;
        }

        // &.active {
        // 	.label {
        // 		top: -15px;
        // 		font-size: 14px;
        // 	}
        // }

        .value {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f1f1f1;
          text-indent: 20px;

          .text-area {}

          &.textarea {
            margin: 0 20rpx;
            min-height: 100rpx;
            text-indent: 20px;
            background-color: #f1f1f1;
            border-radius: 10px;
            padding: 10px 0;
          }
        }
      }
    }
  }

  .date-area {
    margin-top: 20rpx;
    display: flex;
    flex-wrap: wrap;

    .tips {
      width: 100%;
      padding-bottom: 5px;
      color: rgba($color: #39c5a9, $alpha: 1);
    }

    .date-item {
      display: flex;
      justify-content: center;
      padding: 5px 15px;
      border-radius: 5px;
      background-color: #f1f1f1;
      position: relative;
      margin-bottom: 10px;
      width: calc(50% - 10px);
      transition: all 0.5s ease;
      flex-wrap: wrap;
      border: 1rpx solid transparent;
      margin-right: 10rpx;

      &:nth-child(2n + 1) {
        margin-left: 10px;
      }

      &.line-cyan {
        border: 1rpx solid;
        background-color: #e7fff4;

        .text-orange {
          color: #1cbbb4;
        }
      }

      &.disabled {
        // pointer-events: none;
        // cursor: default;
        opacity: 0.6;
      }
    }
  }

  .tab-list {
    display: flex;
    margin: 0;
    border-radius: 20rpx 20rpx 0 0;
    overflow: hidden;
    flex-wrap: wrap;
    position: relative;

    &::before {
      content: '';
      width: 100%;
      height: 50rpx;
      top: 0;
      background-color: #eff0fb;
      z-index: 1;
      position: absolute;
    }

    &::after {
      content: '';
      width: 100%;
      height: 50rpx;
      bottom: 0;
      background-color: #fff;
      z-index: 1;
      position: absolute;
    }

    .tab-item {
      // flex: 1;
      width: 50%;
      text-align: center;
      padding: 15rpx 0;
      color: #9092A5;
      font-size: 28rpx;
      font-family: 苹方-简;
      background-color: #eff0fb;
      overflow: hidden;
      z-index: 2;
      // &.tab-item-0 {
      //   border-bottom-right-radius: 30rpx;
      // }

      // &.tab-item-1 {
      //    border-bottom-left-radius: 30rpx;
      // }
      // &:not(.active).tab-item-0 {
      //   border-bottom-right-radius: 30rpx;
      // }

      // &:not(.active).tab-item-1 {
      //   border-bottom-left-radius: 30rpx;
      // }

      &.active {
        background-color: #fff;
        color: #000;

        // &.tab-item-0 {
        //   border-top-right-radius: 40rpx 20rpx;
        // }

        // &.tab-item-1 {
        //   border-top-left-radius: 40rpx 20rpx;
        // }
      }
    }
  }
</style>
