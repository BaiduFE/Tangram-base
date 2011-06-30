<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0" xmlns:lxslt="http://xml.apache.org/xslt"
	xmlns:stringutils="xalan://org.apache.tools.ant.util.StringUtils">
	<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"></fo:root>
	<xsl:output method="html" indent="yes" encoding="US-ASCII"
		doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />
	<xsl:decimal-format decimal-separator="."
		grouping-separator="," />
	<!-- Licensed to the Apache Software Foundation (ASF) under one or more 
		contributor license agreements. See the NOTICE file distributed with this 
		work for additional information regarding copyright ownership. The ASF licenses 
		this file to You under the Apache License, Version 2.0 (the "License"); you 
		may not use this file except in compliance with the License. You may obtain 
		a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless 
		required by applicable law or agreed to in writing, software distributed 
		under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES 
		OR CONDITIONS OF ANY KIND, either express or implied. See the License for 
		the specific language governing permissions and limitations under the License. -->

	<xsl:param name="TITLE">
		Tangram测试报告
	</xsl:param>

	<!-- Sample stylesheet to be used with Ant JUnitReport output. It creates 
		a non-framed report that can be useful to send via e-mail or such. -->
	<xsl:template match="testsuites">
		<xsl:variable name="failureCount" select="sum(testsuite/@failures)" />

		<html>
			<head>
				<title>
					<xsl:value-of select="$TITLE" />
				</title>
				<style type="text/css">
					body {
					font:normal 68% verdana,arial,helvetica;
					color:#000000;
					}
					table tr td, table tr th {
					font-size: 68%;
					}
					table.details tr th{
					font-weight: bold;
					text-align:left;
					background:#a6caf0;
					}
					table.details tr td{
					background:#eeeee0;
					}

					p {
					line-height:1.5em;
					margin-top:0.5em; margin-bottom:1.0em;
					}
					h1 {
					margin: 0px 0px 5px; font: 165% verdana,arial,helvetica
					}
					h2 {
					margin-top: 1em; margin-bottom: 0.5em; font: bold 125%
					verdana,arial,helvetica
					}
					h3 {
					margin-bottom: 0.5em; font: bold 115%
					verdana,arial,helvetica
					}
					h4 {
					margin-bottom: 0.5em; font: bold 100%
					verdana,arial,helvetica
					}
					h5 {
					margin-bottom: 0.5em; font: bold 100%
					verdana,arial,helvetica
					}
					h6 {
					margin-bottom: 0.5em; font: bold 100%
					verdana,arial,helvetica
					}
					.Error {
					font-weight:bold; color:red;
					}
					.Failure {
					font-weight:bold; color:purple;
					}
					.Properties {
					text-align:right;
					}
				</style>
				<script type="text/javascript">

				</script>
			</head>
			<body>
				<a name="top"></a>
				<xsl:call-template name="pageHeader" />

				<!-- Summary part -->
				<xsl:call-template name="summary" />
				<hr size="1" width="95%" align="left" />

				<!-- Package List part <xsl:call-template name="packagelist" /> <hr size="1" 
					width="95%" align="left" /> -->

				<xsl:if test="$failureCount &gt; 0">
					<!-- For each package create its part -->
					<xsl:call-template name="browsers" />
					<hr size="1" width="95%" align="left" />

					<!-- For each class create the part -->
					<xsl:call-template name="cases" />
				</xsl:if>
				<xsl:if test="$failureCount = 0">
					<img src="http://10.32.34.115:8000/coffee.jpg" />
				</xsl:if>

			</body>
		</html>
	</xsl:template>

	<!-- ================================================================== -->
	<!-- Write a package level report -->
	<!-- It creates a table with values from the document: -->
	<!-- Name | Tests | Errors | Failures | Time -->
	<!-- ================================================================== -->
	<xsl:template name="browsers">
		<h3> Browsers</h3>
		<table class="details" border="0" cellpadding="5" cellspacing="2"
			width="95%">
			<xsl:call-template name="testsuite.test.header" />

			<!-- match the testsuites of this package -->
			<xsl:apply-templates select="/testsuites/testsuite"
				mode="print.test" />
		</table>
		<a href="#top">Back to top</a>
		<p />
		<p />
	</xsl:template>

	<xsl:template name="cases">
		<h3>Cases</h3>
		<table class="details" border="0" cellpadding="5" cellspacing="2"
			width="95%">
			<xsl:call-template name="testcase.test.header" />
			<xsl:for-each select="/testsuites/testsuite[1]/testcase">
				<xsl:sort select="@name" />
				<xsl:call-template name="cases.printcase">
					<xsl:with-param name="casename" select="@name"></xsl:with-param>
				</xsl:call-template>
			</xsl:for-each>
		</table>
	</xsl:template>

	<xsl:template name="cases.printcase">
		<xsl:param name="casename" />
		<xsl:variable name="testCount"
			select="sum(/testsuites/testsuite/testcase[@name=$casename]/@total)" />
		<xsl:variable name="failureCount"
			select="sum(/testsuites/testsuite/testcase[@name=$casename]/@fail)" />
		<xsl:variable name="errorCount"
			select="sum(/testsuites/testsuite/testcase[@name=$casename]/@error)" />

		<xsl:if test="$failureCount &gt; 0">
			<tr>
				<xsl:attribute name="class">
                        <xsl:choose>
                            <xsl:when test="$failureCount &gt; 0">Failure</xsl:when>
                            <xsl:when test="$errorCount &gt; 0">Error</xsl:when>
                        </xsl:choose>
                    </xsl:attribute>
				<td>
					<xsl:value-of select="$casename" />
				</td>
				<td>
					<xsl:value-of select="$testCount" />
				</td>
				<td>
					<xsl:value-of select="$failureCount" />
				</td>
				<td>
					<xsl:value-of select="$errorCount" />
				</td>
				<td>Developing</td>
				<xsl:for-each select="/testsuites/testsuite/testcase[@name=$casename]">
					<xsl:sort select="../@name" />
					<td>
						<xsl:value-of select="@fail" />
					</td>
					<td>
						<xsl:value-of select="@total" />
					</td>
				</xsl:for-each>
			</tr>
		</xsl:if>
	</xsl:template>

	<xsl:template name="summary">
		<h2>Summary</h2>
		<xsl:variable name="testCount" select="sum(testsuite/@tests)" />
		<xsl:variable name="errorCount" select="sum(testsuite/@errors)" />
		<xsl:variable name="failureCount" select="sum(testsuite/@failures)" />
		<xsl:variable name="timeCount" select="sum(testsuite/@time)" />
		<xsl:variable name="successRate"
			select="($testCount - $failureCount - $errorCount) div $testCount" />
		<table class="details" border="0" cellpadding="5" cellspacing="2"
			width="95%">
			<tr valign="top">
				<th>Tests</th>
				<th>Failures</th>
				<th>Errors</th>
				<th>Success rate</th>
				<th>Time</th>
			</tr>
			<tr valign="top">
				<xsl:attribute name="class">
                <xsl:choose>
                    <xsl:when test="$failureCount &gt; 0">Failure</xsl:when>
                    <xsl:when test="$errorCount &gt; 0">Error</xsl:when>
                </xsl:choose>
            </xsl:attribute>
				<td>
					<xsl:value-of select="$testCount" />
				</td>
				<td>
					<xsl:value-of select="$failureCount" />
				</td>
				<td>
					<xsl:value-of select="$errorCount" />
				</td>
				<td>
					<xsl:call-template name="display-percent">
						<xsl:with-param name="value" select="$successRate" />
					</xsl:call-template>
				</td>
				<td>
					<xsl:call-template name="display-time">
						<xsl:with-param name="value" select="$timeCount" />
					</xsl:call-template>
				</td>

			</tr>
		</table>
		<table border="0" width="95%">
			<tr>
				<td style="text-align: justify;">
					Note:
					<i>failures</i>
					are anticipated and checked for with assertions while
					<i>errors</i>
					are unanticipated.
				</td>
			</tr>
		</table>
	</xsl:template>

	<!-- Page HEADER -->
	<xsl:template name="pageHeader">
		<h1>
			<xsl:attribute name="style">color:
			<xsl:if test="sum(testsuite/@failues) &gt; 0">
			red 
		</xsl:if>
		<xsl:if test="sum(testsuite/@failues) = 0">
		green 
		</xsl:if>;
		</xsl:attribute>
			<xsl:value-of select="$TITLE" />
		</h1>
		<table width="100%">
			<tr>
				<td align="left"></td>
				<td align="right">
					Designed for use with
					<a href='http://www.junit.org'>JUnit</a>
					and
					<a href='http://ant.apache.org/ant'>Ant</a>
					.
				</td>
			</tr>
		</table>
		<hr size="1" />
	</xsl:template>

	<xsl:template match="testsuite" mode="header">
		<tr valign="top">
			<th width="80%">Name</th>
			<th>Tests</th>
			<th>Errors</th>
			<th>Failures</th>
			<th nowrap="nowrap">Time(s)</th>
		</tr>
	</xsl:template>

	<!-- class header -->
	<xsl:template name="testsuite.test.header">
		<tr valign="top">
			<th width="80%">Name</th>
			<th>Tests</th>
			<th>Errors</th>
			<th>Failures</th>
			<th nowrap="nowrap">Time(s)</th>
			<th nowrap="nowrap">Time Stamp</th>
			<th>Host</th>
		</tr>
	</xsl:template>

	<!-- method header -->
	<xsl:template name="testcase.test.header">
		<tr>
			<th rowspan="2">Name</th>
			<th rowspan="2">Tests</th>
			<th rowspan="2">Failures</th>
			<th rowspan="2">Errors</th>
			<th rowspan="2">Coverage</th>
			<xsl:for-each select="/testsuites/testsuite">
				<th colspan="2" width="10%">
					<xsl:value-of select="@name" />
				</th>
			</xsl:for-each>
		</tr>
		<tr>
			<xsl:for-each select="/testsuites/testsuite">
				<th>fail</th>
				<th>total</th>
			</xsl:for-each>
		</tr>
	</xsl:template>


	<!-- class information -->
	<xsl:template match="testsuite" mode="print.test">
		<tr valign="top">
			<!-- set a nice color depending if there is an error/failure -->
			<xsl:attribute name="class">
	            <xsl:choose>
	                <xsl:when test="@failures[.&gt; 0]">Failure</xsl:when>
	                <xsl:when test="@errors[.&gt; 0]">Error</xsl:when>
	            </xsl:choose>
	        </xsl:attribute>

			<!-- print testsuite information -->
			<td>
				<xsl:value-of select="@name" />
			</td>
			<td>
				<xsl:value-of select="@tests" />
			</td>
			<td>
				<xsl:value-of select="@errors" />
			</td>
			<td>
				<xsl:value-of select="@failures" />
			</td>
			<td>
				<xsl:call-template name="display-time">
					<xsl:with-param name="value" select="@time" />
				</xsl:call-template>
			</td>
			<td>
				<xsl:apply-templates select="@timestamp" />
			</td>
			<td>
				<xsl:apply-templates select="@hostname" />
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="testcase" mode="print.test">

		<!-- <xsl:if test="failure | error"> -->
		<tr valign="top">
			<xsl:attribute name="class">
		            <xsl:choose>
		                <xsl:when test="failure | error">Error</xsl:when>
	            </xsl:choose>
        		</xsl:attribute>
			<td>
				<xsl:value-of select="@name" />
			</td>
			<xsl:choose>
				<xsl:when test="failure">
					<td>Failure</td>
					<td>
						<xsl:apply-templates select="failure" />
					</td>
				</xsl:when>
				<xsl:when test="error">
					<td>Error</td>
					<td>
						<xsl:apply-templates select="error" />
					</td>
				</xsl:when>
				<xsl:otherwise>
					<td>Success</td>
					<td></td>
				</xsl:otherwise>
			</xsl:choose>
			<td>
				<xsl:call-template name="display-time">
					<xsl:with-param name="value" select="@time" />
				</xsl:call-template>
			</td>
		</tr>
		<!-- </xsl:if> -->
	</xsl:template>


	<xsl:template match="failure">
		<xsl:call-template name="display-failures" />
	</xsl:template>

	<xsl:template match="error">
		<xsl:call-template name="display-failures" />
	</xsl:template>

	<!-- Style for the error and failure in the tescase template -->
	<xsl:template name="display-failures">
		<xsl:choose>
			<xsl:when test="not(@message)">
				N/A
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@message" />
			</xsl:otherwise>
		</xsl:choose>
		<!-- display the stacktrace -->
		<code>
			<br />
			<br />
			<xsl:call-template name="br-replace">
				<xsl:with-param name="word" select="." />
			</xsl:call-template>
		</code>
		<!-- the later is better but might be problematic for non-21" monitors... -->
		<!--pre><xsl:value-of select="."/></pre -->
	</xsl:template>

	<xsl:template name="JS-escape">
		<xsl:param name="string" />
		<xsl:param name="tmp1"
			select="stringutils:replace(string($string),'\','\\')" />
		<xsl:param name="tmp2"
			select="stringutils:replace(string($tmp1),&quot;'&quot;,&quot;\&apos;&quot;)" />
		<xsl:value-of select="$tmp2" />
	</xsl:template>


	<!-- template that will convert a carriage return into a br tag @param word 
		the text from which to convert CR to BR tag -->
	<xsl:template name="br-replace">
		<xsl:param name="word" />
		<xsl:value-of disable-output-escaping="yes"
			select='stringutils:replace(string($word),"&#xA;","&lt;br/>")' />
	</xsl:template>

	<xsl:template name="display-time">
		<xsl:param name="value" />
		<xsl:value-of select="format-number($value,'0.000')" />
	</xsl:template>

	<xsl:template name="display-percent">
		<xsl:param name="value" />
		<xsl:value-of select="format-number($value,'0.00%')" />
	</xsl:template>

</xsl:stylesheet>