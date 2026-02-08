import { describe, it, expect, beforeEach } from 'vitest';
import { ruleEngineService } from '../../../src/services/ruleEngineService.js';

describe('ruleEngineService', () => {
  // Backup das regras originais
  const originalRules = [...ruleEngineService.rules];

  beforeEach(() => {
    // Restaurar regras originais antes de cada teste
    ruleEngineService.rules = [...originalRules];
  });

  describe('evaluate', () => {
    it('should trigger actions when conditions are met (greaterThanInclusive)', async () => {
      const facts = { cart: { total: 500 } };
      const actions = await ruleEngineService.evaluate('cart.total_change', facts);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('apply_discount_percentage');
      expect(actions[0].params.percentage).toBe(10);
    });

    it('should NOT trigger actions when conditions are NOT met', async () => {
      const facts = { cart: { total: 499 } };
      const actions = await ruleEngineService.evaluate('cart.total_change', facts);
      expect(actions).toHaveLength(0);
    });

    it('should handle nested facts correctly', async () => {
      // Teste implícito via 'cart.total' que já é aninhado.
      // Vamos testar um aninhamento mais profundo ou falha.
      const facts = { user: { profile: { age: 30 } } };
      const val = ruleEngineService.getFactValue(facts, 'user.profile.age');
      expect(val).toBe(30);
    });

    it('should return undefined for missing nested facts', async () => {
      const facts = { user: {} };
      const val = ruleEngineService.getFactValue(facts, 'user.profile.age');
      expect(val).toBeUndefined();
    });

    it('should evaluate multiple conditions (AND logic)', async () => {
      // Regra: Silver status AND cart > 100
      const factsSuccess = { customer: { loyaltyLevel: 'Silver' }, cart: { total: 101 } };
      const actionsSuccess = await ruleEngineService.evaluate(
        'customer.loyalty_status',
        factsSuccess,
      );
      expect(actionsSuccess).toHaveLength(1);

      const factsFail1 = { customer: { loyaltyLevel: 'Gold' }, cart: { total: 101 } };
      const actionsFail1 = await ruleEngineService.evaluate('customer.loyalty_status', factsFail1);
      expect(actionsFail1).toHaveLength(0);

      const factsFail2 = { customer: { loyaltyLevel: 'Silver' }, cart: { total: 50 } };
      const actionsFail2 = await ruleEngineService.evaluate('customer.loyalty_status', factsFail2);
      expect(actionsFail2).toHaveLength(0);
    });

    it('should trigger always if no conditions', async () => {
      const actions = await ruleEngineService.evaluate('customer.created', {});
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('send_notification');
    });

    it('should ignore inactive rules', async () => {
      // Desativar a regra de 500
      const rules = await ruleEngineService.getRules();
      const rule = rules.find((r) => r.id === 'discount_over_500');
      if (rule) rule.isActive = false;

      const facts = { cart: { total: 600 } };
      const actions = await ruleEngineService.evaluate('cart.total_change', facts);
      expect(actions).toHaveLength(0);
    });
  });

  describe('evaluateCondition operators', () => {
    it('equal', () => {
      expect(ruleEngineService.evaluateCondition(10, 'equal', 10)).toBe(true);
      expect(ruleEngineService.evaluateCondition(10, 'equal', 11)).toBe(false);
    });
    it('notEqual', () => {
      expect(ruleEngineService.evaluateCondition(10, 'notEqual', 11)).toBe(true);
      expect(ruleEngineService.evaluateCondition(10, 'notEqual', 10)).toBe(false);
    });
    it('greaterThan', () => {
      expect(ruleEngineService.evaluateCondition(11, 'greaterThan', 10)).toBe(true);
      expect(ruleEngineService.evaluateCondition(10, 'greaterThan', 10)).toBe(false);
    });
    it('lessThan', () => {
      expect(ruleEngineService.evaluateCondition(9, 'lessThan', 10)).toBe(true);
      expect(ruleEngineService.evaluateCondition(10, 'lessThan', 10)).toBe(false);
    });
    it('lessThanInclusive', () => {
      expect(ruleEngineService.evaluateCondition(10, 'lessThanInclusive', 10)).toBe(true);
      expect(ruleEngineService.evaluateCondition(9, 'lessThanInclusive', 10)).toBe(true);
      expect(ruleEngineService.evaluateCondition(11, 'lessThanInclusive', 10)).toBe(false);
    });
    it('contains (string)', () => {
      expect(ruleEngineService.evaluateCondition('hello world', 'contains', 'world')).toBe(true);
      expect(ruleEngineService.evaluateCondition('hello world', 'contains', 'universe')).toBe(
        false,
      );
    });
    it('contains (array)', () => {
      expect(ruleEngineService.evaluateCondition([1, 2, 3], 'contains', 2)).toBe(true);
      expect(ruleEngineService.evaluateCondition([1, 2, 3], 'contains', 4)).toBe(false);
    });
    it('notContains (string)', () => {
      expect(ruleEngineService.evaluateCondition('hello world', 'notContains', 'universe')).toBe(
        true,
      );
      expect(ruleEngineService.evaluateCondition('hello world', 'notContains', 'world')).toBe(
        false,
      );
    });
    it('notContains (array)', () => {
      expect(ruleEngineService.evaluateCondition([1, 2, 3], 'notContains', 4)).toBe(true);
      expect(ruleEngineService.evaluateCondition([1, 2, 3], 'notContains', 2)).toBe(false);
    });
    it('default', () => {
      expect(ruleEngineService.evaluateCondition(1, 'unknown' as any, 1)).toBe(false);
    });
  });

  describe('CRUD', () => {
    it('should create a new rule', async () => {
      const newRule = {
        id: 'new_rule',
        name: 'New Rule',
        eventType: 'test',
        conditions: [],
        actions: [],
        isActive: true,
      };
      await ruleEngineService.createOrUpdateRule(newRule);
      const rules = await ruleEngineService.getRules();
      expect(rules).toContainEqual(newRule);
    });

    it('should update an existing rule', async () => {
      const rules = await ruleEngineService.getRules();
      const ruleToUpdate = { ...rules[0], name: 'Updated Name' };
      await ruleEngineService.createOrUpdateRule(ruleToUpdate);

      const updatedRules = await ruleEngineService.getRules();
      expect(updatedRules.find((r) => r.id === ruleToUpdate.id)?.name).toBe('Updated Name');
    });

    it('should delete a rule', async () => {
      const rules = await ruleEngineService.getRules();
      const idToDelete = rules[0].id;
      const result = await ruleEngineService.deleteRule(idToDelete);

      expect(result).toBe(true);
      const updatedRules = await ruleEngineService.getRules();
      expect(updatedRules.find((r) => r.id === idToDelete)).toBeUndefined();
    });
  });
});
