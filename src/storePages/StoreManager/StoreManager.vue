<template>
  <view class="page-bg" :class="'bx-bg-'+theme">
    <view class="page-wrap">
      <view class="head">
        <view class="store-name">
          <view class="name" @click="toStoreDetail">
            {{storeInfo.name||''}}
          </view>
          <view class="phone" :class="'bx-bg-'+theme" @click.stop="makePhoneCall">
            <u-icon name="phone-fill"></u-icon>
          </view>
        </view>
        <view class="store-info" v-if="storeInfo.address">
          <image :src="getImagePath(storeInfo.image)" class="logo" @click="toStoreDetail">
          </image>
          <view class="store-address">
            <view class="address" @click="openLocation">
              <text class="location cuIcon-locationfill margin-left-xs"></text>
              {{ storeInfo.address }}
            </view>
          </view>
        </view>

      </view>
      <view class="statis-box" v-if="statisConfig&&statisConfig.labels&&storeInfo" @click="toDashboard">
        <view class="statis-item" v-for="item in statisConfig.labels">
          <view class="item-label" v-if="statisConfig.labelPosition==='top'">
            {{item.label||'0'}}
          </view>
          <view class="item-value">
            {{storeInfo[item.col]||'0'}}
          </view>
          <view class="item-label" v-if="statisConfig.labelPosition!=='top'">
            {{item.label||'0'}}
          </view>
        </view>
      </view>
      <view class="manager-view">
        <view class="text-bold title" v-if="storeInfo.mgmt_button_type === '固定'||storeInfo.mgmt_button_type === '自动'">
          <text class="margin-right">{{ buttonTitle || "管理" }}</text>
          <!-- 		<text class="cuIcon-title text-orange margin-right">未回复</text>
					<text class="cuIcon-title text-red">未读</text>-->
          <view class="buttons">
            <button class="cu-btn round" @tap="toDetail(storeInfo)"><text class="cuIcon-settingsfill"
                :class="'bx-text-'+theme"></text>设置</button>
          </view>
        </view>
        <view class="manager-box" v-if="storeInfo.mgmt_button_type === '固定'">
          <view class="box-item" v-for="item in list" @click="clickGrid(item)">
            <view class="cu-tag amount bg-blue round light" v-if="storeInfo[item.type]">
              {{ storeInfo[item.type] | overDisplay }}
            </view>
            <view class="box-item-content">
              <text class="cu-tag badge-null" v-if="item.num===true"></text>
              <text class="cu-tag badge" v-else-if="item.num">{{ item.num }}</text>
              <text class="cu-tag badge-left" v-if="item.unback">{{
		            item.unback
		          }}</text>
              <text class="icon" :class="[
		              'cuIcon-' + item.icon,
		              item.color ? 'text-' + item.color : '',
		            ]"></text>
              <view class="label">{{ item.label }}</view>
            </view>
          </view>
        </view>

        <view class="manager-box" v-if="storeInfo.mgmt_button_type === '自动'">
          <view class="cu-bar justify-center bg-white">
            <view class="action sub-title">
              <text class="text-xl text-bold text-green">店铺子表</text>
              <text class="bg-green" style="width: 2rem"></text>
              <!-- last-child选择器-->
            </view>
          </view>
          <view class="box-item" v-for="item in childTable" @click="toChildService(item)">
            <view class="cu-tag amount bg-blue round light" v-if="item.total">
              {{ item.total || 0 }}
            </view>
            <view class="box-item-content">
              <view class="label-icon shadow-blur bg-blue light" v-if="item.label">
                <view class="text" v-for="text in item.label.slice(0, 4).split('')">
                  {{ text }}
                </view>
              </view>
              <view class="label">
                {{ item.label }}
              </view>
            </view>
          </view>
        </view>


        <view class="" v-show="manageGroup" v-for="(manage,mIndex) in manageGroup">
          <view class="text-bold title">
            <text class="margin-right">{{ manage.component_label || "管理" }}</text>
            <view class="buttons" v-if="mIndex===0">
              <button class="cu-btn round" @tap="toDetail(storeInfo)"><text
               :class="'bx-text-'+theme"
                  class="cuIcon-settingsfill"></text>设置</button>
            </view>
          </view>
          <view class="manager-box">
            <view class="box-item" v-for="item in manage.buttonGroup" @click="clickButton(item)">
              <view class="cu-tag amount bg-blue round light" v-if="item.num && item.label === '用户列表'">
                {{ item.num || 0 }}
              </view>
              <view class="box-item-content">
                <text class="cu-tag breathe" v-if="item.num == true"></text>
                <text class="cu-tag badge" v-else-if="item.num && item.label !== '用户列表'">{{ item.num }}</text>
                <text class="cu-tag badge-left" v-if="item.unback">{{
                  item.unback
                }}</text>
                <text class="cu-tag badge" v-if="item.unread">{{
                  item.unread
                }}</text>
                <image :src="item.iconPath" class="icon" mode="aspectFit" v-if="item.iconPath"></image>
                <text class="icon" v-else-if="item.icon && item.color" :class="[
                    'cuIcon-' + item.icon,
                    item.color ? 'text-' + item.color : '',
                  ]"></text>
                <view class="label">{{ item.label }}</view>
              </view>
            </view>
          </view>
        </view>


      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        storeInfo: {},
        modalName: '',
        storeNo: '',
        gridList: [{
            label: '店铺商品',
            icon: 'goods',
            color: 'orange',
            type: 'goods_count'
          },
          {
            label: '店铺订单',
            icon: 'punch',
            color: 'yellow',
            type: 'order_count'
          },
          {
            label: '就诊列表',
            icon: 'peoplelist',
            color: 'cyan',
            type: 'see_doctor_count'
          },
          {
            label: '方案列表',
            icon: 'calendar',
            color: 'blue',
            type: 'paln_count'
          },
          {
            label: '排班列表',
            icon: 'sort',
            color: 'cyan',
            type: 'schedule_count'
          },
          {
            label: '用户列表',
            icon: 'addressbook',
            color: 'green',
            type: 'user_count'
          },
          {
            label: '员工列表',
            icon: 'addressbook',
            color: 'yellow',
            type: 'staff_count'
          },
          {
            label: '用户咨询记录',
            icon: 'message',
            color: 'red',
            type: 'message',
            num: 0
          },
          {
            label: '疫苗库存',
            icon: 'list',
            color: 'green',
            type: 'vaccine_stocks'
          },
          {
            label: '可预约列表',
            icon: 'list',
            color: 'blue',
            type: 'vaccination_appointment'
          },
          {
            label: '排队管理',
            icon: 'friend',
            color: 'blue',
            type: 'queueManage'
          },
          {
            label: '操作手册',
            icon: 'creative',
            color: 'yellow',
            type: 'manual'
          },
          // {
          // 	label: '店铺设置',
          // 	icon: 'settings',
          // 	color: 'blue',
          // 	type: 'setting'
          // }
        ],
        sessionList: [],
        buttonGroup: [],
        manageGroup: [],
        unreadNum: 0,
        unreadNumber: 0,
        websiteDetail: {}, //店铺关联站点信息
        websiteColumn: [], //站点栏目
        childTable: [], // 子表列表
        colV2Data: {},
        buttonTitle: "",
        displayColumn: "",
        noticeNum: {}
      };
    },
    filters: {
      overDisplay: function(value) {
        return value;
        // return value < 999 ? value : '99+';
      }
    },
    computed: {
      theme() {
        let theme = this.$store?.state?.app?.theme
        return theme
      },
      userInfo() {
        return this.$store?.state?.user?.userInfo
      },
      bindUserInfo() {
        return this.$store?.state?.user?.storeUserInfo
      },
      statisConfig() {
        // 统计字段配置
        let config = this.storeInfo?.moreConfig?.statis
        if (config) {
          const column = config?.column
          const label = config?.label
          if (Array.isArray(label) && label.length > 0 && Array.isArray(column) && column.length > 0 && column
            .length === label.length) {
            let arr = config.label.map((item, index) => {
              const obj = {
                label: item,
                col: column[index]
              }
              return obj
            })
            return {
              labels: arr,
              link: config.link,
              labelPosition: config.labelPosition
            }
          }
        }
      },
      list() {
        return this.gridList.map(item => {
          if (item.type === 'message') {
            item.num = this.unreadNum
            item.unback = this.unreadNumber
          }
          return item
        })
      }
    },
    methods: {
      toDashboard() {
        uni.navigateTo({
          url: '/otherPages/dashboard/dashboard'
        })
      },
      getChildServiceList() {
        // 查找子表列表数量
        let formData = this.storeInfo;
        let req = [];
        let url = this.getServiceUrl('health', 'select', 'multi');
        if (this.childTable.length > 0) {
          req = this.childTable.filter(item => item?.foreign_key?.foreign_key_type === "字段引用").map(item => {
            let obj = {
              colNames: ['*'],
              condition: [{
                colName: item.foreign_key.column_name,
                ruleType: 'eq',
                value: formData[item.foreign_key.referenced_column_name]
              }],
              serviceName: item.service_name,
              page: {
                pageNo: 1,
                rownumber: 1
              }
            };
            return obj;
          });
          this.$http.post(url, req).then(res => {
            this.childTable = this.childTable.map((item, index) => {
              if (Array.isArray(res.data.data) && res.data.data.length > 0) {
                res.data.data.forEach((data, dIndex) => {
                  if (index === dIndex) {
                    if (data.page) {
                      item.total = data.page.total;
                    } else {
                      item.total = 0;
                    }
                    this.$set(item, 'total', data.page.total);
                  }
                });
              }
              return item;
            });
          });
        }
      },
      toChildService(e) {
        // 跳转到子表列表
        let data = this.deepClone(e);
        let formData = this.storeInfo;
        let condition = [{
          colName: e.foreign_key.column_name,
          ruleType: 'eq',
          value: formData[e.foreign_key.referenced_column_name]
        }];
        if (e.foreign_key && e.foreign_key.referenced_column_name && formData[e.foreign_key
            .referenced_column_name]) {
          if (e.foreign_key.more_config && e.foreign_key.more_config.targetType) {
            let targetType = e.foreign_key.more_config.targetType;
            if (targetType === 'list') {
              uni.navigateTo({
                url: '/publicPages/list/list?pageType=list&serviceName=' + e.service_name +
                  '&cond=' + JSON.stringify(condition)
              });
            } else if (targetType === 'detail') {
              if (e.childData && e.childData.data && e.childData.data.length > 0) {
                let fieldsCond = [];
                if (e.foreign_key && e.foreign_key.referenced_column_name && e.foreign_key.column_name) {
                  fieldsCond.push({
                    column: id,
                    value: e.childData.data[0].id,
                    display: false
                  });
                }
                let url =
                  `/publicPages/form/form?type=update&serviceName=${e.service_name}&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`;
                uni.navigateTo({
                  url: url
                });
              } else {
                uni.showModal({
                  title: '提示',
                  content: '暂无数据，是否添加数据',
                  success(res) {
                    if (res.confirm) {
                      // referenced_column_name //被引用的字段
                      // column //子表字段
                      let fieldsCond = [];
                      if (e.foreign_key && e.foreign_key.referenced_column_name && e
                        .foreign_key.column_name) {
                        fieldsCond.push({
                          column: e.foreign_key.referenced_column_name,
                          value: formData[e.foreign_key.column_name]
                        });
                      }
                      let url = `/publicPages/form/form?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${encodeURIComponent(
                      JSON.stringify(fieldsCond)
                    )}`;
                      uni.navigateTo({
                        url: url
                      });
                    }
                  }
                });
              }
            }
          } else {
            let viewTemp = {};
            let label = []
            let foreign_key = e.foreign_key || {}

            if (e.service_name === 'srvhealth_plan_schedule_select') {
              // 方案计划
              viewTemp = {
                title: 'ds_name',
                tip: 'play_srv',
                footer: 'start_date'
              };
            }
            if (e.service_name === 'srvhealth_see_doctor_record_select') {
              // 就诊列表
              viewTemp = {
                title: 'name',
                footer: 'chief_complaint'
              };
            }
            if (e.service_name === 'srvhealth_store_user_select') {
              // 用户列表
              viewTemp = {
                img: 'profile_url',
                title: 'person_name',
                tip: 'sex',
                footer: 'user_role'
              };
            }
            if (e.service_name === 'srvhealth_store_dept_select') {
              // 部门列表
              viewTemp = {
                img: 'photo',
                title: 'introduction',
                tip: 'sex'
              };
            }
            if (e.service_name === 'srvhealth_drugstore_inventory_select') {
              // 药品库存
              viewTemp = {
                img: 'med_packing_pic',
                title: 'medicine_name',
                tip: 'type_tree_no'
              };
            }
            if (e.service_name === 'srvhealth_drug_schedule_doctor_detail_list_select') {
              // 方案计划
              viewTemp = {
                title: 'general_name',
                tip: 'take_times',
                footer: 'remind_time'
              };
            }
            if (e.service_name === 'srvhealth_store_vaccination_appoint_record_select') {
              // 疫苗预约记录
              viewTemp = {
                title: 'customer_name',
                img: 'person_image',
                // footer: 'customer_name'
              };
            }
            if (e.service_name === 'srvhealth_store_vaccination_appointment_select') {
              // 疫苗接种预约列表
              viewTemp = {
                title: 'app_date',
                price: 'app_count',
                footer: 'app_desc'
              };
              label = ['app_date', 'app_count', 'app_desc']
            }
            if (e.service_name === 'srvhealth_store_vaccination_program_select') {
              // 疫苗接种计划列表
              viewTemp = {
                title: 'vaccine_stock_name',
                tip: 'vaccine_type',
                price: 'vaccinate_index'
              };
              label = ['vaccine_stock_name', 'vaccine_type', 'vaccinate_index']
            }
            uni.navigateTo({
              url: '/publicPages/list/list?pageType=list&serviceName=' +
                e.service_name +
                '&label=' +
                JSON.stringify(label) +
                '&cond=' +
                JSON.stringify(condition) +
                '&viewTemp=' +
                JSON.stringify(viewTemp) + '&foreign_key=' + JSON.stringify(foreign_key) +
                '&main_data=' + JSON.stringify(this.storeInfo)
            });
          }
        } else if (data?.srv_app && data?.service_name && data?.foreign_key) {
          const foreign_key = data.foreign_key
          condition = [{
            colName: foreign_key.ref_service_column,
            ruleType: "eq",
            value: formData[foreign_key.refed_service_column]
          }];
          uni.navigateTo({
            url: `/publicPages/list/list?destApp=${data.srv_app}&pageType=list&serviceName=${data.service_name}&foreign_key=${JSON.stringify(data.foreign_key)}` +
              '&cond=' + JSON
              .stringify(condition)
          });
        } else {
          uni.navigateTo({
            url: '/publicPages/list/list?pageType=list&serviceName=' + e.service_name + '&cond=' + JSON
              .stringify(condition)
          });
        }

      },
      async getButtonGroup() {
        const req = {
          "serviceName": "srvhealth_store_home_component_user_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "store_no",
              "ruleType": "eq",
              "value": this.storeNo
            },
            {
              "colName": "button_usage",
              "ruleType": "eq",
              "value": '管理人员'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          }
        }
        const res = await this.$fetch('select', 'srvhealth_store_home_component_user_select', req, 'health')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const buttonGroup = res.data[0]
          if (buttonGroup?.component_label) {
            this.buttonTitle = buttonGroup.component_label
          }
          this.manageGroup = res.data.map(item => {
            item.buttonGroup = []
            if (item.more_config) {
              try {
                item.moreConfig = JSON.parse(item.more_config)
                if (item.moreConfig?.noticeNumConfig) {
                  let noticeNumConfig = item.moreConfig.noticeNumConfig;
                  this.getNoticeNum(noticeNumConfig)
                }
              } catch (e) {
                //TODO handle the exception
              }
            }
            return item
          });
          for (let item of res.data) {
            const buttons = await this.getButtons(item)
            item.buttonGroup = buttons
          }
          // const buttons = await this.getButtons(buttonGroup)
          // if (Array.isArray(buttons)) {
          //   // buttons.push({
          //   // 	label: '店铺设置',
          //   // 	icon: 'settings',
          //   // 	color: 'blue',
          //   // 	type: 'setting'
          //   // })
          //   this.buttonGroup = buttons
          // }
        }
      },
      async getButtons(e) {
        let req = {
          "serviceName": "srvhealth_page_item_buttons_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "item_no",
              "ruleType": "eq",
              "value": e.component_no
            },
            {
              "colName": "display",
              "ruleType": "ne",
              "value": '隐藏'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 99
          },
        }
        const res = await this.$fetch('select', 'srvhealth_page_item_buttons_select', req, 'health')
        if (res.success) {
          const data = res.data.map(item => {
            item.url = item.dest_page
            const obj = this
            let num = 0
            if (item.notice_attr) {
              num = Number(this.renderStr(item.notice_attr, obj))
              if (isNaN(num)) {
                num = true
              }
            }
            if (item.unback_attr) {
              let num1 = Number(this.renderStr(item.unback_attr, obj))
              if (isNaN(num1)) {
                num1 = 0
              }
              item.unback = num1
            }
            if (item.unread_attr) {
              let num1 = Number(this.renderStr(item.unread_attr, obj))
              if (isNaN(num1)) {
                num1 = 0
              }
              item.unread = num1
            }
            item.label = item.button_label
            item.num = num || 0
            item.iconPath = this.getImagePath(item.icon, true)
            return item
          })
          return data
        }
      },
      getWebsiteColumn(no) {
        let req = {
          "serviceName": "srvdaq_cms_category_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "website_no",
            "ruleType": "eq",
            "value": no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 2
          },
        }
        this.$fetch('select', 'srvdaq_cms_category_select', req, 'daq').then(res => {
          if (res.success && res.data.length > 0) {
            this.websiteColumn = res.data
          }
        })
      },

      toStoreDetail() {
        uni.navigateBack()
      },
      getStoreArticleColumns() {
        // 查找此店铺关联的文章栏目
        let req = {
          condition: [{
              colName: 'website_no',
              ruleType: 'eq',
              value: this.storeInfo.website_no
            },
            {
              colName: 'is_leaf',
              ruleType: 'eq',
              value: '是'
            }
          ]
        };
        this.$fetch('select', 'srvdaq_cms_category_select', req, 'daq').then(cate => {

          if (cate.success && cate.data.length > 0) {
            let types = cate.data.reduce((pre, cur) => {
              let obj = {
                name: cur.cate_name,
                no: cur.no,
                icon: 'read',
                color: 'blue',
                type: 'article-list'
              }
              pre.push(obj)
              return pre
            }, [])
            if (types.length > 0) {
              types.forEach(type => {
                type.label = type.name + '管理'
                if (!this.gridList.find(item => item.no && item.no === type.no)) {
                  this.gridList.push(type)
                }
              })
            }
          }
        });
      },
      getStoreSession() {
        // 查找此店铺的客服会话列表
        let req = {
          "condition": [{
            "colName": "session_type",
            "ruleType": "in",
            "value": "机构用户客服"
          }, {
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeNo
          }],
          colNames: ["store_person_no", "session_no", "kefu_kefu_unread_msg"],
          group: [{
            "colName": "kefu_kefu_unread_msg",
            "type": "sum", // 总条数
            'aliasName': 'unread'
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 20
          }
        }
        this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health').then(res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            this.unreadNum = res.data[0].unread
          }
        })
      },
      makePhoneCall() {
        uni.makePhoneCall({
          phoneNumber: this.storeInfo.telephone //仅为示例
        });
      },
      openLocation() {
        if (this.storeInfo.latitude && this.storeInfo.longitude) {
          uni.openLocation({
            latitude: Number(this.storeInfo.latitude),
            longitude: Number(this.storeInfo.longitude),
            name: this.storeInfo.name,
            address: this.storeInfo.address
          });
        }
      },
      clickButton(e) {
        if (e.$orig) {
          e = e.$orig
        }
        if (e.type === 'setting') {
          this.toDetail(this.storeInfo);
          return
        }
        if (e.url) {
          try {
            const data = this
            e.url = this.renderStr(e.url, data)
            e.url = e.url.trim()
          } catch (e) {
            //TODO handle the exception
          }
        }
        let url = e.url
        let navType = 'navigateTo'
        if (e.navType) {
          navType = e.navType
        }
        if (e.navigate_type) {
          navType = e.navigate_type
        }
        if (navType === 'miniProgram') {
          if (e.appid) {
            uni.navigateToMiniProgram({
              appId: e.appid,
              path: url
            })
          }
        } else if (navType === 'takePhone') {
          if (e.phone_number) {
            uni.makePhoneCall({
              phoneNumber: e.phone_number,
              fail(err) {
                console.error(err)
              }
            })
          }
        } else if (['navigateTo', 'redirectoTo', 'switchTab', 'reLaunch'].includes(navType)) {
          uni[navType]({
            url: url,
            fail(err) {
              uni.switchTab({
                url: url
              })
            }
          });
        }
      },
      clickGrid(item) {
        let url = item.url || '';
        let cond = [{
          colName: 'store_no',
          ruleType: 'eq',
          value: this.storeNo
        }];
        let {
          type
        } = item
        let labels = []
        let viewTemp = {};
        switch (type) {
          case 'setting':
            this.toDetail(this.storeInfo);
            break;
          case 'manual':
            // 操作手册
            url =
              `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=CT2021041518560002`
            break;
          case 'message':
            url = '/publicPages/MessageCenter/MessageCenter?storeNo=' + this.storeNo
            break;
          case 'goods_count':
            viewTemp = {
              title: 'goods_name',
              tip: 'goods_desc',
              img: 'goods_img',
              price: 'price',
              footer: 'store_name'
            };
            url =
              `/publicPages/list/list?pageType=list&serviceName=srvhealth_store_goods_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'order_count':
            viewTemp = {
              title: 'order_no',
              tip: 'create_time',
              img: 'image',
              price: 'order_amount',
              footer: 'rcv_addr_str'
            };
            url =
              `/publicPages/list/list?pageType=list&serviceName=srvhealth_store_order_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'see_doctor_count':
            viewTemp = {
              title: 'name'
            };
            url =
              `/publicPages/list/list?pageType=list&serviceName=srvhealth_see_doctor_record_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'paln_count':
            viewTemp = {
              title: 'ds_name'
            };
            url =
              `/publicPages/list/list?pageType=list&serviceName=srvhealth_plan_schedule_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'schedule_count':
            viewTemp = {
              title: 'person_name'
            };
            url =
              `/publicPages/list/list?pageType=list&serviceName=srvhealth_store_on_duty_scheduling_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'user_count':
            viewTemp = {
              title: 'store_remark_person_name||person_name',
              img: 'profile_url'
            };
            let order = [
              // 	{
              // 	colName: "store_remark_person_name",
              // 	orderType: "desc"
              // },{
              // 	colName: "user_role",
              // 	orderType: "desc"
              // }
            ]
            url =
              `/publicPages/list/list?pageType=list&hideFootBtn=true&serviceName=srvhealth_store_user_select&order=${JSON.stringify(order)}&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
            break;
          case 'staff_count':
            viewTemp = {
              title: 'store_remark_person_name||person_name',
              tip: 'sex',
              img: 'profile_url',
              price: 'store_session_user_unread_msg',
              footer: 'kefu_session_kefu_unread_msg'
              // footer: [' ','user_role']
            };
            cond.push({
              colName: "user_role",
              ruleType: "inset",
              value: "工作人员,大夫,药房人员,客服,管理员"
            })
            labels = ['store_session_user_unread_msg', 'kefu_session_kefu_unread_msg', 'user_role', 'sex'],
              url =
              `/publicPages/list/list?pageType=list&hideFootBtn=true&customTemp=true&label=${JSON.stringify(labels)}&serviceName=srvhealth_store_user_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;

            break;
          case 'vaccination_appointment':
            // 预约列表
            viewTemp = {
              title: 'appoint_name',
              tip: ['app_date'],
              // tip: [ '预约日期：', 'app_date', ' ', 'app_time_start', '-', 'app_time_end' ],
              // img: 'profile_url',
              price: 'app_count',
              footer: 'app_desc'
            };
            labels = ['app_count', 'app_desc'],
              url =
              `/publicPages/list/list?pageType=list&label=${JSON.stringify(labels)}&serviceName=srvhealth_store_vaccination_appointment_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`
            break;
          case 'notice':
            // 通知公告管理
            // this.modalName = 'selectColumn'
            if (this.storeNo === 'S20210227032') {
              this.goNoticeList(item)
            }
            break;
          case 'queueManage':
            url = `/storePages/queue/list?store_no=${this.storeNo}&type=manage`
            // url = `/storePages/queueManage/queueManage?store_no=${this.storeNo}`
            break;
          case 'article-list':
            // 通知公告管理
            // this.modalName = 'selectColumn'
            // if (this.storeNo === 'S20210227032') {
            this.goNoticeList(item)
            // }
            break;
          case 'article-list-manager':
            this.clickButton(item)
            return;
            break;
          case 'vaccine_stocks':
            // 疫苗库存
            viewTemp = {
              title: 'vaccine_drug_name',
              tip: 'usage',
              // img: 'profile_url',
              price: 'stock_count',
              footer: 'remark'
            };
            labels = ['stock_count', 'remark']
            url =
              `/publicPages/list/list?pageType=list&label=${JSON.stringify(labels)}&serviceName=srvhealth_store_vaccine_stocks_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`
            break;
        }

        if (url) {
          uni.navigateTo({
            url: url
          });
        }
      },
      async selectStoreActivity() {
        // 查找店铺关联问卷
        const req = {
          "serviceName": "srvdaq_activity_cfg_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'store_no',
            ruleType: 'eq',
            value: 'S20210517043'
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        this.$fetch('select', 'srvdaq_activity_cfg_select', req, 'daq').then(res => {
          if (res.success && res.data.length > 0) {
            let obj = {
              url: '/questionnaire/storeQuest/storeQuest?store_no=' + this.storeNo,
              name: '信息采集',
              label: '信息采集',
              icon: 'form',
              color: 'orange',
              type: 'daq'
            }
            this.gridList.push(obj)
          }
        })

      },
      goNoticeList(item) {
        let viewTemp = {
          price: "content_status",
          // price:"create_time",
          tip: 'content',
          footer: 'create_time',
          title: 'title',
          img: 'icon_image'
        };
        let cond = [{
          colName: "no",
          ruleType: "like",
          value: item.no
        }]
        let url =
          `/publicPages/list/list?pageType=list&appName=daq&serviceName=srvdaq_cms_content_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
        uni.navigateTo({
          url: url
        })
      },
      hideModal() {
        this.modalName = ''
      },
      toDetail(e) {
        let fieldsCond = [{
            column: 'store_no',
            display: false,
            value: e.store_no
          },
          {
            column: 'sale_num',
            display: false
          },
          {
            column: 'grade',
            display: false
          },
          {
            column: 'audit_status',
            display: false,
            value: e.audit_status
          },
          {
            column: 'create_time',
            display: false
          },
          {
            column: 'create_user_disp',
            display: false
          },
          {
            column: 'order_count',
            display: false
          },
          {
            column: 'goods_count',
            display: false
          },
          {
            column: 'person_order_count',
            display: false
          },
          {
            column: 'see_doctor_count',
            display: false
          },
          {
            column: 'user_count',
            display: false
          },
          {
            column: 'website_no',
            display: false,
            value: e.website_no
          }
        ];
        const url = '/publicPages/form/form?serviceName=srvhealth_store_mgmt_select&type=detail&fieldsCond=' +
          JSON.stringify(
            fieldsCond)
        uni.navigateTo({
          url: url
        });
      },
      async selectChild() {
        // 查找子表
        const req = {
          "serviceName": "srvsys_service_columnex_v2_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_name",
            "value": "srvhealth_store_mgmt_select",
            "ruleType": "eq"
          }, {
            "colName": "use_type",
            "value": "detail",
            "ruleType": "eq"
          }],
          "order": [{
            "colName": "seq",
            "orderType": "asc"
          }]
        }
        const res = await this.$fetch('select', 'srvsys_service_columnex_v2_select', req, 'health');
        if (res.success) {
          this.colV2Data = res.data
          this.childTable = res.data.child_service.map(item => {
            if (item?.foreign_key?.section_name) {
              item.label = item.foreign_key.section_name
            } else {
              item.label = item.service_view_name
            }
            return item
          })
          this.getChildServiceList()
        }
        return
      },
      async getStoreInfo() {

        await this.selectStoreActivity()
        let req = {
          condition: [{
            colName: 'store_no',
            ruleType: 'in',
            value: this.storeNo
          }]
        };
        if (this.colV2Data?.vpage_no) {
          req['vpage_no'] = this.colV2Data.vpage_no
        }
        let storeInfo = await this.$fetch('select', 'srvhealth_store_mgmt_select', req, 'health');
        if (storeInfo.success && Array.isArray(storeInfo.data) && storeInfo.data.length > 0) {
          // storeInfo = storeInfo.data[0];
          this.unreadNum = storeInfo.data[0].kefu_unread_msg
          this.unreadNumber = storeInfo.data[0].kefu_unack_msg
          this.storeInfo = storeInfo.data[0];
          if (this.storeInfo?.name) {
            uni.setNavigationBarTitle({
              title: this.storeInfo?.name || ''
            })
          }
          if (this.storeInfo.para_cfg) {
            try {
              let moreConfig = JSON.parse(this.storeInfo.para_cfg)
              this.storeInfo.moreConfig = moreConfig
              if (moreConfig && moreConfig.displayColumn) {
                this.displayColumn = moreConfig.displayColumn
              }
            } catch (e) {
              //TODO handle the exception
            }
          }

          if (this.storeInfo?._child_tables && Array.isArray(this.storeInfo._child_tables) && this.storeInfo
            ._child_tables.length > 0) {
            const arr = this.storeInfo._child_tables
            this.childTable = this.childTable.filter((item, index) => {
              if (arr[index] === 0) {
                return false
              } else {
                return true
              }
            })
          }
          if (this.storeInfo?.mgmt_button_type === '自动') {
            // this.selectChild()
          }
          if (this.storeInfo.website_no) {
            let obj = {
              url: '/storePages/articleManager/articleManager?store_no=' + this.storeNo,
              name: '文章管理',
              label: '文章管理',
              icon: 'read',
              color: 'blue',
              type: 'article-list-manager'
            }
            this.gridList.push(obj)
          }
        }
        return
      },
      async getNoticeNum(e) {
        let serviceName = e?.service_name
        let app = e?.app
        let req = {
          "colNames": ["*"],
          "serviceName": serviceName,
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        let url = this.getServiceUrl(app, serviceName, 'select');
        let res = await this.$http.post(url, req)
        if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
          let data = res.data.data[0]
          this.noticeNum = Object.assign(this.noticeNum, data)
        }
      },
    },
    onPullDownRefresh() {
      if (this.storeNo) {
        this.getStoreInfo();
        // this.getStoreSession()
      }
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
    beforeDestroy() {
      uni.$emit('updateUnread')
    },
    async onLoad(option) {
      if (this.theme === 'coffee') {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#BFA58B'
        })
      }
      uni.$on('updateKefuSessionLastLookTime', () => {
        if (this.storeNo) {
          this.getStoreInfo();
          // this.getStoreSession()
        }
      })
      if (option.store_no) {
        this.storeNo = option.store_no;
        await this.getStoreInfo();
        // await this.getNoticeNum()
        await this.selectChild()

        this.getButtonGroup()
      }
    }
  };
</script>

<style lang="scss" scoped>
  .breathe {
    margin: 0 auto;
    height: 10px;
    width: 10px;
    background-color: #f33610 !important;
    border-radius: 50px;
    box-shadow: 0px 0px 5px #f33610;
    // animation: fadeIn 1s 1  linear;
    position: absolute;
    right: 0;
    top: 0;
    margin: 0;
    padding: 0;
  }

  @keyframes fadeIn {
    0% {
      width: 10px;
      height: 10px;
      transform: scale(1);
      /*初始状态 透明度为0*/
    }

    50% {
      transform: scale(0);
      /*中间状态 透明度为1*/
    }

    100% {
      width: 10px;
      height: 10px;
      transform: scale(1);
      /*结尾状态 透明度为0*/
    }
  }

  .page-bg {
    background-color: #35C6C4;
    min-height: calc(100vh - var(--window-top));
  }

  .page-wrap {
    // background-color: #f1f1f1;
    min-height: calc(100vh - var(--window-top));
    background-color: #fff;
    border-radius: 50rpx 50rpx 0 0;
    overflow: hidden;
    color: #333;
  }

  .statis-box {
    display: flex;
    flex-wrap: wrap;
    // background-color: #fff;
    margin: 20rpx;
    // border-radius: 20rpx;
    justify-content: space-around;

    .statis-item {
      padding: 30rpx 20rpx;
      min-width: 30%;
      text-align: center;
      background-image: linear-gradient(to right, #EAF9F9, #ECF1FE);
      border-radius: 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      min-height: 200rpx;

      .item-label {
        margin-top: 10rpx;
        height: 16px;
        font-size: 11px;
        font-family: 苹方-简;
        font-weight: normal;
        line-height: 22px;
        color: #9092A5;
        opacity: 1;
      }

      .item-value {
        font-weight: bold;
        font-size: 36rpx;
      }
    }
  }


  .head {
    margin-top: 20rpx;
    background-color: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    flex-wrap: wrap;
    max-width: 720px;
    margin: 20rpx 0;

    .store-address {
      flex: 1;
      padding: 20rpx;
      color: #9092A5;
      font-size: 32rpx;
      font-family: 苹方-简;

      .location {
        margin: 0;
        padding-right: 10rpx;
        font-size: 36rpx;
      }
    }

    .store-info {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    .store-name {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .name {
        font-size: 34rpx;
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
      }

      .phone {
        width: 76rpx;
        height: 76rpx;
        background: #FFBD37;
        box-shadow: 0px 3px 7px #FFE8BF;
        opacity: 1;
        border-radius: 20px;
        text-align: center;
        line-height: 76rpx;
        color: #fff;
        font-size: 36rpx;

        .image {
          width: 50rpx;
          height: 50rpx;
        }
      }

      .address {
        max-width: 400rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 5px;
        color: #666;
      }
    }

    // .phone {
    // 	flex: 1;
    // 	display: flex;
    // 	justify-content: flex-end;
    // 	align-items: center;

    // 	image {
    // 		width: 50rpx;
    // 		height: 50rpx;
    // 	}
    // }
  }

  .logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 20rpx;
    border: 1px solid #f1f1f1;
  }

  .manager-view {
    background-color: #fff;
    padding: 0 20rpx;

    .title {
      display: flex;
      padding: 20rpx 20rpx 10rpx;
      align-items: center;
      justify-content: space-between;

      .cu-btn {
        background-image: linear-gradient(to right, #EAF9F8, #ECF1FE);
        font-size: 24rpx;

        [class*="cuIcon-"] {
          color: #DC84FB;
          font-size: 36rpx;
          margin-right: 10rpx;
        }
      }
    }
  }

  .manager-box {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    margin-bottom: 10rpx;

    .cu-bar {
      margin: 20rpx 0;
      width: 100%;
    }

    @media screen and (min-width: 360px) {
      .box-item {
        width: 33% !important;
      }
    }

    @media screen and (min-width: 480px) {
      .box-item {
        width: 25% !important;
      }
    }

    @media screen and (min-width: 1300px) {
      .box-item {
        width: 15% !important;
      }
    }

    @media screen and (min-width: 1260px) {
      .box-item {
        width: 10% !important;
      }
    }

    .box-item {
      padding: 40rpx 20rpx;
      box-sizing: border-box;
      // border: 1px solid #f1f1f1;
      // background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 25%;
      padding: 10rpx;

      .amount {
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1;
      }

      .badge-null {
        position: absolute;
        background-color: #f33610;
        border-radius: 100px;
        top: 0px;
        right: 10px;
        padding: 0px 5px;
        height: 10px;
        width: 10px;
        color: #ffffff;
        z-index: 1;
      }

      .badge {
        top: 0px;
        right: 10px;
        z-index: 1;
      }

      .badge-left {
        position: absolute;
        background-color: #f37b1d;
        border-radius: 100px;
        top: 0px;
        left: 10px;
        font-size: 10px;
        padding: 0px 5px;
        height: 14px;
        color: #ffffff;
        z-index: 1;
      }

      .badge-right {}

      .box-item-content {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #FAFBFC;
        width: 100%;
        min-height: 180rpx;
        text-align: center;
        border-radius: 20rpx;

        .label-icon {
          margin: auto;
          padding: 15rpx;
          width: 120rpx;
          height: 120rpx;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          border-radius: 20rpx;

          // background: #1488CC;  /* fallback for old browsers */
          .image {
            width: 100%;
            height: 100%;
          }

          .text {
            // font-weight: bold;
            font-size: 32rpx;
            width: 50%;
            text-align: center;
          }
        }

        .tit-label {
          font-size: 12px;
          position: absolute;
          bottom: -20px;
        }
      }

      .icon {
        width: 80rpx;
        height: 80rpx;
        font-size: 30px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }

      .label {
        margin-top: 10rpx;
      }
    }
  }
</style>
