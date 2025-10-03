// TimeTracker.tsx
import { ChangeEvent, useEffect, useState } from 'react';

function createData(
    id: number,
    name: string,
    start: Date,
    stop?: Date
) {
    return { id, name, start, stop, isStopped: false };
}

function getDurationStrFor(duration: number): string {
    const seconds = duration / 1000;
    const minutes = seconds / 60;
    const hours = Math.floor(minutes / 60);
    let durationStr = "";
    const minutesVal = Math.floor(minutes % 60);
    const secondsVal = Math.floor(seconds % 60);

    if (hours > 0) { durationStr += `${hours} hrs ` }
    if (minutesVal > 0) { durationStr += `${minutesVal} mins ` }
    if (secondsVal >= 0) { durationStr += `${secondsVal} secs` }

    return durationStr;
}

function getDurationStrForDates(start: Date, stop?: Date): string {
    const duration = (stop || new Date()).valueOf() - start.valueOf();
    return getDurationStrFor(duration);
}

type TimeEntry = {
    id: number,
    name: string,
    start: Date,
    stop?: Date,
    isStopped: boolean,
};

type TimeSheet = {
    entries: TimeEntry[]
};

// Function to load timesheet from localStorage
function loadTimesheetFromStorage(): TimeSheet {
    try {
        const storedData = localStorage.getItem('timesheet');
        if (!storedData) return { entries: [] };
        
        const originalExistingTimesheet = JSON.parse(storedData) as TimeSheet;
        return {
            entries: originalExistingTimesheet.entries.map((entry) => ({
                ...entry,
                start: new Date(entry.start),
                stop: entry.stop ? new Date(entry.stop) : undefined,
            }))
        };
    } catch (error) {
        console.error('Error loading timesheet from localStorage:', error);
        return { entries: [] };
    }
}

// BasicTable Component
function BasicTable({
    timeSheet,
    stopEntryFunc,
    newEntryFrom,
    deleteEntryFunc
}: {
    timeSheet: TimeSheet,
    stopEntryFunc: (id: number) => void,
    newEntryFrom: (entry: TimeEntry) => void,
    deleteEntryFunc: (id: number) => void
}) {
    return (
        <div className="overflow-x-auto mb-5">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Start</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Stop</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {timeSheet.entries.map((row) => (
                        <tr key={row.id}>
                            <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.start?.toLocaleString()}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.isStopped ? row.stop?.toLocaleString() : "In Progress"}</td>
                            <td className="border border-gray-300 px-4 py-2">{getDurationStrForDates(row.start, row.stop)}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <div className="flex gap-2 justify-center">
                                    {!row.isStopped ?
                                        <button onClick={() => stopEntryFunc(row.id)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">⏹</button>
                                        : <button onClick={() => newEntryFrom(row)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">➕</button>
                                    }
                                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors" onClick={() => deleteEntryFunc(row.id)}>🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// SummaryTable Component
function SummaryTable({ timeSheet }: { timeSheet: TimeSheet }) {
    const rows: { name: string, durationStr: string, durationRaw: number, entries: number }[] = [];

    timeSheet.entries.forEach((entry) => {
        const index = rows.findIndex((row) => row.name == entry.name);
        if (index == -1) {
            rows.push({
                name: entry.name,
                durationStr: getDurationStrForDates(entry.start, entry.stop),
                durationRaw: getDurationOf(entry),
                entries: 1
            });
        } else {
            rows[index].durationRaw += getDurationOf(entry);
            rows[index].durationStr = getDurationStrFor(rows[index].durationRaw);
            rows[index].entries++;
        }
    });

    return (
        <div className="overflow-x-auto mb-5">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Duration</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Entries</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.name}>
                            <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{row.durationStr}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{row.entries.toString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function getDurationOf(entry: TimeEntry): number {
    return (entry.stop || new Date()).valueOf() - entry.start.valueOf();
}

// ClearDialog Component
function ClearDialog({
    isOpen,
    onClose,
    onClear
}: {
    isOpen: boolean,
    onClose: () => void,
    onClear: () => void
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg min-w-[300px]">
                <h3 className="mt-0 mb-4 text-lg font-medium">Clear this timesheet?</h3>
                <div className="flex gap-3 justify-end mt-5">
                    <button onClick={() => { onClose(); onClear(); }} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">Clear</button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
}

// Main TimeTracker Component
export default function TimeTracker() {
    // Initialize state with data from localStorage using lazy initialization
    const [timesheet, setTimesheet] = useState<TimeSheet>(() => loadTimesheetFromStorage());
    const [titleIsError, setTitleIsError] = useState(false);
    const [newEntryTitle, setNewEntryTitle] = useState("");
    const [activeView, setActiveView] = useState<'entries' | 'summary'>('entries');
    const [showingClearDialog, setShowingClearDialog] = useState(false);

    const onChangeNewEntryTitle = (e: ChangeEvent<HTMLInputElement>) => {
        setNewEntryTitle(e.target.value);
        setTitleIsError(false);
    };

    const getNextId = () => {
        if (timesheet.entries.length == 0) return 0;
        const highestEntryId = timesheet.entries.reduce((acc, entry) => entry.id > acc.id ? entry : acc);
        return highestEntryId.id + 1;
    };

    const createNewEntry = () => {
        if (newEntryTitle.length == 0) {
            setTitleIsError(true);
            return;
        }
        setTitleIsError(false);
        setTimesheet({
            entries: [
                ...timesheet.entries,
                createData(getNextId(), newEntryTitle, new Date())
            ]
        });
        setNewEntryTitle("");
    };

    const stopEntry = (entryId: number) => {
        const entry = timesheet.entries.find(x => x.id == entryId);
        if (!entry) return;
        setTimesheet({
            entries: [
                ...timesheet.entries.filter(x => x.id != entryId),
                {
                    ...createData(entryId, entry.name, entry.start, new Date()), isStopped: true
                }
            ]
        });
    };

    const newEntryFrom = (entry: TimeEntry) => {
        setTimesheet({
            entries: [
                ...timesheet.entries,
                createData(getNextId(), entry.name, new Date())
            ]
        });
    };

    const deleteEntry = (entryId: number) => {
        setTimesheet({
            entries: [
                ...timesheet.entries.filter((entry) => entry.id != entryId)
            ]
        });
    };

    const clearTimesheet = () => {
        setTimesheet({ entries: [] });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimesheet(prevTimesheet => ({
                entries: prevTimesheet.entries.map((entry) => {
                    if (entry.isStopped) { return entry; }
                    else return { ...entry, stop: new Date() };
                })
            }));
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []); // Removed dependency on timesheet.entries to prevent re-creating the interval

    useEffect(() => {
        const toSave = {
            entries: timesheet.entries.map((entry) => ({
                ...entry,
                start: entry.start.valueOf(),
                stop: entry.stop?.valueOf(),
            }))
        };
        localStorage.setItem('timesheet', JSON.stringify(toSave));
    }, [timesheet]);

    return (
        <div className="max-w-6xl mx-auto p-5 font-sans">
            <h1 className="text-3xl font-bold mb-5">Time Tracker</h1>
            
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        className={`px-3 py-2 border rounded ${titleIsError ? "border-red-500" : "border-gray-300"}`}
                        value={newEntryTitle} 
                        onChange={onChangeNewEntryTitle} 
                        placeholder='Name' 
                    />
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors" onClick={createNewEntry}>new</button>
                </div>
                
                <div className="flex gap-3">
                    {activeView == 'entries' && 
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors" onClick={() => setActiveView('summary')}>show summary</button>
                    }
                    {activeView == 'summary' && 
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors" onClick={() => setActiveView('entries')}>show entries</button>
                    }
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors" onClick={() => setShowingClearDialog(true)}>Clear</button>
                </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">{activeView == 'entries' ? "Entries" : "Summary"}</h2>
            
            {activeView == 'entries' && 
                <BasicTable 
                    timeSheet={timesheet} 
                    stopEntryFunc={stopEntry} 
                    newEntryFrom={newEntryFrom} 
                    deleteEntryFunc={deleteEntry} 
                />
            }
            
            {activeView == 'summary' && 
                <SummaryTable timeSheet={timesheet} />
            }
            
            <ClearDialog
                isOpen={showingClearDialog}
                onClose={() => setShowingClearDialog(false)}
                onClear={clearTimesheet}
            />
        </div>
    );
}
