sap.ui.define([
               "cj/pm0110/controller/BaseController",
               "cj/pm0110/util/ValueHelpHelper",
               "cj/pm0110/util/utils",
               "cj/pm0110/model/formatter",
               "cj/pm0110/util/ReqApproval",
               "cj/pm0110/util/WorkAssign",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global",
               "cj/pm0101/util/Catalog",
               ], function (BaseController, ValueHelpHelper, utils, formatter, ReqApproval, WorkAssign, Filter, FilterOperator, JSONModel, Message, Toast, jQuery, Catalog ) {
	"use strict";

	return BaseController.extend("cj.pm0110.controller.Main", {
		formatter : formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @public
		 */
		onInit : function () {

			if(this.getOwnerComponent()){
				this.param_mode = this.getOwnerComponent().get_param_mode();
				this.param_order = this.getOwnerComponent().get_param_order();
				this.param_qmnum = this.getOwnerComponent().get_param_qmnum();
				this.param_woc = this.getOwnerComponent().get_param_woc();
				this.param_ort = this.getOwnerComponent().get_param_ort();

				//Order Create 인 경우 swerk가 반드시 필요함 
				this.param_swerk = this.getOwnerComponent().get_param_swerk();
			}

			if(!this.param_mode){
				this.param_mode = "C";  // Create 
			}

			//Test
			/*        this.param_qmnum = "10000102";
        this.param_woc = "PM100";*/

			/*        this.param_mode = "U";
        this.param_order = "40009247";*/

			//최초 호울 시 에는 모두 막아서 화면을 띄운다.
			this.set_screen_mode();
			this.set_displayMode("X");

			this.old_operationlist = {};

			this.chkComboValidation = [];

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		onBeforeRendering: function() {
			if(!this.first_time){ 
//				this.i18n = this.getView().getModel("i18n").getResourceBundle();

//				utils.makeSerachHelpHeader(this);

				this.getLoginInfo();
				this.set_userData();  //"User Auth"

			}
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		onAfterRendering: function() {
//			if(!this.first_time){ 
//			this.oOrderPage = this.getView().byId("order");

//			if(this.param_mode === "C"){
//			this.oOrderPage.setTitle(this.i18n.getText("title_create_wo"));
//			}else if(this.param_mode === "U"){
//			this.oOrderPage.setTitle(this.i18n.getText("title_change_wo"));
//			}else if(this.param_mode === "D"){
//			this.oOrderPage.setTitle(this.i18n.getText("title_display_wo"));
//			}
//			this.first_time = "X";
//			}
		},

		set_screen_mode : function(){
			var oView = this.getView();

			oView.setModel(new JSONModel({
				mode : true,
				matmode : true,
				isvisible : true,
				oper_isvisible : true,
				oper_isvisible_del : true,
				isExternal : true,
				visibleExt : true,
				bomEnable : true,
				changeMode : true,
				iswbsvisible : true,
				notibtn : true,
				print : true,
				assgin : true,
				approvereject : true,
				proposal : true,
				workResult : true,
				complete : true,
				clear : true,
				createpo : true,
				createinfo : true,
				save : true,
				pm04layout : true,
				expamount : true,
				fileUpload : true,
				fileDelete : true,
				fileAttach : true,
				auartEditable : false,
				matSpVisible : false,
				expamountRequired : true
			}), "screenMode");
		},


		set_displayMode : function(mode, gi_stat){
			debugger;
			var screenModel = this.getView().getModel("screenMode");
			var screenData = screenModel.getData();

			if(mode === "X"){
				screenData.mode = false;
				screenData.matmode = false;
				screenData.isvisible = false;
				screenData.oper_isvisible = false;
				screenData.oper_isvisible_del = false,
				screenData.isExternal = false;
				screenData.visibleExt = false;
				screenData.bomEnable = false;
				screenData.changeMode = false;
				screenData.iswbsvisible = false;
				screenData.notibtn = false;
				screenData.print = false;
				screenData.assgin = false;
				screenData.approvereject = false;
				screenData.proposal = false;
				screenData.workResult = false;
				screenData.complete = false;
				screenData.clear = false;
				screenData.createpo = false;
				screenData.createinfo = false;
				screenData.save = false;
				screenData.pm04layout = true;
				screenData.expamount = false;
				screenData.fileUpload = false;
				screenData.fileDelete = false;
				screenData.fileAttach = false;
			}else{
				if(this.param_mode === "D"){
					screenData.mode = false;
					screenData.matmode = false;
					screenData.isvisible = false;
					screenData.oper_isvisible = false;
					screenData.oper_isvisible_del = false;
					screenData.isExternal = false;
					screenData.visibleExt = false;
					screenData.bomEnable = false;
					screenData.changeMode = false;
					screenData.iswbsvisible = false;
					screenData.notibtn = false;
					screenData.print = false;
					screenData.assgin = false;
					screenData.approvereject = false;
					screenData.proposal = false;
					screenData.workResult = true;
					screenData.complete = false;
					screenData.clear = false;
					screenData.createpo = false;
					screenData.createinfo = false;
					screenData.save = false;
					screenData.pm04layout = true;
					screenData.expamount = false;
					screenData.fileUpload = false;
					screenData.fileDelete = false;
					screenData.fileAttach = false;

					this.oOrderPage.setTitle(this.i18n.getText("title_display_wo"));

				}else if(this.param_mode === "C"){

					screenData.mode = true;
					screenData.matmode = true;
					screenData.isvisible = true;
					screenData.oper_isvisible = false;
					screenData.oper_isvisible_del = true,
					screenData.isExternal = false;
					screenData.visibleExt = false;
					screenData.bomEnable = false;
					screenData.changeMode = true;
					screenData.iswbsvisible = false;
					screenData.notibtn = false;
					screenData.print = false;
					screenData.assgin = false;
					screenData.approvereject = false;
					screenData.proposal = false;
					screenData.workResult = true;
					screenData.complete = false;
					screenData.clear = true;
					screenData.createpo = false;
					screenData.createinfo = false;
					screenData.save = true;
					screenData.pm04layout = true;
					screenData.expamount = true;
					screenData.fileUpload = true;
					screenData.fileDelete = true;
					screenData.fileAttach = false;
				}else if(this.param_mode === "U"){

					screenData.mode = true;

					if(gi_stat == "G"){ //제어 20230725
						screenData.matmode = false;  
						screenData.isvisible = false;
					}else{
						screenData.matmode = true;  
						screenData.isvisible = true;
					}

					screenData.oper_isvisible = false;
					screenData.oper_isvisible_del = true;
					screenData.isExternal = false;
					screenData.visibleExt = false;
					screenData.bomEnable = false;
					screenData.changeMode = false;
					screenData.iswbsvisible = false;
					screenData.notibtn = false;
					screenData.print = false;
					screenData.assgin = false;
					screenData.approvereject = false;
					screenData.proposal = false;
					screenData.workResult = true;
					screenData.complete = false;
					screenData.clear = false;
					screenData.createpo = false;
					screenData.createinfo = false;
					screenData.save = true;
					screenData.pm04layout = true;
					screenData.expamount =  true ;
					screenData.fileUpload = true;
					screenData.fileDelete = true;
					screenData.fileAttach = true;

					this.oOrderPage.setTitle(this.i18n.getText("title_change_wo"));
				}
			}

			// Order type 이 PM04 일때만 WBS가 보여져야 함 
			var v_auart = this.getView().byId("auart").getSelectedKey();

			//Maint. Construction (오더 타입)
			if(v_auart === "PM04"){  
				screenData.iswbsvisible = true;
				screenData.pm04layout = false;
				screenData.visibleExt = false;
				screenData.oper_isvisible = false;
				screenData.oper_isvisible_del = false;
			}else{
				screenData.iswbsvisible = false;
			}


			//Order번호가 없으면 신규생성화면이므로 오더유형 변경가능. 
			var v_aufnr = this.getView().byId("aufnr").getValue();
			if(v_aufnr){
				screenData.auartEditable = false;
			}else{ 
				screenData.auartEditable = true;
			}

			screenModel.refresh();
		},


		change_display : function(){
			var Model = this.getView().getModel("ReadOrder");
			var oData = Model.getData();

			var screenModel = this.getView().getModel("screenMode");
			var screenData = screenModel.getData();

			var v_auart = this.getView().byId("auart").getSelectedKey();

			//2019.01.19 Material Stock / Purchase 구분 필드 제어를 위한 로직 추가
			var s_spflag;
			var s_swerk = this.oSwerk.getSelectedKey();
			for(var j=0; j<this.arr_swerk.length; j++){
				if(this.arr_swerk[j].Value == s_swerk){
					s_spflag = this.arr_swerk[j].Add9;
					break;
				}
			}
			
			if(s_swerk.slice(0,1) == "5"){
				sap.ui.getCore().getConfiguration().setFormatLocale("pt_BR");	
			}else{
				sap.ui.getCore().getConfiguration().setFormatLocale("en_US");	
			}
			  
			 			

			if(s_spflag){
				screenData.matSpVisible = true;
				screenData.expamountRequired = false;
			}
			//2019.01.19 Material Stock / Purchase 구분 필드 제어를 위한 로직 추가

			//Maint. Construction (오더 타입)
			if(v_auart === "PM04"){  
				screenData.iswbsvisible = true;
				screenData.pm04layout = false;
				screenData.visibleExt = false;
				screenData.oper_isvisible = false;
				screenData.oper_isvisible_del = false;
			}else{
				screenData.iswbsvisible = false;
			}

			//Preventive Order(PM02) - User Status 가 존재 하지 않음 
			if(v_auart === "PM02"){  
				screenData.print = true;
				screenData.assgin = true;
				screenData.workResult = true;
				screenData.complete = true;
			}

			//Equipment 의 Bom 정보 가져오는 Button 제어 
			if(this.param_mode === "U" || ( this.param_qmnum && this.param_mode === "C")){
				if(oData.IsBom){
					screenData.bomEnable = true;
				}else{
					screenData.bomEnable = false;
				}
			}else if(this.param_mode === "D"){
				screenData.bomEnable = false;
			}

			if(oData.UserStatus == "ORS1"){

				screenData.print = false;

				if(this.getView().byId("aufnr").getValue()){
					screenData.assgin = true;
					screenData.fileAttach = true;
				}else{
					screenData.assgin = false;
					screenData.fileAttach = false;
				}

				screenData.createpo = false;
				screenData.approvereject = false;

				if(this.param_mode === "C"){
					screenData.proposal = false;
					screenData.workResult = false;
					screenData.complete = false;
				}else{
					screenData.proposal = true;
					screenData.workResult = true;
					screenData.complete = true;
				}

			}else if(oData.UserStatus == "ORS2"){

				screenData.print = false;
				screenData.assgin = true;

				if(oData.Zpmaprv && 
						(oData.ApproStatus == "P" || oData.ApproStatus == "A" || oData.ApproStatus == "R")){    // 전자결재 상신 일경우
					//screenData.approvereject = false;
					this.param_mode = "D";
				}else{
					screenData.approvereject = true;
				}

				screenData.proposal = false;
				screenData.workResult = false;
				screenData.complete = false;
				screenData.createpo = false;

			}else if(oData.UserStatus == "ORS3" && oData.SysStatus == "REL" ){

				screenData.print = true;
				screenData.assgin = true;
				screenData.approvereject = false;
				screenData.proposal = false;
				screenData.workResult = true;
				screenData.complete = true;   //20170831 변경 
				screenData.expamount = false;

				if(!this.getView().byId("po").getValue() && s_spflag != "X" ){
					screenData.createpo = true;
				}else{
					screenData.createpo = false;
					screenData.isExternal = false;
				}

			}else if(oData.UserStatus == "ORS3" &&  oData.SysStatus == "CNF" ){

				screenData.print = true;
				screenData.assgin = false;
				screenData.approvereject = false;
				screenData.proposal = false;
				screenData.workResult = true;
				screenData.complete = true;    //20170831변경
				screenData.expamount = false;

				if(!this.getView().byId("po").getValue() && s_spflag != "X"){
					screenData.createpo = true;
				}else{
					screenData.createpo = false;
					screenData.isExternal = false;
				}

			}else if(oData.UserStatus == "ORS4" || 
					oData.UserStatus == "ORS3" && oData.SysStatus == "TECO" ){

				this.param_mode = "D";
				this.set_displayMode("D");
				this.changeScreen_External();
			}

			if(oData.SysStatus == "TECO" || oData.SysStatus == "CLSD" || this.param_mode === "D"){
				this.param_mode = "D";
				this.set_displayMode("D");

				// Display Mode 에서도 출력 버튼 활성화 요청 반영
				if(this.param_mode === "D" && ((oData.UserStatus == "ORS3" && oData.SysStatus == "REL" ) 
						|| (oData.UserStatus == "ORS3" &&  oData.SysStatus == "CNF" ))){
					screenData.print = true;
				}            

				this.changeScreen_External();

				screenData.fileUpload = false;
				screenData.fileDelete = false;
			}    

			if(this.getView().byId("po").getValue()){
				screenData.createinfo = true;
				screenData.createpo = false;
				screenData.isExternal = false;
			}

			//notification 번호가 있으면 'Detail' 버튼 활성화 
			var v_noti = this.getView().byId("noti").getValue();
			if(v_noti){
				screenData.notibtn = true;
			}else{
				screenData.notibtn = false;
			}

			//Order번호가 없으면 신규생성화면이므로 오더유형 변경가능. 
			var v_aufnr = this.getView().byId("aufnr").getValue();
			if(v_aufnr){
				screenData.auartEditable = false;
			}else{ 
				screenData.auartEditable = true;
			}

			screenModel.refresh();

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
										"Add2" : oData.results[i].Add2,
										"Add3" : oData.results[i].Add3,
										"Add4" : oData.results[i].Add4,
										"Add9" : oData.results[i].Add9,
									}
							);
						}

						controll.set_UserInfo(userDefault);

						this.i18n = this.getView().getModel("i18n").getResourceBundle();
						utils.makeSerachHelpHeader(this);

						/*             if(!controll.set_auth()){
               return;
             };*/

						if(!this.first_time){ 
							this.oOrderPage = this.getView().byId("order");

							if(this.param_mode === "C"){
								this.oOrderPage.setTitle(this.i18n.getText("title_create_wo"));
							}else if(this.param_mode === "U"){
								this.oOrderPage.setTitle(this.i18n.getText("title_change_wo"));
							}else if(this.param_mode === "D"){
								this.oOrderPage.setTitle(this.i18n.getText("title_display_wo"));
							}
							this.first_time = "X";
						}

						controll.set_auth()
						controll.set_auth_screen();

						controll.setInitData();

						//controll.set_aa();

						if(this.param_mode == "C"){
							controll._getDialog_init();
						}else{
							controll._set_search_field();
							controll.get_order_data();
						}

						//controll._set_search_field();  // set Search Help
					}.bind(this),
					error : function(oError) {
						jQuery.sap.log.info("Odata Error occured");
						Toast.show("Error");
					}.bind(this)
			};
			oModel.read(path, mParameters);
		},


		set_aa : function(){
			if(this.param_mode == "C"){
				this._getDialog_init();
			}else{
				this._set_search_field();
				this.get_order_data();
			}
		},

		/*
		 * User Default Setting 
		 */
		set_auth : function(){
			this.arr_swerk = this.get_Auth("SWERK");
			this.arr_kostl = this.get_Auth("KOSTL");
			this.arr_kokrs = this.get_Auth("KOKRS");

			//work center 체크하지 않기로 함 (2017.07.13)
			/*        if(this.get_Auth("ARBPL").length == 0){
          sap.m.MessageBox.show(
              this.i18n.getText("check_auth_woc"),
              sap.m.MessageBox.Icon.ERROR,
              this.i18n.getText("error")
          );
          return false;
        }else{
          this.default_woc = this.get_Auth("ARBPL")[0].Value; 
        }*/

			this.locDate    = this.get_Auth("LOCDAT")[0].Value;
			this.locTime    = this.get_Auth("LOCTIM")[0].Value;
			this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
			this.sep        = this.get_Auth("SEP")[0].Value;
			this.zpm_role   = this.get_Auth("ZPM_ROLE");

			//return true;
		},

		// 화면 권한 가져오기 
		set_auth_screen : function(){

			var oModel = this.getView().getModel("auth");

			var controll = this;
			var s_filter = [];  

			var s_zpm_role = []; //권한 
			var s_zprogram = []; //프로그램 
			var s_swerk = []; //swerk

			oModel.attachRequestSent( function(){ controll.oOrderPage.setBusy(true);});
			oModel.attachRequestCompleted( function(){ controll.oOrderPage.setBusy(false);});

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
			s_zprogram.push("ZPM_UI_0110");
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
							this.obj_ctrl[t].UiID == s_ctrl[i].UiID  ){
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
				}else{
					//   this.set_auth_screen_ctrl();
				}
			}
		},

		set_auth_screen_ctrl : function(){

			if(this.param_mode != "D"){
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
			}
		},

		/*
		 * Plan Date Default Setting 
		 */
		setInitData : function(){
			var createon = this.getView().byId("createon");
			var basic_from = this.getView().byId("basic_from");
			var basic_to = this.getView().byId("basic_to");

			createon.setDisplayFormat(this.dateFormat);
			createon.setValueFormat("yyyyMMdd");

			basic_from.setDisplayFormat(this.dateFormat);
			basic_from.setValueFormat("yyyyMMdd");

			basic_to.setDisplayFormat(this.dateFormat);
			basic_to.setValueFormat("yyyyMMdd");

			this.oSwerk = this.getView().byId("swerk");
			//this.oWerks = this.getView().byId("werks");

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

			if(this.param_swerk){
				this.oSwerk.setSelectedKey(this.param_swerk);
			}

			if(this.param_mode === "C" && !this.param_qmnum){  //Noti번호로 통한 Orde 생성하지 않을때 사용 
				// 최초생성 시에는 모델이 존재 하지 않기 때문에 모델을 만들어 주기 위함(주의 - 기본 데이터이외에는 데이터를  넣지 않도로 한다 )
				this.get_order_data_create_init(); 
			}

			this.getView().byId("table_file").setVisibleRowCount(1);
		},


		setInitData_init : function(){
			var basic_from_init = sap.ui.getCore().byId("basic_from_init");
			var basic_to_init = sap.ui.getCore().byId("basic_to_init");

			basic_from_init.setDisplayFormat(this.dateFormat);
			basic_from_init.setValueFormat("yyyyMMdd");

			basic_to_init.setDisplayFormat(this.dateFormat);
			basic_to_init.setValueFormat("yyyyMMdd");

			this.oSwerk_init = sap.ui.getCore().byId("swerk_init");

			var default_swerk;
			if(!this.oSwerk_init.getSelectedItem()){

				for(var j=0; j<this.arr_swerk.length; j++){                 
					var template_i = new sap.ui.core.Item();
					template_i.setKey(this.arr_swerk[j].Value);
					template_i.setText(this.arr_swerk[j].KeyName);
					this.oSwerk_init.addItem(template_i);

					if(this.arr_swerk[j].Default === "X"){
						default_swerk = j;
					}
				}
				this.oSwerk_init.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
			}else{
				this.oSwerk_init.setSelectedKey(this.oSwerk_init.getSelectedItem().getProperty("key"));
			}

			if(this.param_swerk){
				this.oSwerk_init.setSelectedKey(this.param_swerk);
				this.oSwerk_init.setEnabled(false);
			}
		},


		set_noti_info : function(oData){
			if(this.param_qmnum && oData){
				/*//          var fl_init = sap.ui.getCore().byId("fl_init").setValue(oData.Tplnr);
//          var fl_init_tx = sap.ui.getCore().byId("fl_init_tx").setText(oData.Pltxt);
//          var equnr_init = sap.ui.getCore().byId("equnr_init").setValue(oData.Equnr);
//            var equnr_init_tx =  sap.ui.getCore().byId("equnr_init_tx").setText(oData.Eqktx);
//            var hdDesc_init = sap.ui.getCore().byId("hdDesc_init").setValue(oData.ShortTx);
				 */          sap.ui.getCore().byId("fl_init").setValue(oData.Tplnr);
				 sap.ui.getCore().byId("fl_init_tx").setText(oData.Pltxt);
				 sap.ui.getCore().byId("equnr_init").setValue(oData.Equnr);
				 sap.ui.getCore().byId("equnr_init_tx").setText(oData.Eqktx);
				 sap.ui.getCore().byId("hdDesc_init").setValue(oData.ShortTx);
				 sap.ui.getCore().byId("woc_init").setSelectedKey(oData.Vaplz);
				 sap.ui.getCore().byId("asm_init").setValue(oData.Bautl);
				 sap.ui.getCore().byId("asm_init_tx").setText(oData.Bautx);

			}
		},


		get_order_data_create_init : function(){

			var oView = this.getView();
			var oData = {};
			var external = {};

			oData.Swerk = this.oSwerk.getSelectedKey();
			oData.Iwerk = this.oSwerk.getSelectedKey();

			if(window.location.hostname != "localhost"){
				oData.Ernam = this.getLoginId();  //this.getLoginInfo().getFullName();
			}else{
				oData.Ernam = "홍길동";
			}

			oData.Erdat = this.locDate;
			oData.isBom = false;
			oData.SysStatus = "CRTD" ;
			oData.UserStatus = "ORS1" ;
			oData.SysStatusTx = this.i18n.getText("sys_status_init");
			oData.UserStatusTx = this.i18n.getText("user_status_init");

			external.Mgvrg = "";
			external.Meinh = "";
			external.Waers = "";

			oData.External = external;

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData(oData);

			oView.setModel(oODataJSONModel, "ReadOrder");
		},


		get_order_data : function(){
			var lange = this.getLanguage();

			var oView = this.getView();
			var oModel = this.getView().getModel();
			var controll = this;

			var oDisplayModel =  new sap.ui.model.json.JSONModel();  

			var oTable_oper = this.getView().byId("table_operation");
			var oTable_mat = this.getView().byId("table_material");
			var oTable_cost = this.getView().byId("table_cost");

			oModel.attachRequestSent( function(){ controll.oOrderPage.setBusy(true);});
			oModel.attachRequestCompleted( function(){ controll.oOrderPage.setBusy(false);});

			var l_qmnum = "";
			var mode = this.param_mode;
			if(this.param_mode === 'U'){
				mode = "R";
			}else if(this.param_mode === 'C' && this.param_qmnum ){  // Notification 정보로 order를 생성 한다 .
				mode = "R";
				l_qmnum = this.param_qmnum;
			}

			var path = "/HdSet(Mode='"+mode+"',Spras='"+lange+"',Aufnr='"+this.param_order+"')";

			var mParameters = {
					urlParameters : {
						"$expand" : "HdCost,HdMaterial,HdOperation,HdReturn",
						"$filter" : "Qmnum eq '"+l_qmnum+"'"
					},
					success : function(oData) {
						debugger;
						if(this.param_mode == "U"){
							this.timestamp = oData.Timestamp;
						}

						controll.oSwerk.setSelectedKey(oData.Swerk);

						if(this.param_mode === "U"){
							if(oData.Iphas === "0" || oData.Iphas === "1" || oData.Iphas === "2" ){
							}else{
								this.param_mode = "D";
							}
						}

						var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel.setData(oData);

						oView.setModel(oODataJSONModel, "ReadOrder")

						var oODataJSONModel_oper =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel_oper.setData(oData.HdOperation);
						oTable_oper.setModel(oODataJSONModel_oper);
						oTable_oper.bindRows("/results");

						this.old_operationlist = oData.HdOperation;

						var oODataJSONModel_mat =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel_mat.setData(oData.HdMaterial);          
						oTable_mat.setModel(oODataJSONModel_mat);
						oTable_mat.bindRows("/results");

						var oODataJSONModel_cost =  new sap.ui.model.json.JSONModel();  
						oODataJSONModel_cost.setData(oData.HdCost);             
						oTable_cost.setModel(oODataJSONModel_cost);
						oTable_cost.bindRows("/results");

						if(oData.Mode == "G"){ //자재예약 goods reservation 상신이후라면 zmmt1280
							controll.set_displayMode(null, "G"); 
						}else{
							controll.set_displayMode();
						}

						if(this.param_mode === "C"){  // Notification 정보를 기준으로 생성할때 
							controll.set_noti_info(oData);
						}else{
							//controll._set_search_field();
							controll.changeScreen_External(null, oData.Mode);

							controll._set_search_field_after();  // 
							controll.set_table_work_ctr();

							controll.get_attach_file();
							controll.change_display();
							controll.operationBtn_ctl();
						}
						controll.set_auth_screen_ctrl();

					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
					}.bind(this)
			};
			oModel.read(path, mParameters);
		},


		set_search_selected_data : function(Obj,selection,selRow,err){

			var obj_name = Obj.substr(0,3);

			if(Obj == "coc"){
				this.getView().byId("coc").setValue(selection.getKey());
				this.getView().byId("cocTx").setText(selection.getText());
			}

//			if(Obj == "woc"){
//			this.getView().byId("woc").setValue(selection.getKey());
//			this.getView().byId("wocTx").setText(selection.getText());
//			}

			if(Obj == "wbs"){
				this.getView().byId("wbs").setValue(selection.getKey());
				this.getView().byId("wbsTx").setText(selection.getText());
			}

			if(Obj == "stl" || obj_name == "stl" ){
				var oTable_mat = this.getView().byId("table_material");

				if(err){

					oTable_mat.getModel().getData().results[this.material_rowIdx].SlocErr = "Error";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Lgobe = "";

				}else{

					oTable_mat.getModel().getData().results[this.material_rowIdx].Lgort = selection.getKey();
					oTable_mat.getModel().getData().results[this.material_rowIdx].Lgobe = selection.getText();
					oTable_mat.getModel().getData().results[this.material_rowIdx].SlocErr = "None";
				}

				oTable_mat.getModel().refresh();
				this.material_rowIdx = "";
			}

			if(Obj == "mat" || obj_name == "mat" ){
				var oTable_mat = this.getView().byId("table_material");

				if(err){

					if(oTable_mat.getModel().getData().results[this.material_rowIdx].Matnr){
						oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "Error";
					}else{
						oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "None";
					}
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Lgort = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Lgobe = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Bdmng = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Spflag = "";
					oTable_mat.getModel().getData().results[this.material_rowIdx].Charg = "";

				}else{
					oTable_mat.getModel().getData().results[this.material_rowIdx].Matnr = selection.getKey();
					oTable_mat.getModel().getData().results[this.material_rowIdx].Maktx = selection.getText();

					if(selRow){ // Enter Event 발생 시 
						oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = selRow.Add2;
						oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "None";
						if(selRow.Add1 == "ERSA"){
							oTable_mat.getModel().getData().results[this.material_rowIdx].ChargMode = true;
						}else{
							oTable_mat.getModel().getData().results[this.material_rowIdx].ChargMode = false;
						}
					}else{    // Search Help 사용 시 
						var oMat_data = this.oMat.getModel().getData().results;
						for(var i=0; i<oMat_data.length; i++){
							if(selection.getKey() == oMat_data[i].Key){
								oTable_mat.getModel().getData().results[this.material_rowIdx].Meins = oMat_data[i].Add2;
								oTable_mat.getModel().getData().results[this.material_rowIdx].MatErr = "None";
								if(oMat_data[i].Add1 == "ERSA"){
									oTable_mat.getModel().getData().results[this.material_rowIdx].ChargMode = true;
								}else{
									oTable_mat.getModel().getData().results[this.material_rowIdx].ChargMode = false;
								}
								break;
							}
						}
					}
				}
				oTable_mat.getModel().refresh();
				this.material_rowIdx = "";
			}

			if(Obj == "lfa"){
				// var oLfa_data = this.oLfa.getModel().getData().results;

				if(err){
					this.getView().byId("lfa").setValueState("Error");
					this.getView().byId("lfaTx").setText(""); 

				}else{

					/*            if(selRow){
              this.VendorCurrency = selRow.Add3;
            }else{
              for(var i=0; i<oLfa_data.length; i++){
                if(selection.getKey() == oLfa_data[i].Key){
                  this.VendorCurrency = oLfa_data[i].Add3;
                  break;
                }
              }
            }*/
					this.getView().byId("lfa").setValue(selection.getKey());
					this.getView().byId("lfa").setValueState("None");
					this.getView().byId("lfaTx").setText(selection.getText());
				}
			}

			if(Obj == "rev"){
				if(err){
					this.getView().byId("rev").setValueState("Error");
					this.getView().byId("revTx").setText("");
				}else{
					this.getView().byId("rev").setValueState("None");
					this.getView().byId("rev").setValue(selection.getKey());
					this.getView().byId("revTx").setText(selection.getText());
				}
			}

			if(Obj == "asm_init"){
				if(err){
					sap.ui.getCore().byId("asm_init").setValueState("Error");
					sap.ui.getCore().byId("asm_init_tx").setText("");
				}else{
					sap.ui.getCore().byId("asm_init").setValueState("None");
					sap.ui.getCore().byId("asm_init").setValue(selection.getKey());
					sap.ui.getCore().byId("asm_init_tx").setText(selection.getText());
				}
			}

			if(Obj == "asm"){
				if(err){
					this.getView().byId("asm").setValueState("Error");
					this.getView().byId("asmTx").setText("");
				}else{
					this.getView().byId("asm").setValueState("None");
					this.getView().byId("asm").setValue(selection.getKey());
					this.getView().byId("asmTx").setText(selection.getText());
				}
			}
		},

		//operation Work Center select box item을 채운다.
		set_table_work_ctr : function(woc_model, Obj){

			/*        if(Obj){
          if(this.param_mode == "C" && this.param_woc){
            if(Obj.getId() === "woc"){
              sap.ui.getCore().byId("woc").setSelectedKey(this.param_woc);
            }
          }
        }*/

			if(this.oWoc){
				if(!this.oWoc.getSelectedKey() && this.param_mode == "C"){
					this.oWoc.setSelectedKey(this.init_woc);
				}
			}

			var oTable_oper_model = this.getView().byId("table_operation").getModel();

			var oData =  oTable_oper_model.getData();

			if(!oData){
				return;
			}

			var table_woc = [];

			if(woc_model){  // Utils.js에서 호출 함 
				for(var i=0; i<woc_model.oData.results.length; i++){
					table_woc.push({
						Key: woc_model.oData.results[i].Key, 
						KeyName: woc_model.oData.results[i].KeyName
					});
				}
			}else{
				var woc_data; 
//				if(this.param_mode === "C"){
//				woc_data = this.oWoc_init.getItems();
//				}else{
//				woc_data = this.oWoc.getItems();
//				}
				woc_data = this.oWoc.getItems();
				for(var i=0; i<woc_data.length; i++){
					table_woc.push({
						Key: woc_data[i].getKey(), 
						KeyName: woc_data[i].getText()
					});
				}
			}

			for (var i=0; i<oData.results.length; i++) {
				oData.results[i].Items = [];
				oData.results[i].Items = table_woc;
			}

			oTable_oper_model.refresh(true);
		},


		changeScreen_External : function(steus, gi_stat){

			var tableModel = this.getView().byId("table_operation").getModel();
			var screenModel = this.getView().getModel("screenMode");

			var oData = tableModel.getData();

			var edit_mode;
			var visible;
			var chk;

			for(var i=0;i<oData.results.length;i++){

				if(oData.results[i].Steus === "PM03"){
					edit_mode = true;
					visible = true;
					chk = "X";
					break;
				}else{
					visible = false;
					edit_mode = false;
					chk = "";
				}
			}

			if(edit_mode == false && steus === "PM03"){
				edit_mode = true;
				visible = true;
				chk = "X";
			}

			if(oData.results.length === 0){
				edit_mode = false;    
				visible = false;
				chk = "";
			}

			// external 없으면 External 필드의 모든 값을 지운다.
			if(edit_mode == false && !chk){
				var ext_model = this.getView().getModel("ReadOrder");
				var data = ext_model.getData();
				data.External = {};
				ext_model.refresh();    
			}

			var v_pr = this.getView().byId("pr").getValue();
			if(v_pr && this.param_mode != "D"){
				screenModel.getData().createpo = edit_mode;
			}else{
				screenModel.getData().createpo = false;
			}

			var v_po = this.getView().byId("po").getValue();
			if(v_po){
				screenModel.getData().createinfo = true;
				screenModel.getData().createpo = false;
				edit_mode = false;
			}

			if(this.param_mode === "D"){
				edit_mode = false;
			}

			screenModel.getData().isExternal = edit_mode;
			screenModel.getData().visibleExt = visible;

			if(chk == "X"){
				this.isExternal = true;   // External 있는지 없는지 확인 해야 함 
			}else{
				this.isExternal = false; 
			}

			// internal이 있는 경우에만  Material을 입력 할 수 있다. 
			if(this.param_mode != "D"){
				var chk_pm01 = "";

				for(var i=0;i<oData.results.length;i++){
					if(oData.results[i].Steus === "PM01"){
						chk_pm01 = "X";
						break;
					}else{
						chk_pm01 = "";
					}
				}

				if(chk_pm01){
					if(gi_stat == "G"){
						screenModel.getData().isvisible = false;
					}else{
						screenModel.getData().isvisible = true;
					}
				}else{
					if(gi_stat == "G"){
						screenModel.getData().isvisible = false;
					}else{
						// 2018.12.01 => External (외부작업) 작업항목만 존재하는 경우 유지보수 작업용 자재를 할당할 수 있는 버튼이
						// 활성화 되지 않아 필요한 자재를 할당할 수 없습니다.확인 및 수정을 부탁 드립니다.
						screenModel.getData().isvisible = true;
//					screenModel.getData().isvisible = false;
//					this.delete_material();
					}
				}
			}
			screenModel.refresh();
		},


		setInitData_confirm : function(){
			this.getView().byId("auart").setSelectedKey(sap.ui.getCore().byId("auart_init").getSelectedKey());
			this.getView().byId("hdDesc").setValue(sap.ui.getCore().byId("hdDesc_init").getValue());
			this.getView().byId("basic_from").setDateValue(sap.ui.getCore().byId("basic_from_init").getDateValue());
			this.getView().byId("basic_to").setDateValue(sap.ui.getCore().byId("basic_to_init").getDateValue());
			this.getView().byId("woc").setSelectedKey(sap.ui.getCore().byId("woc_init").getSelectedKey());

			this.getView().byId("asm").setValue(sap.ui.getCore().byId("asm_init").getValue());
			this.getView().byId("asmTx").setText(sap.ui.getCore().byId("asm_init_tx").getText());
			//this.getView().byId("wocTx").setText(sap.ui.getCore().byId("woc_init").getValue());

//			if(!this.getView().byId("woc").getSelectedKey()){
//			this.getView().byId("woc").setSelectedKey(this.default_woc);
//			}
			this.init_woc = sap.ui.getCore().byId("woc_init").getSelectedKey();

			this.getView().byId("fl_init")

			if (window.location.hostname != "localhost") {
				//this.getView().byId("createBy").setValue(this.getLoginInfo().getFullName());
				this.getView().byId("createBy").setValue(this.getLoginId());
			}else{
				this.getView().byId("createBy").setValue("홍길동");
			}

//			var fromDate = this.formatter.strToDate(this.locDate);
//			this.getView().byId("createon").setDateValue( fromDate );
			this.getView().byId("createon").setValue( this.locDate );

//			this.getView().byId("sysstatus").setValue(this.i18n.getText("sys_status_init"));
//			this.getView().byId("userstatus").setValue(this.i18n.getText("user_status_init"));

		},

		//set_equnr_info : function(list, chk, isbom, objName){
		set_equnr_info : function(list, chk, objName){
			this.equip_selrow = [];

			var screenModel = this.getView().getModel("screenMode");

			var oModel = this.getView().getModel("ReadOrder");
			var oData = oModel.getData();

			if(chk === "E"){

				if(objName === "equnr_init"){
					sap.ui.getCore().byId("equnr_init").setValueState("Error");
					sap.ui.getCore().byId("equnr_init_tx").setText("");
					sap.ui.getCore().byId("fl_init").setValue("");
					sap.ui.getCore().byId("fl_init_tx").setText("");
					//this.getView().byId("equnr").setValue("");
				}else{
					this.getView().byId("equnr").setValueState("Error");
				}
				this.getView().byId("equnrTx").setText("");
				this.getView().byId("tplnr").setValue("");
				this.getView().byId("tplnrTx").setText("");
				this.getView().byId("invnr").setValue("");
				screenModel.getData().bomEnable = false;
				oData.IsBom = false;

			}else{

				if(objName === "equnr_init"){
					sap.ui.getCore().byId("equnr_init").setValueState("None");
					sap.ui.getCore().byId("equnr_init_tx").setText(list.KeyEqList.results[0].EQKTX);
					sap.ui.getCore().byId("fl_init").setValue(list.KeyEqList.results[0].TPLNR);
					sap.ui.getCore().byId("fl_init_tx").setText(list.KeyEqList.results[0].PLTXT);
					this.getView().byId("equnr").setValue(list.KeyEqList.results[0].EQUNR);
				}else{
					this.getView().byId("equnr").setValueState("None");
				}

				this.equip_selrow.push(list.KeyEqList.results[0]);

				this.getView().byId("equnrTx").setText(list.KeyEqList.results[0].EQKTX);
				this.getView().byId("invnr").setValue(list.KeyEqList.results[0].INVNR);
				this.getView().byId("tplnr").setValue(list.KeyEqList.results[0].TPLNR);
				this.getView().byId("tplnrTx").setText(list.KeyEqList.results[0].PLTXT);

				this.getView().byId("woc").setSelectedKey(list.KeyEqList.results[0].ARBPL);
				this.getView().byId("plg").setSelectedKey(list.KeyEqList.results[0].INGRP);
				this.getView().byId("coc").setValue(list.KeyEqList.results[0].KOSTL);
				this.getView().byId("cocTx").setText(list.KeyEqList.results[0].KOSTL_TXT);

				if(list.KeyEqList.results[0].ISBOM){
					screenModel.getData().bomEnable = true;
					oData.IsBom = true;
				}else{
					screenModel.getData().bomEnable = false;
					oData.IsBom = false;
				}
			}
			screenModel.refresh();
		},


		set_tplnr_info : function(list, chk){
			this.equip_selrow = [];

			if(chk === "E"){
				sap.ui.getCore().byId("fl_init").setValueState("Error");
				//sap.ui.getCore().byId("fl_init").setValue("");
				sap.ui.getCore().byId("fl_init_tx").setText("");

				this.getView().byId("tplnr").setValue("");
				this.getView().byId("tplnrTx").setText("");
			}else{
				this.equip_selrow.push(list);

				sap.ui.getCore().byId("fl_init").setValueState("None");
				sap.ui.getCore().byId("fl_init").setValue(list.Id);
				sap.ui.getCore().byId("fl_init_tx").setText(list.Name);

				this.getView().byId("tplnr").setValue(list.Id);
				this.getView().byId("tplnrTx").setText(list.Name);
			}
		},


		checkMandatory : function(){
			var cnt = 0;

			var oTable_oper = this.getView().byId("table_operation");
			var oper_data = oTable_oper.getModel().getData().results;
			if(oper_data.length == 0){
				sap.m.MessageBox.show(
						this.i18n.getText("isoperation"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false; 
			}else{
				var chk_oper = 0;
				for(var i=0; i<oper_data.length; i++){
					if(oper_data[i].Steus){
						chk_oper = chk_oper + 1;
					}
				}
				if(chk_oper == 0){
					sap.m.MessageBox.show(
							this.i18n.getText("isoperation"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);
					return false;
				}
			}

			var v_auart = this.getView().byId("auart").getSelectedKey();
			if(v_auart == "PM04"){
				var wbs = this.getView().byId("wbs");
				if(!wbs.getValue()){
					wbs.setValueState("Error");
					sap.m.MessageBox.show(
							this.i18n.getText("check_mandatory"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);
					return false;  
				}else{
					wbs.setValueState("None");
				}
			}

			var oHddesc = this.getView().byId("hdDesc");

			if(!oHddesc.getValue()){
				oHddesc.setValueState("Error");
				cnt = 0;
			}else{
				oHddesc.setValueState("None");
				cnt = 1;
			}

			if(this.isExternal){   //operation 중 external 존재 하는 지 확인 해야함 
				var ext_err = this.checkMandatory_external();
				if(ext_err){
					cnt = cnt + 1;
				}else{
					cnt = cnt - 1;
				}
			}else{
				cnt = cnt + 1;
			}


			if(cnt == 2){
				return true;
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false; 
			}
		},


		checkMandatory_external : function(){
			var cnt = 0;

			var s_spflag;
			var s_swerk = this.oSwerk.getSelectedKey();
			for(var j=0; j<this.arr_swerk.length; j++){
				if(this.arr_swerk[j].Value == s_swerk){
					s_spflag = this.arr_swerk[j].Add9;
					break;
				}
			}

			var workDesc = this.getView().byId("workDesc");
			if(workDesc.getValue()){
				workDesc.setValueState("None");
				cnt = cnt + 1;
			}else{
				workDesc.setValueState("Error");
				cnt = cnt - 1;
			}

			var porg =  this.getView().byId("puo");
			if(porg.getSelectedKey()){
				porg.setValueState("None");
				cnt = cnt + 1;
			}else{
				porg.setValueState("Error");
				cnt = cnt - 1;
			}

			var pgrp = this.getView().byId("pug");
			if(pgrp.getSelectedKey()){
				pgrp.setValueState("None");
				cnt = cnt + 1;
			}else{
				pgrp.setValueState("Error");
				cnt = cnt - 1;
			}

			if(s_spflag != "X"){
				var lfa = this.getView().byId("lfa");
				if(lfa.getValueState() == "None"){
					if(lfa.getValue()){
						lfa.setValueState("None");
						cnt = cnt + 1;
					}else{
						lfa.setValueState("Error");
						cnt = cnt - 1;
					}
				}

				var amount = this.getView().byId("expamount");
				if(amount.getValueState() == "None"){
					if(amount.getValue() &&
							amount.getValue() != "0.00" &&
							amount.getValue() != "0" ){
						amount.setValueState("None");
						cnt = cnt + 1;
					}else{
						amount.setValueState("Error");
						cnt = cnt - 1;
					}
				}
			}else{
				cnt = cnt + 2;
			}


			if(cnt != 5){
				return false;
			}else{
				return true;
			}
		},


		check_data : function(){
			var cnt = 0;

			var basic_from = this.getView().byId("basic_from").getDateValue();
			var basic_to = this.getView().byId("basic_to").getDateValue();
			if(basic_to && basic_from){
				if(basic_from > basic_to){
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					this.getView().byId("basic_from").setValueState("Error");
					return false;
				}
			}

			//ComboBox data check
			for(var i=0; i<this.chkComboValidation.length; i++){
				if(this.getView().byId(this.chkComboValidation[i]).getValueState() == "Error"){
					cnt = cnt + 1;
				}
			}

			// InputBox check 
			var o_rev = this.getView().byId("rev");
			if(o_rev.getValueState() == "Error"){
				cnt = cnt + 1;
			}
			var o_asm = this.getView().byId("asm");
			if(o_asm.getValueState() == "Error"){
				cnt = cnt + 1;
			}
			var o_lfa = this.getView().byId("lfa");
			if(o_lfa.getValueState() == "Error"){
				cnt = cnt + 1;
			}

			//operation check
			var operData = this.getView().byId("table_operation").getModel().getData().results;
			for(var i=0; i<operData.length; i++){
				if(operData[i].ErrChk1 == "Error" || operData[i].ErrChk2 == "Error"){
					cnt = cnt + 1;
				}
			}

			//Materail check
			if(this.getView().byId("table_material").getModel().getData()){
				var matData = this.getView().byId("table_material").getModel().getData().results;

				//Materail S/P check
				for(var i=0; i<matData.length; i++){
					if(matData[i].Spflag == ""){
						matData[i].SpfgErr == "Error";
					}
				}

				this.getView().byId("table_material").getModel().refresh();

				for(var i=0; i<matData.length; i++){
					if(matData[i].MatErr == "Error" || matData[i].QtyErr == "Error"  
						|| matData[i].SpfgErr == "Error" || matData[i].SlocErr  == "Error" ){
						cnt = cnt + 1;
					}
				}
			}

			if(cnt == 0){
				return true;
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("validation"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);  
				return false;
			}
		},


		checkMandatory_init : function(){

			var oFl = sap.ui.getCore().byId("fl_init");
			var oEqunr = sap.ui.getCore().byId("equnr_init");
			var oAsm = sap.ui.getCore().byId("asm_init");

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
				if(!this.param_qmnum){
					if(!this.equip_selrow){
						sap.m.MessageBox.show(
								this.i18n.getText("err_check_equnrfl_selRow"),
								sap.m.MessageBox.Icon.WARNING,
								this.i18n.getText("error")
						);
						return false;
					}
				}
			}

			var init_from = sap.ui.getCore().byId("basic_from_init").getDateValue();
			var init_to = sap.ui.getCore().byId("basic_to_init").getDateValue();
			if(init_from && init_to){
				if(init_from > init_to){
					sap.m.MessageBox.show(
							this.i18n.getText("err_date"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("error")
					);
					return false;
				}
			}

			var cnt = 0;

			var v_swerk = sap.ui.getCore().byId("swerk_init").getSelectedKey();
			if(v_swerk){
				cnt = cnt + 1;
			}else{
				sap.ui.getCore().byId("swerk_init").setValueState("Error");
			}

			var v_basic_from =  sap.ui.getCore().byId("basic_from_init").getDateValue();
			if(v_basic_from){
				var state = sap.ui.getCore().byId("basic_from_init").getValueState();
				if(state === "None"){
					cnt = cnt + 1;
				}
			}else{
				sap.ui.getCore().byId("basic_from_init").setValueState("Error");
			}

			var v_auart = sap.ui.getCore().byId("auart_init").getSelectedKey();
			if(v_auart){
				cnt = cnt + 1;
			}else{
				sap.ui.getCore().byId("auart_init").setValueState("Error");
			}

			var v_woc = sap.ui.getCore().byId("woc_init").getSelectedKey();
			if(v_woc){
				cnt = cnt + 1;
			}else{
				sap.ui.getCore().byId("woc_init").setValueState("Error");
			}

			var v_desc = sap.ui.getCore().byId("hdDesc_init").getValue();
			if(v_desc){
				cnt = cnt + 1;
			}else{
				sap.ui.getCore().byId("hdDesc_init").setValueState("Error");
			}


			if(cnt == 5){
				return true;
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false;
			}
		},


		createPO : function(){

			var oModel =  this.getView().getModel("ReadOrder");

			var v_vender = this.getView().byId("lfa").getValue();
			var v_pr = this.getView().byId("pr").getValue()
			var v_Rdo_cb = this.getView().byId("cb").getSelected();
			//var v_Rdo_zw = this.getView().byId("zw").getSelected();
			var v_aufnr = this.getView().byId("aufnr").getValue();

			var doctype ;
			if(v_Rdo_cb){
				doctype = "CB";
				//}else if(v_Rdo_zw){
				//    doctype = "ZW";
			}

			var data = {};
			var controll = this;

			data.DocType = doctype;
			data.Vendor = v_vender;
			data.PrNo = v_pr;
			data.Aufnr = v_aufnr;

			var Price = sap.ui.getCore().byId("price_po").getValue();
			if(!Price){
				Price = 0;
			}
//			data.Price = Price.toString().replace(/,/g,"");
			if(sap.ui.getCore().getConfiguration().getFormatLocale() == "pt-BR"){
				data.Price = Price.toString().replace(/\./g,"");
				data.Price = data.Price.toString().replace(/,/g,"\.");					
			}else{
				data.Price = Price.toString().replace(/,/g,"");
			}
			
			data.Waers = sap.ui.getCore().byId("waers_po").getSelectedKey();

			var oPoModel = this.getView().getModel("createpo");
			var lange =  this.getLanguage();

			oPoModel.attachRequestSent( function(){ controll.oOrderPage.setBusy(true);} );
			oPoModel.attachRequestCompleted( function(){controll.oOrderPage.setBusy(false);} );

			var path = "/CreatPoSet";
			var mParameters = {
					success : function(oData) {
						var message = "";
						if(oData.RetType === "E"){
							message = oData.Message;
							sap.m.MessageBox.show(
									message, 
									sap.m.MessageBox.Icon.ERROR,
									this.i18n.getText("error")
							);
						}else{
							message = controll.i18n.getText("create_po", [oData.PoNo]); 

							var dataExternal = oModel.getData().External;
							dataExternal.Ebeln = oData.PoNo;
							dataExternal.Ebelp = "00010";
							dataExternal.Netpr = oData.Price;
							dataExternal.WaersPO = oData.Waers;
							oModel.refresh();

							var screenModel = controll.getView().getModel("screenMode");
							var screenData = screenModel.getData();
							screenData.isExternal = false;
							screenModel.refresh();

//							controll.getView().byId("po").setValue(oData.PoNo);
//							controll.getView().byId("poitem").setValue("00010");

							sap.m.MessageBox.show(
									message, 
									sap.m.MessageBox.Icon.SUCCESS,
									this.i18n.getText("success")
							);
							controll.change_display();
							controll.PoDialog.close();
						};
					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
					}.bind(this)
			}
			oPoModel.create(path, data, mParameters);
		},


		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
//		onExit: function() {
//		},

		/****************************************************************
		 *  Event Handler
		 ****************************************************************/
		onValueHelpRequest : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var s_swerk = this.oSwerk.getSelectedKey();
			var oPage = this.getView().byId("order");

			if(sIdstr === "equnr" || sIdstr === "equnr_init"){
				this.equnrName = sIdstr;
				this.getOwnerComponent().openSearchEqui_Dialog(this, "Single", s_swerk);
			}else if(sIdstr === "tplnr" || sIdstr === "fl" ||  sIdstr === "fl_init"){
				this.flName = sIdstr;
				this.getOwnerComponent().openFuncLocation_Dialog(this, "Single", s_swerk);
			}else if(sIdstr === "wbs"){  // Search Help 클릭시 데이터를 가져 온다. 
				this.oWbs = this.getView().byId("wbs");
				var wbs_sh = utils.get_sh_help("wbs");
				if(this.oWbs){
					if(!wbs_sh){
						utils.set_search_field(s_swerk, this.oWbs, "wbs", "H", "", "", "X", oPage);
					}else{
						utils.openValueHelp(sIdstr);
					}
				}
			}else if(sIdstr === "lfa"){  // Search Help 클릭시 데이터를 가져 온다. 
				this.oLfa = this.getView().byId("lfa");
				var lfa_sh = utils.get_sh_help("lfa");
				var v_ekorg = this.getView().byId("puo").getSelectedKey();
				if(this.oLfa){
					if(!lfa_sh){
						utils.set_search_field(s_swerk, this.oLfa, "lfa", "H", v_ekorg, "", "X", oPage);
					}else{
						var lfaOdata= lfa_sh.model.oData.results;
						if(lfaOdata.length == 0){
							utils.set_search_field(s_swerk, this.oLfa, "lfa", "H", v_ekorg, "", "X", oPage);
						}else{
							utils.openValueHelp(sIdstr);
						}
					}
				}

			}else if(sIdstr === "asm"){  // Search Help 클릭시 데이터를 가져 온다.
				this.oAsm = this.getView().byId("asm");
				var asm_sh = utils.get_sh_help("asm");
				if(this.oAsm){
					if(!asm_sh){
						utils.set_search_field(s_swerk, this.oAsm, "asm", "H", "", "", "X", oPage);
					}else{
						var asmOdata= asm_sh.model.oData.results;
						if(asmOdata.length == 0){
							utils.set_search_field(s_swerk, this.oAsm, "asm", "H", "", "", "X", oPage);
						}else{
							utils.openValueHelp(sIdstr);
						}
					}
				}

			}else if(sIdstr === "asm_init"){  // Search Help 클릭시 데이터를 가져 온다. 
				var oPopupPage = sap.ui.getCore().byId("dialog_init");
				this.oAsm_init = sap.ui.getCore().byId("asm_init");
				var asm_init_sh = utils.get_sh_help("asm_init");
				if(this.oAsm_init){
					if(!asm_init_sh){
						utils.set_search_field(s_swerk, this.oAsm_init, "asm", "H", "", "", "X", oPopupPage);
					}else{
						var asmInitOdata= asm_init_sh.model.oData.results;
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


		//Order type 변경시  PMActType로 변경되어야 한다. // 사용 안 함 
		onChange_Auart : function(oEvent){

			var v_auart = oEvent.getParameters().selectedItem.getKey();
			var v_swerk = this.oSwerk.getSelectedKey();
			var v_noti  = this.getView().byId("noti").getValue();

			this.oAct = this.getView().byId("act");

			if(this.oAct){
				this.oAct.removeAllItems();
				utils.set_search_field(v_swerk, this.oAct, "ac2", "C", v_auart, v_noti);
			}
		},


		// Maint Plant select를  change 할때 
		onSelChange : function(oEvent){

			var v_swerk = oEvent.getParameter("selectedItem").getKey();

			sap.ui.getCore().byId("equnr_init").setValue("");
			sap.ui.getCore().byId("equnr_init_tx").setText("");
			sap.ui.getCore().byId("fl_init").setValue("");
			sap.ui.getCore().byId("fl_init_tx").setText("");
			sap.ui.getCore().byId("woc_init").setSelectedKey("");
			sap.ui.getCore().byId("asm_init").setValue("");
			sap.ui.getCore().byId("asm_init_tx").setText("");

			this.getView().byId("equnr").setValue("");
			this.getView().byId("tplnr").setValue("");
			this.getView().byId("tplnrTx").setText("");
			this.getView().byId("invnr").setValue("");
			this.getView().byId("woc").setSelectedKey("");
			this.getView().byId("plg").setSelectedKey("");
			this.getView().byId("coc").setValue("");
			this.getView().byId("cocTx").setText("");
			this.getView().byId("asm").setValue("");
			this.getView().byId("asmTx").setText("");

			this.oSwerk.setSelectedKey(v_swerk);
			this._set_search_field_init();

			this.set_auth_screen_ctrl_init();

//			debugger;
			// ams_init 초기하
			var asm_init_sh = utils.get_sh_help("asm_init");
			if(asm_init_sh){
				asm_init_sh.model.oData.results = [];
			}
		},


		// Operation Internal / External 선택 시 옵션 
		onChange_intext : function(oEvent){

			var idx = oEvent.getSource().getParent().getIndex();
			var tableModel = this.getView().byId("table_operation").getModel();

			var v_val = "";
			if(oEvent.getParameter("selectedItem")){
				v_val = oEvent.getParameter("selectedItem").getKey();
			}

			if(v_val){
				var err;

				var list = tableModel.getData().results;
				for(var i=0; i<list.length; i++){
					if(idx != i && list[i].Steus == v_val){
						err = "X";
						break;
					}
				}
				if(err){
					sap.m.MessageBox.show(
							this.i18n.getText("check_add"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);

					tableModel.getData().results[idx].Steus = "";
					tableModel.refresh();
					return;
				}

				//var tableModel = this.getView().byId("table_operation").getModel();
				if(v_val === "PM03"){
					if(tableModel.getData().results[idx].PIC){
						sap.m.MessageBox.show(
								this.i18n.getText("check_external"),
								sap.m.MessageBox.Icon.WARNING,
								this.i18n.getText("warning")
						);
						tableModel.getData().results[idx].Steus = "PM01";
						tableModel.refresh();
						return;
					}

					tableModel.getData().results[idx].DisplayMode = false;

					tableModel.getData().results[idx].Arbei = "";
					tableModel.getData().results[idx].Anzzl = "";
					tableModel.getData().results[idx].Dauno = "";

					//External 의 경우 새로운 Activity로 생성하는 경우 삭제 가 안되어 에러가 남, 기존에 External 있으면 Activity를 변경해 준다 .
					/*            if(this.old_operationlist.results){
              for(var i=0; i<this.old_operationlist.results.length; i++){
                if(this.old_operationlist.results[i].Steus == "PM03"){
                  tableModel.getData().results[idx].Vornr = this.old_operationlist.results[i].Vornr;
                }
              }
            }*/

					// 이전에 지운 external 번호과 새로 생성되는 external 번호가 같으면 증가 시켜 준다. 
					if(this.old_operationlist.results && this.param_mode != "C"){
						for(var i=0; i<this.old_operationlist.results.length; i++){
							if(this.old_operationlist.results[i].Steus == "PM03"
								&& tableModel.getData().results[idx].Vornr == this.old_operationlist.results[i].Vornr){
								var new_vornr = parseInt(this.old_operationlist.results[i].Vornr);
								new_vornr = new_vornr + 10;

								var str_vornr = new_vornr.toString();
								var str_length = str_vornr.length;

								if(str_length < 4){
									var zero_cnt = 4 - str_length;
									for(var j=0;j<zero_cnt;j++){
										str_vornr = "0" + str_vornr;
									}
								}
								tableModel.getData().results[idx].Vornr = str_vornr;
							}
						}
					}

					var activity = tableModel.getData().results[idx].Vornr;
					var shotText = tableModel.getData().results[idx].Ltxa1;

					this._get_default_external(activity, shotText);

				}else{
					tableModel.getData().results[idx].DisplayMode = true;
				}

				tableModel.refresh();

				this.changeScreen_External(v_val);
			}

		},

		//External만 하나인지 체크하는 로직 
		/*onChange_intext : function(oEvent){

        var idx = oEvent.getSource().getParent().getIndex();
        var tableModel = this.getView().byId("table_operation").getModel();

        var v_val = oEvent.getParameter("selectedItem").getKey();

        var err;

        if(v_val === "PM03"){  // External
          var list = tableModel.getData().results;
          for(var i=0; i<list.length; i++){
            if(idx != i && list[i].Steus == "PM03"){
              err = "X";
              break;
            }
          }
          if(err){
            sap.m.MessageBox.show(
              this.i18n.getText("check_add"),
              sap.m.MessageBox.Icon.WARNING,
              this.i18n.getText("warning")
            );

            tableModel.getData().results[idx].Steus = "PM01";
            tableModel.refresh();
            return;
          }

          var tableModel = this.getView().byId("table_operation").getModel();
          tableModel.getData().results[idx].DisplayMode = false;

          var activity = tableModel.getData().results[idx].Vornr;
          var shotText = tableModel.getData().results[idx].Ltxa1;

            this._get_default_external(activity, shotText);

        }else{  //Internal
          tableModel.getData().results[idx].DisplayMode = true;
        }
        tableModel.refresh();

        this.changeScreen_External(v_val);
      },*/


		onChange_cal : function(oEvent){
			var idx = oEvent.getSource().getParent().getIndex();
			var tableModel = this.getView().byId("table_operation").getModel();

			var rowData = tableModel.getData().results[idx];

			var chk;

			if(rowData.Arbei){
				if(!$.isNumeric(rowData.Arbei)){
					rowData.ErrChk1 = "Error"; 
					chk = "X";
				}else{
					rowData.ErrChk1 = "None"; 
				}
			}else{
				rowData.ErrChk1 = "None"; 
			}

			if(rowData.Anzzl){
				if(!$.isNumeric(rowData.Anzzl)){
					rowData.ErrChk2 = "Error"; 
					chk = "X";
				}else{
					rowData.ErrChk2 = "None"; 
				}
			}else{
				rowData.ErrChk2 = "None"; 
			}

			if(chk != "X"){
				var work = rowData.Arbei;
				var number = rowData.Anzzl;

				if(number != 0){
					var dur = work / number;
					dur = Math.round(dur * 10) / 10
				}
				tableModel.getData().results[idx].Dauno = dur;
			}

		},


		onChange_ltext : function(oEvent){
			var idx = oEvent.getSource().getParent().getIndex();
			var tableModel = this.getView().byId("table_operation").getModel();

			var rowData = tableModel.getData().results[idx];

			if(rowData.Steus === "PM03"){
				this.getView().byId("workDesc").setValue(rowData.Ltxa1 );
			}
		},


		//Material 선택 
		onValueHelpRequest_mat : function(oEvent){

			var v_swerk = this.oSwerk.getSelectedKey();
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();

			this.getOwnerComponent().openSearchMaterialStock_Dialog(this, "MultiToggle", v_swerk);

//			this.oMat = this.getView().byId("mat");
//			var mat_sh = utils.get_sh_help("mat");
//			if(this.oMat){
//			if(!mat_sh){
//			utils.set_search_field(v_swerk, this.oMat, "mat", "H", "", "", "X");
//			}else{
//			utils.openValueHelp("mat");
//			}
//			}
		},

		// possible entry 사용 시 사용 
		onChange_mat : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();

			if(oEvent.getParameter("newValue")){
				var mat_sh = utils.get_sh_help("mat");
				if(!mat_sh){
					var v_swerk = this.oSwerk.getSelectedKey();
					this.oMat = this.getView().byId("mat");

					//Material search help를 선택할때 데이터가 오므로 
					//Search Help가 만들어지기 전에 Enter를 통해 데이터를 검증해야 할때 Event도 함께 넘겨 준다. 
					utils.set_search_field(v_swerk, this.oMat, "mat", "H", "", "", "T", "", oEvent); //데이터만 가져오고 Help창은 띄우지 않는다
				}else{
					var result = utils.set_token(this.oMat, oEvent, "X");
				}
			}else{
				this.set_search_selected_data("mat","","","X");
			}
		},


		//Stroage location
		onValueHelpRequest_stl : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();
			utils.openValueHelp("stl");
		},


		onChange_stl : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();
			var result = utils.set_token(this.oStl, oEvent, "X");
		},


		onChange_Mat_qty : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();
			var val = oEvent.getParameters().newValue;

			var matModel = this.getView().byId("table_material").getModel();
			var oData = matModel.getData().results;
			if(!$.isNumeric(val)){
				oData[this.material_rowIdx].QtyErr = "Error";
			}else{
				oData[this.material_rowIdx].QtyErr = "None";
			}
			matModel.refresh();
			this.material_rowIdx = "";
		},

//		JUN 190128

//		onChange_Mat_spflag : function(oEvent){
//		this.material_rowIdx = oEvent.getSource().getParent().getIndex();
//		var val = oEvent.oSource.getProperty("selectedKey");

//		var matModel = this.getView().byId("table_material").getModel();
//		var oData = matModel.getData().results;

//		if(oData.UserStatus == "ORS1"){
//		if(val == ""){
//		oData[this.material_rowIdx].SpfgErr = "Error";
//		}else{
//		if(val === "P"){
//		oData[this.material_rowIdx].ChargMode = false;
//		oData[this.material_rowIdx].Charg = "N";
//		}else{
//		oData[this.material_rowIdx].ChargMode = true;
//		oData[this.material_rowIdx].Charg = "";
//		}

//		oData[this.material_rowIdx].SpfgErr = "None";
//		}
//		}else{
//		if(val === "P"){
//		oData[this.material_rowIdx].SpfgErr = "None";
//		oData[this.material_rowIdx].Spflag = "S";
//		oData[this.material_rowIdx].Charg = "";

//		Message.show(
//		this.i18n.getText("err_sp_item_cat"),
//		Message.Icon.WARNING,
//		this.i18n.getText("error")
//		);
//		}
//		}

//		matModel.refresh();
//		this.material_rowIdx = "";
//		},

		onChange_Mat_spflag : function(oEvent){
			this.material_rowIdx = oEvent.getSource().getParent().getIndex();
			var val = oEvent.oSource.getProperty("selectedKey");

			var matModel = this.getView().byId("table_material").getModel();
			var oData = matModel.getData().results;

			// ORS1, ORS2 에서 Purch 변경 가능, ORS3, ORS4 에서는 purch 항목 변경불가
			// ORS1, ORS2, ORS3 에서 Stock 변경 가능, ORS4에서 변경 불가, 즉 ORS4는 Reject라 비활성임으로 언제나 변경 가능
			if(oData.UserStatus == "ORS3"){
				if(val === "P"){
					oData[this.material_rowIdx].SpfgErr = "None";
					oData[this.material_rowIdx].Spflag = "S";
					oData[this.material_rowIdx].Charg = "";  // Type : ""

					Message.show(
							this.i18n.getText("err_sp_item_cat"),
							Message.Icon.WARNING,
							this.i18n.getText("error")
					);
				}
			}else{
				if(val == ""){
					//         oData[this.material_rowIdx].SpfgErr = "Error";
				}else{
					if(val === "P"){
						oData[this.material_rowIdx].ChargMode = false;
						oData[this.material_rowIdx].Charg = "N";   // Type : Val
					}else{
						oData[this.material_rowIdx].ChargMode = true;
						oData[this.material_rowIdx].Charg = "";   // Type : ""
					}

					oData[this.material_rowIdx].SpfgErr = "None";
				}
			}

			matModel.refresh();
			this.material_rowIdx = "";
		},







		/* 
		 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
		 */
		onChange : function(oEvent){

			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			if(sIdstr == "expamount" || sIdstr == "price_po"){
				var price = oEvent.getParameter("newValue");

				//price = price.replace(/,/g,"");
				if(sap.ui.getCore().getConfiguration().getFormatLocale() == "pt-BR"){
					price = price.replace(/\./g,"");
					price = price.toString().replace(/,/g,"\.");					
				}else{
					price = price.replace(/,/g,"");
				}
				
				
				
				if(price!= ""){
					if(!$.isNumeric(price)){
						oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
					}else{
						oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
					}
				}

			}else if(sIdstr === "equnr"){
				var v_swerk = this.getView().byId("swerk").getSelectedKey();
				utils.get_equip_info(oEvent.getParameter("newValue"), v_swerk, sIdstr)
			}else if(sIdstr === "equnr_init"){
				var v_swerk_init = sap.ui.getCore().byId("swerk_init").getSelectedKey();
				if(oEvent.getParameter("newValue")){
					utils.get_equip_info(oEvent.getParameter("newValue"), v_swerk_init, sIdstr)
				}else{
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("equnr_init_tx").setText("");
				}
			}else if(sIdstr === "hdDesc" || sIdstr === "hdDesc_init"){
				var v_desc_hd = oEvent.getSource().getValue();
				if(v_desc_hd){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr === "fl_init"){
				var v_swerk = sap.ui.getCore().byId("swerk_init").getSelectedKey();
				if(oEvent.getParameter("newValue")){
					utils.get_fl_info(oEvent.getParameter("newValue"), v_swerk);
				}else{
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("fl_init_tx").setText("");
				}
			}else if(sIdstr === "lfa"){
				var lfa = oEvent.getParameter("newValue");

				if(lfa == ""){
					this.getView().byId("lfaTx").setText("");
				}else{

					if(!this.oLfa){
						this.oLfa = this.getView().byId("lfa");
					}
					var lfa_sh = utils.get_sh_help("lfa");

					if(!lfa_sh){
						var v_ekorg = this.getView().byId("puo").getSelectedKey();
						var v_swerk = this.getView().byId("swerk").getSelectedKey();

						//Vendor search help를 선택할때 데이터가 오므로 
						//Search Help가 만들어지기 전에 Enter를 통해 데이터를 검증해야 할때 Event도 함께 넘겨 준다. 
						utils.set_search_field(v_swerk, this.oLfa, "lfa", "H", v_ekorg, "", "T", "", oEvent); //데이터만 가져오고 Help창은 띄우지 않는다
					}else{
						var result = utils.set_token(this.oLfa, oEvent, "X");
					}
				}

			}else if(sIdstr == "waers_po"){
				var v_waers_po = oEvent.getSource().getSelectedKey();
				if(v_waers_po){
					oEvent.getSource().setValueState("None");
				}
			}else if(sIdstr == "rev"){
				var v_rev = oEvent.getParameter("newValue");
				if(!v_rev){
					oEvent.getSource().setValueState("None");
				}else{
					var result = utils.set_token(this.oRev, oEvent, "X");
				}
			}else if(sIdstr == "asm"  ){
//				var v_asm = oEvent.getParameter("newValue");
//				if(!v_asm){
//				oEvent.getSource().setValueState("None");
//				}else{
//				var result = utils.set_token(this.oAsm, oEvent, "X");
//				}

				var v_asm = oEvent.getParameter("newValue");
				if(!v_asm){
					oEvent.getSource().setValueState("None");
					this.getView().byId("asmTx").setText("");
				}else{
					if(!this.oAsm){
						this.oAsm = this.getView().byId("asm");
					}
					var asm_sh = utils.get_sh_help("asm");

					if(!asm_sh){
						var v_swerk = this.getView().byId("swerk").getSelectedKey();

						//Assembly search help를 선택할때 데이터가 오므로 
						//Search Help가 만들어지기 전에 Enter를 통해 데이터를 검증해야 할때 Event도 함께 넘겨 준다. 
						utils.set_search_field(v_swerk, this.oAsm, "asm", "H", "", "", "T", "", oEvent);//데이터만 가져오고 Help창은 띄우지 않는다
					}else{
						var result = utils.set_token(this.oAsm_init, oEvent, "X");
					}
				}
			}else if(sIdstr == "asm_init"){
//				var v_asm_init = oEvent.getParameter("newValue");
//				if(!v_asm_init){
//				oEvent.getSource().setValueState("None");
//				}else{
//				var result = utils.set_token(this.oAsm_init, oEvent, "X");
//				}

				var v_asm_init = oEvent.getParameter("newValue");
				if(!v_asm_init){
					oEvent.getSource().setValueState("None");
					sap.ui.getCore().byId("asm_init_tx").setText("");
				}else{
					if(!this.oAsm_init){
						this.oAsm_init = sap.ui.getCore().byId("asm_init");
					}
					var asm_init_sh = utils.get_sh_help("asm_init");
					if(asm_init_sh){
						var asmInitOdata = asm_init_sh.model.oData.results;
					}

					if(!asm_init_sh || (asmInitOdata != undefined && asmInitOdata.length == 0)){
						var v_swerk = this.getView().byId("swerk").getSelectedKey();

						//Assembly search help를 선택할때 데이터가 오므로 
						//Search Help가 만들어지기 전에 Enter를 통해 데이터를 검증해야 할때 Event도 함께 넘겨 준다. 
						utils.set_search_field(v_swerk, this.oAsm_init, "asm", "H", "", "", "T", "", oEvent);//데이터만 가져오고 Help창은 띄우지 않는다
					}else{
						var result = utils.set_token(this.oAsm_init, oEvent, "X");
					}
				}

			}
		},


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


		onHandleDateChange : function(oEvent){
			var oDP = oEvent.oSource;
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},


		onAdd_operation : function(oEvent, isNoti){
			var oTable = this.getView().byId("table_operation");
			var tableModel = oTable.getModel();

			var create_init;
			var last_vornr;
			var v_statusChange;

			var v_swerk = this.oSwerk.getSelectedKey();

			var odata = {};
			var list = [];

			var v_woc = this.oWoc.getSelectedKey();

			/*        v_woc = this.oWoc.getSelectedKey();
        if(!v_woc){
          //v_woc = this.oWoc_init.getSelectedKey();
        } */

			var v_auart = "";
			if(sap.ui.getCore().byId("auart_init")){
				v_auart = sap.ui.getCore().byId("auart_init").getSelectedKey();
			}else{
				v_auart = this.getView().byId("auart").getSelectedKey();
			}
			if(v_auart == "PM04"){
				v_statusChange = false;
			}

			if(tableModel.getData() != null){
				odata = tableModel.getData();
				list = odata.results;
			}else{
				create_init = "X";  // create mode 시 최초 row 생성 시 
			}

			if(list.length < 1){
				last_vornr = 10;
			}else{
				var cnt = list.length - 1;
				last_vornr = list[cnt].Vornr
				last_vornr = parseInt(last_vornr) + 10;
			}

			var new_vornr = last_vornr.toString();
			var str_length = new_vornr.length;

			if(str_length < 4){
				var zero_cnt = 4 - str_length;
				for(var j=0;j<zero_cnt;j++){
					new_vornr = "0" + new_vornr;
				}
			}

			if(new_vornr == "0010"){
				var v_steus = "PM01";
				var v_shotdesc = this.getView().byId("hdDesc").getValue();
			}else{
				var v_steus = "";
//				var firstRow = tableModel.getData().results[0];
//				if(firstRow.Steus == "PM01"){
//				var v_steus = "PM03";
//				}else{
//				var v_steus = "PM01";
//				}
			}

			var v_qmnum;
			if(isNoti == "X" && this.param_qmnum){ // Noti로 생성 하는 첫번째 row
				v_qmnum = this.getView().byId("noti").getValue();
			}

			list.push( 
					{
						"Vornr" : new_vornr,
						"Arbpl" : v_woc,
						"ArbplTx" : "",
						"Werks" : v_swerk,
						"Steus" : v_steus,
						"Ltxa1" : v_shotdesc,
						"Arbei" : "",  //Work Time
						"Anzzl" : "",  //Number
						"Dauno" : "",  //Duration
						"Arbeh" : "H",  
						"PIC" : "",
						"DisplayMode" : true,
						"Phflg" : "",
						"ErrChk1" : "None",
						"ErrChk2" : "None",
						"Qmnum" : v_qmnum,
						"SteusChange" : v_statusChange,
						"NewLine" : "X"
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

			this.set_table_work_ctr();

			this.operationBtn_ctl();

			var idx = list.length-1;   
			oTable.setFirstVisibleRow(idx);
			$("input[id*='Arbpl']").focus().trigger("click");
		},


		onDelete_operation : function(oEvent){
			var oTable;
			oTable = this.getView().byId("table_operation");

			var oMatTable = this.getView().byId("table_material");
			var matTableModel = oMatTable.getModel();
			var oMatData = matTableModel.getData();
			var matitem = oMatData.results;
			
			var mat_cnt = matitem.length - 1 ;

			var aIndices = oTable.getSelectedIndices();
			if (aIndices.length < 1) {
				Toast.show("No item selected");
				return;
			}

//			debugger;
			var tableModel = oTable.getModel();
			var odata = tableModel.getData();
			var operitem = odata.results;
			
			for(var i=mat_cnt; i>=0; i--){
				if(matitem[i].Vornr == operitem[aIndices].Vornr){
					sap.m.MessageBox.show(
							this.i18n.getText("delete_check_oper_mat_assign"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);		
					
					return;					
				}
			};			
			
			var cnt = operitem.length - 1 ;

			var no_delete_idx;
			var delete_pm01 = "";
			for(var i=cnt; i>=0; i--){
				for(var j=0; j<aIndices.length; j++){
					if(i === aIndices[j] ){

						if(operitem[i].Steus == "PM03"){
							if(this.getView().byId("po").getValue()){ 
								sap.m.MessageBox.show(
										this.i18n.getText("delete_check_oper_pm03"),
										sap.m.MessageBox.Icon.WARNING,
										this.i18n.getText("warning")
								);
								continue;
							}
						}else if(operitem[i].Steus == "PM01"){
							delete_pm01 = "X";
						}

						if(!operitem[i].NewLine){  //오더에 생성되어 있던 Row는 삭제 할 수 없다( 신규 Row를 저장한 후 삭제 가능)
							if(!this.check_operDel(i)){
								delete_pm01 = "";  //삭제 할 수 없는 상태임
								break;
							}else{
								var removed = operitem.splice(i, 1);  // 한줄 이상의 데이터가 존재 하는 경우 삭제 가능 
							}
						}else{
							var removed = operitem.splice(i, 1);  // 새로 생성된 Row 항상 지울 수 있음 
						} 
					}
				}
			};
			odata.results = operitem;
			tableModel.setData(odata);

			oTable.clearSelection();
			this.changeScreen_External();

			this.operationBtn_ctl();

			if(delete_pm01){
				this.delete_material();
			}
		},


		//Operaion의 Internal(PM01)인 경우 Material을 넣을 수 있다. 
		//Internal Row를 삭제 하는 경우  Material을 삭제 한다. 
		delete_material : function(){

			var oTable = this.getView().byId("table_material");
			var tableModel = oTable.getModel();

			if(tableModel.getData()){
				var oData = tableModel.getData().results;

				if(oData.length > 0){
					tableModel.getData().results = [];
					tableModel.refresh();
				}
			}
		},


		check_operDel : function(selIdx){

			var oTable = this.getView().byId("table_operation");
			var tableModel = oTable.getModel();
			var odata = tableModel.getData().results;

			var cnt = 0;
			var new_line = "";
			for(var i=0; i<odata.length; i++){
				if(i != selIdx && !odata[i].NewLine){
					cnt = cnt + 1;
				}
				if(odata[i].NewLine){
					new_line = "X";
				}
			}

			if(cnt == 0){
				if(new_line){
					sap.m.MessageBox.show(
							this.i18n.getText("delete_check_oper"),
							sap.m.MessageBox.Icon.WARNING,
							this.i18n.getText("warning")
					);
				}
				return false; //Order 저장되어 있는 Item이 하나도 없으면 삭제 할수 없음 
			}else{
				return true;
			}

		},


		onOperation_adddel : function(){

			if(this.param_mode == "U"){
				sap.m.MessageBox.show(
						this.i18n.getText("delete_check_oper"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
			}

		},


		operationBtn_ctl : function(){

			var oTable =  this.getView().byId("table_operation");
			var list = oTable.getModel().getData().results;

			var screenModel = this.getView().getModel("screenMode"); 

			var v_auart = this.getView().byId("auart").getSelectedKey();
			if(v_auart != "PM04"){
				if(this.param_mode != "D" ){
					if(list.length < 2){
						screenModel.getData().oper_isvisible = true;
						screenModel.getData().oper_isvisible_del = false;
					}else{
						screenModel.getData().oper_isvisible = false;
						screenModel.getData().oper_isvisible_del = true;
					}
					screenModel.refresh();
				}
			}
		},


		onAdd_materal : function(oEvent){
			
			var oTable = this.getView().byId("table_material");
			var tableModel = oTable.getModel();

			var last_posnr; 
			var odata = {};
			var list = [];

			var create_init;
//			debugger;

			if(tableModel.getData() !=null ){
				odata = tableModel.getData();
				list = odata.results;
			}else{
				create_init = "X";  // create mode 시 최초 row 생성 시 
			}

			var cnt = list.length - 1;
			if(list.length < 1){
				last_posnr = 10;
			}else{
				last_posnr = list[cnt].Posnr;
				last_posnr = parseInt(last_posnr) + 10;
			}

			var new_posnr = last_posnr.toString();
			var str_length = new_posnr.length;

			if(str_length < 4){
				var zero_cnt = 4 - str_length;
				for(var j=0;j<zero_cnt;j++){
					new_posnr = "0" + new_posnr;
				}
			}

			list.push( 
					{
						"Posnr" : new_posnr,
						"Matnr" : "",
						"Maktx" : "",
						"Bdmng" : "",
						"Meins" : "",
						"Lgort" : "",
						"Lgobe" : "",
						"Spflag": "",
						"Charg" : "",
						"Mtart" : "",
						"ChargMode" : false,
						"Rsnum" : "",
						"Rspos" : "",
						"Vornr" : "0010",
						"Xloek" : "",
						"MatErr" : "None",
						"QtyErr" : "None",
						"SlocErr" : "None",
						"SpfgErr" : "None",
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


		onDelete_materal : function(oEvent){
			
			var oTable;
			oTable = this.getView().byId("table_material");

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


		onProposal: function(oEvent){     // Propsal (구,Request Approval) Button, 반장/작업자가 승인자에게 요청
			//var sObj = this.onRowSelect();

			if(!this.checkMandatory()){
				return;
			}

			if(!this.check_data()){
				return;
			}

			var sObj = {};
			sObj.Aufnr = this.getView().byId("aufnr").getValue();
			sObj.Werks = this.getView().byId("swerk").getSelectedKey();
			sObj.Vaplz = this.getView().byId("woc").getSelectedKey();
			//sObj.Zid    = sObj.Zid;
			//sObj.Zname  = sObj.Zname;
			//sObj.Ztitle = sObj.Ztitle;

			//if(sObj){
			//if(sObj.Stat == "I0001" && sObj.Ustat == "E0001" && sObj.Zid == ""){  // System status : CRTD, User Status : ORS1
			this._getDialog_reqapproval(sObj).open();
//			}else{
//			sap.m.MessageBox.show(
//			this.i18n.getText("isnotrequest"),
//			sap.m.MessageBox.Icon.WARNING,
//			this.i18n.getText("warning")
//			);
//			}
			//}
		},


//	    checkWorkResult : function(vStat){
//			var oModel = this.getModel("workResult");
//			var controll = this;
//			var lange  = this.getLanguage();
//			var s_spras  = [];  		
//			var s_filter = [];
//			if(lange){
//				s_spras.push(lange);
//
//				if(s_spras){
//					s_filter.push(utils.set_filter(s_spras, "Spras"));
//				}		
//			}	
//
//			var filterStr;
//			for(var i=0; i<s_filter.length; i++){
//
//				if(i === 0){
//					filterStr = s_filter[i];
//				}else{
//					filterStr = filterStr + " and " + s_filter[i];
//				}
//			}
//
//			var path = "/InputSet(Zmode='R',Werks='"+this.param_swerk+"',Aufnr='"+this.param_order+"')";
//			///sap/opu/odata/SAP/ZPM_GW_0073_SRV/InputSet(Zmode='R',Werks='2010',Aufnr='4000183')
//			//?$expand=BreakdownList,FailurecodeList,MeasuringList,WorktimeList&$filter=Spras eq 'EN'
//			var mParameters = {
//					urlParameters : {
//						"$expand" : "BreakdownList,FailurecodeList,MeasuringList/ListDeep,WorktimeList", 
//						"$filter" : filterStr
//					},
//
//					success : function(oData) {
//						for (var i=0; i<oData.FailurecodeList.results.length; i++) {
//							if(oData.FailurecodeList.results[i].Fecod == ''){
//								vStat = false;
//							}else{
//								vStat = true;
//								return;
//							}
//						}				    
//
//					}.bind(this),
//					error : function() {
//						sap.m.MessageBox.show(
//								controll.oMainParam.i18n.getText("oData_conn_error"),
//								sap.m.MessageBox.Icon.ERROR,
//								controll.oMainParam.i18n.getText("error")
//						);
//					}.bind(this)
//			};
//
//			oModel.read(path, mParameters);
//	    },
	    
		onComplete : function(oEvent){

			var controll = this;

// 2019.12.16 if(Zbmind = BM ) -> Check Work Result & Failure Code  
			var oModel  = this.getView().getModel("ReadOrder");
			var vZbmind = oModel.getData().Zbmind;
			if(vZbmind == 'BM'){
//				var vError;
//				this.checkWorkResult(vError);
//				if(!vError){
					sap.m.MessageBox.show(
							this.i18n.getText("fill_out_failure_code"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);
					return false;
//				}
			}
			
			Message.confirm(this.i18n.getText("orderComplete"), 
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
		},


		onApprove : function(oEvent){ 
			var controll = this;

			var oTable = this.getView().byId("table_operation");
			var oData = oTable.getModel().getData().results;

			for(var i in oData){
				if(oData[i].Steus == "PM01"){
					if(!oData[i].PIC){
						sap.m.MessageBox.show(
								this.i18n.getText("chk_worker_assign"),
								sap.m.MessageBox.Icon.WARNING,
								this.i18n.getText("Warning")
						);
						return;
					}
				}
			}

			Message.confirm(this.i18n.getText("orderApprove"), 
					{//title: "", 
				onClose : function(oAction){
					if(oAction=="OK"){
						controll.onSave("", "A") ;  //생산 - 승인 
					}else{
						return false;
					}
				},
				styleClass: "",
				initialFocus: sap.m.MessageBox.Action.OK,
				textDirection : sap.ui.core.TextDirection.Inherit }
			);
		},


		onReject : function(oEvent){
			var controll = this;

			this._getDialog_ResaonReject().open();

			/*        Message.confirm(this.i18n.getText("orderReject"), 
            {//title: "", 
                   onClose : function(oAction){
                if(oAction=="OK"){
                              controll.onSave("", "R") ;  //생산 - 반려 
              }else{
                return false;
              }
             },
                   styleClass: "",
                   initialFocus: sap.m.MessageBox.Action.OK,
                   textDirection : sap.ui.core.TextDirection.Inherit }
        );  */

		},


		onSave : function(oEvent, status){

			if(!this.checkMandatory()){
				return;
			}
			if(!this.check_data()){
				return;
			}

			this.order_save(status);

		},


		order_save : function(ch_user_status, apvData, noMsg){

			var oModel = this.getView().getModel();
			var oView = this.getView();

			var lange = this.getLanguage();

			var controll = this;

			var oMainModel = this.getView().getModel("ReadOrder");

			oModel.attachRequestSent(
					function(){
						controll.oOrderPage.setBusy(true);});
			oModel.attachRequestCompleted(
					function(){
						controll.oOrderPage.setBusy(false);});
			var data = {};

			//생성 모드이나 오더 번호가 존재 한다면 업데이트로 변경 해 준다.
			if(this.getView().byId("aufnr").getValue() && this.param_mode === "C"){
				this.param_mode = "U"
			}

			data.Mode = this.param_mode;   
			data.Spras = lange;
			data.Aufnr = this.getView().byId("aufnr").getValue();
			data.Auart = this.getView().byId("auart").getSelectedKey();
			data.Swerk = this.getView().byId("swerk").getSelectedKey();
			data.Iwerk = this.getView().byId("swerk").getSelectedKey();
			data.Ilart = this.getView().byId("act").getSelectedKey();
			data.Qmnum = this.getView().byId("noti").getValue();
			data.Ernam = this.getView().byId("createBy").getValue();
			data.Erdat = formatter.dateToStr(this.getView().byId("createon").getDateValue());
			data.Priok = this.getView().byId("pri").getSelectedKey();
			data.Gstrp = formatter.dateToStr(this.getView().byId("basic_from").getDateValue());
			data.Gltrp = formatter.dateToStr(this.getView().byId("basic_to").getDateValue());
			data.Tplnr = this.getView().byId("tplnr").getValue();
			data.Ingrp = this.getView().byId("plg").getSelectedKey();
			data.Vaplz = this.getView().byId("woc").getSelectedKey();
			data.Equnr = this.getView().byId("equnr").getValue();
			data.Kostl = this.getView().byId("coc").getValue();
			data.Revnr = this.getView().byId("rev").getValue();
			//  data.Invnr = this.getView().byId("tag").getValue();
			data.Posid = this.getView().byId("wbs").getValue();
			data.ShortTx = this.getView().byId("hdDesc").getValue();
			data.Bautl = this.getView().byId("asm").getValue();
			data.UserStatus = ch_user_status;

			if(ch_user_status == "R"){
				var message = this.getView().byId("desc").getValue() + '\n' +
				sap.ui.getCore().byId("resaon").getValue();
				data.LongTxt =  message;
			}else{
				data.LongTxt = this.getView().byId("desc").getValue();
			}

			var external = {};

			external.Vornr = this.getView().byId("operation").getValue();
			external.Ltxa1 = this.getView().byId("workDesc").getValue();

			external.Mgvrg = this.getView().byId("qty").getValue();
			if(!external.Mgvrg){
				external.Mgvrg = 0;
			}
			external.Mgvrg = external.Mgvrg.toString();
			external.Meinh = this.getView().byId("meinh").getText();
			
			debugger;
			if(external.Vornr){
//				external.Preis = this.getView().byId("expamount").getValue().toString().replace(/,/g,"");
				var Price = this.getView().byId("expamount").getValue();
			
				if(!Price){
					Price = 0;
				}
				if(sap.ui.getCore().getConfiguration().getFormatLocale() == "pt-BR"){
					external.Preis = Price.toString().replace(/\./g,"");
					external.Preis = external.Preis.toString().replace(/,/g,"\.");					
				}else{
					external.Preis = Price.toString().replace(/,/g,"");
				}
			}

			external.Waers = this.getView().byId("ex_waers").getText();
			external.Ekorg = this.getView().byId("puo").getSelectedKey();
			external.Ekgrp = this.getView().byId("pug").getSelectedKey();
			external.Matkl = this.getView().byId("mag").getValue();
			external.Sakto = this.getView().byId("costelemt").getValue();
			external.Lifnr = this.getView().byId("lfa").getValue();

			data.External = external;

			data.HdMaterial = [];

			var oTableMat = this.getView().byId("table_material");

			if(oTableMat.getModel().oData){
				var matData = oTableMat.getModel().oData.results; 
//				debugger;
				for(var i=0; i<matData.length; i++){
					var hdmat = {};

					if(matData[i].Matnr){
						hdmat.Posnr = matData[i].Posnr;
						hdmat.Matnr = matData[i].Matnr;
						hdmat.Bdmng = matData[i].Bdmng;
						hdmat.Meins = matData[i].Meins;
						hdmat.Lgort = matData[i].Lgort;
						hdmat.Spflag = matData[i].Spflag;
						hdmat.Charg = matData[i].Charg;
						hdmat.Mtart = matData[i].Mtart;
						hdmat.Rsnum = matData[i].Rsnum;
						hdmat.Rspos = matData[i].Rspos;
						hdmat.Vornr = matData[i].Vornr;
						hdmat.Xloek = matData[i].Xloek;

						data.HdMaterial.push(hdmat);
					}
				}
			}

			data.HdOperation = [];

			var oTableOper = this.getView().byId("table_operation");
			var operData = oTableOper.getModel().oData.results;
			for(var i=0; i<operData.length; i++){
				var hdoper = {};

				if(operData[i].Arbpl && operData[i].Steus){
					hdoper.Vornr = operData[i].Vornr;
					hdoper.Arbpl = operData[i].Arbpl;
					hdoper.Werks = operData[i].Werks;
					hdoper.Steus = operData[i].Steus;
					hdoper.Ltxa1 = operData[i].Ltxa1;
					if(!operData[i].Arbei){
						operData[i].Arbei = 0;
					}
					hdoper.Arbei = operData[i].Arbei.toString();
					if(!operData[i].Anzzl){
						operData[i].Anzzl = 0;
					}
					hdoper.Anzzl = parseInt(operData[i].Anzzl);
					if(!operData[i].Dauno){
						operData[i].Dauno = 0;
					}
					hdoper.Dauno = operData[i].Dauno.toString();

					hdoper.Arbeh = operData[i].Arbeh;
					hdoper.PIC   = operData[i].PIC;
					hdoper.Phflg = operData[i].Phflg;
					hdoper.Qmnum = operData[i].Qmnum;

					data.HdOperation.push(hdoper);
				}
			}

			data.HdAprv = [];
			if(apvData){
				var apprv = {
						Zid : apvData.Zid,
						Zname : apvData.Zname
				};
				data.HdAprv.push(apprv);
			}

			data.HdCost = [];
			data.HdReturn = [];

			var mParameters = {
					success : function(oData) {
						// Order Save 시  Material의 Item Category 이 변경 될 경우,  삭제 후 재 생성 하기 때문에 aufk 테이블의 
						// cpd_updat 필드의 값이 변경 된다, 때문에 오류가 났을 경우에도 cpd_updat 값을 변경 시켜주도록 한다.
						// 이는 다른 사람이 동일 한 오더를 수정 시 발생하는 문제와는 별개임(Etag)
						this.timestamp = oData.Timestamp;
						
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
//							this.timestamp = oData.Timestamp;
							
							oData.External.Bnfpo = oData.External.Bnfpo == "00000" ? "" : oData.External.Bnfpo;
							oData.External.Ebelp = oData.External.Ebelp == "00000" ? "" : oData.External.Ebelp; 

							var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel.setData(oData);
							oView.setModel(oODataJSONModel, "ReadOrder")

							var oTable_oper = controll.getView().byId("table_operation"); 
							var oTable_mat = controll.getView().byId("table_material");
							var oTable_cost = controll.getView().byId("table_cost");

							var oODataJSONModel_oper =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel_oper.setData(oData.HdOperation);
							oTable_oper.setModel(oODataJSONModel_oper);
							oTable_oper.bindRows("/results");

							var oODataJSONModel_mat =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel_mat.setData(oData.HdMaterial);           
							oTable_mat.setModel(oODataJSONModel_mat);
							oTable_mat.bindRows("/results");

							var oODataJSONModel_cost =  new sap.ui.model.json.JSONModel();  
							oODataJSONModel_cost.setData(oData.HdCost);            
							oTable_cost.setModel(oODataJSONModel_cost);
							oTable_cost.bindRows("/results");

							controll.set_table_work_ctr();

							controll.param_mode = "U";

							controll.set_displayMode();
							controll.change_display();
							controll.operationBtn_ctl();
							controll.changeScreen_External();
							controll.set_auth_screen_ctrl();

							if(oData.Zpturl){     // 전자결재 URL 리턴 시 새창
								controll.openWin( oData.Zpturl);
							}else{
								if(!noMsg){ // 메세지를 뿌리고 싶지 않을때 값이 들어 옴
									var message = "" ;
									if(ch_user_status == "P"){
										message = controll.i18n.getText("request_order");
									}else{
										message = controll.i18n.getText("create_order",  [oData.Aufnr]);
									}
									sap.m.MessageBox.show(
											message,
											sap.m.MessageBox.Icon.SUCCESS,
											controll.i18n.getText("success")
									);
								}
							}

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

		openWin : function(sPath){
			var html = new sap.ui.core.HTML();

			$(document).ready(function(){
				window.open(sPath);
			});
		},

		// timestamp 로 현재 데이터의 유효성을 체크 한다. 
		onPress_event : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var event_name = strArr[cnt];

			this.order_before_change_check(event_name, oEvent);

		},

		//변경내용이 있는지 확인 함(Timestamp 이용)
		order_before_change_check : function(event_name, oEvent){
			var oModel = this.getView().getModel();
			var lange = this.getLanguage();

			var controll = this;

			var v_aufnr = this.getView().byId("aufnr").getValue();
			if(!v_aufnr){
				this.call_event(event_name, oEvent);
				return;
			}

			var objEvent =  oEvent;

			var path = "/HdSet(Mode='',Spras='"+lange+"',Aufnr='"+v_aufnr+"')";

			var mParameters = {
					urlParameters : {
						"$filter" : "Timestamp eq '"+ this.timestamp + "'"
					},
					success : function(oData) {

						if(oData.RetTyp == "E"){
//							var message = "";
//							message = oData.RetMsg;
							sap.m.MessageBox.show(
									controll.i18n.getText("aleadyChageData"), //message,
									sap.m.MessageBox.Icon.ERROR,
									controll.i18n.getText("error")
							);
						}else{
							this.call_event(event_name, objEvent);
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

			oModel.read(path, mParameters);

		},


		call_event : function(event_name, oEvent){

			switch(event_name){
			case "workAssign" : 
				this.onPress_wkassign();
				break;
			case "workResult" :
				this.onWorkResult();
				break;
			case "complete" :
				this.onComplete();
				break;
			case "proposal" :
				this.onProposal();
				break;
			case "approve" :
				this.onApprove();
				break;
			case "reject" : 
				this.onReject();
				break;
			case "save" :
				this.onSave();
				break;
			}

		},


		onPress_bom : function(oEvent){
			var s_swerk = this.getView().byId("swerk").getSelectedKey();  
			var s_equnr = this.getView().byId("equnr").getValue();
			var s_equnr_tx = this.getView().byId("equnrTx").getText();
			if(!s_equnr){
				sap.m.MessageBox.show(
						this.i18n.getText("err_equnr"),
						sap.m.MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);
				return;
			}
			this.getOwnerComponent().openEquipBom_Dialog(this, "", s_swerk, s_equnr, s_equnr_tx);
		},


		onPress_wkassign: function(oEvent){     // Request Approval Button, 반장/작업자가 승인자에게 요청

			var internal = "";
			var oOperdata = this.getView().byId("table_operation").getModel().getData();
			for(var i=0; i<oOperdata.results.length; i++){
				if(oOperdata.results[i].Steus == "PM01"){
					internal = "X";
				}
			}
			if(!internal){
				sap.m.MessageBox.show(
						this.i18n.getText("check_internal_assign"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false;
			}

			//var basic_from = this.formatter.strToDate(this.getView().byId("basic_from").getValue());
			//var currentDate = this.formatter.strToDate(this.locDate);
			var basic_from = this.getView().byId("basic_from").getValue();
			var currentDate = this.locDate;
			
			debugger;			
			if(basic_from < currentDate){
				sap.m.MessageBox.show(
						this.i18n.getText("check_assign"),
						sap.m.MessageBox.Icon.ERROR,
						this.i18n.getText("error")
				);
				return false;
			}

			if(!this.checkMandatory()){
				return false;
			}

			if(!this.check_data()){
				return false;
			}

			var oModel = this.getView().getModel("ReadOrder");

			var sObj = {};
			sObj.Werks = this.getView().byId("swerk").getSelectedKey();
			sObj.Aufnr = this.getView().byId("aufnr").getValue();  
			sObj.Zid   = oModel.getData().Zid;  //this.getView().byId("zname").getText();  //sObj.Zid;   // PIC ???

			var oTable = this.getView().byId("table_operation");
			var oTableData = oTable.getModel().getData().results;
			for(var i=0; i<oTableData.length; i++){
				if(oTableData[i].Steus == "PM01"){
					sObj.Arbei = oTableData[i].Dauno;
					break;
				}
			}
			//sObj.Arbei = this.getView().byId("aufnr").getValue();   //sObj.Arbei;  
			sObj.Addat = this.getView().byId("basic_from").getValue();  //sObj.Addat; // Basic Date from 
			sObj.Vaplz = this.getView().byId("woc").getSelectedKey(); // work center

			this._getDialog_workassign(sObj).open();
		},


		onClear : function(oEvent){
			window.location.reload();
		},

		onWorkResult: function(){
			var controll = this;

			var oModel = this.getView().getModel("ReadOrder");

			var sObj = {};
			sObj.Werks = this.getView().byId("swerk").getSelectedKey();
			sObj.Aufnr = this.getView().byId("aufnr").getValue();
			sObj.Werks = oModel.getData().Swerk;
			sObj.Aufnr = oModel.getData().Aufnr;
			sObj.Auart = oModel.getData().Auart;
			sObj.Equnr = oModel.getData().Equnr;
			sObj.Vaplz = oModel.getData().Vaplz;
			sObj.Qmnum = oModel.getData().Qmnum;

			if(sObj.Qmnum){
				sObj.Zbmind = oModel.getData().Zbmind;
				sObj.Qmart  = oModel.getData().Qmart;
			}else{
//				sObj.Zbmind = "BM";
sObj.Qmart  = "M1";
			}

			sObj.Arbeh  = oModel.getData().HdOperation.results[0].Arbeh;
			sObj.Gltrp = oModel.getData().Gltrp;
			sObj.Ilart = oModel.getData().Ilart;

			sObj.Stat  = oModel.getData().Stat;
			sObj.Ustat = oModel.getData().Ustat;

			sObj.Zid   = oModel.getData().HdOperation.results[0].PIC;

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

		onNotiDetail : function(oEvent){

			var v_swerk = this.oSwerk.getSelectedKey();
			var v_qmnum = this.getView().byId("noti").getValue();
			// Step 1: Get Service for app to app navigation
			var navigationService = sap.ushell.Container.getService('CrossApplicationNavigation');
			// Step 2: Navigate using your semantic object

			var hash = navigationService.hrefForExternal({
				target: {semanticObject : 'ZPM_SO_0090', action: 'display'},
				params: { param_mode: "D",
					param_swerk : v_swerk,
					param_qmnum : v_qmnum
				}
			});

			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);

		},


		onCreatePO : function(oEvent){
			this._getDialog_PoCreate().open();

		},


		onPrint : function(){

			var oModel = this.getView().getModel("print");
			var lange =  this.getLanguage();

			var v_swerk = this.oSwerk.getSelectedKey();
			var v_order = this.getView().byId("aufnr").getValue();

			var filterStr = "?$filter=Param1 eq '"+v_swerk+"' and Param2 eq '"+v_order+"'";
			var fname = "ZPM_RESERVATION_PDF";

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
		},

		onOrderPrint : function(){

			var oModel = this.getView().getModel("print");
			var lange =  this.getLanguage();

			var v_swerk = this.oSwerk.getSelectedKey();
			var v_order = this.getView().byId("aufnr").getValue();
			var v_qmnum = this.getView().byId("noti").getValue();

			var filterStr = "?$filter=Param1 eq '"+v_swerk+"' and Param2 eq '"+v_order+"' and Param3 eq '"+v_qmnum+"'";
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
		},

		//Combobox의 Validation을 체크  화면의 모든 combobox는   change 속성에서 해당 function을 호출 해 한다.
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

		},

		onInputChange : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];

			var err_chk = 0;

			var newValue = oEvent.getParameter("newValue");

			if(sIdstr == "rev"){
				var revData = this.oRev.getModel().getData().results;
				for(var i=0; i<revData.length; i++){
					if(newValue == revData[i].Key){
						this.getView().byId("revTx").setText(revData[i].Name);
						err_chk = 1;
						break;
					}
				}
			}

			if(err_chk == 0){
				oEvent.getSource().setValueState("Error");
				this.getView().byId("revTx").setText("");
			}else{
				oEvent.getSource().setValueState("None");
			}
		},

		/************************************************************
		 * Init_flagment popup event
		 ***********************************************************/
		onConfirmDialog_init : function(){

			if(!this.checkMandatory_init()){
				return;
			}

			if(this.param_qmnum){
				this._set_search_field_after();  
				this.setInitData_confirm();
				this.set_table_work_ctr();
				this.change_display();
				this.operationBtn_ctl();
				this.onAdd_operation("", "X");  //Notification에서 생성하는지??? 
						this.onAdd_materal();
			}else{
				this._set_search_field();
				this.setInitData_confirm();
				this.change_display();
				this.onAdd_operation();
				this.onAdd_materal();
			}

			this.set_auth_screen_ctrl();

			this.initDialog.close();

		},

		onCloseDialog_init : function(){

			if(this.initDialog){
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


		/************************************************************
		 * PoCreate_flagment popup event
		 ***********************************************************/
		onConfirmDialog_po : function(){

			if(!this.checkMandatory_po()){
				return;
			}

			//  this.PoDialog.close();
			this.createPO();

		},


		onCloseDialog_po : function(){

			if(this.PoDialog){
				this.PoDialog.close();
			}
		},


		checkMandatory_po : function(){
			var cnt = 0;
			var price_po = sap.ui.getCore().byId("price_po")

			if(price_po.getValue()){
				cnt = cnt + 1;
				price_po.setValueState("None"); 
			}else{
				cnt = cnt - 1;
				price_po.setValueState("Error"); 
			}

			var waers_po = sap.ui.getCore().byId("waers_po")
			if(waers_po.getSelectedKey()){
				cnt = cnt + 1;
				waers_po.setValueState("None");
			}else{
				cnt = cnt - 1;
				waers_po.setValueState("Error");
			}

			if(cnt == 2){
				return true;
			}else{
				sap.m.MessageBox.show(
						this.i18n.getText("check_mandatory"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return false; 
			}

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

						this.getView().byId("tplnr").setValue(aObj[0].TPLNR);
						this.getView().byId("tplnrTx").setText(aObj[0].PLTXT);

						oEqunr_init.setValue(aObj[0].EQUNR);
						oEqunr_init_tx.setText(aObj[0].EQKTX);

						if(this.equip_selrow){
							//this.getView().byId("invnr").setText(this.equip_selrow[0].INVNR);
							this.getView().byId("invnr").setValue(this.equip_selrow[0].INVNR);
							this.getView().byId("woc").setSelectedKey(this.equip_selrow[0].ARBPL);
							this.getView().byId("plg").setSelectedKey(this.equip_selrow[0].INGRP);
							this.getView().byId("coc").setValue(this.equip_selrow[0].KOSTL);
							this.getView().byId("cocTx").setText(this.equip_selrow[0].KOSTL_TXT);
							this.getView().byId("equnr").setValue(aObj[0].EQUNR);
							this.getView().byId("equnrTx").setText(aObj[0].EQKTX);
						}else{
							//this.getView().byId("invnr").setText("");
							this.getView().byId("invnr").setValue("");
							this.getView().byId("woc").setSelectedKey("");
							this.getView().byId("plg").setSelectedKey("");
							this.getView().byId("coc").setValue("");
							this.getView().byId("cocTx").setText("");
							this.getView().byId("equnr").setValue("");
							this.getView().byId("equnrTx").setText("");
						}

						var screenModel = this.getView().getModel("screenMode"); 
						if(aObj[0].ISBOM){
							screenModel.getData().bomEnable = true;
						}else{
							screenModel.getData().bomEnable = false;
						}
						screenModel.refresh();
					}
				}

				oEqunr_init.setValueState("None");
				sap.ui.getCore().byId("fl_init").setValueState("None");

			}else if(this.equnrName == "equnr"){
				var oEqunr = this.getView().byId("equnr");
				var oEqunrTx = this.getView().byId("equnrTx");

				if( oEqunr instanceof sap.m.MultiInput ){
					oEqunr.setTokens(aTokens);
				}else{
					oEqunr.setValueState("None");

					if(aObj.length >= 1){
						this.getView().byId("tplnr").setValue(aObj[0].TPLNR);
						this.getView().byId("tplnrTx").setText(aObj[0].PLTXT);

						oEqunr.setValue(aObj[0].EQUNR);
						oEqunrTx.setText(aObj[0].EQKTX);

						if(this.equip_selrow){
//							this.getView().byId("invnr").setText(this.equip_selrow[0].INVNR);
							this.getView().byId("woc").setSelectedKey(this.equip_selrow[0].ARBPL);
							this.getView().byId("plg").setSelectedKey(this.equip_selrow[0].INGRP);
							this.getView().byId("coc").setValue(this.equip_selrow[0].KOSTL);
							this.getView().byId("cocTx").setText(this.equip_selrow[0].KOSTL_TXT);
						}else{
//							this.getView().byId("invnr").setText("");
							this.getView().byId("woc").setSelectedKey("");
							this.getView().byId("plg").setSelectedKey("");
							this.getView().byId("coc").setValue("");
							this.getView().byId("cocTx").setText("");
						}

						var screenModel = this.getView().getModel("screenMode"); 
						if(aObj[0].ISBOM){
							screenModel.getData().bomEnable = true;
						}else{
							screenModel.getData().bomEnable = false;
						}
              
						screenModel.refresh();
					}
				}
			}
		},


		onClose_funcLocation : function(aTokens, aObj){  
			this.equip_selrow = [];
			this.equip_selrow = aObj;

			if(this.flName == "fl_init"){

				var oFl = sap.ui.getCore().byId("fl_init");
				var oFl_Tx = sap.ui.getCore().byId("fl_init_tx");

				if( oFl instanceof sap.m.MultiInput ){
					oFl.setTokens(aTokens);
				}else{
					oFl.setValue(aTokens[0].getKey());
					oFl_Tx.setText(aTokens[0].getText());

					this.getView().byId("tplnr").setValue(aTokens[0].getKey());
					this.getView().byId("tplnrTx").setText(aTokens[0].getText());
				}

				oFl.setValueState("None");

			}else if(this.flName == "tplnr"){
				var oFl = this.getView().byId("tplnr");
				var oFl_Tx = this.getView().byId("tplnrTx");

				if(oFl instanceof sap.m.MultiInput){
					this.getView().byId("tplnr").setTokens(aTokens);
				}else{
					oFl.setValue(aTokens[0].getKey());
					oFl_Tx.setText(aTokens[0].getText());
				}

				oFl.setValueState("None");
			}
		},


		/*onClose_equipBom : function(Selbom){

        var oTable_mat = this.getView().byId("table_material");

        var tableModel = oTable_mat.getModel();

        var last_posnr; 
        var odata = {};
        var list = [];

        var create_init;

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
          last_posnr = 0;
        }else{
          last_posnr = list[cnt].Posnr;
        }

        for(var i=0; i<Selbom.length; i++){
          var hdmat = {};

          last_posnr = parseInt(last_posnr) + 10;

          var new_posnr = last_posnr.toString();
          var str_length = new_posnr.length;

            if(str_length < 4){
              var zero_cnt = 4 - str_length;
              for(var j=0;j<zero_cnt;j++){
                new_posnr = "0" + new_posnr;
              }
            }

          hdmat.Posnr = new_posnr;
          hdmat.Vornr = "0010";
          hdmat.Matnr = Selbom[i].Matnr;
          hdmat.Maktx = Selbom[i].Maktx;
          hdmat.Lgobe = Selbom[i].LgortT;
          hdmat.Lgort = Selbom[i].Lgort;
          hdmat.Meins = Selbom[i].Meins;
          hdmat.Bdmng = Selbom[i].Menge;
          hdmat.Charg = Selbom[i].Charg;
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

      },*/

		onClose_equipBom : function(Selbom){

			this.add_select_material(Selbom);

		},


		onClose_searchMaterialStock : function(aTokens, aObj){

			this.add_select_material(aObj);

		},


		add_select_material : function(aObj){

			var oTable_mat = this.getView().byId("table_material");

			var tableModel = oTable_mat.getModel();

			var last_posnr; 
			var odata = {};
			var list = [];
			var tableList = [];

			var new_aObj = [];
//			debugger;
			if(tableModel.getData() != null ){

				odata = tableModel.getData();
				for(var i=0; i<odata.results.length; i++){
					if(odata.results[i].Matnr){
						tableList.push(odata.results[i]);
					}
				}
			}

			//기존 데이터 업데이트 
			for(var i=0; i<tableList.length; i++){
				var hdmat = {};

				hdmat.Posnr = tableList[i].Posnr;
				hdmat.Vornr = tableList[i].Vornr;
				hdmat.Matnr = tableList[i].Matnr;
				hdmat.Maktx = tableList[i].Maktx;
				hdmat.Lgobe = tableList[i].Lgobe;
				hdmat.Lgort = tableList[i].Lgort;
				hdmat.Meins = tableList[i].Meins;
				hdmat.Bdmng = tableList[i].Bdmng;
				hdmat.Spflag = tableList[i].Spflag;
				hdmat.Charg = tableList[i].Charg;
				hdmat.Mtart = tableList[i].Mtart;

				hdmat.Rsnum = tableList[i].Rsnum;
				hdmat.Rspos = tableList[i].Rspos;
				hdmat.ChargMode = tableList[i].ChargMode;

				for(var j=0; j<aObj.length; j++){

					if(aObj[j].Matnr == tableList[i].Matnr &&
							aObj[j].Lgort == tableList[i].Lgort &&
							aObj[j].Charg == tableList[i].Charg ){

						hdmat.Bdmng = aObj[j].Menge;

					}
				}

				if(hdmat.Mtart === "ERSA"){
					hdmat.ChargMode = true;
				}else{
					hdmat.ChargMode = false;
				}
				list.push(hdmat);
			}


			var cnt = tableList.length - 1;
			if(tableList.length < 1){
				last_posnr = 0;
			}else{
				last_posnr = tableList[cnt].Posnr;
			}

			//신규 데이터 추가
			for(var x=0; x<aObj.length; x++){
				var hdmat = {};
				var old = "";

				for(var y=0; y<tableList.length; y++){
					if(aObj[x].Matnr == tableList[y].Matnr &&
							aObj[x].Lgort == tableList[y].Lgort &&
							aObj[x].Charg == tableList[y].Charg ){

						old = "X";
						break;
					}
				}

				if(!old){  //새로 추가된 Row 

					last_posnr = parseInt(last_posnr) + 10;

					var new_posnr = last_posnr.toString();
					var str_length = new_posnr.length;

					if(str_length < 4){
						var zero_cnt = 4 - str_length;
						for(var j=0;j<zero_cnt;j++){
							new_posnr = "0" + new_posnr;
						}
					}

					hdmat.Posnr = new_posnr;
					hdmat.Vornr = "0010";
					hdmat.Matnr = aObj[x].Matnr;
					hdmat.Maktx = aObj[x].Maktx;
					hdmat.Lgobe = aObj[x].Lgobe;
					hdmat.Lgort = aObj[x].Lgort;
					hdmat.Meins = aObj[x].Meins;
					hdmat.Bdmng = aObj[x].Menge;
					hdmat.Spflag = aObj[x].Spflag;
					hdmat.Charg = aObj[x].Charg;
					hdmat.Mtart = aObj[x].Mtart;

					if(hdmat.Mtart === "ERSA"){
						hdmat.ChargMode = true;
					}else{
						hdmat.ChargMode = false;
					}
					list.push(hdmat);
				}
			}

			odata.results = list;

			var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
			oODataJSONModel.setData(odata);

			oTable_mat.setModel(oODataJSONModel);
			oTable_mat.bindRows("/results");

		},


		clear_operation_pic : function(){
			var oTableModel = this.getView().byId("table_operation").getModel();
			var oData = oTableModel.getData();

			for(var i=0; i<oData.results.length; i++){
				if(oData.results[i].Steus == "PM01"){
					oData.results[i].PIC = "";
				}
			}
			oTableModel.refresh();
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
				var apprName = "";
				if(window.location.hostname != "localhost"){
					apprName = this.getLoginId();  //this.getLoginInfo().getFullName();
				}else{
					apprName = "홍길동";
				}
				message = this.i18n.getText("reasonforreject") + 
				" (" + this.locDate + ") " + apprName +"  : " + '\n' + 
				sap.ui.getCore().byId("resaon").getValue();

				sap.ui.getCore().byId("resaon").setValue(message);      
				this.onSave("", "R");
				this._oDialog_Resaon.close();
			}
		},

		onCloseDialog_reason : function(oEvent){
			this._oDialog_Resaon.close();
		},


		/****************************************************************
		 *  ReqApproval_pop Event
		 ****************************************************************/
		_getDialog_reqapproval : function (sObj) {
			if (!this._oDialog_reqapproval) {
				this._oDialog_reqapproval = sap.ui.xmlfragment("cj.pm0110.view.ReqApproval_pop", this);
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
							controll.order_save("P", sObj);  //상신(Proposal 버튼 클릭 시 Mandatory 체크하고 있음 여기서 안해도 됨 
							//controll._reqapproval_Dialog_handler.onReqApproval(sObj);
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


		/****************************************************************
		 *  WorkAssign_pop Event
		 ****************************************************************/
		_getDialog_workassign : function (sObj) {
			if (!this._oDialog_workassign) {

				this._oDialog_workassign = sap.ui.xmlfragment("cj.pm0110.view.WorkAssign_pop", this);
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
							//controll.order_save("", "", "X");
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
			var s_aufnr = this.getView().byId("aufnr").getValue();

			var path = "/InputSet(Swerk='"+s_swerk+"',Qmnum='',Doknr='"+ doknr +"',Aufnr='"+ s_aufnr +"',RequestNo='')";

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
			var sRetMsg    = oEvent.getParameter("headers").retmsg;

			if (sRetType == "S") {
				sap.m.MessageBox.show(
						controll.i18n.getText("fileUploadSuccess"),
						sap.m.MessageBox.Icon.SUCCESS,
						controll.i18n.getText("success")
				);

				oEvent.getSource().setValue("");

				//첨부파일 다시 읽기 
				this.get_attach_file();
				this.getView().byId("order").setBusy(false);

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
			this.getView().byId("order").setBusy(true);
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

			var s_aufnr = this.getView().byId("aufnr").getValue();
			var s_swerk = this.oSwerk.getSelectedKey();

			var path = "/InputSet(Swerk='"+s_swerk+"',Qmnum='',Aufnr='"+ s_aufnr +"',Doknr='"+ doknr +"',RequestNo='')";
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

			oModel.attachRequestSent(function(){oFTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
				oFTable.setBusy(false);
				oFTable.setShowNoData(true);
			});

			var s_aufnr = this.getView().byId("aufnr").getValue();
			var s_swerk = this.oSwerk.getSelectedKey();

			var sPath;

			if (window.location.hostname == "localhost") {
				sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Qmnum='',Doknr='"+ doknr +"',Aufnr='"+s_aufnr + "',RequestNo='')/$value";
			} else {
				sPath = "/sap/opu/odata/sap/ZPM_GW_UPLOAD_SRV/InputSet(Swerk='"+s_swerk+"',Qmnum='',Doknr='"+ doknr +"',Aufnr='"+s_aufnr +"',RequestNo='')/$value";
			} 

			var html = new sap.ui.core.HTML();

			$(document).ready(function(){
				window.open(sPath);
			});

		},


		onBtnFileUpload : function(oEvent){

			if(this.getView().byId("aufnr").getValue() == ""){
				sap.m.MessageBox.show(
						this.i18n.getText("chk_upload_file_order"),
						sap.m.MessageBox.Icon.WARNING,
						this.i18n.getText("warning")
				);
				return;
			}

			var controll = this;

			var oModel = this.getView().getModel("fileUpload");

			var oUploader = this.getView().byId("fileUploader");
			var s_aufnr = this.getView().byId("aufnr").getValue();
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


		/****************************************************************
		 *  Local function
		 ****************************************************************/ 
		/*
		 * Dialog open
		 */
		_getDialog_init  : function(){
			var controll = this;

			if(!this.initDialog){
				this.initDialog = sap.ui.xmlfragment("cj.pm0110.view.Init_pop", this);
				this.getView().addDependent(this.initDialog);    
				/*this.initDialog.addEventDelegate({
                "onAfterRendering": function(){ 
                  console.log("init Dialog rendered");  
                   controll._set_search_field();  // set Search Help
                   controll.setInitData();
                }
                });*/
			}

			this.set_displayMode("C");

			this.initDialog.open();
			this.setInitData_init();
			this._set_search_field_init(); 

			if(this.param_qmnum){
				// set Search Help
				this._set_search_field();
				this.get_order_data();
			}
			//this.setInitData_confirm();
		},


		/*
		 * PO 생성 시 금액 입력  Dialog open
		 */ 
		_getDialog_PoCreate  : function(){
			var controll = this;

			if(!this.PoDialog){
				this.PoDialog = sap.ui.xmlfragment("cj.pm0110.view.PoCreate_pop", this);
				this.getView().addDependent(this.PoDialog);    

				this._set_search_field_po();
			}

			sap.ui.getCore().byId("price_po").setValue(this.getView().byId("expamount").getValue());
			sap.ui.getCore().byId("waers_po").setSelectedKey(this.getView().byId("ex_waers").getText());

			return this.PoDialog;
		},


		/*
		 * Reason for Reject Dialog open 
		 */
		_getDialog_ResaonReject : function(){

			if (!this._oDialog_Resaon) {
				this._oDialog_Resaon = sap.ui.xmlfragment("cj.pm0110.view.ResaonReject_pop", this);

				this.getView().addDependent(this._oDialog_Resaon);                   
			}

			return this._oDialog_Resaon;
		},


		_set_search_field_init : function() {
			var v_swerk = this.oSwerk_init.getSelectedKey();

			this.oOrt_init = sap.ui.getCore().byId("auart_init");       // Order Type
			if(this.oOrt_init){
				utils.set_search_field(v_swerk, this.oOrt_init, "ort", "C", "X", "");

				if(this.param_ort){
					this.oOrt_init.setSelectedKey(this.param_ort);
				}
			}

			this.oWoc_init = sap.ui.getCore().byId("woc_init");
			if(this.oWoc_init){
				utils.set_search_field(v_swerk, this.oWoc_init, "woc", "C", "", "");

				/*          if(this.param_woc){
            this.oWoc_init.setSelectedKey(this.param_woc);
          }*/
			}

			// 2018-09-08 husel, Init popup화면에서 Notification Type이 늦게 뜨는 원인 분석 및 조치 
			// Assembly(material data 92,857건) 데이터를 같이 읽어 오면서 영향을 받음
			// 이 부분은 Assembly Search Help 버튼이 클릭 시 데이터를 읽어오는 것으로 수정-> onValueHelpRequest로 이동 
//			this.oAsm_init = sap.ui.getCore().byId("asm_init");
//			if(this.oAsm_init){
//			utils.set_search_field("", this.oAsm_init, "asm", "H", "", "");
//			}
		},

		/* 
		 * PM Possible Entry Odata Set 
		 * 화면 초기 설정시 구성될 Search help만 넣어야 한다. 
		 */
		_set_search_field : function() {
			var v_swerk = this.oSwerk.getSelectedKey();

			this.oOrt = this.getView().byId("auart");       // Order Type
			if(this.oOrt){
				utils.set_search_field("", this.oOrt, "ort", "C", "", "");
			}

			//Priority
			this.oPri = this.getView().byId("pri");
			if(this.oPri){
				utils.set_search_field("", this.oPri, "pri", "C", "", "");
			}

//			//PM Activity type 의 경우 Order type에 따라 달라져야 하므로 Order type 변경시 가져오도록 수정 
			if(this.param_mode === "C"){
				var v_auart = this.oOrt_init.getSelectedKey();
			}else{
				var v_auart = this.oOrt.getSelectedKey();
			}
			if(v_auart){
				this.oAct = this.getView().byId("act"); 
				if(this.oAct){
					var v_notif = this.getView().byId("noti").getValue();

					utils.set_search_field(v_swerk, this.oAct, "ac2", "C", v_auart, v_notif);
				}
			}

			// 2018-09-08 husel, Init popup화면에서 Notification Type이 늦게 뜨는 원인 분석 및 조치 
			// Assembly(material data 92,857건) 데이터를 같이 읽어 오면서 영향을 받음
			// 이 부분은 Assembly Search Help 버튼이 클릭 시 데이터를 읽어오는 것으로 수정-> onValueHelpRequest로 이동 
			//Assembly
//			this.oAsm = this.getView().byId("asm");
//			if(this.oAsm){
//			utils.set_search_field("", this.oAsm, "asm", "H", "", "");
//			}

			//사용자의 Default Plant(swerk)와 선택된 Order의 Plant가 다를 수 있음 
			//생성시에는 가져옴, 수정 시에는 Order 번호가 존재 하므로 set_search_field_after() 에서 읽는다.
			if(this.param_mode == "C"){

				this.oWoc = this.getView().byId("woc");     // Work Center
				if(this.oWoc){
					utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
				}

				this.oPlg = this.getView().byId("plg");     // Planning Group
				if(this.oPlg){
					utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
				}

				//Purchasing organization
				this.oPuo = this.getView().byId("puo");
				if(this.oPuo){
					utils.set_search_field(v_swerk, this.oPuo, "puo", "C", "", "");
				}

				//Purchasing group
				this.oPug = this.getView().byId("pug");
				if(this.oPug){
					utils.set_search_field(v_swerk, this.oPug, "pug", "C", "", "");
				}

				//Storage Location
				this.oStl = this.getView().byId("stl");
				if(this.oStl){
					var oPage = this.getView().byId("order");
					utils.set_search_field(v_swerk, this.oStl, "stl", "H", "", "", "",oPage);
				}

				//Revision
				this.oRev = this.getView().byId("rev");
				if(this.oRev){
					utils.set_search_field(v_swerk, this.oRev, "rev", "H", "", "");
				}

			}

			/*        this.oPic = this.getView().byId("zname");       // Enployee ID
        if(this.oPic){
          utils.set_search_field(v_swerk, this.oPic, "pic", "C", "", "");
        }   */
		},


		_set_search_field_po : function() {
			var v_swerk = this.oSwerk.getSelectedKey();

			this.oCur = sap.ui.getCore().byId("waers_po");
			if(this.oCur){
				utils.set_search_field(v_swerk, this.oCur, "cur", "C", "", "");
			}

		},


		_set_search_field_after : function(){
			var v_swerk = this.getView().byId("swerk").getSelectedKey();
			//PM Activity type 의 경우 Order type에 따라 달라져야 하므로 Order type 변경시 가져오도록 수정 
			if(this.param_mode === "C"){
				var v_auart = this.oOrt_init.getSelectedKey();
			}else{
				var v_auart = this.oOrt.getSelectedKey();
			}
			if(v_auart){
				this.oAct = this.getView().byId("act"); 
				if(this.oAct){
					var v_notif = this.getView().byId("noti").getValue();
					utils.set_search_field(v_swerk, this.oAct, "ac2", "C", v_auart, v_notif);
				}
			}

			this.oWoc = this.getView().byId("woc");     // Work Center
			if(this.oWoc){
				utils.set_search_field(v_swerk, this.oWoc, "woc", "C", "", "");
			}

			this.oPlg = this.getView().byId("plg");     // Planning Group
			if(this.oPlg){
				utils.set_search_field(v_swerk, this.oPlg, "plg", "C", "", "");
			}

			//Purchasing organization
			this.oPuo = this.getView().byId("puo");
			if(this.oPuo){
				utils.set_search_field(v_swerk, this.oPuo, "puo", "C", "", "");
			}

			//Purchasing group
			this.oPug = this.getView().byId("pug");
			if(this.oPug){
				utils.set_search_field(v_swerk, this.oPug, "pug", "C", "", "");
			}

			//Storage Location
			this.oStl = this.getView().byId("stl");
			if(this.oStl){
				utils.set_search_field(v_swerk, this.oStl, "stl", "H", "", "");
			}

			//Revision
			this.oRev = this.getView().byId("rev");
			if(this.oRev){
				utils.set_search_field(v_swerk, this.oRev, "rev", "H", "", "");
			}


		},


		_get_default_external : function(activity, shotText){

			var lange = this.getLanguage();

			var oView = this.getView();
			var oModel = this.getView().getModel();
			var controll = this;

			var v_swerk = this.oSwerk.getSelectedKey();
			var v_auart = this.getView().byId("auart").getSelectedKey();

			oModel.attachRequestSent( function(){ controll.oOrderPage.setBusy(true);});
			oModel.attachRequestCompleted( function(){ controll.oOrderPage.setBusy(false);});

			var path = "/ExternalSet(Swerk='"+v_swerk+"',Spras='"+lange+"',Auart='"+v_auart+"')";

			var mParameters = {
					success : function(oData) {

						var v_swerk = this.getView().byId("swerk").getSelectedKey();
						var v_wares;
						for(var i=0; i<this.arr_swerk.length; i++){
							if(this.arr_swerk[i].Value === v_swerk){
								v_wares = this.arr_swerk[i].Add2;
								break;
							}
						}
						// 인니의 경우 USD로 되어 있지만 IDR로 무조건 처리 되도록 변경(2017.08.21)
						if(v_swerk.substring(0,1) == "3"){
							v_wares = "IDR";
						}
						// 말레이시아는 MYR 로 고정. --> 2019.05.21 by dams80.kim
						// 해당 로직은 위 IDR 과 함께 Plant Auth 정보 가져오는 Odata 로직에 넣으면 좋으나
						// 다른 페이지에 영향을 줄 수 있다고 판단(전종기님), 해당 페이지에만 적용시킴.
						if(v_swerk == "3020"){
							v_wares = "MYR";
						}
						
						controll.getView().byId("operation").setValue(activity);
						controll.getView().byId("qty").setValue("1");
						controll.getView().byId("meinh").setText("AU");
						controll.getView().byId("ex_waers").setText(v_wares);
						controll.getView().byId("workDesc").setValue(shotText);
						controll.getView().byId("puo").setSelectedKey(oData.Default.Ekorg);
						controll.getView().byId("pug").setSelectedKey(oData.Default.Ekgrp);
						controll.getView().byId("mag").setValue(oData.Default.Matkl);
						controll.getView().byId("mag_tx").setText(oData.Default.Wgbez);
						controll.getView().byId("costelemt").setValue(oData.Default.Sakto);
						controll.getView().byId("costelemttx").setText(oData.Default.SaktoTx);

					}.bind(this),
					error : function() {
						sap.m.MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								sap.m.MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);
					}.bind(this)
			};
			oModel.read(path, mParameters);
		},


		_set_inti_token_data : function(oData){

			/*         var oFl = this.getView().byId("tplnr");
         var keyname = oData.Pltxt + " (" + oData.Tplnr + ")";
         this._make_token(oFl, oData.Tplnr, keyname);

               var oWoc = this.getView().byId("woc");
               var keyname = oData.Woctx + " (" + oData.Vaplz + ")";
               this._make_token(oWoc, oData.Vaplz, keyname);

               var oEquip = this.getView().byId("equnr");
               var keyname = oData.Eqktx + " (" + oData.Equnr + ")";
               this._make_token(oEquip, oData.Equnr, keyname);

               var oCoc = this.getView().byId("coc");
               var keyname = oData.Ktext + " (" + oData.Kostl + ")";
               this._make_token(oCoc, oData.Kostl, keyname);

               var oWbs = this.getView().byId("wbs");
               var keyname = oData.Post1 + " (" + oData.Posid + ")";
               this._make_token(oWbs, oData.Posid, keyname);

               var oLfa = this.getView().byId("lfa");
               var keyname = oData.External.LifnrTx + " (" + oData.External.Lifnr + ")";
               this._make_token(oLfa, oData.External.Lifnr, keyname);*/

		},


		_make_token : function(Obj, key, value){
			if(key){
				var g_token = [];
				g_token = Obj.getTokens();

				g_token.push(new sap.m.Token({key: key, text: value}));     
				Obj.setTokens(g_token);
			}
		},


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