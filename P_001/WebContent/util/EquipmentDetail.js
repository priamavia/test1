sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"cj/pm0010/util/ValueHelpHelper"
	
],function(Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper) {
	"use strict";
	
	return Object.extend("cj.pm0010.util.EquipmentDetail", { 
		Dailog : [],
		
		constructor: function(oDailog, Main) {
		  this.Dailog = oDailog;
          
          this.oMain = Main;
          
		},
		
		get_equip_data : function(equnr){
			
			var lange = this.oMain.getLanguage();
			var oModel = this.oMain.getView().getModel("equipDetail");
		   // var path = "/EquipDetailSet";
		    
			var controll = this;
		//	var filterStr = "SPRAS eq '"+ lange + "' and EQUNR eq '"+ equnr +"'";
			
			var path = "/EquipDetailSet(SPRAS='" + lange + "',EQUNR='" + equnr + "')";
			
			var mParameters = {
/*			    urlParameters : {
					"$filter" : filterStr
				},*/
				success : function(oData) {
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				// oODataJSONModel.setData(oData.results[0]);
				 oODataJSONModel.setData(oData);
				 
				 controll.Dailog.setModel(oODataJSONModel,"equipDetail");
			
				}.bind(this),
				error : function(oError) {
					jQuery.sap.log.info("Odata Error occured");
					Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		}
		
		
	});
});