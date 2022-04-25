<template>
  <view class="vaccine-list" v-if="vaccineList&&vaccineList.length>0" :style="[calcStyle]">
    <view class="vaccine-title">
      <view class="title-text">
        <view class="">
          <text class="cuIcon-titles text-blue"></text>
          <text
            v-if="pageItem&&pageItem.component_label&&pageItem.show_label === '是'">{{pageItem.component_label}}</text>
          <text v-else>疫苗预约</text>
        </view>
        <!--    <view class="margin-left-xs">
          <text class="cu-btn bg-blue light sm round margin-right-xs" v-for="(item,index) in setDateOrderList"
            :key="index">
            <text class="margin-right-xs">{{item.label}}</text>
            <text class="text-orange">{{item.app_count||'0'}}/{{item.app_count_limit||'0'}}</text></text>
        </view> -->
      </view>
      <view class="to-more text-grey" @click="toMore()" v-if="list.length>1">
        <text>更多</text>
        <text class="cuIcon-right "></text>
      </view>
    </view>
    <view class="vaccine-wrap">
      <view class="vaccine-list-box">
        <view class="tab-list" v-if="subList&&subList.length>1">
          <view class="tab-item" :class="[curSub===index?'active':'','tab-item-'+index]" v-for="(item,index) in subList"
            :key="index" @click="changeSub(index)">
            {{item.name||''}}
          </view>
        </view>
        <swiper class="swiper " indicator-active-color="#00aaff" indicator-color="#ccc" :indicator-dots="true"
          :autoplay="false">
          <swiper-item v-for="(child,index) in list" :key="index" class="swiper-item">
            <view class="vaccine-item" v-for="(item,itemIndex) in child" :key="itemIndex" @click="showInfo(item)">
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
                <view class="margin-left-xs cu-btn round sm   margin-right bg-cyan light"
                  v-else-if="item.persons_count!==1">
                  需要预约
                </view>
                <view class="margin-left-xs cu-btn round sm   margin-right bg-blue light"
                  v-else-if="item.btnTextConfig&&item.btnTextConfig.full&&(item.persons_count!==1||(item.persons_count===1&&item.stock_count&&item.stock_count>=5))">
                  {{item.btnTextConfig.full.tip||''}}
                </view>
              </view>
              <view class="button-area">
                <view class="button-box">
                  <view class="cu-btn sm line-orange border round" @click.stop="showModal(item)"
                    v-if="item.btnTextConfig&&item.btnTextConfig.less&&item.btnTextConfig.less.button&&item.persons_count===1&&item.stock_count&&item.stock_count>0&&item.stock_count<5">
                    {{item.btnTextConfig.less.button}}
                  </view>
                  <view class="cu-btn sm line-orange border round" @click.stop="showModal(item)"
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
          </swiper-item>
        </swiper>
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
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'

  const dayjs = require('dayjs');
  export default {
    name: "VaccineList", //疫苗预约列表
    computed: {
      setDateOrderList() {
        let list = this.dateOrderList
        return list.map(item => {
          let date = item.app_date
          if (dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")) {
            item.label = '今日'
            if (item.app_time_end.slice(0, 2) > 12) {
              item.label = '下午'
            } else {
              item.label = '上午'
            }
          } else {
            item.label = dayjs(date).format("MM-DD")
          }
          return item
        })
      },
      btnTextConfig() {
        // 按钮、提示文字配置
        const buttonConfig = {
          sellOut: { // 无货
            button: "待到货",
            tip: ""
          },
          less: { //库存大于0小于5
            button: "库存较少",
            tip: ""
          },
          full: { // 库存充足
            button: "随时到店",
            tip: ""
          },
          needOrder: { //需要预约
            button: "预约",
            tip: "需要预约"
          }
        }
        return buttonConfig
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
      ...mapState({
        subscsribeStatus: state => state.app.subscsribeStatus,
        userInfo: state => state.user.userInfo
      }),
      vaccineTip() {
        if (this.vaccineInfo) {
          if (!this.vaccineInfo.stock_count || this.vaccineInfo.stock_count < 1) {
            return '请在下方选择您需要被通知的业务'
          } else {
            return '请在下方选择您预约打疫苗的时间'
          }
        }
      },
      list() {
        if (this.vaccineList && Array.isArray(this.vaccineList) && this.vaccineList.length > 0) {
          return this.vaccineList.reduce((pre, item) => {
            if (item.button_text) {
              try {
                item.btnTextConfig = JSON.parse(item.button_text)
              } catch (e) {
                //TODO handle the exception
                console.log(e)
              }
            }

            if (pre.length === 0) {
              pre = [
                [item]
              ]
            } else if (pre[pre.length - 1].length >= 5) {
              pre.push([item])
            } else {
              pre[pre.length - 1].push(item)
            }
            return pre
          }, [])
        } else {
          return []
        }
      },
      moreConfig() {
        let result = null
        try {
          if (this.pageItem?.more_config) {
            result = JSON.parse(this.pageItem.more_config)
          }
        } catch (e) {
          //TODO handle the exception
        }
        if (typeof this.pageItem?.more_config === 'object') {
          result = this.pageItem.more_config
        }
        return result
      },
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
    },
    data() {
      return {
        // subList: [{
        //   name: "一类"
        // }, {
        //   name: "二类"
        // }],
        curSub: 0,
        onSubmit: false, //正在提交
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
        vaccineList: [],
        imagesUrl: [],
        vaccineInfo: {}, // 疫苗信息
        curVac: {
          data: []
        },
        tip: '',
        dateOrderList: [] //按天预约
      }
    },
    props: {
      pageItem: {
        type: Object
      },
      // storeInfo: {
      //   type: Object
      // },
    },
    beforeDestroy() {
      uni.$off('backFromWebview')
    },
    created() {
      uni.$on('backFromWebview', () => {
        // 从webview返回
        this.checkSubscribeStatus()
      })

      if (!this.vaccineList || this.vaccineList.length === 0) {
        this.getVaccineList()
      }
      // this.getDayOrderList()
    },
    methods: {
      changeSub(index) {
        this.curSub = index
        this.getVaccineList()
      },
      mindSub() {
        // 提醒用户关注公众号
        return new Promise((resolve) => {
          if (!this.subscsribeStatus) {
            uni.showModal({
              title: '提示',
              content: '请关注百想助理公众号，否则无法接收到消息通知，是否跳转到公众号关注引导页面？',
              success(res) {
                if (res.confirm) {
                  uni.navigateTo({
                    url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`
                  })
                  resolve('leave')
                } else {
                  resolve('keep')
                }
              }
            })
          } else {
            resolve('keep')
          }
        })

      },
      subscription(tip) {
        // return
        let tmplIds = 'fat3Nr50I5cAm0s5dBNfMSBDLJMumAUbVGHnE_am07Q'
        // 接种疫苗提醒
        wx.getSetting({
          withSubscriptions: true, //  这里设置为true,下面才会返回mainSwitch
          success: function(res) {
            // 调起授权界面弹窗
            if (res.subscriptionsSetting.mainSwitch) { // 用户打开了订阅消息总开关
              if (res.subscriptionsSetting.itemSettings !=
                null) { // 用户同意总是保持是否推送消息的选择, 这里表示以后不会再拉起推送消息的授权
                let moIdState = res.subscriptionsSetting.itemSettings[tmplIds]; // 用户同意的消息模板id
                if (moIdState === 'accept') {
                  console.log('接受了消息推送');
                  uni.showModal({
                    title: '提示',
                    content: tip || '已成功设置通知提醒',
                    showCancel: false
                  })
                } else if (moIdState === 'reject') {
                  console.log("拒绝消息推送");
                } else if (moIdState === 'ban') {
                  console.log("已被后台封禁");
                } else if (moIdState === undefined) {
                  wx.requestSubscribeMessage({ // 调起消息订阅界面
                    tmplIds: [tmplIds],
                    success(res) {
                      console.log('订阅消息 成功 ');
                      console.log(res);
                    },
                    fail(er) {
                      console.log("订阅消息 失败 ");
                      console.log(er);
                    }
                  })
                }
              } else {
                // 当用户没有点击’ 总是保持以上选择， 不再询问‘ 按钮。 那每次执到这都会拉起授权弹窗
                wx.showModal({
                  title: '提示',
                  content: '请授权开通服务通知',
                  showCancel: true,
                  success: function(ress) {
                    if (ress.confirm) {
                      wx.requestSubscribeMessage({ // 调起消息订阅界面
                        tmplIds: [tmplIds],
                        success(res) {
                          console.log('订阅消息 成功 ');
                          console.log(res);
                        },
                        fail(er) {
                          console.log("订阅消息 失败 ");
                          console.log(er);
                        }
                      })
                    }
                  }
                })
              }
            } else {
              console.log('订阅消息未开启')
            }
          },
          fail: function(error) {
            console.log(error);
          },
        })
      },
      toMore() {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        let url = `/storePages/VaccineList/VaccineList?storeNo=${this.storeInfo.store_no}`
        if (this.moreConfig && typeof this.moreConfig === 'object') {
          url += `&moreConfig=${JSON.stringify(this.moreConfig)}`
        }
        uni.navigateTo({
          url
        })
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
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
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
            uni.setStorageSync('cur_user_no', res.data[0].no)
            this.$store.commit('SET_USERINFO', res.data[0])
          }
          // this.selectTimeArr(this.vaccineInfo)
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
          } else {}
        }
      },
      async getVaccineList() {
        // 查找可预约疫苗列表
        let req = {
          "page": {
            "pageNo": 1,
            "rownumber": 100
          },
          condition: [{
            colName: this.subList[this.curSub].col || 'vaccine_type',
            ruleType: 'eq',
            value: this.subList[this.curSub].name
          }]
        }
        if (this.storeInfo && this.storeInfo.store_no) {
          req.condition.push({
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo.store_no
          })
        }
        let serviceName = this.moreConfig?.serviceName || 'srvhealth_store_vaccine_stocks_select'
        let app = this.moreConfig?.app || 'health'
        let res = await this.$fetch('select', serviceName, req, app)
        if (res.success) {
          this.vaccineList = res.data
        }
      },
      DateChange(e) {
        this.formModel.customer_birth_day = e.detail.value
      },
      async getDayOrderList() {
        // 按天预约列表
        let req = {
          "serviceName": "srvhealth_store_vaccination_appointment_day_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "store_no",
              "ruleType": "like",
              "value": this.storeInfo.store_no
            },
            {
              "colName": "app_date",
              "ruleType": "ge",
              "value": dayjs().format("YYYY-MM-DD")
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 2
          },
          "order": [{
            colName: 'app_date',
            orderType: 'asc'
          }]
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appointment_day_select', req, 'health')
        if (res.success) {
          this.dateOrderList = res.data
        }
      },
      showModal(e) {
        if (this.userInfo && (!this.userInfo.id_no || !this.userInfo.phone || !this.userInfo.phone_xcx)) {
          this.showRealNameModal()
        } else {
          let url = `/storePages/vaccineAppointment/vaccineAppointment?id=${e.id}&store_no=${this.storeInfo.store_no}`
          if (this.moreConfig?.app_type) {
            url += `&app_type=${this.moreConfig.app_type}`
          }
          if (this.moreConfig && typeof this.moreConfig === 'object') {
            url += `&moreConfig=${JSON.stringify(this.moreConfig)}`
          }
          // debugger
          // if(this.moreConfig&&this.moreConfig.detailConfig){
          //   url = url.replace('/vaccineAppointment/vaccineAppointment','/appointment/appointment')
          // }
          uni.navigateTo({
            url
          })
          return
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
      onBlur() {
        this.activeField = ''
      },
      getList() {
        let list = []
        for (let key in this.vaccineList) {
          let obj = this.vaccineList[key]
          obj.selected = ''
          obj.data = this.vaccineList[key].data.map(item => {
            item.checked = false
            return item
          })
          list.push(obj)
        }
        return list
      }
    }
  }
</script>

<style lang="scss" scoped>
  ::v-deep swiper.rectangle-dot {
    height: 200px;
  }

  .vaccine-list {
    display: flex;
    flex-direction: column;
    // margin: 0 20rpx;
    // margin-bottom: 20rpx;
    min-width: 300px;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }
  }

  .vaccine-wrap {
    background: #FAFBFC;
    border-radius: 12px;
    margin-top: 20rpx;
    padding: 20rpx 0;

    .vaccine-list-box {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);

      .swiper {
        height: 380rpx;
        background-color: #fff;
      }
    }
  }

  .vaccine-title {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 16px;

    .title-text {
      display: flex;
      flex: 1;
      align-items: center;

      .light {
        background-image: linear-gradient(to left, #eef2ff, #ebf9fa);
      }
    }

    .to-more {
      font-weight: normal;
      width: 100rpx;
      display: flex;
      justify-content: flex-end;
      align-items: center;
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

        &.tab-item-0 {
          // border-top-right-radius: 40rpx 20rpx;
        }

        &.tab-item-1 {
          // border-top-left-radius: 40rpx 20rpx;
        }
      }
    }
  }

  .button-box {
    margin: 0;
    padding: 4rpx 0;
    justify-content: flex-end;
    flex: 1;

    .disabled {
      pointer-events: none;
    }

    .cu-tag,
    .cu-btn {
      min-width: 120rpx;
      font-size: 14px;
    }

    &.center {
      justify-content: center;
      margin-bottom: 20px;
    }

    .cu-btn {
      &+.cu-btn {
        margin-left: 20px;
      }
    }
  }

  .cu-modal {
    z-index: 100;

    .cu-dialog {
      background-color: #fff;
    }

    .order-modal {
      max-height: 70vh;
    }

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

  .vaccine-item {
    margin: 0 20rpx;
    // padding: 5rpx 20rpx;
    margin-bottom: 10rpx;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;

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

  .birthday {
    text-align: left !important;
  }

  .cu-form-group .title {
    min-width: calc(4em + 15px);
  }

  .cu-form-group uni-picker .picker {
    text-align: left;
    line-height: 40px;
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
    display: flex;
    flex-wrap: wrap;

    .tips {
      width: 100%;
      padding-bottom: 5px;
      color: rgba($color: #39c5a9, $alpha: 1);
    }

    .date-time-box {
      box-shadow: 6px 5px 13px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      padding: 10rpx;

      .title {
        margin-bottom: 10rpx;
        text-align: left;
      }
    }

    .time-area {
      display: flex;
      flex-wrap: wrap;

      // .date-item {
      //   min-width: 30%;
      //   max-width: calc(33% - 20rpx/3);
      //   flex: 1;
      //   margin-bottom: 5px;
      //   padding: 5px;
      //   margin-left: 5px;

      //   // &:nth-child(2n + 1) {
      //   //   margin-left: 0;
      //   // }
      //   &:nth-child(3n + 1) {
      //     margin-left: 0;
      //   }
      // }
    }

    .date-item {
      display: flex;
      justify-content: center;
      padding: 5px 15px;
      border-radius: 5px;
      background-color: #f1f1f1;
      position: relative;
      margin-bottom: 5px;
      margin-right: 5px;
      width: calc(50% - 10px);
      transition: all 0.5s ease;
      flex-wrap: wrap;
      border: 1rpx solid transparent;

      &.line-cyan {
        .text-orange {
          color: #1cbbb4;
        }
      }

      .vaccine_app_count {
        width: 100%;
        font-size: 12px;
      }

      &:nth-child(2n + 1) {
        margin-left: 5px;
      }

      &.line-cyan {
        border: 1rpx solid;
        background-color: #e7fff4;
      }

      &.disabled {
        // pointer-events: none;
        // cursor: default;
        opacity: 0.6;
      }
    }
  }

  .modal-title {
    font-weight: bold;
    padding: 20rpx;
    font-size: 16px;
  }

  .realname-form {
    text-align: left;

    .cu-form-group {
      .title {
        min-width: 150rpx;
      }
    }
  }
</style>
