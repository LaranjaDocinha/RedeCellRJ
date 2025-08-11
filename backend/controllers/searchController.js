const pool = require('../db');

const search = async (req, res) => {
  const { q } = req.query;
  const { permissions, role } = req.user; // Permissões carregadas pelo middleware

  if (!q || q.length < 2) {
    return res.json([]);
  }

  const searchTerm = `%${q}%`;
  const queries = [];

  // Adiciona a consulta de clientes se o usuário tiver permissão
  if (role === 'admin' || permissions.includes('customers:read')) {
    queries.push({
      query: `
        SELECT id, name, 'customer' as type, 'bx-user' as icon, '/customers/view/' || id as path
        FROM customers
        WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
        LIMIT 5;
      `,
      params: [searchTerm],
      formatter: (row) => ({ ...row, id: `customer-${row.id}` }),
    });
  }

  // Adiciona a consulta de produtos se o usuário tiver permissão
  if (role === 'admin' || permissions.includes('products:read')) {
    queries.push({
      query: `
        SELECT id, name, 'product' as type, 'bx-package' as icon, '/products/view/' || id as path
        FROM products
        WHERE name ILIKE $1 OR description ILIKE $1 OR sku ILIKE $1
        LIMIT 5;
      `,
      params: [searchTerm],
      formatter: (row) => ({ ...row, id: `product-${row.id}` }),
    });
  }

  // Adiciona a consulta de Ordens de Serviço se o usuário tiver permissão
  if (role === 'admin' || permissions.includes('repairs:read')) {
    queries.push({
      query: `
        SELECT os.id, c.name as customer_name, d.model, 'repair' as type, 'bx-wrench' as icon, '/repairs/view/' || os.id as path
        FROM repairs os
        JOIN customers c ON os.customer_id = c.id
        JOIN devices d ON os.device_id = d.id
        WHERE d.model ILIKE $1 OR os.status ILIKE $1 OR c.name ILIKE $1
        LIMIT 5;
      `,
      params: [searchTerm],
      formatter: (row) => ({ ...row, id: `repair-${row.id}`, name: `OS #${row.id}: ${row.customer_name} - ${row.model}` }),
    });
  }

  // Adiciona a consulta de usuários se o usuário tiver permissão
  if (role === 'admin' || permissions.includes('users:read')) {
    queries.push({
      query: `
        SELECT id, name, email, 'user' as type, 'bx-user-circle' as icon, '/settings/users/view/' || id as path
        FROM users
        WHERE name ILIKE $1 OR email ILIKE $1
        LIMIT 5;
      `,
      params: [searchTerm],
      formatter: (row) => ({ ...row, id: `user-${row.id}`, name: `${row.name} (${row.email})` }),
    });
  }

  try {
    const promises = queries.map(q => pool.query(q.query, q.params));
    const results = await Promise.all(promises);

    let combinedResults = [];
    results.forEach((resultSet, index) => {
      const formatter = queries[index].formatter;
      const formattedRows = resultSet.rows.map(formatter);
      combinedResults = combinedResults.concat(formattedRows);
    });

    res.json(combinedResults);
  } catch (error) {
    console.error('Erro na busca global:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao realizar a busca.' });
  }
};

module.exports = {
  search,
};