<template>
  <view class="page-wrap">
    <list-bar @change="changeSerchVal" :filterCols="filterCols" :srvApp="appName" :srvCols="srvCols"
      :placholder="placeholder" :listButton="listButton" @toOrder="toOrder" @toFilter="toFilter"
      @handelCustomButton="handlerCustomizeButton" @onGridButton="clickGridButton" @clickAddButton="clickAddButton"
      @search="toSearch" v-if="srvCols&&srvCols.length>0">
    </list-bar>
    <list-next class="list-next" :list="list" :colV2="colV2" :appName="appName" @click-foot-btn="clickFootBtn" />
  </view>
</template>

<script>
  import listNext from '../components/list-next/list-next.vue';
  import listBar from '../components/list-bar/list-bar.vue'

  export default {
    components: {
      listNext,
      listBar,
    },
    computed: {
      publicButton() {
        if (Array.isArray(this.colV2?.gridButton) && this.colV2?.gridButton.length > 0) {
          return this.colV2.gridButton
          // .filter(item => {
          //   if (item.permission === true) {
          //     switch (item.button_type) {
          //       case 'add':
          //       case 'apply':
          //         this.showAdd = true;
          //         return item;
          //         break;
          //       case 'select':
          //         this.showSearchBar = true;
          //         // #ifdef MP-WEIXIN
          //         this.listTop = 100;
          //         // #endif
          //         return item;
          //         break;
          //       case 'customize':

          //     }
          //   }
          // })
        }
        return []
      },
      placeholder() {
        return ''
      },
      moreConfig() {
        return this.colV2?.moreConfig || {}
      },
      listButton() {
        let buttons = this.publicButton

        let res = buttons.filter(item => {
          if (['select', 'add', 'apply', 'customize'].includes(item.button_type)) {
            if (item.button_type === 'select') {
              return this.colV2?._fieldInfo
            }
            if (item.button_type === 'add') {
              return true
            }
          }
        }).map(item => {
          if (item.button_type === 'select') {
            item.icon = 'cuIcon-filter'
            item.clickEvent = this.showFilterModal
          } else if (['add', 'apply'].includes(item.button_type)) {
            item.icon = 'cuIcon-add'
            item.clickEvent = this.clickAddButton
          }
          return item
        })
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          res.push({
            button_type: 'order',
            icon: 'cuIcon-order',
            label: '排序',
            clickEvent: this.showOrder
          })
        }
        return res
      },
      srvCols() {
        return this.colV2?._fieldInfo || []
      },
      filterCols() {
        let cols = this.moreConfig?.appTempColMap
        if (typeof cols === 'object') {
          cols = Object.keys(cols).map(key => cols[key]).filter(item => item && item)
          return this.srvCols.filter(item => cols.includes(item.columns) && !['Image', 'String'].includes(item
            .col_type))
        } else {
          let defVal = {}
          if (Array.isArray(this.condition) && this.condition.length > 0) {
            defVal = this.condition.reduce((res, cur) => {
              res[cur.colName] = cur.value;
              return res
            }, {})
          }
          return this.srvCols.filter(item => !['Image', 'String', 'MultilineText'].includes(item.col_type)).map(
            item => {
              if (defVal[item.column]) {
                item.defaultValue = defVal[item.column]
                item.disabled = true
                item.value = defVal[item.column]
              }
              return item
            })
        }
      },
      orderList() {
        let cols = this.orderCols.filter(item => item.selected)
        if (cols.length === 0) {
          return this.order
        }
        let arr = cols.map(col => {
          return {
            colName: col.columns,
            orderType: col.orderType || 'asc'
          }
        })
        return arr
      },
      finalSearchColumn() {
        if (this.moreConfig?.searchColumn) {
          return this.moreConfig.searchColumn
        } else {
          if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
            return this.srvCols.reduce((res, cur) => {
              if (!['id', 'create_time', 'create_user', 'create_user_disp', 'del_flag', 'modify_time',
                  'modify_user', 'modify_user_disp'
                ].includes(cur.columns)) {
                res.push(cur.columns)
              }
              return res
            }, [])
          }
          return Object.keys(this.finalViewTemp).reduce((res, cur) => {
            if (this.finalViewTemp[cur]) {
              res.push(this.finalViewTemp[cur])
            }
            return res
          }, [])
        }
      },
    },
    data() {
      return {
        serviceName: "srvhealth_store_vaccination_appoint_record_select",
        list: [],
        pageNo: 1,
        rownumber: 20,
        total: 0,
        loadStatus: 'more',
        condition: null,
        appName: "",
        colV2: null,
        orderCols: [],
        // viewTmep:{}
        proc_data_type: "", //流程状态
        searchVal: "",
        listType: "list", //list,proc
        tabList: [],
        order: [],
      }
    },
    methods: {
      toOrder(e) {
        this.order = e
        // this.orderCols = e
        setTimeout(_ => {
          this.getList()
        }, 100)
        // this.$refs.bxList.getListData()
        // this.hideModal()
      },
      toFilter(e) {
        this.searchVal = ''
        this.showFilter = false;
        if (Array.isArray(e)) {
          let cond = e
          this.$refs.bxList.getListData(cond)
        }
      },
      toSearch(e) {
        let keywords = e || this.searchVal;
        this.searchVal = keywords
        this.pageNo = 1
        this.getList()
      },
      changeSerchVal(e) {
        this.searchVal = e
      },
      toFilter(e) {
        this.searchVal = ''
        this.showFilter = false;
        if (Array.isArray(e)) {
          let cond = e
          this.getList(cond)
        }
      },
      handlerCustomizeButton(e) {
        // 自定义按钮
        if (e.servcie_type === 'add') {
          let params = {
            type: 'add',
            serviceName: e.service_name,
            eventOrigin: e
          };
          uni.navigateTo({
            url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
              params)
          });
        } else if (e.servcie_type === 'select') {
          let params = {
            type: 'select',
            serviceName: e.service_name,
            defaultVal: data.row,
            eventOrigin: e
          };
          if (e.operate_params && Array.isArray(e.operate_params
              .condition)) {
            let viewTemp = {};
            if (e.service_name ===
              'srvhealth_store_vaccination_appoint_record_select') {
              viewTemp = {
                title: 'customer_name',
                img: 'person_image',
              }
            }
            uni.navigateTo({
              url: '/publicPages/list/list?pageType=list&serviceName=' +
                e.service_name +
                '&cond=' +
                JSON.stringify(e.operate_params.condition) +
                '&viewTemp=' +
                JSON.stringify(viewTemp)
            });
          }
        } else if (e.servcie_type === 'update') {
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
          let condition = button?.operate_params?.condition
          let defaultVal = button?.operate_params?.data
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
          let otherParams = this.handleSpecialClickEvent(res)
          if (otherParams && otherParams.otherFieldsCond) {
            if (Array.isArray(otherFieldsCond)) {
              fieldsCond = [...fieldsCond, ...otherFieldsCond]
            }
          }
          let url =
            `/publicPages/form/form?service=${e.service}&serviceName=${e.service_name}&type=${e.servcie_type}&fieldsCond=` +
            encodeURIComponent(JSON.stringify(fieldsCond));
          if (this.appName) {
            url += `&appName=${this.appName}`
          }
          if (otherParams && otherParams.hideColumn) {
            url += `&hideColumn=${JSON.stringify(otherParams.hideColumn)}`
          }
          uni.navigateTo({
            url: url
          });
        }
      },
      clickGridButton(e) {
        switch (e.button_type) {
          case 'select':
            this.showFilterModal()
            break;
          case 'add':
            this.clickAddButton(e)
            break;
          case 'order':
            this.showOrder()
            break;
          case 'customize':
            this.handlerCustomizeButton(e)
            break;
        }
      },
      clickAddButton(e) {
        if (e.button_type === 'add') {
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
          let url =
            `/publicPages/form/form?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

          url =
            `/publicPages/formPage/formPage?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

          if (this.appName) {
            url += `&appName=${this.appName}`
          }
          if (this.main_data) {
            url += `&main_data=${JSON.stringify(this.main_data)}`
          }
          uni.navigateTo({
            url: url
          });
        }

      },
      refresh() {
        this.loadStatus = 'more'
        this.pageNo = 1;
        this.getList()
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ?
          'proclist' :
          'list', app);
        colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
        if (!this.navigationBarTitle) {
          uni.setNavigationBarTitle({
            title: colVs.service_view_name
          });
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
        if (Array.isArray(colVs.srv_cols)) {
          this.orderCols = colVs.srv_cols.filter(item => {
            if (item.in_list === 1) {
              item.orderType = 'asc'
              item.selected = false;
              return true
            }
          })
        }
        return colVs;
      },
      async getList(cond) {
        let serviceName = this.serviceName;
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: this.condition || [],
          page: {
            rownumber: this.rownumber,
            pageNo: this.pageNo
          },
          order: this.orderList
        };
        if (this.listType === 'proc') {
          if (proc_data_type || this.proc_data_type) {
            req['proc_data_type'] = proc_data_type || this.proc_data_type;
          } else {
            req['proc_data_type'] = 'wait';
          }
        }
        if (Array.isArray(cond) && cond.length > 0) {
          req.condition = req.condition.concat(cond);
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
          } else if (this.listType === 'list') {
            if (page.rownumber * page.pageNo >= page.total) {
              this.loadStatus = 'norMore'
            } else {
              this.loadStatus = 'more'
            }
          }
          return this.list;
        }
      },
      async clickFootBtn(data) {
        let self = this
        let buttonInfo = this.deepClone(data.button);
        let rowData = this.deepClone(data.row);
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

          debugger
          if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
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
              // this.$refs.bxList.onRefresh();
              this.getList()
            }
            return
          } else if (buttonInfo.operate_type === '更新弹出') {
            // let params = {
            // 	type: buttonInfo.servcie_type,
            // 	serviceName: buttonInfo.operate_service,
            // 	defaultVal: {}
            // };
            // uni.navigateTo({
            // 	url: '/pages/public/formPage/formPage?serviceName=' +
            // 		buttonInfo.operate_service +
            // 		'&type=' +
            // 		buttonInfo.servcie_type +
            // 		'&cond=' +
            // 		decodeURIComponent(JSON.stringify(buttonInfo.operate_params.condition))
            // });
            debugger
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
              // buttonInfo.servcie_type = 'update'
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
              let otherParams = this.handleSpecialClickEvent(data)
              if (otherParams && otherParams.otherFieldsCond) {
                if (Array.isArray(otherFieldsCond)) {
                  fieldsCond = [...fieldsCond, ...otherFieldsCond]
                }
              }
              let url =
                `/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              if (otherParams && otherParams.hideColumn) {
                url += `&hideColumn=${JSON.stringify(otherParams.hideColumn)}`
              }
              uni.navigateTo({
                url: url
              });
              return
            }
            return
          } else if (buttonInfo.operate_type === '列表跳转') {
            debugger
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



        } else if (this.pageType === 'proc') {
          if (buttonInfo && buttonInfo.button_type === 'edit' && rowData.proc_instance_no) {
            uni.navigateTo({
              url: '/publicPages/procDetail/procDetail?proc_instance_no=' + rowData
                .proc_instance_no
            });
          }
        } else {

          debugger
          this.onButtonToUrl(data, this.appName).then(res => {
            if (buttonInfo && buttonInfo.button_type === 'delete') {
              if (res.state === 'SUCCESS') {
                this.$refs.bxList.onRefresh();
              }
            }
            if (buttonInfo && buttonInfo.button_type === 'detail') {
              let row = res.row;
              let btn = res.button;
              let params = {
                type: 'detail',
                condition: [{
                  colName: 'id',
                  ruleType: 'in',
                  value: row.id
                }],
                serviceName: btn.service_name,
                defaultVal: row
              };
              let url = `/pages/public/formPage/formPage?params=${JSON.stringify(params)}`
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              uni.navigateTo({
                url: url
              });
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
                let otherParams = this.handleSpecialClickEvent(res)
                if (otherParams && otherParams.otherFieldsCond) {
                  if (Array.isArray(otherFieldsCond)) {
                    fieldsCond = [...fieldsCond, ...otherFieldsCond]
                  }
                }
                let url =
                  `/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                  encodeURIComponent(JSON.stringify(fieldsCond));
                if (this.appName) {
                  url += `&appName=${this.appName}`
                }
                if (otherParams && otherParams.hideColumn) {
                  url += `&hideColumn=${JSON.stringify(otherParams.hideColumn)}`
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
              debugger
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

      }
    },
    onLoad(option) {
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.cond) {
        let cond = option.cond
        try {
          cond = JSON.parse(decodeURIComponent(option.cond));
        } catch (e) {
          console.log(e);
          //TODO handle the exception
        }
        if (Array.isArray(cond)) {
          cond.forEach(item => {
            if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
                'glry') && item.value === 'user_no') {
              item.value = uni.getStorageSync('login_user_info').user_no;
            }
            if (item.value === 'top.user.user_no') {
              item.value = uni.getStorageSync('login_user_info').user_no;
            }
          });
          this.condition = cond;
        }
      }

      if (this.serviceName) {
        this.getListV2().then(_ => {
          this.getList()
        })
      }
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.pageNo++;
        this.getList()
      }
    },
    onPullDownRefresh() {
      this.refresh()
      setTimeout(_ => {
        uni.stopPullDownRefresh()
      }, 500)
    }

  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    background: #F8F8FA;
    min-height: calc(100vh - var(--window-top));

    .list-next {
      padding: 20rpx;
    }
  }
</style>
