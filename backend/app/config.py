# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

MAIL_ADDRESS = os.getenv("MAIL_ADDRESS")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_TEST = os.getenv("MAIL_TEST")
