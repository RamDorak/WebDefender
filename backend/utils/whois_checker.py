import requests
import re

def check_domain_age(url):
    domain = re.sub(r'https?://', '', url).split('/')[0]
    api_key = 'your_whoisxmlapi_key'
    response = requests.get(f"https://www.whoisxmlapi.com/whoisserver/WhoisService?domainName={domain}&apiKey={api_key}&outputFormat=JSON")
    
    if response.status_code != 200:
        return False  # Assume safe if check fails (optional: set stricter fallback)

    data = response.json()
    if 'WhoisRecord' in data and 'createdDate' in data['WhoisRecord']:
        creation_date = data['WhoisRecord']['createdDate']
        # Logic to check how old the domain is (simplified for example)
        return '2025' in creation_date  # Example: flags domains created in 2025

    return False
