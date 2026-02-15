declare module "react" {
  export const StrictMode: any;
  export function useEffect(...args: any[]): any;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useState<T>(initial: T): [T, (value: T) => void];
  const React: any;
  export default React;
}

declare module "react-dom/client" {
  export const createRoot: (node: Element) => { render: (node: any) => void };
  const ReactDOM: any;
  export default ReactDOM;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "vite" {
  export const defineConfig: any;
}

declare module "@vitejs/plugin-react" {
  const react: any;
  export default react;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
