const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const city of ['caruaru','gravata','palmares','jaboatao','limoeiro','carpina']) {
  for(const file of ['regras-agenda.js','agenda-publica.js']) fs.copyFileSync(path.join(root,'agenda',file),path.join(root,city,file));
}
console.log('Fontes públicas sincronizadas nas seis unidades.');
