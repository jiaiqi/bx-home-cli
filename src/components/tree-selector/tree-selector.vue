<template>
  <view class="tree-selector-wrap">
    <view class="selected-node-wrap">
      <view class="selected-node-list">
        <view class="selected-node" :class="{'active':curNode==item[srvInfo.column||'no']}" v-for="item in selectedList"
          @click="clickSelected(item)">
          <text class="" v-if="item[srvInfo.showCol||'name']">{{item[srvInfo.showCol||'name']}}</text>
        </view>
        <view class="selected-node text-orange" v-if="!curNode||curNodeInfo&&curNodeInfo.is_leaf!=='是'">
          请选择
        </view>
      </view>
    </view>
    <view class="node-list-wrap">
      <view class="node-list">
        <view class="node-item round shadow-blur  cu-btn bg-white" v-for="item in nodeList" @click="clickNode(item)">
          <text class="" v-if="item[srvInfo.showCol||'name']">{{item[srvInfo.showCol||'name']}}</text>
        </view>
        <view class="node-item round shadow-blur  cu-btn bg-white" @click="clickNode('__others')">
          <text>其它</text>
        </view>
        <view v-if="selectType==='自行输入'&&curNode==='__others'" class="other-val">
          <input type="text" class="input-value" v-model="otherNodeVal" placeholder="输入其它" />
        </view>
      </view>
    </view>
    <view class="foot-button" v-if="!hideButton||needConfirm">
      <button class="cu-btn bg-green" @click="reset">重置</button>
      <button class="cu-btn bg-blue" @click="confirm" v-if="curNode">确定</button>
      <button class="cu-btn bg-grey" @click="cancel" v-else>取消</button>
    </view>
  </view>
</template>

<script>
  export default {
    name: "tree-selector",
    data() {
      return {
        otherNodeVal: "",
        selectedList: [],
        curNode: '', //当前节点
        curNodeInfo: {},
        page: {
          pageNo: 1,
          rownumber: 999
        },
        nodeList: []
      };
    },
    computed: {
      selectType() {
        return this.srvInfo?.select_type
      }
    },
    // created() {
    //   this.getData()
    // },
    methods: {
      onInput(e) {
        this.curNode = ''
      },
      clickSelected(e) {
        let index = this.selectedList.findIndex(item => item[this.srvInfo.column] === e[this.srvInfo.column])
        if (index !== -1) {
          this.selectedList = this.selectedList.slice(0, index)
        }
        if (index > 0) {
          this.curNode = this.selectedList[index - 1][this.srvInfo.column]
          this.curNodeInfo = this.selectedList[index - 1]
        } else {
          this.curNode = ''
          this.curNodeInfo = {}
        }
        debugger
        this.getData()
      },
      clickNode(e) {
        if (e === '__others') {
          this.curNodeInfo = e
          this.curNode = e
          return
        }
        this.otherNodeVal = ''
        this.curNode = e[this.srvInfo.column]
        this.curNodeInfo = e
        this.selectedList.push(e)
        if (e.is_leaf === '是') {
          // if (!this.needConfirm) {
          this.$emit('confirm', e)
          // }
        }
        this.getData()
      },
      cancel() {
        this.$emit('cancel', this.curNodeInfo)
      },
      confirm() {
        // 确认
        if (this.selectType === '自行输入') {
          this.$emit('confirm', {
            value: this.otherNodeVal,
            type: this.selectType
          })
        } else {
          this.$emit('confirm', this.curNodeInfo)
        }
      },
      reset() {
        // 重置
        this.curNode = ''
        this.curNodeInfo = ''
        this.selectedList = []
        this.getData()
      },
      async getData(cond) {
        // 查找节点数据
        const srvInfo = this.deepClone(this.srvInfo);
        const serviceName = srvInfo.serviceName;
        const appName = srvInfo.appNo || this.srvApp;
        const that = this;
        let url = this.getServiceUrl(appName, serviceName, 'select');
        let condition = [];
        let fieldModelsData = this.deepClone(this.fieldsModel);
        if (cond) {
          condition = cond;
        } else if (srvInfo.isTree === false) {
          condition = [];
        } else {
          if (this.curNode) {
            condition = [{
              colName: this.srvInfo?.parentCol || 'parent_no',
              ruleType: 'eq',
              value: this.curNode
            }];
          } else {
            if (Array.isArray(srvInfo?.conditions) &&
              srvInfo.conditions.length > 0) {
              condition = this.deepClone(srvInfo.conditions);
              condition = this.evalConditions(condition, fieldModelsData)
              condition = condition.map(item => {
                if (item.value && item.value.indexOf('data.') !== -1) {
                  let colName = item.value.slice(item.value.indexOf('data.') + 5);
                  if (fieldModelsData[colName]) {
                    item.value = fieldModelsData[colName];
                  }
                } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
                  item.value = uni.getStorageSync('login_user_info').user_no;
                } else if (item.value && item.value.indexOf('globalData.') !== -1) {
                  let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
                  if (globalData && globalData[colName]) {
                    item.value = globalData[colName];
                  }
                } else if (item.value && item.value.indexOf("'") === 0) {
                  item.value = item.value.replace(/\'/gi, '');
                }
                if (item.value_exp) {
                  delete item.value_exp;
                }
                return item;
              });
            } else {
              condition = [{
                colName: this.srvInfo?.parentCol || 'parent_no',
                ruleType: 'isnull'
              }];
            }
          }
        }
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: condition,
          page: {
            pageNo: this.page.pageNo,
            rownumber: this.page.rownumber
          }
        };
        if (this.order) {
          req.order = this.order
        }
        const res = await this.$http.post(url, req);
        if (res && res.data && res.data.state === 'SUCCESS') {
          const page = res.data.page;
          that.page.pageNo = page.pageNo;
          that.page.total = page.total;
          that.nodeList = res.data.data;
          return that.nodeList;
        }
      }
    },
    watch: {
      current: {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          if (newValue && typeof newValue === 'object') {
            if (this.current && this.srvInfo?.column) {
              this.curNodeInfo = this.deepClone(this.current)
              this.curNode = this.curNodeInfo[this.srvInfo.column] || ''
            }

            if (!this.curNode) {
              this.selectedList = []
            }

            if (this.srvInfo && this.srvInfo.column && this.srvInfo.serviceName) {
              this.getData()
            }
          }
        }
      }
    },
    props: {
      order: { //排序
        type: [Array, Object]
      },
      hideButton: {
        type: Boolean,
        default: false
      },
      needConfirm: {
        type: Boolean,
        default: true
      },
      current: {
        type: Object,
      },
      fieldsModel: {
        type: Object,
      },
      srvApp: {
        type: String
      },
      srvInfo: {
        type: Object
      }
    },
  }
</script>

<style lang="scss" scoped>
  .tree-selector-wrap {
    height: 80vh;
    display: flex;
    flex-direction: column;
    background-color: #f1f1f1;
    overflow-y: scroll;

    .selected-node-wrap {
      background-color: #fff;
      display: flex;
      align-items: center;
      margin: 20rpx 20rpx 10rpx;
      border-radius: 20rpx;
      padding: 20rpx;
    }

    .selected-node-list {
      display: flex;
      flex-wrap: wrap;

      .selected-node {
        display: flex;
        align-items: center;

        &+.selected-node {
          &::before {
            content: '';
            display: inline-block;
            width: 5px;
            height: 5px;
            border-top: 2px solid #656565;
            border-right: 2px solid #656565;
            -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
            border-color: #007aff;
            margin: 20rpx;
          }
        }

        &.active {
          text {
            position: relative;

            &::after {
              position: absolute;
              bottom: -10rpx;
              left: 0;
              content: '';
              width: 100%;
              height: 2px;
              background-color: #0081FF;
            }

            // border-bottom: 2px solid #0081FF;
          }

          color: #007aff;
        }
      }
    }

    .node-list-wrap {
      flex: 1;
      overflow-y: scroll;

      .node-list {
        display: flex;
        flex-wrap: wrap;
        padding: 20rpx 10rpx;
        padding-right: 0;
        align-items: flex-start;

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

        .node-item {
          margin-right: 10rpx;
          margin-bottom: 10rpx;
        }
      }
    }

    .foot-button {
      display: flex;
      justify-content: center;
      padding-bottom: 50rpx;
      padding-top: 20rpx;
      background-color: #fff;

      .cu-btn {
        min-width: 40%;

        &+.cu-btn {
          margin-left: 20rpx;
        }
      }
    }
  }
</style>
