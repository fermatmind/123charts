import fs from "node:fs";
import { randomBytes, createHmac } from "node:crypto";
const destination = process.argv[2];
if (!destination || fs.existsSync(destination)) throw Error("Supply a NEW private environment file; existing files are never overwritten.");
const secret = randomBytes(48).toString("hex"), now = Math.floor(Date.now() / 1000);
function token(role) {
  const text = [ { alg: "HS256", typ: "JWT" }, { iss: "supabase", role, iat: now, exp: now + 365 * 86400 } ].map(x => Buffer.from(JSON.stringify(x)).toString("base64url")).join(".");
  return text + "." + createHmac("sha256", secret).update(text).digest("base64url");
}
fs.writeFileSync(destination, `POSTGRES_PASSWORD=${randomBytes(32).toString("hex")}\nJWT_SECRET=${secret}\nANON_KEY=${token("anon")}\nSERVICE_ROLE_KEY=${token("service_role")}\n`, { mode: 0o600, flag: "wx" });
console.log("Unique credentials written to the new private file. Merge with the node template outside Git; rotate keys before JWT expiry.");
