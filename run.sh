#!/usr/bin/env bash
output="/root/master-projects/related-to-your-interests/cron.log"
error="/root/master-projects/related-to-your-interests/cron.error"
pwd >> $output
source /root/master-projects/related-to-your-interests/upload/bin/activate
/root/.nvm/versions/node/v14.4.0/bin/node -v >> $output
/root/.nvm/versions/node/v14.4.0/bin/node /root/master-projects/related-to-your-interests/Spambot.js >> $output 2> $error
