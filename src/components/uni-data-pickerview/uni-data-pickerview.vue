<template>
	<view class="uni-data-pickerview">
		<scroll-view class="selected-area" scroll-x="true">
			<view class="selected-list">
				<view
					class="selected-item"
					:class="{ 'selected-item-active': index == selectedIndex }"
					v-for="(item, index) in selected"
					:key="index"
					v-if="item.text"
					@click="handleSelect(index)"
				>
					<text class="">{{ item.text }}</text>
				</view>
			</view>
		</scroll-view>
		<view class="tab-c">
			<scroll-view class="list" v-for="(child, i) in dataList" :key="i" v-if="i == selectedIndex" scroll-y="false">
				<view class="item" :class="{ active: selected.length > i && item.value == selected[i].value }" v-for="(item, j) in child" :key="j" @click="handleNodeClick(i, j)">
					<text class="item-text">{{ item.text }}</text>
					<!-- <view class="check" v-if="selected.length > i && item.value == selected[i].value"></view> -->
				</view>
			</scroll-view>
			<view class="loading-cover" v-if="loading"><uni-load-more class="load-more" :contentText="loadMore" status="loading"></uni-load-more></view>
			<view class="error-message" v-if="errorMessage">
				<text class="error-text">{{ errorMessage }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import dataPicker from './uni-data-picker.js';

/**
 * uni-data-pickerview
 * @description uni-data-pickerview
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-data-picker
 * @property {Array} localdata 本地数据，参考
 * @property {Boolean} step-searh = [true|false] 是否分布查询
 * @value true 启用分布查询，仅查询当前选中节点
 * @value false 关闭分布查询，一次查询出所有数据
 * @property {String|DBFieldString} self-field 分布查询当前字段名称
 * @property {String|DBFieldString} parent-field 分布查询父字段名称
 * @property {String|DBCollectionString} collection 表名
 * @property {String|DBFieldString} field 查询字段，多个字段用 `,` 分割
 * @property {String} orderby 排序字段及正序倒叙设置
 * @property {String|JQLString} where 查询条件
 */
export default {
	name: 'UniDataPickerView',
	mixins: [dataPicker],
	props: {
		managedMode: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {};
	},
	created() {
		if (this.managedMode) {
			return;
		}

		this.$nextTick(() => {
			this.load();
		});
	},
	methods: {
		onPropsChange() {
			this._treeData = [];
			this.selectedIndex = 0;
			this.load();
		},
		load() {
			if (this.isLocaldata) {
				this.loadData();
			} else if (this.value.length) {
				this.getTreePath(res => {
					this.loadData();
				});
			}
		},
		handleSelect(index) {
			this.selectedIndex = index;
		},
		handleNodeClick(i, j) {
			
			const node = this.dataList[i][j];
			const { value, text } = node;

			if (i < this.selected.length - 1) {
				this.selected.splice(i, this.selected.length - i);
				this.selected.push(node);
			} else if (i === this.selected.length - 1) {
				this.selected[i] = node;
			}

			if (node.isLeaf) {
				this.onSelectedChange(node, node.isLeaf);
				return;
			}

			const { isLeaf, hasNodes } = this._updateBindData();

			if (this.isLocaldata && (!hasNodes || isLeaf)) {
				this.onSelectedChange(node, true);
				return;
			}

			if (!isLeaf && !hasNodes) {
				this._loadNodeData(data => {
					if (!data.length) {
						node.isLeaf = true;
					} else {
						this._treeData.push(...data);
						this._updateBindData(node);
					}
					this.onSelectedChange(node, node.isLeaf);
				}, this.nodeWhere);
				return;
			}

			this.onSelectedChange(node, false);
		},
		updateData(data) {
			this._treeData = data.treeData;
			this.selected = data.selected;
			if (!this._treeData.length) {
				this.loadData();
			} else {
				//this.selected = data.selected
				this._updateBindData();
			}
		},
		onDataChange() {
			this.$emit('datachange');
		},
		onSelectedChange(node, isLeaf) {
			if (isLeaf) {
				this._dispatchEvent();
			} else if (node) {
				this.$emit('nodeclick', node);
			}
		},
		_dispatchEvent() {
			this.$emit('change', this.selected.slice(0));
		}
	}
};
</script>

<style scoped>
.uni-data-pickerview {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.error-text {
	color: #dd524d;
}

.loading-cover {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.5);
	display: flex;
	flex-direction: column;
	align-items: center;
	z-index: 1001;
}

.load-more {
	margin: auto;
}

.error-message {
	background-color: #fff;
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	padding: 15px;
	opacity: 0.9;
	z-index: 102;
}

.selected-list {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	padding: 0 5px;
	border-bottom: 1px solid #f8f8f8;
}

.selected-item {
	margin-left: 10px;
	margin-right: 10px;
	padding: 12px 0;
	white-space: nowrap;
}

.selected-item-active {
	border-bottom: 2px solid #007aff;
}

.selected-item-text {
	color: #007aff;
}

.tab-c {
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}

.list {
	flex: 1;
	height: 100%;
}

.item {
	padding: 5px 10px;
	border: 1px solid #f0f0f0;
	display: inline-flex;
	flex-direction: row;
	margin-top: 10px;
	margin-left: 10px;
}
.item.active {
	border-color: #0bc99d;
	color: #0bc99d;
	background-color: rgba(11, 201, 157, 0.1);
}
.item-text {
	flex: 1;
	color: #333333;
}

.check {
	margin-right: 5px;
	border: 2px solid #007aff;
	border-left: 0;
	border-top: 0;
	height: 12px;
	width: 6px;
	transform-origin: center;
	transition: all 0.3s;
	transform: rotate(45deg);
}
</style>
