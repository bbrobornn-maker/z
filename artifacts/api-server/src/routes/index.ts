import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vaultsRouter from "./vaults";
import notesRouter from "./notes";
import graphRouter from "./graph";
import searchRouter from "./search";
import seedRouter from "./seed";
import siispRouter from "./siisp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vaultsRouter);
router.use(notesRouter);
router.use(graphRouter);
router.use(searchRouter);
router.use(seedRouter);
router.use(siispRouter);

export default router;
