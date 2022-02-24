<template>
  <!-- 简介、导航、科室列表、名医介绍、就诊通知、在线预约挂号链接 -->
  <view class="page-wrap" v-if="(!showAuthBox || client_env === 'web')" :class="['theme-' + theme]">
    <cu-custom-navbar :isBack="showBackHome" :back-home="showBackHome">
      <view class="nav-bar" @click="openSwitchHomePage">
        <text class="home-name">{{ StoreInfo.name || '首页' }}</text>
        <text class="cuIcon-unfold margin-left-xs"></text>
      </view>
    </cu-custom-navbar>

    <template v-if="pageItemList&&pageItemList.length>0">
      <store-item v-for="pageItem in pageItemList" :goodsListData="goodsListData" :key="pageItem.component_no"
        :pageItem="pageItem" :StoreInfo="StoreInfo" :userInfo="userInfo" :is-bind="isBind" :bindUserInfo="bindUserInfo"
        ref="storeItem" @toDoctorDetail="toDoctorDetail" @toConsult="toConsult" @bindStore="bindStore"
        @setHomePage="setHomePage" @toSetting="toSetting" @getQrcode="getQrcode" :before-click="clickStoreItem">
      </store-item>
    </template>

    <user-setting @save="savePushSet" ref='userSetting'></user-setting>
    <public-module></public-module>
    <u-tabbar :value="currentTab" :list="tabbarList" :mid-button="false"
      v-if="pageDefine && tabbarList && tabbarList.length > 0" :before-switch="beforeSwitch" @change="changeTab">
    </u-tabbar>
  </view>
  <bx-auth v-else @auth-complete="initPage"></bx-auth>

</template>

<script>
  import {
    mapState
  } from 'vuex';
  import StoreItem from './store-item/store-item.vue';
  import userSetting from './user-setting/user-setting.vue'
  var socketOpen = false;
  var socketMsgQueue = [];
  var socketIsLogin = false;
  var socketTask = null;
  export default {
    components: {
      StoreItem,
      userSetting
    },
    data() {
      return {
        pdNo: '', // 页面定义编号
        // currentTab: 0,
        tabbarList: [],
        pageDefine: {},
        unread_num: 0,
        networkErrTimes: 0,
        showHomeBtn: true,
        client_env: uni.getStorageSync('client_env'),
        isBind: true, //当前用户是否绑定此诊所
        bindUserInfo: {},
        goodsListData: [],
        storeNo: '',
        StoreInfo: {},
        kefuSessionInfo: {},
        pageItemList: [],
        storeList: [],
        modalName: '',
        push_msg_set: '',
        member_status: '',
        globalData: {},
        pt_no: '', // 二维码参数编号
        ptInfo: null,
        rowData: {},
        invite_user_no: '',
        showAuthBox: false
      };
    },
    computed: {
      currentTab() {
        if (Array.isArray(this.tabbarList) && this.tabbarList.length > 0) {
          return this.tabbarList.findIndex(item => item.link_pd_no === this.pdNo);
        }
      },
      showBackHome() {
        if (this.storeNo === "S0000000000") {
          return false
        }
        let status = this.StoreInfo?.audit_status;
        if (status) {
          if (status === '仅本店' || status === '双向隔离') {
            return false;
          }
          return true;
        }
      },
      ...mapState({
        theme: state => state.app.theme,
        wxUserInfo: state => state.user.wxUserInfo,
        userInfo: state => state.user.userInfo,
        inviterInfo: state => state.app.inviterInfo,
        subscsribeStatus: state => state.app.subscsribeStatus, //是否关注公众号
        // hasNotRegInfo: state => state.app.hasNotRegInfo //授权访问用户信息
      }),
      pushMsgSetOptions() {
        let arr = [{
            label: '群消息',
            value: '群消息',
            checked: false
          },
          {
            label: '群公告所有人',
            value: '群公告所有人',
            checked: false
          },
          {
            label: '客服回复消息',
            value: '客服回复消息',
            checked: false
          },
          {
            label: '预约通知',
            value: '预约通知',
            checked: false
          }
        ];
        arr = arr.map(item => {
          if (this.bindUserInfo?.push_msg_set) {
            let push_msg_set = this.bindUserInfo.push_msg_set;
            if (push_msg_set.indexOf(item.value) !== -1) {
              item.checked = true;
            }
          }
          return item;
        });
        return arr;
      }
    },
    methods: {
      clickStoreItem(e) {
        if (this.hasNotRegInfo) {
          debugger
        }
      },
      beforeSwitch(index) {
        let curTab = this.tabbarList[index];
        if (index !== this.pageDefine.active_nav_index) {
          if (!curTab?.link_pd_no) {
            if (curTab.link_pd_json) {
              let data = this;
              try {
                curTab.link_pd_json = this.renderStr(curTab.link_pd_json, data);
                let jsonStr = JSON.parse(curTab.link_pd_json);
                if (jsonStr.url) {
                  uni.navigateTo({
                    url: jsonStr.url
                  });
                }
              } catch (err) {
                console.log(err);
              }
            }
            return false;
          }
        }
        return true;
      },
      async changeTab(index) {
        let curTab = this.tabbarList[index];
        if (curTab?.link_pd_no) {
          this.pageItemList = []
          this.pdNo = curTab?.link_pd_no;
          await this.getPageDefine(this.pdNo);
          await this.getTabbar(this.pdNo);
          await this.getPageComponent(this.pdNo);

          this.initPage();
        } else if (curTab.link_pd_json) {
          try {
            let jsonStr = JSON.parse(curTab.link_pd_json);
            if (jsonStr.url) {
              uni.navigateTo({
                url: jsonStr.url
              });
            }
          } catch (err) {
            console.log(err);
          }
        }
      },
      getQrcode(e) {
        this.StoreInfo.store_qr_code = e;
        this.$store.commit('SET_STORE_INFO', this.StoreInfo);
      },
      savePushSet(data) {
        // 保存通知设置
        this.updateStoreUser(data, true);
      },
      joinStore() {
        // 加入店铺 店铺用户状态改为正常
        let data = {
          member_status: '正常'
        };
        this.updateStoreUser(data, true);
      },
      exitStore() {
        // 退出店铺 店铺用户状态改为退出
        let data = {
          member_status: '退出'
        };
        this.updateStoreUser(data, true);
      },
      async updateStoreUser(data, showToast) {
        let req = [{
          serviceName: 'srvhealth_store_user_update',
          condition: [{
            colName: 'id',
            ruleType: 'eq',
            value: this.bindUserInfo?.id
          }],
          data: [data]
        }];
        let res = await this.$fetch('operate', 'srvhealth_store_user_update', req, 'health');
        this.hideModal();
        if (res.success) {
          if (showToast) {
            uni.showToast({
              title: '操作成功'
            });
          }
          this.selectBindUser(true);
        }
      },
      toSetting() {
        this.$refs.userSetting.modalName = 'setting'
        // this.modalName= 'setting';
      },
      hideModal() {
        this.modalName = null;
      },
      checkUserAuth() {
        if (this.hasNotRegInfo) {
          this.showAuthBox = true
          return
        }
      },
      openSwitchHomePage() {
        let cond = [{
            colName: 'person_no',
            ruleType: 'eq',
            value: this.userInfo?.no
          },
          {
            colName: 'member_status',
            ruleType: 'in',
            value: '正常'
          }
        ];
        if (this.userInfo?.no) {
          let listConfig = {
            navTitle: '切换店铺',
            listBarReadonly: true,
            show_public_btn: false,
            padding: '0px',
            margin: '5px 10px 0',
            detailPage: '/storePages/home/home?store_no=${data.store_no}',
            navType: 'reLaunch',
            img: {
              col: 'image',
              cfg: {
                position: 'left',
                width: '75px',
                height: '50px',
                radius: '5px 0 0 5px'
              }
            },
            cols: [{
                col: 'name',
                cfg: {
                  disp_label: false,
                  font_weight: 600,
                  font_size: '16px',
                  width: '100%'
                }
              },
              {
                col: 'user_role',
                cfg: {
                  disp_label: true,
                  font_size: '12px',
                  color: '#666'
                }
              }
            ]
          };
          let url =
            `/publicPages/list2/list2?serviceName=srvhealth_store_user_select&destApp=health&cond=${JSON.stringify(cond)}&listConfig=${encodeURIComponent(
						JSON.stringify(listConfig)
					)}` +
            `&customDetailUrl=${encodeURIComponent('/storePages/home/home?store_no=${data.store_no}')}&detailType=custom`;
          uni.navigateTo({
            url
          });
        }
      },
      // getConfig(pageItem) {
      //   if (pageItem && pageItem.type) {
      //     let type = pageItem.type;
      //     let keys = Object.keys(pageItem);
      //     let config = {};
      //     if (Array.isArray(keys) && keys.length > 0) {
      //       keys.forEach(key => {
      //         if (key === 'more_config' && pageItem[key] && typeof pageItem[key] === 'string') {
      //           try {
      //             pageItem[key] = JSON.parse(pageItem[key]);
      //           } catch (e) {
      //             //TODO handle the exception
      //           }
      //         }
      //         config[key] = pageItem[key];
      //       });
      //       config.type = pageItem['type'];
      //       return config;
      //     }
      //   }
      // },
      async getPageItem() {
        let req = {
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }],
          order: [{
            colName: 'order_no',
            orderType: 'asc'
          }],
          page: {
            rownumber: 100
          }
        };
        let res = await this.$fetch('select', 'srvhealth_store_home_component_user_select', req, 'health');
        if (res.success) {
          let setFirstSwiper = false;
          this.pageItemList = res.data
            .filter(item => item.display !== '否' && item.button_usage !== '管理人员')
            .map(item => {
              if (!setFirstSwiper && item.type === '轮播图') {
                item.isFirstSwiper = true;
                setFirstSwiper = true;
              }
              return item;
            });
          this.getComponentData();
        }
      },
      async getComponentData() {
        const storeNo = this.storeNo;
        let req = [];
        const pageItemList = this.pageItemList.filter(item => ['按钮组', '人员列表', '商品列表', '通知横幅', '关联店铺'].includes(
          item.type));

        for (let index = 0; index < pageItemList.length; index++) {
          const element = pageItemList[index];
          let reqBody = null;
          switch (element.type) {
            case '关联店铺':
              reqBody = {
                serviceName: 'srvhealth_store_relation_select',
                colNames: ['*'],
                condition: [{
                    colName: 'relation_type',
                    ruleType: 'in',
                    value: element.relation_type
                  },
                  {
                    colName: 'a_store_no',
                    ruleType: 'eq',
                    value: storeNo
                  }
                ],
                page: {
                  pageNo: 1,
                  rownumber: 99
                }
              };
              break;
            case '按钮组':
              reqBody = {
                serviceName: 'srvhealth_page_item_buttons_select',
                colNames: ['*'],
                condition: [{
                    colName: 'item_no',
                    ruleType: 'eq',
                    value: element.component_no
                  },
                  {
                    colName: 'button_usage',
                    ruleType: 'ne',
                    value: '管理人员'
                  }
                ],
                page: {
                  pageNo: 1,
                  rownumber: 99
                }
              };
              break;
            case '人员列表':
              reqBody = {
                serviceName: 'srvhealth_store_user_select',
                colNames: ['*'],
                condition: [{
                    colName: 'store_no',
                    ruleType: 'eq',
                    value: storeNo
                  },
                  {
                    colName: 'user_role',
                    ruleType: 'inset',
                    value: element.more_config?.user_role || '大夫'
                  }
                ]
              };
              break;
            case '文章列表':
              // reqBody = {
              //   "serviceName": "srvdaq_cms_category_select",
              //   "colNames": [ "*" ],
              //   "condition": [ {
              //     "colName": "parent_no",
              //     "value": element.category_no,
              //     "ruleType": "eq"
              //   } ],
              //   "page": {
              //     "pageNo": 1,
              //     "rownumber": 999
              //   }
              // };
              break;
            case '疫苗列表':
              // reqBody = {
              //   serviceName: "srvhealth_store_vaccine_stocks_select",
              //   "page": {
              //     "pageNo": 1,
              //     "rownumber": 100
              //   },
              //   "colNames": [ "*" ],
              //   condition: [
              //     {
              //       colName: 'vaccine_type',
              //       ruleType: 'in',
              //       value: "一类,二类"
              //     },
              //     {
              //       colName: 'store_no',
              //       ruleType: 'eq',
              //       value: storeNo
              //     }
              //   ]
              // }
              break;
            case '轮播图':
              // reqBody =
              break;
            case '商品列表':
              reqBody = {
                serviceName: 'srvhealth_store_goods_guest_select',
                colNames: ['*'],
                condition: [{
                  colName: 'store_no',
                  ruleType: 'eq',
                  value: storeNo
                }]
              };
              // if (element?.more_config && typeof element.more_config === 'string') {
              // 	let more_config = {};
              // 	try {
              // 		more_config = JSON.parse(element.more_config);
              // 	} catch (err) {
              // 		console.log(err);
              // 	}
              // 	if (Array.isArray(element.more_config?.condition) && element.more_config?.condition.length > 0) {
              // 		reqBody.condition = [...reqBody, ...element.more_config?.condition];
              // 	}
              // }
              break;
            case '通知横幅':
              reqBody = {
                serviceName: 'srvhealth_store_home_notice_select',
                colNames: ['*'],
                condition: [{
                  colName: 'component_no',
                  ruleType: 'eq',
                  value: element.component_no
                }],
                page: {
                  pageNo: 1,
                  rownumber: 10
                }
              };
              break;
          }
          if (reqBody) {
            req.push(reqBody);
          }
        }
        let res = await this.$fetch('multi', 'select', req, 'health');
        if (res.success) {
          let dataArray = res.data;
          for (let index = 0; index < pageItemList.length; index++) {
            const element = pageItemList[index];
            dataArray[index] = dataArray[index].data;
            switch (element.type) {
              case '关联店铺':
                element['listdata'] = dataArray[index];
                break;
              case '按钮组':
                element['listdata'] = dataArray[index].filter(item => item.display !== '否' && item
                  .display !== '隐藏');
                break;
              case '人员列表':
                element['listdata'] = dataArray[index];
                break;
              case '商品列表':
                // if (Array.isArray(dataArray[index]) && dataArray[index].length > 0) {
                //   element['listdata'] = dataArray[index].reduce((pre, cur) => {
                //     let url = this.getImagePath(cur['goods_img'], true);
                //     cur.url = url;
                //     if (cur['goods_img']) {
                //       this.getImageInfo({
                //         url: url
                //       }).then(picInfo => {
                //         if (picInfo.w && picInfo.h) {
                //           let res = this.setPicHeight(picInfo);
                //           if (res.w && res.h) {
                //             this.$set(cur, 'imgWidth', res.w);
                //             this.$set(cur, 'imgHeight', res.h);
                //           }
                //         }
                //       });
                //     }
                //     pre.push(cur)
                //     return pre
                //   }, []);
                // }
                break;
              case '通知横幅':
                element['listdata'] = dataArray[index].map(item => {
                  if (!item.style_config) {
                    item.style_config = {};
                  } else if (typeof item.style_config === 'string') {
                    try {
                      item.style_config = JSON.parse(item.style_config);
                    } catch (e) {
                      //TODO handle the exception
                    }
                  }
                  return item;
                });
                break;
            }
            //  [ '按钮组', '人员列表', '商品列表', '通知横幅' ]
          }
          this.pageItemList = this.pageItemList.map(item => {
            let obj = pageItemList.find(a => a.component_no === item.component_no);
            if (obj) {
              // item.listdata = obj.listdata
              this.$set(item, 'listdata', obj.listdata);
            }
            return item;
          });
          uni.$emit('updateStoreItemData');
        }
      },
      toDeptDetail(e) {
        // 跳转到科室详情
        uni.navigateTo({
          url: '/pediaPages/department/department?dept_no=' + e.no
        });
      },
      toDocotrDetail(e) {
        // 跳转到医生主页
        uni.navigateTo({
          url: `/storePages/Registration/RegistrationDetail?storeNo=${e.store_no}&doctorNo=${e.person_no}`
        });
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(350);
        content.h = (maxW * content.h) / content.w;
        content.w = maxW;
        return content;
      },
      async selectBindUser(updated = false) {
        let condition = [{
          colName: 'person_no',
          ruleType: 'eq',
          value: this.userInfo.no
        }];
        let req = {
          page: {
            rownumber: 99999
          },
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }]
        };
        if (condition) {
          req.condition = [...req.condition, ...condition];
        }
        let userList = null;
        let res = await this.$fetch('select', 'srvhealth_store_user_select', req, 'health');
        if (res.success && res.data.length > 0) {
          userList = res.data;
        }
        if (Array.isArray(userList)) {
          let isBind = userList.find(item => item.person_no === this.userInfo.no);
          if (isBind && isBind.person_no) {
            if (isBind.member_status !== '退出') {
              this.isBind = true;
            } else {
              this.isBind = false;
            }
            this.bindUserInfo = isBind;
            let invite_user_no = this.invite_user_no || this.inviterInfo?.invite_user_no || this.userInfo
              ?.invite_user_no;
            if (invite_user_no && invite_user_no !== this.userInfo?.userno && !updated) {
              if (this.StoreInfo?.standard == '更新') {
                // if (!this.bindUserInfo.invite_store_user_no||this.StoreInfo?.standard !== '不更新') {
                // 更新店铺用户的邀请人编码
                let data = {
                  invite_user_no: invite_user_no
                };
                let inviterStoreUser = await this.getInviteStoreUser(invite_user_no);
                if (inviterStoreUser && inviterStoreUser.store_user_no && inviterStoreUser
                  .store_user_no !== this
                  .bindUserInfo?.store_user_no) {
                  data.invite_store_user_no = inviterStoreUser.store_user_no;
                }
                this.updateStoreUser(data);
              }
            }
            // this.push_msg_set = this.bindUserInfo.push_msg_set;
            // this.member_status = this.bindUserInfo.member_status;
            this.$store.commit('SET_STORE_USER', this.bindUserInfo);
          } else {
            this.isBind = false;
          }
        } else {
          this.isBind = false;
        }
      },
      async getInviteStoreUser(user_no) {
        let url = this.getServiceUrl('health', 'srvhealth_store_user_share_select', 'select');
        let req = {
          colNames: ['*'],
          serviceName: 'srvhealth_store_user_share_select',
          condition: [{
              colName: 'user_account',
              ruleType: 'eq',
              value: user_no
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: this.StoreInfo.store_no
            }
          ],
          page: {
            rownumber: 1
          }
        };
        if (!user_no) {
          return;
        }
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          return res.data.data[0];
        }
      },
      // getGoodsListData() {
      // 	let req = {
      // 		condition: [
      // 			{
      // 				colName: 'store_no',
      // 				ruleType: 'eq',
      // 				value: this.storeNo
      // 			}
      // 		]
      // 	};
      // 	this.$fetch('select', 'srvhealth_store_goods_guest_select', req, 'health').then(res => {
      // 		if (Array.isArray(res.data)) {
      // 			this.goodsListData = res.data;
      // 		}
      // 	});
      // },
      async selectStoreInfo(times = 0) {
        let req = {
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeNo
          }],
          page: {
            pageNo: 1,
            rownumber: 1
          }
        };
        let serviceName = 'srvhealth_store_list_select';
        // serviceName = 'srvhealth_store_mgmt_select'
        let res = await this.$fetch('select', serviceName, req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          let theme = 'blue';
          if (res.data[0].para_cfg) {
            try {
              let moreConfig = JSON.parse(res.data[0].para_cfg);
              res.data[0].moreConfig = moreConfig;
              if (moreConfig.theme) {
                theme = moreConfig.theme;
              }
            } catch (err) {
              console.log(err);
            }
          }
          this.$store.commit('SET_THEME', theme);
          // this.setNavBg(this.theme)
          this.StoreInfo = res.data[0];
          if (this.StoreInfo.home_page_no && !this.pdNo) {
            this.pdNo = this.StoreInfo.home_page_no;
            await this.getPageDefine(this.StoreInfo.home_page_no);
            await this.getTabbar(this.StoreInfo.home_page_no);
            await this.getPageComponent(this.StoreInfo.home_page_no);
          }
          this.$store.commit('SET_STORE_INFO', res.data[0]);
          // if (this.StoreInfo.type === '健康服务') {
          // 	this.getGoodsListData();
          // }
          // if (this.StoreInfo.is_show === '是') {
          let res1 = await this.getStoreUserInfo(this.StoreInfo.store_no)
          // .then(res => {
          if (Array.isArray(res1) && res1.length >= 1) {
            // 店铺用户列表中已存在此用户

          } else {
            // 当前用户不在此诊所中 则添加当前用户到此诊所中
            this.bindStore();
          }
          // });
          // }
        } else {
          if (res && res.code === '0011') {
            await this.toAddPage();
            times++;
            if (times < 3) {
              this.selectStoreInfo(times);
            }
          } else {
            uni.showModal({
              title: '未查找到机构信息',
              content: `${res ? JSON.stringify(res) : ''}  storeNo为${this.storeNo}`,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  });
                }
              }
            });
          }
        }
      },

      async bindStore() {
        // 将当前登录用户添加到店铺用户列表，角色为用户
        if (!this.userInfo || !this.userInfo.no) {
          await this.toAddPage();
        }
        // if (this.hasNotRegInfo) {
        //   return
        // }
        if (this.bindUserInfo?.member_status === '退出') {
          this.joinStore();
          return;
        }
        let req = [{
          serviceName: 'srvhealth_store_user_add',
          condition: [],
          data: [{
            store_no: this.storeNo,
            name: this.StoreInfo.name,
            image: this.StoreInfo.image,
            type: this.StoreInfo.type,
            person_no: this.userInfo.no,
            person_name: this.userInfo && this.userInfo.name ? this.userInfo.name.replace(
              /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '') : '',
            user_account: this.userInfo.userno,
            nick_name: this.userInfo && this.userInfo.nick_name ? this.userInfo.nick_name
              .replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '') : '',
            profile_url: this.userInfo.profile_url,
            // user_image: this.userInfo.user_image,
            sex: this.userInfo.sex,
            user_role: '用户',
            add_url: this.userInfo?.add_url || this.inviterInfo.add_url,
            invite_user_no: this.invite_user_no || this.userInfo?.invite_user_no || this
              .inviterInfo?.invite_user_no
          }]
        }];
        let invite_user_no = this.invite_user_no || this.inviterInfo?.invite_user_no || this.userInfo
          ?.invite_user_no;
        try {
          let inviterStoreUser = await this.getInviteStoreUser(invite_user_no);
          if (inviterStoreUser && inviterStoreUser.store_user_no) {
            req[0].data[0].invite_store_user_no = inviterStoreUser.store_user_no;
          }
        } catch (err) {
          console.log(err);
        }
        if (this.userInfo?.user_image) {
          if (this.userInfo?.user_image.indexOf('http') == -1) {
            req[0].data[0].user_image = this.userInfo?.user_image
          }
        }
        let res = await this.$fetch('operate', 'srvhealth_store_user_add', req, 'health');
        if (res.success) {
          this.isBind = true;
          if (res.data.length > 0) {
            this.bindUserInfo = res.data[0];
            this.push_msg_set = this.bindUserInfo.push_msg_set;
            this.member_status = this.bindUserInfo.member_status;
            this.$store.commit('SET_STORE_USER', this.bindUserInfo);
            return this.bindUserInfo;
          }
        } else {
          this.isBind = false;
          return res;
        }
      },
      async toDoctorDetail(e) {
        if (!this.bindUserInfo || !this.bindUserInfo.store_user_no) {
          this.bindUserInfo = await this.bindStore();
          this.$store.commit('SET_STORE_USER', this.bindUserInfo);
        }
        if (this.bindUserInfo && this.bindUserInfo.store_user_no && e.person_no && e.store_no) {
          let url = '';
          if (e && e.person_no && e.store_no && this.bindUserInfo.store_user_no) {
            url = `/publicPages/chat/chat?type=机构用户客服&receiver_person_no=${e.person_no}&identity=客户&storeNo=${e.store_no}&store_user_no=${
						this.bindUserInfo.store_user_no
					}`;
          }
          uni.navigateTo({
            url: url
          });
        }
      },
      async toConsult() {
        // 在线咨询
        if (!this.bindUserInfo || !this.bindUserInfo.store_user_no) {
          this.bindUserInfo = await this.bindStore();
          this.$store.commit('SET_STORE_USER', this.bindUserInfo);
        }
        if (this.bindUserInfo && this.bindUserInfo.store_user_no) {
          uni.navigateTo({
            url: `/publicPages/chat/chat?type=机构用户客服&identity=客户&storeNo=${this.storeNo}&store_user_no=${this.bindUserInfo.store_user_no}`
          });
        }
      },
      async setHomePage() {
        let self = this;
        let req = [{
          serviceName: 'srvhealth_person_info_update',
          condition: [{
            colName: 'no',
            ruleType: 'eq',
            value: this.userInfo.no
          }],
          data: [{
            home_store_no: this.userInfo.home_store_no === this.storeNo ? '' : this.storeNo
          }]
        }];

        if (!this.userInfo || !this.userInfo.no) {
          await this.toAddPage();
        }
        if (!this.StoreInfo || !this.StoreInfo.store_no) {
          await this.selectStoreInfo();
        }
        uni.showModal({
          title: '提示',
          content: `请确认是否${this.userInfo.home_store_no === this.storeNo ? '取消' : ''}将 ${this.StoreInfo.name} 设置为首页`,
          success(result) {
            if (result.confirm) {
              self.$fetch('operate', 'srvhealth_person_info_update', req, 'health').then(res => {
                if (res.success && res.data.length > 0 && res.data[0].no === self
                  .userInfo.no) {
                  uni.showToast({
                    title: '设置成功'
                  });
                  self.$store.commit('SET_USERINFO', res.data[0]);
                }
              });
            }
          }
        });
      },
      async getStoreUserInfo(no) {
        let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
        let req = {
          serviceName: 'srvhealth_store_user_select',
          colNames: ['*'],
          condition: [{
              colName: 'person_no',
              ruleType: 'eq',
              value: this.userInfo.no
            },
            {
              colName: 'store_no',
              ruleType: 'eq',
              value: no
            }
          ]
        };
        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.bindUserInfo = res.data.data[0]
          this.$store.commit('SET_STORE_USER', res.data.data[0]);
          return res.data.data;
        }
      },
      async getQuery() {
        if (!this.pt_no) {
          return;
        }
        let isHandQuery = getApp().globalData.isHandQuery;
        // if (isHandQuery) {
        //   return
        // }
        let url = this.getServiceUrl('health', 'srvsys_page_def_select', 'select');
        let req = {
          serviceName: 'srvsys_page_def_select',
          colNames: ['*'],
          condition: [{
            colName: 'pt_no',
            ruleType: 'eq',
            value: this.pt_no
          }],
          page: {
            pageNo: 1,
            rownumber: 1
          }
        };
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let data = res.data.data[0];
            try {
              let obj = {
                rowData: this.rowData,
                inviterInfo: this.$store?.state?.app?.inviterInfo,
                StoreInfo: this.StoreInfo,
                userInfo: this.userInfo,
                bindUserInfo: this.bindUserInfo
              };
              data.serviceJson = JSON.parse(this.renderStr(data.service_json, obj));
            } catch (e) {
              //TODO handle the exception
            }
            this.ptInfo = data;
            if (data.pg_code && data.service) {
              let url = '';
              switch (data.pg_code) {
                case 'form':
                case 'formPage':
                  url = `/publicPages/${data.pg_code}/${data.pg_code}?serviceName=${data.service}`;
                  if (data.serviceJson?.initFields) {
                    url += `&fieldsCond=${JSON.stringify(data.serviceJson.initFields)}`;
                  }
                  if (data.app) {
                    url += `&destApp=${data.app}`;
                  }
                  break;
                case 'list':
                  break;
                case 'list2':
                  break;
              }
              if (data.serviceJson?.afterSubmit) {
                url += `&afterSubmit=${data.serviceJson.afterSubmit}`;
              }
              if (url) {
                let pages = getCurrentPages();
                let curPage = pages[pages.length - 1];
                let beforeRedirectUrl = curPage?.$page?.fullPath;
                if (beforeRedirectUrl) {
                  beforeRedirectUrl = beforeRedirectUrl.replace('pt_no', 'ptNo');
                }
                getApp().globalData.beforeRedirectUrl = beforeRedirectUrl;
                // getApp().globalData.isHandQuery = true
                this.pt_no = '';
                if (data?.serviceJson?.navType) {
                  uni[data.serviceJson.navType]({
                    url
                  });
                } else {
                  uni.redirectTo({
                    url
                  });
                }
              }
            }
            return data;
          }
        }
      },
      async initSocket() {
        if (!socketOpen) {
          uni.closeSocket();
          socketTask = uni.connectSocket({
            url: this.$api.wsAddr,
            fail(err) {
              uni.showModal({
                title: '提示',
                content: err.errMsg,
                showCancel: false
              });
            }
          });
        }

        uni.onSocketOpen(function(res) {
          socketOpen = true;
          let msg = {
            srv: 'ws_login',
            value: uni.getStorageSync('bx_auth_ticket')
          };
          // uni.showToast({
          //   title: "socket连接成功！",
          //   icon: "none"
          // })
          uni.sendSocketMessage({
            data: JSON.stringify(msg),
            complete(e) {
              console.log(e);
            }
          });
          for (var i = 0; i < socketMsgQueue.length; i++) {
            sendSocketMessage(socketMsgQueue[i]);
          }
          socketMsgQueue = [];
        });

        uni.onSocketMessage(function(res) {
          console.log('收到服务器内容：' + res.data);
          let data = JSON.parse(res.data);
          if (data.code === 'SUCCESS') {
            if (data?.data?.content) {
              uni.showToast({
                title: data.data.content,
                icon: 'none'
              });
            }
            if (data?.data?.unread_num || data?.data?.unread_num === 0) {
              self.unread_num = data?.data?.unread_num;
            }
            if (data?.data?.more_config?.broadcast) {
              // 语音播报MP3地址
              // #ifdef MP-WEIXIN
              const bgAudioManager = uni.getBackgroundAudioManager();
              bgAudioManager.title = '百想首页-语音播报';
              bgAudioManager.singer = '百想首页';
              bgAudioManager.coverImgUrl =
                'https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-uni-app-doc/7fbf26a0-4f4a-11eb-b680-7980c8a877b8.png';
              bgAudioManager.src = data.data.more_config.broadcast;
              bgAudioManager.onPlay(() => {
                uni.showToast({
                  title: data.data.content,
                  icon: 'none'
                });
                console.log('开始播放,mpweixin');
              });
              bgAudioManager.play();
              // #endif
              // #ifdef H5
              const innerAudioContext = uni.createInnerAudioContext();
              innerAudioContext.autoplay = true;
              innerAudioContext.src = data.data.more_config.broadcast;
              innerAudioContext.onPlay(() => {
                // uni.showToast({
                //   title: "开始播放,h5",
                //   icon: "none"
                // })
              });
              innerAudioContext.onError(res => {
                console.log(res.errMsg);
                console.log(res.errCode);
              });
              innerAudioContext.play();
              // #endif
            }
          }
        });

        uni.onSocketClose(function(res) {
          socketOpen = false;
          console.log('WebSocket 已关闭！');
        });
      },
      async initPage() {
        let self = this;
        await this.toAddPage();
        if (!this.subscsribeStatus) {
          // 检测是否已关注公众号
          this.checkSubscribeStatus();
        }
        if (this.storeNo) {
          await this.selectStoreInfo();
          // await this.selectBindUser();
          if (!this.pageItemList || (Array.isArray(this.pageItemList) && this.pageItemList.length == 0)) {
            if (!this.pdNo) {
              await this.getPageItem();
            }
          }
          if (!this.vstoreUser?.id) {
             await this.bindStore();
          }
          
          this.getQuery();
          this.initSocket()
        } else {
          // uni.showToast({
          // 	title: '未发现store_no',
          // 	icon: 'none'
          // })
        }
        // this.selectInStore()
      },
      async getPageDefine(home_page_no) {
        const service = 'srvsys_page_def_select';
        let url = this.getServiceUrl('health', service, 'select');
        const req = {
          serviceName: service,
          colNames: ['*'],
          condition: [{
            colName: 'pt_no',
            value: home_page_no,
            ruleType: 'eq'
          }]
        };
        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.pageDefine = res.data.data[0];
          // this.currentTab = this.pageDefine.active_nav_index;
        }
      },
      async getPageComponent(home_page_no) {
        let url = this.getServiceUrl('health', 'srvhealth_store_home_component_user_select', 'select');
        let req = {
          serviceName: 'srvhealth_store_home_component_user_select',
          colNames: ['*'],
          condition: [{
            colName: 'pd_no',
            ruleType: 'eq',
            value: home_page_no
          }, {
            colName: 'display',
            ruleType: 'eq',
            value: '是'
          }],
          page: {
            pageNo: 1,
            rownumber: 99
          },
          order: []
        };
        let res = await this.$http.post(url, req);
        this.pageItemList = []
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          // this.pageItemList = res.data.data;
          let setFirstSwiper = false;
          this.pageItemList = res.data.data
            .filter(item => item.display !== '否' && item.button_usage !== '管理人员')
            .map(item => {
              if (!setFirstSwiper && item.type === '轮播图') {
                item.isFirstSwiper = true;
                setFirstSwiper = true;
              }
              return item;
            });
          this.getComponentData();
        }
      },
      async getTabbar(home_page_no) {
        let url = this.getServiceUrl('health', 'srvhealth_page_bottom_navigation_select', 'select');
        let req = {
          serviceName: 'srvhealth_page_bottom_navigation_select',
          colNames: ['*'],
          order: [{
            colName: 'nav_seq',
            orderType: 'asc'
          }],
          condition: [{
            colName: 'owner_pd_no',
            ruleType: 'eq',
            value: home_page_no
          }],
          page: {
            pageNo: 1,
            rownumber: 5
          }
        };
        let res = await this.$http.post(url, req);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          this.tabbarList = res.data.data.map(item => {
            item.iconPath = 'https://cdn.uviewui.com/uview/common/min_button.png';
            item.selectedIconPath = 'https://cdn.uviewui.com/uview/common/min_button_select.png';
            item.text = item.label;
            if (item.nav_icon) {
              item.iconPath = this.getImagePath(item.nav_icon, true);
            }
            if (item.nav_icon_selected) {
              item.selectedIconPath = this.getImagePath(item.nav_icon_selected, true);
            }
            return item;
          });
        }
      },
      async getCouponInfo(option = {}) {
        // 查找被赠送的卡券的信息
        const {
          cardNo,
          shareStoreUserNo,
          invite_user_no
        } = option
        if (cardNo) {
          let serviceName = 'srvhealth_store_card_case_select';
          let app = uni.getStorageSync('activeApp') || 'health';
          let url = this.getServiceUrl(app, serviceName, 'select');
          let req = {
            "serviceName": serviceName,
            "colNames": ["*"],
            "condition": [{
                colName: 'card_no',
                ruleType: 'eq',
                value: cardNo
              },
              {
                colName: 'useing_store_user_no',
                ruleType: 'eq',
                value: shareStoreUserNo
              }
            ],
            "page": {
              "pageNo": 1,
              "rownumber": 1
            }
          }
          let res = await this.$http.post(url, req)
          if (res?.data?.state == 'SUCCESS' && res.data.data.length > 0) {
            let couponInfo = res.data.data[0]
            let prompt = await new Promise((resolve) => {
              uni.showModal({
                title: '提示',
                content: '收到好友赠送的卡券，是否放入卡包？',
                success: (res) => {
                  if (res.confirm) {
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                }
              })
            })

            if (prompt === true) {
              let data = {
                useing_store_user_no: this.bindUserInfo?.store_user_no,
                give_store_user_no: couponInfo.useing_store_user_no,
              }
              this.updateCouponInfo(data, cardNo)
            }

          }
        }
      },
      async updateCouponInfo(data, cardNo) {
        let serviceName = 'srvhealth_give_store_card_case_update';
        let url = this.getServiceUrl('health', serviceName, 'update');
        const req = [{
          "serviceName": serviceName,
          "condition": [{
            "colName": "card_no",
            "ruleType": "eq",
            "value": cardNo
          }],
          "data": [data]
        }]
        const res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS') {
          uni.showToast({
            'title': '操作成功！'
          })
        }
      },
    },
    onPullDownRefresh() {
      this.initPage();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
    },
    async onShow() {
      let globalData = getApp().globalData;
      this.globalData = globalData;
      if (!this.subscsribeStatus) {
        // 检测是否已关注公众号
        this.checkSubscribeStatus();
      }
    },
    onShareAppMessage() {
      let path =
        `pages/home/home?from=share&store_no=${this.storeNo}&invite_user_no=${this.userInfo.userno}&share_type=bindOrganization&doctor_no=${this.userInfo.no}`;
      let title = `${this.userInfo.name}邀请您使用【${this.StoreInfo.name}】`;
      title = this.renderEmoji(title)
      // title = `${this.userInfo.name}邀请您使用【呼吸健康云助手】，【呼吸健康云助手】 -- 集患者服务，呼吸筛查，医生助理，科学研究为一体的功能性小程序`
      let imageUrl = this.getImagePath(this.StoreInfo.image, true);
      if (this.StoreInfo?.logo) {
        imageUrl = this.getImagePath(this.StoreInfo.logo, true);
      }
      this.saveSharerInfo(this.userInfo, path);
      return {
        imageUrl: imageUrl,
        title: title,
        path: path
      };
    },
    beforeDestroy() {
      uni.$off('updateSessionLastLookTime');
      uni.$off('updateStoreInfo');
    },

    async onLoad(option) {
      if (option?.bx_auth_ticket) {
        uni.setStorageSync('bx_auth_ticket', option.bx_auth_ticket)
        uni.setStorageSync('isLogin', true)
        this.$store.commit('SET_TICKET', option.bx_auth_ticket)
      }
      if (option.rowData) {
        try {
          this.rowData = JSON.parse(option.rowData);
        } catch (e) {
          //TODO handle the exception
        }
      }
      let globalData = getApp().globalData;
      this.globalData = globalData;
      let pageInfo = getCurrentPages();
      if (Array.isArray(pageInfo) && pageInfo.length === 1) {
        this.showHomeBtn = true;
      }
      this.$store.commit('SET_INTO_HOSPITAL_STATUS', true);
      // #ifdef MP-WEIXIN
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage']
      });
      // #endif
      uni.$on('updateStoreSessionLastLookTime', e => {
        this.selectBindUser();
        // this.selectUnreadAmount()
      });
      uni.$on('updateKefuSessionLastLookTime', e => {
        this.kefuSessionInfo = e;
        // this.selectUnreadAmount()
      });
      uni.$on('updateUnread', e => {
        // this.initPage()
      });
      uni.$on('networkErr', _ => {
        setTimeout(() => {
          if (this.networkErrTimes < 3) {
            this.initPage();
            this.networkErrTimes++;
          }
        }, 2000);
      });

      if (option.q) {
        let text = this.getDecodeUrl(option.q);
        if (text && text.indexOf('https://wx2.100xsys.cn/home/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/home/')[1];
          if (result.split('/').length >= 2) {
            option.store_no = result.split('/')[0];
            option.invite_user_no = result.split('/')[1];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (result.split('/').length === 1) {
            option.store_no = result.split('/')[0];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          }
        }

        // 通用二维码参数
        if (text && text.indexOf('https://wx2.100xsys.cn/qrcode/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/qrcode/')[1];
          let arr = result.split('/');
          if (arr.length == 3) {
            let rowData = this.getUrlParams(arr[2], 'rowData');
            if (rowData) {
              try {
                this.rowData = JSON.parse(rowData);
              } catch (e) {
                //TODO handle the exception
              }
              option.pt_no = arr[1];
              getApp().globalData.pt_no = option.pt_no;
              option.share_type = 'bindOrganization';
              option.from = 'share';
            } else {
              option.invite_user_no = arr[1];
              option.pt_no = arr[2];
              getApp().globalData.pt_no = option.pt_no;
              option.share_type = 'bindOrganization';
              option.from = 'share';
            }
            option.store_no = arr[0];
          } else if (arr.length == 2) {
            option.store_no = arr[0];
            option.pt_no = arr[1];
            getApp().globalData.pt_no = option.pt_no;
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (arr.length === 1) {
            option.store_no = arr[0];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          }
        }

        if (text && text.indexOf('https://wx2.100xsys.cn/mpwx/shareClinic/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/mpwx/shareClinic/')[1];
          if (result.split('/').length >= 2) {
            option.store_no = result.split('/')[0];
            option.invite_user_no = result.split('/')[1];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (result.split('/').length === 1) {
            option.store_no = result.split('/')[0];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          }
        }
        if (text && text.indexOf('https://wx2.100xsys.cn/shareClinic/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/shareClinic/')[1];
          let arr = result.split('/');
          if (arr.length == 3) {
            option.store_no = arr[0];
            option.room_no = arr[1];
            if (arr[1].indexOf('room_no=') !== -1) {
              option.room_no = arr[1].split('room_no=')[1];
            }
            option.invite_user_no = arr[2];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (arr.length == 2) {
            option.store_no = arr[0];
            if (arr[1].indexOf('room_no=') !== -1) {
              option.room_no = arr[1].split('room_no=')[1];
            } else {
              option.invite_user_no = arr[1];
            }
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (arr.length === 1) {
            option.store_no = arr[0];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          }
        }

        // 酒店入住
        if (text && text.indexOf('https://wx2.100xsys.cn/checkIn/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/checkIn/')[1];
          if (result.split('/').length >= 2) {
            option.store_no = result.split('/')[0];
            option.invite_user_no = result.split('/')[1];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          } else if (result.split('/').length === 1) {
            option.store_no = result.split('/')[0];
            option.share_type = 'bindOrganization';
            option.from = 'share';
          }
        }
      }
      this.checkOptionParams(option);
      if (option.invite_user_no) {
        this.invite_user_no = option.invite_user_no;
      }
      await this.toAddPage();
      if (option.pt_no) {
        this.pt_no = option.pt_no;
      }

      if (!option.store_no) {
        if (this.userInfo && this.userInfo.home_store_no) {
          option.store_no = this.userInfo.home_store_no;
        } else {}
      }

      if (option.store_no || option.storeNo) {
        this.storeNo = option.store_no || option.storeNo;
      } else {
        this.storeNo = 'S0000000000'
      }
      // if (this.hasNotRegInfo) {
      // 	return; //未授权
      // }
      if (option.room_no) {
        getApp().globalData.room_no = option.room_no;
        option.share_type = 'bindOrganization';
        option.invite_user_no = option.invite_user_no || option.inviter || '';
      }
      if ((option.share_type === 'bindOrganization' || option.share_type === 'bind') && option.store_no && option
        .invite_user_no && !this.hasNotRegInfo) {
        // 绑定诊所
        // 查找店铺用户列表
        this.storeNo = option.store_no;
        let StoreInfo = await this.selectStoreInfo();
        let storeUser = await this.getStoreUserInfo(option.store_no);
        if (Array.isArray(storeUser) && storeUser.length > 0) {
          // 店铺用户列表中已存在此用户
        } else {
          await this.bindStore(option.store_no, option.invite_user_no);
        }
      }
      if (option.pd_no) {
        //
        this.pdNo = option.pd_no;
        await this.getPageDefine(this.pdNo);
        // this.storeNo = this.pageDefine.store_no;
        await this.getTabbar(this.pdNo);
        await this.getPageComponent(this.pdNo);
      }
      this.initPage();

      if (option.cardNo && option.share_type === "shareCoupon") {
        // 点击赠送卡券的分享进入小程序
        this.getCouponInfo(option)
      }
    }
  };
</script>

<style lang="scss" scoped>
  .page-wrap {
    background-color: #f8f8fa;
    max-width: 960px;
    margin: 0 auto;
    // display: flex;
    // flex-wrap: wrap;
    height: auto;
    overflow: hidden;
    min-height: calc(100vh - var(--window-top));

    ::v-deep swiper.rectangle-dot {

      .wx-swiper-dot,
      .a-swiper-dot,
      .uni-swiper-dot {
        width: 30upx;
        background-color: #ffffff;
        opacity: 0.8;
        height: 10upx;
        border-radius: 0;
        margin: 0 !important;

        &+.wx-swiper-dot,
        &+.a-swiper-dot,
        &+.uni-swiper-dot {
          margin-left: 2rpx !important;
        }
      }
    }
  }

  ::v-deep .u-flex {
    display: flex;
    z-index: 100000;
  }


  ::v-deep .nav-bar {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    width: 100%;
    // background-color: #fff;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    .home-name {
      display: inline-block;
      width: calc(100% - 40rpx);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

  }
</style>
