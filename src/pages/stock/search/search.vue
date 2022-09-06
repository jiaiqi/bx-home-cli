<template>
  <view>
    <!-- #ifndef MP-WEIXIN -->
    <view class="camera">
      扫码仅支持在小程序端
    </view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <camera mode="scanCode" class="camera" @scancode="scancode" v-if="!unique_code"></camera>
    <view class="camera flex align-center justify-center" v-else>
      <view class="">
        扫码结果:{{unique_code}}
      </view>
      <button class="cu-btn bg-white round" @click="clear">重新扫码</button>
    </view>
    <!-- #endif -->
    <view class="scan-result-list bg-white  padding-lr">
      <view class="flex align-center justify-between">
        <view class=" flex align-center">
          <text class="margin-right-xs">货品唯一码:</text>
          <view class="border line-blue ">
            <input type="text" v-model="unique_code" />
          </view>
        </view>
        <button class="cu-btn round bg-blue light" @click="getDetail"> <text class="cuIcon-search"></text></button>
      </view>

      <view class="flex u-border-top margin-top-xs justify-between text-bold text-black padding-tb-xs" v-if="list&&list.length>0">
        <text v-if="detail" class="flex-1  margin-right-xs text-blue">{{goodsName||detail.goods_name||'-'}} 【{{detail.unit||'盒'}}】</text>
        <text class=""> 记录信息</text>
      </view>
      <view class="list-item flex align-center" v-if="list&&list.length>0">
        <view class="col flex-1">
          时间
        </view>
        <view class="col flex-0-5">
          类型
        </view>
        <view class="col flex-0-5 align-center">
          操作人
        </view>
      </view>
      <view class="list-box">

        <view class="list-item flex align-center" v-for="(item,index) in list">
          <view class="col flex-1">
            {{item.operate_time||'-'}}
          </view>
          <view class="col flex-0-5">
            {{item.type||'-'}}
          </view>
          <view class="col flex-0-5 align-center">
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
      clear() {
        this.unique_code = ''
      },
      back() {
        uni.navigateBack()
      },
      getList() {
        const url = `/health/select/srvhealth_goods_track_record_all_select`
        const req = {
          "serviceName": "srvhealth_goods_track_record_all_select",
          "colNames": ["*"],
          order: [{
            orderType: 'desc',
            colName: 'operate_time'
          }],
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
          } else {
            uni.showModal({
              title: '提示',
              content: '未查到条码对应货品相关记录,请点击重新扫码按钮重试',
              showCancel: false
            })
          }
        })
      },
      scancode(e) {
        this.unique_code = e.detail.result
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


  .border {
    border: 1px solid #f1f1f1;
    border-radius: 5px;
  }

  .col {
    text-align: left;
  }

  .flex-1 {
    flex: 1;
    overflow: hidden;text-overflow: ellipsis;white-space: nowrap;
  }

  .flex-0-5 {
    flex: 0.5;
  }

  .align-center {
    text-align: center;
  }

  .scan-result-list {
    height: calc(100vh - 180px);
    overflow: hidden;
    padding-top: 10px;

    .list-box {
      height: 100%;
      overflow-y: scroll;
      padding-bottom: 400rpx;

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
    height: 40px;
    position: fixed;
    bottom: 50rpx;

    .cu-btn {
      width: 80%
    }
  }
</style>
