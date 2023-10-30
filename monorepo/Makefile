all:
	@npm run db:up
	@npm run dev

db:
	@npm run db:up

dev:
	@npm run dev

prisma:
	@cd apps/api && npx prisma generate

studio:
	@cd apps/api && npx prisma studio

clean:
	@npm run db:stop
	@npm run db:down
