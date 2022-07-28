<template>
  <view class="page-wrap">
    <view class="serach-bar-box">
      <view class="serach-bar">
        <text class="cuIcon-search margin-right-xs"></text>
        <input type="text" class="search-input" placeholder="输入商品编号、名称查询" v-model="searchVal" @blur="onSelect">
        <text class="cuIcon-scan text-blue margin-left-xs"></text>
      </view>
    </view>
    <view class="stock-list">
      <view class="stock-item" v-for="item in list" :key="item.id" @click="toDetail(item)">
        <view class="flex justify-between ">
          <view class="">
            货品名称：{{item.goods_name||''}}
          </view>
          <view class="">
            <button class="cu-btn sm bg-blue margin-right-xs" @click.stop="toEdit(item)">编辑</button>
            <button class="cu-btn sm bg-blue" @click.stop="toAdd()">补货</button>
          </view>
        </view>
        <view class="flex justify-between">
          <image mode="aspectFit" class="goods-image"></image>
          <view class="flex justify-center flex-direction text-gray flex-1">
            <view class="">
              货品编号：{{item.bar_code}}
            </view>
            <view class="">
              规格型号：{{item.specification}}
            </view>
          </view>
        </view>
        <view class="flex justify-end align-center text-gray">
          剩余库存：<text
            :class="{'text-red':item.stock_num_warning_value&&item.stock_num<=item.stock_num_warning_value}">{{item.stock_num||'-'}}</text>
        </view>
      </view>
    </view>
    <uni-load-more :status="loadStatus"></uni-load-more>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        searchVal: "",
        storeNo: "",
        pageNo: 1,
        total: 0,
        rownumber: 20,
        list: [],
        loadStatus: 'more'
      }
    },
    methods: {
      toEdit(e) {},
      toAdd(e) {},
      toDetail(e) {
        if (e?.id) {
          uni.navigateTo({
            url: `/pages/stock/item/item?id=${e.id}`
          })
        }
      },
      async onSelect() {
        this.pageNo = 1
        this.loadStatus = 'more'
        this.total = 0
        return await this.getList()
      },
      async getList() {
        const url = `/health/select/srvhealth_goods_stock_select`
        const req = {
          "serviceName": "srvhealth_goods_stock_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeNo || this.storeInfo?.store_no
          }],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": this.rownumber
          }
        }
        if (this.searchVal) {
          req.relation_condition = {
            "relation": "OR",
            "data": [{
                colName: "bar_code",
                ruleType: 'like',
                value: this.searchVal
              },
              {
                colName: "goods_name",
                ruleType: 'like',
                value: this.searchVal
              }
            ]
          }
        }
        this.loadStatus = 'loading'
        const res = await this.$http.post(url, req)
        this.searchVal = ''
        this.loadStatus = ''
        if (Array.isArray(res?.data?.data)) {
          if (this.pageNo === 1) {
            this.list = res.data.data
          } else {
            this.list = [...this.list, ...res.data.data]
          }
          this.total = res?.data?.page?.total
          if (this.pageNo * this.rownumber >= this.total) {
            this.loadStatus = 'noMore'
          } else {
            this.loadStatus = 'more'
          }
        }
        return res
      },
    },
    onPullDownRefresh() {
      this.onSelect().then(() => {
        uni.stopPullDownRefresh()
      })
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.pageNo++;
        this.getList()
      }
    },
    onLoad(option) {
      if (option.storeNo || option.store_no) {
        this.storeNo = option.storeNo || option.store_no
      }
      this.getList()
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    padding: 10px;
  }

  .serach-bar-box {
    padding: 10px;
    background-color: #fff;
    border-radius: 10px;
  }

  .serach-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #f1f1f1;
    border-radius: 20px;
    height: 36px;
    background-color: #E2E2E2;
    padding: 5px 10px;

    .search-input {
      flex: 1;
    }
  }

  .flex-1 {
    flex: 1;
  }

  .stock-list {
    margin-top: 10px;

    .stock-item {
      background-color: #fff;
      border-radius: 10px;
      margin-bottom: 10px;
      padding: 10px;

      .goods-image {
        border-radius: 5px;
        width: 60px;
        height: 60px;
        margin-right: 10px;
        background-color: #DBAF80;
      }
    }
  }
</style>
