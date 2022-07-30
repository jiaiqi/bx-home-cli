<template>
  <view>
    <view class="official-box" v-if="storeInfo">
      <image :src="getUserImage()" mode="aspectFit" class="icon"></image>
      <view class="store-name">
        {{storeName|| storeInfo.name||''}}
      </view>
      <!--     <view class="tips">
        为了即时获取最新信息
      </view>
      <view class="tips">
        长按识别下方二维码，进行关注
      </view> -->
      <view class="qrcode-box">
        <image :src="qrcodePath" :show-menu-by-longpress="true" mode="aspectFit" class="qr-code-image"
          @click="toPreviewImage(qrcodePath)" v-if="storeInfo&&qrcodePath"></image>
        <view class="qr-code-image" v-else="!qrcodePath" @click="makeQrCode">
          <text class="cuIcon-refresh"></text>
        </view>
      </view>



      <view class="qr-code" v-if="qrCodeText">
        <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas" foregroundColor="#333"
          makeOnLoad @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas">
        </uni-qrcode>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        codeSize: uni.upx2px(700),
        qrcodePath: "",
        qrCodeText: "",
        qrCodeLogo: "",
        storeName: "",
        storeNo: "",
        userNo: ""
      }
    },
    methods: {
      init() {
        let result = '';
        this.qrCodeText = '';
        this.qrcodePath = '';
        if (this.storeInfo?.logo) {
          this.qrCodeLogo = this.getImagePath(this.storeInfo?.logo, true)
        }
        const store_no = this.storeNo || this.storeInfo.store_no
        const userNo = this.userNo || this.userInfo.userno
        if (userNo) {
          result =
            `https://wx2.100xsys.cn/${this.$api.customQrcodeFolder?this.$api.customQrcodeFolder+'/home':'shareClinic'}/${store_no}/${userNo}`;
        } else {
          result =
            `https://wx2.100xsys.cn/${this.$api.customQrcodeFolder?this.$api.customQrcodeFolder+'/home':'shareClinic'}/${store_no}`;
        }
        this.qrCodeText = result;
        // this.$nextTick(()=>{
        // })

      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make()
        }
      }
    },
    onLoad(option) {
      if (option.bx_auth_ticket) {
        uni.setStorageSync('bx_auth_ticket', option.bx_auth_ticket)
      }
      if (option.storeNo) {
        this.storeNo = option.storeNo
      }
      if (option.userNo) {
        this.userNo = option.userNo
      }
      if (option.storeName) {
        this.storeName = option.storeName
      }
      this.init()
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
      background-color: rgba(255, 255, 255, 0.2);
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
      text-align: center;
      position: relative;

      .title {
        padding: 10px;
      }


      .qr-code-image {
        width: 500rpx;
        height: 500rpx;
        line-height: 500rpx;
        margin: 0 auto;
        text-align: center;
        font-size: 20px;
        border: 1rpx solid #333;
        padding: 10px;
        // border-radius: 20rpx;
      }
    }

    .qrcode-canvas {
      position: fixed;
      top: -999px;
      right: -999px;
    }
  }
</style>
