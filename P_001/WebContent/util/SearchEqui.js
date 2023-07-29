sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
], function(Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils) {
	"use strict";
	
	return Object.extend("cj.pm0010.util.SearchEqui", { 
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
	          
			//ValueHelper
	          var _oLoc_sh;  // Process
	          var _oEqc_sh;  //EQ Category
	          var _oTot_sh;  //Technical Object 
	          var _oCoc_sh;  //Cost Center
	          var _oWoc_sh;  //Work Center
	          
	          this._makeSerachHelp();
			          
        },
				
		set_tab1 : function(){
			this.tab1 = sap.ui.getCore().byId("tab").getItems()[0];
			this.oTable = this.tab1.mAggregations.content[0].mAggregations.items[1];
			
			this.oTable.setSelectionMode(this.selMode);
			this._set_search_field();
		},
		
		
		selectTab : function(oEvent){	   
			if(oEvent.getParameters().key === "tab2"){
				if(!this.tab2){
					this._set_tab2();
					this._set_tree();
				}
		    }
		},
		
		selectEqTree : function(oEvent){
			if(oEvent.getParameter("rowContext")){
				var path = oEvent.getParameter("rowContext").getPath().replace("/","");
				
				var isEqui = oEvent.getParameter("rowContext").getModel().oData[path].isEqui;
				if(isEqui === "X"){
					oEvent.getParameter("rowContext").getModel().oData[path].Id;
				}
			}
		},
		
		
        onValueHelpRequest : function(oEvent){
			
			if(oEvent.oSource.sId === "loc"){
				this._oLoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){							
				    },
				    function(ctx){
					   console.log("Error");
				    },
				    this
				 );
			}else if(oEvent.oSource.sId === "eqc"){
				this._oEqc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Error");
			        },
			        this
			    );
			}else if(oEvent.oSource.sId === "tot"){
				this._oTot_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Error");
			        },
			        this
			    );
			}else if(oEvent.oSource.sId === "coc"){
				this._oCoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Error");
			        },
			        this
				 );
			}else if(oEvent.oSource.sId === "woc"){
				this._oWoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Error");
			        },
			        this
			    );
			}
		},
		
		/*
		 * Search by Properites(Tab1) search Button
		 */
		search : function(){
			var oModel = this.oMain.getView().getModel("equip");
			var controll = this;
			var lange = this.oMain.getLanguage();
			
			var tab1_header = this.tab1.mAggregations.content[0].mAggregations.items[0]._aElements;
			
			var s_swerk;        //swerk
			var s_loc = [];     //process
			var s_tag = [];     //tag
			var s_eqc = [];     //EQ Category 
			var s_tot = [];     //Object type 
			var s_coc = [];     //Cost Center
			var s_woc = [];     //Work Center 
			var s_desc = [];    //Desc
			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			
			for(var i=0; i<tab1_header.length; i++){
				
				if(tab1_header[i].sId === "loc"){
				    var oLoc = tab1_header[i].getTokens();  //Process(stand)
				    for(var j=0; j<oLoc.length; j++){
				    	s_loc.push(oLoc[j].getProperty("key"));
				    }
				    if(s_loc.length>0){
				    	s_filter.push(this._set_filter(s_loc, "Stand"));
				    }
				}else if(tab1_header[i].sId === "tag"){    // Tag #
					var oTag = tab1_header[i].getValue();
					//filterStr 에 값이 없는 경우 Odata 에러 발생, 하나의 filter라도 넣어주기 위함 
					s_tag.push(oTag);
					if(s_tag.length>0){
						s_filter.push(this._set_filter(s_tag, "Invnr"));
					}
			    }else if(tab1_header[i].sId === "eqc"){      //Eq Category(EQTYP)
			    	var oEqc = tab1_header[i].getTokens();
			    	for(var j=0; j<oEqc.length; j++){
			    		s_eqc.push(oEqc[j].getProperty("key"));
			    	}
			    	if(s_eqc.length>0){
			    		s_filter.push(this._set_filter(s_eqc, "Eqtyp"));
				    }
			    }else if(tab1_header[i].sId === "tot"){     //Object type(EQART)
			    	var oTot = tab1_header[i].getTokens();
			    	for(var j=0; j<oTot.length; j++){
			    		s_tot.push(oTot[j].getProperty("key"));
			    	}
			    	if(s_tot.length>0){
			    		s_filter.push(this._set_filter(s_tot, "Eqart"));
				    }
			    }else if(tab1_header[i].sId === "coc"){       //cost center(KOSTL)
			    	var oCoc = tab1_header[i].getTokens();
			    	for(var j=0; j<oCoc.length; j++){
			    		s_coc.push(oCoc[j].getProperty("key"));
			    	}
			    	if(s_coc.length>0){
			    		s_filter.push(this._set_filter(s_coc, "Kostl"));
				    }
			    }else if(tab1_header[i].sId === "woc"){
			    	var oWoc = tab1_header[i].getTokens();    //work center(OBJID)
			    	for(var j=0; j<oWoc.length; j++){
			    		s_woc.push(oWoc[j].mAggregations.customData[0].getProperty("value").Add2);
			    	}
			    	if(s_woc.length>0){
			    		s_filter.push(this._set_filter(s_woc, "Objid"));
				    }
			    }else if(tab1_header[i].sId === "desc"){
			    	var oDesc = tab1_header[i].getValue();
			    	if(oDesc){
				    	s_desc.push(oDesc);
				    	if(s_desc.length>0){
				    		s_filter.push(this._set_filter(s_desc, "Eqktx"));
				    	}
			    	}
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

			var path = "/KeyListSet(Type='P',Spras='"+lange+"',Swerk='"+s_swerk+"')";
			var mParameters = {
				urlParameters : {
					"$expand" : "KeyEqList",
					"$filter" : filterStr
				},
				success : function(oData) {
					
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 controll.oTable.setModel(oODataJSONModel);
				 controll.oTable.bindRows("/KeyEqList/results");
					 
/*						 sap.m.MessageBox.show(
						 controll.i18n.getText("Success"),
						 sap.m.MessageBox.Icon.SUCCESS,
						 controll.i18n.getText("Success")
					);*/

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
		
		
		downloadExcel : function(oEvent){
            var oModel, oTable, sFilename;
			
			oModel = this.oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, this.oTable, sFilename);
		},
		
		
		clearAllSortings : function(oEvent){
			this.oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},
		
		
		clearAllFilters : function(oEvnet){
		
			var oUiModel = this.oMain.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				this.oTable.filter(aColumns[i], null);
			}
		},
		

	/**************************************************
	 *  Local function
	 *************************************************/	
		
		/* 
		 * PM Possible Entry Odata 
		 */	
		_set_search_field : function() {
			
			var tab1_header = this.tab1.mAggregations.content[0].mAggregations.items[0]._aElements;
			
			var default_swerk;
			
			for(var i=0; i<tab1_header.length; i++){

				//Maintenance Plant
				if(tab1_header[i].sId === "swerk_tab1"){
			     this.oSwerk = tab1_header[i];
			     
				 for(var j=0; j<this.arr_swerk.length; j++){
					var template = new sap.ui.core.Item();
		            template.setKey(this.arr_swerk[j].Value);
		            template.setText(this.arr_swerk[j].KeyName);
		            this.oSwerk.addItem(template);
		            
		            if(this.arr_swerk[j].Default === "X"){
		            	default_swerk = j;
		            }
				  }
				 this.oSwerk.setSelectedKey(this.arr_swerk[default_swerk].Value);
			    
				}else if(tab1_header[i].sId === "loc"){
					var oLoc = tab1_header[i];
			    	this._set_inputLOC(oLoc);
			    }else if(tab1_header[i].sId === "eqc"){
			    	var oEqc = tab1_header[i];
			    	this._set_inputEQC(oEqc);
			    }else if(tab1_header[i].sId === "tot"){
			    	var oTot = tab1_header[i];
			    	this._set_inputTOT(oTot);
			    }else if(tab1_header[i].sId === "coc"){
			    	var oCoc = tab1_header[i];
			    	this._set_inputCOC(oCoc);
			    }else if(tab1_header[i].sId === "woc"){
			    	var oWoc = tab1_header[i];
			    	this._set_inputWOC(oWoc);
			    }
			}
		},
				
		_set_inputLOC : function(obj){
			var plant;
			if(!this.oSwerk.getSelectedItem()){
				plant = this.arr_swerk[0].Value;
			}else{
				plant = this.oSwerk.getSelectedItem().getProperty("key");
			}

			var  urlParameters = {
				"$expand" : "Result" ,
			    "$filter" : "Input1 eq '" + plant + "'"
			}	
			this._get_search_Model(obj, 'LOC', urlParameters, "H", "Process", this.loc_fields);
		},
		
		_set_inputEQC : function(obj){
			
			var lange = this.oMain.getLanguage();
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, 'EQC', urlParameters, "H", "EQ Category ", this.eqc_fields);
		},
		
		_set_inputTOT : function(obj){
			
			var lange = this.oMain.getLanguage();
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, 'TOT', urlParameters, "H", "Technical Object Type", this.tot_fields);
		},
		
		_set_inputCOC : function(obj){
			
			var lange = this.oMain.getLanguage();
			var kokrs = this.arr_kokrs[0].Value;
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + kokrs + "'"
				}
			this._get_search_Model(obj, 'COC', urlParameters, "H", "Cost Center", this.coc_fields);
		},
		
		_set_inputWOC : function(obj){
			
			var plant;
			if(!this.oSwerk.getSelectedItem()){
				plant = this.arr_swerk[0].Value;
			}else{
				plant = this.oSwerk.getSelectedItem().getProperty("key");
			}
			var lange = this.oMain.getLanguage();

			var urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
				}
			this._get_search_Model(obj, 'WOC', urlParameters, "H", "Work Center", this.woc_fields);
		},
		
		
		_set_tab2 : function(){
			
			this.tab2 = sap.ui.getCore().byId("tab").getItems()[1];
			this.oTree = this.tab2.mAggregations.content[1];
			this.oSwerk_tab2 = this.tab2.mAggregations.content[0].mAggregations.items[1];
				
		    var default_swerk;
			for(var j=0; j<this.arr_swerk.length; j++){
				var template = new sap.ui.core.Item();
			    template.setKey(this.arr_swerk[j].Value);
		        template.setText(this.arr_swerk[j].KeyName);
	            this.oSwerk_tab2.addItem(template);
	            
	            if(this.arr_swerk[j].Default === "X"){
	            	default_swerk = j;
	            }
			 }
			 this.oSwerk_tab2.setSelectedKey(this.arr_swerk[default_swerk].Value); //Default Value Setting
							
		},
		
		_set_tree : function() {
			var lange = this.oMain.getLanguage();
			var swerk = this.oSwerk_tab2.getSelectedKey();

     	    var s_path = "equip>/EqTreeSet";
		    var rows = {
	              path : s_path, 
	              filters: [
	            	  new sap.ui.model.Filter("Swerk", sap.ui.model.FilterOperator.EQ, swerk),
	            	  new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, lange)
	              ],
	              parameters : {
	                 numberOfExpandedLevels : 1,
	              	 treeAnnotationProperties : {
	                     hierarchyLevelFor : 'Level',
	                     hierarchyNodeFor : 'Id',
	                     hierarchyParentNodeFor : 'ParentId',
	                     hierarchyDrillStateFor : 'DrilldownState'
	                 }
	              }
		      };
			 this.oTree.bindRows(rows);
			 this.oTree.setSelectionMode(this.selMode);
		},
		
	
	     /*
	       * ComboBox 공통 Odata 상용 시 (Search by Properites)
	       */ 
	    _get_search_Model : function(Obj, key, urlParameters, objType, title, field) {
			//var oModel = this.getView().getModel("possible");
	    	var oModel = this.oMain.getModel("possible");
			var path = "/ImportSet('" + key + "')" ;
			
			var controll = this;
			
			var mParameters = {
			  urlParameters : urlParameters,
			  success : function(oData) {
					
				  if(objType === "C"){
		              for(var i=0; i<oData.Result.results.length; i++){
		          	   var template = new sap.ui.core.Item();
		                 template.setKey(oData.Result.results[i].Key);
		                 template.setText(oData.Result.results[i].KeyName);
		                 Obj.addItem(template);
		              }
				  }else if(objType === "H"){

					var sh_Model = new sap.ui.model.json.JSONModel();
					sh_Model.setData(oData.Result);

					if(key === "LOC"){
						controll._oLoc_sh = new ValueHelpHelper(
		                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
				    }else if(key === "EQC"){
						controll._oEqc_sh = new ValueHelpHelper(
		                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
					}else if(key === "TOT"){
						controll._oTot_sh = new ValueHelpHelper(
		                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
					}else if(key === "COC"){
						controll._oCoc_sh = new ValueHelpHelper(
		                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
					}else if(key === "WOC"){
						controll._oWoc_sh = new ValueHelpHelper(
		                		sh_Model, Obj, field, title, true);  //Model, UI Object, SearchHelp table, title, MultiSelect 
					}
				  }
			  }.bind(this),
			  error : function(oError){
				  Toast.show("Error");
			  }
			}
			oModel.read(path, mParameters);
		},
		
		
		/*
		 * make search help
		 */
		_makeSerachHelp : function(){
          
			//Process
			this.loc_fields = [
               {label: "Location",     key: "Key", searchable:true, iskey:true, search:true },
			   {label: "Location Name",  key: "Name", searchable:true, iskey:true, search:true }              
			];
			//EQ Category 
			this.eqc_fields = [
                {label: "Equipment category",      key: "Key", searchable:true, iskey:true, search:true },
			    {label: "Equipment category Name", key: "Name", searchable:true, iskey:true, search:true }
			];
			//Object Type 
			this.tot_fields = [
			    {label: "Technical Object",      key: "Key", searchable:true, iskey:true, search:true },
			    {label: "Technical Object Name", key: "Name", searchable:true, iskey:true, search:true }
	     	];
			//Cost Center
			this.coc_fields = [
			    {label: "Cost Center",      key: "Key", searchable:true, iskey:true, search:true },
			    {label: "Cost Center Name", key: "Name", searchable:true, iskey:true, search:true }
	     	];
			//Work Center
			this.woc_fields = [
			    {label: "Work Center",      key: "Key", searchable:true, iskey:true, search:true },
			    {label: "Work Center Name", key: "Name", searchable:true, iskey:true, search:true },
			    {label: "Object types", key: "Add1", searchable:true, iskey:false, search:true },
			    {label: "Object ID", key: "Add2", searchable:true, iskey:false, search:true }
	     	];

			this.aTokens = null;
		},

		_set_filter : function(Obj, Val){
			//(Eqart eq 'M01' or Eqart eq 'M16')
			var str = Val;
			
			for(var i=0; i<Obj.length; i++){
				if(i === 0){
					str = "(";
				}else{
					str = str + " or "
				}
				str = str + Val + " eq '" + Obj[i] + "'";
				
				if(i === Obj.length-1){
					str = str + ")";
				}
			}
		  return str;
		},
		
		_resetSortingState : function() {
			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},
		
		
	});
})