<template>
	<view class="ws-table">
		<!--表格头部区域-->
		<view class="table-header header-bg" :style="{'top': headerTop}">
			<view class="left">
				<view class="col" v-for="(item, index) in fixedKey" :key="index" @touchstart="touchmove($event, item)">
					<view class="item" :style="{width:setUpxToPx(item.width/2), height: '20px', lineHeight: '20px'}">
						<span>{{ item.label }}</span>
					</view>
				</view>
			</view>
			<scroll-view class="scroll-view" :enable-flex="true" scroll-x :scroll-left="scrollLeft">
				<view class="row">
					<view class="col" v-for="(item, index) in noFixedKey" :key="index"
						@touchstart="touchmove($event, item)">
						<view class="item" :style="{width:setUpxToPx(item.width), height: setUpxToPx(itemHeight/2)}">
							<span>{{ item.label }}</span>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!--表格内容区域-->
		<scroll-view class="table-content"
			:style="{marginTop: setUpxToPx(showTableFilter?itemHeight:itemHeight/2), marginBottom: setUpxToPx(itemHeight)}"
			scroll-y @scrolltolower="loadMore" @refresherrefresh="refresh">
			<view class="content">
				<view class="left">
					<view class="row" v-for="(item, index) in tableData" :key="index">
						<view class="item header-bg"
							:style="{width:setUpxToPx(v.width/2), height: setUpxToPx(itemHeight)}"
							v-for="(v, index2) in fixedKey" :key="index2">
							<span>{{ item[v.key] ? item[v.key] : '-' }}</span>
						</view>
					</view>
				</view>
				<scroll-view class="scroll-view" scroll-x @scroll="scrollXFunc" @scrolltoupper="scrollToLeft">
					<view class="scroll-view-item" v-for="(item, index) in tableData" :key="index"
						:style="{ height: setUpxToPx(itemHeight)}">
						<gridItem :data="item[v.label]" :width="setUpxToPx(v.width)" :height=" setUpxToPx(itemHeight)"
							:config="scheduleConfig" v-for="(v, index2) in noFixedKey" :key="index2"></gridItem>
					</view>
				</scroll-view>
			</view>
		</scroll-view>

		<!--表格合计区域-->
		<view class="footer-header header-bg" v-if="showSummary">
			<view class="left">
				<view class="item index-view"
					:style="{height: setUpxToPx(itemHeight), lineHeight: setUpxToPx(itemHeight)}">
					<span>合计</span>
				</view>
				<view class="col" v-for="(item, index) in fixedKey" :key="index">
					<view class="item"
						:style="{width:setUpxToPx(item.width), height: setUpxToPx(itemHeight), lineHeight: setUpxToPx(itemHeight)}">
						<text>
							{{ sumRow[item.key] ? sumRow[item.key] : '-' }}
						</text>
					</view>
				</view>
			</view>
			<scroll-view class="scroll-view" scroll-x :scroll-left="scrollLeft">
				<view class="item" v-for="(item, index) in noFixedKey" :key="index"
					:style="{width:setUpxToPx(item.width), height: setUpxToPx(itemHeight), lineHeight: setUpxToPx(itemHeight)}">
					{{ sumRow[item.key] ? sumRow[item.key] : '-' }}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import gridItem from './grid-item.vue'
	export default {
		components: {
			gridItem
		},
		name: 'ws-table',
		props: {
			config: {
				type: Array,
				default: () => {
					return []
				}
			},
			scheduleConfig: {
				type: Object,
				default: () => {
					return {}
				}
			},
			tableData: {
				type: Array,
				default: () => {
					return []
				}
			},
			showTableFilter: {
				type: Boolean,
				default: true
			},
			showSummary: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				itemHeight: 200,
				fixedKey: [], // 固定列
				noFixedKey: [], // 非固定列
				sumRow: {}, // 合计行数据
				scrollLeft: 0,
				listQuery: {}, // 搜索条件
				showOptions: false,
				options: [],
				optionKey: '',
				navBarHeight: 46
			}
		},
		computed: {
			schedule_item_cfg() {
				return this.scheduleConfig?.schedule_item_cfg || []
			},
			headerTop() {
				// #ifdef H5
				return this.navBarHeight + 'px'
				// #endif
				// #ifdef MP-WEIXIN
				return '0px'
				// #endif
			}
		},
		mounted() {
			this.getSystemInfo()
			this.initConfig()
		},
		methods: {
			refresh(e) {
				console.log(e)
				console.log('刷新')
			},
			getSystemInfo() {
				const info = uni.getSystemInfoSync()
				this.navBarHeight = info.system.indexOf('iOS') > -1 ? 44 : 46
			},
			bindPickerChange(e, item) {
				const index = e.detail.value
				const options = item.filter.options
				const key = item.filter.key ? item.filter.key : item.key
				this.listQuery[key] = options[index].value
				this.listQuery = JSON.parse(JSON.stringify(this.listQuery))
				this.$emit('getQuery', this.listQuery)
			},
			touchmove(e, item) {
				// const offsetLeft = e.target.offsetLeft
				console.log(e)
			},
			setUpxToPx(val) {
				return uni.upx2px(val ? val : 100) + 'px'
			},
			initConfig() {
				this.config.forEach(v => {
					this.getKeys(v)
					this.initSumRow(v)
				})
				this.countSum()
			},
			getQueryKey(item) {
				return this.listQuery[item.filter && item.filter.key ? item.filter.key : item.key]
			},
			// 区分固定列、非固定列
			getKeys(v) {
				if (v.isShow !== false) {
					if (v.isFixed) {
						this.fixedKey.push(v)
					} else {
						this.noFixedKey.push(v)
					}
				}
			},
			// 初始化合计项
			initSumRow(v) {
				this.sumRow[v.key] = v.isSum ? 0 : ''
			},
			// 合计
			countSum() {
				Object.keys(this.sumRow).forEach(key => {
					this.sumRow[key] = this.sumRow[key] === '' ? '' : 0
				})
				this.tableData.forEach(item => {
					Object.keys(this.sumRow).forEach(key => {
						if (this.sumRow[key] !== '') {
							this.sumRow[key] += Number(item[key])
						}
					})
				})
				console.log(this.sumRow)
			},
			scrollXFunc(e) {
				this.scrollLeft = e.detail.scrollLeft
			},
			scrollToLeft(e) {
				console.log(e)
				if (e.detail.direction === 'left') {
					this.scrollLeft = 0
				}
			},
			onKeyInput(e, key) {
				this.listQuery[key] = e.detail.value
				this.listQuery = JSON.parse(JSON.stringify(this.listQuery))
			},
			inputConfirm() {
				this.$emit('getQuery', this.listQuery)
			},
			focus(e) {
				// console.log('focus')
				// console.log(e)
			},
			blur(e) {
				// console.log('blur')
				// console.log(e)
			},
			clearValue(key) {
				this.listQuery[key] = ''
				this.listQuery = JSON.parse(JSON.stringify(this.listQuery))
				this.$emit('getQuery', this.listQuery)
			},
			getDictText(item) {
				if (item.filter && item.filter.options) {
					const options = item.filter.options
					const key = item.filter.key ? item.filter.key : item.key
					const index = options.findIndex(v => v.value === this.listQuery[key])
					if (index > -1) {
						return options[index].label
					}
				}
				return '-'
			},
			showDictText(options, value) {
				let label = ''
				if (options && options.length > 0 && value) {
					options.forEach(item => {
						if (item.value === value) {
							label = item.label
						}
					})
				}
				return label ? label : '未知'
			},
			getTagClass(value) {
				let name = ''
				switch (value) {
					case 'Y':
						name = 'ok'
						break
					case 'N':
						name = 'error'
						break
				}
				return name
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import url("./css/icon.scss");

	.ws-table {
		width: 100%;
		border-top: 1px solid #EFF1F5;
		border-left: 1px solid #EFF1F5;
		position: relative;
		font-size: 26upx;
		background-color: #ffffff;

		.header-bg {
			background-color: #f5f5f5;
		}

		.table-header {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			align-items: center;
			position: fixed;
			top: 0;
			left: 1px;
			right: 0;
			z-index: 999;

			.left {
				display: flex;
				flex-direction: row;

				.col {
					display: flex;
					align-items: center;
					justify-content: center;

					.item {
						overflow: hidden;
						writing-mode: vertical-rl;
						display: flex;
						align-items: center;
						justify-content: center;
						letter-spacing: 5px;
					}
				}
			}

			.scroll-view {
		
				.row {
					display: inline-flex;
					flex-direction: row;
				}
			}

			.op-view {
				background-color: #ffffff;
				border-radius: 5upx;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				width: 90%;
				height: 65%;
				padding: 10upx;
				box-sizing: border-box;

				.input {
					flex: 1;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					font-size: 22upx;
				}

				.no-value {
					color: #949494;
				}

				.iconfont {
					color: #949494;
				}

				.have-value {
					color: #333333;
				}

				.icon-view {
					margin-left: 10upx;
				}

				.icon {
					width: 30upx;
					height: 30upx;
				}

				.del-icon {
					width: 40upx;
					height: 40upx;
					//margin-top: 5upx;
				}
			}
		}

		.table-content {
			.content {
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				// align-items: center;

				.left {
					.row {
						display: flex;
						align-items: center;
						justify-content: center;

						.item {
							overflow: hidden;
							writing-mode: vertical-rl;
							display: flex;
							align-items: center;
							justify-content: center;
							letter-spacing: 5px;
						}
					}
				}
				.scroll-view-item{
				}
			}
		}

		.footer-header {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			background-color: #FEF0F0;

			.left {
				display: flex;
				flex-direction: row;
			}

			.scroll-view {
				.item {
					display: inline-block !important;
					padding-bottom: -40upx;
				}
			}
		}
	}

	.index-view {
		width: 70upx;
	}

	.col {
		display: inline-block;
	}

	.item {
		display: flex;
		border-right: 1px solid #EFF1F5;
		border-bottom: 1px solid #EFF1F5;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.bgWhite {
		background-color: #FFFFFF;
	}

	.tag-view {
		padding: 10upx 20upx;
		border-radius: 5upx;
		color: #9F9F9F;
		font-size: 22upx;
		background-color: #E9E9E9;
	}

	.ok_bg {
		background-color: #E5FFD8 !important;
		color: #67C23A !important;
	}

	.error_bg {
		background-color: #FEF0F0 !important;
		color: #F56C6C !important;
	}

	.scroll-view {
		width: auto;
		overflow: hidden;
		white-space: nowrap;
		display: inline-block;
	}

	scroll-view ::-webkit-scrollbar {
		width: 0;
		height: 0;
		background-color: transparent;
	}
</style>
