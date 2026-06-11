import "dotenv/config";
import { twentyClient } from "../src/lib/twenty/client";
import { TWENTY_SCHEMA_DEFINITIONS, FieldDefinition } from "../src/lib/twenty/schema";

async function run() {
  console.log("=== STARTING TWENTY CRM SCHEMA PROVISIONING ===");
  console.log(`API URL: ${process.env.TWENTY_API_URL || "http://localhost:3000/api/v1"}`);

  try {
    // 1. Fetch current object metadatas from Twenty CRM
    console.log("Fetching existing objects from Twenty CRM...");
    const metadataResponse = await twentyClient.getObjectMetadatas();
    
    // Twenty metadata API format is typically { data: { objectMetadatas: [...] } } or direct array or { objectMetadatas: [...] }
    let existingObjects: any[] = [];
    if (metadataResponse?.data?.objectMetadatas) {
      existingObjects = metadataResponse.data.objectMetadatas;
    } else if (Array.isArray(metadataResponse)) {
      existingObjects = metadataResponse;
    } else if (metadataResponse?.objectMetadatas) {
      existingObjects = metadataResponse.objectMetadatas;
    } else if (metadataResponse?.data) {
      existingObjects = Array.isArray(metadataResponse.data) ? metadataResponse.data : [];
    }

    console.log(`Found ${existingObjects.length} existing objects in Twenty CRM.`);

    const getObjectByName = (name: string) =>
      existingObjects.find(
        (obj: any) =>
          obj.nameSingular?.toLowerCase() === name.toLowerCase() ||
          obj.namePlural?.toLowerCase() === name.toLowerCase()
      );

    const personObj = getObjectByName("person");
    if (!personObj) {
      throw new Error("Standard 'Person' object not found in Twenty CRM metadata. Please verify your CRM installation.");
    }
    console.log(`Standard object 'Person' found with ID: ${personObj.id}`);

    // Map of object name -> metadata ID (either existing or newly created)
    const objectMetadataIds: Record<string, string> = {
      person: personObj.id,
    };

    // 2. Create Custom Objects and Fields
    for (const [key, definition] of Object.entries(TWENTY_SCHEMA_DEFINITIONS)) {
      console.log(`\n--- Processing Object: ${definition.labelSingular} (${definition.nameSingular}) ---`);
      
      let targetObj = getObjectByName(definition.nameSingular);
      
      if (!targetObj) {
        console.log(`Object '${definition.nameSingular}' does not exist. Creating it...`);
        const newObjRes = await twentyClient.createObjectMetadata({
          nameSingular: definition.nameSingular,
          namePlural: definition.namePlural,
          labelSingular: definition.labelSingular,
          labelPlural: definition.labelPlural,
          description: definition.description,
          icon: definition.icon,
        });
        
        targetObj = newObjRes?.data || newObjRes;
        console.log(`Created custom object '${definition.nameSingular}' with ID: ${targetObj.id}`);
      } else {
        console.log(`Object '${definition.nameSingular}' already exists with ID: ${targetObj.id}`);
      }

      objectMetadataIds[definition.nameSingular] = targetObj.id;

      // Now create or verify fields on this object
      const existingFields = targetObj.fields || [];
      const getFieldByName = (fieldName: string) =>
        existingFields.find((f: any) => f.name?.toLowerCase() === fieldName.toLowerCase());

      for (const field of definition.fields) {
        const existingField = getFieldByName(field.name);
        if (!existingField) {
          console.log(`Creating field '${field.name}' (${field.type}) on '${definition.nameSingular}'...`);
          
          const fieldInput: any = {
            name: field.name,
            type: field.type === "CURRENCY" ? "NUMBER" : field.type, // Map currency to number or custom if supported
            label: field.label,
            description: field.description,
            isNullable: true,
          };

          if (field.type === "SELECT" && field.options) {
            fieldInput.options = field.options.map((opt, idx) => ({
              value: opt,
              label: opt.charAt(0).toUpperCase() + opt.slice(1),
              color: "blue",
              position: idx,
            }));
          }

          await twentyClient.createFieldMetadata(targetObj.id, fieldInput);
          console.log(`Field '${field.name}' created successfully.`);
        } else {
          console.log(`Field '${field.name}' already exists.`);
        }
      }
    }

    // 3. Define and Create Relationships
    console.log("\n=== ESTABLISHING RELATIONSHIPS ===");
    
    // We will define relationships that need to be created.
    // For each relation, we define: [sourceObj, relationType, targetObj, relationName, label]
    const relationsToCreate: Array<{
      source: string;
      type: "ONE_TO_MANY" | "MANY_TO_ONE" | "MANY_TO_MANY" | "ONE_TO_ONE";
      target: string;
      name: string;
      label: string;
    }> = [
      // BienImmobilier relations
      { source: "bienImmobilier", type: "MANY_TO_ONE", target: "person", name: "proprietaire", label: "Propriétaire" },
      { source: "bienImmobilier", type: "MANY_TO_ONE", target: "person", name: "agent", label: "Agent" },

      // Bail relations
      { source: "bail", type: "MANY_TO_ONE", target: "bienImmobilier", name: "bien", label: "Bien Immobilier" },
      { source: "bail", type: "MANY_TO_ONE", target: "person", name: "bailleur", label: "Bailleur" },
      { source: "bail", type: "MANY_TO_ONE", target: "person", name: "locataire", label: "Locataire" },
      { source: "bail", type: "MANY_TO_ONE", target: "person", name: "agent", label: "Agent" },

      // Paiement relations
      { source: "paiement", type: "MANY_TO_ONE", target: "bail", name: "bail", label: "Bail" },
      { source: "paiement", type: "MANY_TO_ONE", target: "person", name: "payeur", label: "Payeur" },

      // Mandat relations
      { source: "mandat", type: "MANY_TO_ONE", target: "bienImmobilier", name: "bien", label: "Bien" },
      { source: "mandat", type: "MANY_TO_ONE", target: "person", name: "agent", label: "Agent" },

      // LitigeMediation relations
      { source: "litigeMediation", type: "MANY_TO_ONE", target: "bail", name: "bail", label: "Bail" },
      { source: "litigeMediation", type: "MANY_TO_ONE", target: "person", name: "partieA", label: "Partie A (Bailleur)" },
      { source: "litigeMediation", type: "MANY_TO_ONE", target: "person", name: "partieB", label: "Partie B (Locataire)" },
    ];

    for (const rel of relationsToCreate) {
      const sourceId = objectMetadataIds[rel.source];
      const targetId = objectMetadataIds[rel.target];

      if (!sourceId || !targetId) {
        console.warn(`Skipping relationship ${rel.source} -> ${rel.target} due to missing metadata ID.`);
        continue;
      }

      // Find the source object in existingObjects to check if the relation field already exists
      const sourceObj = existingObjects.find(
        (obj: any) => obj.id === sourceId
      );
      const existingFields = sourceObj?.fields || [];
      const fieldExists = existingFields.some(
        (f: any) => f.name?.toLowerCase() === rel.name.toLowerCase()
      );

      if (fieldExists) {
        console.log(`Relation field '${rel.name}' already exists on '${rel.source}' (skipped).`);
        continue;
      }

      console.log(`Creating relation: ${rel.source} (${rel.name}) -> ${rel.target}...`);
      
      try {
        const targetFieldName = rel.source + rel.name.charAt(0).toUpperCase() + rel.name.slice(1) + "s";
        const targetFieldLabel = rel.source.charAt(0).toUpperCase() + rel.source.slice(1) + "s (" + rel.label + ")";

        await twentyClient.createFieldMetadata(sourceId, {
          name: rel.name,
          type: "RELATION",
          label: rel.label,
          description: `Relation referencing ${rel.target}`,
          relationCreationPayload: {
            type: rel.type,
            targetObjectMetadataId: targetId,
            targetFieldLabel,
            targetFieldName,
            targetFieldIcon: "IconLink",
          }
        } as any);
        console.log(`Relation ${rel.source} (${rel.name}) -> ${rel.target} created successfully.`);
      } catch (err: any) {
        // If it already exists, handle appropriately
        if (err.message && (err.message.includes("already exists") || err.message.includes("Duplicate"))) {
          console.log(`Relation ${rel.source} -> ${rel.target} already exists (skipped).`);
        } else {
          console.error(`Failed to create relation ${rel.source} -> ${rel.target}:`, err.message);
        }
      }
    }

    console.log("\n=== TWENTY CRM SCHEMA PROVISIONING COMPLETED SUCCESSFULLY ===");
  } catch (error: any) {
    console.error("\n❌ SCHEMA PROVISIONING FAILED:", error.message || error);
    process.exit(1);
  }
}

run();
