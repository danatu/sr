sap.ui.define([
		"sr/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sr.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);