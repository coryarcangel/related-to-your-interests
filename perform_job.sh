#!/bin/bash
#ffmpeg script that assumes job folder is ready. accepts job folder sub-directory name
filecount=0
for file in job/$1/raw_images/*.jpg
do
	ffmpeg -i $file -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -loglevel warning job/$1/resized/image-$filecount.jpg >> job/$1/logs/resizing.txt
    let "filecount+=1"
done

DUR_STRING="$(ffmpeg -i job/$1/out-master.mp3 2>&1 | grep Duration)"
pat='([0-9][0-9]:[0-9][0-9]:[0-9][0-9])'
[[ $DUR_STRING =~ $pat ]]
time=${BASH_REMATCH[0]}
hours=${time:0:2}
hours_in_seconds=$(echo "$hours * 3600" | bc -l)
minutes=${time:3:2}
minutes_in_seconds=$(echo "$minutes * 60" | bc -l)
seconds=${time:6:2}
time_per_frame=$(echo "($hours_in_seconds + $minutes_in_seconds + $seconds) / $filecount " | bc -l)
echo "Framerate: ${time_per_frame:0:6}; $time / $filecount"

ffmpeg -framerate 1/${time_per_frame:0:6} -pattern_type glob -i 'job/'$1'/resized/*.jpg'  -i 'job/'$1'/out-master.mp3' -c:v libx264 -pix_fmt yuv420p -loglevel warning 'job/'$1'/master.mp4' >> job/$1/logs/gen-video.txt