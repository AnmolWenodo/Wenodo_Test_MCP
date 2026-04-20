// import { getDb } from "../clients/db-client";

// export async function getSalesHandler(params: {
//   fromDate: string;
//   toDate: string;
//   customer?: string;
//   entity?: string;
//   branch?: string;
// }) {
//   try {
//     const db = await getDb();

//     const request = db
//       .request()
//       .input("FROM_DATE", params.fromDate)
//       .input("TO_DATE", params.toDate)
//       .input("CUSTOMER", params.customer ?? null)
//       .input("ENTITY", params.entity ?? null)
//       .input("BRANCH", params.branch ?? null);

//     const result = await request.execute("PRC_GET_SALES_FILTERED");

//     return {
//       result: result.recordset,
//       isError: false,
//       error: null,
//     };
//   } catch (err: any) {
//     console.error("DB ERROR:", err);

//     return {
//       result: null,
//       isError: true,
//       error: err.message,
//     };
//   }
// }

export async function getSalesHandler(input: {
  fromDate: string;
  toDate: string;
  customer?: string;
  entity?: string;
  branch?: string;
}) {
  try {
    // 🎯 Dummy dataset
    const data = [
      {
        invoice_no: "INV001",
        invoice_date: "2026-02-01",
        customer_name: "ABC Pvt Ltd",
        entity: "Main",
        branch: "Ahmedabad",
        total_amount: 12000,
      },
      {
        invoice_no: "INV002",
        invoice_date: "2026-02-02",
        customer_name: "XYZ Ltd",
        entity: "Main",
        branch: "Ahmedabad",
        total_amount: 8000,
      },
      {
        invoice_no: "INV003",
        invoice_date: "2026-02-03",
        customer_name: "ABC Pvt Ltd",
        entity: "Retail",
        branch: "Mumbai",
        total_amount: 15000,
      },
    ];

    // 🔥 Apply filters (simulate DB behavior)
    const filtered = data.filter((row) => {
      return (
        row.invoice_date >= input.fromDate &&
        row.invoice_date <= input.toDate &&
        (!input.customer || row.customer_name === input.customer) &&
        (!input.entity || row.entity === input.entity) &&
        (!input.branch || row.branch === input.branch)
      );
    });

    return {
      result: filtered,
      isError: false,
      error: null,
    };
  } catch (err: any) {
    return {
      result: null,
      isError: true,
      error: err.message,
    };
  }
}