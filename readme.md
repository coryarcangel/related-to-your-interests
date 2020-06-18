                     .-.
                    o   \     .-.
                       .----.'   \
                     .'o)  / `.   o
                    /         |
                    \_)       /-.
                      '_.`    \  \
                       `.      |  \
                        |       \ |
                    .--/`-.     / /
                  .'.-/`-. `.  .\|
                 /.' /`._ `-    '-.
            ____(|__/`-..`-   '-._ \
           |`------.'-._ `      ||\ \
           || #   /-.   `   /   || \|
           ||   #/   `--'  /  /_::_|)__
           `|____|-._.-`  /  ||`--------`
                 \-.___.` | / || #      |
                  \       | | ||   #  # |
                  /`.___.'\ |.`|________|
                  | /`.__.'|'.`
                __/ \    __/ \
               /__.-.)  /__.-.) LGB
## Related to your interests bot:
This code generates videos from online news articles and pictures and uploads them to the [Related to Your Interests Youtube channel](https://www.youtube.com/channel/UC_LfMr7ffUG9q5M3UuxmF0Q) twice a day, at 10AM and 4PM EST.

## SETUP:

**Diffbot API**
    export DIFFBOT_TOKEN="ENTER_TOKEN_HERE"

**Image search:**
Follow directions here: https://www.npmjs.com/package/google-images
and add these values to your path:

    export GOOGLE_IMG_KEY="ENTER_KEY_HERE"
    export GOOGLE_IMG_SECRET="ENTER_SECRET_HERE"

**Text-to-speech:**
Follow instructions to set up a service account here: https://github.com/googleapis/nodejs-text-to-speech

    export GOOGLE_APPLICATION_CREDENTIALS="/some/path/warm-height-222420-e09a6e77ffcc.json"

**Video upload:**
Follow instructions here: https://developers.google.com/youtube/v3/guides/uploading_a_video

    export GOOGLE_CLIENT_SECRETS="/path/to/client_secrets.json"

**Slack Bot**
    export SLACK_WEBHOOK="ENTER_WEBHOOK_HERE"

Make bash script executable

	chmod a+x perform_job.sh
Install node packages

    npm install

For upload to work, you need to set up a python virtual environment with the client(one-time only):

    pip install virtualenv
    virtualenv upload
    upload/bin/pip install google-api-python-client oauth2client requests httplib

You must enter the virtual environment before running the script!

    $ source upload/bin/activate
    (upload)$ node Spambot.js
