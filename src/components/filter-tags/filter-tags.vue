<template>
  <view class="filter-tags-view">

    <view class="filter-form" v-if="dispMode==='custom'">
      <view class="filter-tags-box" v-if="setTabs&&setTabs.length>0">
        <button class="cu-btn round sm  margin-right-xs"
          :class="{'':!tab.active,' active-tag':formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]&&formModel[tab.list_tab_no].value}"
          v-for="(tab,tabIndex) in setTabs" :key="tabIndex" @click="showModal(tab,tabIndex)" v-if="isFold(tab)">
          <text class="label">
            <text
              v-if="formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]&&formModel[tab.list_tab_no].value">{{formModel[tab.list_tab_no].fkFieldLabel||formModel[tab.list_tab_no].value}}</text>
            <text v-else>{{tab.label||''}}</text>
          </text>
          <text class="cuIcon-right margin-left-xs" style="transform: rotate(90deg);"></text>
        </button>
      </view>

      <view class="filter-form">
        <view class="filter-form-item" :label="tab.label" v-for="(tab,tabIndex) in setTabs" :key="tabIndex"
          v-if="!isFold(tab)">
          <view class="label" :class="{'pc-model':sysModel==='PC'}"
            v-if="(!tab.more_config.showLabel&&tab.more_config.showLabel!==false)||sysModel==='PC'">
            {{tab.label||''}}
          </view>
          <view class="form-item-content" v-if="formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]">
            <view v-if="tab._type === 'input'">
              <input col="2" :placeholder="tab.placeholder" clearable :name="tab.list_tab_no"
                v-model="formModel[tab.list_tab_no].value"></input>
            </view>
            <view v-if="tab._type === 'fk'">
              <bx-radio-group mode="button" activeBg="#FBEAE7" activeColor="#FE5A3F"
                v-model="formModel[tab.list_tab_no].value">
                <bx-radio :name="item.value" :key="item.value" :allowCanel="true" v-for="(item,index) in tab.options">
                  {{item.label||''}}
                </bx-radio>
              </bx-radio-group>
            </view>
            <view v-if="tab._type === 'checkbox'">
              <bx-checkbox-group mode="button" v-model="formModel[tab.list_tab_no].value" v-if="tab._colSrvData">
                <bx-checkbox v-model="item.checked" v-for="item in tab.options" :key="item.value" :name="item.value">
                  {{ item.label }}
                </bx-checkbox>
              </bx-checkbox-group>
            </view>
            <view v-if="tab._type === 'radio'&&tab._colSrvData" v-show="tab&&tab.options && tab.options.length > 0">
              <bx-radio-group mode="button" activeBg="#FBEAE7" activeColor="#FE5A3F" :allowCanel="true"
                v-model="formModel[tab.list_tab_no].value">
                <bx-radio :name="item.value" :key="item.value" :allowCanel="true" v-for="(item,index) in tab.options">
                  {{item.label||''}}
                </bx-radio>
              </bx-radio-group>
            </view>
          </view>
        </view>
      </view>

    </view>

    <view class="filter-tags-box" v-else-if="mode==='fold'&&setTabs&&setTabs.length>0">
      <button class="cu-btn round sm margin-right-xs"
        :class="{'':!tab.active,' active-tag':formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]&&formModel[tab.list_tab_no].value}"
        v-for="(tab,tabIndex) in setTabs" :key="tabIndex" @click="showModal(tab,tabIndex)">
        <text class="label">
          <text
            v-if="formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]&&formModel[tab.list_tab_no].value">{{formModel[tab.list_tab_no].fkFieldLabel||formModel[tab.list_tab_no].value}}</text>
          <text v-else>{{tab.label||''}}</text>
        </text>
        <text class="cuIcon-right margin-left-xs" style="transform: rotate(90deg);"></text>
      </button>
    </view>



    <view class="filter-form" v-else-if="mode==='unfold'&&setTabs&&setTabs.length>0" @click.prevent.captur="">
      <view class="filter-form-item" :label="tab.label" v-for="(tab,tabIndex) in setTabs" :key="tabIndex">
        <view class="label" :class="{'pc-model':sysModel==='PC'}"
          v-if="(!tab.more_config.showLabel&&tab.more_config.showLabel!==false)||sysModel==='PC'">
          {{tab.label||''}}
        </view>
        <view class="form-item-content" v-if="formModel&&tab.list_tab_no&&formModel[tab.list_tab_no]">
          <view v-if="tab._type === 'input'">
            <input col="2" :placeholder="tab.placeholder" clearable :name="tab.list_tab_no"
              v-model="formModel[tab.list_tab_no].value"></input>
          </view>
          <view v-if="tab._type === 'between'">
            <view class="">
              选择日期
            </view>
            <view class="">
              -
            </view>
            <view class="">
              选择时间
            </view>
          </view>
          <view v-if="tab._type === 'select'">

          </view>
          <view v-if="tab._type === 'tree'">

          </view>
          <view v-if="tab._type === 'checkbox'">
            <bx-checkbox-group mode="button" v-model="formModel[tab.list_tab_no].value" v-if="tab._colSrvData">
              <bx-checkbox v-model="item.checked" v-for="item in tab.options" :key="item.value" :name="item.value">
                {{ item.label }}
              </bx-checkbox>
            </bx-checkbox-group>
          </view>
          <view v-if="tab._type === 'radio'&&tab._colSrvData" v-show="tab&&tab.options && tab.options.length > 0">
            <bx-radio-group mode="button" activeBg="#FBEAE7" activeColor="#FE5A3F"
              v-model="formModel[tab.list_tab_no].value">
              <bx-radio :name="item.value" :key="item.value" v-for="(item,index) in tab.options">
                {{item.label||''}}
              </bx-radio>
            </bx-radio-group>
          </view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{show:showTagsModal&&index===curTag,'option-selector':item._type=='fk'}"
      @click="showModal()" v-for="(item,index) in setTabs">
      <view class="cu-dialog" @click.stop="" v-if="curTag==index&& item&&item.list_tab_no&&formModel[item.list_tab_no]">
        <view class="label">
          {{item.label}}
        </view>
        <tree-selector :srvInfo="item.more_config.srvInfo" :srvApp="srvApp" @cancel="showModal()"
          :current="item.selectTreeData" @confirm="getCascaderValue" @reset="onreset" ref="treeSelector"
          v-if="item&&item&&item._type=='tree'&&item.more_config&&item.more_config.srvInfo">
        </tree-selector>
        <option-selector :has-next="false" modalName="Selector" :allowCanel="true" :show-search="false"
          :options="item.selectorData" :selectType="''" @load-more="nextPage()" @hide="showModal()"
          @search="searchFKDataWithKey" @refresh="refresh()" @toFkAdd="toFkAdd" @change="pickerChange"
          v-else-if="item&&item&&item._type=='fk'&&item.more_config&&item.more_config.srvInfo&&item.selectorData&&item.selectorData.length>0">
        </option-selector>
        <bx-radio-group mode="button" v-model="formModel[item.list_tab_no].value" @change="radioChange" v-else>
          <bx-radio :name="item.value" :key="item.value" v-for="(item,rIndex) in item.options">
            <view class="radio-label">
              {{item.label||''}}
            </view>
          </bx-radio>
        </bx-radio-group>
      </view>
    </view>

  </view>
</template>

<script>
  import {
    getDateOfNow,
    getWeekStartAndEnd,
    getDayStartAndEnd,
    getMonthStartAndEnd,
    getYearStartAndEnd
  } from '@/common/date_util.js'
  export default {
    name: "filter-tags",
    data() {
      return {
        inputMoreConfig: {
          value: "",
          options: [{
            'label': '匹配开始',
            'value': 'like]'
          }, {
            'label': '匹配尾部',
            'value': '[like'
          }]
        },
        setTabs: [],
        curTag: 0,
        curTagSelected: '',
        curTagButtons: [],
        formModel: {},
        onInputValue: false, // 是否有输入值
        showTagsModal: false,
        fkFieldLabel: '',
        page: {
          pageNo: 1,
          total: 0,
          rownumber: 50
        }
      };
    },
    computed: {
      foldTabs() {
        return this.setTabs.filter(item => item.showAllTag !== true)
      },
      unfoldTabs() {
        return this.setTabs.filter(item => item.showAllTag === true)
      },
      dispMode() {
        let mode = this.mode;
        if (mode == 'fold' && this.tabs.find(item => item.showAllTag == true)) {
          // 如果配置的是折叠模式但是tabs中又有配置显示所有标签
          mode = 'custom'
        }
        return mode
      },
      srvInfo() {
        return this?.setTabs?. [this.curTag]?.more_config?.srvInfo || this?.setTabs?. [this.curTag]?._colSrvData?. [0]
          ?.option_list_v2
      },
      srvApp() {
        return this.srvInfo?.appNo || this?.setTabs[this.curTag]?.app || uni.getStorageSync('activeApp')
      },
      sysModel() {
        return getApp().globalData.systemInfo?.model
      },
    },
    props: {
      tabs: {
        type: Array,
        default: function() {
          return [];
        }
      },
      cols: {
        type: Array,
        default: function() {
          return [];
        }
      },
      srv: {
        type: String,
        default: function() {
          return '';
        }
      },
      mode: {
        // fold-折叠 只显示类别 点击弹框选择筛选标签
        // unfold-展开 直接选择标签
        type: String,
        default: "unfold"
      }
    },
    methods: {
      isFold(e) {
        return e?.showAllTag !== true
      },
      refresh() {
        this.setTabs[this.curTag].pageInfo.pageNo = 1
        this.getSelectorData('refresh')
      },
      nextPage() {
        this.setTabs[this.curTag].pageInfo.pageNo += 1
        this.getSelectorData()
      },
      async getSelectorData(cond, serv, relation_condition) {
        let self = this;

        let req = {
          serviceName: serv || self.srvInfo.serviceName || '',
          colNames: ['*'],
          condition: [],
          page: {
            pageNo: this.setTabs[this.curTag]?.pageNo,
            rownumber: this.setTabs[this.curTag]?.rownumber
          }
        };
        let globalData = getApp().globalData
        let appName = self.srvInfo?.srv_app || self.srvApp || uni.getStorageSync(
          'activeApp');

        if (cond && Array.isArray(cond)) {
          req.condition = cond;
        } else if (self.srvInfo && Array.isArray(self.srvInfo.conditions) &&
          self.srvInfo.conditions.length > 0) {
          let condition = self.deepClone(self.srvInfo.conditions);
          const data = {}
          const keys = Object.keys(this.formModel)
          if (keys.length > 0) {
            keys.forEach(key => {
              data[key] = this.formModel[key].value
            })
          }

          condition = condition.map(item => {
            if (typeof item.value === 'string' && item.value) {
              if (item.value.indexOf('top.user.user_no') !== -1) {
                item.value = uni.getStorageSync('login_user_info').user_no;
              } else if (item.value.indexOf('globalData.') !== -1) {
                let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
                if (globalData && globalData[colName]) {
                  item.value = globalData[colName];
                }
              } else if (item.value.indexOf('data.') !== -1) {
                let colName = item.value.slice(item.value.indexOf('data.') + 5);
                if (data && data[colName]) {
                  item.value = data[colName];
                }
              } else if (item.value.indexOf("'") === 0 && item.value.lastIndexOf(
                  "'") === item.value
                .length - 1) {
                item.value = item.value.replace(/\'/gi, '');
              }
            }
            if (item.value_exp) {
              delete item.value_exp;
            }
            return item;
          });
          if (Array.isArray(condition) && condition.length > 0) {
            req.condition = condition;
          } else {
            // return;
            // if(this.fieldData.value){
            // 	debugger
            // 	req.condition = [{
            // 		colName:this.fieldData.option_list_v2?.refed_col,
            // 		ruleType:'like',
            // 		value:this.fieldData.value
            // 	}]
            // }
          }
        }

        if (relation_condition && typeof relation_condition === 'object') {
          req.relation_condition = relation_condition;
          delete req.condition;
        }

        if (!req.serviceName) {
          return;
        }

        if (!appName) {
          return
        }


        let res = await self.onRequest('select', req.serviceName, req, appName);
        let selectorData = []
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          if (res.data.page) {
            this.setTabs[this.curTag].pageInfo = res.data.page;
          }

          if (res.data.page && res.data.page.pageNo > 1) {
            let data = res.data.data;
            selectorData = [selectorData, ...data];
          } else {
            selectorData = res.data.data;
          }
          selectorData = selectorData.map(item => {
            const config = this.deepClone(this.srvInfo);
            // item.label = `${item[config.key_disp_col]||''}/${item[config.refed_col]||''}`
            item.label = config.show_as_pair === true ?
              `${item[ config.key_disp_col||'' ]}/${item[ config.refed_col ]}` : item[config
                .key_disp_col]
            item.value = config.refed_col ? item[config.refed_col] : '';
            return item;
          });
        } else if (res.data.state === 'SUCCESS' && res.data.data.length == 0) {
          if (res.data.page) {
            selectorData = res.data.page;
          }
        } else if (req.serviceName === 'srvsys_service_columnex_v2_select' && res.data && res.data.data &&
          Array.isArray(res.data.data.srv_cols)) {
          selectorData = res.data.data.srv_cols.map(item => {
            item.checked = false;
            return item;
          });
        }
        let tabs = this.setTabs[this.curTag]
        tabs.selectorData = selectorData
        this.$set(this.setTabs, this.curTag, tabs)
      },
      toFkAdd() {
        const option_list_v2 = this.srvInfo()
        if (option_list_v2?.serviceName) {
          let serviceName = option_list_v2.serviceName.replace('_select', '_add')
          let url = `/publicPages/formPage/formPage?serviceName=${serviceName}&type=add`
          if (option_list_v2.srv_app) {
            url += `&destApp=${option_list_v2.srv_app}`
          }
          uni.navigateTo({
            url
          })
        }
      },
      clearRelationVal(list_tab_no) {
        // 清除关联字段的值
        if (list_tab_no) {
          let colName = this.formModel[list_tab_no].colName.reduce((res, cur) => cur, '')
          if (colName) {
            this.setTabs.forEach((item, index) => {
              if (Array.isArray(item?.more_config?.srvInfo?.conditions) && item?.more_config?.srvInfo
                ?.conditions.find(
                  e => e.value && e.value === `data.${colName}`)) {
                this.formModel[this.setTabs[index].list_tab_no].value = ''
                this.clearRelationVal(this.setTabs[index].list_tab_no)
              }
            })
          }
        }
      },
      pickerChange(val, e) {
        this.formModel[this.setTabs[this.curTag].list_tab_no].value = val
        const list_tab_no = this.setTabs[this.curTag].list_tab_no
        this.clearRelationVal(list_tab_no)
        this.radioChange(val, e)
      },
      onreset() {
        let curTag = this.setTabs[this.curTag]
        curTag.fkFieldLabel = ''
        curTag.selectTreeData = {}
        // this.formModel[curTag.list_tab_no] = ''
        this.formModel[curTag.list_tab_no].value = ''
        this.showTagsModal = false
        this.$emit('on-change', true)
      },
      getCascaderValue(e) {
        let curTag = this.setTabs[this.curTag]
        let srvInfo = curTag?.more_config?.srvInfo;
        let value = ''
        if (e?.type == '自行输入') {
          value = e.value;
          curTag.fkFieldLabel = e.value
        } else {
          if (!curTag.selectTreeData || (e && srvInfo?.refed_col && e[srvInfo.refed_col] !== curTag.selectTreeData[
              srvInfo
              .refed_col])) {
            curTag.selectTreeData = e
            curTag.fkFieldLabel = srvInfo?.show_as_pair === true ?
              `${e[ srvInfo.key_disp_col ]}/${e[ srvInfo.refed_col ]}` : e[srvInfo.key_disp_col];
            value = e[srvInfo.refed_col];
          }
        }
        if (srvInfo?.outputCol || srvInfo?.output_col) {
          value = e?. [srvInfo?.outputCol || srvInfo?.output_col]
        }

        let col = {
          colName: curTag._colName,
          value: value,
          inputType: curTag.inputType,
          default: curTag.default
        }

        col.formType = curTag._type
        col.tags = curTag.more_config.tags || []
        if (e == '_unlimited_') {
          col.value = ''
        }
        this.setTabs[this.curTag].currentSelect = col.value || {}
        this.formModel[curTag.list_tab_no] = col
        this.showTagsModal = !this.showTagsModal
      },
      radioChange(val, e) {
        let curTag = this.setTabs[this.curTag]
        let col = {
          colName: curTag._colName,
          value: val,
          inputType: curTag.inputType,
          default: curTag.default
        }

        const srvInfo = this.srvInfo
        if (srvInfo?.key_disp_col && srvInfo?.refed_col && e) {
          col.fkFieldLabel = srvInfo?.show_as_pair === true ?
            `${e[ srvInfo.key_disp_col ]}/${e[ srvInfo.refed_col ]}` : e[srvInfo.key_disp_col];
        }
        col.colName = curTag._colName
        col.inputType = curTag.inputType
        col.formType = curTag._type
        col.tags = curTag.more_config.tags || []
        if (e == '_unlimited_') {
          col.value = ''
        }
        this.formModel[curTag.list_tab_no] = col
        this.showTagsModal = !this.showTagsModal
      },
      showModal(tag, index) {
        let oldTag = this.curTag
        this.showTagsModal = !this.showTagsModal
        if (this.showTagsModal) {
          this.curTag = index
          if (this.setTabs[index]?._type === 'tree') {
            // if (index !== oldTag) {
            //   this.$nextTick(_ => {
            //     this.$refs?.treeSelector?.reset?.()
            //     this.showTagsModal = true
            //   })
            // }
            // this.$nextTick(_ => {
            //   this.$refs?.treeSelector?.getData?.()
            // })
          } else if (this.setTabs[index]._type === 'fk') {
            this.getSelectorData()
          } else {
            this.curTagButtons = tag?.options
          }

        } else {
          this.curTagSelected = ''
          this.curTagButtons = []
        }
      },
      async onBuildFormValues() {
        let self = this
        let tabs = this.deepClone(this.tabs)
        let model = {}
        for (let index in tabs) {
          const item = tabs[index]

          let col = {
            colName: item._colName,
            value: "",
            inputType: item.inputType,
            formType: "",
            default: item.default,
            selectTreeData: null,
            fkFieldLabel: "",
            srvInfo: item?.more_config?.srvInfo
          }


          item.options = self.getTabOptions(item)
          col.colName = item._colName
          col.inputType = item.inputType
          col.formType = item._type
          col.tags = item?.more_config?.tags || []
          if (item.inputType == 'group') {
            col.tags = item.options
          }
          if (item._type === 'checkbox' || item._type === 'radio') {
            if (item._type === 'radio') {
              col.value = item.default == '' ? '' : item.default
            } else {
              col.value = item.default == '' ? [] : item.default.split(',')
            }

            if (item.showAllTag && Array.isArray(col.value) && col.value.length == 0) {
              col.value.unshift('_unlimited_')
            }

            model[item.list_tab_no] = col
          } else if (item._type === 'input') {
            col.value = item.default
            model[item.list_tab_no] = col
          } else if (item._type === 'tree') {
            col.value = item.default || null
            model[item.list_tab_no] = col
            tabs[index].selectTreeData = {}

          } else if (item._type === 'fk' && this.dispMode == 'custom') {
            if (item.showAllTag == true) {
              let srvInfo = item?.more_config?.srvInfo
              if (srvInfo?.serviceName) {
                let req = {
                  serviceName: srvInfo.serviceName,
                  colNames: ['*'],
                  condition: srvInfo?.conditions || [],
                  page: {
                    pageNo: 1,
                    rownumber: 100
                  }
                };
                let res = await this.onRequest('select', req.serviceName, req, srvInfo?.srv_app);
                if (Array.isArray(res?.data?.data)) {
                  tabs[index].options = res.data.data.map(e => {
                    e.label = e[srvInfo?.key_disp_col] || e[srvInfo?.refed_col]
                    e.value = e[srvInfo?.refed_col]
                    return e
                  })
                }
              }
            }
            model[item.list_tab_no] = col
          } else {
            model[item.list_tab_no] = col
          }

          tabs[index].pageInfo = {
            pageNo: 1,
            rownumber: 50,
            total: 0
          }

        }

        this.setTabs = tabs
        if (tabs.length > 0) {
          this.curTagButtons = tabs[0]?.options
        }
        console.log('tabs,', tabs)
        self.formModel = model
      },
      getTabSrvCol(tab) {
        let col = tab._colName
        //   tab._colName = col.split(',')
        let cols = tab._colName
        let srvCols = this.cols
        for (let key in cols) {
          for (let c in srvCols) {
            if (cols[key] === srvCols[c].columns) {
              return srvCols[c]
            }
          }
        }
      },
      onChange(e, t) {
        //console.log(e)
      },
      getChecked(e, val) {
        let checked = false
        let checkedItem = e.join(',')
        if (checkedItem.indexOf('_unlimited_') !== -1 && val === '_unlimited_') {
          return true
        } else {
          return false
        }
      },
      onCheckChange(e, item, tabno) {
        //   this.formModel[n].value =
        // 初始不限选项的选中切换
        let self = this

        if (e === true && item.value === '_unlimited_') {
          self.formModel[tabno].value = ['_unlimited_']
        } else if (e === true && item.value !== '_unlimited_') {
          let val = self.formModel[tabno].value
          self.formModel[tabno].value = val.filter((citem, index) => {
            if (citem !== '_unlimited_') {
              return citem
            }
          })
        }
      },
      onReset() {
        this.onBuildFormValues()
      },
      getTabOptions(tab) {
        let self = this
        if (tab.hasOwnProperty('_colSrvData')) {
          let scol = tab._colSrvData
          let col = tab._colName
          let options = []
          if (tab._type === 'select' || tab._type === 'checkbox' || tab._type === 'radio') {
            if (tab.inputType === 'Enum' || tab.inputType === 'Dict') {
              options = []
              tab['value'] = []
              for (let c = 0; c < col.length; c++) {
                for (let cs = 0; cs < scol.length; cs++) {
                  if (col[c] === scol[cs].columns && scol[cs].col_type === 'Enum') {
                    options = scol[cs].option_list_v2
                    if (tab.showAllTag && options !== undefined) {
                      options.unshift({
                        "label": "不限",
                        "value": "_unlimited_",
                      })
                    }
                    return options
                  } else if (col[c] === scol[cs].columns && scol[cs].col_type === 'Dict') {
                    options = scol[cs].option_list_v2
                    if (tab.showAllTag && options !== undefined) {
                      options.unshift({
                        "label": "不限",
                        "value": "_unlimited_",
                      })
                    }
                    return options
                  }
                }
              }
            } else if (tab.inputType === 'BetweenNumber' || tab.inputType === 'Date' || tab.inputType === 'DateTime' ||
              tab.inputType === 'String') {
              tab['value'] = []
              options = []
              let opts = tab.more_config.tags
              for (let cs = 0; cs < opts.length; cs++) {
                let obj = {
                  "label": "",
                  "value": "",
                }
                obj.label = opts[cs].tagName
                obj.value = opts[cs].value
                obj.ruleType = opts[cs].ruleType
                obj.checked = opts[cs].default === undefined ? false : opts[cs].default
                options.push(obj)
              }
              if (tab.showAllTag && options !== undefined) {
                options.unshift({
                  "label": "不限",
                  "value": "_unlimited_",
                })
              }
              // tab.options = options
              // console.log(options)
              return options
            } else if (tab.inputType === 'group') {
              let options = []
              self.buildGroupTags(tab).then((res) => {

                let opts = res
                for (let cs = 0; cs < opts.length; cs++) {
                  let obj = {
                    "label": "",
                    "value": "",
                  }
                  obj.label = opts[cs].tagName
                  obj.value = opts[cs].value
                  obj.ruleType = opts[cs].ruleType
                  obj.checked = opts[cs].default === undefined ? false : opts[cs].default
                  options.push(obj)
                }

              })
              self.$set(tab, 'options', options)
              return options
            }
          }
        } else {
          return []
        }
      },
      buildGroupTags(e) {
        let self = this
        let colName = e._colName[0] || ''
        let group = [{
          colName: colName,
          type: "by"
        }]

        return new Promise((resolve, reject) => {
          let options = []
          self.select(this.srv, [], null, null, group, null).then((res) => {
            let resData = res.data.data
            for (let i = 0; i < resData.length; i++) {
              let item = resData[i]
              let opt = {
                ruleType: "eq",
                tagName: item[colName],
                value: item[colName]
              }
              if (item[colName]) {
                options.push(opt)
              }

            }
            resolve(options)
          })
        })
      },
      buildConditions(returnVal = false) {
        let self = this
        let condsModel = self.formModel
        let relation_Conditions = {
          "relation": "AND",
          "data": []
        }
        let tabs = Object.keys(condsModel)

        let colData = {}
        let relation = {
          "relation": "OR",
          "data": []
        }

        for (let i = 0; i < tabs.length; i++) {
          relation.data = []
          let child_relation = {
            "relation": "AND",
            "data": []
          }

          colData = {
            "colName": "",
            "ruleType": "",
            "value": ""
          }
          if (['checkbox', 'radio', 'tree', 'fk'].includes(condsModel[tabs[i]].formType) && condsModel[tabs[i]].value &&
            condsModel[tabs[i]].value.length !== 0 && condsModel[tabs[i]].value !== '_unlimited_' && condsModel[tabs[i]]
            .value[0] !== '_unlimited_') {
            if (condsModel[tabs[i]].inputType === 'BetweenNumber' || condsModel[tabs[i]].inputType === 'Date' ||
              condsModel[tabs[i]].inputType === 'DateTime') {
              relation.relation = 'AND'
              relation.data = []
              let values = condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType === 'DateTime' ?
                self.formatDateValues(condsModel[tabs[i]].value) : condsModel[tabs[i]].value
              for (let v = 0; v < values.length; v++) {
                child_relation = {
                  "relation": "AND",
                  "data": []
                }

                let betval = values[v].split(",")
                for (let j = 0; j < betval.length; j++) {
                  colData = {
                    "colName": "",
                    "ruleType": "",
                    "value": ""
                  }
                  if (betval[j] !== '-') {
                    if (j === 0 && betval[j] !== '-') {
                      colData.colName = condsModel[tabs[i]].colName[0]
                      colData.value = condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType ===
                        'DateTime' ? betval[j] : Number(betval[j])
                      colData.ruleType = betval.length > 1 ? "ge" : "like" // 只有一个只时候 按照 like 查询

                    } else if (betval[j] !== '-') {
                      colData.colName = condsModel[tabs[i]].colName[0]
                      colData.value = condsModel[tabs[i]].inputType === 'Date' || condsModel[tabs[i]].inputType ===
                        'DateTime' ? betval[j] : Number(betval[j])
                      colData.ruleType = "le"
                    }
                    if (values.length > 1) {
                      child_relation.data.push(self.deepClone(colData))
                    } else {
                      relation.data.push(self.deepClone(colData))
                    }
                  }
                }

                if (values.length > 1) {
                  relation.relation = 'OR' // 大于1个选项时处理 OR
                  relation.data.push(self.deepClone(child_relation))
                }
              }
            } else if (['Enum', 'Dict', 'group'].includes(condsModel[tabs[i]].inputType)) {
              let value = ''
              if (['tree', 'radio', 'fk'].includes(condsModel[tabs[i]].formType)) {
                value = condsModel[tabs[i]].value
              } else if (Array.isArray(condsModel[tabs[i]].value) && condsModel[tabs[i]].value.length > 0) {
                value = condsModel[tabs[i]].value.join(",")
              }
              relation.relation = 'OR'

              colData.colName = condsModel[tabs[i]].colName[0]
              colData.value = value
              // colData.ruleType = "in"
              if (value && value.indexOf(',') !== -1) {
                colData.ruleType = "in"
              } else {
                colData.ruleType = "like"
              }
              relation.data.push(self.deepClone(colData))


            } else if (condsModel[tabs[i]].inputType === 'String') {
              let tags = condsModel[tabs[i]].tags
              // let rt = 
              let val = condsModel[tabs[i]].value
              if (typeof val === 'string') {
                val = val.split(',')
              }
              if (Array.isArray(val)) {
                for (let j = 0; j < val.length; j++) {
                  let rt = tags.find((item) => {
                    if (item.value === val[j]) {
                      return true
                    }
                  })
                  relation.relation = 'OR'
                  colData.colName = condsModel[tabs[i]].colName[0]
                  colData.ruleType = rt?.ruleType || 'like'
                  colData.value = rt?.value || ''
                  relation.data.push(self.deepClone(colData))
                }
              }
            }

          } else if (condsModel[tabs[i]].formType === 'input' && condsModel[tabs[i]].value && condsModel[tabs[i]].value
            .length !== 0) {
            child_relation = {
              "relation": "OR",
              "data": []
            }
            for (let col = 0; col < condsModel[tabs[i]].colName.length; col++) {
              colData.colName = condsModel[tabs[i]].colName[col]
              colData.value = condsModel[tabs[i]].value
              if (self.inputMoreConfig.value !== '') {
                colData.ruleType = self.inputMoreConfig.value
              } else {
                colData.ruleType = "[like]"
              }
              relation.data.push(self.deepClone(colData))
            }
          }

          if (relation.data.length !== 0) {
            relation_Conditions.data.push(self.deepClone(relation))
          }
        }
        if (returnVal == true) {
          return {
            relation_condition: relation_Conditions,
            value: this.formModel?. [this.tabs?. [this.curTag]?.list_tab_no]?.value
          }
        }
        return relation_Conditions

      },
      formatDateValues(e) {
        let exps = e
        let typeConfig = ['nowDay', 'nowWeek', 'nowMonth', 'nowYear', 'today', 'yesterday', 'tomorrow']
        let type = null // nowDay | nowWeek | nowMonth | nowYear
        let increment = 0
        for (let key in typeConfig) {
          if (exps.indexOf(typeConfig[key]) !== -1) {
            type = typeConfig[key]
          }
        }
        let startAndEnd = (exps.indexOf(',') !== -1 ? exps.split(',') : [exps])
        if (startAndEnd[0] == type) {
          increment = (startAndEnd.length == 1 ? 0 : startAndEnd[1])
        } else {
          increment = -startAndEnd[0]
        }
        let result = ''
        switch (type) {
          case 'today':
          case 'yesterday':
          case 'tomorrow':
            result = getDateOfNow(type)
            break;
          case 'nowDay':
            result = getDayStartAndEnd(increment)
            break;
          case 'nowWeek':
            result = getWeekStartAndEnd(increment)
            break;
          case 'nowMonth':
            result = getMonthStartAndEnd(increment)
            break;
          case 'nowYear':
            result = getYearStartAndEnd(increment)
            break;
        }
        return result

      }
    },
    watch: {
      'formModel': {
        deep: true,
        immediate: true,
        handler: function(val, oldVal) {
          let keys = Object.keys(val)
          let onNew = false
          let newNum = 0
          for (let i = 0; i < keys.length; i++) {
            if (val[keys[i]].hasOwnProperty('value') && val[keys[i]].value && val[keys[i]].value.length !== 0) {
              newNum++
            }
          }
          if (keys.length > 0) {
            if (newNum !== 0) {
              this.onInputValue = true
              this.$emit('on-input-value', true)
            } else {
              this.onInputValue = false
              this.$emit('on-input-value', false)
            }
            this.$emit('on-change', true)
          }

        }
      },
    },
    mounted() {
      this.onBuildFormValues()
    }
  }
</script>

<style lang="scss" scoped>
  .filter-tags-view {
    position: relative;
    background-color: #fff;
  }

  .cur-tag-model {
    position: absolute;
    left: -20px;
    right: -20px;
    z-index: 999;
    height: 1000vh;
    background-color: rgba($color: #000000, $alpha: 0.2);
    margin-top: 5px;

    .cur-tag-dialog {
      min-height: 100px;
      padding: 10px 20px;
      background-color: #fff;
      border-radius: 0 0 40px 40px;

      .radio-label {
        min-width: 60px;
        min-height: 40px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .filter-tags-box {
    // padding: 10px;
    // border: 1rpx solid #f1f1f1;

    .cu-btn {
      min-width: 80px;
      text-align: center;
      position: relative;
      margin-top: 5px;
      font-size: 14px;
      background-color: #f8f8fa;
      border: 1px solid #f1f1f1;

      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        margin-top: 0;
      }
    }

    .active-tag {
      color: #FE5A3F;
      background-color: #FBEAE7;
    }
  }

  .filter-form {
    padding: 10rpx 20rpx;

    // border: 1rpx solid #f1f1f1;
    .filter-form-item {
      display: flex;
      align-items: center;
      padding-bottom: 10rpx;
      justify-content: flex-start;
      // flex-wrap: wrap;
      width: 100%;

      .label {
        margin-right: 20rpx;
        min-width: 20%;
        height: 100%;
        display: flex;
        align-items: flex-start;

        &.pc-model {
          width: 100%;
          color: #474849;
          font-size: 14px;
          font-weight: 600;
          color: #474849;
          margin-bottom: 5px;
        }
      }

      .form-item-content {}
    }
  }

  .cu-modal {
    display: block;
    z-index: 9999;

    &.bottom-modal {
      &.option-selector {
        .cu-dialog {
          background: #fff;
        }
      }

      .cu-dialog {
        min-height: 200px;
        // ::v-deep.tree-selector .content{
        //   background: transparent;
        // }
      }

    }

    .cu-dialog {
      padding: 20px;

      .label {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .radio-label {
        min-width: 80px;
        text-align: center;
        min-height: 25px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
