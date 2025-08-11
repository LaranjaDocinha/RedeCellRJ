
const pool = require('../db');

// Formata os resultados do banco de dados para o formato do FullCalendar
const formatToCalendarEvent = (item, type) => {
    if (type === 'sale') {
        return {
            id: `sale-${item.id}`,
            title: `Venda #${item.id} - ${item.customer_name || 'N/A'}`,
            start: item.sale_date,
            allDay: true, // Eventos de venda duram o dia todo no calendário
            color: '#28a745', // Verde para vendas
            extendedProps: {
                type: 'Venda',
                amount: item.total_amount,
                customer: item.customer_name || 'N/A',
                details: item
            }
        };
    }

    if (type === 'repair') {
        return {
            id: `repair-${item.id}`,
            title: `Reparo #${item.id} - ${item.device_type} ${item.model}`,
            start: item.created_at,
            allDay: true, // Reparos também são mostrados como eventos de dia inteiro
            color: '#007bff', // Azul para reparos
            extendedProps: {
                type: 'Reparo',
                status: item.status,
                customer: item.customer_name || 'N/A',
                details: item
            }
        };
    }
    return null;
};

// @desc    Obter todos os eventos (vendas e reparos) para o calendário
// @route   GET /api/calendar/events
// @access  Private
const getCalendarEvents = async (req, res) => {
    const { start, end } = req.query;

    // Validação básica das datas
    if (!start || !end) {
        return res.status(400).json({ message: 'As datas de início e fim são obrigatórias.' });
    }

    try {
        // Query para buscar vendas no período, juntando com clientes para obter o nome
        const salesQuery = `
            SELECT 
                s.id, 
                s.sale_date, 
                s.total_amount, 
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.sale_date BETWEEN $1 AND $2;
        `;

        // Query para buscar reparos no período, juntando com clientes
        const repairsQuery = `
            SELECT 
                r.id, 
                r.created_at, 
                r.device_type, 
                r.model, 
                r.status,
                c.name as customer_name
            FROM repairs r
            LEFT JOIN customers c ON r.customer_id = c.id
            WHERE r.created_at BETWEEN $1 AND $2;
        `;

        // Executa as queries em paralelo
        const [salesResult, repairsResult] = await Promise.all([
            pool.query(salesQuery, [start, end]),
            pool.query(repairsQuery, [start, end])
        ]);

        // Formata os resultados para o formato do calendário
        const salesEvents = salesResult.rows.map(sale => formatToCalendarEvent(sale, 'sale'));
        const repairEvents = repairsResult.rows.map(repair => formatToCalendarEvent(repair, 'repair'));

        // Combina os eventos de ambas as fontes
        const allEvents = [...salesEvents, ...repairEvents];

        res.status(200).json(allEvents);

    } catch (error) {
        console.error('Erro ao buscar eventos do calendário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

module.exports = {
    getCalendarEvents,
};
