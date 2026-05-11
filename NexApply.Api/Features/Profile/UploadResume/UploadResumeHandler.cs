using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace NexApply.Api.Features.Profile.UploadResume;

public class UploadResumeHandler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment env) : IRequestHandler<UploadResumeCommand, Result<ResumeUploadDto>>
{
    public async Task<Result<ResumeUploadDto>> Handle(UploadResumeCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<ResumeUploadDto>.NotFound("Profile not found");

        var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads", "resumes");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{Path.GetExtension(request.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await File.WriteAllBytesAsync(filePath, request.FileData, ct);

        var parsedText = ExtractResumeText(request);
        
        profile.UpdateResume(fileName, parsedText);
        await context.SaveChangesAsync(ct);

        return Result<ResumeUploadDto>.Success(new ResumeUploadDto
        {
            FilePath = fileName,
            ParsedText = parsedText
        });
    }

    private static string ExtractResumeText(UploadResumeCommand request)
    {
        if (request.ContentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            return ExtractDocxText(request.FileData, request.FileName);

        if (request.ContentType == "application/pdf")
            return ExtractPdfText(request.FileData, request.FileName);

        return $"Uploaded resume image: {request.FileName}";
    }

    private static string ExtractDocxText(byte[] fileData, string fileName)
    {
        try
        {
            using var stream = new MemoryStream(fileData);
            using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
            var document = archive.GetEntry("word/document.xml");
            if (document is null)
                return $"Uploaded resume: {fileName}";

            using var documentStream = document.Open();
            var xml = XDocument.Load(documentStream);
            var text = string.Join(' ', xml.DescendantNodes().OfType<XText>().Select(node => node.Value));
            return NormalizeExtractedText(text, fileName);
        }
        catch
        {
            return $"Uploaded resume: {fileName}";
        }
    }

    private static string ExtractPdfText(byte[] fileData, string fileName)
    {
        var pdfText = Encoding.Latin1.GetString(fileData);
        var extractedText = new StringBuilder();

        foreach (Match streamMatch in Regex.Matches(pdfText, @"(?s)(?<dictionary><<.*?>>)\s*stream\r?\n(?<stream>.*?)\r?\n?endstream"))
        {
            var dictionary = streamMatch.Groups["dictionary"].Value;
            var streamText = streamMatch.Groups["stream"].Value;
            var streamBytes = Encoding.Latin1.GetBytes(streamText);
            var decodedStream = DecodePdfStream(streamBytes, dictionary);

            if (decodedStream.Length == 0)
                continue;

            extractedText.Append(' ');
            extractedText.Append(ExtractTextFromPdfContentStream(Encoding.Latin1.GetString(decodedStream)));
        }

        if (extractedText.Length == 0)
        {
            var fallbackText = Regex.Replace(pdfText, @"<[^>]+>|\[[^\]]+\]|/[A-Za-z0-9]+|\d+\s+\d+\s+obj|endobj|stream|endstream", " ");
            extractedText.Append(fallbackText);
        }

        return NormalizeExtractedText(extractedText.ToString(), fileName);
    }

    private static byte[] DecodePdfStream(byte[] streamBytes, string dictionary)
    {
        var decoded = streamBytes;

        if (dictionary.Contains("ASCII85Decode", StringComparison.OrdinalIgnoreCase))
            decoded = DecodeAscii85(decoded);

        if (dictionary.Contains("FlateDecode", StringComparison.OrdinalIgnoreCase))
            decoded = Inflate(decoded);

        return decoded;
    }

    private static byte[] DecodeAscii85(byte[] encodedBytes)
    {
        var input = Encoding.ASCII.GetString(encodedBytes).Trim();
        if (input.EndsWith("~>", StringComparison.Ordinal))
            input = input[..^2];

        var output = new List<byte>();
        var tuple = new List<byte>(5);

        foreach (var ch in input)
        {
            if (char.IsWhiteSpace(ch))
                continue;

            if (ch == 'z' && tuple.Count == 0)
            {
                output.AddRange([0, 0, 0, 0]);
                continue;
            }

            if (ch < '!' || ch > 'u')
                continue;

            tuple.Add((byte)(ch - 33));

            if (tuple.Count == 5)
            {
                WriteAscii85Tuple(tuple, output, 4);
                tuple.Clear();
            }
        }

        if (tuple.Count > 0)
        {
            var byteCount = tuple.Count - 1;
            while (tuple.Count < 5)
                tuple.Add(84);

            WriteAscii85Tuple(tuple, output, byteCount);
        }

        return output.ToArray();
    }

    private static void WriteAscii85Tuple(List<byte> tuple, List<byte> output, int byteCount)
    {
        uint value = 0;
        foreach (var item in tuple)
            value = value * 85 + item;

        var bytes = BitConverter.GetBytes(value);
        if (BitConverter.IsLittleEndian)
            Array.Reverse(bytes);

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
        catch
        {
            return [];
        }
    }

    private static string ExtractTextFromPdfContentStream(string contentStream)
    {
        var text = new StringBuilder();

        foreach (Match match in Regex.Matches(contentStream, @"\((?<text>(?:\\.|[^\\)])*)\)\s*Tj"))
        {
            text.Append(' ');
            text.Append(DecodePdfLiteral(match.Groups["text"].Value));
        }

        foreach (Match match in Regex.Matches(contentStream, @"\[(?<items>.*?)\]\s*TJ", RegexOptions.Singleline))
        {
            foreach (Match item in Regex.Matches(match.Groups["items"].Value, @"\((?<text>(?:\\.|[^\\)])*)\)"))
            {
                text.Append(' ');
                text.Append(DecodePdfLiteral(item.Groups["text"].Value));
            }
        }

        return text.ToString();
    }

    private static string DecodePdfLiteral(string value)
    {
        var decoded = new StringBuilder();

        for (var i = 0; i < value.Length; i++)
        {
            if (value[i] != '\\' || i == value.Length - 1)
            {
                decoded.Append(value[i]);
                continue;
            }

            var escaped = value[++i];
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

    private static string NormalizeExtractedText(string text, string fileName)
    {
        var readableText = Regex.Replace(text, @"[^\u0020-\u007E]+", " ");
        readableText = Regex.Replace(readableText, @"\s+", " ").Trim();

        return readableText.Length >= 20
            ? readableText
            : $"Uploaded resume: {fileName}";
    }
}
