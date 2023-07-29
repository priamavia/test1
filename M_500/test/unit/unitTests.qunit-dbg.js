/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zco_ui_0001/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
