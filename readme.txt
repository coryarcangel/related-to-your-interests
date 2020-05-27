SETUP:
Image search:
https://www.npmjs.com/package/google-images # set up custom search engine
export GOOGLE_IMG_KEY="ENTER_KEY_HERE"
export GOOGLE_IMG_SECRET="ENTER_SECRET_HERE"

Text-to-speech:
https://github.com/googleapis/nodejs-text-to-speech # you need to set up a service account here
export GOOGLE_APPLICATION_CREDENTIALS="/mnt/c/Users/henry/comp_projects/warm-height-222420-e09a6e77ffcc.json"

Video upload:
https://developers.google.com/youtube/v3/guides/uploading_a_video
export GOOGLE_CLIENT_SECRETS="/mnt/c/Users/henry/comp_projects/client_secrets.json"

For upload to work, you need to set up a python virtual env with the client
# pip install virtualenv
# virtualenv upload
# upload/bin/pip install google-api-python-client oauth2client requests

and enter the environment before running script!
# source upload/bin/activate



