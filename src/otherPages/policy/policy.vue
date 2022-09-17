<template>
  <view class="" v-if="data">
    <cu-custom-navbar :data="data" :isBack="true" :back-home="false" :page-title="data.policy_title">
      <view class="text-over-hidden-ellipsis">
        <text>{{data.policy_title||''}}</text>
      </view>
    </cu-custom-navbar>


    <view class="page-wrap" @selectstart="()=>false">
      <view class="title">
        {{data.policy_title||''}}
      </view>
      <view class="sub-title flex justify-between padding-tb-xs">
        <view class="">
          易企跑.{{data.publication_date||''}}
        </view>
        <view class="">
          {{data.province||''}}.{{data.city||''}}
        </view>
      </view>
      <view class="info-card flex flex-wrap">
        <view class="card-item">
          <text class="cuIcon-timefill text-green margin-xs"></text>
          <view class="">
            <view class="">
              申报时间
            </view>
            <view class="text-sm">
              {{dayjs(data.start_date).format("YYYY.MM.DD")}} - {{dayjs(data.end_date).format("YYYY.MM.DD")}}
            </view>
          </view>
        </view>
        <view class="card-item">
          <text class="cuIcon-appreciatefill text-blue margin-xs"> </text>
          <view class="">
            <view class="">
              支持方式
            </view>
            <view class="text-sm">
              {{data.support_mode||''}}
            </view>
          </view>
        </view>
        <view class="card-item">
          <text class="cuIcon-card text-orange margin-xs"> </text>
          <view class="">
            <view class="">
              发布口
            </view>
            <view class="text-sm">
              {{data.policy_sources_name||''}}
            </view>
          </view>
        </view>
        <view class="card-item">
          <text class="cuIcon-medalfill text-purple margin-xs"> </text>
          <view class="">
            <view class="">
              最高奖励
            </view>
            <view class="text-sm text-red">
              {{data.maximum_amount||'0'}}万元
            </view>
          </view>
        </view>
      </view>
      <view class="content-card" v-if="data.declaration_cond">
        <view class="content-title text-blue">
          申报对象条件
        </view>
        <view class="content-content">
          <textarea @selectstart="()=>false" :maxlength="-1" :auto-height="true" :enabled="false" style=" user-select: none;"
            :value="data.declaration_cond" class="no-select" readonly :disabled="true"></textarea>
        </view>
      </view>
      <view class="content-card">
        <view class="content-title text-blue">
          补贴标准
        </view>
        <view class="content-content">
          <textarea @selectstart="()=>false" :maxlength="-1" :auto-height="true" :enabled="false" :value="data.subsidy_standard"
            class="no-select" readonly :disabled="true"></textarea>
        </view>
      </view>
      <view class="content-card">
        <view class="content-title text-blue">
          政策依据
        </view>
        <view class="content-content">
          <textarea @selectstart="()=>false" :maxlength="-1" :auto-height="true" :enabled="false" :value="data.policy_basis"
            class="no-select" readonly :disabled="true"></textarea>
        </view>
      </view>

      <view class="text-bold margin-top text-lg" v-if="articles&&articles.length>0">
        政策解读
      </view>
      <view class="article-list">
        <news-item :item="item" v-for="(item, noticeIndex) in  articles" :key="noticeIndex"></news-item>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: null,
        data: {},
        articles: []
      }
    },
    methods: {
      getRelationArticle() {
        const url = `/daq/select/srvdaq_cms_content_jiedu_select`
        const req = {
          "serviceName": "srvdaq_cms_content_jiedu_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "channel",
            "ruleType": "eq",
            "value": this.data.policy_no
          }],
          "relation_condition": {},
          "page": {
            "pageNo": 1,
            "rownumber": 20
          }
        }
        this.$http.post(url, req).then(res => {
          if (res?.data?.state == 'SUCCESS') {
            this.articles = res.data.data
          }
        })
      },
      getData() {
        const url = `/fyzhmd/select/srvcosvc_policy_info_user_select`
        const req = {
          "serviceName": "srvcosvc_policy_info_user_select",
          "colNames": ["*"],
          "condition": [{
            colName: 'id',
            ruleType: 'eq',
            value: this.id
          }],
          "page": {
            "rownumber": 1,
            "pageNo": 1
          }
        }
        this.$http.post(url, req).then(res => {
          if (Array.isArray(res?.data?.data) && res?.data?.data.length > 0) {
            this.data = res.data.data[0]
            if (this.data?.policy_no) {
              this.getRelationArticle()
            }
          }
        })
      },
    },
    onShareAppMessage() {
      
    },
    onShareTimeline() {
      
    },
    onLoad(option) {
      if (option.id) {
        this.id = option.id
        this.getData()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-wrap {
    padding: 15px;
    background-color: #fff;
    min-height: 100vh;
  }

  .title {
    font-size: 20px;
    font-weight: 900;
    padding: 5px 0;
  }

  .info-card {
    background-color: #EDF8FD;
    border-radius: 10px;
    margin: 10px 0;
  }

  .card-item {
    width: 50%;
    padding: 10px;
    display: flex;
    align-items: center;

    &:nth-child(2n) {
      padding-left: 5px;
    }

    &:nth-child(2n+1) {
      padding-right: 5px;
    }

    .text-sm {
      color: #333;
    }

    .text-red {
      color: #ff3a30;
    }
  }

  .content-card {
    border: 1px solid rgba(242, 242, 247, 100);
    margin-bottom: 10px;
    border-radius: 10px;
    overflow: hidden;

    .content-title {
      background-color: #F3F7F9;
      font-size: 16px;
      padding: 10px 15px;
    }

    .content-content {
      padding: 10px;
      position: relative;
      // overflow-y: scroll;
      // max-height: 300px;
      &::after {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
      }

      textarea {
        width: 100%;
      }
    }
  }
</style>
