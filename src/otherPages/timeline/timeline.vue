<template>
	<div class="timeline">
		<dcp-scroller :isLoading="loadStatus === 'loading'" @refresh="getList">
			<timeline-list :profile="userInfo.profile_url" :storeNo="storeNo" :loadStatus="loadStatus" noMargin
				loadOutData :showProfile="false" :list="listData" :condition="condition" :limit="20" @load="getList">
			</timeline-list>
		</dcp-scroller>
		<uni-load-more :status="loadStatus" v-if="
        loadStatus !== 'noMore' ||
        (loadStatus === 'noMore' && listData.length !== 0)
      ">
		</uni-load-more>
		<u-empty text="无历史记录" mode="history" v-else-if="loadStatus === 'noMore' && listData.length === 0"></u-empty>
	</div>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				listData: [],
				page: {
					pageNo: 1,
					rownumber: 10,
					total: 0
				},
				storeNo: '',
				loadStatus: "",
			}
		},
		computed: {
			condition() {
				if (this.storeNo) {
					return [{
						colName: 'store_no',
						ruleType: 'eq',
						value: this.storeNo
					}, ]
				} else {
					return []
				}
			},
			...mapState({
				userInfo: state => state.user.userInfo
			})
		},
		methods: {
			refresh() {
				this.getList()
			},
			getList(loadType) {
				const serviceName = this.srvInfo?.serviceName || 'srvportal_friends_circle_select'
				const appName = this.srvInfo?.appName || 'bxportal'
				let req = {
					"serviceName": serviceName,
					"colNames": ["*"],
					"condition": [],
					"page": {
						"pageNo": this.page.pageNo,
						"rownumber": this.page.rownumber
					}
				}
				if (this.storeNo) {
					req.condition.push({
						colName: 'store_no',
						ruleType: 'eq',
						value: this.storeNo
					})
				}
				if (Array.isArray(this.condition) && this.condition.length > 0) {
					req.condition = [...req.condition, ...this.condition]
				}
				if (loadType === 'loadmore') {
					if (this.loadStatus === 'loading') {
						return
					}
				}
				this.loadStatus = 'loading'
				this.$fetch('select', serviceName, req, appName).then(res => {
					if (res.success) {
						if (loadType === 'loadmore') {
							this.listData = [...this.listData, ...res.data]
						} else {
							this.listData = res.data
						}
						this.page = res.page
						if (res.page.total > res.page.pageNo * res.page.rownumber) {
							this.loadStatus = 'more'
						} else {
							this.loadStatus = 'noMore'
						}
					} else {
						this.loadStatus = 'more'
					}
				})
			},
		},

		// 页面周期函数--监听页面加载
		onLoad(option) {
			if (option.storeNo) {
				this.storeNo = option.storeNo
			}
			if (option.title) {
				uni.setNavigationBarTitle({
					title: option.title
				})
			}
			this.getList()
		},

		onPullDownRefresh() {
			uni.stopPullDownRefresh();
		},
		// 页面处理函数--监听用户上拉触底
		onReachBottom() {
			if (this.loadStatus === 'more') {
				this.page.pageNo++
				this.getList('loadmore')
			}

		}
	};
</script>

<style></style>
