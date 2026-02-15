# Glossary API

REST API сервис для управления глоссарием терминов

## Описание проекта 

### Цель сервиса 
Предоставление REST API для хранения и управления словарём терминов с их определениями. Сервис поддерживает полный набор CRUD-операций и автоматически документируется через Swagger/OpenAPI. Предоставление доступа к операциям со словарем при помощи gRPC и протокола Protobuf

### Архитектура
* FastAPI — веб-фреймворк для создания API
* Pydantic — валидация входных и выходных данных
* Uvicorn — ASGI-сервер для запуска приложения
* React - фронтенд фреймворк
* glossary.json - имитация БД

### Структура проекта
```text
.
├── backend/                       # Backend-часть приложения
│   ├── Dockerfile                 # Docker-образ backend
│   ├── data_utils.py              # Вспомогательные функции работы с данными
│   ├── glossary.json              # Данные словаря
│   ├── glossary.proto             # gRPC-схема сервиса
│   ├── glossary_pb2.py            # Сгенерированные gRPC сообщения
│   ├── glossary_pb2_grpc.py       # Сгенерированные gRPC сервисы
│   ├── grpc_server.py             # Реализация gRPC-сервера
│   ├── main.py                    # Точка входа и логика REST API
│   └── requirements.txt           # Зависимости Python
├── docker-compose.yml             # Docker Compose конфигурация
└── frontend/                      # Frontend-часть приложения
    ├── Dockerfile                 # Docker-образ frontend
    ├── README.md                  # Документация frontend
    ├── eslint.config.js           # Конфигурация ESLint
    ├── index.html                 # HTML-шаблон приложения
    ├── nginx.conf                 # Конфигурация Nginx
    ├── package-lock.json          # Зафиксированные зависимости npm
    ├── package.json               # Зависимости и скрипты npm
    ├── public/                    # Публичные статические файлы
    ├── src/                       # Исходный код frontend
    │   ├── App.css                # Стили главного компонента
    │   ├── App.tsx                # Главный React-компонент
    │   ├── api.ts                 # Взаимодействие с backend API
    │   ├── assets/                # Статические ресурсы
    │   ├── components/            # React-компоненты
    │   │   ├── GlossaryGraph.tsx  # Компонент визуализации графа терминов
    │   │   └── TermSidebar.tsx    # Компонент боковой панели терминов
    │   ├── index.css              # Глобальные стили
    │   ├── main.tsx               # Точка входа frontend-приложения
    │   └── types.ts               # Общие TypeScript-типы
    ├── tsconfig.app.json          # Конфигурация TypeScript (приложение)
    ├── tsconfig.json              # Основная конфигурация TypeScript
    ├── tsconfig.node.json         # Конфигурация TypeScript для Node.js
    └── vite.config.ts             # Конфигурация Vite
```

## Инструкция по запуску
Запуск через Докер

**Предварительная подготовка**
* Создать директорию проекта
* В директории проекта создать `frontend/nginx.conf` для мэппинга томов
* В директории проекта создать `backend/glossary.json` для мэппинга томов
* Заполнить созданный файл конфигурации nginx

```text
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
        expires max;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }

    location /api/ {
        proxy_pass http://api:8000;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 50051 http2;
    server_name localhost;

    location / {
        grpc_pass grpc://grpc:50051;
        grpc_set_header Host $host;
        grpc_set_header X-Real-IP $remote_addr;
    }
}
```

* Опционально - наполнить `glossary.json` данными

```json
[
    {
      "id": 1,
      "keyword": "Web Accessibility (A11y)",
      "definition": "Свойство веб-ресурса, гарантирующее, что люди с различными ограниченными возможностями могут воспринимать, понимать, перемещаться и взаимодействовать с ним.",
      "source": "W3C",
      "related_terms": []
    },
    {
      "id": 2,
      "keyword": "WCAG (Web Content Accessibility Guidelines)",
      "definition": "Набор технических стандартов и рекомендаций по обеспечению доступности веб-контента, разработанный Консорциумом Всемирной паутины (W3C).",
      "source": "W3C",
      "related_terms": [
        {
          "term_id": 1,
          "relationship": "Является основным стандартом обеспечения"
        }
      ]
    },
    {
      "id": 3,
      "keyword": "POUR Principles",
      "definition": "Четыре фундаментальных принципа доступности, на которых строится WCAG: Воспринимаемость, Управляемость, Понятность и Надежность.",
      "source": "W3C / WCAG",
      "related_terms": [
        {
          "term_id": 2,
          "relationship": "Лежит в основе структуры"
        }
      ]
    },
    {
      "id": 4,
      "keyword": "Assistive Technology (AT)",
      "definition": "Аппаратное или программное обеспечение, которое помогает людям с ограниченными возможностями взаимодействовать с цифровой средой (например, скринридеры, брайлевские дисплеи).",
      "source": "General",
      "related_terms": [
        {
          "term_id": 1,
          "relationship": "Инструмент реализации доступа в контексте"
        }
      ]
    },
    {
      "id": 5,
      "keyword": "Screen Reader",
      "definition": "Программное обеспечение, которое преобразует текст и элементы интерфейса на экране в речь или тактильный вывод (Брайль).",
      "source": "General",
      "related_terms": [
        {
          "term_id": 4,
          "relationship": "Является разновидностью"
        }
      ]
    },
    {
      "id": 6,
      "keyword": "Semantic HTML",
      "definition": "Использование HTML-тегов в соответствии с их смысловым назначением (например, <button> для кнопок, <nav> для навигации), что позволяет браузерам и AT правильно интерпретировать структуру.",
      "source": "WHATWG",
      "related_terms": [
        {
          "term_id": 5,
          "relationship": "Обеспечивает корректную интерпретацию для"
        }
      ]
    },
    {
      "id": 7,
      "keyword": "WAI-ARIA",
      "definition": "Спецификация, предоставляющая дополнительные атрибуты (роли, свойства, состояния) для улучшения доступности динамического контента и сложных интерфейсов.",
      "source": "W3C",
      "related_terms": [
        {
          "term_id": 6,
          "relationship": "Дополняет и расширяет возможности"
        }
      ]
    },
    {
      "id": 8,
      "keyword": "DOM (Document Object Model)",
      "definition": "Программный интерфейс для HTML-документов, представляющий страницу в виде древовидной структуры, с которой взаимодействуют скрипты и вспомогательные технологии.",
      "source": "W3C",
      "related_terms": [
        {
          "term_id": 4,
          "relationship": "Служит источником информации для"
        }
      ]
    },
    {
      "id": 9,
      "keyword": "Keyboard Interface",
      "definition": "Механизм взаимодействия с веб-страницей исключительно с помощью клавиатуры, без использования мыши или сенсорного экрана.",
      "source": "WCAG",
      "related_terms": [
        {
          "term_id": 3,
          "relationship": "Реализует принцип 'Управляемость' из"
        }
      ]
    },
    {
      "id": 10,
      "keyword": "Focus Indicator",
      "definition": "Визуальный маркер (обычно рамка), показывающий, какой элемент интерфейса в данный момент активен и готов принять ввод с клавиатуры.",
      "source": "WCAG",
      "related_terms": [
        {
          "term_id": 9,
          "relationship": "Обеспечивает визуальную обратную связь для"
        }
      ]
    },
    {
      "id": 11,
      "keyword": "Alt Text (Альтернативный текст)",
      "definition": "Текстовое описание нетекстового контента (изображений), которое отображается, если медиа недоступно, и зачитывается скринридерами.",
      "source": "HTML Spec",
      "related_terms": [
        {
          "term_id": 5,
          "relationship": "Предоставляет контент для"
        }
      ]
    },
    {
      "id": 12,
      "keyword": "Contrast Ratio",
      "definition": "Математическое отношение яркости текста к яркости фона, определяющее читаемость контента для людей с нарушениями зрения.",
      "source": "WCAG",
      "related_terms": [
        {
          "term_id": 3,
          "relationship": "Относится к принципу 'Воспринимаемость' из"
        }
      ]
    },
    {
      "id": 13,
      "keyword": "Accessibility Tree",
      "definition": "Иерархическая структура данных, формируемая браузером на основе DOM, содержащая только информацию, необходимую для вспомогательных технологий.",
      "source": "W3C",
      "related_terms": [
        {
          "term_id": 8,
          "relationship": "Формируется на основе"
        }
      ]
    },
    {
      "id": 14,
      "keyword": "UAAG (User Agent Accessibility Guidelines)",
      "definition": "Рекомендации по обеспечению доступности самих пользовательских агентов (браузеров, медиаплееров) и их взаимодействия с AT.",
      "source": "W3C",
      "related_terms": [
        {
          "term_id": 2,
          "relationship": "Является смежным стандартом с"
        }
      ]
    },
    {
      "id": 15,
      "keyword": "Universal Design",
      "definition": "Подход к проектированию продуктов и среды, делающий их максимально пригодными для использования всеми людьми без необходимости адаптации.",
      "source": "General",
      "related_terms": [
        {
          "term_id": 1,
          "relationship": "Является идеологической основой для"
        }
      ]
    }
  ]
```

* Создать compose файл в корне проекта и выполнить команду запуска

```yml
version: '3.8'

services:
  api:
    image: satsuro/glossary-grpc-backend:latest
    platform: linux/amd64 
    container_name: glossary_rest
    volumes:
      - ./backend/glossary.json:/app/glossary.json
    restart: always

  grpc:
    image: satsuro/glossary-grpc-backend:latest
    platform: linux/amd64 
    container_name: glossary_grpc
    command: python grpc_server.py
    volumes:
      - ./backend/glossary.json:/app/glossary.json
    restart: always

  web:
    image: satsuro/glossary-grpc-frontend:latest
    platform: linux/amd64 
    container_name: glossary_frontend
    ports:
      - "3000:80"
      - "50051:50051"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api
      - grpc
    restart: always

```

```bash
docker compose up -d
```

## REST API Эндпоинты

API находится по адресу http://localhost:3000/api/
Документация API находится по адресу http://localhost:3000/api/docs
Доступ к gRPC по адресу  http://localhost:50051

### Получение списка терминов

```text
GET /api/terms
```

### Получение конкретного термина по идентификатору

```text
GET /api/terms/{term_id}
```

### Получение графа терминов 

```text
GET /api/graph
```

### Создание нового термина 

```text
POST /api/terms
```

Пример запроса:
```bash
curl -X POST "http://localhost:3000/api/terms" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "Screen Reader",
    "definition": "Программа экранного доступа, озвучивающая содержимое экрана.",
    "source": "MDN"
  }'
```
Примечание: поля `source` и `related_terms` являются необязательными.


### Обновление существующего термина

```text
PUT /api/terms/{term_id}
```

Пример запроса 
```bash
curl -X POST "http://localhost:3000/api/terms" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "Screen Reader",
    "definition": "Программа экранного доступа, озвучивающая содержимое экрана.",
    "source": "MDN"
  }'
```
Примечание: при обновлении нужно передавать полный объект `TermBase`, так как PUT-запрос полностью перезаписывает данные по указанному ID. Поля `source` и `related_terms` остаются необязательными, но если их не передать, они примут значения по умолчанию (null и []).

### Удаление термина по идентификатору

```text
DELETE /api/terms/{term_id}
```

## gRPC
Для дальнейшего тестирования (задание 5) была реализована логика 2-х эдпоинтов 

```text
GET /api/terms
```

```text
GET /api/terms/{term_id}
```

### Файл .proto

```text
syntax = "proto3";

// Структура для вложенного объекта related_terms
message TermRelation {
  int32 term_id = 1;
  string relationship = 2;
}

// Основная сущность Термина
message Term {
  int32 id = 1;
  string keyword = 2;
  string definition = 3;
  string source = 4; // Если source null, будет пустая строка
  repeated TermRelation related_terms = 5;
}

// --- Сообщения для запросов и ответов ---

// Пустой запрос (аналог вызова функции без аргументов)
message Empty {}

message TermListResponse {
  repeated Term terms = 1;
}

message GetTermRequest {
  int32 id = 1;
}

message TermResponse {
  Term term = 1;
}

// Набор методов 
service GlossaryService {
  // GET /api/terms
  rpc GetTerms (Empty) returns (TermListResponse);
  
  // GET /api/terms/{id}
  rpc GetTerm (GetTermRequest) returns (TermResponse);
}
```
