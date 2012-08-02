/**
 * auth: jiangshuguang
 */

  function creatJscoverage(){
     try {
         if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
             // this is a browser window that was opened from another window
             if (! top.opener._$jscoverage) {
                 top.opener._$jscoverage = {};
             }
         }
     }

     catch (e) {}
     try {
         if (typeof top === 'object' && top !== null) {
             // this is a browser window
             try {
                 if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
                     top._$jscoverage = top.opener._$jscoverage;
                 }
             }
             catch (e) {}

             if (! top._$jscoverage) {
                 top._$jscoverage = {};
             }
         }
     }
     catch (e) {}

     try {
         if (typeof top === 'object' && top !== null && top._$jscoverage) {
             _$jscoverage = top._$jscoverage;
         }
     }
     catch (e) {}
     if (typeof _$jscoverage !== 'object') {
         _$jscoverage = {};
     }
 }

(function(){
    var xmlDoc;
    if (window.ActiveXObject)
      {
         xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
         if(xmlDoc != null)
         {
             xmlDoc.async=true;
             xmlDoc.load("coverage_report.xml");
         }
//        xmlDoc.onreadystatechange=function(){
//            alert("onreadystatechange");
//        };
       }
     else if(document.implementation && document.implementation.createDocument)
      {
            var xmlHttp=new window.XMLHttpRequest();
            xmlHttp.open("GET","coverage_report.xml",false);
            xmlHttp.send(null);
            xmlDoc = xmlHttp.responseXML;
//            xmlDoc= document.implementation.createDocument("","doc",null);
//            xmlDoc.load("coverage_report.xml");
            // xmlDoc.onload =readXML;
      }else{

         xmlDom=null;
    }
    function readCoverage(){
        creatJscoverage();
        var nodeNumber=xmlDoc.getElementsByTagName("testsuite").length;
        for(i=0;i<nodeNumber;i++)
        {
            var nodeName= xmlDoc.getElementsByTagName("testsuite")[i];
            var casename=nodeName.getAttribute("casename");
            if(!_$jscoverage[casename]){
                _$jscoverage[casename]=[];
            }
            var line=nodeName.childNodes.length;
            for(var j=0;j<line;j++)
            {
                if(nodeName.childNodes[j].nodeType==1){
                    var lineNumber=  nodeName.childNodes[j].getAttribute("lineNumber");
                    var covNumber =  nodeName.childNodes[j].getAttribute("covNumber");
                    _$jscoverage[casename][parseInt(lineNumber)]= parseInt(covNumber);
                }
            }
        }
            loadSource();
    }
    if(window.ActiveXObject){
        alert("Your browser is IE,click confirm button to continue ");
        readCoverage();
    } else{
        readCoverage();
    }
})();


