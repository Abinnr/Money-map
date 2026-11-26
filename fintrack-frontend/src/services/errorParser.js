/**
 * Extracts a clean, user-friendly message from backend ApiErrorResponse JSON
 * or plain-text responses, never exposing raw JSON, timestamps, or paths.
 */
export async function extractErrorMessage(response, fallbackMessage) {
  let rawText = "";
  try {
    rawText = await response.text();
  } catch {
    return fallbackMessage;
  }

  if (!rawText || !rawText.trim()) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(rawText);

    if (parsed && typeof parsed === "object") {
      if (parsed.fieldErrors && typeof parsed.fieldErrors === "object") {
        const firstFieldError = Object.values(parsed.fieldErrors).find(
          (val) => typeof val === "string" && val.trim().length > 0
        );
        if (firstFieldError) {
          return firstFieldError;
        }
      }

      if (typeof parsed.message === "string" && parsed.message.trim()) {
        return parsed.message.trim();
      }
    }
  } catch {
    // Response was plain text (e.g., older endpoint or proxy message)
    if (!rawText.trim().startsWith("{") && !rawText.trim().startsWith("<")) {
      return rawText.trim();
    }
  }

  return fallbackMessage;
}