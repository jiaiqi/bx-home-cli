# smh-time-range

用于时间范围的选择组件

### 安装方式

本组件符合[easycom](https://uniapp.dcloud.io/collocation/pages?id=easycom)规范，`HBuilderX 2.5.5`起，只需将本组件导入项目，在页面`template`中即可直接使用，无需在页面中`import`和注册`components`。

### 基本用法

在 ``template`` 中使用组件

```html
<smh-time-range :time="['12','30','0','17','30']" @confrim="confrim" @cancel="cancel"></smh-time-range>

methods: {
	confrim(e){
		console.log(e.time)//确定事件 =>12:30-17:30
	},
	cancel(e){
		console.log(e.time)//取消事件 =>12:30-17:30
	}
}
```


## API

### smh-time-range  Props

|属性名	|类型		|默认值	|说明				|
|:-:	|:-:		|:-:	|:-:				|
|time	|Array		|['15','0','0','18','0']		|设置默认时间，前两个参数为第一个时间(15:00)，后两个参数为第二个时间(18:00),第三个参数为固定参数,不用修改		|


### smh-time-range Events
|事件名	|说明			|返回值|
|:-:	|:-:			|:-:  |
|@confrim|点击确定按钮事件|{time:15:00-18:00}|
|@cancel|点击取消按钮事件|{time:15:00-18:00}|
