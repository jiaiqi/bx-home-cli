<template>
  <view class="list-item-wrap" v-if="rowData">
    <view class="list-item" @click="clickItem">
      <view class="main-image" v-if="viewTemp&&viewTemp.img&&viewTemp.img.cfg&&viewTemp.img.cfg.align!=='right'">
        <image class="image" :src="getImagePath(rowData[viewTemp.img.col])" :mode="viewTemp.img.cfg.mode||'aspectFill'"
          :style="{
            'border-radius':viewTemp.img.cfg.radius
          }"></image>
      </view>
      <view class="list-item-content" v-if="viewTemp&&viewTemp.cols">
        <view class="col-item bg" v-for="item in viewTemp.cols" :style="{
          'width':item.cfg.width,
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
        <!--   <view class="foot-button-box">
          <button class="cu-btn" v-for="btn in setRowButton">{{btn.button_name}}</button>
        </view> -->
      </view>
      <view class="main-image"
        v-if="viewTemp&&viewTemp.columns&&viewTemp.columns.img&&viewTemp.columns.img.align=='right'">
        <image class="image" :src="getImagePath(rowData[viewTemp.columns.img.col])"
          :mode="viewTemp.columns.img.mode||'aspectFill'"></image>
      </view>

    </view>
    <view class="foot-button-box">
      <button class="cu-btn" :class="{
        'sm':viewTemp.btn_cfg&&viewTemp.btn_cfg.size==='sm'
      }" v-for="btn in setRowButton" v-show="btn.button_type!=='detail'">{{btn.button_name}}</button>
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
      clickItem() {
        if (this.detailBtn?.button_type) {
          this.$emit('clickItem', {
            row: this.rowData,
            btn: this.detailBtn
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

    .list-item {
      width: 100%;
      display: flex;
      flex-wrap: wrap;

      .main-image {
        width: 100rpx;
        height: 100rpx;
        margin-right: 20rpx;

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
          width: 50%;
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;
          font-size: 28rpx;
          font-family: 苹方-简;
          color: #333333;

          .label {
            margin-right: 10rpx;
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
