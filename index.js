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

//hash password
const bcrypt = require('bcrypt');

myLog("\n\nBOT START:\n"+getData(),"data.txt");

//utenti x notifiche
var usersId=[];
var userz;
const fsU = require('fs');
try {
      usersz = fsU.readFileSync(homeFolder+'usersId.txt', 'utf8');
      usersId = usersz.split("\n");
      usersId.pop();
} catch (err) {}

//last version
var lastWeb;
var lastCS;

//abilitazione
var inserimento;
var wait_password = false;
var password_abilitazione;
try {
      password_abilitazione = fsU.readFileSync(homeFolder+'hash_pwd.txt', 'utf8');
      password_abilitazione = password_abilitazione.substring(0, password_abilitazione.length - 1);
} catch (err) {}

//vpn search
var wait_name_vpn = false;

/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto
 */
function parseMessage( msg ){
    try {
         inserimento = wait_password || wait_name_vpn;
         if (msg.message.text=="/dmsweb" && !inserimento) {
             if(getAbilitazione(msg.message.chat.id)){
                sendMes(msg.message.chat.id, "DMSWeb vers: "+lastWeb+"\n\nSeleziona l'opzione desiderata:\n\nSolo aggiornamento: /dmswebwa \nInstallazione completa: /dmswebx64");
             } else{
                sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
             }
         }
		  else if(msg.message.text=="/dmswebwa" && !inserimento) {
            if(getAbilitazione(msg.message.chat.id)){
               sendMes(msg.message.chat.id, "DMSWeb WebApp vers: "+lastWeb+"\nAttendi alcuni secondi, sto preparando il tuo download...");
               file = DMSWebFolder+'dmsweb-wa-'+lastWeb+'.exe';
               fileName = 'dmsweb-wa-'+lastWeb+'.exe';
               output_zip = homeFolder+'DMSWeb-wa-'+lastWeb+'.zip';
               zipFile(file, fileName, output_zip, msg.message.chat.id);
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/dmswebx64" && !inserimento) {
            if(getAbilitazione(msg.message.chat.id)){
               sendMes(msg.message.chat.id, "DMSWeb x64 vers: "+lastWeb+"\nAttendi alcuni secondi, sto preparando il tuo download...");
               file = DMSWebFolder+'dmsweb-x64-'+lastWeb+'.exe';
               fileName = 'dmsweb-x64-'+lastWeb+'.exe';
               output_zip = homeFolder+'DMSWeb-x64-'+lastWeb+'.zip';
               zipFile(file, fileName, output_zip, msg.message.chat.id);
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        }else if(msg.message.text=="/dmsdoctor" && !inserimento){
            if(getAbilitazione(msg.message.chat.id)){
               const fs = require('fs');
               try {
                  data = fs.readFileSync(homeFolder+'versDoc.txt', 'utf8');
                  last=lastVersion(data,2);
                  sendMes(msg.message.chat.id,"DMS Doctor vers: "+last+"\nAttendi alcuni secondi, sto preparando il tuo download...");
                  file = DMSDocFolder+'dmsweb-doctor-'+last+'.exe';
                  client.sendDocument(msg.message.chat.id, file);
               } catch (err) {
                 console.error(err);
               }
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/dmsema" && !inserimento){
            if(getAbilitazione(msg.message.chat.id)){
               sendMes(msg.message.chat.id,"DMS CS EMA vers: "+lastCS+" \nAttendi alcuni secondi, sto preparando il tuo download...");
               directory_dms = DMSCSFolder+lastCS;
               output_zip = homeFolder+'DMSEMA.zip';
               zipDir(directory_dms, output_zip, msg.message.chat.id);
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/tw" && !inserimento){
            if(getAbilitazione(msg.message.chat.id)){
               sendMes(msg.message.chat.id,"TeamViewer Quick Support - DASIT");
               tw_exe = homeFolder+'TeamViewerQS-idc6qmrbr5.exe';
               client.sendDocument(msg.message.chat.id, tw_exe);
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/7zip" && !inserimento){
            if(getAbilitazione(msg.message.chat.id)){
               sendMes(msg.message.chat.id,"7Zip - Per estrarre i file zip splittati del DMSWeb");
               zip_exe = homeFolder+'7z2201-x64.exe';
               client.sendDocument(msg.message.chat.id, zip_exe);
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/cristian" && !inserimento){
            sendMes(msg.message.chat.id,"NEXUS, Sono Cristian!");
            client.sendPhoto(msg.message.chat.id, EasterEggPath);
        } else if(msg.message.text=="/gianca" && !inserimento){
            sendMes(msg.message.chat.id,"Beautiful, Beautiful is not!");
            client.sendVideo(msg.message.chat.id, homeFolder+'gianca.mp4');
        } else if(msg.message.text=="/vpn" && !inserimento){
            if(getAbilitazione(msg.message.chat.id)){
            sendMes(msg.message.chat.id,"Portale VPN - ASSISTENZA \n(ricordati di attivare GlobalProtect)\n\n http://10.1.6.14/AssistenzaRemota/");
            } else{
               sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
            }
        } else if(msg.message.text=="/start" && !inserimento){
            sendMes(msg.message.chat.id,"Benvenuto nel Bot Dasit, clicca sul menu per scegliere un comando.\nClicca /abilitazione per richiedere i permessi per tutti i comandi.");
        } else if(msg.message.text=="/lenovo" && !inserimento){
            msglenovo = "Ottimizzazione settings LENOVO TD350 per ESXi:\n\n";
            msglenovo+= " - Accendi il server.\n";
            msglenovo+= " - Premere F1 e accedere alla configurazione del BIOS\n";
            msglenovo+= " - Dalla schermata di configurazione principale, premere il tasto freccia destra per accedere alla scheda Impostazioni avanzate\n";
            msglenovo+= " - Seleziona Impostazioni di alimentazione avanzate\n";
            msglenovo+= " - Seleziona Profilo prestazioni e seleziona Custom\n";
            msglenovo+= " - Modificare le seguenti opzioni come segue:\n";
            msglenovo+= "    a. Tecnologia avanzata Intel SpeedStep = Abilitato\n";
            msglenovo+= "    b. Modalità Turbo = Abilitato\n";
            msglenovo+= "    c. Supporto C1E = Disabilitato\n";
            msglenovo+= "    d. Core C3 = Disabilitato\n";
            msglenovo+= "    e. Core C6 = Disabilitato\n";
            msglenovo+= "    f. Prestazioni della CPU e distorsione energetica = disabilitato\n";
            msglenovo+= "    g. Profilo termico = Prestazioni massime\n";
            msglenovo+= "    h. Risparmio energetico della memoria = Disabilitato\n\n";
            msglenovo+= "Premere F10 per salvare e ripristinare. Selezionare Sì quando viene richiesto di confermare.\n";
            msglenovo+= "Il server ora si riavvierà.\n";
            sendMes(msg.message.chat.id,msglenovo);
        } else if(msg.message.text=="/whoami" && !inserimento){
            sendMes(msg.message.chat.id,"Utenti: "+msg.message.chat.id);
        } else if(msg.message.text=="/test" && !inserimento){
            testNotify(msg.message.chat.id);
        } else if(msg.message.text=="/abilitazione"  && !inserimento){
            abilitazione(msg.message.chat.id);
        } else if(msg.message.text=="/vh"  && !inserimento){
            insert_name_vpn(msg.message.chat.id);
        }else{
            if (wait_password){
               if(bcrypt.compareSync(msg.message.text, password_abilitazione)){
                  wait_password = false;
                  passwordOk(msg.message.chat.id);
                  sendMes(msg.message.chat.id,"Abilitazione avvenuta correttamente!\n\nOra puoi utilizzare i seguenti comandi\n/dmsweb\n/dmsema\n/dmsdoctor\n/vpn");
               }else{
                  wait_password = false;
                  sendMes(msg.message.chat.id,"Password errata, clicca /abilitazione per riprovare.");
               }
            }else if(wait_name_vpn){
               wait_name_vpn = false;
               if(getAbilitazione(msg.message.chat.id)){
                  temp=msg.message.text;
                  if(temp.length>3){
                     vpn=temp.toUpperCase();
                     const fsvpn = require("fs");
                     var stringa;
                     var found=0;
                     var foundf=0;
                     var name = [];
                     fsvpn.readdir("/var/www/html/AssistenzaRemota", (errore, folder) => {
                       if (errore) {
                         throw errore;
                       }
                       for(m in folder){
                          if(folder[m].toUpperCase().includes(vpn)){
                             name.push(folder[m]);
                             found++;
                          }
                       }
                       if(found==0){
                          sendMes(msg.message.chat.id, "Nessun risultato!");
                       } else if(found==1){
                          var filehtm;
                          fsvpn.readdir("/var/www/html/AssistenzaRemota/"+name[0], (errore, files) => {
                             if (errore) {
                               throw errore;
                             }
                             for(m in files){
                                if(files[m].includes("htm")){
                                   if(!files[m].includes("$")){
                                      filehtm=files[m];
                                      foundf++;
                                   }
                                }
                             }
                             if(foundf==0){
                                sendMes(msg.message.chat.id, "Nella cartella della vpn: "+name[0]+" non è presente un file html o htm");
                             }else if(foundf==1){
                                client.sendDocument(msg.message.chat.id, "/var/www/html/AssistenzaRemota/"+name[0]+"/"+filehtm);
                             }else{
                                sendMes(msg.message.chat.id, "Trovati più file html o htm, il programma ancora non gestisce l'invio multiplo");
                             }
                          });
                       }else{
                          var fileshtm = [];
                          name.forEach(cart => {
                             var foundfs=0;
                             fsvpn.readdir("/var/www/html/AssistenzaRemota/"+cart, (errore, files) => {
                              if(errore){
                                 throw errore;
                              }else{
                                   for(m in files){
                                      if(files[m].includes("htm")){
                                         if(!files[m].includes("$")){
                                            fileshtm.push(files[m]);
                                            foundfs++;
                                         }
                                      }
                                   }
                                   if(foundfs==0){
                                      fileshtm.push("none");
                                      sendMes(msg.message.chat.id, "Nella cartella della vpn: "+cart+" non è presente un file html o htm");
                                   }else{
                                      foundfs=0;
                                      client.sendDocument(msg.message.chat.id, "/var/www/html/AssistenzaRemota/"+cart+"/"+fileshtm[fileshtm.length-1]);
                                   }
                              }
                            });
                        })

                       }
                     });
                  } else{
                     sendMes(msg.message.chat.id, "Parola chiave troppo corta, prova con 4 o piu' caratteri!");
                  }
               } else{
                  sendMes(msg.message.chat.id, "Utente non abilitato, clicca /abilitazione per richiedere i permessi!");
               }
            }else{
               sendMes(msg.message.chat.id,"Comando non presente, riprovare");
            }
        }
    } catch( e ){
        console.error( e );
    }
}

//funzione sendMessaggio personalizzata
function sendMes(msg_id, replyText){
      client.sendMessage(msg_id, replyText).catch(function(err){

      });
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
            data = fs.readFileSync(homeFolder+'vers.txt', 'utf8');
            last=lastVersion(data,1);
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
            last2=lastVersion(data2,0);

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
         for(i=0;i<names.length;i++){
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

function lastVersion(data,type){  //type: 0=CS,  1=Web,  2=Doc
      var myData = data.split("\n");
      if(type==0){
         myData.shift();
      }
      var myArray = [];
      for(i in myData){
          var tempArray = myData[i].split(" ");
          myArray.push(tempArray[tempArray.length-1]);
      }

      if(type==1){
         for(i in myArray){
            myArray[i]=myArray[i].replace(/d/g, '');
            myArray[i]=myArray[i].replace(/m/g, '');
            myArray[i]=myArray[i].replace(/s/g, '');
            myArray[i]=myArray[i].replace(/w/g, '');
            myArray[i]=myArray[i].replace(/e/g, '');
            myArray[i]=myArray[i].replace(/b/g, '');
            myArray[i]=myArray[i].replace(/-/g, '');
            myArray[i]=myArray[i].replace(/a/g, '');
            myArray[i]=myArray[i].replace(/x/g, '');
            myArray[i]=myArray[i].substring(0, myArray[i].length - 1);
         }
      }

      if(type==2){
         for(i in myArray){
            myArray[i]=myArray[i].replace(/d/g, '');
            myArray[i]=myArray[i].replace(/m/g, '');
            myArray[i]=myArray[i].replace(/s/g, '');
            myArray[i]=myArray[i].replace(/w/g, '');
            myArray[i]=myArray[i].replace(/e/g, '');
            myArray[i]=myArray[i].replace(/b/g, '');
            myArray[i]=myArray[i].replace(/o/g, '');
            myArray[i]=myArray[i].replace(/c/g, '');
            myArray[i]=myArray[i].replace(/t/g, '');
            myArray[i]=myArray[i].replace(/r/g, '');
            myArray[i]=myArray[i].replace(/-/g, '');
            myArray[i]=myArray[i].replace(/x/g, '');
            myArray[i]=myArray[i].substring(0, myArray[i].length - 1);
         }
      }

      var toCanc = [];
      for(i in myArray){
            if ( !(myArray[i].startsWith("0") || myArray[i].startsWith("1") || myArray[i].startsWith("2") || myArray[i].startsWith("3") || myArray[i].startsWith("4") || myArray[i].startsWith("5") || myArray[i].startsWith("6") || myArray[i].startsWith("7") || myArray[i].startsWith("8") || myArray[i].startsWith("9") )) {
               toCanc.push(i);
            }else if( !(myArray[i].endsWith("0") || myArray[i].endsWith("1") || myArray[i].endsWith("2") || myArray[i].endsWith("3") || myArray[i].endsWith("4") || myArray[i].endsWith("5") || myArray[i].endsWith("6") || myArray[i].endsWith("7") || myArray[i].endsWith("8") || myArray[i].endsWith("9"))){
               toCanc.push(i);
            }
      }
      for (var i = toCanc.length - 1; i >= 0; i--){
         myArray.splice(toCanc[i], 1);
      }

      lastVer = extractLast(myArray);

      return lastVer;
}

function extractLast(items) {
    var myArray = [];
    for(i in items){
        var tempString = items[i].split(".");
        myArray.push(tempString);
    }
    myBubbleSort(myArray);
    ris = myArray[myArray.length-1][0]+"."+myArray[myArray.length-1][1]+"."+myArray[myArray.length-1][2];
    return ris;
}

function myBubbleSort(items){
      //ordino per macroversioni N.x.x
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(parseInt(items[j][0]) > parseInt(items[j+1][0])) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }

      //elimino tutte le macroversioni precedenti all'ultima
      for (var i = items.length - 2; i >= 0; i--){
         if(parseInt(items[i][0]) < parseInt(items[items.length-1][0])){
            items.splice(i, 1);
         }
      }

      //ora ordino per versione x.N.x
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(parseInt(items[j][1]) > parseInt(items[j+1][1])) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }

      //elimino le versioni precedenti all'ultima
      for (var i = items.length - 2; i >= 0; i--){
         if(parseInt(items[i][1]) < parseInt(items[items.length-1][1])) {
            items.splice(i, 1);
         }
      }

      //ora ordino per release x.x.N
      for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < (items.length - i - 1); j++) {
              if(parseInt(items[j][2]) > parseInt(items[j+1][2])) {
                 var tmp = items[j];
                 items[j] = items[j+1];
                 items[j+1] = tmp;
              }
         }
      }

}

function logNewVersion(newVersion, data, web){
      const fs3 = require('fs');
      var stream1 = fs3.createWriteStream(homeFolder+'log.txt', {flags:'a'});
      stream1.write("\n\n ------------start------------- \n\n");
      if(web){
         stream1.write("Nuova versione Web: "+newVersion);
         stream1.write("\nVecchia Versione Web: "+lastWeb);
         stream1.write("\n"+getData());
         stream1.write("\n\nCartella WEB (output ls -la): "+data);
      }else{
         stream1.write("Nuova versione CS: "+newVersion);
         stream1.write("\nVecchia Versione CS: "+lastCS);
         stream1.write("\n"+getData());
         stream1.write("\nCartella DMSEMA (output ls -la): "+data);
      }
      stream1.write("\n\n -------------end-------------- \n\n");
      stream1.end();
}
function myLog(txt, nameFile){
      const fs3 = require('fs');
      var stream1 = fs3.createWriteStream(homeFolder+nameFile, {flags:'a'});
      stream1.write(txt);
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

function abilitazione(msg_id){
      //salvo user nell'array, serve per abilitazione comandi speciali (dms file)
      var found = false;
      for(i in usersId){
         if(msg_id==usersId[i]){
           found = true;
         }
      }
      if(!found){
         sendMes(msg_id,"Inserisci la password: ");
         wait_password = true;
      }else{
         sendMes(msg_id,"Utente già abilitato!");
      }
}

function insert_name_vpn(msg_id){
      sendMes(msg_id,"Digita il nome della VPN: ");
      wait_name_vpn = true;
}

function passwordOk(msg_id){
      const fs = require('fs');
      usersId.push(msg_id);
      var stream = fs.createWriteStream(homeFolder+'usersId.txt', {flags:'a'});
      stream.write(usersId[usersId.length-1] + "\n");
      stream.end();
}

function getAbilitazione(msg_id){
      var found = false;
      for(i in usersId){
         if(msg_id==usersId[i]){
           found = true;
         }
      }
      return found;
}

function generaHash(password_da_cifrare){ //funzione non utilizzata, la puoi chiamare se ti serve creare un hash di una nuova password, ricordati poi di eliminare gli utenti dal file userId.txt
      const saltRounds = 10;
      const la_mia_password = password_da_cifrare;
      bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(la_mia_password, salt, function(err, hash) {
              // qui possiamo salvare la nostra password criptata (hash) in un txt
              const fs3 = require('fs');
              var stream1 = fs3.createWriteStream(homeFolder+"hash_pwd.txt", {flags:'w'});
              stream1.write(hash);
              stream1.end();
          });
      });
}

function getData(){
      const d = new Date();
      return "Data: "+d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+"\nOra: "+(d.getHours()+2)+":"+d.getMinutes()+":"+d.getSeconds();
}

function testNotify(id){
      var info ;
      sendMes(id, "TEST: "+info);
}


// Avviamo la funzione che gira ogni 2 secondi e gestisce la ricezione dei messaggi e il controllo di versione
requestUpdate();
