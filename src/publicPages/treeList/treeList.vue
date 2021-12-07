<template>
  <view class="tree-list-wrap">
    <view class="search-bar" v-if="showSearchBar">
      <view class="cu-bar search bg-white ">
        <view class="search-form round">
          <text class="cuIcon-search"></text>
          <input @focus="searchBarFocus" @blur="serachBarBlur" :adjust-position="false" type="text" v-model="searchVal"
            :placeholder="placeholder" confirm-type="search" />
        </view>
        <view class="action" v-if="searchVal">
          <button class="cu-btn bg-blue shadow-blur round margin-right-xs" @click="toSearch">搜索</button>
        </view>
        <view class="action" v-else>
          <button class="cu-btn bg-blue shadow-blur round margin-right-xs" v-if="showAdd"
            @click="clickAddButton">添加</button>
          <button class="cu-btn bg-blue shadow-blur round" @click="$refs.bxList.onRefresh()"><text
              class="cuIcon-refresh"></text></button>
        </view>
      </view>
      <view style="height: auto;width: 100%;display: flex;margin-left: 10px;padding: 10px 0;" v-if="establish.length>0"
        @click="ectabClick()">
        <view v-for="(item,index) in establish" :key='index' style="display: flex;">
          <view class="lastestab" v-if="index==(establish.length-1)">
            <view style="font-size: 15px;margin-top: 5px;">查看所有节点：</view>
            <view class="allnodes">
              {{item.label}}
            </view>
          </view>
        </view>
      </view>
    </view>
    <bx-list ref="bxList" :srvApp="appName" :serviceName="serviceName" :condition="condition"
      :relation_condition="relation_condition" :pageType="pageType" :listType="'list'"
      :rowButtons="listConfig && listConfig.rowButton ? listConfig.rowButton : []" :showTab="false" :viewTemp="viewTemp"
      :listConfig="listConfig" :showButton="showRowButton" :fixed="true" :top="listTop" :searchWords="searchVal"
      :searchColumn="keyColumn" :tempWord="tempWord" :rownumber="10" :showFootBtn="showFootBtn"
      @click-list-item="clickItem" @list-change="listChange" @clickFootBtn="clickFootBtn" @loadEnd="loadEnd"
      :showBtn="showBtn" v-if="listConfig"></bx-list>
    <u-popup mode="bottom" v-model="show" border-radius="14" :closeable=true>
      <view class="content">
        <scroll-view scroll-y="true" style="height: auto;">
          <view>
            <view v-for="(item,index) in establish" :key='index' style="display: flex;">
              <view style="padding-top: 10px;display: flex;" @click="dotClick(item,index)">
                <view class="dot" style=" background: red;">
                  <view style="margin-top: 8px;" v-if="index!==(establish.length-1)">|</view>
                </view>
                <view style="margin-left: 10px;">
                  {{item.label}}
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>

  </view>
</template>

<script>
  import bxList from '@/publicPages/components/bx-list/tree-list.vue';
  export default {
    components: {
      bxList
    },
    computed: {
      userInfo() {
        return this.$store?.state?.user?.userInfo
      },
      // storeInfo() {
      //   return this.$store?.state?.app?.storeInfo
      // }
    },
    data() {
      return {
        appName: "",
        show: false,
        serviceName: '',
        pageType: '',
        placeholder: '输入搜索关键词',
        listConfig: null,
        srv_cols: [],
        condition: [],
        relation_condition: null,
        pattern: {
          color: '#7A7E83',
          backgroundColor: '#fff',
          selectedColor: '#007AFF',
          buttonColor: '#007AFF'
        },
        fabContent: [],
        fabHorizontal: 'left',
        fabVertical: 'bottom',
        fabDirection: 'horizontal',
        listTop: 100,
        showRowButton: 'true',
        viewTemp: {
          // title: 'name',
          // tip: 'desc',
          // img: 'img',
          // price: 'current_price',
          // footer: 'shop_name'
        },
        publicButton: [],
        searchVal: '',
        keyColumn: '',
        showAdd: false,
        noData: false,
        showSearchBar: true,
        showFootBtn: true,
        tempWord: {},
        queryParams: {},
        queryOption: {},
        navigationBarTitle: null,
        showNavBack: false,
        showBtn: [{
          "page_type": "树形列表",
          "button_name": "+查看下级",
          "button_type": "seechild",
          "service_name": "srvoa_project_track_add",
          // "service_view_name": "项目需求目标增加",
          "always_show": false,
          "permission": true,
          "client_type": "PC,APP",
          "tip_msg": null,
          "biz_authority_cfg": null,
          "application": "oa",
          "is_public": true,
          "id": 'seechild',
          "page_area": "表格行按钮",
          "more_config": null,
          "seq": 50,
          "disp_exps": null
        }],
        establish: [],
        parent_no: null,
        shareUrl: ''
      };
    },

    onReachBottom() {
      if (!this.noData) {
        this.$refs.bxList.pageInfo.pageNo++;
        this.$refs.bxList.getListData().then(data => {});
      }
    },
    onPullDownRefresh() {
      if (this.serviceName && this.$refs.bxList) {
        // this.getListV2();
        this.$refs.bxList.onRefresh();
      }
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 200)
    },
    onShow() {
      if (this.serviceName && this.$refs.bxList) {
        // this.getListV2();
        this.$refs.bxList.onRefresh();
      }
    },

    onShareAppMessage(e) {
      let title = e?.target?.dataset?.sharetitle
      let path = e?.target?.dataset?.shareurl
      let _data = {
        rowData: {
          share_user_no: this.$store?.state?.user?.userInfo?.userno,
          no: e?.target?.dataset?.row?.no,
          org_name: e?.target?.dataset?.row?.org_name,
          store_no: e?.target?.dataset?.row?.store_no,
        },
        userInfo: this.$store?.state?.user?.userInfo,
        storeInfo: this.$store?.state?.app?.storeInfo
      }
      if (typeof _data.rowData === 'object') {
        delete _data.rowData._buttons
        path += `&rowData=${JSON.stringify(_data.rowData)}`
      }
      let imageUrl = this.getImagePath(this.storeInfo?.image, true);
      debugger
      this.saveSharerInfo(this.userInfo, path);

      return {
        imageUrl: imageUrl,
        title: title,
        path: path
      };
    },
    async onLoad(option) {
      await this.toAddPage()
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.establish) {
        try {
          this.establish = JSON.parse(option.establish)
          console.log(this.establish)
        } catch (e) {
          //TODO handle the exception
          console.log(e)
        }

      }
      console.log(option)
      if (option.parent_no) {
        this.parent_no = option.parent_no
      } else {
        // this.condition = [{
        // 	colName: "parent_no",
        // 	ruleType: "isnull"
        // }]
      }
      let query = {};
      // #ifdef H5
      this.listTop = 100;
      if (option.query) {
        query = JSON.parse(decodeURIComponent(option.query));
      } else {
        query = option;
      }
      // #endif
      // #ifdef MP-WEIXIN
      if (option.serviceName) {
        query = option;
      } else {
        query = JSON.parse(decodeURIComponent(option.query));
      }
      if (option.navigationBarTitle) {
        this.navigationBarTitle = option.navigationBarTitle;
        uni.setNavigationBarTitle({
          title: option.navigationBarTitle
        });
      }
      // #endif
      // #ifdef APP-PLUS
      query = option
      // #endif
      if (option.hasOwnProperty('showAdd')) {
        this.queryOption = option;
      }
      if (query.viewTemp) {
        this.viewTemp = JSON.parse(query.viewTemp);
        if (this.viewTemp.title) {
          this.keyColumn = this.viewTemp.title;
        }
        // if (query.destApp) {
        //   uni.setStorageSync('activeApp', query.destApp);
        // }
      }
      this.showNavBack = query.showNavBack || false
      if (query.cond) {
        try {
          let cond = JSON.parse(decodeURIComponent(query.cond));
          if (Array.isArray(cond)) {
            cond.forEach(item => {
              if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
                  'glry') && item.value === 'user_no') {
                item.value = uni.getStorageSync('login_user_info').user_no;
              }
            });
            this.condition = cond;
          }
        } catch (e) {
          console.log(e);
          //TODO handle the exception
        }
        // this.condition = JSON.parse(this.getDecodeUrl(option.cond));
      }
      if (query.relation_condition) {
        try {
          let cond = JSON.parse(decodeURIComponent(query.relation_condition));
          if (Array.isArray(cond.data)) {
            cond.data.forEach(item => {
              if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
                  'glry') && item.value === 'user_no') {
                item.value = uni.getStorageSync('login_user_info').user_no;
              }
            });
            this.relation_condition = cond;
          }
        } catch (e) {
          console.log(e);
          //TODO handle the exception
        }
      }

      if (query.tempWord) {
        this.tempWord = JSON.parse(query.tempWord);
      }
      if (query.showRowButton) {
        this.showRowButton = query.showRowButton;
      }
      if (query.serviceName && query.pageType) {
        this.serviceName = query.serviceName;
        this.pageType = query.pageType;
        if (query.params) {
          let params = {};
          if (typeof query.params === 'string') {
            try {
              params = JSON.parse(query.params);
              this.queryParams = params;
            } catch (e) {
              //TODO handle the exception
            }
          }
        }
        this.getListV2();
      } else {
        // uni.showToast({
        // 	title:"无效页面",
        // 	icon:"Error"
        // })
        // setTimeout(()=>{
        // 	uni.hideToast()
        // 	uni.navigateBack()
        // },2000)
      }
    },
    methods: {
      removeByValue(arr, attr, value) {
        var index = 0;
        for (var i in arr) {
          if (arr[i][attr] == value) {
            index = i;
            break;
          }
        }
        // arr.splice(index, 1);
      },
      dotClick(e, index) {
        this.show = false
        if (index !== 0) {
          uni.navigateBack({
            delta: this.establish.length - index
          })
        } else {
          uni.navigateTo({
            url: `/publicPages/treeList/treeList?serviceName=${this.serviceName}&pageType=list&destApp=${this.appName}`
          });
        }
      },
      ectabClick(e, index) {
        this.show = true
      },
      toSearch() {
        let keywords = this.searchVal;
        this.$refs.bxList.toSearch();
      },
      loadEnd(e) {
        this.noData = true;
      },
      clickAddButton() {
        if (this.pageType === 'proc') {
          this.publicButton.map(item => {
            if (item.button_type === 'add' || item.button_type === 'apply') {
              uni.navigateTo({
                url: '/publicPages/proc/apply/apply?serviceName=' + item.service_name +
                  '&cond=' + decodeURIComponent(JSON.stringify(this.condition))
              });
            }
          });
        } else {
          this.publicButton.map(item => {
            if (item.button_type === 'add') {
              if (this.establish !== []) {
                let routes = getCurrentPages();
                let curParam = routes[routes.length - 1].options
                console.log(curParam)
                var a = {
                  [this.listConfig.parent_no_col]: curParam.parent_no
                }
                let params = {
                  type: 'add',
                  serviceName: curParam.serviceName,
                  defaultVal: a,
                };
                uni.navigateTo({
                  url: `/publicPages/formPage/formPage?serviceName=${curParam.serviceName}&type=add&destApp=${this.appName}`
                  // url: '/publicPages/formPage/formPage?params=' + JSON.stringify(params)
                });
              } else {
                const params = {
                  type: 'add',
                  condition: this.condition,
                  serviceName: item.service_name,
                  service_view_name: item.service_view_name
                };
                uni.navigateTo({
                  // url: '../formPage/formPage?serviceName=' + item.service_name +
                  // 	'&type=add&cond=' + decodeURIComponent(JSON.stringify(this.condition))
                  url: '../formPage/formPage?serviceName=' + item.service_name +
                    '&type=add&params=' + decodeURIComponent(JSON.stringify(params))
                });
              }

            } else if (item.button_type === 'customize') {}
          });
        }
      },
      searchBarFocus(e) {
        console.log('searchBarFocus:', e);
      },
      serachBarBlur(e) {
        console.log('serachBarBlur:', e);
      },
      listChange(e) {
        console.log('listChange:', e);
      },
      clickItem(e) {
        if (this.pageType === 'proc') {
          uni.navigateTo({
            url: '/publicPages/proc/procDetail/procDetail?proc_instance_no=' + e.proc_instance_no
          });
        } else {
          let req = {
            button: {
              button_name: '详情',
              button_type: 'detail',
              service_name: this.serviceName
            },
            row: e
          };

          uni.navigateTo({
            url: `/publicPages/formPage/formPage?type=detail&cond=[{"colName":"id","ruleType":"eq","value":"${e.id}"}]&serviceName=${this.serviceName}&destApp=${this.appName}`
          });
          try {
            // this.onButtonToUrl(req)
          } catch (e) {
            //TODO handle the exception
          }
        }
        console.log('click-list-item:', e);
      },
      async clickFootBtn(data) {
        let buttonInfo = this.deepClone(data.button);
        let rowData = this.deepClone(data.row);
        console.log(buttonInfo)
        // if(buttonInfo.type==='share'){
        //   let url = buttonInfo.url
        //   let _data = {
        //     rowData:rowData,
        //     userInfo:this.$store?.state?.user?.userInfo,
        //     storeInfo:this.$store?.state?.app?.storeInfo
        //   }
        //   url = this.renderStr(url,_data)
        //   this.shareUrl = url
        //   return
        // }
        if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
          try {
            buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
            if (Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params.condition
              .length > 0) {
              buttonInfo.operate_params.condition.forEach(cond => {
                if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
                  cond.value = data.row[cond.value.value_key];
                } else if (typeof cond.value === 'object' && cond.value.value_type ===
                  'constant') {
                  cond.value = cond.value.value;
                }
              });
            }
            if (buttonInfo && buttonInfo.operate_params && buttonInfo.operate_params.data && Array.isArray(
                buttonInfo.operate_params.data) && buttonInfo.operate_params.data.length >
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
            if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
              let req = [{
                serviceName: buttonInfo.operate_service,
                condition: buttonInfo.operate_params.condition,
                data: buttonInfo.operate_params.data
              }];
              let app = this.appName || uni.getStorageSync('activeApp');
              let url = this.getServiceUrl(buttonInfo.application ? buttonInfo.application : app,
                buttonInfo.operate_service, buttonInfo.servcie_type);
              let res = await this.$http.post(url, req);
              if (res.data.state === 'SUCCESS') {
                this.$refs.bxList.onRefresh();
              }
            } else if (buttonInfo.operate_type === '更新弹出') {
              let params = {
                type: buttonInfo.servcie_type,
                serviceName: buttonInfo.operate_service,
                main_table: buttonInfo.main_table,
                service: buttonInfo.service,
                button_type: buttonInfo.button_type,
              };
              if (Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data
                .length > 0) {
                params.defaultVal = buttonInfo.operate_params.data[0]
              }
              let url =
                `/publicPages/formPage/formPage?serviceName=${buttonInfo.operate_service}&type=${buttonInfo.servcie_type}&cond=${ decodeURIComponent(JSON.stringify(buttonInfo.operate_params.condition))}`
              uni.navigateTo({
                url
              });
            }
          } catch (e) {
            console.error(e);
            //TODO handle the exception
          }
        }

        if (this.pageType === 'proc') {
          // if (data.button && data.button.button_type === 'edit' && data.row.proc_instance_no) {
          //   uni.navigateTo({
          //     url: '/publicPages/proc/procDetail/procDetail?proc_instance_no=' + data.row
          //       .proc_instance_no
          //   });
          // }
        } else {
          this.onButtonToUrl(data, this.appName).then(res => {
            if (data.button && data.button.button_type === 'delete') {
              if (res.state === 'SUCCESS') {
                this.$refs.bxList.onRefresh();
              } else {
                uni.showToast({
                  title: res.resultMessage,
                  icon: 'none'
                })
              }
            }
            if (data.button && data.button.button_type === 'detail') {
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
              let cond = [{
                "colName": "id",
                "ruleType": "eq",
                "value": row.id
              }]
              let url =
                `/publicPages/detail/detail?type=detail&cond=[{"colName":"id","ruleType":"eq","value":"${row.id}"}]&serviceName=${btn.service_name}&destApp=${btn.application}`
              uni.navigateTo({
                url
              });
            } else if (data.button && (data.button.button_type === 'duplicate' || data.button
                .button_type === 'duplicatedeep')) {
              let fieldsCond = []
              if (Array.isArray(this.condition)) {
                this.condition.forEach(item => {
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
              if (this.appName) {
                url += `&destApp=${this.appName}`
              }
              uni.navigateTo({
                url: url
              });
            } else if (data.button.servcie_type === 'select') {
              let params = {
                type: 'select',
                serviceName: res.button.service_name,
                defaultVal: res.row,
                eventOrigin: res.button
              };
            } else if (data.button.servcie_type === 'add') {
              let params = {
                type: 'add',
                serviceName: res.button.service_name,
                defaultVal: res.row,
                eventOrigin: res.button
              };

              uni.navigateTo({
                url: '/publicPages/formPage/formPage?params=' + JSON.stringify(params)
              });
            } else if (data.button && data.button.button_type === 'addchild') {
              var a = {
                [this.listConfig.parent_no_col]: rowData[this.listConfig.no_col]
              }
              let fieldsCond = [{
                column: this.listConfig.parent_no_col,
                value: rowData[this.listConfig.no_col]
              }]
              let url =
                `/publicPages/formPage/formPage?destApp=${this.appName}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type||'add'}&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));
              uni.navigateTo({
                url
              })
              // let params = {
              //   type: 'add',
              //   serviceName: res.button.service_name,
              //   defaultVal: a,
              //   eventOrigin: res.button
              // };
              // uni.navigateTo({
              //   url: '/publicPages/formPage/formPage?params=' + JSON.stringify(params)
              // });
            } else if (data.button && data.button.button_type === 'seechild') {
              let params = {
                label: rowData[this.listConfig.key_disp_col],
                value: rowData[this.listConfig.no_col]
              };
              const establish = this.deepClone(this.establish)
              establish.push(params)
              uni.navigateTo({
                url: `/publicPages/treeList/treeList?destApp=${this.appName}&serviceName=${this.serviceName}&pageType=list&parent_no=${params.value}&establish=${JSON.stringify(establish)}`
              });

            } else if (data.button && data.button.operate_type === '流程申请') {
              uni.navigateTo({
                url: '/publicPages/proc/apply/apply?serviceName=' + data.button
                  .operate_service
              });
            } else if (data.button && data.button.button_type === 'customize') {
              let moreConfig = data.button.more_config;
              console.log(buttonInfo, rowData)
              if (moreConfig && typeof moreConfig === 'string') {
                try {
                  moreConfig = JSON.parse(moreConfig);
                } catch (e) {
                  //TODO handle the exception
                  console.log(e);
                }
              }
              if (data.button?.button_name === '支付码') {
                // 跳转到下单、生成支付码页面
                uni.navigateTo({
                  url: `/publicPages/payCode/payCode?id=${data.row.id}`
                })
                return
              } else if (data.button?.button_name === '填写问卷') {
                uni.navigateTo({
                  url: `/pages/specific/quest/quest?id=${data.row.id}`
                })
                return
              }
              // let params = {
              // 	type: data.button.servcie_type,
              // 	serviceName: res.button.service_name,
              // 	defaultVal: res.row,
              // 	eventOrigin: res.button
              // };
              let params = {
                type: buttonInfo.servcie_type,
                serviceName: buttonInfo.operate_service,
                main_table: buttonInfo.main_table,
                service: buttonInfo.service,
                button_type: buttonInfo.button_type,
              };
              if (buttonInfo && buttonInfo.operate_params && buttonInfo.operate_params.data &&
                Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data
                .length > 0) {
                params.defaultVal = buttonInfo.operate_params.data[0]
              }
              let url = ''
              switch (buttonInfo.servcie_type) {
                case 'add':
                  url = `/publicPages/formPage/formPage?params=${JSON.stringify(params)}`
                  break;
                case 'operate':

                  break;
              }
              switch (buttonInfo.operate_type) {
                case '列表弹出':
                  let cond = buttonInfo.operate_params.condition
                  if (Array.isArray(cond)) {
                    url =
                      `/publicPages/list/list?pageType=list&serviceName=${buttonInfo.operate_service}&cond=${JSON.stringify(cond)}`
                  }
                  break;
                case 'URL跳转':
                  if (buttonInfo.pre_data_handle) {
                    // #ifdef H5
                    let arr = []
                    arr.push(rowData)
                    let result = eval("var fun=" + buttonInfo.pre_data_handle +
                      "(arr); fun")
                    if (result) {
                      let url = result.slice(result.indexOf('/pages/'))
                      uni.navigateTo({
                        url
                      })
                    }
                    // #endif
                  }

                  break;
                case 'operate':

                  break;
              }
              if (params && url) {
                uni.navigateTo({
                  url
                })
              }
            }
          });
        }
        console.log('clickFootBtn:', data, this.pageType);
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ? 'proclist' :
          'treelist', app);
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
            console.log(e)
          }
        }
        this.listConfig = colVs;
        if (this.parent_no) {
          this.condition = [{
            colName: colVs.parent_no_col,
            ruleType: "eq",
            value: this.parent_no
          }]
        } else {
          this.condition = [{
            colName: colVs.parent_no_col,
            ruleType: "isnull"
          }]
        }
        if (this.pageType === 'proc') {
          this.showFootBtn = false;
        }
        this.publicButton = colVs.gridButton.filter(item => {
          if (item.permission === true) {
            switch (item.button_type) {
              case 'add':
              case 'apply':
                this.showAdd = true;
                return item;
                break;
              case 'select':
                this.showSearchBar = true;
                // #ifdef MP-WEIXIN
                this.listTop = 100;
                // #endif
                return item;
                break;
              case 'customize':
                break;
            }
          }
        });
        return colVs;
      }
    }
  };
</script>

<style lang="scss">
  .tree-list-wrap {
    background-color: #f8f8fa;
    min-height: calc(100vh - var(--window-top));
  }

  .add-button {
    position: fixed;
    bottom: 100upx;
    left: calc(50% - 50upx);
    width: 100upx;
    height: 100upx;
    border-radius: 50%;
    background-color: #0bc99d;
    z-index: 100;

    &::before {
      position: absolute;
      width: 8upx;
      height: 60upx;
      left: calc(50% - 4upx);
      top: 20upx;
      content: '';
      background-color: #fff;
    }

    &::after {
      position: absolute;
      width: 60upx;
      height: 8upx;
      content: '';
      top: calc(50% - 4upx);
      left: 20upx;
      background-color: #fff;
    }

    &:active {
      transform: rotate(45deg);
      transition: all 0.2s;
    }
  }

  .search-bar {
    flex: 1;
  }

  .content {
    padding: 20px;
    text-align: center;
    font-size: 15px;
  }

  .dot {
    margin-top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background: #ffff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);

  }

  .lastestab {
    display: flex;

    .allnodes {
      background-color: #0081ff;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 3px;
    }
  }
</style>
