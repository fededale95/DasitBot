#!/bin/bash
forever stopall
rm /var/dasit-bot/index.js
git clone https://github.com/fededale95/DasitBot.git /var/dasit-bot/DasitBot
mv /var/dasit-bot/DasitBot/index.js /var/dasit-bot/index.js
rm -R /var/dasit-bot/DasitBot
forever start /var/dasit-bot/index.js
echo "Done!"
forever list
