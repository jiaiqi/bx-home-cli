<template>
  <view class="notice-wrap" :style="[calcStyle]" v-if="pageItem&&pageItem.notice_style==='列表'">
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
  <view class="notice-wrap" v-else-if="pageItem&&setList">
    <u-notice-bar :mode="mode" :list="setList" :is-circular="false" :more-icon="false" 
      :volume-size="volumeSize" :type="theme" :color="color" :duration="duration"
      @click="clickNotice"
      ></u-notice-bar>
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
          return this.noticeList.map(item => item.label)
        }
      },
      mode() {
        if (this.pageItem.notice_style === '垂直滚动') {
          return 'horizontal'
        } else if (this.pageItem.notice_style === '水平滚动') {
          return 'vertical'
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
        debugger
        let e = this.noticeList[index]
        this.handelClick(e)
      },
      handelClick(e) {
        if (e.target_link) {
          uni.navigateTo({
            url: e.target_link
          })
        }
      },
      async getList() {
        if (!this.pageItem || !this.pageItem.component_no) {
          return
        }
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
        let res = await this.$fetch('select', 'srvhealth_store_home_notice_select', req, 'health')
        if (res.success) {
          this.noticeList = res.data.map(item => {
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

<style scoped>
  .notice-wrap {
    /* margin-bottom: 20rpx; */
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
