//// Column selection counter.
//
// How to use:
// Select column with numbers for processing.
//
// Description:
// First selected line number is a initial number.
// Each next line will be increased at defined step.
//  3    3
//  9    4
//  2 -> 5
//  0    6
//  5    7
//
//
//// Увеличение чисел (счетчик) вертикального выделения.
//
// Как использовать:
// Выделите вертикальный блок с числами, которые необходимо преобразовать.
//
// Описание:
// Число в первой выделенной строке является начальным числом.
// Каждая последующая строка будет увеличина на величину назначенного шага.
//  3    3
//  9    4
//  2 -> 5
//  0    6
//  5    7

//Options
var nStep=1;
var nMinDigits=0;

//Variables
var hMainWnd=AkelPad.GetMainWnd();
var hWndEdit=AkelPad.GetEditWnd();
var oSys=AkelPad.SystemFunction();
var pScriptName=WScript.ScriptName;
var pSelText;
var pLinesArray;
var nFirstNumber;
var bMinus;
var nIndex=0;
var i;

if (hMainWnd)
{
  if (AkelPad.IsAkelEdit())
  {
    if (AkelPad.SendMessage(hWndEdit, 3125 /*AEM_GETSEL*/, 0, 0))
    {
      if (AkelPad.SendMessage(hWndEdit, 3127 /*AEM_GETCOLUMNSEL*/, 0, 0))
      {
        pSelText=AkelPad.GetSelText();

        if (pLinesArray=pSelText.split("\r"))
        {
          nFirstNumber=parseInt(pLinesArray[nIndex]);

          if (!isNaN(nFirstNumber))
          {
            if (nFirstNumber < 0)
              bMinus=true;
            else
              bMinus=false;
            pLinesArray[nIndex]="" + nFirstNumber + pLinesArray[nIndex].replace(/^(0x[\da-f]+|-{0,1}\d+)/i, "");
            for (i=RegExp.$1.length; i < nMinDigits; ++i)
              pLinesArray[nIndex]="0" + pLinesArray[nIndex];

            while (++nIndex < pLinesArray.length)
            {
              if (!isNaN(parseInt(pLinesArray[nIndex])))
              {
                if (bMinus)
                  nFirstNumber=nFirstNumber - nStep;
                else
                  nFirstNumber=nFirstNumber + nStep;
                pLinesArray[nIndex]="" + nFirstNumber + pLinesArray[nIndex].replace(/^(0x[\da-f]+|-{0,1}\d+)/i, "");
                for (i=RegExp.$1.length; i < nMinDigits; ++i)
                  pLinesArray[nIndex]="0" + pLinesArray[nIndex];
              }
            }
            pSelText=pLinesArray.join("\r");
            AkelPad.ReplaceSel(pSelText, true);
          }
        }
      }
      else AkelPad.MessageBox(hMainWnd, GetLangString(2), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
    }
    else AkelPad.MessageBox(hMainWnd, GetLangString(1), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
  }
  else AkelPad.MessageBox(hMainWnd, GetLangString(0), pScriptName, 48 /*MB_ICONEXCLAMATION*/);
}


//Functions
function GetLangString(nStringID)
{
  var nLangID=AkelPad.GetLangId(1 /*LANGID_PRIMARY*/);

  if (nLangID == 0x19) //LANG_RUSSIAN
  {
    if (nStringID == 0)
      return "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F\u0020\u0041\u006B\u0065\u006C\u0050\u0061\u0064\u0020\u0034\u002E\u0078\u002E\u0078\u0020\u0438\u043B\u0438\u0020\u0432\u044B\u0448\u0435";
    if (nStringID == 1)
      return "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442\u0020\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0439\u0020\u0442\u0435\u043A\u0441\u0442\u002E";
    if (nStringID == 2)
      return "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F\u0020\u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0435\u0020\u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435\u002E";
  }
  else
  {
    if (nStringID == 0)
      return "Required AkelPad 4.x.x or higher";
    if (nStringID == 1)
      return "No text selected.";
    if (nStringID == 2)
      return "Required column selection.";
  }
  return "";
}
