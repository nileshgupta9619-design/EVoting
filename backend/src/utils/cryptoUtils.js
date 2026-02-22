import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const HASH_ALGO = "sha256";

export const encrypt = (text) => {
  const key = Buffer.from(process.env.VOTE_ENCRYPTION_KEY || "", "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (payload) => {
  const key = Buffer.from(process.env.VOTE_ENCRYPTION_KEY || "", "hex");
  const [ivHex, encrypted] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

export const makeVoterHash = (userId, electionId) => {
  const secret = process.env.VOTER_HASH_SECRET || "vote_secret";
  return crypto
    .createHmac(HASH_ALGO, secret)
    .update(`${userId}:${electionId}`)
    .digest("hex");
};

export const computeChecksum = (data) => {
  return crypto.createHash(HASH_ALGO).update(data).digest("hex");
};
