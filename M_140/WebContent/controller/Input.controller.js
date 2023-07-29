sap.ui.define([
               "cj/pm_m140/controller/BaseController",
               "cj/pm_m140/util/ValueHelpHelper",
               "cj/pm_m140/util/utils",
               "cj/pm_m140/model/formatter",
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

  return BaseController.extend("cj.pm_m140.controller.Input", {
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

		var oModel = this.getView().getModel();
		var iWerks = this.oArgs.iWerks;
		var iLgort = this.oArgs.iLgort;
		var iMatnr = this.oArgs.iMatnr;
			
		var path 		= "/HeadSet(Mode='D',Werks='"+iWerks+"',Lgort='"+iLgort+"',Matnr='"+iMatnr+"')";
		var mParameters = {
				urlParameters : {
					"$expand" : "NavList,NavLgort,NavMatkl,NavSpmon,NavSubtyp"
				},
				success : function(oData) {
					if(oData.Rttyp != "E"){

						if(this.oArgs.iLink){
							oData.Edit    = false;
							oData.Visible = false;
						}
						
						// Header -------------------------------------------------
						var oODataJSONModel =  new sap.ui.model.json.JSONModel();
						oODataJSONModel.setData(oData);
						this.getView().setModel(oODataJSONModel, 'header');

						// Qty ----------------------------------------------------
						var oTable = this.getView().byId("inputTable");
						var oModel = new sap.ui.model.json.JSONModel();
						var data = {
							"results" : [
								{
									"Meins" : oData.Meins,
									"Labst" : oData.Labst,
									"Menge" : oData.Menge,
									"BadMenge" : oData.BadMenge,
									"DiffChk" : oData.Labst - oData.Menge,
									"Stat2" : oData.Stat2
								}
							]
						};

						oModel.setData(data);
						oTable.setModel(oModel, 'QtyList');

						// Stock List ---------------------------------------------
						var oList = this.getView().byId("stockTable");
						var oModel = new JSONModel();
						oModel.setData(oData.NavList);
						oList.setModel(oModel, 'StockList');

						// Last M.Doc.
						var oTable = this.getView().byId("documentTable");
						var oModel = new sap.ui.model.json.JSONModel();
						var docu = {
							"results" : [
								{
									"Budat" : oData.Budat,
									"Bwtar" : oData.Bwtar,
									"Menge" : oData.MengeL,
									"Meins" : oData.MeinsL,
									"Umlgo" : oData.Umlgo
								}
								
							]
						};

						oModel.setData(docu);
						oTable.setModel(oModel, 'DocumentList');
					}else{
						MessageToast.show(this.i18n.getText("noAuditPlan"));						
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

	handleUploadComplete : function(oEvent){
		this.setInitData();
		MessageToast.show("Upload Complete");
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
	onStat2Press : function(oEvent){
		// var oSelectedItem 	= oEvent.getSource().getParent();
		// var path 			= oSelectedItem.getBindingContext("QtyList").getPath();
		// var oTable			= this.getView().byId("inputTable");
		// var oListModel 		= oTable.getModel();
		// var obj 			= oListModel.getProperty(path);
		
		// var oQty = this.getView().byId("inputTable").getModel("QtyList");
		// var iQty = oQty.getData();
		// if(oEvent.getParameter("pressed")){
		// 	iQty.results[0].Stat2Text = "Good";
		// }else{
		// 	iQty.results[0].Stat2Text = "Bad";
		// }

		// oQty.refresh();
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
		var oQty = this.getView().byId("inputTable").getModel("QtyList");
		var iQty = oQty.getData();
		iQty.results[0].DiffChk = iQty.results[0].Labst - iQty.results[0].Menge;
	},
	  
	checkBeforeAudit : function() {
		var oQty = this.getView().byId("inputTable").getModel("QtyList");
		var iQty = oQty.getData();
		if( parseFloat(iQty.results[0].Menge) < parseFloat(iQty.results[0].BadMenge) ){
			sap.m.MessageBox.show(
							this.i18n.getText("BadQtyOver"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
					);
			
			return false;	
		}

		if( parseFloat(iQty.results[0].Menge) == 0 && parseFloat(iQty.results[0].Labst) == 0 ){
			sap.m.MessageBox.show(
							"Stock and Input are 0, it is not an input target.",
							sap.m.MessageBox.Icon.ERROR,
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
		data.Stat2 = iQty.results[0].Stat2;
		data.Menge = iQty.results[0].Menge;
		data.BadMenge = iQty.results[0].BadMenge;
		data.NavLgort = []; // Not Use.		
		data.NavList = []; // Not Use.		
		data.NavMatkl = []; // Not Use.		
		data.NavSpmon = []; // Not Use.		
		data.NavSubtyp = []; // Not Use.		
		
		var path = "/HeadSet";
		var mParameters = {
				success : function(oData) {
					sap.m.MessageBox.show(
							"Save OK", 
							sap.m.MessageBox.Icon.SUCCESS,
							this.i18n.getText("success")
					);

					// 이곳에 리프레쉬 기능 추가여부 고민해보자. 
					controll.setInitData();
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
    		  	iWerks  : null,
    		  	iLgort  : null,
    		  	iMatnr  : null,
			    iNavBack : true,
				iLink   : this.oArgs.iLink
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
		
		if(key == "O"){
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
        window.location.replace("/sap/bc/ui5_ui5/sap/ypm_ui_m002/index.html");}, 100);
    }

  });
}
);