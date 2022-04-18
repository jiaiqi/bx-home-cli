<template>
  <view class="coupon-selector-wrap">
    <text class="view-text" @click="open" :class="{'data-empty':noData}">
      <text v-if="minusAmount" class="text-red">-￥{{minusAmount||''}}</text>
      <text v-else-if="noData">没有可用的优惠券</text>
      <text v-else>去选择</text>
    </text>
    <view class="cu-modal bottom-modal" :class="{show:show}" @click.stop="close">
      <view class="cu-dialog" @click.stop="">
        <div class="coupon-selector">
          <view class="title">
            <text class="text">优惠券</text>
            <text class="cuIcon-close" @click="close"></text>
          </view>
          <view class="content" :class="{'data-empty':noData}">
            <u-empty v-if="noData" text="没有可用的优惠券"></u-empty>
            <view class="coupon-item" v-for="(item,index) in couponList" :class="{'active':item.checked}"
              @click="clickCoupon(item,index)">
              <view class="coupon-item_content">
                <view class="left bg-blue">
                  <view class="amount">
                    <text>￥</text>
                    <text class="num">{{item.special_money||''}}</text>
                  </view>
                  <view class="tip">
                    <text v-if="item.minimum_charge">满{{item.minimum_charge||''}}元可用</text>
                    <text v-else>无门槛优惠券</text>
                  </view>
                </view>
                <view class="right shadow-blur">
                  <view class="store-name">
                    {{item.coupon_title||''}}
                  </view>
                  <view class="date-range">

                  </view>
                </view>
                <view class="radio-box">
                  <radio class="" :checked="item.checked" style="transform: scale(0.8);" />
                </view>
              </view>
            </view>
          </view>
          <view class="button-box" v-if="!noData">
            <button class="cu-btn bg-gradual-orange" @click="close()">确定</button>
          </view>
        </div>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        show: false,
        loadStatus: 'more',
        couponList: []
      }
    },
    props: {
      max: {
        type: [Number, String]
      },
      multiSelect: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      noData() {
        return this.loadStatus == 'noMore' && this.couponList.length == 0
      },
      checkedNo() {
        return this.couponList.reduce((res, cur) => {
          if (cur.checked && cur.receive_no) {
            res.push(cur.receive_no)
          }
          return res
        }, [])
      },
      minusAmount() {
        return this.couponList.reduce((res, cur) => {
          if (cur.checked && cur.special_money && !isNaN(Number(cur.special_money))) {
            res += Number(cur.special_money)
          }
          return res
        }, 0)
      },
    },
    watch: {
      show(newValue, oldValue) {
        if (newValue == true) {
          this.getList()
        }
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      clickCoupon(e, index) {
        if (this.multiSelect) {
          e.checked = !e.checked
          this.$set(this.couponList, index, e)
        } else {
          this.couponList = this.couponList.map(item => {
            if (item.receive_no === e?.receive_no) {
              item.checked = item.checked ? false : true
            } else {
              item.checked = false
            }
            return item
          })
        }
        this.$emit('update', {
          num: this.minusAmount,
          list: this.checkedNo
        })
      },
      async getList() {
        const req = {
          "serviceName": "srvhealth_store_coupons_user_select",
          "colNames": ["*"],
          "condition": [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            },
            {
              colName: 'store_user_no',
              ruleType: 'eq',
              value: this.vstoreUser?.store_user_no
            },
            {
              colName: 'receive_status',
              ruleType: 'eq',
              value: '已领取'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        if (!isNaN(Number(this.max))) {
          req.condition.push({
            colName: 'minimum_charge',
            ruleType: 'le',
            value: this.max
          })
        }
        this.loadStatus = 'loading'
        let res = await this.$fetch('select', 'srvhealth_store_coupons_user_select', req, 'health');
        if (Array.isArray(res.data)) {
          if (res.page) {
            if (res.page?.pageNo * res.page?.rownumber >= res.page.total) {
              this.loadStatus = 'noMore'
            } else {
              this.loadStatus = 'more'
            }
          }
          this.couponList = res.data.map(item => {
            item.checked = false;
            if (Array.isArray(this.checkedNo) && this.checkedNo.indexOf(item.receive_no) !== -1) {
              item.checked = true
            }
            return item
          })
        }

      },
      close() {
        this.show = false;
        this.$emit('close', {
          num: this.minusAmount,
          list: this.checkedNo
        })
      },
      open() {
        this.show = true;
        this.$emit('open')
      }
    },
  }
</script>

<style scoped lang="scss">
  .coupon-selector-wrap {
    display: inline-flex;

    .view-text {
      color: #666;
      font-size: 12px;
      min-width: 100px;
      text-align: right;
      margin-right: 5px;

      &.data-empty {
        // pointer-events: none;
        opacity: 0.8;
      }
    }

    .text-red {
      font-size: 14px;
    }
  }

  .cu-modal.bottom-modal {
    display: block;
  }

  .coupon-selector {
    background-color: #F1F1F1;
    min-height: 50vh;
    max-height: 70vh;
    display: flex;
    flex-direction: column;

    .title {
      display: flex;
      padding: 10px 20px;
      justify-content: space-between;
      background-color: #fff;

      .text {
        font-size: 18px;
      }

      .cuIcon-close {
        background-color: #eee;
        width: 25px;
        text-align: center;
        line-height: 25px;
        height: 25px;
        border-radius: 50%;
        font-weight: bold;
      }
    }

    .content {
      padding: 10px 20px;
      flex: 1;
      overflow-y: scroll;

      &.data-empty {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .coupon-item {
        margin-bottom: 5px;
        height: 100px;
        -webkit-mask-image: radial-gradient(circle at 122px 10px, transparent 10px, red 10.5px), radial-gradient(closest-side circle at 50%, red 99%, transparent 100%);
        -webkit-mask-size: 100%, 4px 12px;
        -webkit-mask-repeat: repeat, repeat-y;
        -webkit-mask-position: 0 -10px, 120px;
        -webkit-mask-composite: source-out;
        mask-composite: subtract;
        position: relative;

        .coupon-item_content {
          display: flex;
          height: 100px;

          .left {
            width: 122px;
            padding: 10px;
            height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // background-color: #fff;
          }

          .right {
            flex: 1;
            height: 100%;
            background-color: #fff;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        }

        .left {
          .num {
            font-size: 30px;
          }
        }


        .radio-box {
          position: absolute;
          top: calc(50% - 13px);
          right: 10px;
        }

      }
    }

    .button-box {
      padding: 15px 10px;
      margin-bottom: 0;
      text-align: center;
      background-color: #fff;

      .cu-btn {
        width: 90%;
        border-radius: 20px;
      }
    }
  }
</style>
