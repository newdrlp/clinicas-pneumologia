Atualizado em: 2026-10-03

# Estado atual — rascunho

## Estável / observado
- Site existente com páginas por cidade e módulos operacionais.
- Agenda web central acessível pela sessão de Dr Lucas.
- admin/index.html redireciona para /agenda/.

## Em andamento
- Extras de 2026-10-08 gravados pela sessão de Dr Lucas e exibidos na agenda central: Limoeiro / Manhã e Carpina / Tarde. Registro permanece em andamento até aprovação explícita do usuário.
- Card de ajuste rápido e integração pública implementados; testes locais de regras, autorização, atomicidade e privacidade passaram.
- Backend publicado na implantação existente da agenda, versão 53.
- Correção pública do extra do dia 8 enviada a main (1fa3fbc); confirmação de publicação no Netlify ainda pendente.
- Arquivos de continuidade criados como rascunho, sem decisões aprovadas.

## Próximos passos
- Verificar no domínio real a publicação do dia 8 e dos novos scripts.
- Conferir o card com sessão de Lucas ou Andréa em produção.
- Manter acompanhamento da integração pública e registrar aprovação somente após confirmação do usuário.
- Testar regras e publicar as alterações autorizadas.

## Bloqueios / dúvidas
- Fonte do backend confirmada por pull da versão 52; módulos de agenda também preservados em backend/.
- Formulário antigo de interesse mantém seu endpoint; nova leitura pública usa o endpoint central da agenda.
- Subdomínios ainda servem HTML anterior após push. Login do Netlify solicita nova autorização de e-mails do GitHub, aguardando confirmação do usuário.
