sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function(UIComponent, Device) {
	"use strict";

	return UIComponent.extend("cj.pm_m050.Component", {

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
			
//			this.searchEquip = new ShMain(this.getAggregation("rootControl"));
//			this.funcLocation = new ShMain(this.getAggregation("rootControl"));
			
		 },
		
		/**
		 * Get devict CSS name
		 * @public
		 * @return {string} CSS name
		 */
		getContentDensityClass: function() {
			this._sContentDensityClass = "sapUiSizeCompact";
			
//			if (!sap.ui.Device.support.touch) {
//				this._sContentDensityClass = "sapUiSizeCompact";
//			} else {
//				this._sContentDensityClass = "sapUiSizeCozy";
//			}

			return this._sContentDensityClass;
		},

		//*************** SearchEquip **********************
        openSearchEqui_Dialog : function (MainParam, selMode, plant) { 
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.searchEquip.onOpen_searchEquip(MainParam, selMode, plant);
	    },
	       
	    closeSearchEquip : function(aTokens){
	    	this.MainParam.onClose_searchEquip(aTokens);
	    },	    
	    //***************FuncLocation*******************
	    openFuncLocation_Dialog : function(MainParam, selMode, plant, tokens){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	this.funcLocation.onOpen_funcLocation(MainParam, selMode, plant, tokens);
	    },
	    
	    closeFuncLocation : function(aTokens){
	    	this.MainParam.onClose_funcLocation(aTokens);
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