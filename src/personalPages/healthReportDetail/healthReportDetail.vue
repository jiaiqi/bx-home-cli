<template>
  <view class="detail-wrap">
    <view class="page-item" v-if="illList.includes(type)">
      <view class="">
        <view class="title" v-if="data&&data.result_level">
          <text class="cuIcon-titles text-blue"></text>
          <text>未来10年{{type}}的发病风险等级：{{data.result_level}}</text>
        </view>
      </view>
      <view class="progress-box" v-if="data&&data.result_level">
        <view class="progress-item " :class="{'active':data.result_level==='低风险'}">
          <!-- 低风险 -->
          <view class="content bg-green">

          </view>
          <view class="text">
            低
          </view>
        </view>
        <view class="progress-item " :class="{'active':data.result_level==='较低风险'}">
          <!--    <text>较低</text>
          <text>风险</text> -->
          <view class="content bg-olive">

          </view>
          <view class="text">
            较低
          </view>
        </view>
        <view class="progress-item " :class="{'active':data.result_level==='中等风险'}">
          <!--  <text>中等</text>
          <text>风险</text> -->
          <view class="content bg-blue">

          </view>
          <view class="text">
            中
          </view>
        </view>
        <view class="progress-item " :class="{'active':data.result_level==='较高风险'}">
          <!--        <text>较高</text>
          <text>风险</text> -->
          <view class="content bg-yellow">

          </view>
          <view class="text">
            较高
          </view>
        </view>
        <view class="progress-item " :class="{'active':data.result_level==='高风险'}">
          <!-- 高风险 -->
          <view class="content bg-orange">

          </view>
          <view class="text">
            高
          </view>
        </view>
        <view class="progress-item " :class="{'active':data.result_level==='疑似已患'}">
          <!--   <text>疑似</text>
          <text>已患</text> -->
          <view class="content bg-red">
          </view>
          <view class="text">
            疑似
          </view>
        </view>
      </view>
    </view>

    <view class="" v-if="illList.includes(type)">
      <view class="page-item">
        <view class="title text-orange" v-if="data&&data.result_level">
          您患{{type}}的风险等级:{{data.result_level}}
        </view>
        <view class="desc-content">
          基于您提供的有关健康信息及临床检查结果,得出您与同年龄同性别人群{{type}}发病的风险等级。
        </view>
      </view>

      <view class="page-item">
        <view class="title text-orange" v-if="data&&data.result_level_value">
          当前风险:{{data.result_level_value}}
        </view>
        <view class="desc-content">
          按照现有的危险因素水平,您未来5年内患{{type}}的风险值为{{data.result_level_value}}。
        </view>
      </view>

      <view class="page-item">
        <view class="title text-orange" v-if="data&&data.result_ideal_value">
          理想风险:{{data.result_ideal_value}}
        </view>
        <view class="desc-content">
          如果您能将所有可改变的危险因素控制在理想水平时,未来5年{{type}}}的发病风险值可降至{{data.result_ideal_value}}。
        </view>
      </view>
    </view>


    <!--    <view class="title " v-if="childService&&childService.service_view_name">
      <text class="cuIcon-titles text-blue"></text> {{childService.service_view_name}}
    </view> -->
    <view class="page-item" v-if="type==='疾病风险评估汇总'">
      <view class="title">
        <text class="cuIcon-titles text-blue"></text>本次{{type}}
      </view>
      <view class="cur-disease-list" v-if="data">
        <view class="disease-item" v-for="item in  diseaseTypeList">
          <view class="type" :style="[{background:item.color}]">
            {{item.label}}
          </view>
          <view class="disease">
            {{data[item.col]}}
          </view>
        </view>
      </view>
    </view>

    <view class="page-item" v-if="type==='重要指标检查结果'">
      <view class="title">
        <text class="cuIcon-titles text-blue"></text>重要指标检查结果
      </view>
      <view class="table-box" v-if="cols&&cols['重要指标检查结果']">
        <view class="tr">
          <view class="td th" v-for="item in ['指标','理想目标','当前数据']">
            {{item}}
          </view>
        </view>
        <view class="tr" v-for="col in cols['重要指标检查结果']">
          <view class="td">
            {{col.label}}
          </view>
          <view class="td">
            {{col.origin||'-'}}
          </view>
          <view class="td">
            {{data[col.column]}}
          </view>
        </view>
      </view>
    </view>

    <view class="page-item" v-if="illList.includes(type)&&childCols&&childCols.length>0">
      <view class="title">
        <text class="cuIcon-titles text-blue"></text>
        <text>与{{type}}发病相关的危险因素</text>
      </view>
      <view class="table-box">
        <view class="tr">
          <view class="td th" v-for="item in childCols">
            {{item.label}}
          </view>
        </view>
        <view class="tr" v-for="data in list">
          <view class="td" v-for="col in childCols">
            {{data[col.column]}}
          </view>
        </view>
      </view>

    </view>
    <view class="page-item" v-if="illList.includes(type)">
      <view class="title">
        <text class="cuIcon-titles text-blue"></text>
        <text>改善以下因素，降低发病风险</text>
      </view>
      <view class="padding-lr-xs ">
        <text v-html="data.improvement_factors"></text>
      </view>
    </view>
  </view>
</template>

<script>
  const illList = ['高血压', '冠心病', '脑卒中', '糖尿病', '痛风', '血脂异常', '骨质疏松', '肺癌', '代谢综合症', '肥胖症']
  export default {
    data() {
      return {
        illList: illList,
        id: "",
        sr_no: '',
        fk: '',
        service: '',
        data: {},
        list: [],
        childService: {},
        cols: {
          "重要指标检查结果": [{
              column: 'blood_pressure',
              label: '血压',
              origin: "<120/80mmHg"
            },
            {
              column: 'blood_glucose',
              label: '空腹血糖',
              origin: '3.9~5.9mmol/L'
            },
            {
              column: 'waistline',
              label: '腰围',
              origin: '<85cm'
            },
            {
              column: 'user_bmi',
              label: '体重指数（BMI）',
              origin: '18.5<=BMI<24'
            },
            {
              column: 'total_cholesterol',
              label: '总胆固醇',
              origin: '2.9~5.17mmol/L'
            },
            {
              column: 'triglyceride',
              label: '甘油三酯',
              origin: '0.57~1.69mmol/L'

            },
            {
              column: 'hdlc',
              label: '高密度脂蛋白胆固醇',
              origin: '>1.04mmol/L'
            },
            {
              column: 'ldlc',
              label: '低密度脂蛋白胆固醇',
              origin: '0~3.36mmol/L'
            },
            {
              column: 'bone_mdi_t',
              label: '骨密度检查指标-T值',
              origin: '>=-1'
            },
            {
              column: 'dietary_structure',
              label: '膳食结构',
              origin: '合理'
            },
            {
              column: 'physical_activity',
              label: '体力活动',
              origin: '充足'
            },
            {
              column: 'blood_uric_acid',
              label: '血尿酸',
              origin: '150~360mmol/L'
            },

            {
              column: 'serum_creatinine',
              label: '血肌酐',
              origin: '44~97 μmol/L'
            }
          ]
        },
        childV2: null,
        diseaseTypeList: [{
            col: 'present_disease',
            label: '现患(疑似)',
            color: '#ff0000'
          },
          {
            col: 'high_risk',
            label: '高风险(高危)',
            color: '#eb5c50'
          },
          {
            col: 'higher_risk',
            label: '较高风险',
            color: '#ff8600'
          },
          {
            col: 'medium_risk',
            label: '中等风险',
            color: '#009cff'
          },
          {
            col: 'low_risk',
            label: '低风险(低危)',
            color: '#42d8b7'
          }
        ]
      }
    },
    computed: {
      type() {
        let res = ''
        let text = this.childV2?.service_view_name || this.fk?.section_name
        if (text) {
          illList.forEach(key => {
            if (text.indexOf(key) !== -1) {
              res = key
            }
          })
        }
        return res || text
      },
      pageTitle() {
        return this.fk?.section_name
      },
      childCols() {
        return this.childV2?._fieldInfo.filter(item => item.column !== 'sr_no')
      }
    },
    methods: {
      async getData() {
        const url = `/health/select/${this.service}`
        const req = {
          "serviceName": this.service,
          "colNames": ["*"],
          "condition": [{
            "colName": "sr_no",
            "ruleType": "eq",
            "value": this.sr_no
          }],
          "page": {
            "pageNo": 1,
            "rownumber": 1
          }
        }
        const res = await this.$http.post(url, req)
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          this.data = res.data.data[0]
          // this.getList()
        }
      },
      async getChild() {
        const url =
          `/health/select/srvsys_service_columnex_v2_select?colsel_v2=${this.service}`
        const req = {
          "serviceName": "srvsys_service_columnex_v2_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "service_name",
            "value": this.service,
            "ruleType": "eq"
          }, {
            "colName": "use_type",
            "value": "detail",
            "ruleType": "eq"
          }],
          "order": [{
            "colName": "seq",
            "orderType": "asc"
          }]
        }
        const res = await this.$http.post(url, req)
        if (res?.data?.state === 'SUCCESS') {
          if (Array.isArray(res?.data?.data?.child_service) && res?.data?.data?.child_service.length > 0) {
            this.childService = res?.data?.data?.child_service[0]
            // if (this.childService?.service_view_name) {
            //   uni.setNavigationBarTitle({
            //     title: this.childService.service_view_name
            //   })
            // }
            this.getChildV2()
            this.getList()
          }
        }
      },
      async getChildV2() {
        let colVs = await this.getServiceV2(this.childService.service_name, 'list', 'detaillist', 'health');
        this.childV2 = colVs
        // const url =
        //   `/health/select/srvsys_service_columnex_v2_select?colsel_v2=${this.childService.service_name}`
        // const req = {
        //   "serviceName": "srvsys_service_columnex_v2_select",
        //   "colNames": ["*"],
        //   "condition": [{
        //     "colName": "service_name",
        //     "value": this.childService.service_name,
        //     "ruleType": "eq"
        //   }, {
        //     "colName": "use_type",
        //     "value": "detail",
        //     "ruleType": "eq"
        //   }],
        //   "order": [{
        //     "colName": "seq",
        //     "orderType": "asc"
        //   }]
        // }
        // const res = await this.$http.post(url, req)
        // if (res?.data?.state === 'SUCCESS') {

        //   this.childV2 = res.data.data
        // }

      },
      async getList() {
        const service = this.childService?.service_name
        if (service) {
          const url = `/health/select/${service}`
          const req = {
            "serviceName": service,
            "colNames": ["*"],
            "condition": [{
              "colName": "sr_no",
              "ruleType": "eq",
              "value": this.sr_no
            }],
            "relation_condition": {},
            "page": {
              "pageNo": 1,
              "rownumber": 500
            },
          }
          const res = await this.$http.post(url, req)
          if (res?.data?.state === 'SUCCESS') {
            this.list = res.data.data
          }
        }

      },
    },
    onLoad(option) {
      if (option.sr_no) {
        this.sr_no = option.sr_no
        if (option.service) {
          this.service = option.service
          this.getData()
          this.getChild()
        }
      }
      if (option.fk) {
        try {
          this.fk = JSON.parse(option.fk)
          if (this.pageTitle) {
            uni.setNavigationBarTitle({
              title: this.pageTitle
            })
          }
        } catch (e) {
          //TODO handle the exception
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .detail-wrap {
    background-color: #f8f8f8;

    .page-item {
      background-color: #fff;
      padding: 12px;
      margin-bottom: 10px;

      .desc-content {
        background-color: #f8f8f8;
        padding: 10px;
        border-radius: 5px;
      }

    }

    .progress-box {
      display: flex;
      padding-top: 25px;

      .progress-item {
        flex: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1px;

        .content {
          border-radius: 5px;
          height: 10px;
          margin-bottom: 5px;
        }

        // &:last-child {
        //   border-radius: 0 20px 20px 0;
        // }

        // &:first-child {
        //   border-radius: 20px 0 0 20px;
        // }

        &.active {
          position: relative;

          &::before {
            content: '你在这里';
            top: -30px;
            position: absolute;
            color: #80a5ff;
          }

          &::after {
            content: '';
            width: 0;
            height: 0;
            left: calc(50% - 10px);
            top: -10px;
            border: 10px solid transparent;
            border-top-color: #80a5ff;
            position: absolute;
          }
        }
      }
    }

    .title {
      font-size: 16px;
      font-weight: bold;
      padding-bottom: 10px;
    }

    .cur-disease-list {
      .disease-item {
        display: flex;
        margin-bottom: 5px;
        align-items: center;

        .type {
          width: 100px;
          padding: 5px;
          color: #fff;
          text-align: center;
          margin-right: 10px;
        }

        .disease {
          flex: 1;

        }
      }
    }

    .table-box {
      width: 100%;
      overflow-x: scroll;
      border-top: 1px solid #f1f1f1;
      border-right: 1px solid #f1f1f1;

      .tr {
        display: flex;
        border-left: 1px solid #f1f1f1;
        border-bottom: 1px solid #f1f1f1;

        .td {
          flex: 1;
          padding: 5px;
          border-left: 1px solid #f1f1f1;

          &.th {
            background-color: #f8f8f8;
          }
        }
      }
    }
  }
</style>
