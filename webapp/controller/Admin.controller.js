/*global location*/
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Fragment",
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button"
], function(jQuery, Fragment, BaseController, Controller, JSONModel, Popover, Button) {
	"use strict";
	return BaseController.extend("sr.controller.Admin", {
		model: new sap.ui.model.json.JSONModel(),
		onInit: function() {
			this._oResourceBundle = this.getResourceBundle();
			this._actionSheet = {};
			this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);
			this.data = {
			navigation: [{
				title:  this._oResourceBundle.getText("users"),
				icon: "sap-icon://person-placeholder",
				expanded: true,
				key: "root1" // items: [{
					// 	title: 'Child Item 1',
					// 	key: 'page1'
					// }, {
					// 	title: 'Child Item 2',
					// 	key: 'page2'
					// }]
			}, {
				title:  this._oResourceBundle.getText("database"),
				icon: "sap-icon://database",
				key: "root2"
			}, {
				title:  this._oResourceBundle.getText("license"),
				icon: "sap-icon://card",
				key: "viewLicense",
				expanded: false // items: [{
					// 	title: 'Child Item'
					// }, {
					// 	title: 'Child Item'
					// }]
			}],
			fixedNavigation: [{
				title: "Fixed Item 1",
				icon: "sap-icon://employee"
			}, {
				title: "Fixed Item 2",
				icon: "sap-icon://building"
			}, {
				title: "Fixed Item 3",
				icon: "sap-icon://card"
			}],
			headerItems: [{
				text: "File"
			}, {
				text: "Edit"
			}, {
				text: "View"
			}, {
				text: "Settings"
			}, {
				text: "Help"
			}]
		};
		this.model.setData(this.data);
		this.getView().setModel(this.model);
		},
		onItemSelect: function(oEvent) {
			var item = oEvent.getParameter("item");
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey()); //	viewUser
		},
		handleUserNamePress: function(event) {
			var popover = new Popover({
				showHeader: false,
				placement: sap.m.PlacementType.Bottom,
				content: [
					new Button({
						text: "Feedback",
						type: sap.m.ButtonType.Transparent
					}),
					new Button({
						text: "Help",
						type: sap.m.ButtonType.Transparent
					}),
					new Button({
						text: "Logout",
						type: sap.m.ButtonType.Transparent
					})
				]
			}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");
			popover.openBy(event.getSource());
		},
		onSideNavButtonPress: function() {
			var viewId = this.getView().getId();
			var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
			var sideExpanded = toolPage.getSideExpanded();
			this._setToggleButtonTooltip(sideExpanded);
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		_setToggleButtonTooltip: function(bLarge) {
				var toggleButton = this.getView().byId("sideNavigationToggleButton");
				if (bLarge) {
					toggleButton.setTooltip("Large Size Navigation");
				} else {
					toggleButton.setTooltip("Small Size Navigation");
				}
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf sr.view.view.admin
			 */
			//	onBeforeRendering: function() {
			//
			//	},
			/**
			 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			 * This hook is the same one that SAPUI5 controls get after being rendered.
			 * @memberOf sr.view.view.admin
			 */
			//	onAfterRendering: function() {
			//
			//	},
			/**
			 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			 * @memberOf sr.view.view.admin
			 */
			//	onExit: function() {
			//
			//	}
			,
		/**
		 *@memberOf sr.controller.Admin
		 */
		onUserPress: function(oEvent) {
			var item = oEvent.getSource().getSelectedItem();
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--viewUser"); //	viewUser
		},
		/**
		 *@memberOf sr.controller.Admin
		 */
		onHandleOpen: function(oEvent) {
			var sButtonId = oEvent.getSource().getId();
			var selectedBtn = sButtonId.substring(sButtonId.indexOf("btn_action"), sButtonId.length);
			var frag = selectedBtn.substring(this.getView().getId().length + 6, selectedBtn.length);
			var sFragName = "sr.view.admin." + frag;
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheet[sFragName]) {
				this._actionSheet[sFragName] = sap.ui.xmlfragment(sFragName, this);
				this.getView().addDependent(this._actionSheet[sFragName]);
			}
			this._actionSheet[sFragName].openBy(oButton);
		},
		
		///////////////////////POPOVER HELP SECTION/////////////////////////////
	handleMessagePopover: function (oEvent) {	
	var oLink = new sap.m.Link({
		text: "Show more information",
		href: "http://sap.com",
		target: "_blank"
	});
 
	var oMessageTemplate = new sap.m.MessagePopoverItem({
		type: '{type}',
		title: '{title}',
		description: '{description}',
		subtitle: '{subtitle}',
		counter: '{counter}',
		link: oLink
	});
 
	var oMessagePopover1 = new sap.m.MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});
 
	var oMessagePopover2 = new sap.m.MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		}
	});
 
	var oMessagePopover3 = new sap.m.MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		},
		initiallyExpanded: false
	});
 
			var sErrorDescription = 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
				'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
				'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
				'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
				'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
				'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
 
			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				description: sErrorDescription,
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Warning',
				title: 'Warning without description',
				description: ''
			}, {
				type: 'Success',
				title: 'Success message',
				description: 'First Success message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Error',
				title: 'Error message',
				description: 'Second Error message description',
				subtitle: 'Example of subtitle',
				counter: 2
			}, {
				type: 'Information',
				title: 'Information message',
				description: 'First Information message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}];
 
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aMockMessages);
 
			var viewModel = new sap.ui.model.json.JSONModel();
			viewModel.setData({
				messagesLength: aMockMessages.length + ''
			});
 
			this.getView().setModel(viewModel);
 
			oMessagePopover1.setModel(oModel);
			oMessagePopover2.setModel(oModel);
			oMessagePopover3.setModel(oModel);
 
			 oMessagePopover1.openBy(oEvent.getSource());


			// oMessagePopover2.openBy(oEvent.getSource());

			// oMessagePopover3.openBy(oEvent.getSource());
		},

		////////////////////////////////////////////////////////////////////////
		
		
		
		/**
		 *@memberOf sr.controller.Admin
		 */
		onHome: function() {
			this .getRouter().getTargets().display("object");
		}
	});
});