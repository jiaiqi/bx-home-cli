<template>
	<view class="list-item-wrap" v-if="rowData && setViewTemp && setListView" :class="[setListView.rootClass]" :style="[setListView.rootStyle]">
		<view class="list-item" @click="clickItem">
			<view class="main-image" :style="[setListView.imgStyle]" :class="[setListView.imgClass]" v-if="setListView.showImg && setListView.imgAlign !== 'right'">
				<image class="image" :src="setListView.imgSrc" :mode="setListView.imgMode" :style="[setListView.imgTagStyle]"></image>
			</view>
			<view class="list-item-content" :style="{ width: setListView.listContentWidth }" v-if="setListView && setListView.cols">
				<view class="col-item bg" v-for="item in setListView.cols" :style="[item.style]" :class="[item.class]">
					<view class="label" v-if="item.label">{{ item.label }}:</view>
					<view class="value" :style="{ 'white-space': item.valueWhiteSpace }">
						<text v-if="item.prefix">{{ item.prefix }}</text>
						<text>{{ excludeEnter(item.value)}}</text>
						<text v-if="item.suffix">{{ item.suffix }}</text>
					</view>
				</view>
				<view class="col-item text-right flex-1" v-if="listType === 'cartList' && rowData && rowData.goods_amount">
					<view
						class="cu-btn sm radius cart-handler"
						:style="{
							color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
							'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
							'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
							padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
						}"
						@click.stop="del"
						v-if="rowData && rowData.goods_amount"
					>
						-
					</view>
					<view class="goods-amount flex-1 text-center" style="width: 50px;text-align: center;font-size: 16px;">{{ rowData.goods_amount || '1' }}</view>
					<view
						class=" cu-btn sm radius cart-handler"
						:style="{
							color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
							'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
							'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
							padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
						}"
						@click.stop="add"
					>
						+
					</view>
				</view>
				<view class="col-item text-right flex-1 handler" v-if="listType === 'cart'">
					<view class="del-btn-box" :class="{ active: inCartData && amount }" v-if="inCartData && inCartData.id && amount">
						<text
							class="cu-btn sm radius"
							:style="{
								color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
								'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
								'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
								padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
							}"
							@click.stop="del"
						>
							-
						</text>
						<text class="goods-amount">{{ amount || '0' }}</text>
					</view>
					<text
						class=" cu-btn sm radius"
						:style="{
							color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
							'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
							'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
							padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
						}"
						@click.stop="add"
					>
						+
					</text>
				</view>
				<view class="foot-button-box grid" v-if="setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp.grid_span >= 3&&listType!=='selectorList'">
					<button
						class="cu-btn"
						:style="[setListView.btnStyle]"
						:class="[setListView.btnClass]"
						v-for="btn in setRowButton"
						v-show="isShowBtn(btn)"
						@click.stop="clickButton(btn)"
					>
						{{ btn.button_name }}
					</button>
				</view>
			</view>
			<view
				class="main-image"
				:style="{
					'border-radius': setViewTemp.img.cfg.radius,
					width: setViewTemp.img.cfg.width,
					margin: setViewTemp.img.cfg.margin,
					padding: setViewTemp.img.cfg.padding
				}"
				:class="{
					'm-r-0': setViewTemp.img.cfg.position === 'top'
				}"
				v-if="setViewTemp && setViewTemp.img && setViewTemp.img.col && setViewTemp.img.cfg && setViewTemp.img.cfg.position == 'right'"
			>
				<!-- <image class="image" :src="getImagePath(rowData[setViewTemp.img.col])" -->
				<image
					class="image"
					:src="getImagePath(setValue(setViewTemp.img.col).value, true)"
					:mode="setViewTemp.img.cfg.mode || 'aspectFill'"
					:style="{
						'border-radius': setViewTemp.img.cfg.radius,
						width: setViewTemp.img.cfg.width
					}"
				></image>
			</view>
		</view>
		<view class="foot-button-box" v-if="setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp.grid_span >= 3&&listType!=='selectorList'"></view>
		<view class="foot-button-box" v-else-if="listType!=='selectorList'">
			<button
				class="cu-btn"
				:class="[setListView.btnClass]"
				:style="[setListView.btnStyle]"
				v-for="btn in setRowButton"
				v-show="isShowBtn(btn)"
				@click.stop="clickButton(btn)"
			>
				{{ btn.button_name }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		// 行数据
		rowData: {
			type: Object
		},
		// 底部按钮
		rowButton: {
			type: Array
		},
		// 视图模板
		viewTemp: {
			type: Object
		},
		// 字段-显示标签
		labelMap: {
			type: Object
		},
		// 列表类型 list-普通列表,proc-流程,cart-购物车
		listType: {
			type: String
		},
		cartData: {
			type: Array
		},
		gridButtonDisp: {
			type: Object
		},
		rowButtonDisp: {
			type: Object
		},
		formButtonDisp: {
			type: Object
		}
	},
	data() {
		return {};
	},
	computed: {
		amount() {
			let data = this.cartData.find(item => item.id === this.rowData.id);
			if (data?.goods_count) {
				return data.goods_count;
			} else {
				return false;
			}
		},
		inCartData() {
			let data = this.cartData.find(item => item.id === this.rowData.id);
			if (data) {
				return data;
			} else {
				return false;
			}
		},
		setViewTemp() {
			let obj = {
				lp_style: this.viewTemp?.lp_style || '单行',
				grid_span: this.viewTemp?.grid_span || '3',
				margin: this.viewTemp?.margin,
				padding: this.viewTemp?.padding,
				btn_cfg: this.viewTemp?.btn_cfg,
				img: {
					col: this.viewTemp?.img?.col,
					cfg: this.viewTemp?.img?.cfg || {
						radius: '50%',
						position: 'left',
						mode: 'aspectFill'
					}
				},
				cols: []
			};
			if (Array.isArray(this.viewTemp?.cols) && this.viewTemp?.cols.length > 0) {
				obj.cols = this.viewTemp?.cols;
			} else {
				if (typeof this.rowData === 'object' && Object.keys(this.rowData).length > 0) {
					let arr = [];
					Object.keys(this.rowData).forEach(key => {
						if (!['id', 'create_time', 'create_user', 'modify_time', 'modify_user', 'create_user_disp', 'modify_user_disp', '_buttons'].includes(key)) {
							let col = {
								col: key,
								cfg: {
									disp_label: true,
									align: 'left',
									color: '#333',
									min_width: '50%',
									font_size: '14px',
									padding: '0 10rpx 0 0'
								}
							};
							if (arr.length < 10) {
								arr.push(col);
							}
						}
					});
					obj.cols = arr;
				}
			}
			return obj;
		},
		detailBtn() {
			return this.setRowButton.find(item => item.button_type === 'detail');
		},
		btn_cfg() {
			return this.setViewTemp?.btn_cfg;
		},
		setRowButton() {
			let buttons = [];
			if (Array.isArray(this.rowButton) && this.rowButton.length > 0) {
				buttons = this.rowButton.filter((item, index) => {
					if (Array.isArray(this.rowData?._buttons) && this.rowData._buttons.length === this.rowButton.length) {
						return this.rowData._buttons[index] === 1;
					}
					return true;
				});
			} else {
				return [];
			}

			if (this.setViewTemp?.btn_cfg?.show_public_btn === false) {
				buttons = buttons.filter(item => item.is_public !== true || item.button_type === 'detail');
			}
			if (this.setViewTemp?.btn_cfg?.show_custom_btn === false) {
				buttons = buttons.filter(item => item.is_public === true);
			}
			buttons = buttons.filter(btn => {
				if (this.rowButtonDisp && this.rowButtonDisp[btn.button_type] === false) {
					return false;
				} else {
					return true;
				}
			});
			return buttons;
		},

		setListView() {
			let result = {
				rootClass: '',
				rootStyle: {
					margin: this.setViewTemp?.margin,
					padding: this.setViewTemp?.padding
				}
			};
			if (this.setViewTemp?.lp_style === '宫格') {
				let gridSpan = Number(this.setViewTemp?.grid_span);
				result.rootClass += `grid_span${gridSpan}`;
			}
			// 按钮配置
			let btnCfg = this.setViewTemp?.btn_cfg;
			result.btnClass = '';
			if (btnCfg?.style === 'line_button' || btnCfg?.style === 'line') {
				result.btnClass += ' border';
			}
			if (btnCfg?.size === 'sm') {
				result.btnClass += ' sm';
			}
			if (btnCfg?.bg) {
				result.btnClass += ` bg-${btnCfg?.bg}`;
			}
			if (btnCfg?.border_color) {
				result.btnClass += ` line-${btnCfg?.border_color}`;
			}
			result.btnStyle = {
				width: btnCfg?.width,
				height: btnCfg?.height,
				'font-size': btnCfg?.font_size,
				'border-radius': btnCfg?.radius,
				padding: btnCfg?.padding,
				color: btnCfg?.color
			};
			if (btnCfg?.bg && btnCfg?.bg.indexOf('#') !== -1) {
				result.btnStyle['background-color'] = btnCfg?.bg;
			}
			if (this.setViewTemp?.img?.col) {
				// 图片配置
				result.showImg = true;
				let imgCfg = this.setViewTemp?.img?.cfg;
				result.imgAlign = imgCfg.position || 'left';
				result.imgClass = `${imgCfg.position === 'top' ? 'm-r-0' : ''}`;
				result.imgSrc = this.getImagePath(this.setValue(this.setViewTemp.img.col).value, true);
				result.imgStyle = {
					'border-radius': imgCfg?.radius,
					width: imgCfg?.width,
					height: imgCfg?.height,
					margin: imgCfg?.margin,
					padding: imgCfg?.padding
				};
				result.imgTagStyle = {
					'border-radius': imgCfg.radius,
					width: imgCfg.width
				};
				result.imgMode = imgCfg?.mode || 'aspectFill';
				if (result.imgStyle.width) {
					// result.listContentWidth = `calc(100% - ${result.imgStyle.width})`
				}
				if (result.imgAlign === 'top' || result.imgAlign === 'bottom') {
					result.rootClass += ` image-vertical`;
				}
			}

			// 字段配置
			let cols = this.setViewTemp?.cols || [];
			result.cols = [];
			if (Array.isArray(cols) && cols.length > 0) {
				cols.forEach(col => {
					let cfg = col?.cfg;
					let obj = {
						style: {
							flex: cfg?.flex,
							'border-radius': cfg?.radius,
							width: cfg?.width,
							height: cfg?.height,
							'min-width': cfg?.min_width,
							padding: cfg?.padding,
							'font-size': cfg?.font_size,
							'font-weight': cfg?.font_weight,
							'text-align': cfg?.align,
							color: cfg?.color,
							'justify-content': cfg?.align === 'left' ? 'flex-start' : cfg?.align === 'right' ? 'flex-end' : cfg?.align
						},
						class: {
							'cu-btn': cfg?.style === 'button' || cfg?.style === 'line_button',
							border: cfg?.style === 'line_button',
							round: cfg?.round === true,
							light: cfg?.light === true,
							sm: cfg?.size === 'sm',
							lg: cfg?.size === 'lg',
							'bg-blue': cfg?.bg === 'blue',
							'bg-red': cfg?.bg === 'red',
							'bg-orange': cfg?.bg === 'orange',
							'bg-cyan': cfg?.bg === 'cyan',
							'bg-yellow': cfg?.bg === 'yellow',
							'bg-white': cfg?.bg === 'white',
							'bg-black': cfg?.bg === 'black',
							'bg-green': cfg?.bg === 'green',
							'bg-grey': cfg?.bg === 'grey',
							'bg-gray': cfg?.bg === 'gray',
							'line-blue': cfg?.border_color === 'blue',
							'line-red': cfg?.border_color === 'red',
							'line-orange': cfg?.border_color === 'orange',
							'line-cyan': cfg?.border_color === 'cyan',
							'line-yellow': cfg?.border_color === 'yellow',
							'line-white': cfg?.border_color === 'white',
							'line-black': cfg?.border_color === 'black',
							'line-green': cfg?.border_color === 'green',
							'line-grey': cfg?.border_color === 'grey',
							'line-gray': cfg?.border_color === 'gray'
						}
					};
					if (cfg?.bg && cfg?.bg.indexOf('#') !== -1) {
						obj.style['background-color'] = cfg.bg;
					}
					if (cfg?.border_color && cfg?.border_color.indexOf('#') !== -1) {
						obj.style['border'] = `1rpx solid ${cfg?.border_color}`;
					}
					if (Object.keys(obj.class).length > 0) {
						obj.class = Object.keys(obj.class).reduce((res, cur) => {
							if (obj.class[cur]) {
								res += ` ${cur}`;
							}
							return res;
						}, '');
					}
					obj.prefix = cfg?.prefix || '';
					obj.suffix = cfg?.suffix || '';
					obj.valueWhiteSpace = cfg?.white_space;
					if (col?.col) {
						let getVal = this.setValue(col.col);
						if (cfg?.disp_label !== false) {
							obj.label = getVal?.label || '';
						}
						obj.value = getVal?.value;
					}

					if (Array.isArray(cfg?.value_map) && cfg.value_map.length > 0) {
						cfg.value_map.forEach(item => {
							if (obj.value === item.value) {
								obj.value = item.label;
								obj.style['background-color'] = item.bg;
								obj.style['color'] = item.color;
								result.rootStyle['background-color'] = item?.item_bg || result.rootStyle['background-color'];
								result.rootStyle['color'] = item?.item_color || result.rootStyle['color'];
								result.btnStyle['background-color'] = item?.btn_bg || result.btnStyle.bg;
								result.btnStyle.color = item?.btn_color || result.btnStyle.color;
								if (Array.isArray(item.other_col) && item.other_col.length > 0) {
								}
							}
						});
					}
					if (Array.isArray(cfg?.cfg_map) && cfg?.cfg_map.length > 0) {
						cfg.cfg_map.forEach(cfgItem => {
							if (Array.isArray(cfgItem.condition) && cfgItem.condition.length > 0) {
								cfgItem.condition.forEach(cond => {
									if (cond.colName && cond.value) {
										let setValue = this.setValue(cond.colName);
										if (cond.ruleType === 'eq') {
											if (setValue.value === cond.value) {
												obj.style.color = cfgItem.color || obj.style.color;
											}
										} else if (cond.ruleType === 'in') {
											if (cond.value.indexOf(setValue.value) !== -1) {
												obj.style.color = cfgItem.color || obj.style.color;
											}
										}
									}
								});
							}
						});
					}
					if (cfg?.max && obj.value) {
						if (!isNaN(Number(cfg?.max))) {
							obj.value = obj.value.slice(0, cfg.max);
						}
					}
					if (!obj.value && cfg?.default_val) {
						obj.value = cfg?.default_val;
					}
					if (!obj.value && obj.value !== 0 && cfg?.show_null !== true) {
						obj.class += ' hidden';
					}
					result.cols.push(obj);
				});
			}
			return result;
		}
	},
	methods: {
		excludeEnter(val) {
			if (val&&typeof val ==='string') {
				return val.replaceAll('\n', '');
			} else {
				return val||'';
			}
		},
		// TODO cols支持配置多个字段"col":"col1||col2||col3"
		setValue(col, cfg) {
			let res = {};
			let labelMap = this.labelMap || {};
			let detail = this.rowData || {};
			let arr = [];
			if (col) {
				if (typeof col === 'string') {
					arr = col.split('||');
				} else if (Array.isArray(col) && col.length > 0) {
					arr = col;
				}
			}
			let resCol = '';
			for (let i = 0; i < arr.length; i++) {
				let column = arr[i].trim();
				if (detail[column]) {
					resCol = column;
					break;
				}
			}
			if (!resCol && Array.isArray(arr) && arr.length > 0) {
				resCol = arr[0];
			}
			res.label = labelMap[resCol] || cfg?.default_label || '';
			res.value = detail[resCol] ?? cfg?.default_val ?? '';
			if(res.value&&typeof res.value==='string'){
				res.value = res.value.replace(/\\n/,'')
			}
			return res;
		},
		del() {
			this.$emit('del2Cart', this.rowData);
		},
		add() {
			this.$emit('add2Cart', this.rowData);
		},
		isShowBtn(btn) {
			let notDetail = btn.button_type !== 'detail';
			if (notDetail) {
				if (btn.button_type === 'customize') {
					return this.btn_cfg?.show_custom_btn !== false;
				} else {
					return this.btn_cfg?.show_public_btn !== false;
				}
			}
			return notDetail;
		},
		showAction() {
			let itemList = this.setRowButton.map(item => item.button_name);
			uni.showActionSheet({
				itemList: itemList,
				success: res => {
					console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
					let btn = this.setRowButton[res.tapIndex];
					this.clickButton(btn);
				},
				fail: function(res) {
					console.log(res.errMsg);
				}
			});
		},
		clickButton(btn) {
			this.$emit('click-foot-btn', {
				row: this.rowData,
				button: btn
			});
		},
		clickItem() {
			if (this.detailBtn?.button_type) {
				this.$emit('click-foot-btn', {
					row: this.rowData,
					button: this.detailBtn
				});
			}
		}
	}
};
</script>

<style scoped lang="scss">
.list-item-wrap {
	// width: 100%;
	background-color: #fff;
	padding: 20rpx;
	display: flex;
	border-radius: 20rpx;
	overflow: hidden;
	flex-wrap: wrap;

	&.image-vertical {
		// 图片在垂直方向（上方、下方）
		flex-wrap: wrap;

		.list-item {
			flex-wrap: wrap;
		}
	}

	.list-item {
		flex: 1;
		display: flex;
		width: 100%;
		.cuIcon-moreandroid {
			margin-bottom: 10rpx;
		}

		.main-image {
			width: 100rpx;
			min-height: 100rpx;
			margin-right: 20rpx;
			display: flex;
			align-items: center;
			background-color: #fff;
			border: 1rpx solid #f8f8fa;

			&.m-r-0 {
				margin-right: 0;
				margin-bottom: 10rpx;
				border-radius: 0;

				.image {
					border-radius: 0;
				}
			}

			.image {
				width: 100%;
				height: 100%;
				border-radius: 20rpx;
			}
		}

		.list-item-content {
			flex: 1;
			display: flex;
			flex-wrap: wrap;
			max-width: 100%;

			.col-item {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				margin-bottom: 10rpx;
				font-size: 28rpx;
				font-family: 苹方-简;
				color: #333333;
				.cart-handler {
					&.cu-btn {
						width: 25px;
						height: 25px;
						line-height: 25px;
						text-align: center;
					}
				}
				&.hidden {
					display: none;
					width: 0;
					height: 0;
				}

				&.handler {
					width: 100%;
					display: flex;
					align-items: center;
					padding: 0 10rpx;

					&.text-right {
						padding-right: 10rpx;
					}

					.cu-btn {
						width: 50rpx;
						height: 50rpx;
						line-height: 50rpx;
						text-align: center;
					}

					.del-btn-box {
						display: flex;
						flex: 0;
						align-items: center;
						transition: all 1s;

						&.active {
							flex: 1;
						}
					}

					.goods-amount {
						flex: 1;
						min-width: 30px;
						text-align: center;
						font-weight: normal;
						font-size: 28rpx;
						background-color: #f8f8fa;
						height: 50rpx;
						line-height: 50rpx;
					}
				}

				&.flex-1 {
					flex: 1;
					font-size: 40rpx;
				}

				&.text-right {
					justify-content: flex-end;
					padding-right: 20rpx;
				}

				.label {
					margin-right: 10rpx;
				}

				.value {
					overflow: hidden;
					text-overflow: ellipsis;
					// white-space: nowrap;
					max-width: 100%;
				}
			}
		}
	}

	.foot-button-box {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		width: 100%;

		.bg-orange {
			background-color: #f3a250;
		}

		&.grid {
			width: auto;
		}

		.cu-btn {
			margin-left: 10rpx;
			margin-bottom: 10rpx;

			&.hidden {
				margin-left: 0;
			}

			&:first-child {
				margin-left: 0;
			}
		}
	}
}
</style>
