require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Product = require('./productModel');
const path = require('path');
const express = require('express');
const app = express();

app.use('/videos', express.static(path.join(__dirname, 'videos')));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
};

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const VIDEO_EN_URL = './videos/Pro.mp4';
const VIDEO_UK_URL = './videos/Pro.mp4';

const categoryMenu = (lang) => {
  const categories =
    lang === 'en'
      ? [
          {
            text: '🌐 Web Development',
            callback_data: 'service_web_development',
          },
          {
            text: '📱 Mobile App Development',
            callback_data: 'service_mobile',
          },
          { text: '🔧 CRM/ERP Solutions', callback_data: 'service_crm' },
          {
            text: '🎨 Logo Design & Animations',
            callback_data: 'service_logo',
          },
          {
            text: '🤖 Business Automation Bots',
            callback_data: 'service_bots',
          },
          {
            text: '🛒 Marketplace Development',
            callback_data: 'service_marketplace',
          },
          {
            text: '🏗️ Platform Development',
            callback_data: 'service_platform',
          },
          {
            text: '📂 Personal Portfolio Development',
            callback_data: 'service_portfolio',
          },
          { text: '📩 Contact Us', callback_data: 'contact' },
        ]
      : [
          {
            text: '🌐 Розробка вебсайтів',
            callback_data: 'service_web_development',
          },
          {
            text: '📱 Розробка мобільних додатків',
            callback_data: 'service_mobile',
          },
          { text: '🔧 CRM/ERP рішення', callback_data: 'service_crm' },
          {
            text: '🎨 Дизайн логотипів та анімації',
            callback_data: 'service_logo',
          },
          {
            text: '🤖 Боти для автоматизації бізнесу',
            callback_data: 'service_bots',
          },
          {
            text: '🛒 Розробка маркетплейсів',
            callback_data: 'service_marketplace',
          },
          { text: '🏗️ Розробка платформ', callback_data: 'service_platform' },
          {
            text: '📂 Розробка персональних портфоліо',
            callback_data: 'service_portfolio',
          },
          { text: "📩 Зв'яжіться з нами", callback_data: 'contact' },
        ];

  return {
    reply_markup: {
      inline_keyboard: categories.map((cat) => [cat]),
    },
  };
};

const languageMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🇬🇧 English', callback_data: 'lang_en' }],
      [{ text: '🇺🇦 Українська', callback_data: 'lang_uk' }],
    ],
  },
};

const budgetMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '💵 Up to 1000$', callback_data: 'budget_1000' }],
      [{ text: '💸 1000$ - 5000$', callback_data: 'budget_5000' }],
      [{ text: '💰 5000$ - 10 000$', callback_data: 'budget_10000' }],
      [{ text: '💎 10 000$+', callback_data: 'budget_more' }],
    ],
  },
};

let selectedCategory = '';
let selectedBudget = '';
let selectedLanguage = 'en';

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendMessage(chatId, 'Please choose your language:', languageMenu);
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
});

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
      'Welcome! Please choose a service category:',
      categoryMenu(selectedLanguage)
    );
  }

  if (data.startsWith('service_')) {
    selectedCategory = data.split('_')[1];
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
      `${serviceText}\n\n💲 Please indicate your budget:`,
      budgetMenu
    );
  }

  if (data.startsWith('budget_')) {
    selectedBudget = data.split('_')[1];
    const budgetText = {
      budget_1000:
        selectedLanguage === 'en'
          ? '💲 Your budget: up to 1000$.'
          : '💲 Ваш бюджет: до 1000$.',
      budget_5000:
        selectedLanguage === 'en'
          ? '💲 Your budget: 1000$ - 5000$.'
          : '💲 Ваш бюджет: 1000$ - 5000$.',
      budget_10000:
        selectedLanguage === 'en'
          ? '💲 Your budget: 5000$ - 10 000$.'
          : '💲 Ваш бюджет: 5000$ - 10 000$.',
      budget_more:
        selectedLanguage === 'en'
          ? '💲 Your budget: 10 000$+.'
          : '💲 Ваш бюджет: 10 000$+.',
    }[data];

    await bot.sendMessage(
      chatId,
      `${budgetText}\n👤 Please provide your name:`
    );
    bot.once('message', async (msg) => {
      const name = msg.text;
      await bot.sendMessage(
        chatId,
        `Thank you, ${name}! ✅ Now please allow us to send your phone number.`
      );

      const phoneKeyboard = {
        reply_markup: {
          one_time_keyboard: true,
          keyboard: [
            [{ text: '📱 Send my phone number', request_contact: true }],
          ],
        },
      };

      await bot.sendMessage(
        chatId,
        'Tap the button to share your number:',
        phoneKeyboard
      );
    });
  }

  if (data === 'contact') {
    await bot.sendMessage(
      chatId,
      selectedLanguage === 'en'
        ? '📩 Contact us:\n✉️ info@serendix.com\n📞 +380123456789'
        : "📩 Зв'яжіться з нами:\n✉️ info@serendix.com\n📞 +380123456789"
    );
  }

  bot.answerCallbackQuery(query.id);
});

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.contact.first_name;
  const userPhone = msg.contact.phone_number;

  try {
    await bot.sendMessage(
      chatId,
      `📱 You shared your phone number: ${userPhone}. Our manager will contact you soon.`
    );
    console.log(`Name: ${userName}, Phone: ${userPhone}`);

    const product = new Product({
      name: userName,
      category: selectedCategory,
      priceRange: selectedBudget,
      phoneNumber: userPhone,
    });

    await product.save();

    const savedProduct = await Product.findOne({ phoneNumber: userPhone });

    if (savedProduct) {
      console.log('📦 Product saved to database!');
      console.log('Product data:', savedProduct);
    } else {
      console.log('❌ Error: Product not saved in database');
    }
  } catch (error) {
    console.error('❌ Error saving data:', error.message);
  }
});

connectDB().then(() => {
  console.log('🤖 Bot started!');
});
