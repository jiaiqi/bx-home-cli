<template>
  <view>
    <!-- #ifndef MP-WEIXIN -->
    <view class="camera">
      扫码仅支持在小程序端
    </view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <camera mode="scanCode" class="camera" @scancode="scancode"></camera>
    <!-- #endif -->
    <view class="scan-result-list bg-white  padding">
      <view class="flex align-center justify-between">
        <view class=" flex">
          <text class="margin-right-xs">货品唯一码:</text>
          <view class="border line-blue ">
            <input type="text" v-model="unique_code" />
          </view>
        </view>
        <button class="cu-btn round bg-blue light" @click="getDetail"> <text class="cuIcon-search"></text></button>
      </view>

      <view class="" v-if="detail">
        {{goodsName||detail.goods_name||'-'}}{{detail.unit||'盒'}}
      </view>
      <view class="margin-top margin-bottom-xs text-bold">
        记录信息
      </view>

      <view class="list-box">
        <view class="list-item flex align-center">
          <view class="col flex-1">
            时间
          </view>
          <view class="col flex-0-5">
            类型
          </view>
          <view class="col flex-0-5">
            操作人
          </view>
        </view>
        <view class="list-item flex align-center" v-for="(item,index) in list">
          <view class="col flex-1">
            {{item.operate_time||'-'}}
          </view>
          <view class="col flex-0-5">
            {{item.type||'-'}}
          </view>
          <view class="col flex-0-5">
            {{item.operator_name||'-'}}
          </view>
        </view>
      </view>

    </view>
    <view class="bottom-button">
      <button class="cu-btn round bg-blue" @click="back">返回</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        unique_code: "",
        detail: null,
        list: [],
        goodsName: ""
      }
    },
    onLoad(option) {
      if (option.unique_code) {
        this.unique_code = option.unique_code
        this.getDetail()
      }
    },
    methods: {

      back() {
        uni.navigateBack()
      },
      getList() {
        const url = `/health/select/srvhealth_goods_track_record_all_select`
        const req = {
          "serviceName": "srvhealth_goods_track_record_all_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "unique_code",
            "ruleType": "eq",
            "value": this.unique_code
          }]
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.list = res.data.data
            if (this.list.length > 0) {
              this.goodsName = this.list[0].goods_name
            }
          }
        })
      },
      getDetail(code) {
        let req = {
          "serviceName": "srvhealth_unique_code_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'unique_code',
            ruleType: 'eq',
            value: this.unique_code
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const url = '/health/select/srvhealth_unique_code_select'
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
            this.detail = res.data.data[0]
            this.getList()
          }
        })
      },
      scancode(e) {
        this.bar_code = e.detail.result
        this.getDetail()
        uni.showToast({
          title: '扫码成功!',
          icon: 'none'
        })
      }
    }
  }
</script>

<style lang="scss">
  .camera {
    width: 100vw;
    height: 180px;
    background-color: #808080;
    text-align: center;
    line-height: 180px;
    color: #fff;
  }
  .flex-0-5{
    flex: 0.5;
  }
  .col{
    text-align: left;
  }
  .flex-1 {
    flex: 1;
  }

  .scan-result-list {
    height: calc(100vh - 280px);
    margin-top: 20px;

    .list-box {
      height: calc(100% - 30px);
      overflow-y: scroll;

      .closeIcon {
        background-color: #333;
        border-radius: 50%;
        color: #fff;
        width: 22px;
        height: 22px;
        line-height: 22px;
        text-align: center;
      }
    }
  }

  .list-item {
    padding: 5px 10px;
    min-height: 40px;
    border: 1px solid #f1f1f1;
    border-radius: 5px;
    margin-bottom: 5px;

    .item {
      flex: 1;
      margin-right: 10px;
    }
  }

  .bottom-button {
    width: 100%;
    text-align: center;
    height: 80px;
    padding-top: 20px;

    .cu-btn {
      width: 80%
    }
  }
</style>
