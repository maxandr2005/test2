const cheerio = require("cheerio");
const axios = require("axios");
const TelegramApi = require('node-telegram-bot-api')
const fs = require('fs');
const fetch = require('node-fetch');

const Teletoken = '5317921633:AAEEVIJzcZcIfNGgAd4hTiPBu193XYWUDjE'
const bot = new TelegramApi(Teletoken, {polling: true})
let lat = 0;
let lon = 0;
let now = new Date();
let nowmonth = 0;
let nowday = 0;


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
            [{text: 'На 3 дня', callback_data: lat}]
        ]
    })
}

const subscribeOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Подписаться', callback_data: 'sub'}]
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
    const document = cheerio.load(response.data);
    const current_weather = new Array();
    current_weather[0] = document(".fact__temp").text()
    current_weather[1] = document(".fact__feelings .link__condition").text();
    let i = 2;
    while(document(".forecast-briefly__day:nth-child("+i+") .forecast-briefly__temp_day .temp__value").text() !== ''){
        current_weather.push(document(".forecast-briefly__day:nth-child("+i+") .forecast-briefly__temp_day .temp__value").text());
        current_weather.push(document(".forecast-briefly__day:nth-child("+i+") .forecast-briefly__temp_night .temp__value").text());
        current_weather.push(document(".forecast-briefly__day:nth-child("+i+") .forecast-briefly__condition").text());
        i++;
    }
    return new Promise(resolve => {
        resolve(current_weather);
    });

}

async function current_weather_ya_days() {
    const response = await axios.get('https://yandex.lv/weather/?lat=51.6&lon=39.2');
    const document = cheerio.load(response.data);
    const current_weather = document("body").text()
    return new Promise(resolve => {
        resolve(current_weather);
    });

}

function now_date(day){
    now_new = new Date(now.getFullYear(), now.getMonth(), now.getDate()+day);
    return now_new
}




bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start'){
        await bot.sendMessage(chatId, 'Введи город вручную или выбери из списка. Я расскажу какая там сейчас температура', cityOptions)
    }
    else{

        let result = data.find( ({ name }) => name == text );
        if(result){
            let lat = result['coordinates'].lat;
            let lon = result['coordinates'].lon;
            let padej = result['cases'].pr;
            let url_ya = 'https://yandex.lv/weather/?lat='+lat+'&lon='+lon;
            current_weather_ya(url_ya).then((mesg) => {
                bot.sendMessage(chatId, 'Cейчас в '+padej+': '+mesg[0]+' '+mesg[1]+'', daysOptions)
                let now = new Date();
                let nowmonth = 0;
                let nowday =0;
                if (now.getMonth() < 9) {
                    nowmonth = '0' + (parseInt(now.getMonth(),10)+1);
                }
                else {
                    nowmonth = parseInt(now.getMonth(),10)+1;
                }
                if (now.getDate() < 10) {
                    nowday = '0' + now.getDate();
                }
                else {
                    nowday = now.getDate()
                }
                let weather = {
                    id_user: chatId,
                    data: {
                        name: text,

                        weather_today_day: mesg[2],
                        weather_today_night: mesg[3],
                        weather_today_type: mesg[4],
                        weather_tomorrow_day: mesg[5],
                        weather_tomorrow_night: mesg[6],
                        weather_tomorrow_type: mesg[7],
                        weather_2_day: mesg[8],
                        weather_2_night: mesg[9],
                        weather_2_type: mesg[10],
                        weather_3_day: mesg[11],
                        weather_3_night: mesg[12],
                        weather_3_type: mesg[13],
                        time: now.getFullYear() + ' ' + nowmonth + ' ' + nowday
                    }
                }
                let weatherdata = JSON.stringify(weather)
                fs.readFile('data/weather.json', 'utf8', function readFileCallback(err, data){
                    if (err){
                        console.log(err);
                    } else {
                        obj = JSON.parse(data);
                        obj.push(weather);
                        json = JSON.stringify(obj);
                        fs.writeFileSync('data/weather.json', json, 'utf8'); // write it back
                    }});

            })
        }
        else {
            bot.sendMessage(chatId, 'Такой город не найден')
        }
    }
})



bot.on('callback_query', async msg=>{
    if(msg.data == 'sub'){
        const cron = require('./cronclients')
    } else {
        const data = msg.data;

        if (now_date(3).getMonth() < 9) {
            nowmonth = '0' + (parseInt(now_date(3).getMonth(), 10) + 1);
        } else {
            nowmonth = parseInt(now_date(3).getMonth(), 10) + 1;
        }

        if (now_date(3).getDate() < 10) {
            nowday = '0' + (now_date(3).getDate());
        } else {
            nowday = now_date(3).getDate()
        }
        const chatId = msg.message.chat.id;
        const data1 = fs.readFileSync('data/weather.json',
            {encoding: 'utf8', flag: 'r'});
        obj = JSON.parse(data1);
        // console.log(obj)
        return bot.sendMessage(chatId, 'Сегодня \n' +
            'днем: ' + obj[obj.length - 1].data.weather_today_day + ' \n'+'ночью: ' + obj[obj.length - 1].data.weather_today_night + ' \n' + obj[obj.length - 1].data.weather_today_type + ' \n \n' +
            'Завтра \nднем: ' + obj[obj.length - 1].data.weather_tomorrow_day + ' \nночью: ' + obj[obj.length - 1].data.weather_tomorrow_night + ' \n' + obj[obj.length - 1].data.weather_today_type + ' \n \n'+
            'Послезавтра \nднем: ' + obj[obj.length - 1].data.weather_2_day + ' \nночью: ' + obj[obj.length - 1].data.weather_2_night + ' \n' + obj[obj.length - 1].data.weather_2_type + ' \n \n' +
            nowday + '.' + nowmonth + '  \nднем: ' + obj[obj.length - 1].data.weather_3_day + '  \n' +'ночью: ' + obj[obj.length - 1].data.weather_3_night + ' \n' + obj[obj.length - 1].data.weather_3_type, subscribeOptions)
    }
})
