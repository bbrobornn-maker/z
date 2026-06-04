import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vaultsTable } from "@workspace/db";
import {
  ListVaultsResponse,
  CreateVaultBody,
  GetVaultParams,
  GetVaultResponse,
  UpdateVaultParams,
  UpdateVaultBody,
  UpdateVaultResponse,
  DeleteVaultParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vaults", async (_req, res): Promise<void> => {
  const vaults = await db.select().from(vaultsTable).orderBy(vaultsTable.createdAt);
  res.json(ListVaultsResponse.parse(vaults));
});

router.post("/vaults", async (req, res): Promise<void> => {
  const parsed = CreateVaultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [vault] = await db.insert(vaultsTable).values(parsed.data).returning();
  res.status(201).json(GetVaultResponse.parse(vault));
});

router.get("/vaults/:vaultId", async (req, res): Promise<void> => {
  const params = GetVaultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vault] = await db
    .select()
    .from(vaultsTable)
    .where(eq(vaultsTable.id, params.data.vaultId));
  if (!vault) {
    res.status(404).json({ error: "Vault not found" });
    return;
  }
  res.json(GetVaultResponse.parse(vault));
});

router.patch("/vaults/:vaultId", async (req, res): Promise<void> => {
  const params = UpdateVaultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateVaultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [vault] = await db
    .update(vaultsTable)
    .set(parsed.data)
    .where(eq(vaultsTable.id, params.data.vaultId))
    .returning();
  if (!vault) {
    res.status(404).json({ error: "Vault not found" });
    return;
  }
  res.json(UpdateVaultResponse.parse(vault));
});

router.delete("/vaults/:vaultId", async (req, res): Promise<void> => {
  const params = DeleteVaultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vault] = await db
    .delete(vaultsTable)
    .where(eq(vaultsTable.id, params.data.vaultId))
    .returning();
  if (!vault) {
    res.status(404).json({ error: "Vault not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
