<template>
  <view class="user-card ck" v-if="cardStyle==='创客'">
    <view class="left" v-if="!hasNotRegInfo">
      <view class="profile-image">
        <image :src="getUserImage()" class="profile-image"></image>
      </view>
      <view class="nick-name">
        <view class="name text-bold">
          <text class="margin-right-xs"> {{ userInfo.nick_name || userInfo.name||'微信用户' }}</text>
        </view>
        <view class="">
          当前店铺：{{storeInfo.name||''}}
        </view>
      </view>
    </view>
    <view class="left" v-else>
      <button class="cu-btn bg-white" @click="toEditUserInfo">点击完善用户信息</button>
    </view>
    <view class="right">
      <!-- #ifdef MP-WEIXIN -->
      <!--  <button class="cu-btn  light round sm line-orange border" @click="getUserProfile">
        <text class="cuIcon-refresh"></text>
        更新头像昵称
      </button> -->
      <!-- #endif -->
    </view>
  </view>
  <view class="user-card card-bag" v-else-if="cardStyle==='卡包'" :style="[{backgroundColor:pageItem.component_bg_color}]"
    @click="toEdit">
    <view class="top">
      <image :src="getUserImage()" class="profile-image" mode="aspectFit" @click.stop="getUserProfile"></image>
      <text class="margin-right-xs"> {{ userInfo.nick_name || userInfo.name||'点击完善用户信息' }}</text>
      <!-- #ifdef MP-WEIXIN -->
      <view class="flex flex-1 justify-end">
        <button class="cu-btn  light round sm line-white border" @click.stop="getUserProfile">
          <text class="cuIcon-refresh"></text>
          更新头像昵称
        </button>
      </view>
      <!-- #endif -->
    </view>
    <view class="bottom" @click.stop="toCardList">
      我的卡包
    </view>
  </view>
  <view class="user-card" v-else>
    <view class="left" v-if="!hasNotRegInfo">
      <view class="profile-image">
        <image :src="getUserImage()" class="profile-image"></image>
      </view>
      <view class="nick-name">
        <view class="name">
          <text class="margin-right-xs"> {{ userInfo.nick_name || userInfo.name||'微信用户' }}</text>
        </view>
        <view class="text-orange" v-if="config&&config.showSubscribe&&!isAttention" @click="toOfficial(true)">
          点击关注公众号,及时获取消息通知!
        </view>
      </view>
    </view>
    <view class="left" v-else>
      <button class="cu-btn bg-white" @click="toEditUserInfo">点击完善用户信息</button>
    </view>
    <view class="right">
      <!-- #ifdef MP-WEIXIN -->
      <button class="cu-btn  light round sm line-orange border" @click="getUserProfile">
        <text class="cuIcon-refresh"></text>
        更新头像昵称
      </button>
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
  import {
    selectPersonInfo
  } from '@/common/api/login.js'
  export default {
    props: {
      config: {
        type: [Object, String]
      },
      pageItem: Object
    },
    computed: {
      cardStyle() {
        return this.pageItem?.user_card_type
      }
    },
    data() {
      return {
        info: "",
        auditStatus: ''
      }
    },
    created() {
      this.getAuditStatus()
    },
    methods: {
      toEdit() {
        const url =
          `/publicPages/formPage/formPage?type=update&hideChildTable=true&serviceName=srvhealth_person_info_profile_nickname_update&id=${this.userInfo.id}`
        uni.navigateTo({
          url
        })
      },
      toCardList() {
        let url = `/storePages/coupon/coupon?destApp=health&serviceName=srvhealth_store_card_case_select`
        uni.navigateTo({
          url
        })
      },
      getUserProfile(e) {
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
          await self.updateUserInfo(rawData);
          await this.toAddPage()
          selectPersonInfo()
          uni.$emit('userInfoUpdated')
          uni.startPullDownRefresh({

          })
          return
        }
      },
      getAuditStatus() {
        const serviceName = 'srvperson_single_basic_info_select'
        const req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [{
            colName: 'store_user_no',
            ruleType: 'eq',
            value: this.vstoreUser.store_user_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
          },
        }
        const app = 'person'
        const url = this.getServiceUrl(app, serviceName, 'select');
        this.$http.post(url, req).then(res => {
          console.log(res)
          if (res.data.state.length > 0) {
            this.info = res.data.data[0];
            this.auditStatus = this.info?.audit_status
          }
        })
      },

    },
  }
</script>

<style lang="scss" scoped>
  .flex-1 {
    flex: 1;
  }

  .user-card {
    display: flex;
    padding: 10px;

    &.ck {
      min-height: 130px;
      background: linear-gradient(to bottom, #FFEAC6, #FEEED2 80%,#F9F9FA);
      padding: 0 10px;
      .left{
        align-items: center;
      }
    }

    &.card-bag {
      padding: 10px 10px 0;
      border-radius: 0 0 50% 50%/0 0 20px 20px;
      flex-direction: column;
      overflow: hidden;

      .bottom {
        background-color: #B34342;
        width: calc(100% - 40px);
        flex: 1;
        min-height: 50px;
        margin: 0 20px;
        border-radius: 10px 10px 0 0;
        padding: 20px;
        color: #fff
      }
    }

    .top {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 20px;
      color: #fff;
      font-size: 16px;

      .profile-image {
        width: 50px;
        height: 50px;
        border-radius: 50px;
        margin-right: 10px;
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    .left {
      display: flex;

      .profile-image {
        width: 60px;
        height: 60px;
        border-radius: 60px;
      }

      .nick-name {
        margin-left: 10px;
        display: flex;
        justify-content: center;
        flex-direction: column;

        .audit-status {
          width: 60px;
          height: 22px;
        }

        .name {
          margin-bottom: 5px;
          display: flex;
          align-items: center;

        }

        .account {
          color: #666;
        }
      }

      flex: 1;
    }

    .right {
      display: flex;
      align-items: center;

      .cuIcon-message {
        font-size: 24px;
      }
    }
  }
</style>
