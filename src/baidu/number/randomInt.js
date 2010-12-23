
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/number/randomInt.js
 * author: berg
 * version: 1.0.0
 * date: 2010/12/14
 */

///import baidu.number;

/**
 * 生成随机整数
 * @name baidu.number.randomInt
 * @function
 * @grammar baidu.number.randomInt(min, max) 
 * 
 * @param 	{number} min 	随机整数的最小值
 * @param 	{number} max 	随机整数的最大值
 * @return 	{number} 		生成的随机整数
 */
baidu.number.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};
