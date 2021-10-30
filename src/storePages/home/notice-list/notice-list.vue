<template>
  <view class="notice-wrap" v-if="pageItem&&pageItem.notice_style&&showNoticeBar&&setList&&setList&&setList.length>0">
    <u-notice-bar :mode="mode" :list="setList" :is-circular="false" :more-icon="false" :volume-size="volumeSize"
      :type="theme" :color="color" :duration="duration" @click="clickNotice"></u-notice-bar>
  </view>
  <view class="notice-wrap" :style="[calcStyle]" v-else-if="pageItem&&noticeList&&noticeList.length>0">
    <view class="notice-item" v-for="item in noticeList" :key="item.id" @click="handelClick(item)" :style="{
        'font-size': item.style_config.fontSize,
        'justify-content': item.style_config.align,
        color: item.style_config.color,
        fontWeight: item.style_config.fontWeight,
      }">
      <image :src="getImagePath(item.icon)" mode="aspectFill" class="icon" v-if="item.icon"></image>
      <text class="cuIcon-notice icon text-orange" v-else></text>
      <text> {{ item.label }}</text>
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
      showNoticeBar() {
        return this.pageItem.notice_style == '垂直滚动' || this.pageItem.notice_style == '水平滚动'
      },
      color() {
        return ''
      },
      theme() {
        // primary / info / error / success / none
        return 'primary '
      },
      volumeSize() {
        return 34
      },
      duration() {
        return 3000
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
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
    },
    data() {
      return {
        noticeList: []
      }
    },
    methods: {
      clickNotice(index) {
        let e = this.noticeList[index]
        this.handelClick(e)
      },
      handelClick(e) {
        if (e.target_link) {
          uni.navigateTo({
            url: e.target_link
          })
        } else if (e.content_no) {
          uni.navigateTo({
            url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${e.content_no}`
          })
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
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 10
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
          this.noticeList = res.data.map(item => {
            item.label = item.label || item.title
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
    mounted() {
      console.log(this.pageItem)
      this.getList()
    }
  }
</script>

<style scoped lang="scss">
  .notice-wrap {
    /* margin-bottom: 20rpx; */
    min-width: 335px;
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

  }

  .notice-item:last-child {
    border-bottom: none;
  }

  .notice-item .icon {
    width: 50rpx;
    height: 50rpx;
    font-size: 50rpx;
    align-items: center;
    line-height: 50rpx;
    margin-right: 20rpx;
  }
</style>
