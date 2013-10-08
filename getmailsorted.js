
function sort_email_HandlerObject() {
};


sort_email_HandlerObject.prototype = new ZmZimletBase();
sort_email_HandlerObject.prototype.constructor = sort_email_HandlerObject;


sort_email_HandlerObject.prototype.init =
function() {

	this.dateList = new DatePrefs();
	
	this.MainFolderName=this.getMessage("TestFoldName");
	this.MainFolderId;
	//this._getAllemlINfo();
	//this.getAllFolderId();
	
};
sort_email_HandlerObject.prototype.doubleClicked =
function() {	
	this.singleClicked();
};
sort_email_HandlerObject.prototype.singleClicked =
function() {	
	this._displayDialog();
};


sort_email_HandlerObject.prototype._displayDialog = 
function() {
	if (this.preferenceDialog) {
		this.preferenceDialog.popup(); 
		return;
	}
		
	var preferenceView = new DwtComposite(this.getShell()); 
	preferenceView.setSize("250", "100");
	preferenceView.getHtmlElement().style.overflow = "auto"; 
	preferenceView.getHtmlElement().innerHTML = this.createDialogpreferenceView(); 
	
	Dwt.setHandler(document.getElementById("Createfolder"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.createSortFolder, this));
	Dwt.setHandler(document.getElementById("MoveMsg"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._MoveMessage, this));
	Dwt.setHandler(document.getElementById("getInfo"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.getAllFolderId, this));
	Dwt.setHandler(document.getElementById("AddressFolder"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.getAllAddr, this));
	
	this.preferenceDialog = new ZmDialog( { title:"Sort Emails", view:preferenceView, parent:this.getShell(), standardButtons:[DwtDialog.OK_BUTTON] } );
	this.preferenceDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okBtnListener));

	this.preferenceDialog.popup();
};

sort_email_HandlerObject.prototype.createDialogpreferenceView =
function() {
	var html = new Array();
	var i = 0;
	html[i++] = "<table>";
	html[i++] = "<tr>";
	html[i++] = "<td><input id='Createfolder'  type='button' value='Create Folder'/></td>";
	html[i++] = "<td><input id='MoveMsg'  type='button' value='Move'/></td>";
	html[i++] = "<td><input id='getInfo'  type='button' value='getInfo'/></td>";
	html[i++] = "<td><input id ='AddressFolder' type='button' value='addefolder'/></td>";
	html[i++] = "</tr>";
	html[i++] = "</table>";

	return html.join("");
};


sort_email_HandlerObject.prototype._okBtnListener =function() {
	this.preferenceDialog.popdown(); 
}
//reset view
sort_email_HandlerObject.prototype.resetView = function() {
	try {
		q="in:inbox";
		appCtxt.getSearchController().search({query:q});
	} catch(e) {
	}
};

//get all email address
sort_email_HandlerObject.prototype.getAllAddr = function(){
	var msgArray = appCtxt.getCurrentController().getList().getArray();
	var address;
	for(var i = 0 ; i < msgArray.length ; i ++){
		address = msgArray[i].participants._array[0].name;
		if(address=="")
			address="admin";
		var emailAddrInfo = this.dateList.getAddress(address);
		if (!emailAddrInfo) {
			emailAddrInfo = new AddressInfo(address);
			this.dateList.addAddr(emailAddrInfo);
			console.log(address);
			this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,address);
		}		
	}
	console.log(this.dateList);
}

//move all message
sort_email_HandlerObject.prototype._MoveMessage = function (){
	var q = appCtxt.getSearchController().currentSearch.query;
	if(q!="in:inbox"){
		this.resetView();
		appCtxt.setStatusMsg("Please click [move] button again");
	}
	else{
		var msgArray = appCtxt.getCurrentController().getList().getArray();
		for(var i = 0 ; i < msgArray.length ; i ++){
			var EmlDate = new Date(msgArray[i].date);	
			msgArray[i].move(this.dateList.getMonthId(EmlDate.getFullYear(),EmlDate.getMonth()+1),null,this._handlErrorResponse);
		}
		appCtxt.setStatusMsg("Moving finished");
		this.resetView();
	}
}
//get all message information
sort_email_HandlerObject.prototype._getAllemlINfo = function (){
	var msgArray = appCtxt.getCurrentController().getList().getArray();
	var eml_year , eml_mon;
	for ( var i = 0 ; i < msgArray.length ; i++ )
	{
		var EmlDate = new Date(msgArray[i].date);
		eml_year =  EmlDate.getFullYear().toString();
		eml_mon  =  EmlDate.getMonth()+1 ;
		var emailDateInfo = this.dateList.getByYear("year_"+eml_year);
		if (!emailDateInfo) {
			emailDateInfo = new DateInfo(eml_year);
			this.dateList.add(emailDateInfo);
		}		
		this.dateList.setEmailMon(eml_year,eml_mon);
	}
}

//getAllfolder
sort_email_HandlerObject.prototype.getAllFolderId=function(){
	if(this._checkFolder(this.MainFolderName,appCtxt.getFolderTree().root.id))
		this.createSortFolder();
	this._getAllFolderId(this.MainFolderName);
	//console.log(this.dateList);
}

//create new folder
sort_email_HandlerObject.prototype.createSortFolder=function(){


	// create main folder
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.MainFolderName);
	var YearID;
	var date = new Date();
	
	for(var i = date.getFullYear() ; this.dateList.checkYear("year_"+i) ; i--){
		var list = this.dateList.getByYear("year_"+i);
	
		YearID=this.CreateNewFolder(this.MainFolderId,list._year);
		for(var j = 1 ; j <= 12 ; j++){
			if(list.monthArray[j]){
				this.CreateNewFolder(YearID,j.toString());
			}
		}
	}
}

/**
* creating folder 
* soap request and response
*/
//get folder request and response to check folder 
sort_email_HandlerObject.prototype._checkFolder=function(Fldrname,ParentId){
	var isFolderCreate = false;
	var soapDoc = AjxSoapDoc.create("GetFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("l", ParentId);
	var params = {soapDoc: soapDoc , asyncMode: false , callback: null , errorCallback: null};
    var response = appCtxt.getAppController().sendRequest(params);
	var Mainfolders = response.GetFolderResponse.folder[0].folder;
	//console.log(Mainfolders);
	for(var i = 0 ; i < Mainfolders.length ; i++ ){
		if( Mainfolders[i].name == Fldrname){
			isFolderCreate=true;
			break;
		}
	}
	return !isFolderCreate;
}
//get folder request and response to get all folder ID
sort_email_HandlerObject.prototype._getAllFolderId=function(Fldrname){
	var flrTree=appCtxt.getFolderTree().root.children._array;
	var mainFloder;
	for(var i = 0 ; i < flrTree.length ; i++){
		if( flrTree[i].name == Fldrname)
			mainFloder = flrTree[i].children._array;
	}
	for(var i = 0 ; i < mainFloder.length ; i++){
		this.dateList.setYearId(mainFloder[i].name,mainFloder[i].id);
		//console.log(mainFloder[i].name,mainFloder[i].id);
		for(var j = 0 ; j < mainFloder[i].children._array.length ; j++){
			this.dateList.setMonthId(mainFloder[i].name,
									 mainFloder[i].children._array[j].name,
									 mainFloder[i].children._array[j].id
									);
		}
	}
}

//create folder request and response then return folder ID
sort_email_HandlerObject.prototype.CreateNewFolder=function(_parent,_fldrName){

    var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
    var folderNode = soapDoc.set("folder");
    folderNode.setAttribute("name",_fldrName);
	folderNode.setAttribute("color","3");
	folderNode.setAttribute("l",_parent);
    var params = {soapDoc: soapDoc,asyncMode: false,callback:null,errorCallback:null};
    var response=appCtxt.getAppController().sendRequest(params);
	return(response.CreateFolderResponse.folder[0].id);
}

/***DateInfo**/
function DateInfo(year){
	this._id=0;
	this._year = year;
	this.monthId= [0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.monthArray = [false,false,false
					  ,false,false,false
					  ,false,false,false
					  ,false,false,false,false];			  
}
//function of DataInfo 
DateInfo.prototype.getYear = function() {
	return this._year;
};
DateInfo.prototype.setMonth = function( month ){
	this.monthArray[month] = true ;
};
DateInfo.prototype.set_Id = function( n ){
	this._id=n;
};
DateInfo.prototype.setMonth_Id = function( month ,n){
	this.monthId[month] = n ;
};

/***AddressInfo**/
function AddressInfo(a){
	this.address = a;
	this.fldID;
}
//function of AddrerssInfo
AddressInfo.prototype.getAddr = function(){
	return this.address;
}
/***datePrefs**/
function DatePrefs() {
	this.dateArray = [];
	this.addressArray = [];
}
//dataPrefs's function for addressArray 
DatePrefs.prototype.getAddress = function ( addr ) {
    if (this.addressArray.hasOwnProperty(addr)) {
        return this.addressArray[addr];
    }
};
DatePrefs.prototype.addAddr = function ( AddressInfo ) {
	this.addressArray[AddressInfo.getAddr()] = AddressInfo;
};


//dataPrefs's function for dataArray
DatePrefs.prototype.add = function( DateInfo ) {
	this.dateArray["year_"+DateInfo.getYear()] = DateInfo;
};

DatePrefs.prototype.getByYear = function ( year ) {
    if (this.dateArray.hasOwnProperty(year)) {
        return this.dateArray[year];
    }
};
DatePrefs.prototype.checkYear = function ( year ) {
    if (this.dateArray.hasOwnProperty(year)) {
        return true;
    }
	return false;
};
DatePrefs.prototype.setEmailMon = function ( year , month ){
	this.dateArray["year_"+year].setMonth(month);
};
DatePrefs.prototype.setYearId = function ( year , id ){
	this.dateArray["year_"+year].set_Id(id);
};
DatePrefs.prototype.setMonthId = function ( year , month , id){
	this.dateArray["year_"+year].setMonth_Id(month,id);
};
DatePrefs.prototype.getMonthId = function ( year , month){
	return this.dateArray["year_"+year].monthId[month];
};