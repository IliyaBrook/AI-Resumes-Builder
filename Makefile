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
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh
else ifeq ($(UNAME_S),Darwin)
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh
else
	@cmd /c scripts\backup.bat
endif

db-restore:
ifeq ($(UNAME_S),Linux)
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh
else ifeq ($(UNAME_S),Darwin)
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh
else
	@cmd /c scripts\restore.bat
endif

db-list-dumps:
ifeq ($(UNAME_S),Linux)
	@chmod +x scripts/list-dumps.sh
	@./scripts/list-dumps.sh
else ifeq ($(UNAME_S),Darwin)
	@chmod +x scripts/list-dumps.sh
	@./scripts/list-dumps.sh
else
	@cmd /c scripts\list-dumps.bat
endif 