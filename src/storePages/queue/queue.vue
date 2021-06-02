<template>
  <view class="queue-wrap">
    <view class="queue-content">
      <view class="queue-header">
        <view class="queue-name" v-if="todayQue && todayQue.queue_name">
          {{ todayQue.queue_name || "" }}
        </view>
      </view>
       <view class="que-date" v-if="todayQue && todayQue.queue_date">
            <text>
              {{ dayjs(todayQue.queue_date).format("YYYY-MM-DD") }}
            </text>
            <text> （周{{localDay  }}，今日） </text>
          </view>
      <view class="queue-remark" v-if="todayQue && todayQue.queue_remark">
        <view class="remark-title">说明：</view>
        <view class="remark-content">{{ todayQue.queue_remark }}</view>
      </view>
      <view class="current-number" v-if="todayQue&&todayQue.id">
        <view class="current-number-item"><view class="label">最新叫号：</view><view class="text-red number" v-if="todayQue&&todayQue.cur_no">{{todayQue.cur_no}}</view><view class="text-red number" v-else>未叫号</view></view>
        <view class="current-number-item"><view class="label">排队人数：</view> <view class="text-red number">{{total||0}}人</view></view>
      </view>
      <view class="my-queue" v-if="queInfo ">
      <view class="left">
        <view class=" profile-info">
          <view class="label">
            <image
            class="profile margin-right-xs"
            :src="userInfo.profile_url"
            mode="scaleToFill"
          />
          <view class="margin-right-xs text">
            {{ userInfo.name || userInfo.nick_name || "" }}</view
          >
          </view>
          <!-- <view class="status text-blue value">{{ queInfo.status }}</view> -->
        </view>
           <view class="queue-info">
          <view class="label">排队状态： </view>
          <view class="value text-blue">{{ queInfo.status }}</view>
          <!-- <view class="status text-blue">{{ queInfo.status }}</view> -->
        </view>
        <view class="queue-info">
          <view class="label">我的排号： </view>
          <view class="value text-blue">{{ queInfo.seq }}</view>
          <!-- <view class="status text-blue">{{ queInfo.status }}</view> -->
        </view>

        <view class="queue-info" v-if="queInfo.status === '排队中'">
          <view class="label">前面等待人数：  </view>
          <text class="value text-blue">{{ waitAmount }}<text class="status text-blue margin-right">人</text></text>
        </view>
        <view
          class="queue-info"
          v-if="waitAmount && todayQue && todayQue.avg_wait_time"
        >
          <view class="label">预估等待： </view>
          <text class="value text-blue">{{
            waitAmount * todayQue.avg_wait_time
          }}<text class="status text-blue">分钟</text></text>
          
        </view>
      </view>
    </view>
      <view
        class="que-button"
        v-if="
          (!queInfo || (queInfo&&queInfo.status!=='排队中'&&queInfo&&queInfo.status!=='叫号中')) &&
          todayQue &&
          todayQue.id &&
          todayQue.queue_status === '进行中'
        "
      >
        <button class="button cu-btn bg-cyan light" @click="startQue">
          抽号
        </button>
      </view>
      <view
        class="que-button"
        v-else-if="
          todayQue && todayQue.id && todayQue.queue_status === '进行中'
        "
      >
        <view class="tip" v-if="todayQue && todayQue.refreshTime"
          >刷新时间：{{ todayQue.refreshTime }}</view
        >
        <button class="button cu-btn bg-cyan light" @click="getTodayQueueInfo">
          <text class="cuIcon-refresh margin-right-xs"></text> 刷新
        </button>
      </view>
    </view>
    <view class="margin-tb">
      <ad
        unit-id="adunit-27e9d9a7b00e4f6a"
        ad-type="video"
        ad-theme="white"
        v-if="todayQue && todayQue.id && queStatus"
      ></ad>
    </view>
    <view class="cu-modal" :class="{'show':modalName==='realname'}" @click="hideModal" @touchmove.prevent>
			<view class="cu-dialog" @click.stop>
				<!-- 实名登记信息 -->
				<view class="modal-title text-bold text-cyan bg-white">
					请先完善实名信息
				</view>
				<form class="realname-form">
					<view class="cu-form-group">
						<view class="title">姓名</view>
						<input placeholder="请输入您的真实姓名" name="input" v-model="formModel.customer_name"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">身份证号</view>
						<input placeholder="请输入您的身份证号" name="input" type="idcard" v-model="formModel.id_no"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">出生日期</view>
						<picker mode="date" v-model="formModel.customer_birth_day" start="1930-09-01" end="2022-09-01"
							@change="DateChange">
							<view class="picker birthday">
								{{formModel.customer_birth_day||'请选择'}}
							</view>
						</picker>
					</view>
					<view class="cu-form-group">
						<view class="title">手机号码</view>
						<text v-if="!formModel.phone_xcx">点击右侧按钮获取手机号</text>
						<input placeholder="请先授权获取手机号" name="input" type="number" v-model="formModel.customer_phone"
							v-else></input>
						<view class="cu-capsule radius" v-if="!formModel.phone_xcx">
							<button class="cu-tag bg-blue" type="primary" open-type="getPhoneNumber"
								@getphonenumber="decryptPhoneNumber">
								获取手机号
							</button>
						</view>
					</view>
				</form>
				<view class="bg-white tip text-red" v-if="tip">
					{{tip}}
				</view>
				<view class="button-box">
					<button type="primary" class="cu-btn bg-blue" @click="updateUserInfo">确定</button>
				</view>
			</view>
		</view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
let timer = null
export default {
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      subscsribeStatus: state => state.app.subscsribeStatus,

    }),
    queStatus () {
      if (!this.queInfo) {
        return '未抽号'
      } else if (this.queInfo?.status) {
        return this.queInfo.status
      }
    },
    curWaitAmount () {
      if (Array.isArray(this.queList)) {
        return this.queList.length
      } else {
        return 0
      }
    },
    overWait () {
      // 当前用户后面等待的人数
      if (this.queInfo && this.queInfo.seq && this.lastQueInfo && this.lastQueInfo.seq) {
        if (this.lastQueInfo.seq - this.queInfo.seq > 0) {
          return this.lastQueInfo.seq - this.queInfo.seq
        }
      }
    },
    waitAmount () {
      if (this.queInfo?.seq && this.currentQuer?.seq) {
        let num = this.queInfo.seq - this.currentQuer.seq
        if (num < 0) {
          num = 0
        }
        return num
      } else {
        return 0
      }
    },
    currentQuer () {
      // 队首
      if (this.queList.length > 0) {
        return this.queList[ 0 ]
      }
    },
    localDay () {
      let day = new Date()
      day = day.getDay()
      let result = ''
      switch (day) {
        case 0:
          result = '日'
          break;
        case 1:
          result = '一'
          break;
        case 2:
          result = '二'
          break;
        case 3:
          result = '三'
          break;
        case 4:
          result = '四'
          break;
        case 5:
          result = '五'
          break;
        case 6:
          result = '六'
          break;
      }
      return result
    }
  },
  data () {
    return {
      formModel: {
        id_no: '',
        phone_xcx: '',
        customer_name: "",
        customer_birth_day: "",
        customer_phone: '',
        appoint_remark: ''
      },
      store_no: "",
      queue_no: "",
      todayQue: null,//当日排队信息
      queInfo: null,//当前用户排队信息
      lastQueInfo: null,
      total: 0,//排队人总数
      queList: [],
      storeUser: null,
      fill_batch_no: '',
      setTimer: false,
      modalName: "",
      tip: "",
      onrefresh: false
    }
  },
  methods: {
    hideModal () {
      this.modalName = ''
    },
    DateChange (e) {
      this.formModel.customer_birth_day = e.detail.value
    },
    showRealNameModal () {
      // 显示实名弹框
      this.formModel.customer_name = this.userInfo.name || this.userInfo.nick_name
      this.formModel.customer_phone = this.userInfo.phone
      this.formModel.customer_birth_day = this.userInfo.birthday
      this.formModel.id_no = this.userInfo.id_no
      this.formModel.phone_xcx = this.userInfo.phone_xcx
      this.modalName = 'realname'
    },
    async getTodayQueueInfo () {
      // 查询当日排队信息
      clearInterval(timer)
      timer = setInterval(() => {
        this.getTodayQueueInfo()
      }, 10 * 1000);
      if (this.onrefresh) {
        return
      }
      let req = {
        "serviceName": "srvhealth_store_queue_up_cfg_select", "colNames": [ "*" ],
        "condition": [
          { colName: 'store_no', ruleType: 'eq', value: this.store_no },
          { colName: 'queue_no', ruleType: 'eq', value: this.queue_no },
          { colName: "queue_date", ruleType: 'like', value: this.dayjs().format("YYYY-MM-DD") }
        ],
        "page": { "pageNo": 1, "rownumber": 20 }
      }
      this.onrefresh = true
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_cfg_select', req, 'health')
      this.onrefresh = false
      if (res.success && res.data.length > 0) {
        res.data[ 0 ].refreshTime = this.dayjs().format("HH:mm:ss")
        this.todayQue = res.data[ 0 ]
        uni.setNavigationBarTitle({ title: res.data[ 0 ].queue_name })
        this.getQueList()
        this.getQueInfo()
        this.getLastPerson()
      }
    },
    async updateQueueInfo (no) {
      let req = [ { "serviceName": "srvhealth_store_queue_up_cfg_update", "condition": [ { "colName": "id", "ruleType": "eq", "value": this.todayQue.id } ], "data": [ { last_no: no } ] } ]
      if (no) {
        await this.$fetch('operate', 'srvhealth_store_queue_up_cfg_update', req, 'health')
      }
    },
    async getQueList () {
      // 查找排队列表
      if (this.todayQue && this.todayQue.queue_no) {
        let req = {
          "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ], "condition": [
            { colName: 'status', ruleType: 'eq', value: '排队中' },
            { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no } ], "page": { "pageNo": 1, "rownumber": 30 }
        }
        let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
        this.queList = res.data
        this.total = res.page.total
      }
    },
    async getQueInfo () {
      if (this.todayQue && this.todayQue.queue_no) {
        let req = {
          "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ],
          order: [ {
            colName: "create_time",
            orderType: 'desc'
          } ],
          "condition": [
            { colName: "person_no", ruleType: 'eq', value: this.userInfo.no },
            { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no },
            { colName: "store_no", ruleType: 'eq', value: this.store_no }
          ],
          "page": { "pageNo": 1, "rownumber": 1 }
        }
        let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
        if (res.success && res.data.length > 0) {
          this.queInfo = res.data[ 0 ]
        } else if (res.data.length === 0 && this.fill_batch_no) {
          uni.showModal({
            title: '提示',
            content: '是否自动抽号？',
            showCancel: true,
            success: ({ confirm, cancel }) => {
              if (confirm) {
                this.startQue()
              } else {
                this.queInfo = null
              }
            }
          })
        } else {
          this.queInfo = null
        }
      }

    },
    async getLastPerson () {
      let req = {
        "serviceName": "srvhealth_store_queue_up_record_select", "colNames": [ "*" ],
        "condition": [
          { colName: 'status', ruleType: 'ne', value: '完成' },
          { colName: 'status', ruleType: 'ne', value: '已过号' },
          { colName: "queue_no", ruleType: 'eq', value: this.todayQue.queue_no },
          { colName: "store_no", ruleType: 'eq', value: this.store_no }
        ],
        "order": [
          {
            colName: "create_time",
            orderType: "desc"
          }
        ],
        "page": { "pageNo": 1, "rownumber": 1 }
      }
      let res = await this.$fetch('select', 'srvhealth_store_queue_up_record_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.lastQueInfo = res.data[ 0 ]
      }
    },
    async startQue () {
      // 开始排队
      if (this.todayQue?.queue_length) {
        if (this.total && this.total >= this.todayQue.queue_length) {
          //
          uni.showModal({
            title: '提示',
            content: '当前队伍已满，请稍后再试...',
            showCancel: false,
            confirmText: "好的"
          })

          return
        }
      }
      if (this.todayQue.must_real_name === '是') {
        if (this.userInfo && (!this.userInfo.id_no || !this.userInfo.phone || !this.userInfo.phone_xcx)) {
          this.showRealNameModal()
          return
        }
      }
      if (this.todayQue.must_subscribe === '是') {
        if (!this.subscsribeStatus && this.userInfo.wechat_notice_set !== '是') {
          uni.showModal({
            title: '提示',
            content: '请根据提示关注百想助理公众号，否则无法接收到消息通知，即将跳转到公众号关注引导页面？',
            success (res) {
              if (res.confirm) {
                uni.navigateTo({
                  url: `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent('https://mp.weixin.qq.com/s/Z9o7ZJOtrAsR2Sj7PIIgRQ')}`
                })
              }
            }
          })
          return
        }
      }
      this.$uDebounce.canDoFunction({
        key: "startQue",//基于此值判断是否可以操作，如两个方法传入了同样的key，则会混淆，建议传入调用此事件的方法名，简单好梳理
        time: 3000,//如果传入time字段，则为定时器后，自动解除锁定状态，单位（毫秒）
        success: async () => {//成功中调用应该操作的方法，被锁定状态不会执行此代码块内的方法
          const req = [ {
            "serviceName": "srvhealth_store_queue_up_record_add", "condition": [],
            "data": [
              {
                "queue_no": this.todayQue.queue_no, "queue_name": this.todayQue.queue_name, "status": "排队中",
                nick_name: this.userInfo.nick_name,
                person_name: this.userInfo.person_name,
                person_no: this.userInfo.no,
                profile_url: this.userInfo.profile_url,
                sex: this.userInfo.sex,
                store_user_no: this.storeUser.store_user_no,
                store_no: this.store_no,
                user_account: this.userInfo.userno,
                user_image: this.userInfo.user_image,
                fill_batch_no: this.fill_batch_no || null
              } ]
          } ]
          if (this?.todayQue?.queue_remark) {
            let result = await new Promise((resolve) => {
              uni.showModal({
                title: '提示',
                content: this?.todayQue?.queue_remark,
                confirmText: "知道了",
                success (res) {
                  if (res.confirm) {
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                }
              })
            })
            if (!result) {
              return
            }
          }
          if (this?.todayQue?.activity_no) {

            if (!this.fill_batch_no) {
              uni.redirectTo({
                url: `/questionnaire/index/index?formType=form&activity_no=${this?.todayQue?.activity_no}&status=进行中&from=queue&store_no=${this.store_no}&queue_no=${this.queue_no}`
              });
              return
            }
          }
          const res = await this.$fetch('operate', 'srvhealth_store_queue_up_record_add', req, 'health')
          if (res.success && res.data.length > 0) {
            this.getQueList()
            this.queInfo = res.data[ 0 ]
            // if (this?.todayQue?.id) {
            //   await this.updateQueueInfo(res.data[ 0 ].seq)
            // }
            this.getTodayQueueInfo()
          }
        }
      })
    },
    async getStoreUserInfo () {
      let req = { "serviceName": "srvhealth_store_user_select", "colNames": [ "*" ], "condition": [ { colName: 'person_no', ruleType: 'eq', value: this.userInfo.no }, { colName: 'store_no', ruleType: 'eq', value: this.store_no } ], "relation_condition": {}, "page": { "pageNo": 1, "rownumber": 10 }, "order": [], "draft": false, "query_source": "list_page" }
      let res = await this.$fetch('select', 'srvhealth_store_user_select', req, 'health')
      if (res.success && res.data.length > 0) {
        this.storeUser = res.data[ 0 ]
        return this.storeUser
      } else {
        return false
      }
    },
    async addToStore (invite_user_no) {
      // 添加用户到单位
      let self = this;
      if (!this.userInfo || !this.userInfo.no) {
        await this.toAddPage()
      }

      if (this.authBoxDisplay) {
        return
      }
      let url = this.getServiceUrl('health', 'srvhealth_store_user_add', 'operate');
      let req = [ {
        serviceName: 'srvhealth_store_user_add',
        condition: [],
        data: [ {
          nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
            /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
          profile_url: this.userInfo.profile_url,
          sex: this.userInfo.sex,
          user_account: this.userInfo.userno,
          user_image: this.userInfo.user_image,
          person_name: this.userInfo.name || this.userInfo.nick_name,
          add_url: this.inviterInfo.add_url,
          invite_user_no: invite_user_no,
          store_no: this.store_no,
          person_no: this.userInfo.no,
          user_role: '用户'
        } ]
      } ];
      let res = await self.$http.post(url, req)
      if (res.data.state === 'SUCCESS') {
        return true
      } else {
        uni.showModal({
          title: '提示',
          content: res.data.resultMessage,
          showCancel: false
        });
      }
      // });
    },
    async updateUserInfo () {
      let data = {}
      if (!this.formModel.customer_name || !this.formModel.customer_phone || !this.formModel
        .customer_birth_day || !this.formModel.id_no) {
        //  || !this.formModel.phone_xcx 暂不校验是否填写小程序手机号
        this.tip = '请确认所有实名信息已填写完整'
        return
      }
      this.tip = ''
      if (!this.userInfo.id_no || this.formModel.id_no) {
        data.id_no = this.formModel.id_no
      }
      if (!this.userInfo.phone || this.formModel.customer_phone) {
        data.phone = this.formModel.customer_phone
      }
      if (!this.userInfo.phone_xcx || this.formModel.phone_xcx) {
        data.phone_xcx = this.formModel.phone_xcx
      }
      if (!this.userInfo.birthday || this.formModel.customer_birth_day) {
        data.birthday = this.formModel.customer_birth_day
      }
      if (this.formModel.customer_name || this.formModel.customer_name) {
        data.name = this.formModel.customer_name
      }
      let req = [ {
        "serviceName": "srvhealth_person_info_real_identity_update",
        "condition": [ {
          "colName": "id",
          "ruleType": "eq",
          "value": this.userInfo.id
        } ],
        "data": [ data ]
      } ]
      let res = await this.$fetch('operate', 'srvhealth_person_info_real_identity_update', req, 'health')
      this.hideModal()
      if (res.success) {
        if (Array.isArray(res.data) && res.data.length > 0) {
          let info = res.data.find(item => item.no === this.userInfo.no)
          if (info && info.no) {
            this.$store.commit('SET_USERINFO', info)
          } else if (res.data[ 0 ].no) {
            uni.setStorageSync('cur_user_no', res.data[ 0 ].no)
            this.$store.commit('SET_USERINFO', res.data[ 0 ])
          }
          return info
        }
      }
    },
    async decryptPhoneNumber (e) {
      // 解密手机号信息
      try {
        let sessionStatus = await wx.checkSession()
      } catch (err) {
        // session_key 已经失效， 需要重新执行登录流程
        if (err) {
          uni.showToast({
            title: err,
            icon: false
          })
        }
        await this.toAddPage()
      }

      if (e.detail && e.detail.errMsg && e.detail.errMsg.indexOf('ok') !== -1) {
        let url = this.getServiceUrl('wx', 'srvwx_app_data_decrypt', 'operate')
        let req = [ {
          data: [ {
            encryptedData: e.detail.encryptedData,
            signature: e.detail.iv
          } ],
          serviceName: 'srvwx_app_data_decrypt'
        } ]
        let res = await this.$http.post(url, req);
        if (res.data.resultCode === 'SUCCESS' && Array.isArray(res.data.response) && res.data.response
          .length > 0 && res.data.response[ 0 ].response && res.data.response[ 0 ].response.phoneNumber) {
          this.formModel.phone_xcx = res.data.response[ 0 ].response.phoneNumber
          this.formModel.customer_phone = res.data.response[ 0 ].response.phoneNumber
        } else {
        }
      }
    },
  },
  created () {
    uni.$on('backFromWebview', () => {
      this.checkSubscribeStatus()
    })
  },
  // 页面周期函数--监听页面加载
  async onLoad (option) {
    this.checkOptionParams(option);
    if (option.fill_batch_no) {
      this.fill_batch_no = option.fill_batch_no
    }
    if (option.store_no && option.queue_no) {
      await this.toAddPage()
      this.store_no = option.store_no
      this.queue_no = option.queue_no
      let storeUser = await this.getStoreUserInfo()
      if (!storeUser) {
        await this.addToStore()
        // let result =
        await this.getStoreUserInfo()
        // if (!result) {
        //   await this.addToStore()
        //   return
        // }
      }
      this.getTodayQueueInfo()
      clearInterval(timer)
      timer = setInterval(() => {
        this.getTodayQueueInfo()
      }, 10 * 1000);
    }
  },
  onUnload () {
    clearInterval(timer)
  },
  beforeDestroy () {
    clearInterval(timer)
  },
  onHide () {
    clearInterval(timer)
  },
  onShow () {
    if (this.store_no && this.queue_no) {
      clearInterval(timer)
      timer = setInterval(() => {
        this.getTodayQueueInfo()
      }, 5000);
    }
  },
  onShareAppMessage () {
    let path = `/storePages/queue/queue?store_no=${this.store_no}&queue_no=${this.queue_no}`
    if (this.userInfo && this.userInfo.userno) {
      path += `&invite_user_no=${this.userInfo.userno}`
    }
    return {
      path,
      title: this?.todayQue?.queue_name || '排队邀请'
    }
  },
  // 页面处理函数--监听用户下拉动作
  onPullDownRefresh () {

    this.getTodayQueueInfo()
    uni.stopPullDownRefresh();
  },
};
</script>

<style scoped lang="scss">
.queue-wrap {
  text-align: center;
  // background-color: #f1f1f1;
  padding-top: 20px;
  margin-bottom: 30rpx;
  .queue-content {
    min-height: 80vh;
    overflow: auto;
  }
}
.current-number {
  padding: 20rpx;
  border-radius: 20rpx;
  margin: 20px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  font-size: 16px;
  .current-number-item {
    display: flex;
    width: 100%;
  }
  .label {
    flex: 1;
    // min-width: 130px;
    text-align: left;
  }
  .number {
    flex: 1;
    text-align: left;
    font-size: 24px;
    font-weight: bold;
  }
}
.queue-header {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;

  .right {
    .profile {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
  }
}
.queue-name {
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}
.que-date {
  text-align: left;
  padding: 0 20px;
  color: #666;
  font-size: 18px;
}
.queue-remark {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  color: #666;
  font-size: 16px;
  // background-color: #f9f9f9;
  margin: 10rpx 20rpx;
  align-items: flex-start;
  .remark-content {
    padding: 10rpx 0;
    min-height: 50px;
    height: auto;
    text-align: left;
  }
}
.queue-card {
  padding: 20rpx;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  .card-item {
    padding: 20rpx;
    width: 150px;
    height: 150px;
    background-color: #deebf7;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:first-child {
      margin-right: 20px;
    }
    .card-label {
      margin-bottom: 10px;
      font-weight: bold;
    }
    .card-content {
      font-size: 50px;
      font-weight: bold;
      color: #00b050;
    }
  }
}
.my-queue {
  padding: 20rpx;
  margin: 20px;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  .left {
    flex: 1;
    position: relative;
    padding-top: 30px;
  }
  .right {
    .profile {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
  }
  .profile-info {
    display: flex;
    width: 100%;
    justify-content: center;
    position: absolute;
    top: -10px;
    .label {
      display: flex;
      align-items: center;
      font-size: 18px;
    }
    .profile {
      width: 60rpx;
      height: 60rpx;
      border-radius: 60rpx;
    }
  }
  .queue-info {
    text-align: left;
    display: flex;
    align-items: center;
    font-size: 16px;
    // padding: 10rpx 0;
    justify-content: space-between;
    &.profile-info {
      padding: 0;
      justify-content: flex-start;
      .label {
        display: flex;
        align-items: center;
      }
      .profile {
        width: 60rpx;
        height: 60rpx;
        border-radius: 60rpx;
      }
    }
    .label {
      min-width: 130px;
      flex: 1;
    }
    .value {
      flex: 1;
      font-weight: bold;
      font-size: 24px;
      // color: #00b050;
    }
    .status {
      font-size: 24px;
    }
  }
}
.que-num {
  .font-bold {
    font-weight: bold;
  }
  .num {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    margin-top: 10rpx;
    position: relative;
    .num {
      position: relative;
    }
    .tip {
      font-size: 16px;
      position: absolute;
      right: 50px;
    }
  }
}
.que-card {
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  margin: 20rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  width: calc(100% - 40rpx);
  padding: 20rpx;
  border-radius: 20rpx;
}

.que-button {
  margin: 10rpx auto 30px;
  .tip {
    color: #666;
  }
  .button {
    margin-top: 20rpx;
    padding: 20rpx;
    width: 55%;
    font-size: 20px;
    height: auto;
    font-weight: bold;
  }
}
.cu-timeline {
  .cu-time {
    width: auto;
    padding: 20rpx;
  }
  .timeline-tips {
    color: #e54d42;
    font-weight: bold;
    margin-top: 20rpx;
  }
  .profile-info {
    // width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    // position: absolute;
    // right: 0;
    // top: 0;
    .text {
      font-size: 14px;
      color: #333;
    }
    .profile {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      margin-bottom: 10rpx;
    }
  }
  .card-item {
    padding: 20rpx 20rpx 20rpx 100rpx;
    .content {
      background-color: #deebf7;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      padding: 20rpx;
      flex-wrap: wrap;
      position: relative;
    }

    .label {
      color: #e54d42;
      font-size: 16px;
      display: flex;
      flex-direction: column;
    }
    .value {
      flex: 1;
      width: 100%;
      font-size: 50px;
      color: #00b050;
      font-weight: bold;
      position: relative;
      display: flex;
      justify-content: center;
      &.mr-80 {
        margin-right: 80rpx;
      }
      .value_text {
        flex: 1;
        // margin-left: 80rpx;
        text-align: center;
      }
    }
  }
}
.realname-form {
  text-align: left;

  .cu-form-group {
    .title {
      min-width: 150rpx;
    }
  }
}
</style>
