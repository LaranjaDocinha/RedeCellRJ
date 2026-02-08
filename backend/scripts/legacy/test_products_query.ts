import { productService } from '../src/services/productService.js';
import 'dotenv/config';
import { getPool } from '../src/db/index.js';

async function test() {
  try {
    console.log('Testing getAllProducts...');
    const result = await productService.getAllProducts({ limit: 10, offset: 0 });
    console.log('Success!', result);
  } catch (error) {
    console.error('FAILED:', error);
  } finally {
    await getPool().end();
  }
}

test();
