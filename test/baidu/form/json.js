module('baidu.form.json');
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
	button.value = "提交";

	form.appendChild(pass);
	form.appendChild(textArea);
	form.appendChild(sel);
	form.appendChild(selmul);
	form.appendChild(button);
	return form;
}

test("传入form，返回结果", function() {
    var f = createForm();
	baidu.form.json(f);
});
