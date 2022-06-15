<template>
  <view class="list-wrap">
    <view class="cu-list">
      <view class="cu-item" v-for="(item,index) in sessionList" :key="item.session_no" @click="toChat(item)">
        <view class="cu-avatar" :style="[{backgroundImage:'url('+getProfile(item)+')'}]">
          <view class="unread" v-if="item.client_unread_num&&identity==='客户'">
            {{item.client_unread_num}}
          </view>
          <view class="unread" v-else-if="item.master_unread_num&&identity!=='客户'">
            {{item.master_unread_num}}
          </view>
          <view class="" v-else>
            <view class="cu-tag badge" v-if="item.kefu_kefu_unread_msg">
              {{item.kefu_kefu_unread_msg}}
            </view>
            <view class="cu-tag badge-left" v-if="item.kefu_kefu_unack_msg">
              {{item.kefu_kefu_unack_msg}}
            </view>
          </view>
        </view>
        <view class="content">
          <view class="top">
            <view class="text-black user-name" v-if="identity==='客户'&&session_type==='专题咨询'&&item.group_name">
              {{item.group_name||''}}
            </view>
            <view class="text-black user-name" v-else>{{item.store_user_name||''}}</view>
            <view class="last-time">
              {{formatTime(item.last_msg_time)}}
            </view>
          </view>
          <view class="">
            <view class="msg text-gray">
              {{formatMsg(item)||''}}
            </view>
          </view>
        </view>
      </view>
    </view>
    <uni-load-more :status="more"></uni-load-more>
  </view>
</template>

<script>
  const dayjs = require('dayjs');
  export default {
    data() {
      return {
        identity: "",
        storeNo: '',
        session_type: "",
        store_user_no: "",
        groupNo: "", //专题咨询编码
        sessionList: [],
        page: {
          pageNo: 1,
          rownumber: 40,
          total: 0
        },
        more: 'more', //more,loading,noMore
      };
    },
    methods: {
      getProfile(item) {
        if (this.identity === '客户') {
          return ''
        }
        let str = item.store_user_profile || item.store_user_image
        if (str) {
          return this.getImagePath(str, true)
        }
      },
      formatUnread(num) {
        if (isNaN(Number(num))) {
          return ''
        } else {
          if (num > 0 && num < 100) {
            return num
          } else {
            return '99+'
          }
        }
      },
      formatMsg(item) {
        let res = '';
        if (['文本'].includes(item.last_msg_content_type)) {
          res = item.last_msg_content || ''
        } else if (item.last_msg_content_type) {
          res = `[${item.last_msg_content_type}]`
        }
        return this.renderEmoji(res)
      },
      formatTime(time) {
        let str = ''
        if (time) {
          if (dayjs().format('YYYY-MM-DD') === dayjs(time).format('YYYY-MM-DD')) {
            // 当天的消息 返回分:秒
            str = dayjs().format("HH:mm")
          } else if (dayjs().subtract(1, 'day').format("YYYY-MM-DD") === dayjs(time).format('YYYY-MM-DD')) {
            str = '昨天'
          } else if (dayjs(time).format('YYYY') === dayjs().format('YYYY')) {
            str = dayjs(time).format('MM月DD日')
          } else {
            str = dayjs(time).format('YYYY年MM月DD日')
          }
        }
        return str
      },
      toChat(e) {
        this.page.pageNo = 1
        // 跳转到聊天页面
        let url = `/publicPages/chat/chat?storeNo=${this.storeNo}&session_no=${e.session_no}`;
        if (this.groupNo) {
          url += `&groupNo=${this.groupNo}`
        }
        if (this.session_type === '专题咨询') {
          if (this.identity) {
            url += `&identity=${this.identity}`
          } else {
            url += '&identity=经验主'
          }
          if (e?.group_no) {
            url += `&groupNo=${e.group_no}`
          }
        } else {
          url += '&identity=客服'
        }
        if (this.session_type) {
          url += `&type=${this.session_type}&store_user_no=${e.store_user_no}`
        } else {
          url += `&type=${this.session_type}`
        }

        uni.navigateTo({
          url
        })
      },
      getGroup() {
        // 查找专题咨询信息
      },
      getStoreSession(isMore) {
        // 查找此店铺的客服会话列表
        let req = {
          "condition": [{
            "colName": "session_type",
            "ruleType": "in",
            "value": this.session_type || "机构用户客服"
          }, {
            "colName": "store_no",
            "ruleType": "eq",
            "value": this.storeNo
          }, {
            "colName": "msg_count",
            ruleType: 'gt',
            value: 0
          }],
          order: [
            // {
            // 	"colName": "kefu_kefu_unread_msg,kefu_kefu_unack_msg,last_msg_time",
            // 	"orderType": "desc" // asc升序  desc降序
            // },
            // {
            // 	"colName": "kefu_kefu_unread_msg", //客服未读数
            // 	"orderType": "desc" // asc升序  desc降序
            // },
            // {
            // 	"colName": "kefu_kefu_unack_msg", // 客服未回复数
            // 	"orderType": "desc" // asc升序  desc降序
            // },
            // {
            // 	"colName": "last_msg_time",
            // 	"orderType": "desc" // asc升序  desc降序
            // }

            // 	{
            // 		"colName": "last_msg_time",
            // 		"orderType": "desc" // asc升序  desc降序
            // 	},
            // 	{
            // 		"colName": "kefu_kefu_unack_msg", // 客服未回复数
            // 		"orderType": "desc" // asc升序  desc降序
            // 	},
            // 	{
            // 		"colName": "kefu_user_unread_msg", //客服未读数
            // 		"orderType": "desc" // asc升序  desc降序
            // 	}
          ],
          order: [{
            colName: 'last_msg_time',
            orderType: "desc"
          }],
          "page": {
            "pageNo": this.page.pageNo,
            "rownumber": this.page.rownumber
          }
        }

        if (this.store_user_no) {
          req.condition.push({
            colName: 'store_user_no',
            ruleType: 'eq',
            value: this.store_user_no
          })
        }
        if (this.groupNo) {
          req.condition.push({
            colName: 'group_no',
            ruleType: 'eq',
            value: this.groupNo
          })
        }
        this.$fetch('select', 'srvhealth_dialogue_session_select', req, 'health').then(res => {
          if (res.success) {
            if (isMore) {
              this.sessionList = [...this.sessionList, ...res.data];
            } else {
              this.sessionList = res.data
            }
            if (res.page) {
              this.page = res.page;
            }
            if (this.page.total && this.page.total > this.page.rownumber * this.page.pageNo) {
              this.more = 'more';
            } else {
              this.more = 'noMore';
            }
          }
        })
      },
    },

    onLoad(option) {
      uni.$on('updateKefuSessionLastLookTime', () => {
        this.getStoreSession()
      })
      if (option.identity) {
        this.identity = option.identity
      }

      if (option.sessionType || option.session_type) {
        this.session_type = option.sessionType || option.session_type
      }

      if (option.groupNo) {
        this.groupNo = option.groupNo
      }
      if (option.store_user_no) {
        this.store_user_no = option.store_user_no
      }

      if (option.storeNo) {
        this.storeNo = option.storeNo
        this.getStoreSession()
      }
    },
    onPullDownRefresh() {
      this.page.pageNo = 1
      if (this.storeNo) {
        this.getStoreSession()
      }
      setTimeout(() => {
        uni.stopPullDownRefresh()
      }, 1000)
    },
    onReachBottom() {
      if (this.more !== 'noMore') {
        // 加载更多
        this.page.pageNo++;
        this.more = 'loading';
        this.getStoreSession('more');
      } else {
        // 没有更多
        this.more = 'noMore';
      }
    }
  }
</script>

<style lang="scss" scoped>
  .list-wrap {
    min-height: calc(100vh - var(--window-bottom) - var(--window-top) + 10px);
    padding: 20rpx 0;
    background-color: #f8f8f8;
  }

  .cu-list {
    display: flex;
    // flex-wrap: wrap;
    flex-direction: column;

    .cu-item {
      width: 100%;
      // width: 25%;
      padding: 10px 20px;
      margin-bottom: 1px;
      display: flex;
      background-color: #fff;

      // &:hover {
      //   background-color: #F1F1F1;
      // }

      .cu-avatarlg {
        width: 50px;
        height: 50px;
        background-size: contain;
      }

      .badge-left {
        position: absolute;
        background-color: transparent;
        background-color: #f37b1d;
        border-radius: 100px;
        top: -5px;
        left: -10px;
        font-size: 10px;
        padding: 0px 5px;
        height: 14px;
        color: #FFFFFF;
      }

      .cu-avatar {
        position: relative;
        margin-right: 10px;
        border-radius: 5px;
        width: 50px;
        height: 50px;
        background-color: #F1F1F1;

        .unread {
          position: absolute;
          right: -10px;
          top: -5px;
          height: 20px;
          width: 20px;
          text-align: center;
          background-color: #F70000;
          z-index: 2;
          font-size: 12px;
          border-radius: 20px;
          line-height: 20px;
        }
      }

      .content {
        flex: 1;
        padding: 2px 0 2px 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        text-align: left;
        overflow: hidden;
        position: relative;

        .top {
          display: flex;
          align-items: center;

          .user-name {
            flex: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            font-size: 16px;
          }

          .last-time {
            color: #b9b9b9;
            font-size: 12px;
          }
        }

        .last-msg {}
      }
    }
  }
</style>
