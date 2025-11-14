import { Keyboard } from '@maxhub/max-bot-api';
import { FAQ } from '../config/programs.js';
import { getAbiturientMenu } from '../keyboards/abiturient.js';

export function setupFAQHandlers(bot) {
  // Список FAQ
  bot.action('faq:list', async (ctx) => {
    const faqKeyboard = Keyboard.inlineKeyboard([
      ...FAQ.map((item, index) => 
        [Keyboard.button.callback(`❓ ${item.question.substring(0, 30)}`, `faq:detail:${index}`)]
      ),
      [Keyboard.button.callback('◀️ Назад', 'menu:main')]
    ]);

    await ctx.reply('Выберите вопрос:', { 
      attachments: [faqKeyboard] 
    });
  });

  // Детали FAQ
  bot.action(/faq:detail:(\d+)/, async (ctx) => {
    const index = parseInt(ctx.match[1]);
    const item = FAQ[index];
    
    await ctx.reply(`**Вопрос:** ${item.question}\n\n**Ответ:** ${item.answer}`, {
      format: 'markdown',
      attachments: [getAbiturientMenu()]
    });
  });

  // Помощь
  bot.action('help:show', async (ctx) => {
    await ctx.reply(
      `🆘 **Помощь по боту**\n\n` +
      `Используйте кнопки меню для навигации.\n` +
      `Команда /start - перезапустить бота.`,
      {
        format: 'markdown',
        attachments: [getAbiturientMenu()]
      }
    );
  });
}