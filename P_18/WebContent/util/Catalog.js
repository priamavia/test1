sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Object, JSONModel, Filter, FilterOperator, Message, Toast) {
	"use strict";
	
	return Object.extend("cj.pm0090.util.Catalog", {
		Dailog : [],
		arr_swerk : [],
		arr_kostl : [],
		arr_korks : [],
		
		constructor: function(oDailog, Main) {
		  this.Dailog = oDailog;

          this.oMain = Main;

          this.arr_swerk = this.oMain.arr_swerk;
          this.arr_kostl = this.oMain.arr_kostl;
          this.arr_kokrs = this.oMain.arr_kokrs;

		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep;
		},
		
		get_catalog_data : function(qkatart, equnr, qmart) {
			
			this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
			var lange = this.oMain.getLanguage();
			
			
			var v_swerk;
			if(this.oMain.param_swerk){
				v_swerk = this.oMain.param_swerk;
			}else{
			    v_swerk = this.oMain.oSwerk.getSelectedKey();	
			}
			
			if(v_swerk.substring(0,1) == "2"){
				lange = "ZH";
			}

			this.oMain.oQkatart = qkatart;
			this.Equnr = equnr;
			this.Qmart = qmart;
			
//			sap.ui.getCore().byId("Qkatart").setValue(qkatart);
//			sap.ui.getCore().byId("Rbnr").setText(this.oMain.oRbnr);

			this.oTree_catalog = sap.ui.getCore().byId("Catalog_tree");
			
//			- Object Part(고장부위)  Damage(고장현상)  Cause(고장원인)  Activity(조치사항) 형태로 호출됨
//			 B: Object Part, C: Damage, 5: Cause, A: Activities
			
			var oTitle = sap.ui.getCore().byId("dialog_catalog");
			//var oCatalogProfileLbl = sap.ui.getCore().byId("catalogProfileLbl");
			var oItemTextLbl       = sap.ui.getCore().byId("itemTextLbl");
			var oSelect            = sap.ui.getCore().byId("select");
			var oAdopt             = sap.ui.getCore().byId("adopt");
			var oText              = sap.ui.getCore().byId("itemTextLbl");
			var oTextinput         = sap.ui.getCore().byId("itemText");
	
			if(qkatart == "B" ){
		        this.catalogSet = [];
				oTitle.setTitle(this.i18n.getText("objectPart")); // {i18n>objectPart}
				//oCatalogProfileLbl.setText(this.i18n.getText("objectPart"));
				oItemTextLbl.setText(this.i18n.getText("itemText"));
				oSelect.setVisible(true);
				oAdopt.setVisible(false);
				oText.setVisible(true);
				oTextinput.setVisible(true);
			}else if(qkatart == "C" ){
				oTitle.setTitle(this.i18n.getText("damage")); // {i18n>damage}
				//oCatalogProfileLbl.setText(this.i18n.getText("damage"));
				oItemTextLbl.setText(this.i18n.getText("itemText"));
				oSelect.setVisible(true);
				oAdopt.setVisible(true);
				oText.setVisible(true);
				oTextinput.setVisible(true);
				oTextinput.setValue(this.Btext);
				this.Btext = "";
			}else if(qkatart == "5" ){
				oTitle.setTitle(this.i18n.getText("cause")); // {i18n>cause}
				//oCatalogProfileLbl.setText(this.i18n.getText("cause"));
				oItemTextLbl.setText(this.i18n.getText("causetext"));
				oSelect.setVisible(true);
				oAdopt.setVisible(true);
				oText.setVisible(true);
				oTextinput.setVisible(true);
			}else if(qkatart == "A" ){
				oTitle.setTitle(this.i18n.getText("activities")); // {i18n>activities}
				//oCatalogProfileLbl.setText(this.i18n.getText("activities"));
				oItemTextLbl.setText(this.i18n.getText("activityText"));
				oSelect.setVisible(false);
				oAdopt.setVisible(true);
				oText.setVisible(true);
				oTextinput.setVisible(true);
			}
						
		    var s_path = "catalog>/CatalogSet";
		    var rows = {
	              path : s_path,
	              filters: [
 	            	  new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, lange),
	            	 // new sap.ui.model.Filter("Rbnr", sap.ui.model.FilterOperator.EQ, this.oMain.oRbnr),
	            	  new sap.ui.model.Filter("Qkatart", sap.ui.model.FilterOperator.EQ, qkatart),
	            	  new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.EQ, this.Equnr),
	            	  new sap.ui.model.Filter("Qmart", sap.ui.model.FilterOperator.EQ, this.Qmart)
	              ],
	              parameters : {
	                 numberOfExpandedLevels : 1,
	              	 treeAnnotationProperties : {
	                     hierarchyLevelFor : 'Level',
	                     hierarchyNodeFor : 'Id',
	                     hierarchyParentNodeFor : 'ParentId',
	                     hierarchyDrillStateFor : 'DrilldownState'
	                 }
	              }
	          };
			 this.oTree_catalog.bindRows(rows);
			
		},
						
		selectCatalog : function(qkatart, mode){
            var s_catalog = [];
            var errChk = false;
            var treeModel =  this.oTree_catalog.getModel("catalog");
			var odata = treeModel.oData;
			
			var selectedIdx = this.oTree_catalog.getSelectedIndices();
			var cnt = selectedIdx.length;

			for(var i=0; i<cnt; i++){
				var path = this.oTree_catalog.getContextByIndex(selectedIdx[i]).getPath().replace("/","");
				var lv_code = treeModel.oData[path].Code;
			    s_catalog.push(treeModel.oData[path].Qkatart,
			    		       treeModel.oData[path].Id,
			    		       treeModel.oData[path].Codet,
			    		       sap.ui.getCore().byId("itemText").getValue(),
			    		       treeModel.oData[path].Codegruppe,
			    		       treeModel.oData[path].Codegruppet
			    		     );
			    if(qkatart == "B"){
			    	this.Btext = sap.ui.getCore().byId("itemText").getValue();
			    }
			    sap.ui.getCore().byId("itemText").setValue("");
			}
			
			if(s_catalog.length === 0){
			  errChk = true;
			
			  	var msgText;
				if(qkatart == "B"){
					msgText = this.oMain.i18n.getText("isObjectSelectedRow");
				}else if(qkatart == "C"){
					msgText = this.oMain.i18n.getText("isDamageSelectedRow");
				}else if(qkatart == "5"){
					msgText = this.oMain.i18n.getText("isCauseSelectedRow");
				}else if(qkatart == "A"){
					msgText = this.oMain.i18n.getText("isActivitySelectedRow");
				}			  	

			  sap.m.MessageBox.show(
			      msgText,
				  sap.m.MessageBox.Icon.ERROR,
				  this.oMain.i18n.getText("error")  //title
			  );
			}else{
				var s_Qkatart;
				if(qkatart == "B"){
					s_Qkatart = "C";
				}else if(qkatart == "C"){
					s_Qkatart = "5";
				}else if(qkatart == "5"){
					s_Qkatart = "A";
				}
				
			    this.catalogSet.push(s_catalog);		
			    if(mode != "E"){
			    	this.get_catalog_data(s_Qkatart, this.Equnr, this.Qmart);
			    }
			}
			return errChk;
		},	
			
		// Select Code
		confirmDialog_sub : function(oEvent){
			
			var qkatart = this.oMain.oQkatart;
			var errChk = this.selectCatalog(qkatart, "");
			if(!errChk){
			}
		},
		
		adoptDialog_Sub : function(oEvent){
			var qkatart = this.oMain.oQkatart;
			var errChk = this.selectCatalog(qkatart, "E");
			if(!errChk){
				this.oMain._oDialog_Catalog.close();
				return this.catalogSet;
			}
		},
		
		cancelDialog_sub : function(oEvent){
			var qkatart = this.oMain.oQkatart;

			this.oMain._oDialog_Catalog.close();
		},
		
		
		
/*************************************************************************
 *  Local function
 **************************************************************************/				
		_getDialog_Catalog_c : function(){
			
			if (!this._oDialog_Catalog_c) {
	            this._oDialog_Catalog_c = sap.ui.xmlfragment("cj.pm0090.view.Catalog_pop", this.oMain);
	            this.oMain.getView().addDependent(this._oDialog_Catalog_c);
	         }

	         return this._oDialog_Catalog_c;
		},
				
		_getDialog_Catalog_5 : function(){
			
			if (!this._oDialog_Catalog_5) {
	            this._oDialog_Catalog_5 = sap.ui.xmlfragment("cj.pm0090.view.Catalog_pop", this.oMain);
	            this.oMain.getView().addDependent(this._oDialog_Catalog_5);      		
	         }

	         return this._oDialog_Catalog_5;
		},		
		
		_getDialog_Catalog_a : function(){
			
			if (!this._oDialog_Catalog_a) {
	            this._oDialog_Catalog_a = sap.ui.xmlfragment("cj.pm0090.view.Catalog_pop", this.oMain);
	            this.oMain.getView().addDependent(this._oDialog_Catalog_a);      		
	         }

	         return this._oDialog_Catalog_a;
		},
		
		_set_filter : function(Obj, Val){
			//(Eqart eq 'M01' or Eqart eq 'M16')
			var str = Val;
			
			for(var i=0; i<Obj.length; i++){
				if(i === 0){
					str = "(";
				}else{
					str = str + " or "
				}
				str = str + Val + " eq '" + Obj[i] + "'";
				
				if(i === Obj.length-1){
					str = str + ")";
				}
			}
		  return str;
		}
	});
});