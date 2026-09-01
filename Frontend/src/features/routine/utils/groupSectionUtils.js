export const normalizeGroup = (value) => String(value || '')
  .trim()
  .toUpperCase()
  .replace(/[\s_-]+/g, '')
  .replace(/^GROUP/, '');

export const normalizeSection = (value) => normalizeGroup(value).replace(/^SECTION/, '').replace(/\d+$/, '');

export const deriveSectionFromGroup = (group) => {
  const normalized = normalizeGroup(group);
  if (!normalized || ['ALL', 'COMMON'].includes(normalized)) return '';
  return normalized.replace(/\d+$/, '');
};

export const isCommonRoutineEntry = (entry) => {
  const group = normalizeGroup(entry?.group);
  const section = normalizeSection(entry?.section);
  return Boolean(entry?.isCommon) || ['ALL', 'COMMON'].includes(group) || ['ALL', 'COMMON'].includes(section);
};

export const isAmbiguousGroup = (entry) => {
  return !isCommonRoutineEntry(entry) && !normalizeGroup(entry?.group) && !normalizeGroup(entry?.section);
};

export const matchesSelectedGroup = (entry, selectedGroup) => {
  const selected = normalizeGroup(selectedGroup);
  if (!selected) return false;
  if (isCommonRoutineEntry(entry)) return true;

  const entryGroup = normalizeGroup(entry?.group);
  const entrySection = normalizeSection(entry?.section);
  const selectedSection = deriveSectionFromGroup(selected);
  if (entryGroup === selected) return true;
  if (!entryGroup && entrySection === selectedSection) return true;
  if (entryGroup === selectedSection && entrySection === selectedSection) return true;
  return false;
};

export const filterRoutineForGroup = (entries, selectedGroup) => (
  (entries || []).filter(entry => matchesSelectedGroup(entry, selectedGroup))
);
