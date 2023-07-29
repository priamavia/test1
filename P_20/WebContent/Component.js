sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0110/model/models",
	"cj/pm0010/controller/ShMain",
	"cj/pm0101/controller/WrMain"	
], function(UIComponent, Device, models, ShMain, WrMain) {
	"use strict";

	return UIComponent.extend("cj.pm0110.Component", {

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
			this.equipBom = new ShMain(this.getAggregation("rootControl"));
			this.searchMaterialStock = new ShMain(this.getAggregation("rootControl"));
			this.workResult = new WrMain(this.getAggregation("rootControl"));
			
			if (window.location.hostname != "localhost") {
				var oComponentData = this.getComponentData();
				
				if(oComponentData.startupParameters.param_mode){
					this.param_mode = oComponentData.startupParameters.param_mode[0];
				}
				
				if(oComponentData.startupParameters.param_swerk){
					this.param_swerk = oComponentData.startupParameters.param_swerk[0];
				}
					
				if(oComponentData.startupParameters.param_order){
					this.param_order = oComponentData.startupParameters.param_order[0];
				}
				
				if(oComponentData.startupParameters.param_qmnum){
					this.param_qmnum = oComponentData.startupParameters.param_qmnum[0];
				} 
				
				if(oComponentData.startupParameters.param_woc){
					this.param_woc = oComponentData.startupParameters.param_woc[0];
				} 
				
				if(oComponentData.startupParameters.param_ort){
					this.param_ort = oComponentData.startupParameters.param_ort[0];
				} 
				
			}
		 },
		
		 //*************** SearchEquip **********************
         openSearchEqui_Dialog : function (MainParam, selMode, plant) { 
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.searchEquip.onOpen_searchEquip(MainParam, selMode, plant);
	     },
	       
	     closeSearchEquip : function(aTokens, aObj){
	    	this.MainParam.onClose_searchEquip(aTokens, aObj);
	     },
	    
	    //***************FuncLocation*******************
	     openFuncLocation_Dialog : function(MainParam, selMode, plant){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	this.funcLocation.onOpen_funcLocation(MainParam, selMode, plant);
	      },
	    
	     closeFuncLocation : function(aTokens, aObj){
	    	this.MainParam.onClose_funcLocation(aTokens, aObj);
	     },
	     
	    //*************** EquipBOM ***********************
	     openEquipBom_Dialog : function(MainParam, mode, plant, equnr, desc){
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
	    	//this.equipBom.onOpen_equipBom(MainParam, mode, plant, equnr, desc);
	    	this.equipBom.onOpen_equipBom(MainParam, plant, equnr, desc);
	     },
	    
	     closeEquipBom : function(SelBom){
	    	this.MainParam.onClose_equipBom(SelBom);
	     },
	     
	   //*************** SearchMaterialStock **********************
	     openSearchMaterialStock_Dialog : function (MainParam, selMode, plant ) {  
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.searchMaterialStock.onOpen_searchMaterialStock(MainParam, selMode, plant);
	     },
	       
	     closeSearchMaterialStock : function(aTokens, aObj){
	    	this.MainParam.onClose_searchMaterialStock(aTokens, aObj);
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
	    
		 get_param_order : function(){
		    return this.param_order;
		 },
			    	 
		 get_param_mode : function(){
		    return this.param_mode; 
		 },
		 
		 get_param_qmnum : function(){
			 return this.param_qmnum;
		 },
		 
		 get_param_woc : function(){
			 return this.param_woc;
		 },
		 
		 get_param_ort : function(){
			 return this.param_ort;
		 },
		 
		 get_param_swerk : function(){
			 return this.param_swerk;
		 }

		        
	});
});