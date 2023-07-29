sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/mm0010/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("cj.mm0010.Component", {

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
		 },
		
		/**
		 * Get devict CSS name
		 * @public
		 * @return {string} CSS name
		 */
		getContentDensityClass: function() {
			if (!sap.ui.Device.support.touch) {
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				this._sContentDensityClass = "sapUiSizeCozy";
			}

			return this._sContentDensityClass;
		},

		myNavBack: function (refresh) {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
//			debugger;
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("main", {}, true);
			}


//			this.getRouter().destroy();		
			if(refresh){
				sap.ui.getCore().byId("refresh");
			}
		},
	
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = sap.ui.core.routing.History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("main", {}, true /*no history*/);
			}
		}
	
		
		
		    
	});
});