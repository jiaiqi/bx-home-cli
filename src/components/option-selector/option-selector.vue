<template>

  <view class="tree-selector">
    <view class="content">
      <view class="cu-bar search bg-white" v-if="showSearch">
        <view class="search-form round">
          <input @input="onSearch" type="text" placeholder="搜索" confirm-type="search" />
        </view>
        <text class="cu-btn cuIcon-refresh line-blue shadow round margin-right-xs" @click.stop="refresh"></text>
        <text class="cu-btn cuIcon-add line-blue shadow round margin-right-xs" @click.stop="toFkAdd">
        </text>
      </view>
      <view class="option-box">
        <bx-checkbox-group v-if="modalName === 'MultiSelector'" @change="onChange"
          class="form-item-content_value checkbox-group" v-model="curVal" mode="button">
          <bx-checkbox v-for="item in options" :key="item.value" :name="item.value" v-model="item.checked">
            {{ item.label }}
          </bx-checkbox>
        </bx-checkbox-group>
        <bx-radio-group class="form-item-content_value radio-group" mode="button" @change="onChange" v-model="curVal"
          v-else-if="modalName === 'Selector'">
          <bx-radio v-for="item in options" :key="item.value" :name="item.value">{{ item.label }}
          </bx-radio>
          <bx-radio name="__others" v-if="selectType==='自行输入'">其它</bx-radio>
          <view class="other-val" v-if="curVal==='__others'">
            <input type="text" class="input-value" v-model="otherNodeVal" placeholder="输入其它" @input="selectorInput" />
          </view>
          <view v-if="hasNext" @click.stop="loadMore" class="cu-btn bx-btn-bg round">加载更多</view>
        </bx-radio-group>
      </view>
    </view>
    <view class="dialog-button">
      <view class="cu-btn bg-blue shadow" @tap="hideModal"
        v-if="modalName === 'MultiSelector'||(modalName === 'Selector'&&otherNodeVal)">确定
      </view>
      <view class="cu-btn bg-grey shadow" @tap="hideModal"
        v-if="modalName === 'Selector'&&selectType!=='自行输入'&&curVal!=='__others'">取消
      </view>
    </view>
  </view>


</template>

<script>
  export default {
    name: "option-selector",
    props: {
      modalName: {
        type: String,
      },
      selectType: {
        type: String
      },
      options: {
        type: Array
      },
      hasNext: {
        type: Boolean
      },
      showSearch: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        curVal: "",
        otherNodeVal: ""
      };
    },
    created() {
      console.log('selectType,', this.selectType)
    },
    methods: {
      hideModal() {
        if (this.selectType === '自行输入' && this.curVal === '__others') {
          this.$emit('change', {
            type: "__others",
            value: this.otherNodeVal
          })
        } else {
          this.$emit('hide')
        }
      },
      onSearch(e) {
        this.$emit('search', e)
      },
      refresh() {
        this.$emit('refresh')
      },
      toFkAdd() {
        this.$emit('toFkAdd')
      },

      selectorInput(e) {
        this.otherNodeVal = e?.detail?.value
      },
      onChange(e) {
        this.curVal = e
        if (e == '__others') {

        } else {
          this.$emit('change', e)
        }
      },
      loadMore() {
        this.$emit('load-more')
      }
    },
  }
</script>

<style lang="scss" scoped>
  .tree-selector {

    min-height: 300rpx;
    max-height: calc(90vh - var(--window-top) - var(--window-bottom));
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    padding: 20rpx 10rpx;

    //   &.cascader {
    //     background-color: #f1f1f1;
    //     padding: 0;
    //   }

    .content {
      flex: 1;
      background-color: #fff;
      min-height: 30vh;
      position: inherit;
      width: 100%;
      pointer-events: auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .option-box {
        flex: 1;
        overflow: scroll;

        .other-val {
          min-height: 30px;
          display: flex;
          align-items: flex-end;
          margin-left: 10px;

          .input-value {
            flex: 1;
            min-height: 30px;
            line-height: 30px;
            border-bottom: 1px solid #ccc;
          }
        }
      }

      .bx-radio-group {
        margin: 0 20rpx;
        max-height: 60vh;
        overflow-y: scroll;
      }


    }

    .dialog-button {
      padding: 10px;

      .cu-btn {
        min-width: 40%;
      }
    }

  }
</style>
