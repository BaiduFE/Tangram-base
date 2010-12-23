window.tests = {
    'start': function (count) {
        var html = [];
        while (count--) {
            html.push('<div id="test' + count + '" class="test test' + count + ' test' + count + '"></div>');
        }
        document.body.innerHTML = html.join('');
    },

    'end': function (count) {
    },

	'baidu.dom.g': {
		'code': function (i) {
            baidu.dom.g('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.addClass': {
		'code': function (i) {
            baidu.dom.addClass('test' + i, 'custom');
        },
		'count': 2000
	},

	'baidu.dom.removeClass': {
		'code': function (i) {
            baidu.dom.removeClass('test' + i, 'test' + i);
        },
		'count': 2000
	},

	'baidu.dom.hide': {
		'code': function (i) {
            baidu.dom.hide('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.show': {
        'start': function (count) {
            var html = [];
            while (count--) {
                html.push('<div id="test' + count + '" class="test test' + count + '" style="display:none"></div>');
            }
            document.body.innerHTML = html.join('');
        },
		'code': function (i) {
            baidu.dom.show('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.insertHTML': {
		'code': function (i) {
            baidu.dom.insertHTML('test' + i, 'beforeEnd', '<span>this is span!</span>');
        },
		'count': 2000
	},

    'baidu.dom.remove': {
		'code': function (i) {
            baidu.dom.remove('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.getPosition': {
		'code': function (i) {
            baidu.dom.getPosition('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.first': {
		'code': function (i) {
            baidu.dom.first('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.last': {
		'code': function (i) {
            baidu.dom.last('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.next': {
		'code': function (i) {
            baidu.dom.next('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.prev': {
		'code': function (i) {
            baidu.dom.prev('test' + i);
        },
		'count': 2000
	},

	'baidu.string.trim': {
        'start': function () {
        },
        'end': function () {
        },
		'code': function (i) {
            baidu.string.trim('  hello, world  ');
        },
		'count': 2000
	}
};
