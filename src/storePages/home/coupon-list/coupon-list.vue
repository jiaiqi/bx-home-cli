<template>
  <view class="coupon-list">
    <bx-coupon :cfg="item" :data="item" v-for="(item,index) in couponList" :key="index" @on-btn="onBtn"></bx-coupon>
  </view>
</template>

<script>
  export default {
    // 卡券列表
    name: "coupon-list",
    props: {
      pageItem: {
        type: Object
      }
    },
    computed: {
      tempNo() {
        return this.pageItem?.more_config?.template_no
      },
    },
    data() {
      return {
        cfg: null,
        couponList: []
      }
    },
    created() {
      if (this.tempNo) {
        // this.getCouponCfg()
        this.getCouponList()
      }
    },
    methods: {
      onBtn(e) {
        // this.$emit(e)
        if (e.receive_status === '未领取') {
          // 领取
          this.getCoupon(e)
        } else {
          // 使用
        }
      },
      async getCoupon(e) {
        // 领取优惠券
        if (!e) {
          return
        }
        const req = [{
          "serviceName": "srvhealth_store_user_coupons_add",
          "condition": [],
          "data": [{
            store_user_no: this.vstoreUser?.store_user_no,
            "user_no": this.userInfo?.userno,
            "person_name": this.userInfo?.name,
            coupon_no: e.coupon_no,
            "coupon_title": e.coupon_title,
            "coupon_status": "未使用"
          }]
        }]
        let res = await this.$fetch('operate', 'srvhealth_store_user_coupons_add', req, 'health');
        if (res.success) {
          uni.showToast({
            title: '领取成功',
            icon: 'none',
            mask: true
          })
          this.getCouponList()
        } else {
          uni.showToast({
            title: '领取失败,请重试',
            icon: 'none'
          })
        }
      },
      async getCouponList() {
        const req = {
          "serviceName": "srvhealth_store_coupons_user_select",
          "colNames": ["*"],
          "condition": [{
              colName: 'template_no',
              ruleType: 'eq',
              value: this.tempNo
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            },
            {
              colName: 'store_user_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_user_no
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        let condition = this.pageItem?.more_config?.condition;
        if (Array.isArray(condition) && condition.length > 0) {
          req.condition = [...req.condition, ...condition]
        }
        let res = await this.$fetch('select', 'srvhealth_store_coupons_user_select', req, 'health');
        if (Array.isArray(res.data)) {
          this.couponList = res.data
        }
      },
      async getCouponCfg() {
        let req = {
          "serviceName": "srvhealth_store_coupons_template_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'template_no',
            ruleType: 'eq',
            value: this.tempNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        let res = await this.$fetch('select', 'srvhealth_store_coupons_template_select', req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.cfg = res.data[0]
        }
      }
    },
  }
</script>

<style scoped>
  .coupon-list {
    width: 100%;
    overflow-x: scroll;
    display: flex;
  }
</style>
