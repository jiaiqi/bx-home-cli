<template>
  <view>
    <view class="title">
      <view class="left">

      </view>
      <view class="right">

      </view>
    </view>
    <view class="card-list">
      <view class="card-item" v-for="item in list">
        <view class="left" :class="[item.bg]">
          {{item.text}}
        </view>
        <view class="content">
          <view class="title">
            <view class="">
              {{item.title}}
            </view>
            <view class="tips" v-if="item.needVip">
              VIP可查看
            </view>
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
        query:null,
        list: [{
            bg: 'red',
            text: '冲',
            title: '可冲击的大学',
            desc: '大学录取可能性低',
            needVip: false,
            amount: 3,
          },
          {
            bg: 'blue',
            text: '稳',
            title: '较稳妥的大学',
            desc: '大学录取可能性较高',
            needVip: true,
            amount: 21,
          },
          {
            bg: 'green',
            text: '保',
            title: '可保底的大学',
            desc: '大学录取可能性非常高',
            needVip: true,
            amount: 317,
          }
        ]
      }
    },
    onLoad(option) {
      if(option.query){
        try{
          this.query = JSON.parse(option.query)
        }catch(e){
          //TODO handle the exception
        }
      }
    },
    methods: {
      toDetail() {

      },
      getList(){
        const url = `/person/select/srvuee_college_score_ana_sum_select `
        const req = ''
      },
    }
  }
</script>

<style lang="scss" scoped>
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
      width: 50px;
      height: 30px;
      line-height: 30px;

      &.blue {
        background: linear-gradient(#44acf9, #348ff5);
      }

      &.green {
        background: linear-gradient(#3dbb7d, #20a768);
      }
    }
  }
</style>
