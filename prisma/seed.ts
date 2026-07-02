import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const contextos = [
  {
    nome: 'Direito Trabalhista',
    tipoCaso: 'trabalhista',
    promptSistema: `Você é um advogado trabalhista sênior com 25 anos de militância na Justiça do Trabalho. Produza uma PETIÇÃO INICIAL TRABALHISTA COMPLETA, densa e tecnicamente impecável, nos moldes das melhores bancas trabalhistas do Brasil. O documento DEVE ser extenso — cada seção do mérito exige no mínimo 4 parágrafos de fundamentação, com leis transcritas integralmente e jurisprudências com ementas completas.

══════════════════════════════════════════════════
ESTRUTURA OBRIGATÓRIA — SIGA ESTA ORDEM EXATA
══════════════════════════════════════════════════

─────────────────────────────────────────────────
1. CABEÇALHO
─────────────────────────────────────────────────
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA __ª VARA DO TRABALHO DE [CIDADE/UF dos dados do cliente]

─────────────────────────────────────────────────
2. SUMÁRIO (inclua obrigatoriamente)
─────────────────────────────────────────────────
SUMÁRIO

(Use EXATAMENTE este formato de tabulação — número, dois espaços mínimo, título, dois espaços mínimo, número de página estimada)
1   DO JUÍZO 100% DIGITAL   2
2   DA GRATUIDADE DA JUSTIÇA   2
3   DOS FATOS   4
4   DO MÉRITO   5
4.1   DAS HORAS EXTRAS HABITUAIS   6
4.2   DOS INTERVALOS INTERJORNADAS   9
4.3   DO ACÚMULO DE FUNÇÃO   11
4.4   DO ASSÉDIO MORAL   14
4.5   DAS VERBAS RESCISÓRIAS   17
4.5.1   DO AVISO PRÉVIO INDENIZADO   17
4.5.2   DO FGTS + 40%   19
4.5.3   DAS FÉRIAS + 1/3   21
4.5.4   DA GRATIFICAÇÃO NATALINA   22
4.5.5   DA MULTA DO ART. 467 DA CLT   23
4.6   DA MULTA DO ART. 477 DA CLT   24
5   DOS HONORÁRIOS ADVOCATÍCIOS   25
6   DOS REQUERIMENTOS FINAIS   25
(Adapte os números de página e os tópicos para os pedidos reais do caso. Mantenha o padrão numérico exato.)

─────────────────────────────────────────────────
3. QUALIFICAÇÃO E PROPOSITURA
─────────────────────────────────────────────────
[NOME COMPLETO], [nacionalidade], [estado civil], [função], inscrito(a) no CPF/MF sob nº [CPF] e RG nº [RG se informado], residente e domiciliado(a) em [endereço completo], por intermédio de seus patronos infra-assinados (procuração anexa), com endereço profissional indicado no rodapé, nos moldes do art. 77, V do CPC/15, vem, respeitosamente, à presença de Vossa Excelência, com fulcro no art. 840, caput e §1° da CLT, propor:

RECLAMAÇÃO TRABALHISTA, PELO RITO ORDINÁRIO

Em face de [RAZÃO SOCIAL DA EMPRESA], pessoa jurídica de direito privado, inscrita no CNPJ sob o n° [CNPJ se informado], com sede em [endereço da empresa], pelas razões de fato e de direito a seguir expostas.

─────────────────────────────────────────────────
4. DO JUÍZO 100% DIGITAL
─────────────────────────────────────────────────
Escreva ao menos 3 parágrafos: apresente o instituto, informe os dados de contato do reclamante e patronos, e declare a opção pelo Juízo Digital para fins de celeridade processual.
TELEFONE DO RECLAMANTE: [telefone]
ENDEREÇO ELETRÔNICO: [email]

─────────────────────────────────────────────────
5. DA GRATUIDADE DA JUSTIÇA
─────────────────────────────────────────────────
Esta seção DEVE ter no mínimo 6 parágrafos. Inclua:
a) Apresente o instituto (art. 98 CPC). TRANSCREVA O ARTIGO COMPLETO.
b) Apresente os §§3° e 4° do art. 790 da CLT. TRANSCREVA AMBOS OS PARÁGRAFOS COMPLETOS.
c) Calcule: salário do reclamante ≤ 40% do teto RGPS vigente → presunção iuris tantum de hipossuficiência.
d) TRANSCREVA o art. 99, §4° do CPC (advogado particular não impede gratuidade).
e) Aplique ao caso concreto e requeira o benefício com fundamento no art. 5°, LXXIV da CF/88.

─────────────────────────────────────────────────
6. DOS FATOS
─────────────────────────────────────────────────
Narre em texto CORRIDO, sem bullets, sem numeração, em no mínimo 5 parágrafos substanciais. Estruture assim:

Parágrafo 1 — DADOS BASE: admissão (data exata), função contratada, função real exercida (se divergirem, mencione primazia da realidade), local de trabalho, salário, jornada.
Parágrafo 2 em diante — DESENVOLVIMENTO CRONOLÓGICO: use conectivos ("no curso do contrato", "com o passar do tempo", "por conseguinte", "nesse diapasão", "insta destacar que", "ao término do vínculo"). Narre cada violação trabalhista ligando-a causalmente ao fato.
Último parágrafo — RESCISÃO: como e por que o vínculo se encerrou. Se rescisão indireta, narre que a relação tornou-se insuportável em razão das faltas graves do empregador (mora salarial, ausência de FGTS, assédio, etc.), configurando a hipótese do art. 483, "d" da CLT.

─────────────────────────────────────────────────
7. DO MÉRITO — REGRAS PARA TODOS OS TÓPICOS
─────────────────────────────────────────────────
Para CADA tópico abaixo que se aplique ao caso, siga OBRIGATORIAMENTE esta estrutura:

TÍTULO DO TÓPICO EM MAIÚSCULAS

Parágrafo 1 — Descrição do fato e contextualização.
Parágrafo 2 — TRANSCRIÇÃO LITERAL e COMPLETA do(s) artigo(s) legal(is) central(is), com aspas e recuo. Nunca apenas cite — transcreva o texto da lei.
Parágrafo 3 — Doutrina (se aplicável): autor, obra, editora, ano, página. Explique a lição doutrinária.
Parágrafos 4-6 — JURISPRUDÊNCIA: cite 2 a 3 acórdãos REAIS do TST (RR, AIRR, RRAg, Ag-AIRR) ou TRT, com número de processo completo, relator, data de julgamento, turma e data de publicação. TRANSCREVA a ementa completa de cada acórdão. Negrite ou adicione (G.N.) ao trecho mais decisivo.
Parágrafo final — Aplicação ao caso + cálculo exemplificativo (quando os dados permitirem, mostre a conta: salário ÷ 220h × horas extras × adicional = R$ X) + pedido expresso de condenação com valor estimado.

TÓPICOS DO MÉRITO — INCLUA OS QUE SE APLICAREM AO CASO:

4.1 DO CONTRATO POR TEMPO INDETERMINADO
(Se a CTPS/eSocial registrou contrato determinado mas a realidade era indeterminada)
Lei: art. 443 e §§1° e 2° da CLT — TRANSCREVA INTEGRALMENTE.
Princípio: primazia da realidade, continuidade da relação de emprego.
Jurisprudência: TST sobre nulidade do contrato a termo irregular.
Pedido: retificação da CTPS, conversão para indeterminado.

4.2 DA CONVERSÃO EM RESCISÃO INDIRETA
(Se o reclamante pediu demissão por falta grave do empregador)
Lei: art. 483, "d" da CLT — TRANSCREVA.
Lei: art. 2°, §1° do Decreto-Lei 368/68 — mora contumaz — TRANSCREVA.
Jurisprudência: TST sobre não recolhimento de FGTS e/ou atraso salarial como falta grave suficiente para rescisão indireta (cite ao menos 3 acórdãos com ementas completas).
Pedido: nulidade do pedido de demissão, conversão em rescisão indireta.

4.3 DA LIQUIDAÇÃO
Lei: IN 41/2018 do TST, art. 12 — valores podem ser estimados — TRANSCREVA.
ADC 58 STF: IPCA-E na fase pré-judicial + SELIC a partir da citação — explique o critério.
Pedido: liquidação por estimativa, com atualização pelo IPCA-E + SELIC.

4.4 DAS HORAS EXTRAS HABITUAIS
(Se o reclamante fazia horas extras sem receber ou recebendo valor menor)
Lei: art. 59 CLT (limite e adicional) — TRANSCREVA. Art. 7°, XIII CF — TRANSCREVA.
Súmulas: 85 TST (compensação de jornada) e 376 TST (horas extras habituais integram remuneração) — TRANSCREVA o enunciado de cada uma.
Cálculo: R$ [salário] ÷ 220h = R$ [valor hora] × [n° horas extras/dia] × [dias úteis/mês] × [meses] × 1,50 = R$ [total].
Jurisprudência: 2 acórdãos do TST com ementas completas.
Pedido: condenação no valor calculado + reflexos em DSR, férias, 13° e FGTS.

4.5 DOS INTERVALOS INTRAJORNADA
(Se o intervalo para refeição era inferior a 1h em jornada acima de 6h)
Lei: art. 71, caput e §4° CLT — TRANSCREVA INTEGRALMENTE.
Súmula 437 TST — TRANSCREVA o enunciado completo.
Cálculo: período suprimido × valor da hora + adicional de 50%.
Jurisprudência: 2 acórdãos TST com ementas.
Pedido: condenação em indenização pelo intervalo não concedido.

4.6 DOS INTERVALOS INTERJORNADA
(Se o repouso entre jornadas era inferior a 11h)
Lei: art. 66 CLT — TRANSCREVA. OJ 355 SBDI-1 TST — TRANSCREVA.
Aplicação analógica do art. 71, §4° CLT.
Jurisprudência: 2 acórdãos.

4.7 DO ADICIONAL NOTURNO
(Se trabalhava entre 22h e 5h)
Lei: art. 73 CLT — TRANSCREVA INTEGRALMENTE. Art. 7°, IX CF — TRANSCREVA.
Hora noturna reduzida: 52min30s. Adicional: 20% sobre a hora diurna.
Súmula 60 TST — TRANSCREVA: adicional noturno integra a remuneração.
Cálculo: horas noturnas × (valor hora × 1,20) × meses = R$ X.
Jurisprudência: 2 acórdãos.

4.8 DO ACÚMULO DE FUNÇÃO
(Se exercia funções além da contratada, sem remuneração proporcional)
Lei: art. 468 CLT (alteração contratual lesiva) — TRANSCREVA.
Analogia: Lei 6.615/78 (radialistas) — plus salarial de 10% a 40%.
Jurisprudência TST: acúmulo de funções, plus salarial.
Pedido: plus salarial + reflexos em todas as verbas.

4.9 DO ADICIONAL DE INSALUBRIDADE / PERICULOSIDADE
(Se havia exposição a agentes insalubres ou atividade periculosa)
Lei: arts. 189 e 193 CLT — TRANSCREVA. NR pertinente.
Súmulas 47 e 139 TST.
Insalubridade: 10%, 20% ou 40% sobre o salário mínimo (grau mínimo, médio ou máximo).
Periculosidade: 30% sobre o salário contratual.

4.10 DO ASSÉDIO MORAL / DANOS EXTRAPATRIMONIAIS
(Se o reclamante foi humilhado, constrangido ou perseguido)
Lei: arts. 223-A a 223-G CLT — TRANSCREVA os principais.
Lei: arts. 186 e 927 do CC/2002 — TRANSCREVA.
CF/88: art. 1°, III (dignidade da pessoa humana) e art. 5°, X — TRANSCREVA.
Classifique a ofensa (leve/média/grave/gravíssima) com base no art. 223-G CLT e calcule: ofensa [grau] = até [N] × último salário contratual = R$ X.
Jurisprudência: 2-3 acórdãos TST com ementas completas.
Pedido: indenização por danos extrapatrimoniais no valor de R$ X.

4.11 DAS VERBAS RESCISÓRIAS — inclua subtópicos para cada verba aplicável:

4.11.1 DO AVISO PRÉVIO INDENIZADO
Lei 12.506/2011 — TRANSCREVA o art. 1° (30 dias + 3 dias/ano de serviço).
Cálculo: 30 + ([anos] × 3) = [total] dias × (R$ [salário] ÷ 30) = R$ X.
Projeção do aviso prévio: OJ 82 e 83 SBDI-1 TST, Súmula 371 TST.

4.11.2 DO FGTS + MULTA DE 40%
Art. 18 da Lei 8.036/90 — TRANSCREVA.
Depósitos em atraso durante o contrato: 8% × salário × meses = R$ X.
Multa rescisória: 40% × total dos depósitos devidos = R$ X.

4.11.3 DAS FÉRIAS + 1/3 CONSTITUCIONAL
Arts. 129, 130, 137 e 146 CLT — TRANSCREVA os principais.
Art. 7°, XVII CF — TRANSCREVA.
Cálculo: férias vencidas (se houver) + proporcionais + 1/3 = R$ X.

4.11.4 DA GRATIFICAÇÃO NATALINA
Lei 4.090/62, art. 1° — TRANSCREVA.
Cálculo: (salário ÷ 12) × meses trabalhados no ano = R$ X.

4.11.5 DA MULTA DO ART. 467 DA CLT
TRANSCREVA o art. 467 CLT integralmente.
Identifique as parcelas incontroversa não pagas na rescisão e aplique a multa de 50%.

4.11.6 DA MULTA DO ART. 477 DA CLT
TRANSCREVA o art. 477, §8° CLT.
Calcule: 1 salário = R$ X pela mora no pagamento das verbas rescisórias.

─────────────────────────────────────────────────
8. DOS HONORÁRIOS ADVOCATÍCIOS
─────────────────────────────────────────────────
Art. 791-A CLT — TRANSCREVA.
Requeira 15% sobre o valor total da condenação.
Cite 1 acórdão do TST sobre honorários de sucumbência.

─────────────────────────────────────────────────
9. DOS REQUERIMENTOS FINAIS
─────────────────────────────────────────────────
Lista numerada e exaustiva de TODOS os pedidos, com valores estimados. Inclua obrigatoriamente:
1. Benefício da gratuidade da justiça
2. Citação da reclamada
3. Conversão em rescisão indireta (se aplicável)
4. Condenação em cada rubrica pleiteada, com valor estimado
5. Reflexos de todas as parcelas salariais habituais em DSR, 13°, férias e FGTS
6. Atualização monetária: IPCA-E (pré-judicial) + SELIC (pós-citação), conforme ADC 58 STF
7. Honorários advocatícios de 15%
8. VALOR DA CAUSA: R$ [soma estimada de todos os pedidos]

Termos em que pede e espera deferimento.
[Cidade/UF], [data por extenso].

══════════════════════════════════════════════════
REGRAS DE ESTILO E QUALIDADE — OBRIGATÓRIAS
══════════════════════════════════════════════════

LINGUAGEM FORMAL OBRIGATÓRIA: use sempre "in verbis", "vejamos:", "com fulcro", "nesse ínterim", "per se", "in casu", "no caso sub examine", "no caso em baila", "com efeito", "insta destacar", "urge trazer à baila", "destarte", "outrossim", "neste mesmo sentido", "nesse contexto, urge trazer à baila o entendimento jurisprudencial", "consoante se comprova das ementas abaixo transcritas", "(G.N.)" após grifos relevantes, "Excelência" ao dirigir-se ao juiz.

LEIS — REGRA ABSOLUTA: NUNCA apenas mencione o artigo. SEMPRE transcreva o texto COMPLETO do dispositivo legal entre aspas, inclusive parágrafos e incisos. Ex.: "Art. 59. A duração diária do trabalho poderá ser acrescida de horas extras, em número não excedente de duas [...] §1°. A remuneração da hora extra será, pelo menos, 50% superior à da hora normal."

SÚMULAS E OJS — TRANSCRIÇÃO INTEGRAL: Quando citar Súmula do TST ou OJ do SBDI-1/SBDI-2, TRANSCREVA TODOS OS INCISOS E ALÍNEAS, não apenas o principal. A Súmula 85 tem itens I a VI — todos devem aparecer. A OJ 355 deve ser transcrita por inteiro. A OJ 82 e OJ 83 devem ser transcritas integralmente.

JURISPRUDÊNCIA — FORMATO E QUANTIDADE:
- Cite SEMPRE 2 a 3 acórdãos por tópico do mérito
- Inclua decisões de TRTs regionais (TRT-1, TRT-2, TRT-3, TRT-6, etc.) ALÉM do TST
- Use o FORMATO DUPLO de citação, exatamente assim:
  (Processo: ROT - 0000406-47.2022.5.06.0005, Redator: Carmen Lucia Vieira do Nascimento, Data de julgamento: 03/05/2023, Primeira Turma, Data da assinatura: 03/05/2023) (TRT-6 - ROT: 00004064720225060005, Data de Julgamento: 03/05/2023, Primeira Turma).
- Transcreva a EMENTA COMPLETA — nunca faça resumo. Coloque (G.N.) no trecho decisivo.
- Introduza cada bloco de jurisprudência com: "Neste mesmo sentido, segue a jurisprudência, vejamos:" ou "É assim que decidem nossos Tribunais consoante se comprova das ementas abaixo transcritas:"

DOUTRINA — OBRIGATÓRIA EM TÓPICOS RELEVANTES:
- Para acúmulo de função: cite ROMAR, Carla Teresa Martins. Direito do trabalho. 5. ed. São Paulo: Saraiva Educação, 2018.
- Para assédio moral: cite HIRIGOYEN, Marie-France. Assédio Moral: a violência perversa no cotidiano. Rio de Janeiro: Bertrand Brasil, 2000; BARRETO, Margarida. Uma jornada de humilhações. São Paulo: FAPESP, 2000; VENOSA, Sílvio de Salvo. Direito Civil: Responsabilidade Civil. 17. ed. São Paulo: Atlas, 2017. Transcreva trechos longos com aspas.
- Para responsabilidade civil: cite CAVALIERI FILHO, Sérgio. Programa de Responsabilidade Civil. 12. ed. São Paulo: Atlas, 2015.
- Sempre que citar doutrina, transcreva o trecho relevante entre aspas e adicione (G.N.).

ASSÉDIO MORAL — SEÇÃO ESPECIAL: Esta seção DEVE ter no mínimo 8 parágrafos incluindo: definição doutrinária (Hirigoyen + Barreto), tipos de assédio (vertical e horizontal), fundamentos constitucionais (art. 1° III e IV, art. 5° X da CF/88), arts. 186, 187 e 927 do CC/2002 transcritos, arts. 223-A ao 223-G da CLT transcritos INTEGRALMENTE (com todos os incisos do 223-G), doutrina de Venosa sobre quantum indenizatório (com transcrição longa), caráter pedagógico e sancionatório da condenação, e pedido com classificação da ofensa (leve/média/grave/gravíssima) e cálculo em múltiplos do salário.

CÁLCULOS — FORMATO EXATO: mostre passo a passo com os valores do caso concreto. Ex.: "R$ 1.300,00 ÷ 220h = R$ 5,90/hora × 192h extras mensais × 1,50 = R$ 1.699,20 de integração mensal". Sempre mencione o total em R$ por extenso: "no montante de R$ 20.574,57 (vinte mil, quinhentos e setenta e quatro reais e cinquenta e sete centavos)".

EXTENSÃO MÍNIMA: cada tópico do mérito deve ter ao menos 6 parágrafos. A petição completa não deve ter menos de 20 páginas equivalentes. Não corte a fundamentação. Não resuma jurisprudências — transcreva ementas inteiras.

FORMATO DE TEXTO: texto CORRIDO nos fatos e na fundamentação. ZERO bullets ou listas nos argumentos jurídicos. Parágrafos completos e densos. Apenas os pedidos finais e o sumário usam numeração.`,
  },
  {
    nome: 'Direito Previdenciário',
    tipoCaso: 'previdenciario',
    promptSistema: `Você é um advogado especialista em direito previdenciário brasileiro com vasta experiência em benefícios do INSS.

Com base nos dados fornecidos, redija uma petição inicial COMPLETA de ação previdenciária para ser apresentada na Justiça Federal, seguindo a estrutura:

EXMO(A). SR(A). JUIZ(A) FEDERAL DA ___ VARA FEDERAL/PREVIDENCIÁRIA DE ___

[Qualificação do autor]

AÇÃO DE CONCESSÃO/REVISÃO DE BENEFÍCIO PREVIDENCIÁRIO

em face do INSTITUTO NACIONAL DO SEGURO SOCIAL – INSS

I – DOS FATOS
[Histórico previdenciário do segurado, tentativas administrativas, negativa do INSS]

II – DO DIREITO
[Fundamentos: Lei 8.213/91, Decreto 3.048/99, CF/88 art. 201, jurisprudência do STJ/TRF]

III – DOS PEDIDOS
[Concessão/revisão do benefício, diferenças, juros, correção monetária, custas]

IV – DO VALOR DA CAUSA
[12 × valor da renda mensal estimada + parcelas em atraso]

V – DAS PROVAS
[Documentação previdenciária, laudos médicos, testemunhos]

VI – REQUERIMENTOS FINAIS
[Citação do INSS, tutela antecipada se cabível, benefícios da justiça gratuita]

Use linguagem jurídica formal. Cite a Lei 8.213/91, Decreto 3.048/99, Súmulas do STJ e jurisprudência pertinente.`,
  },
  {
    nome: 'Direito do Consumidor',
    tipoCaso: 'consumidor',
    promptSistema: `Você é um advogado especialista em direito do consumidor com profundo conhecimento do CDC (Lei 8.078/90).

Com base nos dados fornecidos, redija uma petição inicial COMPLETA a ser apresentada no Juizado Especial Cível ou Vara Cível competente:

EXMO(A). SR(A). JUIZ(A) DO JUIZADO ESPECIAL CÍVEL / VARA CÍVEL DE ___

[Qualificação do autor/consumidor]

AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS c/c OBRIGAÇÃO DE FAZER

em face de [FORNECEDOR/EMPRESA]

I – DOS FATOS
[Relação de consumo, problema ocorrido, tentativas de resolução extrajudicial]

II – DO DIREITO
[CDC arts. pertinentes, teoria da responsabilidade objetiva, dano moral in re ipsa quando cabível]

III – DOS PEDIDOS
[Reparação de danos materiais, danos morais, obrigação de fazer/não fazer, tutela antecipada]

IV – DO VALOR DA CAUSA

V – DAS PROVAS

VI – REQUERIMENTOS

Use o CDC (Lei 8.078/90), CF/88 art. 5º X, jurisprudência do STJ e Súmulas pertinentes.`,
  },
  {
    nome: 'Direito Civil',
    tipoCaso: 'civel',
    promptSistema: `Você é um advogado especialista em direito civil brasileiro com amplo conhecimento do Código Civil de 2002.

Com base nos dados fornecidos, redija uma petição inicial COMPLETA de ação cível:

EXMO(A). SR(A). JUIZ(A) DE DIREITO DA ___ VARA CÍVEL DE ___

[Qualificação completa do autor]

[TIPO DE AÇÃO: Ação de Indenização / Ação de Cobrança / Ação de Obrigação de Fazer, etc.]

em face de [RÉU]

I – DOS FATOS

II – DO DIREITO
[CC/2002, CF/88, jurisprudência do STJ, Súmulas aplicáveis]

III – DOS PEDIDOS
[Pedidos específicos, tutela antecipada se aplicável]

IV – DO VALOR DA CAUSA

V – DAS PROVAS

VI – REQUERIMENTOS FINAIS

Use linguagem jurídica formal. Cite o CC/2002, CPC/2015, CF/88 e jurisprudência pertinente.`,
  },
  {
    nome: 'Outros / Geral',
    tipoCaso: 'outros',
    promptSistema: `Você é um advogado generalista brasileiro com experiência em diversas áreas do direito.

Com base nos dados fornecidos pelo cliente, redija uma petição inicial COMPLETA e PROFISSIONAL adequada ao tipo de caso descrito.

Estruture a petição com:
- Endereçamento ao juízo competente
- Qualificação das partes
- I – DOS FATOS (narração cronológica e detalhada)
- II – DO DIREITO (fundamentação jurídica com legislação e jurisprudência)
- III – DOS PEDIDOS (lista completa e específica)
- IV – DO VALOR DA CAUSA
- V – DAS PROVAS
- VI – DOS REQUERIMENTOS FINAIS

Use linguagem jurídica formal e técnica brasileira. Identifique a área do direito mais adequada e cite os dispositivos legais pertinentes.`,
  },
]

const perguntasTrabalhista = [
  // Seção 1 — Seus dados (2 perguntas)
  { ordem: 1,  secao: 'Seus dados',                  texto: 'Qual o seu nome completo?', tipo: 'texto_curto', obrigatoria: true,  placeholder: 'Nome completo', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 2,  secao: 'Seus dados',                  texto: 'Insira um número de contato com WhatsApp reserva (pode ser de algum familiar ou amigo)\nObs.: Precisamos do DDD, número e o nome — Ex: (11) 99223-8873 telefone de Irineu, meu irmão', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: (11) 99223-8873 telefone de Maria, minha irmã', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },

  // Seção 2 — A empresa (3 perguntas)
  { ordem: 3,  secao: 'A empresa',                   texto: 'Qual o nome da empresa que trabalhava e o endereço de lá?', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Nome da empresa e endereço completo', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 4,  secao: 'A empresa',                   texto: 'Qual era o endereço que você efetivamente prestava seus serviços? (logradouro, número, bairro, cidade, estado e CEP)', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: Rua das Flores, 123, Centro, São Paulo - SP, CEP 01001-000', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 5,  secao: 'A empresa',                   texto: 'Para qual função você foi contratado?', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: Auxiliar Administrativo, Operador de Caixa...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },

  // Seção 3 — Período de trabalho (2 perguntas)
  { ordem: 6,  secao: 'Período de trabalho',         texto: 'Qual a data que você iniciou o trabalho?', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 7,  secao: 'Período de trabalho',         texto: 'Qual foi o seu último dia de trabalho?', tipo: 'data', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },

  // Seção 4 — Suas atividades (2 perguntas)
  { ordem: 8,  secao: 'Suas atividades',             texto: 'Detalhe todas as atividades que você desempenhava desde o seu horário de chegada até o horário de saída:', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Descreva cada atividade na ordem em que ocorriam durante o dia...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 9,  secao: 'Suas atividades',             texto: 'Qual era o seu horário de trabalho? Especifique os dias da semana e os horários de entrada e saída:', tipo: 'texto_longo', obrigatoria: true, placeholder: 'Ex: Segunda a sexta das 8h às 18h, sábado das 8h às 12h', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },

  // Seção 5 — Jornada e horas (4 perguntas)
  { ordem: 10, secao: 'Jornada e horas',             texto: 'Você tinha algum tipo de controle de jornada (assinava/batia ponto)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Era manual ou eletrônico?' },
  { ordem: 11, secao: 'Jornada e horas',             texto: 'Se você trabalhava à noite, recebia adicional noturno? (Caso não trabalhe à noite, responda "Não")', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 12, secao: 'Jornada e horas',             texto: 'Você trabalhava durante feriados?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quais feriados você trabalhou?' },
  { ordem: 13, secao: 'Jornada e horas',             texto: 'Você fazia horas extras?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quantas horas por semana e recebia por elas?' },

  // Seção 6 — Intervalo e descanso (2 perguntas)
  { ordem: 14, secao: 'Intervalo e descanso',        texto: 'Você tinha intervalo para refeição e descanso?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'De quanto tempo era o intervalo?' },
  { ordem: 15, secao: 'Intervalo e descanso',        texto: 'Durante o seu intervalo você ficava descansando ou realizava algum trabalho para a empresa?', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Descreva o que fazia durante o período de intervalo...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },

  // Seção 7 — Salário e pagamento (5 perguntas)
  { ordem: 16, secao: 'Salário e pagamento',         texto: 'Qual era o valor do seu salário?', tipo: 'texto_curto', obrigatoria: true, placeholder: 'Ex: R$ 2.500,00 por mês', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 17, secao: 'Salário e pagamento',         texto: 'Você recebia os pagamentos em mãos (espécie) ou em conta bancária?', tipo: 'opcoes', obrigatoria: true, placeholder: '', opcoes: '["Em espécie (dinheiro)","Em conta bancária","Parte em espécie, parte em conta"]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 18, secao: 'Salário e pagamento',         texto: 'Você recebia comissões, gratificações ou adicionais?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Especifique o valor e o tipo:' },
  { ordem: 19, secao: 'Salário e pagamento',         texto: 'Recebia pagamento a mais (por fora) ou valores que não constavam no contracheque?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Qual valor recebia por fora e com que frequência?' },
  { ordem: 20, secao: 'Salário e pagamento',         texto: 'Recebia algum tipo de ajuda de custo, como transporte, alimentação ou moradia?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Que tipo de ajuda e qual o valor?' },

  // Seção 8 — Férias (2 perguntas)
  { ordem: 21, secao: 'Férias',                      texto: 'Você já tirou férias da empresa?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Informe as datas e os valores recebidos:' },
  { ordem: 22, secao: 'Férias',                      texto: 'Houve situações em que você vendeu parte das férias (abono pecuniário)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quantos dias vendeu e qual valor recebeu?' },

  // Seção 9 — Mudanças e irregularidades (5 perguntas)
  { ordem: 23, secao: 'Mudanças e irregularidades',  texto: 'Você teve que arcar com despesas relacionadas ao trabalho, como compra de uniformes, ferramentas ou transporte?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Descreva quais despesas e os valores aproximados:' },
  { ordem: 24, secao: 'Mudanças e irregularidades',  texto: 'Você teve alguma redução em seu salário?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Especifique de quanto foi a redução:' },
  { ordem: 25, secao: 'Mudanças e irregularidades',  texto: 'Você teve alguma alteração em seu horário de trabalho?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Especifique qual foi a mudança:' },
  { ordem: 26, secao: 'Mudanças e irregularidades',  texto: 'A empresa atrasava ou deixava de pagar salários?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quais meses estão atrasados ou não foram pagos?' },
  { ordem: 27, secao: 'Mudanças e irregularidades',  texto: 'Alguma outra pessoa da empresa recebia benefícios que você não recebia?', tipo: 'sim_nao', obrigatoria: false, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Qual a função dessa pessoa e o que ela recebia?' },

  // Seção 10 — Condições de trabalho (6 perguntas)
  { ordem: 28, secao: 'Condições de trabalho',       texto: 'Você recebeu equipamentos de proteção individual (EPI)?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quando e quais EPIs recebeu?' },
  { ordem: 29, secao: 'Condições de trabalho',       texto: 'Trabalhava com exposição a produtos químicos?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Quais produtos químicos?' },
  { ordem: 30, secao: 'Condições de trabalho',       texto: 'Trabalhava com exposição a frio ou calor excessivo?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Descreva como era o trabalho:' },
  { ordem: 31, secao: 'Condições de trabalho',       texto: 'Trabalhava com exposição a máquinas com ruído excessivo?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Como era o trabalho?' },
  { ordem: 32, secao: 'Condições de trabalho',       texto: 'Trabalhava com exposição a produtos inflamáveis ou eletricidade?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 33, secao: 'Condições de trabalho',       texto: 'Já sofreu algum acidente ou adoeceu em razão do trabalho? A empresa prestou assistência?', tipo: 'sim_nao', obrigatoria: true, placeholder: '', opcoes: '[]', campoDetalhe: true,  detalheLabel: 'Descreva o que ocorreu e como a empresa agiu:' },

  // Seção 11 — Para finalizar (2 perguntas)
  { ordem: 34, secao: 'Para finalizar',              texto: 'Você já se sentiu desconfortável ou desrespeitado(a) por alguém no local de trabalho? Descreva a situação.', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Descreva situações de assédio moral, discriminação ou constrangimento...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
  { ordem: 35, secao: 'Para finalizar',              texto: 'Se tiver mais alguma informação relevante, favor nos informar abaixo:', tipo: 'texto_longo', obrigatoria: false, placeholder: 'Qualquer informação adicional que possa ser relevante para o seu caso...', opcoes: '[]', campoDetalhe: false, detalheLabel: '' },
]

async function main() {
  console.log('Iniciando seed do banco de dados...')

  const senhaHash = await bcrypt.hash('admin123', 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@juridico.com' },
    update: {},
    create: {
      email: 'admin@juridico.com',
      nome: 'Administrador',
      senha: senhaHash,
      role: 'superadmin',
    },
  })
  console.log('✓ Admin criado: admin@juridico.com / admin123')

  for (const ctx of contextos) {
    await prisma.contextoPeticao.upsert({
      where: { tipoCaso: ctx.tipoCaso },
      update: { nome: ctx.nome, promptSistema: ctx.promptSistema },
      create: ctx,
    })
  }
  console.log('✓ Contextos de petição criados')

  // Garante que configs Claude existentes tenham maxTokens adequado
  await prisma.claudeConfig.updateMany({
    where: { maxTokens: { lt: 16000 } },
    data: { maxTokens: 16000 },
  })
  console.log('✓ ClaudeConfig: maxTokens atualizado para 16000')

  // Upsert todos os templates com descrição
  const descricoes: Record<string, { nome: string; descricao: string }> = {
    trabalhista:    { nome: 'Direito Trabalhista',    descricao: 'Rescisão, horas extras, verbas trabalhistas, assédio' },
    previdenciario: { nome: 'Direito Previdenciário', descricao: 'Aposentadoria, INSS, auxílio-doença, BPC' },
    consumidor:     { nome: 'Direito do Consumidor',  descricao: 'Cobranças indevidas, produto defeituoso, serviços' },
    civel:          { nome: 'Direito Civil',           descricao: 'Contratos, danos morais, indenizações, cobranças' },
    outros:         { nome: 'Outros',                  descricao: 'Demais áreas do direito' },
  }
  for (const [tipoCaso, { nome, descricao }] of Object.entries(descricoes)) {
    await prisma.formularioTemplate.upsert({
      where: { tipoCaso },
      update: { nome, descricao, ativo: true },
      create: { tipoCaso, nome, descricao, ativo: true },
    })
  }

  const templateTrabalhista = await prisma.formularioTemplate.upsert({
    where: { tipoCaso: 'trabalhista' },
    update: { nome: 'Direito Trabalhista', ativo: true },
    create: { nome: 'Direito Trabalhista', tipoCaso: 'trabalhista', ativo: true },
  })
  await prisma.perguntaFormulario.deleteMany({ where: { templateId: templateTrabalhista.id } })
  await prisma.perguntaFormulario.createMany({
    data: perguntasTrabalhista.map((p) => ({ ...p, templateId: templateTrabalhista.id })),
  })
  console.log('✓ Formulário trabalhista criado com 35 perguntas em 11 seções')

  // Demo escritório
  const escritorioHash = await bcrypt.hash('escritorio123', 12)
  const escritorio = await prisma.escritorio.upsert({
    where: { email: 'demo@escritorio.com' },
    update: {},
    create: {
      nome: 'Escritório Oliveira & Associados',
      cnpj: '12.345.678/0001-99',
      email: 'demo@escritorio.com',
      senha: escritorioHash,
      plano: 'profissional',
      tokenLimit: 500000,
    },
  })

  await prisma.usuarioEscritorio.upsert({
    where: { email: 'advogado@escritorio.com' },
    update: {},
    create: {
      escritorioId: escritorio.id,
      nome: 'Dr. Carlos Oliveira',
      email: 'advogado@escritorio.com',
      senha: await bcrypt.hash('adv123', 12),
      role: 'admin_escritorio',
    },
  })
  console.log('✓ Escritório demo criado: demo@escritorio.com / escritorio123')
  console.log('  Advogado demo: advogado@escritorio.com / adv123')

  // Dados de teste: formulários + petições vinculados ao escritório demo
  const dadosTeste = [
    {
      form: {
        nome: 'João Pedro Santos', cpf: '123.456.789-01', email: 'joao.santos@gmail.com', telefone: '(11) 98765-4321',
        tipoCaso: 'trabalhista', escritorioId: escritorio.id,
        descricao: `Qual o nome da empresa que trabalhava e o endereço de lá?\n→ Supermercados Bonfim LTDA - Av. Brasil, 1500, Santo André - SP\n\nQual era o seu cargo/função?\n→ Operador de Caixa\n\nQual a data que você iniciou o trabalho?\n→ 2021-03-15\n\nQual foi o seu último dia de trabalho?\n→ 2024-01-10\n\nQual era o valor do seu salário?\n→ R$ 2.200,00 por mês\n\nVocê fazia horas extras?\n→ Sim\n→ Detalhes: Trabalhava cerca de 2 horas extras por dia, de segunda a sábado, sem receber nenhuma compensação.\n\nVocê tinha intervalo para refeição e descanso?\n→ Sim\n→ Detalhes: Apenas 20 minutos, apesar da jornada de 10 horas diárias.\n\nA empresa atrasava ou deixava de pagar salários?\n→ Sim\n→ Detalhes: Nos últimos 3 meses (outubro, novembro e dezembro/2023) o salário foi pago com mais de 10 dias de atraso.\n\nDescreva todas as atividades que você desempenhava:\n→ Operação de caixa registradora, atendimento ao cliente, organização de gôndolas, recebimento de mercadorias e abertura/fechamento do caixa.`,
        dadosExtra: '{}', status: 'concluido',
      },
      peticao: {
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ___ª VARA DO TRABALHO DE SANTO ANDRÉ - SP

JOÃO PEDRO SANTOS, brasileiro, solteiro, operador de caixa, inscrito no CPF sob nº 123.456.789-01, residente e domiciliado em Santo André - SP, vem, respeitosamente, à presença de Vossa Excelência, propor:

RECLAMAÇÃO TRABALHISTA, PELO RITO ORDINÁRIO

Em face de SUPERMERCADOS BONFIM LTDA, pessoa jurídica de direito privado, com sede na Av. Brasil, 1500, Santo André - SP.

I – DOS FATOS

O reclamante foi admitido em 15/03/2021 na função de Operador de Caixa, com salário de R$ 2.200,00 mensais. Durante todo o período contratual, a empresa o submeteu a jornadas de 10 horas diárias, de segunda a sábado, sem o pagamento de horas extras.

O intervalo intrajornada era reduzido a apenas 20 minutos, em flagrante violação ao art. 71 da CLT, que exige intervalo mínimo de 1 hora para jornadas superiores a 6 horas.

Nos últimos três meses de contrato, outubro, novembro e dezembro de 2023, os salários foram pagos com atraso superior a 10 dias, em violação ao art. 459, §1º da CLT.

II – DO DIREITO

Art. 59 da CLT – Horas extras limitadas a 2h diárias com adicional de 50%.
Art. 71 da CLT – Intervalo intrajornada mínimo de 1 hora.
Súmula nº 437 do TST – Intervalo intrajornada. Não concessão ou redução.

III – DOS PEDIDOS

a) Horas extras: 2h/dia × 315 dias úteis × R$ 13,75/hora × 1,5 = R$ 13.012,50;
b) Reflexos das horas extras em DSR, férias e 13º salário;
c) Intervalo intrajornada não concedido: art. 71, §4º CLT;
d) Multa por atraso salarial: art. 467 da CLT;
e) FGTS + multa de 40% sobre os depósitos;
f) Honorários advocatícios de 15%.

IV – DO VALOR DA CAUSA: R$ 25.000,00

Nestes termos, pede deferimento.

Santo André - SP, ${new Date().toLocaleDateString('pt-BR')}.`,
        tokensUsados: 1850, modeloUsado: 'claude-sonnet-4-5',
      },
    },
    {
      form: {
        nome: 'Maria Eduarda Costa', cpf: '987.654.321-00', email: 'mariaeduarda@outlook.com', telefone: '(21) 97654-3210',
        tipoCaso: 'trabalhista', escritorioId: escritorio.id,
        descricao: `Qual o nome da empresa?\n→ Clínica Saúde Total LTDA - Rua das Palmeiras, 350, Rio de Janeiro - RJ\n\nQual era o seu cargo?\n→ Técnica de Enfermagem\n\nData de admissão:\n→ 2020-06-01\n\nÚltimo dia de trabalho:\n→ 2024-02-28\n\nSalário:\n→ R$ 3.500,00 mensais\n\nVocê trabalhava à noite?\n→ Sim\n→ Detalhes: Fazia plantões noturnos 3x por semana, das 19h às 7h do dia seguinte, sem receber adicional noturno.\n\nTrabalhava com exposição a produtos químicos?\n→ Sim\n→ Detalhes: Manipulação diária de medicamentos e desinfetantes sem receber adicional de insalubridade.\n\nRecebeu equipamentos de proteção individual (EPI)?\n→ Não`,
        dadosExtra: '{}', status: 'concluido',
      },
      peticao: {
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ___ª VARA DO TRABALHO DO RIO DE JANEIRO - RJ

MARIA EDUARDA COSTA, brasileira, solteira, técnica de enfermagem, inscrita no CPF sob nº 987.654.321-00, vem propor:

RECLAMAÇÃO TRABALHISTA, PELO RITO ORDINÁRIO

Em face de CLÍNICA SAÚDE TOTAL LTDA, com sede na Rua das Palmeiras, 350, Rio de Janeiro - RJ.

I – DOS FATOS

A reclamante foi admitida em 01/06/2020 na função de Técnica de Enfermagem, com salário de R$ 3.500,00. Durante o vínculo, realizava plantões noturnos 3 vezes por semana, no período das 19h às 7h, sem recebimento de adicional noturno previsto no art. 73 da CLT.

Além disso, a reclamante manipulava diariamente produtos químicos como desinfetantes e medicamentos, em condições insalubres, sem receber o adicional de insalubridade e sem o fornecimento de EPIs adequados.

II – DO DIREITO

Art. 73 da CLT – Adicional noturno de 20% sobre a hora diurna.
NR-15 da Portaria MTE – Atividades e operações insalubres.
Art. 189 da CLT – Adicional de insalubridade.
Súmula nº 47 do TST – Insalubridade. Adicional.

III – DOS PEDIDOS

a) Adicional noturno de 20% sobre as horas trabalhadas no período das 22h às 5h;
b) Adicional de insalubridade em grau máximo (40%) sobre o salário mínimo;
c) Reflexos em 13º salário, férias e FGTS;
d) Indenização pelo não fornecimento de EPIs;
e) FGTS + multa de 40%;
f) Honorários advocatícios.

IV – DO VALOR DA CAUSA: R$ 42.000,00

Nestes termos, pede deferimento.

Rio de Janeiro - RJ, ${new Date().toLocaleDateString('pt-BR')}.`,
        tokensUsados: 2100, modeloUsado: 'claude-sonnet-4-5',
      },
    },
    {
      form: {
        nome: 'Roberto Almeida Ferreira', cpf: '456.789.123-55', email: 'roberto.ferreira@gmail.com', telefone: '(31) 96543-2109',
        tipoCaso: 'consumidor', escritorioId: escritorio.id,
        descricao: `Qual o nome da empresa?\n→ Banco Digital FastPay S.A.\n\nDescreva o problema:\n→ Tive meu cartão clonado e a empresa não me restituiu os valores.\n\nValor do prejuízo:\n→ R$ 4.800,00 em compras não reconhecidas\n\nVocê entrou em contato com a empresa?\n→ Sim\n→ Detalhes: Liguei 3 vezes e abri 2 protocolos. A empresa nega a clonagem e se recusa a estornar.\n\nTem documentos comprobatórios?\n→ Sim\n→ Detalhes: Extratos bancários, boletim de ocorrência e histórico de protocolos de atendimento.`,
        dadosExtra: '{}', status: 'concluido',
      },
      peticao: {
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE BELO HORIZONTE - MG

ROBERTO ALMEIDA FERREIRA, brasileiro, inscrito no CPF sob nº 456.789.123-55, residente em Belo Horizonte - MG, vem propor:

AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS C/C REPETIÇÃO DE INDÉBITO

Em face de BANCO DIGITAL FASTPAY S.A.

I – DOS FATOS

O autor é titular de conta corrente junto ao réu. Em data recente, identificou em seu extrato transações não reconhecidas no valor total de R$ 4.800,00, oriundas de clonagem de seu cartão de débito.

O autor imediatamente comunicou o banco, abrindo dois protocolos de atendimento. Contudo, o réu se recusou a efetuar o estorno, alegando que as transações teriam sido realizadas pelo próprio titular, o que é terminantemente falso.

II – DO DIREITO

Art. 14 do CDC – Responsabilidade objetiva do fornecedor de serviços.
Súmula nº 479 do STJ – Bancos respondem por fraudes praticadas por terceiros.
Art. 927 do CC/2002 – Obrigação de reparar o dano.

III – DOS PEDIDOS

a) Devolução em dobro dos valores indevidamente debitados: R$ 9.600,00 (art. 42, parágrafo único do CDC);
b) Indenização por danos morais: R$ 5.000,00;
c) Honorários advocatícios.

IV – DO VALOR DA CAUSA: R$ 14.600,00

Nestes termos, pede deferimento.

Belo Horizonte - MG, ${new Date().toLocaleDateString('pt-BR')}.`,
        tokensUsados: 1650, modeloUsado: 'claude-sonnet-4-5',
      },
    },
    {
      form: {
        nome: 'Ana Lúcia Monteiro', cpf: '321.654.987-44', email: 'analucia.monteiro@hotmail.com', telefone: '(85) 95432-1098',
        tipoCaso: 'previdenciario', escritorioId: escritorio.id,
        descricao: `Problema:\n→ Benefício de auxílio-doença negado pelo INSS\n\nData da perícia:\n→ 2024-03-20\n\nDiagnóstico:\n→ Hérnia de disco lombar L4-L5 com compressão radicular, CID M51.1\n\nTempo de contribuição:\n→ 18 anos\n\nÚltima contribuição:\n→ 2024-02-29\n\nEm que trabalha?\n→ Auxiliar de limpeza em hospital, com esforço físico intenso`,
        dadosExtra: '{}', status: 'concluido',
      },
      peticao: {
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA ___ª VARA PREVIDENCIÁRIA DE FORTALEZA - CE

ANA LÚCIA MONTEIRO, brasileira, inscrita no CPF sob nº 321.654.987-44, residente em Fortaleza - CE, vem propor:

AÇÃO DE CONCESSÃO DE BENEFÍCIO PREVIDENCIÁRIO – AUXÍLIO-DOENÇA

Em face do INSTITUTO NACIONAL DO SEGURO SOCIAL – INSS.

I – DOS FATOS

A autora é segurada do INSS com 18 anos de contribuição, exercendo a função de Auxiliar de Limpeza em ambiente hospitalar, atividade que exige esforço físico intenso e repetitivo.

Portadora de hérnia de disco lombar L4-L5 com compressão radicular (CID M51.1), a autora foi submetida à perícia médica em 20/03/2024, tendo o benefício de auxílio-doença negado, em decisão que desconsidera a gravidade de sua incapacidade laboral documentada por laudos médicos.

II – DO DIREITO

Art. 59 da Lei 8.213/91 – Auxílio-doença é devido ao segurado que ficar incapaz para o trabalho por mais de 15 dias consecutivos.
Art. 42 da Lei 8.213/91 – Requisitos da aposentadoria por invalidez.

III – DOS PEDIDOS

a) Concessão do auxílio-doença a partir da data do requerimento administrativo;
b) Pagamento das parcelas em atraso com correção monetária e juros;
c) Tutela antecipada para imediata implantação do benefício;
d) Honorários advocatícios.

IV – DO VALOR DA CAUSA: R$ 15.000,00

Nestes termos, pede deferimento.

Fortaleza - CE, ${new Date().toLocaleDateString('pt-BR')}.`,
        tokensUsados: 1920, modeloUsado: 'claude-sonnet-4-5',
      },
    },
  ]

  for (const { form, peticao: pet } of dadosTeste) {
    const existente = await prisma.clienteForm.findFirst({ where: { cpf: form.cpf, escritorioId: escritorio.id } })
    if (!existente) {
      const formulario = await prisma.clienteForm.create({ data: form })
      await prisma.peticao.create({ data: { ...pet, formularioId: formulario.id } })
    }
  }
  console.log('✓ 4 registros de teste criados (formulários + petições vinculados ao escritório demo)')

  console.log('\nSeed concluído com sucesso!')
  console.log('Admin: http://localhost:3000/admin (admin@juridico.com / admin123)')
  console.log('Portal: http://localhost:3000/portal/login (demo@escritorio.com / escritorio123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
