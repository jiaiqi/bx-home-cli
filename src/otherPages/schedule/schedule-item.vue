<template>
	<view class="course-row-item" :class="{ 'no-bg': !newRowData || Object.keys(newRowData).length === 0 }">
		<view class="" v-for="(column, columnIndex) in colData" :key="column">
			<text v-if="newRowData && newRowData[column]">{{ column + '(' + newRowData[column].length + ')' }}:</text>
			<view v-if="newRowData && newRowData[column] && Array.isArray(newRowData[column])">
				<view class="" v-for="(item, itemIndex) in newRowData[column]" :key="itemIndex">
					<text v-if="newRowData[column].length > 1">{{ itemIndex + 1 + ':' }}</text>
					{{ item.labelText }}
					<!-- {{ item && item[item['scheduleConfig']['schedule_col']] ? item[item['scheduleConfig']['schedule_col']] : '' }} -->
				</view>
			</view>
		</view>
		<view v-if="!newRowData || Object.keys(newRowData).length === 0"><text class="cuIcon-add"
				style="font-size: 20upx;"></text></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				newRowData: {}
			};
		},
		watch: {
			rowData: {
				deep: true,
				immediate: true,
				handler(newValue, oldValue) {
					let newRowData = {};
					if (typeof newValue === 'object') {
						// let rowData = this.deepClone(newValue);
						if (Object.keys(newValue).length > 0) {
							Object.keys(newValue).forEach(row => {
								newRowData[row] = [];
								let data = newValue[row];
								if (Array.isArray(data)) {
									data.forEach(item => {
										let config = item.scheduleConfig;
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
														if (item&&item[disp.srv_col_val]&&item[disp.srv_col_val].length >
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
										newRowData[row].push(item);
									});
								}
								return row;
							});
						}
					}
					this.newRowData = newRowData;
				}
			}
		},

		props: {
			rowData: {
				type: Object,
				default: () => {}
			},
			colData: {
				type: Array,
				default: () => []
			}
		},
		methods: {}
	};
</script>

<style></style>
