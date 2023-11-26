all:
	npm run db:up
	npm install
	cd apps/api && npx prisma generate
	npm run dev

db:
	npm run db:up

dev:
	npm run dev

prisma:
	cd apps/api && npx prisma generate

studio:
	cd apps/api && npx prisma studio

clean:
	npm run db:stop
	npm run db:down

fclean:
	npm run db:stop
	npm run db:down
	docker system prune -a -f

re: fclean all

.PHONY: all db dev prisma studio clean fclean re
