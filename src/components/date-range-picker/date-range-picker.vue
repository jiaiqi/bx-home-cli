<template>
  <view class="date-range-picker" v-if="isRange">
    <view class="date-range-box" @click="showModal()">
      <view class="date-value">
        {{range.start||'开始'}}
      </view>
      <view class="separator">
        {{rangeSeparator||'至'}}
      </view>
      <view class="date-value">
        {{range.end||'结束'}}
      </view>
      <text class="cuIcon-calendar margin-left-xs"></text>
    </view>
    <u-calendar v-model="show" mode="range" @change="change" :min-date="min||'1950-01-01'" max-date="2050-01-01"
      v-if="mode==='date'||mode==='dateTime'">
    </u-calendar>
    <view class="cu-modal bottom-modal" :class="{show:show&&mode==='time'}" @click="hideModal">
      <view class="cu-dialog" @click.stop="">
        <smh-time-range :time="[12,30,0,17,30]" :min="min" @confrim="change" @cancel="cancel"
          v-if="show&&mode==='time'">
        </smh-time-range>
      </view>
    </view>
  </view>
  <view class="date-picker" v-else>
    <view class="calendar-box" v-if="(mode==='date'&&finderType==='calendar')||mode=='date_time_linkage'">
      <view class="date-select-box picker-content" @click="showModal()">
        <view class="place-holder" v-if="!selectVal">请选择</view>
        <view class="value" v-else>{{ selectVal }}</view>
        <text class="cuIcon-calendar margin-left-xs"></text>
      </view>
      <mx-datepicker :show="show" :type="mode" :value="value" :min="min" :show-tips="true" :begin-text="'入住'"
        :end-text="'离店'" :show-seconds="false" :price-map="priceMap" :price-config="priceConfig" @confirm="change"
        @cancel="cancel" format="yyyy-mm-dd" />
      <!-- #ifdef MP -->
      <!--   <u-calendar v-model="show" :defaultDate="value" mode="date" @change="change" :min-date="min||'1950-01-01'"
        max-date="2050-01-01">
      </u-calendar> -->
      <!-- #endif -->
    </view>
    <picker class="uni-picker" :start="min" :mode="mode" :value="selectVal" @change="change" :disabled="disabled"
      v-else-if="mode==='date'">
      <view class="picker-content date-select-box">
        <view class="place-holder" v-if="!selectVal">请选择</view>
        <view class="value" v-else>{{ selectVal }}</view>
        <text class="cuIcon-calendar margin-left-xs"></text>
      </view>
    </picker>

    <view class="calendar-box" v-else-if="mode==='dateTime'">
      <datetime-picker @change="change" :disabled="disabled" :defaultValue="value"></datetime-picker>
    </view>
    <picker class="uni-picker" :start="min" :end="max" :mode="mode" :value="selectVal" v-else @change="change"
      :disabled="disabled">
      <view class="picker-content date-select-box">
        <view class="place-holder" v-if="!selectVal">请选择</view>
        <view class="value" v-else>{{ selectVal }}</view>
        <text class="cuIcon-calendar margin-left-xs"></text>
      </view>
    </picker>
  </view>
</template>

<script>
  export default {
    name: "date-range-picker",
    model: {
      prop: 'value',
      event: 'change'
    },
    props: {
      disabled: {
        type: Boolean,
        default: false
      },
      isRange: {
        type: Boolean,
        default: false
      },
      rangeSeparator: {
        type: String,
        default: '至'
      },
      mode: {
        type: String,
        default: 'date'
      },
      value: {
        type: [Array, String]
      },
      min: {
        type: String,
        default: "1950-01-01"
      },
      max: {
        type: String
      },
      priceConfig: {
        type: Object
      },
      fieldsModel: {
        type: Object
      },
      field: {
        type: Object
      }
    },
    data() {
      return {
        show: false,
        modalName: '',
        priceMap: {}
      };
    },
    mounted() {
      uni.$on('dateTimeSelectorConfirm', e => {
        if (e?.value && e.col && e.col === this.field?.column) {
          this.$emit('change', {
            detail: {
              value: e.value,
              time: e.time
            }
          })
        }
      })
    },
    computed: {
      finderType() {
        return this.field?.moreConfig?.finderType
      },
      sysModel() {
        return uni.getSystemInfoSync().model
      },
      selectVal() {
        if (typeof this.value === 'string') {
          return this.value || '请选择'
        }
      },
      range() {
        let obj = {
          start: "",
          end: ""
        }
        if (Array.isArray(this.value) && this.value.length === 2) {
          obj.start = this.value[0]
          obj.end = this.value[1]
        }
        return obj
      }
    },
    methods: {
      async getPrice() {
        let serviceName = this.priceConfig?.serviceName;
        let appName = this.priceConfig?.appName || uni.getStorageSync('activeApp');
        let condition = []
        if (this.priceConfig?.condition && Array.isArray(this.priceConfig?.condition)) {
          condition = this.deepClone(this.priceConfig?.condition)
          if (Array.isArray(condition) && condition.length > 0) {
            condition = condition.map(item => {
              if (item.value) {
                let data = {
                  data: this.fieldsModel || {}
                }
                item.value = this.renderStr(item.value, data)
              }
              return item
            }).filter(item => {
              if (item.ruleType === 'eq' && (item.value === null || item.value === undefined ||
                  item.value ===
                  "")) {
                return false
              } else {
                return true
              }
            })
          }
        }
        let url = this.getServiceUrl(appName, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: condition
        };
        let res = await this.$http.post(url, req);
        if (res?.data?.state === 'SUCCESS' && res.data.data.length > 0) {
          this.priceMap = res.data.data.reduce((res, cur) => {
            if (cur[this.priceConfig.date_col] && cur[this.priceConfig.num_col]) {
              res[cur[this.priceConfig.date_col]] = cur[this.priceConfig.num_col]
            }
            return res
          }, {})
        }
      },
      cancel(e) {

        this.show = false
      },
      change(e) {
        if (this.mode === 'dateTime' && e?.f3) {
          this.$emit('change', {
            detail: {
              value: e.f3
            }
          })
        } else if (e.startDate && e.endDate) {
          this.$emit('change', [e.startDate, e.endDate])
          // this.$emit('change', [e.startDate, e.endDate])
        } else if (e.time) {
          this.hideModal()
          let arr = e.time.split('-')
          if (Array.isArray(arr) && arr.length == 2) {
            e.startTime = arr[0]
            e.endTime = arr[1]
            this.$emit('change', {
              startTime: e.startTime,
              endTime: e.endTime
            }, [e.startTime, e.endTime])
            // this.$emit('change', [e.startTime, e.endTime])
          }
        } else if (e?.detail?.value) {
          // this.selectVal = e.detail.value
          this.$emit('change', e)
        } else if (e?.value) {
          // this.selectVal = e.detail.value
          this.$emit('change', {
            detail: {
              value: e.value
            }
          })
        } else if (typeof e === 'string') {
          this.$emit('change', {
            detail: {
              value: e
            }
          })
        } else {
          if (e.result) {
            // this.selectVal = e.result
            this.$emit('change', {
              detail: {
                value: e.result
              }
            })
          }
        }
        this.show = false
      },
      showModal() {
        if (this.mode === 'date_time_linkage') {
          let cfg = this.field?.moreConfig;
          if (cfg && typeof cfg === 'object') {
            let url = '/publicPages/dateTimeSelector/dateTimeSelector?cfg=' + JSON.stringify(cfg) +
              '&data=' + JSON.stringify(this.fieldsModel)

            if (this.value) {
              url += `&defaultVal=${this.value}`
            }
            uni.navigateTo({
              url
            })
          }
          return
        }
        if (this.mode === 'date' && this.priceConfig?.serviceName && this.priceConfig?.appName && this.priceConfig
          ?.num_col && this.priceConfig?.date_col) {
          this.getPrice()
        }
        if (!this.disabled) {
          this.show = true
        }
      },
      hideModal() {
        this.show = false
      }
    },
  }
</script>

<style lang="scss">
  .date-range-picker {
    width: 100%;

    ::v-deep .u-calendar__action__icon {
      padding: 20rpx;
    }
  }

  .date-range-box {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 10rpx;
    text-align: center;
    align-items: center;
    border: 1rpx #f1f1f1 solid;
    border-radius: 10rpx;

    .u-row-center {
      display: flex;
      justify-content: center;
    }

    .date-value {
      flex: 1;
      background-color: rgba($color: #f1f1f1, $alpha: 0.2);
      padding: 10rpx;
      color: #666;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cuIcon-calendar {
      margin-left: 10rpx;
    }

    .separator {
      flex: 0.5;
    }
  }

  .date-picker {
    ::v-deep .u-calendar__action__icon {
      padding: 20rpx;
    }

    .calendar-box {
      width: 100%;
      text-align: right;


    }

    ::v-deep .uni-picker {
      width: 100%;
      z-index: 6666;

    }

    .picker-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      // padding:0 10rpx;
      padding: 10rpx;
      align-items: center;
      border-radius: 10rpx;

      .place-holder {
        padding: 0;
        color: #808080;
      }

      &.date-select-box {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
</style>
