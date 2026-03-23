from fpdf import FPDF
import os

class TechnicalPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 15)
        self.cell(190, 10, "Rapport d'Infrastructure Technique - QAPRIL v3.0", 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(190, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_pdf(input_md, output_pdf):
    pdf = TechnicalPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    if not os.path.exists(input_md):
        print(f"Error: {input_md} not found")
        return

    try:
        with open(input_md, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(5)
            continue
        
        # Simple character replacements for compatibility
        line = line.replace('\u2014', '-').replace('\u2022', '-').replace('\u2013', '-')
        
        if line.startswith('# '):
            pdf.set_font('Helvetica', 'B', 16)
            pdf.multi_cell(190, 10, line[2:])
            pdf.ln(5)
        elif line.startswith('## '):
            pdf.set_font('Helvetica', 'B', 14)
            pdf.multi_cell(190, 8, line[3:])
            pdf.ln(3)
        elif line.startswith('### '):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.multi_cell(190, 7, line[4:])
            pdf.ln(2)
        elif line.startswith('- '):
            pdf.set_font('Helvetica', '', 11)
            content = line[2:] if len(line) > 2 else ""
            pdf.multi_cell(190, 6, "  - " + content)
        else:
            pdf.set_font('Helvetica', '', 11)
            pdf.multi_cell(190, 6, line)

    try:
        pdf.output(output_pdf)
        print(f"PDF successfully generated: {output_pdf}")
    except Exception as e:
        print(f"Error saving PDF: {e}")

if __name__ == "__main__":
    input_file = "docs/infrastructure_technique.md"
    output_file = "docs/infrastructure_technique.pdf"
    generate_pdf(input_file, output_file)
