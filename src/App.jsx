import { useState, useRef, useEffect } from "react";

// ── Simulação de IA local ──────────────────────────────────────────────────
function parseValor(text) {
  const m = text.match(/R?\$?\s*([\d.,]+)/);
  if (!m) return null;
  return parseFloat(m[1].replace(/\./g, "").replace(",", "."));
}

function gerarResposta(input) {
  const t = input.toLowerCase();

  // ── CÁLCULOS ──
  if (/cdb|rend[ae]|invest|juros|poupan/i.test(t)) {
    const valor = parseValor(t) || 5000;
    const taxa = (t.match(/(\d+(?:[.,]\d+)?)\s*%/) ? parseFloat(t.match(/(\d+(?:[.,]\d+)?)\s*%/)[1].replace(",",".")) : 12) / 100;
    const meses = t.match(/(\d+)\s*mes/) ? parseInt(t.match(/(\d+)\s*mes/)[1]) : 12;
    const taxaMensal = Math.pow(1 + taxa, 1/12) - 1;
    const montante = valor * Math.pow(1 + taxaMensal, meses);
    const rendimento = montante - valor;
    const ir = rendimento * (meses <= 6 ? 0.225 : meses <= 12 ? 0.20 : meses <= 24 ? 0.175 : 0.15);
    const liquido = rendimento - ir;
    return `📈 **Simulação de Investimento**\n\n💵 Valor aplicado: **R$ ${valor.toLocaleString("pt-BR", {minimumFractionDigits:2})}**\n📅 Período: **${meses} meses**\n📊 Taxa: **${(taxa*100).toFixed(1)}% ao ano**\n\n**Resultado:**\n• Montante bruto: R$ ${montante.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• Rendimento bruto: R$ ${rendimento.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• IR (${meses<=6?"22,5":meses<=12?"20":meses<=24?"17,5":"15"}%): -R$ ${ir.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• ✅ Rendimento líquido: **R$ ${liquido.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n\n💡 *Dica: Quanto mais tempo investido, menor a alíquota de IR e maior o rendimento!*`;
  }

  if (/parcel|parcela|prestação/i.test(t)) {
    const valor = parseValor(t) || 1200;
    const meses = t.match(/(\d+)\s*[xX×]/) ? parseInt(t.match(/(\d+)\s*[xX×]/)[1]) : t.match(/(\d+)\s*(parcela|mes|vez)/) ? parseInt(t.match(/(\d+)\s*(parcela|mes|vez)/)[1]) : 12;
    const juros = (t.match(/(\d+(?:[.,]\d+)?)\s*%/) ? parseFloat(t.match(/(\d+(?:[.,]\d+)?)\s*%/)[1].replace(",",".")) : 1.99) / 100;
    const parcela = (valor * juros * Math.pow(1+juros, meses)) / (Math.pow(1+juros, meses) - 1);
    const total = parcela * meses;
    return `🧮 **Simulação de Parcelamento**\n\n💵 Valor: **R$ ${valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n📅 Parcelas: **${meses}x**\n📊 Juros: **${(juros*100).toFixed(2)}% ao mês**\n\n**Resultado:**\n• Parcela mensal: **R$ ${parcela.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n• Total pago: R$ ${total.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• Juros totais: R$ ${(total-valor).toLocaleString("pt-BR",{minimumFractionDigits:2})}\n\n⚠️ *Sempre que possível, prefira parcelas menores ou pagamento à vista com desconto!*`;
  }

  if (/descont|quantos?\s*\%|porcentagem/i.test(t)) {
    const nums = [...t.matchAll(/[\d]+(?:[.,]\d+)?/g)].map(m => parseFloat(m[0].replace(",",".")));
    if (nums.length >= 2) {
      const valor = nums[0], pct = nums[1];
      const desc = valor * pct / 100;
      return `🔢 **Cálculo de Desconto**\n\n• Valor original: R$ ${valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• Desconto (${pct}%): -R$ ${desc.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• ✅ Valor final: **R$ ${(valor-desc).toLocaleString("pt-BR",{minimumFractionDigits:2})}**`;
    }
  }

  // ── FINANÇAS ──
  if (/orçamento|ganho|salário|quanto sobra|dividir|distribu/i.test(t)) {
    const renda = parseValor(t) || 3000;
    const moradia = renda * 0.30;
    const alimentacao = renda * 0.20;
    const transporte = renda * 0.10;
    const saude = renda * 0.10;
    const lazer = renda * 0.10;
    const poupanca = renda * 0.20;
    return `📊 **Orçamento Mensal — R$ ${renda.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n\n*Baseado na regra 50-30-20 adaptada:*\n\n🏠 Moradia (30%): R$ ${moradia.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n🍽️ Alimentação (20%): R$ ${alimentacao.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n🚗 Transporte (10%): R$ ${transporte.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n💊 Saúde (10%): R$ ${saude.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n🎮 Lazer (10%): R$ ${lazer.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n💰 Poupança (20%): **R$ ${poupanca.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n\n💡 *Dica: Pague-se primeiro — separe os 20% de poupança logo que receber!*`;
  }

  if (/gastei|gasto|despesa|conta|paguei/i.test(t)) {
    const valor = parseValor(t);
    if (valor) {
      const categoria = /comida|restaurante|lanche|mercado/i.test(t) ? "🍽️ Alimentação" :
        /uber|ônibus|gasolina|combustível|transporte/i.test(t) ? "🚗 Transporte" :
        /luz|água|internet|aluguel/i.test(t) ? "🏠 Moradia" :
        /roupa|calçado|shopping/i.test(t) ? "👕 Vestuário" : "📦 Outros";
      return `✅ **Gasto registrado!**\n\n${categoria}: **R$ ${valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n\n💡 *Dica: Anote todos os gastos do mês para ter controle total do seu orçamento. Posso te ajudar a montar uma planilha de controle se quiser!*`;
    }
  }

  if (/economi|poupar|guardar|reserva|emergência/i.test(t)) {
    const valor = parseValor(t) || 500;
    return `💰 **Dicas para Economizar**\n\nPara guardar **R$ ${valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}** por mês:\n\n1️⃣ **Automatize** — configure transferência automática no dia do pagamento\n2️⃣ **Corte o supérfluo** — assinaturas esquecidas, delivery excessivo\n3️⃣ **Regra 24h** — espere 24h antes de compras não planejadas acima de R$ 100\n4️⃣ **Cashback** — use cartões com cashback para compras fixas\n5️⃣ **Meta visual** — tenha um objetivo claro (ex: viagem, reserva de emergência)\n\n🎯 *Em 12 meses você terá R$ ${(valor*12).toLocaleString("pt-BR",{minimumFractionDigits:2})} guardados!*`;
  }

  // ── METAS ──
  if (/meta|objetivo|sonho|quero|planejar|conquistar/i.test(t)) {
    const valor = parseValor(t);
    const meses = t.match(/(\d+)\s*(mes|ano)/) ? (t.includes("ano") ? parseInt(t.match(/(\d+)/)[1])*12 : parseInt(t.match(/(\d+)/)[1])) : 12;
    if (valor) {
      const porMes = valor / meses;
      const porSemana = porMes / 4.3;
      const porDia = porMes / 30;
      return `🎯 **Plano de Meta Financeira**\n\n🏆 Objetivo: **R$ ${valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n📅 Prazo: **${meses} meses**\n\n**Para chegar lá, você precisa guardar:**\n• Por mês: **R$ ${porMes.toLocaleString("pt-BR",{minimumFractionDigits:2})}**\n• Por semana: R$ ${porSemana.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n• Por dia: R$ ${porDia.toLocaleString("pt-BR",{minimumFractionDigits:2})}\n\n**Estratégia recomendada:**\n✅ Abra uma conta separada só para essa meta\n✅ Automatize o depósito mensal\n✅ Invista em CDB ou Tesouro Direto para render mais\n\n💪 *Você consegue! Cada real guardado é um passo mais perto do seu objetivo.*`;
    }
    return `🎯 **Como definir uma meta que funciona:**\n\n1. **Seja específico** — "Quero R$ 10.000 em 12 meses" é melhor que "quero economizar"\n2. **Divida em etapas** — metas mensais são mais fáceis de acompanhar\n3. **Registre o progresso** — celebre cada avanço\n4. **Tenha um porquê** — viagem, casa, segurança. Isso te mantém motivado\n\n💡 *Me diga o valor e o prazo da sua meta que eu calculo exatamente quanto guardar por mês!*`;
  }

  // ── LEMBRETES & TAREFAS ──
  if (/lembrete|tarefa|fazer|lista|compromisso|agenda|organiz/i.test(t)) {
    const hora = t.match(/(\d{1,2}[h:]\d{0,2}|\d{1,2}\s*hora)/i);
    const tarefas = t.match(/(?:fazer|comprar|pagar|ligar|enviar|estudar|ir)\s+[\w\s]+/gi);
    if (tarefas && tarefas.length > 0) {
      const lista = tarefas.map((trf, i) => `${i+1}. ☐ ${trf.trim()}`).join("\n");
      return `📋 **Lista de Tarefas criada!**\n\n${lista}\n\n${hora ? `⏰ Horário: ${hora[0]}\n\n` : ""}💡 *Dica: Priorize as 3 tarefas mais importantes do dia. O resto é bônus!*`;
    }
    return `📋 **Organização de Tarefas**\n\nPara organizar bem seu dia, use o método **MIT (Most Important Tasks)**:\n\n🔴 **Urgente e importante** — faça agora\n🟡 **Importante, não urgente** — agende\n🟢 **Urgente, não importante** — delegue\n⬜ **Nem urgente nem importante** — elimine\n\n💡 *Me diga o que você precisa fazer hoje e eu monto sua lista de tarefas!*`;
  }

  // ── SAUDAÇÃO ──
  if (/oi|olá|hey|bom dia|boa tarde|boa noite|tudo bem|como vai/i.test(t)) {
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    return `${saudacao}! 👋 Sou o **Nexo**, seu assistente pessoal.\n\nPosso te ajudar com:\n\n💰 **Finanças** — controle de gastos e orçamento\n🧮 **Cálculos** — juros, parcelamentos, investimentos\n📋 **Tarefas** — organização e lembretes\n🎯 **Metas** — planejamento e acompanhamento\n\nO que você precisa hoje?`;
  }

  // ── RESPOSTA GENÉRICA ──
  return `Entendi! Para te ajudar melhor, posso calcular e analisar:\n\n💰 **Finanças** — *"Gastei R$ 150 no mercado"* ou *"Monte um orçamento com R$ 4.000"*\n🧮 **Investimentos** — *"Quanto rende R$ 5.000 no CDB a 12% ao ano?"*\n📋 **Tarefas** — *"Preciso fazer: pagar boleto, ligar pro médico"*\n🎯 **Metas** — *"Quero juntar R$ 10.000 em 12 meses"*\n\nTente ser específico e eu te dou uma resposta precisa! 😊`;
}

// ── Componente ──────────────────────────────────────────────────────────────
const suggestedPrompts = [
  { icon: "💰", text: "Quanto rende R$ 5.000 no CDB a 12% ao ano?" },
  { icon: "📋", text: "Preciso fazer: pagar conta, comprar mantimentos, ligar pro banco" },
  { icon: "📊", text: "Monte um orçamento mensal com R$ 3.500" },
  { icon: "🎯", text: "Quero economizar R$ 10.000 em 12 meses" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setStarted(true);
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    setTimeout(() => {
      const reply = gerarResposta(userText);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  }

  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#e8e8f0",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(120,80,255,0.2)",
        background: "rgba(255,255,255,0.03)",
        display: "flex", alignItems: "center", gap: 12,
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #7850ff, #00d4aa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: "bold",
          boxShadow: "0 0 20px rgba(120,80,255,0.4)",
        }}>N</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>Nexo</div>
          <div style={{ fontSize: 12, color: "#00d4aa", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
            Assistente pessoal inteligente
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(232,232,240,0.4)", textAlign: "right" }}>
          Finanças · Cálculos · Tarefas · Metas
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {!started && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 24, paddingTop: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                background: "linear-gradient(135deg, #7850ff, #00d4aa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, boxShadow: "0 0 40px rgba(120,80,255,0.3)",
              }}>🧠</div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
                Olá! Eu sou o{" "}
                <span style={{ background: "linear-gradient(90deg,#7850ff,#00d4aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nexo</span>
              </h2>
              <p style={{ margin: "8px 0 0", color: "rgba(232,232,240,0.6)", fontSize: 14 }}>
                Seu assistente pessoal. Como posso te ajudar hoje?
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 480 }}>
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(120,80,255,0.25)",
                  borderRadius: 12, padding: "12px 14px",
                  color: "#e8e8f0", cursor: "pointer", textAlign: "left",
                  fontSize: 13, lineHeight: 1.4, transition: "all 0.2s",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,80,255,0.15)"; e.currentTarget.style.borderColor = "rgba(120,80,255,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(120,80,255,0.25)"; }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span>{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: 10, alignItems: "flex-end",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #7850ff, #00d4aa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: "bold",
              }}>N</div>
            )}
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #7850ff, #5a35d4)"
                : "rgba(255,255,255,0.07)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px", fontSize: 14, lineHeight: 1.7,
              border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              boxShadow: msg.role === "user" ? "0 4px 20px rgba(120,80,255,0.3)" : "none",
            }}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #7850ff, #00d4aa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: "bold",
            }}>N</div>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#7850ff",
                  animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px 20px",
        borderTop: "1px solid rgba(120,80,255,0.15)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(120,80,255,0.3)",
          borderRadius: 16, padding: "8px 8px 8px 16px",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Pergunte sobre finanças, cálculos, tarefas ou metas..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e8e8f0", fontSize: 14, resize: "none", lineHeight: 1.5,
              fontFamily: "inherit", maxHeight: 120, overflowY: "auto", paddingTop: 4,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 10, border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #7850ff, #00d4aa)"
                : "rgba(255,255,255,0.1)",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
              boxShadow: input.trim() && !loading ? "0 4px 15px rgba(120,80,255,0.4)" : "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(232,232,240,0.3)", textAlign: "center" }}>
          Nexo · Shift+Enter para nova linha
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(120,80,255,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}
