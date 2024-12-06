from fastapi import FastAPI, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
import yaml
import os
import shutil
from models import (
    OTModel, Project, Component, Asset, 
    Representation, DataFlow, Threat, 
    Mitigation, Size
)
from typing import List, Optional
import uuid
import json
from pathlib import Path
import atexit
from enum import Enum
from pydantic import BaseModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Threat Model Notes API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Create a state file to persist data
STATE_FILE = "otm_state.json"

def load_state():
    if Path(STATE_FILE).exists():
        try:
            with open(STATE_FILE, 'r') as f:
                state_dict = json.load(f)
                return OTModel(**state_dict)
        except Exception as e:
            print(f"Error loading state: {e}")
    return OTModel(
        project=Project(
            name="New Project",
            id="default-project",
            description="Default project description",
            owner="Default Owner",
            ownerContact="owner@example.com"
        ),
        assets=[],
        components=[],
        representations=[],
        dataflows=[],
        trustZones=[]
    )

def save_state():
    try:
        state_dict = otm_model.model_dump(exclude_none=True)
        with open(STATE_FILE, 'w') as f:
            json.dump(state_dict, f, indent=2)
    except Exception as e:
        print(f"Error saving state: {e}")

# Load initial state
otm_model = load_state()

# Register save_state to run on exit
atexit.register(save_state)

def enum_to_str(data):
    if isinstance(data, dict):
        return {key: enum_to_str(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [enum_to_str(item) for item in data]
    elif isinstance(data, Enum):
        return str(data.value)
    return data

@app.get("/")
async def read_root():
    return {"message": "Welcome to Threat Model Notes API"}

@app.get("/model")
async def get_model():
    return otm_model

@app.post("/project")
async def update_project(project: Project):
    otm_model.project = project
    return project

@app.post("/components")
async def add_component(component: Component):
    if not component.id:
        component.id = str(uuid.uuid4())
    
    # Initialize lists
    component.assets = component.assets or []
    component.threats = component.threats or []
    component.representations = component.representations or []
    
    # Update or add component
    existing_idx = next((i for i, c in enumerate(otm_model.components) if c.id == component.id), None)
    if existing_idx is not None:
        otm_model.components[existing_idx] = component
    else:
        otm_model.components.append(component)
    
    print(f"Debug - Component added/updated: {component.model_dump()}")
    print(f"Total components: {len(otm_model.components)}")
    save_state()
    return component

@app.get("/components")
async def get_components():
    return otm_model.components

@app.post("/assets")
async def add_asset(asset: Asset):
    if not asset.id:
        asset.id = str(uuid.uuid4())
    
    # Update or add asset
    existing_idx = next((i for i, a in enumerate(otm_model.assets) if a.id == asset.id), None)
    if existing_idx is not None:
        otm_model.assets[existing_idx] = asset
    else:
        otm_model.assets.append(asset)
    
    print(f"Debug - Asset added/updated: {asset.model_dump()}")
    print(f"Total assets: {len(otm_model.assets)}")
    save_state()
    return asset

@app.get("/assets")
async def get_assets():
    return otm_model.assets

class DiagramRequest(BaseModel):
    name: str
    url: str
    description: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Architecture Diagram",
                "url": "https://example.com/diagram.png",
                "description": "Optional description"
            }
        }

@app.post("/diagrams")
async def add_diagram(diagram: DiagramRequest):
    try:
        logger.info(f"Received diagram request: {diagram}")
        
        # Create a new representation for the diagram
        representation = Representation(
            id=str(uuid.uuid4()),
            name=diagram.name,
            type="diagram",
            url=diagram.url,
            attributes={"description": diagram.description} if diagram.description else {}
        )

        otm_model.representations.append(representation)
        save_state()
        return representation
    except Exception as e:
        logger.error(f"Error adding diagram: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/diagrams/{diagram_id}")
async def get_diagram(diagram_id: str):
    representation = next(
        (r for r in otm_model.representations if r.id == diagram_id),
        None
    )
    if not representation:
        raise HTTPException(status_code=404, detail="Diagram not found")

    return representation

@app.get("/diagrams")
async def get_diagrams():
    return [r for r in otm_model.representations if r.type == "diagram"]

@app.post("/components/{component_id}/threats")
async def add_threat_to_component(component_id: str, threat: Threat):
    print(f"Adding threat to component {component_id}: {threat.model_dump()}")
    
    component = next((c for c in otm_model.components if c.id == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    if not threat.id:
        threat.id = str(uuid.uuid4())
    
    # Initialize lists
    component.threats = component.threats or []
    
    # Update or add threat
    existing_idx = next((i for i, t in enumerate(component.threats) if t.id == threat.id), None)
    if existing_idx is not None:
        component.threats[existing_idx] = threat
    else:
        component.threats.append(threat)
    
    print(f"Component {component.name} now has {len(component.threats)} threats")
    save_state()
    return component

@app.post("/components/{component_id}/assets/{asset_id}")
async def add_asset_to_component(component_id: str, asset_id: str):
    print(f"Adding asset {asset_id} to component {component_id}")
    
    component = next((c for c in otm_model.components if c.id == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    asset = next((a for a in otm_model.assets if a.id == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Initialize lists
    component.assets = component.assets or []
    
    # Add asset if not already present
    if asset not in component.assets:
        component.assets.append(asset)
        print(f"Added asset {asset.name} to component {component.name}")
    
    save_state()
    return component

@app.delete("/components/{component_id}")
async def delete_component(component_id: str):
    print(f"Deleting component {component_id}")
    otm_model.components = [c for c in otm_model.components if c.id != component_id]
    save_state()
    return {"message": "Component deleted"}

@app.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str):
    print(f"Deleting asset {asset_id}")
    # Remove from global assets list
    otm_model.assets = [a for a in otm_model.assets if a.id != asset_id]
    # Remove from all components
    for component in otm_model.components:
        if component.assets:
            component.assets = [a for a in component.assets if a.id != asset_id]
    save_state()
    return {"message": "Asset deleted"}

@app.delete("/components/{component_id}/threats/{threat_id}")
async def delete_threat(component_id: str, threat_id: str):
    print(f"Deleting threat {threat_id} from component {component_id}")
    component = next((c for c in otm_model.components if c.id == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    if component.threats:
        component.threats = [t for t in component.threats if t.id != threat_id]
    save_state()
    return {"message": "Threat deleted"}

@app.delete("/components/{component_id}/threats/{threat_id}/mitigation")
async def delete_mitigation(component_id: str, threat_id: str):
    print(f"Deleting mitigation from threat {threat_id} in component {component_id}")
    component = next((c for c in otm_model.components if c.id == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    threat = next((t for t in component.threats if t.id == threat_id), None)
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    threat.mitigation = None
    save_state()
    return {"message": "Mitigation deleted"}

@app.post("/import/yaml")
async def import_yaml(file: UploadFile = File(...)):
    try:
        print(f"\nReceived file: {file.filename}")
        contents = await file.read()
        contents_str = contents.decode('utf-8')
        print(f"File contents length: {len(contents_str)}")
        
        try:
            yaml_content = yaml.safe_load(contents_str)
            if not isinstance(yaml_content, dict):
                raise ValueError("Invalid YAML format: root must be a dictionary")
            print(f"Parsed YAML keys: {yaml_content.keys()}")
            
            # Validate required fields
            required_fields = ['otmVersion', 'project']
            missing_fields = [field for field in required_fields if field not in yaml_content]
            if missing_fields:
                raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
            # Create an asset lookup dictionary
            asset_lookup = {}
            if 'assets' in yaml_content:
                print(f"Processing {len(yaml_content['assets'])} assets...")
                for asset in yaml_content['assets']:
                    if 'id' not in asset:
                        print(f"Warning: Asset missing ID: {asset.get('name', 'unknown')}")
                        continue
                    asset_lookup[asset['id']] = asset
                print(f"Asset lookup created with {len(asset_lookup)} assets")

            # Process components to replace asset IDs with full asset objects
            if 'components' in yaml_content:
                print(f"Processing {len(yaml_content['components'])} components...")
                for component in yaml_content['components']:
                    if 'assets' in component and isinstance(component['assets'], list):
                        component_assets = []
                        print(f"Processing assets for component {component.get('name', 'unknown')}")
                        for asset_id in component['assets']:
                            print(f"Looking up asset ID: {asset_id}")
                            if asset_id in asset_lookup:
                                component_assets.append(asset_lookup[asset_id])
                            else:
                                print(f"Warning: Asset ID not found: {asset_id}")
                        component['assets'] = component_assets
                        print(f"Replaced {len(component_assets)} assets in component")

            print("Creating OTModel from processed YAML...")
            imported_model = OTModel(**yaml_content)
            
            # Update global model
            print("Updating global model...")
            global otm_model
            otm_model = imported_model
            
            # Save to file
            print("Saving state...")
            save_state()
            
            print("Import completed successfully")
            return {"message": "Model imported successfully"}
            
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML syntax: {str(e)}")
            
    except Exception as e:
        print(f"Error importing YAML: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/export/yaml")
async def export_yaml():
    print("\nExporting model state:")
    print(f"Components: {len(otm_model.components)}")
    print(f"Assets: {len(otm_model.assets)}")
    for comp in otm_model.components:
        print(f"Component {comp.name}:")
        print(f"  Assets: {[a.name for a in comp.assets]}")
        print(f"  Threats: {[t.name for t in comp.threats]}")
    
    # Create a deep copy and convert enums to strings
    model_dict = otm_model.model_dump(exclude_none=True, by_alias=True)
    model_dict = enum_to_str(model_dict)
    
    # Process components
    for component in model_dict.get("components", []):
        # Convert asset objects to references
        if component.get("assets"):
            component["assets"] = [
                asset["id"] if isinstance(asset, dict) else asset.id
                for asset in component["assets"]
            ]
        
        # Process threats
        if component.get("threats"):
            for threat in component["threats"]:
                if isinstance(threat, dict):
                    # Ensure required fields
                    if "categories" not in threat:
                        threat["categories"] = []
                    # Handle mitigation
                    if "mitigation" in threat and threat["mitigation"]:
                        threat["mitigation"] = {
                            "name": threat["mitigation"].get("name", ""),
                            "description": threat["mitigation"].get("description", ""),
                            "status": threat["mitigation"].get("status", "Not Started")
                        }
    
    yaml_content = yaml.dump(model_dict, sort_keys=False, allow_unicode=True, default_flow_style=False)
    print("\nGenerated YAML content:", yaml_content)
    return StreamingResponse(
        iter([yaml_content]),
        media_type="application/x-yaml",
        headers={"Content-Disposition": "attachment; filename=threat-model.yaml"}
    )

@app.post("/reset")
async def reset_model():
    try:
        global otm_model
        # Create a new empty model with default values
        otm_model = OTModel(
            otmVersion="0.2.0",
            project=Project(
                name="New Project",
                id="new-project",
                description="",
                owner="",
                ownerContact="",
                attributes={}
            ),
            representations=[],
            assets=[],
            components=[],
            dataflows=[],
            trustZones=[]
        )
        save_state()
        return {"message": "Model reset successfully"}
    except Exception as e:
        print(f"Error resetting model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error resetting model: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
