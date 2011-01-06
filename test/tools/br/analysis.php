<?php
/**
 * 
 * 分析源码引入及依赖关系，提供单次读取中的文件载入缓存
 * @author yangbo
 *
 */
class Analysis{
	/**
	 * 缓存数据提高效率，c映射内容，i映射依赖列表，s映射缩略名称
	 * @var array
	 */
	static private $_cache = array();
	static private $projpath = array();

	public static $DEBUG = false;

	var $circle = array();

	public function Analysis(){
		$ss = explode('/', substr($_SERVER['SCRIPT_NAME'], 1));
		if(sizeof(self::$projpath) == 0){
			self::$projpath[0] = '../../../src/';
			self::$projpath[1] = '../../../../tangram/src/';
				
			//TODO : 项目路径提取方式应该考虑使用test切分，用于支持ui项目使用同一套框架
		}
	}

	/**
	 * 因测试需要更新的引入方法，domain支持多个通过,分割，支持第二参数忽略已经引入内容，递归判定跳过的入口必须提前
	 * @param $domain 期望载入的依赖库
	 * @param $exclude 期望排除的依赖库
	 * @param $parent 解决相互依赖问题
	 */
	public function get_import_srcs($domain, $recurse = true){
		if(self::$DEBUG) print "分析$domain<br />";

		if(array_search($domain, $this->circle)) return array();//如果已经被分析过则直接返回
		array_push($this->circle, $domain);

		$include = array();
		$cnts = self::get_src_cnt($domain);
		$is = $cnts['i'];
		if(sizeof($is) > 0)
		foreach($is as $d){
			if($recurse)
			$include = array_merge($include, $this->get_import_srcs($d));
			else
			$include[$d] = self::$_cache[$d];
		}

		//因为依赖关系的前后联系，最后在include中加入当前domain
		if($recurse)
		$include[$domain] = $cnts['c'];
		return $include;
	}


	/**
	 * 读取源文件内容，支持缓存
	 * @param string $domain
	 */
	static function get_src_cnt($domain){
		new Analysis();
		if(!array_key_exists($domain, self::$_cache)){
			$path = join('/', explode('.', $domain)).'.js';
//			echo "read [$path]\n";
			//文件在当前项目存在则取当前项目，否则取tangram项目
			$cnt = file_get_contents(self::$projpath[(file_exists(self::$projpath[0].$path) ? 0:1/*self::$projpath[0] : self::$projpath[1]*/)].$path);

			if(self::$DEBUG)
			print "start read file $domain<br />";

			$is = array();
			//正则匹配，提取所有(///import xxx;)中的xxx
			preg_match_all('/\/\/\/import\s+([^;]+);?/ies', $cnt, $is, PREG_PATTERN_ORDER);

			//移除//，顺便移除空行
			//			$cnt = preg_replace('/\/\/.*/m', '', $cnt);TODO:正则处理出现在“”或者正则中的//时出现问题
			//移除/**/
			//			$cnt = preg_replace('/\/\*.*\*\//sU', '', $cnt);

			self::$_cache[$domain] = array('c'=>$cnt, 'i'=>$is[1]);
		}
		return self::$_cache[$domain];
	}

	/**
	 * 切割支持f和e参数的','分割
	 * @param unknown_type $domains
	 */
	static function gis_withsplit($domains){
		$include = array();
		$analysis = new Analysis();
		foreach ($domains as $d){//支持切分
			$include = array_merge($include, $analysis->get_import_srcs($d));
		}
		return $include;
	}
	
	/**
	 * 极少数情况下存在多个短名称，短域名数组会包含自己
	 * @param string $domain
	 */
	static function get_short_name($domain){
		$shortnames = array();
		$cnt = self::get_src_cnt($domain);
		preg_match_all("/(baidu\.[^=]+)(=\sbaidu\.[^=]+)?=\s".preg_quote($domain).";/", $cnt['c'], $is, PREG_PATTERN_ORDER);

		for($i = 1, $len = sizeof($is); $i < $len; $i++){
			if(sizeof($is[$i]) == 0 || strlen($is[$i][0]) == 0)
			continue;
			array_push($shortnames, trim($is[$i][0], '= '));
		}
		array_push($shortnames, $domain);
		return $shortnames;
	}
}
//
//
///**
// * 分析该文件是否存在冗余引用，获取import列表、分析当前代码中是否有相关关键词的适用场景
// * <li>///import baidu; baidu.browser = baidu.browser || {};
// * @param unknown_type $domain
// */
//function analysisSplithJs($domain){
//
//}
//
//require_once 'config.php';
//if(Config::$DEBUG){
//	//	header("Content-type: text/plain; charset=utf-8");
//	$analysis = new Analysis();
//	$domain = 'baidu.dom.getPosition';
//	$list = $analysis->get_import_srcs($domain, false);
//	$cnt = Analysis::get_src_cnt($domain);
//
//	print "<textarea rows=40 cols=100>".$cnt['c']."</textarea><br />";
//
//	foreach($list as $name=>$cc){
//		//分析原名和短名引用情况
//		$short = Analysis::get_short_name($name);
//		if(sizeof($short) == 0)
//		continue;
//		foreach($short as $name){
//			$n = preg_quote($name);
//			$regs = array("$n\([^\)]+\)[,;]"/*匹配方法调用模式*/, "{$n}[,;]"/*匹配重命名模式*/);
//			foreach($regs as $reg){
//				print "*****************regex : /".$reg."/****************<br />";
//				preg_match_all("/$reg/", $cnt['c'], $is, PREG_PATTERN_ORDER);
//				var_dump($is);
//				print "<br />*********************regex end********************<br />";
//			}
//		}
//	}
//
//	//	preg_match_all("/"."\s=\sbaidu\.dom\.getDocument\([^\)]+\)[,;]"."/", $cnt['c'], $is, PREG_PATTERN_ORDER);
//	//	var_dump($is);
//	/* 分析源码引用情况：
//	 * 1、
//	 */
//
//	//	print "*****************************<br />{$cnt['c']}***************************<br />";
//	//
//	//	foreach($list as $im_domain => $item){
//	//		$im_cnt = Analysis::get_src_cnt($im_domain);
//	//		$im_domain_short = Analysis::get_short_name($domain);
//	//		//必须获得相关域名的缩略名
//	//		preg_match_all('/'.$im_domain.'/s', $im_cnt['c'], $is0, PREG_PATTERN_ORDER);
//	//		if($im_domain_short !== ''){
//	//			preg_match_all('/'.$im_domain_short.'/s', $im_cnt['c'], $is1, PREG_PATTERN_ORDER);
//	//			$is0 = array_merge($is0, $is1);
//	//		}
//	////		print_r($is0);
//	////	}
//}
?>
