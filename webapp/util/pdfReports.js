sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return {
		JSONToPDFConvertor: function(JSONData) {
			// var arrData = typeof JSONData !== "object" ? JSON.parse(JSONData) : JSONData;
			// var arrData = JSONData.data;
			// var columns = [];
			// for (var index in arrData[0]) {
			// 	//Now convert each value to string and comma-seprated
			// 	columns.push(index);
			// }
			// var rows = [];
			// //console.log(arrData);
			// for (var i = 0; i < arrData.length; i++) {
			// 	rows[i] = [];
			// 	for (var j = 0; j < arrData.length;) {
			// 		for (var index in arrData[0]) {
			// 			rows[i][j] = arrData[i][index];
			// 			j++;
			// 		}
			// 	}
			// }

			// Page 1
			var doc = new jsPDF("p", "in", "a4"); // portrait
			var imgLogo = new Image();
			// imgLogo.src = "css/pics/srLogo.png";
			imgLogo.src = "css/pics/introtest.PNG";
			doc.addImage(imgLogo, "png", 0, 0);

			doc.setFontSize(36);
			doc.setTextColor(7, 30, 66);
			doc.text(0.75, 6.04, "Self Rating Indicative Report");
			var sCompName = this.CustData.coname;

			doc.setFontSize(27.5);
			doc.setTextColor(0, 0, 0);

			var text = sCompName,
				xOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text) * doc.internal.getFontSize() / 72);
			doc.text(text, xOffset, 6.64);

			doc.setFontSize(12);
			var date = new Date();
			var sFormattedDate = formatter.dateFormatterIso(date);
			text = "Generated on: " + sFormattedDate;
			xOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text) * doc.internal.getFontSize() / 72);
			doc.text(text, xOffset, 8);

			// imgLogo.onload = function() {
			// 	doc.addImage(imgLogo, "png", 300, 10);
			// };
			// doc.autoTable(columns, rows);
			doc.setFontSize(14);
			doc.setTextColor(7, 30, 66);
			doc.text(5.93, 11, "Self Rating, LLC");
			doc.setFontSize(7.5);
			doc.setTextColor(0, 0, 0);
			doc.text(5.93, 11.25, "Copyright 2012, Self Rating, LLC");

			// Page 2
			doc.addPage();
			doc.setFontSize(17);
			doc.setFillColor(46, 109, 211);
			doc.rect(0.3, 0.2, 7.52, 0.5, 'F');

			doc.setTextColor(255, 255, 255);
			doc.text(2.65, 0.5, "Improve Your Business");

			doc.setFontSize(10);
			doc.setTextColor(0, 0, 0);
			doc.text(0.5, 1.1, "Dear Business Owner");

			var sizes = [10, 16, 20],
				fonts = [
					['Times', 'Roman'],
					['Helvetica', ''],
					['Times', 'Italic']
				],
				font, size, lines,
				margin = 0.5, // inches on a 8.5 x 11 inch sheet.
				text1 =
				"At Self-Rating we understand how important your business is to you. It is also important to us. We appreciate your willingness to use our product and we sincerely believe you will be rewarded with new information to help you better manage your business. Self-Rating provides the most powerful 'do-it-yourself', SaaS business diagnostics allowing you to gain crucial insights into your business. These can otherwise remain hidden to you unless you are a professional or assisted by one. ",
				text2 =
				"The vision of Self-Rating is to provide an affordable, easy-to-use diagnostic software tools enabling small and mid-sized businesses worldwide to learn more (in private) about their business to improve their overall performance. Through extensive analysis of companies we have developed a proprietary method to help you understand your business differently than ever before.With Self-Rating.com you can now: > Get an 'indicative' rating to see how a lender will view your company - Learn how you can improve your performance! > See how you compare to their peers - Learn where the differences are and turn them to your advantage! > See critical warning signs and hidden problems early - Address problems early! > Know your strengths and weaknesses - Create a better strategy! > Improve your credit worthiness - Get better financing terms!",
				text3 =
				"To explain how we diagnose your business it's helpful to compare this to how a doctor looks for hidden problems in your health. Although you may feel extremely healthy we know, for instance, that many individuals with apparent normal health have heart attacks. One way your doctor looks for hidden health problems is through the use of diagnostic tests to analyze your health. These tests, such as blood pressure, Total Cholesterol, etc., measure vital aspects of your cardiovascular health. Your doctor will then also calculate important ratios to help determine your risk level for hidden problems.",
				text4 =
				"At Self-Rating we have implemented a unique way to use only financial information such as Net Revenues, Operating Income, Receivables and financial ratios such as Profit Margin, Net Profit/Total Assets, etc., to create powerful diagnostics to automatically analyze your business. But this is not the whole story. Often these values will only show you the 'tip of the iceberg'. For instance, we know that many companies with good Profit Margins have failed within a short time. ",
				text5 =
				"Combining our many years of experience in Financial and Legal Analysis, Mathematics and Artificial Intelligence we have developed proprietary algorithms which can reveal hidden problems. Based on these we automatically provide recommendations to improve your business situation. This report is created, based on our agreement, just for you and will provide you with initial suggestions to improve your company's overall competitiveness.",
				text5 =
				"Combining our many years of experience in Financial and Legal Analysis, Mathematics and Artificial Intelligence we have developed proprietary algorithms which can reveal hidden problems. Based on these we automatically provide recommendations to improve your business situation. This report is created, based on our agreement, just for you and will provide you with initial suggestions to improve your company's overall competitiveness.",
				text6 = "We wish you success in putting this information to good use.",
				text7 = "Sincerely,",
				text8 = "Ran Gazit, Jake Geller Founders",
				text9 = "Self-Rating, LLC";
			var texts = [text1, text2, text3, text4, text5, text6, text7, text8, text9];
			var verticalOffsets = [1.25, 2.6, 5.18, 6.78, 8.15, 9.5, 9.8, 10.1, 10.3];
			// create line:
			doc.setDrawColor(0, 0, 0);
			doc.setLineWidth(1 / 72);
			doc.line(5.58, 1.35, 5.58, 1.35 + 9.3);

			font = fonts[0];
			size = sizes[0];

			for (var i = 0; i < texts.length; i++) {
				var sText = texts[i];
				var iVerticalOffset = verticalOffsets[i];
				lines = doc.setFont(font[0], font[1])
					.setFontSize(size)
					.splitTextToSize(sText, 5);
				doc.text(0.5, iVerticalOffset + size / 72, lines);
			}

			text1 = "Financial Ratio Analysis"; 
			text2 = "Ratio analysis, a long - standing practice that has its origins in the late 1800’ s, uses financial data from businesses to provide a basis for comparison.Every" +
			"ratio calculates and measures an association between two data points. These calculated ratios may be used to evaluate the overall financial condition of a business.Business owners," +
			"stockholders, creditors or potential investors may use ratio analysis to gauge viability, liabilities, and as indicators of future performance. However many agencies emphasize its" +
			"use as evaluating the risk that the	evaluated business may not meet its	contractual, financial obligations as they come due and any estimated" +
			"financial loss in the event of default.	Ratios can be predictive and provide indications of potential problem areas,subject to the above.Business owners" +
			"can use their ratios to better evaluate	the performance of their business by comparing these financial ratios with	their competitors.They can use financial" +
			"ratios to“ read between the lines of financial statements” and better understand a business’ credit worthiness.It allows them to identify early warning signs and the strengths" +
			"and weaknesses of a business providing	an overall measure of risk.	";
			
			doc.setFontType("italic");
			doc.text(0.5, iVerticalOffset + size / 72, lines);
			sText = text2;
			iVerticalOffset = 1.25;
			lines = doc.setFont(font[0], font[1])
			.setFontSize(size)
			.splitTextToSize(sText, 2.5);
			doc.text(5.75, iVerticalOffset + size / 72, lines);
			doc.save('Indicative Report Results.pdf');
		}
	
	};
});