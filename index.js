/**
 * Librerie e variabili
 */

 //superagent
const   superagent      = require( 'superagent' );
const   botToken        = '5403849384:AAGWMSWWzu-vPpMoXTohKl0xE_yCBoQXE2E';
let     lastOffset      = 0;

//telegrambot
var TelegramBotClient = require('telegram-bot-client');
var client = new TelegramBotClient('5403849384:AAGWMSWWzu-vPpMoXTohKl0xE_yCBoQXE2E');

//zip cartelle
var file_system = require('fs');
var archiver = require('archiver');

//funzione sleep con callback
const sleep = (s) => {
  return new Promise(resolve => setTimeout(resolve, (s*1000)))
}

/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto
 */
function parseMessage( msg ){
    try {
		    if (msg.message.text=="/dmsweb") {
            const fs = require('fs');
            try {
                  data = fs.readFileSync('/home/dms/lastDMSWeb.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
                  data = data2;
                  sendMes(msg.message.chat.id, "DMSWeb WebApp vers: "+data);
                  //file = '/mnt/nastest/Nexus/DMSWEBSperimentali/dmsweb-wa-'+data+'.exe'; //purtroppo il file è troppo grande
                  //client.sendDocument(msg.message.chat.id, file);
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsdoctor"){
            const fs = require('fs');
            try {
                  data = fs.readFileSync('/home/dms/lastDMSWeb.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
                  data = data2;
                  sendMes(msg.message.chat.id,"DMS Doctor vers: "+data+"\nAttendi alcuni secondi, sto preparando il tuo download...");
                  file = '/mnt/nasCons/Nexus/DMSWEBSperimentali/dmsweb-doctor-'+data+'.exe';
                  client.sendDocument(msg.message.chat.id, file);
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsema"){
            const fs = require('fs');
            data2 = "";
            try {
                  data = fs.readFileSync('/home/dms/lastDMSCS.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
            } catch (err) {
              console.error(err);
            }
            directory_dms = '/mnt/nasCons/Nexus/DMSCSSperimentali/DMSEMA/'+data2;
            output_zip = '/home/dms/DMSEMA.zip';
            zipme(directory_dms, output_zip);
            sendMes(msg.message.chat.id,"DMS CS EMA vers: "+data2+" \nAttendi alcuni secondi, sto preparando il tuo download...");
            sleep(10).then(() => {
                client.sendDocument(msg.message.chat.id, output_zip);
            })
        } else if(msg.message.text=="/cristian"){
            sendMes(msg.message.chat.id,"NEXUS, Sono Cristian!");
            client.sendPhoto(msg.message.chat.id, '/mnt/nasPub/zzzz_Lorenzo/segreto.jpg');
        } else if(msg.message.text=="/start"){
            sendMes(msg.message.chat.id,"Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.");
        } else {
            sendMes(msg.message.chat.id,"Comando non presente, riprovare");
        }
    } catch( e ){
        console.error( e );
    }
}

//funzione sendMessaggio personalizzata
function sendMes(msg_id, replyText){
      client.sendMessage(msg_id, replyText);
      /*superagent.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${msg_id}&text=${replyText}`)
        .then( response => {});*/ //primo metodo
}

//funzione che zippa una cartella (da parametrizzare in e out)
function zipme(dir_to_zip, output_name){
      var output = file_system.createWriteStream(output_name);
      var archive = archiver('zip');
      /*output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      archive.on('error', function(err){
        throw err;
      });*/
      archive.pipe(output);
      archive.directory(dir_to_zip, false);
      archive.finalize();
}

//start del programma, attende un messaggio nuovo
function requestUpdate(){
      superagent.get(`https://api.telegram.org/bot${botToken}/getUpdates?limit=1&offset=${lastOffset}`)
        .then( msg => {
            try {
                msg.body.result.map( inputMessage => {
                    // Aggiorniamo l'offset con l'ultimo messaggio ricevuto
                    lastOffset = inputMessage.update_id +1;
                    // Elaboriamo il testo ricevuto
                    parseMessage( inputMessage );
                });
            } catch( e ){
                console.error( e );
            }
            // Programmiamo la lettura dei prossimi message fra 2 secondi
            setTimeout( () => {
                requestUpdate();
            } , 2000 );
        });
}

// Avviamo la prima lettura dei messaggi
requestUpdate();
