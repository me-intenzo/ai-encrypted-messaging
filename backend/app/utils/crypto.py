from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import base64

class CryptoManager:
    def __init__(self):
        self.private_key = None
        self.public_key = None
        self._load_or_generate_keys()
    
    def _load_or_generate_keys(self):
        try:
            # Try multiple key locations
            key_paths = [
                ("keys/private_key.pem", "keys/public_key.pem"),
                ("../keys/private_key.pem", "../keys/public_key.pem"),
                ("../../keys/private_key.pem", "../../keys/public_key.pem")
            ]
            
            for private_path, public_path in key_paths:
                try:
                    with open(private_path, "rb") as f:
                        self.private_key = serialization.load_pem_private_key(f.read(), password=None)
                    with open(public_path, "rb") as f:
                        self.public_key = serialization.load_pem_public_key(f.read())
                    print(f"Loaded keys from {private_path}")
                    return
                except FileNotFoundError:
                    continue
            
            # If no keys found, generate new ones
            print("No existing keys found, generating new ones")
            self._generate_keys()
            
        except Exception as e:
            print(f"Error loading keys: {e}")
            self._generate_keys()
    
    def _generate_keys(self):
        os.makedirs("keys", exist_ok=True)
        self.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.public_key = self.private_key.public_key()
        
        with open("keys/private_key.pem", "wb") as f:
            f.write(self.private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        with open("keys/public_key.pem", "wb") as f:
            f.write(self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
    
    def encrypt_message(self, message: str) -> dict:
        # Generate AES key
        aes_key = os.urandom(32)
        iv = os.urandom(16)
        
        # Encrypt message with AES
        cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
        encryptor = cipher.encryptor()
        
        # Pad message using PKCS7 padding
        message_bytes = message.encode('utf-8')
        padding_length = 16 - (len(message_bytes) % 16)
        padded_message = message_bytes + bytes([padding_length] * padding_length)
        encrypted_message = encryptor.update(padded_message) + encryptor.finalize()
        
        # Encrypt AES key with RSA
        encrypted_key = self.public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            "encrypted_message": base64.b64encode(encrypted_message).decode(),
            "encrypted_key": base64.b64encode(encrypted_key).decode(),
            "iv": base64.b64encode(iv).decode()
        }
    
    def decrypt_message(self, encrypted_data: dict) -> str:
        try:
            # Decrypt AES key with RSA
            encrypted_key = base64.b64decode(encrypted_data["encrypted_key"])
            aes_key = self.private_key.decrypt(
                encrypted_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Decrypt message with AES
            iv = base64.b64decode(encrypted_data["iv"])
            encrypted_message = base64.b64decode(encrypted_data["encrypted_message"])
            
            cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
            decryptor = cipher.decryptor()
            padded_message = decryptor.update(encrypted_message) + decryptor.finalize()
            
            # Remove padding safely
            if len(padded_message) == 0:
                raise ValueError("Empty decrypted message")
            
            padding_length = padded_message[-1]
            if padding_length > 16 or padding_length > len(padded_message):
                raise ValueError("Invalid padding")
            
            message = padded_message[:-padding_length].decode('utf-8')
            return message
            
        except Exception as e:
            print(f"Decryption error: {e}")
            raise ValueError(f"Decryption failed: {str(e)}")

crypto_manager = CryptoManager()