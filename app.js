import { config } from 'dotenv';
config();

import { Bot } from '@maxhub/max-bot-api';
import schedule from 'node-schedule';

// Импорт обработчиков
import { setupMainHandlers } from './handlers/main.js';
import { setupFAQHandlers } from './handlers/faq.js';
import { setupProgramsHandlers } from './handlers/programs.js';
import { setupCalculatorHandlers } from './handlers/calculator.js';
import { setupNotificationsHandlers, sendDeadlineReminders } from './handlers/notifications.js';

// Проверка наличия токена
if (!process.env.BOT_TOKEN) {
  console.error('Ошибка: BOT_TOKEN не установлен в переменных окружения');
  process.exit(1);
}

console.log('BOT_TOKEN загружен успешно');

// Создание бота
const bot = new Bot(process.env.BOT_TOKEN);

// Middleware для логирования
bot.use(async (ctx, next) => {
  console.log('Входящее сообщение:', {
    type: ctx.update?.update_type,
    text: ctx.message?.body?.text,
    payload: ctx.message?.body?.payload,
    user: ctx.user?.user_id,
    state: ctx.state
  });
  return next();
});

// Настройка обработчиков
try {
  setupCalculatorHandlers(bot);
  setupMainHandlers(bot);
  setupFAQHandlers(bot);
  setupProgramsHandlers(bot);
  setupNotificationsHandlers(bot);
  console.log('Все обработчики успешно настроены');
} catch (error) {
  console.error('Ошибка при настройке обработчиков:', error);
  process.exit(1);
}

// Запуск бота
bot.start().then(() => {
  console.log('Бот для абитуриентов успешно запущен!');
  console.log('Отправьте боту команду /start для отображения меню');
  
  // Настройка ежедневной проверки уведомлений в 10:00
  schedule.scheduleJob('0 10 * * *', () => {
    console.log('🔔 Проверка уведомлений о дедлайнах...');
    sendDeadlineReminders(bot).catch(console.error);
  });
  
}).catch(error => {
  console.error('Ошибка при запуске бота:', error);
  process.exit(1);
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

process.on('SIGINT', () => {
  console.log('Остановка бота...');
  bot.stop().then(() => {
    console.log('Бот успешно остановлен');
    process.exit(0);
  });
});