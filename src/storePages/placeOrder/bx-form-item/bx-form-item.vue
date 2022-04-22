<template>
  <view class="form-item" :class="{'label-top':['textarea'].includes(fieldData.type)}">
    <view class="field-section-name" v-if="fieldData.section">
      <!-- {{fieldData.section||''}} -->
    </view>
    <view class="form-item-content">
      <view class="field-label" :for="fieldData.column">
        <text class="is-required" :class="{'text-hidden':fieldData.isRequire!==true}">*</text>
        <text>{{fieldLabel}}</text>
      </view>
      <view class="field-value" :class="{
        'form-detail': pageType === 'detail',
        'valid_error':!valid.valid
      }">
        <!-- detail-详情-start -->
        <view class="field-value_detail form-item_image" v-if="pageType === 'detail' && fieldData.type === 'images'">
          <!--   <image class="field-value_detail image" v-for="(item, index) in imagesUrl" :key="index"
            style="padding: 5upx" lazy-load show-menu-by-longpress @tap="previewImage(item, 'Image')" data-target="Image"
            :src="item"></image> -->
        </view>
        <view class="field-value_detail rich-text" v-else-if="
            pageType === 'detail' &&['snote','Note','RichText'].includes(fieldData.type)
          ">
          <mp-html :content="fieldData.value.replace(/\<img/gi, '<img width=100%')" v-if="fieldData.value" />
        </view>
        <view class="field-value_detail text" v-else-if="pageType === 'detail'" @click="toFKLink">
          {{ fkFieldLabel || fieldData.value | formalText }}
          <!-- <text class="cuIcon-link margin-left" v-if="canLink"></text> -->
        </view>
        <!-- detail-详情-end -->

        <!-- form-表单-start -->
        <bx-radio-group v-else-if="fieldData.type === 'Selector'" class="form-item-content_value radio-group"
          v-model="fieldData.value" mode="button" :disabled="disabled">
          <bx-radio v-for="item in radioOptions" :key='item.value' :name="item.value">{{ item.label }}
          </bx-radio>
        </bx-radio-group>

        <bx-radio-group class="form-item-content_value radio-group" :mode="optionMode" :disabled="fieldData.disabled"
          v-model="fieldData.value" v-else-if="fieldData.type === 'radioFk'" @change="radioChange">
          <bx-radio :iconSize="fieldData.iconSize" class="radio" color="#2979ff" v-for="item in radioOptions"
            :key="item.value" :disabled="fieldData.disabled||false" :name="item.value" :serial-char="item.serialChar">
            {{ item.label }}
          </bx-radio>
        </bx-radio-group>

        <input type="text" class="text" @input="onInput" placeholder-class="place-holder" :placeholder="placeholder"
          @blur="onBlur" :maxlength="maxLength" v-model="fieldData.value" :disabled="disabled"
          v-else-if="fieldData.type === 'text'" />
        <input class="" style="width: 100%" @blur="onBlur" placeholder-class="place-holder" :placeholder="placeholder"
          :type="fieldData.type" @input="onInput" :maxlength="maxLength" :max="min" :min="min"
          v-model.number="fieldData.value" :disabled="disabled"
          v-else-if="['number','digit'].includes(fieldData.type) " />
        <!-- form-表单-end -->
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        fieldData: {},
        valid: {
          column: this.field.column,
          valid: true,
          msg: '不能为空!'
        },
      }
    },
    props: {
      pageType: {
        type: String,
        default: 'form'
      },
      field: {
        type: Object
      },
    },
    computed: {
      radioOptions() {
        if (Array.isArray(this.fieldData.options)) {
          return this.fieldData.options
        }
      },
      radioMode() {
        return 'button'
      },
      placeholder() {
        return this.fieldData?.disabled ? '不可编辑' : `请输入${this.fieldLabel}`
      },
      fieldLabel() {
        return this.fieldData?.customLabel || this.fieldData?.label || ''
      },
      min() {
        return this.fieldData?.min || this.fieldData?.item_type_attr?.max
      },
      max() {
        return this.fieldData?.max || this.fieldData?.item_type_attr?.min
      },
      maxLength() {
        return this.fieldData.item_type_attr?.max_len || 9999
      },
      disabled() {
        return this.fieldData?.disabled || false
      },
    },
    methods: {
      radioChange(e) {

      },
      onInput(e) {

      },
    },
    watch: {
      field: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue && typeof newValue === 'object') {
            this.fieldData = this.deepClone(this.field)
          } else {
            this.fieldData = {}
          }
        }
      }
    },

  }
</script>

<style scoped lang="scss">
  .form-item {
    .field-section-name {
      padding: 5px 20px;
      color: #888;
    }

    .form-item-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      background-color: #fff;
      padding: 10px;
      border-bottom: 1rpx solid #f8f8f8;
      min-height: 40px;
    }


    .field-label {
      min-width: 30%;
      padding-right: 10px;
      color: #999;
      text-align: left;
    }

    .field-value {
      flex: 1;
      text-align: right;
      display: flex;
      justify-content: flex-end;

      .text {
        // border-radius: 1px;
        flex: 1;
        padding: 0 10px;
        text-align: right;
        min-height: 30px;
        line-height: 30px;
        background-color: #f8f8f8;
      }

      .place-holder {
        font-size: 14px;
      }
    }

    &.label-top {

      .field-label,
      .field-value {
        width: 100%;
      }
    }
  }

  .text-hidden {
    opacity: 0;
  }

  .is-required {
    color: #ff0000;
    display: inline-flex;
    align-items: center;
    width: 20rpx;
  }
</style>
