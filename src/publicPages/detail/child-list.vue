<template>
	<view class="child-list">
		<view class="section-name">
			<text>{{config.label||''}}</text>
			<text class="cu-load" :class="loading?'loading':''"></text>
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
		</view>
		<view class="to-more">
			<!-- <view class="to-more" v-if="total>listData.length"> -->
			<button class="cu-btn sm line-blue border" v-for="btn in publicButton"
				@click="onButton(btn)">{{btn.button_name||''}}</button>
			<button class="cu-btn sm line-blue border" @click="onButton({button_type:'list'})">查看更多</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				v2Data: null,
				listData: [],
				total: 0,
				orderCols: [],
				loading: false
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
					const ignoreBtn = ['select', 'add', 'batch_delete', 'delete']
					return this.v2Data.gridButton.filter(item => item.permission === true && !ignoreBtn.includes(item
						.button_type))
				} else {
					return []
				}
			},
			showColumn() {
				if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
					const cols = this.orderCols.filter(item => item.columns && item.columns !== 'id' && item.columns
						.indexOf('_no') == -1).slice(0, 4)
					debugger
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
			onButton(e) {
				debugger
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
					}
				}
			},
			async getListV2() {
				let app = this.appName || uni.getStorageSync('activeApp');
				let colVs = await this.getServiceV2(this.serviceName, 'list', 'list', app);
				if (!colVs) {
					return
				}
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
				// this.publicButton = colVs.formButton.filter(item => item.permission === true);
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
				// debugger
				// let condition = [{
				// 	colName: foreignKey.column_name,
				// 	ruleType: 'eq',
				// 	value: formData[foreignKey.referenced_column_name]
				// }];
				// if (data?.srv_app && data?.service_name && data?.foreign_key) {
				// 	const foreign_key = data.foreign_key
				// 	condition = [{
				// 		colName: foreign_key.ref_service_column,
				// 		ruleType: "eq",
				// 		value: formData[foreign_key.refed_service_column]
				// 	}];
				// }
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
					this.loading = true
					const res = await this.$http.post(url, req)
					this.loading = false
					if (res.data?.state === 'SUCCESS') {
						this.listData = res.data.data
					}
				}

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
</style>
