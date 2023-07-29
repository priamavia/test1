sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm0090/model/models",
	"cj/pm0010/controller/ShMain"
], function(UIComponent, Device, models, ShMain) {
	"use strict";

	return UIComponent.extend("cj.pm0090.Component", {

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
			
			if (window.location.hostname != "localhost") {

				var oComponentData = this.getComponentData();
				
		        if(this.getComponentData().startupParameters.param_swerk){
					this.param_swerk = this.getComponentData().startupParameters.param_swerk[0];
		        }
				if(this.getComponentData().startupParameters.param_mode){
					this.param_mode = this.getComponentData().startupParameters.param_mode[0];
				}
				if (this.getComponentData().startupParameters.param_qmnum){
					this.param_qmnum = this.getComponentData().startupParameters.param_qmnum[0];
				}
				if (this.getComponentData().startupParameters.param_equnr){
					this.param_equnr = this.getComponentData().startupParameters.param_equnr[0];
				}
				if (this.getComponentData().startupParameters.param_eqktx){
					this.param_eqktx = this.getComponentData().startupParameters.param_eqktx[0];
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
	    
	    get_param_swerk : function(){
	    	return this.param_swerk;
	    },
	    
	    get_param_qmnum : function(){
	    	return this.param_qmnum;
	    },
	    
	    get_param_mode : function(){
	    	return this.param_mode;
	    },
	    
	    get_param_equnr : function(){
	    	return this.param_equnr;
	    },
	    
	    get_param_eqktx : function(){
	    	return this.param_eqktx;
	    },
	    
	    change_title : function(){
	    	debugger;
	    	this.getMetadata().getManifestEntry("sap.app").title = this.getModel("i18n").getResourceBundle().getText("appTitle_change");
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