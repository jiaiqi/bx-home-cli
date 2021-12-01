<template>
  <view class="a-form">
    <view class="field-item" :class="{'hidden':showField(field)!==true||!field.display}"
      v-for="(field,fIndex) in allField">
      <view class="section-name" v-if="field.section&&showSectionName">
        {{field.section}}
      </view>
      <a-form-item :class="{'section-top':field.section,'before-section':eleIsBeforeSection(allField,fIndex)}"
        :srvApp="srvApp" :procData="procData" :labelPosition="labelPosition" :fieldsModel="fieldModel"
        :optionMode="optionMode" @on-value-change="onValChange" @on-value-blur="onValBlur"
        @chooseLocation="chooseLocation" :key="field.id" :field="field" :pageType="pageType" ref="fitem"
        :section-top="field.section?true:false" :before-section="eleIsBeforeSection(allField,fIndex)"
        @setColData="setColData" @setFieldModel="setFieldModel"></a-form-item>
    </view>
  </view>
</template>
<style lang="scss">
  .section-name {
    padding: 10rpx;
    color: #B8BAC0;
  }

  .field-item {
    overflow: hidden;
    box-sizing: border-box;

    &.hidden {
      width: 0 !important;
      min-width: 0 !important;
      display: none;
    }

    .before-section {
      // border-radius: 0 0 20rpx 20rpx;
      border-bottom-left-radius: 20rpx;
      border-bottom-right-radius: 20rpx;
      margin-bottom: 20rpx;
    }

    .section-top {
      // border-radius: 20rpx 20rpx 0 0;
      border-top-left-radius: 20rpx;
      border-top-right-radius: 20rpx;

    }

    .section-top:first-child {
      margin-top: 0;
    }
  }

  @media screen and (min-width:450px) {
    .field-item {
      background-color: #fff;
      border: 1px solid #E5E6E9;
      margin-right: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
    }
  }

  @media screen and (max-width:750px) {
    .field-item {
      flex: 1;
      min-width: 90%;
    }
  }

  @media screen and (min-width: 750px) {
    .a-form {}

    .field-item {
      // max-width: 30%;
      width: 300px;
      // flex: 1;
      // min-width: 250px;
      background-color: #fff;
      border: 1px solid #E5E6E9;
      margin-right: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      max-width: 300px;

      .form-item {}
    }
  }
</style>
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
    computed: {
      showSectionName() {
        return this.moreConfig?.showSectionName
      }
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
      eleIsBeforeSection(allField, index) {
        let item = allField[index]
        if (index + 1 < allField.length) {
          let nextItem = allField[index + 1]
          if (nextItem?.section) {
            return true
          }
        }
        if (index === allField.length - 1) {
          return true
        }
      },
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
            } else {
              // debugger
            }
          } else if (item.column !== valids.column) {
            // debugger
          }
        });
        // debugger
        let defaultValue = this.allField.reduce((res, cur) => {
          if (cur.defaultValue !== null && cur.defaultValue !== undefined) {
            res[cur.columns] = cur.defaultValue
          }
          return res
        }, {})
        if (valid === showsNum) {
          console.log('表单校验通过', showsNum, valid, this.fieldModel);
          let model = {};
          if (this.formType === 'add') {
            // model = this.deepClone(this.fieldModel)
            // if (Object.keys(model).length === 0) {
            model = this.allField.reduce((res, cur) => {
              if (cur.value !== null && cur.value !== undefined) {
                res[cur.columns] = cur.value
              }
              return res
            }, {})
            // }
          } else if (this.formType === 'detail') {
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
              case 'addchildlist':
                model = this.deepClone(this.fieldModel);
                break;
              case 'detaillist':
                for (let key in this.fieldModel) {
                  if (this.oldFieldModel[key] !== this.fieldModel[key]) {
                    model[key] = this.fieldModel[key];
                  }
                }
                break;
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
      setColData(e) {
        this.handlerReduant(e)
        this.$emit('setColData', e)
      },
      handlerReduant(obj, _dependFields) {
        // 处理冗余操作
        const e = this.deepClone(obj)
        for (let index = 0; index < this.allField.length; index++) {
          const item = this.allField[index]
          if (e.bx_col_type === 'fk' && e.column !== item.column) {
            if (item.redundant && typeof item.redundant === 'object' && item.redundant
              .dependField ===
              e.column) {
              if (item.redundant.trigger === 'always') {
                if (e.colData && typeof e.colData === 'object' && Array.isArray(e
                    .colData) !==
                  true && Object.keys(e.colData).length > 0) {
                  item.value = e.colData[item.redundant.refedCol];
                } else {
                  // item.value = null
                }
                item.old_value = item.value
                let dependFields = this.allField.reduce((res, cur) => {
                  if (cur?.redundant?.dependField === item.column && cur.column !== item.column) {
                    res.push(cur.column)
                  }
                  return res
                }, [])
                if (item.value !== item.old_value && dependFields && dependFields.length > 0) {
                  this.handlerReduant(item, dependFields)
                }
              } else if (item.redundant.trigger === 'isnull') {
                if (!item.value) {
                  if (e.colData && typeof e.colData === 'object' && Array.isArray(e
                      .colData) !==
                    true && Object.keys(e.colData).length > 0) {
                    item.value = e.colData[item.redundant.refedCol];
                    item.old_value = item.value
                  }
                }
              }
              this.fieldModel[item.column] = item.value;
              if (item.type == 'images') {
                setTimeout(() => {
                  // this.$refs.fitem[index].getDefVal()
                }, 200)
              }
              this.$emit('value-blur', this.fieldModel, item);
            }
          }
        }
      },
      setFieldModel(e) {
        this.fieldModel[e.column] = e.value;
      },
      async onValChange(e) {
        // 保存已经发生变化的字段值
        console.log('onValChange')
        if (e.type === 'number' || e.type === 'digit') {
          e.value = Number(e.value);
        }
        this.fieldModel[e.column] = e.value;
        const fieldModel = this.fieldModel;
        const column = e.column
        // const triggerColumns = this.allField.filter((item)=>item.)
        this.handlerReduant(e)


        for (let index = 0; index < this.allField.length; index++) {
          const item = this.allField[index]

          if (e?.moreConfig?.val_trigger) {
            let val_trigger = e?.moreConfig?.val_trigger;
            if (val_trigger.col === item.column) {
              let val = await this.getTriggerVal(val_trigger, this.fieldModel)
              debugger
              if (val && val[item.column]) {
                item.value = val[item.column];
                this.fieldModel[item.column] = item.value;
              }
            }
          }


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
          this.$emit('value-blur', this.fieldModel, e);
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
