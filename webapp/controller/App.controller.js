sap.ui.define([
		"sr/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sr/util/loginModule"
	], function (BaseController, JSONModel,loginModule) {
		"use strict";

		return BaseController.extend("sr.controller.App", {
			onInit : function () {
				var that = this;
				this.user = {};
				this._oResourceBundle = this.getResourceBundle();
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
					this.oDialog = loginModule.createLoginDialog(that,this._oResourceBundle);
				
				oViewModel = new JSONModel({
					isLogin:false,
					language:"en",
					busy : false,
					delay : 0,
					dialog: that.oDialog,
					user: that.user,
					selectedfinForm:null,
					selectedFormValues:null,
					isResultRating:false,
					resultData:null
				});
				this.setModel(oViewModel, "appView");

				fnSetAppNotBusy = function() {
					oViewModel.setProperty("/busy", false);
				//	oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};

				// this.getOwnerComponent().getModel().metadataLoaded().
				// 	then(fnSetAppNotBusy);

				// apply content density mode to root view
				// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}

		});

	}
);