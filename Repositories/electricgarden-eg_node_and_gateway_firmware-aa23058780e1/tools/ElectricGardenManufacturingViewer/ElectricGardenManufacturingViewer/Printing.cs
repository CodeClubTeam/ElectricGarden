using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace ElectricGardenManufacturingViewer
{
    class Printing
    {
        // All units in millimeters
        const int MAX_HEIGHT = 50;
        const int MAX_WIDTH = 9;

        private static string DiscoverLabelPrinter()
        {
            var listOfPrinters = PrinterSettings.InstalledPrinters;
            foreach (String printer in listOfPrinters)
            {
                if (printer.Contains("2430PC"))
                {
                    return printer;
                }
            }
            return null;
        }

        private static SizeF DrawLabel(Graphics graphics, String text, Size drawSpace, int size = 12, float xOffset = 0, float yOffset = 0)
        {
            var font = new Font("Consolas", size);
            var fontSize = graphics.MeasureString(text, font);
            graphics.DrawString(text, font, Brushes.Black, new PointF(xOffset, yOffset + ( drawSpace.Height / 2 - fontSize.Height / 2)));
            return fontSize;
        }

        public static void PrintNodeLabel(string label, string prettyName)
        {
            var document = new PrintDocument();
            var labelPrinter = DiscoverLabelPrinter();
            if (labelPrinter == null)
            {
                MessageBox.Show("Could not find P-Touch 2430PC printer. I'm looking for '2430PC' in printer name.", "Printer not found", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            document.PrinterSettings.PrinterName = labelPrinter;

            PrintAction printAction = PrintAction.PrintToFile;

            document.BeginPrint += new PrintEventHandler((obj, e) =>
            {
                printAction = e.PrintAction;
                document.OriginAtMargins = false;   //true = soft margins, false = hard margins
                document.DefaultPageSettings.Landscape = false;
            });

            document.PrintPage += new PrintPageEventHandler((obj, e) =>
            {
                Graphics g = e.Graphics;
                RectangleF marginBounds = e.MarginBounds;
                RectangleF printableArea = e.PageSettings.PrintableArea;
                if (printAction == PrintAction.PrintToPreview)
                    g.TranslateTransform(printableArea.X, printableArea.Y);

                int availableWidth = (int)Math.Floor(document.OriginAtMargins
                    ? marginBounds.Width
                    : (e.PageSettings.Landscape
                        ? printableArea.Height
                        : printableArea.Width));
                            int availableHeight = (int)Math.Floor(document.OriginAtMargins
                                ? marginBounds.Height
                                : (e.PageSettings.Landscape
                                    ? printableArea.Width
                                    : printableArea.Height));

                var printableShort = availableWidth + 30;
                var printableLong = availableHeight + 60;
                var image = new Bitmap(printableLong, printableShort);
                image.SetResolution(e.PageSettings.PrinterResolution.X, e.PageSettings.PrinterResolution.Y);
                using (var graphics = Graphics.FromImage(image))
                {
                    // Draw label
                    DrawLabel(graphics, prettyName, image.Size, yOffset: -2 + 5, size: 10, xOffset: -5);
                    DrawLabel(graphics, label, image.Size, yOffset: 16 + 5, size: 6);
                }
                image.RotateFlip(RotateFlipType.Rotate90FlipNone);
                var ico = Properties.Resources.eg;
                ico = ico.Clone(new Rectangle(0, 0, ico.Width, ico.Height), PixelFormat.Format1bppIndexed);
                ico.RotateFlip(RotateFlipType.Rotate270FlipNone);
                var smallestDimension = Math.Min(e.PageSettings.PrintableArea.Width, e.PageSettings.PrintableArea.Height);
                var iconBiggest = Math.Max(ico.Width, ico.Height);
                var scale = smallestDimension / iconBiggest;
                e.Graphics.DrawImage(ico, new RectangleF(e.PageSettings.PrintableArea.X, e.PageSettings.PrintableArea.Y, scale * ico.Width, scale * ico.Height), new RectangleF(PointF.Empty, new SizeF(ico.Width, ico.Height)), GraphicsUnit.Pixel);
                e.Graphics.DrawImage(image, new PointF(e.PageSettings.PrintableArea.X * 2, e.PageSettings.PrintableArea.Y * 2 + ico.Height * scale));
            });

            var preview = new PrintPreviewDialog();
            preview.Document = document;
            preview.ShowDialog();
        }

        public static void PrintLabel(string label)
        {
            var labelPrinter = DiscoverLabelPrinter();
            if (labelPrinter == null)
            {
                MessageBox.Show("Could not find P-Touch 2430PC printer. I'm looking for '2430PC' in printer name.", "Printer not found", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            var document = new PrintDocument();
            document.PrinterSettings.PrinterName = labelPrinter;

            document.PrintPage += new PrintPageEventHandler((e, page) =>
            {
                var printableShort = (int)(page.PageSettings.PrintableArea.Width - page.PageSettings.PrintableArea.X);
                var printableLong = (int)(page.PageSettings.PrintableArea.Height - page.PageSettings.PrintableArea.Y);
                var image = new Bitmap(printableLong, printableShort);
                image.SetResolution(page.PageSettings.PrinterResolution.X, page.PageSettings.PrinterResolution.Y);
                SizeF textSize;
                using (var graphics = Graphics.FromImage(image))
                {
                    // Draw label
                    textSize = DrawLabel(graphics, label, image.Size);
                }
                image.RotateFlip(RotateFlipType.Rotate90FlipNone);
                var ico = Properties.Resources.eg;
                ico = ico.Clone(new Rectangle(0, 0, ico.Width, ico.Height), PixelFormat.Format1bppIndexed);
                ico.RotateFlip(RotateFlipType.Rotate270FlipNone);
                var smallestDimension = Math.Min(page.PageSettings.PrintableArea.Width, page.PageSettings.PrintableArea.Height);
                var iconBiggest = Math.Max(ico.Width, ico.Height);
                var scale = smallestDimension / iconBiggest;
                page.Graphics.DrawImage(ico, new RectangleF(page.PageSettings.PrintableArea.X, page.PageSettings.PrintableArea.Y, scale * ico.Width, scale * ico.Height), new RectangleF(PointF.Empty, new SizeF(ico.Width, ico.Height)), GraphicsUnit.Pixel);
                page.Graphics.DrawImage(image, new PointF(page.PageSettings.PrintableArea.X * 2, page.PageSettings.PrintableArea.Y * 2 + ico.Height * scale));
            });

            var preview = new PrintPreviewDialog();
            preview.Document = document;
            preview.ShowDialog();
        }
    }
}
