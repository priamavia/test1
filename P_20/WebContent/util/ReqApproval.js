sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"cj/pm0110/util/ValueHelpHelper",
	"cj/pm0110/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, Toast, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0110.util.ReqApproval", { 
		Dailog_ra : [],
		arr_swerk_ra : [],
		arr_kostl_ra : [],
		arr_korks_ra : [],
		
		constructor: function(oDailog, Main) {
          this.Dailog_ra = oDailog;
          
          this.oMain = Main;
          this.selAufnr = null;
                  
          this.arr_swerk_ra = this.oMain.arr_swerk;
          this.arr_kostl_ra = this.oMain.arr_kostl;
          this.arr_kokrs_ra = this.oMain.arr_kokrs;
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
                   
		},

		/*
		 * Initial Data Search
		 */
		approvalRequestList : function(sObj){
			
			var controll = this;
					 
			var oModel = this.oMain.getView().getModel("reqApprove");
			var controll = this;

			var lange = this.oMain.getLanguage();
			var s_spras = [];  	
			var s_arbpl = [];
			var s_filter = [];
			
			controll.selAufnr = sObj.Aufnr;

	    	if(lange){
	    		s_spras.push(lange);
				
		    	if(s_spras){
		    		s_filter.push(utils.set_filter(s_spras, "Spras"));
			    }		
	    	}	
	    	
	    	if(sObj.Vaplz){
	    		s_arbpl.push(sObj.Vaplz);
				
		    	if(s_arbpl){
		    		s_filter.push(utils.set_filter(s_arbpl, "Arbpl"));
			    }		
	    	}	
	    	
			var filterStr;
			for(var i=0; i<s_filter.length; i++){
				
				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}
						
			var path = "/InputSet(Zmode='S',Werks='"+sObj.Werks+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
										
				success : function(oData) {
			     var oTable = sap.ui.getCore().byId("table_approval");

				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");
				 				 
				 
				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
					 controll.i18n.getText("oData_conn_error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("error")
				   );
				}.bind(this)
			};
				
		     oModel.read(path, mParameters);
		},
		
		onRowSelect : function(oEvent) {
			var controll = this;
			
			var oTable = sap.ui.getCore().byId("table_approval");
			
			var idx = oTable.getSelectedIndex();
			  
			if (idx !== -1) {	   
			  var cxt = oTable.getContextByIndex(idx); 
			  var path = cxt.sPath;
			  this.obj = oTable.getModel().getProperty(path);			   
				
			  //console.log(this.obj);
			  
			  return this.obj;

			}else{
				sap.m.MessageBox.show(
				  controll.i18n.getText("isnotselected"),
			      sap.m.MessageBox.Icon.WARNING,
			      controll.i18n.getText("warning")
				);							
			}
		},		
		
		onReqApproval : function(sObj){
			
			var oModel = this.oMain.getView().getModel("reqApprove");

			var controll = this;				
			var oTable =  sap.ui.getCore().byId("table_approval");

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oTable.getModel();
			var oData = oTable.getModel().getData();
		
			var data = {};
//		    //Header Info
			data.Aufnr = controll.selAufnr;
			data.Spras = this.oMain.getLanguage();
			data.Werks = oTable.getModel().getData().Werks;
			data.Zid   = oTable.getModel().getData().Zid;
			data.Zmode = 'Q';  // Mode : Q : Request Approval 
			
								
		    data.ResultList = [];
		    
			var item = {};
			item.Arbpl  = sObj.Arbpl;
			item.Chk    = true;
			item.Swerk  = sObj.Swerk;
			item.Zid    = sObj.Zid;
			item.Zname	= sObj.Zname;
			item.Ztitle	= sObj.Ztitle;

			data.ResultList.push(item);

			var mParameters = {
				success : function(oData) {
					
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");
					 
				 if(oData.RetType == "E"){
					 sap.m.MessageBox.show(
						     oData.RetMsg,
							 sap.m.MessageBox.Icon.ERROR,
							 controll.i18n.getText("error")
						);
					 
				 }else{
					 sap.m.MessageBox.show(
						     oData.RetMsg,
							 sap.m.MessageBox.Icon.SUCCESS,
							 controll.i18n.getText("success")
						);					 
				 }	 

				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
					 controll.i18n.getText("oData_conn_error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("error")
				   );
				}.bind(this)
			};
					
			oModel.create("/InputSet", data, mParameters);			
		}

	});
})