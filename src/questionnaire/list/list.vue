<template>
	<view class="list-wrap">

	</view>
</template>

<script>
	export default {
		data() {
			return {
				activity_no: "",
				list: [],
				pageNo: 1,
				loadStatus: "more", //noMore loading
			}
		},
		methods: {
			async getList(type = 'refresh') {
				let req = {
					"condition": [{
						"colName": "activity_no",
						"ruleType": "in",
						"value": this.activity_no
					}],
					"page": {
						"pageNo": type === 'more' ? this.pageNo : 1,
						"rownumber": 10
					},
				}
				this.loadStatus = 'loading'
				let res = await this.$fetch('select', 'srvdaq_activity_cfg_select', req, 'daq')
				if (res.success) {
					let res2 = await this.getListDetail()
					debugger
					if (Array.isArray(res2) && res2.length > 0) {
						res.data = res.data.map(item => {
							res2.forEach(item2 => {
								if (item2.activity_no === item.activity_no) {
									item.detail = item2
								}
							})
							return item
						})
					}
					if (type === 'more') {
						this.list = [...this.list, ...res.data]
					} else {
						this.list = res.data
					}
					let page = res.page
					if (page && page.rownumber * page.pageNo < page.total) {
						this.loadStatus = 'more'
					} else {
						this.loadStatus = 'noMore'
					}
				}
			},
			async getListDetail() {
				let req = {
					"condition": [{
							"colName": "activity_no",
							"ruleType": "in",
							"value": this.activity_no
						},
						{
							"colName": "state",
							"ruleType": "in",
							"value": '完成'
						}
					],
					"group": [{
							"colName": "activity_no",
							"type": "by",

						},
						{
							"colName": "fill_batch_no",
							"type": "count",
						}
					],
					"page": {
						"pageNo": 1,
						"rownumber": 9999
					},
				}

				let res = await this.$fetch('select', 'srvdaq_record_reply_select', req, 'daq')
				if (res.success) {
					return res.data
				}
			},
		},
		onPullDownRefresh() {
			this.pageNo = 1
			this.getList('refresh')
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		onReachBottom() {
			if (this.loadStatus === 'more') {
				this.getList(this.loadStatus)
			}
		},
		onLoad(option) {
			if (option.activity_no) {
				this.pageNo = 1
				this.activity_no = option.activity_no;
				this.getList('refresh')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list-wrap {
		min-height: calc(100vh - var(--window-bottom) - var(--window-top) + 20px);
		padding: 20rpx 40rpx;

	}
</style>
