<template>
	<view class="form-wrap" :class="['theme-'+theme]">
		<view class="main-form-edit">
			<a-form v-if="colsV2Data && isArray(fields)" :fields="fields" :srvApp="appName" :pageType="srvType"
				:moreConfig="moreConfig" :formType="use_type" ref="bxForm" @value-blur="valueChange">
			</a-form>
		</view>

		<view class="child-service-box">
			<view class="child-service" v-for="(item,index) in childService" :key="index">
				<unfold-batch-add :config="item" :appName="appName" :main-data="mainData" ref="childList"
					@onButton="onChildButton"></unfold-batch-add>
			</view>
		</view>

		<view class="button-box" v-if="colsV2Data">
			<button class="cu-btn bg-blue bx-bg-color lg" type="primary" v-if="isArray(fields) && fields.length > 0"
				v-for="(btn, btnIndex) in formButtons" :key="btnIndex" @click="onButton(btn)">
				{{ btn.button_name }}
			</button>
		</view>
	</view>
</template>

<script>
	import unfoldBatchAdd from '@/publicPages/components/child-list/unfold-batch-add.vue'
	export default {
		components: {
			unfoldBatchAdd
		},
		data() {
			return {
				appName: null,
				service: "",
				serviceName: null,
				srvType: 'add', // 表单信息 add | update  | select |list | detail
				use_type: 'add', // detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update
				condition: [],
				addV2: null,
				updateV2: null,
				detailV2: null,
				fields: null,
				mainData: null,
				hideColumn: [], //不显示的字段
				fieldsCond: [],
				modalName: null, //operateModal
				orderCols: [],
				currentFormV2: null, //子表v2
				currentFormFields: [], //子表字段
				currentFormFk: null,
				isOnButton: false
			}
		},
		computed: {
			theme() {
				return this.$store?.state?.app?.theme
			},
			formButtons() {
				let buttons = []
				if (Array.isArray(this.colsV2Data?._formButtons)) {
					buttons = this.colsV2Data?._formButtons
					if (Array.isArray(this.mainData?._buttons) && this.mainData?._buttons.length === buttons.length) {
						buttons = buttons.filter((item, index) => this.mainData?._buttons[index] === 1)
					}
					return buttons
				}
			},
			appTempColMap() {
				// 字段关系映射
				if (this.moreConfig?.appTempColMa) {
					return this.moreConfig?.appTempColMap
				}
				if (Array.isArray())
					return {}
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
			moreConfig() {
				return this.colsV2Data?.moreConfig
			},
			colsV2Data() {
				if (this.srvType) {
					return this[`${this.srvType}V2`]
				}
				return {}
			},
			childService: {
				get() {
					let result = []
					if (['update', 'add'].includes(this.srvType)) {
						result = this.operateChildService
					} else {
						result = this.detailChildService
					}
					if (Array.isArray(result)) {
						return result.map(item => {
							if (item?.foreign_key?.section_name) {
								item.label = item.foreign_key.section_name
							}
							if (item?.foreign_key?.more_config) {
								try {
									item.foreign_key.moreConfig = JSON.parse(item.foreign_key.more_config)
								} catch (e) {

								}
							}
							return item
						}).filter((item, index) => {
							if (Array.isArray(this.mainData?._child_tables) && result.length === this.mainData
								._child_tables.length) {
								if (this.mainData._child_tables[index] === 0) {
									return false
								}
							}
							return true
						})
					}
					if (Array.isArray(result) && result.length > 0) {
						return result[0]
					} else {
						return []
					}
				}
			},
			operateChildService() {
				return this.detailV2?.child_service.filter(item => {
					if (item.foreign_key?.foreign_key_type === '主子表') {
						// item.use_type = 'add'
						if (this.use_type === 'update') {
							item.use_type = 'updatechildlist'
						} else if (this.use_type === 'add') {
							item.use_type = 'addchildlist'
						}
						return true
					}
				})
			},
			detailChildService() {
				return this.detailV2?.child_service.filter(item => {
					// return item.foreign_key?.foreign_key_type === '字段引用'
					return item.foreign_key?.foreign_key_type !== '主子表'
				})
			},
		},
		methods: {
			onChildButton(e) {
				if (e?.btn?.button_type === 'add') {
					// 添加子表数据
					this.currentFormFk = e?.foreignKey
					if (e?.v2Data?.service_name) {
						this.currentFormV2 = e?.v2Data
						if (Array.isArray(e.v2Data?._fieldInfo)) {
							this.currentFormFields = e.v2Data._fieldInfo.map(item => {
								if (item.defaultValue) {
									item.value = item.defaultValue
								}
								if (item.in_add === 1) {
									item.display = true
								}
								if (item.columns === this.currentFormFk?.referenced_column_name) {
									item.display = false
								}
								return item
							})
						}
						this.modalName = 'addChildData'
					}
				}
			},
			async onButton(e) {
				if (!e) {
					return;
				}
				// if (!this.isOnButton) {
				// 	this.isOnButton = true;
				// } else {
				// 	uni.showToast({
				// 		title: '正在处理中，请勿重复操作',
				// 		icon: 'none'
				// 	});
				// 	return;
				// }
				let self = this
				let req = this.$refs.bxForm.getFieldModel();
				for (let key in req) {
					if (Array.isArray(req[key])) {
						req[key] = req[key].toString();
					}
				}

				switch (e.button_type) {
					case 'edit':
						if (e.page_type === '详情' && this.use_type === 'detail') {
							this.toPages('update', e);
							this.isOnButton = false;
						} else {
							if (req) {
								req = [{
									serviceName: e.service_name,
									data: [req],
									condition: this.condition
								}];
								if (self?.params?.defaultVal?.id) {
									req[0].condition = [{
										colName: 'id',
										ruleType: 'eq',
										value: self.params.defaultVal.id
									}];
								} else if (self?.mainData?.id) {
									req[0].condition = [{
										colName: 'id',
										ruleType: 'eq',
										value: self.mainData.id
									}];
								}
								let app = self.appName || uni.getStorageSync('activeApp');
								let url = self.getServiceUrl(app, e.service_name, 'add');
								if (!Array.isArray(req[0].condition) || req[0].condition.length === 0) {
									uni.showToast({
										title: '参数错误，请刷新重试',
										icon: 'none'
									});
									return;
								}
								let res = await this.onRequest('update', e.service_name, req, app);
								let service = e.service_name.slice(0, e.service_name.lastIndexOf('_'))
								if (res.data.state === 'SUCCESS') {
									uni.$emit('dataChange', e.service_name)


									if (
										Array.isArray(res.data.response) &&
										res.data.response.length > 0 &&
										res.data.response[0].response &&
										Array.isArray(res.data.response[0].response.effect_data) &&
										res.data.response[0].response.effect_data.length > 0
									) {
                    
									}
									uni.showModal({
										title: '提示',
										content: `${res.data.resultMessage}`,
										showCancel: false,
										success(res) {
											let beforeRedirectUrl = getApp().globalData.beforeRedirectUrl
											if (beforeRedirectUrl) {
												uni.redirectTo({
													url: beforeRedirectUrl
												})
												getApp().globalData.beforeRedirectUrl = null
												return
											}
											if (self.shareType && self.shareType === 'seeDoctor') {
												// 通过邀请就诊登记链接进入 跳转到就诊信息登记页面
												let fieldsCond = [{
													column: 'user_info_no',
													display: false
												}, {
													column: 'user_no',
													display: false
												}];
												if (self.doctorInfo && self.doctorInfo.no) {
													fieldsCond.push({
														column: 'doctor_no',
														display: false,
														value: self.doctorInfo.no
													}, {
														column: 'doctor_name',
														display: false,
														value: self.doctorInfo.name
													});
													if (self.doctorInfo.store_no) {
														fieldsCond.push({
															column: 'store_no',
															display: false,
															value: self.doctorInfo.store_no
														});
													}
												}
												let path =
													'/publicPages/formPage/formPage?share_type=seeDoctor&serviceName=srvhealth_see_doctor_record_add&type=add&fieldsCond=' +
													encodeURIComponent(JSON.stringify(fieldsCond));
												uni.redirectTo({
													url: path
												});
											} else if (self.afterSubmit === 'back') {
												if (self.submitAction) {
													uni.$emit(self.submitAction)
												}
												uni.navigateBack()
											} else {
												uni.navigateBack()
											}
										}
									});
								} else {
									uni.showToast({
										title: res.data.resultMessage,
										mask: false,
										icon: 'none'
									});
								}
								this.isOnButton = false;
							}
						}
						break;

					case 'submit':
						if (req) {
							let data = this.deepClone(req);
							let self = this
							data.child_data_list = []
							console.log(this.childService)
							if (Array.isArray(this.childService) && this.childService.length == 1) {
								data.child_data_list = self.$refs.childList[0].onSubmit()
							} else if (Array.isArray(this.childService) && this.childService.length > 0) {
								this.childService.forEach((item, index) => {
									data.child_data_list = this.$refs.childList[index].getChildDataList()
									// data.child_data_list.push(this.$refs.childList[index].getChildDataList())
								})
							}
							let reqData = [{
								serviceName: e.service_name,
								condition: [],
								data: [data]
							}];
							let app = this.appName || uni.getStorageSync('activeApp');
							let type = "add"
							if (e.button_type === 'edit') {
								type = 'update'
								reqData[0].condition = [{
									colName: 'id',
									ruleType: 'eq',
									value: this.mainData?.id
								}]
								if (!this.mainData?.id) {
									return false
								}
							}
							let url = this.getServiceUrl(app, e.service_name, 'operate');
							let service = e.service_name.slice(0, e.service_name.lastIndexOf('_'))
							let res = await this.$http.post(url, reqData);
							if (res.data.state === 'SUCCESS') {
								uni.$emit('dataChange', service)
								uni.showModal({
									title: '提示',
									content: res.data.resultMessage,
									showCancel: false,
									success: (res) => {
										if (res.confirm) {
											uni.navigateBack({

											})
										}
									}
								})
							} else {
								uni.showToast({
									title: res.data.resultMessage || res.data.resultCode,
									mask: false,
									icon: 'none'
								});
							}
						}
						break;
				}

			},
			async valueChange(e, triggerField) {
				const column = triggerField.column
				const fieldModel = e
				const cols = this.colsV2Data._fieldInfo.filter(item => item.x_if).map(item => item.column)
				const table_name = this.colsV2Data.main_table

				let result = null
				if (Array.isArray(cols) && cols.length > 0) {
					result = await this.evalX_IF(table_name, cols, fieldModel, this.appName)
				}
				for (let i = 0; i < this.fields.length; i++) {
					const item = this.fields[i]
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
					this.$set(this.fields, i, item)
				}
			},
			getServiceName(srv) {
				let len = srv.lastIndexOf('_');
				let serviceName = srv.slice(0, len) + '_';
				if (this.srvType === 'list' || this.srvType === 'detail') {
					serviceName += 'select';
				} else {
					serviceName += this.srvType;
				}
				return serviceName;
			},
			toPages(type, e) {
				this.srvType = type;
				if (this?.params?.to && this?.params?.idCol && this?.params?.submitData && this?.params?.submitData[this
						.params
						?.idCol]) {
					uni.redirectTo({
						url: `${this.params.to}?${this.params.idCol}=${this.params.submitData[ this.params.idCol ]}`
					});
				} else {
					let serviceName = e?.service_name || this.getServiceName(this.serviceName)
					let url =
						`/publicPages/formPage/formPage?type=${type}&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(this.fieldsCond))}`
					if (type === 'update' || type == 'detail') {
						if (this.params?.submitData?.id) {
							let fieldsCond = [{
								column: 'id',
								value: this.params.submitData.id,
								display: false
							}]
							url =
								`/publicPages/formPage/formPage?type=${type}&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`

						}
					}

					if (Array.isArray(this.hideColumn) && this.hideColumn.length > 0) {
						url += `&hideColumn=${JSON.stringify(this.hideColumn)}`
					}

					if (this.appName) {
						url += `&appName=${this.appName}`
					}
					uni.redirectTo({
						url: url
					});
				}
			},
			async getDefaultVal() {
				if (this.srvType === 'detail' || this.srvType === 'update') {
					let serviceName = this.service || this.serviceName.replace('_update', '_select').replace(
						'_add',
						'_select');
					let condition = this.fieldsCond
						.filter(item => item.value)
						.map(item => {
							return {
								colName: item.column,
								ruleType: item.column === 'id' ? "eq" : 'like',
								value: item.value
							};
						});
					if (condition.find(item => item.colName === 'id')) {
						condition = condition.filter(item => item.colName === 'id')
					}

					let app = this.appName || uni.getStorageSync('activeApp');
					let url = this.getServiceUrl(app, serviceName, 'select');
					let req = {
						serviceName: serviceName,
						colNames: ['*'],
						condition: condition,
						page: {
							pageNo: 1,
							rownumber: 1
						}
					};
					if (this.colsV2Data?.vpage_no) {
						req['vpage_no'] = this.colsV2Data.vpage_no
					}
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.data) && res.data.data.length > 0) {
							this.mainData = res.data.data[0];
							return res.data.data[0];
						}
					}
				}
			},
			async getDetailV2() {
				const app = this.appName || uni.getStorageSync('activeApp');
				let colVs = await this.getServiceV2(this.serviceName, 'detail', 'detail', app);

				this.detailV2 = colVs
			},
			async getFieldsV2() {
				const app = this.appName || uni.getStorageSync('activeApp');
				let colVs = await this.getServiceV2(this.serviceName, this.srvType, this.use_type,
					app);
				this[`${this.srvType}V2`] = colVs
				if (['update', 'add'].includes(this.srvType)) {
					this.getDetailV2()
				}

				if (Array.isArray(colVs.srv_cols)) {
					this.orderCols = colVs.srv_cols.filter(item => {
						if (item.in_detail === 1) {
							item.orderType = 'asc'
							item.selected = false;
							return true
						}
					})
				}

				colVs = this.deepClone(colVs);
				if (colVs && colVs.service_view_name) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				} else {
					if (!colVs) {
						return
					}
				}
				let defaultVal = null
				let fields = null
				switch (colVs.use_type) {
					case 'update':
					case 'detail':
						if (this.mainData?.id) {
							defaultVal = this.mainData
						} else {
							defaultVal = await this.getDefaultVal()
						}
						fields = this.setFieldsDefaultVal(colVs._fieldInfo, defaultVal);
						if (!fields) {
							return;
						}
						fields = fields.map(field => {
							if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
								field.option_list_v2 = field.option_list_v2.map(item => {
									item.checked = false;
									return item;
								});
							}
							if (Array.isArray(field.option_list_v2?.conditions)) {
								field.option_list_v2.conditions = this.evalConditions(field.option_list_v2
									.conditions,
									defaultVal)
							}

							if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
								this.fieldsCond.forEach(item => {
									if (item.column === field.column) {
										if (item.hasOwnProperty('display')) {
											field.display = item.display;
										}
										if (item.hasOwnProperty('value')) {
											field.value = item.value;
										}
										if (field.option_list_v2 && Array.isArray(field
												.option_list_v2
												.conditions) && Array.isArray(item
												.condition)) {
											field.option_list_v2.conditions = field
												.option_list_v2
												.conditions.concat(item.condition);
										} else if (field.option_list_v2 && !field
											.option_list_v2
											.conditions && Array.isArray(item
												.condition)) {
											field.option_list_v2.conditions = item
												.condition;
										}
									}
								});
							}
							return field;
						}).filter(item => !this.hideColumn.includes(item.column))
						break;
					case 'add':
						fields = colVs._fieldInfo.map(field => {
							if (field.type === 'Set' && Array.isArray(field.option_list_v2)) {
								field.option_list_v2 = field.option_list_v2.map(item => {
									item.checked = false;
									return item;
								});
							}
							if (Array.isArray(field?.option_list_v2?.mconditions) && field.option_list_v2
								.mconditions.length > 0) {
								let mconditions = field.option_list_v2.mconditions.map(
									field => {
										field.value = this.renderStr(field.value, this.mainData)
										return field
									})
								if (Array.isArray(field?.option_list_v2?.conditions) && field.option_list_v2
									.conditions
									.length > 0) {
									field.option_list_v2.conditions = [...field.option_list_v2
										.conditions, ...mconditions
									]
								} else {
									field.option_list_v2.conditions = mconditions
								}
							}
							// if (Array.isArray(field?.option_list_v2?.conditions) && field.option_list_v2
							//   .conditions
							//   .length > 0) {
							//   field.option_list_v2.conditions = this.evalConditions(field.option_list_v2
							//     .conditions, this.mainData)
							// }

							if (this.defaultCondition && Array.isArray(this
									.defaultCondition) && colVs
								._fieldInfo && Array.isArray(colVs._fieldInfo)) {
								this.defaultCondition.forEach(cond => {
									colVs._fieldInfo.forEach(field => {
										if (cond.colName === field.column) {
											field['value'] = cond['value'];
										}
									});
								});
							}
							if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
								this.fieldsCond.forEach(item => {
									if (item.colName && !item.column) {
										item.column = item.colName
									}
									if (!this.mainData) {
										this.mainData = {}
									}

									this.mainData[item.column] = item.value
									if (item.column === field.column) {
										if (item.hasOwnProperty('display')) {
											field.display = item.display;
										}
										if (item.hasOwnProperty('disabled')) {
											field.disabled = item.disabled;
										}
										if (item.hasOwnProperty('value')) {
											field.value = item.value;
											field.defaultValue = item.value;
										}
										if (field.option_list_v2 && Array.isArray(field
												.option_list_v2
												.conditions) && Array.isArray(item
												.condition)) {
											field.option_list_v2.conditions = field
												.option_list_v2
												.conditions.concat(item.condition);
										} else if (field.option_list_v2 && !field
											.option_list_v2
											.conditions && Array.isArray(item
												.condition)) {
											field.option_list_v2.conditions = item
												.condition;
										}
									}
								});
							}
							return field;
						}).filter(item => !this.hideColumn.includes(item.column))
						defaultVal = colVs._fieldInfo.reduce((res, cur) => {
							if (cur.defaultValue) {
								res[cur.column] = cur.value || cur.defaultValue
								cur.value = cur.value || cur.defaultValue
							}
							return res
						}, {})
						break;
				}


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
				this.fields = fields
			},
			hideModal() {
				this.modalName = null
			},
		},
		async onLoad(option) {
			await this.toAddPage()
			if (option.destApp) {
				this.appName = option.destApp
			}
			if (option.main_data) {
				try {
					this.mainData = JSON.parse(option.main_data)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.appName) {
				this.appName = option.appName
			}
			if (option.type) {
				if (option.type.indexOf(',') !== -1) {
					option.type = option.type.split(',')[0];
				}
				if (option.type === 'form') {
					option.type = 'add';
				}
				this.srvType = option.type;
				this.use_type = option.type;
			}

			if (option.fieldsCond) {
				try {
					let fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond));
					this.fieldsCond = fieldsCond
				} catch (e) {
					//TODO handle the exception
				}
			}

			if (option.serviceName) {
				this.serviceName = option.serviceName;
				this.getFieldsV2();
			}

		}
	}
</script>

<style lang="scss" scoped>
	@import '../common/top-card';

	.form-wrap {
		min-height: 100vh;
		background-color: #F1F1F1;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.main-form-edit {
		// background-color: #fff;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}

	.child-form-wrap {
		max-height: 60vh;
		overflow-y: scroll;
	}

	.button-box {
		flex: 1;
		
		.cu-btn {
			min-width: 60%;
		}
	}
</style>
