# import pickle
# import re

# with open('models/url_classifier.pkl', 'rb') as f:
#     model = pickle.load(f)

# def extract_features(url):
#     return [
#         len(url),
#         url.count('.'),
#         url.count('-'),
#         url.count('_'),
#         url.count('='),
#         url.count('?'),
#         url.count('&')
#     ]

# def classify_url(url):
#     features = extract_features(url)
#     return model.predict([features])[0] == 1
