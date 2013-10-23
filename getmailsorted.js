
function sort_email_HandlerObject() {
};


sort_email_HandlerObject.prototype = new ZmZimletBase();
sort_email_HandlerObject.prototype.constructor = sort_email_HandlerObject;

/********************************************************
* initialize zimlet                                     *
* init/doubleClicked/singleClicked/resetView            *
*********************************************************/

//initial 
sort_email_HandlerObject.prototype.init =
function() {

	//initial DEFAULT_date
	var CurDate = new Date();	
	this.DEFAULT_YEAR=CurDate.getFullYear();
	this.DEFAULT_MONTH=CurDate.getMonth()+1;	
	
	this.dateList = new MailPrefs();
	this.YMFolderName=this.getMessage("FolderName_YearMonth");
	this.MFolderName=this.getMessage("FolderName_Month");
	this.AFolderName=this.getMessage("FolderName_Address");
	this.MainFolderId;
	this.currentFolder;
	
	//set onlymonthArray
	for(var i = 0 ; i<=12 ; i++){
		var onlyInfo = new OnlyMonInfo(i);
		this.dateList.initMonth(onlyInfo);
	}
	
};

//double clicked
sort_email_HandlerObject.prototype.doubleClicked =
function() {	
	this.singleClicked();
};

//single clicked
sort_email_HandlerObject.prototype.singleClicked =
function() {	

	this.getAllemlINfo();
	this._displayDialog();
	
	//initial progress bar 
	var probar = document.getElementById("probar");
	probar.style.width = '0%'; 
};

//reset view
sort_email_HandlerObject.prototype.resetView = function() {
	try {
		q="in:inbox";
		appCtxt.getSearchController().search({query:q});
	} catch(e) {
	}
};

/********************************************************
* dialog view setting                                   *
* displayDialog and set inner Html of dialog            *
*********************************************************/
sort_email_HandlerObject.prototype._displayDialog = function() {
	if (this.preferenceDialog) {
		this.preferenceDialog.popup(); 
		return;
	}
	
	var preferenceView = new DwtComposite(this.getShell()); 
	preferenceView.setSize("300", "265");
	preferenceView.getHtmlElement().style.overflow = "auto"; 
	preferenceView.getHtmlElement().innerHTML = this.createDialogpreferenceView(); 
	

	Dwt.setHandler(document.getElementById("MoveMsg"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._MoveMessage, this));
	Dwt.setHandler(document.getElementById("Create"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.createBtnListener, this));
	
    /*
    var createButtonId = Dwt.getNextId();
	var createButton = new DwtDialog_ButtonDescriptor(createButtonId, ("Create"), DwtDialog.ALIGN_RIGHT);
	this.preferenceDialog = new ZmDialog( { title:"Sort Emails", view:preferenceView, parent:this.getShell(), standardButtons:[DwtDialog.CANCEL_BUTTON], extraButtons:[createButton]} );
	this.preferenceDialog.setButtonListener(createButtonId, new AjxListener(this, this.createBtnListener));
	*/
	this.preferenceDialog = new ZmDialog( { title:"Sort Emails", view:preferenceView, parent:this.getShell(), standardButtons:[DwtDialog.CANCEL_BUTTON]} );
	this.preferenceDialog.popup();
};

sort_email_HandlerObject.prototype.createDialogpreferenceView =
function() {
	var html = new Array();
	var i = 0;
	html[i++] = "<div class='banner'>Choose One Category Type</div>";
	html[i++] = "<input id='r1' type='radio' name='SelectGroup'/><label for='r1'>Year/Month</label><br/>";
	html[i++] = "<input id='r2' type='radio' name='SelectGroup'/><label for='r2'>Only Month</label><br/>";
	html[i++] = "<input id='r3' type='radio' name='SelectGroup'/><label for='r3'>Sender Name</label><br/>";
	html[i++] = "<div id='notice_front' style='background:GRAY;height:25px;'></div>";
	html[i++] = "<div id='notice' class='vanish' style='display:none;'>PlEASE SELECT ONE CARWGORY TYPE!</div>";
	
	
	html[i++] = "<div class='input-group input-group-sm'>";
	html[i++] = "<input type='text' class='form-control' placeholder='Year Limit  DEFAULT["+this.DEFAULT_YEAR +"]' id='yearLimit'>";
	html[i++] = "<input type='text' class='form-control' placeholder='Month Limit  DEFAULT["+this.DEFAULT_MONTH +"]' id='monthLimit'></div>";
	
	html[i++] = "<span class='input-group-btn'>";
    html[i++] = "<button class='btn btn-default btn-sm' type='button' id='MoveMsg'>Move</button>";
	html[i++] = "<button class='btn btn-default btn-sm' type='button' id='Create'>Create</button>";
    html[i++] = "</span>";
/*	  
	html[i++] = "<table><tr>";
//	html[i++] = "<td><input id='getEmailInfo'  type='button' value='getEmailInfo'/></td>";
	html[i++] = "<td><button id='MoveMsg'  type='button' value='Move'/>MOVE</button></td>";
	html[i++] = "<td width=40%><input id='cEmail_emailField' type=\"text\" style=\"width:100%;\" type='text'></input></td>";
	html[i++] = "</tr></table>";
*/
	//progress bar 
	html[i++] ="<div class='progress progress-striped active'>";
    html[i++] ="<div id='probar' class='progress-bar' role='progressbar' aria-valuenow='45' aria-valuemin='0' aria-valuemax='100' style='width: 0%'>";
    html[i++] = '</div></div>';
	return html.join("");
};

/********************************************************
* zimlet function                                       *
* listener / getallinfo /  move mail                    *
*********************************************************/

//createbutton listener
sort_email_HandlerObject.prototype.createBtnListener = function() {
	var checkbox1 = document.getElementById("r1");
	var checkbox2 = document.getElementById("r2");
	var checkbox3 = document.getElementById("r3");
	var noticediv = document.getElementById("notice");
	var noticefrontdiv = document.getElementById("notice_front");
	if(checkbox1.checked){
		this.createYearFolder();
	}
	else if(checkbox2.checked){
		this.createMonthFolder();
	}
	else if(checkbox3.checked){
		this.createAddrFolder();
	}
	else{
		noticefrontdiv.style.display="none";
		noticediv.style.display="";
	}
};

//progressbar Rate
sort_email_HandlerObject.prototype.progressbarRate = function (n){
	var probar = document.getElementById("probar");
	if(n.toFixed()>=0 && n.toFixed()<10)
		probar.style.width = '5%'; 
	else if(n.toFixed()>=10 && n.toFixed()<20)
		probar.style.width = '15%'; 
	else if(n.toFixed()>=20 && n.toFixed()<30)
		probar.style.width = '25%'; 
	else if(n.toFixed()>=30 && n.toFixed()<40)
		probar.style.width = '35%'; 
	else if(n.toFixed()>=40 && n.toFixed()<50)
		probar.style.width = '45%'; 
	else if(n.toFixed()>=50 && n.toFixed()<60)
		probar.style.width = '55%'; 
	else if(n.toFixed()>=60 && n.toFixed()<70)
		probar.style.width = '65%'; 
	else if(n.toFixed()>=70 && n.toFixed()<80)
		probar.style.width = '75%'; 
	else if(n.toFixed()>=80 && n.toFixed()<90)
		probar.style.width = '85%'; 
	else if(n.toFixed()>=90 && n.toFixed()<100)
		probar.style.width = '100%'; 
}

//move all message
sort_email_HandlerObject.prototype._MoveMessage = function (){
	this.getAllemlINfo();
	var q = appCtxt.getSearchController().currentSearch.query;
	var msgArray = appCtxt.getCurrentController().getList().getArray();
	var address;
	
	var CurDate = new Date();	
	var ylimit = document.getElementById("yearLimit").value;
	var mlimit = document.getElementById("monthLimit").value;
	if(mlimit=="")
		mlimit=this.DEFAULT_MONTH;
	if(ylimit=="")
		ylimit=this.DEFAULT_YEAR;

	this.currentFolder=this._checkFolder(appCtxt.getFolderTree().root.id);
	
	if(this.currentFolder==null)
		appCtxt.setStatusMsg("Please click [create] button");
		
	else{
		this.getAllFolderId(this.currentFolder);
		if(q!="in:inbox"){
			this.resetView();
			appCtxt.setStatusMsg("Please click [move] button again");
		}
		else{
		
			//for moving mail to year/month folder
			if(this.currentFolder==this.YMFolderName){
				for(var i = 0 ; i < msgArray.length ; i ++){
					var EmlDate = new Date(msgArray[i].date);	
					msgArray[i].move(this.dateList.getMonthId(EmlDate.getFullYear(),EmlDate.getMonth()+1),null,this._handlErrorResponse);
					this.progressbarRate(i/msgArray.length*100);
				}
			}
			
			//for moving mail to sender name folder
			else if(this.currentFolder==this.AFolderName){
				for(var i = 0 ; i < this.dateList.addressArray.length ; i ++){	
					address = 	this.dateList.addressArray[i].getAddr();
					this.moveEml( this.dateList.getAddrId(this.dateList.addressArray[i].getAddr()) , this.dateList.addressArray[i].mailArray);
				}
			}
			
			//for moving mail to month folder
			else if(this.currentFolder==this.MFolderName){				
				for(var i = 1 ; i < this.dateList.onlyMonthArray.length ; i ++){
					if(this.dateList.getOlyemlId(i).length == 0 ){}
					else
						this.moveEml( this.dateList.getonlyMonthFdrId(i) , this.dateList.getOlyemlId(i));
				}
			}
			
		}
		appCtxt.setStatusMsg("Moving finished");
		this.resetView();
	}
}

//get all message information
sort_email_HandlerObject.prototype.getAllemlINfo = function (){
	var msgArray = appCtxt.getCurrentController().getList().getArray();
	var eml_year , eml_mon;
	for ( var i = 0 ; i < msgArray.length ; i++ )
	{
	    //get information for y/m
		var EmlDate = new Date(msgArray[i].date);
		eml_year =  EmlDate.getFullYear().toString();
		eml_mon  =  EmlDate.getMonth()+1 ;
		var emailDateInfo = this.dateList.getByYear("year_"+eml_year);
		if (!emailDateInfo) {
			emailDateInfo = new DateInfo(eml_year);
			this.dateList.add(emailDateInfo);
		}		
		this.dateList.setEmailMon(eml_year,eml_mon);
		this.dateList.addDateMailId(eml_year,eml_mon,msgArray[i].msgIds[0] );
		
		//get information for only month
		this.dateList.addOlyemlId(eml_mon,msgArray[i].msgIds[0]);	
		
		//get information for senderName
		var senderName = msgArray[i].participants._array[0].name;
		if(senderName=="")
			senderName="admin";
		var emailAddrInfo = this.dateList.getAddress(senderName);
		if (!emailAddrInfo) {
			emailAddrInfo = new AddressInfo(senderName);
			this.dateList.addAddr(emailAddrInfo);
		}	
		this.dateList.AddemlId(senderName,msgArray[i].msgIds[0]);	
	}
	console.log(this.dateList);
}

//getAllfolder
sort_email_HandlerObject.prototype.getAllFolderId=function(currentfdr){
	this._getAllFolderId(currentfdr);
}

/********************************************************
* function for creating folder                          *
* [month]/[year/month]/[address name]                   *
*********************************************************/

//create folder(address)
sort_email_HandlerObject.prototype.createAddrFolder = function(){
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.AFolderName);
	var addr = this.dateList.addressArray;
	for(var i = 0 ; i < addr.length ; i ++){
		this.CreateNewFolder(this.MainFolderId,addr[i].name);
	}
}

//create folder(month)
sort_email_HandlerObject.prototype.createMonthFolder=function(){
	this.MainFolderId=this.CreateNewFolder(appCtxt.getFolderTree().root.id,this.MFolderName);
	this.CreateNewFolder(this.MainFolderId,"month-1");
	this.CreateNewFolder(this.MainFolderId,"month-2");
	this.CreateNewFolder(this.MainFolderId,"month-3");
	this.CreateNewFolder(this.MainFolderId,"month-4");
	this.CreateNewFolder(this.MainFolderId,"month-5");
	this.CreateNewFolder(this.MainFolderId,"month-6");
	this.CreateNewFolder(this.MainFolderId,"month-7");
	this.CreateNewFolder(this.MainFolderId,"month-8");
	this.CreateNewFolder(this.MainFolderId,"month-9");
	this.CreateNewFolder(this.MainFolderId,"month_10");
	this.CreateNewFolder(this.MainFolderId,"month_11");
	this.CreateNewFolder(this.MainFolderId,"month_12");
	
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
* move mail / creating folder / get mail info           * 
*********************************************************/

//move email group function 
 sort_email_HandlerObject.prototype.moveEml=function(folderId,array){
 	var json = {
 		ItemActionRequest: {
 			_jsns: "urn:zimbraMail",
 			action: {
 				id: array.join(),
 				op:	"move",
 				l:	folderId
 			}
 		}
 	};
 
 	var params = { jsonObj:json, asyncMode:false,	callback:null,	errorCallback:	null,};
 	return appCtxt.getAppController().sendRequest(params); 
}

//get folder request and response to check folder 
sort_email_HandlerObject.prototype._checkFolder=function(ParentId){
	var isFolderCreate = false;
	var soapDoc = AjxSoapDoc.create("GetFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("l", ParentId);
	var params = {soapDoc: soapDoc , asyncMode: false , callback: null , errorCallback: null};
    var response = appCtxt.getAppController().sendRequest(params);
	var Mainfolders = response.GetFolderResponse.folder[0].folder;
	for(var i = 0 ; i < Mainfolders.length ; i++ ){
		if( Mainfolders[i].name == this.YMFolderName)
			return this.YMFolderName;
		else if( Mainfolders[i].name == this.MFolderName)
			return this.MFolderName;
		else if( Mainfolders[i].name == this.AFolderName)
			return this.AFolderName;
	}
	return null;
}

//get folder request and response to get all folder ID
sort_email_HandlerObject.prototype._getAllFolderId=function(Fldrname){
	var flrTree=appCtxt.getFolderTree().root.children._array;
	var mainFloder;
	for(var i = 0 ; i < flrTree.length ; i++){
		if( flrTree[i].name == Fldrname)
			mainFloder = flrTree[i].children._array;
	}
	if(Fldrname==this.YMFolderName){
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
	else if(Fldrname==this.MFolderName){
		for( var i =0 ; i < mainFloder.length ; i++){
			this.dateList.setonlyMonthFdrId(i+1,mainFloder[i].id);
		}
	}
	else if(Fldrname==this.AFolderName){
		for( var i =0 ; i < mainFloder.length ; i++){
			this.dateList.setAddrId(mainFloder[i].name,mainFloder[i].id);
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

/********************************************************
* Date type                                             * 
* DataInfo/AddressInfo/OnlymonInfo/MailPrefs            *
*********************************************************/

/******************************** 
///////////DateInfo//////////////
********************************/
function DateInfo(year){
	this._id=0;
	this._year = year;
	this.monthId= [0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.monthArray = [false,false,false
					  ,false,false,false
					  ,false,false,false
					  ,false,false,false,false];			  
	//initail Mail Array 
	this.mailArray = new Array(13);
	for(var i = 0 ; i <= 12 ; i++)
		this.mailArray[i] = new Array();
	
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
DateInfo.prototype.addmailid = function( month ,n){
	this.mailArray[month].push(n);
};
DateInfo.prototype.getmailid = function( month ){
	return this.mailArray[month];
};

/******************************** 
///////////AddressInfo///////////
********************************/
function AddressInfo(a){
	this.name = a;
	this.fldID = 0;
	this.mailArray = [] ;
}

//function of AddrerssInfo
AddressInfo.prototype.getAddr = function(){
	return this.name;
};
AddressInfo.prototype.setAddr_id = function( i ){
	this.fldID = i;
};
AddressInfo.prototype.getAddr_id = function(){
	return this.fldID;
};
AddressInfo.prototype.addmailid = function(i){
	this.mailArray.push(i);
};
AddressInfo.prototype.getmailid = function(){
	return this.mailArray;
};
/******************************** 
///////////OnlyMonInfo///////////
********************************/
function OnlyMonInfo(m){
	this.month = m;
	this.id;
	this.mailArray = [] ;
}

//function of OnlyMonInfo
OnlyMonInfo.prototype.setmonth = function (i){
	this.month = i ;
}
OnlyMonInfo.prototype.setid = function (i){
	this.id = i ; 
};
OnlyMonInfo.prototype.getid = function (){
	return this.id;
};
OnlyMonInfo.prototype.addmailid= function (i){
	this.mailArray.push(i);
};
OnlyMonInfo.prototype.getmailid = function (){
	return this.mailArray;
};

/******************************** 
///////////MailPrefs/////////////
********************************/
function MailPrefs() {
	this.dateArray = [];
	this.addressArray = [];
	this.addrCheckArray = [];
	this.onlyMonthArray = [];
}

//MailPrefs's function for onlyMonth
MailPrefs.prototype.initMonth = function ( OnlyMonInfo ) {
	this.onlyMonthArray.push(OnlyMonInfo);
}
MailPrefs.prototype.setonlyMonthFdrId = function ( m, i ) {
	this.onlyMonthArray[m].setid(i);
};
MailPrefs.prototype.getonlyMonthFdrId = function ( m ) {
	return this.onlyMonthArray[m].getid();
};
MailPrefs.prototype.addOlyemlId = function ( m, i ) {
	this.onlyMonthArray[m].addmailid(i);
};
MailPrefs.prototype.getOlyemlId = function ( m ) {
	return this.onlyMonthArray[m].getmailid();
};

//MailPrefs's function for addressArray 
MailPrefs.prototype.getAddress = function ( addr ) {
    if (this.addrCheckArray.hasOwnProperty(addr)) 
        return this.addrCheckArray[addr];
};
MailPrefs.prototype.addAddr = function ( AddressInfo ) {
	this.addrCheckArray[AddressInfo.getAddr()] = AddressInfo;
	this.addressArray.push(AddressInfo);
};
MailPrefs.prototype.setAddrId = function (n,id){
	this.addrCheckArray[n].setAddr_id(id);
}
MailPrefs.prototype.getAddrId = function (n){
	 return this.addrCheckArray[n].getAddr_id();
}
MailPrefs.prototype.AddemlId = function (n,id){
	this.addrCheckArray[n].addmailid(id);
}
MailPrefs.prototype.GetemlId = function (n){
	return this.addrCheckArray[n].getmailid();
}


//MailPrefs's function for dataArray & dateCheckArray
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
MailPrefs.prototype.addDateMailId = function ( year , month , i){
	return this.dateArray["year_"+year].addmailid[month , i];
};
MailPrefs.prototype.getDateMailId = function ( year , month){
	return this.dateArray["year_"+year].getmailid[month];
};