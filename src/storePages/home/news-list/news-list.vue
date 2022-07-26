<template>
  <view class="list-wrap" v-if="articleStyle === 'break'" :style="[calcStyle]">
    <view class="news" v-for="cate in noticeList" :key="cate.no" v-show="cate.list.length > 0">
      <view class="title">
        <view class="">
          <text class="cuIcon-titles text-blue"></text>
          <text class="text-bold" style="font-size: 16px">{{ cate.name }}</text>
        </view>
        <view class="to-more " @click="toMore(cate)" v-if="cate.total > rownumber">
          <text> 更多 </text>
          <text class="cuIcon-right"></text>
        </view>
      </view>
      <view class="content news-list">
        <news-item :item="item" v-for="(item, noticeIndex) in cate.list" :key="noticeIndex"></news-item>
      </view>
    </view>
  </view>
  <view class="list-wrap tab-list" v-else>
    <scroll-view scroll-x class=" nav" scroll-with-animation :scroll-left="scrollLeft">
      <view class="cu-item" :class="index == current ? 'text-green cur' : ''" v-for="(item, index) in noticeList"
        :key="index" @tap="changeTab(index)">
        <text class="tab-title">{{ item.name }}</text>
      </view>
    </scroll-view>
    <view class="content news-list">
      <news-item :item="item" v-for="(item, noticeIndex) in list" :key="noticeIndex"></news-item>
      <u-empty v-if="list.length === 0 && loadstatus[current] === 'noMore'" mode="news" text="暂无内容"></u-empty>
      <uni-load-more :status="loadstatus[current]" v-else-if="loadstatus[current] === 'loading'"></uni-load-more>
      <view @click="getTabs()" v-if="loadstatus[current] === 'fail'" :style="{
          display: 'flex',
          'justify-content': 'center',
          padding: '20rpx 0',
        }">
        网络错误,点击进行刷新
      </view>
    </view>
    <view class="to-more  text-center margin-top-xs" @click="toMore(noticeList[current])" v-if="
        noticeList[current] &&
        noticeList[current].total &&
        noticeList[current].total > rownumber
      ">
      <text> 更多 </text>
      <text class="cuIcon-right"></text>
    </view>
  </view>
</template>

<script>
  // 文章列表
  export default {
    data() {
      return {
        loadstatus: ['more', 'more', 'more'],
        current: 0,
        noticeList: [],
        list: [],
        scrollLeft: 0
      }
    },
    computed: {
      hideCreateTime() {
        return this.pageItem?.more_config?.showCreateTime === false
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
    },
    props: {
      rownumber: {
        type: Number,
        default: 3
      },
      // storeInfo: {
      //   type: Object
      // },
      website_no: {
        type: String
      },
      cateNo: {
        type: String
      },
      articleStyle: {
        type: String
      },
      pageItem: {
        type: Object
      }
    },
    watch: {
      cateNo: {
        immediate: true,
        handler(newValue, oldValue) {
          if (this.cateNo) {
            this.getTabs()
          }
        }
      }
    },
    methods: {
      changeTab(e) {
        this.current = e
        this.scrollLeft = (e - 1) * 60
        this.list = this.noticeList[this.current] ? this.noticeList[this.current].list : []
      },
      toMore(e) {
        // if (this.hasNotRegInfo) {
        //   uni.navigateTo({
        //     url: '/publicPages/accountExec/accountExec'
        //   })
        //   return
        // }
        if (e.no) {
          let url = `/publicPages/articleList/articleList?cateNo=${e.no}`
          if (e.name) {
            url += `&cate_name=${e.name}`
          }
          if (this.storeInfo.store_no) {
            url += `&store_no=${this.storeInfo.store_no}`
          }
          if (this.storeInfo && this.storeInfo.name) {
            url += `&store_name=${this.storeInfo.name}`
          }
          if (this.storeInfo.logo) {
            url += `&logo=${encodeURIComponent(this.getImagePath(this.storeInfo.logo, true))}`
          }
          uni.navigateTo({
            url: url
          })
        }
      },
      
      getTabs() {
        let req = {
          "serviceName": "srvdaq_cms_category_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "parent_no",
            "value": this.cateNo,
            "ruleType": "eq"
          },{
            "colName": "display",
            "value": '否',
            "ruleType": "ne"
          }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 999
          }
        };
        this.$fetch('select', 'srvdaq_cms_category_select', req, 'daq').then(cate => {
          if (cate.success && cate.data.length > 0) {
            let types = cate.data.reduce((pre, cur) => {
              let obj = {
                name: cur.cate_name,
                no: cur.no,
                list: []
              }
              pre.push(obj)
              return pre
            }, [])
            let req = []
            if (types.length > 0) {
              types.forEach(type => {
                let obj = {
                  colNames: ["*"],
                  condition: [{
                      colName: 'no',
                      ruleType: 'eq',
                      value: type.no
                    },
                    {
                      colName: 'content_status',
                      ruleType: 'eq',
                      value: '发布'
                    }
                  ],
                  order: [
                    // {
                    // 	colName: 'seq',
                    // 	orderType: "asc"
                    // },
                    // {
                    // 	colName: "create_time",
                    // 	orderType: "desc"
                    // },
                  ],
                  page: {
                    pageNo: 1,
                    rownumber: this.rownumber
                  },
                  serviceName: "srvdaq_cms_content_select"
                }
                req.push(obj)
              })
            }
            this.loadstatus = this.loadstatus.map(status => status = 'loading')
            this.$fetch('multi', 'select', req, 'daq').then(res => {
              if (res.success) {
                res.data.forEach((item, index) => {
                  if (item.state === "SUCCESS") {
                    let topList = item.data.filter(item => item.top_status ===
                      '是')
                    let statusList = item.data.filter(item => !!item
                      .other_status && item.top_status !== '是')
                    let normalList = item.data.filter(item => !item
                      .other_status && item.top_status !== '是')
                    types[index].list = [...topList, ...statusList, ...
                      normalList
                    ]
                    if (item.page && item.page.rownumber) {
                      types[index].total = item.page.total
                      if (item.page.total <= 3) {
                        this.loadstatus[index] = 'noMore'
                      } else {
                        this.loadstatus[index] = 'more'
                      }
                    }
                  }
                })
                this.noticeList = types
                this.changeTab(0)
              } else {
                this.loadstatus = this.loadstatus.map(status => status = 'fail')
              }
            }).catch(err => {
              this.loadstatus = this.loadstatus.map(status => status = 'fail')
            })
          }
        }).catch(err => {
          this.loadstatus = this.loadstatus.map(status => status = 'fail')
        })
      },
      getNotice() {
        let req = {
          condition: [{
              colName: 'website_no',
              ruleType: 'eq',
              value: this.website_no
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
                list: []
              }
              pre.push(obj)
              return pre
            }, [])
            // this.noticeList = types
            let req = []
            if (types.length > 0) {
              types.forEach(type => {
                let obj = {
                  //查询请求1
                  colNames: ["*"],
                  condition: [{
                      colName: 'no',
                      ruleType: 'eq',
                      value: type.no
                    },
                    {
                      colName: 'content_status',
                      ruleType: 'eq',
                      value: '发布'
                    }
                  ],
                  order: [{
                    colName: "top_status",
                    orderType: "desc"
                  }, {
                    colName: "other_status",
                    orderType: "desc"
                  }, {
                    colName: "create_time",
                    orderType: "desc"
                  }],
                  page: {
                    pageNo: 1,
                    rownumber: this.rownumber
                  },
                  serviceName: "srvdaq_cms_content_select"
                }
                req.push(obj)
              })
            }
            this.$fetch('multi', 'select', req, 'daq').then(res => {
              if (res.success) {
                res.data.forEach((item, index) => {
                  if (item.state === "SUCCESS") {
                    types[index].list = item.data
                    // this.$set(this.noticeList, key, types[key])
                  }
                })
                this.noticeList = types
              }
            })
          }
        });
      }
    }
  }
</script>

<style scoped lang="scss">
  .list-wrap {
    margin-bottom: 20rpx;
    min-width: 300px;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }

    .cu-item {
      padding-bottom: 20rpx;

      &.cur {
        position: relative;
        border-bottom: none;

        &::after {
          position: absolute;
          content: '';
          bottom: 0;
          width: 80rpx;
          left: calc(50% - 40rpx);
          height: 6rpx;
          background-color: #6AD8D4;
        }
      }
    }

    &.tab-list {
      // padding: 20rpx;
      margin-bottom: 10px;

      .cur {
        .tab-title {
          color: #333;
          font-size: 36rpx;
          font-weight: 900;
        }
      }

    }

    .news {
      padding: 20rpx;
      margin-bottom: 10px;
    }

    .title {
      font-size: 28rpx;
      font-weight: 700;
      padding: 10rpx 0;
      color: rgb(48, 49, 51);
      display: flex;
      justify-content: space-between;

      .to-more {
        width: 100rpx;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .cuIcon-right {
        font-weight: 200;
      }
    }

    .news-list {
      padding: 20rpx 20rpx 0;
      background: #FAFBFC;
      border-radius: 20rpx;
      color: #333;

      .news-item {
        display: flex;
        padding: 20rpx;
        border-bottom: 1rpx solid #f1f1f1;
        align-items: center;

        &:last-child {
          border-bottom: none;
        }

        .title-text {
          width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          // white-space: nowrap;
          font-size: 32rpx;
          padding-bottom: 20rpx;

          .text-red {
            display: inline-block;
            margin-left: 10rpx;
            font-size: 24rpx;
            position: relative;
            top: -10rpx;
            font-weight: bold;
          }

          .line-red {
            border-radius: 5px;
            margin-left: 10rpx;
            padding: 2px 4px;
            font-size: 12px;
            font-weight: bold;
            border: 1rpx solid #e54d42;
          }
        }

        .content-box {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .date {
          color: #ccc;
        }

        &.none-image {
          // 无图
          flex-direction: column;
          align-items: flex-start;

          .content-box {
            height: auto;
            min-height: 50rpx;
          }

          .title-text {
            font-size: 16px;
            width: 100%;
            white-space: normal;
          }

          .date {
            font-size: 12px;
          }
        }

        &.layout-center-single-image,
        &.layout-center-single-image-top {
          flex-direction: column-reverse;
          padding: 0;
          overflow: hidden;
          margin-bottom: 20rpx;

          .image-icon {
            width: 100% !important;
            height: 200rpx;
          }

          .content-box {
            padding: 10rpx 20rpx;
            width: 100%;
            display: flex;
            flex-direction: row;

            .title-text {
              font-weight: bold;
              margin-left: 0;
              width: calc(100% - 250rpx);
              flex: 1;
            }
          }
        }

        &.layout-center-single-image-top {
          flex-direction: column;
        }

        &.layout-right-image,
        &.layout-left-image {
          // 左图
          flex-direction: row;
          flex-wrap: wrap;

          .content-box {
            min-height: 150rpx;
            width: calc(100% - 250rpx);
          }

          .image-icon {
            width: 200rpx;
            height: 150rpx;
            border-radius: 5px;
          }

          .title-text {
            margin-left: 20rpx;
            flex: 1;
            width: 100%;
          }

          .date {
            margin-left: 20rpx;
          }
        }

        &.layout-right-image {
          // 右图
          flex-direction: row-reverse;

          .title-text {
            margin-left: 0;
          }

          .date {
            margin-left: 0;
          }
        }
      }
    }
  }
</style>
