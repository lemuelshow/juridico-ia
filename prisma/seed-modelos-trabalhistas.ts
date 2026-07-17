// Lote de teste (5 modelos) da lista de 23 documentos trabalhistas solicitados.
// Idempotente: pode ser rodado várias vezes (upsert por tipoCaso + replace de perguntas).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Pergunta {
  ordem: number
  secao: string
  texto: string
  tipo: 'texto_curto' | 'texto_longo' | 'data' | 'numero' | 'sim_nao' | 'opcoes'
  obrigatoria: boolean
  placeholder: string
  opcoes: string
  campoDetalhe: boolean
  detalheLabel: string
}

interface Modelo {
  tipoCaso: string
  nome: string
  descricao: string
  promptSistema: string
  perguntas: Pergunta[]
}

const FORMATACAO = `
──────────────────────────────
FORMATAÇÃO DO TEXTO (obrigatória)
──────────────────────────────
- Cada título de seção deve ficar em UMA LINHA, TODO EM MAIÚSCULAS, sem numeração decorativa extra além da exigida na estrutura.
- Trechos que transcrevem lei, súmula, OJ ou incisos (ex: "Art. 477 da CLT", "Súmula 6 do TST", "I -", "II -") devem começar a linha exatamente com esse prefixo, cada um em parágrafo próprio.
- Separe parágrafos com linha em branco entre eles.
- Use linguagem jurídica forense formal, em terceiro grau de formalidade, sem gírias.
- Sempre que usar um dado fornecido pelo cliente (nome, valores, datas, endereços, fatos narrados), mantenha o dado exatamente como informado.`

const modelos: Modelo[] = [
  // ──────────────────────────────────────────────────────────────
  // 1. RECLAMAÇÃO TRABALHISTA (MODELO COMPLETO)
  // ──────────────────────────────────────────────────────────────
  {
    tipoCaso: 'reclamacao_trabalhista_completa',
    nome: 'Reclamação Trabalhista (Modelo Completo)',
    descricao: 'Petição inicial trabalhista completa, com fundamentação detalhada por pedido e jurisprudência aplicável.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija uma PETIÇÃO INICIAL TRABALHISTA COMPLETA, tecnicamente robusta, a ser distribuída perante a Vara do Trabalho competente (art. 651 da CLT — local da prestação de serviços).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════

1. CABEÇALHO
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ___ª VARA DO TRABALHO DE [cidade/UF do reclamante ou do local de prestação de serviços]

2. QUALIFICAÇÃO E PROPOSITURA
Qualifique completamente o(a) reclamante (nome, nacionalidade, estado civil, profissão, CPF, endereço) e o(a) reclamado(a) (razão social, CNPJ, endereço), com fundamento no art. 840, §1º, da CLT, propondo RECLAMAÇÃO TRABALHISTA. Indique se o rito é o sumaríssimo (causas até 40 salários-mínimos, art. 852-A da CLT) ou ordinário, conforme o valor estimado da causa.

3. DOS FATOS
Narre de forma cronológica e objetiva o vínculo empregatício: admissão, função, jornada, remuneração, e a forma de extinção do contrato, com base nos dados fornecidos pelo cliente.

4. DO MÉRITO
Abra uma subseção numerada (4.1, 4.2, ...) para CADA pedido identificado nos dados do cliente (ex: verbas rescisórias não pagas, horas extras, diferenças salariais, dano moral, FGTS, adicional de insalubridade/periculosidade). Em cada subseção:
- Explique os fatos específicos daquele pedido;
- Transcreva o dispositivo legal aplicável da CLT (ex: art. 477, art. 71, art. 193, art. 818 c/c art. 373 do CPC quanto ao ônus da prova);
- Cite ao menos uma súmula ou orientação jurisprudencial do TST pertinente ao tema, com breve ementa;
- Conclua com o pedido específico daquele tópico.
Considere a prescrição trabalhista (art. 7º, XXIX, CF: 5 anos durante o contrato, 2 anos após a extinção) ao delimitar o período postulado.

5. DA JUSTIÇA GRATUITA
Se os dados indicarem hipossuficiência, requeira os benefícios da justiça gratuita com base no art. 790, §§3º e 4º, da CLT.

6. DOS HONORÁRIOS ADVOCATÍCIOS
Requeira honorários de sucumbência (art. 791-A da CLT), sugerindo o percentual de 15%.

7. DOS REQUERIMENTOS FINAIS
Liste, em itens numerados, todos os pedidos formulados de forma certa e determinada (art. 840, §1º, CLT), incluindo citação do reclamado, produção de provas (documental, testemunhal, pericial se aplicável), e atribua valor à causa (soma estimada dos pedidos).

8. FECHO
Local, data e "Nestes termos, pede deferimento." seguido de espaço para assinatura do(a) advogado(a).
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Empregador (Reclamado)', texto: 'Razão social (ou nome, se pessoa física) do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: Comércio de Roupas XYZ Ltda.', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Empregador (Reclamado)', texto: 'CNPJ ou CPF do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: '00.000.000/0001-00', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Empregador (Reclamado)', texto: 'Endereço completo do empregador', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Rua, número, bairro, cidade, UF, CEP', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Vínculo Empregatício', texto: 'Data de admissão', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Vínculo Empregatício', texto: 'Data de saída (ou informe se ainda está empregado)', tipo: 'texto_curto', obrigatoria: true, placeholder: 'dd/mm/aaaa ou "ainda empregado"', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Vínculo Empregatício', texto: 'Cargo/função exercida', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: Auxiliar administrativo', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Vínculo Empregatício', texto: 'Último salário (R$)', tipo: 'numero', obrigatoria: true, placeholder: 'Ex: 2200', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Vínculo Empregatício', texto: 'Tipo de rescisão', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Dispensa sem justa causa","Dispensa com justa causa","Pedido de demissão","Rescisão indireta","Término de contrato por prazo determinado","Ainda empregado"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Vínculo Empregatício', texto: 'Havia registro em carteira de trabalho (CTPS)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Explique a situação do vínculo não registrado' },
      { ordem: 10, secao: 'Vínculo Empregatício', texto: 'Jornada de trabalho contratual e horário efetivamente cumprido', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: contrato previa 44h semanais, mas cumpria de seg. a sáb. das 8h às 19h', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 11, secao: 'Verbas e Pedidos', texto: 'Quais verbas rescisórias não foram pagas ou foram pagas incorretamente?', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: saldo de salário, aviso prévio, 13º proporcional, férias + 1/3, FGTS + 40%', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 12, secao: 'Verbas e Pedidos', texto: 'Havia horas extras habituais não pagas corretamente?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Descreva a frequência e quantidade média de horas extras' },
      { ordem: 13, secao: 'Verbas e Pedidos', texto: 'Havia diferenças salariais, equiparação salarial ou acúmulo de função?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Detalhe a situação' },
      { ordem: 14, secao: 'Verbas e Pedidos', texto: 'Houve assédio moral, ambiente hostil, acidente de trabalho ou outro dano a ser indenizado?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Descreva os fatos com detalhes (datas, pessoas envolvidas, consequências)' },
      { ordem: 15, secao: 'Verbas e Pedidos', texto: 'Outros pedidos específicos (adicional de insalubridade/periculosidade, vale-transporte, seguro-desemprego, etc.)', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 16, secao: 'Provas', texto: 'Há testemunhas que podem confirmar os fatos?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Nome das testemunhas e o que cada uma pode confirmar' },
      { ordem: 17, secao: 'Provas', texto: 'Quais documentos o cliente possui?', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Ex: CTPS, holerites, cartões de ponto, print de mensagens, etc.', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2. CONTESTAÇÃO TRABALHISTA
  // ──────────────────────────────────────────────────────────────
  {
    tipoCaso: 'contestacao_trabalhista',
    nome: 'Contestação Trabalhista',
    descricao: 'Peça de defesa da reclamada em reclamação trabalhista, com preliminares e impugnação dos pedidos.',
    promptSistema: `Você é um advogado trabalhista sênior especializado em defesa de empresas (advocacia empresarial). Redija uma CONTESTAÇÃO TRABALHISTA completa, na perspectiva da parte RECLAMADA, com fundamento no art. 847 da CLT e no art. 818 da CLT c/c art. 373 do CPC (distribuição do ônus da prova).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════

1. CABEÇALHO
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA [vara informada]. Referência ao número do processo (se informado) e às partes.

2. QUALIFICAÇÃO E PROPOSITURA
Identifique a reclamada (razão social, CNPJ, endereço) e informe que, tempestivamente, apresenta CONTESTAÇÃO à reclamação trabalhista ajuizada por [nome do reclamante], pelos fatos e fundamentos a seguir.

3. PRELIMINARES (se aplicável conforme os dados)
Se os dados indicarem teses preliminares (prescrição, inépcia da inicial, ilegitimidade de parte, incompetência), desenvolva cada uma em subseção própria, com a fundamentação legal (ex: art. 7º, XXIX, CF para prescrição).

4. DA IMPUGNAÇÃO AOS FATOS NARRADOS
Reconstrua, com base na versão da empresa fornecida nos dados, a real dinâmica do vínculo (jornada, funções, motivo da rescisão), contrapondo especificamente à narrativa do reclamante.

5. DO MÉRITO — IMPUGNAÇÃO ESPECÍFICA A CADA PEDIDO
Para cada pedido a ser impugnado (identificado nos dados), abra subseção numerada com: (i) o pedido e seu resumo; (ii) a tese de defesa (quitação, ausência de prova, exercício regular do poder diretivo, etc.); (iii) fundamento legal e, quando pertinente, jurisprudência ou súmula do TST favorável à defesa.

6. DAS PROVAS
Requeira a produção de todas as provas em direito admitidas, especialmente documental já anexada, testemunhal e, se for o caso, pericial.

7. DOS REQUERIMENTOS FINAIS
Requeira a total improcedência dos pedidos (ou improcedência dos pedidos impugnados), condenação do reclamante em honorários sucumbenciais (art. 791-A, §3º, CLT) e demais requerimentos de estilo.

8. FECHO
Local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo (CNJ)', tipo: 'texto_curto', obrigatoria: false, placeholder: '0000000-00.0000.5.00.0000', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Vara do Trabalho / Tribunal', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: 3ª Vara do Trabalho de São Paulo', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Nome completo do reclamante', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Dados do Processo', texto: 'Data da audiência ou prazo final para contestar', tipo: 'data', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Pedidos do Reclamante', texto: 'Resumo dos pedidos formulados na reclamação trabalhista', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Cole ou resuma os pedidos da petição inicial recebida', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Versão da Empresa', texto: 'A empresa reconhece o vínculo empregatício e o período informado pelo reclamante?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Se não reconhece ou diverge, explique a divergência' },
      { ordem: 7, secao: 'Versão da Empresa', texto: 'Qual a versão da empresa sobre a jornada de trabalho efetivamente cumprida?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Versão da Empresa', texto: 'A empresa possui controle de ponto/cartões de ponto do período?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Versão da Empresa', texto: 'Há prova documental da quitação das verbas questionadas (recibos, TRCT, extratos de FGTS)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Quais documentos comprovam o pagamento' },
      { ordem: 10, secao: 'Versão da Empresa', texto: 'Há justa causa ou outra excludente de responsabilidade a ser alegada?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Descreva os fatos e as provas da justa causa/excludente' },
      { ordem: 11, secao: 'Preliminares e Provas', texto: 'Há preliminares processuais a arguir (prescrição, inépcia da inicial, ilegitimidade de parte, incompetência)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Especifique quais preliminares e por quê' },
      { ordem: 12, secao: 'Preliminares e Provas', texto: 'Testemunhas da empresa e o que podem confirmar', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 13, secao: 'Preliminares e Provas', texto: 'Outros argumentos de defesa relevantes', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3. RECURSO ORDINÁRIO TRABALHISTA
  // ──────────────────────────────────────────────────────────────
  {
    tipoCaso: 'recurso_ordinario_trabalhista',
    nome: 'Recurso Ordinário Trabalhista',
    descricao: 'Recurso contra sentença de primeiro grau, dirigido ao Tribunal Regional do Trabalho, com prazo de 8 dias (art. 895, I, CLT).',
    promptSistema: `Você é um advogado trabalhista sênior. Redija um RECURSO ORDINÁRIO completo, com fundamento no art. 895, I, da CLT (prazo de 8 dias contados da publicação da sentença), a ser dirigido ao Tribunal Regional do Trabalho competente.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════

1. CABEÇALHO
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA [vara de origem] (o recurso é interposto perante o juízo a quo, para remessa ao TRT).

2. QUALIFICAÇÃO E PROPOSITURA
Identifique a parte recorrente e a parte recorrida, informe o número do processo, e declare que vem interpor RECURSO ORDINÁRIO em face da sentença proferida, requerendo seu regular processamento e remessa ao Egrégio Tribunal Regional do Trabalho.

3. DO CABIMENTO E DA TEMPESTIVIDADE
Demonstre a tempestividade (data da publicação/ciência da sentença + 8 dias úteis) e, se aplicável, o recolhimento de custas processuais e depósito recursal (art. 899, §1º, CLT).

4. DA SÍNTESE DA DEMANDA E DA SENTENÇA RECORRIDA
Resuma brevemente o pedido original e o que foi decidido em cada capítulo da sentença.

5. DAS RAZÕES RECURSAIS
Abra uma subseção numerada (5.1, 5.2, ...) para CADA ponto da sentença a ser reformado, conforme os dados fornecidos. Em cada subseção: (i) transcreva ou resuma o trecho decisório impugnado; (ii) demonstre o error in judicando ou error in procedendo; (iii) fundamente com dispositivos legais e jurisprudência do TST/TRT favorável à reforma pretendida.

6. DO PEDIDO DE REFORMA
Consolide o pedido de reforma total ou parcial da sentença (ou de sua anulação, se for o caso), especificando o resultado prático pretendido em cada capítulo impugnado.

7. DOS REQUERIMENTOS FINAIS
Requeira o conhecimento e provimento do recurso, com a consequente reforma da sentença nos termos requeridos, e a condenação da parte contrária em custas e honorários recursais, se cabível.

8. FECHO
Local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo (CNJ)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Vara do Trabalho de origem', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Data da publicação/ciência da sentença', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Dados do Processo', texto: 'Quem está recorrendo?', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Reclamante","Reclamada","Ambas as partes (recursos independentes)"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Dados do Processo', texto: 'Custas e depósito recursal já foram recolhidos?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Informe valores e datas dos comprovantes' },
      { ordem: 6, secao: 'A Sentença Recorrida', texto: 'Resumo do que foi pedido na ação originalmente', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'A Sentença Recorrida', texto: 'Resumo do que foi decidido na sentença (procedente/improcedente e em quais pontos)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Razões Recursais', texto: 'Quais pontos específicos da sentença devem ser reformados?', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Liste cada capítulo da sentença que será impugnado', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Razões Recursais', texto: 'Fundamentos jurídicos e fáticos para a reforma de cada ponto impugnado', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 10, secao: 'Pedido', texto: 'Tipo de pedido recursal', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Reforma total da sentença","Reforma parcial da sentença","Anulação da sentença (nulidade processual)"]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 4. CONTRATO DE TRABALHO (CLT)
  // ──────────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrato_trabalho_geral',
    nome: 'Contrato de Trabalho (CLT)',
    descricao: 'Contrato individual de trabalho por prazo indeterminado, determinado ou de experiência, nos moldes da CLT.',
    promptSistema: `Você é um advogado trabalhista especializado em elaboração de contratos para departamentos de RH e escritórios de advocacia empresarial. Redija um CONTRATO INDIVIDUAL DE TRABALHO completo, em conformidade com a CLT, com base nos dados fornecidos. Este é um INSTRUMENTO CONTRATUAL BILATERAL, não uma petição — não use vocativos a juízo nem estrutura de peça processual.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════

1. TÍTULO E PREÂMBULO
CONTRATO INDIVIDUAL DE TRABALHO
Identifique as partes: EMPREGADOR (razão social/nome, CNPJ/CPF, endereço) e EMPREGADO(A) (nome, CPF, CTPS/PIS se informado, endereço), qualificando-as como partes contratantes, regidas pela Consolidação das Leis do Trabalho (CLT) e demais normas aplicáveis.

2. CLÁUSULA PRIMEIRA – DO OBJETO E DA FUNÇÃO
Descreva o cargo/função contratada e as atribuições principais.

3. CLÁUSULA SEGUNDA – DO PRAZO
Especifique se o contrato é por prazo indeterminado, determinado (com termo final e fundamento no art. 443, §1º e §2º, CLT) ou de experiência (máximo 90 dias, art. 445, parágrafo único, CLT, admitida uma única prorrogação dentro desse limite).

4. CLÁUSULA TERCEIRA – DA JORNADA DE TRABALHO
Detalhe a jornada, horário e dias de trabalho, intervalos intrajornada (art. 71, CLT) e eventual regime de compensação, conforme os dados informados.

5. CLÁUSULA QUARTA – DA REMUNERAÇÃO
Informe o salário, periodicidade de pagamento e forma (depósito, PIX, etc.).

6. CLÁUSULA QUINTA – DO LOCAL DE TRABALHO
Informe o local de prestação de serviços e se há possibilidade de transferência.

7. CLÁUSULA SEXTA – DOS BENEFÍCIOS
Liste os benefícios concedidos (vale-transporte — obrigatório conforme Lei 7.418/85, salvo renúncia expressa —, vale-refeição/alimentação, plano de saúde, etc.), conforme informado.

8. CLÁUSULAS ESPECIAIS (se houver dados sobre isso)
Inclua cláusulas de confidencialidade, não concorrência, exclusividade ou propriedade intelectual, se aplicável ao caso.

9. CLÁUSULA DE DISPOSIÇÕES GERAIS
Mencione a submissão às normas da CLT, acordos/convenções coletivas da categoria, e ao regulamento interno da empresa.

10. FECHO
Local e data, seguido de espaço para assinatura do EMPREGADOR, do(a) EMPREGADO(A) e de duas testemunhas.
${FORMATACAO}
Observação: como é um contrato (não uma petição), NÃO inclua cabeçalho de juízo, "dos fatos", "do mérito" ou pedidos processuais.`,
    perguntas: [
      { ordem: 1, secao: 'Empregador', texto: 'Razão social ou nome do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Empregador', texto: 'CNPJ ou CPF do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Empregador', texto: 'Endereço do empregador', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Empregado', texto: 'Nome completo do(a) empregado(a) a ser contratado(a)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Empregado', texto: 'CPF do(a) empregado(a)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Empregado', texto: 'Endereço do(a) empregado(a)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Condições do Contrato', texto: 'Cargo/função', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Condições do Contrato', texto: 'Data de início', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Condições do Contrato', texto: 'Tipo de contrato', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Prazo indeterminado","Prazo determinado","Contrato de experiência (até 90 dias)"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 10, secao: 'Condições do Contrato', texto: 'Se prazo determinado ou experiência, qual a duração?', tipo: 'texto_curto', obrigatoria: false, placeholder: 'Ex: 45 dias, prorrogável por mais 45', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 11, secao: 'Condições do Contrato', texto: 'Salário (R$)', tipo: 'numero', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 12, secao: 'Condições do Contrato', texto: 'Jornada de trabalho (horário e dias da semana)', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: seg. a sex., das 9h às 18h, com 1h de intervalo', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 13, secao: 'Condições do Contrato', texto: 'Local de trabalho', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 14, secao: 'Benefícios e Cláusulas Especiais', texto: 'Benefícios oferecidos', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Ex: vale-transporte, vale-refeição de R$30/dia, plano de saúde', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 15, secao: 'Benefícios e Cláusulas Especiais', texto: 'Cláusulas especiais desejadas (confidencialidade, não concorrência, exclusividade)', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 5. CARTA DE ADVERTÊNCIA DISCIPLINAR
  // ──────────────────────────────────────────────────────────────
  {
    tipoCaso: 'carta_advertencia_disciplinar',
    nome: 'Carta de Advertência Disciplinar',
    descricao: 'Advertência escrita ao colaborador, com descrição da conduta e fundamento no poder disciplinar do empregador.',
    promptSistema: `Você é um advogado trabalhista especializado em relações de trabalho e departamento pessoal. Redija uma CARTA DE ADVERTÊNCIA DISCIPLINAR curta, formal e juridicamente segura, com base no poder diretivo e disciplinar do empregador (art. 2º da CLT), para ser entregue ao colaborador e arquivada no dossiê funcional.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════

1. CABEÇALHO
CARTA DE ADVERTÊNCIA DISCIPLINAR Nº [deixe um espaço para numeração manual]
Identifique a empresa (remetente) e o colaborador (destinatário: nome completo e cargo), e a data de emissão.

2. DO FATO
Descreva de forma objetiva, factual e sem juízo de valor ofensivo, a conduta ou infração praticada pelo colaborador, com data e local do ocorrido, com base nos dados fornecidos.

3. DO FUNDAMENTO
Cite a norma interna, cláusula do contrato de trabalho, do regulamento da empresa, ou o dispositivo da CLT (ex: art. 482, quando aplicável a gravidade) violado pela conduta. Mencione, se for o caso, advertência anterior pelo mesmo motivo, situando esta no contexto do princípio da gradação das penalidades (advertência → suspensão → dispensa por justa causa), reconhecido pela jurisprudência trabalhista como requisito de proporcionalidade da punição.

4. DA ADVERTÊNCIA
Declare formalmente que o colaborador fica advertido pela conduta descrita, e que a reincidência poderá ensejar penalidades mais graves, incluindo suspensão disciplinar ou dispensa por justa causa (art. 482 da CLT), conforme a gravidade.

5. DA CIÊNCIA
Inclua campo para "Declaro estar ciente do teor desta advertência, o que não implica concordância com seu conteúdo" com espaço para assinatura do colaborador, data, e, se a via for de recusa de assinatura, espaço para assinatura de duas testemunhas.

6. FECHO
Local, data, e espaço para assinatura do representante da empresa (ex: gestor direto ou RH).
${FORMATACAO}
Observação: este é um documento curto (não é uma petição). Seja direto e evite redundância — o texto completo deve ficar entre 1 e 2 páginas.`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Colaborador', texto: 'Nome completo do colaborador advertido', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Colaborador', texto: 'Cargo/função do colaborador', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Colaborador', texto: 'Data do fato/ocorrência', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Motivo da Advertência', texto: 'Descrição detalhada da conduta/infração cometida', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Descreva o que aconteceu, onde, e quem presenciou', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Motivo da Advertência', texto: 'Norma interna, cláusula contratual ou dispositivo violado', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Ex: item 4.2 do regulamento interno sobre pontualidade', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Motivo da Advertência', texto: 'Já houve advertência anterior pelo mesmo motivo ou motivo semelhante?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Informe a data e o teor da advertência anterior' },
      { ordem: 7, secao: 'Motivo da Advertência', texto: 'Forma da advertência', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Escrita (formalização direta)","Verbal a ser formalizada por escrito nesta carta"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Motivo da Advertência', texto: 'Consequência a ser mencionada em caso de reincidência', tipo: 'texto_curto', obrigatoria: false, placeholder: 'Ex: suspensão disciplinar, dispensa por justa causa', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },
]

async function main() {
  for (const m of modelos) {
    await prisma.contextoPeticao.upsert({
      where: { tipoCaso: m.tipoCaso },
      update: { nome: m.nome, promptSistema: m.promptSistema, ativo: true },
      create: { nome: m.nome, tipoCaso: m.tipoCaso, promptSistema: m.promptSistema, ativo: true },
    })

    const template = await prisma.formularioTemplate.upsert({
      where: { tipoCaso: m.tipoCaso },
      update: { nome: m.nome, descricao: m.descricao, ativo: true },
      create: { nome: m.nome, tipoCaso: m.tipoCaso, descricao: m.descricao, ativo: true },
    })

    await prisma.perguntaFormulario.deleteMany({ where: { templateId: template.id } })
    await prisma.perguntaFormulario.createMany({
      data: m.perguntas.map(p => ({ ...p, templateId: template.id })),
    })

    console.log(`✔ ${m.nome} (${m.tipoCaso}) — ${m.perguntas.length} perguntas`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
