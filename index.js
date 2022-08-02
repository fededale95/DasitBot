/**
 * Librerie e variabili
 */
//upload config from /etc/dasitbot.conf
uploadConfig();
var botTokenConfFile;
var homeFolder;
var DMSWebFolder;
var DMSDocFolder;
var DMSCSFolder;
var EasterEggPath;

var fsConf = require('fs');
var streamConf = fsConf.createWriteStream(homeFolder+'verifyConf.txt', {flags:'w'});
streamConf.write("botTokenConfFile = "+botTokenConfFile+"\n");
streamConf.write("homeFolder = "+homeFolder+"\n");
streamConf.write("DMSWebFolder = "+DMSWebFolder+"\n");
streamConf.write("DMSDocFolder = "+DMSDocFolder+"\n");
streamConf.write("DMSCSFolder = "+DMSCSFolder+"\n");
streamConf.write("EasterEggPath = "+EasterEggPath+"\n");
streamConf.end();

//superagent
const   superagent      = require( 'superagent' );
const   botToken        = botTokenConfFile;
let     lastOffset      = 0;

//telegrambot
var TelegramBotClient = require('telegram-bot-client');
var client = new TelegramBotClient(botTokenConfFile);

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
      usersz = fsU.readFileSync(homeFolder+'usersId.txt', 'utf8');
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
            file = DMSWebFolder+'dmsweb-wa-'+lastWeb+'.exe';
            fileName = 'dmsweb-wa-'+lastWeb+'.exe';
            output_zip = homeFolder+'DMSWeb'+lastWeb+'.zip';
            zipFile(file, fileName, output_zip, msg.message.chat.id);
        } else if(msg.message.text=="/dmsdoctor"){
            const fs = require('fs');
            try {
               data = fs.readFileSync(homeFolder+'lastVersDOC.txt', 'utf8');
               last=lastVersion(data);
               sendMes(msg.message.chat.id,"DMS Doctor vers: "+last+"\nAttendi alcuni secondi, sto preparando il tuo download...");
               file = DMSDocFolder+'dmsweb-doctor-'+last+'.exe';
               client.sendDocument(msg.message.chat.id, file);
            } catch (err) {
              console.error(err);
            }
        } else if(msg.message.text=="/dmsema"){
            sendMes(msg.message.chat.id,"DMS CS EMA vers: "+lastCS+" \nAttendi alcuni secondi, sto preparando il tuo download...");
            directory_dms = DMSCSFolder+lastCS;
            output_zip = homeFolder+'DMSEMA.zip';
            zipDir(directory_dms, output_zip, msg.message.chat.id);
        } else if(msg.message.text=="/cristian"){
            sendMes(msg.message.chat.id,"NEXUS, Sono Cristian!");
            client.sendPhoto(msg.message.chat.id, EasterEggPath);
        } else if(msg.message.text=="/vpn"){
            sendMes(msg.message.chat.id,"Portale VPN - ASSISTENZA \n(ricordati di attivare GlobalProtect)\n\n http://10.1.6.14/AssistenzaRemota/");
        } else if(msg.message.text=="/start"){
            sendMes(msg.message.chat.id,"Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.");
        } else if(msg.message.text=="/users"){
            sendMes(msg.message.chat.id,"Utenti: "+usersId);
        } else if(msg.message.text=="/newconf"){
            uploadDMSFolder(msg.message.chat.id);
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
            data = fs.readFileSync(homeFolder+'lastVersWEB.txt', 'utf8');
            last=lastVersion(data);
            if(lastWeb==null){
               lastWeb=last;
            }
            if(last!=lastWeb){
               logNewVersion(last, data, true);
               for(i in usersId){
                  sendMes(usersId[i], "E' disponibile una nuova versione di DMSWeb WebApp!\n vers: "+last+"\nClicca /dmsweb per scaricarla!");
               }
               lastWeb=last;
            }
            data2 = fs2.readFileSync(homeFolder+'versCS.txt', 'utf8');
            last2=lastVersionCS(data2);
            if(lastCS==null){
               lastCS=last2;
            }
            if(last2!=lastCS){
               logNewVersion(last2, data2, false);
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
                       var stream = fs.createWriteStream(homeFolder+'usersId.txt', {flags:'a'});
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

function lastVersionCS(data){
      var myData = data.split("\n");
      myData.shift();
      var myArray = [];
      for(i in myData){
          var tempArray = myData[i].split(" ");
          myArray.push(tempArray[tempArray.length-1]);
      }

      var toCanc = [];
      for(i in myArray){
            if ( myArray[i].endsWith(".zip") || !(myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") )) {
               toCanc.push(i);
            }
      }
      for (var i = toCanc.length - 1; i >= 0; i--){
         myArray.splice(toCanc[i], 1);
      }

      lastVer = extractLast(myArray);

      return lastVer;
      //return myArray[myArray.length-1];
}

function extractLast(items) {
    var myArray = [];
    for(i in items){
        var tempString = items[i].split(".");
        myArray.push(tempString);
    }
    myBubbleSort(myArray);
    return myArray[myArray.length-1];
}

function myBubbleSort(items){
      //ordino per macroversioni N.x.x
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(items[j][0] > items[j+1][0]) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }

      //elimino tutte le macroversioni precedenti all'ultima
      for (var i = items.length - 2; i >= 0; i--){
         if(items[i][0]<items[items.length-1]){
            items.splice(i, 1);
         }
      }

      //ora ordino per versione x.N.x
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(items[j][1] > items[j+1][1]) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }

      //elimino le versioni precedenti all'ultima
      for (var i = items.length - 2; i >= 0; i--){
         if(items[i][1]<items[items.length-1]){
            items.splice(i, 1);
         }
      }

      //ora ordino per release x.x.N
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(items[j][2] > items[j+1][2]) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }
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
      for (var i = toCanc.length - 1; i >= 0; i--){
         myArray.splice(toCanc[i], 1);
      }
      return myArray[myArray.length-1];
}

function logNewVersion(newVersion, data, web){
      const fs3 = require('fs');
      var stream1 = fs3.createWriteStream(homeFolder+'logNewVersion.txt', {flags:'a'});
      stream1.write("\n\n ------------start------------- \n\n");
      if(web){
         stream1.write("Nuova versione Web: "+newVersion);
         stream1.write("Vecchia Versione Web: "+lastWeb);
         stream1.write("\nCartella WEB (output ls -la): "+data);
      }else{
         stream1.write("Nuova versione CS: "+newVersion);
         stream1.write("Vecchia Versione CS: "+lastCS);
         stream1.write("\nCartella DMSEMA (output ls -la): "+data);
      }
      stream1.write("\n\n -------------end-------------- \n\n");
      stream1.end();
}

function uploadConfig(){
      try {
         const fs = require('fs');
         data = fs.readFileSync('/etc/dasitbot.conf', 'utf8');
         var param = data.split("\n");
         for(i in param){
            temp = param[i].split("'");
            val = temp[1];
            if(param[i].startsWith("botToken")){
                  botTokenConfFile=val;
            } else if(param[i].startsWith("homeFolder")){
                  homeFolder=val;
            } else if(param[i].startsWith("DMSWebFolder")){
                  DMSWebFolder=val;
            } else if(param[i].startsWith("DMSDocFolder")){
                  DMSDocFolder=val;
            } else if(param[i].startsWith("DMSCSFolder")){
                  DMSCSFolder=val;
            } else if(param[i].startsWith("EasterEggPath")){
                  EasterEggPath=val;
            }
         }
      } catch (err) {
         console.log('Error: ', err);
         exit(0);
      }
}

function uploadDMSFolder(msg_id){
      try {
         const fs = require('fs');
         data = fs.readFileSync('/etc/dasitbot.conf', 'utf8');
         var param = data.split("\n");
         for(i in param){
            temp = param[i].split("'");
            val = temp[1];
            if(param[i].startsWith("DMSWebFolder")){
                  DMSWebFolder=val;
            } else if(param[i].startsWith("DMSDocFolder")){
                  DMSDocFolder=val;
            } else if(param[i].startsWith("DMSCSFolder")){
                  DMSCSFolder=val;
            }
         }
         data2 = "DMSWebFolder = "+DMSWebFolder+"\nDMSDocFolder = "+DMSDocFolder+"\nDMSCSFolder = "+DMSCSFolder;
         sendMes(msg_id, "Configurazione aggiornata correttamente!\n\nNuova Conf:\n\n"+data2);

      } catch (err) {
         sendMes(msg_id, "Erorre nelle configurazione del Bot, non verrano apportate modifiche. \nAttenzione, assicurarsi che il file /etc/dasitbot.conf non sia stato eliminato!");
      }
}

// Avviamo la funzione che gira ogni 2 secondi e gestisce la ricezione dei messaggi e il controllo di versione
requestUpdate();
