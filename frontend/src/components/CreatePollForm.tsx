import { useState } from 'react';

interface Option {
    text: string;
    isCorrect: boolean;
}

interface CreatePollFormProps {
    onSubmit: (question: string, options: Option[], timer: number) => void;
    onCancel: () => void;
}

const TIMER_OPTIONS = [30, 45, 60, 90, 120];

export default function CreatePollForm({ onSubmit, onCancel }: CreatePollFormProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<Option[]>([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [timer, setTimer] = useState(60);

    const addOption = () => {
        if (options.length < 6) setOptions([...options, { text: '', isCorrect: false }]);
    };

    const removeOption = (idx: number) => {
        if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
    };

    const updateOption = (idx: number, text: string) => {
        setOptions(options.map((o, i) => (i === idx ? { ...o, text } : o)));
    };

    const toggleCorrect = (idx: number) => {
        setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx ? !o.isCorrect : o.isCorrect })));
    };

    const handleSubmit = () => {
        if (!question.trim()) { alert('Please enter a question'); return; }
        const validOptions = options.filter((o) => o.text.trim());
        if (validOptions.length < 2) { alert('Please add at least 2 options'); return; }
        onSubmit(question.trim(), validOptions, timer);
    };

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="create-form-card">
            <div className="create-form-header">
                <h2>Create a Question</h2>
                <select className="timer-select" value={timer} onChange={(e) => setTimer(Number(e.target.value))}>
                    {TIMER_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}s</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Question</label>
                <textarea
                    className="question-input"
                    placeholder="Enter your question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Answer Options</label>
                <div className="options-list">
                    {options.map((opt, idx) => (
                        <div key={idx} className="option-input-row">
                            <span className="option-label-badge">{labels[idx]}</span>
                            <input
                                type="text"
                                className="option-text-input"
                                placeholder={`Option ${labels[idx]}`}
                                value={opt.text}
                                onChange={(e) => updateOption(idx, e.target.value)}
                            />
                            <button
                                className={`correct-toggle ${opt.isCorrect ? 'correct' : ''}`}
                                onClick={() => toggleCorrect(idx)}
                                title="Mark as correct"
                            >
                                {opt.isCorrect ? '✓' : '○'}
                            </button>
                            {options.length > 2 && (
                                <button className="remove-option-btn" onClick={() => removeOption(idx)}>✕</button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <button className="add-option-btn" onClick={addOption}>+ Add Option</button>
                )}
            </div>

            <div className="form-actions">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="ask-btn" onClick={handleSubmit}>Ask Question →</button>
            </div>
        </div>
    );
}
