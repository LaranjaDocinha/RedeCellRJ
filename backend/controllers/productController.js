const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { redisClient } = require('../db');
const { AppError, NotFoundError, BadRequestError } = require('../utils/appError');

// Obter todos os produtos
exports.getAllProducts = async (req, res) => {
  const { limit = 10, offset = 0, search = '', category_id, min_price, max_price } = req.query;
  const cacheKey = `products:${limit}:${offset}:${search}:${category_id}:${min_price}:${max_price}`;
  const currentBranchId = req.user.branch_id; // Assuming user has a branch_id

  try {
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    let baseQuery = `
      SELECT 
        p.id, p.name, p.description, p.main_image_url, pv.barcode, p.category_id, p.supplier_id, p.created_at,
        pv.id as variation_id, pv.price, pv.cost_price, pv.stock_quantity, pv.reserved_quantity, pv.color, pv.size, pv.weight, pv.min_stock_level, pv.is_serialized,
        c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;
    let countBaseQuery = `
      SELECT COUNT(*) 
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
    `;

    const searchParams = [];
    const whereClauses = [];
    let searchPlaceholderIndex = 1;

    if (search) {
      const searchParam = `%${search}%`;
      whereClauses.push(`(p.name ILIKE ${searchPlaceholderIndex} OR p.description ILIKE ${searchPlaceholderIndex} OR pv.barcode ILIKE ${searchPlaceholderIndex})`);
      searchParams.push(searchParam);
      searchPlaceholderIndex++;
    }

    if (category_id) {
      whereClauses.push(`p.category_id = ${searchPlaceholderIndex++}`);
      searchParams.push(category_id);
    }

    if (min_price) {
      whereClauses.push(`pv.price >= ${searchPlaceholderIndex++}`);
      searchParams.push(min_price);
    }

    if (max_price) {
      whereClauses.push(`pv.price <= ${searchPlaceholderIndex++}`);
      searchParams.push(max_price);
    }

    let whereString = '';
    if (whereClauses.length > 0) {
      whereString = ' WHERE ' + whereClauses.join(' AND ');
    }

    // Execute count query
    const totalResult = await db.query(countBaseQuery + whereString, searchParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Execute main query
    const queryParams = [...searchParams]; // Start with search parameters
    let limitOffsetPlaceholderStart = searchParams.length + 1;

    baseQuery += whereString; // Add WHERE clause to main query
    let offsetPlaceholderIndex = limitOffsetPlaceholderStart + 1;

    baseQuery += whereString; // Add WHERE clause to main query
    baseQuery += ` ORDER BY p.created_at DESC LIMIT const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { redisClient } = require('../db');
const { AppError, NotFoundError, BadRequestError } = require('../utils/appError');

// Obter todos os produtos
exports.getAllProducts = async (req, res) => {
  const { limit = 10, offset = 0, search = '', category_id, min_price, max_price } = req.query;
  const cacheKey = `products:${limit}:${offset}:${search}:${category_id}:${min_price}:${max_price}`;
  const currentBranchId = req.user.branch_id; // Assuming user has a branch_id

  try {
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    let baseQuery = `
      SELECT 
        p.id, p.name, p.description, p.main_image_url, pv.barcode, p.category_id, p.supplier_id, p.created_at,
        pv.id as variation_id, pv.price, pv.cost_price, pv.stock_quantity, pv.reserved_quantity, pv.color, pv.size, pv.weight, pv.min_stock_level, pv.is_serialized,
        c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;
    let countBaseQuery = `
      SELECT COUNT(*) 
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
    `;

    const searchParams = [];
    const whereClauses = [];
    let searchPlaceholderIndex = 1;

    if (search) {
      const searchParam = `%${search}%`;
      whereClauses.push(`(p.name ILIKE ${searchPlaceholderIndex} OR p.description ILIKE ${searchPlaceholderIndex} OR pv.barcode ILIKE ${searchPlaceholderIndex})`);
      searchParams.push(searchParam);
      searchPlaceholderIndex++;
    }

    if (category_id) {
      whereClauses.push(`p.category_id = ${searchPlaceholderIndex++}`);
      searchParams.push(category_id);
    }

    if (min_price) {
      whereClauses.push(`pv.price >= ${searchPlaceholderIndex++}`);
      searchParams.push(min_price);
    }

    if (max_price) {
      whereClauses.push(`pv.price <= ${searchPlaceholderIndex++}`);
      searchParams.push(max_price);
    }

    let whereString = '';
    if (whereClauses.length > 0) {
      whereString = ' WHERE ' + whereClauses.join(' AND ');
    }

    // Execute count query
    const totalResult = await db.query(countBaseQuery + whereString, searchParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Execute main query
    const queryParams = [...searchParams]; // Start with search parameters
    let limitOffsetPlaceholderStart = searchParams.length + 1;

    baseQuery += whereString; // Add WHERE clause to main query
    let offsetPlaceholderIndex = limitOffsetPlaceholderStart + 1;

    baseQuery += whereString; // Add WHERE clause to main query
     + limitOffsetPlaceholderStart + ` OFFSET const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { redisClient } = require('../db');
const { AppError, NotFoundError, BadRequestError } = require('../utils/appError');

// Obter todos os produtos
exports.getAllProducts = async (req, res) => {
  const { limit = 10, offset = 0, search = '', category_id, min_price, max_price } = req.query;
  const cacheKey = `products:${limit}:${offset}:${search}:${category_id}:${min_price}:${max_price}`;
  const currentBranchId = req.user.branch_id; // Assuming user has a branch_id

  try {
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    let baseQuery = `
      SELECT 
        p.id, p.name, p.description, p.main_image_url, pv.barcode, p.category_id, p.supplier_id, p.created_at,
        pv.id as variation_id, pv.price, pv.cost_price, pv.stock_quantity, pv.reserved_quantity, pv.color, pv.size, pv.weight, pv.min_stock_level, pv.is_serialized,
        c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;
    let countBaseQuery = `
      SELECT COUNT(*) 
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
    `;

    const searchParams = [];
    const whereClauses = [];
    let searchPlaceholderIndex = 1;

    if (search) {
      const searchParam = `%${search}%`;
      whereClauses.push(`(p.name ILIKE ${searchPlaceholderIndex} OR p.description ILIKE ${searchPlaceholderIndex} OR pv.barcode ILIKE ${searchPlaceholderIndex})`);
      searchParams.push(searchParam);
      searchPlaceholderIndex++;
    }

    if (category_id) {
      whereClauses.push(`p.category_id = ${searchPlaceholderIndex++}`);
      searchParams.push(category_id);
    }

    if (min_price) {
      whereClauses.push(`pv.price >= ${searchPlaceholderIndex++}`);
      searchParams.push(min_price);
    }

    if (max_price) {
      whereClauses.push(`pv.price <= ${searchPlaceholderIndex++}`);
      searchParams.push(max_price);
    }

    let whereString = '';
    if (whereClauses.length > 0) {
      whereString = ' WHERE ' + whereClauses.join(' AND ');
    }

    // Execute count query
    const totalResult = await db.query(countBaseQuery + whereString, searchParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Execute main query
    const queryParams = [...searchParams]; // Start with search parameters
    let limitOffsetPlaceholderStart = searchParams.length + 1;

    baseQuery += whereString; // Add WHERE clause to main query
    let offsetPlaceholderIndex = limitOffsetPlaceholderStart + 1;

    baseQuery += whereString; // Add WHERE clause to main query
     + offsetPlaceholderIndex;
    queryParams.push(limit, offset);

    const productsResult = await db.query(baseQuery, queryParams);
    let products = productsResult.rows;

    // Fetch serial numbers for serialized products
    for (let i = 0; i < products.length; i++) {
      if (products[i].is_serialized) {
        const serialsResult = await db.query(
          'SELECT id, serial_number, status FROM product_serials WHERE product_variation_id = $1 AND current_branch_id = $2 AND (status = \'in_stock\' OR status = \'in_repair\');',
          [products[i].variation_id, currentBranchId]
        );
        products[i].serial_numbers = serialsResult.rows;
      }
    }

    const responseData = {
      products: products,
      total: total
    };

    await redisClient.setex(cacheKey, 3600, JSON.stringify(responseData)); // Cache por 1 hora
    res.json(responseData);
  } catch (err) {
    console.error('Erro ao listar produtos:', err.message);
    throw new AppError('Erro ao listar produtos.', 500);
  }
};

// Obter um produto por ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  const currentBranchId = req.user.branch_id; // Assuming user has a branch_id

  try {
    const productQuery = `
      SELECT 
        p.id, p.name, p.description, p.main_image_url, pv.barcode, p.category_id, p.supplier_id, p.created_at,
        pv.id as variation_id, pv.price, pv.cost_price, pv.stock_quantity, pv.reserved_quantity, pv.color, pv.size, pv.weight, pv.min_stock_level, pv.is_serialized,
        c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(productQuery, [id]);
    if (rows.length === 0) {
      throw new NotFoundError('Produto não encontrado.');
    }
    let product = rows[0];

    // Fetch serial numbers for serialized product
    if (product.is_serialized) {
      const serialsResult = await db.query(
        'SELECT id, serial_number, status, current_branch_id FROM product_serials WHERE product_variation_id = $1;',
        [product.variation_id]
      );
      product.serial_numbers = serialsResult.rows;
    }

    res.json(product);
  } catch (err) {
    console.error('Erro ao buscar produto:', err.message);
    throw new AppError('Erro ao buscar produto.', 500);
  }
};

// Criar um novo produto
exports.createProduct = async (req, res) => {
  const { name, description, barcode, category_id, supplier_id, price, cost_price, stock_quantity, color, size, weight, min_stock_level, is_serialized, serial_numbers, branch_id, main_image_url } = req.body;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      'INSERT INTO products (name, description, category_id, supplier_id, main_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id;',
      [name, description, category_id || null, supplier_id || null, main_image_url || null]
    );
    const productId = productResult.rows[0].id;

    let finalStockQuantity = stock_quantity;
    if (is_serialized) {
      if (!Array.isArray(serial_numbers) || serial_numbers.length === 0) {
        throw new BadRequestError('Produtos serializados devem ter números de série informados.');
      }
      finalStockQuantity = serial_numbers.length;
    }

    const variationResult = await client.query(
      'INSERT INTO product_variations (product_id, price, cost_price, stock_quantity, color, size, weight, min_stock_level, barcode, is_serialized, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;',
      [productId, parseFloat(price), parseFloat(cost_price), parseInt(stock_quantity, 10), color, size, weight, min_stock_level, barcode, is_serialized, branch_id]
    );
    const variationId = variationResult.rows[0].id;

    if (is_serialized) {
      for (const serialNum of serial_numbers) {
        await client.query(
          'INSERT INTO product_serials (product_variation_id, serial_number, current_branch_id) VALUES ($1, $2, $3);',
          [variationId, serialNum, branch_id]
        );
      }
    }

    await logActivity(req.user.name, `Produto ${name} (Código de Barras: ${barcode}) criado.`, 'product', productId);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Produto criado com sucesso!', productId, variationId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar produto:', err);
    throw new AppError(err.message || 'Erro interno do servidor.', 500);
  } finally {
    client.release();
  }
};

// Atualizar um produto
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, barcode, category_id, supplier_id, price, cost_price, stock_quantity, color, size, weight, min_stock_level, is_serialized, serial_numbers, branch_id, main_image_url } = req.body;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE products SET name = $1, description = $2, category_id = $3, supplier_id = $4, main_image_url = $5 WHERE id = $6;',
      [name, description, category_id, supplier_id, main_image_url || null, id]
    );

    let finalStockQuantity = stock_quantity;
    if (is_serialized) {
      if (!Array.isArray(serial_numbers)) {
        throw new BadRequestError('Para produtos serializados, os números de série devem ser um array.');
      }
      finalStockQuantity = serial_numbers.length;
    }

    const variationResult = await client.query(
      'UPDATE product_variations SET price = $1, cost_price = $2, stock_quantity = $3, color = $4, size = $5, weight = $6, min_stock_level = $7, barcode = $8, is_serialized = $9, branch_id = $10 WHERE product_id = $11 RETURNING id;',
      [price, cost_price, finalStockQuantity, color, size, weight, min_stock_level, barcode, is_serialized, branch_id, id]
    );
    const variationId = variationResult.rows[0].id;

    // Gerenciar números de série
    if (is_serialized) {
      // Obter números de série existentes para esta variação e filial
      const existingSerialsResult = await client.query(
        'SELECT serial_number FROM product_serials WHERE product_variation_id = $1 AND current_branch_id = $2;',
        [variationId, branch_id]
      );
      const existingSerials = new Set(existingSerialsResult.rows.map(row => row.serial_number));

      const newSerialsSet = new Set(serial_numbers);

      // Adicionar novos números de série
      for (const serialNum of serial_numbers) {
        if (!existingSerials.has(serialNum)) {
          await client.query(
            'INSERT INTO product_serials (product_variation_id, serial_number, current_branch_id) VALUES ($1, $2, $3);',
            [variationId, serialNum, branch_id]
          );
        }
      }

      // Remover números de série que não estão mais na lista (marcar como 'deleted' ou remover fisicamente)
      // Para simplificar, vamos apenas garantir que os que não estão na nova lista não estejam 'in_stock'
      // Uma abordagem mais robusta seria marcar como 'deleted' ou 'removed_from_inventory'
      for (const existingSerial of existingSerials) {
        if (!newSerialsSet.has(existingSerial)) {
          // Marcar como fora de estoque ou deletar, dependendo da política
          // Por enquanto, vamos apenas garantir que não estejam mais 'in_stock'
          await client.query(
            'UPDATE product_serials SET status = \'removed_from_inventory\' WHERE product_variation_id = $1 AND serial_number = $2 AND current_branch_id = $3;',
            [variationId, existingSerial, branch_id]
          );
        }
      }
    } else {
      // Se o produto não é mais serializado, garantir que não haja serials 'in_stock' para ele
      await client.query(
        'UPDATE product_serials SET status = \'removed_from_inventory\' WHERE product_variation_id = $1 AND current_branch_id = $2 AND status = \'in_stock\';',
        [variationId, branch_id]
      );
    }

    await logActivity(req.user.name, `Produto ${name} (ID: ${id}) atualizado.`, 'product', id);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Produto atualizado com sucesso!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar produto:', err);
    throw new AppError(err.message || 'Erro interno do servidor.', 500);
  } finally {
    client.release();
  }
};

// Deletar um produto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM product_serials WHERE product_variation_id IN (SELECT id FROM product_variations WHERE product_id = $1);', [id]);
    // Primeiro, deletar variações do produto
    await client.query('DELETE FROM product_variations WHERE product_id = $1;', [id]);
    // Depois, deletar o produto
    const { rowCount } = await client.query('DELETE FROM products WHERE id = $1;', [id]);

    if (rowCount === 0) {
      throw new NotFoundError('Produto não encontrado.');
    }

    await logActivity(req.user.name, `Produto (ID: ${id}) excluído.`, 'product', id);

    await client.query('COMMIT');
    res.status(204).send(); // No Content
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar produto:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

const csv = require('csv-parser');
const { Parser } = require('json2csv');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Obter produtos com estoque abaixo do mínimo
exports.getLowStockProducts = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT p.id, p.name, pv.barcode, pv.stock_quantity, pv.min_stock_level FROM products p JOIN product_variations pv ON p.id = pv.product_id WHERE pv.stock_quantity <= pv.min_stock_level ORDER BY pv.stock_quantity ASC;',
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos com estoque baixo:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

// Importar produtos via CSV
exports.importProducts = [upload.single('file'), async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Nenhum arquivo enviado.');
  }

  const productsToImport = [];
  const filePath = req.file.path;

  try {
    require('fs').createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        productsToImport.push(row);
      })
      .on('end', async () => {
        const client = await db.getClient();
        try {
          await client.query('BEGIN');
          let importedCount = 0;

          for (const productData of productsToImport) {
            const { name, description, barcode, category_id, supplier_id, price, cost_price, stock_quantity, color, size, weight, min_stock_level } = productData;

            // Basic validation
            if (!name || !barcode || !price || !stock_quantity) {
              console.warn(`Skipping row due to missing data: ${JSON.stringify(productData)}`);
              continue;
            }

            const productResult = await client.query(
              'INSERT INTO products (name, description, category_id, supplier_id) VALUES ($1, $2, $3, $4) RETURNING id;',
              [name, description, category_id || null, supplier_id || null]
            );
            const productId = productResult.rows[0].id;

            await client.query(
              'INSERT INTO product_variations (product_id, price, cost_price, stock_quantity, color, size, weight, min_stock_level, barcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;',
              [productId, parseFloat(price), parseFloat(cost_price), parseInt(stock_quantity, 10), color, size, weight, min_stock_level, barcode]
            );
            importedCount++;
          }

          await logActivity(req.user.name, `Importação de ${importedCount} produtos via CSV.`, 'product_import', null);
          await client.query('COMMIT');
          res.status(200).json({ message: `${importedCount} produtos importados com sucesso!` });
        } catch (transactionError) {
          await client.query('ROLLBACK');
          console.error('Erro na transação de importação:', transactionError);
          throw new AppError('Erro ao processar o arquivo CSV.', 500);
        } finally {
          // Clean up the uploaded file
          require('fs').unlink(filePath, (err) => {
            if (err) console.error('Erro ao deletar arquivo temporário:', err);
          });
          client.release();
        }
      });
  } catch (err) {
    console.error('Erro ao ler arquivo CSV:', err);
    throw new AppError('Erro ao ler o arquivo CSV.', 500);
  }
}];

// Exportar produtos para CSV
exports.exportProducts = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        p.name, p.description, pv.barcode, c.name as category_name, s.name as supplier_name,
        pv.price, pv.cost_price, pv.stock_quantity, pv.color, pv.size, pv.weight, pv.min_stock_level
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC`
    );

    const fields = [
      { label: 'Nome', value: 'name' },
      { label: 'Descrição', value: 'description' },
      { label: 'Código de Barras', value: 'barcode' },
      { label: 'Categoria', value: 'category_name' },
      { label: 'Fornecedor', value: 'supplier_name' },
      { label: 'Preço', value: 'price' },
      { label: 'Custo', value: 'cost_price' },
      { label: 'Estoque', value: 'stock_quantity' },
      { label: 'Cor', value: 'color' },
      { label: 'Tamanho', value: 'size' },
      { label: 'Peso', value: 'weight' },
      { label: 'Estoque Mínimo', value: 'min_stock_level' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);

  } catch (err) {
    console.error('Erro ao exportar produtos:', err);
    throw new AppError('Erro interno do servidor ao exportar produtos.', 500);
  }
};
