from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
import yaml
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCredentials(BaseModel):
    access_key_id: str
    access_key_secret: str

class ClusterCredentials(UserCredentials):
    cluster_name: str

class InstanceSetCredentials(UserCredentials):
    instance_set_name: str

def get_token_and_details(credentials: UserCredentials):
    url = "https://iam.kakaocloud.com/identity/v3/auth/tokens"
    payload = {
        "auth": {
            "identity": {
                "methods": ["application_credential"],
                "application_credential": {
                    "id": credentials.access_key_id,
                    "secret": credentials.access_key_secret,
                },
            }
        }
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    token = response.headers.get("X-Subject-Token")
    response_json = response.json()
    user_id = response_json.get("token", {}).get("user", {}).get("id", {})
    domain_id = (
        response_json.get("token", {}).get("user", {}).get("domain", {}).get("id")
    )
    domain_name = (
        response_json.get("token", {}).get("user", {}).get("domain", {}).get("name")
    )
    project_id = response_json.get("token", {}).get("project", {}).get("id")
    project_name = response_json.get("token", {}).get("project", {}).get("name")

    return {
        "token": token,
        "user_id": user_id,
        "domain_id": domain_id,
        "domain_name": domain_name,
        "project_id": project_id,
        "project_name": project_name,
    }


@app.post("/get-token-details")
def get_token_details(credentials: UserCredentials):
    return get_token_and_details(credentials)


@app.post("/get-clusters")
def get_clusters(credentials: UserCredentials):
    details = get_token_and_details(credentials)
    url = "https://d801c895-f7a2-4cae-9d6e-a4f7e68f1039.api.kr-central-2.kakaoi.io/api/v1/clusters"
    headers = {
        "Origin": "https://console.kakaocloud.com",
        "Referer": "https://console.kakaocloud.com",
        "X-Auth-token": details["token"],
        "X-Kep-Project-Domain-Id": details["domain_id"],
        "X-Kep-Project-Domain-Name": details["domain_name"],
        "X-Kep-Project-Id": details["project_id"],
        "X-Kep-Project-Name": details["project_name"],
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()
    
@app.post("/get-project-name")
def get_project_name(credentials: UserCredentials):
    details = get_token_and_details(credentials)
    return {"project_name": details["project_name"]}

@app.post("/get-kubeconfig")
def get_kubeconfig(credentials: ClusterCredentials):
    details = get_token_and_details(credentials)
    url = f"https://d801c895-f7a2-4cae-9d6e-a4f7e68f1039.api.kr-central-2.kakaoi.io/api/v1/clusters/{credentials.cluster_name}/kubeconfig"
    headers = {
        "Origin": "https://console.kakaocloud.com",
        "Referer": "https://console.kakaocloud.com",
        "X-Auth-token": details["token"],
        "X-Kep-Project-Domain-Id": details["domain_id"],
        "X-Kep-Project-Domain-Name": details["domain_name"],
        "X-Kep-Project-Id": details["project_id"],
        "X-Kep-Project-Name": details["project_name"],
    }
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    try:
        kubeconfig_yaml = response.text
        kubeconfig_json = yaml.safe_load(kubeconfig_yaml)
        return kubeconfig_json
    except yaml.YAMLError as e:
        raise HTTPException(status_code=500, detail="Error parsing YAML response")


@app.post("/get-instance-groups")
def get_instance_groups(credentials: UserCredentials):
    details = get_token_and_details(credentials)
    url = "https://231b3efe-0491-46d5-ba7f-5ec1679796e2.api.kr-central-2.kakaoi.io/instance-sets"
    headers = {
        "Origin": "https://console.kakaocloud.com",
        "Referer": "https://console.kakaocloud.com",
        "X-Auth-token": details["token"],
        "X-Kep-Project-Domain-Id": details["domain_id"],
        "X-Kep-Project-Domain-Name": details["domain_name"],
        "X-Kep-Project-Id": details["project_id"],
        "X-Kep-Project-Name": details["project_name"],
    }
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    instance_groups = response.json() 
    instance_set_names = [item["instanceSet"]["instanceSetName"] for item in instance_groups["instanceSetWithStatusList"]]
    return instance_set_names

@app.post("/get-instance-endpoints")
def get_instance_endpoints(credentials: InstanceSetCredentials):
    details = get_token_and_details(credentials)
    url = "https://231b3efe-0491-46d5-ba7f-5ec1679796e2.api.kr-central-2.kakaoi.io/instance-sets"
    headers = {
        "X-Auth-token": details["token"],
        "X-Kep-Project-Domain-Id": details["domain_id"],
        "X-Kep-Project-Domain-Name": details["domain_name"],
        "X-Kep-Project-Id": details["project_id"],
        "X-Kep-Project-Name": details["project_name"],
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    instance_set = next((item for item in data.get("instanceSetWithStatusList", []) if item["instanceSet"]["instanceSetName"] == credentials.instance_set_name), None)
    if instance_set is None:
        raise HTTPException(status_code=404, detail="Instance set not found")
    
    endpoints = instance_set.get("instanceSet", {}).get("endpoint", [])
    primary = endpoints[0] if endpoints else None
    standby = endpoints[1] if len(endpoints) > 1 else "없음"

    return {"primary_endpoint": primary, "standby_endpoint": standby}

@app.post("/get-projects")
def get_projects(credentials: UserCredentials):
    details = get_token_and_details(credentials)
    url = f"https://iam.kakaocloud.com/identity/v3/users/{details['user_id']}/projects"
    headers = {"X-Auth-token": details["token"]}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
