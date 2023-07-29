sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
	"cj/pm0010/model/formatter"
], function (Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils, formatter) {
	"use strict";

	return Object.extend("cj.pm0010.controller.EquipmentDetail", {

		formatter : formatter,
		
		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, shMain){
			this.oDialog = oDialog;

			this.oMainParam = MainParam;
			this.shMain = shMain;
			this.oMain.oController.getView().byId("table_file").setVisibleRowCount(1);
		},
		
		onCloseDialog_EquipDetail : function(oEvent){
			this.oDialog.close();
		},
		
        get_equip_data : function(swerk, equnr){
        	
        	this.swerk = swerk;
        	this.equnr = equnr;
			
			var lange = this.oMainParam.getLanguage();
			var oModel = this.oMainParam.getView().getModel("equipDetail");
		    var path = "/EquipDetailSet";
		    
			var controll = this;
		//	var filterStr = "SPRAS eq '"+ lange + "' and EQUNR eq '"+ equnr +"'";
			
//			var path = "/EquipDetailSet(SPRAS='" + lange + "',EQUNR='" + equnr + "')";
			var path = "/EquipDetailSet(SPRAS='EN',EQUNR='" + equnr + "')";
			
			var mParameters = {
/*			    urlParameters : {
					"$filter" : filterStr
				},*/
				success : function(oData) {
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 
				 this.invnr = oData.INVNR;	
				 
				 controll.oDialog.setModel(oODataJSONModel,"equipDetail");
			
				}.bind(this),
				error : function(oError) {
					   sap.m.MessageBox.show(
								 this.oMainParam.i18n.getText("oData_conn_error"),
								 sap.m.MessageBox.Icon.ERROR,
								 this.oMainParam.i18n.getText("error")
							   );						
					//jQuery.sap.log.info("Odata Error occured");
					//Toast.show("Error");

				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},
		
		get_attach_file : function(){
			
			 var oModel = this.oMainParam.getView().getModel("equipDetail");
			 
			 var controll = this;
			 var oFTable = this.oMain.oController.getView().byId("table_file");			 
			 oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			 oModel.attachRequestCompleted(function(){
				 oFTable.setBusy(false);
				 oFTable.setShowNoData(true);
			});
			 
			var doknr = "";
			var dokar = "";
			var objid = "";
			 
			var path = "/InputSet(Swerk='"+this.swerk+"',Equnr='"+ this.equnr +"',Objid='"+ objid +"',Doknr='"+ doknr +"',Dokar='"+ dokar +"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList"
				},
										
				success : function(oData) {

				  var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			      oODataJSONModel.setData(oData);
				 					 				 
				  oFTable.setModel(oODataJSONModel);
			      oFTable.bindRows("/ResultList/results"); 
			      
			      var length = 0;
			      length = oData.ResultList.results.length;
			      if(length == 0){
			    	  length = 1;
			      }
			      oFTable.setVisibleRowCount(length)

				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );	
				}.bind(this)
			};
				
		     oModel.read(path, mParameters);			
			
		},	
		
		onDownload : function(oEvent){
			
			var oFTable = this.oMain.oController.getView().byId("table_file");
			var idx = oEvent.getSource().getParent().getIndex();
			
			var doknr = oFTable.getModel().getData().ResultList.results[idx].Doknr;
			var dokar = oFTable.getModel().getData().ResultList.results[idx].Dokar;
			var objid = oFTable.getModel().getData().ResultList.results[idx].Objid;
						
			var oModel = this.oMainParam.getView().getModel("equipDetail");
			var controll = this;
 
			 oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			 oModel.attachRequestCompleted(function(){
				 oFTable.setBusy(false);
				 oFTable.setShowNoData(true);
			});
			 
			var s_equnr = this.equnr;
			var s_swerk = this.swerk;
					
		    var sPath;
		    
		    debugger;
		    
			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_CM005_SRV/InputSet(Swerk='"+s_swerk+"',Equnr='"+s_equnr+"',Doknr='"+ doknr +"',Dokar='"+ dokar +"',Objid='"+objid + "')/$value";
			} else {	
				sPath = "/sap/opu/odata/sap/ZPM_GW_CM005_SRV/InputSet(Swerk='"+s_swerk+"',Equnr='"+s_equnr+"',Doknr='"+ doknr +"',Dokar='"+ dokar +"',Objid='"+objid + "')/$value";		
		    } 
			
			var html = new sap.ui.core.HTML();
			    
            $(document).ready(function(){
  				window.open(sPath);
  			});	
			
		},
				
		onOpenDialog_Bom : function(){
//			debugger;
			this.oMainParam.renderingSkip = "X";
			this.shMain.onOpen_equipBom(this.oMainParam, this.swerk, this.equnr, this.invnr,"None");
		}		
				
		
	});

});