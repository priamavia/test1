sap.ui.define([
		"cj/pm0190/controller/BaseController",
		"cj/pm0190/util/ValueHelpHelper",
		"cj/pm0190/util/utils",
		"cj/pm0190/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"		
	], function (BaseController, ValueHelpHelper, utils, formatter,
			     Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
		"use strict";
		
		return BaseController.extend("cj.pm0190.controller.Main", {

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
				if(this.renderingSkip == ""){
//					this.i18n = this.getView().getModel("i18n").getResourceBundle();
	
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
					   controll._set_search_field();
					   
					}.bind(this),
					error : function(oError) {
						sap.m.MessageBox.show(
								controll.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								controll.i18n.getText("error")
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
//				this.local_date = this.get_Auth("LOCDAT");
//				this.local_time = this.get_Auth("LOCTIM");
//				this.dateformat = this.get_Auth("DATFORMAT");
//				this.timezone = this.get_Auth("TIMEZ");
				
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;				
			},
			/*
			 * Plan Date Default Setting 
			 */
			setInitData : function(){
			    var zdate = this.getView().byId("Zdate");				

			    zdate.setDisplayFormat(this.dateFormat);
			    zdate.setValueFormat("yyyyMMdd");
				
			    var gstrp_from = this.getView().byId("gstrp_from");				
			    var gstrp_to   = this.getView().byId("gstrp_to");

			    gstrp_from.setDisplayFormat(this.dateFormat);
			    gstrp_from.setValueFormat("yyyyMMdd");
			    
			    gstrp_to.setDisplayFormat(this.dateFormat);
			    gstrp_to.setValueFormat("yyyyMMdd");
			    
			    var fromDate = this.formatter.strToDate(this.locDate);
			    var toDate = new Date();
				var toDay =  fromDate.getDate() + 7;
				toDate.setDate( toDay );
				
				gstrp_from.setDateValue( fromDate );
				gstrp_to.setDateValue( toDate );	
				
				var kindIdx = this.getView().byId("kind").getSelectedIndex();
				this.setDataTable(kindIdx);
				
				var statIdx = this.getView().byId("stat").getSelectedIndex();
				this.setAddDelBtn(statIdx);
						    			    
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
				
				var oOTable =  controll.getView().byId("table_order");
				var oPTable =  controll.getView().byId("table_project");
				
				oModel.attachRequestSent(function(){oOTable.setBusy(true);
													oPTable.setBusy(true);
													});
				oModel.attachRequestCompleted(function(){
													oOTable.setBusy(false);
													oOTable.setShowNoData(true);
													oPTable.setBusy(false);
													oPTable.setShowNoData(true);													
												});

				var s_swerk;        // swerk
				var s_vaplz = [];   // Work Center
//				var s_order = [];	// Order Checkbox
//				var s_project = [];	// Project Checkbox
				var s_kind = [];    // kind
				var s_gstrp = [];	// date
				var s_aufnr = [];   // Order Number
				var s_stat = [];    // Status
				var s_exec_id = [];   // Execution Id
				var s_posid = [];   // WBS
				var s_zname = [];	// PIC
				
				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
				//임시 Test*************************************************
//				if (window.location.hostname == "localhost") {
//					var s_swerk = "2010";
//				}				
				//******************************************************

				/*
				 * filter
				 */		    					
				// Maint. W/C
		    	var vaplz = this.getView().byId("vaplz").getSelectedKey();
		    	if(vaplz){
		    		s_vaplz.push(vaplz);
					
			    	if(s_vaplz){
			    		s_filter.push(utils.set_filter(s_vaplz, "Vaplz"));
				    }		
		    	}	
		    	
//	    		// Order 
//	    		var chk_order = this.getView().byId("pmorder").getSelected();   // PM Order
//	    		if(chk_order){
//	    			s_order.push('X');
//	    			
//			    	if(s_order){
//			    		s_filter.push(utils.set_filter(s_order, "Order"));
//				    }		    		f	
//	    		}
//
//	    		// Project 
//	    		var chk_project = this.getView().byId("project").getSelected();   // Project
//	    		if(chk_project){
//	    			s_project.push('X');
//
//			    	if(s_project){
//			    		s_filter.push(utils.set_filter(s_project, "Proj"));
//				    }		    			
//	    		}
		    	
		    	// kind
		    	var kind = this.getView().byId("kind").getSelectedIndex();
		    		
	    		if(kind === 0){
	    			s_kind.push("O");	// Order	
	    		}else{
	    			s_kind.push("P");	// Project
	    		}
	    			
		    	if(s_kind){
		    		s_filter.push(utils.set_filter(s_kind, "Kind"));
			    }			    	

				// Date
				var strDate = this.getView().byId("gstrp_from").getDateValue();
				var endDate = this.getView().byId("gstrp_to").getDateValue();
				var gstrp_f = this.formatter.dateToStr(strDate);
				var gstrp_t = this.formatter.dateToStr(endDate);
				if(gstrp_f != "00000000" || gstrp_t != "00000000"){
					s_filter.push(utils.set_bt_filter("Gstrp", gstrp_f, gstrp_t));
				}
		    	
		    	// Order Number			
		    	var oAufnr_f = this.getView().byId("aufnr_from").getValue();
		    	var oAufnr_t = this.getView().byId("aufnr_to").getValue();
		    	
				if(oAufnr_f != "" || oAufnr_t != ""){
					s_filter.push(utils.set_bt_filter("Aufnr", oAufnr_f, oAufnr_t));
				}						
						
		    	// stat
		    	var stat = this.getView().byId("stat").getSelectedIndex();
		    		
	    		if(stat === 0){
		    		if(kind !== 0){
						   sap.m.MessageBox.show(
									 controll.i18n.getText("not_enterd_search_warning"),
									 sap.m.MessageBox.Icon.WARNING,
									 controll.i18n.getText("warning")
								   );
						   
						   return;    		
		    			
		    		}else{
		    			s_stat.push("N");	// Not Entered	    			
		    		} 
	    		}else if(stat === 1){
	    			s_stat.push("E");	// Entered
	    		}else{
	    			s_stat.push("C");	// Completed
	    		}
	    			
		    	if(s_stat){
		    		s_filter.push(utils.set_filter(s_stat, "Stat"));
			    }		
		    	
	    		// Execution ID
		    	var oExec_id = this.getView().byId("exec_id").getTokens();
		    	for(var j=0; j<oExec_id.length; j++){
		    		s_exec_id.push(oExec_id[j].getProperty("key"));
		    	}
		    	if(s_exec_id.length>0){
		    		s_filter.push(utils.set_filter(s_exec_id, "Execid"));
			    }
		    	
				// WBS
		    	var oPosid = this.getView().byId("posid").getTokens();
		    	for(var j=0; j<oPosid.length; j++){
		    		s_posid.push(oPosid[j].getProperty("key"));
		    	}
		    	if(s_posid.length>0){
		    		s_filter.push(utils.set_filter(s_posid, "Posid"));
			    }	
		    	
	    		// Worker
		    	var zname = this.getView().byId("zname").getSelectedKey();
		    	if(zname){
					s_zname.push(zname);
					
			    	if(s_zname){
			    		s_filter.push(utils.set_filter(s_zname, "Zname"));
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
						"$expand" : "OrderList,ProjectList",
						"$filter" : filterStr
					},
					success : function(oData) {
					
				    for(var i=0; i<oData.ProjectList.results.length; i++){
				    	if(oData.ProjectList.results[i].Zdate === "00000000") oData.ProjectList.results[i].Zdate = "";
				    	if(oData.ProjectList.results[i].Zftime === "00") oData.ProjectList.results[i].Zftime = "";
				    	if(oData.ProjectList.results[i].Zttime === "00") oData.ProjectList.results[i].Zttime = "";
				    	if(oData.ProjectList.results[i].Zwhour === "00") oData.ProjectList.results[i].Zwhour = "";
				    	
				    	oData.ProjectList.results[i].Items = this.oWocList;
				    }

					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				     oODataJSONModel.setData(oData);
					 								 
				     oOTable.setModel(oODataJSONModel);
				     oOTable.bindRows("/OrderList/results");
					 
				     oPTable.setModel(oODataJSONModel);
				     oPTable.bindRows("/ProjectList/results");
			     
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
							
				var v_swerk = this.oSwerk.getSelectedKey();

				this.oWoc = this.getView().byId("vaplz");			// Work Center
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}				
				
				this.oPic = this.getView().byId("zname");		    // Enployee ID
				if(this.oPic){
					utils.set_search_field(v_swerk, this.oPic, "pic", "C", "", "");
				}
				
				this.oWocList = [];		    // Work Center List 
				if(this.oWocList){
					utils.set_search_field(v_swerk, this.oWocList, "woc", "A", "", "");
				}					

			},

			onChange_Vaplz : function(oEvent){
			    var v_vaplz = oEvent.getParameters().selectedItem.getKey();
			    var v_swerk = this.oSwerk.getSelectedKey();
			    
				if(this.oPic){
					this.oPic.removeAllItems();
					this.oPic.setSelectedKey("");
					utils.set_search_field(v_swerk, this.oPic, "pic", "C", v_vaplz, "");
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
						
				var s_swerk = this.oSwerk.getSelectedKey();
				
				if(sIdstr === "posid"){
					this.oWbs = this.getView().byId("posid");	// WBS
					var wbs_sh = utils.get_sh_help("wbs");
					if(this.oWbs){
						if(!wbs_sh){
							utils.set_search_field(s_swerk, this.oWbs, "wbs", "H", "", "", "X");
						}else{
							utils.openValueHelp(sIdstr);
						}
					}
				}else if(sIdstr === "exec_id"){
					this.oEid = this.getView().byId("exec_id");	// EID
					var eid_sh = utils.get_sh_help("eid");
					if(this.oEid){
						if(!eid_sh){
							utils.set_search_field(s_swerk, this.oEid, "eid", "H", "", "", "X");
						}else{
							utils.openValueHelp("eid");
						}
					}
				}else{
					utils.openValueHelp(sIdstr);
				}				

			},	
			
			
			onValueHelpRequest_table_exec_id : function(oEvent){
				this.select_rowIdx = oEvent.getSource().getParent().getIndex();
				var s_swerk = this.oSwerk.getSelectedKey();
				
			    this.oTab_execId = this.getView().byId("ExecId");
				var t_eid_sh = utils.get_sh_help("t_eid");
				if(this.oTab_execId){
					if(!t_eid_sh){
						utils.set_search_field(s_swerk,  this.oTab_execId, "t_exec_id", "H", "", "", "X");
					}else{
						utils.openValueHelp("t_exec_id");
					}
				}
			},
			
			
			set_search_selected_data : function(Obj,selection,selRow,err){

				if(Obj == "t_exec_id" ){
					var oTable_project = this.getView().byId("table_project");
					
					oTable_project.getModel().getData().ProjectList.results[this.select_rowIdx].ExecId = selection.getKey();
					//oTable_project.getModel().getData().results[this.material_rowIdx].Maktx = selection.getText();
					 
					oTable_project.getModel().refresh();
					this.select_rowIdx = "";	
				}

			},
			
			
			/****************************************************************
			 *  Event Handler
			 ****************************************************************/				
			// download excel
			downloadExcel_order : function(oEvent) {
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table_order");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
					
			// clear Sort 	
			clearAllSortings_order : function(oEvent) {
				var oTable = this.getView().byId("table_order");
				oTable.getBinding("rows").sort(null);
				this._resetSortingState();
			},

			// clear filter
			clearAllFilters_order : function(oEvent) {
				var oTable = this.getView().byId("table_order");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);

				this._oGlobalFilter = null;

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},

			/*
			 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
			 */			
			// Search filter set
			filterGlobally_order : function(oEvent) {
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
			
			downloadExcel_proj : function(oEvent) {
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table_project");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
					
			// clear Sort 	
			clearAllSortings_proj : function(oEvent) {
				var oTable = this.getView().byId("table_project");
				oTable.getBinding("rows").sort(null);
				this._resetSortingState();
			},

			// clear filter
			clearAllFilters_proj : function(oEvent) {
				var oTable = this.getView().byId("table_project");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);

				this._oGlobalFilter = null;

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},

			/*
			 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
			 */			
			// Search filter set
			filterGlobally_proj : function(oEvent) {
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
				this.oWoc.setSelectedKey("");	// Maint. W/C 
							
				this.oWoc.removeAllItems();	// Maint. W/C 
				
				if(this.oEid){
					this.oEid.removeAllTokens();	// F/L	
				}
				
				if(this.oWbs){
					this.oWbs.removeAllTokens();	// Equipment	
				}

				this.getView().byId("aufnr_from").setValue("");
				this.getView().byId("aufnr_to").setValue("");
				//this.getView().byId("gstrp_from").setValue("");
				//this.getView().byId("gstrp_to").setValue("");
				
				this._set_search_field();
			},

			onKindRtnChange : function(oEvent){
				var kindIdx = oEvent.getParameter("selectedIndex");
				this.setDataTable(kindIdx);
				
				var statIdx = this.getView().byId("stat").getSelectedIndex();
				this.setAddDelBtn(statIdx);

				var oOTable =  this.getView().byId("table_order");
				var oPTable =  this.getView().byId("table_project");
							
				if(oOTable.getModel().getData()){
					oOTable.getModel().getData().OrderList.results = [];
					
					oOTable.unbindRows();
					oOTable.setShowNoData(false);			
				}
				
				if(oPTable.getModel().getData()){
					oPTable.getModel().getData().ProjectList.results = [];
					
					oPTable.unbindRows();
					oPTable.setShowNoData(false);				
				}
				
			},
			
			
			onStatRtnChange : function(oEvent){
				var statIdx = oEvent.getParameter("selectedIndex");
				this.setAddDelBtn(statIdx);				
			},
			
			setAddDelBtn : function(statIdx){ // status
		    	var kindIdx = this.getView().byId("kind").getSelectedIndex();   //Order/Prj.   
	    		var addBtn  = this.getView().byId("add");
	    		var delBtn  = this.getView().byId("delete");
	    		var saveBtn = this.getView().byId("save");
	    		var pcompBtn = this.getView().byId("pcomplete");
	    		var compBtn = this.getView().byId("complete");
	    		var workResultBtn = this.getView().byId("workResult");
	    		
	    		var oPTable =  this.getView().byId("table_project");
	    			    	
	    		if(kindIdx === 1){
	    			if(statIdx === 0){  //Not Entered
		    			addBtn.setVisible(true);
		    			delBtn.setVisible(true);
		    			saveBtn.setVisible(true);
		    			pcompBtn.setVisible(true);
	    			}else if(statIdx === 1){  //Entered
	    				
	    				addBtn.setVisible(false);
		    			delBtn.setVisible(false);
		    			saveBtn.setVisible(false);
		    			pcompBtn.setVisible(true);
		    			
	    			}else{   //Completed
	    				
	    				addBtn.setVisible(false);
		    			delBtn.setVisible(false);
		    			saveBtn.setVisible(false);
		    			pcompBtn.setVisible(false);
		    			
	    			}
	    			
	    			if(oPTable.getModel().getData()){
	    				oPTable.getModel().getData().ProjectList.results = [];
		    			oPTable.unbindRows();
		    			oPTable.setShowNoData(false);
	    			}	    			
	    		}else{
	    			addBtn.setVisible(false);
	    			delBtn.setVisible(false);	
	    			saveBtn.setVisible(false);
	    			
	    			if(statIdx === 0 || statIdx === 2){
	    				compBtn.setVisible(false);
	    			}else{
	    				compBtn.setVisible(true);
	    			}
	    		}				
			},
			
			setDataTable : function(idx){
				var pmorder = this.getView().byId("SimpleForm_pmorder");
				var project = this.getView().byId("SimpleForm_project");
				
				if(idx == "0"){
					pmorder.setVisible(true);
					project.setVisible(false);
					
				}else{
					pmorder.setVisible(false);
					project.setVisible(true);					
				}	
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
	
			onOrderRowSelect : function() {
				var oTable =  this.getView().byId("table_order");
		        
				var idx = oTable.getSelectedIndex();
				var selRow = [];
				  
				if (idx !== -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  var path = cxt.sPath;
				  this.obj = oTable.getModel().getProperty(path);
				  
				  selRow.push(this.obj);
				  selRow.push(path);
					
				  //console.log(this.obj);
				  //return this.obj;
				  return selRow;

				}else{
					sap.m.MessageBox.show(
					  this.i18n.getText("isnotselected"),
				      sap.m.MessageBox.Icon.WARNING,
				      this.i18n.getText("warning")
					);							
				}
			},	
					
			onPress_Aufnr : function(oEvent){
				var sAufnr = oEvent.getSource().getText();
				var idx = oEvent.getSource().getParent().getIndex();
				var oTable =  this.getView().byId("table_order");
									
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
								       param_order : sObj.Aufnr,
								       param_qmnum : sObj.Qmnum,
								       param_woc   : sObj.Vaplz}
							});
		
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);	
					}
				}
				
			},					

			onPress_wkresult: function(){
				var selRow = this.onOrderRowSelect();
				
				var sObj = selRow[0];
				var controll = this;
				
//				  Not Entered " I0002  E REL
//				  Entered	  " I0009  E CNF   "17.03.28 추가
//                            " I0010  E PCNF  "17.05.25 추가
//				  Completed   " I0045  E TECO
//				  			  " I0046  E CLSD			
				if(sObj){
					if(sObj.Stat == "I0002" && sObj.Zname != ""){  // System status : REL, User Status : ORS3 // && sObj.Ustat == "E0003" && sObj.Zid != ""
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
	
					}else if(sObj.Stat == "I0009" || sObj.Stat == "I0010"
						  || sObj.Stat == "I0045" || sObj.Stat == "I0046"){
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
			
			onPress_complete : function(){
				var selRow = this.onOrderRowSelect();
				var sObj = selRow[0];
				var sPath = selRow[1];
				
				//this.orderUpdate("O");
				if(sObj){
					this.orderUpdate("O", sObj, sPath);
				}				
			},		
			
			orderUpdate : function(sMode, sObj, sPath){		// S : Project Save, O : Order Complete, N : Project Complete
				var oModel = this.getView().getModel();
				var controll = this;				
				var chkIndex = 0;

				var oTable = controll.getView().byId("table_order");
				
//				  Not Entered " I0002  E REL
//				  Entered	  " I0009  E CNF   "17.03.28 추가
//                            " I0010  E PCNF  "17.05.25 추가
//				  Completed   " I0045  E TECO
//				  			  " I0046  E CLSD			
				if(sObj){
					if(sObj.Stat == "I0009" || sObj.Stat == "I0010"){
						
						var tableModel = oTable.getModel();
		
						var data = {};
												
						data.Spras  = this.getLanguage();
						data.Zmode  = sMode;
				
					    data.OrderList = [];	
	
						var orderItem = {};
						
						orderItem.Zicon = sObj.Zicon;
						orderItem.Txt20 = sObj.Txt20;
						orderItem.Color = sObj.Color;							
						orderItem.Txt30 = sObj.Txt30;
						orderItem.Stat  = sObj.Stat;
						orderItem.Aufnr = sObj.Aufnr;
						orderItem.Ktext = sObj.Ktext;
						orderItem.Gstrp = sObj.Gstrp;
						orderItem.Zplhr = sObj.Zplhr;
						orderItem.Ismne = sObj.Ismne;
						orderItem.Isdz  = sObj.Isdz;
						orderItem.Iedz  = sObj.Iedz;
						orderItem.Idaue = sObj.Idaue;
						orderItem.Zid   = sObj.Zid;
						orderItem.Zname = sObj.Zname;
						orderItem.Werks = sObj.Werks;
						orderItem.Auart = sObj.Auart;
						orderItem.Addat = sObj.Addat;
						orderItem.Vaplz = sObj.Vaplz;
						orderItem.Equnr = sObj.Equnr;
						orderItem.Eqktx = sObj.Eqktx;
						orderItem.Qmnum = sObj.Qmnum;
						orderItem.Qmdat = sObj.Qmdat;
						orderItem.Rueck = sObj.Rueck;
						orderItem.Rmzhl = sObj.Rmzhl;
						orderItem.Zcnf  = sObj.Zcnf;
															
						data.OrderList.push(orderItem);
				    
						var mParameters = {
							success : function(oData) {
								
							 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
							 oODataJSONModel.setData(oData);
							 var sMessage = "";
								 
							 if(oData.RetType == "E"){   
								 
								if(sMode = "S"){		 // S : Project Save,
									sMessage = controll.i18n.getText("projWorkReportError");
								}else if(sMode = "O"){	 // O : Order Complete,
									sMessage = controll.i18n.getText("orderTechCompletError");
								}else if(sMode = "N"){   // N : Project Complete
									sMessage = controll.i18n.getText("projWorkReportCompletError");
								} 	
								
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
										 sap.m.MessageBox.Icon.ERROR,
										 controll.i18n.getText("error")
									);
								 
							 }else{

								 var selRow = tableModel.getProperty(sPath);
								 var listData = tableModel.getData();

//								 selRow.Color = oData.OrderList.results[0].Color;
//								 selRow.Txt20 = oData.OrderList.results[0].Txt20;
//								 selRow.Txt30 = oData.OrderList.results[0].Txt30;
								 
							    for(var i=0; i<listData.OrderList.results.length; i++){
							    	if(listData.OrderList.results[i].Aufnr === selRow.Aufnr){
							    		listData.OrderList.results[i].Color = oData.OrderList.results[0].Color;
							    		listData.OrderList.results[i].Txt20 = oData.OrderList.results[0].Txt20;
							    		listData.OrderList.results[i].Txt30 = oData.OrderList.results[0].Txt30;
							    	}
							    }								 
								 
								 tableModel.refresh();
								 			
								if(sMode = "S"){		 // S : Project Save,
									sMessage = controll.i18n.getText("projWorkReportSuccess");
								}else if(sMode = "O"){	 // O : Order Complete,
									sMessage = controll.i18n.getText("orderTechCompletSuccess");
								}else if(sMode = "N"){   // N : Project Complete
									sMessage = controll.i18n.getText("projWorkReportCompletSuccess");
								} 
								
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
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
						
					}else{
						sap.m.MessageBox.show(
								controll.i18n.getText("isnotordercomplete"),
							      sap.m.MessageBox.Icon.WARNING,
							      controll.i18n.getText("warning")
								);						
					}
				}
			},		
			
			orderUpdate_old : function(sMode){		// S : Project Save, O : Order Complete, N : Project Complete
				var oModel = this.getView().getModel();
				var controll = this;				
				var chkIndex = 0;

				var sObj = controll.onOrderRowSelect();		
				var oTable = controll.getView().byId("table_order");
				var selectIdx = oTable.getSelectedIndices();
				
//				  Not Entered " I0002  E REL
//				  Entered	  " I0009  E CNF   "17.03.28 추가
//                            " I0010  E PCNF  "17.05.25 추가
//				  Completed   " I0045  E TECO
//				  			  " I0046  E CLSD			
				if(sObj){
					if(sObj.Stat == "I0009" || sObj.Stat == "I0010"){
//						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//						oODataJSONModel.setData();
		
						var tableModel = new sap.ui.model.json.JSONModel();
						
						tableModel = oTable.getModel();
						var oData = oTable.getModel().getData();
		
						var data = {};
												
						data.Spras  = this.getLanguage();
						data.Zmode  = sMode;
						 
					    data.OrderList = [];	
	
						for(var i=0; i<selectIdx.length; i++){
							var orderItem = {};
							
							orderItem.Zicon = oData.OrderList.results[selectIdx[i]].Zicon;
							orderItem.Txt20 = oData.OrderList.results[selectIdx[i]].Txt20;
							orderItem.Color = oData.OrderList.results[selectIdx[i]].Color;							
							orderItem.Txt30 = oData.OrderList.results[selectIdx[i]].Txt30;
							orderItem.Stat  = oData.OrderList.results[selectIdx[i]].Stat;
							orderItem.Aufnr = oData.OrderList.results[selectIdx[i]].Aufnr;
							orderItem.Ktext = oData.OrderList.results[selectIdx[i]].Ktext;
							orderItem.Gstrp = oData.OrderList.results[selectIdx[i]].Gstrp;
							orderItem.Zplhr = oData.OrderList.results[selectIdx[i]].Zplhr;
							orderItem.Ismne = oData.OrderList.results[selectIdx[i]].Ismne;
							orderItem.Isdz  = oData.OrderList.results[selectIdx[i]].Isdz;
							orderItem.Iedz  = oData.OrderList.results[selectIdx[i]].Iedz;
							orderItem.Idaue = oData.OrderList.results[selectIdx[i]].Idaue;
							orderItem.Zid   = oData.OrderList.results[selectIdx[i]].Zid;
							orderItem.Zname = oData.OrderList.results[selectIdx[i]].Zname;
							orderItem.Werks = oData.OrderList.results[selectIdx[i]].Werks;
							orderItem.Auart = oData.OrderList.results[selectIdx[i]].Auart;
							orderItem.Addat = oData.OrderList.results[selectIdx[i]].Addat;
							orderItem.Vaplz = oData.OrderList.results[selectIdx[i]].Vaplz;
							orderItem.Equnr = oData.OrderList.results[selectIdx[i]].Equnr;
							orderItem.Eqktx = oData.OrderList.results[selectIdx[i]].Eqktx;
							orderItem.Qmnum = oData.OrderList.results[selectIdx[i]].Qmnum;
							orderItem.Qmdat = oData.OrderList.results[selectIdx[i]].Qmdat;
							orderItem.Rueck = oData.OrderList.results[selectIdx[i]].Rueck;
							orderItem.Rmzhl = oData.OrderList.results[selectIdx[i]].Rmzhl;
							orderItem.Zcnf  = oData.OrderList.results[selectIdx[i]].Zcnf;
																
							data.OrderList.push(orderItem);
					    }				    
		
						var mParameters = {
							success : function(oData) {
								
							 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
							 oODataJSONModel.setData(oData);
							 var sMessage = "";
								 
							 if(oData.RetType == "E"){
									if(sMode = "S"){		 // S : Project Save,
										sMessage = controll.i18n.getText("projWorkReportError");
									}else if(sMode = "O"){	 // O : Order Complete,
										sMessage = controll.i18n.getText("projWorkReportTechCompletError");
									}else if(sMode = "N"){   // N : Project Complete
										sMessage = controll.i18n.getText("projWorkReportCompletError");
									} 		
									
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
										 sap.m.MessageBox.Icon.ERROR,
										 controll.i18n.getText("error")
									);
								 
							 }else{
								 
								 if(sMode = "S"){		 // S : Project Save,
										sMessage = controll.i18n.getText("projWorkReportSuccess");
									}else if(sMode = "O"){	 // O : Order Complete,
										sMessage = controll.i18n.getText("projWorkReportTechCompletSuccess");
									}else if(sMode = "N"){   // N : Project Complete
										sMessage = controll.i18n.getText("projWorkReportCompletSuccess");
									}  
								 
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
										 sap.m.MessageBox.Icon.SUCCESS,
										 controll.i18n.getText("success")
									);	
								 
								 this.onSearch();								 
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
						
					}else{
						sap.m.MessageBox.show(
								controll.i18n.getText("isnotordercomplete"),
							      sap.m.MessageBox.Icon.WARNING,
							      controll.i18n.getText("warning")
								);						
					}
				}
			},		
			
			onProjectRowSelect : function() {
				var oTable =  this.getView().byId("table_project");
		        
				var idx = oTable.getSelectedIndex();
				var selrow = [];  
				if (idx !== -1) {
				  var cxt = oTable.getContextByIndex(idx); 
				  if(cxt !=null){
					  var path = cxt.sPath;
					  this.obj = oTable.getModel().getProperty(path);
						
					  selrow.push(this.obj);
					  selrow.push(path);
					  //console.log(this.obj);				  
					  //return this.obj, path;
					  return selrow;
				  }else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotselected"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						  
				  }

	
				}else{
					sap.m.MessageBox.show(
					  this.i18n.getText("isnotselected"),
				      sap.m.MessageBox.Icon.WARNING,
				      this.i18n.getText("warning")
					);							
				}
			},	
			
			saveCheckMandatory : function(){
				var controll = this;
				var errCnt   = 0;
							
				var pjTable = controll.getView().byId("table_project");
				var selectIdx = pjTable.getSelectedIndices();

				var oData   = pjTable.getModel().getData();
			    var rows    = pjTable.getRows();
			    
			    if(selectIdx.length != 0){			    	
					 for (var i=0; i<selectIdx.length; i++) {
						 if(oData.ProjectList.results[selectIdx[i]].Stat == ""){  // Not Entered
							 if(oData.ProjectList.results[selectIdx[i]].Zdate == ""){
								 oData.ProjectList.results[selectIdx[i]].ZdateValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZdateValSt = 'None';
							 }
							  
							 if(oData.ProjectList.results[selectIdx[i]].Zftime == "") {
								 oData.ProjectList.results[selectIdx[i]].ZftimeValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZftimeValSt = 'None';
							 }
							 					 
							 if(oData.ProjectList.results[selectIdx[i]].Zttime == ""){
								 oData.ProjectList.results[selectIdx[i]].ZttimeValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZttimeValSt = 'None';
							 }		
							 
							 if(oData.ProjectList.results[selectIdx[i]].Zwhour == ""){
								 oData.ProjectList.results[selectIdx[i]].ZwhourValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZwhourValSt = 'None';
							 }					 

							 if(oData.ProjectList.results[selectIdx[i]].Arbpl == ""){
								 oData.ProjectList.results[selectIdx[i]].ArbplValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ArbplValSt = 'None';
							 }									 
							 							 
							 if(oData.ProjectList.results[selectIdx[i]].Ztodwr == ""){
								 oData.ProjectList.results[selectIdx[i]].ZtodwrValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZtodwrValSt = 'None';
							 }	
							 
							 if(oData.ProjectList.results[selectIdx[i]].Ztomwr == ""){
								 oData.ProjectList.results[selectIdx[i]].ZtomwrValSt = 'Error';
								 errCnt++;
							 }else{
								 oData.ProjectList.results[selectIdx[i]].ZtomwrValSt = 'None';
							 }								 
						 }						 						 			 
					}	
					 			
					if(errCnt > 0){
						pjTable.getModel().refresh();

						 return false;				
					}else{
						return true;
					}			    	
			    }else{
					sap.m.MessageBox.show(
					  this.i18n.getText("isnotselected"),
				      sap.m.MessageBox.Icon.WARNING,
				      this.i18n.getText("warning")
					);		
					
					return true;
			    }
			},
						
			projectUpdate_old : function(sMode, sObj){		// S : Project Save, O : Order Complete, N : Project Complete
				var controll = this;
				var oModel = this.getView().getModel();
				var chkIndex = 0;

				var oTable = this.getView().byId("table_project");
				var selectIdx = oTable.getSelectedIndices();
				
				var s_swerk = this.getView().byId("swerk").getSelectedKey();
								
//				  Not Entered " qmnum is initial
//				  Entered	  " inact eq ''
//				  Completed   " inact eq c_x
				if(sObj){
					if((sMode == 'S' && sObj.Qmnum == "") || (sMode == 'N' && sObj.Qmnum != "" && sObj.Inact == "")){
		
//						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//						oODataJSONModel.setData();
		
						//var tableModel = new sap.ui.model.json.JSONModel();
						var tableModel = oTable.getModel();
						var oData = tableModel.getData();
		
						var data = {};
						data.Spras  = this.getLanguage();
						data.Swerk  = s_swerk;
						data.Zmode  = sMode;
						 
					    data.ProjectList = [];	
	
						for(var i=0; i<selectIdx.length; i++){
							var projectItem = {};
							
							projectItem.Seq    = oData.ProjectList.results[selectIdx[i]].Seq.toString();
							projectItem.Zicon  = oData.ProjectList.results[selectIdx[i]].Zicon;
							projectItem.Txt20  = oData.ProjectList.results[selectIdx[i]].Txt20;
							projectItem.Color  = oData.ProjectList.results[selectIdx[i]].Color;							
							projectItem.Txt30  = oData.ProjectList.results[selectIdx[i]].Txt30;
							projectItem.Stat   = oData.ProjectList.results[selectIdx[i]].Stat;
							projectItem.ExecId = oData.ProjectList.results[selectIdx[i]].ExecId;
							projectItem.Incode = oData.ProjectList.results[selectIdx[i]].Incode;
							projectItem.Qmnum  = oData.ProjectList.results[selectIdx[i]].Qmnum;
							projectItem.Zdate  = oData.ProjectList.results[selectIdx[i]].Zdate;							
							projectItem.Zftime = oData.ProjectList.results[selectIdx[i]].Zftime;
							projectItem.Zttime = oData.ProjectList.results[selectIdx[i]].Zttime;
							projectItem.Zwhour = oData.ProjectList.results[selectIdx[i]].Zwhour.toString();
							projectItem.Meins  = oData.ProjectList.results[selectIdx[i]].Meins;
							projectItem.Arbpl  = oData.ProjectList.results[selectIdx[i]].Arbpl;
							projectItem.Zid    = oData.ProjectList.results[selectIdx[i]].Zid;
							projectItem.Qmnam  = oData.ProjectList.results[selectIdx[i]].Qmnam;
							projectItem.Zidtxt = oData.ProjectList.results[selectIdx[i]].Zidtxt;
							projectItem.Ztodwr = oData.ProjectList.results[selectIdx[i]].Ztodwr;
							projectItem.Ztomwr = oData.ProjectList.results[selectIdx[i]].Ztomwr;
							projectItem.Zwremk = oData.ProjectList.results[selectIdx[i]].Zwremk;
							projectItem.Inact  = oData.ProjectList.results[selectIdx[i]].Inact;
							projectItem.Swerk  = oData.ProjectList.results[selectIdx[i]].Swerk;
							
							data.ProjectList.push(projectItem);
					    }				    
		
						var mParameters = {
							success : function(oData) {
								
							var sMessage = "";
																 
							 if(oData.RetType == "E"){
								 
									if(sMode = "S"){		 // S : Project Save,
										sMessage = controll.i18n.getText("projWorkReportError");
									}else if(sMode = "O"){	 // O : Order Complete,
										sMessage = controll.i18n.getText("projWorkReportTechCompletError");
									}else if(sMode = "N"){   // N : Project Complete
										sMessage = controll.i18n.getText("projWorkReportCompletError");
									} 	
									
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
										 sap.m.MessageBox.Icon.ERROR,
										 controll.i18n.getText("error")
									);
								 
							 }else{
								 
								 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
								 oODataJSONModel.setData(oData);
								 
								 oTable.setModel(oODataJSONModel);
								 oTable.bindRows("/ProjectList/results");
								 
								 if(sMode = "S"){		 // S : Project Save,
										sMessage = controll.i18n.getText("projWorkReportSuccess");
									}else if(sMode = "O"){	 // O : Order Complete,
										sMessage = controll.i18n.getText("projWorkReportTechCompletSuccess");
									}else if(sMode = "N"){   // N : Project Complete
										sMessage = controll.i18n.getText("projWorkReportCompletSuccess");
									}  
								 
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
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
						
					}else{
						var message = "";
						var modeText;
						if(sMode == "S"){
							modeText = controll.i18n.getText("save");
						}else{
							modeText = controll.i18n.getText("complete");
						}
						
						message = controll.i18n.getText("isnotprojectsavecomplete", [modeText]);
						
						sap.m.MessageBox.show(
								  message,
							      sap.m.MessageBox.Icon.WARNING,
							      controll.i18n.getText("warning")
								);						
					}
				}
			},		
			
			
			projectUpdate : function(sMode, sObj, sPath){		// S : Project Save, O : Order Complete, N : Project Complete
				var controll = this;
				var oModel = this.getView().getModel();
				var chkIndex = 0;

				var oTable = this.getView().byId("table_project");
				var selectIdx = oTable.getSelectedIndices();
				
				var s_swerk = this.getView().byId("swerk").getSelectedKey();
								
//				  Not Entered " qmnum is initial
//				  Entered	  " inact eq ''
//				  Completed   " inact eq c_x
				if(sObj){
					if((sMode == 'S' && sObj.Qmnum == "") || (sMode == 'N' && sObj.Qmnum != "" && sObj.Inact == "")){
		
						var tableModel = oTable.getModel();
		
						var data = {};
						data.Spras  = this.getLanguage();
						data.Swerk  = s_swerk;
						data.Zmode  = sMode;
						 
					    data.ProjectList = [];	
	
						var projectItem = {};
						
						projectItem.Seq    = sObj.Seq.toString();
						projectItem.Zicon  = sObj.Zicon;
						projectItem.Txt20  = sObj.Txt20;
						projectItem.Color  = sObj.Color;							
						projectItem.Txt30  = sObj.Txt30;
						projectItem.Stat   = sObj.Stat;
						projectItem.ExecId = sObj.ExecId;
						projectItem.Incode = sObj.Incode;
						projectItem.Qmnum  = sObj.Qmnum;
						projectItem.Zdate  = sObj.Zdate;							
						projectItem.Zftime = sObj.Zftime;
						projectItem.Zttime = sObj.Zttime;
						projectItem.Zwhour = sObj.Zwhour.toString();
						projectItem.Meins  = sObj.Meins;
						projectItem.Arbpl  = sObj.Arbpl;
						projectItem.Zid    = sObj.Zid;
						projectItem.Qmnam  = sObj.Qmnam;
						projectItem.Zidtxt = sObj.Zidtxt;
						projectItem.Ztodwr = sObj.Ztodwr;
						projectItem.Ztomwr = sObj.Ztomwr;
						projectItem.Zwremk = sObj.Zwremk;
						projectItem.Inact  = sObj.Inact;
						projectItem.Swerk  = sObj.Swerk;
						
						data.ProjectList.push(projectItem);
					    
		
						var mParameters = {
							success : function(oData) {
								
								var sMessage = "";
																 
							 if(oData.RetType == "E"){
								 
								if(sMode = "S"){		 // S : Project Save,
									sMessage = controll.i18n.getText("projWorkReportError");
								}else if(sMode = "O"){	 // O : Order Complete,
									sMessage = controll.i18n.getText("projWorkReportTechCompletError");
								}else if(sMode = "N"){   // N : Project Complete
									sMessage = controll.i18n.getText("projWorkReportCompletError");
								} 	
									
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
										 sap.m.MessageBox.Icon.ERROR,
										 controll.i18n.getText("error")
									);
								 
							 }else{
								 
								 var selRow = tableModel.getProperty(sPath);
								 
								 selRow.Qmnum = oData.ProjectList.results[0].Qmnum;
								 selRow.Zicon = oData.ProjectList.results[0].Zicon;
								 selRow.Txt20 = oData.ProjectList.results[0].Txt20;
								 selRow.Color = oData.ProjectList.results[0].Color;	
								 selRow.Enable = oData.ProjectList.results[0].Enable;	
								 
								 tableModel.refresh();
								 		
								 if(sMode = "S"){		 // S : Project Save,
										sMessage = controll.i18n.getText("projWorkReportSuccess");
									}else if(sMode = "O"){	 // O : Order Complete,
										sMessage = controll.i18n.getText("projWorkReportTechCompletSuccess");
									}else if(sMode = "N"){   // N : Project Complete
										sMessage = controll.i18n.getText("projWorkReportCompletSuccess");
									}  
								 
								 sap.m.MessageBox.show(
										 sMessage, //oData.RetMsg,
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
						
					}else{
						var message = "";
						var modeText;
						if(sMode == "S"){
							modeText = controll.i18n.getText("save");
						}else{
							modeText = controll.i18n.getText("complete");
						}
						
						message = controll.i18n.getText("isnotprojectsavecomplete", [modeText]);
						
						sap.m.MessageBox.show(
								  message,
							      sap.m.MessageBox.Icon.WARNING,
							      controll.i18n.getText("warning")
								);						
					}
				}
			},		
			
			onPress_save: function(){
				var controll = this;
				
				//var sObj = controll.onProjectRowSelect();		
				
				var v_selrow = controll.onProjectRowSelect();
				if(v_selrow != undefined){
					var sObj = v_selrow[0];
					var sPath = v_selrow[1];
					
					if(sObj){
						var result = controll.saveCheckMandatory();
						
						if(result){
							controll.projectUpdate("S", sObj,  sPath);
						}else{
							 sap.m.MessageBox.show(
									 controll.i18n.getText("check_mandatory"),
									 sap.m.MessageBox.Icon.ERROR,
									 controll.i18n.getText("Error")
								);	
						}	
						
					}
				}
			},					
			
			onPress_pcomplete: function(){
				var controll = this;
				
				//var sObj = controll.onProjectRowSelect();	
				var v_selrow = controll.onProjectRowSelect();
				var sObj = v_selrow[0];
				var sPath = v_selrow[1];
				
				if(sObj){
					controll.projectUpdate("N", sObj, sPath);					
				}
			},	
			
			handleChangeZdate : function(oEvent){
				var oDP = oEvent.oSource;
				
				oEvent.getSource().setDisplayFormat(this.dateFormat);
//				oEvent.getSource().setValueFormat("yyyyMMdd");
				
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
			},			
			
			handleChangeFTime : function(oEvent){
				//debugger;
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				
				var oTable =  this.getView().byId("table_project");
				var idx = oEvent.getSource().oParent.getIndex();
				var rows = oTable.getModel().oData.ProjectList.results[idx];
								
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
					if(rows.Zttime != ""){
						if(sValue > rows.Zttime){
							oDP.setValueState(sap.ui.core.ValueState.Error);
							rows.Zwhour = "";
						}else{
							rows.Zwhour = utils.cal_time(sValue, rows.Zttime);
							rows.ZftimeValSt = 'None';
							rows.ZttimeValSt = 'None';
						}
						oTable.getModel().oData.refresh();						
					}
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
			},		
			
			handleChangeTTime : function(oEvent){
				//debugger;
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				var bValid = oEvent.getParameter("valid");
				
				var oTable =  this.getView().byId("table_project");
				var idx = oEvent.getSource().oParent.getIndex();
				var rows = oTable.getModel().oData.ProjectList.results[idx];
				
				this._iEvent++;
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);	
					if(rows.Zftime != ""){
						if(sValue < rows.Zftime){
							oDP.setValueState(sap.ui.core.ValueState.Error);
							rows.Zwhour = "";
						}else{
							rows.Zwhour = utils.cal_time(rows.Zftime, sValue);
							rows.ZftimeValSt = 'None';
							rows.ZttimeValSt = 'None';							
						}
						
						oTable.getModel().refresh();						
					}
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
			},		

			handleChangeData : function(oEvent){
				var oDP = oEvent.oSource;
				var sValue = oEvent.getParameter("value");
				this._iEvent++;
				if (sValue) {
					oDP.setValueState(sap.ui.core.ValueState.None);				
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}				
			},			

			onAdd : function(oEvent){			
				var id       = this.getLoginId();
				
//				 if (window.location.hostname == "localhost") {
//					 var fullName = "홍길동";
//				 }else{
//					 var fullName = this.getLoginInfo().getFullName();
//				 }
				
				var fullName = this.getLoginInfo().getLastName();
				
				var vaplz = this.getView().byId("vaplz").getSelectedKey();
				var create_init;
				var oData = {};
				var ProjectList = {};
				var list = [];
				var oPTable = this.getView().byId("table_project");
	            var tableModel = oPTable.getModel();
	            
	            var seq = 0;
	            
	            if(tableModel.getData()){
	            	oData = tableModel.getData();
	                list = oData.ProjectList.results;
		                if(list.length > 0){
			                var idx = list.length - 1;
			                seq = list[idx].Seq;
		                }else{
		                	seq = 0;
		                	create_init = "X";
		                }            	
	            }else{
	            	create_init = "X";  // create mode 시 최초 row 생성 시
	            }

	            var s_swerk = this.getView().byId("swerk").getSelectedKey();
	            var next_seq = parseInt(seq) + 1;
	            
	            var results = [];
	            list.push({
					"Seq" : next_seq,
					"Zicon"  : "",
					"Color"  : "",
					"Txt20"  : "",
					"Stat"   : "",
					"Txt30"  : "",
					"ExecId" : "",
					"Incode" : "",
					"Posid"  : "",
					"Qmnum"  : "",
					"Zdate"  : "",
					"Zftime" : "",
					"Zttime" : "",
					"Zwhour" : "",
					"Meins"  : "",
					"Zid"    : id,
					"Qmnam"  : id, //fullName,
					"Zidtxt" : fullName + "(" + id + ")",
					"Ztodwr" : "",
					"Ztomwr" : "",
					"Zwremk" : "",
					"Inact"  : "",
					"Arbpl"  : vaplz,
					"Objid"  : "",
					"Swerk"  : s_swerk,
					"Enable" : true,
					"Items" :  this.oWocList
				});
	           
	           ProjectList.results = list;
			   oData.ProjectList = ProjectList;
			   
			   if(create_init === "X"){
				 
				 var oODataJSONModel = new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 		     
			     oPTable.setModel(oODataJSONModel);
			     oPTable.bindRows("/ProjectList/results");
			     
			     create_init = "";
			     
			   }else{
			     tableModel.setData(oData);
			   }				
						   
			   var idx = list.length-1;
			   oPTable.setFirstVisibleRow(idx);
			   oPTable.setSelectedIndex(idx);
			},
			
			
			
			onDelete : function(oEvent){		
				var oPTable = this.getView().byId("table_project");
				
				var aIndices = oPTable.getSelectedIndices();
				if (aIndices.length < 1) {
					Toast.show(this.i18n.getText("isnotselected"));
					return;
				}
				
				//var tableModel = oTable.getModel("tableModel");
				var tableModel = oPTable.getModel();
				var odata = tableModel.getData();
				var hditem = odata.ProjectList.results;
				
				var cnt = hditem.length - 1 ;
				
				for(var i=cnt; i>=0; i--){
					for(var j=0; j<aIndices.length; j++){
					   if(i === aIndices[j] ){
						   var removed = hditem.splice(i, 1);
						   break;
					   }
					}	
				};
				
				var seq = 1;
				for(var i=0; i<hditem.length; i++){
					hditem[i].Seq = seq;
					seq = seq + 1;
				}
				
				odata.ProjectList.results = hditem;
				tableModel.setData(odata);
				
				oPTable.clearSelection();
			},			
			/****************************************************************
			 *  WorkResult_pop Event
			 ****************************************************************/						
		    onResultCancelDialog : function(oEvent){    	
		    	this._oDialog_workresult.close();
			},			
			
						
//			onResultAfterClose : function (oEvent){
//				this.renderingSkip = "X";
//		    	this._oDialog_workresult.destroy();
//		    	this._oDialog_workresult = "";
//		    	this._workresult_Dialog_handler.destroy();
//		    	this._workresult_Dialog_handler = "";		
//			},	    				
			onClose_workResult : function (oEvent){
		    	this.onSearch();
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