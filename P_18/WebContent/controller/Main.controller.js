sap.ui.define([
               "cj/pm0090/controller/BaseController",
               "cj/pm0090/util/ValueHelpHelper",
               "cj/pm0090/util/utils",
               "cj/pm0090/util/Catalog",
               "cj/pm0090/util/PMClasf",
               "cj/pm0090/model/formatter",
               "sap/ui/model/json/JSONModel",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global",
               ], function (BaseController, ValueHelpHelper, utils, Catalog, PMClasf, formatter, JSONModel, Filter, FilterOperator, Message, Toast, jQuery) {
	"use strict";

	return BaseController.extend("cj.pm0090.controller.Main", {
		formatter : formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {

			if(this.getOwnerComponent()){
				this.param_mode = this.getOwnerComponent().get_param_mode();
				this.param_qmnum = this.getOwnerComponent().get_param_qmnum();
				this.param_swerk = this.getOwnerComponent().get_param_swerk();
				this.param_equnr = this.getOwnerComponent().get_param_equnr();
				this.param_eqktx = this.getOwnerComponent().get_param_eqktx();
			}

			if(!this.param_mode){
				this.param_mode = "C";  // Create
			}

			this.set_screen_mode();

			if(this.param_mode === "C"){
				this.set_displayMode();  //최초 호울 시 에는 모두 막아서 화면을 띄운다.
			}else{
				this.set_displayMode("X");  //최초 호울 시 에는 모두 막아서 화면을 띄운다.
			}

			this.approveState = "";

			this.chkComboValidation = [];
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {		
			this.getLoginInfo();
			this.set_userData();  //"User Auth"				
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		onAfterRendering: function() {
			this.oNoti = this.getView().byId("noti");
		},


		set_screen_mode : function(){
			var oView = this.getView();

			oView.setModel(new JSONModel({
				StatMode : true,
				TpmTag : true,
				TpmTagVisible : true,
				
				PlsVisible : false,
				CopVisible : true,
				CopMode    : true,
				CocVisible : true,
				WocSpan : "L5 M5 S5",
				WocWidth : "26rem",
				
				malfulMode : true,
				ShutdownMode : true,
				//ShutdownVisible : true,
				pmclasf : true, 
				ExtWorkMode : true,
				ExtWorkVisible : true,
				OrderBtn : true,
				Proposal : true,
				Complete : true,
				ApproveReject: true,
				AcceptDeny : true,
				Clear : true,
				save : true,
				fileUpload : true,
				fileDelete : true,
				fileAttach : true
			}), "createNoti");	
		},


		set_displayMode : function(mode){

			var screenModel = this.getView().getModel("createNoti");
			var screenData = screenModel.getData();

			if(mode === "X"){
				screenData.StatMode = false;
				screenData.TpmTag = false;
				screenData.malfulMode = false;
				screenData.ShutdownMode = false;
				screenData.CopMode = false;
				screenData.ShutdownVisible = true;
				screenData.ExtWorkMode = false;
				//screenData.ExtWorkVisible = false;
				screenData.OrderBtn = false;
				screenData.Proposal = false;
				screenData.Complete = false;
				screenData.ApproveReject = false;
				screenData.AcceptDeny = false;
				screenData.Clear = false;
				screenData.save = false;
				screenData.fileUpload = false;
				screenData.fileDelete = false;
				screenData.fileAttach = false;
			}else{
				if(this.param_mode === "D"){
					screenData.StatMode = false;
					screenData.TpmTag = false;
					screenData.malfulMode = false;
					screenData.ShutdownMode = false;
					screenData.CopMode = false;
					screenData.ShutdownVisible = true;
					screenData.ExtWorkMode = false;
					//screenData.ExtWorkVisible = false;
					screenData.OrderBtn = false;
					screenData.Proposal = false;
					screenData.Complete = false;
					screenData.ApproveReject= false;
					screenData.AcceptDeny = false;
					screenData.Clear = false;
					screenData.save = false;
					screenData.fileUpload = false;
					screenData.fileDelete = false;
					screenData.fileAttach = false;

					this.oNoti.setTitle(this.i18n.getText("title_display"));

				}else if(this.param_mode === "C"){
					screenData.StatMode = true;
					screenData.TpmTag = true;
					screenData.malfulMode = false;
					screenData.ShutdownMode = false;
					screenData.ShutdownVisible = true;
					screenData.ExtWorkMode = true;
					screenData.CopMode = true;
					//screenData.ExtWorkVisible = true;
					screenData.OrderBtn = false;
					screenData.Proposal = false;
					screenData.Complete = false;
					screenData.ApproveReject= false;
					screenData.AcceptDeny = false;
					screenData.Clear = true;
					screenData.save = true;
					screenData.fileUpload = true;
					screenData.fileDelete = true;
					screenData.fileAttach = false;

				}else if(this.param_mode === "U"){
					screenData.StatMode = true;
					screenData.TpmTag = true;
					screenData.malfulMode = false;
					screenData.ShutdownMode = false;
					screenData.CopMode = false;
					//screenData.ShutdownVisible = true;
					screenData.ExtWorkMode = true;
					screenData.CopMode = true;
					//screenData.ExtWorkVisible = true;
					screenData.OrderBtn = false;
					screenData.Proposal = false;
					screenData.Complete = false;
					screenData.ApproveReject= false;
					screenData.AcceptDeny = false;
					screenData.Clear = false;
					screenData.save = true;
					screenData.fileUpload = true;
					screenData.fileDelete = true;
					screenData.fileAttach = true;

					this.oNoti.setTitle(this.i18n.getText("title_change"));
				}
			}
			screenModel.refresh();
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
//		onExit: function() {
//		},


		setInitDateFormat : function(){

			var notidate = this.getView().byId("notidate");				

			notidate.setDisplayFormat(this.dateFormat);
			notidate.setValueFormat("yyyyMMdd");

			var reqdat_from = this.getView().byId("reqdat_from");				

			reqdat_from.setDisplayFormat(this.dateFormat);
			reqdat_from.setValueFormat("yyyyMMdd");

			var reqdat_to = this.getView().byId("reqdat_to");				

			reqdat_to.setDisplayFormat(this.dateFormat);
			reqdat_to.setValueFormat("yyyyMMdd");

			var start_date = this.getView().byId("start_date");				

			start_date.setDisplayFormat(this.dateFormat);
			start_date.setValueFormat("yyyyMMdd");

			var end_date = this.getView().byId("end_date");				

			end_date.setDisplayFormat(this.dateFormat);
			end_date.setValueFormat("yyyyMMdd");

			var shutdownF_date = this.getView().byId("shutdownF_date");				

			shutdownF_date.setDisplayFormat(this.dateFormat);
			shutdownF_date.setValueFormat("yyyyMMdd");			

			var shutdownT_date = this.getView().byId("shutdownT_date");				

			shutdownT_date.setDisplayFormat(this.dateFormat);
			shutdownT_date.setValueFormat("yyyyMMdd");		

		},


		setInitData_init : function(){			
			var default_swerk ;
			this.oSwerk_init = sap.ui.getCore().byId("swerk_init");

			if(this.oSwerk_init && this.oSwerk_init.getItems().length == 0 ){
				for(var j=0; j<this.arr_swerk.length; j++){
					var template = new sap.ui.core.Item();
					template.setKey(this.arr_swerk[j].Value);
					template.setText(this.arr_swerk[j].KeyName);
					this.oSwerk_init.addItem(template);

					if(this.arr_swerk[j].Default ===  'X'){
						default_swerk = j;
					}
				}
			}
			if(this.param_swerk){
				this.oSwerk_init.setEnabled(false);
				this.oSwerk_init.setSelectedKey(this.param_swerk);
			}else{
				this.oSwerk_init.setSelectedKey(this.arr_swerk[default_swerk].Value);
			}

			this.setInitDateFormat();

			var init_date = sap.ui.getCore().byId("init_date");	
			var init_time = sap.ui.getCore().byId("init_time");

			init_date.setDisplayFormat(this.dateFormat);
			init_date.setValueFormat("yyyyMMdd");

//			var initDate = this.formatter.strToDate(this.locDate);
//			var initTime = this.formatter.strToTime(this.locTime);
//
//			init_date.setDateValue( initDate );	
//			init_time.setDateValue( initTime );

			init_date.setValue( this.locDate );	
			init_time.setValue( this.locTime );			
			
			//create noti from calibration order list
			if(this.param_equnr){
				sap.ui.getCore().byId("equnr_init").setValue(this.param_equnr);
				sap.ui.getCore().byId("equnr_init_tx").setText(this.param_eqktx);

				utils.get_equip_info(this.param_equnr, this.param_swerk);
			}

			if(window.location.hostname != "localhost"){
				//sap.ui.getCore().byId("requestby_init").setValue(this.getLoginInfo().getFullName());
				sap.ui.getCore().byId("requestby_init").setValue(this.getLoginId());
			}
		},


		setInitData : function(){

			var vSwerk = this.oSwerk_init.getSelectedKey();
			
			if(vSwerk =! ''){
				this.oSwerk.setSelectedKey(vSwerk);
			}
			
			this.getView().byId("not").setSelectedKey(sap.ui.getCore().byId("not_init").getSelectedKey());
			this.getView().byId("reportedBy").setValue(sap.ui.getCore().byId("requestby_init").getValue());

			var date = new Date(sap.ui.getCore().byId("init_date").getDateValue());
			var time = new Date(sap.ui.getCore().byId("init_time").getDateValue());

			//Noti. Date
			this.getView().byId("notidate").setDateValue(date);	
			this.getView().byId("notitime").setDateValue(time);	

			//request Date
			this.getView().byId("reqdat_from").setDateValue(date);	
			this.getView().byId("reqdat_to").setDateValue(date);		

			if(sap.ui.getCore().byId("equnr_init").getValue()){
				this.getView().byId("equnr").setValue(sap.ui.getCore().byId("equnr_init").getValue());

				if(this.equip_selrow){
					this.getView().byId("woc").setSelectedKey(this.equip_selrow[0].ARBPL);
					this.getView().byId("plg").setSelectedKey(this.equip_selrow[0].INGRP);
					this.getView().byId("coc").setValue(this.equip_selrow[0].KOSTL);
					this.getView().byId("cocTx").setText(this.equip_selrow[0].KOSTL_TXT);
				}else{
					this.getView().byId("woc").setSelectedKey("");
					this.getView().byId("plg").setSelectedKey("");
					this.getView().byId("coc").setValue("");
					this.getView().byId("cocTx").setText("");
				}
			}

			if(sap.ui.getCore().byId("equnr_init_tx").getText()){
				this.getView().byId("eqktx").setText(sap.ui.getCore().byId("equnr_init_tx").getText());
			}

			if(sap.ui.getCore().byId("fl_init").getValue()){
				this.getView().byId("fl").setValue(sap.ui.getCore().byId("fl_init").getValue());
			}

			if(sap.ui.getCore().byId("fl_init_tx").getText()){
				this.getView().byId("fl_tx").setText(sap.ui.getCore().byId("fl_init_tx").getText());
			}

			if(sap.ui.getCore().byId("bautl_init").getValue()){
				this.getView().byId("bautl").setValue(sap.ui.getCore().byId("bautl_init").getValue());
			}

			if(sap.ui.getCore().byId("bautl_init_tx").getText()){
				this.getView().byId("bautx").setText(sap.ui.getCore().byId("bautl_init_tx").getText());
			}


			if(this.param_mode === "C"){
				this.getView().byId("stat01").setValue(this.i18n.getText("outstanding"));
				this.getView().byId("stat02").setValue(this.i18n.getText("increation"));
			}

			this.getView().byId("bd").setEditable(false); 			

			if(sap.ui.getCore().byId("not_init").getSelectedKey() === "M1"){
				this.getView().getModel("createNoti").getData().ShutdownVisible = true;
				this.getView().getModel("createNoti").getData().ShutdownMode = true;
			}else{
				this.getView().getModel("createNoti").getData().ShutdownVisible = false;
				this.getView().getModel("createNoti").getData().ShutdownMode = false;
			}


			if(this.oSwerk_init.getSelectedKey().substring(0,1) == "2" &&
					sap.ui.getCore().byId("not_init").getSelectedKey() == "M1"){
				this.getView().getModel("createNoti").getData().ExtWorkVisible = true;

				for(var j=0; j<this.arr_swerk.length; j++){
					if(this.arr_swerk[j].Value === this.oSwerk_init.getSelectedKey()){
						this.getView().byId("waers").setText(this.arr_swerk[j].Add2);
						break;
					}
				}

			}else{
				this.getView().getModel("createNoti").getData().ExtWorkVisible = false;
			}

			
			// S : TPM Tag for 5030 Plant 2019.09.23
			if(this.oSwerk_init.getSelectedKey() == "5030"){
				this.getView().getModel("createNoti").getData().TpmTagVisible = true;
				if(sap.ui.getCore().byId("tpmtag_init").getValue()){
					this.getView().byId("tpmtag").setValue(sap.ui.getCore().byId("tpmtag_init").getValue());
				}
			}else{
				this.getView().byId("tpmtag").setValue("");
				this.getView().getModel("createNoti").getData().TpmTagVisible = false;
			}			
			// E : TPM Tag for 5030 Plant 2019.09.23
			
			if(this.oSwerk_init.getSelectedKey().substring(0,1) == "2" ){
				this.getView().getModel("createNoti").getData().CopVisible = true;
			}else{
				this.getView().getModel("createNoti").getData().CopVisible = false;
			}
			
			
			
			this.getView().getModel("createNoti").refresh();

			this.getView().byId("table_file").setVisibleRowCount(1);	


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
										"Default" : oData.results[i].Default,
										"Add1" : oData.results[i].Add1,
										"Add2" : oData.results[i].Add2
									}
							);
						}				   				
						controll.set_UserInfo(userDefault);

						this.i18n = this.getView().getModel("i18n").getResourceBundle();				
						utils.makeSerachHelpHeader(this);	

						this.oNoti = this.getView().byId("noti");

						if(this.param_mode === "C"){
							this.oNoti.setTitle(this.i18n.getText("title_create"));
						}else if(this.param_mode === "U"){
							this.oNoti.setTitle(this.i18n.getText("title_change"));
						}else if(this.param_mode === "D"){
							this.oNoti.setTitle(this.i18n.getText("title_display"));
						}

						controll.set_auth();
						controll.set_auth_screen();

						if(this.param_mode == "C"){
							controll._getDialog_init();
						}else{
							controll.setInitDateFormat();
							controll._set_search_field();  	
							controll.get_notification_data();
						}
						// controll.initDialog.rerender();
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

		//* User Default Setting
		set_auth : function(){
			this.arr_swerk = this.get_Auth("SWERK");				
			this.arr_kostl = this.get_Auth("KOSTL");
			this.arr_kokrs = this.get_Auth("KOKRS");

			this.locDate    = this.get_Auth("LOCDAT")[0].Value;
			this.locTime    = this.get_Auth("LOCTIM")[0].Value;
			this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
			this.sep        = this.get_Auth("SEP")[0].Value;
			this.zpm_role   = this.get_Auth("ZPM_ROLE");

			this.oSwerk = this.getView().byId("swerk");

			var default_swerk;	
			if(this.oSwerk && this.oSwerk.getItems().length == 0 ){
				for(var j=0; j<this.arr_swerk.length; j++){
					var template = new sap.ui.core.Item();
					template.setKey(this.arr_swerk[j].Value);
					template.setText(this.arr_swerk[j].KeyName);
					this.oSwerk.addItem(template);

					if(this.arr_swerk[j].Default === "X"){
						default_swerk = j;
					}
				}
			}

			if(this.param_swerk){
				this.oSwerk.setSelectedKey(this.param_swerk);
			}else{
				this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
			}
		},


		// 화면 권한 가져오기
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
			s_zprogram.push("ZPM_UI_0090");
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

						if(oData.RetType == "E"){
							sap.m.MessageBox.show(
									this.i18n.getText("noauth"), //oData.RetMsg,
									sap.m.MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);
							controll.param_mode = "D";					
							controll.set_displayMode("D");
							return;
						}

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
						controll.set_auth_screen_ctrl_init();

					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
			};
			oModel.read(path, mParameters);			
		},


		set_auth_screen_ctrl_init : function(){
			var s_ctrl = this.get_uiCtrlAuth();

			var s_swerk = this.oSwerk.getSelectedKey();

			if(sap.ui.getCore().byId("tpmtag_init")){
				if(s_swerk=="5030"){
					sap.ui.getCore().byId("tpmtag_init").setVisible(true);
				}else{
					sap.ui.getCore().byId("tpmtag_init").setValue("");				
					sap.ui.getCore().byId("tpmtag_init").setVisible(false);
				}				
			}
			
			this.obj_ctrl = [];
			this.swerk_ctrl = [];
			this.swerk_all = [];

			for(var i in s_ctrl){
				var item = {};				
				item.Program = s_ctrl[i].Program;
				item.UiID = s_ctrl[i].UiID;

				var dup = 0;
				for(var t in this.obj_ctrl){
					if ( this.obj_ctrl[t].Program == s_ctrl[i].Program &&
							this.obj_ctrl[t].UiID == s_ctrl[i].UiID 	){
						dup = dup + 1;
					}
				}
				if(dup == 0){
					this.obj_ctrl.push(item);
				}

				if(s_ctrl[i].Plant == s_swerk){
					this.swerk_ctrl.push(s_ctrl[i]);
				}
				if(s_ctrl[i].Plant == "*"){
					this.swerk_all.push(s_ctrl[i]);
				}
			}

			for(var i in this.obj_ctrl){
				var chk = 0;

				if(this.param_mode == "C"){

					for(var j in this.swerk_ctrl){
						if(this.obj_ctrl[i].Program == this.swerk_ctrl[j].Program &&
								this.swerk_ctrl[j].UiID == ""){  //UiID 가 없는 것은 Create Tile 권한이 없는 것임
							if(!this.swerk_ctrl[j].isVisible){
								Message.error(
										this.i18n.getText("noauth"),
										{ title : "",
											onClose : function(oAction){
												sap.ui.getCore().byId("confirmInit").setVisible(false);
												chk = 1;
											},
											styleClass: "",
											initialFocus: sap.m.MessageBox.Action.OK,
											textDirection : sap.ui.core.TextDirection.Inherit
										}
								);
								return;
							}else{
								sap.ui.getCore().byId("confirmInit").setVisible(true);
								chk = 1;
							}
						}
					}

					if(chk == 0){
						for(var j in this.swerk_all){
							if(this.obj_ctrl[i].Program == this.swerk_all[j].Program &&
									this.swerk_all[j].UiID == ""){ //UiID 가 없는 것은 Create Tile 권한이 없는 것임
								if(!this.swerk_all[j].isVisible){
									Message.error(
											this.i18n.getText("noauth"),
											{ title : "",
												onClose : function(oAction){
													sap.ui.getCore().byId("confirmInit").setVisible(false);
												},
												styleClass: "",
												initialFocus: sap.m.MessageBox.Action.OK,
												textDirection : sap.ui.core.TextDirection.Inherit
											}
									);
									return;
								}else{
									sap.ui.getCore().byId("confirmInit").setVisible(true);
								}
							}
						}
					}	
				}
			}
		},

		set_auth_screen_ctrl : function(){

			for(var i in this.obj_ctrl){
				var chk = 0;

				for(var j in this.swerk_ctrl){
					if(this.obj_ctrl[i].Program == this.swerk_ctrl[j].Program &&
							this.obj_ctrl[i].UiID == this.swerk_ctrl[j].UiID &&
							this.obj_ctrl[i].UiID ){

						if(this.getView().byId(this.swerk_ctrl[j].UiID).getVisible()){
							this.getView().byId(this.swerk_ctrl[j].UiID).setVisible(this.swerk_ctrl[j].isVisible);

							if(this.getView().byId(this.swerk_ctrl[j].UiID) instanceof sap.m.Input ||
									this.getView().byId(this.swerk_ctrl[j].UiID) instanceof sap.m.MultiInput ||
									this.getView().byId(this.swerk_ctrl[j].UiID) instanceof sap.m.ComboBox ){
								this.getView().byId(this.swerk_ctrl[j].UiID).Editable(this.swerk_ctrl[j].isEditable);
							}else if(this.getView().byId(this.swerk_ctrl[j].UiID) instanceof sap.m.Select ){
								this.getView().byId(this.swerk_ctrl[j].UiID).setEnabled(this.swerk_ctrl[j].isEditable);
							}
						}
						chk = 1;
					}
				}

				if(chk == 0){
					for(var j in this.swerk_all){
						if(this.obj_ctrl[i].Program == this.swerk_all[j].Program &&
								this.obj_ctrl[i].UiID == this.swerk_all[j].UiID &&
								this.obj_ctrl[i].UiID ){

							if(this.getView().byId(this.swerk_all[j].UiID).getVisible()){
								this.getView().byId(this.swerk_all[j].UiID).setVisible(this.swerk_all[j].isVisible);

								if(this.getView().byId(this.swerk_all[j].UiID) instanceof sap.m.Input ||
										this.getView().byId(this.swerk_all[j].UiID) instanceof sap.m.MultiInput ||
										this.getView().byId(this.swerk_all[j].UiID) instanceof sap.m.ComboBox ){
									this.getView().byId(this.swerk_all[j].UiID).setEditable(this.swerk_all[j].isEditable);
								}else if(this.getView().byId(this.swerk_all[j].UiID) instanceof sap.m.Select ){
									this.getView().byId(this.swerk_all[j].UiID).setEnabled(this.swerk_all[j].isEditable);
								}
							}
						}
					}
				}
			}
		},

		/*			// 화면 controll
			set_auth_screen_ctrl : function(){
				var s_ctrl = this.get_uiCtrlAuth();

				var s_swerk = this.oSwerk.getSelectedKey();

				var chk = 0;
				var obj_ctrl = [];
				var swerk_ctrl = [];
				var swerk_all = [];

				var controll = this;

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

						   if(!swerk_ctrl[j].UiID && !swerk_ctrl[j].isVisible && this.param_mode == "C"){
							   Message.error(
							     this.i18n.getText("noauth"),
							     {  title : "",
							       onClose : function(oAction){
							    	   sap.ui.getCore().byId("confirmInit").setVisible(false);
							    	   chk = 1;
							    	 //  controll.onCloseDialog_init();
							       },
							       styleClass: "",
						           initialFocus: sap.m.MessageBox.Action.OK,
						           textDirection : sap.ui.core.TextDirection.Inherit
							     }
							   );
						   }else{
							   if(this.getView().byId(swerk_ctrl[j].UiID)){
								   this.getView().byId(swerk_ctrl[j].UiID).setVisible(swerk_ctrl[j].isVisible);

								   if(this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.Input ||
								      this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.MultiInput ||
								      this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.ComboBox ){
									  this.getView().byId(swerk_ctrl[j].UiID).Editable(swerk_ctrl[j].isEditable);
								   }else if(this.getView().byId(swerk_ctrl[j].UiID) instanceof sap.m.Select ){
									  this.getView().byId(swerk_ctrl[j].UiID).setEnabled(swerk_ctrl[j].isEditable);
								   }

								   chk = 1;
							   }else{

								   if(this.param_mode == "C"){
									   sap.ui.getCore().byId("confirmInit").setVisible(true);
								   }
								   chk = 1;
							   }
					       }
					   }
				   }

				   if(chk == 0){
					   for(var j in swerk_all){
						   if(obj_ctrl[i].Program == swerk_all[j].Program && obj_ctrl[i].UiID == swerk_all[j].UiID){

							   if(!swerk_all[j].UiID && !swerk_all[j].isVisible && this.param_mode == "C"){
								   Message.error(
								     this.i18n.getText("noauth"),
								     { title : "",
								       onClose : function(oAction){
								    	   sap.ui.getCore().byId("confirmInit").setVisible(false);
								    	  // controll.onCloseDialog_init();
								       },
								       styleClass: "",
							           initialFocus: sap.m.MessageBox.Action.OK,
							           textDirection : sap.ui.core.TextDirection.Inherit
								     }
								   );
							   }else{

								   if(this.getView().byId(swerk_all[j].UiID)){
									   this.getView().byId(swerk_all[j].UiID).setVisible(swerk_all[j].isVisible);

									   if(this.getView().byId(swerk_all[j].UiID) instanceof sap.m.Input ||
									      this.getView().byId(swerk_all[j].UiID) instanceof sap.m.MultiInput ||
									      this.getView().byId(swerk_all[j].UiID) instanceof sap.m.ComboBox ){
										  this.getView().byId(swerk_all[j].UiID).setEditable(swerk_all[j].isEditable);
									   }else if(this.getView().byId(swerk_all[j].UiID) instanceof sap.m.Select ){
										  this.getView().byId(swerk_all[j].UiID).setEnabled(swerk_all[j].isEditable);
									   }
								   }else{

									   if(this.param_mde == "C"){
										   sap.ui.getCore().byId("confirmInit").setVisible(true);
									   }
								   }
							   }
						   }
					   }
				   }
			   }			
			},*/


		get_notification_data : function(){

			var lange = this.getLanguage();

			var oView = this.getView();
			var oModel = this.getView().getModel();
			var controll = this;

			var oTable = this.getView().byId("table");

			var v_swerk;
			if(this.param_swerk){
				v_swerk = this.param_swerk;
			}else{
				v_swerk = this.oSwerk.getSelectedKey();	
			}

			var s_zid = [];	// User Info
			var s_filter = [];

			var mode = this.param_mode;
			if(this.param_mode === 'U'){
				mode = "R";
			}


			var user = this.getLoginId();
			if(user){
				s_zid.push(user);

				if(s_zid){
					s_filter.push(utils.set_filter(s_zid, "Zid"));
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

			//this.oNoti = this.getView().byId("noti");
			oModel.attachRequestSent( function(){ controll.oNoti.setBusy(true); });
			oModel.attachRequestCompleted( function(){ controll.oNoti.setBusy(false); });

			var path = "/HdSet(Swerk='"+v_swerk+"',Spras='"+lange+"',Qmnum='"+this.param_qmnum+"')";

			var mParameters = {
					urlParameters : {
						"$expand" : "HdItem,HdReturn",
						"$filter" : filterStr
					},
					success : function(oData,response) {

						this.eTag = oData.Timestamp;

						controll.oSwerk.setSelectedKey(oData.Swerk);

						oData.Ausvn = oData.Ausvn == "00000000" ? "" : oData.Ausvn;
						oData.Auztv = oData.Auztv == "000000" ? "" : oData.Auztv;
						oData.Ausbs = oData.Ausbs == "00000000" ? "" : oData.Ausbs;
						oData.Auztb = oData.Auztb == "000000" ? "" :  oData.Auztb;
						oData.Auszt = oData.Auszt == "0.0000000000000000E+00" ? "" : oData.Auszt;
						oData.Strmn = oData.Strmn == "00000000" ? "" : oData.Strmn;
						oData.Ltrmn = oData.Ltrmn == "00000000" ? "" : oData.Ltrmn;
						oData.Qmdat = oData.Qmdat == "00000000" ? "" : oData.Qmdat;
						oData.Mzeit = oData.Mzeit == "000000" ? "" : oData.Mzeit;

						oData.Zshutfrdate = oData.Zshutfrdate == "00000000" ? "" : oData.Zshutfrdate;
						oData.Zshutfrtime = oData.Zshutfrtime == "000000" ? "": oData.Zshutfrtime;
						oData.Zshuttodate = oData.Zshuttodate == "00000000" ? "":  oData.Zshuttodate;
						oData.Zshuttotime = oData.Zshuttotime == "000000" ? "": oData.Zshuttotime;
						oData.ZextWork    = oData.ZextWork    == "" ? "": oData.ZextWork;
						oData.ZestCost    = oData.ZestCost;
						oData.Waers       = oData.Waers;
						oData.Zfunc       = oData.Zfunc;

						var oODataJSONModel =  new sap.ui.model.json.JSONModel();
						oODataJSONModel.setData(oData);

						oView.setModel(oODataJSONModel, "NotiItem")
						
						var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();
						oODataJSONModel_item.setData(oData.HdItem);

						oTable.setModel(oODataJSONModel_item);
						oTable.bindRows("/results");

//						if(oData.UserStatus != "NOS1"){
//						this.set_displayMode("X");
//						}else{
//						this.set_displayMode();
//						}

						this.set_displayMode();

						// controll._set_search_field();  					 // // set Search Help

						controll.get_attach_file();
						controll.change_display(oData);

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


		change_display : function(oData){

			var screenModel = this.getView().getModel("createNoti");
			var screenData = screenModel.getData();

			if(oData.Swerk.substring(0,1) == "2" && oData.Qmart == "M1"){
				screenData.ExtWorkVisible = true;
			}else{
				screenData.ExtWorkVisible = false;
			}

			// S : TPM Tag for 5030 Plant 2019.09.23
			if(oData.Swerk == "5030"){
				screenData.TpmTagVisible = true;
			}else{
				screenData.TpmTagVisible = false;
			}			
			// E : TPM Tag for 5030 Plant 2019.09.23
			
			if(oData.Swerk.substring(0,1) == "2"){
				screenData.CopVisible = true;
			}else{
				screenData.CopVisible = false;
			}			
			
			//BreakDown에 값에 따라 제어
			if(oData.Msaus){   //BreakDown
				// this._cal_duration();
				if(this.param_mode == "U"){
					screenData.malfulMode = true;
				}
			}else{
				screenData.malfulMode = false;
			}

			// Aufnr 타입이 'M1'인 경우 Shutdown layout 제어
			if(oData.Qmart === "M1"){
				screenData.ShutdownVisible = true;
				if(oData.Zshutid && this.param_mode === "U"){
					screenData.ShutdownMode = true;
				}else{
					screenData.ShutdownMode = false;
				}
			}else{
				screenData.ShutdownVisible = false;
			}

			//oData.SysStatus oData.UserStatus
			if(oData.UserStatus == "NOS1"){  // create

				if(oData.Qmnum){
//					screenData.Proposal = true;
//					screenData.Complete = true;     	    		

					if(oData.Zpturl){
						screenData.Proposal = false;
						screenData.Complete = false;
					}else{
						screenData.Proposal = true;
						screenData.Complete = true;     	    		
					}

					screenData.ApproveReject = false;
					screenData.AcceptDeny = false;
					screenData.fileAttach = true;


				}else{
					screenData.fileAttach = false;
				}

			}else if(oData.UserStatus == "NOS2"){  // In Approval
				screenData.StatMode = false;
				screenData.TpmTag = false;
				screenData.malfulMode = false;
//				screenData.ShutdownMode = false;
				screenData.fileUpload = false;
				screenData.fileDelete = false;
				screenData.fileAttach = false; 				
				//screenData.save = false;				

				screenData.ExtWorkMode = false;
				screenData.Proposal = false;
				screenData.Complete = false;
				screenData.ApproveReject = false;
				if(oData.ZextWork){
					if(oData.Swerk.substring(0,1) == "2"){
						screenData.ApproveReject = false;
					}else{
						screenData.ApproveReject = true;
					}
				}else{
					screenData.ApproveReject = true;     	    		
				}

				screenData.AcceptDeny = false;

//				if(oData.Zbmind == "NM"){
//				screenData.Complete = true;
//				screenData.ApproveReject = false;
//				}

			}else if(oData.UserStatus == "NOS3"){  // Approved
				screenData.StatMode = false;
				screenData.TpmTag = false;
				screenData.malfulMode = false;
//				screenData.ShutdownMode = false;
				screenData.fileUpload = false;
				screenData.fileDelete = false;
				screenData.fileAttach = false; 				
				//screenData.save = false;	

				screenData.ExtWorkMode = false;
				//screenData.ExtWorkVisible = false;
				screenData.Proposal = false;
				screenData.Complete = false;
				screenData.ApproveReject = false;
				// screenData.AcceptDeny = true;

				if(oData.Aufnr){
					screenData.AcceptDeny = false;
				}else{
					screenData.AcceptDeny = true;
				}

				// NM통지도 오더연계하도록 개선, 단독 완료기능제거. 조영내님 요청 20210818 
				/*if(oData.Zbmind == "NM"){
					screenData.Complete = true;
				}*/

			}

			// 오더가 없는경우 Detail 버트 제어
			if(oData.Aufnr){
				screenData.OrderBtn = true;
			}else{
				screenData.OrderBtn = false;
			}

			if(oData.SysStatus == "NOCO"){   // Complete, �ݷ�

				screenData.StatMode = false;
				screenData.TpmTag = false;
				screenData.malfulMode = false;
				screenData.ShutdownMode = false;
				screenData.ExtWorkMode = false;
				//screenData.ExtWorkVisible = false;
				screenData.Proposal = false;
				screenData.Complete = false;
				screenData.ApproveReject = false;
				screenData.AcceptDeny = false;
				screenData.save = false;
				screenData.fileUpload = false;
				screenData.fileDelete = false;

			}

			screenModel.refresh();

			this.set_auth_screen_ctrl();
		},


		checkMandatory_init : function(){

			var oFl = sap.ui.getCore().byId("fl_init");
			var oEqunr = sap.ui.getCore().byId("equnr_init");
			var oAsm = sap.ui.getCore().byId("bautl_init");

			if(oFl.getValueState() == "Error" ||
					oEqunr.getValueState() == "Error" ||
					oAsm.getValueState() == "Error"){

				sap.m.MessageBox.show(
						this.i18n.getText("validation"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false;   //error
			}	

			if(!oFl.getValue() && !oEqunr.getValue()){
				sap.m.MessageBox.show(
						this.i18n.getText("err_check_equnrfl"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;   //error
			}else{
				if(!this.equip_selrow){
					sap.m.MessageBox.show(
							this.i18n.getText("err_check_equnrfl_selRow"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}
			}

			var cnt = 0;

			var oPlant = sap.ui.getCore().byId("swerk_init")
			if(!oPlant.getSelectedKey()){
				oPlant.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oPlant.setValueState("None");
				cnt = cnt + 1;
			}

			var notitype = sap.ui.getCore().byId("not_init");
			if(!notitype.getSelectedKey()){
				notitype.setValueState("Error");
				cnt = cnt - 1;
			}else{
				notitype.setValueState("None");
				cnt = cnt + 1;
			}

			if(cnt == 2){
				return true;   //success
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false;  //fail
			}

		},


		add_empty_row : function(){

			var oTable = this.getView().byId("table");
			var oData = {};
			var HdItem = {};

			var hditem = [];
			var idx = 0;
			for(var i=0; i<5; i++){
				idx = idx + 1;
				hditem.push({
					"Seq" : idx,
					"Otgrp" : "",
					"Qktextgr" : "",
					"Oteil" : "",
					"Txtcdot" : "",
					"Fegrp" : "",
					"Fktextgr" : "",
					"Fecod" : "",
					"Txtcdfe" : "",
					"Fetxt" : "",
					"Urgrp" : "",
					"Uktextgr" : "",
					"Urcod" : "",
					"Txtcdur" : "",
					"Urtxt" : "",
					"Mngrp" : "",
					"Mktextgr" : "",
					"Mncod" : "",
					"Txtcdma" : "",
					"Matxt" : ""
				});
			}

			//HdItem.results = hditem;
			oData.results =   hditem;

			//oData.HdItem = hditem;

			var oODataJSONModel = new sap.ui.model.json.JSONModel();
			oODataJSONModel.setData(oData);

			oTable.setModel(oODataJSONModel);
			oTable.bindRows("/results");
			//oTable.bindRows("/HdItem/results");
			//oTable.setModel(oODataJSONModel, "tableModel");
		},


		check_data : function(){

			var cnt = 0;
			//ComboBox data check
			for(var i=0; i<this.chkComboValidation.length; i++){
				if(this.getView().byId(this.chkComboValidation[i]).getValueState() == "Error"){
					cnt = cnt + 1;
				}
			}

			if(cnt != 0){
				sap.m.MessageBox.show(
						this.i18n.getText("validation"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false;	
			}

			var reqdat_from = this.getView().byId("reqdat_from");
			var reqdat_to = this.getView().byId("reqdat_to");

			if(reqdat_from.getDateValue() && reqdat_to.getDateValue()){
				if( reqdat_from.getDateValue() > reqdat_to.getDateValue() ){
					reqdat_from.setValueState("Error");
					reqdat_to.setValueState("Error");
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}
			}

			var duration = this.getView().byId("bd").getValue();
			if(duration){
				if(duration < 0 ){
					this.getView().byId("start_date").setValueState("Error");
					this.getView().byId("start_time").setValueState("Error");
					this.getView().byId("end_date").setValueState("Error");
					this.getView().byId("end_time").setValueState("Error");
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}
			}
			/*
			if(this.getView().byId("shutdownInd").getSelected()){
				var oShutdownF_date = this.getView().byId("shutdownF_date");
				var oShutdownF_time = this.getView().byId("shutdownF_time");
				var oShutdownT_date = this.getView().byId("shutdownT_date");
				var oShutdownT_time = this.getView().byId("shutdownT_time");

				if(oShutdownF_date.getDateValue() > oShutdownT_date.getDateValue()){
					oShutdownF_date.setValueState("Error");
					oShutdownT_date.setValueState("Error");
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}else{
					oShutdownF_date.setValueState("None");
					oShutdownT_date.setValueState("None");
				}

				if(oShutdownF_date.getDateValue() === oShutdownT_date.getDateValue() &&
						oShutdownF_time.getDateValue() > oShutdownT_time.getDateValue()  ){
					oShutdownF_time.setValueState("Error");
					oShutdownT_time.setValueState("Error");
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}else{
					oShutdownF_time.setValueState("None");
					oShutdownT_time.setValueState("None");
				}
			}	
			*/
			
			var oShutdownF_date = this.getView().byId("shutdownF_date");
			var oShutdownF_time = this.getView().byId("shutdownF_time");
			
			oShutdownF_time.setValueState("None");
			//oShutdownT_time.setValueState("None");

			
			// NM통지에 오더 연결가능하도록 개선. 조영내님 요청 20210818
			/*var oAufnr = this.getView().byId("aufnr").getValue();
			var oBmcm = this.getView().byId("bmcm");

			if(oAufnr !="" && oBmcm.getSelectedKey() == "NM"){
				oBmcm.setValueState("Error");
				sap.m.MessageBox.show(
						this.i18n.getText("err_zbmind"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;					
			}else{
				oBmcm.setValueState("None");
			}*/

			var zextWork = this.getView().byId("zextWork");
			var zestCost = this.getView().byId("zestCost");
			var Work     = zextWork.getSelectedKey();
			var Cost     = zestCost.getValue();
			if (Cost == ""){
				Cost = 0.00;
			}
			if( Work == "X" && parseFloat(Cost) <= 0){
				zestCost.setValueState("Error");
				sap.m.MessageBox.show(
						this.i18n.getText("err_estCost"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;						
			}else{
				zestCost.setValueState("None");
			}

			if(Work != "X" && parseFloat(Cost) > 0){
				zextWork.setValueState("Error");
				sap.m.MessageBox.show(
						this.i18n.getText("err_extWork"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;						
			}else{
				zextWork.setValueState("None");
			}				

			return true;
		},


		checkMandatory : function(){
			var cnt = 0;

			var oFl = this.getView().byId("fl");
			var oEqunr = this.getView().byId("equnr");
			if(!oFl.getValue() && !oEqunr.getValue()){
				sap.m.MessageBox.show(
						this.i18n.getText("err_check_equnrfl"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;   //error
			}else{

			}

			//1
			var oReportby = this.getView().byId("reportedBy");
			if(!oReportby.getValue()){
				oReportby.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oReportby.setValueState("None");
				cnt = cnt + 1;
			}
			//2
			var oPri = this.getView().byId("pri");
			if(!oPri.getSelectedKey()){
				oPri.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oPri.setValueState("None");
				cnt = cnt + 1;
			}

			//6
			var oReqdat_from = this.getView().byId("reqdat_from");
			if(!oReqdat_from.getValue()){
				oReqdat_from.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oReqdat_from.setValueState("None");
				cnt = cnt + 1;
			}

			//3
			var oDeschd =  this.getView().byId("hd_desc");
			if(!oDeschd.getValue()){
				oDeschd.setValueState("Error");
				cnt = cnt - 1;
			}else{
				oDeschd.getValueState("None");
				cnt = cnt + 1;
			}
			//4
			var breakdown = this.getView().byId("breakdown").getSelected();
			if(breakdown){
				var oStart_date = this.getView().byId("start_date");
				var oStart_time = this.getView().byId("start_time");
				var oEnd_date = this.getView().byId("end_date");
				var oEnd_time = this.getView().byId("end_time");
				var start_date = oStart_date.getDateValue();
				var start_time = oStart_time.getDateValue();
				var end_date = oEnd_date.getDateValue();
				var end_time = oEnd_time.getDateValue();

				if(start_date && start_time && end_date && end_time){
					cnt = cnt + 1;
				}else{
					start_date ? oStart_date.setValueState("None") : oStart_date.setValueState("Error");
					start_time ? oStart_time.setValueState("None") : oStart_time.setValueState("Error");
					end_date ? oEnd_date.setValueState("None") : oEnd_date.setValueState("Error");
					end_time ? oEnd_time.setValueState("None") : oEnd_time.setValueState("Error");
					cnt = cnt - 1;
				}
			}else{
				cnt = cnt + 1;
			}
			//5 Modify
			var shutdown = this.getView().byId("shutdownInd").getSelected();
			var bmcm = this.getView().byId("bmcm").getSelectedKey();
			if(shutdown && bmcm == "BM"){
				var oShutdownF_date = this.getView().byId("shutdownF_date");
				var oShutdownF_time = this.getView().byId("shutdownF_time");
				//var oShutdownT_date = this.getView().byId("shutdownT_date");
				//var oShutdownT_time = this.getView().byId("shutdownT_time");
				var shutdownF_date = oShutdownF_date.getDateValue();
				var shutdownF_time = oShutdownF_time.getDateValue();
				//var shutdownT_date = oShutdownT_date.getDateValue();
				//var shutdownT_time = oShutdownT_time.getDateValue();

//				if(shutdownF_date && shutdownF_time && shutdownT_date && shutdownT_time){
				if(shutdownF_date && shutdownF_time){
					cnt = cnt + 1;
				}else{
					shutdownF_date ? oShutdownF_date.setValueState("None") : oShutdownF_date.setValueState("Error");
					shutdownF_time ? oShutdownF_time.setValueState("None") : oShutdownF_time.setValueState("Error");
					//shutdownT_date ? oShutdownT_date.setValueState("None") : oShutdownT_date.setValueState("Error");
					//shutdownT_time ? oShutdownT_time.setValueState("None") : oShutdownT_time.setValueState("Error");
					cnt = cnt - 1;
				}
			}else{
				cnt = cnt + 1;
			}

			if(cnt == 6){
				return true;   //SUCCESS
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("error")
				);
				return false;
			}

		},


		set_search_selected_data : function(Obj,selection,selRow,err){

			if(Obj == "coc"){
				this.getView().byId("coc").setValue(selection.getKey());
				this.getView().byId("cocTx").setText(selection.getText());

			}else if(Obj == "bautl_init"){
				if(err){
					sap.ui.getCore().byId("bautl_init").setValueState("Error");
					sap.ui.getCore().byId("bautl_init_tx").setText("");
				}else{
					sap.ui.getCore().byId("bautl_init").setValueState("None");
					sap.ui.getCore().byId("bautl_init").setValue(selection.getKey());
					sap.ui.getCore().byId("bautl_init_tx").setText(selection.getText());
				}
			}else if(Obj == "bautl"){
				if(err){
					this.getView().byId("bautl").setValueState("Error");
					this.getView().byId("bautx").setText("");
				}else{
					this.getView().byId("bautl").setValueState("None");
					this.getView().byId("bautl").setValue(selection.getKey());
					this.getView().byId("bautx").setText(selection.getText());
				}
			}

		},


		set_equnr_info : function(list, chk){
			this.equip_selrow = [];

			if(chk === "E"){
				sap.ui.getCore().byId("equnr_init").setValueState("Error");
				sap.ui.getCore().byId("equnr_init_tx").setText("");
				//sap.ui.getCore().byId("fl_init").setValue("");
				sap.ui.getCore().byId("fl_init_tx").setText("");
			}else{

				this.equip_selrow.push(list.KeyEqList.results[0]);

				sap.ui.getCore().byId("equnr_init").setValueState("None");
				sap.ui.getCore().byId("equnr_init_tx").setText(list.KeyEqList.results[0].EQKTX);
				sap.ui.getCore().byId("fl_init").setValue(list.KeyEqList.results[0].TPLNR);
				sap.ui.getCore().byId("fl_init_tx").setText(list.KeyEqList.results[0].PLTXT);
			}
		},


		set_tplnr_info : function(list, chk){
			this.equip_selrow = [];

			if(chk === "E"){
				sap.ui.getCore().byId("fl_init").setValueState("Error");
				//sap.ui.getCore().byId("fl_init").setValue("");
				sap.ui.getCore().byId("fl_init_tx").setText("");
			}else{
				this.equip_selrow.push(list);

				sap.ui.getCore().byId("fl_init").setValueState("None");
				sap.ui.getCore().byId("fl_init").setValue(list.Id);
				sap.ui.getCore().byId("fl_init_tx").setText(list.Name);
			}

		},



		/****************************************************************
		 *  Event Handler
		 ****************************************************************/

		onValueHelpRequest : function(oEvent){
//			debugger;
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			var s_swerk = this.oSwerk.getSelectedKey();

			if(sIdstr === "equnr" || sIdstr === "equnr_init"){
				this.equnrName = sIdstr;
				this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
			}else if(sIdstr === "fl" || sIdstr === "fl_init"){
				this.flName = sIdstr;
				this.getOwnerComponent().openFuncLocation_Dialog(this, "Single", s_swerk);
			}else if(sIdstr === "bautl"){  // Search Help Ŭ���� �����͸� ���� �´�.
				var oPage = this.getView().byId("noti");				
				this.oAsm = this.getView().byId("bautl");
				var bautl_sh = utils.get_sh_help("bautl");
				if(this.oAsm){
					if(!bautl_sh){
						utils.set_search_field(s_swerk, this.oAsm, "asm", "H", "", "", "X", oPage);
					}else{
						var asmOdata= bautl_sh.model.oData.results;
						if(asmOdata.length == 0){
							utils.set_search_field(s_swerk, this.oAsm, "asm", "H", "", "", "X", oPage);
						}else{
							utils.openValueHelp(sIdstr);
						}
					}						
				}
			}else if(sIdstr === "bautl_init"){  // Search Help Ŭ���� �����͸� ���� �´�.
				var oPopupPage = sap.ui.getCore().byId("dialog_init");				
				this.oAsm_init = sap.ui.getCore().byId("bautl_init");
				var bautl_init_sh = utils.get_sh_help("bautl_init");
				if(this.oAsm_init){
					if(!bautl_init_sh){
						utils.set_search_field(s_swerk, this.oAsm_init, "asm", "H", "", "", "X", oPopupPage);
					}else{
						var asmInitOdata= bautl_init_sh.model.oData.results;
						if(asmInitOdata.length == 0){
							utils.set_search_field(s_swerk, this.oAsm_init, "asm", "H", "", "", "X", oPopupPage);
						}else{
							utils.openValueHelp(sIdstr);
						}
					}						
				}			
			}else{				
				utils.openValueHelp(sIdstr);
			}
		},




		/*			onSearch : function(oEvent){
				var result = utils.checkMandatory(this, "mainpage");

				if(result){
				   result = this.check_data();

				   if(result){
					this.get_data(oEvent);
				   }
				}else{
					sap.m.MessageBox.show(
						this.i18n.getText("err_check_mandatory"),
						sap.m.MessageBox.Icon.ERROR,
					    this.i18n.getText("Error")
					);
				}
			},*/

		// Maint Plant select를  change 할때
		onSelChange : function(oEvent){
			var v_swerk = oEvent.getParameter("selectedItem").getKey();

			sap.ui.getCore().byId("equnr_init").setValue("");
			sap.ui.getCore().byId("equnr_init_tx").setText("");
			sap.ui.getCore().byId("fl_init").setValue("");
			sap.ui.getCore().byId("fl_init_tx").setText("");
			sap.ui.getCore().byId("bautl_init").setValue("");
			sap.ui.getCore().byId("bautl_init_tx").setText("");
			
			this.oSwerk.setSelectedKey(v_swerk);
			this.set_auth_screen_ctrl_init();
			
//			debugger;
			// bautl_init �ʱ���
			var bautl_init_sh = utils.get_sh_help("bautl_init");
			if(bautl_init_sh){
				bautl_init_sh.model.oData.results = [];
			}				
		},


		// MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다.
		onChange : function(oEvent){

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			if(sIdstr === "reportedBy" ){
				var v_repby = oEvent.getParameter("newValue");
				if(v_repby){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "coc" ){
				var result = utils.set_token(this.oCoc, oEvent, "X");
				if(result){
					this.getView().byId("cocTx").setText("");
					oEvent.getSource().setValueState("Error");
				}else{
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "pri"){
				var v_pri =  oEvent.getParameter("selectedItem").getKey();
				if(v_pri){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "hd_desc"){
				var v_desc_hd = oEvent.getSource().getValue();
				if(v_desc_hd){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "equnr_init"){
				var v_swerk = sap.ui.getCore().byId("swerk_init").getSelectedKey();
				if(oEvent.getParameter("newValue")){
					utils.get_equip_info(oEvent.getParameter("newValue"), v_swerk);
				}else{
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("equnr_init_tx").setText("");
				}
			}else if(sIdstr === "fl_init"){
				var v_swerk = sap.ui.getCore().byId("swerk_init").getSelectedKey();
				if(oEvent.getParameter("newValue")){
					utils.get_fl_info(oEvent.getParameter("newValue"), v_swerk);
				}else{
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("fl_init_tx").setText("");
				}
			}else if(sIdstr === "not_init"){
				var v_not_init = oEvent.getParameter("selectedItem").getKey();
				if(v_not_init){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "bautl_init"){
//				var v_asm_init = oEvent.getParameter("newValue");
//				if(!v_asm_init){
//					oEvent.getSource().setValueState("None");
//				}else{
//					var result = utils.set_token(this.oAsm_init, oEvent, "X");
//				}
				var v_asm_init = oEvent.getParameter("newValue");
				if(!v_asm_init){
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("bautl_init_tx").setText("");
				}else{					
					if(!this.oAsm_init){
						this.oAsm_init = sap.ui.getCore().byId("bautl_init");
					}
					var bautl_init_sh = utils.get_sh_help("bautl_init");
					if(bautl_init_sh){
						var asmInitOdata= bautl_init_sh.model.oData.results;
					}					
					
					if(!bautl_init_sh ||  (asmInitOdata != undefined && asmInitOdata.length == 0)){
					   var v_swerk = this.getView().byId("swerk").getSelectedKey();
					
				      //Assembly search help�� �����Ҷ� �����Ͱ� ���Ƿ�
					  //Search Help�� ��������� ���� Enter�� ���� �����͸� �����ؾ� �Ҷ� Event�� �Բ� �Ѱ� �ش�.
					   utils.set_search_field(v_swerk, this.oAsm_init, "asm", "H", "", "", "T", "", oEvent);//�����͸� �������� Helpâ�� ����� �ʴ´�
					}else{
						var result = utils.set_token(this.oAsm_init, oEvent, "X");
					}													
				}		
				
			}else if(sIdstr == "bautl"){
				var v_asm = oEvent.getParameter("newValue");
				if(!v_asm){
					oEvent.getSource().setValueState("None");
				}else{
					var result = utils.set_token(this.oAsm, oEvent, "X");
				}	
			}else if(sIdstr == "zextWork"){
				var zestCost = this.getView().byId("zestCost");

				var v_zextWork = oEvent.getParameter("newValue");
				if(v_zextWork){
					oEvent.getSource().setValueState("None");
				}else{
					zestCost.setValueState("None");
				}
			}else if(sIdstr == "zestCost"){
				var zextWork = this.getView().byId("zextWork");

				var v_zestCost = oEvent.getParameter("newValue");
				if(v_zestCost){
					oEvent.getSource().setValueState("None");
				}else{
					zextWork.setValueState("None");
				}	
			}
		},


		onConfirmDialog_init : function(oEvent){

			if(!this.checkMandatory_init()){
				return;
			}

			utils.makeSerachHelpHeader(this);	
			this._set_search_field();
			this.setInitData();
			this.add_empty_row(); //신규생성이므로 입력활성화

////S 20211020
//			
//			
//			//var oModel = this.oMain.getModel("actItem");
//			var oModel = this.getView().getModel("NotiItem");
//			var controll = this;
//			
//			debugger;
//			
//			var path = "/InputSet(Zmode='"+this.param_mode+"',Werks='"+this.sWerks+"',Aufnr='"+this.sAufnr+"')";
//			///sap/opu/odata/SAP/ZPM_GW_0073_SRV/InputSet(Zmode='R',Werks='2010',Aufnr='4000183')
//			//?$expand=BreakdownList,FailurecodeList,MeasuringList,WorktimeList&$filter=Spras eq 'EN'
//			var mParameters = {
//					urlParameters : {
//						"$expand" : "BreakdownList,FailurecodeList,MeasuringList/ListDeep,WorktimeList,ShutdownList"
//					},
//
//					success : function(oData) {
//						var oWtTable = controll.oMain.oController.getView().byId("table_worktime");
//						var oFcTable = controll.oMain.oController.getView().byId("table_failure");
//						var oMdTable = controll.oMain.oController.getView().byId("table_measure");
// 
//
//
//						// Shutdown Information ------------------------------------------------------------------
//
//						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
//						oODataJSONModel.setData(oData);
//						oView.setModel(oODataJSONModel, "NotiItem");
//
//						oWtTable.setModel(oODataJSONModel);
//						oWtTable.bindRows("/WorktimeList/results");
//
//						oFcTable.setModel(oODataJSONModel);
//						oFcTable.bindRows("/FailurecodeList/results");
//
//						oMdTable.setModel(oODataJSONModel);
//						oMdTable.bindRows("/MeasuringList/results");
////						this.onMalfuncDuration();	
//
//						if( (oData.Stat == "I0009" || oData.Stat == "I0045" || oData.Stat == "I0046") 
//								&& (oData.Ustat != "E0004") ){
//							controll.cancel.setVisible(true);
//						}else{
//							if(this.sMode == "D" && oData.Stat == "I0010" && oData.Ustat == "E0003" ){
//								controll.cancel.setVisible(true);
//
//								oHeaderData.ZbmindEditStatus = false;
//								oHeaderData.IlartEditStatus = false;
//
//								headerScreenModel.refresh();
//
//							}else{
//								controll.cancel.setVisible(false);	 
//							}
//						}
//					}.bind(this),
//					error : function(oError) {
//						sap.m.MessageBox.show(
//								this.i18n.getText("oData_conn_error"),
//								sap.m.MessageBox.Icon.ERROR,
//								this.i18n.getText("error")
//						);	
//					}.bind(this)
//			};
//
//			oModel.read(path, mParameters);
////E 20211020			
			
			this.set_auth_screen_ctrl();

			this.initDialog.close();
		},


		onCloseDialog_init : function(oEvent){

			if (this.initDialog){
				this.initDialog.close();
			}

			if (window.location.hostname != "localhost") {
				// Fiori Home 으로 돌아가기
				if(!this.param_swerk){ // Create Noti tile로 생성
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					oCrossAppNavigator.backToPreviousApp();
				}else{
					window.close();
				}
			}
		},


		onHandleDateChange : function(oEvent){

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var oDP = oEvent.oSource;
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
				if(sIdstr === "start_date" || sIdstr === "end_date"){
					this._cal_duration();
				}
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},


		onHandleTimeChange : function(oEvent){

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var oDP = oEvent.oSource;
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
				if(sIdstr === "start_time" || sIdstr === "end_time"){
					this._cal_duration();
				}
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		// MalFunction breakdown
		onChKSelect : function(oEvent){
			var screenModel = this.getView().getModel("createNoti");
			var oData = screenModel.getData();

			if(oEvent.getParameters().selected){
				oData.malfulMode = true;	

				var today = new Date();

				this.getView().byId("start_date").setDateValue(today);
				this.getView().byId("end_date").setDateValue(today);

				this._cal_duration();
			}else{
				this.getView().byId("start_date").setValue("");
				this.getView().byId("start_time").setValue("");
				this.getView().byId("end_date").setValue("");
				this.getView().byId("end_time").setValue("");
				this.getView().byId("bd").setValue("");

				this.getView().byId("start_date").setValueState("None");
				this.getView().byId("start_time").setValueState("None");
				this.getView().byId("end_date").setValueState("None");
				this.getView().byId("end_time").setValueState("None");

				oData.malfulMode = false;
			}
			screenModel.refresh();
		},


		// Shutdown indicator
		onChKSelect_shutdown : function(oEvent){

			var screenModel = this.getView().getModel("createNoti");
			var oData = screenModel.getData();

			if(oEvent.getParameters().selected){
				oData.ShutdownMode = true;

				var today = new Date();
//				debugger;
				this.getView().byId("shutdownF_date").setDateValue(today);
				this.getView().byId("shutdownT_date").setDateValue(today);

				var shutdownF_time = this.getView().byId("shutdownF_time");
				var shutdownT_time = this.getView().byId("shutdownT_time");
				
				var initFTime = this.formatter.strToTime("080000");
				var initTTime = this.formatter.strToTime("170000");
				
				shutdownF_time.setDateValue( initFTime );
				shutdownT_time.setDateValue( initTTime );
				
			}else{
				oData.ShutdownMode = false;

				this.getView().byId("shutdownF_date").setValue("");
				this.getView().byId("shutdownF_time").setValue("");
				this.getView().byId("shutdownT_date").setValue("");
				this.getView().byId("shutdownT_time").setValue("");

				this.getView().byId("shutdownF_date").setValueState("None");
				this.getView().byId("shutdownF_time").setValueState("None");
				this.getView().byId("shutdownT_date").setValueState("None");
				this.getView().byId("shutdownT_time").setValueState("None");
			}
			screenModel.refresh();
		},


		/*			onCatalog_pop : function(oEvent){

				var v_equnr = this.getView().byId("equnr").getValue();
				if(!v_equnr){
					sap.m.MessageBox.show(
					this.i18n.getText("err_equnr"),
					sap.m.MessageBox.Icon.WARNING,
					this.i18n.getText("warning"));
				}else{
					this._getDialog_Catalog().open();
				}
			},*/


		onSave : function(oEvent, status){

			if(!this.checkMandatory()){
				return;
			}

			if(!this.check_data()){
				return;
			}

			var oView = this.getView();
			var oModel = this.getView().getModel();
			var controll = this;

			//this.oNoti = this.getView().byId("noti");

			oModel.attachRequestSent( function(){ controll.oNoti.setBusy(true); });
			oModel.attachRequestCompleted( function(){ controll.oNoti.setBusy(false); });

			var data = {};

			data.Spras = this.getLanguage();
			data.Qmcod = this.getView().byId("cac").getSelectedKey();
			data.Qmart = this.getView().byId("not").getSelectedKey();
			data.Qmnam = this.getView().byId("reportedBy").getValue();
			data.Qmtxt = this.getView().byId("hd_desc").getValue();

			data.Qmdat = formatter.dateToStr(this.getView().byId("notidate").getDateValue());
			data.Mzeit = formatter.timeToStr(this.getView().byId("notitime").getDateValue());
			data.Mzeit.trim();

			data.Priok = this.getView().byId("pri").getSelectedKey();
			data.Strmn = formatter.dateToStr(this.getView().byId("reqdat_from").getDateValue());
			data.Ltrmn = formatter.dateToStr(this.getView().byId("reqdat_to").getDateValue());
			data.Tplnr = this.getView().byId("fl").getValue();
			data.Ingrp = this.getView().byId("plg").getSelectedKey();

			data.Arbpl = this.getView().byId("woc").getSelectedKey();
			if(this.oWoc.getModel().getData()){
				var woc_objid = this.oWoc.getModel().getData().results;
				for(var i=0; i<woc_objid.length; i++){
					if(woc_objid[i].Key === data.Arbpl){
						data.Objid = woc_objid[i].Add2;
						break;
					}
				}					
			}


			data.Equnr = this.getView().byId("equnr").getValue();
			data.Kostl = this.getView().byId("coc").getValue();
			data.Wline = this.getView().byId("cop").getSelectedKey();
			
			data.Bautl = this.getView().byId("bautl").getValue();
			//data.Bautx = this.getView().byId("bautx").getValue();


//			data.Swerk = this.getView().byId("swerk").getSelectedKey();
			data.Swerk = this.getView().byId("swerk").getSelectedItem().getKey();
			data.TpmTag = this.getView().byId("tpmtag").getValue();

			data.Ausvn = formatter.dateToStr(this.getView().byId("start_date").getDateValue());
			data.Auztv = formatter.timeToStr(this.getView().byId("start_time").getDateValue());
			data.Auztv.trim();

			data.Ausbs = formatter.dateToStr(this.getView().byId("end_date").getDateValue());
			data.Auztb = formatter.timeToStr(this.getView().byId("end_time").getDateValue());
			data.Auztb.trim();

			data.Msaus = this.getView().byId("breakdown").getSelected();
			data.Auszt = this.getView().byId("bd").getValue();
			data.Maueh = "H";  // 시간만 되도록 한다 .

			if(status == "R" || status == "D"){
				var reject = sap.ui.getCore().byId("resaon");
				data.LongTxt = reject.getValue();
			}else{
				data.LongTxt = this.getView().byId("desc").getValue();
			}

			data.StatMode = true;

			data.Qmnum = this.getView().byId("qmnum").getValue();

			var mode;
			if(data.Qmnum && this.param_mode === "C" ){
				mode = "U";
			}else{
				mode = this.param_mode;
			}
			data.Mode = mode;
			data.Zshutid = this.getView().byId("shutdownInd").getSelected();
			data.Zshutfrdate = formatter.dateToStr(this.getView().byId("shutdownF_date").getDateValue());
			data.Zshutfrtime = formatter.timeToStr(this.getView().byId("shutdownF_time").getDateValue());
			data.Zshutfrtime.trim();
			data.Zshuttodate = formatter.dateToStr(this.getView().byId("shutdownT_date").getDateValue());
			data.Zshuttotime = formatter.timeToStr(this.getView().byId("shutdownT_time").getDateValue());
			data.Zshuttotime.trim();

			data.Zbmind = this.getView().byId("bmcm").getSelectedKey();

			if(status){
				data.ChangeStatus = status;
			}

			data.ZextWork = this.getView().byId("zextWork").getSelectedKey();

			var estCost = this.getView().byId("zestCost").getValue();
			if(!estCost){
				estCost = 0;
			}				
			data.ZestCost = estCost.toString().replace(/,/g,"");
			data.Waers    = this.getView().byId("waers").getText();
			data.Zid      = this.getLoginId();

			data.HdItem = [];

			var oTable = this.getView().byId("table");
			var tableModel = oTable.getModel();
			var oData = tableModel.getData();
			if(oData){
				var cnt = oData.results.length - 1;

				for(var i=cnt; i>=0; i--){
					if(!oData.results[i].Otgrp){
						oData.results.splice(i, 1);
					}
				}
				data.HdItem = oData.results.slice(0);
			}

			data.HdReturn = [];

			data.Timestamp = this.eTag;

			var mParameters = {
					success : function(oData,response) {
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

							this.eTag = oData.Timestamp;

							oData.Ausvn = oData.Ausvn == "00000000" ? "" : oData.Ausvn;
							oData.Auztv = oData.Auztv == "000000" ? "" : oData.Auztv;
							oData.Ausbs = oData.Ausbs == "00000000" ? "" : oData.Ausbs;
							oData.Auztb = oData.Auztb == "000000" ? "" :  oData.Auztb;
							oData.Auszt = oData.Auszt == "0.0000000000000000E+00" ? "" : oData.Auszt;
							oData.Strmn = oData.Strmn == "00000000" ? "" : oData.Strmn;
							oData.Ltrmn = oData.Ltrmn == "00000000" ? "" : oData.Ltrmn;
							oData.Qmdat = oData.Qmdat == "00000000" ? "" : oData.Qmdat;
							oData.Mzeit = oData.Mzeit == "000000" ? "" : oData.Mzeit;

							oData.Zshutfrdate = oData.Zshutfrdate == "00000000" ? "" : oData.Zshutfrdate;
							oData.Zshutfrtime = oData.Zshutfrtime == "000000" ? "": oData.Zshutfrtime;
							oData.Zshuttodate = oData.Zshuttodate == "00000000" ? "":  oData.Zshuttodate;
							oData.Zshuttotime = oData.Zshuttotime == "000000" ? "": oData.Zshuttotime;
							oData.ZextWork    = oData.ZextWork    == "" ? "": oData.ZextWork;
							oData.ZestCost    = oData.ZestCost;
							oData.Waers       = oData.Waers;
							oData.Zfunc       = oData.Zfunc;

							var oODataJSONModel =  new sap.ui.model.json.JSONModel();
							oODataJSONModel.setData(oData);

							oView.setModel(oODataJSONModel, "NotiItem")

							var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();
							oODataJSONModel_item.setData(oData.HdItem);

							oTable.setModel(oODataJSONModel_item);
							oTable.bindRows("/results");

							controll.param_mode = "U";
							this.oNoti.setTitle(this.i18n.getText("title_change"));

							if(status === "T"){
								controll.set_displayMode("X");
							}else if(status === "P" && oData.Zpturl){
								controll.set_displayMode("X");						    	
							}else{
								controll.set_displayMode();
							}

							controll.getOwnerComponent().change_title();
							//controll._set_search_field();

							controll.change_display(oData);

							controll.approveState = "";

							var message = "";
							if(status == "P"){
								if(oData.Zpturl){			// ���ڰ��� URL ���� �� ��â
									controll.openWin( oData.Zpturl);
								}else{
									message = controll.i18n.getText("request_noti");							    	
									sap.m.MessageBox.show(
											message,
											sap.m.MessageBox.Icon.SUCCESS,
											controll.i18n.getText("success")
									);							    	
								}


							}else{
								message = controll.i18n.getText("create_noti", [oData.Qmnum]);
								sap.m.MessageBox.show(
										message,
										sap.m.MessageBox.Icon.SUCCESS,
										controll.i18n.getText("success")
								);								
							}

						}

						if(status == ""){
							window.close();
						}

					}.bind(this),
					error : function(oError) {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);	
					}.bind(this)
			};		

			/*			   if(this.param_mode == "U"){
				   var timestamp = this.getView().getModel("NotiItem").getData().Timestamp;
				   timestamp = "W/&quot;'"+timestamp+"'&quot;";

				   oModel.setHeaders({
					//"content-type" : "application/json;odata=verbose;charset=utf-8",
				    // "disableHeadRequestForToken" : "true",
			         "If-Match" : timestamp   //this.eTag
			        });
			    };*/

			oModel.create("/HdSet", data, mParameters);
		},

		openWin : function(sPath){
			var html = new sap.ui.core.HTML();

			$(document).ready(function(){
				window.open(sPath);
			});						
		},			
		/*            onComplete : function(oEvent){

            	if(!this.getView().byId("qmnum").getValue()){
            		return;
            	}

				var oModel = this.getView().getModel();
				var controll = this;

				oModel.attachRequestSent(
						  function(){
							controll.oNoti.setBusy(true);
					    });
				oModel.attachRequestCompleted(
				  function(){
					controll.oNoti.setBusy(false);
			    });

				var data = {};

				data.Qmnum = this.getView().byId("qmnum").getValue();
				data.Spras = this.getLanguage();
				data.Swerk = this.getView().byId("swerk").getSelectedKey();

				var today = new Date();
				var str_today = formatter.dateTimeToStr(today);

				var strArr = str_today.split("-");
				data.Refdate = strArr[0];
				data.Reftime = strArr[1];

				data.Mode = "P";
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

							this.oView.getModel("createNoti").getData().StatMode = oData.StatMode;
							this.oView.getModel("createNoti").getData().Complete = oData.StatMode;
							this.oView.getModel("createNoti").getData().malfulMode = oData.StatMode;
							this.oView.getModel("createNoti").getData().ShutdownMode = oData.StatMode;

							this.oView.getModel("createNoti").refresh(true);

							var message = "";
							message = controll.i18n.getText("complete_noti", [data.Qmnum]);
							sap.m.MessageBox.show(
							     message,
								 sap.m.MessageBox.Icon.SUCCESS,
								 controll.i18n.getText("success")
						    );
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
		 */			

		onProposal : function(oEvent){
			var controll = this;

			Message.confirm(this.i18n.getText("notiProposal"),
					{//title: "",
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.onSave("", "P") ;  //���ο�û
						//controll._reqapproval_Dialog_handler.onReqApproval(sObj);								   		
						//controll.onAppCancelDialog();  // Pop-Up Close
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: sap.m.MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit }
			);		    	

			//this.onSave("", "P") ;  //���ο�û
		},


		onComplete : function(oEvent){
			var controll = this;

			Message.confirm(this.i18n.getText("notiComplete"),
					{//title: "",
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.onSave("", "T");
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: sap.m.MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit }
			);	

			//	this.onSave("", "T");
		},

//		check_approve : function(oData){
//		debugger;

//		if(oData.ZextWork             === "X" &&
//		oData.Swerk.substring(0,1) === "2" &&
//		oData.Qmart                === "M1"){		// NOS6 �� ����
//		if(oData.Zfunc == "PP" || oData.Zfunc == "PM"){
//		return true;			// ���� �����ڸ� ����
//		}else{
//		return false;			// ���Ѿ����� ����
//		}
//		}else{
//		return true;				// ������ ����
//		}
//		},

		onApprove : function(oEvent){
			var controll = this;

			var oModel = this.getView().getModel("NotiItem");
			var oData  = oModel.getData();

//			if(controll.check_approve(oData)){
			Message.confirm(this.i18n.getText("notiApprove"),
					{//title: "",
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.onSave("", "A") ;  //���� - ����
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: sap.m.MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit }
			);					
//			}else{
//			sap.m.MessageBox.show(
//			this.i18n.getText("err_notiAppr_auth"),
//			sap.m.MessageBox.Icon.ERROR,
//			this.i18n.getText("error")
//			);	
//			}
			//this.onSave("", "A") ;  //���� - ����
		},

		onReject : function(oEvent){
			var controll = this;

			var oModel = this.getView().getModel("NotiItem");
			var oData  = oModel.getData();

//			if(controll.check_approve(oData)){
			this.approveState = "R";

			this._getDialog_ResaonReject().open();
//			}else{
//			sap.m.MessageBox.show(
//			this.i18n.getText("err_notiAppr_auth"),
//			sap.m.MessageBox.Icon.ERROR,
//			this.i18n.getText("error")
//			);						
//			}

			/*				var controll = this;
			 *              Message.confirm(this.i18n.getText("notiReject"),
						{//title: "",
			             onClose : function(oAction){
						   	if(oAction=="OK"){
	                            controll.onSave("", "R") ;  //���� - �ݷ�
							}else{
								return false;
							}
						 },
			             styleClass: "",
			             initialFocus: sap.m.MessageBox.Action.OK,
			             textDirection : sap.ui.core.TextDirection.Inherit }
				);	*/
		},

		onAccept : function(oEvent){				

			var v_qmnum = this.getView().byId("qmnum").getValue();
			var v_woc = this.getView().byId("woc").getSelectedKey();
			var v_swerk = this.oSwerk.getSelectedKey();
			var v_auart = "";

			var oQmart = this.getView().byId("not").getModel().getData().results;
			var v_qmart = this.getView().byId("not").getSelectedKey();
			var v_bmcm = this.getView().byId("bmcm").getSelectedKey();
			//debugger point
			debugger;
			if(v_qmart == "M1"){
				if(v_bmcm){

					// 20210813 ENG혁신팀 조영내님 요청. NM통지일때도 오더 생성가능하도록 해달라.
					/*if(v_bmcm == "NM"){
						sap.m.MessageBox.show(
								this.i18n.getText("chk_zbmind_nm"),  //
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
						return false;						   						
					}else{*/

						this.onSave("", "");  // ZBMIND Update �� Accept ����

						for(var i=0; i<oQmart.length; i++){
							if(v_qmart == oQmart[i].Key){
								v_auart = oQmart[i].Add1;
								break;
							}
						}

						if(window.location.hostname != "localhost"){
//							window.close();

							var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');

							var hash = navigationService.hrefForExternal({
								target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
								params: { param_mode: 'C',
									param_qmnum : v_qmnum,
									param_woc : v_woc,
									param_ort : v_auart,   //order type
									param_swerk : v_swerk
								}
							});

							var url = window.location.href.split('#')[0] + hash;
							sap.m.URLHelper.redirect(url, true);	

							//navigationService.backToPreviousApp();
							//window.close();

						}
					//}

				}else{
					this.onSave("", "");  // ZBMIND Update �� Accept ����

					for(var i=0; i<oQmart.length; i++){
						if(v_qmart == oQmart[i].Key){
							v_auart = oQmart[i].Add1;
							break;
						}
					}

					if(window.location.hostname != "localhost"){
//						window.close();

						var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');

						var hash = navigationService.hrefForExternal({
							target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
							params: { param_mode: 'C',
								param_qmnum : v_qmnum,
								param_woc : v_woc,
								param_ort : v_auart,   //order type
								param_swerk : v_swerk
							}
						});

						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);	

						//navigationService.backToPreviousApp();
						//window.close();

					}
					/*
					this.getView().byId("bmcm").setValueState("Error");

					sap.m.MessageBox.show(
							this.i18n.getText("err_check_zbmind"),  //
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);
					*/
				}						
			}else{

				this.onSave("", "");  // ZBMIND Update �� Accept ����

				for(var i=0; i<oQmart.length; i++){
					if(v_qmart == oQmart[i].Key){
						v_auart = oQmart[i].Add1;
						break;
					}
				}

				if(window.location.hostname != "localhost"){
//					window.close();

					var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');

					var hash = navigationService.hrefForExternal({
						target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
						params: { param_mode: 'C',
							param_qmnum : v_qmnum,
							param_woc : v_woc,
							param_ort : v_auart,   //order type
							param_swerk : v_swerk
						}
					});

					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);	

					//navigationService.backToPreviousApp();
					//window.close();

				}

			}

		},


		onAcceptdeny : function(oEvent){

			this.approveState = "D";

			this._getDialog_ResaonReject().open();
			//this.onSave("", "D") ;  //���� - �ݷ�
		},


		onTabBtn_cat : function(oEvent){

			var v_equnr = this.getView().byId("equnr").getValue();
			var v_tplnr = this.getView().byId("fl").getValue();

			if(!v_equnr && !v_tplnr){
				sap.m.MessageBox.show(
						this.i18n.getText("err_check_equnrfl"),
						sap.m.MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);
			}else{
				this.sel_row = oEvent.getSource().getParent().getIndex();
				this._getDialog_Catalog().open();
			}
		},


		onAdd : function(oEvent){
			var oData = {};
			var oTable = this.getView().byId("table");
			var tableModel = oTable.getModel();

			var seq = 0;
			var hditem = [];

			if(tableModel.getData()){
				oData = tableModel.getData();
				hditem = oData.results;
				if(oData.results.length > 0){
					var idx = hditem.length - 1;
					seq = hditem[idx].Seq;
				}else{
					seq = 0;
				}
			};

			var next_seq = seq + 1;

			hditem.push({
				"Seq" : next_seq,
				"Otgrp" : "",
				"Qktextgr" : "",
				"Oteil" : "",
				"Txtcdot" : "",
				"Fegrp" : "",
				"Fktextgr" : "",
				"Fecod" : "",
				"Txtcdfe" : "",
				"Fetxt" : "",
				"Urgrp" : "",
				"Uktextgr" : "",
				"Urcod" : "",
				"Txtcdur" : "",
				"Urtxt" : "",
				"Mngrp" : "",
				"Mktextgr" : "",
				"Mncod" : "",
				"Txtcdma" : "",
				"Matxt" : ""
			});

			oData.results = hditem;
			tableModel.setData(oData);

			var idx = hditem.length-1;
			oTable.setFirstVisibleRow(idx);
			$("input[id*='Seq']").focus().trigger("click");
		},


		onDelete : function(oEvent){

			var oTable;
			oTable = this.getView().byId("table");

			var aIndices = oTable.getSelectedIndices();
			if (aIndices.length < 1) {
				Toast.show(this.i18n.getText("isnotselected"));
				return;
			}

			//var tableModel = oTable.getModel("tableModel");
			var tableModel = oTable.getModel();
			var odata = tableModel.getData();
			var hditem = odata.results;

			var cnt = hditem.length - 1 ;

			for(var i=cnt; i>=0; i--){
				for(var j=0; j<aIndices.length; j++){
					if(i === aIndices[j] ){
						var removed = hditem.splice(i, 1);
						break;
					}
				}	
			};

//			for(var j=0; j<hditem.length; j++){
//			hditem[j].Seq = j+1;
//			}

			odata.results = hditem;
			tableModel.setData(odata);

			oTable.clearSelection();
		},


		onRefresh : function(oEvent){

			window.location.reload();

		},


		onPress_Order : function(oEvent){

			var v_swerk = this.oSwerk.getSelectedKey();
			var v_order = this.getView().byId("aufnr").getValue();
			// Step 1: Get Service for app to app navigation
			var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
			// Step 2: Navigate using your semantic object

			var hash = navigationService.hrefForExternal({
				target: {semanticObject : 'ZPM_SO_0110', action: 'display'},
				params: { param_mode: "D",
					param_swerk : v_swerk,
					param_order : v_order
				}
			});

			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);			
		},

		onPress_PMClasf : function(oEvent){

			this._getDialog_PMClasf().open();

		},
		
		// Combobox validation
		onCBChange : function(oEvent){

			var newValue = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();

			if(newValue != "" && key == null ){
				oEvent.getSource().setValueState("Error");
			}else{
				oEvent.getSource().setValueState("None");
			}

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			if(this.chkComboValidation.indexOf(sIdstr) == -1){
				this.chkComboValidation.push(sIdstr);	
			}
			
			//bmcm 타입별 분기위해 작성
			if(sIdstr =="bmcm") {
				if(newValue == "BM") {
					this.getView().byId("shutdownInd").setSelected(true);
				}else {
					this.getView().byId("shutdownInd").setSelected(true);
				}
			}

//			if(sIdstr == "pls"){
//				var v_swerk = this.oSwerk.getSelectedItem().valueOf().getKey();
//				var vBeber  = this.oPls.getSelectedKey();
//				this.getView().byId("pls").setSelectedKey(vBeber);	
//				
//				this.oCoc = this.getView().byId("coc");
//				if(this.oCoc){
//					utils.set_search_field(v_swerk, this.oCoc, "cpc", "C", vBeber, "");
//				}
//				
////				var vCnt   = this.oCoc.getList().mAggregations.items.length;
////				if(vCnt == 0){
////					this.getView().byId("coc").setSelectedKey("");
////				}else{
////					var vKostl = this.oCoc.getList().mAggregations.items[0].getKey();
////					this.getView().byId("coc").setSelectedKey(vKostl);					
////				}
//			}
			
		},



		/*****************************************
		 * File Upload
		 *****************************************/
		get_attach_file : function(){

			var oModel = this.getView().getModel("fileUpload");

			var controll = this;
			var oFTable = this.getView().byId("table_file");			
			oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oFTable.setBusy(false);
				oFTable.setShowNoData(true);
			});

			var doknr = "";
			var s_swerk = this.oSwerk.getSelectedKey();
			var s_qmnum = this.getView().byId("qmnum").getValue();

			var path = "/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='"+ s_qmnum +"',RequestNo='')";

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
						sap.m.MessageBox.show(
								controll.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
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
				sap.m.MessageBox.show(
						controll.i18n.getText("fileUploadSuccess"),
						sap.m.MessageBox.Icon.SUCCESS,
						controll.i18n.getText("success")
				);		

				oEvent.getSource().setValue("");

				//÷������ �ٽ� �б�
				this.get_attach_file();
				this.getView().byId("noti").setBusy(false);		

			} else {
				sap.m.MessageBox.show(
						//controll.i18n.getText("fileUploadError"),
						sRetMsg,
						sap.m.MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);								
			}
//			if (sStatus) {
//			var message = "";
////			var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
//			if (sStatus == "200" || sStatus == "201" ) {
//			//oEvent.getParameter("headers").location
//			//oEvent.getParameter("fileName")
////			fileUploadMessage  = Return Code: {0} \n {1}
////			message = controll.i18n.getText("fileUploadMessage", [sStatus, sFilename]);

//			sap.m.MessageBox.show(
//			controll.i18n.getText("fileUploadSuccess_noti"),
//			sap.m.MessageBox.Icon.SUCCESS,
//			controll.i18n.getText("success")
//			);		

//			oEvent.getSource().setValue("");

//			//÷������ �ٽ� �б�
//			this.get_attach_file();
//			this.getView().byId("noti").setBusy(false);		

//			} else {
//			sap.m.MessageBox.show(
//			controll.i18n.getText("fileUploadError_noti"),
//			sap.m.MessageBox.Icon.ERROR,
//			this.i18n.getText("error")
//			);								
//			}
//			}
		},	

		handleTypeMissmatch: function(oEvent) {

			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
			var sSupportedFileTypes = aFileTypes.join(", ");
			var message = "";
			message = this.i18n.getText("fielTypeMissmatch", [oEvent.getParameter("fileType")], [sSupportedFileTypes]);

//			Toast.show("The file type *." + oEvent.getParameter("fileType") +
//			" is not supported. Choose one of the following types: " +
//			sSupportedFileTypes);

			Toast.show(message);

		},	

		handleValueChange: function(oEvent) {

//			var oFileUploader  = sap.ui.getCore().byId("fileUploader");
//			var oFileSize =  oFileUploader.getSize();

			var message = "";
			message = this.i18n.getText("fielValueChange", [oEvent.getParameter("newValue")]);

			Toast.show(message);				
		},


		uploadProgress : function (oEvent){
			this.getView().byId("noti").setBusy(true);
			//console.log("uploadProgress");
		},

		onBtnFileDelete : function(oEvent){

			var oFTable = this.getView().byId("table_file");
			var idx = oEvent.getSource().getParent().getIndex();

			var doknr = oFTable.getModel().getData().ResultList.results[idx].Doknr;

			var controll = this;
			var oModel = this.getView().getModel("fileUpload");

			var oFTable = this.getView().byId("table_file");
			oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oFTable.setBusy(false);
				oFTable.setShowNoData(true);
			});

			var s_qmnum = this.getView().byId("qmnum").getValue();
			var s_swerk = this.oSwerk.getSelectedKey();

			var path = "/InputSet(Swerk='"+s_swerk+"',Aufnr='',Qmnum='"+ s_qmnum +"',Doknr='"+ doknr +"',RequestNo='')";
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

						var length = 0;
						length = oData.ResultList.results.length;
						if(length == 0){
							length = 1;
						}
						oFTable.setVisibleRowCount(length)

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
			//oModel.remove(path, mParameters);	
		},


		onDownload : function(oEvent){

			var oFTable = this.getView().byId("table_file");
			var idx = oEvent.getSource().getParent().getIndex();

			var doknr = oFTable.getModel().getData().ResultList.results[idx].Doknr;

			//this._calibration_Dialog_handler.download_file(lv_dokrn);

			var oModel = this.getView().getModel("fileUpload");
			var controll = this;

			var oFTable = this.getView().byId("table_file");			
			oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oFTable.setBusy(false);
				oFTable.setShowNoData(true);
			});

			var s_qmnum = this.getView().byId("qmnum").getValue();
			var s_swerk = this.oSwerk.getSelectedKey();

			var sPath;

			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='"+s_qmnum + "',RequestNo='')/$value";
			} else {	
				sPath = "/sap/opu/odata/sap/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Aufnr='',Doknr='"+ doknr +"',Qmnum='"+s_qmnum +"',RequestNo='')/$value";				
			}

			var html = new sap.ui.core.HTML();

			$(document).ready(function(){
				window.open(sPath);
			});	

		},


		onBtnFileUpload : function(oEvent){

			if(this.getView().byId("qmnum").getValue() == ""){
				sap.m.MessageBox.show(
						this.i18n.getText("chk_upload_file"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);		
				return;
			}

			var controll = this;

			var oModel = this.getView().getModel("fileUpload");

			var oUploader = this.getView().byId("fileUploader");
			var s_qmnum = this.getView().byId("qmnum").getValue();
			var s_swerk = this.oSwerk.getSelectedKey();

			var sFileName = oUploader.getValue();

			if(!sFileName){
				Toast.show(this.i18n.getText("choosefileselect"));
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

			/*				oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                    name: "aufnr",
                    value: encodeURIComponent(s_aufnr)
                }));*/

			oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "qmnum",
				value: encodeURIComponent(s_qmnum)
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
		 *  External SearchHelp Event Handler
		 ****************************************************************/			
		onClose_searchEquip : function(aTokens, aObj){
			this.equip_selrow = [];
			this.equip_selrow = aObj;

			if(this.equnrName == "equnr_init"){
				var oEqunr_init = sap.ui.getCore().byId("equnr_init");
				var oEqunr_init_tx = sap.ui.getCore().byId("equnr_init_tx");

				if(oEqunr_init instanceof sap.m.MultiInput){
					oEqunr_init.setTokens(aTokens);
				}else{
					if(aObj.length >= 1){
						sap.ui.getCore().byId("fl_init").setValue(aObj[0].TPLNR);
						sap.ui.getCore().byId("fl_init_tx").setText(aObj[0].PLTXT);

						oEqunr_init.setValue(aObj[0].EQUNR);
						oEqunr_init_tx.setText(aObj[0].EQKTX);

					}
				}

				oEqunr_init.setValueState("None");
				sap.ui.getCore().byId("fl_init").setValueState("None");

			}else if(this.equnrName == "equnr"){
				var oEqunr = this.getView().byId("equnr");
				var oEqktx =  this.getView().byId("eqktx");

				if(oEqunr instanceof sap.m.MultiInput){
					this.getView().byId("equnr").setTokens(aTokens);
				}else{
					if(aObj.length >= 1){
						this.getView().byId("fl").setValue(aObj[0].TPLNR);
						this.getView().byId("fl_tx").setText(aObj[0].PLTXT);

						oEqunr.setValue(aObj[0].EQUNR);
						oEqktx.setText(aObj[0].EQKTX);

						if(this.equip_selrow){
							this.getView().byId("woc").setSelectedKey(this.equip_selrow[0].ARBPL);
							this.getView().byId("plg").setSelectedKey(this.equip_selrow[0].INGRP);
							this.getView().byId("coc").setValue(this.equip_selrow[0].KOSTL);
							this.getView().byId("cocTx").setText(this.equip_selrow[0].KOSTL_TXT);
						}else{
							this.getView().byId("woc").setSelectedKey("");
							this.getView().byId("plg").setSelectedKey("");
							this.getView().byId("coc").setValue("");
							this.getView().byId("cocTx").setText("");
						}	
					}
				}

				oEqunr.setValueState("None");
			}
		},


		onClose_funcLocation : function(aTokens, aObj){	
			this.equip_selrow = [];
			this.equip_selrow = aObj;

			if(this.flName == "fl_init"){

				var oFl = sap.ui.getCore().byId("fl_init");
				var oFl_Tx = sap.ui.getCore().byId("fl_init_tx");

				if(oFl instanceof sap.m.MultiInput){
					sap.ui.getCore().byId("fl_init").setTokens(aTokens);
				}else{
					oFl.setValue(aTokens[0].getKey());
					oFl_Tx.setText(aTokens[0].getText());
				}
				oFl.setValueState("None");

			}else if(this.flName == "fl"){

				var oFl = this.getView().byId("fl");
				var oFl_Tx = this.getView().byId("fl_tx");

				if(oFl instanceof sap.m.MultiInput){
					this.getView().byId("fl").setTokens(aTokens);
				}else{
					oFl.setValue(aTokens[0].getKey());
					oFl_Tx.setText(aTokens[0].getText());
				}

				oFl.setValueState("None");

			}
		},

		/**********************************************************
		 * Resaon for Reject
		 *************************************************************/
		onConfirmDialog_reason : function(oEvent){

			var resaon = sap.ui.getCore().byId("resaon").getValue();
			if(!resaon){
				sap.m.MessageBox.show(
						this.i18n.getText("chek_reject"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
			}else{
				var message = "";
				if(this.approveState == "R"){
					message = this.i18n.getText("reasonforreject") + " : " + '\n' + resaon;
					sap.ui.getCore().byId("resaon").setValue(message);
					this.onSave("", "R");
				}else if(this.approveState == "D"){
					message = this.i18n.getText("reasonfordeny") + " : " + '\n' + resaon;
					sap.ui.getCore().byId("resaon").setValue(message);
					this.onSave("", "D");
				}
				this._oDialog_Resaon.close();
			}
		},


		onCloseDialog_reason : function(oEvent){
			this._oDialog_Resaon.close();
		},


		/**********************************************************
		 * PM Classfication
		 *************************************************************/
		onCloseDialog_pmclasf : function(oEvent){
			this._oDialog_PMClasf.close();
		},
		
		/************************************************************
		 * Catalog_pop
		 *************************************************************/
		onCloseDialog_Catalog : function(oEvent){
			if(this.oQkatart == "B"){
				this._oDialog_Catalog.close();			
			}else{
				this._Catalog_Dialog_handler.cancelDialog_sub();			
			}
		},

		//confirm(select)
		onConfirmDialog_Catalog : function(oEvent){
			this._Catalog_Dialog_handler.confirmDialog_sub(oEvent);
		},

		//Adopt & Close
		onAdoptDialog_Catalog : function(oEvent){
			var catalogSet = [];
			var sCatalog;

			catalogSet = this._Catalog_Dialog_handler.adoptDialog_Sub(oEvent);

			if(catalogSet){
				var oTable = this.getView().byId("table");
				//var tableModel = oTable.getModel("tableModel");
				var tableModel = oTable.getModel();
				var oData = tableModel.oData;

				var idx = this.sel_row;

				for(var i=0; i<catalogSet.length; i++){
					sCatalog = catalogSet[i][0];

					if(catalogSet[i][0] == "B"){
						oData.results[idx].Otgrp = catalogSet[i][4];
						oData.results[idx].Qktextgr = catalogSet[i][5];
						oData.results[idx].Oteil = catalogSet[i][1];
						oData.results[idx].Txtcdot =  catalogSet[i][2];
					}else if(catalogSet[i][0] == "C"){
						oData.results[idx].Fegrp = catalogSet[i][4];
						oData.results[idx].Fktextgr = catalogSet[i][5];
						oData.results[idx].Fecod = catalogSet[i][1];
						oData.results[idx].Txtcdfe = catalogSet[i][2];
						oData.results[idx].Fetxt = catalogSet[i][3];
					}else if(catalogSet[i][0] == "5"){
						oData.results[idx].Urgrp = catalogSet[i][4];
						oData.results[idx].Uktextgr = catalogSet[i][5];
						oData.results[idx].Urcod = catalogSet[i][1];
						oData.results[idx].Txtcdur = catalogSet[i][2];
						oData.results[idx].Urtxt = catalogSet[i][3];
					}else if(catalogSet[i][0] == "A"){
						oData.results[idx].Mngrp = catalogSet[i][4];
						oData.results[idx].Mktextgr = catalogSet[i][5];
						oData.results[idx].Mncod = catalogSet[i][1];
						oData.results[idx].Txtcdma = catalogSet[i][2];
						oData.results[idx].Matxt = catalogSet[i][3];
					}
				}

				if(sCatalog == "C"){
					oData.results[idx].Urgrp = "";
					oData.results[idx].Uktextgr = "";
					oData.results[idx].Urcod = "";
					oData.results[idx].Txtcdur = "";
					oData.results[idx].Urtxt = "";

					oData.results[idx].Mngrp = "";
					oData.results[idx].Mktextgr = "";
					oData.results[idx].Mncod = "";
					oData.results[idx].Txtcdma = "";
					oData.results[idx].Matxt = "";	
				}

				if(sCatalog == "5"){
					oData.results[idx].Mngrp = "";
					oData.results[idx].Mktextgr = "";
					oData.results[idx].Mncod = "";
					oData.results[idx].Txtcdma = "";
					oData.results[idx].Matxt = "";				
				}					
				tableModel.setData(oData);

				this.sel_row = "";
			}
			/*				this._oDialog_Catalog.destroy();
				this._oDialog_Catalog = "";
				this._Catalog_Dialog_handler.destroy();
				this._Catalog_Dialog_handler = "";*/

		},	


		onCollapse : function(oEvent){
			var tree = sap.ui.getCore().byId("Catalog_tree");
			tree.collapseAll();
		},


		onExpand : function(oEvent){
			var tree = sap.ui.getCore().byId("Catalog_tree");
			tree.expandToLevel("1");
		},


		/****************************************************************
		 *  Local Function
		 ****************************************************************/			
		_set_search_field_init : function(){

			var v_swerk =  this.oSwerk_init.getSelectedKey();

			this.oNot = sap.ui.getCore().byId("not_init");
			if(this.oNot){
				utils.set_search_field(v_swerk, this.oNot, "not", "C", "", "");
			}

			// 2018-09-08 husel, Init popupȭ�鿡�� Notification Type�� �ʰ� �ߴ� ���� �м� �� ��ġ
			// Assembly(material data 92,857��) �����͸� ���� �о� ���鼭 ������ ����
			// �� �κ��� Assembly Search Help ��ư�� Ŭ�� �� �����͸� �о���� ������ ����-> onValueHelpRequest�� �̵�
//			this.oAsm_init = sap.ui.getCore().byId("bautl_init");
//			if(this.oAsm_init){
//			utils.set_search_field(v_swerk, this.oAsm_init, "asm", "H", "", "");
//			}

			/*				this.oEqunr_init = sap.ui.getCore().byId("equnr_init");
				this.oFl_init = sap.ui.getCore().byId("fl_init"); */

		},


		_set_search_field : function(){
			
			var v_swerk = this.oSwerk.getSelectedKey();

			//Notification type
			this.oNot = this.getView().byId("not");
			if(this.oNot){
				utils.set_search_field(v_swerk, this.oNot, "not", "C", "", "");
			}

			//Serverity
			this.oCac = this.getView().byId("cac");
			if(this.oCac){
				utils.set_search_field(v_swerk, this.oCac, "cac", "C", "D", "");
			}	

			//Priority
			this.oPri = this.getView().byId("pri");
			if(this.oPri){
				utils.set_search_field(v_swerk, this.oPri, "pri", "C", "", "");
			}

			//Planner Group
			this.oPlg = this.getView().byId("plg");
			if(this.oPlg){
				utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
			}

			//Plant Section
			this.oPls = this.getView().byId("pls");
			if(this.oPls){
				utils.set_search_field(v_swerk, this.oPls, "pls", "C", "", "");
			}
			
			//cost center&nbsp;
			this.oCoc = this.getView().byId("coc");
			for(var i=0; i<this.arr_kokrs.length; i++){
				if(this.arr_kokrs[i].Default === "X"){
					var kokrs = this.arr_kokrs[i].Value;
					break;
				}
			}
			if(this.oCoc){
				var oPage = this.getView().byId("noti");	
				utils.set_search_field(v_swerk, this.oCoc, "coc", "H", kokrs, "", "",oPage);
			}			
			
//			//cost center
//			this.oCoc = this.getView().byId("coc");
//			
//			if(this.equip_selrow === undefined){
//				// 신규 생성이 아닌 변경모드의 경우 Notification 데이터를 가져온 다음 Search Field 재구성 해준다. 
//			}else{
////				신규 생성시 this.equip_selrow 에 값이 들어오기 때문에 그 값을 이용해서 
//				var vBeber;
//				vBeber = this.equip_selrow[0].BEBER;				
//				if(this.oCoc){
//					utils.set_search_field(v_swerk, this.oCoc, "cpc", "C", vBeber, "");
//				}				
//			}

			//work center
			this.oWoc = this.getView().byId("woc");
			if(this.oWoc){
				utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
			}

			//Work Line ( Plant Section + Cost Center )
			this.oCop = this.getView().byId("cop");
			if(this.oCop){
				utils.set_search_field(v_swerk, this.oCop, "cpc", "C", "", "");
			}
			
//			this.oAsm = this.getView().byId("bautl");
//			if(this.oAsm){
//				utils.set_search_field(v_swerk, this.oAsm, "asm", "H", "", "");
//			}				
			
			
			// 2018-09-08 husel, Init popupȭ�鿡�� Notification Type�� �ʰ� �ߴ� ���� �м� �� ��ġ
			// Assembly(material data 92,857��) �����͸� ���� �о� ���鼭 ������ ����
			// �� �κ��� Assembly Search Help ��ư�� Ŭ�� �� �����͸� �о���� ������ ����-> onValueHelpRequest�� �̵�
//			this.oAsm = this.getView().byId("bautl");
//			if(this.oAsm){
//				utils.set_search_field(v_swerk, this.oAsm, "asm", "H", "", "");
//			}					
			
			//Units of Measurement
			/*				this.oUom = this.getView().byId("uom");
				if(this.oUom){
					utils.set_search_field(v_swerk, this.oUom, "uom", "C", "TIME", "");
				}*/

			var oEqunr = this.getView().byId("equnr");
			var oFl = this.getView().byId("fl");

		},


		/*
		 * Dialog open
		 */
		_getDialog_init  : function(){
			var controll = this;

			if(!this.initDialog){
				this.initDialog = sap.ui.xmlfragment("cj.pm0090.view.Init_pop", this);
				this.getView().addDependent(this.initDialog);
				/*this.initDialog.addEventDelegate({
			        	"onAfterRendering": function(){
			        		console.log("init Dialog rendered");
			        		 controll._set_search_field();  // set Search Help
			        		 controll.setInitData();
			        	}
		            });*/
			}

			this.initDialog.open();
			this.setInitData_init();
			this._set_search_field_init();  // set Search Help


		},

		/*
		 * Catalog Dialog open
		 */
		_getDialog_Catalog  : function(){

			if (!this._oDialog_Catalog) {
				this._oDialog_Catalog = sap.ui.xmlfragment("cj.pm0090.view.Catalog_pop", this);

				this.oTree_catalog = sap.ui.getCore().byId("Catalog_tree");
				this._Catalog_Dialog_handler = new Catalog(this._oDialog_Catalog, this);

				this.getView().addDependent(this._oDialog_Catalog);      		
			}

			var v_equnr = this.getView().byId("equnr").getValue();
			var v_qmart = this.getView().byId("not").getSelectedKey();
			this._Catalog_Dialog_handler.get_catalog_data("B", v_equnr, v_qmart);

			return this._oDialog_Catalog;

		},

		/*
		 * Reason for Reject Dialog open
		 */
		_getDialog_ResaonReject : function(){

			if (!this._oDialog_Resaon) {
				this._oDialog_Resaon = sap.ui.xmlfragment("cj.pm0090.view.ResaonReject_pop", this);

				this.getView().addDependent(this._oDialog_Resaon);      		
			}

			return this._oDialog_Resaon;
		},

		_getDialog_PMClasf : function(){
			
			if (!this._oDialog_PMClasf) {
				this._oDialog_PMClasf = sap.ui.xmlfragment("cj.pm0090.view.PMClasf_pop", this);

				this.oTable_pmclasf = sap.ui.getCore().byId("table_pmclasf");
				this._PMClasf_Dialog_handler = new PMClasf(this._oDialog_PMClasf, this);
				
				this.getView().addDependent(this._oDialog_PMClasf);      		
			}
			this._PMClasf_Dialog_handler.get_pmclasf_data();
			
			return this._oDialog_PMClasf;
		},

		_cal_duration_old : function(){
			var diffdate, diffd;

			var s_date = this.getView().byId("start_date").getDateValue();
			var e_date = this.getView().byId("end_date").getDateValue();

			if(s_date && e_date){
				diffdate = Math.abs(e_date.getTime() - s_date.getTime());
				diffd = Math.ceil( diffdate / (1000 * 60 * 60 ));

				this.getView().byId("bd").setValue(diffd);
				this.getView().byId("bd").setEditable(true);

			}else{
				this.getView().byId("bd").setValue("");
				this.getView().byId("bd").setEditable(false);
			}
		},


		_cal_duration : function(){
			var differ;
			var startDate;
			var startTime;
			var endDate;
			var endTime;

			var chk ;

			startDate = this.getView().byId("start_date").getValue();
			if(startDate != ""  ){
				if(this.getView().byId("start_time").getDateValue()){
					startTime = this.getView().byId("start_time").getValue();	
				}else{
					chk = "X";
				}
			}else{
				startTime = "";
				chk = "X";
			}

			endDate   = this.getView().byId("end_date").getValue();
			if(endDate != ""  ){
				if(this.getView().byId("end_time").getDateValue()){
					endTime = this.getView().byId("end_time").getValue();	
				}else{
					chk = "X";
				}
			}else{
				endTime = "";
				chk = "X";
			}			

			if(!chk){
				differ = utils.cal_duration(startDate, startTime, endDate, endTime);

				if(differ < 0){
					this.getView().byId("start_date").setValueState("Error");
					this.getView().byId("start_time").setValueState("Error");
					this.getView().byId("end_date").setValueState("Error");
					this.getView().byId("end_time").setValueState("Error");

					this.getView().byId("bd").setValue(differ);

					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}else{
					this.getView().byId("start_date").setValueState("None");
					this.getView().byId("start_time").setValueState("None");
					this.getView().byId("end_date").setValueState("None");
					this.getView().byId("end_time").setValueState("None");

					this.getView().byId("bd").setValue(differ);
					return true;
				}
			}
		}

	});
});