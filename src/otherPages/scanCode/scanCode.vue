<template>
  <view>
    <camera mode="scanCode" class="camera" @scancode="scancode" v-if="show"></camera>
    <view class="camera" v-else>
      确认扫码内容
    </view>
    <view class="" v-for="item in list">
      <text>类型：{{item.type}}</text> ；<text>内容：{{item.result}} </text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        show: true,
        list: []
      }
    },
    methods: {
      scancode(e) {
        if (e.detail) {
          this.show = false
          uni.showModal({
            title: '提示',
            content: `内容：${e.detail.result};类型：${e.detail.type}`,
            success: (res) => {
              if (res.confirm) {
                this.list.push(e.detail)
              }
            },
            complete: () => {
              this.show = true
            }
          })
        }
      }
    }
  }
</script>

<style>
  .camera {
    width: 100vw;
    height: 30vh;
    background-color: #808080;
    text-align: center;
    line-height: 30vh;
    color: #fff;
  }
</style>
