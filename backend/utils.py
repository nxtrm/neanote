
import jwt
from config import Config


def decodeToken(token):
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return decoded
    except Exception as e:
        print('Error decoding token', e)
        return None
