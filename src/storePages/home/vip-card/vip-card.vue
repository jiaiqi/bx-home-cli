<template>
  <view class="vip-card" @click="onHandler" v-if="showCard">
    <view class="card-info" v-if="vipCardInfo&&vipCardInfo.id">
      <view class="">
        <view class="">
          我的余额(元)
        </view>
        <view class="amount">
          <text>￥{{vipCardInfo[amountCol]||'0.00'}}</text>
          <text class="text-sm margin-left" v-if="vipCardInfo.card_last_bean">剩余想豆：{{vipCardInfo.card_last_bean||''}}
            <text class="cuIcon-moneybag margin-left-xs"></text> </text>
        </view>

      </view>
      <view class="right-banner" v-if="rightBtn&&rightBtn.url">
        {{rightBtn.text||""}}
      </view>
    </view>
    <view class="not-vip" @click="toOpenVip" v-else-if="showText">
      <view class="">
        <text class="cuIcon-crownfill text-white"></text>
        <text>开通VIP享受更多权益</text>
      </view>
      <button class="cu-btn bg-white round sm">
        立即开通
        <text class="cuIcon-right"></text>
      </button>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      config: {
        type: Object
      },
    },
    computed: {
      rightBtn() {
        return this.detailCfg?.right_btn
      },
      bindUserInfo() {
        return this.vstoreUser
      },
      amountCol() {
        return this.detailCfg?.amountCol || 'card_last_amount'
      },
      detailCfg() {
        return this.moreConfig?.detail_cfg
      },
      moreConfig() {
        return this.config?.more_config
      },
      showCard() {
        return this.vipCardInfo?.id && this.moreConfig?.hide_if_open == true ? false : true
      },
      showText() {
        return this.moreConfig?.show_text !== false
      },
      setStyle() {
        let style = {

        }
        if (this.config?.component_bg_img) {
          style.backgroundImage = `url(${this.getImagePath(this.config?.component_bg_img,true)})`
        }
        return style
      },
    },
    data() {
      return {
        vipCardInfo: {}
      }
    },
    mounted() {
      uni.$on('vipCardChange', () => {
        this.getCard()
      })
    },
    created() {
      if (this.detailCfg?.serviceName) {
        this.getCard()
      }
    },
    methods: {
      onHandler() {
        if (this.vipCardInfo?.id) {
          this.toDetail()
        } else {
          this.toOpenVip()
        }
      },
      toDetail() {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        let url = this.moreConfig?.detailUrl
        if (url) {
          url = this.renderStr(url, this)
          uni.navigateTo({
            url
          })
        }
      },
      onRightBtn() {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        let url = this.rightBtn?.url
        if (url) {
          url = this.renderStr(url, this)
          uni.navigateTo({
            url
          })
        }
      },
      getCard() {
        let condition = this.detailCfg.condition || [];
        if (Array.isArray(condition) && condition.length > 0) {
          condition = this.deepClone(condition)
          condition = condition.map(item => {
            item.value = this.renderStr(item.value, this);
            return item
          })
        }
        const serviceName = this.detailCfg?.serviceName
        const req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": condition,
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
          "query_source": "list_page"
        }
        const app = this.detailCfg?.app || uni.getStorageSync('activeApp')
        const url = this.getServiceUrl(app, serviceName, 'select');

        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.vipCardInfo = res.data.data[0]
          }
        })
      },
      toOpenVip() {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        let url = this.moreConfig?.open_url
        if (url) {
          url = this.renderStr(url, this)
          uni.navigateTo({
            url: url
          });
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  .vip-card {
    background-size: 100% 100%;
    background-repeat: no-repeat;
    min-height: 50px;

    .card-info {
      background-image: url(vip-bg.jpg);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      height: 250rpx;
      padding: 20px;
      margin: 0 10px;
      position: relative;
      color: #fff;
      .amount {
        font-size: 24px;
        padding-top: 10px;
      }

      .right-banner {
        position: absolute;
        top: 60%;
        right: 0;
        border-radius: 50px 0 0 50px;
        background: linear-gradient(152deg, #FFFFFF 0%, #F2E3C0 100%);
        box-shadow: 0px 3px 6px rgba(206, 150, 16, 0.3);

        font-size: 16px;
        font-family: 苹方-简;
        color: #4A3931;
        padding: 5px 20px;
      }
    }

    .not-vip {
      background-color: #e4b963;
      color: #fff;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      padding-left: 10px;
      align-items: center;
      border-radius: 10px;
      margin: 0 10px;
    }
  }
</style>
