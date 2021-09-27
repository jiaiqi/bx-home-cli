<template>
	<view class="swiper-list">
		<view class="home-btn" @click="setHomePage">
			<!-- <view class="home-btn" @click="setHomePage" v-if="pageItem.show_set_home"> -->
			<button class=" cu-btn shadow-blur"
				v-if="userInfo && userInfo.home_store_no !== storeInfo.store_no">
				<text class="cuIcon-home"></text></button>
		</view>
		<swiper class="screen-swiper item-box rectangle-dot" :style="[calcStyle]" easing-function="linear"
			indicator-active-color="#00aaff" :indicator-dots="true" :circular="true" :autoplay="true" interval="5000"
			duration="500" height="300">
			<swiper-item v-for="(item, index) in swiperList" :key="item.url" @click.stop="toPreviewImage(item.url)">
				<image :src="item.url" mode="scaleToFill"></image>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		computed: {
			calcStyle() {
				if (this.pageItem && (this.pageItem.margin || this.pageItem.margin == 0)) {
					return {
						margin: this.pageItem.margin
					}
				}
			},
		},
		props: {
			pageItem: {
				type: Object
			},
			storeInfo: {
				type: Object
			},
			userInfo: {
				type: Object
			}
		},
		data() {
			return {
				swiperList: []
			}
		},
		mounted() {
			this.getSwiperList()
		},
		methods: {
			setHomePage() {
				this.$emit('setHomePage')
			},
			async getSwiperList() {
				let image = this.pageItem && this.pageItem.image_origin === '店铺信息' ? this.storeInfo.image : this
					.pageItem.swiper_image
				if (image) {
					let res = await this.getFilePath(image);
					if (Array.isArray(res)) {
						let swiperList = res.reduce((pre, cur) => {
							if (cur.fileurl) {
								cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
									.getStorageSync('bx_auth_ticket');
							}
							pre.push(cur);
							return pre;
						}, []);
						this.swiperList = swiperList
						return swiperList
					} else {
						return []
					}
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.swiper-list {
		border-radius: 20rpx;
		overflow: hidden;
		position: relative;

		.home-btn {
			position: absolute;
			right: 20rpx;
			top: 20rpx;
			z-index: 10;
			.cu-btn{
				width: 80rpx;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background-color: rgba($color: #000000, $alpha: 0.1);
				// border: 1rpx solid #c2c2c2;
				color: #fff;
				border-radius: 50%;
				font-size: 40rpx;
				margin: 0;
				padding: 0;
			}
			.cuIcon-home {
				
			}
		}
	}
</style>
