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
      listConfig: {
        type: Object
      }
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
          "lp_style": this.listConfig?.lp_style || viewTemp?.lp_style || "复合",
          "grid_span": this.listConfig?.grid_span || viewTemp?.grid_span || "2",
          'margin': viewTemp?.margin,
          'padding': viewTemp?.padding,
          "btn_cfg": {
            "show_custom_btn": this.listConfig?.show_custom_btn ?? viewTemp?.btn_cfg?.show_custom_btn ?? null,
            "show_public_btn": this.listConfig?.show_public_btn ?? viewTemp?.btn_cfg?.show_public_btn ??
              null,
            "show": viewTemp?.btn_cfg?.show || true,
            "bg_style": viewTemp?.btn_cfg?.bg_style || "line",
            "bg": viewTemp?.btn_cfg?.bg,
            'color': viewTemp?.btn_cfg?.color,
            "font_size": viewTemp?.btn_cfg?.font_size,
            "radius": viewTemp?.btn_cfg?.radius || "10px",
            "size": viewTemp?.btn_cfg?.size || "sm",
            "padding": viewTemp?.btn_cfg?.padding || null
          },
          "img": {
            "col": viewTemp?.img?.col,
            "cfg": {
              "width": this.listConfig?.img?.width || viewTemp?.img?.cfg?.width || "100%",
              "height": this.listConfig?.img?.height || viewTemp?.img?.cfg?.height || "150rpx",
              "radius": viewTemp?.img?.cfg?.radius || "10px 10px 0 0",
              "position": viewTemp?.img?.cfg?.position || "top",
              "mode": this.listConfig?.img?.mode || viewTemp?.img?.cfg?.mode || ""
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
      width: calc(100%/2 - 15rpx);
      margin-right: 20rpx;
      
      &:nth-child(2n) {
        margin-right: 0;
      }
    }

    .grid_span3 {
      width: calc(100%/3 - 50rpx/3);
      margin-right: 20rpx;

      &:nth-child(3n) {
        margin-right: 0;
      }
    }

    .grid_span4 {
      width: calc(100%/4 - 70rpx/4);
      margin-right: 20rpx;

      &:nth-child(4n) {
        margin-right: 0;
      }
    }

    .grid_span5 {
      width: calc(100%/5 - 90rpx/5);
      margin-right: 20rpx;

      &:nth-child(5n) {
        margin-right: 0;
      }
    }
  }
</style>
