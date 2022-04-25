const cheerio = require("cheerio");
const axios = require("axios");
const TelegramApi = require('node-telegram-bot-api')
const fs = require('fs');
const fetch = require('node-fetch');

const Teletoken = '5317921633:AAEEVIJzcZcIfNGgAd4hTiPBu193XYWUDjE'
const bot = new TelegramApi(Teletoken, {polling: true})
let lat = 0;
let lon = 0;


// var url = "https://cleaner.dadata.ru/api/v1/clean/address";
// var token = "94f0af9e9dcfa15c5916f7290cb3d60411fda746";
// var secret = "eeeac76bc69ff972b0be5e59e48d77bfec16b207";

let rawdata = fs.readFileSync('russian-cities.json');
const data = JSON.parse(rawdata);





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

const daysOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'На 3 дня', callback_data: '3'}]
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

async function current_weather_ya(url_in) {
    const response = await axios.get(url_in, {
        headers: {'Accept-Language': 'ru-ru,ru;q=0.5'}
    });

    await console.log(response.status)
    const document = cheerio.load(response.data);
    const current_weather = document(".fact__temp").text()+' \n '+document(".fact__feelings .day-anchor").text()

    return new Promise(resolve => {
        resolve(current_weather);
    });

}

async function current_weather_ya_days(url_in) {
    const response = await axios.get(url_in);
    const document = cheerio.load(response.data);
    const current_weather = document(".fact__temp").text()
    return new Promise(resolve => {
        resolve(current_weather);
    });

}






bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start'){
        await bot.sendMessage(chatId, 'Введи город вручную или выбери из списка. Я расскажу какая там сейчас температура', cityOptions)
    }
    else{

        let result = data.find( ({ name }) => name.toLowerCase() == text.toLowerCase() );
        if(result){
            // console.log(result.coords)
            let lat = result['coordinates'].lat;
            let lon = result['coordinates'].lon;
            let padej = result['cases'].pr;
            let url_ya = 'https://yandex.lv/weather/?lat='+lat+'&lon='+lon;
            current_weather_ya(url_ya).then((msg) => {bot.sendMessage(chatId, 'Cейчас в '+padej+': '+msg)})
        }
        else {
            bot.sendMessage(chatId, 'Такой город не найден')
        }

    }
    // else {
    //     // var query = text;
    //     // var options = {
    //     //     method: "POST",
    //     //     mode: "cors",
    //     //     headers: {
    //     //         "Content-Type": "application/json",
    //     //         "Authorization": "Token " + token,
    //     //         "X-Secret": secret
    //     //     },
    //     //     body: JSON.stringify([query])
    //     // }
    //     // fetch(url, options)
    //     //     .then(res => res.json())
    //     //     .then(json => {
    //     //         var lat = json[0].geo_lat;
    //     //         var lon = json[0].geo_lon;
    //     //         var data = 'https://yandex.lv/weather/?lat='+lat+'&lon='+lon;
    //     //         current_weather_ya(data).then((msg) => {bot.sendMessage(chatId, 'Cейчас: '+msg)});
    //     //         var lat = 0; var lon = 0;
    //     //     })
    // }
})


bot.on('callback_query', async msg=>{
    const data = msg.data;
    let now = new Date();
    console.log(now.getFullYear()+' '+now.getMonth()+' '+now.getDay()+' 00:00+0300')
    const chatId = msg.message.chat.id;
    //return bot.sendMessage(chatId, now.getFullYear()+' '+now.getMonth()+' '+now.getDay()+' 00:00+0300')
         return current_weather_gis(data).then((msg) => {bot.sendMessage(chatId, 'Cейчас: '+msg, cityOptions)})



})
