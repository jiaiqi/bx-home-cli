<template>
  <view class="page-wrap">
    <view class="child-list">
      <view class="child-item" v-for="item in childService" @click="toDetail(item)">
        <view class="title" v-if="item&&item.foreign_key&&item.foreign_key.section_name">
          {{item.foreign_key.section_name}}
        </view>
        <view class="title" v-else-if="item&&item.service_view_name">
          {{item.service_view_name}}
        </view>
        <view class="right">
          <button class="cu-btn sm bg-green round margin-right-xs">查看 <text class="cuIcon-right"></text></button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        sr_no: "",
        childService: []
      }
    },
    methods: {
      toDetail(e) {
        let service = e?.service_name
        const url =
          `/personalPages/healthReportDetail/healthReportDetail?sr_no=${this.sr_no}&service=${service}&fk=${e.foreign_key?JSON.stringify(e.foreign_key):''}`;

        uni.navigateTo({
          url
        })
      },
      async getChildList() {
        const url =
          '/health/select/srvsys_service_columnex_v2_select?colsel_v2=srvhealth_store_customer_serve_record_select'
        const req = {
          "serviceName": "srvsys_service_columnex_v2_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_name",
            "value": "srvhealth_store_customer_serve_record_select",
            "ruleType": "eq"
          }, {
            "colName": "use_type",
            "value": "detail",
            "ruleType": "eq"
          }],
          "order": [{
            "colName": "seq",
            "orderType": "asc"
          }],
        }
        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          let childService = res?.data?.data?.child_service || []
          // childService = childService.filter(item => !item.table_type)
          this.childService = childService.filter(item => item.main_table !==
            'bxhealth_store_report_important_indicator' && item.service_name !==
            'srvhealth_store_report_important_indicator_select')
          // this.childService = res?.data?.data?.child_service.filter(item=>!item.table_type) || []
          return childService
        }
      },
    },
    onLoad(option) {
      if (option.sr_no || option.no) {
        this.sr_no = option.sr_no || option.no
      }
      this.getChildList()
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    min-height: 100vh;
    background: #f8f8f8;
    overflow-y: scroll;
  }

  .child-list {
    padding: 16px;

    .child-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      border-radius: 5px;
      padding: 10px;

      .title {
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: 16px;
      }

      .right {
        color: #888;
      }
    }
  }
</style>
