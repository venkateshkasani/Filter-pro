# Filterable Virtualized Dashboard

A performant React dashboard for large datasets, featuring dynamic multi-filtering, virtualized table rendering, and windowed pagination. Built with Zustand for state management, Tailwind CSS for styling, and Lucide for icons.

## Features
- **Multi-column Filtering:** Filter data by multiple columns with dynamic dropdowns.
- **Virtualized Table:** Only visible rows are rendered for smooth performance with thousands of rows.
- **Pagination:** Windowed pagination with sliding page number controls for easy navigation.
- **Large Dataset Support:** Handles 5,000+ rows efficiently.
- **Responsive UI:** Built with Tailwind CSS for modern, responsive design.

## Tech Stack
- [React](https://react.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- TypeScript

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Usage
- **Filtering:**
  - Use the dropdowns at the top to filter by any column (e.g., `mod350`, `mod8000`, `mod20002`).
  - You can select multiple values per filter.
- **Pagination:**
  - Use the page number buttons or `<< Prev` / `Next >>` to navigate between pages (100 rows per page).
  - Only a window of page numbers is shown for easy navigation.
- **Virtualized Table:**
  - Only the visible rows are rendered for performance. Scroll within the table to see more rows.

## File Structure
```
filterpro/
├── public/
├── src/
│   ├── assets/
│   │   ├── data.ts         # Large dataset (numbers, mod columns)
│   │   └── store.ts        # Zustand store, types
│   ├── App.tsx             # Main dashboard component
│   ├── App.css             # Custom styles
│   ├── main.tsx            # React entry point
│   └── ...
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Credits
- Inspired by modern dashboard UIs and best practices for large data handling in React.
- Icons by [Lucide](https://lucide.dev/).
