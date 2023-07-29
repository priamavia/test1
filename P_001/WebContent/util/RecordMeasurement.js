sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, Toast, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0040.util.RecordMeasurement", { 
		Dailog_rm : [],
		arr_swerk_rm : [],
		arr_kostl_rm : [],
		arr_korks_rm : [],
		
		constructor: function(oDailog, Main) {
          this.Dailog_rm = oDailog;
          
          this.oMain = Main;
          this.selAufnr = null;
                  
          this.arr_swerk_rm = this.oMain.arr_swerk;
          this.arr_kostl_rm = this.oMain.arr_kostl;
          this.arr_kokrs_rm = this.oMain.arr_kokrs;
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
                   
		},
		
		setAufnr: function(){
			this.selAufnr = sAufnr;
		}, 
			
		/*
		 * Initial Data Search
		 */
		dataSelectProcess : function(sAufnr, sMityp){	
			var oModel = this.oMain.getView().getModel("recodeMeasure");
			var controll = this;

			var lange = this.oMain.getLanguage();
			var s_okcode = [];         //okcode
			var s_mityp =  [];   
			var s_filter = [];
			var filterStr= "";
			
			this.selAufnr = sAufnr;
			
	        if(sMityp){
	          s_mityp.push(sMityp);

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
						
			var path = "/InputSet(Spras='"+lange+"',Aufnr='"+this.selAufnr+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList/ListDeep",
					"$filter" : filterStr
				},
										
				success : function(oData) {
			     var oTable = sap.ui.getCore().byId("table_rm");
			     //var oForm = sap.ui.getCore().byId("SimpleForm_rm");

				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);

			     //oForm.setModel(oData);
			     //oForm.bindElement("/");
				// oModel.setData(oODataJSONModel);
				 //oData.Ernam = this.oMain.getLoginInfo().getFullName();
				 oData.Ernam = this.oMain.getLoginId();
				 
				 controll.Dailog_rm.setModel(oODataJSONModel, "header");
				 
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");
				 this.viewElemControl(oData.Zmode, oData.Iphas);
					 
				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
					 controll.i18n.getText("Error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("Error")
				   );
				}.bind(this)
			};
				
		     oModel.read(path, mParameters);
		},
		
		dataUpdateProcess : function(sOkCode){
			var oModel = this.oMain.getView().getModel("recodeMeasure");
			var controll = this;				
			var oTable =  sap.ui.getCore().byId("table_rm");
			var chkIndex = 0;
			for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
				if(oTable.getModel().getData().ResultList.results[i].Mdocmx == true &&
				   (oTable.getModel().getData().ResultList.results[i].Recdc != null || 
				   oTable.getModel().getData().ResultList.results[i].Vlcod != null)){
					chkIndex++;
				}
			}
			
			if (sOkCode == 'S' && chkIndex < 1) {
				Toast.show("Enter a value in the Valu or Valuation field for the measurement data.");
				return;
			}
			
			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData();
			 
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel = oTable.getModel();
			var oData = oTable.getModel().getData();
		
			var data = {};

			data.Aufnr  = oTable.getModel().getData().Aufnr;
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
				item.Vlcodx = oData.ResultList.results[i].Vlcodx;
				item.Atinnx = oData.ResultList.results[i].Atinnx;
				item.Mdocm  = oData.ResultList.results[i].Mdocm;
				item.Mdocmx  = oData.ResultList.results[i].Mdocmx;
				
				data.ResultList.push(item);
		    }

			var mParameters = {
				success : function(oData) {
					
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/ResultList/results");
				 this.viewElemControl(oData.Zmode, oData.Iphas);
					 
				 if(oData.RetType == "E"){
					 sap.m.MessageBox.show(
						     oData.RetMsg,
							 sap.m.MessageBox.Icon.ERROR,
							 controll.i18n.getText("Error")
						);
					 
				 }else{
					 sap.m.MessageBox.show(
						     oData.RetMsg,
							 sap.m.MessageBox.Icon.SUCCESS,
							 controll.i18n.getText("Success")
						);					 
				 }	 

				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
					 controll.i18n.getText("Error"),
					 sap.m.MessageBox.Icon.ERROR,
					 controll.i18n.getText("Error")
				   );
				}.bind(this)
			};
					
			oModel.create("/InputSet", data, mParameters);			
		},
			
		_set_filter : function(Obj, Val){
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
		},		
		
		
		viewElemControl : function(sMode, sIphas){

			var confirmBtn  = sap.ui.getCore().byId("confirmMeasure");
			var canelTecBtn = sap.ui.getCore().byId("cancelMeasure");
			var saveBtn     = sap.ui.getCore().byId("saveMeasure");
			
			if(sMode == "C" || sMode == "U"){  //Complete, Save, Cancel = Active 
				confirmBtn.setEnabled(true);
				canelTecBtn.setEnabled(false);
				saveBtn.setEnabled(true);
			
			}else if(sMode == "R"){		// IPHAS = 6, Cancel = active ; IPHAS = 3, Cancel, Cancel Technical completion = Active 
				if(sIphas == "6"){
					confirmBtn.setEnabled(false);
					canelTecBtn.setEnabled(false);
					saveBtn.setEnabled(false);
				}else if(sIphas == "3"){
					confirmBtn.setEnabled(false);
					canelTecBtn.setEnabled(true);
					saveBtn.setEnabled(false);				
				}
			}
		},

	});
})