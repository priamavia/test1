sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0120/model/models",
	"cj/pm0010/controller/ShMain"	
], function(UIComponent, Device, models, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0120.Component", {

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
			
//			var fgetService         =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService; 
//			this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
			
			this.searchEquip  = new ShMain(this.getAggregation("rootControl"));
			this.funcLocation = new ShMain(this.getAggregation("rootControl"));
			this.workAssign   = new ShMain(this.getAggregation("rootControl"));
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
		    
		    //***************Work Assign*******************
		    openWorkAssign_Dialog : function(MainParam, sSwerk, sObj){
		    	if(!this.MainPrarm){
		    		this.MainParam = MainParam;
		    	}
		    	this.workAssign.onOpen_workAssign(MainParam, sSwerk, sObj);
		    },
		    
		    closeWorkAssign : function(){
		    	this.MainParam.onClose_workAssign();
		    }		    
		        
	});
});