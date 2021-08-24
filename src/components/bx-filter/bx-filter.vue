<template>
	<view class="bx-filter">
		<view class="view">

		</view>
		<view class="form-box">
			<a-form :fields="filterCols" :srvApp="srvApp" ref='filterForm' pageType="filter" v-if="filterCols"></a-form>
			<view class="tip" v-if="!filterCols|| filterCols.length===0">
				没有可筛选字段
			</view>
		</view>
		<view class="button-box">
			<button class="cu-btn bg-green light" @click="reset"><text
					class="cuIcon-refresh margin-right-xs "></text>重置</button>
			<button class="cu-btn bg-grey light" @click="cancel"><text
					class="cuIcon-close margin-right-xs "></text>取消</button>
			<button class="cu-btn bg-blue light confirm" @click="toFilter" type="primary">
				<text class="cuIcon-search margin-right-xs"></text>确定
			</button>
		</view>
	</view>
</template>

<script>
	/**
	 * @description - 通用筛选组件
	 * @param {Object} - config 配置数据  
	 */
	export default {
		props: {
			fieldInfo: {
				type: [Object, Array]
			},
			srvApp:{
				type:String
			}
		},
		data() {
			return {
				filterCols: []
			}
		},
		methods: {
			toFilter() {
				let model = this.$refs.filterForm.getFieldModel();
				let result =[]
				this.filterCols = this.filterCols.map((item) => {
					if (model[item.column]) {
						item['value'] = model[item.column]
						result.push(item)
					}
					return item
				})
				debugger
				this.$emit('toFilter', result)
			},
			cancel() {
				this.$emit('cancel')
			},
			reset() {
				this.filterCols = []
				if (Array.isArray(this.fieldInfo)) {
					let filterCols = this.fieldInfo
					filterCols = filterCols.map(item => {
						item.value = null
						return item
					})
					let ignoreType = ['images', 'input', 'text','number']
					ignoreType = ['images']
					this.filterCols = filterCols.filter(item => item.in_cond === 1&&item.in_list === 1 && !ignoreType.includes(item.type) && !/^\_.*\_disp$/.test(item.column))
				}
				this.$refs.filterForm.onReset()
			}
		},
		mounted() {
			this.reset()
		}
	}
</script>

<style scoped lang="scss">
	.bx-filter {
		max-height: calc(100vh - var(--window-bottom) - var(--window-top) - 150rpx);
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
		padding: 20rpx 0 40rpx;
		border-radius: 30rpx 30rpx 0 0;
		background-color: #fff;

		.view {
			flex: 1;
		}

		.form-box {
			max-height: calc(100vh - var(--window-bottom) - var(--window-top) - 300rpx);
			overflow-y: scroll;
			.tip{
				height: 300rpx;
				line-height: 300rpx;
				text-align: center;
			}
		}

		.button-box {
			display: flex;
			align-items: center;
			justify-content: space-around;
			margin: 0;
			box-shadow: 6px 5px 13px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
			padding: 20rpx;
			width: calc(100% - 40rpx);
			margin: 20rpx;
			border-radius: 30rpx;

			.cu-btn {
				// flex: 1;
				width: 200rpx;

				&+.cu-btn {
					// margin-left: 20rpx;
				}

				&.confirm {
					// flex: 2;
				}
			}
		}

	}
</style>
