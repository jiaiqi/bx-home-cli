# 快捷筛选

## 自定义 relation_condition

```js
{
	"filter_tags_cfg": {
		"tag_select_relation": { //自定义relation_condition
			"province": { //只选了省的时候 用这个relation_condition
				"relation": "OR",
				"data": [{
						"colName": "policy_grade",
						"ruleType": "eq",
						"value": "国家"
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "省"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							}
						]
					}
				]
			},
			"city": {//选了省和市的时候 用这个relation_condition
				"relation": "OR",
				"data": [{
						"colName": "policy_grade",
						"ruleType": "eq",
						"value": "国家"
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "省"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							}
						]
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "市"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							},
							{
								"colName": "city",
								"ruleType": "eq",
								"value": "${data.city}"
							}
						]
					}
				]
			},
			"districts": { //选了省和市和区的时候 用这个relation_condition
				"relation": "OR",
				"data": [{
						"colName": "policy_grade",
						"ruleType": "eq",
						"value": "国家"
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "省"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							}
						]
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "市"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							},
							{
								"colName": "city",
								"ruleType": "eq",
								"value": "${data.city}"
							}
						]
					},
					{
						"relation": "AND",
						"data": [{
								"colName": "policy_grade",
								"ruleType": "eq",
								"value": "县区"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.province}"
							},
							{
								"colName": "city",
								"ruleType": "eq",
								"value": "${data.city}"
							},
							{
								"colName": "province",
								"ruleType": "eq",
								"value": "${data.districts}"
							}
						]
					}
				]
			}
		}
	}
}
```
