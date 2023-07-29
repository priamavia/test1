sap.ui.define([
               "cj/pm_m040/controller/BaseController",
               "cj/pm_m040/util/ValueHelpHelper",
               "cj/pm_m040/util/utils",
               "cj/pm_m040/model/formatter",
               "sap/ui/Device",
               "sap/ui/model/Filter",
               "sap/ui/model/FilterOperator",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageBox",
               "sap/m/MessageToast",
               "jquery.sap.global"
               ], function (BaseController, ValueHelpHelper, utils, formatter, Device, 
                   Filter, FilterOperator, JSONModel, MessageBox, MessageToast, jQuery) {
  "use strict";

  return BaseController.extend("cj.pm_m040.controller.Input", {
    formatter: formatter,
    /**
     * Boardled when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @public
     */
    onInit : function () {
      var oView = this.getView();

      var oComponent = this.getOwnerComponent();
      this.getView().addStyleClass(oComponent.getContentDensityClass());

      this._router = oComponent.getRouter();
//      this._router.getRoute("detail").attachMatched(this._onRouteMatched, this);

      var oTarget = this._router.getTarget("input");
      oTarget.attachDisplay(this._onRouteMatched, this);

      this.getView().setModel(new JSONModel(Device), "device");

      this.modelCount = 0;
    },

    _onRouteMatched : function (oEvent) {
      var controll = this;
      this.oArgs = oEvent.getParameter("data");   // //store the data

      this.i18n = this.getView().getModel("i18n").getResourceBundle();

      this.getLoginInfo();
      this.set_userData();
    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     */
    onBeforeRendering: function() {

	},

    onAfterRendering: function() {

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
                    "Add3" : oData.results[i].Add3
//                    "Add4" : oData.results[i].Add4,
//                    "Add5" : oData.results[i].Add5
                  }
              );
            }

            controll.set_UserInfo(userDefault);
            utils.makeSerachHelpHeader(this);

            controll.set_auth();
            controll.setInitData();            

          }.bind(this),
          error : function(oError) {
            if(Device.system.phone){
              MessageToast.show(this.i18n.getText("oData_conn_error"));
            }else{
              MessageBox.show(
                  this.i18n.getText("oData_conn_error"),
                  MessageBox.Icon.ERROR,
                  this.i18n.getText("error")
              );
            }

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
      this.arr_werks  = this.get_Auth("WERKS");
      this.locDate    = this.get_Auth("LOCDAT")[0].Value;
      this.locTime    = this.get_Auth("LOCTIM")[0].Value;
      this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
//      ""  1.234.567,89
//      X  1,234,567.89
//      Y  1 234 567,89
      this.decimalFormat = this.get_Auth("DECFOR")[0].Value;
      this.sep        = this.get_Auth("SEP")[0].Value;
    },
    /*
     * Plan Date Default Setting 
     */
    setInitData : function(){
    	
		// 파라미터로 넘겨받은 Asset No.를 이용하여 기본 데이터 조회한다. 
		// 자산실사 대상일 경우 head.Edit 값으로 자산실사 버튼을 활성화 시켜준다.
		var oModel = this.getView().getModel();

		// Set Range Condition ---------------------------------
		var s_filter = [];
		var s_bukrs = [];
		var s_anln1 = [];
		var s_anln2 = [];
		
		if(this.oArgs.iBukrs){
			s_bukrs.push(this.oArgs.iBukrs);
			s_filter.push(utils.set_filter(s_bukrs, "Bukrs"));
		}
		if(this.oArgs.iAnln1){
			s_anln1.push(this.oArgs.iAnln1);
			s_filter.push(utils.set_filter(s_anln1, "Anln1"));
		}
		if(this.oArgs.iAnln2){
			s_anln2.push(this.oArgs.iAnln2);
			s_filter.push(utils.set_filter(s_anln2, "Anln2"));
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
		
		var path = "/DetailSet";

		var mParameters = {
				urlParameters : {
					"$expand" : "",
					"$filter" : filterStr
				},
				success : function(oData) {

					var sPath = "";
					var Gos = "";
					
					if(oData.results[0].PcDoknr == ""){
						Gos = "A";
					}else{
						Gos = "E";
					}
					
					if (window.location.hostname == "localhost") {
						sPath = "http://gerpapd.cjwise.net:8020/sap/opu/odata/SAP/ZPM_GW_MGOS_SRV/InputSet(Gos='"+Gos+"',Bukrs='"+oData.results[0].Bukrs+"',Anln1='"+oData.results[0].Anln1+"',Anln2='"+oData.results[0].Anln2+"',Dokar='"+oData.results[0].PcDokar+"',Doknr='"+oData.results[0].PcDoknr+"',Dokvr='"+oData.results[0].PcDokvr+"',Doktl='"+oData.results[0].PcDoktl+"')/$value";
					} else {
						sPath = "/sap/opu/odata/sap/ZPM_GW_MGOS_SRV/InputSet(Gos='"+Gos+"',Bukrs='"+oData.results[0].Bukrs+"',Anln1='"+oData.results[0].Anln1+"',Anln2='"+oData.results[0].Anln2+"',Dokar='"+oData.results[0].PcDokar+"',Doknr='"+oData.results[0].PcDoknr+"',Dokvr='"+oData.results[0].PcDokvr+"',Doktl='"+oData.results[0].PcDoktl+"')/$value";
					}

					oData.results[0].ImageSrc = sPath;

					// 리스트에서 눌러서 들어 온 경우 조회모드처리. 
					if(this.oArgs.iLink){
						oData.results[0].Edit  = false;
						oData.results[0].Edit2 = false;						
					}

					// 조회모드일때는 업로드 버튼만 별도로 활성화
					if (oData.results[0].Edit) {
						oData.results[0].Edit3 = false;
					}else{
						oData.results[0].Edit3 = true;
					}
					
					var oODataJSONModel =  new sap.ui.model.json.JSONModel();
					oODataJSONModel.setData(oData.results[0]);
					this.getView().setModel(oODataJSONModel, 'header');

					var oTable = this.getView().byId("inputTable");
					var oModel =  new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oTable.setModel(oModel, 'QtyList');

				    this.getView().byId("fileUploader").setValue("");
				}.bind(this),
				error : function(oError) {
					if(Device.system.phone){
						MessageToast.show(this.i18n.getText("oData_conn_error"));				
					}else{
						MessageBox.show(
								this.i18n.getText("oData_conn_error"),
								MessageBox.Icon.ERROR,
								this.i18n.getText("error")
						);		
					}
				}.bind(this)
		};

		oModel.read(path, mParameters);

    },

	handleUploadComplete : function(oEvent){		
		MessageToast.show("Upload Complete");
		// this.setInitData();
		var myVar = setInterval(function(oEvent){
		  var href = window.location.href;
        window.location.replace(href);}, 100);
	},

	handleFileDialogClose : function(){
		MessageToast.show("After Dialog Close");				
	},
		
	handleValueChange : function(oEvent){

	},
	  
	/*
	 * Other Asset by press other
	 */
	onPress_otherAsset: function(){
		var result = this.checkMandatory();

		if(result){
			this.scanCode();
		}else{
			if(Device.system.phone){
				MessageToast.show(this.i18n.getText("check_mandatory"));				
			}else{
				MessageBox.show(
						this.i18n.getText("check_mandatory"),
						MessageBox.Icon.ERROR,
						this.i18n.getText("warning")
				);		
			}
		}							
	},

	handleTypeMissmatch: function(oEvent) {

		var aFileTypes = oEvent.getSource().getFileType();
		jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
		var sSupportedFileTypes = aFileTypes.join(", ");
		var message = "";
		message = this.i18n.getText("fielTypeMissmatch", [oEvent.getParameter("fileType")], [sSupportedFileTypes]);

		MessageToast.show(message);
	},

	onPress_fileUpload : function(oEvent){
		
		var controll = this;
		
		var oUploader = this.getView().byId("fileUploader");
		var sFileName = oUploader.getValue();
		if(!sFileName){
			MessageToast.show("No file to upload"); 
			return;
		}
		
		MessageBox.confirm("A photo will be uploaded. Continue?", 
				{
			title: "Confirm",
			onClose : function(oAction){
				if(oAction=="OK"){
					controll.onFileUpload();
				}else{
					MessageToast.show("Upload canceled.");
				}
			},
			styleClass: "",
			initialFocus: MessageBox.Action.OK,
			textDirection : sap.ui.core.TextDirection.Inherit }
		);
	},
	  
	onFileUpload : function(){

		var oUploader = this.getView().byId("fileUploader");
		var sFileName = oUploader.getValue();
		if(!sFileName){
			// Toast.show(this.i18n.getText("choosefileselect"));
			return;
		}
		
		var controll = this;
		var oHeader = this.getView().getModel("header").getData();
		var oModel = this.getView().getModel("fileUpload");

		if(oHeader.Bukrs == "" || oHeader.Anln1 == ""){
			
			return;
		}
				
		// insertHeaderParameter
		// addHeaderParameter
		oUploader.destroyHeaderParameters();
		oModel.refreshSecurityToken();
		
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "bukrs",
		value: encodeURIComponent(oHeader.Bukrs)		}));		
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "anln1",
		value: encodeURIComponent(oHeader.Anln1)		}));
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "anln2",
		value: encodeURIComponent(oHeader.Anln2)		}));
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "spmon",
		value: encodeURIComponent(oHeader.Spmon)		}));
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "round",
		value: encodeURIComponent(oHeader.Round)		}));
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "gos",
		value: encodeURIComponent("A")		}));		
		
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "slug",
		value: encodeURIComponent(sFileName)		}));
		
		oUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
		name: "x-csrf-token",
		value: oModel.getHeaders()['x-csrf-token'] })); //getSecurityToken()
		
		oUploader.setSendXHR(true);
		
		var path = oModel.sServiceUrl + "/InputSet";
		
		oUploader.setUploadUrl(path);
		oUploader.upload();

	},
	  
	scanCode: function() {
		this.codeScanned = false;
		var container = new sap.m.VBox({
			"width": "512px",
			"height": "384px"
		});
		var button = new sap.m.Button("", {
			text: "Cancel",
			type: "Reject",
			press: function() {
				dialog.close();
			}
		});
		var dialog = new sap.m.Dialog({
			title: "Scan Window",
			content: [
				container,
				button
			]
		});
		dialog.open();
		var video = document.createElement("video");
		video.autoplay = true;
		var that = this;
		qrcode.callback = function(data) {
			if (data !== "error decoding QR Code") {
				this.codeScanned = true;
				that._oScannedInspLot = data;
				dialog.close();
				window.location.replace(data);
			}
		}.bind(this);

		var canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 384;
		navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					facingMode: "environment",
					width: {
						ideal: 512
					},
					height: {
						ideal: 384
					}
				}
			})
			.then(function(stream) {
				video.srcObject = stream;
				var ctx = canvas.getContext('2d');
				var loop = (function() {
					if (this.codeScanned) {
						//video.stop();
						return;
					} else {
						ctx.drawImage(video, 0, 0);
						setTimeout(loop, 1000 / 30); // drawing at 30fps
						qrcode.decode(canvas.toDataURL());
					}
				}.bind(this));
				loop();
			}.bind(this));
//			.catch(function(error){
//				sap.m.MessageBox.error("Unable to get Video Stream");
//			});

		container.getDomRef().appendChild(canvas);
	},
	  
	onPress_auditInput : function(){
		
		var result = this.checkBeforeAudit();

		if(result){
			this.onSave();		
		
		}
	},

    onQtyChange : function(oEvent){
		var oGap = this.getView().byId("QtyDiff");
		var oQty = this.getView().byId("inputTable").getModel("QtyList");
		var iQty = oQty.getData();
		iQty.results[0].DiffChk = iQty.results[0].Menge - iQty.results[0].MengeChk;
	},
	  
	checkBeforeAudit : function() {
		// 
		var oGap = this.getView().byId("QtyDiff");
		var oQty = this.getView().byId("inputTable").getModel("QtyList");
		var iQty = oQty.getData();
		

		if(iQty.results[0].MengeChk == 0){
			MessageBox.show(
				"Qty 0 is invalid.",
				MessageBox.Icon.ERROR,
				this.i18n.getText("error")
			);

			return false;
		}

		
		return true;
	},


	onSave : function() {
		var controll = this;
		var oModel = this.getView().getModel();
	   	var iHeader = this.getView().getModel("header").getData();
		var iQty = this.getView().byId("inputTable").getModel("QtyList").getData();

		// oModel.attachRequestSent( function(){ controll.oOrderPage.setBusy(true);} );
		// oModel.attachRequestCompleted( function(){controll.oOrderPage.setBusy(false);} );

		var data = {};
		data = iHeader;
		data.MengeChk = iQty.results[0].MengeChk;
		data.DiffChk = "0";
		
		var path = "/DetailSet";
		var mParameters = {
				success : function(oData) {
					sap.m.MessageBox.show(
							"Save OK", 
							sap.m.MessageBox.Icon.SUCCESS,
							this.i18n.getText("success")
					);

					// 이곳에 리프레쉬 기능 추가여부 고민해보자. 
					var oUploader = this.getView().byId("fileUploader");
					var sFileName = oUploader.getValue();
					if(sFileName){
						controll.onFileUpload();	
					}else{
						controll.setInitData();
					}
					
				}.bind(this),
				error : function() {
					sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);
				}.bind(this)
		}
		oModel.create(path, data, mParameters);		
	},
	
    onNavBack: function (oEvent) {
	    var oView = this.getView();

		var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
		oODataJSONModel.setData({});
	    oView.setModel(oODataJSONModel, "header")

	    var oODataJSONModel_item =  new sap.ui.model.json.JSONModel();  
	    oODataJSONModel_item.setData({});
	    this.getView().byId("inputTable").setModel(oODataJSONModel_item, "QtyList")

	    oODataJSONModel.updateBindings(true);
	    oODataJSONModel.refresh(true);

	    oODataJSONModel_item.updateBindings(true);
	    oODataJSONModel_item.refresh(true);

//      sap.ui.getCore().byId("refresh")

//      this.getOwnerComponent().onNavBack(true);
      // in some cases we could display a certain target when the back button is pressed
	    if (this.oArgs && this.oArgs.fromTarget) {
	    	this._router.getTargets().display(this.oArgs.fromTarget,{
    		  	iBukrs  : null,
    		  	iAnln1  : null,
    		  	iAnln2  : null,
				iKostl  : this.oArgs.iKostl,
			    iNavBack : true
    	  	});
	    }

	    delete this.oArgs;
	    return;
      
      // call the parent's onNavBack
//      BaseController.prototype.onNavBack(this, arguments);
    },

	
    checkMandatory : function(){

		// 다른 자산 스캔 전에 현재 작업중인 사항에 대한 체크 및 진행여부 팝업 필요.
		
    	return true;

    },
    
	onSelectionChange : function(oEvent){
		
		var key = oEvent.getParameter("key");

		var oHead = this.getView().getModel("header");
		var iEdit = oHead.getData();
		
		if(key == "Y"){
			iEdit.Edit2 = false;
		}else{
			iEdit.Edit2 = true;			
		}
	},
    
    _handleLogout:function(oEvent){
      $.ajax({  
        type: "GET",  
        url: "/sap/public/bc/icf/logoff",  //Clear SSO cookies: SAP Provided service to do that  
      }).done(function(data){ //Now clear the authentication header stored in the browser  
        if (!document.execCommand("ClearAuthenticationCache")) {  
          //"ClearAuthenticationCache" will work only for IE. Below code for other browsers  
          $.ajax({  
            type: "GET",  
            url: "/sap/public/bc/icf/logoff", //any URL to a Gateway service  
            username: '', //dummy credentials: when request fails, will clear the authentication header  
            password: '',  
            statusCode: { 401: function() {  
              //This empty handler function will prevent authentication pop-up in chrome/firefox  
            } },  
            error: function() {  
              //alert('reached error of wrong username password')  
            }  
          });  
        }  
      });
      var myVar = setInterval(function(oEvent){
		  var href = window.location.href;
        window.location.replace(href);}, 100);
    }

  });
}
);