import { Order, StoreSettings } from '../types';

export function printOrderReceipt(order: Order, storeSettings: StoreSettings) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    // Fallback: se o navegador bloquear popup, chama window.print() direto
    window.print();
    return;
  }

  const itemsHtml = order.items
    .map(
      (item, idx) => `
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
          @page {
            margin: 0;
            size: auto;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 8px;
            color: #000;
            font-size: 12px;
            background: #fff;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .border-b { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
          .flex-between { display: flex; justify-content: space-between; }
          .total { font-size: 15px; font-weight: bold; margin-top: 6px; }
          @media print {
            body { width: 100%; margin: 0; }
          }
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
          ${order.customer.phone ? `<div><strong>Tel:</strong> ${order.customer.phone}</div>` : ''}
          ${
            order.customer.orderType === 'delivery' && order.customer.address
              ? `
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #888;">
                <div><strong>Endereço:</strong> ${order.customer.address.street}, ${order.customer.address.number}</div>
                <div><strong>Bairro:</strong> ${order.customer.address.neighborhood}</div>
                ${order.customer.address.reference ? `<div><strong>Ref:</strong> ${order.customer.address.reference}</div>` : ''}
              </div>
            `
              : ''
          }
        </div>

        <div class="border-b">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 12px;">ITENS:</div>
          ${itemsHtml}
        </div>

        <div style="margin-bottom: 10px;">
          <div class="flex-between" style="font-size: 11px;">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          ${
            order.deliveryFee > 0
              ? `
            <div class="flex-between" style="font-size: 11px;">
              <span>Taxa Entrega:</span>
              <span>R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>
          `
              : ''
          }
          <div class="flex-between total">
            <span>TOTAL:</span>
            <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
          </div>
          <div style="font-size: 11px; margin-top: 4px;">
            <strong>Pagamento:</strong> ${
              order.paymentMethod === 'pix'
                ? 'PIX'
                : order.paymentMethod === 'cartao_credito'
                ? 'Cartão de Crédito'
                : order.paymentMethod === 'cartao_debito'
                ? 'Cartão de Débito'
                : `Dinheiro ${order.changeFor ? `(Troco p/ R$ ${order.changeFor})` : ''}`
            }
          </div>
        </div>

        <div class="text-center" style="font-size: 10px; border-top: 1px dashed #000; padding-top: 6px;">
          Obrigado pela preferência! Volte sempre!
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 600);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
