sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0100/model/models",
	"cj/pm0010/controller/ShMain",
	"cj/pm0101/controller/WrMain"		
], function(UIComponent, Device, models, ShMain, WrMain) {
	"use strict";

	return UIComponent.extend("cj.pm0100.Component", {

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
			
			this.searchEquip = new ShMain(this.getAggregation("rootControl"));
			this.funcLocation = new ShMain(this.getAggregation("rootControl"));			
			this.workResult = new WrMain(this.getAggregation("rootControl"));
			this.workAssign    = new ShMain(this.getAggregation("rootControl"));
			this.equipDetail = new ShMain(this.getAggregation("rootControl"));
			this.equipBom = new ShMain(this.getAggregation("rootControl"));			
		 },
		
		//*************** WorkResult **********************
        openWorkResult_Dialog : function (MainParam, sMode, sObj) { 
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.workResult.onOpen_workResult(MainParam, sMode, sObj);
	    },
	       
	    closeWorkResult : function(){
	    	this.MainParam.onClose_workResult();
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
	    },	
	    
	    //*************** EquipBOM **************************
	    openEquipBom_Dialog : function(MainParam, mode, plant, equnr){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	this.equipBom.onOpen_equipBom(MainParam, mode, plant, equnr);
	    },
	    
	    //*************** EquipmentDetail*******************
	    openEquipDetail_Dialog : function(MainParam, vSwerk, vEqunr){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	this.equipDetail.onOpen_equipDetail(MainParam, vSwerk, vEqunr);
	    }	 	    
		    
		    		        
	});
});