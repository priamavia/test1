sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0240/model/models",
	"cj/pm0010/controller/ShMain"
], function(UIComponent, Device, models, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0240.Component", {

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
			
		//	this.searchEquip = new ShMain(this.getAggregation("rootControl"));
			this.funcLocation = new ShMain(this.getAggregation("rootControl"));

		 },
		
		//*************** SearchEquip **********************
/*        openSearchEqui_Dialog : function (MainParam, selMode, plant) { 
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.searchEquip.onOpen_searchEquip(MainParam, selMode, plant);
	    },
	       
	    closeSearchEquip : function(aTokens){
	    	this.MainParam.onClose_searchEquip(aTokens);
	    },
	    */
	    
	    //***************FuncLocation*******************
	    openFuncLocation_Dialog : function(MainParam, selMode, plant){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	this.funcLocation.onOpen_funcLocation(MainParam, selMode, plant);
	    },
	    
	    
	    closeFuncLocation : function(aTokens){
	    	this.MainParam.onClose_funcLocation(aTokens);
	    }
	    
		
	});
});