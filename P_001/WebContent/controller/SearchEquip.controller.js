sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
], function (Object, JSONModel, Filter, FilterOperator, Message, Toast, ValueHelpHelper, utils ) {
	"use strict";

	return Object.extend("cj.pm0010.controller.SearchEquip", {

		constructor : function (oView) {
			this.oMain = oView;
		},

		createHandler : function(oDialog, MainParam, shMain, selMode){
			
			this.oDialog = oDialog;
			
			this.oMainParam = MainParam;
			this.shMain = shMain;
			this.selMode = selMode;

			this.arr_swerk = MainParam.arr_swerk;
	        this.arr_kostl = MainParam.arr_kostl;
	        this.arr_kokrs = MainParam.arr_kokrs;      
			
	        this._makeSerachHelp();
			this.selectIdx = {};
	        
	        this.oSwerk = this.oMain.oController.getView().byId("swerk_tab1");
			if(this.oSwerk){
				for(var j=0; j<this.arr_swerk.length; j++){
					var template = new sap.ui.core.Item();
		            template.setKey(this.arr_swerk[j].Value);
		            template.setText(this.arr_swerk[j].KeyName);
		            this.oSwerk.addItem(template);
				}
			}

			this.oTable = this.oMain.oController.getView().byId("eq_table");
			this.oTable.setSelectionMode(this.selMode);
			
		},
		
		
		set_plant : function(sel_plant){
			this.sel_swerk = sel_plant;
			this.old_swerk = this.oSwerk.getSelectedKey();
			this.oSwerk.setSelectedKey(this.sel_swerk);
			
			if(this.oSwerk_tab2){
				this.oSwerk_tab2.setSelectedKey(this.sel_swerk); 
				if(this.sel_swerk != this.old_swerk){
					this._set_tree();
				}
			}
		},
		
		
		set_tab1 : function(){
			
			this.tab1 = this.oMain.oController.getView().byId("tab1");
			//this.oTable = this.oMain.oController.getView().byId("eq_table");
						
			//this.oTable.setSelectionMode(this.selMode);
			
			if(this.old_swerk != this.sel_swerk){
				this._set_search_field();
				this._clearTab1();	
			}
			this.oTable.setShowNoData(false);
		},
		
		//confirm
		onConfirmDialog : function(oEvent){
            var chk;
			var aTokens = new Array();
			var aObj    = new Array();
						
			var tab = this.oMain.oController.getView().byId("tab");
			var strArr = tab.getSelectedKey().split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			
			if(sIdstr === "tab1"){
				var selectIdx = this.oTable.getSelectedIndices();
				
				var oTableModel = this.oTable.getModel().getData();
				if(selectIdx.length != 0 && oTableModel){
					chk = "";
					var oTableData = oTableModel.KeyEqList.results;
					
					for(var i=0; i<selectIdx.length; i++){
						var strText = oTableData[selectIdx[i]].EQKTX +" (" + oTableData[selectIdx[i]].EQUNR + ")"
						var token = new sap.m.Token({
							key : oTableData[selectIdx[i]].EQUNR,
							text :  strText
						});
						aTokens.push(token);
						aObj.push(oTableData[selectIdx[i]]);
					
					}
				}else{
				   chk = "X"
				   sap.m.MessageBox.show(
					 this.oMainParam.i18n.getText("isnotselected"),
					 sap.m.MessageBox.Icon.WARNING,
					 this.oMainParam.i18n.getText("warning")
			       );
					
				}
			}else if(sIdstr === "tab2"){
				if(this.selMode == "Single"){
					var selectIdx = this.oTree.getSelectedIndices();
					
					if(selectIdx.length > 0){
						chk = "";
						for(var i=0; i<selectIdx.length; i++){
							var path = this.oTree.getContextByIndex(selectIdx[i]).getPath().replace("/","");
							
							var drilldownState = this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].DrilldownState;
							if(drilldownState === "leaf"){   // 마지막 node만 Equipment 임 
							
								var strText = this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Name
								            +" (" + this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Id + ")"
								var token = new sap.m.Token({
									key : this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Id,
									text : strText
								});
								aTokens.push(token);
								var selRow = this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path];
								var sel_row = {
									TPLNR : selRow.ParentId,
									PLTXT : selRow.ParentName,
									EQUNR : selRow.Id,
									EQKTX : selRow.Name,
									ARBPL : selRow.ARBPL,
									KTEXT2 : selRow.KTEXT2,
									INGRP : selRow.INGRP,
									INNAM : selRow.INNAM,
									KOSTL : selRow.KOSTL,
									KOSTL_TXT : selRow.KOSTL_TXT
								};
							    aObj.push(sel_row);
							}
						}
						
						if(aTokens.length === 0 ){
							chk = "X";
							sap.m.MessageBox.show(
									 this.oMainParam.i18n.getText("isnotselected"),
									 sap.m.MessageBox.Icon.WARNING,
									 this.oMainParam.i18n.getText("warning")
						    );
						}
					}else{
					   chk = "X";
					   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("isnotselected"),
							 sap.m.MessageBox.Icon.WARNING,
							 this.oMainParam.i18n.getText("warning")
						);
					}
				}else{
					//var equipList = this.oMain.oController.getView().byId("equipList");
					aTokens = this.equipList.getTokens();				
				}
			}
			
			if(!chk){
/*				if(this.oTable){
					this.oTable.clearSelection();
				} */
				if(this.oTree && this.selMode == "MultiToggle"){
					this.oTree.clearSelection();
				}
				this.oDialog.close();
				this.shMain.onClose_searchEquip(aTokens, aObj);
			}
		},
		
		onCloseDialog : function(oEvent){
			this.oDialog.close();
		},
		
		// Tab1 (Search by Properites) Plant 
		onSelChange_Tab1 : function(oEvent){
	
			//this.oLoc.removeAllTokens();
			this.oLoc.setSelectedKey("");
		    this.oMain.oController.getView().byId("tag").setValue("");
			//this.oEqc.removeAllTokens();
		    this.oEqc.setSelectedKey("");
			this.oTot.removeAllTokens();
	    	this.oCoc.removeAllTokens();
	    	//this.oWoc.removeAllTokens();  
	    	this.oWoc.setSelectedKey("");
	    	this.oMain.oController.getView().byId("desc").setValue("");
	    	 this.oMain.oController.getView().byId("equip").setValue("");
	    	
	    	this._set_search_field();
	    	
	    //	this._clearTable();	
		},
				
		// Tab2 (Search by F/L) Plant 
		onSelChange_Tab2 : function(oEvent){
			this._set_tree();
		},
		

		onSelectTab : function(oEvent){	   
			var strArr = oEvent.getParameters().key.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			
			if(sIdstr === "tab1" ){
				this.oTree.clearSelection();
				this.equipList.removeAllTokens();
			}else if(sIdstr === "tab2"){
				this.oTable.clearSelection();
				if(!this.tab2){
					this._set_tab2();
					this.oSwerk_tab2.setSelectedKey(this.sel_swerk); 
					this._set_tree();
				}
		    }
		},
		
		onValueHelpRequest_eq : function(oEvent){
			
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			
			if(sIdstr === "loc"){
				this._oLoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){							
				    },
				    function(ctx){
					   console.log("Loc_Error");
				    },
				    this
				 );
			}else if(sIdstr === "eqc"){
				this._oEqc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Eqc_Error");
			        },
			        this
			    );
			}else if(sIdstr === "tot"){
				this._oTot_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Tot_Error");
			        },
			        this
			    );
			}else if(sIdstr === "coc"){
				this._oCoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Coc_Error");
			        },
			        this
				 );
			}else if(sIdstr === "woc"){
				this._oWoc_sh.openValueHelp(
					"/results", 
					function(selection,ctx){
			        },
			        function(ctx){
				       console.log("Woc_Error");
			        },
			        this
			    );
			}
		},
		
		onEqSearch : function(){
		
			var oModel = this.oMain.getModel("equip");
			var controll = this;
			var lange = this.oMainParam.getLanguage();
			
			var s_swerk;        //swerk
			var s_loc = [];     //process
			var s_tag = [];     //tag
			var s_eqc = [];     //EQ Category 
			var s_tot = [];     //Object type 
			var s_coc = [];     //Cost Center
			var s_woc = [];     //Work Center 
			var s_desc = [];    //Desc
			var s_equip = [];   //Equipment
			
			var s_filter = [];
			
			s_swerk = this.oSwerk.getSelectedKey();
			
			oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){controll.oTable.setBusy(false);});
			
/*			var vLoc = this.oLoc.getTokens();
			for(var j=0; j<vLoc.length; j++){
			    	s_loc.push(vLoc[j].getProperty("key"));
			    }
			    if(s_loc.length>0){
			    	s_filter.push(utils.set_filter(s_loc, "Stand"));
			}*/
			var vLoc = this.oLoc.getSelectedKey();
			if(vLoc){
				s_loc.push(vLoc);
			    if(s_loc.length>0){
				   s_filter.push(utils.set_filter(s_loc, "Stand"));
			    }
			}
			    
		    var vTag = this.oMain.oController.getView().byId("tag").getValue();
			//filterStr 에 값이 없는 경우 Odata 에러 발생, 하나의 filter라도 넣어주기 위함 
			s_tag.push(vTag);
			if(s_tag.length>0){
				s_filter.push(utils.set_filter(s_tag, "Invnr"));
			}
			
/*			var vEqc = this.oEqc.getTokens();
	    	for(var j=0; j<vEqc.length; j++){
	    		s_eqc.push(vEqc[j].getProperty("key"));
	    	}*/
			var vEqc = this.oEqc.getSelectedKey();
			if(vEqc){
				s_eqc.push(vEqc);
		    	if(s_eqc.length>0){
		    		s_filter.push(utils.set_filter(s_eqc, "Eqtyp"));
			    }
			}
			
	    	var vTot = this.oTot.getTokens();
	    	for(var j=0; j<vTot.length; j++){
	    		s_tot.push(vTot[j].getProperty("key"));
	    	}
	    	if(s_tot.length>0){
	    		s_filter.push(utils.set_filter(s_tot, "Eqart"));
		    }
			
	    	var vCoc = this.oCoc.getTokens();
	    	for(var j=0; j<vCoc.length; j++){
	    		s_coc.push(vCoc[j].getProperty("key"));
	    	}
	    	if(s_coc.length>0){
	    		s_filter.push(utils.set_filter(s_coc, "Kostl"));
		    }
	    	
/*	    	var vWoc = this.oWoc.getTokens();    //work center(OBJID) 
	    	var wocData = this.oWoc.getModel().getData().results;
	    	for(var j=0; j<vWoc.length; j++){
	    		for(var k=0; k<wocData.length; k++){
	    			if(vWoc[j].getProperty("key") === wocData[k].Key){
	    				s_woc.push(wocData[k].Add2);
	    				break;
	    			}
	    		}
	    	}*/
	    	var vWoc = this.oWoc.getSelectedKey();    //work center(OBJID) 
	    	if(vWoc){
		    	var wocData = this.oWoc.getModel().getData().results;
		    	for(var j=0; j<wocData.length; j++){
	    			if(wocData[j].Key === vWoc){
	    				s_woc.push(wocData[j].Add2);
	    				break;
	    			}
		    	}
	    	}
	    	if(s_woc.length>0){
	    		s_filter.push(utils.set_filter(s_woc, "Objid"));
		    }
	    	
	    	var vDesc = this.oMain.oController.getView().byId("desc").getValue();
	    	if(vDesc){
		    	s_desc.push(vDesc);
		    	if(s_desc.length>0){
		    		s_filter.push(utils.set_filter(s_desc, "Eqktx"));
		    	}
	    	}
	    	
	    	var vEquip = this.oMain.oController.getView().byId("equip").getValue();
	    	if(vEquip){
	    		s_equip.push(vEquip);
	    		if(s_equip.length>0){
	    			s_filter.push(utils.set_filter(s_equip, "Equnr"));
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
				 
				 controll.oTable.setShowNoData(true);
					 
/*						 sap.m.MessageBox.show(
						 controll.i18n.getText("Success"),
						 sap.m.MessageBox.Icon.SUCCESS,
						 controll.i18n.getText("Success")
					);*/

				}.bind(this),
				error : function() {
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );	
				}.bind(this)
			};
		     oModel.read(path, mParameters);
		},
		

		onSelectEqTree : function(oEvent){
			var controll = this;
           
			if(oEvent.getParameter("rowContext")){
				var path = oEvent.getParameter("rowContext").getPath().replace("/","");
				
				var isEqui = oEvent.getParameter("rowContext").getModel().oData[path].isEqui;
				if(isEqui === "X"){
					oEvent.getParameter("rowContext").getModel().oData[path].Id;
					
					if(this.selMode == "Single"){
						this.onConfirmDialog(oEvent);
					}else{
						//var equipList = this.oMain.oController.getView().byId("equipList");
						var equipListTokens = this.equipList.getTokens();
						var skip ="";
						var strText = oEvent.getParameter("rowContext").getModel().oData[path].Name
			            +" (" + oEvent.getParameter("rowContext").getModel().oData[path].Id + ")"
						var token = new sap.m.Token({
							key : oEvent.getParameter("rowContext").getModel().oData[path].Id,
							text : strText
						});
						
						if(this.oTree.isIndexSelected(oEvent.getParameter("rowIndex"))){
							jQuery.each(equipListTokens, function(idx, stoken) {
							    if (stoken.getKey() === token.getKey()){
							    	skip = "X";
							    	return;
							    }else{
							    }
							});

							if(skip == "")this.equipList.addToken(token);
						}else{
							jQuery.each(equipListTokens, function(idx, stoken) {
							    if (stoken.getKey() === token.getKey()){
							    	controll.equipList.removeToken(stoken.getId());
							    	return;
							    }
							});
						}
					}						
				}
			}
		},
		
	
		onToggleState : function(oEvent){
//			debugger;
//			
//			this.oTree = this.oMain.oController.getView().byId("eq_tree");
//
//			if(oEvent.getParameters().expanded){
//				if(this.selectIdx.length > 0){
//					for(var i=0; i<this.selectIdx.length; i++){
//						 this.oTree.setSelectedIndex(this.selectIdx[i]);
//				    }
//				}
//			}
			
		},
		
		/*
		 * MultiInput 의 Key 값을 수기로  입력 시 Token을 생성 한다. 
		 */
		onChange : function(oEvent){
			
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
			
			if(sIdstr === "loc"){
				//utils.set_token(this.oLoc, oEvent);
			}else if(sIdstr === "eqc"){
				//utils.set_token(this.oEqc, oEvent);
			}else if(sIdstr === "tot"){
				utils.set_token(this.oTot, oEvent);
			}else if(sIdstr === "coc"){
				utils.set_token(this.oCoc, oEvent);
			}else if(sIdstr === "woc"){
				//utils.set_token(this.oWoc, oEvent);
			}
		},
		
		
		onRowSelected : function(oEvent){
		  //Table 선택이 Single일 경우 Row 선택시 화면을 닫는다.
			var selectIdx = this.oTable.getSelectedIndices();
			
			if(this.selMode == "Single" && selectIdx.length >0 ){
				this.onConfirmDialog(oEvent);
				
				for(var i=0; i<selectIdx.length; i++){
					this.oTable.removeSelectionInterval(selectIdx[i]);					
				}				
			}
		},
		
		
		downloadExcel_Eq : function(oEvent){
            var oModel, oTable, sFilename;
			
			oModel = this.oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, this.oTable, sFilename);
		},
		
		
		clearAllSortings_Eq : function(oEvent){
			this.oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},
		
		
		clearAllFilters_Eq : function(oEvent){
//			var oUiModel = this.oMain.getView().getModel("ui");
//			oUiModel.setProperty("/globalFilter", "");
//			oUiModel.setProperty("/availabilityFilterOn", false);

			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				this.oTable.filter(aColumns[i], null);
			}
		},
		
		
		 onCollapse2 : function(oEvent){
			 this.oTree.collapseAll();
			 },
			
		 onExpand2 : function(oEvent){
			 this.oTree.expandToLevel("1");
		 },
		
		
	/**************************************************
	 *  Local function
	 *************************************************/			
		_set_search_field : function() {
			
//			this.oSwerk = this.oMain.oController.getView().byId("swerk_tab1");
//			if(this.oSwerk){
//				 
//				for(var j=0; j<this.arr_swerk.length; j++){
//					var template = new sap.ui.core.Item();
//		            template.setKey(this.arr_swerk[j].Value);
//		            template.setText(this.arr_swerk[j].KeyName);
//		            this.oSwerk.addItem(template);
//			     }
//		        this.oSwerk.setSelectedKey(this.arr_swerk[0].Value);
//			}
		
			this.oLoc = this.oMain.oController.getView().byId("loc");
			if(this.oLoc){
				this._set_inputLOC(this.oLoc);
			}
			
			//Validation check 
/*			this.oLoc.addValidator(function(args){
				if (args.suggestedToken){
					var key = args.suggestedToken.getKey();
					var text = args.suggestedToken.getText();
					return new sap.m.Token({key: key, text: text});
				}
			});*/
			
			this.oEqc = this.oMain.oController.getView().byId("eqc");
			if(this.oEqc){
				this._set_inputEQC(this.oEqc);
			}
			
			//Validation check 
/*			this.oEqc.addValidator(function(args){
				if (args.suggestedToken){
					var key = args.suggestedToken.getKey();
					var text = args.suggestedToken.getText();
					return new sap.m.Token({key: key, text: text});
				}
			});*/
			
			this.oTot = this.oMain.oController.getView().byId("tot");
			if(this.oTot){
				this._set_inputTOT(this.oTot);
			}
			
			//Validation check 
			this.oTot.addValidator(function(args){
				if (args.suggestedToken){
					var key = args.suggestedToken.getKey();
					var text = args.suggestedToken.getText();
					return new sap.m.Token({key: key, text: text});
				}
			});
			
			this.oCoc = this.oMain.oController.getView().byId("coc");
			if(this.oCoc){
				this._set_inputCOC(this.oCoc);
			}
			
			//Validation check 
			this.oCoc.addValidator(function(args){
				if (args.suggestedToken){
					var key = args.suggestedToken.getKey();
					var text = args.suggestedToken.getText();
					return new sap.m.Token({key: key, text: text});
				}
			});
			
			this.oWoc = this.oMain.oController.getView().byId("woc");
			if(this.oWoc){
				this._set_inputWOC(this.oWoc);
			}
			
			//Validation check 
/*			this.oWoc.addValidator(function(args){
				if (args.suggestedToken){
					var key = args.suggestedToken.getKey();
					var text = args.suggestedToken.getText();
					return new sap.m.Token({key: key, text: text});
				}
			});*/
		
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
			this._get_search_Model(obj, 'LOC', urlParameters, "C", "Process", this.loc_fields);
		},
		
		_set_inputEQC : function(obj){
			
			var lange = this.oMainParam.getLanguage();
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, 'EQC', urlParameters, "C", "EQ Category ", this.eqc_fields);
		},
		
		_set_inputTOT : function(obj){
			
			var lange = this.oMainParam.getLanguage();
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "'"
				}
			this._get_search_Model(obj, 'TOT', urlParameters, "H", "Technical Object Type", this.tot_fields);
		},
		
		_set_inputCOC : function(obj){
			
			var lange = this.oMainParam.getLanguage();
			var plant;
			if(!this.oSwerk.getSelectedItem()){
				plant = this.arr_swerk[0].Value;
			}else{
				plant = this.oSwerk.getSelectedItem().getProperty("key");
			}

//			for(var i=0; i<this.arr_kokrs.length; i++){
//				if(this.arr_kokrs[i].Default === "X"){
//					var kokrs = this.arr_kokrs[i].Value;
//				}
//			}
			
			var  urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant + "'"
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
			var lange = this.oMainParam.getLanguage();

			var urlParameters = {
					"$expand" : "Result" ,
				    "$filter" : "Spras eq '"+ lange + "' and Input1 eq '" + plant +"'"
				}
			//this._get_search_Model(obj, 'WOC', urlParameters, "C", "Work Center", this.woc_fields);
			this._get_search_Model(obj, 'WOC', urlParameters, "C", "Work Center", "");
		},
		
		
		_set_tab2 : function(){
			
			this.tab2 = this.oMain.oController.getView().byId("tab2");
			this.oTree = this.oMain.oController.getView().byId("eq_tree");
			this.oSwerk_tab2 = this.oMain.oController.getView().byId("swerk_tab2");
			
			for(var j=0; j<this.arr_swerk.length; j++){
				var template = new sap.ui.core.Item();
			    template.setKey(this.arr_swerk[j].Value);
		        template.setText(this.arr_swerk[j].KeyName);
	            this.oSwerk_tab2.addItem(template);
			 }
			
			this.equipList = this.oMain.oController.getView().byId("equipList");
			if(this.selMode == "Single"){
				this.equipList.setVisible(false);
			}else{
				this.equipList.setVisible(true);
			}
				
		},
		
		_set_tree : function() {
			var lange = this.oMainParam.getLanguage();
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
		 * make search help
		 */
		_makeSerachHelp : function(){
          
			//Process
			this.loc_fields = [
               {label: this.oMainParam.i18n.getText("lblLocation"),      key: "Key", searchable:true, iskey:true, search:true },
			   {label: this.oMainParam.i18n.getText("lblLocationName"),  key: "Name", searchable:true, iskey:true, search:true }              
			];
			//EQ Category 
			this.eqc_fields = [
                {label: this.oMainParam.i18n.getText("lblEquipCategory"),     key: "Key", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblEquipCategoryName"), key: "Name", searchable:true, iskey:true, search:true }
			];
			//Object Type 
			this.tot_fields = [
			    {label: this.oMainParam.i18n.getText("lblTechnicalObject"),     key: "Key", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblTechnicalObjectName"), key: "Name", searchable:true, iskey:true, search:true }
	     	];
			//Cost Center
			this.coc_fields = [
			    {label: this.oMainParam.i18n.getText("lblCostCenter"),     key: "Key", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblCostCenterName"), key: "Name", searchable:true, iskey:true, search:true }
	     	];
			//Work Center
			this.woc_fields = [
			    {label: this.oMainParam.i18n.getText("lblWorkCenter"),     key: "Key", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblWorkCenterName"), key: "Name", searchable:true, iskey:true, search:true },
			    {label: this.oMainParam.i18n.getText("lblObjectTypes"),    key: "Add1", searchable:false, iskey:false, search:true },
			    {label: this.oMainParam.i18n.getText("lblObjectID"),       key: "Add2", searchable:false, iskey:false, search:true }
	     	];

			this.aTokens = null;
		},

		  /*
	       * ComboBox 공통 Odata 상용 시 (Search by Properites)
	       */ 
	    _get_search_Model : function(Obj, key, urlParameters, objType, title, field) {
			//var oModel = this.getView().getModel("possible");
	    	var oModel = this.oMain.getModel("possible");
	    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
	    	
			var path = "/ImportSet('" + key + "')" ;
			
			var controll = this;
			
			var mParameters = {
			  urlParameters : urlParameters,
			  success : function(oData) {
					
				  if(objType === "C"){
					  
					 var sh_Model = new sap.ui.model.json.JSONModel();
					 sh_Model.setData(oData.Result);
					 
					  if(Obj.getItems()){
						if(Obj.getItems().length > 0){
							Obj.removeAllItems();
						}
					  }
						 
		              for(var i=0; i<oData.Result.results.length; i++){
		          	   var template = new sap.ui.core.Item();
		                 template.setKey(oData.Result.results[i].Key);
		                 template.setText(oData.Result.results[i].KeyName);
		                 Obj.addItem(template);
		              }
		              
		              Obj.setModel(sh_Model);
		              
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
					
					Obj.setModel(sh_Model);
					var template = new sap.ui.core.Item({text:"{KeyName}", key:"{Key}"});
					Obj.bindAggregation("suggestionItems", "/results" , template);
					
				  }
			  }.bind(this),
			  error : function(oError){
				   sap.m.MessageBox.show(
							 this.oMainParam.i18n.getText("oData_conn_error"),
							 sap.m.MessageBox.Icon.ERROR,
							 this.oMainParam.i18n.getText("error")
						   );					
				  
//				  Toast.show( key );
			  }
			}
			oModel.read(path, mParameters);
		},
		
		_resetSortingState : function() {
			var aColumns = this.oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},
		
		_clearTab1 : function(){
			
			//this.oLoc.removeAllTokens();
			this.oLoc.setSelectedKey("");
		    this.oMain.oController.getView().byId("tag").setValue("");
			//this.oEqc.removeAllTokens();
		    this.oEqc.setSelectedKey("");
			this.oTot.removeAllTokens();
	    	this.oCoc.removeAllTokens();
	    	//this.oWoc.removeAllTokens();  
	    	this.oWoc.setSelectedKey("");
	    	this.oMain.oController.getView().byId("desc").setValue("");
	    	this.oMain.oController.getView().byId("equip").setValue("");
	    	
			this._clearTable();
		},
		
		_clearTable : function(){
			var tableModel = this.oTable.getModel();
			var odata = tableModel.getData();
			
			if(odata){
				odata.KeyEqList = [];
				tableModel.setData(odata);
			}
		}
		
		
	});

});