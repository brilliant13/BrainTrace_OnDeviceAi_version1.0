import {
    TbFileTypePdf,
    TbFileTypePng,
    TbFileTypeJpg,
    TbFileTypeJs,
    TbFileTypeCss,
    TbFileTypeDocx,
    TbFileTypeXls,
    TbFileTypePpt,
    TbFileTypeTxt,
    TbFileTypeHtml,
    TbFileTypeSvg,
    TbFileTypeTs,
    TbFileTypeXml,
    TbFileTypeZip,
    TbFileUnknown,
} from "react-icons/tb";

function FileIcon({ fileName }) {
    const iconSize = 20; // 원하는 크기로 조정 (예: 18, 20, 24 등)

    if (!fileName || typeof fileName !== "string") {
        return <TbFileUnknown color="black" size={iconSize} />;
    }

    const lower = fileName.toLowerCase();

    if (lower.endsWith(".pdf")) return <TbFileTypePdf color="black" size={iconSize} />;
    if (lower.endsWith(".png")) return <TbFileTypePng color="black" size={iconSize} />;
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return <TbFileTypeJpg color="black" size={iconSize} />;
    if (lower.endsWith(".js") || lower.endsWith(".jsx")) return <TbFileTypeJs color="black" size={iconSize} />;
    if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return <TbFileTypeTs color="black" size={iconSize} />;
    if (lower.endsWith(".css")) return <TbFileTypeCss color="black" size={iconSize} />;
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return <TbFileTypeDocx color="black" size={iconSize} />;
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return <TbFileTypeXls color="black" size={iconSize} />;
    if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return <TbFileTypePpt color="black" size={iconSize} />;
    if (lower.endsWith(".txt")) return <TbFileTypeTxt color="black" size={iconSize} />;
    if (lower.endsWith(".html")) return <TbFileTypeHtml color="black" size={iconSize} />;
    if (lower.endsWith(".svg")) return <TbFileTypeSvg color="black" size={iconSize} />;
    if (lower.endsWith(".xml")) return <TbFileTypeXml color="black" size={iconSize} />;
    if (lower.endsWith(".zip")) return <TbFileTypeZip color="black" size={iconSize} />;

    return <TbFileUnknown color="black" size={iconSize} />;
}

export default FileIcon;
