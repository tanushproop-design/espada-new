import urllib.request
import os
import sys

assets_dir = "assets"
if not os.path.exists(assets_dir):
    os.makedirs(assets_dir)

# Map filenames to a LIST of candidate URLs
# We will try them in order until one succeeds (size > 40KB)
candidates = {
    "bot_dev.gif": [
        "https://media.tenor.com/Fw59wUf1Rj0AAAAC/terminal-lockout-hack.gif", # Verified
        "https://media.giphy.com/media/LMcB8XZwJlC49Gxe/giphy.gif"
    ],
    "exploit.gif": [
        "https://i.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif", # Verified
        "https://media.tenor.com/eB30F8z_M2UAAAAC/coding-programming.gif"
    ],
    "pentest.gif": [
        "https://upload.wikimedia.org/wikipedia/commons/c/c0/Digital_rain_animation_big_letters_red_and_white.gif", # Wiki Verified
        "https://media.giphy.com/media/13Hgw4epj8kp7q/giphy.gif" # Backup Giphy Matrix
    ],
    "audio.gif": [
        "https://media.tenor.com/Ydnt7X61pBwAAAAC/audio-spectrum-visualizer.gif", # Tenor Long
        "https://media.tenor.com/_uC9iK3Z_s0AAAAC/audio-spectrum-visualizer.gif",
        "https://media.giphy.com/media/3o7TKSjRrfPHjeHvda/giphy.gif"
    ],
    "webdev.gif": [
         "https://media.giphy.com/media/QYWdj9WoicvEk/giphy.gif", # Giphy Server
         "https://media.tenor.com/GfG8q93-1X8AAAAC/server-room.gif",
         "https://media.tenor.com/On7jKqS9rMQAAAAC/web-development.gif"
    ],
    "discord.gif": [
         "https://media.giphy.com/media/XP4vPO869OOP6/giphy.gif", # Giphy Network
         "https://media.tenor.com/Q2v-1-1-1-1-1/network.gif",
         "https://media.tenor.com/u1w5_y5_uOAAAAAC/network-connection.gif"
    ]
}

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]
urllib.request.install_opener(opener)

def download_file(filename, urls):
    filepath = os.path.join(assets_dir, filename)
    
    for url in urls:
        print(f"Trying {url} for {filename}...")
        try:
            urllib.request.urlretrieve(url, filepath)
            size = os.path.getsize(filepath)
            print(f"  -> Downloaded {size} bytes.")
            
            # Check if it's a valid GIF size (> 40KB to avoid errors/placeholders)
            if size > 40000:
                print(f"  [SUCCESS] {filename} secured from {url}")
                return True
            else:
                print(f"  [FAIL] File too small ({size} bytes). Likely placeholder/error.")
        except Exception as e:
            print(f"  [ERROR] {e}")

    print(f"[CRITICAL] Failed to download valid GIF for {filename} from any source.")
    return False

success_count = 0
for filename, url_list in candidates.items():
    if download_file(filename, url_list):
        success_count += 1

print(f"\nSummary: {success_count}/{len(candidates)} GIFs downloaded successfully.")
