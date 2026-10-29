const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const api=require(path.join(root,'medidas-recepcao.js'));
assert.equal(api.numero('',.3,400,'peso'),'');assert.equal(api.numero('68,5',.3,400,'peso'),68.5);assert.throws(()=>api.numero('1,70',30,250,'altura'));
for(const n of ['index.html','recepcao/index.html']){
 let html=fs.readFileSync(path.join(root,n),'utf8');let inline=Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g),m=>m[1]);inline.forEach((s,i)=>new vm.Script(s,{filename:n+':'+i}));
 for(const id of ['f-peso','f-altura'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert(html.includes('RecepcaoMedidas.ler()'));assert(html.includes('RecepcaoMedidas.limpar()'));assert(html.includes('RecepcaoMedidas.preencher(d)'));
 const els={};for(const m of html.matchAll(/id="([^"]+)"/g))els[m[1]]={value:'',style:{},dataset:{},placeholder:'',classList:{add(){},remove(){}},addEventListener(){},options:[],selectedIndex:0};
 const front={console,URLSearchParams,location:{search:''},document:{getElementById(id){return els[id]||null;},addEventListener(){}},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},scrollTo(){}};
 front.window=front;vm.createContext(front);vm.runInContext(fs.readFileSync(path.join(root,'medidas-recepcao.js'),'utf8'),front);inline.forEach(s=>vm.runInContext(s,front));
 let capturado=null;front.fetchJsonComTimeout=p=>{capturado=p;return Promise.resolve({json(){return Promise.resolve({ok:false,erro:'Teste sem envio'});}});};
 for(const [id,v] of Object.entries({'f-nome':'Paciente Sintetico','f-dn':'02/03/2000','f-clinica':'Teste','f-pagamento':'Pix','f-peso':'68,5','f-altura':'170','f-tabagismo-mir':'Ex-fumante'}))els[id].value=v;
 front.estado.nomeExibicao='Teste';front.enviarRecepcao();assert.equal(capturado.peso_kg,68.5);assert.equal(capturado.altura_cm,170);assert.equal(capturado.tabagismo_mir,'Ex-fumante');
 els['f-peso'].value='';els['f-altura'].value='';front.enviarRecepcao();assert.equal(capturado.peso_kg,'');assert.equal(capturado.altura_cm,'');
 front.RecepcaoMedidas.preencher({nome:'Outro Paciente',data_nasc:'02/03/2000',peso_kg:90});assert.equal(els['f-peso'].value,'');
 front.RecepcaoMedidas.preencher({nome:'Paciente Sintetico',data_nasc:'02/03/2000',peso_kg:68});assert.equal(els['f-peso'].value,'68');
 front.resetBusca();assert.equal(els['f-peso'].value,'');assert.equal(els['f-tabagismo-mir'].value,'');
}
console.log('OK: medidas e tabagismo opcionais, unidades, contrato dos dois formulários, payload e limpeza entre pacientes.');
