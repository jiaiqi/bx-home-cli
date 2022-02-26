<template>
  <view>
    <view class="official-box">
      <image :src="getImagePath(mpInfo.icon,true)" mode="aspectFit" class="icon" v-if="mpInfo.icon"></image>
      <image :src="defaultIcon" mode="aspectFit" class="icon" v-else></image>
      <view class="store-name">
        {{mpInfo.name||''}}
      </view>
      <view class="tips">
        为了即时获取最新信息
      </view>
      <view class="tips">
        长按识别下方二维码，进行关注
      </view>
      <view class="qrcode-box">
        <image :src="getImagePath(mpInfo.app_qrcode,true)" mode="aspectFit" class="qr-code"></image>
      </view>
      <view class="bottom-tips text-blue">
        关注我们，获取更多资讯
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        mp_no: "",
        mpInfo: {},
        defaultIcon: require('./default_logo.png')
      }
    },
    methods: {
      async getMpInfo() {
        let req = {
          "serviceName": "srvportal_mini_program_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'mp_no',
            ruleType: 'eq',
            value: this.mp_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', 'srvportal_mini_program_select', req, 'bxportal')
        if (res.success && res.data.length > 0) {
          this.mpInfo = res.data[0]
        }
      },
    },
    onLoad(option) {
      if (option.bx_auth_ticket) {
        uni.setStorageSync('bx_auth_ticket', option.bx_auth_ticket)
      }
      if (option.mp_no) {
        this.mp_no = option.mp_no
        this.getMpInfo()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .official-box {
    margin: 60px 10px 20px;
    padding: 40px 20px 20px;
    background-color: #fff;
    border-radius: 10px;
    text-align: center;
    position: relative;

    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto;
      position: absolute;
      top: -40px;
      left: calc(50% - 40px);
    }

    .store-name {
      padding: 10px;
      font-size: 16px;
      font-weight: bold;
    }

    .tips {
      font-size: 12px;
      color: #666;
      line-height: 20px;
    }

    .qrcode-box {
      padding: 20px;

      .qr-code {
        width: 200px;
        height: 200px;
      }
    }
  }
</style>
