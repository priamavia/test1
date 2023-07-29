sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm_m240/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("cj.pm_m240.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
						
			this.getRouter().initialize();
		},

		
	});
});