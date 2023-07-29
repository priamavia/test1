sap.ui.define([
		"cj/pm0080/controller/BaseController",
		"cj/pm0080/util/ValueHelpHelper",
		"cj/pm0080/util/utils",
		"cj/pm0080/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global",
	], function (BaseController, ValueHelpHelper, utils, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
		"use strict";

		return BaseController.extend("cj.pm0080.controller.Main", {
           formatter : formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
			onInit : function () {
			   
				var oView = this.getView();

				oView.setModel(new JSONModel({
					globalFilter: "",
					availabilityFilterOn: false,
					cellFilterOn: false
				}), "ui");

			},

		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();
//			    
//				utils.makeSerachHelpHeader(this);	

				this.getLoginInfo();
				this.set_userData();  //"User Auth"	
				
			},
			
		/**
		* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		* This hook is the same one that SAPUI5 controls get after being rendered.
		*/
/*		    onAfterRendering: function() {
			    	

//			    jQuery.sap.delayedCall(d5000, this, function() {
//			    	$("input[id*='createby']").focus().trigger("");
//			    });
//			
			},*/

		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		*/
//			onExit: function() {
//			},
			
			
			setInitData : function(){
//				var fromDate = new Date();
//				var fromday = fromDate.getDate() - 30;
//				fromDate.setDate( fromday );
//			    this.getView().byId("period_from").setDateValue( fromDate );				
//			    this.getView().byId("period_to").setDateValue( new Date() );	
			    var period_from = this.getView().byId("period_from");				
			    var period_to   = this.getView().byId("period_to");
			    
			    period_from.setDisplayFormat(this.dateFormat);
			    period_from.setValueFormat("yyyyMMdd");
			    
			    period_to.setDisplayFormat(this.dateFormat);
			    period_to.setValueFormat("yyyyMMdd");
			    		    
			    //var fromDate = this.formatter.strToDate(this.locDate);
			    var todayDate = this.formatter.strToDate(this.locDate);
			    
				var fromDate = new Date()
				var fromDay =  todayDate.getDate() - 30;
				fromDate.setDate( fromDay );
				
			    var toDate = new Date();
				var toDay =  todayDate.getDate() + 14;
				toDate.setDate( toDay );
			
				period_from.setDateValue( fromDate );				
				period_to.setDateValue( toDate );	

			    this.getView().byId("table").setShowNoData(false);
			    
         		if(window.location.hostname != "localhost"){
         		  //this.getView().byId("createby").setValue(this.getLoginInfo().getFullName());" 
         			this.getView().byId("createby").setValue(this.getLoginId());
         		}else{
         			this.getView().byId("createby").setValue("홍길동");
         		}
			    
			    var default_swerk ;
				this.oSwerk = this.getView().byId("swerk");

				if(this.oSwerk && this.oSwerk.getItems().length == 0 ){
					for(var j=0; j<this.arr_swerk.length; j++){
						var template = new sap.ui.core.Item();
			            template.setKey(this.arr_swerk[j].Value);
			            template.setText(this.arr_swerk[j].KeyName);
			            this.oSwerk.addItem(template);
			            
			            if(this.arr_swerk[j].Default ===  'X'){
			            	default_swerk = j;
			            }
				     }
			        this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
				}
				
				var oView = this.getView();
				var v_swerk = this.oSwerk.getSelectedKey();
				if(v_swerk.substring(0,1) == "2"){
					oView.setModel(new JSONModel({
						ExtWorkVisible 	: true,
						TpmTag			: false
					}), "readNoti");				
					
				}else{
					if(v_swerk == "5030"){
						oView.setModel(new JSONModel({
							ExtWorkVisible 	: false,
							TpmTag			: true
						}), "readNoti");						
					}else{
						oView.setModel(new JSONModel({
							ExtWorkVisible 	: false,
							TpmTag			: false
						}), "readNoti");						
					}
									
				}
				
							    
//			    var order = this.getView().byId("assign");
//			    order.setSelectedKey("N");				
			},

	        /*
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
					   
//					   debugger;
					   controll.i18n = controll.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);
						
					   controll.set_auth();
					   controll.set_auth_screen();
					   controll.setInitData();
					   controll._set_search_field();  // set Search Help
					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},

			
			//* User Default Setting 
			set_auth : function(){
				this.arr_swerk = this.get_Auth("SWERK");				
				this.arr_kostl = this.get_Auth("KOSTL");
				this.arr_kokrs = this.get_Auth("KOKRS");
//				this.local_date = this.get_Auth("LOCDAT");
//				this.dateformat = this.get_Auth("DATFORMAT");
//				this.timezone = this.get_Auth("TIMEZ");			
				this.locDate    = this.get_Auth("LOCDAT")[0].Value;
				this.locTime    = this.get_Auth("LOCTIM")[0].Value;
				this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
				this.sep        = this.get_Auth("SEP")[0].Value;	
				this.zpm_role   = this.get_Auth("ZPM_ROLE");
			},
			
			
			set_auth_screen : function(){
				
			   var oModel = this.getView().getModel("auth");
			   
			   var controll = this;
			   var s_filter = [];  
                                     
               var s_zpm_role = []; //권한 
               var s_zprogram = []; //프로그램 
               var s_swerk = []; //swerk
                
               if(this.zpm_role){
	              for(var i=0; i<this.zpm_role.length; i++){
	            	  s_zpm_role.push(this.zpm_role[i].Value);
	              }
	              
	              if(s_zpm_role.length>0){
	            	  s_filter.push(utils.set_filter(s_zpm_role, "ZpmRole"))
	              }
               }
               
               if(this.arr_swerk){
 	              for(var i=0; i<this.arr_swerk.length; i++){
 	            	  s_swerk.push(this.arr_swerk[i].Value);
	              }
	              
	              if(s_swerk.length>0){
	            	  s_filter.push(utils.set_filter(s_swerk, "Swerk"))
	              }
               }
               
               //프로그램 명 
               s_zprogram.push("ZPM_UI_0080");
               s_filter.push(utils.set_filter(s_zprogram, "Zprogram"))
               
			   var filterStr;
			   for(var i=0; i<s_filter.length; i++){
				  if(i === 0){
					  filterStr = s_filter[i];
				  }else{
					  filterStr = filterStr + " and " + s_filter[i];
				  }
			   }
			  // Swerk='',Zprogram='',ZpmRole=''
			   var path = "/InputSet(Swerk='',Zprogram='',ZpmRole='')";
			   var mParameters = {
					urlParameters : {
						"$expand" : "ResultList",
						"$filter" : filterStr
					},
					success : function(oData) {
					   var uiauth = [];
					  
					   for(var i=0; i<oData.ResultList.results.length; i++){
						   uiauth.push(
							 {
						    	"Program" : oData.ResultList.results[i].Zprogram,
						    	"UiID" : oData.ResultList.results[i].Uicomp,
						    	"Plant"  : oData.ResultList.results[i].Swerk,
						    	"isVisible" : oData.ResultList.results[i].VisibleCtrl,
						    	"isEditable" : oData.ResultList.results[i].EditableCtrl
							  }
						   );
					   }	
					   controll.set_uiCtrlAuth(uiauth);
					   controll.set_auth_screen_ctrl();

					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
				};
				oModel.read(path, mParameters);			
			},
			
			
			set_auth_screen_ctrl : function(){
				var s_ctrl = this.get_uiCtrlAuth();
				
				var s_swerk = this.oSwerk.getSelectedKey();
				
				var chk = 0;
				var obj_ctrl = [];
				var swerk_ctrl = [];
				var swerk_all = [];
				
				for(var i in s_ctrl){
					var item = {};				
					item.Program = s_ctrl[i].Program;
					item.UiID = s_ctrl[i].UiID;
					
					var dup = 0;
					for(var t in obj_ctrl){
						if ( obj_ctrl[t].Program == s_ctrl[i].Program && 
							 obj_ctrl[t].UiID == s_ctrl[i].UiID 	){
							 dup = dup + 1;
						} 
					}
					if(dup == 0){
						obj_ctrl.push(item);
					}

					
					if(s_ctrl[i].Plant == s_swerk){
                        swerk_ctrl.push(s_ctrl[i]);
					}
					if(s_ctrl[i].Plant == "*"){
	                    swerk_all.push(s_ctrl[i]);
				    }
				}
								
			   for(var i in obj_ctrl){
				   var chk = 0;
				   for(var j in swerk_ctrl){
					   if(obj_ctrl[i].Program == swerk_ctrl[j].Program && obj_ctrl[i].UiID == swerk_ctrl[j].UiID){
						   this.getView().byId(swerk_ctrl[j].UiID).setVisible(swerk_ctrl[j].isVisible);
						   
						   if(this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.Input ||
						      this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.MultiInput ||
						      this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.ComboBox ){
							  this.getView().byId(swerk_ctrl[j].UiID).setEditable(swerk_ctrl[j].isEditable);
						   }else if(this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.Select ){
							  this.getView().byId(swerk_ctrl[j].UiID).setEnabled(swerk_ctrl[j].isEditable);
						   }
						   chk = 1;
					   }
				   }
				   
				   if(chk == 0){
					   for(var j in swerk_all){
						   if(obj_ctrl[i].Program == swerk_all[j].Program && obj_ctrl[i].UiID == swerk_all[j].UiID){
							   this.getView().byId(swerk_all[j].UiID).setVisible(swerk_all[j].isVisible);
							   
							   if(this.getView().byId(swerk_all[j].UiID) instanceof sap.m.Input ||
							      this.getView().byId(swerk_all[j].UiID) instanceof sap.m.MultiInput ||
							      this.getView().byId(swerk_all[j].UiID) instanceof sap.m.ComboBox ){
								  this.getView().byId(swerk_all[j].UiID).setEditable(swerk_all[j].isEditable);
							   }else if(this.getView().byId(swerk_all[j].UiID) instanceof sap.m.Select ){
								  this.getView().byId(swerk_all[j].UiID).setEnabled(swerk_all[j].isEditable);
							   }
						   }
					   }
				   }
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
				var oFl = this.getView().byId("fl");
				oFl.setTokens(aTokens);
			},
			
			
	/****************************************************************
	 *  Event Handler
	 ****************************************************************/
			
           onValueHelpRequest : function(oEvent){
				
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
				
				var s_swerk = this.oSwerk.getSelectedKey();
				
				if(sIdstr === "equnr"){
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "MultiToggle", s_swerk);
				}else if(sIdstr === "fl"){
					var tokens = oEvent.getSource().getTokens();
					this.getOwnerComponent().openFuncLocation_Dialog(this,  "MultiToggle",  s_swerk, tokens);
				}else{
					utils.openValueHelp(sIdstr);
				}
			},
						
			
			onSearch : function(oEvent){
				var result = utils.checkMandatory(this, "mainpage");
				
				if(result){
				   result = this.check_data();
					
				   if(result){
					this.get_data(oEvent);
				   }
				}else{
//					debugger;
					sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
					    this.i18n.getText("Error")
					);
				}
			},
			
			
			onDownloadExcel : function(oEvent){
				var oModel, oTable, sFilename;
				
				oTable = this.getView().byId("table");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename);
			},
			
			
			onClearAllSortings : function(oEvent){
				var oTable = this.getView().byId("table");
				oTable.getBinding("rows").sort(null);
				utils.resetSortingState(oTable);
			},
			
			
			onClearAllFilters : function(oEvent){
				var oTable = this.getView().byId("table");

				var oUiModel = this.getView().getModel("ui");
				oUiModel.setProperty("/globalFilter", "");
				oUiModel.setProperty("/availabilityFilterOn", false);
				oUiModel.setProperty("/cellFilterOn", false);

				this._oGlobalFilter = null;
				this._filter(); 

				var aColumns = oTable.getColumns();
				for (var i = 0; i < aColumns.length; i++) {
					oTable.filter(aColumns[i], null);
				}
			},
			
			
			onFilterGlobally : function(oEvent){
				var sQuery = oEvent.getParameter("query");
				this._oGlobalFilter = null;
				if (sQuery) {
					this._oGlobalFilter = new Filter(
					[
						new Filter("Qmnum", FilterOperator.Contains,sQuery),  //Notification
						new Filter("Qmnam", FilterOperator.Contains,sQuery),  //Noti. by
						new Filter("Invnr", FilterOperator.Contains,sQuery),  //tag#
						new Filter("Qmtxt", FilterOperator.Contains,sQuery)   //Desc
				    ], 
				    false)
				}
				this._filter();
			},
		
			
			// MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
			onChange : function(oEvent){
				
				var strArr = oEvent.oSource.sId.split("--");
				var cnt = strArr.length - 1;
				var sIdstr = strArr[cnt];
				
				if(sIdstr === "not"){
					//utils.set_token(this.oNot, oEvent);
				}else if(sIdstr === "cac"){
					//utils.set_token(this.oCac, oEvent);
				}else if(sIdstr === "loc"){
					//utils.set_token(this.oLoc, oEvent);
				}else if(sIdstr === "coc"){
					utils.set_token(this.oCoc, oEvent);
				}else if(sIdstr === "woc"){
					utils.set_token(this.oWoc, oEvent);
				}
			},
			
			
			// Maint. Plant를 변경 했을때  
			onSelChange : function(){
				
				//this.oNot.removeAllTokens();
				this.oNot.setSelectedKey("");
				//this.oCac.removeAllTokens();
				this.oCac.setSelectedKey("");
				this.fl.removeAllTokens();
				//this.oLoc.removeAllTokens();
				this.oLoc.setSelectedKey("");
				this.equnr.removeAllTokens();
				this.oCoc.removeAllTokens();
		    	//this.oWoc.removeAllTokens();  
				this.oWoc.setSelectedKey("");
		    	//this.getView().byId("createby").setValue("");
		    	
				this.oDpt.setSelectedKey("");			
				
		    	this._set_search_field();
		    	this.set_auth_screen_ctrl();
		    	
			    var screenModel = this.getView().getModel("readNoti");
				var screenData = screenModel.getData();
				
				var v_swerk = this.oSwerk.getSelectedKey();
				if(v_swerk.substring(0,1) == "2"){
					screenData.ExtWorkVisible = true;				
					
				}else{
					screenData.ExtWorkVisible = false;								
				}		    	
				
				if(v_swerk == "5030"){
					screenData.TpmTag = true;				
					
				}else{
					screenData.TpmTag = false;								
				}
				
				screenModel.refresh();				
				
			},
			
			
			onPress_qmnum : function(oEvent){
				
				var v_qmnum = oEvent.getSource().getText();
				
				if(v_qmnum){
					this.toCreateNoti("U",v_qmnum);
				}
				
			},
			
			
			onPress_aufnr : function(oEvent){
//				debugger;
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
							  params: {param_mode: 'D',
								  	   param_swerk : sObj.Swerk,
								       param_order : sObj.Aufnr
//								       ,
//								       param_qmnum : sObj.Qmnum,
//								       param_woc   : sObj.ArbplCode
								       }
							});
		
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);	
					}
				}
				
			},					
			
			onPress_detail : function(oEvent){
				
			   var oTable = this.getView().byId("table");
			   
			   if(oTable.getModel().getData()){
				   var oData = oTable.getModel().getData().ResultList;		
			   }else{
				   return;
			   }
			   
			   if( oTable.getSelectedIndices().length == 1 ){
				   
				   var v_qmnum = oData.results[oTable.getSelectedIndices()[0]].Qmnum;
				   this.toCreateNoti("D",v_qmnum);
				   
			   }else{
				   sap.m.MessageBox.show(
				     this.i18n.getText("err_selnoti"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.i18n.getText("Error")
				   );
			   }
				
			},
			
			
			onPress_noti : function(oEvent){
		       
			   var controll = this;
			   
			   Message.confirm(this.i18n.getText("confirm_msg_noti"), 
					{//title: "", 
		             onClose : function(oAction){
					   	if(oAction=="OK"){
					   		controll.toCreateNoti("C", "");
						}else{
							return false;
						}
					 },
		             styleClass: "",
		             initialFocus: sap.m.MessageBox.Action.OK,
		             textDirection : sap.ui.core.TextDirection.Inherit }
			   );	
			   
			   
            /* var hrefForProductDisplay = this.oCrossAppNav.hrefForExternal({
   		      target : { semanticObject : "ZPM_SO_0090", action : "display" },
		            params : { param1 : "102343333" }
   	         });*/

			},
			
			onPress_order : function(oEvent){				
			   var controll = this;
			   var oTable = this.getView().byId("table");	
	            
			   
			   if(oTable.getModel().getData()){
				   //var oData = oTable.getModel().getData().ResultList;
			   }else{
				   return;
			   }
				   
			   if( oTable.getSelectedIndices().length == 1 ){
				   //해당 noti의 실제 오더 정보돠 상태를 가져와야 함
				   var selRow = oTable.getBinding().getCurrentContexts()[0].getProperty();
				   var chk = this.check_assgin_order(selRow);
				  // var chk = this.check_assgin_order(oData.results[oTable.getSelectedIndices()[0]]);				   
			    }else{
				   sap.m.MessageBox.show(
				     this.i18n.getText("err_selnoti"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.i18n.getText("Error")
				   );
				   return;
			    }
			}, 
					
			check_assgin_order : function(selRow){
				var v_qmnum = selRow.Qmnum;
				var v_woc = selRow.ArbplCode;
				var v_swerk = selRow.Swerk;
				var v_auart = selRow.Auart;

				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
								
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
				
				var path = "/OutputSet(Qmnum='"+v_qmnum+"')";
				var mParameters = {
					success : function(oData) {
						if(oData.Phase  == "3" && !oData.Aufnr){

						   if(oData.Zbmind){							   
							   // 20210813 ENG혁신팀 조영내님 요청. NM통지일때도 오더 생성가능하도록 해달라.
							   //if(oData.Zbmind != "NM"){
								   controll.assign_order(v_qmnum, v_woc, v_swerk, v_auart);

								   return true;
							   /*}else{
								   sap.m.MessageBox.show(
										   controll.i18n.getText("chk_zbmind_nm"),  // 
										   sap.m.MessageBox.Icon.ERROR,
										   controll.i18n.getText("error")
										); 
								   return false;								   
							   }*/
						   }else{
							   sap.m.MessageBox.show(
									   controll.i18n.getText("chk_zbmind"),  // 
									   sap.m.MessageBox.Icon.ERROR,
									   controll.i18n.getText("error")
									); 
							   return false;
						   }

						}else{
						
						   if(oData.Aufnr){
							   sap.m.MessageBox.show(
								   controll.i18n.getText("chk_order"),  // 
								   sap.m.MessageBox.Icon.ERROR,
								   controll.i18n.getText("error")
								); 
						   }else{
							   sap.m.MessageBox.show(
								   controll.i18n.getText("chk_stat"),  // 
								   sap.m.MessageBox.Icon.ERROR,
								   controll.i18n.getText("error")
								); 
						   }
						   return false;
					    }
					}.bind(this),
					error : function() {
					   sap.m.MessageBox.show(
						 controll.i18n.getText("error"),
						 sap.m.MessageBox.Icon.ERROR,
						 controll.i18n.getText("error")
					   );
					}.bind(this)
				};
			     oModel.read(path, mParameters);
			},
			
			
			assign_order : function(qmnum, woc, swerk, auart){
               var controll = this;
               
			   Message.confirm(this.i18n.getText("confirm_msg_order"), 
						{//title: "", 
			             onClose : function(oAction){
						   	if(oAction=="OK"){
						   		controll.toCreateOrder(qmnum, woc, swerk, auart);
							}else{
								return false;
							}
						 },
			             styleClass: "",
			             initialFocus: sap.m.MessageBox.Action.OK,
			             textDirection : sap.ui.core.TextDirection.Inherit }
				   );
			},
			
			onPress_comp : function(oEvent){				
			   var controll = this;
			   var oTable = this.getView().byId("table");	
	           		   
			   if(oTable.getModel().getData()){
				   //var oData = oTable.getModel().getData().ResultList;
			   }else{
				   return;
			   }
				   
			   if( oTable.getSelectedIndices().length == 1 ){
				   //해당 noti의 실제 오더 정보돠 상태를 가져와야 함
				   var selRow = oTable.getBinding().getCurrentContexts()[0].getProperty();
				   var chk = this.check_noti_complete(selRow);
			    }else{
				   sap.m.MessageBox.show(
				     this.i18n.getText("err_selnoti"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.i18n.getText("Error")
				   );
				   return;
			    }
			}, 		
			
			check_noti_complete : function(selRow){
				var v_qmnum = selRow.Qmnum;
				var v_swerk = selRow.Swerk;
				var v_timeStamp = selRow.Timestamp

				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
								
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
							
				var path = "/OutputSet(Qmnum='"+v_qmnum+"')";
				var mParameters = {
					success : function(oData) {

					   if(oData.Zbmind){
						   if(oData.Zbmind == "NM"){
							   controll.noti_complete(v_qmnum, v_swerk, v_timeStamp);

							   return true;
						   }else{
							   sap.m.MessageBox.show(
									   controll.i18n.getText("chk_zbmind_comp_nm"),  // 
									   sap.m.MessageBox.Icon.ERROR,
									   controll.i18n.getText("error")
									); 
							   return false;								   
						   }
					   }else{
						   sap.m.MessageBox.show(
								   controll.i18n.getText("chk_zbmind_comp"),  // 
								   sap.m.MessageBox.Icon.ERROR,
								   controll.i18n.getText("error")
								); 
						   return false;
					   }

					}.bind(this),
					error : function() {
					   sap.m.MessageBox.show(
						 controll.i18n.getText("error"),
						 sap.m.MessageBox.Icon.ERROR,
						 controll.i18n.getText("error")
					   );
					}.bind(this)
				};
			     oModel.read(path, mParameters);
			},			
			
			noti_complete : function(qmnum, swerk, timeStamp){
               var controll = this;
               
			   Message.confirm(this.i18n.getText("confirm_msg_comp"), 
						{//title: "", 
			             onClose : function(oAction){
						   	if(oAction=="OK"){
						   		controll.toNotiComplete(qmnum, swerk, timeStamp);
							}else{
								return false;
							}
						 },
			             styleClass: "",
			             initialFocus: sap.m.MessageBox.Action.OK,
			             textDirection : sap.ui.core.TextDirection.Inherit }
				   );
			},
			
			toNotiComplete : function(qmnum, swerk, timeStamp){
				
				var oModel = this.getView().getModel("noti");
				var controll = this;
				
			  	//this.oTable = this.getView().byId("table");
				
//				debugger;
				
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
	
				
				var data = {};
				
				data.Qmnum = qmnum
				data.Spras = this.getLanguage();
				data.Swerk = swerk
				
				var today = new Date();
				var str_today = formatter.dateTimeToStr(today);
				
				var strArr = str_today.split("-");
				data.Refdate = strArr[0];
				data.Reftime = strArr[1];
				data.Timestamp = timeStamp
				
				data.Mode = "T";
				data.ChangeStatus = "T";
				data.HdReturn = [];
				
				var mParameters = {
				  success : function(oData) {
						if(oData.HdReturn){
							if(oData.HdReturn.results.length > 0){
								var message = "";
								for(var i=0; i<oData.HdReturn.results.length; i++){
									message = message + oData.HdReturn.results[i].Message + "\\n";
								}
							   sap.m.MessageBox.show(
							     message,
								 sap.m.MessageBox.Icon.ERROR,
								 controll.i18n.getText("error")
							   );
							}
						}else{
							var message = "";
							message = controll.i18n.getText("complete_noti", [data.Qmnum]);
							sap.m.MessageBox.show(
							     message,
								 sap.m.MessageBox.Icon.SUCCESS,
								 controll.i18n.getText("success")
						    );
							
							controll.onSearch();						
						}
					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
						);	
					}.bind(this)
			     };			
				oModel.create("/HdSet", data, mParameters);
			},
			
			onHandleFromChange : function(oEvent){
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");

				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			
			onHandleToChange : function(oEvent){
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");

				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			onColumnMenuOpen : function(oEvent){
				
			},
				
			onPress_equnr : function(oEvent){
				var sEqunr = oEvent.getSource().getText();
				var idx = oEvent.getSource().getParent().getIndex();
				var oTable =  this.getView().byId("table");
									
				if (idx != -1) {
					  var cxt = oTable.getContextByIndex(idx); 
					  var path = cxt.sPath;
					  var sObj = oTable.getModel().getProperty(path);
					  //console.log(this.obj);
			  
					if(sObj){
						var sSwerk = this.oSwerk.getSelectedKey();
						var sEqunr = sObj.Equnr;
						
						this.getOwnerComponent().openEquipDetail_Dialog(this, sSwerk, sEqunr);								
					}
				}
			},				
      //**************************************************************/		
			check_data : function(){
				
				var _check = true;
				
				var from = this.getView().byId("period_from").getDateValue();
				var to = this.getView().byId("period_to").getDateValue();
				
				if(from > to){
					var message = "Noti. Date " + this.i18n.getText("err_date_period");
					sap.m.MessageBox.show(
					     message,
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("Error")
				   );
					_check = false;
					return _check;
				}
				
				//날짜 기간은 3개월 이내 어야 함 
				var diff = Math.abs(to.getTime() - from.getTime());
				var diffD = Math.ceil(diff / (1000 * 60 * 60 * 24));
				
				if(diffD > 90){
					
					sap.m.MessageBox.show(
						 this.i18n.getText("err_notidate"),
						 sap.m.MessageBox.Icon.ERROR,
						 this.i18n.getText("Error")
				   );
					_check = false;
					return _check;
				}
				
/*				//System Status는 하나 이상 선택되어야 한다. 
				var chk_outstand = this.getView().byId("outstand").getSelected();   
	    		var chk_inpro = this.getView().byId("inpro").getSelected(); 
	    		var chk_comp = this.getView().byId("comp").getSelected();  
	    		
	    		if(chk_outstand === false && chk_inpro === false && chk_comp === false){
	    			sap.m.MessageBox.show(
					  this.i18n.getText("err_status"),
					  sap.m.MessageBox.Icon.ERROR,
					  this.i18n.getText("Error")
					);
					_check = false;
					return _check;
	    		}
	    		
	    		
	    		//User Status는 하나 이상 선택되어야 한다.
	    		var chk_creation = this.getView().byId("creation").getSelected();   
	    	    var chk_proposal = this.getView().byId("proposal").getSelected();   
	    	    var chk_approved = this.getView().byId("approved").getSelected();   
	    	    var chk_rejected = this.getView().byId("rejected").getSelected();   
	    	    
	    	    if(chk_creation === false && chk_proposal === false && 
	    	    	chk_approved === false && chk_rejected === false){
	    			sap.m.MessageBox.show(
	  					  this.i18n.getText("err_status_user"),
	  					  sap.m.MessageBox.Icon.ERROR,
	  					  this.i18n.getText("Error")
	  					);
	  					_check = false;
	  					return _check;
	    	    }
	    	    
	    	    return _check;*/
				
				//Status는 하나 이상 선택되어야 한다. 
	    		var chk_creation = this.getView().byId("creation").getSelected();   
	    	    var chk_proposal = this.getView().byId("proposal").getSelected();   
	    	    var chk_approved = this.getView().byId("approved").getSelected();   
	    	    var chk_rejected = this.getView().byId("rejected").getSelected(); 
	    	    
//				var chk_outstand = this.getView().byId("outstand").getSelected();
	    	    var chk_closed = this.getView().byId("closed").getSelected();   
	    		var chk_inpro = this.getView().byId("inpro").getSelected(); 
	    		var chk_comp = this.getView().byId("comp").getSelected();
	    		var chk_deni = this.getView().byId("deni").getSelected();
	    		
	    		if(chk_creation === false && chk_proposal === false 
	    	    && chk_approved === false && chk_rejected === false
	    		&& chk_closed === false   && chk_inpro === false 
	    		&& chk_comp === false && chk_deni === false)	
	    		{
	    			sap.m.MessageBox.show(
					  this.i18n.getText("err_status"),
					  sap.m.MessageBox.Icon.ERROR,
					  this.i18n.getText("Error")
					);
					_check = false;
					return _check;
	    		}
	    		   	    
	    	    return _check;				
	    		
			},
			
			// Search 
			get_data : function(oEvent){
				var oModel = this.getView().getModel();
				var controll = this;
				var lange = this.getLanguage();
				
			  	this.oTable = this.getView().byId("table");
				
				oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
					controll.oTable.setBusy(false);
					controll.oTable.setShowNoData(true);
			    });
				
				var s_swerk;         //swerk
				var s_not = [];      //Notification type 
				var s_cac = [];      //Severity
				var s_loc = [];      //Process line
				var s_tplnr = [];    // functional location
				var s_equip = [];    //Equipment
				var s_coc = [];      //Cost Center
				var s_woc = [];      //Work Center 
				var s_dpt = [];		 // Dept Code		
				var s_createby = []; //Create by
				var s_orderAssign = []; // Order Assign
				var s_bmcm = [];
				var s_zshutid = [];
				var s_extWork = [];
				
				var s_filter = [];
				
				s_swerk = this.oSwerk.getSelectedKey();
		    	
/*		    	var vNot = this.oNot.getTokens();
		    	for(var j=0; j<vNot.length; j++){
		    		s_not.push(vNot[j].getProperty("key"));
		    	}*/
				var vNot = this.oNot.getSelectedKey();
				if(vNot){
					s_not.push(vNot);
				}
		    	if(s_not.length>0){
		    		s_filter.push(utils.set_filter(s_not, "Qmart"));
			    }
		    	
//				var vLoc = this.oLoc.getTokens();
//		    	for(var j=0; j<vLoc.length; j++){
//		    		s_loc.push(vLoc[j].getProperty("key"));
//		    	}
		    	var vLoc = this.oLoc.getSelectedKey();	
		    	if(vLoc){
		    		s_loc.push(vLoc);
		    	}
		    	if(s_loc.length>0){
		    		s_filter.push(utils.set_filter(s_loc, "Stort"));
			    }
		    			    	
/*		    	var vCac = this.oCac.getTokens();
		    	for(var j=0; j<vCac.length; j++){
		    		s_cac.push(vCac[j].getProperty("key"));
		    	}*/
		    	var vCac = this.oCac.getSelectedKey();
		    	if(vCac){
		    		s_cac.push(vCac);
		    	}
		    	if(s_cac.length>0){
		    		s_filter.push(utils.set_filter(s_cac, "Qmcod"));
			    }
		    	
		    	var vTplnr = this.getView().byId("fl").getTokens();
		    	for(var k=0; k<vTplnr.length; k++){
		    		s_tplnr.push(vTplnr[k].getProperty("key"));
		    	}
		    	if(s_tplnr.length>0){
		    		s_filter.push(utils.set_filter(s_tplnr, "Tplnr"));
			    }
		    	
		    	var vEquip = this.getView().byId("equnr").getTokens();
		    	for(var j=0; j<vEquip.length; j++){
		    		s_equip.push(vEquip[j].getProperty("key"));
		    	}
		    	if(s_equip.length>0){
		    		s_filter.push(utils.set_filter(s_equip, "Equnr"));
			    }
		    	
		    	var vCoc = this.oCoc.getTokens();
		    	for(var j=0; j<vCoc.length; j++){
		    		s_coc.push(vCoc[j].getProperty("key"));
		    	}
		    	if(s_coc.length>0){
		    		s_filter.push(utils.set_filter(s_coc, "Kostl"));
			    }
		    	
/*		    	var vWoc = this.oWoc.getTokens(); 
		    	var wocData = this.oWoc.getModel().getData().results;
		    	for(var j=0; j<vWoc.length; j++){
		    		for(var k=0; k<wocData.length; k++){
		    			if(vWoc[j].getProperty("key") === wocData[k].Key){
		    				s_woc.push(wocData[k].Add2);
		    				break;
		    			}
		    		}
		    	}*/
		    	var vWoc = this.oWoc.getSelectedKey();    //work center(OBJID) 
		    	var wocData = this.oWoc.getModel().getData().results;
		    	for(var j=0; j<wocData.length; j++){
	    			if(wocData[j].Key === vWoc){
	    				s_woc.push(wocData[j].Add2);
	    				break;
	    			}
		    	}
		    	if(s_woc.length>0){
		    		s_filter.push(utils.set_filter(s_woc, "Arbpl"));
			    }
		    	
		    	var vCreateby = this.getView().byId("createby").getValue();
		    	if(vCreateby){
		    		s_createby.push(vCreateby);
			    	if(s_createby.length>0){
			    		s_filter.push(utils.set_filter(s_createby, "Qmnam"));
			    	}
		    	}

				var vDpt = this.oDpt.getSelectedKey();
				if(vDpt){
					s_dpt.push(vDpt);
				}
		    	if(s_dpt.length>0){
		    		s_filter.push(utils.set_filter(s_dpt, "Zdeptcd"));
			    }
		    	
		    	// Noti date 
		    	this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({ pattern : "yyyyMMdd" });	
				var from = this.getView().byId("period_from").getDateValue();
				var to = this.getView().byId("period_to").getDateValue();
				var strfrom = this.oFormatYyyymmdd.format(from);
				var strto = this.oFormatYyyymmdd.format(to);
				//Qmdat ge '20170101' and Qmdat le '20170214'
	    		s_filter.push(utils.set_bt_filter("Qmdat", strfrom, strto));
	    		
	    		// Notification Number
		    	var oQmnum_f = this.getView().byId("qmnum_from").getValue();
		    	var oQmnum_t = this.getView().byId("qmnum_to").getValue();
		    			
				if(oQmnum_f != "" || oQmnum_t != ""){
					s_filter.push(utils.set_bt_filter("Qmnum", oQmnum_f, oQmnum_t));
				}						
	    		
//	    		// System Status 
//	    		var s_phase = [];
//	    		var chk_outstand = this.getView().byId("outstand").getSelected();   // 1  (VIQMEL-PHASE = 1 )
//	    		if(chk_outstand){
//	    			s_phase.push("I0068");   //s_phase.push("1");
//	    		}
//	    		var chk_inpro = this.getView().byId("inpro").getSelected();    // 3 (VIQMEL-PHASE = 3)
//	    		if(chk_inpro){
//	    			s_phase.push("I0070");   //s_phase.push("3");
//	    		}
//	    		var chk_comp = this.getView().byId("comp").getSelected();      // 4 (VIQMEL-PHASE = 4)
//	    		if(chk_comp){
//	    			s_phase.push("I0072");   //s_phase.push("4");
//	    		}
//	    		if(s_phase){
//	    			s_filter.push(utils.set_filter(s_phase, "Sphase"));
//	    		}
//	    		
//				// User Status
//	    		var u_state = [];
//	    		var chk_creation = this.getView().byId("creation").getSelected();
//	    		if(chk_creation){
//	    			u_state.push("E0001");
//	    		}
//	    		var chk_proposal = this.getView().byId("proposal").getSelected();
//	    		if(chk_proposal){
//	    			u_state.push("E0002");
//	    		}
//	    		var chk_approved = this.getView().byId("approved").getSelected();
//	    		if(chk_approved){
//	    			u_state.push("E0003");
//	    		}
//	    		var chk_rejected = this.getView().byId("rejected").getSelected();
//	    		if(chk_rejected){
//	    			u_state.push("E0004");
//	    		}
//	    		if(u_state){
//	    			s_filter.push(utils.set_filter(u_state, "Uphase"));
//	    		}
	    		
				
// Table : TJ02T, System Status				
//				I0068	EN	OSNO	Outstanding notification
//				I0070	EN	NOPR	Notification in process
//				I0071	EN	ORAS	Order assigned
//				I0072	EN	NOCO	Notification completed
			
// Table : TJ30T, User Status
//				310	ZPM_NO	E0001	EN	NOS1	In Creation	
//				310	ZPM_NO	E0002	EN	NOS2	In Approval	
//				310	ZPM_NO	E0003	EN	NOS3	Approved	
//				310	ZPM_NO	E0004	EN	NOS4	Rejected	
//				310	ZPM_NO	E0006	EN	NOS5	Completed	
				
	    		// System Status 
	    		var s_phase = [];
	    		var u_state = [];
	    		var o_state = [];  // Order 존재 여부
	    		var chk_creation = this.getView().byId("creation").getSelected();
	    		if(chk_creation){
	    			s_phase.push("I0068");
	    			u_state.push("E0001");
	    		}
	    		var chk_proposal = this.getView().byId("proposal").getSelected();
	    		if(chk_proposal){
	    			s_phase.push("I0068");
	    			u_state.push("E0002");
	    		}
	    		var chk_approved = this.getView().byId("approved").getSelected();
	    		if(chk_approved){
	    			s_phase.push("I0070");
	    			u_state.push("E0003");
	    			o_state.push("N");	        			
	    		}
	    		var chk_rejected = this.getView().byId("rejected").getSelected();
	    		if(chk_rejected){
	    			s_phase.push("I0072");
	    			u_state.push("E0004");
	    		}
	    		var chk_closed = this.getView().byId("closed").getSelected();
	    		if(chk_closed){
	    			s_phase.push("I0072");
	    			u_state.push("E0006");
	    		}	    		
	    		var chk_inpro = this.getView().byId("inpro").getSelected();
	    		if(chk_inpro){
	    			s_phase.push("I0071");
	    			u_state.push("E0003");
	    		}
	    		var chk_comp = this.getView().byId("comp").getSelected();
	    		if(chk_comp){
	    			s_phase.push("I0072");
	    			u_state.push("E0003");
	    			o_state.push("Y");
	    		}
	    		var chk_deni = this.getView().byId("deni").getSelected();
	    		if(chk_deni){
	    			s_phase.push("I0072");
	    			u_state.push("E0003");
	    			o_state.push("N");
	    		}	    		
	    		
				// Status
	    		if(s_phase.length > 0){
	    			s_filter.push(utils.set_filter(s_phase, "Sphase"));
	    		}
	    		if(u_state.length > 0){
	    			s_filter.push(utils.set_filter(u_state, "Uphase"));
	    		}	
	    		if(o_state.length > 0){
	    			s_filter.push(utils.set_filter(o_state, "Ophase"));
	    		}	
	    		
	    		var assign = this.getView().byId("assign").getSelectedKey();
	    		if(assign){
	    			s_orderAssign.push(assign);
	    			s_filter.push(utils.set_filter(s_orderAssign, "IsAssign"));
	    		}
	    		
	    		var bmcm = this.getView().byId("bmcm").getSelectedKey();
	    		if(bmcm){
	    			s_bmcm.push(bmcm);
	    			s_filter.push(utils.set_filter(s_bmcm, "Zbmind"))
	    		}

	    		var zshutid = this.getView().byId("Zshutid").getSelectedKey();
	    		if(zshutid){
	    			s_zshutid.push(zshutid);
	    			s_filter.push(utils.set_filter(s_zshutid, "Zshutid"))
	    		}
	    		
	    		var extWork = this.getView().byId("ZextWork").getSelectedKey();
	    		if(extWork){
	    			s_extWork.push(extWork);
	    			s_filter.push(utils.set_filter(s_extWork, "ZextWork"))
	    		}
	    		
	    		var s_noti_80 = [];   //Notification list를 용도별로 만들기 위해 필요 
	    		s_noti_80.push("X");
	    		s_filter.push(utils.set_filter(s_noti_80, "Run80"));
	    		
				var filterStr;
				for(var i=0; i<s_filter.length; i++){
					
					if(i === 0){
						filterStr = s_filter[i];
					}else{
						filterStr = filterStr + " and " + s_filter[i];
					}
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
					 controll.oTable.setModel(oODataJSONModel);
					 controll.oTable.bindRows("/ResultList/results");
						 
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
			
			
			toCreateNoti : function(mode, qmnum){
				var v_swerk = this.oSwerk.getSelectedKey();
				// Step 1: Get Service for app to app navigation
				var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
				// Step 2: Navigate using your semantic object

				var hash = navigationService.hrefForExternal({
				  target: {semanticObject : 'ZPM_SO_0090', action: 'display'},
				  params: { param_mode: mode,
					        param_swerk : v_swerk,
					        param_qmnum : qmnum
					       }
				});
				
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, true);			
			
				
			  /* var param_swerk = this.oSwerk.getSelectedKey();
			   var oComponent = this.getOwnerComponent();
				   
			   if(oComponent.getModel().oData){
				  var oComp = JSON.stringify(oComponent.getModel().oData);
			   }
				   
			   var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			   var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					  target: {
						  semanticObject: "ZPM_SO_0090",
						  action: "display"
					  },
					  params: {
						  swerk  : param_swerk,
						  parent : oComp
					  }
				   }));

			   oCrossAppNavigator.toExternal({
			    	 target: {
			    		  shellHash: hash
			       }
			   });*/
				  
			},
			
			toCreateOrder : function(qmnum, woc, swerk, auart){
				
				//var v_swerk = this.getView().byId("swerk").getSelectedKey();
				// Step 1: Get Service for app to app navigation
				var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
				// Step 2: Navigate using your semantic object

				var hash = navigationService.hrefForExternal({
				  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
				  params: { param_mode: 'C',
					        param_qmnum : qmnum,
					        param_woc : woc,
					        param_ort : auart,   //order type
					        param_swerk : swerk
					       }
				});
				
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, true);	
				
			},
			
	 /****************************************************************
	  *  Local Function
	  ****************************************************************/			
			_set_search_field : function(){
				
//			    var default_swerk ;
//				this.oSwerk = this.getView().byId("swerk");
//
//				if(this.oSwerk && this.oSwerk.getItems().length == 0 ){
//					for(var j=0; j<this.arr_swerk.length; j++){
//						var template = new sap.ui.core.Item();
//			            template.setKey(this.arr_swerk[j].Value);
//			            template.setText(this.arr_swerk[j].KeyName);
//			            this.oSwerk.addItem(template);
//			            
//			            if(this.arr_swerk[j].Default ===  'X'){
//			            	default_swerk = j;
//			            }
//				     }
//			        this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
//				}
				
				var v_swerk = this.oSwerk.getSelectedKey();
				
				this.oNot = this.getView().byId("not");
				if(this.oNot){
					utils.set_search_field(v_swerk, this.oNot, "not", "C", "", "");
				}
				
				this.oCac = this.getView().byId("cac");
				if(this.oCac){
					utils.set_search_field(v_swerk, this.oCac, "cac", "C", "D", "");
				}	
				
				this.oLoc = this.getView().byId("loc");
				if(this.oLoc){
					utils.set_search_field(v_swerk, this.oLoc, "loc", "C", "", "");
				}
				
				this.oCoc = this.getView().byId("coc");
				for(var i=0; i<this.arr_kokrs.length; i++){
					if(this.arr_kokrs[i].Default === "X"){
						var kokrs = this.arr_kokrs[i].Value;
						break;
					}
				}
				if(this.oCoc){
					utils.set_search_field(v_swerk, this.oCoc, "coc", "H", kokrs, "");
				}
				
				this.oWoc = this.getView().byId("woc");
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}

				this.oDpt = this.getView().byId("dpt");
				if(this.oDpt){
					utils.set_search_field(v_swerk, this.oDpt, "dpt", "C", "", "");
				}
				
				this.equnr = this.getView().byId("equnr");
				this.fl = this.getView().byId("fl");
					
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
});