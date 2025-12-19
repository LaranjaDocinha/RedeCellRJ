// Em um cenário real, você usaria uma biblioteca como 'json-rules-engine' ou algo mais robusto.
// Para fins de demonstração e "pau na máquina", faremos um motor de regras simplificado.

interface Rule {
  id: string;
  name: string;
  description?: string;
  eventType: string; // Ex: 'cart.total_change', 'product.added', 'customer.loyalty_status'
  conditions: Condition[];
  actions: Action[];
  isActive: boolean;
}

interface Condition {
  fact: string; // O 'fato' a ser avaliado (ex: 'cart.total', 'product.category', 'customer.loyaltyLevel')
  operator: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanInclusive' | 'lessThanInclusive' | 'contains' | 'notContains';
  value: any;
}

interface Action {
  type: string; // Ex: 'apply_discount', 'send_notification', 'add_loyalty_points'
  params: Record<string, any>;
}

const predefinedRules: Rule[] = [
  {
    id: 'discount_over_500',
    name: 'Desconto 10% para compras acima de R$500',
    eventType: 'cart.total_change',
    conditions: [
      { fact: 'cart.total', operator: 'greaterThanInclusive', value: 500 },
    ],
    actions: [
      { type: 'apply_discount_percentage', params: { percentage: 10, reason: 'Bulk Purchase Discount' } },
    ],
    isActive: true,
  },
  {
    id: 'loyalty_level_silver_discount',
    name: 'Desconto 5% para clientes Silver',
    eventType: 'customer.loyalty_status',
    conditions: [
      { fact: 'customer.loyaltyLevel', operator: 'equal', value: 'Silver' },
      { fact: 'cart.total', operator: 'greaterThan', value: 100 } // Só aplica se a compra for acima de 100
    ],
    actions: [
      { type: 'apply_discount_percentage', params: { percentage: 5, reason: 'Loyalty Silver Discount' } },
    ],
    isActive: true,
  },
  {
    id: 'send_welcome_notification',
    name: 'Enviar notificação de boas-vindas para novo cliente',
    eventType: 'customer.created',
    conditions: [], // Always trigger for new customer
    actions: [
      { type: 'send_notification', params: { templateName: 'customer_welcome', channels: ['whatsapp', 'email'] } },
    ],
    isActive: true,
  }
];


export const ruleEngineService = {
  // Em um sistema real, as regras seriam carregadas do banco de dados
  rules: predefinedRules as Rule[], 

  async evaluate(eventType: string, facts: Record<string, any>): Promise<Action[]> {
    const applicableActions: Action[] = [];

    for (const rule of this.rules) {
      if (!rule.isActive || rule.eventType !== eventType) {
        continue;
      }

      let conditionsMet = true;
      for (const condition of rule.conditions) {
        const factValue = this.getFactValue(facts, condition.fact);
        if (!this.evaluateCondition(factValue, condition.operator, condition.value)) {
          conditionsMet = false;
          break;
        }
      }

      if (conditionsMet) {
        applicableActions.push(...rule.actions);
      }
    }
    return applicableActions;
  },

  getFactValue(facts: Record<string, any>, factPath: string): any {
    // Permite buscar fatos aninhados, ex: 'customer.address.city'
    const parts = factPath.split('.');
    let value = facts;
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    return value;
  },

  evaluateCondition(factValue: any, operator: Condition['operator'], compareValue: any): boolean {
    switch (operator) {
      case 'equal': return factValue === compareValue;
      case 'notEqual': return factValue !== compareValue;
      case 'greaterThan': return factValue > compareValue;
      case 'lessThan': return factValue < compareValue;
      case 'greaterThanInclusive': return factValue >= compareValue;
      case 'lessThanInclusive': return factValue <= compareValue;
      case 'contains': return Array.isArray(factValue) ? factValue.includes(compareValue) : String(factValue).includes(String(compareValue));
      case 'notContains': return Array.isArray(factValue) ? !factValue.includes(compareValue) : !String(factValue).includes(String(compareValue));
      default: return false;
    }
  },

  // Métodos para gerenciar regras (CRUD)
  async getRules(): Promise<Rule[]> {
    return this.rules;
  },

  async createOrUpdateRule(rule: Rule): Promise<Rule> {
    const existingIndex = this.rules.findIndex(r => r.id === rule.id);
    if (existingIndex > -1) {
      this.rules[existingIndex] = rule;
    } else {
      this.rules.push(rule);
    }
    // Em um sistema real, salvar no banco de dados
    return rule;
  },

  async deleteRule(ruleId: string): Promise<boolean> {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== ruleId);
    return this.rules.length < initialLength;
  }
};
