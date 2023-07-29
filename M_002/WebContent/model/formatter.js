sap.ui.define([
               ], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		strToFormatDate : function (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: this.dateFormat
			});

			if (value){						
				if(value.length === 8){
					var yyyy = value.slice(0,4);
					var mm = value.slice(4,6);
					var dd = value.slice(6);

					var strDate = yyyy + "-" + mm + "-" + dd;

					return oDateFormat.format( new Date(strDate) );			    		  
				}else{
					return value;
				} 

			}else{
				return value;
			}
		},

		strToDate : function (value) {
			if (value){						
				if(value.length === 8){
					var yyyy = value.slice(0,4);
					var mm = value.slice(4,6);
					var dd = value.slice(6);

					var strDate = yyyy + "-" + mm + "-" + dd;

					return new Date(strDate);			    		  
				}else{
					return value;
				} 

			}else{
				return value;
			}
		},


		dateToStr : function(value){
			if(value){
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyyMMdd"
				});
				return oDateFormat.format( new Date(value) );
			}else{
				return "00000000";
			}
		},

		dateToFormatStr : function (value) {
			if (value){						
				if(value.length === 8){
					var yyyy = value.slice(0,4);
					var mm = value.slice(4,6);
					var dd = value.slice(6);

					var strDate = yyyy + "-" + mm + "-" + dd;

					return strDate;
				}else{
					return value;
				} 

			}else{
				return value;
			}
		},	      


		timeToStr : function(value){
			if(value){
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "HHmmss"
				});
				return oDateFormat.format( new Date(value) );
			}else{
				return "000000";
			}
		},

		dateTimeToStr : function(value){
			if(value){
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyyMMdd-HHmmss"
				});
				return oDateFormat.format( new Date(value) );
			}else{
				return "00000000-000000";
			}
		},

		currencyValue : function (sValue) {
			if (!sValue) {	 return ""; }

			return parseFloat(sValue).toFixed(2);
		},

		// Formatter for icon visibility
		setIconVisible : function (sValue) {
			return !!sValue;
		},

		// Formatter for text visibility
		setTextVisible : function (sValue) {
			return !sValue;
		}	    
	};

}
);
