# add 表单

## 子表初始数据配置

> 主表表单加载完成后,向子表中插入默认数据

在添加服务上进行如下配置 ，加载表单之后会往配置的子表中添加对应条数的数据，配置了 trigger 后，子表在 trigger 中的字段的值发生改变后，会重新往子表中加入数据;immediate 为 false 时，加载表单后不往子表插入数据，只有 trigger 字段的值发生改变后才会插入

```js
{
 "fkTemplate": {
  "e55c7b6fdce4f49bc77bafc84ca5901e": { //外键编号
   "immediate":false, //是否表单加载时就执行，默认true，false的话只会在trigger字段改变后执行
    "trigger":"warehouse_no,type",
    "service": "srvhealth_template_goods_select", //模板数据的服务
   "app": "health", // 跟添加服务一个app的话可以不配置
   "condition": [{
    "colName": "store_no",
    "ruleType": "eq",
    "value": "${storeInfo.store_no}"
   }],
   "defaultValue": { // 默认值，可以写固定的，也可以从主表中拿
    "type": "${mainData.type}", // mainData 主表数据
    "warehouse_no": "${mainData.warehouse_no}"
   }
  }
 }
}
```

## after submit

> 配置表单提交操作完成后的操作

```js
// add服务的more_config中配置
{
    "after_submit": [
        {
            "type": "wx_pay", //调起微信支付
            "order_no_col": "user_order_code",
            "money_col": "serveritem_money",
            "money_unit": "元"
        },
        {
            "type": "update_call_back", //编辑类型的回调函数
            "service": "srvstore_entity_subscribe_payover_update",
            "app": "fyzhmd",
            "cond": [
                {
                    "colName": "user_order_code",
                    "ruleType": "eq",
                    "value": "${data.user_order_code}"
                }
            ],
            "data": [
                {
                    "user_order_status": "已预约"
                }
            ]
        },
        {
			"type": "toDetail", //跳转到详情页面  必须放在最后一项
			"view_cfg": {
				"title": "预约成功",
				"tip": "感谢您的预约，很高兴为您服务",
				"hideColumn": ["user_order_code", "user_image", "order_serveritem_server_model", "user_order_status", "create_time", "create_user_disp"],
				"hideChildTable":false, //详情页不显示子表
				"custom_url":"",//自定义详情页面
				"bottomBtn": [{
					"button_name": "预约列表",
					"type": "navToList",
					"service": "srvstore_entity_mine_subscribe_select",
					"cond": [{
						"colName": "store_no",
						"ruleType": "eq",
						"value": "${storeInfo.store_no}"
					}],
					"custom_url": ""
				}]
			}
		}
    ]
}

```

## fk 字段 设置默认值

> 例如在收货地址字段上自动填充设为默认的地址

```js
// 示例 默认选中default_addr（默认地址）为 “是” 的第一条数据
// 在字段的more_config中配置：
{
    "editor_type":"selectorList", // 跳转到列表页面去选择
    "editable":true, // 用来选择的列表页面支持编辑删除
    "defaultSelectCondition":[ //满足条件的第一项会被默认选中
        {
            "colName":"default_addr",
            "ruleType":"eq",
            "value":"是"
        }
    ]
}
```

## 隐藏 option-selector 右上角添加按钮

> 在字段的 more_config 中进行如下配置

```js
{
	"allow_add":false
}
```
