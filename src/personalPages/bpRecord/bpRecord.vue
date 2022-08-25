<template>
  <view>
    <view class="no-data" v-if="noData">
      <image class="image" src="../static/icon/xueya_no_data.jpg" mode="aspectFit"></image>
      <view class="">
        您还没有任何添加记录
      </view>
      <button class="cu-btn add-btn" @click="showModal('addModal')">记录血压</button>
    </view>
    <view class="xueya-record" v-else>
      <view class="store-name">
        <view class="text-bold">
          {{storeInfo.name}}
        </view>
        <view class="">
          <button @click="showModal('addModal')" class=" cu-btn add-btn">添加记录</button>
        </view>
      </view>
      <view class="xueya-record-item" v-for="item in list">
        <view class="xueya-record-item-top text-grey">
          {{item.record_date||''}}
        </view>
        <view class="xueya-record-item-content">
          <view class="xueya-record-item-content-item text-sm text-gray">
            <view class="item-data  flex-0-5 ">
              <image src="/static/icon/sun.png" style="width:20px;height:20px;" mode="aspectFit"
                v-if="!isNight(item.record_time)"></image>
              <image src="/static/icon/moon.png" style="width:20px;height:20px;" mode="aspectFit"
                v-if="isNight(item.record_time)"></image>
            </view>
            <view class="item-data">
              泡浴前
            </view>
            <view class="item-data">
              泡浴后
            </view>
          </view>
          <view class="xueya-record-item-content-item">
            <view class="item-data flex-0-5">
              <text
                v-if="item.record_time">{{dayjs(dayjs().format("YYYY-MM-DD ")+item.record_time).format("HH:mm")}}</text>
            </view>
            <view class="item-data">
              {{item.before_diastolic_blood_pressure}} / {{item.before_systolic_blood_pressure}}
              <text class="text-gray margin-left-xs">mmhg</text>
            </view>
            <view class="item-data">
              {{item.after_diastolic_blood_pressure}} / {{item.after_systolic_blood_pressure}}
              <text class="text-gray margin-left-xs">mmhg</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:modalName==='addModal'}">
      <view class="cu-dialog">
        <view class="add-modal">
          <view class="title-bar  flex justify-between align-center padding-sm">
            <view class="">

            </view>
            <view class="">
              手动记录
            </view>
            <button class="cu-btn bg-white" @click.stop="showModal('')"> <text
                class="cuIcon-close text-bold text-lg"></text></button>
          </view>
          <view class="form-box">
            <view class="form-item">
              <text>泡浴前</text>
              <input type="digit" :class="{active:curInputCol==='before_diastolic_blood_pressure'}" disabled
                placeholder-class="placeholder" placeholder="舒张压(低压)" v-model="form.before_diastolic_blood_pressure"
                @click="onInput('before_diastolic_blood_pressure')" />
              <text class="text-lg">/</text>
              <input type="digit" :class="{active:curInputCol==='before_systolic_blood_pressure'}" disabled
                placeholder-class="placeholder" placeholder="收缩压(高压)" v-model="form.before_systolic_blood_pressure"
                @click="onInput('before_systolic_blood_pressure')" />
              <text class="text-sm text-gray">mmHg</text>
            </view>
            <view class="form-item">
              <text>泡浴后</text>
              <input type="digit" :class="{active:curInputCol==='after_diastolic_blood_pressure'}" disabled
                placeholder-class="placeholder" placeholder="舒张压(低压)" v-model="form.after_diastolic_blood_pressure"
                @click="onInput('after_diastolic_blood_pressure')" />
              <text class="text-lg">/</text>
              <input type="digit" :class="{active:curInputCol==='after_systolic_blood_pressure'}" disabled
                placeholder-class="placeholder" placeholder="收缩压(高压)" v-model="form.after_systolic_blood_pressure"
                @click="onInput('after_systolic_blood_pressure')" />
              <text class="text-sm text-gray">mmHg</text>
            </view>
          </view>
          <u-number-keyboard ref="uKeyboard" @change="valChange" @backspace="backspace" v-model="showKeyboard">
          </u-number-keyboard>
          <view class="bottom" @click="addRecord">
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        form: {
          before_diastolic_blood_pressure: "", //泡浴前舒张压
          before_systolic_blood_pressure: "", //泡浴前收缩压
          after_diastolic_blood_pressure: "", //泡浴后舒张压
          after_systolic_blood_pressure: "", //泡浴后收缩压
        },
        noData: false,
        modalName: "",
        pageInfo: {
          pageNo: 1,
          total: 0,
          rownumber: 20
        },
        list: [],
        showKeyboard: true,
        curInputCol: "",
        curInputVal: ""
      }
    },
    onLoad() {
      this.getList()
    },
    onPullDownRefresh() {
      this.pageInfo.pageNo = 1
      this.getList()
      setTimeout(_ => {
        uni.stopPullDownRefresh()
      }, 300)
    },
    onReachBottom() {
      if (this.pageInfo.pageNo * this.pageInfo.rownumber < this.pageInfo.total) {
        this.pageInfo.pageNo++;
        this.getList()
      }
    },
    methods: {
      // 按键被点击(点击退格键不会触发此事件)
      valChange(val) {
        // 将每次按键的值拼接到value变量中，注意+=写法
        this.curInputVal += val;
        console.log(this.curInputVal);
        if (this.curInputCol) {
          this.form[this.curInputCol] = this.curInputVal
        }
      },
      // 退格键被点击
      backspace() {
        // 删除value的最后一个字符
        if (this.curInputVal.length) this.curInputVal = this.curInputVal.substr(0, this.curInputVal.length - 1);
        console.log(this.curInputVal);
        this.form[this.curInputCol] = this.curInputVal
      },

      onInput(col) {
        this.curInputCol = col
        this.curInputVal = this.form[this.curInputCol] || ''
      },
      isNight(e) {
        if (e) {
          let num = parseInt(e)
          if (!isNaN(num) && num >= 18) {
            return true
          }
        }
        return false
      },
      addRecord() {
        // 添加血压记录
        this.curInputCol = ''
        this.curInputVal = ''
        if (this.form.before_diastolic_blood_pressure && this.form.before_systolic_blood_pressure && this.form
          .after_diastolic_blood_pressure && this.form.after_systolic_blood_pressure) {

        } else {
          uni.showModal({
            title: '提示',
            content: '数据填写不完整',
            showCancel: false
          })
          return
        }
        const service = `srvhealth_user_blood_pressure_record_add`
        const url = `/health/operate/${service}`
        const req = [{
          "serviceName": service,
          "data": [{
            record_date: this.dayjs().format("YYYY-MM-DD"),
            record_time: this.dayjs().format("HH:mm:ss"),
            record_type: "手动记录",
            store_no: this.storeInfo?.store_no,
            store_user_no: this.vstoreUser?.store_user_no,
            ...this.form,
          }]
        }]
        this.$http.post(url, req).then(res => {
          if (res?.data?.state == 'SUCCESS') {
            this.modalName = ''
            // #ifdef MP-WEIXIN
            uni.startPullDownRefresh({
              
            })
            // #endif
            // #ifdef H5
            this.getList()
            // #endif
            Object.keys(this.form).forEach(key => {
              this.form[key] = ''
            })
            uni.showModal({
              title: '提示',
              content: '添加成功',
              showCancel: false
            })
          }
        })
      },
      getList() {
        const service = `srvhealth_user_blood_pressure_record_select`
        const url = `/health/select/${service}`
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [{
            "colName": "user_account",
            // "colName": "store_user_no",
            "ruleType": "eq",
            "value": this.vstoreUser.user_account
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 100
          },
          "order": [{
            colName: "create_time",
            orderType: "desc"
          }]
        }
        this.$http.post(url, req).then(res => {

          if (res?.data?.state === 'SUCCESS') {
            let list = []

            this.pageInfo.total = res.data.page.total

            if (res?.data?.page?.total === 0) {
              this.noData = true
            }else{
              this.noData = false
            }

            if (this.pageInfo.pageNo > 1) {
              list = [...this.list]
            }

            this.list = [...list, ...res.data.data]
          }
        })
      },
      showModal(name) {
        this.curInputCol = ""
        this.curInputVal = ""
        this.modalName = name || ''
        if (name === 'addModal') {
          this.curInputCol = 'before_diastolic_blood_pressure'
          this.curInputVal = this.form['before_diastolic_blood_pressure'] || ''
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .xueya-record {
    padding: 10px;

    .store-name {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .xueya-record-item {
      background-color: #fff;
      border-radius: 2px;
      padding: 10px;
      margin-bottom: 10px;

      .xueya-record-item-top {
        padding: 0 0 5px 0;
        border-bottom: 1px solid #f1f1f1;
      }

      .xueya-record-item-content {
        .xueya-record-item-content-item {
          display: flex;

          .item-data {
            flex: 1;
            padding: 5px 10px;
            display: flex;
            justify-content: center;
            align-items: center;

            &.flex-0-5 {
              flex: 0.5;
            }
          }
        }
      }
    }
  }

  .cu-btn.add-btn {
    background-color: #DCB081;
    color: #fff;
    border-radius: 5px;
    width: 100px;
  }

  .no-data {
    width: 100vw;
    height: calc(100vh - var(--window-top));
    text-align: center;
    padding-top: 20vh;
    background-color: #fff;
    color: #999;
    position: relative;

    .image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 10px;
    }

    .cu-btn.add-btn {
      position: absolute;
      bottom: 20vh;
      left: calc(50% - 75px);
      width: 150px;
    }

  }

  .cu-modal {
    display: block;
  }

  .add-modal {
    .title-bar {
      border-bottom: 1px solid #f1f1f1;
      margin: 0 10px;
    }

    .bottom {
      text-align: center;
      color: #fff;
      padding: 15px;
      background-color: #DCB081;
      font-size: 16px;
    }

    .form-box {
      .form-item {
        padding: 10px;
        margin: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        input {
          margin: 0 5px;
        }

        .active {
          position: relative;
          border: 1px solid #333;
          border-radius: 5px;

          @keyframes focus {
            0% {
              opacity: 0;
            }

            30% {
              opacity: 1;
            }

            70% {
              opacity: 1;
            }


            100% {
              opacity: 0;
            }
          }

          // &:before {
          //   content: '';
          //   width: 1px;
          //   height: 100%;
          //   background-color: #333;
          //   position: absolute;
          //   left: 20px;
          //   animation: focus infinite 1s;
          // }
        }

        &:first-child {
          border-bottom: 1px solid #f1f1f1;
        }

        input {
          width: 30%;
        }

        .placeholder {
          font-size: 12px;
        }
      }
    }
  }
</style>
