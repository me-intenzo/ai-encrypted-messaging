#!/usr/bin/env python3
"""
Script to regenerate encryption keys to fix decryption issues
"""

import os
import sys
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def regenerate_keys():
    """Regenerate RSA key pair"""
    print("Regenerating RSA key pair...")
    
    # Generate new private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()
    
    # Create keys directory if it doesn't exist
    os.makedirs("keys", exist_ok=True)
    
    # Save private key
    with open("keys/private_key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))
    
    # Save public key
    with open("keys/public_key.pem", "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ))
    
    print("[OK] New keys generated successfully!")
    print("Keys saved to:")
    print("   - keys/private_key.pem")
    print("   - keys/public_key.pem")
    print("\n[WARNING] Note: This will make existing encrypted messages unreadable.")
    print("   Only do this if you're experiencing decryption issues.")

if __name__ == "__main__":
    regenerate_keys()