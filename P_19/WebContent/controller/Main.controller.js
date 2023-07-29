sap.ui.define([
		"cj/pm0100/controller/BaseController",
		"cj/pm0100/util/ValueHelpHelper",
		"cj/pm0100/util/utils",
		"cj/pm0100/util/ReqApproval",
		"cj/pm0100/util/WorkAssign",	
		"cj/pm0100/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"jquery.sap.global"		
	], function (BaseController, ValueHelpHelper, utils, ReqApproval, WorkAssign, formatter,
			     Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
		"use strict";
		
		return BaseController.extend("cj.pm0100.controller.Main", {

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
//				this.aTokens = new Array();
				
				var oView = this.getView();
			    // Table Filter set 
			  	var oTable = oView.byId("table");
					oView.setModel(new JSONModel({
						globalFilter: "",
						availabilityFilterOn: false,
						cellFilterOn: false
					}), "ui");
					
			    this.renderingSkip = "";
			    this.refresh = false;
				
			},
		
		/**
		* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		* (NOT before the first rendering! onInit() is used for that one!).
		*/
			onBeforeRendering: function() {
				
//				debugger;
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

//					   debugger;
					   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
					   utils.makeSerachHelpHeader(this);	
					   
					   controll.set_auth();
					   controll.set_auth_screen();
					   controll.setInitData();	
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
				this.zpm_role   = this.get_Auth("ZPM_ROLE");
				
				var oView = this.getView();
			    oView.setModel(new JSONModel({
			    	dateFormat :this.dateFormat
				}), "userFormat");					
			},
			

			
			
			//ȭ�� ���� �������� 
			set_auth_screen : function(){
				
			   var oModel = this.getView().getModel("auth");
			   
			   var controll = this;
			   var s_filter = [];  
	                                 
	           var s_zpm_role = []; //���� 
	           var s_zprogram = []; //���α׷� 
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
	           
	           //���α׷� �� 
	           s_zprogram.push("ZPM_UI_0100");
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
				
		  //ȭ�� Controll 		
			set_auth_screen_ctrl : function(){
				var s_ctrl = this.get_uiCtrlAuth();
				
				var s_swerk = this.oSwerk.getSelectedKey();
//				debugger;
				var compProposal = this.getView().byId("compProposal");
				if(s_swerk.substring(0,1) == "2"){
					compProposal.setVisible( true );
			    }else{
			    	compProposal.setVisible( false );
			    }
				
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
			
			/*
			 * Plan Date Default Setting 
			 */
			setInitData : function(){   
			    var qmdat_from = this.getView().byId("qmdat_from");				
			    var qmdat_to   = this.getView().byId("qmdat_to");

			    qmdat_from.setDisplayFormat(this.dateFormat);
			    qmdat_from.setValueFormat("yyyyMMdd");
			    
			    qmdat_to.setDisplayFormat(this.dateFormat);
			    qmdat_to.setValueFormat("yyyyMMdd");
			    
			    var gstrp_from = this.getView().byId("gstrp_from");				
			    var gstrp_to   = this.getView().byId("gstrp_to");

			    gstrp_from.setDisplayFormat(this.dateFormat);
			    gstrp_from.setValueFormat("yyyyMMdd");
			    
			    gstrp_to.setDisplayFormat(this.dateFormat);
			    gstrp_to.setValueFormat("yyyyMMdd");
			    
			    var fromDate = this.formatter.strToDate(this.locDate);
			    var fromDay  = fromDate.getDate() - 14;
			    var toDate = new Date();
				var toDay =  fromDate.getDate() + 7;
				fromDate.setDate( fromDay );
				toDate.setDate( toDay );
				
				gstrp_from.setDateValue( fromDate );
				gstrp_to.setDateValue( toDate );	
						    			    
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
				
				this.oOrt = this.getView().byId("auart");
				if(this.oOrt){				
//					debugger;
					this.oOrt.setSelectedKey("PM01");					
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
				var s_qmnum = [];   // Notification No.
				var s_auart = [];   // Order Type
				var s_aufnr = [];   // Order Number
				var s_vaplz = [];   // Work Center
				var s_ingrp = [];   // P/G
				var s_stort = [];   // process
				var s_zname = [];	// PIC
				var s_aname = [];	// Approver
				var s_tplnr = [];   // F/L
				var s_equnr = [];   // Equipment
				var s_invnr = [];   // TAG ID
				var s_assign = [];	// assign
				var s_notass = [];  // not assign
				var s_ilart = [];   // PMActType
				var s_revnr = [];   // Revision
				var s_dept = [];    // Department
				
				var s_filter = [];
								
				/*
				 * Key
				 */				
				var lange = this.getLanguage();
				// Maint. Plant
				s_swerk = this.oSwerk.getSelectedKey();
				//�ӽ� Test*************************************************
//				if (window.location.hostname == "localhost") {
//					var s_swerk = "2010";
//				}				
				//******************************************************

				/*
				 * filter
				 */	
		    	// Notification Number
//		    	var oQmnum = this.getView().byId("qmnum").getTokens();
//		    	for(var j=0; j<oQmnum.length; j++){
//		    		s_qmnum.push(oQmnum[j].getProperty("key"));
//		    	}
//		    	if(s_qmnum.length>0){
//		    		s_filter.push(utils.set_filter(s_qmnum, "Qmnum"));
//			    }   				
				
		    	var oQmnum_f = this.getView().byId("qmnum_from").getValue();
		    	var oQmnum_t = this.getView().byId("qmnum_to").getValue();
		    	
				if(oQmnum_f != "" || oQmnum_t != ""){
					s_filter.push(utils.set_bt_filter("Qmnum", oQmnum_f, oQmnum_t));
				}				
				
				// Noti. Date
				var qmsDate = this.getView().byId("qmdat_from").getDateValue();
				var qmeDate = this.getView().byId("qmdat_to").getDateValue();
				var qmdat_f = this.formatter.dateToStr(qmsDate);
				var qmdat_t = this.formatter.dateToStr(qmeDate);
				if(qmdat_f != "00000000" || qmdat_t != "00000000"){
					s_filter.push(utils.set_bt_filter("Qmdat", qmdat_f, qmdat_t));
				}				
	    			
	    		
		    	// Order Type
//		    	var oAuart = this.getView().byId("auart").getTokens();
//		    	for(var j=0; j<oAuart.length; j++){
//		    		s_auart.push(oAuart[j].getProperty("key"));
//		    	}
//		    	if(s_auart.length>0){
//		    		s_filter.push(utils.set_filter(s_auart, "Auart"));
//			    }   				
		    	var auart = this.getView().byId("auart").getSelectedKey();
		    	if(auart){
		    		s_auart.push(auart);
					
			    	if(s_auart){
			    		s_filter.push(utils.set_filter(s_auart, "Auart"));
				    }		
		    	}	
		    	
		    	var dept = this.getView().byId("dpt").getSelectedKey();
		    	if(dept){
		    		s_dept.push(dept);
		    		
		    		if(s_dept){
		    			s_filter.push(utils.set_filter(s_dept, "Zdeptcd"));
		    		}
		    	}
		    	
		    	// Order Number
//		    	var oAufnr = this.getView().byId("aufnr").getTokens();
//		    	for(var j=0; j<oAufnr.length; j++){
//		    		s_aufnr.push(oAufnr[j].getProperty("key"));
//		    	}
//		    	if(s_aufnr.length>0){
//		    		s_filter.push(utils.set_filter(s_aufnr, "Aufnr"));
//			    }   				
		    	var oAufnr_f = this.getView().byId("aufnr_from").getValue();
		    	var oAufnr_t = this.getView().byId("aufnr_to").getValue();
		    	
				if(oAufnr_f != "" || oAufnr_t != ""){
					s_filter.push(utils.set_bt_filter("Aufnr", oAufnr_f, oAufnr_t));					    
				}					
				// Order Date
				var adsDate = this.getView().byId("gstrp_from").getDateValue();
				var adeDate = this.getView().byId("gstrp_to").getDateValue();
				var gstrp_f = this.formatter.dateToStr(adsDate);
				var gstrp_t = this.formatter.dateToStr(adeDate);
				if(gstrp_f != "00000000" || gstrp_t != "00000000"){
					s_filter.push(utils.set_bt_filter("Gstrp", gstrp_f, gstrp_t));
				}
		    	
	    		// Outstanding / In Approval / In-porcess / Confirmed / Completed / Rejected
	    		// Stat 
				var s_stat  = [];   // Outstanding / In Approval / In-porcess / Completed / Rejected
	    		var s_ustat  = [];   // Rejected
				
//	    		var chk_outstand = this.getView().byId("outstand").getSelected();   // Outstanding
//	    		if(chk_outstand){
//	    			s_stat.push("I0001");   // CRTD
//	    			s_ustat.push("E0001");  // ORS1	    			
//	    		}
//	    		var chk_inappro = this.getView().byId("inappro").getSelected();   // In Approval
//	    		if(chk_inappro){
//	    			s_stat.push("I0001");   // CRTD
//	    			s_ustat.push("E0002");  // ORS2
//	    		}
//	    		var chk_inpro = this.getView().byId("inpro").getSelected();   // In-porcess
//	    		if(chk_inpro){
//	    			s_stat.push("I0002");   // REL
//	    		}
//	    		var chk_conf = this.getView().byId("conf").getSelected();   // Confirmed
//	    		if(chk_conf){
//	    			s_stat.push("I0009");   // CNF
//	    		}
//
//	    		var chk_comp = this.getView().byId("comp").getSelected();   // Completed
//	    		if(chk_comp){
//	    			s_stat.push("I0045");   // TECO
//	    			s_stat.push("I0046");   // CLSD
//	    		}
//	    		if(s_stat.length>0){
//	    			s_filter.push(utils.set_filter(s_stat, "Stat"));
//	    		}	
//	    		
//	    		// Rejected
//	    		var chk_reject = this.getView().byId("reject").getSelected();   // Rejected
//	    		if(chk_reject){
//	    			s_ustat.push("E0004");  // ORS4
//	    		}
//	    		
//	    		if(s_ustat.length>0){
//	    			s_filter.push(utils.set_filter(s_ustat, "Ustat"));
//	    		}	    		

	    		var chk_outstand = this.getView().byId("outstand").getSelected();   // Outstanding
	    		if(chk_outstand){
	    			s_stat.push("A");	    			
	    		}
	    		var chk_inappro = this.getView().byId("inappro").getSelected();   // In Approval
	    		if(chk_inappro){
	    			s_stat.push("B");
	    		}
	    		var chk_inpro = this.getView().byId("inpro").getSelected();   // In-porcess
	    		if(chk_inpro){
	    			s_stat.push("C");
	    		}
	    		var chk_conf = this.getView().byId("conf").getSelected();   // Confirmed
	    		if(chk_conf){
	    			s_stat.push("D");
	    		}
	    		var chk_comp = this.getView().byId("comp").getSelected();   // Completed
	    		if(chk_comp){
	    			s_stat.push("E");
	    		}
	    		var chk_reject = this.getView().byId("reject").getSelected();   // Rejected
	    		if(chk_reject){
	    			s_stat.push("F");
	    		}
	    		
	    		if(s_stat.length>0){
	    			s_filter.push(utils.set_filter(s_stat, "Stat"));
	    		}	
	    		if(s_ustat.length>0){
	    			s_filter.push(utils.set_filter(s_ustat, "Ustat"));
	    		}	    			    		
//	    		
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
	    		
	    		// Work Center
//		    	var oVaplz = this.getView().byId("vaplz").getTokens();
//		    	for(var j=0; j<oVaplz.length; j++){
//		    		s_vaplz.push(oVaplz[j].getProperty("key"));
//		    	}
//		    	if(s_vaplz.length>0){
//		    		s_filter.push(utils.set_filter(s_vaplz, "Vaplz"));
//			    }   				

		    	var vaplz = this.getView().byId("vaplz").getSelectedKey();
		    	if(vaplz){
		    		s_vaplz.push(vaplz);
					
			    	if(s_vaplz){
			    		s_filter.push(utils.set_filter(s_vaplz, "Vaplz"));
				    }		
		    	}	
		    	
		        // P/G
//		    	var oIngrp = this.getView().byId("ingrp").getTokens();
//		    	for(var j=0; j<oIngrp.length; j++){
//		    		s_ingrp.push(oIngrp[j].getProperty("key"));
//		    	}
//		    	if(s_ingrp.length>0){
//		    		s_filter.push(utils.set_filter(s_ingrp, "Ingrp"));
//			    }			
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

	    		// Approver
		    	var aname = this.getView().byId("aname").getValue();
		    	if(aname){
					s_aname.push(aname);
					
			    	if(s_aname){
			    		s_filter.push(utils.set_filter(s_aname, "Aname"));
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
		    	
	    		// PMActType
		    	var ilart = this.getView().byId("ilart").getSelectedKey();
		    	if(ilart){
					s_ilart.push(ilart);
					
			    	if(s_ilart){
			    		s_filter.push(utils.set_filter(s_ilart, "Ilart"));
				    }		
		    	}	  

	    		// Revision
		    	var revnr = this.getView().byId("revnr").getValue();
		    	if(revnr){
					s_revnr.push(revnr);
					
			    	if(s_revnr){
			    		s_filter.push(utils.set_filter(s_revnr, "Revnr"));
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
					 this.clearAllFilters();
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

				this.oOrt = this.getView().byId("auart");		    // Order Type
				if(this.oOrt){
					utils.set_search_field("", this.oOrt, "ort", "C", "", "");
					
					//this.oOrt.setSelectedKey("PM01");					
				}				

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
				
				//PM Activity type �� ��� Order type�� ���� �޶����� �ϹǷ� Order type ����� ���������� ���� 
				var v_auart = this.oOrt.getSelectedKey();
				this.oAct = this.getView().byId("ilart");
				if(v_auart){
					if(this.oAct){
						utils.set_search_field(v_swerk, this.oAct, "act", "C", v_auart, "");
					}
				}	
				
				this.oDpt = this.getView().byId("dpt");
				if(this.oDpt){
					utils.set_search_field(v_swerk, this.oDpt, "dpt", "C", "", "");
				}

				this.equnr = this.getView().byId("equnr");	// Equipment
				this.tplnr = this.getView().byId("tplnr");  // Functional Location
			},

			//Order type �����  PMActType�� ����Ǿ�� �Ѵ�.
			onChange_Auart : function(oEvent){
			    var v_auart = oEvent.getParameters().selectedItem.getKey();
			    var v_swerk = this.oSwerk.getSelectedKey();
			    
				this.oAct = this.getView().byId("ilart");
				
				if(this.oAct){
					this.oAct.removeAllItems();
					this.oAct.setSelectedKey("");
					utils.set_search_field(v_swerk, this.oAct, "act", "C", v_auart, "");
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
				
				if(sIdstr === "equnr"){
                	this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
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
				var oModel, oTable, sFilename, v_swerk;
				
				v_swerk = this.oSwerk.getSelectedKey();
				oTable = this.getView().byId("table");
				oModel = oTable.getModel();
				sFilename = "File";
				
				utils.makeExcel(oModel, oTable, sFilename, v_swerk);
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

			/*
			 * MultiInput �� Key ���� �����  �Է� �� Token�� ���� �Ѵ�. 
			 */			
			// Search filter set
			filterGlobally : function(oEvent) {
//				debugger;
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

				//this.oOrt.removeItem();
				this.oOrt.setSelectedKey("");	// Order Type
				this.oWoc.setSelectedKey("");	// Maint. W/C 
				this.oPlg.setSelectedKey("");	// P/G
				this.oPic.setSelectedKey("");	// pic
				this.oAct.setSelectedKey("");
				this.oLoc.setSelectedKey("");
				this.oDpt.setSelectedKey("");
							
//				this.oOrt.removeAllItems();	// Order Type
//				this.oWoc.removeAllItems();	// Maint. W/C 
//				this.oPlg.removeAllItems();	// P/G
//				this.oPic.removeAllItems();	// Enployee ID
//				this.oAct.removeAllItems();
//				this.oLoc.removeAllItems();

				this.tplnr.removeAllTokens();	// F/L
				this.equnr.removeAllTokens();	// Equipment

				this.getView().byId("aufnr_from").setValue("");
				this.getView().byId("aufnr_to").setValue("");
				this.getView().byId("qmnum_from").setValue("");
				this.getView().byId("qmnum_to").setValue("");
				this.getView().byId("invnr").setValue("");	// Tag Id
			
				
//			    var v_vaplz = this.oPic.getSelectedKey();
//			    var v_swerk = this.oSwerk.getSelectedKey();
//				if(this.oPic){
//					this.oPic.removeAllItems();
//					this.oPic.setSelectedKey("");
//					utils.set_search_field(v_swerk, this.oPic, "pic", "C", v_vaplz, "");
//				}				
							
				this._set_search_field();
				this.set_auth_screen_ctrl();
			},

			handleDateChangeQmdatFrom: function (oEvent) {
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
			},
			
			handleDateChangeQmdatTo: function (oEvent) {
				var oDP = oEvent.oSource;
				var bValid = oEvent.getParameter("valid");
				this._iEvent++;
	 
				if (bValid) {
					oDP.setValueState(sap.ui.core.ValueState.None);
				} else {
					oDP.setValueState(sap.ui.core.ValueState.Error);
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
			
/*			onPress_disp : function(oEvent){
				var sObj = this.onRowSelect();
				if(sObj){
					// Step 1: Get Service for app to app navigation
					var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
					// Step 2: Navigate using your semantic object
	
					var hash = navigationService.hrefForExternal({
					  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
					  params: {param_mode: 'D',
						       param_order:  sObj.Aufnr,
						       param_qmnum : sObj.Qmnum,
						       param_woc   : sObj.Vaplz}
					});
	
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);			
				}
			},
*/
/*			onPress_chge : function(oEvent){
				var sObj = this.onRowSelect();
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
			},	*/	
			
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
			
			onPress_crte : function(oEvent){
				// Step 1: Get Service for app to app navigation
				var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
				// Step 2: Navigate using your semantic object

				var hash = navigationService.hrefForExternal({
						  target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
						  params: {param_mode: 'C',
     						  	   param_swerk: this.oSwerk.getSelectedKey(),
							       param_order: ''}
						});
	
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);

			},			
			
			onPress_request: function(){			// Request Approval Button, ����/�۾��ڰ� �����ڿ��� ��û
				var sObj = this.onRowSelect();
				var controll = this;
				
				if(sObj){
					if(sObj.Stat == "I0001" && sObj.Ustat == "E0001"){  // System status : CRTD, User Status : ORS1
						if(sObj.Zid != ""){
							this._getDialog_reqapproval(sObj).open();	
						}else{
							Message.confirm(this.i18n.getText("confirmReqapprove"), 
									{//title: "", 
						             onClose : function(oAction){
											   	if(oAction=="OK"){
											   		controll._getDialog_reqapproval(sObj).open();
												}else{
													return false;
												}
											   },
						             styleClass: "",
						             initialFocus: sap.m.MessageBox.Action.OK,
						             textDirection : sap.ui.core.TextDirection.Inherit }
								);							
						}
						
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotrequest"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);						
					}
				}
			},
			
			compProposal: function(){			// Comp Poposal
				var sObj = this.onRowSelect();
				var controll = this;
				
				if(sObj){
					if(sObj.Ebeln != "") {  // ���� �۾� ������ ���� �� ���
				   		controll.onCompProposal(sObj);     // Comp Proposal
					}else{
						sap.m.MessageBox.show(
								  this.i18n.getText("isnotcompproposal"),
							      sap.m.MessageBox.Icon.WARNING,
							      this.i18n.getText("warning")
								);													
					}
				}
			},
			

			onOrderPrint : function(){
				var sObj = this.onRowSelect();
				var controll = this;
				
				if(sObj){
//					if(sObj.Stat == "I0001" && sObj.Ustat == "E0001"){  // System status : CRTD, User Status : ORS1				
						var oModel = this.getView().getModel("print");
						var lange =  this.getLanguage();
											    
						var filterStr = "?$filter=Param1 eq '"+sObj.Werks+"' and Param2 eq '"+sObj.Aufnr+"' and Param3 eq '"+sObj.Qmnum+"'";
						var fname = "ZPM_WORKORDER_PDF";
						
					    var sPath;
		
						if (window.location.hostname == "localhost") {
							sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_PDF_SRV/PdfSet(FName='"+fname+"')/$value"+filterStr;
						} else {	
							sPath = "/sap/opu/odata/sap/ZPM_GW_PDF_SRV/PdfSet(FName='"+fname+"')/$value"+filterStr;
					    } 
						
					    //var context = oEvent.getSource().getBindingContext();
		  			    var html = new sap.ui.core.HTML();
		  			    
		                $(document).ready(function(){
			  				window.open(sPath);
			  			});
//					}else{
//						sap.m.MessageBox.show(
//								  this.i18n.getText("isnotrequest"),
//							      sap.m.MessageBox.Icon.WARNING,
//							      this.i18n.getText("warning")
//								);						
//					}
				}                
			},			
						
			onPress_approval: function(){			// Approval Button, ���� / �۾��ڰ� ��û+������ ���� ����
				var sObj = this.onRowSelect();
				var controll = this;
				
				if(sObj){
					if(sObj.Stat == "I0001" && sObj.Ustat == "E0002" && sObj.Zid != "" 
						&& (sObj.ApproStatus == "" || sObj.ApproStatus == "I")){  // System status : CRTD, User Status : ORS2
						Message.confirm(this.i18n.getText("confirmApproval"), 
								{//title: "", 
					             onClose : function(oAction){
										   	if(oAction=="OK"){
										   		controll.onApproval(sObj);     // Approval
											}else{
												return false;
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);
	
					}else{
						if(sObj.Ustat == "E0002" && sObj.ApproStatus == "P"){
							sap.m.MessageBox.show(
									  this.i18n.getText("eApprovIng"),
								      sap.m.MessageBox.Icon.WARNING,
								      this.i18n.getText("warning")
									);						
							
						}else{
							sap.m.MessageBox.show(
									  this.i18n.getText("isnotapproval"),
								      sap.m.MessageBox.Icon.WARNING,
								      this.i18n.getText("warning")
									);													
						}
					}
				}
				
			},
			
			onApproval : function(sObj){
				var oModel = this.getView().getModel("reqApprove");
				//var oTable = sap.ui.getCore().byId("table_approval");
				
				var controll = this;

				var oTable =  controll.getView().byId("table");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});				
				
			    var data = {};
//			    //Header Info
				data.Aufnr = sObj.Aufnr;
				data.Spras = controll.getLanguage();
				data.Werks = sObj.Werks;
				data.Zid   = controll.getLoginId();
				data.Zmode = 'A';  // Mode : A : Approval 
													
			    data.ResultList = [];
			    
				var item = {};
				item.Chk    = true;
				item.Swerk  = sObj.Werks;
				item.Zid    = controll.getLoginId();

				data.ResultList.push(item);

				var mParameters = {
					success : function(oData) {
						
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData);
						 
					 if(oData.RetType == "E"){
						 sap.m.MessageBox.show(
							     controll.i18n.getText("approveSaveError"), //oData.RetMsg,
								 sap.m.MessageBox.Icon.ERROR,
								 controll.i18n.getText("error")
							);
						 
					 }else{	
						 
						    if(oData.Zpturl){			// ���ڰ��� URL ���� �� ��â
						    	controll.openWin( oData.Zpturl);
						    }else{
								 sap.m.MessageBox.show(
										 controll.i18n.getText("approveSaveSuccess"), //oData.RetMsg,
										 sap.m.MessageBox.Icon.SUCCESS,
										 controll.i18n.getText("Success")
									);							    	
						    }
						 						 
					    	this.onSearch();			//	Approve ����  �Ȥ� �ȵ�
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
			
			onCompProposal : function(sObj){
				var oModel = this.getView().getModel("reqApprove");
				//var oTable = sap.ui.getCore().byId("table_approval");
				
				var controll = this;

				var oTable =  controll.getView().byId("table");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){
													oTable.setBusy(false);
													oTable.setShowNoData(true);
												});				
				
			    var data = {};
//			    //Header Info
				data.Aufnr = sObj.Aufnr;
				data.Spras = controll.getLanguage();
				data.Werks = sObj.Werks;
				data.Zid   = controll.getLoginId();
				data.Zmode = 'P';  // Mode : A : Approval 
													
			    data.ResultList = [];
			    
				var item = {};
				item.Chk    = true;
				item.Swerk  = sObj.Werks;
				item.Zid    = controll.getLoginId();

				data.ResultList.push(item);

				var mParameters = {
					success : function(oData) {
						
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 oODataJSONModel.setData(oData);
						 
					 if(oData.RetType == "E"){
						 sap.m.MessageBox.show(
								 oData.RetMsg, //controll.i18n.getText("compProposalError"),
								 sap.m.MessageBox.Icon.ERROR,
								 controll.i18n.getText("error")
							);
						 
					 }else{
						    if(oData.Zpturl){			// ���ڰ��� URL ���� �� ��â
						    	controll.openWin( oData.Zpturl);
						    }else{
								 sap.m.MessageBox.show(
										 controll.i18n.getText("compProposalSuccess"), //oData.RetMsg,
										 sap.m.MessageBox.Icon.SUCCESS,
										 controll.i18n.getText("Success")
									);							    	
						    }
						 						 
					    	this.onSearch();			//	Approve ����  �Ȥ� �ȵ�
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

			openWin : function(sPath){
//				debugger;			    								
				var html = new sap.ui.core.HTML();
				    
	            $(document).ready(function(){
	  				window.open(sPath);
	  			});						
			},
		
//			onPress_wkassign: function(){			// Request Approval Button, ����/�۾��ڰ� �����ڿ��� ��û
//				var sObj = this.onRowSelect();
//				
//				if(sObj){
//					if( (sObj.Stat == "I0001" && sObj.Ustat == "E0001" &&  sObj.Auart != "PM02")
//					 || (sObj.Stat == "I0001" && sObj.Ustat == "E0002" &&  sObj.Auart != "PM02")
//					 || (sObj.Stat == "I0002" && sObj.Auart == "PM02") ){  // System status : CRTD
//						
////						debugger;
//						var basic_from = this.formatter.strToDate(sObj.Addat);
//						var currentDate = this.formatter.strToDate(this.locDate);		
//						
//						if(basic_from < currentDate){
//							sap.m.MessageBox.show(
//								this.i18n.getText("check_assign"),
//								sap.m.MessageBox.Icon.ERROR,
//								this.i18n.getText("error")
//						    );	
//							return false;
//						}
//						
//						this._getDialog_workassign(sObj).open();
//					}else{
//						sap.m.MessageBox.show(
//								  this.i18n.getText("isnotassign"),
//							      sap.m.MessageBox.Icon.WARNING,
//							      this.i18n.getText("warning")
//								);						
//					}
//				}
//			},
			
			onPress_wkassign: function(){			// Request Approval Button, ����/�۾��ڰ� �����ڿ��� ��û
				var controll = this;
				var sObj = this.onRowSelect();
				
				if(sObj){
					if( (sObj.Stat == "I0001" && sObj.Ustat == "E0001" &&  sObj.Auart != "PM02")
					 || (sObj.Stat == "I0001" && sObj.Ustat == "E0002" &&  sObj.Auart != "PM02")
					 || (sObj.Stat == "I0002" && sObj.Auart == "PM02") ){  // System status : CRTD
						
//						debugger;
						var basic_from = this.formatter.strToDate(sObj.Gstrp);
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
						controll.getOwnerComponent().openWorkAssign_Dialog(controll, sObj.Werks, sObj);
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
										   		controll.renderingSkip = "X";
											}else{
												return false;
											}
										   },
					             styleClass: "",
					             initialFocus: sap.m.MessageBox.Action.OK,
					             textDirection : sap.ui.core.TextDirection.Inherit }
							);
					}else if( sObj.Stat == "I0010" && sObj.Zid != ""){
//						debugger;
						Message.confirm(this.i18n.getText("selectWorkResult"), 
								{//title: "", 
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: this.i18n.getText("selection_title"),
							
								actions: [this.i18n.getText("resultDisplay"), this.i18n.getText("resultEntry")],
					             onClose : function(oAction){
										   	if(oAction == controll.i18n.getText("resultDisplay")){
										   		controll.getOwnerComponent().openWorkResult_Dialog(controll, 'D', sObj);  //1)
										   		controll.renderingSkip = "X";
											}else{
												controll.getOwnerComponent().openWorkResult_Dialog(controll, 'R', sObj);  //1)
												controll.renderingSkip = "X";
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

			/****************************************************************
			 *  ReqApproval_pop Event
			 ****************************************************************/					
			_getDialog_reqapproval : function (sObj) {
				
				if (!this._oDialog_reqapproval) {

		            this._oDialog_reqapproval = sap.ui.xmlfragment("cj.pm0100.view.ReqApproval_pop", this);
		            this._reqapproval_Dialog_handler = new ReqApproval(this._oDialog_reqapproval, this);

		            this.getView().addDependent(this._oDialog_reqapproval);    
		            		            
		         }

		        if(sObj!=undefined){
		        	this._reqapproval_Dialog_handler.approvalRequestList(sObj);
		        }
                return this._oDialog_reqapproval;	        
		    },
		    
		    onAppRequestDialog : function(oEvent){			
				//Confirm Dialog 
				var sObj = this._reqapproval_Dialog_handler.onRowSelect();
				var controll = this;
				
				if(sObj){
					Message.confirm(this.i18n.getText("confirmRequest"), 
							{//title: "", 
				             onClose : function(oAction){
									   	if(oAction=="OK"){
									   		controll._reqapproval_Dialog_handler.onReqApproval(sObj);								   		
									   		controll.onAppCancelDialog();  // Pop-Up Close
										}else{
											return false;
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);		    	

				}			
			},		    
			
			onAppCancelDialog : function(oEvent){
				this._oDialog_reqapproval.close();
			},			

			onReqApprovalAfterClose : function(oEvent){
				this.renderingSkip = "X";
		    	this._oDialog_reqapproval.destroy();
		    	this._oDialog_reqapproval = "";
		    	this._reqapproval_Dialog_handler.destroy();
		    	this._reqapproval_Dialog_handler = "";
		    	
//		    	this.onSearch();
		    	//this.getView().byId("table").getModel().refresh();
		    	
		    	//this.getView().byId("table").getModel().refresh(true,false,false);
		    	//this.getView().byId("table").getModel().updateBindings(true);
			},					
						

			/****************************************************************
			 *  WorkAssign_pop Event
			 ****************************************************************/					
			_getDialog_workassign : function (sObj) {
				if (!this._oDialog_workassign) {

		            this._oDialog_workassign = sap.ui.xmlfragment("cj.pm0100.view.WorkAssign_pop", this);
		            this._workassign_Dialog_handler = new WorkAssign(this._oDialog_workassign, this);

		            this.getView().addDependent(this._oDialog_workassign);    
		            		            
		         }

		        if(sObj!=undefined){
		        	this._workassign_Dialog_handler.workAssignList(sObj);
		        }
                return this._oDialog_workassign;	        
		    },			
			
		    onAssCreateDialog : function(oEvent){			
				//Assign Dialog 
				var isSelected = this._workassign_Dialog_handler.onCheckSelect();
				var controll = this;
				
				if(isSelected){
					Message.confirm(this.i18n.getText("confirmWorkAssign"), 
							{//title: "", 
				             onClose : function(oAction){
									   	if(oAction=="OK"){
									   		controll._workassign_Dialog_handler.onAssignSave();
									   		controll.onAssCancelDialog();  // Pop-Up Close
									   		//this.getView().byId("table").getModel().refresh(true);									   		
										}else{
											return false;
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);		    	
				}			
			},		    
						
			onAssChangeDialog : function(oEvent){			
				//Assign Dialog 
				var isSelected = this._workassign_Dialog_handler.onCheckSelect();
				var controll = this;
				
				if(isSelected){
					Message.confirm(this.i18n.getText("confirmAssignChange"), 
							{//title: "", 
				             onClose : function(oAction){
									   	if(oAction=="OK"){
									   		controll._workassign_Dialog_handler.onAssignSave();
									   		controll.onAssCancelDialog();  // Pop-Up Close
										}else{
											return false;
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);		    	

				}			
			},		
			
			onAssDeleteDialog : function(oEvent){			
				//Assign Dialog 
				var isSelected = this._workassign_Dialog_handler.onCheckDelSelect();
				var controll = this;
				
				if(isSelected){
					Message.confirm(this.i18n.getText("confirmAssignDelete"), 
							{//title: "", 
				             onClose : function(oAction){
									   	if(oAction=="OK"){
									   		controll._workassign_Dialog_handler.onAssignDelete();
									   		controll.onAssCancelDialog();  // Pop-Up Close
										}else{
											return false;
										}
									   },
				             styleClass: "",
				             initialFocus: sap.m.MessageBox.Action.OK,
				             textDirection : sap.ui.core.TextDirection.Inherit }
						);		    	

				}			
			},		 
			
		    onAssCancelDialog : function(oEvent){
		    	this._oDialog_workassign.close();

			},			
			
			onWorkAssignAfterClose : function (oEvent){
				this.renderingSkip = "X";
				
		    	this._oDialog_workassign.destroy();
		    	this._oDialog_workassign = "";
		    	this._workassign_Dialog_handler.destroy();
		    	this._workassign_Dialog_handler = "";
	    	
		    	//this.onSearch();
		    	//this.getView().byId("table").getModel().refresh(true,false,false);
		    	//this.getView().byId("table").getModel().updateBindings(true);
			},
			
			/****************************************************************
			 *  WorkResult_pop Event
			 ****************************************************************/						
		    onResultCancelDialog : function(oEvent){
		    	this._oDialog_workresult.close();

			},			
			
			onResultAfterClose : function (oEvent){
//				this.renderingSkip = "X";
//		    	this._oDialog_workresult.destroy();
//		    	this._oDialog_workresult = "";
//		    	this._workresult_Dialog_handler.destroy();
//		    	this._workresult_Dialog_handler = "";		
			},
			onClose_workResult : function (oEvent){
				if(this.refresh){
					this.onSearch();	
				}
				
				this.refresh = false;
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