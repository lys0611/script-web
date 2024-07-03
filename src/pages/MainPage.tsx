import React, { useEffect, useState } from 'react';
import InputBox from '../components/InputBox';
import ScriptDisplay from '../components/ScriptDisplay';
import ValidateButton from '../components/ValidateButton';
import SelectBox from '../components/SelectBox';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
    max-width: 800px;
    margin: 2em auto;
    padding: 2em;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-height: 100vh;
`;

const Title = styled.h1`
    text-align: center;
    margin-top: 0.65em;
    margin-bottom: 0.5em;
    color: #fff;
`;

const Subtitle = styled.h3`
    text-align: center;
    margin-bottom: 1.5em;
    color: #FFCD00;
    font-size: 1.2em;
    font-weight: normal;
`;

const Header = styled.h2`
    text-align: center;
    color: #3c1e1e;
    margin-bottom: 0.5em;
    font-size: 2em;
    font-weight: bold;
    color: #FFCD00; /* 카카오 노란색 */
`;

const GroupContainer = styled.div`
    margin-bottom: 1.5em;
    padding: 1em;
    padding-top: 2em;
    padding-bottom: 0.01em;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2em;
`;

const StyledButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 0.75em 1.5em;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.1s ease-in;
    margin: 0 1em;

    &:hover {
        background-color: #218838;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 8px rgba(33, 136, 56, 0.6);
    }
`;

interface KubeConfig {
    clusters: Array<{
        cluster: {
            "certificate-authority-data": string;
            server: string;
        };
        name: string;
    }>;
}

const MainPage: React.FC = () => {
    const [accessKey, setAccessKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [email, setEmail] = useState('');
    const [projectName, setProjectName] = useState('');
    const [clusterList, setClusterList] = useState<string[]>([]);
    const [clusterName, setClusterName] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [authData, setAuthData] = useState('');
    const [instanceList, setInstanceList] = useState('');
    const [instanceName, setInstanceName] = useState('');
    const [primaryEndpoint, setPrimaryEndpoint] = useState('');
    const [standbyEndpoint, setStandbyEndpoint] = useState('');
    const [dockerImageName, setDockerImageName] = useState('demo-spring-boot');
    const [dockerJavaVersion, setDockerJavaVersion] = useState('17-jdk-slim');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState<string | null>(null);
    const [instanceEndpoints, setInstanceEndpoints] = useState<{ [key: string]: { primary_endpoint: string, standby_endpoint: string } }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleApiButtonClick = async (id: string, apiFunction: (arg?: string) => Promise<void>, arg?: string) => {
        setLoadingButton(id);
        try {
            await apiFunction(arg);
        } finally {
            setLoadingButton(null);
        }
    };

    const handleInstanceNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedInstanceName = event.target.value;
        setInstanceName(selectedInstanceName);
        handleApiButtonClick('fetchInstanceEndpoints', fetchInstanceEndpoints, selectedInstanceName);
    };

    const handleClusterNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClusterName = event.target.value;
        setClusterName(selectedClusterName);
        handleApiButtonClick('fetchKubeConfig', fetchKubeConfig, selectedClusterName);
    };

    const handleFetchProjectsAndClusters = async () => {
        await fetchProjects();
        await fetchClusters();
        await fetchInstanceLists();
    };

    useEffect(() => {
        fetchInstanceLists();
    }, []);

    const generateScript = () => {
        const newScript = `#!/bin/bash
echo "kakaocloud: 1.Starting environment variable setup"
# 환경 변수 설정: 사용자는 이 부분에 자신의 환경에 맞는 값을 입력해야 합니다.
command=$(cat <<EOF
export ACC_KEY='${accessKey}'
export SEC_KEY='${secretKey}'
export CLUSTER_NAME='${clusterName}'
export API_SERVER='${apiEndpoint}'
export AUTH_DATA='${authData}'
export PROJECT_NAME='${projectName}'
export INPUT_DB_EP1='${primaryEndpoint}'
export INPUT_DB_EP2='${standbyEndpoint}'
export DOCKER_IMAGE_NAME='${dockerImageName}'
export DOCKER_JAVA_VERSION='${dockerJavaVersion}'
export JAVA_VERSION='17'
export SPRING_BOOT_VERSION='3.1.0'
export DB_EP1=$(echo -n "\\$INPUT_DB_EP1" | base64 -w 0)
export DB_EP2=$(echo -n "\\$INPUT_DB_EP2" | base64 -w 0)
EOF
)
eval "$command"
echo "$command" >> /home/ubuntu/.bashrc
echo "kakaocloud: Environment variable setup completed"
echo "kakaocloud: 2.Checking the validity of the script download site"
curl --output /dev/null --silent --head --fail "https://github.com/kakaocloud-edu/tutorial/raw/main/AdvancedCourse/src/script/script.sh" || { echo "kakaocloud: Script download site is not valid"; exit 1; }
echo "kakaocloud: Script download site is valid"
wget https://github.com/kakaocloud-edu/tutorial/raw/main/AdvancedCourse/src/script/script.sh
chmod +x script.sh
sudo -E ./script.sh`;
        setScript(newScript);
        navigator.clipboard.writeText(newScript);
        alert('스크립트가 생성되고 클립보드에 복사되었습니다.');
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://61.109.237.248:8000/get-project-name', {
                access_key_id: accessKey,
                access_key_secret: secretKey,
            });
            const projectName = response.data.project_name;
            setProjectName(projectName);
        } catch (error) {
            console.error('API 호출 오류:', error);
        }
        setLoading(false);
    };

    const fetchClusters = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://61.109.237.248:8000/get-clusters', {
                access_key_id: accessKey,
                access_key_secret: secretKey,
            });

            const clusterNames = response.data.items.map((item: any) => item.name);

            setClusterList(clusterNames); // 배열로 설정

        } catch (error) {
            console.error('API 호출 오류:', error);
        }
        setLoading(false);
    };

    const fetchInstanceLists = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://61.109.237.248:8000/get-instance-groups', {
                access_key_id: accessKey,
                access_key_secret: secretKey,
            });
            const instanceSetNames = response.data;  // 이미 배열 형태라고 가정
            setInstanceList(instanceSetNames.join(', '));

        } catch (error) {
            console.error('API 호출 오류:', error);
        }
        setLoading(false);
    };

    const fetchInstanceEndpoints = async (selectedInstanceName?: string) => {
        setLoading(true);
        try {
            const response = await axios.post('http://61.109.237.248:8000/get-instance-endpoints', {
                access_key_id: accessKey,
                access_key_secret: secretKey,
                instance_set_name: selectedInstanceName  // instance_set_name 추가
            });
            console.log('전체 응답 데이터:', response.data); // 전체 응답 데이터 확인용 로그

            const { primary_endpoint, standby_endpoint } = response.data;
            setInstanceEndpoints(prev => ({
                [selectedInstanceName as string]: { primary_endpoint, standby_endpoint } as { primary_endpoint: string, standby_endpoint: string }
            }));
            setPrimaryEndpoint(primary_endpoint);
            setStandbyEndpoint(standby_endpoint);
        } catch (error) {
            console.error('API 호출 오류:', error);
        }
        setLoading(false);
    };

    const fetchKubeConfig = async (selectedClusterName?: string) => {
        setLoading(true);
        try {
            const response = await axios.post<KubeConfig>('http://61.109.237.248:8000/get-kubeconfig', {
                access_key_id: accessKey,
                access_key_secret: secretKey,
                cluster_name: selectedClusterName  // cluster_name 추가
            });
            const { clusters } = response.data;
            const selectedCluster = clusters.find(cluster => cluster.name === selectedClusterName);
            if (selectedCluster) {
                setClusterName(selectedCluster.name);
                setApiEndpoint(selectedCluster.cluster.server);
                setAuthData(selectedCluster.cluster["certificate-authority-data"]);
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
        }
        setLoading(false);
    };

    const handleConsoleClick = (url: string) => {
        window.open(url, '_blank');
    };

    useEffect(() => {
        fetchInstanceLists();
    }, []);

    const formData = {
        accessKey,
        secretKey,
        email,
        projectName,
        clusterName,
        apiEndpoint,
        authData,
        instanceList,
        primaryEndpoint,
        standbyEndpoint,
        dockerImageName,
        dockerJavaVersion,
    };

    return (
        <Container>
            <Title>Bastion VM 스크립트 생성</Title>
            <Subtitle>kakaocloud 교육용</Subtitle>
            <GroupContainer>
                <InputBox
                    label="1. 사용자 액세스 키"
                    placeholder="직접 입력"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    error={errors.accessKey}
                />
                <InputBox
                    label="2. 사용자 액세스 보안 키"
                    placeholder="직접 입력"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    error={errors.secretKey}
                />
                {/*<InputBox*/}
                {/*    label="3. 사용자 이메일"*/}
                {/*    placeholder="직접 입력"*/}
                {/*    value={email}*/}
                {/*    onChange={(e) => setEmail(e.target.value)}*/}
                {/*    error={errors.email}*/}
                {/*/>*/}
            </GroupContainer>
            <GroupContainer>
                <InputBox
                    label="3. 프로젝트 이름"
                    placeholder="직접 입력"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    showApiButton
                    onApiClick={() => handleApiButtonClick('fetchProjects', handleFetchProjectsAndClusters)}
                    isLoading={loadingButton === 'fetchProjects'}
                    disableAll={!!loadingButton}
                    error={errors.projectName}
                />
            </GroupContainer>
            <GroupContainer>
                <SelectBox
                    label="4. 클러스터 리스트"
                    value={clusterName}
                    options={clusterList}
                    onChange={handleClusterNameChange}
                    disabled={loadingButton === 'fetchClusters'}
                />
                <InputBox
                    label="5. 클러스터 이름"
                    placeholder="직접 입력"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    height="100px"
                    onApiClick={() => handleApiButtonClick('fetchClusterName', fetchKubeConfig, clusterName)}
                    isLoading={loadingButton === 'fetchClusterName'}
                    disableAll={!!loadingButton}
                    error={errors.clusterName}
                />
                <InputBox
                    label="6. 클러스터의 API 엔드포인트"
                    placeholder="직접 입력"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    height="100px"
                    onApiClick={() => handleApiButtonClick('fetchApiEndpoint', fetchKubeConfig, clusterName)}
                    isLoading={loadingButton === 'fetchApiEndpoint'}
                    disableAll={!!loadingButton}
                    error={errors.apiEndpoint}
                />
                <InputBox
                    label="7. 클러스터의 certificate-authority-data"
                    placeholder="직접 입력"
                    value={authData}
                    onChange={(e) => setAuthData(e.target.value)}
                    height="100px"
                    onApiClick={() => handleApiButtonClick('fetchAuthData', fetchKubeConfig, clusterName)}
                    isLoading={loadingButton === 'fetchAuthData'}
                    disableAll={!!loadingButton}
                    error={errors.authData}
                />
            </GroupContainer>
            <GroupContainer>
                <SelectBox
                    label="8. 인스턴스 그룹 리스트"
                    value={instanceName}
                    options={instanceList.split(', ')}
                    onChange={handleInstanceNameChange}
                    disabled={loadingButton === 'fetchInstanceLists'}
                />
                <InputBox
                    label="9. Primary의 엔드포인트"
                    placeholder="직접 입력"
                    value={primaryEndpoint}
                    onChange={(e) => setPrimaryEndpoint(e.target.value)}
                    height="100px"
                    onApiClick={() => handleApiButtonClick('fetchInstancePrimaryEndpoints', fetchInstanceEndpoints, instanceName)}
                    isLoading={loadingButton === 'fetchInstancePrimaryEndpoints'}
                    disableAll={!!loadingButton}
                    error={errors.primaryEndpoint}
                />
                <InputBox
                    label="10. Standby의 엔드포인트"
                    placeholder="직접 입력"
                    value={standbyEndpoint}
                    onChange={(e) => setStandbyEndpoint(e.target.value)}
                    height="100px"
                    onApiClick={() => handleApiButtonClick('fetchInstanceStandbyEndpoints', fetchInstanceEndpoints, instanceName)}
                    isLoading={loadingButton === 'fetchInstanceStandbyEndpoints'}
                    disableAll={!!loadingButton}
                    error={errors.standbyEndpoint}
                />
            </GroupContainer>
            <GroupContainer>
                <InputBox
                    label="11. Docker Image 이름"
                    placeholder="직접 입력"
                    value={dockerImageName}
                    onChange={(e) => setDockerImageName(e.target.value)}
                    error={errors.dockerImageName}
                />
                <InputBox
                    label="12. Docker Image Base Java Version"
                    placeholder="직접 입력"
                    value={dockerJavaVersion}
                    onChange={(e) => setDockerJavaVersion(e.target.value)}
                    error={errors.dockerJavaVersion}
                />
            </GroupContainer>
            <ButtonContainer>
                <StyledButton onClick={generateScript}>스크립트 생성 및 클립보드로 복사</StyledButton>
                <ValidateButton
                    formData={formData}
                    setErrors={setErrors}
                    clusterList={clusterList}
                />
            </ButtonContainer>
            <ScriptDisplay script={script} />
            <ButtonContainer>
            </ButtonContainer>
        </Container>
    );
};

export default MainPage;
