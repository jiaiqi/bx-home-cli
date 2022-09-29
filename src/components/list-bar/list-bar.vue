<template>
  <view class="search-bar" style="--home-bg-color:#fff;"  :class="['theme-'+theme]">
    <view class="cu-bar search bg-white" 
      :class="[{'pc-model':sysModel=='PC','fixed':fixed},backgroundClass]">
      <view class="search-form round">
        <text class="cuIcon-search"></text>
        <input @focus="searchBarFocus" @blur="serachBarBlur" :adjust-position="false" type="text" v-model="searchVal"
          :placeholder="placeholder" confirm-type="search" @confirm="toSearch" />
        <button class="cuIcon-close cu-btn round bg-transparent sm" v-if="searchVal" @click="clear"></button>
      </view>
      <view class="action">
        <button class="cu-btn round  light" @click="toSearch"
          v-if="gridButtonDisp&&gridButtonDisp.refresh!==false">
          <text class="cuIcon-search" v-if="searchVal"></text>
          <text class="cuIcon-refresh" v-else></text>
        </button>
        <button v-if="sysModel!=='PC'" class="cu-btn round  light  margin-left-xs " @click="clickGridButton(btn)"
          v-for="(btn, btnIndex) in setListBtn" :key="btnIndex" v-show="isShowBtn(btn,btnIndex)">
          <text :class="[btn.icon]" class=""></text>
          <text class="button-name">{{btn.button_name||''}}</text>
        </button>
      </view>
    </view>


    <view class="cu-modal bottom-modal" :class="{ show: modalName === 'orderModal' }" @click.stop="hideModal">
      <view class="cu-dialog" @click.stop="">
        <view class="order-modal">
          <view class="order-column">
            <view class="order-item" hover-class="hover"
              :class="{ current: item.selected,'bx-btn-bg-color': item.selected&&theme&&false }"
              v-for="(item, index) in orderCols" :key="item.columns" @click.stop="changeOrderType(item, index)">
              <view class="label">
                {{ item.label || "" }}
              </view>
              <view class="order-option" v-if="item.selected"
                :class="{'bx-border-color':theme && item.selected&&false}">
                <text class="cuIcon-top text-gray" v-if="item.orderType === 'asc'" :class="{
		                active: item.orderType === 'asc' && item.selected,
		              }"></text>
                <text class="cuIcon-down text-gray" v-if="item.orderType === 'desc'" :class="{
		                active: item.orderType === 'desc' && item.selected,
		              }"></text>
              </view>
            </view>
            <view class="order-item" style="opacity: 0;" v-if="orderCols.length%2===1">

            </view>
          </view>
          <view class="button-box">
            <button class="cu-btn bg-gray" @click="hideModal">取消</button>
            <button class="cu-btn bg-green" :class="{'bx-bg-color':theme}" @click="toOrder">
              确定
            </button>
          </view>
        </view>
      </view>
    </view>

    <view class="cu-modal bottom-modal" :class="{ show: modalName==='showFilter' }" @click.stop="hideModal">
      <view class="cu-dialog" @click.stop="">
        <bx-filter v-if="filterCol&&filterCol.length>0" :mainData="mainData" :srvApp="srvApp" :fieldInfo="filterCol"
          @toFilter="toFilter" @cancel="hideModal"></bx-filter>
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        searchVal: "",
        modalName: "",
        orderCols: []
      }
    },
    props: {
      mainData: {
        type: Object,
      },
      placeholder: {
        type: String
      },
      listButton: {
        type: Array
      },
      srvCols: {
        type: Array
      },
      srvApp: {
        type: String
      },
      filterCols: {
        type: Array
      },
      orderColExtension: {
        type: Array
      },
      readonly: {
        type: [String, Boolean]
      },
      // orderCols:{
      // 	type:Array
      // }
      gridButtonDisp: {
        type: Object
      },
      backgroundClass: {
        type: String,
        default: 'bg-white'
      },
      fixed: {
        type: Boolean,
        default: false
      },
      top: {
        type: [String, Number]
      }
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      sysModel() {
        return getApp().globalData.systemInfo?.model
      },
      setListBtn() {
        let listButton = this.listButton.filter(item => {
          if (this.gridButtonDisp && this.gridButtonDisp[item.button_type] === false) {
            return false
          } else {
            return true
          }
        })
        return listButton
      },
      filterCol() {
        return Array.isArray(this.filterCols) && this.filterCols.length > 0 ? this.filterCols : this.srvCols
      },
      orderList() {
        let cols = this.orderCols.filter(item => item.selected)
        if (cols.length === 0) {
          return []
        }
        let arr = cols.map(col => {
          return {
            colName: col.columns,
            orderType: col.orderType || 'asc'
          }
        })
        return arr
      },
    },
    mounted() {
      if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
        let cols = this.srvCols.filter(item => {
          if (Array.isArray(this.orderColExtension) && this.orderColExtension.length > 0 && this.orderColExtension
            .find(col => col.column === item.column)) {
            return true
          }
          if (item.in_list === 1 && ['Integer'].includes(item.col_type) && !['images', 'input', 'text']
            .includes(item.type) && !
            /^\_.*\_disp$/.test(item.column)) {
            item.orderType = 'asc'
            item.selected = false;
            return true
          }
        })
        this.orderCols = cols
      }
    },
    methods: {
      isShowBtn(btn) {
        let handlerBtn = ['add', 'delete', 'batch_delete']
        if (btn.button_type === 'order') {
          if (this.orderCols.length === 0) {
            return false
          }
        }
        if (this.readonly && handlerBtn.includes(btn.button_type)) {
          return false
        }
        return true
      },
      toFilter(e) {
        this.searchVal = ''
        this.hideModal()
        if (Array.isArray(e)) {
          let cond = e.filter(item => item.value !== '全部' && item.column).map(item => {
            let obj = {
              colName: item.column,
              ruleType: 'like',
              value: item.value
            }
            if (item.col_type === 'Set') {
              obj.ruleType = 'inset'
            }
            if (['date', 'dateTime', 'time', 'Time', 'Date'].includes(item.type) && Array.isArray(item
                .value)) {
              obj.ruleType = 'between'
            }
            return obj
          })
          this.$emit('toFilter', cond)
          // this.$refs.bxList.getListData(cond)
        }
      },
      changeOrderType(e, index) {
        if (e.selected) {
          if (e.orderType === 'asc') {
            e.orderType = 'desc'
          } else if (e.orderType = 'desc') {
            e.orderType = 'asc'
            e.selected = false
          }
          this.$set(this.orderCols, index, e)
        } else {
          e.selected = !e.selected
          e.orderType = 'asc'
          this.$set(this.orderCols, index, e)
        }
      },
      toOrder() {
        // this.$emit('toOrder', this.orderCols)
        this.$emit('toOrder', this.orderList)
        this.hideModal()
      },
      searchBarFocus() {
        this.$emit('focus')
      },
      serachBarBlur() {
        this.$emit('change', this.searchVal)
      },
      clickGridButton(e) {
        // this.$emit('onGridButton', e)
        switch (e.button_type) {
          case 'select':
            this.modalName = 'showFilter'
            break;
          case 'add':
            // this.clickAddButton()
            this.$emit('clickAddButton', e)
            break;
          case 'order':
            this.modalName = 'orderModal'
            break;
          case 'customize':
            // this.handlerCustomizeButton(e)
            this.$emit('handelCustomButton', e)
            break;
          case 'navigateTo':
            if (e.url) {
              uni.navigateTo({
                url: e.url
              })
            }
            break;
          default:
            this.$emit('onGridButton', e)
            break;
        }

      },
      clear(){
        this.searchVal = ''
        this.toSearch()
      },
      toSearch() {
        this.$emit('search', this.searchVal)
      },
      hideModal() {
        this.modalName = null
      }
    }
  }
</script>

<style lang="scss" scoped>
  .cu-modal.bottom-modal {
    z-index: 1001;
    display: block;
  }

  .search-bar {
    width: 100%;
    max-width: 800px;

    .search.pc-model {
      margin-bottom: 10px;
    }

    @media screen and(min-width:800px) {
      width: 250px;
      max-width: 250px;
      overflow: hidden;
    }

    ::v-deep .uni-picker-container {
      z-index: 99999 !important;
    }

    .cu-bar {
      z-index: 1 !important;
      // background-color: initial;
    }

    // height: 100px;
    .search-form {
      transition: all 0.5s ease-in-out;
      margin: 0 5px 0 10px;
    }

    .action {
      margin-right: 20rpx;

      .cu-btn {
        padding: 2px 10px;
        color: #474D59;
        font-size: 16px;
        font-family: 苹方-简;
        color: #474D59;

        .button-name {
          font-size: 12px;
        }

        .text-sm {
          font-size: 14px;
        }

        &.bg-cyan {
          background-color: #0bc99d;
        }
      }
    }
  }



  .order-modal {
    background-color: #f1f1f1;
    overflow: hidden;

    .order-column {
      max-height: 80vh;
      overflow-y: scroll;
      display: flex;
      flex-wrap: wrap;
      padding: 20rpx;
      justify-content: center;

      .order-item {
        margin-top: 10rpx;
        line-height: 60rpx;
        width: calc(50% - 30rpx);
        padding: 10rpx 10rpx 10rpx 20rpx;
        background-color: #fff;
        margin-right: 20rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        transition: transform 0.5s ease-in;

        &:nth-child(2n) {
          margin-right: 0;
        }

        &:active {
          transform: scale(1.1);
        }

        &.current {
          margin-top: 6rpx;
          border: 1px solid #0bc99d;

          .label {
            color: #0bc99d;
          }

          .order-option {
            border-color: #0bc99d;
          }
        }

        .order-option {
          line-height: 60rpx;
          margin-right: 10rpx;
          border-left: 1px solid #f1f1f1;

          text {
            margin-left: 10rpx;
          }

          .active {
            animation: scale 0.2s;
            color: #0bc99d;
            // background-color: rgba($color: #0bc99d, $alpha: 0.1);
          }

          @keyframes scale {
            50% {
              // font-size: 36rpx;
              font-weight: bold;
            }
          }
        }
      }
    }

    .button-box {
      display: flex;
      justify-content: center;
      padding: 40rpx;
      margin-top: 20rpx;
      margin-bottom: 0;
      background-color: #fff;

      .cu-btn {
        border-radius: 20px;
        width: 45%;
        margin-right: 20rpx;
      }
    }
  }
</style>
