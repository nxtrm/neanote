import bcrypt

# Plaintext password
plaintext_password = "123Asd!@"

# Generate a bcrypt hash
hashed_password = bcrypt.hashpw(plaintext_password.encode('utf-8'), bcrypt.gensalt())

# Print the hashed password
print(hashed_password.decode('utf-8'))