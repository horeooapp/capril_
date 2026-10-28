import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "dist_package/**",
    "node_modules/**",
    "mobile/**",
    "mobile/dist/**",
    "mobile_apps/**",
    "native_apps/**",
    "tmp/**",
    "scripts/**",
    "next-env.d.ts",
    "test-*.js",
    "test-*.ts",
    "check-*.ts",
    "server.js",
    "prisma/*.js",
    "prisma/*.mjs",
    "openwa-server/**",
    "*.py",
    "*.docx",
  ]),
]);

export default eslintConfig;
