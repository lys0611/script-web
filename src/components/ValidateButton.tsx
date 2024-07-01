import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75em 1.5em;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.001s ease-in;
  margin: 0 1em;

  &:hover {
    background-color: #c82333;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 8px rgba(220, 53, 69, 0.6);
  }
`;

interface FormData {
  accessKey: string;
  secretKey: string;
  email: string;
  projectName: string;
  clusterName: string;
  apiEndpoint: string;
  authData: string;
  instanceList: string;
  primaryEndpoint: string;
  standbyEndpoint: string;
  dockerImageName: string;
  dockerJavaVersion: string;
}

interface ValidateButtonProps {
  formData: FormData;
  clusterList: string[];
}

const ValidateButton: React.FC<ValidateButtonProps> = ({ formData, clusterList = []}) => {
  const validate = () => {
    let isValid = true;
    const errors: string[] = [];

    console.log("Access Key:", formData.accessKey);
    console.log("Secret Key:", formData.secretKey);

    const accessKeyPattern = /^[a-z0-9]{32}$/;
    if (!formData.accessKey) {
      isValid = false;
      errors.push("사용자 액세스 키를 입력해주세요.");
    } else if (!accessKeyPattern.test(formData.accessKey)) {
      isValid = false;
      errors.push("사용자 액세스 키는 32자의 영숫자여야 합니다.");
    }

    const secretKeyPattern = /^[a-z0-9]{70}$/;
    if (!formData.secretKey) {
      isValid = false;
      errors.push("사용자 액세스 보안 키를 입력해주세요.");
    } else if (!secretKeyPattern.test(formData.secretKey)) {
      isValid = false;
      errors.push("사용자 액세스 보안 키는 70자의 영숫자여야 합니다.");
    }

    const projectNamePattern = /^[a-z][a-z0-9-]{3,29}$/;
    if (!formData.projectName) {
      isValid = false;
      errors.push("프로젝트 이름을 입력해주세요.");
    } else if (!projectNamePattern.test(formData.projectName)) {
      isValid = false;
      errors.push("프로젝트 이름은 영어로 시작하고, 소문자, 숫자, '-'만 입력할 수 있으며 4~30자 사이여야 합니다.")
    } // API로 프로젝트 존재하는지 확인
  

    if (!formData.clusterName) {
      isValid = false;
      errors.push("클러스터 이름을 입력해주세요.");
    } else if (!clusterList.includes(formData.clusterName)) {
      isValid = false;
      errors.push("클러스터 이름이 유효하지 않습니다.");
    }

    const apiEndpointPattern = /^https:\/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-public\.ke\.kr-central-2\.kakaocloud\.com$/;
    if (!formData.apiEndpoint) {
      isValid = false;
      errors.push("클러스터의 API 엔드포인트를 입력해주세요.");
    } else if (!apiEndpointPattern.test(formData.apiEndpoint)) {
      isValid = false;
      errors.push("클러스터의 API 엔드포인트 형식이 올바르지 않습니다.");
    }

    const authDataPattern = /^[A-Za-z0-9+/=]+$/; // Base64 형식 검사
    if (!formData.authData) {
      isValid = false;
      errors.push("클러스터의 certificate-authority-data를 입력해주세요.");
    } else if (!authDataPattern.test(formData.authData)) {
      isValid = false;
      errors.push("클러스터의 certificate-authority-data 형식이 올바르지 않습니다.");
    } else {
      try {
        const decodedAuthData = atob(formData.authData);
        const pemPattern = /-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----/;
        if (!pemPattern.test(decodedAuthData)) {
          isValid = false;
          errors.push("클러스터의 certificate-authority-data가 유효한 PEM 형식의 인증서가 아닙니다.");
        }
      } catch (e) {
        isValid = false;
        errors.push("클러스터의 certificate-authority-data를 Base64로 디코딩할 수 없습니다.");
      }
    }

    //위에서 조회된 프로젝트명과 동일한지 체크
    const dbEndpointPattern = /^az-[ab]\.db-[a-z]{3}\.[0-9a-f]{32}\.mysql\.managed-service\.kr-central-2\.kakaocloud\.com$/;

    if (!formData.primaryEndpoint) {
      isValid = false;
      errors.push("Primary의 엔드포인트를 입력해주세요.");
    } else if (!dbEndpointPattern.test(formData.primaryEndpoint)) {
      isValid = false;
      errors.push("Primary의 엔드포인트 형식이 올바르지 않습니다.");
    } else {
      const primaryEndpointParts = formData.primaryEndpoint.split('.');
      const primaryProjectName = primaryEndpointParts[2]; // UUID 위치 (ae90ddc1b6dc4b0581bb44b31f8921b5)

      /*if (primaryProjectName !== formData.projectName의 UUID) {
        isValid = false;
        errors.push("DB의 프로젝트 이름이 동일하지 않습니다.");
      }*/
    }


    // db 없는 경우 '없음' 이라고 표현하기 
    if (!formData.standbyEndpoint) {
      isValid = false;
      errors.push("Standby의 엔드포인트를 입력해주세요.");
    } else if (!dbEndpointPattern.test(formData.standbyEndpoint)) {
      isValid = false;
      errors.push("Standby의 엔드포인트 형식이 올바르지 않습니다.");
    } else {
      const standbyEndpointParts = formData.standbyEndpoint.split('.');
      const standbyProjectName = standbyEndpointParts[2]; // UUID 위치 (ae90ddc1b6dc4b0581bb44b31f8921b5)

      /*if (standbyProjectName !== formData.projectName의 UUID) {
        isValid = false;
        errors.push("DB의 프로젝트 이름이 동일하지 않습니다.");
      }*/
    }



    if (!formData.dockerImageName) {
      isValid = false;
      errors.push("Docker Image 이름을 입력해주세요.");
    } else if (formData.dockerImageName !== "demo-spring-boot") {
      isValid = false;
      errors.push("Docker Image 이름은 'demo-spring-boot'이어야 합니다.");
    }

    if (!formData.dockerJavaVersion) {
      isValid = false;
      errors.push("Docker Image Base Java Version을 입력해주세요.");
    } else if (formData.dockerJavaVersion !== "17-jdk-slim") {
      isValid = false;
      errors.push("Docker Image Base Java Version은 '17-jdk-slim'이어야 합니다.");
    }

    if (isValid) {
      alert('검증 완료: 입력이 올바릅니다!');
    } else {
      alert(`Form has errors:\n${errors.join('\n')}`);
    }
  };

  return <Button onClick={validate}>유효성 검사</Button>;
};

export default ValidateButton;
