/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/form/serialize.js
 * author: qiaoyue
 * version: 1.1.0
 * date: 2011/12/23
 */

///import baidu.form;
///import baidu.url.escapeSymbol;

/**
 * 序列化表单数据
 * @name baidu.form.serialize
 * @function
 * @grammar baidu.form.serialize(form[, replacer])
 * @param {HTMLFormElement} form        需要提交的表单元素
 * @param {Function} replacer           对参数值特殊处理的函数,replacer(string value, string key)
	           
 * @returns {data} 表单数据数组
 */
baidu.form.serialize = function (form, replacer) {
    var elements = form.elements,
        replacer = replacer || function (value, name) {
            return value;
        },
        data = [],
        item, itemType, itemName, itemValue, 
        opts, oi, oLen, oItem;
        
    /**
     * 向缓冲区添加参数数据
     * @private
     */
    function addData(name, value) {
        data.push(name + '=' + value);
    }
    
    for (var i = 0, len = elements.length; i < len; i++) {
        item = elements[i];
        itemName = item.name;
        
        // 处理：可用并包含表单name的表单项
        if (!item.disabled && itemName) {
            itemType = item.type;
            itemValue = baidu.url.escapeSymbol(item.value);
        
            switch (itemType) {
            // radio和checkbox被选中时，拼装queryString数据
            case 'radio':
            case 'checkbox':
                if (!item.checked) {
                    break;
                }
                
            // 默认类型，拼装queryString数据
            case 'textarea':
            case 'text':
            case 'password':
            case 'hidden':
            case 'file':
            case 'select-one':
                addData(itemName, replacer(itemValue, itemName));
                break;
                
            // 多行选中select，拼装所有选中的数据
            case 'select-multiple':
                opts = item.options;
                oLen = opts.length;
                for (oi = 0; oi < oLen; oi++) {
                    oItem = opts[oi];
                    if (oItem.selected) {
                        addData(itemName, replacer(oItem.value, itemName));
                    }
                }
                break;
            }
        }
    }

    return data;
};