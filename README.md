Предполагается что у вас уже настроена [yc](https://cloud.yandex.ru/docs/cli/quickstart). Это CLI понадобится для скрипта деплоя.

Дальше все просто.
1. Создать файлы `.env.develop` и `.env.production` из шаблона из `.env.template` и заполнить
2. `npm install`
3. `ENV_FILE=.env.develop npm run deploy`
4. Сделайте serverless функцию публичной в найтроках


<b>Форматы изображений, используемых в качестве thumbnails:</b>
- png
- jpg
- jpeg