<template>
  <view class="child-list">
    <view class="section-name">
      <view class="name" @click="unfold">
        <text>{{config.label||''}}</text>
        <text class="cu-load margin-left-xs" :class="loading?'loading':''"></text>
        <view class="unfold" v-if="config.unfold ===false">
          <text class="cuIcon-unfold"></text>
        </view>
      </view>

      <view class="to-more" v-if="config.unfold !==false">
        <button class="cu-btn line-orange round border" v-show="disabled!==true" :class="{sm:publicButton.length>2}"
          v-for="btn in publicButton" @click="onButton(btn)">
          <text class="text">{{btn.button_name||''}}</text></button>
        <button class="cu-btn line-orange round border" :class="{sm:publicButton.length>2}"
          @click="onButton({button_type:'list'})" v-if="listData.length>0"><text class="text">查看全部</text></button>
      </view>
    </view>
    <view class="list-box" v-if="config.unfold !==false">
      <view class="list-item table-head">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{col.label||''}}
        </view>
        <text class="cuIcon-add  more-btn hidden" v-if="!disabled"></text>
        <text class="cuIcon-delete text-black hidden" v-if="showDelete&&!disabled"></text>
      </view>
      <view class="list-item" v-for="(item,index) in listData" v-show="item._dirtyFlags!=='delete'" :key="index"
        @click="onButton({button_type:'edit'},index)">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{item[col.columns]||''|hideYear(removeYearFromDate)}}
        </view>
        <button class="cuIcon-add cu-btn bg-orange light more-btn" v-if="!disabled"
          @click.stop="showAction(item)"></button>
        <text class="cuIcon-delete text-black" v-if="showDelete&&!disabled"
          @click.stop="onChildFormBtn({button_type:'delete'},index)"></text>
      </view>
      <view class="list-item" v-for="(item,index) in initData" @click="onButton({button_type:'editInit'},index)">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{item[col.columns]||''|hideYear(removeYearFromDate)}}
        </view>
        <text class="cuIcon-delete text-black" v-if="showDelete"
          @click.stop="onChildFormBtn({button_type:'delete_init'},index,true)"></text>
      </view>
      <view class="list-item" v-for="(item,index) in memoryListData" @click="onButton({button_type:'editMem'},index)">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{item[col.columns]||''|hideYear(removeYearFromDate)}}
        </view>
        <text class="cuIcon-delete text-black" v-if="showDelete"
          @click.stop="onChildFormBtn({button_type:'delete'},index,true)"></text>
      </view>
      <view class="list-item" v-if="finalListData.length===0">
        <view class="col-item">
          暂无数据
        </view>
      </view>
    </view>
    <view class="unfold" v-if="config.isFold!==true&&config.unfold ===true" @click="unfold">
      <!-- <text>向上折叠</text> -->
      <text class="cuIcon-fold"></text>
    </view>
    <view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='addChildData'}">
      <view class="cu-dialog" @click.stop.prevent="" v-if="addV2&&modalName==='addChildData'">
        <view class="close-btn text-right">
          <button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text class="cuIcon-close"></text></button>
        </view>
        <view class="child-form-wrap">
          <a-form :srvApp="appName" v-if="allFields && isArray(allFields)" :fields="allFields" :pageType="use_type"
            :formType="'add'" ref="childForm" :key="modalName" @value-blur="valueChange" :main-data="mainData"></a-form>
        </view>
        <view class="button-box" v-if="addV2&&addV2.formButton">
          <button class="cu-btn bg-blue" v-for="btn in addV2.formButton"
            @click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
        </view>
      </view>
    </view>
    <batch-add ref="batchAdd" :main-data="mainData" :selectColInfo="selectColInfo" @submit="batchSubmit">
    </batch-add>
    <view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='updateChildData'}">
      <view class="cu-dialog" @click.stop.prevent="" v-if="updateV2&&modalName==='updateChildData'">
        <view class="close-btn text-right">
          <button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text class="cuIcon-close"></text></button>
        </view>
        <view class="child-form-wrap">
          <a-form v-if="allFields && isArray(allFields)" :fields="allFields" :main-data="mainData" :pageType="use_type"
            :formType="'update'" ref="childForm" :key="modalName" @value-blur="updateValueChange"></a-form>
        </view>
        <view class="button-box" v-if="updateV2&&modalName==='updateChildData'&&updateV2.formButton">
          <button class="cu-btn bg-orange round" v-for="btn in updateV2.formButton"
            @click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import dayjs from '@/static/js/dayjs.min.js'
  import batchAdd from '@/publicPages/components/batch-add/batch-add.vue'
  export default {
    components: {
      batchAdd
    },
    data() {
      return {
        v2Data: null,
        addV2: null,
        updateV2: null,
        localListData: [],
        listData: [],
        total: 0,
        rownumber: 5,
        orderCols: [],
        loading: false,
        modalName: "",
        memoryListData: [],
        currentItemIndex: null,
        currentItemType: null,
        selectColInfo: null,
        initData: [],
        curItem: null,
        allFields: [],
      }
    },
    filters: {
      hideYear: (value, isHide) => {
        if (value && isHide) {
          let year = (new Date()).getFullYear()
          value = value.replace(`${year}-`, '')
        }
        return value || ''
      }
    },
    props: {
      mainTable: {
        type: String
      },
      mainServiceName: {
        type: String
      },
      appName: {
        type: String
      },
      config: {
        type: Object
      },
      mainData: {
        type: Object
      },
      mainFkField: {
        type: Array
      },
      disabled: {
        type: [String, Boolean]
      }
    },
    watch: {
      modalName: {
        immediate: true,
        handler(newValue) {
          if (newValue === 'addChildData') {
            if (Array.isArray(this.addV2?._fieldInfo)) {
              this.allFields = this.deepClone(this.addV2?._fieldInfo)
              // this.allFields = this.addV2?._fieldInfo
            }
          } else if (newValue === 'updateChildData') {
            if (Array.isArray(this.updateV2?._fieldInfo)) {
              this.allFields = this.deepClone(this.updateV2?._fieldInfo)
              // this.allFields = this.updateV2?._fieldInfo
            }
          } else {
            this.allFields = []
          }
        },
      },
      finalListData: {
        deep: true,
        handler(newValue, oldValue) {
          console.log(newValue)
          this.$emit('child-list-change', {
            calcRelations: this.config?.calcRelations,
            key: this.config?.foreign_key?.constraint_name,
            data: newValue
          })
        }
      }
    },
    computed: {
      curV2() {
        if (this.modalName === 'addChildData') {
          return this.addV2
        } else if (this.modalName === 'updateChildData') {
          return this.updateV2
        }
      },
      rowButton() {
        return this.v2Data?.rowButton
      },
      calcRelations() {
        return this.config?.calcRelations
      },
      fkMoreConfig() {
        return this.config?.foreign_key?.moreConfig
      },
      showDelete() {
        return this?.v2Data?.use_type && ['update', 'add', 'addchildlist', 'updatechildlist'].includes(this.v2Data
          .use_type)
      },
      setListData() {
        return this.listData.filter(item => item._dirtyFlags !== "delete")
      },
      finalListData() {
        return [...this.listData, ...this.memoryListData, ...this.initData].filter(item => item._dirtyFlags !==
          'delete')
      },
      use_type() {
        return this.config?.use_type || this.v2Data?.use_type
      },
      condition() {
        const foreignKey = this.foreignKey
        const data = this.config
        let formData = this.mainData;
        if (!foreignKey || !formData) {
          return []
        }
        let condition = [{
          colName: foreignKey.column_name,
          ruleType: 'eq',
          value: formData[foreignKey.referenced_column_name]
        }];
        if (data?.srv_app && data?.service_name && foreignKey) {
          condition = [{
            colName: foreignKey.ref_service_column,
            ruleType: "eq",
            value: formData[foreignKey.refed_service_column]
          }];
        }
        return condition
      },
      addService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_add'
        }
      },
      updateService() {
        if (Array.isArray(this.v2Data?.rowButton) && this.v2Data.rowButton.find(item => item.button_type ===
            'edit')) {
          let buttonInfo = this.v2Data.rowButton.find(item => item.button_type === 'edit')
          return buttonInfo?.service_name
        }
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_update'
        }
      },
      deleteService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_delete'
        }
      },
      selectService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_select'
        }
      },
      serviceName() {
        return this.config?.service_name
      },
      foreignKey() {
        return this.config?.foreign_key
      },
      appTempColMap() {
        // 字段关系映射
        return this.moreConfig?.appTempColMap || {}
      },
      moreConfig() {
        return this.v2Data?.moreConfig
      },
      srvApp() {
        return this.appName || uni.getStorageSync('activeApp')
      },
      publicButton() {
        let result = []
        if (Array.isArray(this.v2Data?.gridButton)) {
          let ignoreBtn = ['select', 'batch_delete', 'delete']
          if (this.use_type === 'detaillist') {
            // ignoreBtn.push('add')
          }
          result = this.v2Data.gridButton.filter(item => item.permission === true && !ignoreBtn.includes(item
            .button_type))
          if (this.config?.foreign_key?.moreConfig?.batch_add?.target_column) {
            let batch_add = this.config.foreign_key.moreConfig.batch_add
            let column = this.orderCols.find(item => item.columns === batch_add.target_column)
            if (column?.option_list_v2?.serviceName) {
              result.unshift({
                ...batch_add,
                target_column: batch_add.target_column,
                "appName": batch_add.dest_app || uni.getStorageSync('activeApp'),
                "column_option_list_v2": column.option_list_v2,
                "operate_service": batch_add.add_service,
                "button_name": "批量添加",
                "servcie_type": "add",
                "page_type": "添加子列表",
                "button_type": "batchAdd"
              })
            }
          }
        }
        return result
      },
      colMinWidth() {
        return this.moreConfig?.tableConfig?.col_min_width
      },
      removeYearFromDate() {
        return this.moreConfig?.removeYearFromDate
      },
      showColumn() {
        if (Array.isArray(this.moreConfig?.tableConfig?.columns) && this.moreConfig.tableConfig.columns.length >
          0) {
          return this.orderCols.filter(item => this.moreConfig.tableConfig.columns.includes(item.columns))
        } else if (this.moreConfig?.tableConfig?.columns && !Array.isArray(this.moreConfig?.tableConfig
            ?.columns)) {
          let columns = []
          try {
            columns = this.moreConfig.tableConfig.columns.split(',')
            columns = this.orderCols.filter(item => columns.includes(item.columns))
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
          if (columns.length > 0) {
            return columns
          }
        }

        if (Array.isArray(this.moreConfig?.childTableColumn) && this.moreConfig.childTableColumn.length > 0) {
          return this.orderCols.filter(item => this.moreConfig.childTableColumn.includes(item.columns))
        }
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          const cols = this.orderCols.filter(item => item.columns && item.columns !== 'id' && item.columns
            .indexOf('_no') == -1).slice(0, 4)
          return cols
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
    },
    created() {
      this.getListV2()
    },
    beforeDestroy() {
      uni.$off('dataChange')
    },
    mounted() {
      let self = this
      uni.$on('dataChange', srv => {
        self.getList()
      })
    },
    methods: {
      hasHandlerButton(e) {
        let rowButton = []
        if (Array.isArray(this.rowButton) && this.rowButton.length > 0) {
          rowButton = this.deepClone(this.rowButton)
        }
        if (Array.isArray(e?._buttons) && e._buttons.length >= rowButton.length) {
          rowButton = rowButton.filter((item, index) => e._buttons[index] == 1 && !['duplicate'].includes(item
            .button_type))
        }
        return rowButton.length !== 0
      },
      showAction(e) {
        this.curItem = e;
        let rowButton = []
        if (Array.isArray(this.rowButton) && this.rowButton.length > 0) {
          rowButton = this.deepClone(this.rowButton)
        }
        if (Array.isArray(e?._buttons) && e._buttons.length >= rowButton.length) {
          rowButton = rowButton.filter((item, index) => e._buttons[index] == 1 && !['duplicate'].includes(item
            .button_type))
        }
        if (rowButton.length === 0) {
          uni.showToast({
            icon: 'none',
            title: "没有可用的操作"
          })
          return
        }
        uni.showActionSheet({
          itemList: rowButton.map(item => item.button_name),
          success: (res) => {
            console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
            let obj = {
              row: e,
              button: rowButton[res.tapIndex]
            }
            this.onFootButton(obj)
          },
          fail: (res) => {
            console.log(res.errMsg);
          }
        });
      },
      async onFootButton(data) {
        let self = this
        let buttonInfo = this.deepClone(data.button);
        let rowData = this.deepClone(data.row);
        if (buttonInfo?._buttons) {
          delete buttonInfo._buttons
        }
        if (!buttonInfo?.button_type) {
          uni.showModal({
            title: '提示',
            content: '按钮操作参数配置有误',
            showCancel: false
          })
          return
        }
        if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
          // 序列化操作参数
          try {
            buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
            if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
              .length > 0) {
              buttonInfo.operate_params.condition.forEach(cond => {
                if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
                  cond.value = rowData[cond.value.value_key];
                } else if (typeof cond.value === 'object' && cond.value.value_type ===
                  'constant') {
                  cond.value = cond.value.value;
                }
              });
            }

            if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length >
              0) {
              buttonInfo.operate_params.data.forEach(data => {
                if (typeof data === 'object') {
                  Object.keys(data).forEach(item => {
                    if (typeof data[item] === 'object' && data[item].value_type ===
                      'rowData') {
                      data[item] = rowData[data[item].value_key];
                    } else if (typeof data[item] === 'object' && data[item]
                      .value_type === 'constant') {
                      data[item] = data[item].value;
                    }
                  });
                }
              });
            }
          } catch (e) {
            //TODO handle the exception
          }
        }

        if (buttonInfo.button_type === "customize") {
          if (buttonInfo.operate_type === '删除') {
            this.onButtonToUrl(data, this.appName).then(res => {
              if (res.state === 'SUCCESS') {
                this.getList()
              }
            })

          } else if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
            let req = [{
              serviceName: buttonInfo.operate_service,
              condition: buttonInfo.operate_params.condition,
              data: buttonInfo.operate_params.data
            }];
            if (!buttonInfo.operate_params.data && buttonInfo.servcie_type === 'update') {
              uni.showModal({
                title: '提示',
                content: '按钮操作参数配置有误',
                showCancel: false
              })
              return
            }
            let app = this.appName || uni.getStorageSync('activeApp');
            let url = this.getServiceUrl(buttonInfo.application || app, buttonInfo.operate_service,
              buttonInfo.servcie_type);
            let res = await this.$http.post(url, req);
            if (res.data.state === 'SUCCESS') {
              // this.getList()
              this.getList()
            } else {
              uni.showModal({
                title: "提示",
                content: res.data.resultMessage,
                showCancel: false
              })
            }
            return
          } else if (buttonInfo.operate_type === '更新弹出' || buttonInfo.operate_type === '更新跳转') {
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
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              uni.navigateTo({
                url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
                  params)
              });
              return
            } else if (buttonInfo.servcie_type === 'select') {
              let params = {
                type: 'select',
                serviceName: buttonInfo.service_name,
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
                  .condition)) {
                let viewTemp = {};
                if (buttonInfo.service_name ===
                  'srvhealth_store_vaccination_appoint_record_select') {
                  viewTemp = {
                    title: 'customer_name',
                    img: 'person_image',
                  }
                }
                uni.navigateTo({
                  url: '/publicPages/list/list?pageType=list&serviceName=' +
                    buttonInfo.service_name +
                    '&cond=' +
                    JSON.stringify(buttonInfo.operate_params.condition) +
                    '&viewTemp=' +
                    JSON.stringify(viewTemp)
                });
                return
              }
            } else if (buttonInfo.servcie_type === 'update' || buttonInfo.servcie_type === 'operate') {
              let params = {
                type: 'update',
                serviceName: buttonInfo.service_name,
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              let fieldsCond = [];
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

              if (fieldsCond.length === 0) {
                fieldsCond = [{
                  column: 'id',
                  value: rowData.id
                }]
              }
              let url =
                `/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              if (Array.isArray(condition) && condition.length > 0) {
                url += `&condition=${JSON.stringify(condition)}`
              }
              uni.navigateTo({
                url: url
              });
              return
            }
            return
          } else if (buttonInfo.operate_type === '列表跳转') {

            let app = buttonInfo.application
            let url = '/publicPages/list2/list2?pageType=list&serviceName=' +
              buttonInfo.service_name +
              '&cond=' +
              JSON.stringify(buttonInfo.operate_params.condition)

            if (app) {
              url += `&destApp=${app}`
            }
            uni.navigateTo({
              url
            });
            return
          } else if (buttonInfo.operate_type === '增加跳转' || buttonInfo.operate_type === '增加弹出') {
            let fieldsCond = [];
            if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition.length >
              0) {
              buttonInfo.operate_params.condition.forEach(item => {
                let obj = {
                  column: item.colName,
                  value: item.value,
                  disabled: true
                }
                fieldsCond.push(obj)
              })
            }
            if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length > 0) {
              buttonInfo.operate_params.data.forEach(item => {
                Object.keys(item).forEach(key => {
                  let obj = {
                    column: key,
                    value: item[key],
                    disabled: true
                  }
                  fieldsCond.push(obj)
                })

              })
            }
            let url =
              `/publicPages/formPage/formPage?type=add&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=${buttonInfo.application}`;
            uni.navigateTo({
              url
            });
            return
          }

        } else if (this.listType === 'proc') {
          if (buttonInfo && buttonInfo.button_type === 'edit' && rowData.proc_instance_no) {
            uni.navigateTo({
              url: '/publicPages/procDetail/procDetail?proc_instance_no=' + rowData
                .proc_instance_no
            });
          }
        } else {
          if (buttonInfo.button_type === 'detail' && this.detailType === 'custom' && this.customDetailUrl) {
            let storeInfo = this.$store?.state?.app?.storeInfo
            let bindUserInfo = this.$store?.state?.user?.storeUserInfo
            let targetUrl = this.customDetailUrl
            let obj = {
              data: rowData,
              rowData,
              storeInfo,
              bindUserInfo
            };
            obj = this.deepClone(obj)
            targetUrl = this.renderStr(this.customDetailUrl, obj)
            uni.navigateTo({
              url: targetUrl
            })
            return
          }

          this.onButtonToUrl(data, this.appName).then(res => {
            if (buttonInfo && buttonInfo.button_type === 'delete') {
              if (res.state === 'SUCCESS') {
                // this.getList()
                this.getList()
              }
            }
            if (buttonInfo && buttonInfo.button_type === 'detail') {
              let {
                row,
                button
              } = res
              let fieldsCond = []
              if (row && row.id) {
                fieldsCond = [{
                  column: 'id',
                  value: row.id,
                  display: false
                }]
              } else {
                if (typeof row == 'object' && Object.keys(row).length > 0) {
                  Object.keys(row).forEach(key => {
                    if (key !== '_buttons' && row[key]) {
                      let obj = {
                        column: key,
                        value: row[key] || ''
                      }
                      fieldsCond.push(obj)
                    }
                  })
                }
              }
              let url =
                `/publicPages/formPage/formPage?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
              //   'childTableList') {
              url =
                `/publicPages/detail/detail?serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // }
              if (this.hideChildList) {
                url =
                  `/publicPages/form/form?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              }
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              // if (button.service_name === 'srvdaq_cms_content_select') {
              //   if (rowData.content_no) {
              //     uni.navigateTo({
              //       url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${rowData.content_no}`
              //     });
              //   }
              //   return
              // }
              uni.navigateTo({
                url: url
              })
            } else if (buttonInfo && buttonInfo.button_type === 'customize') {
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
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };
                uni.navigateTo({
                  url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
                    params)
                });
              } else if (buttonInfo.servcie_type === 'select') {
                let params = {
                  type: 'select',
                  serviceName: buttonInfo.service_name,
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };
                if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
                    .condition)) {
                  let viewTemp = {};
                  if (buttonInfo.service_name ===
                    'srvhealth_store_vaccination_appoint_record_select') {
                    viewTemp = {
                      title: 'customer_name',
                      img: 'person_image',
                    }
                  }
                  uni.navigateTo({
                    url: '/publicPages/list/list?pageType=list&serviceName=' +
                      buttonInfo.service_name +
                      '&cond=' +
                      JSON.stringify(buttonInfo.operate_params.condition) +
                      '&viewTemp=' +
                      JSON.stringify(viewTemp)
                  });
                }
              } else if (buttonInfo.servcie_type === 'update') {
                let params = {
                  type: 'update',
                  serviceName: buttonInfo.service_name,
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };
                let fieldsCond = [];
                if (Array.isArray(this.condition)) {
                  fieldsCond = this.condition.map(item => {
                    return {
                      column: item.colName,
                      value: item.value,
                      display: false
                    };
                  });
                }
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
                if (Array.isArray(condition) && condition.length > 0) {
                  condition.forEach(cond => {
                    fieldsCond.push({
                      column: cond.colName,
                      value: cond.value
                    })
                  })
                }
                let url =
                  `/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                  encodeURIComponent(JSON.stringify(fieldsCond));
                if (this.appName) {
                  url += `&appName=${this.appName}`
                }
                uni.navigateTo({
                  url: url
                });
              }
            } else if (buttonInfo && buttonInfo.button_type === 'duplicate') {
              let fieldsCond = []
              if (Array.isArray(self.condition)) {
                self.condition.forEach(item => {
                  fieldsCond.push({
                    column: item.colName,
                    value: item.value,
                    display: false
                  })
                })
              }
              Object.keys(rowData).forEach(key => {
                if (!['id', 'modify_user_disp', 'modify_user', 'modify_time',
                    'create_user_disp', 'create_user', 'create_time', 'del_flag',
                    '_buttons'
                  ].includes(key) && rowData[key]) {
                  if (!fieldsCond.find(item => item.column === key)) {
                    fieldsCond.push({
                      column: key,
                      display: true,
                      value: rowData[key],
                    })
                  }
                }
              })

              let url =
                `/publicPages/form/form?serviceName=${buttonInfo.service_name}&type=add&fieldsCond=${JSON.stringify(fieldsCond)}`;
              if (self.appName) {
                url += `&appName=${self.appName}`
              }
              uni.navigateTo({
                url: url
              });
            } else if (buttonInfo.servcie_type === 'add') {
              let params = {
                type: 'add',
                serviceName: res.button.service_name,
                defaultVal: res.row,
                eventOrigin: res.button
              };
              uni.navigateTo({
                url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
                  params)
              });
            } else if (buttonInfo && buttonInfo.operate_type === '流程申请') {
              uni.navigateTo({
                url: '/pages/public/proc/apply/apply?serviceName=' + buttonInfo
                  .operate_service
              });
            }
          });
        }
        console.log('clickFootBtn:', data);


      },
      setInitData(e) {
        debugger
        this.initData = e
        // this.memoryListData = [...this.memoryListData,...e]
      },
      unfold() {
        this.$emit('unfold', this.config)
      },
      /**
       * 生成主子表同时提交的子表请求参数
       */
      getChildDataList() {
        const fk = this.foreignKey
        const depend_keys = [{
          type: "column",
          depend_key: fk.referenced_column_name,
          add_col: fk.column_name
        }]
        let result = [];
        const deleteParams = this.buildDeleteParams()
        // deleteParams && result.push(deleteParams)
        const addParams = this.buildAddParams()
        // addParams && result.push(addParams)
        const updateParams = this.buildUpdateParams()
        result = [...result, ...deleteParams, ...addParams, ...updateParams]
        result = result.map(item => {
          item.depend_keys = depend_keys
          return item
        })
        return result
      },
      buildDeleteParams() {
        let fk = this.foreignKey
        let deleteList = this.listData.filter(item => item._dirtyFlags === 'delete')
        if (deleteList.length === 0) {
          return []
        }
        let ids = deleteList.map(row => row.id).join(",");
        let params = {
          condition: [{
            colName: 'id',
            ruleType: 'in',
            value: ids
          }],
          serviceName: this.deleteService
        }
        return [params]
      },
      buildUpdateParams() {
        let fk = this.foreignKey
        let updateList = this.finalListData.filter(item => item._dirtyFlags === 'update' && item.id)
        if (updateList.length === 0) {
          return []
        }
        let params = updateList.map((item, index) => {
          delete item._isMemoryData
          delete item._dirtyFlags
          let row = this.localListData[index]
          let id = item.id
          Object.keys(row).forEach(key => {
            if (row[key] === item[key]) {
              delete item[key]
            }
          })
          return {
            serviceName: this.updateService,
            data: [item],
            condition: [{
              colName: "id",
              ruleType: "eq",
              value: id,
            }]
          }
        })
        return params
      },
      buildAddParams() {
        let fk = this.foreignKey
        let addList = this.finalListData.filter(item => item._dirtyFlags === 'add')
        if (addList.length === 0) {
          return []
        }
        let params = {
          data: addList.map(item => {
            delete item._isMemoryData
            delete item._dirtyFlags
            delete item._type
            return item
          }),
          serviceName: this.addService
        }
        return [params]
      },
      deleteInitListItem(index) {
        if (index || index === 0) {
          this.initData.splice(index, 1)
        }
      },
      deleteMemoryListItem(index) {
        if (index || index === 0) {
          this.memoryListData.splice(index, 1)
        }
      },
      getMemoryData() {
        return this.memoryListData.map(item => {
          delete item._isMemoryData
          delete item._dirtyFlags
          return item
        })
      },
      onChildFormBtn(e, index, isMem) {
        if (e && e.button_type) {
          switch (e.button_type) {
            case 'submit':
              this.add2List(e)
              break;
            case 'edit':
              this.updateChildListItem(index)
              break;
            case 'delete':
              if (this.use_type === "detaillist" && this.modalName === "updateChildData") {
                let id = this.listData[this.currentItemIndex]['id']
                uni.showModal({
                  content: "是否确认删除操作？",
                  success: (res) => {
                    if (res.confirm) {
                      console.log('用户点击确定');
                      let req = [{
                        "serviceName": e.service_name,
                        "colNames": ["*"],
                        "condition": [{
                          colName: 'id',
                          ruleType: 'eq',
                          value: id
                        }]
                      }]
                      if (!id) {
                        return
                      }
                      let appName = this.appName || uni.getStorageSync('activeApp');
                      this.onRequest("delete", e.service_name,
                        req, appName).then((res) => {
                        this.hideModal()
                        this.getList()
                        if (res.data.state === "SUCCESS") {
                          uni.showToast({
                            title: '操作成功',

                          })
                        } else {
                          uni.showModal({
                            title: '提示',
                            content: res.data
                              .resultMessage,
                            showCancel: false,
                          })
                        }

                      })
                    } else if (res.cancel) {
                      resolve('用户点击取消')
                    }
                  }
                })
                return
              }
              if (typeof index === 'number' && index >= 0) {
                if (isMem) {
                  this.deleteMemoryListItem(index)
                } else {
                  this.listData[index]._dirtyFlags = 'delete'
                  this.$set(this.listData, index, this.listData[index])
                }
              }
              break;
            case 'delete_init':
              this.deleteInitListItem(index)
              break;
            case 'reset':
              this.$refs.childForm.onReset()
              break;
          }
        }
      },
      updateChildListItem() {
        let data = this.$refs.childForm.getFieldModel();

        if (!data) {
          return
        }
        if (this.use_type === 'detaillist') {
          // 详情子表页面 直接发请求修改
          let id = this.listData[this.currentItemIndex]['id']
          if (id && this.updateService) {
            let req = [{
              "serviceName": this.updateService,
              "condition": [{
                "colName": 'id',
                "ruleType": "eq",
                "value": id
              }],
              "data": [data]
            }]
            let app = this.appName || uni.getStorageSync('activeApp');
            let url = this.getServiceUrl(app, this.updateService, 'update');
            this.$http.post(url, req).then(res => {
              this.hideModal()
              this.getList()
            })
          }

          return
        }

        if (this.currentItemType === 'mem') {
          Object.assign(this.memoryListData[this.currentItemIndex], data)
          this.memoryListData[this.currentItemIndex]._dirtyFlags = 'add'
        } else if (this.currentItemType === 'init') {
          Object.assign(this.initData[this.currentItemIndex], data)
          this.initData[this.currentItemIndex]._dirtyFlags = 'add'
        } else {
          Object.assign(this.listData[this.currentItemIndex], data)
          this.listData[this.currentItemIndex]._dirtyFlags = 'update'
        }

        this.hideModal()
      },
      batchSubmit(arr) {
        this.$refs.batchAdd.close()
        let dependCols = []
        let target_column = this.config?.foreign_key?.moreConfig?.batch_add?.target_column
        let target_column_info = null
        if (Array.isArray(this.addV2?._fieldInfo) && this.addV2._fieldInfo.length > 0 && target_column) {
          target_column_info = this.addV2._fieldInfo.find(item => item.columns === target_column)
          this.addV2._fieldInfo.forEach(item => {
            if (item?.redundant?.dependField === target_column) {
              dependCols.push({
                refedCol: item?.redundant?.refedCol,
                columns: item.columns
              })
              return true
            }
          })
        }
        if (Array.isArray(arr) && arr.length > 0) {
          arr.forEach(data => {
            let obj = {
              [target_column_info.columns]: data[target_column],
            }
            let numCol = this.config?.foreign_key?.moreConfig?.batch_add?.numCol
            if (numCol) {
              obj[numCol] = data[numCol]
            }
            dependCols.forEach(col => {
              obj[col.columns] = data[col.refedCol]
            })
            obj._isMemoryData = true
            obj._dirtyFlags = 'add'
            this.memoryListData.push(obj)
          })
        }
      },
      async add2List(e) {
        let data = this.$refs.childForm.getFieldModel();
        if (!data) {
          return
        }
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          for (let key in data) {
            if (Array.isArray(data[key])) {
              data[key] = data[key].toString();
            }
            if (!data[key] && data[key] !== 0) {
              delete data[key]
            }
          }
          if (this.use_type === 'detaillist') {
            // 直接添加
            // let {
            // 	row,
            // 	btn
            // } = e
            let reqData = [{
              serviceName: e.service_name,
              data: [data]
            }];
            let app = this.appName || uni.getStorageSync('activeApp');
            let type = "add"
            let url = this.getServiceUrl(app, e.service_name, type);
            let res = await this.$http.post(url, reqData);
            this.getList()
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
                icon: "none"
              });
            }
          } else {
            // 添加到内存中，随主表一起添加
            if (Object.keys(data).length > 0) {
              data._isMemoryData = true
              data._dirtyFlags = 'add'
              this.memoryListData.push(data)
            }
          }

        }
        this.addV2._fieldInfo = this.addV2._fieldInfo.map(item => {
          item.value = null
          if (item.defaultValue && !item.value) {
            item.value = item.defaultValue
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2
            .conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2
              .conditions, this.defaultVal)
          }
          if (item.in_add === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          return item
        })

        this.modalName = ''
      },

      // async handleCalc(triggerField) {
      //   const table_name = this.curV2?.main_table
      //   if (!table_name) {
      //     debugger
      //     return
      //   }
      //   const column = triggerField?.column
      //   let calcResult = {}
      //   let fieldModel = this.allFields.reduce((res, cur) => {
      //     res[cur.column] = cur.value
      //     return res
      //   }, {})
      //   let calcCols = this.allFields.filter(item => item.redundant?.func && Array.isArray(item
      //     .calc_trigger_col) && item.calc_trigger_col.includes(column)).map(item => item.column)
      //   if (Array.isArray(calcCols) && calcCols.length > 0) {
      //     calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
      //   }
      //   for (let i = 0; i < this.allFields.length; i++) {
      //     const item = this.allFields[i]
      //     if (calcResult?.response && calcResult.response[item.column]) {
      //       item.value = calcResult?.response[item.column]
      //       // this.valueChange(fieldModel, item)
      //       this.$set(this.allFields, i, item)
      //       await this.handleCalc()
      //     }
      //   }
      //   return calcResult
      // },

      async updateValueChange(e, triggerField) {

        const column = triggerField.column
        let fieldModel = e
        const cols = this.allFields.filter(item => item.x_if).map(item => item.column)
        const table_name = this.updateV2.main_table

        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, fieldModel, this.appName)
        }

        let calcResult = {}
        let calcCols = this.allFields.filter(item => item.redundant?.func && Array.isArray(item
          .calc_trigger_col) && item.calc_trigger_col.includes(column)).map(item => item.column)

        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
          debugger
        }

        for (let i = 0; i < this.allFields.length; i++) {
          const item = this.allFields[i]
          item.old_value = item.value
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
          }

          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
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
          if (calcResult?.response && calcResult.response[item.column]) {
            item.value = calcResult?.response[item.column]
            fieldModel[item.column] = item.value
            // await this.updateValueChange(fieldModel, item)
          }
          this.$set(this.allFields, i, item)
          this.$refs?.childForm?.setFieldModel ? this.$refs.childForm.setFieldModel(item) : ''
          if (item.old_value !== item.value) {
            debugger
            this.updateValueChange(fieldModel, item)
          }
        }

      },
      async valueChange(e, triggerField) {
        const column = triggerField.column
        let fieldModel = e
        const cols = this.allFields.filter(item => item.x_if).map(item => item.column)
        const table_name = this.curV2.main_table

        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, fieldModel, this.appName)
        }

        let calcResult = {}
        let calcCols = this.allFields.filter(item => item.redundant?.func && Array.isArray(item
          .calc_trigger_col) && item.calc_trigger_col.includes(column)).map(item => item.column)
        if (Array.isArray(calcCols) && calcCols.length > 0) {
          calcResult = await this.evalCalc(table_name, calcCols, fieldModel, this.appName)
        }

        for (let i = 0; i < this.allFields.length; i++) {
          const item = this.allFields[i]
          item.old_value = item.value
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.old_value = item.value;
            item.value = e[item.column];
            // this.$set(this.allFields, i, item)
          }
          if (calcResult?.response && calcResult.response[item.column]) {
            item.value = calcResult?.response[item.column]
            fieldModel[item.column] = item.value
            // this.$set(this.allFields, i, item)
            debugger
            // await this.handleCalc(item)
          }

          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
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
          this.$set(this.allFields, i, item)
          this.$refs?.childForm?.setFieldModel ? this.$refs.childForm.setFieldModel(item) : ''
          if (item.old_value !== item.value) {
            this.valueChange(fieldModel, item)
          }
        }
        return
      },
      async onButton(e, index) {
        if (e?.button_type == 'list') {

        } else if (this.disabled) {
          return
        }
        if (e && e.button_type) {
          switch (e.button_type) {
            case 'refresh':
              this.getList()
              break;
            case 'list':
              let url =
                `/publicPages/list2/list2?pageType=list&main_data=${JSON.stringify(this.mainData)}&serviceName=${this.serviceName}&destApp=${this.srvApp}&cond=${JSON.stringify(this.condition)}`
              if (this.disabled) {
                url += `&disabled=true`
              }
              uni.navigateTo({
                url
              })
              break;
            case 'add':
              this.getAddV2(e).then(_ => {
                this.modalName = 'addChildData'
              })
              break;
            case 'edit':
              if (index || index === 0) {
                let row = this.listData[index]
                let rowButton = this.v2Data?.rowButton
                let detailBtn = null
                if (Array.isArray(rowButton) && rowButton.length > 0) {
                  detailBtn = rowButton.find(item => item.button_type === 'detail')
                }
                if (this.config?.foreign_key?.moreConfig?.clickTarget === 'detail' && detailBtn) {
                  let fieldsCond = []
                  if (row && row.id) {
                    fieldsCond = [{
                      column: 'id',
                      value: row.id,
                      display: false
                    }]
                  } else {
                    if (typeof row == 'object' && Object.keys(row).length > 0) {
                      Object.keys(row).forEach(key => {
                        if (key !== '_buttons') {
                          let obj = {
                            column: key,
                            value: row[key] || ''
                          }
                          fieldsCond.push(obj)
                        }
                      })
                    }
                  }
                  let url =
                    `/publicPages/detail/detail?serviceName=${detailBtn.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
                  if (this.appName) {
                    url += `&appName=${this.appName}`
                  }
                  uni.navigateTo({
                    url: url
                  })
                } else {
                  this.getUpdateV2(row).then(_ => {
                    this.currentItemIndex = index
                    this.modalName = 'updateChildData'
                  })
                }
              }
              break;
            case 'editInit':
              // 编辑初始值表数据
              if (index || index === 0) {
                let row = this.initData[index]
                this.getUpdateV2(row).then(_ => {
                  this.currentItemIndex = index
                  this.currentItemType = 'init'
                  this.modalName = 'updateChildData'
                })

              }
              break
            case 'editMem':
              // 编辑内存表数据
              if (index || index === 0) {
                let row = this.memoryListData[index]
                this.getUpdateV2(row).then(_ => {
                  this.currentItemIndex = index
                  this.currentItemType = 'mem'
                  this.modalName = 'updateChildData'
                })
              }
              break
            case 'batchAdd':
              let addV2 = await this.getAddV2().then(_ => {
                this.$refs.batchAdd.open(e)
              })
              break;
          }
        }
      },

      async getUpdateV2(row) {
        if (this.updateV2?._fieldInfo) {
          this.updateV2._fieldInfo = this.updateV2._fieldInfo.map(item => {
            if (row && row[item.columns]) {
              item.value = row[item.columns]
            }
            return item
          })
          this.updateV2.rowData = row
          return
        }
        // if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.updateService, 'update', 'update', app);
        colVs._fieldInfo = colVs._fieldInfo.map(item => {
          if (item?.option_list_v2?.refed_col && this.mainData[item.option_list_v2.refed_col]) {
            item.value = this.mainData[item.option_list_v2.refed_col]
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2
            .conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2
              .conditions, this.mainData)
          }
          if (item.defaultValue) {
            item.value = item.defaultValue
          }
          if (item.in_update === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.ref_service_column) {
            item.display = false
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          if (row && row[item.columns]) {
            item.value = row[item.columns]
          }
          return item
        })
        colVs.rowData = row
        if (Array.isArray(colVs.formButton) && colVs.formButton.length > 0 && this.use_type === "detaillist") {
          colVs.formButton = colVs.formButton.map(item => {
            if (item.button_type === 'reset') {
              let rowButton = this.v2Data?.rowButton
              if (rowButton.length > 0) {
                let delBtn = rowButton.find(item => item.button_type === 'delete')
                if (delBtn) {
                  item = delBtn
                }
              }
            }
            return item
          })
        }
        this.updateV2 = colVs
        // }
      },
      async getAddV2(btn) {
        let self = this
        let serviceName = btn?.service_name || this.serviceName
        // if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = null
        if (this.addV2) {
          colVs = this.addV2
        } else {
          colVs = await this.getServiceV2(serviceName, 'add', 'add', app);
        }
        if (!colVs) {
          return
        }
        colVs._fieldInfo = colVs._fieldInfo.map(item => {
          if (Array.isArray(item?.option_list_v2?.mconditions) && item.option_list_v2
            .mconditions.length > 0) {
            let mconditions = item.option_list_v2.mconditions
            mconditions = mconditions.map(
              item => {
                item.value = this.renderStr(item.value, this.mainData)
                return item
              })
            if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2.conditions
              .length > 0) {
              item.option_list_v2.conditions = [...item.option_list_v2.conditions, ...
                mconditions
              ]
            } else {
              item.option_list_v2.conditions = mconditions
            }
          }
          if (item?.option_list_v2?.refed_col && this.mainData[item.option_list_v2.refed_col]) {
            if (Array.isArray(self.initData) && self.initData.length > 0 && self.initData.find(e => e[item
                .option_list_v2.refed_col] === self.mainData[item.option_list_v2.refed_col])) {} else {
              item.value = this.mainData[item.option_list_v2.refed_col]
            }
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2.conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2.conditions,
              this.mainData)
          }
          if (item.defaultValue) {
            item.value = item.defaultValue
          }
          if (item.in_add === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          if (item.col_type == self.mainTable) {
            if (Array.isArray(self.initData) && self.initData.length > 0 && self.initData.find(e => e[item
                .columns] === self.mainData[item.columns])) {

            } else {
              if (self.mainData && self.mainData[item.columns]) {
                item.value = self.mainData[item.columns]
                item.disabled = true
              }
            }

          }

          if (item.col_type === 'fk') {
            if (this.mainData && this.mainData[item.columns]) {
              // item.disabled = true
              if (Array.isArray(this.initData) && this.initData.length > 0 && this.initData.find(e => e[item
                  .columns] === this.mainData[item.columns])) {

              } else {
                item.value = this.mainData[item.columns]
              }
            }
          }
          return item
        })
        let defaultVal = colVs._fieldInfo.reduce((res, cur) => {
          if (cur.value) {
            res[cur.columns] = cur.value
          }
          return res
        }, {})
        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        const result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)

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

        this.addV2 = colVs
        if (Array.isArray(colVs?._fieldInfo)) {
          let colInfo = null
          let e = this.config?.foreign_key?.moreConfig?.batch_add
          if (e) {
            colInfo = colVs._fieldInfo.find(col => col.columns === e.target_column)
            if (Array.isArray(colInfo?.option_list_v2?.conditions) && colInfo.option_list_v2.conditions
              .length > 0) {
              colInfo.option_list_v2.conditions = colInfo.option_list_v2.conditions.map(item => {
                if (item.value && item.value.indexOf('data.') !== -1) {
                  let colName = item.value.slice(item.value.indexOf('data.') + 5);
                  if (this.mainData && this.mainData[colName]) {
                    item.value = this.mainData[colName];
                  }
                } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
                  item.value = uni.getStorageSync('login_user_info').user_no;
                } else if (item.value && item.value.indexOf("'") === 0 && item.value
                  .lastIndexOf(
                    "'") === item.value
                  .length - 1) {
                  item.value = item.value.replace(/\'/gi, '');
                }
                if (item.value_exp) {
                  delete item.value_exp;
                }
                return item
              })
            }

            this.selectColInfo = colInfo
          }
        }
        return colVs
        // }
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let use_type = this.config?.use_type || 'detaillist'
        let colVs = await this.getServiceV2(this.serviceName, 'list', use_type, app);
        if (!colVs) {
          return
        }
        // this.getAddV2()
        colVs.srv_cols = colVs.srv_cols.filter(item => {
          if (item.in_list !== 0) {
            if (item.in_list === 1) {
              item.display = true
            }
            return true
          }
        })
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
            if (item.in_list === 1) {
              item.orderType = 'asc'
              item.selected = false;
              return true
            }
          })
        }
        this.v2Data = colVs;
        this.getList()
      },
      async getList() {
        const serviceName = this.serviceName
        const app = this.srvApp
        const url = this.getServiceUrl(app, serviceName, 'select');
        const foreignKey = this.foreignKey
        const data = this.config
        let formData = this.mainData;
        const condition = this.condition
        if (Array.isArray(condition) && condition.length > 0) {
          let req = {
            serviceName: serviceName,
            colNames: ['*'],
            condition: condition,
            page: {
              rownumber: this.rownumber,
              pageNo: 1
            }
          };
          if (this.loading) {
            return
          }
          if (this.v2Data?.vpage_no) {
            req.vpage_no = this.v2Data.vpage_no
          }
          this.loading = true
          if (this.config?.foreign_key?.moreConfig?.condition && Array.isArray(this.config?.foreign_key?.moreConfig
              ?.condition)) {
            req.condition = [...req.condition, ...this.config.foreign_key.moreConfig.condition]
          }
          const res = await this.$http.post(url, req)
          this.loading = false
          if (res.data?.state === 'SUCCESS') {
            this.listData = res.data.data
            this.localListData = this.deepClone(res.data.data)
          }
        }
      },
      hideModal() {
        this.currentItemIndex = null
        this.currentItemType = null
        this.modalName = ''
      },
    }
  }
</script>

<style scoped lang="scss">
  .child-list {
    color: #666;
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;

    .unfold {
      text-align: right;
      margin-top: 10rpx;
      color: #000;
      flex: 1;
    }

    .section-name {
      color: #000;
      font-weight: bold;
      padding-bottom: 10rpx;
      border-bottom: 1rpx solid #F0F0F0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
      }

      .cu-load {
        line-height: 1;
        color: #666;
        font-weight: normal;
      }
    }

    .list-box {
      .list-item {
        display: flex;
        border-bottom: 1px solid #f1f1f1;
        padding: 10rpx 0;
        line-height: 30px;

        .bg-orange {
          background-color: #F3A250;

          &.light {
            background-color: #fde6d2;
          }
        }

        .more-btn {
          width: 30px;
          text-align: center;
          justify-content: center;
        }

        .hidden {
          opacity: 0;
          font-size: 28rpx;
        }

        .cuIcon-add {
          border-radius: 10rpx;
          padding: 0 10rpx;
          display: flex;
          align-items: center;
        }

        &.table-head {
          font-size: 24rpx;
          color: #999;
        }

        .col-item {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-align: center;
        }
      }
    }

    .to-more {
      text-align: right;
      padding-top: 20rpx;

      .line-orange {
        // color: #FFE8D1;
        color: #F3A250;

        .text {
          color: #F3A250;
        }
      }

      .line-cyan {
        color: #0BC99D;
      }

      .cu-btn {
        margin-left: 10rpx;
      }
    }
  }

  .child-form-wrap {
    max-height: 70vh;
    overflow-y: scroll;
  }

  .button-box {
    .cu-btn {
      min-width: 40%;
    }
  }
</style>
