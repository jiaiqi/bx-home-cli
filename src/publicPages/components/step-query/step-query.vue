<template>
  <view class="step-query" :class="['theme-'+theme]" @touchmove.stop.prevent>
    <view class="top-float" @click="open">
      <view class="">
        {{title||'筛选条件'}}
      </view>
      <view class="">
        <text class="cuIcon-unfold margin-lr-xs"></text>
      </view>
    </view>
    <view class="cu-modal top-modal" :class="{show:show}">
      <view class="cu-dialog">
        <view class="form-box">
          <a-form :fields="filterCols" :srvApp="srvApp" ref='filterForm' pageType="filter" v-if="filterCols"
            @value-blur="setData"></a-form>
          <view class="tip" v-if="filterCols&&filterCols.length===0">
            没有可筛选字段
          </view>
        </view>
        <view class="button-box">
          <button class="cu-btn bg-green light round margin-right-xs lg " @click="reset"><text
              class="cuIcon-refresh margin-right-xs "></text>重置</button>
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
      floatQueryCfg: {
        type: Object
      },
      fieldInfo: {
        type: [Object, Array]
      },
      srvApp: {
        type: String
      },
      title: String
    },
    computed: {
      theme() {
        return this.$store?.state?.app?.theme
      },
      addCfg() {
        return this.floatQueryCfg?.add_cfg
      },
      // showConfirm() {
      //   return typeof this.model === 'object' && Object.keys(this.model).length > 0
      // },
    },
    data() {
      return {
        model: {},
        filterCols: null,
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
      async sendAddService(model) {
        // let data = {}
        // if (Array.isArray(this.addCfg?.cols) && this.addCfg?.cols.length > 0) {
        //   this.addCfg.cols.forEach(col => {
        //     data[col] = model[col]
        //   })
        // }
        let data = this.deepClone(model)
        Object.keys(data).forEach(key => {
          if (data[key] === null) {
            delete data[key]
          }
        })
        if (this.addCfg?.service && this.addCfg?.app && this.addCfg?.send_request) {
          const {
            app,
            service
          } = this.addCfg
          const url = `/${app}/operate/${service}`
          const req = [{
            "serviceName": service,
            "data": [data]
          }]
          const res = await this.$http.post(url, req)
          console.log(res)
        }
      },
      toFilter() {
        let model = this.$refs.filterForm.getFieldModel();
        const cfg = this.deepClone(this.floatQueryCfg||{})
        // if(Array.isArray(this.floatQueryCfg?.use_last_value_cols)&&this.floatQueryCfg?.use_last_value_cols.length>0){
        //   this.floatQueryCfg?.use_last_value_cols.forEach(item=>{
        //     let cols = item.split(',').reverse()
        //     if(cols.length>0){
        //       let hasVal = false
        //       cols.forEach(col=>{
        //         if(model[col]){
        //           if(hasVal){
        //             delete model[col]
        //           }
        //           hasVal = true
        //         }
        //       })
        //     }
        //   })
        // }
        console.log(model);
        if (model && typeof model === 'object' && Object.keys(model).length > 0 && Object.keys(model).some(key => !!
            model[key] == true)) {
              
          if (this.addCfg?.send_request) {
            this.sendAddService(model)
          }

          let result = []
          this.filterCols = this.filterCols.map((item) => {
            if (model[item.column]) {
              if (this.floatQueryCfg?.use_add_v2 && Array.isArray(this.floatQueryCfg?.query_cols) && this
                .floatQueryCfg?.query_cols.length > 0) {
                const column = this.floatQueryCfg?.query_cols.find(e => e.add === item.column)
                if (column?.column) {
                  const obj = {
                    type: item.type,
                    col_type: item.col_type,
                    column: column?.column,
                    value: model[item.column],
                    ruleType: column.ruleType
                  }
                  result.push(obj)
                }
              } else {
                const obj = {
                  type: item.type,
                  col_type: item.col_type,
                  column: item.column,
                  value: model[item.column],
                  ruleType: item.ruleType
                }
                result.push(item)
              }
            }
            return item
          })
          const globalData = {
            data: model
          }

          if (Array.isArray(result) && result.length > 0) {
            let relationCondition = {}
            console.log(result);
            let cond = result.filter(item => item.value !== '全部' && item.column).map(item => {
              let obj = {
                colName: item.column,
                ruleType: item.ruleType || 'like',
                value: item.value
              }
              if (item.col_type === 'Set') {
                obj.ruleType = 'inset'
              }
              if (['date', 'dateTime', 'time', 'Time', 'Date'].includes(item.type) && Array.isArray(item
                  .value)) {
                obj.ruleType = 'between'
              }

              if (cfg?.relation_condition && cfg?.relation_condition[item.column]) {
                relationCondition = this.buildRelationCondition(cfg?.relation_condition[item.column], globalData)
                return false
              }
              return obj
            }).filter(item => item !== false)
            this.$emit('toFilter', cond, relationCondition)
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
      async getCols() {
        let app = this.addCfg?.app || this.srvApp || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.addCfg?.service, 'add', 'add', app);
        console.log(colVs)
        return colVs?._fieldInfo

      },
      async reset() {
        // this.filterCols = []
        let filelds = [];
        if (this.floatQueryCfg?.use_add_v2 === true) {
          // 字段使用add服务的字段
          filelds = await this.getCols() || []
        } else {
          if (Array.isArray(this.floatQueryCfg.query_cols) && this.floatQueryCfg.query_cols.length > 0) {
            filelds = this.fieldInfo.filter(item => this.floatQueryCfg.query_cols.find(e => e.column === item.column))
          }
        }

        if (Array.isArray(filelds) && filelds.length > 0) {
          let filterCols = filelds
          let model = filelds.reduce((res, cur) => {
            if (cur.value) {
              res[cur.column] = cur.value
            } else if (cur.defaultValue) {
              res[cur.column] = cur.defaultValue
            }
            return res
          }, {})
          filterCols = filterCols.map((item, index) => {

            item.value = null
            if (item.defaultValue) {
              item.value = item.defaultValue
            }

            if (['date', 'dateTime', 'time', 'Time', 'Date'].includes(item.type)) {
              item.startVal = ''
              item.endVal = ''
            }
            if (item.type === 'TreeSelector') {
              item.value = ''
              item.colData = null
            }
            this.$refs?.filterForm?.onReset?.()
            return item
          })
          let ignoreType = ['images', 'input', 'text', 'number']
          ignoreType = ['images']
          console.log(this.deepClone(filterCols))
          this.filterCols = filterCols.filter(item => !ignoreType.includes(item.type) && !/^\_.*\_disp$/.test(item
            .column))
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
      height: calc(100vh - 100px);
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
    align-items: flex-start;
    position: relative;
    height: 100px;

    .reset {
      position: absolute;
      right: 0;
    }

    .confirm {
      min-width: 45%;
    }
  }
</style>
