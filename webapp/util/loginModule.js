sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return {
		createLoginDialog: function(that, oResourceBundle) {
			that.contentWidth = jQuery(window).height() * 0.6 + "px";
			that.contentHeight = jQuery(window).height() * 0.25 + "px";

			var oTextEmail = new sap.m.Input("email_id", {
				value: "",
				placeholder: oResourceBundle.getText("tap_email")
			}).addStyleClass("loginInput");
			var oTextPassword = new sap.m.Input("password_id", {
				type: sap.m.InputType.Password,
				value: "",
				placeholder: oResourceBundle.getText("tap_password")
			}).addStyleClass("loginInput");
			//define page
			var oPanel = new sap.m.Panel("panel_id", {
				content: [
					new sap.m.Label({
						text: oResourceBundle.getText("email")
					}),
					oTextEmail,
					new sap.m.Label("label_password", {
						text: oResourceBundle.getText("password")
					}),
					oTextPassword
				]
			}).addStyleClass("loginpage");
			var oPage = new sap.m.Page({
				showHeader: false,
				content: oPanel
			});

			var oDialog = new sap.m.Dialog("oDialog_id", {
				contentWidth: that.contentWidth,
				contentHeight: that.contentHeight,
				title: oResourceBundle.getText("login"),
					content: [oPage],
				endButton: new sap.m.Button("btn_cancle_id", {
					text: oResourceBundle.getText("cancel"),
					press: function() {
						oDialog.close();
					}
				}),
				beginButton: new sap.m.Button({
					text: oResourceBundle.getText("login"),
					press: function() {
					
					http://35.156.190.99:8000/SR_Services/SR_NEW.xsodata/UserLogin(USEREMAIL='danaturjeman@iprosis.com')/Results
					
					
						var vservice = "/HANADB/SR_Services/SR_NEW.xsodata/";
						var oModel = new sap.ui.model.odata.ODataModel(vservice, {
							json: true
						});
						var sUser = sap.ui.getCore().byId("email_id").getValue();
						var sPassword = sap.ui.getCore().byId("password_id").getValue();
						var param1 = 'danaturjeman@iprosis.com';
						var param2 = '1234567';


						oModel.read("UserLogin(USEREMAIL='" + sUser + "')/Results" ,
							null,
							null,
							false,
							function(oData, oResponse) {
								if (oData.results.length !== 0) {
								
								var data = oData.results[0];
									that.getModel("appView").setProperty("/user", data);
									that.getModel("appView").setProperty("/isLogin", true);
								//	var sFirstNameVal = oData.results[0].uname2;
									that.getRouter().getTargets().display("object", {
										user: data
									});

								} else {
									var str = "The password is incorrect";
									sap.m.MessageToast.show(str);
								}
							}
						);
					}
				})
			});
			return oDialog;
		}
	};
});