// ================================================================
//  APPS SCRIPT — AGENDA POR CLÍNICA (F3 da SPEC_PORTAL_SECRETARIA_AGENDA)
//  Criado 2026-07-05.
//
//  Aba `agenda`: UMA linha por (Data, Clinica) — upsert, sem duplicata.
//  Colunas: Data (AAAA-MM-DD) · Clinica · Turno · Status (aberta/fechada)
//           · Vagas · Obs · Atualizado por · Atualizado em
//  Regras (decisões D5/D6 do 02_DECISOES_TECNICAS):
//   - TODA ação de agenda EXIGE sessão válida (token do login — Seguranca.js).
//   - perfil restrito: lê e grava SÓ a própria clínica (forçado no servidor).
//   - perfil amplo (Lucas/Andréa): lê/grava todas; filtro opcional por clínica.
//  MVP deliberado: datas explícitas (sem motor de recorrência) — o padrão
//  semanal do médico continua no prontuário desktop; aqui é a lista de
//  DATAS ABERTAS que as secretárias mantêm. Reusa helpers globais do
//  projeto: salaHoje_/salaDataStr_/salaIso_ (Sala.js) e normalizar.
// ================================================================

var CFG_AGENDA = {
  SHEET_ID:     '1jOCTouiysBX3we7iMO2hEAX3JY7LU1wsM6RNhbTbHP0',
  ABA:          'agenda',
  ABA_CLINICAS: 'clinicas',
};
var CAB_AGENDA = ['Data', 'Clinica', 'Turno', 'Status', 'Vagas', 'Obs',
                  'Atualizado por', 'Atualizado em', 'Regime'];
var AGENDA_STATUS = ['aberta', 'fechada'];
var AGENDA_REGIMES = ['Ordem de chegada', 'Hora marcada']; // default = Ordem de chegada

function dispatchAgenda_(acao, dados, ctx) {
  if (acao === 'agenda_regional_publica') return ajustePublico_();
  if (acao === 'agenda_ajustes_listar') return ajusteAdmin_(ctx);
  if (acao === 'agenda_ajuste_salvar') return ajusteSalvar_(dados, ctx);
  if (acao === 'agenda_publica') return agendaPublica_(dados); // SEM sessão (landings): só datas abertas, sem Obs
  if (!ctx) return { ok: false, erro: 'Sessão expirada — entre novamente pelo Portal.' };
  if (acao === 'agenda_listar') return agendaListar_(dados, ctx);
  if (acao === 'agenda_salvar') return agendaSalvar_(dados, ctx);
  return { ok: false, erro: 'Ação de agenda desconhecida: ' + acao };
}

// (F5/F3.2) Leitura pública ENXUTA p/ o pré-agendamento das landings:
// só datas ABERTAS no período, sem Obs e sem qualquer dado de paciente.
function agendaPublica_(dados) {
  var ss  = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
  var aba = agendaSheet_(ss);
  var de  = salaDataStr_(String((dados && dados.de)  || '').trim()) || salaHoje_();
  var ate = salaDataStr_(String((dados && dados.ate) || '').trim()) || agendaMaisDias_(de, 60);
  var clin = normalizar(String((dados && dados.clinica) || ''));
  var last = aba.getLastRow();
  var rows = last >= 2 ? aba.getRange(2, 1, last - 1, CAB_AGENDA.length).getValues() : [];
  var itens = [];
  for (var i = 0; i < rows.length; i++) {
    var d = salaDataStr_(rows[i][0]);
    if (!d || d < de || d > ate) continue;
    if (String(rows[i][3] || 'aberta') !== 'aberta') continue;
    var cl = String(rows[i][1] || '').trim();
    if (clin && normalizar(cl).indexOf(clin) === -1) continue;
    itens.push({ data: d, clinica: cl, turno: String(rows[i][2] || ''),
                 regime: String(rows[i][8] || '') || 'Ordem de chegada' });
  }
  itens.sort(function (a, b) { return a.data < b.data ? -1 : a.data > b.data ? 1 : 0; });
  return { ok: true, de: de, ate: ate, itens: itens };
}

function agendaSheet_(ss) {
  var aba = ss.getSheetByName(CFG_AGENDA.ABA);
  if (!aba) {
    aba = ss.insertSheet(CFG_AGENDA.ABA);
    aba.getRange(1, 1, 1, CAB_AGENDA.length).setValues([CAB_AGENDA]);
    var cab = aba.getRange(1, 1, 1, CAB_AGENDA.length);
    cab.setBackground('#1a3a5c'); cab.setFontColor('#ffffff'); cab.setFontWeight('bold');
    aba.setFrozenRows(1);
  } else {
    garantirCabecalhos_(aba, CAB_AGENDA, '#1a3a5c'); // colunas novas (ex.: Regime) entram sozinhas
  }
  return aba;
}

// Clínicas ativas do cadastro central (aba `clinicas`)
function agendaClinicas_(ss) {
  var aba = ss.getSheetByName(CFG_AGENDA.ABA_CLINICAS);
  if (!aba || aba.getLastRow() < 2) return [];
  var rows = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var nome  = String(rows[i][0]).trim();
    var ativa = String(rows[i][2]).trim().toUpperCase();
    if (nome && ativa !== 'NAO' && ativa !== 'NÃO') out.push(nome);
  }
  return out;
}

function agendaMaisDias_(deStr, n) {
  var p = String(deStr).split('-');
  var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + n);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function agendaListar_(dados, ctx) {
  var ss  = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
  var aba = agendaSheet_(ss);
  var de  = salaDataStr_(String((dados && dados.de)  || '').trim()) || salaHoje_();
  var ate = salaDataStr_(String((dados && dados.ate) || '').trim()) || agendaMaisDias_(de, 60);

  var clinFiltro = '';
  if (ctx.perfil === 'restrito') clinFiltro = normalizar(String(ctx.clinica || ''));
  else if (dados && dados.clinica) clinFiltro = normalizar(String(dados.clinica));

  var last = aba.getLastRow();
  var rows = last >= 2 ? aba.getRange(2, 1, last - 1, CAB_AGENDA.length).getValues() : [];
  var itens = [];
  for (var i = 0; i < rows.length; i++) {
    var d = salaDataStr_(rows[i][0]);
    if (!d || d < de || d > ate) continue;
    var cl = String(rows[i][1] || '').trim();
    if (clinFiltro && normalizar(cl).indexOf(clinFiltro) === -1) continue;
    itens.push({
      data:   d,
      clinica: cl,
      turno:  String(rows[i][2] || ''),
      status: String(rows[i][3] || 'aberta'),
      vagas:  String(rows[i][4] || ''),
      obs:    String(rows[i][5] || ''),
      por:    String(rows[i][6] || ''),
      em:     rows[i][7] ? salaIso_(rows[i][7]) : '',
      regime: String(rows[i][8] || '') || 'Ordem de chegada',
    });
  }
  itens.sort(function (a, b) {
    if (a.data !== b.data) return a.data < b.data ? -1 : 1;
    return a.clinica < b.clinica ? -1 : 1;
  });
  return { ok: true, de: de, ate: ate, itens: itens,
           clinicas: agendaClinicas_(ss),
           // (F5) marcações do mesmo período/filtro — a página da agenda mostra
           // contagens e destaca as PENDENTES de confirmação (origem online).
           marcacoes: marcacoesNoPeriodo_(ss, de, ate, clinFiltro),
           perfil: ctx.perfil, clinica_sessao: ctx.clinica || '' };
}

function agendaSalvar_(dados, ctx) {
  var data = salaDataStr_(String((dados && dados.data) || '').trim());
  if (!data) return { ok: false, erro: 'Data inválida (use AAAA-MM-DD).' };

  var clinica = String((dados && dados.clinica) || '').trim();
  if (ctx.perfil === 'restrito') {
    if (!String(ctx.clinica || '').trim())
      return { ok: false, erro: 'Seu usuário não tem clínica definida na aba usuarios.' };
    clinica = String(ctx.clinica).trim(); // D6: restrito só edita a própria clínica
  }
  if (!clinica) return { ok: false, erro: 'Informe a clínica.' };

  var turno  = String((dados && dados.turno)  || '').trim() || 'Dia todo';
  var status = String((dados && dados.status) || 'aberta').trim().toLowerCase();
  if (AGENDA_STATUS.indexOf(status) === -1) status = 'aberta';
  var vagas = String((dados && dados.vagas) || '').trim();
  var obs   = String((dados && dados.obs)   || '').trim();
  var regime = String((dados && dados.regime) || '').trim();
  if (AGENDA_REGIMES.indexOf(regime) === -1) regime = 'Ordem de chegada';

  var ss  = SpreadsheetApp.openById(CFG_AGENDA.SHEET_ID);
  var aba = agendaSheet_(ss);
  var lock = LockService.getScriptLock();
  var locked = false; try { locked = lock.tryLock(10000); } catch (e) {}
  try {
    var last = aba.getLastRow();
    var linha = 0;
    if (last >= 2) {
      var rows = aba.getRange(2, 1, last - 1, 2).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (salaDataStr_(rows[i][0]) === data &&
            normalizar(String(rows[i][1])) === normalizar(clinica)) { linha = i + 2; break; }
      }
    }
    var reg = [data, clinica, turno, status, vagas, obs, ctx.usuario, new Date(), regime];
    if (linha) aba.getRange(linha, 1, 1, CAB_AGENDA.length).setValues([reg]);
    else aba.appendRow(reg);
    return { ok: true, atualizado: !!linha,
             item: { data: data, clinica: clinica, turno: turno, status: status,
                     vagas: vagas, obs: obs, regime: regime } };
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (e2) {} }
  }
}
