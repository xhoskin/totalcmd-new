//// Evaluates an expression passed through command line.
//
// Example:
//  Call("Scripts::Main", 1, "EvalCmd.js", "AkelPad.SetSel(0, -1);")
//
//
//// ���������� ���������, ���������� ����� ��������� ������.
//
// ������:
//  Call("Scripts::Main", 1, "EvalCmd.js", "AkelPad.SetSel(0, -1);")

var pArgLine;

if (pArgLine=AkelPad.GetArgLine())
{
  eval(pArgLine);
}
