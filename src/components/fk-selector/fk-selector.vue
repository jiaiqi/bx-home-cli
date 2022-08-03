<template>
  <view class="fk-selector">
    <view class="header-bar flex padding align-center ">
      <view class="search-form round">
        <input @input="onSearch" type="text" placeholder="搜索" confirm-type="search" />
      </view>
      <button class="cu-btn cuIcon-refresh   round bg-gray  margin-right-xs" @click.stop="refresh"></button>
      <button class="cu-btn cuIcon-add   round bg-gray  margin-right-xs" @click.stop="toAdd"></button>
    </view>
  </view>
</template>

<script>
  export default {
    name: "fk-selector",
    props: {
      fieldsModel: {
        type: Object,
        default: () => {
          return {}
        }
      },
      srvApp: {
        type: String,
        default: () => {
          return uni.getStorageSync('activeApp')
        }
      },
      optionCfg: {
        type: [Object, Array],
        // default: () => {
        //   return {
        //     "refed_col": "c_name",
        //     "srv_app": "person",
        //     "select_type": "自行输入",
        //     "serviceName": "srvperson_classify_select",
        //     "key_disp_col": "c_name",
        //     "conditions": [{
        //       "colName": "parent_no",
        //       "ruleType": "eq",
        //       "value": "'PC2203290001'"
        //     }]
        //   }
        // }
      },
    },
    mounted() {
      this.getOption()
    },
    methods: {
      onSearch() {},
      refresh() {
        this.pageNo = 1
        this.searchVal = ''
        this.getOption()
      },
      toAdd() {},
      getOption() {
        if (this.optionCfg?.serviceName && this.srvApp) {
          const url = `/${this.srvApp}/select/${this.optionCfg.serviceName}`
          const req = {
            "serviceName": this.optionCfg.serviceName,
            "colNames": ["*"],
            "condition": [],
            "page": {
              "pageNo": this.pageNo,
              "rownumber": this.rownumber
            }
          }
          if (Array.isArray(this.optionCfg?.conditions) && this.optionCfg?.conditions.length > 0) {
            let condition = this.optionCfg?.conditions
            const model = this.deepClone(this.fieldsModel || {})
            req.condition = this.evalConditions(condition, model)
          }
          this.$http.post(url, req).then(res => {
            this.options = res.data.data
          })
        }
      },
    },
    data() {
      return {
        pageNo: 1,
        rownumber: 30,
        options: [],
        searchVal: ''
      };
    }
  }
</script>

<style lang="scss">
  // .cu-modal{
  //   display: block;
  // }
  .fk-selector {
    .header-bar {
      .search-form {
        background-color: #F5F5F5;
        padding: 5px 20px;
        text-align: left;
        margin-right: 10rpx;
        flex: 1;
      }
    }
  }
</style>
