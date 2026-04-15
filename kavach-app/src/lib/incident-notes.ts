const INCIDENT_NOTES_KEY = "kavach-incident-notes";

type IncidentNotesMap = Record<string, string>;

function readNotesMap() {
  try {
    const raw = window.localStorage.getItem(INCIDENT_NOTES_KEY);
    return raw ? (JSON.parse(raw) as IncidentNotesMap) : {};
  } catch {
    return {};
  }
}

function writeNotesMap(notesMap: IncidentNotesMap) {
  try {
    window.localStorage.setItem(INCIDENT_NOTES_KEY, JSON.stringify(notesMap));
  } catch {
    // Notes persistence is best-effort in private or storage-blocked browsers.
  }
}

export function getIncidentNote(alertId: string) {
  const notesMap = readNotesMap();
  return notesMap[alertId] ?? "";
}

export function saveIncidentNote(alertId: string, note: string) {
  const notesMap = readNotesMap();
  notesMap[alertId] = note;
  writeNotesMap(notesMap);
}
