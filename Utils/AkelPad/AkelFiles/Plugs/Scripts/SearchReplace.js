//// Search and replace using regular expressions.
//
// Example for "Replace with function" option:
//   What: \d+
//   With: parseInt($0) + 1;
// Or
//   What: \d+
//   With: var n = parseInt($0); return n >= 20 ? 20 : ++n;
//
//
//// Поиск/замена с использованием регулярных выражений.
//
// Пример опции "Заменять на функцию":
//   Что: \d+
//   Чем: parseInt($0) + 1;
// или
//   Что: \d+
//   Чем: var n = parseInt($0); return n >= 20 ? 20 : ++n;

//Options
var bShowCountOfChanges=true;
var nSearchStrings=10;

//Buttons
var BT_FINDNEXT   =1;
var BT_REPLACE    =2;
var BT_REPLACEALL =3;

//Direction
var DN_DOWN      =0x00000001;
var DN_UP        =0x00000002;
var DN_BEGINNING =0x00000004;
var DN_SELECTION =0x00000008;
var DN_ALLFILES  =0x00000010;

//Control IDs
var IDC_FIND           =1001;
var IDC_REPLACE        =1002;
var IDC_TEMPLATE       =1003;
var IDC_MATCHCASE      =1004;
var IDC_MULTILINE      =1005;
var IDC_ESCAPESEQ      =1006;
var IDC_FUNCTION       =1007;
var IDC_FORWARD        =1008;
var IDC_BACKWARD       =1009;
var IDC_BEGINNING      =1010;
var IDC_INSEL          =1011;
var IDC_ALLFILES       =1012;
var IDC_FIND_BUTTON    =1013;
var IDC_REPLACE_BUTTON =1014;
var IDC_ALL_BUTTON     =1015;
var IDC_CANCEL         =1016;
var IDC_STATIC         =-1;

//String IDs
var STRID_LOWJSCRIPT   =0;
var STRID_WHAT         =1;
var STRID_WITH         =2;
var STRID_ADD          =3;
var STRID_RENAME       =4;
var STRID_DELETE       =5;
var STRID_NAME         =6;
var STRID_MATCHCASE    =7;
var STRID_MULTILINE    =8;
var STRID_ESCAPESEQ    =9;
var STRID_FUNCTION     =10;
var STRID_DIRECTION    =11;
var STRID_FORWARD      =12;
var STRID_BACKWARD     =13;
var STRID_BEGINNING    =14;
var STRID_INSEL        =15;
var STRID_ALLFILES     =16;
var STRID_FINDNEXT     =17;
var STRID_REPLACE      =18;
var STRID_REPLACEALL   =19;
var STRID_CANCEL       =20;
var STRID_SYNTAXERROR  =21;
var STRID_FINISHED     =22;
var STRID_COUNTFILES   =23;
var STRID_COUNTCHANGES =24;
var STRID_TEMPLATE1    =25;
var STRID_TEMPLATE2    =26;
var STRID_TEMPLATE3    =27;

//Maximum selection length
var PUTFIND_MAXSEL  =16384;

//Dialog messages
var AKDLG_PUTFIND   =1025;  //WM_USER + 1

//Dialog resize
var DRS_SIZE =0x1;  //Resize control
var DRS_MOVE =0x2;  //Move control
var DRS_X    =0x4;  //X value
var DRS_Y    =0x8;  //Y value

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var oSys=AkelPad.SystemFunction();
var oSet=AkelPad.ScriptSettings();
var pScriptName=WScript.ScriptName;
var hInstanceDLL=AkelPad.GetInstanceDll();
var bAkelEdit=AkelPad.IsAkelEdit();
var pClassName="AkelPad::Scripts::" + pScriptName + "::" + oSys.Call("kernel32::GetCurrentProcessId");
var hWndDialog;
var hWndStatic;
var hWndWhat;
var hWndWith;
var hWndTemplate;
var hWndCase;
var hWndGlobal;
var hWndMultiline;
var hWndEscSequences;
var hWndReplaceFunction;
var hWndGroup1;
var hWndGroup2;
var hWndDown;
var hWndUp;
var hWndBeginning;
var hWndSelection;
var hWndAllFiles;
var hWndFindButton;
var hWndReplaceButton;
var hWndReplaceAllButton;
var hWndCancel;
var hWndFocus;
var ptScale=[];
var rcMinMaxDialogRect=[];
var rcCurrentDialogRect=[];
var drs=[];
var hGuiFont;
var lpBuffer;
var lpSearchBuffer;
var pFindIt="";
var pReplaceWith="";
var pReplaceWithEsc;
var lpFindStrings=[];
var lpReplaceStrings=[];
var lpTemplates=[];
var bSensitive=false;
var bMultiline=false;
var bEscSequences=false;
var bReplaceFunction=false;
var nSelStart;
var nSelEnd;
var nDirection=DN_DOWN;
var nFindItLength;
var nReplaceWithLength;
var nSearchResult;
var nButton=0;
var i;

if (hMainWnd)
{
  if (AkelPad.WindowRegisterClass(pClassName))
  {
    if (lpBuffer=AkelPad.MemAlloc(256 * _TSIZE))
    {
      var sizeNonClient=[];

      sizeNonClient.cx=oSys.Call("user32::GetSystemMetrics", 32 /*SM_CXSIZEFRAME*/) * 2;
      sizeNonClient.cy=oSys.Call("user32::GetSystemMetrics", 33 /*SM_CYSIZEFRAME*/) * 2 + oSys.Call("user32::GetSystemMetrics", 4 /*SM_CYCAPTION*/);

      //Get scale factor for ScaleX and ScaleY
      ScaleInit(0, hMainWnd);

      //Min/max dialog sizes: left, top - minimum; right, bottom - maximum. Each member is valid if not equal to zero.
      rcMinMaxDialogRect.left=ScaleX(392) + sizeNonClient.cx;
      rcMinMaxDialogRect.top=ScaleY(200) + sizeNonClient.cy;
      rcMinMaxDialogRect.right=0;
      rcMinMaxDialogRect.bottom=ScaleY(200) + sizeNonClient.cy;

      //Create dialog
      hWndDialog=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0,                              //dwExStyle
                           pClassName,                     //lpClassName
                           0,                              //lpWindowName
                           0x90CE0000,                     //WS_VISIBLE|WS_POPUP|WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX|WS_THICKFRAME
                           ScaleX(0),                      //x
                           ScaleY(0),                      //y
                           ScaleX(392) + sizeNonClient.cx, //nWidth
                           ScaleY(200) + sizeNonClient.cy, //nHeight
                           hMainWnd,                       //hWndParent
                           0,                              //ID
                           hInstanceDLL,                   //hInstance
                           DialogCallback);                //Script function callback. To use it class must be registered by WindowRegisterClass.
      if (hWndDialog)
      {
        //Allow other scripts running
        AkelPad.ScriptNoMutex();

        //Message loop
        AkelPad.WindowGetMessage();
      }
      AkelPad.MemFree(lpBuffer);
    }
    AkelPad.WindowUnregisterClass(pClassName);
  }
  else if (hWndDialog=oSys.Call("user32::FindWindowEx" + _TCHAR, 0, 0, pClassName, 0))
  {
    if (oSys.Call("user32::IsIconic", hWndDialog))
      oSys.Call("user32::ShowWindow", hWndDialog, 9 /*SW_RESTORE*/);
    AkelPad.SendMessage(hWndDialog, AKDLG_PUTFIND, 0, 0);
    AkelPad.SendMessage(hWndDialog, 7 /*WM_SETFOCUS*/, 0, 0);
  }
}

function DialogCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 1)  //WM_CREATE
  {
    if (oSet.Begin(WScript.ScriptBaseName, 0x1 /*POB_READ*/))
    {
      //Read settings
      bSensitive=oSet.Read("Sensitive", 1 /*PO_DWORD*/);
      bMultiline=oSet.Read("Multiline", 1 /*PO_DWORD*/);
      bEscSequences=oSet.Read("EscSequences", 1 /*PO_DWORD*/);
      bReplaceFunction=oSet.Read("ReplaceFunction", 1 /*PO_DWORD*/);
      nDirection=oSet.Read("Direction", 1 /*PO_DWORD*/);
      rcCurrentDialogRect.right=oSet.Read("DialogWidth", 1 /*PO_DWORD*/);
      rcCurrentDialogRect.bottom=oSet.Read("DialogHeight", 1 /*PO_DWORD*/);

      //Find
      for (i=0; i < nSearchStrings; ++i)
      {
        lpFindStrings[i]=oSet.Read("Find" + i, 3 /*PO_STRING*/);
        if (typeof lpFindStrings[i] == "undefined")
          break;
      }
      if (typeof lpFindStrings[0] != "undefined")
        pFindIt=lpFindStrings[0];

      //Replace
      for (i=0; i < nSearchStrings; ++i)
      {
        lpReplaceStrings[i]=oSet.Read("Replace" + i, 3 /*PO_STRING*/);
        if (typeof lpReplaceStrings[i] == "undefined")
          break;
      }
      if (typeof lpReplaceStrings[0] != "undefined")
        pReplaceWith=lpReplaceStrings[0];

      //Templates
      {
        var nIndexOfWhat;
        var nIndexOfWith;
        var nLastIndexOf;
        var pTemplate;

        lpTemplates=[[GetLangString(STRID_TEMPLATE1), "^[ \\t]*$\\n*", "", "m"],
                     [GetLangString(STRID_TEMPLATE2), "(^[ \\t]+)|([ \\t]+$)", "", "m"],
                     [GetLangString(STRID_TEMPLATE3), "[^\\n]", " ", ""]];

        for (i=0; ; ++i)
        {
          if (pTemplate=oSet.Read("Template" + i, 3 /*PO_STRING*/))
          {
            nIndexOfWhat=pTemplate.indexOf("=what:/");
            nIndexOfWith=pTemplate.indexOf("/ with:/");
            nLastIndexOf=pTemplate.lastIndexOf("/");
            lpTemplates[i]=[0, 0, 0, 0];
            lpTemplates[i][0]=pTemplate.substr(0, nIndexOfWhat);
            lpTemplates[i][1]=pTemplate.substr(nIndexOfWhat + 7, nIndexOfWith - (nIndexOfWhat + 7));
            lpTemplates[i][2]=pTemplate.substr(nIndexOfWith + 8, nLastIndexOf - (nIndexOfWith + 8));
            lpTemplates[i][3]=pTemplate.substr(nLastIndexOf + 1);
          }
          else break;
        }
      }
      oSet.End();
    }

    hGuiFont=oSys.Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);

    //Dialog caption
    oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, pScriptName);

    ////Static window What

    //Create window
    hWndStatic=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         "STATIC",     //lpClassName
                         0,            //lpWindowName
                         0x50000000,   //WS_VISIBLE|WS_CHILD
                         ScaleX(6),    //x
                         ScaleY(18),   //y
                         ScaleX(33),   //nWidth
                         ScaleY(20),   //nHeight
                         hWnd,         //hWndParent
                         IDC_STATIC,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndStatic, hGuiFont, GetLangString(STRID_WHAT));


    ////Edit window What

    //Create window
    hWndWhat=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                       0,            //dwExStyle
                       "COMBOBOX",   //lpClassName
                       0,            //lpWindowName
                       0x50210042,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
                       ScaleX(41),   //x
                       ScaleY(15),   //y
                       ScaleX(227),  //nWidth
                       ScaleY(160),  //nHeight
                       hWnd,         //hWndParent
                       IDC_FIND,     //ID
                       hInstanceDLL, //hInstance
                       0);           //lpParam
    //Fill combobox
    for (i=0; i < nSearchStrings && typeof lpFindStrings[i] != "undefined"; ++i)
    {
      oSys.Call("user32::SendMessage" + _TCHAR, hWndWhat, 0x143 /*CB_ADDSTRING*/, 0, lpFindStrings[i]);
    }

    //Set font and text
    if (!AkelPad.SendMessage(hWnd, AKDLG_PUTFIND, 0, 0))
    {
      SetWindowFontAndText(hWndWhat, hGuiFont, "");
      AkelPad.SendMessage(hWndWhat, 0x14E /*CB_SETCURSEL*/, 0, 0);
    }


    ////Static window With

    //Create window
    hWndStatic=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         "STATIC",     //lpClassName
                         0,            //lpWindowName
                         0x50000000,   //WS_VISIBLE|WS_CHILD
                         ScaleX(6),    //x
                         ScaleY(41),   //y
                         ScaleX(33),   //nWidth
                         ScaleY(20),   //nHeight
                         hWnd,         //hWndParent
                         IDC_STATIC,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndStatic, hGuiFont, GetLangString(STRID_WITH));


    ////Edit window With

    //Create window
    hWndWith=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                       0,            //dwExStyle
                       "COMBOBOX",   //lpClassName
                       0,            //lpWindowName
                       0x50210042,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|WS_VSCROLL|CBS_DROPDOWN|CBS_AUTOHSCROLL
                       ScaleX(41),   //x
                       ScaleY(37),   //y
                       ScaleX(227),  //nWidth
                       ScaleY(160),  //nHeight
                       hWnd,         //hWndParent
                       IDC_REPLACE,  //ID
                       hInstanceDLL, //hInstance
                       0);           //lpParam
    //Fill combobox
    for (i=0; i < nSearchStrings && typeof lpReplaceStrings[i] != "undefined"; ++i)
    {
      oSys.Call("user32::SendMessage" + _TCHAR, hWndWith, 0x143 /*CB_ADDSTRING*/, 0, lpReplaceStrings[i]);
    }

    //Set font and text
    SetWindowFontAndText(hWndWith, hGuiFont, "");
    AkelPad.SendMessage(hWndWith, 0x14E /*CB_SETCURSEL*/, 0, 0);


    ////Button window Templates

    //Create window
    hWndTemplate=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0x20000,      //WS_EX_STATICEDGE
                           "BUTTON",     //lpClassName
                           0,            //lpWindowName
                           0x50010000,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                           ScaleX(270),  //x
                           ScaleY(15),   //y
                           ScaleX(12),   //nWidth
                           ScaleY(43),   //nHeight
                           hWnd,         //hWndParent
                           IDC_TEMPLATE, //ID
                           hInstanceDLL, //hInstance
                           0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndTemplate, hGuiFont, ">");


    ////Checkbox Sensitive

    //Create window
    hWndCase=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                       0,             //dwExStyle
                       "BUTTON",      //lpClassName
                       0,             //lpWindowName
                       0x50010003,    //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                       ScaleX(14),    //x
                       ScaleY(70),    //y
                       ScaleX(158),   //nWidth
                       ScaleY(20),    //nHeight
                       hWnd,          //hWndParent
                       IDC_MATCHCASE, //ID
                       hInstanceDLL,  //hInstance
                       0);            //lpParam
    //Set font and text
    SetWindowFontAndText(hWndCase, hGuiFont, GetLangString(STRID_MATCHCASE));


    ////Checkbox Multiline

    //Create window
    hWndMultiline=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                            0,             //dwExStyle
                            "BUTTON",      //lpClassName
                            0,             //lpWindowName
                            0x50010003,    //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                            ScaleX(14),    //x
                            ScaleY(91),    //y
                            ScaleX(158),   //nWidth
                            ScaleY(20),    //nHeight
                            hWnd,          //hWndParent
                            IDC_MULTILINE, //ID
                            hInstanceDLL,  //hInstance
                            0);            //lpParam
    //Set font and text
    SetWindowFontAndText(hWndMultiline, hGuiFont, GetLangString(STRID_MULTILINE));


    ////Checkbox Esc-sequences

    //Create window
    hWndEscSequences=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                               0,             //dwExStyle
                               "BUTTON",      //lpClassName
                               0,             //lpWindowName
                               0x50010003,    //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                               ScaleX(14),    //x
                               ScaleY(112),   //y
                               ScaleX(158),   //nWidth
                               ScaleY(20),    //nHeight
                               hWnd,          //hWndParent
                               IDC_ESCAPESEQ, //ID
                               hInstanceDLL,  //hInstance
                               0);            //lpParam
    //Set font and text
    SetWindowFontAndText(hWndEscSequences, hGuiFont, GetLangString(STRID_ESCAPESEQ));


    ////Checkbox Replace with function

    //Create window
    hWndReplaceFunction=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                                  0,            //dwExStyle
                                  "BUTTON",     //lpClassName
                                  0,            //lpWindowName
                                  0x50010003,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_AUTOCHECKBOX
                                  ScaleX(14),   //x
                                  ScaleY(133),  //y
                                  ScaleX(158),  //nWidth
                                  ScaleY(20),   //nHeight
                                  hWnd,         //hWndParent
                                  IDC_FUNCTION, //ID
                                  hInstanceDLL, //hInstance
                                  0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndReplaceFunction, hGuiFont, GetLangString(STRID_FUNCTION));


    ////GroupBox 1

    //Create window
    hWndGroup1=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         "BUTTON",     //lpClassName
                         0,            //lpWindowName
                         0x50000007,   //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
                         ScaleX(182),  //x
                         ScaleY(67),   //y
                         ScaleX(99),   //nWidth
                         ScaleY(94),   //nHeight
                         hWnd,         //hWndParent
                         IDC_STATIC,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndGroup1, hGuiFont, GetLangString(STRID_DIRECTION));


    ////Radiobutton Down

    //Create window
    hWndDown=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                       0,            //dwExStyle
                       "BUTTON",     //lpClassName
                       0,            //lpWindowName
                       0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                       ScaleX(189),  //x
                       ScaleY(83),   //y
                       ScaleX(90),   //nWidth
                       ScaleY(16),   //nHeight
                       hWnd,         //hWndParent
                       IDC_FORWARD,  //ID
                       hInstanceDLL, //hInstance
                       0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndDown, hGuiFont, GetLangString(STRID_FORWARD));


    ////Radiobutton Up

    //Create window
    hWndUp=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                     0,            //dwExStyle
                     "BUTTON",     //lpClassName
                     0,            //lpWindowName
                     0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                     ScaleX(189),  //x
                     ScaleY(101),  //y
                     ScaleX(90),   //nWidth
                     ScaleY(16),   //nHeight
                     hWnd,         //hWndParent
                     IDC_BACKWARD, //ID
                     hInstanceDLL, //hInstance
                     0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndUp, hGuiFont, GetLangString(STRID_BACKWARD));


    ////Radiobutton Beginning

    //Create window
    hWndBeginning=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                            0,             //dwExStyle
                            "BUTTON",      //lpClassName
                            0,             //lpWindowName
                            0x50000009,    //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                            ScaleX(189),   //x
                            ScaleY(119),   //y
                            ScaleX(90),    //nWidth
                            ScaleY(16),    //nHeight
                            hWnd,          //hWndParent
                            IDC_BEGINNING, //ID
                            hInstanceDLL,  //hInstance
                            0);            //lpParam
    //Set font and text
    SetWindowFontAndText(hWndBeginning, hGuiFont, GetLangString(STRID_BEGINNING));


    ////Radiobutton Selection

    //Create window
    hWndSelection=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                            0,            //dwExStyle
                            "BUTTON",     //lpClassName
                            0,            //lpWindowName
                            0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                            ScaleX(189),  //x
                            ScaleY(137),  //y
                            ScaleX(90),   //nWidth
                            ScaleY(16),   //nHeight
                            hWnd,         //hWndParent
                            IDC_INSEL,    //ID
                            hInstanceDLL, //hInstance
                            0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndSelection, hGuiFont, GetLangString(STRID_INSEL));


    if (AkelPad.IsMDI())
    {
      ////Radiobutton AllFiles

      //Create window
      hWndAllFiles=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                             0,            //dwExStyle
                             "BUTTON",     //lpClassName
                             0,            //lpWindowName
                             0x50000009,   //WS_VISIBLE|WS_CHILD|BS_AUTORADIOBUTTON
                             ScaleX(189),  //x
                             ScaleY(164),  //y
                             ScaleX(90),   //nWidth
                             ScaleY(16),   //nHeight
                             hWnd,         //hWndParent
                             IDC_ALLFILES, //ID
                             hInstanceDLL, //hInstance
                             0);           //lpParam
      //Set font and text
      SetWindowFontAndText(hWndAllFiles, hGuiFont, GetLangString(STRID_ALLFILES));


      ////GroupBox 2

      //Create window
      hWndGroup2=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0,            //dwExStyle
                           "BUTTON",     //lpClassName
                           0,            //lpWindowName
                           0x50000007,   //WS_VISIBLE|WS_CHILD|BS_GROUPBOX
                           ScaleX(182),  //x
                           ScaleY(153),  //y
                           ScaleX(99),   //nWidth
                           ScaleY(31),   //nHeight
                           hWnd,         //hWndParent
                           IDC_STATIC,   //ID
                           hInstanceDLL, //hInstance
                           0);           //lpParam
      //Set font and text
      SetWindowFontAndText(hWndGroup2, hGuiFont, "");
    }


    ////Button window FindNext

    //Create window
    hWndFindButton=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                           0,               //dwExStyle
                           "BUTTON",        //lpClassName
                           0,               //lpWindowName
                           0x50010001,      //WS_VISIBLE|WS_CHILD|WS_TABSTOP|BS_DEFPUSHBUTTON
                           ScaleX(294),     //x
                           ScaleY(10),      //y
                           ScaleX(81),      //nWidth
                           ScaleY(23),      //nHeight
                           hWnd,            //hWndParent
                           IDC_FIND_BUTTON, //ID
                           hInstanceDLL,    //hInstance
                           0);              //lpParam
    //Set font and text
    SetWindowFontAndText(hWndFindButton, hGuiFont, GetLangString(STRID_FINDNEXT));


    ////Button window Replace

    //Create window
    hWndReplaceButton=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                          0,                  //dwExStyle
                          "BUTTON",           //lpClassName
                          0,                  //lpWindowName
                          0x50010000,         //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                          ScaleX(294),        //x
                          ScaleY(37),         //y
                          ScaleX(81),         //nWidth
                          ScaleY(23),         //nHeight
                          hWnd,               //hWndParent
                          IDC_REPLACE_BUTTON, //ID
                          hInstanceDLL,       //hInstance
                          0);                 //lpParam
    //Set font and text
    SetWindowFontAndText(hWndReplaceButton, hGuiFont, GetLangString(STRID_REPLACE));


    ////Button window ReplaceAll

    //Create window
    hWndReplaceAllButton=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                             0,              //dwExStyle
                             "BUTTON",       //lpClassName
                             0,              //lpWindowName
                             0x50010000,     //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                             ScaleX(294),    //x
                             ScaleY(63),     //y
                             ScaleX(81),     //nWidth
                             ScaleY(23),     //nHeight
                             hWnd,           //hWndParent
                             IDC_ALL_BUTTON, //ID
                             hInstanceDLL,   //hInstance
                             0);             //lpParam
    //Set font and text
    SetWindowFontAndText(hWndReplaceAllButton, hGuiFont, GetLangString(STRID_REPLACEALL));


    ////Button window Cancel

    //Create window
    hWndCancel=oSys.Call("user32::CreateWindowEx" + _TCHAR,
                         0,            //dwExStyle
                         "BUTTON",     //lpClassName
                         0,            //lpWindowName
                         0x50010000,   //WS_VISIBLE|WS_CHILD|WS_TABSTOP
                         ScaleX(294),  //x
                         ScaleY(89),   //y
                         ScaleX(81),   //nWidth
                         ScaleY(23),   //nHeight
                         hWnd,         //hWndParent
                         IDC_CANCEL,   //ID
                         hInstanceDLL, //hInstance
                         0);           //lpParam
    //Set font and text
    SetWindowFontAndText(hWndCancel, hGuiFont, GetLangString(STRID_CANCEL));


    //Checks
    if (ScriptEngineMajorVersion() <= 5 && ScriptEngineMinorVersion() < 5)
    {
      bMultiline=false;
      oSys.Call("user32::EnableWindow", hWndMultiline, false);
      bReplaceFunction=false;
      oSys.Call("user32::EnableWindow", hWndReplaceFunction, false);
    }
    if (bSensitive) AkelPad.SendMessage(hWndCase, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bMultiline) AkelPad.SendMessage(hWndMultiline, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bEscSequences) AkelPad.SendMessage(hWndEscSequences, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    if (bReplaceFunction)
    {
      AkelPad.SendMessage(hWndReplaceFunction, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      oSys.Call("user32::EnableWindow", hWndEscSequences, false);
    }

    if (nDirection == DN_ALLFILES)
    {
      if (AkelPad.IsMDI())
        AkelPad.SendMessage(hWndAllFiles, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
      else
        nDirection=DN_DOWN;
    }
    else if (nDirection == DN_BEGINNING) AkelPad.SendMessage(hWndBeginning, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else if (nDirection == DN_SELECTION) AkelPad.SendMessage(hWndSelection, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    if (nDirection == DN_DOWN) AkelPad.SendMessage(hWndDown, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);
    else if (nDirection == DN_UP) AkelPad.SendMessage(hWndUp, 241 /*BM_SETCHECK*/, 1 /*BST_CHECKED*/, 0);

    drs=[[hWndWhat,             DRS_SIZE|DRS_X],
         [hWndWith,             DRS_SIZE|DRS_X],
         [hWndTemplate,         DRS_MOVE|DRS_X],
         [hWndGroup1,           DRS_MOVE|DRS_X],
         [hWndGroup2,           DRS_MOVE|DRS_X],
         [hWndDown,             DRS_MOVE|DRS_X],
         [hWndUp,               DRS_MOVE|DRS_X],
         [hWndBeginning,        DRS_MOVE|DRS_X],
         [hWndSelection,        DRS_MOVE|DRS_X],
         [hWndAllFiles,         DRS_MOVE|DRS_X],
         [hWndFindButton,       DRS_MOVE|DRS_X],
         [hWndReplaceButton,    DRS_MOVE|DRS_X],
         [hWndReplaceAllButton, DRS_MOVE|DRS_X],
         [hWndCancel,           DRS_MOVE|DRS_X]];

    //Center dialog
    CenterWindow(hMainWnd, hWnd);
  }
  else if (uMsg == AKDLG_PUTFIND)
  {
    var hWndCurrentEdit=AkelPad.GetEditWnd();

    if (hWndCurrentEdit)
    {
      nSelStart=AkelPad.GetSelStart();
      nSelEnd=AkelPad.GetSelEnd();

      if (nSelStart != nSelEnd && nSelEnd - nSelStart < PUTFIND_MAXSEL && !(nDirection == DN_SELECTION) && !AkelPad.SendMessage(hWndCurrentEdit, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
      {
        SetWindowFontAndText(hWndWhat, hGuiFont, AkelPad.GetSelText());
        oSys.Call("user32::SetWindowLong" + _TCHAR, 0 /*DWL_MSGRESULT*/, true);
        return true;
      }
    }
    return false;
  }
  else if (uMsg == 7)  //WM_SETFOCUS
  {
    oSys.Call("user32::SetFocus", hWndWhat);
  }
  else if (uMsg == 256)  //WM_KEYDOWN
  {
    if (wParam == 27)  //VK_ESCAPE
    {
      //Escape key pushes Cancel button
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 273 /*WM_COMMAND*/, IDC_CANCEL, 0);
    }
    else if (wParam == 13)  //VK_RETURN
    {
      if (oSys.Call("user32::IsWindowEnabled", hWndFindButton))
      {
        //Return key pushes OK button
        oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 273 /*WM_COMMAND*/, IDC_FIND_BUTTON, 0);
      }
    }
  }
  else if (uMsg == 273)  //WM_COMMAND
  {
    if (LOWORD(wParam) == IDC_TEMPLATE)
    {
      if (lpTemplates.length)
      {
        var hMenu;
        var nCmd;
        var rcControl=[];
        var lpCurTemplate=[0, 0, 0, 0];
        var pNewTemplateName;
        var bEnable;
        var nCurIndex=-1;

        //What
        oSys.Call("user32::GetWindowText" + _TCHAR, hWndWhat, lpBuffer, 256);
        lpCurTemplate[1]=AkelPad.MemRead(lpBuffer, _TSTR);

        //With
        oSys.Call("user32::GetWindowText" + _TCHAR, hWndWith, lpBuffer, 256);
        lpCurTemplate[2]=AkelPad.MemRead(lpBuffer, _TSTR);

        //Flags
        lpCurTemplate[3]="";
        if (bSensitive)
          lpCurTemplate[3]+="i"
        if (bMultiline)
          lpCurTemplate[3]+="m"
        if (bEscSequences)
          lpCurTemplate[3]+="e"
        if (bReplaceFunction)
          lpCurTemplate[3]+="f"

        if (hMenu=oSys.Call("user32::CreatePopupMenu"))
        {
          GetWindowPos(hWndTemplate, 0, rcControl);
          for (i=0; i < lpTemplates.length; ++i)
          {
            if (lpCurTemplate[1] == lpTemplates[i][1] &&
                lpCurTemplate[2] == lpTemplates[i][2] &&
                lpCurTemplate[3] == lpTemplates[i][3])
            {
              nCurIndex=i;
            }
            oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, nCurIndex == i?0x8 /*MF_STRING|MF_CHECKED*/:0x0 /*MF_STRING*/, i + 1, lpTemplates[i][0]);
          }
          oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, 0x800 /*MF_SEPARATOR*/, 0, 0);
          if (nCurIndex >= 0)
          {
            oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, 0x0 /*MF_STRING*/, ++i, GetLangString(STRID_RENAME));
            oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, 0x0 /*MF_STRING*/, ++i, GetLangString(STRID_DELETE));
          }
          else oSys.Call("user32::AppendMenu" + _TCHAR, hMenu, 0x0 /*MF_STRING*/, ++i, GetLangString(STRID_ADD));

          nCmd=oSys.Call("user32::TrackPopupMenu", hMenu, 0x182 /*TPM_RETURNCMD|TPM_NONOTIFY|TPM_LEFTBUTTON|TPM_RIGHTBUTTON*/, rcControl.left, rcControl.top, 0, hWndDialog, 0);

          if (nCmd)
          {
            if (nCmd <= lpTemplates.length)
            {
              oSys.Call("user32::SetWindowText" + _TCHAR, hWndWhat, lpTemplates[nCmd - 1][1]);
              oSys.Call("user32::SetWindowText" + _TCHAR, hWndWith, lpTemplates[nCmd - 1][2]);

              bEnable=lpTemplates[nCmd - 1][3].indexOf("i") >= 0;
              AkelPad.SendMessage(hWndCase, 241 /*BM_SETCHECK*/, bEnable, 0);
              AkelPad.SendMessage(hWndDialog, 273 /*WM_COMMAND*/, IDC_MATCHCASE, 0);

              bEnable=lpTemplates[nCmd - 1][3].indexOf("m") >= 0;
              AkelPad.SendMessage(hWndMultiline, 241 /*BM_SETCHECK*/, bEnable, 0);
              AkelPad.SendMessage(hWndDialog, 273 /*WM_COMMAND*/, IDC_MULTILINE, 0);

              bEnable=lpTemplates[nCmd - 1][3].indexOf("e") >= 0;
              AkelPad.SendMessage(hWndEscSequences, 241 /*BM_SETCHECK*/, bEnable, 0);
              AkelPad.SendMessage(hWndDialog, 273 /*WM_COMMAND*/, IDC_ESCAPESEQ, 0);

              bEnable=lpTemplates[nCmd - 1][3].indexOf("f") >= 0;
              AkelPad.SendMessage(hWndReplaceFunction, 241 /*BM_SETCHECK*/, bEnable, 0);
              AkelPad.SendMessage(hWndDialog, 273 /*WM_COMMAND*/, IDC_FUNCTION, 0);
            }
            else
            {
              if (nCurIndex >= 0)
              {
                if (nCmd == lpTemplates.length + 1)
                {
                  //Rename
                  if (pNewTemplateName=AkelPad.InputBox(hWndDialog, GetLangString(STRID_RENAME), GetLangString(STRID_NAME), lpTemplates[nCurIndex][0]))
                  {
                    lpTemplates[nCurIndex][0]=pNewTemplateName;
                  }
                }
                else if (nCmd == lpTemplates.length + 2)
                {
                  //Delete
                  DeleteFromArray(lpTemplates, nCurIndex, 1);
                }
              }
              else
              {
                //Add
                if (pNewTemplateName=AkelPad.InputBox(hWndDialog, GetLangString(STRID_ADD), GetLangString(STRID_NAME), ""))
                {
                  lpCurTemplate[0]=pNewTemplateName;
                  lpTemplates[lpTemplates.length]=lpCurTemplate;
                }
              }
            }
          }
          //Remove BS_DEFPUSHBUTTON
          AkelPad.SendMessage(hWndTemplate, 0xF4 /*BM_SETSTYLE*/, 0, true);
          oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 7 /*WM_SETFOCUS*/, 0, 0);

          oSys.Call("user32::DestroyMenu", hMenu);
        }
      }
    }
    else if (LOWORD(wParam) == IDC_FIND)
    {
      if (HIWORD(wParam) == 1 /*CBN_SELCHANGE*/)
      {
        i=AkelPad.SendMessage(hWndWhat, 0x147 /*CB_GETCURSEL*/, 0, 0);
        nFindItLength=AkelPad.SendMessage(hWndWhat, 0x149 /*CB_GETLBTEXTLEN*/, i, 0);
      }
      else nFindItLength=oSys.Call("user32::GetWindowTextLength" + _TCHAR, hWndWhat);

      if (nFindItLength)
      {
        oSys.Call("user32::EnableWindow", hWndFindButton, true);
        oSys.Call("user32::EnableWindow", hWndReplaceButton, true);
        oSys.Call("user32::EnableWindow", hWndReplaceAllButton, true);
      }
      else
      {
        oSys.Call("user32::EnableWindow", hWndFindButton, false);
        oSys.Call("user32::EnableWindow", hWndReplaceButton, false);
        oSys.Call("user32::EnableWindow", hWndReplaceAllButton, false);
      }
    }
    else if (LOWORD(wParam) == IDC_MATCHCASE ||
             LOWORD(wParam) == IDC_MULTILINE ||
             LOWORD(wParam) == IDC_ESCAPESEQ ||
             LOWORD(wParam) == IDC_FUNCTION)
    {
      if (LOWORD(wParam) == IDC_MATCHCASE)
        bSensitive=AkelPad.SendMessage(hWndCase, 240 /*BM_GETCHECK*/, 0, 0);
      else if (LOWORD(wParam) == IDC_MULTILINE)
        bMultiline=AkelPad.SendMessage(hWndMultiline, 240 /*BM_GETCHECK*/, 0, 0);
      else if (LOWORD(wParam) == IDC_ESCAPESEQ)
        bEscSequences=AkelPad.SendMessage(hWndEscSequences, 240 /*BM_GETCHECK*/, 0, 0);
      else if (LOWORD(wParam) == IDC_FUNCTION)
      {
        bReplaceFunction=AkelPad.SendMessage(hWndReplaceFunction, 240 /*BM_GETCHECK*/, 0, 0);
        oSys.Call("user32::EnableWindow", hWndEscSequences, !bReplaceFunction);
      }
    }
    else if (LOWORD(wParam) == IDC_FORWARD ||
             LOWORD(wParam) == IDC_BACKWARD ||
             LOWORD(wParam) == IDC_BEGINNING ||
             LOWORD(wParam) == IDC_INSEL ||
             LOWORD(wParam) == IDC_ALLFILES)
    {
      if (nDirection & DN_ALLFILES)
        AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, false, 0);
      else if (nDirection & DN_BEGINNING)
        AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, false, 0);

      if (LOWORD(wParam) == IDC_FORWARD)
        nDirection=DN_DOWN;
      else if (LOWORD(wParam) == IDC_BACKWARD)
        nDirection=DN_UP;
      else if (LOWORD(wParam) == IDC_BEGINNING)
        nDirection=DN_BEGINNING;
      else if (LOWORD(wParam) == IDC_INSEL)
        nDirection=DN_SELECTION;
      else if (LOWORD(wParam) == IDC_ALLFILES)
        nDirection=DN_ALLFILES;
    }
    else if (LOWORD(wParam) == IDC_FIND_BUTTON ||
             LOWORD(wParam) == IDC_REPLACE_BUTTON ||
             LOWORD(wParam) == IDC_ALL_BUTTON)
    {
      if (LOWORD(wParam) == IDC_FIND_BUTTON)
        nButton=BT_FINDNEXT;
      else if (LOWORD(wParam) == IDC_REPLACE_BUTTON)
        nButton=BT_REPLACE;
      else if (LOWORD(wParam) == IDC_ALL_BUTTON)
        nButton=BT_REPLACEALL;

      //Find
      nFindItLength=oSys.Call("user32::GetWindowTextLength" + _TCHAR, hWndWhat);

      if (lpSearchBuffer=AkelPad.MemAlloc((nFindItLength + 1) * _TSIZE))
      {
        oSys.Call("user32::GetWindowText" + _TCHAR, hWndWhat, lpSearchBuffer, nFindItLength + 1);
        pFindIt=AkelPad.MemRead(lpSearchBuffer, _TSTR);

        if (nSearchStrings)
        {
          for (i=0; i < nSearchStrings && typeof lpFindStrings[i] != "undefined"; ++i)
          {
            if (lpFindStrings[i] == pFindIt)
            {
              AkelPad.SendMessage(hWndWhat, 0x144 /*CB_DELETESTRING*/, i, 0);
              DeleteFromArray(lpFindStrings, i, 1);
            }
          }
          InsertInArray(lpFindStrings, pFindIt, 0);
          if (lpFindStrings.length > nSearchStrings)
            DeleteFromArray(lpFindStrings, -1, 1);

          //AkelPad.MemCopy(lpSearchBuffer, pFindIt, _TSTR);
          AkelPad.SendMessage(hWndWhat, 0x14A /*CB_INSERTSTRING*/, 0, lpSearchBuffer);
          AkelPad.SendMessage(hWndWhat, 0x14E /*CB_SETCURSEL*/, 0, 0);
        }
        AkelPad.MemFree(lpSearchBuffer);
      }

      //Replace
      nReplaceWithLength=oSys.Call("user32::GetWindowTextLength" + _TCHAR, hWndWith);

      if (lpSearchBuffer=AkelPad.MemAlloc((nReplaceWithLength + 1) * _TSIZE))
      {
        oSys.Call("user32::GetWindowText" + _TCHAR, hWndWith, lpSearchBuffer, nReplaceWithLength + 1);
        pReplaceWith=AkelPad.MemRead(lpSearchBuffer, _TSTR);

        if (nSearchStrings)
        {
          for (i=0; i < nSearchStrings && typeof lpReplaceStrings[i] != "undefined"; ++i)
          {
            if (lpReplaceStrings[i] == pReplaceWith)
            {
              AkelPad.SendMessage(hWndWith, 0x144 /*CB_DELETESTRING*/, i, 0);
              DeleteFromArray(lpReplaceStrings, i, 1);
            }
          }
          InsertInArray(lpReplaceStrings, pReplaceWith, 0);
          if (lpReplaceStrings.length > nSearchStrings)
            DeleteFromArray(lpReplaceStrings, -1, 1);

          //AkelPad.MemCopy(lpSearchBuffer, pReplaceWith, _TSTR);
          AkelPad.SendMessage(hWndWith, 0x14A /*CB_INSERTSTRING*/, 0, lpSearchBuffer);
          AkelPad.SendMessage(hWndWith, 0x14E /*CB_SETCURSEL*/, 0, 0);
        }
        AkelPad.MemFree(lpSearchBuffer);
      }

      pReplaceWithEsc=pReplaceWith;
      if (bReplaceFunction)
      {
        //Replace with function
        if (!/(^|[^\w.])return\s+\S/.test(pReplaceWithEsc))
          pReplaceWithEsc="return " + pReplaceWithEsc;
        pReplaceWithEsc='var args={}, l=arguments.length;'
                      + 'for (var i=0; i < l; ++i)\n'
                      + '  args["$" + i]=arguments[i];\n'
                      + 'args.offset=arguments[l - 2];\n'
                      + 'args.s=arguments[l - 1];\n'
                      + 'with (args)\n'
                      + '{\n'
                      +    pReplaceWithEsc
                      + '\n}';
        pReplaceWithEsc=new Function(pReplaceWithEsc);
      }
      else if (bEscSequences)
      {
        //Esc-sequences
        pReplaceWithEsc=pReplaceWithEsc.replace(/\\\\/g, "\0");
        if (pReplaceWithEsc.search(/\\[^rnt]/g) != -1)
        {
          AkelPad.MessageBox(hWndDialog, GetLangString(STRID_SYNTAXERROR), pScriptName, 16 /*MB_ICONERROR*/);
          return 0;
        }
        pReplaceWithEsc=pReplaceWithEsc.replace(/\\r\\n|\\r|\\n/g, "\n");
        pReplaceWithEsc=pReplaceWithEsc.replace(/\\t/g, "\t");
        pReplaceWithEsc=pReplaceWithEsc.replace(/\0/g, "\\");
      }

      hWndFocus=oSys.Call("user32::GetFocus");
      if (nButton == BT_REPLACEALL)
        oSys.Call("user32::EnableWindow", hWndReplaceAllButton, false);

      nSearchResult=SearchReplace();

      if (nButton == BT_REPLACEALL)
        oSys.Call("user32::EnableWindow", hWndReplaceAllButton, true);
      oSys.Call("user32::SetFocus", hWndFocus);

      if (nSearchResult == -1)
      {
        if (nDirection & DN_ALLFILES)
        {
          AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, false, 0);
          nDirection&=~DN_DOWN;
        }
        else if (nDirection & DN_BEGINNING)
        {
          AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, false, 0);
          nDirection&=~DN_DOWN;
        }
      }
      else
      {
        if (nDirection == DN_ALLFILES)
        {
          AkelPad.SendMessage(hWndAllFiles, 243 /*BM_SETSTATE*/, true, 0);
          nDirection|=DN_DOWN;
        }
        else if (nDirection == DN_BEGINNING)
        {
          AkelPad.SendMessage(hWndBeginning, 243 /*BM_SETSTATE*/, true, 0);
          nDirection|=DN_DOWN;
        }
      }
    }
    else if (LOWORD(wParam) == IDC_CANCEL)
    {
      oSys.Call("user32::PostMessage" + _TCHAR, hWndDialog, 16 /*WM_CLOSE*/, 0, 0);
    }
  }
  else if (uMsg == 16)  //WM_CLOSE
  {
    if (oSet.Begin(WScript.ScriptBaseName, 0x2 /*POB_SAVE*/))
    {
      //Save settings
      if (nDirection != DN_DOWN) nDirection&=~DN_DOWN;
      oSet.Write("Sensitive", 1 /*PO_DWORD*/, bSensitive);
      oSet.Write("Multiline", 1 /*PO_DWORD*/, bMultiline);
      oSet.Write("EscSequences", 1 /*PO_DWORD*/, bEscSequences);
      oSet.Write("ReplaceFunction", 1 /*PO_DWORD*/, bReplaceFunction);
      oSet.Write("Direction", 1 /*PO_DWORD*/, nDirection);
      oSet.Write("DialogWidth", 1 /*PO_DWORD*/, rcCurrentDialogRect.right);
      oSet.Write("DialogHeight", 1 /*PO_DWORD*/, rcCurrentDialogRect.bottom);

      //Save find history
      for (i=0; i < nSearchStrings && typeof lpFindStrings[i] != "undefined"; ++i)
        oSet.Write("Find" + i, 3 /*PO_STRING*/, lpFindStrings[i]);

      //Save replace history
      for (i=0; i < nSearchStrings && typeof lpReplaceStrings[i] != "undefined"; ++i)
        oSet.Write("Replace" + i, 3 /*PO_STRING*/, lpReplaceStrings[i]);

      //Save templates
      for (i=0; i < lpTemplates.length; ++i)
        oSet.Write("Template" + i, 3 /*PO_STRING*/, lpTemplates[i][0] + "=what:/" + lpTemplates[i][1] + "/ with:/" + lpTemplates[i][2] + "/" + lpTemplates[i][3]);
      while (oSet.Delete("Template" + i++));

      oSet.End();
    }

    //Destroy dialog
    oSys.Call("user32::DestroyWindow", hWnd);
  }
  else if (uMsg == 2)  //WM_DESTROY
  {
    //Exit message loop
    oSys.Call("user32::PostQuitMessage", 0);
  }
  DialogResizeMessages(drs, rcMinMaxDialogRect, rcCurrentDialogRect, 0x2 /*DRM_PAINTSIZEGRIP*/, hWnd, uMsg, wParam, lParam);

  return 0;
}

function DialogResizeMessages(drs, rcMinMax, rcCurrent, dwFlags, hDlg, uMsg, wParam, lParam)
{
  if (uMsg == 0x1   || //WM_CREATE
      uMsg == 0x110)   //WM_INITDIALOG
  {
    var rcTemplate=[];
    var rcControl=[];
    var i;

    rcTemplate.left=rcCurrent.left;
    rcTemplate.top=rcCurrent.top;
    rcTemplate.right=rcCurrent.right;
    rcTemplate.bottom=rcCurrent.bottom;

    GetWindowPos(hDlg, 0, rcCurrent);

    for (i=0; i < drs.length; ++i)
    {
      if (drs[i][0])
      {
        GetWindowPos(drs[i][0], hDlg, rcControl);
        if (drs[i][1] & DRS_SIZE)
        {
          if (drs[i][1] & DRS_X)
            drs[i][3]=rcCurrent.right - (rcControl.left + rcControl.right);
          else if (drs[i][1] & DRS_Y)
            drs[i][3]=rcCurrent.bottom - (rcControl.top + rcControl.bottom);
        }
        else if (drs[i][1] & DRS_MOVE)
        {
          if (drs[i][1] & DRS_X)
            drs[i][3]=rcCurrent.right - rcControl.left;
          else if (drs[i][1] & DRS_Y)
            drs[i][3]=rcCurrent.bottom - rcControl.top;
        }
      }
    }

    if (rcTemplate.right && rcTemplate.bottom)
    {
      if (oSys.Call("user32::GetWindowLong" + _TCHAR, hDlg, -16 /*GWL_STYLE*/) & 0x800 /*DS_CENTER*/)
      {
        rcTemplate.left=rcCurrent.left + (rcCurrent.right - rcTemplate.right) / 2;
        rcTemplate.top=rcCurrent.top + (rcCurrent.bottom - rcTemplate.bottom) / 2;
      }
      oSys.Call("user32::SetWindowPos", hDlg, 0, rcTemplate.left, rcTemplate.top, rcTemplate.right, rcTemplate.bottom, 0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
    }
  }
  else if (uMsg == 36) //WM_GETMINMAXINFO
  {
    if (rcMinMax.left)
      AkelPad.MemCopy(lParam + 24 /*offsetof(MINMAXINFO, ptMinTrackSize.x)*/, rcMinMax.left, 3 /*DT_DWORD*/);
    if (rcMinMax.top)
      AkelPad.MemCopy(lParam + 28 /*offsetof(MINMAXINFO, ptMinTrackSize.y)*/, rcMinMax.top, 3 /*DT_DWORD*/);
    if (rcMinMax.right)
      AkelPad.MemCopy(lParam + 32 /*offsetof(MINMAXINFO, ptMaxTrackSize.x)*/, rcMinMax.right, 3 /*DT_DWORD*/);
    if (rcMinMax.bottom)
      AkelPad.MemCopy(lParam + 36 /*offsetof(MINMAXINFO, ptMaxTrackSize.y)*/, rcMinMax.bottom, 3 /*DT_DWORD*/);
  }
  else if (uMsg == 3) //WM_MOVE
  {
    if (!(oSys.Call("user32::GetWindowLong" + _TCHAR, hDlg, -16 /*GWL_STYLE*/) & 0x800 /*DS_CENTER*/))
    {
      var rcTemplate=[];

      GetWindowPos(hDlg, 0, rcTemplate);
      rcCurrent.left=rcTemplate.left;
      rcCurrent.top=rcTemplate.top;
      return true;
    }
  }
  else if (uMsg == 5) //WM_SIZE
  {
    if (lParam)
    {
      var rcControl=[];
      var dwFlags;
      var i;

      GetWindowPos(hDlg, 0, rcCurrent);

      for (i=0; i < drs.length; ++i)
      {
        if (drs[i][0])
        {
          dwFlags=0;
          if (drs[i][1] & DRS_SIZE)
            dwFlags|=0x2 /*SWP_NOMOVE*/;
          else if (drs[i][1] & DRS_MOVE)
            dwFlags|=0x1 /*SWP_NOSIZE*/;
          else
            continue;

          GetWindowPos(drs[i][0], hDlg, rcControl);
          oSys.Call("user32::SetWindowPos", drs[i][0], 0, (drs[i][1] & DRS_X)?(rcCurrent.right - drs[i][3]):rcControl.left,
                                                          (drs[i][1] & DRS_Y)?(rcCurrent.bottom - drs[i][3]):rcControl.top,
                                                          (drs[i][1] & DRS_X)?(rcCurrent.right - rcControl.left - drs[i][3]):rcControl.right,
                                                          (drs[i][1] & DRS_Y)?(rcCurrent.bottom - rcControl.top - drs[i][3]):rcControl.bottom,
                                                           dwFlags | 0x14 /*SWP_NOZORDER|SWP_NOACTIVATE*/);
        }
      }
      oSys.Call("user32::InvalidateRect", hDlg, 0, true);
      return true;
    }
  }
  else if (uMsg == 15) //WM_PAINT
  {
    if (dwFlags & 0x2 /*DRM_PAINTSIZEGRIP*/)
    {
      var ps;
      var rcGrip=[];
      var lpGrip;
      var hDC;

      if (ps=AkelPad.MemAlloc(64 /*sizeof(PAINTSTRUCT)*/))
      {
        if (hDC=oSys.Call("user32::BeginPaint", hDlg, ps))
        {
          if (lpGrip=AkelPad.MemAlloc(16 /*sizeof(RECT)*/))
          {
            if (oSys.Call("user32::GetClientRect", hDlg, lpGrip))
            {
              RectToArray(lpGrip, rcGrip);
              rcGrip.left=rcGrip.right - oSys.Call("user32::GetSystemMetrics", 2 /*SM_CXVSCROLL*/);
              rcGrip.top=rcGrip.bottom - oSys.Call("user32::GetSystemMetrics", 20 /*SM_CYVSCROLL*/);
              ArrayToRect(rcGrip, lpGrip);

              oSys.Call("user32::DrawFrameControl", hDC, lpGrip, 3 /*DFC_SCROLL*/, 0x8 /*DFCS_SCROLLSIZEGRIP*/);
            }
            AkelPad.MemFree(lpGrip);
          }
          oSys.Call("user32::EndPaint", hDlg, ps);
        }
        AkelPad.MemFree(ps);
      }
    }
  }
  return false;
}

function SearchReplace()
{
  var hWndFrameInit=AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0);
  var hWndCurrentEdit=AkelPad.GetEditWnd();
  var oPattern;
  var lpArray;
  var pSelText;
  var pResult;
  var nInitialSelStart;
  var nInitialSelEnd;
  var nSelStart;
  var nSelEnd;
  var lpInitialScroll;
  var nMatches=-1;
  var nChanges=0;
  var nChangedFiles=0;
  var nError;
  var nResult=-1;
  var i;

  oPattern=new RegExp(pFindIt, (bSensitive?"":"i") + (nButton == BT_REPLACEALL || nDirection & DN_UP?"g":"") + (bMultiline?"m":""));

  for (;;)
  {
    nInitialSelStart=AkelPad.GetSelStart();
    nInitialSelEnd=AkelPad.GetSelEnd();

    if (nButton == BT_REPLACE)
    {
      if (nInitialSelStart != nInitialSelEnd)
      {
        pSelText=AkelPad.GetSelText(2 /*\n*/);
        if (!bAkelEdit)
          pSelText=pSelText.replace(/\r/g, "\n");

        if (/\(\?[=!].*\)/.test(pFindIt)) // Lookahead assertions: x(?=y) or x(?!y)
        {
          var pEndText=AkelPad.GetTextRange(nInitialSelStart, -1, 2 /*\n*/);
          if (!bAkelEdit)
            pEndText=pEndText.replace(/\r/g, "\n");

          if (oPattern.test(pEndText) && RegExp.lastMatch == pSelText)
          {
            pResult=pEndText.replace(oPattern, pReplaceWithEsc);
            pResult=pResult.substr(0, pResult.length - (pEndText.length - pSelText.length));
            AkelPad.ReplaceSel(pResult);

            nInitialSelStart=AkelPad.GetSelStart();
            nInitialSelEnd=AkelPad.GetSelEnd();
          }
        }
        else
        {
          if (lpArray=pSelText.match(oPattern))
          {
            if (lpArray.index == 0 && lpArray[0].length == (nInitialSelEnd - nInitialSelStart))
            {
              pResult=pSelText.replace(oPattern, pReplaceWithEsc);
              AkelPad.ReplaceSel(pResult);

              nInitialSelStart=AkelPad.GetSelStart();
              nInitialSelEnd=AkelPad.GetSelEnd();
            }
          }
        }
      }
      nButton=BT_FINDNEXT;
    }

    if (nDirection & DN_DOWN)
    {
      if (nButton == BT_FINDNEXT)
      {
        nSelStart=nInitialSelEnd;
        nSelEnd=-1;
      }
      else
      {
        nSelStart=nInitialSelStart;
        nSelEnd=-1;
      }
    }
    else if (nDirection & DN_UP)
    {
      if (nButton == BT_FINDNEXT)
      {
        nSelStart=0;
        nSelEnd=nInitialSelStart;
      }
      else
      {
        nSelStart=0;
        nSelEnd=nInitialSelEnd;
      }
    }
    else if (nDirection & DN_BEGINNING)
    {
      nSelStart=0;
      nSelEnd=-1;
    }
    else if (nDirection & DN_SELECTION)
    {
      nSelStart=nInitialSelStart;
      nSelEnd=nInitialSelEnd;
    }
    else if (nDirection & DN_ALLFILES)
    {
      nSelStart=0;
      nSelEnd=-1;
    }
    lpInitialScroll=SaveScroll(hWndCurrentEdit);
    SetRedraw(hWndCurrentEdit, false);

    try
    {
      if (bAkelEdit) ScrollLock(hWndCurrentEdit, true);

      if (nSelStart != nInitialSelStart || nSelEnd != nInitialSelEnd)
      {
        AkelPad.SetSel(nSelStart, nSelEnd);
        nSelStart=AkelPad.GetSelStart();
        nSelEnd=AkelPad.GetSelEnd();
      }
      pSelText=AkelPad.GetSelText(2 /*\n*/);
      if (!bAkelEdit)
        pSelText=pSelText.replace(/\r/g, "\n");

      if (bAkelEdit) ScrollLock(hWndCurrentEdit, false);

      if (nButton == BT_FINDNEXT)
      {
        if (lpArray=pSelText.match(oPattern))
        {
          if (bAkelEdit) ScrollLock(hWndCurrentEdit, true);

          if (nDirection & DN_UP)
          {
            for (i=0; lpArray[i]; ++i);
            AkelPad.SetSel(nSelStart + (lpArray.lastIndex - lpArray[i - 1].length), nSelStart + lpArray.lastIndex);
          }
          else
          {
            AkelPad.SetSel(nSelStart + lpArray.index, nSelStart + lpArray.index + lpArray[0].length);
          }

          if (bAkelEdit)
          {
            ScrollLock(hWndCurrentEdit, false);
            ScrollCaret(hWndCurrentEdit);
          }
          SetRedraw(hWndCurrentEdit, true);
          nResult=AkelPad.GetSelStart();
        }
        else
        {
          AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);
          RestoreScroll(hWndCurrentEdit, lpInitialScroll);
          SetRedraw(hWndCurrentEdit, true);

          if (nDirection & DN_ALLFILES)
          {
            //Next MDI frame
            AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4316 /*IDM_WINDOW_FRAMENEXT*/, 0);
            hWndCurrentEdit=AkelPad.GetEditWnd();
            if (hWndFrameInit != AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0))
            {
              AkelPad.SetSel(0, 0);
              continue;
            }
          }
          AkelPad.MessageBox(hWndDialog, GetLangString(STRID_FINISHED), pScriptName, 64 /*MB_ICONINFORMATION*/);
        }
      }
      else if (nButton == BT_REPLACEALL)
      {
        if (bShowCountOfChanges)
        {
          nMatches=pSelText.match(oPattern);
          nMatches=nMatches?nMatches.length:0;
          nChanges+=nMatches;
          ++nChangedFiles;
        }

        if (nMatches)
        {
          pResult=pSelText.replace(oPattern, pReplaceWithEsc);

          if (bAkelEdit)
          {
            if (nDirection & DN_SELECTION)
            {
              dwOptions=AkelPad.SendMessage(hWndCurrentEdit, 3227 /*AEM_GETOPTIONS*/, 0, 0);
              if (!(dwOptions & 0x40 /*AECO_PASTESELECTCOLUMN*/))
                AkelPad.SendMessage(hWndCurrentEdit, 3228 /*AEM_SETOPTIONS*/, 2 /*AECOOP_OR*/, 0x40 /*AECO_PASTESELECTCOLUMN*/);
            }
          }

          //Replace selection
          AkelPad.ReplaceSel(pResult);

          if (bAkelEdit)
          {
            if (nDirection & DN_SELECTION)
            {
              if (!(dwOptions & 0x40 /*AECO_PASTESELECTCOLUMN*/))
                AkelPad.SendMessage(hWndCurrentEdit, 3228 /*AEM_SETOPTIONS*/, 4 /*AECOOP_XOR*/, 0x40 /*AECO_PASTESELECTCOLUMN*/);
            }
          }

          if (nDirection & DN_SELECTION)
          {
            if (!AkelPad.SendMessage(hWndCurrentEdit, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
              AkelPad.SetSel(nSelStart, nSelStart + pResult.length);
          }
          else AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);
        }
        else AkelPad.SetSel(nInitialSelStart, nInitialSelEnd);

        RestoreScroll(hWndCurrentEdit, lpInitialScroll);
        SetRedraw(hWndCurrentEdit, true);

        if (nDirection & DN_ALLFILES)
        {
          //Next MDI frame
          AkelPad.SendMessage(hMainWnd, 273 /*WM_COMMAND*/, 4316 /*IDM_WINDOW_FRAMENEXT*/, 0);
          hWndCurrentEdit=AkelPad.GetEditWnd();
          if (hWndFrameInit != AkelPad.SendMessage(hMainWnd, 1288 /*AKD_FRAMEFIND*/, 1 /*FWF_CURRENT*/, 0))
          {
            AkelPad.SetSel(0, 0);
            continue;
          }
        }

        if (bShowCountOfChanges)
        {
          if (nDirection & DN_ALLFILES)
            AkelPad.MessageBox(hWndDialog, GetLangString(STRID_COUNTFILES) + nChangedFiles + "\n" + GetLangString(STRID_COUNTCHANGES) + nChanges, pScriptName, 64 /*MB_ICONINFORMATION*/);
          else
            AkelPad.MessageBox(hWndDialog, GetLangString(STRID_COUNTCHANGES) + nChanges, pScriptName, 64 /*MB_ICONINFORMATION*/);
        }
      }
    }
    catch (nError)
    {
      RestoreScroll(hWndCurrentEdit, lpInitialScroll);
      SetRedraw(hWndCurrentEdit, true);
      AkelPad.MessageBox(hWndDialog, nError.description, pScriptName, 16 /*MB_ICONERROR*/);
    }
    break;
  }
  return nResult;
}


//Functions
function InsertInArray(lpArray, lpItem, nPos)
{
  //For MS JScript backward compatibility
  var i;

  if (nPos < 0) nPos=lpArray.length + nPos + 1;
  if (nPos < 0) nPos=0;
  if (nPos > lpArray.length) nPos=lpArray.length;

  for (i=lpArray.length; i >= 0; --i)
  {
    if (i == nPos)
    {
      lpArray[i]=lpItem;
      break;
    }
    lpArray[i]=lpArray[i - 1];
  }
}

function DeleteFromArray(lpArray, nPos, nCount)
{
  //For MS JScript backward compatibility
  var i;

  if (nPos < 0) nPos=lpArray.length + nPos;
  if (nPos < 0 || nPos >= lpArray.length) return;
  if (nPos + nCount >= lpArray.length) nCount=lpArray.length - nPos;

  for (i=nPos; i + nCount < lpArray.length; ++i)
  {
    lpArray[i]=lpArray[i + nCount];
  }
  lpArray.length-=nCount;
}

function SetWindowFontAndText(hWnd, hFont, pText)
{
  AkelPad.SendMessage(hWnd, 48 /*WM_SETFONT*/, hFont, true);
  oSys.Call("user32::SetWindowText" + _TCHAR, hWnd, pText);
}

function SetRedraw(hWnd, bRedraw)
{
  AkelPad.SendMessage(hWnd, 11 /*WM_SETREDRAW*/, bRedraw, 0);
  if (bRedraw) oSys.Call("user32::InvalidateRect", hWnd, 0, true);
}

function SaveScroll(hWnd)
{
  var lpPoint;

  if (lpPoint=AkelPad.MemAlloc(8 /*sizeof(POINT)*/))
    AkelPad.SendMessage(hWnd, 1245 /*EM_GETSCROLLPOS*/, 0, lpPoint);
  return lpPoint;
}

function RestoreScroll(hWnd, lpPoint)
{
  AkelPad.SendMessage(hWnd, 1246 /*EM_SETSCROLLPOS*/, 0, lpPoint);
  AkelPad.MemFree(lpPoint);
}

function RectToArray(lpRect, rcRect)
{
  rcRect.left=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
  rcRect.top=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
  rcRect.right=AkelPad.MemRead(lpRect + 8, 3 /*DT_DWORD*/);
  rcRect.bottom=AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
  return rcRect;
}

function ArrayToRect(rcRect, lpRect)
{
  if (!lpRect)
    lpRect=AkelPad.MemAlloc(16 /*sizeof(RECT)*/);

  if (lpRect)
  {
    AkelPad.MemCopy(lpRect, rcRect.left, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpRect + 4, rcRect.top, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpRect + 8, rcRect.right, 3 /*DT_DWORD*/);
    AkelPad.MemCopy(lpRect + 12, rcRect.bottom, 3 /*DT_DWORD*/);
  }
  return lpRect;
}

function GetWindowPos(hWnd, hWndOwner, rcRect)
{
  var lpRect;
  var bResult=false;

  //Get rect
  if (lpRect=AkelPad.MemAlloc(16 /*sizeof(RECT)*/))
  {
    if (oSys.Call("user32::GetWindowRect", hWnd, lpRect))
    {
      RectToArray(lpRect, rcRect);
      rcRect.right-=rcRect.left;
      rcRect.bottom-=rcRect.top;

      if (hWndOwner)
        bResult=oSys.Call("user32::ScreenToClient", hWndOwner, lpRect);
      else
        bResult=true;
      rcRect.left=AkelPad.MemRead(lpRect, 3 /*DT_DWORD*/);
      rcRect.top=AkelPad.MemRead(lpRect + 4, 3 /*DT_DWORD*/);
    }
    AkelPad.MemFree(lpRect);
  }
  return bResult;
}

function CenterWindow(hWndParent, hWnd)
{
  var lpRect;
  var rcWndParent=[];
  var rcWnd=[];
  var X;
  var Y;

  if (lpRect=AkelPad.MemAlloc(16))  //sizeof(RECT)
  {
    if (!hWndParent)
      hWndParent=oSys.Call("user32::GetDesktopWindow");

    oSys.Call("user32::GetWindowRect", hWndParent, lpRect);
    RectToArray(lpRect, rcWndParent);

    oSys.Call("user32::GetWindowRect", hWnd, lpRect);
    RectToArray(lpRect, rcWnd);

    //Center window
    X=rcWndParent.left + ((rcWndParent.right - rcWndParent.left) / 2 - (rcWnd.right - rcWnd.left) / 2);
    Y=rcWndParent.top + ((rcWndParent.bottom - rcWndParent.top) / 2 - (rcWnd.bottom - rcWnd.top) / 2);

    oSys.Call("user32::SetWindowPos", hWnd, 0, X, Y, 0, 0, 0x15 /*SWP_NOSIZE|SWP_NOZORDER|SWP_NOACTIVATE*/);

    AkelPad.MemFree(lpRect);
  }
}

function ScrollLock(hWnd, bLock)
{
  AkelPad.SendMessage(hWnd, 3185 /*AEM_LOCKSCROLL*/, 3 /*SB_BOTH*/, bLock);
}

function ScrollCaret(hWnd)
{
  var lpStp;
  var dwScrollFlags=0;
  var dwScrollResult;

  if (lpStp=AkelPad.MemAlloc(_X64?32:20))  //sizeof(AESCROLLTOPOINT)
  {
    //Test scroll to caret
    dwScrollFlags=0x1|0x10|0x400|0x800 /*AESC_TEST|AESC_POINTCARET|AESC_OFFSETCHARX|AESC_OFFSETCHARY*/;
    AkelPad.MemCopy(lpStp, dwScrollFlags, 3 /*DT_DWORD*/);     //AESCROLLTOPOINT.dwFlags
    AkelPad.MemCopy(lpStp + (_X64?24:12), 1, 3 /*DT_DWORD*/);  //AESCROLLTOPOINT.nOffsetX
    AkelPad.MemCopy(lpStp + (_X64?28:16), 0, 3 /*DT_DWORD*/);  //AESCROLLTOPOINT.nOffsetY
    dwScrollResult=AkelPad.SendMessage(hWnd, 3183 /*AEM_SCROLLTOPOINT*/, 0, lpStp);

    dwScrollFlags=0x10 /*AESC_POINTCARET*/;
    if (dwScrollResult & 0x1 /*AECSE_SCROLLEDX*/)
      dwScrollFlags|=0x1000 /*AESC_OFFSETRECTDIVX*/;
    if (dwScrollResult & 0x2 /*AECSE_SCROLLEDY*/)
      dwScrollFlags|=0x2000 /*AESC_OFFSETRECTDIVY*/;

    //Scroll to caret
    AkelPad.MemCopy(lpStp, dwScrollFlags, 3 /*DT_DWORD*/);     //AESCROLLTOPOINT.dwFlags
    AkelPad.MemCopy(lpStp + (_X64?24:12), 3, 3 /*DT_DWORD*/);  //AESCROLLTOPOINT.nOffsetX
    AkelPad.MemCopy(lpStp + (_X64?28:16), 2, 3 /*DT_DWORD*/);  //AESCROLLTOPOINT.nOffsetY
    AkelPad.SendMessage(hWnd, 3183 /*AEM_SCROLLTOPOINT*/, 0, lpStp);

    AkelPad.MemFree(lpStp);
  }
}

function LOWORD(dwNumber)
{
  return (dwNumber & 0xffff);
}

function HIWORD(dwNumber)
{
  return (dwNumber >> 16);
}

function MAKELONG(a, b)
{
  return (a & 0xffff) | ((b & 0xffff) << 16);
}

function ScaleInit(hDC, hWnd)
{
  if (!ptScale.x && !ptScale.y)
  {
    var hNewDC=hDC;

    if (!hDC) hNewDC=oSys.Call("user32::GetDC", hWnd);

    if (hNewDC)
    {
      ptScale.x=oSys.Call("gdi32::GetDeviceCaps", hNewDC, 88 /*LOGPIXELSX*/);
      ptScale.y=oSys.Call("gdi32::GetDeviceCaps", hNewDC, 90 /*LOGPIXELSY*/);

      //Align to 16 pixel
      ptScale.x+=ptScale.x % 16;
      ptScale.y+=ptScale.y % 16;
    }
    else return false;

    if (!hDC) oSys.Call("user32::ReleaseDC", hWnd, hNewDC);
  }
  return true;
}

function ScaleX(x)
{
  if (ptScale.x)
    return oSys.Call("kernel32::MulDiv", x, ptScale.x, 96);
  return x;
}

function ScaleY(y)
{
  if (ptScale.y)
    return oSys.Call("kernel32::MulDiv", y, ptScale.y, 96);
  return y;
}

function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == STRID_LOWJSCRIPT)
      return "\u0412\u0435\u0440\u0441\u0438\u044F\u0020\u004A\u0053\u0063\u0072\u0069\u0070\u0074\u0020\u043D\u0438\u0436\u0435\u002C\u0020\u0447\u0435\u043C\u0020\u0035\u002E\u0035\u002E";
    if (nStringID == STRID_WHAT)
      return "\u0427\u0442\u043E\u003A";
    if (nStringID == STRID_WITH)
      return "\u0427\u0435\u043C\u003A";
    if (nStringID == STRID_ADD)
      return "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C...";
    if (nStringID == STRID_RENAME)
      return "\u041F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C...";
    if (nStringID == STRID_DELETE)
      return "\u0423\u0434\u0430\u043B\u0438\u0442\u044C";
    if (nStringID == STRID_NAME)
      return "\u0418\u043C\u044F";
    if (nStringID == STRID_MATCHCASE)
      return "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C\u0020\u0440\u0435\u0433\u0438\u0441\u0442\u0440";
    if (nStringID == STRID_MULTILINE)
      return "\u041C\u043D\u043E\u0433\u043E\u0441\u0442\u0440\u043E\u0447\u043D\u043E";
    if (nStringID == STRID_ESCAPESEQ)
      return "\u0045\u0073\u0063\u002D\u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438";
    if (nStringID == STRID_FUNCTION)
      return "\u0417\u0430\u043C\u0435\u043D\u044F\u0442\u044C\u0020\u043D\u0430\u0020\u0444\u0443\u043D\u043A\u0446\u0438\u044E";
    if (nStringID == STRID_DIRECTION)
      return "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435";
    if (nStringID == STRID_FORWARD)
      return "\u0412\u043D\u0438\u0437";
    if (nStringID == STRID_BACKWARD)
      return "\u0412\u0432\u0435\u0440\u0445";
    if (nStringID == STRID_BEGINNING)
      return "\u0421\u0020\u043D\u0430\u0447\u0430\u043B\u0430";
    if (nStringID == STRID_INSEL)
      return "\u0412\u0020\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0438";
    if (nStringID == STRID_ALLFILES)
      return "\u0412\u0441\u0435\u0020\u0444\u0430\u0439\u043B\u044B";
    if (nStringID == STRID_FINDNEXT)
      return "&\u041D\u0430\u0439\u0442\u0438\u0020\u0434\u0430\u043B\u0435\u0435";
    if (nStringID == STRID_REPLACE)
      return "&\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C";
    if (nStringID == STRID_REPLACEALL)
      return "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C &\u0432\u0441\u0451";
    if (nStringID == STRID_CANCEL)
      return "\u041E\u0442\u043C\u0435\u043D\u0430";
    if (nStringID == STRID_SYNTAXERROR)
      return "\u0421\u0438\u043D\u0442\u0430\u043A\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F\u0020\u043E\u0448\u0438\u0431\u043A\u0430\u003A\n \\\\ - \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439\u0020\u0441\u043B\u044D\u0448\n \\r - \u043A\u043E\u043D\u0435\u0446\u0020\u0441\u0442\u0440\u043E\u043A\u0438\n \\t - \u0437\u043D\u0430\u043A\u0020\u0442\u0430\u0431\u0443\u043B\u044F\u0446\u0438\u0438";
    if (nStringID == STRID_FINISHED)
      return "\u041F\u043E\u0438\u0441\u043A\u0020\u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u002E";
    if (nStringID == STRID_COUNTFILES)
      return "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u043D\u044B\u0445\u0020\u0444\u0430\u0439\u043B\u043E\u0432\u003A\u0020";
    if (nStringID == STRID_COUNTCHANGES)
      return "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u0020\u0437\u0430\u043C\u0435\u043D\u003A\u0020";
    if (nStringID == STRID_TEMPLATE1)
      return "\u0423\u0434\u0430\u043B\u0438\u0442\u044C\u0020\u043F\u0443\u0441\u0442\u044B\u0435\u0020\u0441\u0442\u0440\u043E\u043A\u0438";
    if (nStringID == STRID_TEMPLATE2)
      return "\u0423\u0434\u0430\u043B\u0438\u0442\u044C\u0020\u043F\u0440\u043E\u0431\u0435\u043B\u044B\u0020\u0432\u0020\u043D\u0430\u0447\u0430\u043B\u0435\u0020\u0438\u0020\u0432\u0020\u043A\u043E\u043D\u0446\u0435\u0020\u0441\u0442\u0440\u043E\u043A";
    if (nStringID == STRID_TEMPLATE3)
      return "\u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C\u0020\u0441\u0438\u043C\u0432\u043E\u043B\u044B\u0020\u043F\u0440\u043E\u0431\u0435\u043B\u0430\u043C\u0438";
  }
  else
  {
    if (nStringID == STRID_LOWJSCRIPT)
      return "JScript version is less than 5.5.";
    if (nStringID == STRID_WHAT)
      return "What:";
    if (nStringID == STRID_WITH)
      return "With:";
    if (nStringID == STRID_ADD)
      return "Add...";
    if (nStringID == STRID_RENAME)
      return "Rename...";
    if (nStringID == STRID_DELETE)
      return "Delete";
    if (nStringID == STRID_NAME)
      return "Name";
    if (nStringID == STRID_MATCHCASE)
      return "Case sensitive";
    if (nStringID == STRID_MULTILINE)
      return "Multiline";
    if (nStringID == STRID_ESCAPESEQ)
      return "Esc-sequences";
    if (nStringID == STRID_FUNCTION)
      return "Replace with function";
    if (nStringID == STRID_DIRECTION)
      return "Direction";
    if (nStringID == STRID_FORWARD)
      return "Down";
    if (nStringID == STRID_BACKWARD)
      return "Up";
    if (nStringID == STRID_BEGINNING)
      return "Beginning";
    if (nStringID == STRID_INSEL)
      return "In selection";
    if (nStringID == STRID_ALLFILES)
      return "All files";
    if (nStringID == STRID_FINDNEXT)
      return "&Find next";
    if (nStringID == STRID_REPLACE)
      return "&Replace";
    if (nStringID == STRID_REPLACEALL)
      return "Replace &all";
    if (nStringID == STRID_CANCEL)
      return "Cancel";
    if (nStringID == STRID_SYNTAXERROR)
      return "Syntax error:\n \\\\ - backslash\n \\r - line feed\n \\t - tabulation";
    if (nStringID == STRID_FINISHED)
      return "Search finished.";
    if (nStringID == STRID_COUNTFILES)
      return "Changed files: ";
    if (nStringID == STRID_COUNTCHANGES)
      return "Count of changes: ";
    if (nStringID == STRID_TEMPLATE1)
      return "Delete empty lines";
    if (nStringID == STRID_TEMPLATE2)
      return "Delete leading and trailing spaces";
    if (nStringID == STRID_TEMPLATE3)
      return "Zap symbols with spaces";
  }
  return "";
}
