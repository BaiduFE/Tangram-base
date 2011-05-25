<?php
class Config{
	public static $BROWSERS = array(
	'ie6'=>array('10.81.58.63', "C:\\Program Files\\Internet Explorer\\iexplore.exe")
	,'maxthon'=>array('10.81.58.63', "C:\\Program Files\\Maxthon3\\Bin\\Maxthon.exe")
	,'firefox'=>array('10.81.58.63', "C:\\Program Files\\mozilla firefox\\firefox.exe")
	,'ie7'=>array('10.81.58.86', "C:\\Program Files\\Internet Explorer\\iexplore.exe")
	,'chrome'=>array('10.81.58.86', "C:\\Documents and Settings\\geqa3\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe")
	,'opera'=>array('10.81.58.86', "C:\\Program Files\\Opera\\opera.exe")
	,'ie8'=>array('10.81.58.64', "C:\\Program Files\\Internet Explorer\\iexplore.exe")
	,'safari'=>array('10.81.58.64', "C:\\Program Files\\Safari\\Safari.exe")
	//	,'360'=>array('10.81.23.220', "C:\\Program Files\\360\\360se3\\360SE.exe")
	//	, 'baidu'=>array('10.81.21.93', "C:\\Program Files\\baidu\\baidubrowser\\baidubrowser.exe")
	);

	public static $DEBUG = false;

	public static $HISTORY_REPORT_PATH = '/report';

	public static function StopAll(){
		$hostarr = array();
		foreach (Config::$BROWSERS as $b=>$h){
			$host = $h[0];
			if(array_search($host, $hostarr))
			continue;
			array_push($hostarr, $host);
			require_once 'lib/Staf.php';
			Staf::process_stop('', $host, true);
			Staf::process("free all");
		}
	}
	/**
	 * 源码路径配置，会在所有位置寻找源码
	 * @var ArrayIterator::String
	 */
	public static $SOURCE_PATH = array("../../../src/",
		"../../../../Tangram-base/src/",
		"../../../../tangram/src/"
		);

		/**
		 * 覆盖率相关源码所在路径，如果路径中没有找到会回到$SOURCH_PATH中查找
		 * @var string
		 */
		public static $COVERAGE_PATH = "../../../test/coverage/";
}
?>