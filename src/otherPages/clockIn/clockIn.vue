<template>
  <view class="clock-in-wrap">
    <view class="top-bar">
      <view class="top-item" v-for="item in clockTypes" :key="item.name" :class="{active:curType===item.name}"
        @click="changeType(item.name)">
        {{item.name}}
      </view>
    </view>
    <view class="clock-content">
      <view class="top-card">
        <view class="title">
          今日打卡
        </view>
        <view class="card" :class="{'active':punch_card_type==='上班'}" @click="changeCardType('上班')">
          <view class="text">
            <text v-if="shiftInfo&&shiftInfo.shift_work_time">
              <text class="margin-right-xs">上班</text>
              <text>{{shiftInfo.shift_work_time.slice(0,5)}}</text>
            </text>
          </view>
          <view class="text text-gray">
            <text v-if="clockInInfo&&clockInInfo.upOfficeTime">
              <text class="cuIcon-roundcheckfill text-blue"></text>
              <text v-if="clockInInfo.upOfficeTime"> {{clockInInfo.upOfficeTime.slice(0,5)}}</text>
              <text>已打卡</text>
            </text>
            <text v-else> 未打卡</text>
            <!-- <button class="cu-btn bg-white sm round"><text
                class="margin-right-xs cuIcon-refresh text-lg text-blue "></text>更新</button> -->
          </view>
        </view>
        <view class="card" :class="{'active':punch_card_type==='下班'}" @click="changeCardType('下班')">
          <view class="text">
            <text v-if="shiftInfo&&shiftInfo.shift_getoff_work_time">
              <text class="margin-right-xs">下班</text>
              <text> {{shiftInfo.shift_getoff_work_time.slice(0,5)}} </text>
            </text>
          </view>
          <view class="text text-gray">
            <text v-if="clockInInfo&&clockInInfo.downOfficeTime"><text
                class="cuIcon-roundcheckfill text-blue"></text><text>{{clockInInfo.downOfficeTime.slice(0,5)}}</text>
              已打卡</text>
            <text v-else>未打卡</text>
            <!-- <button class="cu-btn bg-white sm round" @click="addclockInInfo('update')"
              v-if="clockInInfo&&clockInInfo.downOfficeTime"><text
                class="cuIcon-refresh margin-right-xs text-lg text-blue "></text>更新</button> -->
          </view>
        </view>
      </view>
      <view class="clock-card" v-if="curType === '上下班打卡'">
        <image :src="require('../static/org_icon.png')" mode="" class="store-icon "></image>
        <!--     <view class="text-bold padding-bottom-xs">
          {{locationTip||''}}
        </view> -->
        <view class="store-name text-light">
          {{storeInfo.name||''}}
        </view>
        <view class="clock-button-box">
          <debounce-view type="throttle" @onThrottle="addclockInInfo">
            <view class="clock-button">
              <view class="rotate-line" :class="{active:areClocking}"></view>
              <view class="text padding-tb-xs">
                <text v-if="isAuthLocation==false">无法</text>
                <!--      <text v-else-if="clockInInfo&&!clockInInfo.upOfficeTime">上班</text>
              <text v-else-if="clockInInfo&&!clockInInfo.downOfficeTime">下班</text> -->
                <text v-if="clockInInfo&&clockInInfo.downOfficeTime&&clockInInfo.upOfficeTime">更新</text>
                <!-- <text v-else>无需</text> -->
                打卡
              </view>
              <view class="text-lg">
                {{curTime||''}}
              </view>
            </view>
          </debounce-view>
        </view>
        <view class="text-light" v-if="shiftInfo&&shiftInfo.shift_getoff_work_time">
          请在{{shiftInfo.shift_getoff_work_time.slice(0,5)}}之后进行打卡
        </view>
      </view>
      <view class="clock-card" v-if="curType === '外出打卡'">
        <view class="map-box">
          <map style="width: 100%; height: 100%;filter: blur(2px);" :latitude="locationInfo.latitude"
            :longitude="locationInfo.longitude" v-if="locationInfo"></map>
        </view>
        <view class="map-box-top">
          <view class="text-bold padding-bottom-xs text-lg" v-if="addressName">
            {{addressName}}
          </view>
          <view class="store-name text-light-light" v-if="addressName">
            当前定位
          </view>
          <view class="clock-check-type text-light-light">
            <!-- WiFi/蓝牙：XXXX -->
          </view>

          <view class="clock-button-box green wrap">
            <debounce-view type="throttle" @onThrottle="addclockInInfo">
              <view class="clock-button">
                <view class="rotate-line" :class="{active:areClocking}"></view>
                <view class="text padding-tb-xs">
                  <text v-if="isAuthLocation==false">无法</text>
                  <text v-else>外出</text>
                  打卡
                </view>
                <view class="text-lg">
                  {{curTime||''}}
                </view>
              </view>
            </debounce-view>
          </view>
          <view class="text-light-light " v-if="shiftInfo&&shiftInfo.shift_getoff_work_time">
            请在{{shiftInfo.shift_getoff_work_time.slice(0,5)}}之后进行打卡
          </view>
        </view>
      </view>
      <view class="record-card" v-if="clockInRecord&&clockInRecord.length>0">
        <view class="cu-timeline">
          <!-- <view class="cu-time">06-17</view> -->
          <view class="cu-item text-blue" v-for="item in clockInRecord">
            <view class="content bg-white shadow-blur">
              <view class="text-lg text-bold">
                {{item.punch_card_type||''}} 打卡时间 :{{item.punch_card_time?item.punch_card_time.slice(0,5):''}}
              </view>
              <view class="text-gray" v-if="item.location_name">
                <text class="cuIcon-locationfill margin-right-xs"></text>
                <text>{{item.location_name||''}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="cu-modal bottom-modal">
      <view class="cu-dialog">
        <view class="clock-in-modal">

        </view>
      </view>
    </view>
  </view>
</template>

<script>
  let interVal = null
  const dayjs = require('dayjs');
  let QQMapWX = require('@/otherPages/static/js/qqmap-wx-jssdk.min.js');
  let qqmapsdk;
  // 引入腾讯地图SDK核心类

  export default {
    data() {
      return {
        appName: "",
        curType: '上下班打卡',
        modalName: "",
        clockTypes: [{
            name: '上下班打卡'
          },
          {
            name: '外出打卡'
          }
        ],
        punch_card_type: "", // 上班、下班
        curTime: "",
        locationInfo: null,
        locationTip: "", //提示信息
        addressInfo: null,
        clockLocation: null, //打卡地点信息
        locationNo: 'DD202203031915590003',
        disableClockIn: false,
        distance: '', //定位距离打卡点的距离
        clockInInfo: null, // 当天打卡信息
        clockInRecord: null, //当天打卡记录
        areClocking: false, // 正在打卡
        shiftInfo: null, //班次信息
        isAuthLocation: false,
      }
    },
    computed: {
      distanceClockIn() {
        return this.clockLocation?.clock_in_scope
      },
      addressName() {
        if (this.addressInfo?.formatted_addresses?.recommend) {
          return this.addressInfo?.formatted_addresses?.recommend
        } else if (this.addressInfo?.formatted_addresses?.rough) {
          return this.addressInfo?.formatted_addresses?.rough
        } else if (this.addressInfo && Array.isArray(this.addressInfo.pois) && this.addressInfo.pois
          .length > 0 && this.addressInfo?.pois[0].title) {
          return this.addressInfo.pois[0].title
        } else {
          return ''
        }
      }
    },
    methods: {
      changeCardType(e) {
        if (this.punch_card_type === e) {
          this.punch_card_type = ''
        } else {
          this.punch_card_type = e
        }
      },
      countDistance() {
        let clockLat = this.clockLocation?.location_latitude
        let clockLng = this.clockLocation?.location_longitude
        let userLat = this.locationInfo?.latitude || this.addressInfo?.location?.lat
        let userLng = this.locationInfo?.longitude || this.addressInfo?.location?.lng

        // if (!this.distanceClockIn) {
        //   this.locationTip = '打卡点范围设置错误，无法进行打卡'
        //   this.disableClockIn = true
        //   return
        // }


        // if (!this.distanceClockIn) {
        //   this.locationTip = '打卡点范围设置错误，无法进行打卡'
        //   this.disableClockIn = true
        //   return
        // }

        // if (!clockLat || !clockLng) {
        //   this.locationTip = '打卡点经纬度设置错误，无法进行打卡'
        //   this.disableClockIn = true
        //   return
        // }

        if (!userLat || !userLng) {
          this.locationTip = '用户位置信息错误'
          this.disableClockIn = true
          return
        }
        this.distance = this.getDistance(userLat, userLng, clockLat, clockLng)
        // if (this.distance <= this.distanceClockIn) {
        //   this.locationTip = '您已在打卡范围内'
        //   this.disableClockIn = false
        // }
        // if (this.distance > this.distanceClockIn) {
        //   this.locationTip = '您不在打卡范围内'
        //   this.disableClockIn = true
        // }
      },
      //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
      getDistance(lat1, lng1, lat2, lng2) {
        //进行经纬度转换为距离的计算
        function rad(d) {
          return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
        }
        const radLat1 = rad(lat1);
        const radLat2 = rad(lat2);
        const a = radLat1 - radLat2;
        const b = rad(lng1) - rad(lng2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        // 输出为公里
        // s = Math.round(s * 10000) / 10000;
        // // 输出为米
        s = Math.round(s * 1000);
        s = s.toFixed(4);
        // uni.showToast({
        //   title: `距离打卡点:${Number(s)}米`,
        //   icon: 'none'
        // })
        return s;
      },

      async getClockInTarget() {
        // 根据部门查找打卡对象数据
        let serviceName = 'srvcorp_attend_office_employee_relation_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: 'clock_depart_no',
            ruleType: 'eq',
            value: this.vloginUser?.dept_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const res = await this.$fetch('select', serviceName, req, 'corp')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          let clockInTarget = res.data[0]
          if (clockInTarget?.location_no) {
            this.locationNo = clockInTarget?.location_no
            // 根据打卡对象数据中的打卡点编号查找打卡点信息
            this.getClockLocation()
          }
        }

      },
      async getClockLocation() {
        // 查找打卡点信息
        let serviceName = 'srvcorp_attend_office_location_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: 'location_no',
            ruleType: 'eq',
            value: this.locationNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const res = await this.$fetch('select', serviceName, req, 'corp')
        if (res.success && res.data?. [0]) {
          this.clockLocation = res.data[0]
        }
      },
      changeType(e) {
        this.curType = e
        this.initPageData()
      },
      reverseGeocoder() {
        // 逆地址解析
        let _this = this
        return new Promise(resolve => {
          qqmapsdk.reverseGeocoder({
            // location: {
            //   latitude: res.latitude,
            //   longitude: res.longitude
            // },
            // location: '34.21439,108.91062',
            //位置坐标，默认获取当前位置，非必须参数
            get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
            success: function(res1) { //成功后的回调
              var result = res1.result;
              var mks = [];
              //当get_poi为0时或者为不填默认值时，检索目标位置，按需使用
              // mks.push({ // 获取返回结果，放到mks数组中
              //   title: result.address,
              //   id: 0,
              //   latitude: result.location.lat,
              //   longitude: result.location.lng,
              //   iconPath: './resources/placeholder.png', //图标路径
              //   width: 20,
              //   height: 20,
              //   callout: { //在markers上展示地址名称，根据需求是否需要
              //     content: result.address,
              //     color: '#000',
              //     display: 'ALWAYS'
              //   }
              // });
              _this.addressInfo = result
              _this.locationInfo = {
                longitude: result?.location?.lng,
                latitude: result?.location?.lat
              }
              resolve(result)
            },
            fail: function(error) {
              console.error(error);
            },
            complete: function(res) {
              console.log(res);
            }
          })
        })
      },

      // 添加打卡记录
      async addclockInInfo(type = 'add') {
        if (!this.isAuthLocation) {
          return
        }
    
        let conds = [{
          colName: 'user_no',
          ruleType: 'eq',
          value: this.vloginUser?.user_no
        }]

     
        let latestTime = this.shiftInfo?.shift_latest_punch_time;
        if (this.curType === '上下班打卡') {
          uni.showLoading({
            mask: true,
          })
          // let result = await this.reverseGeocoder()
          uni.hideLoading()
          let userLat = ''
          let userLng = ''
          if(this.locationInfo?.longitude&&this.locationInfo?.latitude){
            userLat = this.locationInfo?.latitude
            userLng = this.locationInfo?.longitude
          }else {
            let result  = await new Promise(resolve=>{
              wx.getLocation({
               type: 'gcj02',
               success (res) {
                 resolve(res)
               }
              })
            })
            if(result?.latitude&&result?.longitude){
              userLat = result?.latitude
              userLng = result?.longitude
            }
          }
          let distance = ''
          let canClock = false
          let hasClockAddress = await this.normalSelect('srvcorp_attend_punch_location_select', {
            condition: conds
          })
          if (!userLat || !userLng) {
            //
            uni.showModal({
              title: '提示',
              content: '地理位置信息获取失败，请检查是否授权获取位置信息，或重新进入小程序后再次尝试打卡',
              showCancel: false
              // success:res=>{
              //   if(res)
              // }
            })
            return
          }
          if (Array.isArray(hasClockAddress) && hasClockAddress.length > 0) {
            hasClockAddress.forEach(item => {
              let clockLat = item?.location_latitude
              let clockLng = item?.location_longitude
              // let userLat = this.locationInfo?.latitude || this.addressInfo?.location?.lat
              // let userLng = this.locationInfo?.longitude || this.addressInfo?.location?.lng
              let distance = this.getDistance(userLat, userLng, clockLat, clockLng)
              this.distance = distance
              if (item.clock_in_scope - distance >= 0) {
                canClock = true
              }
            })
          } else if (typeof hasClockAddress === 'object' && hasClockAddress?.location_no) {
            let clockLat = hasClockAddress?.location_latitude
            let clockLng = hasClockAddress?.location_longitude
            // let userLat = this.locationInfo?.latitude || this.addressInfo?.location?.lat
            // let userLng = this.locationInfo?.longitude || this.addressInfo?.location?.lng
            let distance = this.getDistance(userLat, userLng, clockLat, clockLng)
            this.distance = distance
            if (hasClockAddress.clock_in_scope - distance >= 0) {
              canClock = true
            }
          }
          if (canClock === false) {
            // this.locationTip = '您不在打卡范围内'
            // if (this.clockLocation.clock_in_scope - this.distance < 0) {
            let result = await new Promise((resolve) => {
              uni.showModal({
                title: "提示",
                content: "当前不在打卡范围内,是否进行外出打卡",
                success: (res) => {
                  if (res.confirm) {
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                }
              })
            })
            if (result === true) {
              this.curType = '外出打卡'
            } else {
              return
            }
            // }
          } else {}
          
          if (latestTime) {
            latestTime = new Date(`${dayjs().format('YYYY-MM-DD')} ${latestTime}`)
            if (new Date() - new Date(latestTime) > 0) {
              uni.showToast({
                title: "当前时间段不能打卡",
                icon: 'none'
              })
              return
            }
          }
        }

        if (!this.punch_card_type) {
          // this.punch_card_type = 
          await new Promise(resolve => {
            uni.showModal({
              title: '提示',
              content: '请在上方选择打卡类型后再进行打卡',
              // confirmText: '上班打卡',
              // cancelText: '下班打卡',
              confirmText:'知道了',
              
              // cancelColor: "#0081FF",
              // success: (res) => {
              //   if (res.confirm) {
              //     resolve('上班')
              //   } else {
              //     resolve('下班')
              //   }
              // }
            })
          })
          return
        }

        let punch_card_type = this.punch_card_type

        this.areClocking = true
        let req = [{
          "serviceName": "srvcorp_attend_clock_in_log_add",
          "condition": [],
          "data": [{
            "punch_card_date": dayjs().format("YYYY-MM-DD"),
            "punch_card_time": dayjs().format("HH:mm"),
            "punch_card_type": punch_card_type,
            "user_no": this.vloginUser?.user_no,
            "user_name": this.vloginUser?.real_name,
            "depart_no": this.vloginUser?.dept_no,
            "depart_name": this.vloginUser?._dept_info?.dept_name,
            "punch_card_method": "定位",
            "punch_card_location": this.curType === '上下班打卡' ? "内勤" : "外勤",
            "punch_card_longitude": this.locationInfo?.longitude,
            "punch_card_latitude": this.locationInfo?.latitude,
            "location_no": this.locationNo
          }]
        }]
        const url = this.getServiceUrl(this.appName || 'corp', 'srvcorp_attend_clock_in_log_add', 'operate');
        let res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          uni.vibrateLong({
            success: function() {
              console.log('success');
            }
          });
          let clockInType = punch_card_type
          if (this.curType !== '上下班打卡') {
            clockInType = '外出'
          }
          var plugin = requirePlugin("WechatSI")
          plugin.textToSpeech({
            lang: "zh_CN",
            tts: true,
            content: `${clockInType||''}打卡成功`,
            success: function(res) {
              const innerAudioContext = uni.createInnerAudioContext();
              innerAudioContext.autoplay = true;
              innerAudioContext.src = res.filename
              innerAudioContext.play()
            }
          })
          this.punch_card_type = null
          uni.showToast({
            title: `${clockInType||''}打卡成功`,
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: res.data.resultMessage,
            icon: 'none'
          })
          return
        }
        this.initPageData()
        this.areClocking = false
      },
      // 获取今日打卡记录
      async getclockInInfo() {
        const serviceName = 'srvcorp_attend_clock_in_log_select'
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
          condition: [{
              colName: 'punch_card_date',
              ruleType: 'like',
              value: dayjs().format('YYYY-MM-DD')
            },
            {
              colName: 'user_no',
              ruleType: 'eq',
              value: this.vloginUser?.user_no
            }
          ]
        }
        const url = this.getServiceUrl(this.appName || 'corp', serviceName, 'select');
        const res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          this.clockInRecord = res.data.data
        }
      },
      async normalSelect(serviceName, params = {}) {
        let {
          condition
        } = params
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          condition: condition || []
        }
        const url = this.getServiceUrl(this.appName || 'corp', serviceName, 'select');
        const res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            if (res.data.data.length > 1) {
              return res.data.data
            }
            return res.data.data[0]
          }
        }

      },
      async initPageData() {
        this.disableClockIn = true
        let cond = [{
          colName: 'apply_user_no',
          ruleType: "eq",
          value: this.vloginUser?.user_no
        }]
        // 查看今天是否需要打卡 srvcorp_attend_ispunchcard_select
        let isNeedClockIN = await this.normalSelect('srvcorp_attend_ispunchcard_select', {
          condition: cond
        })
        let clockRecord = null
        let isTimeout = null
        let shiftInfo = null //班次信息
        if (isNeedClockIN?.isPunchCard == 1) {
          // 班次显示查询 srvcorp_attend_shift_setting_show_name_select
          let cond2 = [{
            colName: 'user_no',
            ruleType: "eq",
            value: this.vloginUser?.user_no
          }]
          shiftInfo = await this.normalSelect('srvcorp_attend_shift_user_select', {
            condition: cond2
          })
          this.shiftInfo = shiftInfo
          // 当天上下班是否打卡查询 srvcorp_attend_currentday_select
          let cond1 = [{
            colName: 'user_no',
            ruleType: "eq",
            value: this.vloginUser?.user_no
          }]
          clockRecord = await this.normalSelect('srvcorp_attend_currentday_select', {
            condition: cond1
          })
          // if (clockRecord) {
          if (Array.isArray(clockRecord) && clockRecord.length > 1) {
            this.clockInInfo = {
              user_no: clockRecord[0].user_no || clockRecord[1].user_no,
              downOfficeTime: clockRecord[0].downOfficeTime || clockRecord[1].downOfficeTime,
              upOfficeTime: clockRecord[0].upOfficeTime || clockRecord[1].upOfficeTime,
              punch_card_date: clockRecord[0].punch_card_date || clockRecord[1].punch_card_date
            }
          } else if (Array.isArray(clockRecord) && clockRecord.length > 0) {
            this.clockInInfo = clockRecord[0]
          } else if (typeof clockRecord === 'object' && clockRecord?.user_no) {
            // 
            this.clockInInfo = clockRecord
          }
          // 当天打卡时间是否已过 srvcorp_attend_isouttime_select
          isTimeout = await this.normalSelect('srvcorp_attend_isouttime_select')
          if (isTimeout?.isouttime > 0) {
            // this.disableClockIn = true;
            // return
          }
          // } else {
          //   return
          // }
        } else {
          this.disableClockIn = true;
          return
        }


        this.disableClockIn = false

        // 查找打卡点信息
        await this.getClockInTarget()
        // 查找今日打卡记录
        await this.getclockInInfo()
        // 获取经纬度，
        await this.reverseGeocoder()

        if (this.curType === '上下班打卡') {
          // 需要在打卡范围内
          // 计算定位坐标离打卡点距离，判断是否可以打卡
          // await this.countDistance()
        } else {

        }
        return
        // await this.getLocation()
      },
      async checkLocationAuth() {
        return await new Promise(resolve => {
          uni.authorize({
            scope: 'scope.userLocation',
            success() {
              resolve(true)
            },
            fail() {
              uni.showModal({
                title: '提示',
                content: '不授权获取位置信息将不能进行打卡',
                cancelText: '进行授权',
                cancelColor: '#0081FF',
                success(res) {
                  if (res.confirm) {
                    resolve(false)
                  } else {
                    uni.openSetting({
                      success(res) {
                        console.log(res.authSetting)
                        if (res.authSetting['scope.userLocation']) {
                          resolve(true)
                        } else {
                          resolve(false)
                        }
                      }
                    });
                  }
                }
              })
            }
          })
        })
      },
    },
    onPullDownRefresh() {
      this.initPageData()
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
    async onLoad(option) {
      let isAuthLocation = await this.checkLocationAuth()
      if (isAuthLocation !== true) {
        this.isAuthLocation = false
        // uni.navigateBack()
        return false
      } else {
        this.isAuthLocation = true
      }
      qqmapsdk = new QQMapWX({
        key: 'MHABZ-CHOKF-YBFJZ-JJYCQ-OSI75-YABF4'
      });
      if (option.locationNo) {
        this.locationNo = option.locationNo
      }
      await this.initPageData()
      wx.onLocationChange((res) => {
        console.log('location change', res)
        if (res?.latitude) {
          this.locationInfo.latitude = res.latitude
        }
        if (res?.longitude) {
          this.locationInfo.longitude = res.longitude
        }
      })
      interVal = setInterval(() => {
        this.curTime = dayjs().format("HH:mm")
      }, 1000)


    },
    onUnload() {
      clearInterval(interVal)
      interVal = null
    }
  }
</script>

<style lang="scss">
  .clock-in-wrap {
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--window-top));
    background-color: #F8F8FA;

    .text-light {
      font-size: 12px;
      font-family: 苹方-简;
      font-weight: normal;
      color: #ADAEBB;
      padding: 2px;
    }

    .top-bar {
      height: 50px;
      display: flex;
      align-items: center;
      background-color: #fff;

      .top-item {
        flex: 1;
        line-height: 50px;
        text-align: center;
        color: #ADAEBB;

        &.active {
          position: relative;
          color: #313131;

          &::after {
            content: '';
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-bottom-color: #0088FE;
            position: absolute;
            bottom: 0;
            left: calc(50% - 3px);
          }
        }
      }
    }

    .clock-content {
      padding: 10px 15px;
      flex: 1;
      overflow-y: scroll;

      .top-card {
        background-color: #fff;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-wrap: wrap;

        .title {
          width: 100%;
          padding-bottom: 10px;
          font-weight: bold;
        }

        .card {
          background-color: #F8F8FA;
          padding: 10px;
          margin-right: 10px;
          border-radius: 10px;
          color: #474849;
          flex: 1;
          border: 1px solid transparent;

          &.active {
            border-color: #007AFF;
          }

          &:last-child {
            margin-right: 0;
          }

          .text {
            padding: 3px 0;
            display: flex;
            justify-content: space-between;

            .text-lg {
              font-size: 16px;
            }
          }
        }
      }
    }

    .clock-card {
      background-color: #fff;
      border-radius: 10px;
      margin-top: 10px;
      text-align: center;
      overflow: hidden;
      padding: 10px 0;
      position: relative;
      min-height: 300px;

      .store-icon {
        width: 50px;
        height: 50px;
        margin: 0 auto;
      }

      .map-box-top {
        width: 100%;
        min-height: 300px;
        position: absolute;
        top: 0;
        left: 0;
        background-image: linear-gradient(transparent, #fff);
        z-index: 100;
        padding: 10px;

        .text-lg {
          font-size: 20px;
        }

        .clock-button-box {
          // padding: 10px;
        }

        .text-light-light {
          color: #333;
        }
      }

      .map-box {
        height: 340px;
        width: 100%;
        position: absolute;
        padding: 10px;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .clock-button-box {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        padding: 30px;

        &.green {
          .clock-button {
            background-color: #D0F2DD;
            color: #00B043;

            &::after {
              border-color: rgba($color: #D0F2DD, $alpha: 0.8);
            }

            &::before {
              border-color: rgba($color: #00B043, $alpha: 0.1);
            }
          }
        }

        .clock-button {
          width: 120px;
          height: 120px;
          background-color: #CEE1FF;
          border-radius: 50%;
          color: #0088FE;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;

          @keyframes rotate {
            from {
              transform: rotate(0);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .rotate-line {
            width: 5px;
            height: 60px;
            // background: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: 0 0;

            &.active {
              background-image: linear-gradient(to left, transparent, #fff 95%, transparent);
              animation: rotate 2s infinite linear;
            }
          }

          &::after {
            content: '';
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 1px solid rgba($color: #CEE1FF, $alpha: 0.8);
            position: absolute;
            top: calc(50% - 70px);
            left: calc(50% - 70px);
          }

          &::before {
            content: '';
            width: 160px;
            height: 160px;
            border-radius: 50%;
            border: 1px solid rgba($color: #6DA5F7, $alpha: 0.1);
            position: absolute;
            top: calc(50% - 80px);
            left: calc(50% - 80px);
          }

          .text {
            font-size: 16px;
            z-index: 1;
          }

          .text-lg {
            font-size: 28px;
            line-height: 34px;
            z-index: 1;
          }
        }
      }
    }

    .record-card {
      margin-top: 10px;

      .cu-timeline {
        background-color: transparent;

        &>.cu-item {
          padding: 0px 0px 10px 40px;

          .content {
            border-radius: 10px;
          }

          &::before {
            background-color: transparent;
            top: calc(50% - 12.5px);
            left: 8px;
          }

          &::after {
            top: calc(50% + 12.5px);
            height: calc(100% - 25px);
            left: 20px;
          }

          &:last-child::after {
            content: none;
          }
        }
      }

    }
  }
</style>
