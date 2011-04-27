<?php
/***************************************************************************
 * 
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * sleep.php ~ 2011/04/18 21:44:52
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/


$time = $_GET["time"];

sleep(intval($time));

header("Content-Type: text/plain");
echo "OK";




/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
?>
