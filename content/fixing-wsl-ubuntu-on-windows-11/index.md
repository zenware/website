+++
date = "2024-11-24"
title = "Fixing WSL Ubuntu on Windows 11 Insider Preview"
[extra]
toc = true
+++

I've had an issue for a month or so where WSL hasn't been working right, but I've been working around it by getting more comfortable with PowerShell, doing a substantial amount of stuff over SSH to a DigitalOcean Droplet, doing work on other (Linux) computers in the house, and as a last resort... doing development work in raw Windows. It's a bit less painful that I thought it would be, especially for languages like Python, Go, and Rust.

What I've missed the most is the ability to run k8s with Rancher Desktop and the ability to try out new things like Podman. I'm finally getting around to fixing it, and what follows is basically a summary of what I learned, and then a stream of consciousness of what I did to fix it.

## TLDR
TLDR of things I learned while looking into this issue:
- Hyper-V
	- Windows / Hyper-V Firmware Signatures typically expire on 9/15
	- You can workaround an outdated Hyper-V firmware signature by manually setting the datetime to something before it expired
- Windows Update
	- This tool can lie to you and get stuck in states where the main fix is to turn off all the relevant services, clear their caches, and turn the services back on.
- Windows Error Codes
	- Some of these have substantial first-party documentation with detailed troubleshooting steps and explanations
	- Some have no first-party documentation, but sometimes a kind internet user with "-MSFT" at the end of their username on a Microsoft forum will say "do these actions to fix it" and not explain why.
- Windows Performance Analyzer
	- This tool exists, and can be used to read ETL files.
	- It's a bit tricky to read, but it can give you insight into which Windows source files are causing a problem, but you still can't read the code to figure it out for yourself.
- microsoft/WSL on Github
	- Provides a nice library of diagnostic/log collection PowerShell scripts you can use to dig deeper into things.
	- Sometimes people have reported and had the same issue as you already fixed so you can just borrow the solution from there.


## Initial Diagnostic Efforts
When attempting to run WSL Ubuntu I get the following message
```powershell
Invalid Signature.
Error code: Wsl/Service/CreateInstance/CreateVm/HCS/0x80090006

[process exited with code 4294967295 (0xffffffff)]
You can now close this terminal with Ctrl+D, or press Enter to restart.
```

Some Diagnostic Efforts:

```powershell
(base) PS C:\Users\jayml> wsl --help
Output Omitted for Brevity

(base) PS C:\Users\jayml> wsl --status
Default Distribution: Ubuntu
Default Version: 2

(base) PS C:\Users\jayml> wsl --version
WSL version: 2.3.26.0
Kernel version: 5.15.167.4-1
WSLg version: 1.0.65
MSRDC version: 1.2.5620
Direct3D version: 1.611.1-81528511
DXCore version: 10.0.26100.1-240331-1435.ge-release
Windows version: 10.0.26217.5000
```


```powershell
winver
```
![Image of the program that runs when you call the winver program](Pasted%20image%2020241124163848.png "winver GUI")

## Collecting & Peeping WSL Logs
Not seeing anything super useful or how to get logs from the help I found a guide from Microsoft [Troubleshooting Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting) and two existing Github Issues on the microsoft/WSL project. I did skim the issues to see what was going on, but I didn't thoroughly read them at first because I want to see how far I can get in working it out myself. (with help from documentation :D)
- [Ubuntu stopped working with code 0x80090006](https://github.com/microsoft/WSL/issues/12036)
- [WSL suddenly stopped working error code - Error: 0x80090006 Invalid Signature.](https://github.com/microsoft/WSL/issues/10486)

Microsoft has a bot that explains how to get the logs by running a remote Powershell script as admin

![The microsoft-github-policy service bot leaves a comment on a github issue about how to collect WSL logs.](Pasted%20image%2020241124164942.png "microsoft-github-policy-service comment")

Copy & Paste-able text here for ease of use if you need it:
```powershell
Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/microsoft/WSL/master/diagnostics/collect-wsl-logs.ps1" -OutFile collect-wsl-logs.ps1
Set-ExecutionPolicy Bypass -Scope Process -Force
.\collect-wsl-logs.ps1
```
And the output from actually running it:
```powershell
Log collection is running. Please reproduce the problem and once done press any key to save the logs.
Saving logs...
100%  [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>]
Logs saved in: C:\Users\jayml\WslLogs-2024-11-24_16-52-02.zip. Please attach that file to the GitHub issue.
```

That lead me to a nice collection of diagnostic scripts in [microsoft/WSL/blob/master/diagnostics](https://github.com/Microsoft/WSL/blob/master/diagnostics/) which could be useful in the future :)

I want to poke around in the log file and see if I can figure out what's going on before I finish reading the GitHub issues.

After unzipping it I get the following directory:
```powershell
(base) PS C:\Users\jayml\WslLogs-2024-11-24_16-52-02\WslLogs-2024-11-24_16-52-02> ls

    Directory: C:\Users\jayml\WslLogs-2024-11-24_16-52-02\WslLogs-2024-11-24_16-52-02

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-----          11/24/2024  4:52 PM            650 acl.txt
-----          11/24/2024  4:52 PM           1670 appxpackage.txt
-----          11/24/2024  4:52 PM           2562 bcdedit.txt
-----          11/24/2024  4:52 PM           1356 HKCU.txt
-----          11/24/2024  4:52 PM           1582 HKLM.txt
-----          11/24/2024  4:52 PM        3670016 logs.etl
-----          11/24/2024  4:52 PM          16930 optional-components.txt
-----          11/24/2024  4:52 PM           3038 P9NP.txt
-----          11/24/2024  4:52 PM       30353928 windows-version.txt
-----          11/24/2024  4:52 PM         210532 Winsock2.txt
-----          11/24/2024  4:52 PM            160 wpr.txt
-----          11/24/2024  4:52 PM           9342 wsl.wprp
-----          11/24/2024  4:52 PM            990 wslservice.txt
-----          11/24/2024  4:52 PM            360 wslsupport-impl.txt
-----          11/24/2024  4:52 PM            574 wslsupport-proxy.txt
```

Not wanting to look through all the files individually I tried "grepping" for a handful of different things until I found the following
```powershell
(base) PS C:\Users\jayml\WslLogs-2024-11-24_16-52-02\WslLogs-2024-11-24_16-52-02> Get-ChildItem -Path "." | Select-String -Pattern "CreateVm"

logs.etl:381:�
@@
44Microsoft.Windows.Lxss.Manager␦sPOω�G�����v�8
))CreateVmBeginwslVersionPart
A_PrivTags
```

It's clear there's some non-printable/binary sequences going on in that `.etl` file, and I only know ETL as Extract-Transform-Load, so I wasn't really sure what this was or how to open it.

## Windows Performance Analyzer?

Once again Microsoft docs pull through with [Opening and Analyzing ETL Files in WPA](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/opening-and-analyzing-etl-files-in-wpa) a tool that I had never heard of until now.

After opening the ETL file in WPA (Windows Performance Analyzer) it looks like this

![WPA Software showing a mostly blank screen, and that the logs.etl file is loaded](Pasted%20image%2020241124171100.png "I guess this is how you use WPA")

So I need to click around a bit and get my bearings.

I had to double click on the "System Activity" section of "Graph Explorer - logs.etl" to get it to start showing more useful looking stuff.

![Screenshot of WPA software no-longer showing a mostly blank screen, and instead showing a series of events, with what seems to be timestamps, and tables of relevant data. Event Providers, Task Names, Opcode Numbers, Process, etc.](Pasted%20image%2020241124171258.png "This actually has a trace view, and probably more details than I know how to read.")


There is a search function that lets me search for CreateVm

![Screenshot showing WPA software with a search box containing the text "CreateVm" and it auto-highlighting the "CreateVmBegin" event in the top-left pane of WPA called "Series", as well as highlighting a line in the bottom pane which is the table containing OpCodes, etc.](Pasted%20image%2020241124171516.png "It does feel like I'm getting somewhere with this...")

I can see some source files and line numbers where things might be going wrong, but I have no way of actually inspecting that code to see what's happening.

![Cropped-in screenshot of the table in WPA showing three rows, the top two contain a path to a source file "C:\_w\s\src\windows\common\WslClient.cpp" and line numbers 2126 and 669 respectively and the third row is truncated, but would show the full name of the error msg "Wsl/Service/CreateInstance/CreateVm/HCS/0x800900..."](Pasted%20image%2020241124172111.png "If this was Linux I would be able to inspect the code... :(")

There even seems to be an error while attempting to find the error message
```
winrt::hresult_error: The text associated with this error code could not be found.
```

I was able to poke through and find ever-so-slightly more specific details like the following:
```
onecore\vm\dv\chipset\bios\biosdevice.cpp(411)\vmchipset.dll!00007FFE0C4D91FF: (caller: 00007FF66009D42E) ReturnHr(1) tid(18f8) 80090006 Invalid Signature.  
   Msg:[onecore\vm\common\guestloader\lib\vmfirmwareloader.cpp(79)\vmchipset.dll!00007FFE0C44CA46: (caller: 00007FFE0C47FA9F) Exception(1) tid(18f8) 80090006 Invalid Signature.  
   Msg:[signature state 2]  
]
```

![Another screenshot of the table view showing more file names and line numbers with callers and exception Ids, all with the same human readable error message "Invalid Signature."](Pasted%20image%2020241124172537.png "More code I unfortunately cannot inspect, with error codes that don't return google results.")

## Revisiting GitHub Issues
I just don't seem to be able to trace it to an actual cause, so basically I'm stuck. Although I got a much deeper peek into how Windows is working under the hood than I ever remember being possible. At this point it's back to review the issues filed on Github.

Someone (Microsoft Employee?) suggests that `cmfirmwareloader.cpp:79 "signature state 2"`  means that the Hyper-V Firmware is expired.

![Comment from Github User OneBlue that says "Looking at the logs you share the root cause seems to be that the hyper-V firmware expired" and "The easiest way to resolve this would be to update Windows to get a more recent Hyper-V firmware image."](Pasted%20image%2020241124172951.png "Thanks OneBlue, I'll try that.")

And someone else suggested that manually setting the time to a date prior to what shows up in the `winver` command will allow it to work.

![A set of comments from github users gandyli and rty813. gandyli writes "@rty813 I tried manually gange the system time so that it's before the expiration date showed in the command 'winver', and it worked." and rty813 replies ":D it's indeed a viable temporary solution"](Pasted%20image%2020240801173416.png "Time to check if this is true. Which if it is a signature validation issue, won't be suprising")

Which... appears to be true when I tried it.

![Shows a carefully arranged screenshot where you can see WSL is running in a terminal with the output of a pwd command, and the winver GUI and the time settings app are overlayed on top of it so you can see the winver expiration is 9/15/2024 and the time settings are manually configured to August 1, 2024](Pasted%20image%2020240801173516.png "*hacker voice* I'm in.")

Although I do have a Canary update available that I'm going to try and install and see if that works!
```
Windows 11 Insider Preview 27729.1000 (rs_prerelease)
```

After rebooting it seems the update didn't take.... If I check my update history, there's actually several failed attempts to install this update

![Screenshot of the Windows Update history showing several previous instances of of an error, the earliest being "Failed to install on 8/1/2024 - 0xc1900101"](Pasted%20image%2020241124183256.png "So... it would seem this has been going on for a while.")

## Fixing Windows Update


Looking up the code `0xc1900101` I found the following two sources from Microsoft
- [Get help with Windows upgrade and installation errors](https://support.microsoft.com/en-us/windows/get-help-with-windows-upgrade-and-installation-errors-ea144c24-513d-a60e-40df-31ff78b3158a)
- [Windows 10 upgrade resolution procedures](https://learn.microsoft.com/en-us/troubleshoot/windows-client/setup-upgrade-and-drivers/windows-10-upgrade-resolution-procedures#0xc1900101)

One of them said to check these some logs in `C:\$WINDOWS.~BT\Sources\Rollback` for an extended error code, to get more specific with it, but the exact file wasn't actually located in that directory so I couldn't do that.

### The Checklist

Both seem to indicate that it's likely an issue with an incompatible driver. And recommend the following steps.
- [x] Have 20GB Free for Updating a 64-bit OS
- [x] Run Windows Update a few times
- [x] Check third-party drivers and download any updates
- [x] Unplug Extra Hardware
- [x] Check Device Manager for Errors
- [x] Remove third-party Security Software
- [x] Repair Hard Drive Errors `chkdsk/f C:` (from cmd.exe)
- [ ] Do a Clean Restart into Windows
- [x] Restore and Repair System Files `dism /Online /Cleanup-Image /Restorehealth`

(I'm returning back to this checklist and checking off items as I do them, in all it took me around an hour to go through everything. Clean restart turned out to be unnecessary in this case.)

I've used DISM before, and I know it can be running for quite a while, so I'm going to kick it off in the background while I start doing the other checklist items.

### Updating Drivers & Checking for Errors in Device Manager

Since I can use device manager for Checking and Updating Drivers, as well as looking for errors (and it keeps me from bending over to unplug things for a few moments longer) that's where I'll start.

Weirdly when I tried to launch it both from the "Start Menu", and Win+R Run as `devmgmt.msc` I get blocked by UAC claiming "An Administrator has blocked you from running this app" which, since I am the administrator is... *highly suspicious*, especially since I checked the settings by viewing the Properties of that file in System32.

TODO: Insert photo taken from phone because I can't screenshot UAC prompts in any meaningful way.

I was able to launch it successfully from an Admin PowerShell and I don't see any errors or updates right away, but one of the first things I notice is that I have VoiceMeeter installed and I haven't used that in a few years so I figure I can go ahead and remove it. Both through the Uninstall Apps feature, and Driver-by-Driver if I have to. (I didn't have to, using the uninstaller cleared up all the drivers.)

![List of Audio inputs and outputs devices as shown by windows devmgmt.msc with a collection of devices near the bottom named with prefixes that start with "VoiceMeeter "](Pasted%20image%2020241124185901.png "This is such a niche tool that I've used only a handful of times.")

Also noticed there are some Bluetooth drivers for devices that I still have but haven't used with this system in a number of years, so I'm removing those as well. From things like Aftershokz or Beats headphones that I use in other contexts. They showed up under "Bluetooth" and "Sound, video and game controllers" and "System devices" with slightly different, but recognizably similar names.

After clearing all that out and rescanning, still no errors or updates, and DISM completed in the background. Now I'm checking for any 3rd-party security software before I start unplugging anything.

### Uninstalling Third-Party Security Software
`winget list` is a convenient way to list all the installed packages even if they aren't managed by winget. Running that command and skimming the list I found the following that could be described as "third-party security software":

```txt
- Bitwarden 2024.10.1
- Mullvad VPN 2023.3.0
- OWASP Zed Attack Proxy 2.13.0
- RustDesk 1.1
- qFlipper 1.3.3
- KeePassXC 2.7.7
- Malwarebytes version 4.6.17.334
- Tailscale 1.76.6
- OpenSC smartcard framework (64bit) 0.22.0.0
- sniffnet 1.2.2
- TightVNC 2.8.59.0
- Angry IP Scanner 3.8.2
- Mudfish Cloud VPN v5.7.6
- Npcap 1.78
- OSSEC HIDS 3.7.0
- Portmaster 0.8.8.1
- TeamViewer 15.51.6
- Wireshark 4.2.5 x64
- YubiKey Manager 1.2.4
- Tactical RMM Agent 1.8.0
- STIG Viewer 3 (Machine) 3.3.0
- BleachBit 4.4.2.2142 (current user) 4.4.2.2142
- mitmproxy 11.0.0.0
```

I also noticed some other potentially relevant software (as-in "could easily have outdated drivers")

```txt
- X56 H.O.T.A.S 8.0.213.0
- ASIO4ALL 2.15
- Peace 1.6.4.1
- Equalizer APO 1.2.1
- OnePlus USB Drivers 1.00
- Samsung Data Migration 4.0.0.18
- Qualcomm USB Drivers For Windows 1.00.57
```

Some of these tools I'm actively using, some of these tools I haven't used in a long time, and some of these tools I'm happy to forget about or install again if it turns out I need them. So I'll start uninstalling and record what I've removed here.

```txt
- X56 H.O.T.A.S.
- ASIO4ALL, Peace, EqualizerAPO (All Audio Software)
- OnePlus & Qualcomm USB Drivers
- Mudfish Cloud VPN (removed a TAP-Win32 Adapter V9 driver while uninstalling)
- RustDesk, TeamViewer, TightVNC, Tactical RMM Agent
- OSSEC HIDS, Sniffnet, OWASP ZAP, mitmproxy
- Malwarebytes
```

After removing those I ran another `winget list` to skim through as a check, and it looks good to me, I know there are still software installed with third party drivers e.g. Wireshark+Npcap, but I'm unwilling to uninstall them unless it's actually as a last resort.

### Repairing Hard Drive Errors
At this point I decided to drop into a `cmd.exe` from the Admin PowerShell to repair hard drive errors, since I figured that was something I could do before unplugging things as well... and I discovered that I can't check the disk while another process is using it, which means this can only occur during reboot.

```powershell
(base) PS C:\Users\jayml> cmd
Microsoft Windows [Version 10.0.26217.5000]
(c) Microsoft Corporation. All rights reserved.

C:\Users\jayml>chkdsk/f C:
The type of the file system is NTFS.
Cannot lock current drive.

Chkdsk cannot run because the volume is in use by another
process.  Would you like to schedule this volume to be
checked the next time the system restarts? (Y/N) Y

This volume will be checked the next time the system restarts.
```

### Finally unplugging devices
May as well unplug some devices now. When I checked, all that I have plugged in that's accessible from outside the chassis was the following:
- Keyboard
- Mouse
- Microphone
- YubiKey
- 2x Display Port Monitors
I keep my webcam unplugged because I use it infrequently.

So I unplugged the Microphone and YubiKey, since I need the Mouse & Keyboard to actually do anything else.

Gonna "Restart Now" from Windows Update and see if the update or `chkdsk` takes.. And it turns out the chkdsk did start scanning the drive while rebooting. So far I’ve seen Stage 1 but I missed the name and can’t find the names of the stages online and “Fixing (C:) Stage 2” I’m not actually certain whether that implies any errors or if it always says that.

### Still doesn't work, but yay new error code!

This time it did finish booting rather than hanging at the splash screen. But, there was still an error when attempting to install the update, this time a new error code `0x80248007` AKA "We made progress!" 

The same page listing details for the `0xc1900101` error code also lists some `0x8024` error codes but not the exact one I'm seeing. When searching I can't find a completely clear first-party source that explains what this error code `0x80248007` means and exactly how to fix it. However I did find on the [Microsoft Learn Forum](https://learn.microsoft.com/en-us/answers/questions/1370761/how-to-fix-windows-update-error-code-0x80248007) someone asked a question about it, and user AllenLiu-MSFT left an answer which I cannot figure out how to permalink directly to, but it contains the following advice.

1. Run the Windows Update Troubleshooter
2. Clear the Windows Update Cache
3. Reset the Windows Update Components
4. Perform a clean boot and then try to install the update
5. Manually download and install the update from the Microsoft Update Catalog

For running the Windows Update troubleshooter their recommended path is
"Settings > Update & Security > Troubleshoot > Additional troubleshooters > Windows Update > Run the troubleshooter"
...following that breadcrumb trail fails for me instantly as the path I take is
"Settings > Windows Update > ???"
There's a "Get Help" button which takes me to a blank white screen...
But under Windows Update if I go to "> Advanced Options > Recovery" I have a "Fix problems without resetting your PC" option, which seems to be a troubleshooter of some kind. Although I can now see it has taken me to a totally different place called "Settings > System > Recovery" and this gives me an "Other troubleshooters" option that I can use to launch the "Windows Update Troubleshooter" which actually does appear to take me to the "Get help" screen I originally saw, except now it's a search box, and it's asking me to sign in.

![Screenshot of the "Get Help" Window that shows a search for "Run the Windows Update Troubleshooter" in the background with a Microsoft "Sign in" popup blocking the useful bits of it.](Pasted%20image%2020241124201655.png "Hopefully this does something useful.")

I am able to sign in and run it, but the actual tool itself failed to run.

![Screenshot of the results of running the troubleshooter, it reads "The Windows Update diagnostic failed to run I'm sorry I was unable to run the Windows Update diagnostic. I might need to transfer you to an agent to help solve your problem. Would you like to talk to agent?" and presents two buttons "Yes" and "No"](Pasted%20image%2020241124201759.png "It does not do something useful.")

I don't really want to hand off to an agent (even though I know I won't change my mind about this I'm leaving the window open in the background just in case) so... 

### Clearing the Windows Update Cache (This actually fixed things!)
Moving down the list to "Clear the Windows Update Cache", which AllenLiu-MSFT recommends running the following from an Administrator Command Prompt.
```shell
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver
ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old
net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

This "removes" those two files from where the Windows Update service looks for them by renaming them, this is presumably so we could restore them if desired. It also stops and starts the following:
- Windows Update service
- Cryptographic Services service
- Background Intelligent Transfer Service service
- Windows Installer service

It might not mean anything but after stopping `wuauserv` and `cryptSvc` both `bits` and `msiserver` reported that they were not started. When I went to start everything again they seem to have started just fine. It's possible those service processes die when they don't have one or both of the Update or Cryptographic service running.

Since we ran those commands I'm going to hit the Retry button in Windows Update and see how it goes.

It returned a ton of new update packages that weren't available before including a slightly newer preview build `Windows 11 Insider Preview 27754.1000 (rs_prerelease)` I have high hopes for the install succeeding this time, but I'm willing to keep moving through AllenLiu-MSFT's list until it works :D

![Screenshot of the Windows Update screen that displays a series of updates for Windows itself, PowerShell, etc. In various stages of download progress.](Pasted%20image%2020241124202719.png "My confidence is waxing.")

Most of those downloaded and installed successfully and now I get to restart again and see if the Windows 11 Update works this time..

![Slightly taller screenshot of the Windows Update screen that includes the "Restart now" button and shows that all the updates are either marked "Completed" or "Pending restart"](Pasted%20image%2020241124210609.png "I think it's gonna work!")

### It's Alive!

After rebooting it does actually seem to be applying updates this time, that’s another new thing! And once fully rebooted wSinver shows that the Eval copy expires `9/15/2025` and WSL/Ubuntu properly loads while automatically set to the current datetime.

![Screenshot of WSL running in terminal with the winver GUI arranged on top of it so you can see the new expiration date 9/15/2025](Pasted%20image%2020241124214137.png "It worked! Now I can do Docker/k8s/Podman stuff again. And build a custom WSL/NixOS image.")

After all this there does appear to still be a DNS resolution issue in WSL/Ubuntu, but I don't actually need DNS resolution for what I wanted this for, so that will be for future me to figure out when I need it.

Also, happy to report that I'm now able to run `devmgmt.msc` through both the Start Menu and Win+R without an unwelcome visit from the UAC fairies.

It's unrelated but a little bit curious that during this investigation my WiFi Router/Switch reported that the internet was disconnected, but my connection appeared to be working fine.

![Screenshot showing a small bit of my routers webpage that reads "Internet status: Disconnected", on the left there's a classical "globe icon" representing the internet, and on the bottom there's a red x representing the lack of connectivity.](Pasted%20image%2020241124194741.png "So I'm not connected but I'm also testing as 800Gb down...")
