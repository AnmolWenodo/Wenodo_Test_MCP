/**
 * Optimizes a flat array of DB rows into a compact { columns, rows } structure.
 * - Cleans ISO date strings (removes T00:00:00.000Z suffix)
 * - Preserves all fields as-is (no metric merging)
 * - Used by tools that return a single flat recordset
 */
export function optimizeTable(rows: any[]): { columns: string[]; rows: any[][] } {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { columns: [], rows: [] };
  }

  // Collect all unique column names (preserve insertion order from first row)
  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  const cleanedRows = rows.map((row) => {
    return columns.map((col) => {
      const val = row[col];
      if (val instanceof Date) {
        return val.toISOString().substring(0, 10);
      }
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        return val.substring(0, 10);
      }
      return val ?? null;
    });
  });

  return { columns, rows: cleanedRows };
}

export function optimizeSalesSummary(recordsets: any[][]) {
  const mergedMap = new Map<string, any>();
  const metricFields = ["NET", "GROSS", "VOID", "TAX", "DISCOUNT", "COVERS", "TIPS", "SERVICE_CHARGE"];

  // 1. Merge recordsets by composite dimension key
  recordsets.forEach((rs) => {
    if (!Array.isArray(rs)) return;
    rs.forEach((row) => {
      const dimensions: Record<string, any> = {};
      const metrics: Record<string, any> = {};

      Object.entries(row).forEach(([key, val]) => {
        if (metricFields.includes(key)) {
          metrics[key] = val;
        } else {
          dimensions[key] = val;
        }
      });

      // Formulate unique composite key
      const sortedDimKeys = Object.keys(dimensions).sort();
      const compositeKey = sortedDimKeys.map((k) => `${k}:${dimensions[k]}`).join("|");

      if (!mergedMap.has(compositeKey)) {
        const initialRecord: Record<string, any> = { ...dimensions };
        metricFields.forEach((field) => {
          initialRecord[field] = 0;
        });
        mergedMap.set(compositeKey, initialRecord);
      }

      const existing = mergedMap.get(compositeKey);
      Object.entries(metrics).forEach(([k, v]) => {
        existing[k] = v;
      });
    });
  });

  const merged = Array.from(mergedMap.values());
  if (merged.length === 0) {
    return { columns: [], rows: [] };
  }

  // 2. Identify all unique dimension keys present in the merged dataset
  const allKeys = Array.from(new Set(merged.flatMap((row) => Object.keys(row))));
  const dimensionKeys = allKeys.filter((k) => !metricFields.includes(k));

  // 3. Date formatting to save tokens (removes the T00:00:00.000Z suffix)
  const cleanMerged = merged.map((row) => {
    const cleanRow = { ...row };
    allKeys.forEach((k) => {
      const val = cleanRow[k];
      if (val instanceof Date) {
        cleanRow[k] = val.toISOString().substring(0, 10);
      } else if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        cleanRow[k] = val.substring(0, 10);
      }
    });
    return cleanRow;
  });

  // Sort chronologically by start date if it exists
  const sortByDate = dimensionKeys.includes("START_DATE")
    ? "START_DATE"
    : (dimensionKeys.includes("WEEK_START_DATE") ? "WEEK_START_DATE" : null);

  if (sortByDate) {
    cleanMerged.sort((a, b) => {
      const valA = String(a[sortByDate] || "");
      const valB = String(b[sortByDate] || "");
      return valA.localeCompare(valB);
    });
  }

  return {
    columns: [...dimensionKeys, ...metricFields],
    rows: cleanMerged.map((row) => [
      ...dimensionKeys.map((k) => row[k] ?? null),
      ...metricFields.map((k) => row[k] ?? 0),
    ]),
  };
}
