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

//utenti x notifiche
var usersId=[];
var userz;
const fsU = require('fs');
try {
      usersz = fsU.readFileSync('/home/dms/usersId.txt', 'utf8');
      usersId = usersz.split("\n");
      usersId.pop();
} catch (err) {

}
//last version
var lastWeb;
var lastCS;

/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto
 */
function parseMessage( msg ){
    try {
		  if (msg.message.text=="/dmsweb") {
            sendMes(msg.message.chat.id, "DMSWeb WebApp vers: "+lastWeb+"\nAttendi alcuni secondi, sto preparando il tuo download...");
            file = '/mnt/nasCons/Nexus/DMSWEBSperimentali/dmsweb-wa-'+lastWeb+'.exe';
            fileName = 'dmsweb-wa-'+lastWeb+'.exe';
            output_zip = '/home/dms/DMSWeb'+lastWeb+'.zip';
            zipFile(file, fileName, output_zip, msg.message.chat.id);
        } else if(msg.message.text=="/dmsdoctor"){
            const fs = require('fs');
            try {
               data = fs.readFileSync('/home/dms/lastVersDOC.txt', 'utf8');
               last=lastVersion(data);
               sendMes(msg.message.chat.id,"DMS Doctor vers: "+last+"\nAttendi alcuni secondi, sto preparando il tuo download...");
               file = '/mnt/nasCons/Nexus/DMSWEBSperimentali/dmsweb-doctor-'+last+'.exe';
               client.sendDocument(msg.message.chat.id, file);
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsema"){
            sendMes(msg.message.chat.id,"DMS CS EMA vers: "+lastCS+" \nAttendi alcuni secondi, sto preparando il tuo download...");
            directory_dms = '/mnt/nasCons/Nexus/DMSCSSperimentali/DMSEMA/'+lastCS;
            output_zip = '/home/dms/DMSEMA.zip';
            zipDir(directory_dms, output_zip, msg.message.chat.id);
        } else if(msg.message.text=="/cristian"){
            sendMes(msg.message.chat.id,"NEXUS, Sono Cristian!");
            client.sendPhoto(msg.message.chat.id, '/mnt/nasPub/1600_Federico_project/segreto.jpg');
        } else if(msg.message.text=="/vpn"){
            sendMes(msg.message.chat.id,"Portale VPN - ASSISTENZA \n(ricordati di attivare GlobalProtect)\n\n http://10.1.6.14/AssistenzaRemota/");
        } else if(msg.message.text=="/start"){
            sendMes(msg.message.chat.id,"Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.");
        } else if(msg.message.text=="/users"){
            sendMes(msg.message.chat.id,"Utenti: "+usersId);
        } else{
            sendMes(msg.message.chat.id,"Comando non presente, riprovare");
        }
    } catch( e ){
        console.error( e );
    }
}

//funzione sendMessaggio personalizzata
function sendMes(msg_id, replyText){
      client.sendMessage(msg_id, replyText);
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
      });
}

//funzione che zippa una cartella
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
      //controllo versioni sw e notifico novità
      const fs = require('fs');
      const fs2 = require('fs');
      try {
            data = fs.readFileSync('/home/dms/lastVersWEB.txt', 'utf8');
            last=lastVersion(data);
            if(lastWeb==null){
               lastWeb=last;
            }
            if(last!=lastWeb){
               for(i in usersId){
                  sendMes(usersId[i], "E' disponibile una nuova versione di DMSWeb WebApp!\n vers: "+last+"\nClicca /dmsweb per scaricarla!");
               }
               lastWeb=last;
            }
            data2 = fs2.readFileSync('/home/dms/lastVersCS.txt', 'utf8');
            last2=lastVersion(data2);
            if(lastCS==null){
               lastCS=last2;
            }
            if(last2!=lastCS){
               for(i in usersId){
                  sendMes(usersId[i], "E' disponibile una nuova versione di DMS CS EMA!\n vers: "+last2+"\nClicca /dmsema per scaricarla!");
               }
               lastCS=last2;
            }
      } catch (err) {
        console.error(err);
      }
      //controllo se ci sono messaggi dall'utente
      superagent.get(`https://api.telegram.org/bot${botToken}/getUpdates?limit=1&offset=${lastOffset}`)
        .then( msg => {
            try {
                msg.body.result.map( inputMessage => {
                    // Aggiorniamo l'offset con l'ultimo messaggio ricevuto
                    lastOffset = inputMessage.update_id +1;
                    //salvo chi ha parlato con me
                    var found = false;
                    for(i in usersId){
                       if(inputMessage.message.chat.id==usersId[i]){
                          found = true;
                       }
                    }
                    if(!found){
                       usersId.push(inputMessage.message.chat.id);
                       var stream = fs.createWriteStream('/home/dms/usersId.txt', {flags:'a'});
                       stream.write(usersId[usersId.length-1] + "\n");
                       stream.end();
                    }
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
         for(i=0;i<names.length;i++){ //capire grandezza file e salvare num in var al posto che mettere 3
             file_system.rename(source+'.sf-part'+(i+1) , source+'.00'+(i+1), function(err) {
                 if ( err ) console.log('ERROR: ' + err);
             });
         }
         for(i=0;i<names.length;i++){
             client.sendDocument(msg_id, source+'.00'+(i+1));
         }
      })
      .catch((err) => {
          console.log('Error: ', err);
      });
}

function lastVersion(data){
      var myArray = data.split("\n");
      var toCanc = [];
      myArray.sort();
      for(i in myArray){
            if ( !(myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") )) {
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
      return last;
}

// Avviamo la prima lettura dei messaggi
requestUpdate();
