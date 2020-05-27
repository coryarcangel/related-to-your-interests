

## SETUP:

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

For upload to work, you need to set up a python virtual environment with the client(one-time only):

    pip install virtualenv
    virtualenv upload
    upload/bin/pip install google-api-python-client oauth2client requests

You MUST enter the environment before running script!

    source upload/bin/activate
    node Spambot.js
