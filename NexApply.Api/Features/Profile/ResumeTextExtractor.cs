using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Tesseract;

namespace NexApply.Api.Features.Profile;

internal static class ResumeTextExtractor
{
    private const string DocxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private const string PdfContentType = "application/pdf";
    private const string ImageContentTypePrefix = "image/";
    private const int MinimumReadableLength = 20;

    public static bool IsSupported(string contentType) =>
        contentType == PdfContentType
        || contentType == DocxContentType
        || contentType.StartsWith(ImageContentTypePrefix, StringComparison.OrdinalIgnoreCase);

    public static string Extract(string contentType, byte[] fileData, string fileName)
    {
        if (contentType == DocxContentType)
        {
            return ExtractFromDocx(fileData, fileName);
        }

        if (contentType == PdfContentType)
        {
            return ExtractFromPdf(fileData, fileName);
        }

        if (contentType.StartsWith(ImageContentTypePrefix, StringComparison.OrdinalIgnoreCase))
        {
            return ExtractFromImage(fileData, fileName);
        }

        return Fallback(fileName);
    }

    private static string ExtractFromDocx(byte[] fileData, string fileName)
    {
        try
        {
            using var stream = new MemoryStream(fileData);
            using var archive = new ZipArchive(stream, ZipArchiveMode.Read);

            var document = archive.GetEntry("word/document.xml");
            if (document is null)
            {
                return Fallback(fileName);
            }

            using var documentStream = document.Open();
            var xml = XDocument.Load(documentStream);
            var text = string.Join(' ', xml.DescendantNodes().OfType<XText>().Select(node => node.Value));

            return Normalize(text, fileName);
        }
        catch (Exception exception) when (exception is InvalidDataException or System.Xml.XmlException)
        {
            return Fallback(fileName);
        }
    }

    private static string ExtractFromPdf(byte[] fileData, string fileName)
    {
        var pdfText = Encoding.Latin1.GetString(fileData);
        var extractedText = new StringBuilder();

        var streamPattern = @"(?s)(?<dictionary><<.*?>>)\s*stream\r?\n(?<stream>.*?)\r?\n?endstream";

        foreach (Match streamMatch in Regex.Matches(pdfText, streamPattern))
        {
            var dictionary = streamMatch.Groups["dictionary"].Value;
            var streamBytes = Encoding.Latin1.GetBytes(streamMatch.Groups["stream"].Value);
            var decodedStream = DecodeStream(streamBytes, dictionary);

            if (decodedStream.Length == 0)
            {
                continue;
            }

            extractedText.Append(' ');
            extractedText.Append(ExtractFromContentStream(Encoding.Latin1.GetString(decodedStream)));
        }

        if (extractedText.Length == 0)
        {
            var noisePattern = @"<[^>]+>|\[[^\]]+\]|/[A-Za-z0-9]+|\d+\s+\d+\s+obj|endobj|stream|endstream";
            extractedText.Append(Regex.Replace(pdfText, noisePattern, " "));
        }

        return Normalize(extractedText.ToString(), fileName);
    }

    private static byte[] DecodeStream(byte[] streamBytes, string dictionary)
    {
        var decoded = streamBytes;

        if (dictionary.Contains("ASCII85Decode", StringComparison.OrdinalIgnoreCase))
        {
            decoded = DecodeAscii85(decoded);
        }

        if (dictionary.Contains("FlateDecode", StringComparison.OrdinalIgnoreCase))
        {
            decoded = Inflate(decoded);
        }

        return decoded;
    }

    private static byte[] DecodeAscii85(byte[] encodedBytes)
    {
        var input = Encoding.ASCII.GetString(encodedBytes).Trim();
        if (input.EndsWith("~>", StringComparison.Ordinal))
        {
            input = input[..^2];
        }

        var output = new List<byte>();
        var tuple = new List<byte>(5);

        foreach (var character in input)
        {
            if (char.IsWhiteSpace(character))
            {
                continue;
            }

            if (character == 'z' && tuple.Count == 0)
            {
                output.AddRange([0, 0, 0, 0]);
                continue;
            }

            if (character < '!' || character > 'u')
            {
                continue;
            }

            tuple.Add((byte)(character - 33));

            if (tuple.Count == 5)
            {
                WriteTuple(tuple, output, 4);
                tuple.Clear();
            }
        }

        if (tuple.Count > 0)
        {
            var byteCount = tuple.Count - 1;
            while (tuple.Count < 5)
            {
                tuple.Add(84);
            }

            WriteTuple(tuple, output, byteCount);
        }

        return output.ToArray();
    }

    private static void WriteTuple(List<byte> tuple, List<byte> output, int byteCount)
    {
        uint value = 0;
        foreach (var item in tuple)
        {
            value = value * 85 + item;
        }

        var bytes = BitConverter.GetBytes(value);
        if (BitConverter.IsLittleEndian)
        {
            Array.Reverse(bytes);
        }

        output.AddRange(bytes.Take(byteCount));
    }

    private static byte[] Inflate(byte[] bytes)
    {
        try
        {
            using var input = new MemoryStream(bytes);
            using var zlib = new ZLibStream(input, CompressionMode.Decompress);
            using var output = new MemoryStream();
            zlib.CopyTo(output);

            return output.ToArray();
        }
        catch (InvalidDataException)
        {
            return [];
        }
    }

    private static string ExtractFromContentStream(string contentStream)
    {
        var text = new StringBuilder();

        foreach (Match match in Regex.Matches(contentStream, @"\((?<text>(?:\\.|[^\\)])*)\)\s*Tj"))
        {
            text.Append(' ');
            text.Append(DecodeLiteral(match.Groups["text"].Value));
        }

        foreach (Match match in Regex.Matches(contentStream, @"\[(?<items>.*?)\]\s*TJ", RegexOptions.Singleline))
        {
            foreach (Match item in Regex.Matches(match.Groups["items"].Value, @"\((?<text>(?:\\.|[^\\)])*)\)"))
            {
                text.Append(' ');
                text.Append(DecodeLiteral(item.Groups["text"].Value));
            }
        }

        return text.ToString();
    }

    private static string DecodeLiteral(string value)
    {
        var decoded = new StringBuilder();

        for (var index = 0; index < value.Length; index++)
        {
            if (value[index] != '\\' || index == value.Length - 1)
            {
                decoded.Append(value[index]);
                continue;
            }

            var escaped = value[++index];
            decoded.Append(escaped switch
            {
                'n' => '\n',
                'r' => '\r',
                't' => '\t',
                'b' => '\b',
                'f' => '\f',
                '(' => '(',
                ')' => ')',
                '\\' => '\\',
                _ => escaped
            });
        }

        return decoded.ToString();
    }

    private static string ExtractFromImage(byte[] fileData, string fileName)
    {
        try
        {
            var tessDataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata");
            if (!Directory.Exists(tessDataPath))
            {
                return $"Uploaded resume image: {fileName} (OCR data not available)";
            }

            using var engine = new TesseractEngine(tessDataPath, "eng", EngineMode.Default);
            using var image = Pix.LoadFromMemory(fileData);
            using var page = engine.Process(image);

            return Normalize(page.GetText(), fileName);
        }
        catch (Exception exception) when (exception is TesseractException or ArgumentException)
        {
            return $"Uploaded resume image: {fileName}";
        }
    }

    private static string Normalize(string text, string fileName)
    {
        var readableText = Regex.Replace(text, @"[^\u0020-\u007E]+", " ");
        readableText = Regex.Replace(readableText, @"\s+", " ").Trim();

        return readableText.Length >= MinimumReadableLength ? readableText : Fallback(fileName);
    }

    private static string Fallback(string fileName) => $"Uploaded resume: {fileName}";
}
