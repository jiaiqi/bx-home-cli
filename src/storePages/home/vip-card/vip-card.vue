<template>
  <view class="vip-card" @click="onHandler" v-if="showCard" :style="[setStyle]">

    <view class="content-text" v-if="moreConfig&&moreConfig.content_text"><text class="margin-right-xs"
        :class="'cuIcon-'+moreConfig.content_icon" v-if="moreConfig.content_icon"></text> {{moreConfig.content_text}}
    </view>
    <view class="card-info" v-else-if="info&&info.card_no">
      <view class="" style="display: flex;align-items: center;">
        <view class="margin-right" style="margin-right: 30px;">
          <view class="">
            我的余额(元)
          </view>
          <view class="amount">
            <text>￥{{info[amountCol]||'0.00'}}</text>
            <!-- <text class="text-sm margin-left" v-if="info.card_last_bean">剩余想豆：{{info.card_last_bean||''}}
              <text class="cuIcon-moneybag margin-left-xs"></text> </text> -->
          </view>
        </view>
        <view class="" v-if="info.card_last_bean">
          <view class="">
            我的想豆
          </view>
          <view class="amount">
            {{info.card_last_bean||''}}
          </view>
        </view>
      </view>
      <view class="right-banner" v-if="rightBtn&&rightBtn.url">
        {{rightBtn.text||""}}
      </view>
    </view>
    <view class="not-vip" v-else-if="showText">
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
      vipCardInfo() {
        return this.info || {}
      },
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
        if (this.moreConfig?.hide_if_nodata == true && !this.info?.id) {
          return false
        }
        return this.info?.id && this.moreConfig?.hide_if_open == true ? false : true
      },
      showText() {
        return this.moreConfig?.show_text !== false
      },
      setStyle() {
        let style = {}
        if (this.config?.component_bg_img) {
          style.backgroundImage = `url(${this.getImagePath(this.config?.component_bg_img,true)})`
        }
        if (this.moreConfig?.content_style) {
          style.borderRadius = this.moreConfig?.content_style?.radius
          style.color = this.moreConfig?.content_style?.color
          style.minHeight = this.moreConfig?.content_style?.height
        }
        return style
      },
    },
    data() {
      return {
        info: {}
      }
    },
    mounted() {
      uni.$on('vipCardChange', () => {
        this.getCard()
      })
      uni.$on('updateUnread', e => {
        // 已读状态更新
        if (['srvhealth_dialogue_session_select', 'srvhealth_group_circle_select'].includes(this.detailCfg
            ?.serviceName)) {
          this.getCard()
        }
      });
    },
    created() {
      if (this.detailCfg?.serviceName) {
        this.getCard()
      }
    },
    methods: {
      async onHandler() {
        let res = await this.handlerBeforeNav()
        if (res === false) {
          return
        } else {
          if (this.info?.id) {
            this.toDetail()
          } else {
            this.toOpenVip()
          }
        }
      },
      async toDetail() {
        await this.checkUserInfo()
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        let url = this.moreConfig?.detailUrl || this.moreConfig?.detail_url
        if (url) {
          let data = {
            data: this.info,
            info: this.info,
            ...this.globalVariable
          }
          url = this.renderStr(url, this)
          uni.navigateTo({
            url
          })
        }
      },
      async handlerBeforeNav() {
        if (this.moreConfig?.before_nav_handler) {
          let handler = this.moreConfig?.before_nav_handler;
          let varData = {
            userInfo: this.userInfo,
            storeInfo: this.storeInfo,
            bindUserInfo: this.vstoreUser,
            storeUser: this.vstoreUser,
          }
          if (Array.isArray(handler) && handler.length > 0) {
            let num = 0;
            for (let item of handler) {
              if (['data-empty', 'no-repeat'].includes(item.type)) {
                const service = item.service
                let condition = []
                if (Array.isArray(item.condition)) {
                  condition = item.condition.map(cond => {
                    let obj = {
                      colName: cond.colName,
                      ruleType: cond.ruleType,
                      value: ''
                    }
                    if (cond?.value && cond?.value.indexOf('${') !== -1) {
                      obj.value = this.renderStr(cond?.value, varData)
                    } else if (cond?.value?.value_type === 'constant') {
                      obj.value = cond?.value
                    }
                    return obj
                  })
                }
                const appName = item?.app || uni.getStorageSync('activeApp')
                let url = this.getServiceUrl(appName, service, 'select');
                let req = {
                  "serviceName": service,
                  "condition": condition,
                  colNames: ['*'],
                  page: {
                    pageNo: 1,
                    rownumber: 1
                  }
                }
                let res = await this.$http.post(url, req)
                if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
                  let noPass = false
                  if (item.type === 'no-repeat') {
                    if (res.data.data.length > 0) {
                      num++
                      noPass = true
                    } else {
                      noPass = false
                    }
                  } else {
                    if (res.data.data.length <= 0) {
                      num++
                      noPass = true
                    }
                  }
                  if (noPass && item.fail_tip) {
                    uni.showModal({
                      title: '提示',
                      content: item?.fail_tip,
                      showCancel: false
                    })
                  } else {
                    return true
                  }
                }
              } else if (item.type === 'followOfficial') {
                if (num > 0) {
                  return false
                }
                // 检查是否关注公众号
                let res = await this.checkSubscribeStatus()
                if (!res) {
                  num++
                  let confirm = await new Promise((resolve) => {
                    uni.showModal({
                      title: '提示',
                      content: item?.fail_tip || '请先关注百想助理公众号，以便及时收到新消息通知',
                      confirmText: '去关注',
                      success: (res) => {
                        if (res.confirm) {
                          resolve(true)
                        } else {
                          resolve(false)
                        }
                      }
                    })
                  })
                  if (confirm === true) {
                    this.toOfficial()
                  }
                }
              }
            }
            if (num > 0) {
              return false
            }
          }
        } else {
          return true
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
        // if(serviceName==='srvhealth_store_card_case_select'){
        //   this.info = this.vvipCard
        //   return
        // }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.info = res.data.data[0]
          } else {
            this.info = null
          }
        })
      },
      async toOpenVip() {
        await this.checkUserInfo()
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        let url = this.moreConfig?.open_url
        if (url) {
          url = this.renderStr(url, this)
          debugger
          if (url && url.indexOf('https') == 0) {
            url = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(url)}`
          }
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

    .content-text {
      display: flex;
      align-items: center;
      padding: 10px;
    }

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
        height: 40px;
        line-height: 40px;
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
