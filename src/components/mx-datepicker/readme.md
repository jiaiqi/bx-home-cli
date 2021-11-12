日期时间选择器 DatePicker
介绍
一款高颜值、多场景的日期时间选择器，提供自定义颜色/格式/文案等。
该插件采用scss编译，如遇到样式/层级问题可以到源码修改。 如果对您有帮助，可以评论或赞赏一下，谢谢！
地址：Uni-App插件市场地址 | Gitee | Github

属性说明
|属性	|类型	|默认值	|说明|
|--|--|--|--|
|show | Boolean	|false	|是否显示|
|type|	String	|date	类型，可选值：date（日期）、time（时间）、datetime（日期时间）、range（日期范围）、rangetime（日期时间范围）|
|color	String	#409eff	选择控件的颜色||||
|format	String		自定义格式，参考下方格式说明||||
|value	String, Array		设置显示的值（如果用了format需要个format格式一致，否则需要标准的能被Date解析的字符串（time除外））||||
|showSeconds	Boolean	false	是否显示秒（type为datetime/time时生效）||||
|showHoliday	Boolean	true	是否显示公历节日||||
|showTips	Boolean	false	是否显示提示文字（type为range/rangetime时生效）||||
|beginText	String	开始	开始文案（type为datetime/time时生效）||||
|endText	String	结束	结束文案（type为datetime/time时生效）||||
|[@confirm ]()	ConfirmObject		确认选择事件||||
|[@cancel ]()	Boolean		取消选择事件(接收一个false)||||
|format||||
|格式	含义||||
|y	年||||
|m	月||||
|d	日||||
|h	时||||
|i	分||||
|s	秒||||
|示例：yyyy/mm/dd hh:ii:ss => 2019/03/26 23:39||||

ConfirmObject
{
    value: ..., //当前选择的值(String/Array)
    date: ..., //当前所选值的原始Date对象
}
使用示例
``` html
<template>
    <view>
        <view class="test">
            <view>日期选择 - 示例</view>
            {{date}}
            <button type="primary" @click="DatePicker('date')">选择日期</button>
            {{time}}
            <button type="primary" @click="DatePicker('time')">选择时间</button>
            {{datetime}}
            <button type="primary" @click="DatePicker('datetime')">选择日期时间</button>
            {{range[0]}} - {{range[1]}}
            <button type="primary" @click="DatePicker('range')">选择日期范围</button>
            {{rangetime[0]}} - {{rangetime[1]}}
            <button type="primary" @click="DatePicker('rangetime')">选择日期时间范围</button>
        </view>
        <mx-date-picker :show="showPicker" :type="type" :value="value" :show-tips="true" :begin-text="'入住'" :end-text="'离店'" :show-seconds="true" @confirm="ed" @cancel="ed" />
    </view>
</template>
```
```js
<script>
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
    export default {
        components: {
            MxDatePicker
        },
        data() {
            return {
                showPicker: false,
                date: '2019/01/01',
                time: '15:00:12',
                datetime: '2019/01/01 15:00:12',
                range: ['2019/01/01','2019/01/06'],
                rangetime: ['2019/01/08 14:00','2019/01/16 13:59'],
                type: 'rangetime',
                value: ''
            }
        },
        methods: {
            DatePicker(type){//显示
                this.type = type;
                this.showPicker = true;
                this.value = this[type];
            },
            ed(e) {//选择
                this.showPicker = false;
                if(e) {
                    this[this.type] = e.value; 
                    //选择的值
                    console.log('value => '+ e.value);
                    //原始的Date对象
                    console.log('date => ' + e.date);
                }
            }
        }
    }
</script>
```
```css
<style>
    .test{
        text-align: center;
        padding: 10px 0;
    }
    button{
        margin: 20upx;
        font-size: 28upx;
    }
</style>

```
