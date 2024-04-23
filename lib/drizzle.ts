import { load } from "https://deno.land/std@0.223.0/dotenv/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const env = await load();
const DB_URL = env["DATABASE_URL"];

let instance: Client;

export async function getClient() {
  if (instance === undefined) {
    instance = new Client(DB_URL);
  }

  if (!instance.connected) {
    await instance.connect();
  }

  return instance;
}
