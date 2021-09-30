<template>
  <view class="vaccine-list" v-if="vaccineList&&vaccineList.length>0" :style="[calcStyle]">
    <view class="vaccine-title">
      <view class="title-text">
        <view class="">
          <text class="cuIcon-titles text-blue"></text>
          <text>疫苗预约</text>
        </view>
        <view class="margin-left-xs">
          <text class="cu-btn bg-blue light sm round margin-right-xs" v-for="(item,index) in setDateOrderList"
            :key="index">
            <text class="margin-right-xs">{{item.label}}</text>
            <text class="text-orange">{{item.app_count||'0'}}/{{item.app_count_limit||'0'}}</text></text>
        </view>
      </view>
      <view class="to-more text-grey" @click="toMore()" v-if="list.length>1">
        <text>更多</text>
        <text class="cuIcon-right "></text>
      </view>
    </view>
    <!--    <view class="" style="width:50%;margin:20rpx auto;">
      <u-subsection :list="subList" :current="curSub" mode="button" @change="changeSub"></u-subsection>
   
    </view> -->
    <view class="vaccine-wrap">
      <view class="vaccine-list-box">
        <view class="tab-list">
          <view class="tab-item" :class="[curSub===index?'active':'','tab-item-'+index]" v-for="(item,index) in subList"
            :key="index" @click="changeSub(index)">
            {{item.name||''}}
          </view>
        </view>
        <swiper class="swiper " indicator-active-color="#00aaff" indicator-color="#ccc" :indicator-dots="true"
          :autoplay="false">
          <swiper-item v-for="(child,index) in list" class="swiper-item">
            <view class="vaccine-item" v-for="(item,itemIndex) in child" @click="showInfo(item)">
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
    <view class="cu-modal bottom-modal" :class="{'show':modalName==='vaccine'}" @click="hideModal" @touchmove.prevent>
      <view class="cu-dialog" @click.stop>
        <view class="cu-bar bg-white justify-end vaccine-name" v-if="vaccineInfo.vaccine_drug_name">
          <view class="content"> {{vaccineInfo.vaccine_drug_name}}</view>
          <view class="action" @tap="hideModal">
            <text class="cuIcon-close text-red"></text>
          </view>
        </view>
        <scroll-view scroll-y="true">
          <view class="order-modal">
            <view class="vaccine-info">
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
            </view>
            <view class="order-info">
              <!-- 	<view class="cu-bar bg-white justify-end">
								<view class="content">请选择预约时间</view>
								<view class="action" @tap="hideModal">
									<text class="cuIcon-close text-red"></text>
								</view>
							</view> -->
              <view class="date-area" v-if="isArray(getRange)&&getRange.length>0">
                <view class="tips">
                  {{vaccineTip}}
                </view>
                <view class="date-time-box margin-bottom-xs" v-for="(item,index) in getRange" :key="index">
                  <view class="title">
                    <text class="text-orange">{{item.app_date}}-{{getDayOfWeek(item.app_date)}} </text>
                    <text class="text-orange">( 已约:{{item.app_count||'-'}}人,可约{{item.app_count_limit||'-'}}人)</text>
                  </view>
                  <view class="date-area ">
                    <view class="date-item"
                      :class="{'line-cyan':selectedVaccine.sa_no===radio.sa_no&&selectedVaccine.timeStart===radio.timeStart&&selectedVaccine.timeEnd===radio.timeEnd,disabled:disabledTime(radio)}"
                      v-for="(radio,rIndex) in item.list" :key="rIndex" @click="selectItem(radio)">
                      <view v-if="radio.app_date">
                        {{radio.timeStart||''}} - {{radio.timeEnd||''}}
                      </view>
                      <text
                        class="text-orange text-sm">已约:{{radio.app_amount||'0'}}人,可约{{radio.time_range_appointment_limit||'-'}}人</text>
                    </view>
                  </view>
                </view>
              </view>
              <view class="date-area" v-else-if="isArray(timeArr)&&timeArr.length>0">
                <view class="tips">
                  {{vaccineTip}}
                </view>
                <view class="date-item"
                  :class="{'line-cyan':selectedVaccine.sa_no===radio.sa_no,disabled:disabledTime(radio)}"
                  v-for="radio in timeArr" :key="radio.sa_no" @click="selectItem(radio)">
                  <view class="">
                    <text v-if="vaccineInfo.persons_count===1||radio.appoint_name">
                      {{radio.appoint_name}}
                    </text>
                    <text class="text-sm">-{{
												getDayOfWeek(radio.app_date)
											}}</text>
                  </view>
                  <view v-if="radio.app_date">{{dayjs(radio.app_date).format('MM-DD')}}
                    {{radio.app_time_start?radio.app_time_start.slice(0,5):''}}
                    -
                    {{radio.app_time_end?radio.app_time_end.slice(0,5):''}}
                  </view>
                  <view v-if="radio.app_count" class="vaccine_app_count text-orange">
                    已约:{{radio.app_count||'-'}}人,可约{{radio.app_count_limit||'-'}}人
                  </view>
                  <!-- 	<view class="" v-html="radio.app_desc">
									</view> -->
                  <!-- <text v-if="radio.app_count" class="cu-tag badge">{{radio.app_count||''}}</text> -->
                </view>
              </view>
              <view class="text-red padding" v-if="timeArr.length===0">
                当前疫苗无可预约时间段
              </view>
              <view class="from-box">
                <view class="form-title cuIcon-info text-gray">
                  请填写接种人相关信息
                </view>
                <view class="cu-form-group">
                  <text class="text-red">*</text>
                  <view class="title">姓名</view>
                  <input placeholder="姓名" name="input" v-model="formModel.customer_name"></input>
                </view>
                <view class="cu-form-group">
                  <view class="title">出生日期</view>
                  <picker mode="date" v-model="formModel.customer_birth_day" start="1900-09-01" end="2022-09-01"
                    @change="DateChange">
                    <view class="picker">
                      {{formModel.customer_birth_day||'请选择'}}
                    </view>
                  </picker>
                </view>
                <view class="cu-form-group">
                  <view class="title">手机号码</view>
                  <input placeholder="手机号码" name="input" v-model="formModel.customer_phone"></input>
                  <view class="cu-capsule radius">
                    <view class='cu-tag bg-blue '>
                      +86
                    </view>
                    <view class="cu-tag line-blue">
                      中国大陆
                    </view>
                  </view>
                </view>
                <view class="form-item" :class="{active:activeField==='appoint_remark'}">
                  <textarea v-model="formModel.appoint_remark" placeholder="预约说明" class="value textarea"
                    :adjust-position="false" :fixed="true" :show-confirm-bar="false" />
                </view>
              </view>

            </view>
          </view>
        </scroll-view>
        <view class="button-box center bg-white">
          <button class="cu-btn bg-grey" @click="toOrderList">我的预约</button>
          <button type="primary" :class="{disabled:onSubmit}" class="cu-btn bg-blue center" @click="submitNotify"
            v-if="vaccineInfo&&vaccineInfo.persons_count&&vaccineInfo.persons_count===1&&(vaccineInfo.stock_count<1||!vaccineInfo.stock_count)">提交</button>
          <button type="primary" :class="{disabled:onSubmit}" class="cu-btn bg-blue center" @click="submitOrder"
            v-else>提交预约</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  import dayjs from '@/static/js/dayjs.min.js'
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
      timeRange() {
        // 时间粒度
        return this.selectedVaccine?.time_range
      },
      rangeLimit() {
        // 时间粒度内可预约数量限制
        return this.selectedVaccine?.time_range_appointment_limit
      },
      getRange() {
        if (Array.isArray(this.timeArr) && this.timeArr.length > 0) {
          let timeArr = this.deepClone(this.timeArr)
          let arr = []
          for (let item of timeArr) {
            let obj1 = this.deepClone(item)
            if (item.time_range && item.time_range_appointment_limit) {
              let date1 = item?.app_time_start
              let date2 = item?.app_time_end
              date1 = dayjs(`${item.app_date} ${date1}`)
              date2 = dayjs(`${item.app_date} ${date2}`)
              let diff = date2.diff(date1, 'minute') / item.time_range
              let arr2 = []
              let start = item?.app_time_start.slice(0, 5)
              for (let i = 0; i < diff; i++) {
                let obj = this.deepClone(item)
                obj.timeStart = start;
                if (Array.isArray(obj.recordList) && obj.recordList.length > 0) {
                  let data = obj.recordList.find(e => (e.sa_no === obj.sa_no || e.sda_no === obj.sda_no) && e
                    .app_time_start.indexOf(start) !== -1)
                  if (data && data.amount) {
                    obj.app_amount = data.amount
                  }
                }
                obj.timeEnd = dayjs(item.app_date + ' ' + start).add(item.time_range, 'minute')
                let diff = obj.timeEnd.diff(dayjs(item.app_date + ' ' + item.app_time_end), 'minute')
                if (diff > 0) {
                  obj.timeEnd = dayjs(item.app_date + ' ' + item.app_time_end).format('HH:mm')
                } else {
                  obj.timeEnd = obj.timeEnd.format("HH:mm")
                }
                arr2.push(this.deepClone(obj))
                start = obj.timeEnd
              }
              obj1.list = arr2
              arr.push(this.deepClone(obj1))
              // return arr
            } else {
              return
            }
          }
          return arr
        }
      },
    },
    data() {
      return {
        subList: [{
          name: "一类"
        }, {
          name: "二类"
        }],
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
      storeInfo: {
        type: Object,
        default: () => {}
      },
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
      this.getDayOrderList()
    },
    methods: {
      async getWithin5minAppCount(item) {
        // 查找当前疫苗最近x分钟内预约次数
        if (!item.time_range || !item.time_range_appointment_limit) {
          // return true
          return
        }
        let req = {
          "serviceName": "srvhealth_store_vaccination_appoint_record_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "app_date",
              "ruleType": "eq",
              "value": item.app_date
            },
            {
              "colName": "store_no",
              ruleType: 'eq',
              value: this.storeInfo.store_no
            }
          ],
          "group": [{
              "colName": "app_time_start",
              "type": "by_hour"
            },
            {
              "colName": "sa_no",
              "type": "by"
            },
            {
              "colName": "sda_no",
              "type": "by"
            },
            {
              "colName": "app_date",
              "type": "by",
            }, {
              "colName": "id",
              "type": "count",
              aliasName: "amount"
            },
            {
              colName: 'appoint_name',
              "type": "by"
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
          "order": [{
            "colName": "create_time",
            "orderType": "desc"
          }]
        }
        if (item.sa_no) {
          req.condition.push({
            "colName": "sa_no",
            "ruleType": "eq",
            "value": item.sa_no
          })
        }
        if (item.sda_no) {
          req.condition.push({
            "colName": "sda_no",
            "ruleType": "eq",
            "value": item.sda_no
          })
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appoint_record_select', req, 'health')
        if (res.success) {
          if (res.data.length > 0) {
            return res.data
          }
        }
      },
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
        uni.navigateTo({
          url: '/storePages/VaccineList/VaccineList?storeNo=' + this.storeInfo.store_no
        })
      },
      disabledTime(e) {
        // 判断是否过期 已过期则禁用
        if (e.app_count_limit <= e.app_count && e.appoint_type !== '登记') {
          if (e.time_range_appointment_limit && e.time_range) {
            if (e.app_amount >= e.time_range_appointment_limit) {
              return true
            } else {
              // return false
            }
          } else {
            return true
          }
        }
        let time = new Date(e.app_date + ' ' + e.app_time_start)
        let now = new Date()
        if (time.getTime() < now.getTime()) {
          if (e.time_range_appointment_limit && e.time_range) {
            let time = new Date(e.app_date + ' ' + e.timeStart)
            let now = new Date()
            if (time.getTime() < now.getTime()) {
              return true
            } else {
              return false
            }
          }
          return true
        } else {
          return false
        }
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
            colName: 'vaccine_type',
            ruleType: 'eq',
            value: this.curSub === 0 ? "一类" : "二类"
          }]
        }
        if (this.storeInfo && this.storeInfo.store_no) {
          req.condition.push({
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo.store_no
          })
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccine_stocks_select', req, 'health')
        if (res.success) {
          this.vaccineList = res.data
        }
      },
      toOrderList() {
        uni.navigateTo({
          url: '/storePages/VaccineOrder/VaccineOrder'
        })
      },
      async submitForm() {
        if (!this.formModel.customer_name) {
          uni.showToast({
            title: '请填写就诊人姓名',
            icon: 'none'
          })
          return
        }
        if (!this.selectedVaccine || (!this.selectedVaccine.sa_no && !this.selectedVaccine.sda_no)) {
          uni.showToast({
            title: '请选择预约时间',
            icon: 'none'
          })
          return
        }
        let selectedVaccine = this.deepClone(this.selectedVaccine)
        if (selectedVaccine.time_range && selectedVaccine.time_range_appointment_limit) {
          if (selectedVaccine.app_amount > 0 && selectedVaccine.app_amount >= selectedVaccine
            .time_range_appointment_limit) {
            uni.showToast({
              title: '已超过当前时间段预约人数限制!',
              icon: 'none'
            })
            return
          }
        }
        let req = [{
          "serviceName": "srvhealth_store_vaccination_appoint_record_add",
          "condition": [],
          "data": [{
            "store_no": this.storeInfo.store_no,
            "sa_no": this.selectedVaccine.sa_no,
            "sda_no": this.selectedVaccine.sda_no,
            "svs_no": this.selectedVaccine.svs_no || null,
            "appoint_name": this.selectedVaccine.appoint_name,
            "app_date": this.selectedVaccine.app_date,
            "app_time_start": this.selectedVaccine.timeStart || this.selectedVaccine.app_time_start,
            "app_time_end": this.selectedVaccine.timeEnd || this.selectedVaccine.app_time_end,
            "customer_name": this.formModel.customer_name,
            "customer_birth_day": this.formModel.customer_birth_day,
            "customer_phone": this.formModel.customer_phone,
            "appoint_remark": this.formModel.appoint_remark,
            "person_no": this.userInfo.no,
            "person_user_no": this.userInfo.userno,
            "person_name": this.userInfo.name || this.userInfo.nick_name,
            "person_image": this.userInfo.person_image || this.userInfo.profile_url
          }]
        }]
        if (!this.onSubmit) {
          this.onSubmit = true
          let res = await this.$fetch('operate', 'srvhealth_store_vaccination_appoint_record_add', req,
            'health');
          this.onSubmit = false
          if (res.success) {
            this.$emit('submit', res.data)
            this.hideModal()
            return true
          } else {
            return res
          }
        } else {
          uni.showToast({
            title: '正在提交,请勿重复操作'
          })
        }

      },
      async submitNotify() {
        if (!this.selectedVaccine || !this.selectedVaccine.sa_no) {
          uni.showToast({
            title: '请选择需要通知您的业务',
            icon: 'none'
          })
          return
        }
        let tips = `${this.selectedVaccine.appoint_name} 设置成功`
        this.submitForm().then(res => {
          // #ifdef MP-WEIXIN
          this.subscription('已成功设置疫苗到货通知')
          // #endif
        })
      },
      async submitOrder() {
        // 提交预约信息
        // let appCountLimit = await this.getWithin5minAppCount()
        // if (!appCountLimit) {
        //   return
        // }
        this.submitForm().then(res => {
          if (res !== true) {
            if (res.msg) {
              this.hideModal()
              if (res.code === '4444') {
                uni.showToast({
                  title: '重复预约！',
                  icon: 'none',
                  mask: true,
                  duration: 2000
                })
              } else {
                uni.showToast({
                  title: res.msg,
                  icon: 'none',
                  mask: true,
                  duration: 2000
                })
              }

            }
            return
          }
          if (this.subscsribeStatus) {
            uni.showModal({
              title: '提示',
              content: "预约成功",
              showCancel: false
            })
          } else {
            uni.showModal({
              title: '提示',
              content: '预约成功,请关注百想助理公众号，否则无法接收到消息通知，是否跳转到公众号关注引导页面？',
              success(res) {
                if (res.confirm) {
                  uni.navigateTo({
                    url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`
                  })
                }
              }
            })
          }
        })
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
      async selectVaccineDayList(e) {
        let req = {
          "serviceName": "srvhealth_store_vaccination_appointment_day_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "app_date",
              "ruleType": "ge",
              "value": dayjs().format("YYYY-MM-DD")
            },
            {
              "colName": "app_date",
              "ruleType": "lt",
              value: dayjs().add(5, 'day').format('YYYY-MM-DD')
            },
            {
              "colName": "store_no",
              "ruleType": "eq",
              value: this.storeInfo.store_no
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
          "order": [{
            "colName": "app_date",
            "orderType": "asc"
          }],
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appointment_day_select', req, 'health')
        if (res.success) {
          for (let index = 0; index < res.data.length; index++) {
            let item = res.data[index]
            item.remark = e.remark
            item.remark_internal = e.remark_internal
            item.remark_pic = e.remark_pic
            item.stock_count = e.stock_count
            item.store_no = e.store_no
            item.to_appointment_count = e.to_appointment_count
            item.usage = e.usage
            item.vaccine_drug_name = e.vaccine_drug_name
            item.vaccine_type = e.vaccine_type
            item.vs_no = e.vs_no
            // item.recordList = new Array( item.app_count)
            let result = await this.getWithin5minAppCount(item)
            if (Array.isArray(result) && result.length > 0) {
              item.recordList = result
              this.$set(res.data, index, item)
            }
          }
          this.timeArr = res.data
          this.formModel.customer_name = this.userInfo.name || this.userInfo.nickName || ''
          this.formModel.customer_phone = this.userInfo.phone || ''
          this.formModel.customer_birth_day = this.userInfo.birthday || ''
          this.formModel.phone_xcx = this.userInfo.phone_xcx || ''
          this.modalName = 'vaccine'
          this.getImage(e)
        }
      },
      async selectTimeArr(e) {
        let req = {
          "condition": [{
              "colName": "svs_no",
              "ruleType": "eq",
              "value": e.vs_no
            },
            {
              "colName": "app_date",
              "ruleType": "ge",
              "value": this.formateDate()
            },
            // {
            // 	"colName": "app_date",
            // 	"ruleType": "lt",
            // 	value: dayjs().add(5, 'day').format('YYYY-MM-DD')
            // }
          ],
          order: [{
            colName: "app_date",
            orderType: "asc"
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 20
          },
        }
        if (!e.stock_count || e.stock_count < 1) {
          req.condition = [{
              "colName": "svs_no",
              "ruleType": "eq",
              "value": e.vs_no
            },
            {
              "colName": "appoint_type",
              "ruleType": "eq",
              "value": '登记'
            }
          ]
          delete req.order
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appointment_select', req, 'health')
        if (res.success) {
          for (let index = 0; index < res.data.length; index++) {
            let item = res.data[index]
            let result = await this.getWithin5minAppCount(item)
            if (Array.isArray(result) && result.length > 0) {
              item.recordList = result
              this.$set(res.data, index, item)
            }
          }

          this.timeArr = res.data
          this.formModel.customer_name = this.userInfo.name || this.userInfo.nickName || ''
          this.formModel.customer_phone = this.userInfo.phone || ''
          this.formModel.customer_birth_day = this.userInfo.birthday || ''
          this.formModel.phone_xcx = this.userInfo.phone_xcx || ''
          this.modalName = 'vaccine'
          this.getImage(e)
        }
      },
      showModal(e) {
        // if (e.persons_count === 1) {
        //   if (!e.stock_count || e.stock_count < 1) {
        //     return
        //   }
        //   this.selectVaccineDayList(e)
        // }
        // this.vaccineInfo = e
        if (this.userInfo && (!this.userInfo.id_no || !this.userInfo.phone || !this.userInfo.phone_xcx)) {
          this.showRealNameModal()
        } else {
          uni.navigateTo({
            url: `/storePages/vaccineAppointment/vaccineAppointment?id=${e.id}&store_no=${this.storeInfo.store_no}`
          })
          return
          // this.selectTimeArr(e)
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
      selectItem(e) {
        if (e.app_count_limit <= e.app_count && e.appoint_type !== '登记') {
          uni.showToast({
            title: '预约人数已满',
            icon: 'none'
          })
          return
        }
        if (this.disabledTime(e)) {
          uni.showToast({
            title: '已过期,不可预约',
            icon: 'none'
          })
          return
        }
        this.selectedVaccine = e
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
    margin: 0 20rpx;
    margin-bottom: 20rpx;
  }

  .vaccine-wrap {
    background: #FAFBFC;
    border-radius: 12px;
    margin-top: 20rpx;
    padding: 20rpx  0;

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
    padding: 20rpx 20rpx 0;

    .title-text {
      display: flex;
      flex: 1;
      align-items: center;

      .light {
        background-image: linear-gradient(right, #eef2ff, #ebf9fa);
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
      &:not(.active).tab-item-0 {
        border-bottom-right-radius: 30rpx;
      }

      &:not(.active).tab-item-1 {
        border-bottom-left-radius: 30rpx;
      }

      &.active {
        background-color: #fff;
        color: #000;

        &.tab-item-0 {
          border-top-right-radius: 40rpx 20rpx;
        }

        &.tab-item-1 {
          border-top-left-radius: 40rpx 20rpx;
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
