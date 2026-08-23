const APP_KEY = "shiv-bungalows-2026";
const DATA_KEY = "SHIV_BUNGALOWS_DATA_V2";

function doGet(e) {
  return json_({ok:true, service:"Shiv Bungalows Online 92", time:new Date().toISOString()});
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.app !== APP_KEY) return json_({ok:false,error:"Invalid app"});
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (body.action === "getAll") {
        return json_({ok:true,data:readData_(),updatedAt:new Date().toISOString()});
      }
      if (body.action === "saveAll") {
        const clean = normalizeData_(body.data || {});
        PropertiesService.getScriptProperties().setProperty(DATA_KEY, JSON.stringify(clean));
        return json_({ok:true,data:clean,updatedAt:new Date().toISOString()});
      }
      return json_({ok:false,error:"Unknown action"});
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function readData_() {
  const raw = PropertiesService.getScriptProperties().getProperty(DATA_KEY);
  if (!raw) return emptyData_();
  try { return normalizeData_(JSON.parse(raw)); }
  catch(e) { return emptyData_(); }
}

function emptyData_() {
  return {maintenance:[],complaint:[],meeting:[],reminder:[],extra:[]};
}

function normalizeData_(d) {
  const out = emptyData_();
  Object.keys(out).forEach(k => {
    out[k] = Array.isArray(d[k]) ? d[k].slice(-500) : [];
  });
  return out;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
