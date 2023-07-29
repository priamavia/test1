sap.ui.define([
		"cj/pm0130/controller/BaseController",
		"cj/pm0130/util/ValueHelpHelper",
		"cj/pm0130/util/utils",
		"cj/pm0130/util/RepairEquip",
		"cj/pm0130/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"		
	], function (BaseController, ValueHelpHelper, utils, RepairEquip, formatter,
			     Filter, FilterOperator, JSONModel, MessageBox, Toast, jQuery ) {
		"use strict";
		
		return BaseController.extend("cj.pm0130.controller.Main", {

			formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
				/*
				 * Table Filter 
				 */
				this._oGlobalFilter = null;	
		//		this.aTokens = new Array();
				
				var oView = this.getView();
			    // Table Filter set 
			  	var oTable = oView.byId("table");
					oView.setModel(new JSONModel({
						globalFilter: "",
						availabilityFilterOn: false,
						cellFilterOn: false
					}), "ui");
					
			    this.renderingSkip = "";
			    this.searchFlag = "";
			    
				var oComponent = this.getOwnerComponent();
				this.getView().addStyleClass(oComponent.getContentDensityClass());					    
				
			},
		
		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {

				if(this.renderingSkip == ""){
			
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();

				// Maintenance Plan UI
				var oSwerk;
				var arr_swerk = [];
				var arr_kostl = [];
				var arr_kokrs = [];
				
				var oTable;
				
//				utils.makeSerachHelpHeader(this);				

				this.getLoginInfo();
				this.set_userData();  //"User Auth"	
				
				}else{
					//debugger;
					if(this.searchFlag == "X"){

						this.onSearch();						
					}
					this.renderingSkip = "";
				}				
			},
			
	        /**
	         * get User Default Value 
	         */		
			set_userData : function() {
				
			    var oModel = this.getView().getModel("userInfo");
			    var path = "/UserAuthSet";
			    
				var controll = this;

				var mParameters = {
				    urlParameters : {
						"$filter" : "UserName eq '"+ controll.getLoginId() + "'"	
					},
					success : function(oData) {
					   var userDefault = [];
					  
					   for(var i=0; i<oData.results.length; i++){
						  userDefault.push(
							 {
						    	"Auth" : oData.results[i].Auth,
						    	"Value" : oData.results[i].Value,
						    	"Name"  : oData.results[i].Name,
						    	"KeyName" : oData.results[i].KeyName,
						    	"Default" : oData.results[i].Default,
						    	"Add1" : oData.results[i].Add1,
						    	"add2" : oData.results[i].Add2,					    	
						    	"Add3" : oData.results[i].Add3,
						    	"Add4" : oData.results[i].Add4,
						    	"Add5" : oData.results[i].Add5
							  }
						   );
					   }
			   				   
					   controll.set_UserInfo(userDefault);
					   
//					   debugger;
					   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					   
					   controll.set_auth();
					   controll.setInitData();					   
					    // set default value 
					   controll._set_search_field();  // set Search Help
					   
					}.bind(this),
					error : function(oError) {
						MessageBox.show(
							controll.i18n.getText("oData_conn_error"),
							MessageBox.Icon.ERROR,
							controll.i18n.getText("error")
						);								
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},			
			/*
			 * User Default Setting 
			 */
			set_auth : function(){
				this.arr_swerk = this.get_Auth("SWERK");
				this.arr_kostl = this.get_Auth("KOSTL");
				this.arr_kokrs = this.get_Auth("KOKRS");
				
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;	
			},
			/*
			 * Plan Date Default Setting 
			 */
			setInitData : function(){
									    			    
				this.oSwerk = this.getView().byId("swerk");
				
				var default_swerk;				
				if(!this.oSwerk.getSelectedItem()){
					
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
					    template.setKey(this.arr_swerk[j].Value);
				        template.setText(this.arr_swerk[j].KeyName);
			            this.oSwerk.addItem(template);
			            
			            if(this.arr_swerk[j].Default === "X"){
			            	default_swerk = j;
			            }
					}
		            
					//debugger;
					this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
				
				}else{
					this.oSwerk.setSelectedKey(this.oSwerk.getSelectedItem().getProperty("key"));
				}		
				
				this.oldFromDate = new Date();
				this.oldToDate = new Date();
				
				this.history 		= this.getView().byId("history");
				this.lblswerk       = this.getView().byId("lblswerk");
				this.swerk   		= this.getView().byId("swerk");
				this.lblzcrldate    = this.getView().byId("lblzcrldate");				
				this.zcrldate_from  = this.getView().byId("zcrldate_from");
				this.zcrldate_to   	= this.getView().byId("zcrldate_to");
				this.zcrname   		= this.getView().byId("zcrname");
				this.oldZcrname	    = this.getView().byId("zcrname");
				this.main_type   	= this.getView().byId("main_type");
				this.equnr   		= this.getView().byId("equnr");
				this.matnr   		= this.getView().byId("matnr");
				this.lifnr   		= this.getView().byId("lifnr");
				
				if(this.history.getSelected()){		// History가 체크 시 Plant와 생성일자만 필수 필드, 모든 검색 조건 활성화
					this.setSelectionElement(true);
					
				}else{
					this.setSelectionElement(false);
				}
				 			
				this.zcrldate_from = this.getView().byId("zcrldate_from");				
			    this.zcrldate_to   = this.getView().byId("zcrldate_to");

			    this.zcrldate_from.setDisplayFormat(this.dateFormat);
			    this.zcrldate_from.setValueFormat("yyyyMMdd");
			    
			    this.zcrldate_to.setDisplayFormat(this.dateFormat);
			    this.zcrldate_to.setValueFormat("yyyyMMdd");
			    
			},
			
			setSelectionElement : function(vBoolean) {
				this.lblzcrldate.setRequired(vBoolean);
				this.zcrldate_from.setRequired(vBoolean);
				this.zcrldate_to.setRequired(vBoolean);
				
				this.zcrldate_from.setEnabled(vBoolean);
				this.zcrldate_to.setEnabled(vBoolean);
				this.zcrname.setEnabled(vBoolean);
				this.main_type.setEnabled(vBoolean);
				
				if(this.main_type.getSelectedIndex() === 0){
					this.equnr.setVisible(true);
					this.matnr.setVisible(false);
				}else{
					this.equnr.setVisible(false);
					this.matnr.setVisible(true);					
				}
				
				this.equnr.setEnabled(vBoolean);
				this.matnr.setEnabled(vBoolean);
				this.lifnr.setEnabled(vBoolean);	
				
				if(vBoolean){
					if(formatter.dateToStr(this.zcrldate_from.getDateValue()) == "00000000"){
						if(this.oldFromDate != null){
//							this.zcrldate_from.setDateValue( this.oldFromDate );				
//							this.zcrldate_to.setDateValue( this.oldToDate );
							this.zcrldate_from.setValue( this.oldFromDate );				
							this.zcrldate_to.setValue( this.oldToDate );
							
						}else{
						    var toDate = this.formatter.strToDate(this.locDate);
						    var fromDate = new Date();
							var fromDay =  toDate.getDate() - 60;
							fromDate.setDate( fromDay );
							
//							this.zcrldate_from.setDateValue( fromDate );				
//							this.zcrldate_to.setDateValue( toDate );
							this.zcrldate_from.setDateValue( fromDate );				
							this.zcrldate_to.setValue( this.locDate );							
						}
					}
					
					if(this.oldZcrname == null || this.oldZcrname == ""){
						this.zcrname.setValue(this.getLoginId());
					}else{
						this.zcrname.setValue(this.oldZcrname);
					}
				}else{
					this.oldFromDate = this.zcrldate_from.getDateValue();
					this.oldToDate   = this.zcrldate_to.getDateValue();
					this.oldZcrname  =  this.zcrname.getValue(); 
					this.zcrldate_from.setValue("");				
					this.zcrldate_to.setValue("");
					this.zcrname.setValue("");				
				}
			},
			
			onHistorySelect : function(oEvent){			
				this.setSelectionElement(oEvent.getParameters().selected);
			},
			
			onRtnChange : function(oEvent){
				//debugger;
				if(oEvent.getParameters().selectedIndex === 0){
					this.equnr.setVisible(true);
					this.matnr.setVisible(false);
					this.matnr.removeAllTokens();

				}else{
					this.equnr.setVisible(false);
					this.matnr.setVisible(true);
					this.equnr.removeAllTokens();
				}				
			},
			
			/*
			 * Search by search Button
			 */
			onBtnSearch: function(){
				var result = utils.checkMandatory(this, "mainpage");
				
				if(result){
					   this.onSearch();
					   this.searchFlag = "X"
				}else{
					MessageBox.show(
						this.i18n.getText("err_check_mandatory"),
						MessageBox.Icon.ERROR,
					    this.i18n.getText("error")
					);
				}				
			},
			
			onSearch : function(){
				var oModel = this.getView().getModel();
				var controll = this;
				
				var oTable =  controll.getView().byId("table");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});
											
				var s_swerk;        // swerk
				var s_history = []; // history
				var s_zcrname = []; // zcrname
				var s_main_type = []; //main_type
				var s_equnr   = []; // equipment
				var s_matnr   = []; // Material
				var s_lifnr   = []; // Vendor 
						
				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
//				//임시 Test*************************************************
//				if (window.location.hostname == "localhost") {
//					var s_swerk = "2010";
//				}				
//				//******************************************************

				/*
				 * filter
				 */	
				
				// history
		    	var history = this.history.getSelected();
		    	if(history){
					s_history.push("X");
					
			    	if(s_history){
			    		s_filter.push(utils.set_filter(s_history, "History"));
				    }		
		    	}	
				
				// Created On
				//debugger;
				var zcrldate_from = this.zcrldate_from.getDateValue();
				var zcrldate_to = this.zcrldate_to.getDateValue();
				var zcrldate_f = this.formatter.dateToStr(zcrldate_from);
				var zcrldate_t = this.formatter.dateToStr(zcrldate_to);
				if(zcrldate_f != "00000000" || zcrldate_t != "00000000"){
					s_filter.push(utils.set_bt_filter("Zcrldate", zcrldate_f, zcrldate_t));
				}				
	    			
	    		
		    	// Created by
		    	var zcrname = this.zcrname.getValue();
		    	if(zcrname){
		    		s_zcrname.push(zcrname);
					
			    	if(s_zcrname){
			    		s_filter.push(utils.set_filter(s_zcrname, "Zcrname"));
				    }		
		    	}	

		    	// main_type
		    	var main_type = this.main_type.getSelectedIndex();
		    	if(history){
		    		
		    		if(main_type === 0){
		    			s_main_type.push("E");	
		    		}else{
		    			s_main_type.push("S");
		    		}
		    		
			    	if(s_main_type){
			    		s_filter.push(utils.set_filter(s_main_type, "MainType"));
				    }		
		    	}			    	
		    	
		    	
		    	// Equipment
		    	var oEqunr = this.equnr.getTokens();
		    	for(var j=0; j<oEqunr.length; j++){
		    		s_equnr.push(oEqunr[j].getProperty("key"));
		    	}
		    	if(s_equnr.length>0){
		    		s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			    }   	
		    	
		    	// Material
		    	var oMatnr = this.matnr.getTokens();
		    	for(var j=0; j<oMatnr.length; j++){
		    		s_matnr.push(oMatnr[j].getProperty("key"));
		    	}
		    	if(s_matnr.length>0){
		    		s_filter.push(utils.set_filter(s_matnr, "Matnr"));
			    }   	
		    	
		    	// Vendor
		    	var oLifnr = this.lifnr.getTokens();
		    	for(var j=0; j<oLifnr.length; j++){
		    		s_lifnr.push(oLifnr[j].getProperty("key"));
		    	}
		    	if(s_lifnr.length>0){
		    		s_filter.push(utils.set_filter(s_lifnr, "Lifnr"));
			    }   	
		    			    	
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
				}
				
				if(filterStr == undefined){
					filterStr = "";
				}
				
				var path = "/InputSet(Spras='"+lange+"',Swerk='"+s_swerk+"')";

				var mParameters = {
					urlParameters : {
						"$expand" : "ResultList",
						"$filter" : filterStr
					},
					success : function(oData) {
						
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData);
					 oTable.setModel(oODataJSONModel);
					 oTable.bindRows("/ResultList/results");
						 
/*						 sap.m.MessageBox.show(
							 controll.i18n.getText("success"),
							 sap.m.MessageBox.Icon.SUCCESS,
							 controll.i18n.getText("success")
						);
*/
					}.bind(this),
					error : function() {
					   MessageBox.show(
						 controll.i18n.getText("oData_conn_error"),
						 MessageBox.Icon.ERROR,
						 controll.i18n.getText("error")
					   );

					}.bind(this)
				};
					
			     oModel.read(path, mParameters);
			},			
			
			/* 
			 * PM Possible Entry Odata Set 
			 */	
			_set_search_field : function() {
				var v_swerk = this.oSwerk.getSelectedKey();

//				if(this.matnr){
//					utils.set_search_field(v_swerk, this.matnr, "mat", "H", "", "");
//				}				

				var v_ekorg1 = "";
				var v_ekorg2 = "";
				for(var j=0; j<this.arr_swerk.length; j++){
					if(this.arr_swerk[j].Value === v_swerk){
						v_ekorg1 = this.arr_swerk[j].Add3;
						v_ekorg2 = this.arr_swerk[j].Add4;
						break;
		            }
				}
				
				//debugger;
				if(this.lifnr){
					utils.set_search_field("", this.lifnr, "lfa", "H", v_ekorg1, v_ekorg2);
				}		
			},
				
			/**
			* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			* This hook is the same one that SAPUI5 controls get after being rendered.
			*/
		    onAfterRendering: function() {


			},

			
			/**
			* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			*/
//				onExit: function() {
//				}
				
           onValueHelpRequest : function(oEvent){
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
						
				//debugger;
				if(sIdstr === "equnr"){
					var s_swerk = this.oSwerk.getSelectedKey();
					this.equnrName = sIdstr;
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
				}else if(sIdstr === "equnr_re"){
    				this.equnrName = sIdstr;
    				var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
    				
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
				}else if(sIdstr === "matnr"){
					var s_swerk = this.oSwerk.getSelectedKey();
					this.matnrName = sIdstr;
                	this.getOwnerComponent().openSearchMaterial_Dialog(this, "Single", s_swerk);
				}else if(sIdstr === "matnr_re"){
    				this.matnrName = sIdstr;
    				var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
    				
                	this.getOwnerComponent().openSearchMaterial_Dialog(this, "Single", s_swerk);
    			}else{
    				
    				if(sIdstr == "lifnr_re"){
    					this._set_search_field_popup();
    				}else{
        				utils.openValueHelp(sIdstr);    					
    				}
				}				
				
			},		
			
			/*****************************************
			 * File Upload 
			 *****************************************/
			get_attach_file : function(){
				var oModel = this.getView().getModel("fileUpload");

				var controll = this;
				var oFTable = sap.ui.getCore().byId("table_file");			 
				oModel.attachRequestSent(function(){oFTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oFTable.setBusy(false);
					oFTable.setShowNoData(true);
				});

				var doknr = "";
				var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
				var s_requestno = sap.ui.getCore().byId("RequestNo_re").getValue();

				var path = "/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='',RequestNo='"+ s_requestno +"')";

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
							MessageBox.show(
								controll.i18n.getText("oData_conn_error"),
								MessageBox.Icon.ERROR,
								controll.i18n.getText("error")
							);
						}.bind(this)
				};

				oModel.read(path, mParameters);			

			},
			
			handleUploadComplete: function(oEvent) {
				var controll = this;

				var sResponse = oEvent.getParameter("response");
				var sStatus   = oEvent.getParameter("status");
				var sFilename = oEvent.getParameter("fileName");
				var sRetType  = oEvent.getParameter("headers").rettype;
				var sRetMsg   = oEvent.getParameter("headers").retmsg;

				if (sRetType == "S") {
					MessageBox.show(
						controll.i18n.getText("fileUploadSuccess"),
						MessageBox.Icon.SUCCESS,
						controll.i18n.getText("success")
					);		

					oEvent.getSource().setValue("");

					//첨부파일 다시 읽기 
					this.get_attach_file();
					sap.ui.getCore().byId("dialog_re").setBusy(false);		

				} else {
					sap.m.MessageBox.show(
							//controll.i18n.getText("fileUploadError"),
							sRetMsg,
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);								
				}

			},	

			handleTypeMissmatch: function(oEvent) {
				var aFileTypes = oEvent.getSource().getFileType();
				jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
				var sSupportedFileTypes = aFileTypes.join(", ");
				var message = "";
				message = this.i18n.getText("fielTypeMissmatch", [oEvent.getParameter("fileType")], [sSupportedFileTypes]);

				Toast.show(message);
			},	

			handleValueChange: function(oEvent) {
				var message = "";
				message = this.i18n.getText("fielValueChange", [oEvent.getParameter("newValue")]);

				Toast.show(message);				
			},


			uploadProgress : function (oEvent){
				sap.ui.getCore().byId("dialog_re").setBusy(true);
			},

			onBtnFileDelete : function(oEvent){

				var oFTable = sap.ui.getCore().byId("table_file");
				var idx = oEvent.getSource().getParent().getIndex();

				var doknr = oFTable.getModel().getData().ResultList.results[idx].Doknr;

				var controll = this; 
				var oModel = this.getView().getModel("fileUpload");

				oModel.attachRequestSent(function(){oFTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oFTable.setBusy(false);
					oFTable.setShowNoData(true);
				});

				var s_requestno = sap.ui.getCore().byId("RequestNo_re").getValue();
				var s_swerk = this.oSwerk.getSelectedKey();

				var path = "/InputSet(Swerk='"+s_swerk+"',Aufnr='',Qmnum='',Doknr='"+ doknr +"',RequestNo='"+ s_requestno +"')";
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
								MessageBox.show(
									message,
									MessageBox.Icon.ERROR,
									controll.i18n.getText("error")
								);
							}else{  
								MessageBox.show(
									controll.i18n.getText("fileDeleted"),
									MessageBox.Icon.SUCCESS,
									controll.i18n.getText("sucess")
								);
							}

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
							MessageBox.show(
								controll.i18n.getText("oData_conn_error"),
								MessageBox.Icon.ERROR,
								controll.i18n.getText("error")
							);							
						}.bind(this)
				};
				oModel.read(path, mParameters);   
			},


			onDownload : function(oEvent){
				var oFTable = sap.ui.getCore().byId("table_file");
				var idx = oEvent.getSource().getParent().getIndex();

				var doknr = oFTable.getModel().getData().ResultList.results[idx].Doknr;

				var oModel = this.getView().getModel("fileUpload");
				var controll = this;
		 
				oModel.attachRequestSent(function(){oFTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					oFTable.setBusy(false);
					oFTable.setShowNoData(true);
				});

				var s_requestno = sap.ui.getCore().byId("RequestNo_re").getValue();
				var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();

				var sPath;

				if (window.location.hostname == "localhost") {
					sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='',RequestNo='"+s_requestno + "')/$value";
				} else {	
					sPath = "/sap/opu/odata/sap/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='',RequestNo='"+s_requestno + "')/$value";				
				} 

				var html = new sap.ui.core.HTML();

				$(document).ready(function(){
					window.open(sPath);
				});	

			},


			onBtnFileUpload : function(oEvent){
				if(sap.ui.getCore().byId("RequestNo_re").getValue() == ""){
					MessageBox.show(
							this.i18n.getText("chk_upload_file"),
							MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);		
					return;
				}

				var controll = this;

				var oModel = this.getView().getModel("fileUpload");

				var oUploader = sap.ui.getCore().byId("fileUploader");
				var s_requestno = sap.ui.getCore().byId("RequestNo_re").getValue();
				var s_requestinout = "";
				var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
				
				var s_out = sap.ui.getCore().byId("ActualDateOut_re").getValue();
				var s_in = sap.ui.getCore().byId("ActualDateIn_re").getValue();
				
				if(s_out == ""){
					s_requestinout = 'O';
				}

				if(s_in == "" && s_requestinout == ""){
					s_requestinout = 'I';
				}

				var sFileName = oUploader.getValue();

				if(!sFileName){
					Toast.show(this.i18n.getText("choosefileselect"));
					return;
				}

				oUploader.destroyHeaderParameters();
				oModel.refreshSecurityToken();
				
				debugger;

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "swerk",
					value: encodeURIComponent(s_swerk)
				}));

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "requestno",
					value: encodeURIComponent(s_requestno)
				}));

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "requestinout",
					value: encodeURIComponent(s_requestinout)
				}));
				
				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "slug",
					value: encodeURIComponent(sFileName)
				}));

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "x-csrf-token",
					value: oModel.getHeaders()['x-csrf-token'] //getSecurityToken()
				}));

				oUploader.setSendXHR(true);

				var path = oModel.sServiceUrl + "/InputSet";	

				oUploader.setUploadUrl(path);
				oUploader.upload();

			},
			
			
			/****************************************************************
			 *  Event Handler
			 ****************************************************************/				
			// download excel
			downloadExcel : function(oEvent) {
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
					
			// clear Sort 	
			clearAllSortings : function(oEvent) {
				var oTable = this.getView().byId("table");
				oTable.getBinding("rows").sort(null);
				this._resetSortingState();
			},

			// clear filter
			clearAllFilters : function(oEvent) {
				var oTable = this.getView().byId("table");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);

				this._oGlobalFilter = null;

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},

			// Search filter set
			filterGlobally : function(oEvent) {
				var sQuery = oEvent.getParameter("query");
				this._oGlobalFilter = null;
				if (sQuery) {
					this._oGlobalFilter = new Filter(
					[
						new Filter("MitypCt", FilterOperator.Contains,sQuery),
						new Filter("WarplCt", FilterOperator.Contains,sQuery),
						new Filter("PlanSortT", FilterOperator.Contains,sQuery) 			
				    ], 
				    false)
				}
				this._filter();
			},
			
			/*
			 * ComboBox select
			 */
			onSwerkSelect : function(oEvent) {	
				if(this.history.getSelected()){		// History가 체크 시 Plant와 생성일자만 필수 필드, 모든 검색 조건 활성화
					this.equnr.removeAllTokens();
					this.matnr.removeAllTokens();
					this.lifnr.removeAllTokens();
					//this.zcrname.setValue("");
				}
				
		    	this._set_search_field();
			},

			
			handleDateChangeFrom: function (oEvent) {
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			handleDateChangeTo: function (oEvent) {
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
	
			onPress_crte : function(oEvent){
				debugger;
				this.sMode = "C";	// 생성			
				this._getDialog_repairequip(this.sMode).open();					
			},			
			
			
			
			onPress_chge : function(oEvent){
//				var sObj = this.onRowSelect();
				var sReqNo = oEvent.getSource().getText();
				var idx = oEvent.getSource().getParent().getIndex();
				var oTable =  this.getView().byId("table");
				
				this.sMode = "R";  // 조회
						
				if (idx !== -1) {
					  var cxt = oTable.getContextByIndex(idx); 
					  var path = cxt.sPath;
					  var sObj = oTable.getModel().getProperty(path);
					  //console.log(this.obj);
			  
					if(sObj){
						this._getDialog_repairequip(this.sMode, sObj).open();					
					}
				}
				
			},			
			
			onRowSelect : function(oEvent) {
				var oTable =  this.getView().byId("table");
		        
				var idx = oTable.getSelectedIndex();
				  
				if (idx !== -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  var path = cxt.sPath;
				  this.obj = oTable.getModel().getProperty(path);
				  //console.log(this.obj);
		  
				  return this.obj;
				}
			},			
			
		/****************************************************************
		 *  RepairEquip_pop Event
		 ****************************************************************/					
		_getDialog_repairequip : function (sMode, sObj) {
			if (!this._oDialog_repairequip) {

	            this._oDialog_repairequip = sap.ui.xmlfragment("cj.pm0130.view.RepairEquip_pop", this);
	            this._repairequip_Dialog_handler = new RepairEquip(this._oDialog_repairequip, this);

	            this.getView().addDependent(this._oDialog_repairequip);    
	            		            
	         }

        	this._repairequip_Dialog_handler.setHeader(sMode, sObj);

        	return this._oDialog_repairequip;	        
	    },			

	    onSaveRepairEquipDialog : function(oEvent){
			//		    //Header Info
			if(sap.ui.getCore().byId("RequestNo_re").getValue()){
				this._repairequip_Dialog_handler.onSave("U");  // Update
			}else{	
				this._repairequip_Dialog_handler.onSave("C");  // Create 
			}	    	
	    	
		},		
		
		onDeleteRepairEquipDialog : function(oEvent){
	    	this._repairequip_Dialog_handler.onDelete("D");
		},		
		
		onConfirmOutRepairEquipDialog : function(oEvent){
	    	this._repairequip_Dialog_handler.onSave("O");
		},		
		
		onConfirmInRepairEquipDialog : function(oEvent){
	    	this._repairequip_Dialog_handler.onConfirmIn("I");
		},		
		
	    onCancelInRepairEquipDialog : function(oEvent){
	    	this._oDialog_repairequip.close();
		},		
		
		
		onRepairEquipAfterClose : function(oEvent){
			this.renderingSkip = "X";
	    	this._oDialog_repairequip.destroy();
	    	this._oDialog_repairequip = "";
	    	this._repairequip_Dialog_handler.destroy();
	    	this._repairequip_Dialog_handler = "";
		},	
		
		
		onServiceChange : function(oEvent){
			this._repairequip_Dialog_handler.setServiceType(true);
		},	
		
		onMainChange : function(oEvent){
			this._repairequip_Dialog_handler.setMainType(true);
		},
		
		onSwerkSelect_popup : function(oEvent) {	
			var v_equnr_re = sap.ui.getCore().byId("equnr_re");
			var v_matnr_re = sap.ui.getCore().byId("matnr_re");
			var v_lifnr_re = sap.ui.getCore().byId("lifnr_re");
			
			v_equnr_re.removeAllTokens();
			v_matnr_re.removeAllTokens();
			v_lifnr_re.removeAllTokens();
		
	    	this._set_search_field_popup();
		},
		
		_set_search_field_popup : function() {
			var v_swerk_re = sap.ui.getCore().byId("swerk_re").getSelectedKey();
			var v_lifnr_re = sap.ui.getCore().byId("lifnr_re");
			
			var v_ekorg1 = "";
			var v_ekorg2 = "";
			for(var j=0; j<this.arr_swerk.length; j++){
				if(this.arr_swerk[j].Value === v_swerk_re){
					v_ekorg1 = this.arr_swerk[j].Add3;
					v_ekorg2 = this.arr_swerk[j].Add4;
					break;
	            }
			}
			
			//debugger;
			if(v_lifnr_re){
				utils.set_search_field("", v_lifnr_re, "lfa", "H", v_ekorg1, v_ekorg2);
			}
			
		},		
		
			onAdd_materal : function(oEvent){
				
				var oTable = sap.ui.getCore().byId("table_material");
				var tableModel = oTable.getModel();
				
				var last_serial; 
				var odata = {};
				var list = [];
				
				var create_init;
				
				if(tableModel.getData() !=null ){
					odata = tableModel.getData();
					list = odata.results;
				}else{
					create_init = "X";  // create mode 시 최초 row 생성 시 
				}
				
				var cnt = list.length - 1;
				if(list.length < 1){
					last_serial = 10;
				}else{
					last_serial = list[cnt].Serial;
					last_serial = parseInt(last_serial) + 10;
				}
	
				var new_serial = last_serial.toString();
				var str_length = new_serial.length;
				
			    if(str_length < 4){
			    	var zero_cnt = 4 - str_length;
			    	for(var j=0;j<zero_cnt;j++){
			    		new_serial = "0" + new_serial;
			    	}
			    }
				
				list.push( 
				  {
					  "Serial" : new_serial,
					  "Matnr" : "",
					  "Maktx" : "",
					  "Bdmng" : "",
					  "Meins" : "",
					  "Mtart" : "",
					  "ChargMode" : false,
					  "MatErr" : "None",
					  "QtyErr" : "None"
				  }
			   );
			  
			   odata.results = list;
			  
			   if(create_init === "X"){
				   
				 var oODataJSONModel = new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(odata);
				 
			     oTable.setModel(oODataJSONModel);
			     oTable.bindRows("/results");
			     
			     create_init = "";
			     
			   }else{
				   
			     tableModel.setData(odata);
			     
			   }
			   
			   var idx = list.length-1;
			   oTable.setFirstVisibleRow(idx);
			   $("input[id*='Matnr']").focus().trigger("click");
			},				
			
			onClose_equipBom : function(Selbom){
				
				var oTable_mat = sap.ui.getCore().byId("table_material");			
				var tableModel = oTable_mat.getModel();
				
				var last_serial; 
				var odata = {};
				var list = [];
				
				var create_init;
				
				//debugger;
				if(tableModel.getData() != null ){
					odata = tableModel.getData();
					if(odata.results.length > 0){
						if(odata.results[0].Matnr){
							list = odata.results;
						}else{
							create_init = "X"; 
						}
					}				
				}else{
					create_init = "X";  // create mode 시 최초 row 생성 시 
				}
				
				var cnt = list.length - 1;
				if(list.length < 1){
					last_serial = 0;
				}else{
					last_serial = list[cnt].Serial;
				}
							
				for(var i=0; i<Selbom.length; i++){
					var hdmat = {};
					
					last_serial = parseInt(last_serial) + 10;
					
					var new_serial = last_serial.toString();
					var str_length = new_serial.length;
					
				    if(str_length < 4){
				    	var zero_cnt = 4 - str_length;
				    	for(var j=0;j<zero_cnt;j++){
				    		new_serial = "0" + new_serial;
				    	}
				    }
	
					hdmat.Serial = new_serial;
					hdmat.Matnr = Selbom[i].Matnr;
					hdmat.Maktx = Selbom[i].Maktx;
					hdmat.Bdmng = Selbom[i].Menge;
					hdmat.Meins = Selbom[i].Meins;
					hdmat.Mtart = Selbom[i].Mtart;
						  
					if(hdmat.Mtart === "ERSA"){
						hdmat.ChargMode = true;
					}else{
						hdmat.ChargMode = false;
					}
					list.push(hdmat);
				}
				
				odata.results = list;
				
			    var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
	            oODataJSONModel.setData(odata);
				 
	            oTable_mat.setModel(oODataJSONModel);
	            oTable_mat.bindRows("/results");
	
			},		
			
			onDelete_materal : function(oEvent){
				var oTable;
				oTable = sap.ui.getCore().byId("table_material");
				
				var aIndices = oTable.getSelectedIndices();
				if (aIndices.length < 1) {
					Toast.show("No item selected");
					return;
				}
				
				var tableModel = oTable.getModel();
				var odata = tableModel.getData();
				var matitem = odata.results;
				
				var cnt = matitem.length - 1 ;
				
				for(var i=cnt; i>=0; i--){
					for(var j=0; j<aIndices.length; j++){
					   if(i === aIndices[j] ){
						   
						   var removed = matitem.splice(i, 1); 
						  /* if(matitem[i].Rsnum && matitem[i].Rspos){
							   matitem[i].Xloek = "X"
						   }else{
							   var removed = matitem.splice(i, 1); 
						   }*/
					   }
					}	
				};
				odata.results = matitem;
				tableModel.setData(odata);
				
				oTable.clearSelection();
			},
			
			//Material 선택 
			onValueHelpRequest_mat : function(oEvent){
				
				var v_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
				this.material_rowIdx = oEvent.getSource().getParent().getIndex();
				
				//debugger;
				if(oEvent.getSource().getParent("Index")){
					this.matnrName = "table_mat";
					this.getOwnerComponent().openSearchMaterial_Dialog(this, "Single", v_swerk);
				}
			},		
		
			onChange_mat : function(oEvent){
				var v_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
				this.material_rowIdx = oEvent.getSource().getParent().getIndex();
				
				if(oEvent.getParameters().newValue){
					this.oMaterial = [];
					utils.set_search_field(v_swerk, this.oMaterial, "mat", "E", "", oEvent.getParameters().newValue);
				}else{
					var oTable_mat = sap.ui.getCore().byId("table_material");
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = "";
					oTable_mat.getModel().refresh();
					this.material_rowIdx = "";							
				}
			},		

			onChange_Mat_qty : function(oEvent){
				var v_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();
				this.material_rowIdx = oEvent.getSource().getParent().getIndex();
				var oTable_mat = sap.ui.getCore().byId("table_material");
				
				if(!parseInt(oEvent.getParameters().newValue)){
					oTable_mat.getModel().getData().results[this.material_rowIdx].QtyErr = "Error";
				}else{
					oTable_mat.getModel().getData().results[this.material_rowIdx].QtyErr = "None";
				}
				
				oTable_mat.getModel().refresh();
				this.material_rowIdx = "";	
			},		
			
			setMaterial : function(Obj){
				var oTable_mat = sap.ui.getCore().byId("table_material");
				
				if(Obj.length != 0){
					oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "None";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Matnr = Obj.Key;
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = Obj.Name;
					oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = Obj.Add2;
				}else{
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = "";					
					oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "Error";					
				}
				
				oTable_mat.getModel().refresh();
				this.material_rowIdx = "";										
			},


			onChange_po : function(oEvent){
				//debugger;
				if(oEvent.getParameters().newValue){
					this.oPur = [];
					utils.set_search_field("", this.oPur, "pur", "E", oEvent.getParameters().newValue, "");
				}				
			},			
			
			setPoInfo : function(Obj){
				var vToken = [];
				var ebeln_re = sap.ui.getCore().byId("ebeln_re");
				var txz01_re = sap.ui.getCore().byId("txz01_re");
				var lifnr_re = sap.ui.getCore().byId("lifnr_re");
				
				if(Obj.length != 0){
					ebeln_re.setValue(Obj.Key);
					txz01_re.setText(Obj.Name);
					ebeln_re.setValueState("None");
					
					vToken.push(new sap.m.Token({key: Obj.Add1, text: Obj.Add2}));
					lifnr_re.setTokens(vToken);
				}else{
					ebeln_re.setValueState("Error");	
					txz01_re.setText("");
				}
			},
				
			onPress_bom : function(oEvent){
	            var s_swerk = sap.ui.getCore().byId("swerk_re").getSelectedKey();  
	            var oEqunr  = sap.ui.getCore().byId("equnr_re").getTokens();
	            
	            if(oEqunr.length > 0){
	                var s_equnr = oEqunr[0].getProperty("key");
	                var s_text = oEqunr[0].getProperty("text");
	                var s_equnr_tx = s_text.split("(")[0];
	                
	    			this.getOwnerComponent().openEquipBom_Dialog(this, "", s_swerk, s_equnr, s_equnr_tx);            	
	            }else{
	            	sap.m.MessageBox.show(
							 this.i18n.getText("err_equnr"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.i18n.getText("error")
						);            	
	            }
	
			},
			
			handleChangPlanDateOut : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
					this._repairequip_Dialog_handler.checkPlandate();
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
				
			},
			
			handleChangPlanDateIn : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
					this._repairequip_Dialog_handler.checkPlandate();
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
				
			},			
						
	/****************************************************************
	 *  External SearchHelp Event Handler
	 ****************************************************************/			
			onClose_searchEquip : function(aTokens, aObj){

				if(this.equnrName == "equnr"){
					var oEqunr = this.getView().byId("equnr");
					oEqunr.setTokens(aTokens);
					
					
				}else if(this.equnrName == "equnr_re"){
					var oEqunr_re = sap.ui.getCore().byId("equnr_re");
					var bntBom    = sap.ui.getCore().byId("bntBom");
					
					if(aObj.length > 0){
						oEqunr_re.setTokens(aTokens);
						bntBom.setEnabled(aObj[0].ISBOM)
					}
				}	
			},
			
			onEquipTokenChange : function(oEvent){
				if(oEvent.getParameters().type != "added"){
					var bntBom    = sap.ui.getCore().byId("bntBom");
					bntBom.setEnabled(false);
				}
			},
			
			
			onClose_searchMaterial : function(aTokens, aObj){

				if(this.matnrName == "matnr"){
					var oMatnr = this.getView().byId("matnr");
					oMatnr.setTokens(aTokens);
					
					
				}else if(this.matnrName == "matnr_re"){
					var oMatnr_re = sap.ui.getCore().byId("matnr_re");
					
					if(aObj.length > 0){
						oMatnr_re.setTokens(aTokens);
					}
				}else if(this.matnrName == "table_mat"){
					
					var oTable_mat = sap.ui.getCore().byId("table_material");

					oTable_mat.getModel().getData().results[this.material_rowIdx].Matnr = aObj[0].Matnr;
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = aObj[0].Maktx;
					oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = aObj[0].Meins;
					oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "None";
					
					oTable_mat.getModel().refresh();
					this.material_rowIdx = "";					
				}
			},
						

	/****************************************************************
	 *  Local function
	 ****************************************************************/      
			_resetSortingState : function() {
				var oTable = this.getView().byId("table");
				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					aColumns[i].setSorted(false);
				}
			},

			_filter : function() {
				var oFilter = null;

				if (this._oGlobalFilter) {
					oFilter = this._oGlobalFilter;
				}

				this.getView().byId("table").getBinding("rows").filter(oFilter,
						"Application");
			}		
			
		});
	}
);