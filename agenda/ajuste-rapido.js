(function(){
  'use strict';
  var units=[],revision=0,requestId=null,loading=false;
  var abrirPeloPortal=location.hash==='#quick-adjust-card';
  function el(id){return document.getElementById(id);}
  function side(prefix){return {unitId:el(prefix+'Unit').value,date:el(prefix+'Date').value,period:el(prefix+'Period').value,time:el(prefix+'Time').value};}
  function input(){return {action:el('adjustAction').value,source:side('source'),target:side('target'),internalNote:el('adjustNote').value.trim()};}
  function status(kind,message){el('adjustStatus').className='alerta '+kind;el('adjustStatus').textContent=message;}
  function update(){
    var value=input();
    ['source','target'].forEach(function(prefix){
      var shown=prefix==='source'?value.action!=='extra':value.action!=='suspend';
      el(prefix+'Fields').hidden=!shown;
      ['Unit','Date','Period','Time'].forEach(function(suffix){el(prefix+suffix).disabled=!shown;});
      el(prefix+'Unit').required=shown;el(prefix+'Date').required=shown;
      var timed=shown && value[prefix].period==='horario';
      el(prefix+'TimeGroup').hidden=!timed;el(prefix+'Time').required=timed;
    });
    el('publicPreview').textContent=AgendaRegional.preview(value,units);
  }
  async function load(){
    if(!sess)return;
    try {
      var response=await api({acao:'agenda_ajustes_listar'});
      if(!response.ok){el('quick-adjust-card').classList.add('hidden');return;}
      revision=response.revision;units=response.units;
      ['source','target'].forEach(function(prefix){
        var select=el(prefix+'Unit'),old=select.value;select.replaceChildren();
        select.appendChild(new Option('Selecione',''));
        units.filter(function(u){return prefix==='source'||u.active;}).forEach(function(u){select.appendChild(new Option(u.city+' — '+u.clinic+(u.active?'':' (inativa)'),u.id));});
        select.value=old;
      });
      el('adjustHistory').replaceChildren();
      response.exceptions.slice().reverse().forEach(function(entry){
        var row=document.createElement('p');row.style.marginBottom='8px';
        row.textContent=(entry.type==='extra'?'Extra':'Suspensão')+' · '+entry.city+' · '+entry.date.split('-').reverse().join('/')+' · '+entry.period+(entry.time?' '+entry.time:'')+' · '+entry.createdBy+(entry.internalNote?' — '+entry.internalNote:'');
        el('adjustHistory').appendChild(row);
      });
      el('quick-adjust-card').classList.remove('hidden');update();
      if(abrirPeloPortal){
        abrirPeloPortal=false;
        await carregamentoInicial;
        var titulo=el('quick-adjust-card').querySelector('h2');
        titulo.tabIndex=-1;titulo.focus({preventScroll:true});
        el('quick-adjust-card').scrollIntoView({block:'start'});
      }
    }catch(error){status('erro','Não foi possível carregar os ajustes.');}
  }
  el('quick-adjust-form').addEventListener('input',function(){requestId=null;update();});
  el('quick-adjust-form').addEventListener('change',function(){requestId=null;update();});
  el('clearQuickAdjust').addEventListener('click',function(){el('quick-adjust-form').reset();requestId=null;update();status('','');});
  el('refreshQuickAdjust').addEventListener('click',load);
  el('quick-adjust-form').addEventListener('submit',async function(event){
    event.preventDefault();if(loading)return;
    if(!el('quick-adjust-form').reportValidity())return;
    var data=input();data.acao='agenda_ajuste_salvar';data.revision=revision;
    requestId=requestId||crypto.randomUUID();data.requestId=requestId;
    loading=true;el('saveQuickAdjust').disabled=true;
    try{
      var response=await api(data);
      if(!response.ok){status('erro',response.erro||'Não foi possível salvar.');if(response.conflict){requestId=null;await load();}return;}
      revision=response.revision;requestId=null;
      status('ok','Alteração salva na agenda central. A página pública atualizará em até um minuto.');
      await load();carregar();
    }catch(error){status('erro','Sem confirmação do servidor. Tente novamente; a mesma operação não será duplicada.');}
    finally{loading=false;el('saveQuickAdjust').disabled=false;}
  });
  document.addEventListener('DOMContentLoaded',load);
})();
