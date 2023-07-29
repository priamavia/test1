sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm_m220/util/ValueHelpHelper",
	"cj/pm_m220/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm_m220.util.WorkResult", { 
		Dailog : [],
		arr_swerk : [],
		arr_kostl : [],
		arr_korks : [],
				

        constructor: function(oDailog, Main, selMode) {
	          this.Dailog = oDailog;
	          
	          this.oMain = Main;
	          
	          this.selMode = selMode;
	          
			  var view = this.oMain.getView();
			  view.setModel(new JSONModel({
					globalFilter: "",
					availabilityFilterOn: false,
					cellFilterOn: false
				}), "ui");
	
	          this.arr_swerk = this.oMain.arr_swerk;
	          this.arr_kostl = this.oMain.arr_kostl;
	          this.arr_kokrs = this.oMain.arr_kokrs;
	          
			  this.locDate    = this.oMain.locDate;
			  this.locTime    = this.oMain.locTime;
			  this.dateFormat = this.oMain.dateFormat;
			  this.sep        = this.oMain.sep;   	          
			//ValueHelper
	          var _oLoc_sh;  // Process
	          var _oEqc_sh;  //EQ Category
	          var _oTot_sh;  //Technical Object 
	          var _oCoc_sh;  //Cost Center
	          var _oWoc_sh;  //Work Center			          
        },
		
	});
})