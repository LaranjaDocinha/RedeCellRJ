/**
 * Simple Print Service for POS Receipts.
 * In a real-world scenario, this could integrate with WebUSB, 
 * QZ Tray, or a local server proxy for silent printing.
 */
export const printReceipt = async (saleId: string | null, details: any) => {
  console.log('Initiating receipt print for sale:', saleId, details);
  
  // Create a hidden iframe for printing to avoid navigation
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) return;

  const content = `
    <html>
      <head>
        <title>Recibo PDV - ${saleId}</title>
        <style>
          body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
          .center { text-align: center; }
          .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; }
          .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h3>REDECELL RJ</h3>
          <p>PDV Inteligente</p>
        </div>
        <div class="divider"></div>
        <p>Venda: ${saleId || 'N/A'}</p>
        <p>Data: ${new Date().toLocaleString()}</p>
        <div class="divider"></div>
        ${details.items.map((item: any) => `
          <div class="item">
            <span>${item.quantity}x ${item.product_name || item.name}</span>
            <span>R$ ${item.subtotal.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="item total">
          <span>TOTAL</span>
          <span>R$ ${details.total.toFixed(2)}</span>
        </div>
        <div class="divider"></div>
        <div class="center">
          <p>Obrigado pela preferência!</p>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(content);
  doc.close();

  // Give time for resources to load if any
  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(printFrame);
    }, 1000);
  }, 500);
};
