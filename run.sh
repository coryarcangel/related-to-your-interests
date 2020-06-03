#!/usr/bin/env bash
output="/Users/henron/comp_projects/related-to-your-interests/cron.log"
error="/Users/henron/comp_projects/related-to-your-interests/cron.error"
pwd >> $output
source /Users/henron/comp_projects/related-to-your-interests/upload/bin/activate
/usr/local/bin/node -v >> $output
# /usr/local/bin/node /Users/henron/comp_projects/related-to-your-interests/Spambot.js >> $output 2> $error
#/usr/local/bin/node /Users/henron/comp_projects/related-to-your-interests/Spambot.js >> $output
