<template>
  <view class="page-wrap">
    <view class="head">
      <image
        :src="getImagePath(storeInfo.image)"
        class="logo"
        mode="aspectFill"
        @click="toStoreDetail"
      ></image>
      <view class="store-name" @click="toStoreDetail">
        <view class="name">{{ storeInfo.name }}</view>
        <view class="address" v-if="storeInfo.address" @click="openLocation">
          {{ storeInfo.address }}
          <text
            class="location cuIcon-locationfill text-blue margin-left-xs"
          ></text>
        </view>
      </view>
      <view class="phone" @click="makePhoneCall" v-if="storeInfo.telephone">
        <image src="../../static/icon/makePhone.png" mode=""></image>
      </view>
    </view>
    <view class="manager-view">
      <text class="text-grey title"
        ><text class="margin-right">管理</text>
        <text class="cuIcon-title text-orange margin-right">未回复</text>
        <text class="cuIcon-title text-red">未读</text></text
      >
      <view class="manager-box" v-if="storeInfo.mgmt_button_type === '固定'">
        <view class="box-item" v-for="item in list" @click="clickGrid(item)">
          <view class="cu-tag amount text-blue" v-if="storeInfo[item.type]">
            {{ storeInfo[item.type] | overDisplay }}
          </view>
          <view class="box-item-content">
            <text class="cu-tag badge" v-if="item.num">{{ item.num }}</text>
            <text class="cu-tag badge-left" v-if="item.unback">{{
              item.unback
            }}</text>
            <!-- <image
              src="../static/links.png"
              class="icon"
              mode=""
              v-if="!item.icon"
            ></image> -->
            <text
              class="icon"
              :class="[
                'cuIcon-' + item.icon,
                item.color ? 'text-' + item.color : '',
              ]"
            ></text>
            <view class="label">{{ item.label }}</view>
          </view>
        </view>
      </view>
      <view class="manager-box" v-else>
        <view
          class="box-item"
          v-for="item in buttonGroup"
          @click="clickButton(item)"
        >
          <view
            class="cu-tag amount text-blue"
            v-if="item.num && item.label === '用户列表'"
          >
            {{ item.num || 0 }}
          </view>
          <view class="box-item-content">
            <text
              class="cu-tag badge"
              v-if="item.num && item.label !== '用户列表'"
              >{{ item.num }}</text
            >
            <text class="cu-tag badge-left" v-if="item.unback">{{
              item.unback
            }}</text>
            <text class="cu-tag badge" v-if="item.unread">{{
              item.unread
            }}</text>
            <image
              :src="item.iconPath"
              class="icon"
              mode="aspectFill"
              v-if="item.iconPath"
            ></image>
            <text
              class="icon"
              v-else-if="item.icon && item.color"
              :class="[
                'cuIcon-' + item.icon,
                item.color ? 'text-' + item.color : '',
              ]"
            ></text>
            <view class="label">{{ item.label }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      storeInfo: {},
      modalName: '',
      storeNo: '',
      gridList: [ {
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
      // {
      // 	label: '公告管理',
      // 	icon: 'read',
      // 	color: 'orange',
      // 	type: 'notice'
      // },
      // {
      // 	label: '业务管理',
      // 	icon: 'read',
      // 	color: 'blue',
      // 	type: 'business'
      // },
      {
        label: '操作手册',
        icon: 'creative',
        color: 'yellow',
        type: 'manual'
      },
      {
        label: '店铺设置',
        icon: 'settings',
        color: 'blue',
        type: 'setting'
      }
      ],
      sessionList: [],
      buttonGroup: [],
      unreadNum: 0,
      unreadNumber: 0,
      websiteDetail: {}, //店铺关联站点信息
      websiteColumn: [], //站点栏目
    };
  },
  filters: {
    overDisplay: function (value) {
      return value;
      // return value < 999 ? value : '99+';
    }
  },
  computed: {
    list () {
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
    async getButtonGroup () {
      const req = {
        "serviceName": "srvhealth_store_home_component_select",
        "colNames": [ "*" ],
        "condition": [ {
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
      const res = await this.$fetch('select', 'srvhealth_store_home_component_select', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const buttonGroup = res.data[ 0 ]
        const buttons = await this.getButtons(buttonGroup)
        if (Array.isArray(buttons)) {
          buttons.push({
            label: '店铺设置',
            icon: 'settings',
            color: 'blue',
            type: 'setting'
          })
          this.buttonGroup = buttons
        }

      }
    },
    async getButtons (e) {
      let req = {
        "serviceName": "srvhealth_page_item_buttons_select",
        "colNames": [ "*" ],
        "condition": [ {
          "colName": "item_no",
          "ruleType": "eq",
          "value": e.component_no
        },
        {
          "colName": "display",
          "ruleType": "ne",
          "value": '隐藏'
        } ],
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
          // if (item.dest_page) {
          // 	item.url = this.renderStr(item.dest_page, obj)
          // 	item.url = item.url.trim()
          // }
          if (item.notice_attr) {
            num = Number(this.renderStr(item.notice_attr, obj))
            if (isNaN(num)) {
              num = 0
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
    getWebsiteColumn (no) {
      let req = {
        "serviceName": "srvdaq_cms_category_select",
        "colNames": [ "*" ],
        "condition": [ {
          "colName": "website_no",
          "ruleType": "eq",
          "value": no
        } ],
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

    toStoreDetail () {
      uni.navigateBack()
    },
    getStoreArticleColumns () {
      // 查找此店铺关联的文章栏目
      let req = {
        condition: [ {
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
    getStoreSession () {
      // 查找此店铺的客服会话列表
      let req = {
        "condition": [ {
          "colName": "session_type",
          "ruleType": "in",
          "value": "机构用户客服"
        }, {
          "colName": "store_no",
          "ruleType": "eq",
          "value": this.storeNo
        } ],
        colNames: [ "store_person_no", "session_no", "kefu_kefu_unread_msg" ],
        group: [ {
          "colName": "kefu_kefu_unread_msg",
          "type": "sum", // 总条数
          'aliasName': 'unread'
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 20
        }
      }
      this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health').then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.unreadNum = res.data[ 0 ].unread
        }
      })
    },
    makePhoneCall () {
      uni.makePhoneCall({
        phoneNumber: this.storeInfo.telephone //仅为示例
      });
    },
    openLocation () {
      if (this.storeInfo.latitude && this.storeInfo.longitude) {
        uni.openLocation({
          latitude: Number(this.storeInfo.latitude),
          longitude: Number(this.storeInfo.longitude),
          name: this.storeInfo.name,
          address: this.storeInfo.address
        });
      }
    },
    clickButton (e) {
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
            fail (err) {
              console.error(err)
            }
          })
        }
      } else if ([ 'navigateTo', 'redirectoTo', 'switchTab', 'reLaunch' ].includes(navType)) {
        uni[ navType ]({
          url: url,
          fail (err) {
            uni.switchTab({
              url: url
            })
          }
        });
      }
    },
    clickGrid (item) {
      let url = item.url || '';
      let cond = [ {
        colName: 'store_no',
        ruleType: 'eq',
        value: this.storeNo
      } ];
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
          labels = [ 'store_session_user_unread_msg', 'kefu_session_kefu_unread_msg', 'user_role', 'sex' ],
            url =
            `/publicPages/list/list?pageType=list&hideFootBtn=true&customTemp=true&label=${JSON.stringify(labels)}&serviceName=srvhealth_store_user_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
          debugger
          break;
        case 'vaccination_appointment':
          // 预约列表
          viewTemp = {
            title: 'appoint_name',
            tip: [ '预约日期：', 'app_date', ' ', 'app_time_start', '-', 'app_time_end' ],
            // img: 'profile_url',
            price: 'app_count',
            footer: 'app_desc'
          };
          labels = [ 'app_count', 'app_desc' ],
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
          labels = [ 'stock_count', 'remark' ]
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
    async selectStoreActivity () {
      // 查找店铺关联问卷
      const req = { "serviceName": "srvdaq_activity_cfg_select", "colNames": [ "*" ], "condition": [ { colName: 'store_no', ruleType: 'eq', value: 'S20210517043' } ], "page": { "pageNo": 1, "rownumber": 1 } }
      const res = await this.$fetch('select', 'srvdaq_activity_cfg_select', req, 'daq');
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
        return true
      }

    },
    goNoticeList (item) {
      let viewTemp = {
        price: "content_status",
        // price:"create_time",
        tip: 'content',
        footer: 'create_time',
        title: 'title',
        img: 'icon_image'
      };
      let cond = [ {
        colName: "no",
        ruleType: "like",
        value: item.no
      } ]
      let url =
        `/publicPages/list/list?pageType=list&appName=daq&serviceName=srvdaq_cms_content_select&cond=${JSON.stringify(cond)}&viewTemp=${JSON.stringify(viewTemp)}`;
      uni.navigateTo({
        url: url
      })
    },
    hideModal () {
      this.modalName = ''
    },
    toDetail (e) {
      let fieldsCond = [ {
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
    async getStoreInfo () {
      this.selectStoreActivity()
      let req = {
        condition: [ {
          colName: 'store_no',
          ruleType: 'in',
          value: this.storeNo
        } ]
      };
      let storeInfo = await this.$fetch('select', 'srvhealth_store_mgmt_select', req, 'health');
      if (storeInfo.success && Array.isArray(storeInfo.data) && storeInfo.data.length > 0) {
        // storeInfo = storeInfo.data[0];
        this.unreadNum = storeInfo.data[ 0 ].kefu_unread_msg
        this.unreadNumber = storeInfo.data[ 0 ].kefu_unack_msg
        this.storeInfo = storeInfo.data[ 0 ];
        // this.getStoreArticleColumns()
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
    }
  },
  onPullDownRefresh () {
    if (this.storeNo) {
      this.getStoreInfo();
      // this.getStoreSession()
    }
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  beforeDestroy () {
    uni.$emit('updateUnread')
  },
  onLoad (option) {
    uni.$on('updateKefuSessionLastLookTime', () => {
      if (this.storeNo) {
        this.getStoreInfo();
        // this.getStoreSession()
      }
    })
    if (option.store_no) {
      this.storeNo = option.store_no;
      this.getStoreInfo();
      this.getButtonGroup()
      // this.getStoreSession()
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background-color: #f1f1f1;
}

.head {
  margin-top: 20rpx;
  background-color: #fff;
  padding: 20rpx;
  display: flex;

  .store-name {
    margin-left: 20rpx;
    flex-wrap: wrap;

    .name {
      font-weight: bold;
      font-size: 16px;
    }

    .address {
      max-width: 400rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 5px;
      color: #666;
    }
  }

  .phone {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    image {
      width: 50rpx;
      height: 50rpx;
    }
  }
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  border: 1px solid #f1f1f1;
}

.manager-view {
  background-color: #fff;

  .title {
    display: inline-block;
    padding: 20rpx 20rpx 20rpx;
  }
}

.manager-box {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;

  .box-item {
    padding: 40rpx 20rpx;
    width: 33.33%;
    box-sizing: border-box;
    border: 1px solid #f1f1f1;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .amount {
      position: absolute;
      right: 0;
      top: 0;
    }

    .badge-left {
      position: absolute;
      background-color: #f37b1d;
      border-radius: 100px;
      top: -10rpx;
      left: -10rpx;
      font-size: 10px;
      padding: 0px 5px;
      height: 14px;
      color: #ffffff;
    }
    .badge-right {
    }
    .box-item-content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

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
      margin-top: 10px;
    }
  }
}
</style>
