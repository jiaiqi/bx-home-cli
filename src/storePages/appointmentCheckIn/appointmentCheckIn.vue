<template>
  <view class="page-wrap">
    <view class="filter-box">
      <view class="filter-item">
        <view class="label">
          预约日期:
          <!-- <text class="text-bold margin-left-sm">{{titleDate}}</text> -->
        </view>
        <date-range-picker style="width: 100%;" :mode="'date'" :isRange="true" @change="bindTimeChange" v-model="date">
        </date-range-picker>
      </view>
    </view>
    <view class="order-item-box" v-for="item in multiUserVaccine">
      <view class="title">
        {{item.vaccine_drug_name||''}}
      </view>
      <view class="order-record-list">
        <view class="order-record-item light"
          :class="{'bg-gray':order.app_state==='待到场','bg-cyan':order.app_state==='完成','bg-grey':order.app_state==='取消','bg-orange':order.app_state==='爽约'}"
          @click="changeState(order)" v-for="order in item.recordList">
          <text>{{order.customer_name||order.person_name||''}}</text>
          <!-- <text>{{order.appTimeStart}}-{{order.appTimeEnd}}</text> -->
          <!-- <text class="state">{{order.app_state}}</text> -->
        </view>
      </view>
    </view>
    <view class="order-item-box" v-for="item in otherVaccineList">
      <view class="title">
        其他-{{item.appoint_name||''}}
      </view>
      <view class="order-record-list">
        <view class="order-record-item light"
          :class="{'bg-gray':order.app_state==='待到场','bg-cyan':order.app_state==='完成','bg-grey':order.app_state==='取消','bg-orange':order.app_state==='爽约'}"
          @click="changeState(order)" v-for="order in item.recordList">
          <text>{{order.customer_name||order.person_name||''}}</text>
          <!-- <text>{{order.appTimeStart}}-{{order.appTimeEnd}}</text> -->
          <!-- <text class="state">{{order.app_state}}</text> -->
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import dayjs from '@/static/js/dayjs.min.js'
  let today = dayjs().format("YYYY-MM-DD")
  export default {
    data() {
      return {
        date: today,
        store_no: {},
        dayOrderData: [],
        orderedMember: [],
        multiUserVaccine: [], //多人份疫苗列表
      }
    },
    watch: {
      titleDate: {
        immediate: true,
        handler: (newValue, oldValue) => {
          if (newValue) {
            uni.setNavigationBarTitle({
              title: newValue
            })
          }

        }
      }
    },
    computed: {
      titleDate() {
        let result = this.date
        if (Array.isArray(this.date)) {
          result = this.date.toString().replace(/,/g, ' - ')
        }
        return result
      },
      otherVaccineList() {
        // 单人份疫苗按天预约记录
        let multiUserVaccine = this.multiUserVaccine.map(item => item.vs_no)
        let list = this.orderedMember.filter(item => !multiUserVaccine.includes(item.svs_no))
        let dayOrderData = this.deepClone(this.dayOrderData)
        for (let index in dayOrderData) {
          let item = dayOrderData[index]
          item.recordList = list.filter(e => {
            if (e.sda_no === item.sda_no) {
              e.appTimeStart = dayjs(e.app_date + ' ' + e.app_time_start).format("HH:mm")
              e.appTimeEnd = dayjs(e.app_date + ' ' + e.app_time_end).format("HH:mm")
              return true
            }
          })
        }
        return dayOrderData
      },
    },
    methods: {
      bindTimeChange(e) {
        let cond = []
        if (Array.isArray(e) && e.length > 0) {
          if (e.length == 2) {
            if (e[0] == e[1]) {
              cond = [{
                colName: 'app_date',
                ruleType: 'eq',
                value: e[0]
              }]
            } else {
              cond = [{
                colName: 'app_date',
                ruleType: 'between',
                value: e
              }]
            }
          }
        }
        // if (Array.isArray(cond) && cond.length > 0) {
        this.getDayOrderData()
        // }
      },
      changeState(e) {
        let self = this
        let arr = ['待到场', '完成', '取消', '爽约']
        arr = arr.filter(a => a !== e.app_state)
        let changeState = (e, state) => {
          let req = [{
            "serviceName": "srvhealth_store_vaccination_appoint_record_result_update",
            "condition": [{
              "colName": "id",
              "ruleType": "eq",
              "value": e.id
            }],
            "data": [{
              "app_state": state
            }]
          }]
          this.$fetch('operate', 'srvhealth_store_vaccination_appoint_record_result_update', req, 'health').then(
            res => {
              if (res.success) {
                uni.showToast({
                  title: '操作成功'
                })
                self.getDayOrderData()
              }
            })
        }
        uni.showActionSheet({
          itemList: arr,
          // itemColor:"#0bc99d",
          success: function(res) {
            console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
            let state = arr[res.tapIndex]
            uni.showModal({
              title: '提示',
              content: `是否将${e.customer_name||e.person_name}的预约状态改为${state}?`,
              success(res) {
                if (res.confirm) {
                  changeState(e, state)
                }
              }
            })
          },
          fail: function(res) {
            console.log(res.errMsg);
          }
        });
      },
      async getOrderedMember() {
        // 查找已预约用户
        let req = {
          "serviceName": "srvhealth_store_vaccination_appoint_record_select",
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": 1,
            "rownumber": 500
          },
          "order": [{
            colName: "create_time",
            orderType: "asc"
          }]
        }
        if (this.date) {
          if (typeof this.date === 'string') {
            req.condition.push({
              colName: 'app_date',
              ruleType: 'eq',
              value: this.date
            })
          } else if (Array.isArray(this.date) && this.date.length == 2) {
            req.condition.push({
              colName: 'app_date',
              ruleType: 'between',
              value: this.date
            })
          }
        }
        if (Array.isArray(this.dayOrderData) && this.dayOrderData.length > 0) {
          let sda_no = this.dayOrderData.map(item => item.sda_no)
          req.condition = [...req.condition, {
            "colName": "sda_no",
            "ruleType": "in",
            "value": sda_no.toString()
          }]
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appoint_record_select', req, 'health')
        if (res.success) {
          this.orderedMember = res.data
        }
        this.getMultiUserVaccine()
      },
      async getMultiUserVaccine() {
        // 查找多人份疫苗
        let req = {
          "serviceName": "srvhealth_store_vaccine_stocks_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.store_no
          }, {
            "colName": "persons_count",
            "ruleType": "gt",
            "value": 1
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        let res = await this.$fetch('select', 'srvhealth_store_vaccine_stocks_select', req, 'health')
        if (res.success) {
          this.multiUserVaccine = res.data.map(item => {
            let list = []
            list = this.orderedMember.filter(e => e.svs_no === item.vs_no)
            item.recordList = list.map(e => {
              e.appTimeStart = dayjs(e.app_date + ' ' + e.app_time_start).format("HH:mm")
              e.appTimeEnd = dayjs(e.app_date + ' ' + e.app_time_end).format("HH:mm")
              return e
            });
            return item
          })
        }
      },
      async getDayOrderData(cond) {
        // 查询某一天的疫苗预约情况
        let req = {
          "serviceName": "srvhealth_store_vaccination_appointment_day_select",
          "colNames": ["*"],
          "condition": [{
            colName: "store_no",
            ruleType: "like",
            value: this.store_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          }
        }
        if (this.date) {
          if (typeof this.date === 'string') {
            req.condition.push({
              colName: 'app_date',
              ruleType: 'eq',
              value: this.date
            })
          } else if (Array.isArray(this.date) && this.date.length == 2) {
            req.condition.push({
              colName: 'app_date',
              ruleType: 'between',
              value: this.date
            })
          }
        }
        // if (Array.isArray(cond) && cond.length > 0) {
        //   req.condition = [...req.condition, ...cond]
        // } else {
        //   req.condition = [...req.condition, {
        //     "colName": "app_date",
        //     "ruleType": "like",
        //     "value": this.date
        //   }]
        // }
        let res = await this.$fetch('select', 'srvhealth_store_vaccination_appointment_day_select', req, 'health')
        if (res.success) {
          this.dayOrderData = res.data
          this.getOrderedMember()
        }
      },
    },
    onLoad(option) {
      if (option.store_no) {
        this.store_no = option.store_no
        this.getDayOrderData()
      }
    }
  }
</script>

<style scoped lang="scss">
  .page-wrap {
    background-color: #fff;
    padding: 20rpx;
    font-family: 苹方-简;

    .filter-box {
      background-color: #FAFBFC;
      padding: 20rpx;
      border-radius: 20rpx;
      margin-bottom: 20rpx;

      .filter-item {
        display: flex;
        align-items: center;

        .date-range-picker {
          flex: 1;
        }

        .label {
          padding: 10rpx;

        }
      }
    }

    .order-item-box {
      margin-bottom: 20rpx;

      .title {
        color: #3ACBC6;
        font-size: 32rpx;
        line-height: 44rpx;
        margin-bottom: 10rpx;
      }

      .order-record-list {
        // background-color: #FAFBFC;
        display: flex;
        flex-wrap: wrap;

        // justify-content: center;
        .order-record-item {
          min-height: 100rpx;
          width: 30%;
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          // background-color: rgba($color: #8EB0FF, $alpha: 0.1);
          margin-right: 20rpx;
          padding: 20rpx;
          margin-bottom: 10rpx;
          position: relative;

          .state {
            font-size: 24rpx;
            // color: #666;
            position: absolute;
            top: 0;
            right: 0;
            transform: scale(0.9);
          }
        }
      }
    }
  }
</style>
