<template>
  <view class="child-list">
    <view class="section-name">
      <view class="name" @click="unfold">
        <text>{{config.label||''}}</text>
        <text class="cu-load margin-left-xs" :class="loading?'loading':''"></text>
        <view class="unfold" v-if="config.unfold ===false">
          <text class="cuIcon-unfold"></text>
        </view>
      </view>

      <view class="to-more" v-if="config.unfold !==false&&!disabled">
        <button class="cu-btn sm line-cyan border" v-for="btn in publicButton"
          @click="onButton(btn)">{{btn.button_name||''}}</button>
        <button class="cu-btn sm line-cyan border" @click="onButton({button_type:'list'})"
          v-if="listData.length>0">查看全部</button>
      </view>
    </view>
    <view class="list-box" v-if="config.unfold !==false">
      <view class="list-item table-head">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{col.label||''}}
        </view>
      </view>
      <view class="list-item" v-for="(item,index) in listData" v-show="item._dirtyFlags!=='delete'" :key="index"
        @click="onButton({button_type:'edit'},index)">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{item[col.columns]||''|hideYear(removeYearFromDate)}}
        </view>
        <text class="cuIcon-delete text-black" v-if="showDelete&&!disabled"
          @click.stop="onChildFormBtn({button_type:'delete'},index)"></text>
      </view>
      <view class="list-item" v-for="(item,index) in memoryListData" @click="onButton({button_type:'editMem'},index)">
        <view class="col-item" v-for="col in showColumn"
          :style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}">
          {{item[col.columns]||''|hideYear(removeYearFromDate)}}
        </view>
        <text class="cuIcon-delete text-black" v-if="showDelete"
          @click.stop="onChildFormBtn({button_type:'delete'},index,true)"></text>
      </view>
      <view class="list-item" v-if="finalListData.length===0">
        <view class="col-item">
          暂无数据
        </view>
      </view>
    </view>
    <view class="unfold" v-if="config.isFold!==true&&config.unfold ===true" @click="unfold">
      <!-- <text>向上折叠</text> -->
      <text class="cuIcon-fold"></text>
    </view>
    <view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='addChildData'}">
      <view class="cu-dialog" @click.stop.prevent="">
        <view class="close-btn text-right">
          <button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text class="cuIcon-close"></text></button>
        </view>
        <view class="child-form-wrap" v-if="addV2&&modalName==='addChildData'">
          <a-form :srvApp="appName" v-if="addV2 && addV2._fieldInfo && isArray(addV2._fieldInfo)"
            :fields="addV2._fieldInfo" :pageType="use_type" :formType="'add'" ref="childForm" :key="modalName"
            @value-blur="valueChange" :main-data="mainData"></a-form>
        </view>
        <view class="button-box" v-if="addV2&&modalName==='addChildData'&&addV2.formButton">
          <button class="cu-btn bg-blue" v-for="btn in addV2.formButton"
            @click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
        </view>
      </view>
    </view>
    <batch-add ref="batchAdd" :main-data="mainData" :selectColInfo="selectColInfo" @submit="batchSubmit">
    </batch-add>
    <view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='updateChildData'}">
      <view class="cu-dialog" @click.stop.prevent="">
        <view class="close-btn text-right">
          <button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text class="cuIcon-close"></text></button>
        </view>
        <view class="child-form-wrap" v-if="updateV2&&modalName==='updateChildData'">
          <a-form v-if="updateV2 && updateV2._fieldInfo && isArray(updateV2._fieldInfo)" :fields="updateV2._fieldInfo"
            :main-data="mainData" :pageType="use_type" :formType="'update'" ref="childForm" :key="modalName"></a-form>
        </view>
        <view class="button-box" v-if="updateV2&&modalName==='updateChildData'&&updateV2.formButton">
          <button class="cu-btn bg-blue" v-for="btn in updateV2.formButton"
            @click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import batchAdd from '@/publicPages/components/batch-add/batch-add.vue'
  export default {
    components: {
      batchAdd
    },
    data() {
      return {
        v2Data: null,
        addV2: null,
        updateV2: null,
        localListData: [],
        listData: [],
        total: 0,
        rownumber: 5,
        orderCols: [],
        loading: false,
        modalName: "",
        memoryListData: [],
        currentItemIndex: null,
        currentItemType: null,
        selectColInfo: null
      }
    },
    filters: {
      hideYear: (value, isHide) => {
        if (value && isHide) {
          let year = (new Date()).getFullYear()
          value = value.replace(`${year}-`, '')
        }
        return value || ''
      }
    },
    props: {
      mainTable: {
        type: String
      },
      mainServiceName: {
        type: String
      },
      appName: {
        type: String
      },
      config: {
        type: Object
      },
      mainData: {
        type: Object
      },
      mainFkField: {
        type: Array
      },
      disabled: {
        type: [String, Boolean]
      }
    },
    computed: {
      showDelete() {
        return this?.v2Data?.use_type && ['update', 'add', 'addchildlist', 'updatechildlist'].includes(this.v2Data
          .use_type)
      },
      setListData() {
        return this.listData.filter(item => item._dirtyFlags !== "delete")
      },
      finalListData() {
        return [...this.listData, ...this.memoryListData].filter(item => item._dirtyFlags !== 'delete')
      },
      use_type() {
        return this.config?.use_type || this.v2Data?.use_type
      },
      condition() {
        const foreignKey = this.foreignKey
        const data = this.config
        let formData = this.mainData;
        if (!foreignKey || !formData) {
          return []
        }
        let condition = [{
          colName: foreignKey.column_name,
          ruleType: 'eq',
          value: formData[foreignKey.referenced_column_name]
        }];
        if (data?.srv_app && data?.service_name && foreignKey) {
          condition = [{
            colName: foreignKey.ref_service_column,
            ruleType: "eq",
            value: formData[foreignKey.refed_service_column]
          }];
        }
        return condition
      },
      addService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_add'
        }
      },
      updateService() {
        if (Array.isArray(this.v2Data?.rowButton) && this.v2Data.rowButton.find(item => item.button_type ===
            'edit')) {
          let buttonInfo = this.v2Data.rowButton.find(item => item.button_type === 'edit')
          return buttonInfo?.service_name
        }
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_update'
        }
      },
      deleteService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_delete'
        }
      },
      selectService() {
        if (this.serviceName) {
          let index = this.serviceName.lastIndexOf('_')
          return this.serviceName.slice(0, index) + '_select'
        }
      },
      serviceName() {
        return this.config?.service_name
      },
      foreignKey() {
        return this.config?.foreign_key
      },
      appTempColMap() {
        // 字段关系映射
        return this.moreConfig?.appTempColMap || {}
      },
      moreConfig() {
        return this.v2Data?.moreConfig
      },
      srvApp() {
        return this.appName || uni.getStorageSync('activeApp')
      },
      publicButton() {
        let result = []
        if (Array.isArray(this.v2Data?.gridButton)) {
          let ignoreBtn = ['select', 'batch_delete', 'delete']
          if (this.use_type === 'detaillist') {
            // ignoreBtn.push('add')
          }
          result = this.v2Data.gridButton.filter(item => item.permission === true && !ignoreBtn.includes(item
            .button_type))
          if (this.config?.foreign_key?.moreConfig?.batch_add?.target_column) {
            let batch_add = this.config.foreign_key.moreConfig.batch_add
            let column = this.orderCols.find(item => item.columns === batch_add.target_column)
            if (column?.option_list_v2?.serviceName) {
              result.unshift({
                ...batch_add,
                target_column: batch_add.target_column,
                "appName": batch_add.dest_app || uni.getStorageSync('activeApp'),
                "column_option_list_v2": column.option_list_v2,
                "operate_service": batch_add.add_service,
                "button_name": "批量添加",
                "servcie_type": "add",
                "page_type": "添加子列表",
                "button_type": "batchAdd"
              })
            }
          }
        }
        return result
      },
      colMinWidth() {
        return this.moreConfig?.tableConfig?.col_min_width
      },
      removeYearFromDate() {
        return this.moreConfig?.removeYearFromDate
      },
      showColumn() {
        if (Array.isArray(this.moreConfig?.tableConfig?.columns) && this.moreConfig.tableConfig.columns.length >
          0) {
          return this.orderCols.filter(item => this.moreConfig.tableConfig.columns.includes(item.columns))
        } else if (this.moreConfig?.tableConfig?.columns && !Array.isArray(this.moreConfig?.tableConfig
            ?.columns)) {
          let columns = []
          try {
            columns = this.moreConfig.tableConfig.columns.split(',')
            columns = this.orderCols.filter(item => columns.includes(item.columns))
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
          if (columns.length > 0) {
            return columns
          }
        }

        if (Array.isArray(this.moreConfig?.childTableColumn) && this.moreConfig.childTableColumn.length > 0) {
          return this.orderCols.filter(item => this.moreConfig.childTableColumn.includes(item.columns))
        }
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          const cols = this.orderCols.filter(item => item.columns && item.columns !== 'id' && item.columns
            .indexOf('_no') == -1).slice(0, 4)
          return cols
        }
      },
      labelMap() {
        // 字段对应的label
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          return this.orderCols.reduce((res, cur) => {
            res[cur.columns] = cur.label
            return res
          }, {})
        } else {
          return {}
        }
      },
    },
    created() {
      this.getListV2()
    },
    methods: {
      unfold() {
        this.$emit('unfold', this.config)
      },
      /**
       * 生成主子表同时提交的子表请求参数
       */
      getChildDataList() {
        const fk = this.foreignKey
        const depend_keys = [{
          type: "column",
          depend_key: fk.referenced_column_name,
          add_col: fk.column_name
        }]
        let result = [];
        const deleteParams = this.buildDeleteParams()
        // deleteParams && result.push(deleteParams)
        const addParams = this.buildAddParams()
        // addParams && result.push(addParams)
        const updateParams = this.buildUpdateParams()
        result = [...result, ...deleteParams, ...addParams, ...updateParams]
        result = result.map(item => {
          item.depend_keys = depend_keys
          return item
        })
        return result
      },
      buildDeleteParams() {
        let fk = this.foreignKey
        let deleteList = this.listData.filter(item => item._dirtyFlags === 'delete')
        if (deleteList.length === 0) {
          return []
        }
        let ids = deleteList.map(row => row.id).join(",");
        let params = {
          condition: [{
            colName: 'id',
            ruleType: 'in',
            value: ids
          }],
          serviceName: this.deleteService
        }
        return [params]
      },
      buildUpdateParams() {
        let fk = this.foreignKey
        let updateList = this.finalListData.filter(item => item._dirtyFlags === 'update' && item.id)
        if (updateList.length === 0) {
          return []
        }
        let params = updateList.map((item, index) => {
          delete item._isMemoryData
          delete item._dirtyFlags
          let row = this.localListData[index]
          let id = item.id
          Object.keys(row).forEach(key => {
            if (row[key] === item[key]) {
              delete item[key]
            }
          })
          return {
            serviceName: this.updateService,
            data: [item],
            condition: [{
              colName: "id",
              ruleType: "eq",
              value: id,
            }]
          }
        })
        return params
      },
      buildAddParams() {
        let fk = this.foreignKey
        let addList = this.finalListData.filter(item => item._dirtyFlags === 'add')
        if (addList.length === 0) {
          return []
        }
        let params = {
          data: addList.map(item => {
            delete item._isMemoryData
            delete item._dirtyFlags
            return item
          }),
          serviceName: this.addService
        }
        return [params]
      },
      deleteMemoryListItem(index) {
        if (index || index === 0) {
          this.memoryListData.splice(index, 1)
        }
      },
      getMemoryData() {
        return this.memoryListData.map(item => {
          delete item._isMemoryData
          delete item._dirtyFlags
          return item
        })
      },
      onChildFormBtn(e, index, isMem) {
        if (e && e.button_type) {
          switch (e.button_type) {
            case 'submit':
              this.add2List(e)
              break;
            case 'edit':
              this.updateChildListItem(index)
              break;
            case 'delete':
              if (this.use_type === "detaillist" && this.modalName === "updateChildData") {

                let id = this.listData[this.currentItemIndex]['id']
                uni.showModal({
                  content: "是否确认删除操作？",
                  success: (res) => {
                    if (res.confirm) {
                      console.log('用户点击确定');
                      let req = [{
                        "serviceName": e.service_name,
                        "colNames": ["*"],
                        "condition": [{
                          colName: 'id',
                          ruleType: 'eq',
                          value: id
                        }]
                      }]
                      if (!id) {
                        return
                      }
                      let appName = this.appName || uni.getStorageSync('activeApp');
                      this.onRequest("delete", e.service_name,
                        req, appName).then((res) => {
                        this.hideModal()
                        this.getList()
                        if (res.data.state === "SUCCESS") {
                          uni.showToast({
                            title: '操作成功',

                          })
                        } else {
                          uni.showModal({
                            title: '提示',
                            content: res.data
                              .resultMessage,
                            showCancel: false,
                          })
                        }

                      })
                    } else if (res.cancel) {
                      resolve('用户点击取消')
                    }
                  }
                })
                return
              }
              if (typeof index === 'number' && index >= 0) {
                if (isMem) {
                  this.deleteMemoryListItem(index)
                } else {
                  this.listData[index]._dirtyFlags = 'delete'
                  this.$set(this.listData, index, this.listData[index])
                }
              }
              break;
            case 'reset':
              this.$refs.childForm.onReset()
              break;
          }
        }
      },
      updateChildListItem() {
        let data = this.$refs.childForm.getFieldModel();

        if (!data) {
          return
        }
        if (this.use_type === 'detaillist') {
          // 详情子表页面 直接发请求修改
          let id = this.listData[this.currentItemIndex]['id']
          if (id && this.updateService) {
            let req = [{
              "serviceName": this.updateService,
              "condition": [{
                "colName": 'id',
                "ruleType": "eq",
                "value": id
              }],
              "data": [data]
            }]
            let app = this.appName || uni.getStorageSync('activeApp');
            let url = this.getServiceUrl(app, this.updateService, 'update');
            this.$http.post(url, req).then(res => {
              this.hideModal()
              this.getList()
            })
          }

          return
        }

        if (this.currentItemType === 'mem') {
          Object.assign(this.memoryListData[this.currentItemIndex], data)
          this.memoryListData[this.currentItemIndex]._dirtyFlags = 'add'
        } else {
          Object.assign(this.listData[this.currentItemIndex], data)
          this.listData[this.currentItemIndex]._dirtyFlags = 'update'
        }

        this.hideModal()
      },
      batchSubmit(arr) {
        this.$refs.batchAdd.close()
        let dependCols = []
        let target_column = this.config?.foreign_key?.moreConfig?.batch_add?.target_column
        let target_column_info = null
        if (Array.isArray(this.addV2?._fieldInfo) && this.addV2._fieldInfo.length > 0 && target_column) {
          target_column_info = this.addV2._fieldInfo.find(item => item.columns === target_column)
          this.addV2._fieldInfo.forEach(item => {
            if (item?.redundant?.dependField === target_column) {
              dependCols.push({
                refedCol: item?.redundant?.refedCol,
                columns: item.columns
              })
              return true
            }
          })
        }
        if (Array.isArray(arr) && arr.length > 0) {
          arr.forEach(data => {
            let obj = {
              [target_column_info.columns]: data[target_column],
            }
            let numCol = this.config?.foreign_key?.moreConfig?.batch_add?.numCol
            if (numCol) {
              obj[numCol] = data[numCol]
            }
            dependCols.forEach(col => {
              obj[col.columns] = data[col.refedCol]
            })
            obj._isMemoryData = true
            obj._dirtyFlags = 'add'
            this.memoryListData.push(obj)
          })
        }
      },
      async add2List(e) {
        let data = this.$refs.childForm.getFieldModel();
        debugger
        if (!data) {
          return
        }
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          for (let key in data) {
            if (Array.isArray(data[key])) {
              data[key] = data[key].toString();
            }
            if (!data[key] && data[key] !== 0) {
              delete data[key]
            }
          }
          if (this.use_type === 'detaillist') {
            // 直接添加
            // let {
            // 	row,
            // 	btn
            // } = e
            let reqData = [{
              serviceName: e.service_name,
              data: [data]
            }];
            let app = this.appName || uni.getStorageSync('activeApp');
            let type = "add"
            let url = this.getServiceUrl(app, e.service_name, type);
            let res = await this.$http.post(url, reqData);
            this.getList()
            if (res.data.state === 'SUCCESS') {
              uni.showModal({
                title: '提示',
                content: res.data.resultMessage,
                showCancel: false
              })
            } else {
              uni.showToast({
                title: res.data.resultMessage,
                mask: false,
                icon: "none"
              });
            }
            // this.$emit('addChild',{row:data,btn:e})
          } else {
            // 添加到内存中，随主表一起添加
            if (Object.keys(data).length > 0) {
              data._isMemoryData = true
              data._dirtyFlags = 'add'
              this.memoryListData.push(data)
            }
          }

        }
        this.addV2._fieldInfo = this.addV2._fieldInfo.map(item => {
          item.value = null
          if (item.defaultValue && !item.value) {
            item.value = item.defaultValue
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2
            .conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2
              .conditions, this.defaultVal)
          }
          if (item.in_add === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          return item
        })

        this.modalName = ''

      },
      async valueChange(e, triggerField) {
        const column = triggerField.column
        const fieldModel = e
        const cols = this.addV2._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = this.addV2.main_table

        let result = null
        if (Array.isArray(cols) && cols.length > 0) {
          result = await this.evalX_IF(table_name, cols, fieldModel, this.appName)
        }
        for (let i = 0; i < this.addV2._fieldInfo.length; i++) {
          const item = this.addV2._fieldInfo[i]
          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col) && item.xif_trigger_col.includes(column)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], fieldModel, this.appName)
              }
              if (result?.response && result.response[item.column]) {
                item.display = true
              } else if (result === true) {
                item.display = true
              } else {
                item.display = false
              }
            }
          }
          if (e && typeof e === 'object' && e.hasOwnProperty(item.column)) {
            item.value = e[item.column];
          }
          this.$set(this.addV2._fieldInfo, i, item)
        }
      },
      async onButton(e, index) {
        if (this.disabled) {
          return
        }
        debugger
        if (e && e.button_type) {
          switch (e.button_type) {
            case 'refresh':
              this.getList()
              break;
            case 'list':
              uni.navigateTo({
                url: `/publicPages/list2/list2?pageType=list&main_data=${JSON.stringify(this.mainData)}&serviceName=${this.serviceName}&destApp=${this.srvApp}&cond=${JSON.stringify(this.condition)}`
              })
              break;
            case 'add':
              this.getAddV2(e)
              this.modalName = 'addChildData'
              break;
            case 'edit':
              if (index || index === 0) {
                let row = this.listData[index]
                let rowButton = this.v2Data?.rowButton
                let detailBtn = null
                if (Array.isArray(rowButton) && rowButton.length > 0) {
                  detailBtn = rowButton.find(item => item.button_type === 'detail')
                }
                if (this.config?.foreign_key?.moreConfig?.clickTarget === 'detail' && detailBtn) {
                  let fieldsCond = []
                  if (row && row.id) {
                    fieldsCond = [{
                      column: 'id',
                      value: row.id,
                      display: false
                    }]
                  } else {
                    if (typeof row == 'object' && Object.keys(row).length > 0) {
                      Object.keys(row).forEach(key => {
                        if (key !== '_buttons') {
                          let obj = {
                            column: key,
                            value: row[key] || ''
                          }
                          fieldsCond.push(obj)
                        }
                      })
                    }
                  }
                  let url =
                    `/publicPages/detail/detail?serviceName=${detailBtn.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
                  if (this.appName) {
                    url += `&appName=${this.appName}`
                  }
                  uni.navigateTo({
                    url: url
                  })
                } else {
                  this.getUpdateV2(row)
                  this.currentItemIndex = index
                  this.modalName = 'updateChildData'
                }
              }
              break;
            case 'editMem':
              // 编辑内存表数据
              if (index || index === 0) {
                let row = this.memoryListData[index]
                this.getUpdateV2(row)
                this.currentItemIndex = index
                this.currentItemType = 'mem'
                this.modalName = 'updateChildData'
              }
              break
            case 'batchAdd':
              let addV2 = await this.getAddV2();
              this.$refs.batchAdd.open(e)
              break;
          }
        }
      },

      async getUpdateV2(row) {
        if (this.updateV2?._fieldInfo) {
          this.updateV2._fieldInfo = this.updateV2._fieldInfo.map(item => {
            if (row && row[item.columns]) {
              item.value = row[item.columns]
            }
            return item
          })
          this.updateV2.rowData = row
          return
        }
        // if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = await this.getServiceV2(this.updateService, 'update', 'update', app);
        colVs._fieldInfo = colVs._fieldInfo.map(item => {
          debugger
          if (item?.option_list_v2?.refed_col && this.mainData[item.option_list_v2.refed_col]) {
            item.value = this.mainData[item.option_list_v2.refed_col]
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2
            .conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2
              .conditions, this.mainData)
          }
          if (item.defaultValue) {
            item.value = item.defaultValue
          }
          if (item.in_update === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.ref_service_column) {
            item.display = false
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          if (row && row[item.columns]) {
            item.value = row[item.columns]
          }
          return item
        })
        colVs.rowData = row
        if (Array.isArray(colVs.formButton) && colVs.formButton.length > 0 && this.use_type === "detaillist") {
          colVs.formButton = colVs.formButton.map(item => {
            if (item.button_type === 'reset') {
              let rowButton = this.v2Data?.rowButton
              if (rowButton.length > 0) {
                let delBtn = rowButton.find(item => item.button_type === 'delete')
                if (delBtn) {
                  item = delBtn
                }
              }
            }
            return item
          })
        }
        this.updateV2 = colVs
        // }
      },
      async getAddV2(btn) {

        let serviceName = btn?.service_name || this.serviceName
        // if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
        let app = this.appName || uni.getStorageSync('activeApp');
        let colVs = null
        if (this.addV2) {
          colVs = this.addV2
        } else {
          colVs = await this.getServiceV2(serviceName, 'add', 'add', app);
        }
        if (!colVs) {
          return
        }
        colVs._fieldInfo = colVs._fieldInfo.map(item => {
          if (Array.isArray(item?.option_list_v2?.mconditions) && item.option_list_v2
            .mconditions.length > 0) {
            let mconditions = item.option_list_v2.mconditions
            mconditions = mconditions.map(
              item => {
                item.value = this.renderStr(item.value, this.mainData)
                return item
              })
            if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2.conditions
              .length > 0) {
              item.option_list_v2.conditions = [...item.option_list_v2.conditions, ...
                mconditions
              ]
            } else {
              item.option_list_v2.conditions = mconditions
            }
          }
          console.log(this.mainData)
          if (item?.option_list_v2?.refed_col && this.mainData[item.option_list_v2.refed_col]) {
            item.value = this.mainData[item.option_list_v2.refed_col]
          }
          if (Array.isArray(item?.option_list_v2?.conditions) && item.option_list_v2.conditions
            .length > 0) {
            item.option_list_v2.conditions = this.evalConditions(item.option_list_v2.conditions,
              this.mainData)
          }
          if (item.defaultValue) {
            item.value = item.defaultValue
          }
          if (item.in_add === 1) {
            item.display = true
          }
          if (item.columns === this.foreignKey?.referenced_column_name) {
            item.display = false
          }
          if (item.col_type == this.mainTable) {
            if (this.mainData && this.mainData[item.columns]) {
              item.value = this.mainData[item.columns]
              item.disabled = true
            }
          }
          if (item.col_type === 'fk') {
            if (this.mainData && this.mainData[item.columns]) {
              item.value = this.mainData[item.columns]
              // item.disabled = true
            }
            // if (
            // 	item?.option_list_v2?.refed_col && this.mainData[item?.option_list_v2
            // 		?.refed_col]) {
            // 	item.value = this.mainData[item.columns]
            // }
          }
          return item
        })
        let defaultVal = colVs._fieldInfo.reduce((res, cur) => {
          if (cur.value) {
            res[cur.columns] = cur.value
          }
          return res
        }, {})
        const cols = colVs._fieldInfo.filter(item => item.x_if).map(item => item.column)
        const table_name = colVs.main_table
        const result = await this.evalX_IF(table_name, cols, defaultVal, this.appName)

        for (let i = 0; i < colVs._fieldInfo.length; i++) {
          const item = colVs._fieldInfo[i]
          if (item.x_if) {
            if (Array.isArray(item.xif_trigger_col)) {
              if (item.table_name !== table_name) {
                result = await this.evalX_IF(item.table_name, [item.column], defaultVal, this.appName)
              }
              if (result?.response && result.response[item.column]) {
                item.display = true
              } else if (result === true) {
                item.display = true
              } else {
                item.display = false
              }
            }
          }
        }

        this.addV2 = colVs
        if (Array.isArray(colVs?._fieldInfo)) {
          let colInfo = null
          let e = this.config?.foreign_key?.moreConfig?.batch_add
          if (e) {
            colInfo = colVs._fieldInfo.find(col => col.columns === e.target_column)
            if (Array.isArray(colInfo?.option_list_v2?.conditions) && colInfo.option_list_v2.conditions
              .length > 0) {
              colInfo.option_list_v2.conditions = colInfo.option_list_v2.conditions.map(item => {
                if (item.value && item.value.indexOf('data.') !== -1) {
                  let colName = item.value.slice(item.value.indexOf('data.') + 5);
                  if (this.mainData && this.mainData[colName]) {
                    item.value = this.mainData[colName];
                  }
                } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
                  item.value = uni.getStorageSync('login_user_info').user_no;
                } else if (item.value && item.value.indexOf("'") === 0 && item.value
                  .lastIndexOf(
                    "'") === item.value
                  .length - 1) {
                  item.value = item.value.replace(/\'/gi, '');
                }
                if (item.value_exp) {
                  delete item.value_exp;
                }
                return item
              })
            }

            this.selectColInfo = colInfo
          }
        }
        return colVs
        // }
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let use_type = this.config?.use_type || 'detaillist'
        let colVs = await this.getServiceV2(this.serviceName, 'list', use_type, app);
        if (!colVs) {
          return
        }
        // this.getAddV2()
        colVs.srv_cols = colVs.srv_cols.filter(item => {
          if (item.in_list !== 0) {
            if (item.in_list === 1) {
              item.display = true
            }
            return true
          }
        })
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
            delete colVs.more_config
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
        }
        if (Array.isArray(colVs.srv_cols)) {
          this.orderCols = colVs.srv_cols.filter(item => {
            if (item.in_list === 1) {
              item.orderType = 'asc'
              item.selected = false;
              return true
            }
          })
        }
        this.v2Data = colVs;
        this.getList()
      },
      async getList() {
        const serviceName = this.serviceName
        const app = this.srvApp
        const url = this.getServiceUrl(app, serviceName, 'select');
        const foreignKey = this.foreignKey
        const data = this.config
        let formData = this.mainData;
        const condition = this.condition
        if (Array.isArray(condition) && condition.length > 0) {
          let req = {
            serviceName: serviceName,
            colNames: ['*'],
            condition: condition,
            page: {
              rownumber: this.rownumber,
              pageNo: 1
            }
          };
          if (this.loading) {
            return
          }
          if (this.v2Data?.vpage_no) {
            req.vpage_no = this.v2Data.vpage_no
          }
          this.loading = true
          if (this.config?.foreign_key?.moreConfig?.condition && Array.isArray(this.config?.foreign_key?.moreConfig
              ?.condition)) {
            req.condition = [...req.condition, ...this.config.foreign_key.moreConfig.condition]
          }
          const res = await this.$http.post(url, req)
          this.loading = false
          if (res.data?.state === 'SUCCESS') {
            this.listData = res.data.data
            this.localListData = this.deepClone(res.data.data)
          }
        }
      },
      hideModal() {
        this.currentItemIndex = null
        this.currentItemType = null
        this.modalName = ''
      },
    }
  }
</script>

<style scoped lang="scss">
  .child-list {
    color: #666;
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;

    .unfold {
      text-align: right;
      margin-top: 10rpx;
      color: #000;
      flex: 1;
    }

    .section-name {
      color: #000;
      font-weight: bold;
      padding-bottom: 10rpx;
      border-bottom: 1rpx solid #F0F0F0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
      }

      .cu-load {
        line-height: 1;
        color: #666;
        font-weight: normal;
      }
    }

    .list-box {
      .list-item {
        display: flex;
        border-bottom: 1px solid #f1f1f1;
        padding: 10rpx 0;

        &.table-head {
          font-size: 24rpx;
          color: #999;
        }

        .col-item {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-align: center;
        }
      }
    }

    .to-more {
      text-align: right;
      padding-top: 20rpx;

      .line-cyan {
        color: #0BC99D;
      }

      .cu-btn {
        margin-left: 10rpx;
      }
    }
  }

  .child-form-wrap {
    max-height: 70vh;
    overflow-y: scroll;
  }

  .button-box {
    .cu-btn {
      min-width: 40%;
    }
  }
</style>
