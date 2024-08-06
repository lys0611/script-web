import React, { useEffect, useState } from 'react';
import InputBox from '../components/InputBox';
import ScriptDisplay from '../components/ScriptDisplay';
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
    color: #ffe100;
    font-size: 1.2em;
    font-weight: normal;
`;

const Header = styled.h2`
    text-align: center;
    color: #3c1e1e;
    margin-bottom: 0.5em;
    font-size: 2em;
    font-weight: bold;
    color: #ffe100; /* 카카오 노란색 */
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
    justify-content: center;
    align-items: center;
    margin-top: 2em;
`;

const StyledButton = styled.button`
    background-color: #ffe100; /* 카카오 노란색 */
    color: black;
    border: none;
    padding: 0.75em 1.5em;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.1s ease-in;
    margin: 0 1em;

    &:hover {
        background-color: #FFEC4F;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 8px rgba(255, 205, 0, 0.6);
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
    const [accessKey, setAccessKey] = useState('669254168b57401f861e1b74840d528a');
    const [secretKey, setSecretKey] = useState('39c257278bd72d9f8416e92581fd2f21f58703ea8be18076b42fd70ef01dc29d5c8b05');
    const [email, setEmail] = useState('');
    const [projectName, setProjectName] = useState('kakaocloud-edu');
    const [clusterList, setClusterList] = useState<string[]>(['k8s-cluster']);
    const [clusterName, setClusterName] = useState('k8s-cluster');
    const [apiEndpoint, setApiEndpoint] = useState('https://2be0c952-d15f-465b-83c7-cfa96a9d4f2d-public.ke.kr-central-2.kakaocloud.com');
    const [authData, setAuthData] = useState('LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM2akNDQWRLZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRJME1ESXhOVEEyTXprek4xb1hEVE0wTURJeE1qQTJORFF6TjFvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTnVFCmllYUFZWnljY2Z4MzZXSG96eHo2R0RybjJKUVVVTUlrZHR0TUxONXRKVDlDS09MZEY4TTA0U0F4V25oS3p6V2wKTVMwYjQ1NEJESTFuYUxNc0hZYVU5Nno3N3ozeGZKNGxjSGVIMU1STTFjbjZMalNZV09ySnp1Q0hNZmMyamhtbQpuZmNjVm82M3p2d2dZR2xyOGN5Z0l4ZGVZRjlOWmNLRHNVVmFrWkFDWTFTZ0hDdmIvVzhtQ0lqZkRoWUJjTjJuCjlnclpFN1lWZUx6MWt4NUViN2hKNkRla3pkOUZITmdiMTNneHpJZE1DUmJEb2kxOWF4dThiQW1mMjNibWJpSEEKeEs2MjVISmQwK3pQTWprREh3U1gvbnN4UFUrNzQxTlNPMWxYTEs1bVE5NWlnaXhmbUpqUWlob0Vqdjl0cXNCKwppbzEvWUgzcVQyOGJzV2lmQ2tVQ0F3RUFBYU5GTUVNd0RnWURWUjBQQVFIL0JBUURBZ0trTUJJR0ExVWRFd0VBCi93UUlNQVlCQWY4Q0FRQXdIUVlEVlIwT0JCWUVGS0JtcWJoUG15SnJNeVRWa2tUQkwvcnVaZmVXTUEwR0NTcUcKU0liM0RRRUJDd1VBQTRJQkFRQ0k1bTZ1aVg0dmxEZ0I2L0RyMnlKSG8yaEd0MncvWkhYNURra3l4OHRqTXl6RQpEdW96L0kxYkVkR1VURW84MlJCWDlsZUpWZnpFU1JBcFdmdFE1N2oyUWdsVlM4bWd0S1hlWk5QTTR6bFBOWnE0CmxaelNUVTVGd2NiTUxMbitYdmVFYWxhZVFINEl3R1NTTHlsVmpzeUwyVyswL1Rsd3RJMis3YWtNM3BzdnVFT20KRVRZaXFEdEtCaWE3UlgvcWdURlptWTE5OUxJNXZkTWJkdXhMM1N6Mjhweld2d29nTkRrcmNIUnh4SXI0ZVZsdQo2blIxODZoc2o3MjJNRG9DYTBoTFU3U2xzREtZM3ZMWmVpbC9GajRHRGNOVkZqbFRLV3BVMk5NdG9yUGVWZ1hECkN6ZC83VmV4ZlgxcW1uWTY4N0w2SytIbDZPN0JuYlRxNjRVUG8wNEoKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=');
    const [instanceList, setInstanceList] = useState<string[]>(['database']);
    const [instanceName, setInstanceName] = useState('database');
    const [primaryEndpoint, setPrimaryEndpoint] = useState('az-a.database.ae90ddc1b6dc4b0581bb44b31f8921b5.mysql.managed-service.kr-central-2.kakaocloud.com');
    const [standbyEndpoint, setStandbyEndpoint] = useState('az-b.database.ae90ddc1b6dc4b0581bb44b31f8921b5.mysql.managed-service.kr-central-2.kakaocloud.com');
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
export DB_EP1=\$(echo -n "\$INPUT_DB_EP1" | base64 -w 0)
export DB_EP2=\$(echo -n "\$INPUT_DB_EP2" | base64 -w 0)
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

            setClusterList(['k8s-cluster', ...clusterNames]); // 배열에 고정된 값 추가

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
            setInstanceList(['database', ...instanceSetNames]);

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
        instanceList: instanceList.join(', '),
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
                />
                <InputBox
                    label="2. 사용자 액세스 보안 키"
                    placeholder="직접 입력"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                />
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
                />
            </GroupContainer>
            <GroupContainer>
                <SelectBox
                    label="8. 인스턴스 그룹 리스트"
                    value={instanceName}
                    options={instanceList}
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
                />
            </GroupContainer>
            <GroupContainer>
                <InputBox
                    label="11. Docker Image 이름"
                    placeholder="직접 입력"
                    value={dockerImageName}
                    onChange={(e) => setDockerImageName(e.target.value)}
                />
                <InputBox
                    label="12. Docker Image Base Java Version"
                    placeholder="직접 입력"
                    value={dockerJavaVersion}
                    onChange={(e) => setDockerJavaVersion(e.target.value)}
                />
            </GroupContainer>
            <ScriptDisplay script={script} />
            <ButtonContainer>
                <StyledButton onClick={generateScript}>스크립트 생성 및 복사</StyledButton>
            </ButtonContainer>
        </Container>
    );
};

export default MainPage;
