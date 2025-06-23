# Оптимизированная архитектура хуков

## 🎯 Цель рефакторинга

Устранение дублирования кода в 15 хуках путем создания централизованной системы с базовой логикой и фабрикой хуков.

## 📊 Результат

| Метрика | До рефакторинга | После рефакторинга |
|---------|-----------------|-------------------|
| Строк кода | ~800+ | ~350 |
| Количество файлов | 17 | 4 базовых + хуки |
| Дублирование | Высокое | Минимальное |
| Поддержка | Сложная | Простая |
| Query хуки | Не оптимизированы | Централизованы |

## 🏗️ Архитектура

### Корневые файлы:
1. **`base-mutation.ts`** - Базовая логика мутаций
2. **`base-query.ts`** - Базовая логика запросов  
3. **`entity-hooks-factory.ts`** - Фабрика хуков
4. **`index.ts`** - Центральный экспорт всех хуков
5. **`README.md`** - Документация

### Структура папок по сущностям:
```
hooks/document/
├── skills/           # Хуки для навыков
│   ├── use-create-skill.ts
│   ├── use-update-skill.ts
│   ├── use-delete-skill.ts
│   └── index.ts
├── education/        # Хуки для образования
│   ├── use-create-education.ts
│   ├── use-delete-education.ts
│   └── index.ts
├── experience/       # Хуки для опыта
│   ├── use-create-experience.ts
│   ├── use-delete-experience.ts
│   └── index.ts
├── project/          # Хуки для проектов
│   ├── use-delete-project.ts
│   └── index.ts
├── language/         # Хуки для языков
│   ├── use-delete-language.ts
│   └── index.ts
└── document/         # Хуки для документов
    ├── use-create-document.ts
    ├── use-delete-document.ts
    ├── use-restore-document.ts
    ├── use-update-document.ts
    ├── use-get-document-by-id.ts
    ├── use-get-documents.ts
    └── index.ts
```

## 🔧 Использование

### Базовый мутационный хук
```typescript
const mutation = useBaseMutation({
  mutationFn: async (data) => { /* API call */ },
  successMessage: "Success!",
  errorMessage: "Error!",
  invalidateQueries: [["documents"]],
});
```

### Базовый query хук
```typescript
const query = useBaseQuery({
  queryKey: ["documents"],
  queryFn: async () => { /* API call */ },
  staleTime: 5 * 60 * 1000, // 5 минут
  retry: 3,
});
```

### Фабрика хуков
```typescript
const skillHooks = createEntityHooks("skill");
const createSkill = skillHooks.useCreate();
const updateSkill = skillHooks.useUpdate();
const deleteSkill = skillHooks.useDelete();
```

### Миграция существующих хуков
До:
```typescript
const mutation = useMutation({
  mutationFn: async (data) => { /* 10+ строк */ },
  onSuccess: () => { /* 5+ строк toast + invalidation */ },
  onError: () => { /* 5+ строк error handling */ },
});
```

После:
```typescript
const mutation = useCreateSkill();
```

## ✅ Преимущества

1. **DRY принцип** - код не повторяется
2. **Единое место изменений** - toast логика в одном месте
3. **Консистентность** - все хуки работают одинаково
4. **Легкость добавления** - новая сущность = 1 строка в конфиге
5. **Типизация** - сохраняется строгая типизация
6. **Тестируемость** - базовую логику можно тестировать отдельно
7. **Организованность** - хуки сгруппированы по сущностям
8. **Модульность** - каждая папка независима

## 🚀 Следующие шаги

1. Мигрировать оставшиеся хуки на новую архитектуру
2. Добавить поддержку оптимистичных обновлений
3. Расширить конфигурацию для сложных кейсов
4. Добавить метрики и логирование 