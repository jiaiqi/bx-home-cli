<template>
	<view class="list-wrap" :class="{'mt-100':listType === 'proc'}">
		<view class="list-header" v-if="handerButtonsRun&&handerButtonsRun.length > 0 && submintType === 'men'">
			<view class="hander-btn">
				<text class="cu-btn round sm text-blue line-blue" v-for="(btn,index) in handerButtonsRun"
					:class="'cuIcon-' + btn.button_type" :key="btn.id" @click="handerBtnClick(btn)">
					{{ btn.button_name }}
				</text>
			</view>
		</view>
		<scroll-view scroll-x class="bg-white nav cu-bar fixed" v-if="listType === 'proc'">
			<view class="flex text-center " style="margin-top: 100rpx;">
				<view class="cu-item flex-sub" :class="index == TabCur ? 'text-orange cur' : ''"
					v-for="(item, index) in tabList" :key="index" @tap="tabSelect($event, item, index)"
					:data-id="index">
					{{ item.label }}
					<text class="text-red"
						style="margin-left: 10upx; padding:0 10upx;border-radius: 10upx;">{{ item.total }}</text>
				</view>
			</view>
		</scroll-view>
		<view v-if="listType === 'proc'">
			<list-item :detailList="detailList" :showBtn='showBtn' v-for="(item, index) in tabList[TabCur]['data']"
				:key="index" :itemData="item" :viewTemp="finalViewTemp" :viewType="viewType" :imageNum="imageNum"
				:gridRowNum="gridRowNum" :rowButton="rowButton" :srv_cols="colRun" :pageType="pageType"
				:listType="listType" :showFootBtn="showFootBtn" @click-list-item="clickItem"
				:proc_data_type="proc_data_type" @click-foot-btn="clickFootBtn"></list-item>
		</view>
		<view :class="{ 'grid-layout': onlyShowTitle }" v-else>
			<list-item :detailList="detailList" v-for="item in listDataRun" :customBtn="customBtn" :key="item[rowKey]" :showBtn='showBtn'
				:itemData="item" :viewTemp="finalViewTemp" :viewType="viewType" :imageNum="imageNum"
				:gridRowNum="gridRowNum" :rowButton="rowButtonsRun ||rowButton" :srv_cols="colRun" :listType="listType"
				:pageType="pageType" :showFootBtn="showFootBtn" :layout="onlyShowTitle ? 'grid' : 'normal'"
				@click-list-item="clickItem" @click-foot-btn="clickFootBtn"></list-item>
		</view>

		<view class="pagination" v-if="showPagination">
			<text class="page-no">{{ page.pageNo }}</text>
			<text class="total">{{ page.total }}</text>
		</view>

	</view>
</template>

<script>
	import listItem from './tree-list-item.vue';
	export default {
		name: 'List',
		components: {
			listItem,
		},
		data() {
			return {
				index: -1,
				TabCur: 0,
				listData: [],
				menListData: [],
				noData: false,
				formMethodType: null,
				menPageType: null,
				pageInfo: {
					total: 0,
					rownumber: this.rownumber || 20,
					pageNo: 1
				},
				srv_cols: [],
				rowButton: [],
				searchCol: '',
				tabList: [{
						label: '待我处理',
						proc_data_type: 'wait',
						data: [],
						total: 0,
						page: {
							total: 0,
							rownumber: 20,
							pageNo: 1
						}
					},
					{
						label: '我的全部',
						proc_data_type: 'myall',
						data: [],
						total: 0,
						page: {
							total: 0,
							rownumber: 20,
							pageNo: 1
						}
					},
					{
						label: '我的申请',
						proc_data_type: 'mine',
						data: [],
						total: 0,
						page: {
							total: 0,
							rownumber: 20,
							pageNo: 1
						}
					},
					{
						label: '我已处理',
						proc_data_type: 'processed',
						data: [],
						total: 0,
						page: {
							total: 0,
							rownumber: 20,
							pageNo: 1
						}
					},
					{
						label: '全部',
						proc_data_type: 'userall',
						data: [],
						total: 0,
						page: {
							total: 0,
							rownumber: 20,
							pageNo: 1
						}
					}
				],
				proc_data_type: 'wait',
				addV2Data: null,
				fields: [],
				popupTitle: "",
				select_service: null,
				update_service: null,
				delete_service: null,
				onUpdateDataKey: null,
				btnPermissionArr: [],
				heightReduce: '100'
			};
		},
		computed: {
			page() {
				let page = {
					total: 0,
					rownumber: 20,
					pageNo: 1
				}
				if (this.listType === 'proc') {
					page = this.tabList[this.TabCur].page
				} else {
					page = this.pageInfo
				}
				return page
			},
			noPage() {
				return ['srvsys_table_columns_select'].includes(this.serviceName)
			},
			totalPages() {
				let result = 0
				if (this.listType === 'proc') {
					const page = this.tabList[this.TabCur].page
					result = page?.total / page.rownumber
				} else {
					result = this.pageInfo?.total / this.pageInfo?.rownumber
				}
				return Math.ceil(result)
			},
			currentPage() {
				let result = 0
				if (this.listType === 'proc') {
					result = this.tabList[this.TabCur]?.page?.pageNo
				} else {
					result = this.pageInfo?.pageNo
				}
				return result
			},
			listHeight() {
				let list = this.listData
				if (Array.isArray(list) && this.useDataHeight) {
					return list.length * 110 + 'px'
				}
			},
			listDataRun() {
				let datas = this.menListData.concat(this.listData)
				return datas
			},
			onlyShowTitle() {
				if (this.viewTemp) {
					if (!this.viewTemp.tip && !this.viewTemp.img && !this.viewTemp.price && !this.viewTemp.footer && this
						.viewTemp.title) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			},
      customBtn(){
        if(Array.isArray(this.moreConfig?.custom_btn)){
          return this.moreConfig.custom_btn
        }
      },
      moreConfig() {
      	if (this.listConfig && this.listConfig.moreConfig) {
      		return this.listConfig.moreConfig
      	}
      },
      configViewTemp() {
      	// more_config中配置的字段显示关系
      	if (this.moreConfig && this.moreConfig.viewTemp) {
      		return this.moreConfig.viewTemp
      	} else if (this.moreConfig && this.moreConfig.appTempColMap) {
      		return this.moreConfig.appTempColMap
      	}
      },
      finalViewTemp() {
      	// 最终使用的 字段显示关系
      	if (this.configViewTemp && typeof this.configViewTemp === 'object' && Object.keys(this
      			.configViewTemp)
      		.length > 0) {
      		return this.configViewTemp
      	} else {
      		return this.viewTemp
      	}
      },
			"v2ViewTemp": function() {
				let v2config = this.listConfig?.more_config || this.v2Datas?.more_config || null
				let res = null
				if (v2config) {
          try{
            let config = JSON.parse(v2config)
            if (config.hasOwnProperty("appTempColMap")) {
            	res = config.appTempColMap
            }
          }catch(e){
            //TODO handle the exception
          }
					
				}
				if (res) {
					return res
				} else {
					return this.viewTemp
				}
			},
			colRun: function() {
				let v2config = this.listConfig?.srv_cols || this.v2Datas?.srv_cols || null
				return v2config
			},
			rowButtonsRun: function() {
				let self = this
				let rowButtons = this.rowButtons || this.rowButton
				rowButtons = rowButtons.filter((item, index) => {
					if (item.permission && item.client_type.indexOf('APP') !== -1) {
						if (item.button_type !== 'undo') {
							if (item.disp_exps) {
								item = self.buttonIsExps(self.childMainData, item)
							}
							if (!item.hasOwnProperty('visible')) {
								return item
							} else if (item.hasOwnProperty('visible') && item.visible === '是') {
								return item
							}
						} else if (item.button_type !== 'customize') {}
					}
				})
				return rowButtons
			},
			handerButtonsRun: function() {
				let self = this
				let handerButtons = self.handerButtons
				if (!Array.isArray(handerButtons) || (Array.isArray(handerButtons) && handerButtons.length === 0)) {
					return []
				}
				handerButtons = handerButtons.filter((item) => {
					if (item.permission && item.client_type.indexOf('APP') !== -1) {
						if (item.button_type !== 'undo' && item.button_type !== 'duplicate' && item
							.button_type !== 'select' && item.button_type !==
							'batchupdate' && item.button_type !== 'import') {
							if (item.disp_exps) {

								item = self.buttonIsExps(self.childMainData, item)
							}
							if (!item.hasOwnProperty('visible')) {
								return item
							} else if (item.hasOwnProperty('visible') && item.visible === '是') {
								return item
							}
						}

					}

				})
				if (Array.isArray(handerButtons)) {
					return handerButtons
				} else {
					return []
				}
			}

		},
		watch: {
			pageInfo: {
				deep: true,
				handler(newValue) {
					console.log('Page:', newValue.total <= newValue.rownumber * newValue.pageNo);
					if (newValue.total <= newValue.rownumber * newValue.pageNo) {
						this.noData = true;
						this.$emit('loadEnd', newValue);
					} else {
						this.noData = false;
					}
				}
			},
			listConfig: {
				deep: true,
				immediate: true,
				handler(newValue) {
					if (newValue && newValue.hasOwnProperty('srv_cols')) {
						this.srv_cols = newValue.srv_cols;
						let rowButton = newValue.rowButton;
						rowButton = rowButton.filter((item) => {
							let client_type = item.client_type
							if (item.more_config && typeof item.more_config === 'string') {
								try {
									item.moreConfig = JSON.parse(item.more_config)
								} catch (e) {
									//TODO handle the exception
								}
							}
							if (client_type && client_type.indexOf('APP') !== -1) {
								return item
							}
						})
						if (rowButton) {
							if (this.pageType !== 'proc') {
								//普通列表显示行按钮
								//流程列表点击跳转到流程详情
								// rowButton = rowButton.filter(
								// 	item => item.button_type === 'edit' || item.button_type === 'delete' || item
								// 	.button_type === 'procdetail' ||
								// 	item.button_type === 'deleteproc'
								// );
							}
							this.rowButton = rowButton;
						}

					}
				}
			},
			searchColumn: {
				immediate: true,
				handler(newValue) {
					if (newValue) {
						this.searchCol = newValue;
					} else if (this.viewTemp && this.viewTemp.title) {
						this.searchCol = this.viewTemp.title;
					}
				}
			}
		},
		props: {
			// 子表时 外键字段
			referencedColName: {
				type: String,
				default: ''
			},
			// 是否允许下拉刷新
			enablePullDown: {
				type: Boolean,
				default: true
			},
			// 是否允许上拉加载
			enablePullUp: {
				type: Boolean,
				default: true
			},
			//是否是详情列表
			detailList: {
				type: Boolean,
				default: false
			},
			// height
			heightStyle: {
				type: String,
				default: ''
			},
			// 是否根据数据条数决定高度
			useDataHeight: {
				type: Boolean,
				default: false
			},
			// class
			customClass: {
				type: String,
				default: ''
			},
			// 距顶部(rpx)
			top: {
				type: [Number, Array, String],
				default () {
					return 0;
				}
			},
			// 距底部(rpx)
			bottom: {
				type: [Number, Array, String],
				default () {
					return 0;
				}
			},
			// 是否通过fixed固定高度, 默认true
			fixed: {
				type: Boolean,
				default: true
			},
			listConfig: {
				type: Object,
				default: () => {}
			},
			viewType: {
				type: String,
				default: 'normal'
			},
			viewTemp: {
				type: Object,
				default: () => {}
			},
			imageNum: {
				type: Number,
				default: 1
			},
			gridRowNum: {
				type: Number,
				default: 2
			},
			rowKey: {
				type: String,
				default: 'id'
			},
			serviceName: {
				type: String,
				default: ''
			},
			srvApp: {
				type: String,
				default: ''
			},
			condition: {
				type: Array,
				default: () => {
					[];
				}
			},
			rownumber: {
				type: Number,
				default: 10
			},
			order: {
				type: Array,
				default: () => {
					[];
				}
			},
			searchWords: {
				//搜索关键词
				type: String,
				default: ''
			},
			searchColumn: {
				//搜索字段
				type: String,
				default: ''
			},
			rowButtons: {
				type: Array,
				default: () => {
					[];
				}
			},
			// showButton: {
			// 	type: Array,
			// 	default: () => {
			// 		[];
			// 	}
			// },
			handerButtons: {
				type: Array,
				default: () => {
					[];
				}
			},
			listType: {
				type: String, //list||proc
				default: 'list'
			},
			pageType: {
				type: String, //list||proc
				default: 'list'
			},
			showFootBtn: {
				type: Boolean, //是否显示底部按钮
				default: true
			},
			v2Datas: {
				type: Object,
				default: () => {}
			},
			submintType: {
				type: String, //men||db
				default: 'db'
			},
			procInstanceNo: {
				type: String
			},
			childMainData: {
				type: Object,
				default: () => {
					return null
				}
			},
			showPagination: {
				type: Boolean,
				default: true
			},
			appno: {
				type: String
			},
			showBtn: {
				type: Array,
			},
      gridButtonDisp: {
        type: Object
      },
      rowButtonDisp: {
        type: Object
      },
      formButtonDisp: {
        type: Object
      },
		},
		methods: {
			submintForm() {
				let self = this
				let formData = this.$refs.menAddForm.getFieldModel()
				if (self.submintType == 'men') {
					if (self.formMethodType == 'menadd') {
						self.menDataDealwith(formData, 'add')
					} else if (self.formMethodType == 'menupdate') {
						self.menDataDealwith(formData, 'update')
					}
				}
				self.$emit('list-change', [...self.menListData, ...self.listData]);
				console.log('formData', formData)
			},
			buttonIsExps(val, button, type) {
				let mainData = val
				let row = val
				let data = val
				let isShow = true
				if (button.button_type == 'customize') {

				} else if (button.disp_exps) {
					isShow = this.evalBtnDispExps(button.disp_exps, mainData)
					// let testFun = new Function('e', `let mainData = e ; return (${button.disp_exps})`)
					// isShow = testFun(mainData)
				}
				button.visible = isShow ? '是' : '否'
				return button

			},
			menDataDealwith(data, type) {
				let self = this
				let onType = type
				let newData = data

				if (type === 'add') {
					data['_operating_status'] = type
					data['_uuid'] = this.GenNonDuplicateID('men_')
					data['_service'] = self.add_service
					self.menListData.push(data)
					self.$refs.menAdd.close()
				} else if (type === 'update') {
					let id = self.onUpdateDataKey
					let uuid = self.onUpdateDataKey
					if (id) {
						self.listData = self.listData.filter((item) => {
							if (item.id === id) {
								item['_operating_status'] = 'update'
								item['_service'] = self.update_service
								let keys = Object.keys(data)
								for (let key of keys) {

									item[key] = data[key]
								}
								return item
							} else {

								return item
							}
						})
					}
					if (uuid) {
						self.menListData = self.menListData.filter((item) => {
							if (item._uuid == uuid) {
								item['_service'] = self.update_service
								let keys = Object.keys(data)
								for (let key of keys) {

									item[key] = data[key]
								}
								return item
							} else {
								return item
							}
						})
					}

					self.$refs.menAdd.close()
				}
				console.log('menDataDealwith', data, type)
			},
			tabSelect(e, item, index) {
				console.log(e);
				this.TabCur = e.currentTarget.dataset.id;
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
				this.proc_data_type = item.proc_data_type;
				this.tabList[this.TabCur]['data'] = [];
				this.pageInfo = {
					total: 0,
					rownumber: 20,
					pageNo: 1
				};
				// this.tabList[this.TabCur]['page'] = { total: 0, rownumber: 5, pageNo: 1 };
				this.listData = [];
				this.onRefresh();
			},
			toSearch() {
				let keywords = this.searchWords;
				this.pageInfo.pageNo = 1;
				this.onRefresh();
			},
			trigger(e) {
				console.log('trigger', e);
				this.$emit('trigger', e);
			},
			fabClick(e) {
				console.log('fabClick', e);
				this.$emit('fab-click', e);
			},
			clickItem(data) {
				this.$emit('click-list-item', data);
			},
			async clickFootBtn(data) {
				let self = this
				let {
					row,
					button
				} = data
				row = this.deepClone(row)
				button = this.deepClone(button)
				self.onUpdateDataKey = row.id || row._uuid
				let cols = null
				if (self.submintType == 'men') {
					console.log('clickFootBtn', data);
					if (button.button_type === 'delete') {
						console.log(button.button_type, row)
						let id = row.id
						let uuid = row._uuid
						if (id) {
							self.listData.forEach((item) => {
								if (item.id === id) {
									item['_operating_status'] = 'delete'
									item['_service'] = button.service_name
								}
							})
						} else if (uuid) {
							self.menListData = self.menListData.filter((item) => {
								if (item._uuid !== uuid) {
									return item
								}
							})
						}
					} else if (button.button_type === 'edit') {
						// self.add_service = data.service_name
						self.popupTitle = button.service_view_name

						self.update_service = button.service_name
						cols = await this.getServiceV2(button.service_name, 'update', 'update', button.application);
						console.log('handerBtnClick' + button.service_name + ':', cols)
						self.formMethodType = 'menupdate',
							self.menPageType = 'update',
							self.updateV2Data = cols
						self.fields = self.setFieldsDefaultVal(cols._fieldInfo, row)

						self.$refs.menAdd.open();
					} else {
						self.$emit('clickFootBtn', data);
					}
				} else {
					self.$emit('clickFootBtn', data);
				}

			},
			async handerBtnClick(data) {
				let self = this
				this.$emit('handerBtnClick', data);
				let cols = null
				if (data.button_type == 'add') {
					self.add_service = data.service_name
					self.popupTitle = data.service_view_name
					cols = await this.getServiceV2(data.service_name, 'add', 'add', data.application);
					console.log('handerBtnClick' + data.service_name + ':', cols)
					self.formMethodType = 'menadd',
						self.menPageType = 'add',
						self.addV2Data = cols
					self.fields = cols._fieldInfo

					self.$refs.menAdd.open();
				} else if (data.button_type == 'refresh') {
					this.onRefresh()
				} else {
					console.log('移动端不支持的操作按钮')
					uni.showToast({
						title: '不支持的操作',
						duration: 800
					})
				}

				console.log()
			},
			getMenDataModels(type) {
				let self = this
				if (type == 'menModel') {
					let listData = self.listData.filter((item) => {
						if (item.hasOwnProperty('_service') && item.hasOwnProperty('_operating_status')) {
							return item
						}
					})
					let menListData = self.menListData.filter((item) => {
						if (item.hasOwnProperty('_service') && item.hasOwnProperty('_operating_status')) {
							return item
						}
					})
					let req = []
					for (let i = 0; i < listData.length; i++) {
						if (listData[i]._operating_status === 'delete' && listData[i].hasOwnProperty('id')) {
							// 子表删除
							let deleteObj = {
								"serviceName": listData[i]._service,
								"colNames": ["*"],
								"condition": [{
									"colName": "id",
									"ruleType": "eq",
									"value": listData[i]['id']
								}],
								"data": []
							}
							req.push(deleteObj)
						} else if (listData[i]._operating_status === 'update' && listData[i].hasOwnProperty('id')) {
							// 子表编辑
							let updateData = self.deepClone(listData[i])
							delete updateData._service
							delete updateData._operating_status
							for (let key in updateData) {
								if (updateData[`_${key}_disp`]) {
									delete updateData[`_${key}_disp`]
								}
							}
							let updateObj = {
								"serviceName": listData[i]._service,
								"colNames": ["*"],
								"condition": [{
									"colName": "id",
									"ruleType": "eq",
									"value": listData[i]['id']
								}],
								"data": [updateData]
							}
							req.push(updateObj)
						}
					}
					if (menListData.length > 0) {
						let addObj = {
							"serviceName": self.add_service,
							"data": []
						}
						for (let i = 0; i < menListData.length; i++) {
							// 子表增加
							let addData = self.deepClone(menListData[i])
							delete addData._service
							delete addData._operating_status
							delete addData._uuid
							addObj['data'].push(addData)
						}
						req.push(addObj)
					}
					return req
				} else if (type == 'dbData') {
					return self.listData
				}
			},
			async getListData(cond, proc_data_type, i) {
				let self = this
				let serviceName = self.serviceName;
				let app = this.srvApp || this.appno || uni.getStorageSync('activeApp');
				let url = self.getServiceUrl(app, serviceName, 'select');
				let req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: self.condition,
					page: {
						rownumber: self.pageInfo.rownumber,
						pageNo: self.pageInfo.pageNo
					},
					order: self.order,
					query_source: "list_page",
					draft: false
				};
				if (this.noPage) {
					delete req.page
				}
				if (this.listConfig?.vpage_no) {
					req['vpage_no'] = this.listConfig.vpage_no
				}
				if (self.listType === 'proc') {
					if (proc_data_type || self.proc_data_type) {
						req['proc_data_type'] = proc_data_type || self.proc_data_type;
					} else {
						req['proc_data_type'] = 'wait';
					}
				}
				if (cond && cond.length > 0) {
					req.condition = req.condition.concat(cond);
				}

				if (req.condition === undefined) {
					if (this.v2Datas && ['procdetaillist', 'prochandlelist', 'procreadlist'].indexOf(this.v2Datas
							.use_type) !== -1 &&
						this.procInstanceNo) {
						req.condition = [{
							colName: "parent_proc_instance_no",
							ruleType: "eq",
							value: self.procInstanceNo
						}]
					}
				}

				let keywords = self.searchWords;
				if (keywords) {
					if (Array.isArray(req.condition) && req.condition.length > 0) {
						req.relation_condition = {
							"relation": "AND",
							"data": [{
									"relation": "AND",
									"data": req.condition || []
								},
								{
									"relation": "OR",
									"data": self.srv_cols.reduce((res, cur) => {
										if (!Array.isArray(res)) {
											res = []
										}
										// if (cur.col_type === 'String' && cur.bx_col_type ===
										// 	'string') {
										const ignoreCol = ['modify_time', "modify_user_disp",
											"modify_user", "create_user_disp", "create_user",
											"create_time", "more_config", 'id'
										]
										const ignoreType = ['Image']
										if (!ignoreType.includes(cur.col_type) && !ignoreCol.includes(
												cur.column)) {
											let obj = {
												colName: cur.columns,
												ruleType: 'like',
												value: keywords
											}
											res.push(obj)
										}
										return res
									}, [])
								}
							]
						}
					} else {
						req.relation_condition = {
							"relation": "AND",
							"data": [{
								"relation": "OR",
								"data": self.srv_cols.reduce((res, cur) => {
									if (!Array.isArray(res)) {
										res = []
									}
									if (cur.col_type === 'String' && cur.bx_col_type ===
										'string') {
										let obj = {
											colName: cur.columns,
											ruleType: 'like',
											value: keywords
										}
										res.push(obj)
									}
									return res
								}, [])
							}]
						}
					}
					delete req.condition
				}

				let res = await self.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					// btnPermissionArr
					if (self.pageInfo.pageNo === 1) {
						self.listData = [];
					}
					self.listData = this.listData.concat(res.data.data);
					self.pageInfo.total = res.data.page.total;
					self.pageInfo.pageNo = res.data.page.pageNo;
					self.$emit('list-change', self.listData);
					if (this.listType === 'proc') {
						for (let i = 0; i < self.tabList.length; i++) {
							let item = self.tabList[i];
							if (item.proc_data_type === req.proc_data_type) {
								item.data = self.listData;
								item.total = res.data.page.total;
								item.page = res.data.page;
								self.$set(self.tabList, i, item);
							}
						}
						this.listData = [];
						this.listData = this.tabList[this.TabCur]['data'];
						let callBackData = {
							data: this.listData,
							page: res.data.page,
							proc_data_type: req.proc_data_type
						};
						let page = this.pageInfo;
						return callBackData;
					} else if (this.listType === 'list' || this.listType === 'detaillist' || this.listType ===
						'procdetaillist') {
						let page = this.pageInfo;
						if (page.rownumber * page.pageNo >= page.total) {
							// finish(boolean:是否显示finishText,默认显示)
							// this.$refs.pullScroll.finish();
						} else {
							// this.$refs.pullScroll.success();
						}
					}
					return this.listData;
				}
			},
			onRefresh() {
				this.pageInfo.pageNo = 1;
				this.getListData().then(_ => {
					this.$refs.loadRefresh ? this.$refs.loadRefresh.completed() : ''
				})
				// this.$nextTick(() => {
				// 	this.$refs.pullScroll.refresh();
				// });
			},
			pullDown(pullScroll) {
				let page = this.pageInfo;
				this.pageInfo.pageNo = 1;
				setTimeout(() => {
					this.getListData().then(callBackData => {
						this.$refs.loadRefresh ? this.$refs.loadRefresh.completed() : ''
						if (this.listType === 'proc') {
							if (callBackData.page.rownumber * callBackData.page.pageNo >= callBackData.page
								.total) {
								// finish(boolean:是否显示finishText,默认显示)
								// this.$refs.pullScroll.finish();
							} else {
								// this.$refs.pullScroll.success();
							}
						}
					});
					// this.loadData(pullScroll);
				}, 200);
			},
			loadData(pullScroll) {
				// let pageNo = pullScroll && pullScroll.page ? pullScroll : this.pageInfo.pageNo++
				let page = this.pageInfo;
				if (page.pageNo * page.rownumber >= page.total) {
					return
				}
				this.pageInfo.pageNo++;
				if (this.listType === 'proc') {
					this.tabList[this.TabCur].page.pageNo = this.pageInfo.pageNo;
				}
				this.getListData().then(res => {
					this.$refs.loadRefresh ? this.$refs.loadRefresh.completed() : ''
					if (this.listType === 'proc') {
						if (res.page.rownumber * res.page.pageNo >= res.page.total) {
							// finish(boolean:是否显示finishText,默认显示)
							// this.$refs.pullScroll.finish();
						} else {
							// this.$refs.pullScroll.success();
						}
					}
				});
			},
			async getListV2() {
				let app = this.srvApp || this.appno || uni.getStorageSync('activeApp');
				// let app = uni.getStorageSync('activeApp');
				let self = this;
				let colVs = self.v2Datas
				console.log("getListV2", colVs)
				if (!self.v2Datas) {
					colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ? 'proclist' :
						'list', app);

				}
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				console.log('colVs', colVs);
				// this.listConfig = colVs;
				if (this.pageType === 'proc') {
					this.showFootBtn = false;
				}
				if (colVs.gridButton && colVs.gridButton.length > 0) {
					this.publicButton = colVs.gridButton.filter(item => {
						if (item.permission === true) {
							switch (item.button_type) {
								case 'add':
								case 'apply':
									this.showAdd = true;
									return item;
									break;
								case 'select':
									this.showSearchBar = true;
									// #ifdef MP-WEIXIN
									this.listTop = 100;
									// #endif
									return item;
									break;
							}
						}
					});
				} else {
					this.publicButton = []
				}

				return colVs;
			}
		},
		onReachBottom() {
			console.log('监听');
		},
		mounted() {
			if (this.serviceName && this.listType === 'list') {
				this.onRefresh();
				// if (!this.listConfig?.srv_cols || !this.v2Datas?.srv_cols) {
				// 	debugger
				// 	this.getListV2()
				// }
			} else if (this.serviceName && this.listType === 'proc') {
				return
				this.tabList.forEach(item => {
					this.getListData([], item.proc_data_type).then(data => {
						if (data && data.proc_data_type === 'wait') {
							let pageInfo = data.page;
							if (pageInfo.rownumber * pageInfo.pageNo >= pageInfo.total) {
								// finish(boolean:是否显示finishText,默认显示)
								// this.$refs.pullScroll.finish();
								// this.$refs.pullScroll.success();
							} else {
								// this.$refs.pullScroll.success();
							}
						} else {
							// this.$refs.pullScroll.finish();
						}
					});
					// this.onRefresh();
				});
			} else {
				this.onRefresh();
			}
		}
	};
</script>

<style lang="scss" scoped>
	.form-view {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-height: calc(100vh - 200upx);
		padding: 30upx 0 100upx;
		overflow: scroll;

		.button-box {
			height: 100upx;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 20upx 0 40upx;
		}

		.cu-btn {
			max-width: 60%;
			min-height: 60upx;
			margin-top: 50upx;
		}
	}

	.list-wrap {
		width: 100%;
		max-width: 1000upx;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
    background-color: #F8F8FA;
		&.mt-100 {
			// margin-top: 100rpx;
		}

		.grid-layout {
			padding: 20rpx 10rpx;
			display: grid;
			grid-template-columns: repeat(3, calc(33.33% - 7rpx));
			grid-row-gap: 10rpx;
			grid-column-gap: 10rpx;
		}
	}

	.list-header {
		padding: 10upx 20upx;
	}

	.pagination {
		position: fixed;
		bottom: 120rpx;
		right: 40upx;
		width: 80upx;
		height: 80upx;
		border-radius: 50%;
		border: 1px solid rgba($color: #999, $alpha: 0.5);
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		z-index: 100;

		&::after {
			content: '';
			position: absolute;
			background-color: rgba($color: #999, $alpha: 0.5);
			width: 80%;
			height: 2upx;
			top: 50%;
		}

		.page-no {
			font-size: 28upx;
		}

		.total {
			font-size: 20upx;
			color: #666;
			transform: scale(0.8, 0.8);
		}
	}

	.nav .cu-item {
		padding: 0;
	}

	.animation-slide-top {
		animation-name: slide-top;
	}

	@keyframes slide-top {
		0% {
			opacity: 0;
			height: 0;
			transform: translateY(-100%);
		}

		100% {
			opacity: 1;
			height: auto;
			transform: translateY(0);
		}
	}
</style>
