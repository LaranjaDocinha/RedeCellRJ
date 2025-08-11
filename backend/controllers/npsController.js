const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Submeter uma nova pesquisa NPS
exports.submitNpsSurvey = async (req, res) => {
  const { customer_id, score, feedback_text, source, related_sale_id, related_repair_id } = req.body;

  if (!customer_id || score === undefined || score < 0 || score > 10) {
    return res.status(400).json({ message: 'Dados da pesquisa NPS incompletos ou inválidos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO nps_surveys (customer_id, score, feedback_text, source, related_sale_id, related_repair_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [customer_id, score, feedback_text || null, source || null, related_sale_id || null, related_repair_id || null]
    );
    const survey = result.rows[0];

    await logActivity(req.user.name || 'System', `Pesquisa NPS #${survey.id} submetida pelo cliente ${customer_id} com pontuação ${score}.`, 'nps_survey', survey.id);

    res.status(201).json(survey);
  } catch (error) {
    console.error('Erro ao submeter pesquisa NPS:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter todos as pesquisas NPS
exports.getAllNpsSurveys = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT ns.*, c.name as customer_name FROM nps_surveys ns JOIN customers c ON ns.customer_id = c.id ORDER BY survey_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar pesquisas NPS:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter relatório NPS (calcula o NPS score e retorna feedbacks)
exports.getNpsReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      whereClause += ` WHERE survey_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      whereClause += `${start_date ? ' AND' : ' WHERE'} survey_date <= $${paramIndex++}`;
      params.push(end_date);
    }

    const scoresResult = await db.query(`SELECT score FROM nps_surveys ${whereClause};`, params);
    const scores = scoresResult.rows.map(row => row.score);

    const totalResponses = scores.length;
    if (totalResponses === 0) {
      return res.json({ nps_score: 0, promoters: 0, passives: 0, detractors: 0, total_responses: 0, feedbacks: [] });
    }

    let promoters = 0; // Score 9-10
    let passives = 0;  // Score 7-8
    let detractors = 0; // Score 0-6

    scores.forEach(score => {
      if (score >= 9) {
        promoters++;
      } else if (score >= 7) {
        passives++;
      } else {
        detractors++;
      }
    });

    const npsScore = ((promoters - detractors) / totalResponses) * 100;

    const feedbacksResult = await db.query(`SELECT ns.feedback_text, ns.score, c.name as customer_name, ns.survey_date FROM nps_surveys ns JOIN customers c ON ns.customer_id = c.id WHERE ns.feedback_text IS NOT NULL ${whereClause} ORDER BY ns.survey_date DESC;`, params);

    res.json({
      nps_score: parseFloat(npsScore.toFixed(2)),
      promoters,
      passives,
      detractors,
      total_responses: totalResponses,
      feedbacks: feedbacksResult.rows,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório NPS:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
