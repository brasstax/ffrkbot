until /usr/bin/node ffrkbot.js; do
  echo "FFRKBot crashed with an exit code $?. Respawning..." >&2
  sleep 1
done
