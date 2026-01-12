import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server!")
    # Subscribe to a pet
    sio.emit('subscribe_pet', {'pet_id': 1})

@sio.event
def status(data):
    print('Status:', data)

@sio.event
def live_reading(data):
    print('Received reading:', data)
    # Stop after receiving one reading to prove it works
    sio.disconnect()

@sio.event
def disconnect():
    print("Disconnected from server")

if __name__ == '__main__':
    try:
        sio.connect('http://localhost:5000')
        print("Waiting for messages...")
        sio.wait()
    except Exception as e:
        print(f"Connection failed: {e}")
