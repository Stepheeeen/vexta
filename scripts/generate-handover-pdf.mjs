import { readFileSync } from 'fs';
import { marked } from 'marked';
import { chromium } from 'playwright';

const docs = [
  {
    input: '/Users/admin/Github/vexta/TECHNICAL_HANDOVER.md',
    output: '/Users/admin/Github/vexta/VEXTA_Technical_Handover_Guide.pdf',
    title: 'VEXTA — Technical Handover Guide',
    tagline: 'Technical Handover & Administration Guide',
    footer: 'VEXTA NETWORK — Technical Handover Guide',
    badge: 'Complete System Audit Resources',
    meta: {
      type: 'Technical Handover Guide',
      date: 'July 2026',
      services: 'Prisma / MongoDB / Plisio / Resend',
      status: '✓ Production Active'
    }
  },
  {
    input: '/Users/admin/Github/vexta/TECHNICAL_HANDOVER_ES.md',
    output: '/Users/admin/Github/vexta/VEXTA_Technical_Handover_Guide_ES.pdf',
    title: 'VEXTA — Guía de Entrega Técnica',
    tagline: 'Entrega Técnica y Guía de Administración',
    footer: 'VEXTA NETWORK — Guía de Entrega Técnica',
    badge: 'Recursos Completos de Auditoría',
    meta: {
      type: 'Guía de Entrega Técnica',
      date: 'Julio 2026',
      services: 'Prisma / MongoDB / Plisio / Resend',
      status: '✓ Producción Activa'
    }
  }
];

async function generatePdf(doc, browser) {
  const md = readFileSync(doc.input, 'utf-8');
  const body = marked.parse(md);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${doc.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --violet: #7c3aed;
      --violet-light: #a78bfa;
      --violet-dark: #5b21b6;
      --emerald: #10b981;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-500: #64748b;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10.5pt;
      line-height: 1.7;
      color: var(--slate-800);
      background: white;
    }

    /* ── Cover Page ──────────────────────────────────────── */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: white;
      padding: 60px 40px;
      page-break-after: always;
      height: 100vh;
    }

    .cover-logo {
      font-size: 52pt;
      font-weight: 800;
      letter-spacing: -2px;
      background: linear-gradient(135deg, #a78bfa, #7c3aed, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      margin-top: auto;
    }

    .cover-tagline {
      font-size: 14pt;
      color: #94a3b8;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 40px;
    }

    .cover-divider {
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed, #10b981);
      border-radius: 2px;
      margin: 0 auto 40px;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
      max-width: 500px;
      margin-bottom: 60px;
    }

    .cover-meta-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .cover-meta-label {
      font-size: 7pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
    }

    .cover-meta-value {
      font-size: 11pt;
      font-weight: 600;
      color: #e2e8f0;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 100px;
      padding: 10px 24px;
      font-size: 9pt;
      font-weight: 600;
      color: #10b981;
      letter-spacing: 1px;
      margin-bottom: auto;
    }

    /* ── Page layout ─────────────────────────────────────── */
    .content {
      padding: 50px 58px;
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Typography ──────────────────────────────────────── */
    h1 {
      font-size: 22pt;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.5px;
      margin: 36px 0 12px;
      padding-bottom: 12px;
      border-bottom: 3px solid var(--violet);
      page-break-after: avoid;
    }

    h2 {
      font-size: 16pt;
      font-weight: 700;
      color: var(--slate-900);
      margin: 32px 0 10px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid var(--slate-200);
      page-break-after: avoid;
    }

    h3 {
      font-size: 12.5pt;
      font-weight: 700;
      color: var(--violet-dark);
      margin: 24px 0 8px;
      page-break-after: avoid;
    }

    h4 {
      font-size: 10.5pt;
      font-weight: 600;
      color: var(--slate-700);
      margin: 16px 0 6px;
      page-break-after: avoid;
    }

    p { margin: 0 0 12px; }

    a { color: var(--violet); text-decoration: none; }

    strong { font-weight: 700; color: var(--slate-900); }

    em { font-style: italic; }

    /* ── Lists ───────────────────────────────────────────── */
    ul, ol {
      margin: 8px 0 14px 22px;
      padding: 0;
    }

    li {
      margin-bottom: 5px;
      line-height: 1.65;
    }

    li > ul, li > ol { margin-top: 5px; }

    /* ── Tables ──────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 9.5pt;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      page-break-inside: avoid;
    }

    thead tr {
      background: linear-gradient(135deg, var(--violet-dark), var(--violet));
      color: white;
    }

    thead th {
      padding: 11px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 8.5pt;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    tbody tr:nth-child(even) { background: var(--slate-50); }
    tbody tr:nth-child(odd)  { background: white; }

    tbody tr:hover { background: #ede9fe; }

    td {
      padding: 9px 14px;
      border-bottom: 1px solid var(--slate-200);
      vertical-align: top;
      line-height: 1.5;
    }

    /* ── Code blocks ─────────────────────────────────────── */
    pre {
      background: var(--slate-900);
      color: #e2e8f0;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 14px 0;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 8.5pt;
      line-height: 1.7;
      page-break-inside: avoid;
      border-left: 4px solid var(--violet);
    }

    code {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 8.5pt;
      background: var(--slate-100);
      color: var(--violet-dark);
      padding: 2px 6px;
      border-radius: 4px;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
    }

    /* ── Blockquotes ─────────────────────────────────────── */
    blockquote {
      margin: 16px 0;
      padding: 14px 18px;
      background: linear-gradient(135deg, #ede9fe, #f5f3ff);
      border-left: 4px solid var(--violet);
      border-radius: 0 8px 8px 0;
      color: var(--slate-700);
      font-style: italic;
      page-break-inside: avoid;
    }

    blockquote strong { color: var(--violet-dark); }

    /* ── HR dividers ─────────────────────────────────────── */
    hr {
      border: none;
      border-top: 2px solid var(--slate-200);
      margin: 32px 0;
    }

    /* ── Section callouts ────────────────────────────────── */
    .callout {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      margin: 14px 0;
      font-size: 9.5pt;
    }

    @media print {
      h1, h2, h3, h4 { page-break-after: avoid; }
      table, pre, blockquote { page-break-inside: avoid; }
      .cover { page-break-after: always; height: 100vh; }
    }
  </style>
</head>
<body>

  <!-- ╔══ COVER PAGE ══════════════════════════════════════╗ -->
  <div class="cover">
    <div class="cover-logo">VEXTA NETWORK</div>
    <div class="cover-tagline">${doc.tagline}</div>
    <div class="cover-divider"></div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">${doc.meta.type === 'Technical Handover Guide' ? 'Document Type' : 'Tipo de Documento'}</div>
        <div class="cover-meta-value">${doc.meta.type}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">${doc.meta.type === 'Technical Handover Guide' ? 'Delivery Date' : 'Fecha de Entrega'}</div>
        <div class="cover-meta-value">${doc.meta.date}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">${doc.meta.type === 'Technical Handover Guide' ? 'Total Services' : 'Servicios Totales'}</div>
        <div class="cover-meta-value">${doc.meta.services}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">${doc.meta.type === 'Technical Handover Guide' ? 'Deployment Status' : 'Estado de Implementación'}</div>
        <div class="cover-meta-value" style="color:#10b981">${doc.meta.status}</div>
      </div>
    </div>

    <div class="cover-badge" style="border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.15); color: #10b981;">${doc.badge}</div>
  </div>
  <!-- ╚════════════════════════════════════════════════════╝ -->

  <!-- ╔══ DOCUMENT BODY ════════════════════════════════════╗ -->
  <div class="content">
    ${body}
  </div>
  <!-- ╚════════════════════════════════════════════════════╝ -->

</body>
</html>`;

  const page = await browser.newPage();
  await page.setContent(html);

  // Wait for fonts to load completely
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: doc.output,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '18mm', bottom: '22mm', left: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-family:Inter,sans-serif;font-size:8pt;color:#94a3b8;width:100%;
                  display:flex;justify-content:space-between;padding:0 18mm;margin-bottom:-10px;">
        <span>${doc.footer}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
  });

  await page.close();
  console.log(`✅ PDF generated at: ${doc.output}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const doc of docs) {
    try {
      await generatePdf(doc, browser);
    } catch (e) {
      console.error(`Failed to generate PDF for ${doc.input}:`, e);
    }
  }
  await browser.close();
  console.log('✅ All PDFs generated successfully!');
}

main().catch(err => {
  console.error('PDF Generation failed:', err);
  process.exit(1);
});
