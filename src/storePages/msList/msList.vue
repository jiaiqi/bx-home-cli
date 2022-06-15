<template>
  <view>
    <view class="main-image">
      <image :src="mainImg" mode="aspectFill" class="image"></image>
    </view>
    <view class="goods-list">
      <view class="goods-list-item" v-for="item in list">
        <view class="goods-img">
          <image :src="getImagePath(item.goods_img)" mode="aspectFill" class="image"></image>
          <view class="bottom-tip" v-if="timeOutObj">
            <view class="left">
              <text class="cuIcon-timefill margin-right-xs"></text>
              <text>秒杀</text>
            </view>
            <view class="right" v-if="timeOutObj.notStart">
              活动还未开始
            </view>
            <view class="right" v-else-if="timeOutObj.stoped">
              活动已经结束
            </view>
            <view class="right" v-else>
              <text> 距离本场结束还有</text>
              <text class="date-time">
                <text class="num" v-if="timeOutObj.Day&&timeOutObj.Day!=='00'">{{timeOutObj.Day}}</text>
                <text class="symbol" v-if="timeOutObj.Day&&timeOutObj.Day!=='00'">天</text>
                <text class="num">{{timeOutObj.Hour}}</text>
                <text class="symbol">:</text>
                <text class="num">{{timeOutObj.Minute}}</text>
                <text class="symbol">:</text>
                <text class="num">{{timeOutObj.Second}}</text>
              </text>
            </view>
          </view>
        </view>
        <view class="goods-info">
          <view class="goods-name">
            {{item.goods_name||''}}
          </view>
          <view class="bottom">
            <view class="left">
              <view class="goods-price">
                <view class="new">
                  <text class="label">{{data.act_type==='秒杀活动'?'秒杀价':'体验价'}}￥</text>
                  <text class="value">{{item.group_price||''}}</text>
                </view>
                <view class="old">
                  原价{{item.price}}
                </view>
              </view>
              <view class="goods-progress">

              </view>
            </view>
            <view class="right" v-if="timeOutObj&&!timeOutObj.notStart&&!timeOutObj.stoped">
              <button class="cu-btn round bg-red" @click="toDetail(item)">立即抢</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  let timer = null
  const dayjs = require('dayjs')
  export default {
    data() {
      return {
        id: "",
        activeNo: '',
        data: {},
        list: [],
        pageNo: 1,
        rownumber: 20,
        timeOutObj: null
      }
    },
    computed: {

      mainImg() {
        if (this.data?.wx_share_icon) {
          return this.getImagePath(this.data.wx_share_icon)
        }
        return ''
      }
    },
    methods: {
      toDetail(e) {
        let {
          dumpling_no,
          group_price,
          goods_no
        } = e || {}
        if (dumpling_no && goods_no && group_price) {
          let url =
            `/storePages/GoodsDetail/GoodsDetail?goods_no=${goods_no}&pageType=秒杀&dumpling_no=${dumpling_no}&group_price=${group_price}&storeNo=${this.storeInfo.store_no}`
          uni.navigateTo({
            url
          })
        }
      },
      setTimeOut() {
        let obj = {}
        if (this.data?.activity_statr_datetime && this.data?.activity_end_datetime) {
          let start = dayjs(this.data.activity_statr_datetime);
          let end = dayjs(this.data.activity_end_datetime)
          let now = dayjs();
          if (now - start < 0) {
            obj.notStart = true;
          } else if (now - end > 0) {
            obj.stoped = true
          } else {
            const date1 = dayjs(end)
            const date2 = dayjs(now)
            obj.differ = date1.diff(date2)
            obj.Day = date1.diff(date2, 'day')
            obj.Hour = date1.diff(date2, 'hour') - obj.Day * 24
            obj.Minute = date1.diff(date2, 'minute') - obj.Day * 24 * 60 - obj.Hour * 60
            obj.Second = date1.diff(date2, 'second') - obj.Day * 24 * 60 * 60 - obj.Hour * 60 * 60 - obj.Minute * 60
            obj.Day = obj.Day > 9 ? obj.Day : `0${obj.Day}`
            obj.Hour = obj.Hour > 9 ? obj.Hour : `0${obj.Hour}`
            obj.Minute = obj.Minute > 9 ? obj.Minute : `0${obj.Minute}`
            obj.Second = obj.Second > 9 ? obj.Second : `0${obj.Second}`
          }

        }
        this.timeOutObj = obj
        return obj
      },
      async getData() {
        const url = `/health/select/srvhealth_store_dumpling_select`
        const req = {
          "serviceName": "srvhealth_store_dumpling_select",
          "condition": [{
            "colName": "id",
            "ruleType": "eq",
            "value": this.id
          }],
          "colNames": ["*"]
        }
        if (this.activeNo) {
          req.condition = [{
            "colName": "dumpling_no",
            "ruleType": "eq",
            "value": this.activeNo
          }]
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
          this.data = res.data.data[0]
          if (this.data?.dumpling_no) {
            this.getList()
          }
        }
      },
      async getList() {
        const url = `/health/select/srvhealth_store_dumpling_goods_select`
        const req = {
          "serviceName": "srvhealth_store_dumpling_goods_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "dumpling_no",
            "ruleType": "eq",
            "value": this.data.dumpling_no
          }],
          "page": {
            "pageNo": this.pageNo,
            "rownumber": this.rownumber
          },
          "order": [],
        }
        const res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          clearInterval(timer)
          this.list = res.data.data
          timer = setInterval(() => {
            this.setTimeOut()
          }, 1000)
        }
      }
    },
    unmounted() {
      clearInterval(timer)
    },
    onLoad(option) {
      if (option.id || option.activeNo) {
        this.id = option.id;
        this.activeNo = option.activeNo
        this.getData()
      }
    }
  }
</script>

<style scoped lang="scss">
  .main-image {
    width: 750rpx;
    height: 600rpx;

    .image {
      width: 100%;
      height: 100%;
      vertical-align: middle;
      font-size: 0;
    }
  }

  .goods-list {
    padding: 18px;

    .goods-list-item {
      border-radius: 8px;
      background-color: #fff;
      margin-bottom: 10px;
      overflow: hidden;

      .goods-img {
        width: 100%;
        height: 340rpx;
        position: relative;

        .image {
          width: 100%;
          height: 100%;
        }

        .bottom-tip {
          position: absolute;
          bottom: 0;
          left: 0;
          background-color: rgba(238, 30, 50, 1);
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          width: 100%;

          .left {
            display: flex;
            align-items: center;

            .cuIcon-timefill {
              font-size: 18px;
            }
          }

          .right {
            .date-time {
              margin-left: 5px;

              .num {
                color: #ee1e32;
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 4px;
                background-color: #fff;
                margin: 0 2px;
                text-align: center;
                line-height: 20px;
              }
            }
          }
        }
      }

      .goods-info {
        padding: 10px;
        display: flex;
        flex-wrap: wrap;

        .goods-name {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bottom {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;

          .left {
            .goods-price {
              display: flex;

              .new {
                color: #ee1e32;
                margin-right: 10px;

                .label {
                  font-size: 12px;
                }

                .value {
                  font-size: 18px;
                }
              }

              .old {
                font-size: 14px;
                color: #aeaeb2;
                position: relative;

                &::after {
                  position: absolute;
                  content: '';
                  top: 50%;
                  left: 0;
                  width: 100%;
                  height: 1px;
                  background-color: #aeaeb2;
                }
              }
            }
          }
        }

      }
    }
  }
</style>
