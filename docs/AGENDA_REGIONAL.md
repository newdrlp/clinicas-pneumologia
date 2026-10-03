# Agenda regional e ajuste rápido

O painel fica em `/agenda/`; `/admin/` e `/admin.html` encaminham para ele. Entre pelo Portal com uma conta existente. O card “Dias de atendimento”, abaixo de “Agenda”, aparece para Lucas e Andréa e abre diretamente o ajuste rápido após o carregamento dos dados. O ajuste rápido usa a sessão assinada do servidor e permite somente os usuários `lucas` e `andrea`, ambos com perfil `amplo`. Não usa o nome de exibição como autorização.

## Funcionamento

- Extras, suspensões e trocas são salvos como JSON na célula A2 da aba `ajustes_agenda`, na planilha já utilizada pelo Apps Script.
- Uma troca grava suspensão e extra juntos. Cada lado tem unidade, data, turno e horário independentes.
- A observação interna aparece somente na leitura administrativa autenticada.
- A agenda pública combina recorrência, datas explícitas da aba `agenda`, ajustes ordenados e unidades ativas. Datas explícitas substituem a recorrência daquela unidade naquele dia, conforme o modelo existente de uma linha por data e clínica.
- `Dia todo` abrange manhã e tarde. Uma suspensão por horário específico remove apenas um atendimento com aquele horário exato; suspender manhã ou tarde também remove horários específicos dentro do respectivo turno.
- Um extra posterior pode reabrir um turno suspenso. Repetir a mesma tentativa de gravação não duplica a operação. Edições sobre uma revisão antiga são recusadas.
- As páginas consultam o servidor ao abrir, ao voltar para a aba e a cada minuto enquanto visíveis. WhatsApp recebe cidade, data e turno; a equipe confirma a disponibilidade.
- As sugestões incluem unidades ativas com disponibilidade, ordenadas por distância e, em empate, próxima data.

## Fontes e publicação

`agenda/regras-agenda.js` e `agenda/agenda-publica.js` são as fontes comuns. As cópias dentro das pastas por cidade permitem publicar cada pasta separadamente no GitHub Pages. Após alterar as fontes, execute `node scripts/sync-public.cjs`.

`backend/Agenda.js` e `backend/AjustesAgenda.js` são as fontes de agenda do Apps Script. Os outros módulos do backend permanecem no projeto original em `D:\temp\CLAUDE\apps-script-pre-atendimento`. A alteração foi construída sobre a versão 52 e publicada somente na implantação da recepção/agenda, como versão 53. As outras implantações não foram alteradas.

Antes de atualizar o Apps Script, faça um pull isolado da versão em produção e confira diferenças com HEAD; preserve mudanças de outros módulos. Copie somente os dois módulos de agenda, execute os testes, `clasp push` e atualize a implantação existente da agenda com `clasp deploy --deploymentId <ID existente>`. Nunca publique backups, tokens ou arquivos de diagnóstico.

As unidades são publicadas por repositórios separados `newdrlp/pneumologia-pe-<cidade>`; o GitHub Pages usa main e a raiz /. Copie os arquivos da unidade para o repositório correspondente, preservando CNAME, .nojekyll e páginas auxiliares, e faça commit/push. O painel é publicado pelo repositório `newdrlp/clinicas-pneumologia`. Um push somente no repositório principal não atualiza os seis subdomínios. Após publicar, confirme no domínio real que `agenda-publica.js` está servido e que a página mostra a data correta. O DNS no Wix já aponta para GitHub Pages; não precisa ser modificado a cada publicação.

## Testes locais

Execute `node tests/agenda.cjs` para regras e autorização com serviços simulados. Execute `node scripts/sync-public.cjs` e confira `git diff --check` antes de enviar.

Para verificar visualmente, sirva a raiz com um servidor HTTP local e abra `/limoeiro/`, `/carpina/` e `/agenda/`. O painel exige uma sessão do Portal; não invente uma sessão local para testar autenticação. Confirme o painel autenticado no domínio de produção e use os testes simulados para gravações que não devem alterar a agenda real.

## Limites operacionais

O JSON de ajustes tem limite preventivo de 45.000 caracteres para respeitar a célula da planilha. Ao atingir o limite, a gravação é recusada; registros antigos precisarão de arquivamento administrativo. Não há exclusão automática de histórico. O cadastro central pode desativar uma unidade explicitamente com `NAO`/`NÃO`; uma unidade pública ausente do cadastro não é desativada silenciosamente.

Os horários amplos seguem as faixas já exibidas pelas páginas. Horários específicos são preservados exatamente. Se a consulta ao servidor falhar, a página informa que a disponibilidade deve ser confirmada pelo WhatsApp e bloqueia o formulário que poderia confirmar uma data desatualizada.
