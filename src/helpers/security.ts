export function validateTenantProtection(input: any): { isValid: boolean; error?: string } {
  // Check entityId
  if (process.env.ALLOWED_ENTITY_IDS) {
    const allowed = process.env.ALLOWED_ENTITY_IDS.split(",").map(id => id.trim());
    if (input.entityId !== undefined && !allowed.includes(String(input.entityId))) {
      return { isValid: false, error: `Unauthorized Entity ID: ${input.entityId}` };
    }
  }

  // Check customerId
  if (process.env.ALLOWED_CUSTOMER_IDS) {
    const allowed = process.env.ALLOWED_CUSTOMER_IDS.split(",").map(id => id.trim());
    if (input.customerId !== undefined && !allowed.includes(String(input.customerId))) {
      return { isValid: false, error: `Unauthorized Customer ID: ${input.customerId}` };
    }
  }

  // Check UserId
  if (process.env.ALLOWED_USER_IDS) {
    const allowed = process.env.ALLOWED_USER_IDS.split(",").map(id => id.trim());
    if (input.UserId !== undefined && !allowed.includes(String(input.UserId))) {
      return { isValid: false, error: `Unauthorized User ID: ${input.UserId}` };
    }
  }

  // Check branchIds
  if (process.env.ALLOWED_BRANCH_IDS) {
    const allowed = process.env.ALLOWED_BRANCH_IDS.split(",").map(id => id.trim());
    if (input.branchIds !== undefined) {
      const branches = Array.isArray(input.branchIds)
        ? input.branchIds.map(String)
        : String(input.branchIds).split(",").map(id => id.trim());

      for (const b of branches) {
        if (!allowed.includes(b)) {
          return { isValid: false, error: `Unauthorized Branch ID: ${b}` };
        }
      }
    }
  }

  return { isValid: true };
}
