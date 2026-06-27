import { getDb } from "../clients/db-client";
import sql from "mssql";
import { formatVariables } from "../helpers/handler-helper";

export async function getEmployeesHandler(input: any) {
  try {
    const db = getDb();
    console.log("Employees Tool Called");
     let branchIds: string | null = null;
     if (input.branchIds !== undefined && input.branchIds !== null) {
      if (Array.isArray(input.branchIds)) {
        // e.g. [1,2,3] → "1,2,3"
        branchIds = input.branchIds.join(",");
      } else {
        // single value → "1"
        branchIds = String(input.branchIds);
      }
    }

     const spCall = await db
      .request()
      .input("PI_ID", null)
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", null)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .input("PI_USER_ID", input.UserId ?? 0)
      .input("PI_TEXTS",input.Text ?? "")
      .input("PI_ACTIVE", 1)
      .input("PI_SP_NAME", "PRC_MCP_GET_EMPLOYEES_DATA")
      .input("PI_VARIABLE", JSON.stringify(formatVariables(input)))
      .output("PO_ID", sql.Int)
      .execute("PRC_INS_UPD_MCP_PROCESS_LOG");

     
      console.log("Logging SP Call Parameters:", spCall.output);

    const result = await db
      .request()
      .input("PI_ENTITY_ID", input.entityId ?? 0)
      .input("PI_BRANCH_ID", branchIds ?? 0)
      .input("PI_CUSTOMER_ID", input.customerId ?? 0)
      .execute("PRC_MCP_GET_EMPLOYEES_DATA");


    return { result: result.recordset ?? [], isError: false, error: null };
  } catch (err: any) {
    return { result: null, isError: true, error: err.message };
  }
}