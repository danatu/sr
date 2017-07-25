/*global location*/
sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sr/model/formatter",
	"sr/util/externalFunctions",
	"sap/ui/core/Fragment"
], function(BaseController, JSONModel, History, formatter, externalFunctions,Fragment) {
	"use strict";
		return BaseController.extend("sr.controller.qqcalc", {
		formatter: formatter,
		onInit: function() {
			this.oCurrQA = {};
			this.oViewModel = new JSONModel({
				isUpdate: true
			});
			this.isUpdate = true;
			this._ResourceBundle = this.getResourceBundle();
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("QQCalc", "QQCalcEvent", this._handleQQCalcEvents, this);
		},
		onDialogCancle: function(oEvent){
			var sDialogid = oEvent.getSource().getCustomData()[0].getValue();
		var oDialog = externalFunctions._getDialog(sDialogid, "sr.view.dialog." + sDialogid, 0.3, 0.3,this);
		oDialog.close();
		},
		_handleQQCalcEvents: function(channel, event, item) {
			var oUser = this.getModel("appView").getProperty("/user");
			this.USERID = oUser.USERID;
			this.USERNAME = oUser.FIRSTNAME + " " +  oUser.LASTNAME;  
			if (item === "create") {
				this.createQuestenire();
				this._getAnswersData();
				this.getModel("ObjectView").setProperty("/bars/qqcalc/enabled", false);
			} else if (item === "save") {
				this.onSaveQQCalc();
			} else if (item === "edit") {
				this.getModel("ObjectView").setProperty("/bars/qqcalc/enabled", true);
			}else if(item === "report")
			{
				this.onReportQqcalc();
			}
		},
		isSaveChanges:function(){
			if	(this.isModelChange()){
				this.handleConfirmMessageBoxPress();
			}	
		},
		
		_goToPage: function(target) {
			var navCon = this.getView().byId("navCon");
			navCon.to(sap.ui.getCore().byId(target), "show");
		},
		handleNav: function(oEvent, that) {
			var navCon = that.getView().byId("navCon");
			var target = oEvent.getSource().data("target");
			if (target) {
				this._goToPage(target);
			} else {
				navCon.back();
			}
		},
		_initControl: function(id) {
			var oControl = sap.ui.getCore().byId(id);
			if (oControl !== undefined) {
				oControl.destroy();
			}
		},
		getComboScore: function(oData, questionId) {
			var iScore = 0;
			var length = 15;
			var scoreIncludArr = [];
			for (var i = 0; i < length; i++) {
				scoreIncludArr.push(0);
			}
			var minVal = 0;
			var maxVal = 16;
			var scoreArr = [];

			oData.forEach(function(possObj) {
				if (questionId === possObj.QuestionID) {
					iScore = parseInt(possObj.SCORE);
					scoreIncludArr[iScore] = 1;
				}
			});
			var data = [];
			var count = 0;
			for (var j = 0; j < length; j++) {
				if (scoreIncludArr[j] === 0) {
					data[count] = {};
					data[count].key = j;
					count = count + 1;
				}
			}
			var scoreData = {
				"items": data
			};
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(scoreData);

			var oItemTemplate = new sap.ui.core.Item({
				text: "{key}",
				key: "{key}"
			});
			var id = "CB_" + questionId + "other";
			var oComboBox = sap.ui.getCore().byId(id);
			if (oComboBox !== undefined) {
				oComboBox.destroy();
			}
			var oComboBox = new sap.m.ComboBox(id, {
				visible: false,
				items: {
					path: "/items",
					template: oItemTemplate
				}
			});
			oComboBox.setModel(oModel);
			oComboBox.bindItems({
				path: "/items",
				template: oItemTemplate
			});
			return oComboBox;
		},
		_createPage: function(iPageIndex, sHeader, length, currQuestionId) {
			var that = this;
			var sBtnIdNextId = "btnNext" + iPageIndex;
			this._initControl(sBtnIdNextId);
			var sBtnPrevId = "btnPrev" + iPageIndex;
			this._initControl(sBtnPrevId);
			
			//Up
			var sBtnIdNextIdUp = "btnNextUp" + iPageIndex;
			this._initControl(sBtnIdNextIdUp);
			var sBtnPrevIdUp= "btnPrevUp" + iPageIndex;
			this._initControl(sBtnPrevIdUp);
			//Up
			
			var oBtnIdNextId = new sap.m.Button(sBtnIdNextId, {
				text: "{i18n>next}",
				press: function(oEvent) {
					that.handleNav(oEvent, that);
				}
			});
			//Up
		 	var oBtnIdNextIdUp = new sap.m.Button(sBtnIdNextIdUp, {
				text: "{i18n>next}",
				press: function(oEvent) {
					that.handleNav(oEvent, that);
				}
			});
			//Up
			
			
			var oTemplate = new sap.ui.core.CustomData({
				key: "target",
				value: "p_" + (iPageIndex + 1)
			});
			oBtnIdNextId.addCustomData(oTemplate);
			
			var oTemplateUp = new sap.ui.core.CustomData({
				key: "target",
				value: "p_" + (iPageIndex + 1)
			});
			oBtnIdNextIdUp.addCustomData(oTemplateUp);
			var oBtnPrevId = new sap.m.Button(sBtnPrevId, {
				text: "{i18n>prev}",
				press: function(oEvent) {
					that.handleNav(oEvent, that);
				}
			});
				//Up
		 var oBtnPrevIdUp = new sap.m.Button(sBtnPrevIdUp, {
				text: "{i18n>prev}",
				press: function(oEvent) {
					that.handleNav(oEvent, that);
				}
			});
			//Up
			
		
				oTemplate = new sap.ui.core.CustomData({
				key: "target",
				value: "p_" + (iPageIndex - 1)
			});
			oBtnPrevId.addCustomData(oTemplate);
		
		
		 oTemplateUp = new sap.ui.core.CustomData({
			key: "target",
			value: "p_" + (iPageIndex - 1)
		});
			oBtnPrevIdUp.addCustomData(oTemplateUp);
			
			var sBarId = "bar_" + iPageIndex;
			this._initControl(sBarId);
			var oBar = new sap.m.Bar(sBarId, {
				contentRight: [oBtnPrevId, oBtnIdNextId]
			});
			var sBarIdUp = "bar_Up" + iPageIndex;
			this._initControl(sBarIdUp);
			
			////
		var olabelName = new sap.m.Label("L_Name" + currQuestionId , {
			text: "Name:",
			visible: true
		});
		var oInput = new sap.m.Text("I_Name" + currQuestionId,{enabled:false});
		
		var olabelDate = new sap.m.Label("L_Date" + currQuestionId , {
			text: "Date:",
			visible: true
		});
		var datePicker = new sap.m.DatePicker("D_P" + currQuestionId,{enabled:false});
			////
			var oBarUp = new sap.m.Bar(sBarIdUp, {
				contentRight: [oBtnPrevIdUp, oBtnIdNextIdUp],
				contentLeft:[olabelName,oInput,olabelDate,datePicker]
			}).addStyleClass("qqHdr");
	
			var sPageId = "p_" + iPageIndex;
			this._initControl(sPageId);

			var oPage = new sap.m.Page(sPageId, {
				subHeader:[oBarUp],
				footer: [oBar]
			});
			oPage.setTitle(iPageIndex + ". " + sHeader);
			
			
			if (iPageIndex === 1) {
				oBtnPrevId.setEnabled(false);
				oBtnPrevIdUp.setEnabled(false);
			}
			if (iPageIndex === length) {
				oBtnIdNextId.setEnabled(false);
				oBtnIdNextIdUp.setEnabled(false);
			}

			return oPage;
		},

		_getQuestenireData: function(oEvent) {
			var that = this;
			var sLocalLan = this._ResourceBundle.sLocale;
			sLocalLan = "EN";
			var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			
	//		?$orderby=Carrname desc
	//		"QQcalcStruc(Language='" + sLocalLan + "')/Results?$orderby=SCORE desc"
			oModel.read("QQcalcStruc(Language='" + sLocalLan + "')/Results?$orderby=QuestionID,SCORE desc",
				null,
				null,
				false,
				function(oData, oResponse) {
					if (oData.results.length !== 0) {
						that.oDataQQ = oData.results;
					} else {
						var str = "Error fetching data";
						sap.m.MessageToast.show(str);
					}
				}
			);
			//	http://35.156.190.99:8000/SR_Services/SR_NEW.xsodata/QQcalcStruc(Language='EN')/Results	
		},
		_createRBG: function(QuestionID) {
			var id = "RBG_" + QuestionID;
			var oRadioBtnGrp = sap.ui.getCore().byId(id);
			if (oRadioBtnGrp !== undefined) {
				oRadioBtnGrp.destroy();
			}
			oRadioBtnGrp = new sap.m.RadioButtonGroup(id, {
				enabled:"{ObjectView>/bars/qqcalc/enabled}",
				select: function(oEvent) {
					var questionId = oEvent.getSource().getId().substring(4, oEvent.getSource().getId().length);
					var selectedItemId = oEvent.getSource().getSelectedButton().getId();
					var id = "CB_" + questionId + "other";
					var oComboBox = sap.ui.getCore().byId(id);
					var label = sap.ui.getCore().byId("L_" + QuestionID + "other");
					if (selectedItemId.indexOf("Other") !== -1) {
						label.setVisible(true);
						oComboBox.setVisible(true);
					} else {
						label.setVisible(false);
						oComboBox.setVisible(false);
					}
				}
			});
			oRadioBtnGrp.setSelectedIndex(-1);
			return oRadioBtnGrp;
		},
		createQuestenire: function(oEvent) {
			var that = this;
			that.oCurrQA = {};
			this._getQuestenireData();
			var oNav = that.byId("navCon");

			var oRadioBtnGrp = null;
			var oRadioBtn = null;
			var oPage = null;
			var countQuestion = 1;
			var countPoss = 0;
			var prevQuestionId = "";
			var id = "";
			that.ArrQuestionId = [];

			this.QQCALCID_ID = this.oDataQQ[0].QQCALCID_ID;

			this.oDataQQ.forEach(function(obj) {
				var currQuestionId = obj.QuestionID;
				if (prevQuestionId !== currQuestionId) {
					that.oCurrQA[currQuestionId] = "";
					that.ArrQuestionId.push(currQuestionId);
					oRadioBtnGrp = that._createRBG(currQuestionId);
					oPage = that._createPage(countQuestion, obj.QTEXT, 5,currQuestionId);
				
				
					oNav.addPage(oPage);
					

					// var oPanel = new sap.m.Panel("p_detailes1" + currQuestionId);
					// var oPanel2 = new sap.m.Panel("p_detailes2" + currQuestionId);
					// var olabelName = new sap.m.Label("L_Name" + currQuestionId , {
					// 	text: "Name",
					// 	visible: true
					// });
					// var oInput = new sap.m.Input("I_Name" + currQuestionId,{enabled:false});
					
					// var olabelDate = new sap.m.Label("L_Date" + currQuestionId , {
					// 	text: "Date",
					// 	visible: true
					// });

					// var datePicker = new sap.m.DatePicker("D_P" + currQuestionId,{enabled:false});
					// oPanel.addContent(olabelName);
					// oPanel.addContent(oInput);
					// oPanel.addContent(olabelDate);
					// oPanel.addContent(datePicker);
					///test hbox////
					
				  that._initControl("hbox_detailes" + currQuestionId);
				  //oPanel.addContent(olabelName);
				  // oPanel.addContent(oInput);
				  //oPanel2.addContent(olabelDate);
				  // oPanel2.addContent(datePicker);
				  //var hbox =  new sap.ui.layout.HorizontalLayout("hbox_detailes" + currQuestionId,{
					 //     content:[
					 //      olabelName,
					 //      oInput,
					 //      olabelDate,
					 //      datePicker
					 //     ]
					 //    }).addStyleClass("horizonStyle");
					   	 // var hbox =  new sap.m.HBox("hbox_detailes" + currQuestionId,{
					     // displayInline:true,
					     // items:[
					     //  olabelName,
					     //  oInput,
					     //  olabelDate,
					     //  datePicker
					     // ]
					     //}).addStyleClass("horizonStyle");  
					      
					//////////////
					
					// oPage.addContent(hbox);
					oPage.addContent(oRadioBtnGrp);
					var label1 = new sap.m.Label("L_" + currQuestionId + "other", {
						text: "Choose another score",
						visible: false
					});
					var oCombobox = that.getComboScore(that.oDataQQ, currQuestionId);
					var label2 = new sap.m.Label({
						text: "Choose another Reason"
					});
					var oInput = new sap.m.Input("I_" + currQuestionId + "other",{enabled:"{ObjectView>/bars/qqcalc/enabled}"});
					oPage.addContent(label1);
					oPage.addContent(oCombobox);
					oPage.addContent(label2);
					oPage.addContent(oInput);
					countQuestion = countQuestion + 1;
					countPoss = 1;
				}
				id = "RB_" + obj.AnswerID;
				oRadioBtn = sap.ui.getCore().byId(id);
				if (oRadioBtn !== undefined) {
					oRadioBtn.destroy();
				}

				oRadioBtn = new sap.m.RadioButton(id, {
					text: obj.SCORE + "- " + obj.ATEXT
				});

				var oTemplate = new sap.ui.core.CustomData({
					key: "score",
					value: obj.SCORE
				});
				oRadioBtn.addCustomData(oTemplate);

				oRadioBtnGrp.addButton(oRadioBtn);
				oRadioBtnGrp.addStyleClass("qqRB");
				prevQuestionId = currQuestionId;
				countPoss = countPoss + 1;
			});
		},

		onSaveQQCalc: function() {
			this.getQuestenireResults();
		},
		setResultTable: function(){
			
		},
		onPresentResultDialog:function(){
			var that = this;
			var oDialog = externalFunctions._getDialog("resultDialog", "sr.view.dialog.resultDialog", 0.3, 0.3,this);
			
			var oControl = sap.ui.getCore().byId("table_indresult");
			var oResult = that.getModel("appView").getProperty("/resultData");
			//
				var oTemplate = new sap.m.ColumnListItem({
				type: "Active",
				cells: [
					new sap.m.Text({
						text: "{desc}",
						wrapping: false
					}),
						new sap.m.Text({
						text: {
							parts: ["ratio"],
							formatter: formatter.percentageFormatter
						},
						wrapping: false
					}),
					new sap.m.Text({
					text: {
							parts: ["rating", "ratingOffsets"],
							formatter: formatter.totalRatingQQcalFormatter
						},
						wrapping: false
					})
				]
			});
			var oModel = new sap.ui.model.json.JSONModel(oResult);
			oControl.bindItems({
				path: "/",
				template: oTemplate
			});
			oControl.setModel(oModel);
			//
			
			oDialog.open();
		},
		setQQTable: function(arrScore){
			var that = this;
			var oData = {};
			oData.results = [];
			var aColumns = [];
			var oCells = [];
			var obj = {};
			for(var i = 0; i < arrScore.length; i++){
				obj[i + "_Cell"] = arrScore[i]; 
				var oColumn = new sap.m.Column({
					minScreenWidth: "Small",
					demandPopin: true,
					header: new sap.m.Text({
						text: i + 1,
					    textAlign:"Center"
					})
				});
				aColumns.push(oColumn);
				
				var oCell = new sap.m.Button({
						text: "{" + i + "_Cell" + "}" ,
						press: function(oEvent) {
						that.handleNav(oEvent, that);
				}
					}).addStyleClass("qqbtn");
			var oTemplate = new sap.ui.core.CustomData({
			key: "target",
			value: "p_" + (i + 1)
			});
			oCell.addCustomData(oTemplate);
			
				oCells.push(oCell);
			}
				oData.results.push(obj);
			
			var oTemplate = new sap.m.ColumnListItem({
				type: "Active",
				cells: [oCells]
			});
			that._initControl("table_score");
			var oControl = new sap.m.Table("table_score", {
				mode : sap.m.ListMode.None,
				columns: aColumns
			});
			
			oControl.bindItems({
				path: "/results",
				template: oTemplate
			});
			
			var oModel = new sap.ui.model.json.JSONModel(oData);
			oControl.setModel(oModel);

			var oPanel = this.byId("table_score_id");
			oPanel.addContent(oControl);
			return oControl;
		},
		_setDefaultValues:function(){
			var that = this;
			if((that.ArrQuestionId !== undefined) && (that.oCurrQA !== undefined) )
			{
				for (var i = 0; i < that.ArrQuestionId.length; i++) {
				var currQuestionId = that.ArrQuestionId[i];
				var sRgbId = "RBG_" + currQuestionId;
				var oRadioBtnGrp = sap.ui.getCore().byId(sRgbId);
				var oSelectedButton = oRadioBtnGrp.getSelectedButton();
				var sAnswerId = "";
				if(oSelectedButton === undefined)
				{
					sAnswerId = "";
				}else{
					var selectedItemId = oRadioBtnGrp.getSelectedButton().getId();
					sAnswerId = selectedItemId.substring(3, selectedItemId.length);
				}
				
					if(that.oCurrQA[currQuestionId] !== sAnswerId)
					{
						that.oCurrQA[currQuestionId] = sAnswerId;
					}
			}
			}
		},
		isModelChange:function(){
			var isModelChange = false;
			var sAnswerId = "";
			var that = this;
			if((that.ArrQuestionId !== undefined) && (that.oCurrQA !== undefined) )
			{
				for (var i = 0; i < that.ArrQuestionId.length; i++) {
				var currQuestionId = that.ArrQuestionId[i];
				var sRgbId = "RBG_" + currQuestionId;
				var oRadioBtnGrp = sap.ui.getCore().byId(sRgbId);
				var oSelectedButton = oRadioBtnGrp.getSelectedButton();
				if (oSelectedButton === undefined)
				{
					sAnswerId = "";
				}else{
					var selectedItemId = oRadioBtnGrp.getSelectedButton().getId();
						sAnswerId = selectedItemId.substring(3, selectedItemId.length);
				}
					if(that.oCurrQA[currQuestionId] !== sAnswerId)
					{
						isModelChange = true;
					}
			}
			}
		
			return isModelChange;
		},
		
	
		getQQcalcResults:function(){
			var that = this;
			that.qqcalcItems=[];
		
				for (var i = 0; i < that.ArrQuestionId.length; i++) {
					var reason = "";
					var currQuestionId = that.ArrQuestionId[i];
					var oName = sap.ui.getCore().byId("I_Name" + currQuestionId);
					var oDate = sap.ui.getCore().byId("D_P" + currQuestionId);
					var oResult = that.getQQcalcResultRecord(currQuestionId);
				
					var sRgbId = "RBG_" + currQuestionId;
					var oRadioBtnGrp = sap.ui.getCore().byId(sRgbId);
				var oSelectedButton = oRadioBtnGrp.getSelectedButton();
				if (oSelectedButton === undefined)
				{
					 reason = "";
				}else{
					reason = oSelectedButton.getProperty('text');
				}
					
						var pageIndex=i + 1;
					var qqobj = {
					headline:sap.ui.getCore().byId("p_" + pageIndex).getTitle(),
					reason:reason,
					score:oResult.score, 
					additional_reason:oResult.otherText,
					individual:oName.getText(),
					date: oDate.getValue()
				};
				that.qqcalcItems.push(qqobj);
				}
		},
		
		getQQcalcResultRecord: function(sQuestionId){
				var otherText = "";
				var currQuestionId = sQuestionId;
				var score=0;
				var sAnswerId="";
			
				var sRgbId = "RBG_" + currQuestionId;
				var oRadioBtnGrp = sap.ui.getCore().byId(sRgbId);
				var oSelectedButton = oRadioBtnGrp.getSelectedButton();
				if (oSelectedButton === undefined)
				{
					score = 0;
					otherText = "";
					sAnswerId = "";
				}else{
					var selectedItemId = oRadioBtnGrp.getSelectedButton().getId();
					 score = parseInt(oRadioBtnGrp.getSelectedButton().data("score"));
					    sAnswerId = selectedItemId.substring(3, selectedItemId.length);
					var sCbId = "CB_" + currQuestionId + "other";
					var oComboBox = sap.ui.getCore().byId(sCbId);
					var sInputId = "I_" + currQuestionId + "other";
					var oInput = sap.ui.getCore().byId(sInputId);
					if (sAnswerId.indexOf("Other") !== -1)
					{
						score = parseInt(oComboBox.getSelectedKey());
					}	
						if (oInput.getValue() !== "") {
						otherText = oInput.getValue();
					}
					}
				
				var obj = {
					"otherText":otherText,
					"score":score,
					"answerId":sAnswerId
				};
				return obj;
		},
		getQuestenireResults: function(){
			var that = this;
			var sMethod = "";
			var date = null;
			var sQuery = "";
			var score = 0;
			var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			var oOdataModel = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			sap.ui.getCore().setModel(oOdataModel);
			var sAnswerId = "";
			var aBatchOper = [];
			var sAnswer = {};
			var arrScore = [];

			var oUser = this.getModel("appView").getProperty("/user");

			var oFinForm = this.getModel("appView").getProperty("/selectedfinForm");
		                 
			this.coid = oFinForm.coid.toString();
			this.formid = oFinForm.formid;
			this.stmtdate = oFinForm.stmtdate;
			var finFormId = that.getModel("appView").getProperty("/selectedfinForm").FORMID;
	
			for (var i = 0; i < that.ArrQuestionId.length; i++) {
				var otherText = "";
				var currQuestionId = that.ArrQuestionId[i];
				
				var oDate = sap.ui.getCore().byId("D_P" + currQuestionId);
				var oName = sap.ui.getCore().byId("I_Name" + currQuestionId);
			
				var oResult = that.getQQcalcResultRecord(currQuestionId);

					date = new Date();
					arrScore.push(oResult.score);
		
				if (that.isUpdate) {
						if(that.oCurrQA[currQuestionId] !== oResult.answerId)
						{
							that.oCurrQA[currQuestionId] = oResult.answerId;
							oDate.setDateValue(date);
							oName.setText(oUser.E_MAIL);
							that.oCurrQA[currQuestionId] = oResult.answerId;
							sMethod = "PUT";
							sAnswer = {
							"AnswerID.AnswerID": oResult.answerId,
							"CreatedAt": date,
							"OtherText": oResult.otherText,
							"Score": oResult.score,
						     "UserName": oUser.E_MAIL,
							"CreatedBy.USERID": this.USERID
						};
						sQuery = "/QQresults(QUESTIONID.QuestionID='" + currQuestionId +
						"',finForm.formid='" + this.formid +
						"',QQCALCID.ID='" + this.formid +
						"')";
						aBatchOper.push(oOdataModel.createBatchOperation(sQuery, sMethod, sAnswer));
					}
				 }else {
				 	
				 	oDate.setDateValue(date);
					oName.setText(oUser.E_MAIL);
				 	that.oCurrQA[currQuestionId] = oResult.answerId;
					sAnswer = 
					{
						"QUESTIONID.QuestionID":currQuestionId,
						"finForm.formid": this.formid,
						"QQCALCID.ID":this.formid,
						"AnswerID.AnswerID": oResult.answerId,
						"CreatedAt": date,
						"OtherText": oResult.otherText,
						"Score": oResult.score,
					    "UserName": oUser.E_MAIL,
						"CreatedBy.USERID": this.USERID
					};
					sMethod = "POST";
					sQuery = "/QQresults";
					aBatchOper.push(oOdataModel.createBatchOperation(sQuery, sMethod, sAnswer));
				}
			 }
			
			if (that.isUpdate) {
				var oModel = sap.ui.getCore().getModel();
				oModel.addBatchChangeOperations(aBatchOper);
				oModel.setUseBatch(true);
				oModel.submitBatch(function(oData, oResponse, aErrorResponses) {
					if (aErrorResponses.length === 0) {
						that._updateScoring(arrScore,that);
						that.update_success(oData, that);
					} else {
						that.update_failed(aErrorResponses, that);
					}
				});
			} else {
				oOdataModel.addBatchChangeOperations(aBatchOper);
				oOdataModel.submitBatch(function(oData, oResponse, aErrorResponses) {
					oOdataModel.refresh();
					if (aErrorResponses.length === 0) {
						that.isUpdate = true;
						that._updateScoring(arrScore,that);
						that.create_success(oData, that);
					} else {
						that.create_failed(aErrorResponses, that);
					}
				});
			}
		},
		update_success: function() {
			this.getModel("ObjectView").setProperty("/bars/qqcalc/enabled", false);
			sap.m.MessageToast.show("Update Succeed");
		},
		update_failed: function() {
			sap.m.MessageToast.show("Update failed");
		},

		getQQcalcAnswers: function() {
			http: //35.156.190.99:8000/SR_Services/SR_NEW.xsodata/QQresults?$format=json&$filter=finForm.formid%20eq%20%271%27
				var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			var oOdataModel = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			var that = this;

		},
		_bindQuestenire: function() {
			this.oCurrQA = [];
			var that = this;
			var arrScore = [];
			this.oDataQQ.forEach(function(obj) {
				arrScore.push(obj.Score);
				var currQuestion = obj['QUESTIONID.QuestionID'];
				var currAnswerId = obj['AnswerID.AnswerID'];
				that.oCurrQA[currQuestion] = currAnswerId;
				var sRgbId = "RBG_" + currQuestion;
				var oRadioBtnGrp = sap.ui.getCore().byId(sRgbId);
			
				var sRbId = "RB_" + currAnswerId;
				var oRadioBtn = sap.ui.getCore().byId(sRbId);
				oRadioBtnGrp.setSelectedButton(oRadioBtn);
				var oDate = sap.ui.getCore().byId("D_P" + currQuestion);
				var oName = sap.ui.getCore().byId("I_Name" + currQuestion);
				oDate.setDateValue(obj.CreatedAt);
				oName.setText(obj.UserName);
			
				if (currAnswerId.indexOf("Other") !== -1) {
					var sCbId = "CB_" + currQuestion + "other";
					var oComboBox = sap.ui.getCore().byId(sCbId);
					oComboBox.setSelectedKey(obj.Score);
				}
				var sInputId = "I_" + currQuestion + "other";
				var oInput = sap.ui.getCore().byId(sInputId);
				oInput.setValue(obj.OtherText);
			
			});
			that._updateScoring(arrScore, that);
		},
		_updateScoring: function(arrScore,that){
			that._calculateScore(arrScore);
			that.setQQTable(arrScore);
		},
		_calculateScore: function(arrScore) {
			var sum = 0;
			var count = 0;
			var iMaxScore = 15;
			for (var i = 0; i < arrScore.length; i++) {
				count = count + 1;
				sum = sum + parseInt(arrScore[i]);
			}
			var total = iMaxScore * count;
			var percentage = (sum / total) * 100;
			var sPercentage = this.percentageFormatter(percentage.toString());
			this.qqcalSum = sum;
			this.qqcalTotal = total;
			this.qqcalPercentage = sPercentage;
			var sTitle = "QQCalc Total: " + sPercentage + "( " + sum + " of " + total + " )";
			this.byId("qqtotal_id").setTitle(sTitle);
		},

		percentageFormatter: function(sValue) {
			var sReturnedValue = "";
			if (sValue !== "" || sValue !== undefined) {

				var fNumber = parseFloat(sValue); // convert string to float
				jQuery.sap.require("sap.ui.core.format.NumberFormat");
				var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					maxFractionDigits: 2,
					groupingEnabled: true,
					groupingSeparator: ",",
					decimalSeparator: "."
				});
				sReturnedValue = oNumberFormat.format(fNumber);
				sReturnedValue = sReturnedValue + "%";
				// sReturnedValue = sValue + "%";
			}
			return sReturnedValue;
		},

		_getAnswersData: function() {
			var that = this;
			var sLocalLan = this._ResourceBundle.sLocale;
			sLocalLan = "EN";
			var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			var oModel = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			var finFormId = that.getModel("appView").getProperty("/selectedfinForm").formid;
			oModel.read("QQresults?$format=json&$filter=finForm.formid eq " + "'" + finFormId + "'",
				null,
				null,
				false,
				function(oData, oResponse) { // there is questenire answers, bind questenire
					if (oData.results.length !== 0) {
						that.oDataQQ = oData.results;
						that._bindQuestenire();
						that.isUpdate = true;
					} else { // new questenire
						var sTitle = "";
						that.byId("qqtotal_id").setTitle(sTitle);
						that.isUpdate = false;
						var arrScore = ["0","0","0","0","0"];
						that._updateScoring(arrScore, that);
						// var oControl = sap.ui.getCore().byId("table_score");
						// if (oControl !== undefined){oControl.setVisible(false);}
						// var str = "Error fetching data";
						// sap.m.MessageToast.show(str);
					}
				}
			);
		},
		create_success: function(oData, that) {
			this.getModel("ObjectView").setProperty("/bars/qqcalc/enabled", false);
			sap.m.MessageToast.show("Create Succeed");
		},
		create_failed: function(aErrorResponses, that) {
			sap.m.MessageToast.show("Create Failed");
		},
			getResultDataToPDF: function(){
			var oResultData = [];
			var obj = {};
			var resultData = this.getModel("appView").getProperty("/resultData");
			for(var i = 1; i < resultData.length; i++){
				obj = {};
				obj.desc = resultData[i].desc;
				obj.ratio = formatter.percentageFormatter(resultData[i].ratio);
				obj.rating = formatter.totalRatingFormatter(resultData[i].rating,resultData[i].ratingOffsets);
				if(!isNaN(resultData[i].rating))
				{
				 obj.rating_val = resultData[i].rating;
				}else{
					obj.rating_val = "";
				}    
				
				oResultData.push(obj);
			}
			return oResultData;
		},
		
		getPdfData: function(){
			var that = this;
			var date = new Date();
			var sFormattedDate = formatter.dateFormatterIso(date);
			var oGeneralData = this.getModel("appView").getProperty("/selectedfinForm");
			var resultData = this.getResultDataToPDF();
			var oResultData = this.getModel("appView").getProperty("/resultData");
			var oFinForm = this.getModel("appView").getProperty("/selectedFormValues");
		    var oUser = this.getModel("appView").getProperty("/user");
		    that.getQQcalcResults();
		    var userName = oUser.FIRSTNAME + " " +  oUser.LASTNAME;            
			var user = {
				"Email": oUser.E_MAIL,
	    		"Company":oUser.ClientNAME
			};
				
			var indRating = this.getModel("appView").getProperty("/indRating");
			var qqcalc = {
			sum:this.qqcalSum,
			total:this.qqcalTotal,
			percentage:this.qqcalPercentage
			};
			
			var oData = {};
			oData.is2Bar=true;
			oData.coname = oGeneralData.coname;
			oData.Name = userName;
			oData.date = sFormattedDate;
			oData.stmtdate =  oGeneralData.stmtdate;
			oData.desc =  oGeneralData.description;
			oData.sic =  oGeneralData.sicode;
			oData.items = oFinForm;
			oData.ratingItems = resultData;
			oData.User = user;
			oData.indRating = indRating;
			oData.qqcalc = qqcalc;
			oData.qqcalcItems = that.qqcalcItems;
			return oData;
		},
	 	_sendPdf:function(oData){
			var sFileName = oData.coname + " QQcalc Report.pdf";
			var sServiceName =  "/JSPDF"; 
			//	jsreport.serverUrl = sServiceName;
			jsreport.serverUrl = "https://sr.jsreportonline.net/";
			jsreport.headers['Authorization'] = "Basic " +  btoa("dana17@gmail.com:iprosis");
			var request = {"template":{"name":"qqcalc"},"data":oData,"options": { timeout: 60000 },"Content-Disposition": {"Content-Disposition": "attachment; filename=" + sFileName}};
		
			jsreport.download(sFileName, request);
				//display report in the new tab
			// jsreport.render('_blank', request);
	 	},
	 	onReportQqcalc: function(){
			var oData = this.getPdfData();	
			this._sendPdf(oData);
		}

	});
});