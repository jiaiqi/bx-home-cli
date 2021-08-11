<template>
	<view class="child-list">
		<view class="section-name">
			<view class="name">
				<text>{{config.label||''}}</text>
				<text class="cu-load margin-left-xs" :class="loading?'loading':''"></text>
			</view>
			<view class="to-more">
				<button class="cu-btn sm line-blue border" v-for="btn in publicButton"
					@click="onButton(btn)">{{btn.button_name||''}}</button>
				<button class="cu-btn sm line-blue border" @click="onButton({button_type:'list'})"
					v-if="listData.length===5">查看更多</button>
			</view>
		</view>
		<view class="list-box">
			<view class="list-item table-head">
				<view class="col-item" v-for="col in showColumn">
					{{col.label||''}}
				</view>
			</view>
			<view class="list-item" v-for="(item,index) in listData" v-show="item._dirtyFlags!=='delete'" :key="index"
				@click="onButton({button_type:'edit'},index)">
				<view class="col-item" v-for="col in showColumn">
					{{item[col.columns]||''}}
				</view>
				<text class="cuIcon-delete text-black" v-if="showDelete"
					@click.stop="onChildFormBtn({button_type:'delete'},index)"></text>
			</view>
			<view class="list-item" v-for="(item,index) in memoryListData"
				@click="onButton({button_type:'editMem'},index)">
				<view class="col-item" v-for="col in showColumn">
					{{item[col.columns]||''}}
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
		<view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='addChildData'}">
			<view class="cu-dialog" @click.stop.prevent="">
				<view class="close-btn text-right">
					<button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text
							class="cuIcon-close"></text></button>
				</view>
				<view class="child-form-wrap" v-if="addV2&&modalName==='addChildData'">
					<a-form v-if="addV2 && addV2._fieldInfo && isArray(addV2._fieldInfo)" :fields="addV2._fieldInfo"
						:pageType="use_type" :formType="use_type" ref="childForm" :key="modalName"></a-form>
				</view>
				<view class="button-box" v-if="addV2&&modalName==='addChildData'&&addV2.formButton">
					<button class="cu-btn bg-blue" v-for="btn in addV2.formButton"
						@click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
				</view>
			</view>
		</view>
		<batch-add ref="batchAdd" @submit="batchSubmit"></batch-add>
		<view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='updateChildData'}">
			<view class="cu-dialog" @click.stop.prevent="">
				<view class="close-btn text-right">
					<button class="cu-btn bg-white shadow-blur" @click="hideModal()"><text
							class="cuIcon-close"></text></button>
				</view>
				<view class="child-form-wrap" v-if="updateV2&&modalName==='updateChildData'">
					<a-form v-if="updateV2 && updateV2._fieldInfo && isArray(updateV2._fieldInfo)"
						:fields="updateV2._fieldInfo" :pageType="use_type" :formType="use_type" ref="childForm"
						:key="modalName"></a-form>
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
				orderCols: [],
				loading: false,
				modalName: "",
				memoryListData: [],
				currentItemIndex: null,
				currentItemType: null
			}
		},

		props: {
			appName: {
				type: String
			},
			config: {
				type: Object
			},
			mainData: {
				type: Object
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
						ignoreBtn.push('add')
					}

					// const ignoreBtn = ['select', 'add', 'batch_delete', 'delete']
					result = this.v2Data.gridButton.filter(item => item.permission === true && !ignoreBtn.includes(item
						.button_type))

					if (this.config?.foreign_key?.moreConfig?.batch_add?.target_column) {
						let batch_add = this.config.foreign_key.moreConfig.batch_add
						let column = this.orderCols.find(item => item.columns === batch_add.target_column)
						if (column?.option_list_v2?.serviceName) {
							result.unshift({
								...batch_add,
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
			showColumn() {
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
							this.add2List()
							break;
						case 'edit':
							this.updateChildListItem()
							break;
						case 'delete':
							if (typeof index === 'number' && index >= 0) {
								if (isMem) {
									this.deleteMemoryListItem(index)
								} else {
									this.listData[index]._dirtyFlags = 'delete'
									this.$set(this.listData, index, this.listData[index])
								}
								// if (this.finalListData[index]) {
								// 	if (this.finalListData[index]._isMemoryData === true) {
								// 		let i = index - this.listData.length
								// 		this.deleteMemoryListItem(i)
								// 	} else {
								// 		this.listData[index]._dirtyFlags = 'delete'
								// 	}
								// }
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
			add2List() {
				let data = this.$refs.childForm.getFieldModel();
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
					if (Object.keys(data).length > 0) {
						data._isMemoryData = true
						data._dirtyFlags = 'add'
						this.memoryListData.push(data)
					}
				}
				this.addV2._fieldInfo = this.addV2._fieldInfo.map(item => {
					item.value = null
					if (item.defaultValue && !item.value) {
						item.value = item.defaultValue
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
			onButton(e, index) {
				if (e && e.button_type) {
					switch (e.button_type) {
						case 'refresh':
							this.getList()
							break;
						case 'list':
							uni.navigateTo({
								url: `/publicPages/list/list?pageType=list&serviceName=${this.serviceName}&destApp=${this.srvApp}&cond=${JSON.stringify(this.condition)}`
							})
							break;
						case 'add':
							this.getAddV2()
							this.modalName = 'addChildData'
							break;
						case 'edit':
							if (index || index === 0) {
								let row = this.listData[index]
								this.getUpdateV2(row)
								this.currentItemIndex = index
								this.modalName = 'updateChildData'
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
							this.getAddV2()
							this.$refs.batchAdd.open(e)
							// let fk = this.config.foreign_key
							// debugger
							// let serviceName = e.column_option_list_v2?.serviceName
							// if(fk&&serviceName){
							// 	uni.navigateTo({
							// 		url:'/publicPages/list/list?pageType=batchAdd'
							// 	})
							// }
							break;
					}
					// this.$emit('onButton', {
					// 	btn: this.deepClone(e),
					// 	foreignKey: this.foreignKey,
					// 	v2Data: this.deepClone(this.addV2),
					// 	list: this.deepClone(this.listData)
					// })
				}
			},
			async getUpdateV2(row) {
				if (this.updateV2?._fieldInfo) {
					debugger
					this.updateV2._fieldInfo = this.updateV2._fieldInfo.map(item => {
						if (row && row[item.columns]) {
							item.value = row[item.columns]
						}
						return item
					})
					return
				}
				if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
					let app = this.appName || uni.getStorageSync('activeApp');
					let colVs = await this.getServiceV2(this.serviceName, 'update', 'update', app);
					colVs._fieldInfo = colVs._fieldInfo.map(item => {
						if (item.defaultValue) {
							item.value = item.defaultValue
						}
						if (item.in_update === 1) {
							item.display = true
						}
						if (item.columns === this.foreignKey?.referenced_column_name) {
							item.display = false
						}
						if (row && row[item.columns]) {
							item.value = row[item.columns]
						}
						return item
					})
					this.updateV2 = colVs
				}
			},
			async getAddV2() {
				if (this.addV2) {
					return
				}
				if (this.config?.use_type === 'addchildlist' || this.config?.use_type === 'updatechildlist') {
					let app = this.appName || uni.getStorageSync('activeApp');
					let colVs = await this.getServiceV2(this.serviceName, 'add', 'add', app);
					colVs._fieldInfo = colVs._fieldInfo.map(item => {
						if (item.defaultValue) {
							item.value = item.defaultValue
						}
						if (item.in_add === 1) {
							item.display = true
						}
						if (item.columns === this.foreignKey?.referenced_column_name) {
							item.display = false
						}
						return item
					})
					this.addV2 = colVs
				}
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
							rownumber: 5,
							pageNo: 1
						}
					};
					if (this.loading) {
						return
					}
					this.loading = true
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
