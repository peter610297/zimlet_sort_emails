
function sort_email_HandlerObject() {
};


sort_email_HandlerObject.prototype = new ZmZimletBase();
sort_email_HandlerObject.prototype.constructor = sort_email_HandlerObject;


sort_email_HandlerObject.prototype.init =
function() {

	this.dateList = new MailPrefs();
	this.YMFolderName=this.getMessage("FolderName_YearMonth");
	this.MFolderName=this.getMessage("FolderName_Month");
	this.AFolderName=this.getMessage("FolderName_Address");
	this.MainFolderId;
	this.currentFolder;
	
};
sort_email_HandlerObject.prototype.doubleClicked =
function() {	
	this.singleClicked();
};
sort_email_HandlerObject.prototype.singleClicked =
function() {	
	this._getAllemlINfo();
	this._displayDialog();
};


sort_email_HandlerObject.prototype._displayDialog = 
function() {
	if (this.preferenceDialog) {
		this.preferenceDialog.popup(); 
		return;
	}
	
	var preferenceView = new DwtComposite(this.getShell()); 
	preferenceView.setSize("300", "135");
	preferenceView.getHtmlElement().style.overflow = "auto"; 
	preferenceView.getHtmlElement().innerHTML = this.createDialogpreferenceView(); 
	
	//Dwt.setHandler(document.getElementById("CreateYearfolder"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.createYearFolder, this));
	//Dwt.setHandler(document.getElementById("CreateMonthfolder"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.createMonthFolder, this));
	//Dwt.setHandler(document.getElementById("AddressFolder"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.createAddrFolder, this));
	Dwt.setHandler(document.getElementById("MoveMsg"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._MoveMessage, this));
	Dwt.setHandler(document.getElementById("getInfo"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.getAllFolderId, this));
	
	
    var createButtonId = Dwt.getNextId();
	var createButton = new DwtDialog_ButtonDescriptor(createButtonId, ("Create"), DwtDialog.ALIGN_RIGHT);
	this.preferenceDialog = new ZmDialog( { title:"Sort Emails", view:preferenceView, parent:this.getShell(), standardButtons:[DwtDialog.CANCEL_BUTTON], extraButtons:[createButton]} );
	this.preferenceDialog.setButtonListener(createButtonId, new AjxListener(this, this.createBtnListener));
	
	this.preferenceDialog.popup();
};

sort_email_HandlerObject.prototype.createDialogpreferenceView =
function() {
	var html = new Array();
	var i = 0;
	html[i++] = "<div class='banner'>Choose One Sorting Type</div>";
	html[i++] = "<input id='r1' type='radio' name='SelectGroup'/><label for='r1'>Year/Month</label><br/>";
	html[i++] = "<input id='r2' type='radio' name='SelectGroup'/><label for='r2'>Only Month</label><br/>";
	html[i++] = "<input id='r3' type='radio' name='SelectGroup'/><label for='r3'>Sender Name</label><br/>";
	html[i++] = "<div id='notice_front' style='background:GRAY;height:25px;'></div>";
	html[i++] = "<div id='notice' class='vanish' style='display:none;'>PlEASE SELECT ONE SORTING TYPE!</div>";
	html[i++] = "<table><tr>";
//	html[i++] = "<td><input id='CreateYearfolder'   type='button' value='Year Folder'/></td>";
//	html[i++] = "<td><input id='CreateMonthfolder'  type='button' value='month Folder'/></td>";
//	html[i++] = "<td><input id ='AddressFolder' type='button' value='addefolder'/></td>";
	html[i++] = "<td><input id='MoveMsg'  type='button' value='Move'/></td>";
	html[i++] = "<td><input id='getInfo'  type='button' value='getInfo'/></td>";
	html[i++] = "</tr></table>";
	return html.join("");
};

//createbutton listener
sort_email_HandlerObject.prototype.createBtnListener = function() {
	var checkbox1 = document.getElementById("r1");
	var checkbox2 = document.getElementById("r2");
	var checkbox3 = document.getElementById("r3");
	var noticediv = document.getElementById("notice");
	var noticefrontdiv = document.getElementById("notice_front");
	if(checkbox1.checked){
		this.createYearFolder();
		this.preferenceDialog.popdown();
	}
	else if(checkbox2.checked){
		this.createMonthFolder();
		this.preferenceDialog.popdown();
	}
	else if(checkbox3.checked){
		this.createAddrFolder();
		this.preferenceDialog.popdown();
	}
	else{
		noticefrontdiv.style.display="none";
		noticediv.style.display="";
	}
};

//reset view
sort_email_HandlerObject.prototype.resetView = function() {
	try {
		q="in:inbox";
		appCtxt.getSearchController().search({query:q});
	} catch(e) {
	}
};

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
	var msgArray = appCtxt.getCurrentController().getList().getArray();
	//console.log(msgArray);
	/*
	if(this._checkFolder(this.YMFolderName,appCtxt.getFolderTree().root.id))
		this.createYearFolder();
	*/
	this._getAllFolderId(this.AFolderName);
	
	//console.log(this.dateList);
}
/********************************************************
* function for creating folder                          * 
* [month]/[year/month]/address name                     *
*********************************************************/
//create folder(address)
sort_email_HandlerObject.prototype.createAddrFolder = function(){
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.AFolderName);
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
			this.CreateNewFolder(this.MainFolderId,address);
		}		
	}
	console.log(this.dateList);
}
//create folder(month)
sort_email_HandlerObject.prototype.createMonthFolder=function(){
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.MFolderName);
	for(var i=1;i<=12;i++){
		this.CreateNewFolder(this.MainFolderId,i);
	}
}
//create folder(year/month)
sort_email_HandlerObject.prototype.createYearFolder=function(){
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.YMFolderName);
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

/********************************************************
* soap request and response                             *
* creating folder / get mail info                       * 
*********************************************************/
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
	if(Fldrname=="[Year&Month]"){
		for(var i = 0 ; i < mainFloder.length ; i++){
			this.dateList.setYearId(mainFloder[i].name,mainFloder[i].id);
			for(var j = 0 ; j < mainFloder[i].children._array.length ; j++){
				this.dateList.setMonthId(mainFloder[i].name,
										 mainFloder[i].children._array[j].name,
										 mainFloder[i].children._array[j].id
										);
			}
		}
	}
	else if(Fldrname==this.AFolderName){
		for( var i =0 ; i < mainFloder.length ; i++){
			this.dateList.setAddrId(mainFloder[i].name,mainFloder[i].id);
		}
	}
	console.log(this.dateList);
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
/********************************************************
* Date type                                             * 
* DataInfo/AddressInfo/MailPrefs                        *
*********************************************************/
///////////DateInfo///////////
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

///////////AddressInfo///////////
function AddressInfo(a){
	this.name = a;
	this.fldID = 0;
}
//function of AddrerssInfo
AddressInfo.prototype.getAddr = function(){
	return this.name;
}
AddressInfo.prototype.setAddr_id = function( i ){
	this.fldID = i;
}
///////////MailPrefs///////////
function MailPrefs() {
	this.dateArray = [];
	this.addressArray = [];
}
//MailPrefs's function for addressArray 
MailPrefs.prototype.getAddress = function ( addr ) {
    if (this.addressArray.hasOwnProperty(addr)) {
        return this.addressArray[addr];
    }
};
MailPrefs.prototype.addAddr = function ( AddressInfo ) {
	this.addressArray[AddressInfo.getAddr()] = AddressInfo;
};
MailPrefs.prototype.setAddrId = function (n,id){
	this.addressArray[n].setAddr_id(id);
}

//MailPrefs's function for dataArray
MailPrefs.prototype.add = function( DateInfo ) {
	this.dateArray["year_"+DateInfo.getYear()] = DateInfo;
};

MailPrefs.prototype.getByYear = function ( year ) {
    if (this.dateArray.hasOwnProperty(year)) {
        return this.dateArray[year];
    }
};
MailPrefs.prototype.checkYear = function ( year ) {
    if (this.dateArray.hasOwnProperty(year)) {
        return true;
    }
	return false;
};
MailPrefs.prototype.setEmailMon = function ( year , month ){
	this.dateArray["year_"+year].setMonth(month);
};
MailPrefs.prototype.setYearId = function ( year , id ){
	this.dateArray["year_"+year].set_Id(id);
};
MailPrefs.prototype.setMonthId = function ( year , month , id){
	this.dateArray["year_"+year].setMonth_Id(month,id);
};
MailPrefs.prototype.getMonthId = function ( year , month){
	return this.dateArray["year_"+year].monthId[month];
};