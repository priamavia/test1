sap.ui.define([
	"sap/ui/base/Object",
	"cj/pm0071/controller/EquipList.controller"
], function(Object, EquipList) {
	"use strict";
	
	return Object.extend("cj.pm0071.controller.EquipMain", { 
	
		constructor : function (oView) {
			this._oView = oView;	
		},
		
		onOpen_equipList : function (MainParam, vSwerk, vEqunr, vInvnr) { 
			if(!vEqunr){
				return;
			}
			
			this.EquipList_oDialog = this._oView.getParent().equipList.EquipList_oDialog;
			if (!this.EquipList_oDialog) {
				this.EquipList_oDialog_Controller = new EquipList(this._oView);  
				this.EquipList_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0071.view.EquipList_pop", this.EquipList_oDialog_Controller);
				this.EquipList_oDialog_Controller.createHandler(this.EquipList_oDialog, MainParam, this);  
				this._oView.addDependent(this.EquipList_oDialog);
			}
			this.EquipList_oDialog_Controller.set_header(vSwerk, vEqunr, vInvnr);
		    this.EquipList_oDialog.open();
		    this.EquipList_oDialog_Controller.set_data();
		},
		
		onClose_equipList : function(){
			//this._oView._oContainingView.oParent.closeWorkResult();
		}
		
	});
});
