sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Object, JSONModel, Filter, FilterOperator, Message, Toast) {
	"use strict";
	
	return Object.extend("cj.pm0090.util.PMClasf", {
		Dailog : [],
		arr_swerk : [],
		arr_kostl : [],
		arr_korks : [],
		
		constructor: function(oDailog, Main) {
		  this.Dailog = oDailog;

          this.oMain = Main;
/*
          this.arr_swerk = this.oMain.arr_swerk;
          this.arr_kostl = this.oMain.arr_kostl;
          this.arr_kokrs = this.oMain.arr_kokrs;

		  this.locDate    	= this.oMain.locDate;
		  this.locTime    	= this.oMain.locTime;
		  this.dateFormat 	= this.oMain.dateFormat;
		  this.sep        	= this.oMain.sep; */
		},
		
		get_pmclasf_data : function() {
			

			
//			sap.ui.getCore().byId("Qkatart").setValue(qkatart);
//			sap.ui.getCore().byId("Rbnr").setText(this.oMain.oRbnr);

			
			//this.oTable_pmclasf = sap.ui.getCore().byId("table_pmclasf");
			
			debugger;			
			var oTable_pmclasf = sap.ui.getCore().byId("table_pmclasf");
			var tableModel = oTable_pmclasf.getModel();
			
			var odata = {};
			var list = [];
			
			var create_init;
			
			if(tableModel.getData() !=null ){
				odata = tableModel.getData();
				list = odata.results;
			}else{
				create_init = "X";  // create mode 시 최초 row 생성 시 
				
				list.push( 
						  {
							  "Type" : "BM \n (Breakdown Maintenance)",
							  "Desc" : "repair work is carried out after the equipment \n is stopped due to mechanical defects in the equipment",
							  "Exam" : " Repair work after the equipment is stopped \n due to damage to the pump bearing"
						  },
						  {
							  "Type" : "PM \n (Preventice Maintenance)",
							  "Desc" : "after checking the abnormal condition of the equipment, \n the repair work is carried out after stopping the equipment in a scheduled date",
							  "Exam" : "Repair work after establish a plan and stop \n the equipment, as checking the poor \n condition of the pump bearings when \n periodic facility inspections"
						  },
						  {
							  "Type" : "CM \n (Corrective Maintenance)",
							  "Desc" : "improvement maintenance work to improve the functionality \n and performance of the equipment",
							  "Exam" : "Reducing leakage by changing the material \n of the pump mechanical seal"
						  },
						  {
							  "Type" : "NM \n (Not related with Maintenance)",
							  "Desc" : "general maintenance work not related with \n equipments",
							  "Exam" : "Repair work due to blocked drainage in the \n pump room, repair building wall for water \n leakage"
						  }			  
					   );
				
			}
				
		   odata.results = list;
		  
		   if(create_init === "X"){
			   
			 var oODataJSONModel = new sap.ui.model.json.JSONModel();  
			 oODataJSONModel.setData(odata);
			 
			 oTable_pmclasf.setModel(oODataJSONModel);
			 oTable_pmclasf.bindRows("/results");
		     
		     create_init = "";
		     
		   }else{
			   
		     tableModel.setData(odata);
		     
		   }
		   
		   /*
		   var idx = list.length-1;
		   oTable.setFirstVisibleRow(idx);
		   $("input[id*='Matnr']").focus().trigger("click");
		   */
		   
		   
		    
		    
		    
			 //this.oTable_pmclasf.bindRows(rows);
	
	
			
		},
						

			

		

	});
});