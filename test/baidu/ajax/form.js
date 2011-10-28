module('baidu.ajax.form');
function createForm() {
	var div, form, text1, text2, hid, cb1, cb2, rb1, rb2, pass, textArea, sel, selmul, button;
	div = document.createElement('div');
	div.id = 'test_div';
	form = document.createElement('form');
	form.id = 'test_form';

	text1 = document.createElement('input');
	text2 = document.createElement('input');
	hid = document.createElement('input');
	rb1 = document.createElement('input');
	rb2 = document.createElement('input');
	cb1 = document.createElement('input');
	cb2 = document.createElement('input');
	pass = document.createElement('input');
	textArea = document.createElement('textarea');
	sel = document.createElement('select');
	selmul = document.createElement('select');
	button = document.createElement('button');

	div.appendChild(form);
	document.body.appendChild(div);

	text1.type = "text";
	text1.disabled = "disabled";
	text1.value = "disable";

	text2.type = "text";
	text2.value = "param&1";
	text2.name = "param1";

	hid.type = "hidden";
	hid.name = "param2";
	hid.value = "param2";

	form.appendChild(text1);
	form.appendChild(text2);
	form.appendChild(hid);

	rb1.type = "radio";
	rb1.value = "rb1";
	rb1.name = "rb";
	rb2.type = "radio";
	rb2.value = "rb2";
	rb2.name = "rb";
	cb1.name = "cb";
	cb1.type = "checkbox";
	cb1.value = "cb1";
	cb2.name = "cb";
	cb2.type = "checkbox";
	cb2.value = "cb2";

	form.appendChild(cb1);
	form.appendChild(cb2);
	form.appendChild(rb1);
	form.appendChild(rb2);

	rb2.checked = true;
	cb1.checked = true;

	pass.type = "password";
	pass.value = "pwd";
	pass.name = "pwd";

	textArea.name = "ta";
	textArea.value = "textarea";

	sel.name = "sel";
	sel.options[sel.options.length] = new Option('1', '1');
	sel.options[sel.options.length] = new Option('2', '2');
	sel.options[sel.options.length] = new Option('3', '3');
	sel.options[2].selected = "selected";

	selmul.name = "selmul";
	selmul.multiple = "multiple";
	selmul.options[selmul.options.length] = new Option('1', '1');
	selmul.options[selmul.options.length] = new Option('2', '2');
	selmul.options[selmul.options.length] = new Option('3', '3');
	selmul.options[selmul.options.length] = new Option('4', '4');
	selmul.options[0].selected = "selected";
	selmul.options[1].selected = "selected";
	selmul.options[2].selected = "selected";

	button.id = "sub";
	button.value = "提交";

	form.appendChild(pass);
	form.appendChild(textArea);
	form.appendChild(sel);
	form.appendChild(selmul);
	form.appendChild(button);
	return form;
}

function check(method, sync, ajax_options, result) {
	var f = createForm();
	f.action = (upath || '') + 'form.php';
	f.method = method || 'get';
	var result = result
			|| ('param1=param&1&param2=param2&cb=cb1&'
					+ 'rb=rb2&pwd=pwd&ta=textarea&sel=3&selmul=3');
	!sync && QUnit.stop();

	var options = {
		onsuccess : function(xhr, text) {
			equals(text, result, 'check result');
			$('div#test_div').remove();
			!sync && QUnit.start();
		},
		onfailure : function(xhr) {
			ok(false, 'failure : ' + xhr.status);
			!sync && QUnit.start();
		}
	};
	if (typeof sync !== 'undefine')
		options.async = !sync;

	if (ajax_options) {
		$.each(ajax_options, function(i, o) {
			options[i] = o;
		});
	}
	baidu.ajax.form(f, options);
}

test("get", function() {
	check();
});

test("post", function() {
	check('post');
});

test("get sync", function() {
	check(0, true);
});

test("post sync", function() {
	check('post', true);
});

test("get async options", function() {
	var options = {
		headers : "text/xml",
		username : "tester",
		password : '123',
		onbeforerequest : function(xhr) {
			ok(true, "onbeforerequest is called");
			// start();
		}
	};
	check(0, false, options);
});

test("get sync options", function() {

	var options = {
		headers : "text/xml",
		username : "tester",
		password : '123',
		onbeforerequest : function(xhr) {
			ok(true, "onbeforerequest is called");
		}
	};
	check(0, true, options);
});

test("post async options", function() {
	var options = {
		headers : "text/xml",
		username : "tester",
		password : '123',
		onbeforerequest : function(xhr) {
			ok(true, "onbeforerequest is called");
		}
	};
	check('post', false, options);
});

test("post sync options", function() {
	var options = {
		headers : "text/xml",
		username : "tester",
		password : '123',
		onbeforerequest : function(xhr) {
			ok(true, "onbeforerequest is called");
		}
	};
	check('post', true, options);
});

test("get async replacer", function() {
	var options = {
		replacer : function(value, key) {
			return 0;
		}
	};
	var result = 'param1=0&param2=0&cb=0&rb=0&pwd=0&ta=0&sel=0&selmul=0';
	check(0, false, options, result);
});

test("get sync options", function() {
	var options = {
		replacer : function(value, key) {
			return 0;
		}
	};
	var result = 'param1=0&param2=0&cb=0&rb=0&pwd=0&ta=0&sel=0&selmul=0';
	check(0, true, options, result);
});

test("post async options", function() {
	var options = {
		replacer : function(value, key) {
			return 0;
		}
	};
	var result = 'param1=0&param2=0&cb=0&rb=0&pwd=0&ta=0&sel=0&selmul=0';
	check('post', false, options, result);
});

test("post sync options", function() {
	var options = {
		replacer : function(value, key) {
			return 0;
		}
	};
	var result = 'param1=0&param2=0&cb=0&rb=0&pwd=0&ta=0&sel=0&selmul=0';
	check('post', true, options, result);
});
