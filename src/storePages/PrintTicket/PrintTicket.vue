<template>
  <view class="page-wrap">
    <view class="ticket-bg">

    </view>
    <!--startprint-->
    <view class="ticket-wrap" v-if="receiptTemp">
      <view class="ticket-title" v-if="receiptTemp.title">
        {{receiptTemp.title||''}}
      </view>
      <view class="ticket-content" v-if="receiptTemp&&receiptTemp.fieldGroup">
        <view class="ticket-content-item" v-for="(item,gIndex) in receiptTemp.fieldGroup" :key="gIndex">
          <view class="" v-if="item.field">
            <view class="field-item" v-for="(field,fIndex) in item.field" :key="fIndex">
              <view class="label margin-right">
                {{field.label||labelMap[field.col]||''}}:
              </view>
              <view class="value">
                {{field.value||detail[field.col]||''}}
              </view>
            </view>
          </view>
        </view>


      </view>
      <!--endprint-->
      <view class="button-box noprint">
        <view class="cu-btn round" @click="cancel">
          取消
        </view>
        <view class="cu-btn bx-bg-coffee round" @click="print">
          打印
        </view>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        appName: "",
        serviceName: "",
        detail: {},
        colV2: null,
        condition: []
      }
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      labelMap() {
        if (Array.isArray(this.colV2?._fieldInfo) && this.colV2?._fieldInfo.length > 0) {
          return this.colV2?._fieldInfo.reduce((res, cur) => {
            res[cur.column] = cur.label;
            return res
          }, {})
        }
      },
      moreConfig() {
        let more_config = this.colV2?.more_config;
        if (more_config) {
          try {
            more_config = JSON.parse(more_config)
            return more_config
          } catch (e) {
            //TODO handle the exception
          }
        }
      },
      receiptTemp() {
        let receiptTemp = this.moreConfig?.receiptTemp || {
          fieldGroup: []
        }
        if (receiptTemp) {
          let data = {
            storeInfo: this.$store?.state?.app?.storeInfo,
            userInfo: this.$store?.state?.user?.userInfo,
            bindUserInfo: this.$store?.state?.user?.storeUserInfo,
          }
          if (receiptTemp.title) {
            receiptTemp.title = this.renderStr(receiptTemp.title, data)
          }
          if (Array.isArray(receiptTemp.fieldGroup) && receiptTemp.fieldGroup.length > 0) {
            receiptTemp.fieldGroup.forEach(group => {
              if (Array.isArray(group.field) && group.field.length > 0) {
                group.field = group.field.map(item => {
                  if (item.col && item.col.indexOf('new Date') !== -1) {
                    item.value = this.dayjs().format("YYYY-MM-DD HH:mm:ss")
                  }
                  return item
                })
              }
            })
          }
        }
        return receiptTemp
      }
    },
    methods: {
      print() {
        // #ifdef H5
        document.execCommand("print")
        // let bdhtml = window.document.body.innerHTML;
        // let sprnstr = "<!--startprint-->";
        // let eprnstr = "<!--endprint-->";
        // let prnhtml = bdhtml.substr(bdhtml.indexOf(sprnstr) + 17);
        // prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr));
        // window.document.body.innerHTML = prnhtml;
        // window.print();
        // #endif
      },
      cancel() {
        uni.navigateBack()
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', 'list', app);
        colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
        console.log('colVs', colVs);
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
            if (colVs.moreConfig?.detailType) {
              if (!this.detailType) {
                this.detailType = colVs.moreConfig?.detailType
              }
            }
            if (colVs.moreConfig?.formButtonDisp && !this.formButtonDisp) {
              this.formButtonDisp = colVs.moreConfig?.formButtonDisp
            }
            if (colVs.moreConfig?.rowButtonDisp && !this.rowButtonDisp) {
              this.rowButtonDisp = colVs.moreConfig?.rowButtonDisp
            }
            if (colVs.moreConfig?.gridButtonDisp && !this.gridButtonDisp) {
              this.gridButtonDisp = colVs.moreConfig?.gridButtonDisp
            }
            if (colVs.moreConfig?.customDetailUrl) {
              if (!this.customDetailUrl) {
                this.customDetailUrl = colVs.moreConfig?.customDetailUrl
              }
            }
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
        }
        this.colV2 = colVs;
        return colVs;
      },
      getData() {
        let app = this.appName
        let serviceName = this.serviceName
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          "serviceName": serviceName,
          "colNames": ["*"],
          "condition": [
            //   {
            //   "colName": "item_no",
            //   "ruleType": "eq",
            //   "value": "BX2110151616220057"
            // },
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        if (this.condition && typeof this.condition === 'string') {
          let data = {
            storeInfo: this.$store?.state?.app?.storeInfo,
            userInfo: this.$store?.state?.user?.userInfo,
            bindUserInfo: this.$store?.state?.user?.storeUserInfo,
          }
          this.condition = this.renderStr(this.condition, data)
          try {
            this.condition = JSON.parse(this.condition)
          } catch (e) {
            //TODO handle the exception
          }
          if (Array.isArray(this.condition)) {
            req.condition = this.condition
          }
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state == 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.detail = res.data.data[0]
          }
        })
      },
    },

    onLoad(option) {
      if (option.condition) {
        this.condition = option.condition
      }
      if (this.theme === 'coffee') {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#BFA58B'
        })
      }

      if (option.appName) {
        this.appName = option.appName
      }
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (this.appName && this.serviceName) {
        this.getListV2().then(_ => {
          this.getData()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/common/theme/theme.scss";

  .page-wrap {
    min-height: calc(100vh - var(--window-top));
    display: flex;
    flex-direction: column;
  }

  .ticket-bg {
    background-color: $bx-color-primary;
    padding-top: 25px;
  }

  .ticket-wrap {
    position: relative;
    top: -20px;
    background-color: #F8F8FA;
    padding: 20px 40rpx;
    border-radius: 20px 20px 0 0;
    font-family: 苹方-简;
    flex: 1;

    .ticket-title {
      padding: 10px 0;
      max-width: 350px;
      margin: 0 auto;
      font-size: 16px;
      font-weight: normal;
      color: #474849;
    }

    .ticket-content {
      max-width: 350px;
      margin: 0 auto;
      padding: 10px;
      background-color: #fff;
      border-radius: 8px 8px 0 0;

      .ticket-content-item {
        position: relative;
        padding: 5px 0;
        border-bottom: 1px dashed #B8BAC0;

        &:last-child {
          border: none;
        }

        .field-item {
          font-size: 14px;
          color: #474D59;
          display: flex;
          line-height: 30px;
        }
      }
    }

    .button-box {
      padding: 0 0 20px;
      background-color: #fff;
      border-radius: 0 0 8px 8px;

      .cu-btn {
        width: 45%;
        height: 40px;
        font-size: 16px;
      }
    }
  }

  @media print {
    .noprint {
      max-width: 350px;
      display: none;
    }

    .uni-page-head {
      display: none;
    }
  }
</style>
