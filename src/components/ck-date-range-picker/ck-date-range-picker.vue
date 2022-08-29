<template>
  <view class="">
    <view class="flex" style="color: #808080;" @click="open">
      <slot></slot>
    </view>
    <view class="cu-modal bottom-modal" :class="{show:show}" @click="hide">
      <view class="cu-dialog" @click.stop="">
        <view class="weeks">
          <view v-for="(item,index) in week" :key="index">{{item}}</view>
        </view>
        <!-- <view style="height: 24px;"></view> -->
        <scroll-view :scroll-y="true" :style="'height: '+[scrollHeight]+'px;'" @scrolltolower="scrollTolower"
          :lower-threshold="500">
          <view class="calendar" v-for="(item,index) in dayList" :key="index">
            <view class="year-month">{{item.year+'-'+item.month}}</view>
            <view class="days">
              <view class="day" :class="[getClass(item.year,item.month,ite)]" v-for="(ite,ind) in item.day" :key="ind"
                :style="''+['width:'+dayWidth+'px;height:'+dayWidth+'px']" @click="selDay(item.year,item.month,ite)">
                <view class="dd" :style="'height: '+[dayWidth]+'rpx;'">{{ite||''}}</view>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="flex justify-center margin-tb">
          <button class="cu-btn round bg-blue lg" style="width: 80%;" @click="confirm">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: "ck-date-range-picker",
    data() {
      return {
        show: false,
        //日历
        year: '', //当前年份
        month: '', //当前月份
        day: '', //当前天
        week: ['日', '一', '二', '三', '四', '五', '六'],
        dayList: [], //列表
        startYear: '', //选择开始年份
        startMonth: '', //选择开始月份
        startDay: '', //选择开始天
        endYear: '', //选择结束年份
        endMonth: '', //选择结束月份
        endDay: '', //选择结束日
        dayWidth: '',
        greenDays: [], // 可预约日期
        grayDays: [], //休息日期列表
        redDays: [], // 已预约日期列表
      };
    },
    props: {
      serviceNo: {
        type: String,
        default: ''
      },
    },
    watch: {
      serviceNo: {
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue) {
            Promise.all([this.getGrayDay(), this.getRedDay()]).then(value => {
              if (Array.isArray(value) && value.length == 2 && Array.isArray(value[0]) && Array.isArray(value[1])) {
                const greenDays = []
                for (let i = 0; i <= 60; i++) {
                  let date = this.dayjs().add(i, 'day').format("YYYY/MM/DD")
                  if (!value[0].includes(date) && !value[1].includes(date)) {
                    greenDays.push(date)
                  }
                }
                this.greenDays = greenDays
              }
            })
          }
        }
      }
    },
    computed: {
      //总选择的天数
      allDay: function() {
        if (!this.startYear || !this.startMonth || !this.startDay || !this.endYear || !this.endMonth || !this
          .endDay) {
          return 0;
        }
        let start = new Date(this.startYear, this.startMonth - 1, this.startDay);
        let end = new Date(this.endYear, this.endMonth - 1, this.endDay);
        return this.countDays(start, end);
      },
      //组件高度,默认全屏高度
      scrollHeight: function() {
        return uni.getSystemInfoSync().windowHeight - 150;
        // return uni.getSystemInfoSync().windowHeight - 24;
      }
    },
    created() {
      this.dayWidth = (uni.getSystemInfoSync().screenWidth) / 7;
      this.setNow();
      this.setDay()
    },
    methods: {
      confirm() {
        const start = {
          date: this.dayjs(`${this.startYear}/${this.startMonth}/${this.startDay}`).format("YYYY-MM-DD"),
          year: this.startYear,
          month: this.startMonth,
          day: this.startDay
        }
        const end = {
          date: this.dayjs(`${this.endYear}/${this.endMonth}/${this.endDay}`).format("YYYY-MM-DD"),
          year: this.endYear,
          month: this.endMonth,
          day: this.endDay
        }
        this.$emit('confirm', {
          start,
          end
        })
        this.hide()
      },
      open() {
        this.show = true
      },
      hide() {
        this.show = false
      },
      // 查找休息日
      async getGrayDay() {
        const url = `/health/select/srvhealth_service_person_reserve_schedule_select`
        const req = {
          "serviceName": "srvhealth_service_person_reserve_schedule_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "service_no",
              "ruleType": "eq",
              "value": this.serviceNo
            },
            {
              "colName": "end_date",
              "ruleType": "gt",
              "value": this.dayjs().subtract(1, 'day').format("YYYY-MM-DD")
            },
            {
              "colName": "end_date",
              "ruleType": "lt",
              "value": this.dayjs().add(30, 'day').format("YYYY-MM-DD")
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 60
          },
        }
        const res = await this.$http.post(url, req)
        let grayDays = []
        if (res?.data?.state === 'SUCCESS') {
          let dates = res.data.data.map(item => {
            let {
              start_date,
              end_date
            } = item
            if (start_date && end_date) {
              start_date = start_date.replace(/-/g, '/')
              end_date = end_date.replace(/-/g, '/')
            }
            const diffDay = (this.dayjs(end_date) - this.dayjs(start_date)) / 3600 / 24 / 1000
            if (!isNaN(Number(diffDay)) && diffDay > 0) {
              for (let i = 0; i <= diffDay; i++) {
                grayDays.push(this.dayjs(start_date).add(i, 'day').format("YYYY/MM/DD"))
              }
            }
            this.grayDays = grayDays
          })
        }
        return grayDays
      },

      // 查找已预约日期
      async getRedDay() {
        const url = `/health/select/srvhealth_store_order_select`
        const req = {
          "serviceName": "srvhealth_store_order_select",
          "colNames": ["*"],
          "condition": [{
              "colName": 'order_type',
              "ruleType": "eq",
              "value": '服务'
            },
            {
              "colName": "service_people_no",
              "ruleType": "eq",
              "value": this.serviceNo
            },
            {
              "colName": "reserve_start_date",
              "ruleType": "gt",
              "value": this.dayjs().subtract(1, 'day').format("YYYY-MM-DD")
            },
            {
              "colName": "reserve_end_date",
              "ruleType": "lt",
              "value": this.dayjs().add(60, 'day').format("YYYY-MM-DD")
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 60
          },
        }
        const res = await this.$http.post(url, req)
        let redDays = []
        if (res?.data?.state === 'SUCCESS') {
          let dates = res.data.data.map(item => {
            let {
              reserve_start_date,
              reserve_end_date
            } = item
            if (reserve_start_date && reserve_end_date) {
              reserve_start_date = reserve_start_date.replace(/-/g, '/')
              reserve_end_date = reserve_end_date.replace(/-/g, '/')
            }
            const diffDay = (this.dayjs(reserve_end_date) - this.dayjs(reserve_start_date)) / 3600 / 24 / 1000
            if (!isNaN(Number(diffDay)) && diffDay > 0) {
              for (let i = 0; i <= diffDay; i++) {
                redDays.push(this.dayjs(reserve_start_date).add(i, 'day').format("YYYY/MM/DD"))
              }
            }
            this.redDays = redDays
          })
        }
        return redDays
      },

      // 
      /**
       * 设置当前年月日
       */
      setNow() {
        let date = new Date();
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.day = date.getDate();
      },
      /**
       * 设置日历天,当前月分和后两个月
       */
      setDay() {
        //将日历增加3个月
        for (var j = 0; j < 3; j++) {
          let y = this.getNextNDate(this.year, this.month, j);
          let date = new Date(y.year, y.month - 1, 1);
          let date1 = new Date(y.year, y.month, 0);
          //获取当前月第一天是周几，0等于周日
          let oneDay = date.getDay();
          //获取当前月天数
          let monthDay = date1.getDate();
          let dayList = [];
          for (var i = 0; i < oneDay; i++) {
            dayList.push('')
          }
          for (var i = 0; i < monthDay; i++) {
            dayList.push(i + 1)
          }
          this.dayList.push({
            year: y.year,
            month: y.month,
            day: dayList
          })
        }
      },
      /**
       * 获取选中样式
       */
      getClass(year, month, day) {
        if (!year || !month || !day) {
          return '';
        }
        const today = this.dayjs().format("YYYY/MM/DD")
        const _date = this.dayjs(`${year}/${month}/${day}`).format("YYYY/MM/DD")

        let defaultClass = ''
        if (this.dayjs(`${year}/${month}/${day}`) - this.dayjs().add(60, 'day') > 0) {
          defaultClass = 'black-day'
        }
        if (this.dayjs() - this.dayjs(`${year}/${month}/${day}`) >= 0 && today !== _date) {
          defaultClass = 'black-day'
        }
        if (this.greenDays.find(item => this.dayjs(item).format("YYYY/MM/DD") === _date)) {
          defaultClass = 'green-day'
        }
        if (this.grayDays.find(item => this.dayjs(item).format("YYYY/MM/DD") === _date)) {
          defaultClass = 'gray-day'
        }
        if (this.redDays.find(item => this.dayjs(item).format("YYYY/MM/DD") === _date)) {
          defaultClass = 'red-day'
        }

        //只选择了1天
        if (!this.endYear || !this.endMonth || !this.endDay) {
          if (this.startYear == year && this.startMonth == month && this.startDay == day) {
            return 'day-yuan ' + defaultClass
          } else {
            return ' ' + defaultClass;
          }
        } else {
          //选择了多天
          let startTime = new Date(this.startYear, this.startMonth - 1, this.startDay).getTime()
          let endTime = new Date(this.endYear, this.endMonth - 1, this.endDay).getTime()
          let nowTime = new Date(year, month - 1, day).getTime();
          if (startTime == nowTime) {
            return 'day-left ' + defaultClass;
          } else if (endTime == nowTime) {
            return 'day-right ' + defaultClass;
          } else if (startTime < nowTime && endTime > nowTime) {
            return 'day-none ' + defaultClass
          } else {
            return defaultClass
          }
        }
      },
      selDay(year, month, day) {
        if (!this.startYear || !this.startMonth || !this.startDay) {
          this.startYear = year;
          this.startMonth = month;
          this.startDay = day;
        } else if (!this.endYear || !this.endMonth || !this.endDay) {
          let startTime = new Date(this.startYear, this.startMonth - 1, this.startDay).getTime()
          let endTime = new Date(year, month - 1, day).getTime()
          if (endTime < startTime) {
            uni.showToast({
              title: '不能小于开始时间',
              icon: 'none'
            })
            return;
          }
          if (endTime == startTime) {
            this.startYear = '';
            this.startMonth = '';
            this.startDay = '';
            return;
          }
          this.endYear = year;
          this.endMonth = month;
          this.endDay = day;
          console.log('开始日期：' + this.startYear + '-' + this.startMonth + '-' + this.startDay);
          console.log('结束日期：' + this.endYear + '-' + this.endMonth + '-' + this.endDay);
          console.log('共' + this.allDay + '天');
        } else {
          this.endYear = '';
          this.endMonth = '';
          this.endDay = '';
          this.startYear = year;
          this.startMonth = month;
          this.startDay = day;
        }
      },
      /**
       * 滚动到底
       */
      scrollTolower() {
        let y = this.getNextNDate(this.year, this.month, 3);
        this.year = y.year;
        this.month = y.month;
        this.setDay()
      },
      /**
       * 计算天数
       */
      countDays(startTime, endTime) {
        return parseInt((endTime.getTime() - startTime.getTime()) / 24 / 60 / 60 / 1000)
      },
      /**
       * 获取year,month后n天的日期
       */
      getNextNDate(year, month, n) {
        let m = 0;
        if (n > 12) {
          m = parseInt(n / 12);
          year += m;
        }
        let mm = n - m * 12;
        if (month + mm > 12) {
          year += 1;
          month = month + mm - 12;
        } else {
          month += mm;
        }
        return {
          year: year,
          month: month
        }
      }
    },

  }
</script>

<style lang="scss" scoped>
  $main-color: #39B54A;
  $disabled-color:#ccc;

  .weeks {
    width: 100%;
    height: 30px;
    line-height: 30px;
    // height: 24px;
    // line-height: 24px;
    display: flex;
    justify-content: space-around;
    border-top: 2rpx solid #EBEBEB;
    border-bottom: 2rpx solid #EBEBEB;
    font-size: 22rpx;
    font-weight: 400;
    color: #666666;
    // position: fixed;
    top: var(--window-top);
    background: #FFFFFF;
    z-index: 9;
  }

  .calendar {
    border-bottom: 16rpx solid #F7F7F7;
    padding-bottom: 40rpx;
  }

  .calendar:nth-last-child(1) {
    border: none;
  }

  .year-month {
    height: 40rpx;
    font-size: 28rpx;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #000000;
    line-height: 40rpx;
    text-align: center;
    margin-top: 20rpx;
  }

  .days {
    display: flex;
    flex-wrap: wrap;
  }

  .day {

    text-align: center;
    // margin-top: 2rpx;
    position: relative;
    background-color: #F7F7F7;

    &.black-day {
      // 过去的日期
      border: 1px solid #fff;
      background-color: #F1F1F1;
      pointer-events: none;
      opacity: 0.5;
      // .dd{
      //   color: #F1F1F1;
      // }
    }

    &.gray-day {
      // 休息日
      border: 1px solid #fff;
      pointer-events: none;
      background-color: #ccc;
      position: relative;

      &::after {
        position: absolute;
        bottom: 0;
        content: '休息';
        right: 0;
        font-size: 12px;
        color: #f1f1f1;
        transform: scale(0.8);
      }
    }

    &.red-day {
      // 已约
      border: 1px solid #fff;
      pointer-events: none;
      background-color: #E54D42;
      position: relative;
      .dd {
        color: #fff;
      }
      &::after {
        position: absolute;
        bottom: 0;
        content: '已约';
        right: 0;
        font-size: 12px;
        color: #f1f1f1;
        transform: scale(0.8);
      }
    }

    &.green-day {
      border: 1px solid #fff;
      background-color: #D7F0DB;
      position: relative;

      &::after {
        position: absolute;
        bottom: 0;
        // content: '';
        font-size: 12px;
        color: #fff;
        transform: scale(0.8);
      }

      .dd {
        color: $main-color;
      }

      &.day-yuan {
        border-radius: 100%;
        background: $main-color;
        border: 1px solid $main-color;

        .dd {
          color: #fff;
        }
      }

      &.day-none {
        border-top: 1px solid $main-color;
        border-bottom: 1px solid $main-color;
        background-color: #fff;
      }

      &.day-left {
        &::after {
          content: '开始';
          right: 0;
        }
      }

      &.day-right {
        &::after {
          content: '结束';
          left: 0;
        }
      }

      &.day-left,
      &.day-right {
        background-color: $main-color;
        border: 1px solid $main-color;

        .dd {
          color: #fff;
        }
      }
    }

    &.day-none {
      // border-color: #2979FF;
    }
  }



  .day-yuan,
  .day-left,
  .day-right {
    .dd {
      color: #fff
    }
  }

  .col-fff {
    color: #fff !important;
  }

  .col-333 {
    color: #333 !important;
  }

  .col-999 {
    color: #999999 !important;
  }

  .day-left {
    border-radius: 100% 0 0 100%;
    background: $main-color;
  }


  .day-right {
    border-radius: 0 100% 100% 0;
    background: $main-color;
  }

  .day-none {
    background: #E3EEFF;

    .dd {
      color: $main-color;
    }
  }

  .dd {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 34rpx;
    font-family: DINAlternate-Bold, DINAlternate;
    font-weight: bold;
    color: #333333;
  }

  .cu-modal {
    display: block;
  }
</style>
