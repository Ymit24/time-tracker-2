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
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Start</th>
                        <th>Stop</th>
                        <th>Duration</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {timeSheet.entries.map((row) => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.start?.toLocaleString()}</td>
                            <td>{row.isStopped ? row.stop?.toLocaleString() : "In Progress"}</td>
                            <td>{getDurationStrForDates(row.start, row.stop)}</td>
                            <td>
                                <div className="controls">
                                    {!row.isStopped ?
                                        <button onClick={() => stopEntryFunc(row.id)} className="stop-btn">⏹</button>
                                        : <button onClick={() => newEntryFrom(row)} className="add-btn">➕</button>
                                    }
                                    <button className="delete-btn" onClick={() => deleteEntryFunc(row.id)}>🗑️</button>
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
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Duration</th>
                        <th>Entries</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.name}>
                            <td>{row.name}</td>
                            <td>{row.durationStr}</td>
                            <td>{row.entries.toString()}</td>
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
        <div className="dialog-overlay">
            <div className="dialog">
                <h3>Clear this timesheet?</h3>
                <div className="dialog-actions">
                    <button onClick={() => { onClose(); onClear(); }} className="clear-confirm-btn">Clear</button>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    );
}

// Main TimeTracker Component
export default function TimeTracker() {
    useEffect(() => {
        let originalExistingTimesheet = JSON.parse(localStorage.getItem('timesheet') || '{"entries": []}') as TimeSheet;
        const existingTimesheet = {
            entries: originalExistingTimesheet.entries.map((entry) => ({
                ...entry,
                start: new Date(entry.start),
                stop: new Date(entry.stop || 0),
            }))
        };
        setTimesheet(existingTimesheet);
    }, []);
    
    const [timesheet, setTimesheet] = useState<TimeSheet>({ entries: [] });
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
            setTimesheet({
                entries: timesheet.entries.map((entry) => {
                    if (entry.isStopped) { return entry; }
                    else return { ...entry, stop: new Date() };
                })
            });
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [timesheet.entries]);

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
        <div className="time-tracker">
            <style>{`
                .time-tracker {
                    font-family: Arial, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                h1 {
                    margin-bottom: 20px;
                }
                
                h2 {
                    margin-bottom: 15px;
                }
                
                .controls-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .input-controls {
                    display: flex;
                    gap: 12px;
                }
                
                .view-controls {
                    display: flex;
                    gap: 12px;
                }
                
                .table-container {
                    overflow-x: auto;
                    margin-bottom: 20px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                
                th {
                    background-color: #f2f2f2;
                }
                
                td:last-child, th:last-child {
                    text-align: center;
                }
                
                input[type="text"] {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                input.error {
                    border-color: #f44336;
                }
                
                button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .add-btn {
                    background-color: #4CAF50;
                    color: white;
                }
                
                .stop-btn {
                    background-color: #2196F3;
                    color: white;
                }
                
                .delete-btn {
                    background-color: #f44336;
                    color: white;
                }
                
                .view-btn {
                    background-color: #2196F3;
                    color: white;
                }
                
                .clear-btn {
                    background-color: #f44336;
                    color: white;
                }
                
                .controls {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }
                
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .dialog {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    min-width: 300px;
                }
                
                .dialog h3 {
                    margin-top: 0;
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                .clear-confirm-btn {
                    background-color: #ff9800;
                    color: white;
                }
                
                .cancel-btn {
                    background-color: #9e9e9e;
                    color: white;
                }
            `}</style>
            
            <h1>Time Tracker</h1>
            
            <div className="controls-container">
                <div className="input-controls">
                    <input 
                        type="text" 
                        className={titleIsError ? "error" : ""}
                        value={newEntryTitle} 
                        onChange={onChangeNewEntryTitle} 
                        placeholder='Name' 
                    />
                    <button className="add-btn" onClick={createNewEntry}>new</button>
                </div>
                
                <div className="view-controls">
                    {activeView == 'entries' && 
                        <button className="view-btn" onClick={() => setActiveView('summary')}>show summary</button>
                    }
                    {activeView == 'summary' && 
                        <button className="view-btn" onClick={() => setActiveView('entries')}>show entries</button>
                    }
                    <button className="clear-btn" onClick={() => setShowingClearDialog(true)}>Clear</button>
                </div>
            </div>
            
            <h2>{activeView == 'entries' ? "Entries" : "Summary"}</h2>
            
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
