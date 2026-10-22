import React from "react";
import type { RenderInput } from "@mokly/mokly";
import { renderToStaticMarkup } from "react-dom/server";

export default function render(input: RenderInput): string {
  return (
    "<!doctype html>" +
    renderToStaticMarkup(
      <html lang="id">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{input.entry.title}</title>
          {input.stylesheets.map((href) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}
          <style>{`
            :root, [data-theme="light"], body[data-theme="light"] {
              --waskita-bg: #F7F4EB;
              --waskita-card: #E9DFCA;
              --waskita-audit-bg: #D4E5F2;
              --waskita-audit-border: rgba(192, 213, 229, 0.9);
              --waskita-accent-subtle: #C0D5E5;
              --waskita-accent-primary: #C0CEE8;
              --waskita-text: #1E293B;
              --waskita-text-body: #334155;
              --waskita-text-muted: rgba(30, 41, 59, 0.68);
              --waskita-text-subtle: rgba(30, 41, 59, 0.54);
              --waskita-border: rgba(30, 41, 59, 0.1);
              --waskita-border-strong: rgba(30, 41, 59, 0.15);
              --waskita-track: rgba(30, 41, 59, 0.12);
              --waskita-surface-white: #FFFFFF;
              --waskita-code-bg: rgba(255, 255, 255, 0.72);
              --waskita-logo-fill: #10B981;

              /* Semantic Status & Chips - Light */
              --waskita-amber-bg: #FEF3C7;
              --waskita-amber-text: #B45309;
              --waskita-amber-body: #92400E;
              --waskita-amber-border: rgba(217, 119, 6, 0.22);

              --waskita-emerald-bg: #D1FAE5;
              --waskita-emerald-text: #065F46;
              --waskita-emerald-accent: #059669;
              --waskita-emerald-border: rgba(16, 185, 129, 0.35);

              --waskita-rose-bg: #FEE2E2;
              --waskita-rose-text: #991B1B;
              --waskita-rose-accent: #DC2626;
              --waskita-rose-border: rgba(220, 38, 38, 0.22);

              /* 4-Color Highlights - Light */
              --waskita-mark-yellow-bg: #FEF08A;
              --waskita-mark-yellow-text: #1E293B;
              --waskita-mark-red-bg: #FECACA;
              --waskita-mark-red-text: #1E293B;
              --waskita-mark-blue-bg: #BFDBFE;
              --waskita-mark-blue-text: #1E293B;
              --waskita-mark-green-bg: #BBF7D0;
              --waskita-mark-green-text: #1E293B;
            }

            [data-theme="dark"], body[data-theme="dark"] {
              --waskita-bg: #0B1120;
              --waskita-card: #1A2436;
              --waskita-audit-bg: #131C2E;
              --waskita-audit-border: rgba(148, 163, 184, 0.16);
              --waskita-accent-subtle: #26354D;
              --waskita-accent-primary: #335C99;
              --waskita-text: #F7F4EB;
              --waskita-text-body: #CBD5E1;
              --waskita-text-muted: #94A3B8;
              --waskita-text-subtle: #78879E;
              --waskita-border: rgba(247, 244, 235, 0.1);
              --waskita-border-strong: rgba(247, 244, 235, 0.16);
              --waskita-track: rgba(247, 244, 235, 0.14);
              --waskita-surface-white: #1A2436;
              --waskita-code-bg: rgba(11, 17, 32, 0.65);
              --waskita-logo-fill: #F7F4EB;

              /* Semantic Status & Chips - Dark (Translucent Tinted Surfaces) */
              --waskita-amber-bg: rgba(245, 158, 11, 0.16);
              --waskita-amber-text: #FCD34D;
              --waskita-amber-body: #FDE68A;
              --waskita-amber-border: rgba(245, 158, 11, 0.35);

              --waskita-emerald-bg: rgba(16, 185, 129, 0.16);
              --waskita-emerald-text: #6EE7B7;
              --waskita-emerald-accent: #34D399;
              --waskita-emerald-border: rgba(16, 185, 129, 0.35);

              --waskita-rose-bg: rgba(239, 68, 68, 0.16);
              --waskita-rose-text: #FCA5A5;
              --waskita-rose-accent: #F87171;
              --waskita-rose-border: rgba(239, 68, 68, 0.35);

              /* 4-Color Highlights - Dark */
              --waskita-mark-yellow-bg: rgba(234, 179, 8, 0.22);
              --waskita-mark-yellow-text: #FEF08A;
              --waskita-mark-red-bg: rgba(239, 68, 68, 0.22);
              --waskita-mark-red-text: #FECACA;
              --waskita-mark-blue-bg: rgba(59, 130, 246, 0.24);
              --waskita-mark-blue-text: #BFDBFE;
              --waskita-mark-green-bg: rgba(16, 185, 129, 0.22);
              --waskita-mark-green-text: #BBF7D0;
            }

            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: var(--waskita-bg);
              color: var(--waskita-text);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            textarea::placeholder, input::placeholder {
              color: var(--waskita-text-subtle);
              opacity: 1;
            }
          `}</style>
        </head>
        <body data-theme={input.colorScheme} data-mokly-viewport={input.viewport}>
          {input.node}
        </body>
      </html>
    )
  );
}
