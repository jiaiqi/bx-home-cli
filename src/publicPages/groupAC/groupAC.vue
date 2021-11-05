<template>
  <view class="group-announcement">
    <cu-custom bgColor="bg-blue" :isBack="true" @onBack="onBack">
      <block slot="backText">返回</block>
      <block slot="content">群公告</block>
      <block slot="right" v-if="isAdmin">
        <text class="cuIcon-post" style="font-size: 40rpx" @click="showEditor">
        </text>
      </block>
    </cu-custom>
    <view
      class="current-notice"
      @click="showEditor(item)"
      v-for="item in noticeList"
      :key="item.id"
    >
      <view class="text-area">
        <view class="content">
          {{ html2text(item.msg_content) }}
        </view>
        <view class="post-time">
          <text class="margin-right-sm"> {{ item.sender_name }}</text>
          <text>
            {{ dayjs(item.create_time).format("YYYY年MM月DD日 HH:mm") }}
          </text>
        </view>
      </view>
    </view>
    <view
      class="cu-modal bottom-modal"
      v-if="modalName === 'RichEditor'"
      :class="{ show: modalName === 'RichEditor' }"
      @click="hideModal"
    >
      <view class="cu-dialog" @tap.stop="">
        <jin-edit
          :html="currentNotice.msg_content"
          @editOk="saveRichText"
          :form-data="uploadFormData"
          :header="reqHeader"
          :uploadFileUrl="uploadUrl"
          ref="richEditor"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      storeUserInfo:state=>state.user.storeUserInfo
    }),
    isAdmin(){
      return this.storeUserInfo?.user_role&&this.storeUserInfo?.user_role.indexOf('管理员')!==-1
    },
    lastNotice () {
      if (this.noticeList.length > 0) {
        return this.noticeList[ 0 ]
      }
    },
    uploadUrl () {
      return this.$api.upload;
    },
  },
  data () {
    return {
      modalName: "",
      session_no: '',
      noticeType: "", //text,richText
      store_no: "",
      store_user_no: "",
      sessionInfo: {},
      noticeList: [], //公告
      pageNo: 1,
      loadStatus: "more",
      reqHeader: {
        bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
      },
      uploadFormData: {
        serviceName: 'srv_bxfile_service',
        interfaceName: 'add',
        app_no: 'health',
        table_name: 'bxhealth_consultation_chat_record',
        columns: 'image'
      },
      textareaValue: "",
      currentNotice: {
        msg_content: ""
      },
      postType: 'add'
    }
  },
  methods: {
    showEditor (cur) {
      if(!this.isAdmin){
        return
      }
      if (this.cur) {
        this.postType = 'update'
      }
      this.currentNotice = cur || {
        msg_content: ""
      }
      this.modalName = 'RichEditor'
    },
    saveRichText (e) {
      // 
      this.currentNotice.msg_content = e.html
      if (e.html && e.html.indexOf('<img') == -1) {
        this.currentNotice.msg_content = e.text
      }
      if (e.isSave) {
        if (this.postType === 'add') {
          this.postNotice()
        } else if (this.postType === 'update') {
          this.updateNotice()
        }
      }
      this.hideModal()
    },
    async updateNotice () {
      if (this.currentNotice?.id) {
        const req = [ {
          "serviceName": "srvhealth_consultation_chat_record_update",
          "condition": [ { "colName": "id", "ruleType": "eq", "value": this.currentNotice.id } ], "data": [ this.currentNotice ]
        } ]
        const res = await this.$fetch('operate', 'srvhealth_consultation_chat_record_update', req, 'health')
        if (res.success) {
          uni.showToast({
            title: '修改成功！',
            icon: 'success',
            mask: true
          })
        }
        this.currentNotice = {
          msg_content: ""
        }
        this.postType = 'add'

        this.getNotice()
      }
    },
    async postNotice () {
      // 发布公告
      const req = [ {
        "serviceName": "srvhealth_consultation_chat_record_add",
        "condition": [],
        "data": [
          {
            "session_no": this.session_no, "store_no": this.store_no, "sender_person_no": this.userInfo.no,
            "sender_account": this.userInfo.userno, "sender_group_role": "管理员",
            "sender_name": this.userInfo.name, "receiver_person_no": "all",
            "receiver_account": "all", "msg_content_type": "公告",
            "msg_content": this.currentNotice.msg_content,
            "sender_profile_url": this.userInfo.user_image || this.userInfo.profile_url,
            attribute: JSON.stringify({
              type: 'remindPerson',
              name: "全体成员"
            })
          } ]
      } ]
      const res = await this.$fetch('operate', 'srvhealth_consultation_chat_record_add', req, 'health')
      this.postType = 'add'
      if (res.success) {
        uni.showToast({
          title: '发布成功！',
          icon: 'success',
          mask: true,
          duration: 2000,
          success: () => {

          }
        })
      }
      this.getNotice()
    },
    async getSession () {
      // 查找会话信息
      let req = {
        "serviceName": "srvhealth_dialogue_session_select",
        "colNames": [ "*" ],
        "condition": [ {
          "colName": "session_no",
          "ruleType": "eq",
          "value": this.session_no
        } ],
        "page": {
          "pageNo": 1,
          "rownumber": 1
        },
      }
      let res = await this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        this.sessionInfo = res.data[ 0 ]
        this.getNotice()
      } else {
        return false
      }
      return this.sessionInfo
    },
    async getNotice (loadType = "refresh") {
      // 查找该会话下的公告
      const req = {
        "serviceName": "srvhealth_consultation_chat_record_select",
        "colNames": [ "*" ],
        "condition": [
          {
            colName: "session_no",
            ruleType: 'eq',
            value: this.session_no
          },
          {
            colName: "msg_content_type",
            ruleType: 'eq',
            value: '公告'
          }
        ],
        "relation_condition": {},
        "page": { "pageNo": this.pageNo, "rownumber": 10 },
        "order": [ {
          colName: "create_time",
          orderType: "desc"
        } ],
        "draft": false,
        "query_source": "list_page"
      }
      this.loadStatus = 'loading'
      const res = await this.$fetch('select', 'srvhealth_consultation_chat_record_select', req, 'health')
      if (res.success) {
        if (loadType === 'refresh') {
          this.noticeList = res.data
        } else {
          this.noticeList = [ ...res.data, this.noticeList ]
        }
        if (res.page.pageNo * res.page.rownumber >= res.page.total) {
          this.loadStatus = 'noMore'
        } else {
          this.loadStatus = 'more'
        }
      } else {
        this.loadStatus = 'more'
      }
    },
    getStore () {
      // 查找店铺信息
    },
    getStoreUser () {
      // 查找当前登录用户在店铺成员中的信息

    },
    hideModal () {
      this.modalName = ''
    },
    onBack () {
      uni.$emit('onBack')
    },
  },

  // 页面周期函数--监听页面加载
  onLoad (option) {
    if (option.session_no) {
      this.session_no = option.session_no
      this.getSession()
    }
    if (option.store_no) {
      this.store_no = option.store_no
    }
    if (option.store_user_no) {
      this.store_user_no = option.store_user_no
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {
    this.pageNo = 1;
    this.getNotice()
    uni.stopPullDownRefresh();
  },
  // 页面处理函数--监听用户上拉触底
  onReachBottom () {
    if (this.loadStatus === 'more') {
      this.pageNo++;
      this.getNotice('loadmore')
    }
  }
};
</script>

<style scoped lang="scss">
.current-notice {
  padding: 20rpx;
  .text-area {
    border-radius: 10rpx;
    padding: 20rpx;
    background-color: #fcfcfc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    .content {
      // height: 120rpx;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 3; /**指定行数*/
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  .post-time {
    font-size: 12px;
    color: #999;
    padding: 20rpx 0 0;
  }
}
</style>
