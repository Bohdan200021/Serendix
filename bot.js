require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
app.use('/videos', express.static(path.join(__dirname, 'videos')));

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('❌ BOT_TOKEN не знайдено у файлі .env!');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

const VIDEO_EN_URL = './videos/Pro.mp4';
const VIDEO_UK_URL = './videos/Pro.mp4';

let selectedCategory = '';
let selectedLanguage = 'en';
let selectedBudget = '';

// Меню вибору категорій
const categoryMenu = (lang) => ({
  reply_markup: {
    inline_keyboard:
      lang === 'en'
        ? [
            [
              {
                text: '🌐 Web Development',
                callback_data: 'service_web_development',
              },
            ],
            [
              {
                text: '📱 Mobile App Development',
                callback_data: 'service_mobile',
              },
            ],
            [{ text: '🔧 CRM/ERP Solutions', callback_data: 'service_crm' }],
            [
              {
                text: '🎨 Logo Design & Animations',
                callback_data: 'service_logo',
              },
            ],
            [
              {
                text: '🤖 Business Automation Bots',
                callback_data: 'service_bots',
              },
            ],
            [
              {
                text: '🛒 Marketplace Development',
                callback_data: 'service_marketplace',
              },
            ],
            [
              {
                text: '🏗️ Platform Development',
                callback_data: 'service_platform',
              },
            ],
            [
              {
                text: '📂 Personal Portfolio Development',
                callback_data: 'service_portfolio',
              },
            ],
            [{ text: '📩 Contact Us', callback_data: 'contact' }],
          ]
        : [
            [
              {
                text: '🌐 Розробка вебсайтів',
                callback_data: 'service_web_development',
              },
            ],
            [
              {
                text: '📱 Розробка мобільних додатків',
                callback_data: 'service_mobile',
              },
            ],
            [{ text: '🔧 CRM/ERP рішення', callback_data: 'service_crm' }],
            [
              {
                text: '🎨 Дизайн логотипів та анімації',
                callback_data: 'service_logo',
              },
            ],
            [
              {
                text: '🤖 Боти для автоматизації бізнесу',
                callback_data: 'service_bots',
              },
            ],
            [
              {
                text: '🛒 Розробка маркетплейсів',
                callback_data: 'service_marketplace',
              },
            ],
            [
              {
                text: '🏗️ Розробка платформ',
                callback_data: 'service_platform',
              },
            ],
            [
              {
                text: '📂 Розробка персональних портфоліо',
                callback_data: 'service_portfolio',
              },
            ],
            [{ text: "📩 Зв'яжіться з нами", callback_data: 'contact' }],
          ],
  },
});

// Меню вибору бюджету
const budgetMenu = (lang) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: lang === 'en' ? '💵 < $1,000' : '💵 Менше $1,000',
          callback_data: 'budget_low',
        },
      ],
      [
        {
          text: lang === 'en' ? '$1,000 – $5,000' : '$1,000 – $5,000',
          callback_data: 'budget_mid',
        },
      ],
      [
        {
          text: lang === 'en' ? '$5,000 – $10,000' : '$5,000 – $10,000',
          callback_data: 'budget_high',
        },
      ],
      [
        {
          text: lang === 'en' ? '> $10,000' : 'Більше $10,000',
          callback_data: 'budget_premium',
        },
      ],
    ],
  },
});

// Меню вибору мови
const languageMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
      [{ text: '🇺🇦 Українська', callback_data: 'lang_uk' }],
    ],
  },
};

// Старт
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 'Please choose your language:', languageMenu);
});

// Обробка callback'ів
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith('lang_')) {
    selectedLanguage = data === 'lang_en' ? 'en' : 'uk';
    const videoUrl = selectedLanguage === 'en' ? VIDEO_EN_URL : VIDEO_UK_URL;

    await bot.sendMessage(
      chatId,
      `Language selected: ${
        selectedLanguage === 'en' ? 'English' : 'Ukrainian'
      }`
    );
    await bot.sendVideo(chatId, videoUrl);
    await bot.sendMessage(
      chatId,
      selectedLanguage === 'en'
        ? 'Please choose a service category:'
        : 'Оберіть категорію послуги:',
      categoryMenu(selectedLanguage)
    );
  }

  if (data.startsWith('service_')) {
    selectedCategory = data;
    const serviceText = {
      service_web_development:
        selectedLanguage === 'en'
          ? '🌍 Website Development'
          : '🌍 Розробка вебсайтів',
      service_mobile:
        selectedLanguage === 'en'
          ? '📱 Mobile App Development'
          : '📱 Розробка мобільних додатків',
      service_crm:
        selectedLanguage === 'en'
          ? '🔧 CRM/ERP Solutions'
          : '🔧 CRM/ERP рішення',
      service_logo:
        selectedLanguage === 'en'
          ? '🎨 Logo Design & Animations'
          : '🎨 Дизайн логотипів та анімації',
      service_bots:
        selectedLanguage === 'en'
          ? '🤖 Business Automation Bots'
          : '🤖 Боти для автоматизації бізнесу',
      service_marketplace:
        selectedLanguage === 'en'
          ? '🛒 Marketplace Development'
          : '🛒 Розробка маркетплейсів',
      service_platform:
        selectedLanguage === 'en'
          ? '🏗️ Platform Development'
          : '🏗️ Розробка платформ',
      service_portfolio:
        selectedLanguage === 'en'
          ? '📂 Personal Portfolio Development'
          : '📂 Розробка персональних портфоліо',
    }[data];

    await bot.sendMessage(
      chatId,
      `${serviceText}\n\n${
        selectedLanguage === 'en'
          ? 'Please select your development budget:'
          : 'Оберіть бажаний бюджет на розробку:'
      }`,
      budgetMenu(selectedLanguage)
    );
  }

  if (data.startsWith('budget_')) {
    const budgetMap = {
      budget_low: '< $1,000',
      budget_mid: '$1,000 – $5,000',
      budget_high: '$5,000 – $10,000',
      budget_premium: '> $10,000',
    };
    selectedBudget = budgetMap[data];

    const contactPrompt =
      selectedLanguage === 'en'
        ? '📱 Please share your contact number so our manager can reach you:'
        : '📱 Поділіться, будь ласка, номером телефону для звʼязку з менеджером:';

    await bot.sendMessage(chatId, contactPrompt, {
      reply_markup: {
        keyboard: [
          [
            {
              text:
                selectedLanguage === 'en'
                  ? '📞 Share Contact'
                  : '📞 Поділитися контактом',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  if (data === 'contact') {
    await bot.sendMessage(
      chatId,
      selectedLanguage === 'en'
        ? '📩 Contact us:\n✉️ itserendix@gmail.com\n📞 +380956584268'
        : "📩 Зв'яжіться з нами:\n✉️ itserendix@gmail.com\n📞 +380956584268"
    );
  }

  bot.answerCallbackQuery(query.id);
});

// Обробка контакту
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const userPhone = msg.contact.phone_number;
  const userName = msg.contact.first_name;

  await bot.sendMessage(
    chatId,
    `✅ ${
      selectedLanguage === 'en' ? 'Thank you!' : 'Дякуємо!'
    }\n📞 ${userPhone} received.\n📬 Our manager will contact you shortly.`
  );

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'bogdan.bigun2000@gmail.com',
    subject: '🔔 Новий контакт з Telegram бота',
    text: `Ім’я: ${userName}\nКатегорія: ${selectedCategory}\nБюджет: ${selectedBudget}\nТелефон: ${userPhone}\nЧас: ${new Date().toLocaleString()}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
});

console.log('🤖 Bot started!');
