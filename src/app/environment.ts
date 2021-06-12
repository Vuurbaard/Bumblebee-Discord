import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { singleton } from "tsyringe";

@singleton()
export class Environment {
  constructor() {
    const dotEnvPath = fs.existsSync(path.resolve(process.cwd(), "..", ".env"))
      ? path.resolve(process.cwd(), "..", ".env")
      : path.resolve(process.cwd(), ".env");

    dotenv.config({
      path: dotEnvPath,
    });
  }

  public get(name: string, def = ""): string {
    return process.env[name] ?? def;
  }
}
