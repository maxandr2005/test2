const fs = require('fs');
const TelegramApi = require('node-telegram-bot-api')

const Teletoken = '5317921633:AAEEVIJzcZcIfNGgAd4hTiPBu193XYWUDjE'
const bot = new TelegramApi(Teletoken, {polling: true})



const data1 = fs.readFileSync('data/weather.json',
    {encoding:'utf8', flag:'r'});
obj = JSON.parse(data1);
let now = new Date();


let clients = {
    name: obj.name,
    id_user: obj.id_user,
    time: now

}
let clientsdata = JSON.stringify(clients)
fs.appendFileSync('data/cronclients.json', clientsdata+",");

bot.sendMessage(obj.id_user, 'Подписка оформлена')