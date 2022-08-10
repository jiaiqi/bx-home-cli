<template>
  <view class="page-wrap">
    <view class="profile-box">
      <view class="container">
        <view class="top">
          <view class="left">
            <view class="name">
              陈阿姨
            </view>
            <view class="golden">
              年龄：46岁
            </view>
            <view class="golden">
              服务等级：标准服务
            </view>
          </view>
          <view class="right">
            <image class="image" src="/static/profile.png" mode="aspectFit"></image>
          </view>
        </view>
        <view class="attr-list">
          <view class="attr-item">
            属相：兔
          </view>
          <view class="attr-item">
            服务：8户
          </view>
          <view class="attr-item">
            星座：狮子座
          </view>
          <view class="attr-item">
            籍贯：陕西
          </view>
          <view class="attr-item">
            民族：汉族
          </view>
          <view class="attr-item">
            学历：初中
          </view>
        </view>
      </view>
    </view>
    <view class="content-box">
      <view class="title">
        自我介绍
      </view>
      <view class="tags-box">
        <view class="cu-btn round sm margin-right-xs">
          老实本分
        </view>
        <view class="cu-btn round sm margin-right-xs">
          热情开朗
        </view>
        <view class="cu-btn round sm margin-right-xs">
          干活利索
        </view>
        <view class="cu-btn round sm margin-right-xs">
          待人亲切
        </view>
      </view>
      <view class="content">
        我老实本分、热情开朗、干活利索、待人靠切,我是陕西眯化人，我精通母婴护理知识,依识别和处理新生儿简单生理现象和病理现象,我性裕开朗垫情,性裕和心态好,做事有条不紊。凭偌多年护理经验,为宝妈宝宝苇来一个舒适枳的月孑是我函幸福和快乐。
      </view>
    </view>
    <view class="content-box">
      <view class="title">
        考核团评语
      </view>

      <view class="content">
        陈阿咦回口之家，孩孑在上学，以前在望织厂上班，阿咦性裕开朗
      </view>
    </view>
    <view class="content-box bg-white">
      <view class="title">
        视频展示
      </view>

      <view class="content">

      </view>
    </view>

    <view class="content-box bg-white">
      <view class="title">
        服务照片
      </view>

      <view class="content">

      </view>
    </view>


    <view class="content-box bg-red no-margin">
      <view class="container">
        <view class="title text-white">
          专业证件
        </view>
        <view class="card-list">
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>产后康复</text>
          </view>
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>无痛催乳+母乳指导</text>
          </view>
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>无痛催乳+母乳指导</text>
          </view>
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>精品月嫂</text>
          </view>
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>身份证</text>
          </view>
          <view class="card-item">
            <text class="cuIcon-card margin-right-xs"></text><text>身份证</text>
          </view>
        </view>
      </view>
    </view>

    <view class="flex">
      <view class="list-card">
        <view class="card-title">
          <view class="title">
            护理内容
          </view>
          <view class="">

          </view>
        </view>
        <view class="card-list">
          <view class="list-item">
            宝宝生活照顾
          </view>
          <view class="list-item">
            宝宝生活照顾
          </view>
          <view class="list-item">
            宝宝生活照顾
          </view>
        </view>
      </view>
      <view class="list-card">
        <view class="card-title">
          <view class="title">
            服务技能
          </view>
          <view class="">

          </view>
        </view>
        <view class="card-list">
          <view class="list-item">
            新生儿喂养
          </view>
          <view class="list-item">
            新生儿喂养
          </view>
          <view class="list-item">
            新生儿喂养
          </view>
          <view class="list-item">
            新生儿喂养
          </view>
        </view>
      </view>
    </view>

    <view class="content-box bg-white">
      <view class="title">
        商品
      </view>

      <view class="content">

      </view>
    </view>
    <view class="bottom-button">
      <button class="cu-btn bg-blue">立即预约</button>
      <button class="cu-btn bg-blue">电话咨询</button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {

      }
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>
  .profile-box {
    // background-color: #FF96A4;
    height: 310px;
    // background-image: linear-gradient(180deg, #FF96A4, #FC7387);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      width: 180%;
      height: calc(100% - 5px);
      position: absolute;
      left: -50%;
      top: 0;
      border-radius: 0 0 50% 100%;
      background-image: linear-gradient(180deg, #FF96A4 30%, #FC7387);
      z-index: 2;
    }

    &::after {
      content: '';
      width: 200%;
      height: 100%;
      position: absolute;
      left: -50%;
      top: 0;
      border-radius: 0 0 50% 50%;
      // background: #1496f1;
      background-image: linear-gradient(0, #FF96A4, #FC7387);
      z-index: 1;
    }

    .container {
      width: calc(100% - 20px);
      height: calc(100% - 80px);
      border-radius: 20px;
      position: absolute;
      left: 10px;
      top: 30px;
      z-index: 5;
      padding: 10px;
      background-color: #fff;
      padding: 25px 20px;

      .top {
        display: flex;

        .left {
          flex: 1;

          .name {
            font-size: 24px;
            padding: 10px 0;
          }

          .golden {
            line-height: 25px;
            font-size: 16px;
            color: #804826;
          }
        }

        .right {
          width: 120px;
          height: 150px;
          border: 3px solid #fff;
          box-shadow: 0px 0px 10px -5px rgba(50, 50, 50, 1);
          border-radius: 10px 10px 5px 5px;
          position: absolute;
          top: -20px;
          right: 15px;
          background: #fff;

          .image {
            width: 100%;
            height: 100%;
          }
        }
      }

      .attr-list {
        padding-top: 20px;
        color: #2E0106;

        .attr-item {
          width: 50%;
          padding: 2px 20px;
          display: inline-block;
          position: relative;

          &:before {
            content: '';
            width: 5px;
            left: 0;
            top: calc(50% - 5px);
            position: absolute;
            height: 5px;
            border: 2px solid #EFEFEF;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .content-box {
    padding: 20px 10px;
    margin: 10px;
    border-radius: 10px;
    border: 2px solid #FFE2E8;
    background-color: #FFF3F3;

    &.bg-red {
      background-color: transparent;
      border: none;
      height: 280px;
      position: relative;

      &::before {
        content: '';
        width: 180%;
        height: calc(100% - 5px);
        position: absolute;
        left: -50%;
        top: 0;
        border-radius: 0 0 50% 100%;
        background-image: linear-gradient(180deg, #FF96A4 30%, #FC7387);
        z-index: 2;
      }

      &::after {
        content: '';
        width: 200%;
        height: 100%;
        position: absolute;
        left: -50%;
        top: 0;
        border-radius: 0 0 50% 50%;
        // background: #1496f1;
        background-image: linear-gradient(0, #FF96A4, #FC7387);
        z-index: 1;
      }

    }

    &.no-margin {
      margin: 0;
    }

    &.bg-white {
      background-color: #fff;
      border: none;
    }

    .title {
      text-align: center;
      font-size: 20px;
      color: #702335;
      position: relative;
      margin-bottom: 10px;

      &:before {
        content: '';
        width: 10px;
        height: 2px;
        display: inline-block;
        background-color: #702335;
        margin-bottom: 5px;
        margin-right: 10px;
      }

      &:after {
        content: '';
        width: 10px;
        height: 2px;
        display: inline-block;
        background-color: #702335;
        margin-bottom: 5px;
        margin-left: 10px;
      }

      &.text-white {
        color: #fff;

        &:before {
          background-color: #FFF;
        }

        &:after {
          background-color: #FFF;
        }
      }
    }

    .container {
      position: relative;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      padding: 10px;
      z-index: 5;
    }

    .card-list {
      display: flex;
      flex-wrap: wrap;
      z-index: 5;
      padding: 20px;

      .card-item {
        min-width: 50%;
        padding: 5px 10px;
        font-size: 16px;
      }
    }

    .tags-box {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;

      .cu-btn {
        background-color: #FF7886;
        color: #fff;
      }
    }

    .content {
      color: #433537;
      padding: 10px 0;
      letter-spacing: 2px;
      line-height: 20px;
    }
  }

  .list-card {
    flex: 1;
    margin-right: 5px;
    margin: 20px 0;
    background-image: linear-gradient(90deg, #FFFCF7, #FEF1EB);
    margin-right: 10px;
    padding: 10px 0;

    &:last-child {
      margin-right: 0;
      background-image: linear-gradient(90deg, #FFF3F5, #FEE3E8);

      .card-title {
        .title {
          background-image: linear-gradient(#FD78A3, #F9588D);
          color: #fff;
        }
      }
    }

    .card-title {
      .title {
        background-image: linear-gradient(#FEE8D0, #F5DBBA);
        width: 70%;
        padding: 5px 10px;
        border-radius: 0 20px 20px 0;
        color: #410311;
        font-size: 18px;
      }

    }

    .card-list {
      padding: 15px;

      .list-item {
        padding: 5px 15px;
        position: relative;

        &:before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 4px;
          background-color: #410311;
          position: absolute;
          left: 0;
          top: calc(50% - 2px);

        }
      }
    }
  }

  .bottom-button {
    display: flex;
    justify-content: center;
    padding:  0;
    position: fixed;
    bottom: 0;
    z-index: 10;
    .cu-btn{
      border-radius: 0;
      width: 50vw;
      padding: 15px 0;
      height: auto;
      color: #410311;
      background-image: linear-gradient(#FEE8D0, #F5DBBA) ;
      &:last-child{
        color: #fff;
        background-image: linear-gradient(#FD78A3, #F9588D);
      }
    }
  }
  
  .page-wrap{
    padding-bottom: 80px;
    
  }
</style>
