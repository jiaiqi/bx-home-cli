<template>
  <view class="store-info" :style="[calcStyle]">
    <image
      class="logo"
      mode="aspectFit"
      :src="getImagePath(storeInfo.logo)"
      v-if="storeInfo.logo"
    ></image>
    <view class="logo" v-else-if="storeInfo.name">{{
      storeInfo.name.slice(0, 1)
    }}</view>
    <view class="home-btn" @click="setHomePage" v-if="pageItem.show_set_home">
      <button
        class="cuIcon-home cu-btn bg-cyan"
        v-if="userInfo && userInfo.home_store_no !== storeInfo.store_no"
      ></button>
    </view>
    <view class="left" @click="toPages('instroduce')">
      <view class="top">
        <view class="name">{{ storeInfo.name || "机构名称" }}</view>
        <view class="bind" v-if="isBind === false"
          ><button
            @click.stop="bindStore(true)"
            type="primary"
            class="bg-blue cu-btn"
          >
            加入
          </button></view
        >
      </view>
      <!-- <view class="bottom" v-if="introduction && introduction.length < 25">{{ introduction }}</view> -->
      <view class="bottom" v-if="storeInfo.address">
        <view class="address" @click.stop="getCurrentLocation">
          <text class="content"
            >{{ storeInfo.address || "机构地址" }}
            <text
              class="cuIcon-locationfill text-blue margin-left-xs"
              style="font-size: 20px"
            ></text
          ></text>
        </view>
      </view>
    </view>
    <!-- 		<view class="qr-code">
			<uni-qrcode cid="qrcodeCanvas" :text="qrCodeText" v-if="qrCodeText" :size="codeSize" class="qrcode-canvas"
				foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete"></uni-qrcode>
			<image :src="qrcodePath" class="qr-code-image" mode="aspectFit" v-if="qrCodeText&&qrcodePath"
				@click="toPreviewImage(qrcodePath)"></image>
		</view> -->
    <view class="instroduce" @click="toPages('instroduce')">
      <view v-html="storeInfo.introduction"></view>
    </view>
    <view class="right">
      <view class="qr-code" v-if="qrCodeText">
        <uni-qrcode
          cid="qrcodeCanvas"
          :text="qrCodeText"
          :size="codeSize"
          class="qrcode-canvas"
          foregroundColor="#333"
          makeOnLoad
          @makeComplete="qrcodeCanvasComplete"
        ></uni-qrcode>
        <image
          :src="qrcodePath"
          class="qr-code-image"
          mode="aspectFit"
          v-if="qrcodePath"
          @click="toPreviewImage(qrcodePath)"
        ></image>
      </view>
      <!-- 		<view class="right-item" @click="makePhoneCall">
				<image class="image" src="../../../static/icon/makePhone.png" mode="aspectFit"></image>
				<text>电话</text>
			</view> -->
      <!-- 			<view class="right-item" @click="toConsult" v-if="pageItem.show_consult">
				<view class="image-box">
					<view class="cu-tag badge" v-if="msgNum">{{msgNum}}</view>
					<image class="image" src="../../../static/icon/msg.png" mode="aspectFit"></image>
				</view>
				<text>在线咨询</text>
			</view> -->
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
      default: false
    }
  },
  watch: {
    storeInfo: {
      deep: true,
      immediate: true,
      handler (newValue, oldValue) {
        let result = ''
        this.qrCodeText = ''
        this.qrcodePath = ''
        this.getFilePath(this.storeInfo.logo).then(res => {
          if (Array.isArray(res) && res.length > 0) {
            const item = res[ 0 ]
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
    calcStyle () {
      if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
        return {
          margin: this.pageItem.margin
        }
      }
    },
    msgNum () {
      if (this.bindUserInfo && this.bindUserInfo.kefu_session_user_unread_msg) {
        return this.bindUserInfo.kefu_session_user_unread_msg
      } else return 0
    },
    introduction () {
      if (this.storeInfo && this.storeInfo.introduction && this.storeInfo.introduction
        .length > 80) {
        return this.storeInfo.introduction.slice(0, 80) + '...';
      } else {
        return this.storeInfo && this.storeInfo.introduction ? this.storeInfo.introduction : '';
      }
    }
  },
  data () {
    return {
      qrCodeText: '',
      codeSize: uni.upx2px(700),
      qrcodePath: '', //图片url
      qrCodeLogo: "",
    }
  },
  methods: {
    qrcodeCanvasComplete (e) {
      this.qrcodePath = this.storeInfo?.barcode_pic || e;
    },
    makePhoneCall () {
      uni.makePhoneCall({
        phoneNumber: this.storeInfo && this.storeInfo.telephone ? this.storeInfo.telephone : '10086'
      });
    },
    getCurrentLocation () {
      let latitude = 34.219329;
      let longitude = 108.935485;
      uni.openLocation({
        latitude: this.storeInfo.latitude ? Number(this.storeInfo.latitude) : latitude,
        longitude: this.storeInfo.longitude ? Number(this.storeInfo.longitude) : longitude,
        name: this.storeInfo.name,
        address: this.storeInfo.address,
        success: function () {
          console.log('success');
        },
        fail (err) {
          console.log('err', err);
        }
      });
    },
    setHomePage () {
      this.$emit('setHomePage')
    },
    toPages (e, info) {
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
          fail () {
            uni.switchTab({
              url: url
            })
          }
        });
      }
    },
    async bindStore () {
      // 将当前登录用户添加到店铺用户列表，角色为用户
      this.$emit('bindUser')
    },
    async toConsult () {
      // 在线咨询
      this.$emit('toConsult')
      // if (!this.bindUserInfo || !this.bindUserInfo.store_user_no) {
      // 	this.bindUserInfo = await this.bindStore()
      // 	this.$store.commit('SET_STORE_USER', this.bindUserInfo)
      // }
      // if (this.bindUserInfo && this.bindUserInfo.store_user_no && this.storeInfo && this.storeInfo
      // 	.store_no) {
      // 	uni.navigateTo({
      // 		url: `/personalPages/chat/chat?type=机构用户客服&identity=客户&storeNo=${this.storeInfo.store_no}&store_user_no=${this.bindUserInfo.store_user_no}`
      // 	})
      // }
    },
  }
}
</script>

<style scoped lang="scss">
.qr-code {
  background-color: #fff;
  width: 150rpx;
  height: 150rpx;
  margin: 0 auto;

  .qrcode-canvas {
    position: fixed;
    top: -999999px;
  }

  .qr-code-image {
    width: 150rpx;
    height: 150rpx;
  }
}

.store-info {
  background-color: #fff;
  padding: 30rpx 28rpx 0;
  display: flex;
  margin-bottom: 20rpx;
  position: relative;
  padding-top: 20rpx;
  flex-wrap: wrap;

  .instroduce {
    width: 65%;
    background-color: #f8f8f8;
    border-radius: 10rpx;
    padding: 10rpx 20rpx;
    margin: 20rpx 0;
    flex: 1;
    // max-height: 180rpx;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    /**指定行数*/
    -webkit-box-orient: vertical;
    overflow: hidden;
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

  .logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    margin-right: 20rpx;
    font-size: 60rpx;
    font-weight: bold;
    line-height: 100rpx;
    text-align: center;
    // position: absolute;
    border: 4rpx solid #fff;
  }

  .left {
    display: flex;
    flex-direction: column;
    width: calc(100% - 150rpx);
    // padding-right: 20rpx;

    .top {
      display: flex;
      justify-content: space-between;
      // .bind{
      //   .cu-btn{

      //   }
      // }
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

    .bottom {
      padding-top: 10rpx;
      color: #aaa;

      .address {
        width: 100%;
        display: flex;
        align-items: center;

        .content {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          // white-space: nowrap;
        }
      }
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
