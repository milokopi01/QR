/**
 * QR Kongsi — Google Apps Script backend
 *
 * Pemasangan:
 * 1. Buka https://script.google.com > New project > tampal fail ini.
 * 2. Deploy > New deployment > Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Salin URL /exec dan tampal di bahagian PALING ATAS <script> dalam index.html
 *    (pembolehubah APPS_SCRIPT_URL).
 */

// ★ ID Google Sheet & Folder Drive (sudah ditetapkan) ★
var SHEET_ID  = '1vDW6ZGs56jo3Yz4b7odhwwAE-GEiUxODB2RYZAeFIHg';
var FOLDER_ID = '1KrJbpCj205Z1j6ITzC9vguVZUzCHr14B';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var name = p.name || ('fail-' + Date.now());
    var type = p.type || 'application/octet-stream';
    var data = p.data;

    if (!data) return json({ error: 'Tiada data fail diterima.' });

    var bytes = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(bytes, type, name);

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var url = 'https://drive.google.com/file/d/' + file.getId() + '/view';

    // Rekodkan setiap muat naik dalam Google Sheet
    try {
      var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Tarikh', 'Nama Fail', 'Jenis', 'Saiz (bait)', 'ID Fail', 'Pautan']);
      }
      sheet.appendRow([new Date(), file.getName(), type, file.getSize(), file.getId(), url]);
    } catch (logErr) {
      // Gagal log tidak menghalang respons utama
    }

    return json({ url: url, id: file.getId(), name: file.getName(), size: file.getSize() });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'QR Kongsi', time: new Date().toISOString() });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
