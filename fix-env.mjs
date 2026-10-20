#!/usr/bin/env node
// Repara el .env del proyecto sin imprimir ni enviar secretos.
// Crea una copia de seguridad del archivo original y no hace llamadas de red.
//
// Uso desde la raíz del proyecto: node fix-env.mjs [ruta/al/.env]

import fs from "node:fs";
import crypto from "node:crypto";
import readline from "node:readline";

const envPath = process.argv[2] || ".env";

if (!fs.existsSync(envPath)) {
  console.error(`No existe ${envPath}. Ejecuta el script desde la raíz del proyecto.`);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: Boolean(process.stdin.isTTY),
});

let muted = false;
const originalWrite = rl._writeToOutput?.bind(rl);
rl._writeToOutput = (text) => {
  if (!muted && originalWrite) originalWrite(text);
};
const inputLines = rl[Symbol.asyncIterator]();

async function ask(question, { hidden = false } = {}) {
  process.stdout.write(question);
  muted = hidden;
  const { value, done } = await inputLines.next();
  muted = false;
  if (hidden) process.stdout.write("\n");
  return done ? "" : String(value).trim();
}

const original = fs.readFileSync(envPath, "utf8");
const eol = original.includes("\r\n") ? "\r\n" : "\n";
let content = original.split(/\r?\n/);

const keyRe = (key) =>
  new RegExp(
    `^\\s*(?:export\\s+)?${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`
  );

function getRaw(key) {
  const line = content.find((entry) => keyRe(key).test(entry));
  return line ? line.slice(line.indexOf("=") + 1).trim() : null;
}

function setVar(key, value) {
  const quoted = `${key}="${value}"`;
  const firstIndex = content.findIndex((entry) => keyRe(key).test(entry));

  if (firstIndex === -1) {
    content.push(quoted);
    return;
  }

  content[firstIndex] = quoted;
  content = content.filter(
    (entry, index) => index === firstIndex || !keyRe(key).test(entry)
  );
}

function removeVar(key) {
  const before = content.length;
  content = content.filter((entry) => !keyRe(key).test(entry));
  return before - content.length;
}

const currentDb = getRaw("DATABASE_URL") || "";
const refMatch = currentDb.match(/postgres\.([a-z0-9]{15,30}):/i);
const hostMatch = currentDb.match(/@([a-z0-9.-]+\.pooler\.supabase\.com):\d+/i);

let projectRef = refMatch?.[1] || "";
let poolerHost = hostMatch?.[1] || "";

console.log("Reparación del .env (no se imprimirá ningún secreto)\n");

if (!projectRef) {
  projectRef = await ask("Project ref (ej. abcdefghijklmnopqrst): ");
}
if (!poolerHost) {
  poolerHost = await ask(
    "Host del pooler (ej. aws-0-us-east-1.pooler.supabase.com): "
  );
}
if (
  !/^[a-z0-9]{15,30}$/i.test(projectRef) ||
  !/^[a-z0-9.-]+\.pooler\.supabase\.com$/i.test(poolerHost)
) {
  console.error("Project ref u host del pooler con formato inválido. No se modificó nada.");
  rl.close();
  process.exit(1);
}
console.log(`Project ref: ${projectRef}`);
console.log(`Host del pooler: ${poolerHost}\n`);

const dbPassword = await ask(
  "Contraseña NUEVA de la base (solo letras y números, 20+ caracteres): ",
  { hidden: true }
);
if (!/^[A-Za-z0-9]{20,}$/.test(dbPassword)) {
  console.error(
    "La contraseña debe tener solo letras y números (sin símbolos ni corchetes) y 20+ caracteres. No se modificó nada."
  );
  rl.close();
  process.exit(1);
}

const adminEmail = (await ask("ADMIN_EMAIL (Enter para dejarlo igual): ")).toLowerCase();
const adminPassword = await ask(
  "ADMIN_PASSWORD nueva, 12+ caracteres (Enter para dejarla igual): ",
  { hidden: true }
);
if (adminPassword && adminPassword.length < 12) {
  console.error("ADMIN_PASSWORD debe tener al menos 12 caracteres. No se modificó nada.");
  rl.close();
  process.exit(1);
}
if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  console.error("ADMIN_EMAIL no parece un correo válido. No se modificó nada.");
  rl.close();
  process.exit(1);
}

const newSecretKey = await ask(
  "SUPABASE_SECRET_KEY nueva (generada en Settings > API Keys; Enter para dejarla igual): ",
  { hidden: true }
);
rl.close();

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `${envPath}.bak-${stamp}`;
fs.writeFileSync(backupPath, original, { mode: 0o600 });

const done = [];

setVar(
  "DATABASE_URL",
  `postgresql://postgres.${projectRef}:${dbPassword}@${poolerHost}:6543/postgres?pgbouncer=true`
);
done.push("DATABASE_URL reescrita (pooler 6543, sin corchetes)");

setVar(
  "DIRECT_URL",
  `postgresql://postgres.${projectRef}:${dbPassword}@${poolerHost}:5432/postgres`
);
done.push("DIRECT_URL reescrita (session pooler 5432, sin corchetes)");

setVar("AUTH_SECRET", crypto.randomBytes(32).toString("base64"));
done.push("AUTH_SECRET regenerado");

if (adminEmail) {
  setVar("ADMIN_EMAIL", adminEmail);
  done.push("ADMIN_EMAIL actualizado");
}
if (adminPassword) {
  setVar("ADMIN_PASSWORD", adminPassword);
  done.push("ADMIN_PASSWORD actualizada");
}
if (newSecretKey) {
  setVar("SUPABASE_SECRET_KEY", newSecretKey);
  if (getRaw("API_KEY_secret") !== null) setVar("API_KEY_secret", newSecretKey);
  done.push("SUPABASE_SECRET_KEY actualizada");
}

let removed = 0;
for (const key of [
  "DIRECT_CONNECTION_STRING",
  "host",
  "port",
  "database",
  "user",
]) {
  removed += removeVar(key);
}
if (removed) done.push(`${removed} línea(s) sobrante(s) eliminada(s)`);

const cleaned = content
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/\n+$/, "")
  .split("\n")
  .join(eol);
fs.writeFileSync(envPath, cleaned + eol, { mode: 0o600 });
try {
  fs.chmodSync(envPath, 0o600);
} catch {
  // El sistema de archivos puede no admitir permisos POSIX.
}

const check = (key) => {
  const raw = getRaw(key);
  if (raw === null) return `${key}: FALTA`;
  const value = raw.replace(/^["']|["']$/g, "");
  if (key.endsWith("_URL") && key.startsWith("D")) {
    try {
      const url = new URL(value);
      const ok =
        url.password === dbPassword &&
        url.username === `postgres.${projectRef}`;
      return `${key}: ${ok ? "OK" : "REVISAR"} (host ${url.hostname}, puerto ${url.port})`;
    } catch {
      return `${key}: URL INVÁLIDA`;
    }
  }
  return `${key}: definida (${value.length} caracteres)`;
};

console.log("\nCambios aplicados:");
for (const item of done) console.log(`  - ${item}`);
console.log("\nVerificación:");
for (const key of [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
]) {
  console.log(`  ${check(key)}`);
}
console.log(`\nCopia de seguridad con los valores anteriores: ${backupPath}`);
console.log("Bórrala cuando confirmes que todo funciona, y borra también este script.");
console.log(
  "Recuerda: reinicia `npm run dev` y restablece la contraseña en Supabase si aún no lo hiciste."
);
