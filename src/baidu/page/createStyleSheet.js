/*
 * Tangram
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * @author: meizz
 * @namespace: baidu.page.createStyleSheet
 * @version: 2010-06-12
 */

///import baidu.browser.ie;
///import baidu.dom.insertHTML;
///import baidu.page;

/**
 * 在页面中创建样式表对象
 * @name baidu.page.createStyleSheet
 * @function
 * @grammar baidu.page.createStyleSheet(options)
 * @param {Object} options 配置信息
                
 * @param {Document} options.document 指定在哪个document下创建，默认是当前文档
 * @param {String} options.url css文件的URL
 * @param {Number} options.index 在文档里的排序索引（注意，仅IE下有效）
 * @version 1.2
 * @remark
 *  ie 下返回值styleSheet的addRule方法不支持添加逗号分隔的css rule.
 * 
 * @see baidu.page.createStyleSheet.StyleSheet
 *             
 * @returns {baidu.page.createStyleSheet.StyleSheet} styleSheet对象(注意: 仅IE下,其他浏览器均返回null)
 */
baidu.page.createStyleSheet = function(options){
    var op = options || {},
        doc = op.document || document,
        s;

    if (baidu.browser.ie) {
        //修复ie下会请求一个undefined的bug  berg 2010/08/27 
        if(!op.url)
            op.url = "";
        return doc.createStyleSheet(op.url, op.index);
    } else {
        s = "<style type='text/css'></style>";
        op.url && (s="<link type='text/css' rel='stylesheet' href='"+op.url+"'/>");
        baidu.dom.insertHTML(doc.getElementsByTagName("HEAD")[0],"beforeEnd",s);
        //如果用户传入了url参数，下面访问sheet.rules的时候会报错
        if(op.url){
            return null;
        }

        var sheet = doc.styleSheets[doc.styleSheets.length - 1],
            rules = sheet.rules || sheet.cssRules;
        return {
            self : sheet
            ,rules : sheet.rules || sheet.cssRules
            ,addRule : function(selector, style, i) {
                if (sheet.addRule) {
                    return sheet.addRule(selector, style, i);
                } else if (sheet.insertRule) {
                    isNaN(i) && (i = rules.length);
                    return sheet.insertRule(selector +"{"+ style +"}", i);
                }
            }
            ,removeRule : function(i) {
                if (sheet.removeRule) {
                    sheet.removeRule(i);
                } else if (sheet.deleteRule) {
                    isNaN(i) && (i = 0);
                    sheet.deleteRule(i);
                }
            }
        }
    }
};
/*
 * styleSheet对象 有两个方法 
 *  addRule(selector, style, i)
 *  removeRule(i)
 *  这两个方法已经做了浏览器兼容处理
 * 一个集合
 *  rules
 */
