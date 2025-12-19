export class CommissionRulesController {
    constructor(commissionRulesService) {
        this.commissionRulesService = commissionRulesService;
    }
    async createCommissionRule(req, res) {
        try {
            const rule = await this.commissionRulesService.createCommissionRule(req.body);
            return res.status(201).json(rule);
        }
        catch (error) {
            console.error('Error creating commission rule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getCommissionRules(req, res) {
        try {
            const rules = await this.commissionRulesService.getCommissionRules();
            return res.status(200).json(rules);
        }
        catch (error) {
            console.error('Error fetching commission rules:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getCommissionRuleById(req, res) {
        try {
            const { id } = req.params;
            const rule = await this.commissionRulesService.getCommissionRuleById(id);
            if (!rule) {
                return res.status(404).json({ message: 'Commission rule not found' });
            }
            return res.status(200).json(rule);
        }
        catch (error) {
            console.error('Error fetching commission rule by ID:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateCommissionRule(req, res) {
        try {
            const { id } = req.params;
            const rule = await this.commissionRulesService.updateCommissionRule(id, req.body);
            if (!rule) {
                return res.status(404).json({ message: 'Commission rule not found' });
            }
            return res.status(200).json(rule);
        }
        catch (error) {
            console.error('Error updating commission rule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async deleteCommissionRule(req, res) {
        try {
            const { id } = req.params;
            const success = await this.commissionRulesService.deleteCommissionRule(id);
            if (!success) {
                return res.status(404).json({ message: 'Commission rule not found' });
            }
            return res.status(204).send(); // No Content
        }
        catch (error) {
            console.error('Error deleting commission rule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
