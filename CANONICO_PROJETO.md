# Projeto — Pneumologia PE

Projeto é o conjunto identificável de sessões, registros, documentos e decisões relacionados a um mesmo objetivo operacional, com continuidade temática, funcional ou temporal suficiente para justificar tratamento contextual unificado.

Estado deste documento: rascunho para revisão do usuário.

## Objetivo e escopo
Manter o atendimento regional de Pneumologia PE e evoluir o pré-agendamento público para escolha de unidade por proximidade e próxima disponibilidade. Implementar ajuste rápido para extras, suspensões e trocas entre unidades, com dados centrais e atualização pública sem novo deploy.

## Público-alvo
Pacientes das unidades regionais de Pernambuco e equipe operacional. O novo ajuste rápido deve restringir edição a Lucas e Andréa por autorização no servidor.

## Arquitetura observada
- HTML, CSS e JavaScript estáticos; páginas por cidade e módulos portal, agenda, recepção e sala.
- admin/index.html redireciona para agenda/index.html.
- Agenda operacional usa Google Apps Script, com ações agenda_listar e agenda_salvar e armazenamento em planilha conforme comentário do projeto.
- Portal usa token assinado validado no servidor. Novo ajuste exige usuário lucas ou andrea com perfil amplo.
- Páginas por cidade têm leitura central em JSON e regras compartilhadas para recorrência, datas explícitas e exceções. Ajustes são JSON na planilha existente; notas internas não entram na leitura pública. Publicação do frontend ainda em verificação.
- Detalhes operacionais e testes: docs/AGENDA_REGIONAL.md.
- Repositório: https://github.com/newdrlp/clinicas-pneumologia.git, branch main.
- Netlify informado pelo usuário; configuração e vínculo de publicação ainda não verificados.

## Convenções
Preservar estrutura e comportamento existentes; mudanças incrementais. Commits convencionais. STATUS.md contém apenas estado atual. DECISOES.md é append-only e exige confirmação explícita para cada entrada. REGISTRO_PROJETO.json mantém o schema solicitado. Arquivos de ferramenta devem apenas apontar para este documento.

## Restrições
Backend simples, agenda central, sem senha hardcoded. Não expor notas internas ou dados de pacientes na leitura pública. Evitar localStorage como armazenamento final da agenda. Não marcar entregáveis aprovados ou concluídos sem confirmação do usuário. Verificar a data do sistema antes de registrar.
