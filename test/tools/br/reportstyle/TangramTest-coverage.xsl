<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0" xmlns:lxslt="http://xml.apache.org/xslt"
	xmlns:stringutils="xalan://org.apache.tools.ant.util.StringUtils">
	<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"></fo:root>
	<xsl:output method="html" indent="yes" encoding="US-ASCII"
		doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />
	<xsl:decimal-format decimal-separator="."
		grouping-separator="," />
	<xsl:template match="cases">
		<html>
			<head>
				<title>
					覆盖率信息
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
					table
					td.coverage{
					width:150px;
					}

					p {
					line-height:1.5em;
					margin-top:0.5em;
					margin-bottom:1.0em;
					}
					h1 {
					margin: 0px 0px 5px; font: 165%
					verdana,arial,helvetica
					}
					h2 {
					margin-top: 1em; margin-bottom: 0.5em;
					font: bold 125%
					verdana,arial,helvetica
					}
					h3 {
					margin-bottom: 0.5em;
					font: bold 115%
					verdana,arial,helvetica
					}
					h4 {
					margin-bottom: 0.5em;
					font: bold 100%
					verdana,arial,helvetica
					}
					h5 {
					margin-bottom: 0.5em;
					font: bold 100%
					verdana,arial,helvetica
					}
					h6 {
					margin-bottom: 0.5em;
					font: bold 100%
					verdana,arial,helvetica
					}
					.Error {
					font-weight:bold;
					color:red;
					}
					.Failure {
					font-weight:bold; color:purple;
					}
					.Properties {
					text-align:right;
					}
					td.coverage span {
					float: right;
					margin-right: 5px;
					}
					.pctGraph {
					width: 100px;
					height: 10px;
					float: right;
					border: 1px
					solid #000;
					background-color: #e00000;
					overflow: hidden;
					margin-top:
					4px;
					}
					.pctGraph .covered {
					background-color: #00f000;
					width: 0;
					height: 10px;
					}
					.pctGraph .skipped {
					background-color:
					#d4d0c8;
					width:
					100px;
					height: 10px;
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

				<!-- For each package create its part <xsl:call-template name="browsers" 
					/> <hr size="1" width="95%" align="left" />For each class create the part 
					<xsl:call-template name="cases" /> -->

				<!-- For each package create its part -->
				<xsl:call-template name="browsers" />
				<hr size="1" width="95%" align="left" />

			</body>
		</html>
	</xsl:template>

	<xsl:template name="pageHeader">
		<h1>
			覆盖率统计
		</h1>
		<table width="100%">
			<tr>
				<td align="left"></td>
				<td align="right">
					<a href='http://10.32.34.115:8080'>
						查看</a>
					测试结果
				</td>
			</tr>
		</table>
		<hr size="1" />
	</xsl:template>

	<xsl:template name="summary">
		<h2>
			概要统计信息
		</h2>

		<xsl:variable name="total_code" select="count(/cases/case/line)"></xsl:variable>
		<xsl:variable name="coverage_code" select="count(/cases/case/line[@number=1])"></xsl:variable>
		<table class="details" border="0" cellpadding="5" cellspacing="2"
			width="95%">
			<tr valign="top">
				<th>总代码行数</th>
				<th>覆盖代码行数</th>
				<th>覆盖率</th>
			</tr>
			<tr valign="top">
				<td>
					<xsl:value-of select="$total_code" />
				</td>
				<td>
					<xsl:value-of select="$coverage_code" />
				</td>
				<td class='coverage'>
					<xsl:call-template name="coverage.display">
						<xsl:with-param name="total" select="$total_code" />
						<xsl:with-param name="coveraged" select="$coverage_code" />
					</xsl:call-template>
				</td>
			</tr>
		</table>
		<table border="0" width="95%">
			<tr>
				<td style="text-align: justify;">
					<ul>
						<li>
							<i>
								覆盖率通过
								<a
									href='http://com.baidu.com/twiki/bin/view/Test/%e7%9b%b8%e5%85%b3%e5%8e%9f%e7%90%86%e4%bb%8b%e7%bb%8d'>测试框架</a>
								结合
								<a href='http://siliconforks.com/jscoverage'>jscoverage</a>
								产出
							</i>
						</li>
						<li>
							<i>这是整合之后的结果，任一浏览器上覆盖到则为覆盖通过</i>
						</li>
						<li>
							<i>目前暂时支持行覆盖信息</i>
						</li>
						<li>
							<b>
								<i>看看反馈来决定是否需要继续细化</i>
							</b>
						</li>
					</ul>
				</td>
			</tr>
		</table>
	</xsl:template>

	<xsl:template name="browsers">
		<h3>浏览器概览</h3>
		<table class="details" border="0" cellpadding="5" cellspacing="2"
			width="95%">
			<tr valign="top">
				<th>浏览器</th>
				<th>总代码行数</th>
				<th>覆盖代码行数</th>
				<th>覆盖率</th>
			</tr>
			<!-- 单一浏览器的统计信息列表 -->
			<xsl:for-each select="/cases/browsers/browser">
				<xsl:sort select="@name" />
				<xsl:apply-templates
					select="document(concat('../report/coverage/cov_', text(), '.xml'))" />
			</xsl:for-each>
		</table>
		<a href="#top">Back to top</a>
		<p />
		<p />
	</xsl:template>

	<xsl:template match="/coveragesuite">
		<xsl:variable name="browser_total_code" select="count(case/line)" />
		<xsl:variable name="browser_coverage_code" select="count(case/line[@number=1])" />
		<tr valign="top">
			<td>
				<xsl:value-of select="@name" />
			</td>
			<td>
				<xsl:value-of select="$browser_total_code" />
			</td>
			<td>
				<xsl:value-of select="$browser_coverage_code" />
			</td>
			<td class='coverage'>
				<xsl:call-template name="coverage.display">
					<xsl:with-param name="total" select="$browser_total_code" />
					<xsl:with-param name="coveraged" select="$browser_coverage_code" />
				</xsl:call-template>
			</td>
		</tr>
	</xsl:template>

	<xsl:template name="coverage.display">
		<xsl:param name="total" />
		<xsl:param name="coveraged" />
		<xsl:variable name="percent" select="round(100 * $coveraged div $total)"></xsl:variable>

		<div class='pctGraph'>
			<div class='covered'>
				<xsl:attribute name="style">
				<xsl:value-of select="concat('width:', $percent, 'px;')" />
				</xsl:attribute>
			</div>
		</div>
		<span class='pct'>
			<xsl:value-of select="$percent" />
			%
		</span>
	</xsl:template>
</xsl:stylesheet>