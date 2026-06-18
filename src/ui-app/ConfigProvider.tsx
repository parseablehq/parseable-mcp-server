import { createContext, useContext, ReactNode } from "react";

interface UiConfig {
  publishableKey: string;
  publicBaseUrl: string;
}

declare global {
  interface Window {
    __PARSEABLE_CONFIG__: UiConfig;
  }
}

const ConfigCtx = createContext<UiConfig>(window.__PARSEABLE_CONFIG__);

export function ConfigProvider({ children }: { children: ReactNode }) {
  return <ConfigCtx.Provider value={window.__PARSEABLE_CONFIG__}>{children}</ConfigCtx.Provider>;
}

export function useConfig(): UiConfig {
  return useContext(ConfigCtx);
}
