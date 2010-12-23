<?php

class Request{
	public $params;
	public $is_empty;
	public $ps;
	public function Request($info){
		$this->params = is_array($info)?$info['QUERY_STRING']:$info;
		if(strlen($this->params) == 0){
			$this->is_empty = true;
			return;
		}
		$ps = explode(',', $this->params);
		$this->ps = array();
		foreach($ps as $p){
			$pp = explode('=', $p);
			$this->ps[$pp[0]] = $pp[1];
		}
	}

	public function contain($key){
		return !$this->is_empty && array_key_exists($key, $this->ps);
	}

	public function get($key){
		if($this->contain($key)){
			return $this->ps[$key];
		}
		return '';
	}
}
?>