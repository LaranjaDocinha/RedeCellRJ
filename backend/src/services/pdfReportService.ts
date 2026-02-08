import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { executiveDashboardService } from './executiveDashboardService.js';

export const pdfReportService = {
  async generateExecutiveInfographic() {
    const stats = await executiveDashboardService.getStats();
    const doc = new jsPDF() as any;

    // --- Estilo Premium ---
    doc.setFillColor(30, 60, 114); // Azul Marinho Redecell
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('REDECELL RJ - RELATÓRIO EXECUTIVO', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });

    // --- KPIs em Cards ---
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(14);
    doc.text('Principais Indicadores (Últimos 30 dias)', 15, 55);

    // Card 1: Margem
    doc.setDrawColor(46, 204, 113);
    doc.setLineWidth(1);
    doc.roundedRect(15, 65, 55, 30, 3, 3, 'D');
    doc.setFontSize(10);
    doc.text('MARGEM MÉDIA', 20, 75);
    doc.setFontSize(16);
    doc.text(`${stats.avgMargin}%`, 20, 85);

    // Card 2: Conversão
    doc.setDrawColor(52, 152, 219);
    doc.roundedRect(77, 65, 55, 30, 3, 3, 'D');
    doc.setFontSize(10);
    doc.text('CONVERSÃO OS', 82, 75);
    doc.setFontSize(16);
    const conv = (
      (stats.serviceConversion.completed / stats.serviceConversion.total) *
      100
    ).toFixed(1);
    doc.text(`${conv}%`, 82, 85);

    // Card 3: Receita Total
    const totalRevenue = stats.salesByChannel.reduce(
      (acc: number, s: any) => acc + Number(s.revenue),
      0,
    );
    doc.setDrawColor(155, 89, 182);
    doc.roundedRect(140, 65, 55, 30, 3, 3, 'D');
    doc.setFontSize(10);
    doc.text('RECEITA TOTAL', 145, 75);
    doc.setFontSize(14);
    doc.text(`R$ ${totalRevenue.toLocaleString()}`, 145, 85);

    // --- Tabela de Canais ---
    doc.setFontSize(14);
    doc.text('Performance por Canal', 15, 115);

    doc.autoTable({
      startY: 120,
      head: [['Canal', 'Vendas', 'Faturamento (R$)']],
      body: stats.salesByChannel.map((s: any) => [
        s.channel,
        s.count,
        Number(s.revenue).toFixed(2),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 60, 114] },
    });

    // --- Insights IA ---
    const finalY = (doc as any).lastAutoTable.cursor.y + 20;
    doc.setFontSize(14);
    doc.text('Insights Estratégicos (IA)', 15, finalY);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let currentY = finalY + 10;
    stats.insights.forEach((insight: string) => {
      const splitText = doc.splitTextToSize(`• ${insight.replace(/\*\*/g, '')}`, 180);
      doc.text(splitText, 15, currentY);
      currentY += splitText.length * 5 + 2;
    });

    return doc.output('arraybuffer');
  },
};
