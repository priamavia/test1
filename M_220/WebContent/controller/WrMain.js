sap.ui.define([
	"sap/ui/base/Object",
	"cj/pm_m220/controller/WorkResult.controller"
], function(Object, WorkResult) {
	"use strict";
	
	return Object.extend("cj.pm_m220.controller.WrMain", { 
	
		constructor : function (oView) {
			this._oView = oView;	
		},
		
		onOpen_workResult : function (MainParam, sMode, sObj) {   // sMode : 조회, 생성 모드 
			if(!sObj){
				return;
			}
			
			this.WorkResult_oDialog = this._oView.getParent().workResult.WorkResult_oDialog;
			if (!this.WorkResult_oDialog) {
				this.WorkResult_oDialog_Controller = new WorkResult(this._oView);  
				this.WorkResult_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm_m220.view.WorkResult_pop", this.WorkResult_oDialog_Controller);
				this.WorkResult_oDialog_Controller.createHandler(this.WorkResult_oDialog, MainParam, this);  
				this._oView.addDependent(this.WorkResult_oDialog);
			}
			
			this.WorkResult_oDialog_Controller.set_header(sObj, sMode);
		    this.WorkResult_oDialog.open();
		    this.WorkResult_oDialog_Controller.set_data();
		},
		
		onClose_workResult : function(){
			this._oView._oContainingView.oParent.closeWorkResult();
			this.WorkResult_oDialog.destroy();
			this.WorkResult_oDialog = "";
	    	this.WorkResult_oDialog_Controller.destroy();
	    	this.WorkResult_oDialog_Controller = "";					
		}
		
	});
});
