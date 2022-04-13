<template>
  <view v-if="data">
    <view class="date-view">
      <view class="">
        {{dayjs().format("MM-DD")}} (今天)
      </view>
    </view>
    <view class="number-view">
      <view class="title">
        <view class="left">
          <view>营业额</view>
          <view class="amount">
            ￥{{data.yi_order_amount||'0'}}
          </view>
        </view>
        <view class="right">
          <view>昨日环比</view>
          <view class="amount">
            0%
          </view>
        </view>
      </view>
      <view class="number-box">
        <view class="number-item">
          <view class="item-lable">
            交易笔数
          </view>
          <view class="item-value">
            {{data.order_num||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            实收笔数
          </view>
          <view class="item-value">
            {{data.yi_order_num||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            未支付笔数/金额
          </view>
          <view class="item-value">
            {{data.wei_order_num||'0'}} / {{data.wei_order_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            退款金额/笔数
          </view>
          <view class="item-value">
            {{data.return_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            手续费
          </view>
          <view class="item-value">
            {{data.poundage_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            结算金额
          </view>
          <view class="item-value">
            {{data.order_amount||'0'}}
          </view>
        </view>
      </view>
    </view>
    <view class="number-view">
      <view class="title">
        <view class="left">
          微信支付
        </view>
      </view>
      <view class="number-box">
        <view class="number-item">
          <view class="item-lable">
            支付金额/笔数
          </view>
          <view class="item-value">
            {{data.yi_order_amount||'0'}} / {{data.yi_order_num||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            退款金额
          </view>
          <view class="item-value">
            {{data.return_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            净支付金额
          </view>
          <view class="item-value">
            {{data.yi_order_amount||'0'}}

          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            优惠金额
          </view>
          <view class="item-value">
            {{data.preferential_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            手续费
          </view>
          <view class="item-value">
            {{data.poundage_amount||'0'}}
          </view>
        </view>
        <view class="number-item">
          <view class="item-lable">
            结算金额
          </view>
          <view class="item-value">
            {{data.yi_order_amount||'0'}}
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
        data: null
      }
    },
    onLoad() {
      this.getData()
    },
    methods: {
      async getData() {
        const service = 'srvhealth_store_order_report_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeInfo?.store_no
          }]
        }
        const res = await this.$fetch('select', service, req, 'health')
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.data = res.data[0]
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
      .left{
        text-align:center;
        .amount{
          color: #1c93ff;
          line-height: 40px;
          font-size:25px;
        }
      }
      .right{
        text-align:center;
        color: #00ad19;
        .amount{
          line-height: 40px;
          font-size:25px;
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
