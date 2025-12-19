// frontend/src/utils/printer.ts

// Basic ESC/POS commands
const ESC = 0x1B;
const GS = 0x1D;

const commands = {
  INIT: [ESC, 0x40],
  CUT: [GS, 0x56, 0x41, 0x10], // Cut paper
  TEXT_FORMAT: {
    NORMAL: [ESC, 0x21, 0x00],
    BOLD: [ESC, 0x21, 0x08],
    DOUBLE_HEIGHT: [ESC, 0x21, 0x10],
    DOUBLE_WIDTH: [ESC, 0x21, 0x20],
    UNDERLINE: [ESC, 0x2D, 0x01],
    UNDERLINE_OFF: [ESC, 0x2D, 0x00],
  },
  ALIGN: {
    LEFT: [ESC, 0x61, 0x00],
    CENTER: [ESC, 0x61, 0x01],
    RIGHT: [ESC, 0x61, 0x02],
  }
};

export interface ReceiptData {
  storeName: string;
  address: string;
  saleId: string;
  date: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  total: number;
  payments: Array<{ method: string; amount: number }>;
}

export const connectToPrinter = async () => {
  if (!navigator.usb) {
    throw new Error('WebUSB not supported in this browser.');
  }

  try {
    // Request device. Filters can be added if vendorId is known.
    const device = await navigator.usb.requestDevice({ filters: [] });
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);
    return device;
  } catch (error) {
    console.error('Error connecting to printer:', error);
    throw error;
  }
};

export const printReceipt = async (device: USBDevice, data: ReceiptData) => {
  const encoder = new TextEncoder();
  const send = async (data: number[] | Uint8Array) => {
    const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
    await device.transferOut(1, buffer); // Endpoint 1 is common for OUT
  };

  try {
    await send(commands.INIT);
    await send(commands.ALIGN.CENTER);
    await send(commands.TEXT_FORMAT.BOLD);
    await send(encoder.encode(`${data.storeName}\n`));
    await send(commands.TEXT_FORMAT.NORMAL);
    await send(encoder.encode(`${data.address}\n\n`));
    
    await send(commands.ALIGN.LEFT);
    await send(encoder.encode(`Sale ID: ${data.saleId}\n`));
    await send(encoder.encode(`Date: ${data.date}\n`));
    await send(encoder.encode(`--------------------------------\n`));

    // Items
    for (const item of data.items) {
      const line = `${item.qty}x ${item.name.substring(0, 20).padEnd(20)} ${item.total.toFixed(2).padStart(8)}\n`;
      await send(encoder.encode(line));
    }
    
    await send(encoder.encode(`--------------------------------\n`));
    await send(commands.TEXT_FORMAT.BOLD);
    await send(commands.ALIGN.RIGHT);
    await send(encoder.encode(`TOTAL: ${data.total.toFixed(2)}\n`));
    await send(commands.TEXT_FORMAT.NORMAL);

    await send(encoder.encode(`\n`));
    await send(commands.ALIGN.CENTER);
    await send(encoder.encode(`Thank you for shopping!\n`));
    await send(encoder.encode(`\n\n\n`)); // Feed
    
    await send(commands.CUT);

  } catch (error) {
    console.error('Error printing:', error);
    throw error;
  }
};
