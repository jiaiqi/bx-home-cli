<template>
  <view class="page-wrap" :class="{'pc-model':sysModel==='PC','cart-list':listType==='cartList'}"
    :style="[{'padding-top':topHeight + 'px'}]">
    <view class="top-bar" id="top-bar" v-if="topQueryMode&&floatQueryCols&&floatQueryCols.length>0">
      <step-query :srvApp="appName" :total="total" :fieldInfo="floatQueryCols" @toFilter="toFilter">
      </step-query>
      <view class="flex padding-lr padding-bottom-xs align-center">
        共为您找到 <text class="text-blue padding-lr-xs">{{total||'0'}}</text> 条匹配结果
      </view>
      <view class="tabs-view" v-if="tabsCfg&&tabsCfg.tabs&&tabsCfg.col">
        <u-tabs :list="enumTabs" :is-scroll="true" :current="curTab" :active-color="tabsCfg.activeColor"
          @change="changeTabs"></u-tabs>
      </view>
    </view>
    <view class="top-bar" id="top-bar" v-else>
      <count-bar :list="countData" :config="countConfig" v-if="countData"></count-bar>
      <list-bar @change="changeSerchVal" :listType="listType" :filterCols="filterCols" :srvApp="appName"
        :gridButtonDisp="gridButtonDisp" :rowButtonDisp="rowButtonDisp" :formButtonDisp="formButtonDisp"
        :srvCols="srvCols" :placholder="placeholder" :listButton="listButton" @toOrder="toOrder" @toFilter="toFilter"
        @handelCustomButton="handlerCustomizeButton" @onGridButton="clickGridButton" @clickAddButton="clickAddButton"
        @search="toSearch" v-if="srvCols&&srvCols.length>0&&list_config.list_bar!==false" :fixed="false"
        :top="topHeight" :readonly="listBarReadonly">
      </list-bar>
      <filter-tags :mode="tagsMode" :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
        @on-input-value="onFilterChange" @on-change="getListWithFilter"
        v-if="colV2&&colV2.srv_cols&&tags&&filterTags!==false&&sysModel!=='PC'">
      </filter-tags>
      <filter-tags :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
        @on-input-value="onFilterChange" @on-change="getListWithFilter"
        v-if="colV2&&colV2.srv_cols&&tags&&sysModel==='PC'">
      </filter-tags>
      <view class="tabs-view" v-if="tabsCfg&&tabsCfg.tabs&&tabsCfg.col">
        <u-tabs :list="enumTabs" :is-scroll="true" :current="curTab" :active-color="tabsCfg.activeColor"
          @change="changeTabs"></u-tabs>
      </view>
    </view>

    <view class="list-content" :class="['theme-'+theme]">
      <!--   <filter-tags :mode="tagsMode" :tabs="tags" ref="filterTabs" :cols="colV2.srv_cols" :srv="serviceName"
        @on-input-value="onFilterChange" @on-change="getListWithFilter"
        v-if="colV2&&colV2.srv_cols&&tags&&sysModel!=='PC'">
      </filter-tags> -->
      <view class="list-view">
        <list-next class="list-next" ref="listRef" :disabledEvaluate="disabledEvaluate" :selectoDataId="selectoDataId"
          :disabledCol="disabledCol" :id-col="idCol" :gridButtonDisp="gridButtonDisp" :rowButtonDisp="rowButtonDisp"
          :formButtonDisp="formButtonDisp" :cartData="cartData" :listConfig="listConfig" :list="list"
          :listType="listType" :colV2="colV2" :appName="appName" @click-foot-btn="clickFootBtn" @add2Cart="add2Cart"
          @del2Cart="del2Cart" @checkboxChange="checkboxChange" />
        <u-empty text="列表为空" mode="list" v-if="loadStatus==='noMore'&&list.length==0"></u-empty>
        <uni-load-more :status="loadStatus" v-else></uni-load-more>
      </view>
    </view>
    <goods-cart :cartData="cartData" :fixed="true" bottom="50rpx" :list_config="list_config" :wxMchId="wxMchId"
      @changeAmount="changeAmount" @clear="clearCart" v-if="listType==='cart'"></goods-cart>
    <cart-bottom :sum-price="sumPrice" ref="cartBottom" @selectAll="selectAllChange" @del="del" :mode="cartMode"
      @toOrderPage="toOrderPage" v-if="listType==='cartList'">
    </cart-bottom>
    <view class="bottom-button" v-if="selectoDataId">
      <button class="cu-btn bg-blue round shadow-blur" @click="confirmSelect">确认</button>
    </view>


    <view class="cu-modal bottom-modal" :class="{ show: modalName === 'showQrCode' }" @click="hideModal">
      <view class="cu-dialog " @click.stop="">
        <view class="qrcode-box">
          <!-- <view class="title">我的推广码</view> -->
          <image :src="qrcodePath" mode="aspectFit" class="qr-code-image" show-menu-by-longpress
            v-if="storeInfo && qrcodePath" @click="toPreviewImage(qrcodePath)" :show-menu-by-longpress="true"></image>
          <view class="qr-code-image" v-else @click="makeQrCode"><text class="cuIcon-refresh"></text></view>
          <!-- <view class="store-name">{{ setStoreInfo.name || '' }}</view> -->
          <view class="store-name">长按保存图片</view>
        </view>
        <view class="button-box"><button @click.stop="hideModal()" class="cu-btn">关闭</button></view>
        <view class="qrcodeCanvas-box" v-if="modalName === 'showQrCode' && qrCodeText">
          <uni-qrcode cid="qrcodeCanvas" style="width: 100px;height: 100px;" :text="qrCodeText" :size="codeSize"
            class="qrcode-canvas" foregroundColor="#333" makeOnLoad @makeComplete="qrcodeCanvasComplete"
            ref="qrcodeCanvas">
          </uni-qrcode>
        </view>
      </view>
    </view>
    <view class="upper-icon" v-if="showUpper" @click.stop.prevent="toTop">
      <text class="cuIcon-top"></text>
    </view>
  </view>
</template>

<script>
  import {
    debounce
  } from '@/common/func/util.js'
  import listNext from '@/components/list-next/list-next.vue';
  import countBar from '../components/count-bar/count-bar.vue'
  import cartBottom from '../components/cart-bottom/cart-bottom.vue'
  import stepQuery from '../components/step-query/step-query.vue'
  export default {
    components: {
      listNext,
      // listBar,
      countBar,
      cartBottom,
      stepQuery
    },
    watch: {
      enumTabs: {
        immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          if (Array.isArray(newValue) && newValue.length > 0) {
            if (this.curTabVal) {
              let tab = newValue.findIndex(item => item.name === this.curTabVal);
              if (tab > -1) {
                this.changeTabs(tab)
              }
            }
          }
        }
      }
    },
    computed: {
      showUpper() {
        return this._pageScrollTop > 100
      },
      tagsMode() {
        return this.moreConfig?.tagsMode || 'unfold'
      },
      enumTabs() {
        return this.tabsCfg?.tabs || []
      },
      sysModel() {
        return getApp().globalData.systemInfo?.model
      },
      theme() {
        return this.$store?.state?.app?.theme
      },
      tags() {
        let self = this
        let tabs = this.colV2?.tabs
        if (Array.isArray(tabs) && tabs.length === 0 && Array.isArray(this.colV2?.moreConfig?.tags_cfg) && this.colV2
          ?.moreConfig?.tags_cfg.length > 0) {
          tabs = this.colV2?.moreConfig?.tags_cfg
        }
        if (Array.isArray(tabs) && tabs.length > 0) {
          let tab = {}
          let tabsData = []
          tabs.forEach((t) => {
            tab = {
              service: null,
              table_name: null,
              orders: null,
              conditions: null,
              seq: null,
              parent: null,
              label: null,
              list_tab_no: null,
              more_config: null,
              inputType: null
            }
            let mc = {}
            if (t.more_config) {
              try {
                mc = JSON.parse(t.more_config)
                tab.more_config = mc
              } catch (e) {
                //TODO handle the exception
              }
            } else {
              mc = {
                ...t
              }
              tab.more_config = mc
            }
            tab.service = t.service
            tab.table_name = t.table_name
            tab.conditions = t.conditions
            tab.orders = t.orders
            tab.default = mc.default
            tab.seq = t.seq
            tab.label = t.label
            tab.list_tab_no = t.list_tab_no
            tab._data = t
            tab._type = mc.type || null
            tab._colName = mc.colName || null
            tab.inputType = mc.inputType || null
            tab.showAllTag = mc.showAllTag || false
            tab.default = mc.default || ''
            tab.placeholder = mc.placeholder || '请输入...'
            if (tab._colName) {
              tab._colName = tab._colName.split(',')
              let cols = tab._colName
              let srvCols = self.colV2.srv_cols
              tab['_colSrvData'] = []
              for (let c = 0; c < cols.length; c++) {
                for (let cs = 0; cs < srvCols.length; cs++) {
                  if (cols[c] === srvCols[cs].columns) {
                    tab._colSrvData.push(srvCols[cs])
                  }
                }
              }
            }
            tabsData.push(tab)
          })
          return tabsData
        }
        // return this.colV2?.tabs
      },
      listBarReadonly() {
        return this.listConfig?.listBarReadonly || this.disabled
      },
      publicButton() {
        if (Array.isArray(this.colV2?.gridButton) && this.colV2?.gridButton.length > 0) {
          return this.colV2.gridButton
        }
        return []
      },
      filterTags() {
        return this.listConfig?.filterTags ?? this.colV2?.moreConfig?.filterTags ?? this.colV2?.moreConfig?.list_config
          ?.filterTags ?? ''
      },
      placeholder() {
        return this.listConfig?.searchHint || this.colV2?.moreConfig?.searchHint || this.colV2?.moreConfig?.list_config
          ?.searchHint || ''
      },
      moreConfig() {
        return this.colV2?.moreConfig || {}
      },

      list_config() {
        let config = this.colV2?.moreConfig?.list_config
        let obj = {
          'bg': this.listConfig?.bg || config?.bg || '',
          "lp_style": this.listConfig?.lp_style || config?.lp_style || "复合",
          "grid_span": this.listConfig?.grid_span || config?.grid_span || "2",
          "detailPage": this.listConfig?.detailPage || config?.detailPage,
          'margin': this.listConfig?.margin || config?.margin,
          'padding': this.listConfig?.padding || config?.padding,
          "list_bar": this.listConfig?.list_bar ?? config?.list_bar,
          "btn_cfg": {
            "show_custom_btn": this.listConfig?.show_custom_btn ?? config?.btn_cfg?.show_custom_btn ??
              null,
            "show_public_btn": this.listConfig?.show_public_btn ?? config?.btn_cfg?.show_public_btn ??
              null,
            "show": config?.btn_cfg?.show || true,
            "bg_style": config?.btn_cfg?.bg_style || "line",
            "bg": config?.btn_cfg?.bg,
            'color': config?.btn_cfg?.color,
            "font_size": config?.btn_cfg?.font_size,
            "radius": config?.btn_cfg?.radius || "10px",
            "size": config?.btn_cfg?.size || "sm",
            "padding": config?.btn_cfg?.padding || null
          },
          "img": {
            "col": this.listConfig?.img?.col || config?.img?.col,
            "cfg": {
              "width": this.listConfig?.img?.width || config?.img?.cfg?.width || "100%",
              "height": this.listConfig?.img?.height || config?.img?.cfg?.height || "150rpx",
              "radius": config?.img?.cfg?.radius || "10px 10px 0 0",
              "position": config?.img?.cfg?.position || "top",
              "mode": this.listConfig?.img?.mode || config?.img?.cfg?.mode || "",
              "padding": this.listConfig?.img?.padding || config?.img?.cfg?.padding || "",
              "margin": this.listConfig?.img?.margin || config?.img?.cfg?.margin || ""
            }
          },
          right_content: this.listConfig?.right_content || config?.right_content,
          cols: this.listConfig?.cols || config?.cols
        }
        return obj
        // return this.colV2?.moreConfig?.list_config || {}
      },
      listButton() {
        let buttons = this.publicButton
        let res = buttons.filter(item => {
          if (['select', 'add', 'apply', 'customize'].includes(item.button_type)) {
            if (item.button_type === 'select') {
              return this.colV2?._fieldInfo
            }
            if (item.button_type === 'add') {
              return true
            }
            return true
          }
        }).map(item => {
          if (item.button_type === 'select') {
            item.icon = 'cuIcon-filter'
            item.button_name = '筛选'
            item.clickEvent = this.showFilterModal
          } else if (['add', 'apply'].includes(item.button_type)) {
            item.icon = 'cuIcon-add'
            item.clickEvent = this.clickAddButton
          }
          return item
        })
        if (Array.isArray(this.orderCols) && this.orderCols.length > 0) {
          res.unshift({
            button_type: 'order',
            icon: 'cuIcon-order',
            label: '排序',
            button_name: '排序',
            clickEvent: this.showOrder
          })
        }
        return res
      },
      srvCols() {
        return this.colV2?._fieldInfo || []
      },
      floatQueryCols() {
        // if(this.topQueryMode!==true){
        //   return []
        // }
        let cols = this.moreConfig?.floatQueryCols
        let arr = []
        let ignoreArr = ['Image', 'FileList']
        // let ignoreArr = ['Image', 'String', 'MultilineText', 'Float', 'Integer']
        if (Array.isArray(cols) && cols.length > 0) {
          arr = this.srvCols.filter(item => (item.in_cond === 1 || item.in_cond_def === 1) && cols.includes(item
            .columns))
        } else {
          let defVal = {}
          if (Array.isArray(this.condition) && this.condition.length > 0) {
            defVal = this.condition.reduce((res, cur) => {
              res[cur.colName] = cur.value;
              return res
            }, {})
          }
          let showCols = []
          if (Array.isArray(this.list_config?.cols) && this.list_config?.cols.length > 0) {
            showCols = this.list_config?.cols.map(item => item.col)
          } else {
            showCols = this.srvCols.map(item => item.columns)
          }
          arr = this.srvCols.filter(item => (item.in_cond === 1 || item.in_cond_def === 1) && showCols.includes(item
            .column) && !ignoreArr.includes(item
            .col_type)).map(
            item => {
              if (defVal[item.column]) {
                item.defaultValue = defVal[item.column]
                item.disabled = true
                item.value = defVal[item.column]
              }
              return item
            })

        }
        if (Array.isArray(this.initCond) && this.initCond.length > 0) {
          arr = arr.map(field => {
            this.initCond.forEach(cond => {
              if (field.column === cond.colName) {
                field.value = cond.value
                field.defaultValue = cond.value
              }
            })
            return field
          })
        }
        return arr

      },
      filterCols() {
        let cols = this.moreConfig?.filterCols
        let arr = []
        let ignoreArr = ['Image', 'String', 'MultilineText', 'Float', 'Integer']
        if (Array.isArray(cols) && cols.length > 0) {
          arr = this.srvCols.filter(item => (item.in_cond === 1 || item.in_cond_def === 1) && cols.includes(item
            .columns))
        } else {
          let defVal = {}

          if (Array.isArray(this.condition) && this.condition.length > 0) {
            defVal = this.condition.reduce((res, cur) => {
              res[cur.colName] = cur.value;
              return res
            }, {})
          }
          let showCols = []
          if (Array.isArray(this.list_config?.cols) && this.list_config?.cols.length > 0) {
            showCols = this.list_config?.cols.map(item => item.col)
          } else {
            showCols = this.srvCols.map(item => item.columns)
          }
          arr = this.srvCols.filter(item => (item.in_cond === 1 || item.in_cond_def === 1) && showCols.includes(item
            .column) && !ignoreArr.includes(item
            .col_type)).map(
            item => {
              if (defVal[item.column]) {
                item.defaultValue = defVal[item.column]
                item.disabled = true
                item.value = defVal[item.column]
              }
              return item
            })

        }
        if (Array.isArray(this.initCond) && this.initCond.length > 0) {
          arr = arr.map(field => {
            this.initCond.forEach(cond => {
              if (field.column === cond.colName) {
                field.value = cond.value
                field.defaultValue = cond.value
              }
            })
            return field
          })
        }
        return arr
      },
      orderList() {
        let cols = this.orderCols.filter(item => item.selected)
        if (cols.length === 0) {
          return this.order
        }
        let arr = cols.map(col => {
          return {
            colName: col.columns,
            orderType: col.orderType || 'asc'
          }
        })
        return arr
      },
      finalSearchColumn() {
        if (this.moreConfig?.searchColumn) {
          return this.moreConfig.searchColumn
        } else {
          if (Array.isArray(this.srvCols) && this.srvCols.length > 0) {
            return this.srvCols.reduce((res, cur) => {
              if (!['id', 'create_time', 'create_user', 'create_user_disp', 'del_flag',
                  'modify_time',
                  'modify_user', 'modify_user_disp'
                ].includes(cur.columns)) {
                res.push(cur.columns)
              }
              return res
            }, [])
          }
          if (typeof this.finalViewTemp === 'object') {
            return Object.keys(this.finalViewTemp).reduce((res, cur) => {
              if (this.finalViewTemp[cur]) {
                res.push(this.finalViewTemp[cur])
              }
              return res
            }, [])
          }
        }
      },
      countConfig() {
        return this.moreConfig?.count_config || {}
      },
      sumPrice() {
        if (Array.isArray(this.list)) {
          let sum = this.list.reduce((res, cur) => {
            if (cur.checked === true) {
              res += cur.unit_price * cur.goods_amount * 1000
            }
            return res
          }, 0)
          return sum / 1000
        }
      },
    },
    data() {
      return {
        topQueryMode: false, //顶部悬浮筛选模式
        disabledEvaluate: false,
        tabsCfg: null,
        topHeight: 0,
        modalName: "",
        codeSize: uni.upx2px(750),
        qrcodePath: "",
        qrCodeText: "",
        cartMode: 'default',
        navigationBarTitle: "",
        hideChildList: false,
        showMockCount: false,
        serviceName: "",
        list: [],
        pageNo: 1,
        rownumber: 20,
        total: 0,
        loadStatus: 'more',
        condition: null,
        appName: "",
        colV2: null,
        orderCols: [],
        proc_data_type: "", //流程状态
        searchVal: "",
        listType: "list", //list,proc,cart,selectorList，multiSelectByJson
        pageType: "", //list,proc,cart,
        detailType: "", //  normal,custom
        tabList: [],
        order: [],
        cartData: [],
        wxMchId: '',
        customDetailUrl: "",
        detailNavType: "", // 自定义跳转方式
        listConfig: {

        },
        initCond: [],
        relationCondition: [],
        disabled: false,
        gridButtonDisp: null,
        rowButtonDisp: null,
        formButtonDisp: null,
        countData: null,
        selectoDataId: '',
        selectCol: "",
        idCol: "",
        selectorUUID: "",
        curTabVal: "",
        curTab: 0,
        v2Params: "",
        pageTop: 0,
        filterVal: '',
        disabledCol: '', // selectorList时用来判断是否禁止选择的字段
        hideChildTable: false,
      }
    },
    methods: {
      async getFkTabs(srvInfo = {}) {
        const {
          serviceName,
          srv_app
        } = srvInfo
        if (serviceName && srv_app) {
          const url = `/${srv_app}/select/${serviceName}`
          const req = {
            "serviceName": serviceName,
            "colNames": ["*"],
            "condition": [],
            "page": {
              "rownumber": 20,
              "pageNo": 1
            }
          }
          if (Array.isArray(srvInfo?.conditions) && srvInfo?.conditions.length > 0) {
            req.condition = srvInfo?.conditions.map(item => {
              let data = {
                ...this.globalVariable
              }
              item.value = this.renderStr(item.value, data)
              return item
            })
          }
          const res = await this.$http.post(url, req);
          if (res?.data?.state === 'SUCCESS') {
            return res.data.data
          }
        }
      },
      setTopHeight() {
        const query = uni.createSelectorQuery().in(this);
        query.select('#top-bar').boundingClientRect(data => {
          console.log("得到布局位置信息:", data);
          console.log("节点离页面顶部的距离为" + data.top);
          this.topHeight = data.height || 0
        }).exec();
      },
      makeQrCode() {
        if (this.$refs.qrcodeCanvas) {
          this.$refs.qrcodeCanvas.make();
        }
      },
      qrcodeCanvasComplete(e) {
        this.qrcodePath = e;
        this.$emit('getQrcode', e);
      },
      hideModal() {
        this.modalName = ''
      },
      changeTabs(index) {
        this.curTab = index
        let cond = null
        let tab = this.tabsCfg.tabs[index]
        if (tab.value) {
          if (tab.value !== '_all') {
            cond = [{
              colName: this.tabsCfg?.col,
              ruleType: 'in',
              value: tab.value
            }]
          } else {
            cond = []
            if (Array.isArray(this.enumTabs) && this.enumTabs.length > 1) {
              let val = this.enumTabs.filter(item => item.value !== '_all').map(item => item.value).toString()
              cond = [{
                colName: this.tabsCfg?.col,
                ruleType: 'in',
                value: val
              }]
            }
          }
          this.curTabVal = tab.value
          this.pageNo = 1;
          this.getList(cond)
        }
      },
      confirmSelect() {
        if (this.selectoDataId) {

          const idCol = this.idCol || 'id'
          const emitData = {
            uuid: this.selectorUUID,
            val: this.selectoDataId,
            service: this.serviceName,
            col: this.selectCol,
            data: this.list.find(item => this.selectoDataId.indexOf(item[idCol]) !== -1)
          }
          if (this.listType == 'multiSelectByJson') {
            emitData.data = this.list.filter(item => this.selectoDataId.indexOf(item[idCol]) !== -1)
          }
          let viewTemp = this.colV2?.moreConfig?.list_config
          if (Array.isArray(viewTemp?.cols) && emitData.data) {
            let related_col = viewTemp?.cols.find(item => item.type === 'childData')?.related_col
            if (related_col && Array.isArray(this.colV2?._childData)) {
              emitData.data._childData = this.colV2?._childData.filter(item => item[related_col] === emitData.data[
                related_col])
            }
          }
          uni.$emit('confirmSelect', emitData)
        }
        uni.navigateBack({})
      },
      checkboxChange(e) {
        if (['multiSelectByJson', 'selectorList'].includes(this.listType)) {
          let idCol = this.idCol || 'id'
          if (this.listType === 'multiSelectByJson') {
            this.list = this.list.map(item => {
              if (e[idCol] && e[idCol] === item[idCol]) {
                item.checked = !item.checked
              }
              return item
            })
          } else {
            this.list = this.list.map(item => {
              if (e[idCol] && e[idCol] === item[idCol]) {
                item.checked = !item.checked
              } else {
                item.checked = false
              }
              return item
            })
          }
          let selectorList = this.list.filter(item => item.checked == true).map(item => item[idCol]).toString()
          this.selectoDataId = selectorList
        } else {
          if (e.cart_goods_rec_no) {
            this.list = this.list.map(item => {
              if (e.cart_goods_rec_no === item.cart_goods_rec_no) {
                item.checked = !item.checked
              }
              return item
            })
          }
          if (this.list.length > 0 && this.list.every(item => item.checked === true)) {
            this.$refs.cartBottom.selectAll = true
          } else {
            this.$refs.cartBottom.selectAll = false
          }
        }

      },
      selectAllChange(e) {
        if (e) {
          this.list = this.list.map(item => {
            item.checked = true
            return item
          })
        } else {
          this.list = this.list.map(item => {
            item.checked = false
            return item
          })
        }
      },
      async getGoodsSku(no) {
        if (no) {
          let col = 'cart_goods_rec_no'
          let serviceName = 'srvhealth_store_shopping_cart_goods_attr_value_select'
          const req = {
            "serviceName": serviceName,
            "colNames": ["*"],
            "condition": [{
              "colName": col,
              "ruleType": "in",
              "value": no
            }],
            "page": {
              "pageNo": 1
            }
          }
          let res = await this.$fetch('select', serviceName, req,
            'health');
          if (res.success) {
            return res.data
          }
        }


      },
      async toOrderPage() {
        let list = this.list.filter(item => item.checked === true && item.goods_amount);
        list = this.deepClone(list)
        if (list.length > 0) {
          let attrList = list.filter(item => item.attr && item.cart_goods_rec_no).map(item => item.cart_goods_rec_no)
            .toString()
          if (attrList) {

            let skuList = await this.getGoodsSku(attrList)
            // let service = 'srvhealth_store_shopping_cart_goods_detail_add';
            let childService = "srvhealth_store_order_goods_attr_value_add"
            let depend_key = 'order_goods_rec_no'
            list = list.map(item => {
              let data = skuList.filter(e => e.cart_goods_rec_no && e.cart_goods_rec_no === item
                .cart_goods_rec_no).map(e => {
                let obj = {
                  good_attr_name: e.good_attr_name,
                  good_attr_no: e.good_attr_no,
                  good_attr_value: e.good_attr_value,
                  good_attr_value_no: e.good_attr_value_no
                }
                return obj
              })
              if (data) {
                // item.goods_source = '店铺SKU'
                item.child_data_list = [{
                  "serviceName": childService,
                  "condition": [],
                  "depend_keys": [{
                    "type": "column",
                    "add_col": depend_key,
                    "depend_key": depend_key
                  }],
                  "data": data
                }]
              }
              return item
            })
          }

          list = list.map(goodsInfo => {
            goodsInfo.car_num = goodsInfo.goods_amount
            goodsInfo.price = goodsInfo.unit_price

            return goodsInfo
          })



          this.$store.commit('SET_STORE_CART', {
            storeInfo: this.storeInfo,
            store_no: this.storeInfo?.store_no,
            list: list
          });
          let url = `/storePages/placeOrder/placeOrder?store_no=${this.storeInfo?.store_no }`
          let orderType = this.getOrderType(list)
          url += `&order_type=${orderType}&show_params_config=${this.getOrderShowParams(orderType)}`
          if (this.wxMchId) {
            url += `&wxMchId=${this.wxMchId}`
          }
          if (this.hideChildTable) {
            url += `&hideChildTable=true`
          }

          uni.navigateTo({
            url
          });
        }
      },
      del(data, tip) {
        let list = this.list.filter(item => item.checked);
        if (data) {
          list = [data]
        }
        if (Array.isArray(list) && list.length > 0) {
          uni.showModal({
            title: '提示',
            content: tip || '确认从购物车中删除已选项?',
            success: (res) => {
              if (res.confirm) {
                let service = 'srvhealth_store_shopping_cart_goods_detail_delete'
                let url = this.getServiceUrl('health', service, 'operate');
                let req = [{
                  "serviceName": service,
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": list.map(item => item.id).toString()
                  }]
                }]
                this.$http.post(url, req).then(res => {
                  uni.$emit('goods-cart-change')
                  if (res.data.state === 'SUCCESS') {
                    this.refresh()

                    uni.showToast({
                      title: '删除成功!',
                      icon: 'none'
                    })
                  }
                })
              }
            }
          })
        }
      },
      async getCountData(count_config) {
        count_config = this.deepClone(count_config)
        let self = this
        if (count_config && Array.isArray(count_config.condition) && count_config.condition.length > 0) {
          let data = {
            ...this.globalVariable,
            storeInfo: self.storeInfo,
            userInfo: self.userInfo,
            storeUser: self.vstoreUser,
            bindUserInfo: self.vstoreUser
          }
          count_config.condition = count_config.condition.map(item => {
            if (item.value && item.value.indexOf('${') !== -1) {
              item.value = this.renderStr(item.value, data)
            }
            return item
          })
        }
        if (count_config && count_config.serviceName && count_config.appName) {
          let serviceName = count_config?.serviceName;
          let appName = count_config?.appName;
          if (serviceName && appName) {
            let req = {
              "serviceName": serviceName,
              "colNames": ["*"],
              "condition": count_config.condition || [],
              "page": {
                "pageNo": 1,
                "rownumber": 1
              }
            }
            let url = this.getServiceUrl(appName, serviceName, 'select');
            let res = await this.$http.post(url, req);
            if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
              let data = {

              }
              if (res.data.data.length > 0) {
                data = res.data.data[0]
              } else {
                data = count_config.labelMap.map(item => {
                  item.value = '0';
                  return item
                })
              }

              if (Array.isArray(count_config.labelMap)) {
                let result = count_config.labelMap.map(item => {
                  item.value = data[item.col];
                  return item
                })
                this.countData = result
              }
            }
          }
        }
      },
      getListWithFilter(e) {
        let self = this
        let tabsConds = this.$refs.filterTabs.buildConditions(true)
        this.relationCondition = tabsConds?.relation_condition
        this.filterVal = tabsConds?.value
        setTimeout(() => {
          this.pageNo = 1;
          this.getList(null, this.initCond)
        }, 100)

      },
      onFilterChange(e) {
        if (e) {
          let tabsConds = this.$refs.filterTabs.buildConditions(true)
          this.relationCondition = tabsConds?.relation_condition
          this.filterVal = tabsConds?.value
        }
      },
      clearCart() {
        this.cartData = []
      },
      changeAmount(data) {
        if (data && data.row && typeof data.index === 'number') {
          this.$set(this.cartData, data.index, data.row)
          if (data.row.goods_count === 0) {
            this.cartData.splice(data.index, 1)
          }
        }
      },
      del2Cart(e) {
        let data = this.deepClone(e)
        if (this.listType === 'cart') {
          let index = this.cartData.findIndex(item => item.id === data.id)
          if (index !== -1) {
            data.goods_count = this.cartData[index].goods_count - 1
            if (data.goods_count === 0) {
              this.cartData.splice(index, 1)
            } else {
              this.$set(this.cartData, index, data)
            }
          } else {
            // data.goods_count = 1
            // this.cartData.push(data)
          }
        } else if (this.listType === 'cartList') {
          if (data.goods_amount > 1) {
            this.list = this.list.map(item => {
              if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
                item.goods_amount -= 1
                this.updateCart(item).then(res => {
                  if (res.success) {
                    // this.getList()
                  }
                })
              }
              return item
            })
          } else {
            this.del(data, '是否从购物车中删除该商品？')
            // uni.showModal({
            //   title: '提示',
            //   content: '不能再减少了~是否从购物车中删除该商品？',
            //   confirmText: "删除",
            //   success: (res) => {
            //     if (res.confirm) {
            //       this.del(data)
            //     }
            //   }
            // })
            // uni.showToast({
            //   title: '不能再减少了~',
            //   icon: 'none'
            // })
          }
        }
      },

      async add2Cart(e) {
        let data = this.deepClone(e)
        if (this.listType === 'cart') {
          let index = this.cartData.findIndex(item => item.id === data.id)
          if (index !== -1) {
            data.goods_count = this.cartData[index].goods_count + 1
            this.$set(this.cartData, index, data)
          } else {
            data.goods_count = 1
            this.cartData.push(data)
          }
        } else if (this.listType === 'cartList') {
          let goodsInfo = this.list.find(item => item.cart_goods_rec_no === data.cart_goods_rec_no)
          if (goodsInfo) {
            // if (!goodsInfo.father_goods_no) {
            //   let res = await this.getGoodsStock(goodsInfo)
            //   if (!res?.id) {
            //     return
            //   } else if (res.amount < goodsInfo.goods_amount - 1) {
            //     uni.showToast({
            //       title: '商品库存不足',
            //       icon: 'none'
            //     })
            //     return
            //   }
            // }
            this.list = this.list.map(item => {
              if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
                item.goods_amount += 1
                if (item.checked == false) {
                  item.checked = true
                }
                this.updateCart(item).then(res => {
                  if (res.success) {
                    // this.getList()
                  }
                })
              }
              return item
            })

          }

          // this.list = this.list.map(item => {
          //   if (item.cart_goods_rec_no === data.cart_goods_rec_no) {
          //     item.goods_amount += 1
          //     if (item.checked == false) {
          //       item.checked = true
          //     }
          //   }
          //   return item
          // })
        }

      },
      toOrder(e) {
        this.order = e
        setTimeout(_ => {
          this.getList()
        }, 100)
      },
      toSearch(e) {
        let keywords = e || this.searchVal;
        this.searchVal = keywords
        uni.setStorageSync(this.serviceName + '_searchVal', this.searchVal)
        this.pageNo = 1
        this.getList()
      },
      changeSerchVal(e) {
        this.searchVal = e
      },
      toFilter(e) {
        this.searchVal = ''
        this.showFilter = false;
        if (Array.isArray(e)) {
          let cond = e
          this.getList(cond)
        }
      },
      handlerCustomizeButton(e) {
        // 自定义按钮
        let fieldsCond = []
        let operate_params = null;
        if (e?.operate_params) {
          try {
            operate_params = JSON.parse(e.operate_params)
          } catch (e) {
            //TODO handle the exception
          }

        }
        if (e.more_config) {
          let more_config = e.more_config;
          try {
            more_config = JSON.parse(more_config)
          } catch (e) {
            //TODO handle the exception
          }
          if (more_config?.navUrl) {
            let url = this.renderStr(more_config?.navUrl, this);
            if (this.hideChildTable) {
              url += `&hideChildTable=true`
            }
            uni.navigateTo({
              url
            })
            return
          }
        }
        if (e.servcie_type === 'add') {
          let params = {
            type: 'add',
            serviceName: e.service_name,
            eventOrigin: e
          };
          if (Array.isArray(operate_params?.data) && operate_params?.data.length > 0) {
            let datas = operate_params?.data;
            datas.forEach(data => {
              if (typeof data === 'object') {
                Object.keys(data).forEach(item => {
                  if (typeof data[item] === 'object' && data[item]
                    .value_type === 'constant') {
                    data[item] = data[item].value;
                  } else if (typeof data[item] === 'object' && data[item]
                    .value_type ===
                    "globalData") {
                    // 全局变量
                    const globalVariable = {
                      ...this.globalVariable
                    }
                    data[item] = this.renderStr(data[item].value_key,
                      globalVariable)
                  }
                  if (data[item] && item) {
                    fieldsCond.push({
                      column: item,
                      value: data[item]
                    })
                  }
                });
              }

            })
          }
          // let url = '/pages/public/formPage/formPage?params=' + JSON.stringify(
          //   params)
          let url =
            `/publicPages/formPage/formPage?type=add&serviceName=${e.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
          if (this.hideChildTable) {
            url += `&hideChildTable=true`
          }
          if (e?.operate_type && e.operate_type.indexOf('弹出') !== -1) {
            url += `&hideChildTable=true`
          }
          uni.navigateTo({
            url
          });
        } else if (e.servcie_type === 'select') {
          let params = {
            type: 'select',
            serviceName: e.service_name,
            defaultVal: data.row,
            eventOrigin: e
          };
          if (e.operate_params && Array.isArray(e.operate_params
              .condition)) {
            let viewTemp = {};
            if (e.service_name ===
              'srvhealth_store_vaccination_appoint_record_select') {
              viewTemp = {
                title: 'customer_name',
                img: 'person_image',
              }
            }
            let url = '/publicPages/list2/list2?pageType=list&serviceName=' +
              e.service_name +
              '&cond=' +
              JSON.stringify(e.operate_params.condition)
            // +
            // '&viewTemp=' +
            // JSON.stringify(viewTemp)
            if (this.hideChildTable) {
              url += `&hideChildTable=true`
            }
            uni.navigateTo({
              url
            });
          }
        } else if (e.servcie_type === 'update') {
          let fieldsCond = [];
          if (Array.isArray(this.condition)) {
            fieldsCond = this.condition.map(item => {
              return {
                column: item.colName,
                value: item.value,
                display: false
              };
            });
          }
          let condition = button?.operate_params?.condition
          let defaultVal = button?.operate_params?.data
          if (Array.isArray(defaultVal) && defaultVal.length > 0) {
            let obj = defaultVal[0]
            if (this.iObject(obj)) {
              Object.keys(obj).forEach(key => {
                fieldsCond.push({
                  column: key,
                  value: obj[key]
                })
              })
            }
          }
          if (Array.isArray(condition) && condition.length > 0) {
            condition.forEach(cond => {
              fieldsCond.push({
                column: cond.colName,
                value: cond.value
              })
            })
          }

          let url =
            `/publicPages/formPage/formPage?service=${e.service}&serviceName=${e.service_name}&type=${e.servcie_type}&fieldsCond=` +
            encodeURIComponent(JSON.stringify(fieldsCond));
          if (this.appName) {
            url += `&appName=${this.appName}`
          }
          if (this.hideChildTable) {
            url += `&hideChildTable=true`
          }
          uni.navigateTo({
            url: url
          });
        }
      },
      clickGridButton(e) {
        switch (e.button_type) {
          case 'select':
            this.showFilterModal()
            break;
          case 'add':
            this.clickAddButton(e)
            break;
          case 'order':
            this.showOrder()
            break;
          case 'customize':
            this.handlerCustomizeButton(e)
            break;
        }
      },
      clickAddButton(e) {
        if (e.button_type === 'add') {
          let fieldsCond = [];
          if (Array.isArray(this.condition)) {
            fieldsCond = this.condition.map(item => {
              return {
                column: item.colName,
                value: item.value,
                display: false
              };
            });
          }
          let url =
            `/publicPages/formPage/formPage?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

          url =
            `/publicPages/formPage/formPage?type=add&serviceName=${e.service_name.replace('_select', '_add')}&fieldsCond=${JSON.stringify(fieldsCond)}`;

          if (this.appName) {
            url += `&appName=${this.appName}`
          }
          if (this.main_data) {
            url += `&main_data=${JSON.stringify(this.main_data)}`
          }
          if (this.hideChildTable) {
            url += `&hideChildTable=true`
          }
          uni.navigateTo({
            url: url
          });
        }

      },
      refresh() {
        this.loadStatus = 'more'
        this.pageNo = 1;
        this.getList(null, this.initCond)
      },
      async getListV2() {
        let app = this.appName || uni.getStorageSync('activeApp');
        let self = this;
        let colVs = await this.getServiceV2(this.serviceName, 'list', this.listType === 'proc' ?
          'proclist' :
          'list', app, this.v2Params);
        if (colVs.srv_cols) {
          colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
        }
        if (!this.navigationBarTitle) {
          let title = ''
          if (this.listConfig?.navTitle) {
            title = this.listConfig?.navTitle
          } else {
            title = colVs.service_view_name
          }
          uni.setNavigationBarTitle({
            title
          });
        }
        console.log('colVs', colVs);
        if (colVs.more_config) {
          try {
            colVs.moreConfig = JSON.parse(colVs.more_config)
            if (colVs.moreConfig?.detailType) {
              if (!this.detailType) {
                this.detailType = colVs.moreConfig?.detailType
              }
            }
            if (colVs.moreConfig?.formButtonDisp && !this.formButtonDisp) {
              this.formButtonDisp = colVs.moreConfig?.formButtonDisp
            }
            if (colVs.moreConfig?.rowButtonDisp && !this.rowButtonDisp) {
              this.rowButtonDisp = colVs.moreConfig?.rowButtonDisp
            }
            if (colVs.moreConfig?.gridButtonDisp && !this.gridButtonDisp) {
              this.gridButtonDisp = colVs.moreConfig?.gridButtonDisp
            }
            if (colVs.moreConfig?.customDetailUrl) {
              if (!this.customDetailUrl) {
                this.customDetailUrl = colVs.moreConfig?.customDetailUrl
              }
            }
            // if (colVs.moreConfig?.count_config) {
            //   this.getCountData(colVs.moreConfig?.count_config)
            // }
          } catch (e) {
            //TODO handle the exception
            console.info(e)
          }
        }
        if (colVs?.moreConfig?.list_config?.rownumber) {
          this.rownumber = colVs?.moreConfig?.list_config?.rownumber
        }
        if (Array.isArray(colVs?.rowButton) && colVs?.rowButton.length > 0) {
          colVs.rowButton = colVs.rowButton.map(item => {
            try {
              item.moreConfig = {}
              if (item.more_config) {
                item.moreConfig = JSON.parse(item.more_config)
              }
            } catch (e) {
              console.log('error,', e)
              //TODO handle the exception
            }
            return item
          })
        }

        if (colVs?.moreConfig?.tabs_cfg) {
          let tabsCfg = colVs?.moreConfig?.tabs_cfg;
          if (tabsCfg?.column && !tabsCfg.col) {
            tabsCfg.col = tabsCfg?.column
          }

          tabsCfg.tabs = []
          tabsCfg.activeColor = tabsCfg?.active_color

          if (tabsCfg?.type === 'fk_col' && tabsCfg?.srvInfo && tabsCfg?.srvInfo.key_disp_col && tabsCfg
            ?.srvInfo
            .refed_col) {
            let tabs = await this.getFkTabs(tabsCfg?.srvInfo)
            if (Array.isArray(tabs) && tabs.length > 0) {
              tabs = tabs.map(item => {
                return {
                  name: item[tabsCfg?.srvInfo.key_disp_col],
                  value: item[tabsCfg?.srvInfo.refed_col]
                }
                return item
              })
            }
            tabsCfg.tabs = [...tabsCfg.tabs, ...tabs];
          } else if (tabsCfg?.type === 'enum_col' && tabsCfg?.column) {
            if (Array.isArray(colVs?._fieldInfo)) {
              let col = colVs?._fieldInfo.find(item => item.column === tabsCfg.column)
              let allTab = []
              if (col?.col_type === 'Enum' && col?.option_list_v2 && col?.option_list_v2?.length) {
                allTab = col.option_list_v2
              }
              if (Array.isArray(tabsCfg.customTabs) && tabsCfg.customTabs.length > 0) {
                allTab = tabsCfg.customTabs
              }
              if (Array.isArray(allTab) && allTab.length > 0) {
                allTab.forEach(item => {
                  tabsCfg.tabs.push({
                    name: item.label,
                    value: item.value
                  })
                })
              }
            }
          }

          if (tabsCfg?.default && Array.isArray(tabsCfg.tabs)) {
            const index = tabsCfg.tabs.findIndex(item => item.value === tabsCfg.default)
            if (index !== -1) {
              this.curTab = index;
              this.curTabVal = tabsCfg.tabs[index].value
            }
          }

          if (tabsCfg?.show_badge == true) {
            // 每个tab项右上方显示badge
            let tabs = await this.getTabsCount(tabsCfg.tabs, tabsCfg?.column)
            tabsCfg.tabs = tabs
          }

          if (tabsCfg?.show_total_tab !== false) {
            let totalTab = {
              value: '_all',
              name: '全部'
            }
            if (tabsCfg?.show_total_badge !== false) {
              totalTab.count = tabsCfg.tabs.reduce((res, cur) => res += cur.count || 0, 0)
            }
            tabsCfg.tabs.unshift(totalTab)
          }

          this.tabsCfg = tabsCfg
        }

        this.colV2 = colVs;
        if (Array.isArray(colVs.srv_cols)) {
          this.orderCols = colVs.srv_cols.filter(item => {
            if (item.in_list === 1) {
              item.orderType = 'asc'
              item.selected = false;
              return true
            }
          })
        }
        return colVs;
      },
      async getTabsCount(tabs, column) {
        if (Array.isArray(tabs) && tabs.length > 0 && column) {
          let req = tabs.map(item => {
            let obj = {
              "serviceName": this.serviceName,
              "colNames": ["*"],
              "condition": [
                ...this.condition, {
                  "colName": column,
                  "ruleType": "in",
                  "value": item.value
                }
              ],
              "page": {
                "rownumber": 1,
                "pageNo": 1
              }
            }
            return obj
          })

          const app = this.appName || uni.getStorageSync('activeApp')
          let res = await this.$fetch('multi', 'select', req, app);
          if (Array.isArray(res?.data) && res.data.length === tabs.length) {
            tabs = tabs.map((item, index) => {
              let page = res?.data[index]?.page
              item.count = page?.total || 0
              return item
            })
          }
        }
        return tabs
      },
      async getList(cond, initCond) {
        if (!cond) {
          if (!this.curTabVal && Array.isArray(this.enumTabs) && this.enumTabs.length > 0) {
            this.curTabVal = this.enumTabs[0].value
          }
          if (this.curTabVal && this.tabsCfg?.col && Array.isArray(this.tabsCfg.tabs)) {
            let index = this.tabsCfg.tabs.findIndex(item => item.value === this.curTabVal);
            if (index >= 0) {
              this.changeTabs(index)
              return
            }
          }
        }
        if (this.moreConfig?.count_config) {
          this.getCountData(this.moreConfig?.count_config)
        }

        if (Array.isArray(this.moreConfig?.relation_condition) && this.moreConfig.relation_condition.length > 0 &&
          this
          .tabs.length < 1) {
          let data = {
            userInfo: this.$store?.state?.user?.userInfo,
            storeInfo: this.$store?.state?.app?.storeInfo,
            bindUserInfo: this.$store?.state?.user?.storeUserInfo
          };
          try {
            this.relationCondition = JSON.parse(this.renderStr(JSON.stringify(this.moreConfig
              ?.relation_condition), data));
          } catch (err) {
            console.log(err);
          }
        }

        if ((Array.isArray(this.moreConfig?.group) && this.moreConfig.group.length > 0)) {
          req.group = this.moreConfig.group
        }

        let serviceName = this.serviceName;
        let app = this.appName || uni.getStorageSync('activeApp');
        let url = this.getServiceUrl(app, serviceName, 'select');
        let req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: this.condition || [],
          page: {
            rownumber: this.rownumber,
            pageNo: this.pageNo
          },
          order: this.orderList
        };
        if (this.listType === 'proc') {
          if (proc_data_type || this.proc_data_type) {
            req['proc_data_type'] = proc_data_type || this.proc_data_type;
          } else {
            req['proc_data_type'] = 'wait';
          }
        }
        if (Array.isArray(cond) && cond.length > 0) {
          req.condition = req.condition.concat(cond);
        }
        if (Array.isArray(initCond) && initCond.length > 0) {
          req.condition = [...req.condition, ...initCond]
        }

        let keywords = this.searchVal;
        // req.condition = []
        if (keywords && this.finalSearchColumn) {
          if (typeof this.finalSearchColumn === 'string') {
            req.condition = req.condition.concat([{
              colName: this.finalSearchColumn,
              ruleType: 'like',
              value: keywords
            }]);
          } else if (Array.isArray(this.finalSearchColumn)) {
            // 数组 使用relation_condition
            if (Array.isArray(req.condition) && req.condition.length > 0) {
              req.relation_condition = {
                relation: "AND",
                data: [{
                    relation: "OR",
                    data: this.finalSearchColumn.map(item => {
                      return {
                        "colName": item,
                        "value": keywords,
                        "ruleType": 'like'
                      }
                    })
                  },
                  {
                    relation: "AND",
                    data: this.deepClone(req.condition)
                  }
                ]
              }
            } else {
              req.relation_condition = {
                relation: "OR",
                data: this.finalSearchColumn.map(itme => {
                  return {
                    "colName": itme,
                    "value": keywords,
                    "ruleType": 'like'
                  }
                })
              }
            }
            // delete req.condition
          }
        }

        if (Array.isArray(this.relationCondition?.data) && this.relationCondition.data.length > 0) {
          if (req.relation_condition?.data.length > 0) {
            req.relation_condition = {
              "relation": "AND",
              data: [
                ...this.relationCondition.data,
                {
                  "relation": "OR",
                  data: req.relation_condition
                }
              ]
            }
          } else {
            req.relation_condition = this.relationCondition
          }
        }

        if (this.colV2?.vpage_no) {
          req['vpage_no'] = this.colV2.vpage_no
        }
        this.loadStatus = 'loading'
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          // if (this.pageNo === 1) {
          //   this.list = res.data.data;
          // }
          let list = this.deepClone(this.list)
          if (this.pageNo === 1) {
            list = res.data.data
          } else {
            list = list.concat(res.data.data);
            // if(list.find(item=>!!item.id)){
            //   let ids = list.map(item=>item.id)
            //   let arr = []
            //   list.forEach(item=>{
            //     if(ids.indexOf(item.id)>-1){
            //       arr.push(item)
            //       ids = ids.splice(ids.indexOf(item.id),1)
            //     }
            //   })
            //   list = arr
            // }
          }
          let viewTemp = this.colV2?.moreConfig?.list_config
          if (Array.isArray(viewTemp?.cols) && viewTemp.cols.length > 0 && Array.isArray(this.list)) {
            let col = viewTemp.cols.find(item => item.type === 'childData')
            if (col) {
              let childData = await this.getChildColData(col, list)
              if (childData) {
                this.colV2._childData = childData
              }
            }
          }
          this.pageNo = res?.data?.page?.pageNo;
          let page = res.data?.page;
          if (this.listType === 'proc' && page) {
            for (let i = 0; i < this.tabList.length; i++) {
              let item = this.tabList[i];
              if (item.proc_data_type === req.proc_data_type) {
                item.data = this.list;
                item.total = res.data.page.total;
                item.page = res.data.page;
                this.$set(this.tabList, i, item);
              }
            }
            this.list = [];
            this.list = this.tabList[this.TabCur]['data'];
            let callBackData = {
              data: this.list,
              page: res.data.page,
              proc_data_type: req.proc_data_type
            };
            return callBackData;
          } else if (page) {
            this.total = page.total
            if (page.rownumber * page.pageNo >= page.total) {
              this.loadStatus = 'noMore'
            } else {
              this.loadStatus = 'more'
            }
          }
          if (["multiSelectByJson", "cartList", "selectorList"].includes(this.listType)) {
            let idCol = this.idCol || 'id'
            list = list.map(item => {
              if (!item.checked) {
                item.checked = false;
              }
              if (typeof this.selectoDataId === 'string' && this.selectoDataId && this.selectoDataId.indexOf(item[
                  idCol]) !== -1) {
                item.checked = true
              }
              if (this.selectoDataId && Number(this.selectoDataId) === Number(item[idCol])) {
                item.checked = true
              }
              return item
            })
            if (this.listType === 'cartList') {
              if (this.list.length > 0 && this.list.every(item => item.checked === true)) {
                this.$refs.cartBottom.selectAll = true
              } else {
                this.$refs.cartBottom.selectAll = false
              }
            }

          }

          this.list = list
          this.$nextTick().then(() => {
            this.setTopHeight()
          })
          return this.list;
        }
      },

      async getChildColData(col, list) {
        // 查找模板的cols中类型为childData的数据
        if (col?.type === 'childData') {
          if (col?.related_col) {
            if (col?.srvInfo?.srv_app && col?.srvInfo?.serviceName && Array.isArray(list)) {
              let req = {
                "serviceName": col?.srvInfo?.serviceName,
                "colNames": ["*"],
                "condition": [{
                  "colName": col?.related_col,
                  "ruleType": "in",
                  "value": list.map(item => item[col?.related_col]).toString()
                }]
              }
              let url = this.getServiceUrl(col?.srvInfo?.srv_app, col?.srvInfo?.serviceName, 'select');
              let res = await this.$http.post(url, req)
              if (res.data.state === 'SUCCESS') {
                return res.data.data
              }
            }
          }
        }
      },


      async onRequestPayment(rowData, moreConfig = {}) {
        // 调起微信支付
        if (moreConfig.money_col && moreConfig.order_no_col && rowData && rowData[
            moreConfig.order_no_col]) {
          const wxMchId = this.storeInfo?.wx_mch_id || this.getwxMchId()
          const totalMoney = rowData[moreConfig.money_col] || 0
          const orderData = {
            order_no: rowData[moreConfig.order_no_col]
          }
          let prepay_id = ''
          if (moreConfig.prepay_id_col && rowData[moreConfig.prepay_id_col]) {
            prepay_id = rowData[moreConfig.prepay_id_col]
          }
          if (!prepay_id) {
            const result = await this.toPlaceOrder(totalMoney * 100, '', orderData,
              wxMchId);
            prepay_id = result.prepay_id
          }
          if (prepay_id) {
            let res = await this.getPayParams(prepay_id, wxMchId);
            const resData = await new Promise((resolve) => {
              wx.requestPayment({
                timeStamp: res.timeStamp.toString(),
                nonceStr: res.nonceStr,
                package: res.package,
                signType: 'MD5',
                paySign: res.paySign,
                success(res) {
                  // 支付成功
                  resolve(true)
                },
                fail(res) {
                  // 支付失败/取消支付
                  resolve('支付失败/取消支付')
                }
              });
            })
          }
        }
        let afterSubmit = moreConfig?.after_submit;
        if (Array.isArray(afterSubmit) && afterSubmit.length > 0) {
          this.handleAfterSubmit(afterSubmit, rowData)
        }
      },
      setPageScrollTop(e) {
        let self = this;
        // (debounce(() => {
        if (e?.scrollTop > 500) {
          self._pageScrollTop = e?.scrollTop
        } else {
          self._pageScrollTop = 0
        }
        // }, 1000))()
      },
      // async handleAfterSubmit(rowData) {
      //   const globalData = {
      //     data: rowData || {},
      //     storeInfo: self.storeInfo,
      //     userInfo: self.userInfo,
      //     storeUser: self.vstoreUser
      //   }
      //   const actionResult = new Array(afterSubmit.length)
      //   for (let i = 0; i < afterSubmit.length; i++) {
      //     let item = afterSubmit[i];
      //     if ((i > 0 && actionResult[i - 1]) || i == 0) {
      //       if (item.type === 'update_call_back') {
      //         if (item.service && item.app && Array.isArray(item.data) &&
      //           item.cond) {
      //           let url = this.getServiceUrl(item.app, item.service,
      //             'operate');
      //           let req = [{
      //             serviceName: item.service,
      //             condition: [],
      //             data: item.data
      //           }]
      //           if (Array.isArray(item.cond)) {
      //             req[0].condition = item.cond.map(c => {
      //               c.value = self.renderStr(c.value,
      //                 globalData)
      //               return c
      //             })
      //           }
      //           const res = await self.$http.post(url, req);
      //           if (res.data.state == 'SUCCESS') {
      //             actionResult[i] = true
      //           } else {
      //             actionResult[i] = res.data.resultMessage
      //           }
      //         }
      //       } else if (item.type === 'toDetail') {
      //         this.srvType = 'detail'
      //         let serviceName = this.addV2?.select_service_name || this
      //           .getServiceName(this.serviceName)
      //         let fieldsCond = [{
      //           column: 'id',
      //           value: rowData.id,
      //           display: false
      //         }]
      //         let url =
      //           `/publicPages/formPage/formPage?type=detail&serviceName=${serviceName}&fieldsCond=${encodeURIComponent(JSON.stringify(this.fieldsCond))}`
      //         if (this.appName) {
      //           url += `&appName=${this.appName}`
      //         }
      //         if (item.custom_url) {
      //           url = this.renderStr(item.custom_url, globalData);
      //         }
      //         if (item.view_cfg) {
      //           url += `&view_cfg=${JSON.stringify(item.view_cfg)}`
      //         }
      //         uni.redirectTo({
      //           url
      //         })
      //       }
      //     }

      //   }
      //   if (actionResult.length === afterSubmit.length && !actionResult.every(
      //       item =>
      //       item == true)) {
      //     self.srvType === 'detail'
      //     self.srvType === 'use_type'
      //     self.formButtons = []
      //   } else {
      //     actionResult.forEach(item => {
      //       if (item && typeof item === 'string') {
      //         uni.showModal({
      //           title: "提示",
      //           content: item,
      //           showCancel: false
      //         })
      //       }
      //     })
      //   }
      //   return
      // },
      async clickFootBtn(data) {
        if (data?.button?.pre_confirm_msg) {
          let confirm = await new Promise(resolve => {
            uni.showModal({
              title: '提示',
              content: data?.button?.pre_confirm_msg,
              success: (res) => {
                if (res.confirm) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            })
          })
          if (confirm === false) {
            return
          }
        }

        if (['multiSelectByJson', 'selectorList'].includes(this.listType) && !data?.button?.icon) {
          if (data.row && (data.row[this.disabledCol] === true || data.row[this.disabledCol] === 1)) {
            return false
          }
          this.checkboxChange(data.row)
          return
        }
        let self = this
        let buttonInfo = this.deepClone(data.button);
        let rowData = this.deepClone(data.row);
        if (buttonInfo?._buttons) {
          delete buttonInfo._buttons
        }
        let moreConfig = buttonInfo.more_config;
        if (moreConfig && typeof moreConfig === 'string') {
          try {
            buttonInfo.moreConfig = JSON.parse(moreConfig);
            moreConfig = buttonInfo.moreConfig
          } catch (e) {
            //TODO handle the exception
            console.log(e);
          }
        }

        if (!buttonInfo?.button_type) {
          uni.showModal({
            title: '提示',
            content: '按钮操作参数配置有误',
            showCancel: false
          })
          return
        }
        if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
          // 序列化操作参数
          try {
            buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
            if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
              .length > 0) {
              buttonInfo.operate_params.condition.forEach(cond => {
                if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
                  cond.value = rowData[cond.value.value_key];
                } else if (typeof cond.value === 'object' && cond.value.value_type ===
                  'constant') {
                  cond.value = cond.value.value;
                } else if (typeof cond.value === 'object' && cond.value.value_type ===
                  'globalVariable') {
                  // 全局变量
                  const globalVariable = {
                    storeUser: this.vstoreUser,
                    loginUser: this.vloginUser,
                    userInfo: this.userInfo,
                    storeInfo: this.storeInfo
                  }
                  cond.value = this.renderStr(cond.value.value_key, globalVariable)
                }
              });
            }
            if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length >
              0) {
              buttonInfo.operate_params.data.forEach(data => {
                if (typeof data === 'object') {
                  Object.keys(data).forEach(item => {
                    if (typeof data[item] === 'object' && data[item].value_type ===
                      'rowData') {
                      data[item] = rowData[data[item].value_key];
                    } else if (typeof data[item] === 'object' && data[item]
                      .value_type === 'constant') {
                      data[item] = data[item].value;
                    } else if (typeof data[item] === 'object' && data[item]
                      .value_type ===
                      'globalVariable') {
                      // 全局变量
                      const globalVariable = {
                        storeUser: this.vstoreUser,
                        loginUser: this.vloginUser,
                        userInfo: this.userInfo,
                        storeInfo: this.storeInfo
                      }
                      data[item] = this.renderStr(data[item].value_key,
                        globalVariable)
                    }
                  });
                }
              });
            }
          } catch (e) {
            //TODO handle the exception
          }
        }
        if (buttonInfo.button_type === "customize") {
          if (buttonInfo.operate_type === '删除') {
            this.onButtonToUrl(data, this.appName).then(res => {
              if (res.state === 'SUCCESS') {
                this.refresh()
              }
            })
          } else if (['操作', '增加', '修改'].includes(buttonInfo.operate_type) && buttonInfo.operate_mode === '静默操作') {

            if (moreConfig?.type === 'wx_pay') {
              this.onRequestPayment(rowData, moreConfig)
              return
            }

            let req = [{
              serviceName: buttonInfo.operate_service,
              condition: buttonInfo.operate_params.condition,
              data: buttonInfo.operate_params.data
            }];

            if (!buttonInfo.operate_params.data && buttonInfo.servcie_type === 'update') {
              uni.showModal({
                title: '提示',
                content: '按钮操作参数配置有误',
                showCancel: false
              })
              return
            }
            let app = this.appName || uni.getStorageSync('activeApp');
            let url = this.getServiceUrl(buttonInfo.application || app, buttonInfo.operate_service,
              buttonInfo.servcie_type);
            uni.showModal({
              title: '提示',
              content: '是否确认操作?',
              success: (res) => {
                if (res.confirm) {
                  this.$http.post(url, req).then(res => {
                    if (res.data.state === 'SUCCESS') {
                      this.refresh()
                    }
                  })
                }
              }
            })
            return
          } else if (buttonInfo.operate_type === "URL跳转") {
            let storeInfo = this.$store?.state?.app?.storeInfo
            let bindUserInfo = this.$store?.state?.user?.storeUserInfo
            let globalData = {
              userInfo: this.userInfo,
              data: rowData,
              rowData,
              storeInfo,
              bindUserInfo,
              storeUser: bindUserInfo
            };

            if (buttonInfo?.moreConfig?.navType === 'takePhone' && buttonInfo?.moreConfig?.phoneCol) {
              let phone = rowData[buttonInfo?.moreConfig?.phoneCol]
              uni.makePhoneCall({
                phoneNumber: phone
              })
              return
            }

            if (buttonInfo?.moreConfig?.navUrl) {
              // 跳转到自定义页面
              if (buttonInfo?.moreConfig?.click_validate) {
                let click_validate = buttonInfo?.moreConfig?.click_validate
                if (Array.isArray(click_validate) && click_validate.length > 0) {
                  let num = 0;
                  for (let i = 0; i < click_validate.length; i++) {
                    const item = click_validate[i]
                    if (['data-empty', 'no-repeat'].includes(item.type)) {
                      // 校验重复数据及空数据
                      // data-empty:没有数据时不通过；no-repeat：有数据时不通过
                      if (num > 0) {
                        return
                      }
                      const service = item.service
                      let condition = []
                      if (Array.isArray(item.condition)) {
                        condition = item.condition.map(cond => {
                          let obj = {
                            colName: cond.colName,
                            ruleType: cond.ruleType,
                            value: ''
                          }
                          if (cond?.value?.value_type === 'variable' && cond?.value?.value) {
                            obj.value = this.renderStr(cond?.value?.value, globalData)
                          } else if (cond?.value?.value_type === 'rowData') {
                            obj.value = data[cond?.value?.value_key]
                          } else if (cond?.value?.value_type === 'constant') {
                            obj.value = cond?.value?.value
                          }
                          return obj
                        })
                      }
                      let url = this.getServiceUrl(item?.app || this.appName || uni
                        .getStorageSync('activeApp'), service, 'select');
                      let req = {
                        "serviceName": service,
                        "condition": condition,
                        colNames: ['*'],
                        page: {
                          pageNo: 1,
                          rownumber: 1
                        }
                      }
                      let res = await this.$http.post(url, req)
                      if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data)) {
                        let noPass = false
                        if (item.type === 'no-repeat') {
                          if (res.data.data.length > 0) {
                            num++
                            noPass = true
                          }
                        } else {
                          if (res.data.data.length <= 0) {
                            num++
                            noPass = true
                          }
                        }
                        if (noPass && item.fail_tip) {
                          uni.showModal({
                            title: '提示',
                            content: item.fail_tip,
                            showCancel: false
                          })
                        }
                      }
                    } else if (item.type === 'followOfficial') {
                      // 检查是否关注公众号
                      let res = await this.checkSubscribeStatus()
                      if (!res) {
                        num++
                        let confirm = await new Promise((resolve) => {
                          uni.showModal({
                            title: '提示',
                            content: '请先关注百想助理公众号，以便及时收到新消息通知',
                            confirmText: '去关注',
                            success: (res) => {
                              if (res.confirm) {
                                resolve(true)
                              } else {
                                resolve(false)
                              }
                            }
                          })
                        })
                        if (confirm === true) {
                          if (this.$api?.env === 'prod') {
                            this.toOfficial()
                            return
                          }
                        } else {
                          return
                        }
                      }
                    }

                  }
                  if (num > 0) {
                    return
                  }
                }
              }


              let url = this.renderStr(buttonInfo.moreConfig.navUrl, globalData)

              let title = buttonInfo?.service_view_name || buttonInfo?.button_name
              if (this.hideChildTable) {
                url += `&hideChildTable=true`
              }
              this.navigateTo({
                url,
                title
              })
            } else if (buttonInfo?.pre_data_handle === 'requestPayment' || buttonInfo?.path_col ===
              'requestPayment') {
              // 调起支付接口
              let total_col = 'order_amount'
              let order_no_col = 'order_no'
              if (buttonInfo?.moreConfig?.total_col) {
                total_col = buttonInfo?.moreConfig?.total_col
              }
              if (buttonInfo?.moreConfig?.order_no_col) {
                order_no_col = buttonInfo?.moreConfig?.order_no_col
              }
              let total = rowData[total_col]
              let orderNo = rowData[order_no_col]
              rowData.order_no = rowData.order_no || orderNo
              if (total && orderNo) {
                let wx_mch_id = this.getwxMchId()
                let result = {}
                if (rowData?.prepay_id) {
                  result = {
                    prepay_id: rowData?.prepay_id
                  }
                } else {
                  result = await this.toPlaceOrder(total * 100, this.vloginUser?.login_user_type, rowData, wx_mch_id);
                }
                if (result && result.prepay_id) {
                  let res = await this.getPayParams(result.prepay_id, wx_mch_id);
                  wx.requestPayment({
                    timeStamp: res.timeStamp.toString(),
                    nonceStr: res.nonceStr,
                    package: res.package,
                    signType: 'MD5',
                    paySign: res.paySign,
                    success(res) {
                      // 支付成功
                      self.updateOrderState('待发货', '已支付', result.prepay_id, rowData
                        .order_no);
                    },
                    fail(res) {
                      // 支付失败/取消支付
                      self.updateOrderState('待支付', '取消支付', result.prepay_id, rowData
                        .order_no);
                    }
                  });
                }
              }
            } else if (buttonInfo?.moreConfig?.type === 'showQrcode') {
              // 展示二维码弹框
              if (buttonInfo?.moreConfig?.qrcode_content) {
                let data = {
                  storeInfo: this.storeInfo,
                  userInfo: this.userInfo,
                  storeUser: this.vstoreUser,
                  data: rowData
                }
                this.qrCodeText = this.renderStr(buttonInfo?.moreConfig?.qrcode_content, data)
                this.modalName = 'showQrCode'
                this.makeQrCode()
              }
            }
          } else if (buttonInfo.operate_type === '更新弹出' || buttonInfo.operate_type === '更新跳转') {
            // 自定义按钮
            let moreConfig = buttonInfo.more_config;
            if (moreConfig && typeof moreConfig === 'string') {
              try {
                moreConfig = JSON.parse(moreConfig);
              } catch (e) {
                //TODO handle the exception
                console.log(e);
              }
            }
            if (buttonInfo.servcie_type === 'add') {
              let params = {
                type: 'add',
                serviceName: buttonInfo.service_name,
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              let url = '/pages/public/formPage/formPage?params=' + JSON.stringify(
                params)
              // uni.navigateTo({
              //   url
              // });
              if (this.hideChildTable) {
                url += `&hideChildTable=true`
              }
              let title = buttonInfo?.service_view_name || buttonInfo?.button_name
              this.navigateTo({
                url,
                title
              })

              return
            } else if (buttonInfo.servcie_type === 'select') {
              let params = {
                type: 'select',
                serviceName: buttonInfo.service_name,
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
                  .condition)) {
                let viewTemp = {};
                if (buttonInfo.service_name ===
                  'srvhealth_store_vaccination_appoint_record_select') {
                  viewTemp = {
                    title: 'customer_name',
                    img: 'person_image',
                  }
                }


                let url = '/publicPages/list/list?pageType=list&serviceName=' +
                  buttonInfo.service_name +
                  '&cond=' +
                  JSON.stringify(buttonInfo.operate_params.condition) +
                  '&viewTemp=' +
                  JSON.stringify(viewTemp)

                if (this.hideChildTable) {
                  url += `&hideChildTable=true`
                }

                uni.navigateTo({
                  url
                });
                return
              }
            } else if (buttonInfo.servcie_type === 'update' || buttonInfo.servcie_type === 'operate') {
              let params = {
                type: 'update',
                serviceName: buttonInfo.service_name,
                defaultVal: rowData,
                eventOrigin: buttonInfo
              };
              let fieldsCond = [];
              let condition = buttonInfo?.operate_params?.condition
              let defaultVal = buttonInfo?.operate_params?.data
              if (Array.isArray(defaultVal) && defaultVal.length > 0) {
                let obj = defaultVal[0]
                if (this.iObject(obj)) {
                  Object.keys(obj).forEach(key => {
                    fieldsCond.push({
                      column: key,
                      value: obj[key]
                    })
                  })
                }
              }

              if (fieldsCond.length === 0) {
                fieldsCond = [{
                  column: 'id',
                  value: rowData.id
                }]
              }

              let url =
                `/publicPages/formPage/formPage?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=update&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              if (Array.isArray(condition) && condition.length > 0) {
                url += `&condition=${JSON.stringify(condition)}`
              }
              if (this.hideChildTable) {
                url += `&hideChildTable=true`
              }
              uni.navigateTo({
                url: url
              });
              return
            }
            return
          } else if (buttonInfo.operate_type === '列表跳转') {
            // let serviceName = buttonInfo.service_name;
            // let 
            let app = buttonInfo.application
            let url = '/publicPages/list2/list2?pageType=list&serviceName=' +
              buttonInfo.service_name +
              '&cond=' +
              JSON.stringify(buttonInfo.operate_params.condition)

            if (app) {
              url += `&destApp=${app}`
            }
            if (this.disabled === true) {
              url += '&disabled=true'
            }

            let title = buttonInfo?.service_view_name || buttonInfo?.button_name
            if (this.hideChildTable) {
              url += `&hideChildTable=true`
            }
            this.navigateTo({
              url,
              title
            })
            return
          } else if (buttonInfo.operate_type === '详情跳转') {
            let fieldsCond = [];
            if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
              .length >
              0) {
              buttonInfo.operate_params.condition.forEach(item => {
                let obj = {
                  column: item.colName,
                  value: item.value,
                  disabled: true
                }
                fieldsCond.push(obj)
              })
            }
            let url =
              `/publicPages/formPage/formPage?type=detail&disabled=true&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=${buttonInfo.application}`;
            if (this.hideChildTable) {
              url += `&hideChildTable=true`
            }
            uni.navigateTo({
              url
            })
            return
          } else if (buttonInfo.operate_type === '增加跳转' || buttonInfo.operate_type === '增加弹出') {
            let fieldsCond = [];
            if (Array.isArray(buttonInfo.operate_params?.condition) && buttonInfo.operate_params.condition
              .length >
              0) {
              buttonInfo.operate_params.condition.forEach(item => {
                let obj = {
                  column: item.colName,
                  value: item.value,
                  disabled: true
                }
                fieldsCond.push(obj)
              })
            }
            if (Array.isArray(buttonInfo.operate_params?.data) && buttonInfo.operate_params.data.length >
              0) {
              buttonInfo.operate_params.data.forEach(item => {
                Object.keys(item).forEach(key => {
                  let obj = {
                    column: key,
                    value: item[key],
                    disabled: true
                  }
                  fieldsCond.push(obj)
                })

              })
            }
            let url =
              `/publicPages/formPage/formPage?type=add&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}&destApp=${buttonInfo.application}`;
            // uni.navigateTo({
            //   url
            // });
            if (this.hideChildTable) {
              url += `&hideChildTable=true`
            }
            let title = buttonInfo?.service_view_name || buttonInfo?.button_name
            this.navigateTo({
              url,
              title
            })
            return
          }

        } else if (this.listType === 'proc') {
          if (buttonInfo && buttonInfo.button_type === 'edit' && rowData.proc_instance_no) {


            uni.navigateTo({
              url: '/publicPages/procDetail/procDetail?proc_instance_no=' + rowData
                .proc_instance_no
            });
          }
        } else {
          if (buttonInfo.button_type === 'detail' && this.customDetailUrl) {
            let storeInfo = this.$store?.state?.app?.storeInfo
            let bindUserInfo = this.$store?.state?.user?.storeUserInfo
            let targetUrl = this.customDetailUrl
            let obj = {
              data: rowData,
              rowData,
              storeInfo,
              bindUserInfo,
              filterVal: this.filterVal
            };
            obj = this.deepClone(obj)
            targetUrl = this.renderStr(this.customDetailUrl, obj)
            if (targetUrl && targetUrl.indexOf('"value":""') !== -1) {
              let condition = buttonInfo?.operate_params?.condition
              let fieldsCond = [{
                column: 'id',
                value: rowData.id
              }]
              let url =
                `/publicPages/formPage/formPage?serviceName=${buttonInfo.service_name}&type=detail&fieldsCond=` +
                encodeURIComponent(JSON.stringify(fieldsCond));

              // if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
              //   'childTableList') {
              url =
                `/publicPages/detail/detail?serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // }
              if (this.hideChildList) {
                url =
                  `/publicPages/formPage/formPage?type=detail&serviceName=${buttonInfo.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              }
              if (Array.isArray(condition) && condition.length > 0) {
                url += `&condition=${JSON.stringify(condition)}`
              }
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              targetUrl = url
              if (targetUrl && targetUrl.indexOf(('/pages/home/home') == 0)) {
                targetUrl = targetUrl.replace('/pages/home/home', '/storePages/home/home')
              }
            }

            if (this.disabled === true) {
              targetUrl += '&disabled=true'
            }
            
            let navTypes = ['navigateTo', 'redirectTo', 'reLaunch']
            if (this.listConfig?.navType === 'webview' || targetUrl && targetUrl.indexOf('https') == 0) {
              targetUrl = `/publicPages/webviewPage/webviewPage?webUrl=${encodeURIComponent(targetUrl)}`
            }
            if (this.listConfig?.navType && navTypes.includes(this.listConfig?.navType)) {
              uni[this.listConfig?.navType]({
                url: targetUrl
              })
              return
            }
            if (this.detailNavType && navTypes.includes(this.detailNavType)) {
              uni[this.detailNavType]({
                url: targetUrl
              })
              return
            }

            if (this.hideChildTable) {
              targetUrl += `&hideChildTable=true`
            }

            uni.navigateTo({
              url: targetUrl
            })
            return
          }
          console.log(buttonInfo)
          this.onButtonToUrl(data, this.appName).then(res => {
            if(buttonInfo?.service_name=='srvsso_user_collect_record_delete'){
              // 用户收藏表，刷新收藏记录
              this.getFavorPages()
            }
            if (buttonInfo && buttonInfo.button_type === 'delete') {
              if (res.state === 'SUCCESS') {
                this.refresh()
              }
            }
            if (buttonInfo && buttonInfo.button_type === 'detail') {
              let {
                row,
                button
              } = res
              let fieldsCond = []
              if (row && row.id) {
                fieldsCond = [{
                  column: 'id',
                  value: row.id,
                  display: false
                }]
              } else {
                if (typeof row == 'object' && Object.keys(row).length > 0) {
                  Object.keys(row).forEach(key => {
                    if (key !== '_buttons' && row[key]) {
                      let obj = {
                        column: key,
                        value: row[key] || ''
                      }
                      fieldsCond.push(obj)
                    }
                  })
                }
              }
              let url =
                `/publicPages/formPage/formPage?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // if (this.list_config?.detailPage === 'childTableList' || this.moreConfig?.detailPage ===
              //   'childTableList') {
              url =
                `/publicPages/detail/detail?serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              // }
              if (this.hideChildList) {
                url =
                  `/publicPages/formPage/formPage?type=detail&serviceName=${button.service_name}&fieldsCond=${JSON.stringify(fieldsCond)}`
              }
              if (this.appName) {
                url += `&appName=${this.appName}`
              }
              if (this.disabled === true) {
                url += '&disabled=true'
              }
              if (this.hideChildTable) {
                url += `&hideChildTable=true`
              }
              uni.navigateTo({
                url: url
              })
            } else if (buttonInfo && buttonInfo.button_type === 'customize') {
              // 自定义按钮
              let moreConfig = buttonInfo.more_config;
              if (moreConfig && typeof moreConfig === 'string') {
                try {
                  moreConfig = JSON.parse(moreConfig);
                } catch (e) {
                  //TODO handle the exception
                  console.log(e);
                }
              }
              if (moreConfig?.type === 'wx_pay') {
                this.onRequestPayment(rowData, moreConfig)
                return
              }
              if (buttonInfo.servcie_type === 'add') {
                let params = {
                  type: 'add',
                  serviceName: buttonInfo.service_name,
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };

                let url = '/pages/public/formPage/formPage?params=' + JSON.stringify(
                  params)
                if (this.hideChildTable) {
                  url += `&hideChildTable=true`
                }
                uni.navigateTo({
                  url
                });
              } else if (buttonInfo.servcie_type === 'select') {
                let params = {
                  type: 'select',
                  serviceName: buttonInfo.service_name,
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };
                if (buttonInfo.operate_params && Array.isArray(buttonInfo.operate_params
                    .condition)) {
                  let viewTemp = {};
                  if (buttonInfo.service_name ===
                    'srvhealth_store_vaccination_appoint_record_select') {
                    viewTemp = {
                      title: 'customer_name',
                      img: 'person_image',
                    }
                  }

                  let url = '/publicPages/list/list?pageType=list&serviceName=' +
                    buttonInfo.service_name +
                    '&cond=' +
                    JSON.stringify(buttonInfo.operate_params.condition) +
                    '&viewTemp=' +
                    JSON.stringify(viewTemp)

                  uni.navigateTo({
                    url
                  });
                }
              } else if (buttonInfo.servcie_type === 'update') {
                let params = {
                  type: 'update',
                  serviceName: buttonInfo.service_name,
                  defaultVal: rowData,
                  eventOrigin: buttonInfo
                };
                let fieldsCond = [];
                if (Array.isArray(this.condition)) {
                  fieldsCond = this.condition.map(item => {
                    return {
                      column: item.colName,
                      value: item.value,
                      display: false
                    };
                  });
                }
                let condition = buttonInfo?.operate_params?.condition
                let defaultVal = buttonInfo?.operate_params?.data
                if (Array.isArray(defaultVal) && defaultVal.length > 0) {
                  let obj = defaultVal[0]
                  if (this.iObject(obj)) {
                    Object.keys(obj).forEach(key => {
                      fieldsCond.push({
                        column: key,
                        value: obj[key]
                      })
                    })
                  }
                }
                if (Array.isArray(condition) && condition.length > 0) {
                  condition.forEach(cond => {
                    fieldsCond.push({
                      column: cond.colName,
                      value: cond.value
                    })
                  })
                }
                let url =
                  `/publicPages/formPage/formPage?service=${buttonInfo.service}&serviceName=${buttonInfo.service_name}&type=${buttonInfo.servcie_type}&fieldsCond=` +
                  encodeURIComponent(JSON.stringify(fieldsCond));
                if (this.appName) {
                  url += `&appName=${this.appName}`
                }
                if (this.disabled === true) {
                  url += '&disabled=true'
                }
                uni.navigateTo({
                  url: url
                });
              }
            } else if (buttonInfo && (buttonInfo.button_type === 'duplicate' || buttonInfo
                .button_type === 'duplicatedeep')) {
              let fieldsCond = []
              if (Array.isArray(self.condition)) {
                self.condition.forEach(item => {
                  fieldsCond.push({
                    column: item.colName,
                    value: item.value,
                    display: false
                  })
                })
              }
              Object.keys(rowData).forEach(key => {
                if (!['id', 'modify_user_disp', 'modify_user', 'modify_time',
                    'create_user_disp', 'create_user', 'create_time', 'del_flag',
                    '_buttons'
                  ].includes(key) && rowData[key]) {
                  if (!fieldsCond.find(item => item.column === key)) {
                    fieldsCond.push({
                      column: key,
                      display: true,
                      value: rowData[key],
                    })
                  }
                }
              })

              let url =
                `/publicPages/formPage/formPage?serviceName=${buttonInfo.service_name}&type=add&fieldsCond=${JSON.stringify(fieldsCond)}`;
              if (self.appName) {
                url += `&appName=${self.appName}`
              }
              if (this.hideChildTable) {
                url += `&hideChildTable=true`
              }
              uni.navigateTo({
                url: url
              });
            } else if (buttonInfo.servcie_type === 'add') {
              let params = {
                type: 'add',
                serviceName: res.button.service_name,
                defaultVal: res.row,
                eventOrigin: res.button
              };


              uni.navigateTo({
                url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
                  params)
              });
            } else if (buttonInfo && buttonInfo.operate_type === '流程申请') {
              uni.navigateTo({
                url: '/pages/public/proc/apply/apply?serviceName=' + buttonInfo
                  .operate_service
              });
            }
          });
        }
      }
    },
    async onLoad(option) {
      if (option.topQueryMode) {
        this.topQueryMode = true
      }
      if (option.disabledEvaluate) {
        this.disabledEvaluate = true
      }
      if (option.hideChildTable) {
        this.hideChildTable = true
      }
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      if (option.v2Params) {
        try {
          this.v2Params = JSON.parse(option.v2Params)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (this.sysModel === 'PC') {
        this.rownumber = 100
      }
      if (option.curTab) {
        this.curTabVal = option.curTab
      }
      if (option.uuid) {
        this.selectorUUID = option.uuid
      }
      if (option.idCol) {
        this.idCol = option.idCol
      }
      if (option.rowButtonDisp) {
        try {
          this.rowButtonDisp = JSON.parse(option.rowButtonDisp)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.gridButtonDisp) {
        try {
          this.gridButtonDisp = JSON.parse(option.gridButtonDisp)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.formButtonDisp) {
        try {
          this.formButtonDisp = JSON.parse(option.formButtonDisp)
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.hideChildList) {
        this.hideChildList = true
      }
      if (option.disabled) {
        this.disabled = true
      }
      if (option.showMockCount) {
        this.showMockCount = option.showMockCount
      }
      let self = this
      uni.$on('dataChange', srv => {
        self.refresh()
      })
      if (option.grid_span) {
        this.listConfig.grid_span = option.grid_span
      }
      if (option.show_public_btn) {
        this.listConfig.show_public_btn = option.show_public_btn
      }
      if (option.listConfig) {
        try {
          this.listConfig = JSON.parse(decodeURIComponent(option.listConfig))
        } catch (e) {
          //TODO handle the exception
          console.log(e)
          try {
            this.listConfig = JSON.parse(option.listConfig)
          } catch (e) {
            console.log(e)
            //TODO handle the exception
          }
        }
      }
      if (option.customDetailUrl) {
        this.detailType = option.detailType || ''
        if (option.navType) {
          this.detailNavType = option.navType
        }
        let decodeUrl = option.customDetailUrl
        try {
          decodeUrl = decodeURIComponent(decodeUrl)
        } catch (e) {
          //TODO handle the exception
        }
        this.customDetailUrl = decodeUrl
      }
      if (option.listType) {
        this.listType = option.listType
        if (option.disabledCol) {
          this.disabledCol = option.disabledCol
        }
      }
      if (option.selectCol) {
        this.selectCol = option.selectCol
        if (option.selectedVal) {
          this.selectoDataId = option.selectedVal
        }
      }
      if (option.wxMchId) {
        this.wxMchId = option.wxMchId
      }
      if (option.pageType) {
        this.pageType = option.pageType
      }
      if (option.serviceName) {
        this.serviceName = option.serviceName
      }
      if (option.destApp) {
        this.appName = option.destApp
      }
      if (option.appName) {
        this.appName = option.appName
      }
      if (option.initCond) {
        try {
          let initCond = JSON.parse(option.initCond)
          if (Array.isArray(initCond)) {
            this.initCond = initCond.filter(item => {
              if (item.ruleType === 'eq') {
                return item.value
              } else {
                return true
              }
            })
          } else if (typeof initCond === 'object' && Object.keys(initCond).length > 0) {
            let arr = []
            Object.keys(initCond).forEach(key => {
              let obj = {
                colName: key,
                ruleType: 'eq',
                value: initCond[key]
              }
              arr.push(obj)
            })
            this.initCond = arr.filter(item => {
              if (item.ruleType === 'eq') {
                return item.value
              } else {
                return true
              }
            })
          }
        } catch (e) {
          //TODO handle the exception
        }
      }
      if (option.cond) {
        let cond = option.cond
        try {
          // #ifdef MP-WEIXIN
          cond = JSON.parse(decodeURIComponent(option.cond));
          // #endif
          // #ifdef H5
          cond = JSON.parse(option.cond);
          // #endif
        } catch (e) {
          console.log(e);
          //TODO handle the exception
        }
        if (Array.isArray(cond)) {
          cond.forEach(item => {
            if ((item.colName === 'create_user' || item.colName === 'openid' || item.colName ===
                'glry') && item.value === 'user_no') {
              item.value = uni.getStorageSync('login_user_info').user_no;
            }
            if (item.value === 'top.user.user_no') {
              item.value = uni.getStorageSync('login_user_info').user_no;
            }
          });
          this.condition = cond;
        }
      }
      if (option.rCond) {
        try {
          let relationCondition = JSON.parse(option.rCond)
          this.relationCondition = relationCondition
        } catch (e) {
          //TODO handle the exception
        }
      }

      if (this.serviceName) {
        this.getListV2().then(_ => {
          if (this.topQueryMode !== true) {
            this.refresh()
          }
        })
      }
      this.$nextTick().then(() => {
        this.setTopHeight()
      })
    },
    onReachBottom() {
      if (this.loadStatus === 'more') {
        this.pageNo++;
        this.getList(null, this.initCond)
      }
    },
    onShow() {
      if (Array.isArray(this.list) && this.list.length > 0) {
        this.refresh()
      }
    },
    onShareAppMessage(e) {
      let imgUrl = ''
      let title = e?.target?.dataset?.sharetitle
      let path = e?.target?.dataset?.shareurl
      let row = e?.target?.dataset?.row
      let btn = e?.target?.dataset?.btn
      if (btn?.moreConfig?.shareImgCol && row[btn?.moreConfig?.shareImgCol]) {
        imgUrl = this.getImagePath(row[btn?.moreConfig?.shareImgCol])
      }
      let _data = {
        rowData: {
          share_user_no: this.$store?.state?.user?.userInfo?.userno,
          share_store_user_no: this.vstoreUser?.store_user_no,
          ...row
        },
        storeUser: this.vstoreUser,
        userInfo: this.$store?.state?.user?.userInfo,
        storeInfo: this.$store?.state?.app?.storeInfo
      }
      if (title) {
        title = this.renderStr(title, _data)
      }
      if (path) {
        path = this.renderStr(path, _data)
      }
      if (path && path.indexOf('store_no') == -1) {
        path += `&store_no=${this.storeInfo?.store_no}`
      }
      // if (typeof _data.rowData === 'object') {
      //   delete _data.rowData._buttons
      //   path += `&rowData=${JSON.stringify(_data.rowData)}`
      // }
      imgUrl = imgUrl || this.getImagePath(this.storeInfo?.logo || this.storeInfo?.image, true);

      this.saveSharerInfo(this.userInfo, path);
      title = this.renderEmoji(title)
      return {
        imageUrl: imgUrl,
        title: title,
        path: path
      };
    },
    onPageScroll(e) {
      // debounce(()=>{
      this.setPageScrollTop(e)
      // },0)
    },
    onPullDownRefresh() {
      this.refresh()
      setTimeout(_ => {
        uni.stopPullDownRefresh()
      }, 500)
    }

  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    // height: calc(100vh - var(--window-top) + 30px);
    // min-height: calc(100vh - var(--window-top));
    display: flex;
    flex-direction: column;
    // overflow: hidden;
    overflow: auto;
    background-color: #F8F8FA;

    .sticky {
      width: 750rpx;
      background-color: #2979ff;
      color: #fff;
    }

    .top-bar {
      width: 100%;
      position: fixed;
      background-color: #fff;
      top: 0;
      left: 0;
      // top: var(--window-top);
      z-index: 10;
    }

    .list-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      // overflow: hidden;
      // padding-top: 50px;
      .list-view {
        padding: 10px;
        flex: 1;
        // overflow-y: scroll;
      }
    }

    &.cart-list {
      padding-bottom: 60px;
    }

    &.pc-model {
      max-width: 1600px;
      // min-width: 1000px;
      margin: 0 auto;
      flex-direction: row;
      padding: 20px;

      .list-wrap {
        padding-top: 0;
      }

      .grid-layout {
        padding-top: 0 !important;
      }

      .filter-tags-view {
        width: 250px;
        background-color: #fff;
        // margin-top: 10px;
      }

      .count-bar-box {
        // .count-bar-box,.search-bar,.filter-tags-view{
        display: none;
      }
    }
  }


  .bottom-button {
    position: fixed;
    bottom: 50px;
    text-align: center;
    width: 100%;

    .cu-btn {
      width: 80%;

    }
  }

  .qrcodeCanvas-box {
    position: fixed;
    top: -9999px;
  }

  .qrcode-box {
    padding: 80rpx 40rpx;
    text-align: center;
    position: relative;

    .title {
      padding: 0 0 10px;
      font-size: 20px;
      font-weight: bold;
    }

    .store-name {
      margin-top: 10px;
      font-weight: bold;
    }

    .store-logo {
      position: absolute;
      width: 100rpx;
      height: 100rpx;
      left: calc(50% - 50rpx);
      top: 20rpx;
      z-index: 2;
    }

    .qr-code-image {
      width: 500rpx;
      height: 500rpx;
      line-height: 500rpx;
      margin: 0 auto;
      text-align: center;
      font-size: 20px;
      border: 15rpx solid #333;
      padding: 10px;
      // border-radius: 20rpx;
    }
  }

  .upper-icon {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 40px;
    height: 40px;
    transition: background-color .3s, color .3s;
    color: #909090;
    background-color: #fff;
    border: 1px solid #f1f1f1;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(50, 50, 50, .04);
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    display: flex;
  }
</style>
