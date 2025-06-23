export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export function normalizeForComparison(data: any): any {
  if (data === null || data === undefined) return null;

  if (typeof data !== 'object') {
    if (typeof data === 'string') {
      const trimmed = data.trim();
      return trimmed === '' ? null : trimmed;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeForComparison).filter(item => item !== null);
  }

  const normalized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedValue = normalizeForComparison(value);
    if (normalizedValue !== null && normalizedValue !== undefined) {
      normalized[key] = normalizedValue;
    }
  }

  return normalized;
}

export function hasDataChanged(originalData: any, newData: any): boolean {
  const normalizedOriginal = normalizeForComparison(originalData);
  const normalizedNew = normalizeForComparison(newData);

  return !deepEqual(normalizedOriginal, normalizedNew);
}

export function getChangedFields(originalData: any, newData: any): any {
  if (!hasDataChanged(originalData, newData)) return null;

  const normalizedOriginal = normalizeForComparison(originalData);
  const normalizedNew = normalizeForComparison(newData);

  if (typeof normalizedNew !== 'object' || normalizedNew === null) {
    return normalizedNew;
  }

  const changes: any = {};

  for (const [key, newValue] of Object.entries(normalizedNew)) {
    const originalValue = normalizedOriginal?.[key];

    if (!deepEqual(originalValue, newValue)) {
      changes[key] = newValue;
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
