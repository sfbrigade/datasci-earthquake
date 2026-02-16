import os

if __name__ == "__main__":
  print(os.getenv('ENVIRONMENT', 'hahaoops'))
  if (os.getenv('NEON_URL')):
    len = len(os.getenv('NEON_URL'))
    print(f'len = {len}')
  else:
    print('neon doesnt exist')
    
