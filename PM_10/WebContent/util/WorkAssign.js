sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"cj/pm0100/util/ValueHelpHelper",
	"cj/pm0100/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, Toast, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0100.util.WorkAssign", { 
		Dailog_ra : [],
		arr_swerk_ra : [],
		arr_kostl_ra : [],
		arr_korks_ra : [],
		
		constructor: function(oDailog, Main) {
          this.Dailog_ra = oDailog;
          
          this.oMain = Main;
          this.selwerks = null;
          this.selAufnr = null;
          this.selZplhr = null;
          this.selZdate = null;
          this.selArbpl = null;
          
          this.selZid   = null;
                  
          this.arr_swerk_ra = this.oMain.arr_swerk;
          this.arr_kostl_ra = this.oMain.arr_kostl;
          this.arr_kokrs_ra = this.oMain.arr_kokrs;
		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep;              
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
                   
		},

		/*
		 * Initial Data Search
		 */
		workAssignList : function(sObj){
			
			var controll = this;
					 
			var oModel = this.oMain.getView().getModel("workAssign");
			var controll = this;

			var lange = this.oMain.getLanguage();
			var s_arbpl = [];  
			var s_aufnr = [];
			var s_spras = [];  		
			var s_filter = [];
			
			// 부모창에서 선택 된 데이터 설정
			controll.selwerks = sObj.Werks;			// Plant
			controll.selAufnr = sObj.Aufnr;			// Order Number
			controll.selZid   = sObj.Zid;			// Id
			controll.selArbei = sObj.Arbei;			// Plan duration
			controll.selZdate = sObj.Addat;			// Plan Date
			controll.selArbpl = sObj.Vaplz;			// Work Center
			
			
			var createBtn = sap.ui.getCore().byId("assignCreate");
			var changeBtn = sap.ui.getCore().byId("assignChange");
			var deleteBtn = sap.ui.getCore().byId("assignDelete");
			
/*			if(controll.selZid){
				createBtn.setVisible(false);
				changeBtn.setVisible(true);
				deleteBtn.setEnabled(true);
				
			}else{
				createBtn.setVisible(true);
				changeBtn.setVisible(false);
				deleteBtn.setEnabled(false);				
			}*/
			
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
	    	
	    	if(sObj.Aufnr){
	    		s_aufnr.push(sObj.Aufnr);
				
		    	if(s_aufnr){
		    		s_filter.push(utils.set_filter(s_aufnr, "Aufnr"));
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
						
			var path = "/InputSet(Zmode='R',Werks='"+sObj.Werks+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
										
				success : function(oData) {
			     var oTable = sap.ui.getCore().byId("table_assign");

				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");

				 
				for(var i=0; i<oData.ResultList.results.length; i++){
				    var cxt = oTable.getContextByIndex(i); 
				    var path = cxt.sPath;
				    this.obj = oTable.getModel().getProperty(path);

					if(this.obj.Chk){ 
						oTable.addSelectionInterval(i,i);
					}
				}		
				
				if(oTable.getSelectedIndices().length > 0){
					createBtn.setVisible(false);
					changeBtn.setVisible(true);
					deleteBtn.setEnabled(true);
				}else{
					createBtn.setVisible(true);
					changeBtn.setVisible(false);
					deleteBtn.setEnabled(false);		
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
				
		     oModel.read(path, mParameters);
		},
		
	
		onCheckSelect : function(){
			var controll = this;
			var isSelect = false;
			
			var oTable =  sap.ui.getCore().byId("table_assign");
			
			if (oTable.getSelectedIndices().length < 1) {
				sap.m.MessageBox.show(
					controll.i18n.getText("isnotselected"),
					sap.m.MessageBox.Icon.WARNING,
					controll.i18n.getText("warning")
				);					
			}else{
				isSelect = true;				
			}
			
			return isSelect;
		},
		
		onAssignSave : function(){
			
			var oModel = this.oMain.getView().getModel("workAssign");

			var controll = this;				
			var oTable =  sap.ui.getCore().byId("table_assign");

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oTable.getModel();
			var oData = oTable.getModel().getData();
		
			var data = {};
//		    //Header Info
			data.Werks = controll.selwerks;
			data.Aufnr = controll.selAufnr;
			data.Spras = this.oMain.getLanguage();
			data.Zmode = 'S';  // ZMODE => R : Assign Select, S : Save, D : Delete 
					
		    data.ResultList = [];
		    
			
			for(var i=0; i<oTable.getSelectedIndices().length; i++){
				
			    var cxt = oTable.getContextByIndex(oTable.getSelectedIndices()[i]); 
			    var path = cxt.sPath;
			    this.obj = oTable.getModel().getProperty(path);

				var item = {};

		
				item.Chk    = true; 
				item.Swerk  = this.obj.Swerk;
				item.Aufnr  = controll.selAufnr;
				item.Zdate  = controll.selZdate;
				item.Zid    = this.obj.Zid;
				item.Zname  = this.obj.Zname;		
				item.Zplhr  = controll.selArbei;
				
				data.ResultList.push(item);			
			}
						
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
							 controll.i18n.getText("Error")
						);
					 
				 }else{
					for(var i=0; i<oData.ResultList.results.length; i++){
					    var cxt = oTable.getContextByIndex(i); 
					    var path = cxt.sPath;
					    this.obj = oTable.getModel().getProperty(path);

						if(this.obj.Chk){ 
							oTable.addSelectionInterval(i,i);
						}
					}		
					
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
		},
		
		onCheckDelSelect : function(){
			var controll = this;
			var isSelect;
			var chkIndex = 0;
			
			var oTable =  sap.ui.getCore().byId("table_assign");
			
			if (oTable.getSelectedIndices().length < 1) {
				sap.m.MessageBox.show(
					controll.i18n.getText("isnotselected"),
					sap.m.MessageBox.Icon.WARNING,
					controll.i18n.getText("warning")
				);					
			}else{
				for(var i=0; i<oTable.getSelectedIndices().length; i++){
					var cxt = oTable.getContextByIndex(oTable.getSelectedIndices()[i]); 
				    var path = cxt.sPath;
				    this.obj = oTable.getModel().getProperty(path);

					if(this.obj.Chk){ 
						chkIndex++;
					}
				}											
			}
			
			if(chkIndex > 0){
				isSelect = true;	
			}else{
				isSelect = false;	
			}
				
			return isSelect;
		},		

		onAssignDelete : function(){
			
			var oModel = this.oMain.getView().getModel("workAssign");

			var controll = this;				
			var oTable =  sap.ui.getCore().byId("table_assign");

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oTable.getModel();
			var oData = oTable.getModel().getData();
		
			var data = {};
//		    //Header Info
			data.Werks = controll.selwerks;
			data.Aufnr = controll.selAufnr;
			data.Spras = this.oMain.getLanguage();
			data.Zmode = 'D';  // ZMODE => R : Assign Select, S : Save, D : Delete 
					
		    data.ResultList = [];
		    
			
			for(var i=0; i<oTable.getSelectedIndices().length; i++){
				
				var cxt = oTable.getContextByIndex(oTable.getSelectedIndices()[i]); 
			    var path = cxt.sPath;
			    this.obj = oTable.getModel().getProperty(path);

				if(this.obj.Chk){ 
					var item = {};

					item.Chk    = true; 
					item.Swerk  = this.obj.Swerk;
					item.Aufnr  = controll.selAufnr;
					item.Zdate  = controll.selZdate;
					item.Zid    = this.obj.Zid;
					item.Zname  = this.obj.Zname;		
					item.Zplhr  = controll.selArbei;
					
					data.ResultList.push(item);
				}
			}
						
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
					for(var i=0; i<oData.ResultList.results.length; i++){
					    var cxt = oTable.getContextByIndex(i); 
					    var path = cxt.sPath;
					    this.obj = oTable.getModel().getProperty(path);

						if(this.obj.Chk){ 
							oTable.addSelectionInterval(i,i);
						}
					}							 
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