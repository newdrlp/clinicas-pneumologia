Atualizado em: 2026-10-03

# Estado atual — rascunho

## Estável / observado
- Site existente com páginas por cidade e módulos operacionais.
- Agenda web central acessível pela sessão de Dr Lucas.
- admin/index.html redireciona para /agenda/.

## Em andamento
- Extras de 2026-10-08 gravados pela sessão de Dr Lucas e exibidos na agenda central: Limoeiro / Manhã e Carpina / Tarde. Registro permanece em andamento até aprovação explícita do usuário.
- Revisão do ajuste rápido e integração da agenda pública.
- Arquivos de continuidade criados como rascunho, sem decisões aprovadas.

## Próximos passos
- Localizar a fonte do backend utilizado pela agenda e verificar autorização no servidor.
- Implementar extras, suspensões e trocas com datas e turnos independentes.
- Conectar leitura pública sem expor observações internas nem dados de pacientes.
- Testar regras e publicar as alterações autorizadas.

## Bloqueios / dúvidas
- Possível fonte do backend localizada em D:\temp\CLAUDE\apps-script-pre-atendimento\Agenda.js; correspondência com a implantação em produção ainda não verificada.
- Agenda operacional e páginas públicas usam endpoints distintos.
- Não está comprovado que abrir uma data na agenda operacional atualize as páginas públicas por cidade.
