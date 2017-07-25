sap.ui.define([
	"sr/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return {
			_getDialog: function(sControlId, sFragId, sWidth, sHeight,that) {
				var oView = that.getView();
				var oDialog = sap.ui.getCore().byId(sControlId);
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(sFragId, that);
					oView.addDependent(oDialog);
					var contentWidth = jQuery(window).width() * sWidth + "px";
					var contentHeight = jQuery(window).height() * sHeight + "px";
					oDialog.setContentHeight(contentHeight);
					oDialog.setContentWidth(contentWidth);
				}
				return oDialog;
			},
			getValue: function(){
				return "test";	
			},
			getControlValue: function(oControl) 
			{
					var val = "";
					var controlType = oControl.getMetadata().getName();
					
						switch (controlType) {
						case "sap.m.SelectList":
							val = oControl.getSelectedKey();
							break;
						case "sap.m.ComboBox":
							val = oControl.getSelectedKey();
							break;
						case "sap.m.Input":
							val = oControl.getValue();
							break;
						case "sap.m.TextArea":
							val = oControl.getValue();
							break;
						case "sap.m.RadioButtonGroup":
							val = oControl.getSelectedIndex();
							break;
						default: // default code block
					}
			return val;
			},
			selectLanguage: function(oEvent,that){
				var sLangKey = oEvent.getSource().getSelectedKey();
				var sSelectedLanguage = sLangKey.substring(5, sLangKey.length);
				that.setResourceBundle(sSelectedLanguage);
			},
			handlePopoverLang: function(oEvent,that){
			if (!that._oPopoverLang) {
				that._oPopoverLang = sap.ui.xmlfragment("sr.view.popover.LanguagePopover", that);
				that.getView().addDependent(that._oPopoverLang);
				that._oPopoverLang.addStyleClass("loginPopover");
			}
			if (that._oPopoverLang.isOpen() === true) {
				that._oPopoverLang.close();
			} else {
				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				var oButton = oEvent.getSource();
				jQuery.sap.delayedCall(0, that, function() {
					that._oPopoverLang.openBy(oButton);
				});
			}
			}
	
	};
});