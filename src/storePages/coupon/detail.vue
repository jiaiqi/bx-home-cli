<template>
	<view class="card-detail-wrap">
		<view class="coupon-item" :style="[style]" @click.stop="clickItem">
			<view class="coupon-item_left">
				<view class="coupon-item-name">
					<text>{{cardInfo.card_name||''}}</text>
				</view>
				<view class="coupon-item-validity margin-tb-sm" v-if="cardInfo.use_start_date&&cardInfo.use_end_date">
					有效期：{{cardInfo.use_start_date||''}}至{{cardInfo.use_end_date||''}}
				</view>
				<view class="coupon-item-no">
					No.{{cardInfo.card_no||''}}
				</view>
			</view>
			<view class="coupon-item_right">
				<view class="num">
					{{getRightTemp(cardInfo).value||'-'}}
				</view>
				<view class="label">
					{{getRightTemp(cardInfo).label||''}}
				</view>
				<view class="right-top-badge" v-if="rightTopBadgeCol&&cardInfo[rightTopBadgeCol]">
					{{cardInfo[rightTopBadgeCol]}}
				</view>
			</view>
		</view>
		<view class="card-detail" v-if="(cardInfo&&['面额卡'].includes(cardInfo.card_type))||cardList&&cardList.length>0">
			<view class="card-detail-title">
				{{cardDetailTitle||''}}
			</view>
			<view class="" v-if="cardInfo&&['面额卡'].includes(cardInfo.card_type)">
				<view class="card-detail-item">
					<view class="top">
						<view class="left">
							面值：<text>{{cardInfo.card_amount||'0'}}</text>
						</view>
						<!-- 		<view class="right">
							已消费：{{cardInfo.goods_name||''}}
						</view> -->
						<view class="right">
							剩余金额：{{cardInfo.card_last_amount||'0'}}
						</view>
					</view>
					<view class="bottom">
						<!-- 	<view class="left">
							赠送金额：{{cardInfo.num}}
						</view> -->
						<!-- 	<view class="right">
							剩余金额：{{cardInfo.card_last_amount||'0'}}
						</view> -->
					</view>
				</view>
			</view>
			<view class="card-detail-list" v-if="cardList&&cardList.length>0">
				<view class="card-detail-item" v-for="(item,index) in cardList" :key="index">
					<view class="top">
						<view class="left">
							商品名称：{{item.goods_name||'0'}}
						</view>
						<view class="right">
							剩余数量：{{item.last_num||'0'}}
						</view>
					</view>
					<view class="bottom">
						<view class="left">
							购买数量：{{item.num||'0'}}
						</view>
						<view class="right">
							已使用数量：{{item.useing_num||'0'}}
						</view>
					</view>
				</view>
			</view>
			<!-- <view class="card-detail-list" style="text-align: center;padding: 20px 10px;background-color: #fff;">
				暂无数据
			</view> -->
		</view>
		<view class="use-record"
			v-if="(cardInfo&&['面额卡','充值卡'].includes(cardInfo.card_type))&&recordList&&recordList.length>0">
			<view class="title">
				<text>消费记录</text>
				<text class="more" @click="toRecordList('consume')">查看全部<text class="cuIcon-right"></text></text>
			</view>
			<view class="use-record-item" v-for="(item,index) in recordList" @click="toDetail(item,'xiaofei')">
				<view class="row">
					<text>类别：{{item.bill_type||'-'}}</text>
					<text>消费金额：{{item.bill_money||'0'}}</text>
				</view>
				<view class="row sm">
					<text>核销时间：{{dayjs(item.create_time).format('YY/MM/DD HH:mm')||''}}</text>
					<text>余额：{{item.after_over_money||'0'}}</text>

				</view>
			</view>
		</view>
		<view class="use-record" v-else-if="recordList&&recordList.length>0">
			<view class="title">
				<text>核销记录</text>
				<!-- v-if="recordPage&&recordPage.total>recordPage.rownumber" -->
				<text class="more" @click="toRecordList">查看全部<text class="cuIcon-right"></text></text>
			</view>
			<view class="use-record-item" v-for="(item,index) in recordList" @click="toDetail(item,'hexiao')">
				<view class="row">
					<text>商品名称：{{item.goods_name||'-'}}</text>
					<text>核销数量：{{item.approval_num||'0'}}</text>
				</view>
				<view class="row sm">
					<text>核销时间：{{dayjs(item.create_time).format('YY/MM/DD HH:mm')||''}}</text>
				</view>
			</view>
		</view>


		<view class="bottom-btn"
			v-if="cardInfo&&['套餐卡','提货卡'].includes(cardInfo.card_type)&&cardInfo.use_states==='使用中'">
			<button class="cu-btn bg-blue shadow-blur lg round" @click="toHexiao">核销</button>
		</view>
		<view class="bottom-btn" v-else-if="cardInfo.use_states==='未激活'">
			<button class="cu-btn bg-blue shadow-blur lg round" :data-item="cardInfo"
				:open-type="btn.type&&btn.type==='shareCoupon'?'share':''" v-for="btn in buttons" :key="btn.name"
				v-show="isShowBtn(cardInfo,btn)" @click.stop="onBtnClick(cardInfo,btn)">{{btn.name||''}}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				idCol: "",
				idVal: "",
				serviceName: "",
				appName: "",
				cardInfo: {},
				cardList: [],
				cond: [],
				style: {},
				rightTemp: {},
				rightTopBadgeCol: "",
				recordList: [], //核销记录
				consumeList: [], //消费记录
				recordPage: {},
				buttons: []
			}
		},
		computed: {
			cardDetailTitle() {
				let res = ''
				switch (this.cardInfo?.card_type) {
					case '提货卡':
						res = '权益清单'
						break;
					case '套餐卡':
						res = '套餐内容'
						break;
					case '面额卡':
						res = '权益清单'
						break;
					case '充值卡':
						res = '权益清单'
						break;
				}
				return res
			}
		},
		methods: {
			toDetail(data, type) {
				// 
				let url =''
				if(type==='xiaofei'){
					// 消费记录详情
				url = 	`/publicPages/detail/detail?serviceName=srvhealth_store_card_recharge_detail_select&fieldsCond=[{\"column\":\"id\",\"value\":${data.id},\"display\":false}]&appName=health&disabled=true`
			
				}else if(type==='hexiao'){
					// 核销记录详情
					url = `/publicPages/detail/detail?serviceName=srvhealth_store_package_approval_select&fieldsCond=[{\"column\":\"id\",\"value\":${data.id},\"display\":false}]&appName=health&disabled=true`
				}
				if(data.order_no){
					url = `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo?.store_no}&order_no=${data.order_no}&disabled=true`
         
				}
				if(url){
					uni.navigateTo({
						url
					})
				}
			},
			onBtnClick(rowData, btn) {
				rowData = rowData || this.cardInfo
				if (btn?.servcie_type === 'update') {
					let service = btn.service
					let operate_params = btn.operate_params;
					if (operate_params && typeof operate_params === 'object') {
						// 序列化操作参数
						try {
							if (Array.isArray(operate_params?.condition) && operate_params.condition
								.length > 0) {
								operate_params.condition.forEach(cond => {
									if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
										cond.value = rowData[cond.value.value_key];
									} else if (typeof cond.value === 'object' && cond.value.value_type ===
										'constant') {
										cond.value = cond.value.value;
									} else if (typeof cond.value === 'object' && cond.value.value_type ===
										'globalVariable') {
										// 全局变量
										const globalVariable = {
											data: rowData,
											storeUser: this.vstoreUser,
											loginUser: this.vloginUser,
											userInfo: this.userInfo,
											storeInfo: this.storeInfo
										}
										cond.value = this.renderStr(cond.value.value_key, globalVariable)
									}
								});
							}
							if (Array.isArray(operate_params?.data) && operate_params.data.length >
								0) {
								operate_params.data.forEach(data => {
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
					if (service) {
						let req = [{
							serviceName: service,
							condition: operate_params.condition,
							data: operate_params.data
						}];

						if (!operate_params.data && servcie_type === 'update') {
							uni.showModal({
								title: '提示',
								content: '按钮操作参数配置有误',
								showCancel: false
							})
							return
						}
						let app = this.appName || uni.getStorageSync('activeApp');
						let url = this.getServiceUrl(btn?.app || app, service,
							btn.servcie_type);
						uni.showModal({
							title: '提示',
							content: '是否确认操作?',
							success: (res) => {
								if (res.confirm) {
									this.$http.post(url, req).then(res => {
										if (res.data.state === 'SUCCESS') {
											this.refresh()
											uni.$emit('refreshCoupon')
										} else if (res.data.resultMessage) {
											uni.showModal({
												title: res.data.resultMessage,
												showCancel: false
											})
										}
									})
								}
							}
						})
					}
				}
			},
			isShowBtn(item, btn) {
				if (!btn?.disp_cond) {
					return true
				} else {
					if (Array.isArray(btn?.disp_cond) && btn?.disp_cond.length > 0) {
						let valid = 0;
						btn.disp_cond.forEach(cond => {
							if (cond.ruleType === 'eq') {
								if (item[cond.colName] === cond.value) {
									valid++
								}
							} else if (cond.ruleType === 'ne') {
								if (item[cond.colName] !== cond.value) {
									valid++
								}
							}
						})
						if (valid === btn.disp_cond.length) {
							return true
						} else {
							return false
						}
					}
				}
				return true
			},
			toRecordList(e) {
				let cond = [{
					"colName": "card_no",
					"ruleType": "eq",
					"value": this.cardInfo.card_no
				}]
				let listConfig = {
					btn_cfg: {
						show_custom_btn: false,
						show_public_btn: false
					}
				}
				let serviceName = 'srvhealth_store_package_approval_select'
				if (['面额卡', '充值卡'].includes(this.cardInfo.card_type)) {
					serviceName = 'srvhealth_store_card_recharge_detail_select'
				}
				let url =
					`/publicPages/list2/list2?serviceName=${serviceName}&destApp=health&disabled=true&cond=${JSON.stringify(cond)}&listConfig=${JSON.stringify(listConfig)}`
				uni.navigateTo({
					url
				})
			},
			getRightTemp(item) {
				let res = {
					label: '',
					value: ''
				}
				const cfg = this.rightTemp;
				if (cfg && typeof cfg === 'object') {
					if (cfg?.relation_col && cfg?.col_map) {
						let val = item[cfg?.relation_col]
						if (cfg?.col_map[val]) {
							res.label = cfg?.col_map[val]?.label
							res.value = item[cfg?.col_map[val]?.col]
							if (res.value === 0) {
								res.value = '0'
							}
						}
					}
				}
				return res
			},
			toHexiao() {
				// 跳转到核销页面
				let cond = [{
					"colName": "card_no",
					"ruleType": "eq",
					"value": this.cardInfo.card_no
				}]
				let uuid = uni.$u.guid()
				let url =
					`/storePages/verification/verification?serviceName=srvhealth_store_card_case_detail_select&listType=selectorList&cond=${JSON.stringify(cond)}&idCol=card_case_detail_no&uuid=${uuid}&disabled=true&card_no=${this.cardInfo.card_no}`
				uni.$on(uuid, () => {
					this.getDetail()
					uni.$off(uuid)
				})
				uni.navigateTo({
					url
				})
			},
			async getRecord() {
				// 核销记录
				let serviceName = 'srvhealth_store_package_approval_select';
				if (['面额卡', '充值卡'].includes(this.cardInfo.card_type)) {
					serviceName = 'srvhealth_store_card_recharge_detail_select'
				}
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [{
						"colName": "card_no",
						"ruleType": "eq",
						"value": this.cardInfo.card_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 5
					},
					"order": [],
				}
				let res = await this.$http.post(url, req)
				if (Array.isArray(res.data.data)) {
					this.recordList = res.data.data
				}
				if (res.data?.page?.total) {
					this.recordPage = res.data.page
				}
			},
			async getList() {
				let serviceName = 'srvhealth_store_card_case_detail_select';
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					"serviceName": "srvhealth_store_card_case_detail_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "card_no",
						"ruleType": "eq",
						"value": this.cardInfo.card_no
					}],
					"relation_condition": {},
					"page": {
						"pageNo": 1,
						"rownumber": 10
					},
					"order": [],
					"query_source": "list_page"
				}
				let res = await this.$http.post(url, req)
				if (Array.isArray(res.data.data)) {
					this.cardList = res.data.data
				}
			},
			async getDetail() {
				let serviceName = this.serviceName;
				let app = this.appName || uni.getStorageSync('activeApp');
				let url = this.getServiceUrl(app, serviceName, 'select');
				let req = {
					"serviceName": "srvhealth_store_card_case_select",
					"colNames": ["*"],
					"condition": this.cond,
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
					"order": [],
				}
				let res = await this.$http.post(url, req)
				if (Array.isArray(res.data.data) && res.data.data.length > 0) {
					this.cardInfo = res.data.data[0]
					this.getList()
					this.getRecord()
				}
			},
			refresh() {
				this.getDetail()
			},
		},
		onShow() {
			// this.refresh()
			this.getDetail()
		},
		onPullDownRefresh() {
			this.refresh()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		async onLoad(option) {
      // #ifdef MP-WEIXIN
      await this.initApp()
      //#endif
			if (option.appName) {
				this.appName = option.appName

			}
			if (option.buttons) {
				try {
					this.buttons = JSON.parse(option.buttons)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.rightTopBadgeCol) {
				this.rightTopBadgeCol = option.rightTopBadgeCol

			}
			if (option.cond) {
				try {
					this.cond = JSON.parse(option.cond)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.style) {
				try {
					this.style = JSON.parse(option.style)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.rightTemp) {
				try {
					this.rightTemp = JSON.parse(option.rightTemp)
				} catch (e) {
					//TODO handle the exception
				}
			}
			if (option.serviceName) {
				this.serviceName = option.serviceName
			}
			this.getDetail()
		},
		onShareAppMessage(e) {
			let title = `收到一张好友赠送的${this.cardInfo?.card_name||'卡券'}，快来打开小程序领取吧！`;
			let storeNo = this.storeInfo?.store_no
			let shareUserNo = this.vstoreUser?.store_user_no;
			let cardNo = ''
			if (e.target?.dataset?.item) {
				let data = e.target?.dataset?.item;
				cardNo = data?.card_no
			} else {
				return
			}
			// let imageUrl = this.getImagePath(this.storeInfo?.image, true);
			let url =
				`storePages/home/home?store_no=${storeNo}&shareStoreUserNo=${shareUserNo}&cardNo=${cardNo}&invite_user_no=${this.userInfo.userno}`;
			if (cardNo) {
				url += `&share_type=shareCoupon`
			}
      title = this.renderEmoji(title)
			return {
				path: url,
				title: title
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card-detail-wrap {
		padding: 10px;
	}

	.coupon-item {
		padding: 15px;
		border-radius: 10px;
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
		min-height: 100px;
		width: 100%;

		.coupon-item-name {
			font-size: 18px;
			vertical-align: middle;
			margin-bottom: 5px;
			display: flex;
		}

		.coupon-item_right {
			position: relative;
			width: 120px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			.radio-box {
				position: absolute;
				top: -10px;
				right: -10px;
				// ::v-deep .uni-radio::before, uni-checkbox::before{
				// 	color: transparent!important;
				// }
			}

			.right-top-badge {
				background: rgba(255, 255, 255, 0.3);
				position: absolute;
				top: -20px;
				right: -60px;
				transform: rotate(45deg);
				padding: 20px 40px 5px;
			}

			&::before {
				content: '';
				position: absolute;
				width: 0px;
				height: 80%;
				top: 10%;
				left: 0;
				// background-color: #fff;
				border-left: 1px dashed #fff;
			}

			.num {
				font-size: 26px;
				margin-bottom: 5px;
			}
		}
	}

	.card-detail {
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid #e5ba62;

		.card-detail-title {
			padding: 10px;
			background-color: #f9eeda;
			font-weight: bold;
			font-size: 16px;
		}

		.card-detail-item {
			background-color: #fff;
			padding: 10px;
			border-bottom: 1px solid #f2f2f6;

			.top,
			.bottom {
				display: flex;
				justify-content: space-between;

				.left {
					text-align: left;
				}

				.right {
					text-align: right;
				}
			}

			.top .right {
				color: #df6360;
				font-size: 12px;
			}

			.bottom {
				font-size: 12px;
				color: #666;

			}
		}
	}

	.bottom-btn {
		position: fixed;
		bottom: 50px;
		left: 10vw;

		.cu-btn {
			width: 80vw;
			margin-bottom: 20px;
		}
	}

	.use-record {
		.title {
			padding: 20px 10px 5px;
			font-size: 16px;
			font-weight: bold;
			display: flex;
			justify-content: space-between;

			.more {
				font-size: 14px;
				font-weight: normal;
			}
		}

		.use-record-item {
			background-color: #fff;
			border-radius: 2px;
			margin-bottom: 1px;
			padding: 5px 10px;

			.row {
				display: flex;
				justify-content: space-between;
				line-height: 25px;

				&.sm {
					font-size: 12px;
					color: #666;
				}
			}
		}
	}
</style>
