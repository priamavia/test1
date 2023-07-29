sap.ui.define([
		"cj/pm0120/controller/BaseController",
		"cj/pm0120/util/ValueHelpHelper",
		"cj/pm0120/util/utils",
		"cj/pm0120/util/Calibration",
		"cj/pm0120/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"		
	], function (BaseController, ValueHelpHelper, utils, Calibration, 
			     formatter, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
		"use strict";
		
		return BaseController.extend("cj.pm0120.controller.Main", {
			formatter : formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
				/*
				 * Table Filter 
				 */
//				this.shcount = 0;
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
				
			},
		
		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
/*		        sap.ui.core.BusyIndicator.show(0);
		        setTimeout(function(){
		            doStuff();
		            sap.ui.core.BusyIndicator.hide();
		        }, 20);				
*/				
				if(this.renderingSkip == ""){				
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();

				// Maintenance Plan UI
				var oSwerk;
				var arr_swerk = [];
				var arr_kostl = [];
				var arr_kokrs = [];
				var sMode = "";
				
				var oTable;
				
//				utils.makeSerachHelpHeader(this);				

				this.getLoginInfo();
				this.set_userData();  //"User Auth"		
				
				}else{
					this.onSearch();
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
						    	"Default" : oData.results[i].Default
							  }
						   );
					   }
			   				   
					   controll.set_UserInfo(userDefault);
					   
					   debugger;
					   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					   
					   controll.set_auth();
					   controll.setInitData();					   
					    // set default value 
					   controll._set_search_field();  // set Search Help
					   
					}.bind(this),
					error : function(oError) {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
							);								
//						jQuery.sap.log.info("Odata Error occured");
//						Toast.show("Error");
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
			    var addat_from = this.getView().byId("addat_from");				
			    var addat_to   = this.getView().byId("addat_to");

			    addat_from.setDisplayFormat(this.dateFormat);
			    addat_from.setValueFormat("yyyyMMdd");
			    
			    addat_to.setDisplayFormat(this.dateFormat);
			    addat_to.setValueFormat("yyyyMMdd");
			    
			    var fromDate = this.formatter.strToDate(this.locDate);
			    var toDate = new Date();
				var toDay =  fromDate.getDate() + 7;
				toDate.setDate( toDay );
				
				addat_from.setDateValue( fromDate );				
				addat_to.setDateValue( toDate );
				
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
		            
					this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
				}else{
					this.oSwerk.setSelectedKey(this.oSwerk.getSelectedItem().getProperty("key"));
				}			
			},
			
			/*
			 * Search by search Button
			 */
			onBtnSearch: function(){
				var result = utils.checkMandatory(this, "mainpage");
				
				if(result){
					   this.onSearch();					   
				}else{
					sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
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
				var s_auart = [];   // Order Type
				var s_aufnr = [];   // Order Number
				//var s_addat = [];   // Plan Date
				var s_vaplz = [];   // Work Center
				var s_ingrp = [];   // P/G
				var s_stort = [];   // process
				var s_zname = [];	// PIC
				var s_tplnr = [];   // F/L
				var s_equnr = [];   // Equipment
				var s_invnr = [];   // TAG ID
				var s_ilart = [];   // Maintenance activity type   
				var s_assign = [];	// assign
				var s_notass = [];  // not assign	
				
				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
				
/*				//임시 Test*************************************************
				if (window.location.hostname == "localhost") {
					var s_swerk = "2010";
				}				
				//******************************************************
*/
				/*
				 * filter
				 */						
		    	// Order Type
		    	var auart = this.getView().byId("auart").getSelectedKey();
		    	if(auart){
					s_auart.push(auart);			
			    	if(s_auart){
			    		s_filter.push(utils.set_filter(s_auart, "Auart"));
				    }		
		    	}	   
		    	
		    	var ilart = "113"; // Calibration 
		    	if(ilart){
		    		s_ilart.push(ilart);			
			    	if(s_ilart){
			    		s_filter.push(utils.set_filter(s_ilart, "Ilart"));
				    }		
		    	}	   
		    	
		    	// Order Number
//		    	var aufnr = this.getView().byId("aufnr").getSelectedKey();
//		    	if(aufnr){
//					s_aufnr.push(aufnr);
//					
//			    	if(s_aufnr){
//			    		s_filter.push(utils.set_filter(s_aufnr, "aufnr"));
//				    }		
//		    	}	   
		    	var oAufnr_f = this.getView().byId("aufnr_from").getValue();
		    	var oAufnr_t = this.getView().byId("aufnr_from").getValue();
		    	
				if(oAufnr_f != "" || oAufnr_t != ""){
					s_filter.push(utils.set_bt_filter("Aufnr", oAufnr_f, oAufnr_t));
				}		
				
				// Plan Date
				var startDate = this.getView().byId("addat_from").getDateValue();
				var endDate = this.getView().byId("addat_to").getDateValue();
				var addat_f = this.formatter.dateToStr(startDate);
				var addat_t = this.formatter.dateToStr(endDate);
				if(addat_f != "00000000" || addat_f != "00000000"){
					s_filter.push(utils.set_bt_filter("Addat", addat_f, addat_t));
				}
	    		
	    		// Work Center
		    	var vaplz = this.getView().byId("vaplz").getSelectedKey();
		    	if(vaplz){
					s_vaplz.push(vaplz);
					
			    	if(s_vaplz){
			    		s_filter.push(utils.set_filter(s_vaplz, "Vaplz"));
				    }		
		    	}
		    	
		    	// Interal / external
	    		// Status 
				var s_steus = [];   // Internal / External

		    	var chk_intern = this.getView().byId("intern").getSelected();   // Interal
	    		if(chk_intern){
	    			s_steus.push("PM01");
	    		}
	    		var chk_extern = this.getView().byId("extern").getSelected();   // external
	    		if(chk_extern){
	    			s_steus.push("PM03");
	    		}
	    		if(s_steus.length>0){
	    			s_filter.push(utils.set_filter(s_steus, "Steus"));
	    		}	    		
	    		
	    		// In-porcess / Confirmed / Completed
	    		// Stat 
				var s_stat  = [];   // In Process / Completed
	    		
	    		var chk_inpro = this.getView().byId("inpro").getSelected();   // In-porcess
	    		if(chk_inpro){
	    			s_stat.push("I0002");  // REL
	    		}
	    		var chk_conf = this.getView().byId("conf").getSelected();   // Completed
	    		if(chk_conf){
//	    			s_stat.push("I0002");  // REL
	    			s_stat.push("I0009");  // CNF
	    		}	    		
	    		var chk_comp = this.getView().byId("comp").getSelected();   // Completed
	    		if(chk_comp){
	    			s_stat.push("I0045");  // TECO
	    			s_stat.push("I0046");  // CLSD
	    		}
	    		if(s_stat.length>0){
	    			s_filter.push(utils.set_filter(s_stat, "Stat"));
	    		}	    		
	    		
		    	var assing = this.getView().byId("assing").getSelected();
		    	if(assing){
					s_assign.push("X");
					
			    	if(s_assign){
			    		s_filter.push(utils.set_filter(s_assign, "Assign"));
				    }		
		    	}	    
		    	
		    	var notass = this.getView().byId("notass").getSelected();
		    	if(notass){
		    		s_notass.push("X");
					
			    	if(s_notass){
			    		s_filter.push(utils.set_filter(s_notass, "Nassign"));
				    }		
		    	}	
		    	
		        // P/G
				var ingrp = this.getView().byId("ingrp").getSelectedKey();
				if(ingrp){
					s_ingrp.push(ingrp);
					
			    	if(s_ingrp){
			    		s_filter.push(utils.set_filter(s_ingrp, "Ingrp"));
				    }		
				}

	    		// Process
		    	var stort = this.getView().byId("stort").getSelectedKey();
		    	if(stort){
					s_stort.push(stort);
					
			    	if(s_stort){
			    		s_filter.push(utils.set_filter(s_stort, "Stort"));
				    }		
		    	}	    		
	    		
	    		// PIC
		    	var zname = this.getView().byId("zname").getSelectedKey();
		    	if(zname){
					s_zname.push(zname);
					
			    	if(s_zname){
			    		s_filter.push(utils.set_filter(s_zname, "Zname"));
				    }		
		    	}	    
		    	
	    		// F/L
		    	var oTplnr = this.getView().byId("tplnr").getTokens();
		    	for(var j=0; j<oTplnr.length; j++){
		    		s_tplnr.push(oTplnr[j].getProperty("key"));
		    	}
		    	if(s_tplnr.length>0){
		    		s_filter.push(utils.set_filter(s_tplnr, "Tplnr"));
			    }
		    	
				// Equipment
		    	var oEqunr = this.getView().byId("equnr").getTokens();
		    	for(var j=0; j<oEqunr.length; j++){
		    		s_equnr.push(oEqunr[j].getProperty("key"));
		    	}
		    	if(s_equnr.length>0){
		    		s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			    }				 
		    		    	
		    	// TAG ID
		    	var invnr = this.getView().byId("invnr").getValue();
		    	if(invnr){
					s_invnr.push(invnr);
					
			    	if(s_invnr){
			    		s_filter.push(utils.set_filter(s_invnr, "Invnr"));
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
				
				if(filterStr == undefined){
					filterStr = "";
				}
				
				
				var path = "/InputSet(Spras='"+lange+"',Werks='"+s_swerk+"')";

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
					   sap.m.MessageBox.show(
						 controll.i18n.getText("oData_conn_error"),
						 sap.m.MessageBox.Icon.ERROR,
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
//				// Search Help 가 두번 타는 것을 막기 위한 로직
//				this.shcount = this.shcount + 1;
//				 
//				//console.log(this.shcount);
//				if(this.shcount > 1){
//					this.shcount = 0;
//					return;
//				}
				
				var v_swerk = this.oSwerk.getSelectedKey();

				this.oOrt = this.getView().byId("auart");		    // Order Type
				if(this.oOrt){
					utils.set_search_field("", this.oOrt, "ort", "C", "", "");
				}				

				this.oOrt.setSelectedKey('PM02'); //Default Value Setting
				this.oOrt.setEditable(false);

				this.oWoc = this.getView().byId("vaplz");			// Work Center
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}				
			
				this.oPlg = this.getView().byId("ingrp");			// Planning Group
				if(this.oPlg){
					utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
				}				
						
				this.oLoc = this.getView().byId("stort");		    // Process
				if(this.oLoc){
					utils.set_search_field(v_swerk, this.oLoc, "loc", "C", "", "");
				}				

				this.oPic = this.getView().byId("zname");		    // Enployee ID
				if(this.oPic){
					utils.set_search_field(v_swerk, this.oPic, "pic", "C", "", "");
				}				

				//this.aufnr = this.getView().byId("aufnr");
				//this.ingrp = this.getView().byId("ingrp");
				this.equnr = this.getView().byId("equnr");
				this.tplnr = this.getView().byId("tplnr");
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
				
			onPress_chge : function(oEvent){
				var sAufnr = oEvent.getSource().getText();
				var idx = oEvent.getSource().getParent().getIndex();
				var oTable =  this.getView().byId("table");
									
				if (idx != -1) {
					  var cxt = oTable.getContextByIndex(idx); 
					  var path = cxt.sPath;
					  var sObj = oTable.getModel().getProperty(path);
					  //console.log(this.obj);

					if(sObj){				
						// Step 1: Get Service for app to app navigation
						var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
						// Step 2: Navigate using your semantic object
		
						var hash = navigationService.hrefForExternal({
							  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
							  params: {param_mode: 'U',
								       param_order: sObj.Aufnr,
								       param_qmnum : sObj.Qmnum,
								       param_woc   : sObj.Vaplz}
							});
		
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);	
					}
				}
				
			},		
			
			onChange : function(oEvent){
				
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
				
				if(sIdstr === "ingrp"){
					utils.set_token(this.ingrp, oEvent);
				}
			},
			
           onValueHelpRequest : function(oEvent){
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
						
				var s_swerk = this.oSwerk.getSelectedKey();
				
				if(sIdstr === "equnr"){
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle", s_swerk);
				}else if(sIdstr === "tplnr"){
					var tokens = oEvent.getSource().getTokens();
					this.getOwnerComponent().openFuncLocation_Dialog(this, "MultiToggle", s_swerk, tokens);
				}else{
					utils.openValueHelp(sIdstr);
				}				
				
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
				//this.oOrt.setSelectedKey("");
				this.oWoc.setSelectedKey("");
				this.oPlg.setSelectedKey("");
				this.oLoc.setSelectedKey("");
				this.oPic.setSelectedKey("");

//				this.oOrt.removeAllItems();
//				this.oWoc.removeAllItems(); 
//				this.oPlg.removeAllItems();
//				this.oLoc.removeAllItems();
//				this.oPic.removeAllItems();
				
				//this.aufnr.removeAllTokens();
				this.getView().byId("aufnr_from").setValue("");
				this.getView().byId("aufnr_to").setValue("");				
				//this.ingrp.removeAllTokens();
				this.tplnr.removeAllTokens();
				this.equnr.removeAllTokens();
				
				this.getView().byId("invnr").setValue("");

//		    	this._set_search_field();
			},

			handleDateChangeFrom: function (oEvent) {
				var oText = this.byId("addat_from");
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
			    //oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			handleDateChangeTo: function (oEvent) {
				var oText = this.byId("addat_to");
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
			    //oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},

			onPress_entry: function(){
				var sObj = this.onRowSelect();
				var controll = this;

				if(sObj){
//					if( (sObj.Stat == "I0002" || sObj.Stat == "I0009" || sObj.Stat == "I0010") &&
//					    ((sObj.Steus == "PM01" && sObj.Zname != "" ) || (sObj.Steus != "PM01")) ) {  // System status : REL,  CNF, PCNF  // && sObj.Ustat == "E0001" && sObj.Zid != ""
					if( (sObj.Stat == "I0002" || sObj.Stat == "I0009" || sObj.Stat == "I0010") ) {  // System status : REL,  CNF, PCNF  // && sObj.Ustat == "E0001" && sObj.Zid != ""

					Message.confirm(this.i18n.getText("confirmResultEntry"), 
								{//title: "", 
					             onClose : function(oAction){
										   	if(oAction=="OK"){
										   		controll.sMode = "R";
										   		controll._getDialog_calibration(controll.sMode, sObj).open();	// Change
											}else{
												return false;
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);
	
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotResultEntry"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
					}
				}
			},
			
			onCalibrationAfterClose : function(oEvent){
				if(this.sMode == "C"){
					this.renderingSkip = "X";
			    	this._oDialog_calibration.destroy();
			    	this._oDialog_calibration = "";
			    	this._calibration_Dialog_handler.destroy();
			    	this._calibration_Dialog_handler = "";
				}
				
				this.sMode = "";
			},	

			onPress_rdisp: function(){
				var sObj = this.onRowSelect();
				this.sMode = "D";
				
				if(sObj){
					if(sObj.Stat == "I0045" || sObj.Stat == "I0046"){  // System status : TECO, CLSD
						this._getDialog_calibration(this.sMode, sObj).open();   // Display
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotResultEntry"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
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

				}else{
					sap.m.MessageBox.show(
					  this.i18n.getText("isnotselected"),
				      sap.m.MessageBox.Icon.WARNING,
				      this.i18n.getText("warning")
					);							
				}
			},			
								
			onPress_wkassign: function(){			// Request Approval Button, 반장/작업자가 승인자에게 요청
				var controll = this;
				var sObj = this.onRowSelect();
				
				if(sObj){
					if( (sObj.Stat == "I0001" && sObj.Ustat == "E0001" &&  sObj.Auart != "PM02")
					 || (sObj.Stat == "I0001" && sObj.Ustat == "E0002" &&  sObj.Auart != "PM02")
					 || (sObj.Stat == "I0002" && sObj.Auart == "PM02") ){  // System status : CRTD
						
//						debugger;
						var basic_from = this.formatter.strToDate(sObj.Addat);
						var currentDate = this.formatter.strToDate(this.locDate);		
						
						if(basic_from < currentDate){
							sap.m.MessageBox.show(
								this.i18n.getText("check_assign"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						    );	
							return false;
						}
						
						//this._getDialog_workassign(sObj).open();
						controll.getOwnerComponent().openWorkAssign_Dialog(controll, sObj.Swerk, sObj);
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotassign"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
					}
				}
			},
						
			/****************************************************************
			 *  Calibration_pop Event
			 ****************************************************************/					
			_getDialog_calibration : function (sMode, sObj) {
				if (!this._oDialog_calibration) {

		            this._oDialog_calibration = sap.ui.xmlfragment("cj.pm0120.view.Calibration_pop", this);
		            this._calibration_Dialog_handler = new Calibration(this._oDialog_calibration, this);

		            this.getView().addDependent(this._oDialog_calibration);    
		            		            
		         }

		        if(sObj!=undefined){
		        	this._calibration_Dialog_handler.dataSelectProcess(sMode, sObj);
		        }
                return this._oDialog_calibration;	        
		    },
		    
			onCloseCalibrationDialog : function(oEvent){			
				this._oDialog_calibration.close();
				//this.sMode = "D";			// 생성모드에서 취소 시 조회 모드로 변경 
			},		    
						
			onSaveCalibrationDialog : function(oEvent){
				this._calibration_Dialog_handler.dataUpdateProcess("C");
			},
			
			onFinish : function(oEvent){
				this._calibration_Dialog_handler.onFinish(oEvent);
			},

//			// Add Row 
//			onInternAdd : function(oEvent){
//				this._calibration_Dialog_handler.onInternAdd(oEvent);
//			},
//			
//			// Row Delete
//			onInternDelete : function(oEvent){
//				this._calibration_Dialog_handler.onInternDelete(oEvent);
//			},		
			
			
			handleChangeIsdd : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);

					this.onWorkTimeDuration(oEvent);
				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}	
			}, 

			handleChangeIsdz : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);

					this.onWorkTimeDuration(oEvent);
				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}	
			}, 
			
			handleChangeIedd : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);

					this.onWorkTimeDuration(oEvent);
				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}	
			}, 
			
			handleChangeIedz : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);

					this.onWorkTimeDuration(oEvent);
				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}	
			}, 
			
			onWorkTimeDuration : function(oEvent){
				var oTable = sap.ui.getCore().byId("table_intern");	
				
				var idx = oEvent.getSource().getParent().getIndex();
				var cxt = oTable.getContextByIndex(idx);
				var path = cxt.sPath;
				var obj = oTable.getModel().getProperty(path);
						
				//L_TO_TIME_DIFF
				obj.Idaur = utils.cal_duration(obj.Isdd, obj.Isdz, obj.Iedd, obj.Iedz);
								
			},
			
			handleChangeGrund : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = sap.ui.getCore().byId("Grund").getSelectedKey();
				this._iEvent++;
				if (sValue != "") {
					oDP.setValueState(sap.ui.core.ValueState.None);			
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}	
			},
			
            uploadProgress : function (oEvent){
                sap.ui.getCore().byId("dialog_rm").setBusy(true);
	            //console.log("uploadProgress");
            },
			
			onBtnFileUpload : function(oEvent){
				var controll = this;
			    
				var oModel = this.getView().getModel("fileUpload");
				
				var oUploader = sap.ui.getCore().byId("fileUploader");
				var s_aufnr = sap.ui.getCore().byId("aufnr_cb").getValue();
				var s_swerk = controll.oSwerk.getSelectedKey();
				
				var sFileName = oUploader.getValue();
				
				if(!sFileName){
			    	Toast.show(controll.i18n.getText("choosefileselect"));
			    	return;
			    }
							
				// /sap/opu/odata/SAP/ZPM_GW_FILE_SRV/FileSet
				// insertHeaderParameter
				// addHeaderParameter
				oUploader.destroyHeaderParameters();
				oModel.refreshSecurityToken();

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "swerk",
                    value: encodeURIComponent(s_swerk)
                }));

				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "aufnr",
                    value: encodeURIComponent(s_aufnr)
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
			
			onBtnCreateNoti : function(oEvent){			
	        	this._calibration_Dialog_handler.createNoti();
			},
			
			handleUploadComplete: function(oEvent) {
				var controll = this;
				
				var sResponse = oEvent.getParameter("response");
				var sStatus   = oEvent.getParameter("status");
				var sFilename = oEvent.getParameter("fileName");
				var sRetType  = oEvent.getParameter("headers").rettype;
				var sRetMsg    = oEvent.getParameter("headers").retmsg;
				
				if (sRetType == "S") {
					sap.m.MessageBox.show(
							controll.i18n.getText("fileUploadSuccess"),
							sap.m.MessageBox.Icon.SUCCESS,
							controll.i18n.getText("success")
						);		
					
					oEvent.getSource().setValue("");
	                
	                //첨부파일 다시 읽기 
	                var s_aufnr = sap.ui.getCore().byId("aufnr_cb").getValue();
	                this._calibration_Dialog_handler.get_attach_file(s_aufnr);
	                
	                sap.ui.getCore().byId("dialog_rm").setBusy(false);	

				} else {
					sap.m.MessageBox.show(
							//controll.i18n.getText("fileUploadError"),
							sRetMsg,
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);								
				}				
				
				
//				if (sStatus) {
//					var message = "";
////					var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
//					if (sStatus == "200" || sStatus == "201" ) {
//						//oEvent.getParameter("headers").location
//						//oEvent.getParameter("fileName")
////						fileUploadMessage  = Return Code: {0} \n {1}
////						message = controll.i18n.getText("fileUploadMessage", [sStatus], [sFilename]);
//
//						sap.m.MessageBox.show(
//								controll.i18n.getText("fileUploadSuccess"),
//								sap.m.MessageBox.Icon.SUCCESS,
//								controll.i18n.getText("success")
//							);		
//						
//						oEvent.getSource().setValue("");
//						
////						var fileLink = sap.ui.getCore().byId("fileLink");
////						fileLink.setText(sFilename);
////						
////						var linkUrl = oEvent.getParameter("headers").location + '/$value';
////						fileLink.setHref(linkUrl);
////
////						var fileDelBtn = sap.ui.getCore().byId("fileDelBtn");
////						fileDelBtn.setVisible(true);					
//		                
//		                //첨부파일 다시 읽기 
//		                var s_aufnr = sap.ui.getCore().byId("aufnr_cb").getValue();
//		                this._calibration_Dialog_handler.get_attach_file(s_aufnr);
//		                
//		                sap.ui.getCore().byId("dialog_rm").setBusy(false);		
//
//					} else {
////						message = controll.i18n.getText("fileUploadMessage", [sStatus], [sFilename]);
//////						message = "Return Code: " + sStatus + "\n" + sFilename, "ERROR", "Upload Error";
//						sap.m.MessageBox.show(
//								controll.i18n.getText("fileUploadError"),
//								sap.m.MessageBox.Icon.ERROR,
//								this.i18n.getText("error")
//							);								
//					}
//				}
			},	
			handleTypeMissmatch: function(oEvent) {
				var controll = this;
				
				var aFileTypes = oEvent.getSource().getFileType();
				jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
				var sSupportedFileTypes = aFileTypes.join(", ");
				var message = "";
				message = controll.i18n.getText("fielTypeMissmatch", [oEvent.getParameter("fileType")], [sSupportedFileTypes]);
				
//				Toast.show("The file type *." + oEvent.getParameter("fileType") +
//							" is not supported. Choose one of the following types: " +
//							sSupportedFileTypes);

				Toast.show(message);

			
			},	
			handleValueChange: function(oEvent) {
				var controll = this;
				
//				var oFileUploader  = sap.ui.getCore().byId("fileUploader");
//				var oFileSize =  oFileUploader.getSize();
				
				var message = "";
				message = controll.i18n.getText("fielValueChange", [oEvent.getParameter("newValue")]);

//				Toast.show("Press 'Upload File' to upload file '" +
//							oEvent.getParameter("newValue") + "'");
				
				Toast.show(message);				
			},
			
			onBtnFileDelete : function(oEvent){
				
				var oFTable = sap.ui.getCore().byId("table_file");
				var idx = oEvent.getSource().getParent().getIndex();
				
				var lv_dokrn = oFTable.getModel().getData().ResultList.results[idx].Doknr;
				
				this._calibration_Dialog_handler.delete_file(lv_dokrn);
				
/*				var controll = this; [
				var oModel = this.getView().getModel("fileUpload");
				

				var path = "/FileSet(Swerk='"+s_swerk+"',Aufnr='"+ s_aufnr +"')";
				var mParameters = {
						urlParameters : {
							"$expand" : "ResultList"
						},
						success : function() {
							var fileLink = sap.ui.getCore().byId("fileLink");
							fileLink.setText("");														
							fileLink.setHref("");

							var fileDelBtn = sap.ui.getCore().byId("fileDelBtn");
							fileDelBtn.setVisible(false);
						   
						}.bind(this),
						error : function() {
						   sap.m.MessageBox.show(
									 controll.i18n.getText("oData_conn_error"),
									 sap.m.MessageBox.Icon.ERROR,
									 controll.i18n.getText("error")
								   );							
//							jQuery.sap.log.info("Odata Error occured");
//							Toast.show("Error");
						}.bind(this)
					};
				
				oModel.remove(path, mParameters);*/
				
			},
			
			onDownload : function(oEvent){
				
				var oFTable = sap.ui.getCore().byId("table_file");
				var idx = oEvent.getSource().getParent().getIndex();
				
				var lv_dokrn = oFTable.getModel().getData().ResultList.results[idx].Doknr;
				
				this._calibration_Dialog_handler.download_file(lv_dokrn);
				
			},
			

	/****************************************************************
	 *  External SearchHelp Event Handler
	 ****************************************************************/			
			onClose_searchEquip : function(aTokens){
				var oEqunr = this.getView().byId("equnr");
				oEqunr.setTokens(aTokens);
			},
			
			
			onClose_funcLocation : function(aTokens){
				var oFl = this.getView().byId("tplnr");
				oFl.setTokens(aTokens);
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