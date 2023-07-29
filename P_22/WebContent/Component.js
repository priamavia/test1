sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0130/model/models",
	"cj/pm0010/controller/ShMain"		
], function(UIComponent, Device, models, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0130.Component", {

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
			this.searchMaterial = new ShMain(this.getAggregation("rootControl"));			
			
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
	    
	    closeFuncLocation : function(aTokens){
	    	this.MainParam.onClose_funcLocation(aTokens);
	    } ,
		    
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
	    
		//*************** SearchMaterial **********************
	    openSearchMaterial_Dialog : function (MainParam, selMode, plant ) {
	    	if(!this.MainPrarm){
	    		this.MainParam = MainParam;
	    	}
			this.searchMaterial.onOpen_searchMaterial(MainParam, selMode, plant);
	    },
	       
	    closeSearchMaterial : function(aTokens, aObj){
	    	this.MainParam.onClose_searchMaterial(aTokens, aObj);
	    },
	    
		getContentDensityClass: function() {
			if (!sap.ui.Device.support.touch) {
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				this._sContentDensityClass = "sapUiSizeCozy";
			}

			return this._sContentDensityClass;
		},	    
	});
});