import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = tseslint.config(
  // Global ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
      "node_modules/**"
    ],
  },
  // Recommended configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Next.js native flat config exports
  ...nextVitals,
  ...nextTs,
  // Custom rules
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": "warn",
      
      // General JS rules
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",

      // Disable or adjust some rules that might be too strict
      "react/no-unescaped-entities": "off"
    },
  },
);

export default eslintConfig;
