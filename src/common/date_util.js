import moment from "../static/js/dayjs.min.js";

/**
 * 获取本周、本季度、本月、上月的开始日期、结束日期
 */
var now = new Date(); //当前日期
var nowDayOfWeek = now.getDay() - 1; //今天本周的第几天
var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年
nowYear += (nowYear < 2000) ? 1900 : 0; //
var lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();
//格式化日期：yyyy-MM-dd
function formatDate(date) {
  var myyear = date.getFullYear();
  var mymonth = date.getMonth() + 1;
  var myweekday = date.getDate();
  if (mymonth < 10) {
    mymonth = "0" + mymonth;
  }
  if (myweekday < 10) {
    myweekday = "0" + myweekday;
  }
  return (myyear + "-" + mymonth + "-" + myweekday);
}
//获得某月的天数
function getMonthDays(myMonth) {
  var monthStartDate = new Date(nowYear, myMonth, 1);
  var monthEndDate = new Date(nowYear, myMonth + 1, 1);
  var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
  return days;
}
//获得本季度的开始月份
function getQuarterStartMonth() {
  var quarterStartMonth = 0;
  if (nowMonth < 3) {
    quarterStartMonth = 0;
  }
  if (2 < nowMonth && nowMonth < 6) {
    quarterStartMonth = 3;
  }
  if (5 < nowMonth && nowMonth < 9) {
    quarterStartMonth = 6;
  }
  if (nowMonth > 8) {
    quarterStartMonth = 9;
  }
  return quarterStartMonth;
}
//获得本周的开始日期
function getWeekStartDate() {
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
  return formatDate(weekStartDate);
}
//获得本周的结束日期
function getWeekEndDate() {
  var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
  return formatDate(weekEndDate);
}
//获得上周的开始日期
function getLastWeekStartDate() {
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7);
  return formatDate(weekStartDate);
}
//获得上周的结束日期
function getLastWeekEndDate() {
  var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1);
  return formatDate(weekEndDate);
}
//获得下周的开始日期
function getNextWeekStartDate() {
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 7);
  return formatDate(weekStartDate);
}
//获得下周的结束日期
function getNextWeekEndDate() {
  var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1 + 7 + 7);
  return formatDate(weekEndDate);
}
//获得本月的开始日期
function getMonthStartDate() {
  var monthStartDate = new Date(nowYear, nowMonth, 1);
  return formatDate(monthStartDate);
}
//获得本月的结束日期
function getMonthEndDate() {
  var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
  return formatDate(monthEndDate);
}
//获得上月开始时间
function getLastMonthStartDate() {
  var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
  return formatDate(lastMonthStartDate);
}
//获得上月结束时间
function getLastMonthEndDate() {
  var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
  return formatDate(lastMonthEndDate);
}
//获得本季度的开始日期
function getQuarterStartDate() {
  var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
  return formatDate(quarterStartDate);
}
//或的本季度的结束日期
function getQuarterEndDate() {
  var quarterEndMonth = getQuarterStartMonth() + 2;
  var quarterStartDate = new Date(nowYear, quarterEndMonth,
    getMonthDays(quarterEndMonth));
  return formatDate(quarterStartDate);
}
// 获取相对于今天的某一天的日期
function getDateOfNow(type) {
  let result = ''
  switch (type) {
    case 'today':
      result = moment().format("YYYY-MM-DD")
      break;
    case 'yesterday':
      result = moment().add(-1, 'day').format("YYYY-MM-DD")
      break;
    case 'tomorrow':
      result = moment().add(1, 'day').format("YYYY-MM-DD")
      break;
    default:
      if (typeof type === 'number') {
        result = moment().add(type, 'day').format("YYYY-MM-DD")
      }
      break;
  }
  return [result]
}


function getWeekStartAndEnd(e) {
  console.log('增量', e)
  let days = 1000 * 60 * 60 * 24
  let times = (new Date()).getTime()
  let year = (new Date()).getFullYear()
  let month = (new Date()).getMonth() + 1
  let sDays = (new Date()).getDate() - (new Date()).getDay()
  let sNum = times - ((new Date()).getDay() * days)
  let eNum = times + ((7 - (new Date()).getDay()) * days)

  let sDate = ((new Date(sNum + (e * days * 7))).getYear() + 1900) +
    '-' +
    ((new Date(sNum + (e * days * 7))).getMonth() + 1) +
    '-' + ((new Date(sNum + (e * days * 7))).getDate()) + ' 00:00:00';;
  let eDate = ((new Date(eNum + (e * days * 7))).getYear() + 1900) +
    '-' +
    ((new Date(eNum + (e * days * 7))).getMonth() + 1) +
    '-' +
    ((new Date(eNum + (e * days * 7))).getDate()) + ' 00:00:00';;
  return [sDate + ',' + eDate]
}

function getDayStartAndEnd(e, needTime = true) {
  let days = 1000 * 60 * 60 * 24
  let times = (new Date()).getTime()
  let nowDay = ((new Date()).getYear() + 1900) +
    '-' +
    ((new Date()).getMonth() + 1) +
    '-' +
    ((new Date()).getDate()) + ' 00:00:00';

  let sDate = ((new Date(times + ((e - 1) * days))).getYear() + 1900) +
    '-' +
    ((new Date(times + ((e - 1) * days))).getMonth() + 1) +
    '-' + ((new Date(times + ((e - 1) * days))).getDate()) + ' 00:00:00';
  if (!needTime) {
    nowDay = nowDay.replace(' 00:00:00', '')
    sDate = nowDay.replace(' 00:00:00', '')
  }
  if (e < 0) {
    return [sDate + ',' + nowDay]
  } else if (e === 1) {
    return [nowDay]
  } else {
    return [nowDay + ',' + sDate]
  }
};

function getMonthStartAndEnd(e) { // -1 0 2
  let days = 1000 * 60 * 60 * 24
  let times = (new Date()).getTime()
  let nowY = new Date().getFullYear()
  let nowM = new Date().getMonth() + 1
  let sMonth = nowM
  let eMonth = nowM + 1
  let sYear = nowY
  let eYear = nowY
  if (e < 0) {
    // -1 0 2
    if ((nowM + e) >= 0) {
      // 不跨月  日期起止月
      sMonth = nowM + e == 0 ? 1 : nowM + e
      eMonth = nowM + 1 > 12 ? 1 : nowM + 1
    } else {
      sMonth = 12 + (nowM + e)
      eMonth = nowM + 1 > 12 ? 1 : nowM + 1
      sYear = nowY--
    }

    if ((nowM + 1) > 12) {
      eMonth = 1
      eYear = nowY++
    } else {
      eMonth = nowM + 1
      eYear = nowY
    }
  } else if (e > 0) {
    sMonth = nowM
    eMonth = (12 - nowM) >= e ? nowM + e : e - (12 - nowM)
    if (!(12 - nowM) >= e) {
      eYear = nowY++
    }
  }

  let sMonthTime = sYear + '-' + sMonth + '-' + 1 + ' 00:00:00';
  let eMonthTime = eYear + '-' + eMonth + '-' + 1 + ' 00:00:00';
  return [sMonthTime + ',' + eMonthTime]
};

function getYearStartAndEnd(e) { // -1 0 2
  let nowY = new Date().getFullYear()
  let sYear = nowY
  let eYear = nowY + 1
  if (e > 0) {
    sYear = nowY
    eYear = nowY + e
  } else {
    eYear = nowY + 1
    sYear = nowY + e
  }
  let sYearTime = nowY + '-' + 1 + '-' + 1 + ' 00:00:00';
  let eYearTime = nowY + '-' + 1 + '-' + 1 + ' 00:00:00';
  return [sYearTime + ',' + eYearTime]
};

function weekEnd() {
  return new Date(
    (new Date()).getYear() + 1900,
    (new Date()).getMonth(),
    (new Date()).getDate() + (6 - (new Date()).getDay()))
};


function weekStart() {
  return new Date(
    (new Date()).getYear() + 1900,
    (new Date()).getMonth(),
    (new Date()).getDate() - (new Date()).getDay()
  )
};

function monthStart() {
  let now = new Date();
  return new Date(
    (now).getYear() + 1900,
    (now).getMonth(), 1
  )
};

function monthEnd() {
  let now = new Date();
  return new Date(
    (now).getYear() + 1900,
    (now).getMonth(),
    moment().daysInMonth())
};



export {
  formatDate,
  getMonthDays,
  getQuarterStartMonth,
  getWeekStartDate,
  getWeekEndDate,
  getLastWeekStartDate,
  getLastWeekEndDate,
  getNextWeekStartDate,
  getNextWeekEndDate,
  getMonthStartDate,
  getMonthEndDate,
  getLastMonthStartDate,
  getLastMonthEndDate,
  getQuarterStartDate,
  getQuarterEndDate,
  getDateOfNow,
  getWeekStartAndEnd,
  getDayStartAndEnd,
  getMonthStartAndEnd,
  getYearStartAndEnd
}
