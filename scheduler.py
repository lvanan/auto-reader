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

    # Check if all scheduled tasks are completed
    if not schedule.get_jobs():
        print("✅ All scheduled tasks have been executed. Exiting...")
        exit(0)

def generate_random_times():
    """Generates 20 random timestamps within the next 3 hours."""
    now = datetime.now()
    end_time = now + timedelta(hours=2)

    random_times = set()
    while len(random_times) < 10:
        random_offset = random.randint(0, int((end_time - now).total_seconds()))
        random_time = (now + timedelta(seconds=random_offset)).strftime("%H:%M")
        random_times.add(random_time)

    return sorted(random_times)

# Schedule the script at random times for today only
random_times_generated = generate_random_times()
for rt in random_times_generated:
    schedule.every().day.at(rt).do(run_script)
    logging.info(f"Scheduled execution at {rt}")
    print(f"Scheduled execution at {rt}")

# Keep the script running until all jobs are executed
while schedule.get_jobs():
    schedule.run_pending()
    time.sleep(30)

print("✅ All tasks completed. Exiting script.")
