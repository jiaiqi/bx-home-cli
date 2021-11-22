<template>
  <view class="page-wrap" v-if="list&&list.length>0">
    <view class="title">
      <text>{{pageItem.component_label||''}}</text>
      <button class="cu-btn sm border  bg-white" @click="toAll">查看全部<text class="cuIcon-right"></text></button>
    </view>
    <view class="list-content" :style="{
        backgroundColor:list_config.bg
      }">
      <view class="list-view">
        <list-next class="list-next" :cartData="cartData" :listConfig="listConfig" :list="list" :listType="listType"
          :colV2="colV2" :appName="appName" @click-foot-btn="clickFootBtn" />
      </view>
    </view>
    <view class="" style="text-align: center;" v-if="list&&list.length===0">
      内容为空
    </view>
  </view>
</template>

<script>
  import listNext from '../../components/list-next/list-next.vue';
  export default {
    components: {
      listNext,
    },
    props: {
      pageItem: {
        type: Object
      },
    },
    computed: {
      isShowToAll() {
        let num = this.config?.page?.rownumber || this.rownumber;
        if (this.total > num) {
          return true
        }
        return false
      },
      serviceName() {
        return this.config?.serviceName
      },
      appName() {
        return this.config?.appName || uni.getStorageSync('activeApp')
      },
      publicButton() {
        if (Array.isArray(this.colV2?.gridButton) && this.colV2?.gridButton.length > 0) {
          return this.colV2.gridButton
        }
        return []
      },
      moreConfig() {
        return this.colV2?.moreConfig || {}
      },
      showSeeAll() {
        return this.pageItem.list_config.showSeeAll !== false
      },
      config() {
        if (this.pageItem && this.pageItem.list_config) {
          let config = this.pageItem.list_config;
          if (typeof config === 'string') {
            try {
              config = JSON.parse(config)
            } catch (e) {
              //TODO handle the exception
              console.warn(e)
            }
          }
          return config
        }
      },
      listConfig() {
        return this.config?.list_config || {}
      },
      list_config() {
        let config = this.colV2?.moreConfig?.list_config
        let obj = {
          'bg': this.listConfig?.bg || config?.bg || '',
          "lp_style": this.listConfig?.lp_style || config?.lp_style || "复合",
          "grid_span": this.listConfig?.grid_span || config?.grid_span || "2",
          "detailPage": this.listConfig?.detailPage || config?.detailPage,
          'margin': this.listConfig?.margin || config?.margin,
          'padding': this.listConfig?.padding || config?.padding,
          "list_bar": this.listConfig?.list_bar ?? config?.list_bar,
          "btn_cfg": {
            "show_custom_btn": this.listConfig?.btn_cfg?.show_custom_btn ?? config?.btn_cfg?.show_custom_btn ?? null,
            "show_public_btn": this.listConfig?.btn_cfg?.show_public_btn ?? config?.btn_cfg?.show_public_btn ??
              null,
            "show": config?.btn_cfg?.show || true,
            "bg_style": this.listConfig?.btn_cfg?.bg_style || config?.btn_cfg?.bg_style || "line",
            "bg": this.listConfig?.btn_cfg?.bg || config?.btn_cfg?.bg,
            'color': this.listConfig?.btn_cfg?.color || config?.btn_cfg?.color,
            "font_size": this.listConfig?.btn_cfg?.font_size || config?.btn_cfg?.font_size,
            "radius": this.listConfig?.btn_cfg?.radius || config?.btn_cfg?.radius || "10px",
            "size": this.listConfig?.btn_cfg?.size || config?.btn_cfg?.size || "sm",
            "padding": this.listConfig?.btn_cfg?.padding || config?.btn_cfg?.padding || null
          },
          "img": {
            "col": this.listConfig?.img?.col || config?.img?.col,
            "cfg": {
              "width": this.listConfig?.img?.width || config?.img?.cfg?.width || "100%",
              "height": this.listConfig?.img?.height || config?.img?.cfg?.height || "150rpx",
              "radius": config?.img?.cfg?.radius || "10px 10px 0 0",
              "position": config?.img?.cfg?.position || "top",
              "mode": this.listConfig?.img?.mode || config?.img?.cfg?.mode || "",
              "padding": this.listConfig?.img?.padding || config?.img?.cfg?.padding || "",
              "margin": this.listConfig?.img?.margin || config?.img?.cfg?.margin || ""
            }
          },
          cols: this.listConfig?.cols || config?.cols
        }
        return obj
        // return this.colV2?.moreConfig?.list_config || {}
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
            item.button_name = '筛选'
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
            button_name: '排序',
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
        let arr = []
        if (typeof cols === 'object') {
          cols = Object.keys(cols).map(key => cols[key]).filter(item => item && item)
          arr = this.srvCols.filter(item => cols.includes(item.columns) && !['Image', 'String'].includes(item
            .col_type))
        } else {
          let defVal = {}
          if (Array.isArray(this.condition) && this.condition.length > 0) {
            defVal = this.condition.reduce((res, cur) => {
              res[cur.colName] = cur.value;
              return res
            }, {})
          }
          arr = this.srvCols.filter(item => !['Image', 'String', 'MultilineText'].includes(item.col_type)).map(
            item => {
              if (defVal[item.column]) {
                item.defaultValue = defVal[item.column]
                item.disabled = true
                item.value = defVal[item.column]
              }
              return item
            })
        }
        if (Array.isArray(this.initCond) && this.initCond.length > 0) {
          arr = arr.map(field => {
            this.initCond.forEach(cond => {
              if (field.column === cond.colName) {
                field.value = cond.value
                field.defaultValue = cond.value
              }
            })
            return field
          })
        }
        return arr
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
    },
    data() {
      return {
        hideChildList: false,
        showMockCount: false,
        list: [],
        pageNo: 1,
        rownumber: 1,
        total: 0,
        loadStatus: 'more',
        condition: null,
        colV2: null,
        orderCols: [],
        proc_data_type: "", //流程状态
        searchVal: "",
        listType: "list", //list,proc,cart
        pageType: "", //list,proc,cart
        detailType: "", //  normal,custom
        tabList: [],
        order: [],
        cartData: [],
        wxMchId: '',
        customDetailUrl: "",
        initCond: [],
        relationCondition: [],
      }
    },
    methods: {
      toAll() {
        uni.navigateTo({
          url: `/publicPages/list2/list2?serviceName=${this.serviceName}&destApp=${this.appName}`
        })
      },
      getListWithFilter(e) {
        let self = this
        let tabsConds = this.$refs.filterTabs.buildConditions()
        this.relationCondition = tabsConds
        setTimeout(() => {
          this.pageNo = 1;
          this.getList(null, this.initCond)
        }, 100)

      },
      onFilterChange(e) {
        if (e) {
          let tabsConds = this.$refs.filterTabs.buildConditions()
          this.relationCondition = tabsConds
        }
      },
      clearCart() {
        this.cartData = []
      },
      changeAmount(data) {
        if (data && data.row && typeof data.index === 'number') {
          this.$set(this.cartData, data.index, data.row)
          if (data.row.goods_count === 0) {
            this.cartData.splice(data.index, 1)
          }
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

          let url =
            `/publicPages/form/form?service=${e.service}&serviceName=${e.service_name}&type=${e.servcie_type}&fieldsCond=` +
            encodeURIComponent(JSON.stringify(fieldsCond));
          if (this.appName) {
            url += `&appName=${this.appName}`
          }

          uni.navigateTo({
            url: url
          });
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
        this.getList(null, this.initCond)
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', this.listType === 'proc' ?
          'proclist' :
          'list', app);
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
      async getList(cond, initCond) {
        let serviceName = this.serviceName;
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: this.condition || [],
          page: {
            rownumber: this.config?.page?.rownumber || this.rownumber,
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
        if (Array.isArray(this.config?.condition) && this.config.condition.length > 0) {
          let data = {
            userInfo: this.$store?.state?.user?.userInfo,
            storeInfo: this.$store?.state?.app?.storeInfo,
            bindUserInfo: this.$store?.state?.user?.storeUserInfo
          }
          this.config.condition.forEach(cond => {
            let obj = {}
            obj.colName = cond.colName;
            obj.ruleType = cond.ruleType;
            obj.value = this.renderStr(cond.value, data)
            req.condition.push(obj)
          })
        }
        if (Array.isArray(initCond) && initCond.length > 0) {
          req.condition = [...req.condition, ...initCond]
        }

        let keywords = this.searchVal;

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
          this.total = res.data.page.total
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
      async clickFootBtn(data) {
        let self = this
        let buttonInfo = this.deepClone(data.button);
        let rowData = this.deepClone(data.row);
        if (buttonInfo?.more_config) {
          try {
            buttonInfo.moreConfig = JSON.parse(buttonInfo.more_config)
          } catch (err) {
            console.log(err)
          }
        }
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
                this.refresh()
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
              this.refresh()
            }
            return
          } else if (buttonInfo.operate_type === "URL跳转") {
            let storeInfo = this.$store?.state?.app?.storeInfo
            let bindUserInfo = this.$store?.state?.user?.storeUserInfo

            let obj = {
              data: rowData,
              rowData,
              storeInfo,
              bindUserInfo
            };
            if (buttonInfo?.moreConfig?.navUrl) {
              let url = this.renderStr(buttonInfo.moreConfig.navUrl, obj)
              uni.navigateTo({
                url
              })
            }

          } else if (buttonInfo.operate_type === '详情弹出' || buttonInfo.operate_type === '详情跳转') {
            let storeInfo = this.$store?.state?.app?.storeInfo
            let bindUserInfo = this.$store?.state?.user?.storeUserInfo

            // let targetUrl = this.customDetailUrl
            // let obj = {
            //   data: rowData,
            //   rowData,
            //   storeInfo,
            //   bindUserInfo
            // };
            // obj = this.deepClone(obj)
            // targetUrl = this.renderStr(this.customDetailUrl, obj)
            let url =
              `/publicPages/detail/detail?serviceName=${buttonInfo.service_name}`
            // }

            let condition = buttonInfo?.operate_params?.condition
            if (Array.isArray(condition) && condition.length > 0) {
              url += `&cond=${JSON.stringify(condition)}`
            } else {
              return
            }
            if (this.appName) {
              url += `&appName=${this.appName}`
            }
            uni.navigateTo({
              url: url
            })
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
              debugger
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
              // if (Array.isArray(condition) && condition.length > 0) {
              //   condition.forEach(cond => {
              //     fieldsCond.push({
              //       column: cond.colName,
              //       value: cond.value
              //     })
              //   })
              // }
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
            // debugger
            // let serviceName = buttonInfo.service_name;
            // let 
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
            debugger
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
            if (targetUrl && targetUrl.indexOf('"value":""') !== -1) {
              let condition = buttonInfo?.operate_params?.condition
              let fieldsCond = [{
                column: 'id',
                value: rowData.id
              }]
              let url = `/publicPages/form/form?serviceName=${buttonInfo.service_name}&type=detail&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));

              // if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
              //   'childTableList') {
              url =
                `/publicPages/detail/detail?serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // }
              if (this.hideChildList) {
                url =
                  `/publicPages/form/form?type=detail&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              }
              if (Array.isArray(condition) && condition.length > 0) {
                url += `&condition=${JSON.stringify(condition)}`
              }
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              targetUrl = url
            }
            uni.navigateTo({
              url: targetUrl
            })
            return
          }

          this.onButtonToUrl(data, this.appName).then(res => {
            if (buttonInfo && buttonInfo.button_type === 'delete') {
              if (res.state === 'SUCCESS') {
                // this.getList()
                this.refresh()
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

      }
    },
    mounted() {
      if (this.serviceName) {
        this.getListV2().then(_ => {
          this.refresh()
        })
      }
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.pageNo++;
        this.getList(null, this.initCond)
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
    // min-height: calc(100vh - var(--window-top));
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .title {
      font-size: 16px;
      padding: 10rpx;
      display: flex;
      justify-content: space-between;
    }

    .list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .list-view {
        flex: 1;
        overflow-y: scroll;
      }
    }
  }
</style>
