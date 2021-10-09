<template>
  <view>
    <view class="list-wrap" :class="{
      'grid-layout':setViewTemp&&setViewTemp.lp_style==='宫格'
    }">
      <list-item v-for="(item,index) in list" :key="index" :class="{
        'grid_span2':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='2'||setViewTemp.grid_span===2),
        'grid_span3':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='3'||setViewTemp.grid_span===3),
        'grid_span4':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='4'||setViewTemp.grid_span===4),
        'grid_span5':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='5'||setViewTemp.grid_span===5)
      }" class="list-item-wrap" :viewTemp="setViewTemp" :labelMap="labelMap" :listType="listType" :rowData="item"
        :rowButton="rowButton" @click-foot-btn="clickFootBtn" @add2Cart="add2Cart">
      </list-item>
    </view>
  </view>
</template>

<script>
  import listItem from './list-item.vue'
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

    },
    computed: {
      rowButton() {
        return this.colV2?.rowButton
      },
      moreConfig() {
        let result = null
        if (this.colV2?.more_config) {
          if (typeof this.colV2.more_config === 'string') {
            try {
              result = JSON.parse(this.colV2.more_config)
            } catch (e) {
              //TODO handle the exception
            }
          } else if (typeof this.colV2.more_config === 'object') {
            result = this.colV2.more_config
          }
        }
        return result
      },
      viewTemp() {
        return this.moreConfig?.list_config
      },
      setViewTemp() {
        let viewTemp = this.viewTemp
        let obj = {
          "lp_style": this.viewTemp?.lp_style || "复合",
          "grid_span": this.viewTemp?.grid_span || "2",
          'margin': this.viewTemp?.margin,
          'padding': this.viewTemp?.padding,
          "btn_cfg": {
            "show_custom_btn": this.viewTemp?.btn_cfg?.show_custom_btn || true,
            "show_public_btn": this.viewTemp?.btn_cfg?.show_public_btn ||
              true,
            "show": this.viewTemp?.btn_cfg?.show || true,
            "bg_style": this.viewTemp?.btn_cfg?.bg_style || "line",
            "bg": this.viewTemp?.btn_cfg?.bg,
            'color': this.viewTemp?.btn_cfg?.color,
            "font_size": this.viewTemp?.btn_cfg?.font_size,
            "radius": this.viewTemp?.btn_cfg?.radius || "10px",
            "size": this.viewTemp?.btn_cfg?.size || "sm",
            "padding": this.viewTemp?.btn_cfg?.padding || null
          },
          "img": {
            "col": this.viewTemp?.img?.col,
            "cfg": this.viewTemp?.img?.cfg || {
              "radius": "50%",
              "position": "left",
              "mode": "aspectFill"
            }
          },
          cols: viewTemp?.cols
        }
        return obj
      },
      labelMap() {
        if (Array.isArray(this.colV2?._fieldInfo)) {
          return this.colV2._fieldInfo.reduce((res, cur) => {
            res[cur.columns] = cur.label
            return res
          }, {})
        }
      },
    },
    data() {
      return {

      }
    },
    methods: {
      add2Cart(e) {
        this.$emit('add2Cart', e)
      },
      clickFootBtn(e) {
        this.$emit('click-foot-btn', e)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .grid-layout {
    display: flex;
    flex-wrap: wrap;
    padding: 0 20rpx;
    .grid_span2 {
      width: calc(100%/2 - 10rpx);
      margin-right: 20rpx;
    
      &:nth-child(2n) {
        margin-right: 0;
      }
    }
    
    .grid_span3 {
      width: calc(100%/3 - 40rpx/3);
      margin-right: 20rpx;
    
      &:nth-child(3n) {
        margin-right: 0;
      }
    }
    
    .grid_span4 {
      width: calc(100%/4 - 60rpx/4);
      margin-right: 20rpx;
    
      &:nth-child(4n) {
        margin-right: 0;
      }
    }
    
    .grid_span5 {
      width: calc(100%/5 - 80rpx/5);
      margin-right: 20rpx;
    
      &:nth-child(5n) {
        margin-right: 0;
      }
    }
  }
</style>
