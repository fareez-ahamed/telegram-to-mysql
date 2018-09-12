const fs = require('fs')
const cheerio = require('cheerio')

let path = "C:\\Users\\Fareez\\Downloads\\Telegram Desktop\\ChatExport_11_09_2018"

let $ = cheerio.load(fs.readFileSync(`${path}\\messages.html`))

$(".body").each((i, node) => {

    let bodyNode = $(node)

    let name = bodyNode.find(".from_name").text().trim()
    let dateTime = bodyNode.find(".date").attr("title")

    console.log(`${dateTime} - ${name}`)
})