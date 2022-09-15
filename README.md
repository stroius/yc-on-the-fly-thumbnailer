Предполагается что у вас уже настроена [yc](https://cloud.yandex.ru/docs/cli/quickstart). Это CLI понадобится для скрипта деплоя.

Дальше все просто.
1. Создать файлы `.env.develop` и `.env.production` из шаблона из `.env.template` и заполнить
1. `npm install`
1. `ENV_FILE=.env.develop npm run deploy`
1. Сделайте serverless функцию публичной в найтроках
