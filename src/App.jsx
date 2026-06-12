import { useState, useRef, useEffect } from "react";

// ── Cores e estilos globais ────────────────────────────────────────────────
const C = {
  bg: "#0b0b14",
  surface: "#13131f",
  card: "#1a1a2e",
  border: "rgba(120,80,255,0.2)",
  accent: "#7850ff",
  teal: "#00d4aa",
  text: "#e8e8f0",
  muted: "rgba(232,232,240,0.5)",
  danger: "#ff5068",
  warn: "#ffb830",
  success: "#00d4aa",
};

// ── Motor de respostas inteligentes ───────────────────────────────────────
function parseValor(text) {
  const m = text.match(/R?\$?\s*([\d.,]+)/);
  if (!m) return null;
  return parseFloat(m[1].replace(/\./g, "").replace(",", "."));
}
function fmt(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function gerarResposta(input, gastos, metas, receitas) {
  const t = input.toLowerCase();

  // "Tenho uma sobra de dinheiro, o que faço com ela?" → investimento
  if (/sobra de dinheiro|o que faço com (esse|essa|esses|essas)?\s*dinheiro|onde investir/i.test(t)) {
    return `💡 **Ótima pergunta!**\n\nSe você tem uma sobra e não vai precisar dela tão cedo, algumas opções:\n\n🟢 **Reserva de emergência** (se ainda não tem) — guarde em algo de liquidez diária, como Tesouro Selic ou CDB com liquidez\n🔵 **CDB / Tesouro Direto** — renda fixa, baixo risco, rende mais que a poupança\n🟣 **Investir numa meta** — se você tem um objetivo (viagem, casa), direcione pra lá\n\n📈 Me diga o valor que você tem disponível e por quanto tempo pode deixar guardado, que eu simulo quanto isso pode render!`;
  }

  // "Vale a pena parcelar essa compra?"
  if (/vale a pena parcelar|devo parcelar|parcelar ou (à|a) vista/i.test(t)) {
    const valor = parseValor(t);
    if (valor) {
      const nx = t.match(/(\d+)\s*[xX×]/) ? parseInt(t.match(/(\d+)\s*[xX×]/)[1]) : 12;
      const j = 0.0199;
      const parc = (valor * j * Math.pow(1 + j, nx)) / (Math.pow(1 + j, nx) - 1);
      const total = parc * nx;
      return `💳 **Vale a pena parcelar?**\n\nSe parcelar em **${nx}x** com juros médios de mercado (1,99% a.m.):\n\n• Parcela: R$ ${fmt(parc)}/mês\n• Total pago: R$ ${fmt(total)}\n• Você pagaria **R$ ${fmt(total - valor)} de juros**\n\n👉 Se você tem o valor de R$ ${fmt(valor)} disponível e o vendedor não dá desconto à vista melhor que isso, **parcelar sem juros vale mais a pena que pagar à vista**. Já se tem juros, avalie se compensa esperar e juntar o valor.\n\n💡 Me diga o valor e o número de parcelas reais que eu calculo certinho!`;
    }
    return `💳 **Vale a pena parcelar?**\n\nDepende de 3 coisas:\n\n1️⃣ **Tem juros?** Se sim, quanto maior o juros, menos vale a pena\n2️⃣ **Você tem o dinheiro guardado?** Se sim e o parcelado é sem juros, parcele e deixe seu dinheiro rendendo\n3️⃣ **É algo essencial ou pode esperar?** Compras por impulso geralmente não valem o parcelamento\n\n💡 Me diga o valor, em quantas vezes e se tem juros — eu calculo na hora se compensa!`;
  }

  // "Esse desconto vale a pena mesmo?"
  if (/desconto vale a pena|vale a pena (o |esse |essa )?desconto/i.test(t)) {
    return `🏷️ **Sobre descontos:**\n\nUm desconto só "vale a pena" se você **já ia comprar aquilo de qualquer forma**. Caso contrário, é gasto a mais — mesmo que pareça economia.\n\nPergunta-chave: *"Eu compraria isso pelo preço cheio?"* Se a resposta for não, o desconto não compensa.\n\n💡 Me diga o valor original e o percentual de desconto que eu calculo o valor final e quanto você economiza de fato!`;
  }

  // "Quero entender pra onde meu dinheiro está indo"
  if (/pra onde (meu|o) dinheiro|onde (meu|o) dinheiro (vai|está)|n[ãa]o sei (onde|pra onde)/i.test(t)) {
    const total = gastos.reduce((s, g) => s + g.valor, 0);
    return `📊 **Vamos descobrir juntos!**\n\nVocê já tem **R$ ${fmt(total)}** registrados este mês. Acesse a aba **Dashboard** para ver:\n\n🍩 Gráfico por categoria — onde seu dinheiro mais vai\n📅 Gastos dos últimos 7 dias\n📋 Lista de todas as transações\n\n💡 A partir de agora, toda vez que você me contar um gasto (ex: "gastei R$ 50 no mercado"), eu registro automaticamente — assim você constrói o seu raio-x financeiro sem esforço!`;
  }

  // "Quanto preciso guardar por mês pra chegar numa meta?" / "começar a juntar dinheiro pra um objetivo"
  if (/come[çc]ar a juntar|juntar dinheiro pra (um |uma )?(objetivo|sonho)|quanto preciso guardar/i.test(t)) {
    return `🎯 **Vamos montar seu plano!**\n\nPara eu calcular exatamente quanto você precisa guardar, me responde:\n\n1️⃣ Qual é o objetivo? (ex: viagem, carro, reserva)\n2️⃣ Quanto custa, aproximadamente?\n3️⃣ Em quanto tempo você quer alcançar?\n\nExemplo: *"Quero juntar R$ 6.000 em 8 meses"*\n\nDepois disso, acesse a aba **Metas** para criar e acompanhar o progresso com barra visual! 📈`;
  }

  // Investimento / CDB / rendimento
  if (/cdb|rend[ae]|invest|tesouro|selic|poupan/i.test(t)) {
    const valor = parseValor(t) || 5000;
    const taxaAno = t.match(/(\d+(?:[.,]\d+)?)\s*%/) ? parseFloat(t.match(/(\d+(?:[.,]\d+)?)\s*%/)[1].replace(",", ".")) : 12;
    const meses = t.match(/(\d+)\s*mes/) ? parseInt(t.match(/(\d+)\s*mes/)[1]) : 12;
    const taxaMes = Math.pow(1 + taxaAno / 100, 1 / 12) - 1;
    const montante = valor * Math.pow(1 + taxaMes, meses);
    const rend = montante - valor;
    const aliq = meses <= 6 ? 0.225 : meses <= 12 ? 0.20 : meses <= 24 ? 0.175 : 0.15;
    const ir = rend * aliq;
    const liq = rend - ir;
    return `📈 **Simulação de Investimento**\n\n💵 Aplicado: **R$ ${fmt(valor)}**\n📅 Período: **${meses} meses**\n📊 Taxa: **${taxaAno}% ao ano**\n\n**Resultado:**\n• Montante bruto: R$ ${fmt(montante)}\n• Rendimento bruto: R$ ${fmt(rend)}\n• IR (${(aliq * 100).toFixed(1)}%): -R$ ${fmt(ir)}\n• ✅ Rendimento líquido: **R$ ${fmt(liq)}**\n\n💡 Quanto maior o prazo, menor o IR e maior o lucro!`;
  }

  // Parcelamento
  if (/parcel|prestação/i.test(t)) {
    const valor = parseValor(t) || 1200;
    const nx = t.match(/(\d+)\s*[xX×]/) ? parseInt(t.match(/(\d+)\s*[xX×]/)[1]) : 12;
    const j = (t.match(/(\d+(?:[.,]\d+)?)\s*%/) ? parseFloat(t.match(/(\d+(?:[.,]\d+)?)\s*%/)[1].replace(",", ".")) : 1.99) / 100;
    const parc = (valor * j * Math.pow(1 + j, nx)) / (Math.pow(1 + j, nx) - 1);
    const total = parc * nx;
    return `🧮 **Simulação de Parcelamento**\n\n💵 Valor: **R$ ${fmt(valor)}**\n📅 Parcelas: **${nx}x**\n📊 Juros: **${(j * 100).toFixed(2)}% ao mês**\n\n• Parcela: **R$ ${fmt(parc)}/mês**\n• Total pago: R$ ${fmt(total)}\n• Juros totais: R$ ${fmt(total - valor)}\n\n⚠️ Se possível, negocie desconto à vista ou reduza o número de parcelas!`;
  }

  // Orçamento
  if (/orçamento|salário|quanto sobra|distribu|ganho/i.test(t)) {
    const r = parseValor(t) || 3000;
    return `📊 **Orçamento Mensal — R$ ${fmt(r)}**\n\n*Regra 50-30-20 adaptada:*\n\n🏠 Moradia (30%): R$ ${fmt(r * 0.30)}\n🍽️ Alimentação (20%): R$ ${fmt(r * 0.20)}\n🚗 Transporte (10%): R$ ${fmt(r * 0.10)}\n💊 Saúde (10%): R$ ${fmt(r * 0.10)}\n🎮 Lazer (10%): R$ ${fmt(r * 0.10)}\n💰 Poupança (20%): **R$ ${fmt(r * 0.20)}**\n\n💡 Separe os 20% de poupança logo ao receber — pague-se primeiro!`;
  }

  // Registrar receita/ganho
  if (/ganhei|recebi|caiu|entrou|fatur/i.test(t)) {
    const valor = parseValor(t);
    if (valor) {
      const origem = /bet|aposta|jogo|cassino|loteria/i.test(t) ? "🎲 Apostas" :
        /sal[áa]rio|sal[áa]rio/i.test(t) ? "💼 Salário" :
        /freela|freelance|bico|extra/i.test(t) ? "💻 Freelance" :
        /vend[ai]/i.test(t) ? "🏷️ Venda" :
        /presente|deram|de aniversário/i.test(t) ? "🎁 Presente" : "💰 Outras receitas";
      const totalReceitas = (receitas?.reduce((s, r) => s + r.valor, 0) || 0) + valor;
      const comentario = /bet|aposta|jogo|cassino|loteria/i.test(t)
        ? "\n\n💡 Boa! Que tal já separar uma parte disso pra uma meta, em vez de deixar tudo disponível pra continuar apostando?"
        : "\n\n💡 Já pensou em direcionar uma parte dessa entrada extra pra uma meta ou reserva?";
      return `🟢 **Entrada registrada!**\n\n${origem}: **+R$ ${fmt(valor)}**\nTotal de receitas no mês: **R$ ${fmt(totalReceitas)}**${comentario}\n\n📊 Use a aba **Metas** se quiser guardar parte desse valor com objetivo definido!`;
    }
  }

  // Registrar gasto
  if (/gastei|paguei|comprei|perdi|torrei|queimei|gasto de|fui no|sa[íi]\s/i.test(t)) {
    const valor = parseValor(t);
    if (valor) {
      const cat = /comida|restaurante|lanche|mercado|ifood/i.test(t) ? "🍽️ Alimentação" :
        /uber|gasolina|transporte|ônibus|combustível/i.test(t) ? "🚗 Transporte" :
        /luz|água|internet|aluguel|condomínio/i.test(t) ? "🏠 Moradia" :
        /roupa|calçado|shopping/i.test(t) ? "👕 Vestuário" :
        /jogo|aposta|bet|cassino|loteria/i.test(t) ? "🎲 Apostas" :
        /lazer|cinema|bar|show|viagem/i.test(t) ? "🎮 Lazer" : "📦 Outros";
      const total = gastos.reduce((s, g) => s + g.valor, 0) + valor;
      const comentario = /perdi|torrei|queimei/i.test(t) && /jogo|aposta|bet|cassino/i.test(t)
        ? "\n\n⚠️ Apostas costumam pesar no orçamento sem a gente perceber. Vale acompanhar esse total ao longo do mês."
        : "";
      return `✅ **Gasto registrado no Dashboard!**\n\n${cat}: **R$ ${fmt(valor)}**\nTotal do mês até agora: **R$ ${fmt(total)}**${comentario}\n\n💡 Acesse a aba **Dashboard** para ver seus gráficos atualizados!`;
    }
  }

  // Meta
  if (/meta|objetivo|quero juntar|economizar|guardar|poupar/i.test(t)) {
    const valor = parseValor(t);
    const meses = t.match(/(\d+)\s*(mes|ano)/) ? (t.includes("ano") ? parseInt(t.match(/(\d+)/)[1]) * 12 : parseInt(t.match(/(\d+)/)[1])) : 12;
    if (valor) {
      const pm = valor / meses;
      return `🎯 **Plano de Meta**\n\n🏆 Objetivo: **R$ ${fmt(valor)}**\n📅 Prazo: **${meses} meses**\n\n• Por mês: **R$ ${fmt(pm)}**\n• Por semana: R$ ${fmt(pm / 4.3)}\n• Por dia: R$ ${fmt(pm / 30)}\n\n✅ Vá até a aba **Metas** e adicione esta meta para acompanhar o progresso!\n\n💪 Em ${meses} meses você chega lá — um passo de cada vez!`;
    }
    return `🎯 **Como definir uma meta eficaz:**\n\n1. Seja específico: "R$ 10.000 em 12 meses"\n2. Automatize o depósito mensal\n3. Invista em CDB ou Tesouro para render mais\n4. Celebre cada marco atingido\n\n💡 Me diga o valor e o prazo que calculo tudo para você!`;
  }

  // Desconto
  if (/descont|porcentagem|\d+\s*%/i.test(t)) {
    const nums = [...t.matchAll(/[\d]+(?:[.,]\d+)?/g)].map(m => parseFloat(m[0].replace(",", ".")));
    if (nums.length >= 2) {
      const [valor, pct] = nums;
      const desc = valor * pct / 100;
      return `🔢 **Cálculo de Desconto**\n\n• Original: R$ ${fmt(valor)}\n• Desconto (${pct}%): -R$ ${fmt(desc)}\n• ✅ Final: **R$ ${fmt(valor - desc)}**\n\n💡 Economizou R$ ${fmt(desc)}!`;
    }
  }

  // Juros simples
  if (/juros simples/i.test(t)) {
    const valor = parseValor(t) || 1000;
    const taxa = t.match(/(\d+(?:[.,]\d+)?)\s*%/) ? parseFloat(t.match(/(\d+(?:[.,]\d+)?)\s*%/)[1]) : 5;
    const meses = t.match(/(\d+)\s*mes/) ? parseInt(t.match(/(\d+)\s*mes/)[1]) : 12;
    const juros = valor * (taxa / 100) * meses;
    return `📐 **Juros Simples**\n\n• Capital: R$ ${fmt(valor)}\n• Taxa: ${taxa}% ao mês\n• Período: ${meses} meses\n• Juros: R$ ${fmt(juros)}\n• ✅ Montante: **R$ ${fmt(valor + juros)}**`;
  }

  // Saudação
  if (/^(oi|olá|hey|boa|bom|tudo|salve|e aí)/i.test(t)) {
    const h = new Date().getHours();
    const s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    return `${s}! 👋 Sou o **Nexo**, seu assistente financeiro pessoal.\n\nVeja o que posso fazer por você:\n\n💰 **Finanças** — registre gastos e veja gráficos no Dashboard\n🧮 **Calculadora** — juros, parcelamentos, descontos, investimentos\n🎯 **Metas** — crie e acompanhe suas metas com barra de progresso\n📊 **Orçamento** — monte seu plano mensal\n\nO que você precisa agora?`;
  }

  // Ajuda
  if (/ajuda|help|o que (você|vc) faz|como usar/i.test(t)) {
    return `🧠 **O que o Nexo faz:**\n\n**Finanças:**\n• "Gastei R$ 150 no mercado"\n• "Monte um orçamento com R$ 4.000"\n• "Quanto sobra se ganho R$ 3.500?"\n\n**Cálculos:**\n• "Quanto rende R$ 5.000 no CDB a 12% ao ano?"\n• "Quero parcelar R$ 800 em 10x a 1,99%"\n• "Desconto de 15% em R$ 250"\n\n**Metas:**\n• "Quero juntar R$ 10.000 em 12 meses"\n• "Como economizar R$ 500 por mês?"\n\nUse as abas acima para ver o **Dashboard** e o **Planejador de Metas**!`;
  }

  const respostasGenericas = [
    `Ainda não sei responder isso direito 🤔\n\nMas posso te ajudar com:\n• 💰 "Gastei R$ X em [algo]" — registro no dashboard\n• 🧮 "Quanto rende R$ X a Y% ao ano?" — simulação\n• 🎯 "Quero juntar R$ X em Y meses" — plano de meta\n\nTenta reformular assim que eu te ajudo melhor!`,
    `Hmm, não captei essa 😅\n\nSe quiser, me conta de outro jeito — por exemplo:\n• "Gastei R$ 80 com transporte"\n• "Vale a pena parcelar R$ 500 em 5x?"\n• "Quanto preciso guardar pra juntar R$ 3.000?"`,
    `Essa eu ainda não sei calcular sozinho 🙏\n\nMas se você me der um valor (e o contexto: gasto, meta ou investimento), eu já te ajudo. Dá uma olhada também na aba **Calculadora** — lá dá pra simular visualmente!`,
    `Boa pergunta, mas preciso de mais detalhes pra te ajudar bem.\n\nMe diga um valor em R$ e o que você quer fazer com ele (gastar, investir, juntar) que eu calculo certinho! 💡`,
  ];
  return respostasGenericas[Math.floor(Math.random() * respostasGenericas.length)];
}

// ── Dados iniciais ────────────────────────────────────────────────────────
const CATS = ["🍽️ Alimentação", "🏠 Moradia", "🚗 Transporte", "🎮 Lazer", "💊 Saúde", "👕 Vestuário", "🎲 Apostas", "📦 Outros"];
const COLORS_CAT = ["#7850ff", "#00d4aa", "#ffb830", "#ff5068", "#4fc3f7", "#f06292", "#ba68c8", "#a5d6a7"];

// Dica do dia — rotaciona com base no dia do mês
const DICAS_DIA = [
  "Guardando R$ 50/dia, você junta R$ 1.500 em 30 dias.",
  "Compras parceladas sem juros não pesam — mas somadas, podem comprometer seu orçamento futuro.",
  "Reserva de emergência ideal: 3 a 6 meses dos seus gastos fixos.",
  "Renegociar uma dívida com desconto à vista pode valer mais que parcelar.",
  "Pequenos gastos diários (cafézinho, app de transporte) são os que mais pesam no fim do mês.",
  "Investir R$ 100/mês por 10 anos a 10% a.a. pode virar mais de R$ 20.000.",
  "Anotar todo gasto, mesmo o pequeno, é o primeiro passo pra qualquer controle financeiro funcionar.",
];
function getDicaDoDia() {
  const dia = new Date().getDate();
  return DICAS_DIA[dia % DICAS_DIA.length];
}

function getMesAtual() { return new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" }); }
function getChaveMes(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function getNomeMes(chave) {
  const [ano, mes] = chave.split("-");
  const d = new Date(parseInt(ano), parseInt(mes) - 1, 1);
  return d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

// ── Conquistas / Badges ─────────────────────────────────────────────────────
const BADGES = [
  { id: "primeiro_gasto", icon: "📝", nome: "Primeiro Registro", desc: "Registrou seu primeiro gasto", check: (ctx) => ctx.gastos.length >= 1 },
  { id: "primeira_meta", icon: "🎯", nome: "Visionário", desc: "Criou sua primeira meta", check: (ctx) => ctx.metas.length >= 1 },
  { id: "primeiro_aporte", icon: "💪", nome: "Mão na Massa", desc: "Fez seu primeiro aporte numa meta", check: (ctx) => ctx.metas.some(m => m.atual > 0) },
  { id: "meta_concluida", icon: "🏆", nome: "Meta Batida", desc: "Concluiu uma meta 100%", check: (ctx) => ctx.metas.some(m => m.atual >= m.alvo) },
  { id: "saldo_positivo", icon: "🟢", nome: "No Azul", desc: "Terminou o mês com saldo positivo", check: (ctx) => ctx.totalReceitas > ctx.totalGastos && ctx.totalReceitas > 0 },
  { id: "dez_gastos", icon: "📊", nome: "Organizado", desc: "Registrou 10 transações de gastos", check: (ctx) => ctx.gastos.length >= 10 },
  { id: "diversificou", icon: "🗂️", nome: "Visão Ampla", desc: "Registrou gastos em 4+ categorias diferentes", check: (ctx) => new Set(ctx.gastos.map(g => g.cat)).size >= 4 },
  { id: "renda_extra", icon: "💸", nome: "Renda Extra", desc: "Registrou uma receita além da principal", check: (ctx) => ctx.receitas.length >= 1 },
  { id: "calculista", icon: "🧮", nome: "Calculista", desc: "Usou a calculadora pelo menos uma vez", check: (ctx) => ctx.calcUsosCount >= 1 },
  { id: "veterano", icon: "🌟", nome: "Veterano", desc: "Acompanhou o Nexo por 2 meses ou mais", check: (ctx) => Object.keys(ctx.historico || {}).length >= 2 },
];

function calcularBadgesDesbloqueadas(ctx) {
  return BADGES.filter(b => b.check(ctx)).map(b => b.id);
}

// ── Compartilhamento via WhatsApp ──────────────────────────────────────────
function gerarTextoResumo({ totalGastos, totalReceitas, gastoPorCat, metas, mesAnterior }) {
  const saldo = totalReceitas - totalGastos;
  const topCat = [...gastoPorCat].sort((a, b) => b.valor - a.valor)[0];
  let txt = `📊 *Meu resumo financeiro — ${getMesAtual()}*\n\n`;
  txt += `🟢 Receitas: R$ ${fmt(totalReceitas)}\n`;
  txt += `🔴 Gastos: R$ ${fmt(totalGastos)}\n`;
  txt += `${saldo >= 0 ? "✅" : "⚠️"} Saldo: ${saldo >= 0 ? "+" : ""}R$ ${fmt(saldo)}\n`;
  if (topCat && topCat.valor > 0) txt += `\n📌 Categoria que mais gastei: ${topCat.label}\n`;
  if (mesAnterior) {
    const diff = totalGastos - mesAnterior.totalGastos;
    txt += `\n${diff <= 0 ? "📉" : "📈"} ${diff <= 0 ? "Gastei R$ " + fmt(Math.abs(diff)) + " menos" : "Gastei R$ " + fmt(diff) + " mais"} que no mês anterior\n`;
  }
  const metaDestaque = metas.find(m => m.atual >= m.alvo) || [...metas].sort((a, b) => (b.atual / b.alvo) - (a.atual / a.alvo))[0];
  if (metaDestaque) {
    const pct = Math.min((metaDestaque.atual / metaDestaque.alvo) * 100, 100);
    txt += `\n🎯 Meta "${metaDestaque.nome}": ${pct.toFixed(0)}% concluída\n`;
  }
  txt += `\n_Feito com o Nexo — assistente financeiro pessoal_ 🧠`;
  return txt;
}
function compartilharWhatsApp(texto) {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}

// ── Resumo de "bem-vindo de volta" ─────────────────────────────────────────
function gerarResumoVoltaUsuario({ gastosNovos, receitasNovas, badgesNovas, diasDesde }) {
  const partes = [];
  if (diasDesde >= 1) {
    partes.push(diasDesde === 1 ? "Foi 1 dia desde sua última visita." : `Foram ${diasDesde} dias desde sua última visita.`);
  }
  if (gastosNovos.length > 0) {
    const total = gastosNovos.reduce((s, g) => s + g.valor, 0);
    partes.push(`Você registrou ${gastosNovos.length} novo${gastosNovos.length > 1 ? "s" : ""} gasto${gastosNovos.length > 1 ? "s" : ""} totalizando R$ ${fmt(total)}.`);
  }
  if (receitasNovas.length > 0) {
    const total = receitasNovas.reduce((s, r) => s + r.valor, 0);
    partes.push(`Entrou R$ ${fmt(total)} em receitas novas. 🟢`);
  }
  if (badgesNovas.length > 0) {
    const nomes = badgesNovas.map(b => `${b.icon} ${b.nome}`).join(", ");
    partes.push(`Você desbloqueou: ${nomes}! 🎉`);
  }
  return partes;
}

// ── Persistência local (salva no navegador do usuário) ─────────────────────
const STORAGE_KEY = "nexo_dados_v1";

function carregarDados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function salvarDados(dados) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    // se der erro (modo privado, etc), simplesmente não salva
  }
}

// ── Quiz de onboarding ─────────────────────────────────────────────────────
const QUIZ_PERGUNTA = "Qual seu maior desafio financeiro hoje?";
const QUIZ_OPCOES = [
  { icon: "📉", label: "Não sei onde meu dinheiro vai", tab: "dashboard", msg: "Quero entender pra onde meu dinheiro está indo", color: "#7850ff" },
  { icon: "💳", label: "Vale a pena parcelar essa compra?", tab: "calc", msg: "Vale a pena parcelar essa compra?", color: "#00d4aa" },
  { icon: "🎯", label: "Quero juntar dinheiro pra algo", tab: "metas", msg: "Quero começar a juntar dinheiro pra um objetivo", color: "#ffb830" },
  { icon: "📊", label: "Não sei organizar meu orçamento", tab: "chat", msg: "Me ajuda a organizar meu orçamento mensal", color: "#ff5068" },
];

// Sugestões com linguagem mais humana, variam por horário
function getSugestoesContextuais() {
  const h = new Date().getHours();
  if (h < 12) {
    return [
      { icon: "☀️", text: "Bom dia! Vamos planejar os gastos de hoje?" },
      { icon: "📊", text: "Me ajuda a organizar meu orçamento do mês" },
      { icon: "🎯", text: "Quero começar a juntar dinheiro pra um objetivo" },
      { icon: "💡", text: "Tenho uma sobra de dinheiro, o que faço com ela?" },
    ];
  } else if (h < 18) {
    return [
      { icon: "💳", text: "Vale a pena parcelar essa compra?" },
      { icon: "🏷️", text: "Esse desconto vale a pena mesmo?" },
      { icon: "📉", text: "Quero entender pra onde meu dinheiro está indo" },
      { icon: "🎯", text: "Quanto preciso guardar por mês pra chegar numa meta?" },
    ];
  }
  return [
    { icon: "🌙", text: "Como foram meus gastos hoje?" },
    { icon: "💰", text: "Tenho uma sobra de dinheiro, o que faço com ela?" },
    { icon: "📊", text: "Me ajuda a organizar meu orçamento do mês" },
    { icon: "🎯", text: "Quero começar a juntar dinheiro pra um objetivo" },
  ];
}

// ── Componentes auxiliares ────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Tab({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "10px 4px", border: "none", borderRadius: 10,
      background: active ? `linear-gradient(135deg, ${C.accent}, #5a35d4)` : "transparent",
      color: active ? "#fff" : C.muted, cursor: "pointer", fontSize: 12,
      fontWeight: active ? 700 : 400, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 3, transition: "all 0.2s",
      boxShadow: active ? `0 4px 15px rgba(120,80,255,0.3)` : "none",
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.valor), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "8px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: C.muted }}>{d.valor > 0 ? `R$${Math.round(d.valor)}` : ""}</span>
          <div style={{
            width: "100%", borderRadius: "6px 6px 0 0",
            height: `${Math.max((d.valor / max) * 90, d.valor > 0 ? 8 : 0)}px`,
            background: `linear-gradient(to top, ${C.accent}, ${C.teal})`,
            transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: 9, color: C.muted, textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  if (total === 0) return <div style={{ textAlign: "center", color: C.muted, padding: 20, fontSize: 13 }}>Nenhum gasto registrado</div>;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, stroke = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        {data.filter(d => d.valor > 0).map((d, i) => {
          const pct = d.valor / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={COLORS_CAT[i % COLORS_CAT.length]} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              style={{ transition: "all 0.5s" }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" fill={C.text} fontSize="10" fontWeight="bold">
          R${Math.round(total)}
        </text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {data.filter(d => d.valor > 0).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS_CAT[i % COLORS_CAT.length], flexShrink: 0 }} />
            <span style={{ color: C.muted, flex: 1 }}>{d.label.split(" ")[1] || d.label}</span>
            <span style={{ color: C.text, fontWeight: 600 }}>{((d.valor / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────
const DADOS_PADRAO = {
  gastos: [
    { id: 1, cat: "🍽️ Alimentação", valor: 320, desc: "Supermercado" },
    { id: 2, cat: "🏠 Moradia", valor: 900, desc: "Aluguel" },
    { id: 3, cat: "🚗 Transporte", valor: 150, desc: "Combustível" },
    { id: 4, cat: "🎮 Lazer", valor: 80, desc: "Cinema" },
  ],
  metas: [
    { id: 1, nome: "Reserva de emergência", alvo: 10000, atual: 3200, prazo: 12, cor: "#7850ff" },
    { id: 2, nome: "Viagem", alvo: 5000, atual: 1500, prazo: 8, cor: "#00d4aa" },
  ],
  receitas: [],
  historico: {},
  calcUsosCount: 0,
  badgesVistas: [],
  ultimaVisita: null,
  messages: [],
  quizDone: false,
  started: false,
};

export default function App() {
  const dadosSalvos = useRef(carregarDados());
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState(dadosSalvos.current?.messages ?? DADOS_PADRAO.messages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(dadosSalvos.current?.started ?? DADOS_PADRAO.started);
  const [quizDone, setQuizDone] = useState(dadosSalvos.current?.quizDone ?? DADOS_PADRAO.quizDone);
  const bottomRef = useRef(null);

  // Dashboard
  const [gastos, setGastos] = useState(dadosSalvos.current?.gastos ?? DADOS_PADRAO.gastos);
  const [novoGasto, setNovoGasto] = useState({ cat: CATS[0], valor: "", desc: "" });

  // Metas
  const [metas, setMetas] = useState(dadosSalvos.current?.metas ?? DADOS_PADRAO.metas);
  const [receitas, setReceitas] = useState(dadosSalvos.current?.receitas ?? DADOS_PADRAO.receitas);
  const [historico, setHistorico] = useState(dadosSalvos.current?.historico ?? DADOS_PADRAO.historico);
  const [calcUsosCount, setCalcUsosCount] = useState(dadosSalvos.current?.calcUsosCount ?? DADOS_PADRAO.calcUsosCount);
  const [badgesVistas, setBadgesVistas] = useState(dadosSalvos.current?.badgesVistas ?? DADOS_PADRAO.badgesVistas);
  const [novaMeta, setNovaMeta] = useState({ nome: "", alvo: "", atual: "0", prazo: "12" });
  const [aporteId, setAporteId] = useState(null);
  const [aporteVal, setAporteVal] = useState("");

  // "Bem-vindo de volta" — calculado uma única vez no carregamento
  const [welcomeBack] = useState(() => {
    const dados = dadosSalvos.current;
    if (!dados || !dados.ultimaVisita || !dados.quizDone) return null;
    const ultimaVisita = new Date(dados.ultimaVisita);
    const agora = new Date();
    const diasDesde = Math.floor((agora - ultimaVisita) / (1000 * 60 * 60 * 24));
    if (diasDesde < 1) return null; // visitou hoje mesmo, não mostra

    const gastosNovos = (dados.gastos || []).filter(g => g.id > ultimaVisita.getTime());
    const receitasNovas = (dados.receitas || []).filter(r => r.id > ultimaVisita.getTime());
    const badgesAntes = dados.badgesVistas || [];
    const ctxAntes = {
      gastos: dados.gastos || [], metas: dados.metas || [], receitas: dados.receitas || [],
      totalGastos: (dados.gastos || []).reduce((s, g) => s + g.valor, 0),
      totalReceitas: (dados.receitas || []).reduce((s, r) => s + r.valor, 0),
      calcUsosCount: dados.calcUsosCount || 0, historico: dados.historico || {},
    };
    const badgesAtuais = calcularBadgesDesbloqueadas(ctxAntes);
    const badgesNovas = BADGES.filter(b => badgesAtuais.includes(b.id) && !badgesAntes.includes(b.id));

    const partes = gerarResumoVoltaUsuario({ gastosNovos, receitasNovas, badgesNovas, diasDesde });
    if (partes.length === 0) return null;
    return partes;
  });
  const [showWelcomeBack, setShowWelcomeBack] = useState(true);

  // Salva automaticamente sempre que algo relevante mudar
  useEffect(() => {
    salvarDados({ gastos, metas, receitas, messages, quizDone, started, historico, calcUsosCount, badgesVistas });
  }, [gastos, metas, receitas, messages, quizDone, started, historico, calcUsosCount, badgesVistas]);

  // Atualiza o snapshot do mês atual sempre que gastos/receitas mudam
  useEffect(() => {
    const chave = getChaveMes();
    const tGastos = gastos.reduce((s, g) => s + g.valor, 0);
    const tReceitas = receitas.reduce((s, r) => s + r.valor, 0);
    setHistorico(h => {
      const atual = h[chave];
      if (atual && atual.totalGastos === tGastos && atual.totalReceitas === tReceitas) return h;
      return { ...h, [chave]: { totalGastos: tGastos, totalReceitas: tReceitas } };
    });
  }, [gastos, receitas]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Chat
  function sendMessage(text) {
    const u = text || input.trim();
    if (!u || loading) return;
    setStarted(true); setInput("");
    const nm = [...messages, { role: "user", content: u }];
    setMessages(nm); setLoading(true);

    // auto-registrar receita se mencionado (ganhei, recebi, caiu, entrou, fatur...)
    if (/ganhei|recebi|caiu|entrou|fatur/i.test(u)) {
      const v = parseValor(u);
      if (v) {
        const origem = /bet|aposta|jogo|cassino|loteria/i.test(u) ? "🎲 Apostas" :
          /sal[áa]rio/i.test(u) ? "💼 Salário" :
          /freela|bico|extra/i.test(u) ? "💻 Freelance" :
          /vend[ai]/i.test(u) ? "🏷️ Venda" :
          /presente|deram|aniversário/i.test(u) ? "🎁 Presente" : "💰 Outras receitas";
        setReceitas(r => [...r, { id: Date.now(), origem, valor: v, desc: u.slice(0, 30) }]);
      }
    }
    // auto-registrar gasto se mencionado
    else if (/gastei|paguei|comprei|perdi|torrei|queimei|fui no|sa[íi]\s/i.test(u)) {
      const v = parseValor(u);
      if (v) {
        const cat = /comida|restaurante|lanche|mercado|ifood/i.test(u) ? "🍽️ Alimentação" :
          /uber|gasolina|transporte|ônibus/i.test(u) ? "🚗 Transporte" :
          /luz|água|internet|aluguel/i.test(u) ? "🏠 Moradia" :
          /roupa|calçado|shopping/i.test(u) ? "👕 Vestuário" :
          /jogo|aposta|bet|cassino|loteria/i.test(u) ? "🎲 Apostas" :
          /lazer|cinema|bar|show/i.test(u) ? "🎮 Lazer" : "📦 Outros";
        setGastos(g => [...g, { id: Date.now(), cat, valor: v, desc: u.slice(0, 30) }]);
      }
    }

    setTimeout(() => {
      setMessages([...nm, { role: "assistant", content: gerarResposta(u, gastos, metas, receitas) }]);
      setLoading(false);
    }, 600 + Math.random() * 500);
  }

  function fmt2(t) {
    return t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\n/g, "<br/>");
  }

  // Dashboard data
  const gastoPorCat = CATS.map((c, i) => ({
    label: c, valor: gastos.filter(g => g.cat === c).reduce((s, g) => s + g.valor, 0), color: COLORS_CAT[i]
  }));
  const totalGastos = gastos.reduce((s, g) => s + g.valor, 0);
  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
  const ultimos7 = [
    { label: "Seg", valor: 45 }, { label: "Ter", valor: 120 }, { label: "Qua", valor: 30 },
    { label: "Qui", valor: 200 }, { label: "Sex", valor: 85 }, { label: "Sáb", valor: 160 },
    { label: "Dom", valor: 55 },
  ];

  const sugestoes = getSugestoesContextuais();

  // Conquistas
  const badgeCtx = { gastos, metas, receitas, totalGastos, totalReceitas, calcUsosCount, historico };
  const badgesDesbloqueadas = calcularBadgesDesbloqueadas(badgeCtx);

  // Atualiza badges vistas e marca o momento da visita (salvo junto no próximo save)
  useEffect(() => {
    setBadgesVistas(prev => {
      const novas = badgesDesbloqueadas.filter(id => !prev.includes(id));
      if (novas.length === 0) return prev;
      return [...prev, ...novas];
    });
  }, [badgesDesbloqueadas.join(",")]);

  useEffect(() => {
    const onUnload = () => salvarDados({ gastos, metas, receitas, messages, quizDone, started, historico, calcUsosCount, badgesVistas, ultimaVisita: new Date().toISOString() });
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      onUnload();
    };
  }, []);

  // Histórico mensal — mês atual vs anterior
  const chaveAtual = getChaveMes();
  const dataAtual = new Date();
  const chaveAnterior = getChaveMes(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
  const histAtual = historico[chaveAtual] || { totalGastos, totalReceitas };
  const histAnterior = historico[chaveAnterior];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: "bold", boxShadow: `0 0 20px rgba(120,80,255,0.4)` }}>N</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Nexo</div>
          <div style={{ fontSize: 11, color: C.teal, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal, display: "inline-block" }} /> Assistente Pessoal com IA
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{getMesAtual()}</span>
          <button onClick={() => {
            if (window.confirm("Isso vai apagar todos os seus dados salvos (gastos, metas e conversas). Tem certeza?")) {
              localStorage.removeItem(STORAGE_KEY);
              setGastos(DADOS_PADRAO.gastos);
              setMetas(DADOS_PADRAO.metas);
              setReceitas(DADOS_PADRAO.receitas);
              setMessages([]);
              setStarted(false);
              setQuizDone(false);
            }
          }} title="Limpar dados salvos" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: 4, lineHeight: 1 }}>
            🗑️
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        {[
          { id: "chat", icon: "🧠", label: "Chat" },
          { id: "dashboard", icon: "📊", label: "Dashboard" },
          { id: "calc", icon: "🧮", label: "Calculadora" },
          { id: "metas", icon: "🎯", label: "Metas" },
          { id: "perfil", icon: "🏆", label: "Perfil" },
        ].map(tb => <Tab key={tb.id} label={tb.label} icon={tb.icon} active={tab === tb.id} onClick={() => setTab(tb.id)} />)}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── CHAT ── */}
        {tab === "chat" && (
          <>
            {welcomeBack && showWelcomeBack && (
              <div style={{ width: "100%", background: `linear-gradient(135deg, rgba(120,80,255,0.18), rgba(0,212,170,0.12))`, border: `1px solid rgba(120,80,255,0.35)`, borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18 }}>👋</span> Bem-vindo de volta!
                  </div>
                  <button onClick={() => setShowWelcomeBack(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {welcomeBack.map((p, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, display: "flex", gap: 6 }}>
                      <span style={{ color: C.teal }}>•</span><span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!started && !quizDone && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, paddingTop: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 10px", background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 30px rgba(120,80,255,0.3)` }}>🧠</div>
                  <p style={{ margin: "0 0 4px", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Oi, eu sou o Nexo</p>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, lineHeight: 1.3 }}>{QUIZ_PERGUNTA}</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
                  {QUIZ_OPCOES.map((o, i) => (
                    <button key={i} onClick={() => {
                      setQuizDone(true);
                      if (o.tab !== "chat") { setTab(o.tab); }
                      else { sendMessage(o.msg); }
                    }} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 12px", color: C.text, cursor: "pointer", textAlign: "center", fontSize: 12.5, lineHeight: 1.35, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,80,255,0.15)"; e.currentTarget.style.borderColor = "rgba(120,80,255,0.5)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
                      <span style={{ width: 40, height: 40, borderRadius: 12, background: `${o.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{o.icon}</span>
                      <span style={{ fontWeight: 600 }}>{o.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: -4 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <span style={{ width: 18, height: 4, borderRadius: 2, background: `linear-gradient(90deg,${C.accent},${C.teal})` }} />
                  </div>
                  <button onClick={() => { setQuizDone(true); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 4 }}>
                    Prefiro escrever o que preciso →
                  </button>
                </div>
              </div>
            )}

            {!started && quizDone && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 12px", background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 30px rgba(120,80,255,0.3)` }}>🧠</div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Pode perguntar!</h2>
                  <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 13 }}>Aqui vão algumas ideias pra começar:</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                  {sugestoes.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s.text)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 13px", color: C.text, cursor: "pointer", textAlign: "left", fontSize: 12, lineHeight: 1.4, display: "flex", gap: 7, alignItems: "flex-start", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,80,255,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                      <span style={{ fontSize: 15 }}>{s.icon}</span><span>{s.text}</span>
                    </button>
                  ))}
                </div>
                <div style={{ width: "100%", background: "rgba(120,80,255,0.08)", border: `1px solid rgba(120,80,255,0.25)`, borderRadius: 14, padding: "13px 15px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                  <div>
                    <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Dica do dia</div>
                    <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{getDicaDoDia()}</div>
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                {m.role === "assistant" && <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg,${C.accent},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>N</div>}
                <div style={{ maxWidth: "78%", background: m.role === "user" ? `linear-gradient(135deg,${C.accent},#5a35d4)` : "rgba(255,255,255,0.06)", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "11px 15px", fontSize: 13, lineHeight: 1.7, border: m.role === "assistant" ? `1px solid ${C.border}` : "none", boxShadow: m.role === "user" ? `0 4px 20px rgba(120,80,255,0.3)` : "none" }}
                  dangerouslySetInnerHTML={{ __html: fmt2(m.content) }} />
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>N</div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "18px 18px 18px 4px", padding: "13px 16px", border: `1px solid ${C.border}`, display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>🟢 Receitas</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.teal }}>R$ {fmt(totalReceitas)}</div>
                </div>
                <div style={{ width: 1, background: C.border }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>🔴 Gastos</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.danger }}>R$ {fmt(totalGastos)}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Saldo do mês — {getMesAtual()}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: (totalReceitas - totalGastos) >= 0 ? C.teal : C.danger }}>
                  {(totalReceitas - totalGastos) >= 0 ? "+" : ""}R$ {fmt(totalReceitas - totalGastos)}
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Total de gastos — {getMesAtual()}</div>
              <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(90deg,${C.accent},${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>R$ {fmt(totalGastos)}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{gastos.length} transações registradas</div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📅 Gastos últimos 7 dias</div>
              <BarChart data={ultimos7} />
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>🍩 Gastos por categoria</div>
              <DonutChart data={gastoPorCat} />
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>➕ Registrar gasto</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={novoGasto.cat} onChange={e => setNovoGasto(g => ({ ...g, cat: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Descrição (ex: Supermercado)" value={novoGasto.desc}
                  onChange={e => setNovoGasto(g => ({ ...g, desc: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                <input placeholder="Valor (ex: 150)" value={novoGasto.valor} type="number"
                  onChange={e => setNovoGasto(g => ({ ...g, valor: e.target.value }))}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                <button onClick={() => {
                  if (!novoGasto.valor || isNaN(parseFloat(novoGasto.valor))) return;
                  setGastos(g => [...g, { id: Date.now(), cat: novoGasto.cat, valor: parseFloat(novoGasto.valor), desc: novoGasto.desc || novoGasto.cat }]);
                  setNovoGasto({ cat: CATS[0], valor: "", desc: "" });
                }} style={{ background: `linear-gradient(135deg,${C.accent},${C.teal})`, border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Adicionar gasto
                </button>
              </div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📋 Últimas transações</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...gastos].reverse().slice(0, 8).map(g => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: C.surface, borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{g.desc}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{g.cat}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>-R$ {fmt(g.valor)}</span>
                      <button onClick={() => setGastos(gs => gs.filter(x => x.id !== g.id))}
                        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ── CALCULADORA ── */}
        {tab === "calc" && <CalculadoraTab onUsar={() => setCalcUsosCount(c => c + 1)} />}

        {/* ── METAS ── */}
        {tab === "metas" && (
          <>
            {metas.map(m => {
              const pct = Math.min((m.atual / m.alvo) * 100, 100);
              const falta = m.alvo - m.atual;
              const pmMes = falta / Math.max(m.prazo, 1);
              return (
                <Card key={m.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nome}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{m.prazo} meses restantes</div>
                    </div>
                    <button onClick={() => setMetas(ms => ms.filter(x => x.id !== m.id))}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: C.teal, fontWeight: 700 }}>R$ {fmt(m.atual)}</span>
                    <span style={{ color: C.muted }}>Meta: R$ {fmt(m.alvo)}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 10, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.accent},${C.teal})`, borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 12 }}>
                    <span>{pct.toFixed(0)}% concluído</span>
                    <span>Falta R$ {fmt(falta)} • R$ {fmt(pmMes)}/mês</span>
                  </div>
                  {aporteId === m.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input placeholder="Valor do aporte" value={aporteVal} type="number"
                        onChange={e => setAporteVal(e.target.value)}
                        style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 13, outline: "none" }} />
                      <button onClick={() => {
                        const v = parseFloat(aporteVal);
                        if (!isNaN(v) && v > 0) {
                          setMetas(ms => ms.map(x => x.id === m.id ? { ...x, atual: Math.min(x.atual + v, x.alvo) } : x));
                          setAporteId(null); setAporteVal("");
                        }
                      }} style={{ background: `linear-gradient(135deg,${C.accent},${C.teal})`, border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>OK</button>
                      <button onClick={() => setAporteId(null)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "8px 10px", color: C.muted, cursor: "pointer", fontSize: 13 }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAporteId(m.id)}
                      style={{ width: "100%", background: "rgba(120,80,255,0.15)", border: `1px solid rgba(120,80,255,0.3)`, borderRadius: 10, padding: "9px", color: C.accent, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                      + Registrar aporte
                    </button>
                  )}
                </Card>
              );
            })}

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>✨ Nova meta</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { ph: "Nome da meta (ex: Viagem, Carro)", key: "nome" },
                  { ph: "Valor alvo (ex: 10000)", key: "alvo", type: "number" },
                  { ph: "Já tenho (ex: 0)", key: "atual", type: "number" },
                  { ph: "Prazo em meses (ex: 12)", key: "prazo", type: "number" },
                ].map(f => (
                  <input key={f.key} placeholder={f.ph} type={f.type || "text"} value={novaMeta[f.key]}
                    onChange={e => setNovaMeta(m => ({ ...m, [f.key]: e.target.value }))}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                ))}
                <button onClick={() => {
                  if (!novaMeta.nome || !novaMeta.alvo) return;
                  setMetas(ms => [...ms, {
                    id: Date.now(), nome: novaMeta.nome,
                    alvo: parseFloat(novaMeta.alvo) || 0,
                    atual: parseFloat(novaMeta.atual) || 0,
                    prazo: parseInt(novaMeta.prazo) || 12,
                    cor: C.accent,
                  }]);
                  setNovaMeta({ nome: "", alvo: "", atual: "0", prazo: "12" });
                }} style={{ background: `linear-gradient(135deg,${C.accent},${C.teal})`, border: "none", borderRadius: 10, padding: "10px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Criar meta
                </button>
              </div>
            </Card>
          </>
        )}

        {/* ── PERFIL / CONQUISTAS ── */}
        {tab === "perfil" && (
          <>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Conquistas</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{badgesDesbloqueadas.length} de {BADGES.length} desbloqueadas</div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 8, overflow: "hidden", marginTop: 10 }}>
                <div style={{ height: "100%", width: `${(badgesDesbloqueadas.length / BADGES.length) * 100}%`, background: `linear-gradient(90deg,${C.accent},${C.teal})`, borderRadius: 999, transition: "width 0.6s ease" }} />
              </div>
            </Card>

            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {BADGES.map(b => {
                  const unlocked = badgesDesbloqueadas.includes(b.id);
                  return (
                    <div key={b.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "14px 8px", borderRadius: 12,
                      background: unlocked ? "rgba(120,80,255,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${unlocked ? "rgba(120,80,255,0.35)" : C.border}`,
                      opacity: unlocked ? 1 : 0.45, textAlign: "center",
                    }}>
                      <span style={{ fontSize: 26, filter: unlocked ? "none" : "grayscale(1)" }}>{b.icon}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{b.nome}</span>
                      <span style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{b.desc}</span>
                      {unlocked && <span style={{ fontSize: 9, color: C.teal, fontWeight: 700 }}>✓ Desbloqueado</span>}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📅 {getNomeMes(chaveAtual)} vs {histAnterior ? getNomeMes(chaveAnterior) : "mês anterior"}</div>
              {histAnterior ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                      <span>Gastos</span>
                      <span>{getNomeMes(chaveAnterior)}: R$ {fmt(histAnterior.totalGastos)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 800 }}>R$ {fmt(histAtual.totalGastos)}</span>
                      {(() => {
                        const diff = histAtual.totalGastos - histAnterior.totalGastos;
                        const pct = histAnterior.totalGastos > 0 ? (diff / histAnterior.totalGastos) * 100 : 0;
                        const bom = diff <= 0;
                        return (
                          <span style={{ fontSize: 12, fontWeight: 700, color: bom ? C.teal : C.danger, background: bom ? "rgba(0,212,170,0.12)" : "rgba(255,80,104,0.12)", padding: "3px 8px", borderRadius: 8 }}>
                            {bom ? "↓" : "↑"} {Math.abs(pct).toFixed(0)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                      <span>Receitas</span>
                      <span>{getNomeMes(chaveAnterior)}: R$ {fmt(histAnterior.totalReceitas)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 800 }}>R$ {fmt(histAtual.totalReceitas)}</span>
                      {(() => {
                        const diff = histAtual.totalReceitas - histAnterior.totalReceitas;
                        const pct = histAnterior.totalReceitas > 0 ? (diff / histAnterior.totalReceitas) * 100 : 0;
                        const bom = diff >= 0;
                        return (
                          <span style={{ fontSize: 12, fontWeight: 700, color: bom ? C.teal : C.danger, background: bom ? "rgba(0,212,170,0.12)" : "rgba(255,80,104,0.12)", padding: "3px 8px", borderRadius: 8 }}>
                            {diff >= 0 ? "↑" : "↓"} {Math.abs(pct).toFixed(0)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                  Ainda não temos dados do mês anterior pra comparar. Volte aqui no próximo mês para ver sua evolução! 📈
                </div>
              )}
            </Card>

            <Card>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>📤 Compartilhar resumo</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
                Mande seu resumo financeiro do mês pra alguém — ou pra você mesmo guardar no WhatsApp.
              </div>
              <button onClick={() => {
                const texto = gerarTextoResumo({ totalGastos, totalReceitas, gastoPorCat, metas, mesAnterior: histAnterior });
                compartilharWhatsApp(texto);
              }} style={{ width: "100%", background: "#25D366", border: "none", borderRadius: 10, padding: "12px", color: "#0b0b14", fontWeight: 800, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>💬</span> Compartilhar no WhatsApp
              </button>
            </Card>
          </>
        )}
      </div>

      {/* Input do chat */}
      {tab === "chat" && (
        <div style={{ padding: "10px 16px 18px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(120,80,255,0.3)`, borderRadius: 14, padding: "7px 7px 7px 14px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Pergunte sobre finanças, cálculos ou metas..."
              rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, resize: "none", lineHeight: 1.5, fontFamily: "inherit", maxHeight: 100, overflowY: "auto", paddingTop: 3 }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: input.trim() && !loading ? `linear-gradient(135deg,${C.accent},${C.teal})` : "rgba(255,255,255,0.08)", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: input.trim() && !loading ? `0 4px 15px rgba(120,80,255,0.4)` : "none" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }
        *{box-sizing:border-box}
        input::placeholder,textarea::placeholder{color:rgba(232,232,240,0.35)}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(120,80,255,0.3);border-radius:2px}
        select option{background:#1a1a2e}
      `}</style>
    </div>
  );
}

// ── Calculadora visual interativa ─────────────────────────────────────────
function CalculadoraTab({ onUsar }) {
  const [modo, setModo] = useState("investimento");
  const [vals, setVals] = useState({});
  const [resultado, setResultado] = useState(null);

  function set(k, v) { setVals(p => ({ ...p, [k]: v })); setResultado(null); }

  function calcular() {
    if (onUsar) onUsar();
    const n = k => parseFloat((vals[k] || "0").replace(",", "."));
    if (modo === "investimento") {
      const valor = n("valor"), taxa = n("taxa") / 100, meses = n("meses");
      const taxaMes = Math.pow(1 + taxa, 1 / 12) - 1;
      const montante = valor * Math.pow(1 + taxaMes, meses);
      const rend = montante - valor;
      const aliq = meses <= 6 ? 0.225 : meses <= 12 ? 0.20 : meses <= 24 ? 0.175 : 0.15;
      const ir = rend * aliq;
      setResultado([
        { label: "Montante bruto", valor: `R$ ${fmt(montante)}`, destaque: false },
        { label: "Rendimento bruto", valor: `R$ ${fmt(rend)}`, destaque: false },
        { label: `IR (${(aliq * 100).toFixed(1)}%)`, valor: `-R$ ${fmt(ir)}`, destaque: false, cor: "#ff5068" },
        { label: "✅ Rendimento líquido", valor: `R$ ${fmt(rend - ir)}`, destaque: true },
      ]);
    } else if (modo === "parcelamento") {
      const valor = n("valor"), j = n("juros") / 100, nx = n("parcelas");
      const parc = (valor * j * Math.pow(1 + j, nx)) / (Math.pow(1 + j, nx) - 1);
      const total = parc * nx;
      setResultado([
        { label: "Parcela mensal", valor: `R$ ${fmt(parc)}`, destaque: true },
        { label: "Total pago", valor: `R$ ${fmt(total)}`, destaque: false },
        { label: "Juros totais", valor: `R$ ${fmt(total - valor)}`, destaque: false, cor: "#ff5068" },
      ]);
    } else if (modo === "desconto") {
      const valor = n("valor"), pct = n("pct");
      const desc = valor * pct / 100;
      setResultado([
        { label: "Desconto", valor: `-R$ ${fmt(desc)}`, cor: "#ff5068" },
        { label: "✅ Valor final", valor: `R$ ${fmt(valor - desc)}`, destaque: true },
        { label: "Economia", valor: `R$ ${fmt(desc)}`, destaque: false, cor: "#00d4aa" },
      ]);
    } else if (modo === "meta") {
      const alvo = n("alvo"), atual = n("atual"), meses = n("meses");
      const falta = alvo - atual;
      const pm = falta / meses;
      setResultado([
        { label: "Falta guardar", valor: `R$ ${fmt(falta)}`, destaque: false },
        { label: "Por mês", valor: `R$ ${fmt(pm)}`, destaque: true },
        { label: "Por semana", valor: `R$ ${fmt(pm / 4.3)}`, destaque: false },
        { label: "Por dia", valor: `R$ ${fmt(pm / 30)}`, destaque: false },
      ]);
    }
  }

  const modos = [
    { id: "investimento", label: "💹 Investimento", fields: [{ k: "valor", ph: "Capital (R$)" }, { k: "taxa", ph: "Taxa anual (%)" }, { k: "meses", ph: "Período (meses)" }] },
    { id: "parcelamento", label: "💳 Parcelamento", fields: [{ k: "valor", ph: "Valor total (R$)" }, { k: "parcelas", ph: "Nº de parcelas" }, { k: "juros", ph: "Juros ao mês (%)" }] },
    { id: "desconto", label: "🏷️ Desconto", fields: [{ k: "valor", ph: "Valor original (R$)" }, { k: "pct", ph: "Desconto (%)" }] },
    { id: "meta", label: "🎯 Meta", fields: [{ k: "alvo", ph: "Valor da meta (R$)" }, { k: "atual", ph: "Já tenho (R$)" }, { k: "meses", ph: "Prazo (meses)" }] },
  ];

  const modoAtual = modos.find(m => m.id === modo);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {modos.map(m => (
          <button key={m.id} onClick={() => { setModo(m.id); setVals({}); setResultado(null); }}
            style={{ padding: "7px 12px", borderRadius: 20, border: "none", fontSize: 12, cursor: "pointer", fontWeight: modo === m.id ? 700 : 400, background: modo === m.id ? `linear-gradient(135deg,${C.accent},#5a35d4)` : "rgba(255,255,255,0.06)", color: modo === m.id ? "#fff" : C.muted, transition: "all 0.2s", boxShadow: modo === m.id ? `0 4px 12px rgba(120,80,255,0.3)` : "none" }}>
            {m.label}
          </button>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{modoAtual.label}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {modoAtual.fields.map(f => (
            <div key={f.k}>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>{f.ph}</label>
              <input placeholder={f.ph} value={vals[f.k] || ""} onChange={e => set(f.k, e.target.value)} type="number"
                style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            </div>
          ))}
          <button onClick={calcular} style={{ marginTop: 4, background: `linear-gradient(135deg,${C.accent},${C.teal})`, border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: `0 4px 20px rgba(120,80,255,0.3)` }}>
            Calcular
          </button>
        </div>
      </Card>

      {resultado && (
        <Card style={{ border: `1px solid rgba(120,80,255,0.4)` }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: C.teal }}>📊 Resultado</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {resultado.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: r.destaque ? "10px 14px" : "6px 0", background: r.destaque ? "rgba(120,80,255,0.12)" : "transparent", borderRadius: r.destaque ? 10 : 0, border: r.destaque ? `1px solid rgba(120,80,255,0.3)` : "none" }}>
                <span style={{ fontSize: 13, color: C.muted }}>{r.label}</span>
                <span style={{ fontSize: r.destaque ? 16 : 14, fontWeight: r.destaque ? 800 : 600, color: r.cor || (r.destaque ? C.teal : C.text) }}>{r.valor}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
