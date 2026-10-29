# Medidas e tabagismo da recepção

Atualizado em: 2026-10-29. Publicado para conferência operacional; entregável em andamento.

## Uso

Em Dados clínicos, a recepção pode preencher Peso (kg), Altura (cm) e Tabagismo.
Tabagismo oferece Não informado, Nunca fumou, Fumante e Ex-fumante. Todos são opcionais;
a ausência não bloqueia a chegada nem a preparação do MIR. Peso/altura aceitam vírgula
ou ponto decimal. Altura é em centímetros, por exemplo 170; não usar 1,70.

O fluxo continua pela integração existente: recepção → planilha → Prontuário,
Recepção → Painel do Dia → abrir paciente → Identificação → PR MIR. O painel mantém
seu layout; os valores aparecem na Identificação. A atualização não exige nova consulta
para mudar uma medida pendente. No retorno, sem nova medida, permanecem as últimas
medidas disponíveis, conservando suas datas. Dados clínicos privados enviados pelo
paciente continuam ocultos para a recepcionista conforme o perfil.

Depois da atualização, usar Ctrl+F5 na recepção e salvar/reabrir o prontuário.
O aplicativo aberto continua usando os módulos antigos até ser reaberto.

## Transporte e compatibilidade

O formulário ativo é index.html; recepcao/index.html é um alias legado também atualizado.
Ambos usam medidas-recepcao.js. Payload aditivo: peso_kg, altura_cm e tabagismo_mir.
O valor técnico de Nunca fumou é Não-fumante, compatível com o PR MIR.

No servidor, somente Recepcao.js e o novo MedidasRecepcao.js mudam. A versão 54
substitui a 53 no mesmo deployment de recepção/agenda. Os demais módulos, URLs,
deployments e planilhas de pré-atendimento permanecem preservados.

As 24 colunas-base da recepção conservam posições. No próximo envio com um dos novos
valores, o servidor acrescenta por cabeçalho, depois de todas as colunas existentes:
Peso (kg), Peso medido em, Altura (cm), Altura medida em, Tabagismo MIR e
Tabagismo MIR atualizado em. Colunas desconhecidas são preservadas. Datas ISO são
independentes por campo; só mudam quando muda o valor, sem redatar medidas antigas.
Ausência no payload não apaga valor já salvo. A busca autenticada traz esses campos
somente para o atendimento do dia e com a mesma identidade; não reaproveita dados
clínicos históricos em outra pessoa nem revela os campos a busca sem sessão.

No desktop, a migração aditiva inclui seis colunas TEXT em recepcao_pendentes.
As medidas entram no histórico existente patient_weights; tabagismo entra no JSON
privado mir_preparo do paciente, com data/origem. Nenhuma nova tabela de pacientes.
Nome normalizado e DN precisam coincidir; timestamps válidos são obrigatórios para
importar. Datas UTC são convertidas para o dia da clínica, UTC-3. Repetições são
idempotentes; revisões antigas são ignoradas. Medidas manuais do mesmo dia e
classificação manual de tabagismo do mesmo dia ou mais recente têm prioridade.
Campos que o médico está editando não são sobrescritos pela atualização da tela.

Arquivos desktop: importador_recepcao.py, recepcao_integracao.py, recepcao_medidas.py,
mir_ui.py, autoverificacao.py, prontuario.py (somente schema/retenção dos pendentes)
e testes_recepcao_medidas.py. A migração e o contrato de schema da autoverificação
foram atualizados juntos. PR MIR conserva o padrão Outro ou Misto e INICIAR manual.

## Verificação

Testes sintéticos da cadeia servidor → matriz Google → importador → Identificação →
payload PR MIR passaram (11 novos testes). Regressões: recepção18, painel23, MIR32,
fumaça26, parser74 e CD31; um caso legado do corpus do parser permanece pulado.
Também passaram testes Node de servidor/formulários e agenda. Fontes instalados
conferidos por hash; versão publicada recuperada para comparação. Não foram enviados
pacientes de teste para a planilha real. A conferência visual usa prévia local com
valores fictícios; a conferência operacional autenticada depende do uso cotidiano.

## Reversão

Frontend: reverter o commit desta extensão. Servidor: retornar o mesmo deployment
à versão 53. Desktop: restaurar os backups .bak_20261029_181423_medidas_recepcao,
com o app fechado. Não apagar colunas adicionais nem restaurar banco por cima de
atendimentos posteriores: elas são compatíveis com o código anterior. Backup SQLite
consistente anterior à instalação foi guardado localmente para recuperação orientada.

Fontes locais do Apps Script podem conter módulos anteriores ao HEAD remoto. Para
futuro deploy, fazer pull em diretório isolado e aplicar apenas o diff necessário;
nunca enviar toda a pasta local antiga. Nenhum token ou credencial integra este repo.

Registro técnico principal P-003 nos quadros de avisos dos dois projetos. Sem
decisão formal nova nem marca de aprovado/concluído antes da confirmação de Lucas.
