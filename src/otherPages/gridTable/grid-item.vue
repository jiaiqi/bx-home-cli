<template>
	<view class="grid-item-box" :style="{width:width,height:height}"
		:class="{ 'no-bg': !gridData || colData.length === 0 }">
		<view class="grid-content" v-for="(column, columnIndex) in colData" :key="column">
			<view class="label" v-if="gridData && gridData[column]">{{ column + '(' + gridData[column].length + ')' }}:
			</view>
			<view class="value" v-if="gridData && gridData[column] && Array.isArray(gridData[column])">
				<view class="" v-for="(item, itemIndex) in gridData[column]" :key="itemIndex">
					<view v-if="gridData[column].length > 1">{{ itemIndex + 1 + ':' }}</view>
					{{ item.labelText }}
				</view>
			</view>
		</view>
	<!-- 	<view v-if="colData.length === 0" class="no-data"
			:style="{'font-size': '20rpx','line-height':height}"><text class="cuIcon-add"></text>
		</view> -->
	</view>
</template>

<script>
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
			}
		},
		data() {
			return {
				newRowData: {}
			}
		},
		computed: {
			colData() {
				if (typeof this.data === 'object') {
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
										} else if (typeof disp === 'object' && disp
											.srv_col_val) {
											if (disp.max_char && Number(disp.max_char)
												.toString() !== 'NaN') {
												let maxChar = Number(disp.max_char);
												if (item && item[disp.srv_col_val] && item[disp
														.srv_col_val].length >
													maxChar) {
													str += item[disp.srv_col_val].slice(0,
														maxChar - 1) + '...';
												} else {
													str += item[disp.srv_col_val];
												}
											} else {
												str += item[disp.srv_col_val];
											}
										}
									});
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
		margin-left: 2px;
		margin-bottom: 2px;
		display: inline-block;
		flex: 1;
		color: #000000;
		background-color: #F7F7F7;
		flex-direction: column;

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
			}
		}

		&.no-bg {
			color: #666;
			align-items: center;
			justify-content: center;
		}

	}
</style>
