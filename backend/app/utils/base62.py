BASE62_ALPHA = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(num: int) -> str:
    if(num == 0):
        return BASE62_ALPHA[0]
    
    base = len(BASE62_ALPHA)
    encoded = []
    
    while num > 0:
        num, remainder = divmod(num, base)
        encoded.append(BASE62_ALPHA[remainder])
        
    return "".join(reversed(encoded))
