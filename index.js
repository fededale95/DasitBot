/**
 * Importiamo superagent, libreria che ci permette di effettuare
 * richieste HTTP
 */
const   superagent      = require( 'superagent' );

/**
 * Memorizziamo in token restuito dal BotFather
 */
const   botToken        = '5403849384:AAGWMSWWzu-vPpMoXTohKl0xE_yCBoQXE2E';

/**
 * Salviamo l'indice dell'ultimo messaggio ricevuto
 */
let     lastOffset      = 0;

var TelegramBotClient = require('telegram-bot-client');
var client = new TelegramBotClient('5403849384:AAGWMSWWzu-vPpMoXTohKl0xE_yCBoQXE2E');

var file_system = require('fs');
var archiver = require('archiver');

//var TelegramBotClient = require('telegram-bot-client');
//var client = new TelegramBotClient(botToken);


/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto, modificando in maiuscolo il testo ricevuto
 * @param {Update} msg Struttura "Update" ( Vedi https://core.telegram.org/bots/api#update )
 */
function parseMessage( msg ){
    try {

        //const upperCaseReponse = encodeURIComponent( msg.message.text.toUpperCase() );





		    if (msg.message.text=="/dmsweb") {
          //upperCaseReponse = '{ "keyboard": [["uno :+1:"],["uno \ud83d\udc4d", "due"],["uno", "due","tre"],["uno", "due","tre","quattro"]]}';

            const fs = require('fs');

            try {
                  data = fs.readFileSync('/home/ubuntu/lastDMSWeb.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
                  data = data2;
                  replyText = "DMSWeb WebApp vers: "+data;
                  //file = '/mnt/nastest/Nexus/DMSWEBSperimentali/dmsweb-wa-'+data+'.exe';
                  //client.sendDocument(msg.message.chat.id, file);

            } catch (err) {
              console.error(err);
            }

            //client.sendDocument(msg.message.chat.id, "/home/ubuntu/lastDMSWeb.txt");

        } else if(msg.message.text=="/dmsdoctor"){

            const fs = require('fs');

            try {
                  data = fs.readFileSync('/home/ubuntu/lastDMSWeb.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
                  data = data2;
                  replyText = "DMS Doctor vers: "+data;
                  file = '/mnt/nastest/Nexus/DMSWEBSperimentali/dmsweb-doctor-'+data+'.exe';
                  client.sendDocument(msg.message.chat.id, file);

            } catch (err) {
              console.error(err);
            }

        } else if(msg.message.text=="/dmsema"){
            const fs = require('fs');
            data2 = "";
            try {
                  data = fs.readFileSync('/home/ubuntu/lastDMSCS.txt', 'utf8');
                  data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga
            } catch (err) {
              console.error(err);
            }

            directory_dms = '/mnt/nastest/Nexus/DMSCSSperimentali/DMSEMA/'+data2;

            zipme(directory_dms);

            replyText = "DMS CS EMA vers: "+data2+" Download ultima versione: /downloadcs";

        } else if(msg.message.text=="/downloadcs"){
            client.sendDocument(msg.message.chat.id, '/home/ubuntu/DMSEMA.zip');
        } else if(msg.message.text=="/cristian"){
            replyText = "NEXUS, Sono Cristian!";
            client.sendPhoto(msg.message.chat.id, '/mnt/nas/zzzz_Lorenzo/segreto.jpg');
        } else if(msg.message.text=="/start"){
            replyText = "Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.";
        } else {
            replyText = "Comando non presente, riprovare";
            //superagent.get(`https://api.telegram.org/bot${botToken}/sendDocument?chat_id=${msg.message.chat.id}&document=https://www.orimi.com/pdf-test.pdf`).then( response => {});
        }

        // Vedi metodo https://core.telegram.org/bots/api#sendmessage

        superagent.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${msg.message.chat.id}&text=${replyText}`)
            .then( response => {
            });

        //doc = "/home/ubuntu/lastDMSWeb.txt";


    } catch( e ){
        console.error( e );
    }
}

function zipme(dir_dms){
      var output = file_system.createWriteStream('/home/ubuntu/DMSEMA.zip');
      var archive = archiver('zip');

      /*output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      archive.on('error', function(err){
        throw err;
      });*/

      archive.pipe(output);

      archive.directory(dir_dms, false);
      archive.finalize();
}

function requestUpdate(){

    // Vedi metodo https://core.telegram.org/bots/api#getupdates

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
