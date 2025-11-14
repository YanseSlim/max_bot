import { Keyboard } from '@maxhub/max-bot-api';
import { DEADLINES, getUpcomingDeadlines, getDaysUntilDeadline, formatDeadlineDate } from '../config/deadlines.js';
import { getAbiturientMenu } from '../keyboards/abiturient.js';

const subscribers = new Set();

export function setupNotificationsHandlers(bot) {
  // Главное меню дедлайнов
  bot.action('deadlines:view', async (ctx) => {
    const deadlinesKeyboard = Keyboard.inlineKeyboard([
      [
        Keyboard.button.callback('🎓 Бюджетная основа', 'deadlines:budget'),
        Keyboard.button.callback('💳 Платная основа', 'deadlines:paid')
      ],
      [
        Keyboard.button.callback('⏰ Ближайшие дедлайны', 'deadlines:upcoming'),
        Keyboard.button.callback('🔔 Подписаться', 'notifications:subscribe')
      ],
      [
        Keyboard.button.callback('◀️ Назад', 'menu:main')
      ]
    ]);

    const upcoming = getUpcomingDeadlines();
    
    let message = `**📅 Важные даты подачи документов в ДВФУ**\n\n`;
    
    if (upcoming.length > 0) {
      message += `**⏰ Ближайшие дедлайны:**\n`;
      upcoming.forEach(deadline => {
        const emoji = deadline.daysLeft <= 7 ? '🔴' : deadline.daysLeft <= 30 ? '🟡' : '🟢';
        message += `${emoji} **${deadline.formattedDate}** - ${deadline.description.substring(0, 40)}... (осталось ${deadline.daysLeft} дней)\n`;
      });
      message += `\n`;
    }

    message += `Выберите тип обучения для просмотра полного списка дат:`;

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [deadlinesKeyboard]
    });
  });

  // Бюджетная основа
  bot.action('deadlines:budget', async (ctx) => {
    let message = `**${DEADLINES.budget.title}**\n\n`;
    
    DEADLINES.budget.deadlines.forEach(deadline => {
      const daysLeft = getDaysUntilDeadline(deadline);
      const formattedDate = formatDeadlineDate(deadline);
      
      let status = '';
      if (daysLeft !== null) {
        status = daysLeft >= 0 ? ` (осталось ${daysLeft} дней)` : ' (срок прошел)';
      }
      
      message += `📌 **${formattedDate}**${status}\n`;
      message += `${deadline.description}\n\n`;
    });

    message += `**Примечания:**\n`;
    DEADLINES.notes.forEach(note => {
      message += `${note}\n`;
    });

    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.callback('💳 Платная основа', 'deadlines:paid')],
      [Keyboard.button.callback('⏰ Ближайшие дедлайны', 'deadlines:upcoming')],
      [Keyboard.button.callback('◀️ Назад к дедлайнам', 'deadlines:view')]
    ]);

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [keyboard]
    });
  });

  // Платная основа
  bot.action('deadlines:paid', async (ctx) => {
    let message = `**${DEADLINES.paid.title}**\n\n`;
    
    DEADLINES.paid.deadlines.forEach(deadline => {
      const daysLeft = getDaysUntilDeadline(deadline);
      const formattedDate = formatDeadlineDate(deadline);
      
      let status = '';
      if (daysLeft !== null) {
        status = daysLeft >= 0 ? ` (осталось ${daysLeft} дней)` : ' (срок прошел)';
      }
      
      message += `📌 **${formattedDate}**${status}\n`;
      message += `${deadline.description}\n\n`;
    });

    message += `**Примечания:**\n`;
    DEADLINES.notes.forEach(note => {
      message += `${note}\n`;
    });

    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.callback('🎓 Бюджетная основа', 'deadlines:budget')],
      [Keyboard.button.callback('⏰ Ближайшие дедлайны', 'deadlines:upcoming')],
      [Keyboard.button.callback('◀️ Назад к дедлайнам', 'deadlines:view')]
    ]);

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [keyboard]
    });
  });

  // Ближайшие дедлайны
  bot.action('deadlines:upcoming', async (ctx) => {
    const upcoming = getUpcomingDeadlines();
    
    let message = `**⏰ Ближайшие дедлайны ДВФУ**\n\n`;
    
    if (upcoming.length === 0) {
      message += `На данный момент нет активных дедлайнов.`;
    } else {
      upcoming.forEach((deadline, index) => {
        const emoji = deadline.daysLeft <= 7 ? '🔴' : deadline.daysLeft <= 30 ? '🟡' : '🟢';
        const type = deadline.type === 'budget' ? '🎓' : '💳';
        message += `${emoji} **${index + 1}. ${deadline.formattedDate}** (осталось ${deadline.daysLeft} дней)\n`;
        message += `${type} ${deadline.description}\n\n`;
      });
    }

    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.callback('🎓 Бюджетная основа', 'deadlines:budget')],
      [Keyboard.button.callback('💳 Платная основа', 'deadlines:paid')],
      [Keyboard.button.callback('🔔 Подписаться на уведомления', 'notifications:subscribe')],
      [Keyboard.button.callback('◀️ Назад к дедлайнам', 'deadlines:view')]
    ]);

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [keyboard]
    });
  });

  // Подписка на уведомления
  bot.action('notifications:subscribe', async (ctx) => {
    subscribers.add(ctx.user.user_id);
    
    const upcoming = getUpcomingDeadlines();
    let notificationInfo = '';
    
    if (upcoming.length > 0) {
      notificationInfo = `\n\nЯ напомню вам за 7, 3 и 1 день до:\n`;
      upcoming.slice(0, 3).forEach(deadline => {
        notificationInfo += `• ${deadline.formattedDate} - ${deadline.description.substring(0, 30)}...\n`;
      });
    }

    await ctx.reply(
      `✅ Вы подписались на уведомления о дедлайнах${notificationInfo}`,
      {
        attachments: [getAbiturientMenu()]
      }
    );
  });
}

// Функция для отправки уведомлений о приближающихся дедлайнах
export async function sendDeadlineReminders(bot) {
  const upcoming = getUpcomingDeadlines();
  
  for (const deadline of upcoming) {
    // Отправляем напоминания за 7, 3 и 1 день
    if (deadline.daysLeft && [7, 3, 1].includes(deadline.daysLeft)) {
      const message = `⏰ **Напоминание о дедлайнах приемной комиссии!**\n\n` +
        `До **${deadline.formattedDate}** осталось **${deadline.daysLeft} дней**!\n` +
        `**Что нужно сделать:** ${deadline.description}\n\n` +
        `Не забудьте выполнить все необходимые действия вовремя!`;
      
      for (const userId of subscribers) {
        try {
          await bot.api.sendMessageToUser(userId, message, {
            format: 'markdown'
          });
          console.log(`✅ Уведомление отправлено пользователю ${userId} о дедлайне ${deadline.formattedDate}`);
        } catch (error) {
          console.error(`❌ Ошибка отправки уведомления пользователю ${userId}:`, error);
          // Удаляем пользователя из подписок если он заблокировал бота
          if (error.response?.status === 403) {
            subscribers.delete(userId);
          }
        }
      }
    }
  }
}