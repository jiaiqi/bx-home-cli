<template>
  <view class="bx-radio-group">
    <slot></slot>
  </view>
</template>

<script>
  import Emitter from '@/common/mixins/emitter.js';
  /**
   * radioRroup 单选框父组件
   * @description 单选框用于有一个选择，用户只能选择其中一个的场景。搭配bx--radio使用
   * @tutorial https://www.uviewui.com/components/radio.html
   * @property {Boolean} disabled 是否禁用所有radio（默认false）
   * @property {String Number} size 组件整体的大小，单位rpx（默认40）
   * @property {String} active-color 选中时的颜色，应用到所有子Radio组件（默认#2979ff）
   * @property {String Number} icon-size 图标大小，单位rpx（默认20）
   * @property {String} shape 外观形状，shape-方形，circle-圆形(默认circle)
   * @property {Boolean} label-disabled 是否禁止点击文本操作checkbox(默认false)
   * @property {String} width 宽度，需带单位
   * @property {Boolean} wrap 是否每个radio都换行（默认false）
   * @event {Function} change 任一个radio状态发生变化时触发
   * @example <bx-radio-group v-model="value"></bx-radio-group>
   */
  export default {
    name: 'bx-radio-group',
    mixins: [Emitter],
    props: {
      // 是否禁用所有单选框
      disabled: {
        type: Boolean,
        default: false
      },
      // 匹配某一个radio组件，如果某个radio的name值等于此值，那么这个radio就被会选中
      value: {
        type: [String, Number]
      },
      // 选中状态下的背景色
      activeBg: {
        type: String,
        // default: '#94bcff'
      },
      // 选中状态下的颜色
      activeColor: {
        type: String,
        // default: '#2979ff'
      },
      // 组件的整体大小
      size: {
        type: [String, Number],
        default: 34
      },
      // 是否禁止点击提示语选中复选框
      labelDisabled: {
        type: Boolean,
        default: false
      },
      // 形状，square为方形，circle为原型
      shape: {
        type: String,
        default: 'circle'
      },
      // 样式风格 normal-经典多选框风格，button-按钮风格
      mode: {
        type: String,
        default: 'normal'
      },
      // 同上，后续将删除此属性
      radioMode: {
        type: String,
        default: 'normal'
      },
      // 图标的大小，单位rpx
      iconSize: {
        type: [String, Number],
        default: 20
      },
      // 每个checkbox占bx-checkbox-group的宽度
      width: {
        type: [String, Number],
        default: 'auto'
      },
      // 是否每个checkbox都换行
      wrap: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {};
    },
    created() {
      // 如果将children定义在data中，在微信小程序会造成循环引用而报错
      this.children = [];
    },
    computed: {
      // 这里computed的变量，都是子组件bx-radio需要用到的，由于头条小程序的兼容性差异，子组件无法实时监听父组件参数的变化
      // 所以需要手动通知子组件，这里返回一个parentData变量，供watch监听，在其中去通知每一个子组件重新从父组件(bx-radio-group)
      // 拉取父组件新的变化后的参数
      parentData() {
        return [this.value, this.disabled, this.activeColor, this.size, this.labelDisabled, this.shape, this.iconSize,
          this.width, this.wrap
        ];
      }
    },
    methods: {
      // 该方法有子组件radio调用，当一个radio被选中的时候，给父组件设置value值(props传递的value)
      setValue(val) {
        // 通过子组件传递过来的val值(此被选中的子组件内部已将parentValue设置等于val的值)，将其他
        // bx-radio设置未选中的状态
        this.children.map(child => {
          if (child.parentData.value != val) {
            child.parentData.value = '';
          }
        });
        // 通过emit事件，设置父组件通过v-model双向绑定的值
        this.$emit('input', val);
        this.$emit('change', val);
        // 等待下一个周期再执行，因为this.$emit('input')作用于父组件，再反馈到子组件内部，需要时间
        // 由于头条小程序执行迟钝，故需要用几十毫秒的延时
        setTimeout(() => {
          // 将当前的值发送到 bx-form-item 进行校验
          this.dispatch('bx-form-item', 'on-form-change', val);
        }, 60);
      }
    },
    watch: {
      // 当父组件需要子组件需要共享的参数发生了变化，手动通知子组件
      parentData: {
        deep: true,
        handler() {
          if (this.children.length) {
            this.children.map(child => {
              // 判断子组件(bx-radio)如果有updateParentData方法的话，就就执行(执行的结果是子组件重新从父组件拉取了最新的值)
              typeof child.getParentData == 'function' && child.getParentData('bx-radio-group');
            });
          }
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  .bx-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
</style>
