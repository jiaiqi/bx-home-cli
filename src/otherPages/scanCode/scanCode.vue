<template>
  <view>
    <!-- #ifndef MP-WEIXIN -->
    <view class="camera" v-if="show">
      扫码仅支持在小程序端
    </view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <camera mode="scanCode" class="camera" @scancode="scancode" v-if="show"></camera>
    <!-- #endif -->
    <view class="camera" v-else>
      确认扫码内容
    </view>
    <view class="scan-result-list bg-white  padding">
      <view class="flex justify-between padding-lr padding-bottom header">
        <text>扫码结果</text>
        <text>{{list.length}}</text>
      </view>

      <view class="list-box">
        <view class="list-item flex align-center justify-between" v-for="(item,index) in list">
          <view class="item">
            {{item}}
          </view>
          <text class="closeIcon" @click.stop="del(index)">
            <text class="cuIcon-close"> </text>
          </text>
        </view>
      </view>

    </view>
    <view class="bottom-button">
      <button class="cu-btn round bg-blue" @click="back">确认</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        goods_num:null,
        show: true,
        uuid: '',
        bar_code: "",
        list: []
      }
    },
    onLoad(option) {
      if(option.goods_num){
        this.goods_num = option.goods_num
      }
      if (option.bar_code && option.uuid) {
        this.uuid = option.uuid
        this.bar_code = option.bar_code
      }
      if (option.list) {
        try {
          this.list = JSON.parse(option.list)
        } catch (e) {
          //TODO handle the exception
        }
      }
    },
    methods: {
      del(index) {
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
        if(this.list.length>=this.goods_num){
          var plugin = requirePlugin("WechatSI")
          plugin.textToSpeech({
            lang: "zh_CN",
            tts: true,
            content: `无法继续扫码,如要继续，请点击确认后再上一级页面添加商品数量`,
            success: function(res) {
              const innerAudioContext = uni.createInnerAudioContext();
              innerAudioContext.autoplay = true;
              innerAudioContext.src = res.filename
              innerAudioContext.play()
            }
          })
        }else if (this.list.length<this.goods_num && !this.list.find(i => i == e.detail?.result)) {
          uni.showToast({
            title: '扫码成功!',
            icon: 'none'
          })
          this.list.unshift(e.detail.result)
          var plugin = requirePlugin("WechatSI")
          plugin.textToSpeech({
            lang: "zh_CN",
            tts: true,
            content: `扫码${this.list.length}件`,
            success: function(res) {
              const innerAudioContext = uni.createInnerAudioContext();
              innerAudioContext.autoplay = true;
              innerAudioContext.src = res.filename
              innerAudioContext.play()
            }
          })
        } else {
          uni.showToast({
            title: '重复扫码!',
            icon: 'none'
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  .camera {
    width: 100vw;
    height: 180px;
    background-color: #808080;
    text-align: center;
    line-height: 180px;
    color: #fff;
  }

  .scan-result-list {
    height: calc(100vh - 280px);
    margin-top: 20px;

    .list-box {
      height: calc(100% - 30px);
      overflow-y: scroll;

      .closeIcon {
        background-color: #333;
        border-radius: 50%;
        color: #fff;
        width: 22px;
        height: 22px;
        line-height: 22px;
        text-align: center;
      }
    }
  }

  .list-item {
    padding: 5px 10px;
    min-height: 40px;
    border: 1px solid #f1f1f1;
    border-radius: 5px;
    margin-bottom: 5px;
    .item{
      flex: 1;
      margin-right: 10px;
    }
  }

  .bottom-button {
    width: 100%;
    text-align: center;
    height: 80px;
    padding-top: 20px;

    .cu-btn {
      width: 80%
    }
  }
</style>
