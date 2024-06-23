
from datetime import datetime
import jwt
from config import Config


def decodeToken(token):
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        userId = decoded.get('sub')
        return userId
    except Exception as e:
        print('Error decoding token', e)
        return None

def generateToken(userId):
    try:
        exp = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        payload = {
            'identity': str(userId),
            'exp': exp
        }
        token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        print("Token generated: ", token)
        return token
    except Exception as e:
        print('Error generating token', e)
        return None