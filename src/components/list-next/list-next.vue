<template>
  <view>
    <view class="list-wrap" v-if="setViewTemp" :style="setListStyle" :class="{
				'grid-layout': setViewTemp && setViewTemp.lp_style === '宫格'&&!nowrap,
        'no-wrap':nowrap
			}">
      <view class="check-box-item " :class="{
          'disabled':['multiSelectByJson','selectorList'].includes(listType)&&setRadioDisabled(item),
					'check-box_item':listType==='selectorList'||listType==='multiSelectByJson',
					grid_span2: setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp && (setViewTemp.grid_span === '2' || setViewTemp.grid_span === 2),
					grid_span3: setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp && (setViewTemp.grid_span === '3' || setViewTemp.grid_span === 3),
					grid_span4: setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp && (setViewTemp.grid_span === '4' || setViewTemp.grid_span === 4),
					grid_span5: setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp && (setViewTemp.grid_span === '5' || setViewTemp.grid_span === 5)
				}" v-for="(item, index) in setList" :style="setItemStyle">
        <view class="" style="display: flex;align-items: center;">
          <radio :value="item.cart_goods_rec_no" :checked="item.checked" v-if="listType === 'cartList'"
            style="transform:scale(0.7);margin-right:5px;" @click="checkboxChange(item)" />
        </view>
        <list-item class="list-item-wrap" :disabled="setRadioDisabled(item)" :viewTemp="setViewTemp"
          :labelMap="labelMap" :cartData="cartData" :childData="colV2._childData" :childDataCfg="childDataCfg"
          :listType="listType" :appName="appName" :rowData="item" :rowButton="rowButton" @click-foot-btn="clickFootBtn"
          :gridButtonDisp="gridButtonDisp" :rowButtonDisp="rowButtonDisp" :formButtonDisp="formButtonDisp"
          @add2Cart="add2Cart" @del2Cart="del2Cart"></list-item>
        <radio :value="item[idCol]?item[idCol].toString():''" :checked="item.checked"
          v-if="listType==='selectorList'||listType==='multiSelectByJson'" style="transform:scale(1);margin-right:5px;"
          :disabled="setRadioDisabled(item)" @click="checkboxChange(item)" />
      </view>
    </view>
  </view>
</template>

<script>
  import listItem from './list-item.vue';
  export default {
    components: {
      listItem
    },
    props: {
      list: {
        type: Array
      },
      listType: {
        type: String
      },
      colV2: {
        type: Object
      },
      appName: {
        type: String
      },
      listConfig: {
        type: Object
      },
      cartData: {
        type: Array
      },
      gridButtonDisp: {
        type: Object
      },
      rowButtonDisp: {
        type: Object
      },
      formButtonDisp: {
        type: Object
      },
      idCol: {
        type: String,
        default: 'id'
      },
      nowrap: {
        type: Boolean,
        default: false
      },
      itemWidth: {
        type: String
      },
      disabledCol: String,
      selectoDataId: String
    },
    watch: {
      list: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue?.type === 'childData') {} else {
            this.childData = {}
          }
        }
      },
    },
    computed: {
      setList() {
        return this.list || []
      },
      setListStyle() {
        let style = ""
        if (this.nowrap && this.itemWidth) {
          style = "flex-wrap:nowrap!important;"
        }
        return style
      },
      setItemStyle() {
        let str = 'flex:none;'
        if (this.itemWidth) {
          str += `width:${this.itemWidth}!important;`
        }
        // if(this.setViewTemp?.background){
        //   str += `background-color:${this.setViewTemp?.background}!important;`
        // }
        if (this.setViewTemp?.borderRadius) {
          str += `border-radius:${this.setViewTemp?.borderRadius}!important;`
        }
        // if(this.setViewTemp?.padding){
        //   str += `padding:${this.setViewTemp?.padding}!important;`
        // }
        // if(this.setViewTemp?.margin){
        //   str += `margin:${this.setViewTemp?.margin}!important;`
        // }
        return str
      },
      rowButton() {
        return this.colV2?.rowButton.filter(item => item.permission !== false);
      },
      moreConfig() {
        let result = null;
        if (this.colV2?.more_config) {
          if (typeof this.colV2.more_config === 'string') {
            try {
              result = JSON.parse(this.colV2.more_config);
            } catch (e) {
              //TODO handle the exception
            }
          } else if (typeof this.colV2.more_config === 'object') {
            result = this.colV2.more_config;
          }
        }
        return result;
      },
      viewTemp() {
        return this.moreConfig?.list_config;
      },
      childDataCfg() {
        return this.moreConfig?.list_config?.child_config
      },
      setViewTemp() {
        let viewTemp = this.viewTemp;
        let obj = {
          lp_style: this.listConfig?.lp_style || viewTemp?.lp_style || '复合',
          grid_span: this.listConfig?.grid_span || viewTemp?.grid_span || '2',
          margin: this.listConfig?.margin ?? viewTemp?.margin,
          padding: this.listConfig?.padding ?? viewTemp?.padding,
          borderRadius: this.listConfig?.borderRadius ?? viewTemp?.borderRadius,
          background: this.listConfig?.bg || this.listConfig?.background || viewTemp?.bg || viewTemp?.background,
          btn_cfg: {
            wrap_row: this.listConfig?.btn_cfg?.wrap_row ?? this.listConfig
              ?.wrap_row ?? viewTemp?.btn_cfg?.wrap_row ?? null,
            show_custom_btn: this.listConfig?.btn_cfg?.show_custom_btn ?? this.listConfig
              ?.show_custom_btn ?? viewTemp?.btn_cfg?.show_custom_btn ?? null,
            show_public_btn: this.listConfig?.btn_cfg?.show_public_btn ?? this.listConfig
              ?.show_public_btn ?? viewTemp?.btn_cfg?.show_public_btn ?? null,
            show: viewTemp?.btn_cfg?.show || true,
            bg_style: this.listConfig?.btn_cfg?.bg_style || viewTemp?.btn_cfg?.bg_style || 'line',
            bg: this.listConfig?.btn_cfg?.bg || viewTemp?.btn_cfg?.bg,
            width: this.listConfig?.btn_cfg?.width || viewTemp?.btn_cfg?.width,
            height: this.listConfig?.btn_cfg?.height || viewTemp?.btn_cfg?.height,
            color: this.listConfig?.btn_cfg?.color || viewTemp?.btn_cfg?.color,
            font_size: this.listConfig?.btn_cfg?.font_size || viewTemp?.btn_cfg?.font_size,
            radius: this.listConfig?.btn_cfg?.radius || this.listConfig?.btn_cfg?.radius || viewTemp?.btn_cfg
              ?.radius || '10px',
            size: this.listConfig?.btn_cfg?.size || viewTemp?.btn_cfg?.size || '',
            margin: this.listConfig?.btn_cfg?.margin ?? viewTemp?.btn_cfg
              ?.margin,
            padding: this.listConfig?.btn_cfg?.padding || viewTemp?.btn_cfg?.padding || null,
            icon: this.listConfig?.btn_cfg?.icon || viewTemp?.btn_cfg?.icon || null,
            position: this.listConfig?.btn_cfg?.position || viewTemp?.btn_cfg?.position || null
          },
          img: {
            col: this.listConfig?.img?.col || viewTemp?.img?.col,
            icon: this.listConfig?.img?.icon || viewTemp?.img?.icon,
            cfg: {
              "padding": this.listConfig?.img?.cfg?.padding || this.listConfig?.img?.padding || viewTemp?.img
                ?.cfg?.padding || '',
              "margin": this.listConfig?.img?.cfg?.margin || this.listConfig?.img?.margin || viewTemp?.img
                ?.cfg?.margin || '',
              'border': this.listConfig?.img?.cfg?.border || this.listConfig?.img?.border || viewTemp?.img
                ?.cfg?.border || '',
              width: this.listConfig?.img?.cfg?.width || this.listConfig?.img?.width || viewTemp?.img
                ?.cfg?.width || '100%',
              height: this.listConfig?.img?.cfg?.height || this.listConfig?.img?.height || viewTemp?.img
                ?.cfg?.height || '150rpx',
              radius: this.listConfig?.img?.cfg?.radius || viewTemp?.img?.cfg?.radius || '10px 10px 0 0',
              position: this.listConfig?.img?.cfg?.position || viewTemp?.img?.cfg?.position || 'top',
              mode: this.listConfig?.img?.cfg?.mode || this.listConfig?.img?.mode || viewTemp?.img?.cfg
                ?.mode || ''
            }
          },
          right_content: this.listConfig?.right_content || viewTemp?.right_content,
          cols: this.listConfig?.cols || viewTemp?.cols
        };
        return obj;
      },
      labelMap() {
        if (Array.isArray(this.colV2?._fieldInfo)) {
          return this.colV2._fieldInfo.reduce((res, cur) => {
            res[cur.columns] = cur.label;
            return res;
          }, {});
        }
      }
    },
    data() {
      return {
        childData: {}, // 模板的cols中类型为childData的数据
      }
    },

    methods: {
      checkboxChange(e) {
        if (this.setRadioDisabled(e) !== true) {
          this.$emit('checkboxChange', e);
        }
      },
      add2Cart(e) {
        this.$emit('add2Cart', e);
      },
      del2Cart(e) {
        this.$emit('del2Cart', e);
      },
      clickFootBtn(e) {
        this.$emit('click-foot-btn', e);
      },
      setRadioDisabled(e) {
        if (!this.disabledCol) {
          return false
        }
        if (e && (e[this.disabledCol] === true || e[this.disabledCol] === 1)) {
          return true
        } else {
          return false
        }
      },
    }
  };
</script>

<style lang="scss" scoped>
  .list-wrap {

    // margin-bottom: 10px;
    // padding: 10px;
    &.no-wrap {
      display: flex;
      flex-wrap: wrap;
    }

    .check-box-group {
      display: flex;
      flex-wrap: wrap;
    }

    .check-box-item {
      display: flex;
      // align-items: center;
      width: 100%;
      // padding: 0 10px;
      margin-bottom: 10px;
      margin-right: 10px;
      // background-color: #fff;
      border-radius: 10px;

      &.check-box_item {
        background-color: #fff;
        border-radius: 10px;
        align-items: center;

        // margin: 10px;
        // width: calc(100% - 20px);
        &.disabled {
          opacity: 0.5;
        }
      }

      .list-item-wrap {
        flex: 1;
        display: infl;
        max-width: 100%;
      }
    }

    @media screen and (max-width: 450px) {
      .list-item-wrap {}

      &.grid-layout {
        padding-top: 0 !important;

        [class^='grid_span'] {
          min-width: 0;
        }
      }
    }

    @media screen and (min-width: 450px) {
      display: flex;
      flex-wrap: wrap;
      padding-left: 10px;

      &.grid-layout {
        padding-top: 0 !important;
      }

      .list-item-wrap {
        // margin-right: 10px;
        width: calc(50% - 10px);
      }
    }

    @media screen and (min-width: 800px) {
      .list-item-wrap {
        width: inherit;
        width: calc(25% - 10px);
      }
    }

    @media screen and (min-width: 1200px) {
      .list-item-wrap {
        width: calc(20% - 10px);
      }
    }

    @media screen and (min-width: 1600px) {
      .list-item-wrap {
        width: calc(12.5% - 10px);
      }
    }
  }

  .grid-layout {
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;

    .list-item-wrap {
      width: 100%;
    }

    .grid_span2 {
      width: calc(100% / 2 - 15rpx);
      // margin-right: 20rpx;
      // margin-bottom: 20rpx;
      // padding: 0;
      // margin-right: 0;
      // padding-right: 0;

      .list-item-wrap {
        margin-right: 0;
        padding: 0px;

        .list-item-content {
          padding: 10px;
        }

      }

      &:nth-child(2n+1) {
        padding-right: 0;
      }

      &:nth-child(2n) {
        margin-right: 0;
        padding-left: 0;
      }
    }

    .grid_span3 {
      width: calc(100% / 3 - 50rpx / 3);
      // margin-right: 20rpx;
      margin-bottom: 20rpx;

      &:nth-child(3n) {
        margin-right: 0;
      }
    }

    .grid_span4 {
      width: calc(100% / 4 - 70rpx / 4);
      // margin-right: 20rpx;
      margin-bottom: 20rpx;

      &:nth-child(4n) {
        margin-right: 0;
      }
    }

    .grid_span5 {
      width: calc(100% / 5 - 90rpx / 5);
      // margin-right: 20rpx;
      margin-bottom: 20rpx;

      &:nth-child(5n) {
        margin-right: 0;
      }
    }

    @media screen and (min-width: 1000px) {
      .grid_span2 {
        width: calc(100% / 4 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(2n) {
          margin-right: 20rpx;
        }

        &:nth-child(4n) {
          margin-right: 20rpx;
        }

        &:nth-child(4n) {
          margin-right: 0;
        }
      }

      .grid_span3 {
        width: calc(100% / 5 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(3n) {
          margin-right: 20rpx;
        }

        &:nth-child(6n) {
          margin-right: 20rpx;
        }

        &:nth-child(5n) {
          margin-right: 0;
        }
      }

      .grid_span4 {
        width: calc(100% / 6 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(4n) {
          margin-right: 20rpx;
        }

        &:nth-child(8n) {
          margin-right: 20rpx;
        }

        &:nth-child(6n) {
          margin-right: 0;
        }
      }

      .grid_span5 {
        width: calc(100% / 7 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(5n) {
          margin-right: 20rpx;
        }

        &:nth-child(10n) {
          margin-right: 20rpx;
        }

        &:nth-child(7n) {
          margin-right: 0;
        }
      }
    }

    @media screen and (min-width: 1300px) {
      .grid_span2 {
        width: calc(100% / 4 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(2n) {
          margin-right: 20rpx;
        }

        &:nth-child(4n) {
          margin-right: 0;
        }
      }

      .grid_span3 {
        width: calc(100% / 7 - 20rpx);
        // margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(3n) {
          margin-right: 20rpx;
        }

        &:nth-child(5n) {
          margin-right: 20rpx;
        }

        &:nth-child(7n) {
          margin-right: 0;
        }
      }

      .grid_span4 {
        width: calc(100% / 6 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(4n) {
          margin-right: 20rpx;
        }

        &:nth-child(6n) {
          margin-right: 0;
        }
      }

      .grid_span5 {
        width: calc(100% / 7 - 20rpx);
        margin-right: 20rpx;
        margin-bottom: 20rpx;

        &:nth-child(5n) {
          margin-right: 20rpx;
        }

        &:nth-child(7n) {
          margin-right: 0;
        }
      }
    }
  }
</style>
