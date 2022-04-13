<template>
  <view class="queue-info" v-if="queueInfo&&queueInfo.queue_status==='进行中'">
    <view class="icon">
      <image :src="icon" mode="aspectFit" class="image"></image>
    </view>
    <view class="info-view" v-if="!config.customCols">
      <view class="info-item">
        <view class="info-item-value" :style="[{color:config&&config.valueColor?config.valueColor:''}]">
          {{queueInfo.cur_no || '-'}}
        </view>
        <view class="info-item-label">
          当前叫号
        </view>
      </view>
      <view class="info-item" v-if="!config.customCols">
        <view class="info-item-value" :style="[{color:config&&config.valueColor?config.valueColor:''}]">
          {{queueInfo.wait_amount||'-'}}
        </view>
        <view class="info-item-label">
          排队人数
        </view>
      </view>
    </view>
    <view class="info-view" v-else-if="config.customCols">
      <view class="info-item" v-for="item in config.customCols">
        <view class="info-item-value" :style="[{color:item.valueColor || config.valueColor}]">
          {{queueInfo[item.col] || ''}}
        </view>
        <view class="info-item-label" :style="[{color:item.labelColor}]">
          {{item.label || ''}}
        </view>
      </view>
    </view>
    <button class="cu-btn bg-black round" :style="[{color:config.btnColor,'background':config.btnBg}]"
      @click="toQueue">{{config.btnLabel||'立即排队'}}</button>
  </view>
</template>

<script>
  // 排队信息
  export default {
    props: {
      pageItem: {
        type: Object
      },
      config: {
        type: Object
      }
    },
    computed: {
      icon() {
        return this.pageItem?.icon_queue || require('./icon.jpg')
      }
    },
    data() {
      return {
        queueInfo: null
      }
    },
    created() {
      if (this.config?.queue_no) {
        this.getQueueInfo()
      }
    },
    methods: {
      toQueue() {
        let url = `/storePages/queue/queue?store_no=${this.storeInfo?.store_no}&queue_no=${this.queueInfo?.queue_no}`
        if (this.config?.btnUrl) {
          let data = {
            data: this.queueInfo,
            storeInfo: this.storeInfo,
            storeUser: this.vstoreUser,
            userInfo: this.userInfo,
          }
          url = this.renderStr(this.config?.btnUrl, data)
        }
        uni.navigateTo({
          url
        })
      },
      getQueueInfo() {
        let url = `${this.$api?.serverURL}/health/select/srvhealth_store_queue_up_cfg_select`
        const req = {
          "serviceName": "srvhealth_store_queue_up_cfg_select",
          "colNames": ["*"],
          "condition": [{
            colName: "queue_no",
            ruleType: 'eq',
            value: this.config?.queue_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.queueInfo = res.data.data[0]
          }
        })
      },
    },
  }
</script>

<style scoped lang="scss">
  .queue-info {
    display: flex;
    padding: 10px;
    justify-content: space-between;
    align-items: center;

    .info-view {
      flex: 1;
      display: flex;
    }

    .icon {
      margin: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      .image {
        width: 40px;
        height: 40px;
      }
    }
  }

  .info-item {
    text-align: center;
    flex: 1;

    &-label {}

    &-value {
      color: #333;
      font-size: 24px;
    }
  }

  .cu-btn {
    margin-left: 20px;
  }
</style>
