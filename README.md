Бот-помощник для абитуриентов университета на платформе MAX. Помогает с вопросами о поступлении, направлениями подготовки, расчетом шансов поступления и напоминаниями о дедлайнах.



Раздел 1. Запуск через Docker

Предварительные требования
    -Установленный Docker
    -BOT_TOKEN для подключения к боту

Шаг1. Клонируйте и перейдите в репозиторий

git clone https://github.com/YanseSlim/max_bot
cd max_bot


Шаг2. Создайте docker image

docker build -t max_bot


Шаг3. Запустите контейнер с передачей токена

docker run -d -e BOT_TOKEN="ЗДЕСЬ ВАН ТОКЕН" --name max_bot max_bot


Шаг4. Проверьте работу 

docker logs max_bot


Раздел 2. Запуск без докера

Предварительные требования
    Node.js 18.18.0 или выше
    npm 9.0.0 или выше
    если у вас нет node.js, см. раздел 3.

Шаг1. Клонируйте и перейдите в репозиторий

git clone https://github.com/YanseSlim/max_bot
cd max_bot


Шаг2. Установите зависимости

npm install

Шаг3. Создайте файл .env в корне проекта и введите туда токен без кавычек

BOT_TOKEN=ваш_токен_тут


Шаг4. Запустите приложение

npm start


раздел 3 установка node.js (если у вас нет)

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

