/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PACKAGE_ID: string;
  readonly VITE_MODULE_NAME: string;
  readonly VITE_FUNCTION_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
