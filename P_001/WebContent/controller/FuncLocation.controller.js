sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"cj/pm0010/util/ValueHelpHelper",
	"cj/pm0010/util/utils",
], function (Object, JSONModel, Filter, FilterOperator, ValueHelpHelper, utils ) {
	"use strict";
	return Object.extend("cj.pm0010.controller.FuncLocation", {
		
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
	          
	        this._set_search_field();
	           
			this.flList = this.oMain.oController.getView().byId("flList");
			
			if(this.selMode == "Single"){
				this.flList.setVisible(false);
			}else{
				this.flList.setVisible(true);
			}
			
		},
		
		
		set_plant : function(sel_plant, tokens){
			this.sel_swerk = sel_plant;
			this.old_swerk = this.oSwerk.getSelectedKey();
			this.oSwerk.setSelectedKey(this.sel_swerk);

			//this.oMainParam = MainParam;
			
			if(this.selMode == "MultiToggle"){
				//this.old_token = MainParam.fl.getTokens();
				
				this.old_token = tokens;
				this.flList.removeAllTokens();
			}
			
			if(this.sel_swerk != this.old_swerk){
				this._set_tree();
			}else{
				
				if(this.selMode == "MultiToggle"){
					if(tokens){
						var cnt = tokens.length;
					    for(var i=0; i<cnt; i++){
					    	this.flList.addToken(tokens[i]);
					    }
					}
				}
			  
				
//				if(this.selMode == "MultiToggle"){
//					var selectedIdx = this.oTree.getSelectedIndices();
//					if(selectedIdx.length > 0){
//
//						for(var i=0; i<selectedIdx.length; i++){
//							var path = this.oTree.getContextByIndex(selectedIdx[i]).getPath().replace("/","");
//	
//							var strText = this.oTree.getContextByIndex(selectedIdx[i]).getModel().oData[path].Name
//							            +" (" + this.oTree.getContextByIndex(selectedIdx[i]).getModel().oData[path].Id + ")"
//							var token = new sap.m.Token({
//								key : this.oTree.getContextByIndex(selectedIdx[i]).getModel().oData[path].Id,
//								text : strText
//							});
//	
//							this.flList.addToken(token);
//						}
//					}								
//				}
			}
		},
		
		
		onSelectFlTree : function(oEvent){
//			if(this.selMode == "Single"){
//				this.onConfirmDialog(oEvent);
//			}
			var controll = this;

			if(oEvent.getParameter("rowContext")){
				var path = oEvent.getParameter("rowContext").getPath().replace("/","");
				
				oEvent.getParameter("rowContext").getModel().oData[path].Id;
				
				  //Table 선택이 Single일 경우 Row 선택시 화면을 닫는다.
				var selectIdx = this.oTree.getSelectedIndices();
				
				if(this.selMode == "Single"  && selectIdx.length > 0){
					this.onConfirmDialog(oEvent);
					
/*					for(var i=0; i<selectIdx.length; i++){
						this.oTree.removeSelectionInterval(selectIdx[i]);					
					}	*/						
				}else{
					//var flList = this.oMain.oController.getView().byId("flList");
					var flListTokens = this.flList.getTokens();
					var skip ="";
					var strText = oEvent.getParameter("rowContext").getModel().oData[path].Name
		            +" (" + oEvent.getParameter("rowContext").getModel().oData[path].Id + ")"
					var token = new sap.m.Token({
						key : oEvent.getParameter("rowContext").getModel().oData[path].Id,
						text : strText
					});
					
					if(this.oTree.isIndexSelected(oEvent.getParameter("rowIndex"))){
						jQuery.each(flListTokens, function(idx, stoken) {
						    if (stoken.getKey() === token.getKey()){
						    	skip = "X";
						    	return;
						    }else{
						    }
						});

						if(skip == "")this.flList.addToken(token);
					}else{
						jQuery.each(flListTokens, function(idx, stoken) {
						    if (stoken.getKey() === token.getKey()){
						    	controll.flList.removeToken(stoken.getId());  
						    	return;
						    }
						});
						
					}
				}						
			}			
		},
		
		
		onSelChange : function(oEvent){
			this._set_tree();
		},
		
		
		onConfirmDialog : function(oEvent){
            var chk;
			var aTokens = new Array();
			var aObj    = new Array();
			
			if(this.selMode == "Single"){
				var selectIdx = this.oTree.getSelectedIndices();
				
				if(selectIdx.length > 0){
					chk = "";
					for(var i=0; i<selectIdx.length; i++){
						var path = this.oTree.getContextByIndex(selectIdx[i]).getPath().replace("/","");
												
						var strText = this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Name
						            +" (" + this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Id + ")"
						var token = new sap.m.Token({
							key : this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path].Id,
							text : strText
						});
						aTokens.push(token);
						aObj.push(this.oTree.getContextByIndex(selectIdx[i]).getModel().oData[path]);
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
				//var flList = this.oMain.oController.getView().byId("flList");
				aTokens = this.flList.getTokens();				
			}			
			
			if(this.selMode == "MultiToggle"){
				this.oTree.clearSelection();
			}
			
			this.oDialog.close();
			this.shMain.onClose_funcLocation(aTokens, aObj);	
		},
		
		
		onCloseDialog : function(oEvent){
			debugger;

/*			if(this.selMode == "MultiToggle"){
				//this.shMain.onClose_funcLocation(this.old_token);
				for(var i=0; i<this.old_token.length; i++){
					var token = new sap.m.Token({
						key : this.old_token[i].getKey(),
						text : this.old_token[i].getText()
					});
					this.oMainParam.fl.addToken(token);
				}
				this.oTree.clearSelection();
			}*/
			
			if(this.selMode == "MultiToggle"){
				var aTokens = [];
				if(this.old_token){
					for(var i=0; i<this.old_token.length; i++){
						var token = new sap.m.Token({
							key : this.old_token[i].getKey(),
							text : this.old_token[i].getText()
						});
						aTokens.push(token);
					}
				}
				this.shMain.onClose_funcLocation(aTokens);	
				this.oTree.clearSelection();
			}
			
			this.oDialog.close();
			
		},
		
		
		onCollapse_fl : function(oEvent){
			 this.oTree.collapseAll();
		},
		
			
		onExpand_fl : function(oEvent){
			 this.oTree.expandToLevel("1");
		},
		
		
		
		
      /*******************************************************
       * Local function
       *******************************************************/
        _set_search_field : function() {
			
			this.oSwerk = this.oMain.oController.getView().byId("swerk_fl");

			for(var i=0; i<this.arr_swerk.length; i++){
				var template = new sap.ui.core.Item();
	            template.setKey(this.arr_swerk[i].Value);
	            template.setText(this.arr_swerk[i].KeyName);
	            this.oSwerk.addItem(template);
		     }
			 
         },
		
		
		_set_tree : function() {
			var lange = this.oMainParam.getLanguage();
			var swerk = this.oSwerk.getSelectedKey();
			
			var oModel = this.oMain.getModel();
	    	oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
      
			this.oTree = this.oMain.oController.getView().byId("fl_tree");
			this.oTree.setSelectionMode(this.selMode);
			
     	    var s_path = "equip>/EqTreeSet";
		    var rows = {
	              path : s_path, 
	              filters: [
	            	  new sap.ui.model.Filter("Swerk", sap.ui.model.FilterOperator.EQ, swerk),
	            	  new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, lange),
	            	  new sap.ui.model.Filter("Mode", sap.ui.model.FilterOperator.EQ, "L")
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
		},
	
	});
	
});