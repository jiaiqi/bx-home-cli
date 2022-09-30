# 列表页面配置

![列表页面](/c.png)

> 以下配置均配置在列表的查询服务的 more_config 种

## 自定义点击跳转页面

```js
{
    "customDetailUrl":"/pages/xx/xx?id=${data.id}" // data为所点击的行数据
}
```

## 列表显示内容配置

```js
// 不配置显示字段的话，默认展示前十个字段
// 在service的more_config中进行如下配置：
{
    "list_config": {
        "lp_style": "单行", //单行、复合、宫格
        "grid_span": "3", //lp_style为宫格时需要配置列数
        "list_bar": false, //是否显示顶部操作栏,默认为true
        "btn_cfg": {
	        "position":"right", // 按钮位置 right:列表项右侧
		    "icon":["write","delete"], // position为right时可以配置图标，按后端返回的按钮顺序
	        "wrap_row":true,//底部按钮是否占整行
            "show_custom_btn": true, //是否显示自定义按钮，默认显示
            "show_public_btn": false, //是否显示公共按钮，默认显示
            "show_evaluate":true,//是否显示评价按钮，默认否
            "bg_style": "line", //line\full\full_light
            "radius": "10px", //px,百分比
            "size": "sm", //sm\default\lg
            "width":"", //按钮宽度
            "height":"",//按钮高度
            "color":"", // 字体颜色
            "font_size":"", //字体大小 单位px
            "bg": "blue", //blue\red\orange\yellow\cyan\white\black\green\gray 目前只能该所有行按钮的颜色 不能改单个按钮的颜色
        },
        "img": {
            "col": "hy_profile_url", // 字段名，可配置多个字段 如"col":"col1||col2||col3",在列表上显示第一个有值的字段
            "cfg": {
                "compress": false, //
                "radius": "50%", // 百分比，像素
                "position": "left", //left/right/top
                "mode": "aspectFill" //缩放的模式，scaleToFill：不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素，
                //aspectFit：保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。
                //aspectFill：保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。
                //widthFix：宽度不变，高度自动变化，保持原图宽高比不变，
                //heightFix：高度不变，宽度自动变化，保持原图宽高比不变

            }

        },
        "right_content":{
	        "width":"100px",
	        "left_line":true, //是否显示左侧的分隔线
	        "text_align":"center", // start end center
	        "vertical_align":"between", // start,end,center,between,around
	        "cols":[
		        {
			        "col":"progress", // 字段名
                        "cfg":{ //字段属性配置
                        "disp_label":false,//是否显示标签，默认为true
                        "style":"button",
                        "padding":"0",
                        "color":"#f37b1d",
                        "border_color":"orange",
                        "align":"center",
                        "round":true,
                        "font_size":"10px",
                        "size":"sm",
                        "min_width":"70px",
                        "value_map":[
                            {   //此项配置意思是：当此字段的值为未开始时，向外展示的文字为 未开始，并且字体背景为#0B8DFC，文字颜色为#AEDAFF
                                "label":"未开始",
                                "value":"未开始",
                                "bg":"#AEDAFF",
                                "color":"#0B8DFC"
                            },
                            {
                                "label":"进行中",
                                "value":"进行中",
                                "bg":"#4caf50",
                                "color":"#ffffff"
                            },
                            {
                                "label":"已结束",
                                "value":"已结束",
                                "bg":"#F3A250",
                                "color":"#ffffff"
                             }
                         ]
                      }
		        }
	        ]
        },
        "cols": [
            //这里可以配置多个字段
            {
	            "placeholder":"xxx",// 值为空时要显示的字符
                "col": "be_no", // 字段名，可配置多个字段 如"col":"col1||col2||col3",在列表上显示第一个有值的字段
                "cfg": {
					"show_null": true, // 字段值为空时也显示
					"show_zero": true,//字段值为0时也显示，默认为false
                    "prefix": "￥", // 前缀
                    "suffix":"",//后缀
                    "disp_label": true, // 是否显示label
                    "align": "left", //对齐方式 left/cent/right
                    "color": "#ccc", //字体颜色
                    "font_size": "", // 字体大小
                    "bg_color": "#fff", //背景颜色
                    "min_width": "50%", // 字段最小列宽
                    "padding": "0 10rpx 0 0" //内边距

                }

            },
            {

                "col": "room_state",
                "cfg": {
                    "disp_label": false,
                    "style": "button",
                    "border_color": "orange",
                    "padding": "0",
                    "color": "#f37b1d",
                    "light": true,
                    "align": "center",
                    "round": true,
                    "font_size": "10px",
                    "size": "sm",
                    "width": "30%",
                    "value_map": // 值关系映射，当字段的值满足某个映射条件时，字段的配置优先使用映射结果中的配置
                    [
                        {
                            // 当room_state的值为'已预订'时，在列表上显示为'订',颜色和背景等配置使用如下配置
                            "label": "订",
                            "value": "已预订",
                            "bg": "#AEDAFF",
                            "color": "#0B8DFC",
                            "item_bg": "#D4EBFF", //整个列表项的背景颜色
                            "btn_bg": "#0B8DFC"
                        },
                        {

                            "label": "空",
                            "value": "空闲",
                            "bg": "#B9E9BD",
                            "color": "#44C14E",
                            "item_bg": "#E3F6E4",
                            "btn_bg": "#44C14E"
                        },
                        {
                            "label": "扫",
                            "value": "打扫中",
                            "bg": "#F8D3AC",
                            "color": "#F3A250",
                            "item_bg": "#F9E4CD",
                            "btn_bg": "#F3A250"
                        },
                        {
                            "label": "住",
                            "value": "已入住",
                            "bg": "#F8D3AC",
                            "color": "#F3A250",
                            "item_bg": "#F9E4CD",
                            "btn_bg": "#F3A250"
                        }
                    ]
                }
            }
        ]
    }
}

```

## 性别符号配置

```js
    "img": {
        "col": "user_image",
        "icon":{
            // 在配置的头像右上角显示性别符号
            "ref_col":"sex",
            "type":"gender",
            "style":{
                "borderRadius": "50%"
            }
        }
    }
```

## 日期格式化配置

> date 和 datetime 类型字段,格式化配置

```js
    {
        "col":"create_time",
        "cfg":{
            "format":{
                "type":"date",
                "rule":"YYYY-MM-DD"
            }
        }
    }
```

## 子表配置

```js
// list2页面 列表项种配置显示子表
{
    "list_config":{
        "cols":
        [
            {
                "type": "childData", // 子表数据
                "related_col": "order_no", // 子表跟主表关联的字段
                "srvInfo": {
                    "srv_app": "health",
                    "serviceName":"srvhealth_store_order_goods_detail_select"
                },
                "list_config": {
                    "lp_style": "单行",
                    "btn_cfg": {
                        "show_custom_btn": false,
                        "show_public_btn": false
                    },
                    "img": {
                        "col": "goods_image",
                        "cfg": {
                            "compress":true,
                            "width":"80px",
                            "radius": "10px",
                            "position": "left",
                            "mode": "aspectFill"
                        }
                    },
                    "cols": [
                        {
                            "col": "goods_name",
                            "cfg":{
                                "min_width":"100%",
                                "prefix": "商品名称：",
                                "font_weight":"bold"

                            }
                        },
                        {
                            "col": "unit_price",
                            "cfg":{
                                "prefix":"原价￥",
                                "color":"#ff3a30",
                                "font_size":"12px",
                                "decoration":"line-through"
                            }
                        },
                        {
                            "col": "goods_amount",
                            "cfg":{
                                "padding":"0 5px",
                                "prefix":"x",
                                "color":"#ff3a30"
                            }
                        }
                    ]
                }
            }
        ]
    }
}

```

## 评分星星配置

```js
{
    "col": "xxx",
    "cfg": {
        "mode": "rate",
        "max": 5, //最大星星数量
        "allowHalf": false //允许半星
    }
}
```

## 图片类型字段配置

```js
{
    "col":"picture",
    "type":"media",
    "cfg":{
        "wrap":"nowrap",
        "overflow":"auto",
        "imgStyle":{ //图片样式设置
            "width":"70px",
            "height":"70px",
            "radius":"5px"
        }
    }

}
```

## 显示隐藏关系配置

> 配置当前字段根据其他字段的值来显示隐藏

```js
    {
        "col":"out_warehouse_type",
        "cfg":{
            "disp_cond":[ // 显示条件
                {
                    "colName":"type", // type为出库时显示out_warehouse_type字段
                    "ruleType":"eq",
                    "value":"出库"
                }
            ]
        }
    }
```

## 多行文本溢出

> 字段配置多行文本溢出时显示省略号

```js
    {
        "col":"xx",
        "cfg":{
            "width":"100%", //必须配置宽度
            "line_clamp":"2" //行数 超过两行显示省略号
        }
    }
```
