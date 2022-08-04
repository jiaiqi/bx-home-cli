<template>
  <view>
    <camera mode="scanCode" class="camera" @scancode="scancode" v-if="show"></camera>
    <view class="camera" v-else>
      确认扫码内容
    </view>
    <view class="scan-result-list bg-white margin-top padding">
      <view class="flex justify-between">
        <text>扫码结果</text>
        <text>{{list.length}}</text>
      </view>
      <view class="list-item flex align-center justify-between" v-for="(item,index) in list">
        <text>{{item}} </text>
        <text class="cuIcon-close" @click="close(index)"> </text>
      </view>

    </view>
    <view class="bottom-button" v-if="bar_code&&list&&list.length>0">
      <button class="cu-btn round bg-blue" @click="back">确认</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        show: true,
        uuid: '',
        bar_code: "",
        list: []
      }
    },
    onLoad(option) {
      if (option.bar_code && option.uuid) {
        this.uuid = option.uuid
        this.bar_code = option.bar_code
      }
    },
    methods: {
      close(index) {
        this.list.splice(index, 1)
      },
      back() {
        uni.navigateBack({
          success: () => {
            uni.$emit('confirmScan', {
              bar_code: this.bar_code,
              uuid: this.uuid,
              list: this.list
            })
          }
        })
      },
      scancode(e) {

        if (!this.list.find(i => i == e.detail?.result)) {
          uni.showToast({
            title: '扫码成功!'
          })
          this.list.push(e.detail.result)
        }
        // if (e.detail) {
        //   this.show = false
        //   uni.showModal({
        //     title: '提示',
        //     content: `内容：${e.detail.result};类型：${e.detail.type}`,
        //     success: (res) => {
        //       if (res.confirm) {
        //         this.list.push(e.detail.result)
        //       }
        //     },
        //     complete: () => {
        //       this.show = true
        //     }
        //   })
        // }
      }
    }
  }
</script>

<style lang="scss">
  .camera {
    width: 100vw;
    height: 30vh;
    background-color: #808080;
    text-align: center;
    line-height: 30vh;
    color: #fff;
  }

  .bottom-button {
    width: 100%;
    text-align: center;

    .cu-btn {
      width: 80%
    }
  }
</style>
