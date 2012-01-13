///import baidu.dom.g;
///import baidu.browser.ie;

/**
 * 设置HTML元素的不透明性，跨浏览器种类兼容处理
 * 
 * @author: meizz
 * @version: 2011-07-11
 * @namespace: baidu.dom.opacity
 * @grammar baidu.dom.opacity(element, opacity)
 * @param {String|HTMLElement}  element 定位插入的HTML的目标DOM元素
 * @param {Number}              opacity 不透明度
 */
baidu.dom.opacity = function(element, opacity){
    element = baidu.dom.g(element);

    if (!baidu.browser.ie) {
        element.style.opacity = opacity;
        element.style.KHTMLOpacity = opacity;
    } else {
        element.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity:"+
            Math.floor(opacity * 100) +")";
    }
};
