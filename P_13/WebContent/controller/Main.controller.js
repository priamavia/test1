sap.ui.define([
    "cj/pm0050/controller/BaseController",
    "cj/pm0050/util/ValueHelpHelper",
    "cj/pm0050/util/utils",
	"cj/pm0050/model/formatter",     
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "jquery.sap.global"
  ], function (BaseController, ValueHelpHelper, utils, formatter, Filter, FilterOperator, JSONModel, Message, Toast, jQuery ) {
    "use strict";

    return BaseController.extend("cj.pm0050.controller.Main", {
    	formatter : formatter,

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @public
     */
      onInit : function () {
			/*
			 * Table Filter 
			 */
			this._oGlobalFilter = null;	
			
			var oView = this.getView();
		    // Table Filter set 
		  	var oTable = oView.byId("table");
				oView.setModel(new JSONModel({
					globalFilter: "",
					availabilityFilterOn: false,
					cellFilterOn: false
				}), "ui");
      },

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    */
      onBeforeRendering: function() {
//        this.i18n = this.getView().getModel("i18n").getResourceBundle();

        // Maintenance Plan UI
        var oSwerk;
        var arr_swerk = [];
        var arr_kostl = [];
        var arr_kokrs = [];

        this.oSwerk = this.getView().byId("swerk");
//        utils.makeSerachHelpHeader(this);	
        
        this.getLoginInfo();
        this.set_userData();  //"User Auth"

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
				   				   
				   controll.set_UserInfo(userDefault);
				   
				   debugger;
				   this.i18n = this.getView().getModel("i18n").getResourceBundle();				
				   utils.makeSerachHelpHeader(this);
				   
				   controll.set_auth();
				   controll.setInitData();	
				   controll._set_search_field();
				   
				   this.oMtp.setSelectedKey("ERSA");
				   this.onChange_mtart();
				   
				    // set default value 
				   //controll.set_search_field();
				   
				}.bind(this),
				error : function(oError) {
					this.i18n.getText("oData_conn_error"),
					sap.m.MessageBox.Icon.ERROR,
				    this.i18n.getText("error")						
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
        this.arr_swerk  = this.get_Auth("SWERK");
        this.arr_kostl  = this.get_Auth("KOSTL");
        this.arr_kokrs  = this.get_Auth("KOKRS");
		this.locDate    = this.get_Auth("LOCDAT")[0].Value;
		this.locTime    = this.get_Auth("LOCTIM")[0].Value;
		this.dateFormat = this.get_Auth("DATFORMAT")[0].Value;
		this.sep        = this.get_Auth("SEP")[0].Value;          
      },

		setInitData : function(){	    
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
		onSearch_equipStock : function(oEvent){
			var lange = this.getLanguage();
			var swerk = this.oSwerk.getSelectedKey();
			//임시 
			//swerk = "3011";
			//debugger;
			
			var chk = 0;		
			var matnr_arr = [];
			var mtart_arr = [];
			var matkl_sub_arr = [];
			var matkl_arr = [];
			var name_arr = [];
			var mrp_arr = [];
			var spec_arr = [];
			var desc_arr = [];
			var maker_arr = [];
			var subtype_arr = [];
			
			var s_filter = [];
			
			var matnr = this.getView().byId("matnr").getValue();
			if(matnr){
				matnr_arr.push(matnr);
				s_filter.push(utils.set_filter(matnr_arr, "Matnr"));
			}
			
			var mtart = this.getView().byId("mtart").getSelectedKey();
			if(mtart){
				mtart_arr.push(mtart);
				s_filter.push(utils.set_filter(mtart_arr, "Mtart"));
			}

//			var matkl_sub = this.getView().byId("matkl_sub").getSelectedKey();
//			if(matkl_sub){
//				matkl_sub_arr.push(matkl_sub);
//				s_filter.push(utils.set_filter(matkl_sub_arr, "MatklSub"));
//			}
					
			var matkl = this.getView().byId("matkl").getSelectedKey();
			if(matkl){
				matkl_arr.push(matkl);
				s_filter.push(utils.set_filter(matkl_arr, "Matkl"));
			}
			var name = this.getView().byId("name").getValue();  
			if(name){
				name_arr.push(name);
				s_filter.push(utils.set_filter(name_arr, "Name"));
				chk = chk + 1;
			}
			var mrp = this.getView().byId("mrp").getSelectedKey();  //Dispo
			if(mrp){
				mrp_arr.push(mrp);
				s_filter.push(utils.set_filter(mrp_arr, "Dispo"));
			}
			var spec = this.getView().byId("spec").getValue(); //Groes
			if(spec){
				spec_arr.push(spec);
				s_filter.push(utils.set_filter(spec_arr, "Groes"));	
				chk = chk + 1;
			}
			var desc = this.getView().byId("desc").getValue();  //Maktx
			if(desc){
				desc_arr.push(desc);
				s_filter.push(utils.set_filter(desc_arr, "Maktx"));
			}
			var maker = this.getView().byId("maker").getValue();
			if(maker){
				maker_arr.push(maker)
				s_filter.push(utils.set_filter(maker_arr, "Maker"));
				chk = chk + 1;
			}
			
			var subtype = this.getView().byId("matkl_sub").getSelectedKey();
			if(subtype){
				subtype_arr.push(subtype);
				s_filter.push(utils.set_filter(subtype_arr, "Subtype"));
			}
			
			
			//Test 데이터가 존재 하지 않음 
/*			if(chk === 0){
				sap.m.MessageBox.show(
					 this.i18n.getText("searchErr"),
					 sap.m.MessageBox.Icon.ERROR,
					 this.i18n.getText("error")
			    );
			}else{*/
				
				var chk_mfrgr ;
				var chk_local = this.getView().byId("local").getSelected();
				
				var chk_import = this.getView().byId("import").getSelected();
				if(chk_local===true && chk_import===true){
					
				}else if(chk_local === true && chk_import===false){
					chk_mfrgr = "Mfrgr eq '01'"
				}else if(chk_local === true && chk_import===false){
					chk_mfrgr = "Mfrgr eq '02'"
				}
			   
				var filterStr = "Swerk eq '"+ swerk + "' and Spras eq '"+ lange +"'";
				
				if(chk_mfrgr){
					filterStr = filterStr + " and " + chk_mfrgr;
				}
				
	            for(var i=0; i<s_filter.length; i++){
	              filterStr = filterStr + " and " + s_filter[i];
	            }
	            
	            this.get_data(filterStr);
	//		}       
		},
	
		
		get_data : function(filterStr){

			var oModel =  this.getView().getModel();
		    var path = "/EquipStockSet";
		    
			var controll = this;
			
			this.oTable = this.getView().byId("table");
			
			oModel.attachRequestSent(function(){controll.oTable.setBusy(true);});
			oModel.attachRequestCompleted(function(){controll.oTable.setBusy(false);
													 controll.oTable.setShowNoData(true);});
			
			var mParameters = {
			    urlParameters : {
					"$filter" : filterStr
				},
				success : function(oData) {
				 				 
				 var oODataJSONModel =  new sap.ui.model.json.JSONModel();  
				 oODataJSONModel.setData(oData);
				 
				 controll.oTable.setModel(oODataJSONModel);
				 controll.oTable.bindRows("/results");
			
				}.bind(this),
				error : function(oError) {
					this.i18n.getText("oData_conn_error"),
					sap.m.MessageBox.Icon.ERROR,
				    this.i18n.getText("error")						
//					jQuery.sap.log.info("Odata Error occured");
//					Toast.show("Error");
				}.bind(this)
			};
			
			debugger;
			oModel.read(path, mParameters);			
		},
		
		    
		/*
		 * ComboBox select
		 */
		onSwerkSelect : function(oEvent) {	
			//this.oMag.setSelectedKey("");
			this.oMtp.setSelectedKey("");
			this.oMrc.setSelectedKey("");
			
			this.oMtp.removeAllItems();

			if(this.oSbg){				
				this.oSbg.removeAllItems();
			}
			
			if(this.oMag){
				this.oMag.removeAllItems();
			}				
			
			this.oMrc.removeAllItems();			

		    //this.getView().byId("matkl").setValue("");
			this.getView().byId("name").setValue("");  
			//this.getView().byId("mrp").setValue("");//Dispo
			this.getView().byId("spec").setValue(""); //Groes
			this.getView().byId("desc").setValue("");  //Maktx
			this.getView().byId("maker").setValue("");
			
			this._set_search_field();
			this.oMtp.setSelectedKey("ERSA");
			this.onChange_mtart();
		},		
				
		onChange_mtart : function(oEvent){
		    var v_swerk = this.oSwerk.getSelectedKey();
		    var v_mtart = "";
		    
			if(oEvent){
				if(oEvent.getParameters().selectedItem){
					v_mtart = oEvent.getParameters().selectedItem.getKey();
				}
				
			}else{
				 var v_mtart = this.oMtp.getSelectedKey();
			}
		    
			this.oSbg = this.getView().byId("matkl_sub");
			
			if(this.oSbg){
				this.oSbg.removeAllItems();
				this.oSbg.setSelectedKey("");
				utils.set_search_field(v_swerk, this.oSbg, "sbg", "C", v_mtart, "");
			}
			
			this.oMag = this.getView().byId("matkl");		    // Material Group

			if(this.oMag){
				this.oMag.removeAllItems();
				this.oMag.setSelectedKey("");
				utils.set_search_field(v_swerk, this.oMag, "mag", "C", "", "");				
			}			
		},	
		
		onChange_matkl_sub : function(oEvent){	
			var v_matkl_sub = "";
			
			if(oEvent.getParameters().selectedItem){
				v_matkl_sub = oEvent.getParameters().selectedItem.getKey();	
			}
		     
		    var v_swerk = this.oSwerk.getSelectedKey();
		    
			this.oMag = this.getView().byId("matkl");		    // Material Group
			
			if(this.oMag){
				this.oMag.removeAllItems();
				this.oMag.setSelectedKey("");
				utils.set_search_field(v_swerk, this.oMag, "mag", "C", v_matkl_sub, "");
			}
		},			
				
	/*************************************************************************
	 *  Local function
	 **************************************************************************/
		/* 
		 * PM Possible Entry Odata Set 
		 */	
		_set_search_field : function() {
			var v_swerk = this.oSwerk.getSelectedKey();

			this.oMtp = this.getView().byId("mtart");		    // Material Group
			if(this.oMtp){
				utils.set_search_field("", this.oMtp, "mtp", "C", "", "");
			}				
			
			this.oMag = this.getView().byId("matkl");		    // Material Group
			if(this.oMag){
				utils.set_search_field(v_swerk, this.oMag, "mag", "C", "", "");
			}				
			
			this.oMrc = this.getView().byId("mrp");			// MRP Controller
			if(this.oMrc){
				utils.set_search_field(v_swerk, this.oMrc, "mrc", "C", "", "");
			}				
	
		},

		
		/**
		* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		*/
//			onExit: function() {
//			}
			
       onValueHelpRequest : function(oEvent){
			var strArr = oEvent.oSource.sId.split("--");
			var cnt = strArr.length - 1;
			var sIdstr = strArr[cnt];
					
			var s_swerk = this.oSwerk.getSelectedKey();
			
     		utils.openValueHelp(sIdstr);
		},	
						
		/****************************************************************
		 *  Event Handler
		 ****************************************************************/				
		// download excel
		downloadExcel : function(oEvent) {
			var oModel, oTable, sFilename;
			
			oTable = this.getView().byId("table");
			oModel = oTable.getModel();
			sFilename = "File";
			
			utils.makeExcel(oModel, oTable, sFilename);
		},
				
		// clear Sort 	
		clearAllSortings : function(oEvent) {
			var oTable = this.getView().byId("table");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},

		// clear filter
		clearAllFilters : function(oEvent) {
			var oTable = this.getView().byId("table");

			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			this._oGlobalFilter = null;

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		// Search filter set
		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			if (sQuery) {
				this._oGlobalFilter = new Filter(
				[
					new Filter("Matnr", FilterOperator.Contains,sQuery),
					new Filter("Maktx", FilterOperator.Contains,sQuery),
					new Filter("LgortT", FilterOperator.Contains,sQuery) 			
			    ], 
			    false)
			}
			this._filter();
		},
			
		_resetSortingState : function() {
			var oTable = this.getView().byId("table");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},
		
		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.getView().byId("table").getBinding("rows").filter(oFilter,
					"Application");
		},		
		
		_clearTable : function(){
			var tableModel = this.oTable.getModel();
			var odata = tableModel.getData();
			
			odata = [];
			tableModel.setData(odata);
		}
		
    });
  }
);