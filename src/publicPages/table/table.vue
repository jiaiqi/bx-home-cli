<template>
	<view class="page-wrap">
		<view class="fixed cu-bar">
			<list-bar style="width: 100%;" :srvApp="appName" @change="changeSerchVal" :srvCols="filterCols"
				:orderColExtension="orderColExtension" :readonly="listBarReadonly" :listButton="customButton"
				:gridButtonDisp="gridButtonDisp" :custom-button="customButton" @toOrder="toOrder" :main-data="mainData"
				@toFilter="toFilter" @onGridButton="clickGridButton" @clickAddButton="clickAddButton" @search="toSearch"
				v-if="showSearchBar">
			</list-bar>
		</view>
		<view class="" style="height: 100rpx;">

		</view>
		<filter-tags :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
			@on-input-value="onFilterChange" @on-change="getTableDatas" v-if="colV2&&colV2.srv_cols&&tags">
		</filter-tags>
		<scroll-view scroll-x="true">
			<checkbox-group @change="checkboxChange">
				<view class="list-box">
					<view class="list-item table-head">
						<checkbox style="opacity: 1;transform:scale(0.7);" :checked="!hasNotSelect" v-if="showCheckBox"
							@click="selectAll" />
						<view class="col-item"
							:style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}"
							v-for="col in tableColumn" :key="col.columns">
							{{col.label||''}}
						</view>
					</view>
					<view class="list-item" v-for="(item,index) in list" :key="index">
						<checkbox color="#0BC99D" :value="item.id+''" :checked="item.checked" v-if="showCheckBox"
							style="transform:scale(0.7)" />
						<view class="col-item" @click="toDetail(item)"
							:style="{'min-width':colMinWidth&&colMinWidth[col.columns]?colMinWidth[col.columns]:''}"
							:class="{'bg-orange round light':isTomorrow(item[col.columns],col.col_type),'bg-red round light':isToday(item[col.columns],col.col_type)}"
							v-for="col in tableColumn" :key="col.columns">
							<text v-if="isTomorrow(item[col.columns],col.col_type)">明天</text>
							<text v-else-if="isToday(item[col.columns],col.col_type)">今天</text>
							<text v-else-if="col.col_type=='Date'">{{item[col.columns]|hideYear}}</text>
							<text
								v-else-if="col.col_type=='Time'">{{item[col.columns]?item[col.columns].slice(0,5):''}}</text>
							<image class="image" :src="getImagePath(item[col.columns],true)" mode="aspectFit"
								v-else-if="col.type==='images'&&item[col.columns]"></image>
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
			</checkbox-group>
			<!-- </bx-checkbox-group> -->
		</scroll-view>

		<view class="float-button-box" v-if="custom_btn&&custom_btn.handler_buttons">
			<button class="cu-btn" :class="[item.bgColor]" v-for="(item,index) in custom_btn.handler_buttons" :key="index"
				@click="onBatchOperate(item)">{{item.button_name||''}}</button>
			<button class="cu-btn" @click="hideBatchBtn">取消</button>
		</view>

		<view class="cu-modal bottom-modal" :class="{show:'showBatchUpdate' === modalName}" @click="hideModal()">
			<view class="cu-dialog" @click.stop="">
				<view class="batch-update-modal" v-if="batchUpdateV2">
					<a-form v-if="batchUpdateV2 && isArray(batchUpdateV2._fieldInfo)" :fields="batchUpdateV2._fieldInfo"
						:pageType="'update'" :formType="'update'" ref="updateForm"></a-form>
					<view class="button-box" v-if="batchUpdateV2._formButtons">
						<button class="cu-btn" @click="hideModal">取消</button>
						<button class="cu-btn bg-blue" v-for="(item,index) in batchUpdateV2._formButtons" :key="index"
							@click="onBatchFormButton(item)">{{item.button_name}}</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import listBar from '@/publicPages/components/list-bar/list-bar.vue'
	const dayjs = require('dayjs');
	export default {
		components: {
			// bxList
			listBar
		},
		data() {
			return {
				showCheckBox: false,
				selectedDeleteItem: "",
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
				showSearchBar: true,
				listButton: [],
				descCol: null,
				ascCol: null,
				col_min_width: null,
				initCond: null,
				custom_btn: null,
				batchUpdateV2: null,
				modalName: null,
				relationCondition: {},
				onInputValue: false, // 是否有查询条件
				eFilterCols: null,
				// listBarReadonly:false,
				readonly: false
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
			gridButtonDisp() {
				return this.moreConfig?.gridButtonDisp || {}
			},
			listBarReadonly() {
				return this.readonly || this.tableConfig?.listBarReadonly
			},
			hasNotSelect() {
				return this.list.find(item => item.checked === false)
			},
			colMinWidth() {
				return this.col_min_width || this.tableConfig?.col_min_width
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
						if (item.handler_buttons) {
							obj.handler_buttons = item.handler_buttons
						}
						if (item.type) {
							obj.button_type = item.type
						}
						if (item.icon) {
							obj.icon = item.icon
						}

						let url = item.target
						if (item.service) {
							obj.serviceName = item.service
							url += `?serviceName=${item.service}`
						}
						if (item.destApp) {
							obj.appName = item.destApp
							url += `&destApp=${item.destApp}`
						}
						if (item.columns) {
							obj.columns = item.column
							url += `&columns=${item.columns}`
						}

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
			tags() {
				if (Array.isArray(this.colV2?.tabs)) {
					let tabs = this.colV2?.tabs
					let self = this
					let tab = {}
					let tabsData = []
					tabs.forEach((t) => {
						tab = {
							service: null,
							table_name: null,
							orders: null,
							conditions: null,
							seq: null,
							parent: null,
							label: null,
							list_tab_no: null,
							more_config: null,
							inputType: null
						}
						let mc = JSON.parse(t.more_config)
						tab.more_config = mc
						tab.service = t.service
						tab.table_name = t.table_name
						tab.conditions = t.conditions
						tab.orders = t.orders
						tab.default = mc.default
						tab.seq = t.seq
						tab.label = t.label
						tab.list_tab_no = t.list_tab_no
						tab._data = t
						tab._type = mc.type || null
						tab._colName = mc.colName || null
						tab.inputType = mc.inputType || null
						tab.showAllTag = mc.showAllTag || false
						tab.default = mc.default || ''
						tab.placeholder = mc.placeholder || '请输入...'

						if (tab._colName) {
							tab._colName = tab._colName.split(',')
							let cols = tab._colName
							let srvCols = self.colV2.srv_cols
							tab['_colSrvData'] = []
							for (let c = 0; c < cols.length; c++) {
								for (let cs = 0; cs < srvCols.length; cs++) {
									if (cols[c] === srvCols[cs].columns) {
										tab._colSrvData.push(srvCols[cs])
									}
								}
							}
						}
						tabsData.push(tab)
					})
					return tabsData
				}
				// return this.colV2?.tabs
			},
			moreConfig() {
				return this.colV2?.moreConfig
			},
			tableConfig() {
				return this.moreConfig?.tableConfig
			},
			filterColExtension() {
				return this.tableConfig?.filterColExtension
			},
			orderColExtension() {
				return this.tableConfig?.orderColExtension
			},
			searchColExtension() {
				return this.tableConfig?.searchColExtension
			},
			srvCols() {
				return this.colV2?._fieldInfo || []
			},
			filterCols() {
				let cols = this.colV2?._fieldInfo.filter(item => (item.in_cond && !['text', 'textarea'].includes(item
					.type)))
				if (Array.isArray(cols)) {
					let filterColExtension = this.filterColExtension
					if (Array.isArray(filterColExtension) && Array.isArray(this.eFilterCols) && this.eFilterCols.length >
						0) {
						filterColExtension = [...filterColExtension, ...this.eFilterCols]
					}
					if (Array.isArray(filterColExtension) && filterColExtension.length > 0) {
						let extensionCols = filterColExtension.map(item => item.columns)
						cols = cols.filter(item => !extensionCols.includes(item.columns))
						return [...cols, ...filterColExtension]
					}
				}
				return cols
			},
			tableColumn() {
				let columns = []
				if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
					columns = this.tableConfig?.columns
				}

				if (Array.isArray(this.columns) && this.columns.length > 0) {
					columns = this.columns
				}

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
				} else {
					const cols = this.srvCols.filter(item => item.columns && item.columns !== 'id' && item.columns
						.indexOf('_no') == -1).slice(0, 4)
					return cols
				}
				return columns
			}
		},
		methods: {
			onFilterChange(e) {
				this.onInputValue = e
				if (e) {
					let tabsConds = this.$refs.filterTabs.buildConditions()
					this.relationCondition = tabsConds
				}
			},
			onReset() {
				this.$refs.filterTabs.onReset()
			},
			getTableDatas() {
				let self = this
				let tabsConds = this.$refs.filterTabs.buildConditions()
				this.relationCondition = tabsConds
				setTimeout(() => {
					this.pageNo = 1;
					this.getList({
						initCond: this.initCond
					})
				}, 100)
			},
			hideBatchBtn() {
				this.hideModal()
				this.showCheckBox = false
				this.custom_btn = null
				this.list = this.list.map(item => {
					item.checked = false;
					return item
				})
			},
			async onBatchFormButton(e) {
				if (e.button_type === 'edit') {
					let data = this.$refs.updateForm.getFieldModel()
					if (data && typeof data === 'object' && Object.keys(data).length > 0) {
						let req = [{
							serviceName: e.service_name,
							data: [data],
							condition: []
						}];
						let selectData = this.list.filter(item => item.checked)
						if (Array.isArray(selectData) && selectData.length > 0) {
							req[0].condition = [{
								colName: 'id',
								ruleType: 'in',
								value: selectData.map(item => item.id).toString()
							}]
							this.hideBatchBtn()
							let app = this.appName || uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(app, e.service_name, 'add');
							let res = await this.onRequest('update', e.service_name, req, app);

							if (res.data.state === 'SUCCESS') {
								this.getList({
									initCond: this.initCond
								}).then(_ => {
									uni.showToast({
										title: `${res.data.resultMessage}`,
										duration: 2000,
										mask: true
									})
								})
							} else {
								uni.showToast({
									title: res.data.resultMessage,
									mask: false,
									icon: 'none'
								});
							}
						} else {
							uni.showToast({
								title: '请先点击左侧单选框进行选择',
								icon: 'none'
							})
							return
						}
					}
				}
			},
			onBatchOperate(e) {
				let arr = this.list.filter(item => item.checked).map(item => item.id)
				if (arr.length === 0) {
					uni.showToast({
						title: '请先点击左侧单选框进行选择',
						icon: 'none'
					})
					return
				}
				const batchDelete = (e) => {
					// 批量删除
					if (arr.length > 0) {
						let req = [{
							"serviceName": e.service,
							"condition": [{
								"colName": "id",
								"ruleType": "in",
								"value": arr.toString()
							}]
						}]
						if (e.service) {
							let url = this.getServiceUrl(this.appName, e.service, 'operate');
							uni.showModal({
								title: '提示',
								content: `即将删除${arr.length}条数据，确认进行删除操作?`,
								success: (res) => {
									if (res.confirm) {
										this.$http.post(url, req).then(res => {
											this.showCheckBox = false
											if (res.data.state === 'SUCCESS') {
												// uni.startPullDownRefresh()
												this.pageNo = 1;
												this.getList({
													initCond: this.initCond
												}).then(_ => {
													uni.showToast({
														title: '操作成功',
														duration: 1000,
														mask: true
													})
												})
											}
										})
									}
								}
							})
						} else {
							uni.showModal({
								title: '提示',
								content: '按钮配置有误',
								confirmText: '知道了',
								showCancel: false
							})
						}
					} else {
						if (this.showCheckBox) {} else {
							uni.showModal({
								title: '提示',
								content: '请选择要删除的数据',
								confirmText: '知道了',
								showCancel: false
							})
						}
					}
				}

				const batchUpdate = async (e) => {
					let app = this.appName || uni.getStorageSync('activeApp');
					let colVs = await this.getServiceV2(e.service, 'update', 'update', app);
					if (e.columns) {
						colVs._fieldInfo = colVs._fieldInfo.filter(item => e.columns.includes(item.column))
					}
					this.batchUpdateV2 = colVs
					this.modalName = 'showBatchUpdate';
				}


				if (e.button_type && e.service) {
					switch (e.button_type) {
						case 'delete':
							batchDelete(e)
							break;
						case 'update':
							this.batchUpdateV2 = null
							batchUpdate(e)
							break;
					}
				}
			},
			async getOptionsByGroup(field) {
				let serviceName = field.service_name;
				let colName = field.column;
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: [{
						colName: colName,
						ruleType: 'notnull'
					}],
					page: {
						rownumber: 200,
						pageNo: 1
					},
					group: [{
						"colName": colName,
						"type": "by"
					}]
				};
				if (Array.isArray(this.condition) && this.condition.length > 0) {
					req.condition = [...req.condition, ...this.condition]
				}
				let res = await this.$http.post(url, req)
				if (res.data.state == 'SUCCESS' && res.data.data) {
					return res.data.data.map(item => {
						return {
							label: item[colName],
							value: item[colName]
						}
					})
				} else {
					return []
				}
			},
			async handleExtensionCol(cols) {
				if (Array.isArray(cols) && cols.length > 0) {
					let arr = []
					for (let index in cols) {
						let item = cols[index]
						let res = null
						if (typeof item === 'string') {
							let field = this.srvCols.find(col => col.columns === item)
							if (field) {
								res = field
							}
						} else if (typeof item === 'object') {
							if (item.colName) {
								let field = this.srvCols.find(col => col.columns === item.colName)
								if (field) {
									if (item.type === 'groupBy') {
										field.type = "Selector"
										field.bx_col_type = "enum"
										field.col_type = "Enum"
										let res = await this.getOptionsByGroup(field)
										// .then(res => {
										field.option_list_v2 = res
										field.options = res
										// })
									}
								}
							}
						}
						arr.push(res)
					}
					return arr.filter(item => item && item)
				}
			},
			checkboxChange(e) {
				var items = this.list,
					values = e.detail.value;
				for (var i = 0, lenI = items.length; i < lenI; ++i) {
					const item = items[i]
					if (values.includes(item.id) || values.includes(item.id.toString())) {
						this.$set(item, 'checked', true)
					} else {
						this.$set(item, 'checked', false)
					}
				}
			},
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
				this.initCond = e
				this.getList()
			},
			clickGridButton(e) {
				if (e.button_type && ['delete', 'batch_delete'].includes(e.button_type)) {
					// 批量删除
					let arr = this.list.filter(item => item.checked).map(item => item.id)
					if (arr.length > 0) {
						let req = [{
							"serviceName": e.service_name,
							"condition": [{
								"colName": "id",
								"ruleType": "in",
								"value": arr.toString()
							}]
						}]
						if (e.service_name) {
							let url = this.getServiceUrl(e.application || this.appName, e.service_name, 'operate');
							uni.showModal({
								title: '提示',
								content: `即将删除${arr.length}条数据，确认进行删除操作?`,
								success: (res) => {
									if (res.confirm) {
										this.$http.post(url, req).then(res => {
											this.showCheckBox = false
											if (res.data.state === 'SUCCESS') {
												// uni.startPullDownRefresh()
												this.pageNo = 1;
												this.getList({
													initCond: this.initCond
												}).then(_ => {
													uni.showToast({
														title: '操作成功',
														duration: 1000,
														mask: true
													})
												})
											}
										})
									}
								}
							})
						} else {
							uni.showModal({
								title: '提示',
								content: '按钮配置有误',
								confirmText: '知道了',
								showCancel: false
							})
						}
					} else {
						if (this.showCheckBox) {
							this.showCheckBox = false
						} else {
							uni.showModal({
								title: '提示',
								content: '请选择要删除的数据',
								confirmText: '知道了',
								showCancel: false
							})
							this.showCheckBox = true
						}
					}
				} else if (e.button_type && ['batch_operate'].includes(e.button_type)) {
					// 批量操作
					this.custom_btn = e
					this.showCheckBox = true
					this.list = this.list.map(item => {
						item.checked = false
						return item
					})
				}
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
						fieldsCond = this.queryCond.map(item => {
							item.disabled = true;
							return item
						})
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
			selectAll() {
				if (this.list.find(item => item.checked === false)) {
					this.list = this.list.map(item => {
						item.checked = true
						return item
					})
				} else {
					this.list = this.list.map(item => {
						item.checked = false
						return item
					})
				}
			},
			toDetail(row) {
				if (this.showCheckBox) {
					return
				}
				if (this.moreConfig?.customDetailUrl) {
					let data = {
						rowData: row,
						userInfo: this.$store?.state?.user?.userInfo,
						storeInfo: this.$store?.state?.app?.storeInfo,
						bindUserInfo: this.$store?.state?.user?.storeUserInfo
					}
					let url = this.renderStr(this.moreConfig?.customDetailUrl, data)
					uni.navigateTo({
						url: url
					})
					return
				}


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
						//TODO handle the exception
						console.info(e)
					}
				}
				this.colV2 = colVs;
				try {
					if (colVs.moreConfig?.tableConfig?.filterColExtension) {
						colVs.moreConfig.tableConfig.filterColExtension = await this.handleExtensionCol(colVs
							.moreConfig
							.tableConfig.filterColExtension)
					}
					if (colVs.moreConfig?.tableConfig?.orderColExtension) {
						colVs.moreConfig.tableConfig.orderColExtension = await this.handleExtensionCol(colVs.moreConfig
							.tableConfig.orderColExtension)
					}
					if (colVs.moreConfig?.tableConfig?.searchColExtension) {
						colVs.moreConfig.tableConfig.searchColExtension = await this.handleExtensionCol(colVs
							.moreConfig
							.tableConfig.searchColExtension)
					}
				} catch (e) {
					//TODO handle the exception
				}
				this.listButton = colVs.gridButton.filter(item => {
					if (item.permission === true && ['select', 'add', 'delete', 'batch_delete'].includes(item
							.button_type)) {
						switch (item.button_type) {
							case 'batch_delete':
							case 'delete':
								item.icon = 'cuIcon-delete'
								return item
								break;
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
					order: this.orderList || [],
					query_source: "list_page"
				};


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
					if (Array.isArray(this.searchColExtension) && this.searchColExtension.length > 0) {
						// 配置了模糊搜索拓展字段
						let cols = this.searchColExtension.reduce((res, cur) => {
							if (typeof cur === 'string') {
								res.push(cur)
							} else if (typeof cur === 'object' && cur.column) {
								res.push(cur.column)
							}
							return res
						}, [])

						cols = cols.filter(item => !cond.find(col => col.colName === item))
						cols = this.srvCols.filter(item => cols.includes(item.columns))
						cols = cols.map(item => {
							let obj = {
								colName: item.columns,
								ruleType: 'like',
								value: this.searchWords
							}
							return obj
						})
						if (cols.length > 0) {
							cond = [...cond, ...cols]
						}
					}
					if (cond.length > 0) {
						req.relation_condition = {
							"relation": "AND",
							data: [{
								"relation": "OR",
								data: cond
							}]
						}

						if (Array.isArray(req.condition) && req.condition.length > 0) {
							req.relation_condition = {
								"relation": "AND",
								data: [
									// ... req.condition,
									{
										"relation": "OR",
										data: cond
									}
								]
							}
						}

						if (Array.isArray(this.relationCondition?.data) && this.relationCondition.data.length > 0) {
							// req.relation_condition.data.push(this.relationCondition.data)
							req.relation_condition = {
								"relation": "AND",
								data: [
									...this.relationCondition.data,
									{
										"relation": "OR",
										data: cond
									}
								]
							}
						}
						// delete req.condition
					} else if (req.condition.length > 0) {
						if (Array.isArray(this.relationCondition?.data) && this.relationCondition.data.length > 0) {
							req.relation_condition = this.relationCondition
						}
					}
				} else {
					req.relation_condition = this.relationCondition
				}
				if (Array.isArray(this.orderList) && this.orderList.length > 0) {
					req.order = this.orderList
				}
				if (Array.isArray(this.descCol)) {
					req.order = [...req.order || [], ...this.descCol]
				}
				if (Array.isArray(this.ascCol)) {
					req.order = [...req.order, ...this.ascCol]
				}
				if (Array.isArray(req.order) && req.order.length === 0) {
					delete req.order
				}
				this.loadStatus = 'loading'
				let res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					res.data.data = res.data.data.map(item => {
						item.checked = false
						return item
					})
					if (this.pageNo === 1) {
						this.list = [];
					}
					this.list = [...this.list, ...res.data.data];
					let page = res.data.page;
					if (page.rownumber * page.pageNo >= page.total) {
						this.loadStatus = 'noMore'
					} else {
						this.loadStatus = 'more'
					}
					return this.list;
				}
				this.loadStatus = 'noMore'
				return
			},
			hideModal() {
				this.modalName = null
			}

		},
		onReachBottom() {
			if (this.loadStatus === 'more') {
				this.pageNo++
				this.getList({
					initCond: this.initCond
				})
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
			if (option.readonly) {
				this.readonly = true
			}
			uni.$on('dataChange', srv => {
				if (this.serviceName && this.appName && srv && this.serviceName.indexOf(srv) !== -1) {
					this.pageNo = 1;
					this.getList({
						initCond: this.initCond
					})
				}
			})
			if (option.serviceName) {
				this.serviceName = option.serviceName
				if (option.destApp) {
					this.appName = option.destApp
				}
				if (option.eFilterCols) {
					try {
						this.eFilterCols = option.eFilterCols.split(',')
					} catch (e) {
						//TODO handle the exception
					}
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
				if (Array.isArray(this.initCond) && this.initCond.length > 0) {
					this.initCond = this.initCond.map(item => {
						if (item.value && item.value.indexOf('$today') > -1) {
							if (item.format) {
								item.value = this.dayjs().format(item.format)
								delete item.format
							} else {
								item.value = this.dayjs().format('YYYY-MM-DD')
							}
						}

						return item
					})
				}
				if (option.columns) {
					this.columns = option.columns.split(',')
				}
				if (option.col_min_width) {
					try {
						this.col_min_width = JSON.parse(option.col_min_width)
					} catch (e) {
						//TODO handle the exception
					}
				}
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
		width: 100%;

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

				.image {
					width: 100rpx;
					height: 100rpx;
					border-radius: 5px;
				}
			}
		}

	}

	.float-button-box {
		z-index: 10;
		position: fixed;
		bottom: 80rpx;
		width: 80%;
		left: 10%;
		text-align: center;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		border: 1rpx solid #f1f1f1;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

		.cu-btn {
			margin-right: 20rpx;

			&:last-child {
				margin-right: 0;
			}
		}
	}

	.batch-update-modal {
		padding: 40rpx;
		margin-bottom: 50rpx;

		.button-box {
			padding: 20rpx;
			margin-top: 20rpx;

			.cu-btn {
				width: 40%;
				margin-right: 20rpx;

				&:last-child {
					margin-right: 0;
				}
			}
		}
	}
</style>
