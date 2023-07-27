sap.ui.define([
		"cj/pm0020/controller/BaseController",
		"cj/pm0020/util/ValueHelpHelper",
		"cj/pm0020/util/utils",
		"cj/pm0020/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"
	], function (BaseController, ValueHelpHelper, utils, formatter, Filter, FilterOperator, JSONModel, Message, Toast, jQuery) {
		"use strict";
		
		return BaseController.extend("cj.pm0020.controller.Main", {
			formatter: formatter,
			
//	       config : {
//	           "titleResource" : "appTitle"
//	         },		


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
//				   this.i18n = this.getView().getModel("i18n").getResourceBundle();
				   
					// Maintenance Plan UI
					var oSwerk;					
					var arr_swerk = [];
					var arr_kostl = [];
					var arr_kokrs = [];
					
					var oTable;
					
//					utils.makeSerachHelpHeader(this);				
	
					this.getLoginInfo();
					this.set_userData();  //"User Auth"		
				}else{
		        	this.onSearch();					
					this.renderingSkip = "";
				}	
		      
//		        var appTitleText = this.i18n.getText("appTitle")
//		      
//		        $(document).ready(function() {		    	
//		    	   var appTitle = document.getElementById("shellAppTitle").innerHTML;
////		    	   var navTitle = document.getElementByID("sapUshellNavTitle").innerHTML;
//
//		    	   var matchText = 'Home';
//
//		    	   var replacementText = appTitleText;
//
//		    	   var appReplaced = appTitle.replace(matchText, replacementText);
////		    	   var navReplaced = navTitle.replace(matchText, replacementText);
//
//		    	   document.getElementById("shellAppTitle").innerHTML = appReplaced;	
////		    	   document.getElementById("sapUshellNavTitle").innerHTML = appReplaced;
//			    	 
//		        });
		        	        
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
						//jQuery.sap.log.info("Odata Error occured");
						//Toast.show("Error");
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},			
			/*
			 * User Default Setting 
			 */
			set_auth : function(){
				this.arr_swerk  = this.get_Auth("SWERK");
				this.arr_kostl  = this.get_Auth("KOSTL");
				this.arr_kokrs  = this.get_Auth("KOKRS");
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;
			},
			/*
			 * Plan Date Default Setting 
			 */
			setInitData : function(){				
				
//	    	   var title = this.i18n.getText("appTitle");				   
//			   var oModel = new JSONModel({ appTitle: title});
//			   oModel.refresh();
				   
//				var oShell = new sap.ui.unified.Shell({
//                    id : "shell",
//                    appTitle : "Contract Management"});
//				
//				oShell.placeAt("content");
				
//				debugger;
//				var oRenderer = sap.ushell.Container.getRenderer("fiori2");
//				var oMetadata = oRenderer.getMetadata();
//				//oRenderer.setHeaderTitle("이게 애체 뭐냐");
//				//oRenderer.setHeaderVisibility(false, false, ["home", "app"]);				
				   
			    var nplda_from = this.getView().byId("nplda_from");				
			    var nplda_to   = this.getView().byId("nplda_to");
			    
			    nplda_from.setDisplayFormat(this.dateFormat);
			    nplda_from.setValueFormat("yyyyMMdd");
			    
			    nplda_to.setDisplayFormat(this.dateFormat);
			    nplda_to.setValueFormat("yyyyMMdd");
			    
			    var fromDate = this.formatter.strToDate(this.locDate);
			    var toDate = new Date();
				var toDay =  fromDate.getDate() + 30;
				toDate.setDate( toDay );
				
				nplda_from.setDateValue( fromDate );				
				nplda_to.setDateValue( toDate );	

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
					result = this.check_data();
					
					if(result){
						this.onSearch();
					}
				}else{
					sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
					    this.i18n.getText("error")
					);
				}				
			},
			
			check_data : function(){
				
				var _check = true;
				
				//Status는 하나 이상 선택되어야 한다. 
				var chk_scheduled = this.getView().byId("scheduled").getSelected();
				var chk_completed = this.getView().byId("completed").getSelected();
				var chk_delayed = this.getView().byId("delayed").getSelected(); 
	    	        		
	    		if(chk_scheduled === false && chk_completed === false && chk_delayed === false )	
	    		{
	    			sap.m.MessageBox.show(
					  this.i18n.getText("err_status_order"),
					  sap.m.MessageBox.Icon.ERROR,
					  this.i18n.getText("Error")
					);
					_check = false;
					return _check;
	    		}
	    		   	    
	    	    return _check;				
	    		
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
				var s_stort = [];   // process
				var s_ingrp = [];   // P/G
				var s_arbpl = [];   // Work Center
				var s_mityp = [];   // Plan Category

				var s_tplnr = [];   // F/L
				var s_equnr = [];   // Equipment
				var s_psort = [];   // Sort Field 
				var s_color = [];   // Color
				var s_assign = [];	// assign
				var s_notass = [];  // not assign		

				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
//				//임시 Test*************************************************
//				if (window.location.hostname == "localhost") {
//					var s_swerk = "3011";
//				}				
//				//******************************************************

				/*
				 * filter
				 */						
				// Plan Date
				var startDate = this.getView().byId("nplda_from").getDateValue();
				var endDate = this.getView().byId("nplda_to").getDateValue();
				var nplda_f = this.formatter.dateToStr(startDate);
				var nplda_t = this.formatter.dateToStr(endDate);
				
				if(nplda_f != "00000000" || nplda_t != "00000000"){
					s_filter.push(utils.set_bt_filter("Nplda", nplda_f, nplda_t));
				}				
	    		
		    	
				// F/L
		    	var oTplnr = this.getView().byId("tplnr").getTokens();
		    	for(var j=0; j<oTplnr.length; j++){
		    		s_tplnr.push(oTplnr[j].getProperty("key"));
		    	}
		    	if(s_tplnr.length>0){
		    		s_filter.push(utils.set_filter(s_tplnr, "Tplnr"));
			    }
		    	
		    	// Process
		    	var stort = this.getView().byId("stort").getSelectedKey();
		    	if(stort){
					s_stort.push(stort);
					
			    	if(s_stort){
			    		s_filter.push(utils.set_filter(s_stort, "Stort"));
				    }		
		    	}
		    	
				// Equipment
		    	var oEqunr = this.getView().byId("equnr").getTokens();
		    	for(var j=0; j<oEqunr.length; j++){
		    		s_equnr.push(oEqunr[j].getProperty("key"));
		    	}
		    	if(s_equnr.length>0){
		    		s_filter.push(utils.set_filter(s_equnr, "Equnr"));
			    }				 
		    		    	
		        // P/G
				var ingrp = this.getView().byId("ingrp").getSelectedKey();
				if(ingrp){
					s_ingrp.push(ingrp);
					
			    	if(s_ingrp){
			    		s_filter.push(utils.set_filter(s_ingrp, "Ingrp"));
				    }		
				}
	    	
				// Work Center
				var arbpl = this.getView().byId("arbpl").getSelectedKey();
				if(arbpl){
					s_arbpl.push(arbpl);

			    	if(s_arbpl){
			    		s_filter.push(utils.set_filter(s_arbpl, "Arbpl"));
				    }		
				}

				// Plan Category
				var mityp = this.getView().byId("mityp").getSelectedKey();
				if(mityp){
					s_mityp.push(mityp);
					
			    	if(s_mityp){
			    		s_filter.push(utils.set_filter(s_mityp, "Mityp"));
				    }						
				}
				
//				// Sort Field
//		    	var oPsort = this.getView().byId("psort").getTokens();
//		    	for(var j=0; j<oPsort.length; j++){
//		    		s_psort.push(oPsort[j].getProperty("key"));
//		    	}
//		    	if(s_psort.length>0){
//		    		s_filter.push(utils.set_filter(s_psort, "Psort"));
//			    }	
				
				var psort = this.getView().byId("psort").getSelectedKey();
				if(psort){
					s_psort.push(psort);
					
			    	if(s_ingrp){
			    		s_filter.push(utils.set_filter(s_psort, "Psort"));
				    }		
				}

				var chk_scheduled = this.getView().byId("scheduled").getSelected();
	    		if(chk_scheduled){
	    			s_color.push("yellow");
	    		}
					
				var chk_completed = this.getView().byId("completed").getSelected();
	    		if(chk_completed){
	    			s_color.push("green");
	    		}
	    		
				var chk_delayed = this.getView().byId("delayed").getSelected();
	    		if(chk_delayed){
	    			s_color.push("red");
	    		}				
				
	    		if(s_color.length > 0){
	    			s_filter.push(utils.set_filter(s_color, "Color"));
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

						for (var i=0; i<oData.ResultList.results.length; i++){
							if(oData.ResultList.results[i].Stat == "I0045"){
								if (oData.ResultList.results[i].Mobile) {
									oData.ResultList.results[i].Zdevice = "M";
								}else{
									oData.ResultList.results[i].Zdevice = "P";
								}
							}
						}
						
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
					error : function(oError) {
						sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
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

				this.oLoc = this.getView().byId("stort");		    // Process
				if(this.oLoc){
					utils.set_search_field(v_swerk, this.oLoc, "loc", "C", "", "");
				}				
				
				this.oPlg = this.getView().byId("ingrp");			// Planning Group
				if(this.oPlg){
					utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
				}				
		
				this.oWoc = this.getView().byId("arbpl");			// Work Center
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}				
		
				this.oMpc = this.getView().byId("mityp");			// Maintenance Paln Category
				if(this.oMpc){
					
					utils.set_search_field(v_swerk, this.oMpc, "mpc", "C", "", "");
					this.oMpc.setSelectedKey("P1");
				}				
		
				this.oPsf = this.getView().byId("psort");			// PM Sort Field
				if(this.oPsf){
					utils.set_search_field(v_swerk, this.oPsf, "psf", "C", "", "");
				}		
				
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
			//onExit: function() {
			//},
				
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
				this.oLoc.setSelectedKey("");
				this.oPlg.setSelectedKey("");
				this.oWoc.setSelectedKey("");
				this.oMpc.setSelectedKey("");
				this.oPsf.setSelectedKey("");
//				this.oPsf.removeAllTokens();	// psort
			
				this.oLoc.removeAllItems();	// Order Type
				this.oPlg.removeAllItems();	// Maint. W/C 
				this.oWoc.removeAllItems();		    // Enployee ID
				this.oMpc.removeAllItems();
				this.oPsf.removeAllItems();
				
				this.tplnr.removeAllTokens();
				this.equnr.removeAllTokens();

		    	this._set_search_field();
			},

//			/*
//			 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
//			 */
//			onChange : function(oEvent){
//				
//				var strArr = oEvent.oSource.sId.split("--");
//				var cnt = strArr.length - 1;
//				var sIdstr = strArr[cnt];
//				
//				if(sIdstr === "psort"){
//					utils.set_token(this.oPsf, oEvent);
//				}
//			},
			
			
			handleDateChangeFrom: function (oEvent) {
				var oText = this.byId("nplda_from");
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
				var oText = this.byId("nplda_to");
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

			onIconPress : function(oEvent){
				var idx = oEvent.getSource().getParent().getIndex();
			},
			
//			onRowSelectMp : function(oEvent) {
//				var controll = this;
//				
//				var idx = oEvent.getParameter('rowIndex');
//				var oTable =  this.getView().byId("table");
//				
//				if (oTable.isIndexSelected(idx)) {
//				  var cxt = oTable.getContextByIndex(idx);
//				  var path = cxt.sPath;
//				  var obj = oTable.getModel().getProperty(path);
//				  //console.log(obj);
//				
//				  if(obj.Aufnr){
//					  if(obj.MpColor == "green"){
//						  //this._getDialog_measureMemt(obj.Aufnr, obj.Mityp).open();   //AUFNR : Order
//						  controll.getOwnerComponent().openRecordMeasure_Dialog(controll, obj.Aufnr, obj.Mityp, obj.Swerk); 
//						  this.renderingSkip = "X";
//					  }else{
//						  sap.m.MessageBox.show(
//							      this.i18n.getText("noMeasuringPointMessage"),
//							      sap.m.MessageBox.Icon.INFORMATION,
//							      this.i18n.getText("info")
//							  );			        							  
//					  }
//				  }else{
//					  sap.m.MessageBox.show(
//					      this.i18n.getText("selectionMessage"),
//					      sap.m.MessageBox.Icon.INFORMATION,
//					      this.i18n.getText("info")
//					  );			        	
//				  }
//				}
//			},
										

	/****************************************************************
	 *  RecordMeasurement_pop Event
	 ****************************************************************/		
//			onCloseMeasureDialog : function(oEvent){
//				var chkVal = sap.ui.getCore().byId("chkall");  // Checkbox 선택 값 지우기
//				chkVal.setSelected(false);
//				
//				this._oDialog_measureMemt.close();
//			},
//					
//			onConfirmMeasureDialog : function(oEvent){
//				this._measureMemt_Dialog_handler.dataUpdateProcess("T");
//			},			
//
//			onCancelMeasureDialog : function(oEvent){
//				this._measureMemt_Dialog_handler.dataUpdateProcess("C");
//			},		
//			
//			onSaveMeasureDialog : function(oEvent){
//				this._measureMemt_Dialog_handler.dataUpdateProcess("S");
//			},
			
			OnRecdvChange_rm :function(oEvent){
			   var controll = this;

			   //var oSelectedColumn = oEvent.getSource().getCustomData()[0].getValue();
			   var row = oEvent.getSource().getParent();
			   var idx = row.getIndex();
			   var oTable =  sap.ui.getCore().byId("table_rm");
			   
			   if (oTable.isIndexSelected(idx)) {
				  var cxt = oTable.getContextByIndex(idx);
				  var path = cxt.sPath;
				  var obj = oTable.getModel().getProperty(path);0
				  //console.log(obj);
				  // MIN : obj.Mrmic, MAX : obj.Mrmac
				  if( parseFloat(obj.Mrmic) > parseFloat(oEvent.mParameters.value)){
					sap.m.MessageBox.show(
						  this.i18n.getText("recdvLowMessage"),
					      sap.m.MessageBox.Icon.WARNING,
					      this.i18n.getText("warning")
					);					  
				  }else if( parseFloat(obj.Mrmac) < parseFloat(oEvent.mParameters.value)){
					sap.m.MessageBox.show(
							  this.i18n.getText("recdvHighMessage"),
						      sap.m.MessageBox.Icon.WARNING,
						      this.i18n.getText("warning")
					);					  
				  }
				}
			},
			
//			onSelectApply_rm : function(oEvent){
//				if(oEvent.getParameters().selected){
//					var oTable =  sap.ui.getCore().byId("table_rm");
//
//					for(var i=0;i < oTable.getModel().getData().ResultList.results.length; i++){
//						if (oTable.getModel().getData().ResultList.results[i].Mdocmx == true){ 
//							oTable.getModel().getData().ResultList.results[i].Ernam = oTable.getModel().getData().Ernam;
//							oTable.getModel().getData().ResultList.results[i].Idate = oTable.getModel().getData().Idate;
//							oTable.getModel().getData().ResultList.results[i].Itime = oTable.getModel().getData().Itime;
//						}
//					}
//										
//					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//					 oODataJSONModel.setData(oTable.getModel().oData);
//					 
//					 oTable.setModel(oODataJSONModel);
//					 //oTable.bindRows("/ResultList/results");					
//				}
//			},
			
			handleChangDate_rm: function (oEvent) {
				var oText = this.byId("IDate");
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					//oDP.setValue(sValue);
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
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
			
			
			open_wkresult: function(sObj){
				var controll = this;
				//debugger;
				
				if(sObj){
					if((sObj.Stat == "I0002"  || sObj.Stat == "I0009" ) && sObj.Zid != ""){  // System status : REL, User Status : ORS3 // && sObj.Ustat == "E0003" && sObj.Zid != ""
						Message.confirm(this.i18n.getText("confirmWorkResult"), 
								{//title: "", 
					             onClose : function(oAction){
										   	if(oAction=="OK"){
										   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
											}else{
												return false;
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);
					}else if( sObj.Stat == "I0010" && sObj.Zid != ""){
						Message.confirm(this.i18n.getText("selectWorkResult"), 
								{//title: "", 
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: this.i18n.getText("selection_title"),
							
								actions: [this.i18n.getText("resultDisplay"), this.i18n.getText("resultEntry")],
					             onClose : function(oAction){
										   	if(oAction == controll.i18n.getText("resultDisplay")){
										   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
											}else{
												controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);		
						
						
					}else if(sObj.Stat == "I0045" || sObj.Stat == "I0046"){  
				   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotworkresult"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
					}
				}
				
			},					
						
			orderLink : function(oEvent){
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
								  	   param_swerk : sObj.Werks,
								       param_order : sObj.Aufnr,
								       param_qmnum : sObj.Qmnum,
								       param_woc   : sObj.Vaplz}
							});
		
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);	
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
						
			onPress_rm : function(oEvent) {
				var controll = this;
				var sObj = this.onRowSelect();
				
				  if(sObj){
					  if(sObj.Aufnr){
						  if(sObj.MpColor == "green"){
							  controll.getOwnerComponent().openRecordMeasure_Dialog(controll, sObj.Aufnr, sObj.Mityp, sObj.Swerk); 
							  this.renderingSkip = "X";
						  }else{
							  sap.m.MessageBox.show(
								      this.i18n.getText("noMeasuringPointMessage"),
								      sap.m.MessageBox.Icon.INFORMATION,
								      this.i18n.getText("info")
								  );			        							  
						  }
					  }else{
						  sap.m.MessageBox.show(
						      this.i18n.getText("selectionMessage"),
						      sap.m.MessageBox.Icon.INFORMATION,
						      this.i18n.getText("info")
						  );			        	
					  }
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
			

			onPress_wkresult: function(){
				var sObj = this.onRowSelect();
				var controll = this;
				
				if(sObj){
					if((sObj.Stat == "I0002"  || sObj.Stat == "I0009" ) && sObj.Zid != ""){  // System status : REL, User Status : ORS3 // && sObj.Ustat == "E0003" && sObj.Zid != ""
						Message.confirm(this.i18n.getText("confirmWorkResult"), 
								{//title: "", 
					             onClose : function(oAction){
										   	if(oAction=="OK"){
										   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
											}else{
												return false;
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);
					}else if( sObj.Stat == "I0010" && sObj.Zid != ""){
						//debugger;
						Message.confirm(this.i18n.getText("selectWorkResult"), 
								{//title: "", 
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: this.i18n.getText("selection_title"),
							
								actions: [this.i18n.getText("resultDisplay"), this.i18n.getText("resultEntry")],
					             onClose : function(oAction){
										   	if(oAction == controll.i18n.getText("resultDisplay")){
										   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
											}else{
												controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);		
						
						
					}else if(sObj.Stat == "I0045" || sObj.Stat == "I0046"){  
				   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotworkresult"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
					}
				}
				
			},		
			
			onClose_workResult : function (oEvent){
				if(this.refresh){
					this.onSearch();	
				}
				
				this.refresh = false;
			},			
	/****************************************************************
	 *  Local function
	 ****************************************************************/
//			/*
//			 * call popup fragment 
//			 */ 
//			_getDialog_measureMemt : function (sAufnr, sMityp) {
//				var controll = this;
//				
//				if (!this._oDialog_measureMemt) {
//
//		            this._oDialog_measureMemt = sap.ui.xmlfragment("cj.pm0020.view.RecordMeasurement_pop", this);
//		            this._measureMemt_Dialog_handler = new RecordMeasurement(this._oDialog_measureMemt, this);
//
//		            this.getView().addDependent(this._oDialog_measureMemt);    
//		            		            
//		         }
//
//		        if(sAufnr!=undefined){
//					//this._measureMemt_Dialog_handler.dataSelectProcess(sAufnr, sMityp);
//		        	controll.getOwnerComponent().openRecordMeasure_Dialog(controll, sAufnr, sMityp);
//		        }
//                return this._oDialog_measureMemt;	        
//		    },
		      
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

				this.getView().byId("table").getBinding("rows").filter(oFilter,	"Application");
			}		
			
		});
	}
);