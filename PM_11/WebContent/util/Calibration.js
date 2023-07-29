sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"cj/pm0120/util/ValueHelpHelper",
	"cj/pm0120/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, Toast, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0120.util.Calibration", { 
		Dailog_cb : [],
		arr_swerk_cb : [],
		arr_kostl_cb : [],
		arr_korks_cb : [],
		
		constructor: function(oDailog, Main) {
          this.Dailog_cb = oDailog;
          
          this.oMain = Main;
          this.sWerks;
                  
          this.arr_swerk_cb = this.oMain.arr_swerk;
          this.arr_kostl_cb = this.oMain.arr_kostl;
          this.arr_kokrs_cb = this.oMain.arr_kokrs;
		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep;           
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
                   
		},
				
		/*
		 * Initial Data Search
		 */
		dataSelectProcess : function(sMode, sObj){
			 var controll = this;
			 
			 this.sWerks = sObj.Werks;
			 this.sEqunr = sObj.Equnr;
			 this.sEqktx = sObj.Eqktx;
			
		     utils.makeSerachHelpHeader(this.oMain);	
		     this._set_search_field();
		    
			 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			 
			 if(sMode == "R"){		// Entry
				 sObj.FileEnable = true;
				 sObj.NotiEnable = true;
			 }else{
				 sObj.FileEnable = false;
				 sObj.NotiEnable = false;				 
			 }
			 
			 oODataJSONModel.setData(sObj);
			 		
			 controll.Dailog_cb.setModel(oODataJSONModel, "header");
			 
		     var addat_cb = sap.ui.getCore().byId("addat_cb");				
		    
		     var Isdd = sap.ui.getCore().byId("Isdd");				
		     var Iedd = sap.ui.getCore().byId("Iedd");
	
		     var lbldt = sap.ui.getCore().byId("lbldt");				
		    
		     addat_cb.setDisplayFormat(this.dateFormat);
		     addat_cb.setValueFormat("yyyyMMdd");
		    
		     Isdd.setDisplayFormat(this.dateFormat);
		     Isdd.setValueFormat("yyyyMMdd");
		    
		     Iedd.setDisplayFormat(this.dateFormat);
		     Iedd.setValueFormat("yyyyMMdd");
		        	
		     lbldt.setDisplayFormat(this.dateFormat);
		     lbldt.setValueFormat("yyyyMMdd");	
			    
			 this.init_data(sMode, sObj);
			 this.get_attach_file(sObj.Aufnr);

		},
		
		init_data : function(sMode, sObj){
			 var oModel = this.oMain.getView().getModel("workResult");
			 var controll = this;
 
			 var oITable = sap.ui.getCore().byId("table_intern");	
			 var oETable = sap.ui.getCore().byId("table_extern");			 
			 oModel.attachRequestSent(function(){
				 oITable.setBusy(true);
				 oETable.setBusy(true);
			 });
			 oModel.attachRequestCompleted(function(){
				 oITable.setBusy(false);
				 oITable.setShowNoData(true);
				 
				 oETable.setBusy(false);
				 oETable.setShowNoData(true);
			 });
					
/*			 var oETable = sap.ui.getCore().byId("table_extern");			 
			 oModel.attachRequestSent(function(){oETable.setBusy(true);});
			 oModel.attachRequestCompleted(function(){
												 oETable.setBusy(false);
												 oETable.setShowNoData(true);
											});	*/		 
			 
			var lange = this.oMain.getLanguage();
			var s_auart = [];   // Order Type
			var s_aufnr = [];   // Order Number			
			var s_steus = [];
			var s_spras = [];
			var s_filter = [];
			
	    	if(sObj.Steus){
	    		s_steus.push(sObj.Steus);
				
		    	if(s_auart){
		    		s_filter.push(utils.set_filter(s_steus, "Steus"));
			    }		
	    	}	
	    	
	    	if(sObj.Auart){
	    		s_auart.push(sObj.Auart);
				
		    	if(s_auart){
		    		s_filter.push(utils.set_filter(s_auart, "Auart"));
			    }		
	    	}		    	

	    	if(lange){
	    		s_spras.push(lange);
				
		    	if(s_spras){
		    		s_filter.push(utils.set_filter(s_spras, "Spras"));
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
						
			var path = "/InputSet(Zmode='"+sMode+"',Werks='"+sObj.Werks+"',Aufnr='"+sObj.Aufnr+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "WorktimeList,WorkresultList",
					"$filter" : filterStr
				},
										
				success : function(oData) {
					var calData = [];

					for (var i=0; i<oData.WorktimeList.results.length; i++) {						 
						calData.Grund = oData.WorktimeList.results[i].Grund;
						calData.Ltxa1 = oData.WorktimeList.results[i].Ltxa1;
						calData.Enable = oData.WorktimeList.results[i].Enable;
						break;
					}							
					
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				     oODataJSONModel.setData(oData);
				     
					 var oCalODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oCalODataJSONModel.setData(calData);
					 		
					 controll.Dailog_cb.setModel(oCalODataJSONModel, "calibration");	
					 
					 				 
				     oITable.setModel(oODataJSONModel);
				     oITable.bindRows("/WorktimeList/results");
					 
				     oETable.setModel(oODataJSONModel);
				     oETable.bindRows("/WorkresultList/results");
					 
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
		
		
		get_attach_file : function(aufnr){
			
			 var oModel = this.oMain.getView().getModel("fileUpload");
			 var controll = this;
 
			 var oFTable = sap.ui.getCore().byId("table_file");			 
			 oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			 oModel.attachRequestCompleted(function(){
				 oFTable.setBusy(false);
				 oFTable.setShowNoData(true);
			});
			 
			var doknr = "";
			 
			var path = "/InputSet(Swerk='"+this.sWerks+"',Aufnr='"+aufnr +"',Doknr='"+ doknr +"',Qmnum='',RequestNo='')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList"
				},
										
				success : function(oData) {

					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				     oODataJSONModel.setData(oData);
					 					 				 
					 oFTable.setModel(oODataJSONModel);
				     oFTable.bindRows("/ResultList/results"); 

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
		

		delete_file : function(doknr){
			   
		    var oModel = this.oMain.getView().getModel("fileUpload");
		    var controll = this;
		 
		    var oFTable = sap.ui.getCore().byId("table_file");    
		    oModel.attachRequestSent(function(){oFTable.setBusy(true);});
		    oModel.attachRequestCompleted(function(){
		     oFTable.setBusy(false);
		     oFTable.setShowNoData(true);
		   });
		    
		   var s_aufnr = sap.ui.getCore().byId("aufnr_cb").getValue();
		    
		   var path = "/InputSet(Swerk='"+this.sWerks+"',Aufnr='"+ s_aufnr +"',Doknr='"+ doknr +"',Qmnum='',RequestNo='')";
		   var filterStr = "Mode eq 'D'";
		   
		   var mParameters = {
		    urlParameters : {
		     "$expand" : "ResultList",
		     "$filter" : filterStr
		    },
		          
		    success : function(oData) {
		     
		      if(oData.RetType == "E"){
		       var message = "";
		       message = oData.RetMsg;
		       sap.m.MessageBox.show(
		         message,
		         sap.m.MessageBox.Icon.ERROR,
		         controll.i18n.getText("error")
		       );
		      }else{  
		       sap.m.MessageBox.show(
		         controll.i18n.getText("fileDeleted"),
		         sap.m.MessageBox.Icon.SUCCESS,
		         controll.i18n.getText("sucess")
		       );
		      }

		      var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
		         oODataJSONModel.setData(oData);
		                  
		      oFTable.setModel(oODataJSONModel);
		         oFTable.bindRows("/ResultList/results");      

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
				
		
		download_file : function(doknr){
			
			 var oModel = this.oMain.getView().getModel("fileUpload");
			 var controll = this;
 
			 var oFTable = sap.ui.getCore().byId("table_file");			 
			 oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			 oModel.attachRequestCompleted(function(){
				 oFTable.setBusy(false);
				 oFTable.setShowNoData(true);
			});
			 
			var s_aufnr = sap.ui.getCore().byId("aufnr_cb").getValue();
					
		    var sPath;
		    
		    debugger;
    	
			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+this.sWerks+"',Aufnr='"+ s_aufnr +"',Doknr='"+ doknr +"',Qmnum='',RequestNo='')/$value";
			} else {	
				sPath = "/sap/opu/odata/sap/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+this.sWerks+"',Aufnr='"+ s_aufnr +"',Doknr='"+ doknr +"',Qmnum='',RequestNo='')/$value";				
		    } 
			
			var html = new sap.ui.core.HTML();
			    
            $(document).ready(function(){
  				window.open(sPath);
  			});	
		},
		
		
		/* 
		 * PM Possible Entry Odata Set 
		 */	
		_set_search_field : function() {
			this.oGrd = sap.ui.getCore().byId("Grund");
			this.oGrd.removeAllItems();
			if(this.oGrd){
				utils.set_search_field(this.sWerks, this.oGrd, "cal", "C", "", "");
			}							
		},
		
		checkMandatory : function(){
			var controll = this;
			var errCnt   = 0;
			
     		var oITable =  sap.ui.getCore().byId("table_intern");
			var oETable =  sap.ui.getCore().byId("table_extern");
			
			var oData = oITable.getModel().getData();	
			
			 for (var i=0; i<oData.WorktimeList.results.length; i++) {
				 if(oData.WorktimeList.results[i].Isdd == "" || oData.WorktimeList.results[i].Isdd == "00000000"){
					 oData.WorktimeList.results[i].IsddValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorktimeList.results[i].IsddValSt = 'None';
				 }
				  
				 if(oData.WorktimeList.results[i].Isdz == "" || oData.WorktimeList.results[i].Isdz == "000000"){
					 oData.WorktimeList.results[i].IsdzValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorktimeList.results[i].IsdzValSt = 'None';
				 }
				 
				 if(oData.WorktimeList.results[i].Iedd == "" || oData.WorktimeList.results[i].Iedd == "00000000"){
					 oData.WorktimeList.results[i].IeddValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorktimeList.results[i].IeddValSt = 'None';
				 }
				 
				 if(oData.WorktimeList.results[i].Iedz == "" || oData.WorktimeList.results[i].Iedz == "000000"){
					 oData.WorktimeList.results[i].IedzValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorktimeList.results[i].IedzValSt = 'None';
				 }		
				 
				 if(oData.WorktimeList.results[i].Ismnw == ""){
					 oData.WorktimeList.results[i].IsmnwValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorktimeList.results[i].IsmnwValSt = 'None';
				 }					 
				 				 
			}	
			 
			 for (var i=0; i<oData.WorkresultList.results.length; i++) {			 
				 if (oData.WorkresultList.results[i].Menge == ""){
					 oData.WorkresultList.results[i].MengeValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorkresultList.results[i].MengeValSt = 'None';
				 }
				 if (oData.WorkresultList.results[i].Lbldt == ""){
					 oData.WorkresultList.results[i].LbldtValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorkresultList.results[i].LbldtValSt = 'None';
				 }
				 
				 if (oData.WorkresultList.results[i].Bktxt == ""){
					 oData.WorkresultList.results[i].BktxtValSt = 'Error';
					 errCnt++;
				 }else{
					 oData.WorkresultList.results[i].BktxtValSt = 'None';
				 }
				 
			 }	
			 
			var sGrund = sap.ui.getCore().byId("Grund");
			if(sGrund.getSelectedKey() == "" ){
				sGrund.setValueState('Error');
				 errCnt++;				
			}else{
				sGrund.setValueState('None');
			}
			 
			if(errCnt > 0){
				oITable.getModel().refresh();

				return false;				
			}else{
				return true;
			}
		},		
		
		dataUpdateProcess : function(sMode){
			var controll = this;
			
			var result = this.checkMandatory();
			if(result){
				   this.dataUpdate(sMode);	
			}else{
			 sap.m.MessageBox.show(
					 controll.i18n.getText("check_mandatory"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("Error")
				);	
			 				 
			}	
		},
		
		dataUpdate : function(sMode){
			var oModel = this.oMain.getView().getModel("workResult");
			var controll = this;				
			var oITable =  sap.ui.getCore().byId("table_intern");
			var oETable =  sap.ui.getCore().byId("table_extern");
			
			var chkIndex = 0;
//			for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
//				if(oTable.getModel().getData().ResultList.results[i].Mdocmx == true &&
//				   (oTable.getModel().getData().ResultList.results[i].Recdc != null || 
//				   oTable.getModel().getData().ResultList.results[i].Vlcod != null)){
//					chkIndex++;
//				}
//			}
//			
//			if (sOkCode == 'S' && chkIndex < 1) {
//				Toast.show("Enter a value in the Valu or Valuation field for the measurement data.");
//				return;
//			}
//			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oITable.getModel();
			var oData = oITable.getModel().getData();
		
			var data = {};
			data.Auart  = oData.Auart;
			data.Aufnr  = oData.Aufnr;
			data.Spras  = oData.Spras;
			data.Steus  = oData.Steus;
			data.Werks  = oData.Werks;
			data.Zmode  = sMode;

		    data.WorktimeList = [];
				
			for(var i=0; i<oData.WorktimeList.results.length; i++){
				var timeItem = {};
				timeItem.Arbpl  = oData.WorktimeList.results[i].Arbpl;
				timeItem.Aueru  = oData.WorktimeList.results[i].Aueru;
				timeItem.Enable = oData.WorktimeList.results[i].Enable;
				timeItem.Grund  = sap.ui.getCore().byId("Grund").getSelectedKey();	//oData.WorktimeList.results[i].Grund;
				timeItem.Idaue  = oData.WorktimeList.results[i].Idaue;
				timeItem.Idaur  = oData.WorktimeList.results[i].Idaur.toString();
				timeItem.Iedd   = oData.WorktimeList.results[i].Iedd;
				timeItem.Iedz   = oData.WorktimeList.results[i].Iedz;
				timeItem.Isdd   = oData.WorktimeList.results[i].Isdd;
				timeItem.Isdz   = oData.WorktimeList.results[i].Isdz;
				timeItem.Ismne  = oData.WorktimeList.results[i].Ismne;
				timeItem.Ismnw  = oData.WorktimeList.results[i].Ismnw;
				timeItem.Ltxa1  = sap.ui.getCore().byId("ltxa1").getValue();	//oData.WorktimeList.results[i].Ltxa1;
				timeItem.Rueck  = oData.WorktimeList.results[i].Rueck;
				timeItem.Vornr  = oData.WorktimeList.results[i].Vornr;
				timeItem.Zdate  = oData.WorktimeList.results[i].Zdate;
				timeItem.Zid    = oData.WorktimeList.results[i].Zid;
				timeItem.Zname  = oData.WorktimeList.results[i].Zname;
							
				data.WorktimeList.push(timeItem);
		    }
			
			data.WorkresultList = [];
			
			for(var i=0; i<oData.WorkresultList.results.length; i++){
				var resultItem = {};
				resultItem.Banfn   = oData.WorkresultList.results[i].Banfn;
				resultItem.Ebeln   = oData.WorkresultList.results[i].Ebeln;
				resultItem.Lifnr   = oData.WorkresultList.results[i].Lifnr;
				resultItem.Name1   = oData.WorkresultList.results[i].Name1;
				resultItem.Aedat   = oData.WorkresultList.results[i].Aedat;
				resultItem.Netpr   = oData.WorkresultList.results[i].Netpr;
				resultItem.Waers   = oData.WorkresultList.results[i].Waers;
				resultItem.Menge   = oData.WorkresultList.results[i].Menge;
				resultItem.Meins   = oData.WorkresultList.results[i].Meins;
				resultItem.Mengev  = oData.WorkresultList.results[i].Mengev;
				resultItem.BaseUom = oData.WorkresultList.results[i].BaseUom;
				resultItem.Lbldt   = oData.WorkresultList.results[i].Lbldt;
				resultItem.Bktxt   = oData.WorkresultList.results[i].Bktxt;

				data.WorkresultList.push(resultItem);
		    }
			
			var mParameters = {
				success : function(oData) {
					
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
					 
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
		},
		
		createNoti : function(sMode){
			// Step 1: Get Service for app to app navigation
			var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
			// Step 2: Navigate using your semantic object

			var hash = navigationService.hrefForExternal({
			  target: {semanticObject : 'ZPM_SO_0090', action: 'display'},
			  params: {param_mode: 'C',
				  	   param_swerk: this.sWerks,
				       param_equnr: this.sEqunr,
				       param_eqktx: this.sEqktx  }
			});

			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);			
		},
		
		onFinish : function(oEvent){			
			var oDP = oEvent.oSource.getProperty("selected");
			
			var oModel = this.oMain.getView().getModel("workResult");
			var controll = this;				
			var oITable =  sap.ui.getCore().byId("table_intern");
						 
			var tableModel = oITable.getModel();
			var oData = oITable.getModel().getData();
			
			if(oDP){
				for(var i=0; i<oData.WorktimeList.results.length; i++){
					oData.WorktimeList.results[i].Aueru = oDP;
			    }				
			}else{
				for(var i=0; i<oData.WorktimeList.results.length; i++){
					oData.WorktimeList.results[i].Aueru = oDP;
			    }				
			}
			
			oITable.getModel().refresh();
		},
		
		

	});
})