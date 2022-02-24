<template>
  <view>

    <view class="cu-form-group ">
      <view class="title">旧密码</view>
      <!-- <input placeholder="请输入旧密码" name="input" v-model="pwd"></input> -->
      <u-input v-model="pwd" class="u-input" type="password" placeholder="请输入旧密码" :border="false"
        :password-icon="false" />
    </view>
    <view class="cu-form-group ">
      <view class="title">新密码</view>
      <u-input v-model="newpwd" class="u-input" type="password" placeholder="请输入新密码" :border="false"
        :password-icon="false" />
      <!-- <input placeholder="请输入新密码" name="input" v-model="newpwd"></input> -->
    </view>
    <view class="cu-form-group ">
      <view class="title">确认密码</view>
      <u-input v-model="newpwd1" class="u-input" type="password" placeholder="请确认新密码" :border="false"
        :password-icon="false" />
      <!-- <input placeholder="请确认新密码" name="input" v-model="newpwd1"></input> -->
    </view>
    <view class="cu-form-group ">
      <view class="tip-tip">
        注意：密码为6-20位字符和数字的组合
      </view>
    </view>
    <view class="button-group">
      <button class="cu-btn bg-blue flex1" @click="valid()">完成</button>
      <!-- <button class="cu-btn bg-white" @click="reset()">重置</button> -->
    </view>
  </view>
</template>

<script>
  import api from '@/common/api.js'
  export default {
    data() {
      return {
        pwd: "", //旧密码
        newpwd: '', //新密码
        newpwd1: "", //确认密码
      }
    },
    methods: {
      valid() {
        if (!this.pwd) {
          uni.showToast({
            title: '请输入旧密码',
            icon: 'none'
          })
          return
        }
        if (!this.newpwd) {
          uni.showToast({
            title: '请输入新密码',
            icon: 'none'
          })
          return
        }
        if (this.newpwd && this.newpwd.length < 6) {
          uni.showToast({
            title: '密码长度不能小于6位',
            icon: 'none'
          })
          return
        }
        if (this.newpwd !== this.newpwd1) {
          uni.showToast({
            title: '两次输入的密码不一致',
            icon: 'none'
          })
          return
        }
        this.submit()
      },
      submit() {
        let url = `${api.serverURL}/sso/operate/srvsso_user_pwd_reset`
        let req = [{
          "serviceName": "srvsso_user_pwd_reset",
          "data": [{
            "pwd": this.pwd,
            "newpwd": this.newpwd
          }]
        }]
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            uni.showModal({
              title: '提示',
              content: res.data.resultMessage,
              showCancel: false,
              confirmText: '确认',
              success(res) {
                if (res.confirm) {
                  uni.navigateBack({
                    animationType: 'zoom-fade-in'
                  })
                }
              }
            })
          } else {
            uni.showModal({
              title: '提示',
              content: res.data.resultMessage,
              showCancel: false,
              confirmText: '知道了'
            })
          }
        })
      },
      reset() {
        this.pwd = ''
        this.newpwd = ''
        this.newpwd1 = ''
      },
    }
  }
</script>

<style scoped>
  .u-input{
    flex: 1;
  }
  .tip-tip {
    width: 100%;
    padding: 10px;
    background-color: #fff;
    text-align: center;
    color: #999;
  }

  .cu-form-group .title {
    min-width: 100px;
    text-align: left;
  }

  .button-group {
    display: flex;
    padding: 20px;
    height: 50vh;
    justify-content: center;
    align-items: flex-end;
  }

  .cu-btn {
    min-width: 20%;
  }

  .flex1 {
    width: 60%;
  }

  .flex1.cu-btn {
    margin-right: 10px;
  }
</style>
