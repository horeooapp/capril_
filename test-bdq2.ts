import { prisma } from "./src/lib/prisma";
import { creerBailDeclaratif } from "./src/actions/bail-declaratif.actions";

(async () => {
  const landlord = await prisma.user.findFirst({ where: { role: "LANDLORD" }});
  if (!landlord) {
      console.log("No landlord found");
      return;
  }
  
  console.log("Testing with landlord:", landlord.id);
  try {
    const res = await creerBailDeclaratif(landlord.id, {
      tenantFullName: "Jean Dupont Test",
      tenantPhone: "0755555555",
      commune: "Cocody",
      address: "Riviera 3",
      rentAmount: 150000,
      paymentDay: 5,
      startDate: "2023-01-01"
    });
    console.log("SUCCESS:", res);
  } catch (err: any) {
    console.error("ERROR:", err?.message || err);
  }
})();
