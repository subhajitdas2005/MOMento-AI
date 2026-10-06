/**
 * Bulletproof cross-browser file downloader
 * Ensures proper filenames, extensions, and prevents premature Blob URL revocation.
 */
export function triggerFileDownload(blob: Blob, filename: string, mimeType?: string) {
  if (typeof window === 'undefined') return;

  // Ensure blob has explicit mime type
  const finalBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;

  // Clean filename of any invalid OS characters
  const cleanName = filename.replace(/[\\/:*?"<>|]/g, '_').trim();

  // Create Object URL
  const blobUrl = window.URL.createObjectURL(finalBlob);

  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = blobUrl;
  anchor.download = cleanName;
  anchor.setAttribute('download', cleanName);

  document.body.appendChild(anchor);
  anchor.click();

  // Keep Object URL alive for 45 seconds so Chrome/Edge completely finishes writing metadata
  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
    window.URL.revokeObjectURL(blobUrl);
  }, 45000);
}
