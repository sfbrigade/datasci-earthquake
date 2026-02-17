import os

if __name__ == "__main__":
  print(os.getenv('ENVIRONMENT', 'hahaoops'))
  if (os.getenv('NEON_URL')):
    i = os.getenv('NEON_URL').index('https')
    print(f'i = {i}')
  else:
    print('neon doesnt exist')
    
