module("baidu.ajax.log");

test("onsuccess",
		function() {
			stop();
			var check = function() {
				var now = Date.now();
				var arg = "info=test" + now;
				var urlstring = upath + 'log.php?' + arg;
				//
				baidu.ajax.log(urlstring);
				setTimeout(function() {
					var urlstring = upath + "logcheck.php";
					var xhr = baidu.ajax.post(urlstring, successAction);
					function successAction(xhr, text) {
//						equals(text, "true", "true");
//						equals(xhr.responseText, "true", "true");
						start();
					}
				}, 1000);

			};
			ua.importsrc('baidu.ajax.post', check, 'baidu.ajax.post',
					'baidu.ajax.log');
		});