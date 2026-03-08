export const matchCondition = (lead, condition) => {
  const { field, operator, value } = condition;

  // Get the actual lead field value
  const leadValue = lead[field];

  // Handle different operators
  if (operator === "equals") {
    // Convert string value to number if comparing numeric fields
    if (typeof leadValue === 'number') {
      return leadValue === Number(value);
    }
    return String(leadValue) === String(value);
  }

  if (operator === "notEquals") {
    if (typeof leadValue === 'number') {
      return leadValue !== Number(value);
    }
    return String(leadValue) !== String(value);
  }

  if (operator === "greaterThan") {
    const numValue = Number(value);
    if (typeof leadValue === 'number') {
      return leadValue > numValue;
    }
    return false;
  }

  if (operator === "lessThan") {
    const numValue = Number(value);
    if (typeof leadValue === 'number') {
      return leadValue < numValue;
    }
    return false;
  }

  if (operator === "greaterThanOrEquals") {
    const numValue = Number(value);
    if (typeof leadValue === 'number') {
      return leadValue >= numValue;
    }
    return false;
  }

  if (operator === "lessThanOrEquals") {
    const numValue = Number(value);
    if (typeof leadValue === 'number') {
      return leadValue <= numValue;
    }
    return false;
  }

  if (operator === "contains") {
    return String(leadValue).toLowerCase().includes(String(value).toLowerCase());
  }

  if (operator === "startsWith") {
    return String(leadValue).toLowerCase().startsWith(String(value).toLowerCase());
  }

  if (operator === "endsWith") {
    return String(leadValue).toLowerCase().endsWith(String(value).toLowerCase());
  }

  if (operator === "greaterThanDays") {
    const now = new Date();
    const diffTime = now - new Date(lead[field]);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays > Number(value);
  }

  return false;
};