// Ajustes regionais: JSON central em uma única célula, gravado sob lock.
// Sessão e identidade vêm exclusivamente de segTokenValidar_ no servidor.
var AJUSTE_ABA = 'ajustes_agenda';
var AJUSTE_UNIDADES = [
  { id: 'caruaru', city: 'Caruaru', clinic: 'Caruaru Clinical Center', aliases: ['Caruaru', 'Caruaru Clinical Center'], frequency: 7, weekday: 2, base: '', periods: ['manha','tarde'], coordinates: {lat:-8.2832,lng:-35.9753} },
  { id: 'gravata', city: 'Gravatá', clinic: 'Gravatá Clinical Center', aliases: ['Gravatá','Gravatá Clinical Center'], frequency: 14, weekday: 3, base: '2026-05-13', periods: ['manha'], coordinates: {lat:-8.2036,lng:-35.5611} },
  { id: 'palmares', city: 'Palmares', clinic: 'Clínica Santa Joana', aliases: ['Palmares','Santa Joana','Clínica Santa Joana'], frequency: 7, weekday: 5, base: '', periods: ['manha','tarde'], coordinates: {lat:-8.6855,lng:-35.5883} },
  { id: 'jaboatao', city: 'Jaboatão', clinic: 'Clinical+Saúde', aliases: ['Jaboatão','Clinical+Saúde'], frequency: 14, weekday: 1, base: '2026-05-18', periods: ['manha','tarde'], coordinates: {lat:-8.1131,lng:-35.0053} },
  { id: 'limoeiro', city: 'Limoeiro', clinic: 'Clínica Limoeiro', aliases: ['Limoeiro','Clínica Limoeiro','Clínica Magalhães Pedrosa'], frequency: 14, weekday: 1, base: '2026-05-11', periods: ['manha'], coordinates: {lat:-7.88103,lng:-35.44964} },
  { id: 'carpina', city: 'Carpina', clinic: 'Clínica Carpina', aliases: ['Carpina','Clínica Carpina'], frequency: 14, weekday: 1, base: '2026-05-11', periods: ['tarde'], coordinates: {lat:-7.8452,lng:-35.2531} }
];

function ajustePodeEditar_(ctx) {
  var configured = PropertiesService.getScriptProperties().getProperty('AGENDA_AJUSTE_USUARIOS');
  var allowed = configured ? JSON.parse(configured) : ['lucas','andrea'];
  return !!(ctx && ctx.perfil === 'amplo' && allowed.indexOf(ctx.usuario) !== -1);
}
function ajusteUnidades_(ss) {
  var sheet = ss.getSheetByName(CFG_AGENDA.ABA_CLINICAS);
  var rows = sheet && sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues() : [];
  return AJUSTE_UNIDADES.map(function(unit) {
    var copy = JSON.parse(JSON.stringify(unit));
    var matches = rows.filter(function(row) { return normalizar(String(row[1]))===normalizar(unit.city) || unit.aliases.some(function(alias) { return normalizar(alias)===normalizar(String(row[0])); }); });
    // Ausência no cadastro não desativa uma landing existente. Uma marcação
    // explícita NÃO/NAO no cadastro central é respeitada.
    copy.active = !matches.length || matches.some(function(row) { return ['NAO','NÃO'].indexOf(String(row[2]).trim().toUpperCase())===-1; });
    return copy;
  });
}
function ajusteLer_(ss) {
  var sheet = ss.getSheetByName(AJUSTE_ABA);
  var raw = sheet ? sheet.getRange('A2').getValue() : '';
  if (!raw) return {schemaVersion:1, revision:0, exceptions:[], updatedAt:null};
  var doc = JSON.parse(String(raw));
  if (doc.schemaVersion !== 1 || !Array.isArray(doc.exceptions)) throw new Error('Agenda inválida.');
  return doc;
}
function ajusteDataValida_(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  var d = new Date(date+'T12:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0,10) === date;
}
function ajusteValidarLado_(side, units, extra) {
  if (!side || !ajusteDataValida_(side.date || '')) throw new Error('Informe uma data válida.');
  if (side.date < salaHoje_()) throw new Error('A data deve ser hoje ou futura.');
  var unit = units.filter(function(u) { return u.id === side.unitId; })[0];
  if (!unit || (extra && !unit.active)) throw new Error('Unidade inválida ou inativa.');
  if (['manha','tarde','dia_todo','horario'].indexOf(side.period) === -1) throw new Error('Turno inválido.');
  if (side.period === 'horario' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(side.time || '')) throw new Error('Informe o horário específico.');
  return {unitId:unit.id, city:unit.city, date:side.date, period:side.period, time:side.period==='horario'?side.time:null};
}
function ajusteSalvar_(dados, ctx) {
  if (!ajustePodeEditar_(ctx)) return {ok:false,erro:'Ajuste permitido somente a Lucas e Andréa.'};
  var action = dados.action;
  if (['extra','suspend','swap'].indexOf(action) === -1) return {ok:false,erro:'Ação inválida.'};
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(dados.requestId || '')) return {ok:false,erro:'Identificador inválido.'};
  var note = String(dados.internalNote || '').trim();
  if (note.length > 1000) return {ok:false,erro:'Observação deve ter até 1000 caracteres.'};
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {ok:false,erro:'Agenda ocupada. Tente novamente.'};
  try {
    var ss = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
    var units = ajusteUnidades_(ss);
    var doc = ajusteLer_(ss);
    if (doc.exceptions.some(function(e) { return e.operationId === dados.requestId; })) return {ok:true,revision:doc.revision,repeated:true};
    if (dados.revision !== doc.revision) return {ok:false,conflict:true,erro:'Outra pessoa atualizou a agenda. Atualize o preview e tente novamente.'};
    var source = action !== 'extra' ? ajusteValidarLado_(dados.source,units,false) : null;
    var target = action !== 'suspend' ? ajusteValidarLado_(dados.target,units,true) : null;
    if (source && target && source.unitId===target.unitId && source.date===target.date && source.period===target.period && source.time===target.time) throw new Error('Origem e destino devem ser diferentes.');
    var entries = [];
    function add(side,type) {
      var entry = JSON.parse(JSON.stringify(side));
      entry.id = Utilities.getUuid(); entry.operationId = dados.requestId; entry.type = type;
      entry.internalNote = note; entry.createdBy = ctx.usuario; entry.createdAt = new Date().toISOString();
      entries.push(entry);
    }
    if (source) add(source,'suspend');
    if (target) add(target,'extra');
    doc.exceptions = doc.exceptions.concat(entries); doc.revision++; doc.updatedAt = new Date().toISOString();
    var raw = JSON.stringify(doc);
    if (raw.length > 45000) throw new Error('Agenda de ajustes atingiu o limite. Solicite arquivamento antes de continuar.');
    var sheet = ss.getSheetByName(AJUSTE_ABA);
    if (!sheet) { sheet = ss.insertSheet(AJUSTE_ABA); sheet.getRange('A1').setValue('JSON de ajustes — acesso administrativo'); }
    sheet.getRange('A2').setValue(raw); // Ambos os lados da troca na mesma gravação.
    SpreadsheetApp.flush();
    return {ok:true,revision:doc.revision};
  } catch(e) { return {ok:false,erro:e.message}; }
  finally { lock.releaseLock(); }
}
function ajustePublico_() {
  var ss = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
  var doc = ajusteLer_(ss);
  var units = ajusteUnidades_(ss);
  var sheet = agendaSheet_(ss), last = sheet.getLastRow();
  var rows = last > 1 ? sheet.getRange(2,1,last-1,CAB_AGENDA.length).getValues() : [];
  var explicit = [];
  rows.forEach(function(row) {
    var date = salaDataStr_(row[0]);
    if (!date || date < salaHoje_()) return;
    var unit = units.filter(function(u) { return u.aliases.some(function(a) { return normalizar(a)===normalizar(String(row[1])); }); })[0];
    if (unit) explicit.push({unitId:unit.id,date:date,period:String(row[2]||'Dia todo'),status:String(row[3]||'aberta')});
  });
  var exceptions = doc.exceptions.filter(function(e) { return e.date >= salaHoje_(); }).map(function(e) {
    return {id:e.id,operationId:e.operationId,type:e.type,unitId:e.unitId,city:e.city,date:e.date,period:e.period,time:e.time};
  });
  return {ok:true,schemaVersion:1,revision:doc.revision,updatedAt:doc.updatedAt,today:salaHoje_(),units:units,explicit:explicit,exceptions:exceptions};
}
function ajusteAdmin_(ctx) {
  if (!ajustePodeEditar_(ctx)) return {ok:false,erro:'Acesso restrito a Lucas e Andréa.'};
  var ss = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
  var doc = ajusteLer_(ss);
  return {ok:true,revision:doc.revision,units:ajusteUnidades_(ss),exceptions:doc.exceptions};
}
