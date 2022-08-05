<template>
  <view class="form-wrap"
    :class="['theme-'+theme,{'no-padding':srvType==='detail'&&view_cfg&&view_cfg.title,'step-mode':stepMode,'order-mode':orderMode}]">
    <!-- #ifdef MP-WEIXIN -->
    <cu-custom-navbar :isBack="true" :back-home="showBackHome" :custom-store-no="setStoreNo">
      <view class="nav-bar">
        <text class="home-name">
          <text>{{pageTitle||''}}</text>
        </text>
      </view>
    </cu-custom-navbar>
    <!-- #endif -->
    <view class="custom-view bg-blue" :style="{'background-color':view_cfg.bg}"
      v-if="srvType==='detail'&&view_cfg&&view_cfg.title">
      <view class="icon">
        <text class="cuIcon-check text-blue" :style="{'color':view_cfg.bg}"></text>
      </view>
      <view class="content">
        <view class="title">
          {{view_cfg.title}}
        </view>
        <view class="tip">
          {{view_cfg.tip||''}}
        </view>
      </view>
    </view>
    <view class="form-content">
      <view class="main-form-edit" v-show="!stepMode||(stepMode&&curStep=='main')">
        <a-form :class="{'pc-model':model==='PC'}" v-if="isArray(fields)&&fields.length>0" :fields="fields"
          :moreConfig="moreConfig" :srvApp="appName" :pageType="srvType" :formType="use_type" ref="bxForm"
          :mainData="mainData" @value-blur="valueChange" @setColData="setColData">
        </a-form>
      </view>

      <view class="" v-if="hideChildTable">

      </view>
      <view class="child-service-box step-mode" v-show="stepMode&&curStep=='child'" v-else-if="stepMode">
        <view class="change-child">
          <bx-radio-group class="form-item-content_value radio-group" mode="button" v-model="curChild"
            @change="radioChange">
            <bx-radio class="radio" color="#10c0a8" :key="item.constraint_name" v-for="item in childServiceRadioOption"
              :name="item.constraint_name">
              {{ item.label }}
            </bx-radio>
          </bx-radio-group>
        </view>

        <view class="child-service" v-for="(item,index) in childServiceRadioOption" :key="index">
          <child-list v-show="curChild===item.constraint_name" :config="item" :childListData="childListData"
            :disabled="disabled || disabledChildButton" :appName="appName" :main-data="mainData"
            :fkInitVal="fkInitVal[item.constraint_name||item.key_no]"
            :fkCondition="fkCondition[item.constraint_name||item.key_no]" ref="childList" @onButton="onChildButton"
            @child-list-change="childListChange">
          </child-list>
        </view>
      </view>

      <view class="child-service-box" :class="{'pc-model':model==='PC'}"
        v-else-if="colsV2Data && isArray(fields)&&fields.length>0">
        <view class="child-service" v-for="(item,index) in childService" :key="index">
          <child-list :config="item" :childListData="childListData" :disabled="disabled || disabledChildButton"
            :appName="appName" :main-data="mainData" :fkInitVal="fkInitVal[item.constraint_name]"
            :fkCondition="fkCondition[item.constraint_name]" ref="childList" @onButton="onChildButton"
            @child-list-change="childListChange">
          </child-list>
        </view>
      </view>

    </view>
    <view class="handler-bar cu-bar" v-if="orderMode">
      <view class="left-text" v-if="leftText">
        <text class="margin-right-xs"
          v-if="leftText.col&&mainData&&mainData[leftText.col]">{{leftText.label||''}}</text>
        <text v-if="leftText.col&&mainData&&mainData[leftText.col]">{{mainData[leftText.col]}}</text>
      </view>
      <view class="" v-else>

      </view>
      <debounce-view @onThrottle="onButton(rightBtn,'handler')" type="throttle" v-if="rightBtn">
        <button class="cu-btn bg-blue">{{rightBtn.label||''}}</button>
      </debounce-view>
    </view>
    <view class="button-box" v-if="!orderMode&&!loading&&srvType==='detail'&&view_cfg&&isArray(view_cfg.bottomBtn)">
      <button class="cu-btn bg-blue round lg bx-btn-bg-color" v-for="(btn, btnIndex) in view_cfg.bottomBtn"
        :key='btnIndex' :open-type="btn.type" :data-btn="btn" :data-shareurl="btn.shareUrl" :style="[btn.style]"
        @click="onButton(btn)">
        {{ btn.button_name}}
      </button>
      <!--      <debounce-view @onThrottle="onButton(rightBtn,'handler')" type="throttle" :key='btnIndex'
        v-for="(btn, btnIndex) in view_cfg.bottomBtn">
        <button class="cu-btn bg-blue round lg bx-btn-bg-color" :open-type="btn.type" :data-btn="btn"
          :data-shareurl="btn.shareUrl" :style="[btn.style]">{{ btn.button_name}}</button>
      </debounce-view> -->
    </view>
    <view class="button-box" v-else-if="!orderMode&&!loading&&stepMode&&childService&&childService.length>0">
      <button class="cu-btn bg-cyan lg round " @click="changeStep('child')" v-if="curStep==='main'">下一步</button>
      <button class="cu-btn line-cyan lg round flex-half" @click="changeStep('main')"
        v-if="curStep==='child'">上一步</button>
      <debounce-view style="min-width: calc(60% - 10px);" v-for="(btn, btnIndex) in formButtons" :key="btnIndex"
        @onThrottle="onButton(btn)" type="throttle">
        <button style="width: 100%;" class="cu-btn  bg-cyan round lg  "
          v-if="curStep==='child'&&isArray(fields) && fields.length > 0">
          {{ btn.button_name }}
        </button>
      </debounce-view>
    </view>
    <view class="button-box" v-else-if="!orderMode&&!loading&&!stepMode&&colsV2Data&&!disabled">
      <debounce-view style="width: 100%;text-align: center;" v-for="(btn, btnIndex) in formButtons" :key="btnIndex"
        type="throttle" @onThrottle="onButton(btn)">
        <button class="cu-btn bg-orange round lg bx-btn-bg-color"
          v-if="isArray(fields) && fields.length > 0&&btn.isShow!==false">
          {{ btn.button_name }}
        </button>
      </debounce-view>
    </view>

    <view class="loading-box" v-if="loading">
      <u-loading mode="flower" size="80" :show="loading"></u-loading>
    </view>
    <view class="cu-modal bottom-modal" :class="{ show: modalName === 'showQrCode' }" @click="hideModal">
      <view class="cu-dialog " @click.stop="">
        <view class="qrcode-box">
          <!-- <view class="title">我的推广码</view> -->
          <image :src="qrcodePath" mode="aspectFit" class="qr-code-image" show-menu-by-longpress
            v-if="storeInfo && qrcodePath" @click="toPreviewImage(qrcodePath)" :show-menu-by-longpress="true"></image>
          <view class="qr-code-image" v-else @click="makeQrCode"><text class="cuIcon-refresh"></text></view>
          <!-- <view class="store-name">{{ setStoreInfo.name || '' }}</view> -->
          <view class="store-name">长按保存图片</view>
        </view>
        <view class="button-box"><button @click.stop="hideModal()" class="cu-btn">关闭</button></view>
        <view class="qrcodeCanvas-box" v-if="modalName === 'showQrCode' && qrCodeText">
          <uni-qrcode cid="qrcodeCanvas" style="width: 100px;height: 100px;" :text="qrCodeText" :size="codeSize"
            class="qrcode-canvas" foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete"
            ref="qrcodeCanvas">
          </uni-qrcode>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  const dayjs = require('dayjs');
  import ChildList from '@/publicPages/components/child-list/child-list.vue'
  let _childData = {}
  export default {
    components: {
      ChildList
    },
    data() {
      return {
        disabledBack: false,
        backUrl: "",
        appName: null,
        service: "",
        serviceName: null,
        srvType: 'add', // 表单信息 add | update  | select |list | detail
        use_type: 'add', // detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update
        condition: [],
        addV2: null,
        updateV2: null,
        detailV2: null,
        fields: null,
        mainData: null,
        hideColumn: [], //不显示的字段
        fieldsCond: [],
        modalName: null, //operateModal
        orderCols: [],
        currentFormV2: null, //子表v2
        currentFormFields: [], //子表字段
        currentFormFk: null,
        isOnButton: false,
        disabled: false,
        childListData: {},
        disabledChildButton: false, // 禁用子表按钮
        disabledChildPublicButton: false, // 禁用子表的添加、编辑操作并隐藏对应按钮
        afterSubmit: "",
        params: {},
        view_cfg: null,
        stepMode: false, //分步模式，第一步填主表，第二步填子表
        orderMode: false, //订单模式
        curStep: 'main',
        curChild: '',
        loading: false,
        hideChildTable: false, // 隐藏子表
        leftText: null,
        rightBtn: null,
        uuid: null,
        qrCodeText: "",
        codeSize: uni.upx2px(750),
        qrcodePath: "",
        pageTitle: ""
      }
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      model() {
        return getApp()?.globalData?.systemInfo?.model
      },
      formButtons() {
        let buttons = []
        if (Array.isArray(this.colsV2Data?._formButtons)) {
          buttons = this.colsV2Data?._formButtons
          if (Array.isArray(this.mainData?._buttons) && this.mainData?._buttons.length === buttons.length) {
            buttons = buttons.filter((item, index) => this.mainData?._buttons[index] === 1)
          }
          return buttons.map(item => {
            item.isShow = true
            if (this.moreConfig?.formButtonDisp && item?.button_type && this.moreConfig?.formButtonDisp[item
                .button_type] ===
              false) {
              item.isShow = false
            }
            return item
          })
        }
      },
      appTempColMap() {
        // 字段关系映射
        if (this.moreConfig?.appTempColMap) {
          return this.moreConfig?.appTempColMap
        }
      },
      labelMap() {
        // 字段对应的label
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          return this.orderCols.reduce((res, cur) => {
            res[cur.columns] = cur.label
            return res
          }, {})
        } else {
          return {}
        }
      },
      fkInitVal() {
        return this.moreConfig?.fk_init_val || {}
      },
      fkCondition() {
        let fk_condition = this.moreConfig?.fk_condition || {}
        return fk_condition
      },
      moreConfig() {
        return this.colsV2Data?.moreConfig || {}
      },
      colsV2Data() {
        if (this.srvType) {
          return this[`${this.srvType}V2`]
        }
        return {}
      },
      childServiceRadioOption() {
        if (Array.isArray(this.childService) && this.childService.length > 0) {
          return this.childService.filter(item => item.constraint_name)
        } else {
          return []
        }
      },
      fkConfig() {
        return this.moreConfig?.fk_config
      },
      childService() {
        let result = []
        if (['update', 'add'].includes(this.srvType)) {
          result = this.operateChildService && this.operateChildService.length > 0 ? this.operateChildService : this
            .detailChildService
        } else {
          result = this.detailChildService
        }
        if (Array.isArray(result)) {
          return result.map(item => {
            if (item?.foreign_key?.constraint_name) {
              item.constraint_name = item?.foreign_key?.constraint_name
            }
            if (item?.foreign_key?.section_name) {
              item.label = item.foreign_key.section_name
            }
            if (item?.foreign_key?.more_config) {
              try {
                item.foreign_key.moreConfig = JSON.parse(item.foreign_key.more_config)
              } catch (e) {

              }
            }
            return item
          }).filter((item, index) => {

            if (this.fkConfig?.hide && item?.foreign_key?.constraint_name) {
              if (this.fkConfig.hide.indexOf(item?.foreign_key?.constraint_name) !== -1) {
                return false
              }
            }

            if (Array.isArray(this.mainData?._child_tables) && result.length === this.mainData
              ._child_tables.length) {
              if (this.mainData._child_tables[index] === 0) {
                return false
              }
            }
            return true
          })
        }
        return result
      },
      operateChildService() {
        return this.detailV2?.child_service.filter(item => {
          if (item.foreign_key?.foreign_key_type === '主子表') {
            if (this.use_type === 'update') {
              item.use_type = 'updatechildlist'
            } else if (this.use_type === 'add') {
              item.use_type = 'addchildlist'
            }
            return true
          }
        })
      },
      detailChildService() {
        return this.detailV2?.child_service.filter(item => {
          // return item.foreign_key?.foreign_key_type === '字段引用'
          return item.foreign_key?.foreign_key_type !== '主子表'
        })
      },

    },
    methods: {
      isShowBtn(e) {
        if (this.moreConfig?.formButtonDisp && e.button_type && this.moreConfig?.formButtonDisp[e.button_type] ===
          false) {
          return false
        }
        return true
      },
      radioChange(e) {
        this.curChild = e
      },
      changeStep(e) {
        if (e == 'child') {
          let req = this.$refs.bxForm.getFieldModel();
          if (req === false) {
            return
          }
        }
        this.curStep = e
      },
      getChildListData() {
        return this.childListData
      },
      childListChange(e) {
        let self = this
        // let _childData = {}
        if (e?.key && e?.data) {
          if (_childData) {
            _childData[e.key] = e.data
            if (Array.isArray(e?.calcRelations) && e.calcRelations.length > 0) {
              e.calcRelations.forEach(relation => {
                let table_col = relation.table_col; // 存储字段
                let relation_table_col = relation.relation_table_col //源字段

                if (_childData && _childData[relation.constraint_name]) {
                  let result = _childData[relation.constraint_name].map(item => item[
                    relation_table_col]).reduce((
                    res, cur) => {
                    if (cur) {
                      res = (res * 1000 + cur * 1000) / 1000;
                    }
                    return res
                  }, 0)
                  this.fields = this.fields.map(item => {
                    if (item.column === table_col) {
                      item.value = result || 0
                    }
                    return item
                  })
                }
              })
            }
            this.childListData = _childData
          }
        }
      },
      setColData(e) {
        if (this.mainData) {
          if (!this.mainData?.colData) {
            this.mainData.colData = {}
          }
          this.mainData.colData[e.column] = e.colData
        }
      },
      onChildButton(e) {
        if (e?.btn?.button_type === 'add') {
          // 添加子表数据
          this.currentFormFk = e?.foreignKey
          if (e?.v2Data?.service_name) {
            this.currentFormV2 = e?.v2Data
            if (Array.isArray(e.v2Data?._fieldInfo)) {
              this.currentFormFields = e.v2Data._fieldInfo.map(item => {
                if (item.defaultValue) {
                  item.value = item.defaultValue
                }
                if (item.in_add === 1) {
                  item.display = true
                }
                if (item.columns === this.currentFormFk?.referenced_column_name) {
                  item.display = false
                }
                return item
              })
            }
            this.modalName = 'addChildData'
          }
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
        this.$emit('getQrcode', e);
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make();
        }
      },
      async onButton(e, btnTarget) {
        // this.isOnButton = true
        if (!e) {
          return;
        }
        const self = this
        if (btnTarget === 'handler') {
          if (e?.type) {
            e = this.formButtons.find(item => item.button_type && item.button_type == e.type)
            if (!e) {
              return
            }
          }
        }
        const globalData = {
          data: this.mainData || {},
          storeInfo: self.storeInfo,
          userInfo: self.userInfo,
          storeUser: self.vstoreUser
        }

        if (e.type === 'navToList') {

          let url =
            `/publicPages/list2/list2?destApp=${e.app||this.appName}&serviceName=${e.service||this.serviceName}`
          if (e.cond) {
            const cond = e.cond.map(item => {
              item.value = this.renderStr(item.value, globalData)
              return item
            })
            url += `&cond=${JSON.stringify(cond)}`
          }
          if (e.disabled) {
            url += `&disabled=true`
          }
          uni.navigateTo({
            url
          })
          return
        } else if (e?.type === 'showQrcode') {
          if (e.qrcode_content) {
            this.qrCodeText = this.renderStr(e.qrcode_content, globalData)
            this.modalName = 'showQrCode'
            this.makeQrCode()
          }
          return
        }

        let req = this.$refs.bxForm.getFieldModel();
        for (let key in req) {
          if (Array.isArray(req[key])) {
            req[key] = req[key].toString();
          }
        }
        switch (e.button_type) {
          case 'edit':
            if (e.page_type === '详情' && this.use_type === 'detail') {
              this.toPages('update', e);
              this.isOnButton = false;
            } else {
              let data = this.deepClone(req);
              data.child_data_list = []
              console.log(this.childService)
              if (Array.isArray(this.childService) && this.childService.length > 0 && !this.hideChildTable) {
                this.childService.forEach((item, index) => {
                  let child_data = this.$refs.childList[index].getChildDataList()
                  data.child_data_list.push(...child_data)
                  // data.child_data_list.push(this.$refs.childList[index].getChildDataList())
                })
              }
              if (req) {
                let reqData = [{
                  serviceName: e.service_name,
                  data: [data],
                  condition: this.condition
                }];
                if (self?.params?.defaultVal?.id) {
                  reqData[0].condition = [{
                    colName: 'id',
                    ruleType: 'eq',
                    value: self.params.defaultVal.id
                  }];
                } else if (self?.mainData?.id) {
                  reqData[0].condition = [{
                    colName: 'id',
                    ruleType: 'eq',
                    value: self.mainData.id
                  }];
                }
                let app = self.appName || uni.getStorageSync('activeApp');
                let url = self.getServiceUrl(app, e.service_name, 'add');
                if (!Array.isArray(reqData[0].condition) || reqData[0].condition.length === 0) {
                  uni.showToast({
                    title: '参数错误，请刷新重试',
                    icon: 'none'
                  });
                  return;
                }

                uni.showLoading()

                let res = await this.onRequest('update', e.service_name, reqData, app);
                uni.hideLoading()

                let service = e.service_name.slice(0, e.service_name.lastIndexOf('_'))
                if (res.data.state === 'SUCCESS') {
                  uni.$emit('dataChange', e.service_name)
                  if ('srvhealth_person_info_profile_nickname_update'.indexOf(service) > -1 ||
                    'srvhealth_person_profile_nickname_update'.indexOf(service) > -1) {
                    self.initApp()
                  }
                  if (
                    Array.isArray(res.data.response) &&
                    res.data.response.length > 0 &&
                    res.data.response[0].response &&
                    Array.isArray(res.data.response[0].response.effect_data) &&
                    res.data.response[0].response.effect_data.length > 0
                  ) {
                    this.params.submitData = res.data.response[0].response.effect_data[0];
                  }
                  let resData = res.data
                  uni.showModal({
                    title: '提示',
                    content: `${res.data.resultMessage}`,
                    showCancel: false,
                    success(res) {
                      let beforeRedirectUrl = getApp().globalData.beforeRedirectUrl
                      if (self.afterSubmit === 'home') {
                        getApp().globalData.beforeRedirectUrl = null
                        let store_no = self.$store?.state?.app?.storeInfo?.store_no
                        let url = self.backUrl || `/storePages/home/home?store_no=${store_no}`
                        uni.reLaunch({
                          url,
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        })
                        return
                      } else if (self.afterSubmit === 'detail') {
                        self.toPages('detail');
                        return
                      } else if (beforeRedirectUrl) {
                        debugger
                        uni.redirectTo({
                          url: beforeRedirectUrl,
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        })
                        getApp().globalData.beforeRedirectUrl = null
                        return
                      }
                      if (self.shareType && self.shareType === 'seeDoctor') {
                        // 通过邀请就诊登记链接进入 跳转到就诊信息登记页面
                        let fieldsCond = [{
                          column: 'user_info_no',
                          display: false
                        }, {
                          column: 'user_no',
                          display: false
                        }];
                        if (self.doctorInfo && self.doctorInfo.no) {
                          fieldsCond.push({
                            column: 'doctor_no',
                            display: false,
                            value: self.doctorInfo.no
                          }, {
                            column: 'doctor_name',
                            display: false,
                            value: self.doctorInfo.name
                          });
                          if (self.doctorInfo.store_no) {
                            fieldsCond.push({
                              column: 'store_no',
                              display: false,
                              value: self.doctorInfo.store_no
                            });
                          }
                        }
                        let path =
                          '/publicPages/formPage/formPage?share_type=seeDoctor&serviceName=srvhealth_see_doctor_record_add&type=add&fieldsCond=' +
                          encodeURIComponent(JSON.stringify(fieldsCond));
                        uni.redirectTo({
                          url: path,
                          success: () => {
                            if (self.uuid) {
                              debugger
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        });
                      } else if (self.afterSubmit === 'back') {
                        if (self.submitAction) {
                          uni.$emit(self.submitAction)
                        }
                        debugger
                        uni.navigateBack({
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          },
                          fail: () => {
                            if(self.backUrl){
                              uni.redirectTo({
                                url:self.backUrl,
                                success: () => {
                                  uni.$emit('onBack', {
                                    uuid: self.uuid,
                                    service: service
                                  })
                                }
                              })
                            }
                          }
                        })
                      } else if (self.afterSubmit === 'close') {
                        if (top.window?.tab?.closeCurrentTab && top?.window?.tab
                          ?.getCurrentTab) {
                          let curTab = top.window?.tab.getCurrentTab();
                          console.log(curTab, '：-----》curTab')
                          if (curTab) {
                            top.window?.tab.closeCurrentTab(curTab)
                            return
                          }
                        }
                      } else if (self.afterSubmit === 'detail') {
                        self.toPages('detail');
                        return
                      } else if (self.afterSubmit === 'home') {
                        let store_no = this.$store?.state?.app?.storeInfo?.store_no
                        debugger
                        uni.reLaunch({
                          url: `/storePages/home/home?store_no=${store_no}`,
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        })
                      } else {
                        let pages = getCurrentPages();
                        if (pages.length > 1) {
                          debugger
                          uni.navigateBack({
                            success: () => {
                              if (self.uuid) {
                                uni.$emit('onBack', {
                                  uuid: self.uuid,
                                  service: service
                                })
                              }
                            }
                          })
                        } else {
                          debugger
                          let data = resData.response[0]?.response.effect_data[0]
                          uni.redirectTo({
                            url: `/publicPages/detail/detail?serviceName=${self?.addV2?.select_service_name||self.detailV2?.service_name}&destApp=${self.appName||self.destApp}&id=${data.id}`,
                            success: () => {
                              if (self.uuid) {
                                uni.$emit('onBack', {
                                  uuid: self.uuid,
                                  service: service
                                })
                              }
                            }
                          })
                        }
                      }
                    }
                  });
                } else {
                  uni.showToast({
                    title: res.data.resultMessage,
                    mask: false,
                    icon: 'none'
                  });
                }
                this.isOnButton = false;
              }
            }
            break;
          case 'submit':
            if (req) {
              let data = this.deepClone(req);
              data.child_data_list = []
              console.log(this.childService)
              if (Array.isArray(this.childService) && this.childService.length > 0 && !this.hideChildTable) {
                this.childService.forEach((item, index) => {
                  let child_data = this.$refs.childList[index].getChildDataList()

                  data.child_data_list.push(...child_data)
                  // data.child_data_list.push(this.$refs.childList[index].getChildDataList())
                })
              }
              if (this[`${this.srvType}V2`] && this[`${this.srvType}V2`].moreConfig?.submit_validate) {
                let submit_validate = this[`${this.srvType}V2`].moreConfig?.submit_validate
                if (Array.isArray(submit_validate) && submit_validate.length > 0) {
                  let num = 0;
                  for (let i = 0; i < submit_validate.length; i++) {
                    const item = submit_validate[i]

                    if (item.relation && ['lt', 'le', 'gt', 'ge', 'eq'].includes(item
                        .relation)) {
                      let left_key = item.left_child.no;
                      let right_key = item.right_child.no;
                      let left_data = this.childListData[left_key]
                      let right_data = this.childListData[right_key]
                      if (item.right_child.condition && Array.isArray(item.right_child
                          .condition) && item
                        .right_child.condition.length > 0 && Array.isArray(right_data)
                      ) {
                        right_data = right_data.filter(rd => {
                          let valid = 0;
                          item.right_child.condition.forEach(cond => {
                            if (cond.ruleType == 'eq') {
                              if (cond.value === rd[cond
                                  .colName]) {
                                valid += 1
                              }
                            }
                          })
                          if (valid === item.right_child.condition.length) {
                            return true
                          }
                        })
                      }
                      let leftCol = item.left_child.col
                      let rightCol = item.right_child.col
                      let leftVal = left_data.reduce((pre, cur) => {
                        if (cur[leftCol]) {
                          pre += cur[leftCol]
                        }
                        return pre
                      }, 0)

                      let rightVal = right_data.reduce((pre, cur) => {
                        if (cur[rightCol]) {
                          pre += cur[rightCol]
                        }
                        return pre
                      }, 0)

                      switch (item.relation) {
                        case 'lt':
                          if (leftVal >= rightVal) {
                            num++
                            uni.showToast({
                              title: item.tip,
                              icon: "none",
                              duration: 3000
                            })
                          }
                          break;
                        case 'le':
                          if (leftVal > rightVal) {
                            num++
                            uni.showToast({
                              title: item.tip,
                              icon: "none",
                              duration: 3000
                            })
                          }
                          break;
                        case 'ge':
                          if (leftVal < rightVal) {
                            num++
                            uni.showToast({
                              title: item.tip,
                              icon: "none",
                              duration: 3000
                            })
                          }
                          break;
                        case 'gt':
                          if (leftVal <= rightVal) {
                            num++
                            uni.showToast({
                              title: item.tip,
                              icon: "none",
                              duration: 3000
                            })
                          }
                          break;
                        case 'eq':
                          if (leftVal !== rightVal) {
                            num++
                            uni.showToast({
                              title: item.tip,
                              icon: "none",
                              duration: 3000
                            })
                          }
                          break;
                      }
                    } else if (['data-empty', 'no-repeat'].includes(item.type)) {
                      // 校验重复数据及空数据
                      // data-empty:没有数据时不通过；no-repeat：有数据时不通过
                      if (num > 0) {
                        return
                      }
                      const service = item.service
                      let condition = []
                      if (Array.isArray(item.condition)) {
                        condition = item.condition.map(cond => {
                          let obj = {
                            colName: cond.colName,
                            ruleType: cond.ruleType,
                            value: ''
                          }
                          if (cond?.value?.value_type === 'rowData') {
                            obj.value = data[cond?.value?.value_key]
                          } else if (cond?.value?.value_type === 'constant') {
                            obj.value = cond?.value?.value
                          }
                          return obj
                        })
                      }
                      let url = this.getServiceUrl(item?.app || this.appName || uni
                        .getStorageSync('activeApp'), service, 'select');
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
                          }
                        } else {
                          if (res.data.data.length <= 0) {
                            num++
                            noPass = true
                          }
                        }
                        if (noPass && item.fail_tip) {
                          uni.showToast({
                            title: item.fail_tip,
                            icon: 'none'
                          })
                        }
                      }
                    } else if (item.type === 'followOfficial') {
                      // 检查是否关注公众号
                      let res = await this.checkSubscribeStatus()
                      if (!res) {
                        num++
                        let confirm = await new Promise((resolve) => {
                          uni.showModal({
                            title: '提示',
                            content: '请先关注百想助理公众号，以便及时收到新消息通知',
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
                          if (this.$api?.env === 'prod') {
                            this.toOfficial()
                            return
                          }
                        } else {
                          return
                        }
                      }
                    }

                  }
                  if (num > 0) {
                    return
                  }
                }
              }

              let reqData = [{
                serviceName: e.service_name,
                condition: [],
                data: [data]
              }];

              let app = this.appName || uni.getStorageSync('activeApp');
              let type = "add"
              if (e.button_type === 'edit') {
                type = 'update'
                reqData[0].condition = [{
                  colName: 'id',
                  ruleType: 'eq',
                  value: this.mainData?.id
                }]
                if (!this.mainData?.id) {
                  return false
                }
              }
              let url = this.getServiceUrl(app, e.service_name, 'operate');
              let service = e.service_name.slice(0, e.service_name.lastIndexOf('_'))
              uni.showLoading()
              let res = await this.$http.post(url, reqData);
              uni.hideLoading()

              if (res.data.state === 'SUCCESS') {
                if (service === 'srvhealth_person_info_profile_nickname_update') {
                  self.initApp()
                }
                uni.$emit('dataChange', service)
                let effect_data = null
                if (
                  Array.isArray(res.data.response) &&
                  res.data.response.length > 0 &&
                  res.data.response[0].response &&
                  Array.isArray(res.data.response[0].response.effect_data) &&
                  res.data.response[0].response.effect_data.length > 0
                ) {
                  this.params.submitData = res.data.response[0].response.effect_data[0];
                  effect_data = res.data.response[0].response.effect_data[0];
                }
                let afterSubmit = self.moreConfig?.after_submit;
                if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
                  return await self.handleAfterSubmit(afterSubmit, effect_data)
                }
                uni.showModal({
                  title: '提示',
                  content: res.data.resultMessage,
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      let beforeRedirectUrl = getApp().globalData.beforeRedirectUrl 
                      if (self.afterSubmit === 'home') {
                        getApp().globalData.beforeRedirectUrl = null
                        let store_no = self.$store?.state?.app?.storeInfo?.store_no
                        uni.reLaunch({
                          url: `/storePages/home/home?store_no=${store_no}`
                        })
                        return
                      } else if (self.afterSubmit === 'close') {
                        if (top.window?.tab?.closeCurrentTab && top?.window?.tab
                          ?.getCurrentTab) {
                          let curTab = top.window?.tab.getCurrentTab();
                          console.log(curTab, '：-----》curTab')
                          if (curTab) {
                            top.window?.tab.closeCurrentTab(curTab)
                            return
                          }
                        }
                      } else if (self.afterSubmit === 'detail') {
                        self.toPages('detail');
                        return
                      } else if (beforeRedirectUrl) {
                        uni.$emit('onBack', {
                          uuid: self.uuid,
                          service: service
                        })
                        uni.redirectTo({
                          url: beforeRedirectUrl,
                          success: () => {
                          }
                        })
                        getApp().globalData.beforeRedirectUrl = null
                        return
                      } else {
                        debugger
                        uni.navigateBack({
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        })
                      }
                    }
                  }
                })
              } else {
                uni.showToast({
                  title: res.data.resultMessage || res.data.resultCode,
                  mask: false,
                  icon: 'none'
                });
              }
            }
            break;
          case 'customize':
            if (e.operate_type === '删除') {
              let data = {
                button: e,
                row: this.mainData
              }

              this.onButtonToUrl(data, this.appName).then(res => {
                if (res.state === 'SUCCESS') {
                  uni.$emit('dataChange')
                  uni.showModal({
                    title: '提示',
                    content: "操作成功",
                    showCancel: false,
                    success: (res) => {
                      debugger
                      if (res.confirm) {
                        uni.navigateBack({
                          success: () => {
                            if (self.uuid) {
                              uni.$emit('onBack', {
                                uuid: self.uuid,
                                service: service
                              })
                            }
                          }
                        })
                      }
                    }
                  })
                }
              })

            }
            break;
        }

      },
      async valueChange(e, triggerField) {
        const column = triggerField.column
        if (this.mainData && typeof this.mainData === 'object') {
          this.mainData[column] = triggerField.value
        }
        let fieldModel = e
        let xIfCols = this.colsV2Data._fieldInfo.filter(item => item.x_if && Array.isArray(item
          .xif_trigger_col) && item.xif_trigger_col.includes(column)).map(item => item.column)

        const table_name = this.colsV2Data.main_table
        let xIfResult = null

        if (Array.isArray(xIfCols) && xIfCols.length > 0) {
          xIfResult = await this.evalX_IF(table_name, xIfCols, fieldModel, this.appName)
        }
        let calcResult = {}
        let calcCols = this.colsV2Data._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
            .calc_trigger_col) && item.calc_trigger_col.includes(column) && item.value !== item
          .old_value).map(item =>
          item.column)
        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
        }
        for (let i = 0; i < this.fields.length; i++) {
          const item = this.fields[i]

          item.old_value = item.value
          if (e.column && e.column === item.column) {
            item = this.deepClone(e)
          }
          if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
              .column] == 0)) {

            if (item.redundant?.trigger === 'always' || !item.value) {
              item.value = calcResult?.response[item.column] || item.value
              fieldModel[item.column] = item.value
              this.mainData[item.column] = item.value
            }

          }

          if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
            if (item.table_name !== table_name) {
              xIfResult = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
            }
            if (xIfResult?.response && xIfResult.response[item.column]) {
              item.display = true
            } else if (xIfResult === true) {
              item.display = true
            } else {
              item.display = false
            }
          }
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
            fieldModel[item.column] = item.value
          }
          this.$set(this.fields, i, item)
        }
        if (triggerField?.validators && triggerField.validators.indexOf('js_validate') !== -1) {
          let validate = await this.evalValidate(this.serviceName, column, fieldModel, this.appName)
        }
        if (triggerField?.moreConfig?.fkInitData && fieldModel[triggerField.column] && Array.isArray(this
            .childService)) {
          let fkInitData = triggerField.moreConfig.fkInitData
          if (typeof fkInitData === 'object' && Object.keys(fkInitData).length > 0) {
            Object.keys(fkInitData).forEach(key => {
              if (Array.isArray(fkInitData[key]) && fkInitData[key].length > 0) {
                let childIndex = this.childService.findIndex(item => item.foreign_key
                  ?.constraint_name === key)
                if (childIndex > -1) {
                  let arr = []
                  arr = fkInitData[key].map(item => {
                    let strItem = JSON.stringify(item);
                    let data = {
                      mainData: this.mainData
                    }
                    strItem = strItem.replace(/new Date\(\)/ig, dayjs().format(
                      "YYYY-MM-DD"))
                    strItem = this.renderStr(strItem, data)
                    item = JSON.parse(strItem)
                    if (this.fkInitVal && this.fkInitVal[key]) {
                      let fkInitVal = this.fkInitVal[key]
                      Object.keys(fkInitVal).forEach(initKey => {
                        if (!item[initKey] && fkInitVal[initKey] &&
                          typeof fkInitVal[initKey] ===
                          'string') {
                          item[initKey] = this.renderStr(fkInitVal[
                            initKey], data) || item[initKey]
                        }
                      })
                    }
                    item._type = 'initData'
                    return item
                  })
                  if (arr.length > 0) {
                    this.$refs.childList[childIndex].setInitData(arr)
                  }
                }
              }
            })
          }
        }
      },
      // getServiceName(srv) {
      //   let len = srv.lastIndexOf('_');
      //   let serviceName = srv.slice(0, len) + '_';
      //   if (this.srvType === 'list' || this.srvType === 'detail') {
      //     serviceName += 'select';
      //   } else {
      //     serviceName += this.srvType;
      //   }
      //   return serviceName;
      // },
      toPages(type, e) {
        this.srvType = type;
        if (this?.params?.to && this?.params?.idCol && this?.params?.submitData && this?.params?.submitData[this
            .params
            ?.idCol]) {
          uni.redirectTo({
            url: `${this.params.to}?${this.params.idCol}=${this.params.submitData[ this.params.idCol ]}`
          });
        } else {
          let serviceName = e?.service_name || this.getServiceName(this.serviceName)
          let url =
            `/publicPages/formPage/formPage?type=${type}&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(this.fieldsCond))}`
          if (type === 'update' || type == 'detail') {
            if (this.params?.submitData?.id) {
              let fieldsCond = [{
                column: 'id',
                value: this.params.submitData.id,
                display: false
              }]
              url =
                `/publicPages/formPage/formPage?type=${type}&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`

            }
          }

          if (Array.isArray(this.hideColumn) && this.hideColumn.length > 0) {
            url += `&hideColumn=${JSON.stringify(this.hideColumn)}`
          }

          if (this.appName) {
            url += `&appName=${this.appName}`
          }
          uni.redirectTo({
            url: url
          });
        }
      },
      async getDefaultVal() {
        if (this.srvType === 'detail' || this.srvType === 'update') {
          let serviceName = this.colsV2Data?.select_service_name || this.service || this.serviceName.replace(
            '_update', '_select').replace(
            '_add',
            '_select');
          let condition = this.fieldsCond
            .filter(item => item.value)
            .map(item => {
              return {
                colName: item.column,
                ruleType: item.column === 'id' ? "eq" : 'like',
                value: item.value
              };
            });
          if (condition.find(item => item.colName === 'id')) {
            condition = condition.filter(item => item.colName === 'id')
          }

          if (Array.isArray(this.condition) && this.condition.length > 0) {
            condition = this.condition
          }

          let app = this.appName || uni.getStorageSync('activeApp');
          let url = this.getServiceUrl(app, serviceName, 'select');
          let req = {
            serviceName: serviceName,
            colNames: ['*'],
            condition: condition,
            page: {
              pageNo: 1,
              rownumber: 1
            }
          };
          if (this.colsV2Data?.vpage_no) {
            req['vpage_no'] = this.colsV2Data.vpage_no
          }
          let res = await this.$http.post(url, req);
          if (res.data.state === 'SUCCESS') {
            if (Array.isArray(res.data.data) && res.data.data.length > 0) {
              this.mainData = res.data.data[0];
              return res.data.data[0];
            }
          }
        }
      },
      async getDetailV2(srv) {

        const app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(srv || this.serviceName, 'detail', 'detail', app);

        this.detailV2 = colVs
        if (Array.isArray(this.childServiceRadioOption) && this.childServiceRadioOption.length > 0) {
          this.curChild = this.childServiceRadioOption[0].constraint_name
        }
        return colVs
      },
      async getFieldsV2() {

        const app = this.appName || uni.getStorageSync('activeApp');

        let colVs = await this.getServiceV2(this.serviceName, this.srvType, this.use_type, app);
        
        this[`${this.srvType}V2`] = colVs
        

        if (['update', 'add'].includes(this.srvType)) {
          await this.getDetailV2(colVs.select_service_name)
        }

        if (Array.isArray(colVs.srv_cols)) {
          this.orderCols = colVs.srv_cols.filter(item => {
            if (item.in_detail === 1) {
              item.orderType = 'asc'
              item.selected = false;
              return true
            }
          })
        }

        colVs = this.deepClone(colVs);
        if (colVs && colVs.service_view_name) {
          this.pageTitle = colVs.service_view_name
          uni.setNavigationBarTitle({
            title: colVs.service_view_name
          });
        } else {
          if (!colVs) {
            return
          }
        }

        let defaultVal = null
        let fields = null

        switch (colVs.use_type) {
          case 'update':
          case 'detail':
            if (this.mainData?.id) {
              defaultVal = this.mainData
            } else {
              defaultVal = await this.getDefaultVal()
            }
            fields = this.setFieldsDefaultVal(colVs._fieldInfo, defaultVal);
            if (!fields) {
              return;
            }
            fields = fields.map(field => {
              if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
                field.option_list_v2 = field.option_list_v2.map(item => {
                  item.checked = false;
                  return item;
                });
              }

              // if (Array.isArray(field.option_list_v2?.conditions)) {
              // 	field.option_list_v2.conditions = this.evalConditions(field.option_list_v2
              // 		.conditions,
              // 		defaultVal)
              // }

              if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
                this.fieldsCond.forEach(item => {
                  if (item.column === field.column) {
                    if (item.hasOwnProperty('display')) {
                      field.display = item.display;
                    }
                    if (item.hasOwnProperty('label')) {
                      field.customLabel = item.label;
                    }
                    if (item.hasOwnProperty('value')) {
                      field.value = item.value;
                    }
                    if (field.option_list_v2 && Array.isArray(field
                        .option_list_v2
                        .conditions) && Array.isArray(item
                        .condition)) {
                      field.option_list_v2.conditions = field
                        .option_list_v2
                        .conditions.concat(item.condition);
                    } else if (field.option_list_v2 && !field
                      .option_list_v2
                      .conditions && Array.isArray(item
                        .condition)) {
                      field.option_list_v2.conditions = item
                        .condition;
                    }
                  }
                });
              }
              return field;
            }).filter(item => !this.hideColumn.includes(item.column))
            if (this.hideColumn.find(item => item === 'hideAllColumn')) {
              fields = []
            }
            break;
          case 'add':
            if (!this.mainData) {
              this.mainData = {
                ...this.storeInfo
              }
            }

            fields = colVs._fieldInfo.map(field => {

              if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
                field.option_list_v2 = field.option_list_v2.map(item => {
                  item.checked = false;
                  return item;
                });
              }

              if (this.defaultCondition && Array.isArray(this
                  .defaultCondition) && colVs
                ._fieldInfo && Array.isArray(colVs._fieldInfo)) {
                this.defaultCondition.forEach(cond => {
                  colVs._fieldInfo.forEach(field => {
                    if (cond.colName === field.column) {
                      field['value'] = cond['value'];
                    }
                  });
                });
              }
              if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
                this.fieldsCond.forEach(item => {
                  if (item.colName && !item.column) {
                    item.column = item.colName
                  }

                  this.mainData[item.column] = item.value
                  if (item.column === field.column) {
                    if (item.hasOwnProperty('display')) {
                      field.display = item.display;
                    }
                    if (item.hasOwnProperty('label')) {
                      field.customLabel = item.label;
                    }
                    if (item.hasOwnProperty('disabled')) {
                      field.disabled = item.disabled;
                    }
                    if (item.hasOwnProperty('value')) {
                      field.value = item.value;
                      field.defaultValue = item.value;
                    }
                    if (field.option_list_v2 && Array.isArray(field
                        .option_list_v2
                        .conditions) && Array.isArray(item
                        .condition)) {
                      field.option_list_v2.conditions = field
                        .option_list_v2
                        .conditions.concat(item.condition);
                    } else if (field.option_list_v2 && !field
                      .option_list_v2
                      .conditions && Array.isArray(item
                        .condition)) {
                      field.option_list_v2.conditions = item
                        .condition;
                    }
                  }
                });
              }
              return field;
            }).filter(item => !this.hideColumn.includes(item.column))
            defaultVal = colVs._fieldInfo.reduce((res, cur) => {
              if (cur.defaultValue) {
                res[cur.column] = cur.value || cur.defaultValue
                cur.value = cur.value || cur.defaultValue
                this.mainData[cur.column] = cur.value
              } else if (cur.value) {
                res[cur.column] = cur.value
              }
              return res
            }, {})


            break;
        }


        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)
        }

        let calcResult = {}

        let calcCols = colVs._fieldInfo.filter(item => item.redundant?.func && Array.isArray(item
          .calc_trigger_col)).map(item => item.column)

        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, defaultVal, this.appName)
        }

        for (let i = 0; i < colVs._fieldInfo.length; i++) {
          const item = colVs._fieldInfo[i]
          if (calcResult?.response && (calcResult.response[item.column] || calcResult.response[item
              .column] == 0)) {

            if (item.redundant?.trigger === 'always' || !item.value) {
              item.value = calcResult?.response[item.column]
              defaultVal[item.column] = item.value
              this.mainData[item.column] = item.value
            }
          }
          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], defaultVal, this.appName)
              }
              if (result?.response && result.response[item.column]) {
                item.display = true
              } else if (result === true) {
                item.display = true
              } else {
                item.display = false
              }
            }
          }
        }

        // #ifdef MP-WEIXIN
        if (this.moreConfig?.coord_info?.coord_col && Array.isArray(fields) && fields.length > 0) {
          let confirm = false
          const hasLocationAuth = await new Promise(resolve => {
            uni.getSetting({
              success(res) {
                console.log(res.authSetting)
                if (res?.authSetting['scope.userLocation']) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              },
              fail: () => {
                resolve(false)
              }
            })
          })
          if (hasLocationAuth) {
            confirm = true
          } else {
            confirm = await new Promise(resolve => {
              uni.showModal({
                title: '提示',
                content: '当前页面部分内容默认值需要您授予定位权限才能自动进行填充，若出现授权弹窗请允许授权',
                cancelText: '不想授权',
                success: (res) => {
                  if (res.confirm) {
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                }
              })
            })
          }
          if (confirm == true) {
            const colMap = this.moreConfig?.coord_info?.coord_col || {}
            let cols = await this.setDefaultValueForAddressCol(fields, colMap)
            if (Array.isArray(cols) && cols.length > 0) {
              fields = cols
            }
          }
        }
        // #endif

        this.fields = fields
      },
      hideModal() {
        this.modalName = null
      },
      changeValue(e) {
        if (e?.col && e?.service && e?.data) {
          this.fields = this.fields.map(item => {
            if (item.column === e.col) {
              item.value = e.data[item.option_list_v2?.refed_col];
              item.colData = e.data
            }
            return item
          })
        }

      },
    },
    onShareAppMessage(e) {
      let pages = getCurrentPages();
      let title = ``;
      let path = pages[pages.length - 1]?.$page?.fullPath;
      path += '&from=share';
      path += '&type=default';
      if (this.userInfo?.userno) {
        path += `&invite_user_no=${this.userInfo?.userno}`;
      }
      if (this.storeNo) {
        path += `&store_no=${this.storeNo}`;
      }
      let url = this.moreConfig?.customDetailUrl;
      if (e?.target?.dataset?.shareurl) {
        url = e?.target?.dataset?.shareurl
      }
      let query = {
        data: this.mainData || {},
        rowData: this.mainData || {},
        storeUser: this.vstoreUser,
        ...this
      }

      if (url) {
        url = this.renderStr(url, query)
        if (url) {
          path = url
        }
      }

      if (e?.target?.dataset?.sharetitle) {
        title = this.renderStr(e?.target?.dataset?.sharetitle, query)
      }
      let imageUrl = '';
      let btn = e?.target?.dataset?.btn;
      if (btn?.shareImgCol && this.mainData[btn?.shareImgCol]) {
        imageUrl = this.getImagePath(this.mainData[btn?.shareImgCol])
      }

      if (this.storeInfo?.logo) {
        imageUrl = imageUrl || this.getImagePath(this.storeInfo.logo || this.storeInfo?.image, true);
      }
      this.saveSharerInfo(this.userInfo, path, 'appMessage');
      title = this.renderEmoji(title)
      if (path.indexOf('store_no') == -1) {
        path += `&store_no=${this.storeInfo?.store_no}`
      }
      return {
        imageUrl: imageUrl,
        title: title,
        path: path
      };
    },
    async onLoad(option) {
      if (option.backUrl) {
        try {
          this.backUrl = decodeURIComponent(option.backUrl)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.disabledBack) {
        this.disabledBack = true
      }
      if (option.uuid) {
        this.uuid = option.uuid
      }
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      // #endif
      // uni.$on('confirmSelect', e => {
      // 	this.changeValue(e)
      // })
      if (option.hideChildTable) {
        this.hideChildTable = true
      }
      if (option.orderMode) {
        this.orderMode = true
      }
      if (option.leftText) {
        try {
          this.leftText = JSON.parse(option.leftText)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.rightBtn) {
        try {
          this.rightBtn = JSON.parse(option.rightBtn)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.stepMode) {
        this.stepMode = true
      }
      if (option.view_cfg) {
        // 详情页面自定义展示效果
        try {
          try {
            this.view_cfg = JSON.parse(option.view_cfg)
          } catch (e) {
            //TODO handle the exception
            this.view_cfg = JSON.parse(decodeURIComponent(option.view_cfg))
          }
          if (this.view_cfg.hideColumn) {
            this.hideColumn = this.view_cfg.hideColumn
          }
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.disabled) {
        this.disabled = true
      }
      if (option.afterSubmit) {
        this.afterSubmit = option.afterSubmit
      }

      if (option.disabledChildButton) {
        this.disabledChildButton = true
      }
      await this.toAddPage()
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.main_data) {
        try {
          this.mainData = JSON.parse(option.main_data)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.appName) {
        this.appName = option.appName
      }
      if (option.type) {
        if (option.type.indexOf(',') !== -1) {
          option.type = option.type.split(',')[0];
        }
        if (option.type === 'form') {
          option.type = 'add';
        }
        this.srvType = option.type;
        this.use_type = option.type;
      }


      if (option.fieldsCond) {
        let fieldsCond = []
        try {
          option = this.deepClone(option)
          console.log(option)
          let str = decodeURIComponent(option.fieldsCond)
          console.log(str)
          str = JSON.stringify(str)
          console.log(str)
          str = JSON.parse(str)
          console.log(str)
          fieldsCond = JSON.parse(str);

        } catch (e) {
          console.log(e)
          try {
            let str = decodeURIComponent(encodeURIComponent(decodeURIComponent(option.fieldsCond)))
            fieldsCond = JSON.parse(str);
          } catch (e) {}
        }
        if (option.condition) {
          try {
            let cond = JSON.parse(option.condition)
            this.condition = cond
            if (Array.isArray(cond) && cond.length > 0) {
              cond.forEach(item => {
                if (item.value) {
                  fieldsCond.push({
                    column: item.colName,
                    value: item.value
                  })
                }
              })
            }
          } catch (e) {
            //TODO handle the exception
          }
        }

        this.fieldsCond = fieldsCond
      }
      if (['detail', 'update'].includes(option.type) && (!this.fieldsCond || (Array.isArray(this.fieldsCond) && this
          .fieldsCond
          .length ===
          0)) && option.id) {
        this.fieldsCond = [{
          column: 'id',
          ruleType: 'eq',
          value: option.id
        }]
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName;
        this.loading = true
        await this.getFieldsV2();
        this.loading = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common/top-card';

  .form-wrap {
    min-height: 100vh;
    background-color: #F8F8F8;
    display: flex;
    flex-direction: column;
    margin: 0 auto;

    &.order-mode {
      padding: 0 0 50px;

      .handler-bar {
        border-top: 1px solid #F1F1F1;
        height: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0 20px;
        position: fixed;
        bottom: 0;
        background-color: #fff;
        justify-content: space-between;

        .cu-btn {
          min-width: 100px;
          border-radius: 30px;
        }
      }
    }

    &.step-mode {
      padding: 0;

      ::v-deep .form-item {

        &.before-section,
        &.section-top {
          border-radius: 0;
        }
      }
    }

    &.no-padding {
      padding: 0;

      .form-content {
        // background-color: #fff;
      }

      .main-form-edit {
        background-color: #fff;
        border-radius: 0;
      }
    }

    .form-content {
      flex: 1;
      margin-bottom: 20rpx;
    }

    .custom-view {
      margin-bottom: 10px;
      padding: 20px;
      display: flex;
      align-items: center;

      .icon {
        font-size: 40px;
        font-weight: bold;
        background-color: #fff;
        width: 50px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        border-radius: 50%;
        margin: 0 10px;
      }

      .content {
        .title {
          font-size: 18px;
          line-height: 30px;
        }

        .tip {
          font-size: 12px;
        }
      }
    }
  }

  .main-form-edit {
    // background-color: #fff;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .pc-model {
      display: flex;
      flex-wrap: wrap;
      padding-top: 10px;
      padding-left: 10px;

      ::v-deep .form-item::after {
        border-bottom: none !important;
      }
    }
  }

  .child-form-wrap {
    max-height: 60vh;
    overflow-y: scroll;

  }

  .child-service-box {
    &.step-mode {
      .child-service {
        margin: 0 10px;
        border-radius: 10px;
      }
    }

    .change-child {
      padding: 20px 10px 10px;
    }

    &.pc-model {

      @media screen and (min-width:800px) {
        display: flex;
        flex-wrap: wrap;

        .child-service {
          width: calc(50% - 5px);
          margin-right: 10px;

          &:nth-child(2n) {
            margin-right: 0;
          }
        }
      }

      @media screen and (min-width:1600px) {
        display: flex;
        flex-wrap: wrap;

        .child-service {
          width: calc(33.33% - 8px);
          margin-right: 10px;

          &:nth-child(2n) {
            margin-right: 10px;
          }

          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }

    }
  }

  .loading-box {
    width: 100vw;
    height: 100vh;
    text-align: center;
    padding-top: 40vh;
  }


  .qrcodeCanvas-box {
    position: fixed;
    top: -9999px;
  }

  .qrcode-box {
    padding: 80rpx 40rpx;
    text-align: center;
    position: relative;

    .title {
      padding: 0 0 10px;
      font-size: 20px;
      font-weight: bold;
    }

    .store-name {
      margin-top: 10px;
      font-weight: bold;
    }

    .store-logo {
      position: absolute;
      width: 100rpx;
      height: 100rpx;
      left: calc(50% - 50rpx);
      top: 20rpx;
      z-index: 2;
    }

    .qr-code-image {
      width: 500rpx;
      height: 500rpx;
      line-height: 500rpx;
      margin: 0 auto;
      text-align: center;
      font-size: 20px;
      border: 15rpx solid #333;
      padding: 10px;
      // border-radius: 20rpx;
    }
  }


  .button-box {
    padding: 10px;
    min-width: 300px;
    max-width: 800px;
    margin: 10px auto 20px;
    flex-wrap: wrap;
    display: flex;
    justify-content: center;

    .bg-cyan {
      background-color: #10c0a8;
    }

    .cu-btn {
      min-width: 85%;

      &.flex-half {
        min-width: 40%;
        margin-right: 10px;
      }

      &.flex-all {
        min-width: calc(60% - 10px);
      }
    }
  }
  ::v-deep .nav-bar {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    width: 100%;
    // background-color: #fff;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  
    .home-name {
      display: inline-block;
      width: calc(100% - 40rpx);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  
  }
</style>
