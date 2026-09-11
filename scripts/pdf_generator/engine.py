import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth

class PropLedgerPdfEngine:
    def __init__(self, filename, volume_num, volume_title, volume_category="SYSTEM DESIGN & ARCHITECTURE"):
        self.filename = filename
        self.volume_num = volume_num
        self.volume_title = volume_title
        self.volume_category = volume_category
        self.c = canvas.Canvas(filename, pagesize=letter)
        self.width, self.height = letter
        self.margin_x = 40
        self.printable_width = self.width - (2 * self.margin_x) # 532 pt
        self.current_y = self.height - 50
        self.page_num = 0
        self.current_page_title = ""
        self.current_page_subtitle = ""

    def start_page(self, page_title, page_subtitle=""):
        self.page_num += 1
        self.current_page_title = page_title
        self.current_page_subtitle = page_subtitle
        self.current_y = self.height - 50
        self._draw_header()

    def _draw_header(self):
        # Top banner
        self.c.setFillColor(colors.HexColor('#0f172a')) # Slate 900
        self.c.rect(0, self.height - 28, self.width, 28, fill=1, stroke=0)
        
        # Emerald accent strip
        self.c.setFillColor(colors.HexColor('#059669')) # Emerald 600
        self.c.rect(0, self.height - 30, self.width, 2, fill=1, stroke=0)

        # Header text
        self.c.setFillColor(colors.white)
        self.c.setFont('Helvetica-Bold', 8)
        self.c.drawString(self.margin_x, self.height - 18, f"PROPLEDGER ARCHITECTURE SERIES | VOLUME {self.volume_num:02d}: {self.volume_title.upper()}")
        
        self.c.setFont('Helvetica', 8)
        cat_str = self.volume_category.upper()
        w = stringWidth(cat_str, 'Helvetica', 8)
        self.c.drawString(self.width - self.margin_x - w, self.height - 18, cat_str)

        # Page Title Banner on page
        self.current_y = self.height - 52
        if self.page_num > 1: # Cover page handles its own title layout
            self.c.setFillColor(colors.HexColor('#1e293b')) # Slate 800
            self.c.setFont('Helvetica-Bold', 13)
            self.c.drawString(self.margin_x, self.current_y, self.current_page_title)
            self.current_y -= 15
            
            if self.current_page_subtitle:
                self.c.setFillColor(colors.HexColor('#059669')) # Emerald 600
                self.c.setFont('Helvetica-Bold', 8.5)
                self.c.drawString(self.margin_x, self.current_y, self.current_page_subtitle.upper())
                self.current_y -= 14

            # Subtle separator rule
            self.c.setStrokeColor(colors.HexColor('#e2e8f0'))
            self.c.setLineWidth(0.75)
            self.c.line(self.margin_x, self.current_y, self.width - self.margin_x, self.current_y)
            self.current_y -= 12

    def _draw_footer(self):
        # Footer rule
        self.c.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.c.setLineWidth(0.5)
        self.c.line(self.margin_x, 32, self.width - self.margin_x, 32)

        # Left footer
        self.c.setFillColor(colors.HexColor('#64748b'))
        self.c.setFont('Helvetica', 7.5)
        self.c.drawString(self.margin_x, 20, "PROPLEDGER ENTERPRISE PLATFORM © 2026 | TECHNICAL SPECIFICATION & INTERVIEW HANDBOOK")

        # Right footer
        page_str = f"Page {self.page_num} of 10"
        pw = stringWidth(page_str, 'Helvetica-Bold', 7.5)
        self.c.setFont('Helvetica-Bold', 7.5)
        self.c.setFillColor(colors.HexColor('#0f172a'))
        self.c.drawString(self.width - self.margin_x - pw, 20, page_str)

    def add_section(self, title):
        self.current_y -= 4
        # Section Pill Accent
        self.c.setFillColor(colors.HexColor('#0f172a'))
        self.c.setFont('Helvetica-Bold', 10)
        self.c.drawString(self.margin_x, self.current_y, title)
        self.current_y -= 13

    def add_subsection(self, title):
        self.current_y -= 2
        self.c.setFillColor(colors.HexColor('#0369a1')) # Sky 700
        self.c.setFont('Helvetica-Bold', 8.5)
        self.c.drawString(self.margin_x, self.current_y, title)
        self.current_y -= 11

    def add_paragraph(self, text, font="Helvetica", size=8.2, leading=10.5, color='#334155'):
        self.c.setFillColor(colors.HexColor(color))
        self.c.setFont(font, size)
        words = text.split()
        current_line = []

        for word in words:
            test_line = " ".join(current_line + [word])
            if stringWidth(test_line, font, size) <= self.printable_width:
                current_line.append(word)
            else:
                self.c.drawString(self.margin_x, self.current_y, " ".join(current_line))
                self.current_y -= leading
                current_line = [word]

        if current_line:
            self.c.drawString(self.margin_x, self.current_y, " ".join(current_line))
            self.current_y -= leading
        self.current_y -= 3

    def add_bullet(self, prefix, text, font="Helvetica", size=8.0, leading=10.2):
        bullet_symbol = "•"
        bullet_width = 12
        text_margin = self.margin_x + bullet_width
        available_width = self.printable_width - bullet_width

        # Draw bullet symbol
        self.c.setFillColor(colors.HexColor('#059669')) # Emerald bullet
        self.c.setFont('Helvetica-Bold', 9)
        self.c.drawString(self.margin_x + 2, self.current_y, bullet_symbol)

        # Prefix (Bold) + Body Text
        full_text = f"{prefix}: {text}" if prefix else text
        words = full_text.split()
        current_line = []

        first_line = True
        prefix_words_count = len(prefix.split()) if prefix else 0

        for word in words:
            test_line = " ".join(current_line + [word])
            if stringWidth(test_line, font, size) <= available_width:
                current_line.append(word)
            else:
                # Render line
                line_str = " ".join(current_line)
                self.c.setFillColor(colors.HexColor('#334155'))
                self.c.setFont(font, size)
                self.c.drawString(text_margin, self.current_y, line_str)
                self.current_y -= leading
                current_line = [word]
                first_line = False

        if current_line:
            line_str = " ".join(current_line)
            self.c.setFillColor(colors.HexColor('#334155'))
            self.c.setFont(font, size)
            self.c.drawString(text_margin, self.current_y, line_str)
            self.current_y -= leading
        self.current_y -= 2

    def add_code_block(self, code_str, language="Java / SQL / TypeScript", max_lines=18):
        lines = [line for line in code_str.strip().split('\n')][:max_lines]
        line_height = 9.2
        padding = 6
        block_height = (len(lines) * line_height) + (2 * padding) + 12

        # Background Box
        self.c.setFillColor(colors.HexColor('#0f172a')) # Dark Slate Background
        self.c.roundRect(self.margin_x, self.current_y - block_height, self.printable_width, block_height, 4, fill=1, stroke=0)

        # Header tag
        self.c.setFillColor(colors.HexColor('#1e293b'))
        self.c.roundRect(self.margin_x, self.current_y - 14, self.printable_width, 14, 4, fill=1, stroke=0)
        self.c.setFillColor(colors.HexColor('#38bdf8')) # Sky blue
        self.c.setFont('Courier-Bold', 7)
        self.c.drawString(self.margin_x + 8, self.current_y - 10, f"// CODE LISTING: {language.upper()}")

        # Code lines
        code_y = self.current_y - 24
        for line in lines:
            self.c.setFillColor(colors.HexColor('#f1f5f9'))
            self.c.setFont('Courier', 7.2)
            # Truncate if too long
            display_line = line
            while stringWidth(display_line, 'Courier', 7.2) > (self.printable_width - 16) and len(display_line) > 5:
                display_line = display_line[:-2]
            if len(display_line) < len(line):
                display_line = display_line[:-3] + "..."
            self.c.drawString(self.margin_x + 8, code_y, display_line)
            code_y -= line_height

        self.current_y -= (block_height + 6)

    def add_table(self, headers, rows, col_widths=None):
        num_cols = len(headers)
        if not col_widths:
            col_widths = [self.printable_width / num_cols] * num_cols
        
        row_height = 13.5
        header_height = 15.0
        total_height = header_height + (len(rows) * row_height)

        table_top = self.current_y
        
        # Header background
        self.c.setFillColor(colors.HexColor('#1e293b'))
        self.c.rect(self.margin_x, table_top - header_height, self.printable_width, header_height, fill=1, stroke=0)

        # Header text
        x = self.margin_x
        self.c.setFillColor(colors.white)
        self.c.setFont('Helvetica-Bold', 7.5)
        for i, h in enumerate(headers):
            self.c.drawString(x + 4, table_top - header_height + 4, str(h))
            x += col_widths[i]

        curr_row_y = table_top - header_height
        for r_idx, row in enumerate(rows):
            # Alternating background
            bg_color = colors.HexColor('#f8fafc') if r_idx % 2 == 0 else colors.white
            self.c.setFillColor(bg_color)
            self.c.rect(self.margin_x, curr_row_y - row_height, self.printable_width, row_height, fill=1, stroke=0)
            
            # Border line
            self.c.setStrokeColor(colors.HexColor('#e2e8f0'))
            self.c.setLineWidth(0.5)
            self.c.line(self.margin_x, curr_row_y - row_height, self.margin_x + self.printable_width, curr_row_y - row_height)

            # Cell text
            x = self.margin_x
            self.c.setFillColor(colors.HexColor('#334155'))
            self.c.setFont('Helvetica', 7.2)
            for c_idx, cell in enumerate(row):
                cell_str = str(cell)
                # Truncate safely if too wide
                while stringWidth(cell_str, 'Helvetica', 7.2) > (col_widths[c_idx] - 8) and len(cell_str) > 4:
                    cell_str = cell_str[:-2]
                if len(cell_str) < len(str(cell)):
                    cell_str = cell_str[:-3] + "..."
                self.c.drawString(x + 4, curr_row_y - row_height + 3.5, cell_str)
                x += col_widths[c_idx]

            curr_row_y -= row_height

        # Outer border
        self.c.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.c.setLineWidth(0.75)
        self.c.rect(self.margin_x, curr_row_y, self.printable_width, total_height, fill=0, stroke=1)

        self.current_y = curr_row_y - 8

    def add_callout(self, title, text, box_type="info"):
        palette = {
            "info": {"bg": "#f0fdf4", "border": "#059669", "text": "#166534", "title": "#14532d"},
            "alert": {"bg": "#fef2f2", "border": "#dc2626", "text": "#991b1b", "title": "#7f1d1d"},
            "tip": {"bg": "#f0f9ff", "border": "#0284c7", "text": "#075985", "title": "#0c4a6e"},
        }
        theme = palette.get(box_type, palette["info"])

        # Calculate text wrapping
        words = text.split()
        lines = []
        current_line = []
        box_width = self.printable_width - 24

        for word in words:
            test_line = " ".join(current_line + [word])
            if stringWidth(test_line, 'Helvetica', 7.8) <= box_width:
                current_line.append(word)
            else:
                lines.append(" ".join(current_line))
                current_line = [word]
        if current_line:
            lines.append(" ".join(current_line))

        line_h = 10.0
        box_height = 18 + (len(lines) * line_h) + 6

        # Background
        self.c.setFillColor(colors.HexColor(theme["bg"]))
        self.c.roundRect(self.margin_x, self.current_y - box_height, self.printable_width, box_height, 3, fill=1, stroke=0)

        # Left border strip
        self.c.setFillColor(colors.HexColor(theme["border"]))
        self.c.roundRect(self.margin_x, self.current_y - box_height, 4, box_height, 2, fill=1, stroke=0)

        # Title
        self.c.setFillColor(colors.HexColor(theme["title"]))
        self.c.setFont('Helvetica-Bold', 8.5)
        self.c.drawString(self.margin_x + 12, self.current_y - 12, title.upper())

        # Body
        text_y = self.current_y - 23
        self.c.setFont('Helvetica', 7.8)
        self.c.setFillColor(colors.HexColor(theme["text"]))
        for l in lines:
            self.c.drawString(self.margin_x + 12, text_y, l)
            text_y -= line_h

        self.current_y -= (box_height + 6)

    def draw_cover_page(self, title, subtitle, volume_desc, key_topics):
        self.start_page(title, subtitle)
        # Decorative Title Block
        box_h = 160
        self.c.setFillColor(colors.HexColor('#0f172a')) # Slate 900
        self.c.roundRect(self.margin_x, self.current_y - box_h, self.printable_width, box_h, 6, fill=1, stroke=0)

        # Emerald Top Stripe in Cover
        self.c.setFillColor(colors.HexColor('#059669'))
        self.c.rect(self.margin_x, self.current_y - 4, self.printable_width, 4, fill=1, stroke=0)

        # Badge
        self.c.setFillColor(colors.HexColor('#38bdf8'))
        self.c.setFont('Helvetica-Bold', 9)
        self.c.drawString(self.margin_x + 20, self.current_y - 24, f"PROPLEDGER ARCHITECTURE SERIES — VOLUME {self.volume_num:02d} OF 10")

        # Main Title
        self.c.setFillColor(colors.white)
        self.c.setFont('Helvetica-Bold', 20)
        self.c.drawString(self.margin_x + 20, self.current_y - 52, title)

        # Subtitle
        self.c.setFillColor(colors.HexColor('#94a3b8'))
        self.c.setFont('Helvetica-Bold', 11)
        self.c.drawString(self.margin_x + 20, self.current_y - 72, subtitle)

        # Metadata Box inside Banner
        self.c.setFillColor(colors.HexColor('#1e293b'))
        self.c.roundRect(self.margin_x + 20, self.current_y - 145, self.printable_width - 40, 58, 4, fill=1, stroke=0)
        
        self.c.setFillColor(colors.HexColor('#38bdf8'))
        self.c.setFont('Helvetica-Bold', 8)
        self.c.drawString(self.margin_x + 30, self.current_y - 102, "DOMAIN LEVEL:")
        self.c.drawString(self.margin_x + 160, self.current_y - 102, "FRAMEWORKS:")
        self.c.drawString(self.margin_x + 360, self.current_y - 102, "PAGE BUDGET:")

        self.c.setFillColor(colors.white)
        self.c.setFont('Helvetica', 8)
        self.c.drawString(self.margin_x + 30, self.current_y - 116, "Enterprise Real Estate SaaS")
        self.c.drawString(self.margin_x + 160, self.current_y - 116, "Spring Boot 3.3 | PG 16 | React 19")
        self.c.drawString(self.margin_x + 360, self.current_y - 116, "10 Pages Complete Reference")

        self.c.setFillColor(colors.HexColor('#a7f3d0'))
        self.c.drawString(self.margin_x + 30, self.current_y - 132, "Comparable System: Yardi Voyager / RealPage")

        self.current_y -= (box_h + 16)

        # Executive Overview Section
        self.add_section("1. DOCUMENT EXECUTIVE ABSTRACT & SCOPE")
        self.add_paragraph(volume_desc)

        # Topics Covered Table
        self.add_section("2. VOLUME SYLLABUS & CORE CAPABILITIES")
        headers = ["Page", "Chapter Title", "Primary Technical Focus & Learning Outcome"]
        self.add_table(headers, key_topics, [40, 160, 332])

        self.add_callout("Senior Staff Engineer Reviewer Guidance", 
            "This volume is engineered specifically for software engineering and database architecture interviews at Tier-1 real estate technology and enterprise SaaS corporations (Yardi, RealPage, AppFolio, CoStar). Every code sample reflects active, compilable implementations from the PropLedger production repository.",
            "tip"
        )
        self.end_page()

    def end_page(self):
        self._draw_footer()
        self.c.showPage()

    def save(self):
        self.c.save()
        return self.page_num
