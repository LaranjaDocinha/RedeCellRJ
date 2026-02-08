import qrcode from 'qrcode';
import appEvents from '../events/appEvents.js';
import CircuitBreaker from 'opossum';

export class PixService {
  private breaker: CircuitBreaker;

  constructor() {
    // Mock breaker for now
    const options = {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    };
    this.breaker = new CircuitBreaker(this.generateStaticPix.bind(this), options);
  }

  /**
   * Generates a PIX Copy and Paste code (Static).
   */
  async generateStaticPix(
    amount: number,
    _description: string,
  ): Promise<{ copyAndPaste: string; qrCode: string }> {
    const pixData = `00020126330014BR.GOV.BCB.PIX0111test@test.com520400005303986540${amount.toFixed(2)}5802BR5913REDECELL RJ6009SAO PAULO62070503***6304`;
    const qrCode = await qrcode.toDataURL(pixData);
    return { copyAndPaste: pixData, qrCode };
  }

  /**
   * Resilient wrapper for PIX generation.
   */
  async generatePix(amount: number, description: string) {
    return this.breaker.fire(amount, description);
  }

  getBreakerStatus() {
    return {
      name: 'Pix-Generation',
      opened: this.breaker.opened,
      halfOpen: this.breaker.halfOpen,
      closed: this.breaker.closed,
      stats: this.breaker.stats,
    };
  }

  /**
   * Gera um QR Code dinâmico para uma transação específica.
   */
  async generateDynamicQrCode(request: {
    amount: number;
    description: string;
    externalId?: string;
    transactionId?: string;
  }): Promise<{
    qrCodeBase64: string;
    txid: string;
    pixCopiaECola: string;
    transactionId: string;
  }> {
    const transactionId =
      request.transactionId ||
      request.externalId ||
      Math.random().toString(36).substring(7).toUpperCase();
    const txid = transactionId;
    const pixCopiaECola = `00020126330014BR.GOV.BCB.PIX0111test@test.com520400005303986540${request.amount.toFixed(2)}5802BR5913REDECELL RJ6009SAO PAULO62070503***6304-${txid}`;

    const qrCodeBase64 = await qrcode.toDataURL(pixCopiaECola);
    return { qrCodeBase64, txid, pixCopiaECola, transactionId };
  }

  async checkPaymentStatus(_txid: string): Promise<'pending' | 'paid' | 'expired'> {
    const statuses: ('pending' | 'paid' | 'expired')[] = ['pending', 'paid', 'expired'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  async handleWebhook(payload: any): Promise<void> {
    const transactionId = payload.txid || payload.transactionId;
    if (transactionId) {
      appEvents.emit('pix.payment.confirmed', { transactionId });
    }
  }
}

export const pixService = new PixService();
