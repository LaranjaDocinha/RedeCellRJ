export const hardwareService = {
  /**
   * Envia dados ESC/POS diretamente para uma impressora térmica USB/Serial.
   */
  async printEscPos(data: string | Uint8Array) {
    if (!('serial' in navigator)) {
      alert('Seu navegador não suporta a Web Serial API. Use o Chrome ou Edge.');
      return;
    }

    try {
      // Solicita ao usuário a seleção da porta serial (impressora)
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      
      const payload = typeof data === 'string' ? encoder.encode(data) : data;
      
      await writer.write(payload);
      
      // Comando ESC/POS para cortar papel (GS V 0)
      await writer.write(new Uint8Array([0x1D, 0x56, 0x00]));

      writer.releaseLock();
      await port.close();
      
      return true;
    } catch (error) {
      console.error('Falha na comunicação com o hardware:', error);
      return false;
    }
  },

  /**
   * Abre a gaveta de dinheiro (Comando ESC/POS: ESC p 0 25 250)
   */
  async openCashDrawer() {
      const openCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
      return await this.printEscPos(openCommand);
  }
};
