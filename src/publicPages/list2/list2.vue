<template>
	<view class="page-wrap" :class="{'pc-model':sysModel==='PC'}">
		<view class="">
			<count-bar :list="countData" :config="countConfig" v-if="countData"></count-bar>

			<list-bar @change="changeSerchVal" :listType="listType" :filterCols="filterCols" :srvApp="appName"
				:gridButtonDisp="gridButtonDisp" :rowButtonDisp="rowButtonDisp" :formButtonDisp="formButtonDisp"
				:srvCols="srvCols" :placholder="placeholder" :listButton="listButton" @toOrder="toOrder"
				@toFilter="toFilter" @handelCustomButton="handlerCustomizeButton" @onGridButton="clickGridButton"
				@clickAddButton="clickAddButton" @search="toSearch"
				v-if="srvCols&&srvCols.length>0&&list_config.list_bar!==false" :readonly="listBarReadonly">
			</list-bar>
			<filter-tags :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
				@on-input-value="onFilterChange" @on-change="getListWithFilter"
				v-if="colV2&&colV2.srv_cols&&tags&&sysModel==='PC'">
			</filter-tags>
		</view>

		<view class="list-content" :class="['theme-'+theme]" :style="{
        backgroundColor:list_config.bg
      }">
			<filter-tags :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
				@on-input-value="onFilterChange" @on-change="getListWithFilter"
				v-if="colV2&&colV2.srv_cols&&tags&&sysModel!=='PC'">
			</filter-tags>
			<view class="list-view">
				<list-next class="list-next" ref="listRef" :gridButtonDisp="gridButtonDisp"
					:rowButtonDisp="rowButtonDisp" :formButtonDisp="formButtonDisp" :cartData="cartData"
					:listConfig="listConfig" :list="list" :listType="listType" :colV2="colV2" :appName="appName"
					@click-foot-btn="clickFootBtn" @add2Cart="add2Cart" @del2Cart="del2Cart"
					@checkboxChange="checkboxChange" />
			</view>

		</view>
		<cart-list :cartData="cartData" :fixed="true" bottom="50rpx" :list_config="list_config" :wxMchId="wxMchId"
			@changeAmount="changeAmount" @clear="clearCart" v-if="listType==='cart'"></cart-list>
		<cart-bottom :sum-price="sumPrice" ref="cartBottom" @selectAll="selectAllChange" @del="del" :mode="cartMode"
			@toOrderPage="toOrderPage" v-if="listType==='cartList'">
		</cart-bottom>
		<view class="bottom-button" v-if="selectoDataId">
			<button class="cu-btn bg-blue round shadow-blur" @click="confirmSelect">确认</button>
		</view>
	</view>
</template>

<script>
	import listNext from '@/components/list-next/list-next.vue';
	import listBar from '../components/list-bar/list-bar.vue'
	import cartList from '../components/goods-cart/goods-cart.vue'
	import countBar from '../components/count-bar/count-bar.vue'
	import cartBottom from '../components/cart-bottom/cart-bottom.vue'
	export default {
		components: {
			listNext,
			listBar,
			cartList,
			countBar,
			cartBottom
		},
		computed: {
			sysModel() {
				return getApp().globalData.systemInfo?.model
			},
			theme() {
				return this.$store?.state?.app?.theme
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
			listBarReadonly() {
				return this.listConfig?.listBarReadonly || this.disabled
			},
			publicButton() {
				if (Array.isArray(this.colV2?.gridButton) && this.colV2?.gridButton.length > 0) {
					return this.colV2.gridButton
				}
				return []
			},
			placeholder() {
				return ''
			},
			moreConfig() {
				return this.colV2?.moreConfig || {}
			},

			list_config() {
				let config = this.colV2?.moreConfig?.list_config
				let obj = {
					'bg': this.listConfig?.bg || config?.bg || '',
					"lp_style": this.listConfig?.lp_style || config?.lp_style || "复合",
					"grid_span": this.listConfig?.grid_span || config?.grid_span || "2",
					"detailPage": this.listConfig?.detailPage || config?.detailPage,
					'margin': this.listConfig?.margin || config?.margin,
					'padding': this.listConfig?.padding || config?.padding,
					"list_bar": this.listConfig?.list_bar ?? config?.list_bar,
					"btn_cfg": {
						"show_custom_btn": this.listConfig?.show_custom_btn ?? config?.btn_cfg?.show_custom_btn ??
							null,
						"show_public_btn": this.listConfig?.show_public_btn ?? config?.btn_cfg?.show_public_btn ??
							null,
						"show": config?.btn_cfg?.show || true,
						"bg_style": config?.btn_cfg?.bg_style || "line",
						"bg": config?.btn_cfg?.bg,
						'color': config?.btn_cfg?.color,
						"font_size": config?.btn_cfg?.font_size,
						"radius": config?.btn_cfg?.radius || "10px",
						"size": config?.btn_cfg?.size || "sm",
						"padding": config?.btn_cfg?.padding || null
					},
					"img": {
						"col": this.listConfig?.img?.col || config?.img?.col,
						"cfg": {
							"width": this.listConfig?.img?.width || config?.img?.cfg?.width || "100%",
							"height": this.listConfig?.img?.height || config?.img?.cfg?.height || "150rpx",
							"radius": config?.img?.cfg?.radius || "10px 10px 0 0",
							"position": config?.img?.cfg?.position || "top",
							"mode": this.listConfig?.img?.mode || config?.img?.cfg?.mode || "",
							"padding": this.listConfig?.img?.padding || config?.img?.cfg?.padding || "",
							"margin": this.listConfig?.img?.margin || config?.img?.cfg?.margin || ""
						}
					},
					cols: this.listConfig?.cols || config?.cols
				}
				return obj
				// return this.colV2?.moreConfig?.list_config || {}
			},
			listButton() {
				let buttons = this.publicButton
				let res = buttons.filter(item => {
					if (['select', 'add', 'apply', 'customize'].includes(item.button_type)) {
						if (item.button_type === 'select') {
							return this.colV2?._fieldInfo
						}
						if (item.button_type === 'add') {
							return true
						}
					}
				}).map(item => {
					if (item.button_type === 'select') {
						item.icon = 'cuIcon-filter'
						item.button_name = '筛选'
						item.clickEvent = this.showFilterModal
					} else if (['add', 'apply'].includes(item.button_type)) {
						item.icon = 'cuIcon-add'
						item.clickEvent = this.clickAddButton
					}
					return item
				})
				if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
					res.push({
						button_type: 'order',
						icon: 'cuIcon-order',
						label: '排序',
						button_name: '排序',
						clickEvent: this.showOrder
					})
				}
				return res
			},
			srvCols() {
				return this.colV2?._fieldInfo || []
			},
			filterCols() {
				let cols = this.moreConfig?.appTempColMap
				let arr = []
				if (typeof cols === 'object') {
					cols = Object.keys(cols).map(key => cols[key]).filter(item => item && item)
					arr = this.srvCols.filter(item => cols.includes(item.columns) && !['Image', 'String'].includes(item
						.col_type))
				} else {
					let defVal = {}
					if (Array.isArray(this.condition) && this.condition.length > 0) {
						defVal = this.condition.reduce((res, cur) => {
							res[cur.colName] = cur.value;
							return res
						}, {})
					}
					arr = this.srvCols.filter(item => !['Image', 'String', 'MultilineText'].includes(item.col_type)).map(
						item => {
							if (defVal[item.column]) {
								item.defaultValue = defVal[item.column]
								item.disabled = true
								item.value = defVal[item.column]
							}
							return item
						})
				}
				if (Array.isArray(this.initCond) && this.initCond.length > 0) {
					arr = arr.map(field => {
						this.initCond.forEach(cond => {
							if (field.column === cond.colName) {
								field.value = cond.value
								field.defaultValue = cond.value
							}
						})
						return field
					})
				}
				return arr
			},
			orderList() {
				let cols = this.orderCols.filter(item => item.selected)
				if (cols.length === 0) {
					return this.order
				}
				let arr = cols.map(col => {
					return {
						colName: col.columns,
						orderType: col.orderType || 'asc'
					}
				})
				return arr
			},
			finalSearchColumn() {
				if (this.moreConfig?.searchColumn) {
					return this.moreConfig.searchColumn
				} else {
					if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
						return this.srvCols.reduce((res, cur) => {
							if (!['id', 'create_time', 'create_user', 'create_user_disp', 'del_flag',
									'modify_time',
									'modify_user', 'modify_user_disp'
								].includes(cur.columns)) {
								res.push(cur.columns)
							}
							return res
						}, [])
					}
					if (typeof this.finalViewTemp === 'object') {
						return Object.keys(this.finalViewTemp).reduce((res, cur) => {
							if (this.finalViewTemp[cur]) {
								res.push(this.finalViewTemp[cur])
							}
							return res
						}, [])
					}
				}
			},
			countConfig() {
				return this.moreConfig?.count_config || {}
			},
			sumPrice() {
				if (Array.isArray(this.list)) {
					let sum = this.list.reduce((res, cur) => {
						if (cur.checked === true) {
							res += cur.unit_price * cur.goods_amount * 1000
						}
						return res
					}, 0)
					return sum / 1000
				}
			},
		},
		data() {
			return {
				cartMode: 'default',
				navigationBarTitle: "",
				hideChildList: false,
				showMockCount: false,
				serviceName: "srvhealth_store_vaccination_appoint_record_select",
				list: [],
				pageNo: 1,
				rownumber: 20,
				total: 0,
				loadStatus: 'more',
				condition: null,
				appName: "",
				colV2: null,
				orderCols: [],
				proc_data_type: "", //流程状态
				searchVal: "",
				listType: "list", //list,proc,cart
				pageType: "", //list,proc,cart,selectorList
				detailType: "", //  normal,custom
				tabList: [],
				order: [],
				cartData: [],
				wxMchId: '',
				customDetailUrl: "",
				listConfig: {

				},
				initCond: [],
				relationCondition: [],
				disabled: false,
				gridButtonDisp: null,
				rowButtonDisp: null,
				formButtonDisp: null,
				countData: null,
				selectoDataId: '',
				selectCol: ""
			}
		},
		methods: {
			confirmSelect() {
				if (this.selectoDataId) {
					uni.$emit('confirmSelect', {
						val: this.selectoDataId,
						service: this.serviceName,
						col: this.selectCol,
						data: this.list.find(item => this.selectoDataId.indexOf(item.id) !== -1)
					})
				}
				uni.navigateBack({})
			},
			checkboxChange(e) {
				if (this.listType === 'selectorList') {
					this.list = this.list.map(item => {
						if (e.id === item.id) {
							item.checked = !item.checked
						} else {
							item.checked = true
						}
						return item
					})
					let selectorList = this.list.filter(item => item.checked == true).map(item => item.id).toString()
					this.selectoDataId = selectorList
				} else {
					if (e.cart_goods_rec_no) {
						this.list = this.list.map(item => {
							if (e.cart_goods_rec_no === item.cart_goods_rec_no) {
								item.checked = !item.checked
							}
							return item
						})
					}
					if (this.list.length > 0 && this.list.every(item => item.checked === true)) {
						this.$refs.cartBottom.selectAll = true
					} else {
						this.$refs.cartBottom.selectAll = false
					}
				}

			},
			selectAllChange(e) {
				if (e) {
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
			toOrderPage() {
				let list = this.list.filter(item => item.checked === true && item.goods_amount);
				list = this.deepClone(list)
				if (list.length > 0) {
					list = list.map(goodsInfo => {
						goodsInfo.car_num = goodsInfo.goods_amount
						goodsInfo.price = goodsInfo.unit_price
						return goodsInfo
					})

					this.$store.commit('SET_STORE_CART', {
						storeInfo: this.storeInfo,
						store_no: this.storeInfo?.store_no,
						list: list
					});
					let url = `/storePages/payOrder/payOrder?store_no=${this.storeInfo?.store_no }`
					if (this.wxMchId) {
						url += `&wxMchId=${this.wxMchId}`
					}
					uni.navigateTo({
						url
					});
				}
			},
			del() {
				let list = this.list.filter(item => item.checked);
				if (Array.isArray(list) && list.length > 0) {
					uni.showModal({
						title: '提示',
						content: '确认从购物车中删除已选项?',
						success: (res) => {
							if (res.confirm) {
								let service = 'srvhealth_store_shopping_cart_goods_detail_delete'
								let url = this.getServiceUrl('health', service, 'operate');
								let req = [{
									"serviceName": service,
									"condition": [{
										"colName": "id",
										"ruleType": "in",
										"value": list.map(item => item.id).toString()
									}]
								}]
								this.$http.post(url, req).then(res => {
									if (res.data.state === 'SUCCESS') {
										this.refresh()
										uni.showToast({
											title: '删除成功!',
											icon: 'none'
										})
									}
								})
							}
						}
					})
				}
			},
			async getCountData(count_config) {
				if (count_config && Array.isArray(count_config.condition) && count_config.condition.length > 0) {
					let data = {
						storeInfo: this.storeInfo,
						userInfo: this.userInfo
					}
					count_config.condition = count_config.condition.map(item => {
						if (item.value && item.value.indexOf('${') !== -1) {
							item.value = this.renderStr(item.value, data)
						}
						return item
					})
				}
				if (count_config && count_config.serviceName && count_config.appName) {
					let serviceName = count_config?.serviceName;
					let appName = count_config?.appName;
					if (serviceName && appName) {
						let req = {
							"serviceName": serviceName,
							"colNames": ["*"],
							"condition": count_config.condition || [],
							"page": {
								"pageNo": 1,
								"rownumber": 1
							}
						}
						let url = this.getServiceUrl(appName, serviceName, 'select');
						let res = await this.$http.post(url, req);
						if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
							let data = {

							}
							if (res.data.data.length > 0) {
								data = res.data.data[0]
							} else {
								data = count_config.labelMap.map(item => {
									item.value = '0';
									return item
								})
							}

							if (Array.isArray(count_config.labelMap)) {
								let result = count_config.labelMap.map(item => {
									item.value = data[item.col];
									return item
								})
								this.countData = result
							}
						}
					}
				}
			},
			getListWithFilter(e) {
				let self = this
				let tabsConds = this.$refs.filterTabs.buildConditions()
				this.relationCondition = tabsConds
				setTimeout(() => {
					this.pageNo = 1;
					this.getList(null, this.initCond)
				}, 100)

			},
			onFilterChange(e) {
				if (e) {
					let tabsConds = this.$refs.filterTabs.buildConditions()
					this.relationCondition = tabsConds
				}
			},
			clearCart() {
				this.cartData = []
			},
			changeAmount(data) {
				if (data && data.row && typeof data.index === 'number') {
					this.$set(this.cartData, data.index, data.row)
					if (data.row.goods_count === 0) {
						this.cartData.splice(data.index, 1)
					}
				}
			},
			del2Cart(e) {
				let data = this.deepClone(e)
				if (this.listType === 'cart') {
					let index = this.cartData.findIndex(item => item.id === data.id)
					if (index !== -1) {
						data.goods_count = this.cartData[index].goods_count - 1
						if (data.goods_count === 0) {
							this.cartData.splice(index, 1)
						} else {
							this.$set(this.cartData, index, data)
						}
					} else {
						// data.goods_count = 1
						// this.cartData.push(data)
					}
				} else if (this.listType === 'cartList') {
					if (data.goods_amount > 1) {
						this.list = this.list.map(item => {
							if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
								item.goods_amount -= 1
								this.updateCart(item).then(res => {
									if (res.success) {
										// uni.showToast({
										//   title:'操作成功'
										// })
									}
								})
							}
							return item
						})
					} else {
						uni.showToast({
							title: '不能再减少了~',
							icon: 'none'
						})
					}
				}
			},

			add2Cart(e) {
				let data = this.deepClone(e)
				if (this.listType === 'cart') {
					let index = this.cartData.findIndex(item => item.id === data.id)
					if (index !== -1) {
						data.goods_count = this.cartData[index].goods_count + 1
						this.$set(this.cartData, index, data)
					} else {
						data.goods_count = 1
						this.cartData.push(data)
					}
				} else if (this.listType === 'cartList') {
					let goodsInfo = this.list.find(item => item.cart_goods_rec_no === data.cart_goods_rec_no)
					if (goodsInfo) {
						this.getGoodsStock(goodsInfo).then(res => {
							if (res && res.id) {
								if (res.amount > goodsInfo.goods_amount - 1) {
									this.list = this.list.map(item => {
										if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
											item.goods_amount += 1
											if (item.checked == false) {
												item.checked = true
											}
											this.updateCart(item).then(res => {
												if (res.success) {
													// uni.showToast({
													//   title:'操作成功'
													// })
												}
											})
										}
										return item
									})
								} else {
									uni.showToast({
										title: '商品库存不足',
										icon: 'none'
									})
								}
							}
						})

					}


					// this.list = this.list.map(item => {
					//   if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
					//     item.goods_amount += 1
					//     if (item.checked == false) {
					//       item.checked = true
					//     }
					//   }
					//   return item
					// })
				}

			},
			toOrder(e) {
				this.order = e
				setTimeout(_ => {
					this.getList()
				}, 100)
			},
			toSearch(e) {
				let keywords = e || this.searchVal;
				this.searchVal = keywords
				this.pageNo = 1
				this.getList()
			},
			changeSerchVal(e) {
				this.searchVal = e
			},
			toFilter(e) {
				this.searchVal = ''
				this.showFilter = false;
				if (Array.isArray(e)) {
					let cond = e
					this.getList(cond)
				}
			},
			handlerCustomizeButton(e) {
				// 自定义按钮
				if (e.servcie_type === 'add') {
					let params = {
						type: 'add',
						serviceName: e.service_name,
						eventOrigin: e
					};
					uni.navigateTo({
						url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
							params)
					});
				} else if (e.servcie_type === 'select') {
					let params = {
						type: 'select',
						serviceName: e.service_name,
						defaultVal: data.row,
						eventOrigin: e
					};
					if (e.operate_params && Array.isArray(e.operate_params
							.condition)) {
						let viewTemp = {};
						if (e.service_name ===
							'srvhealth_store_vaccination_appoint_record_select') {
							viewTemp = {
								title: 'customer_name',
								img: 'person_image',
							}
						}
						uni.navigateTo({
							url: '/publicPages/list/list?pageType=list&serviceName=' +
								e.service_name +
								'&cond=' +
								JSON.stringify(e.operate_params.condition) +
								'&viewTemp=' +
								JSON.stringify(viewTemp)
						});
					}
				} else if (e.servcie_type === 'update') {
					let fieldsCond = [];
					if (Array.isArray(this.condition)) {
						fieldsCond = this.condition.map(item => {
							return {
								column: item.colName,
								value: item.value,
								display: false
							};
						});
					}
					let condition = button?.operate_params?.condition
					let defaultVal = button?.operate_params?.data
					if (Array.isArray(defaultVal) && defaultVal.length > 0) {
						let obj = defaultVal[0]
						if (this.iObject(obj)) {
							Object.keys(obj).forEach(key => {
								fieldsCond.push({
									column: key,
									value: obj[key]
								})
							})
						}
					}
					if (Array.isArray(condition) && condition.length > 0) {
						condition.forEach(cond => {
							fieldsCond.push({
								column: cond.colName,
								value: cond.value
							})
						})
					}

					let url =
						`/publicPages/form/form?service=${e.service}&serviceName=${e.service_name}&type=${e.servcie_type}&fieldsCond=` +
						encodeURIComponent(JSON.stringify(fieldsCond));
					if (this.appName) {
						url += `&appName=${this.appName}`
					}

					uni.navigateTo({
						url: url
					});
				}
			},
			clickGridButton(e) {
				switch (e.button_type) {
					case 'select':
						this.showFilterModal()
						break;
					case 'add':
						this.clickAddButton(e)
						break;
					case 'order':
						this.showOrder()
						break;
					case 'customize':
						this.handlerCustomizeButton(e)
						break;
				}
			},
			clickAddButton(e) {
				if (e.button_type === 'add') {
					let fieldsCond = [];
					if (Array.isArray(this.condition)) {
						fieldsCond = this.condition.map(item => {
							return {
								column: item.colName,
								value: item.value,
								display: false
							};
						});
					}
					let url =
						`/publicPages/form/form?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

					url =
						`/publicPages/formPage/formPage?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

					if (this.appName) {
						url += `&appName=${this.appName}`
					}
					if (this.main_data) {
						url += `&main_data=${JSON.stringify(this.main_data)}`
					}
					uni.navigateTo({
						url: url
					});
				}

			},
			refresh() {
				this.loadStatus = 'more'
				this.pageNo = 1;
				this.getList(null, this.initCond)
			},
			async getListV2() {
				let app = this.appName || uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.serviceName, 'list', this.listType === 'proc' ?
					'proclist' :
					'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				if (!this.navigationBarTitle) {
					let title = ''
					if (this.listConfig?.navTitle) {
						title = this.listConfig?.navTitle
					} else {
						title = colVs.service_view_name
					}
					uni.setNavigationBarTitle({
						title
					});
				}
				console.log('colVs', colVs);
				if (colVs.more_config) {
					try {
						colVs.moreConfig = JSON.parse(colVs.more_config)
						if (colVs.moreConfig?.detailType) {
							if (!this.detailType) {
								this.detailType = colVs.moreConfig?.detailType
							}
						}
						if (colVs.moreConfig?.formButtonDisp && !this.formButtonDisp) {
							this.formButtonDisp = colVs.moreConfig?.formButtonDisp
						}
						if (colVs.moreConfig?.rowButtonDisp && !this.rowButtonDisp) {
							this.rowButtonDisp = colVs.moreConfig?.rowButtonDisp
						}
						if (colVs.moreConfig?.gridButtonDisp && !this.gridButtonDisp) {
							this.gridButtonDisp = colVs.moreConfig?.gridButtonDisp
						}
						if (colVs.moreConfig?.customDetailUrl) {
							if (!this.customDetailUrl) {
								this.customDetailUrl = colVs.moreConfig?.customDetailUrl
							}
						}
						if (colVs.moreConfig?.count_config) {
							this.getCountData(colVs.moreConfig?.count_config)
						}
					} catch (e) {
						//TODO handle the exception
						console.info(e)
					}
				}
				this.colV2 = colVs;

				if (Array.isArray(colVs.srv_cols)) {
					this.orderCols = colVs.srv_cols.filter(item => {
						if (item.in_list === 1) {
							item.orderType = 'asc'
							item.selected = false;
							return true
						}
					})
				}
				return colVs;
			},
			async getList(cond, initCond) {
				if (this.moreConfig?.count_config) {
					this.getCountData(this.moreConfig?.count_config)
				}
				let serviceName = this.serviceName;
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					serviceName: serviceName,
					colNames: ['*'],
					condition: this.condition || [],
					page: {
						rownumber: this.rownumber,
						pageNo: this.pageNo
					},
					order: this.orderList
				};
				if (this.listType === 'proc') {
					if (proc_data_type || this.proc_data_type) {
						req['proc_data_type'] = proc_data_type || this.proc_data_type;
					} else {
						req['proc_data_type'] = 'wait';
					}
				}
				if (Array.isArray(cond) && cond.length > 0) {
					req.condition = req.condition.concat(cond);
				}
				if (Array.isArray(initCond) && initCond.length > 0) {
					req.condition = [...req.condition, ...initCond]
				}

				let keywords = this.searchVal;
				// req.condition = []
				if (keywords && this.finalSearchColumn) {
					if (typeof this.finalSearchColumn === 'string') {
						req.condition = req.condition.concat([{
							colName: this.finalSearchColumn,
							ruleType: 'like',
							value: keywords
						}]);
					} else if (Array.isArray(this.finalSearchColumn)) {
						// 数组 使用relation_condition
						if (Array.isArray(req.condition) && req.condition.length > 0) {
							req.relation_condition = {
								relation: "AND",
								data: [{
										relation: "OR",
										data: this.finalSearchColumn.map(item => {
											return {
												"colName": item,
												"value": keywords,
												"ruleType": 'like'
											}
										})
									},
									{
										relation: "AND",
										data: this.deepClone(req.condition)
									}
								]
							}
						} else {
							req.relation_condition = {
								relation: "OR",
								data: this.finalSearchColumn.map(itme => {
									return {
										"colName": itme,
										"value": keywords,
										"ruleType": 'like'
									}
								})
							}
						}
						// delete req.condition
					}
				}

				if (Array.isArray(this.relationCondition?.data) && this.relationCondition.data.length > 0) {
					if (req.relation_condition?.data.length > 0) {
						req.relation_condition = {
							"relation": "AND",
							data: [
								...this.relationCondition.data,
								{
									"relation": "OR",
									data: req.relation_condition
								}
							]
						}
					} else {
						req.relation_condition = this.relationCondition
					}
				}

				if (this.colV2?.vpage_no) {
					req['vpage_no'] = this.colV2.vpage_no
				}
				this.loadStatus = 'loading'
				let res = await this.$http.post(url, req);

				if (res.data.state === 'SUCCESS') {
					if (this.pageNo === 1) {
						this.list = [];
					}
					this.list = this.list.concat(res.data.data);
					this.pageNo = res.data.page.pageNo;
					let page = res.data.page;
					if (this.listType === 'proc') {
						for (let i = 0; i < this.tabList.length; i++) {
							let item = this.tabList[i];
							if (item.proc_data_type === req.proc_data_type) {
								item.data = this.list;
								item.total = res.data.page.total;
								item.page = res.data.page;
								this.$set(this.tabList, i, item);
							}
						}
						this.list = [];
						this.list = this.tabList[this.TabCur]['data'];
						let callBackData = {
							data: this.list,
							page: res.data.page,
							proc_data_type: req.proc_data_type
						};
						return callBackData;
					} else {
						if (page.rownumber * page.pageNo >= page.total) {
							this.loadStatus = 'norMore'
						} else {
							this.loadStatus = 'more'
						}
					}
					if (this.listType === 'cartList' || this.listType === 'selectorList') {
						this.list = this.list.map(item => {
							if (!item.checked) {
								item.checked = false;
							}
							if (this.selectoDataId && Number(this.selectoDataId) === Number(item.id)) {
								item.checked = true
							}
							return item
						})
						if (this.listType === 'cartList') {
							if (this.list.length > 0 && this.list.every(item => item.checked === true)) {
								this.$refs.cartBottom.selectAll = true
							} else {
								this.$refs.cartBottom.selectAll = false
							}
						}

					}
					return this.list;
				}
			},
			async clickFootBtn(data) {
				if (this.listType === 'selectorList') {
					this.checkboxChange(data.row)
					return
				}
				let self = this
				let buttonInfo = this.deepClone(data.button);
				let rowData = this.deepClone(data.row);
				if (buttonInfo?._buttons) {
					delete buttonInfo._buttons
				}
				let moreConfig = buttonInfo.more_config;
				if (moreConfig && typeof moreConfig === 'string') {
					try {
						buttonInfo.moreConfig = JSON.parse(moreConfig);
					} catch (e) {
						//TODO handle the exception
						console.log(e);
					}
				}
				if (!buttonInfo?.button_type) {
					uni.showModal({
						title: '提示',
						content: '按钮操作参数配置有误',
						showCancel: false
					})
					return
				}
				if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
					// 序列化操作参数
					try {
						buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
						if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
							.length > 0) {
							buttonInfo.operate_params.condition.forEach(cond => {
								if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
									cond.value = rowData[cond.value.value_key];
								} else if (typeof cond.value === 'object' && cond.value.value_type ===
									'constant') {
									cond.value = cond.value.value;
								} else if (typeof cond.value === 'object' && cond.value.value_type ===
									'globalVariable') {
									// 全局变量
									const globalVariable = {
										storeUser: this.vstoreUser,
										loginUser: this.vloginUser,
										userInfo: this.userInfo,
										storeInfo: this.storeInfo
									}
									cond.value = this.renderStr(cond.value.value_key, globalVariable)
								}
							});
						}

						if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length >
							0) {
							buttonInfo.operate_params.data.forEach(data => {
								if (typeof data === 'object') {
									Object.keys(data).forEach(item => {
										if (typeof data[item] === 'object' && data[item].value_type ===
											'rowData') {
											data[item] = rowData[data[item].value_key];
										} else if (typeof data[item] === 'object' && data[item]
											.value_type === 'constant') {
											data[item] = data[item].value;
										} else if (typeof data[item] === 'object' && data[item]
											.value_type ===
											'globalVariable') {
											// 全局变量
											const globalVariable = {
												storeUser: this.vstoreUser,
												loginUser: this.vloginUser,
												userInfo: this.userInfo,
												storeInfo: this.storeInfo
											}
											data[item] = this.renderStr(data[item].value_key,
												globalVariable)
										}
									});
								}
							});
						}
					} catch (e) {
						//TODO handle the exception
					}
				}

				if (buttonInfo.button_type === "customize") {
					if (buttonInfo.operate_type === '删除') {
						this.onButtonToUrl(data, this.appName).then(res => {
							if (res.state === 'SUCCESS') {
								this.refresh()
							}
						})

					} else if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
						let req = [{
							serviceName: buttonInfo.operate_service,
							condition: buttonInfo.operate_params.condition,
							data: buttonInfo.operate_params.data
						}];

						if (!buttonInfo.operate_params.data && buttonInfo.servcie_type === 'update') {
							uni.showModal({
								title: '提示',
								content: '按钮操作参数配置有误',
								showCancel: false
							})
							return
						}
						let app = this.appName || uni.getStorageSync('activeApp');
						let url = this.getServiceUrl(buttonInfo.application || app, buttonInfo.operate_service,
							buttonInfo.servcie_type);
						uni.showModal({
							title: '提示',
							content: '是否确认操作?',
							success: (res) => {
								if (res.confirm) {
									this.$http.post(url, req).then(res => {
										if (res.data.state === 'SUCCESS') {
											this.refresh()
										}
									})
								}
							}
						})
						return
					} else if (buttonInfo.operate_type === "URL跳转") {
						if (buttonInfo?.moreConfig?.navUrl) {
							let storeInfo = this.$store?.state?.app?.storeInfo
							let bindUserInfo = this.$store?.state?.user?.storeUserInfo
							let obj = {
								data: rowData,
								rowData,
								storeInfo,
								bindUserInfo
							};
							let url = this.renderStr(buttonInfo.moreConfig.navUrl, obj)

							let title = buttonInfo?.service_view_name || buttonInfo?.button_name
							this.navigateTo({
								url,
								title
							})
						} else if (buttonInfo?.pre_data_handle === 'requestPayment' || buttonInfo?.path_col ===
							'requestPayment') {
							let total_col = 'order_amount'
							let order_no_col = 'order_no'
							if (buttonInfo?.moreConfig?.total_col) {
								total_col = buttonInfo?.moreConfig?.total_col
							}
							if (buttonInfo?.moreConfig?.order_no_col) {
								order_no_col = buttonInfo?.moreConfig?.order_no_col
							}
							let total = rowData[total_col]
							let orderNo = rowData[order_no_col]
							rowData.order_no = rowData.order_no || orderNo
							if (total && orderNo) {
								let wx_mch_id = this.getwxMchId()
								let result = await this.toPlaceOrder(total * 100, this.vloginUser?.login_user_type,
									rowData, wx_mch_id);
								if (result && result.prepay_id) {
									let res = await this.getPayParams(result.prepay_id, wx_mch_id);
									wx.requestPayment({
										timeStamp: res.timeStamp.toString(),
										nonceStr: res.nonceStr,
										package: res.package,
										signType: 'MD5',
										paySign: res.paySign,
										success(res) {
											// 支付成功
											self.updateOrderState('待发货', '已支付', result.prepay_id, rowData
												.order_no);
											uni.redirectTo({
												url: '/storePages/successPay/successPay?order_no=' +
													orderData
													.order_no + '&totalMoney=' + orderData.order_amount
											});
										},
										fail(res) {
											// 支付失败/取消支付
											self.updateOrderState('待支付', '取消支付', result.prepay_id, rowData
												.order_no);
										}
									});
								}
							}


						}

					} else if (buttonInfo.operate_type === '更新弹出' || buttonInfo.operate_type === '更新跳转') {
						// 自定义按钮
						let moreConfig = buttonInfo.more_config;
						if (moreConfig && typeof moreConfig === 'string') {
							try {
								moreConfig = JSON.parse(moreConfig);
							} catch (e) {
								//TODO handle the exception
								console.log(e);
							}
						}
						if (buttonInfo.servcie_type === 'add') {
							let params = {
								type: 'add',
								serviceName: buttonInfo.service_name,
								defaultVal: rowData,
								eventOrigin: buttonInfo
							};
							let url = '/pages/public/formPage/formPage?params=' + JSON.stringify(
								params)
							// uni.navigateTo({
							//   url
							// });
							let title = buttonInfo?.service_view_name || buttonInfo?.button_name
							this.navigateTo({
								url,
								title
							})

							return
						} else if (buttonInfo.servcie_type === 'select') {
							let params = {
								type: 'select',
								serviceName: buttonInfo.service_name,
								defaultVal: rowData,
								eventOrigin: buttonInfo
							};
							if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
									.condition)) {
								let viewTemp = {};
								if (buttonInfo.service_name ===
									'srvhealth_store_vaccination_appoint_record_select') {
									viewTemp = {
										title: 'customer_name',
										img: 'person_image',
									}
								}
								uni.navigateTo({
									url: '/publicPages/list/list?pageType=list&serviceName=' +
										buttonInfo.service_name +
										'&cond=' +
										JSON.stringify(buttonInfo.operate_params.condition) +
										'&viewTemp=' +
										JSON.stringify(viewTemp)
								});
								return
							}
						} else if (buttonInfo.servcie_type === 'update' || buttonInfo.servcie_type === 'operate') {
							let params = {
								type: 'update',
								serviceName: buttonInfo.service_name,
								defaultVal: rowData,
								eventOrigin: buttonInfo
							};
							let fieldsCond = [];
							let condition = buttonInfo?.operate_params?.condition
							let defaultVal = buttonInfo?.operate_params?.data
							if (Array.isArray(defaultVal) && defaultVal.length > 0) {
								let obj = defaultVal[0]
								if (this.iObject(obj)) {
									Object.keys(obj).forEach(key => {
										fieldsCond.push({
											column: key,
											value: obj[key]
										})
									})
								}
							}
							// if (Array.isArray(condition) && condition.length > 0) {
							//   condition.forEach(cond => {
							//     fieldsCond.push({
							//       column: cond.colName,
							//       value: cond.value
							//     })
							//   })
							// }
							if (fieldsCond.length === 0) {
								fieldsCond = [{
									column: 'id',
									value: rowData.id
								}]
							}
							let url =
								`/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
								encodeURIComponent(JSON.stringify(fieldsCond));
							if (this.appName) {
								url += `&appName=${this.appName}`
							}
							if (Array.isArray(condition) && condition.length > 0) {
								url += `&condition=${JSON.stringify(condition)}`
							}
							uni.navigateTo({
								url: url
							});
							return
						}
						return
					} else if (buttonInfo.operate_type === '列表跳转') {
						// debugger
						// let serviceName = buttonInfo.service_name;
						// let 
						let app = buttonInfo.application
						let url = '/publicPages/list2/list2?pageType=list&serviceName=' +
							buttonInfo.service_name +
							'&cond=' +
							JSON.stringify(buttonInfo.operate_params.condition)

						if (app) {
							url += `&destApp=${app}`
						}
						if (this.disabled === true) {
							url += '&disabled=true'
						}
						// uni.navigateTo({
						//   url
						// });
						let title = buttonInfo?.service_view_name || buttonInfo?.button_name
						this.navigateTo({
							url,
							title
						})
						return
					} else if (buttonInfo.operate_type === '详情跳转') {
						let fieldsCond = [];
						if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
							.length >
							0) {
							buttonInfo.operate_params.condition.forEach(item => {
								let obj = {
									column: item.colName,
									value: item.value,
									disabled: true
								}
								fieldsCond.push(obj)
							})
						}
						let url =
							`/publicPages/form/form?type=detail&disabled=true&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=${buttonInfo.application}`;
						uni.navigateTo({
							url
						})
						return
					} else if (buttonInfo.operate_type === '增加跳转' || buttonInfo.operate_type === '增加弹出') {
						let fieldsCond = [];
						if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
							.length >
							0) {
							buttonInfo.operate_params.condition.forEach(item => {
								let obj = {
									column: item.colName,
									value: item.value,
									disabled: true
								}
								fieldsCond.push(obj)
							})
						}
						if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length >
							0) {
							buttonInfo.operate_params.data.forEach(item => {
								Object.keys(item).forEach(key => {
									let obj = {
										column: key,
										value: item[key],
										disabled: true
									}
									fieldsCond.push(obj)
								})

							})
						}
						let url =
							`/publicPages/formPage/formPage?type=add&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=${buttonInfo.application}`;
						// uni.navigateTo({
						//   url
						// });
						let title = buttonInfo?.service_view_name || buttonInfo?.button_name
						this.navigateTo({
							url,
							title
						})
						return
					}

				} else if (this.listType === 'proc') {
					if (buttonInfo && buttonInfo.button_type === 'edit' && rowData.proc_instance_no) {
						uni.navigateTo({
							url: '/publicPages/procDetail/procDetail?proc_instance_no=' + rowData
								.proc_instance_no
						});
					}
				} else {
					if (buttonInfo.button_type === 'detail' && this.customDetailUrl) {
						let storeInfo = this.$store?.state?.app?.storeInfo
						let bindUserInfo = this.$store?.state?.user?.storeUserInfo
						let targetUrl = this.customDetailUrl
						let obj = {
							data: rowData,
							rowData,
							storeInfo,
							bindUserInfo
						};
						obj = this.deepClone(obj)
						targetUrl = this.renderStr(this.customDetailUrl, obj)
						if (targetUrl && targetUrl.indexOf('"value":""') !== -1) {
							let condition = buttonInfo?.operate_params?.condition
							let fieldsCond = [{
								column: 'id',
								value: rowData.id
							}]
							let url =
								`/publicPages/form/form?serviceName=${buttonInfo.service_name}&type=detail&fieldsCond=` +
								encodeURIComponent(JSON.stringify(fieldsCond));

							// if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
							//   'childTableList') {
							url =
								`/publicPages/detail/detail?serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
							// }
							if (this.hideChildList) {
								url =
									`/publicPages/form/form?type=detail&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
							}
							if (Array.isArray(condition) && condition.length > 0) {
								url += `&condition=${JSON.stringify(condition)}`
							}
							if (this.appName) {
								url += `&appName=${this.appName}`
							}
							targetUrl = url

						}

						if (this.disabled === true) {
							targetUrl += '&disabled=true'
						}
						let navTypes = ['navigateTo', 'redirectTo', 'reLaunch']
						if (this.listConfig?.navType && navTypes.includes(this.listConfig?.navType)) {
							uni[this.listConfig?.navType]({
								url: targetUrl
							})
							return
						}
						uni.navigateTo({
							url: targetUrl
						})
						return
					}

					this.onButtonToUrl(data, this.appName).then(res => {
						if (buttonInfo && buttonInfo.button_type === 'delete') {
							if (res.state === 'SUCCESS') {
								this.refresh()
							}
						}
						if (buttonInfo && buttonInfo.button_type === 'detail') {
							let {
								row,
								button
							} = res
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
										if (key !== '_buttons' && row[key]) {
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
								`/publicPages/formPage/formPage?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
							// if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
							//   'childTableList') {
							url =
								`/publicPages/detail/detail?serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
							// }
							if (this.hideChildList) {
								url =
									`/publicPages/form/form?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
							}
							if (this.appName) {
								url += `&appName=${this.appName}`
							}
							// if (button.service_name === 'srvdaq_cms_content_select') {
							//   if (rowData.content_no) {
							//     uni.navigateTo({
							//       url: `/publicPages/article/article?serviceName=srvdaq_cms_content_select&content_no=${rowData.content_no}`
							//     });
							//   }
							//   return
							// }
							if (this.disabled === true) {
								url += '&disabled=true'
							}
							uni.navigateTo({
								url: url
							})
						} else if (buttonInfo && buttonInfo.button_type === 'customize') {
							// 自定义按钮
							let moreConfig = buttonInfo.more_config;
							if (moreConfig && typeof moreConfig === 'string') {
								try {
									moreConfig = JSON.parse(moreConfig);
								} catch (e) {
									//TODO handle the exception
									console.log(e);
								}
							}
							if (buttonInfo.servcie_type === 'add') {
								let params = {
									type: 'add',
									serviceName: buttonInfo.service_name,
									defaultVal: rowData,
									eventOrigin: buttonInfo
								};
								uni.navigateTo({
									url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
										params)
								});
							} else if (buttonInfo.servcie_type === 'select') {
								let params = {
									type: 'select',
									serviceName: buttonInfo.service_name,
									defaultVal: rowData,
									eventOrigin: buttonInfo
								};
								if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
										.condition)) {
									let viewTemp = {};
									if (buttonInfo.service_name ===
										'srvhealth_store_vaccination_appoint_record_select') {
										viewTemp = {
											title: 'customer_name',
											img: 'person_image',
										}
									}
									uni.navigateTo({
										url: '/publicPages/list/list?pageType=list&serviceName=' +
											buttonInfo.service_name +
											'&cond=' +
											JSON.stringify(buttonInfo.operate_params.condition) +
											'&viewTemp=' +
											JSON.stringify(viewTemp)
									});
								}
							} else if (buttonInfo.servcie_type === 'update') {
								let params = {
									type: 'update',
									serviceName: buttonInfo.service_name,
									defaultVal: rowData,
									eventOrigin: buttonInfo
								};
								let fieldsCond = [];
								if (Array.isArray(this.condition)) {
									fieldsCond = this.condition.map(item => {
										return {
											column: item.colName,
											value: item.value,
											display: false
										};
									});
								}
								let condition = buttonInfo?.operate_params?.condition
								let defaultVal = buttonInfo?.operate_params?.data
								if (Array.isArray(defaultVal) && defaultVal.length > 0) {
									let obj = defaultVal[0]
									if (this.iObject(obj)) {
										Object.keys(obj).forEach(key => {
											fieldsCond.push({
												column: key,
												value: obj[key]
											})
										})
									}
								}
								if (Array.isArray(condition) && condition.length > 0) {
									condition.forEach(cond => {
										fieldsCond.push({
											column: cond.colName,
											value: cond.value
										})
									})
								}
								let url =
									`/publicPages/form/form?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
									encodeURIComponent(JSON.stringify(fieldsCond));
								if (this.appName) {
									url += `&appName=${this.appName}`
								}
								if (this.disabled === true) {
									url += '&disabled=true'
								}
								uni.navigateTo({
									url: url
								});
							}
						} else if (buttonInfo && buttonInfo.button_type === 'duplicate') {
							let fieldsCond = []
							if (Array.isArray(self.condition)) {
								self.condition.forEach(item => {
									fieldsCond.push({
										column: item.colName,
										value: item.value,
										display: false
									})
								})
							}
							Object.keys(rowData).forEach(key => {
								if (!['id', 'modify_user_disp', 'modify_user', 'modify_time',
										'create_user_disp', 'create_user', 'create_time', 'del_flag',
										'_buttons'
									].includes(key) && rowData[key]) {
									if (!fieldsCond.find(item => item.column === key)) {
										fieldsCond.push({
											column: key,
											display: true,
											value: rowData[key],
										})
									}
								}
							})

							let url =
								`/publicPages/form/form?serviceName=${buttonInfo.service_name}&type=add&fieldsCond=${JSON.stringify(fieldsCond)}`;
							if (self.appName) {
								url += `&appName=${self.appName}`
							}
							uni.navigateTo({
								url: url
							});
						} else if (buttonInfo.servcie_type === 'add') {
							let params = {
								type: 'add',
								serviceName: res.button.service_name,
								defaultVal: res.row,
								eventOrigin: res.button
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
									params)
							});
						} else if (buttonInfo && buttonInfo.operate_type === '流程申请') {
							uni.navigateTo({
								url: '/pages/public/proc/apply/apply?serviceName=' + buttonInfo
									.operate_service
							});
						}
					});
				}
				console.log('clickFootBtn:', data);

			}
		},
		onLoad(option) {
			if (this.sysModel === 'PC') {
				this.rownumber = 100
			}
			if (option.rowButtonDisp) {
				try {
					this.rowButtonDisp = JSON.parse(option.rowButtonDisp)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.gridButtonDisp) {
				try {
					this.gridButtonDisp = JSON.parse(option.gridButtonDisp)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.formButtonDisp) {
				try {
					this.formButtonDisp = JSON.parse(option.formButtonDisp)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.hideChildList) {
				this.hideChildList = true
			}
			if (option.disabled) {
				this.disabled = true
			}
			if (option.showMockCount) {
				this.showMockCount = option.showMockCount
			}
			let self = this
			uni.$on('dataChange', srv => {
				self.refresh()
			})
			if (option.grid_span) {
				this.listConfig.grid_span = option.grid_span
			}
			if (option.show_public_btn) {
				this.listConfig.show_public_btn = option.show_public_btn
			}
			if (option.listConfig) {
				try {
					this.listConfig = JSON.parse(decodeURIComponent(option.listConfig))
				} catch (e) {
					//TODO handle the exception
					console.log(e)
					try {
						this.listConfig = JSON.parse(option.listConfig)
					} catch (e) {
						console.log(e)
						//TODO handle the exception
					}
				}
			}
			if (option.customDetailUrl) {
				this.detailType = option.detailType || ''

				let decodeUrl = option.customDetailUrl
				try {
					decodeUrl = decodeURIComponent(decodeUrl)
				} catch (e) {
					//TODO handle the exception
				}
				this.customDetailUrl = decodeUrl
			}
			if (option.listType) {
				this.listType = option.listType
			}
			if (option.selectCol) {
				this.selectCol = option.selectCol
				if (option.selectedVal) {
					this.selectoDataId = option.selectedVal
				}
			}
			if (option.wxMchId) {
				this.wxMchId = option.wxMchId
			}
			if (option.pageType) {
				this.pageType = option.pageType
			}
			if (option.serviceName) {
				this.serviceName = option.serviceName
			}
			if (option.destApp) {
				this.appName = option.destApp
			}
			if (option.appName) {
				this.appName = option.appName
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

			if (option.cond) {
				let cond = option.cond
				try {
					// #ifdef MP-WEIXIN
					cond = JSON.parse(decodeURIComponent(option.cond));
					// #endif
					// #ifdef H5
					cond = JSON.parse(option.cond);
					// #endif
				} catch (e) {
					console.log(e);
					//TODO handle the exception
				}
				if (Array.isArray(cond)) {
					cond.forEach(item => {
						if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
								'glry') && item.value === 'user_no') {
							item.value = uni.getStorageSync('login_user_info').user_no;
						}
						if (item.value === 'top.user.user_no') {
							item.value = uni.getStorageSync('login_user_info').user_no;
						}
					});
					this.condition = cond;
				}
			}

			if (this.serviceName) {
				this.getListV2().then(_ => {
					this.refresh()
				})
			}
		},
		onReachBottom() {
			if (this.loadStatus === 'more') {
				this.pageNo++;
				this.getList(null, this.initCond)
			}
		},
		onShow() {
			if (Array.isArray(this.list) && this.list.length > 0) {
				this.refresh()
			}
		},
		onPullDownRefresh() {
			this.refresh()
			setTimeout(_ => {
				uni.stopPullDownRefresh()
			}, 500)
		}

	}
</script>

<style lang="scss" scoped>
	.page-wrap {
		height: calc(100vh - var(--window-top) + 30px);
		// min-height: calc(100vh - var(--window-top));
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: #F8F8FA;

		.list-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;

			.list-view {
				flex: 1;
				overflow-y: scroll;
			}
		}

		&.pc-model {
			max-width: 1600px;
			// min-width: 1000px;
			margin: 0 auto;
			flex-direction: row;
			padding: 20px;

			.list-wrap {
				padding-top: 0;
			}

			.grid-layout {
				padding-top: 0 !important;
			}

			.filter-tags-view {
				width: 250px;
				background-color: #fff;
				// margin-top: 10px;
			}

			.count-bar-box {
				// .count-bar-box,.search-bar,.filter-tags-view{
				display: none;
			}
		}
	}


	.bottom-button {
		position: fixed;
		bottom: 50px;
		text-align: center;
		width: 100%;

		.cu-btn {
			width: 80%;

		}
	}
</style>
