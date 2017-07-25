sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		titleFormatter: function(sCompName, isEnableEditing) {
			if (isEnableEditing === true) {
				return sCompName;
			} else {
				return sCompName + " (View Only)";
			}
		},
		assuranceFormatter: function(sValue) {
			var arr = ["None", "Compilation", "Reviewed", "Audited"];
			var index = parseInt(sValue);
			return arr[index];
		},
		dateFormatterIso: function(sDate) {
			if (sDate !== undefined) {
				jQuery.sap.require("sap.ui.core.format.DateFormat");
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					style: "medium"
				}); //Returns a DateFormat instance for date

				var formatted = oDateFormat.format(sDate);
				return formatted;
			}
		},
		totalRatingFormatter: function(sRating, sOffset) {
			var ratingArr = ["", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
			var iRating = parseInt(sRating);
			var sRatingValue = ratingArr[iRating];
			if (sRatingValue !== undefined) {
				var sValue = sRatingValue;
				var iOffset = parseInt(sOffset);
				if (!isNaN(iOffset)) {
					if (iOffset > 0) {
						sValue = sValue + "-";
					} else if (iOffset < 0) {
						sValue = sValue + "+";
					}
				}
				return sValue;
			} else {
				return "";
			}
		},
		totalRatingQQcalFormatter: function(sRating, sOffset) {
			var sResult = "";
			var iValue = "";
			var sValue = "";
			var ratingArr = ["", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
			var oScore = {
				"AAA+": 15,
				"AAA": 14,
				"AAA-": 14,
				"AA+": 13,
				"AA": 12,
				"AA-": 11,
				"A+": 11,
				"A": 10,
				"A-": 9,
				"BBB+": 9,
				"BBB": 8,
				"BBB-": 7,
				"BB+": 6,
				"BB": 6,
				"BB-": 5,
				"B+": 4,
				"B": 4,
				"B-": 3,
				"Below B": 0
			};
			var iRating = parseInt(sRating);
			var sRatingValue = ratingArr[iRating];
			var iOffset = parseInt(sOffset);
			if (!((sRating > 0) && (sRating <= 7))) {
				sResult = "";
			} else if ((isNaN(iOffset) === false) && (sRatingValue !== undefined)) {
				sValue = sRatingValue;
				if (iOffset > 0) {
					sValue = sValue + "-";
				} else if (iOffset < 0) {
					sValue = sValue + "+";
				}
				iValue = oScore[sValue];
				sResult = sValue + " (" + iValue + ")";
			}

			return sResult;

		},
		typeFormatter: function(sType) {
			if (sType === "1") {
				return "Non Banking";
			} else {
				return "Banking";
			}
		},
		iconClassFormatter: function(sRating, sRatingOffsets, sRatingCurrValue) {
			var sCssClass = "";
			if (sRating === sRatingCurrValue) {
				var ratingArr = ["", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
				var iRating = parseInt(sRating);
				var sRatingValue = ratingArr[iRating];
				sCssClass = "icon" + sRatingValue;
				var iOffset = parseInt(sRatingOffsets);
				if (!isNaN(iOffset)) {
					if (iOffset > 0) {
						sCssClass = sCssClass + " iconMinus";
					} else if (iOffset < 0) {
						sCssClass = sCssClass + " iconPlus";
					}
				}

			}
			return sCssClass;
		},
		ratingFormatter: function(sRating, sRatingCurrValue) {
			var sValue = "";
			if (sRating === sRatingCurrValue) {
				sValue = "sap-icon://accept";
			}
			return sValue;
		},
		percentageFormatter: function(sValue) {
			 var sReturnedValue = "";
			if (sValue !== "" && sValue !== undefined && sValue !== null) {
			 var floatValue = parseFloat(sValue);
			sReturnedValue = floatValue.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
			sReturnedValue = sReturnedValue + "%";
			// if (sValue !== "" && sValue !== undefined && sValue !== null) {
			// 	var floatValue = parseFloat(sValue) / 100;
			// 	var sFloatValue = floatValue.toString();
			// 	var fValue = sFloatValue.match(/^-?\d+(?:\.\d{0,4})?/)[0];
			// 	var fNumber = parseFloat(fValue);
			// 	jQuery.sap.require("sap.ui.core.format.NumberFormat");

			// 	var oNumberFormat = sap.ui.core.format.NumberFormat.getPercentInstance({
			// 		style: 'precent',
			// 		maxFractionDigits: 2,
			// 		minFractionDigits: 2,
			// 		precision: 3
			// 	});
			// 	sReturnedValue = oNumberFormat.format(fNumber);
			// 	// sReturnedValue = sValue + "%";
		 }
			return sReturnedValue;
		},

		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		resultNumber: function(sValue) {
			var sReturnedValue = "";
			if (sValue !== "" || sValue !== undefined) {

				var fNumber = parseFloat(sValue); // convert string to float
				jQuery.sap.require("sap.ui.core.format.NumberFormat");
				var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					maxFractionDigits: 0,
					groupingEnabled: true,
					groupingSeparator: ",",
					decimalSeparator: "."
				});
				sReturnedValue = oNumberFormat.format(fNumber);
				sReturnedValue = sReturnedValue + "%";
				// sReturnedValue = sValue + "%";
			}
			return sReturnedValue;
		}

	};

});