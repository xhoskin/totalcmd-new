//// Evaluates an expression passed through command line.
//
// Variables:
// %%f active file
// %%d directory of active file
// %%a AkelPad's directory
//
// Example:
//  Call("Scripts::Main", 1, "EvalCmd.js", "AkelPad.SetSel(0, -1);")
//
//
//// ���������� ���������, ���������� ����� ��������� ������.
//
// ����������:
// %%f  �������� ����
// %%d  ���������� ��������� �����
// %%a  ���������� AkelPad'�
//
// ������:
//  Call("Scripts::Main", 1, "EvalCmd.js", "AkelPad.SetSel(0, -1);")

var pArgLine;

if (pArgLine=AkelPad.GetArgLine())
{
  if (/%f|%d|%a/.test(pArgLine))
  {
    var pFile=AkelPad.GetEditFile(0).replace(/\\/g, "\\\\");
    var pFileDir=pFile.substr(0, pFile.lastIndexOf("\\\\"));
    var pAkelDir=AkelPad.GetAkelDir().replace(/\\/g, "\\\\");

    pArgLine=pArgLine.replace(/%f/g, pFile);
    pArgLine=pArgLine.replace(/%d/g, pFileDir);
    pArgLine=pArgLine.replace(/%a/g, pAkelDir);
  }
  eval(pArgLine);
}
