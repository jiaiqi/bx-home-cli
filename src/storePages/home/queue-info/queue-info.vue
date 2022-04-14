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
    <view class="queue-list" v-else-if="queueList&&queueList.length>0">
      <view class="queue-info" v-for="item in queueList">
        <view class="queue-name">
          {{item.queue_name||''}}
        </view>
        <view class="icon">
          <image :src="icon" mode="aspectFit" class="image"></image>
        </view>
        <view class="info-view" v-if="!config.customCols">
          <view class="info-item">
            <view class="info-item-value" :style="[{color:config&&config.valueColor?config.valueColor:''}]">
              {{item.cur_no || '-'}}
            </view>
            <view class="info-item-label">
              当前叫号
            </view>
          </view>
          <view class="info-item" v-if="!config.customCols">
            <view class="info-item-value" :style="[{color:config&&config.valueColor?config.valueColor:''}]">
              {{item.wait_amount||'-'}}
            </view>
            <view class="info-item-label">
              排队人数
            </view>
          </view>
        </view>
        <view class="info-view" v-else-if="config.customCols">
          <view class="info-item" v-for="item in config.customCols">
            <view class="info-item-value" :style="[{color:item.valueColor || config.valueColor}]">
              {{item[item.col] || ''}}
            </view>
            <view class="info-item-label" :style="[{color:item.labelColor}]">
              {{item.label || ''}}
            </view>
          </view>
        </view>
        <button class="cu-btn bg-black round" :style="[{color:config.btnColor,'background':config.btnBg}]"
          @click="toQueue(item)">{{config.btnLabel||'立即排队'}}</button>
      </view>
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
        queueInfo: null,
        queueList: []
      }
    },
    created() {
      // if (this.config?.queue_no) {
      //   this.getQueueInfo()
      // }
      this.getQueueInfo(true)
    },

    methods: {
      getList() {
        let url = `${this.$api?.serverURL}/health/select/srvhealth_store_queue_up_cfg_select`
      },
      toQueue(e) {
        let url = `/storePages/queue/queue?store_no=${this.storeInfo?.store_no}&queue_no=${e?.queue_no||this.queueInfo?.queue_no}`
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
      getQueueInfo(all) {
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
            // "rownumber": 1
          }
        }
        if (all) {
          req.condition = [{
              colName: 'queue_date',
              ruleType: 'eq',
              value: this.dayjs().format("YYYY-MM-DD")
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            },
            {
              colName:'queue_status',
              ruleType: 'eq',
              value:'进行中'
            }
          ]
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res.data.data)) {
            if (res.data.data.length > 0) {
              if(all){
                this.queueList = res.data.data
              }else{
                this.queueInfo = res.data.data[0]
              }
            } else if (!all) {
              this.getQueueInfo(true)
            }
          }
        })
      },
    },
  }
</script>

<style scoped lang="scss">
  .queue-list{
    .queue-info{
      border-bottom: 1px solid #f1f1f1;
    }
  }
  .queue-info {
    display: flex;
    padding: 10px;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .queue-name{
      width: 100%;
      // text-align: center;
      font-size: 12px;
      color: #999;
      font-weight: bold;
    }
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
