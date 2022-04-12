<template>
  <view class="cascader-selector__wrap" :style="styleVariable">
    <!-- 顶级节点 -->
    <view class="top-level-node" v-if="topLevelData.length>0">
      <view class="date-box">
        <scroll-view scroll-x="true" class="scroll-view_H" :class="{'full':fullDate}" :scroll-left="scrollLeft"
          :scroll-with-animation="true" @scrolltolower="scrolltolower" @scrolltoupper="scrolltoupper">
          <view class="date-item" :class="{active:date==item[topLevelIdCol]}" :id="item.month_day"
            v-for="(item,index) in topLevelData" :key="index" @click="selectDate(item,'top')">
            <view class="">
              {{week2CN(item.day_week,item)}}
            </view>
            <view>{{item.month_day}}</view>
          </view>
          <!-- <view class="date-item right-icon">
            <view class="">
              
            </view>
          </view> -->
        </scroll-view>
        <text class="right-icon" v-if="topLevelData&&topLevelData.length>=5">
          》
        </text>
      </view>

    </view>
    <!-- 二级节点 -->
    <view class="child-node">
      <view class="child-node-item" :class="{active:item.selected}" v-for="item in secondLevelData"
        @click="selectDate(item,'second')">
        <text class="">
          {{item[secondLevelDispCol]||''}}
        </text>
        <view class="">
          <!-- {{item.place_name||''}} -->
        </view>
      </view>
    </view>
    <!-- 三级节点 -->
    <view class="child-node">
      <text class="child-node-item" :class="{active:item.selected}" v-for="item in thirdLevelData"
        @click="selectDate(item,'third')">
        {{item[thirdLevelDispCol]||''}}
      </text>
    </view>
    <view class="handler-bar" v-if="curSelect">
      <view class="subscribe-money">
        <text>￥</text>
        <text class="money">{{curSelect.subscribe_money}}</text>
      </view>
      <button class="cu-btn round" @click="onHandler">预约</button>
    </view>
    <!-- 子孙节点 -->
    <cascader-item></cascader-item>
  </view>
</template>

<script>
  /** 
   * 至少两级
   * 第一级为日期
   * topLevel.active_color 顶级节点选中颜色
   * topLevel.bg_color 顶级节点背景颜色
   * topLevel.font_color 顶级节点字体颜色
   * childNode.bg_color 子节点背景颜色
   * childNode.font_color 子节点字体颜色
   * childNode.active_bg_color 子节点选中状态背景颜色
   * childNode.active_font_color 子节点选中状态字体颜色
   * topLevel.service 顶级节点查询服务
   * topLevel.app 顶级节点app
   * topLevel.idCol 顶级节点id字段
   * secondLevel.service  二级节点查询服务
   * secondLevel.app 二级节点app
   * secondLevel.idCol 二级节点id字段
   * thirdLevel.service 三级节点查询服务
   * thirdLevel.app 三级节点app
   * thirdLevel.idCol 三级节点id字段
   */
  import cascaderItem from './cascader-item.vue'
  export default {
    components: {
      cascaderItem
    },
    data() {
      return {
        date: "",
        scrollLeft: 0,
        scrolId: '',
        isLower: false,
        fullDate: false,
        topLevelData: [],
        secondLevelData: [],
        thirdLevelData: []
      }
    },
    computed: {
      curSelect() {
        return this.thirdLevelData.find(item => item.selected === true)
      },
      topLevelIdCol() {
        return this.topLevelCfg?.srvInfo?.idCol || 'year_month_day'
      },
      secondLevelDispCol() {
        return this.secondLevelCfg?.srvInfo?.dispCol || 'showplacearea'
      },
      thirdLevelDispCol() {
        return this.thirdLevelCfg?.srvInfo?.dispCol || 'showtimearea'
      },
      styleVariable() {
        return `
        --top-color:${this.topLevelCfg?.color||'#fff'};
        --top-active-border-color:${this.topLevelCfg?.activeColor||'#D61920'};
        --second-border-color:${this.secondLevelCfg?.borderColor};
        --second-active-color:${this.secondLevelCfg?.activeColor};
        --second-active-bg:${this.secondLevelCfg?.activeBg};
        --second-bg:${this.secondLevelCfg?.bg};
        --second-color:${this.secondLevelCfg?.color};
        --handler-color:${this.handlerCfg?.color};
        --btn-bg:${this.handlerCfg?.btnBg};
        --btn-color:${this.handlerCfg?.btnColor};
        `
      },
      moreConfig() {
        let cfg = this.pageItem?.more_config;
        if (cfg && typeof cfg === 'string') {
          try {
            cfg = JSON.parse(cfg)
          } catch (e) {
            //TODO handle the exception
          }
        }
        return cfg
      },
      config(){
        return this.moreConfig?.multistep_config||this.moreConfig?.coupon_config
      },
      handlerCfg() {
        return this.config?.handlerCfg || {
          color: '#fff',
          btnBg: 'red',
          btnColor: '#fff'
        }
      },
      topLevelCfg() {
        return this.config?.topLevelCfg
      },
      secondLevelCfg() {
        return this.config?.secondLevelCfg
      },
      thirdLevelCfg() {
        return this.config?.thirdLevelCfg
      },
    },
    props: {
      pageItem: {
        type: Object,
      },
      // topLevelCfg: {
      //   type: Object,
      //   default: () => {
      //     return {
      //       activeColor: '#D61920',
      //       bg: "#2B2B2B",
      //       color: "#fff",
      //       srvInfo: {
      //         app: "fyzhmd",
      //         service: 'srvstore_entity_subscribe_app_date',
      //         idCol: 'year_month_day',
      //         dispCol: 'month_day'
      //       }
      //     }
      //   }
      // },
      // secondLevelCfg: {
      //   type: Object,
      //   default: () => {
      //     return {
      //       borderColor: '#303030',
      //       activeColor: '#fff',
      //       activeBg: '#D61920',
      //       bg: "#1c1c1c",
      //       color: "#fff",
      //       srvInfo: {
      //         app: "health",
      //         service: 'srvhealth_store_place_join_select',
      //         idCol: 'place_type_no',
      //         dispCol: 'place_type_name',
      //         pidCol: "year_month_day"
      //       }
      //     }
      //   }
      // },
      // thirdLevelCfg: {
      //   type: Object,
      //   default: () => {
      //     return {
      //       borderColor: '#303030',
      //       activeColor: '#fff',
      //       activeBg: '#D61920',
      //       bg: "#1c1c1c",
      //       color: "#fff",
      //       srvInfo: {
      //         app: "health",
      //         service: 'srvhealth_store_place_timearea_join_select',
      //         idCol: 'timearea_no',
      //         dispCol: 'showtimearea',
      //         pidCol: 'place_type_no',
      //       }
      //     }
      //   }
      // }
    },
    methods: {
      onHandler() {
        // 点击了预约按钮
      },
      selectDate(e, type) {
        switch (type) {
          case 'top':
            this.getSecondData(e)
            break;
          case 'second':
            this.getThirdData(e)
            break;
          case 'third':
            let cfg = this.thirdLevelCfg?.srvInfo;
            if (cfg) {
              
              const {
                app,
                service,
                idCol,
                pidCol
              } = cfg;
              
              if (idCol && e && e[idCol]) {
                this.thirdLevelData = this.thirdLevelData.map(item => {
                  item.selected = false
                  if (e[idCol] === item[idCol]) {
                    item.selected = true
                  }
                  return item
                })
              }
            }
            break;
        }
      },
      scrolltoupper(e) {
        console.log('scrolltoupper', e)
      },
      scrolltolower(e) {
        console.log('scrolltolower', e)
        this.isLower = true
      },
      changeLeft(num = 0) {
        // this.fullDate = true
        // return 
        if (num < 0) {
          this.isLower = false
        }
        if (this.isLower) {
          return
        }
        let scrollLeft = this.scrollLeft + num
        if (scrollLeft < 0) {
          scrollLeft = 0
        }

        this.scrollLeft = scrollLeft
      },
      week2CN(day, e) {
        let weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        if ([0, 1, 2, 3, 4, 5, 6].indexOf(day) > -1) {
          if (e?.year_month_day === this.dayjs().format('YYYY-MM-DD')) {
            return '今天'
          }
          return weekMap[day]
        }
        return ''
      },
      async getTopData() {
        let cfg = this.topLevelCfg?.srvInfo;
        if (cfg) {
          const {
            app,
            service,
            idCol
          } = cfg
          if (service && app && idCol) {
            const req = {
              "serviceName": service,
              "colNames": ["*"],
              "condition": []
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              this.topLevelData = res.data
              if (Array.isArray(res.data) && res.data.length > 0) {
                this.date = res.data[0][idCol || 'year_month_day']
              }
            }
          }
        }
      },
      async getSecondData(e) {
        let cfg = this.secondLevelCfg?.srvInfo;

        if (cfg) {
          const {
            app,
            service,
            idCol,
            dispCol,
            pidCol
          } = cfg;
          if (service && app && idCol) {
            if (e && pidCol && e[pidCol]) {
              this.topLevelData = this.topLevelData.map(item => {
                item.selected = false
                if (item[pidCol] === e[pidCol]) {
                  item.selected = true
                  this.date = e[pidCol]
                }
                return item
              })
            }
            const req = {
              "serviceName": service,
              "colNames": ["*"],
              group: [{
                  "colName": idCol,
                  "type": 'by'
                },
                {
                  "colName": dispCol,
                  "type": "by"
                }
              ],
              "condition": [{
                colName: 'store_no',
                ruleType: 'eq',
                value: this.storeInfo?.store_no
              }]
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              this.secondLevelData = res.data.map((item, index) => {
                item.selected = false
                if (index === 0) {
                  item.selected = true
                }
                return item
              })
              if (Array.isArray(res.data) && res.data.length > 0) {
                this.getThirdData(res.data[0])
              }
            }
          }
        }
      },

      async getThirdData(e) {
        let cfg = this.thirdLevelCfg?.srvInfo;
        if (cfg) {
          const {
            app,
            service,
            idCol,
            pidCol
          } = cfg;
          const req = {
            "serviceName": service,
            "colNames": ["*"],
            "condition": [{
              colName: 'store_no',
              ruleType: 'eq',
              value: this.storeInfo?.store_no
            }]
          }
          if (service && app && idCol) {
            if (e && pidCol && e[pidCol]) {
              this.secondLevelData = this.secondLevelData.map(item => {
                item.selected = false
                if (item[pidCol] === e[pidCol]) {
                  item.selected = true
                }
                return item
              })
              req.condition.push({
                colName: pidCol,
                ruleType: 'eq',
                value: e[pidCol]
              })
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              this.thirdLevelData = res.data.map((item, index) => {
                item.selected = false;
                if (index === 0) {
                  item.selected = true
                }
                return item
              })

            }
          }
        }
      },
    },
    created() {
      this.getTopData()
      this.getSecondData()
    }
  }
</script>

<style scoped lang="scss">
  .cascader-selector__wrap {
    padding: 0 10px;
  }

  .top-level-node {
    width: 100%;
    padding: 0;
    padding-right: 0;
    margin-bottom: 10px;
    overflow: hidden;
    // box-shadow: 0px 3px 6px rgba(216, 217, 223, 0.26);
    position: relative;

    .right-icon {
      width: 30px;
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      box-shadow: 0px 3px 6px rgba(216, 217, 223, 0.26);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--top-color);
    }

    .date-box {
      display: flex;
      align-items: center;
      padding-right: 30px;

      .handler-icon {
        display: flex;
        align-items: center;
        width: 30px;
        text-align: center;
        height: 40px;
        justify-content: center;
        background-color: #fff;
        border-radius: 5px;

        &:first-child {
          margin-right: 5px;
        }

        &:last-child {
          margin-left: 5px;
        }

      }

      .scroll-view_H {
        white-space: nowrap;
        width: 100%;

        &.full {
          white-space: inherit;
        }
      }
    }

    .date-item {
      margin: 0;
      padding: 10px;
      display: inline-block;
      text-align: center;
      min-width: 150rpx;
      color: var(--top-color);

      &.active {
        position: relative;

        &::after {
          position: absolute;
          content: '';
          width: 80%;
          left: 10%;
          height: 3px;
          background-color: var(--top-active-border-color);
          bottom: 0;
        }
      }
    }

    .date-select-box {
      // width: 100%;
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 5px;
      padding: 10px 20px;

      // justify-content: flex-end;
      &.readonly {
        color: #fff;
        // opacity: 0.7;
        background-color: #fff;
        // cursor: not-allowed;
      }
    }
  }

  .child-node {
    display: flex;
    flex-wrap: wrap;

    .child-node-item {
      padding: 5px;
      margin-right: 5px;
      width: calc(25% - 5px);
      min-height: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--second-color);
      background-color: var(--second-bg);
      margin-bottom: 5px;
      border: 1px solid var(--second-border-color);
      border-radius: 8px;

      &:nth-child(4n) {
        margin-right: 0;
      }

      &.active {
        color: var(--second-active-color);
        background-color: var(--second-active-bg);
      }
    }
  }

  .handler-bar {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    color: var(--handler-color);

    .money {
      font-size: 20px;
    }

    .cu-btn {
      background: var(--btn-bg);
      color: var(--btn-color);
    }

  }
</style>
