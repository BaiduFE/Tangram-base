<?php
$p1 = $_GET['info'];
$filename = 'tmp.inf.txt';
$handle = fopen($filename, "r");
//Cannot marshal false to BinaryOutput
//fread($file_pointer, $p1);
$contents = fread($handle, filesize($filename));
fclose($handle);
$t;
if(strstr($contents,$p1) != '') {
	$t = true;
} else {
	$t = false;
}
if(file_exists($filename))
	unlink($filename);
echo true;
?>