import subprocess
import time
import os
import sys

# Paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MOBILE_DIR = os.path.join(ROOT_DIR, 'mobile-app')
DASHBOARD_DIR = os.path.join(ROOT_DIR, 'vet-dashboard')

def cleanup():
    print("Cleaning up old sessions...")
    try:
        # 1. Close specific Command Prompt windows by Title
        # We use /FI "WINDOWTITLE eq ..." to target only our windows
        subprocess.run('taskkill /F /FI "WINDOWTITLE eq Backend Server*" /T', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run('taskkill /F /FI "WINDOWTITLE eq Mobile App*" /T', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run('taskkill /F /FI "WINDOWTITLE eq Vet Dashboard*" /T', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        print("   -> Old sessions terminated.")
    except Exception as e:
        print(f"   -> Warning during cleanup: {e}")

def open_terminal(command, title, cwd=None):
    if cwd is None:
        cwd = ROOT_DIR
    
    # Add title command to set window title explicitly for tracking
    cmd_with_title = f'title {title} && {command}'
    
    print(f"Starting {title}...")
    subprocess.Popen(
        f'start "{title}" cmd /k "{cmd_with_title}"', 
        shell=True, 
        cwd=cwd
    )

if __name__ == "__main__":
    cleanup()
    
    print("=============================================")
    print("=============================================")
    print("   Pet Health System 3.0 - PROFESSIONAL ")
    print("   (Lucide Icons + Linear Design)")
    print("=============================================")
    
    # 1. Start Backend
    print("\n[1/3] Launching Flask Backend...")
    open_terminal("python app.py", "Backend Server (Port 5000)")
    time.sleep(3) # Give backend a moment to initialize
    
    # 2. Start Mobile App (Web)
    print("[2/3] Launching Mobile App (Expo)...")
    # -c clears cache
    open_terminal("npx expo start --web -c", "Mobile App (Port 8081)", cwd=MOBILE_DIR)
    
    # 3. Start Vet Dashboard
    print("[3/3] Launching Vet Dashboard (Vite)...")
    # --force clears vite cache
    open_terminal("npm run dev -- --force", "Vet Dashboard (Port 5173)", cwd=DASHBOARD_DIR)
    
    print("\n[OK] System Launch Initiated!")
    print("-----------------------------------")
    print("Backend API:   http://localhost:5000")
    print("Mobile App:    http://localhost:8081")
    print("Vet Dashboard: http://localhost:5173")
    print("-----------------------------------")
    print("Minimizing this window in 5 seconds...")
    time.sleep(5)
