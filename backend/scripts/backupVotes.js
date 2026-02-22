import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Vote from "../src/models/Vote.js";
import { computeChecksum } from "../src/utils/cryptoUtils.js";

dotenv.config();

const DB = process.env.MONGODB_URI;

const run = async () => {
  try {
    await mongoose.connect(DB);
    const votes = await Vote.find().lean();

    const data = JSON.stringify(votes);
    const checksum = computeChecksum(data + Date.now());

    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

    const fileName = `votes_backup_${Date.now()}.enc`;
    const filePath = path.join(backupsDir, fileName);

    // Simple encrypted storage using env key
    const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY || "", "hex");
    const crypto = await import("crypto");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const payload = iv.toString("hex") + "+" + encrypted + "+" + checksum;
    fs.writeFileSync(filePath, payload, "utf8");

    console.log("Backup created:", filePath);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
