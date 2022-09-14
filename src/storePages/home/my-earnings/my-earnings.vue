<template>
  <view class="my-earning" v-if="data">
    <view class="padding-tb-xs ">
      我的收益(元)
    </view>
    <view class="padding-tb-xs text-xxl text-red text-bold">
      {{data.total_commission||'0'}}
    </view>
    <view class="flex">
      <text> 含待结算金额:{{data.wait_settlement||'0'}}</text>
      <text class="cuIcon-question margin-left-xs margin-bottom-xs" @click="showTip" v-if="tipText"></text>
    </view>
    <view class="banner" @click="toList">
      收益明细
    </view>
    <view class="cu-modal" :class="{show:showTipModal}">
      <view class="cu-dialog">
        <view class="content">
          {{tipText}}
        </view>
        <view class="close-icon" @click="showTip()">
          <text class="cuIcon-close"></text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        data: null,
        showTipModal: false
      }
    },
    computed: {
      tipText() {
        return this.pageItem?.tip_text
      }
    },
    props: {
      pageItem: {
        type: Object
      },
    },
    created() {
      this.getData()
    },
    methods: {
      showTip() {
        this.showTipModal = !this.showTipModal
      },
      toList() {
        const frontEndAddress = this.$api.frontEndAddress
        const webUrl = `https://login.100xsys.cn/health/#/pages/h5/earning-list/earning-list`
        const url =
          `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
        uni.navigateTo({
          url
        })
        uni.navigateTo({
          url
        })
      },
      getData() {
        const url = `/health/select/srvhealth_commission_count_select`
        const req = {
          serviceName: 'srvhealth_commission_count_select',
          colNames: ["*"],
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
            this.data = res.data.data[0]
          }
        })
      }
    },
  }
</script>

<style scoped lang="scss">
  .cu-dialog {
    background-color: transparent;

    .content {
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;
      width: 60%;
      margin: 0 auto;
      line-height: 1.7;
    }

    .close-icon {
      margin: 10px auto;
      border-radius: 50px;
      height: 30px;
      width: 30px;
      border: 1px solid #fff;
      color: #fff;
      line-height: 30px;
      text-align: center;
      font-size: 20px;
    }
  }

  .my-earning {
    height: 220rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;

    .banner {
      position: absolute;
      right: 0;
      top: 25%;
      text-align: center;
      background: linear-gradient(to right, #FAA153, #FF414B);
      padding: 5px 15px;
      color: #fff;
      border-radius: 50px 0 0 50px;
    }
  }
</style>
