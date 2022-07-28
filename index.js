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

//split file
const splitFile = require('split-file');

/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto
 */
function parseMessage( msg ){
    try {
		    if (msg.message.text=="/dmsweb") {
            const fs = require('fs');
            try {
                  data = fs.readFileSync('/home/dms/lastVersWEB.txt', 'utf8');
                  var myArray = data.split("\n");
                  var toCanc = [];
                  myArray.sort();
                  for(i in myArray){
                        if ( myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") ) {

                        } else {
                           toCanc.push(i);
                        }
                  }
                  for(i in toCanc){
                     myArray.splice(toCanc[i], 1);
                     for(i in toCanc){
                        toCanc[i]=toCanc[i]-1;
                     }
                  }
                  last=myArray[myArray.length-1];

                  sendMes(msg.message.chat.id, "DMSWeb WebApp vers: "+last+"\nAttendi alcuni secondi, sto preparando il tuo download...");
                  file = '/mnt/nasCons/Nexus/DMSWEBSperimentali/dmsweb-wa-'+last+'.exe';
                  fileName = 'dmsweb-wa-'+last+'.exe';
                  output_zip = '/home/dms/DMSWeb'+last+'.zip';
                  zipFile(file, fileName, output_zip, msg.message.chat.id);

            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsdoctor"){
            const fs = require('fs');
            try {
                  data = fs.readFileSync('/home/dms/lastVersWEB.txt', 'utf8');
                  var myArray = data.split("\n");
                  var toCanc = [];
                  myArray.sort();
                  for(i in myArray){
                        if ( myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") ) {

                        } else {
                           toCanc.push(i);
                        }
                  }
                  for(i in toCanc){
                     myArray.splice(toCanc[i], 1);
                     for(i in toCanc){
                        toCanc[i]=toCanc[i]-1;
                     }
                  }
                  last=myArray[myArray.length-1];

                  sendMes(msg.message.chat.id,"DMS Doctor vers: "+last+"\nAttendi alcuni secondi, sto preparando il tuo download...");
                  file = '/mnt/nasCons/Nexus/DMSWEBSperimentali/dmsweb-doctor-'+last+'.exe';
                  client.sendDocument(msg.message.chat.id, file);
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsema"){
            const fs = require('fs');
            data2 = "";
            try {
                  data2 = fs.readFileSync('/home/dms/lastVersCS.txt', 'utf8');
                  //data2 = data.substring(0, data.length - 1); //tolgo il carattere di fine riga

            } catch (err) {
              console.error(err);
            }
            var myArray = data2.split("\n");
            var toCanc = [];
            myArray.sort();
            for(i in myArray){
                  if ( myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") ) {

                  } else {
                     toCanc.push(i);
                  }
            }
            for(i in toCanc){
               myArray.splice(toCanc[i], 1);
               for(i in toCanc){
                  toCanc[i]=toCanc[i]-1;
               }
            }
            last=myArray[myArray.length-1];
            sendMes(msg.message.chat.id,"DMS CS EMA vers: "+last+" \nAttendi alcuni secondi, sto preparando il tuo download...");
            directory_dms = '/mnt/nasCons/Nexus/DMSCSSperimentali/DMSEMA/'+last;
            output_zip = '/home/dms/DMSEMA.zip';
            zipDir(directory_dms, output_zip, msg.message.chat.id);

        } else if(msg.message.text=="/cristian"){
            sendMes(msg.message.chat.id,"NEXUS, Sono Cristian!");
            client.sendPhoto(msg.message.chat.id, '/mnt/nasPub/1600_Federico_project/segreto.jpg');
        } else if(msg.message.text=="/excel"){
            sendMes(msg.message.chat.id,"OK!");
            readExcel(msg.message.text);
        } else if(msg.message.text=="/start"){
            sendMes(msg.message.chat.id,"Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.");
        }else{
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

//funzione ch ezippa un file
function zipFile(file_to_zip, fileName, output_name, msg_id){
      var output = file_system.createWriteStream(output_name);
      var archive = archiver('zip');
      archive.pipe(output);
      archive.file(file_to_zip, { name:  fileName});
      archive.finalize();
      output.on('close', function () {
          splitMyFile(output_name, 50000000, msg_id);

          sleep(5).then(() => {  //capire se c'è un evento che triggera al finire dello split
            for(i=0;i<3;i++){ //capire grandezza file e salvare num in const al posto che mettere 3
                file_system.rename(output_name+'.sf-part'+(i+1) , output_name+'.00'+(i+1), function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });

            }
            for(i=0;i<3;i++){
                client.sendDocument(msg_id, output_name+'.00'+(i+1));
            }

          })
      });
}

//funzione che zippa una cartella (da parametrizzare in e out)
function zipDir(dir_to_zip, output_name, msg_id){
      var output = file_system.createWriteStream(output_name);
      var archive = archiver('zip');
      archive.pipe(output);
      archive.directory(dir_to_zip, false);
      archive.finalize();
      output.on('close', function () {
          client.sendDocument(msg_id, output_name);
      });
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

function splitMyFile(source, maxSize, msg_id) {
      splitFile.splitFileBySize( source , maxSize)
      .then((names) => {
      })
      .catch((err) => {
          console.log('Error: ', err);
      });
}

// Avviamo la prima lettura dei messaggi
requestUpdate();
