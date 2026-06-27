export function formatVariables(input: any) {
  return input.Variables || {
    customerId: input.customerId ?? 0,
    entityId: input.entityId ?? 0,
    branchIds: Array.isArray(input.branchIds)
      ? input.branchIds
      : (input.branchIds !== undefined && input.branchIds !== null ? [Number(input.branchIds)] : []),
    startDate: input.fromDate || "",
    endDate: input.toDate || "",
    groupBy: Array.isArray(input.groupBy)
      ? input.groupBy.map(Number)
      : (input.groupBy !== undefined && input.groupBy !== null ? [Number(input.groupBy)] : [1]),
    Week_Array: input.Week_Array || [],
    Month_Array: input.Month_Array || [],
    Period_Array: input.Period_Array || []
  };
}

export function formatGroupBy(groupByParam: any): string | null {
  if (Array.isArray(groupByParam)) {
    return groupByParam.join(",");
  }
  if (groupByParam !== undefined && groupByParam !== null) {
    return String(groupByParam);
  }
  return null;
}
