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
      v-if="mode==='date'">
    </u-calendar>
    <view class="cu-modal bottom-modal" :class="{show:show&&mode==='time'}" @click="hideModal">
      <view class="cu-dialog" @click.stop="">
        <smh-time-range :time="[12,30,0,17,30]" @confrim="change" @cancel="cancel" v-if="show&&mode==='time'">
        </smh-time-range>
      </view>
    </view>
  </view>
  <view class="date-picker" v-else>
    <view class="calendar-box" v-if="mode==='date'">
      <view class="date-select-box picker-content" @click="showModal()">
        <view class="place-holder" v-if="!selectVal">请选择</view>
        <view class="value" v-else>{{ selectVal }}</view>
        <text class="cuIcon-calendar margin-left-xs"></text>
      </view>
      <!-- #ifdef H5 -->
      <mx-datepicker :show="show" :type="mode" :value="value" :show-tips="true" :begin-text="'入住'" :end-text="'离店'"
        :show-seconds="false" @confirm="change" @cancel="cancel" format="yyyy-mm-dd" />
      <!-- #endif -->

      <!-- #ifdef MP -->
      <u-calendar v-model="show" :defaultDate="value" mode="date" @change="change" :min-date="min||'1950-01-01'"
        max-date="2050-01-01">
      </u-calendar>
      <!-- #endif -->
    </view>
    <view class="calendar-box" v-else-if="mode==='dateTime'">
      <datetime-picker @change="change" :disabled="disabled" :defaultValue="value"></datetime-picker>
    </view>
    <picker class="uni-picker" :mode="mode" :value="selectVal" v-else @change="change">
      <view class="picker-content">
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
      }
    },
    data() {
      return {
        show: false,
        modalName: ''

      };
    },
    computed: {
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
      cancel(e) {
        debugger
        this.show = false
      },
      change(e) {
        debugger
        if (this.mode === 'dateTime' && e?.f3) {
          this.$emit('change', {
            detail: {
              value: e.f3
            }
          })
        } else if (e.startDate && e.endDate) {
          this.$emit('change', [e.startDate, e.endDate])
        } else if (e.time) {
          this.hideModal()
          let arr = e.time.split('-')
          if (Array.isArray(arr) && arr.length == 2) {
            e.startTime = arr[0]
            e.endTime = arr[1]
            this.$emit('change', [e.startTime, e.endTime])
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

      .date-select-box {
        width: 100%;
        justify-content: flex-end;
      }
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
    }
  }
</style>
