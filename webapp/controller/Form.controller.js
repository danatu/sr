/*global location*/
sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sr/model/formatter",
	"sr/util/externalFunctions"
], function(BaseController, JSONModel, History, formatter, externalFunctions) {
	"use strict";
	return BaseController.extend("sr.controller.Form", {
		formatter: formatter,

		onInit: function() {
			var vservice = "/HANADB/SR_Services/SR_Data.xsodata/";
			this.oModel_SRData = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			this.oModel_SRNew = new sap.ui.model.odata.ODataModel(vservice, {
			json: true
			});
			
			this.oBusyIndicatorSave = new sap.m.BusyDialog({
				title: this.getResourceBundle().getText("save_process")
			});
			
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("Form", "FormEvent", this._handleFormEvents, this);
		},
		_handleFormEvents:function(channel, event, item)
		{
			if (item === "addFin")
			{
					this.onAddFin();
			}else if (item === "presentFin"){
				this.onPresentFin();
			}else if (item === "updateFin"){
				this.onUpdateCustData();
			}else{
				this.onCreateRecord();
			}
		},
		
		_populateGeneralFinData: function() {
			var that = this;
			for (var obj in this.CustData) {
					var oControl = 	this.byId(obj + "_id");
					if (oControl!== undefined)
					{
							this.setControllerValue(oControl,this.CustData[obj]);
					}
				}
		},
		onPresentFin: function(){
			this.getModel("ObjectView").setProperty("/isUpdate", true);
			this.getModel("ObjectView").setProperty("/isWhatifEnabled", true);
			this.CustData =	this.getModel("appView").getProperty("/selectedfinForm");
			this._populateGeneralFinData();
			this._populateFinForm(this.CustData.formid);
			this.setControlEnabled(false);
		},
		onAddFin: function(){
			this.getModel("ObjectView").setProperty("/isUpdate", false);
			this.CustData =	this.getModel("appView").getProperty("/selectedfinForm");
			//this.CustData.isgrp = "0";
			this._populateFinForm("100");
			this.setControlEnabled(true);
			this._populateGeneralFinData();
			// this.clearFields();

			this.getModel("ObjectView").setProperty("/isWhatifEnabled", false);
		//	this._setWhatIfState(true);
		},
		_getSelectedForm: function(oEvent){
			var oFormData = null;
			var oItem = oEvent.getSource().getBindingContext();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			// var sPath = oEvent.getParameters("selectedItem").selectedItem.getBindingContext().getPath();
			oFormData = oItem.getProperty(sPath);
			this.getModel("appView").setProperty("/selectedfinForm", oFormData);
			return oFormData;
		},

		setControllerValue: function(oControl, sValue) {
			var controlType = oControl.getMetadata().getName();
			if (controlType === "sap.m.SelectList" || controlType === "sap.m.ComboBox") {
				oControl.setSelectedKey(sValue);
			} else if (controlType === "sap.m.Input" || controlType === "sap.m.TextArea") {
				oControl.setValue(sValue);
			} else {
				var val = parseInt(sValue);
				if (isNaN(val) === true)
				{
					val = 0;
				}
				oControl.setSelectedIndex(val);
			}
		},


		getServiceMetadata: function(sServiceName,oModel) {
			var entityArr = [];
			var entityTypes = oModel.getServiceMetadata().dataServices.schema[0].entityType;
			entityTypes.forEach(function(entity) {
				if (entity.name === sServiceName + "Type") {
					entityArr = entity.property;
				}
			});
			return entityArr;
		},
	    LoadFinMetadata: function(finArrControlArr){
			for (var i = 0; i < finArrControlArr.length; i++){
				var oControl = finArrControlArr[i];
				var oTemplate = new sap.ui.core.CustomData({
					key: "Edm.Decimal",
					value: "Edm.Decimal"
				});
				oControl.addCustomData(oTemplate);
			}
	    },
		LoadGeneralMetadata: function(){
			var sServiceName = this._getServiceName();
			var oModel = this.oModel_SRData;
			var oMetaData = this.getServiceMetadata(sServiceName, oModel);
			for (var i = 0; i < oMetaData.length; i++) {
				var fieldName = oMetaData[i].name;
				var oControl = this.byId(oMetaData[i].name + "_id");
				if (oControl !== undefined) {
					var oTemplate = new sap.ui.core.CustomData({
						key: oMetaData[i].type,
						value: oMetaData[i].type
					});
					oControl.addCustomData(oTemplate);
				}
			}
		},
		// _getFormTooltip: function(sFieldName) {
		// 	var arrTooltip = [{
		// 		coname: {
		// 			title: "Legal Characters",
		// 			desc: "Company Name can only include the following characters: alphanumeric, space, comma, underline, period, parens, square brackets, hyphen, quote or dollar sign"
		// 		},
		// 		assurance: {
		// 			title: "Data Assurance",
		// 			desc: "represents level of Assurance including None, Compilation, Reviewed, Audited."
		// 		},
		// 		NETREV: {
		// 			title: "Net Sales or Revenues",
		// 			desc: "represents gross sales and other operating revenue less discounts, returns and allowances."
		// 		},
		// 		OPEINCOME: {
		// 			title: "Operating Income",
		// 			desc: "represents the operating income generated from the geographic region updated."
		// 		},
		// 		PRETAXINCOME: {
		// 			title: "Pre-Tax Income",
		// 			desc: "represents all income/loss before any federal, state or local taxes. Extraordinary items reported net of taxes are excluded."
		// 		},
		// 		NETINCOME: {
		// 			title: "Net Income",
		// 			desc: "represents the net income of the company."
		// 		},
		// 		RECEIVABLES: {
		// 			title: "Receivables - Net",
		// 			desc: "represents the amounts due to the company resulting from the sale of goods and services on credit" +
		// 				"to customers (after applicable reserves). These assets should reasonably be expected to be collected within" +
		// 				"a year or within the normal operating cycle of a business."
		// 		},
		// 		CURRASSETS: {
		// 			title: "Total Current Assets",
		// 			desc: "represents cash and other assets that are reasonably expected to be realized in cash," +
		// 				"sold or consumed within one year or one operating cycle. Generally, it is the sum of cash" +
		// 				"and equivalents, receivables, inventories, prepaid expenses and other current assets." +
		// 				" For non-U.S. corporations, long term receivables are excluded from current assets even" +
		// 				" though included in net receivables."
		// 		},
		// 		PPE: {
		// 			title: "Property, Plant and Equipment",
		// 			desc: "represents tangible assets with an expected useful life of over one year which are expected to be" +
		// 				"used to produce goods for sale or for distribution of services."
		// 		},
		// 		OTHERASSETS: {
		// 			title: "Other Long-term Assets",
		// 			desc: "includes goodwill, intangibles, investments, deferred taxes, assets held for sale," +
		// 				"pension plan assets, and/or other non-current assets."
		// 		},
		// 		TOTASSETS: {
		// 			title: "Total Assets",
		// 			desc: "represents the sum of total current assets, long term receivables, investment in" +
		// 				"Unconsolidated subsidiaries, other investments, net property plant and equipment and other assets."
		// 		},
		// 		CURRLIABILITIES: {
		// 			title: "Current Liabilities",
		// 			desc: "represents the Current Liabilities of a non-U.S. company adjusted to" +
		// 				"conform to U.S. Generally Accepted Accounting Principles."
		// 		},
		// 		LONGTERMDEBT: {
		// 			title: "Long-term Debt",
		// 			desc: "represents all interest bearing financial obligations, excluding amounts due within" +
		// 				"One year. It is shown net of premium or discount."
		// 		},
		// 		OTHERLIABILITIES: {
		// 			title: "Other Long-term Liabilities",
		// 			desc: "represents all interest bearing financial obligations, excluding amounts due within" +
		// 				"One year. It is shown net of premium or discount."
		// 		},
		// 		SHAREHOLDER: {
		// 			title: "Shareholder ",
		// 			desc: "represents the sum of Preferred Stock and Common Shareholders Equity."
		// 		},
		// 		CASHBEGIN: {
		// 			title: "Cash/Cash Equivalents at Beginning of Period ",
		// 			desc: "represents Cash & Short Term Investments at the beginning of the period."
		// 		},
		// 		NETCASHOP: {
		// 			title: "Net Cash Provided by Operation ",
		// 			desc: "represents total net cash received from continuing" +
		// 				"Operations. This item reflects the change in cash allocable to continuing" +
		// 				"operations after the effects of exchange rates on cash."
		// 		},
		// 		NETCASHINVEST: {
		// 			title: "Net Cash Used for Investment",
		// 			desc: "represents the net cash receipts and disbursements resulting from" +
		// 				"Capital expenditures, decrease/increase from investments, disposal of fixed assets," +
		// 				"increase in other assets and other investing activities." +
		// 				"A positive value in this field represents an outflow (use) of funds." +
		// 				"A negative value in this field represents an inflow (source) of funds."
		// 		},
		// 		NETCASHFINANC: {
		// 			title: "Net Cash Used for Financing",
		// 			desc: "represents the net cash receipts and disbursements resulting from" +
		// 				"reduction and/or increase in long or short term debt, proceeds from sale of stock, stock" +
		// 				"re-purchased/redeemed/retired, dividends paid and other financing activities."
		// 		},
		// 		CASHEND: {
		// 			title: "Cash/Cash Equivalents at End of Period",
		// 			desc: "represents Cash & Short Term Investments."
		// 		},
		// 		cosic: {
		// 			title: "SIC Code",
		// 			desc: "represents The Standard Industrial Classification Code (see www.siccode.com)"
		// 		}
		// 	}];
		// 	return arrTooltip[0][sFieldName];
		// },
		_initControl: function(id) {
		var oControl = sap.ui.getCore().byId(id);
		if (oControl !== undefined) {
			oControl.destroy();
		}
	},

		_setFormTooltip: function(obj,oControler) {
				var sTitle = obj.fieldname;
				var sId = obj.id;
				var sTooltip = obj.Description;
				this._initControl("rtt" + sId);
				var oToolTip = new sap.ui.commons.RichTooltip("rtt" + sId, {
				title:sTitle,
				text: sTooltip
				});
				oControler.setTooltip(oToolTip);
		},
		onSelectCB: function(oEvent){
		var isSelected = oEvent.getSource().getProperty("selected");
		var sId = oEvent.getSource().getId().substring(3,oEvent.getSource().getId().length);
			var oComboControl = sap.ui.getCore().byId("wi_combo_" + sId );
			var oValueControl = sap.ui.getCore().byId("wi_val_" + sId );
			var oActualControl = sap.ui.getCore().byId("wi_result_" + sId );
			var oControllers = [oComboControl, oValueControl, oActualControl];
			if (oComboControl !== undefined) {
				for (var j = 0; j < oControllers.length; j++) {
					// set visibility
					oControllers[j].setVisible(isSelected);
				}
				
				//set combo selection
				oComboControl.setSelectedKey("f");
				//clear field
				oValueControl.setValue("");
				oActualControl.setValue("");
			}
		},
		_populateFinForm: function(sFormId) {
		var oWiControl;
		var that = this;
		that.oFinanceData = {};
		var objFinance = {};
		that.formControlsArr = [];
		that.wioControls = [];
	//	var iIndex = 0;
		var oForm = this.byId("form_nonBanking");
		var oModel = this.oModel_SRNew;
		var sLang = this._getLanguage();
	
		var sServicrVal = "Finform?$filter=Langauge eq '" + sLang + "' and formid eq '" + sFormId + "' &$orderby=index";
		var oFinForm = this.getServiceData(sServicrVal,oModel);
		this.getModel("appView").setProperty("/selectedFormValues", oFinForm);

	if (oFinForm.length !== undefined )
	{
		oFinForm.forEach(function(obj){
		var sFieldId = obj.id;
		var sId = obj.id;
		var sName = obj.fieldname;
		var sValue = obj.fieldval;
		that.oFinanceData[sFieldId] = sValue;
		var sTooltip = obj.Description;

	
		that._initControl("cb_" + sId);
		var oCB = new sap.m.CheckBox("cb_" + sId,{
			visible:false,
				select: function(oEvent) {
						that.onSelectCB(oEvent);
					}
		}).addStyleClass("cbWi");
		
		that._initControl("label_actual_" + sId);
		var oLabel = new sap.m.Label("label_actual_" + sId,
			{text:sName,
		 	 width:"100%"}); 
		that._initControl("actual_" + sId);
		var oInputActual =  new sap.m.Input("actual_" + sId,{
			valueLiveUpdate:true, 
			liveChange: function(oLiveEvent) {
						that._validateModelChanges(oLiveEvent);
				},
			enabled:false, 
			width:"100%", 
			fieldWidth:""
		});
		that._initControl("wi_combo_" + sId);
		var oComboBox =  new sap.m.ComboBox("wi_combo_" + sId,{
			change: function(oChangeEvent) {
								that._calculateWiValue(oChangeEvent);
							},
			value:"Percentage", 
			selectedKey:"item1", 
			visible:false
		});
		that._initControl("__itemiw" + sId + "_1");
		that._initControl("__itemiw" + sId + "_2");
		oComboBox.addItem(new sap.ui.core.ListItem({
						text:"%", 
						key:"p", 
						id:"__itemiw" + sId + "_1"
						}));
		oComboBox.addItem(new sap.ui.core.ListItem({
						text:"Fixed", 
						key:"f", 
						id:"__itemiw" + sId + "_2"
						}));
		that._initControl("wi_val_" + sId);
		var oInputWiVal =  new sap.m.Input("wi_val_" + sId,{
			liveChange: function(oLiveEvent) {
						that._calculateWiValue(oLiveEvent);
				},
			placeholder:"Value", 
			valueLiveUpdate:true, 
			enabled:true, 
			width:"100%",					
			visible:false
		});
		that._initControl("wi_result_" + sId);
		var oInputWiRes =  new sap.m.Input("wi_result_" + sId,{
			valueLiveUpdate:true, 
			enabled:true, 
			width:"100%", 
			visible:false
		});
		that._initControl("hbox" + sId);
		 var oHbox = new sap.m.HBox("hbox" + sId, {
		 	 width:"100%", 
			 alignContent:"SpaceAround", 
			 fitContainer:true, 
			 alignItems:"Start",
		   	 items:[oCB,oInputActual,
		   			oComboBox,
		   			oInputWiVal,
		   			oInputWiRes]
		});
		
		oForm.addContent(oLabel);
		//oForm.addContent(oCB);
		oForm.addContent(oHbox);
		
		that.setControllerValue(oInputActual, sValue);
		that._setFormTooltip(obj,oInputActual);
		that.formControlsArr.push(oInputActual);
		that.wioControls.push(oInputWiRes);
		// that.byId("form_nonBanking").setVisible(true);
		// that.byId("form_Banking").setVisible(false);
	//	iIndex = iIndex + 1;
		});
		
		this.LoadFinMetadata(that.formControlsArr);
		this.LoadGeneralMetadata();
	}

		},

		_populateFinForm2: function(oEvent) {
			this.formControlsArr = [];
			this.wioControls = [];
			var oWiControl;
			var that = this;
			// var oItem = oEvent.getParameters("selectedItem").selectedItem.getBindingContext();
			var oItem = oEvent.getSource().getBindingContext();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			// var sPath = oEvent.getParameters("selectedItem").selectedItem.getBindingContext().getPath();
			this.CustData = oItem.getProperty(sPath);
			this.getModel("appView").setProperty("/selectedfinForm", this.CustData);
			for (var propertyName in this.CustData) {
				var oControl = this.byId(propertyName + "_id");
				that._setFormTooltip(propertyName, oControl);
				oWiControl = this.byId("wi_result_" + propertyName + "_id");
				var sValue = this.CustData[propertyName];
				if (oControl !== undefined) {
					this.formControlsArr.push(oControl);
					this.wioControls.push(oWiControl);
					that.setControllerValue(oControl, sValue);
				}
			}
			this.LoadMetadata();
			this.setControlEnabled(false);

			this.byId("form_nonBanking").setVisible(true);
			this.byId("form_Banking").setVisible(false);

			//	this.setBtnEditState(false);
		},
		

	_getCustData: function(){
			var oFormData = {
					approvaldate:"",
					certifier:"",
					changedby:"",
					coid:"",
					coname:"",
					createdat:"",
					createdby:"",
					currency:"",
					formid:"",
					groupid:"",
					isgrp:"",
					sicode:"",
					sourceid:"",
					sr_rating:"",
					sr_rating_offset:"",
					status:"",
					stmtdate:"",
					type:""
				};
				return 	oFormData;
		},
			initControlValue: function(oControl) 
			{
					var val = "";
					var controlType = oControl.getMetadata().getName();
				if (controlType === "sap.m.Input") {
					oControl.setValue("");
				} else if (controlType === "sap.m.ComboBox") {
					oControl.setSelectedKey("");
				} else if (controlType === "sap.m.RadioButtonGroup") {
					oControl.setSelectedIndex(0);
				}
			},
		clearFields: function(){
		// general
		for (var obj in this.CustData) {
			var oControl = 	this.byId(obj + "_id");
			if (oControl !== undefined)
			{
				this.initControlValue(oControl); 	
			}
		}
		//form
			for (var i = 0; i < this.formControlsArr.length; i++) {
			   	this.initControlValue(this.formControlsArr[i]);
			}
		},
		setControlEnabled: function(state) {
		// general
		var that =this;
		for (var obj in this.CustData) {
			var oControl = 	this.byId(obj + "_id");
			if ((oControl !== undefined) )
			{
				var key = oControl.getCustomData()[0];
				 var isUpdate = that.getModel("ObjectView").getProperty("/isUpdate");
				if((key !== undefined) && (isUpdate === true) ){
					oControl.setEnabled(false);	
				}else{
					oControl.setEnabled(state);	
				}
			}
		}
		//form
			for (var i = 0; i < this.formControlsArr.length; i++) {
				this.formControlsArr[i].setEnabled(state);
			}
		},

		setBtnEditState: function(isEdit) {
			this.setControlEnabled(isEdit === true);
				this.getModel("ObjectView").setProperty("/enableEdit",!isEdit);
		},
		onEdit: function(oEvent) {
			this.setBtnEditState(this._oViewModel.getProperty("/enableEdit"));
		},
		/**
		 *@memberOf sr.controller.Object
		 */
		setControlValue: function(oControl, sValue) {
			var controlType = oControl.getMetadata().getName();
			if (controlType === "sap.m.SelectList" || controlType === "sap.m.ComboBox") {
				oControl.setSelectedKey("");
			} else if (controlType === "sap.m.Input" || controlType === "sap.m.TextArea") {
				oControl.setValue("");
			}
		},
		// clearFields: function() {
		// 	var that = this;
		// 	var formsArr = ["form_Banking", "form_nonBanking", "form_general"];
		// 	formsArr.forEach(function(form) {
		// 		var aInputControls = that._getFormFields(that.byId(form));
		// 		var oControl;
		// 		for (var m = 0; m < aInputControls.length; m++) {
		// 			oControl = aInputControls[m].control;
		// 			that.setControlValue(oControl, "");
		// 		}
		// 	});
		// },
		_getFormFields: function(oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				// if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType === "sap.m.RadioButtonGroup") {
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox") {
					aControls.push({
						control: aFormContent[i]
					});
				}
			}
			return aControls;
		},
		getControlValue: function(oControl) {
			var controlType = oControl.getMetadata().getName();
			var val = "";
			if (controlType === "sap.m.SelectList" || controlType === "sap.m.ComboBox") {
				val = oControl.getSelectedKey();
			} else if (controlType === "sap.m.Input" || controlType === "sap.m.TextArea") {
				val = oControl.getValue();
			} else {
				val = oControl.getSelectedIndex();
			}
			return val;

		},
		getControlId: function(oControl) {
			var sViewId = this.getView().getId();
			var sControlId = oControl.getId();
			sControlId = sControlId.substring("actual_".length,sControlId.length);
			return sControlId;
		},

		_validateModelChanges: function(oEvent) {
			this.getModel("ObjectView").setProperty("/enableUpdate", this.isModelChange() === true);
			this.getModel("ObjectView").setProperty("/enableCreate", this.isModelChange() === true);
		},
		isModelChange: function(){
			var that = this;
			var isModelChange = false;
			if (that.CustData !==undefined)
			{
			var iAssurance = parseInt(that.CustData.assurance);
			var iScale = parseInt(that.CustData.scale);
			if (isNaN(iAssurance))
			{
				that.CustData.assurance = "";
			}
			if (isNaN(iScale))
			{
				that.CustData.scale = "";
			}	

			}
	
			
			for (var i in that.CustData) {
				var controlId = i + "_id";
				var oController = this.byId(controlId);
				if (oController !== undefined) {
					var controlVal = this.getControlValue(oController).toString();
					var modelVal = that.CustData[i];
					if (modelVal === undefined || modelVal === null){modelVal = "";}
					modelVal = modelVal.toString();
				//	var isEq = 	(!((modelVal === "" && controlVal === "0") || (modelVal === "0" && controlVal === "") ));
					var isEq = true;
					if (controlVal !== modelVal && isEq === true ) {
						isModelChange = true;
					}
				}
			}
				for (i in that.oFinanceData) {
				var controlId = "actual_" + i; 
				var oController = sap.ui.getCore().byId(controlId);
				if (oController !== undefined) {
					var controlVal = this.getControlValue(oController);
					var modelVal = that.oFinanceData[i]; 
					if (modelVal === undefined || modelVal === null ){modelVal = ""; }
					if (controlVal !== modelVal) {
						isModelChange = true;
					}
				}
			}
			
			return isModelChange;
		},
		_setToString:function(sVal){
		var sValue = "";
		if(sVal === null){
					sValue = "";
				}else{
				sValue.toString();
				}
				return sVal;
		},
		_setDefaultValues:function(){
				var that = this;
				for (var i in that.CustData) {
				var controlId = i + "_id";
				var oController = this.byId(controlId);
				if (oController !== undefined) {
					var controlVal = that._setToString(this.getControlValue(oController));
					var modelVal = that._setToString(that.CustData[i]);
					that.setControllerValue(oController, modelVal);
				}
			}
				for ( i in that.oFinanceData) {
				var controlId = "actual_" + i; 
				var oController = sap.ui.getCore().byId(controlId);
				if (oController !== undefined) {
					var controlVal = this.getControlValue(oController);
					var modelVal = that.oFinanceData[i]; 
					if (modelVal === undefined || modelVal === null ){modelVal = ""; }
					if (controlVal !== modelVal) {
						that.setControllerValue(oController, modelVal);
					}
				}
			}	
		},
		getServiceData: function(sServiceVal,oModel) {
			var Data = {};
			oModel.read(sServiceVal, null, null, false, function(oData, oResponse) {
				if (oData.results.length !== 0) {
					Data = oData.results;
				}
			});
			return Data;
		},

		_getFormFieldValue: function(oControl, val) {
			var controlValType = oControl.getCustomData()[0].getProperty("key");
			if (controlValType.includes("Int")) {
				return parseInt(val);
			} else if (controlValType.includes("Double")) {
					return val;
				//	return parseInt(val);
			//	return parseFloat(val);
			} else {
				if (val === "")
				{
					val = "0";
				}
				return val;
			}
		},
		_getFormRec: function() {
			// wi_result_CASHEND_id
			var oForm = {};
			
			var currVal;
			var sControlId;
			var isWhatIf = this.getModel("ObjectView").getProperty("/isWhatif");
			if (isWhatIf === true) {
				for (var i = 0; i < this.formControlsArr.length; i++) {
					sControlId = this.getControlId(this.formControlsArr[i]);
					if (this.wioControls[i] === undefined) {
						currVal = this.getControlValue(this.formControlsArr[i]);
						oForm[sControlId] = this._getFormFieldValue(this.formControlsArr[i], currVal);
					} else {
						currVal = this.getControlValue(this.wioControls[i]);
						if (currVal !== "") {
							oForm[sControlId] = this._getFormFieldValue(this.formControlsArr[i], currVal);
						} else {
							currVal = this.getControlValue(this.formControlsArr[i]);
							oForm[sControlId] = this._getFormFieldValue(this.formControlsArr[i], currVal);
						}

					}
				}
			} else {
				for (var i = 0; i < this.formControlsArr.length; i++) {
					sControlId = this.getControlId(this.formControlsArr[i]);
					currVal = this.getControlValue(this.formControlsArr[i]);
					oForm[sControlId] = this._getFormFieldValue(this.formControlsArr[i], currVal);
				}
			}
			return oForm;
		},
		
_getFormGeneral:function(isUpdate){
			var that = this;
			var isWhatIf = this.getModel("ObjectView").getProperty("/isWhatif");
			var oUser = that.getModel("appView").getProperty("/user");
			var date = new Date();
			var oGeneralForm = {};
			var oSelectedForm = this.getModel("appView").getProperty("/selectedfinForm");
if(isUpdate)
{
		oGeneralForm = {				
				createdat:oSelectedForm.createdat,
				groupid:oUser.GROUPID_ID ,
				sourceid:"1",
				type: oSelectedForm.type,
				status:"1",
				isgrp:this.byId("isgrp_id").getSelectedIndex().toString(),
				changedby:oUser.USERID ,
				currency:this.byId("currency_id").getSelectedKey(),
				sicode:oSelectedForm.sicode,
				coname:oSelectedForm.coname,
				assurance: parseInt(this.byId("assurance_id").getSelectedKey()) ,
				scale:parseInt(this.byId("scale_id").getSelectedKey()) ,
				description:this.byId("description_id").getValue()
			};
}else{
	var sType = "";
				if (isWhatIf)
				{
					sType = oSelectedForm.type;
				}else{
					sType = sap.ui.getCore().byId("cb_create_industry").getSelectedKey(); 
				}
				oGeneralForm = {				
				formid:"",
				coid:this.byId("coid_id").getValue(),
				stmtdate:this.byId("stmtdate_id").getValue(),
				createdat:date,
				createdby:oUser.USERID ,
				groupid:oUser.GROUPID_ID ,
				sourceid:"1",
				type: sType,
				status:"1",
				isgrp:this.byId("isgrp_id").getSelectedIndex().toString(),
				changedby:oUser.USERID ,
				currency:this.byId("currency_id").getSelectedKey(),
				sicode:this.byId("sicode_id").getValue(),
				coname:this.byId("coname_id").getValue(),
				assurance: parseInt(this.byId("assurance_id").getSelectedKey()) ,
				scale:parseInt(this.byId("scale_id").getSelectedKey()) ,
				description:this.byId("description_id").getValue()
			};
				if (isWhatIf)
				{
					oGeneralForm.coname = oSelectedForm.coname + " What If";
				}
}
			return oGeneralForm;
},
		onCreateRecord: function() {
			var that = this;
			this.oModel = this.oModel_SRNew;
			var oGeneralForm = that._getFormGeneral(false);
			// oGeneralForm.type = that.custData.type;
			var serviceData = "/Findatageneral";
		
			this.oBusyIndicatorSave.setTitle(this.getResourceBundle().getText("save_process"));
			this.oBusyIndicatorSave.open();
			this.oModel.create(serviceData, oGeneralForm,
			{
		       success : function(oData, oResponse) {
		            // Success
		            var sFormid = oResponse.data.formid;
		            oGeneralForm.formid = sFormid;
		            that.CustData = oGeneralForm;
		            that.getModel("appView").setProperty("/selectedfinForm",oGeneralForm);
		            that.createFinRecord(sFormid);
		       },
		       error : function(oError) {
		           // Error
		         that.create_failed(that);
		       }
		  });
			
		},
		createFinRecord: function(sFormId)
		{
			var that = this;
			this.oModel = this.oModel_SRNew;
			 var oForm = this._getFormRec();
			oForm.formid = sFormId;
			var serviceData = "/FormDataLoad";
			this.oModel.create(serviceData, oForm, 
			{
		       success : function(oData, oResponse) {
		       		that.oFinanceData = oForm;
		        	that.create_success(that);
		        	if(	that.getModel("ObjectView").getProperty("/isWhatif") === true){
		       			that._populateFinForm(sFormId);
		       		}
		       },
		       error : function(oError) {
		          sap.m.MessageToast.show(that.getResourceBundle().getText("save_failed"));
		          	that.oBusyIndicatorSave.close();
		       }
		    }
				);

		},
		create_success: function(that) {
			var oEventBus = sap.ui.getCore().getEventBus();
		 	 oEventBus.publish("Object", "ObjectEvent", "refresh");
		 	 that.getModel("ObjectView").setProperty("/isUpdate", true);
			 that.setControlEnabled(false);
			 that.oBusyIndicatorSave.close();
			sap.m.MessageToast.show(that.getResourceBundle().getText("save_succeed"));
		},
		create_failed: function(that) {
			that.oBusyIndicatorSave.close();
			sap.m.MessageToast.show(that.getResourceBundle().getText("save_failed"));
		},

		onUpdateCustData: function(){
			var that = this;
			this.oModel = this.oModel_SRNew;
			var oDataForm = this.CustData;
			var oGeneralForm = that._getFormGeneral(true);
			that.oBusyIndicatorSave.setTitle(this.getResourceBundle().getText("update_process"));
			that.oBusyIndicatorSave.open();
			setTimeout(function(){
				var serviceData = "/Findatageneral(formid='" + oDataForm.formid + "',coid='" + oDataForm.coid + "',stmtdate='" + oDataForm.stmtdate + "',createdby='" + oDataForm.createdby + "')";
				that.oModel.update(serviceData, oGeneralForm, null, function() {
				oGeneralForm.formid = oDataForm.formid;
				that.getModel("appView").setProperty("/selectedfinForm",oGeneralForm);
				that.CustData = oGeneralForm;
				that.onUpdateFinForm();
			}, function() {
				that.update_failed(that);
			});
				}, 1500);
		},
		update_success: function(that) {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("Object", "ObjectEvent", "refresh");
			that.setControlEnabled(false);
			that.oBusyIndicatorSave.close();
			sap.m.MessageToast.show(that.getResourceBundle().getText("update_succeed"));
		},
		update_failed: function(that) {
			that.oBusyIndicatorSave.close();
			sap.m.MessageToast.show(that.getResourceBundle().getText("update_failed"));
		},
		onUpdateFinForm:function(){
			var that = this;
			var oForm = this._getFormRec();
			var oDataForm = this.CustData;
			this.oModel = this.oModel_SRNew;
			var serviceData = "/FormDataLoad(formid='" + oDataForm.formid + "')";
			this.oModel.update(serviceData, oForm,  
			{
		       success : function(oData, oResponse) {
		           that.update_success(that);
		           that.oFinanceData = oForm;
		       },
		       error : function(oError) {
		       	var statusCode = oError.response.statusCode;
		       	if (statusCode === 504)
		       	{
		       		that.oFinanceData = oForm;
		       		that.update_success(that);
		       	}else{
		       		that.update_failed(that);
		       	}
		          
		       }
		    }
			);
		},

		onExit: function() {
			if (this._oTooltipPopover) {
				this._oTooltipPopover.destroy();
			}
		},

		_getLanguage: function(oEvent){
			var sLocalLan = this.getResourceBundle().sLocale;
			if(sLocalLan === "iw"){
				return "HE";
			}else if (sLocalLan === "en"){
				return "EN";
			}else{
				return "EN";
			}
		},

		getResultServiceName: function(serviceName,dirName,date,coid) {
				var sServiceVal = serviceName + "?$filter=dirname eq '" + dirName + "' and recdate eq '" + date + "' and coid eq " + coid;
				return sServiceVal;
		},

		_getTooltips: function() {
			var that = this;
			this.oModel.read("ToolTips", null, null, false, function(oData, oResponse) {
				if (oData.results.length !== 0) {
					that.arrTooltips = oData.results;
				} else {
					that.arrTooltips = null;
				}
			});
		},

		_getServiceName: function() {
			return this.getModel("ObjectView").getProperty("/serviceData/" + this.CustData.cotype);
		},

		/////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////// What If ///////////////////////////////
		_setWiControls: function(isVisible) {
			var that = this;
			var iLength = this.formControlsArr.length;
			for  (var i = 0; i < iLength; i++ ) {
				  var sId = that.getControlId(that.formControlsArr[i]);
				  var oCB = sap.ui.getCore().byId ("cb_" + sId);
				  oCB.setVisible(isVisible);
				  oCB.setSelected(false); 	
				var oComboControl = sap.ui.getCore().byId("wi_combo_" + sId );
				var oValueControl = sap.ui.getCore().byId("wi_val_" + sId );
				var oActualControl = sap.ui.getCore().byId("wi_result_" + sId );
				var oControllers = [oComboControl, oValueControl, oActualControl];
				if (oComboControl !== undefined) {
					for (var j = 0; j < oControllers.length; j++) {
						// set visibility
						oControllers[j].setVisible(false);
					}
					
					//set combo selection
					oComboControl.setSelectedKey("f");
					//clear field
					oValueControl.setValue("");
					oActualControl.setValue("");
				}
			}
		},
		
		_setWhatIfState: function(isWhatIf) {
			if (isWhatIf === false) {
				this.getModel("ObjectView").setProperty("/isUpdate", false);
				this.byId("btn_wi").setText(this.getResourceBundle().getText("what_if_Cancle"));
			} else {
				this.byId("btn_wi").setText(this.getResourceBundle().getText("what_if"));
				this.getModel("ObjectView").setProperty("/isUpdate", true);
			}
		
			this.getModel("ObjectView").setProperty("/isWhatif", !isWhatIf);
			this._setWiControls(!isWhatIf);
		},

		onWhatIf: function(oEvent) {
			var isWhatIf = this.getModel("ObjectView").getProperty("/isWhatif");
			this._setWhatIfState(isWhatIf);
		},

		_getWiControls: function(oEvent) {
			var sCurrentVal = "";
			var oControlId = oEvent.getSource().getId();
			if (oControlId.indexOf("combo") !== -1) {
				sCurrentVal = "combo";
			} else {
				sCurrentVal = "val";
			}
			var oControls = {
				input: {
					name: "val"
				},
				actual: {
					name: "actual"
				},
				result: {
					name: "result"
				},
				combo: {
					name: "combo"
				}
			};

			/// get id 
			oControls.combo.id = oControlId.replace(sCurrentVal, oControls.combo.name);
			oControls.input.id = oControlId.replace(sCurrentVal, oControls.input.name);
			oControls.result.id = oControlId.replace(sCurrentVal, oControls.result.name);
			oControls.actual.id = oControlId.replace("wi_" + sCurrentVal, oControls.actual.name);

			/// get control and values
			for (var key in oControls) {
				oControls[key].control = sap.ui.getCore().byId(oControls[key].id);
				oControls[key].value = externalFunctions.getControlValue(oControls[key].control);
				
			}
			return oControls;
		},
		_calculateWiValue: function(oEvent) {
			var val = "";
			var oControls = this._getWiControls(oEvent);
			this.getModel("ObjectView").setProperty("/enableUpdate", true);
			var iInputVal = parseInt(oControls.input.value);
			var iActualVal = parseInt(oControls.actual.value);
			if (!isNaN(iInputVal)) {
				if (oControls.combo.value === "p") {
					val = (iActualVal) * (1 + (iInputVal / 100));
				} else {
					val = iActualVal + iInputVal;
				}
			}
			oControls.result.control.setValue(val);
		}
		////////////////////////////End of What if functionality///////////////////////
		///////////////////////////////////////////////////////////////////////////////





	});
});