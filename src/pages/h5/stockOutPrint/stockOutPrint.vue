<template>
  <view class="">
    <view class="print-page">
      <h1>出库单清单</h1>
      <view class="flex justify-between margin-tb">
        <view class="">
          备货时间：<text v-if="data&&data.create_time">{{dayjs(data.create_time).format("YYYY年MM月DD日 H点m分")}}</text>
        </view>
        <view class="">
          订单编码：<text>{{group_buy_ship_no||'-'}}</text>
        </view>
      </view>
      <view class="line-black">

      </view>
      <view class="" v-if="data">
        <view class="margin-tb">
          收货人：{{data.person_name}}
        </view>
        <view class="margin-tb">
          地址：{{data.shipping_address_name}}
        </view>
      </view>
      <view class="line-black">

      </view>
      <view class="margin-tb">
        以下包含商品明细如商品名称、商品规格、数量等
      </view>
      <view class="margin-tb">
        <view class="table">
          <view class="tr flex">
            <view class="th flex-2-5">
              序号
            </view>
            <view class="th">
              商品名称
            </view>
            <view class="th flex-2-5">
              数量
            </view>
            <view class="th flex-2-5">
              单位
            </view>
          </view>
          <view class="tr flex" v-for="(item,index) in list">
            <view class="td flex-2-5">
              {{index+1}}
            </view>
            <view class="td">
              {{item.goods_name||'-'}}
            </view>
            <view class="td flex-2-5">
              {{item.num||'-'}}
            </view>
            <view class="td flex-2-5">
              盒
            </view>
          </view>
          <view class="tr flex" v-if="list.length<5">
            <view class="td flex-2-5">
              {{list.length+1}}
            </view>
            <view class="td">
            </view>
            <view class="td flex-2-5">
            </view>
            <view class="td flex-2-5">
            </view>
          </view>
          <view class="tr flex" v-if="list.length<4">
            <view class="td flex-2-5">
              {{list.length+2}}
            </view>
            <view class="td">
            </view>
            <view class="td flex-2-5">
            </view>
            <view class="td flex-2-5">
            </view>
          </view>
          <view class="tr flex" v-if="list.length<3">
            <view class="td flex-2-5">
              {{list.length+3}}
            </view>
            <view class="td">
            </view>
            <view class="td flex-2-5">
            </view>
            <view class="td flex-2-5">
            </view>
          </view>
          <view class="tr flex" v-if="list.length<2">
            <view class="td flex-2-5">
              {{list.length+4}}
            </view>
            <view class="td">
            </view>
            <view class="td flex-2-5">
            </view>
            <view class="td flex-2-5">
            </view>
          </view>
          <view class="tr flex">
            <view class="td flex-2-5">

            </view>
            <view class="td">

            </view>
          </view>
        </view>

      </view>

    </view>
    <view class="bottom-bar flex justify-center noprint">
      <button class="cu-btn bg-blue lg margin-right" @click="print()">打印</button>
      <!-- <button class="cu-btn bg-blue lg">保存</button> -->
    </view>
  </view>
</template>

<script>
  // import html2Canvas from "html2canvas";
  // import JsPDF from "jspdf";
  export default {
    data() {
      return {
        list: [],
        group_buy_ship_no: "", //团购发货编号
        data: null
      }
    },
    computed: {
      htmlTitle() {
        return `出库单清单-${this.data?.create_time||''}`
      }
    },
    onLoad(option) {
      if (option.no) {
        this.group_buy_ship_no = option.no
        this.getData()
        this.getDetail()
      }
    },
    methods: {
      print() {
        window.print();
      },
      savePdf() {
        let title = this.htmlTitle;
        html2Canvas(document.querySelector("#pdfDom"), {
          allowTaint: true,
          dpi: window.devicePixelRatio * 4,
          scale: 4
        }).then(function(canvas) {
          let contentWidth = canvas.width;
          let contentHeight = canvas.height;
          let pageHeight = (contentWidth / 592.28) * 841.89;
          let leftHeight = contentHeight;
          let position = 0;
          // let imgWidth = 595.28
          let imgWidth = 550;
          let imgHeight = (592.28 / contentWidth) * contentHeight;
          let pageData = canvas.toDataURL("image/jpeg", 1.0);
          let PDF = new JsPDF("", "pt", "a4");
          if (leftHeight < pageHeight) {
            PDF.addImage(pageData, "JPEG", 30, 20, imgWidth, imgHeight);
          } else {
            while (leftHeight > 0) {
              PDF.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
              leftHeight -= pageHeight;
              position -= 841.89;
              if (leftHeight > 0) {
                PDF.addPage();
              }
            }
          }
          PDF.save(title + ".pdf");
        });
      },
      getDetail() {
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
            "rownumber": 20
          }
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state === 'SUCCESS') {
            this.list = res.data.data
          }
        })
      },
      getData() {
        const req = {
          "serviceName": "srvhealth_group_buy_invoice_select",
          "colNames": ["*"],
          "condition": [{
            "colName": 'group_buy_ship_no',
            "ruleType": 'eq',
            "value": this.group_buy_ship_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const url = `/health/select/srvhealth_group_buy_invoice_select`
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
            this.data = res.data.data[0]
          }
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .print-page {
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    min-height: calc(100vh - 100px);
    background-color: #fff;
    margin: 20px auto;
    font-size: 18px;

    .line-black {
      // height: 2px;
      border-bottom: #000 2px solid;
      width: 100%;
      // background-color: #000;
    }

    .table {
      .tr {
        width: 100%;
        border: 1px solid #000;
        border-bottom: none;

        &:last-child {
          border-bottom: 1px solid #000;
        }

        .th {
          background: #A4A4A4;
          text-align: center;
        }

        .td,
        .th {
          flex: 1;
          font-size: 18px;
          padding: 10px;
          border-right: 1px solid #000;
          display: flex;
          align-items: center;
          min-height: 45px;

          // border-bottom: 1px solid #000;
          &:last-child {
            border-right: none;
          }

          &:first-child {
            justify-content: center;
          }

          &.flex-2-5 {
            max-width: 120px;
          }
        }
      }
    }
  }

  .bottom-bar {
    .cu-btn {
      width: 150px;
    }
  }

  @media print {
    @page {
      size: auto;
      /* auto is the initial value */
      margin: 0mm 10mm;
      /* this affects the margin in the printer settings */
    }

    body {
      margin: 1cm;
    }

    .th {
      -webkit-print-color-adjust: exact;
    }

    .noprint {
      display: none;
    }

    /* 在打印时隐藏 */
  }
</style>
