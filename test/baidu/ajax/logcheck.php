<?php
$p1 = $_POST['loginfo'];
$filename = $_POST['file'];

$handle = fopen($filename, "r");
//Cannot marshal false to BinaryOutput
//fread($file_pointer, $p1);
$contents = fread($handle, filesize($filename));
echo $contents;
fclose($handle);
if(file_exists($filename))
	unlink($filename);
?>