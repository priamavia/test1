sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",	
	"sap/m/MessageToast",
	"cj/pm_m150/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, MessageBox, Toast, utils) {
	"use strict";
	
	return Object.extend("cj.pm_m150.util.Comment", { 
		Dailog_ra : [],
		arr_swerk_ra : [],
		arr_kostl_ra : [],
		arr_korks_ra : [],
		
		constructor: function(oDailog, Main) {
			this.Dailog_ra = oDailog;
          
			this.oMain = Main;
			var oComponent = this.oMain.getOwnerComponent();
			this.oMain.getView().addStyleClass(oComponent.getContentDensityClass());

          this.selwerks = null;
          this.selAufnr = null;
          this.selZplhr = null;
          this.selZdate = null;
          this.selArbpl = null;
          this.con = true;
          this.selZid   = null;
                  
          this.arr_swerk_ra = this.oMain.arr_swerk;
          this.arr_kostl_ra = this.oMain.arr_kostl;
          this.arr_kokrs_ra = this.oMain.arr_kokrs;
		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep;              
          this.i18n = this.oMain.getView().getModel("i18n").getResourceBundle();
                   
		},

		/*
		 * Initial Data Search
		 */
		commentList : function(sObj){
			var oView = this.oMain.getView();

			oView.setModel(
					new JSONModel(
							{
								Gsber : "",
								Spmon : "",
								Round : "",
								Kostl : "",
								Ktext : "",
								Inspu : "",
								Inspn : "",
								Examu : "",
								Examn : "",
								Joinu : "",
								Joinn : "",
								Mode  		: "",
								LongText 	: ""
							}
						), "ComHead"
					);
			
			var iMode = "I"; // Individual by User.
			var controll = this;					 
			var oModel = this.oMain.getView().getModel("inspOpinion");
			
			var path = "/CommentMainSet(Gsber='"+sObj.Gsber+"',Kostl='"+sObj.Kostl+"',Spmon='"+sObj.Spmon+"',Round='"+sObj.Round+"',Mode='"+iMode+"')";
			
			var mParameters = {
				urlParameters : {
					"$expand" : "NavDailyList,NavMasterDept,NavReturn",
					// "$filter" : filterStr
				},
				success : function(oData) {
					// NavReturn 의 가공 형태에 따라 알맞게 수정. 
					if(oData.NavReturn.results[0].Rttyp == "E"){
						MessageBox.show(
								oData.NavReturn.results[0].Rtmsg, 
								MessageBox.Icon.ERROR,
								this.i18n.getText("Error")
						);

						// Close window.
						controll.oMain.onCommentCancelDialog();
						
					}else{				
						var oHead = this.oMain.getView().getModel("ComHead");
						oHead.setData(oData);

						var oDept =  new sap.ui.model.json.JSONModel();
						oDept.setData(oData.NavMasterDept);
						this.oMain.getView().setModel(oDept, 'Dept');						
						
						var oTableDaily = sap.ui.getCore().byId("table_Daily"); 
						var oODataJSONModelDaily =  new JSONModel();  
						oODataJSONModelDaily.setData(oData.NavDailyList);
						oTableDaily.setModel(oODataJSONModelDaily);
						oTableDaily.bindRows("/results");						

//						this.listBack();
					}					
				}.bind(this),
				error : function() {
				   MessageBox.show(
					 controll.i18n.getText("oData_conn_error"),
					 MessageBox.Icon.ERROR,
					 controll.i18n.getText("error")
				   );
				}.bind(this)
			};
				
			oModel.read(path, mParameters);
		},

		onCommentSave : function(a){
			var oView = this.oMain.getView();
			var controll = this;					 
			var oModel = oView.getModel("inspOpinion");
			var oHead = oView.getModel("ComHead").getData();
			
			var data = {};

			data.Gsber = oHead.Gsber;
			data.Spmon = oHead.Spmon;
			data.Round = oHead.Round;
			data.Kostl = oHead.Kostl;
			data.Ktext = oHead.Ktext;
			data.Inspu = oHead.Inspu;
			data.Inspn = oHead.Inspn;
			data.Examu = oHead.Examu;
			data.Examn = oHead.Examn;
			data.Joinu = oHead.Joinu;
			data.Joinn = oHead.Joinn;
			data.Mode  = a;
			data.LongText = oHead.LongText;

	  		var oList = sap.ui.getCore().byId("table_Daily").getModel().getData().results;

			var daily = [];
			for (var i=0; i<oList.length; i++) {
				var item = {};

				item = oList[i];
				daily.push(item);
			}

			data.NavDailyList = daily;
			data.NavReturn = [];

			
			var path = "/CommentMainSet";
			
			var mParameters = {
				urlParameters : {
					// "$expand" : "NavDailyList,NavMasterDept,NavReturn",
					// "$filter" : filterStr
				},
				success : function(oData) {
					// NavReturn 의 가공 형태에 따라 알맞게 수정. 
					if(oData.NavReturn.results[0].Rttyp == "E"){
						MessageBox.show(
								oData.NavReturn.results[0].Rtmsg, 
								MessageBox.Icon.ERROR,
								this.i18n.getText("Error")
						);
					}else{

						MessageBox.show(
								oData.NavReturn.results[0].Rtmsg, 
								MessageBox.Icon.SUCCESS,
								this.i18n.getText("success")
						);
					}					
				}.bind(this),
				error : function() {
				   MessageBox.show(
					 controll.i18n.getText("oData_conn_error"),
					 MessageBox.Icon.ERROR,
					 controll.i18n.getText("error")
				   );
				}.bind(this)
			};
				
			oModel.create(path, data, mParameters);
		},
		
		onCheckBeforeSave : function(oEvent){
			var oList = sap.ui.getCore().byId("table_Daily").getModel().getData().results;

			return true;
			
		},

		onCheckBeforeSubmit : function(){
			var oList = sap.ui.getCore().byId("table_Daily").getModel().getData().results;

			return true;			
		}
	});
})