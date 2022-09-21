<template>
  <view>
    <u-tabs :list="tabs" :is-scroll="true" :current="curTab" @change="changeTab"></u-tabs>
    <view class="coupon-list">
      <radio-group @change="radioChange" style="width: 100%;">
        <view class="coupon-item" v-for="item in list" :key="item.id" :style="[setStyle(item)]"
          @click.stop="clickItem(item)">
          <view class="coupon-item_left">
            <view class="coupon-item-name">
              <text>{{item.card_name||''}}</text>
              <!-- 	<view class="" v-if="mode!=='selector'">
								<button class="cu-btn bg-yellow sm radius margin-left-xs" :data-item="item"
									:open-type="btn.type&&btn.type==='shareCoupon'?'share':''" v-for="btn in buttons"
									:key="btn.name" v-show="isShowBtn(item,btn)"
									@click.stop="onBtnClick(item,btn)">{{btn.name||''}}</button>
							</view> -->
              <!-- <button  open-type="share"
								>赠送</button>
							<button class="cu-btn bg-yellow sm radius margin-left-xs" :data-item="item"
								@click="toActive(item)">激活</button> -->
            </view>
            <view class="coupon-item-validity margin-tb-sm" v-if="item.use_start_date&&item.use_end_date">
              有效期：{{item.use_start_date||''}}至{{item.use_end_date||''}}
            </view>
            <view class="coupon-item-no">
              No.{{item.card_no||''}}
            </view>
          </view>
          <view class="coupon-item_right">
            <view class="num">
              {{getRightTemp(item).value||'-'}}
            </view>
            <view class="label">
              {{getRightTemp(item).label||''}}
            </view>
            <view class="radio-box" v-if="mode==='selector'">
              <radio :value="item.card_no" style="transform: scale(0.8);" :checked="selectedId===item.card_no" />
              <text></text>
            </view>
            <view class="right-top-badge" v-else-if="rightTopBadgeCol&&item[rightTopBadgeCol]">
              {{item[rightTopBadgeCol]}}
            </view>
          </view>
        </view>
        <view class="empty-box" v-if="loadStatus==='noMore'&&list.length==0">
          <u-empty text="列表为空" mode="list"></u-empty>
        </view>
      </radio-group>
    </view>
    <view class="bottom-button" v-if="mode==='selector'">
      <button class="cu-btn bg-blue lg round" @click="confirm" :disabled="!hasChecked">确认</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        serviceName: "",
        app: "",
        pageTitle: "",
        colV2: null,
        tabsCol: {},
        tabs: [],
        curTab: 0,
        page: {
          pageNo: 1,
          total: 0
        },
        list: [],
        mode: '', //'selector'
        condition: [],
        emitId: "",
        selectedId: '',
        loadStatus: 'loading',
        showVerificationCode: '是',
      }
    },
    computed: {
      buttons() {
        return this.tabsConfig?.item_btn || []
      },
      hasChecked() {
        if (Array.isArray(this.list)) {
          return this.list.find(item => item.card_no === this.selectedId)
        }
      },
      rightTopBadgeCol() {
        return this.tabsConfig?.right_top_badge_col
      },
      rightTemp() {
        return this.tabsConfig?.right_temp
      },
      moreConfig() {
        return this.colV2?.moreConfig
      },
      tabsConfig() {
        return this.moreConfig?.tabs_cfg
      }
    },
    methods: {
      isShowBtn(item, btn) {
        if (!btn?.disp_cond) {
          return true
        } else {
          if (Array.isArray(btn?.disp_cond) && btn?.disp_cond.length > 0) {
            let valid = 0;
            btn.disp_cond.forEach(cond => {
              if (cond.ruleType === 'eq') {
                if (item[cond.colName] === cond.value) {
                  valid++
                }
              } else if (cond.ruleType === 'ne') {
                if (item[cond.colName] !== cond.value) {
                  valid++
                }
              }
            })
            if (valid === btn.disp_cond.length) {
              return true
            } else {
              return false
            }
          }
        }
        return true
      },
      onBtnClick(rowData, btn) {
        if (btn?.servcie_type === 'update') {
          let service = btn.service
          let operate_params = btn.operate_params;
          if (operate_params && typeof operate_params === 'object') {
            // 序列化操作参数
            try {
              if (Array.isArray(operate_params?.condition) && operate_params.condition
                .length > 0) {
                operate_params.condition.forEach(cond => {
                  if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
                    cond.value = rowData[cond.value.value_key];
                  } else if (typeof cond.value === 'object' && cond.value.value_type ===
                    'constant') {
                    cond.value = cond.value.value;
                  } else if (typeof cond.value === 'object' && cond.value.value_type ===
                    'globalVariable') {
                    // 全局变量
                    const globalVariable = {
                      data: rowData,
                      storeUser: this.vstoreUser,
                      loginUser: this.vloginUser,
                      userInfo: this.userInfo,
                      storeInfo: this.storeInfo
                    }
                    cond.value = this.renderStr(cond.value.value_key, globalVariable)
                  }
                });
              }
              if (Array.isArray(operate_params?.data) && operate_params.data.length >
                0) {
                operate_params.data.forEach(data => {
                  if (typeof data === 'object') {
                    Object.keys(data).forEach(item => {
                      if (typeof data[item] === 'object' && data[item].value_type ===
                        'rowData') {
                        data[item] = rowData[data[item].value_key];
                      } else if (typeof data[item] === 'object' && data[item]
                        .value_type === 'constant') {
                        data[item] = data[item].value;
                      } else if (typeof data[item] === 'object' && data[item]
                        .value_type ===
                        'globalVariable') {
                        // 全局变量
                        const globalVariable = {
                          storeUser: this.vstoreUser,
                          loginUser: this.vloginUser,
                          userInfo: this.userInfo,
                          storeInfo: this.storeInfo
                        }
                        data[item] = this.renderStr(data[item].value_key,
                          globalVariable)
                      }
                    });
                  }
                });
              }
            } catch (e) {
              //TODO handle the exception
            }

          }
          if (service) {
            let req = [{
              serviceName: service,
              condition: operate_params.condition,
              data: operate_params.data
            }];

            if (!operate_params.data && servcie_type === 'update') {
              uni.showModal({
                title: '提示',
                content: '按钮操作参数配置有误',
                showCancel: false
              })
              return
            }
            let app = this.appName || uni.getStorageSync('activeApp');
            let url = this.getServiceUrl(btn?.app || app, service,
              btn.servcie_type);
            uni.showModal({
              title: '提示',
              content: '是否确认操作?',
              success: (res) => {
                if (res.confirm) {
                  this.$http.post(url, req).then(res => {
                    if (res.data.state === 'SUCCESS') {
                      this.refresh()
                    } else if (res.data.resultMessage) {
                      uni.showModal({
                        title: res.data.resultMessage,
                        showCancel: false
                      })
                    }
                  })
                }
              }
            })
          }
        }
      },
      clickItem(item) {
        if (this.mode === 'selector') {
          this.radioChange({
            detail: {
              value: item.card_no
            }
          })
        } else {
          let style = this.setStyle(item)
          let cond = [{
            colName: 'id',
            value: item.id,
            ruleType: 'eq'
          }]
          let url =
            `./detail?type=detail&serviceName=${this.serviceName}&cond=${JSON.stringify(cond)}&showVerificationCode=${this.showVerificationCode}&appName=health&style=${JSON.stringify(style)}&rightTemp=${JSON.stringify(this.rightTemp)}&rightTopBadgeCol=${this.rightTopBadgeCol}`
          if (Array.isArray(this.buttons) && this.buttons.length > 0) {
            url += `&buttons=${JSON.stringify(this.buttons)}`
          }
          uni.$on('refreshCoupon', () => {
            this.refresh()
          })
          uni.navigateTo({
            url
          })
        }
      },
      radioChange(e) {
        if (this.mode === 'selector') {
          this.selectedId = e.detail.value
        }
      },
      confirm() {
        let cardInfo = this.list.find(item => item.card_no === this.selectedId)
        if (this.emitId) {
          uni.$emit(this.emitId, cardInfo)
          uni.navigateBack({

          })
        }
      },
      getRightTemp(item) {
        let res = {
          label: '',
          value: ''
        }
        const cfg = this.rightTemp;
        if (cfg && typeof cfg === 'object') {
          if (cfg?.relation_col && cfg?.col_map) {
            let val = item[cfg?.relation_col]
            if (cfg?.col_map[val]) {
              res.label = cfg?.col_map[val]?.label
              res.value = item[cfg?.col_map[val]?.col]
              if (res.value === 0) {
                res.value = '0'
              }
            }
          }
        }
        return res
      },
      setStyle(item) {
        let cfg = this.tabsConfig?.item_bg;
        let style = {

        }
        if (cfg?.bg_color) {
          style.background = cfg.bg_color
          // style += `background:${cfg.bg_color};`
        }
        if (cfg?.relation_col) {
          let val = item[cfg?.relation_col];
          if (val && cfg.bg_color_map && cfg.bg_color_map[val]) {
            style.background = cfg.bg_color_map[val]
          }
        }
        if (cfg?.color) {
          style.color = cfg.color
        }
        return style
      },
      changeTab(index) {
        this.curTab = index
        this.page = {
          pageNo: 1,
          total: 0
        }
        this.getList()
      },
      async getList() {
        let serviceName = this.serviceName;
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          "serviceName": "srvhealth_store_card_case_select",
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": this.page.pageNo,
            "rownumber": 20
          },
          "order": [],
        }
        let curTab = this.tabs[this.curTab]
        if (this.mode !== 'selector' && this.tabs.length > 0 && curTab?.value && curTab?.value !==
          '_unlimited_') {
          req.condition.push({
            colName: this.tabsCol.columns,
            ruleType: 'eq',
            value: curTab.value
          })
        }
        if (this.mode != "selector" && Array.isArray(this.tabsConfig?.condition) && this.tabsConfig?.condition
          .length > 0) {
          const data = {
            storeUser: this.vstoreUser,
            storeInfo: this.storeInfo,
            userInfo: this.userInfo
          }
          this.tabsConfig?.condition.forEach(item => {
            item.value = this.renderStr(item.value, data)
            req.condition.push(item)
          })
        }
        if (Array.isArray(this.condition) && this.condition.length > 0) {
          const data = {
            storeUser: this.vstoreUser,
            storeInfo: this.storeInfo,
            userInfo: this.userInfo
          }
          this.condition.forEach(item => {
            // item.value = this.renderStr(item.value, data)
            req.condition.push(item)
          })
        }
        this.loadStatus = 'loading'
        let res = await this.$http.post(url, req)
        this.loadStatus = 'more'
        if (res.data.state === 'SUCCESS') {
          this.list = res.data.data
          this.page = res.data.page
          if (res.data.page?.total > res.data.page?.rownumber * res.data.page?.pageNo) {
            this.loadStatus = 'more'
          } else {
            this.loadStatus = 'noMore'
          }
        }

      },
      async getListV2() {
        let app = this.app || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', 'list', app);
        // colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
        if (!this.pageTitle && colVs?.service_view_name) {
          uni.setNavigationBarTitle({
            title: colVs.service_view_name
          });
        }
        if (!colVs) {
          return
        }
        console.log('colVs', colVs);
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
        }
        this.colV2 = colVs;
        if (this.mode !== 'selector' && colVs.moreConfig?.tabs_cfg?.colName && Array.isArray(colVs.srv_cols)) {
          let tabsCol = colVs.srv_cols.find(item => item.columns === colVs.moreConfig?.tabs_cfg?.colName);
          let tabs = tabsCol?.option_list_v2
          if (Array.isArray(tabs) && tabs.length > 0) {
            this.tabsCol = tabsCol
            tabs = tabs.map(item => {
              item.name = item.label;
              return item
            })
            tabs.unshift({
              name: "全部",
              value: "_unlimited_"
            })
            this.tabs = tabs
          }
        }
        this.getList()
      },
      refresh() {
        this.page.pageNo = 1
        this.getList()
      },
    },

    onLoad(option) {
      if (option.showVerificationCode == '否') {
        this.showVerificationCode = option.showVerificationCode
      }
      if (option.mode) {
        this.mode = option.mode
      }
      if (option.emitId) {
        this.emitId = option.emitId
      }
      if (option.cond) {
        try {
          this.condition = JSON.parse(option.cond)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.pageTitle) {
        this.pageTitle = option.pageTitle
        uni.setNavigationBarTitle({
          title: option.pageTitle
        })
      }
      if (option.app) {
        this.app = option.app
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName;
        this.getListV2()
      }
    },
    onPullDownRefresh() {
      this.refresh()
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
    onReachBottom() {
      if (this.page.pageNo * 20 < this.page.total) {
        this.page.pageNo++;
        this.getList()
      }
    },
    onShareAppMessage(e) {
      let title = `${this.userInfo.name}分享给您一张优惠券，快来打开小程序领取吧！`;
      let storeNo = this.storeInfo?.store_no
      let shareUserNo = this.vstoreUser?.store_user_no;
      let cardNo = ''
      if (e.target?.dataset?.item) {
        let data = e.target?.dataset?.item;
        cardNo = data?.card_no
      }
      // let imageUrl = this.getImagePath(this.storeInfo?.image, true);
      let url =
        `storePages/home/home?store_no=${storeNo}&shareStoreUserNo=${shareUserNo}&cardNo=${cardNo}&invite_user_no=${this.userInfo.userno}`;
      if (cardNo) {
        url += `&share_type=shareCoupon`
      }
      title = this.renderEmoji(title)
      return {
        path: url,
        title: title
      }
    }


  }
</script>

<style lang="scss" scoped>
  .coupon-list {
    padding: 10px;
    min-height: 80vh;

    .empty-box {
      width: 100vw;
      height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .coupon-item {
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    min-height: 100px;
    width: 100%;

    .coupon-item-name {
      font-size: 18px;
      vertical-align: middle;
      margin-bottom: 5px;
      display: flex;
    }

    .coupon-item_right {
      position: relative;
      width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .radio-box {
        position: absolute;
        top: -10px;
        right: -10px;
        // ::v-deep .uni-radio::before, uni-checkbox::before{
        // 	color: transparent!important;
        // }
      }

      .right-top-badge {
        background: rgba(255, 255, 255, 0.3);
        position: absolute;
        top: -20px;
        right: -60px;
        transform: rotate(45deg);
        padding: 20px 40px 5px;
      }

      &::before {
        content: '';
        position: absolute;
        width: 0px;
        height: 80%;
        top: 10%;
        left: 0;
        // background-color: #fff;
        border-left: 1px dashed #fff;
      }

      .num {
        font-size: 26px;
        margin-bottom: 5px;
      }
    }
  }

  .bottom-button {
    text-align: center;
    padding: 20px 0 40px;

    .cu-btn {
      width: 80%;
    }
  }
</style>
