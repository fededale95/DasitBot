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


/**
 * Elabora gli aggiornamenti ricevuti da Telegram e risponde al messaggio
 * ricevuto, modificando in maiuscolo il testo ricevuto
 * @param {Update} msg Struttura "Update" ( Vedi https://core.telegram.org/bots/api#update )
 */
function parseMessage( msg ){
    try {

        //const upperCaseReponse = encodeURIComponent( msg.message.text.toUpperCase() );

		    if (msg.message.text="update" || msg.message.text="UPDATE" || msg.message.text="Update") {
          upperCaseReponse = "Caxxo mi scrivi!"
        } else {
          upperCaseReponse = "---"
        }

        // Vedi metodo https://core.telegram.org/bots/api#sendmessage

        superagent.get(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${msg.message.chat.id}&text=${upperCaseReponse}`)
            .then( response => {
            });

    } catch( e ){
        console.error( e );
    }
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
