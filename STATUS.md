Atualizado em: 2026-10-03

# Estado atual — rascunho

## Estável / observado
- GitHub Pages serve recepção, agenda e os seis subdomínios por cidade; DNS das unidades aponta para newdrlp.github.io.
- Extras de 2026-10-08 visíveis nos domínios reais: Limoeiro / Manhã (8h às 12h) e Carpina / Tarde (13h às 17h).
- Backend da agenda publicado na versão 53; leitura pública sem notas internas e gravação sem sessão recusada.

## Em andamento
- Card de ajuste rápido publicado em /agenda/ e acessível pela sessão de Lucas; preview verificado em produção.
- Portal: novo card “Dias de atendimento” abaixo de “Agenda”, para Lucas e Andréa, com link direto ao ajuste; card e abertura direta verificados em produção com a sessão de Lucas.
- Extras gravados pelo novo card com a sessão de Lucas; leitura pública confirmou revisão 2, dois extras e ausência de notas internas/autoria.
- Testes de turnos, autorização, atomicidade, idempotência, conflitos e privacidade passaram.
- Alternativas das landings: somente a opção mais próxima, conforme correção do usuário; geolocalização com referência explícita. Testes passaram; fontes publicadas nos seis domínios e apresentação verificada em Limoeiro e Carpina.
- Entregáveis continuam em andamento até aprovação explícita do usuário.

## Próximos passos
- Solicitar revisão do usuário sobre o card e os extras publicados.
- Marcar como aprovado/concluído somente após confirmação explícita.

## Bloqueios / dúvidas
- Nenhum bloqueio de publicação; tentativa de login no Netlify cancelada.
- Conta Andréa não foi acessada; autorização verificada pelos testes do servidor.
- Histórico JSON tem limite preventivo de 45.000 caracteres; arquivamento está descrito em docs/AGENDA_REGIONAL.md.
