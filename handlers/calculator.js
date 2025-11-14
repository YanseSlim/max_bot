import { PROGRAMS } from '../config/programs.js';
import { getAbiturientMenu } from '../keyboards/abiturient.js';

export function parseScores(text) {
  const scores = {};
  const regex = /([а-яё]+)\s+(\d+)/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const subject = match[1].trim();
    const score = parseInt(match[2]);
    scores[subject] = score;
  }
  
  return scores;
}

export function setupCalculatorHandlers(bot) {
  // Старт калькулятора
  bot.action('calculator:start', async (ctx) => {
    const allSubjects = [...new Set(PROGRAMS.flatMap(p => p.exams))];
    
    await ctx.reply(
      `🧮 **Калькулятор ЕГЭ**\n\n` +
      `Введите ваши баллы в формате:\n` +
      `"математика 85 русский 90 информатика 78"\n\n` +
      `Доступные предметы: ${allSubjects.join(', ')}`,
      { 
        format: 'markdown',
        attachments: [getAbiturientMenu()]
      }
    );
  });

  // Обработка ввода баллов
  bot.hears(/([а-яё]+)\s+(\d+)/gi, async (ctx) => {
    console.log('Обработчик калькулятора сработал!');
    const text = ctx.message.body.text.toLowerCase();
    const scores = parseScores(text);
    console.log('Распарсенные баллы:', scores); 

    if (Object.keys(scores).length === 0) return;
    
    // Расчет доступных направлений
    const availablePrograms = PROGRAMS.filter(program => {
      for (const exam of program.exams) {
        if (!scores[exam] || scores[exam] < program.minScores[exam]) {
          return false;
        }
      }
      const totalScore = program.exams.reduce((sum, exam) => sum + scores[exam], 0);
      return totalScore >= program.lastYearPassScore - 10;
    });
    
    let response = `**Ваши баллы:**\n`;
    Object.entries(scores).forEach(([subject, score]) => {
      response += `• ${subject}: ${score}\n`;
    });
    
    if (availablePrograms.length > 0) {
      response += `\n🎯 **Доступные направления:**\n`;
      availablePrograms.forEach(program => {
        const totalScore = program.exams.reduce((sum, exam) => sum + scores[exam], 0);
        response += `• ${program.name} (у вас ${totalScore}, нужно ${program.lastYearPassScore})\n`;
      });
    } else {
      response += `\n❌ С текущими баллами поступление маловероятно`;
    }

    
    response += `\n---\n`;
    response += `**ℹ️ Помните:** Проходной балл прошлого года - минимальный балл человека, который прошел на данное направление.`;
    response += `Актуальные конкурсные списки смотрите на [сайте ДВФУ](https://www.dvfu.ru/admission/spd/).`;

    
    await ctx.reply(response, {
      format: 'markdown',
      attachments: [getAbiturientMenu()]
    });
  });
}