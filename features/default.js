const { NlpManager } = require("node-nlp");
const manager = new NlpManager();
const httpContext = require('express-http-context')
const uuid = require('uuid/v4')
const helper = require('../helper/helper')
const tm = require('../helper/trackingManager')
const validator = require("email-validator")
const consumers = require("../controllers/consumers.controller")
const sessionChat = require("../controllers/session.controller")

module.exports = (controller) => {
	controller.plugins.cms.before("damcorp", "default", async(convo, bot) => {
        helper.log("CONVERSATION STARTED",  /* bot._config */);
        let ce = await check_expired(bot)
		msg_in(bot,bot._config.activity.text,'start_conv')
		if(ce == 'found'){
					convo.gotoThread('ask_name')
            }
            else if(ce == 'not_found'){
                convo.gotoThread('menu_utama')
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
    if (bot._config.activity.messageType == 'location') {
        await convo.setVar('latitude', response.split(',')[0])
        await convo.setVar('longitude', response.split(',')[1])
        convo.gotoThread('ask_selfie')
    }
    else {
        convo.gotoThread('ask_location_2')
    }
})


controller.plugins.cms.onChange("damcorp", "_answ_selfie", async(response, convo, bot) => {
    if (bot._config.activity.messageType == 'image') {
        await consumers.createUser(
            convo.vars.name, convo.vars.company, 
            convo.vars.email, convo.vars.latitude,
            convo.vars.longitude, bot._config.activity.from.id
        )
        //convo.gotoThread('menu_utama')
        await helper.api({
            method: "post",
            url: "https://dev-helpdesk.damcorp.id/api/v1",
            data: {
                phone : bot._config.activity.from.id
            }
        })
        .then( async res => {
            const list = res.data.data.list;
            list.forEach((el,i) => {
                list[i] = `${i + 1}. ${el}`;
            })
            let dataList = 'Silahkan pilih kebutuhan Anda:\n\n' + list.join('\n');
            
            convo.setVar('listArr', list);
            convo.setVar('list', dataList);

            await convo.gotoThread('menu_utama');
        })
    }
    else {
        convo.gotoThread('ask_selfie_2')
    }
})


controller.plugins.cms.onChange("damcorp", "_answ_menu_utama", async(response, convo, bot) => {
    switch(response.toLowerCase()) {
        case '1':
        case 'whatsapp':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break
        case '2':
        case 'pawon':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break
        case '3':
        case 'kiosk':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break
        case '4':
        case 'loker':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break
        case '5':
        case 'flo':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break
        case '6':
        case 'digiresto':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break
        case '7':
        case 'gowes':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break
        case '8':
        case 'edc':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break
        case '9':
        case 'CAP':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break;
        case '10':
        case 'Digital HR':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break;
        case '11':
        case 'Mkopi':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break;
        case '12':
        case 'Cloud Kitchen':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break;
        case '13':
        case 'Digital travel':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break;
        case '14':
        case 'Media and Entertainment':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break;
        case '15':
        case 'SMS,Voice,LBA,and IOT':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            );
            //await convo.gotoThread('penutup')
        break;
        case '16':
        case 'Integrated Branch Comunication':
            consumers.setTicket(
                bot._config.activity.from.id,
                convo.vars.listArr[Number(response) - 1]
            ); 
            //await convo.gotoThread('penutup')
        break;
        default:
            await convo.gotoThread('menu_utama')
    }
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