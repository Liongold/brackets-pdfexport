# Export as PDF - Brackets.io Extension
Export as PDF is an extension designed for Brackets.io that allows the user to export both all or part of the code in the current document to a PDF file which can be then opened by a number of applications such as Adobe Reader. 

Compatible with Brackets 0.43 and newer. 

## Installation

### Through the Brackets Extension Manager
1. Open Brackets
2. Open the Brackets Extension Manager by opening the 'File' menu and then clicking on the 'Extension Manager...' item. 
3. In the Search box on the top right of the dialog, type: 'export'. 
4. Find ExportPDF from the list and then click Install. 

### From Github
#### Installing a pre-built release
1. Go to the [Releases section of our Github repo](https://github.com/Liongold/brackets-pdfexport/releases) in your favourite web browser 
2. Choose which release you want to install
3. Download the clicking the brackets-pdfexport.zip link below the Downloads header. 
4. When the download finishes, open Brackets
5. Go to Help > Show Extensions Folder
6. In the File Manager window that opens, go to the "user" folder
7. Move the extension zip file from your Downloads folder to the "user" folder

#### Installing the latest source code
1. Go to our [Github repo](https://github.com/Liongold/brackets-pdfexport) in your favourite web browser
2. On the right sidebar, click on Download ZIP
3. When the download finishes, open Brackets
4. Go to Help > Show Extensions Folder
5. In the File Manager window that opens, go to the "user" folder
6. Move the extension zip file from your Downloads folder to the "user" folder

Please note that after each of these methods, Brackets needs to be restarted to make sure that the extension has been installed correctly. 

## Features
* Export all code in current document to PDF
* Export selected code to PDF
* Set document margins before export
* Change document font size
* Open default PDF reading application after export

## How To Use
1. Open file you want to export (for whole file export) or select the part you want to export.
2. Go to File > Export as PDF...
3. Review Properties in the dialog that opens up
4. Press OK

## Contributing
Everyone's welcome to contribute to the development of this extension. There are a number of ways how you can help. If you found a bug, please [report it on Github](https://github.com/Liongold/brackets-pdfexport/issues/new/). You can also help us by contributing code for a new feature you'd like to implement or to fix an already-reported issue. 

## Acknowledgements
This extension would not be here if it wasn't for the help of Steffen Bruchmann ([sbruchmann](https://github.com/sbruchmann)). This extension makes use of [PDFKit](https://github.com/devongovett/pdfkit) and [blob-stream](https://github.com/devongovett/blob-stream), two libraries by Devon Govett and other contributors. 

## Changelog
### Version 1.0.4 - Released March 4, 2016
* Added German translation (by @douira)

### Version 1.0.3 - Released August 26, 2015
* Fixed two small mistakes in Italian translation

### Version 1.0.2 - Released August 21, 2015
* Fixed an issue when exporting a selected portion only

### Version 1.0.1 - Released August 7, 2015
* Updated Italian translation (by @Denisov21 - Grazie!)
* Error prompts could have been triggered by other extensions

### Version 1.0.0 - Released July 31, 2015
* Initial release

## License
This extension is licensed under the MIT License. You should receive a copy of this license with the extension. If you do not receive it, please read it online on [Github](https://github.com/Liongold/brackets-pdfexport/blob/master/LICENSE). 
