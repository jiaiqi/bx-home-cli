<template>
  <view class="notice-wrap"
    v-if="pageItem&&pageItem.notice_style&&showNoticeBar&&multiRow&&multiListSimple&&multiListSimple.length>0">
    <u-notice-bar :mode="mode" :list="lists" :is-circular="false" :more-icon="false" :volume-size="volumeSize"
      :type="theme" :color="styleConfig.color" :duration="duration" @click="clickMultiNotice(idx1,$event)"
      v-for="(lists,idx1) in multiListSimple">
      <template v-slot:leftIcon>
        <view style="display: flex;margin: 0;padding: 0;align-items: center;" class=""
          v-if="pageItem&&pageItem.notice_left_icon">
          <image :style="[{width:volumeSize+'rpx',height:volumeSize+'rpx'}]"
            :src="getImagePath(pageItem.notice_left_icon)" mode="aspectFit"></image>
        </view>
      </template>
    </u-notice-bar>
  </view>
  <view class="notice-wrap"
    v-else-if="pageItem&&pageItem.notice_style&&showNoticeBar&&setList&&setList&&setList.length>0">
    <u-notice-bar :mode="mode" :list="setList" :is-circular="false" :more-icon="false" :volume-size="volumeSize"
      :type="theme" :color="color" :duration="duration" @click="clickNotice">
      <template v-slot:leftIcon>
        <view style="display: flex;margin: 0;padding: 0;align-items: center;" class=""
          v-if="pageItem&&pageItem.notice_left_icon">
          <image :style="[{width:volumeSize+'rpx',height:volumeSize+'rpx'}]"
            :src="getImagePath(pageItem.notice_left_icon)" mode="aspectFit"></image>
        </view>
      </template>
    </u-notice-bar>
  </view>
  <view class="notice-wrap" v-else-if="pageItem&&noticeList&&noticeList.length>0">
    <view class="notice-item" v-for="item in noticeList" @click="handelClick(item)" :style="{
        'font-size': item.style_config.fontSize,
        'justify-content': item.style_config.align,
        color: item.style_config.color,
        fontWeight: item.style_config.fontWeight,
      }">
      <image :src="getImagePath(item.icon)" mode="aspectFill" class="icon" v-if="item.icon"></image>
      <text class="cuIcon-notice icon text-orange" v-else></text>
      <text class="label"> {{ item.label }}</text>
    </view>
  </view>

</template>

<script>
  export default {
    props: {
      storeNo: {
        type: String,
        default: ""
      },
      pageItem: {
        type: Object
      }
    },
    computed: {
      customService() {
        return this.pageItem?.notice_list_origin === '自定义服务'
      },
      styleConfig() {
        return this.pageItem?.more_config?.styleConfig || {}
      },
      multiRow() {
        return !isNaN(Number(this.pageItem?.row_number)) && this.pageItem.row_number > 1
      },
      multiListSimple() {
        if (Array.isArray(this.multiList) && this.multiList.length > 0) {
          return this.multiList.map((item) => {
            if (Array.isArray(item) && item.length > 0) {
              item = item.map(e => {
                e = e?.label || e[this.labelCol] || e?.title
                return e
              })
            }
            return item
          })
        }
      },
      multiList() {
        if (this.multiRow) {
          let rownumber = Number(this.pageItem?.row_number);
          let arr = []
          for (let i = 0; i < rownumber; i++) {
            arr.push([])
          }
          if (this.noticeList.length > 0) {
            this.noticeList.forEach((item, index) => {
              arr[index % rownumber].push(item)
            })
          }
          return arr
        }
      },
      showNoticeBar() {
        return this.pageItem.notice_style == '垂直滚动' || this.pageItem.notice_style == '水平滚动'
      },
      color() {
        return ''
      },
      theme() {
        // primary / info / error / success / none
        return this.styleConfig?.theme || 'primary '
      },
      volumeSize() {
        return 34
      },
      duration() {
        return 3000
      },
      setList() {
        if (Array.isArray(this.noticeList)) {
          return this.noticeList.map(item => item.label).filter(item => item && item)
        }
      },
      mode() {
        if (this.pageItem.notice_style === '垂直滚动') {
          return 'vertical'
        } else if (this.pageItem.notice_style === '水平滚动') {
          return 'horizontal'
        }
      },
      reqCfg() {
        return this.pageItem?.more_config?.request_cfg
      }
    },
    data() {
      return {
        noticeList: []
      }
    },
    methods: {
      clickMultiNotice(idx1, idx2) {
        let e = this.multiList[idx1][idx2]
        this.handelClick(e)
      },
      clickNotice(index) {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        let e = this.noticeList[index]
        this.handelClick(e)
      },
      handelClick(e) {
        if (this.hasNotRegInfo) {
          uni.navigateTo({
            url: '/publicPages/accountExec/accountExec'
          })
          return
        }
        if (e.target_link) {
          let url = e.target_link.trim()
          if (e?.type === '直播' && e.target_link.indexOf('plugin-private:') == -1) {
            url = `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${e.target_link}`
          }
          uni.navigateTo({
            url
          })
        } else if (e.content_no) {
          uni.navigateTo({
            url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${e.content_no}`
          })
        }
      },
      async getCustomList() {
        const service = this.reqCfg?.serviceName
        const app = this.reqCfg?.srv_app || uni.getStorageSync('activeApp')
        let data = {
          storeUser: this.vstoreUser,
          userInfo: this.userInfo,
          storeInfo: this.storeInfo
        }
        let condition = this.reqCfg?.condition || []
        if (Array.isArray(condition) && condition.length > 0) {
          condition = condition.map(item => {
            item.value = this.renderStr(item.value, data)
            return item
          })
        }
        const req = {
          "condition": condition,
          "page": {
            "pageNo": 1,
            "rownumber": 1000
          },
          "serviceName": service,
          "colNames": ["*"]
        }

        if (service && app) {
          const url = `/${app}/select/${service}`
          const res = await this.$http.post(url, req);
          if (Array.isArray(res?.data?.data)) {
            this.noticeList = res.data.data.map(item => {
              item.label = item.label || item[this.reqCfg?.labelCol] || ''
              item.label = this.renderStr(item.label, {
                ...this.globalVariable
              })
              return item
            })
          }
        }
      },
      async getList() {
        if (!this.pageItem || !this.pageItem.component_no) {
          return
        }
        let serviceName = 'srvhealth_store_home_notice_select'
        let app = 'health'
        let req = {
          "condition": [{
              "colName": "component_no",
              "ruleType": "eq",
              "value": this.pageItem.component_no
            },
            {
              colName: 'notice_display',
              ruleType: 'eq',
              value: '发布'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 100
          },
        }
        if (this.pageItem?.category_no) {
          serviceName = 'srvdaq_cms_content_select'
          app = 'daq'
          req = {
            "condition": [{
                "colName": "no",
                "ruleType": "eq",
                "value": this.pageItem?.category_no
              },
              {
                colName: 'top_status',
                ruleType: 'eq',
                value: '是'
              }
            ],
            "page": {
              "pageNo": 1,
              "rownumber": 5
            },
          }
        }
        let res = await this.$fetch('select', serviceName, req, app)
        if (res.success) {
          debugger
          this.noticeList = res.data.map(item => {
            item.label = item.label || item.title
            item.label = this.renderStr(item.label, {
              ...this.globalVariable
            })
            if (!item.style_config) {
              item.style_config = {}
            } else if (typeof item.style_config === 'string') {
              try {
                item.style_config = JSON.parse(item.style_config)
              } catch (e) {
                //TODO handle the exception
              }
            }
            return item
          })
        }
      },
    },
    watch: {
      pageItem: {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          if (this.pageItem?.notice_list_origin === '自定义服务') {
            this.getCustomList()
            return
          } else {
            this.getList()
          }
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  .notice-wrap {
    /* margin-bottom: 20rpx; */
    min-width: 300px;
    border-radius: 20rpx;
    overflow: hidden;
    // background-color: #fff;
    color: #333;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }
  }

  .notice-item {
    background-color: #fff;
    border-bottom: 1rpx dashed #f1f1f1;
    padding: 20rpx 40rpx;
    display: flex;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    .label {
      flex: 1;
    }

    .icon {
      width: 25px;
      height: 25px;
      font-size: 25px;
      line-height: 25px;
      margin-right: 10px;
      align-items: center;
    }
  }
</style>
