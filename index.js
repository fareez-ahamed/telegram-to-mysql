const fs = require('fs')
const cheerio = require('cheerio')
const mysql = require('mysql')
const async = require('async')
const Table = require('cli-table')

let path = "C:\\Users\\Fareez\\Downloads\\Telegram Desktop\\ChatExport_11_09_2018"

let connSettings  = {
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'tele',
  charset  : 'utf8mb4_general_ci'
}

let msgCount = 0;

let fileNames = fs.readdirSync(path).filter(fileName =>  fileName.indexOf(".html") > 0)
/**
 */
async.mapLimit(fileNames, 5, (fileName, callback) => {
    console.log(`Starting ${fileName}`)
    let messages = getMessages(`${path}\\${fileName}`)
    let conn = mysql.createConnection(connSettings)

    conn.query('INSERT INTO messages (`id`, `datetime`, `type`, `from`, `text`) VALUES ?', [messages], (error, results, fields) => {
        if(error) {
            callback({error, fileName, messages})
        }
        msgCount = msgCount + messages.length;
        console.log(`Successfully Inserted - ${fileName} - ${msgCount}`)
        conn.destroy()
        callback(null, fileName)
    })

}, (err, results) => {
    if(err) {
        console.log(err.fileName)
        // displayMessages(err.messages)
        throw err.error
    }
    console.log(`Completed Importing`)
})

/**
 */
function getMessages(filePath) {

    let $ = cheerio.load(fs.readFileSync(filePath))    
    let prevName;

    let messages = [];
    
    $(".message").each((i, node) => {

        if(!$(node).hasClass("default")) {
            return
        }

        let msgNode = $(node)

        let messageId = msgNode.attr("id")
        if(!messageId) {
            return
        }
        let name
        // let name = msgNode.find("from_name")[0].text().trim() || prevName
        // console.log(msgNode.find(".from_name").length)
        if(msgNode.find(".from_name").length === 0)
        {
            name = prevName
        }
        else if(msgNode.find(".from_name").length === 1)
        {
            name = msgNode.find(".from_name").text().trim() || prevName
        }
        else {
            name = $(msgNode.find(".from_name")[0]).text().trim() || prevName
        }
            
        let dateTime = msgNode.find(".date").attr("title")
        let formattedDateTime = `${dateTime.slice(6,10)}-${dateTime.slice(3,5)}-${dateTime.slice(0,2)} ${dateTime.slice(11)}`
        let messageText = msgNode.find(".text").text().trim()
        let mediaNode;
        let messageType = "Text";

        if(msgNode.find(".media")) {
            mediaNode = $(msgNode.find(".media"))
        }
        
        if(mediaNode && mediaNode.hasClass("media_call")) {
            messageType = "Call"
        }
        
        // console.log(`${messageId} - ${formattedDateTime} - ${messageType} - ${name} - ${messageText}`)

        messages.push([
            messageId,
            `${dateTime.slice(6,10)}-${dateTime.slice(3,5)}-${dateTime.slice(0,2)} ${dateTime.slice(11)}`,
            messageType,
            name,
            messageText
        ])

        prevName = name
    
    })

    // console.log(messages)
    
    return messages;
}

function displayMessages(messages) {
    let table = new Table()
    messages.forEach(item => table.push(item))
    console.log(table.toString())
}