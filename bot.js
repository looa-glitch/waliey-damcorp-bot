//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the botkit-starter-web bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

const cron = require('node-cron');
const sessionChat = require("./controllers/session.controller");
const bs = require("./controllers/botstorage.controller");
const moment = require("moment")

// Load process.env values from .env file
require('dotenv').config();
var config = require('./constant').config
const helper = require('./helper/helper')
let storage = null;
if (config.mongodb) {
    storage = mongoStorage = new MongoDbStorage({
        url : config.mongodb,
        database: 'danone',
        collection: 'botstorage'
    });
    const mongoose = require('mongoose')
    mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
        helper.log("mongodb connected to", config.mongodb)
    })
}

cron.schedule('*/1 * * * *', () => {
    sessionChat
    .getSession()
    .then(async result => {
        result.forEach(async res => {
            let options = {
                method: "post",
                url: config.whatsappApi + "whatsapp/sendText",
                data: {
                    to: ["+", res.waid].join(""),
                    message: `Selamat datang di Damcorp.Demi kenyamanan dan privasi Anda,interaksi di WhatsApp Damcorp ini akan kami akan jadikan referensi informasi data pelanggan kami./n Pilih Lanjut jika anda menyutujui 1. lanjut`,
                    token: config.token,    
                }
            }
            await helper.api(options).then(resp => { })
            .catch(err => { })

            await bs.deleteSession(`webhook/conversations/${res.waid}-${res.waid}/`)
            .then(async resp => { console.log(resp) })

            await bs.deleteSession(`webhook/conversations/[object Object]-${res.waid}-${res.waid}/`)
            .then(async resp => { console.log(resp)})

            await sessionChat.deleteSession(res.waid)
            .then(async resp => { console.log(resp) })

        })
    })
});


// const adapter = new WebAdapter({});
const Whatsapp = require('./adapter/whatsapp')
const adapter = new Whatsapp({});
const httpContext = require('express-http-context')

const controller = new Botkit({
    debug: true,
    webhook_uri: '/api/messages',

    adapter: adapter,
    webserver_middlewares: [ httpContext.middleware ],

    storage
});
if (config.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        cms_uri: config.cms_uri,
        token: config.cms_token,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    helper.log("application start with environment", process.env.NODE_ENV, "and config", JSON.stringify(config))
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});

