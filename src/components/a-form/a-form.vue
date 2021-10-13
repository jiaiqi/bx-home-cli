<template>
  <view>
    <a-form-item :srvApp="srvApp" :procData="procData" :labelPosition="labelPosition" :optionMode="optionMode"
      @on-value-change="onValChange" @on-value-blur="onValBlur" @chooseLocation="chooseLocation"
      v-for="field in allField" v-show="showField(field)" :key="field.id" :field="field" :pageType="pageType"
      ref="fitem"></a-form-item>
    <!-- <slot></slot> -->
  </view>
</template>

<script>
  import evaluatorTo from '@/common/evaluator.js';
  export default {
    name: 'aForm',
    props: {
      // defaultVal: {
      // 	type: [Array, Object],
      // },
      mainData: {
        type: Object
      },
      fields: {
        type: Array,
        required: true
      },
      formType: {
        type: String,
        default: 'add' //add||update
      },
      pageType: {
        type: String,
        default: 'form'
      },
      procData: {
        type: Object,
        default () {
          return {};
        }
      },
      labelPosition: {
        type: String,
        default: 'left' //left|top
      },
      optionMode: {
        type: String,
        default: 'button' //选项的样式 normal | button
      },
      srvApp: {
        type: String
      },
      moreConfig: {
        type: Object,
        default () {
          return {};
        }
      }
    },
    mounted() {
      let oldFieldModel = this.oldField.reduce((res, cur) => {
        if (cur.value) {
          if (cur.column) {
            res[cur.column] = cur.value
          } else if (cur.columns) {
            res[cur.columns] = cur.value
          }
        }
        return res
      }, {})
      this.oldFieldModel = this.deepClone(oldFieldModel)
      this.fieldModel = this.deepClone(oldFieldModel)
    },
    data() {
      return {
        allField: [],
        oldField: [],
        fieldModel: {},
        oldFieldModel: {},
        more_config: {
          col_relation: []
        }
      };
    },
    methods: {
      showField(field) {
        if (this.pageType === 'add') {
          return field.in_add === 1
        } else if (this.pageType === 'update') {
          return field.in_update === 1
        }
        return true
      },
      getFieldModel() {
        let valid = 0;
        let showsNum = 0;
        this.allField.map((item, index) => {
          let valids = this.$refs.fitem[index].getValid();
          console.log('字段校验', valids, item);
          if (item.display) {
            showsNum++;
            if (valids.valid) {
              valid++;
            }
          }
        });
        let defaultValue = this.allField.reduce((res, cur) => {
          if (cur.defaultValue) {
            res[cur.columns] = cur.defaultValue
          }
          return res
        }, {})
        if (valid === showsNum) {
          console.log('表单校验通过', showsNum, valid, this.fieldModel);
          let model = {};
          if (this.formType === 'add') {
            model = this.deepClone(this.fieldModel)
            if (Object.keys(model).length === 0) {
              model = this.allField.reduce((res, cur) => {
                if (cur.value) {
                  res[cur.columns] = cur.value
                }
                return res
              }, {})
            }
          } else {
            switch (this.pageType) {
              case 'update':
                for (let key in defaultValue) {
                  model[key] = defaultValue[key];
                }
                for (let key in this.fieldModel) {
                  if (this.oldFieldModel[key] !== this.fieldModel[key]) {
                    model[key] = this.fieldModel[key];
                  }
                }
                break;
              case 'add':
                for (let key in this.fieldModel) {
                  if (this.fieldModel[key] === '' && key !== 'openid') {
                    delete this.fieldModel[key];
                  }
                }
                model = this.deepClone(this.fieldModel);
                break;
              case 'detaillist':
                for (let key in this.fieldModel) {
                  if (this.oldFieldModel[key] !== this.fieldModel[key]) {
                    model[key] = this.fieldModel[key];
                  }
                }
                default:
                  for (let key in this.fieldModel) {
                    if (this.oldFieldModel[key] !== this.fieldModel[key]) {
                      model[key] = this.fieldModel[key];
                    }
                  }
                  break;
            }
          }
          if (Object.keys(model).length > 0) {
            // this.oldField.forEach(item => {
            // 	if (model[item.columns] === item.value) {
            // 		delete model[item.columns]
            // 	}
            // })
            debugger
            return model;
          } else {
            // return this.allField.reduce((res, cur) => {
            // 	if (cur.value) {
            // 		res[cur.columns] = cur.value
            // 	}
            // 	return res
            // }, {});
            // uni.showToast({
            // 	title: '没有需要提交的数据',
            // 	icon: 'none'
            // });
            return false;
          }
        } else {
          console.log('表单校验失败', showsNum, valid, this.fieldModel);
          uni.showToast({
            title: '请填写完信息后，再尝试提交',
            icon: 'none'
          });
          return false;
        }
      },
      handlerReduant(obj){
        // 处理冗余操作
        const e = this.deepClone(obj)
        for (let index = 0; index < this.allField.length; index++) {
          const item = this.deepClone(this.allField[index])
          console.log(item)
          if (e.bx_col_type === 'fk' && e.colData && typeof e.colData === 'object' && Array.isArray(e
              .colData) !==
            true && Object.keys(e.colData).length > 0) {
            if (item.redundant && typeof item.redundant === 'object' && item.redundant
              .dependField ===
              e.column) {
              if (item.redundant.trigger === 'always') {
                item.value = e.colData[item.redundant.refedCol];
                this.handlerReduant(item)
              } else if (item.redundant.trigger === 'isnull') {
                if (!item.value) {
                  item.value = e.colData[item.redundant.refedCol];
                  this.handlerReduant(item)
                }
              }
              this.fieldModel[item.column] = item.value;
              if (item.type == 'images') {
                this.$refs.fitem[index].getDefVal()
              }
              this.$emit('value-blur', this.fieldModel[item.column], this.fieldModel);
            }
          }
        }
      },
      async onValChange(e) {
        // 保存已经发生变化的字段值
        if (e.type === 'number' || e.type === 'digit') {
          e.value = Number(e.value);
        }
        this.fieldModel[e.column] = e.value;
        const fieldModel = this.deepClone(this.fieldModel);
        const column = e.column
        // const triggerColumns = this.allField.filter((item)=>item.)
        this.handlerReduant(e)
        for (let index = 0; index < this.allField.length; index++) {
          const item = this.allField[index]
          if (Array.isArray(item.isShowExp) && item.isShowExp.length > 0) {
            item.display = this.colItemShowExps(item, this.fieldModel)
          } else if (item.formulaShow) {
            item.display = evaluatorTo(fieldModel, item.formulaShow);
          }
          if (item.display !== false) {
            item.display = true
          }
          if (item.column === e.column) {
            item.value = e.value;
            if (item.type === 'Set') {
              item.option_list_v2 = e.option_list_v2;
            }
          }

          if (!item.value && this.pageType === 'filter') {
            // item.value = '全部'
          }

          this.$set(this.allField, index, item)
        }
        this.$emit('value-blur', this.fieldModel, e);
      },
      onValBlur(e) {
        if (e.hasOwnProperty('value')) {
          this.fieldModel[e.column] = e.value;
          this.$emit('value-blur', e, this.fieldModel);
        }
      },
      chooseLocation(e) {
        this.allField = this.allField.map((item, index) => {
          if (item.column === 'latitude' && e.latitude) {
            item.value = e.latitude;
          }
          if (item.column === 'longitude' && e.longitude) {
            item.value = e.longitude;
          }
          this.fieldModel[item.column] = item.value;
          this.$set(this.allField, index, item);
          return item;
        });
        this.$emit('value-blur', this.fieldModel);
      },
      onReset() {
        if (Array.isArray(this.oldField) && this.oldField.length > 0) {
          this.allField = this.oldField.map((item, index) => {
            this.$refs.fitem[index].fieldData.value = item.value;
            this.fieldModel[item.columns] = item.value
            if (this.pageType === 'filter') {
              if (item.defaultValue) {
                item.value = item.defaultValue
              } else if (item.type === 'Selector') {
                item.value = '全部'
                if (this.fieldModel[item.columns]) {
                  this.fieldModel[item.columns] = '全部'
                }
              }
            }
            if (item.type === 'Set') {
              this.$refs.fitem[index].initSetOptions()
            }
            this.$set(this.allField, index, item);
            return item;
          });
          return true;
        } else {
          return false;
        }
      }
    },
    watch: {
      fields: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (Array.isArray(newValue) && newValue.length > 0) {
            if (this.allField.length === 0) {
              this.oldField = this.deepClone(newValue);
            }
            this.allField = newValue.map(item => {
              // if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
              // 	let login_user_info = uni.getStorageSync('login_user_info')
              // 	item.value = login_user_info?.user_no || '';
              // }
              if (!item.value && this.pageType === 'filter') {
                // item.value = '全部'
              }
              return item
            });
          }
        }
      },
      moreConfig: {
        handler(newValue, oldValue) {
          if (newValue) {
            this.more_config = this.deepClone(newval);
          }
        }
      }
    }
  };
</script>
