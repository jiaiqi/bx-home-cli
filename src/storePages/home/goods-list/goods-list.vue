<template>
  <view class="goods-list-wrap">
    <view class="title" :style="titleStyle" v-if="pageItem && pageItem.show_label === '是'">
      <text>{{ pageItem.component_label || '' }}</text>
      <view class="to-more cu-btn" v-if="hasMore" @click="toMore">
        查看更多
        <text class="cuIcon-right"></text>
      </view>
    </view>
    <view class="goods-list" :style="[calcStyle]">
      <view class="goods-item" v-for="(item,index) in goodsList" @click="toGoodsDetail(item)" :key="index">
        <image class="goods-image" v-if="item[image]" :lazy-load="true" :src="item.url" mode="aspectFill"
          :style="{ height: item.imgHeight + 'px' }"></image>
        <view class="goods-image" v-else>{{ item[name].slice(0, 4) }}</view>
        <view class="goods-info">
          <view class="goods-name">{{ item[name] }}</view>
          <view class="desc">{{ item[desc] }}</view>
          <view class="price text-cyan">
            <text class="symbol">￥</text>
            <text class="number">{{ item[price] }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  /**
   * 商品列表组件
   * @description 商品列表组件
   * @property {Array} list 商品数据
   * @property {String} image 图片字段
   * @property {String} name 商品名字字段
   * @property {String} desc 商品描述字段
   * @property {String} price 商品价格字段
   * @event {Function} toGoodsDetail 跳转到商品详情
   * @example <good-list :list=""></good-list>
   */

  export default {
    name: 'good-list',
    computed: {
      titleStyle() {
        if (typeof this.pageItem?.more_config === 'object') {
          return this.pageItem?.more_config?.titleStyle || '';
        }
      },
      calcStyle() {
        if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
          return {
            margin: this.pageItem.margin
          }
        }
      },
      rownumber() {
        return this.pageItem?.row_number || 6
      },
      hasMore() {
        return this.total > this.rownumber
      },
    },
    data() {
      return {
        goodsList: [],
        pageNo: 1,
        total: 0
      };
    },
    mounted() {
      if (this.storeNo) {
        this.getGoodsListData()
      }
    },
    methods: {
      toMore() {
        let url = `/publicPages/list2/list2?serviceName=srvhealth_store_goods_guest_select&destApp=health`
        let cond = [{
          "colName": "store_no",
          "ruleType": "eq",
          "value": this.storeNo
        }, {
          "colName": "online_state",
          "ruleType": "eq",
          "value": "上线"
        }]
        if (this.pageItem?.goods_classify_path) {
          cond.push({
            colName: 'goods_classify_path',
            ruleType: 'like]',
            value: this.pageItem?.goods_classify_path
          })
        }
        url += `&cond=${JSON.stringify(cond)}`
        uni.navigateTo({
          url
        })
      },
      getGoodsListData() {
        let req = {
          page: {
            rownumber: this.rownumber
          },
          condition: [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeNo
            },
            {
              colName: "online_state",
              ruleType: 'eq',
              value: "上线"
            }
          ]
        };
        if (Array.isArray(this.pageItem?.more_config?.condition) && this.pageItem?.more_config?.condition.length > 0) {
          req.condition = [...req.condition, ...this.pageItem?.more_config?.condition];
        }
        if (this.pageItem?.goods_classify_path) {
          req.condition.push({
            colName: 'goods_classify_path',
            ruleType: 'like]',
            value: this.pageItem?.goods_classify_path
          })
        }
        this.$fetch('select', 'srvhealth_store_goods_guest_select', req, 'health').then(res => {
          if (Array.isArray(res.data)) {
            if (res.page?.total) {
              this.total = res.page.total
            }
            if (Array.isArray(res.data)) {
              this.goodsList = res.data.reduce((pre, cur) => {
                let url = this.getImagePath(cur[this.image], true);
                cur.url = url;
                if (cur[this.image]) {
                  this.getImageInfo({
                    url: url
                  }).then(picInfo => {
                    if (picInfo.w && picInfo.h) {
                      let res = this.setPicHeight(picInfo);
                      if (res.w && res.h) {
                        this.$set(cur, 'imgWidth', res.w);
                        this.$set(cur, 'imgHeight', res.h);
                      }
                    }
                  });
                }
                pre.push(cur)
                return pre
              }, []);
              // this.goodsList = [ ...this.goodsList, ...this.goodsList ]
              console.log(this.goodsList)
            }
          }
        });
      },
      setPicHeight(content) {
        let maxW = uni.upx2px(350);
        content.h = (maxW * content.h) / content.w;
        content.w = maxW;
        return content;
      },
      toGoodsDetail(e) {
        if(this.hasNotRegInfo){
          uni.navigateTo({
            url:'/publicPages/accountExec/accountExec'
          })
          return
        }
        if (e.goods_no) {
          let url = `/storePages/GoodsDetail/GoodsDetail?goods_no=${ e.goods_no}`
          if (this.storeInfo?.telephone) {
            url += `&phone=${this.storeInfo?.telephone}`
          }
          if (this.storeInfo?.store_no) {
            url += `&storeNo=${this.storeInfo?.store_no}`
          }
          if (this.storeInfo?.wx_mch_id) {
            url += `&wxMchId=${this.storeInfo?.wx_mch_id}`
          }
          uni.navigateTo({
            url: url
          });
        }
      }
    },
    props: {
      // storeInfo: {
      //   type: Object
      // },
      storeNo: {
        type: String
      },
      list: {
        type: Array
      },
      image: {
        type: String,
        default: 'image'
      },
      name: {
        type: String,
        default: 'name'
      },
      desc: {
        type: String,
        default: 'description'
      },
      price: {
        type: String,
        default: 'price'
      },
      pageItem: {
        type: Object
      }
    }
  };
</script>

<style scoped lang="scss">
  .title {
    padding: 20rpx;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-family: 苹方-简;
    font-weight: normal;
    color: #474849;

    .to-more {
      font-size: 14px;
      background-color: transparent;
    }
  }

  .goods-list {
    display: flex;
    flex-wrap: wrap;
    // column-count: 2;
    // column-gap: 10px;
    padding: 0 0px 0px;
    min-width: 300px;
    justify-content: space-between;

    @media screen and (min-width: 1300px) {
      width: 400px;
      margin: auto;
    }
  }

  .goods-item {
    border-radius: 10px;
    overflow: hidden;
    background-color: #fff;
    break-inside: avoid;
    margin-top: 20rpx;
    // width: calc(50% - 20rpx);
    min-width: 45%;
    flex: 1;
    max-width: calc(50% - 10rpx);
    margin-right: 20rpx;

    // margin-bottom: 20rpx;
    &:first-child,
    &:nth-child(2) {
      margin-top: 0;
    }

    // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    &:nth-child(2n) {
      margin-right: 0;
    }
  }

  .goods-image {
    width: 100%;
    height: 300rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    border: 1px solid #fff;
  }

  .goods-info {
    padding: 10rpx;
    width: 100%;
    margin-top: 5px;
    font-size: 16px;

    .desc {
      font-size: 12px;
      color: #aaa;
      margin-top: 5px;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /**指定行数*/
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price {
      margin-top: 20rpx;

      .symbol {
        font-size: 12px;
      }

      .number {
        font-size: 20px;
      }
    }
  }

  .goods-name {
    text-align: left;
  }
</style>
