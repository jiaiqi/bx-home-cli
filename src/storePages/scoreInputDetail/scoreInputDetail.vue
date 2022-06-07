<template>
  <view>
    <view class="page-title">
      <view class="left">
        {{leftText||''}}
      </view>
      <view class="right">
        {{rightText||''}}
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
  </view>
</template>

<script>
  export default {
    data() {
      return {
        query: null,
        isLoad:false,
        list: [
          // {
          //   bg: 'red',
          //   text: '冲',
          //   title: '可冲击的大学',
          //   desc: '大学录取可能性低',
          //   needVip: false,
          //   amount: 3,
          // },
          // {
          //   bg: 'blue',
          //   text: '稳',
          //   title: '较稳妥的大学',
          //   desc: '大学录取可能性较高',
          //   needVip: true,
          //   amount: 21,
          // },
          // {
          //   bg: 'green',
          //   text: '保',
          //   title: '可保底的大学',
          //   desc: '大学录取可能性非常高',
          //   needVip: true,
          //   amount: 317,
          // }
        ]
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
          this.getList()
        } catch (e) {
          //TODO handle the exception
        }
      }
    },
    methods: {
      toDetail(e) {
        
        let condition = [
          {
            colName:'score_status',
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
          value: this.query.level||'全部'
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
          color:  #348ff5;
        }
        .red{
          color:#ff5c73;
        }
        .green {
          color:  #20a768;
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
      &.red{
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
</style>
