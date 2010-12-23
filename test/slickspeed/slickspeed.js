/**
 * Created by IntelliJ IDEA.
 * User: wenyuxiang
 * Date: Sep 9, 2010
 * Time: 11:33:02 PM
 * To change this template use File | Settings | File Templates.
 */
var TEST = {
    $n: 20,
    $timeout: 600,
    $tests: [{
        $name: 'jSelector',
        $page: 'pages/jselector.html'
    },{
        $name: 'QWrap',
        $page: 'pages/qw.html'
    },{
        $name: 'Sizzle',
        $page: 'pages/sizzle.html'
    }],
    $cases: [
        ['body'],
        ['div'],
        ['body div'],
        ['div p'],
        ['div > p'],
        ['div + p'],
        ['div ~ p'],
        ['div[class^=exa][class$=mple]'],
        ['div p a'],
//      ['div, p, a'],
        ['.note'],
        ['div.example'],
        ['ul .tocline2'],
        ['div.example, div.note'],
        ['#title'],
        ['h1#title'],
        ['div #title'],
        ['ul.toc li.tocline2'],
        ['ul.toc > li.tocline2'],
        ['h1#title + div > p'],
        ['h1[id]:contains(Selectors)'],
        ['a[href][lang][class]'],
        ['div[class]'],
        ['div[class=example]'],
        ['div[class^=exa]'],
        ['div[class$=mple]'],
        ['div[class*=e]'],
        ['div[class|=dialog]'],
        ['div[class!=made_up]'],
        ['div[class~=example]'],
        ['div:not(.example)'],
        ['p:contains(selectors)'],
        ['p:nth-child(even)'],
        ['p:nth-child(2n)'],
        ['p:nth-child(odd)'],
        ['p:nth-child(2n+1)'],
        ['p:nth-child(n)'],
        ['p:only-child'],
        ['p:last-child'],
        ['p:first-child']
    ],
    $register: null
};
(function (TEST){
    function genResultsTableHtml(){
        var numCols = TEST.$tests.length;
        var numRows = TEST.$cases.length;
        var html = '<table><thead><tr>';
        var x, y,
            heads = ['<th>cases</th>'],
            foots = ['<th>total time</th>'];
        for (x=0; x<numCols; x++) {
            heads[x+1] = '<th>'+ TEST.$tests[x].$name +'</th>';
            foots[x+1] = '<th></th>';
        }
        html += heads.join('') +'</tr></thead><tfoot>'+ foots.join('') +'</tfoot><tbody>';
        var rows = [];
        for (y=0; y<numRows; y++) {
            var cells = ['<th>'+ TEST.$cases[y] +'</th>'];
            for (x=0; x<numCols; x++) {
                cells[x+1] = '<td></td>';
            }
            rows[y] = '<tr>'+ cells.join('') +'</tr>';
        }
        return html+ rows.join('') + '</tbody></table>';
    }
    document.getElementById('results').innerHTML = genResultsTableHtml();

    function setTestCaseResult(iTest, iCase, result){
        var div = document.getElementById('results');
        var table = div.firstChild;
        table.tBodies[0].rows[iCase].cells[iTest + 1].innerHTML = result;
    }
    function setTestTotalResult(iTest, result){
        var div = document.getElementById('results');
        var table = div.firstChild;
        table.tFoot.rows[0].cells[iTest+1].innerHTML = result;
    }

    var ALL_TESTS = [];
    TEST.$register = function (test){
        ALL_TESTS.push(test);
    };

    var RESULTS = [];
    var STARTED = false;
    var I_TEST;
    var I_CASE;
    var RESUME_CALLBACK;
    var PAUSING = false;
    var PAUSE = false;
    function runCurrentTestCase(){
        var n = TEST.$n;
        var timeout = TEST.$timeout;
        var args = TEST.$cases[I_CASE];
        var startTime = +new Date();
        for (var i=0; i<n; i++) {
            ALL_TESTS[i].apply(null, args);
            var time = (+new Date() - startTime);
            if (time > timeout) {
                RESULTS[I_TEST][I_CASE] = time;
                setTestCaseResult(I_TEST, I_CASE, time + 'ms | slow!');
                return;
            }
        }
        RESULTS[I_TEST][I_CASE] = time;
        setTestCaseResult(I_TEST, I_CASE, time + 'ms');
    }

    function runCurrentTestAllCase(callback){

        var numCases = TEST.$cases.length;
        function runCase(iCase){
            if (iCase < numCases) {
                I_CASE = iCase;
                runCurrentTestCase();
                setTimeout(function _(){
                    if (PAUSING) {
                        PAUSE = true;
                        PAUSING = false;
                        RESUME_CALLBACK = _;
                    } else if (!PAUSE) {
                        runCase(iCase + 1);
                    }
                });
            } else {
                var testResults = RESULTS[I_TEST];
                var total = 0;
                for (var i=0; i<testResults.length; i++) {
                    total += testResults[i];
                }
                setTestTotalResult(I_TEST, total);
                setTimeout(callback);
            }
        }

        ALL_TESTS = [];
        RESULTS[I_TEST] = [];
        var N = TEST.$n;
        var div = document.getElementById('iframes');
        div.innerHTML = '';
        var src = TEST.$tests[I_TEST].$page;
        for (var i=0; i<N; i++) {
            var iframe = document.createElement('iframe');
            div.appendChild(iframe);
            iframe.src = src +'?i='+ i;
        }

        (function wait(){
            if (ALL_TESTS.length === N) {
                runCase(0);
            } else {
                setTimeout(wait);
            }
        })();
    }

    function runAllTestCase(callback){
        
        var numTests = TEST.$tests.length;
        function runTest(iTest){
            if (iTest < numTests) {
                I_TEST = iTest;
                runCurrentTestAllCase(function (){
                    runTest(iTest + 1);
                });
            } else {
                setTimeout(callback);
            }
        }
        runTest(0);
    }

    function run(){
        runAllTestCase(function (){

        });
    }

    function onStart_Click(){
        if (!STARTED) {
            STARTED = true;
            run();
        } else {
            if (PAUSE) {
                PAUSE = false;
                if (RESUME_CALLBACK) {
                    var callback = RESUME_CALLBACK;
                    RESUME_CALLBACK = null;
                    callback();
                }
            }
        }
    }
    function onStop_Click(){
        if (!PAUSE) {
            PAUSING = true;
        }
    }
    document.getElementById('start').onclick = onStart_Click;
    document.getElementById('stop').onclick = onStop_Click;
})(TEST);