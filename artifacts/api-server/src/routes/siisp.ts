import { Router, type IRouter } from "express";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

interface SiispPerson {
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  pai: string;
  mae: string;
  naturalidade: string;
  sexo: string;
  foto_url: string;
  foto_base64: string;
  foto_tamanho: number;
}

let cachedData: SiispPerson[] | null = null;
let lastLoad = 0;

function loadSiispData(): SiispPerson[] {
  const now = Date.now();
  if (cachedData && now - lastLoad < 30000) {
    return cachedData;
  }

  const candidates = [
    path.join(process.cwd(), "..", "..", "siisp_dump_completo.json"),
    path.join(process.cwd(), "..", "..", "siisp_dump_parcial.json"),
    path.join(process.cwd(), "siisp_dump_completo.json"),
    path.join(process.cwd(), "siisp_dump_parcial.json"),
  ];

  let allPeople: SiispPerson[] = [];
  const seen = new Set<string>();

  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const raw = fs.readFileSync(filePath, "utf-8");
      const data: SiispPerson[] = JSON.parse(raw);
      for (const p of data) {
        const key = p.cpf || p.nome;
        if (key && !seen.has(key)) {
          seen.add(key);
          allPeople.push(p);
        }
      }
    } catch {
      // ignore
    }
  }

  cachedData = allPeople;
  lastLoad = now;
  return allPeople;
}

router.get("/siisp", (_req, res): void => {
  const people = loadSiispData();
  res.json({
    total: people.length,
    people: people.map((p) => ({
      nome: p.nome,
      cpf: p.cpf,
      rg: p.rg,
      data_nascimento: p.data_nascimento,
      pai: p.pai,
      mae: p.mae,
      naturalidade: p.naturalidade,
      sexo: p.sexo,
      foto_url: p.foto_url,
      foto_base64: p.foto_base64 ? `data:image/png;base64,${p.foto_base64}` : null,
      foto_tamanho: p.foto_tamanho,
    })),
  });
});

export default router;
