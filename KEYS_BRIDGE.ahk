#NoEnv
#SingleInstance Force
#InstallKeybdHook
SetWorkingDir %A_ScriptDir%
SetKeyDelay, -1, -1

inputFile := A_ScriptDir . "\keystate.txt"

if !FileExist(inputFile) {
    FileAppend, 0000, %inputFile%
}

keyA := false
keyD := false
keyW := false
keyS := false

SetTimer, CheckKeys, 10
return

CheckKeys:
    content := ""
    FileRead, content, %inputFile%
    content := Trim(content)

    if (StrLen(content) < 4)
        return

    newA := (SubStr(content, 1, 1) = "1")
    newD := (SubStr(content, 2, 1) = "1")
    newW := (SubStr(content, 3, 1) = "1")
    newS := (SubStr(content, 4, 1) = "1")

    if (newA != keyA) {
        keyA := newA
        if (keyA)
            Send {a down}
        else
            Send {a up}
    }
    if (newD != keyD) {
        keyD := newD
        if (keyD)
            Send {d down}
        else
            Send {d up}
    }
    if (newW != keyW) {
        keyW := newW
        if (keyW)
            Send {w down}
        else
            Send {w up}
    }
    if (newS != keyS) {
        keyS := newS
        if (keyS)
            Send {s down}
        else
            Send {s up}
    }
return

Escape::
    Send {a up}{d up}{w up}{s up}
    ExitApp
return
