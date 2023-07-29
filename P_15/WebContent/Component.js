sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0070/model/models",
	"cj/pm0071/controller/EquipMain",
    "cj/pm0010/controller/ShMain"
], function(UIComponent, Device, models, equipMain, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0070.Component", {

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

			var fgetService         =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService; 
			this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
		
			this.equipList   = new equipMain(this.getAggregation("rootControl"));		
			this.equipDetail = new ShMain(this.getAggregation("rootControl"));
			this.equipBom = new ShMain(this.getAggregation("rootControl"));
			
		},
		
		//*************** Equipment List **********************
	    openEquipList_Dialog : function (MainParam, Swerk, Equnr, Invnr) { 
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.equipList.onOpen_equipList(MainParam, Swerk, Equnr, Invnr);
	    },
	       
	    closeEquipList : function(){
	    	this.MainParam.onClose_equipList();
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
	     //config : {
	     //fullWidth : true, //Set your fullscreen parameter here!
	     //}
	});
});


