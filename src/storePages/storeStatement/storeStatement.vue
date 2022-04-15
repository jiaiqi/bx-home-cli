<template>
  <view>
    <view class="date-view">
      <view class="">
        <!-- {{dayjs().format("MM-DD")}} (今天) -->
      </view>
      <!--    <view class="date-item" v-for="item in types" :key="item.name">
        {{item.name}}
      </view> -->

      <u-subsection :list="types" mode="subsection" :current="current" @change="changeType"></u-subsection>
    </view>
    <view class="number-view" v-if="curData">
      <view class="title">
        <view class="left">
          <view>
            <text class="cuIcon-titles text-blue"></text>
            营业额
          </view>
          <view class="amount">
            ￥{{curData.yi_order_amount||'0'}}
          </view>
        </view>
        <view class="right">
          <view>昨日环比</view>
          <view class="amount">
            {{curData.bi_order_amount||'0'}}%
          </view>
        </view>
      </view>
      <view class="number-box">
        <view class="number-item">
          <view class="item-lable">
            交易笔数
          </view>
          <view class="item-value">
            {{curData.order_num||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            实收笔数
          </view>
          <view class="item-value">
            {{curData.yi_order_num||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            退款金额
          </view>
          <view class="item-value">
            {{curData.return_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            手续费
          </view>
          <view class="item-value">
            {{curData.poundage_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            优惠金额
          </view>
          <view class="item-value">
            {{curData.preferential_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            昨日营业额
          </view>
          <view class="item-value">
            {{curData.zuo_order_amount||'0'}}
          </view>
        </view>
      </view>
    </view>
    <view class="number-view" v-if="curData">
      <view class="title">
        <view class="left">
          <text class="cuIcon-titles text-blue"></text>
          微信支付
        </view>
      </view>
      <view class="number-box">
        <view class="number-item">
          <view class="item-lable">
            交易笔数
          </view>
          <view class="item-value">
            {{curData.order_num||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            实收笔数
          </view>
          <view class="item-value">
            {{curData.yi_order_num||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            退款金额
          </view>
          <view class="item-value">
            {{curData.return_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            优惠金额
          </view>
          <view class="item-value">
            {{curData.preferential_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            手续费
          </view>
          <view class="item-value">
            {{curData.poundage_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            结算金额
          </view>
          <view class="item-value">
            {{curData.yi_order_amount||'0'}}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        datas: {
          day: null,
          week: null,
          month: null
        },
        types: [{
            type: 'day',
            name: '今天'
          },
          {
            type: 'week',
            name: '本周'
          },
          {
            type: 'month',
            name: '本月'
          }
        ],
        current: 0,
        curType: 'day',
        storeNo: ""
      }
    },
    computed: {
      curData() {
        return this.datas[this.curType]
      }
    },
    onLoad(option) {
      if (option.storeNo) {
        this.storeNo = option.storeNo
      }
      this.getData()
    },
    methods: {
      changeType(index) {
        this.curType = this.types[index]?.type
        this.getData()
      },
      async getData() {
        let type = this.curType
        let serviceMap = {
          day: 'srvhealth_store_order_report_select',
          week: 'srvhealth_store_order_week_report_select',
          month: 'srvhealth_store_order_month_report_select'
        }
        let service = serviceMap[type]
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeNo || this.storeInfo?.store_no
          }]
        }
        if (!service) {
          return
        }
        const res = await this.$fetch('select', service, req, 'health')
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.datas[type] = res.data[0]
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .date-view {
    background-color: #fff;
    padding: 10px;
    font-size: 20px;
    line-height: 30px;
    // display: flex;
    width: 100%;

    .date-item {
      width: 30%;
      margin-right: 10px;
    }
  }

  .number-view {
    background-color: #fff;
    padding: 10px;
    margin-top: 10px;

    .title {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f1f1f1;
      font-size: 18px;
      padding: 10px 0;

      .left {
        text-align: center;

        .amount {
          color: #1c93ff;
          line-height: 40px;
          font-size: 25px;
        }
      }

      .right {
        text-align: center;
        color: #00ad19;

        .amount {
          line-height: 40px;
          font-size: 25px;
        }
      }
    }

    .number-box {
      display: flex;
      flex-wrap: wrap;

      .number-item {
        padding: 10px;
        display: inline-block;
        width: 33.33%;

        .item-lable {
          color: #ccc;
        }

        .item-value {
          color: #1c93ff;
          line-height: 30px;
        }
      }
    }
  }
</style>
