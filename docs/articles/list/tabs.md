# tabs 配置

![tabs](/tabs.png)

## 根据枚举字段的值生成 tabs

```js
    {
        "tabs_cfg":{
            "type":"enum_col",
            "column":"state",
            "view_type":"tabs",
            //显示【全部】tab 默认为true,可以配置为false使其不显示
            "show_total_tab":false,
             //激活状态的文字颜色和下划线颜色
            "active_color":"#ff3a30"
        }
    }

```

## 自定义 tabs

```js
{
    "type": "enum_col",
    "column": "shipment_status",
    "view_type": "tabs",
    "show_total_tab": true,
    "active_color": "#007aff",
    //不显示【全部】tab
    "show_total_tab":false,
     //自定义tab内容
    "customTabs": [
        {
            "label": "待备货",
            "value": "待备货"
        },
        {
            "label": "备货完成",
            "value": "已备货"
        },
        {
            "label": "待签收",
            "value": "待出库确认"
        },
        {
            "label": "团长签收",
            "value": "待签收"
        },
        {
            "label": "已签收",
            "value": "已签收"
        }
    ]

}

```
