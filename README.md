# Todo Backend (Hono + PostgreSQL + Docker)

Aplikacja backendowa REST API napisana w TypeScript z frameworkiem Hono. Dane przechowywane sa w bazie PostgreSQL uruchamianej w kontenerze. Calosc jest zarzadzana przez Docker Compose, a dane bazy sa zachowywane w nazwanym wolumenie (`postgres_data`).

## Uruchomienie

```bash
docker compose up --build
```

Aplikacja dziala pod adresem: `http://localhost:3000`

Zatrzymanie kontenerow (dane w wolumenie zostaja zachowane):
```bash
docker compose down
```

## Testowanie API (polecenia curl)

1. Dodanie zadania (POST /):
```bash
curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d "{\"title\": \"Zadanie 1\", \"description\": \"Opis zadania\"}"
```

2. Pobranie listy zadan (GET /):
```bash
curl http://localhost:3000/
```

3. Wyszukiwanie i sortowanie po dacie (GET /?q=...&sortBy=...&order=...):
```bash
curl "http://localhost:3000/?q=Zadanie&sortBy=created_at&order=desc"
```

4. Pobranie pojedynczego zadania po ID (GET /:id):
```bash
curl http://localhost:3000/1
```

5. Edycja zadania (PUT /:id):
```bash
curl -X PUT http://localhost:3000/1 -H "Content-Type: application/json" -d "{\"completed\": true}"
```

6. Usuniecie zadania (DELETE /:id):
```bash
curl -X DELETE http://localhost:3000/1
```
