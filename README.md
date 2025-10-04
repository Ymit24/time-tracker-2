# Time Tracker

A beautiful, ergonomic time tracking application built with React, TypeScript, and shadcn/ui. Track your time across multiple timesheets with an intuitive interface and persistent local storage.

![Time Tracker](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)

## ✨ Features

### 📊 Multiple Timesheets
- **Create unlimited timesheets** - Organize your time tracking by project, week, or any way you prefer
- **Easy switching** - Quickly switch between timesheets with a beautiful dropdown selector
- **Persistent storage** - All your timesheets are automatically saved to local storage
- **Rename & delete** - Manage your timesheets with intuitive rename and delete options

### ⏱️ Time Tracking
- **Start/Stop timers** - Track time with one-click start and stop functionality
- **Real-time duration** - Watch your time accumulate in real-time
- **Active indicators** - Visual badges show which entries are currently running
- **Quick restart** - Start new entries from completed ones with a single click

### 📈 Analytics & Summary
- **Task summary** - View aggregated time by task name
- **Percentage breakdown** - See how your time is distributed across tasks
- **Total duration** - Quick overview of total time tracked
- **Entry count** - Track how many entries you've created per task

### 🎨 Beautiful UI
- **Dark/Light mode** - Toggle between themes with the mode switcher
- **Responsive design** - Works beautifully on desktop, tablet, and mobile
- **shadcn/ui components** - Modern, accessible UI components
- **Smooth animations** - Delightful transitions and interactions
- **Empty states** - Helpful guidance when you're just getting started

### 💾 Data Management
- **Local storage** - All data stays on your device
- **Clear entries** - Remove all entries from a timesheet when needed
- **Delete timesheets** - Clean up old timesheets (with safety confirmation)
- **Export ready** - Data structure designed for easy export (future feature)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd time-tracker-2
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## 📖 Usage Guide

### Creating Your First Entry

1. Enter a task name in the "Task Name" field
2. Click "Start Timer" or press Enter
3. The timer will start running and appear in the entries table
4. Click the stop button (square icon) to stop tracking

### Managing Timesheets

1. **View current timesheet** - The dropdown at the top shows your active timesheet
2. **Switch timesheets** - Click the dropdown to see all timesheets and select one
3. **Create new timesheet** - Click "Create New Timesheet" in the dropdown
4. **Rename timesheet** - Click the edit icon next to any timesheet
5. **Delete timesheet** - Click the trash icon (only if you have multiple timesheets)

### Viewing Summary

1. Click the "Summary" tab to switch to summary view
2. See aggregated time by task name
3. View percentages and entry counts
4. Switch back to "Entries" to see individual entries

### Keyboard Shortcuts

- **Enter** - Start a new timer (when focused on task name input)
- **Enter** - Confirm rename (in rename dialog)

## 🛠️ Technology Stack

- **React 19.1.1** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 4.1.14** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Local Storage API** - Data persistence

## 📁 Project Structure

```
time-tracker-2/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── mode-toggle.tsx  # Theme switcher
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Root component
│   ├── TimeTracker.tsx      # Main application logic
│   └── main.tsx             # Entry point
├── public/                  # Static assets
└── dist/                    # Production build
```

## 💡 Key Components

### TimeTracker
The main component that manages:
- Multiple timesheets state
- Active timesheet selection
- Entry creation, updates, and deletion
- Timer updates (1-second interval)
- Local storage persistence

### TimesheetSelector
Dropdown component for:
- Displaying all timesheets
- Switching between timesheets
- Creating new timesheets
- Renaming and deleting timesheets

### BasicTable
Displays individual time entries with:
- Task names and active indicators
- Start/end times with smart formatting
- Duration calculations
- Action buttons (stop, restart, delete)

### SummaryTable
Shows aggregated data:
- Grouped by task name
- Total duration per task
- Entry counts
- Percentage distribution

## 🔒 Data Privacy

All your time tracking data is stored locally in your browser's local storage. Nothing is sent to any server or third party. Your data stays on your device.

## 🎯 Future Enhancements

- Export to CSV/JSON
- Import timesheets
- Filtering and search
- Date range selection
- Reports and charts
- Backup and restore
- Cloud sync (optional)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for utility classes

---

Built with ❤️ using React and TypeScript
