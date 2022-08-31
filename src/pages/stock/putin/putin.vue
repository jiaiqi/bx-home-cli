<template>
  <view>
    <view class="top-form">
      <view class="form-item" :class="{'textarea':item.column==='remark'}" v-for="item in fields">
        <view class="label text-bold">
          {{item.label}}
        </view>
        <view class="value">
          <view class="  " v-if="item.column==='operator'">
            <text> {{username||''}}</text>
            <text class="cuIcon-right margin-left-xs"></text>
          </view>
          <view class="flex align-center justify-end"
            v-else-if="item.column==='in_warehouse_type'||item.column==='out_warehouse_type'">
            <picker @change="typeChange" :value="curType" :range="typeList">
              <view class="">{{typeList[curType]}}</view>
            </picker>
            <text class="cuIcon-right margin-left-xs"></text>
          </view>
          <view class="flex align-center justify-end" v-else-if="item.column==='warehouse_no'">
            <picker @change="houseChange" :value="curHouse" :range="houseNameList">
              <view class="">{{houseNameList[curHouse]||'请选择'}}</view>
            </picker>
            <text class="cuIcon-right margin-left-xs"></text>
          </view>
          <view class="flex align-center justify-end" v-else-if="item.column==='xxx'">
            <text class="cuIcon-right margin-left-xs"></text>
          </view>
          <view class="flex justify-end align-center" v-else-if="item.column==='in_out_date'">
            <datetime-picker :value="form.in_out_date" :defaultValue="form.in_out_date" @change="dateTimeChange">
            </datetime-picker>
            <text class="cuIcon-calendar margin-left-xs"></text>
          </view>
          <view class="text-area " v-else-if="item.column==='remark'">
            <input type="text" v-model="form.remark" placeholder="请输入">
          </view>
          <input type="text" v-model="item.value" v-else>
        </view>
      </view>
    </view>

    <view class="child-list bg-white ">
      <view class=" text-black flex justify-between align-center">
        <text class="text-bold">{{form.type||''}}明细</text>
        <button class="cu-btn bg-grey add " @click="showModal('add')" v-if="type==='入库'">添加</button>
      </view>
      <view class="table">
        <view class="tr th text-bold">
          <view class="td">
            商品名称
          </view>
          <view class="td half">
            单位
          </view>
          <view class="td half">
            数量
          </view>
          <view class="td half">
            已扫码数
          </view>
          <view class="td flex-2-5">
          </view>
        </view>
        <view class="tr" v-for="(item,index) in selectedGoods" @click="showModal('update',index)">
          <view class="td">
            {{item.goods_name||''}}
          </view>
          <view class="td half">
            {{item.unit||''}}
          </view>
          <view class="td half">
            {{item.goods_num||'0'}}
          </view>
          <view class="td half">
            {{item.scan_num||'0'}}
          </view>
          <view class="td flex-2-5 text-center" @click.stop="toScan(item)">
            <text class="cuIcon-scan"></text>
          </view>
        </view>
      </view>
    </view>
    <view class="bottom-button margin-tb">
      <button class="cu-btn bg-blue" @click="confirm">确认</button>
    </view>

    <view class="cu-modal" :class="{show:modalName==='update'||modalName==='add'}">
      <view class="cu-dialog">
        <view class="add-modal">
          <view class="flex justify-between align-center padding ">
            <text></text>
            <text> {{modalName==='update'?'编辑商品':modalName==='add'?'添加商品':''}}</text>
            <view class="padding-xs" @click="showModal()">
              <text class="cuIcon-close"></text>
            </view>
          </view>
          <view class="form-item">
            <view class="label mini">
              <text class="text-red margin-right-xs">*</text>商品
            </view>
            <view class="value flex justify-between align-center">
              <picker @change="goodsChange" :value="curGoods" :range="goodsNameList">
                <view class="">{{goodsNameList[curGoods]||'请选择'}}</view>
              </picker>
              <text class="cuIcon-right margin-left-xs"></text>
            </view>
          </view>
          <view class="form-item">
            <view class="label mini">
              <text class="text-red margin-right-xs">*</text>规格
            </view>
            <view class="value">
              <input type="text" v-model="addForm.unit" :disabled="true">
            </view>
          </view>
          <view class="form-item">
            <view class="label mini">
              <text class="text-red margin-right-xs">*</text> 数量
            </view>
            <view class="value">
              <input type="digit" v-model="addForm.goods_num" :focus="['update','add'].includes(modalName)">
            </view>
          </view>
          <view class="bottom-button">
            <button class="cu-btn w bg-red round margin-right-xs" @click="del"
              v-if="modalName==='update'&&type=='入库'"><text class="cuIcon-delete"></text>
            </button>
            <button class="cu-btn bg-blue round " @click="confirmGoods">确认</button>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  const fields = {
    '入库': [{
        column: "operator",
        label: "操作人",
        value: ""
      },
      {
        column: "warehouse_no",
        label: "选择仓库",
        value: ""
      },
      {
        column: "in_out_date",
        label: "入库时间",
        value: ""
      },
      {
        column: "in_warehouse_type",
        label: "入库类型",
        value: ""
      },
      // {
      //   column: "xxx",
      //   label: "关联采购订单",
      //   disabled: true,
      //   value: ""
      // },
      {
        column: "remark",
        label: "备注",
        value: ""
      },
    ],
    '出库': [{
        column: "operator",
        label: "操作人",
        value: ""
      },
      {
        column: "warehouse_no",
        label: "选择仓库",
        value: ""
      },
      {
        column: "in_out_date",
        label: "出库时间",
        value: ""
      },
      {
        column: "out_warehouse_type",
        label: "出库类型",
        value: ""
      },
      // {
      //   column: "xxx",
      //   label: "关联采购订单",
      //   disabled: true,
      //   value: ""
      // },
      {
        column: "remark",
        label: "备注",
        value: ""
      },
    ]
  }

  const typeList = {
    '入库': [
      '采购入库', '调拨入库', '退货入库'
      // , '生产入库'
    ],
    '出库': [
      '销售出库',
      '调拨出库', 
      // '报损出库', '其他出库'
    ]
  }
  let type = '入库'
  export default {
    data() {
      return {
        // store
        pageTitle: '入库',
        curEditGoods: -1,
        type: '入库',
        group_buy_ship_no: "", //团购发货编码
        shipInfo: {}, //团购发货单信息
        shipDetail: [],
        curType: 0,
        curHouse: 0, //当前仓库
        modalName: "",
        warehouse_no: "", //仓库编码
        typeList: [],
        fields: [],
        addForm: {
          goods_name: null, //商品名称
          bar_code: null, //商品
          unit: null, //规格
          warehouse_no: null, //仓库编号
          goods_num: null, //商品数量
          scan_num: null, //扫码数量
        },

        form: {
          store_no: "", // 
          operator: "", //操作人
          in_out_date: "", //出入库时间
          type: "入库", // 类型 出库、入库
          in_warehouse_type: "", //入库类型 - 采购入库、调拨入库、退货入库、生产入库
          out_warehouse_type: "", //出库类型 - 调拨出库、报损出库、其他出库
          remark: "", //备注
        },
        houseList: [], // 仓库列表
        houseNameList: [],
        goodsList: [],
        goodsNameList: [],
        curGoods: 0, //当前选择商品
        selectedGoods: [],
        scanList: {}
      }

    },
    computed: {
      username() {
        return this.vloginUser.real_name || this.vloginUser.user_disp || this.userInfo?.name || this.userInfo?.nick_name
      }
    },
    async onLoad(option) {
      if (option.type) {
        type = option.type
      } else {
        option.type = '入库'
      }
      this.type = option.type
      this.form.type = option.type
      this.typeList = typeList[option.type]
      this.fields = fields[option.type]

      uni.setNavigationBarTitle({
        title: option?.pageTitle || type || ''
      })

      if (option.group_buy_ship_no) {
        this.group_buy_ship_no = option.group_buy_ship_no
        await this.getShipInfo()
        await this.getShipDetail()
      }
      await this.initFormData()
    },
    methods: {
      del() {
        if (this.curEditGoods || this.curEditGoods == 0) {
          uni.showModal({
            title: '提示',
            content: '是否删除此商品',
            success: (res) => {
              if (res.confirm) {
                this.selectedGoods.splice(this.curEditGoods, 1)
                this.curEditGoods = -1
                this.showModal()
              }
            }
          })
        }
      },
      getShipDetail() {
        const url = `/health/select/srvhealth_group_buy_ship_detail_select`
        const req = {
          "serviceName": "srvhealth_group_buy_ship_detail_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "group_buy_ship_no",
            "ruleType": "eq",
            "value": this.group_buy_ship_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 50
          },
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data)) {
            this.selectedGoods = res.data.data.map(item => {
              return {
                "goods_name": item.goods_name,
                "bar_code": item.bar_code,
                "unit": item.unit,
                "warehouse_no": item.warehouse_no,
                "goods_num": item.num,
                "scan_num": 0
              }
            })
          }
        })

      },
      getShipInfo() {
        //
        const url = `/health/select/srvhealth_group_buy_invoice_select`
        const req = {
          "serviceName": "srvhealth_group_buy_invoice_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "group_buy_ship_no",
            "value": this.group_buy_ship_no,
            "ruleType": "eq"
          }]
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
            this.shipInfo = res.data.data[0]
            this.warehouse_no = this.shipInfo.ck_no
            this.form.warehouse_no = this.shipInfo.ck_no
            this.form.operator = this.shipInfo.operator_no
            this.form.operator_name = this.shipInfo.operator_name
            this.form.store_no = this.shipInfo.store_no
          }
        })
      },
      putIn() {
        // 入库
        if (this.selectedGoods.length === 0) {
          uni.showModal({
            title: '提示',
            content: '请选择入库商品',
            showCancel: false
          })
          return
        }
        const url = `/health/operate/srvhealth_in_out_warehouse_add`
        let numpass = true
        let tip = ''
        let codeList = Object.keys(this.scanList).reduce((res, code) => {
          if (Array.isArray(this.scanList[code])) {
            let data = this.selectedGoods.find(item => item.bar_code == code)
            if (this.scanList[code].length < data.goods_num) {
              numpass = false
              tip = `【${data.goods_name}】已扫码数不足`
            } else if (this.scanList[code].length > data.goods_num) {
              numpass = false
              tip = `【${data.goods_name}】已扫码数超出${this.type}数量`
            }
            if (this.scanList[code].length > 0) {
              this.scanList[code].forEach(e => {
                res.push({
                  ...data,
                  warehouse_no: this.warehouse_no,
                  _bar_code: e
                })
              })
            }
          }
          return res
        }, [])
        if (numpass === false && tip) {
          uni.showModal({
            title: '提示',
            content: tip,
            showCancel: false
          })
          return
        }
        const req = [{
            "serviceName": "srvhealth_in_out_warehouse_add",
            "condition": [],
            "data": [{
              "store_no": this.storeInfo?.store_no,
              "operator": this.vstoreUser?.store_user_no,
              "operator_name": this.username,
              "warehouse_no": this.warehouse_no,
              "in_out_date": this.form.in_out_date,
              "type": type,
              "in_warehouse_type": this.form.in_warehouse_type,
              "remark": this.form.remark,
              "child_data_list": [{
                  "serviceName": "srvhealth_in_out_warehouse_details_add",
                  "condition": [],
                  "depend_keys": [{
                    "type": "column",
                    "add_col": "in_out_no",
                    "depend_key": "in_out_no"
                  }],
                  "data": this.selectedGoods.map(item => {
                    return {
                      "store_no": this.storeInfo?.store_no,
                      "type": type,
                      "bar_code": item.bar_code,
                      "unit": item.unit,
                      "warehouse_no": this.warehouse_no,
                      "goods_name": item.goods_name,
                      "scan_num": item.scan_num,
                      "goods_num": item.goods_num
                    }
                  })
                },
                {
                  "serviceName": "srvhealth_in_out_unique_code_add",
                  "depend_keys": [{
                    "type": "column",
                    "add_col": "in_out_no",
                    "depend_key": "in_out_no"
                  }],
                  "data": codeList.map(item => {
                    return {
                      "unique_code": item._bar_code,
                      "bar_code": item.bar_code,
                      "goods_name": item.goods_name
                    }
                  })
                }

              ]
            }]
          },
          {
            "serviceName": "srvhealth_unique_code_add",
            "condition": [],
            "data": codeList.map(item => {
              return {
                "unique_code": item._bar_code,
                "bar_code": item.bar_code,
                "goods_name": item.goods_name,
                "unit": item.unit,
                "goods_state": "仓库中"
              }
            })
          }
        ]
        console.log(req)
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            uni.showModal({
              title: '提示',
              showCancel: false,
              content: res?.data?.resultMessage || '操作成功',
              success: (res) => {
                if (res.confirm) {
                  uni.navigateBack()
                }
              }
            })
          } else {
            uni.showModal({
              title: '提示',
              showCancel: false,
              content: res?.data?.resultMessage || '操作失败',
              success: (res) => {
                if (res.confirm) {}
              }
            })
          }
        })
      },
      putOut() {
        // 出库
        let numpass = true
        let tip = ''
        let codeList = Object.keys(this.scanList).reduce((res, code) => {
          if (Array.isArray(this.scanList[code]) && this.scanList[code].length > 0) {
            let data = this.selectedGoods.find(item => item.bar_code == code)
            if (this.scanList[code].length < data.goods_num) {
              numpass = false
              tip = `【${data.goods_name}】已扫码数不足`
            } else if (this.scanList[code].length > data.goods_num) {
              numpass = false
              tip = `【${data.goods_name}】已扫码数超出${this.type}数量`
            }
            this.scanList[code].forEach(e => {
              res.push({
                ...data,
                warehouse_no: this.warehouse_no,
                _bar_code: e
              })
            })
            return res
          }
        }, [])
        if (numpass === false && tip) {
          uni.showModal({
            title: '提示',
            content: tip,
            showCancel: false
          })
          return
        }
        const url = `/health/operate/srvhealth_in_out_warehouse_add`
        const req = [{
          "serviceName": "srvhealth_in_out_warehouse_add",
          "condition": [],
          "data": [{
            store_no: this.form.store_no,
            "operator": this.vstoreUser?.store_user_no,
            "operator_name": this.username,
            "warehouse_no": this.warehouse_no,
            "in_out_date": this.form.in_out_date,
            "type": "出库",
            "out_warehouse_type": this.form.out_warehouse_type,
            "in_out_order_no": this.group_buy_ship_no, //团购发货编号
            "remark": this.form.remark,
            "child_data_list": [{
                "serviceName": "srvhealth_in_out_warehouse_details_add",
                "condition": [],
                "depend_keys": [{
                  "type": "column",
                  "add_col": "in_out_no",
                  "depend_key": "in_out_no"
                }],
                "data": this.selectedGoods.map(item => {
                  return {
                    "bar_code": item.bar_code,
                    "unit": item.unit,
                    "warehouse_no": this.warehouse_no,
                    "goods_name": item.goods_name,
                    "scan_num": item.scan_num,
                    "goods_num": item.goods_num || item.num
                  }
                })
              },
              {
                "serviceName": "srvhealth_in_out_unique_code_add",
                "depend_keys": [{
                  "type": "column",
                  "add_col": "in_out_no",
                  "depend_key": "in_out_no"
                }],
                "data": codeList.map(item => {
                  return {
                    "unique_code": item._bar_code,
                    "bar_code": item.bar_code,
                    "goods_name": item.goods_name
                  }
                })
              }
            ]
          }]
        }]

        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            uni.showModal({
              title: '提示',
              showCancel: false,
              content: res?.data?.resultMessage || '操作成功',
              success: (res) => {
                if (res.confirm) {
                  uni.navigateBack()
                }
              }
            })
          } else {
            uni.showModal({
              title: '提示',
              showCancel: false,
              content: res?.data?.resultMessage || '操作失败',
              success: (res) => {
                if (res.confirm) {}
              }
            })
          }
        })
      },
      toScan(e) {
        const uuid = uni.$u.guid()
        if (!this.scanList[e.bar_code]) {
          this.scanList[e.bar_code] = []
        }
        let url = `/otherPages/scanCode/scanCode?goods_num=${e.goods_num}&uuid=${uuid}&bar_code=${e.bar_code}`
        if (Array.isArray(this.scanList[e.bar_code]) && this.scanList[e.bar_code].length > 0) {
          url += `&list=${JSON.stringify(this.scanList[e.bar_code])}`
        }
        uni.navigateTo({
          url,
          success: () => {
            uni.$on('confirmScan', (data) => {
              console.log(data.uuid, uuid, data.bar_code, data.list)
              if (data.uuid === uuid && data.bar_code && data.list) {
                if (Array.isArray(data.list)) {
                  this.scanList[e.bar_code] = data.list
                  this.selectedGoods = this.selectedGoods.map((item, index) => {
                    if (item.bar_code === e.bar_code) {
                      item.scan_num = data.list.length
                      this.$set(this.selectedGoods, index, item)
                    }
                    return item
                  })
                }
              }
            })
          }

        })
      },
      confirm() {
        // 提交表单
        if (this.selectedGoods.length === 0) {
          uni.showToast({
            title: '请选择入库商品',
            icon: "none"
          })
        }
        if (type === '入库') {
          this.putIn()
        } else {
          // 出库
          this.putOut()
        }
      },
      confirmGoods() {
        // 加入商品列表
        if (!this.addForm.goods_name) {
          uni.showToast({
            title: '请选择商品',
            icon: 'none'
          })
          return
        }
        if (!this.addForm.goods_num) {
          uni.showToast({
            title: '请填写数量',
            icon: 'none'
          })
          return
        }
        if (this.modalName === 'add' && this.curEditGoods === -1) {
          let oldGoodsIndex = this.selectedGoods.findIndex(item => item.bar_code === this.addForm.bar_code)
          if (oldGoodsIndex !== -1) {
            let data = this.selectedGoods[oldGoodsIndex]
            data.goods_num = Number(this.addForm.goods_num) + Number(data.goods_num)
            this.$set(this.selectedGoods, oldGoodsIndex, data)
          } else {

            this.selectedGoods.push({
              ...this.addForm
            })
          }
        } else {
          this.selectedGoods[this.curEditGoods] = {
            ...this.addForm
          }
          this.$set(this.selectedGoods, this.curEditGoods, {
            ...this.addForm
          })
          this.curEditGoods = -1
        }

        if (this?.addForm?.bar_code) {
          this.scanList[this.addForm.bar_code] = this.scanList[this.addForm.bar_code] || []
        }

        this.initAddForm()
        this.showModal()
        this.addForm.unit = this.goodsList[0].unit
        this.addForm.bar_code = this.goodsList[0].bar_code
        this.addForm.goods_name = this.goodsList[0].goods_name
      },
      initAddForm() {
        this.curGoods = 0
        Object.keys(this.addForm).forEach(key => {
          this.addForm[key] = null
        })
      },
      async initFormData() {
        Object.keys(this.form).forEach(key => {
          this.form[key] = ''
        })
        this.curType = 0
        this.curHouse = 0
        this.form.operator = this.userInfo?.userno
        this.form.type = type
        this.form.in_out_date = this.dayjs().format("YYYY-MM-DD HH:mm:ss")
        this.form.store_no = this.storeInfo?.store_no
        if (type === '入库') {
          this.form.in_warehouse_type = this.typeList[0]
        } else {
          this.form.out_warehouse_type = this.typeList[0]
        }
        await this.getHouse()
        await this.getGoods()
      },
      showModal(e = "", index) {
        // if (e == 'update' && this.type == '出库') {

        // } else {
        this.modalName = e
        // }
        if (index || index == 0) {
          let item = this.selectedGoods[index]
          this.addForm = {
            "goods_name": item.goods_name,
            "bar_code": item.bar_code,
            "unit": item.unit,
            "warehouse_no": item.warehouse_no,
            "goods_num": item.goods_num,
            "scan_num": item.scan_num
          }
          this.curEditGoods = index
        }
      },

      goodsChange(e) {
        const index = e.detail.value;
        this.curGoods = index
        this.addForm.unit = this.goodsList[index].unit
        this.addForm.bar_code = this.goodsList[index].bar_code
        this.addForm.goods_name = this.goodsList[index].goods_name
      },
      houseChange(e) {
        const index = e.detail.value;
        this.curHouse = index
        this.warehouse_no = this.houseList[index].no
      },
      typeChange(e) {
        const index = e.detail.value;
        this.curType = index
        if (type === '入库') {
          this.form.in_warehouse_type = this.typeList[index]
        } else {
          this.form.out_warehouse_type = this.typeList[index]
        }
      },
      dateTimeChange(e) {
        this.form.in_out_date = `${e.f1} ${e.hh}:${e.mm}:${e.ss}`
      },
      async getGoods() {
        // 查找可选商品
        const url = `/health/select/srvhealth_bar_code_select`
        const req = {
          "serviceName": "srvhealth_bar_code_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "parent_no",
              "ruleType": "isnull"
            },
            {
              colName: 'store_no',
              ruleType: 'like',
              value: this.storeInfo?.store_no
            }
          ],
        }
        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          this.goodsList = res.data.data
          this.goodsNameList = res.data.data.map(item => item.goods_name)
          if (res.data.data.length > 0) {
            this.addForm.bar_code = res.data.data[0].bar_code
            this.addForm.unit = res.data.data[0].unit
            this.addForm.goods_name = res.data.data[0].goods_name
          }
        }
      },
      async getHouse() {
        // 查找仓库列表
        const url = `/health/select/srvhealth_store_treasury_info_select`
        const req = {
          "serviceName": "srvhealth_store_treasury_info_select",
          "colNames": ["*"],
          order: [{
            colName: 'create_time',
            orderType: 'asc'
          }],
          "condition": [{
              "colName": "parent_no",
              "ruleType": "isnull"
            },
            {
              "colName": "store_no",
              "ruleType": 'eq',
              value: this.store_no || this.storeInfo?.store_no
            },
          ]
        }
        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          this.houseList = res.data.data
          this.houseNameList = res.data.data.map(item => item.name)
          if (res.data.data.length > 0) {
            if (this.form.warehouse_no) {
              this.curHouse = this.houseList.findIndex(item => item.no === this.shipInfo.ck_no)
            } else {
              this.curHouse = 0
              this.warehouse_no = res.data.data[0].no
            }
          }
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .bottom-button {
    padding: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    .cu-btn {
      width: 80%;

      &.w {
        // width: auto;
      }
    }
  }

  .form-item {
    background-color: #fff;
    margin-bottom: 1px;
    padding: 0 20px;
    display: flex;
    height: 50px;
    align-items: center;

    &.textarea {
      margin-top: 10px;
      flex-direction: column;
      align-items: flex-start;
      padding: 15px 20px;
      height: auto;

      .label,
      .value {
        width: 100%;
      }

      .label.mini {
        width: 50px;
      }

      .text-area {
        width: 100%;
        height: 150rpx;
        text-align: left;
        padding: 10px;
        background-color: #F5F5F5;
        margin-top: 10px;
        border-radius: 4px;
      }
    }

    .label {
      width: 100px;
      text-align: left;
    }

    .value {
      flex: 1;
      text-align: right;
    }
  }

  .child-list {
    padding: 15px 10px;
    margin-top: 10px;

    .cu-btn.add {
      min-width: 80px;
    }
  }

  .table {
    margin-top: 10px;

    .tr {
      display: flex;
      min-height: 40px;
      align-items: center;
      border-bottom: 1px solid #F5F5F5;

      &.th {
        height: 30px;
      }

      .td {
        flex: 1;
        text-align: left;
        padding: 2px;

        &.text-center {
          text-align: center;
        }

        &.half {
          flex: 0.5;
        }

        &.flex-2-5 {
          flex: 0.25;
        }
      }
    }
  }

  .cu-modal {
    display: block;
  }
</style>
