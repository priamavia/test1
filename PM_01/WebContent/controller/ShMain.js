sap.ui.define([
	"sap/ui/base/Object",
	"cj/pm0010/controller/SearchEquip.controller",
	"cj/pm0010/controller/EquipmentBOM.controller",
	"cj/pm0010/controller/SearchEquipStock.controller",
	"cj/pm0010/controller/EquipmentDetail.controller",
	"cj/pm0010/controller/FuncLocation.controller",
	"cj/pm0010/controller/SearchMaterial.controller",
	"cj/pm0010/controller/SearchMaterialStock.controller",
	"cj/pm0010/controller/RecordMeasurement.controller",
	"cj/pm0010/controller/WorkAssign.controller"	
], function(Object, SearchEquip, EquipBom, SearchEquipStock, EquipDetail, FuncLocation,
		   SearchMaterial, SearchMaterialStock, RecordMeasure, WorkAssign) {
	"use strict";
	
	return Object.extend("cj.pm0010.controller.ShMain", { 
	
		constructor : function (oView) {
			this._oView = oView;	
		},
		
		
		onOpen_searchEquip : function (MainParam, selMode, plant) {   //MultiToggle , Single  // 3)
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.SearchEquip_oDialog = this._oView.getParent().searchEquip.SearchEquip_oDialog;
			if (!this.SearchEquip_oDialog) {
				this.SearchEquip_oDialog_Controller = new SearchEquip(this._oView);  
				this.SearchEquip_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.SearchEqui_pop", this.SearchEquip_oDialog_Controller);
				this.SearchEquip_oDialog_Controller.createHandler(this.SearchEquip_oDialog, MainParam, this, selMode);  
				this._oView.addDependent(this.SearchEquip_oDialog);
			}		
		    this.SearchEquip_oDialog.open();
			this.SearchEquip_oDialog_Controller.set_plant(plant);
		    this.SearchEquip_oDialog_Controller.set_tab1();
		},
		
		onClose_searchEquip : function(aTokens, aObj){
			this._oView._oContainingView.oParent.closeSearchEquip(aTokens, aObj);
		},
		
		
		onOpen_equipBom : function(MainParam, plant, equnr, desc, selMode){ //MultiToggle , Single, None)
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.EquipBom_oDialog = this._oView.getParent().equipBom.EquipBom_oDialog;
			if(!this.EquipBom_oDialog){
				this.EquipBom_oDialog_Controller = new EquipBom(this._oView);  
				this.EquipBom_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.EquipmentBOM_pop", this.EquipBom_oDialog_Controller);
				this.EquipBom_oDialog_Controller.createHandler(this.EquipBom_oDialog, MainParam, this, selMode);  
				this._oView.addDependent(this.EquipBom_oDialog);
			}
			
			this.EquipBom_oDialog.open();
			
			if(equnr){
				this.EquipBom_oDialog_Controller.get_bom_data(plant, equnr, desc);
			}else{
				if (window.location.hostname === "localhost") {
					this.EquipBom_oDialog_Controller.get_bom_data("3011", "10003097", "Material desc.");
				}else{
					return;
				}
			}
		},
		
		onClose_equipBom : function(selBom){
			this._oView._oContainingView.oParent.closeEquipBom(selBom);
		},
		
		
		onOpen_equipStock : function(MainParam, plant){
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.EquipStock_oDialog = this._oView.getParent().equipStock.EquipStock_oDialog;
			if(!this.EquipStock_oDialog){
				this.EquipStock_oDialog_Controller = new SearchEquipStock(this._oView);  
				this.EquipStock_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.SearchEquipStock_pop", this.EquipStock_oDialog_Controller);
				this.EquipStock_oDialog_Controller.createHandler(this.EquipStock_oDialog, MainParam, this);  
				this._oView.addDependent(this.EquipStock_oDialog);
			}
			this.EquipStock_oDialog.open();
		},
	
		onClose_equipStock : function(selBom){
			this._oView._oContainingView.oParent.closeEquipStock(selBom); 
		},
		
		
		onOpen_equipDetail : function(MainParam, vSwerk, vEqunr){
/*			if(!this.check_plant(MainParam, plant)){
				return;
			}*/
			
			this.EquipDetail_oDialog = this._oView.getParent().equipDetail.EquipDetail_oDialog;
			if(!this.EquipDetail_oDialog){
				this.EquipDetail_oDialog_Controller = new EquipDetail(this._oView);  
				this.EquipDetail_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.EquipmentDetail_pop", this.EquipDetail_oDialog_Controller);
				this.EquipDetail_oDialog_Controller.createHandler(this.EquipDetail_oDialog, MainParam, this);  
				this._oView.addDependent(this.EquipDetail_oDialog);
			}
			this.EquipDetail_oDialog.open();
			if(vEqunr){
				this.EquipDetail_oDialog_Controller.get_equip_data(vSwerk, vEqunr);
			}else{
				this.EquipDetail_oDialog_Controller.get_equip_data("2010", "10000007");
			}			 
			this.EquipDetail_oDialog_Controller.get_attach_file();
		},
		
		
		onOpen_funcLocation : function(MainParam, selMode, plant, tokens){
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.FuncLocation_oDialog = this._oView.getParent().funcLocation.FuncLocation_oDialog;
			if(!this.FuncLocation_oDialog){
				this.FuncLocation_oDialog_Controller = new FuncLocation(this._oView);  
				this.FuncLocation_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.FuncLocation_pop", this.FuncLocation_oDialog_Controller);
				this.FuncLocation_oDialog_Controller.createHandler(this.FuncLocation_oDialog, MainParam, this, selMode);  
				this._oView.addDependent(this.FuncLocation_oDialog);
			}
			this.FuncLocation_oDialog.open();
			this.FuncLocation_oDialog_Controller.set_plant(plant, tokens);
		},

		onClose_funcLocation : function(aTokens, aObj){
			this._oView._oContainingView.oParent.closeFuncLocation(aTokens, aObj);
		},
		
		
		onOpen_searchMaterial : function (MainParam, selMode, plant) {   //MultiToggle , Single  // 3)
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.SearchMaterial_oDialog = this._oView.getParent().searchMaterial.SearchMaterial_oDialog;
			if (!this.SearchMaterial_oDialog) {
				this.SearchMaterial_oDialog_Controller = new SearchMaterial(this._oView);  
				this.SearchMaterial_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.SearchMaterial_pop", this.SearchMaterial_oDialog_Controller);
				this.SearchMaterial_oDialog_Controller.createHandler(this.SearchMaterial_oDialog, MainParam, this, selMode);  
				this._oView.addDependent(this.SearchMaterial_oDialog);
			}		
		    this.SearchMaterial_oDialog.open();			
			this.SearchMaterial_oDialog_Controller.set_plant(plant);
			//this.SearchMaterial_oDialog_Controller.set_init();
		},
		
		onClose_searchMaterial : function(aTokens, aObj){
			this._oView._oContainingView.oParent.closeSearchMaterial(aTokens, aObj);
		},
		
		
		onOpen_searchMaterialStock : function (MainParam, selMode, plant) {   //MultiToggle , Single  // 3)
			if(!this.check_plant(MainParam, plant)){
				return;
			}
			
			this.SearchMaterialStock_oDialog = this._oView.getParent().searchMaterialStock.SearchMaterialStock_oDialog;
			if (!this.SearchMaterialStock_oDialog) {
				this.SearchMaterialStock_oDialog_Controller = new SearchMaterialStock(this._oView);  
				this.SearchMaterialStock_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.SearchMaterialStock_pop", this.SearchMaterialStock_oDialog_Controller);
				this.SearchMaterialStock_oDialog_Controller.createHandler(this.SearchMaterialStock_oDialog, MainParam, this, selMode);  
				this._oView.addDependent(this.SearchMaterialStock_oDialog);
			}		
		    this.SearchMaterialStock_oDialog.open();			
			this.SearchMaterialStock_oDialog_Controller.set_plant(plant);
			//this.SearchMaterial_oDialog_Controller.set_init();
		},
		
		onClose_searchMaterialStock : function(aTokens, aObj){
			this._oView._oContainingView.oParent.closeSearchMaterialStock(aTokens, aObj);
		},

		onOpen_recordMeasure : function (MainParam, sAufnr, sMityp, sSwerk) { 
			if(!this.check_plant(MainParam, sSwerk)){
				return;
			}
			debugger;
			this.RecordMeasure_oDialog = this._oView.getParent().recordMeasure.RecordMeasure_oDialog;
			if (!this.RecordMeasure_oDialog) {
				this.RecordMeasure_oDialog_Controller = new RecordMeasure(this._oView);  
				this.RecordMeasure_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.RecordMeasurement_pop", this.RecordMeasure_oDialog_Controller);
				this.RecordMeasure_oDialog_Controller.createHandler(this.RecordMeasure_oDialog, MainParam, this);  
				this._oView.addDependent(this.RecordMeasure_oDialog);
			}		
		    this.RecordMeasure_oDialog_Controller.set_header(sAufnr, sMityp, sSwerk);
			this.RecordMeasure_oDialog.open();
			this.RecordMeasure_oDialog_Controller.dataSelectProcess();
		},
		
		onClose_recordMeasure : function(){
			this._oView._oContainingView.oParent.closeRecordMeasure();
		},
				
		onOpen_workAssign : function (MainParam, sSwerk, sObj) { 
			this.WorkAssign_oDialog = this._oView.getParent().workAssign.WorkAssign_oDialog;
			if (!this.WorkAssign_oDialog) {
				this.WorkAssign_oDialog_Controller = new WorkAssign(this._oView);  
				this.WorkAssign_oDialog = sap.ui.xmlfragment(this._oView.getId(), "cj.pm0010.view.WorkAssign_pop", this.WorkAssign_oDialog_Controller);
				this.WorkAssign_oDialog_Controller.createHandler(this.WorkAssign_oDialog, MainParam, this);  
				this._oView.addDependent(this.WorkAssign_oDialog);
			}		
			this.WorkAssign_oDialog.open();
			this.WorkAssign_oDialog_Controller.workAssignList(sObj);
		},
		
		onClose_workAssign : function(){
			this._oView._oContainingView.oParent.closeWorkAssign();
		},
				
		check_plant : function(MainParam, plant){
			this.oMainParam = MainParam;
			
			if(!plant){	
				
				sap.m.MessageBox.show(
					this.oMainParam.i18n.getText("noauth"),
					sap.m.MessageBox.Icon.ERROR,
					this.oMainParam.i18n.getText("error")
			    );
				return false;
			}
			return true;
		}
		
	});
});