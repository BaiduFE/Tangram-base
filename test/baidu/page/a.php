<?php
$type = $_GET['type'];
$file = $_GET['file'];
if($type == 'js'){
	header("Content-type: text/html; charset=utf-8");
}else if($type == 'css'){
	header("Content-type: text/css; charset=utf-8");
}else{
	header("Content-type: text/plain; charset=utf-8");
}
echo file_get_contents($file);