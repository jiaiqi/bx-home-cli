<template>
  <view class="page-wrap" :style="{
      '--global-text-font-size': globalTextFontSize + 'px',
    }">
    <view class="to-history" v-if="configCols && configCols.length > 0 &&formData&&formData.answer_times==='多次'"
      @click="toHistory">点击查看历史提交</view>
    <view class="content" style="padding: 10px" v-if="formData.remark">
      <view class="desc" style="text-align: justify">
        <view class="text-content-text1 text-black">
          <view v-html="
              JSON.parse(
                JSON.stringify(formData.remark).replace(
                  /\<img/gi,
                  '<img width=100%  '
                )
              )
            ">
          </view>
        </view>
      </view>
    </view>
    <view class="content" style="padding:0 10px 10px" v-if="formData.start_remark">
      <view class="desc" style="text-align: justify">
        <view class="text-content-text text-black">
          <view v-html="
              JSON.parse(
                JSON.stringify(formData.start_remark).replace(
                  /\<img/gi,
                  '<img width=100%  '
                )
              )
            ">
          </view>
        </view>
      </view>
    </view>
    <view class="content form-wrap" style="box-sizing: border-box">
      <bxform ref="bxform" :fields="configCols" label-position="top" option-mode="normal" pageType="add"
        @value-blur="saveValue"></bxform>
    </view>
    <view class="content" style="padding: 10px" v-if="formData.end_remark">
      <view class="desc">
        <view class="text-content-text">
          <view v-html="
              JSON.parse(
                JSON.stringify(formData.end_remark).replace(
                  /\<img/gi,
                  '<img width=100%'
                )
              )
            ">
          </view>
        </view>
      </view>
    </view>
    <view class="button-box" v-if="
        formType === 'form' &&
        configCols &&
        configCols.length > 0 &&
        (formData['user_state'] === '未完成' ||
          formData['answer_times'] === '多次')
      ">
      <button class="button" type="" @click="submitForm()">提交</button>
    </view>
    <view class="button-box" v-if="
        formType === 'detail' &&
        configCols &&
        configCols.length > 0 &&
        formData.info_collect_type === '评估' &&
        formData.user_state === '完成' &&
        fill_batch_no
      ">
      <button class="button cu-btn" type="" @click="seeReport()">
        查看评估结果
      </button>
    </view>
    <view class="button-box" v-if="
        formType === 'detail' &&
        configCols &&
        configCols.length > 0 &&
        formData.info_collect_type === '自测' &&
        formData.user_state === '完成' &&
        fill_batch_no
      ">
      <button class="button cu-btn" type="" @click="seeScore" v-if="!scoreInfo.score && scoreInfo.score !== 0">
        查看分数
      </button>
      <view class="score-box" v-if="scoreInfo.score || scoreInfo.score === 0">
        得分：
        <view class="score">{{
          scoreInfo.score === 0 ? "0" : scoreInfo.score
        }}</view>
      </view>
    </view>
    <view class="button-box"
      v-if="showNextBtn&&isShowOrder===activity_no&&!['20211008104446000006', '20210929120256000001', '20211027112223000007'].includes(activity_no)">
      <button class="button cu-btn" @click="toNextPages"
        v-if="params&&params.button_name">{{params.button_name}}</button>
      <button class="button cu-btn" @click="toNextPages" v-else>下一步</button>
    </view>

    <view class="cu-modal" :class="{show:showDialog}">
      <view class="cu-dialog padding" @click.stop="">
        <view class="dialog-title text-bold padding-sm text-lg">
          <image src="../static/error.png" style="width: 30px;height: 30px;"></image>
          <text class="text">提示</text>
        </view>
        <view class="dialog-content text-bold">
          <!-- <image src="../static/error.png" style="width: 30px;height: 30px;"></image> -->
          <!-- <text class="cuIcon-info text-red margin-right-xs text-lg"></text> -->
          <text class="text">{{dialogContent||''}}</text>
        </view>
        <view class="dialog-button margin-tb-xs">
          <view class="button-box"
            v-if="showNextBtn&&isShowOrder===activity_no&&['20211008104446000006', '20210929120256000001', '20211027112223000007'].includes(activity_no)">
            <button class="button cu-btn" @click="toNextPages"
              v-if="params&&params.button_name">{{params.button_name}}</button>
            <button class="button cu-btn" @click="toNextPages" v-else>下一步</button>
          </view>
          <!-- <button class="cu-btn bg-blue" type="primary">{{params}}</button> -->
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import bxform from '@/components/a-form/a-form.vue';
  import {
    mapState
  } from 'vuex';

  export default {
    name: 'questionnaire', //问卷答题页面
    components: {
      bxform
    },
    data() {
      return {
        appName: 'daq',
        emptyText: '', //无数据时提示文字
        formType: 'form', // 表单类型 预览:detail 正常:form
        activity_no: '', // 问卷编号
        playNo: '',
        status: '未开始',
        target: '',
        configCols: [],
        resultData: {},
        formData: {
          title: '', // 标题
          remark: '', //欢迎语
          end_remark: '' //结束语
        },
        // userInfo: {}, // 登录用户信息
        wxUserInfo: {}, // 微信用户信息
        questionData: {},
        fill_batch_no: '', //活动批次编号
        scoreInfo: {}, // 得分情况
        params: {},
        showNextBtn: false,
        queue_no: "",
        store_no: "",
        showDialog: false,
        dialogContent: "",
      };
    },
    props: {
      activityNo: {
        type: String,
        default: ''
      },
      comfromType: {
        type: String,
        default: ''
      }
    },
    computed: {
      isShowOrder() {
        // 是否显示预定按钮
        if (this.formType !== 'detail') {
          return false
        }
        let questArr = ['20211008104446000006', '20210929120256000001', '20211027112223000007']
        if (questArr.includes(this.activity_no)) {
          if (this.activity_no === '20210929120256000001') {
            // stop bang
            let num = Object.keys(this.resultData).reduce((res, cur) => {
              if (this.resultData[cur] && this.resultData[cur].indexOf('是') !== -1) {
                res++
              }
              return res
            }, 0)
            if (num >= 3) {
              return this.activity_no
            } else return true
          } else if (this.activity_no === '20211008104446000006') {
            // ESS 嗜睡問卷調查
            let score = Object.keys(this.resultData).reduce((res, cur) => {
              if (this.resultData[cur] && this.resultData[cur].indexOf('很少') !== -1) {
                res += 1
              } else if (this.resultData[cur] && this.resultData[cur].indexOf('一半以上') !== -1) {
                res += 2
              } else if (this.resultData[cur] && this.resultData[cur].indexOf('几乎都会') !== -1) {
                res += 3
              }
              return res
            }, 0)
            if (score > 12) {
              return this.activity_no
            } else return true
          } else if (this.activity_no === '20211027112223000007') {
            // 肺病筛查
            let score = Object.keys(this.resultData).reduce((res, cur) => {
              let val = this.resultData[cur]
              if (val) {
                if (val.indexOf('有时感觉气短') !== -1 || val.indexOf('每月都咳几天') !== -1 || val.indexOf('大多数日子都咳') !== -1 ||
                  val.indexOf('同意') !== -1) {
                  res += 1
                } else if (val.indexOf('经常感觉气短') !== -1 || val.indexOf('总是感觉气短') !== -1 || val.indexOf('每天都咳') !== -
                  1 || val.indexOf('非常同意') !== -1 || val === '是' || val.indexOf('50') !== -1) {
                  res += 2
                }
              }
              return res
            }, 0)
            if (score >= 5) {
              return this.activity_no
            } else return true
          }
        } else {
          return this.activity_no
        }
      },
      ...mapState({
        storeInfo: state => state.app.storeInfo,
        userInfo: state => state.user.userInfo,
        globalTextFontSize: state => state.app['globalTextFontSize']
      })
    },
    watch: {
      isShowOrder(newValue, oldValue) {
        if (this.activity_no === '20211027112223000007' && newValue === this.activity_no) {
          // 肺病筛查
          let confirmText = this.params?.button_name || '确定'
          this.dialogContent = '评测分数大于等于5，您的呼吸问题可能是慢性阻塞性肺疾病(COPD)导致。'
          this.showDialog = true;
        } else if (this.activity_no === '20211008104446000006' && newValue === this.activity_no) {
          // ESS 嗜睡問卷調查
          let confirmText = this.params?.button_name || '确定'
          this.dialogContent = '您可能患有睡眠呼吸暂停，建议您做进一步预约，用专业的筛查设备进行睡眠筛查。'
          this.showDialog = true;
        } else if (this.activity_no === '20210929120256000001' && newValue === this.activity_no) {
          // stop bang
          let confirmText = this.params?.button_name || '确定'
          this.dialogContent = '有三项及以上回答为是，符合OSAS高危人群的特征'
          this.showDialog = true;
        } else if (['20210929120256000001', '20211008104446000006', '20211027112223000007'].includes(this
            .activity_no)) {
          if (newValue == true) {
            if (this.activity_no === '20211027112223000007') {
              uni.showModal({
                title: '提示',
                content: '您的呼吸系统良好，继续保持，祝您健康！',
                showCancel: false
              })
            } else {
              uni.showModal({
                title: '提示',
                content: '健康状况良好',
                showCancel: false
              })
            }
          }
        }
      },
      activityNo(newValue, oldValue) {
        if (this.activityNo) {
          this.emptyText = '正在请求问卷配置数据';
          setTimeout(() => {
            this.emptyText = '未找到问卷配置数据';
          }, 3000);
          this.formType = this.comfromType;
          this.status = '进行中';
          this.activity_no = this.activityNo;
          this.getQuestionnaireData();
        }
      }
    },
    methods: {
      calcScore(resultData) {
        let questArr = ['20211008104446000006', '20210929120256000001', '20211027112223000007']
        if (questArr.includes(this.activity_no)) {
          if (this.activity_no === '20210929120256000001') {
            // stop bang
            let num = Object.keys(resultData).reduce((res, cur) => {
              if (resultData[cur] && resultData[cur].indexOf('是') !== -1) {
                res++
              }
              return res
            }, 0)
            if (num >= 3) {
              return '有三项及以上回答为是，符合OSAS高危人群的特征'
            }
          } else if (this.activity_no === '20211008104446000006') {
            // ESS 嗜睡問卷調查
            let score = Object.keys(resultData).reduce((res, cur) => {
              if (resultData[cur] && resultData[cur].indexOf('很少') !== -1) {
                res += 1
              } else if (resultData[cur] && resultData[cur].indexOf('一半以上') !== -1) {
                res += 2
              } else if (resultData[cur] && resultData[cur].indexOf('几乎都会') !== -1) {
                res += 3
              }
              return res
            }, 0)
            if (score > 12) {
              return '您可能患有睡眠呼吸暂停，建议您做进一步预约，用专业的筛查设备进行睡眠筛查。'
            }
          } else if (this.activity_no === '20211027112223000007') {
            // 肺病筛查
            let score = Object.keys(resultData).reduce((res, cur) => {
              let val = resultData[cur]
              if (val) {
                if (val.indexOf('有时感觉气短') !== -1 || val.indexOf('每月都咳几天') !== -1 || val.indexOf('大多数日子都咳') !== -1 ||
                  val.indexOf('同意') !== -1) {
                  res += 1
                } else if (val.indexOf('经常感觉气短') !== -1 || val.indexOf('总是感觉气短') !== -1 || val.indexOf('每天都咳') !== -
                  1 || val.indexOf('非常同意') !== -1 || val === '是' || val.indexOf('50') !== -1) {
                  res += 2
                }
              }
              return res
            }, 0)
            if (score >= 5) {
              return '评测分数大于等于5，您的呼吸问题可能是慢性阻塞性肺疾病(COPD)导致。'
            }
          } else {
            return '健康状况良好'
          }
        }

      },
      toNextPages() {
        if (this.params && typeof this.params === 'object') {} else {
          return
        }
        let params = this.deepClone(this.params);
        let fieldsCond = params.fieldsCond || [];
        if (this.planNo) {
          fieldsCond.push({
            column: 'ps_no',
            display: false,
            value: this.planNo
          })
        } else {
          // fieldsCond.push({
          //   column: 'ps_no',
          //   display: false
          // })
        }

        if (fieldsCond.findIndex(item => item.column === 'report_daq_survey_ack_no') !== -1) {
          fieldsCond[fieldsCond.findIndex(item => item.column === 'report_daq_survey_ack_no')].value = params
            .fill_batch_no
        }
        if (params.to) {
          let obj = {
            storeInfo: this.storeInfo,
            userInfo: this.userInfo,
            bindUserInfo: this.$store?.state?.user?.storeUserInfo
          }
          try {
            params.to = decodeURIComponent(params.to)
          } catch (e) {
            //TODO handle the exception
          }
          params.to = this.renderStr(params.to, obj)
          params.to += `&fill_batch_no=${this.params.fill_batch_no}`
        }

        let url = `${params.to}`;
        if (fieldsCond && fieldsCond.length > 0) {
          url += `&fieldsCond=${encodeURIComponent(JSON.stringify(fieldsCond))}`
        }
        if (this.planNo) {
          url += `&planNo=${this.planNo}`;
        }

        let navTypes = ['navigateTo', 'redirectTo', 'reLaunch']
        if (this.params.nav_type && navTypes.includes(this.params.nav_type)) {
          uni[this.params.nav_type]({
            url: url
          })
        } else {
          uni.redirectTo({
            url: url
          });
        }
      },
      toHistory() {
        uni.navigateTo({
          url: '/questionnaire/history/history?activity_no=' + this.activity_no + '&title=' + this
            .formData.title
        });
      },
      seeScore() {
        // 自测题 查看分数
        let fill_batch_no = this.fill_batch_no;
        let activity_no = this.activity_no;
        const serviceName = 'srvdaq_record_reply_select';
        const url = this.getServiceUrl(this.appName ? this.appName : 'daq', serviceName, 'select');
        const req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: this.activity_no
            },
            {
              colName: 'fill_batch_no', // 批次号
              ruleType: 'eq',
              value: this.fill_batch_no
            }
          ]
        };
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS' && Array.isArray(res.data.data) && res.data.data.length > 0) {
            this.scoreInfo = res.data.data[0];
          }
        });
      },
      async seeReport() {
        // 查看评估结果
        uni.navigateTo({
          url: `/questionnaire/assessmentResult/assessmentResult?activity_no=${this.activity_no}&fill_batch_no=${this.fill_batch_no}`
        });
      },
      toFeedback() {
        // 跳转到意见反馈问卷
        uni.redirectTo({
          url: '/questionnaire/index/index?formType=form&activity_no=20200309125000000100&status=进行中'
        });
      },
      saveValue(e) {
        let self = this;
        if (e.value && this.status === '进行中') {
          let itemData = [{
            item_no: e.column,
            option_data: [e.value]
          }];
          if (e.type === 'checkbox') {
            itemData = [{
              item_no: e.column,
              option_data: e.value
            }];
          }
          if (Array.isArray(e.value)) {
            itemData = [{
              item_no: e.column,
              option_data: e.value.filter(i => i && i)
            }];
          }
          const serviceName = 'srvdaq_activity_result_save';
          const url = this.getServiceUrl('daq', serviceName, 'operate');
          let req = [{
            serviceName: serviceName,
            data: [{
              activity_no: this.activity_no,
              item_data: itemData
            }]
          }];
          if (self.fill_batch_no) {
            req[0].data[0].fill_batch_no = self.fill_batch_no;
          }
          self.$http.post(url, req).then(res => {
            if (res.data.state === 'SUCCESS') {
              console.log(res.data.response[0].response);
              let data = res.data.response[0].response;
              if (data.fill_batch_no && !self.fill_batch_no) {
                self.fill_batch_no = data.fill_batch_no;
                uni.setStorageSync('fill_batch_no', self.fill_batch_no);
              }
            } else {
              console.log(res);
            }
          });
        }
      },
      submitForm() {
        let self = this;
        let itemData = self.$refs.bxform.getFieldModel();
        if (itemData !== false) {
          uni.showModal({
            title: '提示',
            content: '确认提交问卷?',
            success: function(res) {
              if (res.confirm) {
                if (self.status !== '进行中') {
                  uni.showToast({
                    title: '状态非进行中的问卷不支持提交',
                    icon: 'none'
                  });
                } else {
                  console.log('itemData', itemData);
                  let resultData = [];
                  self.resultData = itemData
                  Object.keys(itemData).forEach(item => {
                    let obj = {
                      item_no: item,
                      option_data: [itemData[item]]
                    };
                    if (Array.isArray(itemData[item])) {
                      obj.option_data = itemData[item].filter(i => i && i);
                    }
                    if (itemData[item]) {
                      resultData.push(obj);
                    }
                  });
                  console.log(self.dialogContent, 'dialogContent')
                  let survey_result = self.calcScore(itemData)
                  let serviceName = 'srvdaq_activity_result_submit';
                  const url = self.getServiceUrl(self.appName ? self.appName : 'daq',
                    serviceName, 'operate');
                  let req = [{
                    serviceName: serviceName,
                    data: [{
                      fill_batch_no: self.fill_batch_no,
                      activity_no: self.activity_no,
                      survey_result: survey_result,
                      user_name: self.userInfo?.name || self.userInfo?.nick_name,
                      user_phone: self.userInfo?.phone || self.userInfo?.phone_xcx,
                      item_data: resultData
                    }]
                  }];
                  console.log('resultData', resultData);
                  self.$http.post(url, req).then(res => {
                    if (res.data.state === 'SUCCESS') {
                      if (res.data.resultCode === 'SUCCESS') {
                        uni.showToast({
                          title: '提交成功',
                          icon: 'none'
                        });

                        self.formType = 'detail';
                        self.getQuestionnaireData(self.formData);

                        if (Array.isArray(res.data.response) && res.data
                          .response.length > 0 && res.data.response[0]
                          .response && res.data.response[0].response
                          .fill_batch_no) {
                          self.params.fill_batch_no = res.data.response[0]
                            .response.fill_batch_no;
                        }
                        if (self.params.to && self.params.fill_batch_no) {
                          self.showNextBtn = true;
                        } else if (self.target === 'queue' && self.params.fill_batch_no && self.queue_no &&
                          self.store_no) {
                          uni.redirectTo({
                            url: `/storePages/queue/queue?fill_batch_no=${self.params.fill_batch_no}&queue_no=${self.queue_no}&store_no=${self.store_no}`
                          })
                        } else {
                          uni.showModal({
                            title: '提示',
                            content: self.formData.submitted_tip ||
                              '提交成功！',
                            showCancel: false,
                            success(res) {
                              if (res.confirm) {
                                // uni.navigateBack()
                              }
                            }
                          })
                        }
                      }
                    } else {
                      uni.showToast({
                        title: res.data.resultMessage,
                        icon: 'none'
                      });
                    }
                    console.log(res);
                  });
                }
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        }
      },
      getQuestionnaireData(questionData) {
        // 获取问卷数据
        let that = this;
        const serviceName = 'srvdaq_init_view_select';
        const url = this.getServiceUrl(this.appName ? this.appName : 'daq', serviceName, 'select');
        const req = {
          serviceName: serviceName,
          colNames: ['*'],
          order: [{
            colName: 'item_seq',
            orderType: 'asc'
          }],
          condition: [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: this.activity_no
            },
            {
              colName: 'type', // 查看视图初始化
              ruleType: 'eq',
              value: 'use'
            }
          ]
        };
        if (this.status === '未开始') {
          req.condition = [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: this.activity_no
            },
            {
              colName: 'biz_type',
              ruleType: 'eq',
              value: 'cfg'
            }
          ];
        }
        if (questionData && questionData.fill_batch_no) {
          req.condition = [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: questionData.activity_no
            },
            {
              colName: 'type',
              ruleType: 'eq',
              value: 'use'
            },
            {
              colName: 'fill_batch_no',
              ruleType: 'eq',
              value: questionData.fill_batch_no
            }
          ];
        }
        if (this.activity_no && this.fill_batch_no) {
          req.condition = [{
              colName: 'activity_no',
              ruleType: 'eq',
              value: this.activity_no
            },
            {
              colName: 'type',
              ruleType: 'eq',
              value: 'use'
            },
            {
              colName: 'fill_batch_no',
              ruleType: 'eq',
              value: this.fill_batch_no
            }
          ];
        }
        this.$http.post(url, req).then(res => {
          if (res.data.state === 'SUCCESS') {
            const data = res.data.data[0];
            this.activity_no = data.activity_no;
            let configCols = [];
            data.item_data.forEach(item => {
              configCols.push(this.getConfig(item));
            });
            if (data.logo) {
              this.getPicture(data.logo).then(url => {
                this.$set(this.formData, 'fileUrl', url);
              });
            }
            if (data.user_data) {
              if (this.params && this.params.emptyValue) {
                // 不填充默认值
              } else {
                configCols.forEach(item => {
                  if (this.formType === 'detail') {
                    item.disabled = true;
                  }
                  item.options = item.options.map(op => {
                    op.checked = false
                    return op
                  })
                  data.user_data.forEach(items => {
                    if (item.column === items.item_no) {
                      if (item.item_type_attr && item.item_type_attr
                        .radioType === 'multi') {
                        item.value = items.option_data ? items.option_data
                          .toString() : '';
                        item.options = item.options.map(op => {
                          if (item.value.indexOf(op.value) !== -
                            1) {
                            op.checked = true
                          }
                          return op
                        })
                      } else {
                        item.value = items.option_data[0];
                      }
                    }
                  });
                });
              }
            }
            this.formData = data;
            if (data.title) {
              uni.setNavigationBarTitle({
                title: data.title
              });
            }
            if (data.user_state === '完成' && data.answer_times !== '多次') {
              this.formType = 'detail';
            }
            configCols.forEach((item, index) => {
              item.iconSize = 28;
              item.itemIndex = index + 1;
              if (item.label && item.label.slice(0, 1) != (index + 1).toString() && item
                .label.slice(0, 2) != (index + 1).toString()) {
                item.label = (index + 1).toString() + '.' + item.label;
              }
              if (item.type === 'digit' && item.item_type_attr.decimal && item.value) {
                item.value = Number(item.value).toFixed(item.item_type_attr.decimal);
              } else if (item.type === 'digit' && !item.item_type_attr.decimal && item
                .value) {
                item.value = Number(item.value).toFixed(1);
              } else if (item.type === 'number' && item.value) {
                item.value = parseInt(item.value).toString() !== 'NaN' ? parseInt(item
                  .value) : 0;
              }
            });
            this.configCols = configCols;
            this.getUserInfo();
          } else if (res.data.resultCode === '0011') {
            uni.showToast({
              title: '未登录',
              icon: 'none'
            });
          } else if (res.data.resultCode === 'FAILURE') {
            uni.showToast({
              title: res.data.resultMessage,
              icon: 'none'
            });
            if (res.data.resultMessage === '活动已结束') {
              this.updateState().then(response => {
                uni.showModal({
                  title: '提示',
                  content: res.data.resultMessage + ',即将跳转到列表页面',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      uni.navigateBack({
                        animationDuration: 2000
                      });
                    }
                  }
                });
              });
            }
          }
        });
      },
      async updateState(e) {
        let reqData = [{
          status: '已结束'
        }];
        let url = this.getServiceUrl(this.appName ? this.appName : 'daq', 'srvdaq_activity_cfg_update',
          'operate');
        let req = [{
          serviceName: 'srvdaq_activity_cfg_update',
          data: reqData,
          condition: [{
            colName: 'activity_no',
            ruleType: 'eq',
            value: this.activity_no
          }]
        }];
        let response = await this.$http.post(url, req);
        return response;
      },
      async getUserInfo() {
        // 获取微信账号信息
        let url = this.$api.getUserInfo;
        let req = {
          serviceName: 'srvwx_basic_user_info_select',
          colNames: ['*'],
          condition: [{
            colName: 'app_no',
            ruleType: 'eq',
            value: this.$api.appNo.wxh5
          }]
        };
        let res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          const userInfo = res.data.data[0];
          this.wxUserInfo = userInfo;
          uni.setStorageSync('wxUserInfo', userInfo);
        } else {
          uni.showToast({
            title: '未获取到当前微信用户信息',
            icon: 'none'
          });
        }
      },
      async getPicture(file_no) {
        const serviceName = 'srvfile_attachment_select';
        const url = this.getServiceUrl('file', serviceName, 'select');
        const req = {
          serviceName: serviceName,
          colNames: ['*'],
          condition: [{
            colName: 'file_no',
            value: file_no,
            ruleType: 'eq'
          }]
        };
        req.colNames = ["columns", "fileurlsmall", "remark", "table_name", "src_name", "file_no", "file_size",
          "file_type", "fileurl", "id", "app_no"
        ]

        if (file_no !== null && file_no !== '' && file_no !== undefined) {
          let res = await this.$http.post(url, req);
          if (res.data.state === 'SUCCESS') {
            const data = res.data.data[0];
            if (data) {
              const fileurl = this.$api.fileSrv + '/file/download?filePath=' + data.fileurl;
              return fileurl;
            }
          }
        }
      },
      getConfig(e) {
        let config = {
          label: e.item_title,
          column: e.item_no,
          columns: e.item_no,
          in_add: 1,
          srvInfo: {
            serviceName: 'srvdaq_activity_result_submit',
            appNo: this.appName ? this.appName : 'daq'
          },
          value: e.value || '',
          type: e.item_type,
          isRequire: e.is_require === '是' ? true : false,
          isShowExp: [],
          options: [],
          item_type_attr: e.item_type_attr,
          display: true,
          points: e.points,
          answer: e.answer,
          option_img_explain: e.option_img_explain,
          _rawData: e,
          option_list_v2: e.option_list_v2
        };
        if (this.formType === 'detail') {
          config.disabled = true;
        }
        switch (e.item_type) {
          case '文本':
            // config.type = e.item_type_attr['view_model'] === 'textarea' ? 'textarea' : 'input';
            config.type = e.item_type_attr['view_model'] === 'textarea' ? 'textarea' : 'text';
            break;
          case '图片':
            config.type = 'images';
            config['fileNum'] = e.item_type_attr['fileNum'];
            break;
          case '选项':
            config.type = e.item_type_attr.radioType && e.item_type_attr.radioType === 'multi' ? 'checkboxFk' :
              'radioFk';
            config.options = e.option_data.map((item, optIndex) => {
              item.color = '#0bc99d';
              item.value = item.option_value;
              item.showimg = false;
              item.checked = false
              item.label = item.option_value;
              if (item.option_view_no) {
                item.serialChar = item.option_view_no;
              } else if (item.option_seq) {
                item.serialChar = item.option_seq;
              } else {
                item.serialChar = optIndex;
              }
              return item;
            });
            break;
          case '时间日期':
            config.type = e.item_type_attr.dateType ? e.item_type_attr.dateType : 'date';
            // config.type = e.item_type_attr.dateType ? e.item_type_attr.dateType : 'dateTime';
            break;
          case '数字':
            config.type = e.item_type_attr.numberType ? e.item_type_attr.numberType : 'number';
            break;
          case '地址':
            config.type = 'cascader';
            config.srvInfo = {
              serviceName: 'srvconfig_area_adj_select',
              appNo: 'config',
              isTree: true,
              column: 'no',
              showCol: 'path_name' //要展示的字段
            };
            break;
          case '引用':
            config.type = 'Selector';
            // config.type = 'treeSelector';
            config.option_list_v2 = {
              refed_col: e.item_type_attr.refed_col,
              srv_app: e.item_type_attr.srv_app,
              serviceName: e.item_type_attr.serviceName,
              key_disp_col: e.item_type_attr.key_disp_col
            };
            break;
          default:
            config.type = e.item_type;
            break;
        }
        return config;
      },
      saveShareRecord(share_type) {
        let url = this.$api.saveShareRecord;
        let req = [{
          serviceName: 'srvdaq_record_share_add',
          data: [{
            biz_no: this.activity_no,
            biz_type: this.appName ? this.appName : 'daq',
            share_url: window.location.href,
            from_user: this.userInfo.user_no,
            share_type: share_type ? share_type : '朋友圈'
          }]
        }];
        this.$http.post(url, req).then(res => {
          console.log(res);
        });
      },
      getParams(name) {
        let str = window.location.href;
        str = str.split('?')[1];
        let arr = str.split('&');
        let obj = {};
        arr.forEach(item => {
          obj[item.split('=')[0]] = item.split('=')[1];
        });
        if (obj[name]) {
          return obj[name];
        } else {
          return false;
        }
      }
    },
    beforeDestroy() {
      uni.setStorageSync('fill_batch_no', '');
    },
    mounted() {
      if (this.activityNo) {
        this.emptyText = '正在请求问卷配置数据';
        setTimeout(() => {
          this.emptyText = '未找到问卷配置数据';
        }, 3000);
        this.formType = this.comfromType;
        this.status = '进行中';
        this.activity_no = this.activityNo;
        this.getQuestionnaireData();
      }
    },
    onShareAppMessage() {
      let path =
        `/questionnaire/index/index?formType=form&activity_no=${this.activity_no}&status=进行中`;
      if (this.userInfo && this.userInfo.userno) {
        path += `&invite_user_no=${this.userInfo.userno}`
      }
      let imageUrl = this.getImagePath(this.storeInfo.image, true);
      if (this.storeInfo?.logo) {
        imageUrl = this.getImagePath(this.storeInfo.logo, true);
      }
      this.saveSharerInfo(this.userInfo, path);
      let title = this.formData.title
      title = this.renderEmoji(title)
      return {
        title,
        path: path,
        imageUrl: imageUrl,
      };
    },
    async onLoad(option) {
      // #ifdef MP-WEIXIN
      await this.initApp(option)
      //#endif
      // #ifdef MP-WEIXIN
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage']
      });
      // #endif
      if (option.planNo) {
        this.planNo = option.planNo;
      }
      if (option.params) {
        try {
          // #ifdef MP-WEIXIN
          this.params = JSON.parse(option.params);
          // #endif
          // #ifdef H5
          this.params = JSON.parse(decodeURIComponent(option.params));
          // #endif
        } catch (e) {
          //TODO handle the exception
          console.log(e)
        }
      }
      this.emptyText = '正在请求问卷配置数据';
      setTimeout(() => {
        this.emptyText = '未找到问卷配置数据';
      }, 3000);
      if (option.formType && option.formType === 'detail') {
        this.formType = option.formType;
      } else {
        this.formType = 'form';
      }
      if (option.from) {
        this.target = option.from;
        this.queue_no = option.queue_no
        this.store_no = option.store_no
      }
      if (option.fill_batch_no) {
        this.fill_batch_no = option.fill_batch_no;
      }
      let questionData = option.questionData;
      if (questionData) {
        questionData = JSON.parse(decodeURIComponent(option.questionData));
      }
      await this.toAddPage()
      if (questionData && questionData.fill_batch_no) {
        this.formType = 'detail';
        this.questionData = questionData;
        this.getQuestionnaireData(this.questionData);
      } else {
        if (option.status) {
          this.status = decodeURIComponent(option.status);
          console.log('status', this.status);
        }
        if (option.activity_no) {
          this.activity_no = option.activity_no;
          this.getQuestionnaireData();
        } else if (this.questionData.activity_no) {
          this.status = '已完成';
          this.activity_no = this.questionData.activity_no;
          this.getQuestionnaireData();
        } else {
          uni.showModal({
            title: '提示',
            content: '未知的问卷编号，即将返回上个页面',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                uni.navigateBack({});
              }
            }
          });
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .page-wrap {
    background-color: #fff;
    overflow: scroll;
  }

  .content {
    width: 100%;

    .desc {
      width: 100%;
    }

    .date-box {
      color: #0bc99d;
      padding: 20rpx 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }

  .to-history {
    text-align: center;
    color: #0bc99d;
    position: relative;
    margin: 20rpx 0 0;

    &::before {
      content: "";
      position: absolute;
      width: 25%;
      height: 1px;
      background-color: #0bc99d;
      top: 50%;
      left: 50rpx;
    }

    &::after {
      content: "";
      position: absolute;
      width: 25%;
      height: 1px;
      background-color: #0bc99d;
      top: 50%;
      right: 50rpx;
    }
  }

  .button-box {
    display: flex;
    justify-content: center;
    padding: 30rpx;

    .button {
      color: #fff;
      background-color: #0bc99d;
      height: 60rpx;
      line-height: 60rpx;
      min-width: 45%;
    }
  }

  .question-title {
    min-height: 100rpx;
    color: #333;
    font-weight: 700;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-button {
    background-color: #fff;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20rpx 0 40rpx;

    .foot-btn {
      color: #0bc99d;
      height: 40upx;
      line-height: 40upx;
      border-bottom: 1px solid #0bc99d;
    }
  }

  .text-content-text1 {
    background-color: #f8f8f8;
    padding: 20rpx;
    border-radius: 5px;
  }

  .text-content-text {
    color: #666;
    width: 100%;
    min-height: 100rpx;
    height: auto;
    margin: 0;
    display: flex;
    flex-direction: column;
    color: #666;
    padding: 20rpx;
    border-left: 4px solid #cbcbcb;
    background-color: #f8f8f8;
    font-size: 30rpx;
    color: #666;
  }

  .cu-modal.bottom-modal {
    color: #333;

    .cu-dialog {
      height: auto;
    }
  }

  .dialog-content,
  .dialog-title {
    display: flex;
    align-items: center;

    .text {
      flex: 1;
      text-align: left;
      margin-left: 10px;
    }
  }

  .score-box {
    height: 100rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333;

    .score {
      padding: 0 20rpx;
      font-size: 60rpx;
      font-weight: 700;
    }
  }

  .u-empty {
    height: 100%;
  }
</style>
