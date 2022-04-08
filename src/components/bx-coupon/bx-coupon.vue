<template>
  <view class="temp-1 btn" :style="[setStyle]" v-if="cfg&&cfg.template_name==='模板1'&&data&&data.coupon_no"  @click="onBtn">
    <view class="left">
      <view class="status-icon">
      </view>
      <view class="top">
        <text>￥</text>
        <text class="money">{{data.special_money||''}}</text>
      </view>
      <view class="bottom">
        {{data.coupon_title||''}}
      </view>
    </view>
    <view class="right">
      <text v-if="data.receive_status==='未领取'">{{data.coupon_button_txt||''}}</text>
      <text v-else>{{data.coupon_button_receive||''}}</text>
    </view>
  </view>
  <view class="temp-2" v-else-if="cfg&&cfg.template_name==='模板2'&&data&&data.coupon_no">
    <view class="top">
      <view class="left">
        <view class="">
          <text>￥</text>
          <text class="money">{{data.special_money||''}}</text>
        </view>
        <view class="">
          满{{data.minimum_charge||''}}使用
        </view>
      </view>

      <view class="right btn" v-if="data.coupon_button_txt&&data.receive_status==='未领取'" @click="onBtn">
        <text v-for="text in sliceText(data.coupon_button_txt)">
          {{text||''}}
        </text>
      </view>
      <view class="right btn" v-else-if="data.coupon_button_receive&&data.receive_status!=='未领取'" @click="onBtn">
        <text>
          {{data.coupon_button_receive.slice(0,2)||''}}
        </text>
        <text>
          {{data.coupon_button_receive.slice(2)||''}}
        </text>
      </view>
    </view>
    <view class="bottom">
      {{data.coupon_title||''}}
    </view>
  </view>
  <view class="temp-3" :style="[setStyle]" v-else-if="cfg&&cfg.template_name==='模板3'&&data&&data.coupon_no">
    <view class="left">
      <view class="">
        {{data.coupon_title||''}}
      </view>
      <view class="">
        满{{data.minimum_charge||''}}使用
      </view>
      <view class="button btn" @click="onBtn">
        <text v-if="data.receive_status==='未领取'">{{data.coupon_button_txt||''}}</text>
        <text v-else>{{data.coupon_button_receive||''}}</text>
      </view>
    </view>
    <view class="right">
      <text>￥</text>
      <text class="money">{{data.special_money||''}}</text>
    </view>
  </view>
</template>

<script>
  import {
    debounce
  } from '@/common/func/util.js'
  export default {
    // 优惠券模板
    name: "bx-coupon",
    props: {
      data: {
        type: Object
      },
      cfg: {
        type: Object
      }
    },
    computed: {
      setStyle() {
        let style = {}
        if (this.cfg?.template_name) {
          style.backgroundImage = `url(${this.getImagePath(this.cfg?.template_image,true)})`
        }
        return style
      }
    },
    methods: {
      sliceText(e){
        if(e&&typeof e ==='string'){
          return [e.slice(0,2),e.slice(2)]
        }else{
          return []
        }
      },
      onBtn: debounce(function() {
        this.$emit('on-btn', this.data)
      }, 500, false)
    },
    data() {
      return {

      };
    }
  }
</script>

<style lang="scss" scoped>
  @mixin bgImg {
    background-size: 100% 100%;
    background-repeat: no-repeat;
    margin-right: 10px;

    // &:last-child {
    //   margin-right: 0;
    // }
  }
  .btn{
    &:active{
      transition: all .5s ease;
      transform: translate(1px,1px);
    }
  }
  .temp-3 {
    @include bgImg;
    width: 168px;
    height: 64px;
    display: flex;
    padding: 2px 0;

    .left {
      width: 95px;
      color: #fff;
      font-size: 12px;
      text-align: center;
      line-height: 18px;

      .button {
        text-align: center;
        font-size: 12px;
        transform: scale(0.8);
        color: #F55642;
      }
    }

    .right {
      color: #F55642;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .money {
        font-size: 30px;
        font-weight: 700;
      }
    }
  }

  .temp-2 {
    width: 170px;
    height: 95px;
    @include bgImg;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .top {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px 0 0;
      flex: 1;
      color: #B38C56;
      border: 1px solid #CCAC7F;

      .left {
        width: 100px;
        text-align: center;
      }

      .money {
        font-size: 30px;
      }

      .right {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-family: 苹方-简-中粗体, 苹方-简;
        color: #B38C56;
        border-radius: 5px;
        background: linear-gradient(136deg, #DEC78F 0%, #F8E8C7 49%, #E7CA87 100%);
        width: 40px;
        height: 36px;
        font-size: 12px;

      }
    }

    .bottom {
      padding: 0 14px;
      width: 100%;
      height: 25px;
      line-height: 25px;
      background: linear-gradient(133deg, #F0E2B2 0%, #F8EEC3 41%, #D8B870 100%);
      text-align: center;
      font-size: 14px;
      font-family: 苹方-简-中粗体, 苹方-简;
      color: #B38C56;
    }
  }

  .temp-1 {
    width: 125px;
    height: 60px;

    color: #fff;
    display: flex;
    @include bgImg;

    .left {
      width: 85px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .money {
        font-size: 22px;
        margin-left: 5px;
        font-family: FZDaHei-B02S-Regular, FZDaHei-B02S;
        font-weight: 600;
        color: #FFFFFF;
      }
    }

    .right {
      width: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-writing-mode: vertical-rl;
      writing-mode: vertical-rl;
    }
  }
</style>
