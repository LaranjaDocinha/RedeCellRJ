const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const db = require('../db');

const productValidationRules = () => [
  body('name').trim().isLength({ min: 3 }).withMessage('O nome do produto deve ter pelo menos 3 caracteres.'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('category_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('ID da categoria deve ser um número inteiro válido.'),
  body('product_type').isIn(['physical', 'service']).withMessage("O tipo do produto deve ser 'physical' ou 'service'."),
  body('variations').isArray().withMessage('Variações devem ser um array.'),
  body('variations.*.color').if(body('product_type').equals('physical')).trim().notEmpty().withMessage('A cor/variação é obrigatória para produtos físicos.'),
  body('variations.*.price').isFloat({ gt: 0 }).withMessage('O preço deve ser um número positivo.'),
  body('variations.*.stock_quantity').if(body('product_type').equals('physical')).isInt({ min: 0 }).withMessage('O estoque deve ser um número inteiro não-negativo.'),
  body('variations.*.alert_threshold').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('O alerta de estoque deve ser um número inteiro.'),
];

const idValidationRules = () => [
  param('id').isInt({ gt: 0 }).withMessage('O ID do produto deve ser um número inteiro válido.'),
];

// Get all products with their variations (FINAL, EXPLICIT VERSION)
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, search = '' } = req.query;

    const selectClause = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.category_id,
        p.product_type,
        json_agg(
          CASE 
            WHEN pv.id IS NULL THEN NULL
            ELSE json_build_object(
              'id', pv.id,
              'color', pv.color,
              'price', pv.price,
              'stock_quantity', pv.stock_quantity,
              'barcode', pv.barcode,
              'status', pv.status,
              'image_url', pv.image_url
            )
          END
        ) FILTER (WHERE pv.id IS NOT NULL) as variations
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
    `;

    const countSelectClause = `
      SELECT COUNT(DISTINCT p.id) 
      FROM products p 
      LEFT JOIN product_variations pv ON p.id = pv.product_id
    `;

    let total;
    let productsResult;

    if (search) {
      const whereClause = `WHERE (p.name ILIKE $1 OR p.description ILIKE $1 OR pv.barcode ILIKE $1)`;
      const searchParam = [`%${search}%`];
      
      const totalResult = await db.query(`${countSelectClause} ${whereClause}`, searchParam);
      total = parseInt(totalResult.rows[0].count, 10);

      const query = `${selectClause} ${whereClause} GROUP BY p.id ORDER BY p.name LIMIT $2 OFFSET $3`;
      productsResult = await db.query(query, [...searchParam, limit, offset]);

    } else {
      const totalResult = await db.query(countSelectClause, []);
      total = parseInt(totalResult.rows[0].count, 10);

      const query = `${selectClause} GROUP BY p.id ORDER BY p.name LIMIT $1 OFFSET $2`;
      productsResult = await db.query(query, [limit, offset]);
    }

    res.json({
      products: productsResult.rows,
      total: total,
    });

  } catch (err) {
    console.error("Erro ao listar produtos:", err.stack);
    res.status(500).send('Server Error');
  }
});

// Rota de busca para o PDV (versão robusta)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const searchTerm = `%${query}%`;
    const barcodeTerm = query;

    const dbQuery = `
      SELECT
        p.id as product_id,
        p.name,
        p.description,
        pv.id as variation_id,
        pv.color,
        pv.price,
        pv.stock_quantity,
        pv.barcode
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      WHERE p.name ILIKE $1 OR p.description ILIKE $1 OR pv.barcode = $2
      ORDER BY p.name, pv.id
      LIMIT 20;
    `;

    const { rows } = await db.query(dbQuery, [searchTerm, barcodeTerm]);

    // Agrupa as variações por produto no JavaScript
    const productsMap = new Map();
    rows.forEach(row => {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.name,
          description: row.description,
          variations: [],
        });
      }
      
      if (row.variation_id) {
        productsMap.get(row.product_id).variations.push({
          id: row.variation_id,
          product_id: row.product_id,
          color: row.color,
          price: row.price,
          stock_quantity: row.stock_quantity,
          barcode: row.barcode,
        });
      }
    });

    res.json(Array.from(productsMap.values()));

  } catch (err) {
    console.error('Error searching products for PDV:', err.stack);
    res.status(500).send('Server Error');
  }
});

// Get a single product by ID with variations
router.get('/:id', idValidationRules(), validate, async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const variationsResult = await db.query('SELECT * FROM product_variations WHERE product_id = $1', [id]);
    
    const product = productResult.rows[0];
    product.variations = variationsResult.rows;

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new product with variations
router.post('/', productValidationRules(), validate, async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { name, description, category_id, product_type = 'physical', variations } = req.body;

    const productResult = await client.query(
      'INSERT INTO products (name, description, category_id, product_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, category_id || null, product_type]
    );
    const newProduct = productResult.rows[0];

    if (product_type === 'service') {
        const { price = 0, cost_price = 0 } = req.body;
        await client.query(
            'INSERT INTO product_variations (product_id, color, price, cost_price, stock_quantity, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [newProduct.id, 'N/A', price, cost_price, Infinity, 'active']
        );
    } else {
      const variationPromises = variations.map(variation => {
        const { color, price, cost_price, stock_quantity, image_url, status, alert_threshold } = variation;
        return client.query(
          'INSERT INTO product_variations (product_id, color, price, cost_price, stock_quantity, image_url, status, alert_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [newProduct.id, color, price, cost_price || 0, stock_quantity, image_url, status || 'active', alert_threshold || 5]
        );
      });
      await Promise.all(variationPromises);
    }
    
    await client.query('COMMIT');
    res.status(201).json({ id: newProduct.id, name: newProduct.name });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error in transaction, rolling back.", err);
    res.status(500).json({ msg: 'Erro no servidor ao criar produto.', error: err.message });
  } finally {
    client.release();
  }
});

// Update a product with variations
router.put('/:id', idValidationRules(), productValidationRules(), validate, async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, description, category_id, product_type, variations } = req.body;

    const productResult = await client.query(
      'UPDATE products SET name = $1, description = $2, category_id = $3, product_type = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, description, category_id || null, product_type, id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (variations && variations.length > 0) {
        await client.query('DELETE FROM product_variations WHERE product_id = $1', [id]);

        const variationPromises = variations.map(variation => {
            const { color, price, cost_price, stock_quantity, image_url, status, alert_threshold } = variation;
            const stock = product_type === 'service' ? Infinity : (stock_quantity || 0);
            return client.query(
                'INSERT INTO product_variations (product_id, color, price, cost_price, stock_quantity, image_url, status, alert_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [id, color, price, cost_price || 0, stock, image_url, status || 'active', alert_threshold || 5]
            );
        });
        await Promise.all(variationPromises);
    }

    await client.query('COMMIT');
    res.json(productResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in transaction, rolling back.', err);
    res.status(500).json({ msg: 'Erro no servidor ao atualizar produto.', error: err.message });
  } finally {
    client.release();
  }
});

// Delete a product with its variations
router.delete('/:id', idValidationRules(), validate, async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING * ', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Product not found' });
    }

    await client.query('COMMIT');
    res.json({ msg: 'Product deleted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in transaction, rolling back.', err);
    res.status(500).json({ msg: 'Erro no servidor ao excluir produto.', error: err.message });
  } finally {
    client.release();
  }
});

// Rota para dar entrada de estoque (adicionar quantidade)
router.post('/stock/add', async (req, res) => {
  const { variation_id, quantity_added, reason, user_id = 1 } = req.body; // user_id mockado

  if (!variation_id || !quantity_added || quantity_added <= 0) {
    return res.status(400).json({ msg: 'ID da variação e quantidade positiva são obrigatórios.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const updateResult = await client.query(
      'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING stock_quantity',
      [quantity_added, variation_id]
    );

    if (updateResult.rows.length === 0) throw new Error('Variação do produto não encontrada.');

    await client.query(
      'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
      [variation_id, user_id, 'entrada', quantity_added, reason || 'Entrada de mercadoria']
    );

    await client.query('COMMIT');
    res.status(200).json({
      msg: 'Estoque atualizado com sucesso.',
      new_stock_quantity: updateResult.rows[0].stock_quantity
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na entrada de estoque:', err);
    res.status(500).json({ msg: 'Erro no servidor ao dar entrada no estoque.', error: err.message });
  } finally {
    client.release();
  }
});

// Rota para ajustar o estoque para uma quantidade específica
router.post('/stock/adjust', async (req, res) => {
  const { variation_id, new_quantity, reason, user_id = 1 } = req.body; // user_id mockado

  if (!variation_id || new_quantity === undefined || new_quantity < 0) {
    return res.status(400).json({ msg: 'ID da variação e uma nova quantidade não-negativa são obrigatórios.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const currentStockResult = await client.query(
      'SELECT stock_quantity FROM product_variations WHERE id = $1 FOR UPDATE',
      [variation_id]
    );

    if (currentStockResult.rows.length === 0) throw new Error('Variação do produto não encontrada.');
    
    const current_quantity = currentStockResult.rows[0].stock_quantity;
    const quantity_change = new_quantity - current_quantity;

    const updateResult = await client.query(
      'UPDATE product_variations SET stock_quantity = $1 WHERE id = $2 RETURNING stock_quantity',
      [new_quantity, variation_id]
    );

    await client.query(
      'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
      [variation_id, user_id, 'ajuste', quantity_change, reason || 'Ajuste de inventário']
    );

    await client.query('COMMIT');
    res.status(200).json({
      msg: 'Estoque ajustado com sucesso.',
      new_stock_quantity: updateResult.rows[0].stock_quantity
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro no ajuste de estoque:', err);
    res.status(500).json({ msg: 'Erro no servidor ao ajustar estoque.', error: err.message });
  } finally {
    client.release();
  }
});

// Rota para buscar o histórico de estoque de uma variação
router.get('/stock-history/:variationId', async (req, res) => {
  try {
    const { variationId } = req.params;
    const historyResult = await db.query(`
      SELECT 
        sh.id,
        sh.change_type,
        sh.quantity_change,
        sh.reason,
        sh.created_at,
        u.name as user_name
      FROM stock_history sh
      LEFT JOIN users u ON sh.user_id = u.id
      WHERE sh.variation_id = $1
      ORDER BY sh.created_at DESC
    `, [variationId]);

    res.status(200).json(historyResult.rows);

  } catch (err) {
    console.error('Erro ao buscar histórico de estoque:', err);
    res.status(500).json({ msg: 'Erro no servidor ao buscar histórico de estoque.', error: err.message });
  }
});

module.exports = router;

