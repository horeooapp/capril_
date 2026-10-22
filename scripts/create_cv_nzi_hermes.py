from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    FrameBreak,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "CV_NZI_Hermes_2026.pdf"


def register_fonts():
    fonts = Path("C:/Windows/Fonts")
    candidates = {
        "CVSans": fonts / "arial.ttf",
        "CVSans-Bold": fonts / "arialbd.ttf",
        "CVSans-Italic": fonts / "ariali.ttf",
    }
    for name, path in candidates.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
    return "CVSans" if "CVSans" in pdfmetrics.getRegisteredFontNames() else "Helvetica"


FONT = register_fonts()
BOLD = "CVSans-Bold" if "CVSans-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
ITALIC = "CVSans-Italic" if "CVSans-Italic" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Oblique"

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#5f6368")
RULE = colors.HexColor("#d7d7d7")
ACCENT = colors.HexColor("#b11226")
SIDEBAR_BG = colors.HexColor("#f3f3f1")


styles = {
    "name": ParagraphStyle(
        "name",
        fontName=BOLD,
        fontSize=25,
        leading=28,
        textColor=INK,
        spaceAfter=2 * mm,
    ),
    "headline": ParagraphStyle(
        "headline",
        fontName=FONT,
        fontSize=10.5,
        leading=14,
        textColor=ACCENT,
        spaceAfter=5 * mm,
    ),
    "section": ParagraphStyle(
        "section",
        fontName=BOLD,
        fontSize=9.5,
        leading=12,
        textColor=INK,
        uppercase=True,
        spaceBefore=3 * mm,
        spaceAfter=2 * mm,
    ),
    "side_section": ParagraphStyle(
        "side_section",
        fontName=BOLD,
        fontSize=8.5,
        leading=11,
        textColor=INK,
        uppercase=True,
        spaceBefore=4 * mm,
        spaceAfter=1.6 * mm,
    ),
    "body": ParagraphStyle(
        "body",
        fontName=FONT,
        fontSize=9,
        leading=12.2,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=2 * mm,
    ),
    "small": ParagraphStyle(
        "small",
        fontName=FONT,
        fontSize=8.4,
        leading=11.2,
        textColor=INK,
        spaceAfter=1.8 * mm,
    ),
    "muted": ParagraphStyle(
        "muted",
        fontName=FONT,
        fontSize=8.2,
        leading=10.8,
        textColor=MUTED,
        spaceAfter=1.2 * mm,
    ),
    "role": ParagraphStyle(
        "role",
        fontName=BOLD,
        fontSize=10.2,
        leading=12.5,
        textColor=INK,
        spaceBefore=1.2 * mm,
        spaceAfter=0.8 * mm,
    ),
    "date": ParagraphStyle(
        "date",
        fontName=BOLD,
        fontSize=8.2,
        leading=10.5,
        textColor=ACCENT,
        spaceAfter=0.8 * mm,
    ),
    "bullet": ParagraphStyle(
        "bullet",
        fontName=FONT,
        fontSize=8.8,
        leading=11.5,
        textColor=INK,
        leftIndent=4 * mm,
        firstLineIndent=-2.5 * mm,
        bulletIndent=0,
        spaceAfter=0.9 * mm,
    ),
}


def p(text, style="body", **kwargs):
    return Paragraph(text, styles[style], **kwargs)


def bullet(text):
    return Paragraph(text, styles["bullet"], bulletText="•")


def section(title, side=False):
    return p(title.upper(), "side_section" if side else "section")


def draw_page(canvas, _doc):
    canvas.saveState()
    sidebar_w = 62 * mm
    canvas.setFillColor(SIDEBAR_BG)
    canvas.rect(0, 0, sidebar_w, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE_H - 8 * mm, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.6)
    canvas.line(sidebar_w, 14 * mm, sidebar_w, PAGE_H - 14 * mm)
    canvas.restoreState()


def experience_block(date, role, org, bullets, note=None):
    parts = [p(date, "date"), p(f"{role}<br/><font name='{ITALIC}'>{org}</font>", "role")]
    if note:
        parts.append(p(note, "muted"))
    parts.extend(bullet(item) for item in bullets)
    parts.append(Spacer(1, 1.8 * mm))
    return KeepTogether(parts)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0,
        title="CV - N'ZI Hermes",
        author="N'ZI Hermes",
    )
    side = Frame(10 * mm, 16 * mm, 44 * mm, PAGE_H - 32 * mm, leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0)
    main = Frame(72 * mm, 18 * mm, PAGE_W - 84 * mm, PAGE_H - 38 * mm, leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0)
    doc.addPageTemplates([PageTemplate(id="cv", frames=[side, main], onPage=draw_page)])

    story = []
    story.extend(
        [
            p("N'ZI Hermes", "name"),
            p("Assistante administrative | Communication | Finance-comptabilité", "headline"),
            section("Contact", side=True),
            p("Téléphone<br/><b>07 89 30 18 69</b>", "small"),
            p("E-mail<br/><b>hermesnzi@gmail.com</b>", "small"),
            section("État civil", side=True),
            p("Née le 31/05/2001 à Yopougon<br/>25 ans<br/>Nationalité ivoirienne<br/>Célibataire, un enfant", "small"),
            section("Compétences clés", side=True),
            bullet("Accueil, secrétariat et assistance administrative"),
            bullet("Communication institutionnelle et suivi relationnel"),
            bullet("Organisation, classement et gestion des priorités"),
            bullet("Notions solides en finance-comptabilité"),
            bullet("Sens commercial et relation client"),
            section("Informatique", side=True),
            p("Word : usage courant<br/>Excel : usage courant", "small"),
            section("Langues", side=True),
            p("Français : excellent<br/>Anglais : niveau scolaire", "small"),
            section("Centres d'intérêt", side=True),
            p("Lecture, voyage, yoga", "small"),
            FrameBreak(),
        ]
    )

    story.extend(
        [
            section("Profil professionnel"),
            p(
                "Titulaire d'un BTS Finance-Comptabilité, avec une expérience confirmée en accueil, animation commerciale, évènementiel, assistance et communication. "
                "Personne organisée, présentable et impliquée, dotée d'un bon sens relationnel et d'une réelle capacité d'adaptation. "
                "Recherche un environnement structuré permettant de renforcer ses compétences et d'évoluer durablement vers des responsabilités administratives, comptables ou de communication.",
                "body",
            ),
            section("Expérience professionnelle"),
            experience_block(
                "Depuis mars 2025",
                "Assistante auprès de la Direction générale",
                "DG Habiteax",
                [
                    "Appui administratif à la Direction générale et suivi des activités courantes.",
                    "Organisation des informations, préparation des supports et coordination des échanges.",
                    "Gestion des priorités avec rigueur, discrétion et sens du service.",
                ],
                "Poste exercé concomitamment avec la fonction de Chargée de communication du Président pays au sein de l'ONG International ADN.",
            ),
            experience_block(
                "Depuis mars 2025",
                "Chargée de communication du Président pays",
                "ONG International ADN",
                [
                    "Contribution à la communication institutionnelle et au suivi de l'image de l'organisation.",
                    "Appui à la préparation des messages, supports et actions de communication.",
                    "Interface relationnelle avec les interlocuteurs internes et externes.",
                ],
                "Poste exercé concomitamment avec la fonction d'Assistante auprès de la Direction générale de DG Habiteax.",
            ),
            experience_block(
                "2023 - 2024",
                "Hôtesse en évènementiel",
                "Orange Money - Cap Sud",
                [
                    "Accueil, orientation et information des clients sur un poste fixe.",
                    "Représentation de la marque avec professionnalisme et sens du contact.",
                    "Participation au bon déroulement des opérations commerciales et évènementielles.",
                ],
            ),
            experience_block(
                "2019 - 2021",
                "Animatrice commerciale en supermarchés",
                "Auchan, Carrefour, Sup-Eco et autres enseignes",
                [
                    "Animation commerciale, promotion de produits et relation client.",
                    "Expérience menée en parallèle des études de BTS.",
                    "Développement du sens commercial, de l'autonomie et de la prise d'initiative.",
                ],
            ),
            section("Formation"),
            p("<b>BTS Finance-Comptabilité</b> - obtenu en candidate libre en 2021", "body"),
            p("Préparation encadrée en 2020 au CERFIAT du Plateau.", "muted"),
            p("<b>Baccalauréat série D</b> - Lycée Simone Ehivet Gbagbo, Yopougon-Abidjan - 2018", "body"),
            p("<b>BEPC</b> - Collège Saint Pierre Marie, Yopougon-Abidjan - 2015", "body"),
        ]
    )

    doc.build(story)


if __name__ == "__main__":
    build()
    print(OUT)
