.PHONY: all up down logs restart test

all: up

# OSに依存せず(Mac/Linux共通)LANのIPアドレスを検出する。
# 外部への疎通は発生しない(UDP connectはカーネルのルーティング解決のみ)。
LAN_IP := $(shell python3 -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)

# .env のHTTPS_PORTを反映する（未設定時はdocker-compose.ymlのデフォルトと合わせて8443）
HTTPS_PORT := $(shell grep -E '^HTTPS_PORT=' .env 2>/dev/null | tail -1 | cut -d '=' -f2-)
HTTPS_PORT := $(if $(HTTPS_PORT),$(HTTPS_PORT),8443)

up:
	LAN_IP=$(LAN_IP) SHOW_DEV_LOGIN=false docker compose up -d --build --wait
	@echo ""
	@echo "起動しました。ブラウザで以下にアクセスしてください:"
	@echo "  このPCから:        https://localhost:$(HTTPS_PORT)/"
	@if [ -n "$(LAN_IP)" ]; then \
		echo "  他の端末から:      https://$(LAN_IP):$(HTTPS_PORT)/"; \
	fi
	@echo ""
	@echo "(自己署名証明書のため、ブラウザの警告は「詳細設定→続行」で許可してください)"
	@echo ""

test:
	LAN_IP=$(LAN_IP) SHOW_DEV_LOGIN=true docker compose up -d --build --wait
	@echo ""
	@echo "【テストモード (DEVアカウント有効)】で起動しました。ブラウザで以下にアクセスしてください:"
	@echo "  このPCから:        https://localhost:$(HTTPS_PORT)/"
	@if [ -n "$(LAN_IP)" ]; then \
		echo "  他の端末から:      https://$(LAN_IP):$(HTTPS_PORT)/"; \
	fi
	@echo ""
	@echo "(自己署名証明書のため、ブラウザの警告は「詳細設定→続行」で許可してください)"
	@echo ""

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

