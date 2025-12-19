import { getPool } from '../db/index.js';
export const assetService = {
    /**
     * Calcula o valor atual de um ativo com base no método de depreciação.
     * @param initialValue Valor inicial do ativo.
     * @param acquisitionDate Data de aquisição do ativo.
     * @param depreciationMethod Método de depreciação.
     * @param usefulLifeYears Vida útil em anos.
     * @returns Valor atual do ativo.
     */
    calculateCurrentValue(initialValue, acquisitionDate, depreciationMethod, usefulLifeYears) {
        const acquisition = new Date(acquisitionDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - acquisition.getTime());
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // Anos desde a aquisição
        if (diffYears >= usefulLifeYears) {
            return 0; // Ativo totalmente depreciado
        }
        let currentValue = initialValue;
        if (depreciationMethod === 'straight_line') {
            const annualDepreciation = initialValue / usefulLifeYears;
            currentValue = initialValue - annualDepreciation * diffYears;
        }
        else if (depreciationMethod === 'declining_balance') {
            // Exemplo simplificado de saldos decrescentes (double-declining balance)
            const depreciationRate = (1 / usefulLifeYears) * 2;
            currentValue = initialValue * Math.pow(1 - depreciationRate, diffYears);
        }
        return Math.max(0, parseFloat(currentValue.toFixed(2)));
    },
    async createAsset(payload) {
        const { name, description, acquisition_date, initial_value, depreciation_method, useful_life_years, branch_id, } = payload;
        const current_value = this.calculateCurrentValue(initial_value, acquisition_date, depreciation_method, useful_life_years);
        const result = await getPool().query('INSERT INTO assets (name, description, acquisition_date, initial_value, depreciation_method, useful_life_years, current_value, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [
            name,
            description,
            acquisition_date,
            initial_value,
            depreciation_method,
            useful_life_years,
            current_value,
            branch_id,
        ]);
        return result.rows[0];
    },
    async getAssetById(id) {
        const result = await getPool().query('SELECT * FROM assets WHERE id = $1', [id]);
        return result.rows[0];
    },
    async getAllAssets() {
        const result = await getPool().query('SELECT * FROM assets ORDER BY acquisition_date DESC');
        return result.rows;
    },
    async updateAsset(id, payload) {
        const existingAsset = await this.getAssetById(id);
        if (!existingAsset) {
            return undefined;
        }
        const { name, description, acquisition_date, initial_value, depreciation_method, useful_life_years, branch_id, } = payload;
        const updatedInitialValue = initial_value ?? existingAsset.initial_value;
        const updatedAcquisitionDate = acquisition_date ?? existingAsset.acquisition_date;
        const updatedDepreciationMethod = depreciation_method ?? existingAsset.depreciation_method;
        const updatedUsefulLifeYears = useful_life_years ?? existingAsset.useful_life_years;
        const newCurrentValue = this.calculateCurrentValue(updatedInitialValue, updatedAcquisitionDate, updatedDepreciationMethod, updatedUsefulLifeYears);
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (acquisition_date !== undefined) {
            fields.push(`acquisition_date = $${paramIndex++}`);
            values.push(acquisition_date);
        }
        if (initial_value !== undefined) {
            fields.push(`initial_value = $${paramIndex++}`);
            values.push(initial_value);
        }
        if (depreciation_method !== undefined) {
            fields.push(`depreciation_method = $${paramIndex++}`);
            values.push(depreciation_method);
        }
        if (useful_life_years !== undefined) {
            fields.push(`useful_life_years = $${paramIndex++}`);
            values.push(useful_life_years);
        }
        if (branch_id !== undefined) {
            fields.push(`branch_id = $${paramIndex++}`);
            values.push(branch_id);
        }
        fields.push(`current_value = $${paramIndex++}`);
        values.push(newCurrentValue); // Atualizar current_value
        if (fields.length === 0) {
            return existingAsset;
        }
        values.push(id);
        const query = `UPDATE assets SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        const result = await getPool().query(query, values);
        return result.rows[0];
    },
    async deleteAsset(id) {
        const result = await getPool().query('DELETE FROM assets WHERE id = $1 RETURNING id', [id]);
        return (result?.rowCount ?? 0) > 0;
    },
};
