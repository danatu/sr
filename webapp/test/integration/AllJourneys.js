jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"sr/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"sr/test/integration/pages/Worklist",
		"sr/test/integration/pages/Object",
		"sr/test/integration/pages/NotFound",
		"sr/test/integration/pages/Browser",
		"sr/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "sr.view."
	});

	sap.ui.require([
		"sr/test/integration/WorklistJourney",
		"sr/test/integration/ObjectJourney",
		"sr/test/integration/NavigationJourney",
		"sr/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});