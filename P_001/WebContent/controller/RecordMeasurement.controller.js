sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
	"cj/pm0010/model/formatter"	
], function (Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper, utils, formatter ) {
	"use strict";

	return Object.extend("cj.pm0010.controller.RecordMeasurement", {
		formatter: formatter,

		constructor : function (oView) {
			
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, shMain){
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.shMain = shMain;

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;   
	        
			this.locDate    = MainParam.locDate;
			this.locTime    = MainParam.locTime;
			this.dateFormat = MainParam.dateFormat;
			this.sep        = MainParam.sep;
			
			var idate = this.oMain.oController.getView().byId("idate");
			var Idate = this.oMain.oController.getView().byId("Idate");
						
			idate.setDisplayFormat(this.dateFormat);
			idate.setValueFormat("yyyyMMdd");
			
			Idate.setDisplayFormat(this.dateFormat);
			Idate.setValueFormat("yyyyMMdd");
		},
		
		set_header : function(sAufnr, sMityp, sSwerk){
			this.i18n = this.oMain.oController.getView().getModel("i18n").getResourceBundle();
			this.selAufnr = sAufnr;
			this.selMityp = sMityp;
			this.selSwerk = sSwerk;
		},
		
		dataSelectProcess : function(){	
			var oModel = this.oMain.oController.getView().getModel("recodeMeasure");
			var controll = this;

		    var oTable = this.oMain.oController.getView().byId("table_rm");
	     
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});
				
			var lange = this.oMainParam.getLanguage();
			var s_okcode = [];         //okcode
			var s_mityp =  [];   
			var s_filter = [];
			var filterStr= "";
						
	        if(this.selMityp){
	          s_mityp.push(this.selMityp);

	            if(s_mityp){
	              s_filter.push(utils.set_filter(s_mityp, "Mityp"));
	            }
	        }
	        
			for(var i=0; i<s_filter.length; i++){
				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}
						
			var path = "/InputSet(Spras='"+lange+"',Aufnr='"+this.selAufnr+"',Swerk='"+this.selSwerk+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList/ListDeep",
					"$filter" : filterStr
				},
										
				success : function(oData) {			     
			     //debugger;
			     
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);

				 oData.Ernam = this.oMainParam.getLoginId();
				 
				 this.oDialog.setModel(oODataJSONModel, "header");
				 
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");
				 this.viewElemControl(oData.Zmode, oData.Iphas);
					 
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
			
		dataUpdateProcess : function(sOkCode){
			var oModel = this.oMain.oController.getView().getModel("recodeMeasure");
			var controll = this;				
			var oTable = this.oMain.oController.getView().byId("table_rm");
			var oCheckbox = this.oMain.oController.getView().byId("chkall");
					
			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});

			var chkIndex = 0;
			var errCnt   = 0;
				
			//debugger;
			for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
				if(oTable.getModel().getData().ResultList.results[i].Mdocmx == true){
					if(oTable.getModel().getData().ResultList.results[i].Recdc != "" && 
				       oTable.getModel().getData().ResultList.results[i].Recdc != null){  // Value 값이 있을 경우,
						
						if(oTable.getModel().getData().ResultList.results[i].ListDeep.results.length > 0){
							if(oTable.getModel().getData().ResultList.results[i].Vlcod == "" || 
							   oTable.getModel().getData().ResultList.results[i].Vlcod == null){
								
								oTable.getModel().getData().ResultList.results[i].VlcodValSt = 'Error';
								errCnt++;
							}else{
								oTable.getModel().getData().ResultList.results[i].VlcodValSt = 'None';						
							}
						}
	
						if(oTable.getModel().getData().ResultList.results[i].Idate == "" || 
						   oTable.getModel().getData().ResultList.results[i].Idate == null || 
						   oTable.getModel().getData().ResultList.results[i].IdateValSt == 'Error'){
							oTable.getModel().getData().ResultList.results[i].IdateValSt = 'Error';
							errCnt++;
						}else{
							oTable.getModel().getData().ResultList.results[i].IdateValSt = 'None';
						}
							
						if(oTable.getModel().getData().ResultList.results[i].Itime == "000000" || 
						   oTable.getModel().getData().ResultList.results[i].Itime == null){
							oTable.getModel().getData().ResultList.results[i].ItimeValSt = 'Error';
							errCnt++;
						}else{
							oTable.getModel().getData().ResultList.results[i].ItimeValSt = 'None';
						}		
							
						if(oTable.getModel().getData().ResultList.results[i].Ernam == "" || 
						   oTable.getModel().getData().ResultList.results[i].Ernam == null){
							oTable.getModel().getData().ResultList.results[i].ErnamValSt = 'Error';
							errCnt++;
						}else{
							oTable.getModel().getData().ResultList.results[i].ErnamValSt = 'None';
						}										
					}
				}
			}
		
			if(errCnt > 0){
				oTable.getModel().refresh();
				
				 sap.m.MessageBox.show(
						 this.oMainParam.i18n.getText("validation"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.oMainParam.i18n.getText("Error")
					);	
				 return;				
			}
			
			for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
				if(oTable.getModel().getData().ResultList.results[i].Mdocmx == true){
					if (oTable.getModel().getData().ResultList.results[i].Recdc != "" && 
						oTable.getModel().getData().ResultList.results[i].Recdc != null){ 			// Valuation
							chkIndex++;
					}
				} 
			}			

			if (sOkCode == 'S' && chkIndex < 1) {
				 sap.m.MessageBox.show(
						 this.oMainParam.i18n.getText("saveCheck"),
						 sap.m.MessageBox.Icon.INFORMATION,
						 this.oMainParam.i18n.getText("Error")
					);					 			 
				 return;
			}
			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oTable.getModel();
			var oData = oTable.getModel().getData();
		
			var data = {};

			data.Aufnr  = oTable.getModel().getData().Aufnr;
			data.Swerk  = this.selSwerk;
		    data.Okcode = sOkCode;
		    data.Mityp  = oTable.getModel().getData().Mityp;
		    data.Spras  = oTable.getModel().getData().Spras;
		    //Header Info
		    data.Zmode  = oTable.getModel().getData().Zmode;
		    data.Auart  = oTable.getModel().getData().Auart;
		    data.Auartt = oTable.getModel().getData().Auartt;		    
		    data.Txt    = oTable.getModel().getData().Txt;
		    data.Arbpl  = oTable.getModel().getData().Arbpl;
		    data.Iphas  = oTable.getModel().getData().Iphas;
		    data.Iphast = oTable.getModel().getData().Iphast;
		    data.Ilart  = oTable.getModel().getData().Ilart;
		    data.Ilatx  = oTable.getModel().getData().Ilatx;
		    data.Ktext  = oTable.getModel().getData().Ktext;
		    data.Equnr  = oTable.getModel().getData().Equnr;		    
		    data.Invnr  = oTable.getModel().getData().Invnr;
		    data.Objnr  = oTable.getModel().getData().Objnr;
		    data.Idate  = oTable.getModel().getData().Idate;
		    data.Itime  = oTable.getModel().getData().Itime;
		    data.Ernam  = oTable.getModel().getData().Ernam;
		    	    	    	    
		    data.ResultList = [];
			//data.HeaderItem = odata.HeaderItem.results;
				
			for(var i=0; i<oData.ResultList.results.length; i++){
				
				if(oTable.getModel().getData().ResultList.results[i].Mdocmx == true &&
				   (oTable.getModel().getData().ResultList.results[i].Recdc != "" && 
				    oTable.getModel().getData().ResultList.results[i].Recdc != null)){ 			// Valuation
	
					var item = {};
										
					item.Point  = oData.ResultList.results[i].Point;
					item.Psort  = oData.ResultList.results[i].Psort;
					item.Pttxt  = oData.ResultList.results[i].Pttxt;
					item.Atinn  = oData.ResultList.results[i].Atinn;
					item.Mrmax  = oData.ResultList.results[i].Mrmax;
					item.Mrmaxi = oData.ResultList.results[i].Mrmaxi;
					item.Desir  = oData.ResultList.results[i].Desir;
					item.Desiri = oData.ResultList.results[i].Desiri;
					item.Mrmin  = oData.ResultList.results[i].Mrmin;
					item.Mrmini = oData.ResultList.results[i].Mrmini;
					item.Mrmac  = oData.ResultList.results[i].Mrmac;
					item.Desic  = oData.ResultList.results[i].Desic;
					item.Mrmic  = oData.ResultList.results[i].Mrmic;
					item.Expon  = oData.ResultList.results[i].Expon;
					item.Decim  = oData.ResultList.results[i].Decim;
					item.Recdv  = oData.ResultList.results[i].Recdv;
					item.Recdvi = oData.ResultList.results[i].Recdvi;
					item.Recdu  = oData.ResultList.results[i].Recdu;
					item.Recdc  = oData.ResultList.results[i].Recdc;
					item.Mrngu  = oData.ResultList.results[i].Mrngu;
					item.Mseh6  = oData.ResultList.results[i].Mseh6;
					item.Codct  = oData.ResultList.results[i].Codct;
					item.Codgr  = oData.ResultList.results[i].Codgr;
					item.Vlcod  = oData.ResultList.results[i].Vlcod;
					item.Kurztext = oData.ResultList.results[i].Kurztext;
					item.Ernam  = oData.ResultList.results[i].Ernam;
					item.Idate  = oData.ResultList.results[i].Idate;
					item.Itime  = oData.ResultList.results[i].Itime;
					debugger;
					item.Vlcodx = oData.ResultList.results[i].Vlcodx;
					item.Atinnx = oData.ResultList.results[i].Atinnx;
					item.Mdocm  = oData.ResultList.results[i].Mdocm;
					item.Mdocmx  = oData.ResultList.results[i].Mdocmx;
					item.ListDeep = [];
					data.ResultList.push(item);
					
				}							
		    }
			
			var mParameters = {
				success : function(oData) {
				
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
					 
				 if(oData.RetType == "E"){
					 sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("measurementDocSaveError"), //oData.RetMsg,
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("Error")
						);
					 
				 }else{
					 
					 sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("measurementDocSaveSuccess"), //oData.RetMsg,
							 sap.m.MessageBox.Icon.SUCCESS,
							 this.oMainParam.i18n.getText("Success")
						);	

					 this.dataSelectProcess();							 

					 if(oData.WorkResult === "X"){
						 //this.onCloseMeasureDialog();
						 
						 var sObj = {};
						 sObj.Stat   = oData.Stat;
						 sObj.Werks  = oData.Werks;
						 sObj.Aufnr  = oData.Aufnr;
						 sObj.Auart  = oData.Auart;
						 sObj.Equnr  = oData.Equnr;
						 sObj.Vaplz  = oData.Vaplz;
						 sObj.Qmart  = oData.Qmart;
						 sObj.Qmnum  = oData.Qmnum;
						 sObj.Zbmind = oData.Zbmind;
						 sObj.Zid    = oData.Zid;
						 sObj.Addat  = oData.Addat;
						 sObj.Ktext  = oData.Ktext;
						 sObj.Eqktx  = oData.Eqktx;
						 sObj.Qmdat  = oData.Qmdat;
						 sObj.Zname  = oData.Zname;
						 
						 debugger;	 
						 this.oMainParam.open_wkresult(sObj);		
					 }
					 
					 
				 }	 

				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );	
				}.bind(this)
			};

			oModel.create("/InputSet", data, mParameters);				
		},
		
		viewElemControl : function(sMode, sIphas){
			//var confirmBtn  = this.oMain.oController.getView().byId("confirmMeasure");
			//var canelTecBtn = this.oMain.oController.getView().byId("cancelMeasure");
			var saveBtn     = this.oMain.oController.getView().byId("saveMeasure");
			var cancelBtn     = this.oMain.oController.getView().byId("cancel");
			
			if(sMode == "C" || sMode == "U"){  //Complete, Save, Cancel = Active 
				//confirmBtn.setEnabled(true);
				//canelTecBtn.setEnabled(false);
				saveBtn.setEnabled(true);
				cancelBtn.setEnabled(true);
			
			}else if(sMode == "R"){		// IPHAS = 6, Cancel = active ; 
				if(sIphas == "6"){
					//confirmBtn.setEnabled(false);
					//canelTecBtn.setEnabled(false);
					saveBtn.setEnabled(false);
					cancelBtn.setEnabled(true);
				}else if(sIphas == "3"){	//  IPHAS = 3, Cancel, Cancel Technical completion = Active
					//confirmBtn.setEnabled(false);
					////canelTecBtn.setEnabled(true);
					//canelTecBtn.setEnabled(false); // 임시 수정
					saveBtn.setEnabled(false);
					cancelBtn.setEnabled(true);
				}
			}
		},	
		
	      onSelectApply : function(oEvent){
              var oTable =  this.oMain.oController.getView().byId("table_rm");

	    	  if(oEvent.getParameters().selected){
	            for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
	              if (oTable.getModel().getData().ResultList.results[i].Mdocmx == true){
	                oTable.getModel().getData().ResultList.results[i].Ernam = oTable.getModel().getData().Ernam;
	                oTable.getModel().getData().ResultList.results[i].Idate = oTable.getModel().getData().Idate;
	                oTable.getModel().getData().ResultList.results[i].Itime = oTable.getModel().getData().Itime;
	                
	                oTable.getModel().getData().ResultList.results[i].IdateValSt = 'None';
					oTable.getModel().getData().ResultList.results[i].ItimeValSt = 'None';
					oTable.getModel().getData().ResultList.results[i].ErnamValSt = 'None';	                
	              }
	            }
	          }else{
	            for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
		              if (oTable.getModel().getData().ResultList.results[i].Mdocmx == true){
		                oTable.getModel().getData().ResultList.results[i].Ernam = "";
		                oTable.getModel().getData().ResultList.results[i].Idate = "";
		                oTable.getModel().getData().ResultList.results[i].Itime = "";
		              }
		            }	        	  
	          }
    	  
             var oODataJSONModel =  new sap.ui.model.json.JSONModel();
             oODataJSONModel.setData(oTable.getModel().oData);

             oTable.setModel(oODataJSONModel);
             //oTable.bindRows("/ResultList/results");	    	  
	        },
	        
	        OnRecdvChange_rm : function(oEvent){
        		var oTable =  this.oMain.oController.getView().byId("table_rm");
				var idx = oEvent.getSource().oParent.getIndex();
				var rows = oTable.getModel().oData.ResultList.results[idx];

        		//debugger;

	        	if(jQuery.isNumeric( oEvent.getParameters().value )){
	        		
					var min = parseFloat(rows.Mrmic);
					var max = parseFloat(rows.Mrmac);
					var val = parseFloat(oEvent.getParameters().value);
					
					//var oElement = oEvent.getParameter("element");
					
					if(min > val ||  max < val ){
						rows.RecdcValSt = "Error";
						rows.ValueStateText = " "; 
						rows.Vlcod = '02';
					}else{
						rows.RecdcValSt = "None";
						rows.Vlcod = '01';
						//oElement.setValueState("sap.ui.core.ValueState.None");
					}
	        	}else{
					rows.RecdcValSt = "Error";	        		
	        	}	
	        	
	        	oTable.getModel().refresh();
					
	        },
	        
			//cancel
			onCloseMeasureDialog : function(oEvent){
				this.oDialog.close();
//				this.shMain.RecordMeasure_oDialog.destroy();
//		    	this.shMain.RecordMeasure_oDialog = "";
//		    	this.shMain.RecordMeasure_oDialog_Controller.destroy();
//		    	this.shMain.RecordMeasure_oDialog_Controller = "";				
			},
			
			onConfirmMeasureDialog : function(oEvent){   // 기능 변경 예정
				this.dataUpdateProcess("T");
			},			

			onCancelMeasureDialog : function(oEvent){   // 기능 변경 예정
				this.dataUpdateProcess("C");
			},		
			
			onSaveMeasureDialog : function(oEvent){
				this.dataUpdateProcess("S");
			},	
			
			onReverseMeasureDialog : function(){
				var controll = this;
				var sObj = this.onRowSelect();	
				
				if(sObj.Mdocm){
					var oModel = this.oMain.oController.getView().getModel("recodeMeasure");
					var oTable = this.oMain.oController.getView().byId("table_rm");
							
					oModel.attachRequestSent(function(){oTable.setBusy(true);});
					oModel.attachRequestCompleted(function(){
															oTable.setBusy(false);
															oTable.setShowNoData(true);
														});
				
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					oODataJSONModel.setData();
					 
					var tableModel = new sap.ui.model.json.JSONModel();
					tableModel = oTable.getModel();
					var oData = oTable.getModel().getData();
				
					var data = {};

					data.Aufnr  = oTable.getModel().getData().Aufnr;
					data.Swerk  = this.selSwerk;
				    data.Okcode = 'R'; // reverse
				    data.Mityp  = oTable.getModel().getData().Mityp;
				    data.Spras  = oTable.getModel().getData().Spras;
				    //Header Info
				    data.Zmode  = oTable.getModel().getData().Zmode;
				    data.Auart  = oTable.getModel().getData().Auart;
				    data.Auartt = oTable.getModel().getData().Auartt;		    
				    data.Txt    = oTable.getModel().getData().Txt;
				    data.Arbpl  = oTable.getModel().getData().Arbpl;
				    data.Iphas  = oTable.getModel().getData().Iphas;
				    data.Iphast = oTable.getModel().getData().Iphast;
				    data.Ilart  = oTable.getModel().getData().Ilart;
				    data.Ilatx  = oTable.getModel().getData().Ilatx;
				    data.Ktext  = oTable.getModel().getData().Ktext;
				    data.Equnr  = oTable.getModel().getData().Equnr;		    
				    data.Invnr  = oTable.getModel().getData().Invnr;
				    data.Objnr  = oTable.getModel().getData().Objnr;
				    data.Idate  = oTable.getModel().getData().Idate;
				    data.Itime  = oTable.getModel().getData().Itime;
				    data.Ernam  = oTable.getModel().getData().Ernam;
				    	    	    	    
				    data.ResultList = [];
					//data.HeaderItem = odata.HeaderItem.results;
					var item = {};
										
					item.Point  = sObj.Point;
					item.Psort  = sObj.Psort;
					item.Pttxt  = sObj.Pttxt;
					item.Atinn  = sObj.Atinn;
					item.Mrmax  = sObj.Mrmax;
					item.Mrmaxi = sObj.Mrmaxi;
					item.Desir  = sObj.Desir;
					item.Desiri = sObj.Desiri;
					item.Mrmin  = sObj.Mrmin;
					item.Mrmini = sObj.Mrmini;
					item.Mrmac  = sObj.Mrmac;
					item.Desic  = sObj.Desic;
					item.Mrmic  = sObj.Mrmic;
					item.Expon  = sObj.Expon;
					item.Decim  = sObj.Decim;
					item.Recdv  = sObj.Recdv;
					item.Recdvi = sObj.Recdvi;
					item.Recdu  = sObj.Recdu;
					item.Recdc  = sObj.Recdc;
					item.Mrngu  = sObj.Mrngu;
					item.Mseh6  = sObj.Mseh6;
					item.Codct  = sObj.Codct;
					item.Codgr  = sObj.Codgr;
					item.Vlcod  = sObj.Vlcod;
					item.Kurztext = sObj.Kurztext;
					item.Ernam  = sObj.Ernam;
					item.Idate  = sObj.Idate;
					item.Itime  = sObj.Itime;
					item.Vlcodx = sObj.Vlcodx;
					item.Atinnx = sObj.Atinnx;
					item.Mdocm  = sObj.Mdocm;
					item.Mdocmx  = sObj.Mdocmx;
					item.ListDeep = [];
					data.ResultList.push(item);
							
					var mParameters = {
						success : function(oData) {
						
						 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						 oODataJSONModel.setData(oData);
							 
						 if(oData.RetType == "E"){
							 sap.m.MessageBox.show(
									 this.oMainParam.i18n.getText("measurementDocReverseError"), //oData.RetMsg,
									 sap.m.MessageBox.Icon.ERROR,
									 this.oMainParam.i18n.getText("Error")
								);
							 
						 }else{
							 
							 sap.m.MessageBox.show(
									 this.oMainParam.i18n.getText("measurementDocReverseSuccess"), //oData.RetMsg,
									 sap.m.MessageBox.Icon.SUCCESS,
									 this.oMainParam.i18n.getText("Success")
								);	

							 this.dataSelectProcess();							 						 
							 
						 }	 

						}.bind(this),
						error : function() {
						   sap.m.MessageBox.show(
									 this.oMainParam.i18n.getText("oData_conn_error"),
									 sap.m.MessageBox.Icon.ERROR,
									 this.oMainParam.i18n.getText("error")
								   );	
						}.bind(this)
					};

					oModel.create("/InputSet", data, mParameters);						
					
				}else{
					sap.m.MessageBox.show(
							  this.oMainParam.i18n.getText("noMeasDocMessage"),
						      sap.m.MessageBox.Icon.WARNING,
						      this.oMainParam.i18n.getText("warning")
							);							
				}
				

			},
			onWorkResulteDialog : function(){
				this.oMainParam.onPress_wkresult();
			},			
		
			onChangVlcod : function(oEvent){
				var oTable = this.oMain.oController.getView().byId("table_rm");
				var idx = oEvent.getSource().getParent().getIndex();
							
				if(oEvent.getParameters().value){
					oTable.getModel().getData().ResultList.results[idx].VlcodValSt = 'None';
					oTable.getModel().refresh();					
				}
			},
			

			onRowSelect : function(oEvent) {
				var oTable =  this.oMain.oController.getView().byId("table_rm");
		        
				var idx = oTable.getSelectedIndex();
				  
				if (idx !== -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  var path = cxt.sPath;
				  this.obj = oTable.getModel().getProperty(path);

				  return this.obj;
				}else{
					sap.m.MessageBox.show(
					  this.oMainParam.i18n.getText("isnotselected"),
				      sap.m.MessageBox.Icon.WARNING,
				      this.oMainParam.i18n.getText("warning")
					);
				}
			},	
				
			handleChangeIdate : function(oEvent){
//				debugger;
				var oTable = this.oMain.oController.getView().byId("table_rm");
				var idx = oEvent.getSource().getParent().getIndex();
				
//				if(oEvent.getParameters().value){
//					oTable.getModel().getData().ResultList.results[idx].IdateValSt = 'None';
//					oTable.getModel().refresh();
//				}
				
//				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oTable.getModel().getData().ResultList.results[idx].IdateValSt = 'None';
				} else {
					oTable.getModel().getData().ResultList.results[idx].IdateValSt = 'Error';
				}
				
				oTable.getModel().refresh();				
			},
			
			handleChangeItime : function(oEvent){
				//debugger;
				var oTable = this.oMain.oController.getView().byId("table_rm");
				var idx = oEvent.getSource().getParent().getIndex();
				
				if(oEvent.getParameters().value){
					oTable.getModel().getData().ResultList.results[idx].ItimeValSt = 'None';
					oTable.getModel().refresh();
				}
			},
			
			onChangErnam : function(oEvent){
				//debugger;
				var oTable = this.oMain.oController.getView().byId("table_rm");
				var idx = oEvent.getSource().getParent().getIndex();
				
				if(oEvent.getParameters().value){
					oTable.getModel().getData().ResultList.results[idx].ErnamValSt = 'None';
					oTable.getModel().refresh();
				}
			},
			
			onAfterClose : function(oEvent){
				//debugger;
				//this.renderingSkip = "X";
				this.shMain.RecordMeasure_oDialog.destroy();
		    	this.shMain.RecordMeasure_oDialog = "";
		    	this.shMain.RecordMeasure_oDialog_Controller.destroy();
		    	this.shMain.RecordMeasure_oDialog_Controller = "";	
			},		

	});

});