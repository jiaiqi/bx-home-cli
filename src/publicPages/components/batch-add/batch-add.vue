<template>
	<view class="cu-modal bottom-modal" :class="{show:show}" @click="close" @touchmove.prevent>
		<view class="cu-dialog" @click.stop="">
			<view class="batch-add">
				<list-bar @change="changeSerchVal" :srvCols="srvCols" :listButton="listButton" @toOrder="toOrder"
					@toFilter="toFilter" @onGridButton="clickGridButton" @clickAddButton="clickAddButton"
					@search="toSearch" v-if="showSearchBar">
				</list-bar>
				<!-- <list-bar @change="changeSerchVal" :listButton="listButton" @search="toSearch"></list-bar> -->
				<view class="add-box">
					<view class="add-item-box" @touchmove.stop>
						<view class="add-item" v-for="(item,index) in list" @click="clickItem(item,index)">
							<view class="content " :class="{active:item.selected}">
								<image :src="getImagePath(item[params.imgCol])" mode="aspectFill"
									v-if="params&&params.imgCol&&item[params.imgCol]" class="image"></image>
								<view class="image" v-else-if="params&&params.imgCol&&!item[params.imgCol]">
									<text class="cuIcon-pic"></text>
								</view>
								<view class="label" v-if="key_disp_col">
									{{item[key_disp_col]}}
								</view>
							</view>
							<view class="number-box" v-if="params&&params.numCol">
								<u-number-box :input-width="30" :input-height="40" :positive-integer="false" :step="1"
									v-model="item[params.numCol]"></u-number-box>
							</view>
						</view>
					</view>
				</view>
				<view class="button-box">
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
				list: [],
				listV2Data: null,
				orderCols: [],
				order: null,
				cond: null,
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
			submit() {
				let arr = this.list.filter(item => item.selected).map(item => {
					let obj = {
						[this.option.refed_col]: item[this.option.refed_col],
						[this.option.key_disp_col]: item[this.option.key_disp_col],
					}
					if (this.params?.numCol) {
						obj[this.params.numCol] = item[this.params.numCol]
					}
					return item
				})
				this.$emit('submit', arr)
			},
			clickItem(item, index) {
				item.selected = !item.selected
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
				this.getList({
					order: e
				})
			},
			toFilter(e) {
				this.cond = e
				this.getList({
					cond: e
				})

			},
			toSearch(e) {

			},
			changeSerchVal() {

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
						"page": {
							"pageNo": this.pageNo,
							"rownumber": 20
						}
					}
					if (Array.isArray(this.cond) && this.cond.length > 0) {
						req.condition = this.cond
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
			open(e) {
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
				margin-bottom: 10rpx;
				margin-right: 10rpx;
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
