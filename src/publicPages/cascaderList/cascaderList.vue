<template>
  <view class="page-wrap">
    <view class="list-wrap">
      <view class="list-item" v-for="item in list" :key="item.id">
        <view class="item-header">
          <view class="item-title">
            {{item[parentShowCol]||''}}
          </view>
          <view class="item-handler">
            <button class="cu-btn  line-red light sm ">修改</button>
            <text class="delete text-gray light sm" @click="deleteItem(item,'parent')">删除</text>
          </view>
        </view>
        <view class="item-content" v-if="item.child">
          <view class="child-item" v-for="child in item.child">
            <view class="top">
              <view class="title">
                {{child[childTitle]||''}}
              </view>
              <view class="hint">
                {{getHint(child)||child[childHint]||''}}
              </view>
            </view>
            <view class="bottom">
              <!--              <view class="state bottom-item">
                {{child[childState]||''}}
              </view> -->
              <view class="handler">
                <text class="bottom-item" @click="deleteItem(child,'child')">删除</text>
                <text class="bottom-item"> <text class="cuIcon-settingsfill"></text></text>
              </view>
            </view>
          </view>
          <view class="child-item add-icon">
            <text class="cuIcon-add"></text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        app: "health",
        childApp: '',
        service: "srvhealth_store_place_type_select", //查询服务
        childService: "srvhealth_store_place_select", // 子表查询服务
        updateService: "srvhealth_store_place_type_update", // 修改服务
        childUpdateService: "srvhealth_store_place_update", // 子表修改服务
        deleteService: "srvhealth_store_place_type_delete", // 删除服务
        childDeleteService: "srvhealth_store_place_delete", // 子表删除服务
        pidCol: "place_type_no", //父节点中跟子节点进行关联的字段
        parentIdCol: 'id',
        parentShowCol: 'place_type_name',
        childIdCol: 'id',
        childCols: 3, // 几列
        childTitle: "place_name", //标题
        childHint: "server_people_num", //提示信息
        preHint: '(',
        sufHint: '人桌)',
        childState: 'place_state', //状态
        editCols: "",
        childEditCols: "",
        list: [],
        defaultCond: [],
        filterByStore: false, //是否通过店铺编号过滤
      }
    },
    computed: {
      appName() {
        return this.app || uni.getStorageSync('activeApp')
      }
    },
    methods: {

      getHint(e) {
        if (this.childHint && e[this.childHint]) {
          return `${this.preHint||''}${e[this.childHint]}${this.sufHint||''}`
        }
      },

      editChild(e) {

      },
      edit(e) {

      },
      deleteItem(e, type = 'parent') {
        let tip = type === 'parent' ? e[this.parentShowCol] : e[this.childTitle];
        if (tip) {
          tip = `确认删除“${tip}”吗?`
          if (type === 'parent') {
            tip += `删除后区域内所有桌面也将删除`
          }
          uni.showModal({
            title: '提示',
            content: tip,
            success: (res) => {
              if (res.confirm) {
                const service = type === 'child' ? this.childDeleteService : this.deleteService
                let url = this.getServiceUrl(this.appName, service, 'select');
                let req = [{
                  "serviceName": "srvhealth_store_place_delete",
                  "colNames": ["*"],
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": e.id
                  }]
                }]
                if (service && e.id) {
                  this.$http.post(url, req).then(res => {
                    if (res.data.state === 'SUCCESS') {
                      uni.showToast({
                        title: res.data?.resultMessage || '操作成功',
                        icon: 'none'
                      })
                    }
                  })
                }
              }
            }
          })
        }
      },
      addChild(e) {

      },
      add(e) {

      },
      async getList() {
        const service = this.service
        let url = this.getServiceUrl(this.appName, service, 'select');
        let req = {
          "colNames": ["*"],
          "serviceName": service,
          "condition": this.defaultCond || [],
          "page": {
            "pageNo": 1,
            "rownumber": 1000
          }
        }
        if (this.filterByStore && this.storeInfo?.store_no) {
          req.condition.push({
            colName: 'store_no',
            ruleType: 'eq',
            value: this.storeInfo.store_no
          })
        }
        const res = await this.$http.post(url, req)
        if (res.data?.state === 'SUCCESS') {
          let list = res.data.data || [];
          if (Array.isArray(res.data.data) && res.data.data.length > 0) {
            let cond = [{
              colName: this.pidCol,
              ruleType: 'in',
              value: res.data.data.map(item => item[this.pidCol]).toString()
            }]
            let childData = await this.getChildList(cond)
            if (Array.isArray(childData) && childData.length > 0) {
              list = list.map((item) => {
                item.child = childData.filter(e => e[this.pidCol] === item[this.pidCol]) || []
                return item
              })
            }
          }
          this.list = list
        }
      },
      async getChildList(cond) {
        const app = this.childApp || this.app || uni.getStorageSync('activeApp')
        const service = this.childService
        let url = this.getServiceUrl(app, service, 'select');
        let req = {
          "colNames": ["*"],
          "serviceName": service,
          "condition": cond,
          "page": {
            "pageNo": 1,
            "rownumber": 1000
          }
        }
        const res = await this.$http.post(url, req)
        return res.data.data || []
      },
    },
    onLoad(option) {
      if (typeof option === 'object') {
        let keys = Object.keys(option);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (key === 'defaultCond' && option[key]) {
              let val = this.renderStr(option[key], this)
              try {
                this[key] = JSON.parse(val)
              } catch (e) {
                //TODO handle the exception
              }
            } else if (option[key] === 'true') {
              this[key] = true
            } else {
              this[key] = option[key]
            }
          })
        }
      }
      if (this.service) {
        this.getList()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    min-height: 100vh;
    background-color: #fff;
    padding: 10px;
  }

  .list-wrap {
    .list-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;

        .item-title {
          padding: 2px 0;
          border-left: 2px solid #ff0000;
          padding-left: 10px;
        }

        .item-handler {
          .cu-btn {
            border-radius: 15px;
            min-width: 50px;
            margin-right: 10px;

            &:after {
              border-radius: 15px;
            }
          }

          .delete {
            text-decoration: underline;
          }
        }
      }

      .item-content {
        display: flex;
        flex-wrap: wrap;

        .child-item {
          width: calc(33.33% - 10px);
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 10px;
          background-color: #f5f5f5;

          &.add-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 106px;
            // font-weight: bold;
            font-size: 50px;
          }

          &:last-child {
            margin-right: 0;
          }

          .top {
            text-align: center;
            min-height: 65px;
            padding: 10px;

            .title {
              font-weight: bold;
              font-size: 16px;
            }

            .hint {
              color: #888;
              padding-top: 5px;
            }
          }

          .bottom {
            display: flex;
            border-top: 1px dotted #ccc;
            color: #888;
            font-size: 16px;
            min-height: 40px;
            align-items: center;
            width: 100%;
            padding: 10px 0;

            .handler {
              width: 100%;
              display: flex;
              align-items: center;
            }

            &-item {
              flex: 1;
              text-align: center;

              &:last-child {
                border-left: 1px solid #ccc;
              }
            }
          }
        }
      }
    }
  }
</style>
