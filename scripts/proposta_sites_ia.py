# -*- coding: utf-8 -*-
"""Gera a Proposta Comercial — Sites & IA (nova empresa, marca a definir)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

W, H = A4
M = 64  # margem

DARK = HexColor("#14161f")
DARK2 = HexColor("#1b1e2b")
GOLD = HexColor("#c9a227")
GOLD_SOFT = HexColor("#b08f3a")
BLUE = HexColor("#2f6cf0")
INK = HexColor("#1a1c24")
GRAY = HexColor("#5a5f6e")
LGRAY = HexColor("#9aa0ae")
LINE = HexColor("#e3e5ea")
PANEL = HexColor("#f6f7f9")
WHITE = HexColor("#ffffff")
AMBER_BG = HexColor("#fdf6e7")
AMBER_BD = HexColor("#e8d9b0")

c = canvas.Canvas("Proposta_Sites_IA.pdf", pagesize=A4)
c.setTitle("Proposta Comercial — Sites & Inteligência Artificial")


def kicker(x, y, text, color=GOLD, size=8):
    c.setFont("Helvetica-Bold", size)
    c.setFillColor(color)
    c.drawString(x, y, " ".join(list(text.upper())).replace("   ", "  "))


def wrap(text, font, size, maxw):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if c.stringWidth(t, font, size) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


def para(x, y, text, font="Helvetica", size=9.5, color=GRAY, maxw=W - 2 * M, leading=14):
    c.setFont(font, size)
    c.setFillColor(color)
    for ln in wrap(text, font, size, maxw):
        c.drawString(x, y, ln)
        y -= leading
    return y


def head(title, tag):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(M, H - 78, title)
    kicker(W - M - c.stringWidth(" ".join(list(tag.upper())), "Helvetica-Bold", 8), H - 76, tag, GRAY)
    c.setStrokeColor(INK)
    c.setLineWidth(2)
    c.line(M, H - 92, W - M, H - 92)


def footer(left, right):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(M, 56, W - M, 56)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(LGRAY)
    c.drawString(M, 44, left)
    c.drawRightString(W - M, 44, right)


def rrect(x, y, w_, h_, r=10, fill=PANEL, stroke=LINE):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w_, h_, r, stroke=1, fill=1)


def bullet(x, y, text, color=BLUE, size=8.8):
    c.setFillColor(color)
    c.circle(x + 2.4, y + 2.6, 1.7, stroke=0, fill=1)
    c.setFont("Helvetica", size)
    c.setFillColor(HexColor("#3a3e4a"))
    c.drawString(x + 11, y, text)


def plan_card(y_top, h_, badge, name, sub, price, price_sub, feats, ideal, badge_color=BLUE):
    x, w_ = M, W - 2 * M
    rrect(x, y_top - h_, w_, h_, 12, WHITE, LINE)
    kicker(x + 22, y_top - 26, badge, badge_color)
    c.setFont("Helvetica-Bold", 14.5)
    c.setFillColor(INK)
    c.drawString(x + 22, y_top - 46, name)
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY)
    c.drawString(x + 22, y_top - 61, sub)
    kicker(x + w_ - 22 - c.stringWidth("I N V E S T I M E N T O", "Helvetica-Bold", 7), y_top - 24, "Investimento", LGRAY, 7)
    c.setFont("Helvetica-Bold", 15)
    c.setFillColor(INK)
    c.drawRightString(x + w_ - 22, y_top - 44, price)
    c.setFont("Helvetica", 8)
    c.setFillColor(LGRAY)
    c.drawRightString(x + w_ - 22, y_top - 57, price_sub)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(x + 22, y_top - 72, x + w_ - 22, y_top - 72)
    fy = y_top - 90
    col2 = x + w_ / 2 + 6
    for i, f in enumerate(feats):
        fx = x + 22 if i % 2 == 0 else col2
        bullet(fx, fy, f)
        if i % 2 == 1:
            fy -= 19
    if len(feats) % 2 == 1:
        fy -= 19
    rrect(x + 22, fy - 16, w_ - 44, 24, 5, PANEL, PANEL)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#3a3e4a"))
    c.drawString(x + 32, fy - 7, "Ideal para: ")
    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY)
    c.drawString(x + 32 + c.stringWidth("Ideal para: ", "Helvetica-Bold", 8), fy - 7, ideal)


# ================= CAPA =================
c.setFillColor(DARK)
c.rect(0, 0, W, H, stroke=0, fill=1)
kicker(M, H - 130, "Proposta · Sites & Inteligência Artificial", GOLD_SOFT)
c.setFillColor(WHITE)
c.setFont("Helvetica-Bold", 40)
c.drawString(M, H - 190, "Seu negócio com")
c.drawString(M, H - 238, "site profissional e")
c.drawString(M, H - 286, "IA que atende por você.")
yy = para(M, H - 330,
          "Sites feitos para gerar contato e agentes de inteligência artificial que respondem, "
          "qualificam e organizam seus clientes — 24 horas por dia.",
          "Helvetica", 11, HexColor("#b9bdc9"), 380, 17)

# marca a definir
rrect(M, H - 470, 250, 54, 8, DARK2, HexColor("#2a2e3e"))
kicker(M + 16, H - 436, "Sua marca aqui", GOLD_SOFT, 7)
c.setFont("Helvetica-Bold", 15)
c.setFillColor(HexColor("#7d8295"))
c.drawString(M + 16, H - 458, "[ NOME DA EMPRESA ]")

cols = [("Sites", "Pagamento único, sem mensalidade"),
        ("Agentes de IA", "Implantação + assinatura mensal"),
        ("Case real no ar", "Plataforma com IA em produção")]
cx = M
for t, s in cols:
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(WHITE)
    c.drawString(cx, 270, t)
    c.setFont("Helvetica", 8)
    c.setFillColor(HexColor("#8d92a3"))
    c.drawString(cx, 256, s)
    cx += 160

c.setStrokeColor(HexColor("#2a2e3e"))
c.setLineWidth(0.7)
c.line(M, 90, W - M, 90)
c.setFont("Helvetica", 7.5)
c.setFillColor(HexColor("#7d8295"))
c.drawString(M, 76, "Proposta comercial")
c.drawRightString(W - M, 76, "Junho / 2026")
c.showPage()

# ================= POR QUE SITES + IA =================
head("Por que site + IA, juntos", "A oportunidade")
y = para(M, H - 122,
         "O site faz o cliente te encontrar e confiar. A IA garante que nenhum contato fique sem resposta — "
         "de madrugada, no fim de semana, enquanto você trabalha. Separados já ajudam; juntos viram um "
         "sistema completo: atrair, atender e converter.", maxw=W - 2 * M)

cards = [
    ("Atendimento 24h", "Um agente de IA responde dúvidas, apresenta seus serviços e coleta o contato do cliente a qualquer hora — com a linguagem do seu negócio."),
    ("Nenhum lead perdido", "Cada conversa vira um registro organizado: quem perguntou, o que pediu e como responder. Nada se perde no WhatsApp lotado."),
    ("Site que vende", "Páginas rápidas, textos pensados para converter e rastreamento pronto para anúncios — a base que já entregamos e validamos."),
    ("Painel do dono", "Você enxerga tudo: conversas, pedidos, leads e o que seus clientes mais procuram — para decidir com dado, não com achismo."),
]
cw, ch = (W - 2 * M - 16) / 2, 96
positions = [(M, H - 170), (M + cw + 16, H - 170), (M, H - 170 - ch - 14), (M + cw + 16, H - 170 - ch - 14)]
for (t, d), (px, py) in zip(cards, positions):
    rrect(px, py - ch, cw, ch, 10, WHITE, LINE)
    c.setFillColor(HexColor("#e9efff"))
    c.roundRect(px + 16, py - 36, 24, 24, 6, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(px + 28, py - 29, "✓")
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(INK)
    c.drawString(px + 16, py - 52, t)
    yy = py - 66
    c.setFont("Helvetica", 8.2)
    c.setFillColor(GRAY)
    for ln in wrap(d, "Helvetica", 8.2, cw - 32):
        c.drawString(px + 16, yy, ln)
        yy -= 11.5

# case
cy = H - 170 - 2 * ch - 14 - 26
rrect(M, cy - 86, W - 2 * M, 86, 10, AMBER_BG, AMBER_BD)
kicker(M + 20, cy - 22, "Case real — no ar agora", GOLD_SOFT, 7.5)
c.setFont("Helvetica-Bold", 11)
c.setFillColor(INK)
c.drawString(M + 20, cy - 40, "Ecossistema Paulo Kasmirscki — paulokasmirscki.com.br")
para(M + 20, cy - 56,
     "Plataforma com concierge de IA que conecta clientes a empresas da rede, área de membros, captura de "
     "leads e painel de gestão completo. É a tecnologia desta proposta, funcionando em produção — peça uma demonstração.",
     "Helvetica", 8.4, HexColor("#6b6149"), W - 2 * M - 40, 12)
footer("Proposta — Sites & IA", "Junho 2026")
c.showPage()

# ================= PLANOS DE SITES =================
head("Sites — três níveis", "Pagamento único")
para(M, H - 122,
     "Cada plano atende um momento do negócio. Pagamento único, sem mensalidade: alterações "
     "futuras são orçadas por demanda.", maxw=W - 2 * M)

plan_card(H - 165, 150, "Plano Básico", "Presença Essencial",
          "Para marcar presença online de forma profissional.",
          "R$ 1.500", "pagamento único",
          ["Site de uma página, responsivo", "Até 4–5 seções",
           "Botão e formulário de WhatsApp", "Google Meu Negócio configurado",
           "Rastreamento básico instalado", "Hospedagem leve e rápida"],
          "autônomos e pequenos negócios que precisam de um endereço digital sério.")

plan_card(H - 335, 150, "Plano Intermediário · Mais escolhido", "Presença + Conversão",
          "Para o site trabalhar a seu favor e gerar contato.",
          "R$ 3.500", "pagamento único",
          ["Site com várias páginas (4–8)", "Páginas por serviço ou cidade",
           "Rastreamento de anúncios completo", "SEO local para aparecer no Google",
           "Formulários inteligentes", "Textos escritos para converter"],
          "negócios que querem ser encontrados e receber contatos com constância.", BLUE)

plan_card(H - 505, 150, "Plano Premium", "Sistema de Aquisição",
          "Não é só um site — é uma estrutura para atrair clientes.",
          "a partir de R$ 8.000", "conforme escopo",
          ["Tudo do Intermediário, ampliado", "Captura e organização de contatos",
           "Painel de acompanhamento", "Diagnóstico digital do negócio",
           "Landing pages de campanha", "Estrutura pronta para escalar"],
          "empresas que querem previsibilidade na chegada de clientes.", GOLD_SOFT)
footer("Proposta — Sites & IA", "Junho 2026")
c.showPage()

# ================= PLANOS DE IA =================
head("Inteligência Artificial — três níveis", "Implantação + mensalidade")
para(M, H - 122,
     "Os agentes de IA têm duas partes: a implantação (construção, treinamento com o conteúdo do seu negócio "
     "e integração) e a assinatura mensal (que mantém a IA no ar, atualizada e com suporte).", maxw=W - 2 * M)

plan_card(H - 175, 150, "IA Essencial", "Atendente Virtual",
          "Sua empresa responde na hora, todos os dias.",
          "R$ 2.000 + R$ 247/mês", "implantação + assinatura",
          ["Agente de IA no site ou WhatsApp", "Treinado com seus serviços e preços",
           "Respostas 24h em linguagem natural", "Coleta nome e contato do cliente",
           "Encaminhamento pro seu WhatsApp", "Ajustes de conteúdo inclusos"],
          "negócios que perdem cliente por demora no atendimento.")

plan_card(H - 345, 150, "IA Atendimento + Vendas · Mais escolhido", "Agente Comercial",
          "A IA qualifica o cliente e organiza sua fila de vendas.",
          "R$ 4.000 + R$ 447/mês", "implantação + assinatura",
          ["Tudo do Essencial, ampliado", "Qualificação de leads por interesse",
           "Painel com conversas e pedidos", "Registro de leads com status",
           "Sugestões do que os clientes pedem", "Relatório mensal de uso"],
          "empresas com fluxo de contatos que precisam de organização e conversão.", BLUE)

plan_card(H - 515, 150, "IA Sob Medida", "Solução Personalizada",
          "Plataformas com IA desenhadas pro seu modelo de negócio.",
          "a partir de R$ 8.000 + R$ 697/mês", "conforme escopo",
          ["Agentes com fluxos personalizados", "Integração com seus sistemas",
           "Áreas de acesso exclusivo (membros)", "Automações de processos internos",
           "Painel de gestão sob medida", "Evolução contínua da solução"],
          "quem quer a IA no centro da operação — como o case do ecossistema.", GOLD_SOFT)
footer("Proposta — Sites & IA", "Junho 2026")
c.showPage()

# ================= COMBOS + COMPARATIVO =================
head("Combos e comparativo", "Site + IA")
para(M, H - 122, "Contratando site e IA juntos, a implantação da IA tem desconto — a base técnica é aproveitada.",
     maxw=W - 2 * M)

combos = [
    ("Começar certo", "Site Básico + IA Essencial", "R$ 3.000 + R$ 247/mês", "economia de R$ 500 na implantação"),
    ("Crescer (mais escolhido)", "Site Intermediário + IA Atendimento", "R$ 6.500 + R$ 447/mês", "economia de R$ 1.000 na implantação"),
    ("Dominar", "Site Premium + IA Sob Medida", "sob consulta", "projeto integrado, escopo conjunto"),
]
ccw = (W - 2 * M - 32) / 3
cx = M
for t, s, p, e in combos:
    rrect(cx, H - 268, ccw, 118, 10, WHITE, LINE)
    kicker(cx + 14, H - 172, t, BLUE if "escolhido" in t else GOLD_SOFT, 6.5)
    yy = H - 190
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(INK)
    for ln in wrap(s, "Helvetica-Bold", 9.5, ccw - 28):
        c.drawString(cx + 14, yy, ln)
        yy -= 12
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(HexColor("#1f4fd8"))
    yy -= 4
    for ln in wrap(p, "Helvetica-Bold", 11, ccw - 28):
        c.drawString(cx + 14, yy, ln)
        yy -= 13
    c.setFont("Helvetica", 7.5)
    c.setFillColor(LGRAY)
    for ln in wrap(e, "Helvetica", 7.5, ccw - 28):
        c.drawString(cx + 14, yy, ln)
        yy -= 10
    cx += ccw + 16

# tabela comparativa
ty = H - 300
rows = [
    ("O QUE ESTÁ INCLUÍDO", "ESSENCIAL", "ATEND.+VENDAS", "SOB MEDIDA"),
    ("Agente de IA 24h (site/WhatsApp)", "●", "●", "●"),
    ("Treinado com o seu negócio", "●", "●", "●"),
    ("Captura de nome e contato", "●", "●", "●"),
    ("Qualificação de leads + status", "—", "●", "●"),
    ("Painel de conversas e pedidos", "—", "●", "●"),
    ("Integrações e fluxos sob medida", "—", "—", "●"),
    ("Área de membros / automações", "—", "—", "●"),
    ("Implantação", "R$ 2.000", "R$ 4.000", "a partir de R$ 8.000"),
    ("Assinatura mensal", "R$ 247", "R$ 447", "R$ 697"),
]
col_x = [M, M + 250, M + 330, M + 425]
for i, row in enumerate(rows):
    yrow = ty - i * 19
    if i == 0:
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(LGRAY)
    else:
        c.setFont("Helvetica-Bold" if i >= len(rows) - 2 else "Helvetica", 8)
        c.setFillColor(INK if i >= len(rows) - 2 else HexColor("#3a3e4a"))
    base_color = (
        LGRAY if i == 0 else INK if i >= len(rows) - 2 else HexColor("#3a3e4a")
    )
    for j, cell in enumerate(row):
        if j == 0:
            c.drawString(col_x[0], yrow, cell)
        else:
            if cell == "●":
                c.setFillColor(BLUE)
            elif cell == "—":
                c.setFillColor(LGRAY)
            c.drawCentredString(col_x[j] + 30, yrow, cell)
            c.setFillColor(base_color)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(M, yrow - 6, W - M, yrow - 6)

# como funciona + CTA
fy = ty - len(rows) * 19 - 30
c.setFont("Helvetica-Bold", 12)
c.setFillColor(INK)
c.drawString(M, fy, "Como funciona")
steps = [("1", "Conversa", "Entendemos seu negócio e seu atendimento."),
         ("2", "Proposta", "Plano e escopo certos pro seu caso."),
         ("3", "Construção", "Site e IA criados e treinados com você."),
         ("4", "No ar", "Tudo publicado, medido e com suporte.")]
sw = (W - 2 * M) / 4
sx = M
for n, t, d in steps:
    c.setFillColor(INK)
    c.circle(sx + 8, fy - 24, 8, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(sx + 8, fy - 27, n)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(INK)
    c.drawString(sx + 22, fy - 27, t)
    yy = fy - 40
    c.setFont("Helvetica", 7.2)
    c.setFillColor(GRAY)
    for ln in wrap(d, "Helvetica", 7.2, sw - 26):
        c.drawString(sx, yy, ln)
        yy -= 9.5
    sx += sw

cta_y = fy - 78
rrect(M, cta_y - 86, W - 2 * M, 86, 12, DARK, DARK)
c.setFont("Helvetica-Bold", 15)
c.setFillColor(WHITE)
c.drawString(M + 24, cta_y - 30, "Vamos colocar a IA pra trabalhar pra você?")
para(M + 24, cta_y - 46, "A primeira conversa é um diagnóstico gratuito do seu atendimento e da sua presença digital.",
     "Helvetica", 8.5, HexColor("#b9bdc9"), W - 2 * M - 48, 12)
kicker(M + 24, cta_y - 70, "WhatsApp", GOLD_SOFT, 6.5)
c.setFont("Helvetica-Bold", 9)
c.setFillColor(WHITE)
c.drawString(M + 24, cta_y - 81, "( ) _____-_____")
kicker(M + 190, cta_y - 70, "E-mail", GOLD_SOFT, 6.5)
c.drawString(M + 190, cta_y - 81, "contato@[empresa].com.br")
kicker(M + 370, cta_y - 70, "Demonstração", GOLD_SOFT, 6.5)
c.drawString(M + 370, cta_y - 81, "paulokasmirscki.com.br")

footer("Proposta — Sites & IA · Valores válidos por 30 dias", "Junho 2026")
c.showPage()

c.save()
print("OK: Proposta_Sites_IA.pdf")
