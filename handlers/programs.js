import { Keyboard } from '@maxhub/max-bot-api';
import { PROGRAMS, PROGRAMS_PER_PAGE } from '../config/programs.js';
import { getAbiturientMenu } from '../keyboards/abiturient.js';

// Функция для получения программ для конкретной страницы
function getProgramsForPage(page) {
  const startIndex = page * PROGRAMS_PER_PAGE;
  const endIndex = startIndex + PROGRAMS_PER_PAGE;
  return PROGRAMS.slice(startIndex, endIndex);
}

// Функция для создания клавиатуры пагинации
function getPaginationKeyboard(page) {
  const totalPages = Math.ceil(PROGRAMS.length / PROGRAMS_PER_PAGE);
  const buttons = [];

  // Кнопки переключения страниц
  const paginationButtons = [];
  
  if (page > 0) {
    paginationButtons.push(Keyboard.button.callback('◀️ Назад', `programs:list:${page - 1}`));
  }
  
  if (page < totalPages - 1) {
    paginationButtons.push(Keyboard.button.callback('Вперед ▶️', `programs:list:${page + 1}`));
  }

  if (paginationButtons.length > 0) {
    buttons.push(paginationButtons);
  }

  // Информация о странице
  buttons.push([Keyboard.button.callback(`📄 Страница ${page + 1} из ${totalPages}`, `programs:info`)]);
  
  // Кнопка возврата
  buttons.push([Keyboard.button.callback('◀️ В главное меню', 'menu:main')]);

  return Keyboard.inlineKeyboard(buttons);
}

export function setupProgramsHandlers(bot) {
  // Список направлений с пагинацией
  bot.action(/programs:list:(\d+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    const programsPage = getProgramsForPage(page);
    const totalPages = Math.ceil(PROGRAMS.length / PROGRAMS_PER_PAGE);

    let message = `**🎓 Направления подготовки (${page + 1}/${totalPages})**\n\n`;

    programsPage.forEach((program, index) => {
      const globalIndex = page * PROGRAMS_PER_PAGE + index + 1;
      message += `${globalIndex}. **${program.name}**\n`;
      message += `   📊 Проходной: ${program.lastYearPassScore} | 🎯 Мест: ${program.places}\n\n`;
    });

    message += `*Выберите направление для подробной информации*`;

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [getProgramsKeyboard(programsPage, page)]
    });
  });

  // Главное меню направлений (первая страница)
  bot.action('programs:list', async (ctx) => {
    const page = 0;
    const programsPage = getProgramsForPage(page);
    const totalPages = Math.ceil(PROGRAMS.length / PROGRAMS_PER_PAGE);

    let message = `**🎓 Направления подготовки ДВФУ (1/${totalPages})**\n\n`;
    message += `*Всего направлений: ${PROGRAMS.length}*\n\n`;

    programsPage.forEach((program, index) => {
      message += `${index + 1}. **${program.name}**\n`;
      message += `   📊 Проходной: ${program.lastYearPassScore} | 🎯 Мест: ${program.places}\n\n`;
    });

    message += `*Выберите направление для подробной информации*`;

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [getProgramsKeyboard(programsPage, page)]
    });
  });

  // Детали направления
  bot.action(/program:detail:(.+)/, async (ctx) => {
    const programId = ctx.match[1];
    const program = PROGRAMS.find(p => p.id === programId);
    
    if (!program) {
      return ctx.reply('Направление не найдено.', {
        attachments: [getAbiturientMenu()]
      });
    }

    const message = `
**${program.name}**

📝 **Описание:**
${program.description}

📊 **Проходной балл прошлого года:** ${program.lastYearPassScore}
👥 **Количество мест:** ${program.places}

📚 **Вступительные испытания:**
${program.exams.map(exam => `• ${exam} (мин. ${program.minScores[exam]} баллов)`).join('\n')}

💡 **Суммарный балл:** ${Object.values(program.minScores).reduce((a, b) => a + b, 0)} (минимум)
🎯 **Рекомендуемый балл:** ${program.lastYearPassScore + 10}+ для уверенного поступления

---
**ℹ️ Что такое проходной балл?**
Проходной балл — это минимальная сумма баллов последнего зачисленного абитуриента на данное направление в прошлом году. Он может меняться каждый год в зависимости от конкурса.

**📢 Актуальные списки:**
Актуальные конкурсные списки можно посмотреть на [официальном сайте ДВФУ](https://www.dvfu.ru/admission/spd/).
    `.trim();

    const keyboard = Keyboard.inlineKeyboard([
      [Keyboard.button.callback('🧮 Проверить шансы', `calculator:program:${program.id}`)],
      [Keyboard.button.link('🌐 Сайт ДВФУ', 'https://www.dvfu.ru/admission/spd/')],
      [Keyboard.button.callback('📋 К списку направлений', 'programs:list')],
      [Keyboard.button.callback('◀️ В главное меню', 'menu:main')]
    ]);

    await ctx.reply(message, {
      format: 'markdown',
      attachments: [keyboard]
    });
  });

  // Информация о пагинации
  bot.action('programs:info', async (ctx) => {
    await ctx.reply(
      `**ℹ️ Информация о направлениях**\n\n` +
      `Всего направлений: **${PROGRAMS.length}**\n` +
      `Отображается по: **${PROGRAMS_PER_PAGE}** на странице\n\n` +
      `Используйте кнопки "Назад" и "Вперед" для навигации между страницами.\n\n` +
      `**📢 Актуальная информация:**\n` +
      `Актуальные конкурсные списки и информация о поступлении доступны на [официальном сайте ДВФУ](https://www.dvfu.ru/admission/spd/).`,
      {
        format: 'markdown'
      }
    );
  });
}

// Функция для создания клавиатуры с программами и пагинацией
function getProgramsKeyboard(programs, currentPage) {
  const buttons = programs.map(program => 
    [Keyboard.button.callback(
      `🎓 ${program.name} (${program.lastYearPassScore})`,
      `program:detail:${program.id}`
    )]
  );

  // Добавляем пагинацию
  const paginationButtons = getPaginationKeyboard(currentPage);
  
  // Объединяем кнопки программ и пагинации
  return Keyboard.inlineKeyboard([
    ...buttons,
    ...paginationButtons.payload.buttons
  ]);
}