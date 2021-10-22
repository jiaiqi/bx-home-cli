<template>
  <view class="mix-form-list">
    <view class="tab-list">
      <view class="tab-item">
        前台交班
      </view>
      <view class="tab-item">
        交班记录
      </view>
    </view>
    <view class="tab-content">
      <view class="form-box">
        <a-form v-if="addV2 && isArray(fields)" :fields="fields" :pageType="'add'" :formType="'add'"
          ref="bxForm" @value-blur="valueChange" :mainData="defaultVal" :defaultVal="defaultVal"></a-form>
      </view>
    </view>
    <view class="tab-content">

    </view>
  </view>
</template>

<script>
  let rownumber = 20
  export default {
    data() {
      return {
        appName: "store",
        serviceName: "srvhotel_join_info_select",
        addService:"srvhotel_join_info_add",
        addV2: null,
        listV2: null,
        condition: [],
        list: [],
        fields:[],
        loadStatus: 'more',
        pageNo: 1,
        orderList: [],
        orderCols: [],
        searchVal: "",
        listConfig: {

        },
        initCond: [],
        relationCondition: [],
        defaultVal:{}
      }
    },
    computed: {
      colV2() {
        return this.listV2
      }
    },
    onLoad() {
      this.getColV2('add')
    },
    methods: {
      valueChange(e){
        
      },
      async getColV2(type = 'list') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.serviceName, type, type, app);
        colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
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
        // if (Array.isArray(colVs.srv_cols)) {
        //   this.orderCols = colVs.srv_cols.filter(item => {
        //     if (item.in_list === 1) {
        //       item.orderType = 'asc'
        //       item.selected = false;
        //       return true
        //     }
        //   })
        // }
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
                    if (cond.colName === field.column && (!['Image'].includes(field.col_type)||(cond['value']&&cond['value'].indexOf('http')!==-1))) {
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
                    if (item.hasOwnProperty('value') && (!['Image'].includes(field.col_type)||(item.value&&item.value.indexOf('http')!==-1))) {
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
    .tab-list {
      display: flex;

      .tab-item {
        flex: 1;
        padding: 20rpx;
        text-align: center;
      }
    }
  }
</style>
