from flask import Flask, request, jsonify
# from utils.url_classifier import classify_url
from utils.whois_checker import check_domain_age

app = Flask(__name__)

@app.route('/api/check_url', methods=['POST'])
def check_url():
    data = request.json
    url = data['url']

    result = {
        'is_phishing': False,
        'reasons': []
    }

    if classify_url(url):
        result['is_phishing'] = True
        result['reasons'].append("URL looks suspicious (ML Detection)")

    if check_domain_age(url):
        result['is_phishing'] = True
        result['reasons'].append("Domain is too new (WHOIS Check)")

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
