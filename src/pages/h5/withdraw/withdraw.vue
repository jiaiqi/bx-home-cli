<template>
  <view>
    <view class="text-center margin-tb">
      <image style="width: 100px;height: 100px;" src="/pages/h5/static/icon/withdraw.svg" mode=""></image>
    </view>
    <view class="text-center text-gray">
      可提现余额
    </view>
    <view class="text-bold text-lg text-center padding-tb">
      ￥{{data.total_over_money||'0'}}
    </view>
    <view class="text-center">
      <button class="cu-btn bg-green lg" style="width: 90%;" @click="showModal">提现至微信</button>
    </view>

    <view class="cu-modal" :class="{show:showAdd}">
      <view class="cu-dialog">
        <view class="form-title padding bg-white">
          请输入要提现的金额
        </view>
        <view class="form-modal  flex justify-center padding">
          <view class="form-item bg-white padding-tb-xs border-bottom line-black" style="display: inline-flex;">
            <input type="digit" v-model="withdraw_amount" class="" style="width:280rpx;">
          </view>
        </view>
        <view class="  margin-tb ">
          <button class="cu-btn bg-blue round" style="width: 40%;margin: 0 auto;" @click="toWithdraw">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        data: {},
        showAdd: false,
        form: {

        },
        withdraw_amount: 0,
      }
    },
    methods: {
      showModal() {
        if (!this.data?.total_over_money) {
          uni.showModal({
            title: '提示',
            content: '没有可用提现余额',
            showCancel: false
          })
          return
        }
        this.showAdd = true
      },
      toWithdraw() {
        const service = 'srvhealth_withdraw_add'
        const req = [{
          "serviceName": service,
          "data": [{
            "store_no": this.storeInfo.store_no,
            "person_no": this.vstoreUser?.store_user_no,
            // "person_no": this.userInfo?.no,
            "person_name": this.userInfo?.name || this.userInfo?.nick_name,
            "phone": this.userInfo?.phone || this.userInfo?.phone_xcx,
            "user_account": this.userInfo?.userno,
            "profile_url": this.userInfo?.profile_url,
            "user_image": this.userInfo?.user_image,
            "over_money": this.data.total_over_money,
            "withdraw_type": '微信',
            "wx_mch_id": this.getwxMchId(),
            "app_no": this.$api.appNo?.wxmp,
            "approve_type": "申请",
            "withdraw_amount": this.withdraw_amount,
            "desc":"佣金提成"
          }]
        }]
        const url = `/health/operate/srvhealth_withdraw_add`
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            uni.showModal({
              title: '提示',
              content: '提现申请已提交，管理人员审核通过后即可到账',
              showCancel: false
            })
          }else{
            uni.showModal({
              title: '提示',
              content: res?.data?.resultMessage,
              showCancel: false
            })
          }
          this.showAdd = false
          this.getData()
        })
      },
      getData() {
        const service = 'srvhealth_total_withdraw_select'
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
              "colName": "user_no",
              "value": this.userInfo.userno,
              "ruleType": "eq"
            },
            {
              "colName": "store_no",
              "value": this.storeInfo.store_no,
              "ruleType": "eq"
            }
          ]
        }
        const url = `/health/select/${service}`
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
            this.data = res.data.data[0]
            this.withdraw_amount = this.data.total_over_money
          }
        })
      },
    },
    onLoad() {
      this.getData()
    }
  }
</script>

<style>
  .bg-green {
    background: #11AA66;
  }

  .border-bottom {
    border-bottom: 1px solid #999;
  }
</style>
