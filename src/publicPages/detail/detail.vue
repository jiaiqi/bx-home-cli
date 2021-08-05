<template>
	<view class="detail-wrap">
		<view class="top-card" v-if="appTempColMap&&detail">
			<view class="left-image" v-if="appTempColMap.img">
				<u-image class="u-image" width="200" height="200" v-if="detail[appTempColMap.img]"
					:src="getImagePath(detail[appTempColMap.img],true)" mode="aspectFit"></u-image>
				<u-image class="u-image" v-else width="200" height="200"></u-image>
			</view>
			<view class="top-content">
				<view class="top-title-bar">
					<view class="top-item title" v-if="appTempColMap.title&&detail[appTempColMap.title]">
						<view class="label" v-if="labelMap[appTempColMap.title]">
							{{labelMap[appTempColMap.title]||''}}:
						</view>
						<view class="value">
							{{detail[appTempColMap.title]||''}}
						</view>
					</view>
					<view class="top-item sub-title" v-if="appTempColMap.subTitle&&detail[appTempColMap.subTitle]">
						{{detail[appTempColMap.subTitle]||''}}
					</view>
				</view>
				<view class="top-center">
					<view class="top-item" v-if="appTempColMap.left && detail[appTempColMap.left]">
						<view class="label" v-if="labelMap[appTempColMap.left]">
							{{labelMap[appTempColMap.left]||''}}:
						</view>
						<view class="value">
							{{detail[appTempColMap.left]||''}}
						</view>
					</view>
					<view class="top-item" v-if="appTempColMap.right&&detail[appTempColMap.right]">
						<view class="label" v-if="labelMap[appTempColMap.right]">
							{{labelMap[appTempColMap.right]||''}}:
						</view>
						<view class="value">
							{{detail[appTempColMap.right]||''}}
						</view>
					</view>
				</view>
				<view class="top-footer" v-if="appTempColMap.footer&&detail[appTempColMap.footer]">
					<view class="top-item">
						<view class="label" v-if="labelMap[appTempColMap.footer]">
							{{labelMap[appTempColMap.footer]||''}}:
						</view>
						<view class="value">
							{{detail[appTempColMap.footer]||''}}
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="child-service-box">
			<view class="child-service" v-for="(item,index) in childService" :key="index">
				<child-list :config="item" :appName="appName" :main-data="detail"></child-list>
			</view>
		</view>
		<view class="button-box">
			<button class="cu-btn bg-blue " v-for="(item,index) in publicButton" :key="index" @click="onButton(item)">
				{{item.button_name||''}}
			</button>
		</view>
	</view>
</template>

<script>
	import ChildList from './child-list.vue'
	export default {
		components: {
			ChildList
		},
		data() {
			return {
				serviceName: null,
				fieldsCond: null,
				appName: null,
				v2Data: null,
				orderCols: [],
				detail: null
			}
		},
		computed: {
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
			appTempColMap() {
				// 字段关系映射
				return this.moreConfig?.appTempColMap || {}
			},
			childService() {
				if (Array.isArray(this.v2Data?.child_service)) {
					return this.v2Data.child_service.map(item => {
						if (item?.foreign_key?.section_name) {
							item.label = item.foreign_key.section_name
						}
						return item
					})
				}
				return []
			},
			moreConfig() {
				return this.v2Data?.moreConfig
			},
			srvApp() {
				return this.appName || uni.getStorageSync('activeApp')
			},
			publicButton() {
				if (Array.isArray(this.v2Data?.formButton)) {
					return this.v2Data.formButton.filter(item => item.permission === true)
				} else {
					return []
				}
			}
		},
		methods: {
			async getDetailV2() {
				let app = this.appName || uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.serviceName, 'detail', 'detail', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => {
					if (item.in_detail !== 0) {
						if (item.in_detail === 1) {
							item.display = true
						}
						return true
					}
				})
				if (!this.navigationBarTitle) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				if (colVs.more_config) {
					try {
						colVs.moreConfig = JSON.parse(colVs.more_config)
						delete colVs.more_config
					} catch (e) {
						//TODO handle the exception
						console.info(e)
					}
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
				// this.publicButton = colVs.formButton.filter(item => item.permission === true);
				this.v2Data = colVs;
				this.getDetail()
			},
			async getDetail() {
				const url = this.getServiceUrl(this.srvApp, this.serviceName, 'select')
				const req = {
					"serviceName": this.serviceName,
					"colNames": ["*"],
					"condition": [],
					"vpage_no": this.v2Data.vpage_no
				}
				if (Array.isArray(this.fieldsCond) && this.fieldsCond.length > 0) {
					req.condition = this.fieldsCond.map(item => {
						return {
							colName: item.column,
							ruleType: 'eq',
							value: item.value
						}
					})
				}
				if (!req.condition || !Array.isArray(req.condition) || req.condition.length < 1) {
					return
				}
				const res = await this.$http.post(url, req)
				if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
					this.detail = res.data.data[0]
				}
			},
			async onButton(e) {
				let self = this;
				if (!e) {
					return;
				}
				if (!this.isOnButton) {
					this.isOnButton = true;
				} else {
					uni.showToast({
						title: '正在处理中，请勿重复操作',
						icon: 'none'
					});
					return;
				}
				let req = this.detail || {}
				for (let key in req) {
					if (Array.isArray(req[key])) {
						req[key] = req[key].toString();
					}
				}
				switch (e.button_type) {
					case 'edit':
						if (e.page_type === '详情') {
							let fieldsCond = [{
								column: 'id',
								value: this.detail?.id,
								display: false
							}]
							let url =
								`/publicPages/form/form?destApp=${this.appName}&type=update&serviceName=${e.service_name}&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`;
							if (this.detail?.id) {
								uni.navigateTo({
									url: url
								});
							}
							this.isOnButton = false;
						} else {
							return
						}
						break;
					case 'submit':
						break;
					case 'reset':
						this.$refs.bxForm.onReset();
						this.isOnButton = false;
						break;
					case 'customize':
						if (e.application && e.operate_service) {
							const url = this.getServiceUrl(e.application, e.operate_service, 'operate');
							const req = [{
								data: [e.requestData],
								serviceName: e.operate_service,
								srvApp: e.application
							}];
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								uni.showModal({
									title: '提示',
									content: e.tip_msg ? e.tip_msg : res.data.resultMessage,
									showCancel: false,
									success(res) {
										if (res.confirm) {
											uni.navigateBack();
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
						break;
					default:
						uni.showToast({
							title: e.button_name,
							icon: false
						});
						this.isOnButton = false;
						break;
				}
			},
		},
		onLoad(option) {
			if (option.serviceName) {
				this.serviceName = option.serviceName;
				if (option.appName) {
					this.appName = option.appName
				}
				if (option.destApp) {
					this.appName = option.destApp
				}
				if (option.fieldsCond) {
					try {
						this.fieldsCond = JSON.parse(decodeURIComponent(option.fieldsCond))
					} catch (e) {
						//TODO handle the exception
					}
				}
				this.getDetailV2()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail-wrap {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: calc(100vh - var(--window-top));
	}

	.top-card {
		background-color: #fff;
		display: flex;
		width: 100%;
		margin-bottom: 20rpx;
		border: 1px solid #f1f1f1;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
		align-items: center;
		color: #666;

		.left-image {
			width: 200rpx;
			height: 200rpx;
			text-align: center;
			line-height: 200rpx;

			.u-image {
				width: 200rpx;
				height: 200rpx;
			}
		}

		.top-content {
			padding: 10rpx;
			flex: 1;

			// display: flex;
			// flex-direction: column;
			// justify-content: center;
			.top-title-bar {
				display: flex;

				.title {
					font-size: 32rpx;
					font-weight: bold;

					.label {
						font-weight: normal;
					}
				}
			}

			.top-item {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;

				.label {
					// font-size: 24rpx;
					margin-right: 5rpx;
				}
			}

			.top-center {
				display: flex;
				flex-wrap: wrap;

				.top-item {
					min-width: 45%;
					overflow: auto;
					white-space: nowrap;
					margin-right: 20rpx;
					.value{
						color: #000000;
					}
				}
			}

			.top-footer {
				color: #999;

				.top-item {
					margin-bottom: 0;
				}
			}
		}
	}
</style>
