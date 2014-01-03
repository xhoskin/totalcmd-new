Autodesk® 3ds Max® Preview plugin 1.2.1.0 for Total Commander
=============================================================

 * License:
-----------

This software is released as freeware.


 * Disclaimer:
--------------

This software is provided "AS IS" without any warranty, either expressed or
implied, including, but not limited to, the implied warranties of
merchantability and fitness for a particular purpose. The author will not be
liable for any special, incidental, consequential or indirect damages due to
loss of data or any other reason.


 * Installation:
----------------

Open the plugin archive using Total Commander and installation will start.
The default configuration file 3dsmax.ini is initialized during the very first
plugin usage.


 * Update Remarks:
------------------

 o With version 1.2.0.1 the default directory of the initialization file
   3dsmax.ini was changed from plugin directory to the same directory as
   wincmd.ini.


 * Description:
---------------

Autodesk 3ds Max stores a preview thumbnail for Max files. This is typically
shown in the File-Open dialog of Autodesk 3ds Max.

The Autodesk 3ds Max Preview plugin shows the embedded preview thumbnail of
3ds Max files (Version >= 3). It can also be used for the thumbnail view
of Total Commander >= 6.5.

Extracting the preview thumbnail does not require Autodesk 3ds Max to be
installed.

The default thumbnail width, height and background color can be set in
section [Autodesk 3ds Max Preview Settings] of 3dsmax.ini.

The optional status bar displays the Autodesk 3ds Max version.


 * Examples:
------------

You can download some example 3ds Max files from
http://tbeu.totalcmd.net/3dsmax/3dsMax_SampleFiles.zip. Total download
size is about 92 kByte.


 * Limitations:
---------------

 o 3ds Max files must be of Version >= 3.


 * ChangeLog:
-------------

 o Version 1.2.1.0 (25.09.2011)
   - fixed setting of background color
   - added print preview bitmap (CTRL+P)
   - added 64 bit support (for Total Commander >= 8 beta 1)
 o Version 1.2.0.1 (12.02.2010)
   - added optional status bar instead of version text in bitmap
   - fixed fullscreen view: use maximum window size
   - changed directory of 3dsmax.ini from plugin directory to same directory
     as wincmd.ini
 o Version 1.2.0.0 (28.01.2010)
   - added Unicode support of files names (for Total Commander >= 7.50)
   - added display of 3ds Max file version in bitmap
   - fixed crash when closing the lister window
 o Version 1.1.2.1 (03.12.2007)
   - fixed: return NULL in ListLoad() if extraction of preview bitmap fails
 o Version 1.1.2.0 (13.04.2007)
   - fixed vertical scrolling
 o Version 1.1.1.0 (02.02.2007)
   - added: copy preview bitmap to clipboard (CTRL+C)
 o Version 1.1.0.0 (28.11.2006)
   - added support for new lister option: "Center images" (for Total Commander
     >= 7 beta 1)
   - added: avoid flickering of preview window when switching from one file to
     the next (for Total Commander >= 7 beta 2)
   - added scrolling
 o Version 1.0.4.0 (25.03.2006)
   - fixed displaying of thumbnails in multiple instances of lister window
 o Version 1.0.3.1 (13.03.2006)
   - fixed: display empty lister window in case of failed thumbnail extraction
 o Version 1.0.3.0 (12.03.2006)
   - added option Debug in 3dsmax.ini
   - fixed error handling
 o Version 1.0.2.0 (12.03.2006)
   - added option BackColor, Height and Width in 3dsmax.ini
 o Version 1.0.1.0 (01.03.2006)
   - added thumbnail view
   - added fit image to window in Quick View mode
 o Version 1.0.0.1 (28.02.2006)
   - first nightly build


 * References:
--------------

 o LS-Plugin Writer's Guide by Christian Ghisler
   - http://ghisler.fileburst.com/lsplugins/listplughelp2.1.zip


 * Trademark and Copyright Statements:
--------------------------------------

 o Autodesk and 3ds Max are registered trademarks or trademarks of Autodesk,
   Inc./Autodesk Canada Co.
   - http://www.autodesk.com/3dsmax
 o Total Commander is Copyright © 1993-2011 by Christian Ghisler, Ghisler Software GmbH.
   - http://www.ghisler.com
 o MPRESS is Copyright © 1997-2011 by MATCODE Software
   - http://www.matcode.com/mpress.htm


 * Feedback:
------------

If you have problems, questions, suggestions please contact Thomas Beutlich.
 o Email: support@tbeu.de
 o URL: http://tbeu.totalcmd.net