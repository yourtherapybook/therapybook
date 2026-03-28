from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "therapybook-app-summary.pdf"


TITLE = "TherapyBook"
SUBTITLE = "App Summary"

WHAT_IT_IS = (
    "TherapyBook is a Next.js web app for matching clients with supervised "
    "trainee therapists, booking online sessions, and handling trainee "
    "onboarding plus admin review. The repo includes public marketing flows "
    "and authenticated APIs for users, applications, sessions, payments, "
    "uploads, reminders, and role-based access."
)

WHO_ITS_FOR = (
    "Primary persona: people seeking lower-cost online therapy from supervised "
    "trainee practitioners."
)

WHAT_IT_DOES = [
    "Public landing, pricing, privacy, and directory pages.",
    "Questionnaire-based therapist matching and directory filtering; current matching data comes from in-repo constants.",
    "Email/password registration, email verification, sign-in, password reset, and profile updates.",
    "Four-step trainee application flow with auto-save, referrals, profile setup, and agreements.",
    "Session booking, rescheduling, cancellation, therapist availability management, and post-session rating.",
    "Email confirmations/reminders plus document uploads through presigned Cloudflare R2 URLs.",
    "Role-gated admin views for applications, users, sessions, and platform KPIs.",
]

HOW_IT_WORKS = [
    "Frontend: Next.js 16 with React 19 and Tailwind; routes live in app/, with some API handlers still in pages/api/.",
    "Auth and access: NextAuth credential auth with Prisma adapter; middleware gates /admin, /supervisor, and /trainee-dashboard.",
    "Data layer: Prisma models back PostgreSQL for users, trainee applications, sessions, payments, availability, documents, and audit logs.",
    "Integrations: Resend for email, Redis/Upstash plus BullMQ for rate limits/queues, Cloudflare R2 for uploads, Dexie/Zustand for local browser state.",
    "Evidence gaps: .env.example, deployment docs, live video signaling backend, and a non-demo matching service were not found in repo.",
]

HOW_TO_RUN = [
    "Install deps: npm install",
    "Create .env manually; .env.example was not found in repo. Code references DATABASE_URL and optional RESEND_API_KEY, NEXTAUTH_URL, KV_URL, R2_*, CRON_SECRET, and ADMIN_ALERT_EMAIL.",
    "Generate Prisma client: npm run db:generate",
    "Prepare the database: npm run db:migrate (or npm run db:push for local dev)",
    "Start the app: npm run dev",
]


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=25,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=12,
            textColor=colors.HexColor("#ff7f50"),
        ),
        "section": ParagraphStyle(
            "Section",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            textColor=colors.HexColor("#111827"),
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.4,
            textColor=colors.HexColor("#374151"),
            spaceAfter=4,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.0,
            leftIndent=0,
            textColor=colors.HexColor("#374151"),
            spaceAfter=2,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.4,
            leading=9,
            textColor=colors.HexColor("#6b7280"),
        ),
    }


def bullet_paragraph(text: str, styles: dict) -> Paragraph:
    return Paragraph(f"- {text}", styles["bullet"])


def section_block(title: str, body, styles: dict):
    block = [Paragraph(title, styles["section"])]
    if isinstance(body, str):
        block.append(Paragraph(body, styles["body"]))
    else:
        block.extend(bullet_paragraph(item, styles) for item in body)
    return block


def build_column(sections, styles):
    flow = []
    for title, body in sections:
        flow.extend(section_block(title, body, styles))
        flow.append(Spacer(1, 0.07 * inch))
    if flow:
        flow.pop()
    return flow


def generate():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.45 * inch,
    )

    left_sections = [
        ("What It Is", WHAT_IT_IS),
        ("Who It's For", WHO_ITS_FOR),
        ("What It Does", WHAT_IT_DOES),
    ]
    right_sections = [
        ("How It Works", HOW_IT_WORKS),
        ("How To Run", HOW_TO_RUN),
    ]

    title_block = [
        Paragraph(TITLE, styles["title"]),
        Paragraph(SUBTITLE, styles["subtitle"]),
        Spacer(1, 0.16 * inch),
    ]

    columns = Table(
        [[build_column(left_sections, styles), build_column(right_sections, styles)]],
        colWidths=[3.45 * inch, 3.45 * inch],
    )
    columns.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    footer = Paragraph(
        "Repo evidence only. Missing setup template and deployment guidance are marked above as Not found in repo.",
        styles["footer"],
    )

    story = title_block + [columns, Spacer(1, 0.12 * inch), footer]

    def draw_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#fff7f3"))
        canvas.roundRect(
            doc.leftMargin,
            doc.pagesize[1] - 1.1 * inch,
            doc.width,
            0.55 * inch,
            12,
            fill=1,
            stroke=0,
        )
        canvas.setStrokeColor(colors.HexColor("#ffd7c9"))
        canvas.setLineWidth(1)
        canvas.line(doc.leftMargin, doc.bottomMargin + 0.18 * inch, doc.pagesize[0] - doc.rightMargin, doc.bottomMargin + 0.18 * inch)
        canvas.restoreState()

    doc.build(story, onFirstPage=draw_page)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    generate()
