# property ApplicationLib : load script POSIX file "ApplicationLib.scpt"

on ApplicationIsRunning(appName)
	tell application "System Events" to set appNameIsRunning to exists (processes where name is appName)
	return appNameIsRunning
end ApplicationIsRunning

on IsRunning()
	tell ApplicationLib
		return ApplicationIsRunning("Music")
	end tell
end IsRunning

on IsPlaying()
	#tell ApplicationLib
	if ApplicationIsRunning("Music") then
		tell application "Music"
			return player state is playing
		end tell
	else
		return false
	end if
	#end tell
end IsPlaying

on GetCurrentTrack()
	if IsPlaying() then
		tell application "Music"
			if not (exists current track) then return null
			set trackName to (get name of current track)
			set trackArtist to (get artist of current track)
			set trackAlbum to (get album of current track)
			return "{\"name\":\"" & trackName & "\",\"artist\":\"" & trackArtist & "\",\"album\":\"" & trackAlbum & "\"}"
		end tell
	else
		return "null"
	end if
end GetCurrentTrack

on PausePlaying()
	if IsRunning() then
		tell application "Music"
			pause
		end tell
	end if
	return "{\"ok\":true}"
end PausePlaying

on StartPlaying()
	tell application "Music"
		launch
		play
	end tell
	return GetCurrentTrack()
end StartPlaying

on StopPlaying()
	if IsRunning() then
		tell application "Music" to stop
	end if
	return "{\"ok\":true}"
end StopPlaying

on PlayNextTrack()
	if not IsRunning() then
		tell application "Music"
			activate
		end tell
	end if
	tell application "Music"
		next track
	end tell
	StartPlaying()
end PlayNextTrack

on PlayPreviousTrack()
	if not IsRunning() then
		tell application "Music"
			activate
		end tell
	end if
	tell application "Music"
		previous track
	end tell
	StartPlaying()
end PlayPreviousTrack

on FadeOut()
	if IsRunning() and IsPlaying() then
		tell application "Music"
			set originalVol to sound volume
			set currentVol to sound volume
			repeat with currentVol from sound volume to 0 by -1
				set sound volume to currentVol
				delay 0.02
			end repeat
		end tell
		StopPlaying()
		tell application "Music"
			set sound volume to originalVol
		end tell
	end if
end FadeOut

on FadeIn()
	if not IsRunning() then
		tell application "Music"
			activate
		end tell
	end if
	if not IsPlaying() then
		tell application "Music"
			set originalVol to sound volume
			set currentVol to 0
			set sound volume to 0
			play
			repeat with currentVol from 0 to originalVol by 1
				set sound volume to currentVol
				delay 0.02
			end repeat
		end tell
		return GetCurrentTrack()
	end if
end FadeIn

on run argv
	set command to item 1 of argv
	if command is "currenttrack" then
return GetCurrentTrack()
	else if command is "play" then
		StartPlaying()
	else if command is "pause" then
		PausePlaying()
	else if command is "stop" then
		StopPlaying()
	else if command is "next" then
		PlayNextTrack()
	else if command is "previous" then
		PlayPreviousTrack()
	else if command is "fadeout" then
		FadeOut()
	else if command is "fadein" then
		FadeIn()
	else
		return "{\"error\":\"Unsupported command\"}"
	end if
end run