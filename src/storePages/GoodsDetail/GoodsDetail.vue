<template>
	<view>
		<swiper class="screen-swiper main-image square-dot" easing-function="linear" :indicator-dots="true"
			:circular="true" :autoplay="true" interval="5000" duration="500" @change="swiperChange"
			:style="{ height: imgHeight ? imgHeight + 'px' : '' }">
			<swiper-item v-for="(item, index) in swiperList" :key="item.url">
				<video :src="item.url" controls v-if="item.file_type === '视频' && current === index"
					:id="item.store_video_file" :poster="item.videoPoster" @click.stop=""></video>
				<image :src="item.url" :lazy-load="true" mode="aspectFill" @click.stop="toPreviewImage(item.url)"
					v-else-if="!item.store_video_file || item.file_type !== '视频'"></image>
			</swiper-item>
		</swiper>

		<view class="goods-info">
			<view class="goods-name">{{ goodsInfo.goods_name || '' }}</view>
			<view class="handler-bar margin-top-xs">
				<view class="price text-red  margin-right" v-if="showPrice && fill2Digit(goodsInfo.price)">
					<text class="symbol">￥</text>
					<text class="number" v-if="fill2Digit(goodsInfo.price)">
						<text class="int">{{ fill2Digit(goodsInfo.price)[0] }}.</text>
						<text class="float">{{ fill2Digit(goodsInfo.price)[1] }}</text>
					</text>
				</view>
				<view class="number-box" v-if="inCartGoodsInfo && inCartGoodsInfo.goods_amount">
					<view class="cu-btn sm radius cart-handler" @click.stop="del">-</view>
					<view class="goods-amount flex-1 text-center"
						style="width: 50px;text-align: center;font-size: 16px;">{{ inCartGoodsInfo.goods_amount || '' }}
					</view>
					<view class=" cu-btn sm radius cart-handler" @click.stop="add">+</view>
				</view>
			</view>
		</view>
		<view class="desc" v-if="goodsInfo.goods_desc">
			<view class="title">简介</view>
			<view class="">{{ goodsInfo.goods_desc || '' }}</view>
		</view>
		<view class="store-info" v-if="storeInfo && storeInfo.store_no" @click="toStoreHome">
			<image :src="getImagePath(storeInfo.logo, true)" class="store-icon"></image>
			<view class="store-name">{{ storeInfo.name || '' }}</view>
			<view class="phoneCall" v-if="phone" @click.stop="phoneCall"><text class="cuIcon-phone text-cyan"></text>
			</view>
		</view>
		<view class="detail">
			<view class="title">图文详情</view>
			<view class="image-box">
				<image :lazy-load="true" :src="item.url" mode="aspectFill" :style="{
						width: item.imgWidth + 'px',
						height: item.imgHeight + 'px'
					}" v-for="item in goodsDetailImage" :key="item.url" @click="toPreviewImage(item.url)"></image>
			</view>
		</view>
		<view class="cu-bar foot bottom bg-white tabbar border shop" v-if="scene !== 1154">
			<view class="right-btn bg-cyan" v-if="moreConfig && moreConfig.button_list">
				<button class="cu-btn bg-cyan  shadow-blur" @click="payOrder(item)"
					v-for="(item,index) in moreConfig.button_list" :key="index">
					<text>{{ item.button_name }}</text>
				</button>
			</view>
			<view class="right-btn bg-cyan" v-else-if="!hideButton">
				<button class="cu-btn bg-cyan  shadow-blur" @click="payOrder">
					<text v-if="moreConfig && moreConfig.button_name">{{ moreConfig.button_name }}</text>
					<text v-else>立即购买</text>
				</button>
			</view>
		</view>
		<!-- <view class="cu-bar foot bottom bg-white tabbar border shop" v-else>
			<view class="right-btn"><button class="cu-btn text-center shadow-blur">点击下方【前往小程序】按钮进行操作</button></view>
		</view> -->
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				current: 0,
				videoContext: {},
				// storeInfo: {},
				goodsInfo: {},
				swiperList: [],
				goodsDetailImage: [],
				phone: '',
				wxMchId: '',
				storeNo: '',
				serviceName: '',
				destApp: '',
				hideButton: false,
				imgHeight: 0,
				cartList: [],
				onHandler: false
			};
		},
		computed: {
			inCartGoodsInfo() {
				if (this.storeInfo?.store_no && Array.isArray(this.cartList) && this.goodsInfo.goods_no) {
					let cartList = this.cartList;
					if (Array.isArray(cartList)) {
						let goodsInfo = cartList.find(item => item.goods_no === this.goodsInfo.goods_no);
						if (goodsInfo) {
							return goodsInfo;
						}
					}
				}
			},
			showPrice() {
				return this.moreConfig?.show_price === false ? false : true;
			},
			moreConfig() {
				if (this.goodsInfo?.more_config) {
					let result = '';
					try {
						result = JSON.parse(this.goodsInfo.more_config);
					} catch (e) {
						//TODO handle the exception
					}
					return result;
				}
			},
			...mapState({
				cartInfo: state => state.order.cartInfo,
				userInfo: state => state.user.userInfo
			})
		},
		methods: {
			toStoreHome() {
				if (this.storeInfo?.store_no) {
					uni.navigateTo({
						url: `/storePages/home/home?store_no=${this.storeInfo.store_no}`
					})
				}

			},
			getCartList() {
				let req = {
					serviceName: 'srvhealth_store_my_shopping_cart_goods_detail_select',
					colNames: ['*'],
					condition: [{
							colName: 'store_no',
							ruleType: 'eq',
							value: this.storeInfo?.store_no
						},
						{
							colName: 'store_user_no',
							ruleType: 'eq',
							value: this.vstoreUser?.store_user_no
						}
					],
					page: {
						rownumber: 200,
						pageNo: 1
					}
				};
				let url = this.getServiceUrl('health', 'srvhealth_store_my_shopping_cart_goods_detail_select', 'select');
				this.$http.post(url, req).then(res => {
					if (res.data.state === 'SUCCESS') {
						this.cartList = res.data.data;
					}
				});
			},
			swiperChange(e) {
				if (this.videoContext.parse) {
					this.videoContext.parse();
				}
				this.current = e.detail.current;
				if (this.swiperList[this.current].file_type === '视频') {
					this.videoContext = uni.createVideoContext(this.swiperList[this.current].store_video_file, this);
				}
			},
			async getStoreInfo() {
				let req = {
					condition: [{
						colName: 'store_no',
						ruleType: 'eq',
						value: this.storeNo
					}],
					page: {
						pageNo: 1,
						rownumber: 1
					}
				};
				let service = 'srvhealth_store_list_select';
				let app = 'health';
				let res = await this.$fetch('select', service, req, app);
				if (Array.isArray(res.data) && res.data.length > 0) {
					// this.storeInfo = res.data[0];
					this.$store.commit('SET_STORE_INFO', res.data[0]);
					if (this.storeInfo.type === '健康服务') {}
				} else {
					uni.showModal({
						title: '未查找到机构信息',
						content: `${res ? JSON.stringify(res) : ''}  storeNo为${this.storeNo}`,
						showCancel: false
					});
				}
			},
			phoneCall() {
				uni.makePhoneCall({
					phoneNumber: this.phone || '10086' //仅为示例
				});
			},

			async getCartDetail(cart_no, goods_no) {
				let service = 'srvhealth_store_shopping_cart_goods_detail_select';
				let req = {
					serviceName: service,
					colNames: ['*'],
					condition: [{
						colName: 'cart_no',
						ruleType: 'eq',
						value: cart_no
					}],
					page: {
						pageNo: 1,
						rownumber: 99
					}
				};
				if (goods_no) {
					req.condition = [{
						colName: 'goods_no',
						ruleType: 'eq',
						value: goods_no
					}];
				}
				if (this.vstoreUser?.store_user_no) {
					req.condition.push({
						colName: 'store_user_no',
						ruleType: 'eq',
						value: this.vstoreUser?.store_user_no
					});
				}
				let res = await this.$fetch('select', service, req, 'health');
				if (Array.isArray(res.data) && res.data.length > 0) {
					if (goods_no) {
						return res.data[0];
					}
					return res.data;
				}
			},
			async addToCart(goods) {
				if (goods?.goods_no) {
					let goodsInfo = await this.getCartDetail(null, goods.goods_no);
					if (goodsInfo?.goods_no) {
						goodsInfo.goods_amount++;
						this.updateCart(goodsInfo);
					} else {
						goodsInfo = goods;
						let service = 'srvhealth_store_shopping_cart_goods_detail_add';
						let req = [{
							serviceName: service,
							condition: [],
							data: [{
								store_user_no: this.vstoreUser?.store_user_no,
								store_no: this.storeNo,
								unit_price: goods.price,
								goods_amount: 1,
								goods_no: goods.goods_no,
								sum_price: goods.price,
								goods_desc: goods.goods_desc,
								goods_image: goods.goods_img,
								goods_name: goods.goods_name
							}]
						}];
						let res = await this.$fetch('operate', service, req, 'health');
						if (res.success) {
							this.getCartList();
							uni.showToast({
								title: '添加成功'
							});
						}
					}
				}
				return;
			},
			async updateCart(goodsInfo) {
				let serviceName = 'srvhealth_store_shopping_cart_goods_detail_update';
				if (goodsInfo?.cart_goods_rec_no) {
					let req = [{
						serviceName: serviceName,
						condition: [{
							colName: 'cart_goods_rec_no',
							ruleType: 'in',
							value: goodsInfo.cart_goods_rec_no
						}],
						data: [{
							goods_amount: goodsInfo.goods_amount
						}]
					}];
					await this.$fetch('update', serviceName, req, 'health').then(res => {
						if (res.success) {
							this.getCartList();
							uni.showToast({
								title: '操作成功'
							});
						}
					});
				}
			},
			payOrder(e) {
				if (this.onHandler === true) {
					return;
				}

				this.onHandler = true;

				let target_url = e?.target_url || this.moreConfig?.target_url;
				if (target_url && target_url !== 'add_to_cart') {
					let storeInfo = this.$store?.state?.app?.storeInfo;
					let bindUserInfo = this.$store?.state?.user?.storeUserInfo;
					let data = {
						...this.$data,
						cartInfo: this.cartInfo,
						userInfo: this.userInfo,
						storeInfo,
						bindUserInfo
					};
					data = this.deepClone(data);
					let url = this.renderStr(target_url, data);
					uni.navigateTo({
						url: url
					});
					this.onHandler = false;
					return;
				}
				let goodsInfo = this.deepClone(this.goodsInfo);
				if (!goodsInfo.goods_image && goodsInfo.goods_img) {
					goodsInfo.goods_image = goodsInfo.goods_img;
				}
				goodsInfo.name = goodsInfo.goods_name;
				goodsInfo.image = goodsInfo.store_image;
				goodsInfo.car_num = 1;
				goodsInfo.unit_price = goodsInfo.price;
				goodsInfo.type = this.storeInfo?.type;

				if (target_url === 'add_to_cart') {
					// 添加到购物车表
					this.addToCart(goodsInfo).then(_ => {
						this.onHandler = false;
					});
					return;
				}

				this.$store.commit('SET_STORE_CART', {
					storeInfo: goodsInfo,
					store_no: goodsInfo.store_no,
					list: [goodsInfo]
				});

				let url =
					`/storePages/payOrder/payOrder?store_no=${goodsInfo.store_no}&goods_info=${encodeURIComponent(JSON.stringify(goodsInfo))}`;

				if (this.wxMchId) {
					url += `&wxMchId=${this.wxMchId}`;
				}

				uni.navigateTo({
					url
				});

				this.onHandler = false;
			},
			async getSwiperList(e) {
				let self = this;
				if (e?.banner_video_config === '子表') {
					let serviceName = 'srvhealth_store_banner_video_select';
					let condition = [{
						colName: 'store_video_product_no',
						ruleType: 'eq',
						value: this.goodsInfo.goods_no
					}];
					let req = {
						serviceName: 'srvhealth_store_banner_video_select',
						colNames: ['*'],
						condition: condition,
						page: {
							pageNo: 1,
							rownumber: 10
						},
						order: [{
							colName: 'seq',
							orderType: 'asc' // asc升序  desc降序
						}]
					};
					let url = this.getServiceUrl('health', serviceName, 'select');
					let res = await this.$http.post(url, req);
					if (Array.isArray(res.data.data) && res.data.data.length > 0) {
						let list = res.data.data
							.filter(item => item.store_video_file)
							.map(item => {
								item.url = this.getImagePath(item.store_video_file, true);
								if (item.file_type === '视频') {
									// item.videoContext = uni.createVideoContext(item.store_video_file,this)
								}
								if (item.video_poster) {
									item.videoPoster = this.getImagePath(item.video_poster, true);
								}
								return item;
							});
						this.swiperList = list;
					} else {}
				} else if (e.goods_img) {
					let firstImage = this.getImagePath(e.goods_img, true);
					uni.getImageInfo({
						src: firstImage,
						success: function(image) {
							let windowWidth = uni.getSystemInfoSync().windowWidth;
							self.imgHeight = (windowWidth * image.height) / image.width;
							// console.log(image.width);
							// console.log(image.height);
						}
					});
					let res = await this.getFilePath(e.goods_img);
					if (Array.isArray(res)) {
						this.swiperList = res.reduce((pre, cur) => {
							if (cur.fileurl) {
								cur.url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
									.getStorageSync('bx_auth_ticket');
							}
							pre.push(cur);
							return pre;
						}, []);
					} else {
						let obj = {
							file_type: '图片',
							url: firstImage
						};
						this.swiperList = [obj];
					}
				}
			},
			async getDetaiImageList(e) {
				if (e.goods_detail_image) {
					let res = await this.getFilePath(e.goods_detail_image);
					if (Array.isArray(res)) {
						this.goodsDetailImage = res.reduce((pre, cur) => {
							if (cur.fileurl) {
								let url = this.$api.getFilePath + cur.fileurl + '&bx_auth_ticket=' + uni
									.getStorageSync('bx_auth_ticket');
								cur.url = url;
								this.getImageInfo({
									url: url
								}).then(picInfo => {
									if (picInfo.w && picInfo.h) {
										let res = this.setPicHeight(picInfo);
										if (res.w && res.h) {
											this.$set(cur, 'imgWidth', res.w);
											this.$set(cur, 'imgHeight', res.h);
										}
									}
								});
							}
							pre.push(cur);
							return pre;
						}, []);
					} else {
						let obj = {
							file_type: '图片',
							url: this.getImagePath(e.goods_detail_image, true)
						};
						this.goodsDetailImage = [obj];
					}
				}
			},
			fill2Digit(val) {
				// 精确到小数点后两位
				if (Number(val).toString() !== 'NaN') {
					return [parseInt(val), val.toFixed(2).slice(-2)];
				} else {
					return false;
				}
			},
			setPicHeight(content) {
				let maxW = uni.upx2px(750);
				content.h = (maxW * content.h) / content.w;
				content.w = maxW;
				return content;
			},
			getGoodsInfo(no) {
				let req = {
					condition: [{
						colName: 'goods_no',
						ruleType: 'eq',
						value: no
					}]
				};
				let service = this.serviceName || 'srvhealth_store_goods_guest_select';
				let app = this.destApp || 'health';
				this.$fetch('select', service, req, app).then(res => {
					if (Array.isArray(res.data) && res.data.length > 0) {
						this.goodsInfo = res.data[0];
						this.getSwiperList(this.goodsInfo);
						this.getDetaiImageList(this.goodsInfo);
					}
				});
			},
			del() {
				if (this.inCartGoodsInfo && this.inCartGoodsInfo.goods_amount > 1) {
					this.inCartGoodsInfo.goods_amount--;
					this.updateCart(this.inCartGoodsInfo);
				}
			},
			add(e) {
				if (this.inCartGoodsInfo && this.inCartGoodsInfo.goods_amount) {
					this.getGoodsStock(this.inCartGoodsInfo).then(res => {
						if (res && res.id) {
							if (res.amount > this.inCartGoodsInfo.goods_amount - 1) {
								this.inCartGoodsInfo.goods_amount++;
								this.updateCart(this.inCartGoodsInfo);
							} else {
								uni.showToast({
									title: '商品库存不足',
									icon: 'none'
								});
							}
						}
					});
				}
			}
		},
		onShareTimeline() {
			let pages = getCurrentPages();
			let path = pages[pages.length - 1]?.$page?.fullPath;
			let query = '';
			if (path && path.indexOf('?') !== -1) {
				query = path.split('?')[1];
			}
			query += '&from=share';
			if (this.userInfo?.userno) {
				query += `&invite_user_no=${this.userInfo?.userno}`;
			}
			if (this.storeInfo?.store_no) {
				query += `&store_no=${this.storeInfo?.store_no}`;
			}
			let title = `【${this.goodsInfo.goods_name}】`;

			this.saveSharerInfo(this.userInfo, ` ${path}&${query}`, 'timeline');
			let imageUrl = '';
			if (this.storeInfo?.logo) {
				imageUrl = this.getImagePath(this.storeInfo.logo, true);
			}
			if (this.goodsInfo?.goods_img) {
				imageUrl = this.getImagePath(this.goodsInfo.goods_img, true);
			}
			return {
				title: title,
				query: query,
				imageUrl: imageUrl
			};
		},
		onShareAppMessage() {
			let pages = getCurrentPages();
			let path = pages[pages.length - 1]?.$page?.fullPath;
			path += '&from=share';
			if (this.userInfo?.userno) {
				path += `&invite_user_no=${this.userInfo?.userno}`;
			}
			if (this.storeInfo?.store_no) {
				path += `&store_no=${this.storeInfo?.store_no}`;
			}

			let title = `【${this.goodsInfo.goods_name}】`;
			let imageUrl = '';
			if (this.storeInfo?.logo) {
				imageUrl = this.getImagePath(this.storeInfo.logo, true);
			}
			if (this.goodsInfo?.goods_img) {
				imageUrl = this.getImagePath(this.goodsInfo.goods_img, true);
			}
			this.saveSharerInfo(this.userInfo, path, 'appMessage');
			return {
				imageUrl: imageUrl,
				title: title,
				path: path
			};
		},
		async onLoad(option) {
			if (option.hideButton) {
				this.hideButton = true;
			}
			if (option.wxMchId) {
				this.wxMchId = option.wxMchId;
			}
			if (option.storeNo) {
				this.storeNo = option.storeNo;
				this.getStoreInfo();
			}
			if (option.store_no) {
				this.storeNo = option.store_no;
				this.getStoreInfo();
			}
			if (option.destApp) {
				this.destApp = option.destApp;
			}
			if (option.serviceName) {
				this.serviceName = option.serviceName;
			}
			if (option.phone) {
				this.phone = option.phone;
			}
			let scene = this.$store?.state?.app?.scene;
			if (scene !== 1154) {
				await this.toAddPage();
			}
			if (option.goods_no) {
				this.getGoodsInfo(option.goods_no);
				this.getCartList();
			}
		}
	};
</script>

<style scoped lang="scss">
	.goods-info {
		font-size: 18px;
		letter-spacing: 2px;
		padding: 20rpx;
		background-color: #fff;
		margin-bottom: 20rpx;

		.handler-bar {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.number-box {
				display: flex;
				align-items: center;
			}
		}
	}

	.store-info {
		margin: 20rpx 0;
		background-color: #fff;
		border-top: 1rpx solid #f1f1f1;
		margin-bottom: 20rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;

		.store-name {
			font-size: 16px;
			font-weight: bold;
			color: #333;
			margin-left: 20rpx;
		}

		.store-icon {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}

		.phoneCall {
			flex: 1;
			font-size: 30px;
			text-align: right;
		}
	}

	.desc {
		color: #aaa;
		padding: 20rpx;
		background-color: #fff;

		.title {
			padding: 10rpx 0;
			border-bottom: 1rpx solid #f1f1f1;
			margin-bottom: 10rpx;
		}
	}

	.detail {
		padding-bottom: 50px;
		background-color: #fff;

		.title {
			border-bottom: 1rpx solid #f1f1f1;
			padding: 20rpx;
		}

		.image-box {
			width: 100%;

			image {
				width: 100%;
			}
		}
	}

	.main-image {
		width: 100%;
		height: 400rpx;
		overflow: hidden;
		transition: height ease 0.1s;
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.right-btn {
		display: flex;
		justify-content: center;
		flex: 1;
		align-items: center;
		// background-color: #1cbbb4;
		height: 100%;

		.cu-btn {
			border-radius: 0;
			text-align: center;
			flex: 1;
			border-left: 1rpx solid #f5f5f5;

			&:first-child {
				border-left: none;
			}
		}
	}

	.price {
		.symbol {
			font-size: 12px;
		}

		.number {
			font-size: 30px;
			margin: 0 5px;

			.float {
				font-size: 14px;
			}
		}
	}
</style>
