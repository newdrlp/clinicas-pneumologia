(function(root) {
  'use strict';
  function numero(valor, minimo, maximo, rotulo) {
    var s = String(valor == null ? '' : valor).trim();
    if (!s) return '';
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(s)) throw new Error('Confira '+rotulo+': use apenas números, com vírgula ou ponto.');
    var n = Number(s.replace(',', '.'));
    if (!Number.isFinite(n) || n < minimo || n > maximo) throw new Error('Confira '+rotulo+' e a unidade informada.');
    return n;
  }
  function campo(id) {return document.getElementById(id);}
  function nome(s) {return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
  function dn(s) {s=String(s||'');if(/^\d{4}-\d{2}-\d{2}$/.test(s))s=s.slice(8,10)+s.slice(5,7)+s.slice(0,4);return s.replace(/\D/g,'');}
  var api = {
    numero:numero,
    ler:function() {
      var tab=campo('f-tabagismo-mir').value;
      if(tab && ['Não-fumante','Fumante','Ex-fumante'].indexOf(tab)<0)throw new Error('Confira o tabagismo.');
      return {peso_kg:numero(campo('f-peso').value,.3,400,'o peso em kg'),
              altura_cm:numero(campo('f-altura').value,30,250,'a altura em cm'),tabagismo_mir:tab};
    },
    limpar:function() {['f-peso','f-altura','f-tabagismo-mir'].forEach(function(id){if(campo(id)) campo(id).value='';});},
    preencher:function(d) {
      if(nome(d.nome)!==nome(campo('f-nome').value) || dn(d.data_nasc)!==dn(campo('f-dn').value))return;
      [['f-peso','peso_kg'],['f-altura','altura_cm'],['f-tabagismo-mir','tabagismo_mir']].forEach(function(par){
        var el=campo(par[0]);
        if(el && !el.value && d[par[1]]!=null) el.value=String(d[par[1]]).replace('.',',');
      });
    }
  };
  root.RecepcaoMedidas=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})(typeof window==='undefined'?globalThis:window);
