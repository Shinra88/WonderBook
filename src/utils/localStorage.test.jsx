// 📁 __tests__/utils/localStorage.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  storeInLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage
} from './localStorage';

// Mock de localStorage
const mockLocalStorage = {
  store: {},
  setItem: vi.fn((key, value) => {
    mockLocalStorage.store[key] = value;
  }),
  getItem: vi.fn((key) => {
    return mockLocalStorage.store[key] || null;
  }),
  removeItem: vi.fn((key) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('localStorage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.store = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('storeInLocalStorage', () => {
    it('should store string value', () => {
      storeInLocalStorage('testKey', 'testValue');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
      expect(mockLocalStorage.store.testKey).toBe('testValue');
    });

    it('should store number value', () => {
      storeInLocalStorage('numberKey', 123);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('numberKey', 123);
      expect(mockLocalStorage.store.numberKey).toBe(123);
    });

    it('should store boolean value', () => {
      storeInLocalStorage('boolKey', true);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('boolKey', true);
      expect(mockLocalStorage.store.boolKey).toBe(true);
    });

    it('should stringify and store object value', () => {
      const testObject = { name: 'John', age: 30, active: true };
      storeInLocalStorage('objectKey', testObject);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('objectKey', JSON.stringify(testObject));
      expect(mockLocalStorage.store.objectKey).toBe('{"name":"John","age":30,"active":true}');
    });

    it('should stringify and store array value', () => {
      const testArray = [1, 2, 3, 'test'];
      storeInLocalStorage('arrayKey', testArray);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('arrayKey', JSON.stringify(testArray));
      expect(mockLocalStorage.store.arrayKey).toBe('[1,2,3,"test"]');
    });

    it('should handle null value', () => {
      storeInLocalStorage('nullKey', null);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nullKey', 'null');
      expect(mockLocalStorage.store.nullKey).toBe('null');
    });

    it('should handle undefined value', () => {
      storeInLocalStorage('undefinedKey', undefined);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('undefinedKey', undefined);
      expect(mockLocalStorage.store.undefinedKey).toBe(undefined);
    });

    it('should handle empty object', () => {
      storeInLocalStorage('emptyObjectKey', {});

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('emptyObjectKey', '{}');
      expect(mockLocalStorage.store.emptyObjectKey).toBe('{}');
    });

    it('should handle complex nested object', () => {
      const complexObject = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        data: [1, 2, { nested: true }]
      };
      
      storeInLocalStorage('complexKey', complexObject);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('complexKey', JSON.stringify(complexObject));
    });
  });

  describe('getFromLocalStorage', () => {
    it('should retrieve and parse JSON object', () => {
      const testObject = { name: 'John', age: 30 };
      mockLocalStorage.store.objectKey = JSON.stringify(testObject);

      const result = getFromLocalStorage('objectKey');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('objectKey');
      expect(result).toEqual(testObject);
    });

    it('should retrieve and parse JSON array', () => {
      const testArray = [1, 2, 3, 'test'];
      mockLocalStorage.store.arrayKey = JSON.stringify(testArray);

      const result = getFromLocalStorage('arrayKey');

      expect(result).toEqual(testArray);
    });

    it('should return string value when JSON parse fails', () => {
      mockLocalStorage.store.stringKey = 'simple string';

      const result = getFromLocalStorage('stringKey');

      expect(result).toBe('simple string');
    });

    it('should return null when key does not exist', () => {
      const result = getFromLocalStorage('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage.store.invalidJson = '{"incomplete": json}';

      const result = getFromLocalStorage('invalidJson');

      expect(result).toBe('{"incomplete": json}');
    });

    it('should parse null value correctly', () => {
      mockLocalStorage.store.nullKey = 'null';

      const result = getFromLocalStorage('nullKey');

      expect(result).toBeNull();
    });

    it('should parse boolean values correctly', () => {
      mockLocalStorage.store.trueKey = 'true';
      mockLocalStorage.store.falseKey = 'false';

      const trueResult = getFromLocalStorage('trueKey');
      const falseResult = getFromLocalStorage('falseKey');

      expect(trueResult).toBe(true);
      expect(falseResult).toBe(false);
    });

    it('should parse number values correctly', () => {
      mockLocalStorage.store.numberKey = '123';
      mockLocalStorage.store.floatKey = '123.45';

      const numberResult = getFromLocalStorage('numberKey');
      const floatResult = getFromLocalStorage('floatKey');

      expect(numberResult).toBe(123);
      expect(floatResult).toBe(123.45);
    });

    it('should handle empty string', () => {
      mockLocalStorage.store.emptyKey = '';
      // Simuler le comportement réel de localStorage.getItem pour une string vide
      mockLocalStorage.getItem.mockReturnValueOnce('');

      const result = getFromLocalStorage('emptyKey');

      expect(result).toBe('');
    });

    it('should handle whitespace string', () => {
      mockLocalStorage.store.whitespaceKey = '   ';

      const result = getFromLocalStorage('whitespaceKey');

      expect(result).toBe('   ');
    });

    it('should handle complex nested object retrieval', () => {
      const complexObject = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        data: [1, 2, { nested: true }]
      };
      mockLocalStorage.store.complexKey = JSON.stringify(complexObject);

      const result = getFromLocalStorage('complexKey');

      expect(result).toEqual(complexObject);
    });
  });

  describe('removeFromLocalStorage', () => {
    it('should remove item from localStorage', () => {
      mockLocalStorage.store.testKey = 'testValue';

      removeFromLocalStorage('testKey');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.store.testKey).toBeUndefined();
    });

    it('should handle removing non-existent key', () => {
      removeFromLocalStorage('nonExistentKey');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('nonExistentKey');
    });

    it('should remove multiple different keys', () => {
      mockLocalStorage.store.key1 = 'value1';
      mockLocalStorage.store.key2 = 'value2';

      removeFromLocalStorage('key1');
      removeFromLocalStorage('key2');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.store.key1).toBeUndefined();
      expect(mockLocalStorage.store.key2).toBeUndefined();
    });
  });

  describe('clearLocalStorage', () => {
    it('should clear all localStorage data', () => {
      mockLocalStorage.store.key1 = 'value1';
      mockLocalStorage.store.key2 = 'value2';
      mockLocalStorage.store.key3 = 'value3';

      clearLocalStorage();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
      expect(mockLocalStorage.store).toEqual({});
    });

    it('should work when localStorage is already empty', () => {
      clearLocalStorage();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
      expect(mockLocalStorage.store).toEqual({});
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: store, retrieve, remove', () => {
      const testData = { name: 'John', preferences: { theme: 'dark' } };

      // Store
      storeInLocalStorage('userKey', testData);
      expect(mockLocalStorage.store.userKey).toBe(JSON.stringify(testData));

      // Retrieve
      const retrieved = getFromLocalStorage('userKey');
      expect(retrieved).toEqual(testData);

      // Remove
      removeFromLocalStorage('userKey');
      expect(mockLocalStorage.store.userKey).toBeUndefined();

      // Try to retrieve after removal
      const afterRemoval = getFromLocalStorage('userKey');
      expect(afterRemoval).toBeNull();
    });

    it('should handle multiple items and clear all', () => {
      storeInLocalStorage('item1', 'value1');
      storeInLocalStorage('item2', { data: 'value2' });
      storeInLocalStorage('item3', [1, 2, 3]);

      expect(Object.keys(mockLocalStorage.store)).toHaveLength(3);

      clearLocalStorage();

      expect(mockLocalStorage.store).toEqual({});
      expect(getFromLocalStorage('item1')).toBeNull();
      expect(getFromLocalStorage('item2')).toBeNull();
      expect(getFromLocalStorage('item3')).toBeNull();
    });

    it('should preserve data types through store/retrieve cycle', () => {
      const testCases = [
        { key: 'string', value: 'hello world' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'object', value: { name: 'test' } },
        { key: 'array', value: [1, 2, 3] },
        { key: 'null', value: null }
      ];

      testCases.forEach(({ key, value }) => {
        storeInLocalStorage(key, value);
        const retrieved = getFromLocalStorage(key);
        expect(retrieved).toEqual(value);
      });
    });
  });
});