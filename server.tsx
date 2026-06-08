import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import QRCode from "qrcode";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper: Convert milimeters to points (72 points = 1 inch = 25.4 mm)
const mmToPoints = (mm: number): number => {
  return (mm * 72) / 25.4;
};

// Define PDF Document Template Component
interface PrintPdfDocProps {
  event: any;
  guest: any;
  qrCodeDataUrl: string;
  bleedMm: number;
  paperWidthMm: number;
  paperHeightMm: number;
  includeTrimMarks: boolean;
  accentColor: string;
  fontStyles: {
    title: string;
    body: string;
  };
}

const PrintPdfDoc: React.FC<PrintPdfDocProps> = ({
  event,
  guest,
  qrCodeDataUrl,
  bleedMm,
  paperWidthMm,
  paperHeightMm,
  includeTrimMarks,
  accentColor,
  fontStyles,
}) => {
  // Convert measurements to PDF points
  const bleedPt = mmToPoints(bleedMm);
  const widthPt = mmToPoints(paperWidthMm) + (bleedPt * 2);
  const heightPt = mmToPoints(paperHeightMm) + (bleedPt * 2);
  
  // Safe area boundaries (Trim lines)
  const trimLeft = bleedPt;
  const trimRight = widthPt - bleedPt;
  const trimTop = bleedPt;
  const trimBottom = heightPt - bleedPt;

  // Visual Safe boundary inset to keep elements away from cut line (e.g. 5mm inside cut)
  const safeInset = mmToPoints(5);
  const safeLeft = trimLeft + safeInset;
  const safeRight = trimRight - safeInset;
  const safeTop = trimTop + safeInset;
  const safeBottom = trimBottom - safeInset;

  const resolvedAccent = accentColor || "#18181b"; // default charcoal dark

  // Color mappings based on templates
  const templateTheme = event?.template_id || "classic";
  const bgColors = {
    classic: "#FAF9F6", // elegant vintage off-white
    bunga: "#FEF7F7",   // soft rose-tinted blush
    modern: "#FFFFFF",  // clean modern white
  };
  const resolvedBg = bgColors[templateTheme as keyof typeof bgColors] || "#FAF9F6";

  const styles = StyleSheet.create({
    page: {
      position: "relative",
      width: widthPt,
      height: heightPt,
      backgroundColor: resolvedBg,
      padding: 0,
      margin: 0,
    },
    bleedBorder: {
      position: "absolute",
      left: trimLeft,
      top: trimTop,
      width: widthPt - (bleedPt * 2),
      height: heightPt - (bleedPt * 2),
      borderWidth: 0.5,
      borderStyle: "dashed",
      borderColor: "#d1d5db", // Subtle trim line guide for physical inspection
    },
    // Crop Marks layout styled components
    cropMark: {
      position: "absolute",
      backgroundColor: "#a1a1aa", // registration gray color
    },
    // Card core content areas
    contentContainer: {
      position: "absolute",
      left: safeLeft,
      top: safeTop,
      width: safeRight - safeLeft,
      height: safeBottom - safeTop,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLabel: {
      fontFamily: fontStyles.body,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: "#71717a",
      textTransform: "uppercase",
      marginBottom: 3,
    },
    eventTitle: {
      fontFamily: fontStyles.title,
      fontSize: 18,
      fontWeight: "bold",
      color: resolvedAccent,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 3,
    },
    metadataText: {
      fontFamily: fontStyles.body,
      fontSize: 8,
      color: "#52525b",
      textAlign: "center",
      marginTop: 2,
    },
    eventLocation: {
      fontFamily: fontStyles.body,
      fontSize: 7.5,
      color: "#71717a",
      textAlign: "center",
      marginTop: 2,
      maxWidth: 180,
    },
    separatorLine: {
      width: 40,
      height: 1,
      backgroundColor: resolvedAccent,
      marginVertical: 10,
    },
    recipientCard: {
      width: "100%",
      backgroundColor: templateTheme === "bunga" ? "#FEE2E2" : "#F4F4F5",
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: templateTheme === "bunga" ? "#FCA5A5" : "#E4E4E7",
      padding: 10,
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    recipientLabel: {
      fontFamily: fontStyles.body,
      fontSize: 7,
      color: "#71717a",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    recipientName: {
      fontFamily: fontStyles.title,
      fontSize: 12,
      fontWeight: "bold",
      color: "#09090b",
      textAlign: "center",
    },
    qrFrame: {
      width: 105,
      height: 105,
      borderWidth: 1,
      borderColor: resolvedAccent,
      borderRadius: 8,
      padding: 5,
      backgroundColor: "#FFFFFF",
      marginTop: 5,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    qrImage: {
      width: 95,
      height: 95,
    },
    qrInstruction: {
      fontFamily: fontStyles.body,
      fontSize: 6.5,
      color: "#71717a",
      marginTop: 4,
      textAlign: "center",
    },
    footerLegal: {
      fontFamily: fontStyles.body,
      fontSize: 6,
      color: "#a1a1aa",
      textAlign: "center",
      marginTop: 15,
      textTransform: "uppercase",
      letterSpacing: 1,
    }
  });

  // Calculate and render professional corner crop marks helper
  const renderCropMarks = () => {
    if (!includeTrimMarks) return null;
    
    const cropLength = 15; // 15 points length
    const cropOffset = 3;  // offset 3 points gap from cut line to avoid bleeding mark into print
    const strokeWidth = 0.5;

    return (
      <>
        {/* Top-Left Corner */}
        {/* Horizontal */}
        <View style={[styles.cropMark, { left: trimLeft - cropLength - cropOffset, top: trimTop, width: cropLength, height: strokeWidth }]} />
        {/* Vertical */}
        <View style={[styles.cropMark, { left: trimLeft, top: trimTop - cropLength - cropOffset, width: strokeWidth, height: cropLength }]} />

        {/* Top-Right Corner */}
        {/* Horizontal */}
        <View style={[styles.cropMark, { left: trimRight + cropOffset, top: trimTop, width: cropLength, height: strokeWidth }]} />
        {/* Vertical */}
        <View style={[styles.cropMark, { left: trimRight, top: trimTop - cropLength - cropOffset, width: strokeWidth, height: cropLength }]} />

        {/* Bottom-Left Corner */}
        {/* Horizontal */}
        <View style={[styles.cropMark, { left: trimLeft - cropLength - cropOffset, top: trimBottom, width: cropLength, height: strokeWidth }]} />
        {/* Vertical */}
        <View style={[styles.cropMark, { left: trimLeft, top: trimBottom + cropOffset, width: strokeWidth, height: cropLength }]} />

        {/* Bottom-Right Corner */}
        {/* Horizontal */}
        <View style={[styles.cropMark, { left: trimRight + cropOffset, top: trimBottom, width: cropLength, height: strokeWidth }]} />
        {/* Vertical */}
        <View style={[styles.cropMark, { left: trimRight, top: trimBottom + cropOffset, width: strokeWidth, height: cropLength }]} />
      </>
    );
  };

  const formattedDate = event?.event_date 
    ? new Date(event.event_date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      })
    : "";

  return (
    <Document>
      {/* Front Page Layout */}
      <Page size={[widthPt, heightPt]} style={styles.page}>
        {/* Crop Marks & Guideline Boxes */}
        {renderCropMarks()}
        <View style={styles.bleedBorder} />

        <View style={styles.contentContainer}>
          <View style={{ alignItems: "center", width: "100%" }}>
            <Text style={styles.headerLabel}>OFFICIAL INVITATION</Text>
            {event?.cover_image_url ? (
              <Image 
                src={event.cover_image_url} 
                style={{
                  width: widthPt - (bleedPt * 2) - mmToPoints(24),
                  height: 90,
                  borderRadius: 6,
                  objectFit: "cover",
                  marginBottom: 8,
                }} 
              />
            ) : null}
            <Text style={styles.eventTitle}>{event?.title || "Special Invitation"}</Text>
            <View style={styles.separatorLine} />
            <Text style={styles.metadataText}>🗓️ {formattedDate}</Text>
            <Text style={styles.eventLocation}>📍 {event?.location || "Lokasi Acara"}</Text>
          </View>

          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={styles.recipientCard}>
              <Text style={styles.recipientLabel}>Kepada Yth. Bapak/Ibu/Saudara/i:</Text>
              <Text style={styles.recipientName}>{guest?.name || "Tamu Undangan Istimewa"}</Text>
              {guest?.phone && (
                <Text style={{ fontSize: 6.5, color: "#71717a", marginTop: 2, fontFamily: "Helvetica-Oblique" }}>
                  📞 {guest.phone}
                </Text>
              )}
            </View>
            <Text style={styles.footerLegal}>Powered by Invitely. Online Ticket & RSVP Platform</Text>
          </View>
        </View>
      </Page>

      {/* Back Page / Card Inside Side Cover with QR Code Details */}
      <Page size={[widthPt, heightPt]} style={styles.page}>
        {renderCropMarks()}
        <View style={styles.bleedBorder} />

        <View style={styles.contentContainer}>
          <View style={{ alignItems: "center", width: "100%" }}>
            <Text style={styles.headerLabel}>Digital Access & Verifikasi QR</Text>
            <Text style={{ fontFamily: fontStyles.title, fontSize: 13, fontWeight: "bold", color: resolvedAccent, marginTop: 4, textAlign: "center" }}>
              Silakan Pindai Barcode Di Bawah Untuk Check-in / Info Detail
            </Text>
            <View style={styles.separatorLine} />
            
            {/* The base64 rendered QR code unique to this guest */}
            <View style={styles.qrFrame}>
              {qrCodeDataUrl ? (
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
              ) : null}
            </View>
            <Text style={styles.qrInstruction}>SCAN DUA ARAH UNTUK VERIFIKASI BARCODE DI RESERVASi MEJA</Text>
          </View>

          {/* Conditional Theme Content per Event Type */}
          <View style={{ width: "100%", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 8, borderWidth: 0.5, borderColor: "#e4e4e7" }}>
            <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#18181b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 3 }}>
              Informasi Khusus ({event?.event_type || "Wedding"})
            </Text>
            
            {(!event?.event_type || event.event_type === "wedding") ? (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>👩 Pengantin Wanita: {event?.custom_fields?.bride || "Siti Nurhayati"}</Text>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>👨 Pengantin Pria: {event?.custom_fields?.groom || "Andi Prasetyo"}</Text>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🕰️ Sesi Akad / Resepsi: {event?.custom_fields?.akad_time || "08:00"} - {event?.custom_fields?.reception_time || "Selesai"}</Text>
              </View>
            ) : event.event_type === "birthday" ? (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🎂 Merayakan Usia Ke: {event?.custom_fields?.age || "17"} Tahun</Text>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🎁 Shopee/Tokopedia Wishlist: {event?.custom_fields?.wishlist_url || "-"}</Text>
              </View>
            ) : event.event_type === "corporate" ? (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🏢 Penyelenggara: {event?.custom_fields?.company || "-"}</Text>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🎙️ Pemateri: {event?.custom_fields?.speakers_raw || "-"}</Text>
              </View>
            ) : event.event_type === "grand_opening" ? (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🏷️ Kode Promo Kasir: {event?.custom_fields?.promo_code || "COFFEE50"}</Text>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>🚗 Lokasi Parkir: {event?.custom_fields?.parking_guide_info || "-"}</Text>
              </View>
            ) : (
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: fontStyles.body, fontSize: 7, color: "#52525b" }}>Undangan Cetak Resmi ini sah digunakan sebagai bukti penukaran suvenir, kupon makan katering, dan kursi VVIP.</Text>
              </View>
            )}
          </View>

          <View style={{ width: "100%", alignItems: "center", marginTop: 5 }}>
            <Text style={{ fontFamily: fontStyles.body, fontSize: 6.5, color: "#a1a1aa", textAlign: "center" }}>
              Dimohon hadir tepat waktu. Terima kasih banyak atas kehormatan kunjungan Anda.
            </Text>
            <Text style={styles.footerLegal}>ID Tamu: {guest?.id || "N/A"} | UNIK LINK: {guest?.unique_link || "N/A"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// -----------------------------------------------------
// Express API Endpoint: POST /api/generate-pdf
// -----------------------------------------------------
app.post("/api/generate-pdf", async (req, res) => {
  try {
    const {
      event,
      guest,
      scannedUrl,
      bleedMm = 3,
      paperSize = "postcard",
      includeTrimMarks = true,
      accentColor = "#18181b"
    } = req.body;

    if (!event || !guest || !scannedUrl) {
      return res.status(400).json({ error: "Missing required parameters: event, guest, and scannedUrl are mandatory." });
    }

    // Determine dimensions in mm based on paperSize
    let paperWidthMm = 100;
    let paperHeightMm = 150;

    const lowerSize = String(paperSize).toLowerCase();
    if (lowerSize === "a6") {
      paperWidthMm = 105;
      paperHeightMm = 148;
    } else if (lowerSize === "a5") {
      paperWidthMm = 148;
      paperHeightMm = 210;
    } else if (lowerSize === "square") {
      paperWidthMm = 140;
      paperHeightMm = 140;
    }

    // Select core system PDF fonts (Helvetica and Times are standard vector core font assets inside react-pdf compiler)
    const fontStyles = {
      title: event.template_id === "classic" || event.template_id === "bunga" ? "Times-Bold" : "Helvetica-Bold",
      body: event.template_id === "classic" || event.template_id === "bunga" ? "Times-Roman" : "Helvetica",
    };

    // Generate high resolution QR code PNG buffer inside Node context
    const qrCodeDataUrl = await QRCode.toDataURL(scannedUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    // Create a react-pdf element representation
    const element = React.createElement(PrintPdfDoc, {
      event,
      guest,
      qrCodeDataUrl,
      bleedMm: Number(bleedMm),
      paperWidthMm,
      paperHeightMm,
      includeTrimMarks: includeTrimMarks === true || includeTrimMarks === "true",
      accentColor,
      fontStyles,
    });

    // Generate PDF stream and cast to a node buffer
    const pdfStream = (await pdf(element).toBuffer()) as any;

    // Set Response Headers for file attachments stream download
    const cleanFileName = `Undangan_Cetak_${String(event.title || "Event").replace(/[^a-zA-Z0-9]/g, "_")}_${String(guest.name || "Guest").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFileName}"`);
    res.setHeader("Content-Length", pdfStream.length);
    
    res.send(pdfStream);

  } catch (error: any) {
    console.error("PDF generation failure: ", error);
    res.status(500).json({ error: "Failed to generate print-ready PDF invitation file.", details: error.message });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "invitely-node-pdf-renderer" });
});

// Configure Vite integration inside Node.js Server Environment
const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  // Serve single-page application fallback for client routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start full-stack web listener
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is booting. System listening on http://localhost:${PORT} in ${isProd ? "production" : "development"} mode.`);
});
