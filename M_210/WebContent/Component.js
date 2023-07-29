sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cj/pm_m210/model/models",
	"cj/pm0010/controller/ShMain",
	"cj/pm_m220/controller/WrMain"
], function(UIComponent, Device, models, ShMain, WrMain) {
	"use strict";

	return UIComponent.extend("cj.pm_m210.Component", {

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
			
	         
			this.searchEquip   = new ShMain(this.getAggregation("rootControl"));
			this.funcLocation  = new ShMain(this.getAggregation("rootControl"));
			this.recordMeasure = new ShMain(this.getAggregation("rootControl"));
			this.workAssign    = new ShMain(this.getAggregation("rootControl"));
			this.workResult    = new WrMain(this.getAggregation("rootControl"));
		 },

		getContentDensityClass: function() {
			if (!sap.ui.Device.support.touch) {
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				this._sContentDensityClass = "sapUiSizeCozy";
			}

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

		//***************RecordMeasure*******************
		openRecordMeasure_Dialog : function(MainParam, sAufnr, sMityp, sSwerk){
			if(!this.MainPrarm){
				this.MainParam = MainParam;
			}
			this.recordMeasure.onOpen_recordMeasure(MainParam, sAufnr, sMityp, sSwerk);
		},
		
		closeRecordMeasure : function(){
			this.MainParam.onClose_recordMeasure();
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
//			onConfirmMeasure_Dialog : function(){
//				this.recordMeasure.dataUpdateProcess("T");
//			},			
//
//			onCancelMeasure_Dialog : function(){
//				this.recordMeasure.dataUpdateProcess("C");
//			},		
//			
//			onSaveMeasure_Dialog : function(){
//				this.recordMeasure.dataUpdateProcess("S");
//			}				    
	});
});