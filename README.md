## Локальный запуск

1. Перейти в папку backend. Выполнить:
   ./etcd --name infra0 --data-dir infra0 --client-cert-auth --trusted-ca-file=cert_example/etcd-root-ca.pem --cert-file=cert_example/server.pem --key-file=cert_example/server-key.pem --advertise-client-urls https://127.0.0.1:2379 --listen-client-urls https://127.0.0.1:2379

2. Перейти в папку backend. Выполнить **npm i** .Выполнить node .\server.js
3. Перейти в папку frontend. В Выполнить **npm i**. Выполнить npm run dev
4. В форме подключения выбрать сервер для подключения: http://127.0.0.1:2379
