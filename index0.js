const   superagent      = require( 'superagent' );
const   botToken        = '5403849384:AAGWMSWWzu-vPpMoXTohKl0xE_yCBoQXE2E';
let     lastOffset      = 0;

function parseMessage( msg ){
    try {
		    if (msg.message.text=="/dmsweb") {
            const fs = require('fs');
            try {
              const data = fs.readFileSync('/home/ubuntu/lastDMSWeb.txt', 'utf8');
              upperCaseReponse = data;
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/start"){
            upperCaseReponse = "Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.";
        } else {
            upperCaseReponse = "Comando non presente, riprovare";
        }
        superagent.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${msg.message.chat.id}&text=${upperCaseReponse}`).then( response => {});
    } catch( e ){
        console.error( e );
    }
}

function requestUpdate(){
    superagent.get(`https://api.telegram.org/bot${botToken}/getUpdates?limit=1&offset=${lastOffset}`).then( msg => {
            try {
                msg.body.result.map( inputMessage => {
                    lastOffset = inputMessage.update_id +1;
                    parseMessage( inputMessage );
                });
            } catch( e ){
                console.error( e );
            }
            setTimeout( () => {requestUpdate();} , 2000 );
    });
}

requestUpdate();
