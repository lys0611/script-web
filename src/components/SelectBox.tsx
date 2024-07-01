// src/components/SelectBox.tsx
import React from 'react';

interface SelectBoxProps {
    label: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}

const SelectBox: React.FC<SelectBoxProps> = ({ label, value, options, onChange }) => {
    return (
        <div>
            <label>{label}</label>
            <select value={value} onChange={onChange} >
                <option value="">Select an option</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectBox;
