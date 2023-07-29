sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0071/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("cj.pm0071.Component", {

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

			// set the device model
			//this.setModel(models.createDeviceModel(), "device");

			this.getRouter().initialize();

			//Fiori Parameter
			if (window.location.hostname != "localhost") {
				var fgetService         =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService; 
				this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");

				var oComponentData = this.getComponentData();
				if (oComponentData.startupParameters) {
					this.param1 = this.getComponentData().startupParameters.param1[0];
					this.param2 = this.getComponentData().startupParameters.param2[0];
			    }
			} else {	
				//localhost Test
				this.param1 = '2010';
				this.param2 = "10000008";				
			} 
			
		},
		 //config : {
		 //fullWidth : true, //Set your fullscreen parameter here!
		 //}
	});
});


