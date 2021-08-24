<template>
	<view class="page-wrap">
		<view class="rank-info">
			<text class="rank-badge" v-if="rank">
				No.{{rank}}
			</text>
			<view class="title" v-if="orgInfo">
				{{orgInfo.create_user_disp||orgInfo.create_user||''}}发起的小队
			</view>
			<view class="desc">
				{{pageInfo.total}}人前进{{total}}步
			</view>
		</view>
		<view class="rank-list">
			<view class="rank-item" v-for="(item,index) in actRecord" @click="toDetail(item,index+1)">
				<view class="index">
					{{index+1}}
				</view>
				<view class="profile-box">
					<image :src="item.profile_url" mode="aspectFill" class="profile-image" v-if="item.profile_url">
					</image>
					<image :src="getImagePath(item.org_logo,true)" mode="aspectFill" class="profile-image"
						v-else-if="item.org_logo">
					</image>
					<image mode="aspectFill" class="profile-image" v-else></image>
				</view>
				<view class="rank-content">
					<view class="nick-name">
						{{item.nick_name||item.org_name||'-'}}
					</view>
					<view class="step-count">
						前进{{item.walk_act_steps_sum||0}}步
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
	
		data() {
			return {
				rank: 0,
				org_no: null,
				orgInfo: null,
				actRecord: [],
				total: 0,
				pageInfo: {
					total: 0,
					pageNo: 1,
					rownumber: 20
				}
			}
		},
		methods: {
			getOrgInfo() {
				let url = this.getServiceUrl('bxportal', 'srvportal_org_mgmt_select', 'select')
				let req = {
					"serviceName": "srvportal_org_mgmt_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'org_no',
						ruleType: 'eq',
						value: this.org_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 1
					},
				}
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
						this.orgInfo = res.data.data[0]
						this.getActRecord()
					}
				})
			},
			getActRecord() {
				let url = this.getServiceUrl('bxportal', 'srvportal_act_atd_rcd_select', 'select')
				let req = {
					"serviceName": "srvportal_act_atd_rcd_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'org_no',
						ruleType: 'eq',
						value: this.org_no
					}],
					"page": {
						"pageNo": this.pageInfo.pageNo,
						"rownumber": this.pageInfo.rownumber
					},
					"order": [{
						orderType: 'desc',
						colName: 'walk_act_steps_sum'
					}],
				}
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						this.actRecord = res.data.data
						this.pageInfo.total = res.data?.page?.total || 0
					}
				})
			},
		},
		onLoad(option) {
			if (option.org_no && option.rank) {
				this.rank = option.rank
				this.org_no = option.org_no
				this.getOrgInfo()
			}
			if (option.total) {
				this.total = option.total
			}
		}
	}
</script>

<style scoped lang="scss">
	.page-wrap {
		background-color: #f1f1f1;
		min-height: 100vh;
		padding: 20rpx;
	}

	.rank-info {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 20rpx;
		text-align: center;
		display: flex;
		flex-wrap: wrap;
		.rank-badge{
			background-color:#FFE8AD;
			color: #7A2E05;
			width: auto;
			display: inline-block;
			padding: 10rpx 20rpx;
			margin: 0 auto;
			border-radius: 30rpx;
		}
		.title{
			font-size: 36rpx;
			font-weight: bold;
			padding: 10rpx;
			width: 100%;
		}
		.desc{
			width: 100%;
			text-align: center;
		}
	}
	.rank-list {
		background-color: #fff;
		border-radius: 20rpx;
		margin: 20rpx 0;
		padding: 20rpx 0;
	
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
