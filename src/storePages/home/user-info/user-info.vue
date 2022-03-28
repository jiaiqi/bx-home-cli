<template>
  <view class="user-card">
    <view class="left" v-if="!hasNotRegInfo">
      <view class="profile-image">
        <!-- <open-data type="userAvatarUrl"></open-data> -->
        <image :src="getImagePath(userInfo.profile_url, true)" class="profile-image"></image>
      </view>
      <view class="nick-name">
        <!-- <open-data type="userNickName"></open-data> -->
        <view class="name">
          <text class="margin-right-xs"> {{ userInfo.nick_name || userInfo.name }}</text>
          <image src="./on_audit.png" mode="" class="audit-status" v-if="auditStatus&&auditStatus!=='通过'"></image>
          <image src="./has_audit.png" mode="" class="audit-status" v-else-if="auditStatus==='通过'"></image>
          <image src="./answer.png" mode="" class="audit-status" v-else></image>
        </view>
        <!-- <view class="account">账号：{{ userInfo.userno }}</view> -->
        <view class="text-orange" v-if="config&&config.showSubscribe&&!isAttention" @click="toOfficial(true)">
          点击关注公众号,及时获取消息通知!
        </view>

      </view>
    </view>
    <view class="left" v-else>
      <button class="cu-btn bg-white" @click="toLogin">请点击登录</button>
    </view>
    <view class="right"><text class="cuIcon-message"></text></view>
  </view>
</template>

<script>
  export default {
    props: {
      config: {
        type: [Object, String]
      },
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
            this.auditStatus = this.info.audit_status
          }
        })
      },
      toLogin() {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
        }
      }
    },
  }
</script>

<style lang="scss" scoped>
  .user-card {
    display: flex;
    padding: 10px;

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
