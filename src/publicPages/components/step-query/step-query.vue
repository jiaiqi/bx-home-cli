<template>
  <view class="step-query" :class="['theme-'+theme]">
    <view class="top-float" @click="open">
      <view class="">
        {{title||'筛选条件'}}
      </view>
      <view class="">
        <text class="cuIcon-unfold margin-lr-xs"></text>
      </view>
    </view>
    <view class="cu-modal top-modal" :class="{show:show}" @touchstart.stop="">
      <view class="cu-dialog">
        <view class="form-box">
          <a-form :fields="filterCols" :srvApp="srvApp" ref='filterForm' pageType="filter" v-if="filterCols"
            @value-blur="setData"></a-form>
          <view class="tip" v-if="!filterCols|| filterCols.length===0">
            没有可筛选字段
          </view>
        </view>
        <view class="button-box">
          <button class="cu-btn bg-green light round margin-right-xs lg " @click="reset"><text
              class="cuIcon-refresh margin-right-xs "></text>重置</button>
          <!--      <button class="cu-btn bg-grey light" @click="close"><text
                  class="cuIcon-close margin-right-xs "></text>取消</button> -->
          <button class="cu-btn bg-blue light confirm round lg" :class="{' bx-bg-color':theme}" @click="toFilter">
            <text class="cuIcon-search margin-right-xs"></text>
            <text>确定</text>
          </button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  // 步骤查询
  export default {
    props: {
      fieldInfo: {
        type: [Object, Array]
      },
      srvApp: {
        type: String
      },
      title:String
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      // showConfirm() {
      //   return typeof this.model === 'object' && Object.keys(this.model).length > 0
      // },
    },
    data() {
      return {
        model: {},
        filterCols: [],
        show: true
      }
    },
    methods: {
      setData(e, triggerField) {
        const column = triggerField.column
        if (this.model && typeof this.model === 'object') {
          this.model[column] = triggerField.value
        }
      },
      toFilter() {
        let model = this.$refs.filterForm.getFieldModel();
        console.log(model)
        
        if (model && typeof model === 'object' && Object.keys(model).length > 0 && Object.keys(model).some(key => !!
            model[key] == true)) {

          let result = []
          this.filterCols = this.filterCols.map((item) => {
            if (model[item.column]) {
              item['value'] = model[item.column]
              result.push(item)
            }
            return item
          })
          if (Array.isArray(result)) {
            let cond = result.filter(item => item.value !== '全部' && item.column).map(item => {
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
          }
          this.close()
        } else {
          uni.showModal({
            title: '提示',
            content: '请输入筛选条件',
            showCancel: false
          })
        }
      },
      close() {
        this.show = false
      },
      open() {
        this.show = true
      },
      reset() {
        this.filterCols = []
        if (Array.isArray(this.fieldInfo)) {
          let filterCols = this.fieldInfo
          let model = this.fieldInfo.reduce((res, cur) => {
            if (cur.value) {
              res[cur.column] = cur.value
            } else if (cur.defaultValue) {
              res[cur.column] = cur.defaultValue
            }
            return res
          }, {})
          filterCols = filterCols.map(item => {
            item.value = null
            if (item.defaultValue) {
              item.value = item.defaultValue
            }
            if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2
              .conditions
              .length > 0) {
              let data = model || {}
              item.option_list_v2.conditions = this.evalConditions(item.option_list_v2
                .conditions, data)
            }
            if (['date', 'dateTime', 'time', 'Time', 'Date'].includes(item.type)) {
              item.startVal = ''
              item.endVal = ''
            }
            if (item.type === 'TreeSelector') {
              item.value = ''
              item.colData = null
            }
            return item
          })
          let ignoreType = ['images', 'input', 'text', 'number']
          ignoreType = ['images']
          console.log(this.deepClone(filterCols))
          this.filterCols = filterCols.filter(item => (item.in_cond === 1 || item.in_cond_def == 1) && item.in_list ===
            1 && !ignoreType
            .includes(item.type) && !/^\_.*\_disp$/.test(item.column))
        }
      }
    },
    mounted() {
      this.reset()
    }
  }
</script>

<style scoped lang="scss">
  .step-query {
    padding-top: 40px;
    position: relative;

    .top-float {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 0;
      top: 0;
    }

    .form-box {
      max-height: 80vh;
      overflow-y: scroll;
    }

    .cu-modal {
      display: block;
      overflow: hidden;
    }
  }

  .button-box {
    background: #fff;
    padding: 20px 10px;
    margin: 0;
    justify-content: center;
    position: relative;

    .reset {
      position: absolute;
      right: 0;
    }

    .confirm {
      min-width: 45%;
    }
  }
</style>
