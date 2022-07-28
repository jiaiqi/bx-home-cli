<template>
  <view class="page-wrap">
    <view class="detail-card">
      <view class="flex justify-between">
        <view class="flex-1 margin-right">
          <view class="detail-item flex">
            <view class="label">
              货品名称：
            </view>
            <view class="value flex-1">
              {{detail.goods_name||'-'}}
            </view>
          </view>
          <view class="detail-item flex">
            <view class="label">
              货品编号：
            </view>
            <view class="value flex-1">
              {{detail.bar_code||'-'}}
            </view>
          </view>
        </view>
        <image mode="aspectFit" class="goods-image"></image>
      </view>

      <view class="flex">
        <view class="detail-item flex flex-1 margin-right">
          <view class="label">
            净含量：
          </view>
          <view class="value flex-1">
            {{'-'}}
          </view>
        </view>
        <view class="detail-item flex flex-1">
          <view class="label">
            单位：
          </view>
          <view class="value flex-1">
            {{'-'}}
          </view>
        </view>
      </view>

      <view class="flex">
        <view class="detail-item flex flex-1 margin-right">
          <view class="label">
            库存数量：
          </view>
          <view class="value flex-1"
            :class="{'text-red':detail.stock_num_warning_value&&detail.stock_num<=detail.stock_num_warning_value}">
            {{detail.stock_num||'-'}}
          </view>
        </view>
        <view class="detail-item flex flex-1">
          <view class="label">
            单位：
          </view>
          <view class="value flex-1">
            {{detail.unit||'-'}}
          </view>
        </view>
      </view>

      <view class="flex">
        <view class="detail-item flex flex-1 margin-right">
          <view class="label">
            储藏方式：
          </view>
          <view class="value flex-1">
            {{'-'}}
          </view>
        </view>
        <view class="detail-item flex flex-1">
          <view class="label">
            有效期：
          </view>
          <view class="value flex-1">
            {{detail.shelf_life||'-'}}
          </view>
        </view>
      </view>


      <view class="flex">
        <view class="detail-item flex flex-1 margin-right">
          <view class="label">
            产品标准：
          </view>
          <view class="value flex-1">
            {{'-'}}
          </view>
        </view>
        <view class="detail-item flex flex-1">
          <view class="label">
            货品分类：
          </view>
          <view class="value flex-1">
            {{'-'}}
          </view>
        </view>
      </view>
      <view class="detail-item flex">
        <view class="label">
          进货价格：
        </view>
        <view class="value flex-1">
          {{'-'}}
        </view>
      </view>
      <view class="detail-item flex">
        <view class="label">
          零售价格：
        </view>
        <view class="value flex-1">
          {{'-'}}
        </view>
      </view>
      <view class="flex justify-center padding-tb">
        <button class="cu-btn bg-blue" style="width: 60%;" @click="toEdit">编辑</button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: null,
        detail: {},
        loadStatus: ''
      }
    },
    methods: {
      toEdit() {
        const e = this.detail
      },
      async getDetail() {
        const url = `/health/select/srvhealth_goods_stock_select`
        const req = {
          "serviceName": "srvhealth_goods_stock_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.id
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        this.loadStatus = 'loading'
        const res = await this.$http.post(url, req)
        this.loadStatus = ''
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          this.detail = res.data.data[0]
        }
        return res

      },
    },
    onLoad(o) {
      if (o?.id) {
        this.id = o.id
        this.getDetail()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    padding: 10px;

    .detail-card {
      padding: 10px;
      border-radius: 10px;
      background-color: #fff;
      min-height: 100px;

      .flex-1 {
        flex: 1;
      }

      .goods-image {
        border-radius: 5px;
        width: 60px;
        height: 60px;
        margin-right: 10px;
        background-color: #DBAF80;
      }

      .detail-item {
        margin-bottom: 10px;
        align-items: center;
        font-size: 12px;
        color: #000;

        .label {
          min-width: 120rpx;
          text-align: justify;
          text-align-last: justify;
        }

        .value {
          background-color: #E2E2E2;
          border-radius: 5px;
          padding: 5px 15px;
        }
      }
    }
  }
</style>
