//// Rename current editing file
//// Переименовать текущий файл.

//Variables
var fso=new ActiveXObject("Scripting.FileSystemObject");
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var pFileFullName=AkelPad.GetEditFile(0);
var pFileName=fso.GetFileName(pFileFullName);
var pFileDir=fso.GetParentFolderName(pFileFullName);
var pNewFileFullName="";
var lpPoint64;
var lpSel;
var lpCaret;
var nCodePage;
var nBOM;
var dwFlags;
var nError;

if (hMainWnd && fso)
{
  if (!pFileFullName)
  {
    AkelPad.MessageBox(hMainWnd, GetLangString(1), WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
    WScript.Quit();
  }

  for (;;)
  {
    pFileName=AkelPad.InputBox(hMainWnd, WScript.ScriptName, GetLangString(0), pFileName);
    if (!pFileName)
      WScript.Quit();

    pNewFileFullName=pFileDir + "\\" + pFileName;
    if (pNewFileFullName == pFileFullName)
      WScript.Quit();

    if (fso.FileExists(pNewFileFullName) || fso.FolderExists(pNewFileFullName))
      AkelPad.MessageBox(hMainWnd, GetLangString(2).replace(/%s/, pNewFileFullName), WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
    else
      break;
  }

  if (lpPoint64=AkelPad.MemAlloc(_X64?16:8 /*sizeof(POINT64)*/))
  {
    if (lpSel=AkelPad.MemAlloc(_X64?56:28 /*sizeof(AESELECTION)*/))
    {
      if (lpCaret=AkelPad.MemAlloc(_X64?24:12 /*sizeof(AECHARINDEX)*/))
      {
        //Get document state
        AkelPad.SendMessage(hWndEdit, 3179 /*AEM_GETSCROLLPOS*/, 0, lpPoint64);
        AkelPad.SendMessage(hWndEdit, 3125 /*AEM_GETSEL*/, lpCaret, lpSel);
        nCodePage=AkelPad.GetEditCodePage(hWndEdit);
        nBOM=AkelPad.GetEditBOM(hWndEdit);

        //Close editing file
        if (AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4324 /*IDM_WINDOW_FILECLOSE*/, 0))
        {
          //Rename file
          try
          {
            fso.MoveFile(pFileFullName, pNewFileFullName);
          }
          catch (nError)
          {
            AkelPad.MessageBox(hMainWnd, nError.description, WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
            pNewFileFullName=pFileFullName;
          }

          //Open file
          AkelPad.OpenFile(pNewFileFullName, 0, nCodePage, nBOM);

          //Restore document position
          dwFlags=AkelPad.MemRead(lpSel + (_X64?48:24) /*AESELECTION.dwFlags*/, 3 /*DT_DWORD*/);
          AkelPad.MemCopy(lpSel + (_X64?48:24) /*AESELECTION.dwFlags*/, dwFlags | 0x808 /*AESELT_LOCKSCROLL|AESELT_INDEXUPDATE*/, 3 /*DT_DWORD*/);
          AkelPad.SendMessage(hWndEdit, 3126 /*AEM_SETSEL*/, lpCaret, lpSel);
          AkelPad.SendMessage(hWndEdit, 3180 /*AEM_SETSCROLLPOS*/, 0, lpPoint64);
        }
        AkelPad.MemFree(lpCaret);
      }
      AkelPad.MemFree(lpSel);
    }
    AkelPad.MemFree(lpPoint64);
  }
}


//Functions
function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\u041D\u043E\u0432\u043E\u0435\u0020\u0438\u043C\u044F\u003A";
    if (nStringID == 1)
      return "\u0421\u043F\u0435\u0440\u0432\u0430\u0020\u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435\u0020\u0444\u0430\u0439\u043B\u002E";
    if (nStringID == 2)
      return "\u0424\u0430\u0439\u043B \"%s\" \u0443\u0436\u0435\u0020\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442\u002E";
  }
  else
  {
    if (nStringID == 0)
      return "New name:";
    if (nStringID == 1)
      return "Save file first.";
    if (nStringID == 2)
      return "File \"%s\" already exists.";
  }
  return "";
}
