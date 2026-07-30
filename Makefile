.PHONY: all up down logs restart 

all: up

# OSに依存せず(Mac/Linux共通)LANのIPアドレスを検出する。
# 外部への疎通は発生しない(UDP connectはカーネルのルーティング解決のみ)。
LAN_IP := $(shell python3 -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)

up:
	LAN_IP=$(LAN_IP) docker compose up -d --build --wait
	@echo ""
	@echo "起動しました。ブラウザで以下にアクセスしてください:"
	@echo "  このPCから:        https://localhost:8443/"
	@if [ -n "$(LAN_IP)" ]; then \
		echo "  他の端末から:      https://$(LAN_IP):8443/"; \
	fi
	@echo ""
	@echo "(自己署名証明書のため、ブラウザの警告は「詳細設定→続行」で許可してください)"
	@echo ""

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

