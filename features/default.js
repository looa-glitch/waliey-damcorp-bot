const { NlpManager } = require("node-nlp");
const manager = new NlpManager();
const httpContext = require('express-http-context')
const uuid = require('uuid/v4')
const tm = require('../helper/trackingManager')
const validator = require("email-validator")
const consumers = require("../controllers/consumers.controller")
const sessionChat = require("../controllers/session.controller")

module.exports = (controller) => {
	controller.plugins.cms.before("damcorp", "default", async(convo, bot) => {
		let ce = await check_expired(bot)
		msg_in(bot,bot._config.activity.text,'start_conv')
		if(ce == 'found'){
			convo.gotoThread('menu_utama')
		}
	})
			
	controller.plugins.cms.onChange("damcorp",  "_answ_default", async(response, convo, bot) => {
		let ce = await check_expired(bot)
			msg_in(bot,response,'default')
			if(ce == 'not_found'){
				if(response == 1 || response.toLowerCase() === 'lanjut'){
					convo.gotoThread('ask_name')
				}
			}
	})

	controller.plugins.cms.onChange("damcorp", "_answ_name", async(response, convo, bot) => {
		await convo.setVar('name', response)
		convo.gotoThread('ask_company')
})

controller.plugins.cms.onChange("damcorp", "_answ_company", async(response, convo, bot) => {
	await convo.setVar('company', response)
	convo.gotoThread('ask_email')
})

controller.plugins.cms.onChange("damcorp", "_answ_email", async(response, convo, bot) => {
	if (validator.validate(response)) {
		await convo.setVar('email', response)
		convo.gotoThread('ask_location')
	}
	else {
		convo.gotoThread('ask_email_2')
	}
})

controller.plugins.cms.onChange("damcorp", "_answ_location", async(response, convo, bot) => {
	await convo.setVar('location', response)
	console.log("Name:     ", convo.vars.name)
	console.log("Company:  ", convo.vars.company)
	console.log("Email:    ", convo.vars.email)
	console.log("Location: ", convo.vars.location)
	console.log("Phone:    ", bot._config.activity.from.id)
	await consumers.createUser(
		convo.vars.name, convo.vars.company, 
		convo.vars.email, convo.vars.location,
		bot._config.activity.from.id
	)
	convo.gotoThread('menu_utama')
})

controller.plugins.cms.onChange("damcorp", "_answ_menu_utama", async(response, convo, bot) => {
	console.log("Pilihan menu utama anda: ", response)
})



	function msg_in(bot,msg,tn){
        let now = moment().format()
        let activity = bot._config.activity
        console.log(activity)
        msgin.create({
            wa_id: activity.from.id,
            message: msg,
            thread_name: tn,
            message_type: activity.messageType,
            timestamp: now
        }).catch(err => {

        })
    }
	  
	function check_expired(bot) {
        return new Promise(async (resolve, reject) => {
            sessionChat
            .updateSession(bot._config.activity.from.id)
            .then(async result => {
                console.log(result)
                if(result == null) {
                    sessionChat
                    .createSession(bot._config.activity.from.id)
                    .then(async result => {
                        console.log(result)
                        consumers
                        .getUserByPhone(bot._config.activity.from.id)
                        .then(async consumen => {
                            if(consumen) {
                                resolve('found')
                            }
                            else {
                                resolve('not_found')
                            }
                        })
                    })
                }
                else {
                    consumers
                    .getUserByPhone(bot._config.activity.from.id)
                    .then(async consumen => {
                        if(consumen) {
                            resolve('found')
                        }
                        else {
                            resolve('not_found')
                        }
                    })
                }
            })
        })
    }
}