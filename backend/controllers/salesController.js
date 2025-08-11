const { AppError, NotFoundError, BadRequestError } = require('../utils/appError');
const db = require('../db'); // Added this line

exports.createSale = async (req, res) => {
    const { customer_id, total_amount, payment_method, sale_date, products, gift_card_code, gift_card_amount } = req.body;
    const user_id = req.user.id; // Assumindo que o user_id vem do token de autenticação
    const currentBranchId = req.user.branch_id; // Assumindo que o branch_id vem do token de autenticação

    if (!customer_id || !total_amount || !payment_method || !products || products.length === 0) {
        throw new BadRequestError('Dados da venda incompletos.');
    }

    let finalTotalAmount = total_amount;
    let giftCardId = null;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Handle Gift Card payment if provided
        if (gift_card_code && gift_card_amount) {
            const { rows } = await client.query(
                'SELECT * FROM gift_cards WHERE code = $1 FOR UPDATE;',
                [gift_card_code]
            );

            if (rows.length === 0) {
                throw new NotFoundError('Vale-presente não encontrado.');
            }
            const giftCard = rows[0];

            if (giftCard.status !== 'active') {
                throw new BadRequestError(`Vale-presente não está ativo. Status atual: ${giftCard.status}.`);
            }
            if (giftCard.expiry_date && new Date(giftCard.expiry_date) < new Date()) {
                throw new BadRequestError('Vale-presente expirado.');
            }
            if (giftCard.current_value < gift_card_amount) {
                throw new BadRequestError(`Saldo insuficiente no vale-presente. Saldo atual: R${giftCard.current_value}.`);
            }

            const newCurrentValue = giftCard.current_value - gift_card_amount;
            let newStatus = giftCard.status;
            if (newCurrentValue === 0) {
                newStatus = 'redeemed'; // Totalmente resgatado
            }

            await client.query(
                'UPDATE gift_cards SET current_value = $1, status = $2, updated_at = NOW() WHERE id = $3;',
                [newCurrentValue, newStatus, giftCard.id]
            );

            // Log transaction for redemption
            await client.query(
                'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, user_id, notes) VALUES ($1, $2, $3, $4, $5);',
                [giftCard.id, 'redeem', gift_card_amount, user_id, 'Resgate em venda']
            );

            finalTotalAmount -= gift_card_amount;
            giftCardId = giftCard.id;
        }

        // Inserir a venda principal
        const saleResult = await client.query(
            'INSERT INTO sales (customer_id, user_id, total_amount, payment_method, sale_date, gift_card_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
            [customer_id, user_id, finalTotalAmount, payment_method, sale_date || new Date(), giftCardId]
        );
        const saleId = saleResult.rows[0].id;

        // Inserir os itens da venda
        for (const product of products) {
            const { product_id, quantity, price_at_sale, is_serialized, serial_number } = product;

            if (is_serialized) {
                if (!serial_number) {
                    throw new BadRequestError(`Produto serializado ${product_id} requer um número de série.`);
                }
                // 1. Verificar se o serial existe e está em estoque na filial correta
                const serialResult = await client.query(
                    'SELECT id, status FROM product_serials WHERE serial_number = $1 AND product_variation_id = $2 AND current_branch_id = $3 FOR UPDATE;',
                    [serial_number, product_id, currentBranchId]
                );
                if (serialResult.rows.length === 0 || serialResult.rows[0].status !== 'in_stock') {
                    throw new NotFoundError(`Número de série ${serial_number} não encontrado ou não disponível em estoque.`);
                }

                // 2. Atualizar status do número de série para 'sold'
                await client.query(
                    'UPDATE product_serials SET status = \'sold\', sale_item_id = (SELECT id FROM sale_items WHERE sale_id = $1 AND product_id = $2 AND serial_number = $3), updated_at = NOW() WHERE id = $4;',
                    [saleId, product_id, serial_number, serialResult.rows[0].id] // sale_item_id será atualizado após a inserção do sale_item
                );

                // 3. Inserir item da venda com o número de série
                const saleItemResult = await client.query(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale, serial_number) VALUES ($1, $2, $3, $4, $5) RETURNING id;',
                    [saleId, product_id, 1, price_at_sale, serial_number] // Quantidade para serializado é sempre 1
                );
                // Atualizar o sale_item_id no product_serials
                await client.query(
                    'UPDATE product_serials SET sale_item_id = $1 WHERE id = $2;',
                    [saleItemResult.rows[0].id, serialResult.rows[0].id]
                );

                // Para produtos serializados, stock_quantity não é decrementado aqui, é gerenciado pela contagem de serials
            } else {
                // Produto não serializado: decrementar estoque normalmente
                await client.query(
                    'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
                    [quantity, product_id] // Assumindo product_id aqui é variation_id
                );
                await client.query(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4);',
                    [saleId, product_id, quantity, price_at_sale]
                );
            }
        }

        await logActivity(req.user.name, `Venda #${saleId} criada para o cliente ${customer_id}.`, 'sale', saleId);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Venda criada com sucesso!', saleId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar venda:', error);
        throw new AppError(error.message || 'Erro interno do servidor ao criar venda.', 500);
    } finally {
        client.release();
    }
};

// Obter todas as vendas com paginação, ordenação e filtros
exports.getAllSales = async (req, res) => {
    const { page = 1, pageSize = 10, sort = 'sale_date', order = 'desc', filters } = req.query;
    const offset = (page - 1) * pageSize;

    try {
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        if (filters) {
            const parsedFilters = JSON.parse(filters);
            const filterConditions = [];

            if (parsedFilters.customer_name) {
                filterConditions.push(`c.name ILIKE ${paramIndex++}`);
                params.push(`%${parsedFilters.customer_name}%`);
            }
            if (parsedFilters.payment_method) {
                filterConditions.push(`s.payment_method ILIKE ${paramIndex++}`);
                params.push(`%${parsedFilters.payment_method}%`);
            }
            // Adicionar mais filtros conforme necessário

            if (filterConditions.length > 0) {
                whereClause = ` WHERE ${filterConditions.join(' AND ')}`;
            }
        }

        const dataQuery = `
            SELECT
                s.id,
                s.customer_id,
                c.name AS customer_name,
                s.user_id,
                u.name AS user_name,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.user_id = u.id
            ${whereClause}
            ORDER BY ${sort} ${order.toUpperCase()}
            LIMIT ${paramIndex++} OFFSET ${paramIndex++};
        `;
        const dataResult = await db.query(dataQuery, [...params, pageSize, offset]);

        const countQuery = `
            SELECT COUNT(*)
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.user_id = u.id
            ${whereClause};
        `;
        const countResult = await db.query(countQuery, params);
        const totalRecords = parseInt(countResult.rows[0].count, 10);

        res.json({
            data: dataResult.rows,
            page,
            pageSize,
            totalRecords,
            totalPages: Math.ceil(totalRecords / pageSize),
        });
    } catch (error) {
        console.error('Erro ao buscar todas as vendas:', error);
        throw new AppError('Erro interno do servidor ao buscar vendas.', 500);
    }
};

// Obter uma venda por ID
exports.getSaleById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                s.id,
                s.customer_id,
                c.name AS customer_name,
                s.user_id,
                u.name AS user_name,
                s.total_amount,
                s.payment_method,
                s.sale_date,
                si.product_id,
                pv.barcode,
                p.name AS product_name,
                si.quantity,
                si.price_at_sale,
                si.serial_number
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN product_variations pv ON si.product_id = pv.id
            LEFT JOIN products p ON pv.product_id = p.id
            WHERE s.id = $1;
        `;
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            throw new NotFoundError('Venda não encontrada.');
        }

        // Agrupar itens da venda se houver múltiplos
        const sale = {
            id: rows[0].id,
            customer_id: rows[0].customer_id,
            customer_name: rows[0].customer_name,
            user_id: rows[0].user_id,
            user_name: rows[0].user_name,
            total_amount: rows[0].total_amount,
            payment_method: rows[0].payment_method,
            sale_date: rows[0].sale_date,
            items: rows.map(row => ({
                product_id: row.product_id,
                barcode: row.barcode,
                product_name: row.product_name,
                quantity: row.quantity,
                price_at_sale: row.price_at_sale,
                serial_number: row.serial_number,
            })).filter(item => item.product_id !== null) // Filtra itens nulos se não houver sale_items
        };

        res.json(sale);
    } catch (error) {
        console.error('Erro ao buscar venda por ID:', error);
        throw new AppError('Erro interno do servidor ao buscar venda.', 500);
    }
};

// Obter o histórico de vendas
exports.getSalesHistory = async (req, res) => {
    try {
        const { _sort = 'sale_date', _order = 'desc', q, sale_date_gte, sale_date_lte, customer_id } = req.query;
        let query = `
            SELECT
                s.id,
                s.customer_id,
                c.name AS customer_name,
                s.user_id,
                u.name AS user_name,
                s.total_amount,
                s.payment_method,
                s.sale_date
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.user_id = u.id
        `;
        const params = [];
        const conditions = [];
        let paramIndex = 1;

        if (q) {
            conditions.push(`(s.id::text ILIKE ${paramIndex} OR c.name ILIKE ${paramIndex} OR s.payment_method ILIKE ${paramIndex})`);
            params.push(`%${q}%`);
            paramIndex++;
        }
        if (sale_date_gte) {
            conditions.push(`s.sale_date >= ${paramIndex}`);
            params.push(sale_date_gte);
            paramIndex++;
        }
        if (sale_date_lte) {
            conditions.push(`s.sale_date <= ${paramIndex}`);
            params.push(sale_date_lte);
            paramIndex++;
        }
        if (customer_id) {
            conditions.push(`s.customer_id = ${paramIndex}`);
            params.push(customer_id);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY ${_sort} ${_order.toUpperCase()}`;

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao obter histórico de vendas:', error);
        throw new AppError('Erro interno do servidor ao obter histórico de vendas.', 500);
    }
};
