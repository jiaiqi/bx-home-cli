<template>
  <view>
    <view class="title">
      {{data.policy_title||''}}
    </view>
    <view class="sub-title">
      <view class="">

      </view>
      <view class="">

      </view>
    </view>
    <view class="info-card">
      <view class="card-item">
        <view class="">
          申报时间
        </view>
        <view class="">

        </view>
      </view>
      <view class="card-item">
        <view class="">
          支持方式
        </view>
        <view class="">

        </view>
      </view>
      <view class="card-item">
        <view class="">
          发布部门
        </view>
        <view class="">

        </view>
      </view>
      <view class="card-item">
        <view class="">
          最高奖励
        </view>
        <view class="">

        </view>
      </view>
    </view>
    <view class="content-card">
      <view class="content-title">
        申报对象条件
      </view>
      <view class="content-content">

      </view>
    </view>
    <view class="content-card">
      <view class="content-title">
        补贴标准
      </view>
      <view class="content-content">

      </view>
    </view>
    <view class="content-card">
      <view class="content-title">
        政策依据
      </view>
      <view class="content-content">

      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: null,
        data: {}
      }
    },
    methods: {
      getData() {
        const url = `/fyzhmd/select/srvcosvc_policy_info_user_select`
        const req = {
          "serviceName": "srvcosvc_policy_info_user_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }],
          "page": {
            "rownumber": 1,
            "pageNo": 1
          }
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
            this.data = res.data.data[0]
          }
        })
      },
    },
    onLoad(option) {
      if (option.id) {
        this.id = option.id
        this.getData()
      }
    }
  }
</script>

<style>

</style>
