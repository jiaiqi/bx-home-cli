<template>
	<view class="grid-item-box" :style="{width:width,height:height,'--background-color':bgColor}"
		:class="{ 'no-bg':noData}">
		<view class="grid-content" v-for="(column, columnIndex) in colData" :key="column">
			<view class="label" v-if="gridData && gridData[column]">{{ column + '(' + gridData[column].length + ')' }}:
			</view>
			<view class="value" v-if="gridData && gridData[column] && Array.isArray(gridData[column])">
				<view class="" v-for="(item, itemIndex) in gridData[column]" :key="itemIndex">
					<view v-if="gridData[column].length > 1">{{ itemIndex + 1 + ':' }}</view>
					{{ item.labelText }}
					<!-- {{ item && item[item['scheduleConfig']['schedule_col']] ? item[item['scheduleConfig']['schedule_col']] : '' }} -->
				</view>
			</view>
		</view>
		<view v-if="noData" :style="{'font-size': '40rpx','text-align':'center','line-height':height}"><text
				class="cuIcon-add"></text>
		</view>
	</view>
</template>

<script>
	const dayjs = require('dayjs')
	export default {
		props: {
			data: {
				type: [Array, Object]
			},
			config: {
				type: Object
			},
			width: {
				type: String
			},
			height: {
				type: String
			},
			bgColor: {
				type: String
			}
		},
		data() {
			return {
				newRowData: {}
			}
		},
		computed: {
			noData() {
				if (this.gridData && typeof this.gridData === 'object' && Object.keys(this.gridData).length > 0) {
					return false
				} else if (this.colData.length === 0) {
					return true
				} else {
					return true
				}
			},
			colData() {
				if (this.data && typeof this.data === 'object') {
					return Object.keys(this.data)
				} else {
					return []
				}
			},
			gridData() {
				let gridData = {}
				let data = this.deepClone(this.data);
				if (typeof data === 'object' && Object.keys(data).length > 0) {
					Object.keys(data).forEach(row => {
						gridData[row] = []
						if (Array.isArray(data[row])) {
							data[row].forEach(item => {
								let config = item.scheduleConfig
								if (config.disp_info && Array.isArray(config.disp_info)) {
									let str = '';
									config.disp_info.forEach(disp => {

										if (typeof disp === 'string') {
											str += disp;
										} else if (disp && typeof disp === 'object' && disp
											.srv_col_val) {
											if (!item[disp.srv_col_val]) {
												item[disp.srv_col_val] = ''
											}
											
											let val = item[disp.srv_col_val] || ''
											if (disp.format && ['date', 'time', 'dateTime',
													'timeDate'
												].includes(disp.type)) {
												if (disp.type == 'time') {
													val = dayjs().format('YYYY-MM-DD ') + val
												}
												val = dayjs(val).format(disp.format)
											}
											
											if (disp.max_char && Number(disp.max_char)
												.toString() !== 'NaN') {
												let maxChar = Number(disp.max_char);

												if (item && val && item[disp
														.srv_col_val].length >
													maxChar) {
													str += val.slice(0,
														maxChar - 1) + '...';
												} else {
													str += val;
												}
											} else {
												str += val;
											}
										}
									});
									str = str.replace('null', '')
									item['labelText'] = str;
								}
								gridData[row].push(item);
							})
						}
					})
				}
				return gridData
			}
		},
	}
</script>

<style scoped lang="scss">
	.grid-item-box {
		overflow: hidden;
		box-sizing: border-box;

		font-size: 20rpx;

		display: inline-block;
		flex: 1;
		color: #fff;
		background-color: #F7F7F7;
		flex-direction: column;
		border-bottom: 1rpx solid #fff;
		padding: 5rpx;
		margin-left: 2px;
		margin-bottom: 2px;
		background-color: var(--background-color);

		.grid-content {
			display: flex;
			flex-direction: column;
			width: 100%;
			overflow: hidden;

			.label {
				height: auto;
				line-height: 1;
			}

			.value {
				flex: 1;
				white-space: break-spaces;
			}
		}

		&.no-bg {
			background-color: #F1F1F1;
			color: #666;
			align-items: center;
			justify-content: center;
		}

	}
</style>
