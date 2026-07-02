import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const escritorio = await prisma.escritorio.findFirst({ where: { email: 'demo@escritorio.com' } })
  if (!escritorio) { console.error('Escritório demo não encontrado. Rode o seed principal primeiro.'); return }

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const exemplos = [
    // ─── EXEMPLO 1: TRABALHISTA COMPLETO ───
    {
      form: {
        nome: 'Marcos Antônio Silveira',
        cpf: '072.381.920-11',
        email: 'marcos.silveira@gmail.com',
        telefone: '(11) 97823-4561',
        tipoCaso: 'trabalhista',
        escritorioId: escritorio.id,
        dadosExtra: '{}',
        status: 'concluido',
        descricao: `Qual o nome da empresa que trabalhava e o endereço?\n→ Transportadora Norte Sul Ltda., Av. das Indústrias, 4.500, Galpão 12, Guarulhos - SP, CEP 07252-000\n\nQual era o seu cargo?\n→ Motorista de Cargas\n\nData de admissão:\n→ 2019-08-12\n\nÚltimo dia de trabalho:\n→ 2024-03-30\n\nSalário:\n→ R$ 3.800,00\n\nHorário de trabalho:\n→ Segunda a sábado, das 06h às 20h, com apenas 30 minutos de intervalo\n\nFazia horas extras?\n→ Sim. Cerca de 4h por dia, sem receber nenhuma hora extra.\n\nTrabalhou em feriados?\n→ Sim, todos os feriados, sem receber em dobro.\n\nAdicionais noturnos?\n→ Frequentemente saía após as 22h sem receber adicional noturno.\n\nMotivo do desligamento:\n→ Pediu demissão pois a empresa atrasava o salário há 3 meses consecutivos e não recolhia o FGTS há mais de 1 ano.`,
      },
      peticao: {
        tokensUsados: 18420,
        modeloUsado: 'claude-sonnet-4-6',
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA __ª VARA DO TRABALHO DE GUARULHOS - SP

MARCOS ANTÔNIO SILVEIRA, brasileiro, solteiro, motorista de cargas, inscrito no CPF/MF sob nº 072.381.920-11, residente e domiciliado em Guarulhos - SP, por intermédio de seus patronos infra-assinados (procuração anexa), com endereço profissional indicado no rodapé, nos moldes do art. 77, V do CPC/15, vem, respeitosamente, à presença de Vossa Excelência, com fulcro no art. 840, caput e §1° da CLT, propor:

RECLAMAÇÃO TRABALHISTA, PELO RITO ORDINÁRIO

Em face de TRANSPORTADORA NORTE SUL LTDA., pessoa jurídica de direito privado, com sede na Av. das Indústrias, 4.500, Galpão 12, Guarulhos - SP, CEP 07252-000, pelas razões de fato e de direito a seguir expostas.

SUMÁRIO

1   DO JUÍZO 100% DIGITAL
2   DA GRATUIDADE DA JUSTIÇA
3   DOS FATOS
4   DO MÉRITO
4.1   DA CONVERSÃO EM RESCISÃO INDIRETA
4.2   DA LIQUIDAÇÃO
4.3   DAS HORAS EXTRAS HABITUAIS
4.4   DOS INTERVALOS INTRAJORNADA SUPRIMIDOS
4.5   DO ADICIONAL NOTURNO
4.6   DO TRABALHO EM FERIADOS
4.7   DAS VERBAS RESCISÓRIAS
4.7.1   DO AVISO PRÉVIO INDENIZADO
4.7.2   DO FGTS + MULTA DE 40%
4.7.3   DAS FÉRIAS + 1/3 CONSTITUCIONAL
4.7.4   DA GRATIFICAÇÃO NATALINA
4.7.5   DA MULTA DO ART. 467 DA CLT
4.7.6   DA MULTA DO ART. 477 DA CLT
5   DOS HONORÁRIOS ADVOCATÍCIOS
6   DOS REQUERIMENTOS FINAIS


DO JUÍZO 100% DIGITAL

Desde já, a parte reclamante concorda com a inclusão do processo em epígrafe no instituto "Juízo 100% Digital" e encaminha o seu e-mail e dos advogados mandatários para receber todas as intimações e notificações, a fim de buscar maior celeridade e efetividade da prestação jurisdicional:

TELEFONE DO RECLAMANTE: (11) 97823-4561
ENDEREÇO ELETRÔNICO: marcos.silveira@gmail.com

Diante do exposto, o reclamante declara, para os devidos fins de economia processual e celeridade, que faz a escolha neste ato pelo "Juízo 100% Digital".


DA GRATUIDADE DA JUSTIÇA

O instituto da gratuidade da justiça previsto no art. 98 do CPC e §§3° e 4° do art. 790 da CLT é concedido a toda pessoa natural ou jurídica, brasileira ou estrangeira, com insuficiência de recursos para pagar as custas, despesas processuais e honorários advocatícios, in verbis:

"Art. 98. A pessoa natural ou jurídica, brasileira ou estrangeira, com insuficiência de recursos para pagar as custas, as despesas processuais e os honorários advocatícios têm direito à gratuidade da justiça, na forma da lei."

Além da insuficiência de recursos, a legislação trabalhista também concede o respectivo benefício àqueles que perceberem salário até 40% (quarenta por cento) do limite máximo dos benefícios do Regime Geral da Previdência Social. Considerando o teto do RGPS de R$ 7.786,02 (ano de 2024), o limite de 40% é de R$ 3.114,41. O reclamante percebia salário de R$ 3.800,00, porém, descontados os três meses sem pagamento, sua média efetiva de recebimento ficou muito aquém desse limite.

"Art. 790, §3°. É facultado aos juízes, órgãos julgadores e presidentes dos tribunais do trabalho de qualquer instância conceder, a requerimento ou de ofício, o benefício da gratuidade da justiça, inclusive quanto a traslados e instrumentos, àqueles que perceberem salário igual ou inferior a 40% (quarenta por cento) do limite máximo dos benefícios do Regime Geral de Previdência Social.

§4°. O benefício da gratuidade da justiça será concedido à parte que comprovar insuficiência de recursos para o pagamento das custas do processo."

Insta destacar que, embora o patrono desta ação seja advogado particular, isso não desconfigura sua insuficiência de recursos, conforme preceitua o art. 99, §4°, do CPC:

"§4°. A assistência do requerente por advogado particular não impede a concessão de gratuidade da justiça."

Nesse sentido, a parte reclamante afirma não possuir condições financeiras para arcar com as custas processuais, tampouco os honorários advocatícios, pugnando pelo benefício da gratuidade da justiça, assegurado pelo art. 5°, LXXIV da Constituição Federal: "o Estado prestará assistência jurídica integral e gratuita aos que comprovarem insuficiência de recursos".


DOS FATOS

O reclamante foi contratado pela reclamada em 12 de agosto de 2019 para exercer a função de Motorista de Cargas, com salário mensal de R$ 3.800,00, jornada de segunda a sábado das 06h às 20h, com apenas 30 (trinta) minutos de intervalo intrajornada, em manifesta violação ao art. 71 da CLT que exige, para jornadas superiores a 6 horas, intervalo mínimo de 1 hora.

No curso do contrato, a situação revelou-se ainda mais gravosa. O reclamante realizava habitualmente cerca de 4 (quatro) horas extras diárias, de segunda a sábado, sem receber qualquer remuneração adicional por esse labor excedente. Com frequência, retornava ao pátio da empresa após as 22h, adentrando o período noturno, sem perceber o adicional de 20% previsto no art. 73 da CLT. Nos feriados nacionais e estaduais, era convocado a trabalhar normalmente, sem receber qualquer compensação adicional prevista na Lei 605/49.

Com o passar do tempo, a situação tornou-se insustentável. A partir de janeiro de 2024, a reclamada passou a atrasar sistematicamente o pagamento dos salários, permanecendo em mora por três meses consecutivos — janeiro, fevereiro e março de 2024. Concomitantemente, verificou o reclamante, por meio do extrato do FGTS, que os depósitos relativos ao Fundo de Garantia por Tempo de Serviço não eram recolhidos desde março de 2023, perfazendo mais de 12 meses de inadimplência patronal.

Diante do cenário de mora salarial reiterada e ausência de depósitos do FGTS — ambas constituindo falta grave do empregador nos termos do art. 483, "d" da CLT —, tornando insuportável a manutenção do vínculo empregatício, o reclamante viu-se compelido a solicitar o desligamento em 30 de março de 2024, o que configura, nos termos da jurisprudência sólida do TST, verdadeira rescisão indireta do contrato de trabalho.


DO MÉRITO

DA CONVERSÃO EM RESCISÃO INDIRETA

Conforme narrado nos fatos, o reclamante formulou pedido de demissão em razão das faltas graves cometidas pela reclamada, consistentes no atraso reiterado de salários por três meses consecutivos e na ausência de recolhimento do FGTS por mais de doze meses. Nesse cenário, impõe-se a conversão do pedido de demissão em rescisão indireta, nos moldes do art. 483, "d" da CLT, in verbis:

"Art. 483. O empregado poderá considerar rescindido o contrato e pleitear a devida indenização quando:
[...]
d) não cumprir o empregador as obrigações do contrato; [G.N.]"

Nesse ínterim, o conceito de mora contumaz no pagamento de salários foi sedimentado pela jurisprudência trabalhista por analogia ao art. 2°, §1° do Decreto-Lei n° 368/68, in verbis:

"Art. 2°, §1°. Entende-se por mora contumaz o atraso ou sonegação de salários, por período igual ou superior a 3 (três) meses, sem motivo grave e relevante, excluídas as causas pertinentes ao risco do empreendimento."

A jurisprudência do Colendo Tribunal Superior do Trabalho é uníssona em reconhecer que o não recolhimento do FGTS e o atraso salarial reiterado configuram falta grave do empregador suficiente para ensejar a rescisão indireta. Nesse sentido:

"AGRAVO DE INSTRUMENTO EM RECURSO DE REVISTA. RESCISÃO INDIRETA DO CONTRATO DE TRABALHO. ATRASO NO PAGAMENTO DE SALÁRIOS POR DOIS MESES CONSECUTIVOS. TRANSCENDÊNCIA POLÍTICA RECONHECIDA. A jurisprudência atual e reiterada desta Corte Superior orienta-se no sentido de que o atraso no pagamento do salário por período inferior a três meses configura descumprimento contratual apto a justificar a rescisão indireta do contrato de trabalho pelo empregador, especialmente porque o pagamento do salário figura entre as principais obrigações do empregador no âmbito do contrato de trabalho. Recurso de revista de que se conhece e a que se dá provimento. (TST - RR: 10012303220185020072, Relator: Alexandre Luiz Ramos, 4ª Turma, Data de Publicação: 09/10/2020). [G.N.]"

"RESCISÃO INDIRETA. CONVERSÃO DO PEDIDO DE DEMISSÃO. RECOLHIMENTO IRREGULAR DOS DEPÓSITOS DO FGTS. POSSIBILIDADE. INEXIGÍVEL A IMEDIATIDADE. A jurisprudência majoritária desta Corte adota o entendimento de que a ausência de recolhimento dos depósitos relativos ao FGTS, bem como o seu recolhimento irregular, configura ato faltoso do empregador, situação grave e suficiente para acarretar a rescisão indireta. Ressalte-se, ainda, o entendimento desta Corte no sentido de que o pedido de demissão não obsta o reconhecimento da rescisão indireta. No caso concreto, houve reiterada falta de recolhimento dos depósitos do FGTS, caracterizando o descumprimento das obrigações contratuais pelo empregador (art. 483, d, da CLT). Recurso de revista a que se dá provimento. (TST - RRAg: 225281220185040341, Relator: Katia Magalhães Arruda, 6ª Turma, Data de Publicação: 06/05/2022). [G.N.]"

Diante do exposto, requer a nulidade do pedido de demissão, com a consequente conversão da dissolução contratual em rescisão indireta, nos termos do art. 483, "d" da CLT, com pagamento de todas as verbas rescisórias decorrentes de dispensa imotivada.


DA LIQUIDAÇÃO

Nos termos da Instrução Normativa 41/2018 do TST, os valores da causa e dos pedidos podem ser estimados, não necessitando ser precisos, in verbis:

"Art. 12. Os arts. 840 e 844, §§ 2°, 3° e 5°, da CLT, com as redações dadas pela Lei n° 13.467, de 13 de julho de 2017, não retroagirão, aplicando-se, exclusivamente, às ações ajuizadas a partir de 11 de novembro de 2017."

No que se refere à atualização monetária dos créditos trabalhistas, o Supremo Tribunal Federal, no julgamento da ADC 58, firmou tese vinculante no sentido de que na fase pré-judicial aplica-se o IPCA-E, e a partir da citação aplica-se a taxa SELIC, afastando a aplicação cumulativa de correção monetária e juros de mora. Os valores aqui apresentados são estimativas, sem prejuízo de liquidação definitiva na fase própria.


DAS HORAS EXTRAS HABITUAIS

O reclamante laborava habitualmente das 06h às 20h, de segunda a sábado, perfazendo jornada diária de 14 horas, com apenas 30 minutos de intervalo. Considerando a jornada legal de 8 horas diárias, verificam-se 5h30min de horas extras diárias — 4h excedentes à jornada ordinária e 1h30min relativas ao intervalo suprimido (tratado no tópico seguinte). O direito às horas extras e ao adicional respectivo está positivado nos arts. 58 e 59 da CLT e no art. 7°, XIII da Constituição Federal:

"Art. 59. A duração diária do trabalho poderá ser acrescida de horas extras, em número não excedente de duas, por acordo individual, convenção coletiva ou acordo coletivo de trabalho.
§1°. A remuneração da hora extra será, pelo menos, 50% (cinquenta por cento) superior à da hora normal."

"Art. 7°, XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho."

As horas extras habituais integram a remuneração do empregado para todos os fins, gerando reflexos em DSR, férias, 13° salário e FGTS, conforme a Súmula 376 do TST: "HORAS EXTRAS. LIMITAÇÃO. ART. 59 DA CLT. As horas extras realizadas com habitualidade integram a remuneração do trabalhador, impondo a incidência dos reflexos em todas as parcelas que integrem a remuneração do obreiro."

CÁLCULO ESTIMATIVO — HORAS EXTRAS:
Salário hora: R$ 3.800,00 ÷ 220h = R$ 17,27/hora
Adicional de 50%: R$ 17,27 × 1,50 = R$ 25,91/hora extra
4 horas extras/dia × 26 dias/mês = 104h extras/mês
104h × R$ 25,91 = R$ 2.694,64/mês
R$ 2.694,64 × 55 meses (ago/2019 a mar/2024) = R$ 148.205,20 (estimado)

A jurisprudência do TST é pacífica quanto ao direito às horas extras quando a jornada efetivamente praticada supera o limite legal e não há sistema de compensação válido, conforme:

"RECURSO DE REVISTA. HORAS EXTRAS. JORNADA DE TRABALHO. ÔNUS DA PROVA. O empregador tem o ônus de comprovar, por meio de controles de jornada idôneos, que o empregado cumpria a jornada contratual. A ausência de controle ou a apresentação de cartões de ponto com horários britânicos gera presunção relativa de veracidade das alegações do reclamante. (TST - RR: 1001234-56.2021.5.02.0074, Relator: Min. Mauricio Godinho Delgado, 3ª Turma, Data de Publicação: 15/04/2022). [G.N.]"

Diante do exposto, requer a condenação da reclamada ao pagamento de horas extras à razão de 50% sobre a hora normal, no valor estimado de R$ 148.205,20, acrescido dos reflexos em DSR, férias + 1/3, 13° salário e FGTS.


DOS INTERVALOS INTRAJORNADA SUPRIMIDOS

Conforme narrado, o reclamante dispunha de apenas 30 (trinta) minutos para repouso e alimentação, em flagrante violação ao art. 71 da CLT que, para jornadas superiores a 6 (seis) horas, exige intervalo mínimo de 1 (uma) hora:

"Art. 71. Em qualquer trabalho contínuo, cuja duração exceda de 6 (seis) horas, é obrigatória a concessão de um intervalo para repouso ou alimentação, o período de no mínimo 1 (uma) hora e, salvo acordo escrito ou contrato coletivo em contrário, não poderá exceder de 2 (duas) horas.
§4°. A não concessão ou a concessão parcial do intervalo intrajornada mínimo, para repouso e alimentação, a empregados urbanos e rurais, implica o pagamento, de natureza indenizatória, apenas do período suprimido, com acréscimo de 50% (cinquenta por cento) sobre o valor da remuneração da hora normal de trabalho."

A Súmula 437 do TST consolidou o entendimento sobre o tema, in verbis:
"INTERVALO INTRAJORNADA PARA REPOUSO E ALIMENTAÇÃO. APLICAÇÃO DO ART. 71 DA CLT. I - Após a edição da Lei n° 13.467/2017, não é mais devida a integralidade do período de intervalo não concedido, mas apenas o tempo efetivamente suprimido, com acréscimo de 50%. II - É inválida cláusula de acordo ou convenção coletiva de trabalho contemplando a supressão ou redução do intervalo intrajornada, porque este constitui medida de higiene, saúde e segurança do trabalho."

CÁLCULO ESTIMATIVO — INTERVALO SUPRIMIDO:
Intervalo suprimido: 30 minutos/dia = 0,5h
0,5h × R$ 17,27 (hora normal) × 1,50 = R$ 12,95/dia
R$ 12,95 × 26 dias/mês × 55 meses = R$ 18.518,50 (estimado)

Requer a condenação da reclamada ao pagamento do período de intervalo suprimido, acrescido de 50% sobre a hora normal, no valor estimado de R$ 18.518,50.


DO ADICIONAL NOTURNO

O reclamante frequentemente trabalhava além das 22h, sem perceber o adicional noturno previsto no art. 73 da CLT e no art. 7°, IX da Constituição Federal, in verbis:

"Art. 73. Salvo nos casos de revezamento semanal ou quinzenal, o trabalho noturno terá remuneração superior à do diurno e, para esse efeito, sua remuneração terá um acréscimo de 20% (vinte por cento), pelo menos, sobre a hora diurna.
§1°. A hora do trabalho noturno será computada como de 52 (cinquenta e dois) minutos e 30 (trinta) segundos."

"Art. 7°, IX - remuneração do trabalho noturno superior à do diurno."

A Súmula 60 do TST é categórica: "ADICIONAL NOTURNO. INTEGRAÇÃO NO SALÁRIO E PRORROGAÇÃO EM HORÁRIO NOTURNO. I - O adicional noturno, pago com habitualidade, integra o salário do empregado para todos os efeitos."

CÁLCULO ESTIMATIVO — ADICIONAL NOTURNO:
Estimativa de 3 noites/semana com 1h após as 22h = 12h noturnas/mês
Hora noturna: R$ 17,27 × 1,20 = R$ 20,72
12h × R$ 20,72 × 55 meses = R$ 13.675,20 (estimado)

Requer a condenação ao pagamento do adicional noturno de 20% sobre as horas efetivamente trabalhadas no período das 22h às 5h, no valor estimado de R$ 13.675,20.


DO TRABALHO EM FERIADOS

A Constituição Federal, em seu art. 7°, XV, garante ao trabalhador o "repouso semanal remunerado, preferencialmente aos domingos". O trabalho em feriados civis e religiosos, sem compensação ou pagamento em dobro, viola a Lei n° 605/49:

"Art. 9°. Nas atividades em que não for possível, em virtude das exigências técnicas das empresas, a suspensão do trabalho nos dias feriados civis e religiosos, fica assegurado ao empregado o gozo do feriado, logo após o repouso semanal, quando então será computado como repouso semanal remunerado o dia do feriado gozado."

Estimando-se 10 feriados por ano trabalhados, no período de 55 meses:
10 feriados/ano × 4,58 anos × R$ 17,27 × 2 (dobro) = R$ 1.585,82 (estimado)

Requer a condenação ao pagamento em dobro pelo trabalho realizado em feriados, no valor estimado de R$ 1.585,82.


DAS VERBAS RESCISÓRIAS

DO AVISO PRÉVIO INDENIZADO

Convertida a rescisão em indireta, o reclamante faz jus ao aviso prévio indenizado, calculado nos termos da Lei 12.506/2011:

"Art. 1°. O aviso prévio, de que trata o Capítulo VI do Título IV da Consolidação das Leis do Trabalho - CLT, aprovada pelo Decreto-Lei n° 5.452, de 1° de maio de 1943, será concedido na proporção de 30 (trinta) dias aos empregados que contem até 1 (um) ano de serviço na mesma empresa. Parágrafo único. Ao aviso prévio previsto neste artigo serão acrescidos 3 (três) dias por ano de serviço prestado na mesma empresa, até o máximo de 60 (sessenta) dias, perfazendo um total de até 90 (noventa) dias."

CÁLCULO: 30 dias + (4 anos × 3 dias) = 42 dias
42 dias × (R$ 3.800,00 ÷ 30) = R$ 5.320,00

Valor estimado: R$ 5.320,00.


DO FGTS + MULTA DE 40%

Nos termos do art. 18 da Lei 8.036/90:
"Art. 18. Ocorrendo rescisão do contrato de trabalho, por parte do empregador, ficará este obrigado a depositar na conta vinculada do trabalhador no FGTS os valores relativos aos depósitos referentes ao mês da rescisão e ao imediatamente anterior, que ainda não houver sido recolhido, sem prejuízo das cominações legais.
§1°. Na hipótese de despedida pelo empregador sem justa causa, depositará este, na conta vinculada do trabalhador no FGTS, importância igual a quarenta por cento do montante de todos os valores depositados na conta vinculada durante a vigência do contrato de trabalho, atualizados monetariamente e acrescidos dos respectivos juros."

Depósitos em atraso (13 meses, mar/2023 a mar/2024): 8% × R$ 3.800,00 × 13 = R$ 3.952,00
FGTS sobre toda a vigência: 8% × R$ 3.800,00 × 55 meses = R$ 16.720,00
Multa de 40%: R$ 16.720,00 × 40% = R$ 6.688,00

Valor estimado total: R$ 10.640,00 (depósitos em atraso + multa).


DAS FÉRIAS + 1/3 CONSTITUCIONAL

"Art. 129 da CLT. Todo empregado terá direito anualmente ao gozo de um período de férias, sem prejuízo da remuneração.
Art. 146 da CLT. Na cessação do contrato de trabalho, qualquer que seja a sua causa, será devida ao empregado a remuneração simples ou em dobro, conforme o caso, correspondente ao período de férias cujo direito tenha adquirido."

Período de 55 meses: 4 períodos de férias vencidas + 7/12 de proporcionais.
Férias vencidas (4 × R$ 3.800,00 × 4/3): R$ 20.266,67
Férias proporcionais (7/12 × R$ 3.800,00 × 4/3): R$ 2.948,15

Valor estimado: R$ 23.214,82.


DA GRATIFICAÇÃO NATALINA

Nos termos do art. 1° da Lei 4.090/62: "É instituída a Gratificação de Natal para os trabalhadores, correspondente à remuneração devida em dezembro, de acordo com o tempo de serviço do empregado no ano respectivo."

13° proporcional do ano corrente (3/12 de 2024): R$ 3.800,00 × 3/12 = R$ 950,00.
13° dos anos anteriores integrado às horas extras: incluído nos reflexos.

Valor estimado: R$ 950,00.


DA MULTA DO ART. 467 DA CLT

"Art. 467. Em caso de rescisão de contrato de trabalho, havendo controvérsia sobre o montante das verbas rescisórias, o empregador é obrigado a pagar ao trabalhador, à data do comparecimento à Justiça do Trabalho, a parte incontroversa dessas verbas, sob pena de pagá-las acrescidas de cinquenta por cento."

As verbas rescisórias incontroversa — salários em atraso e FGTS — estimam-se em R$ 15.200,00.
Multa de 50%: R$ 7.600,00.


DA MULTA DO ART. 477 DA CLT

"Art. 477, §8°. A inobservância do disposto no §6° deste artigo sujeitará o infrator à multa de 160 BTN, por trabalhador, bem assim ao pagamento da multa a favor do empregado, em importância equivalente ao seu salário, devidamente corrigido pelo índice de variação do BTN, salvo quando, comprovadamente, o trabalhador der causa à mora."

Multa equivalente a 1 salário: R$ 3.800,00.


DOS HONORÁRIOS ADVOCATÍCIOS

Nos termos do art. 791-A da CLT: "Ao advogado, ainda que atue em causa própria, serão devidos honorários de sucumbência, fixados entre o mínimo de 5% (cinco por cento) e o máximo de 15% (quinze por cento) sobre o valor que resultar da liquidação da sentença, do proveito econômico obtido ou, não sendo possível mensurá-lo, sobre o valor atualizado da causa."

Requer a fixação dos honorários advocatícios em 15% sobre o valor total da condenação, a ser liquidado em fase própria.


DOS REQUERIMENTOS FINAIS

Ante todo o exposto, requer:

1. O benefício da gratuidade da justiça, nos termos dos arts. 98 do CPC e 790, §§3° e 4° da CLT, c/c art. 5°, LXXIV da CF/88;
2. A nulidade do pedido de demissão com conversão em rescisão indireta (art. 483, "d" da CLT);
3. A citação da reclamada para, querendo, apresentar defesa;
4. A condenação da reclamada ao pagamento de horas extras habituais (4h/dia, adicional de 50%): R$ 148.205,20;
5. Reflexos das horas extras em DSR, 13° salário, férias + 1/3 e FGTS: R$ 38.533,35 (estimado);
6. Intervalo intrajornada suprimido (30 minutos/dia, acrescido de 50%): R$ 18.518,50;
7. Adicional noturno de 20% sobre as horas noturnas: R$ 13.675,20;
8. Trabalho em feriados, em dobro: R$ 1.585,82;
9. Aviso prévio indenizado (42 dias): R$ 5.320,00;
10. FGTS dos períodos em atraso + multa de 40% sobre toda a vigência: R$ 10.640,00;
11. Férias vencidas + proporcionais + 1/3 constitucional: R$ 23.214,82;
12. 13° salário proporcional: R$ 950,00;
13. Multa do art. 467 da CLT (50% sobre verbas incontroversa): R$ 7.600,00;
14. Multa do art. 477, §8° da CLT (1 salário): R$ 3.800,00;
15. Atualização monetária de todas as parcelas pelo IPCA-E (fase pré-judicial) e SELIC (a partir da citação), conforme ADC 58/STF;
16. Honorários advocatícios de 15% sobre o valor da condenação (art. 791-A da CLT);
17. Condenação da reclamada ao pagamento das custas processuais.

VALOR DA CAUSA: R$ 272.042,89 (duzentos e setenta e dois mil, quarenta e dois reais e oitenta e nove centavos).

Nestes termos,
Pede deferimento.

Guarulhos - SP, ${hoje}.`,
      },
    },

    // ─── EXEMPLO 2: CONSUMIDOR ───
    {
      form: {
        nome: 'Fernanda Lima Borges',
        cpf: '233.941.870-05',
        email: 'fernanda.borges@hotmail.com',
        telefone: '(21) 98754-3320',
        tipoCaso: 'consumidor',
        escritorioId: escritorio.id,
        dadosExtra: '{}',
        status: 'concluido',
        descricao: `Empresa:\n→ Operadora de Plano de Saúde VitaSaúde S.A.\n\nProblema:\n→ Negativa de cobertura de cirurgia de emergência. A operadora recusou autorizar uma cirurgia de apendicite aguda, alegando "carência". O médico declarou urgência, mas o plano negou.\n\nValor do prejuízo:\n→ Precisou fazer a cirurgia particular: R$ 18.500,00\n\nTentativas de resolução:\n→ 3 ligações para o SAC, protocolo formal de reclamação e abertura de reclamação na ANS. O plano manteve a recusa.`,
      },
      peticao: {
        tokensUsados: 9840,
        modeloUsado: 'claude-sonnet-4-6',
        conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA __ª VARA CÍVEL DE RIO DE JANEIRO - RJ

FERNANDA LIMA BORGES, brasileira, solteira, inscrita no CPF sob nº 233.941.870-05, residente no Rio de Janeiro - RJ, vem, por intermédio de seus patronos, propor:

AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS C/C OBRIGAÇÃO DE FAZER

Em face de VITASAÚDE S.A., operadora de plano de saúde, com sede no Rio de Janeiro - RJ.

SUMÁRIO

1   DOS FATOS
2   DO DIREITO
2.1   DA RESPONSABILIDADE OBJETIVA DA OPERADORA
2.2   DA ILEGALIDADE DA NEGATIVA DE COBERTURA EM URGÊNCIA
2.3   DOS DANOS MATERIAIS
2.4   DOS DANOS MORAIS
3   DOS PEDIDOS
4   DO VALOR DA CAUSA


DOS FATOS

A autora é beneficiária do plano de saúde da ré, contrato vigente e mensalidades em dia. Em março de 2024, foi acometida de dor abdominal aguda e febre, sendo levada às pressas ao pronto-socorro, onde o médico diagnosticou apendicite aguda com risco imediato de perfuração peritonite — quadro de emergência médica que exigia intervenção cirúrgica imediata.

O médico plantonista encaminhou pedido de autorização à operadora VitaSaúde, com laudo atestando urgência e risco de vida. A ré, todavia, negou a autorização alegando que a beneficiária ainda estava em período de carência para cirurgias. Diante da negativa e do risco iminente de morte, a autora viu-se obrigada a realizar a cirurgia em caráter particular, arcando com o valor de R$ 18.500,00 — montante que a família precisou obter por meio de empréstimo bancário.

DO DIREITO

DA RESPONSABILIDADE OBJETIVA DA OPERADORA

A relação entre a autora e a ré é de consumo, regida pelo Código de Defesa do Consumidor (Lei 8.078/90), que estabelece a responsabilidade objetiva do fornecedor de serviços em seu art. 14:

"Art. 14. O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos."

DA ILEGALIDADE DA NEGATIVA DE COBERTURA EM URGÊNCIA

A Lei n° 9.656/98 (Lei dos Planos de Saúde) e as Resoluções da ANS são categóricas: em casos de urgência e emergência, a carência é limitada a 24 horas. A negativa da ré viola frontalmente o art. 35-C da Lei 9.656/98:

"Art. 35-C. É obrigatória a cobertura do atendimento nos casos: I - de emergência, como tal definidos os que implicarem risco imediato de vida ou de lesões irreparáveis para o paciente, caracterizado em declaração do médico assistente; II - de urgência, assim entendidos os resultantes de acidentes pessoais ou de complicações no processo gestacional."

A Súmula 103 do STJ pacificou o entendimento: "Nas relações de consumo entre a operadora de plano de saúde e o beneficiário, é abusiva a cláusula limitativa que exclui cobertura de urgência e emergência."

DOS DANOS MATERIAIS

Os danos materiais correspondem ao valor desembolsado pela autora para realização da cirurgia particular: R$ 18.500,00, devidamente comprovados pelas notas fiscais dos serviços médicos e hospitalares juntadas. Requer restituição integral.

DOS DANOS MORAIS

O dano moral no caso em tela é manifesto e dispensável de prova (in re ipsa). A autora, em situação de risco de vida, teve sua cobertura negada de forma ilegal e abusiva, sendo compelida a enfrentar, em momento de extrema vulnerabilidade, a burocracia da operadora para salvar sua própria vida. A conduta da ré viola o art. 5°, X da Constituição Federal ("são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas") e configura dano extrapatrimonial indenizável nos termos dos arts. 186 e 927 do Código Civil:

"Art. 186. Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."

Considerando a gravidade da conduta, o caráter pedagógico e sancionatório da indenização e a situação econômica das partes, requer fixação do dano moral em R$ 15.000,00.

DOS PEDIDOS

Requer:
1. Em tutela de urgência: obrigação de reembolsar imediatamente os R$ 18.500,00 gastos com a cirurgia;
2. Condenação em danos materiais: R$ 18.500,00 com correção monetária desde o desembolso;
3. Condenação em danos morais: R$ 15.000,00;
4. Honorários advocatícios de 15%;
5. Custas processuais.

DO VALOR DA CAUSA: R$ 33.500,00

Nestes termos, pede deferimento.
Rio de Janeiro - RJ, ${hoje}.`,
      },
    },
  ]

  let criados = 0
  for (const { form, peticao: pet } of exemplos) {
    const existente = await prisma.clienteForm.findFirst({ where: { cpf: form.cpf, escritorioId: escritorio.id } })
    if (!existente) {
      const formulario = await prisma.clienteForm.create({ data: form })
      await prisma.peticao.create({ data: { ...pet, formularioId: formulario.id } })
      criados++
      console.log(`✓ Criado: ${form.nome} (${form.tipoCaso})`)
    } else {
      console.log(`→ Já existe: ${form.nome}`)
    }
  }
  console.log(`\n${criados} registros de exemplo criados com sucesso.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
