<template>
  <view class="page-wrap" :class="['theme-'+theme]">
    <view class="util-bar" v-if="
        (groupInfo && groupInfo.gc_no) ||
        sessionType === '店铺机构全员' ||
        receiver_person_no
      ">
      <view class="util-item bg-white round" @click="toPages('groupAnnouncement')"
        v-if="(groupInfo && groupInfo.gc_no) || sessionType === '店铺机构全员'">
        <view class="icon"><text class="cuIcon-notice"></text></view>
        <text class="label">群公告</text>
      </view>
      <!--     <view class="util-item" @click="toPages('group-util')"
        v-if="(groupInfo && groupInfo.gc_no) || sessionType === '店铺机构全员'">
        <view class="icon"><text class="cuIcon-repair"></text></view>
        <text class="label">小工具</text>
      </view> -->
      <view class="util-item bg-white round" @click="toPages('doctor-info')" v-if="receiver_person_no">
        <view class="icon"><text class="cuIcon-people"></text></view>
        <text class="label">详细资料</text>
      </view>
      <!--   <view class="util-item" @click="toPages('group-detail')"
        v-if="(groupInfo && groupInfo.gc_no) || sessionType === '店铺机构全员'">
        <view class="icon"><text class="cuIcon-settings"></text></view>
      </view> -->
    </view>
    <view class="util-bar absolute" v-if="top_buttons&&top_buttons.length>0">
      <button class="util-item round cu-btn bg-blue" :class="[getBtnClassName(btn)]" @click="onButton(btn)"
        v-for="(btn,index) in top_buttons" :key="index">
        <!-- <view class="icon"><text class="cuIcon-notice"></text></view> -->
        <text class="label">{{btn.name||''}}</text>
      </button>

    </view>
    <!--    <view style="height: 170px;" v-if="showGoodsCard&&goodsInfo">
      
    </view> -->
    <view class="goods-card" v-if="showGoodsCard&&goodsInfo">
      <view class="goods-card-content">
        <image class="goods-img" :src="getImagePath(goodsInfo.goods_img,true)" mode="aspectFit"
          v-if="goodsInfo.goods_img"></image>
        <view class="goods-info">
          <view class="title">
            {{goodsInfo.goods_name||''}}
          </view>
          <view class="price text-red">
            ￥{{goodsInfo.price||''}}
          </view>
        </view>
      </view>
      <view class="goods-card-footer">
        <button class="cu-btn  round margin-left" style="opacity: 0;">取消</button>
        <button class="cu-btn bg-cyan round" @click="sendGoods">发送链接</button>
        <button class="cu-btn  round margin-left" @click="cancelSendGoods">关闭</button>
      </view>
    </view>
    <view class="chart-page">
      <person-chat ref="chatInstance" :show-goods-card="showGoodsCard&&goodsInfo?true:false" :session-no="session_no"
        :identity="identity" :sessionInfo="sessionInfo" page-type="session" @clickAvatar="clickAvatar"
        @load-msg-complete="loadMsgComplete" :groupInfo="groupInfo" :rowInfo="rowInfo" :storeInfo="storeInfo"
        :sessionType="sessionType" :storeNo="storeNo" :topHeight="topHeight" :group-no="groupNo"
        :receiverInfo="receiverInfo" :banSend="banSend" :band-post="bandPost" v-if="session_no&&storeUserInfo"
        :storeUserInfo="storeUserInfo" :queryOption="queryOption"></person-chat>
    </view>
  </view>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  import personChat from '../components/person-chat/person-chat.vue'
  export default {
    components: {
      personChat
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      moreConfig() {
        let more_config = this.sessionInfo?.more_config;
        if (typeof more_config === 'string') {
          try {
            more_config = JSON.parse(more_config)
          } catch (e) {
            //TODO handle the exception
            console.log(e)
            debugger
          }
          return more_config
        }
      },
      topButtons() {
        return this.moreConfig?.top_buttons
      },
      bandPost() {
        // 是否群体禁言
        return this.sessionInfo?.band_post
      },
      banSend() {
        // 是否禁言
        if (this.bandPost === '仅用户禁言') {
          if (this.storeUserInfo.user_role) {
            if (this.storeUserInfo.user_role.indexOf(',') === -1 && this.storeUserInfo.user_role.indexOf('用户') !== -1) {
              return true
            }
          }
        } else if (this.bandPost === '全员禁言') {
          return true
        }
        if (this.userInfo && this.userInfo.ban_send === '是') {
          return true
        } else if (this.storeUserInfo && this.storeUserInfo.ban_send === '是' && this.sessionType === '店铺机构全员') {
          return true
        } else if (this.storeUser && this.storeUser.ban_send === '是' && this.sessionType === '群组圈子') {
          return true
        } else {
          return false
        }
      },
      ...mapState({
        systemInfo: state => state.app.systemInfo,
        storeUser: state => state.user.storeUserInfo
      }),
      topHeight() {
        if ((this.groupInfo && this.groupNo) || this.sessionType === '店铺机构全员' || (this.storeNo && this
            .receiver_person_no)) {
          return 42
        } else {
          return 0
        }
      }
    },
    data() {
      return {
        queryOption: {},
        articleList: [],
        pageTitle: "", //页面标题
        sessionType: '', // 会话类型
        session_no: '', // 会话编号
        storeNo: '', // 机构编号
        store_user_no: '', // 客服会话 发起人的店铺用户编号
        receiver_person_no: '', // 客服会话 - 接收者用户编号
        receiverInfo: {
          // 接收者信息
        },
        storeUserInfo: {}, // 当前登录用户在店铺成员列表中的信息
        groupNo: '', //群组编号
        row_no: '', // 一对一会话 用户关系编码
        identity: '',
        rowInfo: {},
        sessionInfo: {}, //会话信息
        groupInfo: {},
        pg_no: '',
        groupUser: [], //群组用户列表
        lastMessage: {},
        goods_no: "",
        goodsInfo: null,
        showGoodsCard: false,
        top_buttons: []
      }
    },
    methods: {
      getBtnClassName(btn) {
        let className = ''
        if (btn?.bg) {
          className += `bg-${btn.bg}`
        }
        return className
      },
      onButton(btn) {
        if (btn.url) {
          let data = {
            userInfo: this.$store?.state?.user?.userInfo,
            storeInfo: this.$store?.state?.app?.storeInfo
          }
          btn.url = this.renderStr(btn.url, data)
        }

        uni.navigateTo({
          url: btn.url
        })

      },
      clickAvatar(e) {
        // 点击聊天记录中用户头像
        if (this.storeUserInfo && this.storeUserInfo.user_role && e.sender_person_no) {
          if (this.storeUserInfo.user_role.indexOf('管理员') !== -1 || this.storeUserInfo.user_role.indexOf(
              '工作人员') !== -1 || this.storeUserInfo.user_role.indexOf('大夫') !== -1 || this.storeUserInfo
            .user_role
            .indexOf('客服') !== -1) {
            let fieldsCond = [{
              "column": "person_no",
              "value": e.sender_person_no,
              "display": false
            }]
            let hideColumn = [
              "name",
              "image",
              "type",
              "store_user_no",
              "_store_no_disp",
              "store_no",
              "_person_no_disp",
              "person_no",
              "user_account",
              "store_remark_person_name",
              "kefu_kefu_unread_msg",
              "invite_user_no",
              "home_store_no",
              "kefu_session_no",
              "kefu_session_user_last_time",
              "kefu_session_kefu_last_time",
              "kefu_session_user_unread_msg",
              "kefu_session_kefu_unread_msg",
              "store_session_sign_in_time",
              "store_session_user_unread_msg",
              "add_url",
              "create_time",
              "create_user_disp"
            ]
            uni.navigateTo({
              url: `/publicPages/form/form?type=detail&serviceName=srvhealth_store_user_select&fieldsCond=${JSON.stringify(fieldsCond)}&hideColumn=${JSON.stringify(hideColumn)}`
            })
          }
        }
      },
      toPages(type) {
        if (type === 'groupAnnouncement') {
          // 跳转到群公告列表
          uni.navigateTo({
            url: `/publicPages/groupAC/groupAC?session_no=${this.session_no}&store_no=${this.storeNo}&store_user_no=${this.store_user_no}`
          })
          return
        }
        if (this.groupInfo.gc_no) {
          uni.navigateTo({
            url: `../gropDetail/gropDetail?gc_no=${this.groupInfo.gc_no}&type=${type}`
          });
        } else {
          let url = ''
          if (type === 'doctor-info') {
            // if (this.receiver_person_no && this.storeNo) {
            if (this.receiver_person_no && this.storeNo && this.store_user_no) {
              let webUrl =
                `https://login.100xsys.cn/health/#/storePages/DoctorIntro/DoctorIntro?nouseRelation=true&person_no=${this.receiver_person_no}&store_no=${this.storeNo}&store_user_no=${this.store_user_no}`
              let url = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
              uni.redirectTo({
                url
              });
              return
              // url =
              //   `/storePages/DoctorIntro/DoctorIntro?nouseRelation=true&person_no=${this.receiver_person_no}&store_no=${this.storeNo}&store_user_no=${this.store_user_no}`
              // url =
              // `/storePages/DoctorIntro/DoctorIntro?nouseRelation=true&person_no=${this.receiver_person_no}&store_no=${this.storeNo}`
            }
          } else {
            url = `../gropDetail/gropDetail?sessionType=店铺机构全员&type=${type}&storeNo=${this.storeNo}`
          }
          uni.navigateTo({
            url: url
          });
        }

      },
      loadMsgComplete(e) {
        // 消息加载完毕
        this.lastMessage = e
        if (this.sessionType === '机构用户客服') {
          this.updateKefuSessionLastLookTime(this.lastMessage)
        } else if (this.sessionType === '店铺机构全员') {
          this.updateStoreSessionLastLookTime(this.lastMessage)
        } else if (this.groupInfo && this.pg_no) {
          // 更新群组圈子最后查看时间
          this.updateLastLookTime(this.lastMessage);
        }
      },
      async getRow() {
        // 一对一 
        let req = {
          "serviceName": "srvhealth_person_relation_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "row_no",
            "ruleType": "eq",
            "value": this.row_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', 'srvhealth_person_relation_select', req, 'health')
        // .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.rowInfo = res.data[0]
          if (res.data[0].usera_person_no === this.userInfo.no) {
            this.pageTitle = res.data[0].userb_name
          } else {
            this.pageTitle = res.data[0].usera_name
          }
          uni.setNavigationBarTitle({
            title: this.pageTitle
          })
        }
        // })
      },
      async getStore() {
        // 查找店铺信息
        // let req = {
        //   "condition": [{
        //     "colName": "store_no",
        //     "ruleType": "eq",
        //     "value": this.storeNo
        //   }],
        //   "page": {
        //     "pageNo": 1,
        //     "rownumber": 1
        //   }
        // }
        // let res = await this.$fetch('select', 'srvhealth_store_mgmt_select', req, 'health')
        // if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        //   this.storeInfo = res.data[0]
        //   if (this.storeInfo && this.storeInfo.user_count && this.sessionType === '店铺机构全员') {
        //     const pageTitle =
        //       `${this.sessionInfo && this.sessionInfo.session_name || this.storeInfo.name}(${this.storeInfo.user_count})`
        //     uni.setNavigationBarTitle({
        //       title: pageTitle
        //     })
        //   }
        //   return this.storeInfo
        // }
        if (this.storeInfo && this.storeInfo.user_count && this.sessionType === '店铺机构全员') {
          const pageTitle =
            `${this.sessionInfo && this.sessionInfo.session_name || this.storeInfo.name}(${this.storeInfo.user_count})`
          uni.setNavigationBarTitle({
            title: pageTitle
          })
        }
      },
      async getGroup() {
        // 查找圈子信息
        let req = {
          "serviceName": "srvhealth_group_circle_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "gc_no",
            "ruleType": "eq",
            "value": this.groupNo
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', 'srvhealth_group_circle_select', req, 'health')
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.groupInfo = res.data[0]
          this.getGroupUser()
          if (res.data[0].session_no) {
            this.session_no = res.data[0].session_no
          } else if (this.session_no) {
            this.updateSessionNo()
          }
        }
      },
      getGroupUser() {
        // 查找圈子用户列表
        let req = {
          "serviceName": "srvhealth_person_group_circle_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "gc_no",
            "ruleType": "eq",
            "value": this.groupNo
          }],
        }
        this.$fetch('select', 'srvhealth_person_group_circle_select', req, 'health').then(res => {
          if (res.success) {
            this.groupUser = res.data
            if (!res.data.find(item => item.person_no === this.userInfo.no)) {
              // 未加入当前群
              uni.redirectTo({
                url: `/publicPages/gropDetail/gropDetail?gc_no=${this.groupNo}&pb_no=${this.userInfo.no}&type=group-detail&from=store-detail`
              });
            }
            if (res.data.length > 0) {
              if (this.groupInfo && this.groupInfo.name) {
                this.pageTitle = this.groupInfo.name + `(${res.page.total})`
              } else if (this.storeInfo && this.storeInfo.name) {
                this.pageTitle = this.storeInfo.name + `(${this.storeInfo.user_count})`
              }
              if (this.pageTitle) {
                uni.setNavigationBarTitle({
                  title: this.pageTitle
                })
              }
            }
          }
        })
      },
      async getZtSession() {
        // 专题咨询会话查询
        let req = {
          "serviceName": "srvhealth_dialogue_session_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "session_type",
              "ruleType": "eq",
              "value": '专题咨询'
            },
            {
              "colName": "group_no",
              "ruleType": "eq",
              "value": this.groupNo
            },
            {
              "colName": "store_no",
              "ruleType": "eq",
              "value": this.vstoreUser?.store_no
            },
            {
              "colName": "store_user_no",
              "ruleType": "eq",
              "value": this.store_user_no || this.vstoreUser?.store_user_no
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        let res = await this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health')
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.sessionInfo = res.data[0]
            this.session_no = res.data[0].session_no
            // this.getGroup()
            return res.data[0]
          } else {
            await this.createSession()
          }

        }
      },
      async getSession(condition) {
        // 查找会话信息
        let self = this
        let req = {
          "serviceName": "srvhealth_dialogue_session_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "session_no",
            "ruleType": "like",
            "value": this.session_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          },
        }
        if (condition) {
          req.condition = condition
        }
        let res = await this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health')
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          self.sessionInfo = res.data[0]
          self.session_no = res.data[0].session_no
          switch (self.sessionType) {
            case '店铺机构全员':
              if (self.storeInfo && self.storeInfo.user_count) {
                self.pageTitle =
                  `${self.sessionInfo.session_name || self.storeInfo.name}(${self.storeInfo.user_count})`
              }
              if (self.pageTitle) {
                uni.setNavigationBarTitle({
                  title: self.pageTitle
                })
              }
              break;
            case '群组圈子':
              self.getGroup()
              break;
            case '机构用户客服':
              if (self.identity === '客户') {
                if (!self.receiver_person_no) {
                  self.pageTitle = self.storeInfo.name
                }
              } else if (self.identity === '客服') {
                self.pageTitle = self.sessionInfo.store_user_name
              }
              if (self.pageTitle) {
                // uni.setNavigationBarTitle({
                // 	title: self.pageTitle
                // })
              }
              break;
            case '用户间':

              break;
          }
        } else {
          return false
        }
        return this.sessionInfo
      },
      getStoreUser(no) {
        // 店铺全员群聊 查找当前帐号在店铺人员列表中的数据
        let req = {
          "condition": [{
            "colName": "store_no",
            "ruleType": "eq",
            "value": no || this.storeNo
          }, {
            "colName": "person_no",
            "ruleType": "eq",
            "value": this.userInfo.no
          }]
        }
        this.$fetch('select', 'srvhealth_store_user_select', req, 'health').then(res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            this.storeUserInfo = res.data[0]
            this.store_user_no = this.storeUserInfo.store_user_no
          }
        })
      },
      updateSessionNo() {
        let req = []
        let serviceName = ''
        switch (this.sessionType) {
          case '店铺机构全员':
            // 更新店铺全员会话编码
            serviceName = 'srvhealth_store_mgmt_update'
            req = [{
              "serviceName": serviceName,
              "condition": [{
                "colName": "store_no",
                "ruleType": "eq",
                "value": this.storeNo
              }],
              "data": [{
                "member_session_no": this.session_no
              }]
            }]
            break;
          case '群组圈子':
            serviceName = 'srvhealth_group_circle_update'
            req = [{
              "serviceName": serviceName,
              "condition": [{
                "colName": "gc_no",
                "ruleType": "eq",
                "value": this.groupNo
              }],
              "data": [{
                "session_no": this.session_no
              }]
            }]
            break;
          case '机构用户客服':
            if (this.storeUserInfo && this.storeUserInfo.id && !this.storeUserInfo.kefu_session_no) {
              serviceName = 'srvhealth_store_user_update'
              req = [{
                "serviceName": serviceName,
                "condition": [{
                    "colName": "store_no",
                    "ruleType": "eq",
                    "value": this.storeNo
                  },
                  {
                    "colName": "person_no",
                    "ruleType": "eq",
                    "value": this.userInfo.no
                  }
                ],
                "data": [{
                  "kefu_session_no": this.session_no
                }]
              }]
            }
            break;
          case '用户间':
            serviceName = 'srvhealth_person_relation_update'
            req = [{
              "serviceName": serviceName,
              "condition": [{
                "colName": "row_no",
                "ruleType": "eq",
                "value": this.row_no
              }],
              "data": [{
                "session_no": this.session_no
              }]
            }]
            break;
        }
        if (serviceName && req.length > 0) {
          this.$fetch('operate', serviceName, req, 'health').then(res => {
            if (Array.isArray(res.data) && res.data.length > 0) {
              switch (this.sessionType) {
                case '店铺机构全员':
                  uni.$emit('updateStoreInfo', res.data[0])
                  break;
                case '群组圈子':
                  uni.$emit('updateGroupInfo', res.data[0])
                  break;
                case '机构用户客服':

                  break;
                case '用户间':
                  uni.$emit('updateRelationInfo', res.data[0])
                  break;
              }
            }
          })
        }
      },
      async createSession() {
        let data = {
          "session_type": this.sessionType
        }
        switch (this.sessionType) {
          case '店铺机构全员':
            data.store_no = this.storeNo
            break;
          case '群组圈子':
            data.group_no = this.groupNo
            break;
          case '专题咨询':
            data.group_no = this.groupNo
            data.store_no = this.storeNo || this.storeInfo?.store_no
            data.store_user_no = this.store_user_no || this.storeUser?.store_user_no
            data.store_user_image = this.storeUser?.profile_url
            data.store_person_no = this.userInfo.no
            data.store_user_name = this.userInfo.name
            debugger
            break;
          case '机构用户客服':
            data.person_image_a = this.userInfo.user_image ? this.userInfo.user_image : this.userInfo
              .profile_url
            data.person_name_a = this.userInfo.name || this.userInfo.nick_name
            data.person_no_a = this.userInfo.no
            data.store_no = this.storeNo
            data.store_user_no = this.store_user_no
            data.store_user_name = this.userInfo.name
            data.store_user_image = this.userInfo.user_image ? this.userInfo.user_image : this.userInfo
              .profile_url
            break;
          case '用户间':
            data.person_relation_no = this.row_no
            break;
        }
        let cond = []
        if (data.store_user_no) {
          cond = [{
            "colName": "store_user_no",
            "ruleType": "eq",
            "value": this.store_user_no
          }, {
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeNo
          }]
        }
        if (data.person_relation_no) {
          cond = [{
            "colName": "person_relation_no",
            "ruleType": "eq",
            "value": this.row_no
          }]

        }

        if (data.group_no) {
          cond = [{
            "colName": "group_no",
            "ruleType": "eq",
            "value": this.groupNo
          }]
        }
        if (data?.session_type === '专题咨询') {
          if (data.store_user_no && data.store_no && data.group_no) {
            cond = [{
                "colName": "group_no",
                "ruleType": "eq",
                "value": data.group_no
              },
              {
                "colName": "session_type",
                "ruleType": "eq",
                "value": data.session_type
              },
              {
                "colName": "store_user_no",
                "ruleType": "eq",
                "value": data.store_user_no
              },
              {
                "colName": "store_no",
                "ruleType": "eq",
                "value": data.store_no
              }
            ]
          } else {
            return
          }
        }else if(data?.session_type==='机构用户客服'){
			cond.push({
				"colName": "session_type",
				"ruleType": "eq",
				"value": data.session_type
			})
		}
		
        if (cond.length > 0) {
          let sessionInfo = await this.getSession(cond)
          if (sessionInfo && sessionInfo.session_no) {
            this.updateSessionNo()
            return
          }
        }
        let req = [{
          "serviceName": "srvhealth_dialogue_session_add",
          "condition": [],
          "data": [data]
        }]
        this.$fetch('operate', 'srvhealth_dialogue_session_add', req, 'health').then(res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            this.sessionInfo = res.data[0]
            this.session_no = res.data[0].session_no
            this.updateSessionNo()
          }
        })
      },
      updateKefuSessionLastLookTime(e) {
        // 更新用户最后查看客服会话时间
        let req = [{
          "serviceName": "srvhealth_dialogue_session_update",
          "condition": [{
            "colName": "session_no",
            "ruleType": "eq",
            "value": this.session_no
          }],
          "data": []
        }]
        if (this.identity === '客服') {
          // 客服最后查看会话时间
          req[0].data[0] = {
            kefu_kefu_last_time: e && e.create_time ? e.create_time : this.formateDate('',
              'DateTime')
          }
        } else {
          // 客户最后查看会话时间
          req[0].data[0] = {
            kefu_user_last_time: e && e.create_time ? e.create_time : this.formateDate('',
              'DateTime')
          }
        }
        this.$fetch('operate', 'srvhealth_dialogue_session_update', req, 'health').then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            uni.$emit('updateKefuSessionLastLookTime', res.data[0])
          }
        })
      },
      updateStoreSessionLastLookTime(e) {
        // 更新用户最后查看店铺成员群会话时间
        let req = [{
          "serviceName": "srvhealth_store_user_update",
          "condition": [{
              "colName": "store_no",
              "ruleType": "eq",
              "value": this.storeNo
            },
            {
              "colName": "person_no",
              "ruleType": "eq",
              "value": this.userInfo.no
            }
          ],
          "data": [{
            store_session_sign_in_time: e && e.create_time ? e.create_time : this.formateDate(
              '',
              'DateTime')
          }]
        }]
        this.$fetch('operate', 'srvhealth_store_user_update', req, 'health').then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            uni.$emit('updateStoreSessionLastLookTime', res.data[0])
          }
        })
      },
      getReceiverInfo() {
        if (this.receiver_person_no && this.storeNo) {
          let req = {
            "serviceName": "srvhealth_store_user_select",
            "colNames": ["*"],
            "condition": [{
              "colName": "person_no",
              "ruleType": "eq",
              "value": this.receiver_person_no
            }, {
              "colName": "store_no",
              "ruleType": "eq",
              "value": this.storeNo
            }],
            "page": {
              "pageNo": 1,
              "rownumber": 1
            }
          }
          this.$fetch('select', 'srvhealth_store_user_select', req, 'health').then(res => {
            if (res.success && res.data.length > 0) {
              this.receiverInfo = res.data[0]
              if (this.receiverInfo.person_name || this.receiverInfo.nick_name) {
                uni.setNavigationBarTitle({
                  title: this.receiverInfo.person_name || this.receiverInfo.nick_name
                })
              }
            } else {
              this.receiverInfo = {}
            }
          })
        }
      },
      updateLastLookTime(e) {
        // 更新群组圈子最后查看时间
        if (this.groupInfo && this.pg_no) {
          let url = this.getServiceUrl('health', 'srvhealth_person_group_circle_update', 'operate');
          let req = [{
            serviceName: 'srvhealth_person_group_circle_update',
            condition: [{
              colName: 'pg_no',
              ruleType: 'eq',
              value: this.pg_no
            }],
            data: [{
              latest_sign_in_time: e && e.create_time ? e.create_time : this.formateDate('',
                'DateTime')
            }]
          }];
          this.$http.post(url, req);
          uni.$emit("updateUnread")
        }
      },
      cancelSendGoods() {
        this.showGoodsCard = false
      },
      sendGoods() {
        let serviceName = this.queryOption?.goods_service || 'srvhealth_store_goods_guest_select'
        let app = this.queryOption?.goods_app || "health"
        if (this.$refs.chatInstance?.sendArticle) {
          let data = [{
            ...this.goodsInfo,
            serviceName,
            app
          }]
          this.$refs.chatInstance.sendArticle(data, '商品')
          this.showGoodsCard = false
        }
      },
      getGoodsInfo() {
        let option = this.queryOption;
        let serviceName = option.goods_service || 'srvhealth_store_goods_guest_select'
        let app = option?.goods_app || "health"
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          condition: [],
          colNames: ["*"]
        }
        if (option?.goods_no) {
          req.condition = [{
            colName: option?.goods_no_col || 'goods_no',
            ruleType: 'eq',
            value: option.goods_no
          }]
          this.$http.post(url, req).then(res => {
            if (Array.isArray(res.data.data) && res.data.data.length > 0) {
              let goodsInfo = res.data.data[0]
              this.goodsInfo = goodsInfo
              this.showGoodsCard = true
            }
          })
        }
        // this.$http.post(url, req);
      },
    },
    beforeDestroy() {
      if (this.sessionType === '机构用户客服') {
        this.updateKefuSessionLastLookTime(this.lastMessage)
        uni.$emit("updateUnread")
      } else if (this.sessionType === '店铺机构全员') {
        this.updateStoreSessionLastLookTime(this.lastMessage)
      } else if (this.groupInfo && this.pg_no) {
        // 更新群组圈子最后查看时间
        this.updateLastLookTime(this.lastMessage);
      }
    },
    async onLoad(option) {
      const self = this
      if (option.top_buttons) {
        let top_buttons = option.top_buttons;
        try {
          top_buttons = decodeURIComponent(top_buttons)
        } catch (e) {
          //TODO handle the exception
        }
        try {
          top_buttons = JSON.parse(top_buttons)
        } catch (e) {
          //TODO handle the exception
        }
        if (Array.isArray(top_buttons)) {
          this.top_buttons = top_buttons
        }
      }
      this.setNavBg(this.$store?.state?.app?.theme || 'blue')
      if (option.articleList) {
        try {
          this.articleList = JSON.parse(option.articleList)
          delete option.articleList
        } catch (e) {
          //TODO handle the exception
        }
      }
      this.queryOption = option
      if (option.goods_no) {
        this.goods_no = option.goods_no
        this.getGoodsInfo()
      }
      
      
      if (Array.isArray(this.articleList) && this.articleList.length > 0) {
        uni.showModal({
          title: '发送文章',
          content: `是否发送以下文章:${this.articleList.map(item => item.title).toString()}`,
          success(res) {
            if (res.confirm) {
              if (self.$refs.chatInstance) {
                self.$refs.chatInstance.sendArticle && self.$refs.chatInstance.sendArticle(self
                  .articleList)
              }
            }
          }
        })
      }
      if (option.type) {
        this.sessionType = option.type
      }
      if (option.session_no) {
        this.session_no = option.session_no
      }

      if (option.groupNo) {
        this.groupNo = option.groupNo
        if (option.pg_no) {
          this.pg_no = option.pg_no
        }
      }

      if (option.identity) {
        this.identity = option.identity
      }
      if (option.storeNo) {
        this.storeNo = option.storeNo
        await this.getStore()
        if (option.type !== '专题咨询') {
          await this.getStoreUser(option.storeNo)
        }
      }
      
      if (option.store_user_no) {
        this.store_user_no = option.store_user_no
      }
      
      if (option.type === '专题咨询' && option.groupNo) {
        // 专题咨询模式 1（用户）对多（客服、管理人员）
        this.getZtSession()
        return
      }


      if (this.session_no) {
        // 已有会话编号 查找会话信息
        await this.getSession()
      } else {
        // 没有会话编号 创建
        if (option.row_no) {
          // 一对一会话
          this.row_no = option.row_no
          this.getRow()
        }
        this.createSession()
      }



      if (option.receiver_person_no) {
        this.receiver_person_no = option.receiver_person_no
        await this.getReceiverInfo()
      }

      if (option.q) {
        let text = decodeURIComponent(option.q);
        if (text.indexOf('https://wx2.100xsys.cn/joinGroup/') !== -1) {
          let result = text.split('https://wx2.100xsys.cn/joinGroup/')[1];
          this.groupNo = result;
          this.getGroup()
        }
      }

    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    background-color: #f5f5f5;
    clear: both;
    overflow: auto;
    position: relative;
    display: flex;
    flex-direction: column;

    .chart-page {
      flex: 1;
    }
  }

  .util-bar {
    // position: fixed;
    // top: 0;
    background-color: #f5f5f5;
    display: flex;
    justify-content: flex-end;
    border-radius: 0 0 20rpx 20rpx;
    overflow: hidden;
    padding: 10rpx 20rpx;
    top: 0;
    /* #ifdef H5 */
    top: 44px;
    /* #endif */
    width: 100%;
    z-index: 29999;

    &.absolute {
      position: absolute;
      top: 0;
    }

    .util-item {
      display: flex;
      justify-content: center;
      align-items: center;
      // background-color: #fff;
      // border-radius: 10px;
      padding: 8px 10px;

      &+.util-item {
        margin-left: 5px;
        // border-left: 1rpx solid #eee;
      }

      .icon {
        width: 40rpx;
        height: 40rpx;
        // border-radius: 50%;
        color: #333;
        line-height: 40rpx;
        text-align: center;
        font-size: 40rpx;
        margin-right: 5px;
      }

      .label {
        // color: #999;
        // margin-top: 10rpx;
        font-size: 28rpx;
        // margin-left: 5px;
      }
    }
  }

  .goods-card {
    width: calc(100% - 40rpx);
    // height: 150px;
    margin: 10rpx auto;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    position: absolute;
    left: 20rpx;
    z-index: 10;
    top: 0;

    .goods-card-content {
      display: flex;

      .goods-img {
        width: 200rpx;
        height: 200rpx;
        border-radius: 10rpx;
      }

      .goods-info {
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin-left: 20px;

        .title {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          font-weight: bold;
        }

      }
    }

    .goods-card-footer {
      text-align: center;
      border-top: 1rpx solid #f1f1f1;
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
