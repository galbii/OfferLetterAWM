<script>
/* ===================== FIELD SCHEMA ===================== */
const T={TEXT:"text",EMAIL:"email",TEL:"tel",DATE:"date",AREA:"textarea",RADIO:"radio",RADIO_OTHER:"radio_other",BONUS:"bonus",BASE:"base"};
const GROUPS=[
 {n:"A",title:"New Hire Details"},
 {n:"B",title:"Role, Employment & Compensation"},
 {n:"C",title:"Equipment & Swag"},
 {n:"D",title:"Encompass Setup"},
 {n:"E",title:"Compensation Plans & Polly Branch ID"},
 {n:"F",title:"Custom Compensation Wording (optional — overrides the matching offer-letter line when filled)"}
];
// col = spreadsheet header (single source of truth for import/export/template)
const FIELDS=[
 {id:"employeeName",q:1,g:"A",label:"Employee Name",col:"Employee Name",type:T.TEXT,req:true},
 {id:"preferredName",q:2,g:"A",label:"Preferred Name",col:"Preferred Name",type:T.TEXT},
 {id:"email",q:3,g:"A",label:"New Hire's Email Address",col:"Email",type:T.EMAIL,req:true},
 {id:"phone",q:4,g:"A",label:"New Hire's Phone Number",col:"Phone",type:T.TEL,req:true},
 {id:"fullAddress",q:5,g:"A",label:"Full Address",col:"Full Address",type:T.AREA,req:true},
 {id:"nmls",q:6,g:"A",label:"NMLS Number",help:"Sponsor for New Licensee, Blank if NA",col:"NMLS Number",type:T.TEXT},
 {id:"branchName",q:7,g:"A",label:"Branch Name",col:"Branch Name",type:T.TEXT,req:true},
 {id:"branchManager",q:8,g:"A",label:"Branch Manager",col:"Branch Manager",type:T.TEXT,req:true},

 {id:"workLocation",q:9,g:"B",label:"Work Location",help:"Where does the Employee Sit to do their work",col:"Work Location",type:T.RADIO,req:true,
   options:["Branch Office (required to report to the office each workday)","Remote","Flexible/Hybrid"]},
 {id:"position",q:10,g:"B",label:"Position or Title",col:"Position/Title",type:T.TEXT,req:true},
 {id:"employmentType",q:11,g:"B",label:"Employment Type",col:"Employment Type",type:T.RADIO_OTHER,req:true,
   options:["Commissioned Sales","Full Time - Operations","Part Time - Operations","Temporary"]},
 {id:"reportsTo",q:12,g:"B",label:"Reports To",col:"Reports To",type:T.TEXT,req:true},
 {id:"ptoManager",q:13,g:"B",label:"Time Clock or PTO Manager Name",help:"If different than Reports To",col:"PTO Manager",type:T.TEXT},
 {id:"startDate",q:14,g:"B",label:"Expected Start Date",help:"Minimum one week unless approved for rapid onboarding. Background check must be complete prior to start.",col:"Start Date",type:T.DATE,req:true},
 {id:"baseWage",q:15,g:"B",label:"Base Wage",help:"Enter ONE basis only — Hourly (with Hours/Week), Monthly, or Annual. The other figures are calculated automatically for the offer letter. Leave blank / $0 for commission-only.",type:T.BASE},
 {id:"baseHourly",q:15,g:"B",label:"Base Wage — Hourly Rate",col:"Base - Hourly Rate",type:T.TEXT,hidden:true,help:"Hourly rate (e.g. $20.00). If used, also enter Hours/Week."},
 {id:"baseHoursWeek",q:15,g:"B",label:"Base Wage — Hours per Week",col:"Base - Hours per Week",type:T.TEXT,hidden:true,help:"Scheduled hours per week; used to annualize hourly pay. Defaults to 40 if blank."},
 {id:"baseMonthly",q:15,g:"B",label:"Base Wage — Monthly Amount",col:"Base - Monthly Amount",type:T.TEXT,hidden:true,help:"Monthly base pay (e.g. $4,333)."},
 {id:"baseAnnual",q:15,g:"B",label:"Base Wage — Annual Amount",col:"Base - Annual Amount",type:T.TEXT,hidden:true,help:"Annual base pay (e.g. $52,000)."},
 {id:"bonusStructure",q:16,g:"B",label:"Bonus Structure or Other Compensation",help:"Blank if Not Applicable. Check all that apply and enter amounts.",type:T.BONUS},
 {id:"bonusSignOnAmount",q:16,g:"B",label:"Sign-On Bonus — Month 1 Amount",col:"Bonus - Sign-On Amount",type:T.TEXT,hidden:true,help:"Sign-On bonus dollar amount (Month 1), e.g. $5,000."},
 {id:"bonusSignOnMonth2",q:16,g:"B",label:"Sign-On Bonus — Month 2 Amount",col:"Bonus - Sign-On Month 2 Amount",type:T.TEXT,hidden:true,help:"Sign-On amount paid in Month 2 (optional)."},
 {id:"bonusSignOnMonth3",q:16,g:"B",label:"Sign-On Bonus — Month 3 Amount",col:"Bonus - Sign-On Month 3 Amount",type:T.TEXT,hidden:true,help:"Sign-On amount paid in Month 3 (optional)."},
 {id:"bonusGuaranteeAmount",q:16,g:"B",label:"Guarantee Amount per Month",col:"Bonus - Guarantee Monthly Amount",type:T.TEXT,hidden:true,help:"Guaranteed dollar amount PER MONTH (e.g. $10,000). The offer letter converts this to bi-weekly automatically."},
 {id:"bonusGuaranteeMonths",q:16,g:"B",label:"Guarantee Number of Months",col:"Bonus - Guarantee # Months",type:T.TEXT,hidden:true,help:"How many months the guarantee runs (e.g. 3)."},
 {id:"bonusPnlAmount",q:16,g:"B",label:"P&L Credit 1 — Amount",col:"Bonus - P&L Credit Amount",type:T.TEXT,hidden:true,help:"P&L credit dollar amount (slot 1)."},
 {id:"bonusPnlMonth",q:16,g:"B",label:"P&L Credit 1 — Month It Applies",col:"Bonus - P&L Credit Month Applied",type:T.TEXT,hidden:true,help:"When P&L credit 1 applies, e.g. \"September\", \"your second month\", or a specific date."},
 {id:"bonusPnlAmount2",q:16,g:"B",label:"P&L Credit 2 — Amount",col:"Bonus - P&L Credit Amount 2",type:T.TEXT,hidden:true,help:"P&L credit dollar amount (slot 2, optional)."},
 {id:"bonusPnlMonth2",q:16,g:"B",label:"P&L Credit 2 — Month It Applies",col:"Bonus - P&L Credit Month 2 Applied",type:T.TEXT,hidden:true,help:"When P&L credit 2 applies (optional)."},
 {id:"bonusPnlAmount3",q:16,g:"B",label:"P&L Credit 3 — Amount",col:"Bonus - P&L Credit Amount 3",type:T.TEXT,hidden:true,help:"P&L credit dollar amount (slot 3, optional)."},
 {id:"bonusPnlMonth3",q:16,g:"B",label:"P&L Credit 3 — Month It Applies",col:"Bonus - P&L Credit Month 3 Applied",type:T.TEXT,hidden:true,help:"When P&L credit 3 applies (optional)."},
 {id:"bonusPnlNote",q:16,g:"B",label:"P&L Credit — How It's Earned (note)",col:"Bonus - P&L Credit How Earned",type:T.AREA,hidden:true,help:"Spell out how the P&L credit is earned and any conditions. Shown verbatim in the letter's \"How It Works\" column for the P&L Credit row."},
 {id:"bonusProductionAmount",q:16,g:"B",label:"Production Bonus Amount",col:"Bonus - Production Bonus Amount",type:T.TEXT,hidden:true,help:"Production bonus dollar amount (e.g. $100,000)."},
 {id:"bonusProductionVolume",q:16,g:"B",label:"Production Volume to Achieve",col:"Bonus - Production Volume to Achieve",type:T.TEXT,hidden:true,help:"Production volume that must be reached (e.g. $2,000,000)."},
 {id:"bonusProductionMaxMonths",q:16,g:"B",label:"Production Max Months to Achieve",col:"Bonus - Production Max Months to Achieve",type:T.TEXT,hidden:true,help:"Maximum months of onboarding to hit the volume (e.g. 5)."},
 {id:"bonusPerFileDollar",q:16,g:"B",label:"Per File Bonus Amount ($)",col:"Bonus - Per File $ Amount",type:T.TEXT,hidden:true,help:"Per-file bonus dollar amount. Use $ and/or bps."},
 {id:"bonusPerFileBps",q:16,g:"B",label:"Per File Bonus (bps)",col:"Bonus - Per File bps",type:T.TEXT,hidden:true,help:"Per-file bonus in basis points. Use $ and/or bps."},
 {id:"bonusOverrideBps",q:16,g:"B",label:"Override (bps)",col:"Bonus - Override bps",type:T.TEXT,hidden:true,help:"Override in basis points (bps)."},
 {id:"bonusAccelBps1",q:16,g:"B",label:"Accelerated bps — Month 1",col:"Bonus - Accelerated bps Month 1",type:T.TEXT,hidden:true,help:"Accelerated commission for Month 1, in basis points (e.g. 250)."},
 {id:"bonusAccelBps2",q:16,g:"B",label:"Accelerated bps — Month 2",col:"Bonus - Accelerated bps Month 2",type:T.TEXT,hidden:true,help:"Accelerated commission for Month 2, in basis points (optional)."},
 {id:"bonusAccelBps3",q:16,g:"B",label:"Accelerated bps — Month 3",col:"Bonus - Accelerated bps Month 3",type:T.TEXT,hidden:true,help:"Accelerated commission for Month 3, in basis points (optional)."},
 {id:"bonusFunding",q:17,g:"B",label:"Transition cost — who is responsible for funding it",col:"Transition Cost",type:T.RADIO,req:true,
   options:["Corporate","Branch","50/50","N/A"]},
 {id:"dualCapacity",q:18,g:"B",label:"Does the candidate work in a dual capacity as both a Loan Officer and a licensed Real Estate Agent (Realtor)?",col:"Dual Capacity (LO+Realtor)",type:T.RADIO,inline:true,
   options:["Yes","No"]},

 {id:"equipment",q:19,g:"C",label:"Equipment Package",help:"Will be costed to the Branch unless specified otherwise in Special Instructions",col:"Equipment Package",type:T.RADIO_OTHER,req:true,otherLong:true,
   options:["None","Desktop 2 monitors","Desktop 3 Monitors","Laptop","Laptop, docking station, 2 monitors"]},
 {id:"swagBox",q:20,g:"C",label:"Which new hire Swag Box would you like sent out?",col:"Swag Box",type:T.RADIO_OTHER,otherLong:true,
   options:["Operations","Loan Officer","Branch Manager","No New Hire Swag Box"]},
 {id:"tshirt",q:21,g:"C",label:"T-Shirt Size (Swag Box)",col:"T-Shirt Size",type:T.TEXT},

 {id:"pipelinePeople",q:22,g:"D",label:"List anyone who will need access to this person's pipeline in Encompass?",col:"Pipeline Access - People",type:T.AREA},
 {id:"pipelineNeeded",q:23,g:"D",label:"List any pipelines this hire will need access to:",col:"Pipeline Access - Needed",type:T.AREA},
 {id:"encompassProfile",q:24,g:"D",label:"Encompass Profile Type",col:"Encompass Profile Type",type:T.RADIO,
   options:["No selection","Loan Officer","Loan Officer Assistant","Processor","Branch Manager","Closer","Funder"]},
 {id:"assignedProcessor",q:25,g:"D",label:"Who will be the assigned processor",help:"List Processing Team, if there is not a specific processor",col:"Assigned Processor",type:T.TEXT},
 {id:"assignedLOA",q:26,g:"D",label:"Who will be the assigned LOA",help:"If None, N/A",col:"Assigned LOA",type:T.TEXT},
 {id:"loVolume",q:27,g:"D",label:"LO projected volume and units",help:"Mandatory for Loan Officers only",col:"LO Projected Volume",type:T.AREA,tmplHide:true},
 {id:"mmiSnippet",q:28,g:"D",label:"MMI snippet of the Loan Officer",help:"Mandatory for Loan Officers only. Enter a link or note; attach the file separately.",col:"MMI Snippet",type:T.TEXT,tmplHide:true},

 {id:"compStandard",q:29,g:"E",label:"Standard",help:"Traditional FHA, Conventional & VA Loans, conforming high balance and Jumbo transactions. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Standard %",type:T.TEXT},
 {id:"compBranch",q:30,g:"E",label:"Branch Marketing",help:"Transactions derived from a branch office supplied marketing effort or branch office provided lead source. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Branch Marketing %",type:T.TEXT},
 {id:"compBuilder",q:31,g:"E",label:"Builder Marketing",help:"Transactions derived from a preferred builder relationship provided by branch. N/A if not applicable. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Builder Marketing",type:T.TEXT},
 {id:"compCorporate",q:32,g:"E",label:"Corporate Marketing",help:"Transactions derived from corporate supplied marketing efforts or corporate provided lead source. N/A if not offered. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Corporate Marketing",type:T.TEXT},
 {id:"compLeads",q:33,g:"E",label:"Leads",help:"Transactions derived from leads generation systems. N/A if not offered by the branch. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Leads",type:T.TEXT},
 {id:"compBrokered",q:34,g:"E",label:"Brokered Loans",help:"Only for Loan Officers that reasonably expect to do Brokered loans, otherwise N/A. Enter in bps (e.g. 125 = 1.25%).",col:"Comp - Brokered Loans",type:T.TEXT},
 {id:"compMinimum",q:35,g:"E",label:"Minimum",help:"Minimum compensation as a dollar amount on all loans, e.g. 3000 = $3,000 (N/A for no minimum).",col:"Comp - Minimum",type:T.TEXT},
 {id:"compMaximum",q:35,g:"E",label:"Maximum",help:"Max compensation as a dollar amount allowed on all loans, e.g. 10000 = $10,000 (N/A for no maximum).",col:"Comp - Maximum",type:T.TEXT},
 {id:"processingFee",q:36,g:"E",label:"Processing Fee - AWM Funded",help:"Defaults to $695 if Blank.",col:"Processing Fee",type:T.TEXT,tmplHide:true},
 {id:"underwritingFee",q:37,g:"E",label:"Underwriting Fee - AWM Funded",help:"Defaults to $895 if Blank.",col:"Underwriting Fee",type:T.TEXT,tmplHide:true},
 {id:"branchPricing",q:38,g:"E",label:"Is the Loan Officer's branch pricing being set up for a new branch or an existing branch?",col:"Branch Pricing Setup",type:T.RADIO,req:true,
   options:["New branch","Existing branch","The new hire is not licensed"]},
 {id:"baseText",q:39,g:"F",label:"Base Salary / Draw — custom wording",help:"If filled, this exact text replaces the Base Salary line in the offer letter (e.g. a monthly draw). Leave blank to use the Hourly/Monthly/Annual fields.",col:"Comp - Base/Draw Text",type:T.AREA},
 {id:"guaranteeText",q:40,g:"F",label:"Guarantee — custom wording",help:"If filled, replaces the Guaranteed Pay line verbatim (e.g. a VO or month-specific guarantee). Leave blank to use the Guarantee amount / # months fields.",col:"Comp - Guarantee Text",type:T.AREA},
 {id:"perfileText",q:41,g:"F",label:"Per-File / Support Override — custom wording",help:"If filled, replaces the Per-File line verbatim (e.g. an override on another producer's loans, with caps/conditions). Leave blank to use the Per-File $ / bps fields.",col:"Comp - Per-File/Support Text",type:T.AREA},
 {id:"overrideText",q:42,g:"F",label:"Override — custom wording",help:"If filled, replaces the Override line verbatim (e.g. a tiered branch override with a per-loan cap). Leave blank to use the Override bps field.",col:"Comp - Override Text",type:T.AREA}
];
const FIELD_BY_ID=Object.fromEntries(FIELDS.map(f=>[f.id,f]));
const DATA_FIELDS=FIELDS.filter(f=>f.col);           // fields that map to a spreadsheet column
const HEADERS=DATA_FIELDS.map(f=>f.col);
const META_COLS=["Record ID","Status","Last Saved"];
const BONUS_GROUPS={signon:["bonusSignOnAmount","bonusSignOnMonth2","bonusSignOnMonth3"],guarantee:["bonusGuaranteeAmount","bonusGuaranteeMonths"],pnl:["bonusPnlAmount","bonusPnlMonth","bonusPnlAmount2","bonusPnlMonth2","bonusPnlAmount3","bonusPnlMonth3","bonusPnlNote"],production:["bonusProductionAmount","bonusProductionVolume","bonusProductionMaxMonths"],perfile:["bonusPerFileDollar","bonusPerFileBps"],override:["bonusOverrideBps"],accel:["bonusAccelBps1","bonusAccelBps2","bonusAccelBps3"]};

/* ===================== STORAGE ===================== */
const LS_KEY="onhr_records_v121";
const LS_DRAFT="onhr_draft_v121";
let records=[];
let currentId=null;      // id of record being edited (null = unsaved new)
let dirty=false;
let saveTimer=null;

var __SEED_RECORDS__=null;   // populated when this file is an exported copy with data
function loadRecords(){
  try{const raw=localStorage.getItem(LS_KEY);
    if(raw){records=JSON.parse(raw);}
    else if(Array.isArray(window.__SEED_RECORDS__)&&window.__SEED_RECORDS__.length){records=window.__SEED_RECORDS__.slice();persist();}
    else records=[];
  }catch(e){records=[]}
}
function persistLocal(){
  try{localStorage.setItem(LS_KEY,JSON.stringify(records))}
  catch(e){toast("Could not save to browser storage: "+e.message,true)}
}
// One-time cleanup: recolor the old cyan fill-in highlight to the darker blue and
// drop the underline in any letters that were hand-edited (styles baked into saved HTML).
function migrateLetterStyles(){
  var changed=false;
  (records||[]).forEach(function(rec){
    if(!rec||!rec.letterHtml)return; var o=rec.letterHtml,h=o;
    h=h.replace(/#18B0E0/gi,'#0B5CAB');
    h=h.replace(/rgb\(\s*24\s*,\s*176\s*,\s*224\s*\)/gi,'#0B5CAB');
    h=h.replace(/text-decoration(-line)?\s*:\s*underline\s*;?/gi,'');
    h=h.replace(/text-underline-offset\s*:\s*2px\s*;?/gi,'');
    // Bold the AWM signer's name (match recruit-name weight) if it isn't already.
    if(typeof SIGNATORY!=='undefined'){Object.keys(SIGNATORY).forEach(function(k){var nm=SIGNATORY[k].name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      h=h.replace(new RegExp('(>)\\s*'+nm+'\\s*(<br)','g'),'$1<strong>'+SIGNATORY[k].name+'</strong>$2');});}
    if(h!==o){rec.letterHtml=h;changed=true;}
  });
  if(changed)persistLocal();
}
function persist(){persistLocal();scheduleDataWrite();}   // localStorage + (if connected) the live data file

/* ============ LIVE DATA FILE (File System Access API, self-saving to disk) ============
   Mirrors the AWM proforma app: pick a .json file once, and every change writes straight
   to it. The file handle is remembered in IndexedDB so it reconnects on the next open. */
var DATA_HANDLE=null;
var DATA_FILE_STATUS={connected:false,name:null,savedAt:null,needsReconnect:false};
function setDataFileStatus(patch){Object.assign(DATA_FILE_STATUS,patch||{});renderDataFileChip();updateReconnectOverlay();}
// This browser session's identity + who-else-is-in-the-file presence map (written into the data file).
var SESSION_ID="s"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
var PRESENCE={};                     // {sessionId:{t:heartbeatMs,name}}
var PRESENCE_TTL=90000;              // a session counts as "in the file" if its heartbeat is < 90s old
function myPresenceName(){try{return localStorage.getItem("onhr_user_name")||"";}catch(e){return "";}}
function buildPayload(){
  var now=Date.now();PRESENCE[SESSION_ID]={t:now,name:myPresenceName()};
  var p={};Object.keys(PRESENCE).forEach(function(id){if(now-(PRESENCE[id].t||0)<PRESENCE_TTL)p[id]=PRESENCE[id];});PRESENCE=p;
  return {format:"awm-onhr-datafile",version:1,savedAt:now,records:records,presence:PRESENCE};
}
async function writeFileNow(){
  if(!DATA_HANDLE)return false;
  try{
    var perm=await DATA_HANDLE.queryPermission({mode:"readwrite"});
    if(perm!=="granted"){setDataFileStatus({needsReconnect:true});return false;}
    var w=await DATA_HANDLE.createWritable();
    await w.write(JSON.stringify(buildPayload(),null,2));
    await w.close();
    setDataFileStatus({connected:true,name:DATA_HANDLE.name,savedAt:Date.now(),needsReconnect:false});
    return true;
  }catch(e){setDataFileStatus({needsReconnect:true});return false;}
}
var _dwChain=Promise.resolve(),_dwPending=false,_dwTimer=null;
function scheduleDataWrite(){
  if(!DATA_HANDLE)return;
  _dwPending=true;
  if(_dwTimer)return;                                   // debounce a burst of saves into one write
  _dwTimer=setTimeout(function(){
    _dwTimer=null;
    _dwChain=_dwChain.then(function(){if(!_dwPending||!DATA_HANDLE)return;_dwPending=false;return writeFileNow();});
  },600);
}
function recSig(){return records.map(function(r){return r.id+":"+(r.updated||"");}).sort().join("|");}
function mergeRecordsQuiet(fileRecs){var before=recSig();mergeRecords(fileRecs);return recSig()!==before;}
// ---- Concurrent-access presence: heartbeat into the data file, warn if another session is in it ----
var _presenceTimer=null;
function startPresence(){if(_presenceTimer)clearInterval(_presenceTimer);_presenceTimer=setInterval(heartbeatPresence,25000);heartbeatPresence();}
function stopPresence(){if(_presenceTimer){clearInterval(_presenceTimer);_presenceTimer=null;}updateConcurrentBanner(0,[]);}
async function heartbeatPresence(){
  if(!DATA_HANDLE)return;
  try{
    var perm=await DATA_HANDLE.queryPermission({mode:"readwrite"});
    if(perm!=="granted"){setDataFileStatus({needsReconnect:true});return;}   // triggers the hard overlay
    var f=await DATA_HANDLE.getFile();var t=await f.text();
    var j=t.trim()?JSON.parse(t):{};
    var remoteRecords=Array.isArray(j)?j:(j&&Array.isArray(j.records)?j.records:[]);
    var remotePresence=(j&&j.presence)||{};
    var now=Date.now();
    // adopt others' recent presence, drop stale
    Object.keys(remotePresence).forEach(function(id){if(id!==SESSION_ID&&now-(remotePresence[id].t||0)<PRESENCE_TTL)PRESENCE[id]=remotePresence[id];});
    Object.keys(PRESENCE).forEach(function(id){if(now-(PRESENCE[id].t||0)>=PRESENCE_TTL)delete PRESENCE[id];});
    // pull in any record changes made by the other session so we never overwrite their work
    var changed=mergeRecordsQuiet(remoteRecords);
    // detect other active sessions
    var others=Object.keys(PRESENCE).filter(function(id){return id!==SESSION_ID&&now-(PRESENCE[id].t||0)<PRESENCE_TTL;});
    updateConcurrentBanner(others.length,others.map(function(id){return PRESENCE[id].name||"";}));
    await writeFileNow();                          // refresh my heartbeat + write merged records
    if(changed){renderList();if(typeof renderStageTables==="function")renderStageTables();}
  }catch(e){}
}
function updateConcurrentBanner(count,names){
  var el=document.getElementById("concurrentBanner");if(!el)return;
  if(!count){el.style.display="none";el.innerHTML="";return;}
  var named=(names||[]).filter(Boolean);
  var who=named.length?named.join(", "):(count===1?"Another user":count+" other people");
  var verb=count===1?"appears to have":"appear to have";
  el.style.display="block";
  el.innerHTML="⚠ <strong>"+esc(who)+" "+verb+" this data file open right now — your changes may overwrite each other. Coordinate before editing.</strong>";
}
// ---- Hard stop: a full-screen block you cannot bypass. A data file is REQUIRED — the button
//      creates/chooses a file when there's none to reconnect to, or reconnects when there is. ----
var _dfChecked=false;
function updateReconnectOverlay(){
  var ov=document.getElementById("reconnectOverlay");if(!ov)return;
  var supported=!!window.showSaveFilePicker;
  var connectedOk=DATA_FILE_STATUS.connected&&!DATA_FILE_STATUS.needsReconnect;
  var block=supported&&_dfChecked&&!connectedOk;    // block whenever not actively connected to a file
  ov.style.display=block?"flex":"none";
  if(!block)return;
  var hasHandle=!!DATA_HANDLE;
  var title=document.getElementById("reconnectTitle"),body=document.getElementById("reconnectBody"),btn=document.getElementById("reconnectNowBtn");
  if(hasHandle){
    if(title)title.textContent="Reconnect required";
    if(body)body.innerHTML="The data file <strong>"+esc(DATA_FILE_STATUS.name||"your data file")+"</strong> is no longer connected, so your changes can’t be saved. Reconnect to continue.";
    if(btn)btn.textContent="Reconnect data file";
  }else{
    if(title)title.textContent="Connect a data file to continue";
    if(body)body.innerHTML="This app saves everything to a data file on your computer. Create a new file, or choose your team’s existing shared file, to continue.";
    if(btn)btn.textContent="Create / choose data file";
  }
}
function reconnectOrCreate(){if(DATA_HANDLE)reconnectDataFile();else connectDataFile();}
async function readDataFile(handle){
  var f=await handle.getFile();var t=await f.text();
  if(!t.trim())return [];
  var j=JSON.parse(t);
  if(Array.isArray(j))return j;
  if(j&&Array.isArray(j.records))return j.records;
  return [];
}
// Union by record id, newest `updated` wins — connecting a file never destroys either side.
function mergeRecords(fileRecs){
  var byId={};
  (fileRecs||[]).forEach(function(r){if(r&&r.id)byId[r.id]=r;});
  records.forEach(function(r){if(r&&r.id){var ex=byId[r.id];if(!ex||new Date(r.updated||0)>=new Date(ex.updated||0))byId[r.id]=r;}});
  records=Object.keys(byId).map(function(k){return byId[k];}).sort(function(a,b){return new Date(b.updated||0)-new Date(a.updated||0);});
  migrateLetterStyles();
  persistLocal();
  return records.length;
}
// IndexedDB: persist the FileSystemFileHandle across reloads so saving resumes automatically.
var ONHR_IDB={db:null};
function idbOpen(){return new Promise(function(res,rej){if(ONHR_IDB.db)return res(ONHR_IDB.db);var r;try{r=indexedDB.open("awm.onhr.datafile",1);}catch(e){return rej(e);}r.onupgradeneeded=function(){try{r.result.createObjectStore("handles");}catch(e){}};r.onsuccess=function(){ONHR_IDB.db=r.result;res(r.result);};r.onerror=function(){rej(r.error);};});}
function idbSetHandle(h,key){key=key||"datafile";return idbOpen().then(function(db){return new Promise(function(res,rej){var tx=db.transaction("handles","readwrite");if(h===null)tx.objectStore("handles").delete(key);else tx.objectStore("handles").put(h,key);tx.oncomplete=function(){res(true);};tx.onerror=function(){rej(tx.error);};});}).catch(function(){return false;});}
function idbGetHandle(key){key=key||"datafile";return idbOpen().then(function(db){return new Promise(function(res){var tx=db.transaction("handles","readonly");var g=tx.objectStore("handles").get(key);g.onsuccess=function(){res(g.result||null);};g.onerror=function(){res(null);};});}).catch(function(){return null;});}
async function connectDataFile(){
  if(!window.showSaveFilePicker){toast("This browser can't connect a data file — use Chrome or Edge (desktop).",true);return;}
  try{
    var handle=await window.showSaveFilePicker({id:"awmOnhrDataFile",suggestedName:"offer-new-hire-data.json",startIn:"documents",types:[{description:"AWM Offer / New Hire data file",accept:{"application/json":[".json"]}}]});
    var fileRecs=[];try{fileRecs=await readDataFile(handle);}catch(e){}
    var n=mergeRecords(fileRecs);
    DATA_HANDLE=handle;try{idbSetHandle(handle,"datafile");}catch(e){}
    renderList();if(typeof renderStageTables==="function")renderStageTables();
    scheduleDataWrite();startPresence();
    setDataFileStatus({connected:true,name:handle.name,savedAt:Date.now(),needsReconnect:false});
    toast('Data file connected — "'+handle.name+'" now holds all '+n+' request'+(n===1?'':'s')+' and saves automatically on every change.');
  }catch(err){if(err&&err.name==="AbortError")return;toast("Couldn't connect data file: "+(err&&err.message||err),true);}
}
// Browse to an EXISTING data file in any folder (e.g. after the folder was moved) and adopt it.
async function pickDataFile(){
  if(window.showOpenFilePicker){
    try{
      var arr=await window.showOpenFilePicker({id:"awmOnhrDataFile",startIn:"documents",multiple:false,types:[{description:"AWM Offer / New Hire data file",accept:{"application/json":[".json"]}}]});
      var handle=arr&&arr[0];if(!handle)return;
      var perm=await handle.queryPermission({mode:"readwrite"});
      if(perm!=="granted")perm=await handle.requestPermission({mode:"readwrite"});
      if(perm!=="granted"){toast("Permission denied for that file.",true);return;}
      var fileRecs=[];try{fileRecs=await readDataFile(handle);}catch(e){}
      var n=mergeRecords(fileRecs);
      DATA_HANDLE=handle;try{idbSetHandle(handle,"datafile");}catch(e){}
      renderList();if(typeof renderStageTables==="function")renderStageTables();
      scheduleDataWrite();startPresence();
      setDataFileStatus({connected:true,name:handle.name,savedAt:Date.now(),needsReconnect:false});
      toast('Data file connected — "'+handle.name+'" now holds all '+n+' request'+(n===1?'':'s')+' and saves automatically.');
    }catch(err){if(err&&err.name==="AbortError")return;toast("Couldn't open that data file: "+(err&&err.message||err),true);}
    return;
  }
  // Fallback: no open-picker support — use the save picker (also lets you pick an existing file).
  return connectDataFile();
}
async function reconnectDataFile(){
  try{
    var handle=DATA_HANDLE||await idbGetHandle("datafile");
    if(!handle)return connectDataFile();
    DATA_HANDLE=handle;
    var perm=await handle.queryPermission({mode:"readwrite"});
    if(perm!=="granted")perm=await handle.requestPermission({mode:"readwrite"});
    if(perm!=="granted"){toast("Permission denied for the data file.",true);return;}
    var fileRecs=[];try{fileRecs=await readDataFile(handle);}catch(e){}
    var n=mergeRecords(fileRecs);
    renderList();if(typeof renderStageTables==="function")renderStageTables();
    scheduleDataWrite();startPresence();
    setDataFileStatus({connected:true,name:handle.name,savedAt:Date.now(),needsReconnect:false});
    toast("Data file reconnected — "+n+" request"+(n===1?'':'s')+" loaded and live-saving.");
  }catch(e){toast("Reconnect failed: "+(e&&e.message||e),true);}
}
function disconnectDataFile(){stopPresence();delete PRESENCE[SESSION_ID];DATA_HANDLE=null;try{idbSetHandle(null,"datafile");}catch(e){}setDataFileStatus({connected:false,name:null,savedAt:null,needsReconnect:false});toast("Data file disconnected — choose or create a data file to continue.");}
function fmtSavedTime(ts){if(!ts)return"";try{return new Date(ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}catch(e){return"";}}
function renderDataFileChip(){
  var btn=document.getElementById("dataFileBtn"),dis=document.getElementById("btnDisconnectFile");if(!btn)return;
  var s=DATA_FILE_STATUS;
  if(!window.showSaveFilePicker){btn.textContent="⚠ Not saving to file";btn.title="This browser can't connect a data file — use Chrome or Edge on desktop";btn.className="btn-ghost df-off";}
  else if(s.needsReconnect){btn.textContent="⚠ Reconnect File — not saving";btn.title="Access to "+(s.name||"your data file")+" was lost. Click to reconnect.";btn.className="btn-ghost df-warn";}
  else if(s.connected){btn.textContent="● "+(s.name||"Data file")+(s.savedAt?" · "+fmtSavedTime(s.savedAt):"");btn.title="Connected — auto-saving to "+(s.name||"your data file")+" on every change";btn.className="btn-ghost df-on";}
  else{btn.textContent="⚠ Not connected — Connect Data File";btn.title="No data file connected. Your work is not being saved to a file. Click to connect.";btn.className="btn-ghost df-off";}
  if(dis)dis.style.display=s.connected?"":"none";
}
function dataFileBtnClick(){if(DATA_HANDLE)reconnectDataFile();else connectDataFile();}
// On open: silently reconnect the remembered data file (or flag a one-click reconnect).
function initDataFile(){
  renderDataFileChip();
  if(!window.showSaveFilePicker){_dfChecked=true;updateReconnectOverlay();return;}   // unsupported browser: no hard block
  idbGetHandle("datafile").then(async function(h){
    if(!h){_dfChecked=true;updateReconnectOverlay();return;}   // no file yet -> overlay prompts to create/choose one
    DATA_HANDLE=h;
    try{
      var perm=await h.queryPermission({mode:"readwrite"});
      _dfChecked=true;
      if(perm==="granted"){
        var ok=true,fileRecs=[];
        try{fileRecs=await readDataFile(h);}catch(e){ok=false;}   // file moved/deleted/unreadable -> NOT truly connected
        if(ok){
          mergeRecords(fileRecs);renderList();if(typeof renderStageTables==="function")renderStageTables();
          setDataFileStatus({connected:true,name:h.name,savedAt:Date.now(),needsReconnect:false});   // GREEN only after a successful read
          startPresence();
        }else{setDataFileStatus({connected:true,name:h.name,savedAt:null,needsReconnect:true});}      // RED: reconnect needed
      }else{setDataFileStatus({connected:true,name:h.name,savedAt:null,needsReconnect:true});}   // permission not yet granted -> RED / hard reconnect overlay
    }catch(e){_dfChecked=true;setDataFileStatus({connected:true,name:h.name,savedAt:null,needsReconnect:true});}
  });
}
function uid(){return "r"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

/* ===================== RENDER FORM ===================== */
const form=document.getElementById("form");
function buildForm(){
  form.innerHTML="";
  GROUPS.forEach(gr=>{
    const sec=document.createElement("section");sec.className="grp";
    sec.innerHTML=`<div class="grp-head"><span class="gn">${gr.n}</span>${gr.title}</div>`;
    const body=document.createElement("div");body.className="grp-body";
    FIELDS.filter(f=>f.g===gr.n).forEach(f=>{
      if(f.type===T.BONUS)body.appendChild(renderBonus(f));
      else if(f.type===T.BASE)body.appendChild(renderBaseWage(f));
      else if(f.hidden)return;                 // sub-fields are rendered inside the bonus / base block
      else body.appendChild(renderField(f));
    });
    sec.appendChild(body);form.appendChild(sec);
  });
}
function renderField(f){
  const wrap=document.createElement("div");wrap.className="fld";wrap.dataset.fid=f.id;
  const req=f.req?'<span class="req">*</span>':'';
  const help=f.help?`<span class="help">${f.help}</span>`:'';
  let control="";
  if(f.type===T.AREA){
    control=`<textarea data-f="${f.id}"></textarea>`;
  }else if(f.type===T.RADIO||f.type===T.RADIO_OTHER){
    const inline=f.inline?" inline":"";
    let opts=f.options.map(o=>`<label class="radio"><input type="radio" name="${f.id}" value="${esc(o)}" data-f="${f.id}"><span>${esc(o)}</span></label>`).join("");
    if(f.type===T.RADIO_OTHER){
      const otherCtl=f.otherLong
        ? `<textarea class="other-input other-long" placeholder="please specify" data-otherfor="${f.id}" rows="2"></textarea>`
        : `<input type="text" class="other-input" placeholder="please specify" data-otherfor="${f.id}">`;
      opts+=`<label class="radio other-wrap${f.otherLong?' other-wrap-long':''}"><input type="radio" name="${f.id}" value="__other__" data-f="${f.id}" data-other="1"><span class="other-lbl">Other:</span>${otherCtl}</label>`;
    }
    control=`<div class="radios${inline}">${opts}</div>`;
  }else{
    control=`<input type="${f.type}" data-f="${f.id}">`;
  }
  wrap.innerHTML=`<label class="q"><span class="qn">${f.q}.</span>${esc(f.label)}${req}</label>${help}${control}`;
  return wrap;
}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

/* ---- Q15 Bonus Structure (composite) ---- */
function renderBonus(f){
  const wrap=document.createElement("div");wrap.className="fld";wrap.dataset.fid=f.id;
  wrap.innerHTML=`
   <label class="q"><span class="qn">${f.q}.</span>${esc(f.label)}</label>
   <span class="help">${esc(f.help||'')}</span>
   <div class="bonus">
     <div class="bonus-item" data-bonus="signon">
       <label class="bchk"><input type="checkbox" data-bonuschk="signon"><span>Sign-On Bonus</span></label>
       <div class="bonus-fields">
         <div class="prod-inputs">
           <div class="bf"><span class="bf-lbl">Month 1 amount</span><input type="text" data-f="bonusSignOnAmount" placeholder="$ amount"></div>
           <div class="bf"><span class="bf-lbl">Month 2 amount</span><input type="text" data-f="bonusSignOnMonth2" placeholder="$ (optional)"></div>
           <div class="bf"><span class="bf-lbl">Month 3 amount</span><input type="text" data-f="bonusSignOnMonth3" placeholder="$ (optional)"></div>
         </div>
         <div class="bf-note">Enter Month 1 only for a one-time sign-on, or add Month 2 / Month 3 for a staged sign-on.</div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="guarantee">
       <label class="bchk"><input type="checkbox" data-bonuschk="guarantee"><span>Guarantee</span></label>
       <div class="bonus-fields">
         <div class="guar-grid">
           <div class="guar-inputs">
             <div class="bf"><span class="bf-lbl">Amount / month</span><input type="text" data-f="bonusGuaranteeAmount" placeholder="$ per month"></div>
             <div class="bf"><span class="bf-lbl"># of months</span><input type="number" min="1" max="12" data-f="bonusGuaranteeMonths" placeholder="e.g. 3"></div>
           </div>
           <div class="guar-breakdown" data-guar-breakdown></div>
         </div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="pnl">
       <label class="bchk"><input type="checkbox" data-bonuschk="pnl"><span>P&amp;L Credit</span></label>
       <div class="bonus-fields">
         <div class="bf"><span class="bf-lbl">Credit 1 — amount</span><input type="text" data-f="bonusPnlAmount" placeholder="$ amount"></div>
         <div class="bf"><span class="bf-lbl">Credit 1 — month applies</span><input type="text" data-f="bonusPnlMonth" placeholder='e.g. September'></div>
         <div class="bf"><span class="bf-lbl">Credit 2 — amount</span><input type="text" data-f="bonusPnlAmount2" placeholder="$ (optional)"></div>
         <div class="bf"><span class="bf-lbl">Credit 2 — month applies</span><input type="text" data-f="bonusPnlMonth2" placeholder="e.g. October"></div>
         <div class="bf"><span class="bf-lbl">Credit 3 — amount</span><input type="text" data-f="bonusPnlAmount3" placeholder="$ (optional)"></div>
         <div class="bf"><span class="bf-lbl">Credit 3 — month applies</span><input type="text" data-f="bonusPnlMonth3" placeholder="e.g. November"></div>
         <div class="bf" style="flex-basis:100%"><span class="bf-lbl">How the P&amp;L credit is earned (note)</span><textarea data-f="bonusPnlNote" rows="2" placeholder="Spell out how the P&amp;L credit is earned and any conditions — shown in the letter's How It Works column."></textarea></div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="production">
       <label class="bchk"><input type="checkbox" data-bonuschk="production"><span>Production Bonus</span></label>
       <div class="bonus-fields">
         <div class="prod-inputs">
           <div class="bf"><span class="bf-lbl">Bonus amount</span><input type="text" data-f="bonusProductionAmount" placeholder="$100,000"></div>
           <div class="bf"><span class="bf-lbl">Volume to achieve</span><input type="text" data-f="bonusProductionVolume" placeholder="$2,000,000"></div>
           <div class="bf"><span class="bf-lbl">Max months to achieve</span><input type="number" min="1" data-f="bonusProductionMaxMonths" placeholder="5"></div>
         </div>
         <div class="prod-preview" data-prod-preview></div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="perfile">
       <label class="bchk"><input type="checkbox" data-bonuschk="perfile"><span>Per File Bonus</span></label>
       <div class="bonus-fields">
         <div class="bf"><span class="bf-lbl">Amount ($)</span><input type="text" data-f="bonusPerFileDollar" placeholder="$ per file"></div>
         <div class="bf"><span class="bf-lbl">Basis points</span><div class="unit-input"><input type="number" min="0" data-f="bonusPerFileBps" placeholder="25"><span class="unit">bps</span></div></div>
         <div class="bf-note">Enter a dollar amount, bps, or both.</div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="override">
       <label class="bchk"><input type="checkbox" data-bonuschk="override"><span>Override</span></label>
       <div class="bonus-fields">
         <div class="bf"><span class="bf-lbl">Basis points</span><div class="unit-input"><input type="number" min="0" data-f="bonusOverrideBps" placeholder="50"><span class="unit">bps</span></div></div>
       </div>
     </div>
     <div class="bonus-item" data-bonus="accel">
       <label class="bchk"><input type="checkbox" data-bonuschk="accel"><span>Accelerated Bps</span></label>
       <div class="bonus-fields">
         <div class="bf"><span class="bf-lbl">Month 1</span><div class="unit-input"><input type="number" min="0" data-f="bonusAccelBps1" placeholder="e.g. 250"><span class="unit">bps</span></div></div>
         <div class="bf"><span class="bf-lbl">Month 2</span><div class="unit-input"><input type="number" min="0" data-f="bonusAccelBps2" placeholder="optional"><span class="unit">bps</span></div></div>
         <div class="bf"><span class="bf-lbl">Month 3</span><div class="unit-input"><input type="number" min="0" data-f="bonusAccelBps3" placeholder="optional"><span class="unit">bps</span></div></div>
       </div>
     </div>
   </div>`;
  return wrap;
}
/* ---- Q14 Base Wage (composite: enter one basis, auto-calc the rest) ---- */
function renderBaseWage(f){
  const wrap=document.createElement("div");wrap.className="fld";wrap.dataset.fid=f.id;
  wrap.innerHTML=`
   <label class="q"><span class="qn">${f.q}.</span>${esc(f.label)}</label>
   <span class="help">${esc(f.help||'')}</span>
   <div class="basewage">
     <div class="bw-inputs">
       <div class="bf"><span class="bf-lbl">Hourly rate</span><input type="text" data-f="baseHourly" placeholder="$ / hour"></div>
       <div class="bf"><span class="bf-lbl">Hours / week</span><input type="number" min="1" max="80" step="0.5" data-f="baseHoursWeek" placeholder="40"></div>
       <div class="bf"><span class="bf-lbl">Monthly</span><input type="text" data-f="baseMonthly" placeholder="$ / month"></div>
       <div class="bf"><span class="bf-lbl">Annually</span><input type="text" data-f="baseAnnual" placeholder="$ / year"></div>
     </div>
     <div class="bw-preview" data-basewage-preview></div>
   </div>`;
  return wrap;
}
function bval(id){const el=form.querySelector(`[data-f="${id}"]`);return el?el.value.trim():''}
function parseMoney(s){if(s==null)return null;const n=String(s).replace(/[^0-9.\-]/g,'');if(n===''||isNaN(Number(n)))return null;return Number(n)}
function fmtMoney(n){return '$'+Number(Math.round(n)).toLocaleString('en-US',{maximumFractionDigits:0,minimumFractionDigits:0})}
const DOLLAR_FIELD_IDS=["baseMonthly","baseAnnual","bonusSignOnAmount","bonusSignOnMonth2","bonusSignOnMonth3","bonusGuaranteeAmount","bonusPnlAmount","bonusPnlAmount2","bonusPnlAmount3","bonusProductionAmount","bonusProductionVolume","bonusPerFileDollar"];
const DOLLAR_SEL=DOLLAR_FIELD_IDS.map(id=>`[data-f="${id}"]`).join(",");
function fmtDollarStr(s){const n=parseMoney(s);return n!=null?fmtMoney(n):(s||"")}
function formatDollarField(el){if(!el)return;const n=parseMoney(el.value);if(n!=null)el.value=fmtMoney(n);}
function computeGuarantee(){
  const out=form.querySelector('[data-guar-breakdown]');if(!out)return;
  const amtRaw=bval('bonusGuaranteeAmount');const mon=parseInt(bval('bonusGuaranteeMonths'),10);
  if(!amtRaw||!mon||mon<1){out.innerHTML='<div class="gb-empty">Enter monthly amount &amp; # of months to see the breakdown.</div>';return;}
  const shown=Math.min(mon,12);const amtNum=parseMoney(amtRaw);let rows='';
  for(let i=1;i<=shown;i++){const disp=amtNum!=null?fmtMoney(amtNum):esc(amtRaw);rows+=`<div class="gb-row"><span>Month ${i}</span><span>${disp}</span></div>`;}
  const total=amtNum!=null?`<div class="gb-row gb-total"><span>Total (${mon} mo)</span><span>${fmtMoney(amtNum*mon)}</span></div>`:'';
  const conv=amtNum!=null?`<div class="gb-note">Offer letter: ${fmtMoney(amtNum/2)} every two weeks × ${mon*2} pay periods (~ ${mon*4} wks)</div>`:'';
  const note=mon>12?`<div class="gb-note">Showing first 12 of ${mon} months.</div>`:'';
  out.innerHTML=rows+total+conv+note;
}
function computeProduction(){
  const out=form.querySelector('[data-prod-preview]');if(!out)return;
  const a=bval('bonusProductionAmount'),v=bval('bonusProductionVolume'),m=bval('bonusProductionMaxMonths');
  if(!a&&!v&&!m){out.style.display='none';out.textContent='';return;}
  const aN=parseMoney(a),vN=parseMoney(v);
  const aS=aN!=null?fmtMoney(aN):(a||'___');const vS=vN!=null?fmtMoney(vN):(v||'___');const mS=m||'___';
  out.style.display='block';
  out.textContent=`Production bonus of ${aS} if ${vS} of production is achieved within the first ${mS} month(s) of onboarding.`;
}
/* Base wage: enter one basis, derive monthly + annual. hours/week defaults to 40 for hourly. */
function usd(n,dec){return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});}
function baseWageCalc(d){
  const hourly=parseMoney(d.baseHourly), monthlyIn=parseMoney(d.baseMonthly), annualIn=parseMoney(d.baseAnnual);
  let hours=parseFloat(String(d.baseHoursWeek||'').replace(/[^0-9.]/g,'')); if(!(hours>0))hours=null;
  let basis,monthly,annual,hoursUsed=hours;
  if(hourly!=null&&hourly>0){basis='hourly';hoursUsed=hours||40;annual=hourly*hoursUsed*52;monthly=annual/12;}
  else if(monthlyIn!=null&&monthlyIn>0){basis='monthly';monthly=monthlyIn;annual=monthly*12;}
  else if(annualIn!=null&&annualIn>0){basis='annual';annual=annualIn;monthly=annual/12;}
  else return null;
  return {basis,hourly,hours:hoursUsed,hoursGiven:hours,monthly,annual};
}
function baseWageWYR(d){
  const c=baseWageCalc(d);
  if(!c)return (d.baseWage&&String(d.baseWage).trim())?String(d.baseWage).trim():'';   // legacy free-text fallback
  if(c.basis==='hourly')return usd(c.hourly,2)+' per hour';       // show only what was entered
  if(c.basis==='monthly')return usd(c.monthly,2)+' per month';
  return usd(Math.round(c.annual),0)+' annually';
}
function computeBaseWage(){
  const out=form.querySelector('[data-basewage-preview]');if(!out)return;
  const d={baseHourly:bval('baseHourly'),baseHoursWeek:bval('baseHoursWeek'),baseMonthly:bval('baseMonthly'),baseAnnual:bval('baseAnnual')};
  const c=baseWageCalc(d);
  if(!c){out.style.display='none';out.textContent='';return;}
  out.style.display='block';
  out.textContent='Offer letter reads: '+baseWageWYR(d);
}
function syncBonusUI(){
  Object.keys(BONUS_GROUPS).forEach(key=>{
    const item=form.querySelector(`.bonus-item[data-bonus="${key}"]`);if(!item)return;
    const chk=item.querySelector(`[data-bonuschk="${key}"]`);
    const hasVal=BONUS_GROUPS[key].some(id=>bval(id)!=="");
    if(chk)chk.checked=hasVal;item.classList.toggle("open",hasVal);
  });
  DOLLAR_FIELD_IDS.forEach(id=>formatDollarField(form.querySelector(`[data-f="${id}"]`)));
  computeGuarantee();computeProduction();computeBaseWage();
}

/* ===================== FORM <-> DATA ===================== */
function readForm(){
  const d={};
  FIELDS.forEach(f=>{
    if(f.type===T.BONUS||f.type===T.BASE)return;
    if(f.type===T.RADIO||f.type===T.RADIO_OTHER){
      const sel=form.querySelector(`input[name="${f.id}"]:checked`);
      if(!sel){d[f.id]="";}
      else if(sel.dataset.other){
        const ot=form.querySelector(`[data-otherfor="${f.id}"]`);
        d[f.id]=ot?ot.value.trim():"";
      }else d[f.id]=sel.value;
    }else{
      const el=form.querySelector(`[data-f="${f.id}"]`);
      d[f.id]=el?el.value.trim():"";
    }
  });
  return d;
}
function writeForm(d){
  d=d||{};
  FIELDS.forEach(f=>{
    if(f.type===T.BONUS||f.type===T.BASE)return;
    const val=d[f.id]==null?"":String(d[f.id]);
    if(f.type===T.RADIO||f.type===T.RADIO_OTHER){
      form.querySelectorAll(`input[name="${f.id}"]`).forEach(r=>r.checked=false);
      const ot=form.querySelector(`[data-otherfor="${f.id}"]`);
      if(ot)ot.value="";
      if(val===""){/*none*/}
      else if(f.options.includes(val)){
        const m=form.querySelector(`input[name="${f.id}"][value="${cssEsc(val)}"]`);
        if(m)m.checked=true;
      }else if(f.type===T.RADIO_OTHER){
        const o=form.querySelector(`input[name="${f.id}"][data-other]`);
        if(o){o.checked=true;if(ot)ot.value=val;}
      }else{
        // radio value not in options (e.g. imported free text) -> leave unchecked but keep? create nothing
      }
    }else{
      const el=form.querySelector(`[data-f="${f.id}"]`);
      if(el)el.value=val;
    }
  });
  clearValidation();syncBonusUI();
}
function cssEsc(s){return String(s).replace(/["\\]/g,"\\$&")}

/* ===================== VALIDATION ===================== */
function missingRequired(d){
  return FIELDS.filter(f=>f.req && (!d[f.id]||String(d[f.id]).trim()==="")).map(f=>f);
}
function clearValidation(){form.querySelectorAll(".fld.missing").forEach(el=>el.classList.remove("missing"))}
function markMissing(list){
  clearValidation();
  list.forEach(f=>{const el=form.querySelector(`.fld[data-fid="${f.id}"]`);if(el)el.classList.add("missing")});
}

/* ===================== AUTOSAVE ===================== */
function setSaved(state){ // 'saved' | 'saving'
  const dot=document.getElementById("saveDot"),tx=document.getElementById("saveText");
  if(state==="saving"){dot.classList.add("saving");tx.textContent="Saving…";}
  else{dot.classList.remove("saving");tx.textContent="All changes saved";}
}
function scheduleAutosave(){
  dirty=true;setSaved("saving");
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{commitCurrent(true);},600);
}
function commitCurrent(isAuto){
  const d=readForm();
  // treat empty new form as nothing to save
  const anyData=Object.values(d).some(v=>v&&String(v).trim()!=="");
  const missing=missingRequired(d);
  const status=missing.length===0?"complete":"draft";
  if(currentId){
    const rec=records.find(r=>r.id===currentId);
    if(rec){rec.data=d;rec.status=status;rec.updated=nowIso();}
  }else{
    if(!anyData){setSaved("saved");dirty=false;return;} // don't create empty records
    currentId=uid();
    records.unshift({id:currentId,data:d,status,updated:nowIso(),created:nowIso()});
  }
  persist();renderList();updateValNote(missing);
  document.getElementById("formTitle").textContent=d.employeeName?d.employeeName:"New Request";
  setSaved("saved");dirty=false;
  if(!isAuto)toast("Request saved");
}
function nowIso(){return new Date().toISOString()}
function fmtDate(iso){try{const dt=new Date(iso);return dt.toLocaleString([], {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return iso}}
function updateValNote(missing){
  const n=document.getElementById("valNote");
  if(!missing)missing=missingRequired(readForm());
  if(missing.length===0){n.innerHTML='<span class="dot"></span> All required fields complete';n.style.color="var(--ok)";}
  else{n.innerHTML=`<span class="dot saving"></span> ${missing.length} required field${missing.length>1?'s':''} still needed`;n.style.color="var(--warn)";}
}

/* ===================== LIST ===================== */
function renderList(){
  const q=(document.getElementById("search").value||"").toLowerCase();
  const list=document.getElementById("reclist");list.innerHTML="";
  const filtered=records.filter(r=>{
    if(!q)return true;
    return JSON.stringify(r.data).toLowerCase().includes(q);
  });
  document.getElementById("recCount").textContent=records.length;
  if(filtered.length===0){
    list.innerHTML=`<div class="empty">${records.length?"No matches.":"No saved requests yet.<br>Fill the form or import a spreadsheet."}</div>`;return;
  }
  filtered.forEach(r=>{
    const d=r.data||{};
    const el=document.createElement("div");
    el.className="rec"+(r.id===currentId?" active":"");
    const name=d.employeeName||d.preferredName||"(no name)";
    const sub=[d.position,d.branchName].filter(Boolean).join(" · ")||d.email||"—";
    const badge=r.status==="complete"?'<span class="badge b-complete">Complete</span>':'<span class="badge b-draft">Draft</span>';
    el.innerHTML=`<div class="nm">${esc(name)}</div><div class="sub">${esc(sub)}</div>${badge}`;
    el.onclick=()=>openRecord(r.id);
    list.appendChild(el);
  });
}
function openRecord(id){
  if(dirty)commitCurrent(true);
  const r=records.find(x=>x.id===id);if(!r)return;
  currentId=id;writeForm(r.data);
  document.getElementById("formTitle").textContent=r.data.employeeName||"Request";
  updateValNote();renderList();setSaved("saved");dirty=false;
  clearTimeout(saveTimer);
  window.scrollTo({top:0});
}
function newRecord(){
  if(dirty)commitCurrent(true);
  currentId=null;writeForm({});
  document.getElementById("formTitle").textContent="New Request";
  updateValNote();renderList();setSaved("saved");dirty=false;
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ===================== IMPORT ===================== */
function normHeader(h){return String(h||"").trim().toLowerCase().replace(/\s+/g," ")}
const HEADER_MAP=(()=>{
  const m={};
  DATA_FIELDS.forEach(f=>{
    m[normHeader(f.col)]=f.id;
    m[normHeader(f.label)]=f.id;
    m[normHeader(f.id)]=f.id;
    m[normHeader(f.q+". "+f.label)]=f.id;
    m[normHeader("q"+f.q)]=f.id;
  });
  return m;
})();
function importWorkbook(wb){
  // prefer a sheet named "New Hires", else first non-instructions sheet
  let sheetName=wb.SheetNames.find(n=>/new\s*hire|requests|data/i.test(n));
  if(!sheetName)sheetName=wb.SheetNames.find(n=>!/instruction|readme|guide|values/i.test(n))||wb.SheetNames[0];
  const ws=wb.Sheets[sheetName];
  // Read as rows-of-cells so a legend/title band above the headers is tolerated.
  const aoa=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:false});
  // Locate the real header row: first row with 2+ cells matching known headers.
  let hdrRow=-1;
  for(let i=0;i<aoa.length;i++){
    const hits=(aoa[i]||[]).filter(c=>HEADER_MAP[normHeader(String(c==null?"":c))]).length;
    if(hits>=2){hdrRow=i;break;}
  }
  if(hdrRow<0){toast("Couldn't find the header row. Use the provided template headers.",true);return;}
  const headers=(aoa[hdrRow]||[]).map(h=>String(h==null?"":h));
  const rows=aoa.slice(hdrRow+1)
    .filter(r=>(r||[]).some(c=>String(c==null?"":c).trim()!==""))
    .map(r=>{const o={};headers.forEach((h,ci)=>{if(h)o[h]=r[ci]==null?"":r[ci];});return o;});
  if(!rows.length){toast("No data rows found in the spreadsheet.",true);return;}
  // build column->fieldid map from actual headers
  const sample=rows[0];
  const colMap={};let matched=0;
  Object.keys(sample).forEach(col=>{
    const fid=HEADER_MAP[normHeader(col)];
    if(fid){colMap[col]=fid;matched++;}
  });
  if(matched===0){toast("Couldn't match any columns. Use the provided template headers.",true);return;}
  let added=0,updated=0;const errors=[];
  const matchedFids=new Set(Object.values(colMap));
  // index existing records by Employee Name + Email (first occurrence wins)
  const importKey=data=>{const n=normHeader(data&&data.employeeName||"");const e=normHeader(data&&data.email||"");return n?n+"|"+e:"";};
  const existingByKey=new Map();
  records.forEach(r=>{const k=importKey(r.data||{});if(k&&!existingByKey.has(k))existingByKey.set(k,r);});
  rows.forEach((row,i)=>{
    const d={};DATA_FIELDS.forEach(f=>d[f.id]="");
    let any=false;
    Object.keys(row).forEach(col=>{
      const fid=colMap[col];if(!fid)return;
      let v=row[col];
      if(v==null)v="";
      v=String(v).trim();
      // normalize dates coming from excel
      const f=FIELD_BY_ID[fid];
      if(f.type===T.DATE&&v){v=normDate(v);}
      else if(DOLLAR_FIELD_IDS.includes(fid)&&v){v=fmtDollarStr(v);}
      d[fid]=v;if(v)any=true;
    });
    if(!any)return;
    const key=importKey(d);
    const hit=key?existingByKey.get(key):null;
    if(hit){
      // update in place: overwrite only the columns present in this sheet; keep stage, letter edits, hidden fields
      matchedFids.forEach(fid=>{hit.data[fid]=d[fid];});
      hit.status=missingRequired(hit.data).length?"draft":"complete";
      hit.updated=nowIso();
      updated++;
    }else{
      const rec={id:uid(),data:d,status:missingRequired(d).length?"draft":"complete",created:nowIso(),updated:nowIso()};
      records.unshift(rec);
      if(key)existingByKey.set(key,rec);   // duplicate rows within one import update, not double-add
      added++;
    }
  });
  persist();renderList();if(typeof renderStageTables==="function")renderStageTables();
  closeModal();
  const parts=[];if(added)parts.push(added+" added");if(updated)parts.push(updated+" updated");
  toast('Imported from "'+sheetName+'": '+(parts.join(", ")||"no new rows")+".");
}
function normDate(v){
  // accept mm/dd/yyyy, yyyy-mm-dd, excel serial-ish strings
  v=v.trim();
  let m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(m){let[_,mm,dd,yy]=m;if(yy.length===2)yy="20"+yy;return `${yy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;}
  m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m)return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
  return v;
}

/* ===================== EXPORT ===================== */
function recordsToAoa(includeMeta,recs){
  recs=recs||records;
  const head=[...HEADERS];if(includeMeta)head.push(...META_COLS);
  const aoa=[head];
  recs.forEach(r=>{
    const row=DATA_FIELDS.map(f=>r.data[f.id]||"");
    if(includeMeta)row.push(r.id,r.status,fmtDate(r.updated));
    aoa.push(row);
  });
  return aoa;
}
// Export ONLY the checked pipeline rows to CSV.
function exportSelectedCsv(ids){
  if(!ids||!ids.length){toast("Check at least one person to export.",true);return;}
  const recs=ids.map(id=>records.find(r=>r.id===id)).filter(Boolean);
  if(!recs.length){toast("Couldn't find the selected records.",true);return;}
  const ws=XLSX.utils.aoa_to_sheet(recordsToAoa(true,recs));
  const csv=XLSX.utils.sheet_to_csv(ws);
  downloadBlob(new Blob([csv],{type:"text/csv"}),"new_hire_requests_selected_"+dstamp()+".csv");
  toast("Exported "+recs.length+" selected request"+(recs.length===1?"":"s")+" to CSV.");
}
function exportXlsx(){
  if(!records.length){toast("Nothing to export yet.",true);return;}
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet(recordsToAoa(true));
  ws["!cols"]=HEADERS.map(h=>({wch:Math.min(Math.max(h.length+2,12),34)})).concat(META_COLS.map(()=>({wch:16})));
  XLSX.utils.book_append_sheet(wb,ws,"New Hires");
  XLSX.writeFile(wb,"new_hire_requests_"+dstamp()+".xlsx");
  toast("Exported "+records.length+" request(s).");
}
function exportCsv(){
  if(!records.length){toast("Nothing to export yet.",true);return;}
  const ws=XLSX.utils.aoa_to_sheet(recordsToAoa(true));
  const csv=XLSX.utils.sheet_to_csv(ws);
  downloadBlob(new Blob([csv],{type:"text/csv"}),"new_hire_requests_"+dstamp()+".csv");
  toast("Exported CSV.");
}
function dstamp(){const d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}

/* ===================== TEMPLATE ===================== */
function buildTemplateWb(){
  const wb=XLSX.utils.book_new();
  const TF=DATA_FIELDS.filter(f=>!f.tmplHide);   // columns shown in the template
  // Sheet 1: New Hires (headers + one example row)
  const example=TF.map(f=>EXAMPLE[f.id]!==undefined?EXAMPLE[f.id]:"");
  const ws=XLSX.utils.aoa_to_sheet([TF.map(f=>f.col),example]);
  ws["!cols"]=TF.map(f=>({wch:Math.min(Math.max(f.col.length+2,12),34)}));
  XLSX.utils.book_append_sheet(wb,ws,"New Hires");
  // Sheet 2: Instructions
  const instr=[["Offer & New Hire Request — Import Template"],[""],
    ["How to use:"],
    ["1. Enter one new hire per row on the 'New Hires' tab, under the matching column headers."],
    ["2. Do not rename or reorder the header row — the app matches columns by these names."],
    ["3. Leave a cell blank if not applicable (unless the field is Required)."],
    ["4. In the app, click 'Import Spreadsheet' and choose this file."],
    [""],
    ["Column","Required","Type","Allowed values / format / notes"]];
  TF.forEach(f=>{
    let allowed="Free text";
    if(f.type===T.DATE)allowed="Date (MM/DD/YYYY or YYYY-MM-DD)";
    else if(f.type===T.EMAIL)allowed="Email address";
    else if(f.type===T.TEL)allowed="Phone number";
    else if(f.type===T.RADIO)allowed="One of: "+f.options.join(" | ");
    else if(f.type===T.RADIO_OTHER)allowed="One of: "+f.options.join(" | ")+" | (or your own text)";
    if(f.help)allowed+=(allowed?"  —  ":"")+f.help;
    instr.push([f.col,f.req?"Yes":"",typeLabel(f),allowed]);
  });
  const wsi=XLSX.utils.aoa_to_sheet(instr);
  wsi["!cols"]=[{wch:30},{wch:10},{wch:14},{wch:80}];
  XLSX.utils.book_append_sheet(wb,wsi,"Instructions");
  return wb;
}
function typeLabel(f){return f.type===T.AREA?"Text":f.type===T.RADIO||f.type===T.RADIO_OTHER?"Choice":f.type.charAt(0).toUpperCase()+f.type.slice(1)}
const EXAMPLE={employeeName:"Mickey Mouse",preferredName:"Mickey",email:"mickey.mouse@example.com",phone:"555.132.4567",
 fullAddress:"1313 Disneyland Dr, Anaheim, CA 92802",nmls:"NA",branchName:"Branch Disneyland",branchManager:"Walt Disney",
 workLocation:"Remote",position:"Branch Sales Assistant",employmentType:"Full Time - Operations",reportsTo:"Walt Disney",
 ptoManager:"",startDate:"07/24/2026",baseHourly:"",baseHoursWeek:"",baseMonthly:"4,333",baseAnnual:"",bonusStructure:"",bonusFunding:"N/A",dualCapacity:"No",
 equipment:"Laptop, docking station, 2 monitors",swagBox:"Operations",tshirt:"M",pipelinePeople:"Self",pipelineNeeded:"Branch Disneyland",
 encompassProfile:"Loan Officer Assistant",assignedProcessor:"NA",assignedLOA:"NA",loVolume:"",mmiSnippet:"",
 compStandard:"",compBranch:"",compBuilder:"",compCorporate:"",compLeads:"",compBrokered:"",compMinimum:"",compMaximum:"",
 processingFee:"",underwritingFee:"",branchPricing:"The new hire is not licensed"};
function downloadTemplate(){
  XLSX.writeFile(buildTemplateWb(),"new_hire_import_template.xlsx");
  toast("Template downloaded.");
}

/* ===================== BACKUP / RESTORE ===================== */
function backup(){
  const blob=new Blob([JSON.stringify({app:"onhr",version:"1.21",exported:nowIso(),records},null,2)],{type:"application/json"});
  downloadBlob(blob,"new_hire_backup_"+dstamp()+".json");
  toast("Backup saved.");
}
function restore(obj){
  if(!obj||!Array.isArray(obj.records)){toast("Not a valid backup file.",true);return;}
  confirmModal("Restore backup",`This will add ${obj.records.length} record(s) from the backup to your current list. Continue?`,()=>{
    obj.records.forEach(r=>{if(r&&r.data){records.unshift({id:uid(),data:r.data,status:r.status||(missingRequired(r.data).length?"draft":"complete"),created:r.created||nowIso(),updated:r.updated||nowIso()})}});
    persist();renderList();toast("Restored "+obj.records.length+" record(s).");
  });
}

/* ===================== MODAL / TOAST ===================== */
let toastTimer=null;
function toast(msg,err){
  const t=document.getElementById("toast");t.textContent=msg;t.className="toast show"+(err?" err":"");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.className="toast",2600);
}
function openModal(title,bodyHtml,footHtml){
  document.getElementById("modalTitle").textContent=title;
  document.getElementById("modalBody").innerHTML=bodyHtml;
  document.getElementById("modalFoot").innerHTML=footHtml;
  document.getElementById("modalBg").classList.add("show");
}
function closeModal(){document.getElementById("modalBg").classList.remove("show")}
function confirmModal(title,msg,onYes,onCancel){
  openModal(title,`<p>${esc(msg)}</p>`,`<button class="btn-light" id="mCancel">Cancel</button><button class="btn-primary" id="mYes">Continue</button>`);
  document.getElementById("mCancel").onclick=()=>{closeModal();if(onCancel)onCancel();};
  document.getElementById("mYes").onclick=()=>{closeModal();onYes();};
}

/* ===================== EVENTS ===================== */
form.addEventListener("input",e=>{
  scheduleAutosave();
  // A real field edit marks any hand-edited letter for this record as stale, so the letter rebuilds.
  if(e.target&&e.target.dataset&&e.target.dataset.f&&currentId){var _r=records.find(x=>x.id===currentId);if(_r&&_r.letterHtml)_r.letterStale=true;}
  if(e.target.matches('[data-f="bonusGuaranteeAmount"],[data-f="bonusGuaranteeMonths"]'))computeGuarantee();
  if(e.target.matches('[data-f="bonusProductionAmount"],[data-f="bonusProductionVolume"],[data-f="bonusProductionMaxMonths"]'))computeProduction();
  if(e.target.matches('[data-f="baseHourly"],[data-f="baseHoursWeek"],[data-f="baseMonthly"],[data-f="baseAnnual"]'))computeBaseWage();
});
form.addEventListener("focusout",e=>{
  if(e.target.matches&&e.target.matches(DOLLAR_SEL)){formatDollarField(e.target);computeGuarantee();computeProduction();computeBaseWage();scheduleAutosave();}
});
form.addEventListener("change",e=>{
  if(e.target.matches("[data-bonuschk]")){
    const key=e.target.getAttribute("data-bonuschk");
    const item=e.target.closest(".bonus-item");
    if(item)item.classList.toggle("open",e.target.checked);
    if(!e.target.checked&&BONUS_GROUPS[key])BONUS_GROUPS[key].forEach(id=>{const el=form.querySelector(`[data-f="${id}"]`);if(el)el.value="";});
    if(key==="guarantee")computeGuarantee();
    if(key==="production")computeProduction();
  }
  if(e.target&&((e.target.dataset&&e.target.dataset.f)||e.target.name)&&currentId){var _r=records.find(x=>x.id===currentId);if(_r&&_r.letterHtml)_r.letterStale=true;}
  scheduleAutosave();updateValNote();
});
document.getElementById("search").addEventListener("input",renderList);
document.getElementById("btnNew").onclick=newRecord;
document.getElementById("btnSave").onclick=()=>{
  const d=readForm();const missing=missingRequired(d);
  commitCurrent(false);
  if(missing.length){markMissing(missing);toast("Saved as draft — "+missing.length+" required field(s) still needed.");}
};
document.getElementById("btnDelete").onclick=()=>{
  if(!currentId){newRecord();return;}
  confirmModal("Delete request","Permanently delete this request? This cannot be undone.",()=>{
    records=records.filter(r=>r.id!==currentId);persist();currentId=null;writeForm({});
    document.getElementById("formTitle").textContent="New Request";renderList();updateValNote();toast("Request deleted.");
  });
};
document.getElementById("btnDuplicate").onclick=()=>{
  const d=readForm();const anyData=Object.values(d).some(v=>v&&String(v).trim()!=="");
  if(!anyData){toast("Nothing to duplicate.",true);return;}
  if(dirty)commitCurrent(true);
  const copy=JSON.parse(JSON.stringify(d));copy.employeeName=(copy.employeeName||"")+" (copy)";
  currentId=uid();records.unshift({id:currentId,data:copy,status:missingRequired(copy).length?"draft":"complete",created:nowIso(),updated:nowIso()});
  persist();writeForm(copy);document.getElementById("formTitle").textContent=copy.employeeName;renderList();toast("Duplicated.");
};
document.getElementById("btnPrint").onclick=()=>{if(dirty)commitCurrent(true);window.print();};
document.getElementById("btnImport").onclick=()=>document.getElementById("fileImport").click();
document.getElementById("fileImport").addEventListener("change",function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:"array"});importWorkbook(wb);}catch(err){toast("Could not read file: "+err.message,true);}};
  reader.readAsArrayBuffer(file);this.value="";
});
document.getElementById("btnTemplate").onclick=downloadTemplate;
document.getElementById("dataFileBtn").onclick=dataFileBtnClick;
document.getElementById("btnDisconnectFile").onclick=disconnectDataFile;
document.getElementById("reconnectNowBtn").onclick=function(){reconnectOrCreate();};
(function(){var pb=document.getElementById("reconnectPickBtn");if(pb)pb.onclick=function(){pickDataFile();};})();
window.addEventListener("focus",function(){if(DATA_HANDLE)heartbeatPresence();});   // re-check permission/presence on return
document.getElementById("btnExport").onclick=exportXlsx;
document.getElementById("btnExportCsv").onclick=exportCsv;
document.getElementById("btnBackup").onclick=backup;
document.getElementById("btnRestore").onclick=()=>document.getElementById("fileRestore").click();
document.getElementById("fileRestore").addEventListener("change",function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{try{restore(JSON.parse(e.target.result));}catch(err){toast("Invalid backup file.",true);}};
  reader.readAsText(file);this.value="";
});
document.getElementById("modalBg").addEventListener("click",e=>{if(e.target.id==="modalBg")closeModal();});
window.addEventListener("beforeunload",()=>{if(dirty)commitCurrent(true);});

/* ===================== INIT ===================== */
loadRecords();migrateLetterStyles();buildForm();renderList();writeForm({});updateValNote();
if(records.length)openRecord(records[0].id);
initDataFile();
</script>
