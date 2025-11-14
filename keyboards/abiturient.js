import { Keyboard } from '@maxhub/max-bot-api';

export function getAbiturientMenu() {
  return Keyboard.inlineKeyboard([
    [
      Keyboard.button.callback('📋 Частые вопросы', 'faq:list'),
      Keyboard.button.callback('🎓 Направления', 'programs:list')
    ],
    [
      Keyboard.button.callback('🧮 Калькулятор ЕГЭ', 'calculator:start'),
      Keyboard.button.callback('📅 Дедлайны', 'deadlines:view')
    ],
    [
      Keyboard.button.callback('📄 Документы', 'documents:list'),
      Keyboard.button.callback('📞 Контакты', 'contacts:view')
    ],
    [
      Keyboard.button.link('🌐 Сайт приемной комиссии', 'https://postupi.dvfu.ru/'),
      Keyboard.button.callback('🆘 Помощь', 'help:show')
    ]
  ]);
}