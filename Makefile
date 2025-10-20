.PHONY: db-backup db-restore db-list-dumps help

# Detect operating system
UNAME_S := $(shell uname -s 2>/dev/null || echo "Windows")

help:
	@echo "Available commands:"
	@echo "  make db-backup        - Create database backup with current date and time"
	@echo "  make db-restore       - Restore database from dump file (interactive)"
	@echo "  make db-list-dumps    - List all available dump files"
	@echo "  make help             - Show this help message"
	@echo ""
	@echo "Note: Commands work with local PostgreSQL installation"
	@echo "OS: $(UNAME_S)"

db-backup:
ifeq ($(UNAME_S),Linux)
	@bash scripts/backup.sh
else ifeq ($(UNAME_S),Darwin)
	@bash scripts/backup.sh
else
	@scripts\restore.bat
endif

db-restore:
ifeq ($(UNAME_S),Linux)
	@bash scripts/restore.sh
else ifeq ($(UNAME_S),Darwin)
	@bash scripts/restore.sh
else
	@scripts\restore.bat
endif

db-list-dumps:
ifeq ($(UNAME_S),Linux)
	@bash scripts/list-dumps.sh
else ifeq ($(UNAME_S),Darwin)
	@bash scripts/list-dumps.sh
else
	@scripts\restore.bat
endif 