<template>
  <div>
    <!-- // 悬浮提示条 -->
    <view class="hovering-bar" :class="{show:showBar}" @click="showModal">
      <text class="cuIcon-close padding-xs" @click.stop="hide"></text> 添加到我的小程序,访问更方便<text
        class="cuIcon-right margin-lr-xs"></text>
    </view>
    <view class="cu-modal" :class="{show:modal}"  @click="hideModal()">
      <view class="cu-dialog" @touchmove.prevent="">
        <view class="content">
          <view class="">
            1. 点击右上角 <text class="cuIcon-more"></text>
          </view>
          <view class="">
            2. 选择 添加到我的小程序
          </view>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
  // 添加到【我的小程序】引导
  export default {
    data() {
      return {
        showBar: false,
        modal: false
      }
    },
    mounted() {
      let lastShowStarGuide = uni.getStorageSync('lastShowStarGuide')
      let onlyOnePage = getCurrentPages().length===1
      if(!lastShowStarGuide&&onlyOnePage){
        this.show()
      }else{
        let now = new Date().getTime();
        // 一周引导一次
        if(now - lastShowStarGuide > 86400000*7 && onlyOnePage){
          this.show()
        }
      }
    },
    methods: {
      
      showModal(){
        this.modal = true
      },
      hideModal(){
        this.modal = false
      },
      show(){
        this.showBar = true
        uni.setStorageSync('lastShowStarGuide',new Date().getTime())
        setTimeout(()=>{
          this.hide()
        },60*1000)
      },
      hide() {
        this.showBar = false
      }
    },
  }
</script>

<style scoped lang="scss">
  .cu-modal{
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.9);
    .cu-dialog{
      background-color: transparent;
      width: 100vw;
      height: 100vh;
      padding-top: 100px;
      
      .content{
        background-color: #fff;
        border-radius: 10px;
        margin: 0 100rpx;
        padding:20px;
        text-align: left;
        lighting-color: 40px;
        position: relative;
        &::after{
            content: '';
            position: absolute;
            right: 40px;
            top: -10px;
            width: 0;
            height: 0;
            border: 5px solid transparent;
            border-bottom-color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
  .hovering-bar {
    text-align: center;
    background-color: rgba(0, 0, 0, 0.9);
    position: fixed;
    top: -100px;
    right: 10px;
    border-radius: 50px;
    z-index: 99;
    padding: 10px;
    font-size: 16px;
    color: #fff;
    top: -100px;
    transition: top .2s ease-in-out;

    &.show {
      top: 100px;
    }

    &::after {
      content: '';
      position: absolute;
      right: 80px;
      top: -10px;
      width: 0;
      height: 0;
      border: 5px solid transparent;
      border-bottom-color: rgba(0, 0, 0, 0.9);
    }
  }
</style>
