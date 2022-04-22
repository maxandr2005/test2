const cheerio = require("cheerio");
const axios = require("axios");
const TelegramApi = require('node-telegram-bot-api')
const token = '5317921633:AAEEVIJzcZcIfNGgAd4hTiPBu193XYWUDjE'
const bot = new TelegramApi(token, {polling: true})

var url = "https://cleaner.dadata.ru/api/v1/clean/address";
var token1 = "94f0af9e9dcfa15c5916f7290cb3d60411fda746";
var secret = "eeeac76bc69ff972b0be5e59e48d77bfec16b207";
var query = "москва сухонская 11";
var options = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + token1,
        "X-Secret": secret
    },
    body: JSON.stringify([query])
}


const cityOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Москва', callback_data: 'https://www.gismeteo.ru/weather-moscow-4368/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}, {text: 'Санкт-Петербург', callback_data: 'https://www.gismeteo.ru/weather-sankt-peterburg-4079/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'},{text: 'Казань', callback_data: 'https://www.gismeteo.ru/weather-kazan-4364/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}],
            [{text: 'Новосибирск', callback_data: 'https://www.gismeteo.ru/weather-novosibirsk-4690/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}, {text: 'Владивосток', callback_data: 'https://www.gismeteo.ru/weather-vladivostok-4877/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'},{text: 'Сочи', callback_data: 'https://www.gismeteo.ru/weather-sochi-5233/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}],
            [{text: 'Нижний Новгород', callback_data: 'https://www.gismeteo.ru/weather-nizhny-novgorod-4355/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}, {text: 'Красноярск', callback_data: 'https://www.gismeteo.ru/weather-krasnoyarsk-4674/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'},{text: 'Волгоград', callback_data: 'https://www.gismeteo.ru/weather-volgograd-5089/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}],
            [{text: 'Воронеж', callback_data: 'https://www.gismeteo.ru/weather-voronezh-5026/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}, {text: 'Пермь', callback_data: 'https://www.gismeteo.ru/weather-perm-4476/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'}, {text: 'Самара', callback_data: 'https://www.gismeteo.ru/weather-samara-4618/', callback_yandex: 'https://yandex.lv/weather/?lat=51.6&lon=39.2'},],

        ]
    })
}


bot.setMyCommands([
    {command: '/start', description: 'Привет'},
])


async function current_weather_gis(url_in) {
    const response = await axios.get(url_in);
    const document = cheerio.load(response.data);
    const current_weather = document(".weather-value .unit_temperature_c").text()
    return new Promise(resolve => {
            resolve(current_weather);
    });

}




bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start'){
        await bot.sendMessage(chatId, 'Назови город. Я расскажу какая там сейчас температура', cityOptions)
    }
})

bot.on('callback_query', async msg=>{
    console.log(msg)
    const data = msg.data;
    const chatId = msg.message.chat.id;

        return current_weather_gis(data).then((msg) => {bot.sendMessage(chatId, 'Cейчас: '+msg, cityOptions)})



})