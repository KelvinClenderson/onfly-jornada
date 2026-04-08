// Minimal Deno type declarations for TypeScript language server compatibility.
// The Deno LSP (via the vscode-deno extension) provides full types at runtime.

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };

  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
}
