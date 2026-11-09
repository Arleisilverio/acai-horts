import { Order, StoreSettings } from '../types';

export function printOrderReceipt(order: Order, storeSettings: StoreSettings) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    window.print();
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
    <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #ccc;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
        <span>${item.quantity}x Copo ${item.size.volume}</span>
        <span>R$ ${(item.itemPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
      </div>
      <div style="font-size: 11px; color: #444; margin-top: 2px;">
        Base: ${item.base.name}
      </div>
      <div style="font-size: 11px; color: #555;">
        Adicionais: ${item.complements.map((c) => c.name).join(', ') || 'Nenhum'}
      </div>
      ${item.notes ? `<div style="font-size: 10px; font-style: italic; color: #666; margin-top: 2px;">Obs: ${item.notes}</div>` : ''}
    </div>
  `
    )
    .join('');

  const orderTypeLabel =
    order.customer.orderType === 'balcao'
      ? '🛍️ BALCÃO (PRESENCIAL)'
      : order.customer.orderType === 'delivery'
      ? '🛵 ENTREGA DELIVERY'
      : '📦 RETIRADA NO BALCÃO';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Comanda ${order.code}</title>
        <style>
          @page { margin: 0; size: auto; }
          body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 8px; color: #000; font-size: 12px; }
          .text-center { text-align: center; }
          .border-b { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
          .flex-between { display: flex; justify-content: space-between; }
          .total { font-size: 15px; font-weight: bold; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="text-center border-b">
          <h2 style="margin: 0; font-size: 16px;">${storeSettings.storeName}</h2>
          <div style="font-size: 11px;">Comanda de Preparo & Caixa</div>
          <div style="font-size: 16px; font-weight: 900; margin-top: 4px;">${order.code}</div>
          <div style="font-size: 10px; color: #444;">${new Date(order.createdAt).toLocaleString('pt-BR')}</div>
        </div>

        <div class="border-b" style="font-size: 11px;">
          <div><strong>Cliente / Mesa:</strong> ${order.customer.name}</div>
          <div><strong>Modalidade:</strong> ${orderTypeLabel}</div>
        </div>

        <div class="border-b">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 12px;">ITENS:</div>
          ${itemsHtml}
        </div>

        <div style="margin-bottom: 10px;">
          <div class="flex-between total">
            <span>TOTAL:</span>
            <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 600);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}