const db = require('../db');

// Obter todos os papéis
exports.getAllRoles = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM roles');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar papéis.' });
  }
};

// Obter um papel por ID
exports.getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Papel não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar papel.' });
  }
};

// Criar um novo papel
exports.createRole = async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *'
      , [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar papel.' });
  }
};

// Atualizar um papel
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *'
      , [name, description, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Papel não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar papel.' });
  }
};

// Excluir um papel
exports.deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM roles WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Papel não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao excluir papel.' });
  }
};

// Obter todas as permissões
exports.getAllPermissions = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM permissions');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar permissões.' });
  }
};

// Atribuir permissões a um papel
exports.assignPermissionsToRole = async (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body; // Array de IDs de permissão
  try {
    // Remover permissões existentes para este papel para evitar duplicatas e simplificar a lógica
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

    // Inserir as novas permissões
    for (const permissionId of permissionIds) {
      await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)'
        , [roleId, permissionId]
      );
    }
    res.status(200).json({ message: 'Permissões atribuídas com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atribuir permissões.' });
  }
};

// Remover uma permissão de um papel
exports.removePermissionFromRole = async (req, res) => {
  const { roleId, permissionId } = req.params;
  try {
    const { rowCount } = await db.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2'
      , [roleId, permissionId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Permissão não encontrada para este papel.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao remover permissão.' });
  }
};
