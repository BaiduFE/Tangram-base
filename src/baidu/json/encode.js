/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu/json/encode.js
 * author: erik, cat
 * version: 1.3.4
 * date: 2010/12/23
 */

///import baidu.json.stringify;

/**
 * 将json对象序列化，为过时接口，今后会被baidu.json.stringify代替
 * @name baidu.json.encode
 * @function
 * @grammar baidu.json.encode(value)
 * @param {JSON} value 需要序列化的json对象
 * @meta out
 * @see baidu.json.decode,baidu.json.stringify
 *             
 * @returns {string} 序列化后的字符串
 */
baidu.json.encode = baidu.json.stringify;
