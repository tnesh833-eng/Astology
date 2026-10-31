import os
from PIL import Image

images_dir = 'images'

# 1. Surya Dev - center circular crop
surya = Image.open(os.path.join(images_dir, 'navagraha-surya.webp'))
# The deity is located from x=650 to x=1350, y=10 to y=760
# Let's crop a square focusing on Lord Surya
surya_crop = surya.crop((680, 20, 1340, 680))
surya_crop.convert('RGB').save(os.path.join(images_dir, 'god-navagraha-surya.jpg'), quality=95)
print('Surya Dev updated:', surya_crop.size)

# 2. Chandra Dev (Moon) - left oval crop
chandra = Image.open(os.path.join(images_dir, 'navagraha-chandra.webp'))
# Chandra deity is from x=620 to 1350, y=80 to 760
chandra_crop = chandra.crop((650, 90, 1330, 760))
chandra_crop.convert('RGB').save(os.path.join(images_dir, 'god-navagraha-chandra.jpg'), quality=95)
print('Chandra Dev updated:', chandra_crop.size)

# 3. Devguru Brihaspati (Jupiter) - right oval crop
guru = Image.open(os.path.join(images_dir, 'navagraha-guru.webp'))
# Guru is from x=720 to 1350, y=0 to 760
guru_crop = guru.crop((730, 0, 1340, 760))
guru_crop.convert('RGB').save(os.path.join(images_dir, 'god-navagraha-guru.jpg'), quality=95)
print('Guru Brihaspati updated:', guru_crop.size)

# 4. Shani Dev (Saturn)
shani = Image.open(os.path.join(images_dir, 'navagraha-shani.webp'))
shani_crop = shani.crop((720, 0, 1350, 760))
shani_crop.convert('RGB').save(os.path.join(images_dir, 'god-navagraha-shani.jpg'), quality=95)
print('Shani Dev updated:', shani_crop.size)
