sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0080/model/models",
	"cj/pm0010/controller/ShMain"
], function(UIComponent, Device, models, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0080.Component", {

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
			
			this.equipDetail = new ShMain(this.getAggregation("rootControl"));
			this.equipBom = new ShMain(this.getAggregation("rootControl"));			
			
/*			if (window.location.hostname != "localhost") {
				var oComponentData = this.getComponentData();
				if (oComponentData.startupParameters.parent) {
					this.param_parent = this.getComponentData().startupParameters.parent[0];
			    }
			}*/

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
	    
	    
	    get_param_parent : function(){
	    	return this.param_parent;
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