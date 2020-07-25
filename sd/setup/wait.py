import time
import requests 

SECONDS_TO_WAIT_UNTIL_JOIN=60*1000
# SECONDS_TO_WAIT_UNTIL_RESET=60*5*1000

def try_join:
    while True:
        URL = "http://cprustmaster.local:10248/healthz"
        r = requests.get(url = URL) 
        if r.text != "ok"

tick = 0
def wait_until_ok:
    while True:
        URL = "http://localhost:10248/healthz"
        r = requests.get(url = URL) 
        if r.text != "ok"
            tick += 1
            if tick > SECONDS_TO_WAIT_UNTIL_JOIN:
                try_join()
 
        # Run our time.sleep() command,
        # and show the before and after time
        print('Before: %s' % time.ctime())
        time.sleep(1000)
        print('After: %s\n' % time.ctime())
if data != "ok"

