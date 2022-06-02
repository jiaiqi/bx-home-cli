<template>
  <view class="evaluate-card">
    <view class="title" v-if="loadStatus=='noMore'&&list.length===0">
      <text>暂无评价</text>
    </view>
    <view class="" v-else>
      <view class="title" v-if="showAll===false">
        <text class="text">商品评价<text class="text-sm" v-if="numberShow">({{numberShow||''}})</text> </text>
        <text class="right" @click="toList"><text class="">查看全部 </text> <text
            class="cuIcon-right margin-left-xs"></text>
        </text>
      </view>
      <view class="evaluate-list">
        <view class="evaluate-list-item" v-for="item in list">
          <view class="top">
            <image class="profile" :src="getImagePath(item.person_photo)" mode="aspectFill"></image>
            <view class="center">
              <view class="name">
                <text>
                  {{item.person_name||''}}
                </text>
                <uni-rate :value="Number(item.goods_remark)" :readonly="true" :max="5" :allowHalf="false" />
              </view>
              <view class="time">
                {{item.create_time}}
              </view>
            </view>
            <view class="right">
            </view>
          </view>
          <view class="content">
            {{item.remark}}
          </view>
          <view class="img-list" v-if="item.picFiles&&item.picFiles.length>0">
            <view class="img-list-item" v-for="pic in item.picFiles">
              <image class="img" :src="pic.fileUrl" mode="aspectFill" @click="toPreviewImage(pic.fileUrl)"
                v-if="['jpg','gif','png'].includes(pic.file_type)"></image>
              <video class="img" :src="pic.fileUrl" v-else-if="['mp4'].includes(pic.file_type)"
                :show-center-play-btn="false" :controls="false" @click.stop="toOpenVideo(pic)"></video>
              <text class="cuIcon-playfill icon" v-if="['mp4'].includes(pic.file_type)"
                @click.stop="toOpenVideo(pic)"></text>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more class="load-more" :status="loadStatus" :contentText="loadText" @clickLoadMore="loadMore"
        v-if="showAll&&!order_goods_rec_no">
      </uni-load-more>
      <view class="bottom-button" v-if="showAll===false">
        <button class="cu-btn bg-white sm" @click="toList">查看全部评价</button>
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        loadStatus: 'more',
        page: {
          total: 0,
          rownumber: 2,
          pageNo: 1
        },
        list: [],
        goodsNo: '',
        loadText: {
          contentdown: "上拉或点击加载更多",
          contentrefresh: "正在加载...",
          contentnomore: "没有更多评价了"
        },
      }
    },
    computed: {
      numberShow() {
        let res = ''
        if (this.page?.total > 0) {
          if (this.page.total > 10000) {
            res = '10000+'
          } else if (this.page.total > 1000) {
            res = '1000+'
          } else if (this.page.total > 100) {
            res = '100+'
          } else {
            res = `${this.page.total}`
          }
        }
        return res
      }
    },
    props: {
      showAll: {
        type: Boolean,
        default: false
      },
      rownumber: {
        type: Number,
        default: 2
      },
      goods_no: {
        type: String,
        default: ''
      },
      eval_show_way: {
        type: String,
        default: '全部' //全部、精选
      },
      order_goods_rec_no: { // 订单商品明细编号 查看自己的评价时传入
        type: String
      }
    },
    mounted() {
      if (this.goods_no) {
        this.goodsNo = this.goods_no
        this.page.rownumber = this.rownumber || 2
        this.getData()
      }
    },
    methods: {
      toOpenVideo(e) {
        let {
          fileUrl
        } = e;
        if (fileUrl) {
          uni.navigateTo({
            url: `/otherPages/tVideoPlayer/tVideoPlayer?src=${encodeURIComponent(fileUrl)}`
          })
        }

      },
      async refresh() {
        this.page.pageNo = 1
        this.page.rownumber = this.rownumber || 2
        this.list = []
        return await this.getData()
      },
      loadMore() {
        if (this.page.total > this.page.rownumber * this.page.pageNo) {
          this.page.pageNo++;
          this.getData()
        } else {
          this.loadStatus = 'noMore'
        }
      },
      async getMediaList(fileNo) {
        let url = this.getServiceUrl('file', 'srvfile_attachment_select', 'select')
        let req = {
          "serviceName": "srvfile_attachment_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "file_no",
            "value": fileNo,
            "ruleType": "in",
          }]
        }
        if (fileNo) {
          let response = await this.$http.post(url, req);
          if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
            return response.data.data
          }
        }

      },
      toList() {
        const url = `/storePages/evaluateList/evaluateList?no=${this.goodsNo}`
        uni.navigateTo({
          url
        })
      },
      async getData() {
        let url = this.getServiceUrl('health', 'srvhealth_store_goods_remark_select', 'select')
        const req = {
          "serviceName": "srvhealth_store_goods_remark_select",
          "colNames": ["*"],
          "condition": [{
              colName: 'goods_no',
              ruleType: 'eq',
              value: this.goodsNo
            },
            {
              colName: 'is_featured',
              ruleType: 'eq',
              value: this.eval_show_way === '全部' ? '否' : '是'
            }
          ],
          "page": {
            "pageNo": this.page.pageNo,
            "rownumber": this.page.rownumber
          },
          // "order": [],
        }
        if (this.order_goods_rec_no) {
          req.condition.push({
            colName: 'order_goods_rec_no',
            ruleType: 'eq',
            value: this.order_goods_rec_no
          })
        } else {
          req.condition.push({
            colName: 'audit_state',
            ruleType: 'eq',
            value: '审核通过'
          })
        }
        this.loadStatus = 'loading'
        const res = await this.$http.post(url, req)
        this.loadStatus = 'more'
        if (res?.data?.state === 'SUCCESS' && Array.isArray(res.data?.data)) {
          this.page = res.data.page
          let resData = res.data.data;
          let fileNo = resData.filter(item => item.picture).map(item => item.picture).toString()
          if (fileNo) {
            let files = await this.getMediaList(fileNo)
            resData = resData.map(item => {
              let picFiles = files.filter(e => e.file_no === item.picture)
              if (files.length > 5) {
                files = files.slice(0, 5)
              }
              item.picFiles = picFiles.map(e => {
                e.fileUrl =
                  `${this.$api.getFilePath}${e.fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
                return e
              })
              return item
            })

          }
          if (this.page.pageNo > 1) {
            this.list = [...this.list, ...resData]
          } else {
            this.list = resData
          }
          let {
            total,
            pageNo,
            rownumber
          } = res.data.page
          if (total && pageNo && rownumber) {
            this.loadStatus = pageNo * rownumber >= total ? 'noMore' : 'more'
          }else if(total===0&&pageNo===1){
            this.loadStatus = 'noMore'
          }
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  @import '@/common/css/mixin/text-overflow.scss';

  .evaluate-card {
    background-color: #fff;
    padding: 14px 20px;
    margin-bottom: 10px;

    .title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .text {
        font-size: 16px;
      }

      .right {
        font-size: 12px;
      }
    }
  }

  .evaluate-list {
    margin-top: 10px;

    .evaluate-list-item {
      border-top: 1rpx solid #f8f8f8;
      padding: 10px 0;

      &:last-child {
        padding-bottom: 0;
      }

      .top {
        display: flex;
        margin-bottom: 5px;

        .profile {
          width: 70rpx;
          height: 70rpx;
          border-radius: 50%;
          margin-right: 10px;
        }


        .center {
          flex: 1;

          .name {
            font-weight: 600;
            margin-bottom: 2px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .time {
            font-size: 12px;
            color: #101010;
          }
        }
      }

      .content {
        @include textOverflow(null, 2)
      }
    }
  }

  .bottom-button {
    text-align: center;
  }

  .img-list {
    padding: 5px 0;
    max-height: 150px;
    overflow: hidden;

    .img-list-item {
      width: 70px;
      height: 70px;
      margin-right: 5px;
      display: inline-block;
      position: relative;

      .cuIcon-playfill {
        color: #fff;
        font-size: 40px;
        position: absolute;
        top: calc(50% - 20px);
        right: calc(50% - 20px);
      }

      .img {
        width: 100%;
        height: 100%;
        border-radius: 5px;
      }
    }
  }
</style>
