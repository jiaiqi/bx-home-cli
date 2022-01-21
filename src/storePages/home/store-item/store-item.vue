<template>
	<view class="store-item" v-if="storeInfo && storeInfo.store_no && pageItem && isShow" :style="itemStyle" :class="{
			'is-swiper': pageItem.type === '轮播图',
			'padding':['疫苗列表'].includes(pageItem.type),
			'bg-transparent': pageItem && ['关联店铺', '通知横幅', '会员卡片', '通用列表', '商品列表'].includes(pageItem.type),
			'noMargin noPadding': pageItem && ['店铺信息2', '通知横幅', '通用列表', '会员卡片'].includes(pageItem.type)
		}">
		<view class="title" :style="titleStyle"
			v-if="pageItem && pageItem.show_label === '是' && pageItem.type !== '通用列表' && pageItem.type !== '疫苗列表'"
			@click="toMore">
			<text>{{ pageItem.component_label || '' }}</text>
			<!-- <view class="cu-btn bg-white" v-if="pageItem.type === '朋友圈'">
        查看更多
        <text class="cuIcon-right"></text>
      </view> -->
		</view>
		<slide-list v-if="pageItem.type === '轮播图'" ref="swiperList" :storeInfo="storeInfo" :userInfo="userInfo"
			@setHomePage="setHomePage" :pageItem="pageItem"></slide-list>
		<store-info :storeInfo="storeInfo" :userInfo="userInfo" :bindUserInfo="bindUserInfo" @bindUser="bindStore"
			v-else-if="pageItem.type === '店铺信息' || pageItem.type === '店铺信息2'" :isBind="isBind" :pageItem="pageItem"
			@setHomePage="setHomePage" @addToStore="addToStore" @toConsult="toConsult" @toSetting="toSetting"
			@getQrcode="getQrcode"></store-info>
		<button-list :pageItem="pageItem" :userInfo="userInfo" :bindUserInfo="bindUserInfo" :storeInfo="storeInfo"
			@addToStore="addToStore" v-else-if="pageItem.type === '按钮组'" ref="buttonGroup"></button-list>
		<goods-list v-else-if="pageItem.type === '商品列表'" :storeNo="storeNo" :storeInfo="storeInfo" image="goods_img"
			name="goods_name" desc="goods_desc" ref="goodsList"></goods-list>
		<vaccine-list :storeInfo="storeInfo" :pageItem="pageItem" v-else-if="pageItem.type === '疫苗列表'"
			ref="vaccineList"></vaccine-list>
		<staff-manage :storeNo="storeNo" :pageItem="pageItem" v-else-if="pageItem.type === '人员列表'"
			@toDoctorDetail="toDoctorDetail" ref="staffList"></staff-manage>
		<news-list :pageItem="pageItem" :website_no="storeInfo && storeInfo.website_no" ref="articleList"
			:article-style="pageItem.article_style" :rownumber="pageItem.row_number" :cateNo="pageItem.category_no"
			:storeInfo="storeInfo" v-else-if="pageItem.type === '文章列表'"></news-list>
		<notice-list v-else-if="pageItem.type === '通知横幅'" ref="noticeList" :storeNo="storeNo" :pageItem="pageItem">
		</notice-list>
		<relation-store v-else-if="pageItem && pageItem.type === '关联店铺'" ref="relationStore" :storeNo="storeNo"
			:pageItem="pageItem"></relation-store>
		<timeline-list :showProfile="false" :profile="userInfo.profile_url" :storeNo="storeNo" noMargin showMore
			:condition="timelinecondition" :limit="3" :showPublish="false"
			v-else-if="storeNo && pageItem && pageItem.type === '朋友圈' && userInfo && userInfo.userno"></timeline-list>
		<link-wifi :store_no="storeNo" v-else-if="storeNo && pageItem && pageItem.type === '连接WiFi' && room_no">
		</link-wifi>
		<bx-list v-else-if="storeNo && pageItem && pageItem.type === '通用列表'" :pageItem="pageItem" class="bx-list" />

		<view class="user-card" v-else-if="storeNo && pageItem && pageItem.type === '用户卡片'">
			<view class="left">
				<view class="profile-image">
					<!-- <open-data type="userAvatarUrl"></open-data> -->
					<image :src="getImagePath(userInfo.profile_url, true)" class="profile-image"></image>
				</view>
				<view class="nick-name">
					<!-- <open-data type="userNickName"></open-data> -->
					<view class="name">{{ userInfo.name || userInfo.nick_name }}</view>
					<!-- <view class="account">账号：{{ userInfo.userno }}</view> -->
				</view>
			</view>
			<view class="right"><text class="cuIcon-message"></text></view>
		</view>
		<vip-card :config="pageItem" v-else-if="storeNo && pageItem && pageItem.type === '会员卡片'"></vip-card>
		<!-- 		<view class="vip-card" v-else-if="storeNo && pageItem && pageItem.type === '会员卡片'">
			<view class="not-vip" @click="toOpenVip">
				<view class="">
					<text class="cuIcon-crownfill text-white"></text>
					<text>开通VIP享受更多权益</text>
				</view>
				<button class="cu-btn bg-white round sm">
					立即开通
					<text class="cuIcon-right"></text>
				</button>
			</view>
			<view class="is-vip"></view>
		</view> -->
		<view class="user-avatar-list padding-sm" v-else-if="storeNo && pageItem && pageItem.type === '用户展示'">
			<view class="cu-avatar-group">
				<view class="cu-avatar round " v-for="(item, index) in avatarList" :key="index"
					:style="[{ backgroundImage: 'url(' + avatarList[index] + ')', 'z-index': avatarList.length - index }]">
				</view>
			</view>
			<view class="share-menu">
				<button class="cu-btn bg-white sm" open-type="share"><text class="text-blue sm">邀请好友</text></button>
			</view>
		</view>
		<!-- 公众号关注组件 -->
		<view class="official-account "
			v-else-if="storeNo && pageItem && pageItem.type === '公众号关注'&&moreConfig&&moreConfig.mp_no">
			<text v-if="moreConfig&&moreConfig.text">{{moreConfig.text}}</text>
			<text v-else> 关注xxx公众号，重要消息不再错过~</text>
			<button class="cu-btn bg-white sm round" style="color: #ee7b77;" @click="toOfficial">立即关注</button>
		</view>
	</view>
</template>

<script>
	import slideList from '../slide-picture/slide-picture.vue';
	import storeInfo from '../store-info/store-info.vue';
	import buttonList from '../button-group/button-group.vue';
	import goodsList from '../goods-list/goods-list.vue';
	import vaccineList from '../vaccine-list/vaccine-list.vue';
	import newsList from '../news-list/news-list.vue';
	import staffManage from '../staff-manage/staff-manage.vue';
	import noticeList from '../notice-list/notice-list.vue';
	import relationStore from '../relation-store/relation-store.vue';
	import timelineList from './timeline-list/timeline-list.vue';
	import linkWifi from '../link-wifi/link-wifi.vue';
	import bxList from '../bx-list/bx-list.vue';
	import vipCard from '../vip-card/vip-card.vue'
	export default {
		components: {
			slideList,
			storeInfo,
			buttonList,
			goodsList,
			vaccineList,
			staffManage,
			newsList,
			noticeList,
			relationStore,
			timelineList,
			linkWifi,
			bxList,
			vipCard
		},
		props: {
			pageItem: {
				type: Object
			},
			bindUserInfo: {
				type: Object
			},
			mainMenuList: {
				type: Array
			},
			goodsListData: {
				type: Array
			},
			isBind: {
				type: Boolean
			}
		},
		watch: {
			pageItem: {
				immediate: true,
				deep: true,
				handler(newValue, oldValue) {
					if (newValue?.type === '用户展示') {
						setTimeout(() => {
							this.getUserList();
						}, 1000)
					}
				}
			}
		},
		computed: {
			moreConfig() {
				return this.pageItem?.more_config
			},
			itemStyle() {
				if (typeof this.pageItem?.more_config === 'object') {
					return this.pageItem?.more_config?.style || '';
				}
			},
			titleStyle() {
				if (typeof this.pageItem?.more_config === 'object') {
					return this.pageItem?.more_config?.titleStyle || '';
				}
			},
			isShow() {
				if (this.pageItem?.type === '连接WiFi') {
					return this.room_no;
				} else {
					return true;
				}
			},
			room_no() {
				let globalData = getApp().globalData;
				return globalData?.room_no;
			},
			storeNo() {
				return this.storeInfo?.store_no;
			},
			timelinecondition() {
				return [{
					colName: 'store_no',
					ruleType: 'eq',
					value: this.storeNo
				}];
			}
		},
		data() {
			return {
				avatarList: []
			};
		},
		created() {
			uni.$on('updateStoreItemData', () => {
				this.onRefresh();
			});
		},
		methods: {
			toOfficial() {
				// 跳转到关注公众号页面
				const frontEndAddress = this.$api.frontEndAddress
				let webUrl =
					`${frontEndAddress}storePages/officialIntro/officialIntro?mp_no=${this.moreConfig?.mp_no}`
				let url =
					`/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(webUrl)}`
				uni.navigateTo({
					url
				})
			},
			getUserList() {
				let serviceName = 'srvhealth_store_user_visitor_select';
				const req = {
					serviceName: 'srvhealth_store_user_visitor_select',
					colNames: ['*'],
					condition: [{
						colName: 'store_no',
						ruleType: 'eq',
						value: this.storeNo
					}],
					page: {
						pageNo: 1,
						rownumber: 8
					},
					order: [],
					draft: false,
					query_source: 'list_page'
				};
				let url = this.getServiceUrl('health', serviceName, 'select');
				this.$http.post(url, req).then(res => {
					if (Array.isArray(res.data.data)) {
						this.avatarList = res.data.data.map(item => {
							if (item.profile_url) {
								return this.getImagePath(item.profile_url, true);
							} else if (item.user_image) {
								return this.getImagePath(item.user_image, true);
							}
						});
					}
				});
			},
			toUserDetail() {
				if (this.pageItem?.more_config?.url) {
					uni.navigateTo({
						url: this.pageItem?.more_config?.url
					});
				}
			},
			// toOpenVip() {
			// 	let url = this.pageItem?.more_config?.open_url
			// 	if (url) {
			// 		url = this.renderStr(url, this)
			// 		uni.navigateTo({
			// 			url: url
			// 		});
			// 	}
			// },
			getQrcode(e) {
				this.$emit('getQrcode', e);
			},
			toSetting() {
				this.$emit('toSetting');
			},
			toMore() {
				// let url = '/otherPages/timeline/timeline'
				// if (this.storeNo) {
				//   url = `${url}?storeNo=${this.storeNo}`
				// }
				// uni.navigateTo({
				//   url
				// })
			},
			setHomePage() {
				this.$emit('setHomePage');
			},
			addToStore() {
				this.$emit('addToStore');
			},
			toConsult() {
				this.$emit('toConsult');
			},
			bindStore() {
				this.$emit('bindStore');
			},
			toDoctorDetail(e) {
				this.$emit('toDoctorDetail', e);
			},

			onRefresh() {
				if (this.pageItem) {
					switch (this.pageItem.type) {
						// case '按钮组':
						//   if (this.$refs.buttonGroup && this.$refs.buttonGroup.getButtons) {
						//     // this.$refs.buttonGroup.buttons = []
						//     this.$refs.buttonGroup.getButtons()
						//   }
						//   break;
						// case '人员列表':
						//   if (this.$refs && this.$refs.staffList && this.$refs.staffList.getStoreUserList) {
						//     this.$refs.staffList.getStoreUserList()
						//   }
						//   break;
						case '文章列表':
							if (this.$refs && this.$refs.articleList && this.$refs.articleList.getTabs) {
								this.$refs.articleList.getTabs();
							}
							break;
						case '疫苗列表':
							if (this.$refs && this.$refs.vaccineList && this.$refs.vaccineList.getVaccineList) {
								this.$refs.vaccineList.getVaccineList();
							}
							break;
						case '轮播图':
							if (this.$refs && this.$refs.swiperList && this.$refs.swiperList.getSwiperList) {
								this.$refs.swiperList.getSwiperList();
							}
							break;
						case '商品列表':
							if (this.$refs && this.$refs.goodsList && this.$refs.goodsList.getGoodsListData) {
								this.$refs.goodsList.getGoodsListData();
							}
							break;
						case '通知横幅':
							if (this.$refs && this.$refs.noticeList && this.$refs.noticeList.getList) {
								this.$refs.noticeList.getList();
							}
							break;
					}
				}
			}
		}
	};
</script>

<style scoped lang="scss">
	.store-item {
		background-color: #fff;
		border-radius: 20rpx;
		margin: 20rpx;
		overflow: hidden;
		// padding: 20rpx;
		box-sizing: border-box;

		&.is-swiper {
			padding: 0;
			margin-top: 10rpx;
			min-width: 300px;
		}

		&.bg-transparent {
			background-color: transparent;
		}

		&.noMargin {
			margin: 0;
			border-radius: 0;
		}

		&.noPadding {
			padding: 0;
			border-radius: 0;
		}
	}

	.title {
		padding: 20rpx;
		position: relative;
		// padding-left: 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 16px;
		font-family: 苹方-简;
		font-weight: normal;
		color: #474849;
	}

	.user-card {
		display: flex;
		padding: 10px;

		.left {
			display: flex;

			.profile-image {
				width: 60px;
				height: 60px;
				border-radius: 60px;
			}

			.nick-name {
				margin-left: 10px;
				display: flex;
				justify-content: center;
				flex-direction: column;

				.name {
					margin-bottom: 5px;
				}

				.account {
					color: #666;
				}
			}

			flex: 1;
		}

		.right {
			display: flex;
			align-items: center;

			.cuIcon-message {
				font-size: 24px;
			}
		}
	}

	.user-avatar-list {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.share-menu {
			border-left: 1px solid #f1f1f1;
		}
	}

	// .title::before {
	//   content: "";
	//   width: 10rpx;
	//   height: 30rpx;
	//   background-color: #0bc99d;
	//   position: absolute;
	//   left: 20rpx;
	//   top: calc(50% - 15rpx);
	//   border-radius: 20rpx;
	// }

	.official-account {
		padding: 5px 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #ee7b77;
		border-radius: 10px;
		color: #fff;
	}
</style>
