<template>
  <view class="u-wrap">
    <view class="u-menu-wrap">
      <scroll-view scroll-y scroll-with-animation class="u-tab-view menu-scroll-view" :scroll-top="scrollTop">
        <view v-for="(item,index) in tabbar" :key="index" class="u-tab-item"
          :class="[current==index ? 'u-tab-item-active' : '']" :data-current="index" @tap.stop="swichMenu(index)">
          <text class="u-line-1">{{item.label}}</text>
        </view>
      </scroll-view>
      <block v-for="(item,index) in tabbar" :key="index">
        <scroll-view scroll-y class="right-box" v-if="current==index">
          <view class="page-view">
            <view class="class-item">
              <view class="item-title">
                <text>{{item.name}}</text>
              </view>
              <view class="item-container">
                <view class="thumb-box" :class="{'double-column':doubleCol}" v-for="(item1, index1) in item.childList"
                  :key="index1" @click="toDetail(item1)">
                  <image class="item-menu-image" :src="item1.icon" mode="aspectFill"></image>
                  <view class="item-menu-name">
                    <view class="item-label">
                      {{item1.label}}
                    </view>
                    <view class="item-desc " v-if="item1.desc">
                      {{item1.desc}}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </block>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        doubleCol: false, //一行两列 默认一行一列
        tabbar: [],
        scrollTop: 0, //tab标题的滚动条位置
        current: 0, // 预设当前项的值
        menuHeight: 0, // 左边菜单的高度
        menuItemHeight: 0, // 左边菜单item的高度
        service: "",
        app: "",
        config: null,
        // 左侧按钮分页信息
        menuPage: {
          pageNo: 1,
          rownumber: 50,
          total: 0
        },
        // 右边数据分页信息
        listPage: {
          pageNo: 1,
          rownumber: 50,
          total: 0
        },
      }
    },
    onLoad(option) {
      if (option.doubleCol) {
        this.doubleCol = true
      }
      if (option.app) {
        this.app = option.app
      }
      if (option.service) {
        this.service = option.service
        this.initData()
      }


    },
    computed: {

    },
    methods: {
      toDetail(e) {
        let url = this.config?.detailUrl;
        let data = {
          data: e,
          ...this.globalVariable
        }
        url = this.renderStr(url, data)
        uni.navigateTo({
          url
        })
      },
      async initData() {
        let app = this.app || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.service, 'list', 'list', app);
        if (colVs?.moreConfig?.verticalNavCfg) {
          let config = colVs?.moreConfig?.verticalNavCfg
          const {
            left: leftCfg,
            right: rightCfg
          } = config
          this.config = config
          let leftData = await this.getLeft(leftCfg)
          if (leftCfg.relationCol && rightCfg.relationCol && Array.isArray(leftData) && leftData.length > 0) {
            let ids = leftData.map(item => item[leftCfg.relationCol]).toString()
            let rightData = await this.getRight(rightCfg, ids)
            leftData = leftData.map(item => {
              item.label = item[leftCfg.labelCol]
              item.childList = rightData.filter(e => e[rightCfg.relationCol] === item[leftCfg.relationCol])
              return item
            })
            this.tabbar = leftData
          }
        }

      },
      async getLeft(cfg = {}) {
        const {
          app,
          service
        } = cfg
        const url = `/${app}/select/${service}`
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": this.menuPage.pageNo,
            "rownumber": this.menuPage.rownumber
          }
        }

        if (Array.isArray(cfg?.conditions) && cfg?.conditions.length > 0) {
          cfg?.conditions.forEach(item => {
            item.value = this.renderStr(item.value);
            req.condition.push(item)
          })
        }

        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          let tabbar = res.data.data;
          return res.data.data.map(item => {
            if (cfg.labelCol && item[cfg.labelCol]) {
              item.label = item[cfg.labelCol]
            }

            return item
          });
        }
      },
      async getRight(cfg = {}, ids) {
        // 查找右侧数据
        const {
          app,
          service
        } = cfg
        const req = {
          "serviceName": service,
          "colNames": ["*"],
          "condition": [],
          "page": {
            "pageNo": this.listPage.pageNo,
            "rownumber": this.listPage.rownumber
          }
        }

        if (Array.isArray(cfg?.conditions) && cfg?.conditions.length > 0) {
          cfg?.conditions.forEach(item => {
            item.value = this.renderStr(item.value);
            req.condition.push(item)
          })
        }

        if (ids && cfg?.relationCol) {
          req.condition.push({
            colName: cfg?.relationCol,
            ruleType: 'in',
            value: ids
          })
        }

        const url = `/${app}/select/${this.service}`
        const res = await this.$http.post(url, req)

        if (res?.data?.state === 'SUCCESS') {
          return res.data.data.map(item => {
            if (cfg.labelCol && item[cfg.labelCol]) {
              item.label = item[cfg.labelCol]
            }
            if (cfg.descCol && item[cfg.descCol]) {
              item.desc = item[cfg.descCol]
            }
            if (cfg.iconCol && item[cfg.iconCol]) {
              item.icon = this.getImagePath(item[cfg.iconCol])
            }
            return item
          });
        }
      },
      // 点击左边的栏目切换
      async swichMenu(index) {
        if (index == this.current) return;
        this.current = index;
        // 如果为0，意味着尚未初始化
        if (this.menuHeight == 0 || this.menuItemHeight == 0) {
          await this.getElRect('menu-scroll-view', 'menuHeight');
          await this.getElRect('u-tab-item', 'menuItemHeight');
        }
        // 将菜单菜单活动item垂直居中
        this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2;
      },
      // 获取一个目标元素的高度
      getElRect(elClass, dataVal) {
        new Promise((resolve, reject) => {
          const query = uni.createSelectorQuery().in(this);
          query.select('.' + elClass).fields({
            size: true
          }, res => {
            // 如果节点尚未生成，res值为null，循环调用执行
            if (!res) {
              setTimeout(() => {
                this.getElRect(elClass);
              }, 10);
              return;
            }
            this[dataVal] = res.height;
          }).exec();
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .u-wrap {
    height: calc(100vh);
    /* #ifdef H5 */
    height: calc(100vh - var(--window-top));
    /* #endif */
    display: flex;
    flex-direction: column;
  }

  .u-search-box {
    padding: 18rpx 30rpx;
  }

  .u-menu-wrap {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .u-search-inner {
    background-color: rgb(234, 234, 234);
    border-radius: 100rpx;
    display: flex;
    align-items: center;
    padding: 10rpx 16rpx;
  }

  .u-tab-view {
    width: 200rpx;
    height: 100%;
  }

  .u-tab-item {
    height: 110rpx;
    background: #f6f6f6;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #444;
    font-weight: 400;
    line-height: 1;
  }

  .u-tab-item-active {
    position: relative;
    color: #000;
    font-size: 30rpx;
    font-weight: 600;
    background: #fff;
  }

  .u-tab-item-active::before {
    content: "";
    position: absolute;
    border-left: 4px solid $u-type-primary;
    height: 32rpx;
    left: 0;
    top: 39rpx;
  }

  .right-box {
    background-color: rgb(250, 250, 250);
  }

  .page-view {
    padding: 16rpx;
  }

  .class-item {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 16rpx;
    border-radius: 8rpx;
  }

  .item-title {
    font-size: 26rpx;
    color: $u-main-color;
    font-weight: bold;
  }



  .item-container {
    display: flex;
    flex-wrap: wrap;
  }

  .thumb-box {
    width: 100%;
    display: flex;
    // justify-content: center;
    flex-direction: row;
    margin-top: 20rpx;
    padding: 2px 10px;
  }

  .item-menu-image {
    width: 150rpx;
    height: 150rpx;
    margin-right: 10px;
    border-radius: 10rpx;
    overflow: hidden;
  }

  .item-menu-name {
    font-weight: normal;
    font-size: 24rpx;
    color: $u-main-color;
    flex: 1;

    .item-label {
      font-weight: bold;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .item-desc {
      color: #888;
      margin-top: 5px;
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }

  .double-column {
    flex-direction: column;
    width: 50%;
    align-items: center;
  }

  .double-column .item-menu-image {
    width: 220rpx;
    height: 220rpx;
    margin-right: 0;
  }
</style>
