# Imagem do site (apps/web) para o Cloud Run. Build a partir da raiz do monorepo:
#   docker build -t ratione-web \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... .
# As NEXT_PUBLIC_* são públicas e entram no JavaScript do navegador no build; a chave de serviço
# (SUPABASE_SERVICE_ROLE_KEY) NUNCA entra na imagem: o Cloud Run a injeta do Secret Manager ao rodar.

FROM node:24-slim AS build
WORKDIR /repo
# Mesma versão do pnpm fixada em package.json ("packageManager")
RUN npm install -g pnpm@11.19.0
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/argumenta/package.json packages/argumenta/
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY packages/normaviva/package.json packages/normaviva/
COPY packages/prazozero/package.json packages/prazozero/
COPY packages/tesemap/package.json packages/tesemap/
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8080
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
