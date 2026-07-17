// Segundo lote (18 modelos restantes) da lista de 23 documentos trabalhistas solicitados.
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
  // ────────────────────────────────────────────────────────
  // 1. AGRAVO DE INSTRUMENTO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'agravo_instrumento_trabalhista',
    nome: 'Agravo de Instrumento Trabalhista',
    descricao: 'Recurso para destrancar recurso (ordinário ou de revista) que teve seguimento denegado, com fundamento no art. 897, "b", da CLT.',
    promptSistema: `Você é um advogado trabalhista sênior de banca empresarial. Redija um AGRAVO DE INSTRUMENTO trabalhista completo, com fundamento no art. 897, "b", da CLT, cujo objetivo é destrancar um recurso (Ordinário ou de Revista) ao qual foi denegado seguimento por despacho/decisão do juízo ou tribunal a quo. Prazo de interposição: 8 dias, contados da intimação da decisão denegatória.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo/tribunal prolator da decisão denegatória, que processará o agravo para posterior remessa ao tribunal competente para julgamento.
2. QUALIFICAÇÃO E PROPOSITURA — identifique agravante e agravado, o processo de origem, e declare a interposição do AGRAVO DE INSTRUMENTO em face da decisão que denegou seguimento ao recurso.
3. DO CABIMENTO E DA TEMPESTIVIDADE — demonstre que o recurso anterior foi indevidamente trancado e que o prazo de 8 dias foi observado.
4. DAS PEÇAS OBRIGATÓRIAS TRASLADADAS — liste as peças que instruem o agravo (art. 897, §5º, CLT): cópia da decisão agravada, certidão de publicação/intimação, procuração das partes, e a petição do recurso denegado.
5. DA DEMONSTRAÇÃO DO DESACERTO DA DECISÃO DENEGATÓRIA — desenvolva, com fundamentação jurídica detalhada, por que o despacho/decisão que denegou seguimento ao recurso está equivocado, rebatendo especificamente cada fundamento usado para a denegação.
6. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e provimento do agravo, com a consequente reforma da decisão denegatória, determinando-se o regular processamento do recurso trancado, com seu imediato ou posterior julgamento.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Qual recurso teve seguimento denegado?', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Recurso Ordinário","Recurso de Revista","Recurso de Embargos"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Data da intimação da decisão que denegou o recurso', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'A Decisão Denegatória', texto: 'Qual foi o fundamento usado para negar seguimento ao recurso?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'A Decisão Denegatória', texto: 'Por que esse fundamento está equivocado? Explique os argumentos', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Peças e Instrução', texto: 'As peças obrigatórias (decisão agravada, certidão de intimação, procurações, petição do recurso denegado) já estão disponíveis para juntada?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Informe quais faltam ou observações relevantes' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 2. MANDADO DE SEGURANÇA TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'mandado_seguranca_trabalhista',
    nome: 'Mandado de Segurança Trabalhista',
    descricao: 'Ação constitucional contra ato ilegal ou abusivo de autoridade judicial, quando não há recurso próprio com efeito suspensivo capaz de evitar o dano.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija um MANDADO DE SEGURANÇA trabalhista completo, com fundamento no art. 5º, LXIX, da CF e na Lei nº 12.016/2009, dirigido ao Tribunal Regional do Trabalho competente, contra ato de autoridade judicial (juiz de primeiro grau) apontado como ilegal ou praticado com abuso de poder, para o qual não há recurso próprio capaz de evitar o dano com a mesma eficácia.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao Egrégio Tribunal Regional do Trabalho (Desembargador(a) Relator(a) por distribuição).
2. QUALIFICAÇÃO E PROPOSITURA — qualifique o(a) impetrante, identifique a autoridade coatora (juiz(a) e vara de origem) e, se houver, o litisconsorte passivo necessário (parte beneficiada pelo ato impugnado). Declare a impetração de MANDADO DE SEGURANÇA com pedido de liminar, se cabível.
3. DOS FATOS — narre o ato judicial impugnado, a data da ciência/intimação, e o contexto processual.
4. DO CABIMENTO — demonstre a inexistência de recurso próprio com efeito suspensivo capaz de evitar o dano com a mesma eficácia da via mandamental, e a observância do prazo decadencial de 120 dias (art. 23, Lei 12.016/2009).
5. DO DIREITO LÍQUIDO E CERTO — fundamente, com base na prova pré-constituída (documental), a ilegalidade ou o abuso de poder praticado, indicando os dispositivos legais e constitucionais violados.
6. DA LIMINAR (se aplicável) — demonstre a plausibilidade do direito (fumus boni iuris) e o risco de dano de difícil reparação (periculum in mora) a justificar a concessão de medida liminar para suspender os efeitos do ato coator até o julgamento final.
7. DOS REQUERIMENTOS FINAIS — requeira a notificação da autoridade coatora, a ciência ao litisconsorte se houver, a oitiva do Ministério Público do Trabalho, e a concessão definitiva da segurança para anular/suspender o ato impugnado.
8. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo de origem', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Juiz(a) e Vara do Trabalho responsável pelo ato (autoridade coatora)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'O Ato Impugnado', texto: 'Descreva o ato/decisão judicial que está sendo impugnado', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'O Ato Impugnado', texto: 'Data em que teve ciência/foi intimado do ato', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'O Ato Impugnado', texto: 'Existe recurso próprio cabível contra esse ato que teria efeito suspensivo?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Explique por que o recurso próprio não seria capaz de evitar o dano com a mesma eficácia' },
      { ordem: 6, secao: 'O Direito Violado', texto: 'Qual o direito líquido e certo violado e por quê o ato é ilegal ou abusivo?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'O Direito Violado', texto: 'Provas documentais disponíveis para comprovar o alegado', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Urgência', texto: 'Há urgência que justifique pedido de liminar?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Descreva o risco de dano caso não haja decisão imediata' },
      { ordem: 9, secao: 'Urgência', texto: 'Há terceiro que se beneficia do ato e deve ser incluído como litisconsorte?', tipo: 'sim_nao', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Identifique o terceiro' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 3. ACORDO EXTRAJUDICIAL TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'acordo_extrajudicial_trabalhista',
    nome: 'Acordo Extrajudicial Trabalhista',
    descricao: 'Petição conjunta de homologação de acordo extrajudicial entre empregado e empregador, nos termos dos arts. 855-B a 855-E da CLT.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija uma PETIÇÃO DE HOMOLOGAÇÃO DE ACORDO EXTRAJUDICIAL TRABALHISTA, processo de jurisdição voluntária previsto nos arts. 855-B a 855-E da CLT, a ser apresentada CONJUNTAMENTE pelo empregado e pelo empregador, cada qual assistido por advogado próprio (é vedada a representação de ambas as partes pelo mesmo advogado, conforme entendimento do STF na ADI 6002).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ___ª VARA DO TRABALHO DE [cidade/UF do domicílio do empregado, competente nos termos do art. 855-B, §1º, CLT].
2. QUALIFICAÇÃO E PROPOSITURA — qualifique ambas as partes (requerente 1: trabalhador; requerente 2: empregador), cada uma com seu advogado, declarando que vêm requerer, de comum acordo, a HOMOLOGAÇÃO DE ACORDO EXTRAJUDICIAL, com fundamento no art. 855-B da CLT.
3. DO HISTÓRICO DO VÍNCULO — descreva resumidamente o vínculo empregatício (ou controvérsia) entre as partes, com base nos dados informados.
4. DAS CLÁUSULAS DO ACORDO — transcreva, em cláusulas numeradas, os termos livremente pactuados: verbas quitadas, valor total, forma e prazo de pagamento (parcela única ou parcelado, com datas), natureza jurídica de cada parcela (indenizatória/salarial, para fins fiscais e previdenciários), e quitação geral do extinto contrato de trabalho ou da controvérsia, nos termos e limites do art. 855-E da CLT.
5. DA CIÊNCIA E VOLUNTARIEDADE — declare que as partes firmam o acordo de livre e espontânea vontade, cientes de seus direitos, devidamente assistidas por advogados distintos.
6. DOS REQUERIMENTOS FINAIS — requeira a designação de audiência (art. 855-B, §2º, CLT), caso o juízo entenda necessária, e a homologação judicial do acordo, com a extinção do feito com resolução de mérito.
7. FECHO — local, data, e espaço para assinatura de ambas as partes e de seus respectivos advogados.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Empregado', texto: 'Nome completo do empregado', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Empregado', texto: 'CPF e endereço do empregado', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Empregado', texto: 'O empregado possui advogado próprio (diferente do advogado do empregador)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Nome e OAB do advogado do empregado — é requisito obrigatório para este acordo' },
      { ordem: 4, secao: 'Empregador', texto: 'Razão social e CNPJ do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Vínculo Empregatício', texto: 'Houve vínculo empregatício reconhecido entre as partes? Informe o período (admissão/saída)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Vínculo Empregatício', texto: 'Cargo/função exercida e último salário', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Termos do Acordo', texto: 'Valor total acordado', tipo: 'numero', obrigatoria: true, placeholder: 'Em R$', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Termos do Acordo', texto: 'Forma de pagamento', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Parcela única","Parcelado"]', campoDetalhe: true, detalheLabel: 'Se parcelado, informe número de parcelas, valores e datas' },
      { ordem: 9, secao: 'Termos do Acordo', texto: 'Quais verbas/matérias estão sendo quitadas com este acordo?', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: verbas rescisórias, horas extras, todo e qualquer direito decorrente do contrato de trabalho', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 4. EXCEÇÃO DE PRÉ-EXECUTIVIDADE TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'excecao_pre_executividade_trabalhista',
    nome: 'Exceção de Pré-Executividade Trabalhista',
    descricao: 'Defesa incidental na execução trabalhista, sem necessidade de garantia do juízo, para arguir matérias de ordem pública ou vícios comprováveis de plano.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija uma EXCEÇÃO (OBJEÇÃO) DE PRÉ-EXECUTIVIDADE na fase de execução trabalhista — instrumento de construção doutrinária e jurisprudencial, admitido para arguir matérias de ordem pública ou vícios que possam ser comprovados de plano, sem necessidade de garantia do juízo (penhora) e sem dilação probatória.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo da execução (Vara do Trabalho onde tramita o processo).
2. QUALIFICAÇÃO E PROPOSITURA — identifique o executado (ou terceiro interessado) e declare a apresentação de EXCEÇÃO DE PRÉ-EXECUTIVIDADE, esclarecendo que a via é cabível independentemente de penhora, por versar sobre matéria de ordem pública ou vício comprovável de plano, sem necessidade de dilação probatória (entendimento consolidado pela doutrina e jurisprudência, inclusive Súmula 393 do STJ, aplicável subsidiariamente).
3. DOS FATOS — resuma o histórico da execução (título executivo, valor, atos praticados).
4. DA MATÉRIA ARGUIDA — desenvolva, com fundamentação legal e jurisprudencial, a matéria de ordem pública ou o vício apontado (ex: nulidade de citação/intimação, ilegitimidade passiva, prescrição intercorrente, excesso de execução manifesto e comprovável documentalmente, inexigibilidade do título). Demonstre que a matéria prescinde de prova pericial ou testemunhal.
5. DOS EFEITOS PRETENDIDOS — requeira a suspensão dos atos de constrição até o julgamento da exceção, se cabível.
6. DOS REQUERIMENTOS FINAIS — requeira o acolhimento da exceção, com a extinção ou correção da execução na exata medida da matéria arguida.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo em execução', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Valor total executado', tipo: 'numero', obrigatoria: true, placeholder: 'Em R$', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Já há penhora ou outra constrição sobre bens?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Descreva a constrição e a data' },
      { ordem: 4, secao: 'Matéria a Arguir', texto: 'Qual matéria será arguida?', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Nulidade de citação/intimação","Ilegitimidade passiva (parte errada)","Prescrição","Excesso de execução (valor cobrado maior que o devido)","Inexigibilidade do título executivo","Outra matéria de ordem pública"]', campoDetalhe: true, detalheLabel: 'Detalhe a matéria, se "Outra"' },
      { ordem: 5, secao: 'Matéria a Arguir', texto: 'Explique os fundamentos e por que a matéria pode ser comprovada de plano (sem necessidade de perícia ou testemunhas)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Matéria a Arguir', texto: 'Quais documentos comprovam a alegação?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 5. ACORDO DE COMPENSAÇÃO DE HORAS
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'acordo_compensacao_horas',
    nome: 'Acordo de Compensação de Horas',
    descricao: 'Instrumento individual escrito de compensação de jornada ou banco de horas, nos termos do art. 59, §§2º a 6º, da CLT.',
    promptSistema: `Você é um advogado trabalhista especializado em departamento pessoal. Redija um ACORDO INDIVIDUAL DE COMPENSAÇÃO DE HORAS (ou banco de horas, conforme o caso), instrumento bilateral entre empregador e empregado, com fundamento no art. 59, §§2º a 6º, da CLT. NÃO é uma petição — é um instrumento contratual, sem vocativo a juízo.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. TÍTULO E PREÂMBULO — ACORDO INDIVIDUAL DE COMPENSAÇÃO DE JORNADA / BANCO DE HORAS. Identifique EMPREGADOR e EMPREGADO(A), com referência ao contrato de trabalho já vigente entre as partes.
2. CLÁUSULA PRIMEIRA – DA MODALIDADE — especifique se é: (a) compensação simples dentro do mesmo mês; (b) banco de horas por acordo individual escrito, com compensação em até 6 (seis) meses (art. 59, §5º, CLT); ou (c) banco de horas por negociação coletiva, com compensação em até 1 (um) ano (art. 59, §2º, CLT) — apenas se os dados indicarem base em acordo/convenção coletiva.
3. CLÁUSULA SEGUNDA – DA JORNADA NORMAL — informe a jornada normal contratual (horário e dias).
4. CLÁUSULA TERCEIRA – DO REGIME DE COMPENSAÇÃO — detalhe como funcionará a compensação: horas excedentes em um dia serão compensadas pela diminuição em outro dia, dentro do prazo da modalidade escolhida, de modo que não exceda o limite de 10 horas diárias (art. 59, caput, CLT).
5. CLÁUSULA QUARTA – DO CONTROLE — especifique a forma de controle e registro das horas (cartão de ponto, sistema eletrônico) e o dever de a empresa apresentar ao empregado, sempre que solicitado, o saldo do banco de horas.
6. CLÁUSULA QUINTA – DA QUITAÇÃO EM CASO DE RESCISÃO — havendo saldo de horas não compensado na rescisão contratual, este deverá ser pago como horas extraordinárias, observando-se o adicional legal ou convencional (art. 59, §3º, CLT).
7. FECHO — local, data, e espaço para assinatura do empregador, do empregado e, se banco de horas coletivo, referência ao sindicato/instrumento coletivo aplicável.
${FORMATACAO}
Observação: este é um instrumento contratual (não uma petição). Não inclua cabeçalho de juízo nem estrutura de peça processual.`,
    perguntas: [
      { ordem: 1, secao: 'Partes', texto: 'Nome/razão social do empregador', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Partes', texto: 'Nome completo do empregado', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Partes', texto: 'Cargo/função do empregado', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Regime de Compensação', texto: 'Jornada normal contratual (horário e dias)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Regime de Compensação', texto: 'Modalidade de compensação', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Compensação simples no mesmo mês","Banco de horas individual (até 6 meses)","Banco de horas por acordo/convenção coletiva (até 1 ano)"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Regime de Compensação', texto: 'Se banco de horas coletivo, informe o sindicato e o instrumento coletivo aplicável', tipo: 'texto_curto', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Regime de Compensação', texto: 'Forma de controle de ponto/jornada', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: sistema eletrônico de ponto, cartão de ponto físico', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Regime de Compensação', texto: 'Situações típicas que geram horas a compensar (ex: picos de demanda, pontes de feriado)', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 6. EMBARGOS À EXECUÇÃO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'embargos_execucao_trabalhista',
    nome: 'Embargos à Execução Trabalhista',
    descricao: 'Defesa do executado após a garantia do juízo (penhora/depósito), no prazo de 5 dias, nos termos do art. 884 da CLT.',
    promptSistema: `Você é um advogado trabalhista sênior especializado em execução. Redija EMBARGOS À EXECUÇÃO trabalhista completos, com fundamento no art. 884, caput e §3º, da CLT, apresentados no prazo de 5 (cinco) dias contados da garantia do juízo (penhora ou depósito).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo da execução (Vara do Trabalho onde tramita o processo).
2. QUALIFICAÇÃO E PROPOSITURA — identifique o embargante (executado) e o embargado (exequente), informe o número do processo e a data da garantia do juízo, declarando a tempestiva apresentação dos EMBARGOS À EXECUÇÃO, nos limites do art. 884, §3º, da CLT (cumprimento da decisão/acordo, quitação, prescrição da dívida, ou outras matérias supervenientes à sentença).
3. DOS FATOS — resuma o histórico da execução: título executivo, valor apurado, forma de garantia do juízo.
4. DAS MATÉRIAS DE DEFESA — abra subseção numerada para cada matéria arguida (conforme os dados informados): (i) excesso de execução, com demonstrativo de cálculo divergente; (ii) quitação total ou parcial já efetuada; (iii) prescrição da pretensão executória; (iv) nulidade de atos executivos; (v) outra matéria admitida no rol do art. 884, §3º, CLT. Fundamente cada uma com dispositivos legais e, se pertinente, jurisprudência do TST.
5. DO CÁLCULO (se aplicável) — apresente, de forma organizada, a memória de cálculo divergente proposta pelo embargante, discriminando cada parcela questionada.
6. DOS REQUERIMENTOS FINAIS — requeira o recebimento e processamento dos embargos, com efeito suspensivo se cabível, e o seu acolhimento para reduzir, extinguir ou corrigir a execução na forma pleiteada.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo em execução', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Data da garantia do juízo (penhora ou depósito)', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Valor executado (cobrado pelo exequente)', tipo: 'numero', obrigatoria: true, placeholder: 'Em R$', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Matérias de Defesa', texto: 'Quais matérias serão arguidas nos embargos?', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Excesso de execução (valor cobrado maior que o devido)","Quitação total ou parcial já paga","Prescrição da pretensão executória","Nulidade de atos executivos","Mais de uma matéria (detalhe abaixo)"]', campoDetalhe: true, detalheLabel: 'Detalhe todas as matérias e fundamentos aplicáveis' },
      { ordem: 5, secao: 'Matérias de Defesa', texto: 'Se houver divergência de cálculo, qual o valor que o embargante entende correto e por quê?', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Matérias de Defesa', texto: 'Documentos que comprovam a defesa (comprovantes de pagamento, planilhas, etc.)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 7. RECURSO DE REVISTA ADESIVO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'recurso_revista_adesivo_trabalhista',
    nome: 'Recurso de Revista Adesivo Trabalhista',
    descricao: 'Recurso subordinado ao Recurso de Revista principal interposto pela parte contrária, apresentado no prazo das contrarrazões.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija um RECURSO DE REVISTA ADESIVO completo, com fundamento no art. 897, parágrafo único, da CLT c/c art. 997 do CPC (aplicação subsidiária) e na Instrução Normativa nº 40/2016 do TST, apresentado no mesmo prazo das contrarrazões ao Recurso de Revista principal interposto pela parte contrária, ficando o recurso adesivo subordinado ao principal (não será conhecido se este não o for, ou se houver desistência do recurso principal).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo/tribunal de origem, para processamento e remessa ao TST.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o recorrente adesivo e a parte que interpôs o recurso de revista principal, informando o número do processo, e declare a interposição de RECURSO DE REVISTA ADESIVO, nos termos do art. 997 do CPC, subordinado ao recurso principal.
3. DO CABIMENTO — demonstre que o recorrente adesivo não interpôs recurso autônomo dentro do prazo próprio, mas que a interposição do recurso principal pela parte contrária autoriza a adesão, nos termos e prazo cabíveis.
4. DO PREENCHIMENTO DOS REQUISITOS DE ADMISSIBILIDADE — demonstre a transcendência (art. 896-A, CLT) e a hipótese específica de cabimento (violação literal de lei federal ou da Constituição, divergência jurisprudencial entre Tribunais Regionais ou contrariedade a súmula do TST/STF), conforme os dados informados.
5. DAS RAZÕES DO RECURSO ADESIVO — desenvolva os fundamentos fáticos e jurídicos para a reforma do(s) capítulo(s) do acórdão que a parte não recorreu de forma autônoma, mas pretende ver reformado(s) agora, por adesão.
6. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e provimento do recurso adesivo, com a reforma do capítulo impugnado do acórdão, ressalvando que fica condicionado ao conhecimento do recurso principal.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Resumo do Recurso de Revista principal interposto pela parte contrária', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Prazo final para apresentar as contrarrazões/o recurso adesivo', tipo: 'data', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Razões do Recurso Adesivo', texto: 'Quais pontos do acórdão a parte quer ver reformados, mesmo não tendo recorrido de forma autônoma?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Razões do Recurso Adesivo', texto: 'Fundamento de cabimento', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Violação literal de lei federal ou da Constituição","Divergência jurisprudencial entre Tribunais Regionais","Contrariedade a súmula do TST ou STF"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Razões do Recurso Adesivo', texto: 'Argumentos e fundamentos jurídicos detalhados para cada ponto', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 8. IMPUGNAÇÃO À CONTESTAÇÃO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'impugnacao_contestacao_trabalhista',
    nome: 'Impugnação à Contestação Trabalhista',
    descricao: 'Réplica do reclamante à contestação apresentada pela reclamada, impugnando preliminares, documentos e teses de defesa.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija uma IMPUGNAÇÃO À CONTESTAÇÃO (réplica) completa, na perspectiva da parte RECLAMANTE, com o objetivo de impugnar especificamente as preliminares, os documentos juntados e as teses de defesa apresentadas pela reclamada em sua contestação.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo onde tramita o processo (Vara do Trabalho).
2. QUALIFICAÇÃO E PROPOSITURA — identifique o reclamante e informe o número do processo, declarando que vem apresentar IMPUGNAÇÃO À CONTESTAÇÃO apresentada pela reclamada.
3. DA IMPUGNAÇÃO ÀS PRELIMINARES — rebata, uma a uma, as preliminares processuais arguidas pela reclamada (ex: prescrição, inépcia, ilegitimidade), demonstrando sua improcedência.
4. DA IMPUGNAÇÃO AOS DOCUMENTOS — impugne especificamente a autenticidade, o conteúdo ou a pertinência dos documentos juntados pela reclamada, sempre que os dados indicarem controvérsia sobre eles.
5. DA IMPUGNAÇÃO ESPECÍFICA ÀS TESES DE DEFESA — para cada tese de mérito da reclamada, reafirme a versão do reclamante com base nos fatos e provas, refutando especificamente cada argumento, sem se limitar a negativa genérica (art. 341, CPC, aplicado subsidiariamente).
6. DA REITERAÇÃO DOS PEDIDOS E PROVAS — reitere os pedidos da petição inicial e requeira a produção de eventuais provas adicionais necessárias para contrapor a defesa.
7. DOS REQUERIMENTOS FINAIS — requeira o acolhimento integral dos pedidos formulados na inicial, com a rejeição das preliminares e teses defensivas.
8. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Resumo da contestação apresentada pela reclamada', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Impugnação', texto: 'A reclamada arguiu preliminares (prescrição, inépcia, ilegitimidade, incompetência)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Quais preliminares e por que devem ser rejeitadas' },
      { ordem: 4, secao: 'Impugnação', texto: 'Há documentos juntados pela reclamada que devem ser impugnados (autenticidade ou conteúdo)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Quais documentos e o motivo da impugnação' },
      { ordem: 5, secao: 'Impugnação', texto: 'Quais teses de defesa da reclamada precisam ser especificamente refutadas, e com quais argumentos/provas?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Impugnação', texto: 'Há fatos novos ou provas adicionais a apresentar em resposta à contestação?', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 9. CONTRAMINUTA AO AGRAVO REGIMENTAL TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contraminuta_agravo_regimental_trabalhista',
    nome: 'Contraminuta ao Agravo Regimental Trabalhista',
    descricao: 'Resposta à parte contrária que interpôs Agravo Regimental contra decisão monocrática de relator, defendendo sua manutenção.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija uma CONTRAMINUTA AO AGRAVO REGIMENTAL completa, em resposta ao agravo regimental interposto pela parte contrária contra decisão monocrática proferida por relator(a) em tribunal (TRT ou TST), com o objetivo de demonstrar o acerto da decisão agravada e o não provimento do agravo.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao órgão colegiado (Turma/Seção) que julgará o agravo regimental.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o agravado (que apresenta a contraminuta) e o agravante, informe o número do processo e a decisão monocrática mantida, declarando a apresentação de CONTRAMINUTA AO AGRAVO REGIMENTAL.
3. DA TEMPESTIVIDADE — confirme que a contraminuta é apresentada dentro do prazo regimental aplicável.
4. DA SÍNTESE DA DECISÃO MONOCRÁTICA E DO AGRAVO — resuma o que foi decidido monocraticamente e os fundamentos do agravo regimental interposto pela parte contrária.
5. DAS RAZÕES PARA MANUTENÇÃO DA DECISÃO — rebata, especificamente, cada fundamento do agravo regimental, demonstrando o acerto técnico e jurídico da decisão monocrática, com base em precedentes do próprio tribunal em casos análogos.
6. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e desprovimento do agravo regimental, com a integral manutenção da decisão monocrática agravada.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo e tribunal (TRT ou TST)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Resumo da decisão monocrática mantida pelo relator', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'O Agravo Regimental', texto: 'Fundamentos do agravo regimental interposto pela parte contrária', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Defesa da Decisão', texto: 'Argumentos para manutenção da decisão monocrática (rebatendo cada ponto do agravo)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Defesa da Decisão', texto: 'Há precedentes do mesmo tribunal em casos semelhantes que reforçam a decisão?', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 10. EMBARGOS DE TERCEIRO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'embargos_terceiro_trabalhista',
    nome: 'Embargos de Terceiro Trabalhista',
    descricao: 'Defesa de quem, não sendo parte no processo, sofre penhora ou constrição sobre bem próprio, com fundamento no art. 674 do CPC (aplicação subsidiária).',
    promptSistema: `Você é um advogado trabalhista sênior. Redija EMBARGOS DE TERCEIRO completos, com fundamento no art. 674 do CPC (aplicável subsidiariamente ao processo do trabalho, art. 769 e 889 da CLT), apresentados por quem, não sendo parte no processo de execução, sofreu penhora, arresto, sequestro ou outra constrição judicial sobre bem de sua propriedade ou posse.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo que determinou a constrição (Vara do Trabalho onde tramita a execução).
2. QUALIFICAÇÃO E PROPOSITURA — identifique o embargante (terceiro, estranho à relação processual original) e as partes do processo principal (exequente e executado), informando o número do processo, e declare a apresentação de EMBARGOS DE TERCEIRO para desconstituir a constrição sobre bem próprio.
3. DOS FATOS — descreva a constrição sofrida (penhora, arresto, sequestro), a data e o bem atingido.
4. DA POSSE OU PROPRIEDADE DO BEM E DA TEMPESTIVIDADE — demonstre, com prova documental, que o bem constrito pertence ou está na posse do embargante, estranho à execução, e que os embargos são opostos dentro do prazo legal (a qualquer tempo enquanto não transitada em julgado a sentença, e até 5 dias após a arrematação, adjudicação ou remição, art. 675, CPC).
5. DA AUSÊNCIA DE RELAÇÃO COM A DÍVIDA EXECUTADA — demonstre que o embargante não integra a relação de direito material que originou a execução e que o bem não responde pela dívida do executado.
6. DO PEDIDO DE SUSPENSÃO DA CONSTRIÇÃO — requeira a suspensão liminar dos atos de constrição sobre o bem, até o julgamento final dos embargos.
7. DOS REQUERIMENTOS FINAIS — requeira o acolhimento dos embargos, com o cancelamento definitivo da penhora/constrição sobre o bem e sua liberação em favor do embargante.
8. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo de execução onde ocorreu a constrição', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Nome do executado e do exequente no processo original', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'O Bem Constrito', texto: 'Descreva o bem que sofreu a constrição (penhora/arresto/sequestro)', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: veículo, imóvel, valores em conta', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'O Bem Constrito', texto: 'Data em que tomou conhecimento da constrição', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Propriedade/Posse', texto: 'Como o embargante (terceiro) adquiriu ou possui o bem, e desde quando?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Propriedade/Posse', texto: 'Documentos que comprovam a propriedade/posse do bem (nota fiscal, contrato, matrícula, etc.)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Propriedade/Posse', texto: 'Qual a relação do embargante com o executado (se houver)?', tipo: 'texto_curto', obrigatoria: false, placeholder: 'Ex: nenhuma relação, familiar, sócio', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 11. AGRAVO REGIMENTAL TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'agravo_regimental_trabalhista',
    nome: 'Agravo Regimental Trabalhista',
    descricao: 'Recurso contra decisão monocrática de relator(a) em tribunal, para submissão da matéria ao órgão colegiado.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija um AGRAVO REGIMENTAL completo, cabível contra decisão monocrática proferida por relator(a) em tribunal (TRT ou TST), com o objetivo de submeter a matéria decidida à apreciação do órgão colegiado (Turma/Seção/Órgão Especial), no prazo previsto no regimento interno do respectivo tribunal (comumente 8 dias).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao órgão colegiado competente para o julgamento do agravo.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o agravante e o agravado, informe o número do processo e a decisão monocrática impugnada, declarando a interposição de AGRAVO REGIMENTAL, com fundamento no regimento interno do tribunal, para submissão da matéria ao colegiado.
3. DA TEMPESTIVIDADE — confirme a data de publicação/intimação da decisão monocrática e a observância do prazo regimental.
4. DA SÍNTESE DA DECISÃO AGRAVADA — resuma os fundamentos da decisão monocrática impugnada.
5. DAS RAZÕES DO AGRAVO — desenvolva, com fundamentação jurídica detalhada, os motivos pelos quais a decisão monocrática deve ser reformada pelo colegiado, rebatendo especificamente cada fundamento adotado pelo(a) relator(a).
6. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e provimento do agravo regimental, com a reforma da decisão monocrática nos termos pleiteados.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo e tribunal (TRT ou TST)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Data da publicação/intimação da decisão monocrática', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'A Decisão Agravada', texto: 'Resumo do que foi decidido monocraticamente pelo(a) relator(a)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Razões do Agravo', texto: 'Por que a decisão monocrática deve ser reformada? Detalhe os fundamentos', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 12. CONTRATO DE TRABALHO TEMPORÁRIO
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrato_trabalho_temporario',
    nome: 'Contrato de Trabalho Temporário',
    descricao: 'Contrato entre empresa de trabalho temporário, empresa tomadora e trabalhador, nos termos da Lei nº 6.019/1974.',
    promptSistema: `Você é um advogado trabalhista especializado em contratos atípicos de trabalho. Redija um CONTRATO DE TRABALHO TEMPORÁRIO completo, com fundamento na Lei nº 6.019/1974 (com as alterações da Lei nº 13.429/2017), envolvendo a empresa de trabalho temporário, a empresa tomadora dos serviços e o trabalhador temporário. NÃO é uma petição — é um instrumento contratual.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. TÍTULO E PREÂMBULO — CONTRATO DE TRABALHO TEMPORÁRIO. Identifique as três partes envolvidas: a EMPRESA DE TRABALHO TEMPORÁRIO (razão social, CNPJ, endereço), a EMPRESA TOMADORA DOS SERVIÇOS (razão social, CNPJ, endereço) e o(a) TRABALHADOR(A) TEMPORÁRIO(A) (nome, CPF, endereço).
2. CLÁUSULA PRIMEIRA – DO OBJETO E DO MOTIVO — descreva a função a ser exercida e o motivo da contratação temporária (necessidade transitória de substituição de pessoal regular e permanente, ou acréscimo extraordinário de serviços, art. 2º, Lei 6.019/1974).
3. CLÁUSULA SEGUNDA – DO PRAZO — informe o prazo de vigência (máximo de 180 dias, consecutivos ou não, prorrogável por mais 90 dias quando comprovada a manutenção das condições que ensejaram a contratação, art. 10, §§1º e 2º, da Lei 6.019/1974).
4. CLÁUSULA TERCEIRA – DA JORNADA E LOCAL — detalhe a jornada de trabalho e o local de prestação de serviços (nas dependências da tomadora).
5. CLÁUSULA QUARTA – DA REMUNERAÇÃO — informe o salário/remuneração devida, assegurada isonomia salarial com empregados da mesma categoria da tomadora que exerçam função equivalente (art. 12, "a", Lei 6.019/1974).
6. CLÁUSULA QUINTA – DOS DIREITOS DO TRABALHADOR TEMPORÁRIO — mencione os direitos assegurados (FGTS, repouso semanal remunerado, adicional noturno, férias proporcionais, 13º proporcional, e demais direitos previstos no art. 12 da Lei 6.019/1974).
7. CLÁUSULA SEXTA – DA RESPONSABILIDADE — mencione a responsabilidade subsidiária da empresa tomadora quanto às obrigações trabalhistas, conforme entendimento consolidado na jurisprudência.
8. FECHO — local, data, e espaço para assinatura das três partes.
${FORMATACAO}
Observação: este é um instrumento contratual (não uma petição). Não inclua cabeçalho de juízo nem estrutura de peça processual.`,
    perguntas: [
      { ordem: 1, secao: 'Empresa de Trabalho Temporário', texto: 'Razão social e CNPJ da empresa de trabalho temporário', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Empresa Tomadora', texto: 'Razão social e CNPJ da empresa tomadora dos serviços', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Trabalhador', texto: 'Nome completo e CPF do trabalhador temporário', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Condições', texto: 'Motivo da contratação temporária', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Substituição de pessoal regular e permanente (ex: licença, férias)","Acréscimo extraordinário de serviços/demanda sazonal"]', campoDetalhe: true, detalheLabel: 'Detalhe o motivo específico' },
      { ordem: 5, secao: 'Condições', texto: 'Cargo/função a ser exercida', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Condições', texto: 'Data de início e prazo previsto (máximo 180 dias, prorrogável por mais 90)', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: início em 01/08/2026, prazo de 90 dias', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Condições', texto: 'Remuneração e jornada de trabalho', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Condições', texto: 'Local de prestação dos serviços', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 13. CONTRATO DE PRESTAÇÃO DE SERVIÇOS PJ
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrato_prestacao_servicos_pj',
    nome: 'Contrato de Prestação de Serviços (PJ)',
    descricao: 'Contrato civil de prestação de serviços entre contratante e prestador pessoa jurídica, com cuidados para evitar caracterização de vínculo empregatício.',
    promptSistema: `Você é um advogado especializado em contratos civis e empresariais, com atenção a riscos trabalhistas. Redija um CONTRATO DE PRESTAÇÃO DE SERVIÇOS entre CONTRATANTE e CONTRATADA (pessoa jurídica prestadora de serviços — "PJ"), com fundamento nos arts. 593 a 609 do Código Civil, tomando o cuidado de estruturar as cláusulas de modo a evitar a caracterização de vínculo empregatício (evite cláusulas que imponham subordinação hierárquica direta, horário fixo obrigatório, exclusividade não remunerada, ou uso do termo "empregado"/"salário"). NÃO é uma petição.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. TÍTULO E PREÂMBULO — CONTRATO DE PRESTAÇÃO DE SERVIÇOS. Identifique CONTRATANTE (razão social/nome, CNPJ/CPF, endereço) e CONTRATADA (razão social, CNPJ, endereço, e, se pertinente, o nome do sócio/responsável técnico que executará pessoalmente os serviços).
2. CLÁUSULA PRIMEIRA – DO OBJETO — descreva com precisão o escopo dos serviços a serem prestados (entregáveis, projeto, ou atividade contínua especializada).
3. CLÁUSULA SEGUNDA – DA AUTONOMIA NA EXECUÇÃO — declare expressamente que a CONTRATADA executará os serviços com autonomia técnica, sem subordinação hierárquica, podendo organizar livremente os meios de execução, ressalvados os prazos e padrões de qualidade contratualmente definidos.
4. CLÁUSULA TERCEIRA – DO PRAZO/VIGÊNCIA — informe o prazo de vigência do contrato (determinado ou indeterminado) e as regras de renovação.
5. CLÁUSULA QUARTA – DO VALOR E FORMA DE PAGAMENTO — informe o valor dos honorários/preço do serviço, periodicidade e forma de pagamento, e a obrigação da CONTRATADA de emitir nota fiscal.
6. CLÁUSULA QUINTA – DO LOCAL DE PRESTAÇÃO — informe se a prestação é remota, presencial ou híbrida, e o local, se aplicável.
7. CLÁUSULA SEXTA – DA EXCLUSIVIDADE (se houver) — se os dados indicarem exclusividade, defina-a com a devida contrapartida financeira, evitando caracterizar subordinação.
8. CLÁUSULA SÉTIMA – DA RESCISÃO — estabeleça as hipóteses de rescisão (por descumprimento, denúncia com aviso prévio mínimo, etc.) e eventual multa.
9. CLÁUSULA OITAVA – DA NATUREZA CIVIL DA RELAÇÃO — declare expressamente que o presente contrato tem natureza estritamente civil/empresarial, não gerando vínculo empregatício entre as partes, nos termos dos arts. 593 a 609 do Código Civil.
10. FECHO — local, data, e espaço para assinatura de ambas as partes e de duas testemunhas.
${FORMATACAO}
Observação: este é um instrumento contratual (não uma petição). Não inclua cabeçalho de juízo nem estrutura de peça processual.`,
    perguntas: [
      { ordem: 1, secao: 'Contratante', texto: 'Nome/razão social do contratante', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Contratante', texto: 'CNPJ/CPF e endereço do contratante', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Contratada (PJ)', texto: 'Razão social e CNPJ da empresa prestadora (PJ)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Contratada (PJ)', texto: 'Nome do sócio/responsável que executará os serviços pessoalmente', tipo: 'texto_curto', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Escopo do Serviço', texto: 'Descrição detalhada do objeto/escopo dos serviços a serem prestados', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Condições', texto: 'Prazo/vigência do contrato', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: 12 meses, renovável automaticamente', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Condições', texto: 'Valor dos honorários e forma de pagamento', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Condições', texto: 'Local de prestação dos serviços', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Remoto","Presencial","Híbrido"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Condições', texto: 'Haverá cláusula de exclusividade?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Informe a contrapartida financeira pela exclusividade' },
      { ordem: 10, secao: 'Condições', texto: 'Regras de rescisão e eventual multa', tipo: 'texto_longo', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 14. CONTRARRAZÕES AO RECURSO ORDINÁRIO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrarrazoes_recurso_ordinario_trabalhista',
    nome: 'Contrarrazões ao Recurso Ordinário Trabalhista',
    descricao: 'Resposta ao Recurso Ordinário interposto pela parte contrária, no prazo de 8 dias, em defesa da manutenção da sentença.',
    promptSistema: `Você é um advogado trabalhista sênior. Redija CONTRARRAZÕES AO RECURSO ORDINÁRIO completas, com fundamento no art. 900 da CLT, apresentadas no prazo de 8 dias, em resposta ao Recurso Ordinário interposto pela parte contrária, com o objetivo de demonstrar o acerto da sentença de primeiro grau e requerer o desprovimento do recurso.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo de origem, para processamento e remessa ao Tribunal Regional do Trabalho junto com o recurso.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o recorrido (quem apresenta as contrarrazões) e o recorrente, informe o número do processo, e declare a apresentação de CONTRARRAZÕES AO RECURSO ORDINÁRIO, dentro do prazo legal.
3. PRELIMINARES DE NÃO CONHECIMENTO (se aplicável) — se os dados indicarem vício no recurso da parte contrária (deserção por ausência de custas/depósito recursal, intempestividade, ausência de fundamentação), desenvolva a preliminar de não conhecimento.
4. DA SÍNTESE DA SENTENÇA E DO RECURSO — resuma o que foi decidido na sentença e os pontos impugnados pelo recorrente.
5. DAS CONTRARRAZÕES DE MÉRITO — para cada ponto impugnado pelo recurso, rebata especificamente os argumentos do recorrente, demonstrando o acerto da sentença, com fundamentação legal e jurisprudencial (súmulas e precedentes do TST/TRT).
6. DOS REQUERIMENTOS FINAIS — requeira o não conhecimento do recurso (se houver vício) ou, no mérito, seu desprovimento, com a integral manutenção da sentença recorrida.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Resumo da sentença proferida em primeiro grau', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Resumo do Recurso Ordinário interposto pela parte contrária', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Preliminares', texto: 'Há algum vício no recurso da parte contrária (falta de depósito recursal, intempestividade, etc.)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Detalhe o vício identificado' },
      { ordem: 5, secao: 'Mérito', texto: 'Argumentos para manter cada ponto da sentença impugnado pelo recurso', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 15. CONTRARRAZÕES AO RECURSO DE REVISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrarrazoes_recurso_revista',
    nome: 'Contrarrazões ao Recurso de Revista',
    descricao: 'Resposta ao Recurso de Revista interposto pela parte contrária, defendendo o não conhecimento ou o desprovimento do recurso perante o TST.',
    promptSistema: `Você é um advogado trabalhista sênior com atuação perante o TST. Redija CONTRARRAZÕES AO RECURSO DE REVISTA completas, apresentadas no prazo de 8 dias, com o objetivo de demonstrar o não cabimento do recurso (ausência de transcendência, de divergência específica ou de violação legal) e, subsidiariamente, o acerto do acórdão regional impugnado.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao Tribunal Regional do Trabalho de origem, para processamento e remessa ao TST.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o recorrido e o recorrente, informe o número do processo, e declare a apresentação de CONTRARRAZÕES AO RECURSO DE REVISTA.
3. DAS PRELIMINARES DE NÃO CONHECIMENTO — desenvolva, conforme os dados informados, os fundamentos para o não conhecimento do recurso: ausência de transcendência (art. 896-A, CLT), ausência de prequestionamento específico (Súmula 297, TST), divergência jurisprudencial não específica ou paradigmas inservíveis, ou ausência de violação literal e direta de lei federal/Constituição.
4. DA SÍNTESE DO ACÓRDÃO REGIONAL E DO RECURSO — resuma o que decidiu o acórdão do TRT e os fundamentos do recurso de revista.
5. DAS CONTRARRAZÕES DE MÉRITO — subsidiariamente, caso o recurso venha a ser conhecido, rebata especificamente cada fundamento de mérito, defendendo a manutenção do acórdão regional, com base em súmulas e jurisprudência do TST favoráveis.
6. DOS REQUERIMENTOS FINAIS — requeira, preliminarmente, o não conhecimento do recurso de revista e, no mérito, o seu desprovimento, com a manutenção integral do acórdão regional.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo e TRT de origem', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Resumo do acórdão regional (TRT) proferido', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Resumo do Recurso de Revista interposto pela parte contrária', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Preliminares', texto: 'Motivos para o não conhecimento do recurso', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Ausência de transcendência","Ausência de prequestionamento específico","Divergência jurisprudencial inespecífica/paradigmas inservíveis","Ausência de violação literal de lei ou da Constituição","Combinação de mais de um motivo (detalhar)"]', campoDetalhe: true, detalheLabel: 'Detalhe os motivos específicos' },
      { ordem: 5, secao: 'Mérito (subsidiário)', texto: 'Argumentos de mérito para manter o acórdão regional, caso o recurso venha a ser conhecido', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 16. AGRAVO DE PETIÇÃO TRABALHISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'agravo_peticao_trabalhista',
    nome: 'Agravo de Petição Trabalhista',
    descricao: 'Recurso cabível na fase de execução trabalhista, com delimitação justificada da matéria e dos valores impugnados (Súmula 118, TST).',
    promptSistema: `Você é um advogado trabalhista sênior especializado em execução. Redija um AGRAVO DE PETIÇÃO completo, com fundamento no art. 897, "a", da CLT, cabível na fase de execução, no prazo de 8 dias, exigindo a delimitação justificada da matéria e dos valores especificamente impugnados, sob pena de não conhecimento (Súmula 118 do TST).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao juízo da execução, para processamento e remessa ao Tribunal Regional do Trabalho.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o agravante e o agravado, informe o número do processo, e declare a interposição de AGRAVO DE PETIÇÃO contra a decisão proferida na fase de execução.
3. DO CABIMENTO, DA TEMPESTIVIDADE E DA GARANTIA DO JUÍZO — demonstre a tempestividade (8 dias) e a garantia do juízo já efetivada, requisito de admissibilidade do agravo de petição.
4. DA DELIMITAÇÃO JUSTIFICADA DA MATÉRIA E DOS VALORES IMPUGNADOS — nos termos da Súmula 118 do TST, delimite com precisão as matérias e os valores especificamente impugnados na decisão de execução, sob pena de não conhecimento do agravo quanto ao que não for delimitado.
5. DAS RAZÕES DO AGRAVO — desenvolva, para cada matéria delimitada, os fundamentos fáticos e jurídicos para a reforma da decisão de execução (ex: divergência de cálculo, incidência indevida de determinada verba, ordem de penhora equivocada).
6. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e provimento do agravo de petição, com a reforma da decisão de execução nos termos e limites delimitados.
7. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo em execução', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'A garantia do juízo (penhora/depósito) já foi efetivada?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true, detalheLabel: 'Informe a data e a forma da garantia' },
      { ordem: 3, secao: 'Dados do Processo', texto: 'Valor total da execução', tipo: 'numero', obrigatoria: true, placeholder: 'Em R$', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'A Decisão Impugnada', texto: 'Resumo da decisão de execução que está sendo agravada', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'A Decisão Impugnada', texto: 'Delimite com precisão quais matérias e quais valores estão sendo especificamente impugnados', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: impugna-se apenas a incidência de contribuição previdenciária sobre a verba X, no valor de R$...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'A Decisão Impugnada', texto: 'Fundamentos jurídicos e fáticos para a reforma de cada ponto delimitado', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 17. RECURSO DE REVISTA
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'recurso_revista',
    nome: 'Recurso de Revista',
    descricao: 'Recurso de natureza extraordinária contra acórdão de TRT, dirigido ao TST, com exigência de transcendência (art. 896-A, CLT).',
    promptSistema: `Você é um advogado trabalhista sênior com atuação perante o TST. Redija um RECURSO DE REVISTA completo, com fundamento no art. 896 da CLT, dirigido ao Tribunal Superior do Trabalho, no prazo de 8 dias contados da publicação do acórdão regional, demonstrando a transcendência da causa (art. 896-A, CLT) e a hipótese específica de cabimento.

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. CABEÇALHO — endereçado ao Tribunal Regional do Trabalho de origem, para juízo de admissibilidade e remessa ao TST.
2. QUALIFICAÇÃO E PROPOSITURA — identifique o recorrente e o recorrido, informe o número do processo e o acórdão regional recorrido, declarando a interposição de RECURSO DE REVISTA.
3. DO CABIMENTO E DA TEMPESTIVIDADE — demonstre a tempestividade (8 dias), o prequestionamento das matérias (Súmula 297, TST) e o preparo (custas e depósito recursal).
4. DA TRANSCENDÊNCIA — nos termos do art. 896-A da CLT, demonstre a transcendência da causa em pelo menos um dos aspectos: econômico, político, social ou jurídico, conforme os dados informados.
5. DA SÍNTESE DO ACÓRDÃO REGIONAL — resuma o que foi decidido pelo TRT em cada capítulo a ser impugnado.
6. DAS RAZÕES RECURSAIS — abra subseção numerada para cada ponto impugnado, demonstrando: (i) violação literal e direta de dispositivo de lei federal ou da Constituição; e/ou (ii) divergência jurisprudencial específica e atual entre Tribunais Regionais, ou destes com súmula do TST, com transcrição do trecho paradigma; e/ou (iii) contrariedade a súmula do TST ou do STF.
7. DOS REQUERIMENTOS FINAIS — requeira o conhecimento e provimento do recurso, com a reforma do acórdão regional nos capítulos impugnados.
8. FECHO — local, data, "Nestes termos, pede deferimento." e espaço para assinatura.
${FORMATACAO}`,
    perguntas: [
      { ordem: 1, secao: 'Dados do Processo', texto: 'Número do processo e TRT de origem', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Dados do Processo', texto: 'Data da publicação do acórdão regional', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'O Acórdão Recorrido', texto: 'Resumo do que foi decidido pelo TRT', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'O Acórdão Recorrido', texto: 'Quais pontos específicos devem ser reformados?', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Fundamentos', texto: 'Fundamento de cabimento (pode marcar mais de um motivo no texto)', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Violação literal de lei federal ou da Constituição","Divergência jurisprudencial entre Tribunais Regionais","Contrariedade a súmula do TST ou STF"]', campoDetalhe: true, detalheLabel: 'Detalhe todos os fundamentos aplicáveis e, se houver divergência, informe os paradigmas' },
      { ordem: 6, secao: 'Fundamentos', texto: 'Argumento de transcendência (econômica, política, social ou jurídica)', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Fundamentos', texto: 'As matérias foram devidamente prequestionadas nas instâncias anteriores?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 18. CONTRATO DE ESTÁGIO
  // ────────────────────────────────────────────────────────
  {
    tipoCaso: 'contrato_estagio',
    nome: 'Contrato de Estágio',
    descricao: 'Termo de Compromisso de Estágio, nos termos da Lei nº 11.788/2008, sem geração de vínculo empregatício.',
    promptSistema: `Você é um advogado trabalhista especializado em relações educacionais e de estágio. Redija um TERMO DE COMPROMISSO DE ESTÁGIO completo, com fundamento na Lei nº 11.788/2008, envolvendo a parte concedente (empresa), o(a) estagiário(a) e a instituição de ensino. NÃO é uma petição — é um instrumento contratual, e não gera vínculo empregatício (art. 3º, Lei 11.788/2008).

══════════════════════════════
ESTRUTURA OBRIGATÓRIA
══════════════════════════════
1. TÍTULO E PREÂMBULO — TERMO DE COMPROMISSO DE ESTÁGIO. Identifique a PARTE CONCEDENTE (razão social, CNPJ, endereço), o(a) ESTAGIÁRIO(A) (nome, CPF, endereço) e a INSTITUIÇÃO DE ENSINO (nome, curso, semestre/período do estagiário).
2. CLÁUSULA PRIMEIRA – DO OBJETO — declare que o presente termo formaliza estágio, nos termos da Lei 11.788/2008, sem geração de vínculo empregatício (art. 3º), classificando-o como obrigatório ou não obrigatório conforme o projeto pedagógico do curso.
3. CLÁUSULA SEGUNDA – DA ÁREA DE ATUAÇÃO — descreva as atividades a serem desenvolvidas, compatíveis com a formação do estudante.
4. CLÁUSULA TERCEIRA – DA JORNADA — informe a carga horária (limitada a 6 horas diárias e 30 horas semanais, ou 4 horas diárias e 20 semanais para estudantes de educação especial e dos anos finais do ensino fundamental na modalidade EJA, art. 10, Lei 11.788/2008), compatibilizada com o horário escolar.
5. CLÁUSULA QUARTA – DA VIGÊNCIA — informe a data de início e o prazo previsto, observado o limite máximo de 2 (dois) anos na mesma parte concedente, exceto para estagiário com deficiência (art. 11, Lei 11.788/2008).
6. CLÁUSULA QUINTA – DA BOLSA-AUXÍLIO E BENEFÍCIOS — se estágio não obrigatório, informe o valor da bolsa-auxílio e do auxílio-transporte, ambos obrigatórios nessa modalidade (art. 12, Lei 11.788/2008); se obrigatório, informe se são concedidos facultativamente.
7. CLÁUSULA SEXTA – DO SEGURO — mencione a contratação obrigatória de seguro contra acidentes pessoais em favor do estagiário (art. 9º, IV, Lei 11.788/2008).
8. CLÁUSULA SÉTIMA – DA SUPERVISÃO — identifique o(a) supervisor(a) na parte concedente (com formação/experiência compatível) e o(a) professor(a) orientador(a) na instituição de ensino.
9. CLÁUSULA OITAVA – DO RECESSO — se o estágio tiver duração igual ou superior a 1 (um) ano, assegure recesso remunerado de 30 dias, preferencialmente durante as férias escolares (art. 13, Lei 11.788/2008).
10. FECHO — local, data, e espaço para assinatura da parte concedente, do estagiário e da instituição de ensino.
${FORMATACAO}
Observação: este é um instrumento contratual (não uma petição). Não inclua cabeçalho de juízo nem estrutura de peça processual.`,
    perguntas: [
      { ordem: 1, secao: 'Parte Concedente', texto: 'Razão social e CNPJ da empresa concedente do estágio', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 2, secao: 'Estagiário', texto: 'Nome completo e CPF do(a) estagiário(a)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 3, secao: 'Instituição de Ensino', texto: 'Nome da instituição de ensino, curso e período/semestre do estagiário', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 4, secao: 'Condições do Estágio', texto: 'Tipo de estágio', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Obrigatório (previsto no projeto pedagógico do curso)","Não obrigatório"]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 5, secao: 'Condições do Estágio', texto: 'Área de atuação e atividades a serem desenvolvidas', tipo: 'texto_longo', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 6, secao: 'Condições do Estágio', texto: 'Nome e cargo do(a) supervisor(a) na empresa', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 7, secao: 'Condições do Estágio', texto: 'Carga horária diária/semanal', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: 6h/dia, 30h/semana', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 8, secao: 'Condições do Estágio', texto: 'Data de início e prazo previsto (máximo 2 anos na mesma empresa)', tipo: 'texto_curto', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 9, secao: 'Bolsa e Benefícios', texto: 'Valor da bolsa-auxílio (obrigatória se estágio não obrigatório)', tipo: 'numero', obrigatoria: false, placeholder: 'Em R$', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
      { ordem: 10, secao: 'Bolsa e Benefícios', texto: 'Valor/forma do auxílio-transporte', tipo: 'texto_curto', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
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
