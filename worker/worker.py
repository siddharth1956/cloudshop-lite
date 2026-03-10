import redis
import json
import time
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

def connect_redis():
    while True:
        try:
            r = redis.from_url(REDIS_URL, decode_responses=True)
            r.ping()
            log.info(f"Connected to Redis at {REDIS_URL}")
            return r
        except Exception as e:
            log.warning(f"Redis not ready, retrying in 5s: {e}")
            time.sleep(5)

def process_order(order_data):
    order = json.loads(order_data)
    log.info(f"Processing order {order.get('id')} for {order.get('productName')}")
    time.sleep(1)  # Simulate processing
    log.info(f"Order {order.get('id')} processed successfully")

def main():
    log.info("CloudShop Worker starting...")
    r = connect_redis()
    log.info("Worker ready — listening for orders on 'orders' queue")
    while True:
        try:
            _, data = r.brpop('orders', timeout=5) if r.llen('orders') > 0 else (None, None)
            if data:
                process_order(data)
            else:
                time.sleep(2)
        except redis.exceptions.ConnectionError:
            log.warning("Redis connection lost — reconnecting...")
            r = connect_redis()
        except Exception as e:
            log.error(f"Worker error: {e}")
            time.sleep(2)

if __name__ == '__main__':
    main()
