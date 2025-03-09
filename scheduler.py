import random
import schedule
import time
import subprocess
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    filename="script_execution.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

def run_script():
    """Executes index.js using Node.js and logs the output."""
    timestamp = datetime.now().strftime('%H:%M:%S')
    try:
        logging.info(f"Executing script at {timestamp}")
        print(f"Executing script at {timestamp}")

        # Run the script
        result = subprocess.run(["node", "index.js"], check=True, capture_output=True, text=True)

        # Log the output
        logging.info(f"Script executed successfully:\n{result.stdout}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Script execution failed:\n{e.stderr}")
        print(f"Error executing script at {timestamp}")

def generate_random_times():
    """Generates 20 random timestamps between 10:00 and 18:30."""
    start_time = datetime.strptime("10:00", "%H:%M")
    end_time = datetime.strptime("18:30", "%H:%M")

    random_times = set()
    while len(random_times) < 20:
        random_offset = random.randint(0, int((end_time - start_time).total_seconds()))
        random_time = (start_time + timedelta(seconds=random_offset)).strftime("%H:%M")
        random_times.add(random_time)

    return sorted(random_times)

# Schedule the script at random times
random_times_generated = generate_random_times()
for rt in random_times_generated:
    schedule.every().day.at(rt).do(run_script)
    logging.info(f"Scheduled execution at {rt}")
    print(f"Scheduled execution at {rt}")

# Keep the script running
while True:
    schedule.run_pending()
    time.sleep(30)
