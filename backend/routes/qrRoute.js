import express from "express";
import { generateQR , decryptQR } from "../controllers/qrController.js";

const router = express.Router();

router.post("/generate-qr", generateQR);
router.post("/decrypt-qr", decryptQR);

export default router;