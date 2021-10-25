<template>
  <view class="mix-form-list">
    <view class="tab-list">
      <view class="tab-item" :class="{'active':curTab===0}" @click="changeTab(0)">
        前台交班
      </view>
      <view class="tab-item" :class="{'active':curTab===1}" @click="changeTab(1)">
        交班记录
      </view>
      <view class="radius-box">

      </view>
    </view>
    <view class="tab-content bg-white" v-if="curTab===0">
      <view class="form-box">
        <a-form v-if="addV2 && isArray(fields)" :fields="fields" :pageType="'add'" :formType="'add'" ref="bxForm"
          @value-blur="valueChange" :mainData="defaultVal" :defaultVal="defaultVal"></a-form>
      </view>
    </view>
    <view class="tab-content" v-if="curTab===1">
      <list-next class="list-next" :listConfig="listConfig" :list="list" :listType="'list'" :colV2="colV2"
        :appName="appName" @click-foot-btn="clickFootBtn" @add2Cart="add2Cart" @del2Cart="del2Cart" />
    </view>

    <view class="button-box" v-if="addV2&&formButtons&&curTab===0">
      <button class="cu-btn bg-blue" type="primary" v-if="isArray(fields) && fields.length > 0"
        v-for="(btn, btnIndex) in formButtons" :key="btnIndex" @click="onButton(btn)">
        {{ btn.button_name }}
      </button>
    </view>
  </view>
</template>

<script>
  import listNext from '../components/list-next/list-next.vue';
  let rownumber = 20
  export default {
    components: {
      listNext
    },
    data() {
      return {
        store_no: "",
        appName: "store",
        serviceName: "",
        addV2: null,
        listV2: null,
        condition: [],
        list: [],
        fields: [],
        loadStatus: 'more',
        pageNo: 1,
        orderList: [],
        orderCols: [],
        searchVal: "",
        listConfig: {
          // show_custom_btn:false,
          show_public_btn:false
        },
        initCond: [],
        relationCondition: [],
        defaultVal: {},
        fieldsCond: [],
        curTab: 0
      }
    },
    computed: {
      storeInfo() {
        return this.$store?.state?.app?.storeInfo
      },
      userInfo() {
        return this.$store?.state?.user?.userInfo
      },
      bindUserInfo() {
        return this.$store?.state?.user?.storeUserInfo
      },
      colV2() {
        return this.listV2
      },
      formButtons() {
        let buttons = []
        if (Array.isArray(this.addV2?._formButtons)) {
          buttons = this.addV2?._formButtons
          return buttons
        }
      },
    },
    onLoad(option) {
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.destApp || option.appName) {
        this.appName = option.destApp || option.appName
      }
      if (option.fieldsCond) {
        try {
          let fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond));
          this.fieldsCond = fieldsCond
        } catch (e) {
          //TODO handle the exception
        }
      }
      this.getColV2('add')
    },
    methods: {
      async clickFootBtn(data) {
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
              this.getList()
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
              let condition = buttonInfo.operate_params.condition
              let defaultVal = buttonInfo.operate_params.data
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
                this.getList()
              }
            }
            if (buttonInfo && buttonInfo.button_type === 'detail') {
              let {
                row,
                button
              } = res
              debugger
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
                `/publicPages/formPage/formPage?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`

              url =
                `/publicPages/detail/detail?serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              if (this.appName) {
                url += `&appName=${this.appName}`
              }

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
      changeTab(index) {
        this.curTab = index
        if (index == 1 && this.loadStatus === 'more') {
          this.getColV2('list').then(_=>{
            this.getList()
          })
          
        }else{
          this.getColV2('add')
        }
      },
      valueChange(e) {

      },
      async getColV2(type = 'list') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.serviceName, type, type, app);
        colVs.srv_cols = colVs.srv_cols.filter(item => item[`in_${type}`] === 1 || item[`in_${type}`] === 2);
        if (!this.navigationBarTitle && colVs.service_view_name) {
          uni.setNavigationBarTitle({
            title: colVs.service_view_name
          });
        }
        console.log('colVs', colVs);
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
            if (colVs.moreConfig?.detailType) {
              if (!this.detailType) {
                this.detailType === colVs.moreConfig?.detailType
              }
            }
            if (colVs.moreConfig?.customDetailUrl) {
              if (!this.customDetailUrl) {
                this.customDetailUrl === colVs.moreConfig?.customDetailUrl
              }
            }
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
        }
        this[`${type}V2`] = colVs;
        
        let defaultVal = this.defaultVal;
        let self = this

        switch (colVs.use_type) {
          case 'add':
            self.fields = colVs._fieldInfo.map(field => {
              if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
                field.option_list_v2 = field.option_list_v2.map(item => {
                  item.checked = false;
                  return item;
                });
              }
              if (Array.isArray(field?.option_list_v2?.conditions) && field.option_list_v2
                .conditions
                .length > 0) {
                field.option_list_v2.conditions = this.evalConditions(field.option_list_v2
                  .conditions, this.fieldModel)
              }
              if (self.defaultCondition && Array.isArray(self.defaultCondition) && colVs
                ._fieldInfo && Array.isArray(colVs._fieldInfo)) {
                self.defaultCondition.forEach(cond => {
                  colVs._fieldInfo.forEach(field => {
                    if (cond.colName === field.column && (!['Image'].includes(field.col_type) || (cond[
                        'value'] && cond['value'].indexOf('http') !== -1))) {
                      field['value'] = cond['value'];
                    }
                  });
                });
              }
              if (Array.isArray(self.fieldsCond) && self.fieldsCond.length > 0) {
                self.fieldsCond.forEach(item => {
                  if (item.column === field.column) {
                    if (item.hasOwnProperty('display')) {
                      field.display = item.display;
                    }
                    if (item.hasOwnProperty('disabled')) {
                      field.disabled = item.disabled;
                    }
                    if (item.hasOwnProperty('value') && (!['Image'].includes(field.col_type) || (item.value &&
                        item.value.indexOf('http') !== -1))) {
                      // 不复制照片字段
                      field.value = item.value;
                    }
                    if (field.option_list_v2 && Array.isArray(field.option_list_v2
                        .conditions) && Array.isArray(item.condition)) {
                      field.option_list_v2.conditions = field.option_list_v2
                        .conditions.concat(item.condition);
                    } else if (field.option_list_v2 && !field.option_list_v2
                      .conditions && Array.isArray(item.condition)) {
                      field.option_list_v2.conditions = item.condition;
                    }
                  }
                });
              }
              return field;
            })
            break;
        }
        return colVs;
      },
      async onButton(e) {
        if (!e) {
          return;
        }
        let self = this
        let req = this.$refs.bxForm.getFieldModel();
        for (let key in req) {
          if (Array.isArray(req[key])) {
            req[key] = req[key].toString();
          }
        }
        switch (e.button_type) {
          case 'submit':
            if (req) {
              let data = this.deepClone(req);
              data.child_data_list = []
              console.log(this.childService)
              if (Array.isArray(this.childService) && this.childService.length > 0) {
                this.childService.forEach((item, index) => {
                  debugger
                  let child_data = this.$refs.childList[index].getChildDataList()
                  data.child_data_list.push(...child_data)
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
                      if (res.confirm) {
                        uni.navigateBack()
                      }
                    }
                  })
                }
              })

            }
            break;
        }
      },
      async getList(cond, initCond) {
        let serviceName = this.serviceName;
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: this.condition || [],
          page: {
            rownumber: rownumber,
            pageNo: this.pageNo
          },
          order: this.orderList || []
        };
        // if (this.listType === 'proc') {
        //   if (proc_data_type || this.proc_data_type) {
        //     req['proc_data_type'] = proc_data_type || this.proc_data_type;
        //   } else {
        //     req['proc_data_type'] = 'wait';
        //   }
        // }
        if (Array.isArray(cond) && cond.length > 0) {
          req.condition = req.condition.concat(cond);
        }
        if (Array.isArray(initCond) && initCond.length > 0) {
          req.condition = [...req.condition, ...initCond]
        }

        let keywords = this.searchVal;
        if (keywords && this.finalSearchColumn) {
          if (typeof this.finalSearchColumn === 'string') {
            req.condition = req.condition.concat([{
              colName: this.finalSearchColumn,
              ruleType: 'like',
              value: keywords
            }]);
          } else if (Array.isArray(this.finalSearchColumn)) {
            // 数组 使用relation_condition
            if (Array.isArray(req.condition) && req.condition.length > 0) {
              req.relation_condition = {
                relation: "AND",
                data: [{
                    relation: "OR",
                    data: this.finalSearchColumn.map(item => {
                      return {
                        "colName": item,
                        "value": keywords,
                        "ruleType": 'like'
                      }
                    })
                  },
                  {
                    relation: "AND",
                    data: this.deepClone(req.condition)
                  }
                ]
              }
            } else {
              req.relation_condition = {
                relation: "OR",
                data: this.finalSearchColumn.map(itme => {
                  return {
                    "colName": itme,
                    "value": keywords,
                    "ruleType": 'like'
                  }
                })
              }
            }
            delete req.condition
          }
        }

        if (Array.isArray(this.relationCondition?.data) && this.relationCondition.data.length > 0) {
          if (req.relation_condition?.data.length > 0) {
            req.relation_condition = {
              "relation": "AND",
              data: [
                ...this.relationCondition.data,
                {
                  "relation": "OR",
                  data: req.relation_condition
                }
              ]
            }
          } else {
            req.relation_condition = this.relationCondition
          }
        }

        if (this.colV2?.vpage_no) {
          req['vpage_no'] = this.colV2.vpage_no
        }
        this.loadStatus = 'loading'
        let res = await this.$http.post(url, req);

        if (res.data.state === 'SUCCESS') {
          if (this.pageNo === 1) {
            this.list = [];
          }
          this.list = this.list.concat(res.data.data);
          this.pageNo = res.data.page.pageNo;
          let page = res.data.page;
          if (this.listType === 'proc') {
            for (let i = 0; i < this.tabList.length; i++) {
              let item = this.tabList[i];
              if (item.proc_data_type === req.proc_data_type) {
                item.data = this.list;
                item.total = res.data.page.total;
                item.page = res.data.page;
                this.$set(this.tabList, i, item);
              }
            }
            this.list = [];
            this.list = this.tabList[this.TabCur]['data'];
            let callBackData = {
              data: this.list,
              page: res.data.page,
              proc_data_type: req.proc_data_type
            };
            return callBackData;
          } else {
            if (page.rownumber * page.pageNo >= page.total) {
              this.loadStatus = 'norMore'
            } else {
              this.loadStatus = 'more'
            }
          }
          return this.list;
        }

      },
    }
  }
</script>

<style lang="scss" scoped>
  .mix-form-list {
    background-color: #F8F8FA;
    overflow: hidden;

    .tab-list {
      display: flex;
      background-color: #fff;
      margin-bottom: 20rpx;
      border-radius: 50rpx 50rpx 0 0;
      flex-wrap: wrap;

      .radius-box {
        width: 100%;
        height: 40rpx;
        border-radius: 200rpx 200rpx 0 0;
        background-color: #f8f8fa;
        margin-top: 10rpx;
      }

      .tab-item {
        flex: 1;
        padding: 20rpx;
        position: relative;
        text-align: center;

        &.active {
          &::after {
            content: '';
            position: absolute;
            bottom: 2px;
            background-color: #F3A250;
            height: 3px;
            width: 50px;
            left: calc(50% - 25px);
          }
        }
      }
    }

    .tab-content {
      margin: 0 20rpx;
      position: relative;
      top: -40rpx;
      border-radius: 20rpx;
      min-height: 80vh;
    }


    .button-box {
      padding: 20rpx;
      margin-bottom: 100rpx;

      .cu-btn {
        width: 65%;
        border-radius: 50rpx;
        background-color: #F3A250;
      }
    }
  }
</style>
