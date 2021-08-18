<template>
	<view class="person-info" >
		<view class="profile-box">
			<view class="profile-image">
				<!-- #ifdef MP-WEIXIN -->
				<open-data type="userAvatarUrl"></open-data>
				<!-- #endif -->
			</view>
			<view class="right-box">
				<view class="nick-name">
					<!-- #ifdef MP-WEIXIN -->
					<open-data type="userNickName"></open-data>
					<!-- #endif -->
				</view>
				<view class="today-step">
					今日行走{{todayStep||'0'}}步
				</view>
			</view>
			<view class="right-button" @click="getwxStepInfoList">
				<text class="refresh-btn">
					<text class="cuIcon-refresh"></text>
				</text>
				<text>更新步数</text>
			</view>
		</view>
		<view class="rank-info">
			<view class="rank-item" v-for="item in rankList">
				<view class="label">
					{{item.label}}
				</view>
				<view class="value">
					{{item.value||'-'}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		props: {
			rankList:{
				type:Array
			},
			todayStep: {
				type: Number,
				default: 0
			},
		},
	}
</script>

<style lang="scss" scoped>
.person-info {
		margin: 20rpx;
		padding: 20rpx;
		border-radius: 10rpx;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

		.profile-box {
			display: flex;
			align-items: center;
			padding: 20rpx;
			padding: 0 20rpx 20rpx;

			.profile-image {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				overflow: hidden;
				border: 1rpx solid #09BB07;
			}

			.right-box {
				flex: 1;
				padding-left: 20rpx;

				.nick-name {
					font-weight: bold;
					padding: 10rpx 0;
				}
			}

			.right-button {
				width: 100rpx;
				height: 100rpx;
				font-size: 24rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				color: #09BB07;

				.refresh-btn {
					display: inline-block;
					width: 60rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					background-color: #09BB07;
					border-radius: 50%;
					color: #fff;
					font-size: 40rpx;
					color: #fff;
				}
			}
		}

		.rank-info {
			padding: 20rpx 20rpx 0;
			border-top: 1rpx solid #F1F1F1;
			display: flex;

			.rank-item {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				color: #999;
				flex: 1;

				.value {
					color: #555;
					font-weight: bold;
					font-size: 40rpx;
					margin-top: 10rpx;
				}
			}
		}
	}
</style>
