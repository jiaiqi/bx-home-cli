<template>
  <view class="detail-wrap" :class="['theme-'+theme]">
    <view class="detail-temp-box" v-if="detailConfig&&detail">
      <view class="detail-top">
        <view class="left-image" v-if="detailConfig.img&&setValue(detailConfig.img.col).value">
          <image lazy-load class="image" :src="getImagePath(setValue(detailConfig.img.col).value,true)"
            mode="aspectFit"></image>
        </view>
        <view class="cols-list" v-if="detailConfig.top_col">
          <view class="col-item" :style="{
            width:column.width,
            color:column.color,
            flex:column.flex,
            'text-align':column.align,
            'background-color':column.bg,
            'border-radius':column.radius,
            'padding':column.padding,
            'font-size':column.font_size
          }" v-for="column in detailConfig.top_col" :key="column.col">
            <view class="label" v-if="setValue(column.col,column).label">
              {{setValue(column.col,column).label}}:
            </view>
            <view class="value">
              {{setValue(column.col).value||'-'}}
            </view>
          </view>
        </view>
      </view>
      <view class="other-col" v-if="detailConfig&&detailConfig.cols&&detailConfig.cols.length>0">
        <view class="col-item" v-for="column in detailConfig.cols " :key="column.col">
          <view class="label" :class="{'label-top':column.label&&column.label.position==='top'}" :style="{
            'font-size':column.label&&column.label.font_size?column.label.font_size:null,
            'color':column.label&&column.label.color?column.label.color:null,
          }">
            {{setValue(column.col).label}}
          </view>
          <view class="value" :style="{
            color:column.color
          }" v-if="column.type==='richText'&&setValue(column.col).value">
            <view class="" v-html="setValue(column.col).value">

            </view>
          </view>
          <view class="value" v-else :style="{
            color:column.color
          }">
            {{setValue(column.col).value||'-'}}
          </view>
        </view>
      </view>
    </view>
    <view class="top-card" v-if="appTempColMap&&detail&&!detailConfig">
      <view class="left-image" v-if="appTempColMap.img">
        <u-image class="u-image" width="200" height="200" v-if="setValue(appTempColMap.img).value"
          :src="getImagePath(setValue(appTempColMap.img).value,true)" mode="aspectFit"></u-image>
        <u-image class="u-image" v-else width="200" height="200"></u-image>
      </view>
      <view class="top-content" @click="toDetail" v-if="!notTempColMap">
        <view class="top-title-bar">
          <view class="top-item title" v-if="appTempColMap.title">
            <view class="label" v-if="setValue(appTempColMap.title).label">
              {{setValue(appTempColMap.title).label}}:
            </view>
            <view class="value">
              {{setValue(appTempColMap.title).value}}
            </view>
          </view>
          <view class="top-item sub-title cu-btn line-blue light sm round"
            v-if="appTempColMap.tip&&detail[appTempColMap.tip]">
            {{setValue(appTempColMap.tip).value}}
            <!-- {{detail[appTempColMap.tip]||''}} -->
          </view>
        </view>
        <view class="top-center">
          <view class="top-item " v-if="appTempColMap.subTitle&&detail[appTempColMap.subTitle]">
            <view class="label" v-if="labelMap[appTempColMap.subTitle]">
              <!-- {{labelMap[appTempColMap.subTitle]||''}}: -->
              {{setValue(appTempColMap.subTitle).label}}:
            </view>
            <view class="value">
              <!-- {{detail[appTempColMap.subTitle]||''}} -->
              {{setValue(appTempColMap.subTitle).value}}
            </view>
          </view>
          <view class="top-item" v-if="appTempColMap.left && detail[appTempColMap.left]">
            <view class="label" v-if="labelMap[appTempColMap.left]">
              <!-- {{labelMap[appTempColMap.left]||''}}: -->
              {{setValue(appTempColMap.left).label}}:
            </view>
            <view class="value">
              <!-- {{detail[appTempColMap.left]||''}} -->
              {{setValue(appTempColMap.left).value}}
            </view>
          </view>
          <view class="top-item" v-if="appTempColMap.right&&detail[appTempColMap.right]">
            <view class="label" v-if="labelMap[appTempColMap.right]">
              <!-- {{labelMap[appTempColMap.right]||''}}: -->
              {{setValue(appTempColMap.right).label}}:
            </view>
            <view class="value">
              <!-- {{detail[appTempColMap.right]||''}} -->
              {{setValue(appTempColMap.right).value}}
            </view>
          </view>
        </view>
        <view class="top-footer" v-if="appTempColMap.footer&&detail[appTempColMap.footer]">
          <view class="top-item">
            <view class="label" v-if="labelMap[appTempColMap.footer]">
              <!-- {{labelMap[appTempColMap.footer]||''}}: -->
              {{setValue(appTempColMap.footer).label}}:
            </view>
            <view class="value">
              <!-- {{detail[appTempColMap.footer]||''}} -->
              {{setValue(appTempColMap.footer).value}}
            </view>
          </view>
        </view>
      </view>
      <view class="detail-form" v-if="!detailConfig">
        <view class="form-wrap" :class="{show:setShowDetail||model==='PC'}">
          <a-form class="bx-form" v-if="isArray(detailFields)" :fields="detailFields" :srvApp="appName"
            pageType="detail" formType="detail" ref="bxForm">
          </a-form>
        </view>
      </view>
      <view class="handler-bar" v-if="!notTempColMap&&!detailConfig&&model!=='PC'">
        <view class="show-or-hide" @click="changeDetailStatus" v-if="isArray(detailFields)&&detailFields.length>0">
          <text class="margin-right">{{setShowDetail?"收起":"展开"}}详情 </text>
          <text class="cuIcon-unfold" v-if="!setShowDetail"></text>
          <text class="cuIcon-fold " v-else></text>
        </view>
        <view class="button-box" v-if="detail&&!disabled">
          <button class="cu-btn line-orange round border bx-line-btn-color" v-for="(item,index) in publicButton"
            :class="{disabled:disabled}" :key="index" @click="onButton(item)">
            {{item.button_custom_name||item.button_name||''}}
          </button>
        </view>
      </view>
    </view>
    <view class="child-service-fold">
      <button
        :class="{
					'bg-orange':currentChild&&currentChild.foreign_key&&currentChild.foreign_key.id&&item&&item.foreign_key&&item.foreign_key.id===currentChild.foreign_key.id}"
        class="cu-btn border bg-green shadow-blur margin-left-sm" @click="changeChild(item)"
        v-for="(item,index) in foldChildService" :key="index">{{item.label||''}}</button>
    </view>
    <view class="child-service-box" :class="{'pc-model':model==='PC'}" v-if="currentChild&&!hideChildTable">
      <view class="child-service">
        <child-list :disabled="disabled||disabledChildButton" :config="currentChild" :mainServiceName="serviceName"
          :mainTable="v2Data.main_table" :mainFkField="fkFields" :srvMoreConfig="srvMoreConfig"
          :srvGridButtonDisp="gridButtonDisp" :srvRowButtonDisp="rowButtonDisp"
          :fkInitVal="fkInitVal[item.constraint_name||item.key_no]" :childListData="childListData"
          :fkCondition="fkCondition[item.constraint_name||item.key_no]" :appName="appName" :mainData="detail"
          @addChild="addChild" @child-list-change="childListChange" v-if="detail&&currentChild">
        </child-list>
      </view>
    </view>
    <view class="child-service-box" :class="{'pc-model':model==='PC'}" v-if="detail&&!hideChildTable">
      <view class="child-service" v-for="(item,index) in childService" :key="index">
        <child-list :disabled="disabled||disabledChildButton" :config="item" :mainServiceName="serviceName"
          :mainTable="v2Data.main_table" :mainFkField="fkFields" :srvMoreConfig="srvMoreConfig"
          :srvGridButtonDisp="gridButtonDisp" :srvRowButtonDisp="rowButtonDisp"
          :fkInitVal="fkInitVal[item.constraint_name]" :childListData="childListData"
          :fkCondition="fkCondition[item.constraint_name||item.key_no]" :appName="appName" :mainData="detail"
          @addChild="addChild" @child-list-change="childListChange" @unfold="unfoldChild(item,index)"
          v-if="detail&&item.isFold!==true">
        </child-list>
      </view>
    </view>

  </view>
</template>

<script>
  // import ChildList from './child-list.vue'
  import ChildList from '@/publicPages/components/child-list/child-list.vue'
  import bxForm from '@/components/a-form-item/a-form-item.vue'
  let _childData = {}
  export default {
    components: {
      ChildList,
      bxForm
    },
    data() {
      return {
        serviceName: null,
        fieldsCond: null,
        appName: null,
        v2Data: null,
        orderCols: [],
        detail: null,
        modalName: "",
        showDetail: false,
        currentChild: null,
        disabled: false,
        disabledChildButton: false, //子表禁止编辑
        formButtonDisp: null,
        gridButtonDisp: null,
        srvMoreConfig: null,
        rowButtonDisp: null,
        childListData: {},
        hideChildTable: false
      }
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      model() {
        return getApp()?.globalData?.systemInfo?.model
      },
      setShowDetail() {
        if (this.model === 'PC') {
          return false
        }
        if (this.notTempColMap) {
          return true
        } else {
          return this.showDetail
        }
      },
      notTempColMap() {
        return Object.keys(this.appTempColMap).length === 0
      },
      fkFields() {
        if (Array.isArray(this.v2Data?._fieldInfo)) {
          return this.v2Data._fieldInfo.filter(item => item.col_type == 'fk' && item.option_list_v2?.refed_col)
        }
      },
      detailFields() {
        if (Array.isArray(this.v2Data?._fieldInfo) && typeof this.appTempColMap === 'object') {
          let arr = Object.keys(this.appTempColMap).map(key => {
            return this.appTempColMap[key]
          })
          return this.v2Data._fieldInfo.filter(item => !arr.includes(item.columns))
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
      fkConfig() {
        return this.moreConfig?.fk_config
      },
      detailConfig() {
        return this.moreConfig?.detail_config || false
      },
      appTempColMap() {
        // 字段关系映射
        return this.moreConfig?.appTempColMap || {}
      },
      foldChildService() {
        if (Array.isArray(this.childService) && this.childService.length > 0) {
          return this.childService.filter(item => item.isFold)
        }
      },
      childService() {
        if (Array.isArray(this.v2Data?.child_service)) {
          return this.v2Data.child_service.map(item => {
            if (item?.foreign_key?.section_name) {
              item.label = item.foreign_key.section_name
            }
            if (item?.foreign_key?.constraint_name || item?.foreign_key?.key_no) {
              item.constraint_name = item.foreign_key.constraint_name || item?.foreign_key?.key_no
            }
            item.use_type = 'detaillist'
            return item
          }).filter((item, index) => {
            if (this.fkConfig && this.fkConfig.hide) {
              let hideChildList = this.fkConfig.hide;
              if (hideChildList.indexOf(item.foreign_key?.constraint_name) !== -1) {
                return false
              }
            }
            if (Array.isArray(this.detail?._child_tables) && this.v2Data.child_service.length === this
              .detail._child_tables.length) {
              if (this.detail._child_tables[index] === 0) {
                return false
              }
            }
            return true
            return item.foreign_key?.foreign_key_type !== '主子表'
          })
        }
        return []
      },
      moreConfig() {
        return this.v2Data?.moreConfig
      },
      fkInitVal() {
        return this.moreConfig?.fk_init_val || {}
      },
      fkCondition() {
        let fk_condition = this.moreConfig?.fk_condition || {}
        return fk_condition
      },
      srvApp() {
        return this.appName || uni.getStorageSync('activeApp')
      },
      publicButton() {
        if (Array.isArray(this.v2Data?.formButton)) {
          return this.v2Data.formButton.filter((item, index) => {
            if (this.formButtonDisp && this.formButtonDisp[item.button_type] === false) {
              return false
            } else if (this.formButtonDisp && this.formButtonDisp[item.button_type] && typeof this.formButtonDisp[
                item.button_type] === 'string') {
              item.button_custom_name = this.formButtonDisp[item.button_type]
            }
            if (item.permission === false) {
              return false
            }
            if (Array.isArray(this.detail?._buttons) && this.detail._buttons.length > 0) {
              return this.detail._buttons[index] === 1
            } else if (this.detail?._buttons && typeof this.detail._buttons === 'string') {
              let arr = this.detail._buttons.split(',')
              if (Array.isArray(arr) && arr.length > 0) {
                return Number(arr[index]) === 1
              }
            } else {
              return item.permission === true
            }
            return true
          })
        } else {
          return []
        }
      }
    },
    methods: {
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
                  let result = _childData[relation.constraint_name].map(item => item[relation_table_col]).reduce((
                    res, cur) => {
                    if (cur) {
                      res = (res * 1000 + cur * 1000) / 1000;
                    }
                    return res
                  }, 0)
                  // this.fields = this.fields.map(item => {
                  //   if (item.column === table_col) {
                  //     item.value = result || 0
                  //   }
                  //   return item
                  // })
                }
              })
            }
            this.childListData = _childData
          }
        }

      },
      setValue(col, cfg) {
        let labelMap = this.labelMap || {};
        let detail = this.detail || {}
        let arr = []
        if (col) {
          if (typeof col === 'string') {
            arr = col.split('||')
          } else if (Array.isArray(col) && col.length > 0) {
            arr = col
          }
        }
        let resCol = '';
        for (let i = 0; i < arr.length; i++) {
          let column = arr[i].trim()
          if (detail[column]) {
            resCol = column;
            break;
          }
        }
        if (!resCol && Array.isArray(arr) && arr.length > 0) {
          resCol = arr[0]
        }
        if (cfg?.label === false) {
          labelMap[resCol] = ''
        }
        return {
          label: labelMap[resCol] || '',
          value: detail[resCol] || ''
        }
      },
      changeChild(e) {
        let cur = null
        if (e && typeof e === 'object') {
          if (this.currentChild?.foreign_key?.id !== e?.foreign_key?.id) {
            cur = this.deepClone(e)
            cur.unfold = true
          }
        }
        this.currentChild = cur
      },
      unfoldChild(item, index) {
        this.v2Data.child_service = this.v2Data.child_service.map((c, i) => {
          if ((item.foreign_key?.key_no && item.foreign_key?.key_no === c.foreign_key?.key_no) || (item.foreign_key
              ?.constraint_name && item.foreign_key?.constraint_name === c.foreign_key?.constraint_name)) {
            c.unfold = !c.unfold
          }
          return c
        })
      },
      changeDetailStatus() {
        this.showDetail = !this.showDetail
      },
      async addChild(e) {
        if (this.disabled) {
          uni.showToast({
            title: '当前页面不可编辑！',
            icon: 'none'
          })
          return
        }
        let {
          row,
          btn
        } = e
        let reqData = [{
          serviceName: btn.service_name,
          data: [row]
        }];
        let app = this.appName || uni.getStorageSync('activeApp');
        let type = "add"
        let url = this.getServiceUrl(app, btn.service_name, type);
        let res = await this.$http.post(url, reqData);
        if (res.data.state === 'SUCCESS') {
          uni.showModal({
            title: '提示',
            content: res.data.resultMessage,
            showCancel: false
          })
        } else {
          uni.showToast({
            title: res.data.resultMessage,
            mask: false,
          });
        }
      },
      toDetail() {
        this.changeDetailStatus()
        return
        let fieldsCond = [{
          column: 'id',
          value: this.detail.id,
          display: false
        }]
        let url =
          `/publicPages/formPage/formPage?type=detail&appName=${this.appName}&serviceName=${this.serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}`
        uni.navigateTo({
          url
        })
      },
      async getDetailV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'detail', 'detail', app);
        colVs.srv_cols = colVs.srv_cols.filter(item => {
          if (item.in_detail !== 0) {
            if (item.in_detail === 1) {
              item.display = true
            }
            return true
          }
        })
        let defaultVal = await this.getDetail(colVs?.vpage_no) || {}
        colVs._fieldInfo = this.setFieldsDefaultVal(colVs._fieldInfo, defaultVal)

        if (Array.isArray(colVs?.child_service) && colVs.child_service.length > 0) {
          colVs.child_service = colVs.child_service.map(item => {
            if (item?.foreign_key?.more_config && typeof item.foreign_key.more_config ===
              'string') {
              try {
                item.foreign_key.moreConfig = JSON.parse(item.foreign_key.more_config)

                if (item.foreign_key?.moreConfig?.condition && item.foreign_key.moreConfig.condition.length > 0) {
                  item.foreign_key.moreConfig.condition = item.foreign_key.moreConfig.condition.map(item => {
                    if (item.value && item.value.indexOf('${') !== -1) {
                      let obj = {
                        mainData: this.detail
                      }
                      item.value = this.renderStr(item.value, obj)
                    }
                    return item
                  }).filter(item => item.value)
                }
              } catch (e) {
                //TODO handle the exception
              }
            }
            item.unfold = true
            if (item?.foreign_key?.moreConfig?.unfold === false) {
              // 折叠
              item.unfold = false
              item.isFold = true
            } else if (item?.foreign_key?.moreConfig?.unfold === true) {
              item.unfold = true
            }
            if (item?.foreign_key?.moreConfig?.fold === true) {
              // 折叠
              item.unfold = false
            } else if (item?.foreign_key?.moreConfig?.fold === false) {
              item.unfold = true
            }
            return item
          })
        }
        if (!this.navigationBarTitle) {
          uni.setNavigationBarTitle({
            title: colVs.service_view_name
          });
        }
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
            delete colVs.more_config
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
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
        if (colVs?.moreConfig?.srvMoreConfig) {
          this.srvMoreConfig = colVs?.moreConfig?.srvMoreConfig
        }
        if (colVs?.moreConfig?.formButtonDisp) {
          this.formButtonDisp = colVs?.moreConfig?.formButtonDisp
        }
        if (colVs?.moreConfig?.gridButtonDisp) {
          this.gridButtonDisp = colVs?.moreConfig?.gridButtonDisp
        }
        if (colVs?.moreConfig?.rowButtonDisp) {
          this.rowButtonDisp = colVs?.moreConfig?.rowButtonDisp
        }

        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)
        }

        for (let i = 0; i < colVs._fieldInfo.length; i++) {
          const item = colVs._fieldInfo[i]
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


        this.v2Data = colVs;

      },
      async getDetail(vpage_no) {
        const url = this.getServiceUrl(this.srvApp, this.serviceName, 'select')
        const req = {
          "serviceName": this.serviceName,
          "colNames": ["*"],
          "condition": [],
          "vpage_no": vpage_no || this.v2Data?.vpage_no
        }
        if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
          req.condition = this.fieldsCond.map(item => {
            return {
              colName: item.column,
              ruleType: 'eq',
              value: item.value
            }
          })
        }
        if (!req.condition || !Array.isArray(req.condition) || req.condition.length < 1) {
          return
        }
        const res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.detail = res.data.data[0]

          return this.detail
        }
      },
      async onButton(e) {
        if (this.disabled) {
          uni.showToast({
            title: '当前页面不可编辑！',
            icon: 'none'
          })
          return
        }
        let self = this;
        if (!e) {
          return;
        }
        if (!this.isOnButton) {
          this.isOnButton = true;
        } else {
          // uni.showToast({
          // 	title: '正在处理中，请勿重复操作',
          // 	icon: 'none'
          // });
          // return;
        }
        let req = this.detail || {}
        for (let key in req) {
          if (Array.isArray(req[key])) {
            req[key] = req[key].toString();
          }
        }
        switch (e.button_type) {
          case 'edit':
            if (e.page_type === '详情') {
              let fieldsCond = [{
                column: 'id',
                value: this.detail?.id,
                display: false
              }]

              let url =
                `/publicPages/formPage/formPage?destApp=${this.appName}&type=update&serviceName=${e.service_name}&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`;
              if (this.detail?.id) {
                uni.navigateTo({
                  url: url
                });
              }
              this.isOnButton = false;
            } else {
              return
            }
            break;
          case 'submit':
            break;
          case 'reset':
            this.$refs.bxForm.onReset();
            this.isOnButton = false;
            break;
          case 'customize':
            console.log(this.deepClone(e))
            let buttonInfo = this.deepClone(e)
            if (Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params
              .condition
              .length > 0) {
              buttonInfo.operate_params.condition.forEach(cond => {
                if (typeof cond.value === 'object' && cond.value.value_type ===
                  'rowData') {
                  cond.value = this.detail[cond.value.value_key];
                } else if (typeof cond.value === 'object' && cond.value.value_type ===
                  'constant') {
                  cond.value = cond.value.value;
                }
              });
            }

            if (Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data.length >
              0) {
              buttonInfo.operate_params.data.forEach(data => {
                if (typeof data === 'object') {
                  Object.keys(data).forEach(item => {
                    if (typeof data[item] === 'object' && data[item].value_type ===
                      'rowData') {
                      data[item] = this.detail[data[item].value_key];
                    } else if (typeof data[item] === 'object' && data[item]
                      .value_type === 'constant') {
                      data[item] = data[item].value;
                    }
                  });
                }
              });
            }
            if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
              let req = [{
                serviceName: buttonInfo.operate_service,
                condition: buttonInfo.operate_params.condition,
                data: buttonInfo.operate_params.data
              }];
              let app = this.appName || uni.getStorageSync('activeApp');
              let url = this.getServiceUrl(buttonInfo.application || app, buttonInfo.operate_service,
                buttonInfo.servcie_type);
              let res = await this.$http.post(url, req);
              if (res.data.state === 'SUCCESS') {
                // this.$refs.bxList.onRefresh();
                this.getDetail()
              }
              return
            } else if (buttonInfo.operate_type === '更新弹出' || buttonInfo.operate_type === '更新跳转' || buttonInfo
              .operate_type === '增加跳转' || buttonInfo.operate_type === '增加弹出') {
              // 自定义按钮
              let moreConfig = buttonInfo.more_config;
              if (moreConfig && typeof moreConfig === 'string') {
                try {
                  moreConfig = JSON.parse(moreConfig);
                } catch (e) {
                  //TODO handle the exception
                  console.log(e);
                }
              }
              if (buttonInfo.servcie_type === 'add') {
                let params = {
                  type: 'add',
                  serviceName: buttonInfo.service_name,
                  defaultVal: buttonInfo.operate_params.data || data.row,
                  eventOrigin: buttonInfo
                };
                let fieldsCond = []
                if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length > 0) {
                  buttonInfo.operate_params.data.forEach(item => {
                    if (Object.keys(item).length > 0) {
                      Object.keys(item).forEach(key => {
                        let obj = {
                          column: key,
                          value: item[key]
                        }
                        fieldsCond.push(obj)
                      })
                    }
                  })
                }
                let url =
                  `/publicPages/formPage/formPage?params=${JSON.stringify(params)}&service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                  encodeURIComponent(JSON.stringify(fieldsCond));
                if (this.appName) {
                  url += `&appName=${this.appName}`
                }
                uni.navigateTo({
                  url: url
                });
                return
              } else if (buttonInfo.servcie_type === 'update') {
                let params = {
                  type: 'update',
                  serviceName: buttonInfo.service_name,
                  condition: buttonInfo.operate_params.condition,
                  defaultVal: buttonInfo.operate_params.data,
                };
                let fieldsCond = []
                let condition = buttonInfo?.operate_params?.condition
                let defaultVal = buttonInfo?.operate_params?.data
                if (Array.isArray(defaultVal) && defaultVal.length > 0) {
                  let obj = defaultVal[0]
                  if (this.iObject(obj)) {
                    Object.keys(obj).forEach(key => {
                      fieldsCond.push({
                        column: key,
                        value: obj[key]
                      })
                    })
                  }
                }
                let url =
                  `/publicPages/formPage/formPage?params=${JSON.stringify(params)}&condition=${JSON.stringify(condition)}&service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                  encodeURIComponent(JSON.stringify(fieldsCond));
                if (this.appName) {
                  url += `&appName=${this.appName}`
                }
                uni.navigateTo({
                  url: url
                });
                return
              }
            } else if (e.application && e.operate_service) {
              const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
              const req = [{
                data: [e.requestData],
                serviceName: e.operate_service,
                srvApp: e.application
              }];
              let res = await this.$http.post(url, req);
              if (res.data.state === 'SUCCESS') {
                uni.showModal({
                  title: '提示',
                  content: e.tip_msg ? e.tip_msg : res.data.resultMessage,
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      uni.navigateBack();
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
            break;
          default:
            uni.showToast({
              title: e.button_name,
              icon: false
            });
            this.isOnButton = false;
            break;
        }
      },
    },
    onLoad(option) {
      if (option.hideChildTable) {
        this.hideChildTable = true
      }
      if (option.formButtonDisp) {
        try {
          this.formButtonDisp = JSON.parse(option.formButtonDisp)
        } catch (e) {
          //TODO handle the exception
        }
      }
      uni.$on('dataChange', () => {
        this.getDetail()
      })
      if (option.serviceName) {
        this.serviceName = option.serviceName;
        if (option.appName) {
          this.appName = option.appName
        }
        if (option.destApp) {
          this.appName = option.destApp
        }
        if (option.disabledChildButton) {
          this.disabledChildButton = true
        }
        if (option.disabled) {
          this.disabled = true
        }
        if (option.cond) {
          let cond = {}
          try {
            cond = JSON.parse(decodeURIComponent(option.cond))
          } catch (e) {
            //TODO handle the exception
            try {
              cond = JSON.parse(option.cond)
            } catch (e) {
              //TODO handle the exception
            }
          }

          if (Array.isArray(cond)) {
            this.fieldsCond = cond.filter(item => {
              item.column = item.colName
              if (item.ruleType === 'eq') {
                return item.value
              } else {
                return true
              }
            })
          } else if (typeof cond === 'object' && Object.keys(cond).length > 0) {
            let arr = []
            Object.keys(cond).forEach(key => {
              let obj = {
                colName: key,
                ruleType: 'eq',
                value: cond[key]
              }
              obj.column = obj.colName
              arr.push(obj)
            })
            this.fieldsCond = arr.filter(item => {
              if (item.ruleType === 'eq') {
                return item.value
              } else {
                return true
              }
            })
          }

        }

        if (option.fieldsCond) {
          try {
            this.fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond))
          } catch (e) {
            //TODO handle the exception
          }
        }
        if ((!this.fieldsCond || (Array.isArray(this.fieldsCond) && this.fieldsCond.length === 0)) && option.id) {
          this.fieldsCond = [{
            column: 'id',
            ruleType: 'eq',
            value: option.id
          }]
        }
        this.getDetailV2()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../common/top-card';

  .detail-wrap {
    // padding: 20rpx;
    background-color: #F5F5F5;
    min-height: calc(100vh - var(--window-top));
    max-width: 1500px;
    margin: 0 auto;
  }

  .detail-temp-box {
    .detail-top {
      display: flex;
      background-color: #fff;
      border-radius: 20rpx;
      margin-bottom: 20rpx;
      padding: 30rpx;

      .left-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        margin-right: 30rpx;

        .image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .cols-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;

        .col-item {
          display: flex;

          .label {
            margin-bottom: 10rpx;
            margin-right: 20rpx;
          }
          .value{
            flex: 1;
            
          }
        }
      }
    }

    .other-col {
      background-color: #fff;
      border-radius: 20rpx;
      margin-bottom: 20rpx;
      padding: 20rpx;

      .col-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;

        .label {
          margin-right: 20rpx;
          margin-bottom: 10rpx;
        }

        .value {
          text-align: right;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .label-top {
          width: 100%;
        }
      }
    }
  }

  // .top-card {
  // 	background-color: #fff;
  // 	display: flex;
  // 	width: 100%;
  // 	margin-bottom: 20rpx;
  // 	border: 1px solid #f1f1f1;
  // 	// border-radius: 20rpx;
  // 	overflow: hidden;
  // 	box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  // 	align-items: center;
  // 	color: #666;

  // 	.left-image {
  // 		width: 200rpx;
  // 		height: 200rpx;
  // 		text-align: center;
  // 		line-height: 200rpx;

  // 		.u-image {
  // 			width: 200rpx;
  // 			height: 200rpx;
  // 		}
  // 	}

  // 	.top-content {
  // 		padding: 10rpx;
  // 		flex: 1;

  // 		// display: flex;
  // 		// flex-direction: column;
  // 		// justify-content: center;
  // 		.top-title-bar {
  // 			display: flex;

  // 			.title {
  // 				font-size: 32rpx;
  // 				font-weight: bold;
  // 				flex: 1;

  // 				.label {
  // 					font-weight: normal;
  // 				}
  // 			}

  // 			.sub-title {
  // 				// border-top: 1px solid #999;
  // 				// border-bottom: 1px solid #999;
  // 				// // border-radius: 50rpx;
  // 				// padding: 5rpx 10rpx;
  // 				max-width: 45%;
  // 			}
  // 		}

  // 		.top-item {
  // 			display: flex;
  // 			align-items: center;
  // 			margin-bottom: 10rpx;

  // 			.label {
  // 				// font-size: 24rpx;
  // 				margin-right: 5rpx;
  // 			}
  // 		}

  // 		.top-center {
  // 			display: flex;
  // 			flex-wrap: wrap;

  // 			.top-item {
  // 				min-width: 45%;
  // 				overflow: auto;
  // 				white-space: nowrap;
  // 				margin-right: 20rpx;

  // 				.value {
  // 					color: #000000;
  // 				}
  // 			}
  // 		}

  // 		.top-footer {
  // 			color: #999;

  // 			.top-item {
  // 				margin-bottom: 0;
  // 			}
  // 		}
  // 	}
  // }
  .detail-form {
    width: 100%;
    background-color: #fff;
    overflow: hidden;
    height: auto;

    .form-wrap {
      opacity: 0;
      height: 0;
      transform: translateY(-500px);
      transition: transform .5s ease-in-out;

      &.show {
        border-top: 1rpx solid #f1f1f1;
        margin-bottom: 20rpx;
        transform: translate(0);
        height: auto;
        opacity: 1;
      }

      .bx-form {
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
        width: calc(100% - 20px);
        padding-right: 0;
        padding-bottom: 0;

      }

    }
  }

  .child-service-fold {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    padding: 20rpx 0;

    .bg-green {
      background-color: #0bc99d;
    }

    .bg-orange {
      background-color: #f37b1d;
    }

    .bg-blue {
      background-color: #0081ff;
      color: #ffffff;
    }
  }

  .handler-bar {
    display: flex;
    width: 100%;

    .show-or-hide {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .button-box {
      justify-content: flex-end;
      padding-right: 20rpx;

      .bg-cyan {
        background-color: #0BC99D;
      }

      .cu-btn {
        min-width: 25%;
        // margin-right: 20rpx;
        margin-left: 20rpx;
      }
    }
  }

  .child-service-box {
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
</style>
