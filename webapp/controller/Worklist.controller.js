sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sr/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sr/util/externalFunctions",
	"sr/util/pdfReports"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator,externalFunctions,pdfReports) {
	"use strict";

	return BaseController.extend("sr.controller.Worklist", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			this._oResourceBundle = this.getResourceBundle();
		},
		onSelectLanguage: function(oEvent) {
			externalFunctions.selectLanguage(oEvent,this);
			this._navigateHome();
		},
		onLogOut: function(oEvent) {
			this.getModel("appView").setProperty("/isLogin", false);
			this.onLogin();
		},
		onSelectLoginAction: function(oEvent) {
			// var key = oEvent.getSource();
			this.getRouter().getTargets().display("object");
		},

		handlePopoverLangPress: function(oEvent) {
			externalFunctions.handlePopoverLang(oEvent,this);
		},
		handlePopoverPress: function(oEvent) {
			var isLogin = this.getModel("appView").getProperty("/isLogin");
			if (isLogin === false) {
				this.onLogin();
			} else {
				var userName = this.getModel("appView").getProperty("/user");
				if (!this._oPopover) {
					this._oPopover = sap.ui.xmlfragment("sr.view.popover.LoginPopover", this);
					this.getView().addDependent(this._oPopover);
					this._oPopover.addStyleClass("loginPopover");
				}

				if (this._oPopover.isOpen() === true) {
					this._oPopover.close();
				} else {
					// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
					var oButton = oEvent.getSource();
					jQuery.sap.delayedCall(0, this, function() {
						this._oPopover.openBy(oButton);
					});
				}
			}
		},

		getPageLayout: function() {
			return this.byId("ObjectPageLayout");
			
		},
		_navigateHome: function(){
			var oPageLayout = this.getPageLayout();
			var section = this.createId("section_about");
			oPageLayout.scrollToSection(section, 650, -50);
		},
		navigateMenu: function(oEvent) {
			if (oEvent !== undefined) {
				var oPageLayout = this.getPageLayout();
				var btnId = oEvent.getSource().getId();
				var sectionId = btnId.replace("btn", "section");
				var homeBtn = this.createId("btn_home");
				if (homeBtn === btnId) {
					var section = this.createId("section_about");
					oPageLayout.scrollToSection(section, 650, -50);
				} else {
					oPageLayout.scrollToSection(sectionId, 650, 0);
				}
			} else {

			}
		},
		onSelectLang: function(oEvent) {
			var i18nModel = "";
			var oControl = oEvent.getSource();
			var state = oControl.getSelectedKey();
			if (state === "en") {
				sap.ui.getCore().getConfiguration().setLanguage("en");
			} else {
				sap.ui.getCore().getConfiguration().setLanguage("iw");
			}
			this._navigateHome();
		},
		handleCertificationPress: function(oEvent) {
			if (!this._oPopover_certification) {
				this._oPopover_certification = sap.ui.xmlfragment("sr.view.popover.certificationPopover", this);
				this.getView().addDependent(this._oPopover_certification);
				this._oPopover_certification.addStyleClass("loginPopover");
			}
			if (this._oPopover_certification.isOpen() === true) {
				this._oPopover_certification.close();
			} else {
				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				var oButton = oEvent.getSource();
				jQuery.sap.delayedCall(0, this, function() {
					this._oPopover_certification.openBy(oButton);
				});
			}

		},
		navigateSubMenu: function(oEvent) {
			var btnId = oEvent.getSource().getId();
			var oPageLayout = this.getPageLayout();
			var sectionId = btnId.replace("btn", "section");
			sectionId = this.createId(sectionId);
			oPageLayout.scrollToSection(sectionId, 650, 0);
		},
		handleAboutusPress: function(oEvent) {
			if (!this._oPopover_about) {
				this._oPopover_about = sap.ui.xmlfragment("sr.view.popover.aboutUsPopover", this);
				this.getView().addDependent(this._oPopover_about);
				this._oPopover_about.addStyleClass("loginPopover");
			}
			if (this._oPopover_about.isOpen() === true) {
				this._oPopover_about.close();
			} else {
				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				var oButton = oEvent.getSource();
				jQuery.sap.delayedCall(0, this, function() {
					this._oPopover_about.openBy(oButton);
				});
			}
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

		/**
		 *@memberOf SelfRating.controller.View1
		 */
		onLogin: function() {
			var oDialog = this.getModel("appView").getProperty("/dialog");
			oDialog.open();
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function() {
			history.go(-1);
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("CityName", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(oTableSearchState);
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("CityName")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {object} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function(oTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});