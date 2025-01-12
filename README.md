# Mi Band/Amazfit OSC Heart Rate Monitor for VRChat [with UART]

![image](https://i.imgur.com/J6bFJ7u.png)

Originally By [Vard](https://twitter.com/VardFree)
Edited by me to support UART communication between Holtek HT32F52352 and PC

- Based on Jaapp-'s [miband-5-heart-rate-monitor](https://github.com/Jaapp-/miband-5-heart-rate-monitor) and gzalo's [miband-6-heart-rate-monitor](https://github.com/gzalo/miband-6-heart-rate-monitor).
- Thanks to [853](https://github.com/Sonic853), [Runnin4ik](https://github.com/Runnin4ik), and [Fummo](https://github.com/Fummowo) for their contributions.

---

## What is this?

This application allows you to send OSC messages and UART messages containing your heart rate data from a smartwatch/fitness tracker to your VRChat avatar or chatbox and microcontrollers. It supports three customizable heartrate parameters:

- **Heartrate**: Sends a float value ranging from `-1 to 1` (mapped to 0–255 bpm). Use this for displaying heart rate as BPM.
- **Heartrate2**: Sends a float value ranging from `0 to 1` (mapped to 0–255 bpm). Easier for controlling animations but less precise. Best for tasks like heartbeat sounds or speed-based animations.
- **Heartrate3**: Sends an integer value ranging from `0 to 255` (mapped to 0–255 bpm). Ideal for triggering specific events like switching avatars based on heart rate.

- **Sending Heart Rate to UART**: Sends formatted heart rate data (datatype str) to external UART devices if a valid serial connection is established. Useful for integrating with hardware controllers or microcontrollers.


---

## Supported Devices

Any device compatible with Amazfit or Zepp apps should work! Confirmed models include:

- Xiaomi Mi Band 4/5/6
- Amazfit Band 5/Bip S Lite

---

## Requirements

1. A Windows PC with Bluetooth 4.0 or higher.
2. A browser supporting Web Bluetooth API (e.g., [Chrome](https://google.com/chrome)).

---

## Setup and Usage

### Step 1: Obtain Your Device's Auth Key

You'll need to extract the auth key for your smartwatch/fitness tracker. Refer to:
- [FreeMyBand](https://freemyband.com/)
- [huami-token](https://github.com/argrento/huami-token) (requires Python knowledge)

### Step 2: Launch the App

1. Clone this repository and run it using Node.js. Make sure you have Node.js and npm installed on your system before launching.
    &nbsp;
    
    1.1. Clone this repository:
    ```bash
    git clone https://github.com/r926215/vrc-osc-miband-hrm.git
    cd vrc-osc-miband-hrm
    ```

    1.2. Install dependencies:
    ```bash
    npm install
    ```

    1.3. Run the application:
    ```bash
    node app.js
    ```

2. (optional) Choose the right port and baudrate for your microcontroller and click **connect UART**. <u>Connect your microcontroller before launching this app, or reload the webpage.</u>
3. Enter your auth key and click **Connect**. Ensure Bluetooth is turned off on your phone.
4. Pair your smartwatch/fitness tracker through the browser.
5. Wait ~15 seconds. Your heart rate data should now stream to VRChat (ensure OSC is enabled in the Action menu), also to UART (check the terminal output).

---

## Example Avatar Integration

An example avatar package is available: [Example_Avatar.unitypackage](https://github.com/vard88508/vrc-osc-miband-hrm/raw/main/Example_Avatar.unitypackage). It demonstrates the `Heartrate` parameter functionality. It requires RED_SIM's [Simple Counter Shader](https://patreon.com/posts/simple-counter-62864361).

---

## API Endpoints

- **List Available COM Ports**: Retrieve a list of COM ports for serial connections:
  ```
  GET /list-ports
  ```

---

## Community and Support

Have questions? Ask in the [GitHub discussions](https://github.com/vrchat-community/osc/discussions/97) or join the #avatars-osc channel in the VRChat Discord.
