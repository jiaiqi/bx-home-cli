<template>
  <view class="cu-modal bottom-modal" :class="{show:show}">
    <view class="cu-dialog">
      <view class="auth-box">
        <view class="margin-tb">
          <image :src="getImagePath(storeInfo.logo)" mode="aspectFit"
            style="width: 160rpx;height: 160rpx;border-radius: 50%;"></image>
          <view class="text-lg margin-tb-xs text-bold">
            {{storeInfo.name||''}}
          </view>
        </view>
        <view class="title">
          <!-- {{title||''}} -->
        </view>

        <view class="tips">{{ tips }}</view>

        <view class="bottom">
          <!-- 登录代表您已同意<text class="text-blue" @click="toArticle('CT2021012816330102')">百想用户协议</text> -->
          <!--     <label class="radio margin-right-xs">
            <radio :value="isChecked" style="transform: scale(0.7);"/><text> 阅读并接受</text>
          </label> -->
          <u-checkbox v-model="isChecked" name="confirm" shape="circle" active-color="blue">阅读并接受</u-checkbox>
          <template v-if="documents&&documents.length>0">
            <text class="text-blue margin-right-xs" @click="openDocument(item.protocol_file)"
              v-for="item in documents">{{item.protocol_name}}</text>
          </template>
          <template v-else><text class="text-blue" @click.stop="toArticle('CT2021012816330102')">百想用户协议</text>
            <text class="text-blue" @click.stop="toArticle('CT2021012816470103')">、隐私协议</text></template>
        </view>
        <view class="button-box flex flex-wrap justify-center align-center">
          <button class="cu-btn bg-transparent text-gray button margin-tb" @click="cancel"
            v-if="allowCancel">取消</button>
          <button class="cu-btn bg-transparent text-blue button light" lang="zh_CN" v-if="canIUseGetUserProfile"
            @tap="getUserProfile">
            确定 </button>
          <button class="cu-btn bg-transparent text-blue button light" v-else open-type="getUserInfo"
            @getuserinfo="getUserInfo">
            确定
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        canIUseGetUserProfile: false,
        isChecked: false,
        show: false,
        documents: []
      }
    },
    computed: {
      title() {
        return `欢迎来到${this.storeInfo?.name||'百想首页'}`
      }
    },
    props: {
      openType: {
        type: String,
        default: 'getUserInfo'
      },
      tips: {
        type: String,
        default: '请先进行授权登录，以便体验完整小程序'
      },
      allowCancel: {
        type: Boolean,
        default: false
      }
    },
    created() {
      if (wx.getUserProfile) {
        this.canIUseGetUserProfile = true
      }
      this.getDocs()
    },
    methods: {
      toArticle(no) {
        debugger
        uni.navigateTo({
          url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${no}`
        });
      },
      getDocs() {
        //查找协议列表
        const url = `/health/select/srvhealth_protocol_manage_select`
        const req = {
          "serviceName": "srvhealth_protocol_manage_select",
          "colNames": ["*"],
          "condition": [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            },
            {
              colName: 'sign_opportunity',
              ruleType: 'like',
              value: '微信授权时'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          },
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.documents = res.data.data
          }
        })
      },
      open() {
        this.show = true
      },
      cancel() {
        this.show = false
        this.$emit('cancel')
      },
      getUserProfile(e) {
        if (!this.isChecked) {
          uni.showToast({
            title: '请先阅读并接受协议条款',
            icon: 'none'
          })
          return
        }
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        // #ifdef MP-WEIXIN
        wx.getUserProfile({
          desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
          success: (res) => {
            this.$store.commit('SET_AUTH_USER', res)
            this.handleUserInfo(res)
          }
        })
        // #endif
        // #ifndef MP
        uni.navigateTo({
          url: '/publicPages/accountExec/accountExec'
        })
        // #endif
      },
      getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        // #ifdef MP-WEIXIN
        this.isChecked = true
        this.handleUserInfo(e.detail)
        this.$store.commit('SET_AUTH_USER', e)
        this.$emit('getuserinfo', e);
        // #endif
        // #ifndef MP
        if (!this.isChecked) {
          uni.showToast({
            title: '请先阅读并接受协议条款',
            icon: 'none'
          })
          return
        }
        uni.navigateTo({
          url: '/publicPages/accountExec/accountExec'
        })
        // #endif

      },
      async handleUserInfo(res) {
        let self = this
        if (typeof res === 'object' && Object.keys(res).length > 0 && res.userInfo) {
          let rawData = {
            nickname: res.userInfo.nickName,
            sex: res.userInfo.gender,
            country: res.userInfo.country,
            province: res.userInfo.province,
            city: res.userInfo.city,
            headimgurl: res.userInfo.avatarUrl
          };
          self.$store.commit('SET_WX_USERINFO', rawData);
          self.$store.commit('SET_AUTH_USERINFO', true);
          await self.setWxUserInfo(rawData);
          await this.toAddPage(rawData)
          this.show = false
          this.$emit('auth-complete')
          uni.showToast({
            title: '登录成功',
            icon: "none",
            duration: 3000
          })
          return
        }
      },
    }
  };
</script>

<style lang="scss">
  .auth-box {
    width: 100%;
    // height: calc(100vh - var(--window-top) - var(--window-bottom));
    z-index: 1001;
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: #fff;
    // padding-top: 60vh;
    position: relative;
    padding: 20px 20px 10px 20px;
    padding-bottom: 20px;

    .title {
      width: 100%;
      text-align: center;
      font-size: 20px;
      margin-bottom: 10px;
    }

    .bottom {
      // position: absolute;
      // bottom: 50px;
      // margin-bottom: 50px;
      width: 100%;
      text-align: center;
    }

    .logo {
      width: 100rpx;
      height: 100rpx;
      margin: 10rpx auto;
    }

    .tips {
      font-size: 28rpx;
      color: #333;
      width: 100%;
      margin: 10px;
      text-align: center;
    }

    .text {
      padding: 0 40px;
      text-align: left;
      width: 100%;
    }

    .bg-transparent {
      background-color: transparent;
    }

    .button-box {
      width: 100%;
      margin: 0;
      margin-top: 10px;
    }

    .button {
      font-size: 32rpx;
      // color: #fff;
      // width: 80%;
      min-width: 40%;
      flex: 1;
      margin: 0;
      letter-spacing: 2px;

      &:first-child {
        border-right: 1px solid #f1f1f1;
      }

      &:last-child {
        border-right: none;
      }
    }
  }

  .cu-modal {
    display: block;
    z-index: 9999;
  }
</style>
