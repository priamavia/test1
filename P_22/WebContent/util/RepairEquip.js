sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"cj/pm0130/util/ValueHelpHelper",
	"cj/pm0130/util/utils"
], function(Object, JSONModel, Filter, FilterOperator, Toast, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0130.util.RepairEquip", { 
		Dailog_ra : [],
		arr_swerk_ra : [],
		arr_kostl_ra : [],
		arr_korks_ra : [],
		
		constructor: function(oDailog, Main) {
          this.Dailog_re = oDailog;
          
          this.oMain = Main;
          this.selAufnr = null;
                  
          this.arr_swerk_re = this.oMain.arr_swerk;
          this.arr_kostl_re = this.oMain.arr_kostl;
		  this.arr_kokrs_re = this.oMain.arr_kokrs;
		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep;     
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
          
//			var oComponent = this.oMain.getOwnerComponent();
//			this.getView().addStyleClass(oComponent.getContentDensityClass());	          
		},
		
		setHeader : function(sMode, sObj){
			var controll = this;
			 
			controll.setInitElements();
			controll.setInitData();
			
			if(sObj){
				controll.readInitData(sMode, sObj);
			}else{		
				controll.setServiceType(true);
				controll.setMainType(true);	
				controll.setBtnElements();				
			}					
		},
		
		setInitElements : function(){
		    this.PlanDateOut  = sap.ui.getCore().byId("PlanDateOut_re");				
		    this.PlanDateIn   = sap.ui.getCore().byId("PlanDateIn_re");
		    
		    this.PlanDateOut.setDisplayFormat(this.dateFormat);
		    this.PlanDateOut.setValueFormat("yyyyMMdd");
		    
		    this.PlanDateIn.setDisplayFormat(this.dateFormat);
		    this.PlanDateIn.setValueFormat("yyyyMMdd");
		    
		    this.Zcrldate = sap.ui.getCore().byId("Zcrldate_re");
		    this.Zcrltime = sap.ui.getCore().byId("Zcrltime_re");
		    this.Zcrname = sap.ui.getCore().byId("Zcrname_re");
		    
		    this.Zcrldate.setDisplayFormat(this.dateFormat);
		    this.Zcrldate.setValueFormat("yyyyMMdd");
    
		    this.ActualDateOut  = sap.ui.getCore().byId("ActualDateOut_re");
		    this.ActualTimeOut  = sap.ui.getCore().byId("ActualTimeOut_re");
		    this.PersonOut		= sap.ui.getCore().byId("PersonOut_re");
		    this.ActualDateIn   = sap.ui.getCore().byId("ActualDateIn_re");
		    this.ActualTimeIn   = sap.ui.getCore().byId("ActualTimeIn_re");
		    this.PersonIn   	= sap.ui.getCore().byId("PersonIn_re");
		    
		    		    
		    this.ActualDateOut.setDisplayFormat(this.dateFormat);
		    this.ActualDateOut.setValueFormat("yyyyMMdd");
		    
		    this.ActualDateIn.setDisplayFormat(this.dateFormat);
		    this.ActualDateIn.setValueFormat("yyyyMMdd");	
		    
		    this.Zcrname_re 	= sap.ui.getCore().byId("Zcrname_re");	
		    
		    
		    this.ServiceType_re = sap.ui.getCore().byId("ServiceType_re");
		    if(!this.ServiceType_re.getSelectedIndex()){
		    	this.ServiceType_re.setSelectedIndex(0);
		    }
		    
		    this.lbleblen_re 	= sap.ui.getCore().byId("lbleblen_re");
		    this.ebeln_re 		= sap.ui.getCore().byId("ebeln_re");
		    this.txz01_re       = sap.ui.getCore().byId("txz01_re");
		    this.lbllifnr_re 	= sap.ui.getCore().byId("lbllifnr_re");
		    this.lifnr_re 		= sap.ui.getCore().byId("lifnr_re");
		    
		    
		    this.MainType_re 	= sap.ui.getCore().byId("MainType_re");
		    if(!this.MainType_re.getSelectedIndex()){
		    	this.MainType_re.setSelectedIndex(0);
		    }
		    
		    this.MainType_re.setSelectedIndex(0);
		    this.equnr_re 		= sap.ui.getCore().byId("equnr_re");
		    this.matnr_re 		= sap.ui.getCore().byId("matnr_re");	
		    
		    this.bntBom    		= sap.ui.getCore().byId("bntBom");
		    this.bntBom.setEnabled(false);    
		    
		    this.fileUploader 	= sap.ui.getCore().byId("fileUploader");
		    this.btnUpload     	= sap.ui.getCore().byId("btnUpload");
		    this.table_file 	= sap.ui.getCore().byId("table_file");		    
		    	    
		    this.Save    		= sap.ui.getCore().byId("Save");
		    this.Delete    		= sap.ui.getCore().byId("Delete");
		    this.ConfirmOut    	= sap.ui.getCore().byId("ConfirmOut");
		    this.ConfirmIn    	= sap.ui.getCore().byId("ConfirmIn");
		    
		    this.RequestNo      = sap.ui.getCore().byId("RequestNo_re");	
		    this.ActualDateOut  = sap.ui.getCore().byId("ActualDateOut_re");
		    this.ActualDateIn  = sap.ui.getCore().byId("ActualDateIn_re");

		    this.btnAdd = sap.ui.getCore().byId("btnAdd");
		    this.btnDelete = sap.ui.getCore().byId("btnDelete");	
		    
		    sap.ui.getCore().byId("table_file").setVisibleRowCount(1);
		},
		
		setInitData : function(){
		    
			this.oSwerk_re = sap.ui.getCore().byId("swerk_re");
			
			var default_swerk;				
			if(!this.oSwerk_re.getSelectedItem()){
				
				for(var j=0; j<this.arr_swerk_re.length; j++){
					var template = new sap.ui.core.Item();
				    template.setKey(this.arr_swerk_re[j].Value);
			        template.setText(this.arr_swerk_re[j].KeyName);
		            this.oSwerk_re.addItem(template);
		            
		            if(this.arr_swerk_re[j].Default === "X"){
		            	default_swerk = j;
		            }
				}
	            
				this.oSwerk_re.setSelectedKey(this.arr_swerk_re[default_swerk].Value); //Default Value Setting
			
			}else{
				this.oSwerk_re.setSelectedKey(this.oSwerk_re.getSelectedItem().getProperty("key"));
			}	
			
//		    this.fromDate = this.oMain.formatter.strToDate(this.locDate);
//		    this.fromTime = this.oMain.formatter.strToTime(this.locTime);			
//
//		    this.PlanDateOut.setDateValue( this.fromDate );							
//		    this.PlanDateIn.setDateValue( this.fromDate );	

			this.PlanDateOut.setValue( this.locDate );							
		    this.PlanDateIn.setValue( this.locDate );							
		},		
		
		setServiceType : function(vBool) {
			if(this.ServiceType_re.getSelectedIndex() === 0){
				this.lbleblen_re.setRequired(true);
				this.ebeln_re.setRequired(true);
				this.ebeln_re.setEditable(true);
				this.lbllifnr_re.setRequired(false);
				this.lifnr_re.setRequired(false);
				this.lifnr_re.setEditable(false);
				
				if(vBool){
					this.lifnr_re.removeAllTokens();
				}
				
			}else{
				this.lbleblen_re.setRequired(false);
				this.ebeln_re.setRequired(false);	
				this.ebeln_re.setEditable(false);
				this.lbllifnr_re.setRequired(true);
				this.lifnr_re.setRequired(true);
				this.lifnr_re.setEditable(true);
				
				this.ebeln_re.setValue("");
				this.txz01_re.setText("");
				
			}					
		},
		
		setMainType : function(vBool){
			if(this.MainType_re.getSelectedIndex() === 0){
				this.equnr_re.setVisible(true);
				this.equnr_re.setRequired(true);
				this.matnr_re.setVisible(false);
				this.matnr_re.setRequired(false);

				if(vBool){
					this.matnr_re.removeAllTokens();
				}
			}else{
				this.equnr_re.setVisible(false);
				this.equnr_re.setRequired(false);
				this.matnr_re.setVisible(true);	
				this.matnr_re.setRequired(true);
				
				if(vBool){
					this.equnr_re.removeAllTokens();
				}
			}			
		},
				
		setBtnElements : function(){	    
		    if(this.RequestNo.getValue()){
		    	this.oSwerk_re.setEnabled(false);
		    	
		    	if(this.ActualDateIn.getValue()){
			    	this.Save.setEnabled(false); 
			    	this.Delete.setEnabled(false);
				    this.ConfirmOut.setEnabled(false);
				    this.ConfirmIn.setEnabled(false);
				    
				    this.setHeaderLock(false);
				    this.setAttachFileLock(false)
				    this.set_filedelete_mode(false);
		    	}else if(this.ActualDateOut.getValue()){
			    	this.Save.setEnabled(false); 
			    	this.Delete.setEnabled(false);
				    this.ConfirmOut.setEnabled(false);
				    this.ConfirmIn.setEnabled(true);
				    
				    this.setHeaderLock(false);
				    this.setAttachFileLock(true)
				    this.set_filedelete_mode(true);
		    	}else{
			    	this.Save.setEnabled(true); 
			    	this.Delete.setEnabled(true);
				    this.ConfirmOut.setEnabled(true);
				    this.ConfirmIn.setEnabled(false);
				    
				    this.setHeaderLock(true);
				    this.setAttachFileLock(true)
				    this.set_filedelete_mode(true);
		    	}
		    }else{
		    	this.oSwerk_re.setEnabled(true);
		    	
		    	this.Save.setEnabled(true); 
		    	this.Delete.setEnabled(false);
			    this.ConfirmOut.setEnabled(false);
			    this.ConfirmIn.setEnabled(false);
			    
			    this.setAttachFileLock(false)
			    this.set_filedelete_mode(false);
		    }
		},
		
		setHeaderLock : function(vBool){
		    this.PlanDateOut.setEnabled(vBool);
		    this.PlanDateIn.setEnabled(vBool);
		    this.ServiceType_re.setEnabled(vBool);	    
		    this.ebeln_re.setEnabled(vBool);
		    this.lifnr_re.setEnabled(vBool);
		    this.MainType_re.setEnabled(vBool);
		    
		    //this.MainType_re.setSelectedIndex(0);
		    this.equnr_re.setEnabled(vBool);
		    this.matnr_re.setEnabled(vBool);	
		    //this.bntBom.setEnabled(vBool);    
		    this.btnAdd.setEnabled(vBool);  
		    this.btnDelete.setEnabled(vBool);
		},
		
		setAttachFileLock : function(vBool){
		    this.fileUploader.setEnabled(vBool);
		    this.btnUpload.setEnabled(vBool);			
		},		
		
		set_filedelete_mode : function(vBool){
			var oView = this.oMain.getView();

			oView.setModel(new JSONModel({
				fileDelete : vBool
			}), "repairEquip");	
		},
		
		checkPlandate : function(){
			var _check = true;
			
			if(parseInt(this.PlanDateIn.getValue()) < parseInt(this.PlanDateOut.getValue())){
				this.PlanDateIn.setValueState("Error");
				this.PlanDateIn.setValueState("Error");
				_check = false;
			}else{
				this.PlanDateIn.setValueState("None");
				this.PlanDateIn.setValueState("None");				
			}
			
			return _check;
		},
		
		checkMandatory : function(){
			var _check = true;
			
			
			// Plan Date Check
			_check = this.checkPlandate();
			
			if(this.ServiceType_re.getSelectedIndex() === 0){
				//P/O Check				
		    	if(this.ebeln_re.getValue()){
		    		this.ebeln_re.setValueState("None");
		    	}else{
		    		this.ebeln_re.setValueState("Error");
		    		_check = false;
		    	}
		    		
			}else{
				//Vendor Check
		    	var oLifnr = this.lifnr_re.getTokens();
		    	
		    	if(oLifnr.length > 0){
		    		this.lifnr_re.setValueState("None");
		    	}else{
		    		this.lifnr_re.setValueState("Error");
		    		_check = false;
		    	}
			}
			
			if(this.MainType_re.getSelectedIndex() === 0){
				//Equipment Check				
		    	var oEqunr = this.equnr_re.getTokens();
		    	
		    	if(oEqunr.length > 0){
		    		this.equnr_re.setValueState("None");
		    	}else{
		    		this.equnr_re.setValueState("Error");
		    		_check = false;
		    	}
		    		
			}else{
				//Material Check
		    	var oMatnr = this.matnr_re.getTokens();
		    	
		    	if(oMatnr.length > 0){
		    		this.matnr_re.setValueState("None");
		    	}else{
		    		this.matnr_re.setValueState("Error");
		    		_check = false;
		    	}
			}
			
			var oTable_mat = sap.ui.getCore().byId("table_material");
			
			if(oTable_mat.getModel().getData() != null){
		    	for(var j=0; j<oTable_mat.getModel().getData().results.length; j++){
		    		if(oTable_mat.getModel().getData().results[j].Matnr == ""){
		    			oTable_mat.getModel().getData().results[j].MatErr = "Error";	
		    			_check = false;
		    		}else{
		    			oTable_mat.getModel().getData().results[j].MatErr = "None";
		    		}
		    		
		    		if( !parseInt(oTable_mat.getModel().getData().results[j].Bdmng) ||
		    		     parseInt(oTable_mat.getModel().getData().results[j].Bdmng) < 0){
		    			oTable_mat.getModel().getData().results[j].QtyErr = "Error";	
		    			_check = false;
		    		}else{
		    			oTable_mat.getModel().getData().results[j].QtyErr = "None";

		    		}
		    	}
		    	oTable_mat.getModel().refresh();
			}
	    
			return _check;			
		},
		
		onSave : function(sMode){
			// Check logic ÇÊ¿ä
			if(this.checkMandatory()){
				this.onSaveData(sMode);
			}
		},
			
		onConfirmIn : function(sMode){
				this.onSaveData(sMode);
		},		
		
		onDelete : function(sMode){
				this.onSaveData(sMode);
				
				this.oMain.onCancelInRepairEquipDialog();
		},		
	
		onSaveData : function(sMode){
				var oModel = this.oMain.getView().getModel("equiFactory");
					
				var controll = this;				
				var oTable =  sap.ui.getCore().byId("table_material");
				
				oModel.attachRequestSent(function(){oTable.setBusy(true);});
				oModel.attachRequestCompleted(function(){oTable.setBusy(false);});
				
				var data = {};

				//		    //Header Info
				data.Mode        	= sMode;
				data.Spras          = this.oMain.getLanguage();
				data.RequestNo   	= this.RequestNo.getValue();
				data.Status      	= '';
				data.Swerk       	= this.oSwerk_re.getSelectedKey();
				data.PlanDateOut	= this.PlanDateIn.getValue();
				data.PlanDateIn		= this.PlanDateIn.getValue();
				data.ActualDateIn   = '';
				data.ActualTimeIn   = '';
				data.PersonIn       = '';
				
				if(this.ActualDateOut.getValue()){
					data.ActualDateOut	= this.ActualDateOut.getValue();
					data.ActualTimeOut	= this.ActualTimeOut.getValue();
					data.PersonOut		= this.PersonOut.getValue();					
				}else{
					data.ActualDateOut	= '';
					data.ActualTimeOut	= '';
					data.PersonOut		= '';					
				}
								
		        data.Ebeln = this.ebeln_re.getValue();
	
		    	var oLifnr = this.lifnr_re.getTokens();
		    	for(var j=0; j<oLifnr.length; j++){
		    		data.Lifnr = oLifnr[j].getProperty("key");
		    	}
		    				
				if(this.ServiceType_re.getSelectedIndex() === 0){
					data.ServiceType = 'S';
				}else{
					data.ServiceType = 'W';
				}
				
				if(this.MainType_re.getSelectedIndex() === 0){
					data.MainType = 'E';
					
			    	var oEqunr = this.equnr_re.getTokens();
			    	for(var j=0; j<oEqunr.length; j++){
			    		data.TechObject = oEqunr[j].getProperty("key");
			    	}
					
				}else{
					data.MainType = 'S';
					
			    	var oMatnr = this.matnr_re.getTokens();
			    	for(var j=0; j<oMatnr.length; j++){
			    		data.TechObject = oMatnr[j].getProperty("key");
			    	}				
				}	
	
				data.PlanDateOut	= this.oMain.formatter.dateToStr(this.PlanDateOut.getDateValue());
				data.PlanDateIn		= this.oMain.formatter.dateToStr(this.PlanDateIn.getDateValue());
				
				if(sMode != "C"){
					var hearder = controll.Dailog_re.getModel("header").oData;
					
					data.Zcrname		= hearder.Zcrname;
					data.Zcrsdate       = hearder.Zcrsdate;
					data.Zcrstime       = hearder.Zcrstime;					
					data.Zcrldate       = hearder.Zcrldate;
					data.Zcrltime       = hearder.Zcrltime;					
					
//					data.Zcrldate       = this.oMain.formatter.dateToStr(this.Zcrldate.getDateValue());
//					data.Zcrltime       = this.Zcrltime.getValue();					
//				}else{
//					data.Zcrname		= this.Zcrname.getValue();					
				}

				
				data.RetType      	= '';
				data.RetMsg			= '';
									
			    data.ResultList = [];
			    
				var oTable_mat = sap.ui.getCore().byId("table_material");
				if(oTable_mat.getModel().getData() != null){
			    	for(var j=0; j<oTable_mat.getModel().getData().results.length; j++){
			    		var item = {};
			    		
			    		item.RequestNo = this.RequestNo.getValue();
			    		item.Serial    = oTable_mat.getModel().getData().results[j].Serial;
			    		item.SortNo    = (j+1).toString();
			    		item.Matnr     = oTable_mat.getModel().getData().results[j].Matnr;
			    		item.Maktx     = oTable_mat.getModel().getData().results[j].Maktx;
			    		item.Bdmng	   = oTable_mat.getModel().getData().results[j].Bdmng;
			    		item.Meins     = oTable_mat.getModel().getData().results[j].Meins;
			    		item.MatErr    = "";
			    		item.QtyErr    = "";
						item.Zcrldate  = oTable_mat.getModel().getData().results[j].Zcrldate;
						item.Zcrltime  = oTable_mat.getModel().getData().results[j].Zcrltime;
						item.Zcrname   =  oTable_mat.getModel().getData().results[j].Zcrname;
						item.Zcrsdate  = oTable_mat.getModel().getData().results[j].Zcrsdate;
						item.Zcrstime  = oTable_mat.getModel().getData().results[j].Zcrstime;   		
			    		
						data.ResultList.push(item);		    		
			    	}
		    	}
		    	
					var mParameters = {
					success : function(oData) {
									
					 var oHeaderJSONModel =  new sap.ui.model.json.JSONModel();
					 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
					 var msg = "";
					 
					 oHeaderJSONModel.setData(oData);
					 oODataJSONModel.setData(oData.ResultList);

					 controll.Dailog_re.setModel(oHeaderJSONModel, "header");

					 oTable.setModel(oODataJSONModel);
					 oTable.bindRows("/results");
						 
					 					 
					 if(oData.RetType == "E"){
						 
						 if(data.MainType == 'E'){
							 msg = controll.i18n.getText("equipmentSaveError")
						 }else{
							 msg = controll.i18n.getText("sparePartsSaveError")
						 }
						 
						 sap.m.MessageBox.show(
								 msg, //oData.RetMsg,
								 sap.m.MessageBox.Icon.ERROR,
								 controll.i18n.getText("error")
							);
						 
					 }else{
						 
						 if(data.MainType == 'E'){
							 msg = controll.i18n.getText("equipmentSaveSuccess")
						 }else{
							 msg = controll.i18n.getText("sparePartsSaveSuccess")
						 }
						 
						 sap.m.MessageBox.show(
							     msg, //oData.RetMsg,
								 sap.m.MessageBox.Icon.SUCCESS,
								 controll.i18n.getText("success")
							);	
						 
						 this.setBtnElements();						 
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
		
		readInitData : function(sMode, sObj){
			var oModel = this.oMain.getView().getModel("equiFactory");
			var controll = this;
			var lange  = this.oMain.getLanguage();
			var oTable =  sap.ui.getCore().byId("table_material");

			oModel.attachRequestSent(function(){oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){
												oTable.setBusy(false);
												oTable.setShowNoData(true);
			});
												
			var s_filter = [];

			var filterStr;
			for(var i=0; i<s_filter.length; i++){
				
				if(i === 0){
					filterStr = s_filter[i];
				}else{
					filterStr = filterStr + " and " + s_filter[i];
				}
			}
			
			if(filterStr === undefined){
				filterStr = "";
			}
					
			var path = "/InputSet(Mode='"+sMode+"',Spras='"+lange+"',RequestNo='"+sObj.RequestNo+"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "ResultList",
					"$filter" : filterStr
				},
				success : function(oData) {
					
				 //debugger;
					
				 var oHeaderJSONModel =  new sap.ui.model.json.JSONModel();
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 
				 oHeaderJSONModel.setData(oData);
				 oODataJSONModel.setData(oData.ResultList);

				 controll.Dailog_re.setModel(oHeaderJSONModel, "header");
				 
				 oTable.setModel(oODataJSONModel);
				 oTable.bindRows("/results");
					 
				 					 
				 if(oData.RetType == "E"){
//					 sap.m.MessageBox.show(
//						     oData.RetMsg,
//							 sap.m.MessageBox.Icon.ERROR,
//							 controll.i18n.getText("error")
//						);
					 
				 }else{
/*					 sap.m.MessageBox.show(
						     oData.RetMsg,
							 sap.m.MessageBox.Icon.SUCCESS,
							 controll.i18n.getText("success")
						);	*/
				 
					 if(oData.ServiceType == "S"){
						 this.ServiceType_re.setSelectedIndex(0);				 					 
					 }else{
						 this.ServiceType_re.setSelectedIndex(1);
					 }
					 
					 if(oData.Lifnr){
						 var vToken = []; 
					     var keyName = oData.Name1 + "(" + oData.Lifnr + ")";
					     
						 vToken.push(new sap.m.Token({key: oData.Lifnr, text: keyName}));
						 this.lifnr_re.setTokens(vToken);							 
					 }					 
					 
					 if(oData.MainType == "E"){
						 this.MainType_re.setSelectedIndex(0);
						 if(oData.TechObject){
							 var vToken = []; 						
							 var keyName = oData.Eqktx + "(" + oData.TechObject + ")";
							 
							 vToken.push(new sap.m.Token({key: oData.TechObject, text: keyName}));
							 this.equnr_re.setTokens(vToken);
						 }
						 
					 }else{
						 this.MainType_re.setSelectedIndex(1);
						 
						 if(oData.TechObject){
							 var vToken = []; 
							 var keyName = oData.Maktx + "(" + oData.TechObject + ")";
								
							 vToken.push(new sap.m.Token({key: oData.TechObject, text: keyName}));
							 this.matnr_re.setTokens(vToken);						 
						 }
					 }
					 this.setServiceType(false);
					 this.setMainType(false);
					 this.setBtnElements();
					 this.oMain.get_attach_file();					 					 
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
				
		     oModel.read(path, mParameters);
		     
		}		

	});
})