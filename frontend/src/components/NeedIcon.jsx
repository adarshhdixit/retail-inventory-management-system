const ICONS = {
 backpack: (
   <path d="M8 6.5H16A3 3 0 0 1 19 9.5V18.5A3 3 0 0 1 16 21.5H8A3 3 0 0 1 5 18.5V9.5A3 3 0 0 1 8 6.5Z M9 6.5a3 3 0 0 1 6 0 M8.5 8.5h7a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z M4 12.5v3.5a1 1 0 0 0 1 1 M20 12.5v3.5a1 1 0 0 1-1 1 M9.5 18h4.2 M13.7 18v1" />
 ),
  notepad: (
    <path d="M6 3h9l3 3v15a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z M8 9h8 M8 13h8 M8 17h5" />
  ),
  palette: (
    <path d="M12 3a9 9 0 000 18c1 0 1.5-.5 1.5-1.5S13 18 13 17a2 2 0 012-2h1.5a3.5 3.5 0 003.5-3.5C20 6.5 16.5 3 12 3z M7.5 12a1 1 0 100-2 1 1 0 000 2z M9 8.5a1 1 0 100-2 1 1 0 000 2z M14 7.5a1 1 0 100-2 1 1 0 000 2z" />
  ),
  briefcase: (
    <path d="M3 9h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9z M8 9V6a2 2 0 012-2h4a2 2 0 012 2v3 M3 13h18" />
  ),
  graduationCap: (
    <path d="M2 9l10-5 10 5-10 5-10-5z M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5 M22 9v6" />
  ),
  scissors: (
    <path d="M6 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M6 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M7.5 7.5L20 20 M7.5 16.5L20 4" />
  ),
  pen: (
    <path d="M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  ),
  filePenLine: (
    <path d="M13 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V9l-6-6z M13 3v6h6 M10.5 14.5L16 9l1.5 1.5-5.5 5.5-2.3.4.3-2.4z" />
  ),
  whiteboard: (
    <path d="M2 4h20v13H2z M8 21l4-4 4 4 M12 17v4 M6 8h5 M6 11h8" />
  ),
  bookOpen: (
    <path d="M2 5a2 2 0 012-2h5a2 2 0 012 2v14a2 2 0 00-2-2H2V5z M22 5a2 2 0 00-2-2h-5a2 2 0 00-2 2v14a2 2 0 012-2h7V5z" />
  ),
  shapes: (
    <path d="M9 3L4 11h10L9 3z M17.5 21a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M13 21h8v-8h-8v8z" />
  ),
  book: (
    <path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 21.5V4.5z M20 19H6.5A2.5 2.5 0 004 21.5" />
  ),
  gift: (
    <path d="M20 12v9H4v-9 M2 7h20v5H2z M12 22V7 M12 7C10 3 6 3 6 5.5S9 7 12 7z M12 7c2-4 6-4 6-1.5S15 7 12 7z" />
  ),
  crayon: (
    <path d="M9 3l6 6-9 9-4 1 1-4 6-9 9 6" />
  ),
  folder: (
    <path d="M3 7a1 1 0 011-1h5l2 2h9a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
  ),
  printer: (
    <path d="M6 9V3h12v6 M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2 M6 14h12v7H6z" />
  ),
  ball: (
    <path d="M12 2a10 10 0 000 20 10 10 0 000-20z M12 2c-3 3-3 15 0 20 M2 12h20 M4.5 6.5c3 2 12 2 15 0 M4.5 17.5c3-2 12-2 15 0" />
  ),
  presentation: (
      <path d="M3 4h18 M4 4v11h16V4 M9 20l3-5 3 5 M12 15v5" />
    ),
};

export default function NeedIcon({ name, color, size = 15 }) {
  const path = ICONS[name] || ICONS.book;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}