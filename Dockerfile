FROM node:22-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/ apps/
COPY packages/ packages/

RUN pnpm install --ignore-scripts && pnpm rebuild @nestjs/core @swc/core msgpackr-extract

ENV NEXT_PUBLIC_API_URL=
RUN pnpm build

FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/ims/api/dist/main.js"]
