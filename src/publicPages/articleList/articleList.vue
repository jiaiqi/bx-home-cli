<template>
  <view class="list-wrap">
    <view class="tab-list">
      <scroll-view scroll-x class="nav" scroll-with-animation :scroll-left="scrollLeft" v-if="mode==='multi'">
        <view class="cu-item" :class="index == current ? 'text-green cur' : ''" v-for="(item, index) in cateList"
          :key="index" @tap="changeTab(index)">
          <text class="tab-title">{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="content news-list">
      <news-item :item="item" v-for="(item, noticeIndex) in  articleList" :key="noticeIndex"></news-item>
    </view>

    <view class="" style="margin-top: 30vh">
      <u-empty text="数据为空" mode="list" v-if="loadStatus === 'noMore' && articleList.length === 0">
      </u-empty>
      <uni-load-more :status="loadStatus" v-if="
          loadStatus !== 'noMore' ||
          (loadStatus === 'noMore' && articleList.length !== 0)
        "></uni-load-more>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <view class="news-item" style="margin-top: 200rpx" v-if="articleList && articleList.length > 0">
      <ad-custom unit-id="adunit-5816ffb522d52580" style="width: 100%"></ad-custom>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
  export default {
    data() {
      return {
        scrollLeft: 0,
        current: 0,

        cateList: [], //栏目列表
        mode: "single", // multi-多栏目 single 单栏目 默认单栏目 只查传入的栏目编号下的文章
        cateNo: '', // 栏目编号
        cate_name: '',
        articleList: [],
        storeNo: '',
        storeName: "",
        shareLogo: "",
        condition: [], // 查询条件
        loadStatus: 'noMore', //more,loading,noMore
        page: {
          total: 0,
          rownumber: 10,
          pageNo: 1
        }
      }
    },
    methods: {
      changeTab(e) {
        this.current = e
        this.scrollLeft = (e - 1) * 60
        this.initList()
        // this.articleList = this.cateList[this.current] ? this.cateList[this.current].list : []
      },
      async getListData(type = 'refresh') {
        if (type === 'refresh') {
          this.page.pageNo = 1
        }
        let req = {
          condition: this.condition,
          // order: [{
          // 		colName: 'seq',
          // 		orderType: "asc"
          // 	},
          // 	{
          // 		colName: "create_time",
          // 		orderType: "desc"
          // 	}
          // ],
          page: {
            pageNo: this.page.pageNo,
            rownumber: this.page.rownumber
          },
          serviceName: "srvdaq_cms_content_select"
        }


        if (this.mode === 'multi') {
          let curTab = this.cateList[this.current]
          if (curTab?.no) {
            req.condition = [{
                "colName": "no",
                "ruleType": "eq",
                "value": curTab.no
              },
              {
                "colName": "content_status",
                "ruleType": "eq",
                "value": "发布"
              }
            ]
          }
        }
        this.loadStatus = 'loading'
        let res = await this.$fetch('select', 'srvdaq_cms_content_select', req, 'daq')
        if (res.success) {
          let list = []
          if (type === 'refresh') {
            list = res.data
          } else {
            list = [...this.articleList, ...res.data]
          }
          let topList = list.filter(item => item.top_status === '是')
          let statusList = list.filter(item => !!item.other_status && item.top_status !== '是')
          let normalList = list.filter(item => !item.other_status && item.top_status !== '是')
          this.articleList = [...topList, ...statusList, ...normalList]

          if (res.page) {
            if (res.page.total > res.page.rownumber * res.page.pageNo) {
              this.loadStatus = 'more'
              this.page.pageNo++
            } else {
              this.loadStatus = 'noMore'
            }
          }
        }
      },
      async getTabs(e) {
        let req = {
          "serviceName": "srvdaq_cms_category_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "parent_no",
            "value": this.cateNo,
            "ruleType": "eq"
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 999
          }
        };
        const cate = await this.$fetch('select', 'srvdaq_cms_category_select', req, 'daq')
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
          this.cateList = types;
          return
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

      },
      toArticle(e) {
        if (e.content_no) {
          let url =
            `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${e.content_no}`
          if (this.storeInfo && this.storeInfo.name) {
            url += `&store_name=${this.storeInfo.name}`
          }
          if (this.storeNo) {
            url += `&store_no=${this.storeNo}`
          }
          if (this.storeName) {
            url += `&store_name=${this.storeName}`
          }
          if (this.shareLogo) {
            url += `&logo=${this.shareLogo}`
          }
          uni.navigateTo({
            url: url
          });
        }
      },
      async initList(e) {
        if (this.mode === 'single') {
          await this.getListData(e)
        } else if (this.mode == 'multi') {
          await this.getTabs(e)
          // if(curTab?.)
          await this.getListData(e)
        }
      },
    },
    onPullDownRefresh() {
      this.initList().then(_ => {
        uni.stopPullDownRefresh()
      })
    },
    onReachBottom() {
      if (this.loadStatus !== 'noMore') {
        this.initList('loadmore')
      }
    },
    onLoad(option) {
      if (option.mode) {
        this.mode = option.mode
      }
      if (option.cate_name) {
        this.cate_name = option.cate_name
        uni.setNavigationBarTitle({
          title: option.cate_name
        })
      }
      if (option.cateNo) {
        this.cateNo = option.cateNo
        this.initList()
      }
      if (option.store_no) {
        this.storeNo = option.store_no
      }
      if (option.logo) {
        this.shareLogo = decodeURIComponent(option.logo)
      }
      if (option.store_name) {
        this.storeName = option.store_name
      }
      if (option.condition) {
        this.condition = JSON.parse(option.condition)
      }
      if (Array.isArray(this.condition) && this.cateNo) {
        this.condition.push({
          colName: 'no',
          ruleType: 'eq',
          value: this.cateNo
        })
      }
      if (Array.isArray(this.condition)) {
        this.condition.push({
          colName: 'content_status',
          ruleType: 'eq',
          value: '发布'
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .list-wrap {
    // 简介
    margin-bottom: 20rpx;
    padding: 20rpx;
    min-height: calc(100vh - var(--window-top) - var(--window-bottom));
    background-color: #fff;

    .tab-list {
      // padding: 20rpx;
      margin-bottom: 10px;

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

      .cur {
        .tab-title {
          color: #333;
          font-size: 36rpx;
          font-weight: 900;
        }
      }

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

      .news-item {
        display: flex;
        padding: 10px;
        // margin-bottom: 5px;
        border-radius: 5px;
        border-bottom: 1rpx solid #f1f1f1;
        align-items: center;
        background-color: #fff;

        .title-text {
          width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          // white-space: nowrap;
          font-size: 32rpx;

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
            word-break: keep-all;
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
            padding-bottom: 10px;
          }

          .date {
            font-size: 12px;
          }
        }

        &.layout-center-single-image,
        &.layout-center-single-image-top {
          flex-direction: column-reverse;
          // border-radius: 10rpx;
          padding: 0;
          // border: none;
          overflow: hidden;
          // box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
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
