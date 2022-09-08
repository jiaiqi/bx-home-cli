<template>
  <view :style="themeVariable" class="page-wrap" :class="['theme-' + theme]">
    <cu-custom-navbar :isBack="showBackPage" :pd-no="pdNo" :back-home="showBackHome&&!singleStore"
      :page-title="pageTitle">
        <view class="flex align-center justify-between home-name"  @click.stop="openSwitchHomePage">
          <text class="">
            <text>{{pageTitle||''}}</text>
            <text v-if="loadStatus==='loading'">
              <u-loading :show="true" mode="flower"></u-loading>
              <text class="text-gray text-sm margin-left-xs">加载中</text>
            </text>
          
            <!-- <text class="cuIcon-order margin-left-xs" v-if="loadStatus!=='loading'&&pageTitle"></text> -->
            <!-- <text class="cuIcon-unfold margin-left-xs" v-if="loadStatus!=='loading'&&pageTitle"></text> -->
          </text>
          <text v-if="!singleStore&&pageTitle" class="flex align-center">
            <text class="cuIcon-unfold margin-left-xs"></text>
          </text>
        </view>
    </cu-custom-navbar>
    <view class="">
      <view class="page-item-list" v-if="pageItemList&&pageItemList.length>0&&pageDefineList.length===0">
        <store-item v-for="pageItem in pageItemList" :key="pageItem.component_no" :pageItem="getConfig(pageItem)"
          :StoreInfo="StoreInfo" :userInfo="userInfo" :is-bind="isBind" :bindUserInfo="bindUserInfo" ref="storeItem"
          @toDoctorDetail="toDoctorDetail" :isManage="isManage" @bindStore="bindStore" @setHomePage="setHomePage"
          @getQrcode="getQrcode">
        </store-item>
      </view>
      <view class="page-item-list" v-for="(tab,index) in pageDefineList" v-show="currentTab===index">
        <view class="" v-if="tab&&tab.pageItemList">
          <store-item v-for="pageItem in tab.pageItemList" :key="pageItem.component_no" :pageItem="getConfig(pageItem)"
            :StoreInfo="StoreInfo" :userInfo="userInfo" :is-bind="isBind" :bindUserInfo="bindUserInfo" ref="storeItem"
            @toDoctorDetail="toDoctorDetail" :isManage="isManage" @bindStore="bindStore" @setHomePage="setHomePage"
            @getQrcode="getQrcode">
          </store-item>
          <view class="copyright-box">
            <view class="row">
              声明：图文信息均来源合作方，如有侵权请联系删除
            </view>
            <view class="row">
              由 <text style="color: #80afdd;text-decoration: underline;" class=" margin-right-xs margin-left-xs"
                @click="toHome">
                <text v-if="$api&&$api.miniProgramName">{{$api.miniProgramName}}</text>
                <text v-else> 百想首页</text>
              </text> 提供技术支持
            </view>
          </view>
        </view>
        <view class="cu-load load-modal" v-else-if="loadStatus==='loading'" @click.stop="">
          <text>加载中...</text>
        </view>
        <view class="data-empty" style="width: 100vw;height: 60vh;line-height: 60vh;text-align: center;color: #999;"
          v-else-if="loadStatus==='noMore'">
          页面内容为空
        </view>
      </view>
    </view>

    <u-tabbar :value="currentTab" :list="tabbarList" :border-top="false"
      :bg-color="themeConfig&&themeConfig.style_bg_color?themeConfig.style_bg_color:'#fff'" :inactive-color="labelColor"
      :active-color="activeColor" :mid-button="false" v-if="pageDefine && tabbarList && tabbarList.length > 0"
      :before-switch="beforeSwitch" @change="changeTab">
    </u-tabbar>
    <starGuide></starGuide>
    <view class="shadow-view" @click="clickShadow" v-if="notNickName"></view>
    <bx-auth @auth-complete="initPage" ref="bxAuth" :allowCancel="true" @cancel="cancelAuth"></bx-auth>
  </view>

</template>

<script>
  import {
    mapState
  } from 'vuex';
  import {
    selectPersonInfo
  } from '@/common/api/login.js'
  import StoreItem from './store-item/store-item.vue';
  import starGuide from './star-guide/star-guide.vue'
  var socketOpen = false;
  var socketMsgQueue = [];
  var socketIsLogin = false;
  var socketTask = null;
  export default {
    components: {
      StoreItem,
      starGuide
    },
    data() {
      return {
        pdNo: '', // 页面定义编号
        tabbarList: [],
        pageDefine: {},
        pageDefineList: [],
        unread_num: 0,
        networkErrTimes: 0,
        showHomeBtn: true,
        client_env: uni.getStorageSync('client_env'),
        isBind: true, //当前用户是否绑定此诊所
        bindUserInfo: {},
        storeNo: '',
        StoreInfo: {},
        pageItemList: [],
        manageButtonGroup: [],
        globalData: {},
        pt_no: '', // 二维码参数编号
        ptInfo: null,
        rowData: {},
        invite_user_no: '',
        loadStatus: 'more',
      };
    },
    computed: {
      notNickName() {
        return (!this.userInfo?.nick_name || this.userInfo?.nick_name === '微信用户') && !this.userInfo?.profile_url
      },
      pageTitle() {
        return this.currentPageDefine?.pg_title || this.StoreInfo?.name
      },
      isManage() {
        return Array.isArray(this.manageButtonGroup) && this.manageButtonGroup.length > 0
      },
      themeVariable() {
        let config = this.themeConfig
        return `--home-bg:${config?.style_bg||''};--home-bg-color:${config?.style_bg_color||'#f8f8f8'};--home-text-color:${config?.style_font_color||'#333'};--home-text-size:${config?.style_font_size||'14'}px;`
      },
      singleStore() {
        return this.$api.singleStore && this.$api.storeNo
      },

      labelColor() {
        return this.pageDefine?.label_color || '#888'
      },
      activeColor() {
        return this.pageDefine?.label_active_color || this.themeConfig?.style_font_color || '#000'
      },
      currentTab() {
        if (Array.isArray(this.tabbarList) && this.tabbarList.length > 0) {
          return this.tabbarList.findIndex(item => item.link_pd_no === this.pdNo);
        }
      },
      currentPageDefine() {
        if (this.currentTab !== -1 && this.pageDefineList.length > 0 && this.pageDefineList[this.currentTab]) {
          return this.pageDefineList[this.currentTab]
        }
      },
      showBackPage() {
        // 是否显示返回按钮
        return getCurrentPages().length > 1 || this.showBackHome
      },
      showBackHome() {
        if (this.storeNo === "S0000000000") {
          return false
        }
        let status = this.StoreInfo?.audit_status;
        if (status) {
          if (['非公开', '仅本店', '双向隔离'].includes(status)) {
            return false;
          }
          return true;
        }
      },
      ...mapState({
        theme: state => state.app.theme,
        // userInfo: state => state.user.userInfo,
        // subscsribeStatus: state => state.app.subscsribeStatus, //是否关注公众号
        // hasNotRegInfo: state => state.app.hasNotRegInfo //授权访问用户信息
      })
    },
    methods: {
      showAuthDialog() {
        // 显示授权弹框
        this.$refs?.bxAuth?.open?.()
      },
      cancelAuth() {
        // this.$refs?.bxAuth?.cancel?.()
      },
      clickShadow() {
        this.showAuthDialog()
        // uni.showModal({
        //   title:'提示',
        //   content:'请先授权访问您的头像昵称信息，再进行其他操作',
        //   // showCancel:false,
        //   success: (res) => {
        //     if(res.confirm){
        //       this.showAuthDialog()
        //     }
        //   }
        // })
      },
      toHome() {
        //#ifdef MP-WEIXIN
        if (this.$api?.env === 'custom') {
          uni.navigateToMiniProgram({
            appId: 'wxa3c50c8177ef6739',
            path: 'storePages/home/home?store_no=S0000000000',
            extraData: {
              'from': {
                miniProgramName: this.$api?.miniProgramName,
                storeNo: this.$api?.storeNo
              }
            },
            success(res) {
              // 打开成功
            }
          })
          return
        }
        //#endif

        uni.navigateTo({
          url: '/storePages/home/home?store_no=S0000000000'
        })
      },
      handlerSwitch(curTab) {
        let data = {
          ...this.globalVariable
        };
        try {
          // data.storeUser = this.vstoreUser
          curTab.link_pd_json = this.renderStr(curTab.link_pd_json, data);
          let jsonStr = JSON.parse(curTab.link_pd_json);
          if (jsonStr.url) {
            if (jsonStr.appid) {
              // 跳转到小程序
              uni.navigateToMiniProgram({
                appId: jsonStr.appid,
                path: jsonStr.url
              });
            } else {
              uni.navigateTo({
                url: jsonStr.url
              });
            }
          }
        } catch (err) {
          console.log(err);
        }
      },
      beforeSwitch(index) {
        let curTab = this.tabbarList[index];
        if (index !== this.pageDefine.active_nav_index) {
          if (!curTab?.link_pd_no) {
            if (curTab.link_pd_json) {
              this.handlerSwitch(curTab)
            }
            return false;
          }
        }
        return true;
      },
      async changeTab(index) {
        let curTab = this.tabbarList[index];
        if (index > 0) {
          if ((!this.userInfo?.nick_name || this.userInfo?.nick_name == '微信用户')) {
            this.showAuthDialog()
            return
          }
        }
        if (curTab?.link_pd_no) {
          this.pageItemList = []
          this.pdNo = curTab?.link_pd_no;
          await this.initPage();
        } else if (curTab?.link_pd_json) {
          this.handlerSwitch(curTab)
        }
        uni.$emit('on-nav-click')
      },
      getQrcode(e) {
        this.StoreInfo.store_qr_code = e;
        this.$store.commit('setStateAttr', {
          key: 'storeInfo',
          val: this.StoreInfo
        });
      },
      joinStore() {
        // 加入店铺 店铺用户状态改为正常
        let data = {
          member_status: '正常'
        };
        this.updateStoreUser(data, true);
      },
      // async updateStoreUser(data, showToast) {
      //   let req = [{
      //     serviceName: 'srvhealth_store_user_update',
      //     condition: [{
      //       colName: 'id',
      //       ruleType: 'eq',
      //       value: this.bindUserInfo?.id
      //     }],
      //     data: [data]
      //   }];
      //   let res = await this.$fetch('operate', 'srvhealth_store_user_update', req, 'health');
      //   this.hideModal();
      //   if (res.success) {
      //     if (showToast) {
      //       uni.showToast({
      //         title: '操作成功'
      //       });
      //     }
      //     this.selectBindUser(true);
      //   }
      // },

      openSwitchHomePage() {
        if (this.singleStore) {
          return
        }
        let cond = [{
            colName: 'person_no',
            ruleType: 'eq',
            value: this.userInfo?.no
          },
          {
            colName: 'member_status',
            ruleType: 'in',
            value: '正常'
          },
          // {
          //   colName: 'store_online_status',
          //   ruleType: 'ne',
          //   value: '下线'
          // }
        ];
        // '非公开', '仅本店', '双向隔离'
        if (this.userInfo?.userno) {
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
                width: '50px',
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
					)}&navType=redirectTo&customDetailUrl=${encodeURIComponent('/storePages/home/home?store_no=${data.store_no}')}&detailType=custom`;
          uni.navigateTo({
            url
          });
        }
      },
      getConfig(pageItem) {
        if (pageItem && pageItem.type) {
          let type = pageItem.type;
          let keys = Object.keys(pageItem);
          let config = {};
          if (Array.isArray(keys) && keys.length > 0) {
            keys.forEach(key => {
              if (key === 'more_config' && pageItem[key] && typeof pageItem[key] === 'string') {
                try {
                  pageItem[key] = JSON.parse(pageItem[key]);
                } catch (e) {
                  //TODO handle the exception
                }
              }
              config[key] = pageItem[key];
            });
            config.type = pageItem['type'];
            return config;
          }
        }
      },
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
        this.loadStatus = 'loading'
        let res = await this.$fetch('select', 'srvhealth_store_home_component_user_select', req, 'health');
        this.loadStatus = ''
        if (res.success) {
          if (res.data.length === 0) {
            this.loadStatus = 'noMore'
          }
          let setFirstSwiper = false;
          this.pageItemList = []
          let pageItemList = res.data.filter(item => item.display !== '否' && item.button_usage !== '管理人员')
            .map(item => {
              try {
                if (item.more_config && typeof item.more_config === 'string') {
                  item.more_config = JSON.parse(item.more_config)
                }
              } catch (e) {
                //TODO handle the exception
              }
              if (!setFirstSwiper && item.type === '轮播图') {
                item.isFirstSwiper = true;
                setFirstSwiper = true;
              }
              // this.pageItemList.push(item)
              return item;
            });
          this.pageItemList = pageItemList
          this.manageButtonGroup = res.data.filter(item => item.display !== '否' && item.button_usage == '管理人员')
          await this.getComponentData();
          return pageItemList
        }
      },
      async getComponentData() {
        const storeNo = this.storeNo;
        let req = [];
        const pageItemList = this.pageItemList.filter(item => ['按钮组', '人员列表', '通知横幅', '关联店铺'].includes(
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
                order: [{
                  colName: "seq",
                  orderType: "asc"
                }],
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
              // reqBody = {
              // 	serviceName: 'srvhealth_store_goods_guest_select',
              // 	colNames: ['*'],
              // 	condition: [{
              // 		colName: 'store_no',
              // 		ruleType: 'eq',
              // 		value: storeNo
              // 	}]
              // };
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
                  },
                  {
                    colName: 'notice_display',
                    ruleType: 'eq',
                    value: '发布'
                  }
                ],
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

            if (dataArray && dataArray[index]?.data) {
              dataArray[index] = dataArray[index]?.data;
            }

            switch (element.type) {
              case '关联店铺':
                element['listdata'] = dataArray[index] || [];
                break;
              case '按钮组':
                if (Array.isArray(dataArray[index])) {
                  element['listdata'] = dataArray[index].filter(item => item.display !== '否' && item
                    .display !== '隐藏');
                }
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
                if (dataArray[index] && Array.isArray(dataArray[index])) {
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
                  })
                }

                break;
            }
            //  [ '按钮组', '人员列表', '商品列表', '通知横幅' ]
          }
          this.pageItemList = this.pageItemList.map(item => {
            let obj = pageItemList.find(a => a.component_no === item.component_no);
            if (obj) {
              item.listdata = obj.listdata
              this.$set(item, 'listdata', obj.listdata);
            }
            return item;
          });
          uni.$emit('updateStoreItemData');
        }
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
        if (this.storeNo && this.vstoreUser?.store_no === this.storeNo) {
          this.bindUserInfo = this.vstoreUser;
          return this.vstoreUser
        }
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
            // let invite_user_no = this.invite_user_no || this.inviterInfo?.invite_user_no || this.userInfo
            //   ?.invite_user_no;
            // if (invite_user_no && invite_user_no !== this.userInfo?.userno && !updated) {
            // if (this.StoreInfo?.standard == '更新') {
            //   // if (!this.bindUserInfo.invite_store_user_no||this.StoreInfo?.standard !== '不更新') {
            //   // 更新店铺用户的邀请人编码
            //   let data = {
            //     invite_user_no: invite_user_no
            //   };
            //   let inviterStoreUser = await this.getInviteStoreUser(invite_user_no);
            //   if (inviterStoreUser && inviterStoreUser.store_user_no && inviterStoreUser
            //     .store_user_no !== this
            //     .bindUserInfo?.store_user_no) {
            //     data.invite_store_user_no = inviterStoreUser.store_user_no;
            //   }
            //   this.updateStoreUser(data);
            // }
            // }
            this.$store.commit('SET_STORE_USER', this.bindUserInfo);
          } else {
            this.isBind = false;
          }
        } else {
          this.isBind = false;
        }
      },
      // async getInviteStoreUser(user_no) {
      //   let url = this.getServiceUrl('health', 'srvhealth_store_user_share_select', 'select');
      //   let req = {
      //     colNames: ['*'],
      //     serviceName: 'srvhealth_store_user_share_select',
      //     condition: [{
      //         colName: 'user_account',
      //         ruleType: 'eq',
      //         value: user_no
      //       },
      //       {
      //         colName: 'store_no',
      //         ruleType: 'eq',
      //         value: this.StoreInfo.store_no
      //       }
      //     ],
      //     page: {
      //       rownumber: 1
      //     }
      //   };
      //   if (!user_no) {
      //     return;
      //   }
      //   let res = await this.$http.post(url, req);
      //   if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
      //     return res.data.data[0];
      //   }
      // },
      async getThemeCfg(no) {
        // 查找店铺主题配置
        if (!no || typeof no !== 'string') {
          return
        }
        let req = {
          "serviceName": "srvhealth_store_template_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'style_no',
            ruleType: 'eq',
            value: no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', 'srvhealth_store_template_select', req, 'health');
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.$store.commit('SET_THEME_CFG', res.data[0])
        }
      },
      async selectStoreInfo(times = 0, forceUpdate = false) {
        // forceUpdate,是否强制更新店铺组件
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
        serviceName = 'srvhealth_store_cus_niming_detail_select'
        let res = null;
        if (forceUpdate || this.storeNo !== this.StoreInfo?.store_no) {
          await this.setSessionInfo(this.storeNo)
          res = await this.$fetch('select', serviceName, req, 'health')
        } else {
          res = {
            data: [this.StoreInfo]
          }
        }
        if (Array.isArray(res.data) && res.data.length > 0) {
          if (res?.data[0]?.audit_status == '禁用') {
            uni.showModal({
              title: '提示',
              content: '该店铺已下架',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  uni.reLaunch({
                    url: '/storePages/home/home?store_no=S0000000000'
                  })
                }
              }
            })
            return
          }
          this.$store.commit('setStateAttr', {
            key: 'storeInfo',
            val: res.data[0]
          });
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

          this.$store.commit('setStateAttr', {
            key: 'theme',
            val: theme
          });
          this.StoreInfo = res.data[0];
          if (this.StoreInfo?.style_no) {
            this.getThemeCfg(this.StoreInfo?.style_no)
          } else {
            this.$store.commit('SET_THEME_CFG', null)
          }
          let res1 = await this.getStoreUserInfo()
          if (Array.isArray(res1) && res1.length >= 1) {
            // 店铺用户列表中已存在此用户
          } else {
            // 当前用户不在此诊所中 则添加当前用户到此诊所中
            await this.bindStore();
          }
          if (this.StoreInfo.home_page_no && (!this.pdNo)) {
            if (!this.pdNo) {
              this.pdNo = this.StoreInfo.home_page_no;
            }
            await this.getPageDefine(this.StoreInfo.home_page_no);
          }
        } else {
          if (res && res.code === '0011') {
            await this.toAddPage();
            times++;
            if (times < 3) {
              this.selectStoreInfo(times, forceUpdate);
            }
          } else {
            uni.showModal({
              title: '未查找到机构信息',
              content: `该店铺已关闭,即将跳转到首页`,
              // content: `${res ? JSON.stringify(res) : ''}  storeNo为${this.storeNo}`,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  uni.reLaunch({
                    url: '/storePages/home/home'
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

        if (this.bindUserInfo?.member_status === '退出') {
          this.joinStore();
          return;
        }
        if (!this.userInfo?.no) {
          return
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
      async getStoreUserInfo(forceUpdate) {
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
              value: this.storeNo
            }
          ]
        };
        if (!forceUpdate && this.vstoreUser?.store_no === this.storeNo) {
          this.bindUserInfo = this.vstoreUser
          return [this.vstoreUser]
        }
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
        let self = this
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
      async initPage(forceUpdate = false) {
        // forceUpdate - 是否强制更新店铺组件
        // await this.toAddPage();
        await selectPersonInfo(null, true)
        // #ifdef MP-WEIXIN
        await this.initApp()
        //#endif
        this.pageItemList = false
        if (!this.isAttention) {
          // 检测是否已关注公众号
          this.checkSubscribeStatus();
        }
        if (this.storeNo) {
          await this.selectStoreInfo(null, forceUpdate);
          if (!this.vstoreUser?.id) {
            await this.bindStore();
          }
          if (forceUpdate) {
            await this.getStoreUserInfo(forceUpdate)
          }
          if (!this.pageItemList || (Array.isArray(this.pageItemList) && this.pageItemList.length == 0)) {
            if (!this.pdNo) {
              await this.getPageItem();
            } else {
              console.log(this.pdNo)
              await this.getPageDefine(this.pdNo, forceUpdate);
            }
          }

          await this.getQuery();
          this.initSocket()
          if (this.bindUserInfo?.store_user_no) {
            if (forceUpdate || (!this.vvipCard?.card_no || this.vvipCard?.useing_store_user_no !== this.vstoreUser
                ?.store_user_no))
              await this.getVipCard(this.bindUserInfo?.store_user_no)
          }
        }
      },
      async getPageDefine(home_page_no, forceUpdate = false) {
        if (Array.isArray(this.pageDefineList) && this.pageDefineList.length > 0 && this.currentTab !== -1 && this
          .pageDefineList[this.currentTab]?.id && forceUpdate !== true) {
          return
        }
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
          console.log(this.pdNo, home_page_no)

          await this.getTabbar(home_page_no);
          let pageItemList = await this.getPageComponent(home_page_no, 'srvhealth_store_home_ceshi_component_select');
          let curTab = this.tabbarList.findIndex(item => item.link_pd_no === home_page_no);
          if (curTab > -1) {
            let data = res.data.data[0]
            data.pageItemList = pageItemList
            this.$set(this.pageDefineList, curTab, res.data.data[0])
          }
        }
      },
      async getPageComponent(home_page_no, service = 'srvhealth_store_home_component_user_select') {
        let url = this.getServiceUrl('health', service, 'select');
        let req = {
          serviceName: service,
          colNames: ['*'],
          condition: [{
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo?.store_no
          }, {
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
        if (service === 'srvhealth_store_home_ceshi_component_select') {
          req.condition.push({
            colName: 'user_no',
            ruleType: 'eq',
            value: this.userInfo.userno
          })
        }
        this.loadStatus = 'loading'
        let res = await this.$http.post(url, req);
        this.loadStatus = ''
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          res.data.data = res.data.data.reduce((res, cur) => {
            if (!res.find(item => item.id === cur.id)) {
              res.push(cur)
            }
            return res
          }, [])
          let setFirstSwiper = false;
          let pageItemList = res.data.data
            .filter(item => item.display !== '否' && item.button_usage !== '管理人员')
            .map(item => {
              if (!setFirstSwiper && item.type === '轮播图') {
                item.isFirstSwiper = true;
                setFirstSwiper = true;
              }
              return item;
            });
          this.manageButtonGroup = res.data.data.filter(item => item.display !== '否' && item.button_usage == '管理人员')
          this.pageItemList = pageItemList
          await this.getComponentData();
          return pageItemList
        } else {
          this.loadStatus = 'noMore'
          this.pageItemList = []
        }
      },
      async getTabbar(home_page_no) {
        if (Array.isArray(this.tabbarList) && this.tabbarList.length > 0 && this.tabbarList.find(item => item
            .store_no === this.storeNo)) {
          return
        }
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
            },
            {
              colName: 'disp_flag',
              ruleType: 'eq',
              value: '是'
            }
          ],
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
              // item.iconPath = this.getImagePath(item.nav_icon, true);
              item.iconPath = this.getImagePath(item.nav_icon, true);
              // #ifdef MP-WEIXIN
              const iconPath = this.getImagePath(item.nav_icon, true);
              this.url2Base64(iconPath).then(res => {
                if (res) {
                  item.iconPath = res
                }
              })
              // #endif

            }
            if (item.nav_icon_selected) {
              item.selectedIconPath = this.getImagePath(item.nav_icon_selected, true);
              // #ifdef MP-WEIXIN
              const selectedIconPath = this.getImagePath(item.nav_icon_selected, true);
              this.url2Base64(selectedIconPath).then(res => {
                if (res) {
                  item.selectedIconPath = res
                }
              })
              // #endif
            }
            return item;
          });
          this.pageDefineList = new Array(res.data.data.length)
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
    async onPullDownRefresh() {
      const forceUpdate = true
      await this.initPage(forceUpdate);
      if (this.pageDefine && this.tabbarList && this.tabbarList.length > 0) {
        this.changeTab(this.currentTab)
      }
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
    },
    async onShow() {
      let globalData = getApp().globalData;
      this.globalData = globalData;
      if (!this.isAttention) {
        // 检测是否已关注公众号
        this.checkSubscribeStatus();
      }
      // if (this.storeInfo?.store_no && this.storeNo && this.storeInfo?.store_no !== this.storeNo) {
      //   this.initPage()
      // }
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
      if (this.StoreInfo?.wx_share_img) {
        imageUrl = this.getImagePath(this.StoreInfo.wx_share_img, true);
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
    onReachBottom() {
      this.$refs?.storeItem.forEach(item => {
        if (item.pageItem?.type === '通用列表') {
          item?.listLoadMore?.()
        }
      })
    },
    onPageScroll() {
      // this.$u.getRect('#goods-list-wrap').then(rect => {
      //   if (rect?.top && rect.top < 50) {
      //     if (rect?.top + rect.height < 50) {
      //       uni.$emit('fold-bottom-cart', true)
      //     } else {
      //       uni.$emit('fold-bottom-cart', false)
      //     }
      //   } else {
      //     uni.$emit('fold-bottom-cart', true)
      //   }
      // })
    },
    async onLoad(option) {
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      if (option.service_place_no) {
        getApp().globalData.service_place_no = option.service_place_no;
        let placeInfo = await this.getPlaceInfo(option.service_place_no)
        if (placeInfo) {
          getApp().globalData.placeInfo = placeInfo
        }
      }
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
      // wx.showShareMenu({
      //   withShareTicket: true,
      //   menus: ['shareAppMessage']
      // });
      // #endif
      uni.$on('updateStoreSessionLastLookTime', e => {
        this.selectBindUser();
        // this.selectUnreadAmount()
      });

      uni.$on('updateUnread', e => {
        // this.initPage()
        // 已读状态更新
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
          if (arr.length > 0 && arr[0] === 'food') {
            //扫码点餐
            // /store_no/food/餐桌号/
            option.store_no = arr[1];
            option.service_place_no = arr[2]
            if (arr[3]) {
              option.link_pd_no = arr[3]
            }
          } else if (arr.length == 3) {
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

      if (option.service_place_no) {
        getApp().globalData.service_place_no = option.service_place_no;
      }
      if (option.invite_user_no) {
        this.invite_user_no = option.invite_user_no;
      }

      // await this.toAddPage();

      if (option.pt_no) {
        this.pt_no = option.pt_no;
      }

      if (option.link_pd_no) {
        this.pdNo = option.link_pd_no
      }

      if (!option.store_no) {
        if (this.$api && this.$api.singleStore && this.$api.storeNo) {
          option.store_no = this.$api.storeNo
        } else if (this.userInfo && this.userInfo.home_store_no) {

          option.store_no = this.userInfo.home_store_no;
          this.$store.commit('setStateAttr', {
            key: "curStoreNo",
            val: option.store_no
          })
        } else {}
      }

      if (option.store_no || option.storeNo) {
        this.storeNo = option.store_no || option.storeNo;
      } else {
        console.log(this.$api, this.$api.storeNo)
        this.storeNo = this.$api.storeNo
      }

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
        let storeUser = await this.getStoreUserInfo();
        if (Array.isArray(storeUser) && storeUser.length > 0) {
          // 店铺用户列表中已存在此用户
        } else {
          await this.bindStore(option.store_no, option.invite_user_no);
        }
      }

      if (option.pd_no) {
        this.pdNo = option.pd_no;
      }

      await this.initPage();

      if (option.cardNo && option.share_type === "shareCoupon") {
        // 点击赠送卡券的分享进入小程序
        this.getCouponInfo(option)
      }
    }
  };
</script>

<style lang="scss" scoped>
  .shadow-view {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    background: transparent;
  }

  .page-wrap {
    background-color: #f8f8fa;
    background-color: var(--home-bg-color);
    background: var(--home-bg);
    color: var(--home-text-color);
    font-size: var(--home-text-size);
    max-width: 960px;
    margin: 0 auto;
    // display: flex;
    // flex-wrap: wrap;
    height: auto;
    overflow: hidden;
    min-height: calc(100vh - var(--window-top));

    .page-item-list {
      min-height: calc(100vh - 45px - 50px - 100px);
      overflow: auto;
      // display: flex;
      // flex-direction: column;
    }

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

  ::v-deep .cu-bar {
    background-color: var(--home-bg-color) !important;
    color: var(--home-text-color) !important;
    font-size: var(--home-text-size);
  }

  // ::v-deep .nav-bar {
  //   display: flex;
  //   align-items: center;
  //   padding: 10rpx 20rpx;
  //   width: 100%;
  //   // background-color: #fff;
  //   overflow: hidden;
  //   white-space: nowrap;
  //   text-overflow: ellipsis;

    .home-name {
      // width: calc(100% - 40rpx);
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

  // }

  .copyright-box {
    padding: 20px;
    text-align: center;

    .row {
      min-width: 600rpx;
      margin: 0 auto;
      font-size: 12px;
      font-family: 苹方-简;
      font-weight: normal;
      line-height: 22px;
      color: #D8D9DF;
      opacity: 1;
      margin-bottom: 5px;
    }
  }

  .cu-load.load-modal {
    color: #999;
    background-color: transparent;
    box-shadow: 0 0 0px 1000px rgba($color: #fff, $alpha: 0.1);

    &::after {
      border-left: 3px solid #fff;
      background-color: transparent;
    }

  }
</style>
