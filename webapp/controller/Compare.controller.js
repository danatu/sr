sap.ui.define(["sr/controller/BaseController",'sap/m/MessageToast', 'sap/suite/ui/microchart/library'],
	function(BaseController,MessageToast) {
		"use strict";

		var PageController = BaseController.extend("sr.controller.Compare", {
			onInit: function() {
				this._actionSheet = {};
				var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
				this.oModel_SRNew = new sap.ui.model.odata.ODataModel(vservice, {
					json: true
				});
				this.getRouter().getTargets().getTarget("compare").attachDisplay(null, this._onDisplay, this);
			},
			
			_onDisplay: function() {
				var that = this;
				setTimeout(function() {
					that._showDialog();
				}, 500);
			},
			
			_showDialog: function() {
				
				var oUser = this.getModel("appView").getProperty("/user");
				var sQuery =
				"Findatageneral?$filter=(createdby eq '" + oUser.USERID + "') or ((groupid eq '" + oUser.GROUPID_ID + "') and (createdby ne '" + oUser.USERID + "') and (isgrp eq '1'))";
				var arrFormsList = this.getServiceData(sQuery, this.oModel_SRNew);
				var oModelTemp = new sap.ui.model.json.JSONModel(arrFormsList);
				oModelTemp.loadData("SR_REPORTS/model/Forms.json");
				var oDialog = this._getDialog("formsDialog", "sr.view.dialog.formsDialog", 0.2, 0.1);
				oDialog.setModel(oModelTemp);
				oDialog.open();
			},
			_getDialog: function(sControlId, sFragId, sWidth, sHeight) {
				var oView = this.getView();
				var oDialog = sap.ui.getCore().byId(sControlId);
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(sFragId, this);
					oView.addDependent(oDialog);
					var contentWidth = jQuery(window).width() * sWidth + "px";
					var contentHeight = jQuery(window).height() * sHeight + "px";
					oDialog.setContentHeight(contentHeight);
					oDialog.setContentWidth(contentWidth);
				}
				return oDialog;
			},

			getServiceData: function(sServiceVal, oModel) {
				var Data = {};
				oModel.read(sServiceVal, null, null, false, function(oData, oResponse) {
					if (oData.results.length !== 0) {
						Data = oData.results;
					}
				});
				return Data;
			},
			getColor: function(sValue) {
				var value = parseInt(sValue);
				if (value < 4) {
					return "Error";
				} else if (value < 6) {
					return "Critical";

				} else if (value < 8) {
					return "Good";
				}
			},
			
			get_colorPalette: function(Rate){
					switch(Rate){
						case "1": 
						 return "#077c24";
						case "2": 
						return "#25b248";
						case "3": 
						return "#94efab";
						case "4": 
						return "#fcf8c9";
						case "5": 
						return "#f9e71b";
						case "6": 
						return "#f9b71b";
						case "7": 
						 return "#ba0000";
					}
				},

			getRating: function(sRating, sOffset) {
				//	var ratingArr = ["", "Below B", "B", "BB", "BBB", "A", "AA", "AAA"];
				var ratingArr = [" ", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
				var iRating = parseInt(sRating);
				var sRatingValue = ratingArr[iRating];
				if (sRatingValue !== undefined && iRating != 0) {
					var sValue = sRatingValue;
					var iOffset = parseInt(sOffset);
					if (!isNaN(iOffset)) {
						if (iOffset < 0) {
							sValue = sValue + "-";
						} else if (iOffset > 0) {
							sValue = sValue + "+";
						}
					}
					return sValue;
				} else {
					return " ";
				}
			},

			onDialogOk: function(oEvent) {
				var combo = sap.ui.getCore().byId("formsComboBox");
				var arrForms = combo.getSelectedKeys();
				this.onCreateChart(arrForms);
				var dialog = sap.ui.getCore().byId("formsDialog");
				dialog.close();

			},

			onDialogCancle: function(oEvent) {
				var dialog = sap.ui.getCore().byId("formsDialog");
				dialog.close();
			},

			onCreateChart: function(arrForms) {
				var oModel = this.oModel_SRNew;
				var sQuery = "ReportTooltip?$filter=Langauge eq 'EN'";
				var arrTooltips = this.getServiceData(sQuery, oModel);
				//	var sQuery2 = "FinResults?$filter=formid eq '329' or formid eq '304' or formid eq '328'";
				var sQuery2 = "FinResults?$filter=formid eq ";
				for (var a = 0; a < arrForms.length; a++) {
					if (a === 0) {
						sQuery2 = sQuery2 + "'" + arrForms[a] + "'";
					} else {
						sQuery2 = sQuery2 + " or formid eq '" + arrForms[a] + "'";
					}

				}
				var arrResults = this.getServiceData(sQuery2, oModel);
		//		var oTable = this.getView().byId("tableID");
////////////Dana////////////
	var aColumns = [
				new sap.m.Column({
					minScreenWidth: "Small",
					demandPopin: true,
					header: new sap.m.Text({
						text: "Financial Ratios"
					}),
					hAlign:"Center"
				}),
				new sap.m.Column({
					minScreenWidth: "Small",
					demandPopin: true,
					header: new sap.m.Text({
						text: "Value"
					}),
					hAlign:"Center"
				}),
				new sap.m.Column({
					minScreenWidth: "Small",
					demandPopin: true,
					header: new sap.m.Text({
						text: "Rating"
					}),
					hAlign:"Center"
				})
			];
			this._initControl("compareTable");
			var oTable = new sap.m.Table("compareTable", {
				columns: aColumns
			});
this.byId("compPanel").addContent(oTable);
///////////////////////////
				for (var i = -1; i < arrTooltips.length; i++) {
					var index = i+1;
					if (index < 10) {
						index = "0" + index;
					}
					var arrColors=[];


					var oComparisonRate = new sap.suite.ui.microchart.ComparisonMicroChart({
						width: "100%",
						maxValue: 7,
						view: "Wide"

					});
					
					var oComparisonRatio = new sap.suite.ui.microchart.ComparisonMicroChart({
						colorPalette:["#abdbf2","#84caec","#5cbae5","#27a3dd","#1b7eac","#156489"],
						width: "100%",
						scale:"%",
						view: "Wide"

					});


					var oFlexBoxRatio = new sap.m.FlexBox({
						width:"100%",
					fitContainer:true,
						items: [
							oComparisonRatio
						]
					});
					var oFlexBoxRate = new sap.m.FlexBox({
						 width: "100%",
						items: [
							oComparisonRate
						]
					});

					for (var l = 0; l < arrResults.length; l++) {
						var curResults = arrResults[l];

						// Add bars to bar chart
						var iRatio = "Ratio_" + index;
						var vRatio = curResults[iRatio];
						vRatio = parseFloat(parseFloat(vRatio).toFixed(2));
				
						var odata1 = new sap.suite.ui.microchart.ComparisonMicroChartData({
							// height: "100%",
							width: "100%",
							size: "L",
							//	title: curResults.FullName,
							title: curResults.FullName,
							value: vRatio,
							displayValue: parseFloat(vRatio).toFixed(2)	});
							
						oComparisonRatio.addData(odata1);
						// oInteractiveBarChart.addBar(oBar);

						/////// Add data to comparison chart///////
						var iRate = "Rate_" + index;
						var iOffset = "Offs_" + index;
						var rateValue = 8 - parseFloat(curResults[iRate]);
						
						var odata = new sap.suite.ui.microchart.ComparisonMicroChartData({
							height: "100%",
							width: "100%",
							//	title: curResults.FullName,
							title: "",
							value: rateValue,
							displayValue: this.getRating(curResults[iRate], curResults[iOffset]),
							minValue:0,
						//	color: this.getColor(rateValue)
						});
						if (odata.getValue() > 7) {
							odata.setValue(NaN);
						}
						oComparisonRate.addData(odata);
						arrColors.push(this.get_colorPalette(curResults[iRate]));

					}

					oComparisonRate.addStyleClass("comparisonMicroChart");
					oComparisonRatio.addStyleClass("comparisonMicroChart");
					oComparisonRate.addStyleClass("ratioMicroChart");
					oComparisonRate.setColorPalette(arrColors);

				//	oComparisonRatio.setMaxValue(max);

					//////////// Add row to table /////////////
					var vText = "";
					if (index === "00") {
						vText = "Total Rating";

					} else {
						vText = arrTooltips[i].Name;
					}

					var oColumnListItem = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({
								text: vText
							}),
							oFlexBoxRatio,
							// new sap.m.Panel({
							// 	content: [oComparisonRate]
							// })
							oFlexBoxRate

						]
					});

					oTable.addItem(oColumnListItem);

				}
			},
		_initControl: function(id) {
			var oControl = sap.ui.getCore().byId(id);
			if (oControl !== undefined) {
				oControl.destroy();
			}
		},
		onPressBack: function(oEvent) {
			var combo = sap.ui.getCore().byId("formsComboBox");
			combo.clearSelection();
			this._initControl("compareTable");
			this.getRouter().getTargets().display("object");
		},
		handlePdf:function(){
        	// var doc = new jsPDF("p", "pt", "a4",true); // portrait

                var pdf = new jsPDF("p", "pt", "a4");

                var pdfName = "sample.pdf";

                var options = {
                    format: "PNG",
//                    pagesplit: true,
                    "background": "#ffffff"
                };
                  var firstPartPage = $("#compareTable-listUl")[0];
               
                pdf.addHTML(firstPartPage, 0, 0, options, function(){  pdf.save("form.pdf"); });
           
       },
       	onHandleOpen: function(oEvent) {
				var sButtonId = oEvent.getSource().getId();
				var selectedBtn = sButtonId.substring(sButtonId.indexOf("btn_action"), sButtonId.length);
				var sFragName = "";
				var sActionName = "";
		
				sFragName = "sr.view.ExportActions";
				sActionName = "export";

				var oButton = oEvent.getSource();
				// create action sheet only once
				if (!this._actionSheet[sActionName]) {
					this._actionSheet[sActionName] = sap.ui.xmlfragment(
						sFragName,
						this
					);
					this.getView().addDependent(this._actionSheet[sActionName]);
				}
				this._actionSheet[sActionName].openBy(oButton);
			}
		});
		return PageController;
	});