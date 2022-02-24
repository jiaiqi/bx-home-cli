<template>
  <view class="cu-modal" @click="hideModal" :class="{ show: modalName === 'setting' }">
    <view class="cu-dialog" @tap.stop>
      <view class="store-user-box" v-if="storeUser">
        <view class="profile-box">
          <view class="user-profile">
            <image :src="storeUser.profile_url" class="user-profile" mode="scaleToFill"></image>
          </view>

          <view class="user-name">{{ storeUser.person_name || storeUser.nick_name || '' }}</view>
          <view class="account-status cu-tag round sm light" :class="{
  						'bg-blue': storeUser.member_status === '正常',
  						'bg-orange': storeUser.member_status === '待审核',
  						'bg-grey': storeUser.member_status === '退出'
  					}">
            {{ storeUser.member_status || '' }}
          </view>
        </view>
        <view class="setting-item">
          <view class="setting-label">接收消息推送设置</view>
          <view class="setting-content">
            <bx-checkbox-group class="form-item-content_value checkbox-group" v-model="push_msg_set" mode="button">
              <bx-checkbox v-for="(item,index) in pushMsgOptions" :key="index" :name="item.value"
                v-model="item.checked">{{ item.label }}</bx-checkbox>
            </bx-checkbox-group>
          </view>
        </view>
        <view class="setting-item" v-if="storeUser && storeUser.member_status === '正常'">
          <view class="setting-label">店铺用户状态设置</view>
          <view class="setting-content">
            <bx-checkbox-group class="form-item-content_value checkbox-group" v-model="member_status" mode="button">
              <bx-checkbox name="退出" :value="member_status == '退出'">退出店铺</bx-checkbox>
            </bx-checkbox-group>
          </view>
        </view>
        <view class="exit-store-user" v-if="storeUser && storeUser.store_user_no">
          <button class="cu-btn bg-grey" @tap="hideModal">取消</button>
          <button class="cu-btn bg-blue margin-right"
            :disabled="push_msg_set == storeUser.push_msg_set && member_status !== '退出'" @click="savePushSet">
            保存设置
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  export default {
    data() {
      return {
        modalName: '',
        push_msg_set:"",
        member_status:""
      }
    },
    mounted() {
      this.push_msg_set = this.storeUser?.push_msg_set
      this.member_status = this.storeUser?.member_status;
    },
    methods: {
      savePushSet() {
        // 保存通知设置
        let data = {
          push_msg_set: this.push_msg_set,
          member_status: this.member_status
        };
        this.$emit('save',data)
        this.hideModal()
        // this.updateStoreUser(data, true);
      },
      hideModal() {
        this.modalName = ''
      },
      showModal() {
        this.modalName = 'setting'
      },
    },
    computed: {
      ...mapState({
        storeUser: state => state.user.storeUserInfo
      }),
      pushMsgOptions() {
        let arr = [{
            label: '群消息',
            value: '群消息',
            checked: false
          },
          {
            label: '群公告所有人',
            value: '群公告所有人',
            checked: false
          },
          {
            label: '客服回复消息',
            value: '客服回复消息',
            checked: false
          },
          {
            label: '预约通知',
            value: '预约通知',
            checked: false
          }
        ];
        arr = arr.map(item => {
          if (this.storeUser?.push_msg_set) {
            let push_msg_set = this.storeUser.push_msg_set;
            if (push_msg_set.indexOf(item.value) !== -1) {
              item.checked = true;
            }
          }
          return item;
        });
        return arr;
      }
    },
  }
</script>

<style scoped lang="scss">
  .store-user-box {
    padding: 20rpx;

    .profile-box {
      display: flex;
      padding: 20rpx;
      align-items: center;

      .user-profile {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        overflow: hidden;
      }

      .user-name {
        font-weight: 700;
        margin-left: 20rpx;
      }

      .account-status {
        padding: 20rpx;
        margin-left: 20rpx;
      }
    }

    .setting-item {
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .setting-content {
        width: 100%;
        border: 1rpx solid #ebebeb;
        border-radius: 20rpx;
      }

      .setting-label {
        position: relative;
        padding-left: 20rpx;
        margin-bottom: 10rpx;

        &::before {
          position: absolute;
          left: 0;
          top: 10%;
          content: '';
          width: 4px;
          height: 80%;
          background-color: #0bc99d;
          border-radius: 10rpx;
        }
      }
    }

    .exit-store-user {
      padding: 20rpx;
      display: flex;
      justify-content: center;

      .cu-btn {
        margin-right: 20rpx;
        min-width: 35%;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
