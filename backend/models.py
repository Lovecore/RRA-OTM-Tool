from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class MitigationState(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class MitigationDecision(str, Enum):
    ACCEPT = "ACCEPT"
    MITIGATE = "MITIGATE"
    TRANSFER = "TRANSFER"
    AVOID = "AVOID"

class Risk(BaseModel):
    confidentiality: Optional[int] = None
    integrity: Optional[int] = None
    availability: Optional[int] = None
    comment: Optional[str] = None

class Size(BaseModel):
    width: int
    height: int

class Repository(BaseModel):
    url: str
    branch: Optional[str] = None
    commit: Optional[str] = None

class Representation(BaseModel):
    name: str
    id: str
    type: str
    url: Optional[str] = None
    size: Optional[Size] = None
    repository: Optional[Repository] = None
    attributes: Optional[Dict[str, Any]] = {}

class Parent(BaseModel):
    trustZone: str

class DataFlow(BaseModel):
    name: str
    id: str
    source: str
    destination: str
    description: Optional[str] = None
    bidirectional: bool = False
    attributes: Optional[Dict[str, Any]] = {}

class Asset(BaseModel):
    name: str
    id: Optional[str] = None
    description: str
    risk: Optional[Risk] = None
    attributes: Optional[Dict[str, Any]] = {}

class MitigationStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    NOT_APPLICABLE = "Not Applicable"

class Mitigation(BaseModel):
    name: str
    description: str
    attributes: Optional[Dict[str, Any]] = {}

class Threat(BaseModel):
    name: str
    id: Optional[str] = None
    description: str
    categories: List[str] = []
    mitigation: Optional[Mitigation] = None
    attributes: Optional[Dict[str, Any]] = {}

class TrustZone(BaseModel):
    name: str
    id: str
    type: str
    description: str
    risk: Optional[Risk] = None
    attributes: Optional[Dict[str, Any]] = {}

class Component(BaseModel):
    name: str
    id: str
    description: str
    parent: Optional[Parent] = None
    component_link: Optional[str] = None
    representations: Optional[List[str]] = []
    threats: Optional[List[Threat]] = []
    assets: Optional[List[Asset]] = []
    attributes: Optional[Dict[str, Any]] = {}

class Project(BaseModel):
    name: str = ""
    id: str
    description: str = ""
    owner: str = ""
    ownerContact: str
    design_review_link: str = ""
    venrisk_ticket: str = ""
    threat_model_owner: str = ""
    attributes: Optional[Dict[str, Any]] = {}

class OTModel(BaseModel):
    otmVersion: str = "0.2.0"
    project: Project
    representations: List[Representation] = []
    assets: List[Asset] = []
    components: List[Component] = []
    dataflows: List[DataFlow] = []
    trustZones: List[TrustZone] = []
