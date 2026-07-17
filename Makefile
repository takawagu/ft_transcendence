.PHONY: up down logs restart

up:
	docker compose up -d --build
	@echo ""
	@echo "起動しました。ブラウザで以下にアクセスしてください:"
	@echo "  このPCから:        https://localhost/"
	@for ip in $$(hostname -I 2>/dev/null); do \
		echo "  他の端末から(候補): https://$$ip/"; \
	done
	@echo ""
	@echo "(自己署名証明書のため、ブラウザの警告は「詳細設定→続行」で許可してください)"
	@echo ""

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f
