<template>
	<view>
		<view class="list-box" v-if="idCol&&goodsList.length>0">
			<view class="list-item" v-for="(item,index) in goodsList" :key="index">
				<radio :value="item[idCol]" :checked="item.checked" style="transform:scale(1);margin-right:10px;"
					@click.stop="checkboxChange(item,index)" />
				<view class="item-content">
					<image :src="getImagePath(item.goods_img,true)" mode="aspectFit" class="image"
						v-if="item.goods_img"></image>
					<view class="image" v-else></view>
					<view class="goods-info">
						<view class="">
							商品名称:{{item.goods_name||'-'}}
						</view>
						<view class="foot-box">
							<view class="text">
								剩余次数:{{item.last_num||'-'}}
							</view>
							<view class="">
								<u-number-box v-model="item.selectNum" :min="1" :max="item.last_num||1"></u-number-box>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="bottom-button">
			<button class="cu-btn bg-blue lg round shadow-blur" @click="confirm" :disabled="!hasChecked">确认</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				idCol: "",
				card_no: "",
				card_type: "",
				goodsList: [],
				appName: "health",
				uuid: ""
			}
		},
		computed: {
			hasChecked() {
				return this.goodsList.find(function(item) {
					return item.checked
				})
			}
		},
		methods: {
			async confirm() {
				let goodsList = this.goodsList.filter(item => item.checked)
				if (goodsList && goodsList.length > 0) {
					let orderInfo = await this.addOrder(goodsList)
					let verificationList = await this.addVerRecord(orderInfo)
					await this.addPayRecord(orderInfo)
				}
			},
			async addOrder(goodsList) {
				let req = [{
					serviceName: 'srvhealth_store_order_add',
					condition: [],
					data: [{
						store_no: this.storeInfo?.store_no,
						store_name: this.storeInfo?.name,
						image: this.storeInfo.image,
						type: this.storeInfo.type,
						// rcv_addr_str: this.addressInfo.fullAddress,
						// rcv_name: this.addressInfo.userName,
						// rcv_telephone: this.addressInfo.telNumber,
						person_no: this.userInfo.no,
						person_name: this.userInfo.name,
						user_account: this.userInfo.userno,
						store_user_no: this.vstoreUser?.store_user_no || '',
						nick_name: this.userInfo.nick_name ? this.userInfo.nick_name.replace(
							/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "") : '',
						profile_url: this.userInfo.profile_url,
						user_image: this.userInfo.user_image,
						sex: this.userInfo.sex,
						user_role: this.userInfo.user_role,
						// order_amount: this.totalMoney,
						// order_remark: this.order_remark || '',
						pay_state: '已支付',
						order_state: '待发货',
						child_data_list: [{
							serviceName: 'srvhealth_store_order_goods_detail_add',
							condition: [],
							depend_keys: [{
								type: 'column',
								add_col: 'order_no',
								depend_key: 'order_no'
							}],
							data: goodsList.map(item => {
								let obj = {
									goods_no: item.goods_no,
									goods_amount: item.selectNum || 1,
									goods_desc: item.goods_name,
									store_no: this.storeInfo?.store_no
									// sum_price: item.selectNum * item.unit_price,
									// unit_price: Number(item.price)
								};
								if (item.image) {
									obj.goods_image = item.image;
								}
								if (item.goods_image) {
									obj.goods_image = item.goods_image;
								}
								if (item.goods_img) {
									obj.goods_image = item.goods_img;
								}
								return obj;
							})
						}]
					}]
				}];
				let res = await this.$fetch('operate', 'srvhealth_store_order_add', req, 'health')
				if (res.success && Array.isArray(res.data) && res.data.length > 0) {
					return res.data[0]
				}
			},
			async addVerRecord(orderInfo) {
				// 增加核销记录
				let goodsList = this.goodsList.filter(item => item.checked)
				let serviceName = 'srvhealth_store_package_approval_add'
				let req = [{
					"serviceName": serviceName,
					"condition": [],
					"data": []
				}]
				req[0].data = goodsList.map(item => {
					let obj = {
						"order_goods_no": item.card_case_detail_no,
						"card_no": this.card_no,
						"order_no": orderInfo?.order_no,
						"goods_no": item.goods_no,
						"goods_name": item.goods_name,
						"approval_num": item.selectNum
					}
					return obj
				})
				let res = await this.$fetch('operate', 'srvhealth_store_package_approval_add', req, 'health')
				if (res.success) {
					return res.data
				}
			},
			async addPayRecord(orderInf) {
				let req = [{
					"serviceName": "srvhealth_store_order_payment_detail_add",
					"condition": [],
					"data": [{
						"pay_type": "支付",
						"order_no": orderInf?.order_no,
						"pay_way": this.card_type
					}]
				}]
				let res = await this.$fetch('operate', 'srvhealth_store_order_payment_detail_add', req, 'health')
				if (res.success) {
					uni.showModal({
						title: "提示",
						content: '操作成功',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								if (this.uuid) {
									uni.$emit(this.uuid)
								}
								uni.navigateBack({
									
								})
							}
						}
					})
				}
			},
			checkboxChange(e, i) {
				this.goodsList = this.goodsList.map((item, index) => {
					if (i === index) {
						item.checked = !item.checked
					}
					return item
				})
			},
			getList() {
				let serviceName = 'srvhealth_store_card_case_detail_select';
				let url = this.getServiceUrl(app, serviceName, 'select');
				let app = this.appName || uni.getStorageSync('activeApp');
				let req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
						"colName": "card_no",
						"ruleType": "eq",
						"value": this.card_no
					}],
					"page": {
						"rownumber": 20,
						"pageNo": 1
					},
					"order": [],
				}
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						this.goodsList = res.data.data.map(item => {
							item.checked = false
							item.selectNum = 1
							return item
						})
					}
				})
			},
		},
		onLoad(option) {
			if (option.card_type) {
				this.card_type = option.card_type
			}
			if (option.uuid) {
				this.uuid = option.uuid
			}
			if (option.idCol) {
				this.idCol = option.idCol
			}
			if (option.card_no) {
				this.card_no = option.card_no;
				this.getList()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list-box {
		padding: 10px;
	}

	.list-item {
		background-color: #fff;
		border-radius: 10px;
		margin-bottom: 10px;
		padding: 10px;
		display: flex;
		align-items: center;

		.item-content {
			flex: 1;
			display: flex;

			.image {
				width: 100px;
				height: 80px;
				background-color: #F1F1F1;
				margin-right: 10px;
			}

			.goods-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
			}

			.foot-box {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.text {
					font-size: 12px;
					color: #666;
				}
			}
		}
	}

	.bottom-button {
		text-align: center;
		padding: 20px 0;
		position: fixed;
		bottom: 50px;
		width: 100%;

		.cu-btn {
			width: 80%;
		}
	}
</style>
