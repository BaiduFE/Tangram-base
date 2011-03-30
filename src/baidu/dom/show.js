/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.dom.g;

/**
 * 显示目标元素，即将目标元素的display属性还原成默认值。默认值可能在stylesheet中定义，或者是继承了浏览器的默认样式值
 * @author allstar, berg
 * @name baidu.dom.show
 * @function
 * @grammar baidu.dom.show(element)
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @remark
 * 注意1：如果在CSS中定义此元素的样式为display:none
 * 在调用本函数以后，会将display属性仍然还原成none，元素仍然无法显示。
 * 注意2：如果这个元素的display属性被设置成inline
 * （由element.style.display或者HTML中的style属性设置）
 * 调用本方法将清除此inline属性，导致元素的display属性变成继承值
 * 因此，针对上面两种情况，建议使用dom.setStyle("display", "something")
 * 来明确指定要设置的display属性值。
 * 
 * @shortcut show
 * @meta standard
 * @see baidu.dom.hide,baidu.dom.toggle
 *             
 * @returns {HTMLElement} 目标元素
 */
baidu.dom.show = function (element) {
    element = baidu.dom.g(element);
    element.style.display = "";

    return element;
};

// 声明快捷方法
baidu.show = baidu.dom.show;
