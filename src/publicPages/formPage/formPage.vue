<template>
  <view class="form-wrap">
    <view class="main-form-edit">
      <a-form v-if="colsV2Data && isArray(fields)" :fields="fields" :srvApp="appName" :pageType="srvType"
        :formType="use_type" ref="bxForm" @value-blur="valueChange">
      </a-form>
    </view>

    <view class="child-service-box">
      <view class="child-service" v-for="(item,index) in childService" :key="index">
        <child-list :config="item" :appName="appName" :main-data="mainData" ref="childList" @onButton="onChildButton">
        </child-list>
      </view>
    </view>

    <view class="button-box" v-if="colsV2Data">
      <button class="cu-btn bg-blue" type="primary" v-if="isArray(fields) && fields.length > 0"
        v-for="(btn, btnIndex) in formButtons" :key="btnIndex" @click="onButton(btn)">
        {{ btn.button_name }}
      </button>
    </view>
  </view>
</template>

<script>
  import ChildList from '@/publicPages/components/child-list/child-list.vue'
  export default {
    components: {
      ChildList
    },
    data() {
      return {
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
        isOnButton: false
      }
    },
    computed: {
      formButtons() {
        let buttons = []
        if (Array.isArray(this.colsV2Data?._formButtons)) {
          buttons = this.colsV2Data?._formButtons
          if (Array.isArray(this.mainData?._buttons) && this.mainData?._buttons.length === buttons.length) {
            buttons = buttons.filter((item, index) => this.mainData?._buttons[index] === 1)
          }
          return buttons
        }
      },
      appTempColMap() {
        // 字段关系映射
        if (this.moreConfig?.appTempColMa) {
          return this.moreConfig?.appTempColMap
        }
        if (Array.isArray())
          return {}
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
      moreConfig() {
        return this.colsV2Data?.moreConfig
      },
      colsV2Data() {
        if (this.srvType) {
          return this[`${this.srvType}V2`]
        }
        return {}
      },
      childService: {
        get() {
          let result = []
          if (['update', 'add'].includes(this.srvType)) {
            result = this.operateChildService
          } else {
            result = this.detailChildService
          }
          if (Array.isArray(result)) {
            return result.map(item => {
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
        }
      },
      operateChildService() {
        return this.detailV2?.child_service.filter(item => {
          if (item.foreign_key?.foreign_key_type === '主子表') {
            // item.use_type = 'add'
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
      async onButton(e) {
        if (!e) {
          return;
        }
        // if (!this.isOnButton) {
        // 	this.isOnButton = true;
        // } else {
        // 	uni.showToast({
        // 		title: '正在处理中，请勿重复操作',
        // 		icon: 'none'
        // 	});
        // 	return;
        // }
        let req = this.$refs.bxForm.getFieldModel();
        for (let key in req) {
          if (Array.isArray(req[key])) {
            req[key] = req[key].toString();
          }
        }

        switch (e.button_type) {
          case 'edit':
          case 'submit':
            if (req) {
              let data = this.deepClone(req);
              data.child_data_list = []
              console.log(this.childService)
              if (Array.isArray(this.childService) && this.childService.length > 0) {
                this.childService.forEach((item, index) => {
                  data.child_data_list = this.$refs.childList[index].getChildDataList()
                  // data.child_data_list.push(this.$refs.childList[index].getChildDataList())
                })
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
              let res = await this.$http.post(url, reqData);
              if (res.data.state === 'SUCCESS') {
                uni.$emit('dataChange', service)
                uni.showModal({
                  title: '提示',
                  content: res.data.resultMessage,
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      uni.navigateBack({

                      })
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
        }

      },
      async valueChange(e, triggerField) {
        const column = triggerField.column
        const fieldModel = e
        const cols = this.colsV2Data._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = this.colsV2Data.main_table

        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, fieldModel, this.appName)
        }
        for (let i = 0; i < this.fields.length; i++) {
          const item = this.fields[i]
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
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
          }
          this.$set(this.fields, i, item)
        }
      },
      async getDefaultVal() {
        if (this.srvType === 'detail' || this.srvType === 'update') {
          let serviceName = this.service || this.serviceName.replace('_update', '_select').replace(
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
      async getDetailV2() {
        const app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.serviceName, 'detail', 'detail', app);

        this.detailV2 = colVs
      },
      async getFieldsV2() {
        const app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.serviceName, this.srvType, this.use_type,
          app);
        this[`${this.srvType}V2`] = colVs
        if (['update', 'add'].includes(this.srvType)) {
          this.getDetailV2()
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
              if (Array.isArray(field.option_list_v2?.conditions)) {
                field.option_list_v2.conditions = this.evalConditions(field.option_list_v2.conditions,
                  defaultVal)
              }

              if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
                this.fieldsCond.forEach(item => {
                  if (item.column === field.column) {
                    if (item.hasOwnProperty('display')) {
                      field.display = item.display;
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
            break;
          case 'add':
            fields = colVs._fieldInfo.map(field => {
              if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
                field.option_list_v2 = field.option_list_v2.map(item => {
                  item.checked = false;
                  return item;
                });
              }
              if (Array.isArray(field?.option_list_v2?.mconditions) && field.option_list_v2
                .mconditions.length > 0) {
                let mconditions = field.option_list_v2.mconditions.map(
                  field => {
                    field.value = this.renderStr(field.value, this.mainData)
                    return field
                  })
                if (Array.isArray(field?.option_list_v2?.conditions) && field.option_list_v2
                  .conditions
                  .length > 0) {
                  field.option_list_v2.conditions = [...field.option_list_v2
                    .conditions, ...mconditions
                  ]
                } else {
                  field.option_list_v2.conditions = mconditions
                }
              }
              if (Array.isArray(field?.option_list_v2?.conditions) && field.option_list_v2
                .conditions
                .length > 0) {
                field.option_list_v2.conditions = this.evalConditions(field.option_list_v2
                  .conditions, this.mainData)
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
                  if (!this.mainData) {
                    this.mainData = {}
                  }

                  this.mainData[item.column] = item.value
                  if (item.column === field.column) {
                    if (item.hasOwnProperty('display')) {
                      field.display = item.display;
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
                res[cur.column] = cur.defaultValue
                cur.value = cur.defaultValue
              }
              return res
            }, {})
            break;
        }


        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        const result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)

        for (let i = 0; i < colVs._fieldInfo.length; i++) {
          const item = colVs._fieldInfo[i]
          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col)) {
              if (item.table_name !== table_name) {
                debugger
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
        this.fields = fields
      },
      hideModal() {
        this.modalName = null
      },
    },
    onLoad(option) {
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
        try {
          let fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond));
          this.fieldsCond = fieldsCond
        } catch (e) {
          //TODO handle the exception
        }
      }

      if (option.serviceName) {
        this.serviceName = option.serviceName;
        this.getFieldsV2();
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import '../common/top-card';

  .form-wrap {
    min-height: 100vh;
    background-color: #F1F1F1;
    padding: 20rpx;
  }

  .main-form-edit {
    background-color: #fff;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
  }

  .child-form-wrap {
    max-height: 60vh;
    overflow-y: scroll;
  }

  .button-box {
    .cu-btn {
      min-width: 40%;
    }
  }
</style>
