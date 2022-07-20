#!/bin/bash
forever stopall
rm index.js
git clone https://github.com/fededale95/DasitBot.git
mv DasitBot/index.js index.js
rm -R DasitBot
forever start index.js
echo "Done!"
