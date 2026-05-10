FROM node:20-alpine AS base
RUN npm install -g pnpm@10.30.3

FROM base AS builder
WORKDIR /app
# Force hoisted node_modules layout so symlinks don't break in Docker
RUN echo "node-linker=hoisted" > .npmrc
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/prisma/package.json packages/prisma/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @vidyaai/shared build
RUN cd apps/web && ../../node_modules/.bin/vite build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
