<template>
  <view class="appointment-wrap" v-if="moreConfig&&moreConfig.detailConfig">
    <view class="appointment-content">
      <view class="title" v-if="detailConfig.title&&detailConfig.title.col">
        {{vaccineInfo[detailConfig.title.col]||''}}
      </view>
      <view class="title" v-else-if="detailConfig.title&&detailConfig.title.value">
        {{detailConfig.title.value||''}}
      </view>
      <view class="content" v-if="detailConfig.content">
        <view class="content-item" v-for="(item,index) in detailConfig.content" :key="index">
          <view class="sub-title">
            <view class="text-cyan">
              <text>{{item.title||''}}</text>
              <text class="cu-btn sm round" v-if="vaccineInfo[item.badge_col]">
                <text>{{vaccineInfo[item.badge_col]||''}}</text>
              </text>
            </view>
            <view class="right" v-if="vaccineInfo[item.remark_pic_col]&&isArray(imagesUrl)">
              <text class="cuIcon-pic"></text>
              <text class="text" @tap="toPreviewImage(imagesUrl.map(e=>e.originUrl))">
                图片说明
              </text>
            </view>
          </view>
          <view class="description" v-if="item.content_type==='text'&&item.content_col&&vaccineInfo[item.content_col]">
            {{vaccineInfo[item.content_col]||''}}
          </view>
          <view class="time-range-box" v-else-if="item.content_type==='timeRangeSelect'">
            <view class="date-area" v-if="isArray(getRange)&&getRange.length>0">
              <view class="date-time-box margin-bottom-xs" v-for="(item,index) in getRange" :key="index">
                <view class="title">
                  <text class="" v-if="item._date">{{dayjs(item._date).format("MM-DD")}} {{getDayOfWeek(item._date)}}
                  </text>
                  <text class="" v-else>{{dayjs(item.app_date).format("MM-DD")}} {{getDayOfWeek(item.app_date)}} </text>
                  <text class="">（ 已约{{item.app_amount||'0'}}人,最多可约{{item.app_count_limit||'0'}}人）</text>
                </view>
                <view class="date-area ">
                  <view class="date-item" :class="{
                      'line-cyan':(selectedVaccine.sa_no===radio.sa_no)&&selectedVaccine.app_date===radio.app_date&&selectedVaccine.timeStart===radio.timeStart&&selectedVaccine.timeEnd===radio.timeEnd,
                      disabled:disabledTime(radio,item)}" v-for="(radio,rIndex) in item.list" :key="rIndex"
                    @click="selectItem(radio,item)">
                    <view v-if="radio.app_date">
                      {{radio.timeStart||radio.app_time_start||''}} - {{radio.timeEnd||radio.app_time_end||''}}
                    </view>
                    <text
                      class="vaccine_app_count ">已约:{{radio.app_amount||'0'}}人,可约{{radio.time_range_appointment_limit||'0'}}人</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="date-area" v-else-if="isArray(timeArr)&&timeArr.length>0">
              <view class="date-item"
                :class="{'line-cyan':(selectedVaccine.sa_no===radio.sa_no),disabled:disabledTime(radio)}"
                v-for="(radio,rIndex) in timeArr" :key="rIndex" @click="selectItem(radio,item)"
                v-show="radio.app_date===dayjs().format('YYYY-MM-DD')">
                <view class="date">
                  {{dayjs(radio.app_date).format('MM-DD')}}-{{
              				getDayOfWeek(radio.app_date)
              			}}
                </view>
                <view class="order-info">
                  <view v-if="radio.app_date">
                    {{radio.app_time_start?radio.app_time_start.slice(0,5):''}}
                    -
                    {{radio.app_time_end?radio.app_time_end.slice(0,5):''}}
                  </view>
                  <view v-if="radio.app_count" class="vaccine_app_count">
                    <text class="text-yellow" v-if="radio.app_count_limit<=radio.app_count"> 已约满</text>
                    <text v-else> 已约:{{radio.app_count||'0'}}人,可约{{radio.app_count_limit||'0'}}人</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="date-area" v-if="!notEmpty">
              <view class="date-time-box">
                预约人数已满或无可预约 <text v-if="app_type&&app_type==='其它'">项目</text><text v-else>疫苗</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="form-box content" v-if="detailConfig.formConfig">
        <view class="sub-title" v-if="detailConfig.formConfig.title">
          <text class="text-cyan">{{detailConfig.formConfig.title}}</text>
        </view>
        <view class="person-info-form" v-if="detailConfig.formConfig.cols">
          <view class="bx-form-group" :class="{'text-area':item.type==='textarea'}"
            v-for="item in detailConfig.formConfig.cols" v-show="item.display!==false" :key="item.col">
            <text class="text-red" v-if="item.required===true">*</text>
            <view class="title" v-if="item.type!=='textarea'">{{item.label}}</view>
            <input :placeholder="item.label" class="input" name="input" placeholder-class="place-holder"
              v-model="formModel[item.col]" v-if="item.type==='text'"></input>
            <input :placeholder="item.label" name="input" placeholder-class="place-holder" class="input"
              v-model="formModel[item.col]" v-if="item.type==='phone'"></input>
            <picker mode="date" v-model="formModel[item.col]" start="1900-09-01" end="2022-09-01" @change="DateChange"
              v-if="item.type==='date'">
              <view class="picker input">
                <text class="place-holder" v-if="!formModel[item.col]">请选择</text>
                <text v-else> {{formModel[item.col]||''}}</text>
                <text class="cuIcon-calendar  margin-left-xs" v-if="!formModel[item.col]"></text>
                <text class="cuIcon-calendar text-cyan margin-left-xs" v-else></text>
              </view>
            </picker>
            <view class="form-item" v-if="item.type==='textarea'">
              <textarea v-model="formModel.appoint_remark" auto-height :placeholder="item.label"
                placeholder-class="place-holder text-area" class="value textarea" :adjust-position="false" :fixed="true"
                :show-confirm-bar="false" />
            </view>
          </view>
        </view>
      </view>
      <view class="footer" v-if="detailConfig.formButton">

        <button class="cu-btn" :class="[{disabled:onSubmit},btn.class]" v-for="(btn,index) in detailConfig.formButton"
         :key="index" @click="onButton(btn)">{{btn.name||''}}</button>

        <!--  <button class="cu-btn bg-cyan" :class="{disabled:onSubmit}" @click="submitNotify"
          v-if="vaccineInfo&&vaccineInfo.persons_count&&vaccineInfo.persons_count===1&&(vaccineInfo.stock_count<1||!vaccineInfo.stock_count)">提交</button>
        <button class="cu-btn bg-cyan" :class="{disabled:onSubmit}" @click="submitOrder" v-else>提交预约</button> -->
      </view>


      <!-- 
      <view class="content">
        <view class="sub-title" v-if="vaccineInfo.usage||(vaccineInfo.remark_pic&&isArray(imagesUrl))">
          <view class="text-cyan">
            <text>用法</text>
            <text class="cu-btn sm round" v-if="vaccineInfo.usage">
              <text>{{vaccineInfo.usage||''}}</text>
            </text>
          </view>
          <view class="right" v-if="vaccineInfo.remark_pic&&isArray(imagesUrl)">
            <text class="cuIcon-pic"></text>
            <text class="text" @tap="toPreviewImage(imagesUrl.map(e=>e.originUrl))">
              图片说明
            </text>
          </view>
        </view>
        <view class="description" v-if="vaccineInfo.remark">
          {{vaccineInfo.remark||''}}
        </view>
        <view class="sub-title">
          <text class="text-cyan">{{vaccineTip||''}}</text>
        </view>
        <view class="time-range-box">
          <view class="date-area" v-if="isArray(getRange)&&getRange.length>0">
            <view class="date-time-box margin-bottom-xs" v-for="(item,index) in getRange" :key="index">
              <view class="title">
                <text class="" v-if="item._date">{{dayjs(item._date).format("MM-DD")}} {{getDayOfWeek(item._date)}}
                </text>
                <text class="" v-else>{{dayjs(item.app_date).format("MM-DD")}} {{getDayOfWeek(item.app_date)}} </text>
                <text class="">（ 已约{{item.app_amount||'0'}}人,最多可约{{item.app_count_limit||'0'}}人）</text>
              </view>
              <view class="date-area ">
                <view class="date-item" :class="{
                    'line-cyan':(selectedVaccine.sa_no===radio.sa_no)&&selectedVaccine.app_date===radio.app_date&&selectedVaccine.timeStart===radio.timeStart&&selectedVaccine.timeEnd===radio.timeEnd,
                    disabled:disabledTime(radio,item)}" v-for="(radio,rIndex) in item.list" :key="rIndex"
                  @click="selectItem(radio,item)">
                  <view v-if="radio.app_date">
                    {{radio.timeStart||radio.app_time_start||''}} - {{radio.timeEnd||radio.app_time_end||''}}
                  </view>
                  <text
                    class="vaccine_app_count ">已约:{{radio.app_amount||'0'}}人,可约{{radio.time_range_appointment_limit||'0'}}人</text>
                </view>
              </view>
            </view>
          </view>
          <view class="date-area" v-else-if="isArray(timeArr)&&timeArr.length>0">
            <view class="date-item"
              :class="{'line-cyan':(selectedVaccine.sa_no===radio.sa_no),disabled:disabledTime(radio)}"
              v-for="(radio,rIndex) in timeArr" :key="rIndex" @click="selectItem(radio,item)"
              v-show="radio.app_date===dayjs().format('YYYY-MM-DD')">
              <view class="date">
                {{dayjs(radio.app_date).format('MM-DD')}}-{{
            				getDayOfWeek(radio.app_date)
            			}}
              </view>
              <view class="order-info">
                <view v-if="radio.app_date">
                  {{radio.app_time_start?radio.app_time_start.slice(0,5):''}}
                  -
                  {{radio.app_time_end?radio.app_time_end.slice(0,5):''}}
                </view>
                <view v-if="radio.app_count" class="vaccine_app_count">
                  <text class="text-yellow" v-if="radio.app_count_limit<=radio.app_count"> 已约满</text>
                  <text v-else> 已约:{{radio.app_count||'0'}}人,可约{{radio.app_count_limit||'0'}}人</text>
                </view>
              </view>
            </view>
          </view>
          <view class="date-area" v-if="!notEmpty">
            <view class="date-time-box">
              预约人数已满或无可预约 <text v-if="app_type&&app_type==='其它'">项目</text><text v-else>疫苗</text>
            </view>
          </view>
        </view>
        <view class="sub-title">
          <text class="text-cyan">填写接种人相关信息</text>
        </view>
        <view class="person-info-form">
          <view class="bx-form-group">
            <text class="text-red">*</text>
            <view class="title">姓名</view>
            <input placeholder="姓名" class="input" name="input" placeholder-class="place-holder"
              v-model="formModel.customer_name"></input>
          </view>
          <view class="bx-form-group">
            <view class="title">出生日期</view>
            <picker mode="date" v-model="formModel.customer_birth_day" start="1900-09-01" end="2022-09-01"
              @change="DateChange">
              <view class="picker input">
                <text class="place-holder" v-if="!formModel.customer_birth_day">请选择</text>
                <text v-else> {{formModel.customer_birth_day||''}}</text>
                <text class="cuIcon-calendar  margin-left-xs" v-if="!formModel.customer_birth_day"></text>
                <text class="cuIcon-calendar text-cyan margin-left-xs" v-else></text>
              </view>
            </picker>
          </view>
          <view class="bx-form-group">
            <view class="title">手机号码</view>
            <input placeholder="手机号码" name="input" placeholder-class="place-holder" class="input"
              v-model="formModel.customer_phone"></input>
          </view>
        </view>
        <view class="person-info-form">
          <view class="form-item">
            <textarea v-model="formModel.appoint_remark" placeholder="预约说明" placeholder-class="place-holder text-area"
              class="value textarea" :adjust-position="false" :fixed="true" :show-confirm-bar="false" />
          </view>
        </view>
      </view> -->
      <!-- <view class="footer">
        <button class="cu-btn line-cyan border" @click="toOrderList">我的预约</button>
        <button class="cu-btn bg-cyan" :class="{disabled:onSubmit}" @click="submitNotify"
          v-if="vaccineInfo&&vaccineInfo.persons_count&&vaccineInfo.persons_count===1&&(vaccineInfo.stock_count<1||!vaccineInfo.stock_count)">提交</button>
        <button class="cu-btn bg-cyan" :class="{disabled:onSubmit}" @click="submitOrder" v-else>提交预约</button>
      </view> -->
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  import dayjs from '@/static/js/dayjs.min.js'
  export default {
    data() {
      return {
        id: "",
        store_no: "",
        // storeInfo: {},
        onSubmit: false,
        vaccineInfo: {},
        selectedVaccine: {},
        formModel: {
          // // phone_xcx: '',
          // customer_name: "",
          // customer_birth_day: "",
          // customer_phone: '',
          // appoint_remark: ''
        },
        timeArr: [],
        imagesUrl: [],
        dayOrderInfo: {},
        app_type: "", // 默认疫苗预约
        moreConfig: {},
      }
    },
    computed: {
      validMsg() {
        if (this.detailConfig?.formConfig?.cols && Array.isArray(this.detailConfig?.formConfig?.cols) && this
          .detailConfig.formConfig.cols.length > 0) {
          return this.detailConfig.formConfig.cols.reduce((res, cur) => {
            if (cur.msg) {
              res[cur.col] = cur.msg
            }
          }, {})
        }
      },
      detailConfig() {
        return this.moreConfig?.detailConfig
      },
      notEmpty() {
        if (Array.isArray(this.timeArr) && this.timeArr.length > 0) {
          if (Array.isArray(this.getRange) && this.getRange.length > 0) {
            return true
          } else {
            let greaterToday = this.timeArr.find(item => dayjs(item.app_date) - dayjs() > 0)
            return greaterToday
          }
        }
      },
      ...mapState({
        subscsribeStatus: state => state.app.subscsribeStatus,
        userInfo: state => state.user.userInfo
      }),
      vaccineTip() {
        if (this.app_type == '其它') {
          return '预约时间'
        }
        if (this.vaccineInfo) {
          if (!this.vaccineInfo.stock_count || this.vaccineInfo.stock_count < 1) {
            return '预约疫苗到货通知'
          } else {
            return '预约疫苗注射时间'
          }
        }
      },
      getRange() {
        if (Array.isArray(this.timeArr) && this.timeArr.length > 0) {
          return this.timeArr.sort((a, b) => dayjs(a._date) - dayjs(b._date))
        }
      },
    },
    methods: {
      onButton(e) {
        switch (e.type) {
          case 'navigate':
            if (e.url) {
              uni.navigateTo({
                url: e.url
              })
            }
            break;
          case 'submit':
            if (this.vaccineInfo && this.vaccineInfo.persons_count && this.vaccineInfo.persons_count === 1 && (this
                .vaccineInfo.stock_count < 1 || !this.vaccineInfo.stock_count)) {
              this.submitNotify()
            } else {
              this.submitOrder()
            }
            break;
          case 'notify':
            this.submitNotify()
            break;
        }
      },
      async getVaccineInfo(id) {
        // 疫苗库存
        let serviceName = this.moreConfig?.serviceName || 'srvhealth_store_vaccine_stocks_select'
        let app = this.moreConfig?.app || 'health'


        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: "id",
            ruleType: 'eq',
            value: id
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', serviceName, req, app)
        if (res.success && res.data.length > 0) {
          this.vaccineInfo = res.data[0]
          let e = res.data[0]
          if (e.is_general !== '否') {
            // 查找公共预约
            await this.selectTimeArr(e, true)
          } else {
            // 查找疫苗独立预约
            await this.selectTimeArr(e)
          }
        }
      },
      DateChange(e) {
        this.formModel.customer_birth_day = e.detail.value
      },
      disabledTime(e, data) {
        // 判断是否过期 已过期则禁用
        if (e.app_count_limit <= e.app_count && e.appoint_type !== '登记') {
          if (e.time_range_appointment_limit && e.time_range) {
            if (e.app_amount >= e.time_range_appointment_limit) {
              return true
            } else {
              if (data && data.app_amount >= data.app_count) {
                return true
              }
            }
          } else {
            return true
          }
        }
        if (e.predays && e.app_open_time && e._date === dayjs().add(e.predays, 'day').format('YYYY-MM-DD')) {
          if (dayjs() - dayjs(dayjs().format('YYYY-MM-DD') + ' ' + e.app_open_time) < 0) {
            // uni.showToast({
            //   title: `今天${e.app_open_time.slice(0,5)}才可预约${e.predays}天后的疫苗`,
            //   icon: 'none'
            // })
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
        if (this.detailConfig?.remark_pic_col && e && e[this.detailConfig.remark_pic_col]) {
          this.imagesUrl = [];
          let images = await this.getFilePath(e.remark_pic)
          if (Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
              const obj = {
                originUrl: `${this.$api.getFilePath}${images[i].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`,
                smallUrl: `${this.$api.getFilePath}${images[i].fileurl}&thumbnailType=fwsu_100&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`
              }
              this.imagesUrl.push(obj);
            }
          }
        }
      },

      async selectTimeArr(e, is_general) {
        let req = {
          "condition": [{
              "colName": "store_no",
              "ruleType": "eq",
              "value": this.store_no
            },
            {
              "colName": "app_date_end",
              "ruleType": "ge",
              "value": this.formateDate()
            },
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
        if (!is_general) {
          req.condition.push({
            "colName": "svs_no",
            "ruleType": "eq",
            "value": e.vs_no
          })
        } else {
          req.condition.push({
            "colName": "svs_no",
            "ruleType": "isnull"
          })
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
        let serviceName = this.detailConfig?.serviceName || 'srvhealth_store_vaccination_appointment_select'
        let app = this.detailConfig?.app || 'health'
        let res = await this.$fetch('select', serviceName, req, app)
        if (res.success) {
          let arr = []
          for (let index = 0; index < res.data.length; index++) {
            let item = res.data[index]
            let days = (dayjs(item.app_date_end) - dayjs(item.app_date)) / 3600000 / 24
            if (new Date(dayjs().format("YYYY/MM/DD")) - new Date(item.app_date) > 0) {
              days = (dayjs(item.app_date_end) - dayjs(dayjs().format("YYYY-MM-DD"))) / 3600000 / 24
            }
            for (let i = days; i >= 0; i--) {
              let date = dayjs(item.app_date_end).subtract(i, 'day').format("YYYY-MM-DD")
              if (item.predays) {
                let daysDiff = (dayjs(date) - dayjs(dayjs().format('YYYY-MM-DD'))) / 3600000 / 24
                if (daysDiff > item.predays) {
                  continue;
                }
              }
              if (item.weekday_set) {
                let week = this.getDayOfWeek(date)
                if (week) {
                  week = week.replace('周', '')
                }
                if (item.weekday_set.indexOf(week) === -1) {
                  continue;
                }
              }
              let obj1 = this.deepClone(item)
              obj1.app_date = date
              obj1._date = date
              if (obj1.time_range && obj1.time_range_appointment_limit) {
                let date1 = obj1.app_time_start
                let date2 = obj1.app_time_end
                date1 = dayjs(`${obj1._date} ${date1}`)
                date2 = dayjs(`${obj1._date} ${date2}`)
                let diff = date2.diff(date1, 'minute') / obj1.time_range
                let arr2 = []
                let start = obj1?.app_time_start.slice(0, 5)

                let recordList = await this.getWithin5minAppCount(obj1)
                for (let i = 0; i < diff; i++) {
                  let obj = this.deepClone(obj1)
                  obj.timeStart = start;
                  obj.timeEnd = dayjs(obj1.app_date + ' ' + start).add(obj1.time_range, 'minute')
                  let diff = obj.timeEnd.diff(dayjs(obj1.app_date + ' ' + obj1.app_time_end), 'minute')
                  if (diff > 0) {
                    obj.timeEnd = dayjs(obj1.app_date + ' ' + obj1.app_time_end).format('HH:mm')
                  } else {
                    obj.timeEnd = obj.timeEnd.format("HH:mm")
                  }
                  obj._time_start = `${obj._date} ${start}`
                  obj._time_end = `${obj._date} ${obj.timeEnd}`
                  if (Array.isArray(recordList) && recordList.length > 0) {
                    let data = recordList.filter(e => {
                      if (e.sa_no === obj.sa_no && e.app_time_start && obj.timeStart) {
                        let result = obj.timeStart === e.app_time_start.slice(0, 5)
                        return result
                      }
                    })

                    if (Array.isArray(data) && data.length > 0) {
                      obj.app_amount = data.reduce((res, cur) => {
                        if (typeof cur.amount === 'number' && !isNaN(cur.amount)) {
                          res += cur.amount;
                        } else {}
                        return res
                      }, 0)
                    }
                  }
                  arr2.push(this.deepClone(obj))
                  start = obj.timeEnd
                }
                obj1.list = arr2
                if (Array.isArray(recordList) && recordList.length > 0) {
                  obj1.app_amount = recordList.reduce((res, cur) => {
                    if (typeof cur.amount === 'number' && !isNaN(cur.amount)) {
                      res += cur.amount
                    }
                    return res
                  }, 0)
                }
                let result = this.deepClone(obj1)
                let deadline = dayjs().add(res.predays, 'day').format('YYYY-MM-DD')
                let app_open_time = dayjs(dayjs().format('YYYY-MM-DD') + ' ' + res.app_open_time)

                if (result.predays && result.app_open_time && result._date === deadline && dayjs() - app_open_time <
                  0) {} else {
                  arr.push(result)
                }
                // }
              } else {
                let obj = this.deepClone(obj1)
                obj.timeStart = dayjs(obj.app_date + ' ' + obj.app_time_start).format("HH:mm")
                obj.timeEnd = dayjs(obj.app_date + ' ' + obj.app_time_end).format("HH:mm")
                obj.app_amount = obj.app_count
                obj1.list = [obj]
                arr.push(obj1)
              }
            }
          }
		  console.log(dayjs,this.dayjs)
		  debugger
          this.timeArr = arr
          let timeArr = res.data

          // this.formModel.customer_name = this.userInfo.name || this.userInfo.nickName || null
          // this.formModel.customer_phone = this.userInfo.phone || null
          // this.formModel.customer_birth_day = this.userInfo.birthday || null
          // this.formModel.phone_xcx = this.userInfo.phone_xcx || null
          this.modalName = 'vaccine'
          this.getImage(e)
        }
      },
      selectItem(e, data) {
        if (e.predays && e.app_open_time && e._date === dayjs().add(e.predays, 'day').format('YYYY-MM-DD')) {
          if (dayjs() - dayjs(dayjs().format('YYYY-MM-DD') + ' ' + e.app_open_time) < 0) {
            let title = `今天${e.app_open_time.slice(0,5)}才可预约${e.predays}天后的疫苗`;
            if (this.detailConfig?.predaysMsg) {
              title = this.detailConfig?.predaysMsg.replace('${app_open_time}', e.app_open_time.slice(0, 5))
            }
            uni.showToast({
              title: title,
              icon: 'none'
            })
            return
          }
        }
        if (e.app_count_limit <= e.app_count && e.appoint_type !== '登记') {
          if (data) {
            if (data.app_count <= data.app_amount) {
              uni.showToast({
                title: '预约人数已满',
                icon: 'none'
              })
              return
            }
          } else {
            uni.showToast({
              title: '预约人数已满',
              icon: 'none'
            })
            return
          }
        }
        if (this.disabledTime(e)) {
          uni.showToast({
            title: '已过期或已约满',
            icon: 'none'
          })
          return
        }

        if (this.selectedVaccine === e) {
          this.selectedVaccine = {}
        } else {
          this.selectedVaccine = e
        }
      },
      async getWithin5minAppCount(item) {
        // 查找当前疫苗最近x分钟内预约次数
        if (!item.time_range || !item.time_range_appointment_limit) {
          // return true
          return
        }
        let serviceName = this.detailConfig?.recordService || 'srvhealth_store_vaccination_appoint_record_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
              "colName": "app_date",
              "ruleType": "eq",
              "value": item.app_date
            },
            {
              colName: 'app_state',
              ruleType: "ne",
              value: '取消'
            },
            {
              "colName": "store_no",
              ruleType: 'eq',
              value: this.storeInfo.store_no
            }
          ],
          "group": [{
              "colName": "sa_no",
              "type": "by"
            },
            // {
            //   "colName": "app_date",
            //   "type": "by",
            // }, 
            {
              "colName": "id",
              "type": "count",
              aliasName: "amount"
            },
            // {
            //   colName: 'appoint_name',
            //   "type": "by"
            // }
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
        if (item.time_range) {
          req.group.push({
            "colName": "app_time_start",
            "type": "by"
          })
        }
        if (item.sa_no) {
          req.condition.push({
            "colName": "sa_no",
            "ruleType": "eq",
            "value": item.sa_no
          })
        }
        let res = await this.$fetch('select', serviceName, req, 'health')
        if (res.success) {
          if (res.data.length > 0) {
            return res.data
          }
        }
      },
      toOrderList() {
        uni.navigateTo({
          url: '/storePages/VaccineOrder/VaccineOrder'
        })
      },
      async submitForm() {
        let arr = this.detailConfig?.formConfig?.cols
        if (Array.isArray(arr) && arr.length > 0) {
          let msg = ''
          arr.forEach(col => {
            if (col.required && !this.formModel[col.col]) {
              if (col.msg) {
                msg = col.msg
              } else {
                msg = `请确认信息是否填写完整`
              }
            }
          })
          if (msg) {
            return {
              msg: msg
            }
          }
        }
        // if (!this.formModel.customer_name) {
        //   return {
        //     msg: '请填写就诊人姓名'
        //   }
        // }
        if (!this.selectedVaccine || !this.selectedVaccine.sa_no) {
          return {
            msg: '请选择预约时间'
          }
        }
        let vaccineInfo = this.getRange.find(item => item.sa_no === this.selectedVaccine.sa_no)
        if (vaccineInfo?.app_count_limit) {
          if (vaccineInfo?.app_amount >= vaccineInfo?.app_count_limit) {
            uni.showToast({
              title: '已超过当前时间段预约人数限制!',
              icon: 'none',
            })
            return
          }
        }
        let selectedVaccine = this.deepClone(this.selectedVaccine)
        if (selectedVaccine.time_range && selectedVaccine.time_range_appointment_limit) {
          if (selectedVaccine.app_amount && selectedVaccine.app_amount > 0 && selectedVaccine.app_amount >=
            selectedVaccine
            .time_range_appointment_limit) {
            uni.showToast({
              title: '已超过当前时间段预约人数限制!',
              icon: 'none'
            })
            return {
              msg: '已超过当前时间段预约人数限制'
            }
          }
        }
        let serviceName = this.detailConfig?.formConfig?.serviceName
        let app = this.detailConfig?.formConfig?.app || 'health'
        let req = [{
          "serviceName": serviceName,
          "condition": [],
          "data": [{
            "store_no": this.storeInfo.store_no,
            "sa_no": this.selectedVaccine.sa_no,
            "svs_no": this.selectedVaccine.svs_no || this.selectedVaccine.vs_no || this.vaccineInfo.vs_no ||
              null,
            "svs_name": this.vaccineInfo?.vaccine_drug_name || this.selectedVaccine.svs_name || null,
            "appoint_name": this.selectedVaccine.appoint_name,
            "app_date": this.selectedVaccine.app_date,
            "app_time_start": this.selectedVaccine.timeStart || this.selectedVaccine.app_time_start,
            "app_time_end": this.selectedVaccine.timeEnd || this.selectedVaccine.app_time_end,
            // "customer_name": this.formModel.customer_name,
            // "customer_birth_day": this.formModel.customer_birth_day,
            // "customer_phone": this.formModel.customer_phone,
            // "appoint_remark": this.formModel.appoint_remark,
            // "person_no": this.userInfo.no,
            // "person_user_no": this.userInfo.userno,
            // "person_name": this.userInfo.name || this.userInfo.nick_name,
            // "person_image": this.userInfo.person_image || this.userInfo.profile_url
          }]
        }]
        // let data = 
        req[0].data[0] = {
          ...req[0].data[0],
          ...this.formModel
        }
        debugger
        let timeStart = req[0].data[0].app_time_start
        let timeEnd = req[0].data[0].app_time_end
        let app_time_slot = null
        if (timeEnd && timeStart) {
          if (timeStart.slice(0, 2) <= 12 && timeEnd.slice(0, 2) <= 12) {
            app_time_slot = '上午'
          } else if (timeStart.slice(0, 2) > 12 && timeEnd.slice(0, 2) > 12) {
            app_time_slot = '下午'
          } else {
            app_time_slot = '其它'
          }
          req[0].data[0].app_time_slot = app_time_slot
        }
        if (!this.onSubmit) {
          this.onSubmit = true
          let res = await this.$fetch('operate', serviceName, req,
            app);
          this.onSubmit = false
          if (res.success) {
            // this.$emit('submit', res.data)
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
        this.submitForm().then(res => {
          if (res !== true) {
            if (res && res.msg) {
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
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  uni.navigateBack({

                  })
                }
              }
            })
          } else {
            uni.showModal({
              title: '提示',
              content: '预约成功,请关注百想助理公众号，否则无法接收到消息通知，是否跳转到公众号关注引导页面？',
              success(res) {
                if (res.confirm) {
                  uni.redirectTo({
                    url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`
                  })
                }
              }
            })
          }

        })
      },
    },
    onPullDownRefresh() {
      if (this.id) {
        this.getVaccineInfo(this.id)
      }
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
    async onLoad(option) {

      if (option.app_type) {
        this.app_type = option.app_type
      }

      if (option.moreConfig) {
        if (typeof option.moreConfig === 'string') {
          let data = {
            userInfo: this.$store?.state.user?.userInfo,
            storeInfo: this.$store?.state.app?.storeInfo,
          }
          option.moreConfig = this.renderStr(option.moreConfig, data)
        }
        try {
          this.moreConfig = JSON.parse(option.moreConfig)
          if (Array.isArray(this.moreConfig?.detailConfig?.formConfig?.cols) && this.moreConfig.detailConfig
            .formConfig.cols
            .length > 0) {
            this.moreConfig.detailConfig.formConfig.cols.forEach(col => {
              if (col.col) {
                this.formModel[col.col] = '';
                if (col.value) {
                  this.formModel[col.col] = col.value;
                }
              }
            })
          }

        } catch (err) {
          console.log(err)
        }
      }

      if (option.store_no) {
        this.store_no = option.store_no
        // await this.getStoreInfo(option.store_no)
      }
      if (option.id) {
        this.id = option.id
        this.getVaccineInfo(option.id)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .appointment-wrap {
    background-color: #3ACBC6;
    min-height: calc(100vh - var(--window-top));

    .appointment-content {
      border-radius: 50rpx 50rpx 0 0;
      background-color: #ffffff;
      padding: 0 40rpx;
      height: calc(100vh - var(--window-top));
      padding-top: 30rpx;
      display: flex;
      flex-direction: column;

      .title {
        margin-bottom: 10rpx;
        font-size: 36rpx;
        font-family: 苹方-简;
        font-weight: normal;
        color: #333333;
      }

      .content {
        flex: 1;
        overflow-y: scroll;

        .sub-title {
          padding: 20rpx 0;
          font-size: 16px;
          font-family: 苹方-简;
          font-weight: normal;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .text-cyan {
            color: #3ACBC6;
          }

          .cu-btn {
            height: 24px;
            background: linear-gradient(165deg, rgba($color: #3ACBC6, $alpha: 0.1) 0%, rgba($color: #47A9F2, $alpha: 0.1) 60%, rgba($color: #624BFF, $alpha: 0.1) 100%);
            box-shadow: 0px 3px 7px rgba(58, 203, 198, 0.2);
            border-radius: 15px;
            margin: 0 20rpx;
            padding: 10rpx 20rpx;
            font-size: 12px;
            font-weight: normal;
            line-height: 22px;
            color: #63A2FF;
          }

          .right {
            // background-color: rgba($color: #000000, $alpha: 1.0);
            font-size: 12px;
            font-weight: normal;
            line-height: 22px;
            color: #9092A5;

            .text {
              margin-left: 10rpx;
            }
          }

        }

        .description {
          background: #FAFBFC;
          border-radius: 20rpx;
          padding: 20rpx 30rpx;
          font-size: 12px;
          font-family: 苹方-简;
          font-weight: normal;
          line-height: 20px;
          color: #9092A5;
        }

        .person-info-form {
          background: #FAFBFC;
          border-radius: 20rpx;
          padding: 20rpx 30rpx;
          font-family: 苹方-简;
          font-weight: normal;
          line-height: 20px;
          color: #9092A5;
          margin-bottom: 20rpx;

          ::v-deep .place-holder {
            font-size: 28rpx;
            color: #D8D9DF;

            &.text-area {
              color: #9092A5;
              text-align: left;
            }
          }

          .bx-form-group {
            display: flex;
            align-items: center;
            text-align: right;
            font-size: 28rpx;
            padding: 10rpx 0;

            &.text-area {
              margin-top: 10px;
              border-top: 1px solid #f1f1f1;
              padding: 10px 0;
              text-align: left;
            }

            .input {
              font-size: 28rpx;
            }

            .title {
              flex: 1;
              text-align: left;
              font-size: 28rpx;
              height: 20px;
              font-family: 苹方-简;
              font-weight: normal;
              color: #9092A5;
              margin-bottom: 0;
            }
          }

          .textarea {
            height: 88px;
            background: #FAFBFC;
            opacity: 1;
            border-radius: 12px;
          }
        }

        .time-range-box {

          .date-area {
            display: flex;
            flex-wrap: wrap;

            .date-time-box {
              // background: linear-gradient(135deg, rgba($color:#3ACBC6, $alpha:0.1) 0%, rgba($color:#47A9F2, $alpha:0.1) 60%, rgba($color:#624BFF, $alpha:0.1) 100%);
              border-radius: 20rpx;
              // padding: 20rpx 20rpx 10rpx;
              width: 100%;
              min-height: 200rpx;
              color: #9092A5;
              margin-bottom: 20rpx;
              font-size: 28rpx;

              .title {
                font-size: 28rpx;
                color: #9092A5;
                text-align: left;
                text-indent: 20rpx;
              }

              .date-area .date-item {
                // background-color: #fff;
                background: rgba($color: #8EB0FF, $alpha: 0.1);
                background-image: none;
              }
            }

            .date-item {
              text-align: center;
              width: calc(50% - 20rpx);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 20rpx;
              border-radius: 20rpx;
              padding: 10rpx;
              color: #9092A5;
              // background: linear-gradient(135deg, rgba($color:#3ACBC6, $alpha:0.1) 0%, rgba($color:#47A9F2, $alpha:0.1) 60%, rgba($color:#624BFF, $alpha:0.1) 100%);
              margin-bottom: 10rpx;
              border: 1px solid #fff;
              font-size: 32rpx;

              &:nth-child(2n) {
                margin-right: 0;
              }

              &.line-cyan {
                // border-color: #3acbc6;
                border: 1px solid #FFBD37;
                background: rgba(255, 189, 55, 0.31) !important;
                color: #666;
              }

              &.disabled {
                opacity: 0.8;
              }

              .date {
                padding: 0 10rpx;
                line-height: 50rpx;
              }

              .vaccine_app_count {
                // color: #3ACBC6;
                font-size: 20rpx;
              }

              .order-info {
                background-color: #fff;
                border-radius: 10rpx;
                padding: 10rpx;


              }
            }
          }
        }
      }

      .footer {
        display: flex;
        justify-content: center;
        padding-bottom: 50rpx;

        .cu-btn {
          border-radius: 40rpx;

          &.line-cyan {
            color: #3ACBC6;
            width: 40%;
            margin-right: 20rpx;

            &::after {
              border-radius: 80rpx;
            }
          }

          &.bg-yan {
            width: 25%;
            background-color: #3ACBC6;
          }
        }
      }
    }
  }
</style>
