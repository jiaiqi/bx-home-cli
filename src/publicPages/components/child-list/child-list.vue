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
			<view class="list-item" v-for="(item,index) in listData" :key="index">
				<view class="col-item" v-for="col in showColumn">
					{{item[col.columns]||''}}
				</view>
			</view>
			<view class="list-item" v-for="(item,index) in memoryListData" :key="index">
				<view class="col-item" v-for="col in showColumn">
					{{item[col.columns]||''}}
				</view>
				<text class="cuIcon-close" @click="deleteMemoryListItem(index)"></text>
			</view>
			<view class="list-item" v-if="finalListData.length===0">
				<view class="col-item">
					暂无数据
				</view>
			</view>
		</view>
		<view class="cu-modal" @click.stop="hideModal" :class="{show:modalName==='addChildData'}">
			<view class="cu-dialog" @click.stop.prevent="">
				<view class="child-form-wrap" v-if="addV2&&modalName==='addChildData'">
					<a-form v-if="addV2 && addV2._fieldInfo && isArray(addV2._fieldInfo)" :fields="addV2._fieldInfo"
						:pageType="use_type" :formType="use_type" ref="childForm" :key="modalName"></a-form>
					<view class="button-box" v-if="addV2.formButton">
						<button class="cu-btn bg-blue" v-for="btn in addV2.formButton"
							@click="onChildFormBtn(btn)">{{btn.button_name||''}}</button>
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
				v2Data: null,
				addV2: null,
				listData: [],
				total: 0,
				orderCols: [],
				loading: false,
				modalName: "",
				memoryListData: []
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
			finalListData() {
				return [...this.listData, ...this.memoryListData]
			},
			use_type() {
				return this.config?.use_type
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
				if (Array.isArray(this.v2Data?.gridButton)) {
					const ignoreBtn = ['select', 'batch_delete', 'delete']
					// const ignoreBtn = ['select', 'add', 'batch_delete', 'delete']
					return this.v2Data.gridButton.filter(item => item.permission === true && !ignoreBtn.includes(item
						.button_type))
				} else {
					return []
				}
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
			deleteMemoryListItem(index){
				if(index||index===0){
					this.memoryListData.splice(index,1)
				}
			},
			getMemoryData() {
				return this.memoryListData.map(item => {
					delete item.isMemoryData
					return item
				})
			},
			onChildFormBtn(e) {
				if (e && e.button_type) {
					switch (e.button_type) {
						case 'submit':
							this.add2List()
							break;
						case 'reset':
							this.restChildForm()
							break;
						default:
							break;
					}
				}
			},
			restChildForm() {
				this.$refs.childForm.onReset()
			},
			add2List() {
				let data = this.$refs.childForm.getFieldModel();
				if(!data){
					return
				}
				if (typeof data === 'object' && Object.keys(data).length > 0) {
					for (let key in data) {
						if (Array.isArray(data[key])) {
							data[key] = data[key].toString();
						}
						if (!data[key]) {
							delete data[key]
						}
					}
					if (Object.keys(data).length > 0) {
						data.isMemoryData = true
						this.memoryListData.push(data)
					}
				}
				this.addV2._fieldInfo = this.addV2._fieldInfo.map(item => {
					item.value  = null
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
				this.modalName = ''

			},
			onButton(e) {
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
							this.modalName = 'addChildData'
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
			async getAddV2() {
				if (this.config?.use_type === 'addchildlist') {
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
				let use_type = this.config?.use_type || 'list'
				let colVs = await this.getServiceV2(this.serviceName, 'list', use_type, app);
				if (!colVs) {
					return
				}
				this.getAddV2()
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
					}
				}
			},
			hideModal() {
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

	.button-box {
		.cu-btn {
			min-width: 40%;
		}
	}
</style>
