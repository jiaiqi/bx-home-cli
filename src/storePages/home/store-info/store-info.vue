<template>
  <view class=" layout-2" :style="[calcStyle]" v-if="pageItem&&pageItem.type==='店铺信息2'">
    <view class="image-bg" :style="{'background-image':backgroundImage}">
      <view class="store-info" v-if="storeInfo">
        <view class="store-icon" v-if="storeInfo.logo">
          <image class="store-icon" :src="getImagePath(storeInfo.logo)" mode="aspectFill"></image>
        </view>
        <view class="store-intro">
          <view class="store-name">
            {{storeInfo.name||''}}
          </view>
          <view class="store-address" @click.stop="getCurrentLocation">
            <text class="cuIcon-locationfill margin-right-xs"></text>
            {{storeInfo.address||''}}
          </view>
        </view>
        <view class="store-button">
          <button class="image-btn" @click.stop="toManage" v-if="isManager">
            <image class="image" :src="require('./setting.png')" mode=""></image>
          </button>
          <button class="image-btn" open-type="share">
            <image class="image" :src="require('./share.png')" mode=""></image>
          </button>
        </view>
      </view>
    </view>
  </view>
  <view class="store-info layout-1" :style="[calcStyle]" v-else>
    <view class="store-top">
      <view class="top">
        <view class="name">{{ storeInfo.name || "机构名称" }}</view>
        <view class="bind" v-if="isBind === true">
          <button class="cu-btn border round" @click.stop="toManage" v-if="isManager">
            <text class="cuIcon-settingsfill margin-right-xs"></text>
            <text class="text-black">管理</text>
          </button>
          <button class="cu-btn border  round" @click.stop="toSetting">
            <text class="cuIcon-peoplefill"></text>
            <!-- <text class="text-black">个人</text> -->
          </button>
          <button class="cu-btn border round" @click.stop="toAttention" v-if="!isAttention">
            <text class="cuIcon-notice_forbid_fill "></text>
            <text class="cu-tag badge">待设置</text>
          </button>
        </view>
        <view class="bind" v-if="isBind === false"><button @click.stop="bindStore(true)" type="primary"
            class="bg-blue cu-btn round shadow-blur">
            加入
          </button></view>
      </view>
      <image class="logo" mode="aspectFit" :src="getImagePath(storeInfo.logo)" v-if="storeInfo.logo"></image>
      <view class="logo" v-else-if="storeInfo.name">
        {{ storeInfo.name.slice(0, 1) }}
      </view>
      <view class="left" @click="toPages('instroduce')">
        <view class="bottom" v-if="storeInfo.address">
          <view class="address" @click.stop="getCurrentLocation">
            <text class="content"><text class="cuIcon-locationfill"
                style="font-size: 20px"></text>{{ storeInfo.address || "机构地址" }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="instroduce" @click="showModal">
      <view v-html="storeInfo.introduction" class="introduce-content"></view>
    </view>
    <view class="right">
      <view class="qr-code" v-if="qrCodeText">
        <uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" :size="codeSize" class="qrcode-canvas" foregroundColor="#333"
          makeOnLoad @makeComplete="qrcodeCanvasComplete" ref="qrcodeCanvas">
        </uni-qrcode>
        <image :src="qrcodePath" class="qr-code-image" mode="aspectFit" v-if="qrcodePath"
          @click="toPreviewImage(qrcodePath)"></image>
        <view class="qr-code-image" v-else @click="makeQrCode">
          <text class="cuIcon-refresh"></text>
        </view>
      </view>
    </view>
    <view class="cu-modal" @click="hideModal" :class="{show:showNoticeModal}">
      <view class="cu-dialog" @click.stop style="width: 70%;">
        <view class="notice-wrap" v-if="storeInfo&&storeInfo.introduction">
          <view v-html="storeInfo.introduction">

          </view>
          <view class="button-box">
            <button class="cu-btn bg-cyan round margin-top shadow-blur" @click="hideModal">知道了</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      pageItem: {
        type: Object
      },
      storeInfo: {
        type: Object
      },
      userInfo: {
        type: Object
      },
      bindUserInfo: {
        type: Object
      },
      isBind: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      qrcodePath(newValue) {
        if (!newValue) {
          this.makeQrCode()
        }
      },
      storeInfo: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          let result = ''
          this.qrCodeText = ''
          this.qrcodePath = ''
          this.getFilePath(this.storeInfo.logo).then(res => {
            if (Array.isArray(res) && res.length > 0) {
              const item = res[0]
              this.qrCodeLogo = this.$api.getFilePath + item.fileurl
            }
          })
          if (this.userInfo && this.userInfo.userno && this.storeInfo && this.storeInfo.store_no) {
            result = `https://wx2.100xsys.cn/shareClinic/${this.storeInfo.store_no}/${this.userInfo.userno}`
          } else {
            result = `https://wx2.100xsys.cn/shareClinic/${this.storeInfo.store_no}`
          }
          this.qrCodeText = result
        }
      }
    },

    computed: {
      backgroundImage() {
        if (this.storeInfo?.image) {
          let path = this.getImagePath(this.storeInfo.image, true)
          return `url(${path})`
        }
      },
      isAttention() {
        // 是否关注公众号
        if (this.$store.state?.app?.subscsribeStatus) {
          return true
        }
      },
      isManager() {
        // 是否为用户之外的角色
        if (!this.bindUserInfo?.user_role) {
          return false
        }
        let showManager = false
        let arr = this.bindUserInfo?.user_role.split(',').map(item => item.trim()).filter(item => item && item !==
          '用户')
        if (arr.length > 0) {
          showManager = true
        }
        return showManager
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
      msgNum() {
        if (this.bindUserInfo && this.bindUserInfo.kefu_session_user_unread_msg) {
          return this.bindUserInfo.kefu_session_user_unread_msg
        } else return 0
      },
      introduction() {
        if (this.storeInfo && this.storeInfo.introduction && this.storeInfo.introduction
          .length > 80) {
          return this.storeInfo.introduction.slice(0, 80) + '...';
        } else {
          return this.storeInfo && this.storeInfo.introduction ? this.storeInfo.introduction : '';
        }
      }
    },
    data() {
      return {
        qrCodeText: '',
        codeSize: uni.upx2px(700),
        qrcodePath: '', //图片url
        qrCodeLogo: "",
        showNoticeModal: false,
      }
    },
    methods: {
      toManage() {
        let url = `/storePages/StoreManager/StoreManager?store_no=${this.storeInfo.store_no}`;
        if (this.storeInfo.store_no) {
          uni.navigateTo({
            url
          })
        }
      },
      toAttention() {
        let url = "/publicPages/webviewPage/webviewPage"
        url += `?webUrl=${encodeURIComponent("https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ")}`
        uni.navigateTo({
          url
        })
      },
      hideModal() {
        this.showNoticeModal = false
      },
      showModal() {
        this.showNoticeModal = true
      },
      toSetting() {
        this.$emit('toSetting')
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make()
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = this.storeInfo?.barcode_pic || e;
      },
      makePhoneCall() {
        uni.makePhoneCall({
          phoneNumber: this.storeInfo && this.storeInfo.telephone ? this.storeInfo.telephone : '10086'
        });
      },
      getCurrentLocation() {
        let latitude = 34.219329;
        let longitude = 108.935485;
        uni.openLocation({
          latitude: this.storeInfo.latitude ? Number(this.storeInfo.latitude) : latitude,
          longitude: this.storeInfo.longitude ? Number(this.storeInfo.longitude) : longitude,
          name: this.storeInfo.name,
          address: this.storeInfo.address,
          success: function() {
            console.log('success');
          },
          fail(err) {
            console.log('err', err);
          }
        });
      },
      setHomePage() {
        this.$emit('setHomePage')
      },
      toPages(e, info) {
        let url = '';
        if ((!this.bindUserInfo || !this.bindUserInfo.store_user_no) && e !== 'health-manager') {
          this.$emit('addToStore')
          return
        }
        switch (e) {
          case 'instroduce':
            url = '/storePages/StoreIntroduce/StoreIntroduce?store_no=' + this.storeInfo.store_no;
            break;
        }
        if (url) {
          uni.navigateTo({
            url: url,
            fail() {
              uni.switchTab({
                url: url
              })
            }
          });
        }
      },
      async bindStore() {
        // 将当前登录用户添加到店铺用户列表，角色为用户
        this.$emit('bindUser')
      },
      async toConsult() {
        // 在线咨询
        this.$emit('toConsult')
      },
    }
  }
</script>

<style scoped lang="scss">
  .layout-2 {
    .image-bg {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-size: 100%;
      padding: 360rpx 0 0;
      display: flex;
      flex-direction: column;

      .store-info {
        background-image: url(../../../static/img/wave-bg.png);
        background-position-y: bottom;
        background-size: 100%;
        background-repeat: no-repeat;
        // width: calc(100% - 60rpx);
        width: 100%;
        flex: 1;
        padding-left: 60rpx;
        display: flex;
        align-items: center;
        min-height: 220rpx;
        position: relative;
        margin-bottom: -2rpx;
        box-sizing: border-box;
        .store-icon {
          width: 160rpx;
          height: 160rpx;
          border-radius: 50%;
        }

        .store-intro {
          padding-left: 60rpx;
          padding-top: 60rpx;
          padding-right: 40rpx;
          flex: 1;
          .store-name {
            height: 50rpx;
            width: 90%;
            font-size: 18px;
            font-family: 苹方-简;
            font-weight: normal;
            color: #474849;
          }

          .store-address {
            width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            font-family: 苹方-简;
            font-weight: normal;
            color: #B8BAC0;
            margin-top: 10rpx;
          }

        }

        .store-button {
          position: absolute;
          top: -10%;
          right: 0;
          display: flex;

          .image-btn {
            width: 90rpx;
            height: 90rpx;
            outline: none;
            border: none;
            background-color: transparent;
            padding: 0;
            margin: 0;
            margin-right: 40rpx;

            &::after {
              border: none;
            }

            .image {
              width: 90rpx;
              height: 90rpx;
            }
          }
        }
      }
    }
  }



  .notice-wrap {
    width: 100%;
    padding: 30rpx;
    color: #666;

    // background-image: linear-gradient(to right, #EBF9FA, #EEF0FE);
    .button-box {
      margin-bottom: 0;

      .cu-btn {
        // background-image: linear-gradient(to right, #EBF9FA, #EEF0FE);
      }
    }
  }

  .right {
    padding: 10rpx;
    background-color: #EBF9FA;
    border-radius: 10rpx;
    margin-bottom: 10rpx;
  }

  .qr-code {
    background-color: #fff;
    padding: 10rpx;
    width: 170rpx;
    height: 170rpx;
    margin: 0 auto;

    .qrcode-canvas {
      position: fixed;
      top: -999999px;
    }

    .qr-code-image {
      width: 150rpx;
      height: 150rpx;
      line-height: 150rpx;
      text-align: center;
    }
  }

  .store-info.layout-1 {
    background-color: #fff;
    padding: 30rpx 28rpx 0;
    display: flex;
    margin-bottom: 20rpx;
    position: relative;
    padding-top: 20rpx;
    flex-wrap: wrap;
    border-radius: 20rpx;
    overflow: hidden;

    .top {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 10rpx 0;

      .name {
        width: 500rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: wrap;
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .tags {
        display: flex;

        .tag {
          display: inline-block;
          margin-left: 10rpx;
          padding: 5rpx 10rpx;
          background-color: #0ea8ff;
          color: #fff;
          border-radius: 10rpx;
        }
      }
    }

    .store-top {
      width: 100%;
      display: flex;
      margin-bottom: 20rpx;
      justify-content: space-between;
      flex-wrap: wrap;

      .name {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
      }

      .top {
        .bind {
          .cu-btn {
            padding: 0 20rpx;
            background-image: linear-gradient(to right, #EAF9F8, #EDEEFE);
            color: #CF79EE;
            font-size: 24rpx;
            margin-right: 10rpx;

            &.notice-setting {
              color: #FFBA2F;

              .badge {
                transform: scale(0.8);
                right: -30rpx;
                top: -15rpx;
                font-size: 24rpx;

              }
            }
          }

          [class*="cuIcon-"] {
            font-size: 40rpx;
          }
        }
      }

      .logo {
        width: 130rpx;
        height: 130rpx;
        border-radius: 20rpx;
        margin-right: 20rpx;
        font-size: 60rpx;
        font-weight: bold;
        line-height: 100rpx;
        text-align: center;
        border: 4rpx solid #EBF9FA;
      }

      .left {
        display: flex;
        flex-direction: column;
        width: calc(100% - 150rpx);
        // padding-right: 20rpx;



        .bottom {
          padding-top: 10rpx;
          color: #aaa;

          .address {
            width: 100%;
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: 苹方-简;
            font-weight: normal;
            color: #9092A5;

            .content {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              // white-space: nowrap;
            }
          }
        }
      }
    }

    .instroduce {
      width: 65%;
      background-color: #EBF9FA;
      background: linear-gradient(to right, #EBF9FA, #EEF0FE);
      border-radius: 20rpx;
      padding: 10rpx 20rpx;
      margin: 0 0 10rpx;
      flex: 1;
      // max-height: 180rpx;

      position: relative;
      color: #666;

      &::after {
        position: absolute;
        left: 20px;
        top: -20px;
        content: '';
        border: 10px solid;
        border-color: transparent transparent #EBF9FA transparent;
      }

      .introduce-content {
        overflow: hidden;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        /**指定行数*/
        -webkit-box-orient: vertical;
      }
    }

    .home-btn {
      font-weight: bold;
      text-align: center;
      position: absolute;
      height: 30px;
      top: -32px;
      right: 0px;

      .cu-btn {
        border-radius: 20px 0 0 20px;
        font-size: 20px;
        font-weight: 300;
      }

      &.like-btn {
        top: -70px;
      }
    }





    .right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      margin-left: 20rpx;

      .right-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        position: relative;
      }

      .image-box {
        position: relative;
      }

      .image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        font-size: 20px;
        color: #00aaff;
        padding: 5px;
      }
    }
  }
</style>
