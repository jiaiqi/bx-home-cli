<template>
  <view class="list-item-wrap" v-if="rowData && setViewTemp && setListView" :class="[setListView.rootClass]"
    :style="[setListView.rootStyle]">
    <view class="list-item" @click="clickItem">
      <view class="main-image" :style="[setListView.imgStyle]" :class="[setListView.imgClass]"
        v-if="setListView.showImg && setListView.imgAlign !== 'right'">
        <image lazy-load class="image" :src="setListView.imgSrc" :mode="setListView.imgMode"
          :style="[setListView.imgTagStyle]">
        </image>
        <image class="icon" :class="setListView.imgIcon.name" v-if="setListView.imgIcon&&setListView.imgIcon.name"
          :style="[setListView.imgIcon.style]" :src="require('@/static/icon/'+setListView.imgIcon.name+'.png')"
          mode="aspectFit"></image>
        <image class="icon" v-else-if="setListView.imgIcon&&setListView.imgIcon.fileNo"
          :style="[setListView.imgIcon.style]" :src="getImagePath(setListView.imgIcon.fileNo,true)" mode="aspectFit">
        </image>
      </view>
      <view class="flex flex-1" :style="[{ maxWidth: setListView.listContentMaxWidth,width:'100%' }]">
        <view class="flex flex-wrap" style="width:100%;" v-if="setListView && setListView.cols">
          <view class="list-item-content">
            <view class="col-item bg" v-for="(item,index) in setListView.cols" :key="index" :style="[item.style]"
              :class="[item.class]">
              <view v-if="item.type==='childData'&&setChildData&&setChildData.length>0">
                <list-item class="list-item-wrap child-data" :disabledEvaluate="disabledEvaluate" :viewTemp="item.list_config" :labelMap="labelMap"
                  listType="list" :appName="appName" :main-data="rowData" :rowData="row" :rowButton="rowButton"
                  v-for="row in setChildData">
                </list-item>
              </view>
              <template v-else>
                <view class="label" v-if="item.label">{{ item.label }}:</view>
                <!-- 前置图标 -->
                <image class="icon" :class="item.preIcon.name" v-if="item.preIcon&&item.preIcon.name"
                  :style="[item.preIcon.style]" :src="require('@/static/icon/'+item.preIcon.name+'.png')"
                  mode="aspectFit">
                </image>
                <image class="icon" :class="item.preIcon.fileNo" v-else-if="item.preIcon&&item.preIcon.fileNo"
                  :style="[item.preIcon.style]" :src="getImagePath(item.preIcon.fileNo,true)" mode="aspectFit"></image>
                <view class="value" v-if="item.type==='location_fk'">
                  <text class="cuIcon-locationfill"></text>
                </view>
                <view class="value" :style="{ 'white-space': item.valueWhiteSpace }"
                  v-if="item.event&&item.event.type==='location_fk'" @click.stop="openLocation(item.event)">
                  <text v-if="item.prefix">{{ item.prefix }}</text>
                  <text v-if="item.mode==='rate'">
                    <uni-rate :value="Number(item.value)" :readonly="true" :max="item.max||5"
                      :allowHalf="item.allowHalf||false" />
                  </text>
                  <text v-else>{{ excludeEnter(item.value)}}</text>
                  <text v-if="item.suffix">{{ item.suffix }}</text>
                  <text class="cuIcon-locationfill text-blue" style="font-size: 20px;"></text>
                </view>
                <view class="value" :style="{
                    'white-space': item.valueWhiteSpace,
                    '-webkit-line-clamp':item.style['-webkit-line-clamp'],
                    '-webkit-box-orient':item.style['-webkit-box-orient'],
                    'display':item.style.display
                  }" v-else>
                  <text v-if="item.prefix">{{ item.prefix }}</text>
                  <view class="" v-if="item.fmt">
                    <text class="cu-tag margin-top-xs bg-gray radius margin-right-xs" style="margin-left: 0;"
                      v-for=" tag in formatText(item)">{{tag}}</text>
                  </view>
                  <view class="media-box" v-else-if="item.type=='media'">
                    <bx-media-upload class="media-box-content" :file-no="item.value" :enable-del="false"
                      :enable-add="false">
                    </bx-media-upload>
                  </view>
                  <text v-else-if="item.mode==='rate'">
                    <uni-rate :value="Number(item.value)" :readonly="true" :max="item.max||5"
                      :allowHalf="item.allowHalf||false" />
                  </text>
                  <text v-else>{{ excludeEnter(item.value)}}</text>
                  <text v-if="item.suffix">{{ item.suffix }}</text>

                </view>
                <!-- 后置图标 -->
                <image class="icon" :class="item.sufIcon.name" v-if="item.sufIcon&&item.sufIcon.name"
                  :style="[item.sufIcon.style]" :src="require('@/static/icon/'+item.sufIcon.name+'.png')"
                  mode="aspectFit">
                </image>
                <image class="icon" :class="item.sufIcon.fileNo" v-else-if="item.sufIcon&&item.sufIcon.fileNo"
                  :style="[item.sufIcon.style]" :src="getImagePath(item.sufIcon.fileNo,true)" mode="aspectFit"></image>
              </template>
            </view>
            <view class="col-item text-right flex-1" v-if="listType === 'cartList' && rowData && rowData.goods_amount">
              <view class="cu-btn sm radius cart-handler" :style="{
            		color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
            		'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
            		'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
            		padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
            	}" @click.stop="del" v-if="rowData && rowData.goods_amount">
                -
              </view>
              <view class="goods-amount flex-1 text-center" style="width: 50px;text-align: center;font-size: 16px;">
                {{ rowData.goods_amount || '1' }}
              </view>
              <view class=" cu-btn sm radius cart-handler" :style="{
            		color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
            		'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
            		'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
            		padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
            	}" @click.stop="add">
                +
              </view>
            </view>
            <view class="col-item text-right flex-1 handler" v-if="listType === 'cart'">
              <view class="del-btn-box" :class="{ active: inCartData && amount }"
                v-if="inCartData && inCartData.id && amount">
                <text class="cu-btn sm radius" :style="{
            			color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
            			'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
            			'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
            			padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
            		}" @click.stop="del">
                  -
                </text>
                <text class="goods-amount">{{ amount || '0' }}</text>
              </view>
              <text class=" cu-btn sm radius" :style="{
            		color: btn_cfg && btn_cfg.color ? btn_cfg.color : '',
            		'background-color': btn_cfg && btn_cfg.bg ? btn_cfg.bg : '',
            		'font-size': btn_cfg && btn_cfg.font_size ? btn_cfg.font_size : '',
            		padding: btn_cfg && btn_cfg.padding ? btn_cfg.padding : ''
            	}" @click.stop="add">
                +
              </text>
            </view>
          </view>
          <view class="list-item-right-content" :class="{'left-line':setListView.rightContent.leftLine}"
            v-if="setListView.rightContent&& setListView.rightCols&& setListView.rightCols.length>0"
            :style="[setListView.rightStyle]">
            <view class="col-item bg" v-for="(item,index) in setListView.rightCols" :key="index" :style="[item.style]"
              :class="[item.class]">
              <view v-if="item.type==='childData'&&setChildData&&setChildData.length>0">
                <list-item class="list-item-wrap child-data" :disabledEvaluate="disabledEvaluate" :viewTemp="item.list_config" :labelMap="labelMap"
                  listType="list" :appName="appName" :main-data="rowData" :rowData="row" :rowButton="rowButton"
                  v-for="row in setChildData">
                </list-item>
              </view>
              <template v-else>
                <view class="label" v-if="item.label">{{ item.label }}:</view>
                <!-- 前置图标 -->
                <image class="icon" :class="item.preIcon.name" v-if="item.preIcon&&item.preIcon.name"
                  :style="[item.preIcon.style]" :src="require('@/static/icon/'+item.preIcon.name+'.png')"
                  mode="aspectFit">
                </image>
                <image class="icon" :class="item.preIcon.fileNo" v-else-if="item.preIcon&&item.preIcon.fileNo"
                  :style="[item.preIcon.style]" :src="getImagePath(item.preIcon.fileNo,true)" mode="aspectFit"></image>
                <view class="value" v-if="item.type==='location_fk'">
                  <text class="cuIcon-locationfill"></text>
                </view>
                <view class="value" :style="{ 'white-space': item.valueWhiteSpace }"
                  v-if="item.event&&item.event.type==='location_fk'" @click.stop="openLocation(item.event)">
                  <text v-if="item.prefix">{{ item.prefix }}</text>
                  <text v-if="item.mode==='rate'">
                    <uni-rate :value="Number(item.value)" :readonly="true" :max="item.max||5"
                      :allowHalf="item.allowHalf||false" />
                  </text>
                  <text v-else>{{ excludeEnter(item.value)}}</text>
                  <text v-if="item.suffix">{{ item.suffix }}</text>
                  <text class="cuIcon-locationfill text-blue" style="font-size: 20px;"></text>
                </view>
                <view class="value" :style="{ 'white-space': item.valueWhiteSpace }" v-else>
                  <text v-if="item.prefix">{{ item.prefix }}</text>
                  <view class="" v-if="item.fmt">
                    <text class="cu-tag margin-top-xs bg-gray radius margin-right-xs" style="margin-left: 0;"
                      v-for=" tag in formatText(item)">{{tag}}</text>
                  </view>
                  <view class="media-box" v-else-if="item.type=='media'">
                    <bx-media-upload class="media-box-content" :file-no="item.value" :enable-del="false"
                      :enable-add="false">
                    </bx-media-upload>
                  </view>
                  <text v-else-if="item.mode==='rate'">
                    <uni-rate :value="Number(item.value)" :readonly="true" :max="item.max||5"
                      :allowHalf="item.allowHalf||false" />
                  </text>
                  <text v-else>{{ excludeEnter(item.value)}}</text>
                  <text v-if="item.suffix">{{ item.suffix }}</text>

                </view>
                <!-- 后置图标 -->
                <image class="icon" :class="item.sufIcon.name" v-if="item.sufIcon&&item.sufIcon.name"
                  :style="[item.sufIcon.style]" :src="require('@/static/icon/'+item.sufIcon.name+'.png')"
                  mode="aspectFit">
                </image>
                <image class="icon" :class="item.sufIcon.fileNo" v-else-if="item.sufIcon&&item.sufIcon.fileNo"
                  :style="[item.sufIcon.style]" :src="getImagePath(item.sufIcon.fileNo,true)" mode="aspectFit"></image>
              </template>
            </view>
          </view>
          <view class="foot-button-box grid"
            v-if="buttonPosition!=='right'&&setViewTemp && setViewTemp.lp_style === '宫格'&&hasShowButton && setViewTemp.grid_span >= 3&&listType!=='selectorList'&listType!=='multiSelectByJson'">
            <button class="cu-btn" :style="[setListView.btnStyle]" :class="[setListView.btnClass]"
              v-for="(btn,index) in setRowButton" :key="index" v-show="isShowBtn(btn)" @click.stop="clickButton(btn)">
              {{ btn.button_name }}
            </button>
          </view>
          <view class="foot-button-box wrap-row"
            v-else-if="disabledEvaluate!==true&&showEvaluate&&mainData&&mainData.order_no &&rowData.goods_no&&mainData.pay_state&&rowData.is_remark&&mainData.order_state==='已完成'">
            <button class="cu-btn round sm border"
              v-if="disabledEvaluate!==true&&mainData.order_state==='已完成'&&rowData.is_remark=='待评价'&&mainData.pay_state==='已支付'"
              @click.stop="toEvaluate">评价</button>
            <button class="cu-btn round sm border" v-if="rowData.is_remark!='待评价'"
              @click.stop="toEvaluate('detail')">查看评价</button>
          </view>
          <view class="foot-button-box" :class="{'wrap-row':!setListView.btnWrapRow||setListView.btnWrapRow!==false}"
            v-else-if="buttonPosition!=='right'&&hasShowButton&&listType!=='selectorList'&&listType!=='multiSelectByJson'">
            <button class="cu-btn" :class="[setListView.btnClass]"
              :style="[setListView.btnStyle,btn.moreConfig&&btn.moreConfig.btnStyle?btn.moreConfig.btnStyle:'']"
              v-for="(btn,index) in setRowButton" :open-type="btn.moreConfig.openType"
              :data-sharetitle="btn.moreConfig.shareTitle" :data-shareurl="btn.moreConfig.shareUrl" :data-row="rowData"
              :data-btn="btn" :key="index" v-show="isShowBtn(btn)" @click.stop="clickButton(btn)">
              {{ btn.button_name }}
            </button>
          </view>
        </view>

      </view>
      <view class="list-item-button" v-if="buttonPosition==='right'">
        <button class="cu-btn" v-for="(btn,index) in setRowButton" :open-type="btn.moreConfig.openType"
          :data-sharetitle="btn.moreConfig.shareTitle" :data-shareurl="btn.moreConfig.shareUrl" :data-row="rowData"
          :data-btn="btn" :key="index" v-show="isShowBtn(btn)" @click.stop.prevent.capture="clickButton(btn)">
          <text v-if="btn.icon" :class="btn.icon">

          </text>
          <text v-else>
            {{ btn.button_name }}
          </text>
        </button>
      </view>
      <view class="main-image" :style="{
					'border-radius': setViewTemp.img.cfg.radius,
					width: setViewTemp.img.cfg.width,
					margin: setViewTemp.img.cfg.margin,
					padding: setViewTemp.img.cfg.padding
				}" :class="{
					'm-r-0': setViewTemp.img.cfg.position === 'top'
				}"
        v-if="setViewTemp && setViewTemp.img && setViewTemp.img.col && setViewTemp.img.cfg && setViewTemp.img.cfg.position == 'right'">
        <!-- <image class="image" :src="getImagePath(rowData[setViewTemp.img.col])" -->
        <image lazy-load class="image" :src="getImagePath(setValue(setViewTemp.img.col).value, true)"
          :mode="setViewTemp.img.cfg.mode || 'aspectFill'" :style="{
						'border-radius': setViewTemp.img.cfg.radius,
						width: setViewTemp.img.cfg.width
					}"></image>
      </view>
    </view>
    <!--    <view class="foot-button-box"
      v-if="setViewTemp && setViewTemp.lp_style === '宫格' && setViewTemp.grid_span >= 3&&listType!=='selectorList'">
    </view> -->
  </view>
</template>

<script>
  // #ifdef MP-WEIXIN
  import listItem from './list-item.vue';
  // #endif
  import {
    throttle
  } from '@/common/func/util.js'
  export default {
    name: "list-item",
    components: {
      // #ifdef MP-WEIXIN
      'list-item': listItem,
      // #endif
    },
    props: {
      disabledEvaluate:Boolean,
      // 主表数据
      mainData: {
        type: Object
      },
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
      },
      appName: {
        type: String
      },
      childData: {
        type: [Object, Array]
      },
      disabled: [String, Boolean]
    },
    data() {
      return {
        setChildData: null
      };
    },
    watch: {
      childData: {
        deep: true,
        immediate: true,
        handler(newValue, oldValue) {
          if (Array.isArray(newValue)) {
            if (Array.isArray(this.setViewTemp?.cols)) {
              let related_col = this.setViewTemp?.cols.find(item => item.type === 'childData')?.related_col
              if (related_col) {
                this.setChildData = newValue.filter(item => item[related_col] === this.rowData[
                  related_col])
              }
            }
          }

        }
      }
    },
    computed: {
      buttonPosition() {
        return this.viewTemp?.btn_cfg?.position
      },
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
          borderRadius: this.viewTemp?.borderRadius,
          btn_cfg: this.viewTemp?.btn_cfg,
          background: this.viewTemp?.bg || this.viewTemp?.background,
          img: {
            placeholder: this.viewTemp?.img?.placeholder,
            icon: this.viewTemp?.img?.icon,
            col: this.viewTemp?.img?.col,
            cfg: this.viewTemp?.img?.cfg || {
              radius: '50%',
              position: 'left',
              mode: 'aspectFill'
            }
          },
          right_content: this.viewTemp?.right_content,
          cols: []
        };
        if (Array.isArray(this.viewTemp?.cols) && this.viewTemp?.cols.length > 0) {
          obj.cols = this.viewTemp?.cols;
        } else {
          if (obj.cols === false) {
            return obj
          }
          if (typeof this.rowData === 'object' && Object.keys(this.rowData).length > 0) {
            let arr = [];
            Object.keys(this.rowData).forEach(key => {
              if (!['id', 'create_time', 'create_user', 'modify_time', 'modify_user',
                  'create_user_disp', 'modify_user_disp', '_buttons'
                ].includes(key)) {
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
      hasShowButton() {
        let rowButton = this.setRowButton;
        if (Array.isArray(rowButton) && rowButton.length > 0) {
          rowButton = rowButton.filter(item => {
            if (item.button_type === 'customize') {
              if (this.setViewTemp?.btn_cfg?.show_custom_btn === false) {
                return false
              }
            } else if (this.setViewTemp?.btn_cfg?.show_public_btn === false) {
              return false
            }
            return true
          })
          return rowButton.length > 0
        }
      },
      showEvaluate() {
        // 是否显示自定义评价按钮
        return this.setViewTemp?.btn_cfg?.show_evaluate === true&&this.disabledEvaluate!==true
      },
      setButtonsAuth() {
        return this.rowData?._buttons || []
      },
      setRowButton() {
        let buttons = [];
        if (Array.isArray(this.rowButton) && this.rowButton.length > 0) {
          this.rowButton.forEach((e, index) => {
            let item = {
              ...e
            }
            if (!item?.moreConfig) {
              item.moreConfig = {}
            }
            if (this.viewTemp?.btn_cfg?.position === 'right') {
              if (Array.isArray(this.viewTemp?.btn_cfg?.icon) && this.viewTemp?.btn_cfg?.icon.length > index) {
                item.icon = `cuIcon-${this.viewTemp?.btn_cfg?.icon[index]}`
              } else if (item.button_type && item.button_type.indexOf('delete') !== -1) {
                item.icon = 'cuIcon-delete'
              } else if (item.button_type && item.button_type.indexOf('edit') !== -1) {
                item.icon = 'cuIcon-write'
              } else if (item.button_type && item.button_type.indexOf('add') !== -1) {
                item.icon = 'cuIcon-add'
              }
            }
            buttons.push(item)
          })
          
          buttons = buttons.filter((item, index) => {
            if (item.client_type && item.client_type.indexOf('APP') == -1) {
              // 根据自定义按钮配置的客户端类型过滤按钮
              return false
            }

            if (this.setViewTemp?.btn_cfg?.show_public_btn === false && item.is_public == true && item
              .button_type !== 'detail') {
              return false
            }

            if (this.setViewTemp?.btn_cfg?.show_custom_btn === false && item.button_type === 'customize') {
              return false
            }

            if (this.rowButtonDisp && this.rowButtonDisp[item.button_type] === false) {
              return false
            }

            if (Array.isArray(this.setButtonsAuth) && this.setButtonsAuth.length === this
              .rowButton.length) {
              return this.setButtonsAuth[index] === 1;
            } else {
              return false
            }

            return true;
          });
        }
        // if (this.setViewTemp?.btn_cfg?.show_public_btn === false) {
        //   buttons = buttons.filter(item => item.is_public !== true || item.button_type === 'detail');
        // }
        // if (this.setViewTemp?.btn_cfg?.show_custom_btn === false) {
        //   buttons = buttons.filter(item => item.is_public === true);
        // }
        // buttons = buttons.filter(btn => {
        //   if (this.rowButtonDisp && this.rowButtonDisp[btn.button_type] === false) {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // });
        return buttons;
      },
      setListView() {
        let self = this
        let result = {
          rootClass: '',
          rootStyle: {
            margin: this.setViewTemp?.margin,
            padding: this.setViewTemp?.padding,
            borderRadius: this.setViewTemp?.borderRadius,
            background: this.setViewTemp?.bg || this.setViewTemp?.background,
          }
        };
        if (this.listType == 'selectorList' && this.disabled === true) {
          result.rootClass += `disabled `;
        }
        if (this.setViewTemp?.lp_style === '宫格') {
          let gridSpan = Number(this.setViewTemp?.grid_span);
          result.rootClass += `grid_span${gridSpan}`;
        }
        // 按钮配置
        let btnCfg = this.setViewTemp?.btn_cfg;
        if (btnCfg?.wrap_row) {
          result.btnWrapRow = true
        }
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
          margin: btnCfg?.margin,
          color: btnCfg?.color
        };
        if (btnCfg?.border_color && btnCfg?.border_color.indexOf('#') !== -1) {
          result.btnStyle['border-color'] = btnCfg?.border_color;
        }
        if (btnCfg?.bg && btnCfg?.bg.indexOf('#') !== -1) {
          result.btnStyle['background-color'] = btnCfg?.bg;
        }
        if (this.setViewTemp?.img?.col) {
          // 图片配置
          result.showImg = true;
          let imgCfg = this.setViewTemp?.img?.cfg;
          result.imgAlign = imgCfg.position || 'left';
          result.imgClass = `${imgCfg.position === 'top' ? 'm-r-0' : ''}`;

          if (this.setViewTemp?.img?.placeholder) {
            result.imgSrc = this.getImagePath(this.setViewTemp?.img?.placeholder, true);
            if (this.setViewTemp?.img?.placeholder == 'profile') {
              result.imgSrc = require('@/static/profile.png')
            }
          }

          if (this.setValue(this.setViewTemp.img.col).value) {
            result.imgSrc = this.getImagePath(this.setValue(this.setViewTemp.img.col).value, imgCfg?.compress ? false :
              true);
          }

          result.imgStyle = {
            'border-radius': imgCfg?.radius,
            'border': imgCfg?.border,
            width: imgCfg?.width,
            height: imgCfg?.height,
            margin: imgCfg?.margin,
            padding: imgCfg?.padding
          };
          result.imgTagStyle = {
            'border-radius': imgCfg.radius,
            width: imgCfg.width
          };
          if (imgCfg.position !== 'top') {
            result.listContentMaxWidth = imgCfg.width ? `calc(100% - ${imgCfg.width})` : `calc(100% - 50px)`
          }
          result.imgMode = imgCfg?.mode || 'aspectFit';
          if (result.imgStyle.width) {
            // result.listContentWidth = `calc(100% - ${result.imgStyle.width})`
          }
          if (result.imgAlign === 'top' || result.imgAlign === 'bottom') {
            result.rootClass += ` image-vertical`;
          }
        }

        if (this.setViewTemp?.img?.icon) {
          let imgIcon = this.setViewTemp?.img?.icon;
          if (imgIcon?.type === 'gender') {
            if (imgIcon?.ref_col && this.rowData[imgIcon?.ref_col]) {
              result.imgIcon = {
                name: this.rowData[imgIcon?.ref_col] === '男' ? "male" : this.rowData[imgIcon?.ref_col] === '女' ?
                  "female" : null,
                fileNo: imgIcon?.fileNo,
                style: imgIcon?.style || {
                  borderRadius: imgIcon?.radius || imgCfg?.radius
                }
              }
            }
          }
        }
        let rightCols = this.setViewTemp?.right_content?.cols
        if (rightCols) {
          result.rightContent = this.setViewTemp?.right_content
          result.rightContent.leftLine = this.setViewTemp?.right_content?.left_line === true

          result.rightStyle = {
            width: result.rightContent.width,
            margin: result.rightContent.margin,
            padding: result.rightContent.padding,

          }
          if (result.rightContent?.text_align) {
            switch (result.rightContent?.text_align) {
              case 'left':
                result.rightStyle['align-items'] = 'flex-start'
                break;
              case 'right':
                result.rightStyle['align-items'] = 'flex-end'
                break;
              default:
                result.rightStyle['align-items'] = result.rightContent?.text_align
                break;
            }
          }
          if (result.rightContent?.vertical_align) {
            switch (result.rightContent?.vertical_align) {
              case 'between':
                result.rightStyle['justify-content'] = 'space-between'
                break;
              case 'around':
                result.rightStyle['justify-content'] = 'flex-end'
                break;
              default:
                result.rightStyle['justify-content'] = result.rightContent?.vertical_align
                break;
            }
          }
          result.rightCols = []
          if (Array.isArray(rightCols) && rightCols.length > 0) {
            rightCols.forEach(col => {
              let cfg = col?.cfg;
              let obj = {
                sufIcon: col.sufIcon,
                preIcon: col.preIcon,
                style: {
                  flex: cfg?.flex,
                  'border-radius': cfg?.radius,
                  width: cfg?.width,
                  height: cfg?.height,
                  'min-width': cfg?.min_width,
                  'max-width': cfg?.max_width,
                  padding: cfg?.padding,
                  margin: cfg?.margin,
                  'font-size': cfg?.font_size,
                  'font-weight': cfg?.font_weight,
                  'text-align': cfg?.align,
                  'overflow': cfg?.overflow,
                  color: cfg?.color,
                  'justify-content': cfg?.align === 'left' ? 'flex-start' : cfg?.align ===
                    'right' ? 'flex-end' : cfg?.align
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

              if (cfg?.mode) {
                obj.mode = cfg.mode
                obj.max = cfg.max
                obj.allowHalf = cfg.allowHalf
              }
              if (col?.type === 'media') {
                // 图片、视频
                obj.type = col.type;
                obj.imgStyle = {
                  width: cfg?.imgStyle?.width,
                  height: cfg?.imgStyle?.height,
                  'border-radius': cfg?.imgStyle?.radius,
                }
              }
              if (cfg?.bg && cfg?.bg.indexOf('#') !== -1) {
                obj.style['background-color'] = cfg.bg;
              }
              if (cfg?.decoration) {
                obj.style['text-decoration'] = cfg?.decoration;
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
              obj.fmt = cfg?.fmt;
              obj.separator = cfg?.separator
              obj.valueWhiteSpace = cfg?.white_space;
              if(cfg?.white_space=='nowrap'){
                cfg.flexWrap = 'nowrap'
                obj.style['flex-wrap'] = 'nowrap';
                obj.style['white-space'] = 'nowrap';
              }
              obj.event = col.event
              if (col?.col) {
                let getVal = this.setValue(col.col, col.cfg);
                if (getVal?.index === 0) {
                  obj.prefix = cfg?.prefix || '';
                  obj.suffix = cfg?.suffix || '';
                }
                if (cfg?.disp_label !== false) {
                  obj.label = getVal?.label || '';
                }
                obj.value = getVal?.value;
                if (obj.value === 0) {
                  obj.value = '0'
                } else if (!obj.value && col?.placeholder) {
                  obj.value = col?.placeholder
                }
              }

              if (Array.isArray(cfg?.value_map) && cfg.value_map.length > 0) {
                cfg.value_map.forEach(item => {
                  if (obj.value === item.value) {
                    obj.value = item.label;
                    obj.style['background-color'] = item.bg;
                    obj.style['color'] = item.color;
                    result.rootStyle['background-color'] = item?.item_bg || result
                      .rootStyle['background-color'];
                    result.rootStyle['color'] = item?.item_color || result.rootStyle[
                      'color'];
                    result.btnStyle['background-color'] = item?.btn_bg || result.btnStyle
                      .bg;
                    result.btnStyle.color = item?.btn_color || result.btnStyle.color;
                    if (Array.isArray(item.other_col) && item.other_col.length > 0) {}
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
                            obj.style.color = cfgItem.color || obj.style
                              .color;
                          }
                        } else if (cond.ruleType === 'in') {
                          if (cond.value.indexOf(setValue.value) !== -1) {
                            obj.style.color = cfgItem.color || obj.style
                              .color;
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
              if (col.type === 'childData') {
                obj = col;
                obj.style = {
                  width: "100%"
                }
                if (col?.related_col) {
                  let related_col = col?.related_col
                  if (self.childData && Array.isArray(self.childData)) {
                    obj.childData = self.childData.filter(item => item[related_col] === self.rowData[
                      related_col])
                  }
                }

              }
              result.rightCols.push(obj);
            });
          }
        }


        // 字段配置
        let cols = this.setViewTemp?.cols || [];
        result.cols = [];
        if (Array.isArray(cols) && cols.length > 0) {
          cols.forEach(col => {
            let cfg = col?.cfg;
            let obj = {
              sufIcon: col.sufIcon,
              preIcon: col.preIcon,
              style: {
                flex: cfg?.flex,
                'border-radius': cfg?.radius,
                width: cfg?.width,
                height: cfg?.height,
                'min-width': cfg?.min_width,
                'max-width': cfg?.max_width,
                padding: cfg?.padding,
                margin: cfg?.margin,
                'font-size': cfg?.font_size,
                'font-weight': cfg?.font_weight,
                'text-align': cfg?.align,
                'overflow': cfg?.overflow,
                color: cfg?.color,
                'justify-content': cfg?.align === 'left' ? 'flex-start' : cfg?.align ===
                  'right' ? 'flex-end' : cfg?.align
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
            if (cfg?.line_clamp && !isNaN(Number(cfg?.line_clamp))) {
              obj.style.overflow = 'hidden'
              obj['text-overflow'] = null
              obj.style.display = '-webkit-box'
              obj.style['-webkit-box-orient'] = 'vertical'
              obj.style['-webkit-line-clamp'] = Number(cfg?.line_clamp)
              if (cfg?.white_space) {
                cfg.white_space = null
              }
            }
            if (cfg?.mode) {
              obj.mode = cfg.mode
              obj.max = cfg.max
              obj.allowHalf = cfg.allowHalf
            }
            if (col?.type === 'media') {
              // 图片、视频
              obj.type = col.type;
              obj.imgStyle = {
                width: cfg?.imgStyle?.width,
                height: cfg?.imgStyle?.height,
                'border-radius': cfg?.imgStyle?.radius,
              }
            }
            if (cfg?.bg && cfg?.bg.indexOf('#') !== -1) {
              obj.style['background-color'] = cfg.bg;
            }
            if (cfg?.decoration) {
              obj.style['text-decoration'] = cfg?.decoration;
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
            obj.fmt = cfg?.fmt;
            obj.separator = cfg?.separator
            obj.prefix = cfg?.prefix || '';
            obj.suffix = cfg?.suffix || '';
            obj.valueWhiteSpace = cfg?.white_space;
            if(cfg?.white_space=='nowrap'){
              cfg.flexWrap = 'nowrap'
              obj.style['flex-wrap'] = 'nowrap';
              obj.style['white-space'] = 'nowrap';
            }
            obj.event = col.event
            if (col?.col) {
              let getVal = this.setValue(col.col, col.cfg);
              if (getVal?.index === 0) {
                obj.prefix = cfg?.prefix || '';
                obj.suffix = cfg?.suffix || '';
              }
              if (cfg?.disp_label !== false) {
                obj.label = getVal?.label || '';
              }
              obj.value = getVal?.value;
              if (obj.value === 0) {
                obj.value = '0'
              }
            }

            if (Array.isArray(cfg?.value_map) && cfg.value_map.length > 0) {
              cfg.value_map.forEach(item => {
                if (obj.value === item.value) {
                  obj.value = item.label;
                  obj.style['background-color'] = item.bg;
                  obj.style['color'] = item.color;
                  result.rootStyle['background-color'] = item?.item_bg || result
                    .rootStyle['background-color'];
                  result.rootStyle['color'] = item?.item_color || result.rootStyle[
                    'color'];
                  result.btnStyle['background-color'] = item?.btn_bg || result.btnStyle
                    .bg;
                  result.btnStyle.color = item?.btn_color || result.btnStyle.color;
                  if (Array.isArray(item.other_col) && item.other_col.length > 0) {}
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
                          obj.style.color = cfgItem.color || obj.style
                            .color;
                        }
                      } else if (cond.ruleType === 'in') {
                        if (cond.value.indexOf(setValue.value) !== -1) {
                          obj.style.color = cfgItem.color || obj.style
                            .color;
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
            if (col.type === 'childData') {
              obj = col;
              obj.style = {
                width: "100%"
              }
              if (col?.related_col) {
                let related_col = col?.related_col
                if (self.childData && Array.isArray(self.childData)) {
                  obj.childData = self.childData.filter(item => item[related_col] === self.rowData[
                    related_col])
                }
              }

            }
            result.cols.push(obj);
          });
        }
        return result;
      }
    },
    methods: {
      toEvaluate(e) {
        // 跳转到评价页面
        let fieldsCond = [{
          "column": "store_no",
          "value": this.storeInfo.store_no
        }, {
          "column": "store_user_no",
          "value": this.vstoreUser?.store_user_no
        }, {
          "column": "goods_no",
          "value": this.rowData?.goods_no
        }, {
          "column": "order_no",
          "value": this.rowData?.order_no
        }, {
          "column": "person_name",
          "value": this.userInfo.name
        }, {
          "column": "person_photo",
          "value": this.userInfo.profile_url || this.userInfo.user_image
        }, {
          "column": "order_goods_rec_no",
          "value": this.rowData?.order_goods_rec_no
        }]
        let url =
          `/publicPages/formPage/formPage?serviceName=srvhealth_store_goods_remark_add&destApp=health&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`
        if (e == 'detail') {
          url =
            `/storePages/evaluateList/evaluateList?no=${this.rowData?.goods_no}&order_goods_rec_no=${this.rowData?.order_goods_rec_no}`
        }
        uni.navigateTo({
          url
        })

      },
      formatText(item) {
        let text = item.value
        let type = item.fmt
        let result = ''
        if (text) {
          switch (type) {
            case 'tags':
              result = text.split(',')
              if (text.indexOf('，') !== -1) {
                result = text.split('，')
              }
              break;
            default:
              break;
          }
        }
        return result

      },
      async getLocationFromSys(gno) {
        const app = this.appName || uni.getStorageSync('activeApp')
        const req = {
          "serviceName": "srvsys_obj_type_gps_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'gno',
            ruleType: 'eq',
            value: gno
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
      async openLocation(e) {
        if (e?.col && this.rowData[e.col]) {
          let res = await this.getLocationFromSys(this.rowData[e.col])
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
      },
      excludeEnter(val) {
        if (val && typeof val === 'string') {
          return val.replaceAll('\n', '');
        } else {
          return val || '';
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
          if (detail[column] || detail[column] == 0) {
            resCol = column;
            res['index'] = i
            break;
          }
        }
        if (!resCol && Array.isArray(arr) && arr.length > 0) {
          resCol = arr[0];
        }
        res.label = cfg?.custom_label || labelMap[resCol] || cfg?.default_label || '';
        res.value = detail[resCol] ?? cfg?.default_val ?? '';

        if (res.value && typeof res.value === 'string') {
          res.value = res.value.replace(/\\n/, '')
        }

        if ((cfg?.format?.type === 'date' || cfg?.format?.type === 'dateTime') && res.value && cfg?.format?.rule) {
          res.value = this.dayjs(res.value).format(cfg?.format?.rule)
        }

        if (cfg?.format?.type === 'time' && res.value && cfg?.format?.rule && cfg?.format?.rule.indexOf('Y') == -1 &&
          cfg?.format?.rule.indexOf('M') == -1 && cfg?.format?.rule.indexOf('D') == -1) {
          res.value = this.dayjs(this.dayjs().format("YYYY-MM-DD") + ' ' + res.value).format(cfg?.format?.rule)
        }

        return res;
      },
      del: throttle(function() {
        this.$emit('del2Cart', this.rowData);
      }, 1000, true),
      add: throttle(function() {
        this.$emit('add2Cart', this.rowData);
      }, 1000, true),
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

    &.child-data {
      width: calc(100% - 40px);
      // border-bottom: 1px dashed #f1f1f1;
      // border-radius: 0;
      // &:last-child{
      //   border-bottom: none;
      // }
    }

    &.image-vertical {
      // 图片在垂直方向（上方、下方）
      flex-wrap: wrap;

      .list-item {
        flex-wrap: wrap;
      }
    }

    .list-item {
      // flex: 1;
      display: flex;
      width: 100%;

      .cuIcon-moreandroid {
        margin-bottom: 10rpx;
      }

      .main-image {
        width: 50px;
        min-height: 50px;
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        // background-color: #fff;
        // border: 1rpx solid #f8f8fa;
        position: relative;

        .icon {
          position: absolute;
          top: -3px;
          left: -3px;
          width: 24px;
          height: 24px;
          padding: 6px;
          background-color: #007aff;

          &.female {
            background-color: #ff7598;
          }
        }

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

      .list-item-button {
        display: flex;
        align-items: center;

        .cu-btn {
          background-color: transparent;
          padding: 0 10px;
        }
      }

      .list-item-right-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        position: relative;

        &.left-line {
          padding-left: 10rpx;
          margin-left: 10rpx;

          &:before {
            content: '';
            position: absolute;
            left: 0;
            height: 80%;
            top: 10%;
            width: 1px;
            background-color: #f1f1f1;
          }
        }
      }

      .list-item-content {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        max-width: 100%;
        min-width: 60%;

        .col-item {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 10rpx;
          font-size: 28rpx;
          font-family: 苹方-简;
          color: #333333;

          .child-data {
            width: 100%;

            .list-item-wrap {
              width: 100%;
            }
          }

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
            word-break: break-all;
            max-width: 100%;
            // flex: 1;
            // display: inline-flex;
            align-items: center;

            .icon {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .foot-button-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      // width: 100%;
      flex: 1;

      &.wrap-row {
        width: 100%;
        flex: none;
      }

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

  .flex-1 {
    flex: 1;
  }
</style>
