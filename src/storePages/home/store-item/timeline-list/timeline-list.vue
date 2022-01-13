<template>
  <view class="message-board" :class="{ noMargin: noMargin || !showProfile }">
    <view class="header">
      <view class="head-handler">
        <button
          class="cu-btn"
          @click="toPublish"
          type="primary"
          v-if="showPublish"
        >
          发表
        </button>
      </view>
      <view class="head-profile" v-if="showProfile"
        ><image v-if="profile" :src="getImagePath(profile)" mode="scaleToFill"
      /></view>
    </view>
    <view class="timeline-box">
      <view
        class="no-data"
        v-if="loadStatus === 'noMore' && listData.length === 0"
      >
        暂无数据
      </view>
      <view class="timeline-item" v-for="item in listData" :key="item.id">
        <view class="left">
          <image
            class="left-profile"
            :src="getImagePath(item.profile_url)"
            mode="scaleToFill"
          />
        </view>
        <view class="right">
          <view class="title-text">
            <text class="margin-right-xs">
              {{ item.nick_name }}
            </text>
            <text class="org-name text-yellow sm" v-if="item.org_name"
              >[{{ item.org_name }}]</text
            >
          </view>
          <view class="content"> {{ item.text_desc }}</view>
          <view class="picture-box">
            <img-list
              class="img-list"
              :key="item.photos"
              :fileNo="item.photos"
            ></img-list>
          </view>
          <view class="location text-cyan" v-if="item.user_addr">
            <text class="cuIcon-locationfill margin-right-xs"></text>
            {{ item.user_addr }}
          </view>
          <view class="footer">
            <view class="create-time">
              <text>
                {{ toNow(item.create_time) }}
              </text>

              <text
                class="delete-handler text-red"
                @click="deleteItem(item)"
                v-if="
                  userInfo &&
                  userInfo.userno &&
                  item.user_no &&
                  item.user_no == userInfo.userno
                "
              >
                <text class="cuIcon-delete"></text>
                删除
              </text>
            </view>
            <view class="foot-handle"></view>
          </view>
        </view>
      </view>
      <view
        class="to-more"
        @click="toMore"
        v-if="showMore && loadStatus === 'more' && listData.length > 0"
      >
        <text class="text"><text class="margin-lr">查看更多</text> </text>
      </view>
    </view>
  </view>
</template>

<script>
// 留言板
// import dayjs from '@/static/js/dayjs.min.js'
	const dayjs = require('dayjs');
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    })
  },
  data () {
    return {
      loadStatus: "more",
      listData: []
    }
  },
  props: {
    list: {
      type: Array
    },
    showMore: {
      // 显示更多按钮
      type: Boolean,
      default: false
    },
    showPublish: {
      // 显示发布按钮
      type: Boolean,
      default: true
    },
    loadOutData: {
      type: Boolean,
      default: false
    },
    showProfile: {
      type: Boolean,
      default: true
    },
    limit: {
      // 条数限制
      type: Number,
      default: 10
    },
    noMargin: {
      type: Boolean,
      default: false
    },
    profile: {
      // 个人头像
      type: String,
      default: ''
    },
    activityNo: {
      // 活动编号
      type: String,
      default: ''
    },
    type: {
      // Set：活动、家乡、单位 
      type: String,
      default: '活动'
    },
    condition: {
      type: Array
    },
    order: {
      // Set：活动、家乡、单位 
      type: Array
    },
    srvInfo: {
      type: Object,
      default: () => {
        return {
          serviceName: "srvportal_friends_circle_select",
          appName: "bxportal"
        }
      }
    },
    storeNo: {
      type: String,
      default: ''
    },
  },
  watch: {
    storeNo: {
      immediate: true,

      handler (newValue) {
        if (!this.loadOutData) {
          this.getList()
        }
      }
    },
    list: {
      immediate: true,
      deep: true,
      handler (newValue) {
        if (Array.isArray(newValue) && this.loadOutData) {
          this.listData = newValue
        }
      }
    }
  },
  created () {
    // if (!this.loadOutData) {
    //   this.getList()
    // }
  },
  methods: {
    toMore () {
      let url = '/otherPages/timeline/timeline'
      if (this.storeNo) {
        url = `${url}?storeNo=${this.storeNo}`
      }
      if (this.activityNo) {
        url = `${url}?activityNo=${this.activityNo}`
      }
      uni.navigateTo({ url })
    },
    deleteItem (e) {
      if (e.id) {
        uni.showModal({
          title: '提示',
          content: '确定删除？',
          confirmText: '删除',
          confirmColor: 'red',
          success: ({ confirm, cancel }) => {
            if (confirm) {
              let req = [ { "serviceName": "srvportal_friends_circle_delete", "condition": [ { "colName": "id", "ruleType": "in", "value": e.id } ] } ]
              this.$fetch('operate', 'srvportal_friends_circle_delete', req, 'bxportal').then(res => {
                if (res.success) {
                  this.getList()
                  uni.showToast({
                    title: '操作成功',
                    mask: true
                  })
                } else {
                  uni.showToast({
                    title: res.msg,
                    duration: 3000,
                    icon: 'none',
                    mask: true
                  })
                }
              })
            }
          }
        })
      }

    },
    toNow (e) {
      return dayjs(e).format('MM-DD HH:mm')
      // return dayjs(e).toNow(true)
    },
    toPublish () {
      let pageStack = getCurrentPages()
      let currentPage = ''
      if (Array.isArray(pageStack) && pageStack.length >= 1) {
        currentPage = pageStack[ pageStack.length - 1 ]?.$page?.fullPath
      }
      let url = `/otherPages/publish/publish?fromPage=${encodeURIComponent(currentPage)}`
      if (this.storeNo) {
        url += `&storeNo=${this.storeNo}`
      }
      if (this.activityNo) {
        url += `&activityNo=${this.activityNo}`
      }
      uni.redirectTo({ url })
    },
    getList (...e) {
      if (this.loadOutData) {
        this.$emit('load', e)
        return
      }
      const serviceName = this.srvInfo?.serviceName || 'srvportal_friends_circle_select'
      const appName = this.srvInfo?.appName || 'bxportal'
      let req = {
        "serviceName": serviceName,
        "colNames": [ "*" ],
        "condition": [],
        "page": { "pageNo": 1, "rownumber": this.limit }, "order": this.order
      }
      if (this.activityNo) {
        req.condition.push({
          colName: "act_no",
          ruleType: 'eq',
          value: this.activityNo
        })
      }
      if (Array.isArray(this.condition) && this.condition.length > 0) {
        req.condition = [ ...req.condition, ...this.condition ]
      }
      this.loadStatus = 'loading'
      this.$fetch('select', serviceName, req, appName).then(res => {
        if (res.success) {
          this.listData = res.data
          if (res.page.total > res.page.pageNo * res.page.rownumber) {
            this.loadStatus = 'more'
          } else {
            this.loadStatus = 'noMore'
          }
        } else {
          this.loadStatus = 'more'
        }
      })
    },

  },
}
</script>

<style lang="scss" scoped>
@import "./style.scss";
</style>