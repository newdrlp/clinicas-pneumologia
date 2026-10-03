# Publicação das unidades — registro técnico

Data verificada: 2026-10-03.

## Origem e critérios
Correção direta do usuário: não usa mais Netlify; utiliza GitHub e conta Wix. Verificação por nomes/metadados dos repositórios públicos, CNAME das unidades, cabeçalho HTTP GitHub.com, DNS dos domínios e arquivos README/MIGRACAO_GITHUB_PAGES.md. Conteúdo comparado apenas depois de confirmar a relação por cidade/domínio.

## Conjunto relacionado
- Recepção/agenda: https://github.com/newdrlp/clinicas-pneumologia — CNAME recepcao.pneumologia-pe.com.br.
- caruaru: https://github.com/newdrlp/pneumologia-pe-caruaru — https://caruaru.pneumologia-pe.com.br.
- gravata: https://github.com/newdrlp/pneumologia-pe-gravata — https://gravata.pneumologia-pe.com.br.
- palmares: https://github.com/newdrlp/pneumologia-pe-palmares — https://palmares.pneumologia-pe.com.br.
- jaboatao: https://github.com/newdrlp/pneumologia-pe-jaboatao — https://jaboatao.pneumologia-pe.com.br.
- limoeiro: https://github.com/newdrlp/pneumologia-pe-limoeiro — https://limoeiro.pneumologia-pe.com.br.
- carpina: https://github.com/newdrlp/pneumologia-pe-carpina — https://carpina.pneumologia-pe.com.br.

Cada unidade usa GitHub Pages, main, raiz /. Arquivos de migração documentam DNS no Wix, CNAME newdrlp.github.io. Não foi necessária alteração de DNS ou armazenamento Wix.

## Resultado técnico
A versão atual das landings contém ajustes posteriores à cópia inicial do repositório principal, como rastreamento de conversões e fluxo de espirometria. Foram aplicados apenas os cálculos de agenda e os dois scripts públicos sobre cada versão atual. Essas landings foram reconciliadas de volta para as pastas por cidade da fonte principal para evitar regressões nas próximas publicações. A autorização solicitada pelo Netlify foi cancelada.

A integração foi enviada aos seis repositórios de unidade e confirmada por HTTP 200 e referência a agenda-publica.js em cada domínio. Limoeiro e Carpina tiveram leitura visual adicional de 2026-10-08 e turnos corretos. Este é um registro técnico de correlação/publicação; não é entrada de decisão nem aprovação de entregável.
