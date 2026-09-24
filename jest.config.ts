import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/__tests__/unit/**/*.test.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { tsconfig: { module: "commonjs", moduleResolution: "node" } },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@prisma/client$": "<rootDir>/__tests__/__mocks__/prisma-client.ts",
      },
    },
    {
      displayName: "components",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/components/**/*.test.tsx"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { tsconfig: { jsx: "react-jsx", module: "commonjs", moduleResolution: "node" } },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
    },
  ],
};

export default config;
