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

        <view class="tips">{{ tips }}</view>

        <view class="bottom">
          <view class="" v-for="item in documents">
            <u-checkbox v-model="item.checked" name="confirm" shape="circle" active-color="blue">阅读并接受</u-checkbox>
            <text class="text-blue " @click="openDocument(item.protocol_file)">{{item.protocol_name}}</text>
          </view>
        </view>
        <view class="button-box flex flex-wrap justify-center align-center">
          <button class="cu-btn bg-transparent text-gray button margin-tb" @click="cancel">取消</button>
          <button class="cu-btn bg-transparent text-blue button light" lang="zh_CN" @tap="confirm">
            确定 </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        show: false,
        documents: [],
        nos: '', //协议编号
        needCheckes: [],
      }
    },
    computed: {
      title() {
        return `欢迎来到${this.storeInfo?.name||'百想首页'}`
      }
    },
    props: {
      docNos: {
        type: String
      },
      openType: {
        type: String,
        default: 'getUserInfo'
      },
      tips: {
        type: String,
        default: '请先阅读并勾选协议，才能进行下一步操作'
      },
      allowCancel: {
        type: Boolean,
        default: false
      }
    },
    created() {
      this.getDocs()
    },
    methods: {
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
              value: '表单提交时'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          },
        }
        if (this.docNos) {
          req.condition.push({
            colName: 'protocol_no',
            ruleType: 'in',
            value: this.docNos
          })
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.documents = res.data.data.map(item => {
              item.checked = false;
              if (item.is_must_sign == '是') {
                item.mustCheck = true
              }
              return item
            })
          }
        })
      },
      open() {
        if (this.documents.length > 0) {
          this.show = true
        }
      },
      cancel() {
        this.show = false
        this.$emit('cancel')
      },
      confirm() {
        let notCheck = this.documents.find(item => item.mustCheck && item.checked !== true)
        if (notCheck && notCheck.protocol_name) {
          uni.showToast({
            title: `请先阅读并接受【${notCheck.protocol_name}】`,
            icon: 'none'
          })
          return
        }
        this.show = false
        this.$emit('confirm')
      },
      getUserProfile(e) {
        if (!this.isChecked) {
          uni.showToast({
            title: '请先阅读并接受协议条款',
            icon: 'none'
          })
          return
        }
        // // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        // // #ifdef MP-WEIXIN
        // wx.getUserProfile({
        //   desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        //   success: (res) => {
        //     this.$store.commit('SET_AUTH_USER', res)
        //     this.handleUserInfo(res)
        //   }
        // })
        // // #endif
        // // #ifndef MP
        // uni.navigateTo({
        //   url: '/publicPages/accountExec/accountExec'
        // })
        // // #endif
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
          this.$emit('auth-complete')
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
