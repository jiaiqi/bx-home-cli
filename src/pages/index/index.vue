<template>
  <view>
    <view class="cu-bar fixed search bg-white">
      <view class="search-form">
        <text class="cuIcon-search"></text>
        <input
          @input="searchWithKey"
          type="text"
          placeholder="搜索"
          confirm-type="search"
        />
      </view>
    </view>
    <view class="store-list">
      <view
        class="store-item animation-fade"
        v-for="item in list"
        :key="item.store_no"
      >
        <image
          class="image"
          v-if="item.logo"
          :src="getImagePath(item.logo)"
          mode="aspectFit"
          @tap="toStoreHome(item)"
        ></image>
        <view class="store-desc" @tap="toStoreHome(item)">
          <view class="store-name" v-if="item.name">
            {{ item.name || "" }}
          </view>
          <view class="store-address" v-if="item.address">
            <text> {{ item.address || "" }}</text>
            <text
              class="margin-left-xs cuIcon-locationfill text-blue"
              @tap.stop.prevent="openLocation(item)"
            ></text>
          </view>
        </view>
      </view>
      <!-- <view
        class="store-item animation-fade"
        v-if="list && list.length > 0 && showAd"
      >
        <ad unit-id="adunit-1179c9d61b074e7d"></ad>
      </view> -->
    </view>
    <view class="consult-button text-yellow" @click="toChatBXHeahth">
      <view class="icon">
        <text class="cuIcon-comment"></text>
      </view>
      <view class="label">入驻咨询</view>
    </view>
    <view
      class=""
      style="margin-top: 30vh"
      v-if="loadStatus === 'noMore' && list.length === 0"
    >
      <u-empty text="暂无数据" mode="list"> </u-empty>
    </view>
    <uni-load-more
      :status="loadStatus"
      v-if="
        loadStatus !== 'noMore' ||
        (loadStatus === 'noMore' && list.length !== 0)
      "
    >
    </uni-load-more>
  </view>
</template>

<script>
// 小程序默认入口 展示店铺列表
import {
  wxVerifyLogin,
  selectPersonInfo
} from '@/common/api/login.js'
import {
  mapState
} from 'vuex'
export default {
  computed: {
    ...mapState({
      inviterInfo: state => state.app.inviterInfo,
      wxUserInfo: state => state.user.wxUserInfo,
      isLogin: state => state.app.isLogin,
      authBoxDisplay: state => state.app.authBoxDisplay,
      userInfo: state => state.user.userInfo,
      loginUserInfo: state => state.user.loginUserInfo,
      hasIntoHospital: state => state.app.hasIntoHospital
    })
  },
  data () {
    return {
      showAd: false,
      list: [],
      page: {
        pageNo: 1,
        rownumber: 10,
        total: 0
      },
      loadStatus: 'more', //more,loading,noMore
    }
  },
  methods: {
    searchWithKey (e) {
      this.page.pageNo = 1;
      let key = e.detail.value
      let condition = [
        {
          colName: 'name',
          ruleType: "like",
          value: key
        }
      ]
      this.getList('', condition)
    },
    openLocation (e) {
      if (!e.latitude || !e.longitude) {
        return
      }
      uni.openLocation({
        latitude: Number(e.latitude),
        longitude: Number(e.longitude),
        name: e.name,
        address: e.address,
        success: function () {
          console.log('success');
        },
        fail (err) {
          console.log('err', err);
        }
      });
    },
    async toStoreHome (e) {
      if (!this.userInfo || !this.userInfo.no) {
        let userInfo = await selectPersonInfo()
        if (userInfo && userInfo.no && userInfo.nick_name && userInfo.profile_url) {
          // 已有用户信息
          this.$store.commit('SET_AUTH_USERINFO', true)
          if (!this.$store.state.app.subscsribeStatus) {
            this.checkSubscribeStatus()
          }
          // 自动更新头像昵称
          // this.$store.commit('SET_REGIST_STATUS', false)
          // if (!this.$store.state.app.hasIntoHospital && userInfo.home_store_no) {
          //   uni.redirectTo({
          //     url: '/pages/home/home?store_no=' + userInfo.home_store_no,
          //     success: () => {
          //       this.$store.commit('SET_INTO_HOSPITAL_STATUS', true)
          //     }
          //   })
          // }
        } else {
          await this.toAddPage()
        }
      }
      if (e.store_no) {
        uni.navigateTo({
          animationType: "zoom-fade-out",
          animationDuration: 500,
          url: '/pages/home/home?store_no=' + e.store_no
        })
      }
    },
    async getList (type = 'refresh', cond) {
      // 查找店铺列表
      const serviceName = 'srvhealth_store_list_select'
      let req = {
        "serviceName": serviceName,
        "colNames": [ "*" ],
        "condition": [
          {
            colName: "audit_status",
            ruleType: 'eq',
            value: '正常'
          }
        ],
        "page": {
          "pageNo": this.page.pageNo,
          "rownumber": this.page.rownumber
        },
      }
      if (Array.isArray(cond)) {
        req.condition = [ ...req.condition, ...cond ]
      }
      this.loadStatus = 'loading'
      let res = await this.$fetch('select', serviceName, req, 'health')
      if (res.success && Array.isArray(res.data)) {
        if (res.page) {
          this.page = res.page
          if (res.page.total > res.page.rownumber * res.page.pageNo) {
            this.loadStatus = 'more'
          } else {
            this.loadStatus = 'noMore'
          }
        }
        if (type === 'more') {
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[ index ];
            if (!this.list.find(item => item.store_no === element.store_no)) {
              setTimeout(() => {
                this.list.push(element)
              }, 100);
            }
          }
        } else {
          this.list = []
          res.data.forEach(item => {
            setTimeout(() => {
              this.list.push(item)
            }, 100);
          })
        }
        setTimeout(() => {
          this.showAd = true
        }, 1000);
      }

    },
    async initLogin () {
      let isLogin = this.$store.state.app.isLogin
      if (!isLogin) {
        isLogin = await wxVerifyLogin()
      }
      if (!isLogin) {
        return
      }
      let data = await selectPersonInfo()
      if (data && data.no && data.nick_name && data.profile_url) {
        // 已有用户信息
        this.$store.commit('SET_AUTH_USERINFO', true)
        if (!this.$store.state.app.subscsribeStatus) {
          this.checkSubscribeStatus()
        }
        // 自动更新头像昵称
        this.$store.commit('SET_REGIST_STATUS', false)
        if (!this.$store.state.app.hasIntoHospital && data.home_store_no) {
          uni.redirectTo({
            url: '/pages/home/home?store_no=' + data.home_store_no,
            success: () => {
              this.$store.commit('SET_INTO_HOSPITAL_STATUS', true)
            }
          })
        } else {
          uni.startPullDownRefresh()
        }
      } else {
        this.$store.commit('SET_AUTH_USERINFO', false)
      }
      return
    },
    async toChatBXHeahth () {
      // 跳转到百想健康私聊界面
      let hasUserInfo = await this.toAddPage()
      let storeUserInfo = null
      if (hasUserInfo && this.userInfo && this.userInfo.no) {
        storeUserInfo = await this.getStoreUserInfo()
        if (!storeUserInfo || !storeUserInfo.store_user_no) {
          storeUserInfo = await this.addToStore()
        }
      }
      if (storeUserInfo && storeUserInfo.store_user_no) {
        uni.navigateTo({
          url: `/publicPages/chat/chat?type=机构用户客服&identity=客户&storeNo=S20210204016&store_user_no=${storeUserInfo.store_user_no}`
        })
      }

    },
    async getStoreUserInfo () {
      let url = this.getServiceUrl('health', 'srvhealth_store_user_select', 'select');
      let req = {
        serviceName: 'srvhealth_store_user_select',
        colNames: [ '*' ],
        condition: [ {
          colName: 'person_no',
          ruleType: 'eq',
          value: this.userInfo.no
        }, {
          colName: 'store_no',
          ruleType: 'eq',
          value: 'S20210204016'
        } ]
      };
      let res = await this.$http.post(url, req);
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data[ 0 ];
      }
    },
    async addToStore () {
      // 添加用户到单位
      if (!this.userInfo || !this.userInfo.no) {
        await this.toAddPage()
      }
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
          invite_user_no: this.inviterInfo.invite_user_no,
          store_no: 'S20210204016',
          person_no: this.userInfo.no,
          user_role: '用户',
        } ]
      } ];

      let res = await this.$fetch('operate', 'srvhealth_store_user_add', req, 'health')
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data[ 0 ]
      }
    },
  },
  onPullDownRefresh () {
    this.getList()
    this.loadStatus = 'more'
    this.page.pageNo = 1
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  onReachBottom () {
    if (this.loadStatus !== 'noMore') {
      this.page.pageNo++
      this.getList('more')
    }
  },
  onLoad (option) {
    if (option.store_no) {
      uni.redirectTo({
        url: '/pages/home/home?store_no=' + option.store_no
      })
    } else {
      this.initLogin()
    }
  },
  onShareAppMessage () {
    return {
      title: "百想首页",
    };
  },

}
</script>

<style scoped lang="scss">
@import "@/colorui/animation.css";

.consult-button {
  position: fixed;
  bottom: 50px;
  right: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba($color: #fff, $alpha: 0.9);
  padding: 20rpx;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  z-index: 99;
  width: 150rpx;
  height: 150rpx;
  .icon {
    font-size: 30px;
  }
  .label {
    font-size: 20rpx;
  }
}
.store-list {
  padding: 20rpx;
  margin-top: 50px;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
}

.store-item {
  width: 100%;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  position: relative;
  border: 1rpx solid #f1f1f1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  display: flex;

  .image {
    width: 100px;
    height: 100px;
    padding: 20rpx;
  }

  .store-desc {
    background-color: rgba($color: #fff, $alpha: 0.8);
    padding: 10rpx 20rpx;
    flex: 1;

    .store-name {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10rpx;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /**指定行数*/
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .store-address {
      font-size: 14px;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      /**指定行数*/
      -webkit-box-orient: vertical;
      overflow: hidden;

      .cuIcon-locationfill {
        font-size: 20px;
      }
    }
  }
}
</style>
