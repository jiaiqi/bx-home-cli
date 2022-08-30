<template>
  <view class="a-form" :style="{
			'--global-text-font-size':globalTextFontSize + 'px',
			'--global-label-font-size': globalLabelFontSize + 'px'
		}">
    <view class="form-remark" v-if="remarkCfg&&remarkCfg.top" :style="[remarkCfg.top.style]">
      {{remarkCfg.top.content||''}}
    </view>
    <view class="field-item" :class="{'hidden':showField(field)!==true||!field.display}"
      v-for="(field,fIndex) in allField" :key="fIndex">
      <view class="section-name" :class="{'show':showSectionName}" v-if="field.section">
        <text v-if="showSectionName">{{field.section}}</text>
      </view>
      <a-form-item :class="{'section-top':field.section,'before-section':eleIsBeforeSection(allField,fIndex)}"
        :srvApp="srvApp" :serviceNo="serviceNo" :form-type="formType" :procData="procData"
        :labelPosition="labelPosition" :fieldsModel="fieldModel" :mainData="mainData" :optionMode="optionMode"
        @on-value-change="onValChange" @on-value-blur="onValBlur" @chooseLocation="chooseLocation" :key="field.id"
        :field="field" :pageType="pageType" ref="fitem" :section-top="field.section?true:false"
        :before-section="eleIsBeforeSection(allField,fIndex)" @setColData="setColData" @setFieldModel="setFieldModel"
        @date-change="dateChange"
        @date-time-change="dateTimeChange">
      </a-form-item>

    </view>
    <view class="form-remark" v-if="remarkCfg&&remarkCfg.bottom" :style="[remarkCfg.bottom.style]">
      {{remarkCfg.bottom.content||''}}
    </view>
  </view>
</template>

<script>
  export default {
    name: 'aForm',
    props: {
      mainData: {
        type: [Object, Boolean]
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
    async created() {
      const oldFieldModel = this.oldField.reduce((res, cur) => {
        if (cur.value) {
          if (cur.column) {
            res[cur.column] = cur.value
          } else if (cur.columns) {
            res[cur.columns] = cur.value
          }
        } else if (cur.defaultValue) {
          if (cur.column) {
            res[cur.column] = cur.value
          } else if (cur.columns) {
            res[cur.columns] = cur.value
          }
        }
        if(cur.columns === 'service_people_no'&& res[cur.columns]){
          this.serviceNo =  res[cur.columns]
        }
        return res
      }, {})
      this.oldFieldModel = this.deepClone(oldFieldModel)
      this.fieldModel = this.deepClone(oldFieldModel)
    },
    computed: {
      showSectionName() {
        return this.moreConfig?.showSectionName
      },
      remarkCfg() {
        if (this.moreConfig?.remark_cfg) {
          return this.moreConfig?.remark_cfg
        }
      },
    },
    data() {
      return {
        serviceNo: '',
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
      dateChange(e) {
        const {
          start_col,
          end_col
        } = e?.moreConfig || {}
        debugger
        if (start_col && end_col) {
          this.allField = this.allField.map(item => {
            if (item.column === start_col) {
              item.value = e.colData['start']
              this.fieldModel[start_col] = e.colData['start']
            }
            if (item.column === end_col) {
              item.value = e.colData['end']
              this.fieldModel[end_col] = e.colData['end']
            }
            return item
          })
        }
      },
      dateTimeChange(e) {
        const start_time_col = e?.moreConfig?.start_time_col
        const end_time_col = e?.moreConfig?.end_time_col
        if (start_time_col && end_time_col) {
          this.allField = this.allField.map(item => {
            if (item.column === start_time_col) {
              item.value = e.colData['time_start']
              this.fieldModel[start_time_col] = e.colData['time_start']
            }
            if (item.column === end_time_col) {
              item.value = e.colData['time_end']
              this.fieldModel[end_time_col] = e.colData['time_end']
            }
            return item
          })
        }

      },
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
        } else if (this.pageType === 'detail') {
          return field.in_detail === 1
        }
        return true
      },
      getFieldModel() {
        let valid = 0;
        let showsNum = 0;
        console.log(this.deepClone(this.allField))
        this.allField.map((item, index) => {
          let valids = this.$refs.fitem[index].getValid();
          console.log('字段校验', valids, item);
          // if (item.display) {
          showsNum++;
          if (valids.valid) {
            valid++;
          } else {
            debugger
          }
          // } else if (item.column !== valids.column) {
          // 	// debugger
          // }
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
            model = this.allField.reduce((res, cur) => {
              if (cur.value !== undefined) {
                res[cur.columns] = cur.value
              }
              return res
            }, {})
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
                  model[key] = model[key] || defaultValue[key];
                }
                for (let key in this.fieldModel) {
                  // if (this.oldFieldModel[key] !== this.fieldModel[key]) {
                  model[key] = this.fieldModel[key];
                  // }
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
            return model;
          } else {
            return false;
          }
        } else {
          console.log('表单校验失败', showsNum, valid, this.fieldModel);
          uni.showToast({
            title: '请检查输入数据是否完整',
            icon: 'none'
          });
          return false;
        }
      },
      setColData(e) {
        if (e && e.column) {
          this.handlerReduant(e)
          this.$emit('setColData', e)
        }
      },
      handlerReduant(obj, _dependFields) {
        // 处理冗余操作
        const e = this.deepClone(obj)
        for (let index = 0; index < this.allField.length; index++) {
          let item = this.allField[index]
          if (e.bx_col_type === 'fk' && e.column !== item.column && item.redundant && item?.redundant
            ?.dependField) {
            if (item.redundant.dependField === e.column && e.colData) {
              // debugger
              if (item.redundant.trigger === 'always') {
                if (e.colData && typeof e.colData === 'object' && Array.isArray(e
                    .colData) !==
                  true && Object.keys(e.colData).length > 0) {
                  item.old_value = item.value
                  item.value = e.colData[item.redundant.refedCol]
                  if (e.colData[item.redundant.refedCol] === 0) {
                    item.value = e.colData[item.redundant.refedCol]
                  }
                  let dependFields = this.allField.reduce((res, cur) => {
                    if (cur?.redundant?.dependField === item.column && cur.column !== item
                      .column) {
                      res.push(cur.column)
                    }
                    return res
                  }, [])
                  // if (item.value !== item.old_value && dependFields && dependFields.length > 0) {
                  //   this.handlerReduant(item, dependFields)
                  // }
                } else {
                  // item.value = null
                }
                let dependFields = this.allField.reduce((res, cur) => {
                  if (cur?.redundant?.dependField === item.column && cur.column !== item
                    .column) {
                    res.push(cur.column)
                  }
                  return res
                }, [])
                // if (item.value !== item.old_value && dependFields && dependFields.length > 0) {
                //   this.handlerReduant(item, dependFields)
                // }
              } else if (item.redundant.trigger === 'isnull') {
                if (!item.value) {
                  if (e.colData && typeof e.colData === 'object' && Array.isArray(e
                      .colData) !==
                    true && Object.keys(e.colData).length > 0) {
                    item.old_value = item.value
                    item.value = e.colData[item.redundant.refedCol];
                  }
                }
              }
              console.log('handlerReduant', item.column, item.value)
              this.fieldModel[item.column] = item.value;
              // this.$emit('value-blur', this.fieldModel, item);
            }
          }
        }
        return
      },
      setFieldModel(e) {
        console.log('setFieldModel', e.column, e.value)
        this.fieldModel[e.column] = e.value;
      },
      async onValChange(e) {
        // 保存已经发生变化的字段值
        e = this.deepClone(e)
        console.log('onValChange', e.column, e.value)
        if (e.column === 'service_people_no') {
          this.serviceNo = e.value
        }
        if (e.type === 'number' || e.type === 'digit') {
          e.value = e.value !== null && e.value !== undefined ? Number(e.value) : null;
        }
        this.fieldModel[e.column] = e.value;
        const fieldModel = this.fieldModel;
        const column = e.column

        let dependFields = this.allField.reduce((res, cur) => {
          if (cur?.redundant?.dependField === e.column && cur.column !== e.column) {
            res.push(cur.column)
          }
          return res
        }, [])
        if (dependFields && dependFields.length > 0) {
          await this.handlerReduant(e, dependFields)
        } else {
          // debugger
          // this.handlerReduant(e)
        }

        for (let index = 0; index < this.allField.length; index++) {
          const item = this.allField[index]
          if (item.column === e.column) {
            item = this.deepClone(e)
          }

          if (e?.moreConfig?.val_trigger) {
            let val_trigger = e?.moreConfig?.val_trigger;
            if (val_trigger.col === item.column || val_trigger.col.indexOf(item.column) !== -1) {
              let val = await this.getTriggerVal(val_trigger, this.fieldModel)
              if (val && val[item.column]) {
                item.value = val[item.column];
                this.fieldModel[item.column] = item.value;
              }
            }
          }

          if (item.display !== false) {
            item.display = true
          }
          if (item.column === e.column) {
            if (item.type === 'Set') {
              item.option_list_v2 = e.option_list_v2;
            }
          }

          if (!item.value && this.pageType === 'filter') {
            // item.value = '全部'
          }
          this.$set(this.allField, index, item)
          this.$nextTick(() => {
            if (item.type === 'Selector' && Array.isArray(item.option_list_v2?.conditions) && item
              .option_list_v2.conditions.find(cond => cond.colName === e.column)) {
              this.$refs.fitem[index].refresh()
            }
          })
        }
        this.$emit('value-blur', this.fieldModel, e);
      },
      onValBlur(e) {
        if (e.hasOwnProperty('value')) {
          console.log('onValBlur', e.column, e.value)
          this.fieldModel[e.column] = e.value;
          // this.$emit('value-blur', this.fieldModel, e);
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
        // this.$emit('value-blur', this.fieldModel,fieldData);
      },
      onReset() {
        let self = this
        if (Array.isArray(this.oldField) && this.oldField.length > 0) {
          this.allField = this.oldField.map((item, index) => {
            this.$refs.fitem[index].fieldData.value = item.value;
            this.fieldModel[item.columns] = item.value
            console.log('onReset', item.column, item.value)
            self.$refs.fitem[index]?.$refs?.optionSelector?.onreset?.()
            if (self.pageType === 'filter') {
              if (item.defaultValue) {
                item.value = item.defaultValue
              } else if (item.type === 'Selector') {
                item.value = ''
                if (self.fieldModel[item.columns]) {
                  self.fieldModel[item.columns] = ''
                }
                self.$refs.fitem[index].refresh()
              } else if (item.type === 'TreeSelector') {
                item.value = ''
                item.colData = null
                if (self.fieldModel[item.columns]) {
                  self.fieldModel[item.columns] = ''
                }
                self.$refs.fitem[index]?.reset?.()
              }
            }
            if (item.type === 'Set') {
              self.$refs.fitem[index].initSetOptions()
            }
            self.$set(self.allField, index, item);
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
            this.allField = newValue
          }
        }
      },
      moreConfig: {
        handler(newValue, oldValue) {
          if (newValue) {
            this.more_config = this.deepClone(newValue);
          }
        }
      }
    }
  };
</script>

<style lang="scss">
  .a-form {
    padding: 0;
    width: 100%;
  }

  .section-name {
    padding: 5px 10px 0;
    color: #B8BAC0;

    // line-height: 30px;
    &.show {
      padding: 10px 10px 5px;
      line-height: 30px;
    }
  }

  .field-item {
    overflow: hidden;
    box-sizing: border-box;

    &.hidden {
      width: 0 !important;
      min-width: 0 !important;
      display: none;
    }

    // .before-section {
    //   border-bottom-left-radius: 20rpx;
    //   border-bottom-right-radius: 20rpx;
    //   // margin-bottom: 20rpx;
    // }

    // .section-top {
    //   border-top-left-radius: 20rpx;
    //   border-top-right-radius: 20rpx;
    // }

    // .section-top:first-child {
    //   margin-top: 0;
    // }
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
      min-width: 300px;
      flex: 1;
      // min-width: 250px;
      background-color: #fff;
      border: 1px solid #E5E6E9;
      margin-right: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      // max-width: 300px;

      .form-item {}
    }
  }
</style>
