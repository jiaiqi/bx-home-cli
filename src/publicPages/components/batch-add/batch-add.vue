<template>
	<view class="cu-modal bottom-modal" :class="{show:show}" @click="close" @touchmove.prevent>
		<view class="cu-dialog" @click.stop="">
			<view class="batch-add">
				<list-bar @change="changeSerchVal" :srvCols="srvCols" :listButton="listButton" @toOrder="toOrder"
					@toFilter="toFilter" @onGridButton="clickGridButton" @clickAddButton="clickAddButton"
					@search="toSearch" v-if="showSearchBar">
				</list-bar>
				<view class="add-box">
					<view class="add-item-box">
						<view class="add-item" v-for="(item,index) in list">
							<view class="content" :class="{active:item.selected}" @click="clickItem(item,index)">
								<image :src="getImagePath(item[params.imgCol])" mode="aspectFit"
									v-if="params&&params.imgCol&&item[params.imgCol]" class="image"></image>
								<view class="image" v-else-if="params&&params.imgCol&&!item[params.imgCol]">
									<text class="cuIcon-pic"></text>
								</view>
								<view class="label" v-if="key_disp_col">
									{{item[key_disp_col]}}
								</view>
							</view>
							<view class="number-box" v-if="params&&params.numCol">
								<u-number-box :input-width="30" :index="index" :input-height="40" :positive-integer="false" :min="0"
									:step="1" :value="item[params.numCol]" @change="numberChange"></u-number-box>
							</view>
						</view>
					</view>
				</view>
				<view class="button-box">
					<button class="cu-btn bg-grey" @click="close">取消</button>
					<button class="cu-btn bg-blue" @click="submit">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import listBar from '@/publicPages/components/list-bar/list-bar.vue'
	// import bxList from '@/publicPages/list/list.vue'
	export default {
		components: {
			// bxList
			listBar
		},
		data() {
			return {
				show: false,
				params: null,
				pageNo: 1,
				showSearchBar: false,
				searchVal: "",
				list: [],
				listV2Data: null,
				orderCols: [],
				order: null,
				cond: null,
				relation_condition: null,
				listButton: [{
					"page_type": "列表",
					"button_name": "查询",
					"button_type": "select",
					"service_name": "srvhealth_store_order_select",
					"service_view_name": "店铺订单查询",
					"always_show": false,
					"id": 2,
					"icon": "cuIcon-filter",
				}, {
					"page_type": "列表",
					"button_name": "添加",
					"button_type": "add",
					"service_name": "srvhealth_store_order_add",
					"service_view_name": "店铺订单增加",
					"id": 3,
					"seq": 300,
					"icon": "cuIcon-add"
				}, {
					"button_type": "order",
					"icon": "cuIcon-order",
					"label": "排序"
				}]
			}
		},
		props: {
			selectColInfo:{
				type: Object
			},
			mainData: {
				type: Object
			},
		},
		computed: {
			propListTop() {
				return 100
			},
			key_disp_col() {
				return this.params?.column_option_list_v2?.key_disp_col
			},
			option() {
				return this?.params?.column_option_list_v2
			},
			srvCols() {
				return this.listV2Data?._fieldInfo
			},
		},
		methods: {
	
			clickAddButton(item) {
				if (this.pageType === 'proc') {
					// this.publicButton.map(item => {
					if (item.button_type === 'add' || item.button_type === 'apply') {
						uni.navigateTo({
							url: '/pages/public/proc/apply/apply?serviceName=' + item.service_name +
								'&cond=' + decodeURIComponent(JSON.stringify(this.condition))
						});
					}
					// });
				} else {
					// this.publicButton.map(item => {
					if (item.button_type === 'add') {
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
						if (item.service_name.indexOf('health_plan_schedule') !== -1) {
							if (fieldsCond.find(item => item.column === 'sdr_no')) {
								fieldsCond.push({
									column: 'play_srv',
									value: '大夫开药',
									display: false
								});
							}
							if (this.patientInfo && this.patientInfo.no) {
								fieldsCond.push({
									column: 'owner_person_no',
									value: this.patientInfo.no,
									display: false
								});
							}
							if (this.doctorInfo && this.doctorInfo.no) {
								fieldsCond.push({
									column: 'create_manager_no',
									value: this.doctorInfo.no,
									display: false
								});
							}
						} else if (item.service_name === 'srvhealth_drug_schedule_doctor_detail_list_add') {
							let ds_no = this.condition.find(item => item.colName === 'ds_no');
							if (ds_no && ds_no.value) {
								let url =
									`/archivesPages/DrugSelect/DrugSelect?ds_no=${ds_no.value}&type=大夫开药&service_name=${item.service_name}`;
								uni.navigateTo({
									url: url
								});
							}
							return;
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
					// });
				}
			},
			submit() {
				let list = this.deepClone(this.list)
        let option = this.deepClone(this.option)
				let arr = list.filter(item => item.selected).map(item => {
					let obj = {
						[this.option.refed_col]: item[this.option.refed_col],
						[this.option.key_disp_col]: item[this.option.key_disp_col],
					}
					if (this.params?.numCol) {
						obj[this.params.numCol] = item[this.params.numCol]
					}
					return item
				})
				this.list = this.list.map(item => {
					item.selected = false
					if (this.params?.numCol) {
						item[this.params.numCol] = 1
					}
					return item
				})
				this.$emit('submit', arr)
			},
			numberChange(e){
				// debugger
				console.log(e)
				let { value,index} = e
				let item = this.list[index]
				if(value===0){
					item.selected = false
				}else{
					item.selected = true
				}
				item[this.params.numCol] = value
				this.$set(this.list, index, item)
			},
			clickItem(item, index) {
				item.selected = !item.selected
				if(!item[this.params.numCol]){
					item[this.params.numCol] = 1
				}
				this.$set(this.list, index, item)
			},
			async getListV2() {
				let app = this.params?.appName || uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.option.serviceName, 'list', 'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				if (colVs.more_config) {
					try {
						colVs.moreConfig = JSON.parse(colVs.more_config)
					} catch (e) {
						//TODO handle the exception
						console.info(e)
					}
				}
				this.listV2Data = colVs;
				
				// this.listButton = 
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
			toOrder(e) {
				this.order = e
				this.getList()
			},
			toFilter(e) {
				this.cond = e
				this.getList()

			},
			toSearch(e) {
				this.searchVal = e
				this.getList()
			},
			changeSerchVal(e) {
				this.searchVal = e
			},
			getList(e = {}) {
				let {
					cond,
					order
				} = e
				if (this.option?.serviceName) {
					const app = this.params?.appName || uni.getStorageSync('activeApp')
					const url = this.getServiceUrl(app, this.option.serviceName, 'select');
					const req = {
						"serviceName": this.option.serviceName,
						"colNames": ["*"],
						condition:[],
						"page": {
							"pageNo": this.pageNo,
							"rownumber": 20
						}
					}
					if (Array.isArray(this.cond) && this.cond.length > 0) {
						req.condition = this.cond
					}
					if(Array.isArray(this.selectColInfo?.option_list_v2?.conditions)&&this.selectColInfo.option_list_v2.conditions.length>0){
						this.selectColInfo.option_list_v2.conditions.forEach(item=>{
							req.condition.push(item)
						})
					}
					
					if (this.searchVal) {
						let cond = this.srvCols.map(item => {
							let obj = {
								colName: item.columns,
								ruleType: 'like',
								value: this.searchVal
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
							if (Array.isArray(this.cond) && this.cond.length > 0) {
								req.relation_condition.data.push({
									"relation": "AND",
									data: this.cond
								})
							}
							delete req.condition
						}
					}
					if (Array.isArray(this.order) && this.order.length > 0) {
						req.order = this.order
					}
					this.$http.post(url, req).then(res => {
						if (res.data.state === 'SUCCESS') {
							this.list = res.data.data.map(item => {
								item.selected = false
								if (this.params?.numCol) {
									item[this.params.numCol] = 1
								}
								return item
							})
						}
					})
				}
			},
			open(e, info) {
				this.params = e
				this.show = true
				if (!this.listV2Data) {
					this.getListV2()
				}
				this.getList()
			},
			close() {
				this.show = false
				this.params = null
			}
		}
	}
</script>

<style lang="scss" scoped>
	.batch-add {
		height: 90vh;
		overflow-y: scroll;
		display: flex;
		flex-direction: column;

		// .list-box {
		// 	flex: 1;
		// 	overflow: hidden;
		// }

		.button-box {
			height: 100rpx;
			text-align: center;
			background-color: #fff;
			margin-bottom: 0;

			.cu-btn {
				width: 45%;
			}
		}

		.add-box {
			padding: 20rpx;
			display: flex;
			overflow-y: scroll;
			flex: 1;
			flex-direction: column;

			.add-item-box {
				display: inline-flex;
				flex-wrap: wrap;

			}

			.add-item {
				width: calc(25% - 10rpx);
				margin-bottom: 20rpx;
				margin-right: 10rpx;
				padding-bottom: 20rpx;
				overflow: hidden;
				background-color: #fff;
				display: flex;
				flex-direction: column;
				// border-bottom: 1px solid #fff;
				box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

				.content {
					flex: 1;
					border-radius: 10rpx;
					border: 1px solid #fff;
					margin-bottom: 10rpx;
					overflow: hidden;

					&:active {
						transition: all 0.5s ease;
						transform: scale(1.1);
					}
				}


				.active {
					border-color: #0BC99D;
					color: #0BC99D;
					background-color: rgba($color: #0BC99D, $alpha: 0.1);
				}

				.image {
					width: 100%;
					height: 100rpx;
					line-height: 100rpx;
					text-align: center;
					font-size: 40rpx;
				}

				.label {
					padding: 10rpx;
					word-break: break-all;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					/**指定行数*/
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			}
		}
	}
</style>
