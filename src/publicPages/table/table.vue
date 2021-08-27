<template>
	<view class="page-wrap">
		<view class="fixed cu-bar">
			<list-bar style="width: 100%;" :srvApp="appName" @change="changeSerchVal" :srvCols="filterCols"
				:listButton="customButton" :custom-button="customButton" @toOrder="toOrder" :main-data="mainData"
				@toFilter="toFilter" @onGridButton="clickGridButton" @clickAddButton="clickAddButton" @search="toSearch"
				v-if="showSearchBar">
			</list-bar>
		</view>
		<view class="" style="height: 100rpx;">

		</view>
		<scroll-view scroll-x="true">
			<view class="list-box ">
				<view class="list-item table-head">
					<view class="col-item"
						:style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}"
						v-for="col in tableColumn">
						{{col.label||''}}
					</view>
				</view>
				<view class="list-item" v-for="(item,index) in list" :key="index" @click="toDetail(item)">
					<view class="col-item"
						:style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}"
						:class="{'bg-orange':isTomorrow(item[col.columns],col.col_type),'bg-red':isToday(item[col.columns],col.col_type)}"
						v-for="col in tableColumn">
						<text v-if="isTomorrow(item[col.columns],col.col_type)">明天</text>
						<text v-else-if="isToday(item[col.columns],col.col_type)">今天</text>
						<text v-else-if="col.col_type=='Date'">{{item[col.columns]|hideYear}}</text>
						<text v-else> {{item[col.columns]||''}}</text>
					</view>
				</view>
				<view class="list-item">
					<view class="col-item" v-if="list.length===0&&loadStatus==='noMore'">
						暂无数据
					</view>
					<view class="col-item" v-if="loadStatus==='loading'">
						加载中...
					</view>
					<view class="col-item" v-if="list.length>0&&loadStatus==='noMore'">
						数据已全部加载
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import listBar from '@/publicPages/components/list-bar/list-bar.vue'
	import dayjs from '@/static/js/dayjs.min.js'
	export default {
		components: {
			// bxList
			listBar
		},
		data() {
			return {
				serviceName: "",
				columns: null,
				appName: "",
				list: [],
				pageNo: 1,
				colV2: null,
				loadStatus: 'more',
				condition: [],
				queryCond: null,
				orderList: [],
				searchWords: '',
				showSearchBar: false,
				listButton: [],
				descCol: null,
				ascCol: null,
				// colMinWidth: null,
				initCond: null,
				custom_btn: null
			}
		},
		filters: {
			hideYear: function(value) {
				if (value) {
					let year = (new Date()).getFullYear()
					value = value.replace(`${year}-`, '')
				}
				return value || ''
			}
		},
		computed: {
			colMinWidth() {
				return this.tableConfig.col_min_width
			},
			customButton() {
				let arr = []
				let customBtn = this.tableConfig?.custom_btn || this.custom_btn

				if (Array.isArray(customBtn) && customBtn.length > 0) {
					customBtn.forEach(item => {
						let obj = {
							"button_name": "跳转",
							"button_type": "navigateTo",
							"icon": "cuIcon-fork",
							url: ''
						}
						let url = item.target
						if (item.service) {
							url += `?serviceName=${item.service}`
						}
						if (item.destApp) {
							url += `&destApp=${item.destApp}`
						}
						if (item.columns) {
							url += `&columns=${item.columns}`
						}
						// if (item.cond) {
						// 	try {
						// 		url += `&cond=${JSON.stringify(item.cond)}`
						// 	} catch (e) {
						// 		//TODO handle the exception
						// 	}
						// }

						if (this.queryCond) {
							try {
								url += `&cond=${JSON.stringify(this.queryCond)}`
							} catch (e) {
								//TODO handle the exception
							}
						}

						if (item.col_min_width) {
							try {
								url += `&col_min_width=${JSON.stringify(item.col_min_width)}`
							} catch (e) {
								//TODO handle the exception
							}
						}
						obj.url = url
						arr.push(obj)
					})
				}
				return [...arr, ...this.listButton]
			},
			mainData() {
				let obj = {}
				if (Array.isArray(this.queryCond) && this.queryCond.length > 0) {
					this.queryCond.forEach(item => {
						obj[item.colName] === item.value
					})
					obj = this.queryCond.reduce((res, cur) => {
						res[cur.colName] = cur.value
						return res
					}, {})
				}
				return obj
			},
			today() {
				let today = dayjs().format('YYYY-MM-DD')
				return today
			},
			tomorrow() {
				let tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
				return tomorrow
			},
			moreConfig() {
				return this.colV2?.moreConfig
			},
			tableConfig() {
				return this.moreConfig?.tableConfig
			},
			srvCols() {
				return this.colV2?._fieldInfo || []
			},
			filterCols() {
				return this.colV2?._fieldInfo.filter(item => item.in_cond)
			},
			tableColumn() {
				if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
					let columns = this.tableConfig?.columns || this.columns
					if (columns && typeof columns === 'string') {
						columns = columns.split(',')
					}
					if (Array.isArray(columns) && columns.length > 0) {
						let arr = []
						columns.forEach(column => {
							this.srvCols.forEach(col => {
								if (col.columns === column) {
									arr.push(col)
								}
							})
						})
						return arr
						// .slice(0,4)
						// return this.srvCols.filter(item => this.columns.includes(item.columns))
					} else {
						const cols = this.srvCols.filter(item => item.columns && item.columns !== 'id' && item.columns
							.indexOf('_no') == -1).slice(0, 4)
						return cols
					}
				} else {
					return []
				}
			}
		},
		methods: {
			isTomorrow(val, type) {
				let tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
				return val && type === "Date" && val.indexOf(tomorrow) !== -1
			},
			isToday(val, type) {
				let today = dayjs().format('YYYY-MM-DD')
				return val && type === "Date" && val.indexOf(today) !== -1
			},
			toOrder(e) {
				this.orderList = e
				this.pageNo = 1
				this.getList()
			},
			toFilter(e) {
				this.condition = e
				this.pageNo = 1
				this.getList()
			},
			clickGridButton() {

			},
			clickAddButton(item) {

				if (item.button_type === 'add') {
					let fieldsCond = [];
					// if (Array.isArray(this.condition)) {
					// 	fieldsCond = this.condition.map(item => {
					// 		return {
					// 			column: item.colName,
					// 			value: item.value,
					// 			display: false
					// 		};
					// 	});
					// }
					if (Array.isArray(this.queryCond) && this.queryCond.length > 0) {
						fieldsCond = this.queryCond
					}
					let url =
						`/publicPages/form/form?type=add&serviceName=${item.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

					url =
						`/publicPages/formPage/formPage?type=add&serviceName=${item.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

					if (this.appName) {
						url += `&appName=${this.appName}`
					}
					uni.navigateTo({
						url: url
					});
				}
			},
			toSearch(e) {
				this.pageNo = 1
				this.searchWords = e
				this.getList()
			},
			changeSerchVal(val) {
				this.searchWords = val
			},
			toDetail(row) {
				if (row && row.id) {
					let fieldsCond = [{
						column: 'id',
						value: row.id,
						display: false
					}]
					let url =
						`/publicPages/form/form?type=detail&serviceName=${this.serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}`
					if (this.moreConfig?.detailPage === 'childTableList') {
						url =
							`/publicPages/detail/detail?serviceName=${this.serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}`
					}
					if (this.moreConfig?.clickTargetUrl) {
						url = this.renderStr(this.moreConfig.clickTargetUrl, row)
					}
					if (this.appName) {
						url += `&appName=${this.appName}`
					}
					uni.navigateTo({
						url: url
					})
				}
			},
			async getColV2() {
				let app = this.appName || uni.getStorageSync('activeApp');
				let colVs = await this.getServiceV2(this.serviceName, 'list', 'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				colVs._fieldInfo = colVs._fieldInfo.map(item => {
					if (Array.isArray(this.initCond) && this.initCond.length > 0) {
						if (item.type === 'Selector') {
							item.value = '全部'
							item.defaultValue = '全部'
						}
						let cond = this.initCond.find(cond => cond.colName === item.columns)
						if (cond && cond.value) {
							item.defaultValue = cond.value
							item.value = cond.value
						}
					}
					if (this.mainData && Object.keys(this.mainData).length > 0 && Array.isArray(item
							?.option_list_v2?.conditions) && item.option_list_v2
						.conditions
						.length > 0) {
						item.option_list_v2.conditions = this.evalConditions(item.option_list_v2.conditions,
							this.mainData)
					}
					return item
				})
				if (!this.navigationBarTitle) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				if (colVs.more_config) {
					try {
						colVs.moreConfig = JSON.parse(colVs.more_config)
					} catch (e) {
						debugger
						//TODO handle the exception
						console.info(e)
					}
				}
				this.colV2 = colVs;

				this.listButton = colVs.gridButton.filter(item => {
					if (item.permission === true && ['select', 'add'].includes(item.button_type)) {
						switch (item.button_type) {
							case 'add':
							case 'apply':
								item.icon = 'cuIcon-add'
								return item;
								break;
							case 'select':
								item.icon = 'cuIcon-filter'
								this.showSearchBar = true;
								return item;
								break;
						}
						return item;
					}
				})
				this.listButton.push({
					"button_type": "order",
					"icon": "cuIcon-order",
					"label": "排序"
				})
				return colVs;
			},
			async getList(option) {
				let serviceName = this.serviceName;
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: this.condition,
					page: {
						rownumber: 20,
						pageNo: this.pageNo
					},
					order: this.orderList,
					query_source: "list_page"
				};
				if (Array.isArray(req.order) && req.order.length === 0) {
					delete req.order
				}

				if (this.colV2?.vpage_no) {
					req['vpage_no'] = this.colV2.vpage_no
				}

				if (Array.isArray(this.condition) && this.condition.length > 0) {
					req.condition = this.condition
				}
				if (Array.isArray(this.queryCond) && this.queryCond.length > 0) {
					req.condition = [...req.condition, ...this.queryCond]
				}
				if (option && Array.isArray(option.initCond) && option.initCond.length > 0) {
					req.condition = [...req.condition, ...option.initCond]
				}
				if (this.searchWords) {
					let cond = this.tableColumn.map(item => {
						let obj = {
							colName: item.columns,
							ruleType: 'like',
							value: this.searchWords
						}
						return obj
					})
					if (cond.length > 0) {
						req.relation_condition = {
							"relation": "AND",
							data: [{
								"relation": "OR",
								data: cond
							}]
						}
						if (Array.isArray(req.condition) && req.condition.length > 0) {
							req.relation_condition.data.push({
								"relation": "AND",
								data: req.condition
							})
						}
						delete req.condition
					}
				}
				if (Array.isArray(this.orderList) && this.orderList.length > 0) {
					req.order = this.orderList
				}
				if (Array.isArray(this.descCol)) {
					req.order = [...req.order, ...this.descCol]
				}
				if (Array.isArray(this.ascCol)) {
					req.order = [...req.order, ...this.ascCol]
				}
				this.loadStatus = 'loading'
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					if (this.pageNo === 1) {
						this.list = [];
					}
					this.list = this.list.concat(res.data.data);
					// this.pageInfo.total = res.data.page.total;
					let page = res.data.page;
					if (page.rownumber * page.pageNo >= page.total) {
						this.loadStatus = 'noMore'
					} else {
						this.loadStatus = 'more'
					}
					return this.list;
				}
				this.loadStatus = 'noMore'
			},
		},
		onReachBottom() {
			if (this.loadStatus === 'more') {
				this.pageNo++
				this.getList()
			}
		},
		onPullDownRefresh() {
			this.pageNo = 1;
			this.getList({
				initCond: this.initCond
			})
			setTimeout(_ => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		onLoad(option) {
			// if (option.custom_btn) {
			// 	try {
			// 		let custom_btn = JSON.parse(option.custom_btn)
			// 		this.custom_btn = custom_btn
			// 	} catch (e) {
			// 		console.log(e)
			// 		//TODO handle the exception
			// 	}
			// }
			uni.$on('dataChange', srv => {
				if (this.serviceName && this.appName && srv && this.serviceName.indexOf(srv) !== -1) {
					uni.startPullDownRefresh()
					this.getList()
				}
			})
			if (option.serviceName) {
				this.serviceName = option.serviceName
				if (option.destApp) {
					this.appName = option.destApp
				}
				if (option.initCond) {
					try {
						let initCond = JSON.parse(option.initCond)
						if (Array.isArray(initCond)) {
							this.initCond = initCond.filter(item => {
								if (item.ruleType === 'eq') {
									return item.value
								} else {
									return true
								}
							})
						} else if (typeof initCond === 'object' && Object.keys(initCond).length > 0) {
							let arr = []
							Object.keys(initCond).forEach(key => {
								let obj = {
									colName: key,
									ruleType: 'eq',
									value: initCond[key]
								}
								arr.push(obj)
							})
							this.initCond = arr.filter(item => {
								if (item.ruleType === 'eq') {
									return item.value
								} else {
									return true
								}
							})
						}
					} catch (e) {
						//TODO handle the exception
					}
				}
				// if (option.columns) {
				// 	this.columns = option.columns.split(',')
				// }
				// if (option.col_min_width) {
				// 	try {
				// 		this.colMinWidth = JSON.parse(option.col_min_width)
				// 	} catch (e) {
				// 		//TODO handle the exception
				// 	}
				// }
				if (option.descCol) {
					try {
						this.descCol = option.descCol.split(',').map(item => {
							return {
								colName: item,
								orderType: 'desc'
							}
						})
					} catch (e) {
						//TODO handle the exception
					}
				}
				if (option.ascCol) {
					try {
						this.ascCol = option.ascCol.split(',').map(item => {
							return {
								colName: item,
								orderType: 'asc'
							}
						})
					} catch (e) {
						//TODO handle the exception
					}
				}
				if (option.cond) {
					try {
						let cond = JSON.parse(option.cond)
						if (Array.isArray(cond)) {
							this.queryCond = cond.filter(item => {
								if (item.ruleType === 'eq') {
									return item.value
								} else {
									return true
								}
							})
						} else if (typeof cond === 'object' && Object.keys(cond).length > 0) {
							let arr = []
							Object.keys(cond).forEach(key => {
								let obj = {
									colName: key,
									ruleType: 'eq',
									value: cond[key]
								}
								arr.push(obj)
							})
							this.queryCond = arr.filter(item => {
								if (item.ruleType === 'eq') {
									return item.value
								} else {
									return true
								}
							})
						}
					} catch (e) {
						//TODO handle the exception
					}
				}
				this.getColV2().then(_ => {
					// uni.startPullDownRefresh()
					this.getList({
						initCond: this.initCond
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	// .page-wrap {
	// 	overflow: hidden;
	// }

	.fixed {
		position: fixed;
		width: 100%;
		top: var(--window-top);
		z-index: 1;
	}



	.list-box {
		.list-item {
			padding: 10rpx 20rpx;
			display: flex;
			// border: 1px solid #f1f1f1;
			// border-top: none;
			border-bottom: 1px solid #f1f1f1;
			align-items: center;

			&:nth-child(2n+1) {
				background-color: #F9f9f9;
			}

			&.table-head {
				font-size: 24rpx;
				color: #000;
				font-weight: bold;
				background-color: #F1F1F1;
			}

			.col-item {
				flex: 1;
				// min-width: 25%;
				text-align: center;
				// border-right: 1px solid #f1f1f1;
				padding: 10rpx 0;
				word-break: break-all;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				/**指定行数*/
				-webkit-box-orient: vertical;
				overflow: hidden;

				&:last-child {
					border-right: none;
				}
			}
		}

	}
</style>
