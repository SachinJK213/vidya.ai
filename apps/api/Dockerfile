FROM node:20-alpine AS base
RUN npm install -g pnpm@10.30.3

FROM base AS builder
WORKDIR /app
RUN echo "node-linker=hoisted" > .npmrc
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/prisma/package.json packages/prisma/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @vidyaai/shared build
RUN pnpm --filter @vidyaai/prisma generate
RUN pnpm --filter @vidyaai/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
# Copy root node_modules (external deps)
COPY --from=builder /app/node_modules ./node_modules
# Copy built shared package directly into node_modules so require('@vidyaai/shared') resolves
COPY --from=builder /app/packages/shared/package.json ./node_modules/@vidyaai/shared/package.json
COPY --from=builder /app/packages/shared/dist ./node_modules/@vidyaai/shared/dist
# Copy generated Prisma client and schema
COPY --from=builder /app/packages/prisma ./packages/prisma
# Copy compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4002
CMD ["node", "apps/api/dist/main"]
