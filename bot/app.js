import { Telegraf, Markup } from 'telegraf'

const token = '7511515205:AAGsqrKfGHhqyrpKt5XVQvR0m-ryFd8HhSE'
const webAppUrl = 'https://waynes-app.web.app'

const bot = new Telegraf(token)

bot.command('start', (ctx) => {
    ctx.reply(
        'Hello! Press to start the app', Markup.inlineKeyboard([
            Markup.button.webApp('Waynes App', `${webAppUrl}?ref=${ctx.payload}`
            ),
        ])
    )
})

bot.launch()