/*
 * Tangram
 * Copyright 2010 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/dom/resize.js
 * author: lixiaopeng
 * version: 1.0.0
 * date: 2010/10/22
 */

///import baidu.dom.draggable;
///import baidu.array.each;
///import baidu.object.each;
///import baidu.dom.setStyle;
///import baidu.dom.setStyles;
///import baidu.dom._styleFilter.px;
///import baidu.dom.create;
///import baidu.lang.isNumber;
///import baidu.event.on;
///import baidu.dom.addClass;

/**
 * 使元素大小可以改变
 * @name baidu.dom.resizable
 * @function
 * @grammar baidu.dom.resizable(element[, options])
 * @param {HTMLElement|string} element 需要改变大小的元素或者元素的id
 * @param {Object} [options] 选项，需要改变大小的配置参数
                
 * @config {Array} [handle] 可以改变的方向[右,下,左,上]
 * @config {Function} [onresizestart] 开始改变大小时触发
 * @config {Function} [onresizeend] 大小改变结束时触发
 * @config {Function} [onresize] 大小改变后时触发
 * @config {Number} [maxWidth] 可改变的最大宽度
 * @config {Number} [maxHeight] 可改变的最大高度
 * @config {Number} [minWidth] 可改变的最小宽度
 * @config {Number} [minHeight] 可改变的最小高度
 * @config {HTMLElement|string} [container] 包含resizeHandle的元素或元素id,默认值与element相同
 * @config {Boolean} [resizeContainer] 是否同时resize container,默认为true
 * @config {string} [classPrefix] classname 前缀
 * @version 1.3
 * @remark
 * 
            需要将元素的定位设置为absolute
        
 */
baidu.dom.resizable = function(element,options){
    var target,cTarget,
        op,
        draggableOptions,
        resizeHandle={},
        handlePosition,
        orgMousePos,
        orgOffset,
        orgStyles={},
        orgStyleStr,
        offsetStyle = {
            "Width" : {
                offset:"offsetWidth",
                style:["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"]
            },
            "Height": {                
                offset:"offsetHeight",
                style:["paddingTop","paddingBottom","borderTopWidth","borderBottomWidth"]
            }
        },
        getStyle = baidu.dom.getStyle;

    if(!(target = baidu.dom.g(element))){
        return false;
    }
    
    //必要参数的扩展
    //resize handle以方向命名
    //顺时针的顺序为
    //north northwest west southwest south southeast east northeast
    //当前版本只支持west southwest south
    op = baidu.object.extend({
        "handle":["e","s","se"],
        "minWidth":16,
        "minHeight":16,
        "resizeContainer":true,
        "classPrefix":"tangram"
    }, options);

    if(!(op.container && (cTarget = baidu.dom.g(op.container)))){
        cTarget = target;
        op.resizeContainer = false;
    }
    orgStyleStr = [
                    [target,"Width","","offsetWidth"],
                    [target,"Height","","offsetHeight"],
                    [cTarget,"Width","c","offsetWidth"],
                    [cTarget,"Height","c","offsetHeight"]
                ];

    if(getStyle(target, "position") == "static" && getStyle(cTarget, "position") == "static" ){
        return;
    }

    baidu.each(["minheight","minwidth","maxheight","maxwidth"],function(item){
        op[item] && (op[item] = parseInt(op[item]));
    });

    //TODO:对handle的参数进行扩展
    handlePosition = {
        "e" : {
            "right"  : "-5px",
            "top"    : "0px",
            "width"  : "7px",
            "height" : "100%"
        },
        "s" : {
            "left"   : "0px",
            "bottom" : "-5px",
            "height" : "7px",
            "width"  : "100%"
        },
        "se": {
            "right"  : "1px",
            "bottom" : "1px",
            "height" : "16px",
            "width"  : "16px"
        }
    };

    //createElement,当前只支持e,s,es
    baidu.each(op.handle,function(item){
        var className = op.classPrefix.split(" ");
        className[0] = className[0] + "-resizable-" + item;

        var ele = baidu.dom.create("div",{
                className : className.join(" ")
            }),
            styles = handlePosition[item],
            range;
        
        styles["cursor"] = item + "-resize";
        styles["position"] = "absolute";
        baidu.setStyles(ele,styles);

        cTarget.appendChild(ele);
        resizeHandle[item] = ele;
      
        baidu.on(ele,"mousedown",function(){
            orgOffset = update(item);
            range = {
                "e"  :[
                    0,
                    op.maxWidth? op.maxWidth : Number.POSITIVE_INFINITY,
                    orgStyles["orgcHeight"].offset,
                    op.minWidth
                ],
                "s" : [
                    op.minHeight,
                    orgStyles["orgcWidth"].offset,
                    op.maxHeight ? op.maxHeight : Number.POSITIVE_INFINITY,
                    0
                ],
                "se" :[
                    op.minHeight,
                    op.maxWidth ? op.maxWidth : Number.POSITIVE_INFINITY,
                    op.maxHeight ? op.maxHeight : Number.POSITIVE_INFINITY,
                    op.minWidth
                ]
            };
            
            baidu.dom.drag(ele,{
                ondragstart : function(){
                    baidu.object.each(orgStyles,function(value,key){
                        if(isNaN(value.v)){
                            var os = value.target[offsetStyle[value.direction].offset];

                            baidu.each(offsetStyle[value.direction].style,function(st){
                                os -= (parseFloat(getStyle(value.target,st)) || 0);
                            });

                            orgStyles[key].value = os;
                        }
                    });

                    typeof(op.onresizestart) === 'function' && op.onresizestart(arguments);
                },
                ondrag:function(){
                    var offset = {
                        width   :  parseInt(ele.style.left) - orgOffset.left,
                        height  :  parseInt(ele.style.top) - orgOffset.top
                    };
                    
                    baidu.setStyles(target,{
                        width : offset.width + orgStyles["orgWidth"].value,
                        height: offset.height + orgStyles["orgHeight"].value
                    });

                    if(op.resizeContainer){
                        baidu.setStyles(cTarget,{
                            width : offset.width + orgStyles["orgcWidth"].value,
                            height : offset.height + orgStyles["orgcHeight"].value   
                        });
                    }
                    resizeHandle["e"] && baidu.setStyle(resizeHandle["e"],"height", cTarget.offsetHeight);
                    typeof(op.onresize) === "function"  && op.onresize(arguments);
                },
                ondragend:function(){
                    getOrgStyle();
                    baidu.object.each(resizeHandle,function(handle,key){
                        baidu.each(["top","left","right","bottom"],function(style){
                            baidu.setStyle(handle,style,""); 
                        });
                        baidu.setStyles(handle,handlePosition[key]);
                    });
                    resizeHandle["e"] && baidu.setStyle(resizeHandle["e"],"height", cTarget.offsetHeight);
                    typeof(op.onresizeend) === 'function' && op.onresizeend(arguments);
                },
                range:range[item]
            });
        });
    });

    function update(key){
        var style = {right:"",bottom:""},
            handle = resizeHandle[key],
            position = handlePosition[key];
        getOrgStyle();
     
        style["top"] = parseInt(position["top"]);
        style["left"] = parseInt(position["left"]);
        
        if(key.indexOf("e") >= 0){
            style["left"] = orgStyles["orgcWidth"].value - 
                            parseInt(position["width"]) - 
                            parseInt(position["right"]) + 
                            (parseFloat(getStyle(cTarget,"paddingLeft")) || 0) +  
                            (parseFloat(getStyle(cTarget,"paddingRight")) || 0);
        }
        if(key.indexOf("s") >= 0){
            style["top"] =  orgStyles["orgcHeight"].value - 
                            parseInt(position["height"]) - 
                            parseInt(position["bottom"]) + 
                            (parseFloat(getStyle(cTarget,"paddingTop")) || 0) + 
                            (parseFloat(getStyle(cTarget,"paddingBottom")) || 0);
        }
        baidu.setStyles(handle,style);
        return style;
    }

    /**
     * 获取target 和 cTarget 的宽高
     * @return void
     *
     */
    function getOrgStyle(){
        function s(t,style){
           style = style.toLowerCase();
           var tmp = getStyle(t,style);
           if(tmp == "auto" || tmp.indexOf("%") > 0)
               return tmp;

           return parseFloat(getStyle(t, style)) || 0;
        }

        baidu.each(orgStyleStr,function(item){
            orgStyles["org" + item[2] + item[1]] = {
                value : s(item[0],item[1]),
                direction : item[1],
                target : item[0],
                offset : item[0][item[3]]
            }
        });
    }
};
