"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const node_path_1 = __importDefault(require("node:path"));
exports.default = (0, config_1.defineConfig)({
    resolve: {
        alias: {
            "@": node_path_1.default.resolve(__dirname, "src"),
        },
    },
    test: {
        globals: true,
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary"],
            thresholds: { lines: 70, functions: 70, statements: 70, branches: 60 },
            all: true,
            include: ["src/**/*.ts"],
            exclude: [
                "**/*.test.ts",
                "**/*.spec.ts",
                "src/server.ts",
                "src/plugins/swagger.ts",
                "src/types/**",
            ],
        },
    },
});
