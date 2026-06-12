jest.mock('../../models/alertModel');
jest.mock('../../models/alertRuleModel');
jest.mock('../../models/notificationModel');
jest.mock('../../models/UserNotificationModel');
jest.mock('../../models/userModel');
jest.mock('../../socket/socket', () => ({ getIo: () => null }));

const { compareValue, evaluateValues } = require('../alertRuleEngine');
const AlertRule = require('../../models/alertRuleModel');
const Alert = require('../../models/alertModel');
const User = require('../../models/userModel');

describe('compareValue', () => {
  test('> : retourne true si valeur dépasse le seuil', () => {
    expect(compareValue(45, '>', 40)).toBe(true);
  });
  test('> : retourne false si valeur sous le seuil', () => {
    expect(compareValue(35, '>', 40)).toBe(false);
  });
  test('>= : retourne true si valeur égale au seuil', () => {
    expect(compareValue(40, '>=', 40)).toBe(true);
  });
  test('< : retourne true si valeur sous le seuil', () => {
    expect(compareValue(30, '<', 40)).toBe(true);
  });
  test('<= : retourne true si valeur inférieure ou égale', () => {
    expect(compareValue(80, '<=', 100)).toBe(true);
  });
  test('== : retourne true si valeur égale', () => {
    expect(compareValue(50, '==', 50)).toBe(true);
  });
  test('!= : retourne true si valeur différente', () => {
    expect(compareValue(30, '!=', 50)).toBe(true);
  });
  test('opérateur inconnu : retourne false', () => {
    expect(compareValue(30, '??', 50)).toBe(false);
  });
});

describe('evaluateValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retourne [] si values est null', async () => {
    const result = await evaluateValues({ values: null });
    expect(result).toEqual([]);
  });

  test('retourne [] si aucune règle active ne correspond', async () => {
    AlertRule.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });
    const result = await evaluateValues({
      values: { temperature: 45 },
      device: { _id: 'dev1' },
    });
    expect(result).toEqual([]);
  });

  test('crée une alerte si la règle est déclenchée', async () => {
    const mockRule = {
      _id: 'rule1',
      metric: 'temperature',
      operator: '>',
      threshold: 40,
      severity: 'high',
      cooldownSec: 0,
      isActive: true,
    };

    AlertRule.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockRule]),
    });

    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    Alert.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });

    const mockAlert = { _id: 'alert1', severity: 'high', status: 'open' };
    Alert.create.mockResolvedValue(mockAlert);
    Alert.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
    });

    const result = await evaluateValues({
      values: { temperature: 45 },
      device: { _id: 'dev1', company: 'company1' },
    });

    expect(Alert.create).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('high');
  });

  test('ne crée pas d\'alerte si valeur sous le seuil', async () => {
    const mockRule = {
      _id: 'rule1',
      metric: 'temperature',
      operator: '>',
      threshold: 40,
      severity: 'high',
      cooldownSec: 0,
      isActive: true,
    };

    AlertRule.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockRule]),
    });

    const result = await evaluateValues({
      values: { temperature: 35 },
      device: { _id: 'dev1' },
    });

    expect(Alert.create).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});