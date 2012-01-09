module('baidu.form.json');
function createForm() {
	var div, form, text1, text2, hid, cb1, cb2, rb1, rb2, pass, textArea, sel, selmul, button;
	div = document.createElement('div');
	div.id = 'test_div';
	form = document.createElement('form');
	form.id = 'test_form';

	text1 = document.createElement('input');
	text2 = document.createElement('input');
	text3 = document.createElement('input');
	text4 = document.createElement('input');
	hid = document.createElement('input');
	rb1 = document.createElement('input');
	rb2 = document.createElement('input');
	cb1 = document.createElement('input');
	cb2 = document.createElement('input');
	cb3 = document.createElement('input');
	pass = document.createElement('input');
	bu = document.createElement('input');
	textArea = document.createElement('textarea');
	sel = document.createElement('select');
	selmul = document.createElement('select');
	button = document.createElement('button');

	div.appendChild(form);
	document.body.appendChild(div);

	text1.type = "text";
	text1.name = "disable";
	text1.value = "disable";
	text1.disabled = "disabled";

	text2.type = "text";
	text2.name = "param1";
	text2.value = "param&1 测试中文";
	text3.type = "text";
	text3.name = "param2";
	text3.value = "";
	text4.type = "text";
	text4.value = "param3";

	hid.type = "hidden";
	hid.name = "hidden3";
	hid.value = "hidden3";

	form.appendChild(text1);
	form.appendChild(text2);
	form.appendChild(text3);
	form.appendChild(text4);
	form.appendChild(hid);

	rb1.type = "radio";
	rb1.name = "rb";
	rb1.value = "rb1";
	rb2.type = "radio";
	rb2.name = "rb";
	rb2.value = "rb2";
	cb1.type = "checkbox";
	cb1.name = "cb";
	cb1.value = "cb1";
	cb2.type = "checkbox";
	cb2.name = "cb";
	cb2.value = "cb2";
	cb3.type = "checkbox";
	cb3.name = "cb";
	cb3.value = "cb3";

	form.appendChild(cb1);
	form.appendChild(cb2);
	form.appendChild(cb3);
	form.appendChild(rb1);
	form.appendChild(rb2);

	rb2.checked = true;
	cb1.checked = true;
	cb3.checked = true;

	pass.type = "password";
	pass.name = "pwd";
	pass.value = "pwd";

	bu.type = "button";
	bu.name = "bu";
	bu.value = "bu1";
	
	textArea.name = "ta";
	textArea.value = "textarea";

	sel.name = "sel";
	sel.options[sel.options.length] = new Option('1', '1');
	sel.options[sel.options.length] = new Option('2', '2');
	sel.options[sel.options.length] = new Option('3', '3');
	sel.options[2].selected = "selected";

    selmul.name = "selmul";
    selmul.multiple = "multiple";
    if(selmul.type != 'select-multiple'){
        selmul = document.createElement('<select name="selmul" multiple="true"></select>');
    }
	selmul.options[selmul.options.length] = new Option('1', '1');
	selmul.options[selmul.options.length] = new Option('2', '2');
	selmul.options[selmul.options.length] = new Option('3', '3');
	selmul.options[selmul.options.length] = new Option('4', '4');
	selmul.options[0].selected = "selected";
	selmul.options[1].selected = "selected";
	selmul.options[2].selected = "selected";

	button.id = "sub";
	button.name = "sub";
	button.value = "提交";

	form.appendChild(pass);
	form.appendChild(bu);
	form.appendChild(textArea);
	form.appendChild(sel);
	form.appendChild(selmul);
	form.appendChild(button);
	return form;
}

test("传入form，返回结果", function() {
	expect(13);
	var count = 0;
    var f = createForm();
	var j = baidu.form.json(f);
	for(var i in j )
		count ++;
	equals(count, 9, "9 arears");
	equals(j.param1, "param%261%20测试中文", "The text input(escapeUrl) is right");
	equals(j.param2, "", "The text input(no value) is right");
	equals(j.hidden3, "hidden3", "The text input(hidden) is right");
	equals(j.cb[0], "cb1", "The combox is right");
	equals(j.cb[1], "cb3", "The combox is right");
	equals(j.rb, "rb2", "The radio is right");
	equals(j.pwd, "pwd", "The password is right");
	equals(j.ta, "textarea", "The textarea is right");
	equals(j.sel, "3", "The select is right");
	equals(j.selmul[0], "1", "The selmul is right");
	equals(j.selmul[1], "2", "The selmul is right");
	equals(j.selmul[2], "3", "The selmul is right");
	$(f).remove();
});
