/*global location*/
sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sr/model/formatter",
	"sr/util/externalFunctions"
], function(BaseController, JSONModel, History, formatter, externalFunctions) {
	"use strict";
	return BaseController.extend("sr.controller.Object", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			this.oBusyIndicatorSave = new sap.m.BusyDialog({
			title: this.getResourceBundle().getText("upload_process")
			});
			this.oModelComp = {
				AM_BEST: {
					1: "A++",
					2: "A+",
					3: "A",
					4: "A-",
					5: "B++ ",
					6: "B+",
					7: "B ",
					8: "B-",
					9: "C++",
					10: "C+",
					11: "C",
					12: "C-",
					13: "D",
					14: "E",
					15: "F",
					16: "Below B"
				},
				STANDARD: {
					1: "AAA",
					2: "AA+",
					3: "AA",
					4: "AA-",
					5: "A+",
					6: "A",
					7: "A-",
					8: "BBB+",
					9: "BBB",
					10: "BBB-",
					11: "BB+",
					12: "BB",
					13: "BB-",
					14: "B+",
					15: "B",
					16: "Below B"
				},
				MOODY: {
					1: "Aaa",
					2: "Aa1",
					3: "Aa2",
					4: "Aa3",
					5: "A1",
					6: "A2",
					7: "A3",
					8: "Baa1",
					9: "Baa2",
					10: "Baa3",
					11: "Ba1",
					12: "Ba2",
					13: "Ba3",
					14: "B1",
					15: "B2",
					16: "Below B"
				}
			};
			this.oBusyIndicator = new sap.m.BusyDialog({
				title: "Uploading in process"
			});
			this._actionSheet = {};
			this._oResourceBundle = this.getResourceBundle();

			this.getRouter().getTargets().getTarget("object").attachDisplay(null, this._onDisplay, this);
			this._oViewModel = new JSONModel({
				resultScale: this.oModelComp.STANDARD,
				isHeaderVisible: true,
				bars: {
					form: {
						visible: true
					},
					result: {
						visible: false
					},
					qqcalc: {
						visible: false,
						enabled: false
					}
				},
				roles: {
					admin: false
				},
				isUpdate: false,
				enableUpdate: false,
				enableCreate: false,
				enableEdit: true,
				enableUpload: false,
				isWhatif: false,
				isWhatifEnabled: false,
				isUserEdit: true,
				serviceData: {
					mfr: "Findata",
					bank: "FindataBank"
				},
				list: null
			});
			this.setModel(this._oViewModel, "ObjectView");

			var vservice = "/HANADB/SR_Services/SR_Data.xsodata/";
			this.oModel_SRData = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
			this.oModel_SRNew = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("Object", "ObjectEvent", this._handleObjectEvents, this);

		},
		_handleObjectEvents: function() {
		this.populateFinData();
	
		this._setDefaultFormState();
		// var oGeneralForm = this.getModel("appView").getProperty("/selectedfinForm");
		// this.oPresentFin(oGeneralForm);

			this.onCreateRating();
			// create qqCalc
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "create");
		},
		
		onPressHide: function(oEvent) {
			var oBtn = oEvent.getSource();
			var oSplitApp = this.byId("SplitContDemo");
			var mode = oSplitApp.getMode();
			if (mode === "ShowHideMode") {

				oBtn.setIcon("sap-icon://open-command-field");
				oBtn.setText(this._oResourceBundle.getText("show_panel"));
				oSplitApp.setMode(sap.m.SplitAppMode.HideMode);
			} else {

				oBtn.setIcon("sap-icon://close-command-field");
				oBtn.setText(this._oResourceBundle.getText("hide_panel"));
				oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			}
		},
		onHideDetails: function(oEvent) {
			var oBtn = oEvent.getSource();
			var oControl = this.byId("iconTabBar_id");
			var isStretch = !oControl.getStretchContentHeight();
			oControl.setStretchContentHeight(!oControl.getStretchContentHeight());
			this.getModel("ObjectView").setProperty("/isHeaderVisible", !oControl.getStretchContentHeight());
			if (isStretch) {
				oBtn.setIcon("sap-icon://expand-group");
				oBtn.setText(this._oResourceBundle.getText("show_details"));
			} else {
				oBtn.setIcon("sap-icon://collapse-group");
				oBtn.setText(this._oResourceBundle.getText("hide_details"));

			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */

		onAdmin: function(oEvent) {
			this.getRouter().getTargets().display("admin");
			// this.getOwnerComponent().getTargets().display("admin");
		},
		onLogOut: function(oEvent) {
			this.getModel("appView").setProperty("/isLogin", false);
			this.getRouter().getTargets().display("worklist");
		},

		_onDisplay: function(oEvent) {
			this._removeListSelected();
			var oData = oEvent.getParameter("data");
			if (oData) {
				//	this.setUserDetails(oData.user.FIRSTNAME, oData.user.LASTNAME);
				this._oViewModel.setProperty("/roles/admin", (oData.user.ROLE === "Admin"));
				this.populateFinData();
				this._setInitialView();
			}
		},
		_setInitialView: function(oEvent) {
			this.backToHome();
		},
		setUserDetails: function(sFirstName, sLastName) {
			var hello = this._oResourceBundle.getText("welcome");
			var str = hello + " " + sFirstName + " " + sLastName;
			this.byId("HeaderUser_id").setTitle(str);
		},
		onLogin: function() {
			var oDialog = this.getModel("appView").getProperty("/dialog");
			oDialog.open();
		},
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		onPressBack: function() {
			this.getSplitContObj().to(this.createId("detail_id"));
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("citySet", {
					CityName: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);

						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.CityName,
				sObjectName = oObject.CityName;
			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		///////////////split container////////////////////
		onAfterRendering: function() {
			var oSplitCont = this.getSplitContObj(),
				ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
			// set all parent elements to 100% height, this should be done by app developer, but just in case
			if (ref && !ref._sapui5_heightFixed) {
				ref._sapui5_heightFixed = true;
				while (ref && ref !== document.documentElement) {
					var $ref = jQuery(ref);
					if ($ref.attr("data-sap-ui-root-content")) {
						// Shell as parent does this already
						break;
					}
					if (!ref.style.height) {
						ref.style.height = "100%";
					}
					ref = ref.parentNode;
				}
			}
		},
		backToHome: function(oEvent) {
			this.getSplitContObj().to(this.createId("detail_id"));
		},
		setControllerValue: function(oControl, sValue) {
			var controlType = oControl.getMetadata().getName();
			if (controlType === "sap.m.SelectList" || controlType === "sap.m.ComboBox") {
				oControl.setSelectedKey(sValue);
			} else if (controlType === "sap.m.Input" || controlType === "sap.m.TextArea") {
				oControl.setValue(sValue);
			} else {
				var val = parseInt(sValue);

				if (isNaN(val) === true) {
					val = 0;
				}
				oControl.setSelectedIndex(val);
			}
		},
		_bindFinSearchField: function(oData) {
			var oTemplate = new sap.m.SuggestionItem({
				text: "{coname}",
				key: "{coname}"
			});
			var oSearchField = this.byId("searchField_company");
			var oModel = new sap.ui.model.json.JSONModel(oData);
			oSearchField.setModel(oModel);
			oSearchField.bindAggregation("suggestionItems", "/", oTemplate);
		},
		populateFinData: function() {
			var that = this;
			var oUser = that.getModel("appView").getProperty("/user");
			var sServiceVal = "Findatageneral?$filter=(createdby eq '" + oUser.USERID + "') or ((groupid eq '" + oUser.GROUPID_ID +
				"') and (createdby ne '" + oUser.USERID + "') and (isgrp eq '1'))";
			//	var ServiceVal = "Findatageneral?$filter=createdby eq '" + oUser.USERID + "'";
			var oData = that.getServiceData(sServiceVal, that.oModel_SRNew);
			var oBankModel = new sap.ui.model.json.JSONModel();
			oBankModel.setData(oData);
			var oDataModel = new sap.ui.model.json.JSONModel(oBankModel);
			// populate list //

			sap.ui.getCore().setModel(oDataModel, "finView");
			that._bindFinSearchField(oData);
			that.oControlIntrData = that.byId("list");
			that._oViewModel.setProperty("/list", that.oControlIntrData);
			that.oControlIntrData.setModel(sap.ui.getCore().getModel("finView").getData());
			that.oControlIntrData.bindItems({
				path: "/",
				template: new sap.m.ObjectListItem({
					type: "Active",
					press: function(oEvent) {
						that.onSelectFin(oEvent);
					},
					title: {
						parts: ["coname"]
					},
					intro: {
						parts: ["type"],
						formatter: formatter.typeFormatter
					},
					icon: "sap-icon://company-view",
					attributes: [
						new sap.m.ObjectAttribute({
							text: "{stmtdate}"
						})

					],
					firstStatus: new sap.m.ObjectStatus({
						text: {
							parts: ["sr_rating", "sr_rating_offset"],
							formatter: formatter.totalRatingFormatter
						}
					}),
					SecondStatus: new sap.m.ObjectStatus({
						text: "65%"
					})
				})
			});

			this.byId("iconTabBar_id").setSelectedKey("form");

			this.byId("formFilterTab").setSelectedKey("private");
			this.setListFilter("0", "isgrp");
		},

		getServiceMetadata: function(sServiceName, oModel) {
			var entityArr = [];
			var entityTypes = oModel.getServiceMetadata().dataServices.schema[0].entityType;
			entityTypes.forEach(function(entity) {
				if (entity.name === sServiceName + "Type") {
					entityArr = entity.property;
				}
			});
			return entityArr;
		},
		LoadFinMetadata: function(finArrControlArr) {
			for (var i = 0; i < finArrControlArr.length; i++) {
				var oControl = finArrControlArr[i];
				var oTemplate = new sap.ui.core.CustomData({
					key: "Edm.Decimal",
					value: "Edm.Decimal"
				});
				oControl.addCustomData(oTemplate);
			}
		},
		LoadGeneralMetadata: function() {
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

		_initControl: function(id) {
			var oControl = sap.ui.getCore().byId(id);
			if (oControl !== undefined) {
				oControl.destroy();
			}
		},

		_populateGeneralFinData: function(oEvent) {
			// this.byId("finDataHeader").setTitle(this.CustData.coid);
			// this.byId("stmtdate_att_id").setText(this.CustData.stmtdate);
			//	this.byId("assurance_att_id").setText(this.CustData.assurance);
			//	this.byId("description_att_id").setText(this.CustData.description);
			//	this.byId("cosic_att_id").setText(this.CustData.cosic);
		},
		/////////////////////////////////////////////////////////////////////////
		///////////////////////Master functions//////////////////////////////////

		_getSelectedForm: function(oEvent) {
			var oFormData = null;
			var oItem = oEvent.getSource().getBindingContext();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			// var sPath = oEvent.getParameters("selectedItem").selectedItem.getBindingContext().getPath();
			oFormData = oItem.getProperty(sPath);
			this.getModel("appView").setProperty("/selectedfinForm", oFormData);

			return oFormData;
		},
		_isUserEdit: function() {
			var sUserId = this.getModel("appView").getProperty("/user").USERID;
			var sCreatedBy = this.CustData.createdby;
			return (sUserId === sCreatedBy);
		},
		_setDefaultFormState: function() {
			this.getModel("ObjectView").setProperty("/enableUpdate", false);
			this.getModel("ObjectView").setProperty("/enableCreate", false);
			this.getModel("ObjectView").setProperty("/enableEdit", true);
		},
		handleConfirmMessageBoxPress: function(oGeneralForm) {
			var that = this;
			that.oGeneralForm = oGeneralForm;
			sap.m.MessageBox.confirm(
				"Changes have been made \n Do you want to leave page without saving?", {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: "Save Changes?",
					initialFocus: "Leave without saving changes",
					actions: ["Leave without saving changes", "Stay on page"],
					onClose: function(sAction) {
						if (sAction !== "Stay on page") {
							that.byId("formView_id").getController()._setDefaultValues();
							that.byId("qqcalc_id").getController()._setDefaultValues();
							that.oPresentFin(that.oGeneralForm);
						}
					}
				}
			);
		},

		oPresentFin: function(oForm) {
			this.byId("iconTabBar_id").setSelectedKey("form");
			this.setStatebyKey("form");
			this.CustData = oForm;
			this.getModel("appView").setProperty("/selectedfinForm", this.CustData);
			this._setDefaultFormState();
			// create Form
			this._populateGeneralFinData();
			this.getModel("ObjectView").setProperty("/isUserEdit", this._isUserEdit());

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("Form", "FormEvent", "presentFin");
			this.getSplitContObj().toDetail(this.createId("detail_form"));
			this.onCreateRating();

			// create qqCalc
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "create");
		},
		_removeListSelected:function(){
			var that = this;
			if (that._prevSelect) {
				that._prevSelect.$().removeClass("selecdteditem");
			}
		},
		setListSelected: function(oEvent){
			var that = this;

			this._removeListSelected();
			//	var item = oEvent.getParameter("listItem");
			var item = oEvent.getSource();
			item.$().addClass("selecdteditem");
			that._prevSelect = item;
		},
		onSelectFin: function(oEvent) {
			var that = this;
			var oGeneralForm = that._getSelectedForm(oEvent);
			that.setListSelected(oEvent);
			if ((this.byId("formView_id").getController().isModelChange() === true) || (this.byId("qqcalc_id").getController().isModelChange() ===
					true)) {
				this.handleConfirmMessageBoxPress(oGeneralForm);
			} else {
				that.oPresentFin(oGeneralForm);
			}
		},
		_getCustData: function() {
			var oFormData = {
				approvaldate: "",
				certifier: "",
				changedby: "",
				coid: "",
				coname: "",
				createdat: "",
				createdby: "",
				currency: "0",
				formid: "",
				groupid: "",
				isgrp: "0",
				sicode: "",
				sourceid: "",
				sr_rating: "",
				sr_rating_offset: "",
				status: "",
				stmtdate: "",
				type: "",
				assurance: "0",
				scale: "0",
				description: ""
			};

			return oFormData;
		},
		onDialogCreateOk: function() {
			var sType = sap.ui.getCore().byId("cb_create_industry").getSelectedKey();
			this.CustData = this._getCustData();
			this.CustData.type = sType;
			this.getModel("appView").setProperty("/selectedfinForm", this.CustData);
			this.getModel("ObjectView").setProperty("/enableCreate", true);
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("Form", "FormEvent", "addFin");

			this.getSplitContObj().toDetail(this.createId("detail_form"));
			// // create qqCalc
			oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "create");
			var oDialog = this._getDialog("createDialog", "sr.view.dialog.createDialog", 0.3, 0.3);
			oDialog.close();
		},
		onCreateFin: function() {
			var that = this;
			var oDialog = this._getDialog("createDialog", "sr.view.dialog.createDialog", 0.3, 0.3);
			oDialog.open();
		},
		_filterList: function(arrFilters) {
			var oList = this.byId("list");
			var oListBinding = oList.getBinding("items");
			if (oListBinding !== undefined) {
				oList.getBinding("items").filter(arrFilters);
			}
		},
		onSearch: function(oEvent) {
			var sCompValue = oEvent.getSource().getProperty("value");
			if (sCompValue === "") {
				this._setSearchFieldFilter(sCompValue);
			}
		},
		_setSearchFieldFilter: function(sfValue) {
			var that = this;
			var filters = [];
			var sGrpValue = this._getGroupValue(this.byId("formFilterTab").getSelectedKey());
			var arrFilters = [{
				value: sfValue,
				fieldName: "coname"
			}, {
				value: sGrpValue,
				fieldName: "isgrp"
			}];
			filters = that._getFinFilters(arrFilters);
			that._filterList(filters);
		},
		onSuggestFin: function(oEvent) {
			var that = this;
			var oSearchField = this.byId("searchField_company");
			var sCompValue = oEvent.getParameter("suggestValue");
			this._setSearchFieldFilter(sCompValue);

			var oBinding = oSearchField.getBinding("suggestionItems");
			if (oBinding !== undefined) {
				// oSearchField.getBinding("suggestionItems").filter(filters);
				//		oSearchField.suggest();
			}
		},

		_getFinFilters: function(arrFilter) {
			var filters = [];
			var oFilter = null;
			for (var i = 0; i < arrFilter.length; i++) {
				var value = arrFilter[i].value;
				var fieldName = arrFilter[i].fieldName;
				oFilter = new sap.ui.model.Filter(fieldName, sap.ui.model.FilterOperator.Contains, value);
				filters.push(oFilter);
			}
			var oFilters = [new sap.ui.model.Filter(filters, true)];
			return oFilters;
		},

		setListFilter: function(sValue, sField) {
			var that = this;
			var arrFilters = [{
				value: sValue,
				fieldName: "isgrp"
			}];
			var filters = that._getFinFilters(arrFilters);
			that._filterList(filters);
		},
		_getGroupValue: function(sSelectedKey) {
			var sValue = "0";
			if (sSelectedKey === "group") {
				sValue = "1";
			}
			return sValue;
		},
		onGroupFilter: function(oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var sValue = this._getGroupValue(sSelectedKey);
			var sField = "isgrp";
			this.setListFilter(sValue, sField);
		},

		onPressNavToDetail: function(oEvent) {
			this.getSplitContObj().to(this.createId("detail_form"));
		},
		onSubmitInfo: function(oEvent) {
			this.getSplitContObj().to(this.createId("detail_result"));
		},
		onPressDetailBack: function() {
			this.getSplitContObj().backDetail();
		},
		onPressMasterBack: function() {
			this.getSplitContObj().backMaster();
		},
		onPressGoToMaster: function() {
			this.getSplitContObj().toMaster(this.createId("master2"));
		},
		onListItemPress: function(oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.getSplitContObj().toDetail(this.createId(sToPageId));
		},
		onPressModeBtn: function(oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();
			this.getSplitContObj().setMode(sSplitAppMode); //	MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, {duration: 5000});
		},
		getSplitContObj: function() {
			var result = this.byId("SplitContDemo");
			if (!result) {
				jQuery.sap.log.error("SplitApp object can't be found");
			}
			return result;
		},
		backToForm: function() {
			this.getSplitContObj().to(this.createId("detail_form"));
		},
		///////////////////split container///////////////

		/**
		 *@memberOf sr.controller.Object
		 */
		onHomePage: function() {
			this.getRouter().getTargets().display("worklist");
		},
		handlePopoverLangPress: function(oEvent) {
			externalFunctions.handlePopoverLang(oEvent, this);
		},
		onSelectLanguage: function(oEvent) {
			externalFunctions.selectLanguage(oEvent, this);
			var oFormData = this.getModel("appView").getProperty("/selectedfinForm");
			var formId = oFormData.formid;
			this.byId("formView_id").getController()._populateFinForm(formId);
			this.onCreateRating();
		},
		/**
		 *@memberOf sr.controller.Object
		 */

		setControlEnabled: function(oControlArr, state) {

			// general
			for (var obj in this.CustData) {
				var oControl = this.byId(obj + "_id");
				if (oControl !== undefined) {
					oControl.setEnabled(state);
				}
			}

			// 	this.byId("currency_id").setEnabled(state);
			// 	//this.byId("coscale_id").setEnabled(state);
			// 	this.byId("coname_id").setEnabled(state);
			// //	this.byId("description_id").setEnabled(state);
			// 	this.byId("stmtdate_id").setEnabled(state);
			// //	this.byId("assurance_id").setEnabled(state);
			// 	this.byId("sicode_id").setEnabled(state);
			// 	this.byId("isgrp_id").setEnabled(state);

			//form
			for (var i = 0; i < oControlArr.length; i++) {
				oControlArr[i].setEnabled(state);
			}
		},

		setBtnEditState: function(isEdit) {
			this.setControlEnabled(this.formControlsArr, isEdit === true);
			this._oViewModel.setProperty("/enableEdit", !isEdit);
		},

		onEdit: function(oEvent) {
			this.byId("formView_id").getController().setBtnEditState(this._oViewModel.getProperty("/enableEdit"));
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
			sControlId = sControlId.substring("actual_".length, sControlId.length);
			return sControlId;
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
		getResDesc: function(sCoType) {
			var descArr = [];
			if (sCoType === "bank") {
				descArr = ["Interest Income/Earning Assets", "Net Interest Income/Earning Assets", "Allowance for Loan Losses/Total Loans",
					"Allowance for Loan Losses/Total Assets", "Allowance For Loan Losses/Total Capital", "Earning Assets/Total Assets",
					"Total Loans/Total Assets", "Equity/Total Assets"
				];
			} else {
				descArr = ["Operating Profit Margin", "Pre-tax Margin", "Net Margin", "Operating Profit/Total Assets",
					"Pre-tax Profit/Total Assets", "Net Profit/Total Assets", "Quick Ratio", "Current Ratio", "Long-Term Debt/Shareholder Equity",
					"Total Liabilities/Shareholder Equity", "Shareholder Equity/Total Assets", "Cash Flow/Revenues"
				];
			}
			return descArr;
		},

		iconClassColorFormatter: function(sRating, sRatingOffsets, sRatingCurrValue) {
			var sCssClass = "";
			if (sRating === sRatingCurrValue) {
				var ratingArr = ["", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
				var iRating = parseInt(sRating);
				var sRatingValue = ratingArr[iRating];
				sCssClass = "icon" + sRatingValue;
			}
			return sCssClass;
		},

		iconClassFormatter: function(sRating, sRatingOffsets, sRatingCurrValue) {
			var sCssClass = "panelNoPadding";
			if (sRating === sRatingCurrValue) {
				// var ratingArr = ["", "AAA", "AA", "A", "BBB", "BB", "B", "Below B"];
				// var iRating = parseInt(sRating);
				// var sRatingValue = ratingArr[iRating];
				// sCssClass = "icon" + sRatingValue;
				var iOffset = parseInt(sRatingOffsets);
				if (!isNaN(iOffset)) {
					if (iOffset > 0) {
						sCssClass = sCssClass + " iconMinus";
					} else if (iOffset < 0) {
						sCssClass = sCssClass + " iconPlus";
					} else {
						sCssClass = sCssClass + " iconMiddle";
					}
				}

			}
			return sCssClass;
		},

		onSaveCustData: function() {
			var isUpdate = this._oViewModel.getProperty("/isUpdate");
			if (isUpdate) {
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("Form", "FormEvent", "updateFin");
			} else {
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("Form", "FormEvent", "createFin");
			}
		},

		onExit: function() {
			if (this._oTooltipPopover) {
				this._oTooltipPopover.destroy();
			}
		},

		handleTooltipPopover: function(oControl, oModel) {
			// create popover
			if (!this._oTooltipPopover) {
				this._oTooltipPopover = sap.ui.xmlfragment("sr.view.popover.tooltipPopover", this);
				var width = jQuery(window).height() * 0.6 + "px";
				this._oTooltipPopover.setContentWidth(width);
				this.getView().addDependent(this._oTooltipPopover);
			}
			this._oTooltipPopover.setModel(oModel);
			this._oTooltipPopover.bindElement("/");

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			jQuery.sap.delayedCall(0, this, function() {
				this._oTooltipPopover.openBy(oControl);
			});
		},
		_getLanguage: function(oEvent) {
			var sLocalLan = this.getResourceBundle().sLocale;
			if (sLocalLan === "iw") {
				return "HE";
			} else if (sLocalLan === "en") {
				return "EN";
			} else {
				return "EN";
			}
		},
		onPressResultRow: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var iIndex = parseInt(sPath.substring(sPath.length - 1, sPath.length));
			var val = this.arrTooltips[iIndex];
			var oTooltipModel = new sap.ui.model.json.JSONModel(val);
			this.handleTooltipPopover(oEvent.getParameter("listItem"), oTooltipModel);

		},
		onSelectScale: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			this._setResultScale(key);
		},
		_setResultScale: function(sType) {
			this._oViewModel.setProperty("/resultScale", this.oModelComp[sType]);
		},
		_populateResultTable: function(ResultData) {
			var that = this;
			var oControl = this.byId("table_results");
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
							formatter: formatter.totalRatingFormatter
						},
						wrapping: false
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "AAA"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "AAA"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})

						]
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "AA"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "AA"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})
						]
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "A"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "A"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})

						]
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "BBB"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "BBB"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})
						]
					}),
					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "BB"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "BB"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})
						]
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "B"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "B"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})
						]
					}),

					new sap.m.Panel({
						content: [
							new sap.ui.core.Icon({
								src: {
									parts: ["rating", "Below"],
									formatter: formatter.ratingFormatter
								},
								decorative: {
									parts: ["rating", "ratingOffsets", "Below"],
									formatter: function(a, b, c) {
										var sCssClass = that.iconClassFormatter(a, b, c);
										var sCssClassColor = that.iconClassColorFormatter(a, b, c);
										this.addStyleClass(sCssClassColor);
										this.getParent().addStyleClass(sCssClass);
										return true;
									}
								}
							})
						]
					})
				]
			});

			var oMainObject = {};
			oMainObject.data = ResultData;
			var ocustResModel = new sap.ui.model.json.JSONModel();
			ocustResModel.setData(oMainObject);
			var oCustModel = new sap.ui.model.json.JSONModel(ocustResModel);

			sap.ui.getCore().setModel(oCustModel, "CustView");
			oControl.setModel(sap.ui.getCore().getModel("CustView").getData());

			oControl.bindItems({
				path: "/data",
				template: oTemplate
			});

		},

		isFinDataResult: function(obj) {
			var flag = true;
			if (obj["_1"] === null) {
				flag = false;
			} else {
				flag = true;
			}
			return flag;
		},

		getResultServiceName: function(serviceName, dirName, date, coid) {
			var sServiceVal = serviceName + "?$filter=dirname eq '" + dirName + "' and recdate eq '" + date + "' and coid eq " + coid;
			return sServiceVal;
		},
		getResultData: function() {
			var that = this;
			var ResultData = [];
			var oModel = this.oModel_SRNew;
			this.CustData = this.getModel("appView").getProperty("/selectedfinForm");
			var sFormId = this.CustData.formid;
			// var sFormId = "155";
			var sQuery = "FinResults?$filter=formid eq '" + sFormId + "'";
		//	var sQuery = "FinResults(FormsID='" + sFormId + "')/Results";
			var oResultData = this.getServiceData(sQuery, oModel);
			oResultData = oResultData[0];
			// var ratioArr = this.getServiceData(this.getResultServiceName("Ratios", dirName, date, coid), oModel)[0];
			// if (ratioArr !== undefined) {
			// 	var IsRateArr = this.getServiceData(this.getResultServiceName("IsRate", dirName, date, coid), oModel)[0];
			// 	var RatingsArr = this.getServiceData(this.getResultServiceName("Ratings", dirName, date, coid), oModel)[0];
			// 	var RatingsOffsets = this.getServiceData(this.getResultServiceName("RatingsOffsets", dirName, date, coid), oModel)[0];
			// 	var ResDesc = this.getResDesc(this.CustData.cotype);
			if (oResultData !== undefined) {
				if (oResultData["Rate_00"] !== null) {
					that.getModel("appView").setProperty("/isResultRating", true);
					var sOverallRating = formatter.totalRatingFormatter(oResultData["Rate_00"], oResultData["Offs_00"]);
					this.byId("total_rating").setText(sOverallRating);
					// if (this.isFinDataResult(IsRateArr) === true) {
					var j = 1;
					for (var i in that.arrTooltips) {
						var index = j;
						if (j.toString().length === 1) {
							index = "0" + j;
						}
						var obj = {};
						obj.desc = that.arrTooltips[j - 1].Name;
						obj.ratio = oResultData["Ratio_" + index];
						//obj.isRate = IsRateArr["_" + index];
						obj.rating = oResultData["Rate_" + index];
						obj.ratingOffsets = oResultData["Offs_" + index];
						obj.AAA = "1";
						obj.AA = "2";
						obj.A = "3";
						obj.BBB = "4";
						obj.BB = "5";
						obj.B = "6";
						obj.Below = "7";
						ResultData.push(obj);
						j = j + 1;
					}
				}
			} else {
				that.getModel("appView").setProperty("/isResultRating", false);
			}
			return ResultData;
		},
		onCreateRating: function() {
			var that = this;
			var oModel = this.oModel_SRNew;
			//ReportTooltip
			var sLang = this._getLanguage();
			
			var sQuery = "ReportTooltip?$filter=Langauge eq '" + sLang + "'";
			that.arrTooltips = this.getServiceData(sQuery, oModel);
			var ResultData = this.getResultData();
			that.getModel("appView").setProperty("/resultData", ResultData);
			if (ResultData.length !== 0) {
				this._populateResultTable(ResultData);
				//	this._getTooltips();
				this.byId("text_noResults").setVisible(false);
				this.byId("table_results").setVisible(true);
			} else {
				this.byId("text_noResults").setVisible(true);
				this.byId("table_results").setVisible(false);
			}
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
		onPressImport: function() {
			// this.handlePdf();
			var oDialog = sap.ui.getCore().byId("oDialog_import");
			oDialog.open();
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
		getPdfDataObj: function(){
		var date = new Date();
		var sFormattedDate = formatter.dateFormatterIso(date);
		var oGeneralData = this.getModel("appView").getProperty("/selectedfinForm");
		var resultData = this.getResultDataToPDF();
		var oFinForm = this.getModel("appView").getProperty("/selectedFormValues");
		var oResultData = this.getModel("appView").getProperty("/resultData");
		var indRating = {
			 "finalScore": oResultData[0].rating,
    		 "finalScoreText": formatter.totalRatingFormatter(oResultData[0].rating,oResultData[0].ratingOffsets)  
		};
		
		
		var oData = {};
		oData.coname = oGeneralData.coname;
		oData.date = sFormattedDate;
		oData.stmtdate =  oGeneralData.stmtdate;
		oData.desc =  oGeneralData.description;
		oData.sic =  oGeneralData.sicode;
		oData.items = oFinForm;
		oData.ratingItems = resultData;
		oData.indRating = indRating;
		return oData;
		},
	
	
		sendPdf:function(oData){
			var sFileName = oData.coname + " Indicative Rating Report.pdf";
			var sServiceName =  "/JSPDF"; 
			//	jsreport.serverUrl = sServiceName;
			jsreport.serverUrl = "https://sr.jsreportonline.net/";
			jsreport.headers['Authorization'] = "Basic " +  btoa("dana17@iprosis.com:iprosis");
			var request = {"template":{"name":"rating"},"data":oData,"options": { timeout: 60000 },"Content-Disposition": {"Content-Disposition": "attachment; filename=" + sFileName}};
		
			//display report in the new tab
			// jsreport.render('_blank', request);
			jsreport.download(sFileName, request);
		},
		handlePdf:function(){
		var oData = this.getPdfDataObj();
		this.sendPdf(oData);

// jQuery.ajax({
//   url : sServiceName,
//   type: 'POST',
//   data: {"template":{"name ":"rating"},"data":oData,"options": { timeout: 60000 },"Content-Disposition": {"Content-Disposition": "attachment; filename=myreport.pdf"}},
//   beforeSend: function(xhr){xhr.setRequestHeader('Content-Type', 'application/json');},
//   success: function (data) {
//         var x = data;
//   },
//   error: function () {
       
//   }
// });

// var xhr = new XMLHttpRequest();
// xhr.open("POST", "https://dana.jsreportonline.net/api/report");
// xhr.setRequestHeader("Authorization", "Basic " + btoa("danaturjeman@iprosis.com:iProsis1"));
// xhr.setRequestHeader('Content-type', 'application/json');
// xhr.responseType = 'arraybuffer';
// xhr.onload = function(e) {
// 	 if (this.status === 200) {
//         var blob = new Blob([xhr.response], {type: "application/pdf"});
//         var objectUrl = URL.createObjectURL(blob);
//         window.open(objectUrl);
//     }
//     // if (this.status == 200) {
//     //     window.open("data:application/pdf;base64," + window.btoa(String.fromCharCode.apply(null, new Uint8Array(xhr.response))));
//     // }
// };
// xhr.send(JSON.stringify(
// {"template":{"name":"rating"},"data":oData,"options": { timeout: 60000 },"Content-Disposition": {"Content-Disposition": "attachment; filename=myreport.pdf"}
// }
// ));




},
		
handlePdf3:function(){
        	// var doc = new jsPDF("p", "pt", "a4",true); // portrait

                var pdf = new jsPDF("p", "pt", "a4");

                var pdfName = "sample.pdf";

                var options = {
                    format: "JPEG",
//                    pagesplit: true,
                    "background": "#ffffff"
                };

                var fullPage = $("#__component0---object--table_results-listUl")[0],
                    firstPartPage = $("#__component0---object--table_results-listUl")[0],
                    secondPartPage = $("#__component0---object--finDataHeader")[0];

                pdf.addHTML(firstPartPage, 0, 0, options, function(){ pdf.addPage(); });
                pdf.addHTML(secondPartPage, 0, 0, options, function(){ pdf.save(pdfName);});
               
          //   doc.addHTML($("#__component0---object--table_results-listUl").get(0),function() {
          //        //doc.save("form.pdf");
          //        doc.addPage();
          //          doc.addHTML($("#__component0---object--finDataHeader").get(0),function() {
          //        doc.save("form.pdf");
              
        	   	
        	 //  });
          //    });
        	 //doc.addPage();
        	 //  doc.addHTML($("#__component0---object--finDataHeader").get(0),function() {
          //        //doc.save("form.pdf");
              
        	   	
        	 //  });
              //doc.fromHTML($("#__component0---object--table_results-listUl").html(),
              //             60,
              //             60,
              //             {
              //       "width": 750
              //       //‘elementHandlers’: specialElementHandlers
              //}
              //);
         
             //    doc.save("form.pdf");
                
       },
		handlePdf2: function() {
			var oTable = this.byId("table_results");
			var tabledata = oTable.getModel().getData();
			this.JSONToPDFConvertor(tabledata);
		},

		JSONToPDFConvertor: function(JSONData) {
			//	var arrData = typeof JSONData !== "object" ? JSON.parse(JSONData) : JSONData;
			var arrData = JSONData.data;
			var columns = [];
			for (var index in arrData[0]) {
				//Now convert each value to string and comma-seprated
				columns.push(index);
			}
			var rows = [];
			//console.log(arrData);
			for (var i = 0; i < arrData.length; i++) {
				rows[i] = [];
				for (var j = 0; j < arrData.length;) {
					for (var index in arrData[0]) {
						rows[i][j] = arrData[i][index];
						j++;
					}
				}
			}

			// Page 1
			var doc = new jsPDF("p", "in", "a4"); // portrait
			var imgLogo = new Image();
			// imgLogo.src = "css/pics/srLogo.png";
			imgLogo.src = "css/pics/introtest.PNG";
			//		doc.addImage(imgLogo, "png", 0, 0);

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
			text2 =
				"Ratio analysis, a long - standing practice that has its origins in the late 1800’ s, uses financial data from businesses to provide a basis for comparison.Every" +
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

			//page 3
			doc.addPage();
			doc.autoTable(columns, rows);

			doc.save('Indicative Report Results.pdf');
		},

		handlePressOpenMenu: function(oEvent) {
			var oButton = oEvent.getSource();
			// create menu only once
			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(
					"sr.view.menuTabs.Menu1Eventing",
					this
				);
				this.getView().addDependent(this._menu);
			}
			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		handleMenuItemPress: function(oEvent) {
			var id = oEvent.getParameter("item").getId();
			if (id === "log") {
				this.onLogOut();
			} else if (id === "home") {
				this.onHomePage();
			}
			//TODO navigate menu
		},

		///////////////////////////External Sources/////////////////////////
		////////////////////////////////////////////////////////////////////

		setExternalDialogDefaultView: function() {
			var oCbIsGrp = sap.ui.getCore().byId("ext_permit_id");
			var oCbModel = sap.ui.getCore().byId("ext_industry_id");
			oCbIsGrp.setSelectedKey("item_form0");
			oCbModel.setSelectedKey("item_inds1");
			var oSearchField = sap.ui.getCore().byId("sf_id");
			oSearchField.setValue("");
		},
		onImportExternal: function() {
			var oDialog = this._getDialog("externalDialog", "sr.view.dialog.externalDialog", 0.6, 0.6);
			var contentWidth = jQuery(window).height() * 0.6 + "px";
			var contentHeight = jQuery(window).height() * 0.4 + "px";
			oDialog.setContentWidth(contentWidth);
			oDialog.setContentHeight(contentHeight);
			oDialog.open();
		},
		_getFilters: function(value, displayKey) {
			// OS001 key
			// OS01W text
			var filters = [];
			var oFilterText = new sap.ui.model.Filter("OS01W", function(sText) {
				return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
			});
			var oFilterDesc = new sap.ui.model.Filter("OS001", function(sDes) {
				return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
			});

			if (displayKey === true) {
				filters = [new sap.ui.model.Filter([oFilterText, oFilterDesc], false)];
			} else {
				filters = [new sap.ui.model.Filter([oFilterText], false)];
			}

			return filters;
		},
		onSuggestCompany: function(oEvent) {
			var that = this;
			var oSearchField = sap.ui.getCore().byId("sf_id");
			var value = oEvent.getParameter("suggestValue");
			var filters = [];
			if (value !== "") {
				filters = that._getFilters(value, true);
			} else {
				filters = that._getFilters("999999iprosis", true);
				var oBtn = sap.ui.getCore().byId("btn_external");
				oBtn.setEnabled(false);
			}
			var oBinding = oSearchField.getBinding("suggestionItems");
			if (oBinding !== undefined) {
				oSearchField.getBinding("suggestionItems").filter(filters);
				oSearchField.suggest();
			}
		},

		_bindCompanyData: function(result) {
			var oTemplate = new sap.m.SuggestionItem({
				text: "{OS01W}",
				key: "{OS001}",
				description: "{OS001}"
			});
			var oSearchField = sap.ui.getCore().byId("sf_id");
			var oModel = new sap.ui.model.json.JSONModel(result);
			oSearchField.setModel(oModel);
			oSearchField.bindAggregation("suggestionItems", "/", oTemplate);
			// OS001 key
			// OS01W text
		},
		_getCompanyData: function(query) {
			var dataObject = null;
			var that = this;
			var oParams = {
				//		mode: "json"  // get it in JSON format 
			};
			var sUrl = "/MorningStar/" + query;

			$.get(sUrl, oParams)
				.done(function(results) {
					dataObject = results.m[0].r;
					that._bindCompanyData(dataObject);
					//			oView.setBusy(false);
					//		that._mapResults(results);
				})
				.fail(function(err) {
					if (err !== undefined) {
						var oErrorResponse = $.parseJSON(err.responseText);
						sap.m.MessageToast.show(oErrorResponse.message, {
							duration: 6000
						});
					} else {
						sap.m.MessageToast.show("Unknown error!");
					}
					dataObject = undefined;
				});
		},
		onSelectCompany: function(oEvent) {
			var that = this;
			var oBtn = sap.ui.getCore().byId("btn_external");
			var item = oEvent.getParameter("suggestionItem");
			if (item) {
				var text = item.getText();
				this.selectedCompanyKey = item.getKey();
				oBtn.setEnabled(true);
			} else {
				oBtn.setEnabled(false);
			}
		},
		onUploadExternalForm: function(oEvent) {
			// <!--user=USERNAME-->
			// <!--isgrp=1/0-->
			// <!--model=bank/nonbank-->
			var oCbIsGrp = sap.ui.getCore().byId("ext_permit_id");
			var sIsGrp = oCbIsGrp.getSelectedKey();
			sIsGrp = sIsGrp.substring(sIsGrp.length - 1, sIsGrp.length);
			var oCbModel = sap.ui.getCore().byId("ext_industry_id");
			var sModel = oCbModel.getSelectedKey();
			sModel = sModel.substring(sModel.length - 1, sModel.length);
			if (sModel === "1") {
				sModel = "bank";
			} else {
				sModel = "nonbank";
			}
			var that = this;
			that.oBusyIndicator.open();

			var sUserId = that.getModel("appView").getProperty("/user").USERID;
			var vservice = "/HANADB/SR_Services/Services/srMorningStarAPI.xsjs?comp=" + this.selectedCompanyKey + "&userid=" + sUserId +
				"&isgrp=" + sIsGrp + "&model=" + sModel;
			jQuery.ajax({
				url: vservice,
				//method: 'GET',
				//dataType: 'json',
				success: that.onSuccesUpload(that),
				error: that.onErrorUpload(that)
			});
		},
		onSuccesUpload: function(that) {
			sap.m.MessageBox.show(
				"The form was uploaded succesfully.", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Morning Star Upload",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {
						var oDialog = that._getDialog("externalDialog", "sr.view.dialog.externalDialog", 0.3, 0.5);
						oDialog.close();
					}
				});

			that.oBusyIndicator.close();
			that.populateFinData();
		},
		onErrorUpload: function(that) {
			that.oBusyIndicator.close();
			sap.m.MessageToast.show("error");
		},
		onCompanySearch: function(oEvent) {
			var query = oEvent.getSource().getProperty("value");
			if (query !== "") {
				this._getCompanyData(query);
			}
		},

		///////////////////////End of external sources///////////////////////
		/////////////////////////////////////////////////////////////////////

		////////////////////Import Event//////////////////////////////////////
		//////////////////////////////////////////////////////////////////////

		handleNav: function(oEvent) {
			var navCon = sap.ui.getCore().byId("navCon");
			var target = oEvent.getSource().data("target");
			if (target) {
				navCon.to(sap.ui.getCore().byId(target), "slide");
			} else {
				navCon.back();
			}
		},
		onDialogExternalCancle: function() {
			var oDialog = this._getDialog("externalDialog", "sr.view.dialog.externalDialog", 0.3, 0.5);
			oDialog.close();
		},
		onDialogCSVCancle: function() {
			var oDialog = this._getDialog("csvDialog", "sr.view.dialog.csvDialog", 0.3, 0.3);
			oDialog.close();
		},
		onDialogCreateCancle: function() {
			var oDialog = this._getDialog("createDialog", "sr.view.dialog.createDialog", 0.3, 0.3);
			oDialog.close();
		},
		onImportCsv: function() {

			var oDialog = this._getDialog("csvDialog", "sr.view.dialog.csvDialog", 0.3, 0.3);
			oDialog.open();
			
			var fU = sap.ui.getCore().byId("idfileUploader");
			if (fU !== undefined) {
				fU.clear();
			}
			
			 var navCon = sap.ui.getCore().byId("navCon");
			 var target = "csv_p1";
			 navCon.to(sap.ui.getCore().byId(target), "slide");
			
			
			
		},
		onTypeMissmatch: function() {
			this._oViewModel.setProperty("/enableUpload", false);
			sap.m.MessageToast.show("the file you tried to upload is not CSV, plaese try again");
		},
		onFileAllowd: function() {
			this._oViewModel.setProperty("/enableUpload", true);
		},
		// csv sample//
		convertArrayOfObjectsToCSV: function(args) {
			var result, ctr, keys, columnDelimiter, lineDelimiter, data;

			data = args.data || null;
			if (data == null || !data.length) {
				return null;
			}

			columnDelimiter = args.columnDelimiter || ',';
			lineDelimiter = args.lineDelimiter || '\n';

			keys = Object.keys(data[0]);

			result = '';
			result += keys.join(columnDelimiter);
			result += lineDelimiter;

			data.forEach(function(item) {
				ctr = 0;
				keys.forEach(function(key) {
					if (ctr > 0) result += columnDelimiter;

					result += item[key];
					ctr++;
				});
				result += lineDelimiter;
			});

			return result;
		},

		onDownloadCSV: function(args) {
			var that = this;
			var data, filename, link;
			that.oLoadData = [{
				'email address': "",
				'Company Name': "Mfr 1 Example",
				'Description': "Manufcturer",
				'Statement Date': "Annual",
				'Currency': "ils",
				'Assurance': "Audited",
				'Scale': "Actual",
				'SIC code': "8071",
				'Net Revenues': 911.7,
				'Operating Income': "180.5",
				'Pre-tax Income': "139.6",
				'Net Income': "90.9",
				'Receivables': "496.4",
				'Current Assets': "1424.1",
				'Property Plant and Equipment': "613.4",
				'Other Long-term Assets': "4027.3",
				'Total Assets': "6064.7",
				'Current Liabilities': "1253",
				'Long-term Debt': "91.6",
				'Other Long-term Liabilities': "1984.1",
				'Shareholder Equity': "1052.6",
				'Cash/Cash Equivalents at Beginning of Period': "173.5",
				'Net Cash Provided by Operations': "111.4",
				'Net Cash Used for Investment': "-16",
				'Net Cash Used for Financing': "3.5",
				'Cash/Cash Equivalents at End of Period': "280.6"
			}, {
				'email address': "",
				'Company Name': "Mfr 2 Example",
				'Description': "Manufcturer",
				'Statement Date': "Annual",
				'Currency': "ILS",
				'Assurance': "Audited",
				'Scale': "Actual",
				'SIC code': "7372",
				'Net Revenues': 40602,
				'Operating Income': "15288",
				'Pre-tax Income': "14885",
				'Net Income': "11643",
				'Receivables': "6386",
				'Current Assets': "31617",
				'Property Plant and Equipment': "22304",
				'Other Long-term Assets': "5798",
				'Total Assets': "144266",
				'Current Liabilities': "33726",
				'Long-term Debt': "19811",
				'Other Long-term Liabilities': "2645",
				'Shareholder Equity': "69214",
				'Cash/Cash Equivalents at Beginning of Period': "5947",
				'Net Cash Provided by Operations': "13958",
				'Net Cash Used for Investment': "-4107",
				'Net Cash Used for Financing': "-7279",
				'Cash/Cash Equivalents at End of Period': "8558"
			}];

			var csv = this.convertArrayOfObjectsToCSV({
				data: that.oLoadData
			});
			if (csv === null) return;

			filename = 'Example.csv';
			var hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
			hiddenElement.target = '_blank';
			hiddenElement.download = 'export.csv';
			hiddenElement.click();

		},

		onUpload: function(oEvent) {
			this.oBusyIndicatorSave.open();
			var that = this;
			this.arrFinGeneral = {
				email: "",
				coname: "",
				description: "",
				stmtdate: "",
				currency: "",
				assurance: "",
				scale: "",
				sicode: ""
			};
			this.arrFinData = {
				netrev: "",
				opeincome: "",
				pretaxincome: "",
				netincome: "",
				receivables: "",
				currassets: "",
				ppe: "",
				otherassets: "",
				totassets: "",
				currliabilities: "",
				longtermdebt: "",
				otherliabilities: "",
				shareholder: "",
				cashbegin: "",
				netcashop: "",
				netcashinvest: "",
				netcashfinanc: "",
				cashend: ""
			};
			var oArrFinData = jQuery.extend(true, {}, this.arrFinGeneral);
			Object.assign(oArrFinData, this.arrFinData);

			//var that = this;
			// var sServiceName = that._getServiceName();
			// var oMetaData = that.getServiceMetadata(sServiceName);
			var fU = sap.ui.getCore().byId("idfileUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];
			// Create a File Reader object
			var reader = new FileReader();

			reader.onload = function(oEvent) {
				var strCSV = oEvent.target.result;
				// var arrCSV = strCSV.match(/[\w .]+(?=,?)/g);
				// var noOfCols = 23;

				var arrData = strCSV.split(/\r?\n|\r/);
				var iRecNum = arrData.length - 2; // without the header and last row (empty)
				var arrHeader = arrData[0].split(",");
				var data1 = [];
				var data2 = [];
				var count = 0;

				var iGeneralLength = Object.keys(that.arrFinGeneral).length;

				for (var i = 1; i < iRecNum + 1; i++) {
					//var arrTempData = arrData[i].match(/[\w .]+(?=,?)/g);
					var arrTempData = arrData[i].split(",");
					//	var arrTempData = arrData[i].split(/\r?\n|\r/);

					data1[i - 1] = {};
					var index = 0;
					for (var key in that.arrFinGeneral) {
						var fieldName = key;
						data1[i - 1][fieldName] = arrTempData[index];
						index = index + 1;
					}
				}

				for (i = 1; i < iRecNum + 1; i++) {
					// arrTempData = arrData[i].split(/\r?\n|\r/);
					// arrTempData = arrData[i].match(/[\w .]+(?=,?)/g);
					arrTempData = arrData[i].split(",");
					data2[i - 1] = {};
					index = iGeneralLength;
					for (key in that.arrFinData) {
						fieldName = key;
						data2[i - 1][fieldName] = arrTempData[index];
						index = index + 1;
					}
				}
				that.onCSVReady(data1, data2);
			};
			reader.readAsBinaryString(file);
		},

		onCSVReady: function(oFinDataGeneral, oFinData) {
			var that = this;
			var oUser = that.getModel("appView").getProperty("/user");
			var oOdataModel = that.oModel_SRNew;
			var aBatchOper = [];
			var oRecord, sMethod, sQuery;
			for (var i = 0; i < oFinDataGeneral.length; i++) {
				oRecord = oFinDataGeneral[i];
				oRecord.formid = "1";
				oRecord.coid = "1";
				oRecord.createdby = oUser.USERID;
				oRecord.groupid = oUser.GROUPID_ID;
				oRecord.isgrp = "0";
				oRecord.type = "1";
				oRecord.sourceid = "2";

				var oScale = {
					"ACTUAL": "0",
					"THOUSANDS": "1",
					"MILLIONS": "2"
				};
				var oAssurance = {
					"NONE": "0",
					"COMPILATION": "1",
					"REVIEWED": "2",
					"AUDITED": "3"
				};
				var oCurrency = {
					"EURO": "er",
					"ILS":"ils",
					"DOLLAR":"dlr"
				};
				var sScale = oRecord.scale;
				oRecord.scale = parseInt(oScale[sScale.toUpperCase()]);
				var sAssurance = oRecord.assurance;
				oRecord.assurance = parseInt(oAssurance[sAssurance.toUpperCase()]);
			    
			    var sCurrency = oRecord.currency;
				oRecord.currency = oCurrency[sCurrency.toUpperCase()];
			    oRecord.description = "";
			    
				var prop = "email";
				delete oRecord[prop];
				sMethod = "POST";
				sQuery = "/Findatageneral";
				aBatchOper.push(oOdataModel.createBatchOperation(sQuery, sMethod, oRecord));
			}
			oOdataModel.addBatchChangeOperations(aBatchOper);
			oOdataModel.submitBatch(function(oData, oResponse, aErrorResponses) {
				oOdataModel.refresh();
				if (aErrorResponses.length === 0) {
					that.createCsvsuccess(oData, oFinData, that);
				} else {
					that.create_failed(aErrorResponses, that);
				}
			});
		},
		createCsvsuccess: function(oData, oFinData, that) {
			var oOdataModel = that.oModel_SRNew;
			var aBatchOper = [];
			var oRecord, sMethod, sQuery;
			var arrData = oData.__batchResponses[0].__changeResponses;
			for (var i = 0; i < arrData.length; i++) {
				var formid = arrData[i].data.formid;
				oRecord = oFinData[i];
				oRecord.formid = formid;
				sMethod = "POST";
				sQuery = "/FormDataLoad";
				aBatchOper.push(oOdataModel.createBatchOperation(sQuery, sMethod, oRecord));
			}
			oOdataModel.addBatchChangeOperations(aBatchOper);
			oOdataModel.submitBatch(function(oData, oResponse, aErrorResponses) {
				if (aErrorResponses.length === 0) {
					that.create_success(that);
				} else {
					that.create_failed(aErrorResponses, that);
				}
			});
		},
		onCsvSuccess: function(that) {
			var navCon = sap.ui.getCore().byId("navCon");
			navCon.to(sap.ui.getCore().byId("csv_p3"), "slide");
		},
		create_success: function(that) {
			that.oBusyIndicatorSave.close();
			
			that.populateFinData();
			that.onCsvSuccess(that);
		},
		create_failed: function(aErrorResponses, that) {
			that.oBusyIndicatorSave.close();
			var sMessage = that.getResourceBundle().getText("save_failed");
			sap.m.MessageToast.show(sMessage);
		},
		///////////////////////////////////////////////////////////////////////
		/////////////////////////End of import event///////////////////////////

		////////////////////////////  Filter Events /////////////////////////
		/////////////////////////////////////////////////////////////////////
		onFilterInteraction: function() {
			var oDialog = this._getDialog("filterDialog", "sr.view.dialog.filterDialog", 0.6, 0.6);
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
		onDialogOk: function() {
			// TODO write filter function
		},
		onDialogCancle: function() {

			var oDialog = this._getDialog("filterDialog", "sr.view.dialog.filterDialog", 0.6, 0.6);
			oDialog.close();
		},
		populateCompanyCombo: function(sServiceName) {
			var that = this;
			var vservice = "/HANADB/SR_Services/SR_Data.xsodata/";
			that.oModel = new sap.ui.model.odata.ODataModel(vservice, {
				json: true
			});
			that.oModel.read(sServiceName, null, null, false, function(oData, oResponse) {
				if (oData.results.length !== 0) {
					var oBankModel = new sap.ui.model.json.JSONModel();
					oBankModel.setData(oData);
					// var custoData = ocustGroupModel.getData();
					var oDataModel = new sap.ui.model.json.JSONModel(oBankModel);

					var oTemplate = new sap.ui.core.Item({
						text: "{coname}",
						key: "{coname}"
					});
					sap.ui.getCore().setModel(oDataModel, "CustView");
					var oControl = sap.ui.getCore().byId("companies_combo");
					// var oControl = that.getView().byId("companies_combo");
					// var oControl = that.byId("companies_combo");
					//oControl.removeAllItems();

					oControl.setModel(sap.ui.getCore().getModel("CustView").getData());
					oControl.bindItems({
						path: "/results",
						template: oTemplate
					});
					oControl.addItem(new sap.ui.core.Item({
						text: "",
						key: ""
					}));
					oControl.setSelectedKey("");

				} else {
					var str = "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D4\u05D1\u05D0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD";
					sap.m.MessageToast.show(str);
				}
			});
		},
		_getServiceName: function() {
			return this._oViewModel.getProperty("/serviceData/" + this.CustData.cotype);
		},

		onPressCategory: function(oEvent) {
			this.backToHome();
			var sKey = oEvent.getSource().getSelectedKey();
			this.setListFilter(sKey, "type");
			// var sServiceName = this._getServiceName();
			// this.populateCompanyCombo(sServiceName);
		},
		////////////////////////////// End of Filter Events ////////////////////////
		/////////////////////////////////////////////////////////////////////////////

		setStatebyKey: function(sSelectedKey) {
			switch (sSelectedKey) {
				case "form":
					this._oViewModel.setProperty("/bars/form/visible", true);
					this._oViewModel.setProperty("/bars/result/visible", false);
					this._oViewModel.setProperty("/bars/qqcalc/visible", false);
					break;
				case "indRating":
					this._oViewModel.setProperty("/bars/form/visible", false);
					this._oViewModel.setProperty("/bars/result/visible", true);
					this._oViewModel.setProperty("/bars/qqcalc/visible", false);
					break;
				case "qqcalc":
					this._oViewModel.setProperty("/bars/form/visible", false);
					this._oViewModel.setProperty("/bars/result/visible", false);
					this._oViewModel.setProperty("/bars/qqcalc/visible", true);
					break;
				default: // default code block
			}
		},
		onTabSelection: function(oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();
			this.setStatebyKey(selectedKey);
			//	var selectedTabFilter = selectedKey.substring(selectedKey.indexOf("tab_filter"), selectedKey.length);

		},
		////////////////////////////End of What if functionality///////////////////////
		///////////////////////////////////////////////////////////////////////////////

		///////////////////////////// Export Functions ////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////
		onExportCSV: function(oEvent) {
			var x = "h";

		},
		onExportPDF: function(oEvent) {
			var x = "h";

		},
		onExportXML: function(oEvent) {
			var x = "h";

		},
		////////////////////////////End of Export Functions///////////////////////
		///////////////////////////////////////////////////////////////////////////////

		//////////////////////////////////// QQCALC /////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////
		onReportQqcalc: function(oEvent) {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "report");
		},
		onSaveQqcalc: function(oEvent) {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "save");
		},
		onEditQqcalc: function(oEvent) {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("QQCalc", "QQCalcEvent", "edit");
		},

		/////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////

		///////////////////////////// Footer Functions ////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////

		onHandleOpen: function(oEvent) {
				var sButtonId = oEvent.getSource().getId();
				var selectedBtn = sButtonId.substring(sButtonId.indexOf("btn_action"), sButtonId.length);
				var sFragName = "";
				var sActionName = "";
				switch (selectedBtn) {
					case "btn_action_upload":
						sFragName = "sr.view.UploadActions";
						sActionName = "upload";
						break;
					case "btn_action_export":
						sFragName = "sr.view.ExportActions";
						sActionName = "export";
						break;
					case "btn_action_report":
						sFragName = "sr.view.ReportActions";
						sActionName = "report";
						break;
					case "btn_action_add":
						sFragName = "sr.view.addActions";
						sActionName = "add";
						break;
					default: // default code block
				}

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
			},
			///////////////////////////End of Footer Functions/////////////////////////////
			//////////////////////////////////////////////////////////////////////////////
			/*	
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @private
			 */
			 
			 		///////////////////////////Main screen Functions/////////////////////////////
			//////////////////////////////////////////////////////////////////////////////
			/*	
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @private
			 */
			 onPressReport: function(oEvent) {
			 	var sCompare = this.createId("report_comp");
			 	var x = oEvent.getSource().getId();
			 	if(sCompare === x)
			 	{
			 		this.getRouter().getTargets().display("compare");
			 	}
			 }
			 

	});
});