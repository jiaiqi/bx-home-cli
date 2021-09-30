<template>
  <view class="list-item-wrap" v-if="rowData&&setViewTemp" :class="{
    'grid_span2':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='2'||setViewTemp.grid_span===2),
    'grid_span3':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='3'||setViewTemp.grid_span===3),
    'grid_span4':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='4'||setViewTemp.grid_span===4),
    'grid_span5':setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp&&(setViewTemp.grid_span==='5'||setViewTemp.grid_span===5)
  }" :style="{
    'margin':setViewTemp.margin,
    'padding':setViewTemp.padding,
  }">
    <view class="list-item" @click="clickItem">
      <view class="main-image" :style="{
        'border-radius':setViewTemp.img.cfg.radius,
        'width':setViewTemp.img.cfg.width,
        'margin':setViewTemp.img.cfg.margin,
        'padding':setViewTemp.img.cfg.padding,
      }" :class="{
        'm-r-0':setViewTemp.img.cfg.position==='top'
      }"
        v-if="setViewTemp&&setViewTemp.img&&setViewTemp.img.cfg&&setViewTemp.img.cfg.position!=='right'&&rowData[setViewTemp.img.col]">
        <image class="image" :src="getImagePath(rowData[setViewTemp.img.col])"
          :mode="setViewTemp.img.cfg.mode||'aspectFill'" :style="{
            'border-radius':setViewTemp.img.cfg.radius,
            'width':setViewTemp.img.cfg.width
          }"></image>
      </view>
      <view class="list-item-content" v-if="setViewTemp&&setViewTemp.cols">
        <view class="col-item bg" v-for="item in setViewTemp.cols" :style="{
          'width':item.cfg.width,
          'min-width':item.cfg.min_width,
          'padding':item.cfg.padding,
          'font-size':item.cfg.font_size,
          'font-weight':item.cfg.font_weight,
          'text-align':item.cfg.align,
          'color':item.cfg.color,
          'justify-content':item.cfg.align==='left'?'flex-start':item.cfg.align==='right'?'flex-end':item.cfg.align
        }" :class="{
          'cu-btn':item.cfg.style==='button'||item.cfg.style==='line_button',
          'border':item.cfg.style==='line_button',
          'round':item.cfg.round===true,
          'light':item.cfg.light===true,
          'sm':item.cfg.size==='sm',
          'lg':item.cfg.size==='lg',
          'bg-blue':item.cfg.bg==='blue',
          'bg-red':item.cfg.bg==='red',
          'bg-orange':item.cfg.bg==='orange',
          'bg-cyan':item.cfg.bg==='cyan',
          'bg-yellow':item.cfg.bg==='yellow',
          'bg-white':item.cfg.bg==='white',
          'bg-black':item.cfg.bg==='black',
          'bg-green':item.cfg.bg==='green',
          'bg-grey':item.cfg.bg==='grey',
          'bg-gray':item.cfg.bg==='gray',
          'line-blue':item.cfg.border_color==='blue',
          'line-red':item.cfg.border_color==='red',
          'line-orange':item.cfg.border_color==='orange',
          'line-cyan':item.cfg.border_color==='cyan',
          'line-yellow':item.cfg.border_color==='yellow',
          'line-white':item.cfg.border_color==='white',
          'line-black':item.cfg.border_color==='black',
          'line-green':item.cfg.border_color==='green',
          'line-grey':item.cfg.border_color==='grey',
          'line-gray':item.cfg.border_color==='gray',
        }">
          <view class="label" v-if="item.cfg.disp_label&&labelMap[item.col]">
            {{labelMap[item.col]||''}}:
          </view>
          <view class="value">
            {{rowData[item.col]||''}}
          </view>
        </view>

        <text class="cuIcon-moreandroid" @click.stop="showAction"
          v-if="setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp.grid_span>=3"></text>
        <!--   <view class="foot-button-box">
          <button class="cu-btn" v-for="btn in setRowButton">{{btn.button_name}}</button>
        </view> -->
      </view>
      <view class="main-image"
        v-if="setViewTemp&&setViewTemp.columns&&setViewTemp.columns.img&&setViewTemp.columns.img.position=='right'">
        <image class="image" :src="getImagePath(rowData[setViewTemp.columns.img.col])"
          :mode="setViewTemp.columns.img.mode||'aspectFill'"></image>
      </view>

    </view>
    <view class="foot-button-box" v-if="setViewTemp&&setViewTemp.lp_style==='宫格'&&setViewTemp.grid_span>=3">
      <!-- <button class="cu-btn sm round" @click="showAction"><text class="cuIcon-moreandroid"></text></button> -->
    </view>
    <view class="foot-button-box" v-else>
      <button class="cu-btn" :class="{
        'sm':setViewTemp&&setViewTemp.btn_cfg&&setViewTemp.btn_cfg.size==='sm'
      }" v-for="btn in setRowButton" v-show="btn.button_type!=='detail'"
        @click.stop="clickButton(btn)">{{btn.button_name}}</button>
    </view>
  </view>
</template>

<script>
  export default {
    props: {
      // 行数据
      rowData: {
        type: Object
      },
      // 底部按钮
      rowButton: {
        type: Array
      },
      // 视图模板
      viewTemp: {
        type: Object
      },
      // 字段-显示标签
      labelMap: {
        type: Object
      }
    },
    computed: {
      setViewTemp() {
        let obj = {
          "lp_style": this.viewTemp?.lp_style || "单行",
          "grid_span": this.viewTemp?.grid_span || "3",
          'margin': this.viewTemp?.margin,
          'padding': this.viewTemp?.padding,
          "btn_cfg": this.viewTemp?.btn_cfg,
          "img": {
            "col": this.viewTemp?.img?.col,
            "cfg": this.viewTemp?.img?.cfg || {
              "radius": "50%",
              "position": "left",
              "mode": "aspectFill"
            }
          },
          cols: []
        }
        if (Array.isArray(this.viewTemp?.cols) && this.viewTemp?.cols.length > 0) {
          obj.cols = this.viewTemp?.cols
        } else {
          if (typeof this.rowData === 'object' && Object.keys(this.rowData).length > 0) {
            let arr = []
            Object.keys(this.rowData).forEach((key) => {
              if (!['id', 'create_time', 'create_user', 'modify_time', 'modify_user', 'create_user_disp',
                  'modify_user_disp'
                ].includes(key)) {
                let col = {
                  "col": key,
                  "cfg": {
                    "disp_label": true,
                    "align": "left",
                    "color": "#333",
                    "min_width": "50%",
                    "font_size": "14px",
                    "padding": "0 10rpx 0 0"
                  }
                }
                if (arr.length < 10) {
                  arr.push(col)
                }
              }
            })
            obj.cols = arr
          }
        }
        return obj
      },
      detailBtn() {
        return this.setRowButton.find(item => item.button_type === 'detail')
      },
      setRowButton() {
        return this.rowButton.filter((item, index) => {
          if (Array.isArray(this.rowData?._buttons) && this.rowData._buttons.length === this.rowButton.length) {
            return this.rowData._buttons[index] === 1
          }
          return true
        })
      }
    },
    methods: {
      showAction() {
        let itemList = this.setRowButton.map(item => item.button_name)
        uni.showActionSheet({
          itemList: itemList,
          success: (res) => {
            console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
            let btn = this.setRowButton[res.tapIndex]
            this.clickButton(btn)
          },
          fail: function(res) {
            console.log(res.errMsg);
          }
        });
      },
      clickButton(btn) {
        this.$emit('click-foot-btn', {
          row: this.rowData,
          button: btn
        })
      },
      clickItem() {
        if (this.detailBtn?.button_type) {
          this.$emit('click-foot-btn', {
            row: this.rowData,
            button: this.detailBtn
          })
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  .list-item-wrap {
    width: 100%;
    background-color: #fff;
    margin-bottom: 20rpx;
    padding: 20rpx;
    display: flex;
    flex-wrap: wrap;
    border-radius: 20rpx;
    overflow: hidden;
    &.grid_span2 {
      width: calc(100%/2 - 10rpx);
      margin-right: 20rpx;

      &:nth-child(2n) {
        margin-right: 0;
      }
    }

    &.grid_span3 {
      width: calc(100%/3 - 40rpx/3);
      margin-right: 20rpx;

      &:nth-child(3n) {
        margin-right: 0;
      }
    }

    &.grid_span4 {
      width: calc(100%/4 - 60rpx/4);
      margin-right: 20rpx;

      &:nth-child(4n) {
        margin-right: 0;
      }
    }

    &.grid_span5 {
      width: calc(100%/5 - 80rpx/5);
      margin-right: 20rpx;

      &:nth-child(5n) {
        margin-right: 0;
      }
    }


    .list-item {
      width: 100%;
      display: flex;
      flex-wrap: wrap;

      .main-image {
        width: 100rpx;
        min-height: 100rpx;
        margin-right: 20rpx;

        &.m-r-0 {
          margin-right: 0;
          margin-bottom: 20rpx;
          border-radius: 0;

          .image {
            border-radius: 0;
          }
        }

        .image {
          width: 100%;
          height: 100%;
          border-radius: 20rpx;
        }
      }

      .list-item-content {
        flex: 1;
        display: flex;
        flex-wrap: wrap;

        .col-item {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 10rpx;
          font-size: 28rpx;
          font-family: 苹方-简;
          color: #333333;

          .label {
            margin-right: 10rpx;
          }
          .value{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }
        }
      }
    }

    .foot-button-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      width: 100%;

      .cu-btn {
        margin-right: 10rpx;
        margin-bottom: 10rpx;
      }
    }
  }
</style>
