import { z } from "zod";

// ─── Shared catch-all element for groupBy arrays ─────────────────────────────
// Known numeric aliases map to their numeric ID.
// Unknown strings (e.g. "BRANCH_NAME", "SITE") → null, then filtered out below.
// This prevents hard validation crashes when the LLM passes unsupported labels.
const toNullableNumber = (val: string): number | null => {
  const n = Number(val);
  return isNaN(n) ? null : n;
};

export const groupBySchema = z
  .array(
    z.union([
      // ── Known numeric aliases ──────────────────────────────────────────────
      z.union([z.literal(1), z.literal("1"), z.literal("day")]).transform(() => 1),
      z.union([z.literal(2), z.literal("2"), z.literal("hour")]).transform(() => 2),
      z.union([z.literal(3), z.literal("3"), z.literal("session")]).transform(() => 3),
      z.union([z.literal(4), z.literal("4"), z.literal("category")]).transform(() => 4),
      z.union([z.literal(5), z.literal("5"), z.literal("revenue center"), z.literal("revenue_center")]).transform(() => 5),
      z.union([z.literal(6), z.literal("6"), z.literal("product")]).transform(() => 6),
      z.union([z.literal(7), z.literal("7"), z.literal("week")]).transform(() => 7),
      z.union([z.literal(8), z.literal("8"), z.literal("month")]).transform(() => 8),
      z.union([z.literal(9), z.literal("9"), z.literal("quarter")]).transform(() => 9),
      // ── Catch-all: unknown strings (e.g. "BRANCH_NAME", "SITE") → null ────
      // These are NOT valid groupBy dimensions; branch filtering is done via branchIds.
      z.string().transform((val) => toNullableNumber(val)),
      z.number().transform((val) => val),
    ])
  )
  // Strip out nulls produced by the catch-all (unknown labels are silently ignored)
  .transform((arr) => arr.filter((v): v is number => v !== null))
  .default([1])
  .describe(
    "Fields to group by. Can pass numeric IDs, numeric strings, or friendly names:\n" +
    "1 = day\n" +
    "2 = hour\n" +
    "3 = session\n" +
    "4 = category\n" +
    "5 = revenue center\n" +
    "6 = product\n" +
    "7 = week\n" +
    "8 = month\n" +
    "9 = quarter\n" +
    "NOTE: There is no groupBy for Branch/Site — use branchIds parameter for branch filtering.\n" +
    "Example: [1], [\"week\"], [\"7\"], [1,3]"
  );

export const paymentsGroupBySchema = z
  .array(
    z.union([
      z.union([z.literal(1), z.literal("1"), z.literal("day")]).transform(() => 1),
      z.union([z.literal(2), z.literal("2"), z.literal("hour")]).transform(() => 2),
      z.union([z.literal(3), z.literal("3"), z.literal("session")]).transform(() => 3),
      z.union([z.literal(4), z.literal("4"), z.literal("category")]).transform(() => 4),
      z.union([z.literal(5), z.literal("5"), z.literal("revenue center"), z.literal("revenue_center")]).transform(() => 5),
      z.union([z.literal(6), z.literal("6"), z.literal("product")]).transform(() => 6),
      z.union([z.literal(7), z.literal("7"), z.literal("payment method"), z.literal("payment_method")]).transform(() => 7),
      z.union([z.literal(8), z.literal("8"), z.literal("week")]).transform(() => 8),
      z.union([z.literal(9), z.literal("9"), z.literal("month")]).transform(() => 9),
      // ── Catch-all ────────────────────────────────────────────────────────────
      z.string().transform((val) => toNullableNumber(val)),
      z.number().transform((val) => val),
    ])
  )
  .transform((arr) => arr.filter((v): v is number => v !== null))
  .default([1])
  .describe(
    "Fields to group by. Can pass numeric IDs, numeric strings, or friendly names:\n" +
    "1 = day\n" +
    "2 = hour\n" +
    "3 = session\n" +
    "4 = category\n" +
    "5 = revenue center\n" +
    "6 = product\n" +
    "7 = payment method\n" +
    "8 = week\n" +
    "9 = month\n" +
    "NOTE: There is no groupBy for Branch/Site — use branchIds parameter for branch filtering.\n" +
    "Example: [1], [\"week\"], [\"8\"], [1,3]"
  );
