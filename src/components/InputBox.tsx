// src/components/InputBox.tsx
import React from 'react';
import styled from 'styled-components';
import ApiButton from './ApiButton';
import { SharedButton } from './ButtonStyles';

interface InputBoxProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    height?: string;
    showApiButton?: boolean;
    onApiClick?: (() => void);
    onConsoleClick?: (() => void); // 콘솔로 조회 버튼 클릭 핸들러
    isLoading?: boolean; // 추가된 속성
    readOnly?: boolean; // readOnly prop 추가
    disableAll?: boolean; // 다른 버튼 비활성화
}

const Container = styled.div`
    margin-bottom: 2.1em;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: inherit;
    position: relative;
`;

const LabelContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const Label = styled.label`
    display: inline;
    margin-bottom: 0.5em;
    margin-right: 1em;
    font-weight: bold;
    color: white;
`;

const Input = styled.input<{ height?: string }>`
    width: 100%;
    padding: 0.75em;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: all 0.3s ease;
    height: ${(props) => props.height || 'auto'};

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
        outline: none;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 0.5em;
`;

const InputBox: React.FC<InputBoxProps> = ({ label, placeholder, value, onChange, height, showApiButton, onApiClick, onConsoleClick, isLoading, readOnly, disableAll}) => {
    return (
        <Container>
            <LabelContainer>
                <Label>{label}</Label>
                {showApiButton && (
                    <ButtonContainer>
                        {onConsoleClick && <SharedButton onClick={onConsoleClick}> disabled={disableAll} 콘솔로 조회</SharedButton>}
                        {onApiClick && <ApiButton id = {label} label="API로 조회" onClick={onApiClick} isLoading={isLoading || false } disabled={disableAll} />}
                    </ButtonContainer>
                )}
            </LabelContainer>
            <Input type="text" placeholder={placeholder} value={value} onChange={onChange} height={height} readOnly={readOnly} />
        </Container>
    );
};

export default InputBox;
