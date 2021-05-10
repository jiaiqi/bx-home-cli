<template>
  <div class="device-data">
    <u-tabs
      :list="userList"
      :is-scroll="false"
      :current="currentTab"
      @change="changeTab"
    ></u-tabs>

    <view
      class="last-data-box"
      v-if="isArray(deviceData) && deviceData.length > 0"
    >
      <view class="record-title text-bold">最新数据</view>
      <view class="record-data">
        <view
          class="last-data"
          v-if="isArray(deviceData) && deviceData.length > 0"
        >
          <text class="digital">
            <text>
              <text
                :class="{
                  'text-green': deviceData[0].sys < 120,
                  'text-yellow':
                    deviceData[0].sys >= 120 && deviceData[0].sys < 140,
                  'text-red': deviceData[0].sys >= 140,
                }"
              >
                {{ getFixedNum(deviceData[0].sys) }}
              </text>
              <text class="text-gray">/</text>
              <text
                :class="{
                  'text-green': deviceData[0].dia < 80,
                  'text-yellow':
                    deviceData[0].dia < 90 && deviceData[0].dia >= 80,
                  'text-red': deviceData[0].dia >= 90,
                }"
              >
                {{ getFixedNum(deviceData[0].dia) }}
              </text>
            </text>
          </text>
          <text class="unit">毫米汞柱</text>
        </view>
        <view class="date" v-if="isArray(deviceData) && deviceData.length > 0">
          <text class="cuIcon-time margin-right-xs"></text>
          {{ deviceData[0].create_time.slice(0, 16) }}
        </view>
        <view
          class="chart-content"
          v-if="isArray(deviceData) && deviceData.length > 0"
        >
          <uniEcCharts
            class="uni-ec-charts"
            id="uni-ec-charts"
            :ec="BPChartOption"
          ></uniEcCharts>
        </view>
        <!-- customer_no:患者编号,有患者编号时意味着是医生账号从患者列表进入此页面,则没有记录数据的权限 -->
        <!-- <button
          class="nav-button"
          @click="toPages(pageType)"
          v-if="!this.customer_no"
        >
          记录数据
        </button> -->
      </view>
    </view>

    <view class="history-record" v-if="deviceData && deviceData.length > 0">
      <view class="title">历史数据</view>

      <view class="list-box cu-list">
        <view
          class="cu-item list-item"
          @tap="updateItem(item)"
          v-for="(item, index) in deviceData"
          :key="index"
        >
          <image :src="require('./xueya.png')" class="icon"></image>
          <view class="content">
            <view class="item">
              <text
                class="digital"
                :class="{
                  'text-green': item.sys < 120,
                  'text-yellow': item.sys >= 120 && item.sys < 140,
                  'text-red': item.sys >= 140,
                }"
                v-if="item && item.sys"
              >
                {{ item.sys ? getFixedNum(item.sys) : "-" }}
              </text>
            </view>
            <view class="item" v-if="item && item.dia">
              <text class="text-gray">/</text>
              <text
                :class="{
                  'text-green': item.dia < 80,
                  'text-yellow': item.dia < 90 && item.dia >= 80,
                  'text-red': item.dia >= 90,
                }"
                class="digital bp"
              >
                {{ item.dia ? getFixedNum(item.dia) : "-" }}
              </text>
            </view>
            <view class="unit">
              <text>mmHg</text>
            </view>
            <view class="heart_rate" v-if="item.pul">
              <view class="data">
                <text
                  class="label cuIcon-likefill text-red margin-right-xs"
                ></text>
                <text class="value">{{ item.pul || "-" }}次/分</text>
              </view>
            </view>
          </view>
          <view class="action">
            <text class="cu-tag text-grey sm">{{
              item.create_time.slice(10, 16)
            }}</text>
            <text class="cu-tag bg-grey sm">
              <text
                v-if="item.create_time.slice(0, 3) !== new Date().getFullYear()"
              ></text>
              {{ getDate(item.create_time) }}
            </text>
          </view>
          <!-- <view class="move">
            <view class="bg-red" @click.stop="deleteItem(item)">删除</view>
          </view> -->
        </view>
      </view>
    </view>
    <view v-else style="margin-top: 20vh">
      <u-empty mode="history" text="没有历史数据"></u-empty>
    </view>
  </div>
</template>

<script>
import uniEcCharts from '@/components/uni-ec-canvas/uni-echart.vue'
import dayjs from '@/static/js/dayjs.min.js'

import { mapState } from 'vuex'

export default {
  components: { uniEcCharts },
  computed: {
    ...mapState({
      vuex_userInfo: state => state.user.userInfo,
      vuex_isLogin: state => state.app.isLogin,
      vuex_loginUserInfo: state => state.user.loginUserInfo
    }),
  },
  data () {
    return {
      ud_no: "",
      currentTab: 0,
      deviceInfo: {},
      userList: [],
      currentUser: {},
      dic_device_id: '',
      deviceData: [],
      BPChartOption: { option: {} }
    }
  },
  methods: {
    changeTab (index) {
      this.currentTab = index
      if (this.currentTab < this.userList.length) {
        this.currentUser = this.userList[ this.currentTab ]
        this.getData()
      }
    },
    async getDeviceInfo () {
      const req = {
        "serviceName": "srvhealth_store_user_device_select", "colNames": [ "*" ],
        "condition": [ {
          "colName": "ud_no",
          ruleType: 'eq',
          value: this.ud_no
        } ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      const res = await this.$fetch('select', 'srvhealth_store_user_device_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.deviceInfo = res.data[ 0 ]
        this.getUserList()
      }
    },
    async getUserList () {
      const req = {
        "serviceName": "srvhealth_store_user_device_user_select",
        "colNames": [ "*" ],
        "condition": [ { "colName": "ud_no", "ruleType": "eq", "value": this.ud_no } ],
        "page": { "pageNo": 1, "rownumber": 5 }
      }
      const res = await this.$fetch('select', 'srvhealth_store_user_device_user_select', req, 'health')
      if (res.success) {
        this.userList = res.data.map(item => {
          item.name = item.user_name
          return item
        })
        if (this.currentTab < res.data.length) {
          this.currentUser = res.data[ this.currentTab ]
          this.getData()
        }

      }
    },

    updateItem (e) {

    },
    getDate (e) {
      if (new Date(e).getFullYear() !== new Date().getFullYear()) {
        return e.slice(0, 10)
      } else {
        return e.slice(5, 10)
      }
    },
    getFixedNum (num) {
      if (num) {
        return num.toFixed(1)
      } else {
        return 0
      }
    },

    async getData () {
      // 血压
      if (this.deviceInfo.record_table) {
        const req = {
          "serviceName": this.deviceInfo.record_table.replace('bx', 'srv') + '_select',
          "colNames": [ "*" ],
          "order": [ { colName: "measure_time", orderType: "desc" } ],
          "condition": [
            { "colName": "serial_number", "ruleType": "eq", "value": this.deviceInfo.serial_number },
            { "colName": this.deviceInfo.user_id_col || "user", "ruleType": "eq", value: this.currentUser.dev_user_index }
          ],
          "page": { "pageNo": 1, "rownumber": 10 }
        }
        if (this.deviceInfo.serial_number && this.currentUser.dev_user_index) {
          const res = await this.$fetch('select', 'srviot_ap_user_bp_data_select', req, 'iot')
          if (Array.isArray(res.data)) {
            this.deviceData = res.data
            this.buildBPOption(res.data)
          }
        }
      }
    },
    buildBPOption (data) {
      data = this.deepClone(data)
      const yAxisData0 = data.map(item => 80) // 舒张压-正常
      const yAxisData01 = data.map(item => 90) // 舒张压-高
      const yAxisData02 = data.map(item => 120) // 收缩压-正常
      const yAxisData1 = data.map(item => 140) // 收缩压-高
      const yAxisData2 = data.map(item => item.dia) //舒张压
      const yAxisData3 = data.map(item => item.sys) //收缩压
      const xAxisData = data.map(item => dayjs(item.measure_time).format('MM-DD'))
      let max = data.map(item => item.sys).sort((a, b) => b - a)[ 0 ] + 2
      let min = data.map(item => item.dia).sort((a, b) => a - b)[ 0 ] - 2
      const color = [ '#40c0fd', '#9900FF', '#FAD650', '#F7B235' ]
      let option = {
        backgroundColor: '#fff',
        legend: {
          show: true,
          top: '5%',
          // icon: 'roundRect',
          icon:
            'path://M1635.315872 398.277883a510.609754 510.609754 0 0 0-996.200768 0H0v227.443097h639.115104a510.609754 510.609754 0 0 0 996.200768 0H2274.430976v-227.443097zM1137.215488 910.024852a398.025421 398.025421 0 1 1 398.025421-398.025421A398.025421 398.025421 0 0 1 1137.215488 910.024852z',
          itemWidth: 20,
          itemHeight: 10,
          itemGap: 10,
          data: [
            {
              name: '舒张压-正常',
              icon: 'path://M0 1024V0h3072v1024H0z m4096 0V0h3072v1024H4096z m8192 0V0h3072v1024h-3072z m-4096 0V0h3072v1024H8192z'
            },
            {
              name: '舒张压-高',
              icon: 'path://M0 1024V0h3072v1024H0z m4096 0V0h3072v1024H4096z m8192 0V0h3072v1024h-3072z m-4096 0V0h3072v1024H8192z'
            },
            {
              name: '收缩压-高',
              icon: 'path://M0 1024V0h3072v1024H0z m4096 0V0h3072v1024H4096z m8192 0V0h3072v1024h-3072z m-4096 0V0h3072v1024H8192z'
            },
            {
              name: '收缩压-正常',
              icon: 'path://M0 1024V0h3072v1024H0z m4096 0V0h3072v1024H4096z m8192 0V0h3072v1024h-3072z m-4096 0V0h3072v1024H8192z'
            },
            {
              name: '舒张压',
              // icon:'circle',
              icon:
                'path://M1635.315872 398.277883a510.609754 510.609754 0 0 0-996.200768 0H0v227.443097h639.115104a510.609754 510.609754 0 0 0 996.200768 0H2274.430976v-227.443097zM1137.215488 910.024852a398.025421 398.025421 0 1 1 398.025421-398.025421A398.025421 398.025421 0 0 1 1137.215488 910.024852z'
            },
            {
              name: '收缩压',
              // icon:'circle',
              icon:
                'path://M1635.315872 398.277883a510.609754 510.609754 0 0 0-996.200768 0H0v227.443097h639.115104a510.609754 510.609754 0 0 0 996.200768 0H2274.430976v-227.443097zM1137.215488 910.024852a398.025421 398.025421 0 1 1 398.025421-398.025421A398.025421 398.025421 0 0 1 1137.215488 910.024852z'
            }
          ]
        },
        grid: {
          top: '30%',
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLine: {
            // y轴
            show: true
          },
          axisTick: {
            show: true
          },
          boundaryGap: true //false时X轴从0开始
        },
        yAxis: {
          type: 'value',
          axisLine: {
            // y轴
            show: true
          },
          axisTick: {
            // y轴刻度线
            show: true
          },
          splitLine: {
            show: false
          },
          max: max,
          min: min
        },
        series: [
          {
            name: '舒张压-正常',
            type: 'line',
            symbol: 'none',
            data: yAxisData0,
            smooth: true,
            lineStyle: {
              type: 'dashed',
              width: 1
            },
            itemStyle: {
              normal: {
                color: color[ 0 ],
                borderColor: color[ 0 ]
              }
            }
          },
          {
            name: '舒张压-高',
            type: 'line',
            symbol: 'none',
            data: yAxisData01,
            smooth: true,
            lineStyle: {
              width: 1,
              type: 'dashed'
            },
            itemStyle: {
              normal: {
                color: color[ 3 ],
                borderColor: color[ 3 ]
              }
            }
          },
          {
            name: '收缩压-高',
            type: 'line',
            symbol: 'none',
            data: yAxisData1,
            smooth: true,
            lineStyle: {
              type: 'dashed',
              width: 1
            },
            itemStyle: {
              normal: {
                color: color[ 3 ],
                borderColor: color[ 3 ]
              }
            }
          },
          {
            name: '收缩压-正常',
            type: 'line',
            symbol: 'none',
            data: yAxisData02,
            smooth: true,
            lineStyle: {
              type: 'dashed',
              width: 1
            },
            itemStyle: {
              normal: {
                color: color[ 0 ],
                borderColor: color[ 0 ]
              }
            }
          },
          {
            name: '舒张压',
            type: 'line',
            data: yAxisData2,
            symbol: 'none',
            smooth: false,
            tooltip: { trigger: 'axis' },
            itemStyle: {
              normal: {
                color: color[ 1 ],
                borderColor: color[ 1 ]
              }
            }
          },
          {
            name: '收缩压',
            type: 'line',
            data: yAxisData3,
            symbol: 'none',
            smooth: false,
            tooltip: { trigger: 'axis' },
            itemStyle: {
              normal: {
                color: color[ 2 ],
                borderColor: color[ 2 ]
              }
            }
          }
        ]
      }
      this.BPChartOption = { option }
    },
  },

  // 页面周期函数--监听页面加载
  onLoad (option) {
    // if (option.dic_device_id) {
    //   this.dic_device_id = option.dic_device_id
    // }
    if (option.ud_no) {
      this.ud_no = option.ud_no
      this.getDeviceInfo()
    }
    // this.getData()
  },
  // 页面周期函数--监听页面初次渲染完成

};
</script>

<style scoped lang="scss">
.chart-content {
  width: 100%;
  height: 400rpx;
  .uni-ec-charts {
    width: 100%;
    height: 100%;
  }
}

.last-data-box {
  margin: 20rpx auto;
  width: calc(100% - 40rpx);
  .record-title {
    text-align: center;
    padding: 20rpx 0;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
  }
  .record-data {
    background-color: #fff;
    display: flex;
    align-items: center;
    flex-direction: column;
    font-weight: normal;
    min-height: 200rpx;
    padding: 0 20rpx 40rpx;
    flex: 1;
    justify-content: flex-end;
    border-radius: 0 0 20rpx 20rpx;
    .last-data {
      padding: 0 0 10rpx;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      .digital {
        font-size: 60rpx;
        font-weight: 700;
        color: #0081ff;
      }
      .unit {
        font-size: 30rpx;
        color: #66abff;
        margin-left: 10rpx;
      }
    }
    .date {
      color: #999;
      fons: 24rpx;
    }
  }
  .nav-button {
    background-color: #0bc99d;
    color: #fff;
    border-radius: 50rpx;
    margin-top: 50rpx;
    width: 200rpx;
    height: 50rpx;
    line-height: 50rpx;
    font-size: 28rpx;
  }
  .bmi-box {
    width: 100%;
    display: flex;
    padding: 40rpx 20rpx;
    background-color: #fff;
    margin: 20rpx 0;
    border-radius: 20rpx;
    .bmi-box-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      margin: 20rpx 0;
      height: 100rpx;
      .title {
        color: #999;
        font-size: 24rpx;
        font-weight: normal;
      }
      .digit {
        color: #333;
        font-weight: 700;
        font-size: 30rpx;
        &.bmi {
          font-size: 60rpx;
        }
      }
    }
    .bmi-bar-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      text-align: center;
      justify-content: center;
      align-items: center;
      font-weight: normal;
      .last-data {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        .create-time {
          width: 100%;
        }
        .unit {
          font-size: 32rpx;
          color: #666;
          margin-left: 5rpx;
        }
      }
      .bmi-label {
        display: flex;
        position: relative;
        width: 500rpx;
        height: 40rpx;
        line-height: 40rpx;
        color: #666;
        font-size: 24rpx;
        .label {
          position: absolute;
          left: -80rpx;
        }
        .value {
          flex: 1;
        }
      }
      .bmi-bar {
        padding: 10rpx 0;
        display: flex;
        width: 100%;
        justify-content: center;
        .bar-box {
          width: 150rpx;
          position: relative;
          margin-top: 10rpx;
          .scale {
            position: absolute;
            top: -25px;
            font-size: 50rpx;
            left: 0;
            transition: left 2s ease;
            // font-weight: bold;
            .bmi-tip {
              right: 0px;
              top: -12px;
              font-size: 14px;
              // position: absolute;
            }
          }
          .bar {
            height: 30px;
            line-height: 30px;
            color: #f1f1f1;
          }
        }
        .bar1 {
          margin-right: 4rpx;
          .bar {
            background-color: #40c0fd;
            border-top-left-radius: 50rpx;
            border-bottom-left-radius: 50rpx;
          }
          .active-label {
            background-color: #40c0fd;
          }
        }
        .bar2 {
          margin-right: 4rpx;
          .bar {
            background-color: #4acdba;
          }
          .active-label {
            background-color: #4acdba;
          }
        }
        .bar3 {
          margin-right: 4rpx;
          .bar {
            background-color: #fad650;
          }
          .active-label {
            background-color: #fad650;
          }
        }
        .bar4 {
          .bar {
            background-color: #f7b235;
            border-top-right-radius: 50rpx;
            border-bottom-right-radius: 50rpx;
          }
          .active-label {
            background-color: #f7b235;
          }
        }
      }
    }
  }
  .data-chart {
    height: 400rpx;
    margin-top: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
  }
  .history-record {
    margin-top: 20rpx;
    background-color: #fff;
    border-radius: 20rpx;
    .title {
      padding: 20rpx;
      border-bottom: 1px solid #f1f1f1;
    }
    .list-box {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .list-item {
        padding: 20rpx 0;
        display: flex;
        justify-content: space-around;
        border-bottom: 1rpx solid #f1f1f1;
        align-items: center;
        padding: 20rpx;
        .content {
          display: flex;
          flex: 1;
          align-items: center;
        }
        .heart_rate {
          padding: 0 20rpx;
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: flex-end;
          .data {
            font-size: 26rpx;
            width: 140rpx;
          }
        }
        .action {
          display: flex;
          flex-direction: column;
          border-radius: 10rpx;
          overflow: hidden;
          // width: 150rpx;
          .cu-tag {
            margin-left: 0;
            display: flex;
            justify-content: flex-end;
          }
        }
        .icon {
          width: 50rpx;
          height: 50rpx;
          margin-right: 20rpx;
        }
        .item {
          text-align: center;
          &:last-child {
            flex: 1;
            text-align: right;
            font-weight: normal;
            color: #999;
          }
          .label {
            font-size: 28rpx;
            margin: 10rpx;
          }
          .digital {
            font-size: 40rpx;
          }
        }
        .label {
          font-weight: normal;
          font-size: 24rpx;
        }
      }
    }
  }
}

.history-record {
  margin-top: 20rpx;
  background-color: #fff;
  border-radius: 20rpx;
  .title {
    padding: 20rpx;
    border-bottom: 1px solid #f1f1f1;
  }
  .list-box {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .list-item {
      padding: 20rpx 0;
      display: flex;
      justify-content: space-around;
      border-bottom: 1rpx solid #f1f1f1;
      align-items: center;
      padding: 20rpx;
      .content {
        display: flex;
        flex: 1;
        align-items: center;
      }
      .heart_rate {
        padding: 0 20rpx;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: flex-end;
        .data {
          font-size: 26rpx;
          width: 140rpx;
        }
      }
      .action {
        display: flex;
        flex-direction: column;
        border-radius: 10rpx;
        overflow: hidden;
        // width: 150rpx;
        .cu-tag {
          margin-left: 0;
          display: flex;
          justify-content: flex-end;
        }
      }
      .icon {
        width: 50rpx;
        height: 50rpx;
        margin-right: 20rpx;
      }
      .item {
        text-align: center;
        &:last-child {
          flex: 1;
          text-align: right;
          font-weight: normal;
          color: #999;
        }
        .label {
          font-size: 28rpx;
          margin: 10rpx;
        }
        .digital {
          font-size: 40rpx;
        }
      }
      .label {
        font-weight: normal;
        font-size: 24rpx;
      }
    }
  }
}
</style>
