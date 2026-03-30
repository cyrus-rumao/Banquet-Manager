import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { encryptData } from "../utils/encrypt.js";
import { decryptData } from "../utils/encrypt.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateQR = async (req, res) => {
  try {
    const jsonData = req.body;

    if (!jsonData || Object.keys(jsonData).length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    const encrypted = encryptData(jsonData);
    const payload = JSON.stringify(encrypted);

    // temp file
    const fileName = `qr_${Date.now()}.png`;
    const filePath = path.join("qr_codes", fileName);

    if (!fs.existsSync("qr_codes")) {
      fs.mkdirSync("qr_codes");
    }

    // generate QR locally
    await QRCode.toFile(filePath, payload);

    // ✅ upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      folder: "qr_codes",
    });

    const imageUrl = uploadRes.secure_url;

    // 🧹 optional: delete local file
    fs.unlinkSync(filePath);

    // ✅ send WhatsApp image
    await axios.post(
      `https://graph.facebook.com/v22.0/1097291493457964/messages `,
      {
        messaging_product: "whatsapp",
        to: jsonData.phone, // make sure phone exists in request
        type: "image",
        image: {
          link: imageUrl,
          caption: "Your Event QR Code 🎟️",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      message: "QR generated, uploaded, and sent successfully",
      imageUrl,
    });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ message: "Server error" });
  }
};


export const decryptQR = async (req, res) => {
  try {
    const { iv, data } = req.body;

    // Validate input
    if (!iv || !data) {
      return res.status(400).json({
        message: "Invalid payload. 'iv' and 'data' are required",
      });
    }

    // 🔓 Decrypt
    const decrypted = decryptData({ iv, data });

    return res.status(200).json({
      message: "Decryption successful",
      originalData: decrypted,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Decryption failed (invalid data or key)",
    });
  }
};