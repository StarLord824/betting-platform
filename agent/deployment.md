21:53:33.419 Running build in Washington, D.C., USA (East) – iad1
21:53:33.420 Build machine configuration: 2 cores, 8 GB
21:53:33.539 Cloning github.com/StarLord824/betting-platform (Branch: master, Commit: b34f682)
21:53:33.540 Previous build caches not available.
21:53:34.106 Cloning completed: 566.000ms
21:53:35.859 Running "vercel build"
21:53:36.449 Vercel CLI 50.22.0
21:53:36.744 Installing dependencies...
21:53:43.213 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
21:53:59.088 
21:53:59.089 added 865 packages in 22s
21:53:59.090 
21:53:59.090 256 packages are looking for funding
21:53:59.090   run `npm fund` for details
21:53:59.138 Detected Next.js version: 16.1.6
21:53:59.148 Running "npm run build"
21:53:59.254 
21:53:59.254 > betting-platform@0.1.0 build
21:53:59.254 > next build
21:53:59.255 
21:54:00.001 Attention: Next.js now collects completely anonymous telemetry regarding usage.
21:54:00.001 This information is used to shape Next.js' roadmap and prioritize features.
21:54:00.001 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
21:54:00.002 https://nextjs.org/telemetry
21:54:00.002 
21:54:00.014 ▲ Next.js 16.1.6 (Turbopack)
21:54:00.014 
21:54:00.022 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
21:54:00.048   Creating an optimized production build ...
21:54:12.102 
21:54:12.103 > Build error occurred
21:54:12.105 Error: Turbopack build failed with 1 errors:
21:54:12.105 ./lib/db/index.ts:1:1
21:54:12.106 Module not found: Can't resolve '../generated/prisma'
21:54:12.106 [0m[31m[1m>[22m[39m[90m 1 |[39m [36mimport[39m { [33mPrismaClient[39m } [36mfrom[39m [32m"../generated/prisma"[39m[33m;[39m
21:54:12.106  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
21:54:12.107  [90m 2 |[39m [36mimport[39m { [33mPool[39m } [36mfrom[39m [32m"pg"[39m[33m;[39m
21:54:12.108  [90m 3 |[39m [36mimport[39m { [33mPrismaPg[39m } [36mfrom[39m [32m"@prisma/adapter-pg"[39m[33m;[39m
21:54:12.108  [90m 4 |[39m[0m
21:54:12.108 
21:54:12.108 
21:54:12.108 
21:54:12.109 Import traces:
21:54:12.109   App Route:
21:54:12.109     ./lib/db/index.ts
21:54:12.109     ./app/api/admin/markets/route.ts
21:54:12.109 
21:54:12.109   Server Component:
21:54:12.110     ./lib/db/index.ts
21:54:12.110     ./app/page.tsx
21:54:12.110 
21:54:12.110 https://nextjs.org/docs/messages/module-not-found
21:54:12.110 
21:54:12.110 
21:54:12.110     at <unknown> (./lib/db/index.ts:1:1)
21:54:12.111     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
21:54:12.154 Error: Command "npm run build" exited with 1