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
		<view class="card-detail" v-if="cardList&&cardList.length>0">
			<view class="card-detail-title">
				{{cardDetailTitle||''}}
			</view>
			<view class="card-detail-list">
				<view class="card-detail-item" v-for="(item,index) in cardList" :key="index">
					<view class="top">
						<view class="left">
							商品名称：{{item.goods_name||''}}
						</view>
						<view class="right">
							剩余数量：{{item.goods_name||''}}
						</view>
					</view>
					<view class="bottom">
						<view class="left">
							购买数量：{{item.num}}
						</view>
						<view class="right">
							已使用数量：{{item.num}}
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="use-record">

		</view>

		<view class="bottom-btn" v-if="cardInfo&&['套餐卡','提货卡'].includes(cardInfo.card_type)">
			<button class="cu-btn bg-blue shadow-blur lg round" @click="toHexiao">核销</button>
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
				rightTopBadgeCol: ""
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
						res = '卡券明细'
						break;
				}
				return res
			}
		},
		methods: {
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
					`/storePages/verification/verification?serviceName=srvhealth_store_card_case_detail_select&listType=selectorList&cond=${JSON.stringify(cond)}&idCol=card_case_detail_no&uuid=${uuid}&disabled=true&card_no=${this.cardInfo.card_no}&card_type=${this.cardInfo?.card_type}`
					uni.$on(uuid,()=>{
						this.getDetail()
						uni.$off(uuid)
					})
				uni.navigateTo({
					url
				})
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
				}
			},
		},
		onLoad(option) {
			if (option.appName) {
				this.appName = option.appName

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
			width: 100px;
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
		}
	}
</style>
