import { defineConfig } from "vite";
import { reportMaker } from "./build/index.ts";

export default defineConfig(reportMaker());
