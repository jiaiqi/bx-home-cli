<template>
	<view class="rank-list">
		<view class="total-count">
			{{pageInfo.total||0}}人正在参与此活动
		</view>
		<view class="rank-item" v-for="(item,index) in rankList">
			<view class="index">
				{{index+1}}
			</view>
			<view class="profile-box">
				<image :src="item.profile_url" mode="aspectFill" class="profile-image" v-if="item.profile_url">
				</image>
				<image mode="aspectFill" class="profile-image" v-else></image>
			</view>
			<view class="rank-content">
				<view class="nick-name">
					{{item.nick_name||'-'}}
				</view>
				<view class="step-count">
					前进{{item.walk_act_steps_sum||0}}步
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		props: {
			act_no:{
				type:String,
				default:''
			},
			type:{
				type:String,
				default:'personal' //personal,group
			},
			total: {
				type: Number,
				default: 0
			},
			// rankList: {
			// 	type: Array,
			// }
		},
		watch: {
			type(newValue, oldValue) {
				if(newValue!==oldValue){
					this.getRankList()
				}
			}
		},
		data() {
			return {
				pageInfo: {
					total:0,
					rownumber:10,
					pageNo:1
				},
				rankList:[]
			}
		},
		mounted() {
			this.getRankList()
		},
		methods: {
			getRankList() {
				let req = {
					"serviceName": "srvportal_act_atd_rcd_select",
					"colNames": ["*"],
					"condition": [{
						"colName": "act_no",
						"ruleType": "eq",
						"value": this.act_no
					}],
					"page": {
						"pageNo": this.pageInfo.pageNo,
						"rownumber": this.pageInfo.rownumber
					},
					"order": [{
						colName: "walk_act_steps_sum",
						orderType: "desc"
					}],
				}
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				this.$http.post(url, req).then(res => {
					if (res.data.state === "SUCCESS" && Array.isArray(res.data.data)) {
						this.rankList = res.data.data
						this.pageInfo = res.data.page
					}
				})
			},
		},
	}
</script>

<style scoped lang="scss">
	.rank-container {
		margin: 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 0 0 20rpx;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

		.rank-tab {
			display: flex;
			background-color: #f7f7f7;

			.rank-title {
				flex: 1;
				text-align: center;
				font-weight: bold;
				padding: 20rpx;

				&.active {
					color: #0bc99d;
					border-radius: 20rpx;
					background-color: #fff;
				}
			}
		}
	}

	.rank-list {
		.total-count {
			text-align: center;
			padding: 20rpx;
			color: #626f76;
		}

		.rank-item {
			display: flex;
			margin-top: 20rpx;

			.index {
				width: 100rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 36rpx;
				font-weight: bold;
			}

			.profile-box {
				width: 100rpx;
				height: 100rpx;
				margin-right: 20rpx;

				.profile-image {
					width: 100%;
					height: 100%;
					border-radius: 50%;
					border: 1rpx solid #f1f1f1;
				}
			}

			.rank-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.nick-name {
					font-weight: bold;
					font-size: 32rpx;
				}

				.step-count {
					color: #666;
					margin-top: 10rpx;
				}
			}
		}
	}
</style>
