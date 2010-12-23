// Copyright (c) 2009, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 * 
 * path: baidu.js
 * author: allstar, erik
 * version: 1.1.0
 * date: 2009/12/2
 */

/**
 * 声明baidu包
 */
var baidu = baidu || {version: "dev"}; 
baidu.guid = "$BAIDU$";//提出guid，防止修改window[undefined] 20100504 berg

/**
 * meizz 2010/02/04
 * 顶级域名 baidu 有可能被闭包劫持，而需要页面级唯一信息时需要用到下面这个对象
 */

window[baidu.guid] = window[baidu.guid] || {};
