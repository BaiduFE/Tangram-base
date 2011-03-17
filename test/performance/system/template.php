<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" debug="true">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<?php
		$include = $_GET['include'];
		foreach (explode(',', $include) as $single) {
			echo '<script type="text/javascript" src="../frameworks/' . $single . '"></script>';
		}
	?>
	<script type="text/javascript" src="../tests/<?php echo $_GET['function'] ?>-tests.js"></script>
	
	<script type="text/javascript">
		 function test(selector){
		     var code = tests[selector];// && (tests[selector].toSource || tests[selector].toString)();
		     try {
		         var results = tests[selector] ? tests[selector]() : [-1, 999999999999999];
		         var elements = results[0];
		         var time = results[1];
		      return {'time': time, 'found': elements, 'code':code };
		    } catch(err){
		         if (elements == undefined) elements = {length: -1};
		       return ({'time': time, 'found': elements, 'error': err, 'code':code });
		     }
		 }
         
		testTangram = testjquery = testmootools = function (selector) {
			var data = tests[selector],
				i = data.count,
				code = data.code,
				start = data.start,
				end = data.end;

			if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
				if (document.documentMode || parseFloat(RegExp['\x241']) < 8) {
					i = data.count = i / 2;
				}
			}

			start ? start(data.count) : tests.start(data.count);

			document.body.offsetWidth;
			var start = new Date().getTime();
			while (i--) {
				code(i);
			}
			document.body.offsetWidth;
			var time = new Date().getTime() - start;

			end ? end(data.count) : tests.end(data.count);

			return {'time': time, 'found': data.count, 'code': code.toString()};
		}
	</script>
	
</head>

<body>
</body>
<script>
		parent.window.testRunner1 && parent.window.testRunner1();
</script>
</html>
