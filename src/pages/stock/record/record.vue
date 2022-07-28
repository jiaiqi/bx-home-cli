<template>
  <view class="padding-sm">
    <view class="flex justify-center ">
      <button class="cu-btn bg-blue padding-lr-lg">新建入库</button>
    </view>
    <view class="filter-card bg-white radius margin-tb padding-sm">
      <view class="filter-item flex justify-between">
        <view class="label">
          仓库门店：
        </view>
        <view class="value flex-1 margin-left-sm">
          全部
        </view>
      </view>
      <view class="filter-item flex justify-between">
        <view class="label">
          入库原因：
        </view>
        <view class="value flex-1 margin-left-sm">
          所有
        </view>
      </view>
      <view class="filter-item flex justify-between">
        <view class="label">
          操作人：
        </view>
        <view class="value flex-1 margin-left-sm">
          全部
        </view>
      </view>
      <view class="filter-item flex justify-between align-center">
        <view class="label">
          时间筛选：
        </view>
        <view class="flex flex-1 margin-left-sm">
          <view class="value flex-1">
            <text class="text-gray">开始日期</text>
          </view>
          <text class="margin-lr-xs">至</text>
          <view class="value flex-1">
            <text class="text-gray">结束日期</text>
          </view>
        </view>
      </view>
      <view class="filter-item flex margin-tb-xs">
        <view class="label">
        </view>
        <view class="flex-1 margin-left-sm">
          <button class="cu-btn  border sm margin-right-xs round line-black ">今天</button>
          <button class="cu-btn  border sm margin-right-xs round line-black ">近七天</button>
          <button class="cu-btn  border sm margin-right-xs round line-black ">本月</button>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        type: "in", //in-入库 out-出库
      }
    },
    methods: {
      instock() {
        // 入库
        const req = [{
          "serviceName": "srvhealth_in_out_warehouse_add",
          "condition": [],
          "data": [{
            "store_no": "S2205180380",
            "type": "入库",
            "in_warehouse_type": "采购入库",
            "out_warehouse_type": "调拨出库",
            "operator": "jiaqi",
            "child_data_list": [{
              "serviceName": "srvhealth_in_out_warehouse_details_add",
              "condition": [],
              "depend_keys": [{
                "type": "column",
                "add_col": "in_out_no",
                "depend_key": "in_out_no"
              }],
              "data": [{
                "type": "入库",
                "store_no": "S2205180380",
                "stock_no": "KC202207260001",
                "warehouse_no": "CK20220726001",
                "bar_code": "TX202207260003",
                "goods_name": "隆德堂本草药浴桃花散",
                "goods_num": 10
              }]
            }]
          }]
        }]

      },
    }
  }
</script>

<style lang="scss" scoped>
  .flex-1 {
    flex: 1;
  }

  .radius {
    border-radius: 5px;
  }

  .filter-item {
    margin-bottom: 10px;

    .label {
      min-width: 140rpx;
      text-align: justify;
      text-align-last: justify;
    }

    .value {
      background-color: #E2E2E2;
      border-radius: 5px;
      padding: 2px 10px;
    }
  }
</style>
