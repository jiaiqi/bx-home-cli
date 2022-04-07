<template>
  <view class="coupon-list">
    <bx-coupon :cfg="cfg" :data="item" v-for="(item,index) in couponList" :key="index"></bx-coupon>
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
    computed:{
      tempNo(){
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
        this.getCouponCfg()
        this.getCouponList()
      }
    },
    methods: {
      async getCouponList() {
        const req = {
          "serviceName": "srvhealth_store_coupons_select",
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
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        let condition = this.pageItem?.more_config?.condition;
        if(Array.isArray(condition) && condition.length>0){
          req.condition = [...req.condition,...condition]
        }
        let res = await this.$fetch('select', 'srvhealth_store_coupons_select', req, 'health');
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
  }
</style>
