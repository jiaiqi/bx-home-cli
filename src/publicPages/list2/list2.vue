<template>
  <view class="page-wrap">
    <list-next class="list-next" :list="list" :colV2="colV2" :appName="appName" />
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
        orderList: [],
        // viewTmep:{}
        proc_data_type: "", //流程状态
        searchVal: "",
        listType: "list", //list,proc
        tabList: []
      }
    },
    methods: {
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
    },
    onLoad(option) {
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.cond) {
        let cond = query.cond
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
    .list-next{
      padding: 20rpx;
    }
  }
</style>
