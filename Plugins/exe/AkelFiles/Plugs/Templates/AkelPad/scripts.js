﻿/**CARET**/
// === [script name] ===
// (c) 2011
//
// []
// Arguments:
//
//
// Example:
//   Call("Scripts::Main", 1, "", "")
//

var hWndEdit;
var Usage = "Usage: [...] and execute Call(\"Scripts::Main\", 1, \""+WScript.ScriptName+"\", \"\")";

function ReportError(msg, printUsage)
{
	AkelPad.MessageBox(hWndEdit, msg+(printUsage?("\n"+Usage):""), WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
	WScript.Quit();
}

if (hWndEdit = AkelPad.GetEditWnd())
{
	// check arguments
	if (!WScript.Arguments(0))
		ReportError("Expect parameter", true);

	/**CARET**/
}
