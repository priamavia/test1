sap.ui.define([
  ], function () {
   "use strict";

  return {
    /**
     * Root URL for the Service
     *
     * @public
     * @param {string} sUrl value
     * @returns {string} Url value
     */
	  getUrl : function (sUrl) {
       	if (sUrl == "")
       		return sUrl;
       	if (window.location.hostname == "localhost"){
       		return "proxy" + sUrl;
       	}else{
       		return sUrl;
       	}
    }
   };

 }
 );
