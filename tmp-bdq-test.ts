import { creerBailDeclaratif } from "./src/actions/bail-declaratif.actions";
(async () => {
  try {
    const res = await creerBailDeclaratif("temp-user-id", {
      tenantFullName: "Jean Dupont",
      tenantPhone: "0707070707",
      commune: "Cocody",
      address: "Riviera 3",
      rentAmount: 150000,
      paymentDay: 5,
      startDate: "2023-01-01"
    });
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
})();
