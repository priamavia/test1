sap.ui.define([
    "cj/pm0060/controller/BaseController",
    "cj/pm0060/util/ValueHelpHelper",
    "cj/pm0060/util/utils",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "jquery.sap.global"
  ], function (BaseController, ValueHelpHelper, utils, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
    "use strict";

    return BaseController.extend("cj.pm0060.controller.Main", {
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @public
     */
      onInit : function () {

		    this.renderingSkip = "";    	  
      },

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    */
      onBeforeRendering: function() {
    	  
			if(this.renderingSkip == ""){
				
//		        this.i18n = this.getView().getModel("i18n").getResourceBundle();

		        // Maintenance Plan UI
		        var oSwerk;
		        var arr_swerk = [];
		        var arr_kostl = [];
		        var arr_kokrs = [];

		        this.oSwerk = this.getView().byId("swerk");

		        this.getLoginInfo();
		        this.set_userData();  //"User Auth"
		        
		        //debugger;				
			}else{
				this.renderingSkip = "";
			}	
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
					    	"Default" : oData.results[i].Default
						  }
					   );
				   }
				   		
/*//**************************************Test			   
				   userDefault.push(
							 {
						    	"Auth" : "SWERK",
						    	"Value" : "3011",
						    	"Name"  : "Test",
						    	"KeyName" : "Test (3011)",
						    	"Default" : ""
							  }
						   );
//*******************************************				   
*/				   controll.set_UserInfo(userDefault);

				   this.i18n = this.getView().getModel("i18n").getResourceBundle();
				   controll.set_auth();
				   
				    // set default value 
				   controll.set_search_field();
				   controll._set_tree();
				   
				}.bind(this),
				error : function(oError) {
					sap.m.MessageBox.show(
							this.i18n.getText("oData_conn_error"),
							sap.m.MessageBox.Icon.ERROR,
							this.i18n.getText("error")
						);							
//					jQuery.sap.log.info("Odata Error occured");
//					Toast.show("Error");
				}.bind(this)
			};
			oModel.read(path, mParameters);			
		},		


      /*
       * User Default Setting
       */
      set_auth : function(){
        this.arr_swerk = this.get_Auth("SWERK");
        this.arr_kostl = this.get_Auth("KOSTL");
        this.arr_kokrs = this.get_Auth("KOKRS");
		this.locDate    = this.get_Auth("LOCDAT")[0].Value;
		this.locTime    = this.get_Auth("LOCTIM")[0].Value;
		this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
		this.sep        = this.get_Auth("SEP")[0].Value;         
      },

      set_search_field : function() {
		
		this.oSwerk = this.getView().byId("swerk");
  		
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
		 
      },
      
      onSwerkSelect : function(oEvent){
			this._set_tree();
      },

	  _set_tree : function() {
		this.oTree = this.getView().byId("fl_tree");
		  		
//		debugger;
//		this.oTree.setBusy(true);
		
		var lange = this.getLanguage();
		var swerk = this.oSwerk.getSelectedKey();

 	    var s_path = "/EqTreeSet";
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
		 
//		 this.oTree.setBusy(false);
//	     this.oTree.setShowNoData(true);		 
//		 this.oTree.setSelectionMode(this.selMode);
	  },		
      
	  onSelectTree : function(oEvent){
		if(oEvent.getParameter("rowContext")){
			var path = oEvent.getParameter("rowContext").getPath().replace("/","");
			
			var isEqui = oEvent.getParameter("rowContext").getModel().oData[path].isEqui;
			if(isEqui === "X"){
				var sSwerk = this.oSwerk.getSelectedKey();
				var sEqunr = oEvent.getParameter("rowContext").getModel().oData[path].Id;
				var sInvnr = oEvent.getParameter("rowContext").getModel().oData[path].Name;
				
				this.getOwnerComponent().openEquipDetail_Dialog(this, sSwerk, sEqunr);			
			}
		}
      },	
          
      
		onCollapse : function(oEvent){
			var tree = this.getView().byId("fl_tree");
			tree.collapseAll();
		},
		
		
		onExpand : function(oEvent){
			var tree = this.getView().byId("fl_tree");
			
			tree.expandToLevel("1");
		},
			      
      /**
      * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
      * This hook is the same one that SAPUI5 controls get after being rendered.
      */
//        onAfterRendering: function() {

//      },

      /**
      * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
      */
//        onExit: function() {
//        }
 
  	/****************************************************************
  	 *  Event Handler
  	 ****************************************************************/	



    });
  }
);