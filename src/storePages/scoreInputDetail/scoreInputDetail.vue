<template>
  <view>
    <view class="page-title bg-white" v-if="query">
      <view class="left text-blue" @click="changeModal('editInfo')">
        {{leftText||''}}
      </view>
      <view class="right" v-if="">
        <picker @change="levleChange" mode="selector" :value="level" :range="levelData">
          <text class="margin-left text-blue"> {{rightText}}<text class="cuIcon-unfold margin-left-xs"></text> </text>
        </picker>
      </view>
    </view>
    <view class="card-list">
      <u-empty v-if="isLoad&&list.length==0" text="暂无数据" style="margin-top: 20vh;"></u-empty>
      <view class="card-item" v-for="item in list" @click="toDetail(item)">
        <view class="left" :class="[item.bg]">
          {{item.text}}
        </view>
        <view class="content">
          <view class="title">
            <view class="" :class="[item.bg]">
              {{item.title}}
            </view>
            <!--   <view class="tips" v-if="item.needVip">
              VIP可查看
            </view> -->
          </view>

          <view class="desc">
            {{item.desc}}
          </view>
        </view>
        <view class="right">
          <text class="number">{{item.amount}}</text><text>所</text><text class="cuIcon-right"></text>
        </view>
      </view>
    </view>


    <view class="cu-modal bottom-modal" :class="{show:modalName ==='editInfo'}" @click="changeModal()">
      <view class="cu-dialog" @click.stop="">
        <view class="title text-lg text-bold bg-white text-black padding-tb">
          完善信息
        </view>
        <view class="cu-form-group ">
          <view class="title text-bold">高考省份</view>
          <picker class="align-start flex" mode="selector" v-model="form.region" :range-key="'name'"
            :range="regionData">
            {{form.regionName||'请选择省份'}}
          </picker>
          <text class="cuIcon-right"></text>
        </view>
        <view class="cu-form-group ">
          <view class="title text-bold">选择科目</view>
          <picker class="align-start flex" mode="selector" v-model="form.subject" :range="subjectData">
            {{form.subject||'请选择科目'}}
          </picker>
          <text class="cuIcon-right"></text>
        </view>
        <view class="cu-form-group ">
          <view class="title text-bold">高考分数</view>
          <input class="align-start flex" placeholder="输入分数" name="input" v-model="form.score"
            @confirm="queryRank" @blur="queryRank"></input>
          <text class="cuIcon-edit"></text>
        </view>
        <view class="cu-form-group ">
          <view class="title text-bold">高考排名</view>
          <input class="align-start flex" placeholder="输入排名" name="input" v-model="form.rank"></input>
          <text class="cuIcon-edit"></text>
        </view>
        <button class="cu-btn bg-blue margin-tb" style="width: 50%;" @click="confirmInfo">完成</button>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    regionData
  } from '../static/province.js'
  export default {
    data() {
      return {
        form: {
          regionName: "", //省份
          score: "",
          subject: "", //文、理
        },
        subjectData: ['文', '理'],
        regionData: regionData,
        modalName: '',
        query: null,
        isLoad: false,
        level: 0,
        list: [],
        levelData: ['全部', '本科一批', '本科二批', '专科']
      }
    },
    computed: {
      leftText() {
        if (this.query) {
          if (this.query?.regionName && this.query?.score && this.query?.subject) {
            return `${this.query?.regionName}/${this.query?.subject}科/${this.query?.score}分`
          }
        }
        return ''
      },
      rightText() {
        return this.query?.level || ''
      },
    },
    onLoad(option) {
      if (option.query) {
        try {
          this.query = JSON.parse(option.query)
          this.form = JSON.parse(option.query)
          this.form.region = this.regionData.findIndex(item => item.code === this.form.region)
          this.getList()
        } catch (e) {
          //TODO handle the exception
        }
      }
    },
    methods: {
      async queryRank(e) {
        let value = e?.detail?.value;
        if (value && !isNaN(Number(value))) {
          value = Number(value)
          let between = [value - 3, value + 3]
          const url = `/person/select/srvuee_pro_score_select`
          const req = {
            "serviceName": "srvuee_pro_score_select",
            "colNames": ["*"],
            "condition": [{
              "colName": "avg_score",
              "ruleType": "between",
              "value": between
            }],
            "page": {
              "pageNo": 1,
              "rownumber": 1
            }
          }
          const res = await this.$http.post(url, req);
          if (res?.data?.state === 'SUCCESS' && Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
            this.form.rank = res.data.data[0].lowest_quantile
          }
        }
      },
      confirmInfo() {
        this.form.regionName = this.regionData[this.form.region].name
        Object.keys(this.form).forEach(key => {
          this.query[key] = this.form[key]
        })
        this.changeModal()
        this.getList()
      },
      levleChange(e) {
        if (this.query) {
          this.query.level = this.levelData[e?.detail?.value]
          this.form.level = this.levelData[e?.detail?.value]
          this.getList()
        }
      },
      changeModal(e) {
        this.modalName = e
      },
      toDetail(e) {

        let condition = [{
            colName: 'score_status',
            "ruleType": "eq",
            "value": e?.score_status
          },
          {
            "colName": "user_province",
            "ruleType": "eq",
            "value": this.query.regionName
          },
          {
            "colName": "score_postiton",
            "ruleType": "eq",
            "value": this.query.rank
          },
          {
            "colName": "user_score",
            "ruleType": "eq",
            "value": this.query.score
          },
          {
            "colName": "user_branch",
            "ruleType": "eq",
            "value": this.query.subject + '科'
          }
        ]
        // if (this.query.level !== '全部') {
        condition.push({
          "colName": "user_batch",
          "ruleType": "eq",
          "value": this.query.level || '全部'
          // .query.level
        })
        // }

        let url =
          `/publicPages/list2/list2?destApp=person&disabled=true&serviceName=srvuee_college_score_ana_list_select&cond=${JSON.stringify(condition)}`
        uni.navigateTo({
          url
        })
      },
      async getList() {
        const url = `/person/select/srvuee_college_score_ana_sum_select `
        const req = {
          "serviceName": "srvuee_college_score_ana_sum_select",
          "colNames": ["*"],
          "condition": [{
              "colName": "user_province",
              "ruleType": "eq",
              "value": this.query.regionName
            },
            {
              "colName": "score_postiton",
              "ruleType": "eq",
              "value": this.query.rank
            },
            {
              "colName": "user_score",
              "ruleType": "eq",
              "value": this.query.score
            },
            {
              "colName": "user_branch",
              "ruleType": "eq",
              "value": this.query.subject + '科'
            }
          ],
          "page": {
            "pageNo": 1,
            "rownumber": 5
          }
        }
        // if (this.query.level !== '全部') {
        req.condition.push({
          "colName": "user_batch",
          "ruleType": "eq",
          // "value": '全部'
          value: this.query.level || '全部'
        })
        // }
        const res = await this.$http.post(url, req);
        this.isLoad = true
        if (res?.data?.state === 'SUCCESS') {
          if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
            // uni.showToast({
            //   title:'加载成功',

            // })
            this.list = res.data.data.map(item => {
              switch (item.score_status) {
                case '可保底':
                  item.text = '保'
                  item.bg = 'green'
                  item.needVip = true
                  item.desc = '大学录取可能性非常高'
                  item.title = "可保底的大学"
                  item.amount = item.result_cnt
                  break;
                case '较稳妥':
                  item.text = '稳'
                  item.bg = 'blue'
                  item.desc = '大学录取可能性较高'
                  item.title = "较稳妥的大学"
                  item.amount = item.result_cnt
                  item.needVip = true
                  break;
                case '需冲刺':
                  item.text = '冲'
                  item.bg = 'red'
                  item.desc = '大学录取可能性低'
                  item.title = "可冲击的大学"
                  item.amount = item.result_cnt
                  break;
              }
              item.score_status = item.score_status
              return item
            })
          } else {
            this.list = []
          }
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .page-title {
    display: flex;
    padding: 10px;
    justify-content: space-between;
  }

  .card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 20px 0;
    margin: 10px;
    box-shadow: 1px 1px 1px #f1f1f1;
    border-radius: 2px;

    .right {
      padding-right: 10px;
      color: #999;

      .number {
        font-size: 16px;
        color: #333;
        margin-right: 2px;
      }
    }

    .content {
      flex: 1;
      padding: 0 10px;

      .title {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;

        .blue {
          color: #348ff5;
        }

        .red {
          color: #ff5c73;
        }

        .green {
          color: #20a768;
        }

        .tips {
          font-weight: normal;
          font-size: 14px;
          color: #ddb848;
          margin-left: 10px;
        }
      }

      .desc {
        margin-top: 2px;
        color: #999;
      }
    }

    .left {
      font-size: 18px;
      text-align: center;
      color: #fff;
      border-radius: 0 20px 20px 0;
      background: linear-gradient(#f4c7c3, #ff5c73);
      width: 40px;
      height: 30px;
      line-height: 30px;

      &.red {
        background: linear-gradient(#f4c7c3, #ff5c73);
      }

      &.blue {
        background: linear-gradient(#44acf9, #348ff5);
      }

      &.green {
        background: linear-gradient(#3dbb7d, #20a768);
      }
    }
  }

  .cu-form-group {
    .align-start {
      text-align: left;
    }
  }
</style>
