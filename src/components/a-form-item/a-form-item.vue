<template>
  <view class="form-item" v-if="fieldData.display" :class="{
    'section-top':sectionTop,
    'before-section':beforeSection,
		'disabled-field':fieldData.disabled,
      'form-detail': pageType === 'detail',
      valid_error: !valid.valid,
      'flex-column': labelPosition === 'top' || label_width === '100%',
    }">
    <label :for="fieldData.column" class="form-item-label" :class="{
        'form-detail': pageType === 'detail',
        valid_error: !valid.valid,
        'label-top': labelPosition === 'top' || label_width === '100%',
      }" :style="{
        width: label_width,
        'align-items': labelAlign ? labelAlign : 'left',
        'background-color': labelPosition === 'left' ? '' : '',
      }">
      <text class="label" :for="fieldData.column">
        <text class="text-red is-required" v-if="fieldData.isRequire&&formType!=='detail'">{{
          fieldData.isRequire ? "*" : ""
        }}</text>
        <text class="text-hidden is-required" v-else>*</text>
        <text>{{ fieldData.customLabel|| fieldData.label }}</text>
      </text>
    </label>
    <view class="form-item-content" :class="{
        'form-detail': pageType === 'detail',
        valid_error: !valid.valid,
        'label-top': labelPosition === 'top' || label_width === '100%',
      }">
      <!-- detail-详情-start -->
      <view class="form-item-content_detail form-item_image"
        v-if="pageType === 'detail' && fieldData.type === 'images'">
        <image class="form-item-content_detail image" v-for="(item, index) in imagesUrl" :key="index"
          style="padding: 5upx" lazy-load show-menu-by-longpress @tap="previewImage(item, 'Image')" data-target="Image"
          :src="item"></image>
      </view>
      <view class="form-item-content_detail rich-text" v-else-if="
          pageType === 'detail' &&
          (field.type === 'snote' ||
            field.type === 'Note' ||
            field.type === 'RichText')
        ">
        <mp-html :content="fieldData.value.replace(/\<img/gi, '<img width=100%')" v-if="fieldData.value" />
        <!-- <rich-text :nodes="field.value" class="value rich-text"></rich-text> -->
      </view>
      <view class="form-item-content_detail text" :class="{ 'can-link': canLink }" v-else-if="pageType === 'detail'"
        @click="toFKLink">
        {{ fkFieldLabel || fieldData.value | formalText }}
        <!-- <text class="cuIcon-link margin-left" v-if="canLink"></text> -->
      </view>
      <!-- detail-详情-end -->
      <!-- form-item-start -->
      <bx-radio-group class="form-item-content_value radio-group" :mode="optionMode" v-model="fieldData.value"
        v-else-if="fieldData.type === 'radio'" @change="radioChange" :disabled="fieldData.disabled">
        <bx-radio class="radio" color="#2979ff" v-for="item in fieldData.options" :key="item"
          :disabled="fieldData.disabled|| false" :name="item">{{ item }}</bx-radio>
      </bx-radio-group>
      <bx-radio-group class="form-item-content_value radio-group" :mode="optionMode" :disabled="fieldData.disabled"
        v-model="fieldData.value" v-else-if="fieldData.type === 'radioFk'" @change="radioChange">
        <bx-radio :iconSize="fieldData.iconSize" class="radio" color="#2979ff" v-for="item in radioOptions"
          :key="item.value" :disabled="fieldData.disabled||false" :name="item.value" :serial-char="item.serialChar">
          {{ item.label }}
        </bx-radio>
      </bx-radio-group>
      <checkbox-group name="checkbox-group" class="form-item-content_value checkbox-group"
        v-else-if="fieldData.type === 'checkbox'" :disabled="fieldData.disabled">
        <label v-for="(item, index) in radioOptions" :key="index" class="checkbox">
          <checkbox color="#2979ff" :value="item" :disabled="fieldData.disabled|| false" :checked="isChecked(item)" />
          <text style="flex: 1" class="text">{{ item }}</text>
        </label>
      </checkbox-group>
      <bx-checkbox-group :mode="optionMode" v-model="fieldData.value" class="form-item-content_value checkbox-group"
        v-else-if="fieldData.type === 'checkboxFk'" :disabled="fieldData.disabled || false" @change="onBlur">
        <bx-checkbox v-model="item.checked" v-for="(item,index) in radioOptions" :key="index" :name="item.label">
          {{ item.label }}
        </bx-checkbox>
      </bx-checkbox-group>
      <view class="form-item-content_value" v-else-if="popupFieldTypeList.includes(fieldData.type)">
        <view class="selector-tip"
          v-if="selectorData.length===0&&setOptionList.length===0&&!fkFieldLabel&&!fieldData.value"
          @click="openModal(fieldData.type)">
          请选择
          <text class="cuIcon-right margin-left-xs"></text>
        </view>
        <view class="" v-else-if="selectorData.length===0&&fkFieldLabel" @click="openModal(fieldData.type)">
          {{fkFieldLabel}}
          <text class="cuIcon-right margin-left-xs"></text>
        </view>
        <view class="selector-tip"
          v-else-if="fieldData.type === 'Selector'&&fieldData.moreConfig&&fieldData.moreConfig.editor_type==='selectorList'"
          @click.stop="openModal">
          {{fkFieldLabel||fieldData.value||'请选择'}}
          <text class="cuIcon-right margin-left-xs"></text>
        </view>
        <view v-else-if="
            (setOptionList&&setOptionList.length < 5 && fieldData.type === 'Set') ||
            (radioOptions&&radioOptions.length <= 4 && fieldData.type === 'Selector'&&fieldData.bx_col_type!=='fk')
          ">
          <bx-checkbox-group v-if=" fieldData.type==='Set'" class=" form-item-content_value checkbox-group"
            v-model="fieldData.value" mode="button" @change="onBlur">
            <bx-checkbox v-for="item in setOptionList" :key="item.value" :name="item.value" v-model="item.checked">
              {{ item.label }}
            </bx-checkbox>
          </bx-checkbox-group>
          <bx-radio-group v-if="fieldData.type === 'Selector'" class="form-item-content_value radio-group"
            v-model="fieldData.value" mode="button" @change="pickerChange" :disabled="fieldData.disabled">
            <bx-radio v-for="item in radioOptions" :key='item.value' :name="item.value">{{ item.label }}
            </bx-radio>
          </bx-radio-group>
        </view>
        <view @click="openModal(fieldData.type)" class="open-popup" v-else>
          <view class="place-holder" v-if="!fieldData.value">
            <text>{{!fieldData.disabled?'请选择':''}}</text>
            <text class="cuIcon-right" v-if="!fieldData.disabled"></text>
          </view>
          <view class="value hidden" v-else-if="fieldData.value && isArray(fieldData.value)">
            {{ fieldData.value.toString() }}
          </view>
          <text class="value hidden" v-else-if="fkFieldLabel">{{
					  fkFieldLabel|| ""
					}}</text>
          <view class="value hidden" v-else-if="fieldData.value">{{
            fieldData.value
          }}</view>
          <text class="cuIcon-right" v-if="fieldData.value&&!fieldData.disabled"></text>
        </view>
      </view>
      <view class="form-item-content_value picker" v-else-if="pickerFieldList.includes(fieldData.type)">
        <date-range-picker style="width: 100%;" :disabled="fieldData.disabled" :field="fieldData" :mode="pickerMode"
          :isRange="pageType==='filter'" :priceConfig="datePriceConfig" :fieldsModel="fieldsModel" :max="max" :min="min"
          v-model="fieldData.value" @change="bindTimeChange">
        </date-range-picker>
      </view>
      <view class="form-item-content_value textarea" v-else-if="fieldData.type === 'textarea'"
        :class="{disabled:fieldData.disabled}">
        <textarea class="textarea-content" :adjust-position="true" :value="fieldData.value" :show-confirm-bar="false"
          :placeholder="fieldData.disabled?'不可编辑':'请输入'" @blur="textareaInput"
          :disabled="fieldData.disabled"></textarea>
      </view>
      <view class="form-item-content_value location" v-else-if="fieldData.type === 'location'" @click="getLocation">
        {{ fkFieldLabel||fieldData.value || "点击选择地理位置" }}
      </view>
      <view class="form-item-content_value location" v-else-if="fieldData.type === 'addr'">
        <input type="text" v-model="fieldData.value" placeholder="选择或填写位置" />
      </view>
      <view class="form-item-content_value" v-else-if="fieldData.type === 'RichText'" @click="showModal('RichEditor')">
        <view class="value rich-text" v-if="!fieldData.value">请输入</view>
        <rich-text :nodes="fieldData.value" class="value rich-text" v-else></rich-text>
      </view>
      <input type="text" class="" style="width: 100%" @input="onInput"
        :placeholder="fieldData.disabled ?'':'请输入'+(fieldData.customLabel||fieldData.label)" @blur="onBlur"
        :maxlength="max_len" v-model="fieldData.value" :disabled="fieldData.disabled|| false"
        v-else-if="fieldData.type === 'text'" />
      <uni-rate v-model="fieldData.value" :readonly="fieldData.disabled"
        :max="fieldData.moreConfig&&fieldData.moreConfig.max?fieldData.moreConfig.max:5"
        :allowHalf="fieldData.moreConfig&&fieldData.moreConfig.allowHalf?fieldData.moreConfig.allowHalf:false"
        v-else-if="(fieldData.type === 'number' || fieldData.type === 'digit')&&fieldData.moreConfig&&fieldData.moreConfig.mode==='rate'" />
      <input class="" style="width: 100%" @blur="onBlur"
        :placeholder="fieldData.disabled ?'当前字段不支持编辑':'请输入'+(fieldData.customLabel||fieldData.label)"
        :type="fieldData.type" @input="onInput" :maxlength="max_len" :max="max" :min="min"
        v-model.number="fieldData.value" :disabled="fieldData.disabled || false" v-else-if="
          (fieldData.type === 'number' || fieldData.type === 'digit') &&
          !fieldData.max
        " />
      <view class="form-item-content_value slider" v-else-if="
          (fieldData.type === 'number' || fieldData.type === 'digit') &&
          fieldData.max
        ">
        <view class="operate" hover-class="active" @click="numberChange('minus')"
          @longpress="longpressNumChange('minus')" @touchend="longpressNumEnd">-</view>
        <slider class="uni-slider" @change="changeSlider" :step="
            fieldData.sliderStep
              ? fieldData.sliderStep
              : fieldData.type === 'digit'
              ? 0.5
              : 1
          " :min="
            fieldData.value && fieldData.value >= fieldData.min
              ? fieldData.min
              : 0
          " :max="
            fieldData.max
              ? fieldData.value > fieldData.max
                ? fieldData.value
                : fieldData.max
              : null
          " :value="
            fieldData.value < fieldData.min ? fieldData.min : fieldData.value
          " v-model="fieldData.value" show-value />
        <view class="operate" hover-class="active" @click="numberChange('add')" @longpress="longpressNumChange('add')"
          @touchend="longpressNumEnd">+</view>
      </view>
      <robby-image-upload class="form-item-content_value image" v-else-if="fieldData.type === 'images'"
        :value="imagesUrl" :enable-del="fieldData.disabled ? !fieldData.disabled : true"
        :enable-add="fieldData.disabled ? !fieldData.disabled : true" :server-url="uploadUrl" @delete="deleteImage"
        @add="getImagesInfo" :form-data="uploadFormData" :header="reqHeader" :showUploadProgress="true"
        :server-url-delete-image="deleteUrl" :limit="fieldData.fileNum">
      </robby-image-upload>
    </view>
    <view class="icon-area" v-if="(fieldData.type === 'location' || fieldData.type === 'addr')"><text
        class="cuIcon-locationfill text-cyan" @click="getLocation"></text></view>
    <view class="valid_msg" v-show="!valid.valid">{{ valid.msg }}</view>
    <view class="cu-modal bottom-modal" v-if="modalName === 'RichEditor'" :class="{ show: modalName === 'RichEditor' }"
      @click="hideModal">
      <view class="cu-dialog" @tap.stop="" v-if="modalName === 'RichEditor'">
        <jin-edit :html="textareaValue" @editOk="saveRichText" :res2Url="uploadRes2Url" :form-data="uploadFormData"
          :header="reqHeader" :uploadFileUrl="uploadUrl" ref="richEditor" />
      </view>
    </view>
    <view class="cu-modal bottom-modal" :class="{ show: modalName === 'TreeSelector' }" @tap="hideModal">
      <view class="cu-dialog" @tap.stop="">
        <view class="tree-selector cascader" v-show="modalName === 'TreeSelector'">
          <tree-selector :srvInfo="fieldData.srvInfo" v-if="fieldData&& fieldData.srvInfo" :srvApp="srvApp"
            :fields-model="fieldsModel" @cancel="hideModal" :current="selectTreeData" @confirm="getCascaderValue">
          </tree-selector>
        </view>
      </view>
    </view>
    <view class="cu-modal bottom-modal" :class="{
        show: modalName === 'Selector' || modalName === 'MultiSelector',
      }" @click="hideModal" @touchmove.prevent.stop="">
      <view class="cu-dialog" @tap.stop="">
        <option-selector :has-next="hasNext" :modalName="modalName"
          :show-search="fieldData.showSearch!==false&&modalName === 'Selector'" :options="radioOptions"
          :selectType="selectType" @load-more="nextPage()" @hide="hideModal()" @search="searchFKDataWithKey" @refresh="refresh()"
          @toFkAdd="toFkAdd" @change="pickerChange">
        </option-selector>
        <!-- <view class="tree-selector">
          <view class="content">
            <view class="cu-bar search bg-white" v-if="modalName === 'Selector' && fieldData.showSearch !== false">
              <view class="search-form round">
                <input @input="searchFKDataWithKey" type="text" placeholder="搜索" confirm-type="search" />
              </view>
              <text class="cu-btn cuIcon-refresh line-blue shadow round margin-right-xs" @click="refresh()"></text>
              <text class="cu-btn cuIcon-add line-blue shadow round margin-right-xs" @click="toFkAdd">
              </text>
            </view>
            <view class="option-box">
              <bx-checkbox-group v-if="modalName === 'MultiSelector'" @change="onBlur"
                class="form-item-content_value checkbox-group" v-model="fieldData.value" mode="button">
                <bx-checkbox v-for="item in setOptionList" :key="item.value" :name="item.value" v-model="item.checked">
                  {{ item.label }}
                </bx-checkbox>
              </bx-checkbox-group>
             <bx-radio-group v-if="modalName === 'Selector'" class="form-item-content_value radio-group"
               mode="button" @change="pickerChange" :disabled="fieldData.disabled">
                <bx-radio v-for="item in radioOptions" :key="item.value" :name="item.value">{{ item.label }}
                </bx-radio>
                 <bx-radio name="__others">其它</bx-radio>
                <view class="other-val" v-if="fieldData.value==='__others'">
                  <input type="text" class="input-value" v-model="otherNodeVal" placeholder="输入其它"
                    @input="selectorInput" />
                </view>
                <view v-if="hasNext" @click.stop="nextPage()" class="cu-btn bx-btn-bg round">加载更多</view>
              </bx-radio-group>
            </view>
          </view>
          <view class="dialog-button">
            <view class="cu-btn bg-blue shadow" @tap="hideModal"
              v-if="modalName === 'MultiSelector'||(modalName === 'Selector'&&otherNodeVal)">确定
            </view>
            <view class="cu-btn bg-grey shadow" @tap="hideModal"
              v-if="modalName === 'Selector'&&fieldData.value!=='__others'">取消</view>
          </view>
        </view> -->
      </view>
    </view>

  </view>
</template>

<script>
  export default {
    name: 'aFormItem',
    filters: {
      formalText(val) {
        if (Array.isArray(val)) {
          val = val.toString();
        } else if (typeof val === 'string') {
          val = val;
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else if (val === 0) {
          val = '0'
        } else if (!val) {
          val = '';
        }
        if (val === 'null') {
          val = '—';
        }
        return val;
      }
    },
    props: {
      field: {
        type: Object,
        required: true
      },
      // label的位置，left-左边，top-上边
      labelPosition: {
        type: String,
        default: 'left'
      },
      // lable字体的对齐方式
      labelAlign: {
        type: String,
        default: ''
      },
      procData: {
        type: Object,
        default () {
          return {};
        }
      },
      fieldsModel: {
        type: Object,
        default () {
          return {};
        }
      },
      formType: {
        type: String,
        default: 'add' //add||update
      },
      pageType: {
        type: String,
        default: 'form' //form||detail
      },
      optionMode: {
        type: String,
        default: 'button' //选项的样式 normal | button
      },
      srvApp: {
        type: String,
      },
      sectionTop: {
        type: Boolean,
        default: false
      },
      beforeSection: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      selectType() {
        // 自行输入 下拉选择 编辑选择
        return this.fieldData?.option_list_v2?.select_type 
      },
      min() {
        return this.fieldData?.item_type_attr?.min || this.fieldData?.min || this.fieldData?.moreConfig?.min
      },
      max_len() {
        return this.fieldData?.item_type_attr?.max_len || this.fieldData?.max_len || this.fieldData?.moreConfig
          ?.max_len || 999999
      },
      max() {
        return this.fieldData?.item_type_attr?.max || this.fieldData?.max || this.fieldData?.moreConfig?.max
      },
      hasNext() {
        return this.treePageInfo.total > this.treePageInfo.rownumber * this.treePageInfo.pageNo
      },
      theme() {
        return this.$store?.state?.app?.theme
      },
      canLink() {
        if (this.fieldData.value && this.fieldData.bx_col_type === 'fk') {
          return true
        }
      },
      radioOptions() {
        if (this.modalName === 'MultiSelector') {
          return this.setOptionList
        }
        const nextRadio = {
          label: '加载更多',
          value: '加载更多',
          checked: false
        }
        if (Array.isArray(this.fieldData.options)) {
          if (this.pageType === 'filter') {
            if (!this.fieldData.options.find(item => item.value === '全部')) {
              return [...this.fieldData.options, {
                label: '全部',
                value: '全部',
                checked: this.fieldData.options.find(item => item.checked) ? false : true
              }]
            } else {
              return this.fieldData.options
            }
          } else {
            return this.fieldData.options
          }
        } else if (Array.isArray(this.selectorData)) {
          // if(this.treePageInfo.total>this.treePageInfo.rownumber*this.treePageInfo.pageNo){
          // 	return [...this.selectorData,nextRadio]
          // }
          return this.selectorData
        }
      },
      uploadUrl() {
        return this.$api.upload;
      },
      deleteUrl() {
        return this.$api.deleteFile;
      },
      label_width() {
        let result = '';

        if (this.labelPosition === 'left') {
          result = 'auto';
        }
        if (['images', 'textarea'].includes(this.fieldData.type)) {
          if (this.pageType === 'detail' && !this.fieldData.value) {

          } else {
            result = '100%'
          }
        }

        return result;
      },
      pickerMode() {
        if (this.fieldData?.moreConfig?.editor_type == 'date_time_linkage') {
          return 'date_time_linkage'
        }
        let type = this.fieldData.type;
        if (this.pickerFieldList.includes(type)) {
          switch (type) {
            case 'Date':
              type = 'date';
              break;
            case 'Time':
              type = 'time';
              break;
          }
          return type;
        }
      },
      datePriceConfig() {
        return this.fieldData?.moreConfig?.date_price_config
      }
    },
    data() {
      return {
        otherNodeVal: "",
        focusTextArea: false,
        checkedList: [],
        fieldData: {},
        imagesUrl: [],
        popupFieldTypeList: ['TreeSelector', 'treeSelector', 'Selector', 'Set'], //点击会弹出popup的字段类型
        pickerFieldList: ['date', 'dateTime', 'time', 'Time', 'Date'],
        reqHeader: {
          bx_auth_ticket: uni.getStorageSync('bx_auth_ticket')
        },
        uploadFormData: {
          serviceName: 'srv_bxfile_service',
          interfaceName: 'add',
          app_no: '',
          table_name: '',
          columns: ''
        },
        listModel: {},
        textareaValue: '',
        treePageInfo: {
          total: 0,
          rownumber: 30,
          pageNo: 1
        },
        selectorData: [],
        setOptionList: [],
        fkFieldLabel: '',
        valid: {
          column: this.field.column,
          valid: true,
          msg: '不能为空!'
        },
        longpressTimer: null,
        modalName: '', //当前显示的modal
        selectorListUUID: "",
        selectTreeData: null
      };
    },
    watch: {
      'fieldData.value': {
        deep: true,
        immediate: true,
        handler(newVal, oldVal) {
          if (newVal !== oldVal && oldVal !== undefined) {
            console.log('watch-fieldData.value', newVal, oldVal, this.fieldData)
            this.fieldData.old_value = oldVal
            if (Array.isArray(newVal) && Array.isArray(oldVal) && newVal.length === oldVal.length && newVal.length >
              0) {
              let length = newVal.length;
              let eq = 0
              for (let i = 0; i < length; i++) {
                if (newVal[i] === oldVal[i]) {
                  eq++
                }
              }
              if (length === eq) {
                return
              }
            }
            this.$emit('on-value-change', this.deepClone(this.fieldData));
            this.$nextTick(() => {
              this.onBlur()
            })
          }
          // if (this.fieldData.type === 'selector') {
          //   self.getDefVal()
          // }
        }
      },
      field: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue?.type === 'Selector' && newValue?.value && oldValue?.value) {
            this.pickerChange(newValue.value)
          }
          if (newValue.type === 'textarea' || newValue.type === 'RichText') {
            this.textareaValue = newValue.value;
          }
          if (newValue.type === 'images') {
            this.getDefVal()
          }
          this.fieldData = newValue;
        }
      }
    },
    methods: {
      selectorInput(e) {
        this.fkFieldLabel = e?.detail?.value;
      },
      toFKLink() {
        // 跳转到fk字段的详情页面
        let serviceName = this.fieldData?.option_list_v2?.serviceName
        let column = this.fieldData?.option_list_v2?.refed_col
        let app = this.fieldData?.option_list_v2?.srv_app || this.srvApp

        if (serviceName && column && this.fieldData.value) {
          let fieldsCond = [{
            column: column,
            value: this.fieldData.value,
            display: false
          }]

          let url =
            `/publicPages/form/form?type=detail&serviceName=${serviceName}&fieldsCond=${JSON.stringify(fieldsCond)}`
          if (app) {
            url += `&appName=${app}`
          }
          let pageStack = getCurrentPages()
          if (Array.isArray(pageStack) && pageStack.length > 9) {
            uni.redirectTo({
              url
            })({
              url
            })
          } else {
            uni.navigateTo({
              url
            })
          }

        }
      },
      isChecked(val) {
        if (this.fieldData && this.fieldData.value && this.fieldData.value.indexOf(val) !== -1) {
          return true
        } else {
          return false
        }
      },
      saveRichText(e) {
        if (e.isSave) {
          if (e.type === 'textarea') {
            this.fieldData.value = this.textareaValue;
          } else {
            if (e.html) {
              this.fieldData.value = e.html;
            }
            this.fieldData.richData = e;
          }
        } else {
          let val = this.fieldData.value ? this.fieldData.value : '';
          this.textareaValue = val;
          if (e.type === 'richtext') {
            this.$refs.richEditor.resetContent(val);
          }
        }
        this.modalName = '';
        this.onBlur()
      },
      longpressNumEnd() {
        clearInterval(this.longpressTimer);
      },
      longpressNumChange(type) {
        if (type) {
          this.longpressTimer = setInterval(() => {
            this.numberChange(type);
          }, 100);
        }
      },
      numberChange(type) {

        if (this.fieldData.type === 'number' || this.fieldData.type === 'digit') {
          let step = this.fieldData.type === 'number' ? 1 : this.fieldData.type === 'digit' ? 0.5 : 0;
          if (this.fieldData.step) {
            step = this.fieldData.step;
          }
          if (!this.fieldData.value) {
            this.fieldData.value = this.fieldData.min ? this.fieldData.min : 0;
          }
          if (this.fieldData.max) {
            if (type === 'add') {
              if (this.fieldData.value + step <= this.fieldData.max) {
                this.fieldData.value = Number((this.fieldData.value + step).toFixed(1));
              } else {
                clearInterval(this.longpressTimer);
              }
            } else if (type === 'minus') {
              if (this.fieldData.value - step >= this.fieldData.min) {
                this.fieldData.value = Number((this.fieldData.value - step).toFixed(1));
              } else {
                clearInterval(this.longpressTimer);
              }
            }
          }
        }
        this.onBlur()
      },
      changeSlider(e) {
        console.log('value 发生变化：' + e.detail.value);
        this.fieldData.value = e.detail.value;
        this.onBlur()
      },
      previewImage(urls) {
        if (!urls) {
          return;
        }
        if (typeof urls === 'string') {
          urls = [urls];
        }
        urls = urls.map(url => {
          //若图片地址携带压缩图参数则预览时去掉此参数
          return url.replace(/&thumbnailType=fwsu_100/gi, '');
        });
        uni.previewImage({
          urls: urls,
          longPressActions: {
            itemList: ['发送给朋友', '保存图片', '收藏'],
            success: function(data) {
              console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
            }
          }
        });
      },
      async getLocation() {

        // let isAuthLocation = await new Promise(resolve=>{
        //   uni.authorize({
        //       scope: 'scope.userLocation',
        //       success() {
        //         resolve()
        //       }
        //   })
        // }) 


        // #ifdef MP-WEIXIN
        let settings = await new Promise(resolve => {
          uni.getSetting({
            success: (res) => {
              resolve(res)
            },
            fail: (err) => {
              resolve(err)
            }
          })
        })

        console.log(settings)
        if (settings?.authSetting?. ['scope.userLocation'] === false) {
          uni.showModal({
            title: '提示',
            content: '未授权访问位置信息，请先在权限设置页面授权允许小程序访问您的位置信息',
            confirmText: '去设置',
            cancelText: '算了',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting({

                })
              }
            }
          })
          return
        }
        // #endif
        if (this.pageType === 'detail') {
          if (this.fieldData.value) {
            let res = await this.getLocationFromSys()
            if (res.gcj_lat && res.gcj_lon) {
              uni.openLocation({
                longitude: res.gcj_lon,
                latitude: res.gcj_lat,
                success: function(res) {
                  // console.log('位置名称：' + res.name);
                  // console.log('详细地址：' + res.address);
                  // console.log('纬度：' + res.latitude);
                  // console.log('经度：' + res.longitude);
                }
              });

            }
          }
          return;
        }
        let self = this;
        const resData = await uni.chooseLocation()
        if (Array.isArray(resData) && resData.length > 1) {
          const res = resData[1]
          console.log('位置名称：' + res.name);
          console.log('详细地址：' + res.address);
          console.log('纬度：' + res.latitude);
          console.log('经度：' + res.longitude);
          if (self.fieldData.col_type === 'bxsys_obj_type_gps') {
            if (self.fieldData?.moreConfig?.scope) {
              let scope = self.fieldData?.moreConfig?.scope
              let {
                latitude: lat1,
                longitude: lng1
              } = await new Promise(resolve => {
                wx.getLocation({
                  type: 'gcj02',
                  success: function(res) {
                    resolve(res)
                  }
                })
              })
              if (lat1 && lng1) {
                let distance = this.calcDistance(lat1, lng1, res.latitude, res.longitude)
                if (!isNaN(Number(scope)) && !isNaN(distance) && distance > scope) {

                  uni.showModal({
                    title: '提示',
                    content: `所选位置不能距离当前定位超过${scope}米`,
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        uni.showToast({
                          title: `距离当前定位${distance}米`,
                          duration: 3000,
                          icon: 'none'
                        })
                      }
                    }
                  })
                  return
                }
              }
            }


            self.fieldData.value = await this.saveLocation(res)
            self.fkFieldLabel = res.address
          } else {
            self.fieldData.value = res.address + res.name;
          }
          self.$emit('chooseLocation', res);
          self.onBlur()
          self.getDefVal();
        }
      },
      calcDistance(lat1, lng1, lat2, lng2) {
        // 计算两个经纬度点之间的距离
        console.log(lat1, lng1, lat2, lng2)
        //进行经纬度转换为距离的计算
        function rad(d) {
          return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
        }
        const radLat1 = rad(lat1);
        const radLat2 = rad(lat2);
        const a = radLat1 - radLat2;
        const b = rad(lng1) - rad(lng2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        // 输出为公里
        // s = Math.round(s * 10000) / 10000;
        // // 输出为米
        s = Math.round(s * 1000);
        s = Number(s.toFixed(4));
        // uni.showToast({
        //   title: `距离打卡点:${Number(s)}米`,
        //   icon: 'none'
        // })
        return s
      },
      async getLocationFromSys() {
        const app = this.srvApp
        const req = {
          "serviceName": "srvsys_obj_type_gps_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'gno',
            ruleType: 'eq',
            value: this.fieldData.value
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const res = await this.$fetch('select', 'srvsys_obj_type_gps_select', req, app)
        if (res.success && res.data.length > 0) {
          return res.data[0]
        }
      },
      async saveLocation(e = {}) {
        let gno = ''
        if (this.fieldData.value) {
          let gnoData = await this.getLocationFromSys()
          gno = gnoData.gno
        }
        const app = this.srvApp
        let serviceName = 'srvsys_obj_type_gps_add'
        const req = [{
          serviceName: serviceName,
          data: [{
            addr_str: e.address + e.name,
            gcj_lat: e.latitude,
            gcj_lon: e.longitude
          }]
        }]
        if (gno) {
          serviceName = 'srvsys_obj_type_gps_update'
          req[0].serviceName = serviceName
          req[0].condition = [{
            colName: 'gno',
            ruleType: 'eq',
            value: gno
          }]
        }
        const res = await this.$fetch('operate', serviceName, req, app)
        if (res.success && res.data.length > 0) {
          this.fieldData.colData = res.data[0]
          return res.data[0].gno
        }

      },

      showModal(name) {
        this.modalName = name;
      },
      hideModal() {
        if (this.fieldData.value === '__others' && !this.otherNodeVal) {
          return
        }
        this.modalName = '';
      },
      async getDefVal() {
        let self = this;
        if (self.fieldData.type === 'images' && self.fieldData.value) {
          if (self.fieldData.value.indexOf('http') === -1) {
            // 上传到系统的图片 只有图片编号 查到图片地址后再push
            let fileDatas = await self.getFilePath(self.fieldData.value);
            if (fileDatas) {
              self.imagesUrl = [];
              for (let i = 0; i < fileDatas.length; i++) {
                const url =
                  `${self.$api.getFilePath}${fileDatas[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}`;
                // `${self.$api.getFilePath}${fileDatas[ i ].fileurl}&bx_auth_ticket=${uni.getStorageSync('bx_auth_ticket')}&thumbnailType=fwsu_100`;
                self.imagesUrl.push(url);
              }
            }
          } else {
            // 网络地址 直接push
            self.imagesUrl = [];
            self.imagesUrl.push(self.fieldData.value);
          }
        } else if (self.fieldData.type === 'list' && self.fieldData.value !== '') {
          // 选项列表
          let listItemModel = self.fieldData.optionsConfig.model;
          let colKey = self.fieldData.optionsConfig.conditions;
          for (let i = 0; i < colKey.length; i++) {
            self.$set(self.listModel, colKey[i].colName, self.fieldModelsData[colKey[i].value]);
            self.listModel[colKey[i].colName] = self.fieldModelsData[colKey[i].value];
          }
        } else if (self.fieldData.type === 'Set' && self.fieldData.value && typeof self.fieldData.value ===
          'string') {
          // 多选
          self.fieldData.value = self.fieldData.value.split(',');
        } else if (self.fieldData && ['TreeSelector', 'Selector', 'location'].includes(self.fieldData.type)) {

          let cond = null;
          if (self.fieldData.value && self.fieldData?.option_list_v2?.refed_col && self.formType !== 'add') {
            cond = [{
              colName: self.fieldData.option_list_v2.refed_col,
              value: self.fieldData.value,
              ruleType: 'like'
            }];
          }
          if (self.fieldData.colData && self.fieldData.colData[self.fieldData.option_list_v2.refed_col] &&
            self.fieldData.colData[self.fieldData.option_list_v2.key_disp_col]) {
            self.fkFieldLabel = self.fieldData?.option_list_v2?.show_as_pair === true ?
              `${self.fieldData.colData[self.fieldData.option_list_v2.key_disp_col]}/${self.fieldData.colData[self.fieldData.option_list_v2.refed_col]}` :
              self.fieldData
              .colData[self.fieldData.option_list_v2.key_disp_col]

          } else {
            self.getSelectorData(cond).then(_ => {
              if (self.fieldData.value) {
                let fkFieldLabel = self.selectorData.find(item => item.value === self.fieldData
                  .value || item.value === Number(self.fieldData.value))
                if (fkFieldLabel && fkFieldLabel.label) {
                  self.fkFieldLabel = fkFieldLabel.label
                } else if (self.fieldData.value) {
                  self.fkFieldLabel = self.fieldData.value
                }
              }
            });
          }

        } else {
          let keys = Object.keys(this.fieldsModel)
          if (Array.isArray(keys) && keys.length > 0) {
            keys.forEach(key => {
              if (this.fieldData.column === key && !this.fieldData.value && this.fieldsModel[key]) {
                this.fieldData.value = this.fieldsModel[key];
              }
            });
          }

        }
      },
      getFileInfo(e) {
        if (e.response.file_no) {
          this.fieldData.value = e.response.file_no;
        }
      },
      getImagesInfo(e) {
        let res = e.allImages[0];
        try {
          res = JSON.parse(e.allImages[0]);
        } catch (e) {
          //TODO handle the exception
        }
        this.fieldData.value = res.file_no;
        if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
          this.uploadFormData['file_no'] = this.fieldData.value;
        }
        // this.onBlur()
        this.getDefVal();
      },
      deleteImage(e) {
        console.log(e);
        this.fieldData.value = '';
      },
      confirmSelectTree(e) {
        if (e && e.id) {
          this.selectTreeData = e
          let srvInfo = this.fieldData.srvInfo || this.fieldData.option_list_v2;
          this.fkFieldLabel = srvInfo?.show_as_pair === true ?
            `${e[ srvInfo.key_disp_col ]}/${e[ srvInfo.refed_col ]}` : e[srvInfo.key_disp_col];
          this.fieldData['colData'] = e;
          this.modalName = '';
        }
      },
      getCascaderValue(e) {
        if (e?.type == '自行输入') {
          this.fieldData.value = e.value;
           this.fkFieldLabel = e.value
        } else {
          let srvInfo = this.fieldData.srvInfo || this.fieldData.option_list_v2;
          if (!this.selectTreeData || (e && srvInfo?.refed_col && e[srvInfo.refed_col] !== this.selectTreeData[srvInfo
              .refed_col])) {
            this.selectTreeData = e
            this.fkFieldLabel = srvInfo.show_as_pair === true ?
              `${e[ srvInfo.key_disp_col ]}/${e[ srvInfo.refed_col ]}` : e[srvInfo.key_disp_col];
            this.fieldData['colData'] = e;
            this.fieldData.value = e[srvInfo.refed_col];
            this.$emit('setColData', this.fieldData)
          }
        }
        this.hideModal();
      },
      searchFKDataWithKey(e) {
        this.treePageInfo.pageNo = 1
        if (e?.detail?.value) {
          let option = this.fieldData.option_list_v2;
          let relation_condition = {
            relation: 'OR',
            data: []
          };
          if (!option.key_disp_col && !option.refed_col) {
            return;
          }
          if (option.key_disp_col) {
            relation_condition.data.push({
              colName: option.key_disp_col,
              value: e.detail.value,
              ruleType: '[like]'
            })
          }
          if (option.refed_col) {
            relation_condition.data.push({
              colName: option.refed_col,
              value: e.detail.value,
              ruleType: '[like]'
            })
          }
          if (Array.isArray(option.conditions) && option.conditions.length > 0) {
            let fieldModelsData = this.deepClone(this.fieldsModel);
            option.conditions = this.evalConditions(option.conditions, fieldModelsData)
            let data = this.deepClone(relation_condition.data)
            relation_condition = {
              relation: 'AND',
              data: [...option.conditions, {
                relation: 'OR',
                data: data
              }]
            }
          }
          this.getSelectorData(null, null, relation_condition);
        } else {
          this.getSelectorData();
        }
      },
      radioChange(e) {
        console.log('radioChange')
        // this.onBlur()
        this.getValid();
        this.fieldData.old_value = this.fieldData.value
        this.$emit('on-value-change', this.fieldData);
      },
      pickerChange(e) {
        if (e?.type === '__others') {
          this.fieldData.value = e.value
          this.fkFieldLabel = e.value;
        }else  if (this.fieldData.type === 'Selector') {
          this.fieldData.value = e
          let selectorData = this.radioOptions || this.selectorData
          let optionData = selectorData.find(item => item.value === e);
          if (optionData?.label) {
            this.fkFieldLabel = optionData.label;
            this.fieldData['colData'] = optionData;
          }
          this.otherNodeVal = ''
          // this.$emit('setColData', this.fieldData)
          // this.onInput();
          // this.onBlur()
        }
        this.hideModal();
      },
      toFkAdd() {
        const option_list_v2 = this.fieldData?.option_list_v2
        if (option_list_v2?.serviceName) {
          let serviceName = option_list_v2.serviceName.replace('_select', '_add')
          let url = `/publicPages/form/form?serviceName=${serviceName}&type=add`
          if (option_list_v2.srv_app) {
            url += `&destApp=${option_list_v2.srv_app}`
          }
          uni.navigateTo({
            url
          })
        }

      },
      refresh() {
        this.treePageInfo.pageNo = 1
        this.getSelectorData()
      },
      nextPage() {
        this.treePageInfo.pageNo += 1
        this.getSelectorData()
      },
      async getSelectorData(cond, serv, relation_condition) {
        let self = this;
        self.fieldData.old_value = self.fieldData.value
        if (this.fieldData.col_type === 'Enum') {
          if (Array.isArray(this.fieldData.options)) {
            this.selectorData = this.fieldData.options;
          }
          return;
        }
        let req = {
          serviceName: serv ? serv : self.fieldData.option_list_v2 ? self.fieldData.option_list_v2
            .serviceName : '',
          colNames: ['*'],
          condition: [],
          page: {
            pageNo: this.treePageInfo.pageNo,
            rownumber: this.treePageInfo.rownumber
          }
        };
        let globalData = getApp().globalData
        let appName = self.fieldData?.option_list_v2?.srv_app || self.srvApp || uni.getStorageSync(
          'activeApp');
        let fieldModelsData = self.deepClone(self.fieldsModel);
        if (!self.procData.id) {
          fieldModelsData = self.deepClone(self.fieldsModel);
        } else {
          fieldModelsData = self.deepClone(self.procData);
        }
        // #ifdef H5
        top.user = uni.getStorageSync('login_user_info');
        // #endif
        if (cond) {
          req.condition = cond;
        } else if (self.fieldData.option_list_v2 && Array.isArray(self.fieldData.option_list_v2.conditions) &&
          self.fieldData.option_list_v2.conditions.length > 0) {
          let condition = self.deepClone(self.fieldData.option_list_v2.conditions);
          condition = self.evalConditions(condition, fieldModelsData)
          condition = condition.map(item => {
            if (item.value && item.value.indexOf('data.') !== -1) {
              let colName = item.value.slice(item.value.indexOf('data.') + 5);
              if (fieldModelsData[colName]) {
                item.value = fieldModelsData[colName];
              }
            } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
              item.value = uni.getStorageSync('login_user_info').user_no;
            } else if (item.value && item.value.indexOf('globalData.') !== -1) {
              let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
              if (globalData && globalData[colName]) {
                item.value = globalData[colName];
              }
            } else if (item.value && item.value.indexOf("'") === 0 && item.value.lastIndexOf(
                "'") === item.value
              .length - 1) {
              item.value = item.value.replace(/\'/gi, '');
            }
            if (item.value_exp) {
              delete item.value_exp;
            }
            return item;
          });
          if (Array.isArray(condition) && condition.length > 0) {
            req.condition = condition;
          } else {
            // return;
            // if(this.fieldData.value){
            // 	debugger
            // 	req.condition = [{
            // 		colName:this.fieldData.option_list_v2?.refed_col,
            // 		ruleType:'like',
            // 		value:this.fieldData.value
            // 	}]
            // }
          }
        }
        if (Array.isArray(req.condition) && Array.isArray(this.fieldData?.fk_condition)) {
          req.condition = [...req.condition, ...this.fieldData.fk_condition]
        }
        if (req.serviceName === 'srvsso_user_select') {
          if (Array.isArray(req.condition)) {} else {
            req.condition = [{
              colName: 'dept_no',
              ruleType: 'like',
              value: 'bx100sys'
            }];
          }
          appName = 'sso';
        }
        if (self.fieldData.value && self.fieldData.disabled && self.fieldData.option_list_v2?.refed_col && !
          self
          .fieldData?.redundant) {
          if (Array.isArray(req.condition) !== true) {
            req.condition = []
          }
          req.condition.push({
            colName: self.fieldData.option_list_v2.refed_col,
            ruleType: 'eq',
            value: self.fieldData.value
          })
        }

        if (relation_condition && typeof relation_condition === 'object') {
          req.relation_condition = relation_condition;
          delete req.condition;
        }

        if (!req.serviceName) {
          return;
        }

        if (!appName) {
          return
        }

        if (self.fieldData.value && (!req.condition || req.condition.length == 0) && (self.fieldData.disabled || self
            .fieldData.display == false)) {
          req.condition = [{
            colName: self.fieldData.option_list_v2.refed_col,
            ruleType: 'like',
            value: self.fieldData.value
          }]
        }
        let res = await self.onRequest('select', req.serviceName, req, appName);
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          if (res.data.page) {
            this.treePageInfo = res.data.page;
          }

          if (res.data.page && res.data.page.pageNo > 1) {
            let data = res.data.data;
            self.selectorData = [...self.selectorData, ...data];
          } else {
            self.selectorData = res.data.data;
          }
          self.selectorData = self.selectorData.map(item => {
            const config = this.deepClone(this.fieldData.option_list_v2);
            // item.label = `${item[config.key_disp_col]||''}/${item[config.refed_col]||''}`
            item.label = config.show_as_pair === true ?
              `${item[ config.key_disp_col||'' ]}/${item[ config.refed_col ]}` : item[config
                .key_disp_col]
            // item.label = config.key_disp_col ? item[config.key_disp_col] : '';
            item.value = config.refed_col ? item[config.refed_col] : '';
            return item;
          });
          // }
          if (Array.isArray(self.selectorData) && self.selectorData.length > 0) {
            self.selectorData.forEach(item => {
              if (self.fieldData.option_list_v2 && (item[self.fieldData.option_list_v2.refed_col] ===
                  self.fieldData.value || item[self.fieldData.option_list_v2.refed_col] ===
                  Number(self.fieldData.value)) && (self.fieldData.value || self.fieldData.value === 0)) {
                self.fieldData['colData'] = item;
                self.$emit('setColData', self.fieldData)
              }
            });
          }

        } else if (res.data.state === 'SUCCESS' && res.data.data.length == 0) {
          if (res.data.page) {
            this.treePageInfo = res.data.page;
          }
          self.selectorData = []
        } else if (req.serviceName === 'srvsys_service_columnex_v2_select' && res.data && res.data.data &&
          Array.isArray(res.data.data.srv_cols)) {
          self.selectorData = res.data.data.srv_cols.map(item => {
            item.checked = false;
            return item;
          });
        }
      },
      bindTimeChange(e, type) {
        if (type && typeof type === 'string') {
          this.$set(this.fieldData, type, e.detail.value)
          // this.fieldData[type] = e.detail.value;
          if (!this.fieldData.value) {
            this.fieldData.value = [null, null]
          }
          if (type === 'startVal') {
            this.fieldData.value[0] = e.detail.value
          } else if (type === 'endVal') {
            this.fieldData.value[1] = e.detail.value
          }
        } else if (Array.isArray(e) && e.length > 0) {
          if (e.length === 2) {
            this.fieldData.value = e
          } else {
            this.fieldData.value = e
          }
        } else if (e && typeof e === 'object' && e.startDate && e.endDate) {
          if (!this.fieldData.value) {
            this.fieldData.value = [null, null]
          }
          this.fieldData.value[0] = e.startDate
          this.fieldData.value[1] = e.endDate
        } else if (e && typeof e === 'object' && e.startTime && e.endTime) {
          if (!this.fieldData.value) {
            this.fieldData.value = [null, null]
          }
          this.fieldData.value[0] = e.startTime
          this.fieldData.value[1] = e.endTime
        } else if (Array.isArray(e)) {
          // this.fieldData.value = e;
          debugger
        } else {
          this.fieldData.value = e.detail.value;
          if (this.fieldData?.moreConfig?.editor_type === 'date_time_linkage') {
            this.fieldData.colData = e.detail.time || {}
          }
          this.$emit('date-time-change', this.fieldData)
        }
        // this.$emit('on-value-change', this.fieldData);
      },
      async openModal(type) {
        const self = this
        // 打开弹出层
        if (this.fieldData.disabled) {
          return
        }
        if (this.fieldData.type === 'Selector' && this.fieldData?.moreConfig?.editor_type ===
          'selectorList') {
          let option_list_v2 = this.fieldData.option_list_v2;
          if (Array.isArray(option_list_v2?.conditions)) {
            option_list_v2 = this.deepClone(option_list_v2)
            const fieldModelsData = this.fieldsModel
            let condition = this.deepClone(option_list_v2.conditions);
            condition = this.evalConditions(condition, fieldModelsData)
            condition = condition.map(item => {
              if (item.value && item.value.indexOf('data.') !== -1) {
                let colName = item.value.slice(item.value.indexOf('data.') + 5);
                if (fieldModelsData[colName]) {
                  item.value = fieldModelsData[colName];
                }
              } else if (item.value && item.value.indexOf('top.user.user_no') !== -1) {
                item.value = uni.getStorageSync('login_user_info').user_no;
              } else if (item.value && item.value.indexOf('globalData.') !== -1) {
                let colName = item.value.slice(item.value.indexOf('globalData.') + 10);
                if (globalData && globalData[colName]) {
                  item.value = globalData[colName];
                }
              } else if (item.value && item.value.indexOf("'") === 0 && item.value.lastIndexOf(
                  "'") === item.value
                .length - 1) {
                item.value = item.value.replace(/\'/gi, '');
              }
              if (item.value_exp) {
                delete item.value_exp;
              }
              return item;
            });
            let url =
              `/publicPages/list2/list2?selectCol=${this.fieldData.column}&destApp=${option_list_v2.srv_app}&listType=selectorList&serviceName=${option_list_v2.serviceName}&cond=${JSON.stringify(condition)}`
            if (this.fieldData?.moreConfig?.listConfig && typeof this.fieldData?.moreConfig?.listConfig ===
              'object') {
              url += `&listConfig=${JSON.stringify(this.fieldData?.moreConfig?.listConfig)}`
            }
            let idCol = this.fieldData?.moreConfig?.option_id_col || this.fieldData.option_list_v2
              ?.refed_col || 'id'
            if (idCol) {
              url += `&idCol=${idCol}`
            }
            if (this.fieldData?.colData && this.fieldData.colData[idCol]) {
              url += `&selectedVal=${this.fieldData.colData[idCol]}`
            }
            const uuid = uni.$u.guid()
            this.selectorListUUID = uuid
            url += `&uuid=${uuid}`
            uni.$on('confirmSelect', (e) => {
              if (e.uuid === uuid) {
                const srvInfo = this.fieldData?.option_list_v2 || {}
                const refed_col = srvInfo?.refed_col
                const key_disp_col = srvInfo?.key_disp_col
                if (refed_col) {
                  // self.getCascaderValue(e.data)
                  this.fkFieldLabel = srvInfo.show_as_pair === true ?
                    `${e.data[ key_disp_col ]}/${e.data[ refed_col ]}` : e.data[
                      key_disp_col];
                  this.fieldData['colData'] = e.data;
                  this.fieldData.value = e.data[refed_col];
                  this.$nextTick(function() {
                    // this.$emit('setColData', this.fieldData)
                    uni.$off('confirmSelect')
                  })
                }
              }
            })
            uni.navigateTo({
              url: url
            })
          }
          return
        }
        let fieldData = this.deepClone(this.fieldData);
        switch (type) {
          case 'Set':
            if (Array.isArray(this.fieldData.option_list_v2)) {
              this.setOptionList = this.fieldData.option_list_v2.map(item => {
                if (this.fieldData.value && this.fieldData.value.includes(item.value)) {
                  item.checked = true;
                }
                return item;
              });
              this.modalName = 'MultiSelector';
            }
            break;
          case 'Selector':
            await this.getSelectorData(null, null, null)
            this.modalName = 'Selector';
            break;
          case 'TreeSelector':
            // await this.getSelectorData(null, null, null)
            this.modalName = 'TreeSelector';
            this.selectTreeData = this.selectTreeData || {}
            break;
        }
      },
      onBlur(e) {
        // 输入框失去焦点 进行校验
        console.log('on-blur');
        this.getValid();
        // if (this.fieldData.value !== this.fieldData.old_value) {
        // this.fieldData.old_value = this.fieldData.value
        // this.$emit('on-value-change', this.fieldData);
        // }
      },
      textareaInput(e) {
        this.fieldData.value = e.detail.value
        this.getValid();
      },
      onInput() {
        // input事件
        console.log('on-input');
        // this.getValid();
        // this.$emit('on-value-change', this.fieldData);
      },

      getValid() {
        if (this.fieldData.display === false) {
          this.fieldData.valid = {
            valid: true,
            msg: '有效'
          };
          this.valid.valid = true;
          return this.valid
        }
        if (this.fieldData.isRequire && this.fieldData.value) {
          if (this.fieldData.hasOwnProperty('_validators') && this.fieldData._validators.hasOwnProperty(
              'isType') && typeof this.fieldData._validators.isType === 'function') {
            this.fieldData.valid = this.fieldData._validators.isType(this.fieldData.value);
            this.valid.valid = true;
          } else {
            this.fieldData.valid = {
              valid: true,
              msg: '有效'
            };
            this.valid.valid = true;
          }
          // this.valid.valid = this.fieldData.valid.valid;
        } else if (this.fieldData.isRequire && (this.fieldData.value === '' || this.fieldData.value === null ||
            this.fieldData.value === undefined)) {
          // if (this.fieldsModel[this.fieldData.column]) {
          // 	this.fieldData.value = this.fieldsModel[this.fieldData.column]
          // 	this.fieldData.valid = {
          // 		valid: true,
          // 		msg: '有效'
          // 	};
          // 	this.valid.valid = true;
          // } else {
          this.fieldData.valid = {
            display: this.fieldData.display,
            valid: false,
            msg: this.fieldData.label + '不能为空'
          };
          this.valid.valid = false;
          // }

        } else {
          this.fieldData.valid = {
            valid: true,
            msg: '有效'
          };
          this.valid.valid = true;
        }
        // this.$emit('on-value-change', this.fieldData);
        return this.valid;
      },
      initSetOptions() {
        this.$nextTick(function() {
          if (Array.isArray(this.fieldData.option_list_v2)) {
            this.setOptionList = this.fieldData.option_list_v2.map(item => {
              item.checked = false;
              if (this.fieldData.value && this.fieldData.value.includes(item.value)) {
                item.checked = true;
              }
              return item;
            });
          }
        });
      },
    },
    created() {
      let self = this;
      if (this.fieldData.type === 'images' || this.fieldData.type ===
        'RichText') {
        this.uploadFormData = {
          serviceName: 'srv_bxfile_service',
          interfaceName: 'add',
          app_no: '',
          table_name: '',
          columns: ''
        };
        this.uploadFormData['app_no'] = this.fieldData?.srvInfo?.appNo || this.srvApp || uni.getStorageSync(
          'activeApp');
        this.uploadFormData['columns'] = this.fieldData.column;
        if (this.fieldData.value !== '' && this.fieldData.value !== null && this.fieldData.value !== undefined) {
          this.uploadFormData['file_no'] = this.fieldData.value;
        }
        this.getDefVal();
      }
      if (this.pageType === 'detail' || this.pageType === 'update') {
        this.getDefVal();
      }
      this.initSetOptions()
      if (self.fieldData && ['Selector', 'location'].includes(self.fieldData.type)) {
        self.getDefVal()
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import "./style.scss";

  @media screen and (min-width:800px) {
    .cu-btn {
      min-width: auto !important;
      max-width: 200px !important;
    }

    .dialog-button {
      .cu-btn {
        width: 200px;
        height: 40px;
        border-radius: 50px;
      }
    }

    .bottom-modal {
      &::before {
        vertical-align: middle;
      }

      .cu-dialog {
        max-width: 500px;
        border-radius: 20px !important;
        overflow: hidden;
      }
    }
  }
</style>
