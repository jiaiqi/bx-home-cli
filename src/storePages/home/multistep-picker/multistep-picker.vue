<template>
  <view class="cascader-selector__wrap" :style="styleVariable">
    <!-- 顶级节点 -->
    <view class="top-level-node" v-if="topLevelData.length>0">
      <view class="sub-title" v-if="topLevelCfg&&topLevelCfg.title">
        {{topLevelCfg.title}}
      </view>
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
    <view class="top-level-node">
      <view class="sub-title" v-if="secondLevelCfg&&secondLevelCfg.title">
        {{secondLevelCfg.title}}
      </view>
      <scroll-view scroll-x="true">
        <view class="child-node" :class="{'flex-wrap':secondLevelCfg&&secondLevelCfg.autowrap===true}">
          <view class="child-node-item" :style="[{minHeight:secondLevelCfg.minHeight}]"
            :class="{active:item.selected,disabled:isDisabled('second',item)}" v-for="item in secondLevelData"
            @click="selectDate(item,'second')">
            <text class="">
              {{item[secondLevelDispCol]||''}}
            </text>
            <view class="">
              <!-- {{item.place_name||''}} -->
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- 三级节点 -->
    <view class="top-level-node">
      <view class="sub-title" v-if="thirdLevelCfg&&thirdLevelCfg.title">
        {{thirdLevelCfg.title}}
      </view>
      <view class="child-node" :class="{'flex-wrap':thirdLevelCfg&&thirdLevelCfg.autowrap===true}">
        <text class="child-node-item" :style="[{minHeight:thirdLevelCfg.minHeight}]"
          :class="{active:item.selected,disabled:isDisabled('third',item)}" v-for="item in thirdLevelData"
          @click="selectDate(item,'third')">
          {{item[thirdLevelDispCol]||''}}
        </text>
      </view>
    </view>
    <!--    <scroll-view scroll-x="true">
      <view class="child-node">
        <text class="child-node-item" :class="{active:item.selected}" v-for="item in thirdLevelData"
          @click="selectDate(item,'third')">
          {{item[thirdLevelDispCol]||''}}
        </text>
      </view>
  
    </scroll-view> -->
    <view class="handler-bar" v-if="curSelect&&showHandler">
      <view class="subscribe-money" v-if="handlerCfg&&handlerCfg.showText!==false">
        <text>￥</text>
        <text class="money">{{curSelect.subscribe_money}}</text>
      </view>
      <button class="cu-btn round" @click="onHandler" v-if="handlerCfg&&handlerCfg.showBtn!==false">预约</button>
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
      showHandler() {
        return this.handlerCfg?.show === false ? false : true
      },
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
      config() {
        return this.moreConfig?.multistep_config || this.moreConfig?.coupon_config
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
      orderCfg() {
        return this.config?.orderCfg
      },
    },
    props: {
      pageItem: {
        type: Object,
      }
    },
    methods: {
      isDisabled(level, item) {
        let disabled = false
        let cfg = this[`${level}LevelCfg`]
        if (cfg) {
          let disabledCol = cfg?.disabledCol;
          if (disabledCol && (item[disabledCol] == true || item[disabledCol] == 1)) {
            disabled = true
          }
          debugger
          if (cfg?.timeoutDisabled && cfg?.dateTime) {
            let globalData = {
              data: item,
              data1: this.topLevelData.find(item => item.selected === true) || {},
              data2: this.secondLevelData.find(item => item.selected === true) || {},
              data3: this.thirdLevelData.find(item => item.selected === true) || {},
              storeInfo: this.storeInfo,
              storeUser: this.vstoreUser,
              bindUserInfo: this.vstoreUser,
            }
            let time = this.renderStr(cfg?.dateTime, globalData)
            if (time) {
              disabled = this.dayjs() - this.dayjs(time) > 0||disabled
            }
          }
        }
        return disabled
      },
      onHandler() {
        // 点击了预约按钮
        let fieldsCond = [{
            column: 'tobe_paid_amount',
            value: this.curSelect[this.thirdLevelCfg?.srvInfo?.moneyCol],
            disabled: true
          },
          {
            column: 'store_user_no',
            value: this.vstoreUser.store_user_no,
            disabled: true,
            display: false
          }
        ]
        if (this.orderCfg?.defaultVal) {
          let defaultVal = this.orderCfg?.defaultVal
          let data = {
            data1: this.topLevelData.find(item => item.selected === true) || {},
            data2: this.secondLevelData.find(item => item.selected === true) || {},
            data3: this.thirdLevelData.find(item => item.selected === true) || {},
            data: this.curSelect,
            storeInfo: this.storeInfo,
            storeUser: this.vstoreUser,
            bindUserInfo: this.vstoreUser,
          }
          Object.keys(defaultVal).forEach(key => {
            if (key && defaultVal[key]) {
              fieldsCond.push({
                column: key,
                // display: false,
                disabled: true,
                value: this.renderStr(defaultVal[key], data)
              })
            }
          })
        }
        let service = this.orderCfg?.service || 'srvhealth_store_order_add'
        let url =
          `/publicPages/formPage/formPage?serviceName=${service}&orderMode=true&hideChildTable=true&fieldsCond=${JSON.stringify(fieldsCond)}`
        if (this.orderCfg?.leftText) {
          url += `&leftText=${JSON.stringify(this.orderCfg?.leftText)}`
        }
        if (this.orderCfg?.rightBtn) {
          url += `&rightBtn=${JSON.stringify(this.orderCfg?.rightBtn)}`
        }
        uni.navigateTo({
          url
        })
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
            if (Array.isArray(this.topLevelCfg?.customCond) && this.topLevelCfg?.customCond.length > 0) {
              let str = JSON.stringify(this.topLevelCfg?.customCond)
              let data = {
                storeInfo: this.storeInfo,
                storeUser: this.vstoreUser,
                bindUserInfo: this.vstoreUser,
              }
              str = this.renderStr(str, data)
              try {
                let cond = JSON.parse(str)
                if (Array.isArray(cond) && cond.length > 0) {
                  req.condition = cond
                }
              } catch (e) {
                //TODO handle the exception
              }
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              if (Array.isArray(res.data) && res.data.length > 0) {
                this.date = res.data[0][idCol || 'year_month_day']
                res.data[0].selected = true
                this.topLevelData = res.data
              }
            }
          }
        }
        return
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
              "condition": [{
                colName: 'store_no',
                ruleType: 'eq',
                value: this.storeInfo?.store_no
              }]
            }
            if (Array.isArray(this.secondLevelCfg?.customCond) && this.secondLevelCfg?.customCond.length > 0) {
              let str = JSON.stringify(this.secondLevelCfg?.customCond)
              let data = {
                data1: this.topLevelData.find(item => item.selected === true) || {},
                data: this.curSelect,
                storeInfo: this.storeInfo,
                storeUser: this.vstoreUser,
                bindUserInfo: this.vstoreUser,
              }
              str = this.renderStr(str, data)
              try {
                let cond = JSON.parse(str)
                if (Array.isArray(cond) && cond.length > 0) {
                  req.condition = cond
                }
              } catch (e) {
                //TODO handle the exception
              }
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              let list = res.data.map((item, index) => {
                // item.disabled = this.isDisabled('second', item)
                item.selected = false
                // if (index === 0) {
                //   item.selected = true
                // }
                return item
              })
              this.secondLevelData = list
              if (Array.isArray(res.data) && res.data.length > 0) {
                let curIndex = res.data.findIndex(e => e.disabled !== true)
                if (curIndex !== -1) {
                  list[curIndex].selected = true;
                  this.getThirdData(list[curIndex])
                }
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
                let disabled = this.isDisabled('second', item)
                if (item[pidCol] === e[pidCol] && disabled !== true) {
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
            if (Array.isArray(this.thirdLevelCfg?.customCond) && this.thirdLevelCfg?.customCond.length > 0) {
              let str = JSON.stringify(this.thirdLevelCfg?.customCond)
              let data = {
                data1: this.topLevelData.find(item => item.selected === true) || {},
                data2: this.secondLevelData.find(item => item.selected === true) || {},
                data: this.curSelect,
                storeInfo: this.storeInfo,
                storeUser: this.vstoreUser,
                bindUserInfo: this.vstoreUser,
              }
              console.log(this.secondLevelData)
              str = this.renderStr(str, data)
              try {
                let cond = JSON.parse(str)
                if (Array.isArray(cond) && cond.length > 0) {
                  req.condition = cond
                }
              } catch (e) {
                //TODO handle the exception
              }
            }
            const res = await this.$fetch('select', service, req, app)
            if (res.success) {
              let list = res.data.map((item, index) => {
                item.selected = false;
                let disabled = this.isDisabled('third', item)
                if (item[pidCol] === e[pidCol] && disabled !== true) {
                  item.selected = true
                }
                return item
              })
              if (Array.isArray(res.data) && res.data.length > 0) {
                let curIndex = res.data.findIndex(e => e.disabled !== true)
                if (curIndex !== -1) {
                  list[curIndex].selected = true;
                }
              }
              this.thirdLevelData = list
            }
          }
        }
      },
    },
    created() {
      this.getTopData().then(_ => {
        this.getSecondData()
      })
    }
  }
</script>

<style scoped lang="scss">
  .cascader-selector__wrap {
    padding: 0 10px;
  }

  .top-level-node {
    width: 100%;
    padding: 10rpx 0;
    overflow: hidden;
    // box-shadow: 0px 3px 6px rgba(216, 217, 223, 0.26);
    position: relative;
    border-top: 1px solid #f1f1f1;

    &:first-child {
      border-top: none;
    }

    .sub-title {
      padding: 5px 0 5px 2px;
      font-weight: bold;

    }

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
    // display: flex;
    // flex-wrap: nowrap;
    // overflow-x: scroll;
    display: block;
    white-space: nowrap;
    padding: 5px 0;

    &.flex-wrap {
      white-space: pre-wrap;
    }

    .child-node-item {
      box-sizing: border-box;
      padding: 5px;
      text-align: center;
      margin-right: 5px;
      min-width: calc(25% - 5px);
      min-height: 50px;

      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--second-color);
      background-color: var(--second-bg);
      margin-bottom: 5px;
      border: 1px solid var(--second-border-color);
      border-radius: 5px;

      &:nth-child(4n) {
        // margin-right: 0;
      }

      &.active {
        color: var(--second-active-color);
        background-color: var(--second-active-bg);
      }

      &.disabled {
        pointer-events: none;
        opacity: 0.5;
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
